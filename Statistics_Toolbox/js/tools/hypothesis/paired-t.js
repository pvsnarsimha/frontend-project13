/* PairedT: pairedt tool (render, compute, setup) */

// ========== PAIRED T-TEST INTERFACE RENDER ==========
function renderPairedTInterface() {
    return buildInterface({
        id: "statPairedTInterface",
        title: "Paired t-test (Before-After Comparison)",
        formula: "t = (d_bar) / (s_d / sqrt(n))",
        desc: "Tests whether the mean difference between paired observations (e.g., before-after) is significantly different from zero.",
        inputs: [
            {
                label: "Before values (comma, space, or line separated):",
                textarea: { id: "pairedBeforeData", rows: "3", placeholder: "Example: 12, 15, 14, 16, 13, 15, 14" }
            },
            {
                label: "After values (same number of observations):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "pairedAfterData", rows: "3", placeholder: "Example: 14, 16, 15, 18, 15, 17, 16" }
            },
            {
                label: "Significance Level (alpha):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "pairedAlpha", style: FIELD_STYLE },
                options: [
                    ["0.10", "alpha = 0.10 (90% Confidence)"],
                    ["0.05", "alpha = 0.05 (95% Confidence) - Standard", true],
                    ["0.01", "alpha = 0.01 (99% Confidence)"],
                    ["0.001", "alpha = 0.001 (99.9% Confidence)"]
                ]
            },
            {
                label: "Alternative Hypothesis:",
                select: { id: "pairedAlternative", style: FIELD_STYLE },
                options: [
                    ["two.sided", "Mean difference != 0 (Two-tailed)"],
                    ["greater", "Mean difference > 0 (After > Before)"],
                    ["less", "Mean difference < 0 (After < Before)"]
                ]
            }
        ],
        run: { id: "pairedTComputeBtn", text: "Run Paired t-test + Full Steps" },
        clear: { id: "pairedTClearBtn", text: "Clear All" },
        result: {
            area: "pairedTResultArea",
            label: "PAIRED T-TEST RESULTS",
            value: "pairedTValueDisplay",
            steps: "pairedTStepsDisplay",
            valueText: "---"
        }
    });
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
            setHtml(stepsSpan, "Please enter both before and after data.");
            return;
        }
        
        const result = computePairedTTest(before, after, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `t = ${result.tStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H0' : 'Fail to reject H0'}`);
            setHtml(stepsSpan, result.steps);
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
