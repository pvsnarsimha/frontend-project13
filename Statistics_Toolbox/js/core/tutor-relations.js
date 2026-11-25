// Narrated animations for the two-variable tools (player: js/core/tutor.js):
//   correlation: a slider moves r from 0 to +1, through 0 to -1, and then to the user's own r while the scatter points follow;
//   regression:  residual squares form on a flat line, which then pivots until their total area is as small as possible.
// Both use the user's own numbers in the narration.

function tutorPearson(x, y) {
    const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
    return { n, mx, my, sxx, syy, sxy, r: sxy / Math.sqrt(sxx * syy) };
}
function tutorStrength(r) { const a = Math.abs(r); return a >= 0.9 ? 'very strong' : a >= 0.7 ? 'strong' : a >= 0.4 ? 'moderate' : a >= 0.2 ? 'weak' : 'very weak'; }

// 40 fixed points whose x and "noise" are exactly uncorrelated, so r * x + sqrt(1 - r^2) * noise has correlation exactly r
const tutorDemoCloud = (() => {
    const R = TD.rng(7), n = 40, gauss = () => Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(2 * Math.PI * R());
    const x = Array.from({ length: n }, gauss), e = Array.from({ length: n }, gauss);
    const mean = a => a.reduce((s, v) => s + v, 0) / a.length, sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length); };
    const mx = mean(x), sx = sd(x), xs = x.map(v => (v - mx) / sx), me = mean(e);
    let ee = e.map(v => v - me); const dp = ee.reduce((s, v, i) => s + v * xs[i], 0) / n; ee = ee.map((v, i) => v - dp * xs[i]);
    const se = sd(ee); ee = ee.map(v => v / se);
    return { xs, ee, at: r => xs.map((v, i) => [v, r * v + Math.sqrt(Math.max(0, 1 - r * r)) * ee[i]]) };
})();

