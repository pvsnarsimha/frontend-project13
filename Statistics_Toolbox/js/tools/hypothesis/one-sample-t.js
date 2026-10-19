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
    if (!isFinite(mean) || !isFinite(stdDev)) {
        return { error: true, message: "The values are too large to compute with (the sums overflow). Rescale the data and try again." };
    }
    if (!(stdDev > 0)) {
        return { error: true, message: "All values are identical, so the sample standard deviation is 0 and the t statistic is undefined (the standard error is 0). Enter values that vary." };
    }
    
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
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">📐</span>
                <h2 class="s-f8a94d">One-Sample t-test</h2>
            </div>
            <p class="s-259079">Formula: t = (x̄ - μ₀) / (s / √n)</p>
            <p class="s-20a400">H₀: μ = ${mu0} | H₁: μ ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${mu0}</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Sample Statistics</h3>
            <div class="s-a7ffd4 gen-grid">
                <div class="s-63afdf"><div class="s-137d30">Sample Size (n)</div><div class="s-c2434f">${n}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Sample Mean (x̄)</div><div class="s-c2434f">${mean.toFixed(6)}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Sample Std Dev (s)</div><div class="s-23ee8e">${stdDev.toFixed(6)}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Standard Error (SE)</div><div class="s-23ee8e">${standardError.toFixed(6)}</div></div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">1</div>
                    <div><strong>Calculate the t-statistic</strong></div>
                </div>
                <div class="s-f55593">
                    t = (x̄ - μ₀) / (s / √n)<br>
                    t = (${mean.toFixed(6)} - ${mu0}) / (${stdDev.toFixed(6)} / √${n})<br>
                    t = ${(mean - mu0).toFixed(6)} / ${standardError.toFixed(6)}<br>
                    <div class="s-505d41">t = ${tStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Degrees of Freedom</strong></div>
                </div>
                <div class="s-f55593">
                    df = n - 1 = ${n} - 1 = ${df}
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">3</div>
                    <div><strong>Critical Value & p-value</strong></div>
                </div>
                <div class="s-f55593">
                    α = ${alpha} (${(1-alpha)*100}% Confidence Level)<br>
                    Critical Value = ${criticalValueText(criticalValue, alternative)}<br>
                    p-value = ${pValue.toFixed(8)}<br>
                    ${alternative === 'two.sided' ? `|t| = ${Math.abs(tStatistic).toFixed(6)} ${Math.abs(tStatistic) > criticalValue ? '>' : '≤'} ${criticalValue.toFixed(6)}` : (alternative === 'greater' ? `t = ${tStatistic.toFixed(6)} ${tStatistic > criticalValue ? '>' : '≤'} ${criticalValue.toFixed(6)}` : `t = ${tStatistic.toFixed(6)} ${tStatistic < criticalValue ? '<' : '≥'} ${criticalValue.toFixed(6)}`)}
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>t-statistic:</strong> ${tStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value:</strong> ${criticalValueText(criticalValue, alternative)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value (${pValue.toFixed(6)}) < α (${alpha}) → Statistically significant` : `✗ p-value (${pValue.toFixed(6)}) > α (${alpha}) → Not statistically significant`}
            </div>
        </div>
        
        <div class="s-afe18c">
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
