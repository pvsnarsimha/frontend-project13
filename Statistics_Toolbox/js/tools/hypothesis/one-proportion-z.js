/* OneProportionZ: oneproportionz tool (render, compute, setup) */

// ========== ONE-SAMPLE PROPORTION Z-TEST INTERFACE ==========
function renderOneProportionZInterface() {
    return buildInterface({
        id: "statOneProportionZInterface",
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
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">p</span>
                <h2 style="margin: 0;">One-Sample Proportion z-test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: z = (p̂ - p₀) / √[p₀(1-p₀)/n]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: p = ${p0} | H₁: p ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${p0}</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Size (n)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Successes (x)</div><div style="font-size: 24px; font-weight: 700;">${successes}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Proportion (p̂)</div><div style="font-size: 20px;">${pHat.toFixed(6)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Hypothesized Proportion (p₀)</div><div style="font-size: 20px;">${p0}</div></div>
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
                    SE = √[p₀(1-p₀)/n]<br>
                    SE = √[${p0} × ${(1-p0).toFixed(4)} / ${n}]<br>
                    SE = √[${(p0 * (1-p0)).toFixed(6)} / ${n}]<br>
                    SE = √${((p0 * (1-p0)) / n).toFixed(6)} = ${standardError.toFixed(6)}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate the z-statistic</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    z = (p̂ - p₀) / SE<br>
                    z = (${pHat.toFixed(6)} - ${p0}) / ${standardError.toFixed(6)}<br>
                    z = ${(pHat - p0).toFixed(6)} / ${standardError.toFixed(6)}<br>
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
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for p:</strong><br>
            ${pHat.toFixed(4)} ± ${(ciZ * ciSE).toFixed(4)} → [${(pHat - ciZ * ciSE).toFixed(4)}, ${(pHat + ciZ * ciSE).toFixed(4)}]<br>Standard error for the interval: √(p̂(1-p̂)/n) = ${ciSE.toFixed(6)}
        </div>
    </div>`;
    
    return { zStatistic, pValue, criticalZ, rejectH0, pHat, n, steps };
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
        setHtml(valueSpan, `z = ${result.zStatistic?.toFixed(6) || 'Error'} | p = ${result.pValue?.toFixed(6) || 'Error'}`);
        setHtml(stepsSpan, result.steps || "Calculation completed.");
    });
    attachClearHandler("onePropZClearBtn", ["propSuccesses", "propSampleSize"], "onePropZResultArea");
}
