// StatLab UI layer (answer tiles, worked-solution layout, scatter diagram). Presentation only: no calculation logic lives here.
(function () {
    const { $, $$ } = window.StatLabUI;
    // ---------- answer tiles + structured worked solution ----------
    const esc = t => t.replace(/\\bar\{(.)\}/g, '$1\u0304').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const RULE = /^[\s━─═\-_=*•·]{6,}$/;
    function buildAnswer(valEl) {
        const old = valEl.parentNode.querySelector(':scope > .kpi-row[data-for="' + valEl.id + '"]');
        if (old) old.remove();
        // The visible answer text, without the screen-reader-only "Answer:" label this function adds below
        const txt = Array.from(valEl.childNodes).filter(n => !(n.nodeType === 1 && n.classList.contains('answer-prefix'))).map(n => n.textContent).join('').trim();
        // Spoken label for the live region ("Answer: mean = 4"); added once per value, only when there is an answer to announce
        if (txt && txt !== '—' && !valEl.querySelector(':scope > .answer-prefix')) {
            const label = document.createElement('span');
            label.className = 'sr-only answer-prefix';
            label.textContent = 'Answer: ';
            valEl.insertBefore(label, valEl.firstChild);
        }
        valEl.classList.toggle('long', txt.length > 26);
        // Failed calculations are flagged by text and icon, not only by colour
        valEl.classList.toggle('is-error', /^(?:⚠️?\s*)?(?:error|invalid|no data)/i.test(txt));
        valEl.classList.remove('chips-on');
        const parts = txt.split(/\s*\|\s*/).filter(Boolean);
        if (parts.length < 2) return;
        const row = document.createElement('div'); row.className = 'kpi-row'; row.dataset.for = valEl.id;
        row.setAttribute('aria-hidden', 'true');   // the same text is announced through the (visually hidden) live value above
        parts.forEach(part => {
            const m = part.match(/^(.{1,40}?)\s*(?:=|:)\s*(.+)$/);
            const d = document.createElement('div'); d.className = 'kpi';
            if (m) { setHtml(d, '<small>' + esc(m[1]) + '</small><b>' + esc(m[2]) + '</b>'); }
            else {
                const sig = /^reject/i.test(part), ns = /fail to reject|not significant/i.test(part);
                d.className = 'kpi verdict ' + (sig ? 'sig' : ns ? 'ns' : 'ok');
                // Colour is never the only signal: a glyph and a spoken label carry the same meaning
                const icon = sig ? '▲' : ns ? '●' : '✔', word = sig ? 'Significant result: ' : ns ? 'Not significant: ' : '';
                setHtml(d, '<small>Decision</small><b><span class="vd-ico" aria-hidden="true">' + icon + '</span><span class="sr-only">' + word + '</span>' + esc(part) + '</b>');
            }
            row.appendChild(d);
        });
        valEl.classList.add('chips-on');
        valEl.after(row);
    }
    const fmt = t => esc(t).replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>').replace(/\^(\d+)/g, '<sup>$1</sup>');
    const BOX = /[╔╗╚╝═║│┌┐└┘─━┃┏┓┗┛┠┨┯┷├┤┬┴┼]/g;
    const isRule = t => /^[\s━─═\-_=*•·╔╗╚╝║│┌┐└┘┃┏┓┗┛├┤┬┴┼]{6,}$/.test(t) && !/[A-Za-z0-9]/.test(t);
    function parseSolution(raw) {
        const lines = raw.split('\n').map(l => l.replace(/\s+$/, ''));
        const cleanOf = l => l.replace(BOX, ' ').replace(/\s+/g, ' ').trim();
        const okFin = lines.findIndex(l => /^\s*(✅|✔|☑)/u.test(l));
        const chFin = lines.findIndex(l => /^(FINAL (ANSWERS?|RESULTS?)|SUMMARY)$/.test(cleanOf(l).replace(/^[^A-Za-z]+/, '')));
        let fin = -1, skip = 0;
        if (chFin >= 0 && (okFin < 0 || chFin < okFin)) { fin = chFin; skip = 1; } else if (okFin >= 0) fin = okFin;
        const body = fin < 0 ? lines : lines.slice(0, fin);
        const finals = fin < 0 ? [] : lines.slice(fin + skip).map(l => l.replace(BOX, ' ').replace(/\s+$/, '')).filter(l => l.trim() && !isRule(l.trim()));
        const sol = { title: '', formulas: [], meta: [], intro: [], items: [], finals };
        let cur = null, first = true, lastBlank = false, sub = null, subIndent = 0;
        const indentOf = l => l.match(/^\s*/)[0].length;
        const push = (line, extra) => {
            const o = Object.assign({ t: line }, extra || {});
            if (cur && sub && indentOf(line) > subIndent) sub.lines.push(o);
            else if (cur && cur.subs.length) { sub = null; cur.post.push(o); }
            else (cur ? cur.lines : sol.intro).push(o);
        };
        const open = it => { it.subs = []; it.post = []; cur = it; sub = null; sol.items.push(it); lastBlank = false; };
        body.forEach(line => {
            const t = line.trim();
            if (!t) { if (cur && (cur.lines.length || cur.post.length)) lastBlank = true; return; }
            if (isRule(t)) { lastBlank = false; return; }
            const boxed = /^[║│┃]/.test(t) || /[║│┃]$/.test(t);
            const clean = cleanOf(t);
            if (!clean) return;
            if (/^[│┃]/.test(t) && /[│┃]$/.test(t)) {
                const cells = t.replace(/^[│┃]|[│┃]$/g, '').split(/[│┃]/).map(c => c.trim());
                if (cells.length >= 2) { push(line, { cls: 'row', cells }); lastBlank = false; return; }
            }
            let m;
            if (first) {
                first = false;
                const letters = clean.replace(/[^A-Za-z]/g, '');
                if (letters.length > 3 && letters.replace(/[^A-Z]/g, '').length / letters.length > .7 && !/=/.test(clean)) { sol.title = clean.replace(/^[^A-Za-z0-9(]+/, ''); return; }
            }
            const bare = clean.replace(/^[^\w(Α-ωμσ]+/u, '');
            if ((m = bare.match(/^(?:FORMULA|Formula)\s*:\s*(.+)$/)) && !cur) { sol.formulas.push(m[1]); return; }
            if ((m = bare.match(/^(?:Step|STEP)\s*(\d+)\s*[:.\-–]?\s*(.*)$/))) {
                const st = { no: m[1], title: m[2] || 'Step ' + m[1], lines: [], step: true };
                if (cur && !cur.step && !cur.anon && !cur.chapter && (cur.subs.length || !cur.lines.some(x => x.t.trim()))) { sub = st; subIndent = indentOf(line); cur.subs.push(st); lastBlank = false; }
                else { open(st); }
                return;
            }
            if (boxed && !/[=<>≤≥≈]/.test(clean) && clean.length < 80) { open({ no: '', title: clean, lines: [], chapter: true }); open({ no: '', title: '', lines: [], anon: true }); return; }
            if (!boxed && (m = bare.match(/^(.{2,70}):$/)) && !/^[•\-*]/.test(bare)) { open({ no: '', title: m[1], lines: [] }); return; }
            if (!cur && (m = bare.match(/^([A-Za-zΑ-ωμσ][\w ()\/.\-]{0,28}):\s+(.+)$/)) && !/^(Note|Interpretation)/i.test(m[1])) { sol.meta.push([m[1], m[2]]); return; }
            if (cur && (m = bare.match(/^(?:FORMULA|Formula)\s*:\s*(.+)$/))) { push(m[1], { cls: 'formula' }); lastBlank = false; return; }
            push(line.replace(/[║│┃]/g, ' ').replace(/\s+$/, ''), { cls: boxed ? 'box' : '', gap: lastBlank });
            lastBlank = false;
        });
        sol.items = sol.items.filter(it => !(it.anon && !it.lines.length && !it.post.length) && !(it.chapter && false));
        if (!sol.items.some(it => !it.chapter) && sol.intro.some(x => x.t.trim())) { sol.items = sol.items.filter(it => it.chapter); sol.items.push({ no: '', title: 'Working', lines: sol.intro, subs: [], post: [] }); sol.intro = []; }
        return sol;
    }
    function lineHtml(l, minLead) {
        const lead = Math.max(0, (l.t.match(/^\s*/)[0].length) - minLead);
        const txt = l.t.trim();
        let cls = 'ln' + (l.gap ? ' gap' : '');
        if (l.cls === 'formula') cls += ' fm';
        else if (l.cls === 'box') cls += ' bx';
        else if (/^(Interpretation|Conclusion|Note|Therefore|Result|Answer|Decision|Meaning)\b/i.test(txt)) cls += ' hl';
        else if (/^[•\-*]\s/.test(txt)) cls += ' bl';
        const body = /^[•\-*]\s/.test(txt) && cls.includes('bl') ? txt.replace(/^[•\-*]\s*/, '') : txt;
        return '<span class="' + cls + '" style="padding-left:' + (lead * .55 + (cls.includes(' bl') ? 1.1 : 0)) + 'em">' + fmt(body) + '</span>';
    }

    // ---------- unified layout for hand-built (rich) solutions: roadmap, collapsible sections, scatter diagram ----------
    const SCATTER_IFACE = /Pearson|Spearman|Kendall|Covariance|SimpleLinear|StdErrors|TStats|FTestOverall|ModelSummary|DurbinWatson|CooksDistance|PointBiserial/;
    const numsOf = t => ((t && t.value) || '').split(/[\s,;]+/).filter(Boolean).map(Number).filter(isFinite);
    const nice = (lo, hi, n) => {
        const span = (hi - lo) || 1, raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(v => v >= raw) || raw;
        const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(+v.toFixed(10));
        return out;
    };
    const f4 = v => Math.abs(v) >= 1000 || (v !== 0 && Math.abs(v) < 0.01) ? v.toExponential(2) : String(+v.toFixed(3));
    function scatterSvg(iface) {
        if (!SCATTER_IFACE.test(iface.id)) return '';
        const areas = $$('textarea', iface).filter(t => numsOf(t).length >= 3);
        let tx = areas.find(t => /X(Input)?$/i.test(t.id)), ty = areas.find(t => /Y(Input)?$/i.test(t.id));
        if (!tx || !ty) { tx = areas[0]; ty = areas[1]; }
        if (!tx || !ty) return '';
        const X = numsOf(tx), Y = numsOf(ty), n = Math.min(X.length, Y.length);
        if (n < 3 || X.length !== Y.length) return '';
        const mx = X.reduce((a, b) => a + b, 0) / n, my = Y.reduce((a, b) => a + b, 0) / n;
        let sxy = 0, sxx = 0, syy = 0;
        for (let i = 0; i < n; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; syy += (Y[i] - my) ** 2; }
        const b1 = sxx ? sxy / sxx : 0, b0 = my - b1 * mx, r = sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
        const W = 640, H = 300, L = 54, R = 16, T = 16, B = 40;
        const xlo = Math.min(...X), xhi = Math.max(...X), ylo = Math.min(...Y, b0 + b1 * xlo, b0 + b1 * xhi), yhi = Math.max(...Y, b0 + b1 * xlo, b0 + b1 * xhi);
        const px = (xhi - xlo) * .06 || 1, py = (yhi - ylo) * .08 || 1;
        const x0 = xlo - px, x1 = xhi + px, y0 = ylo - py, y1 = yhi + py;
        const sx = v => L + (v - x0) / (x1 - x0) * (W - L - R), sy = v => H - B - (v - y0) / (y1 - y0) * (H - T - B);
        let g = '';
        nice(x0, x1, 6).forEach(v => { g += '<line class="g" x1="' + sx(v) + '" x2="' + sx(v) + '" y1="' + T + '" y2="' + (H - B) + '"/><text class="t" x="' + sx(v) + '" y="' + (H - B + 16) + '" text-anchor="middle">' + f4(v) + '</text>'; });
        nice(y0, y1, 5).forEach(v => { g += '<line class="g" y1="' + sy(v) + '" y2="' + sy(v) + '" x1="' + L + '" x2="' + (W - R) + '"/><text class="t" y="' + (sy(v) + 4) + '" x="' + (L - 8) + '" text-anchor="end">' + f4(v) + '</text>'; });
        let stems = '', dots = '';
        for (let i = 0; i < n; i++) {
            stems += '<line class="rs" x1="' + sx(X[i]) + '" x2="' + sx(X[i]) + '" y1="' + sy(Y[i]) + '" y2="' + sy(b0 + b1 * X[i]) + '"/>';
            dots += '<circle class="pt" cx="' + sx(X[i]) + '" cy="' + sy(Y[i]) + '" r="4.5"><title>(' + X[i] + ', ' + Y[i] + ')</title></circle>';
        }
        const line = '<line class="fit" x1="' + sx(xlo) + '" y1="' + sy(b0 + b1 * xlo) + '" x2="' + sx(xhi) + '" y2="' + sy(b0 + b1 * xhi) + '"/>';
        return '<figure class="rd-fig"><figcaption><b>Scatter plot with least-squares line</b><span>ŷ = ' + f4(b0) + (b1 < 0 ? ' − ' : ' + ') + f4(Math.abs(b1)) + 'x &nbsp;·&nbsp; r = ' + r.toFixed(4) + ' &nbsp;·&nbsp; n = ' + n + '</span></figcaption>' +
            '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Scatter plot of Y against X with fitted line">' + g +
            '<line class="ax" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/><line class="ax" x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + (H - B) + '"/>' +
            stems + line + dots + '<text class="al" x="' + ((L + W - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">X</text><text class="al" transform="translate(13 ' + ((T + H - B) / 2) + ') rotate(-90)" text-anchor="middle">Y</text></svg>' +
            '<div class="rd-key"><span><i class="k-pt"></i>Observed point</span><span><i class="k-fit"></i>Fitted line</span><span><i class="k-rs"></i>Residual</span></div></figure>';
    }
    function decorateRich(el) {
        const root = el.firstElementChild;
        if (!root || root.dataset.rd) return;
        root.dataset.rd = '1';
        const kids = Array.from(root.children);
        if (kids.length < 3) return;
        const banner = kids[0], secs = kids.slice(1);
        const titleOf = c => {
            let n = c;
            for (let i = 0; i < 4; i++) {
                const k = Array.from(n.children).find(x => x.textContent.trim());
                if (!k) break;
                n = k;
                if (n.textContent.trim().length <= 90) break;
            }
            return (n.textContent || '').replace(/\s+/g, ' ').trim();
        };
        const clean = t => t.replace(/^[^\p{L}\p{N}]+/u, '').replace(/\s+/g, ' ');
        const chips = [];
        secs.forEach((sec, i) => {
            const raw = titleOf(sec), title = clean(raw);
            if (!title) return;
            const isFinal = /^[📌✅✔]/u.test(raw), isRef = /^[📖📚]/u.test(raw) || /^(Formula Reference|Complete Formula)/i.test(title);
            sec.id = (el.id || 'rd') + '-s' + (i + 1); sec.classList.add('rd-sec'); if (isFinal) sec.classList.add('rd-final');
            const first = sec.firstElementChild, ft = first ? clean(first.textContent || '') : '', dup = !!first && ft.length <= title.length + 4 && ft.startsWith(title.slice(0, 20));
            const d = document.createElement('details'); d.className = 'rd-det'; if (!isRef) d.open = true;
            const sm = document.createElement('summary');
            const num = chips.length + 1;
            setHtml(sm, '<span class="rd-no">' + (isFinal ? '✔' : isRef ? '≡' : num) + '</span><span class="rd-tt">' + fmt(title.length > 70 ? title.slice(0, 68) + '…' : title) + '</span><span class="rd-car">▶</span>');
            const body = document.createElement('div'); body.className = 'rd-body';
            while (sec.firstChild) body.appendChild(sec.firstChild);
            if (dup && body.firstElementChild) body.firstElementChild.classList.add('rd-dup');
            d.appendChild(sm); d.appendChild(body); sec.appendChild(d);
            chips.push({ id: sec.id, no: isFinal ? '✔' : isRef ? '≡' : num, title: (t => t.length > 30 ? t.slice(0, 29) + '…' : t)(title.replace(/^(PART|Step)\s*\d+(\.\d+)?\s*[:.\-–]?\s*/i, '') || title), det: d });
        });
        $$('table', root).forEach(t => {
            $$('td', t).forEach(td => { if ((td.textContent || '').trim().length > 34) td.classList.add('wrap'); });
            const w = document.createElement('div'); w.className = 'rd-scroll'; t.parentNode.insertBefore(w, t); w.appendChild(t);
        });
        const iface = el.closest('.stat-interface');
        const figHtml = iface ? scatterSvg(iface) : '';
        const nav = document.createElement('nav'); nav.className = 'rd-nav'; nav.setAttribute('aria-label', 'Solution roadmap');
        setHtml(nav, '<div class="rd-nav-h"><b>Solution roadmap</b><button type="button" class="rd-all">Collapse all</button></div><div class="rd-flow">' +
            chips.map(c => '<a href="#' + c.id + '" data-id="' + c.id + '"><i>' + c.no + '</i><span>' + fmt(c.title) + '</span></a>').join('<em>›</em>') + '</div>');
        banner.after(nav);
        if (figHtml) { const f = document.createElement('div'); setHtml(f, figHtml); nav.after(f.firstChild); }
        nav.addEventListener('click', e => {
            const a = e.target.closest('a[data-id]');
            if (a) { e.preventDefault(); const c = chips.find(x => x.id === a.dataset.id); if (c) c.det.open = true; document.getElementById(a.dataset.id).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            const b = e.target.closest('.rd-all');
            if (b) { const open = b.textContent !== 'Collapse all'; chips.forEach(c => c.det.open = open); b.textContent = open ? 'Collapse all' : 'Expand all'; }
        });
    }
    function buildSolution(el) {
        const card = el.closest('.result-card');
        const old = card.querySelector(':scope > .solution[data-for="' + el.id + '"]');
        if (old) old.remove();
        const rich = !!el.querySelector('div, table, h2, h3');
        el.classList.toggle('rich', rich); el.classList.remove('raw');
        if (rich) { el.classList.remove('plain-src'); decorateRich(el); return; }
        const tmp = document.createElement('div'); setHtml(tmp, el.innerHTML.replace(/<br\s*\/?>/gi, '\n'));
        const raw = tmp.textContent.replace(/\r/g, '');
        if (!raw.trim()) { el.classList.remove('plain-src'); return; }
        const sol = parseSolution(raw);
        const box = document.createElement('div'); box.className = 'solution'; box.dataset.for = el.id;
        const label = (card.querySelector('.result-label')?.textContent || 'Solution').replace(/\s*(RESULTS?|RESULT)\s*$/i, '').replace(/^[^\wΑ-ω]+/, '').trim();
        // short single message (validation / hint) → friendly notice instead of a solution
        const trivial = sol.items.every(x => x.title === 'Working' && !x.subs.length);
        card.classList.toggle('is-notice', false);
        if (trivial && !sol.finals.length && !sol.formulas.length && raw.trim().split('\n').filter(x => x.trim()).length <= 2 && raw.trim().length < 160) {
            card.classList.add('is-notice');
            const iface = card.closest('.stat-interface');
            const tip = iface && iface.querySelector('.sample-btn') ? '<p class="n-tip">Tip: choose “Try sample data” to see the expected input format.</p>' : '';
            box.className = 'solution notice'; box.setAttribute('role', 'alert');
            setHtml(box, '<span class="n-ico" aria-hidden="true">💡</span><div><b>Heads up</b><p>' + fmt(raw.trim()) + '</p>' + tip + '</div>');
            el.classList.add('plain-src'); el.after(box); return;
        }
        const nItems = sol.items.filter(x => !x.chapter && !x.anon).length, expandable = sol.items.some(x => x.lines.some(l => l.t.trim()) || (x.subs && x.subs.length));
        const title = sol.title ? sol.title.charAt(0) + sol.title.slice(1).toLowerCase().replace(/\b(cdf|pdf|pmf|mgf|anova|manova|ancova|iqr|sem|mad|vif|ss)\b/g, s => s.toUpperCase()) : label.charAt(0) + label.slice(1).toLowerCase();
        let h = '<div class="sol-head"><h4><span class="ico">🧮</span><span>Worked Solution<em>' + fmt(title) + '</em></span></h4><div class="sol-tools">' + (nItems ? '<span class="sol-count">' + nItems + (sol.items.find(x => !x.chapter && !x.anon).step ? ' step' : ' part') + (nItems > 1 ? 's' : '') + '</span>' : '') + (expandable ? '<button type="button" class="sol-toggle" data-open="1">Collapse all</button>' : '') + '</div></div>';
        sol.formulas.forEach(f => h += '<div class="sol-formula"><span class="tag">FORMULA</span><code>' + fmt(f) + '</code></div>');
        if (sol.meta.length) h += '<div class="sol-meta">' + sol.meta.map(([k, v]) => '<div><small>' + fmt(k) + '</small><b>' + fmt(v) + '</b></div>').join('') + '</div>';
        if (sol.intro.length) h += '<div class="sol-intro">' + sol.intro.map(l => '<p>' + fmt(l.t.trim()) + '</p>').join('') + '</div>';
        if (nItems) {
            h += '<div class="sol-body">';
            const blk = (lines) => {
                const ls = lines.filter(l => l.t.trim());
                const ml = ls.length ? Math.min.apply(null, ls.map(l => l.t.match(/^\s*/)[0].length)) : 0;
                let out = '', rows = [];
                const flush = () => {
                    if (!rows.length) return;
                    const cell = (c, tag) => '<' + tag + '>' + fmt(c) + '</' + tag + '>';
                    out += '<table class="tbl"><thead><tr>' + rows[0].cells.map(c => cell(c, 'th')).join('') + '</tr></thead><tbody>' +
                        rows.slice(1).map(r => '<tr>' + r.cells.map(c => cell(c, 'td')).join('') + '</tr>').join('') + '</tbody></table>';
                    rows = [];
                };
                ls.forEach(l => { if (l.cls === 'row') rows.push(l); else { flush(); out += lineHtml(l, ml); } });
                flush();
                return out;
            };
            const subHtml = sb => {
                const m = sb.title.match(/^(.+?)\s*=\s*(.+)$/), ls = sb.lines.filter(l => l.t.trim());
                return '<div class="sub"><span class="sub-no">' + esc(sb.no) + '</span><div class="sub-main"><div class="sub-t"><span>' + fmt(m && !ls.length ? m[1] : sb.title) + '</span>' + (m && !ls.length ? '<span class="step-val">' + fmt(m[2]) + '</span>' : '') + '</div>' + (ls.length ? '<div class="sub-b">' + blk(sb.lines) + '</div>' : '') + '</div></div>';
            };
            let n = 0;
            const hasSteps = sol.items.some(x => x.step);
            sol.items.forEach((st, i) => {
                if (st.chapter) { h += '<div class="chapter"><span>' + fmt(st.title) + '</span></div>'; return; }
                const hasBody = st.lines.some(l => l.t.trim()) || st.subs.length || st.post.some(l => l.t.trim());
                if (st.anon) { h += '<div class="anon">' + blk(st.lines) + st.subs.map(subHtml).join('') + blk(st.post) + '</div>'; return; }
                n++;
                const no = st.no || (hasSteps ? '•' : n);
                const open = nItems <= 10 || n <= 3 ? ' open' : '';
                if (hasBody) h += '<details class="step' + (st.step ? '' : ' part') + '"' + open + '><summary><span class="step-no">' + esc(String(no)) + '</span><span class="step-title">' + fmt(st.title) + '</span><span class="step-caret">▶</span></summary><div class="step-body">' + blk(st.lines) + (st.subs.length ? '<div class="subs">' + st.subs.map(subHtml).join('') + '</div>' : '') + blk(st.post) + '</div></details>';
                else {
                    const m = st.title.match(/^(.+?)\s*=\s*(.+)$/);
                    h += '<div class="step static"><span class="step-no">' + esc(String(no)) + '</span><span class="step-title">' + fmt(m ? m[1] : st.title) + '</span>' + (m ? '<span class="step-val">' + fmt(m[2]) + '</span>' : '') + '</div>';
                }
            });
            h += '</div>';
        }
        if (sol.finals.length) {
            h += '<div class="sol-final"><h5>✔ Final results</h5>';
            sol.finals.forEach(f => {
                const t = f.replace(/^[✅✔☑️\s]+/u, '').trim();
                let m;
                if (/:$/.test(t)) h += '<div class="final-sub">' + fmt(t.replace(/:$/, '')) + '</div>';
                else if ((m = t.match(/^(.+?)\s+(?:=|:|→)\s+(.+)$/))) h += '<div class="final-row"><span>' + fmt(m[1]) + '</span><b>' + fmt(m[2]) + '</b></div>';
                else h += '<div class="final-row text">' + fmt(t) + '</div>';
            });
            h += '</div>';
        }
        setHtml(box, h);
        const tg = box.querySelector('.sol-toggle');
        if (tg) tg.addEventListener('click', e => {
            const b = e.currentTarget, open = b.dataset.open !== '1';
            box.querySelectorAll('details.step').forEach(d => d.open = open);
            b.dataset.open = open ? '1' : '0'; b.textContent = open ? 'Collapse all' : 'Expand all';
        });
        el.classList.add('plain-src');
        el.after(box);
    }
    // Result tables are generated as bare HTML: give header cells a scope and each table a name taken from the heading above it
    function describeTables(root) {
        $$('table', root).forEach(table => {
            if (!table.getAttribute('aria-label') && !table.querySelector('caption')) {
                let prev = table.closest('.rd-scroll') || table;
                let label = '';
                for (let hop = 0; hop < 6 && prev && !label; hop++) {
                    let node = prev.previousElementSibling;
                    while (node && !label) {
                        const h = /^H[2-6]$/.test(node.tagName) ? node : node.querySelector && node.querySelector('h2, h3, h4, h5');
                        if (h) label = h.textContent.replace(/\s+/g, ' ').replace(/^[^\p{L}\p{N}]+/u, '').trim();
                        node = label ? null : node.previousElementSibling;
                    }
                    prev = prev.parentElement;
                    if (prev === root) break;
                }
                table.setAttribute('aria-label', label || 'Calculation table');
            }
            // Wide tables scroll inside their own box instead of stretching the page (keyboard-focusable so they can be scrolled without a mouse)
            if (!table.closest('.rd-scroll, .table-scroll')) {
                const wrap = document.createElement('div');
                wrap.className = 'table-scroll';
                wrap.tabIndex = 0;
                wrap.setAttribute('role', 'region');
                wrap.setAttribute('aria-label', table.getAttribute('aria-label') || 'Calculation table');
                table.parentNode.insertBefore(wrap, table);
                wrap.appendChild(table);
            }
            $$('th:not([scope])', table).forEach(th => {
                th.setAttribute('scope', th.closest('thead') || th.parentElement === table.rows[0] ? 'col' : 'row');
            });
        });
    }

    // Generated result markup carries its layout in inline styles. Read each declaration once and expose it as a class, so the
    // responsive rules (css/responsive.css) can be written against classes instead of substrings of the style attribute.
    function tagGeneratedLayout(root) {
        $$('[style]', root).forEach(el => {
            const st = el.getAttribute('style') || '';
            if (/grid-template-columns/.test(st)) {
                el.classList.add('gen-grid');
                if (/repeat\(\s*[3-9]\b/.test(st)) el.classList.add('gen-grid-many');
            }
            if (/display:\s*flex/.test(st)) el.classList.add('gen-flex');
            if (/(?:^|;)\s*padding:\s*2\d/.test(st)) el.classList.add('gen-pad');
            if (/(?:^|;)\s*(?:min-)?width:/.test(st)) el.classList.add('gen-sized');
            if (/font-size:\s*[34]\d/.test(st)) el.classList.add('gen-big');
        });
    }

    // Degenerate input (identical values, one observation, zero divisor) makes some formulas undefined. The working is still shown,
    // but the page says plainly what happened instead of leaving a bare NaN / Infinity.
    const UNDEFINED_RESULT = /\bNaN\b|-?\bInfinity\b|\bundefined\b/;
    function flagUndefined(card) {
        const val = card.querySelector('.result-value'), st = card.querySelector('.calculation-steps');
        const text = ((val && val.textContent) || '') + ' ' + ((st && st.textContent) || '');
        const existing = card.querySelector(':scope > .undef-note');
        if (!UNDEFINED_RESULT.test(text)) { if (existing) existing.remove(); return; }
        if (existing || !val) return;
        const note = document.createElement('div');
        note.className = 'undef-note';
        note.setAttribute('role', 'note');
        setHtml(note, '<b>Some values are not defined for this data.</b> They appear as NaN or ∞. This usually means all values are identical (zero variance), there are too few observations for the formula, or a divisor was zero. The working below is still shown; try different data or add more observations.');
        (card.querySelector(':scope > .kpi-row') || val).after(note);
    }

    function hookCard(card) {
        if (card.dataset.hooked) return; card.dataset.hooked = '1';
        const val = card.querySelector('.result-value'), st = card.querySelector('.calculation-steps');
        const run = () => { if (val) buildAnswer(val); if (st) { buildSolution(st); describeTables(card); tagGeneratedLayout(card); } flagUndefined(card); };
        run();
        if (val) new MutationObserver(() => { buildAnswer(val); flagUndefined(card); }).observe(val, { childList: true, characterData: true, subtree: true });
        if (st) new MutationObserver(() => { buildSolution(st); describeTables(card); tagGeneratedLayout(card); flagUndefined(card); }).observe(st, { childList: true, characterData: true, subtree: true });
    }
    Object.assign(window.StatLabUI, { esc, fmt, buildAnswer, parseSolution, buildSolution, describeTables, tagGeneratedLayout, flagUndefined, hookCard });
})();
