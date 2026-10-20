// Shared charts for the teaching graphs: a distribution curve with shaded regions (rejection region, p-value area, probability asked for),
// bar charts for discrete distributions, scatter plots with a fitted line, and residual plots. Tools call the show* functions after they
// calculate; every chart lives in a card appended to the tool's result area and is released when the tool changes (registerChart below).
// Chart.js is loaded on the first chart (chartJsReady), exactly like the other plotting tools.

const statChartInstances = new Map();      // chart key -> Chart instance
registerChart(() => ({ destroy() { statChartInstances.forEach(c => c.destroy()); statChartInstances.clear(); } }), () => {});

const STAT_CHART_COLORS = { curve: '#1a5490', reject: 'rgba(220, 38, 38, 0.38)', rejectLine: '#b91c1c', pvalue: 'rgba(245, 158, 11, 0.45)', stat: '#111827', shade: 'rgba(37, 99, 235, 0.38)', point: 'rgba(26, 84, 144, 0.75)', fit: '#dc2626', zero: '#6b7280' };

// ---- Cards ----
// Returns the canvas of the card `key` inside the result area `areaId`, creating the card on first use (null when there is no such area).
function statChartCard(areaId, key, title, hint) {
    const area = document.getElementById(areaId);
    if (!area || typeof area.appendChild !== 'function') return null;       // no real page (unit tests with a stub DOM)
    let card = document.getElementById('statChartCard-' + key);
    if (!card || typeof card.querySelector !== 'function') {
        card = document.createElement('div');
        card.id = 'statChartCard-' + key;
        card.className = 'stat-chart-card';
        setHtml(card, '<div class="stat-chart-head"><h4 class="stat-chart-title"></h4></div><p class="stat-chart-hint"></p><div class="stat-chart-wrap"><canvas id="statChart-' + key + '"></canvas></div>');
        area.appendChild(card);
    }
    card.querySelector('.stat-chart-title').textContent = title;
    const hintEl = card.querySelector('.stat-chart-hint');
    hintEl.textContent = hint || '';
    hintEl.style.display = hint ? '' : 'none';
    card.style.display = '';
    return card.querySelector('canvas');
}

function hideStatChartCard(key) {
    const card = document.getElementById('statChartCard-' + key);
    if (card && card.style) card.style.display = 'none';
    const old = statChartInstances.get(key);
    if (old) { old.destroy(); statChartInstances.delete(key); }
}

// every card a tool may have shown (used when a calculation ends in an error message)
function hideAllStatCharts() {
    ['test', 'scatter', 'residuals', 'extra', 'freq', 'ogive'].forEach(hideStatChartCard);
}

function putStatChart(key, canvas, config) {
    const old = statChartInstances.get(key);
    if (old) old.destroy();
    statChartInstances.set(key, new Chart(canvas.getContext('2d'), config));
}

const fmtChartNum = v => (Number.isFinite(v) ? String(+v.toPrecision(5)) : String(v));

// ---- Curve with shaded regions ----
// points of a function between a and b
function curveSamples(fn, a, b, count) {
    const pts = [], n = count || 220;
    for (let i = 0; i <= n; i++) {
        const x = a + (b - a) * i / n, y = fn(x);
        pts.push({ x, y: Number.isFinite(y) ? y : 0 });
    }
    return pts;
}

