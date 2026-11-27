// Procedural seaside ambience (no samples): surf, wind, distant gulls by day, crickets at night.
// Everything is synthesized with WebAudio so there are no licensing questions and nothing to download.
export function createAmbient() {
	const ctx = new (window.AudioContext || window.webkitAudioContext)();
	const master = ctx.createGain();
	master.gain.value = 0;
	master.connect(ctx.destination);

	const noiseBuf = (() => {
		const len = ctx.sampleRate * 4, b = ctx.createBuffer(2, len, ctx.sampleRate);
		for (let ch = 0; ch < 2; ch++) {
			const d = b.getChannelData(ch);
			let last = 0;
			for (let i = 0; i < len; i++) {
				const w = Math.random() * 2 - 1;
				last = (last + 0.02 * w) / 1.02; // brown-ish
				d[i] = last * 3.5;
			}
		}
		return b;
	})();
	const noise = () => {
		const s = ctx.createBufferSource();
		s.buffer = noiseBuf;
		s.loop = true;
		s.start(0, Math.random() * 3);
		return s;
	};

	// surf: low rumble swelling every few seconds + a hiss of the wash
	const surfBus = ctx.createGain();
	surfBus.gain.value = 0.5;
	surfBus.connect(master);
	const rumble = noise(), lp = ctx.createBiquadFilter(), rg = ctx.createGain();
	lp.type = 'lowpass';
	lp.frequency.value = 420;
	rg.gain.value = 0.2;
	rumble.connect(lp).connect(rg).connect(surfBus);
	const wash = noise(), bp = ctx.createBiquadFilter(), wg = ctx.createGain();
	bp.type = 'bandpass';
	bp.frequency.value = 1800;
	bp.Q.value = 0.4;
	wg.gain.value = 0.0;
	wash.connect(bp).connect(wg).connect(surfBus);
	let waveT = 0;
	function scheduleWaves(now) {
		while (waveT < now + 12) {
			const period = 5.5 + Math.random() * 4, peak = 0.35 + Math.random() * 0.4;
			const t = Math.max(waveT, now);
			rg.gain.setTargetAtTime(peak, t, 1.2);
			rg.gain.setTargetAtTime(0.12, t + period * 0.45, 1.4);
			wg.gain.setTargetAtTime(peak * 0.22, t + 1.1, 0.4);
			wg.gain.setTargetAtTime(0.0, t + 2.2, 1.1);
			bp.frequency.setTargetAtTime(2400, t + 1.1, 0.3);
			bp.frequency.setTargetAtTime(1300, t + 2.2, 0.9);
			waveT = t + period;
		}
	}

	// wind
	const wind = noise(), wf = ctx.createBiquadFilter(), wv = ctx.createGain();
	wf.type = 'bandpass';
	wf.frequency.value = 500;
	wf.Q.value = 0.7;
	wv.gain.value = 0.05;
	wind.connect(wf).connect(wv).connect(master);

	// distant gull: saw through a formant, gliding down, 2-4 calls
	function gull(t) {
		const calls = 2 + Math.floor(Math.random() * 3), pan = ctx.createStereoPanner();
		pan.pan.value = Math.random() * 1.6 - 0.8;
		const g = ctx.createGain();
		g.gain.value = 0;
		const f = ctx.createBiquadFilter();
		f.type = 'bandpass';
		f.frequency.value = 1500;
		f.Q.value = 3;
		const o = ctx.createOscillator();
		o.type = 'sawtooth';
		o.connect(f).connect(g).connect(pan).connect(master);
		const vol = 0.025 + Math.random() * 0.02;
		for (let i = 0; i < calls; i++) {
			const s = t + i * (0.32 + Math.random() * 0.12), base = 1050 + Math.random() * 250;
			o.frequency.setValueAtTime(base * 1.35, s);
			o.frequency.exponentialRampToValueAtTime(base * 0.8, s + 0.24);
			g.gain.setValueAtTime(0, s);
			g.gain.linearRampToValueAtTime(vol, s + 0.03);
			g.gain.exponentialRampToValueAtTime(0.0008, s + 0.26);
		}
		o.start(t);
		o.stop(t + calls * 0.5 + 0.4);
	}
	// cricket: short bursts of a high sine
	function cricket(t) {
		const o = ctx.createOscillator(), g = ctx.createGain(), pan = ctx.createStereoPanner();
		o.frequency.value = 4300 + Math.random() * 600;
		pan.pan.value = Math.random() * 2 - 1;
		g.gain.value = 0;
		o.connect(g).connect(pan).connect(master);
		const bursts = 3 + Math.floor(Math.random() * 4), vol = 0.006 + Math.random() * 0.006;
		for (let i = 0; i < bursts; i++) {
			const s = t + i * 0.09;
			g.gain.setValueAtTime(0, s);
			g.gain.linearRampToValueAtTime(vol, s + 0.01);
			g.gain.linearRampToValueAtTime(0, s + 0.05);
		}
		o.start(t);
		o.stop(t + bursts * 0.09 + 0.1);
	}

	let night = 0, on = false, timer = null, nextGull = 0, nextCricket = 0;
	function loop() {
		const now = ctx.currentTime;
		scheduleWaves(now);
		if (now > nextGull) {
			if (night < 0.5) gull(now + 0.1);
			nextGull = now + 8 + Math.random() * 16;
		}
		if (now > nextCricket) {
			if (night > 0.4) cricket(now + 0.05);
			nextCricket = now + 0.4 + Math.random() * 1.4;
		}
	}
	return {
		get on() {
			return on;
		},
		toggle(v = !on) {
			on = v;
			if (on) {
				ctx.resume().catch(() => {});
				master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
				timer ??= setInterval(loop, 250);
			} else {
				master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
			}
			return on;
		},
		setNight(n) {
			night = n;
			wv.gain.setTargetAtTime(0.04 + n * 0.03, ctx.currentTime, 1);
		},
		destroy() {
			clearInterval(timer);
			ctx.close();
		}
	};
}
