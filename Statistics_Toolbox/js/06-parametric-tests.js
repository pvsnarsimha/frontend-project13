/* Student t, ANOVA, F-test, correlation matrix, rank-based tests, chi-square critical values */
// ========== ONE-SAMPLE T-TEST INTERFACE RENDER ==========
function renderOneSampleTInterface() {
    return `
        <div class="stat-interface" id="statOneSampleTInterface">
            <div class="interface-title">📐 One-Sample t-test</div>
            <div class="formula-card">
                <div class="formula">📌 t = (x̄ - μ₀) / (s / √n)</div>
                <div class="desc">Tests whether the sample mean is significantly different from a hypothesized population mean (μ₀).</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter sample data (comma, space, or line separated):</label>
                <textarea id="oneSampleData" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15"></textarea>
                
                <label style="margin-top: 15px;">📊 Hypothesized Population Mean (μ₀):</label>
                <input type="number" id="hypothesizedMean" value="15" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Significance Level (α):</label>
                <select id="oneSampleAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                    <option value="0.001">α = 0.001 (99.9% Confidence)</option>
                </select>
                
                <label>📋 Alternative Hypothesis:</label>
                <select id="oneSampleAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">μ ≠ μ₀ (Two-tailed)</option>
                    <option value="greater">μ > μ₀ (Greater than)</option>
                    <option value="less">μ < μ₀ (Less than)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="oneSampleTComputeBtn">📐 Run One-Sample t-test + Full Steps</button>
                    <button class="secondary-btn" id="oneSampleTClearBtn">Clear</button>
                </div>
            </div>
            <div id="oneSampleTResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 ONE-SAMPLE T-TEST RESULTS</div>
                    <div class="result-value" id="oneSampleTValueDisplay">—</div>
                    <div class="calculation-steps" id="oneSampleTStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== TWO-SAMPLE T-TEST INTERFACE RENDER ==========
function renderTwoSampleTInterface() {
    return `
        <div class="stat-interface" id="statTwoSampleTInterface">
            <div class="interface-title">📊 Independent Two-Sample t-test</div>
            <div class="formula-card">
                <div class="formula">📌 t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)</div>
                <div class="desc">Tests whether the means of two independent populations are significantly different (Welch's t-test, does not assume equal variances).</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter Sample 1 data (comma, space, or line separated):</label>
                <textarea id="twoSampleData1" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter Sample 2 data (comma, space, or line separated):</label>
                <textarea id="twoSampleData2" rows="3" placeholder="Example: 18, 20, 19, 21, 22, 20, 19"></textarea>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="twoSampleAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                    <option value="0.001">α = 0.001 (99.9% Confidence)</option>
                </select>
                
                <label>📋 Alternative Hypothesis:</label>
                <select id="twoSampleAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">μ₁ ≠ μ₂ (Two-tailed)</option>
                    <option value="greater">μ₁ > μ₂ (Sample1 greater than Sample2)</option>
                    <option value="less">μ₁ < μ₂ (Sample1 less than Sample2)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="twoSampleTComputeBtn">📊 Run Two-Sample t-test + Full Steps</button>
                    <button class="secondary-btn" id="twoSampleTClearBtn">Clear All</button>
                </div>
            </div>
            <div id="twoSampleTResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 TWO-SAMPLE T-TEST RESULTS</div>
                    <div class="result-value" id="twoSampleTValueDisplay">—</div>
                    <div class="calculation-steps" id="twoSampleTStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
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
                    Critical Value = ${criticalValue.toFixed(6)}<br>
                    p-value = ${pValue.toFixed(8)}<br>
                    |t| = ${Math.abs(tStatistic).toFixed(6)} ${Math.abs(tStatistic) > criticalValue ? '>' : '<'} ${criticalValue.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>t-statistic:</strong> ${tStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value (${pValue.toFixed(6)}) < α (${alpha}) → Statistically significant` : `✗ p-value (${pValue.toFixed(6)}) > α (${alpha}) → Not statistically significant`}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for μ:</strong><br>
            ${mean.toFixed(4)} ± ${(criticalValue * standardError).toFixed(4)} → [${(mean - criticalValue * standardError).toFixed(4)}, ${(mean + criticalValue * standardError).toFixed(4)}]
        </div>
    </div>`;
    
    return { tStatistic, df, pValue, criticalValue, rejectH0, conclusion, interpretation, mean, stdDev, steps };
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
                    α = ${alpha} | Critical Value = ${criticalValue.toFixed(6)} | p-value = ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>t-statistic:</strong> ${tStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df.toFixed(2)}</div>
            <div><strong>Critical Value:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ Statistically significant at α = ${alpha}` : `✗ Not statistically significant at α = ${alpha}`}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for μ₁ - μ₂:</strong><br>
            ${(mean1 - mean2).toFixed(4)} ± ${(criticalValue * se).toFixed(4)} → [${(mean1 - mean2 - criticalValue * se).toFixed(4)}, ${(mean1 - mean2 + criticalValue * se).toFixed(4)}]
        </div>
    </div>`;
    
    return { tStatistic, df, pValue, criticalValue, rejectH0, conclusion, interpretation, mean1, mean2, stdDev1, stdDev2, steps };
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
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `t = ${result.tStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("oneSampleTClearBtn", "oneSampleData", "oneSampleTResultArea");
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
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `t = ${result.tStatistic.toFixed(6)} | df = ${result.df.toFixed(2)} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("twoSampleTClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("twoSampleData1").value = '';
            document.getElementById("twoSampleData2").value = '';
            document.getElementById("twoSampleTResultArea").style.display = 'none';
        });
    }
}
// ========== PAIRED T-TEST INTERFACE RENDER ==========
function renderPairedTInterface() {
    return `
        <div class="stat-interface" id="statPairedTInterface">
            <div class="interface-title">Paired t-test (Before-After Comparison)</div>
            <div class="formula-card">
                <div class="formula">t = (d_bar) / (s_d / sqrt(n))</div>
                <div class="desc">Tests whether the mean difference between paired observations (e.g., before-after) is significantly different from zero.</div>
            </div>
            <div class="data-input-section">
                <label>Before values (comma, space, or line separated):</label>
                <textarea id="pairedBeforeData" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15, 14"></textarea>
                
                <label style="margin-top: 15px;">After values (same number of observations):</label>
                <textarea id="pairedAfterData" rows="3" placeholder="Example: 14, 16, 15, 18, 15, 17, 16"></textarea>
                
                <label style="margin-top: 15px;">Significance Level (alpha):</label>
                <select id="pairedAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">alpha = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>alpha = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">alpha = 0.01 (99% Confidence)</option>
                    <option value="0.001">alpha = 0.001 (99.9% Confidence)</option>
                </select>
                
                <label>Alternative Hypothesis:</label>
                <select id="pairedAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">Mean difference != 0 (Two-tailed)</option>
                    <option value="greater">Mean difference > 0 (After > Before)</option>
                    <option value="less">Mean difference < 0 (After < Before)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="pairedTComputeBtn">Run Paired t-test + Full Steps</button>
                    <button class="secondary-btn" id="pairedTClearBtn">Clear All</button>
                </div>
            </div>
            <div id="pairedTResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">PAIRED T-TEST RESULTS</div>
                    <div class="result-value" id="pairedTValueDisplay">---</div>
                    <div class="calculation-steps" id="pairedTStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== ANOVA INTERFACE RENDER ==========
// ========== ANOVA INTERFACE RENDER (WITH MATH SYMBOLS) ==========
function renderANOVAInterface() {
    return `
        <div class="stat-interface" id="statANOVAInterface">
            <div class="interface-title">Analysis of Variance (ANOVA)</div>
            <div class="formula-card">
                <div class="formula">F = MS<sub>between</sub> / MS<sub>within</sub></div>
                <div class="desc">
                    <strong>Formula details:</strong><br>
                    • MS<sub>between</sub> = SS<sub>between</sub> / df<sub>between</sub><br>
                    • SS<sub>between</sub> = Σ n<sub>j</sub> × (x̄<sub>j</sub> - x̄<sub>grand</sub>)²<br>
                    • MS<sub>within</sub> = SS<sub>within</sub> / df<sub>within</sub><br>
                    • SS<sub>within</sub> = Σ Σ (x<sub>ij</sub> - x̄<sub>j</sub>)²
                </div>
                <div class="desc" style="margin-top: 8px;">
                    Tests whether there are significant differences among three or more group means.<br>
                    <strong>H₀:</strong> μ₁ = μ₂ = ... = μ<sub>k</sub> (All group means are equal)<br>
                    <strong>H₁:</strong> At least one group mean is different
                </div>
            </div>
            <div class="data-input-section">
                <label>Enter data with group labels (format: value:group):</label>
                <textarea id="anovaData" rows="5" placeholder="Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> value:group (comma or space separated)<br>
                    <strong>Example:</strong> 23:A means value 23 belongs to group A
                </div>
                
                <label style="margin-top: 15px;">Significance Level (α):</label>
                <select id="anovaAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                    <option value="0.001">α = 0.001 (99.9% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="anovaComputeBtn">Run ANOVA + Full Steps</button>
                    <button class="secondary-btn" id="anovaClearBtn">Clear</button>
                </div>
            </div>
            <div id="anovaResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">ANOVA RESULTS</div>
                    <div class="result-value" id="anovaValueDisplay">---</div>
                    <div class="calculation-steps" id="anovaStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== F-TEST INTERFACE RENDER ==========
function renderFTestInterface() {
    return `
        <div class="stat-interface" id="statFTestInterface">
            <div class="interface-title">F-test (Comparison of Variances)</div>
            <div class="formula-card">
                <div class="formula">F = s1^2 / s2^2  (where s1^2 >= s2^2)</div>
                <div class="desc">Tests whether two population variances are equal. Used to check homogeneity of variances assumption.</div>
            </div>
            <div class="data-input-section">
                <label>Enter Sample 1 data (comma, space, or line separated):</label>
                <textarea id="ftestData1" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15"></textarea>
                
                <label style="margin-top: 15px;">Enter Sample 2 data (comma, space, or line separated):</label>
                <textarea id="ftestData2" rows="3" placeholder="Example: 18, 20, 19, 21, 22, 20, 19"></textarea>
                
                <label style="margin-top: 15px;">Significance Level (alpha):</label>
                <select id="ftestAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">alpha = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>alpha = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">alpha = 0.01 (99% Confidence)</option>
                </select>
                
                <label>Alternative Hypothesis:</label>
                <select id="ftestAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">Variances are not equal (Two-tailed)</option>
                    <option value="greater">Variance1 > Variance2 (One-tailed)</option>
                    <option value="less">Variance1 < Variance2 (One-tailed)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="ftestComputeBtn">Run F-test + Full Steps</button>
                    <button class="secondary-btn" id="ftestClearBtn">Clear All</button>
                </div>
            </div>
            <div id="ftestResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">F-TEST RESULTS</div>
                    <div class="result-value" id="ftestValueDisplay">---</div>
                    <div class="calculation-steps" id="ftestStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== PAIRED T-TEST COMPUTATION ==========
// ========== PAIRED T-TEST COMPUTATION (WITH MATH SYMBOLS) ==========
function computePairedTTest(before, after, alpha, alternative) {
    if (!before.length || !after.length) {
        return { error: true, message: "Please enter both before and after data." };
    }
    if (before.length !== after.length) {
        return { error: true, message: "Before and after data must have the same number of observations." };
    }
    if (before.length < 2) {
        return { error: true, message: "Need at least 2 pairs for t-test." };
    }
    
    const n = before.length;
    let differences = [];
    let sumDiffs = 0;
    let diffDetails = [];
    
    for (let i = 0; i < n; i++) {
        let diff = after[i] - before[i];
        differences.push(diff);
        sumDiffs += diff;
        diffDetails.push({ before: before[i], after: after[i], diff: diff });
    }
    
    const meanDiff = sumDiffs / n;
    let sumSqDiffs = 0;
    let squaredDeviationDetails = [];
    
    for (let i = 0; i < n; i++) {
        let deviation = differences[i] - meanDiff;
        let squaredDeviation = deviation * deviation;
        sumSqDiffs += squaredDeviation;
        squaredDeviationDetails.push({ 
            diff: differences[i], 
            deviation: deviation, 
            squaredDeviation: squaredDeviation 
        });
    }
    
    const varianceDiff = sumSqDiffs / (n - 1);
    const stdDevDiff = Math.sqrt(varianceDiff);
    const standardError = stdDevDiff / Math.sqrt(n);
    const tStatistic = meanDiff / standardError;
    const df = n - 1;
    
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
        `There IS sufficient evidence that the mean difference is ${alternative === 'two.sided' ? 'different from zero' : (alternative === 'greater' ? 'greater than zero (after > before)' : 'less than zero (after < before)')}.` :
        `There is NOT sufficient evidence that the mean difference is ${alternative === 'two.sided' ? 'different from zero' : (alternative === 'greater' ? 'greater than zero' : 'less than zero')}.`;
    
    let diffTable = '';
    for (let i = 0; i < diffDetails.length; i++) {
        let d = diffDetails[i];
        let diffColor = d.diff > 0 ? '#28a745' : (d.diff < 0 ? '#dc3545' : '#6c757d');
        let diffSign = d.diff > 0 ? '+' : (d.diff < 0 ? '' : '');
        diffTable += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center; font-weight: 500;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${d.before}</td>
            <td style="padding: 8px; text-align: center;">${d.after}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: ${diffColor};">${diffSign}${d.diff.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-size: 12px; color: #6c757d;">${d.after} - ${d.before} = ${diffSign}${d.diff.toFixed(4)}</td>
        </tr>`;
    }
    
    let squaredDeviationRows = '';
    for (let i = 0; i < squaredDeviationDetails.length; i++) {
        let s = squaredDeviationDetails[i];
        let sign = s.deviation >= 0 ? '+' : '';
        squaredDeviationRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center; font-weight: 500;">${s.diff.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${s.diff.toFixed(4)} - ${meanDiff.toFixed(4)} = ${sign}${s.deviation.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: #1a5490;">(${sign}${s.deviation.toFixed(4)})^2 = ${s.squaredDeviation.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">t</span>
                <h2 style="margin: 0;">Paired t-test (Before-After Comparison)</h2>
            </div>
            <div style="margin-top: 12px; font-family: monospace; font-size: 14px;">
                <div>Formula: <strong>t = \u0304d / (s<sub>d</sub> / √n)</strong></div>
                <div style="margin-top: 8px;">Where:</div>
                <div>• \u0304d = Mean of the differences = (Σ dᵢ) / n</div>
                <div>• s<sub>d</sub> = Standard deviation of the differences</div>
                <div>• n = Number of pairs</div>
            </div>
            <p style="margin: 12px 0 0 0; opacity: 0.9;">H₀: μ<sub>d</sub> = 0 | H₁: μ<sub>d</sub> ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} 0</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Pairs (n)</div>
                    <div style="font-size: 24px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Mean Difference (\u0304d)</div>
                    <div style="font-size: 20px; font-weight: 600; color: ${meanDiff > 0 ? '#28a745' : (meanDiff < 0 ? '#dc3545' : '#6c757d')};">${meanDiff > 0 ? '+' : ''}${meanDiff.toFixed(6)}</div>
                    <div style="font-size: 11px;">= Average(After - Before)</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Std Dev of Differences (s<sub>d</sub>)</div>
                    <div style="font-size: 20px; font-weight: 600;">${stdDevDiff.toFixed(6)}</div>
                </div>
            </div>
            
            <h4 style="margin: 16px 0 8px 0;">Individual Pair Differences (dᵢ = Afterᵢ - Beforeᵢ)</h4>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Pair # (i)</th>
                            <th style="padding: 10px;">Before (xᵢ)</th>
                            <th style="padding: 10px;">After (yᵢ)</th>
                            <th style="padding: 10px;">Difference dᵢ = yᵢ - xᵢ</th>
                            <th style="padding: 10px;">Calculation</th>
                        </tr>
                    </thead>
                    <tbody>${diffTable}</tbody>
                 </table>
            </div>
            
            <div style="margin-top: 16px; padding: 12px; background: #e9ecef; border-radius: 8px; text-align: center;">
                <strong>Sum of Differences (Σ dᵢ):</strong> ${sumDiffs.toFixed(6)} &nbsp;|&nbsp;
                <strong>Mean Difference (\u0304d = Σ dᵢ / n):</strong> ${meanDiff.toFixed(6)}
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate the Mean Difference (\u0304d)</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    \u0304d = (Σ dᵢ) / n<br>
                    \u0304d = (${diffDetails.map(d => d.diff.toFixed(4)).join(' + ')}) / ${n}<br>
                    \u0304d = ${sumDiffs.toFixed(6)} / ${n}<br>
                    <strong style="color: #1a5490; font-size: 16px;">\u0304d = ${meanDiff.toFixed(8)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate the Standard Deviation of Differences (s<sub>d</sub>)</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div style="margin-bottom: 12px; font-family: monospace;">
                        Formula: <strong>s<sub>d</sub> = √[ Σ(dᵢ - \u0304d)² / (n - 1) ]</strong>
                    </div>
                    <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <strong>Explanation of each step:</strong><br><br>
                        • First, find how far each difference (dᵢ) deviates from the mean difference (\u0304d)<br>
                        • Calculate (dᵢ - \u0304d) for each pair - this is the deviation from the mean<br>
                        • Square each deviation: (dᵢ - \u0304d)² - squaring removes negative signs and gives more weight to larger deviations<br>
                        • Sum all squared deviations: Σ(dᵢ - \u0304d)²<br>
                        • Divide by (n - 1) to get the variance (using n-1 gives an unbiased estimate)<br>
                        • Take the square root to get back to original units: s<sub>d</sub> = √(variance)
                    </div>
                    
                    <h5 style="margin: 12px 0 8px 0; color: #1a5490;">Step 2a: Calculate deviations from mean and squared deviations</h5>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                            <thead>
                                <tr style="background: #1a5490; color: white;">
                                    <th style="padding: 8px;">Pair i</th>
                                    <th style="padding: 8px;">dᵢ</th>
                                    <th style="padding: 8px;">dᵢ - \u0304d (Deviation)</th>
                                    <th style="padding: 8px;">(dᵢ - \u0304d)² (Squared Deviation)</th>
                                </tr>
                            </thead>
                            <tbody>${squaredDeviationRows}</tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top: 12px; font-family: monospace;">
                        Σ(dᵢ - \u0304d)² = ${sumSqDiffs.toFixed(6)}<br><br>
                        Step 2b: Calculate variance = Σ(dᵢ - \u0304d)² / (n - 1)<br>
                        Variance = ${sumSqDiffs.toFixed(6)} / ${n - 1} = ${varianceDiff.toFixed(8)}<br><br>
                        Step 2c: Take square root to get standard deviation<br>
                        s<sub>d</sub> = √(${varianceDiff.toFixed(8)}) = <strong style="color: #1a5490;">${stdDevDiff.toFixed(8)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Calculate the t-statistic</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    Standard Error (SE) = s<sub>d</sub> / √n = ${stdDevDiff.toFixed(6)} / √${n} = ${standardError.toFixed(6)}<br><br>
                    t = \u0304d / SE = ${meanDiff.toFixed(6)} / ${standardError.toFixed(6)}<br>
                    <div style="font-size: 20px; font-weight: 700; color: #1a5490; margin-top: 8px;">t = ${tStatistic.toFixed(8)}</div>
                    <div>Degrees of Freedom (df) = n - 1 = ${df}</div>
                    <div>Critical value (α = ${alpha}) = ${criticalValue.toFixed(6)}</div>
                    <div>p-value = ${pValue.toFixed(8)}</div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">Test Conclusion</h3>
            <div><strong>t-statistic:</strong> ${tStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value (${alternative === 'two.sided' ? 'two-tailed' : 'one-tailed'}):</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px;">
            <h4 style="margin: 0 0 8px 0; color: #1a5490;">${(1-alpha)*100}% Confidence Interval for Mean Difference (μ<sub>d</sub>)</h4>
            <div style="font-family: monospace; font-size: 14px;">
                CI = \u0304d ± t<sub>critical</sub> × SE<br>
                CI = ${meanDiff.toFixed(4)} ± ${criticalValue.toFixed(4)} × ${standardError.toFixed(4)}<br>
                CI = ${meanDiff.toFixed(4)} ± ${(criticalValue * standardError).toFixed(4)}<br>
                <strong style="font-size: 16px;">CI = [${(meanDiff - criticalValue * standardError).toFixed(4)}, ${(meanDiff + criticalValue * standardError).toFixed(4)}]</strong>
            </div>
            <div style="margin-top: 8px; font-size: 13px; color: #555;">
                ${(meanDiff - criticalValue * standardError) > 0 ? '✓ The entire confidence interval is above zero, indicating a significant increase after the intervention.' : 
                  (meanDiff + criticalValue * standardError) < 0 ? '✓ The entire confidence interval is below zero, indicating a significant decrease after the intervention.' :
                  (meanDiff - criticalValue * standardError) < 0 && (meanDiff + criticalValue * standardError) > 0 ? '⚠ The confidence interval contains zero, indicating the change may not be statistically significant.' :
                  'Interpret the confidence interval relative to zero.'}
            </div>
        </div>
    </div>`;
    
    return { tStatistic, df, pValue, criticalValue, meanDiff, stdDevDiff, standardError, rejectH0, conclusion, interpretation, steps };
}
// ========== ANOVA COMPUTATION ==========
// ========== ANOVA COMPUTATION (WITH DETAILED EXPLANATIONS) ==========
function computeANOVA(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = escapeHtml(groupName.trim());
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for ANOVA. Use format 'value:group'" };
    }
    
    let allValues = [];
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupVariances = new Map();
    let groupSS = new Map(); // Sum of squares within each group
    let totalSum = 0;
    let totalN = 0;
    
    // Calculate group statistics with detailed steps
    let groupDetailsHtml = '';
    
    for (let [group, values] of groups) {
        let sum = values.reduce((a,b) => a+b, 0);
        let n = values.length;
        let mean = sum / n;
        
        // Calculate sum of squared deviations within group
        let ssGroup = 0;
        let deviationDetails = '';
        for (let val of values) {
            let dev = val - mean;
            let sqDev = dev * dev;
            ssGroup += sqDev;
            deviationDetails += `<tr><td style="padding: 4px 8px;">${val}</td><td style="padding: 4px 8px;">${val} - ${mean.toFixed(4)} = ${dev.toFixed(4)}</td><td style="padding: 4px 8px;">${sqDev.toFixed(4)}</td></tr>`;
        }
        
        let variance = ssGroup / (n - 1);
        
        groupMeans.set(group, mean);
        groupSizes.set(group, n);
        groupVariances.set(group, variance);
        groupSS.set(group, ssGroup);
        totalSum += sum;
        totalN += n;
        allValues.push(...values);
        
        groupDetailsHtml += `
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #1a5490;">
                <h4 style="margin: 0 0 12px 0; color: #1a5490;">Group "${group}"</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
                    <div><strong>n = ${n}</strong></div>
                    <div><strong>Σx = ${sum}</strong></div>
                    <div><strong>Mean (x̄) = ${mean.toFixed(6)}</strong></div>
                </div>
                <div style="margin-top: 12px;">
                    <strong>Calculating Sum of Squares within group (SS_within):</strong>
                    <table style="width: 100%; margin-top: 8px; border-collapse: collapse; font-size: 13px;">
                        <thead><tr style="background: #e9ecef;"><th>Value (x)</th><th>Deviation (x - x̄)</th><th>Squared Deviation (x - x̄)²</th></tr></thead>
                        <tbody>${deviationDetails}</tbody>
                        <tfoot><tr style="background: #f0f4fa;"><td colspan="2"><strong>Sum (SS) =</strong></td><td><strong>${ssGroup.toFixed(6)}</strong></td></tr></tfoot>
                    </table>
                </div>
                <div style="margin-top: 12px; font-family: monospace; font-size: 13px;">
                    <strong>Variance (s²) = SS / (n-1) = ${ssGroup.toFixed(6)} / ${n-1} = ${variance.toFixed(6)}</strong>
                </div>
            </div>
        `;
    }
    
    let grandMean = totalSum / totalN;
    let k = groups.size; // number of groups
    
    // Calculate SS Between (Between Groups)
    let ssBetween = 0;
    let ssBetweenDetails = '';
    for (let [group, n] of groupSizes) {
        let mean = groupMeans.get(group);
        let deviation = mean - grandMean;
        let contribution = n * Math.pow(deviation, 2);
        ssBetween += contribution;
        ssBetweenDetails += `
            <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 8px;">${group}</td>
                <td style="padding: 8px; text-align: center;">${n}</td>
                <td style="padding: 8px; text-align: center;">${mean.toFixed(6)}</td>
                <td style="padding: 8px; text-align: center;">${mean.toFixed(6)} - ${grandMean.toFixed(6)} = ${deviation.toFixed(6)}</td>
                <td style="padding: 8px; text-align: center;">${n} × (${deviation.toFixed(6)})² = ${contribution.toFixed(6)}</td>
            </tr>
        `;
    }
    
    // Calculate SS Within (Within Groups) - sum of all group SS
    let ssWithin = 0;
    let ssWithinDetails = '';
    for (let [group, ss] of groupSS) {
        ssWithin += ss;
        ssWithinDetails += `<tr><td style="padding: 8px;">${group}</td><td style="text-align: center;">${ss.toFixed(6)}</td></tr>`;
    }
    
    let ssTotal = ssBetween + ssWithin;
    let dfBetween = k - 1;
    let dfWithin = totalN - k;
    let dfTotal = totalN - 1;
    
    let msBetween = ssBetween / dfBetween;
    let msWithin = ssWithin / dfWithin;
    let fStatistic = msBetween / msWithin;
    
    let criticalValue = fCriticalValue(alpha, dfBetween, dfWithin);
    let pValue = 1 - fCDF(fStatistic, dfBetween, dfWithin);
    let rejectH0 = fStatistic > criticalValue;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        "There IS sufficient evidence that at least one group mean is significantly different from others." :
        "There is NOT sufficient evidence that the group means are different.";
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">F</span>
                <h2 style="margin: 0;">Analysis of Variance (ANOVA)</h2>
            </div>
            <div style="margin-top: 12px; font-family: monospace; font-size: 14px;">
                <div><strong>F = MS<sub>between</sub> / MS<sub>within</sub></strong></div>
                <div style="margin-top: 8px;">Where:</div>
                <div>• MS<sub>between</sub> = Mean Square Between Groups = SS<sub>between</sub> / df<sub>between</sub></div>
                <div>• MS<sub>within</sub> = Mean Square Within Groups = SS<sub>within</sub> / df<sub>within</sub></div>
            </div>
            <p style="margin: 12px 0 0 0; opacity: 0.9;">H₀: μ₁ = μ₂ = ... = μ<sub>k</sub> (All group means are equal)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₁: At least one group mean is different</p>
        </div>
        
        <!-- Section 1: Grand Mean -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step 1: Calculate the Grand Mean (Overall Mean)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 14px;">
                    <strong>Formula: x̄<sub>grand</sub> = (Σ all values) / N</strong><br><br>
                    Σ all values = ${totalSum.toFixed(6)}<br>
                    Total observations (N) = ${totalN}<br>
                    x̄<sub>grand</sub> = ${totalSum.toFixed(6)} / ${totalN} = <strong style="color: #1a5490;">${grandMean.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- Section 2: Individual Group Statistics -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step 2: Calculate Statistics for Each Group</h3>
            ${groupDetailsHtml}
        </div>
        
        <!-- Section 3: Sum of Squares Between Groups (SS_between) -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step 3: Calculate SS<sub>between</sub> (Between-Groups Sum of Squares)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="font-family: monospace; font-size: 14px; margin-bottom: 16px;">
                    <strong>Formula: SS<sub>between</sub> = Σ n<sub>j</sub> × (x̄<sub>j</sub> - x̄<sub>grand</sub>)²</strong>
                </div>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <strong>What does SS<sub>between</sub> measure?</strong><br>
                    It measures how much the group means deviate from the grand mean, weighted by group size.
                    A larger SS<sub>between</sub> indicates that the groups are more different from each other.
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Group</th>
                            <th style="padding: 10px;">n<sub>j</sub></th>
                            <th style="padding: 10px;">x̄<sub>j</sub></th>
                            <th style="padding: 10px;">x̄<sub>j</sub> - x̄<sub>grand</sub></th>
                            <th style="padding: 10px;">Contribution = n<sub>j</sub> × (x̄<sub>j</sub> - x̄<sub>grand</sub>)²</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ssBetweenDetails}
                        <tr style="background: #e9ecef; font-weight: 700;">
                            <td colspan="4" style="padding: 10px; text-align: right;">SS<sub>between</sub> =</td>
                            <td style="padding: 10px; text-align: center;">${ssBetween.toFixed(6)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Section 4: Sum of Squares Within Groups (SS_within) -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step 4: Calculate SS<sub>within</sub> (Within-Groups Sum of Squares)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="font-family: monospace; font-size: 14px; margin-bottom: 16px;">
                    <strong>Formula: SS<sub>within</sub> = Σ SS<sub>j</sub> = Σ Σ (x<sub>ij</sub> - x̄<sub>j</sub>)²</strong>
                </div>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <strong>What does SS<sub>within</sub> measure?</strong><br>
                    It measures the variability within each group (how spread out the values are around their group mean).
                    This is the sum of all squared deviations from each group's mean.
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Group</th>
                            <th style="padding: 10px;">SS<sub>within</sub> for Group (from Step 2)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ssWithinDetails}
                        <tr style="background: #e9ecef; font-weight: 700;">
                            <td style="padding: 10px;">SS<sub>within</sub> =</td>
                            <td style="padding: 10px; text-align: center;">${ssWithin.toFixed(6)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Section 5: Total Sum of Squares -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step 5: Calculate SS<sub>total</sub> (Total Sum of Squares)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 14px;">
                    <strong>Formula: SS<sub>total</sub> = SS<sub>between</sub> + SS<sub>within</sub></strong><br><br>
                    SS<sub>total</sub> = ${ssBetween.toFixed(6)} + ${ssWithin.toFixed(6)} = <strong style="color: #1a5490;">${ssTotal.toFixed(6)}</strong>
                </div>
                <div style="margin-top: 12px; background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>What does SS<sub>total</sub> represent?</strong><br>
                    Total variability in the data = Variability BETWEEN groups + Variability WITHIN groups.
                    This partitions the total variance into explained (between) and unexplained (within) components.
                </div>
            </div>
        </div>
        
        <!-- Section 6: Degrees of Freedom -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step 6: Calculate Degrees of Freedom (df)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 14px;">
                    <div><strong>df<sub>between</sub> = k - 1</strong> = ${groups.size} - 1 = ${dfBetween}</div>
                    <div style="margin-top: 8px;"><strong>df<sub>within</sub> = N - k</strong> = ${totalN} - ${groups.size} = ${dfWithin}</div>
                    <div style="margin-top: 8px;"><strong>df<sub>total</sub> = N - 1</strong> = ${totalN} - 1 = ${dfTotal}</div>
                </div>
                <div style="margin-top: 12px; background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>What are Degrees of Freedom?</strong><br>
                    • df<sub>between</sub>: Number of groups minus 1 (independent comparisons between group means)<br>
                    • df<sub>within</sub>: Total observations minus number of groups (variation within groups)<br>
                    • df<sub>total</sub>: Total observations minus 1 (total variation in the data)
                </div>
            </div>
        </div>
        
        <!-- Section 7: Mean Squares -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step 7: Calculate Mean Squares (MS)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 14px;">
                    <div><strong>MS<sub>between</sub> = SS<sub>between</sub> / df<sub>between</sub></strong> = ${ssBetween.toFixed(6)} / ${dfBetween} = <strong>${msBetween.toFixed(8)}</strong></div>
                    <div style="margin-top: 12px;"><strong>MS<sub>within</sub> = SS<sub>within</sub> / df<sub>within</sub></strong> = ${ssWithin.toFixed(6)} / ${dfWithin} = <strong>${msWithin.toFixed(8)}</strong></div>
                </div>
                <div style="margin-top: 12px; background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>What are Mean Squares?</strong><br>
                    • MS<sub>between</sub> = Average variability BETWEEN groups<br>
                    • MS<sub>within</sub> = Average variability WITHIN groups (also called "error variance")<br>
                    • They are "variance estimates" - the between-group variance and within-group variance
                </div>
            </div>
        </div>
        
        <!-- Section 8: F-statistic -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">Step 8: Calculate the F-statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center;">
                    <strong>F = MS<sub>between</sub> / MS<sub>within</sub></strong><br>
                    F = ${msBetween.toFixed(6)} / ${msWithin.toFixed(6)}<br>
                    <div style="font-size: 24px; font-weight: 700; color: #1a5490; margin-top: 12px;">F = ${fStatistic.toFixed(8)}</div>
                </div>
                <div style="margin-top: 12px; background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>What does the F-statistic tell us?</strong><br>
                    • F = (Variance BETWEEN groups) / (Variance WITHIN groups)<br>
                    • If F is large (> 1), group means differ more than expected by chance<br>
                    • If F ≈ 1, group means are similar (variation is just random error)<br>
                    • We compare F to a critical value from the F-distribution
                </div>
            </div>
        </div>
        
        <!-- Section 9: ANOVA Summary Table -->
        <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 2px solid #1a5490;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; text-align: center;">ANOVA Summary Table</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 12px;">Source of Variation</th>
                            <th style="padding: 12px;">Sum of Squares (SS)</th>
                            <th style="padding: 12px;">Degrees of Freedom (df)</th>
                            <th style="padding: 12px;">Mean Square (MS)</th>
                            <th style="padding: 12px;">F-statistic</th>
                            <th style="padding: 12px;">p-value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 12px;">Between Groups</td>
                            <td style="text-align: center;">${ssBetween.toFixed(4)}</td>
                            <td style="text-align: center;">${dfBetween}</td>
                            <td style="text-align: center;">${msBetween.toFixed(4)}</td>
                            <td rowspan="3" style="text-align: center; vertical-align: middle; font-weight: 700; font-size: 18px; background: #e8f4f8;">${fStatistic.toFixed(6)}</td>
                            <td rowspan="3" style="text-align: center; vertical-align: middle; background: #e8f4f8;">${pValue.toFixed(6)}</td>
                         </tr>
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 12px;">Within Groups (Error)</td>
                            <td style="text-align: center;">${ssWithin.toFixed(4)}</td>
                            <td style="text-align: center;">${dfWithin}</td>
                            <td style="text-align: center;">${msWithin.toFixed(4)}</td>
                         </tr>
                        <tr style="background: #e9ecef; font-weight: 700;">
                            <td style="padding: 12px;">Total</td>
                            <td style="text-align: center;">${ssTotal.toFixed(4)}</td>
                            <td style="text-align: center;">${dfTotal}</td>
                            <td style="text-align: center;">—</td>
                         </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Section 10: Conclusion -->
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">Test Conclusion</h3>
            <div><strong>F-statistic:</strong> ${fStatistic.toFixed(6)}</div>
            <div><strong>Critical value F<sub>critical</sub>(${dfBetween}, ${dfWithin}) at α = ${alpha}:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${fStatistic > criticalValue ? 
                    '✓ F-statistic > Critical value → Reject H₀' : 
                    '✗ F-statistic < Critical value → Cannot reject H₀'}
                ${pValue < alpha ? 
                    '✓ p-value < α → Statistically significant' : 
                    '✗ p-value > α → Not statistically significant'}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            <strong>📊 Interpretation Guide for ANOVA:</strong><br><br>
            • <strong>SS<sub>between</sub></strong>: Variability explained by group differences (signal)<br>
            • <strong>SS<sub>within</sub></strong>: Unexplained variability (noise/error)<br>
            • <strong>F-statistic</strong> = Signal / Noise. Larger F means stronger evidence against H₀<br>
            • If F > F<sub>critical</sub> or p-value < α, at least one group mean is significantly different<br>
            • To find WHICH groups differ, conduct post-hoc tests (Tukey HSD, Bonferroni, etc.)
        </div>
    </div>`;
    
    return { fStatistic, dfBetween, dfWithin, pValue, criticalValue, rejectH0, conclusion, interpretation, steps };
}



// ========== F-TEST COMPUTATION ==========
// ========== F-TEST COMPUTATION (WITH CLEAR VARIANCE EXPLANATION) ==========
function computeFTest(sample1, sample2, alpha, alternative) {
    if (!sample1.length || !sample2.length) {
        return { error: true, message: "Please enter both samples." };
    }
    if (sample1.length < 2 || sample2.length < 2) {
        return { error: true, message: "Each sample needs at least 2 observations." };
    }
    
    let n1 = sample1.length;
    let n2 = sample2.length;
    let mean1 = sample1.reduce((a,b) => a+b, 0) / n1;
    let mean2 = sample2.reduce((a,b) => a+b, 0) / n2;
    
    // Calculate variance with detailed steps for Sample 1
    let deviations1 = [];
    let squaredDeviations1 = [];
    let sumSq1 = 0;
    for (let i = 0; i < n1; i++) {
        let dev = sample1[i] - mean1;
        let sqDev = dev * dev;
        deviations1.push(dev);
        squaredDeviations1.push(sqDev);
        sumSq1 += sqDev;
    }
    let var1 = sumSq1 / (n1 - 1);
    
    // Calculate variance with detailed steps for Sample 2
    let deviations2 = [];
    let squaredDeviations2 = [];
    let sumSq2 = 0;
    for (let i = 0; i < n2; i++) {
        let dev = sample2[i] - mean2;
        let sqDev = dev * dev;
        deviations2.push(dev);
        squaredDeviations2.push(sqDev);
        sumSq2 += sqDev;
    }
    let var2 = sumSq2 / (n2 - 1);
    
    let fStatistic, df1, df2;
    let numeratorVar, denominatorVar;
    
    if (alternative === 'greater') {
        fStatistic = var1 / var2;
        df1 = n1 - 1;
        df2 = n2 - 1;
        numeratorVar = var1;
        denominatorVar = var2;
    } else if (alternative === 'less') {
        fStatistic = var2 / var1;
        df1 = n2 - 1;
        df2 = n1 - 1;
        numeratorVar = var2;
        denominatorVar = var1;
    } else {
        if (var1 >= var2) {
            fStatistic = var1 / var2;
            df1 = n1 - 1;
            df2 = n2 - 1;
            numeratorVar = var1;
            denominatorVar = var2;
        } else {
            fStatistic = var2 / var1;
            df1 = n2 - 1;
            df2 = n1 - 1;
            numeratorVar = var2;
            denominatorVar = var1;
        }
    }
    
    // Two-sided: the larger variance is placed on top, so the rejection region and the p-value
    // are for one tail of a folded statistic and must be halved / doubled to keep the level at alpha.
    const twoSided = alternative !== 'greater' && alternative !== 'less';
    let criticalValue = fCriticalValue(twoSided ? alpha / 2 : alpha, df1, df2);
    let pValue = Math.min(1, (twoSided ? 2 : 1) * (1 - fCDF(fStatistic, df1, df2)));
    let rejectH0 = fStatistic > criticalValue;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        "There IS sufficient evidence that the variances are different." :
        "There is NOT sufficient evidence that the variances are different.";
    
    // Build detailed variance calculation tables
    let var1Rows = '';
    for (let i = 0; i < n1; i++) {
        let sign1 = deviations1[i] >= 0 ? '+' : '';
        let sign2 = squaredDeviations1[i] >= 0 ? '+' : '';
        var1Rows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${sample1[i]}</td>
            <td style="padding: 8px; text-align: center;">${sample1[i]} - ${mean1.toFixed(4)} = ${sign1}${deviations1[i].toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: #1a5490;">(${sign1}${deviations1[i].toFixed(4)})² = ${squaredDeviations1[i].toFixed(4)}</td>
        </tr>`;
    }
    
    let var2Rows = '';
    for (let i = 0; i < n2; i++) {
        let sign1 = deviations2[i] >= 0 ? '+' : '';
        let sign2 = squaredDeviations2[i] >= 0 ? '+' : '';
        var2Rows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${sample2[i]}</td>
            <td style="padding: 8px; text-align: center;">${sample2[i]} - ${mean2.toFixed(4)} = ${sign1}${deviations2[i].toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: #1a5490;">(${sign1}${deviations2[i].toFixed(4)})² = ${squaredDeviations2[i].toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">F</span>
                <h2 style="margin: 0;">F-test (Comparison of Variances)</h2>
            </div>
            <div style="margin-top: 12px; font-family: monospace; font-size: 14px;">
                <div>Formula: <strong>F = s₁² / s₂²</strong> &nbsp;&nbsp;(where s₁² ≥ s₂²)</div>
                <div style="margin-top: 8px;">Where:</div>
                <div>• s₁² = Variance of sample 1 = Σ(xᵢ - x̄₁)² / (n₁ - 1)</div>
                <div>• s₂² = Variance of sample 2 = Σ(yᵢ - ȳ₂)² / (n₂ - 1)</div>
            </div>
            <p style="margin: 12px 0 0 0; opacity: 0.9;">H₀: σ₁² = σ₂² (Variances are equal) | H₁: σ₁² ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} σ₂²</p>
        </div>
        
        <!-- SECTION 1: SAMPLE 1 VARIANCE CALCULATION -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #28a745;">Sample 1 Variance Calculation (s₁²)</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <div style="font-family: monospace; font-size: 14px; margin-bottom: 12px;">
                    <strong>Formula: s₁² = Σ(xᵢ - x̄₁)² / (n₁ - 1)</strong>
                </div>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>Step-by-step explanation:</strong><br><br>
                    1. Calculate the mean of Sample 1: <strong>x̄₁ = (Σ xᵢ) / n₁</strong><br>
                    2. For each value, find the deviation from the mean: <strong>(xᵢ - x̄₁)</strong><br>
                    3. Square each deviation: <strong>(xᵢ - x̄₁)²</strong> (squaring removes negative signs)<br>
                    4. Sum all squared deviations: <strong>Σ(xᵢ - x̄₁)²</strong><br>
                    5. Divide by (n₁ - 1) to get the sample variance (unbiased estimate)
                </div>
                
                <div style="margin-top: 16px;">
                    <strong>Step 1: Calculate mean of Sample 1</strong><br>
                    x̄₁ = (${sample1.join(' + ')}) / ${n1} = ${mean1.toFixed(6)}
                </div>
                
                <div style="margin-top: 16px;">
                    <strong>Steps 2-4: Calculate squared deviations from the mean</strong>
                    <div style="overflow-x: auto; margin-top: 8px;">
                        <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                            <thead>
                                <tr style="background: #28a745; color: white;">
                                    <th style="padding: 8px;">i</th>
                                    <th style="padding: 8px;">xᵢ</th>
                                    <th style="padding: 8px;">xᵢ - x̄₁ (Deviation)</th>
                                    <th style="padding: 8px;">(xᵢ - x̄₁)² (Squared Deviation)</th>
                                 </tr>
                            </thead>
                            <tbody>${var1Rows}</tbody>
                         </table>
                    </div>
                </div>
                
                <div style="margin-top: 16px; font-family: monospace;">
                    <strong>Step 4: Sum of squared deviations</strong><br>
                    Σ(xᵢ - x̄₁)² = ${sumSq1.toFixed(6)}<br><br>
                    <strong>Step 5: Calculate sample variance</strong><br>
                    s₁² = Σ(xᵢ - x̄₁)² / (n₁ - 1)<br>
                    s₁² = ${sumSq1.toFixed(6)} / ${n1 - 1}<br>
                    <strong style="color: #28a745; font-size: 16px;">s₁² = ${var1.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- SECTION 2: SAMPLE 2 VARIANCE CALCULATION -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #dc3545;">Sample 2 Variance Calculation (s₂²)</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <div style="font-family: monospace; font-size: 14px; margin-bottom: 12px;">
                    <strong>Formula: s₂² = Σ(yᵢ - ȳ₂)² / (n₂ - 1)</strong>
                </div>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>Step-by-step explanation:</strong><br><br>
                    1. Calculate the mean of Sample 2: <strong>ȳ₂ = (Σ yᵢ) / n₂</strong><br>
                    2. For each value, find the deviation from the mean: <strong>(yᵢ - ȳ₂)</strong><br>
                    3. Square each deviation: <strong>(yᵢ - ȳ₂)²</strong><br>
                    4. Sum all squared deviations: <strong>Σ(yᵢ - ȳ₂)²</strong><br>
                    5. Divide by (n₂ - 1) to get the sample variance
                </div>
                
                <div style="margin-top: 16px;">
                    <strong>Step 1: Calculate mean of Sample 2</strong><br>
                    ȳ₂ = (${sample2.join(' + ')}) / ${n2} = ${mean2.toFixed(6)}
                </div>
                
                <div style="margin-top: 16px;">
                    <strong>Steps 2-4: Calculate squared deviations from the mean</strong>
                    <div style="overflow-x: auto; margin-top: 8px;">
                        <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                            <thead>
                                <tr style="background: #dc3545; color: white;">
                                    <th style="padding: 8px;">i</th>
                                    <th style="padding: 8px;">yᵢ</th>
                                    <th style="padding: 8px;">yᵢ - ȳ₂ (Deviation)</th>
                                    <th style="padding: 8px;">(yᵢ - ȳ₂)² (Squared Deviation)</th>
                                 </tr>
                            </thead>
                            <tbody>${var2Rows}</tbody>
                         </table>
                    </div>
                </div>
                
                <div style="margin-top: 16px; font-family: monospace;">
                    <strong>Step 4: Sum of squared deviations</strong><br>
                    Σ(yᵢ - ȳ₂)² = ${sumSq2.toFixed(6)}<br><br>
                    <strong>Step 5: Calculate sample variance</strong><br>
                    s₂² = Σ(yᵢ - ȳ₂)² / (n₂ - 1)<br>
                    s₂² = ${sumSq2.toFixed(6)} / ${n2 - 1}<br>
                    <strong style="color: #dc3545; font-size: 16px;">s₂² = ${var2.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- SECTION 3: F-TEST CALCULATION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">F-Test Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Identify the larger variance</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    s₁² = ${var1.toFixed(6)} &nbsp;|&nbsp; s₂² = ${var2.toFixed(6)}<br>
                    Larger variance = ${Math.max(var1, var2).toFixed(6)} (${var1 >= var2 ? 'Sample 1' : 'Sample 2'})<br>
                    Smaller variance = ${Math.min(var1, var2).toFixed(6)} (${var1 >= var2 ? 'Sample 2' : 'Sample 1'})
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate the F-statistic</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    <strong>F = (Larger Variance) / (Smaller Variance)</strong><br>
                    F = ${Math.max(var1, var2).toFixed(6)} / ${Math.min(var1, var2).toFixed(6)}<br>
                    <div style="font-size: 20px; font-weight: 700; color: #1a5490; margin-top: 8px;">F = ${fStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Determine Degrees of Freedom and Critical Value</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    df₁ (numerator) = n₁ - 1 = ${n1} - 1 = ${df1}<br>
                    df₂ (denominator) = n₂ - 1 = ${n2} - 1 = ${df2}<br>
                    Significance level (α) = ${alpha}<br>
                    Critical value F<sub>critical</sub>(${df1}, ${df2}) = ${criticalValue.toFixed(6)}<br>
                    p-value = ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <!-- SECTION 4: CONCLUSION -->
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">Test Conclusion</h3>
            <div><strong>F-statistic:</strong> ${fStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> (${df1}, ${df2})</div>
            <div><strong>Critical Value:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${fStatistic > criticalValue ? 
                    '✓ F-statistic > Critical value → Reject H₀, variances are significantly different' : 
                    '✗ F-statistic < Critical value → Cannot reject H₀, variances may be equal'}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            <strong>💡 Interpretation Guide for F-test:</strong><br>
            • If F > F<sub>critical</sub>, reject H₀ → Variances are significantly different<br>
            • If F ≤ F<sub>critical</sub>, fail to reject H₀ → Variances are not significantly different<br>
            • The F-test assumes both samples are from normally distributed populations<br>
            • This test is commonly used before performing a two-sample t-test to check the equal variance assumption
        </div>
    </div>`;
    
    return { fStatistic, df1, df2, pValue, criticalValue, rejectH0, conclusion, interpretation, steps };
}
// ========== PAIRED T-TEST SETUP ==========
function setupPairedTLogic() {
    const computeBtn = document.getElementById("pairedTComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawBefore = document.getElementById("pairedBeforeData").value;
        const rawAfter = document.getElementById("pairedAfterData").value;
        const before = parseNumbersFromInput(rawBefore);
        const after = parseNumbersFromInput(rawAfter);
        const alpha = parseFloat(document.getElementById("pairedAlpha").value);
        const alternative = document.getElementById("pairedAlternative").value;
        const resultDiv = document.getElementById("pairedTResultArea");
        const valueSpan = document.getElementById("pairedTValueDisplay");
        const stepsSpan = document.getElementById("pairedTStepsDisplay");
        
        if (!before.length || !after.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter both before and after data.";
            return;
        }
        
        const result = computePairedTTest(before, after, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `t = ${result.tStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H0' : 'Fail to reject H0'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("pairedTClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("pairedBeforeData").value = '';
            document.getElementById("pairedAfterData").value = '';
            document.getElementById("pairedTResultArea").style.display = 'none';
        });
    }
}

// ========== ANOVA SETUP ==========
function setupANOVALogic() {
    const computeBtn = document.getElementById("anovaComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("anovaData").value;
        const alpha = parseFloat(document.getElementById("anovaAlpha").value);
        const resultDiv = document.getElementById("anovaResultArea");
        const valueSpan = document.getElementById("anovaValueDisplay");
        const stepsSpan = document.getElementById("anovaStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format 'value:group'";
            return;
        }
        
        const result = computeANOVA(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `F = ${result.fStatistic.toFixed(6)} | df = (${result.dfBetween}, ${result.dfWithin}) | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("anovaClearBtn", "anovaData", "anovaResultArea");
}

// ========== F-TEST SETUP ==========
function setupFTestLogic() {
    const computeBtn = document.getElementById("ftestComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw1 = document.getElementById("ftestData1").value;
        const raw2 = document.getElementById("ftestData2").value;
        const sample1 = parseNumbersFromInput(raw1);
        const sample2 = parseNumbersFromInput(raw2);
        const alpha = parseFloat(document.getElementById("ftestAlpha").value);
        const alternative = document.getElementById("ftestAlternative").value;
        const resultDiv = document.getElementById("ftestResultArea");
        const valueSpan = document.getElementById("ftestValueDisplay");
        const stepsSpan = document.getElementById("ftestStepsDisplay");
        
        if (!sample1.length || !sample2.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter both sample datasets.";
            return;
        }
        
        const result = computeFTest(sample1, sample2, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `F = ${result.fStatistic.toFixed(6)} | df = (${result.df1}, ${result.df2}) | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("ftestClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("ftestData1").value = '';
            document.getElementById("ftestData2").value = '';
            document.getElementById("ftestResultArea").style.display = 'none';
        });
    }
}
// ========== CORRELATION MATRIX INTERFACE RENDER ==========
function renderCorrelationMatrixInterface() {
    return `
        <div class="stat-interface" id="statCorrelationMatrixInterface">
            <div class="interface-title">📊 Correlation Matrix</div>
            <div class="formula-card">
                <div class="formula">📌 r<sub>ij</sub> = correlation between variable i and variable j</div>
                <div class="desc">A correlation matrix shows pairwise correlation coefficients between multiple variables. Values range from -1 to +1.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter multiple variables (each line = one variable, values comma-separated):</label>
                <textarea id="corrMatrixData" rows="6" placeholder="Example:&#10;1, 2, 3, 4, 5, 6, 7, 8&#10;2, 4, 6, 8, 10, 12, 14, 16&#10;1, 3, 5, 7, 9, 11, 13, 15"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">Each line represents one variable. All variables must have the same number of observations.</div>
                <div class="action-row">
                    <button class="primary-btn" id="corrMatrixComputeBtn">📊 Calculate Correlation Matrix + Steps</button>
                    <button class="secondary-btn" id="corrMatrixClearBtn">Clear</button>
                </div>
            </div>
            <div id="corrMatrixResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 CORRELATION MATRIX</div>
                    <div class="result-value" id="corrMatrixValueDisplay">—</div>
                    <div class="calculation-steps" id="corrMatrixStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== DISTANCE CORRELATION INTERFACE RENDER ==========
function renderDistanceCorrelationInterface() {
    return `
        <div class="stat-interface" id="statDistanceCorrelationInterface">
            <div class="interface-title">📏 Distance Correlation (dCor)</div>
            <div class="formula-card">
                <div class="formula">📌 dCor(X,Y) = dCov(X,Y) / √(dVar(X)·dVar(Y))</div>
                <div class="desc">Distance correlation measures both linear and non-linear association between variables. dCor = 0 implies independence, dCor = 1 implies perfect dependence.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (comma, space, or line separated):</label>
                <textarea id="distCorrXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                <label style="margin-top: 15px;">📋 Enter Y values (same number of values):</label>
                <textarea id="distCorrYInput" rows="3" placeholder="Example: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="distCorrComputeBtn">📏 Calculate Distance Correlation + Steps</button>
                    <button class="secondary-btn" id="distCorrClearBtn">Clear All</button>
                </div>
            </div>
            <div id="distCorrResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 DISTANCE CORRELATION RESULT</div>
                    <div class="result-value" id="distCorrValueDisplay">—</div>
                    <div class="calculation-steps" id="distCorrStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== CORRELATION MATRIX COMPUTATION ==========
// ========== CORRELATION MATRIX COMPUTATION - WITH ULTRA DETAILED STEPS ==========
function computeCorrelationMatrixWithSteps(variables) {
    if (variables.length < 2) {
        return { error: true, message: "Need at least 2 variables for correlation matrix." };
    }
    
    const numVars = variables.length;  // number of variables
    const numObs = variables[0].length;  // number of observations per variable
    
    // Check all variables have same length
    for (let i = 0; i < numVars; i++) {
        if (variables[i].length !== numObs) {
            return { error: true, message: `Variable ${i+1} has ${variables[i].length} observations, expected ${numObs}.` };
        }
    }
    
    if (numObs < 3) {
        return { error: true, message: "Need at least 3 observations per variable." };
    }
    
    // ========== STEP 1: Calculate MEANS for each variable ==========
    let means = [];
    let meansTable = `<div style="overflow-x: auto;">
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px;">Variable</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Data Values</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Sum (Σ)</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">n</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Mean (x̄ = Σ/n)</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let i = 0; i < numVars; i++) {
        let sum = variables[i].reduce((a,b) => a+b, 0);
        let mean = sum / numObs;
        means.push(mean);
        meansTable += `<tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">X<sub>${i+1}</sub></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${variables[i].join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${sum}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${numObs}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; background: #e8f4f8; font-weight: bold;">${mean.toFixed(6)}</td>
        </tr>`;
    }
    meansTable += `</tbody>\\tour</div>`;
    
    // ========== STEP 2: Calculate STANDARD DEVIATIONS for each variable ==========
    let stdDevs = [];
    let stdTable = `<div style="overflow-x: auto;">
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px;">Variable</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Deviations (x - x̄)</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Squared Deviations (x - x̄)²</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Σ(x - x̄)²</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">s² = Σ/(n-1)</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">s = √s²</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let i = 0; i < numVars; i++) {
        let sumSqDiff = 0;
        let deviations = [];
        let squaredDeviations = [];
        
        for (let k = 0; k < numObs; k++) {
            let dev = variables[i][k] - means[i];
            let sqDev = dev * dev;
            deviations.push(dev.toFixed(4));
            squaredDeviations.push(sqDev.toFixed(4));
            sumSqDiff += sqDev;
        }
        
        let variance = sumSqDiff / (numObs - 1);
        let stdDev = Math.sqrt(variance);
        stdDevs.push(stdDev);
        
        stdTable += `<tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">X<sub>${i+1}</sub></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${deviations.join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${squaredDeviations.join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${sumSqDiff.toFixed(4)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${sumSqDiff.toFixed(4)}/${numObs-1} = ${variance.toFixed(6)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; background: #e8f4f8; font-weight: bold;">${stdDev.toFixed(6)}</td>
        </tr>`;
    }
    stdTable += `</tbody>\\tour</div>`;
    
    // ========== STEP 3: Calculate PAIRWISE CORRELATIONS ==========
    let corrMatrix = Array(numVars).fill().map(() => Array(numVars).fill(0));
    let pairwiseDetails = [];
    
    for (let i = 0; i < numVars; i++) {
        for (let j = i; j < numVars; j++) {
            if (i === j) {
                corrMatrix[i][j] = 1;
            } else {
                // Calculate covariance
                let cov = 0;
                let productDetails = [];
                let crossProducts = [];
                
                for (let k = 0; k < numObs; k++) {
                    let dev_i = variables[i][k] - means[i];
                    let dev_j = variables[j][k] - means[j];
                    let product = dev_i * dev_j;
                    cov += product;
                    crossProducts.push(product);
                    productDetails.push(`${dev_i.toFixed(4)} × ${dev_j.toFixed(4)} = ${product.toFixed(4)}`);
                }
                cov = cov / (numObs - 1);
                
                // Calculate correlation
                let r = cov / (stdDevs[i] * stdDevs[j]);
                corrMatrix[i][j] = r;
                corrMatrix[j][i] = r;
                
                pairwiseDetails.push({
                    var1: i+1,
                    var2: j+1,
                    mean1: means[i],
                    mean2: means[j],
                    std1: stdDevs[i],
                    std2: stdDevs[j],
                    covariance: cov,
                    correlation: r,
                    crossProducts: crossProducts,
                    productDetails: productDetails,
                    n: numObs
                });
            }
        }
    }
    
    // Build pairwise correlation HTML
    let pairwiseHtml = '';
    for (let pair of pairwiseDetails) {
        let crossTableRows = '';
        for (let k = 0; k < numObs; k++) {
            crossTableRows += `<tr>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${k+1}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${variables[pair.var1-1][k]}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${variables[pair.var2-1][k]}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${(variables[pair.var1-1][k] - pair.mean1).toFixed(4)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${(variables[pair.var2-1][k] - pair.mean2).toFixed(4)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold; background: #e8f4f8;">${pair.crossProducts[k].toFixed(4)}</td>
            </tr>`;
        }
        
        pairwiseHtml += `
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #1a5490;">
            <h4 style="margin: 0 0 15px 0; color: #1a5490;">📊 Correlation between X<sub>${pair.var1}</sub> and X<sub>${pair.var2}</sub></h4>
            
            <div style="margin-bottom: 20px;">
                <strong>Step A: Calculate Covariance</strong>
                <div style="font-family: monospace; font-size: 13px; margin-top: 10px;">
                    Cov(X,Y) = Σ[(x - x̄)(y - ȳ)] / (n - 1)
                </div>
                
                <div style="overflow-x: auto; margin-top: 10px;">
                    <table style="border-collapse: collapse; width: 100%;">
                        <thead>
                            <tr style="background: #f0f4fa;">
                                <th style="border: 1px solid #ddd; padding: 8px;">i</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">x</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">y</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">(x - x̄)</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">(y - ȳ)</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">(x - x̄)(y - ȳ)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${crossTableRows}
                            <tr style="background: #e9ecef; font-weight: bold;">
                                <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Σ =</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${pair.crossProducts.reduce((a,b)=>a+b,0).toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 15px; font-family: monospace;">
                    Cov(X<sub>${pair.var1}</sub>, X<sub>${pair.var2}</sub>) = ${pair.crossProducts.reduce((a,b)=>a+b,0).toFixed(4)} / ${pair.n - 1}<br>
                    = <strong style="color: #1a5490;">${pair.covariance.toFixed(8)}</strong>
                </div>
            </div>
            
            <div>
                <strong>Step B: Calculate Correlation</strong>
                <div style="font-family: monospace; font-size: 13px; margin-top: 10px;">
                    r = Cov(X,Y) / (s<sub>X</sub> × s<sub>Y</sub>)
                </div>
                <div style="margin-top: 10px; font-family: monospace;">
                    r = ${pair.covariance.toFixed(6)} / (${pair.std1.toFixed(6)} × ${pair.std2.toFixed(6)})<br>
                    r = ${pair.covariance.toFixed(6)} / ${(pair.std1 * pair.std2).toFixed(6)}<br>
                    = <strong style="color: #1a5490; font-size: 18px;">${pair.correlation.toFixed(8)}</strong>
                </div>
                
                <div style="margin-top: 10px; padding: 8px; background: #f0f4fa; border-radius: 6px;">
                    <strong>Interpretation:</strong> 
                    ${Math.abs(pair.correlation) > 0.7 ? 'Strong' : (Math.abs(pair.correlation) > 0.3 ? 'Moderate' : 'Weak')}
                    ${pair.correlation > 0 ? 'positive' : 'negative'} correlation
                </div>
            </div>
        </div>`;
    }
    
    // Build final correlation matrix table with color coding
    let matrixTable = `<div style="overflow-x: auto; margin-top: 20px;">
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0; text-align: center;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px;">Variable</th>`;
    for (let i = 0; i < numVars; i++) {
        matrixTable += `<th style="border: 1px solid #ddd; padding: 12px;">X<sub>${i+1}</sub></th>`;
    }
    matrixTable += `</tr>
            </thead>
            <tbody>`;
    
    for (let i = 0; i < numVars; i++) {
        matrixTable += `<tr>
            <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">X<sub>${i+1}</sub></th>`;
        for (let j = 0; j < numVars; j++) {
            let rVal = corrMatrix[i][j];
            let bgColor = '';
            let strengthText = '';
            
            if (i === j) {
                bgColor = '#d4edda';
                strengthText = 'Perfect';
            } else if (Math.abs(rVal) > 0.7) {
                bgColor = '#d4edda';
                strengthText = 'Strong';
            } else if (Math.abs(rVal) > 0.3) {
                bgColor = '#fff3cd';
                strengthText = 'Moderate';
            } else {
                bgColor = '#f8d7da';
                strengthText = 'Weak';
            }
            
            matrixTable += `<td style="border: 1px solid #ddd; padding: 12px; background: ${bgColor};">
                ${rVal.toFixed(4)}
                <br><span style="font-size: 10px; color: #666;">(${strengthText})</span>
             </td>`;
        }
        matrixTable += `</tr>`;
    }
    matrixTable += `</tbody>\\tour</div>`;
    
    // Complete HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <h2 style="margin: 0;">📊 Correlation Matrix</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Formula: r<sub>ij</sub> = Cov(X<sub>i</sub>, X<sub>j</sub>) / (s<sub>i</sub> × s<sub>j</sub>)</p>
            <p style="margin: 5px 0 0 0; opacity: 0.75;">Range: -1 (perfect negative) to +1 (perfect positive) | 0 = no linear correlation</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 STEP 1: Calculate Means (x̄ = Σx / n)</h3>
            ${meansTable}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 STEP 2: Calculate Standard Deviations (s = √[Σ(x - x̄)²/(n-1)])</h3>
            ${stdTable}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 STEP 3: Calculate Pairwise Correlations</h3>
            ${pairwiseHtml}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 FINAL CORRELATION MATRIX</h3>
            ${matrixTable}
            
            <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 8px;">
                <strong>📌 How to Read This Matrix:</strong><br>
                • <span style="color: #28a745;">Green cells</span> = Strong correlation (|r| > 0.7)<br>
                • <span style="color: #ffc107;">Yellow cells</span> = Moderate correlation (0.3 < |r| ≤ 0.7)<br>
                • <span style="color: #dc3545;">Red cells</span> = Weak correlation (|r| ≤ 0.3)<br>
                • Diagonal = Perfect correlation with itself (r = 1)<br>
                • Matrix is symmetric: r<sub>ij</sub> = r<sub>ji</sub>
            </div>
        </div>
    </div>`;
    
    return { corrMatrix, steps };
}
// ========== DISTANCE CORRELATION COMPUTATION ==========
// ========== DISTANCE CORRELATION COMPUTATION - WITH PROPERLY LABELED MATRICES ==========
function computeDistanceCorrelationWithSteps(x, y) {
    if (!x.length || !y.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (x.length !== y.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (x.length < 4) {
        return { error: true, message: "Need at least 4 observations for distance correlation." };
    }
    
    const n = x.length;
    
    // Step 1: Calculate Euclidean distance matrices
    let a = Array(n).fill().map(() => Array(n).fill(0));  // Distance matrix for X
    let b = Array(n).fill().map(() => Array(n).fill(0));  // Distance matrix for Y
    
    // Build matrices with proper formatting
    let aMatrixHtml = '';
    let bMatrixHtml = '';
    
    // First, create the distance matrices
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            a[i][j] = Math.abs(x[i] - x[j]);
            b[i][j] = Math.abs(y[i] - y[j]);
        }
    }
    
    // Build properly labeled distance matrix A (for X)
    aMatrixHtml = `<div style="overflow-x: auto; margin: 15px 0;">
        <table style="border-collapse: collapse; border: 2px solid #1a5490; margin: 0 auto;">
            <caption style="caption-side: top; margin-bottom: 10px; font-weight: bold; color: #1a5490;">Distance Matrix A (for X): a<sub>ij</sub> = |x<sub>i</sub> - x<sub>j</sub>|</caption>
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px;">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        aMatrixHtml += `<th style="border: 1px solid #ddd; padding: 10px;">j=${j+1}<br>(x=${x[j]})</th>`;
    }
    aMatrixHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        aMatrixHtml += `<tr style="background: ${i % 2 === 0 ? '#f8f9fa' : 'white'};">
            <th style="border: 1px solid #ddd; padding: 10px; background: #e8f4f8;">i=${i+1}<br>(x=${x[i]})</th>`;
        for (let j = 0; j < n; j++) {
            let bgColor = (i === j) ? '#d4edda' : '';
            let value = a[i][j];
            aMatrixHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; background: ${bgColor};">
                ${value.toFixed(2)}
                ${i === j ? '<br><span style="font-size: 10px;">(zero)</span>' : ''}
            </td>`;
        }
        aMatrixHtml += `</tr>`;
    }
    aMatrixHtml += `</tbody></table>
        <div style="margin-top: 8px; font-size: 12px; color: #6c757d; text-align: center;">
            💡 Note: Diagonal values (i=j) are always 0 because distance from a point to itself is zero.<br>
            The matrix is symmetric: a<sub>ij</sub> = a<sub>ji</sub>
        </div>
    </div>`;
    
    // Build properly labeled distance matrix B (for Y)
    bMatrixHtml = `<div style="overflow-x: auto; margin: 15px 0;">
        <table style="border-collapse: collapse; border: 2px solid #2e7d32; margin: 0 auto;">
            <caption style="caption-side: top; margin-bottom: 10px; font-weight: bold; color: #2e7d32;">Distance Matrix B (for Y): b<sub>ij</sub> = |y<sub>i</sub> - y<sub>j</sub>|</caption>
            <thead>
                <tr style="background: #2e7d32; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px;">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        bMatrixHtml += `<th style="border: 1px solid #ddd; padding: 10px;">j=${j+1}<br>(y=${y[j]})</th>`;
    }
    bMatrixHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        bMatrixHtml += `<tr style="background: ${i % 2 === 0 ? '#f8f9fa' : 'white'};">
            <th style="border: 1px solid #ddd; padding: 10px; background: #e8f4f8;">i=${i+1}<br>(y=${y[i]})</th>`;
        for (let j = 0; j < n; j++) {
            let bgColor = (i === j) ? '#d4edda' : '';
            let value = b[i][j];
            bMatrixHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; background: ${bgColor};">
                ${value.toFixed(2)}
                ${i === j ? '<br><span style="font-size: 10px;">(zero)</span>' : ''}
            </td>`;
        }
        bMatrixHtml += `</tr>`;
    }
    bMatrixHtml += `</tbody></table>
        <div style="margin-top: 8px; font-size: 12px; color: #6c757d; text-align: center;">
            💡 The distance matrix shows how far apart each pair of observations is.
        </div>
    </div>`;
    
    // Step 2: Calculate row means and grand mean for A
    let aRowMeans = Array(n).fill(0);
    let aGrandMean = 0;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += a[i][j];
        }
        aRowMeans[i] = sum / n;
        aGrandMean += sum;
    }
    aGrandMean = aGrandMean / (n * n);
    
    // Step 3: Calculate row means and grand mean for B
    let bRowMeans = Array(n).fill(0);
    let bGrandMean = 0;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += b[i][j];
        }
        bRowMeans[i] = sum / n;
        bGrandMean += sum;
    }
    bGrandMean = bGrandMean / (n * n);
    
    // Step 4: Double-center the distance matrices
    let A_centered = Array(n).fill().map(() => Array(n).fill(0));
    let B_centered = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            A_centered[i][j] = a[i][j] - aRowMeans[i] - aRowMeans[j] + aGrandMean;
            B_centered[i][j] = b[i][j] - bRowMeans[i] - bRowMeans[j] + bGrandMean;
        }
    }
    
    // Build centered matrices HTML
    let centeredAHtml = '';
    let centeredBHtml = '';
    
    centeredAHtml = `<div style="overflow-x: auto; margin: 15px 0;">
        <table style="border-collapse: collapse; border: 1px solid #ddd; margin: 0 auto;">
            <caption style="caption-side: top; margin-bottom: 10px; font-weight: bold;">Centered Matrix A': A'<sub>ij</sub> = a<sub>ij</sub> - Ā<sub>i·</sub> - Ā<sub>·j</sub> + Ā<sub>··</sub></caption>
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 8px;">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        centeredAHtml += `<th style="border: 1px solid #ddd; padding: 8px;">${j+1}</th>`;
    }
    centeredAHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        centeredAHtml += `<tr>
            <th style="border: 1px solid #ddd; padding: 8px; background: #e8f4f8;">${i+1}</th>`;
        for (let j = 0; j < n; j++) {
            let val = A_centered[i][j];
            centeredAHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; ${val >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">
                ${val >= 0 ? '+' : ''}${val.toFixed(2)}
            </td>`;
        }
        centeredAHtml += `</tr>`;
    }
    centeredAHtml += `</tbody></table></div>`;
    
    centeredBHtml = `<div style="overflow-x: auto; margin: 15px 0;">
        <table style="border-collapse: collapse; border: 1px solid #ddd; margin: 0 auto;">
            <caption style="caption-side: top; margin-bottom: 10px; font-weight: bold;">Centered Matrix B': B'<sub>ij</sub> = b<sub>ij</sub> - B̄<sub>i·</sub> - B̄<sub>·j</sub> + B̄<sub>··</sub></caption>
            <thead>
                <tr style="background: #2e7d32; color: white;">
                    <th style="border: 1px solid #ddd; padding: 8px;">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        centeredBHtml += `<th style="border: 1px solid #ddd; padding: 8px;">${j+1}</th>`;
    }
    centeredBHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        centeredBHtml += `<tr>
            <th style="border: 1px solid #ddd; padding: 8px; background: #e8f4f8;">${i+1}</th>`;
        for (let j = 0; j < n; j++) {
            let val = B_centered[i][j];
            centeredBHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; ${val >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">
                ${val >= 0 ? '+' : ''}${val.toFixed(2)}
            </td>`;
        }
        centeredBHtml += `</tr>`;
    }
    centeredBHtml += `</tbody></table></div>`;
    
    // Step 5: Calculate distance covariance and variances
    let dCov = 0;
    let dVarX = 0;
    let dVarY = 0;
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            dCov += A_centered[i][j] * B_centered[i][j];
            dVarX += A_centered[i][j] * A_centered[i][j];
            dVarY += B_centered[i][j] * B_centered[i][j];
        }
    }
    
    dCov = dCov / (n * n);
    dVarX = dVarX / (n * n);
    dVarY = dVarY / (n * n);
    
    let dCor = dCov / Math.sqrt(dVarX * dVarY);
    
    // Calculate Pearson correlation for comparison
    let pearsonResult = computePearsonWithSteps(x, y);
    let pearsonR = pearsonResult.r || 0;
    
    // Build complete HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📏</span>
                <h2 style="margin: 0;">Distance Correlation (dCor)</h2>
            </div>
            <div style="margin-top: 12px; font-family: monospace; font-size: 13px;">
                <div><strong>What is Distance Correlation?</strong></div>
                <div>Unlike Pearson correlation which only detects LINEAR relationships, distance correlation can detect ANY type of relationship (linear, quadratic, exponential, periodic, etc.)</div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Input Data</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Observations (n)</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Pearson Correlation (for comparison)</div>
                    <div style="font-size: 20px;">${pearsonR.toFixed(6)}</div>
                </div>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">i</th>
                            <th style="padding: 10px;">Xᵢ</th>
                            <th style="padding: 10px;">Yᵢ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${x.map((val, i) => `<tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 8px; text-align: center; font-weight: bold;">${i+1}</td>
                            <td style="padding: 8px; text-align: center;">${val}</td>
                            <td style="padding: 8px; text-align: center;">${y[i]}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step 1: Calculate Distance Matrices</h3>
            <div style="font-family: monospace; font-size: 13px; margin-bottom: 12px;">
                <strong>Formula: a<sub>ij</sub> = |x<sub>i</sub> - x<sub>j</sub>|</strong> (Euclidean distance for 1D)
            </div>
            
            ${aMatrixHtml}
            ${bMatrixHtml}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step 2: Calculate Row Means and Grand Means</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>For Matrix A (X distances):</strong>
                <div style="font-family: monospace; font-size: 13px; margin-top: 8px;">
                    <strong>Row means (Ā<sub>i·</sub>):</strong> ${aRowMeans.map((m, i) => `Ā<sub>${i+1}·</sub> = ${m.toFixed(4)}`).join(', ')}<br>
                    <strong>Grand mean (Ā<sub>··</sub>):</strong> ${aGrandMean.toFixed(6)}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>For Matrix B (Y distances):</strong>
                <div style="font-family: monospace; font-size: 13px; margin-top: 8px;">
                    <strong>Row means (B̄<sub>i·</sub>):</strong> ${bRowMeans.map((m, i) => `B̄<sub>${i+1}·</sub> = ${m.toFixed(4)}`).join(', ')}<br>
                    <strong>Grand mean (B̄<sub>··</sub>):</strong> ${bGrandMean.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step 3: Double-Center the Distance Matrices</h3>
            <div style="font-family: monospace; font-size: 13px; margin-bottom: 12px;">
                <strong>Formula: A'<sub>ij</sub> = a<sub>ij</sub> - Ā<sub>i·</sub> - Ā<sub>·j</sub> + Ā<sub>··</sub></strong><br>
                <span style="font-size: 12px;">This centers the matrix so that row and column means are zero.</span>
            </div>
            
            <details open>
                <summary style="cursor: pointer; color: #1a5490; font-weight: bold;">Click to see double-centered matrices</summary>
                <div style="margin-top: 12px;">
                    <h4>Centered Matrix A' (Green = positive, Red = negative):</h4>
                    ${centeredAHtml}
                    <h4>Centered Matrix B' (Green = positive, Red = negative):</h4>
                    ${centeredBHtml}
                </div>
            </details>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 4: Calculate Distance Covariance and Variances</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Distance Covariance (dCov):</strong>
                <div style="font-family: monospace; font-size: 14px;">
                    dCov = (1/n²) × Σ Σ A'<sub>ij</sub> × B'<sub>ij</sub><br>
                    dCov = (1/${n}²) × ${(dCov * n * n).toFixed(6)}<br>
                    dCov = ${(dCov * n * n).toFixed(6)} / ${n*n} = <strong style="color: #1a5490;">${dCov.toFixed(8)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Distance Variance of X (dVarX):</strong>
                <div style="font-family: monospace; font-size: 14px;">
                    dVarX = (1/n²) × Σ Σ (A'<sub>ij</sub>)²<br>
                    dVarX = (1/${n}²) × ${(dVarX * n * n).toFixed(6)}<br>
                    dVarX = ${(dVarX * n * n).toFixed(6)} / ${n*n} = <strong style="color: #1a5490;">${dVarX.toFixed(8)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Distance Variance of Y (dVarY):</strong>
                <div style="font-family: monospace; font-size: 14px;">
                    dVarY = (1/n²) × Σ Σ (B'<sub>ij</sub>)²<br>
                    dVarY = (1/${n}²) × ${(dVarY * n * n).toFixed(6)}<br>
                    dVarY = ${(dVarY * n * n).toFixed(6)} / ${n*n} = <strong style="color: #1a5490;">${dVarY.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 5: Calculate Distance Correlation</h3>
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-family: monospace; font-size: 16px;">
                    dCor = dCov / √(dVarX × dVarY)<br>
                    dCor = ${dCov.toFixed(6)} / √(${dVarX.toFixed(6)} × ${dVarY.toFixed(6)})<br>
                    dCor = ${dCov.toFixed(6)} / √${(dVarX * dVarY).toFixed(6)}<br>
                    dCor = ${dCov.toFixed(6)} / ${Math.sqrt(dVarX * dVarY).toFixed(6)}
                </div>
                <div style="font-size: 36px; font-weight: 700; color: #1a5490; margin-top: 16px;">
                    dCor = ${dCor.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: #f3e5f5; border-left: 6px solid #6a1b9a;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation & Comparison</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Distance Correlation (dCor):</strong> ${dCor.toFixed(6)}</div>
                <div><strong>Pearson Correlation (r):</strong> ${pearsonR.toFixed(6)}</div>
                <div><strong>Difference:</strong> ${Math.abs(dCor - Math.abs(pearsonR)).toFixed(6)}</div>
                
                <div style="margin-top: 8px; padding: 12px; background: white; border-radius: 8px;">
                    <strong>🔍 What does this tell us?</strong><br><br>
                    ${Math.abs(pearsonR) < 0.3 && dCor > 0.5 ? 
                        `✓ <strong style="color: #28a745;">NON-LINEAR RELATIONSHIP DETECTED!</strong><br>
                        Pearson correlation (${pearsonR.toFixed(3)}) suggests weak linear relationship, but distance correlation (${dCor.toFixed(3)}) reveals a strong overall relationship.<br>
                        This indicates a non-linear pattern (e.g., quadratic, exponential, periodic, or other complex relationship).` : 
                        
                        Math.abs(pearsonR) > 0.7 && Math.abs(dCor - Math.abs(pearsonR)) < 0.1 ?
                        `✓ <strong style="color: #28a745;">STRONG LINEAR RELATIONSHIP</strong><br>
                        Both Pearson (${pearsonR.toFixed(3)}) and distance (${dCor.toFixed(3)}) correlations are strong and similar.<br>
                        This suggests the relationship is approximately linear.` :
                        
                        Math.abs(pearsonR) > 0.7 && dCor < 0.7 ?
                        `⚠ <strong style="color: #ffc107;">POSSIBLE OUTLIER EFFECT</strong><br>
                        Pearson shows strong correlation (${pearsonR.toFixed(3)}) but distance correlation is weaker (${dCor.toFixed(3)}).<br>
                        This may indicate that outliers are affecting Pearson correlation.` :
                        
                        `📊 <strong>MODERATE RELATIONSHIP</strong><br>
                        Both measures suggest a moderate relationship between X and Y.<br>
                        Consider visualizing the data to understand the pattern better.`
                    }
                </div>
                
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    <strong>💡 Key Insight:</strong> Distance correlation = 0 if and only if X and Y are statistically independent.<br>
                    Pearson correlation = 0 does NOT imply independence (only no LINEAR relationship).<br>
                    Distance correlation captures ALL types of relationships (linear, quadratic, exponential, periodic, etc.).
                </div>
            </div>
        </div>
    </div>`;
    
    return { dCor, dCov, dVarX, dVarY, pearsonR, steps };
}
// ========== SETUP FUNCTIONS FOR NEW BUTTONS ==========
function setupCorrelationMatrixLogic() {
    const computeBtn = document.getElementById("corrMatrixComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("corrMatrixData").value;
        const lines = raw.trim().split(/\r?\n/);
        let variables = [];
        
        for (let line of lines) {
            line = line.trim();
            if (line === "") continue;
            let values = parseNumbersFromInput(line);
            if (values.length > 0) {
                variables.push(values);
            }
        }
        
        const resultDiv = document.getElementById("corrMatrixResultArea");
        const valueSpan = document.getElementById("corrMatrixValueDisplay");
        const stepsSpan = document.getElementById("corrMatrixStepsDisplay");
        
        if (variables.length < 2) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = "Please enter at least 2 variables (each on a new line).";
            return;
        }
        
        const result = computeCorrelationMatrixWithSteps(variables);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `${variables.length}×${variables[0].length} correlation matrix computed`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("corrMatrixClearBtn", "corrMatrixData", "corrMatrixResultArea");
}

function setupDistanceCorrelationLogic() {
    const computeBtn = document.getElementById("distCorrComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("distCorrXInput").value;
        const rawY = document.getElementById("distCorrYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("distCorrResultArea");
        const valueSpan = document.getElementById("distCorrValueDisplay");
        const stepsSpan = document.getElementById("distCorrStepsDisplay");
        
        const result = computeDistanceCorrelationWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `dCor = ${result.dCor.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("distCorrClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("distCorrXInput").value = '';
            document.getElementById("distCorrYInput").value = '';
            document.getElementById("distCorrResultArea").style.display = 'none';
        });
    }
}
// ========== MANN-WHITNEY U TEST INTERFACE RENDER ==========
function renderMannWhitneyInterface() {
    return `
        <div class="stat-interface" id="statMannWhitneyInterface">
            <div class="interface-title">U Mann-Whitney U Test (Non-parametric)</div>
            <div class="formula-card">
                <div class="formula">📌 U = n₁n₂ + [n₁(n₁+1)/2] - R₁</div>
                <div class="desc">Non-parametric alternative to independent t-test. Tests whether one group tends to have larger values than the other. Does not assume normal distribution.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter Sample 1 data (comma, space, or line separated):</label>
                <textarea id="mannWhitneyData1" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter Sample 2 data (comma, space, or line separated):</label>
                <textarea id="mannWhitneyData2" rows="3" placeholder="Example: 18, 20, 19, 21, 22, 20, 19"></textarea>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="mannWhitneyAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <label>📋 Alternative Hypothesis:</label>
                <select id="mannWhitneyAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">Population1 ≠ Population2 (Two-tailed)</option>
                    <option value="greater">Population1 > Population2 (One-tailed)</option>
                    <option value="less">Population1 < Population2 (One-tailed)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="mannWhitneyComputeBtn">U Run Mann-Whitney U Test + Full Steps</button>
                    <button class="secondary-btn" id="mannWhitneyClearBtn">Clear All</button>
                </div>
            </div>
            <div id="mannWhitneyResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MANN-WHITNEY U TEST RESULTS</div>
                    <div class="result-value" id="mannWhitneyValueDisplay">—</div>
                    <div class="calculation-steps" id="mannWhitneyStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== WILCOXON SIGNED-RANK TEST INTERFACE RENDER ==========
function renderWilcoxonInterface() {
    return `
        <div class="stat-interface" id="statWilcoxonInterface">
            <div class="interface-title">W Wilcoxon Signed-Rank Test (Non-parametric)</div>
            <div class="formula-card">
                <div class="formula">📌 W = sum of signed ranks</div>
                <div class="desc">Non-parametric alternative to paired t-test. Tests whether the median difference between paired observations is zero. Does not assume normal distribution.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter Before values (comma, space, or line separated):</label>
                <textarea id="wilcoxonBeforeData" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15, 14"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter After values (same number of observations):</label>
                <textarea id="wilcoxonAfterData" rows="3" placeholder="Example: 14, 16, 15, 18, 15, 17, 16"></textarea>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="wilcoxonAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <label>📋 Alternative Hypothesis:</label>
                <select id="wilcoxonAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">Median difference ≠ 0 (Two-tailed)</option>
                    <option value="greater">Median difference > 0 (After > Before)</option>
                    <option value="less">Median difference < 0 (After < Before)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="wilcoxonComputeBtn">W Run Wilcoxon Signed-Rank Test + Full Steps</button>
                    <button class="secondary-btn" id="wilcoxonClearBtn">Clear All</button>
                </div>
            </div>
            <div id="wilcoxonResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 WILCOXON SIGNED-RANK TEST RESULTS</div>
                    <div class="result-value" id="wilcoxonValueDisplay">—</div>
                    <div class="calculation-steps" id="wilcoxonStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== MANN-WHITNEY U TEST COMPUTATION ==========
function computeMannWhitneyTest(sample1, sample2, alpha, alternative) {
    if (!sample1.length || !sample2.length) {
        return { error: true, message: "Please enter both samples." };
    }
    
    const n1 = sample1.length;
    const n2 = sample2.length;
    
    // Combine and rank all values
    let combined = [];
    for (let val of sample1) combined.push({ value: val, group: 1 });
    for (let val of sample2) combined.push({ value: val, group: 2 });
    
    combined.sort((a, b) => a.value - b.value);
    
    // Assign ranks (handle ties)
    let ranks = new Array(combined.length);
    let i = 0;
    while (i < combined.length) {
        let j = i;
        while (j < combined.length && combined[j].value === combined[i].value) j++;
        let avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) ranks[k] = avgRank;
        i = j;
    }
    
    // Sum ranks for group 1
    let sumRank1 = 0;
    let rankDetails = [];
    for (let idx = 0; idx < combined.length; idx++) {
        if (combined[idx].group === 1) {
            sumRank1 += ranks[idx];
            rankDetails.push({ value: combined[idx].value, rank: ranks[idx], group: 1 });
        } else {
            rankDetails.push({ value: combined[idx].value, rank: ranks[idx], group: 2 });
        }
    }
    
    // Calculate U statistic
    let U1 = n1 * n2 + (n1 * (n1 + 1)) / 2 - sumRank1;
    let U2 = n1 * n2 - U1;
    let U = Math.min(U1, U2);
    
    // Calculate expected U and standard deviation
    const expectedU = (n1 * n2) / 2;
    const stdU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
    
    // Calculate z-score approximation
    const continuityCorrection = 0.5;
    let z = (U - expectedU) / stdU;
    if (Math.abs(U - expectedU) > 0) {
        z = (U - expectedU + (U < expectedU ? continuityCorrection : -continuityCorrection)) / stdU;
    }
    
    // Calculate p-value based on alternative
    let pValue;
    if (alternative === 'two.sided') {
        pValue = 2 * (1 - normCDF(Math.abs(z)));
    } else if (alternative === 'greater') {
        pValue = 1 - normCDF(z);
    } else {
        pValue = normCDF(z);
    }
    
    // Critical value (approximate)
    const criticalZ = normInv(1 - (alternative === 'two.sided' ? alpha / 2 : alpha));
    const rejectH0 = Math.abs(z) > criticalZ;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the populations are ${alternative === 'two.sided' ? 'different' : (alternative === 'greater' ? 'Sample1 > Sample2' : 'Sample1 < Sample2')}.` :
        `There is NOT sufficient evidence that the populations are ${alternative === 'two.sided' ? 'different' : (alternative === 'greater' ? 'Sample1 > Sample2' : 'Sample1 < Sample2')}.`;
    
    // Build ranking table
    let rankTableRows = '';
    rankDetails.forEach((item, idx) => {
        let bgColor = item.group === 1 ? '#e8f4f8' : '#f8f9fa';
        rankTableRows += `<tr style="border-bottom: 1px solid #e9ecef; background: ${bgColor};">
            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; text-align: center;">${item.value}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold;">${item.rank}</td>
            <td style="padding: 8px; text-align: center;">${item.group === 1 ? 'Sample 1' : 'Sample 2'}</td>
        </tr>`;
    });
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">U</span>
                <h2 style="margin: 0;">Mann-Whitney U Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: U = n₁n₂ + [n₁(n₁+1)/2] - R₁</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Non-parametric alternative to independent t-test</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Sample Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-weight: 700;">Sample 1</div>
                    <div>n₁ = ${n1}</div>
                    <div>Data: ${sample1.join(', ')}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #dc3545;">
                    <div style="font-weight: 700;">Sample 2</div>
                    <div>n₂ = ${n2}</div>
                    <div>Data: ${sample2.join(', ')}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Rank All Values Together</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 10px;">Position</th>
                        <th style="padding: 10px;">Value</th>
                        <th style="padding: 10px;">Rank</th>
                        <th style="padding: 10px;">Group</th>
                    </tr>
                </thead>
                <tbody>${rankTableRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate U Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Sum of ranks for Sample 1 (R₁):</strong> ${sumRank1.toFixed(2)}<br><br>
                <strong>U₁ = n₁n₂ + n₁(n₁+1)/2 - R₁</strong><br>
                U₁ = ${n1}×${n2} + ${n1}×${n1+1}/2 - ${sumRank1.toFixed(2)}<br>
                U₁ = ${n1*n2} + ${n1*(n1+1)/2} - ${sumRank1.toFixed(2)} = ${U1.toFixed(2)}<br><br>
                <strong>U₂ = n₁n₂ - U₁</strong><br>
                U₂ = ${n1*n2} - ${U1.toFixed(2)} = ${U2.toFixed(2)}<br><br>
                <strong>U = min(U₁, U₂) = ${U.toFixed(2)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Step 3: Calculate z-score approximation</strong><br>
                Expected U = n₁n₂/2 = ${expectedU.toFixed(2)}<br>
                Standard Deviation = √[n₁n₂(n₁+n₂+1)/12] = ${stdU.toFixed(4)}<br>
                z = (U - ExpectedU) / SD = ${z.toFixed(6)}<br>
                p-value = ${pValue.toFixed(8)}
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>U Statistic:</strong> ${U.toFixed(2)}</div>
            <div><strong>z-score:</strong> ${z.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
    </div>`;
    
    return { U, z, pValue, rejectH0, conclusion, interpretation, steps };
}

// ========== WILCOXON SIGNED-RANK TEST COMPUTATION ==========
function computeWilcoxonTest(before, after, alpha, alternative) {
    if (!before.length || !after.length) {
        return { error: true, message: "Please enter both before and after data." };
    }
    if (before.length !== after.length) {
        return { error: true, message: "Before and after data must have the same number of observations." };
    }
    
    const n = before.length;
    let differences = [];
    let nonZeroDiffs = [];
    
    for (let i = 0; i < n; i++) {
        let diff = after[i] - before[i];
        differences.push({ before: before[i], after: after[i], diff: diff, absDiff: Math.abs(diff) });
        if (diff !== 0) nonZeroDiffs.push(Math.abs(diff));
    }
    
    // Rank absolute differences
    let withRanks = [];
    for (let i = 0; i < n; i++) {
        if (differences[i].diff !== 0) {
            withRanks.push({ 
                ...differences[i], 
                originalIndex: i,
                absDiff: Math.abs(differences[i].diff)
            });
        }
    }
    withRanks.sort((a, b) => a.absDiff - b.absDiff);
    
    // Assign ranks (handle ties)
    let i = 0;
    while (i < withRanks.length) {
        let j = i;
        while (j < withRanks.length && withRanks[j].absDiff === withRanks[i].absDiff) j++;
        let avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) withRanks[k].rank = avgRank;
        i = j;
    }
    
    // Calculate W+ and W-
    let Wpos = 0;
    let Wneg = 0;
    let rankDetails = [];
    
    for (let item of withRanks) {
        if (item.diff > 0) {
            Wpos += item.rank;
            rankDetails.push({ ...item, sign: 'positive' });
        } else {
            Wneg += item.rank;
            rankDetails.push({ ...item, sign: 'negative' });
        }
    }
    
    rankDetails.sort((a, b) => a.originalIndex - b.originalIndex);
    
    let W = Math.min(Wpos, Wneg);
    
    // Calculate z-score approximation
    const expectedW = (n * (n + 1)) / 4;
    const stdW = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
    let z = (W - expectedW) / stdW;
    
    // Apply continuity correction
    if (Math.abs(W - expectedW) > 0.5) {
        z = (W - expectedW + (W < expectedW ? 0.5 : -0.5)) / stdW;
    }
    
    // Calculate p-value
    let pValue;
    if (alternative === 'two.sided') {
        pValue = 2 * (1 - normCDF(Math.abs(z)));
    } else if (alternative === 'greater') {
        pValue = 1 - normCDF(z);
    } else {
        pValue = normCDF(z);
    }
    
    const criticalZ = normInv(1 - (alternative === 'two.sided' ? alpha / 2 : alpha));
    const rejectH0 = Math.abs(z) > criticalZ;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the median difference is ${alternative === 'two.sided' ? 'different from zero' : (alternative === 'greater' ? 'greater than zero (after > before)' : 'less than zero (after < before)')}.` :
        `There is NOT sufficient evidence that the median difference is ${alternative === 'two.sided' ? 'different from zero' : (alternative === 'greater' ? 'greater than zero' : 'less than zero')}.`;
    
    // Build difference table
    let diffTableRows = '';
    for (let idx = 0; idx < n; idx++) {
        let d = differences[idx];
        let diffColor = d.diff > 0 ? '#28a745' : (d.diff < 0 ? '#dc3545' : '#6c757d');
        let rank = rankDetails.find(r => r.originalIndex === idx)?.rank || '-';
        let sign = d.diff > 0 ? '+' : (d.diff < 0 ? '-' : '0');
        diffTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; text-align: center;">${d.before}</td>
            <td style="padding: 8px; text-align: center;">${d.after}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: ${diffColor};">${sign}${Math.abs(d.diff).toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${rank}</td>
            <td style="padding: 8px; text-align: center;">${sign === '+' ? 'Positive' : (sign === '-' ? 'Negative' : 'Zero')}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">W</span>
                <h2 style="margin: 0;">Wilcoxon Signed-Rank Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Non-parametric alternative to paired t-test</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Tests whether the median difference between paired observations is zero</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-weight: 700;">Number of Pairs</div>
                    <div style="font-size: 24px;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-weight: 700;">Non-zero Differences</div>
                    <div style="font-size: 24px;">${withRanks.length}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Calculate Differences and Ranks</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 10px;">Pair</th>
                        <th style="padding: 10px;">Before</th>
                        <th style="padding: 10px;">After</th>
                        <th style="padding: 10px;">Difference</th>
                        <th style="padding: 10px;">Rank |d|</th>
                        <th style="padding: 10px;">Sign</th>
                    </tr>
                </thead>
                <tbody>${diffTableRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Test Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Sum of positive ranks (W⁺):</strong> ${Wpos.toFixed(2)}<br>
                <strong>Sum of negative ranks (W⁻):</strong> ${Wneg.toFixed(2)}<br>
                <strong>W = min(W⁺, W⁻) = ${W.toFixed(2)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Step 3: Calculate z-score approximation</strong><br>
                Expected W = n(n+1)/4 = ${expectedW.toFixed(2)}<br>
                Standard Deviation = √[n(n+1)(2n+1)/24] = ${stdW.toFixed(4)}<br>
                z = (W - ExpectedW) / SD = ${z.toFixed(6)}<br>
                p-value = ${pValue.toFixed(8)}
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>W Statistic:</strong> ${W.toFixed(2)}</div>
            <div><strong>z-score:</strong> ${z.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
    </div>`;
    
    return { W, Wpos, Wneg, z, pValue, rejectH0, conclusion, interpretation, steps };
}
// ========== MANN-WHITNEY SETUP ==========
function setupMannWhitneyLogic() {
    const computeBtn = document.getElementById("mannWhitneyComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw1 = document.getElementById("mannWhitneyData1").value;
        const raw2 = document.getElementById("mannWhitneyData2").value;
        const sample1 = parseNumbersFromInput(raw1);
        const sample2 = parseNumbersFromInput(raw2);
        const alpha = parseFloat(document.getElementById("mannWhitneyAlpha").value);
        const alternative = document.getElementById("mannWhitneyAlternative").value;
        const resultDiv = document.getElementById("mannWhitneyResultArea");
        const valueSpan = document.getElementById("mannWhitneyValueDisplay");
        const stepsSpan = document.getElementById("mannWhitneyStepsDisplay");
        
        if (!sample1.length || !sample2.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter both sample datasets.";
            return;
        }
        
        const result = computeMannWhitneyTest(sample1, sample2, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `U = ${result.U.toFixed(2)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("mannWhitneyClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("mannWhitneyData1").value = '';
            document.getElementById("mannWhitneyData2").value = '';
            document.getElementById("mannWhitneyResultArea").style.display = 'none';
        });
    }
}

// ========== WILCOXON SETUP ==========
function setupWilcoxonLogic() {
    const computeBtn = document.getElementById("wilcoxonComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawBefore = document.getElementById("wilcoxonBeforeData").value;
        const rawAfter = document.getElementById("wilcoxonAfterData").value;
        const before = parseNumbersFromInput(rawBefore);
        const after = parseNumbersFromInput(rawAfter);
        const alpha = parseFloat(document.getElementById("wilcoxonAlpha").value);
        const alternative = document.getElementById("wilcoxonAlternative").value;
        const resultDiv = document.getElementById("wilcoxonResultArea");
        const valueSpan = document.getElementById("wilcoxonValueDisplay");
        const stepsSpan = document.getElementById("wilcoxonStepsDisplay");
        
        if (!before.length || !after.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter both before and after data.";
            return;
        }
        
        const result = computeWilcoxonTest(before, after, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `W = ${result.W.toFixed(2)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("wilcoxonClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("wilcoxonBeforeData").value = '';
            document.getElementById("wilcoxonAfterData").value = '';
            document.getElementById("wilcoxonResultArea").style.display = 'none';
        });
    }
}
// ========== KRUSKAL-WALLIS H TEST INTERFACE RENDER ==========
function renderKruskalWallisInterface() {
    return `
        <div class="stat-interface" id="statKruskalWallisInterface">
            <div class="interface-title">H Kruskal-Wallis H Test (Non-parametric ANOVA)</div>
            <div class="formula-card">
                <div class="formula">📌 H = (12 / N(N+1)) × Σ(Rⱼ²/nⱼ) - 3(N+1)</div>
                <div class="desc">Non-parametric alternative to one-way ANOVA. Tests whether samples come from the same distribution. Does not assume normality.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data with group labels (format: value:group):</label>
                <textarea id="kruskalData" rows="5" placeholder="Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> value:group (comma or space separated)<br>
                    <strong>Example:</strong> 23:A means value 23 belongs to group A
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="kruskalAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="kruskalComputeBtn">H Run Kruskal-Wallis Test + Full Steps</button>
                    <button class="secondary-btn" id="kruskalClearBtn">Clear</button>
                </div>
            </div>
            <div id="kruskalResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 KRUSKAL-WALLIS H TEST RESULTS</div>
                    <div class="result-value" id="kruskalValueDisplay">—</div>
                    <div class="calculation-steps" id="kruskalStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== FRIEDMAN TEST INTERFACE RENDER ==========
function renderFriedmanInterface() {
    return `
        <div class="stat-interface" id="statFriedmanInterface">
            <div class="interface-title">χ² Friedman Test (Non-parametric Repeated Measures)</div>
            <div class="formula-card">
                <div class="formula">📌 χ² = (12 / (nk(k+1))) × Σ Rⱼ² - 3n(k+1)</div>
                <div class="desc">Non-parametric alternative to repeated measures ANOVA. Tests for differences across multiple related groups.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data (each row = subject, each column = condition):</label>
                <textarea id="friedmanData" rows="5" placeholder="Example (each row is a subject):&#10;5, 6, 7, 8&#10;4, 5, 6, 7&#10;6, 7, 8, 9&#10;5, 5, 6, 7&#10;7, 8, 9, 10"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> Comma-separated values per row (each row = one subject, each column = one condition/time point)
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="friedmanAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="friedmanComputeBtn">χ² Run Friedman Test + Full Steps</button>
                    <button class="secondary-btn" id="friedmanClearBtn">Clear</button>
                </div>
            </div>
            <div id="friedmanResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 FRIEDMAN TEST RESULTS</div>
                    <div class="result-value" id="friedmanValueDisplay">—</div>
                    <div class="calculation-steps" id="friedmanStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== KRUSKAL-WALLIS H TEST COMPUTATION ==========
// ========== KRUSKAL-WALLIS H TEST COMPUTATION ==========
function computeKruskalWallisTest(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = escapeHtml(groupName.trim());
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Kruskal-Wallis test." };
    }
    
    // Combine all values with group labels
    let allValues = [];
    for (let [group, values] of groups) {
        for (let val of values) {
            allValues.push({ value: val, group: group });
        }
    }
    
    // Sort and rank all values
    allValues.sort((a, b) => a.value - b.value);
    
    // Assign ranks (handle ties)
    let i = 0;
    while (i < allValues.length) {
        let j = i;
        while (j < allValues.length && allValues[j].value === allValues[i].value) j++;
        let avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) allValues[k].rank = avgRank;
        i = j;
    }
    
    // Calculate rank sums per group
    let rankSums = new Map();
    let groupSizes = new Map();
    for (let [group, values] of groups) {
        rankSums.set(group, 0);
        groupSizes.set(group, values.length);
    }
    
    for (let item of allValues) {
        rankSums.set(item.group, rankSums.get(item.group) + item.rank);
    }
    
    const N = allValues.length;
    const k = groups.size;
    
    // Calculate H statistic
    let H = 0;
    let formulaParts = [];
    for (let [group, sumRank] of rankSums) {
        let n_j = groupSizes.get(group);
        let term = Math.pow(sumRank, 2) / n_j;
        formulaParts.push(`(${sumRank.toFixed(2)}²/${n_j}) = ${term.toFixed(4)}`);
        H += term;
    }
    let rawH = H;
    H = (12 / (N * (N + 1))) * H - 3 * (N + 1);
    
    // Correction for ties
    let tieCorrection = 0;
    let tieCounts = [];
    let currentVal = allValues[0].value;
    let count = 1;
    for (let idx = 1; idx < allValues.length; idx++) {
        if (allValues[idx].value === currentVal) {
            count++;
        } else {
            if (count > 1) tieCounts.push(count);
            currentVal = allValues[idx].value;
            count = 1;
        }
    }
    if (count > 1) tieCounts.push(count);
    
    let tieCorrectionText = "";
    if (tieCounts.length > 0) {
        let tieSum = tieCounts.reduce((sum, t) => sum + (Math.pow(t, 3) - t), 0);
        tieCorrection = 1 - (tieSum / (Math.pow(N, 3) - N));
        let oldH = H;
        H = H / tieCorrection;
        tieCorrectionText = `<div style="background: #fff3cd; padding: 12px; border-radius: 8px; margin-top: 12px;">
            <strong>⚠️ Tie Correction Applied:</strong><br>
            Ties detected: ${tieCounts.map(t => `${t} values`).join(', ')}<br>
            Correction factor = 1 - [Σ(t³ - t)] / (N³ - N)<br>
            Correction factor = 1 - [${tieSum}] / (${Math.pow(N, 3)} - ${N}) = ${tieCorrection.toFixed(6)}<br>
            Corrected H = ${oldH.toFixed(6)} / ${tieCorrection.toFixed(6)} = ${H.toFixed(6)}
        </div>`;
    }
    
    const df = k - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(H, df);
    const rejectH0 = H > criticalValue;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        "There IS sufficient evidence that at least one group comes from a different distribution." :
        "There is NOT sufficient evidence that the groups come from different distributions.";
    
    // Build ranking table
    let rankTableRows = '';
    for (let idx = 0; idx < allValues.length; idx++) {
        rankTableRows += `<tr>
            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; text-align: center;">${allValues[idx].value}</td>
            <td style="padding: 8px; text-align: center;">${allValues[idx].group}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold;">${allValues[idx].rank}</td>
        </tr>`;
    }
    
    // Build rank sums table
    let rankSumRows = '';
    for (let [group, sumRank] of rankSums) {
        let n_j = groupSizes.get(group);
        rankSumRows += `<tr>
            <td style="padding: 8px;">${group}</td>
            <td style="padding: 8px; text-align: center;">${n_j}</td>
            <td style="padding: 8px; text-align: center;">${sumRank.toFixed(2)}</td>
            <td style="padding: 8px; text-align: center;">${Math.pow(sumRank, 2).toFixed(2)}</td>
            <td style="padding: 8px; text-align: center;">${Math.pow(sumRank, 2).toFixed(2)} / ${n_j} = ${(Math.pow(sumRank, 2) / n_j).toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">H</span>
                <h2 style="margin: 0;">Kruskal-Wallis H Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Non-parametric alternative to one-way ANOVA</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: All groups come from the same distribution | H₁: At least one group differs</p>
        </div>
        
        <!-- Formula Explanation Section -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📖 Understanding the Kruskal-Wallis H Formula</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin-bottom: 20px;">
                    <strong>H = (12 / [N(N+1)]) × Σ(Rⱼ²/nⱼ) - 3(N+1)</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: #e8f4f8; padding: 12px; border-radius: 8px;">
                        <strong>📊 Variables:</strong><br>
                        • <strong>N</strong> = Total number of observations across all groups<br>
                        • <strong>k</strong> = Number of groups<br>
                        • <strong>Rⱼ</strong> = Sum of ranks for group j<br>
                        • <strong>nⱼ</strong> = Number of observations in group j
                    </div>
                    <div style="background: #e8f4f8; padding: 12px; border-radius: 8px;">
                        <strong>🔢 Step-by-Step:</strong><br>
                        1. Rank ALL values together (smallest = rank 1)<br>
                        2. Sum ranks for each group (Rⱼ)<br>
                        3. Calculate Rⱼ²/nⱼ for each group<br>
                        4. Sum these values: Σ(Rⱼ²/nⱼ)<br>
                        5. Apply the formula to get H
                    </div>
                </div>
                
                <div style="margin-top: 16px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    <strong>💡 Intuition:</strong> If groups are similar, ranks will be evenly distributed → H is small.<br>
                    If groups differ, ranks will cluster within groups → H is large.
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Rank All Values Together</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;"><th>Position</th><th>Value</th><th>Group</th><th>Rank</th></tr></thead>
                <tbody>${rankTableRows}</tbody>
            </table>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 2: Calculate Rank Sums per Group (Rⱼ)</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;"><th>Group</th><th>nⱼ</th><th>Rⱼ (Sum of Ranks)</th><th>Rⱼ²</th><th>Rⱼ²/nⱼ</th></tr></thead>
                <tbody>${rankSumRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate H Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula:</strong> H = (12 / [N(N+1)]) × Σ(Rⱼ²/nⱼ) - 3(N+1)<br><br>
                
                <strong>Step 3a: Calculate Σ(Rⱼ²/nⱼ)</strong><br>
                Σ(Rⱼ²/nⱼ) = ${formulaParts.join(' + ')} = ${rawH.toFixed(4)}<br><br>
                
                <strong>Step 3b: Calculate the multiplier</strong><br>
                12 / [N(N+1)] = 12 / [${N} × ${N+1}] = 12 / ${N * (N+1)} = ${(12 / (N * (N+1))).toFixed(6)}<br><br>
                
                <strong>Step 3c: Multiply</strong><br>
                ${(12 / (N * (N+1))).toFixed(6)} × ${rawH.toFixed(4)} = ${((12 / (N * (N+1))) * rawH).toFixed(4)}<br><br>
                
                <strong>Step 3d: Subtract 3(N+1)</strong><br>
                3(${N}+1) = 3 × ${N+1} = ${3 * (N+1)}<br><br>
                
                <strong>Step 3e: Final H</strong><br>
                H = ${((12 / (N * (N+1))) * rawH).toFixed(4)} - ${3 * (N+1)} = <strong style="color: #1a5490; font-size: 18px;">${H.toFixed(6)}</strong>
                
                ${tieCorrectionText}
                
                <div style="margin-top: 16px;">
                    <strong>Degrees of Freedom:</strong> df = k - 1 = ${k} - 1 = ${df}<br>
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}<br>
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>H Statistic:</strong> ${H.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${H > criticalValue ? '✓ H > Critical value → Reject H₀' : '✗ H < Critical value → Cannot reject H₀'}
            </div>
        </div>
    </div>`;
    
    return { H, df, pValue, criticalValue, rejectH0, steps };
}

// ========== FRIEDMAN TEST COMPUTATION ==========
// ========== FRIEDMAN TEST COMPUTATION ==========
function computeFriedmanTest(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        let values = parseNumbersFromInput(line);
        if (values.length > 0) data.push(values);
    }
    
    if (data.length < 3) {
        return { error: true, message: "Need at least 3 subjects (rows) for Friedman test." };
    }
    
    const n = data.length; // number of subjects
    const k = data[0].length; // number of conditions
    
    // Check all rows have same number of columns
    for (let row of data) {
        if (row.length !== k) {
            return { error: true, message: "All rows must have the same number of values." };
        }
    }
    
    if (k < 2) {
        return { error: true, message: "Need at least 2 conditions (columns) for Friedman test." };
    }
    
    // Rank within each row
    let ranks = [];
    let rankingDetails = [];
    
    for (let i = 0; i < n; i++) {
        let rowRanks = [];
        let rowData = data[i].map((val, idx) => ({ value: val, col: idx }));
        rowData.sort((a, b) => a.value - b.value);
        
        // Assign ranks (handle ties within row)
        let j = 0;
        while (j < rowData.length) {
            let l = j;
            while (l < rowData.length && rowData[l].value === rowData[j].value) l++;
            let avgRank = (j + 1 + l) / 2;
            for (let m = j; m < l; m++) rowData[m].rank = avgRank;
            j = l;
        }
        
        rowRanks = new Array(k);
        for (let item of rowData) rowRanks[item.col] = item.rank;
        ranks.push(rowRanks);
        
        // Store ranking details for display
        rankingDetails.push({
            subject: i + 1,
            values: data[i],
            ranks: rowRanks
        });
    }
    
    // Calculate column rank sums
    let colRankSums = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < k; j++) {
            colRankSums[j] += ranks[i][j];
        }
    }
    
    // Calculate Friedman statistic
    let sumRjSquared = colRankSums.reduce((sum, Rj) => sum + Math.pow(Rj, 2), 0);
    let chiSq = (12 / (n * k * (k + 1))) * sumRjSquared - 3 * n * (k + 1);
    
    const df = k - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(chiSq, df);
    const rejectH0 = chiSq > criticalValue;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        "There IS sufficient evidence that at least one condition differs from others." :
        "There is NOT sufficient evidence that the conditions differ.";
    
    // Build ranking table for each subject
    let rankingRows = '';
    for (let item of rankingDetails) {
        rankingRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${item.subject}</td>`;
        for (let j = 0; j < k; j++) {
            rankingRows += `<td style="padding: 8px; text-align: center;">${item.values[j]} → Rank ${item.ranks[j]}</td>`;
        }
        rankingRows += `</tr>`;
    }
    
    // Build column rank sums table
    let colSumRows = '';
    for (let j = 0; j < k; j++) {
        colSumRows += `<tr>
            <td style="padding: 8px; text-align: center;">Condition ${j + 1}</td>
            <td style="padding: 8px; text-align: center;">${colRankSums[j].toFixed(2)}</td>
            <td style="padding: 8px; text-align: center;">${Math.pow(colRankSums[j], 2).toFixed(2)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">χ²</span>
                <h2 style="margin: 0;">Friedman Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Non-parametric alternative to repeated measures ANOVA</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: All conditions have the same distribution | H₁: At least one condition differs</p>
        </div>
        
        <!-- Formula Explanation Section -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📖 Understanding the Friedman Test Formula</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin-bottom: 20px;">
                    <strong>χ² = (12 / [n × k × (k+1)]) × Σ(Rⱼ²) - 3n(k+1)</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: #e8f4f8; padding: 12px; border-radius: 8px;">
                        <strong>📊 Variables:</strong><br>
                        • <strong>n</strong> = Number of subjects (rows)<br>
                        • <strong>k</strong> = Number of conditions (columns)<br>
                        • <strong>Rⱼ</strong> = Sum of ranks for condition j<br>
                        • <strong>Σ(Rⱼ²)</strong> = Sum of squared column rank sums
                    </div>
                    <div style="background: #e8f4f8; padding: 12px; border-radius: 8px;">
                        <strong>🔢 Step-by-Step:</strong><br>
                        1. Rank values WITHIN each subject (row)<br>
                        2. Sum ranks for each condition (column): Rⱼ<br>
                        3. Square each Rⱼ and sum: Σ(Rⱼ²)<br>
                        4. Apply the formula to get χ²
                    </div>
                </div>
                
                <div style="margin-top: 16px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    <strong>💡 Intuition:</strong> If conditions are similar, ranks will be evenly distributed across columns → χ² is small.<br>
                    If conditions differ, ranks will cluster in certain columns → χ² is large.
                </div>
                
                <div style="margin-top: 16px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    <strong>⚠️ Important:</strong> The Friedman test ranks WITHIN each row separately!<br>
                    For each subject, the smallest value gets rank 1, next gets rank 2, etc.<br>
                    This removes subject-to-subject variability.
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: #6c757d;">Subjects (n)</div>
                    <div style="font-size: 32px; font-weight: bold;">${n}</div>
                    <div style="font-size: 11px;">Number of rows</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: #6c757d;">Conditions (k)</div>
                    <div style="font-size: 32px; font-weight: bold;">${k}</div>
                    <div style="font-size: 11px;">Number of columns</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: #6c757d;">Total Observations</div>
                    <div style="font-size: 32px; font-weight: bold;">${n * k}</div>
                    <div style="font-size: 11px;">n × k</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Rank Values Within Each Subject (Row)</h3>
            <div style="padding: 12px; background: #e8f4f8; font-size: 13px;">
                <strong>How ranking works:</strong> For each subject, the smallest value gets rank 1, next gets rank 2, etc.<br>
                If there are ties, average ranks are assigned.
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 10px;">Subject</th>
                        ${Array(k).fill().map((_, i) => `<th style="padding: 10px;">Condition ${i + 1} (Value → Rank)</th>`).join('')}
                    </tr>
                </thead>
                <tbody>${rankingRows}</tbody>
            </table>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 2: Calculate Column Rank Sums (Rⱼ)</h3>
            <div style="padding: 12px; background: #e8f4f8; font-size: 13px;">
                <strong>Formula:</strong> Rⱼ = Sum of ranks in column j (across all subjects)
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;"><th>Condition</th><th>Rⱼ (Sum of Ranks)</th><th>Rⱼ²</th></tr></thead>
                <tbody>${colSumRows}
                    <tr style="background: #e9ecef; font-weight: bold;">
                        <td style="padding: 8px;">Σ (Sum) →</td>
                        <td style="padding: 8px; text-align: center;">${colRankSums.reduce((a,b)=>a+b,0).toFixed(2)}</td>
                        <td style="padding: 8px; text-align: center;">${sumRjSquared.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            <div style="padding: 12px; background: #d4edda; font-size: 13px; margin-top: 8px;">
                <strong>✅ Check:</strong> Total sum of all ranks should equal n × k(k+1)/2 = ${n} × ${k}×${k+1}/2 = ${n * k * (k+1) / 2}
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate Friedman χ² Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula:</strong> χ² = (12 / [n × k × (k+1)]) × Σ(Rⱼ²) - 3n(k+1)<br><br>
                
                <strong>Step 3a: Calculate the denominator</strong><br>
                n × k × (k+1) = ${n} × ${k} × ${k+1} = ${n * k * (k+1)}<br>
                12 / [n × k × (k+1)] = 12 / ${n * k * (k+1)} = ${(12 / (n * k * (k+1))).toFixed(6)}<br><br>
                
                <strong>Step 3b: Σ(Rⱼ²) (from Step 2)</strong><br>
                Σ(Rⱼ²) = ${sumRjSquared.toFixed(2)}<br><br>
                
                <strong>Step 3c: Multiply</strong><br>
                ${(12 / (n * k * (k+1))).toFixed(6)} × ${sumRjSquared.toFixed(2)} = ${((12 / (n * k * (k+1))) * sumRjSquared).toFixed(4)}<br><br>
                
                <strong>Step 3d: Calculate 3n(k+1)</strong><br>
                3n(k+1) = 3 × ${n} × ${k+1} = ${3 * n * (k+1)}<br><br>
                
                <strong>Step 3e: Final χ²</strong><br>
                χ² = ${((12 / (n * k * (k+1))) * sumRjSquared).toFixed(4)} - ${3 * n * (k+1)} = <strong style="color: #1a5490; font-size: 18px;">${chiSq.toFixed(6)}</strong>
                
                <div style="margin-top: 16px;">
                    <strong>Degrees of Freedom:</strong> df = k - 1 = ${k} - 1 = ${df}<br>
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}<br>
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>χ² Statistic:</strong> ${chiSq.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${chiSq > criticalValue ? '✓ χ² > Critical value → Reject H₀, conditions differ significantly' : '✗ χ² < Critical value → Cannot reject H₀, conditions are similar'}
                ${pValue < alpha ? '✓ p-value < α → Statistically significant' : '✗ p-value > α → Not statistically significant'}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            <strong>📚 Summary of Friedman Test:</strong><br><br>
            • <strong>What it does:</strong> Tests if multiple related groups (conditions) have the same distribution<br>
            • <strong>When to use:</strong> Repeated measures design with ordinal data or violated normality assumption<br>
            • <strong>How it works:</strong> Ranks values within each subject, then compares rank sums across conditions<br>
            • <strong>Null hypothesis:</strong> All conditions have the same median<br>
            • <strong>Alternative hypothesis:</strong> At least one condition differs
        </div>
    </div>`;
    
    return { chiSq, df, pValue, criticalValue, rejectH0, steps };
}

// ========== KRUSKAL-WALLIS SETUP ==========
function setupKruskalWallisLogic() {
    const computeBtn = document.getElementById("kruskalComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("kruskalData").value;
        const alpha = parseFloat(document.getElementById("kruskalAlpha").value);
        const resultDiv = document.getElementById("kruskalResultArea");
        const valueSpan = document.getElementById("kruskalValueDisplay");
        const stepsSpan = document.getElementById("kruskalStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format 'value:group'";
            return;
        }
        
        const result = computeKruskalWallisTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `H = ${result.H.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("kruskalClearBtn", "kruskalData", "kruskalResultArea");
}

// ========== FRIEDMAN SETUP ==========
function setupFriedmanLogic() {
    const computeBtn = document.getElementById("friedmanComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("friedmanData").value;
        const alpha = parseFloat(document.getElementById("friedmanAlpha").value);
        const resultDiv = document.getElementById("friedmanResultArea");
        const valueSpan = document.getElementById("friedmanValueDisplay");
        const stepsSpan = document.getElementById("friedmanStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data (each row = subject, values comma-separated)";
            return;
        }
        
        const result = computeFriedmanTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `χ² = ${result.chiSq.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("friedmanClearBtn", "friedmanData", "friedmanResultArea");
}