// cfg: { title, xLabel, yLabel, fn, lo, hi, shades: [{from, to, color, label}], lines: [{x, label, color, dash}], description }
function drawCurveChart(key, canvas, cfg) {
    const datasets = [{ label: cfg.curveLabel || 'Density', data: curveSamples(cfg.fn, cfg.lo, cfg.hi), borderColor: STAT_CHART_COLORS.curve, borderWidth: 2.5, pointRadius: 0, showLine: true, fill: false, order: 3 }];
    let peak = 0;
    datasets[0].data.forEach(p => { if (p.y > peak) peak = p.y; });
    (cfg.shades || []).forEach(s => {
        const from = Math.max(s.from, cfg.lo), to = Math.min(s.to, cfg.hi);
        if (!(to > from)) return;
        datasets.push({ label: s.label, data: curveSamples(cfg.fn, from, to, 120), borderWidth: 0, pointRadius: 0, showLine: true, backgroundColor: s.color, fill: 'origin', order: s.top ? 2 : 3 });
    });
    (cfg.lines || []).forEach(l => {
        const top = Math.min(cfg.fn(l.x), peak * 1.05);
        datasets.push({ label: l.label, data: [{ x: l.x, y: 0 }, { x: l.x, y: Number.isFinite(top) ? top : peak }], borderColor: l.color || STAT_CHART_COLORS.stat, borderWidth: 2.2, borderDash: l.dash ? [6, 4] : [], pointRadius: 0, showLine: true, fill: false, order: 1 });
    });
    labelChart(canvas, cfg.description || cfg.title);
    putStatChart(key, canvas, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
            plugins: {
                title: { display: true, text: cfg.title, font: { size: 15, weight: 'bold' } },
                legend: { position: 'bottom', labels: { boxWidth: 14, font: { size: 11 }, filter: item => item.text !== '' } },
                tooltip: { callbacks: { label: c => `${c.dataset.label}: x = ${fmtChartNum(c.parsed.x)}, y = ${fmtChartNum(c.parsed.y)}` } }
            },
            scales: {
                x: { type: 'linear', min: cfg.lo, max: cfg.hi, title: { display: true, text: cfg.xLabel || 'x' } },
                y: { min: 0, suggestedMax: peak * 1.12, title: { display: true, text: cfg.yLabel || 'Density' } }
            }
        }
    });
}

// ---- Bars (discrete distributions) ----
// cfg: { title, xLabel, yLabel, ks: [..], probs: [..], highlight: k => bool, highlightLabel, description }
function drawBarChart(key, canvas, cfg) {
    const colors = cfg.ks.map(k => (cfg.highlight && cfg.highlight(k) ? STAT_CHART_COLORS.shade.replace('0.38', '0.9') : 'rgba(26, 84, 144, 0.35)'));
    labelChart(canvas, cfg.description || cfg.title);
    putStatChart(key, canvas, {
        type: 'bar',
        data: { labels: cfg.ks, datasets: [{ label: cfg.highlightLabel ? `${cfg.highlightLabel} (highlighted)` : 'Probability', data: cfg.probs, backgroundColor: colors, borderColor: STAT_CHART_COLORS.curve, borderWidth: 1 }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
            plugins: {
                title: { display: true, text: cfg.title, font: { size: 15, weight: 'bold' } },
                legend: { display: false },
                tooltip: { callbacks: { label: c => `P(X = ${c.label}) = ${fmtChartNum(c.parsed.y)}` } }
            },
            scales: { x: { title: { display: true, text: cfg.xLabel || 'k' } }, y: { min: 0, title: { display: true, text: cfg.yLabel || 'P(X = k)' } } }
        }
    });
}

// ---- Scatter with a fitted line, and residual plots ----
// cfg: { title, xLabel, yLabel, x, y, line: { slope, intercept, label } | null, description }
function drawScatterChart(key, canvas, cfg) {
    const pts = cfg.x.map((x, i) => ({ x, y: cfg.y[i] }));
    const xs = cfg.x, lo = Math.min(...xs), hi = Math.max(...xs), pad = (hi - lo) * 0.06 || 1;
    const datasets = [{ label: 'Observations', data: pts, backgroundColor: STAT_CHART_COLORS.point, pointRadius: 5, pointHoverRadius: 7, showLine: false, order: 2 }];
    if (cfg.line) {
        const a = lo - pad, b = hi + pad;
        datasets.push({ label: cfg.line.label || 'Least-squares line', data: [{ x: a, y: cfg.line.intercept + cfg.line.slope * a }, { x: b, y: cfg.line.intercept + cfg.line.slope * b }], borderColor: STAT_CHART_COLORS.fit, borderWidth: 2.4, pointRadius: 0, showLine: true, fill: false, order: 1 });
    }
    labelChart(canvas, cfg.description || cfg.title);
    putStatChart(key, canvas, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
            plugins: {
                title: { display: true, text: cfg.title, font: { size: 15, weight: 'bold' } },
                legend: { position: 'bottom', labels: { boxWidth: 14, font: { size: 11 } } },
                tooltip: { callbacks: { label: c => `(${fmtChartNum(c.parsed.x)}, ${fmtChartNum(c.parsed.y)})` } }
            },
            scales: { x: { type: 'linear', title: { display: true, text: cfg.xLabel || 'x' } }, y: { type: 'linear', title: { display: true, text: cfg.yLabel || 'y' } } }
        }
    });
}

