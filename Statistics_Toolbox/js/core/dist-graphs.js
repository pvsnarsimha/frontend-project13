// Graphs for the distribution tools (PDF, CDF, PMF, survival, quantile, hazard): the area or bars for the probability that was asked for.
// The tools keep their own calculation; after it they call showDistributionGraph(), which reads the same form fields (<prefix>Distribution,
// <prefix>Mean, <prefix>Std, ...) and draws with the shared chart code in stat-charts.js.

const FORM_DISTRIBUTION_FIELDS = {
    normal: { mean: 'Mean', stdDev: 'Std' }, uniform: { min: 'Min', max: 'Max' }, exponential: { rate: 'Rate' }, beta: { alpha: 'Alpha', beta: 'Beta' },
    poisson: { lambda: 'Lambda' }, binomial: { n: 'N', p: 'P' }, weibull: { shape: 'Shape', scale: 'Scale' }
};

// { name, params, spec } for the distribution chosen in the form with this id prefix, or null when it cannot be drawn
function readFormDistribution(prefix) {
    const select = document.getElementById(prefix + 'Distribution');
    const name = select ? select.value : null;
    const map = FORM_DISTRIBUTION_FIELDS[name], spec = PLOT_DISTRIBUTIONS[name];
    if (!map || !spec) return null;
    const params = {};
    for (const [key, suffix] of Object.entries(map)) {
        const el = document.getElementById(prefix + suffix);
        const v = el ? parseFloat(el.value) : NaN;
        if (!Number.isFinite(v)) return null;
        params[key] = v;
    }
    return spec.valid(params) ? { name, params, spec } : null;
}

