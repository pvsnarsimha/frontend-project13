// Animated, narrated explanation of a hypothesis test (the tutor player is js/core/tutor.js). It reuses the numbers the test chart already
// has (distribution, critical values, statistic) and tells the story in five scenes:
//   1 the curve if H0 is true -> 2 the rejection region shades in -> 3 your statistic drops onto the curve
//   -> 4 the p-value area -> 5 the verdict: inside the shaded tail = reject, outside = fail to reject.
// The narration is built from the real result (no canned text, nothing sent to a server), so it always agrees with the answer tile.

const tutorBounce = p => {
    const n = 7.5625, d = 2.75;
    if (p < 1 / d) return n * p * p;
    if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
    if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
    return n * (p -= 2.625 / d) * p + 0.984375;
};

// tail probability beyond the statistic, the way the chart shades it
function tutorPValue(spec, d, params) {
    const lowerTail = d.cdf(spec.stat, params), upperTail = 1 - lowerTail;
    if (spec.alternative === 'greater') return upperTail;
    if (spec.alternative === 'less') return lowerTail;
    return Math.min(1, 2 * Math.min(lowerTail, upperTail));
}

const tutorFmtP = p => (p < 0.0001 ? 'less than 0.0001' : p.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''));

// The five scenes (title, caption/spoken line, minimum drawing time) for a chart spec. Pure: no drawing, so it can be tested.
function hypothesisTutorScenes(spec, cfg) {
    const { d, params } = testDistributionSpec(spec);
    const label = spec.statLabel || 'test statistic';
    const valueWord = /^[A-Za-zχ²]{1,3}$/.test(label) ? `${label}-value` : 'test statistic';
    const alpha = Number.isFinite(spec.alpha) ? spec.alpha : null;
    const lower = spec.critical && Number.isFinite(spec.critical.lower) ? spec.critical.lower : null;
    const upper = spec.critical && Number.isFinite(spec.critical.upper) ? spec.critical.upper : null;
    const p = tutorPValue(spec, d, params);
    const inReject = (lower !== null && spec.stat <= lower) || (upper !== null && spec.stat >= upper);
    const reject = lower === null && upper === null ? (alpha !== null && p < alpha) : inReject;
    const pct = v => `${+(v * 100).toPrecision(3)}%`;
    const side = lower !== null && upper !== null ? 'two-sided' : (upper !== null ? 'upper' : 'lower');
    let region;
    if (lower === null && upper === null) region = 'This test has no fixed cut-off on the curve, so we will judge it by the p-value, the area beyond your statistic.';
    else if (side === 'two-sided') region = `We chose α = ${alpha}, so the most extreme ${pct(alpha)} of the curve, ${pct(alpha / 2)} in each tail, is the rejection region, shaded red. Its cut-offs are ${fmtChartNum(lower)} and ${fmtChartNum(upper)}.`;
    else region = `We chose α = ${alpha}, so the most extreme ${pct(alpha)} in the ${side} tail is the rejection region, shaded red. Its cut-off is ${fmtChartNum(side === 'upper' ? upper : lower)}.`;
    const pLine = `The amber area beyond it is the p-value, ${tutorFmtP(p)}: how often a result this extreme turns up if H₀ is true.` +
        (alpha !== null ? ` That is ${p < alpha ? 'smaller' : 'not smaller'} than α = ${alpha}.` : '');
    return [
        { id: 'curve', title: 'If H₀ is true', ms: 2200, line: `If H₀ is true, the ${label} follows this curve. Most results land near the middle; extreme values are rare.` },
        { id: 'region', title: 'The rejection region', ms: 2000, line: region },
        { id: 'drop', title: 'Your statistic', ms: 1800, line: `Now we drop your ${label} = ${fmtChartNum(spec.stat)} onto the curve.` },
        { id: 'pvalue', title: 'The p-value', ms: 1600, line: pLine },
        { id: 'verdict', title: reject ? 'Reject H₀' : 'Fail to reject H₀', ms: 1800,
          line: reject ? `Your ${valueWord} fell in the shaded tail, so we reject H₀.`
              : `Your ${valueWord} fell outside the shaded region, so we fail to reject H₀. That is not the same as proving H₀ true.` }
    ].map(s => Object.assign(s, { reject }));
}