function correlationTutorDef(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 3 || !x.every(Number.isFinite) || !y.every(Number.isFinite)) return null;
    const st = tutorPearson(x, y);
    if (!Number.isFinite(st.r)) return null;
    const r = st.r, f = fmtChartNum, rtxt = (+r.toFixed(4)).toString();
    const zx = x.map(v => (v - st.mx) / Math.sqrt(st.sxx / st.n)), zy = y.map(v => (v - st.my) / Math.sqrt(st.syy / st.n));
    const scenes = [
        { id: 'zero', title: 'No relationship', ms: 2200, line: 'When there is no straight-line relationship, r = 0 and the points form a shapeless cloud.' },
        { id: 'up', title: 'r towards +1', ms: 2800, line: 'Slide r towards +1 and watch the points line up, rising together: as x goes up, y goes up.' },
        { id: 'down', title: 'r towards −1', ms: 3000, line: 'Slide back through 0 and on towards −1: the points line up again, but now falling: as x goes up, y goes down.' },
        { id: 'yours', title: 'Your data', ms: 2800, line: `Now your data. Its correlation is r = ${rtxt}: a ${tutorStrength(r)} ${r >= 0 ? 'positive' : 'negative'} straight-line relationship.` }
    ];
    function draw(ctx, W, H, at) {
        const m = { l: 34, r: 16, t: 38, b: 64 }, base = H - m.b, top = m.t, lim = Math.max(3, ...zx.map(Math.abs), ...zy.map(Math.abs)) * 1.05;
        const X = v => m.l + (v + lim) / (2 * lim) * (W - m.l - m.r), Y = v => base - (v + lim) / (2 * lim) * (base - top);
        const P = id => at.prog(scenes.findIndex(s => s.id === id));
        const e0 = tutorEase(P('zero')), eUp = tutorEase(P('up')), eDown = tutorEase(P('down')), eYou = tutorEase(P('yours'));
        let rr = 0;
        if (eYou > 0) rr = TD.lerp(-0.95, r, eYou); else if (eDown > 0) rr = TD.lerp(0.95, -0.95, eDown); else rr = TD.lerp(0, 0.95, eUp);
        TD.line(ctx, m.l, base, W - m.r, base, TD.axis, 1.2); TD.line(ctx, m.l, top, m.l, base, TD.axis, 1.2);
        TD.line(ctx, m.l, Y(0), W - m.r, Y(0), '#e2e8f0', 1); TD.line(ctx, X(0), top, X(0), base, '#e2e8f0', 1);
        const own = Math.max(0, Math.min(1, (eYou - 0.55) / 0.45));        // the demo cloud gives way to the user's own points at the end
        ctx.save(); ctx.beginPath(); ctx.rect(m.l, top, W - m.l - m.r, base - top); ctx.clip();
        TD.line(ctx, X(-lim), Y(-lim * rr), X(lim), Y(lim * rr), 'rgba(220, 38, 38, 0.55)', 2, [6, 4]);
        const pts = tutorDemoCloud.at(rr);
        pts.forEach(([a, b], i) => { ctx.globalAlpha = Math.min(1, e0 * 1.5 - i / pts.length * 0.5) * (1 - own); if (ctx.globalAlpha > 0) TD.dot(ctx, X(a), Y(b), 4.6, 'rgba(67, 56, 202, 0.7)', false); });
        zx.forEach((a, i) => { ctx.globalAlpha = own; if (own > 0) TD.dot(ctx, X(a), Y(zy[i]), 5.5, TD.brand); });
        ctx.restore(); ctx.globalAlpha = 1;
        // the slider
        const sx0 = m.l + 24, sx1 = W - m.r - 24, sy = H - 26, kx = sx0 + (rr + 1) / 2 * (sx1 - sx0);
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(sx0, sy - 4, sx1 - sx0, 8, 4); else ctx.rect(sx0, sy - 4, sx1 - sx0, 8); ctx.fill();
        ctx.fillStyle = '#c7d2fe'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(sx0, sy - 4, kx - sx0, 8, 4); else ctx.rect(sx0, sy - 4, kx - sx0, 8); ctx.fill();
        TD.dot(ctx, kx, sy, 11, TD.brand); TD.text(ctx, '−1', sx0 - 14, sy, { s: 12, c: TD.mute, w: 700 }); TD.text(ctx, '+1', sx1 + 14, sy, { s: 12, c: TD.mute, w: 700 });
        TD.readout(ctx, `r = ${rr < -0.005 ? '−' : (rr > 0.005 ? '+' : '')}${Math.abs(rr).toFixed(2)}`, W - 10, 18);
        if (own > 0.5) TD.text(ctx, 'your data', m.l + 6, top + 4, { s: 12, w: 800, c: TD.brand, a: 'left', halo: true });
    }
    return {
        key: 'corr', scenes, draw,
        title: 'Watch it explained',
        hint: 'A short animation with a narrator: a slider moves r and the scatter points follow, ending with your own data. Use the numbered buttons to replay one step.',
        description: `Animated scatter plot. A slider moves the correlation r from 0 to +1, to −1 and finally to your data's r = ${rtxt}, and the points line up accordingly.`,
        poster: scenes[scenes.length - 1].line
    };
}

function showCorrelationAnimation(areaId, x, y) {
    const def = correlationTutorDef(x, y);
    if (!def) { hideTutorCard('corr'); return; }
    mountTutorCard(areaId, def);
}

