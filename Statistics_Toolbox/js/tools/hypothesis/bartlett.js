/* Bartlett: bartlett tool (render, compute, setup) */

// ========== BARTLETT'S TEST INTERFACE RENDER ==========
function renderBartlettInterface() {
    return buildInterface({
        id: "statBartlettInterface",
        title: "📐 Bartlett's Test (Sphericity / Homogeneity of Variance)",
        formula: "📌 χ² = (N - k) ln(s²) - Σ(nⱼ - 1) ln(sⱼ²)",
        desc: "<strong>What is Bartlett's Test?</strong><br>\n                    Bartlett's test checks the assumption of equal variances across groups.\n                    H₀: All group variances are equal | H₁: At least one group variance differs.\n                    <strong>Note:</strong> Assumes normality; sensitive to non-normality.",
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "bartlettData",
                    rows: "5",
                    placeholder: "Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"
                }
            },
            {
                hint: "<strong>Format:</strong> value:group (comma or space separated)",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "bartlettAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "bartlettComputeBtn", text: "📐 Run Bartlett's Test + Full Steps" },
        clear: { id: "bartlettClearBtn", text: "Clear" },
        result: {
            area: "bartlettResultArea",
            label: "🎯 BARTLETT'S TEST RESULTS",
            value: "bartlettValueDisplay",
            steps: "bartlettStepsDisplay"
        }
    });
}

