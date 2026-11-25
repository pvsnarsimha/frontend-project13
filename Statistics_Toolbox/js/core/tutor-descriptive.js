// Narrated animation for the mean and the standard deviation (player: js/core/tutor.js).
// The same picture serves both tools: dots slide onto a number line, the mean balances them like a seesaw, and (standard deviation only)
// deviation arrows grow, are squared into boxes, and the boxes become the variance and the SD. The narration uses the user's own numbers.

const TUTOR_MAX_DOTS = 15;       // more dots than this are too small to follow one by one

function meanSdScenes(nums, variant) {
    const n = nums.length, mean = nums.reduce((a, b) => a + b, 0) / n, sum = nums.reduce((a, b) => a + b, 0);
    const ss = nums.reduce((a, b) => a + (b - mean) ** 2, 0), variance = ss / (n - 1), sd = Math.sqrt(variance);
    const f = fmtChartNum;
    const scenes = [
        { id: 'dots', title: 'Your data', ms: 2400, line: `Here are your ${n} data points, sliding onto a number line.` },
        { id: 'balance', title: 'The mean', ms: 2400, line: `Add them up (${f(sum)}) and divide by ${n}: the mean is ${f(mean)}. It is the balance point, where a seesaw holding your points sits level.` }
    ];
    if (variant === 'sd') scenes.push(
        { id: 'dev', title: 'Distances from the mean', ms: 2400, line: 'Now we measure how far each point is from the mean.' },
        { id: 'square', title: 'Squaring the distances', ms: 2400, line: `Each distance is squared into a box, so every box is positive. The box areas add up to ${f(ss)}.` },
        { id: 'sd', title: 'Variance and SD', ms: 2000, line: `Divide by n − 1 = ${n - 1} to get the variance, ${f(variance)}. Its square root is the standard deviation: s = ${f(sd)}.` });
    return { scenes, mean, sum, ss, variance, sd };
}