// residuals against fitted values (or any x): a horizontal reference line at 0 makes a pattern easy to see
function drawResidualChart(key, canvas, cfg) {
    const pts = cfg.x.map((x, i) => ({ x, y: cfg.residuals[i] }));
    const lo = Math.min(...cfg.x), hi = Math.max(...cfg.x), pad = (hi - lo) * 0.06 || 1;
    labelChart(canvas, cfg.description || cfg.title);
    putStatChart(key, canvas, {
        type: 'scatter',
        data: {
            datasets: [
                { label: 'Residuals', data: pts, backgroundColor: STAT_CHART_COLORS.point, pointRadius: 5, pointHoverRadius: 7, showLine: cfg.connect === true, borderColor: 'rgba(26, 84, 144, 0.35)', order: 2 },
                { label: 'Zero (no error)', data: [{ x: lo - pad, y: 0 }, { x: hi + pad, y: 0 }], borderColor: STAT_CHART_COLORS.zero, borderWidth: 2, borderDash: [6, 4], pointRadius: 0, showLine: true, fill: false, order: 1 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
            plugins: {
                title: { display: true, text: cfg.title, font: { size: 15, weight: 'bold' } },
                legend: { position: 'bottom', labels: { boxWidth: 14, font: { size: 11 } } },
                tooltip: { callbacks: { label: c => `(${fmtChartNum(c.parsed.x)}, ${fmtChartNum(c.parsed.y)})` } }
            },
            scales: { x: { type: 'linear', title: { display: true, text: cfg.xLabel || 'Fitted value' } }, y: { type: 'linear', title: { display: true, text: cfg.yLabel || 'Residual' } } }
        }
    });
}

// ---- Hypothesis test: where the statistic falls ----
// spec: { dist: 'z' | 't' | 'chisq' | 'f', df, df2, stat, alternative: 'two.sided' | 'greater' | 'less', alpha, statLabel,
//         critical: { lower: number | null, upper: number | null }, title? }
// Draws the sampling distribution under H0 with the rejection region(s) shaded, the p-value area in amber, a dashed line at each
// critical value and a solid line at the test statistic.
function testDistributionSpec(spec) {
    const d = spec.dist === 'z' ? PLOT_DISTRIBUTIONS.normal : PLOT_DISTRIBUTIONS[spec.dist];
    const params = spec.dist === 'z' ? { mean: 0, stdDev: 1 } : (spec.dist === 'f' ? { df1: spec.df, df2: spec.df2 } : { df: spec.df });
    return { d, params };
}

function buildTestChart(spec) {
    const { d, params } = testDistributionSpec(spec);
    if (!d || !d.valid(params) || !Number.isFinite(spec.stat)) return null;
    let [lo, hi] = d.range(params);
    const crits = [spec.critical && spec.critical.lower, spec.critical && spec.critical.upper].filter(v => Number.isFinite(v));
    const mark = [spec.stat, ...crits];
    const symmetric = spec.dist === 'z' || spec.dist === 't';
    if (symmetric) {
        const m = Math.max(Math.abs(lo), ...mark.map(Math.abs)) * (Math.max(...mark.map(Math.abs)) > Math.abs(hi) * 0.85 ? 1.15 : 1);
        lo = -m; hi = m;
    } else {
        hi = Math.max(hi, ...mark.map(v => v * 1.12));
    }
    const fn = x => d.pdf(x, params);
    const lower = spec.critical && Number.isFinite(spec.critical.lower) ? spec.critical.lower : null;
    const upper = spec.critical && Number.isFinite(spec.critical.upper) ? spec.critical.upper : null;
    const shades = [];
    if (lower !== null) shades.push({ from: lo, to: lower, color: STAT_CHART_COLORS.reject, label: `Rejection region (α = ${spec.alpha})` });
    if (upper !== null) shades.push({ from: upper, to: hi, color: STAT_CHART_COLORS.reject, label: lower === null ? `Rejection region (α = ${spec.alpha})` : '' });
    // p-value area: the tail beyond the statistic (both tails for a two-sided test on a symmetric distribution; for a two-sided test on a
    // skewed distribution (F) the tail on the statistic's side is drawn and the label says the p-value doubles it)
    if (spec.alternative === 'greater') shades.push({ from: spec.stat, to: hi, color: STAT_CHART_COLORS.pvalue, label: 'p-value area', top: true });
    else if (spec.alternative === 'less') shades.push({ from: lo, to: spec.stat, color: STAT_CHART_COLORS.pvalue, label: 'p-value area', top: true });
    else if (symmetric) { shades.push({ from: Math.abs(spec.stat), to: hi, color: STAT_CHART_COLORS.pvalue, label: 'p-value area (both tails)', top: true }); shades.push({ from: lo, to: -Math.abs(spec.stat), color: STAT_CHART_COLORS.pvalue, label: '', top: true }); }
    else if (d.cdf(spec.stat, params) < 0.5) shades.push({ from: lo, to: spec.stat, color: STAT_CHART_COLORS.pvalue, label: 'p-value area (one tail; two-sided p = 2 × this)', top: true });
    else shades.push({ from: spec.stat, to: hi, color: STAT_CHART_COLORS.pvalue, label: 'p-value area (one tail; two-sided p = 2 × this)', top: true });
    const lines = [];
    if (lower !== null) lines.push({ x: lower, label: `Critical value ${fmtChartNum(lower)}`, color: STAT_CHART_COLORS.rejectLine, dash: true });
    if (upper !== null) lines.push({ x: upper, label: lower === null ? `Critical value ${fmtChartNum(upper)}` : `Critical value ${fmtChartNum(upper)}`, color: STAT_CHART_COLORS.rejectLine, dash: true });
    lines.push({ x: spec.stat, label: `${spec.statLabel || 'Test statistic'} = ${fmtChartNum(spec.stat)}`, color: STAT_CHART_COLORS.stat });
    const distName = spec.dist === 'z' ? 'standard normal' : (spec.dist === 't' ? `t (df = ${fmtChartNum(spec.df)})` : (spec.dist === 'chisq' ? `chi-square (df = ${fmtChartNum(spec.df)})` : `F (df = ${fmtChartNum(spec.df)}, ${fmtChartNum(spec.df2)})`));
    const inReject = (lower !== null && spec.stat <= lower) || (upper !== null && spec.stat >= upper);
    return {
        title: spec.title || `Sampling distribution under H₀: ${distName}`,
        xLabel: spec.statLabel || 'Test statistic', yLabel: 'Density', fn, lo, hi, shades, lines,
        description: `Sampling distribution under the null hypothesis, ${distName}. The test statistic ${fmtChartNum(spec.stat)} falls ${inReject ? 'inside' : 'outside'} the rejection region.`
    };
}

// Critical regions in the form the chart wants, from the single critical value a tool reports (a magnitude for a two-sided test, the
// signed cut-off for a one-sided one): two-sided -> both tails, greater -> upper, less -> lower.
function signedCritical(alternative, c) {
    const m = Math.abs(c);
    if (alternative === 'greater') return { lower: null, upper: m };
    if (alternative === 'less') return { lower: -m, upper: null };
    return { lower: -m, upper: m };
}

// ---- Exact binomial-based tests (sign test, binomial exact test): bars with the p-value outcomes and the rejection region coloured ----
// spec: { kind: 'binomial', n, p0, k, alternative, alpha, title? }
function binomialTestRegions(spec) {
    const { n, p0, k, alternative, alpha } = spec;
    const pmf = i => binomialPMF(n, i, p0);
    const tol = 1 + 1e-7;
    const pvalueSet = new Set(), rejectSet = new Set();
    for (let i = 0; i <= n; i++) {
        if (alternative === 'greater' ? i >= k : (alternative === 'less' ? i <= k : pmf(i) <= pmf(k) * tol)) pvalueSet.add(i);
    }
    // rejection region: the most extreme outcomes whose total probability is still at most alpha (alpha / 2 in each tail for two-sided)
    const tail = (from, step, budget) => {
        let acc = 0;
        for (let i = from; i >= 0 && i <= n; i += step) { acc += pmf(i); if (acc > budget * tol) break; rejectSet.add(i); }
    };
    if (alternative === 'greater') tail(n, -1, alpha);
    else if (alternative === 'less') tail(0, 1, alpha);
    else { tail(n, -1, alpha / 2); tail(0, 1, alpha / 2); }
    return { pvalueSet, rejectSet };
}

function drawBinomialTestChart(canvas, spec) {
    const { n, p0, k } = spec;
    const sd = Math.sqrt(n * p0 * (1 - p0)), mean = n * p0;
    const lo = Math.max(0, Math.floor(Math.min(mean - 4.5 * sd, k) - 1)), hi = Math.min(n, Math.ceil(Math.max(mean + 4.5 * sd, k) + 1));
    const ks = [], probs = [];
    for (let i = lo; i <= hi; i++) { ks.push(i); probs.push(binomialPMF(n, i, p0)); }
    const { pvalueSet, rejectSet } = binomialTestRegions(spec);
    const colors = ks.map(i => (i === k ? '#111827' : (pvalueSet.has(i) ? 'rgba(245, 158, 11, 0.9)' : (rejectSet.has(i) ? 'rgba(220, 38, 38, 0.75)' : 'rgba(26, 84, 144, 0.35)'))));
    labelChart(canvas, `Binomial(n = ${n}, p = ${fmtChartNum(p0)}) distribution under the null hypothesis; the observed count ${k} is highlighted, with the outcomes that make up the p-value and the rejection region coloured.`);
    putStatChart('test', canvas, {
        type: 'bar',
        data: { labels: ks, datasets: [{ label: 'P(X = k)', data: probs, backgroundColor: colors, borderColor: ks.map(i => (rejectSet.has(i) ? '#b91c1c' : STAT_CHART_COLORS.curve)), borderWidth: ks.map(i => (rejectSet.has(i) ? 3 : 1)) }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
            plugins: {
                title: { display: true, text: spec.title || `Binomial(n = ${n}, p = ${fmtChartNum(p0)}) under H₀`, font: { size: 15, weight: 'bold' } },
                legend: { display: false },
                tooltip: { callbacks: { label: c => `P(X = ${c.label}) = ${fmtChartNum(c.parsed.y)}` } }
            },
            scales: { x: { title: { display: true, text: 'Number of successes k' } }, y: { min: 0, title: { display: true, text: 'P(X = k)' } } }
        }
    });
}

function showTestChart(areaId, spec) {
    if (typeof Chart === 'undefined') {
        if (!chartJsReady(showTestChart, arguments)) return;
    }
    if (spec && spec.kind === 'binomial') {
        const bcanvas = statChartCard(areaId, 'test', 'Where your result falls', 'Black bar: your observed count. Amber bars: outcomes at least as extreme (their probabilities add up to the p-value). Bars with a thick red outline: the rejection region (the most extreme outcomes with total probability at most α).');
        if (bcanvas) drawBinomialTestChart(bcanvas, spec);
        return;
    }
    const cfg = spec ? buildTestChart(spec) : null;
    if (!cfg) { hideStatChartCard('test'); return; }
    const hint = 'The shaded red area is the rejection region (the most extreme α of the distribution if H₀ is true). If the solid line (your test statistic) lands inside it, H₀ is rejected. The amber area is the p-value.';
    const canvas = statChartCard(areaId, 'test', 'Where your test statistic falls', hint);
    if (canvas) drawCurveChart('test', canvas, cfg);
}

// ---- Scatter + residual cards for correlation / regression tools ----
function showScatterCard(areaId, key, title, hint, cfg) {
    if (typeof Chart === 'undefined' && !chartJsReady(showScatterCard, arguments)) return;
    const canvas = statChartCard(areaId, key, title, hint);
    if (canvas) drawScatterChart(key, canvas, cfg);
}

function showResidualCard(areaId, key, title, hint, cfg) {
    if (typeof Chart === 'undefined' && !chartJsReady(showResidualCard, arguments)) return;
    const canvas = statChartCard(areaId, key, title, hint);
    if (canvas) drawResidualChart(key, canvas, cfg);
}

// Scatter of y on x with the least-squares line, then a residual plot against the fitted values. Used by the correlation and regression tools.
function showFitCharts(areaId, x, y, opts) {
    const o = opts || {};
    const core = simpleRegressionCore(x, y);
    if (!core) { hideStatChartCard('scatter'); hideStatChartCard('residuals'); return; }
    showScatterCard(areaId, 'scatter', o.scatterTitle || 'Scatter plot with the least-squares line',
        o.scatterHint || 'Each point is one observation. The red line is the best straight-line fit (least squares); points close to it mean a strong linear relationship.',
        { title: `${o.yName || 'y'} against ${o.xName || 'x'}`, xLabel: o.xName || 'x', yLabel: o.yName || 'y', x, y,
          line: { slope: core.slope, intercept: core.intercept, label: `ŷ = ${fmtChartNum(core.intercept)} + ${fmtChartNum(core.slope)}x` },
          description: `Scatter plot of ${x.length} paired observations with the least-squares line y = ${fmtChartNum(core.intercept)} + ${fmtChartNum(core.slope)}x.` });
    if (o.residuals === false) { hideStatChartCard('residuals'); return; }
    const fitted = x.map(v => core.intercept + core.slope * v), res = y.map((v, i) => v - fitted[i]);
    showResidualCard(areaId, 'residuals', 'Residual plot', 'A residual is the vertical distance from a point to the line. A good linear fit scatters residuals randomly around 0; a curve or a funnel shape means the straight-line model is not appropriate.',
        { title: 'Residuals against fitted values', xLabel: 'Fitted value ŷ', yLabel: 'Residual y − ŷ', x: fitted, residuals: res, description: `Residual plot: ${res.length} residuals against the fitted values, centred on zero.` });
}

// ---- Actual against predicted (regression models), residual sequence (Durbin-Watson), partial-correlation plot ----
// Actual y against the model's predictions with the 45-degree line (a perfect model lies on it), then residuals against the predictions.
function showActualVsPredictedCharts(areaId, actual, predicted, opts) {
    const o = opts || {};
    const lo = Math.min(...actual, ...predicted), hi = Math.max(...actual, ...predicted);
    showScatterCard(areaId, 'scatter', 'Actual against predicted values',
        'Each point is one observation. The red line is "prediction = actual": a perfect model puts every point on it, and the distance from the line is the prediction error.',
        { title: 'Actual (y) against predicted (ŷ)', xLabel: 'Predicted ŷ', yLabel: 'Actual y', x: predicted, y: actual, line: { slope: 1, intercept: 0, label: 'Perfect prediction (y = ŷ)' },
          description: `Scatter plot of ${actual.length} actual values against the model's predictions with the line y = ŷ.` });
    const res = actual.map((v, i) => v - predicted[i]);
    showResidualCard(areaId, 'residuals', 'Residual plot', 'Residuals (actual − predicted) should scatter randomly around 0. A curve, a funnel shape or a long run on one side means the model is missing something.',
        { title: 'Residuals against predicted values', xLabel: 'Predicted ŷ', yLabel: 'Residual y − ŷ', x: predicted, residuals: res, description: `Residual plot: ${res.length} residuals against the predictions.` });
}

// Residuals in observation order, joined by a line: Durbin-Watson looks at how a residual relates to the one before it
function showResidualSequenceChart(areaId, residuals) {
    showResidualCard(areaId, 'residuals', 'Residuals in order', 'Without autocorrelation the points bounce randomly around 0. Long runs above or below 0 point to positive autocorrelation; a zig-zag that crosses 0 almost every time points to negative autocorrelation.',
        { title: 'Residuals in observation order', xLabel: 'Observation number', yLabel: 'Residual', x: residuals.map((_, i) => i + 1), residuals, connect: true, description: `Residuals of ${residuals.length} observations in order, with a zero line.` });
}

// Partial correlation as a picture: remove the linear effect of z from both x and y, then plot what is left of y against what is left of x.
function showPartialCorrelationChart(areaId, x, y, z, rPartial) {
    const cz = simpleRegressionCore(z, x), cy = simpleRegressionCore(z, y);
    if (!cz || !cy) { hideStatChartCard('scatter'); return; }
    const rx = x.map((v, i) => v - (cz.intercept + cz.slope * z[i])), ry = y.map((v, i) => v - (cy.intercept + cy.slope * z[i]));
    const core = simpleRegressionCore(rx, ry);
    showScatterCard(areaId, 'scatter', `Partial correlation: x and y with z removed (r = ${fmtChartNum(rPartial)})`,
        'Both x and y are first adjusted for z (each is regressed on z and only the leftover, the residual, is kept). The correlation of these leftovers is the partial correlation, so this is the relationship between x and y with z held constant.',
        { title: 'y (adjusted for z) against x (adjusted for z)', xLabel: 'x residual (x with z removed)', yLabel: 'y residual (y with z removed)', x: rx, y: ry, line: core ? { slope: core.slope, intercept: core.intercept, label: 'Least-squares line' } : null,
          description: `Scatter plot of the residuals of x and y after removing z; their correlation is the partial correlation ${fmtChartNum(rPartial)}.` });
}

// Multiple regression: rows are [y, x1, ..., xk]; coefficients are [b0, b1, ..., bk] on the original scale
function showMultipleRegressionCharts(areaId, dataMatrix, coefficients) {
    if (!coefficients) { hideStatChartCard('scatter'); hideStatChartCard('residuals'); return; }
    const actual = dataMatrix.map(r => r[0]);
    const predicted = dataMatrix.map(r => coefficients[0] + r.slice(1).reduce((s, v, j) => s + coefficients[j + 1] * v, 0));
    showActualVsPredictedCharts(areaId, actual, predicted);
}

// ---- Frequency tables: histogram with frequency polygon, and the ogive (cumulative frequency) ----
// cfg: { labels, freqs, midpoints, cumulative, boundaries?, discrete }
function showFrequencyCharts(areaId, cfg) {
    if (typeof Chart === 'undefined' && !chartJsReady(showFrequencyCharts, arguments)) return;
    const hist = statChartCard(areaId, 'freq', cfg.discrete ? 'Frequency chart' : 'Histogram and frequency polygon',
        cfg.discrete ? 'Each bar is how many times that value occurs; the line joins the tops of the bars.' : 'Each bar is a class interval and its height the frequency. The red line (frequency polygon) joins the class midpoints, with a zero-frequency point added at each end.');
    if (hist) {
        const labels = ['', ...cfg.labels, ''];
        labelChart(hist, `${cfg.discrete ? 'Frequency chart' : 'Histogram with frequency polygon'} of ${cfg.labels.length} ${cfg.discrete ? 'values' : 'classes'}.`);
        putStatChart('freq', hist, {
            type: 'bar',
            data: { labels, datasets: [
                { type: 'bar', label: 'Frequency', data: [null, ...cfg.freqs, null], backgroundColor: 'rgba(26, 84, 144, 0.55)', borderColor: STAT_CHART_COLORS.curve, borderWidth: 1, barPercentage: cfg.discrete ? 0.6 : 1, categoryPercentage: cfg.discrete ? 0.8 : 1, order: 2 },
                { type: 'line', label: 'Frequency polygon', data: [0, ...cfg.freqs, 0], borderColor: STAT_CHART_COLORS.fit, backgroundColor: STAT_CHART_COLORS.fit, borderWidth: 2.4, pointRadius: 4, tension: 0, order: 1 }
            ] },
            options: {
                responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
                plugins: { title: { display: true, text: cfg.discrete ? 'Frequency of each value' : 'Histogram of the grouped data', font: { size: 15, weight: 'bold' } }, legend: { position: 'bottom', labels: { boxWidth: 14, font: { size: 11 } } } },
                scales: { x: { title: { display: true, text: cfg.discrete ? 'Value' : 'Class interval' }, grid: { display: false } }, y: { min: 0, title: { display: true, text: 'Frequency' } } }
            }
        });
    }
    const og = statChartCard(areaId, 'ogive', 'Cumulative frequency (ogive)', 'The running total of the frequencies. Reading across from n/2 on the vertical axis to the curve and down gives the median; n/4 and 3n/4 give the quartiles.');
    if (og) {
        const pts = cfg.discrete ? cfg.midpoints.map((x, i) => ({ x, y: cfg.cumulative[i] })) : [{ x: cfg.boundaries[0], y: 0 }, ...cfg.boundaries.slice(1).map((x, i) => ({ x, y: cfg.cumulative[i] }))];
        labelChart(og, 'Cumulative frequency curve (ogive).');
        putStatChart('ogive', og, {
            type: 'scatter',
            data: { datasets: [{ label: 'Cumulative frequency', data: pts, borderColor: STAT_CHART_COLORS.curve, backgroundColor: STAT_CHART_COLORS.curve, borderWidth: 2.4, pointRadius: 4, showLine: true, stepped: cfg.discrete ? 'after' : false, fill: false }] },
            options: {
                responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
                plugins: { title: { display: true, text: 'Ogive: cumulative frequency', font: { size: 15, weight: 'bold' } }, legend: { display: false } },
                scales: { x: { type: 'linear', title: { display: true, text: cfg.discrete ? 'Value' : 'Upper class boundary' } }, y: { min: 0, title: { display: true, text: 'Cumulative frequency' } } }
            }
        });
    }
}
