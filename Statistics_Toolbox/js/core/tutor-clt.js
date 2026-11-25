// Narrated animation for the central limit theorem (player: js/core/tutor.js): the population on the left, and on the right the sample means
// dropping into place one by one, piling up, and settling into a bell. The means are the real ones the Sampling tool just drew.

function cltTutorDef(r) {
    if (!r || r.error || !r.means || r.means.length < 30) return null;
    const { means, pop, n, k } = r, f = fmtChartNum, se = pop.sigma / Math.sqrt(n), bins = 28;
    const lo = pop.mu - 4 * se, hi = pop.mu + 4 * se, bw = (hi - lo) / bins;
    const hist = arr => { const h = new Array(bins).fill(0); arr.forEach(v => { h[Math.max(0, Math.min(bins - 1, Math.floor((v - lo) / bw)))]++; }); return h; };
    const first = means.slice(0, 12), mid = means.slice(0, Math.min(k, 200)), hFirst = hist(first), hMid = hist(mid), hAll = hist(means);
    const norm = h => { const mx = Math.max(...h) || 1; return h.map(v => v / mx); };
    const nMid = hFirst, nMid2 = norm(hMid), nAll = norm(hAll), mxAll = Math.max(...hAll) || 1;
    const bell = x => Math.exp(-0.5 * ((x - pop.mu) / se) ** 2) / (se * Math.sqrt(2 * Math.PI));
    const scenes = [
        { id: 'pop', title: 'The population', ms: 2200, line: `We sample from ${pop.name}.` },
        { id: 'drop', title: 'Drop in the means', ms: 3400, line: `We take a random sample of ${n} values, find its mean, and drop it onto the number line. Then we repeat.` },
        { id: 'pile', title: 'The pile grows', ms: 3000, line: `After ${mid.length} samples, the means already pile up in the middle.` },
        { id: 'bell', title: 'A bell appears', ms: 3200, line: `After ${k} samples, sample means pile up into a bell shape, whatever the data looks like: centred on ${f(+pop.mu.toFixed(4))}, with spread σ / √n = ${f(+se.toFixed(4))}.` }
    ];
    function draw(ctx, W, H, at) {
        const m = { t: 34, b: 50 }, base = H - m.b, pl = 10, pr = Math.round(W * 0.28), ml = pr + 26, mr = W - 12, plotH = base - m.t - 30;
        const P = id => at.prog(scenes.findIndex(s => s.id === id));
        const ePop = tutorEase(P('pop')), pDrop = P('drop'), ePile = tutorEase(P('pile')), eBell = tutorEase(P('bell'));
        const X = v => ml + (v - lo) / (hi - lo) * (mr - ml), PX = v => pl + (v - pop.lo) / (pop.hi - pop.lo) * (pr - pl);
        // population panel
        TD.text(ctx, 'Population', (pl + pr) / 2, 16, { s: 12, w: 800, c: TD.mute });
        let peak = 0; for (let i = 0; i <= 100; i++) peak = Math.max(peak, pop.pdf(pop.lo + (pop.hi - pop.lo) * i / 100));
        ctx.beginPath(); ctx.moveTo(PX(pop.lo), base);
        for (let i = 0; i <= 100; i++) { const v = pop.lo + (pop.hi - pop.lo) * i / 100; ctx.lineTo(PX(v), base - pop.pdf(v) / peak * plotH * 0.9 * ePop); }
        ctx.lineTo(PX(pop.hi), base); ctx.closePath(); ctx.fillStyle = 'rgba(220, 38, 38, 0.32)'; ctx.fill(); ctx.strokeStyle = TD.redDark; ctx.lineWidth = 2; ctx.stroke();
        TD.line(ctx, pl, base, pr, base, TD.axis, 1.2);
        // sample means panel
        TD.text(ctx, `Sample means (n = ${n})`, (ml + mr) / 2, 16, { s: 12, w: 800, c: TD.mute });
        TD.axisX(ctx, X, lo, hi, base);
        const barW = (mr - ml) / bins, barsAt = (h, scale, alpha) => h.forEach((v, j) => { if (v <= 0) return; const bh = v * scale; ctx.fillStyle = `rgba(67, 56, 202, ${alpha})`; ctx.fillRect(ml + j * barW + 0.5, base - bh, barW - 1, bh); });
        if (pDrop > 0 && P('pile') === 0) {                         // balls falling onto the number line, stacking where they land
            const stack = new Array(bins).fill(0);
            first.forEach((v, i) => {
                const j = Math.max(0, Math.min(bins - 1, Math.floor((v - lo) / bw))), land = base - 8 - stack[j]++ * 13;
                const local = Math.max(0, Math.min(1, (pDrop - i / first.length * 0.65) / 0.35)); if (local <= 0) return;
                const x = X(Math.max(lo, Math.min(hi, v))), y = TD.lerp(m.t + 10, land, tutorBounce(local));
                TD.dot(ctx, x, y, 6, TD.brand);
            });
        } else if (P('pile') > 0 && eBell === 0) {                    // balls become bars: 12 means -> 200 means
            const ebase = Math.min(1, ePile * 1.4), k2 = ePile;
            barsAt(nMid.map((v, j) => TD.lerp(hFirst[j] / (Math.max(...hFirst) || 1), nMid2[j], k2)), plotH * 0.95 * Math.max(0.2, ebase), 0.62);
        }
        if (eBell > 0) {
            barsAt(nAll.map((v, j) => TD.lerp(nMid2[j], v, eBell)), plotH * 0.95, 0.62);
            // the bell predicted by theory, scaled like the bars (expected count in a bin = k * binwidth * pdf)
            ctx.beginPath(); ctx.strokeStyle = TD.curve; ctx.lineWidth = 3;
            for (let i = 0; i <= 200; i++) { const t = Math.min(eBell, i / 200), v = lo + (hi - lo) * t, px = X(v), py = base - (k * bw * bell(v) / mxAll) * plotH * 0.95; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
            ctx.stroke();
            if (eBell > 0.9) TD.text(ctx, 'normal curve N(μ, σ/√n)', X(pop.mu + 1.4 * se), m.t + 66, { s: 12, w: 800, c: TD.curve, a: 'left', halo: true });
        }
        const count = P('bell') > 0 ? k : (P('pile') > 0 ? mid.length : (pDrop > 0 ? Math.min(first.length, Math.ceil(first.length * Math.min(1, pDrop / 0.9))) : 0));
        if (count > 0) TD.readout(ctx, `${count} sample${count === 1 ? '' : 's'}`, W - 10, 38);
    }
    return {
        key: 'clt', scenes, draw,
        title: 'Watch it explained',
        hint: 'A short animation with a narrator: the means of your random samples drop into place and pile up into a bell shape. Use the numbered buttons to replay one step.',
        description: `Animated histogram. The means of ${k} random samples of size ${n}, drawn from ${pop.name}, drop into place and pile up into a bell shape centred on ${f(+pop.mu.toFixed(3))} with spread ${f(+se.toFixed(3))}.`,
        poster: scenes[scenes.length - 1].line
    };
}

function showSamplingAnimation(areaId, result) {
    const def = cltTutorDef(result);
    if (!def) { hideTutorCard('clt'); return; }
    mountTutorCard(areaId, def);
}
