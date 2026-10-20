/* PairedT: pairedt tool (render, compute, setup) */

// ========== PAIRED T-TEST INTERFACE RENDER ==========
function renderPairedTInterface() {
    return buildInterface({
        id: "statPairedTInterface",
        title: "Paired t-test (Before-After Comparison)",
        formula: "t = (d_bar) / (s_d / sqrt(n))",
        desc: "Tests whether the mean difference between paired observations (e.g., before-after) is significantly different from zero.",
        inputs: [
            inputModeItem("pairedMode", "🧮 Summary statistics (n, mean and s of the differences)"),
            {
                html: modeGroupHtml("raw", '<label>Before values (comma, space, or line separated):</label>\n<textarea id="pairedBeforeData" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15, 14"></textarea>\n<label style="' + FIELD_GAP + '">After values (same number of observations):</label>\n<textarea id="pairedAfterData" rows="3" placeholder="Example: 14, 16, 15, 18, 15, 17, 16"></textarea>') +
                    modeGroupHtml("summary", summaryFieldsHtml([["pairedN", "Number of pairs n:", "12", 'min="2"'], ["pairedMeanDiff", "Mean difference d̄ (after − before):", "2.5"], ["pairedSdDiff", "Standard deviation of the differences s_d:", "3.1", 'min="0"']]))
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
    if (!isFinite(meanDiff) || !isFinite(stdDevDiff)) {
        return { error: true, message: "The differences are too large to compute with (the sums overflow). Rescale the data and try again." };
    }
    if (!(stdDevDiff > 0)) {
        return { error: true, message: "All the paired differences are identical, so their standard deviation is 0 and the t statistic is undefined (the standard error is 0). Enter data where the differences vary." };
    }
    const standardError = stdDevDiff / Math.sqrt(n);
    const tStatistic = meanDiff / standardError;
    const df = n - 1;
    
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
        diffTable += `<tr class="s-00049c">
            <td class="s-e784bc">${i+1}</td>
            <td class="s-a7c3f4">${d.before}</td>
            <td class="s-a7c3f4">${d.after}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: ${textSafeColor(diffColor)};">${diffSign}${d.diff.toFixed(4)}</td>
            <td class="s-804df9">${d.after} - ${d.before} = ${diffSign}${d.diff.toFixed(4)}</td>
        </tr>`;
    }
    
    let squaredDeviationRows = '';
    for (let i = 0; i < squaredDeviationDetails.length; i++) {
        let s = squaredDeviationDetails[i];
        let sign = s.deviation >= 0 ? '+' : '';
        squaredDeviationRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            <td class="s-e784bc">${s.diff.toFixed(4)}</td>
            <td class="s-a7c3f4">${s.diff.toFixed(4)} - ${meanDiff.toFixed(4)} = ${sign}${s.deviation.toFixed(4)}</td>
            <td class="s-b33403">(${sign}${s.deviation.toFixed(4)})^2 = ${s.squaredDeviation.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">t</span>
                <h2 class="s-f8a94d">Paired t-test (Before-After Comparison)</h2>
            </div>
            <div class="s-55b017">
                <div>Formula: <strong>t = \u0304d / (s<sub>d</sub> / √n)</strong></div>
                <div class="s-af5894">Where:</div>
                <div>• \u0304d = Mean of the differences = (Σ dᵢ) / n</div>
                <div>• s<sub>d</sub> = Standard deviation of the differences</div>
                <div>• n = Number of pairs</div>
            </div>
            <p class="s-98fe52">H₀: μ<sub>d</sub> = 0 | H₁: μ<sub>d</sub> ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} 0</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">Data Summary</h3>
            <div class="s-86cc67 gen-grid gen-grid-many">
                <div class="s-63afdf">
                    <div class="s-42da0a">Number of Pairs (n)</div>
                    <div class="s-c2434f">${n}</div>
                </div>
                <div class="s-63afdf">
                    <div class="s-42da0a">Mean Difference (\u0304d)</div>
                    <div style="font-size: 20px; font-weight: 600; color: ${textSafeColor(meanDiff > 0 ? '#28a745' : (meanDiff < 0 ? '#dc3545' : '#6c757d'))};">${meanDiff > 0 ? '+' : ''}${meanDiff.toFixed(6)}</div>
                    <div class="s-d52d0d">= Average(After - Before)</div>
                </div>
                <div class="s-63afdf">
                    <div class="s-42da0a">Std Dev of Differences (s<sub>d</sub>)</div>
                    <div class="s-0f4638">${stdDevDiff.toFixed(6)}</div>
                </div>
            </div>
            
            <h4 class="s-eea75b">Individual Pair Differences (dᵢ = Afterᵢ - Beforeᵢ)</h4>
            <div class="s-01a9b9">
                <table class="s-f29cc6 gen-sized">
                    <thead>
                        <tr class="s-e7b83b">
                            <th class="s-a756db">Pair # (i)</th>
                            <th class="s-a756db">Before (xᵢ)</th>
                            <th class="s-a756db">After (yᵢ)</th>
                            <th class="s-a756db">Difference dᵢ = yᵢ - xᵢ</th>
                            <th class="s-a756db">Calculation</th>
                        </tr>
                    </thead>
                    <tbody>${diffTable}</tbody>
                 </table>
            </div>
            
            <div class="s-1cc498">
                <strong>Sum of Differences (Σ dᵢ):</strong> ${sumDiffs.toFixed(6)} &nbsp;|&nbsp;
                <strong>Mean Difference (\u0304d = Σ dᵢ / n):</strong> ${meanDiff.toFixed(6)}
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">1</div>
                    <div><strong>Calculate the Mean Difference (\u0304d)</strong></div>
                </div>
                <div class="s-f55593">
                    \u0304d = (Σ dᵢ) / n<br>
                    \u0304d = (${diffDetails.map(d => d.diff.toFixed(4)).join(' + ')}) / ${n}<br>
                    \u0304d = ${sumDiffs.toFixed(6)} / ${n}<br>
                    <strong class="s-16e930">\u0304d = ${meanDiff.toFixed(8)}</strong>
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Calculate the Standard Deviation of Differences (s<sub>d</sub>)</strong></div>
                </div>
                <div class="s-78a84b">
                    <div class="s-c32d5b">
                        Formula: <strong>s<sub>d</sub> = √[ Σ(dᵢ - \u0304d)² / (n - 1) ]</strong>
                    </div>
                    <div class="s-f6a2e8">
                        <strong>Explanation of each step:</strong><br><br>
                        • First, find how far each difference (dᵢ) deviates from the mean difference (\u0304d)<br>
                        • Calculate (dᵢ - \u0304d) for each pair - this is the deviation from the mean<br>
                        • Square each deviation: (dᵢ - \u0304d)² - squaring removes negative signs and gives more weight to larger deviations<br>
                        • Sum all squared deviations: Σ(dᵢ - \u0304d)²<br>
                        • Divide by (n - 1) to get the variance (using n-1 gives an unbiased estimate)<br>
                        • Take the square root to get back to original units: s<sub>d</sub> = √(variance)
                    </div>
                    
                    <h5 class="s-53211d">Step 2a: Calculate deviations from mean and squared deviations</h5>
                    <div class="s-01a9b9">
                        <table class="s-92a0fb gen-sized">
                            <thead>
                                <tr class="s-e7b83b">
                                    <th class="s-939795">Pair i</th>
                                    <th class="s-939795">dᵢ</th>
                                    <th class="s-939795">dᵢ - \u0304d (Deviation)</th>
                                    <th class="s-939795">(dᵢ - \u0304d)² (Squared Deviation)</th>
                                </tr>
                            </thead>
                            <tbody>${squaredDeviationRows}</tbody>
                        </table>
                    </div>
                    
                    <div class="s-e2f823">
                        Σ(dᵢ - \u0304d)² = ${sumSqDiffs.toFixed(6)}<br><br>
                        Step 2b: Calculate variance = Σ(dᵢ - \u0304d)² / (n - 1)<br>
                        Variance = ${sumSqDiffs.toFixed(6)} / ${n - 1} = ${varianceDiff.toFixed(8)}<br><br>
                        Step 2c: Take square root to get standard deviation<br>
                        s<sub>d</sub> = √(${varianceDiff.toFixed(8)}) = <strong class="s-f342b5">${stdDevDiff.toFixed(8)}</strong>
                    </div>
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">3</div>
                    <div><strong>Calculate the t-statistic</strong></div>
                </div>
                <div class="s-f55593">
                    Standard Error (SE) = s<sub>d</sub> / √n = ${stdDevDiff.toFixed(6)} / √${n} = ${standardError.toFixed(6)}<br><br>
                    t = \u0304d / SE = ${meanDiff.toFixed(6)} / ${standardError.toFixed(6)}<br>
                    <div class="s-505d41">t = ${tStatistic.toFixed(8)}</div>
                    <div>Degrees of Freedom (df) = n - 1 = ${df}</div>
                    <div>Critical value (α = ${alpha}) = ${criticalValueText(criticalValue, alternative)}</div>
                    <div>p-value = ${pValue.toFixed(8)}</div>
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">Test Conclusion</h3>
            <div><strong>t-statistic:</strong> ${tStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value (${alternative === 'two.sided' ? 'two-tailed' : 'one-tailed'}):</strong> ${criticalValueText(criticalValue, alternative)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
        
        <div class="s-0b1c41">
            <h4 class="s-bca61e">${(1-alpha)*100}% Confidence Interval for Mean Difference (μ<sub>d</sub>)</h4>
            <div class="s-4b0e48">
                CI = \u0304d ± t<sub>critical</sub> × SE<br>
                CI = ${meanDiff.toFixed(4)} ± ${ciT.toFixed(4)} × ${standardError.toFixed(4)}<br>
                CI = ${meanDiff.toFixed(4)} ± ${(ciT * standardError).toFixed(4)}<br>
                <strong class="s-afebce">CI = [${(meanDiff - ciT * standardError).toFixed(4)}, ${(meanDiff + ciT * standardError).toFixed(4)}]</strong>
            </div>
            <div class="s-e4020c">
                ${(meanDiff - ciT * standardError) > 0 ? '✓ The entire confidence interval is above zero, indicating a significant increase after the intervention.' : 
                  (meanDiff + ciT * standardError) < 0 ? '✓ The entire confidence interval is below zero, indicating a significant decrease after the intervention.' :
                  (meanDiff - ciT * standardError) < 0 && (meanDiff + ciT * standardError) > 0 ? '⚠ The confidence interval contains zero, indicating the change may not be statistically significant.' :
                  'Interpret the confidence interval relative to zero.'}
            </div>
        </div>
    </div>`;
    
    return { tStatistic, df, pValue, criticalValue, meanDiff, stdDevDiff, standardError, rejectH0, conclusion, interpretation, steps, chart: { dist: 't', df: df, stat: tStatistic, alternative: alternative, alpha: alpha, statLabel: 't', critical: signedCritical(alternative, criticalValue) } };
}

// ========== PAIRED T-TEST SETUP ==========
// The paired test on a summary of the differences: it is the one-sample t-test of d̄ against 0
function computePairedTFromSummary(n, meanDiff, sdDiff, alpha, alternative) {
    const result = computeOneSampleTFromSummary(n, meanDiff, sdDiff, 0, alpha, alternative);
    if (result.error) return result.message.includes('standard deviation') ? { error: true, message: 'The standard deviation of the differences s_d must be a number greater than 0.' } : result;
    result.steps = result.steps.replace('One-Sample t-test', 'Paired t-test (from the summary of the differences)').replace('Sample Mean (x̄)', 'Mean difference (d̄)').replace('Sample Std Dev (s)', 'Std Dev of differences (s_d)');
    return result;
}

function setupPairedTLogic() {
    const computeBtn = document.getElementById("pairedTComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const summaryMode = document.querySelector('#statPairedTInterface [data-mode-select]').value === 'summary';
        const rawBefore = document.getElementById("pairedBeforeData").value;
        const rawAfter = document.getElementById("pairedAfterData").value;
        const before = parseNumbersFromInput(rawBefore);
        const after = parseNumbersFromInput(rawAfter);
        const alpha = parseFloat(document.getElementById("pairedAlpha").value);
        const alternative = document.getElementById("pairedAlternative").value;
        const resultDiv = document.getElementById("pairedTResultArea");
        const valueSpan = document.getElementById("pairedTValueDisplay");
        const stepsSpan = document.getElementById("pairedTStepsDisplay");
        
        if (!summaryMode && (!before.length || !after.length)) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter both before and after data.");
            hideStatChartCard('test');
            return;
        }
        
        const result = summaryMode
            ? computePairedTFromSummary(parseFloat(document.getElementById("pairedN").value), parseFloat(document.getElementById("pairedMeanDiff").value), parseFloat(document.getElementById("pairedSdDiff").value), alpha, alternative)
            : computePairedTTest(before, after, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `t = ${result.tStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H0' : 'Fail to reject H0'}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("pairedTResultArea", result.chart);
        }
    });
    
    attachClearHandler("pairedTClearBtn", ["pairedBeforeData", "pairedAfterData"], "pairedTResultArea");
}