function tutorNiceStep(span) {
    const raw = span / 6, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag;
}

function hypothesisTutorDef(spec) {
    if (!spec || spec.kind === 'binomial') return null;
    const cfg = buildTestChart(spec);
    if (!cfg) return null;
    const scenes = hypothesisTutorScenes(spec, cfg), reject = scenes[0].reject;
    const lower = spec.critical && Number.isFinite(spec.critical.lower) ? spec.critical.lower : null;
    const upper = spec.critical && Number.isFinite(spec.critical.upper) ? spec.critical.upper : null;
    const fn = cfg.fn, lo = cfg.lo, hi = cfg.hi;
    let peak = 0;
    for (let i = 0; i <= 200; i++) peak = Math.max(peak, fn(lo + (hi - lo) * i / 200) || 0);
    const tails = [];                       // regions to shade in red
    if (lower !== null) tails.push([lo, lower]);
    if (upper !== null) tails.push([upper, hi]);
    const pTails = cfg.shades.filter(s => s.top).map(s => [Math.max(s.from, lo), Math.min(s.to, hi)]).filter(r => r[1] > r[0]);
    const verdictColor = reject ? '#b91c1c' : '#166534';
    const verdictText = reject ? 'REJECT H₀' : 'FAIL TO REJECT H₀';
    const statText = `${spec.statLabel || 'statistic'} = ${fmtChartNum(spec.stat)}`;

    function draw(ctx, W, H, at) {
        const m = { l: 44, r: 16, t: 40, b: 38 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
        const X = x => m.l + (x - lo) / (hi - lo) * pw, Y = y => m.t + ph - (y / (peak * 1.1)) * ph;
        const P = id => at.prog(scenes.findIndex(s => s.id === id));
        const font = (px, w) => `${w || 500} ${px}px Inter, system-ui, sans-serif`;
        const path = (a, b, scale) => {           // closed region under the curve between a and b (height scaled by `scale`)
            const steps = 90;
            ctx.beginPath(); ctx.moveTo(X(a), Y(0));
            for (let i = 0; i <= steps; i++) { const x = a + (b - a) * i / steps; ctx.lineTo(X(x), Y(fn(x) * scale)); }
            ctx.lineTo(X(b), Y(0)); ctx.closePath();
        };
        // axis + ticks
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m.l, Y(0)); ctx.lineTo(m.l + pw, Y(0)); ctx.stroke();
        ctx.fillStyle = '#334155'; ctx.font = font(12); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        const step = tutorNiceStep(hi - lo);
        for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
            const x = X(v); ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x, Y(0) + 5); ctx.stroke();
            ctx.fillText(fmtChartNum(+v.toFixed(6)), x, Y(0) + 8);
        }
        ctx.fillText(spec.statLabel || 'Test statistic', m.l + pw / 2, H - 16);
        // 1: the curve draws from left to right
        const c = P('curve');
        if (c > 0) {
            const xEnd = lo + (hi - lo) * c;
            ctx.save(); ctx.beginPath(); ctx.rect(m.l - 2, 0, X(xEnd) - m.l + 2, H); ctx.clip();
            path(lo, hi, 1); ctx.fillStyle = 'rgba(26, 84, 144, 0.08)'; ctx.fill();
            ctx.restore();
            ctx.strokeStyle = STAT_CHART_COLORS.curve; ctx.lineWidth = 2.6; ctx.beginPath();
            for (let i = 0; i <= 240; i++) { const x = lo + (hi - lo) * Math.min(c, i / 240); const px = X(x), py = Y(fn(x)); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
            ctx.stroke();
        }
        // 2: rejection tails rise from the axis and fade in; dashed cut-off lines grow
        const r = tutorEase(P('region'));
        const pulse = at.scene === scenes.length - 1 && reject ? 0.55 + 0.45 * Math.sin(at.t / 180) : 1;
        if (r > 0) {
            tails.forEach(([a, b]) => { path(a, b, r); ctx.fillStyle = `rgba(220, 38, 38, ${0.42 * r * pulse})`; ctx.fill(); });
            ctx.setLineDash([6, 4]); ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 2;
            [lower, upper].filter(v => v !== null).forEach(v => { ctx.beginPath(); ctx.moveTo(X(v), Y(0)); ctx.lineTo(X(v), Y(0) - (Y(0) - Y(Math.min(fn(v), peak))) * r); ctx.stroke(); });
            ctx.setLineDash([]);
        }
        // 4: p-value area (amber), drawn over the tail the statistic cuts off
        const pa = tutorEase(P('pvalue'));
        if (pa > 0) pTails.forEach(([a, b]) => { path(a, b, 1); ctx.fillStyle = `rgba(245, 158, 11, ${0.55 * pa})`; ctx.fill(); });
        // 3: the statistic drops onto the curve with a small bounce
        const d = P('drop');
        if (d > 0) {
            const yEnd = Y(Math.min(fn(spec.stat), peak)), yStart = m.t - 16, yNow = yStart + (yEnd - yStart) * tutorBounce(Math.min(1, d));
            const x = X(spec.stat), landed = d >= 1;
            const col = at.scene === scenes.length - 1 ? verdictColor : '#111827';
            if (landed || d > 0.6) { ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x, yNow); ctx.stroke(); }
            ctx.beginPath(); ctx.arc(x, yNow, 9, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
            if (landed) {
                ctx.font = font(13, 700); ctx.fillStyle = '#111827'; ctx.textAlign = x > m.l + pw * 0.8 ? 'right' : (x < m.l + pw * 0.2 ? 'left' : 'center');
                ctx.textBaseline = 'bottom';
                const lx2 = x + (ctx.textAlign === 'right' ? 12 : (ctx.textAlign === 'left' ? -12 : 0));
                ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.strokeText(statText, lx2, yNow - 14);   // white halo keeps the label readable over the curve
                ctx.fillText(statText, lx2, yNow - 14);
            }
        }
        // legend of what the colours mean, appearing with the scenes that introduce them
        ctx.font = font(12, 600); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let lx = m.l;
        const legend = (on, color, text) => { if (on <= 0) return; ctx.globalAlpha = Math.min(1, on * 2); ctx.fillStyle = color; ctx.fillRect(lx, 11, 12, 12); ctx.fillStyle = '#1f2937'; ctx.fillText(text, lx + 17, 17); lx += 30 + ctx.measureText(text).width; ctx.globalAlpha = 1; };
        legend(tails.length ? r : 0, 'rgba(220, 38, 38, 0.6)', `Rejection region${Number.isFinite(spec.alpha) ? ` (α = ${spec.alpha})` : ''}`);
        legend(pa, 'rgba(245, 158, 11, 0.8)', 'p-value area');
        // 5: the verdict badge pops in
        const v = tutorEase(P('verdict'));
        if (v > 0) {
            ctx.font = font(15, 800);
            const tw = ctx.measureText(verdictText).width + 36;
            // on the side of the curve away from your statistic, so the badge never covers the marker
            const side2 = spec.stat < (lo + hi) / 2 ? 0.74 : 0.26;
            const bx = Math.max(m.l + tw / 2, Math.min(m.l + pw - tw / 2, m.l + pw * side2));
            ctx.save(); ctx.translate(bx, m.t + ph * 0.3); ctx.scale(0.7 + 0.3 * v, 0.7 + 0.3 * v); ctx.globalAlpha = v;
            ctx.fillStyle = verdictColor; ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(-tw / 2, -18, tw, 36, 18); else ctx.rect(-tw / 2, -18, tw, 36);
            ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(verdictText, 0, 1);
            ctx.restore();
        }
    }
    return {
        key: 'test', scenes, draw,
        title: 'Watch it explained',
        hint: 'A short animation with a narrator: the curve if H₀ is true, the rejection region, where your statistic lands, and the verdict. Use the numbered buttons to replay one step.',
        description: `${cfg.description} Animated: the curve, the red rejection region, the test statistic dropping onto the curve, the amber p-value area, then the verdict "${reject ? 'reject' : 'fail to reject'} H zero".`,
        poster: scenes[scenes.length - 1].line
    };
}

// Called by showTestChart after it draws the static chart; adds (or refreshes) the animation card under it.
function showTestAnimation(areaId, spec) {
    const def = hypothesisTutorDef(spec);
    if (!def) { hideTutorCard('test'); return; }
    mountTutorCard(areaId, def);
}