// ---------------- regression: least squares ----------------
function regressionTutorDef(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 3 || x.length > 40 || !x.every(Number.isFinite) || !y.every(Number.isFinite)) return null;
    const st = tutorPearson(x, y), n = st.n;
    if (!(st.sxx > 0) || !(st.syy > 0)) return null;
    const b = st.sxy / st.sxx, a = st.my - b * st.mx, f = fmtChartNum;
    const sse = s => x.reduce((t, xi, i) => t + (y[i] - (st.my + s * (xi - st.mx))) ** 2, 0);      // line pivoting on the mean point with slope s
    const sse0 = sse(0), sseBest = sse(b);
    const scenes = [
        { id: 'line', title: 'A first guess', ms: 2200, line: `Here are your ${n} points and a first guess: a flat line at the mean of y, ${f(+st.my.toFixed(4))}.` },
        { id: 'resid', title: 'Residuals', ms: 2200, line: 'Each point misses the line by some distance. That gap is its residual.' },
        { id: 'squares', title: 'Squares', ms: 2400, line: `Over every residual we build a square. Big misses make big squares. Their total area is ${f(+sse0.toFixed(4))}.` },
        { id: 'rotate', title: 'The best line', ms: 3600, line: `Now the line pivots on the mean point. The best line, with slope ${f(+b.toFixed(4))}, makes these squares as small as possible: their total area falls to ${f(+sseBest.toFixed(4))}.` }
    ];
    const xlo0 = Math.min(...x), xhi0 = Math.max(...x), ylo0 = Math.min(...y), yhi0 = Math.max(...y);
    const xp = (xhi0 - xlo0) * 0.06 || 1, yp = (yhi0 - ylo0) * 0.12 || 1, xlo = xlo0 - xp, xhi = xhi0 + xp, ylo = ylo0 - yp, yhi = yhi0 + yp;
    function draw(ctx, W, H, at) {
        const m = { l: 34, r: 18, t: 38, b: 44 }, base = H - m.b, top = m.t;
        const X = v => m.l + (v - xlo) / (xhi - xlo) * (W - m.l - m.r), Y = v => base - (v - ylo) / (yhi - ylo) * (base - top), ppu = (base - top) / (yhi - ylo);
        const P = id => at.prog(scenes.findIndex(s => s.id === id));
        const pts = tutorEase(P('line')), eRes = tutorEase(P('resid')), eSq = tutorEase(P('squares')), eRot = tutorEase(P('rotate'));
        const s = b * eRot, yHat = xv => st.my + s * (xv - st.mx);
        TD.axisX(ctx, X, xlo, xhi, base); TD.line(ctx, m.l, top, m.l, base, TD.axis, 1.2);
        ctx.save(); ctx.beginPath(); ctx.rect(m.l, top - 4, W - m.l - m.r, base - top + 4); ctx.clip();
        x.forEach((xv, i) => {
            const res = y[i] - yHat(xv), py1 = Y(yHat(xv)), py2 = Y(y[i]), px = X(xv);
            if (eSq > 0) {                                                    // the square sits beside the residual, on the side with room
                const side = Math.abs(res) * ppu * eSq, dir = px + side > W - m.r ? -1 : 1;
                ctx.fillStyle = 'rgba(245, 158, 11, 0.38)'; ctx.fillRect(dir > 0 ? px : px - side, Math.min(py1, py2), side, side);
                ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1.5; ctx.strokeRect(dir > 0 ? px : px - side, Math.min(py1, py2), side, side);
            }
            if (eRes > 0) TD.line(ctx, px, py1, px, TD.lerp(py1, py2, eRes), '#b45309', 2.4);
        });
        TD.line(ctx, X(xlo), Y(yHat(xlo)), X(xhi), Y(yHat(xhi)), TD.red, 3);
        if (eRot > 0 && eRot < 1) TD.line(ctx, X(xlo), Y(st.my), X(xhi), Y(st.my), 'rgba(220, 38, 38, 0.22)', 2, [5, 4]);   // where it started
        ctx.restore();
        x.forEach((xv, i) => { ctx.globalAlpha = Math.min(1, pts * 2 - i / n); if (ctx.globalAlpha > 0) TD.dot(ctx, X(xv), Y(y[i]), 5.5, TD.brand); });
        ctx.globalAlpha = 1;
        TD.dot(ctx, X(st.mx), Y(st.my), 4, TD.amber);
        if (eSq > 0) { TD.readout(ctx, `Total square area = ${f(+sse(s).toFixed(3))}`, W - 10, 18); }
        else TD.text(ctx, 'residual = actual − predicted', W - 12, 18, { s: 12, w: 700, c: TD.mute, a: 'right' });
    }
    return {
        key: 'regress', scenes, draw,
        title: 'Watch it explained',
        hint: 'A short animation with a narrator: squares form on the residuals, and the line pivots until their total area is as small as possible. Use the numbered buttons to replay one step.',
        description: `Animated scatter plot of your ${n} points. Squares form on each residual of a flat line (total area ${f(+sse0.toFixed(2))}), then the line pivots to the least-squares line y = ${f(+a.toFixed(4))} + ${f(+b.toFixed(4))}x, where the total square area is smallest (${f(+sseBest.toFixed(2))}).`,
        poster: scenes[scenes.length - 1].line
    };
}

function showRegressionAnimation(areaId, x, y) {
    const def = regressionTutorDef(x, y);
    if (!def) { hideTutorCard('regress'); return; }
    mountTutorCard(areaId, def);
}
