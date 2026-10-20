/* FTest: ftest tool (render, compute, setup) */

// ========== F-TEST INTERFACE RENDER ==========
function renderFTestInterface() {
    return buildInterface({
        id: "statFTestInterface",
        title: "F-test (Comparison of Variances)",
        formula: "F = s1^2 / s2^2  (where s1^2 >= s2^2)",
        desc: "Tests whether two population variances are equal. Used to check homogeneity of variances assumption.",
        inputs: [
            {
                label: "Enter Sample 1 data (comma, space, or line separated):",
                textarea: { id: "ftestData1", rows: "3", placeholder: "Example: 12, 15, 14, 16, 13, 15" }
            },
            {
                label: "Enter Sample 2 data (comma, space, or line separated):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "ftestData2", rows: "3", placeholder: "Example: 18, 20, 19, 21, 22, 20, 19" }
            },
            {
                label: "Significance Level (alpha):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "ftestAlpha", style: FIELD_STYLE },
                options: [
                    ["0.10", "alpha = 0.10 (90% Confidence)"],
                    ["0.05", "alpha = 0.05 (95% Confidence) - Standard", true],
                    ["0.01", "alpha = 0.01 (99% Confidence)"]
                ]
            },
            {
                label: "Alternative Hypothesis:",
                select: { id: "ftestAlternative", style: FIELD_STYLE },
                options: [
                    ["two.sided", "Variances are not equal (Two-tailed)"],
                    ["greater", "Variance1 > Variance2 (One-tailed)"],
                    ["less", "Variance1 < Variance2 (One-tailed)"]
                ]
            }
        ],
        run: { id: "ftestComputeBtn", text: "Run F-test + Full Steps" },
        clear: { id: "ftestClearBtn", text: "Clear All" },
        result: {
            area: "ftestResultArea",
            label: "F-TEST RESULTS",
            value: "ftestValueDisplay",
            steps: "ftestStepsDisplay",
            valueText: "---"
        }
    });
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
    
    // greater / less: F = s₁² / s₂² with df = (n₁ - 1, n₂ - 1), nothing swapped:
    //   greater rejects for large F (upper tail), less rejects for small F (lower tail).
    // two-sided: the larger variance goes on top (F ≥ 1), so only the upper tail matters and the p-value is doubled.
    const twoSided = alternative !== 'greater' && alternative !== 'less';
    const swapped = twoSided && var2 > var1;
    const fStatistic = swapped ? var2 / var1 : var1 / var2;
    const df1 = swapped ? n2 - 1 : n1 - 1;
    const df2 = swapped ? n1 - 1 : n2 - 1;
    const numeratorSample = swapped ? 2 : 1, denominatorSample = swapped ? 1 : 2;
    const lowerCdf = fCDF(fStatistic, df1, df2);
    let criticalValue, pValue;
    if (alternative === 'greater') {
        criticalValue = fCriticalValue(alpha, df1, df2);
        pValue = 1 - lowerCdf;
    } else if (alternative === 'less') {
        criticalValue = fCriticalValue(1 - alpha, df1, df2);
        pValue = lowerCdf;
    } else {
        criticalValue = fCriticalValue(alpha / 2, df1, df2);
        pValue = Math.min(1, 2 * (1 - lowerCdf));
    }
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    const claim = alternative === 'greater' ? 'σ₁² is greater than σ₂²' : (alternative === 'less' ? 'σ₁² is less than σ₂²' : 'the variances are different');
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that ${claim}.` :
        `There is NOT sufficient evidence that ${claim}.`;
    
    // Build detailed variance calculation tables
    let var1Rows = '';
    for (let i = 0; i < n1; i++) {
        let sign1 = deviations1[i] >= 0 ? '+' : '';
        let sign2 = squaredDeviations1[i] >= 0 ? '+' : '';
        var1Rows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            <td class="s-a7c3f4">${sample1[i]}</td>
            <td class="s-a7c3f4">${sample1[i]} - ${mean1.toFixed(4)} = ${sign1}${deviations1[i].toFixed(4)}</td>
            <td class="s-b33403">(${sign1}${deviations1[i].toFixed(4)})² = ${squaredDeviations1[i].toFixed(4)}</td>
        </tr>`;
    }
    
    let var2Rows = '';
    for (let i = 0; i < n2; i++) {
        let sign1 = deviations2[i] >= 0 ? '+' : '';
        let sign2 = squaredDeviations2[i] >= 0 ? '+' : '';
        var2Rows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            <td class="s-a7c3f4">${sample2[i]}</td>
            <td class="s-a7c3f4">${sample2[i]} - ${mean2.toFixed(4)} = ${sign1}${deviations2[i].toFixed(4)}</td>
            <td class="s-b33403">(${sign1}${deviations2[i].toFixed(4)})² = ${squaredDeviations2[i].toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">F</span>
                <h2 class="s-f8a94d">F-test (Comparison of Variances)</h2>
            </div>
            <div class="s-55b017">
                <div>Formula: <strong>F = s₁² / s₂²</strong> &nbsp;&nbsp;(where s₁² ≥ s₂²)</div>
                <div class="s-af5894">Where:</div>
                <div>• s₁² = Variance of sample 1 = Σ(xᵢ - x̄₁)² / (n₁ - 1)</div>
                <div>• s₂² = Variance of sample 2 = Σ(yᵢ - ȳ₂)² / (n₂ - 1)</div>
            </div>
            <p class="s-98fe52">H₀: σ₁² = σ₂² (Variances are equal) | H₁: σ₁² ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} σ₂²</p>
        </div>
        
        <!-- SECTION 1: SAMPLE 1 VARIANCE CALCULATION -->
        <div class="s-f652ac gen-pad">
            <h3 class="s-a767b0">Sample 1 Variance Calculation (s₁²)</h3>
            
            <div class="s-3a063a">
                <div class="s-5bf32f">
                    <strong>Formula: s₁² = Σ(xᵢ - x̄₁)² / (n₁ - 1)</strong>
                </div>
                <div class="s-f6a2e8">
                    <strong>Step-by-step explanation:</strong><br><br>
                    1. Calculate the mean of Sample 1: <strong>x̄₁ = (Σ xᵢ) / n₁</strong><br>
                    2. For each value, find the deviation from the mean: <strong>(xᵢ - x̄₁)</strong><br>
                    3. Square each deviation: <strong>(xᵢ - x̄₁)²</strong> (squaring removes negative signs)<br>
                    4. Sum all squared deviations: <strong>Σ(xᵢ - x̄₁)²</strong><br>
                    5. Divide by (n₁ - 1) to get the sample variance (unbiased estimate)
                </div>
                
                <div class="s-c803e1">
                    <strong>Step 1: Calculate mean of Sample 1</strong><br>
                    x̄₁ = (${sample1.join(' + ')}) / ${n1} = ${mean1.toFixed(6)}
                </div>
                
                <div class="s-c803e1">
                    <strong>Steps 2-4: Calculate squared deviations from the mean</strong>
                    <div class="s-cc7da6">
                        <table class="s-92a0fb gen-sized">
                            <thead>
                                <tr class="s-a9f1d9">
                                    <th class="s-939795">i</th>
                                    <th class="s-939795">xᵢ</th>
                                    <th class="s-939795">xᵢ - x̄₁ (Deviation)</th>
                                    <th class="s-939795">(xᵢ - x̄₁)² (Squared Deviation)</th>
                                 </tr>
                            </thead>
                            <tbody>${var1Rows}</tbody>
                         </table>
                    </div>
                </div>
                
                <div class="s-e825be">
                    <strong>Step 4: Sum of squared deviations</strong><br>
                    Σ(xᵢ - x̄₁)² = ${sumSq1.toFixed(6)}<br><br>
                    <strong>Step 5: Calculate sample variance</strong><br>
                    s₁² = Σ(xᵢ - x̄₁)² / (n₁ - 1)<br>
                    s₁² = ${sumSq1.toFixed(6)} / ${n1 - 1}<br>
                    <strong class="s-111099">s₁² = ${var1.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- SECTION 2: SAMPLE 2 VARIANCE CALCULATION -->
        <div class="s-f652ac gen-pad">
            <h3 class="s-8f4470">Sample 2 Variance Calculation (s₂²)</h3>
            
            <div class="s-3a063a">
                <div class="s-5bf32f">
                    <strong>Formula: s₂² = Σ(yᵢ - ȳ₂)² / (n₂ - 1)</strong>
                </div>
                <div class="s-f6a2e8">
                    <strong>Step-by-step explanation:</strong><br><br>
                    1. Calculate the mean of Sample 2: <strong>ȳ₂ = (Σ yᵢ) / n₂</strong><br>
                    2. For each value, find the deviation from the mean: <strong>(yᵢ - ȳ₂)</strong><br>
                    3. Square each deviation: <strong>(yᵢ - ȳ₂)²</strong><br>
                    4. Sum all squared deviations: <strong>Σ(yᵢ - ȳ₂)²</strong><br>
                    5. Divide by (n₂ - 1) to get the sample variance
                </div>
                
                <div class="s-c803e1">
                    <strong>Step 1: Calculate mean of Sample 2</strong><br>
                    ȳ₂ = (${sample2.join(' + ')}) / ${n2} = ${mean2.toFixed(6)}
                </div>
                
                <div class="s-c803e1">
                    <strong>Steps 2-4: Calculate squared deviations from the mean</strong>
                    <div class="s-cc7da6">
                        <table class="s-92a0fb gen-sized">
                            <thead>
                                <tr class="s-d91a85">
                                    <th class="s-939795">i</th>
                                    <th class="s-939795">yᵢ</th>
                                    <th class="s-939795">yᵢ - ȳ₂ (Deviation)</th>
                                    <th class="s-939795">(yᵢ - ȳ₂)² (Squared Deviation)</th>
                                 </tr>
                            </thead>
                            <tbody>${var2Rows}</tbody>
                         </table>
                    </div>
                </div>
                
                <div class="s-e825be">
                    <strong>Step 4: Sum of squared deviations</strong><br>
                    Σ(yᵢ - ȳ₂)² = ${sumSq2.toFixed(6)}<br><br>
                    <strong>Step 5: Calculate sample variance</strong><br>
                    s₂² = Σ(yᵢ - ȳ₂)² / (n₂ - 1)<br>
                    s₂² = ${sumSq2.toFixed(6)} / ${n2 - 1}<br>
                    <strong class="s-74bf1f">s₂² = ${var2.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- SECTION 3: F-TEST CALCULATION -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">F-Test Calculation</h3>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">1</div>
                    <div><strong>Sample variances</strong></div>
                </div>
                <div class="s-f55593">
                    s₁² = ${var1.toFixed(6)} &nbsp;|&nbsp; s₂² = ${var2.toFixed(6)}<br>
                    Larger variance = ${Math.max(var1, var2).toFixed(6)} (${var1 >= var2 ? 'Sample 1' : 'Sample 2'})<br>
                    Smaller variance = ${Math.min(var1, var2).toFixed(6)} (${var1 >= var2 ? 'Sample 2' : 'Sample 1'})
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Calculate the F-statistic</strong></div>
                </div>
                <div class="s-f55593">
                    <strong>${twoSided ? 'F = (larger variance) / (smaller variance)' : 'F = s₁² / s₂²'}</strong><br>
                    F = ${(swapped ? var2 : var1).toFixed(6)} / ${(swapped ? var1 : var2).toFixed(6)}<br>
                    <div class="s-505d41">F = ${fStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">3</div>
                    <div><strong>Determine Degrees of Freedom and Critical Value</strong></div>
                </div>
                <div class="s-f55593">
                    df₁ (numerator, sample ${numeratorSample}) = n${numeratorSample === 1 ? '₁' : '₂'} - 1 = ${numeratorSample === 1 ? n1 : n2} - 1 = ${df1}<br>
                    df₂ (denominator, sample ${denominatorSample}) = n${denominatorSample === 1 ? '₁' : '₂'} - 1 = ${denominatorSample === 1 ? n1 : n2} - 1 = ${df2}<br>
                    Significance level (α) = ${alpha}<br>
                    ${twoSided ? `Critical value F<sub>critical</sub>(${df1}, ${df2}) at α/2 = ${criticalValue.toFixed(6)}` : (alternative === 'less' ? `Lower critical value F<sub>critical</sub>(${df1}, ${df2}) = ${criticalValue.toFixed(6)} (reject if F is below it)` : `Critical value F<sub>critical</sub>(${df1}, ${df2}) = ${criticalValue.toFixed(6)}`)}<br>
                    p-value = ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <!-- SECTION 4: CONCLUSION -->
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">Test Conclusion</h3>
            <div><strong>F-statistic:</strong> ${fStatistic.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> (${df1}, ${df2})</div>
            <div><strong>${alternative === 'less' ? 'Lower critical value (reject if F is below it)' : 'Critical Value'}:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${rejectH0 ? 
                    `✓ p-value (${pValue.toFixed(6)}) < α (${alpha}) → Reject H₀` : 
                    `✗ p-value (${pValue.toFixed(6)}) ≥ α (${alpha}) → Cannot reject H₀`}
            </div>
        </div>
        
        <div class="s-afe18c">
            <strong>💡 Interpretation Guide for F-test:</strong><br>
            • If F > F<sub>critical</sub>, reject H₀ → Variances are significantly different<br>
            • If F ≤ F<sub>critical</sub>, fail to reject H₀ → Variances are not significantly different<br>
            • The F-test assumes both samples are from normally distributed populations<br>
            • This test is commonly used before performing a two-sample t-test to check the equal variance assumption
        </div>
    </div>`;
    
    return { fStatistic, df1, df2, pValue, criticalValue, rejectH0, conclusion, interpretation, steps, chart: { dist: 'f', df: df1, df2: df2, stat: fStatistic, alternative: alternative === 'less' ? 'less' : (alternative === 'greater' ? 'greater' : 'two.sided'), alpha: alpha, statLabel: 'F', critical: alternative === 'less' ? { lower: criticalValue, upper: null } : { lower: null, upper: criticalValue } } };
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
            setHtml(stepsSpan, "Please enter both sample datasets.");
            return;
        }
        
        const result = computeFTest(sample1, sample2, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `F = ${result.fStatistic.toFixed(6)} | df = (${result.df1}, ${result.df2}) | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("ftestResultArea", result.chart);
        }
    });
    
    attachClearHandler("ftestClearBtn", ["ftestData1", "ftestData2"], "ftestResultArea");
}
