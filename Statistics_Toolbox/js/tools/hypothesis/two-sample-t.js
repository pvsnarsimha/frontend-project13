/* TwoSampleT: twosamplet tool (render, compute, setup) */

// ========== TWO-SAMPLE T-TEST INTERFACE RENDER ==========
function renderTwoSampleTInterface() {
    return buildInterface({
        id: "statTwoSampleTInterface",
        title: "📊 Independent Two-Sample t-test",
        formula: "📌 t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)",
        desc: "Tests whether the means of two independent populations are significantly different (Welch's t-test by default, which does not assume equal variances; choose “equal variances” for the pooled t-test many textbooks teach).",
        inputs: [
            inputModeItem("twoSampleMode1", "🧮 Summary statistics (n, mean, s)", "s1", "📥 Sample 1 is given as:"),
            {
                html: modeGroupHtml("raw", '<label>📋 Enter Sample 1 data (comma, space, or line separated):</label>\n<textarea id="twoSampleData1" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15"></textarea>', "s1") +
                    modeGroupHtml("summary", summaryFieldsHtml([["twoSampleN1", "Sample 1 size n₁:", "30", 'min="2"'], ["twoSampleMean1", "Sample 1 mean x̄₁:", "82"], ["twoSampleSd1", "Sample 1 standard deviation s₁:", "8", 'min="0"']]), "s1")
            },
            inputModeItem("twoSampleMode2", "🧮 Summary statistics (n, mean, s)", "s2", "📥 Sample 2 is given as:"),
            {
                html: modeGroupHtml("raw", '<label>📋 Enter Sample 2 data (comma, space, or line separated):</label>\n<textarea id="twoSampleData2" rows="3" placeholder="Example: 18, 20, 19, 21, 22, 20, 19"></textarea>', "s2") +
                    modeGroupHtml("summary", summaryFieldsHtml([["twoSampleN2", "Sample 2 size n₂:", "35", 'min="2"'], ["twoSampleMean2", "Sample 2 mean x̄₂:", "78"], ["twoSampleSd2", "Sample 2 standard deviation s₂:", "10", 'min="0"']]), "s2")
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "twoSampleAlpha", style: FIELD_STYLE },
                options: [
                    ["0.10", "α = 0.10 (90% Confidence)"],
                    ["0.05", "α = 0.05 (95% Confidence) - Standard", true],
                    ["0.01", "α = 0.01 (99% Confidence)"],
                    ["0.001", "α = 0.001 (99.9% Confidence)"]
                ]
            },
            {
                label: "📋 Alternative Hypothesis:",
                select: {
                    id: "twoSampleAlternative",
                    style: FIELD_STYLE
                },
                options: [
                    ["two.sided", "μ₁ ≠ μ₂ (Two-tailed)"],
                    ["greater", "μ₁ > μ₂ (Sample1 greater than Sample2)"],
                    ["less", "μ₁ < μ₂ (Sample1 less than Sample2)"]
                ]
            },
            {
                label: "📋 Variances:",
                select: { id: "twoSampleVariance", style: FIELD_STYLE },
                options: [["welch", "Not assumed equal (Welch) - safe default", true], ["pooled", "Assumed equal (pooled t-test)"]]
            }
        ],
        run: { id: "twoSampleTComputeBtn", text: "📊 Run Two-Sample t-test + Full Steps" },
        clear: { id: "twoSampleTClearBtn", text: "Clear All" },
        result: {
            area: "twoSampleTResultArea",
            label: "🎯 TWO-SAMPLE T-TEST RESULTS",
            value: "twoSampleTValueDisplay",
            steps: "twoSampleTStepsDisplay"
        }
    });
}

// ========== TWO-SAMPLE T-TEST (WELCH'S) COMPUTATION ==========
function computeTwoSampleTTest(sample1, sample2, alpha, alternative, pooled = false) {
    if (!sample1.length || !sample2.length) {
        return { error: true, message: "Both samples must contain data." };
    }
    if (sample1.length < 2 || sample2.length < 2) {
        return { error: true, message: "Each sample needs at least 2 observations." };
    }
    
    const n1 = sample1.length;
    const n2 = sample2.length;
    
    const mean1 = sample1.reduce((a, b) => a + b, 0) / n1;
    const mean2 = sample2.reduce((a, b) => a + b, 0) / n2;
    const stdDev1 = Math.sqrt(sample1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / (n1 - 1));
    const stdDev2 = Math.sqrt(sample2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / (n2 - 1));
    return computeTwoSampleTFromSummary(n1, mean1, stdDev1, n2, mean2, stdDev2, alpha, alternative, pooled);
}

