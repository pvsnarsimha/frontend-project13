/* Levene: levene tool (render, compute, setup) */

// ========== LEVENE'S TEST INTERFACE RENDER ==========
function renderLeveneInterface() {
    return buildInterface({
        id: "statLeveneInterface",
        title: "📊 Levene's Test (Homogeneity of Variance)",
        formula: "📌 Tests whether multiple groups have equal variances",
        desc: "<strong>What is Levene's Test?</strong><br>\n                    Levene's test checks the assumption of homogeneity of variances across groups.\n                    H₀: All group variances are equal | H₁: At least one group variance differs.",
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "leveneData",
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
                select: { id: "leveneAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "leveneComputeBtn", text: "📊 Run Levene's Test + Full Steps" },
        clear: { id: "leveneClearBtn", text: "Clear" },
        result: {
            area: "leveneResultArea",
            label: "🎯 LEVENE'S TEST RESULTS",
            value: "leveneValueDisplay",
            steps: "leveneStepsDisplay"
        }
    });
}

// ========== LEVENE'S TEST COMPUTATION ==========
// ========== LEVENE'S TEST COMPUTATION ==========
function computeLeveneTest(inputText, alpha) {
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
        return { error: true, message: "Need at least 2 groups for Levene's test." };
    }
    
    // Calculate group means
    let groupMeans = new Map();
    let groupSizes = new Map();
    
    for (let [group, values] of groups) {
        let sum = values.reduce((a,b) => a+b, 0);
        let mean = sum / values.length;
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
    }
    
    let totalN = 0;
    for (let n of groupSizes.values()) totalN += n;
    let k = groups.size;
    
    // Calculate Zᵢⱼ = |Yᵢⱼ - Ȳⱼ| (absolute deviations from group mean)
    let zValues = new Map();
    let groupZMeans = new Map();
    let allZ = [];
    
    // Detailed calculations for Z-scores
    let zCalculationDetails = [];
    
    for (let [group, values] of groups) {
        let groupMean = groupMeans.get(group);
        let zs = [];
        let groupCalc = `<div style="margin-bottom: 20px;"><strong>Group ${group}:</strong> Mean = ${groupMean.toFixed(4)}<br>`;
        
        for (let v of values) {
            let z = Math.abs(v - groupMean);
            zs.push(z);
            allZ.push(z);
            groupCalc += `&nbsp;&nbsp;|${v} - ${groupMean.toFixed(4)}| = ${z.toFixed(4)}<br>`;
        }
        let zMean = zs.reduce((a,b) => a+b, 0) / zs.length;
        groupZMeans.set(group, zMean);
        zValues.set(group, zs);
        groupCalc += `<strong>Mean of absolute deviations (Z̄${group}) = ${zMean.toFixed(4)}</strong><br>`;
        groupCalc += `This represents the average "distance" from the group mean.<br>`;
        zCalculationDetails.push(groupCalc + `</div>`);
    }
    
    let grandZMean = allZ.reduce((a,b) => a+b, 0) / totalN;
    
    // Calculate SS Between and SS Within for Z
    let ssBetween = 0;
    let ssWithin = 0;
    let betweenDetails = [];
    let withinDetails = [];
    
    for (let [group, zs] of zValues) {
        let zMean = groupZMeans.get(group);
        let n = groupSizes.get(group);
        let betweenContrib = n * Math.pow(zMean - grandZMean, 2);
        ssBetween += betweenContrib;
        betweenDetails.push(`Group ${group}: ${n} × (${zMean.toFixed(4)} - ${grandZMean.toFixed(4)})² = ${betweenContrib.toFixed(4)}`);
        
        for (let z of zs) {
            let withinContrib = Math.pow(z - zMean, 2);
            ssWithin += withinContrib;
            withinDetails.push(`Group ${group}: (${z.toFixed(4)} - ${zMean.toFixed(4)})² = ${withinContrib.toFixed(4)}`);
        }
    }
    
    let dfBetween = k - 1;
    let dfWithin = totalN - k;
    let msBetween = ssBetween / dfBetween;
    let msWithin = ssWithin / dfWithin;
    let fStatistic = msBetween / msWithin;
    
    let criticalValue = fCriticalValue(alpha, dfBetween, dfWithin);
    let pValue = 1 - fCDF(fStatistic, dfBetween, dfWithin);
    let rejectH0 = fStatistic > criticalValue;
    
    // Build comprehensive educational HTML
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER WITH FORMULA -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📊 Levene's Test for Homogeneity of Variance</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">Tests whether multiple groups have EQUAL variances (an important assumption for ANOVA)</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> F = (SS<sub>Between</sub> / df<sub>Between</sub>) / (SS<sub>Within</sub> / df<sub>Within</sub>)
            </div>
            <p style="margin-top: 12px; font-size: 14px;">
                <strong>H₀ (Null Hypothesis):</strong> σ₁² = σ₂² = ... = σ<sub>k</sub>² (All group variances are equal)<br>
                <strong>H₁ (Alternative):</strong> At least one group variance is different
            </p>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION SECTION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 What is Levene's Test and Why Do We Need It?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 The Big Picture</h3>
                <p>Imagine you're comparing test scores from three different teaching methods. Before you can trust your ANOVA results, you need to check if the <strong>spread (variance)</strong> of scores is similar across all methods.</p>
                <ul style="margin-top: 10px;">
                    <li><strong>Equal variances</strong> → ANOVA is valid and trustworthy</li>
                    <li><strong>Unequal variances</strong> → ANOVA results may be misleading</li>
                </ul>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px; margin-top: 10px;">
                    💡 <strong>Think of it this way:</strong> If one teaching method produces very consistent scores (small spread) while another produces wildly varying scores (large spread), we can't fairly compare their averages!
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How Levene's Test Works - The Intuition</h3>
                <p>Instead of comparing the original data directly, Levene's test transforms the data by calculating:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; margin: 15px 0;">
                    <strong>Zᵢⱼ = |Yᵢⱼ - Ȳⱼ|</strong>
                </div>
                <p>This means: For each value, we measure how FAR it is from its group mean (absolute deviation).</p>
                <p><strong>Key Insight:</strong> If groups have similar variances, their average absolute deviations should also be similar. If one group has much larger absolute deviations on average, that indicates larger variance!</p>
                <p>Then we run an ANOVA on these Z-values to see if the group means of absolute deviations differ significantly.</p>
            </div>
        </div>
        
        <!-- 📊 INPUT DATA SECTION -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📋 Step 1: Input Data Summary</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Group</th>
                        <th style="padding: 12px;">Sample Size (n)</th>
                        <th style="padding: 12px;">Values</th>
                        <th style="padding: 12px;">Group Mean (Ȳⱼ)</th>
                    </tr></thead>
                    <tbody>
                        ${Array.from(groups.entries()).map(([group, values]) => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${group}</td>
                            <td style="padding: 10px; text-align: center;">${values.length}</td>
                            <td style="padding: 10px;">${values.join(', ')}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${groupMeans.get(group).toFixed(4)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Degrees of freedom (between) = ${dfBetween} | Degrees of freedom (within) = ${dfWithin}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE ABSOLUTE DEVIATIONS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate Absolute Deviations Zᵢⱼ = |Yᵢⱼ - Ȳⱼ|</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <strong>💡 Why do we do this?</strong> We transform each value into a "distance from its group mean." This converts the problem of comparing VARIANCES into comparing MEANS of these distances.
            </div>
            ${zCalculationDetails.join('')}
            <div style="background: white; border-radius: 12px; padding: 15px; margin-top: 15px;">
                <strong>Grand Mean of all Z-values (Z̄):</strong> ${grandZMean.toFixed(6)}<br>
                <span style="font-size: 13px; color: #666;">This is the overall average distance from group means across ALL observations.</span>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: CALCULATE SUM OF SQUARES -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Calculate Between-Group and Within-Group Sum of Squares</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Between-Group Sum of Squares (SS<sub>Between</sub>)</h3>
                <p>Measures how much each group's mean of Z-values deviates from the grand mean.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                    <strong>Formula:</strong> SS<sub>Between</sub> = Σ nⱼ × (Z̄ⱼ - Z̄)²
                </div>
                ${betweenDetails.map(d => `<div style="margin: 8px 0;">• ${d}</div>`).join('')}
                <div style="margin-top: 12px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>Between</sub> = ${ssBetween.toFixed(4)}</strong>
                </div>
                <p style="margin-top: 10px; font-size: 13px;">📌 <strong>Interpretation:</strong> A large SS<sub>Between</sub> means the groups have very different average absolute deviations → evidence of unequal variances.</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">📊 Within-Group Sum of Squares (SS<sub>Within</sub>)</h3>
                <p>Measures how much individual Z-values vary within each group.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                    <strong>Formula:</strong> SS<sub>Within</sub> = Σ Σ (Zᵢⱼ - Z̄ⱼ)²
                </div>
                ${withinDetails.slice(0, 10).map(d => `<div style="margin: 5px 0; font-size: 12px;">• ${d}</div>`).join('')}
                ${withinDetails.length > 10 ? `<div style="margin: 5px 0;">... and ${withinDetails.length - 10} more calculations</div>` : ''}
                <div style="margin-top: 12px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>Within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
                <p style="margin-top: 10px; font-size: 13px;">📌 <strong>Interpretation:</strong> This is the "noise" or random variation within groups. We compare it to the between-group variation.</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE MEAN SQUARES -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Calculate Mean Squares (MS)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Mean Square Between (MS<sub>Between</sub>)</h3>
                <div style="font-family: monospace; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    MS<sub>Between</sub> = SS<sub>Between</sub> / df<sub>Between</sub><br>
                    = ${ssBetween.toFixed(4)} / ${dfBetween}<br>
                    = <strong style="color: #1a5490;">${msBetween.toFixed(6)}</strong>
                </div>
                <p style="margin-top: 8px; font-size: 13px;">This represents the AVERAGE variability BETWEEN groups (the "signal").</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">📊 Mean Square Within (MS<sub>Within</sub>)</h3>
                <div style="font-family: monospace; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    MS<sub>Within</sub> = SS<sub>Within</sub> / df<sub>Within</sub><br>
                    = ${ssWithin.toFixed(4)} / ${dfWithin}<br>
                    = <strong style="color: #1a5490;">${msWithin.toFixed(6)}</strong>
                </div>
                <p style="margin-top: 8px; font-size: 13px;">This represents the AVERAGE variability WITHIN groups (the "noise").</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 5: CALCULATE F-STATISTIC -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 5: Calculate the F-Statistic</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="text-align: center; font-size: 18px; margin-bottom: 15px;">
                    <strong>F = MS<sub>Between</sub> / MS<sub>Within</sub></strong>
                </div>
                <div style="font-family: monospace; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    F = ${msBetween.toFixed(6)} / ${msWithin.toFixed(6)}<br>
                    <div style="font-size: 24px; font-weight: bold; color: #1a5490; margin-top: 10px;">
                        F = ${fStatistic.toFixed(8)}
                    </div>
                </div>
                <p style="margin-top: 15px; font-size: 14px;">
                    <strong>📌 Understanding the F-statistic:</strong><br>
                    • If F is close to 1 → Signal ≈ Noise → Groups have similar variances<br>
                    • If F is large (> 1) → Signal > Noise → Groups have different variances<br>
                    • We compare F to a critical value from the F-distribution
                </p>
            </div>
        </div>
        
        <!-- 📊 STEP 6: RESULTS TABLE -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Levene's Test Summary Table</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Source</th>
                        <th style="padding: 12px;">Sum of Squares (SS)</th>
                        <th style="padding: 12px;">df</th>
                        <th style="padding: 12px;">Mean Square (MS)</th>
                        <th style="padding: 12px;">F</th>
                        <th style="padding: 12px;">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Between Groups</td>
                        <td style="text-align: center;">${ssBetween.toFixed(4)}</td>
                        <td style="text-align: center;">${dfBetween}</td>
                        <td style="text-align: center;">${msBetween.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle; font-weight: bold; font-size: 22px;">${fStatistic.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle; font-weight: bold;">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Within Groups (Error)</td>
                        <td style="text-align: center;">${ssWithin.toFixed(4)}</td>
                        <td style="text-align: center;">${dfWithin}</td>
                        <td style="text-align: center;">${msWithin.toFixed(4)}</td>
                    </tr>
                    <tr style="background: #e9ecef;">
                        <td style="padding: 12px; font-weight: bold;">Total</td>
                        <td style="text-align: center;">${(ssBetween + ssWithin).toFixed(4)}</td>
                        <td style="text-align: center;">${totalN - 1}</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 DECISION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${rejectH0 ? 'background: #f8d7da; border-left: 8px solid #dc3545;' : 'background: #d4edda; border-left: 8px solid #28a745;'} margin-bottom: 30px;">
            <h2 style="margin-top: 0;">📌 Step 6: Statistical Decision</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>F-statistic:</strong> ${fStatistic.toFixed(6)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>Comparison:</strong> ${fStatistic > criticalValue ? 'F > Critical Value' : 'F < Critical Value'}
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>If p-value < α (${alpha}), we REJECT the null hypothesis.</p>
                <p>Here, p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <div style="font-size: 24px; font-weight: bold; margin: 15px 0; text-align: center;">
                    ${rejectH0 ? '❌ REJECT H₀' : '✅ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Conclusion:</h3>
                <p style="font-size: 16px;">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group variances are NOT equal. ' +
                        'The homogeneity of variance assumption is VIOLATED. Consider using Welch\'s ANOVA or a non-parametric alternative (Kruskal-Wallis test).' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group variances differ. ' +
                        'The homogeneity of variance assumption is SATISFIED. You can proceed with standard ANOVA.'}
                </p>
            </div>
        </div>
        
        <!-- 💡 VISUAL INTERPRETATION -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">💡 Visual Interpretation: What Does This Mean?</h2>
            
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px; margin-top: 20px;">
                <div style="flex: 1; min-width: 200px; background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <div style="font-size: 48px;">📊</div>
                    <h3>F-Statistic Scale</h3>
                    <div style="height: 10px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); border-radius: 5px; margin: 15px 0;"></div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>F ≈ 1</span>
                        <span>F > Critical</span>
                    </div>
                    <div style="margin-top: 15px; font-weight: bold; font-size: 20px; color: ${rejectH0 ? '#dc3545' : '#28a745'}">
                        ${rejectH0 ? 'F = ' + fStatistic.toFixed(2) + ' → Large' : 'F = ' + fStatistic.toFixed(2) + ' → Small'}
                    </div>
                </div>
                
                <div style="flex: 2; background: white; border-radius: 15px; padding: 20px;">
                    <h3>📖 Real-World Interpretation</h3>
                    ${rejectH0 ? `
                        <p><strong>🔴 Unequal Variances Detected:</strong> The spread/spread of your data differs significantly across groups.</p>
                        <p><strong>Example:</strong> If Group A's scores range from 80-85 (tight spread) and Group B's scores range from 60-100 (wide spread), they have unequal variances.</p>
                        <p><strong>What to do next:</strong> Use Welch's ANOVA or transform your data (e.g., log transformation) to stabilize variances.</p>
                    ` : `
                        <p><strong>🟢 Equal Variances Assumption Met:</strong> The spread of your data is similar across all groups.</p>
                        <p><strong>Example:</strong> If all groups have roughly the same range of scores (e.g., all range from 70-90), variances are equal.</p>
                        <p><strong>What to do next:</strong> You can confidently use standard ANOVA to compare group means!</p>
                    `}
                </div>
            </div>
        </div>
    </div>`;
    
    return { fStatistic, dfBetween, dfWithin, pValue, rejectH0, steps };
}

// ========== SETUP FUNCTIONS ==========
function setupLeveneLogic() {
    const computeBtn = document.getElementById("leveneComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("leveneData").value;
        const alpha = parseFloat(document.getElementById("leveneAlpha").value);
        const resultDiv = document.getElementById("leveneResultArea");
        const valueSpan = document.getElementById("leveneValueDisplay");
        const stepsSpan = document.getElementById("leveneStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeLeveneTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `F = ${result.fStatistic.toFixed(4)} | df = (${result.dfBetween}, ${result.dfWithin}) | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("leveneClearBtn", "leveneData", "leveneResultArea");
}
