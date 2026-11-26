<script>
	// Netlify Forms: the static HTML contains the form, Netlify picks it up at deploy.
	let { subject = 'Общий вопрос' } = $props();
	let status = $state('idle'); // idle | sending | done | error

	async function submit(e) {
		e.preventDefault();
		const form = e.currentTarget;
		status = 'sending';
		try {
			const body = new URLSearchParams(new FormData(form)).toString();
			const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
			if (!r.ok) throw new Error(String(r.status));
			status = 'done';
			form.reset();
		} catch {
			status = 'error';
		}
	}
</script>

{#if status === 'done'}
	<p class="done" role="status">Спасибо. Ответим в течение рабочего дня — туда, куда вам удобно.</p>
{:else}
	<form name="lead" method="POST" data-netlify="true" netlify-honeypot="company" onsubmit={submit}>
		<input type="hidden" name="form-name" value="lead" />
		<input type="hidden" name="subject" value={subject} />
		<p class="visually-hidden"><label>Не заполняйте: <input name="company" tabindex="-1" autocomplete="off" /></label></p>
		<label>
			<span>Имя</span>
			<input name="name" required autocomplete="name" />
		</label>
		<label>
			<span>Телефон, WhatsApp или Telegram</span>
			<input name="contact" required autocomplete="tel" />
		</label>
		<label class="wide">
			<span>Вопрос (необязательно)</span>
			<textarea name="message" rows="3"></textarea>
		</label>
		<button class="cta" type="submit" disabled={status === 'sending'}>
			<span>{status === 'sending' ? 'Отправляем…' : 'Отправить'}</span><span class="arr">→</span>
		</button>
		{#if status === 'error'}<p class="err" role="alert">Не отправилось. Попробуйте ещё раз или напишите нам напрямую.</p>{/if}
	</form>
{/if}

<style>
	form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	label {
		display: grid;
		gap: 6px;
		font-size: 13px;
		color: var(--muted);
	}
	.wide {
		grid-column: 1 / -1;
	}
	input,
	textarea {
		background: transparent;
		border: 0;
		border-bottom: 1px solid var(--line);
		padding: 10px 0;
		font-size: 17px;
		color: var(--ink);
		border-radius: 0;
		resize: vertical;
	}
	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--accent);
	}
	button {
		justify-self: start;
	}
	.err,
	.done {
		grid-column: 1 / -1;
		font-size: 15px;
	}
	.done {
		color: var(--accent);
		font-size: 18px;
	}
	@media (max-width: 560px) {
		form {
			grid-template-columns: 1fr;
		}
	}
</style>
