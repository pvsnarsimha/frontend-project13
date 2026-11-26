// StatLab tutor player: a short animation with a narrator. The animation and the voice run together: each scene starts its drawing and
// its spoken line at the same moment, and the next scene begins only when both are finished (so the voice is never cut off and the
// picture never races ahead). The voice is the browser's own speech synthesis (offline, nothing is sent anywhere); without a voice,
// or with narration switched off, the same line stays on screen as a caption for a reading-time pause.
//
// A concept supplies a definition:  { key, title, hint, description, scenes: [{ title, line, say?, ms }], draw(ctx, W, H, at) }
//   line  the caption shown under the picture (and read aloud unless `say` gives a more speakable version)
//   ms    the least time the scene's drawing takes
//   draw  paints one frame. `at.scene` is the scene being played and `at.p` its progress 0..1 (eased by the concept as it likes);
//         `at.prog(k)` is the progress of scene k: 1 once it has passed, 0 before it starts.
// Hypothesis test: js/core/tutor-hypothesis.js. Roadmap for the others: docs/animations/README.md.

const tutorCards = new Map();            // key -> controller of the card currently on the page

// What a speech engine should hear for the symbols students see in captions
function speakable(text) {
    return String(text)
        .replace(/H₀/g, 'H zero').replace(/H₁/g, 'H one')
        .replace(/α\s*\/\s*2/g, 'alpha over two').replace(/α/g, 'alpha').replace(/μ/g, 'mu').replace(/σ/g, 'sigma')
        .replace(/χ²/g, 'chi squared').replace(/x̄/g, 'x bar').replace(/ŷ/g, 'y hat').replace(/²/g, ' squared').replace(/√/g, 'square root of ')
        .replace(/±/g, 'plus or minus ').replace(/[−–]/g, ' minus ').replace(/≥/g, ' at least ').replace(/≤/g, ' at most ')
        .replace(/\bp\s*=\s*/g, 'p equals ').replace(/\s*=\s*/g, ' equals ').replace(/\s*<\s*/g, ' is less than ').replace(/\s*>\s*/g, ' is greater than ')
        .replace(/Σ/g, 'sum of ').replace(/ᵢ/g, ' i').replace(/÷/g, ' divided by ').replace(/×/g, ' times ').replace(/ρ/g, 'rho').replace(/β/g, 'beta').replace(/λ/g, 'lambda').replace(/τ/g, 'tau').replace(/→/g, ' gives ').replace(/≈/g, ' is about ').replace(/≠/g, ' is not equal to ').replace(/\bt-value\b/g, 't value').replace(/\s+/g, ' ').trim();
}

const tutorSpeechAvailable = () => typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
const tutorEase = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const tutorReduced = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// time a caption needs to be read when nobody is speaking it (about 3 words a second)
const tutorReadMs = line => Math.max(1200, String(line).split(/\s+/).length * 330);

// Returns the card's controller, creating the card inside the result area `areaId` on first use (null when there is no such area).
function mountTutorCard(areaId, def) {
    const area = document.getElementById(areaId);
    if (!area || typeof area.appendChild !== 'function' || typeof area.querySelector !== 'function') return null;     // unit tests with a stub DOM
    let card = document.getElementById('tutorCard-' + def.key);
    if (!card || typeof card.querySelector !== 'function') {
        card = document.createElement('div');
        card.id = 'tutorCard-' + def.key;
        card.className = 'stat-chart-card tutor-card';
        setHtml(card,
            '<div class="stat-chart-head"><h4 class="stat-chart-title"></h4></div><p class="stat-chart-hint"></p>' +
            '<div class="tutor-stage"><canvas class="tutor-canvas" width="640" height="320"></canvas></div>' +
            '<div class="tutor-caption" role="group"><span class="tutor-step"></span><p class="tutor-line"></p></div>' +
            '<p class="tutor-note" role="status"></p><div class="tutor-bar">' +
            '<button type="button" class="tutor-btn tutor-play">▶ Play explanation</button>' +
            '<button type="button" class="tutor-btn tutor-replay">↻ Replay</button>' +
            '<label class="tutor-voice"><input type="checkbox" class="tutor-speak" checked> 🔊 Narrate aloud</label>' +
            '<span class="tutor-dots" role="group" aria-label="Jump to a step"></span>' +
            '</div>');
        area.appendChild(card);
    }
    const prior = tutorCards.get(def.key);
    if (prior) prior.destroy();
    const ctl = createTutor(card, def);
    tutorCards.set(def.key, ctl);
    return ctl;
}

