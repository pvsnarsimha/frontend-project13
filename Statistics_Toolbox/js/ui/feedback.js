// "Was this explanation clear?" under every result: one tap, an optional comment, saved on the device; the student can send it as a
// pre-filled GitHub issue or download everything they have written (trial.html reads the same data). Presentation only.
(function () {
    const { $, $$, showToast } = window.StatLabUI;
    const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
    function toolName(card) {
        const iface = card.closest('.stat-interface');
        const h = iface && iface.querySelector('h2, h3, .tool-title');
        return (h ? h.textContent : (iface && iface.id) || 'unknown tool').replace(/\s+/g, ' ').trim().slice(0, 80);
    }
    function build(card) {
        const strip = el('div', 'fb-strip');
        strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', 'Feedback on this explanation');
        const q = el('span', 'fb-q', 'Was this explanation clear?');
        const yes = el('button', 'fb-btn', '👍 Yes'), no = el('button', 'fb-btn', '👎 No, something was confusing');
        yes.type = no.type = 'button';
        const detail = el('div', 'fb-detail'); detail.hidden = true;
        const box = el('textarea'); box.rows = 3; box.setAttribute('aria-label', 'What was confusing or missing?'); box.placeholder = 'What was confusing or missing? (optional)';
        const save = el('button', 'fb-btn fb-save', 'Save feedback'), send = el('a', 'fb-link', 'Send to the developers (opens GitHub)');
        save.type = 'button'; send.target = '_blank'; send.rel = 'noopener noreferrer';
        const done = el('span', 'fb-done'); done.setAttribute('role', 'status');
        let rating = null;
        const choose = r => { rating = r; detail.hidden = false; yes.setAttribute('aria-pressed', r === 'clear'); no.setAttribute('aria-pressed', r === 'unclear'); refresh(); };
        const entry = () => ({ tool: toolName(card), rating, comment: box.value });
        const refresh = () => { send.href = feedbackIssueUrl(entry()); };
        yes.addEventListener('click', () => choose('clear')); no.addEventListener('click', () => choose('unclear'));
        box.addEventListener('input', refresh);
        save.addEventListener('click', () => {
            const ok = saveFeedback(entry());
            done.textContent = ok ? `Thanks! Saved on this device (${loadFeedback().length} so far).` : 'Could not save: this browser blocks storage. Use "Send to the developers" instead.';
            if (ok) { box.value = ''; showToast('Feedback saved'); }
        });
        const dl = el('button', 'fb-link fb-dl', 'Download all my feedback'); dl.type = 'button';
        dl.addEventListener('click', () => {
            const blob = new Blob([feedbackToJson(loadFeedback())], { type: 'application/json' }), a = document.createElement('a');
            a.href = URL.createObjectURL(blob); a.download = 'statlab-feedback.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        });
        detail.append(box, save, send, dl, done);
        strip.append(q, yes, no, detail);
        return strip;
    }
    function enhance() {
        $$('.result-card').forEach(card => { if (!card.querySelector(':scope > .fb-strip')) card.appendChild(build(card)); });
    }
    const root = $('#interfaceRoot');
    if (root && typeof MutationObserver === 'function') new MutationObserver(enhance).observe(root, { childList: true, subtree: true });
    enhance();
})();