// The same test from the summary a textbook question gives: n, x̄ and s for each group. Welch by default; pooled = true assumes equal variances.
function computeTwoSampleTFromSummary(n1, mean1, stdDev1, n2, mean2, stdDev2, alpha, alternative, pooled = false) {
    if (!(n1 >= 2 && n2 >= 2) || !Number.isInteger(n1) || !Number.isInteger(n2)) return { error: true, message: "Each sample size must be a whole number of at least 2." };
    if (!isFinite(mean1) || !isFinite(mean2)) return { error: true, message: "Enter both sample means as numbers." };
    if (!(stdDev1 >= 0 && stdDev2 >= 0) || !isFinite(stdDev1) || !isFinite(stdDev2)) return { error: true, message: "Each sample standard deviation must be a number that is 0 or more." };
    if (stdDev1 === 0 && stdDev2 === 0) return { error: true, message: "Both standard deviations are 0, so the standard error is 0 and the t statistic is undefined." };
    const var1 = stdDev1 * stdDev1;
    const var2 = stdDev2 * stdDev2;
    
    // Standard error
    // Pooled (equal variances): s_p² = [(n₁-1)s₁² + (n₂-1)s₂²] / (n₁+n₂-2), df = n₁+n₂-2. Welch: unpooled SE and Welch-Satterthwaite df.
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    const se = pooled ? Math.sqrt(pooledVar * (1 / n1 + 1 / n2)) : Math.sqrt(var1 / n1 + var2 / n2);
    const tStatistic = (mean1 - mean2) / se;
    const df = pooled ? n1 + n2 - 2 : Math.pow(var1 / n1 + var2 / n2, 2) / (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));
    
    // Confidence intervals are two-sided at level 1 - α whatever the alternative of the test
    const ciT = tCriticalValue(alpha / 2, df);
    
    // Critical value and p-value
    let criticalValue, pValue;
    
    if (alternative === 'two.sided') {
        criticalValue = tCriticalValue(alpha / 2, df);
        pValue = 2 * tCDF(-Math.abs(tStatistic), df);
    } else if (alternative === 'greater') {
        criticalValue = tCriticalValue(alpha, df);
        pValue = 1 - tCDF(tStatistic, df);
    } else {
        criticalValue = -tCriticalValue(alpha, df);
        pValue = tCDF(tStatistic, df);
    }
    
    let rejectH0;
    if (alternative === 'two.sided') {
        rejectH0 = Math.abs(tStatistic) > criticalValue;
    } else if (alternative === 'greater') {
        rejectH0 = tStatistic > criticalValue;
    } else {
        rejectH0 = tStatistic < criticalValue;
    }
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the means are ${alternative === 'two.sided' ? 'different' : (alternative === 'greater' ? 'μ₁ > μ₂' : 'μ₁ < μ₂')}.` :
        `There is NOT sufficient evidence that the means are ${alternative === 'two.sided' ? 'different' : (alternative === 'greater' ? 'μ₁ > μ₂' : 'μ₁ < μ₂')}.`;
    
    // Build steps
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">📊</span>
                <h2 class="s-f8a94d">Independent Two-Sample t-test (${pooled ? 'pooled variance' : "Welch's"})</h2>
            </div>
            <p class="s-259079">Formula: ${pooled ? 't = (x̄₁ - x̄₂) / √[s_p²(1/n₁ + 1/n₂)]' : 't = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)'}</p>
            <p class="s-20a400">H₀: μ₁ = μ₂ | H₁: μ₁ ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} μ₂</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Sample Statistics</h3>
            <div class="s-b00abc gen-grid">
                <div class="s-a31255">
                    <div class="s-cbd2a7">Sample 1</div>
                    <div>n₁ = ${n1}</div>
                    <div>x̄₁ = ${mean1.toFixed(6)}</div>
                    <div>s₁ = ${stdDev1.toFixed(6)}</div>
                </div>
                <div class="s-30eb0c">
                    <div class="s-cbd2a7">Sample 2</div>
                    <div>n₂ = ${n2}</div>
                    <div>x̄₂ = ${mean2.toFixed(6)}</div>
                    <div>s₂ = ${stdDev2.toFixed(6)}</div>
                </div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">1</div>
                    <div><strong>Calculate Standard Error</strong></div>
                </div>
                <div class="s-f55593">
                    ${pooled ? `s_p² = [(n₁-1)s₁² + (n₂-1)s₂²] / (n₁+n₂-2) = [${n1 - 1}×${var1.toFixed(6)} + ${n2 - 1}×${var2.toFixed(6)}] / ${n1 + n2 - 2} = ${pooledVar.toFixed(6)}<br>
                    SE = √[s_p²(1/n₁ + 1/n₂)] = √[${pooledVar.toFixed(6)} × (1/${n1} + 1/${n2})]<br>` : `SE = √(s₁²/n₁ + s₂²/n₂)<br>
                    SE = √(${var1.toFixed(6)}/${n1} + ${var2.toFixed(6)}/${n2})<br>
                    SE = √(${(var1/n1).toFixed(6)} + ${(var2/n2).toFixed(6)})<br>`}
                    SE = ${se.toFixed(8)}
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Calculate t-statistic</strong></div>
                </div>
                <div class="s-f55593">
                    t = (x̄₁ - x̄₂) / SE<br>
                    t = (${mean1.toFixed(6)} - ${mean2.toFixed(6)}) / ${se.toFixed(6)}<br>
                    t = ${(mean1 - mean2).toFixed(6)} / ${se.toFixed(6)}<br>
                    <div class="s-505d41">t = ${tStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">3</div>
                    <div><strong>${pooled ? 'Degrees of Freedom (pooled)' : 'Welch-Satterthwaite Degrees of Freedom'}</strong></div>
                </div>
                <div class="s-f55593">
                    ${pooled ? `df = n₁ + n₂ - 2 = ${n1} + ${n2} - 2<br>` : 'df = (s₁²/n₁ + s₂²/n₂)² / [ (s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1) ]<br>'}
                    df = ${df.toFixed(6)}<br>
                    α = ${alpha} | Critical Value = ${criticalValueText(criticalValue, alternative)} | p-value = ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>t-statistic:</strong> ${tStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df.toFixed(2)}</div>
            <div><strong>Critical Value:</strong> ${criticalValueText(criticalValue, alternative)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ Statistically significant at α = ${alpha}` : `✗ Not statistically significant at α = ${alpha}`}
            </div>
        </div>
        
        <div class="s-afe18c">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for μ₁ - μ₂:</strong><br>
            ${(mean1 - mean2).toFixed(4)} ± ${(ciT * se).toFixed(4)} → [${(mean1 - mean2 - ciT * se).toFixed(4)}, ${(mean1 - mean2 + ciT * se).toFixed(4)}]<br>t<sub>${alpha / 2}, ${df.toFixed(2)}</sub> = ${ciT.toFixed(4)}
        </div>
    </div>`;
    
    return { tStatistic, df, pValue, criticalValue, rejectH0, conclusion, interpretation, mean1, mean2, stdDev1, stdDev2, steps, chart: { dist: 't', df: df, stat: tStatistic, alternative: alternative, alpha: alpha, statLabel: 't', critical: signedCritical(alternative, criticalValue) } };
}

function setupTwoSampleTLogic() {
    const computeBtn = document.getElementById("twoSampleTComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const alpha = parseFloat(document.getElementById("twoSampleAlpha").value);
        const alternative = document.getElementById("twoSampleAlternative").value;
        const resultDiv = document.getElementById("twoSampleTResultArea");
        const valueSpan = document.getElementById("twoSampleTValueDisplay");
        const stepsSpan = document.getElementById("twoSampleTStepsDisplay");
        const pooled = document.getElementById("twoSampleVariance").value === "pooled";
        // each sample is either a list of values or a summary (n, mean, s); either way it is reduced to n, mean, s
        const num = id => parseFloat(document.getElementById(id).value);
        const readSample = i => {
            if (document.getElementById("twoSampleMode" + i).value === 'summary') return { n: num("twoSampleN" + i), mean: num("twoSampleMean" + i), sd: num("twoSampleSd" + i) };
            const values = parseNumbersFromInput(document.getElementById("twoSampleData" + i).value);
            if (!values.length) return null;
            const n = values.length, mean = values.reduce((x, y) => x + y, 0) / n;
            return { n, mean, sd: n > 1 ? Math.sqrt(values.reduce((x, y) => x + (y - mean) * (y - mean), 0) / (n - 1)) : NaN };
        };
        const s1 = readSample(1), s2 = readSample(2);
        
        if (!s1 || !s2) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter both samples (a list of values, or choose Summary statistics).";
            hideStatChartCard('test');
            return;
        }
        
        const result = computeTwoSampleTFromSummary(s1.n, s1.mean, s1.sd, s2.n, s2.mean, s2.sd, alpha, alternative, pooled);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `t = ${result.tStatistic.toFixed(6)} | df = ${result.df.toFixed(2)} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("twoSampleTResultArea", result.chart);
        }
    });
    
    attachClearHandler("twoSampleTClearBtn", ["twoSampleData1", "twoSampleData2", "twoSampleN1", "twoSampleMean1", "twoSampleSd1", "twoSampleN2", "twoSampleMean2", "twoSampleSd2"], "twoSampleTResultArea");
}