function hideTutorCard(key) {
    const ctl = tutorCards.get(key);
    if (ctl) { ctl.destroy(); tutorCards.delete(key); }
    const card = document.getElementById('tutorCard-' + key);
    if (card && card.style) card.style.display = 'none';
}

function createTutor(card, def) {
    const $c = sel => card.querySelector(sel);
    const canvas = $c('.tutor-canvas'), ctx2d = canvas.getContext('2d');
    const playBtn = $c('.tutor-play'), replayBtn = $c('.tutor-replay'), speakBox = $c('.tutor-speak'), dots = $c('.tutor-dots');
    const lineEl = $c('.tutor-line'), stepEl = $c('.tutor-step'), note = $c('.tutor-note');
    card.style.display = '';
    $c('.stat-chart-title').textContent = def.title;
    $c('.stat-chart-hint').textContent = def.hint || '';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', def.description || def.title);
    const speechOK = tutorSpeechAvailable();
    speakBox.disabled = !speechOK;
    speakBox.checked = speechOK;
    if (!speechOK) speakBox.parentNode.title = 'This browser has no speech voice; the lines are shown as captions instead.';

    const scenes = def.scenes, N = scenes.length;
    let scene = 0, elapsed = 0, started = false, playing = false, finished = false, speechDone = true, speechToken = 0, last = 0, raf = 0, dead = false, fallbackTimer = 0;
    // Voices load lazily in Chrome (getVoices() is empty at first), so never decide from the voice list: try to speak, and treat the
    // voice as unavailable only if it does not start within a moment (Firefox / CI machines with no voice installed). Captions then set the pace.
    let voiceDead = false;
    const voiceReady = () => speechOK && speakBox.checked && !voiceDead;
    if (speechOK) { try { window.speechSynthesis.getVoices(); } catch (e) { /* ignore */ } }
    const speed = () => (typeof window.STATLAB_TUTOR_SPEED === 'number' && window.STATLAB_TUTOR_SPEED > 0 ? window.STATLAB_TUTOR_SPEED : 1);

    // ---- drawing ----
    function size() {
        const w = Math.max(280, Math.round(canvas.parentNode.clientWidth || 640)), h = def.aspect ? Math.round(w * def.aspect) : Math.round(Math.max(220, Math.min(340, w * 0.5)));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = h + 'px'; }
        return { w, h, dpr };
    }
    function paint(sceneIdx, p) {
        const { w, h, dpr } = size();
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2d.clearRect(0, 0, w, h);
        const eased = tutorReduced() ? 1 : p;
        def.draw(ctx2d, w, h, { scene: sceneIdx, p: eased, prog: k => (k < sceneIdx ? 1 : (k > sceneIdx ? 0 : eased)), t: elapsed, speaking: playing && (voiceReady() ? !speechDone : elapsed < tutorReadMs(scenes[sceneIdx].line)) });
    }
    function caption() {
        const s = scenes[scene];
        lineEl.textContent = s.line;
        stepEl.textContent = `Step ${scene + 1} of ${N}: ${s.title}`;
        dots.querySelectorAll('button').forEach((b, i) => { b.setAttribute('aria-current', i === scene ? 'step' : 'false'); b.classList.toggle('on', i <= scene); });
    }
    function poster() {          // the finished picture, so the card is never an empty box before Play
        scene = N - 1; elapsed = 0; caption(); paint(N - 1, 1);
        stepEl.textContent = 'Press Play to watch it explained step by step';
        lineEl.textContent = def.poster || scenes[N - 1].line;
    }

    // ---- narration ----
    function stopSpeech() {
        speechToken++;
        clearTimeout(fallbackTimer);
        if (speechOK) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
    }
    function startSpeech() {
        const s = scenes[scene], token = ++speechToken;
        clearTimeout(fallbackTimer);
        if (!voiceReady()) { speechDone = true; return; }
        speechDone = false;
        let started = false;
        const done = () => { if (token === speechToken) { speechDone = true; clearTimeout(fallbackTimer); } };
        try {
            const u = new window.SpeechSynthesisUtterance(speakable(s.say || s.line));
            u.lang = 'en-US'; u.rate = 0.95; u.pitch = def.pitch || 1;
            u.onstart = () => { if (token === speechToken) { started = true; clearTimeout(fallbackTimer); fallbackTimer = setTimeout(done, (tutorReadMs(s.line) + 6000) / speed()); } };
            u.onend = done; u.onerror = done;
            window.speechSynthesis.cancel();
            setTimeout(() => { if (token === speechToken) window.speechSynthesis.speak(u); }, 40);     // speak() straight after cancel() is dropped by some Chrome builds
        } catch (e) { speechDone = true; return; }
        // no voice started: stop waiting for it, and say so (the captions carry on)
        fallbackTimer = setTimeout(() => {
            if (token !== speechToken || started) return;
            voiceDead = true; try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
            speakBox.parentNode.title = 'No speech voice started in this browser; the lines are shown as captions.';
            note.textContent = '🔇 This browser did not start a speech voice, so the lines are shown as captions.';
            speechDone = true;
        }, 2500 / speed());
    }

    // ---- the loop ----
    function beginScene(i) { scene = i; elapsed = 0; caption(); startSpeech(); }
    function frame(now) {
        if (dead) return;
        if (!canvas.isConnected) { destroy(); return; }       // the tool changed: its result area was replaced
        if (playing && canvas.offsetParent === null) pause();  // the tool was hidden (another tool or tab opened): stop talking
        const dt = Math.min(64, now - last) * speed();
        last = now;
        if (playing) {
            elapsed += dt;
            const s = scenes[scene];
            const speaking = voiceReady();
            const minMs = speaking ? s.ms : Math.max(s.ms, tutorReadMs(s.line));
            paint(scene, Math.min(1, elapsed / s.ms));
            if (elapsed >= minMs && speechDone) {
                if (scene < N - 1) beginScene(scene + 1);
                else { playing = false; finished = true; stopSpeech(); setPlayLabel(); }
            }
        }
        raf = requestAnimationFrame(frame);
    }
    function setPlayLabel() { playBtn.textContent = playing ? '⏸ Pause' : (finished ? '▶ Play again' : (started ? '▶ Resume' : '▶ Play explanation')); playBtn.setAttribute('aria-pressed', String(playing)); }
    function play(fromScene) {
        if (typeof fromScene === 'number') { finished = false; beginScene(fromScene); }
        else if (finished || !started) { finished = false; beginScene(0); }
        else startSpeech();                                    // resume: say the current line again from its start
        started = true; playing = true; last = performance.now(); setPlayLabel();
    }
    function pause() { playing = false; stopSpeech(); setPlayLabel(); }
    // Release the canvas's pixel buffer: WebKit keeps the buffers of removed canvases until its garbage collector runs, and a page that
    // switches tools hundreds of times (every tool now has an AI teacher card) would otherwise pile up gigabytes and stall.
    function destroy() { dead = true; playing = false; stopSpeech(); cancelAnimationFrame(raf); try { canvas.width = 0; canvas.height = 0; } catch (e) { /* ignore */ } }

    playBtn.onclick = () => (playing ? pause() : play());
    replayBtn.onclick = () => { stopSpeech(); play(0); };
    speakBox.onchange = () => { if (speakBox.checked) { voiceDead = false; note.textContent = ''; } if (playing) startSpeech(); };
    dots.textContent = '';
    scenes.forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tutor-dot'; b.textContent = String(i + 1);
        b.setAttribute('aria-label', `Step ${i + 1}: ${s.title}`);
        b.onclick = () => { stopSpeech(); finished = false; play(i); };
        dots.appendChild(b);
    });
    // redraw on resize (the canvas is sized from its container)
    let resizeTimer = 0;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!dead && !playing) paint(scene, finished || (!elapsed && scene === N - 1) ? 1 : Math.min(1, elapsed / scenes[scene].ms)); }, 80); };
    window.addEventListener('resize', onResize);

    poster(); setPlayLabel();
    raf = requestAnimationFrame(frame);
    return {
        destroy: () => { destroy(); window.removeEventListener('resize', onResize); },
        play: () => { finished = false; play(0); },          // start the lesson from its first scene (the AI teacher starts itself after Calculate)
        // test / screenshot hooks: show one frame without playing
        seek(i, p) { pause(); scene = i; elapsed = (p || 0) * scenes[i].ms; caption(); paint(i, p === undefined ? 1 : p); },
        get state() { return { scene, playing, finished, speechDone }; }
    };
}

