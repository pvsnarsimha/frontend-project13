/* TukeyHSD: tukeyhsd tool (render, compute, setup) */

// ========== TUKEY HSD RENDER FUNCTION ==========
function renderTukeyHSDInterface() {
    return buildInterface({
        id: "statTukeyHSDInterface",
        title: "📊 Tukey's HSD (Honestly Significant Difference)",
        card: [
            { formula: "📌 HSD = q × √(MS<sub>within</sub> / n)" },
            {
                desc: "<strong>What is Tukey's HSD?</strong><br>\n                    A post-hoc test that compares all possible pairs of group means after a significant ANOVA result.\n                    Controls the family-wise error rate at α for all pairwise comparisons."
            },
            {
                desc: "<strong>When to use:</strong> After a significant one-way ANOVA when you want to know which specific groups differ.",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "tukeyData",
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
                select: { id: "tukeyAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "tukeyComputeBtn", text: "📊 Run Tukey HSD + Full Steps" },
        clear: { id: "tukeyClearBtn", text: "Clear" },
        result: {
            area: "tukeyResultArea",
            label: "🎯 TUKEY HSD RESULTS",
            value: "tukeyValueDisplay",
            steps: "tukeyStepsDisplay"
        }
    });
}

// ========== TUKEY HSD COMPUTATION ==========
// ========== TUKEY HSD COMPUTATION (DETAILED) ==========
function computeTukeyHSD(inputText, alpha) {
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
        return { error: true, message: "Need at least 2 groups for Tukey HSD." };
    }
    
    const k = groups.size;
    let allValues = [];
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupData = [];
    
    // Build detailed group data
    for (let [group, values] of groups) {
        const sum = values.reduce((a,b) => a+b, 0);
        const mean = sum / values.length;
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
        allValues.push(...values);
        groupData.push({ group, values, mean, n: values.length, sum });
    }
    
    const totalN = allValues.length;
    const grandMean = allValues.reduce((a,b) => a+b, 0) / totalN;
    
    // Calculate SS_within (Sum of Squares Within)
    let ssWithin = 0;
    let ssWithinDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        ssWithinDetails.push(`\n   <strong>Group ${group}:</strong> Mean = ${mean.toFixed(4)}`);
        for (let val of values) {
            const dev = val - mean;
            const sqDev = dev * dev;
            ssWithin += sqDev;
            ssWithinDetails.push(`      (${val} - ${mean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
        }
    }
    
    const dfWithin = totalN - k;
    const msWithin = ssWithin / dfWithin;
    
    // Calculate SS_between
    let ssBetween = 0;
    let ssBetweenDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        const n = groupSizes.get(group);
        const dev = mean - grandMean;
        const contribution = n * dev * dev;
        ssBetween += contribution;
        ssBetweenDetails.push(`   Group ${group}: ${n} × (${mean.toFixed(4)} - ${grandMean.toFixed(4)})² = ${contribution.toFixed(4)}`);
    }
    
    // Studentized range critical value q(alpha; k, df) from the exact distribution
    const q = studentizedRangeCritical(alpha, k, dfWithin);
    const groupList = Array.from(groups.keys());
    let comparisons = [];
    
    for (let i = 0; i < groupList.length; i++) {
        for (let j = i + 1; j < groupList.length; j++) {
            const group1 = groupList[i];
            const group2 = groupList[j];
            const mean1 = groupMeans.get(group1);
            const mean2 = groupMeans.get(group2);
            const n1 = groupSizes.get(group1);
            const n2 = groupSizes.get(group2);
            const diff = Math.abs(mean1 - mean2);
            const hsd = q * Math.sqrt(msWithin * (1/n1 + 1/n2) / 2);
            const significant = diff > hsd;
            
            comparisons.push({
                group1, group2,
                mean1, mean2,
                n1, n2,
                diff, hsd,
                significant
            });
        }
    }
    
    // Build comprehensive HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📊 Tukey's HSD Test</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">Honestly Significant Difference - Post-hoc Analysis After ANOVA</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> HSD = q<sub>α,k,df</sub> × √(MS<sub>within</sub> / n<sub>harmonic</sub>)
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 What is Tukey's HSD Test?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 The Problem It Solves</h3>
                <p>After a significant ANOVA result (which tells us that <strong>at least one group differs</strong>), we need to know <strong>WHICH specific groups</strong> are different from each other.</p>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px; margin-top: 10px;">
                    💡 <strong>Analogy:</strong> ANOVA is like a fire alarm telling you there's a fire somewhere in the building. Tukey's HSD is like going room by room to find exactly which rooms are on fire!
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How Tukey's HSD Works</h3>
                <p>The test calculates a <strong>critical difference value (HSD)</strong>. Any pair of group means that differ by more than this HSD value is considered statistically significant.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <strong>Formula Breakdown:</strong><br>
                    • <strong>q</strong> = Studentized range statistic (from table, depends on k and df)<br>
                    • <strong>MS<sub>within</sub></strong> = Mean Square Within (error variance from ANOVA)<br>
                    • <strong>n</strong> = Sample size per group (harmonic mean if unequal)<br><br>
                    <strong>HSD = q × √(MS<sub>within</sub> / n)</strong>
                </div>
                <p><strong>Key Advantage:</strong> Controls the <strong>family-wise error rate</strong> at α for ALL pairwise comparisons simultaneously.</p>
            </div>
        </div>
        
        <!-- 📊 STEP 1: INPUT DATA SUMMARY -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📋 Step 1: Input Data Summary</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Group</th>
                        <th style="padding: 12px;">Sample Size (n)</th>
                        <th style="padding: 12px;">Sum of Values (Σx)</th>
                        <th style="padding: 12px;">Mean (x̄)</th>
                        <th style="padding: 12px;">Values</th>
                    </tr></thead>
                    <tbody>
                        ${groupData.map(g => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${g.group}</td>
                            <td style="padding: 10px; text-align: center;">${g.n}</td>
                            <td style="padding: 10px; text-align: center;">${g.sum}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${g.mean.toFixed(4)}</td>
                            <td style="padding: 10px;">${g.values.join(', ')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: ANOVA CALCULATIONS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate ANOVA Components</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2a: Calculate Sum of Squares Within (SS<sub>within</sub>)</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>Formula:</strong> SS<sub>within</sub> = Σ(xᵢⱼ - x̄ⱼ)² = Sum of squared deviations within each group
                </div>
                ${ssWithinDetails.join('<br>')}
                <div style="margin-top: 15px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2b: Calculate Degrees of Freedom Within</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>Formula:</strong> df<sub>within</sub> = N - k = ${totalN} - ${k} = <strong style="color: #1a5490;">${dfWithin}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2c: Calculate Mean Square Within (MS<sub>within</sub>)</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>Formula:</strong> MS<sub>within</sub> = SS<sub>within</sub> / df<sub>within</sub><br>
                    MS<sub>within</sub> = ${ssWithin.toFixed(4)} / ${dfWithin} = <strong style="color: #1a5490; font-size: 18px;">${msWithin.toFixed(6)}</strong>
                </div>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>What is MS<sub>within</sub>?</strong> It's the average variance within groups — our estimate of the "noise" or random error.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: STUDENTIZED RANGE STATISTIC (q) -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Find the Studentized Range Statistic (q)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📖 What is the Studentized Range (q)?</strong><br>
                    The studentized range distribution is used for multiple comparisons. The q-value depends on:
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li><strong>α</strong> = Significance level (${alpha})</li>
                        <li><strong>k</strong> = Number of groups (${k})</li>
                        <li><strong>df<sub>within</sub></strong> = Degrees of freedom (${dfWithin})</li>
                    </ul>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>From q-table lookup:</strong><br>
                    q<sub>${alpha}, ${k}, ${dfWithin}</sub> = <strong style="color: #1a5490; font-size: 18px;">${q.toFixed(4)}</strong>
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>Interpretation:</strong> This q-value is the critical threshold. Larger q means more conservative test (harder to find significance).
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE HSD FOR EACH COMPARISON -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Calculate HSD for Each Pairwise Comparison</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>Formula:</strong> HSD = q × √[MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>) / 2]
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #666;">
                    Note: When sample sizes are unequal, we use the harmonic mean or the specific n for each pair.
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 12px;">Comparison</th>
                            <th style="padding: 12px;">Mean₁ - Mean₂</th>
                            <th style="padding: 12px;">HSD Calculation</th>
                            <th style="padding: 12px;">HSD Critical Value</th>
                            <th style="padding: 12px;">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => {
                            const hsdCalc = `${q.toFixed(4)} × √[${msWithin.toFixed(4)} × (1/${c.n1} + 1/${c.n2}) / 2]`;
                            return `<tr style="border-bottom: 1px solid #e9ecef;">
                                <td style="padding: 12px; font-weight: bold;">${c.group1} vs ${c.group2}</td>
                                <td style="padding: 12px; text-align: center;">|${c.mean1.toFixed(4)} - ${c.mean2.toFixed(4)}| = ${c.diff.toFixed(4)}</td>
                                <td style="padding: 12px; font-family: monospace; font-size: 12px;">${hsdCalc}</td>
                                <td style="padding: 12px; text-align: center; font-weight: bold;">${c.hsd.toFixed(4)}</td>
                                <td style="padding: 12px; text-align: center; color: ${c.significant ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                    ${c.significant ? '✓ Significant (Reject H₀)' : '✗ Not Significant (Fail to Reject H₀)'}
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY TABLE -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Tukey HSD Summary Table</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Comparison</th>
                        <th style="padding: 12px;">Mean Difference</th>
                        <th style="padding: 12px;">Standard Error</th>
                        <th style="padding: 12px;">HSD Critical</th>
                        <th style="padding: 12px;">95% CI Lower</th>
                        <th style="padding: 12px;">95% CI Upper</th>
                        <th style="padding: 12px;">Significant?</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparisons.map(c => {
                        const se = Math.sqrt(msWithin * (1/c.n1 + 1/c.n2) / 2);
                        const ciLower = c.diff - c.hsd;
                        const ciUpper = c.diff + c.hsd;
                        return `<tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 12px; font-weight: bold;">${c.group1} - ${c.group2}</td>
                            <td style="text-align: center;">${c.diff.toFixed(4)}</td>
                            <td style="text-align: center;">${se.toFixed(4)}</td>
                            <td style="text-align: center; font-weight: bold;">${c.hsd.toFixed(4)}</td>
                            <td style="text-align: center;">${ciLower.toFixed(4)}</td>
                            <td style="text-align: center;">${ciUpper.toFixed(4)}</td>
                            <td style="text-align: center; color: ${c.significant ? '#28a745' : '#dc3545'};">
                                ${c.significant ? '✓ Yes' : '✗ No'}
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- 📌 CONCLUSION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${comparisons.some(c => c.significant) ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'} margin-bottom: 30px;">
            <h2 style="margin-top: 0;">📌 Step 5: Statistical Conclusion</h2>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>If |x̄<sub>i</sub> - x̄<sub>j</sub>| > HSD → Reject H₀ (means are significantly different)</p>
                
                <div style="margin: 15px 0; padding: 12px; background: white; border-radius: 8px;">
                    <strong>Results Summary:</strong><br>
                    • Total pairwise comparisons: ${comparisons.length}<br>
                    • Significant differences found: ${comparisons.filter(c => c.significant).length}<br>
                    • Not significant: ${comparisons.filter(c => !c.significant).length}
                </div>
                
                <h3>Final Interpretation:</h3>
                <p style="font-size: 16px;">
                    ${comparisons.filter(c => c.significant).length > 0 ? 
                        `✅ <strong>Significant differences detected.</strong> The following pairs show statistically significant differences at α = ${alpha}:<br>
                        ${comparisons.filter(c => c.significant).map(c => `&nbsp;&nbsp;• <strong>${c.group1} vs ${c.group2}</strong> (difference = ${c.diff.toFixed(4)}, HSD = ${c.hsd.toFixed(4)})`).join('<br>')}` : 
                        `❌ <strong>No significant differences detected.</strong> None of the pairwise comparisons exceeded the HSD critical value at α = ${alpha}.`}
                </p>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    💡 <strong>Practical Meaning:</strong> Tukey's HSD test controls the family-wise error rate. 
                    ${comparisons.filter(c => c.significant).length > 0 ? 
                        'The significant comparisons indicate that those groups have truly different population means.' : 
                        'Despite the significant ANOVA result, Tukey\'s HSD did not find specific pairwise differences (this can happen when groups overlap or with small sample sizes).'}
                </div>
            </div>
        </div>
        
        <!-- 💡 QUICK REFERENCE -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="color: #1a5490; margin-top: 0;">💡 Quick Reference: When to Use Tukey HSD</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>✅ Use Tukey HSD when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>ANOVA is significant</li>
                        <li>Equal or similar sample sizes</li>
                        <li>Want to compare ALL pairs</li>
                        <li>Homogeneity of variance holds</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>❌ Consider alternatives when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Sample sizes are very unequal (use Games-Howell)</li>
                        <li>Only comparing to control group (use Dunnett's)</li>
                        <li>Testing complex contrasts (use Scheffé)</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    
    return { comparisons, hsd: comparisons[0]?.hsd, msWithin, q, steps };
}

// ========== TUKEY HSD SETUP ==========
function setupTukeyHSDLogic() {
    const computeBtn = document.getElementById("tukeyComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("tukeyData").value;
        const alpha = parseFloat(document.getElementById("tukeyAlpha").value);
        const resultDiv = document.getElementById("tukeyResultArea");
        const valueSpan = document.getElementById("tukeyValueDisplay");
        const stepsSpan = document.getElementById("tukeyStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeTukeyHSD(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            const sigCount = result.comparisons.filter(c => c.significant).length;
            setHtml(valueSpan, `${sigCount}/${result.comparisons.length} comparisons significant | HSD = ${result.hsd?.toFixed(4) || 'N/A'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("tukeyClearBtn", "tukeyData", "tukeyResultArea");
}
