/* OneSampleT: onesamplet tool (render, compute, setup) */

// ========== ONE-SAMPLE T-TEST INTERFACE RENDER ==========
function renderOneSampleTInterface() {
    return buildInterface({
        id: "statOneSampleTInterface",
        title: "📐 One-Sample t-test",
        formula: "📌 t = (x̄ - μ₀) / (s / √n)",
        desc: "Tests whether the sample mean is significantly different from a hypothesized population mean (μ₀).",
        inputs: [
            {
                label: "📋 Enter sample data (comma, space, or line separated):",
                textarea: { id: "oneSampleData", rows: "3", placeholder: "Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15" }
            },
            {
                label: "📊 Hypothesized Population Mean (μ₀):",
                labelAttrs: { style: FIELD_GAP },
                input: {
                    type: "number",
                    id: "hypothesizedMean",
                    value: "15",
                    step: "any",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Significance Level (α):",
                select: { id: "oneSampleAlpha", style: FIELD_STYLE },
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
                    id: "oneSampleAlternative",
                    style: FIELD_STYLE
                },
                options: [["two.sided", "μ ≠ μ₀ (Two-tailed)"], ["greater", "μ > μ₀ (Greater than)"], ["less", "μ < μ₀ (Less than)"]]
            }
        ],
        run: { id: "oneSampleTComputeBtn", text: "📐 Run One-Sample t-test + Full Steps" },
        clear: { id: "oneSampleTClearBtn", text: "Clear" },
        result: {
            area: "oneSampleTResultArea",
            label: "🎯 ONE-SAMPLE T-TEST RESULTS",
            value: "oneSampleTValueDisplay",
            steps: "oneSampleTStepsDisplay"
        }
    });
}

// ========== ONE-SAMPLE T-TEST COMPUTATION ==========
function computeOneSampleTTest(data, mu0, alpha, alternative) {
    if (!data.length || data.length < 2) {
        return { error: true, message: "Need at least 2 observations for t-test." };
    }
    
    const n = data.length;
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Calculate sample standard deviation
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    const sumSqDiffs = squaredDiffs.reduce((a, b) => a + b, 0);
    const variance = sumSqDiffs / (n - 1);
    const stdDev = Math.sqrt(variance);
    
    // Calculate t-statistic
    const standardError = stdDev / Math.sqrt(n);
    const tStatistic = (mean - mu0) / standardError;
    
    // Degrees of freedom
    const df = n - 1;
    
    // Calculate critical value and p-value
    // Confidence intervals are two-sided at level 1 - α whatever the alternative of the test
    const ciT = tCriticalValue(alpha / 2, df);
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
    
    // Determine conclusion
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
        `There IS sufficient evidence that the population mean is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${mu0}.` :
        `There is NOT sufficient evidence that the population mean is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${mu0}.`;
    
    // Build steps
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📐</span>
                <h2 style="margin: 0;">One-Sample t-test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: t = (x̄ - μ₀) / (s / √n)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: μ = ${mu0} | H₁: μ ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${mu0}</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Sample Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Size (n)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Mean (x̄)</div><div style="font-size: 24px; font-weight: 700;">${mean.toFixed(6)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Std Dev (s)</div><div style="font-size: 20px;">${stdDev.toFixed(6)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Standard Error (SE)</div><div style="font-size: 20px;">${standardError.toFixed(6)}</div></div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate the t-statistic</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    t = (x̄ - μ₀) / (s / √n)<br>
                    t = (${mean.toFixed(6)} - ${mu0}) / (${stdDev.toFixed(6)} / √${n})<br>
                    t = ${(mean - mu0).toFixed(6)} / ${standardError.toFixed(6)}<br>
                    <div style="font-size: 20px; font-weight: 700; color: #1a5490; margin-top: 8px;">t = ${tStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Degrees of Freedom</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    df = n - 1 = ${n} - 1 = ${df}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Critical Value & p-value</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    α = ${alpha} (${(1-alpha)*100}% Confidence Level)<br>
                    Critical Value = ${criticalValueText(criticalValue, alternative)}<br>
                    p-value = ${pValue.toFixed(8)}<br>
                    ${alternative === 'two.sided' ? `|t| = ${Math.abs(tStatistic).toFixed(6)} ${Math.abs(tStatistic) > criticalValue ? '>' : '≤'} ${criticalValue.toFixed(6)}` : (alternative === 'greater' ? `t = ${tStatistic.toFixed(6)} ${tStatistic > criticalValue ? '>' : '≤'} ${criticalValue.toFixed(6)}` : `t = ${tStatistic.toFixed(6)} ${tStatistic < criticalValue ? '<' : '≥'} ${criticalValue.toFixed(6)}`)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>t-statistic:</strong> ${tStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value:</strong> ${criticalValueText(criticalValue, alternative)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value (${pValue.toFixed(6)}) < α (${alpha}) → Statistically significant` : `✗ p-value (${pValue.toFixed(6)}) > α (${alpha}) → Not statistically significant`}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for μ:</strong><br>
            ${mean.toFixed(4)} ± ${(ciT * standardError).toFixed(4)} → [${(mean - ciT * standardError).toFixed(4)}, ${(mean + ciT * standardError).toFixed(4)}]
        </div>
    </div>`;
    
    return { tStatistic, df, pValue, criticalValue, rejectH0, conclusion, interpretation, mean, stdDev, steps };
}

// ========== SETUP FUNCTIONS ==========
function setupOneSampleTLogic() {
    const computeBtn = document.getElementById("oneSampleTComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("oneSampleData").value;
        const data = parseNumbersFromInput(raw);
        const mu0 = parseFloat(document.getElementById("hypothesizedMean").value);
        const alpha = parseFloat(document.getElementById("oneSampleAlpha").value);
        const alternative = document.getElementById("oneSampleAlternative").value;
        const resultDiv = document.getElementById("oneSampleTResultArea");
        const valueSpan = document.getElementById("oneSampleTValueDisplay");
        const stepsSpan = document.getElementById("oneSampleTStepsDisplay");
        
        if (!data.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter sample data.";
            return;
        }
        
        const result = computeOneSampleTTest(data, mu0, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `t = ${result.tStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("oneSampleTClearBtn", "oneSampleData", "oneSampleTResultArea");
}
