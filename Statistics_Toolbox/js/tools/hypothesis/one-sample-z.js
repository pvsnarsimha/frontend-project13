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
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">z</span>
                <h2 style="margin: 0;">One-Sample z-test (Known Population Variance)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: z = (x̄ - μ₀) / (σ / √n)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: μ = ${mu0} | H₁: μ ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${mu0}</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Sample Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Size (n)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Mean (x̄)</div><div style="font-size: 24px; font-weight: 700;">${mean.toFixed(6)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Known σ (Std Dev)</div><div style="font-size: 20px;">${sigma}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Standard Error (SE)</div><div style="font-size: 20px;">${standardError.toFixed(6)}</div></div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate the Standard Error</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    SE = σ / √n = ${sigma} / √${n} = ${sigma} / ${Math.sqrt(n).toFixed(4)} = ${standardError.toFixed(6)}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate the z-statistic</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    z = (x̄ - μ₀) / SE<br>
                    z = (${mean.toFixed(6)} - ${mu0}) / ${standardError.toFixed(6)}<br>
                    z = ${(mean - mu0).toFixed(6)} / ${standardError.toFixed(6)}<br>
                    <div style="font-size: 20px; font-weight: 700; color: #1a5490; margin-top: 8px;">z = ${zStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Critical Value & p-value</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    α = ${alpha} (${(1-alpha)*100}% Confidence Level)<br>
                    Critical z-value = ${alternative === 'two.sided' ? '±' : (alternative === 'less' ? '-' : '')}${criticalZ.toFixed(6)}<br>
                    p-value = ${pValue.toFixed(8)}<br>
                    Decision rule: reject H₀ when p-value &lt; α → ${pValue.toFixed(6)} ${pValue < alpha ? '&lt;' : '≥'} ${alpha}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>z-statistic:</strong> ${zStatistic.toFixed(6)}</div>
            <div><strong>Critical value:</strong> ${alternative === 'two.sided' ? '±' : (alternative === 'less' ? '-' : '')}${criticalZ.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value (${pValue.toFixed(6)}) < α (${alpha}) → Statistically significant` : `✗ p-value (${pValue.toFixed(6)}) > α (${alpha}) → Not statistically significant`}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
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
        setHtml(valueSpan, `z = ${result.zStatistic?.toFixed(6) || 'Error'} | p = ${result.pValue?.toFixed(6) || 'Error'}`);
        setHtml(stepsSpan, result.steps || "Calculation completed.");
    });
    attachClearHandler("oneSampleZClearBtn", "oneSampleZData", "oneSampleZResultArea");
}