// the x with CDF(x) = p, by bisection on the distribution's own CDF (the quantile tools use closed forms; this only places the marker)
function distributionQuantile(spec, params, p) {
    let [lo, hi] = spec.range(params);
    const w = hi - lo;
    lo -= 3 * w; hi += 3 * w;
    if (spec.kind === 'discrete') {
        for (let k = Math.max(0, Math.floor(lo)); k <= hi; k++) if (spec.cdf(k, params) >= p) return k;
        return hi;
    }
    for (let i = 0; i < 90; i++) { const mid = (lo + hi) / 2; if (spec.cdf(mid, params) < p) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
}

const fmtG = v => String(+Number(v).toPrecision(5));

// the curve with the area (probability) between `from` and `to` shaded, and vertical markers
function probabilityCurveConfig(spec, params, shade, title, markers) {
    const [lo, hi] = spec.range(params);
    const fn = x => spec.pdf(x, params);
    const clip = v => Math.min(hi, Math.max(lo, v));
    return {
        title, xLabel: 'x', yLabel: 'Density f(x)', fn, lo, hi, curveLabel: 'Density f(x)',
        shades: shade ? [{ from: clip(shade.from), to: clip(shade.to), color: STAT_CHART_COLORS.shade, label: shade.label, top: true }] : [],
        lines: (markers || []).filter(m => m.x >= lo && m.x <= hi).map(m => ({ x: m.x, label: m.label, color: STAT_CHART_COLORS.stat, dash: m.dash })),
        description: `${title}. ${shade ? shade.label : ''}`
    };
}

// mode: 'pdf' | 'cdf' | 'survival' | 'pmf' | 'quantile' | 'hazard'; values: the numbers typed into the tool (x values, or probabilities for 'quantile')
function showDistributionGraph(areaId, prefix, mode, values) {
    if (typeof Chart === 'undefined' && !chartJsReady(showDistributionGraph, arguments)) return;
    const dist = readFormDistribution(prefix);
    const vals = (values || []).filter(Number.isFinite).slice(0, 8);
    if (!dist || !vals.length) { hideAllStatCharts(); return; }
    const { name, params, spec } = dist;
    const first = vals[0], dname = spec.label;

    if (spec.kind === 'discrete') {
        // PMF (and CDF / survival of a discrete distribution): bars; highlighted bars are the outcomes asked for
        const [klo, khi] = spec.range(params);
        const ks = [], probs = [];
        for (let k = klo; k <= khi; k++) { ks.push(k); probs.push(spec.pmf(k, params)); }
        const set = new Set(vals.map(Math.round));
        let highlight = k => set.has(k), label = 'P(X = k) for the values you entered';
        if (mode === 'cdf') { highlight = k => k <= Math.floor(first); label = `P(X ≤ ${first}) = ${fmtG(spec.cdf(first, params))}`; }
        if (mode === 'survival') { highlight = k => k > Math.floor(first); label = `P(X > ${first})`; }
        const canvas = statChartCard(areaId, 'test', 'The probability on the distribution', 'Each bar is P(X = k). Highlighted bars are the outcomes you asked about; their heights add up to the probability.');
        if (canvas) drawBarChart('test', canvas, { title: `${dname}: ${label}`, ks, probs, highlight, highlightLabel: label, xLabel: 'k', description: `Bar chart of the ${dname} probability mass function; ${label}.` });
        return;
    }

    let cfg;
    if (mode === 'pdf') {
        cfg = probabilityCurveConfig(spec, params, null, `${dname}: density at your x values`, vals.map(x => ({ x, label: `f(${fmtG(x)}) = ${fmtG(spec.pdf(x, params))}`, dash: false })));
    } else if (mode === 'cdf') {
        cfg = probabilityCurveConfig(spec, params, { from: -Infinity, to: first, label: `P(X ≤ ${fmtG(first)}) = ${fmtG(spec.cdf(first, params))}` }, `${dname}: P(X ≤ x) is the shaded area`, vals.map(x => ({ x, label: `x = ${fmtG(x)}`, dash: x !== first })));
    } else if (mode === 'survival') {
        cfg = probabilityCurveConfig(spec, params, { from: first, to: Infinity, label: `S(${fmtG(first)}) = P(X > ${fmtG(first)}) = ${fmtG(1 - spec.cdf(first, params))}` }, `${dname}: S(t) = P(T > t) is the shaded area`, vals.map(x => ({ x, label: `t = ${fmtG(x)}`, dash: x !== first })));
    } else if (mode === 'quantile') {
        const qs = vals.filter(p => p > 0 && p < 1).map(p => ({ p, x: distributionQuantile(spec, params, p) }));
        if (!qs.length) { hideAllStatCharts(); return; }
        cfg = probabilityCurveConfig(spec, params, { from: -Infinity, to: qs[0].x, label: `Area ${fmtG(qs[0].p)} to the left of x = ${fmtG(qs[0].x)}` }, `${dname}: the quantile x has the chosen area to its left`, qs.map((q, i) => ({ x: q.x, label: `p = ${fmtG(q.p)} → x = ${fmtG(q.x)}`, dash: i > 0 })));
    } else if (mode === 'hazard') {
        const [lo, hi] = spec.range(params);
        const h = x => { const s = 1 - spec.cdf(x, params); return s > 1e-12 ? spec.pdf(x, params) / s : NaN; };
        const hiUse = (() => { let top = hi; while (top > lo && !(1 - spec.cdf(top, params) > 1e-9)) top -= (hi - lo) / 50; return top; })();
        cfg = { title: `${dname}: hazard function h(t) = f(t) / S(t)`, xLabel: 't', yLabel: 'Hazard h(t)', fn: x => { const v = h(x); return Number.isFinite(v) ? v : 0; }, lo, hi: hiUse, curveLabel: 'Hazard h(t)', shades: [],
                lines: vals.filter(t => t >= lo && t <= hiUse).map(t => ({ x: t, label: `h(${fmtG(t)}) = ${fmtG(h(t))}`, color: STAT_CHART_COLORS.stat })), description: `Hazard function of the ${dname} distribution with your time points marked.` };
    }
    if (!cfg) return;
    const hint = mode === 'hazard' ? 'The hazard h(t) is the instantaneous failure rate at time t, given survival up to t. A flat line means a constant rate (exponential); a rising curve means wear-out.'
        : 'The blue curve is the probability density; the area under it is probability. The shaded area is the probability this tool calculated.';
    const canvas = statChartCard(areaId, 'test', mode === 'hazard' ? 'The hazard function' : 'The probability as an area', hint);
    if (canvas) drawCurveChart('test', canvas, cfg);
}

// Probability Calculator: shade every interval of the question (continuous curve), or highlight the bars inside them (discrete)
function showProbCalcGraph(areaId, distName, params, intervals, probability) {
    if (typeof Chart === 'undefined' && !chartJsReady(showProbCalcGraph, arguments)) return;
    const spec = PLOT_DISTRIBUTIONS[distName];
    if (!spec) return;
    const inside = k => intervals.some(iv => (iv.incFrom ? k >= iv.from : k > iv.from) && (iv.incTo ? k <= iv.to : k < iv.to));
    const label = `Probability = ${fmtG(probability)}`;
    if (spec.kind === 'discrete') {
        const [klo, khi] = spec.range(params), ks = [], probs = [];
        for (let k = klo; k <= khi; k++) { ks.push(k); probs.push(spec.pmf(k, params)); }
        const canvas = statChartCard(areaId, 'test', 'The probability on the distribution', 'Each bar is P(X = k). The highlighted bars are the outcomes in your question; their heights add up to the probability.');
        if (canvas) drawBarChart('test', canvas, { title: `${spec.label}: ${label}`, ks, probs, highlight: inside, highlightLabel: label, description: `Bar chart of the ${spec.label} distribution with the outcomes of the question highlighted; ${label}.` });
        return;
    }
    const [lo, hi] = spec.range(params);
    const cfg = probabilityCurveConfig(spec, params, null, `${spec.label}: shaded area = ${label}`, []);
    cfg.shades = intervals.map((iv, i) => ({ from: Math.max(lo, iv.from), to: Math.min(hi, iv.to), color: STAT_CHART_COLORS.shade, label: i === 0 ? label : '', top: true }));
    cfg.lines = intervals.flatMap(iv => [iv.from, iv.to]).filter(x => Number.isFinite(x) && x >= lo && x <= hi).map(x => ({ x, label: `x = ${fmtG(x)}`, color: STAT_CHART_COLORS.stat, dash: true }));
    const canvas = statChartCard(areaId, 'test', 'The probability as an area', 'The area under the density curve is probability. The shaded area is the probability your question asks for.');
    if (canvas) drawCurveChart('test', canvas, cfg);
}
