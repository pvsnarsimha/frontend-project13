/* ANOVA: anova tool (render, compute, setup) */

// ========== ANOVA INTERFACE RENDER ==========
// ========== ANOVA INTERFACE RENDER (WITH MATH SYMBOLS) ==========
function renderANOVAInterface() {
    return buildInterface({
        id: "statANOVAInterface",
        title: "Analysis of Variance (ANOVA)",
        card: [
            { formula: "F = MS<sub>between</sub> / MS<sub>within</sub>" },
            {
                desc: "<strong>Formula details:</strong><br>\n                    • MS<sub>between</sub> = SS<sub>between</sub> / df<sub>between</sub><br>\n                    • SS<sub>between</sub> = Σ n<sub>j</sub> × (x̄<sub>j</sub> - x̄<sub>grand</sub>)²<br>\n                    • MS<sub>within</sub> = SS<sub>within</sub> / df<sub>within</sub><br>\n                    • SS<sub>within</sub> = Σ Σ (x<sub>ij</sub> - x̄<sub>j</sub>)²"
            },
            {
                desc: "Tests whether there are significant differences among three or more group means.<br>\n                    <strong>H₀:</strong> μ₁ = μ₂ = ... = μ<sub>k</sub> (All group means are equal)<br>\n                    <strong>H₁:</strong> At least one group mean is different",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "Enter data with group labels (format: value:group):",
                textarea: {
                    id: "anovaData",
                    rows: "5",
                    placeholder: "Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"
                }
            },
            {
                hint: "<strong>Format:</strong> value:group (comma or space separated)<br>\n                    <strong>Example:</strong> 23:A means value 23 belongs to group A",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "anovaAlpha", style: FIELD_STYLE },
                options: [
                    ["0.10", "α = 0.10 (90% Confidence Level)"],
                    ["0.05", "α = 0.05 (95% Confidence Level) - Standard", true],
                    ["0.01", "α = 0.01 (99% Confidence Level)"],
                    ["0.001", "α = 0.001 (99.9% Confidence Level)"]
                ]
            }
        ],
        run: { id: "anovaComputeBtn", text: "Run ANOVA + Full Steps" },
        clear: { id: "anovaClearBtn", text: "Clear" },
        result: {
            area: "anovaResultArea",
            label: "ANOVA RESULTS",
            value: "anovaValueDisplay",
            steps: "anovaStepsDisplay",
            valueText: "---"
        }
    });
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
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeANOVA(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `F = ${result.fStatistic.toFixed(6)} | df = (${result.dfBetween}, ${result.dfWithin}) | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("anovaClearBtn", "anovaData", "anovaResultArea");
}
