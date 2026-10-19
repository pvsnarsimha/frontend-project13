/* TwoSampleT: twosamplet tool (render, compute, setup) */

// ========== TWO-SAMPLE T-TEST INTERFACE RENDER ==========
function renderTwoSampleTInterface() {
    return buildInterface({
        id: "statTwoSampleTInterface",
        title: "📊 Independent Two-Sample t-test",
        formula: "📌 t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)",
        desc: "Tests whether the means of two independent populations are significantly different (Welch's t-test, does not assume equal variances).",
        inputs: [
            {
                label: "📋 Enter Sample 1 data (comma, space, or line separated):",
                textarea: { id: "twoSampleData1", rows: "3", placeholder: "Example: 12, 15, 14, 16, 13, 15" }
            },
            {
                label: "📋 Enter Sample 2 data (comma, space, or line separated):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "twoSampleData2", rows: "3", placeholder: "Example: 18, 20, 19, 21, 22, 20, 19" }
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
function computeTwoSampleTTest(sample1, sample2, alpha, alternative) {
    if (!sample1.length || !sample2.length) {
        return { error: true, message: "Both samples must contain data." };
    }
    if (sample1.length < 2 || sample2.length < 2) {
        return { error: true, message: "Each sample needs at least 2 observations." };
    }
    
    const n1 = sample1.length;
    const n2 = sample2.length;
    
    const sum1 = sample1.reduce((a, b) => a + b, 0);
    const sum2 = sample2.reduce((a, b) => a + b, 0);
    const mean1 = sum1 / n1;
    const mean2 = sum2 / n2;
    
    // Calculate sample variances
    const var1 = sample1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / (n1 - 1);
    const var2 = sample2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / (n2 - 1);
    const stdDev1 = Math.sqrt(var1);
    const stdDev2 = Math.sqrt(var2);
    
    // Standard error
    const se = Math.sqrt(var1 / n1 + var2 / n2);
    
    // t-statistic
    const tStatistic = (mean1 - mean2) / se;
    
    // Welch-Satterthwaite degrees of freedom
    const numeratorDF = Math.pow(var1 / n1 + var2 / n2, 2);
    const denominatorDF = Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1);
    const df = numeratorDF / denominatorDF;
    
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
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📊</span>
                <h2 style="margin: 0;">Independent Two-Sample t-test (Welch's)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: μ₁ = μ₂ | H₁: μ₁ ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} μ₂</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Sample Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-weight: 700;">Sample 1</div>
                    <div>n₁ = ${n1}</div>
                    <div>x̄₁ = ${mean1.toFixed(6)}</div>
                    <div>s₁ = ${stdDev1.toFixed(6)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #dc3545;">
                    <div style="font-weight: 700;">Sample 2</div>
                    <div>n₂ = ${n2}</div>
                    <div>x̄₂ = ${mean2.toFixed(6)}</div>
                    <div>s₂ = ${stdDev2.toFixed(6)}</div>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate Standard Error</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    SE = √(s₁²/n₁ + s₂²/n₂)<br>
                    SE = √(${var1.toFixed(6)}/${n1} + ${var2.toFixed(6)}/${n2})<br>
                    SE = √(${(var1/n1).toFixed(6)} + ${(var2/n2).toFixed(6)})<br>
                    SE = ${se.toFixed(8)}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate t-statistic</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    t = (x̄₁ - x̄₂) / SE<br>
                    t = (${mean1.toFixed(6)} - ${mean2.toFixed(6)}) / ${se.toFixed(6)}<br>
                    t = ${(mean1 - mean2).toFixed(6)} / ${se.toFixed(6)}<br>
                    <div style="font-size: 20px; font-weight: 700; color: #1a5490; margin-top: 8px;">t = ${tStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Welch-Satterthwaite Degrees of Freedom</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    df = (s₁²/n₁ + s₂²/n₂)² / [ (s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1) ]<br>
                    df = ${df.toFixed(6)}<br>
                    α = ${alpha} | Critical Value = ${criticalValueText(criticalValue, alternative)} | p-value = ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>t-statistic:</strong> ${tStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df.toFixed(2)}</div>
            <div><strong>Critical Value:</strong> ${criticalValueText(criticalValue, alternative)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ Statistically significant at α = ${alpha}` : `✗ Not statistically significant at α = ${alpha}`}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for μ₁ - μ₂:</strong><br>
            ${(mean1 - mean2).toFixed(4)} ± ${(ciT * se).toFixed(4)} → [${(mean1 - mean2 - ciT * se).toFixed(4)}, ${(mean1 - mean2 + ciT * se).toFixed(4)}]<br>t<sub>${alpha / 2}, ${df.toFixed(2)}</sub> = ${ciT.toFixed(4)}
        </div>
    </div>`;
    
    return { tStatistic, df, pValue, criticalValue, rejectH0, conclusion, interpretation, mean1, mean2, stdDev1, stdDev2, steps };
}

function setupTwoSampleTLogic() {
    const computeBtn = document.getElementById("twoSampleTComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw1 = document.getElementById("twoSampleData1").value;
        const raw2 = document.getElementById("twoSampleData2").value;
        const sample1 = parseNumbersFromInput(raw1);
        const sample2 = parseNumbersFromInput(raw2);
        const alpha = parseFloat(document.getElementById("twoSampleAlpha").value);
        const alternative = document.getElementById("twoSampleAlternative").value;
        const resultDiv = document.getElementById("twoSampleTResultArea");
        const valueSpan = document.getElementById("twoSampleTValueDisplay");
        const stepsSpan = document.getElementById("twoSampleTStepsDisplay");
        
        if (!sample1.length || !sample2.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter both sample datasets.";
            return;
        }
        
        const result = computeTwoSampleTTest(sample1, sample2, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `t = ${result.tStatistic.toFixed(6)} | df = ${result.df.toFixed(2)} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("twoSampleTClearBtn", ["twoSampleData1", "twoSampleData2"], "twoSampleTResultArea");
}
