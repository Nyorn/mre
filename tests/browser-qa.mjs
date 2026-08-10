/*
 * Browser-level QA for the home page, driven over the Chrome DevTools Protocol.
 *
 * This project has no Playwright/Puppeteer and no jsdom, so rather than assert
 * things about a browser we cannot run, this drives a real headless Chrome with
 * Node's built-in WebSocket (Node >= 22) and reads *computed* styles and real
 * geometry. That is the only way to check the things that actually broke:
 * Tailwind winning the cascade over a CTA background, a hero that renders far
 * taller than intended, and horizontal overflow at 320px.
 *
 * It is NOT part of `npm test`: it needs Chrome and a running dev server, so it
 * stays a separate, reproducible command.
 *
 *   Terminal 1:  CONTEXT=deploy-preview npx vite dev --port 5173
 *   Terminal 2:  node tests/browser-qa.mjs --base http://localhost:5173
 *
 * Exit code is non-zero when any check fails, so CI can adopt it later.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BASE = argValue('--base', 'http://localhost:5173').replace(/\/$/, '');
const PORT = Number(argValue('--cdp-port', '9333'));
const ONLY = argValue('--only', '');

const CHROME_CANDIDATES = [
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
	'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
	'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
];

const THEMES = ['quiet', 'mediterranean', 'atlas'];
const COPIES = ['scenario', 'evidence', 'compare'];
const WIDTHS = [320, 390, 768, 1024, 1440];

/* AA thresholds. Large text is >=24px, or >=18.66px bold. */
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

const results = [];
const record = (ok, scope, message) => {
	results.push({ ok, scope, message });
	if (!ok) console.log(`  FAIL  [${scope}] ${message}`);
};

/* ------------------------------------------------------------------ CDP --- */

let nextId = 1;
function rpc(ws, method, params = {}, sessionId) {
	const id = nextId++;
	return new Promise((resolve, reject) => {
		const onMessage = (event) => {
			let msg;
			try {
				msg = JSON.parse(event.data);
			} catch {
				return;
			}
			if (msg.id !== id) return;
			ws.removeEventListener('message', onMessage);
			if (msg.error) reject(new Error(`${method}: ${msg.error.message}`));
			else resolve(msg.result);
		};
		ws.addEventListener('message', onMessage);
		ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
	});
}

async function evaluate(ws, expression) {
	const result = await rpc(ws, 'Runtime.evaluate', {
		expression,
		returnByValue: true,
		awaitPromise: true
	});
	if (result.exceptionDetails) {
		throw new Error(result.exceptionDetails.exception?.description || 'evaluate failed');
	}
	return result.result.value;
}

async function navigate(ws, url) {
	await rpc(ws, 'Page.navigate', { url });
	// Poll for readiness instead of racing lifecycle events.
	for (let i = 0; i < 120; i++) {
		await new Promise((r) => setTimeout(r, 100));
		const state = await evaluate(ws, 'document.readyState');
		if (state === 'complete') break;
	}
	// Let hydration and the dynamically imported comparer settle.
	await new Promise((r) => setTimeout(r, 450));
}

async function setViewport(ws, width, height = 900) {
	await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: 1,
		mobile: width < 768
	});
}

/* ------------------------------------------------- in-page helper source --- */

/*
 * Injected into the page. Kept as one string so it can be evaluated verbatim;
 * everything it returns is plain JSON.
 */
