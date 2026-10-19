/* OneSampleZ: onesamplez tool (render, compute, setup) */

// ========== ONE-SAMPLE Z-TEST (KNOWN VARIANCE) INTERFACE ==========
function renderOneSampleZInterface() {
    return buildInterface({
        id: "statOneSampleZInterface",
        title: "z One-Sample z-test (Known Population Variance)",
        formula: "📌 z = (x̄ - μ₀) / (σ / √n)",
        desc: "Tests whether the sample mean differs from a hypothesized population mean when the population variance is KNOWN.",
        inputs: [
            {
                label: "📋 Enter sample data (comma, space, or line separated):",
                textarea: { id: "oneSampleZData", rows: "3", placeholder: "Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15" }
            },
            {
                label: "📊 Hypothesized Population Mean (μ₀):",
                labelAttrs: { style: FIELD_GAP },
                input: {
                    type: "number",
                    id: "hypothesizedMeanZ",
                    value: "15",
                    step: "any",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Known Population Standard Deviation (σ):",
                input: {
                    type: "number",
                    id: "knownStdDev",
                    value: "2",
                    step: "any",
                    min: "0.01",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Significance Level (α):",
                select: { id: "oneSampleZAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_3
            },
            {
                label: "📋 Alternative Hypothesis:",
                select: {
                    id: "oneSampleZAlternative",
                    style: FIELD_STYLE
                },
                options: [["two.sided", "μ ≠ μ₀ (Two-tailed)"], ["greater", "μ > μ₀ (Greater than)"], ["less", "μ < μ₀ (Less than)"]]
            }
        ],
        run: { id: "oneSampleZComputeBtn", text: "z Run One-Sample z-test + Steps" },
        clear: { id: "oneSampleZClearBtn", text: "Clear" },
        result: {
            area: "oneSampleZResultArea",
            label: "🎯 ONE-SAMPLE Z-TEST RESULTS",
            value: "oneSampleZValueDisplay",
            steps: "oneSampleZStepsDisplay"
        }
    });
}

// ========== ONE-SAMPLE Z-TEST COMPUTATION (COMPLETE WITH DETAILED STEPS) ==========
function computeOneSampleZTest(data, mu0, sigma, alpha, alternative) {
    if (!data.length || data.length < 2) {
        return { error: true, message: "Need at least 2 observations." };
    }
    
    if (!(sigma > 0) || !isFinite(sigma)) return { error: true, message: "The known population standard deviation σ must be a number greater than 0." };
    
    const n = data.length;
    const sum = data.reduce((a,b) => a+b, 0);
    const mean = sum / n;
    const standardError = sigma / Math.sqrt(n);
    const zStatistic = (mean - mu0) / standardError;
    
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
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the population mean is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${mu0}.` :
        `There is NOT sufficient evidence that the population mean is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${mu0}.`;
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">z</span>
                <h2 class="s-f8a94d">One-Sample z-test (Known Population Variance)</h2>
            </div>
            <p class="s-259079">Formula: z = (x̄ - μ₀) / (σ / √n)</p>
            <p class="s-20a400">H₀: μ = ${mu0} | H₁: μ ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${mu0}</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Sample Statistics</h3>
            <div class="s-a7ffd4 gen-grid">
                <div class="s-63afdf"><div class="s-137d30">Sample Size (n)</div><div class="s-c2434f">${n}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Sample Mean (x̄)</div><div class="s-c2434f">${mean.toFixed(6)}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Known σ (Std Dev)</div><div class="s-23ee8e">${sigma}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Standard Error (SE)</div><div class="s-23ee8e">${standardError.toFixed(6)}</div></div>
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
                    SE = σ / √n = ${sigma} / √${n} = ${sigma} / ${Math.sqrt(n).toFixed(4)} = ${standardError.toFixed(6)}
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Calculate the z-statistic</strong></div>
                </div>
                <div class="s-f55593">
                    z = (x̄ - μ₀) / SE<br>
                    z = (${mean.toFixed(6)} - ${mu0}) / ${standardError.toFixed(6)}<br>
                    z = ${(mean - mu0).toFixed(6)} / ${standardError.toFixed(6)}<br>
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
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value (${pValue.toFixed(6)}) < α (${alpha}) → Statistically significant` : `✗ p-value (${pValue.toFixed(6)}) > α (${alpha}) → Not statistically significant`}
            </div>
        </div>
        
        <div class="s-afe18c">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for μ:</strong><br>
            ${mean.toFixed(4)} ± ${(ciZ * standardError).toFixed(4)} → [${(mean - ciZ * standardError).toFixed(4)}, ${(mean + ciZ * standardError).toFixed(4)}]
        </div>
    </div>`;
    
    return { zStatistic, pValue, criticalZ, rejectH0, mean, n, steps };
}

function setupOneSampleZLogic() {
    const computeBtn = document.getElementById("oneSampleZComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("oneSampleZData").value;
        const data = parseNumbersFromInput(raw);
        const mu0 = parseFloat(document.getElementById("hypothesizedMeanZ").value);
        const sigma = parseFloat(document.getElementById("knownStdDev").value);
        const alpha = parseFloat(document.getElementById("oneSampleZAlpha").value);
        const alternative = document.getElementById("oneSampleZAlternative").value;
        const resultDiv = document.getElementById("oneSampleZResultArea");
        const valueSpan = document.getElementById("oneSampleZValueDisplay");
        const stepsSpan = document.getElementById("oneSampleZStepsDisplay");
        
        if (!data.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter sample data.");
            return;
        }
        
        const result = computeOneSampleZTest(data, mu0, sigma, alpha, alternative);
        resultDiv.style.display = "block";
        if (result.error) {
            valueSpan.textContent = "Error";
            setHtml(stepsSpan, "⚠️ " + escapeHtml(result.message));
            return;
        }
        setHtml(valueSpan, `z = ${result.zStatistic?.toFixed(6) || 'Error'} | p = ${result.pValue?.toFixed(6) || 'Error'}`);
        setHtml(stepsSpan, result.steps || "Calculation completed.");
    });
    attachClearHandler("oneSampleZClearBtn", "oneSampleZData", "oneSampleZResultArea");
}
