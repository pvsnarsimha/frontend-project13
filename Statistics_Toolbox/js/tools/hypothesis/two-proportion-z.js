/* TwoProportionZ: twoproportionz tool (render, compute, setup) */

function renderTwoProportionZInterface() {
    return buildInterface({
        id: "statTwoProportionZInterface",
        parameterOnly: true,   // counts only: no pasted data, so no sample button
        title: "p Two-Proportion z-test",
        formula: "📌 z = (p̂₁ - p̂₂) / √[p̂(1-p̂)(1/n₁ + 1/n₂)]",
        desc: "Tests whether two population proportions differ, from the number of successes and the sample size of each group (e.g. 45 of 120 vs 30 of 110).",
        inputs: [
            { label: "📊 Group 1: successes (x₁):", input: { type: "number", id: "twoPropX1", value: "45", step: "1", min: "0", style: FIELD_STYLE } },
            { label: "📊 Group 1: sample size (n₁):", input: { type: "number", id: "twoPropN1", value: "120", step: "1", min: "1", style: FIELD_STYLE } },
            { label: "📊 Group 2: successes (x₂):", input: { type: "number", id: "twoPropX2", value: "30", step: "1", min: "0", style: FIELD_STYLE } },
            { label: "📊 Group 2: sample size (n₂):", input: { type: "number", id: "twoPropN2", value: "110", step: "1", min: "1", style: FIELD_STYLE } },
            { label: "📊 Significance Level (α):", select: { id: "twoPropAlpha", style: FIELD_STYLE }, options: ALPHA_OPTIONS_3 },
            {
                label: "📋 Alternative Hypothesis:",
                select: { id: "twoPropAlternative", style: FIELD_STYLE },
                options: [["two.sided", "p₁ ≠ p₂ (Two-tailed)"], ["greater", "p₁ > p₂ (Greater than)"], ["less", "p₁ < p₂ (Less than)"]]
            }
        ],
        run: { id: "twoPropZComputeBtn", text: "p Run Two-Proportion z-test + Steps" },
        clear: { id: "twoPropZClearBtn", text: "Clear" },
        result: {
            area: "twoPropZResultArea",
            label: "🎯 TWO-PROPORTION Z-TEST RESULTS",
            value: "twoPropZValueDisplay",
            steps: "twoPropZStepsDisplay"
        }
    });
}

