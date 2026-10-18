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
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `F = ${result.fStatistic.toFixed(6)} | df = (${result.df1}, ${result.df2}) | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
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