function meanSdTutorDef(numbers, variant) {
    const nums = (numbers || []).filter(Number.isFinite);
    if (nums.length < 2 || nums.length > TUTOR_MAX_DOTS) return null;
    const { scenes, mean, ss, variance, sd } = meanSdScenes(nums, variant);
    const n = nums.length, sorted = [...nums].sort((a, b) => a - b);
    const lo0 = Math.min(sorted[0], mean), hi0 = Math.max(sorted[n - 1], mean), pad = (hi0 - lo0) * 0.08 || 1, lo = lo0 - pad, hi = hi0 + pad;
    const hasDev = variant === 'sd';

    function draw(ctx, W, H, at) {
        const m = { l: 26, r: 26, t: 34, b: 46 };
        const X = v => m.l + (v - lo) / (hi - lo) * (W - m.l - m.r), base = H - m.b, plankY = base - 52;
        const P = id => { const k = scenes.findIndex(s => s.id === id); return k < 0 ? 0 : at.prog(k); };
        const d = P('dots'), bal = tutorEase(P('balance')), dev = tutorEase(P('dev')), sq = tutorEase(P('square')), fin = tutorEase(P('sd'));
        const fade = 1 - sq;                                   // axis, dots and arrows fade as the boxes take over
        // stacking: dots that would overlap sit on top of each other
        const stack = [], placed = [];
        sorted.forEach((v, i) => { const x = X(v); stack[i] = placed.filter(px => Math.abs(px - x) < 13).length; placed.push(x); });
        ctx.globalAlpha = Math.max(0.0001, fade);
        TD.axisX(ctx, X, lo, hi, base);
        // the seesaw: plank and fulcrum appear in scene 2 and wobble level
        const theta = bal > 0 ? 0.2 * (1 - bal) * Math.cos(bal * 11) : 0;
        if (bal > 0 && dev < 1) {
            ctx.globalAlpha = Math.max(0.0001, fade) * Math.min(1, bal * 3) * (1 - dev);
            ctx.beginPath(); ctx.moveTo(X(mean), plankY + 3); ctx.lineTo(X(mean) - 16, plankY + 34); ctx.lineTo(X(mean) + 16, plankY + 34); ctx.closePath(); ctx.fillStyle = TD.amber; ctx.fill();
            ctx.save(); ctx.translate(X(mean), plankY); ctx.rotate(theta); TD.line(ctx, m.l - X(mean), 0, W - m.r - X(mean), 0, '#475569', 5); ctx.restore();
            ctx.globalAlpha = Math.max(0.0001, fade);
        }
        // dots: fall onto the line, ride the plank, then line up in rows for the distances
        const rowTop = m.t + 40, gap = Math.min(22, (base - 34 - rowTop) / n);
        sorted.forEach((v, i) => {
            const x = X(v), delay = i / (n + 2), local = Math.max(0, Math.min(1, (d - delay) * (n + 2) / 2.2));
            if (local <= 0) return;
            const restAxis = base - 10 - stack[i] * 15;
            const onPlank = plankY - 9 - stack[i] * 15 + (x - X(mean)) * Math.tan(theta);
            const y0 = TD.lerp(m.t - 6, restAxis, tutorBounce(local));
            const y1 = TD.lerp(y0, onPlank, bal);
            const y = TD.lerp(y1, rowTop + i * gap, dev);
            ctx.globalAlpha = Math.max(0.0001, fade);
            TD.dot(ctx, x, y, 6.5, TD.brand);
            if (dev > 0) {                                     // deviation arrow from the dot to the mean, growing
                const dx = X(mean) - x;
                if (Math.abs(dx) > 1) {
                    const col = dx > 0 ? TD.blue : TD.red, len = dx * dev;
                    TD.arrow(ctx, x + Math.sign(dx) * 7, y, x + len - Math.sign(dx) * 2, y, col, 2.4);
                    if (gap >= 15 && dev > 0.9) TD.text(ctx, (v - mean > 0 ? '+' : '') + f2(v - mean), x + len / 2, y - 8, { s: 10, w: 700, c: col });
                }
            }
        });
        ctx.globalAlpha = Math.max(0.0001, fade);
        // the mean marker
        if (bal > 0) {
            const a = Math.min(1, bal * 2);
            ctx.globalAlpha = a * Math.max(0.0001, fade);
            TD.line(ctx, X(mean), m.t + 18, X(mean), base, TD.amber, 2, [5, 4]);
            TD.pill(ctx, `mean = ${fmtChartNum(mean)}`, X(mean), m.t + 4, TD.amber, '#111827', 13);
        }
        ctx.globalAlpha = 1;
        // squares: one box per point, side = distance, sitting side by side
        if (sq > 0) {
            const gapPx = 8, avail = W - m.l - m.r - gapPx * (n - 1), sumAbs = sorted.reduce((a, v) => a + Math.abs(v - mean), 0) || 1;
            const k = Math.min(avail / sumAbs, (base + 6 - (m.t + (hasDev ? 84 : 44))) / (Math.max(...sorted.map(v => Math.abs(v - mean))) || 1));
            let x = m.l; const yb = base + 6;
            sorted.forEach(v => {
                const dd = v - mean, side = Math.abs(dd) * k * sq, w = Math.max(side, 6);
                if (side > 0.5) {
                    ctx.fillStyle = dd < 0 ? 'rgba(37,99,235,.35)' : 'rgba(220,38,38,.35)'; ctx.fillRect(x, yb - side, side, side);
                    ctx.strokeStyle = dd < 0 ? TD.blue : TD.red; ctx.lineWidth = 2; ctx.strokeRect(x, yb - side, side, side);
                    if (side > 30 && sq > 0.9) TD.text(ctx, f2(dd * dd), x + side / 2, yb - side / 2, { s: 12, w: 800 });
                }
                x += w + gapPx;
            });
            TD.text(ctx, `Σ(distance)² = ${fmtChartNum(ss)}`, W / 2, m.t + 6, { s: 13, w: 800, c: '#334155', halo: true });
        }
        if (fin > 0) {
            ctx.globalAlpha = fin;
            TD.text(ctx, `variance = ${fmtChartNum(ss)} ÷ ${n - 1} = ${fmtChartNum(variance)}`, W / 2, m.t + 30, { s: 13, w: 700, c: '#334155', halo: true });
            TD.pill(ctx, `s = √${fmtChartNum(variance)} = ${fmtChartNum(sd)}`, W / 2, m.t + 62, TD.brand, '#fff', 14);
            ctx.globalAlpha = 1;
        }
    }
    function f2(v) { return String(+v.toPrecision(3)); }
    return {
        key: 'meansd', scenes, draw,
        title: 'Watch it explained',
        hint: hasDev ? 'A short animation with a narrator: your points on a number line, the mean as a balance point, the distances squared into boxes, and the standard deviation. Use the numbered buttons to replay one step.'
                     : 'A short animation with a narrator: your points on a number line and the mean as their balance point. Use the numbered buttons to replay one step.',
        description: `Animated number line of your ${n} data points. The mean ${fmtChartNum(mean)} is shown as the balance point of a seesaw${hasDev ? `, the distances from the mean are squared into boxes adding up to ${fmtChartNum(ss)}, and the standard deviation is ${fmtChartNum(sd)}` : ''}.`,
        poster: scenes[scenes.length - 1].line
    };
}

// Called by the mean and standard deviation tools after they calculate (variant 'mean' | 'sd')
function showMeanSdAnimation(areaId, numbers, variant) {
    const def = meanSdTutorDef(numbers, variant === 'sd' ? 'sd' : 'mean');
    if (!def) { hideTutorCard('meansd'); return; }
    mountTutorCard(areaId, def);
}
