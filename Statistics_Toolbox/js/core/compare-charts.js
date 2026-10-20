// Graphs for the tests that have no single reference curve: the normality tests (normal Q-Q plot, empirical vs normal CDF) and the
// pairwise-comparison tests (Tukey HSD, Bonferroni: a confidence interval for every difference of means). Cards come from stat-charts.js.

// Normal Q-Q plot: sorted values against normal quantiles (Blom positions); points near the line mean "looks normal"
function showNormalityCharts(areaId, data, withCdf) {
    if (!Array.isArray(data) || data.length < 3) return;
    if (typeof Chart === 'undefined' && !chartJsReady(showNormalityCharts, arguments)) return;
    const n = data.length, sorted = data.slice().sort((a, b) => a - b);
    const mean = sorted.reduce((s, v) => s + v, 0) / n;
    const sd = Math.sqrt(sorted.reduce((s, v) => s + (v - mean) * (v - mean), 0) / (n - 1));
    if (!(sd > 0)) return;
    const z = sorted.map((_, i) => normInv((i + 1 - 0.375) / (n + 0.25)));
    const qq = statChartCard(areaId, 'scatter', 'Normal Q-Q plot', 'Each point is one value against where a normal distribution would put it. Points close to the line: the data look normal. A bend or an S-shape: skewed or heavy-tailed data.');
    if (qq) drawScatterChart('scatter', qq, {
        x: z, y: sorted, line: { intercept: mean, slope: sd, label: 'Normal with the sample mean and s' },
        title: 'Normal Q-Q plot', xLabel: 'Theoretical normal quantile (z)', yLabel: 'Sample value',
        description: `Normal Q-Q plot of ${n} values: sample quantiles against theoretical normal quantiles with a reference line`
    });
    if (!withCdf) return;
    const cdf = statChartCard(areaId, 'extra', 'Empirical CDF against the normal CDF', 'The Kolmogorov-Smirnov statistic D is the largest vertical gap between the step curve (your data) and the smooth curve (a normal with the sample mean and s).');
    if (!cdf) return;
    const span = (sorted[n - 1] - sorted[0]) || 1, lo = sorted[0] - 0.15 * span, hi = sorted[n - 1] + 0.15 * span;
    const steps = [{ x: lo, y: 0 }];
    sorted.forEach((v, i) => { steps.push({ x: v, y: i / n }, { x: v, y: (i + 1) / n }); });
    steps.push({ x: hi, y: 1 });
    labelChart(cdf, `Empirical CDF of ${n} values against the fitted normal CDF`);
    putStatChart('extra', cdf, {
        type: 'scatter',
        data: { datasets: [
            { label: 'Empirical CDF (data)', data: steps, borderColor: STAT_CHART_COLORS.fit, borderWidth: 2, pointRadius: 0, showLine: true, fill: false, order: 1 },
            { label: 'Normal CDF (sample mean, s)', data: curveSamples(x => normalCDF(x, mean, sd), lo, hi, 160), borderColor: STAT_CHART_COLORS.curve, borderWidth: 2.4, pointRadius: 0, showLine: true, fill: false, order: 2 }
        ] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
            plugins: { title: { display: true, text: 'Empirical CDF against the normal CDF', font: { size: 15, weight: 'bold' } }, legend: { position: 'bottom', labels: { boxWidth: 14, font: { size: 11 } } } },
            scales: { x: { type: 'linear', title: { display: true, text: 'Value' } }, y: { type: 'linear', min: 0, max: 1, title: { display: true, text: 'Cumulative proportion' } } }
        }
    });
}

// rows: [{ label, diff, half, significant }]; the bar spans diff ± half, so a bar that does not cross 0 is a significant difference
function showPairwiseChart(areaId, rows, title, hint) {
    if (!rows || !rows.length) return;
    if (typeof Chart === 'undefined' && !chartJsReady(showPairwiseChart, arguments)) return;
    const canvas = statChartCard(areaId, 'extra', title, hint);
    if (!canvas) return;
    labelChart(canvas, `${title}: ${rows.length} pairwise differences of means, each with its confidence interval; intervals that do not cross 0 are significant`);
    const zeroLine = {
        id: 'zeroLine',
        afterDatasetsDraw(chart) {
            const x = chart.scales.x.getPixelForValue(0), area = chart.chartArea, ctx = chart.ctx;
            ctx.save(); ctx.strokeStyle = STAT_CHART_COLORS.stat; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
            ctx.beginPath(); ctx.moveTo(x, area.top); ctx.lineTo(x, area.bottom); ctx.stroke(); ctx.restore();
        }
    };
    putStatChart('extra', canvas, {
        type: 'bar',
        data: { labels: rows.map(r => r.label), datasets: [{
            label: 'Difference of means with its interval', data: rows.map(r => [r.diff - r.half, r.diff + r.half]),
            backgroundColor: rows.map(r => (r.significant ? 'rgba(220, 38, 38, 0.55)' : 'rgba(26, 84, 144, 0.35)')),
            borderColor: rows.map(r => (r.significant ? STAT_CHART_COLORS.rejectLine : STAT_CHART_COLORS.curve)), borderWidth: 1.5
        }] },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
            plugins: {
                title: { display: true, text: title, font: { size: 15, weight: 'bold' } }, legend: { display: false },
                tooltip: { callbacks: { label: c => { const r = rows[c.dataIndex]; return `${fmtChartNum(r.diff)} (${fmtChartNum(r.diff - r.half)} to ${fmtChartNum(r.diff + r.half)})${r.significant ? ' significant' : ''}`; } } }
            },
            scales: { x: { title: { display: true, text: 'Difference of group means (red = significant)' } } }
        },
        plugins: [zeroLine]
    });
}

function tukeyChartRows(comparisons) {
    return comparisons.map(c => ({ label: `${c.group1} − ${c.group2}`, diff: c.mean1 - c.mean2, half: c.hsd, significant: c.significant }));
}

function bonferroniChartRows(comparisons) {
    return comparisons.map(c => ({ label: `${c.group1} − ${c.group2}`, diff: c.diff, half: c.criticalT * c.se, significant: c.significant }));
}