const HELPERS = `
(() => {
  if (window.__qa) return;
  const srgb = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
  const parse = (value) => {
    const m = String(value).match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const parts = m[1].split(',').map((n) => parseFloat(n));
    return { rgb: parts.slice(0, 3), a: parts.length > 3 ? parts[3] : 1 };
  };
  const effectiveBg = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0.99) return bg.rgb;
      node = node.parentElement;
    }
    const body = parse(getComputedStyle(document.body).backgroundColor);
    return body && body.a > 0.99 ? body.rgb : [255, 255, 255];
  };
  window.__qa = {
    contrast(el) {
      const cs = getComputedStyle(el);
      const fg = parse(cs.color);
      if (!fg) return null;
      const bg = effectiveBg(el);
      const l1 = lum(fg.rgb), l2 = lum(bg);
      const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
      return {
        ratio: (hi + 0.05) / (lo + 0.05),
        fontSize: parseFloat(cs.fontSize),
        fontWeight: cs.fontWeight,
        bg: getComputedStyle(el).backgroundColor,
        color: cs.color
      };
    },
    box(el) {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, top: r.top, bottom: r.bottom };
    },
    lines(el) {
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      return Math.round(el.getBoundingClientRect().height / lh);
    }
  };
})();
`;

/* --------------------------------------------------------------- checks --- */

async function checkOverflow(ws, width, label) {
	const data = await evaluate(
		ws,
		`(() => {
      const de = document.documentElement;
      const offenders = [];
      const limit = de.clientWidth;
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if (r.right > limit + 1 || r.left < -1) {
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || '')).slice(0, 60),
            left: Math.round(r.left), right: Math.round(r.right)
          });
        }
      });
      return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, offenders: offenders.slice(0, 6) };
    })()`
	);

	record(
		data.scrollWidth === data.clientWidth,
		label,
		`scrollWidth ${data.scrollWidth} !== clientWidth ${data.clientWidth}` +
			(data.offenders.length ? ` | first offenders: ${JSON.stringify(data.offenders)}` : '')
	);
	return data;
}

async function checkCtaBackgrounds(ws, label) {
	const data = await evaluate(
		ws,
		`${HELPERS}
    (() => {
      const out = [];
      document.querySelectorAll('.qc-cta').forEach((el) => {
        const c = window.__qa.contrast(el);
        out.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 28),
          primary: el.classList.contains('qc-cta-primary'),
          ratio: c ? c.ratio : null,
          bg: c ? c.bg : null,
          color: c ? c.color : null,
          fontSize: c ? c.fontSize : null,
          fontWeight: c ? c.fontWeight : null,
          h: Math.round(el.getBoundingClientRect().height),
          w: Math.round(el.getBoundingClientRect().width)
        });
      });
      return out;
    })()`
	);

	for (const cta of data) {
		const large = cta.fontSize >= 24 || (cta.fontSize >= 18.66 && Number(cta.fontWeight) >= 700);
		const min = large ? AA_LARGE : AA_NORMAL;

		record(
			cta.ratio !== null && cta.ratio >= min,
			label,
			`CTA <${cta.tag}> "${cta.text}" contrast ${cta.ratio?.toFixed(2)} < ${min} (bg ${cta.bg}, color ${cta.color})`
		);

		if (cta.primary) {
			const transparent = /rgba\(0, 0, 0, 0\)|transparent/.test(cta.bg || '');
			record(
				!transparent,
				label,
				`primary CTA <${cta.tag}> "${cta.text}" has no painted background (${cta.bg}) — cascade lost`
			);
		}

		record(cta.h >= 44, label, `CTA "${cta.text}" is ${cta.h}px tall, below the 44px target`);
	}
	return data;
}

async function checkHero(ws, width, label) {
	const data = await evaluate(
		ws,
		`${HELPERS}
    (() => {
      const hero = document.querySelector('.hero');
      const h1 = document.querySelector('h1');
      const copy = document.querySelector('.hero-copy');
      if (!hero || !h1) return null;
      return {
        heroH: Math.round(window.__qa.box(hero).h),
        h1Lines: window.__qa.lines(h1),
        h1H: Math.round(window.__qa.box(h1).h),
        copyH: Math.round(window.__qa.box(copy).h),
        h1Count: document.querySelectorAll('h1').length
      };
    })()`
	);

	if (!data) {
		record(false, label, 'hero or h1 not found');
		return null;
	}

	record(data.h1Count === 1, label, `page declares ${data.h1Count} h1 elements`);

	if (width >= 1024) {
		record(data.h1Lines <= 3, label, `desktop H1 wraps to ${data.h1Lines} lines (max 3)`);
		record(data.heroH < 800, label, `desktop hero is ${data.heroH}px tall (must stay well under 1000)`);
	}
	return data;
}

