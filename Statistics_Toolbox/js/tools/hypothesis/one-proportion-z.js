/* OneProportionZ: oneproportionz tool (render, compute, setup) */

// ========== ONE-SAMPLE PROPORTION Z-TEST INTERFACE ==========
function renderOneProportionZInterface() {
    return buildInterface({
        id: "statOneProportionZInterface",
        parameterOnly: true,   // number fields and drop-downs only: no pasted data, so no sample button
        title: "p One-Sample Proportion z-test",
        formula: "📌 z = (p̂ - p₀) / √[p₀(1-p₀)/n]",
        desc: "Tests whether the sample proportion differs from a hypothesized population proportion.",
        inputs: [
            {
                label: "📊 Number of Successes (x):",
                input: {
                    type: "number",
                    id: "propSuccesses",
                    value: "8",
                    step: "1",
                    min: "0",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Sample Size (n):",
                input: {
                    type: "number",
                    id: "propSampleSize",
                    value: "20",
                    step: "1",
                    min: "1",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Hypothesized Population Proportion (p₀):",
                input: {
                    type: "number",
                    id: "hypothesizedProp",
                    value: "0.5",
                    step: "0.1",
                    min: "0",
                    max: "1",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Significance Level (α):",
                select: { id: "propZAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_3
            },
            {
                label: "📋 Alternative Hypothesis:",
                select: { id: "propZAlternative", style: FIELD_STYLE },
                options: [["two.sided", "p ≠ p₀ (Two-tailed)"], ["greater", "p > p₀ (Greater than)"], ["less", "p < p₀ (Less than)"]]
            }
        ],
        run: { id: "onePropZComputeBtn", text: "p Run Proportion z-test + Steps" },
        clear: { id: "onePropZClearBtn", text: "Clear" },
        result: {
            area: "onePropZResultArea",
            label: "🎯 PROPORTION Z-TEST RESULTS",
            value: "onePropZValueDisplay",
            steps: "onePropZStepsDisplay"
        }
    });
}

// ========== ONE-SAMPLE PROPORTION Z-TEST COMPUTATION (COMPLETE WITH DETAILED STEPS) ==========
function computeOneProportionZTest(successes, n, p0, alpha, alternative) {
    if (n < 1) return { error: true, message: "Sample size must be at least 1." };
    if (successes < 0 || successes > n) return { error: true, message: "Successes must be between 0 and n." };
    if (!(p0 > 0 && p0 < 1)) return { error: true, message: "The hypothesized proportion p₀ must be strictly between 0 and 1 (for p₀ = 0 or 1 the standard error is 0 and z is undefined; use the exact binomial test instead)." };
    
    const pHat = successes / n;
    const standardError = Math.sqrt(p0 * (1 - p0) / n);
    const zStatistic = (pHat - p0) / standardError;
    
    let pValue;
    if (alternative === 'two.sided') {
        pValue = 2 * normCDF(-Math.abs(zStatistic));
    } else if (alternative === 'greater') {
        pValue = normCDF(-zStatistic);
    } else {
        pValue = normCDF(zStatistic);
    }
    
    const criticalZ = normInv(1 - (alternative === 'two.sided' ? alpha / 2 : alpha));
    const rejectH0 = pValue < alpha;
    // Confidence intervals are always two-sided at level 1 - α
    const ciZ = normInv(1 - alpha / 2);
    // The CI uses the sample proportion's own standard error, not the null-hypothesis one used for the test
    const ciSE = Math.sqrt(pHat * (1 - pHat) / n);
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the population proportion is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${p0}.` :
        `There is NOT sufficient evidence that the population proportion is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${p0}.`;
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">p</span>
                <h2 class="s-f8a94d">One-Sample Proportion z-test</h2>
            </div>
            <p class="s-259079">Formula: z = (p̂ - p₀) / √[p₀(1-p₀)/n]</p>
            <p class="s-20a400">H₀: p = ${p0} | H₁: p ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${p0}</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-a7ffd4 gen-grid">
                <div class="s-63afdf"><div class="s-137d30">Sample Size (n)</div><div class="s-c2434f">${n}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Successes (x)</div><div class="s-c2434f">${successes}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Sample Proportion (p̂)</div><div class="s-23ee8e">${pHat.toFixed(6)}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Hypothesized Proportion (p₀)</div><div class="s-23ee8e">${p0}</div></div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">1</div>
                    <div><strong>Calculate the Standard Error</strong></div>
                </div>
                <div class="s-f55593">
                    SE = √[p₀(1-p₀)/n]<br>
                    SE = √[${p0} × ${(1-p0).toFixed(4)} / ${n}]<br>
                    SE = √[${(p0 * (1-p0)).toFixed(6)} / ${n}]<br>
                    SE = √${((p0 * (1-p0)) / n).toFixed(6)} = ${standardError.toFixed(6)}
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Calculate the z-statistic</strong></div>
                </div>
                <div class="s-f55593">
                    z = (p̂ - p₀) / SE<br>
                    z = (${pHat.toFixed(6)} - ${p0}) / ${standardError.toFixed(6)}<br>
                    z = ${(pHat - p0).toFixed(6)} / ${standardError.toFixed(6)}<br>
                    <div class="s-505d41">z = ${zStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">3</div>
                    <div><strong>Critical Value & p-value</strong></div>
                </div>
                <div class="s-f55593">
                    α = ${alpha} (${(1-alpha)*100}% Confidence Level)<br>
                    Critical z-value = ${alternative === 'two.sided' ? '±' : (alternative === 'less' ? '-' : '')}${criticalZ.toFixed(6)}<br>
                    p-value = ${pValue.toFixed(8)}<br>
                    Decision rule: reject H₀ when p-value &lt; α → ${pValue.toFixed(6)} ${pValue < alpha ? '&lt;' : '≥'} ${alpha}
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>z-statistic:</strong> ${zStatistic.toFixed(6)}</div>
            <div><strong>Critical value:</strong> ${alternative === 'two.sided' ? '±' : (alternative === 'less' ? '-' : '')}${criticalZ.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
        
        <div class="s-afe18c">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for p:</strong><br>
            ${pHat.toFixed(4)} ± ${(ciZ * ciSE).toFixed(4)} → [${(pHat - ciZ * ciSE).toFixed(4)}, ${(pHat + ciZ * ciSE).toFixed(4)}]<br>Standard error for the interval: √(p̂(1-p̂)/n) = ${ciSE.toFixed(6)}
        </div>
    </div>`;
    
    return { zStatistic, pValue, criticalZ, rejectH0, pHat, n, steps, chart: { dist: 'z', df: undefined, stat: zStatistic, alternative: alternative, alpha: alpha, statLabel: 'z', critical: signedCritical(alternative, criticalZ) } };
}

function setupOneProportionZLogic() {
    const computeBtn = document.getElementById("onePropZComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const successes = parseInt(document.getElementById("propSuccesses").value);
        const n = parseInt(document.getElementById("propSampleSize").value);
        const p0 = parseFloat(document.getElementById("hypothesizedProp").value);
        const alpha = parseFloat(document.getElementById("propZAlpha").value);
        const alternative = document.getElementById("propZAlternative").value;
        const resultDiv = document.getElementById("onePropZResultArea");
        const valueSpan = document.getElementById("onePropZValueDisplay");
        const stepsSpan = document.getElementById("onePropZStepsDisplay");
        
        const result = computeOneProportionZTest(successes, n, p0, alpha, alternative);
        resultDiv.style.display = "block";
        if (result.error) {
            valueSpan.textContent = "Error";
            hideStatChartCard('test');
            setHtml(stepsSpan, "⚠️ " + escapeHtml(result.message));
            return;
        }
        setHtml(valueSpan, `z = ${result.zStatistic?.toFixed(6) || 'Error'} | p = ${result.pValue?.toFixed(6) || 'Error'}`);
        setHtml(stepsSpan, result.steps || "Calculation completed.");
            showTestChart("onePropZResultArea", result.chart);
    });
    attachClearHandler("onePropZClearBtn", ["propSuccesses", "propSampleSize"], "onePropZResultArea");
}