// ========== BARTLETT'S TEST COMPUTATION ==========
// ========== BARTLETT'S TEST COMPUTATION ==========
function computeBartlettTest(inputText, alpha) {
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
        return { error: true, message: "Need at least 2 groups for Bartlett's test." };
    }
    
    let groupVars = new Map();
    let groupSizes = new Map();
    let groupMeans = new Map();
    let totalN = 0;
    
    // Detailed variance calculations
    let varianceDetails = [];
    
    for (let [group, values] of groups) {
        let n = values.length;
        let mean = values.reduce((a,b) => a+b, 0) / n;
        groupMeans.set(group, mean);
        
        // Calculate variance with detailed steps
        let squaredDiffs = [];
        for (let v of values) {
            let diff = v - mean;
            squaredDiffs.push(diff * diff);
        }
        let sumSqDiffs = squaredDiffs.reduce((a,b) => a+b, 0);
        let variance = sumSqDiffs / (n - 1);
        
        groupVars.set(group, variance);
        groupSizes.set(group, n);
        totalN += n;
        
        varianceDetails.push(`
            <div style="background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                <strong style="color: #1a5490;">Group ${group}</strong> (n = ${n})<br>
                Mean = ${mean.toFixed(4)}<br>
                Squared deviations: ${squaredDiffs.map((d, i) => `(${values[i]} - ${mean.toFixed(4)})² = ${d.toFixed(4)}`).join(', ')}<br>
                Σ(x - x̄)² = ${sumSqDiffs.toFixed(4)}<br>
                <strong>Variance (s²) = ${sumSqDiffs.toFixed(4)} / ${n-1} = ${variance.toFixed(6)}</strong>
            </div>
        `);
    }
    
    let k = groups.size;
    
    // Calculate pooled variance
    let numerator = 0;
    let denominator = 0;
    let pooledDetails = [];
    
    for (let [group, n] of groupSizes) {
        let variance = groupVars.get(group);
        let term = (n - 1) * variance;
        numerator += term;
        denominator += (n - 1);
        pooledDetails.push(`(${n}-1) × ${variance.toFixed(4)} = ${term.toFixed(4)}`);
    }
    let pooledVar = numerator / denominator;
    
    // Calculate Bartlett's chi-square statistic
    let term1 = (totalN - k) * Math.log(pooledVar);
    let term2 = 0;
    let term2Details = [];
    
    for (let [group, n] of groupSizes) {
        let variance = groupVars.get(group);
        let term = (n - 1) * Math.log(variance);
        term2 += term;
        term2Details.push(`(${n}-1) × ln(${variance.toFixed(4)}) = ${term.toFixed(4)}`);
    }
    let chiSquare = term1 - term2;
    
    // Correction factor
    let sumInv = Array.from(groupSizes.values()).reduce((sum, n) => sum + 1/(n-1), 0);
    let C = 1 + (1 / (3 * (k - 1))) * (sumInv - 1/(totalN - k));
    let chiSquareAdj = chiSquare / C;
    
    let df = k - 1;
    let criticalValue = chiSquareCriticalValue(alpha, df);
    let pValue = 1 - chiSquareCDF(chiSquareAdj, df);
    let rejectH0 = chiSquareAdj > criticalValue;
    
    // Build comprehensive educational HTML
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📐 Bartlett's Test for Homogeneity of Variance</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">A parametric test to check if multiple groups have EQUAL variances</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> χ² = (N - k) ln(s²) - Σ(nⱼ - 1) ln(sⱼ²)
            </div>
            <p style="margin-top: 12px; font-size: 14px;">
                <strong>H₀ (Null Hypothesis):</strong> σ₁² = σ₂² = ... = σ<sub>k</sub>² (All group variances are equal)<br>
                <strong>H₁ (Alternative):</strong> At least one group variance is different
            </p>
            <div style="margin-top: 10px; background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 8px; font-size: 13px;">
                ⚠️ <strong>Important Assumption:</strong> Bartlett's test assumes the data is NORMALLY distributed. If normality is violated, use Levene's test instead.
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 Understanding Bartlett's Test</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 What Problem Does It Solve?</h3>
                <p>Before comparing group means (using ANOVA), we must check if the variances are equal. Unequal variances can lead to:</p>
                <ul>
                    <li>Increased Type I error (false positives)</li>
                    <li>Reduced statistical power</li>
                    <li>Invalid confidence intervals</li>
                </ul>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px; margin-top: 10px;">
                    💡 <strong>Think of it like this:</strong> Imagine comparing three basketball players' scoring averages. If one player scores consistently (low variance) while another is inconsistent (high variance), their averages might not be comparable!
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How Bartlett's Test Works</h3>
                <p>Bartlett's test uses the ratio of the <strong>pooled variance</strong> to the individual group variances:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; margin: 15px 0;">
                    <strong>χ² = (N - k) ln(s²) - Σ(nⱼ - 1) ln(sⱼ²)</strong>
                </div>
                <p>Where:</p>
                <ul>
                    <li><strong>s²</strong> = Pooled variance (weighted average of group variances)</li>
                    <li><strong>sⱼ²</strong> = Variance of group j</li>
                    <li><strong>nⱼ</strong> = Sample size of group j</li>
                    <li><strong>N</strong> = Total sample size</li>
                    <li><strong>k</strong> = Number of groups</li>
                </ul>
                <p><strong>Key Insight:</strong> If all variances are equal, the test statistic will be small. Large values indicate unequal variances.</p>
            </div>
        </div>
        
        <!-- 📊 STEP 1: INPUT DATA -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📋 Step 1: Input Data Summary</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Group</th>
                        <th style="padding: 12px;">n</th>
                        <th style="padding: 12px;">Values</th>
                        <th style="padding: 12px;">Mean</th>
                    </tr></thead>
                    <tbody>
                        ${Array.from(groups.entries()).map(([group, values]) => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${group}</td>
                            <td style="padding: 10px; text-align: center;">${values.length}</td>
                            <td style="padding: 10px;">${values.join(', ')}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8;">${groupMeans.get(group).toFixed(4)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Degrees of freedom (df) = ${df}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE GROUP VARIANCES -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate Each Group's Variance (sⱼ²)</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <strong>💡 What is Variance?</strong> Variance measures how spread out the data is. A small variance means values are close to the mean; a large variance means they're widely scattered.
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>Formula:</strong> s² = Σ(x - x̄)² / (n - 1)
                ${varianceDetails.join('')}
            </div>
        </div>
        
        <!-- 🔢 STEP 3: CALCULATE POOLED VARIANCE -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Calculate Pooled Variance (s²)</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <strong>💡 What is Pooled Variance?</strong> It's a weighted average of all group variances. Think of it as the "overall" variance assuming all groups have the same underlying variance.
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>Formula:</strong> s² = Σ(nⱼ - 1) × sⱼ² / Σ(nⱼ - 1)<br><br>
                Numerator: ${pooledDetails.join(' + ')} = ${numerator.toFixed(4)}<br>
                Denominator: ${denominator}<br>
                <div style="margin-top: 10px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>Pooled Variance (s²) = ${pooledVar.toFixed(6)}</strong>
                </div>
                <p style="margin-top: 10px; font-size: 13px;">📌 This is our estimate of the common variance if H₀ (equal variances) were true.</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE BARTLETT'S STATISTIC -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Calculate Bartlett's χ² Statistic</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Part A: Calculate (N - k) × ln(s²)</h3>
                <div style="font-family: monospace;">
                    N - k = ${totalN} - ${k} = ${totalN - k}<br>
                    ln(s²) = ln(${pooledVar.toFixed(6)}) = ${Math.log(pooledVar).toFixed(6)}<br>
                    <strong>Term A = ${totalN - k} × ${Math.log(pooledVar).toFixed(6)} = ${term1.toFixed(6)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Part B: Calculate Σ(nⱼ - 1) × ln(sⱼ²)</h3>
                ${term2Details.map(d => `<div style="margin: 5px 0;">• ${d}</div>`).join('')}
                <div style="margin-top: 10px;"><strong>Term B = ${term2.toFixed(6)}</strong></div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Part C: Calculate χ² = Term A - Term B</h3>
                <div style="font-family: monospace; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    χ² = ${term1.toFixed(6)} - ${term2.toFixed(6)} = <strong style="color: #1a5490;">${chiSquare.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 5: APPLY CORRECTION FACTOR -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 5: Apply Correction Factor for Small Samples</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <strong>💡 Why a correction?</strong> Bartlett's test is biased for small samples. The correction factor adjusts the statistic to be more accurate.
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>Formula:</strong> C = 1 + [1/(3(k-1))] × [Σ 1/(nⱼ-1) - 1/(N-k)]<br><br>
                Σ 1/(nⱼ-1) = ${Array.from(groupSizes.values()).map(n => `1/(${n}-1) = ${(1/(n-1)).toFixed(4)}`).join(' + ')} = ${sumInv.toFixed(6)}<br>
                1/(N-k) = 1/(${totalN}-${k}) = ${(1/(totalN - k)).toFixed(6)}<br>
                Σ 1/(nⱼ-1) - 1/(N-k) = ${sumInv.toFixed(6)} - ${(1/(totalN - k)).toFixed(6)} = ${(sumInv - 1/(totalN - k)).toFixed(6)}<br>
                1/(3(k-1)) = 1/(3×${k-1}) = ${(1/(3*(k-1))).toFixed(6)}<br>
                <div style="margin-top: 10px;">
                    <strong>C = 1 + ${(1/(3*(k-1))).toFixed(6)} × ${(sumInv - 1/(totalN - k)).toFixed(6)} = ${C.toFixed(6)}</strong>
                </div>
                <div style="margin-top: 10px;">
                    <strong>Corrected χ² = χ² / C = ${chiSquare.toFixed(6)} / ${C.toFixed(6)} = <span style="color: #1a5490; font-size: 18px;">${chiSquareAdj.toFixed(6)}</span></strong>
                </div>
            </div>
        </div>
        
        <!-- 📊 STEP 6: RESULTS TABLE -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Bartlett's Test Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Statistic</th>
                        <th style="padding: 12px;">Value</th>
                        <th style="padding: 12px;">Interpretation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="padding: 12px;">χ² (uncorrected)</td><td style="text-align: center;">${chiSquare.toFixed(6)}</td><td>Raw test statistic</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 12px;">Correction Factor (C)</td><td style="text-align: center;">${C.toFixed(6)}</td><td>Small sample adjustment</td></tr>
                    <tr><td style="padding: 12px;"><strong>χ² (corrected)</strong></td><td style="text-align: center;"><strong>${chiSquareAdj.toFixed(6)}</strong></td><td>Final test statistic</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 12px;">Degrees of Freedom (df)</td><td style="text-align: center;">${df}</td><td>df = k - 1 = ${k} - 1</td></tr>
                    <tr><td style="padding: 12px;">Critical Value (α = ${alpha})</td><td style="text-align: center;">${criticalValue.toFixed(6)}</td><td>From χ² distribution table</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 12px;">p-value</td><td style="text-align: center;">${pValue.toFixed(8)}</td><td>Probability of observing this result if H₀ is true</td></tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 DECISION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${rejectH0 ? 'background: #f8d7da; border-left: 8px solid #dc3545;' : 'background: #d4edda; border-left: 8px solid #28a745;'} margin-bottom: 30px;">
            <h2 style="margin-top: 0;">📌 Step 6: Statistical Decision</h2>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>If χ² > Critical Value OR p-value < α, we REJECT the null hypothesis.</p>
                <p>Here, χ² = ${chiSquareAdj.toFixed(6)} ${chiSquareAdj > criticalValue ? '>' : '<'} ${criticalValue.toFixed(6)}</p>
                <p>p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <div style="font-size: 24px; font-weight: bold; margin: 15px 0; text-align: center;">
                    ${rejectH0 ? '❌ REJECT H₀' : '✅ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Conclusion:</h3>
                <p style="font-size: 16px;">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group variances are NOT equal. ' +
                        'The homogeneity of variance assumption is VIOLATED. Consider using Welch\'s ANOVA or transforming your data.' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group variances differ. ' +
                        'The homogeneity of variance assumption is SATISFIED. You can proceed with standard ANOVA.'}
                </p>
            </div>
        </div>
        
        <!-- 📊 VISUAL COMPARISON: BARTLETT'S VS LEVENE'S -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📊 Which Test Should You Use?</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="color: #28a745;">✅ Use Bartlett's Test When:</h3>
                    <ul style="margin-bottom: 0;">
                        <li>Data is <strong>normally distributed</strong></li>
                        <li>Sample sizes are <strong>equal or large</strong></li>
                        <li>You want the <strong>most powerful test</strong> (when assumptions are met)</li>
                    </ul>
                </div>
                
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="color: #ffc107;">⚠️ Use Levene's Test When:</h3>
                    <ul style="margin-bottom: 0;">
                        <li>Data is <strong>not normally distributed</strong></li>
                        <li>You have <strong>small sample sizes</strong></li>
                        <li>You want a <strong>robust test</strong> that's less sensitive to outliers</li>
                    </ul>
                </div>
            </div>
            
            <div style="margin-top: 20px; background: #e8f4f8; padding: 15px; border-radius: 12px;">
                <strong>💡 Pro Tip:</strong> If you're unsure about normality, run BOTH tests. If they agree, you can be confident in your conclusion. If they disagree, examine your data for outliers or non-normality.
            </div>
        </div>
    </div>`;
    
    return { chiSquare: chiSquareAdj, df, pValue, rejectH0, steps };
}

function setupBartlettLogic() {
    const computeBtn = document.getElementById("bartlettComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("bartlettData").value;
        const alpha = parseFloat(document.getElementById("bartlettAlpha").value);
        const resultDiv = document.getElementById("bartlettResultArea");
        const valueSpan = document.getElementById("bartlettValueDisplay");
        const stepsSpan = document.getElementById("bartlettStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeBartlettTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSquare.toFixed(4)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("bartlettClearBtn", "bartlettData", "bartlettResultArea");
}