async function checkSkipLinkAndLandmarks(ws, label) {
	const data = await evaluate(
		ws,
		`(() => {
      const skip = document.querySelector('.qc-skip-link');
      const main = document.querySelector('main');
      return {
        hasSkip: !!skip,
        skipHref: skip ? skip.getAttribute('href') : null,
        mainId: main ? main.id : null,
        mainCount: document.querySelectorAll('main').length
      };
    })()`
	);

	record(data.hasSkip, label, 'skip link missing');
	record(data.skipHref === '#main', label, `skip link points at ${data.skipHref}`);
	record(data.mainId === 'main', label, `main id is ${data.mainId}`);
	record(data.mainCount === 1, label, `${data.mainCount} main landmarks`);
	return data;
}

async function checkDialog(ws, label) {
	/* Opens the lead modal from the hero CTA and inspects the real dialog. */
	const opened = await evaluate(
		ws,
		`(() => {
      const cta = [...document.querySelectorAll('button.qc-cta')].find((b) => /Подобрать/.test(b.textContent));
      if (!cta) return { ok: false, why: 'hero CTA not found' };
      cta.setAttribute('data-qa-opener', '1');
      // A real pointer click focuses the button first; el.click() alone does
      // not, and without this the focus-return check tests the harness rather
      // than the dialog.
      cta.focus();
      cta.click();
      return { ok: true };
    })()`
	);
	if (!opened.ok) {
		record(false, label, `dialog: ${opened.why}`);
		return;
	}
	await new Promise((r) => setTimeout(r, 350));

	const data = await evaluate(
		ws,
		`(() => {
      const dlg = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dlg) return { found: false };
      const focusables = [...dlg.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => el.offsetParent !== null);
      const closeBtn = [...dlg.querySelectorAll('button')].find((b) => /close|закры/i.test(b.getAttribute('aria-label') || b.textContent || ''));
      const closeRect = closeBtn ? closeBtn.getBoundingClientRect() : null;
      const bg = document.querySelector('.qc-home');
      return {
        found: true,
        name: dlg.getAttribute('aria-label') || (dlg.getAttribute('aria-labelledby') ? (document.getElementById(dlg.getAttribute('aria-labelledby'))||{}).textContent : null),
        activeInside: dlg.contains(document.activeElement),
        activeTag: document.activeElement ? document.activeElement.tagName.toLowerCase() : null,
        focusableCount: focusables.length,
        closeIsButton: !!closeBtn,
        closeW: closeRect ? Math.round(closeRect.width) : 0,
        closeH: closeRect ? Math.round(closeRect.height) : 0,
        bgInert: bg ? (bg.hasAttribute('inert') || bg.getAttribute('aria-hidden') === 'true') : null
      };
    })()`
	);

	if (!data.found) {
		record(false, label, 'dialog: no [role=dialog][aria-modal=true] after opening the lead form');
		return;
	}

	record(!!data.name && data.name.trim().length > 0, label, 'dialog has no accessible name');
	record(data.activeInside, label, `dialog did not take initial focus (active: ${data.activeTag})`);
	record(data.closeIsButton, label, 'dialog close control is not a <button> with a handler');
	record(
		data.closeW >= 44 && data.closeH >= 44,
		label,
		`dialog close target is ${data.closeW}x${data.closeH}, below 44x44`
	);
	record(data.bgInert === true, label, 'background is not inert/aria-hidden while the dialog is open');

	/* Escape closes and focus returns to the opener. */
	await rpc(ws, 'Input.dispatchKeyEvent', {
		type: 'keyDown',
		key: 'Escape',
		code: 'Escape',
		windowsVirtualKeyCode: 27
	});
	await rpc(ws, 'Input.dispatchKeyEvent', {
		type: 'keyUp',
		key: 'Escape',
		code: 'Escape',
		windowsVirtualKeyCode: 27
	});
	await new Promise((r) => setTimeout(r, 300));

	const after = await evaluate(
		ws,
		`(() => ({
      stillOpen: !!document.querySelector('[role="dialog"][aria-modal="true"]'),
      focusOnOpener: document.activeElement === document.querySelector('[data-qa-opener]')
    }))()`
	);
	record(!after.stillOpen, label, 'Escape did not close the dialog');
	record(after.focusOnOpener, label, 'focus did not return to the opener after close');
}