// Small drawing helpers shared by the concept files (tutor-*.js)
const TD = {
    ink: '#111827', mute: '#64748b', axis: '#94a3b8', blue: '#2563eb', red: '#dc2626', redDark: '#b91c1c', green: '#15803d', amber: '#f59e0b', brand: '#4338ca', curve: '#1a5490',
    font: (px, w) => `${w || 500} ${px}px Inter, system-ui, sans-serif`,
    line(c, x1, y1, x2, y2, col, w, dash) { c.beginPath(); c.setLineDash(dash || []); c.strokeStyle = col; c.lineWidth = w || 1; c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]); },
    dot(c, x, y, r, col, ring) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); if (ring !== false) { c.lineWidth = 2; c.strokeStyle = '#fff'; c.stroke(); } },
    text(c, s, x, y, o) {
        o = o || {}; c.font = TD.font(o.s || 12, o.w || 600); c.textAlign = o.a || 'center'; c.textBaseline = o.b || 'middle';
        if (o.halo) { c.lineJoin = 'round'; c.lineWidth = 5; c.strokeStyle = '#fff'; c.strokeText(s, x, y); }
        c.fillStyle = o.c || '#1f2937'; c.fillText(s, x, y);
    },
    arrow(c, x1, y1, x2, y2, col, w) {
        TD.line(c, x1, y1, x2, y2, col, w || 2); const a = Math.atan2(y2 - y1, x2 - x1);
        c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - 9 * Math.cos(a - 0.4), y2 - 9 * Math.sin(a - 0.4)); c.lineTo(x2 - 9 * Math.cos(a + 0.4), y2 - 9 * Math.sin(a + 0.4)); c.closePath(); c.fillStyle = col; c.fill();
    },
    pill(c, s, x, y, bg, fg, size) {
        c.font = TD.font(size || 13, 800); const w = c.measureText(s).width + 24;
        c.fillStyle = bg; c.beginPath(); if (c.roundRect) c.roundRect(x - w / 2, y - 14, w, 28, 14); else c.rect(x - w / 2, y - 14, w, 28); c.fill();
        TD.text(c, s, x, y + 1, { c: fg || '#fff', w: 800, s: size || 13 });
    },
    // dark readout box whose right edge is at x
    readout(c, s, x, y) {
        c.font = TD.font(13, 800); const w = c.measureText(s).width + 20;
        c.fillStyle = '#0f172a'; c.beginPath(); if (c.roundRect) c.roundRect(x - w, y - 13, w, 26, 8); else c.rect(x - w, y - 13, w, 26); c.fill();
        TD.text(c, s, x - w / 2, y + 1, { c: '#fff', w: 800, s: 13 });
    },
    lerp: (a, b, t) => a + (b - a) * t,
    nice(span, ticks) { const raw = span / (ticks || 6), mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag; },
    // horizontal axis with ticks; map: value -> x
    axisX(c, map, lo, hi, y, label) {
        TD.line(c, map(lo), y, map(hi), y, TD.axis, 1.2);
        const step = TD.nice(hi - lo);
        for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) { TD.line(c, map(v), y, map(v), y + 5, TD.axis, 1); TD.text(c, fmtChartNum(+v.toFixed(8)), map(v), y + 16, { s: 11, c: '#475569', w: 500 }); }
        if (label) TD.text(c, label, (map(lo) + map(hi)) / 2, y + 34, { s: 12, c: '#334155', w: 500 });
    },
    // seeded uniform generator (so demo clouds look the same every time)
    rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
};
