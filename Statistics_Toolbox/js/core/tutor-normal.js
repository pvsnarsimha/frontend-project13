// Narrated animation for z-scores on the normal curve (player: js/core/tutor.js): a point moves along the standard normal curve and the area
// to its left fills in live, first to the z-score of the user's smallest value, then to their largest. The numbers are the user's own.

function zScoreTutorDef(numbers) {
    const nums = (numbers || []).filter(Number.isFinite), n = nums.length;
    if (n < 2) return null;
    const mean = nums.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
    if (!(sd > 0)) return null;
    const xmin = Math.min(...nums), xmax = Math.max(...nums), zmin = (xmin - mean) / sd, zmax = (xmax - mean) / sd;
    const norm = PLOT_DISTRIBUTIONS.normal, par = { mean: 0, stdDev: 1 };
    const Phi = z => norm.cdf(z, par), phi = z => norm.pdf(z, par);
    const pct = v => `${+(v * 100).toPrecision(3)}%`, f = fmtChartNum;
    const lim = Math.min(6, Math.max(3.5, Math.abs(zmin) + 0.4, Math.abs(zmax) + 0.4));
    const scenes = [
        { id: 'curve', title: 'The normal curve', ms: 2200, line: 'A z-score says how many standard deviations a value sits from the mean. On the standard normal curve, the mean is at 0.' },
        { id: 'zmin', title: 'Your smallest value', ms: 2600, line: `Your smallest value, ${f(xmin)}, has z = ${f(+zmin.toFixed(4))}: ${f(+Math.abs(zmin).toFixed(2))} standard deviations below the mean. Only ${pct(Phi(zmin))} of the area lies to its left.` },
        { id: 'zmax', title: 'Your largest value', ms: 2800, line: `Slide up to your largest value, ${f(xmax)}, where z = ${f(+zmax.toFixed(4))}. As z grows, more of the area lies to its left: now ${pct(Phi(zmax))}.` },
        { id: 'all', title: 'All your values', ms: 2000, line: `Here are all ${n} of your values on the same scale, each at its own z-score.` }
    ];
    const zs = nums.map(v => (v - mean) / sd);
    function draw(ctx, W, H, at) {
        const m = { l: 24, r: 20, t: 44, b: 46 }, base = H - m.b, top = m.t;
        const X = v => m.l + (v + lim) / (2 * lim) * (W - m.l - m.r), Y = y => base - y / 0.42 * (base - top);
        const P = id => at.prog(scenes.findIndex(s => s.id === id));
        const c = tutorEase(P('curve')), e1 = tutorEase(P('zmin')), e2 = tutorEase(P('zmax')), all = tutorEase(P('all'));
        const z = e2 > 0 ? TD.lerp(zmin, zmax, e2) : TD.lerp(0, zmin, e1), shown = P('zmin') > 0;
        TD.axisX(ctx, X, -Math.floor(lim), Math.floor(lim), base, 'z-score (standard deviations from the mean)');
        if (c > 0) {
            if (shown) {                                          // area to the left of the moving point
                ctx.beginPath(); ctx.moveTo(X(-lim), base);
                for (let v = -lim; v <= z; v += 0.04) ctx.lineTo(X(v), Y(phi(v)));
                ctx.lineTo(X(z), Y(phi(z))); ctx.lineTo(X(z), base); ctx.closePath(); ctx.fillStyle = 'rgba(37, 99, 235, 0.38)'; ctx.fill();
            }
            ctx.strokeStyle = TD.curve; ctx.lineWidth = 2.6; ctx.beginPath();
            for (let i = 0; i <= 200; i++) { const v = -lim + 2 * lim * Math.min(c, i / 200) , px = X(v), py = Y(phi(v)); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
            ctx.stroke();
        }
        if (c > 0) TD.line(ctx, X(0), base, X(0), Y(phi(0)), TD.mute, 1.2, [4, 4]);
        if (shown) {
            const mx = X(z), my = Y(phi(z));
            TD.line(ctx, mx, base, mx, my, TD.ink, 2, [5, 4]); TD.dot(ctx, mx, my, 8, TD.ink);
            TD.text(ctx, `z = ${(+z.toFixed(2)).toFixed(2)}`, mx + (z > lim * 0.55 ? -34 : 34), my - 14, { s: 13, w: 800, c: TD.ink, halo: true });
            TD.readout(ctx, `Area to the left = ${Phi(z).toFixed(4)}`, W - 10, 20);
        }
        if (all > 0) zs.forEach(v => { ctx.globalAlpha = all; TD.dot(ctx, X(Math.max(-lim, Math.min(lim, v))), base - 9, 5.5, TD.brand); ctx.globalAlpha = 1; });
    }
    return {
        key: 'zscore', scenes, draw,
        title: 'Watch it explained',
        hint: 'A short animation with a narrator: a point moves along the normal curve to the z-scores of your smallest and largest values while the area to its left fills in. Use the numbered buttons to replay one step.',
        description: `Animated standard normal curve. The point moves to z = ${f(+zmin.toFixed(2))} (your smallest value) where ${pct(Phi(zmin))} of the area is to its left, then to z = ${f(+zmax.toFixed(2))} (your largest) where ${pct(Phi(zmax))} is.`,
        poster: scenes[scenes.length - 1].line
    };
}

function showZScoreAnimation(areaId, numbers) {
    const def = zScoreTutorDef(numbers);
    if (!def) { hideTutorCard('zscore'); return; }
    mountTutorCard(areaId, def);
}