async function checkLeadForm(ws, label) {
	/* Opens the lead dialog and inspects the form surface and error semantics. */
	const opened = await evaluate(
		ws,
		`(() => {
      const cta = [...document.querySelectorAll('button.qc-cta')].find((b) => /Подобрать/.test(b.textContent));
      if (!cta) return false;
      cta.focus(); cta.click();
      return true;
    })()`
	);
	if (!opened) {
		record(false, label, 'form: hero CTA not found');
		return;
	}
	await new Promise((r) => setTimeout(r, 350));

	const initial = await evaluate(
		ws,
		`${HELPERS}
    (() => {
      const form = document.querySelector('.feedback-form');
      if (!form) return null;
      const visibleErrors = [...form.querySelectorAll('.error-message')]
        .filter((el) => getComputedStyle(el).visibility !== 'hidden' && el.textContent.trim())
        .map((el) => el.textContent.trim());
      const name = form.querySelector('#name');
      const submit = form.querySelector('.submit-button');
      const cs = (el) => window.__qa.contrast(el);
      return {
        visibleErrors,
        nameInvalid: name ? name.getAttribute('aria-invalid') : null,
        nameDescribed: name ? name.getAttribute('aria-describedby') : null,
        nameH: name ? Math.round(name.getBoundingClientRect().height) : 0,
        formBg: getComputedStyle(form).backgroundColor,
        submit: submit ? { c: cs(submit), h: Math.round(submit.getBoundingClientRect().height) } : null,
        label: cs(form.querySelector('label[for="name"]')),
        input: cs(name)
      };
    })()`
	);

	if (!initial) {
		record(false, label, 'form: .feedback-form not found in the dialog');
		return;
	}

	record(initial.visibleErrors.length === 0, label,
		`form shows errors before any interaction: ${JSON.stringify(initial.visibleErrors)}`);
	record(initial.nameInvalid === 'false', label,
		`untouched field reports aria-invalid=${initial.nameInvalid}`);
	record(!initial.nameDescribed, label,
		`untouched field points at an error via aria-describedby=${initial.nameDescribed}`);
	record(initial.nameH >= 44, label, `input is ${initial.nameH}px tall, below the 44px target`);
	record(!/rgba\(0, 0, 0, 0\)/.test(initial.formBg), label, 'form has no painted surface');
	record(initial.label && initial.label.ratio >= AA_NORMAL, label,
		`form label contrast ${initial.label?.ratio?.toFixed(2)} < ${AA_NORMAL}`);
	record(initial.input && initial.input.ratio >= AA_NORMAL, label,
		`form input text contrast ${initial.input?.ratio?.toFixed(2)} < ${AA_NORMAL}`);
	record(initial.submit && initial.submit.c.ratio >= AA_NORMAL, label,
		`submit contrast ${initial.submit?.c?.ratio?.toFixed(2)} < ${AA_NORMAL} (bg ${initial.submit?.c?.bg})`);
	record(initial.submit && initial.submit.h >= 44, label,
		`submit is ${initial.submit?.h}px tall, below the 44px target`);

	/* Blur an empty required field: the error must now appear and be wired up. */
	const afterTouch = await evaluate(
		ws,
		`${HELPERS}
    (() => {
      const name = document.querySelector('#name');
      name.focus(); name.blur();
      return new Promise((resolve) => setTimeout(() => {
        const err = document.querySelector('#name-error');
        const visible = err && getComputedStyle(err).visibility !== 'hidden' && err.textContent.trim();
        resolve({
          visible: !!visible,
          text: err ? err.textContent.trim() : '',
          invalid: name.getAttribute('aria-invalid'),
          described: name.getAttribute('aria-describedby'),
          errContrast: err ? window.__qa.contrast(err) : null
        });
      }, 120));
    })()`
	);

	record(afterTouch.visible, label, 'no error appeared after leaving an empty required field');
	record(afterTouch.invalid === 'true', label, `aria-invalid is ${afterTouch.invalid} after touch`);
	record(afterTouch.described === 'name-error', label,
		`aria-describedby is ${afterTouch.described} after touch`);
	record(afterTouch.errContrast && afterTouch.errContrast.ratio >= AA_NORMAL, label,
		`error text contrast ${afterTouch.errContrast?.ratio?.toFixed(2)} < ${AA_NORMAL}`);

	await rpc(ws, 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
	await rpc(ws, 'Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
	await new Promise((r) => setTimeout(r, 250));
}

async function checkComparerInert(ws, label) {
	const data = await evaluate(
		ws,
		`(() => {
      const bar = document.querySelector('.pc-bar');
      if (!bar) return { present: false };
      const trigger = bar.querySelector('button');
      trigger.click();
      return { present: true };
    })()`
	);
	if (!data.present) return; // production build: nothing to check

	await new Promise((r) => setTimeout(r, 300));
	const state = await evaluate(
		ws,
		`(() => {
      const dlg = document.querySelector('.pc-dialog');
      const inert = (el) => !!el && (el.hasAttribute('inert') || el.getAttribute('aria-hidden') === 'true');
      const main = document.querySelector('.qc-home main');
      const header = document.querySelector('.qc-home header');
      const bar = document.querySelector('.pc-bar');
      return {
        open: !!dlg,
        // The page content must be inert, but the bar holding the trigger must
        // not be, or the switcher disables its own control.
        contentInert: inert(main) && inert(header),
        barInert: inert(bar),
        activeInside: dlg ? dlg.contains(document.activeElement) : false
      };
    })()`
	);
	record(state.open, label, 'comparer dialog did not open');
	record(state.contentInert === true, label, 'comparer background is not inert for assistive tech');
	record(state.barInert === false, label, 'the comparer bar inerted itself along with the page');
	record(state.activeInside, label, 'comparer dialog did not take initial focus');

	await rpc(ws, 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
	await rpc(ws, 'Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
	await new Promise((r) => setTimeout(r, 250));
}

async function measureHeroSlot(ws) {
	return evaluate(
		ws,
		`(() => {
      const copy = document.querySelector('.hero-copy');
      const h1 = document.querySelector('h1');
      const lead = document.querySelector('.hero-lead');
      if (!copy) return null;
      const r = (el) => (el ? Math.round(el.getBoundingClientRect().height) : 0);
      return { copy: r(copy), h1: r(h1), lead: r(lead) };
    })()`
	);
}

/* ----------------------------------------------------------------- main --- */

async function main() {
	const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
	if (!chrome) {
		console.error('No Chrome or Edge found. Checked:\n  ' + CHROME_CANDIDATES.join('\n  '));
		process.exit(2);
	}

	const profile = mkdtempSync(path.join(tmpdir(), 'sea-qa-'));
	const proc = spawn(
		chrome,
		[
			'--headless=new',
			`--remote-debugging-port=${PORT}`,
			`--user-data-dir=${profile}`,
			'--no-first-run',
			'--no-default-browser-check',
			'--disable-extensions',
			'--hide-scrollbars',
			'about:blank'
		],
		{ stdio: 'ignore' }
	);

	let ws;
	try {
		let target;
		for (let i = 0; i < 60; i++) {
			await new Promise((r) => setTimeout(r, 250));
			try {
				const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
				const list = await res.json();
				target = list.find((t) => t.type === 'page');
				if (target) break;
			} catch {
				/* not up yet */
			}
		}
		if (!target) throw new Error('Chrome did not expose a debugging target');

		ws = new WebSocket(target.webSocketDebuggerUrl);
		await new Promise((resolve, reject) => {
			ws.addEventListener('open', resolve, { once: true });
			ws.addEventListener('error', () => reject(new Error('CDP socket failed')), { once: true });
		});

		await rpc(ws, 'Page.enable');
		await rpc(ws, 'Runtime.enable');
		/*
		 * Without this, a headless page is never "focused", so Chrome dispatches
		 * no focus/blur events at all: el.focus() moves activeElement but a blur
		 * listener never fires. Any check of touched-state validation or of focus
		 * return would then be testing the harness, not the page.
		 */
		await rpc(ws, 'Emulation.setFocusEmulationEnabled', { enabled: true });

		console.log(`Base: ${BASE}`);
		console.log(`Chrome: ${chrome}\n`);

		const heroSlots = {};

		for (const theme of THEMES) {
			for (const copy of COPIES) {
				if (ONLY && `${theme}/${copy}` !== ONLY) continue;
				const url = `${BASE}/?preview_theme=${theme}&preview_copy=${copy}`;

				for (const width of WIDTHS) {
					const label = `${theme}/${copy}@${width}`;
					await setViewport(ws, width);
					await navigate(ws, url);

					await checkOverflow(ws, width, label);
					await checkCtaBackgrounds(ws, label);
					await checkHero(ws, width, label);
					if (width === 320) await checkSkipLinkAndLandmarks(ws, label);

					const slot = await measureHeroSlot(ws);
					if (slot) {
						heroSlots[width] = heroSlots[width] || [];
						heroSlots[width].push({ label, ...slot });
					}
				}
			}
		}

		/* Dialogs once per breakpoint rather than 45 times. */
		for (const width of [390, 1440]) {
			const label = `dialog@${width}`;
			await setViewport(ws, width);
			await navigate(ws, `${BASE}/`);
			await checkDialog(ws, label);
			await navigate(ws, `${BASE}/`);
			await checkLeadForm(ws, `form@${width}`);
			await navigate(ws, `${BASE}/`);
			await checkComparerInert(ws, `comparer-${label}`);
		}

		console.log('\n--- hero copy slot heights (for the reservation) ---');
		for (const width of Object.keys(heroSlots)) {
			const rows = heroSlots[width];
			const max = rows.reduce((a, b) => (b.copy > a.copy ? b : a));
			const min = rows.reduce((a, b) => (b.copy < a.copy ? b : a));
			console.log(
				`  ${width}px: copy ${min.copy}..${max.copy} (spread ${max.copy - min.copy}) ` +
					`| tallest ${max.label} h1=${max.h1} lead=${max.lead}`
			);
			record(
				max.copy - min.copy === 0,
				`reserve@${width}`,
				`hero copy slot varies by ${max.copy - min.copy}px across variants — switching copy will move the page`
			);
		}
	} finally {
		try {
			ws?.close();
		} catch {
			/* ignore */
		}
		proc.kill();
		try {
			rmSync(profile, { recursive: true, force: true });
		} catch {
			/* the profile dir sometimes lingers on Windows */
		}
	}

	const failed = results.filter((r) => !r.ok);
	console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
	if (failed.length) {
		const byScope = {};
		for (const f of failed) byScope[f.scope] = (byScope[f.scope] || 0) + 1;
		console.log('failing scopes:', JSON.stringify(byScope, null, 0));
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(2);
});
