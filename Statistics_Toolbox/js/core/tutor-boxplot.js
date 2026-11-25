// Narrated animation for the box plot (player: js/core/tutor.js): the values arrive in the order they were collected, sort themselves,
// Q1, the median and Q3 cut them into four parts, they settle onto a number line under a box, and the whiskers stretch out. Uses the
// numbers the box plot tool calculated, so the narration always matches its result.

function boxplotTutorDef(numbers, r) {
    const nums = (numbers || []).filter(Number.isFinite), n = nums.length;
    if (n < 4 || n > TUTOR_MAX_DOTS || !r || r.error) return null;
    const f = fmtChartNum, fx = v => f(+(+v).toPrecision(5));
    const nOut = r.outliers.length;
    const scenes = [
        { id: 'order', title: 'Your values', ms: 1800, line: `Here are your ${n} values, in the order they were collected.` },
        { id: 'sort', title: 'Sort', ms: 2200, line: 'First we sort the values from smallest to largest.' },
        { id: 'cut', title: 'Cut in four', ms: 2400, line: `Then we cut the data into four equal parts: Q1 = ${fx(r.q1)}, the median = ${fx(r.median)} and Q3 = ${fx(r.q3)}.` },
        { id: 'box', title: 'The box', ms: 2400, line: `On a number line, the box runs from Q1 to Q3, with the median inside it. The middle half of the data is in the box, and its width is the IQR, ${fx(r.iqr)}.` },
        { id: 'whisk', title: 'The whiskers', ms: 2600, line: `The whiskers stretch to the smallest and largest values that are not outliers: ${fx(r.whiskerMin)} and ${fx(r.whiskerMax)}. ` +
            (nOut ? `${nOut === 1 ? 'One value lies' : nOut + ' values lie'} beyond the fences (${fx(r.lowerBound)} and ${fx(r.upperBound)}), so ${nOut === 1 ? 'it is' : 'they are'} drawn as ${nOut === 1 ? 'an outlier' : 'outliers'}.` : 'No value lies beyond the fences, so there are no outliers.') }
    ];
    const order = nums.map((v, i) => i).sort((a, b) => nums[a] - nums[b] || a - b), rank = []; order.forEach((orig, j) => { rank[orig] = j; });
    const lo0 = Math.min(...nums), hi0 = Math.max(...nums), pad = (hi0 - lo0) * 0.08 || 1, lo = lo0 - pad, hi = hi0 + pad;

    function draw(ctx, W, H, at) {
        const m = { l: 24, r: 24, t: 24, b: 50 }, base = H - m.b;
        const P = id => at.prog(scenes.findIndex(s => s.id === id));
        const pOrder = P('order'), eSort = tutorEase(P('sort')), pCut = P('cut'), eBox = tutorEase(P('box')), eWhisk = tutorEase(P('whisk'));
        const inner = W - m.l - m.r, tw = Math.min(36, inner / n - 4), slot = j => m.l + (j + 0.5) * inner / n;
        const X = v => m.l + (v - lo) / (hi - lo) * inner, rowY = m.t + 54, laneY = base - 14;
        if (eBox > 0) { ctx.globalAlpha = eBox; TD.axisX(ctx, X, lo, hi, base); ctx.globalAlpha = 1; }
        // the box and whiskers
        const y0 = base - 86, y1 = base - 40, ym = (y0 + y1) / 2;
        if (eBox > 0) {
            const bl = TD.lerp(r.median, r.q1, eBox), br = TD.lerp(r.median, r.q3, eBox);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.25)'; ctx.fillRect(X(bl), y0, X(br) - X(bl), y1 - y0);
            ctx.strokeStyle = TD.brand; ctx.lineWidth = 2.5; ctx.strokeRect(X(bl), y0, X(br) - X(bl), y1 - y0);
            TD.line(ctx, X(r.median), y0, X(r.median), y1, TD.red, 3.5);
            if (eBox > 0.9) {
                TD.text(ctx, `Q1 ${fx(r.q1)}`, X(r.q1), y0 - 10, { s: 11, w: 800 }); TD.text(ctx, `Q3 ${fx(r.q3)}`, X(r.q3), y0 - 10, { s: 11, w: 800 });
                TD.text(ctx, `median ${fx(r.median)}`, X(r.median), y1 + 12, { s: 11, w: 800, c: TD.redDark, halo: true });
            }
        }
        if (eWhisk > 0) {
            const wl = TD.lerp(r.q1, r.whiskerMin, eWhisk), wr = TD.lerp(r.q3, r.whiskerMax, eWhisk);
            TD.line(ctx, X(wl), ym, X(r.q1), ym, TD.brand, 2.5); TD.line(ctx, X(r.q3), ym, X(wr), ym, TD.brand, 2.5);
            TD.line(ctx, X(wl), ym - 9, X(wl), ym + 9, TD.brand, 2.5); TD.line(ctx, X(wr), ym - 9, X(wr), ym + 9, TD.brand, 2.5);
            if (eWhisk > 0.95) { TD.text(ctx, fx(r.whiskerMin), X(r.whiskerMin), ym - 18, { s: 11, w: 800 }); TD.text(ctx, fx(r.whiskerMax), X(r.whiskerMax), ym - 18, { s: 11, w: 800 }); }
        }
        // the values as tiles that become dots on the number line
        nums.forEach((v, i) => {
            const delay = i / (n + 1), local = Math.max(0, Math.min(1, (pOrder - delay) * (n + 1) / 1.5));
            if (local <= 0) return;
            const j = rank[i], sx = TD.lerp(slot(i), slot(j), eSort);
            const fromX = sx, toX = X(v), cx = TD.lerp(fromX, toX, eBox), cy = TD.lerp(rowY - (1 - tutorEase(local)) * 22, laneY - (j % 2) * 0, eBox);
            const w = TD.lerp(tw, 11, eBox), h = TD.lerp(30, 11, eBox);
            const q = j <= (n - 1) * 0.25 ? 0 : (j <= (n - 1) * 0.5 ? 1 : (j <= (n - 1) * 0.75 ? 2 : 3)), tints = ['#dbeafe', '#dcfce7', '#fef9c3', '#fee2e2'];
            const isOut = r.outliers.includes(v) && eWhisk > 0;
            ctx.globalAlpha = tutorEase(local);
            ctx.fillStyle = eBox > 0 ? (isOut ? TD.red : 'rgba(67,56,202,.6)') : (pCut > 0 ? tints[q] : '#eef2ff');
            ctx.strokeStyle = isOut ? TD.redDark : TD.brand; ctx.lineWidth = 1.5; ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(cx - w / 2, cy - h / 2, w, h, Math.min(w, h) / 2 * eBox + 6 * (1 - eBox)); else ctx.rect(cx - w / 2, cy - h / 2, w, h);
            ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
            if (eBox < 0.6 && tw >= 18) { ctx.globalAlpha = (1 - eBox / 0.6) * tutorEase(local); TD.text(ctx, f(+v.toPrecision(3)), cx, cy + 1, { s: tw >= 28 ? 13 : 10, w: 800 }); ctx.globalAlpha = 1; }
        });
        // the three cuts, dropping onto the sorted tiles
        const cuts = [['Q1', r.q1, (n - 1) * 0.25], ['median', r.median, (n - 1) * 0.5], ['Q3', r.q3, (n - 1) * 0.75]];
        const cutFade = 1 - eBox;
        if (pCut > 0 && cutFade > 0) cuts.forEach(([name, val, idx], k) => {
            const e = tutorEase(Math.max(0, Math.min(1, pCut * 3 - k * 0.8))), lo2 = Math.floor(idx), hi2 = Math.ceil(idx), x = TD.lerp(slot(lo2), slot(hi2), idx - lo2);
            ctx.globalAlpha = e * cutFade;
            TD.line(ctx, x, rowY - 52, x, rowY - 20 + 36 * e - 36, TD.red, 3);
            ctx.beginPath(); ctx.moveTo(x - 7, rowY - 28 + 22 * e - 22); ctx.lineTo(x + 7, rowY - 28 + 22 * e - 22); ctx.lineTo(x, rowY - 18 + 12 * e - 12 + 6); ctx.closePath(); ctx.fillStyle = TD.red; ctx.fill();
            TD.text(ctx, `${name} = ${fx(val)}`, x, rowY - 62, { s: 12, w: 800, c: TD.redDark });
            ctx.globalAlpha = 1;
        });
        if (eBox > 0.9) { ctx.globalAlpha = eBox; TD.line(ctx, X(r.q1), y0 - 28, X(r.q3), y0 - 28, TD.amber, 2.5); TD.text(ctx, `IQR = ${fx(r.iqr)}`, X((r.q1 + r.q3) / 2), y0 - 39, { s: 12, w: 800, c: '#92400e' }); ctx.globalAlpha = 1; }
    }
    return {
        key: 'boxplot', scenes, draw,
        title: 'Watch it explained',
        hint: 'A short animation with a narrator: your values sort themselves, Q1, the median and Q3 cut them into four parts, and the box and whiskers form. Use the numbered buttons to replay one step.',
        description: `Animated box plot of your ${n} values: sorted, cut at Q1 = ${fx(r.q1)}, median = ${fx(r.median)} and Q3 = ${fx(r.q3)}, then drawn as a box with whiskers from ${fx(r.whiskerMin)} to ${fx(r.whiskerMax)}${nOut ? ` and ${nOut} outlier${nOut === 1 ? '' : 's'}` : ''}.`,
        poster: scenes[scenes.length - 1].line
    };
}

function showBoxplotAnimation(areaId, numbers, result) {
    const def = boxplotTutorDef(numbers, result);
    if (!def) { hideTutorCard('boxplot'); return; }
    mountTutorCard(areaId, def);
}