// Pooled z-test of H0: p1 = p2 (the standard textbook test); the confidence interval uses the unpooled standard error
function computeTwoProportionZTest(x1, n1, x2, n2, alpha, alternative) {
    if (![x1, n1, x2, n2].every(v => Number.isInteger(v))) return { error: true, message: "Successes and sample sizes must be whole numbers." };
    if (n1 < 1 || n2 < 1) return { error: true, message: "Each sample size must be at least 1." };
    if (x1 < 0 || x1 > n1 || x2 < 0 || x2 > n2) return { error: true, message: "Successes must be between 0 and the sample size of that group." };
    const p1 = x1 / n1, p2 = x2 / n2;
    const pooled = (x1 + x2) / (n1 + n2);
    if (pooled === 0 || pooled === 1) return { error: true, message: "Every observation is a success (or every one a failure), so the pooled standard error is 0 and z is undefined." };
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
    const zStatistic = (p1 - p2) / se;
    const pValue = alternative === 'two.sided' ? 2 * normCDF(-Math.abs(zStatistic)) : (alternative === 'greater' ? normCDF(-zStatistic) : normCDF(zStatistic));
    const criticalZ = normInv(1 - (alternative === 'two.sided' ? alpha / 2 : alpha));
    const rejectH0 = pValue < alpha;
    const ciZ = normInv(1 - alpha / 2);
    const ciSE = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
    const sign = alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<');
    const critText = (alternative === 'two.sided' ? '±' : (alternative === 'less' ? '-' : '')) + criticalZ.toFixed(6);
    const texts = testDecisionTexts(rejectH0, alternative, 'the two population proportions', 'differ', 'are such that p₁ > p₂', 'are such that p₁ < p₂');
    const steps = summaryTestHtml({
        icon: 'p', title: 'Two-Proportion z-test (pooled)', formula: 'z = (p̂₁ - p̂₂) / √[p̂(1-p̂)(1/n₁ + 1/n₂)]',
        h0: 'H₀: p₁ = p₂', h1: `H₁: p₁ ${sign} p₂`,
        stats: [['Group 1 (x₁ / n₁)', `${x1} / ${n1}`], ['Group 2 (x₂ / n₂)', `${x2} / ${n2}`], ['p̂₁', p1.toFixed(6)], ['p̂₂', p2.toFixed(6)]],
        steps: [
            ['Pooled proportion', `p̂ = (x₁ + x₂) / (n₁ + n₂) = (${x1} + ${x2}) / (${n1} + ${n2}) = ${pooled.toFixed(6)}`],
            ['Standard error', `SE = √[p̂(1-p̂)(1/n₁ + 1/n₂)]<br>SE = √[${pooled.toFixed(6)} × ${(1 - pooled).toFixed(6)} × (1/${n1} + 1/${n2})] = ${se.toFixed(6)}`],
            ['z-statistic', `z = (p̂₁ - p̂₂) / SE = (${p1.toFixed(6)} - ${p2.toFixed(6)}) / ${se.toFixed(6)}<br><div class="s-505d41">z = ${zStatistic.toFixed(8)}</div>`],
            ['Critical value & p-value', `α = ${alpha}<br>Critical z-value = ${critText}<br>p-value = ${pValue.toFixed(8)}<br>Decision rule: reject H₀ when p-value &lt; α → ${pValue.toFixed(6)} ${rejectH0 ? '&lt;' : '≥'} ${alpha}`]
        ],
        rejectH0, conclusion: [['z-statistic', zStatistic.toFixed(6)], ['Critical value', critText], ['p-value', pValue.toFixed(8)]],
        decision: texts.decision, interpretation: texts.interpretation, significance: significanceLine(pValue, alpha),
        note: `💡 <strong>${(1 - alpha) * 100}% Confidence Interval for p₁ - p₂:</strong><br>${(p1 - p2).toFixed(4)} ± ${(ciZ * ciSE).toFixed(4)} → [${(p1 - p2 - ciZ * ciSE).toFixed(4)}, ${(p1 - p2 + ciZ * ciSE).toFixed(4)}]<br>Unpooled standard error for the interval: ${ciSE.toFixed(6)}`
    });
    return { zStatistic, pValue, criticalZ, rejectH0, p1, p2, pooled, steps, chart: { dist: 'z', df: undefined, stat: zStatistic, alternative: alternative, alpha: alpha, statLabel: 'z', critical: signedCritical(alternative, criticalZ) } };
}

function setupTwoProportionZLogic() {
    const computeBtn = document.getElementById("twoPropZComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const num = id => parseFloat(document.getElementById(id).value);
        const result = computeTwoProportionZTest(num("twoPropX1"), num("twoPropN1"), num("twoPropX2"), num("twoPropN2"),
            num("twoPropAlpha"), document.getElementById("twoPropAlternative").value);
        const resultDiv = document.getElementById("twoPropZResultArea");
        const valueSpan = document.getElementById("twoPropZValueDisplay");
        const stepsSpan = document.getElementById("twoPropZStepsDisplay");
        resultDiv.style.display = "block";
        if (result.error) {
            valueSpan.textContent = "Error";
            hideStatChartCard('test');
            setHtml(stepsSpan, "⚠️ " + escapeHtml(result.message));
            return;
        }
        setHtml(valueSpan, `z = ${result.zStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
        setHtml(stepsSpan, result.steps);
        showTestChart("twoPropZResultArea", result.chart);
    });
    attachClearHandler("twoPropZClearBtn", ["twoPropX1", "twoPropN1", "twoPropX2", "twoPropN2"], "twoPropZResultArea");
}
