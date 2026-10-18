/* Scheffe: scheffe tool (render, compute, setup) */

// ========== SCHEFFÉ TEST RENDER FUNCTION ==========
function renderScheffeInterface() {
    return buildInterface({
        id: "statScheffeInterface",
        title: "📐 Scheffé Test (Post-hoc)",
        card: [
            {
                formula: "📌 S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]"
            },
            {
                desc: "<strong>What is the Scheffé Test?</strong><br>\n                    A post-hoc test that allows testing all possible contrasts (not just pairwise comparisons).\n                    Most conservative but most flexible post-hoc method."
            },
            {
                desc: "<strong>When to use:</strong> When you want to test complex contrasts or have unequal sample sizes.",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "scheffeData",
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
                select: { id: "scheffeAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "scheffeComputeBtn", text: "📐 Run Scheffé Test + Full Steps" },
        clear: { id: "scheffeClearBtn", text: "Clear" },
        result: {
            area: "scheffeResultArea",
            label: "🎯 SCHEFFÉ TEST RESULTS",
            value: "scheffeValueDisplay",
            steps: "scheffeStepsDisplay"
        }
    });
}

// ========== SCHEFFÉ TEST COMPUTATION ==========
// ========== SCHEFFÉ TEST COMPUTATION (DETAILED) ==========
function computeScheffeTest(inputText, alpha) {
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
        return { error: true, message: "Need at least 2 groups for Scheffé test." };
    }
    
    const k = groups.size;
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupData = [];
    let allValues = [];
    
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
    
    // Calculate SS_within
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
    
    const dfBetween = k - 1;
    const fStatistic = (ssBetween / dfBetween) / msWithin;
    const fCritical = fCriticalValue(alpha, dfBetween, dfWithin);
    
    // Calculate comparisons
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
            const scheffeValue = Math.sqrt((k - 1) * fCritical * msWithin * (1/n1 + 1/n2));
            const significant = diff > scheffeValue;
            
            comparisons.push({
                group1, group2, mean1, mean2, n1, n2,
                diff, scheffeValue, significant
            });
        }
    }
    
    // Build comprehensive HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📐 Scheffé Test</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">The Most Flexible Post-hoc Test for Complex Comparisons</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> S = √[(k-1) × F<sub>α,k-1,N-k</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 What is the Scheffé Test?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 What Makes Scheffé Special?</h3>
                <p>The Scheffé test is the <strong>most flexible</strong> post-hoc method because it allows testing <strong>any contrast</strong> (not just pairwise comparisons).</p>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px; margin-top: 10px;">
                    💡 <strong>What's a contrast?</strong> A contrast is a linear combination of group means. Examples:<br>
                    • Pairwise: μ<sub>A</sub> - μ<sub>B</sub><br>
                    • Complex: (μ<sub>A</sub> + μ<sub>B</sub>)/2 - μ<sub>C</sub><br>
                    • Trend: μ<sub>A</sub> - 2μ<sub>B</sub> + μ<sub>C</sub>
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How the Scheffé Test Works</h3>
                <p>The Scheffé test uses the same F-distribution as ANOVA but with an adjusted critical value:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; margin: 15px 0;">
                    <strong>S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]</strong>
                </div>
                <p><strong>Key Property:</strong> If the overall ANOVA is not significant, NO contrast will be significant with Scheffé. This makes it the most conservative test.</p>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    ⚠️ <strong>Trade-off:</strong> Most conservative → Hardest to find significance, but protects against Type I error for ALL possible contrasts.
                </div>
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
                        <th style="padding: 12px;">Σx</th>
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
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Grand Mean = ${grandMean.toFixed(4)}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: ANOVA CALCULATIONS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Complete ANOVA Calculations</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2a: Sum of Squares Within (SS<sub>within</sub>)</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>Formula:</strong> SS<sub>within</sub> = Σ(xᵢⱼ - x̄ⱼ)²
                </div>
                ${ssWithinDetails.join('<br>')}
                <div style="margin-top: 15px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2b: Sum of Squares Between (SS<sub>between</sub>)</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>Formula:</strong> SS<sub>between</sub> = Σ nⱼ(x̄ⱼ - x̄)²
                </div>
                ${ssBetweenDetails.join('<br>')}
                <div style="margin-top: 15px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>between</sub> = ${ssBetween.toFixed(4)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2c: Mean Squares and F-statistic</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>df<sub>between</sub></strong> = k - 1 = ${k} - 1 = ${dfBetween}<br>
                    <strong>MS<sub>between</sub></strong> = SS<sub>between</sub> / df<sub>between</sub> = ${ssBetween.toFixed(4)} / ${dfBetween} = ${(ssBetween/dfBetween).toFixed(4)}<br><br>
                    <strong>df<sub>within</sub></strong> = N - k = ${totalN} - ${k} = ${dfWithin}<br>
                    <strong>MS<sub>within</sub></strong> = SS<sub>within</sub> / df<sub>within</sub> = ${ssWithin.toFixed(4)} / ${dfWithin} = <strong style="color: #1a5490;">${msWithin.toFixed(6)}</strong><br><br>
                    <strong>F-statistic</strong> = MS<sub>between</sub> / MS<sub>within</sub> = ${(ssBetween/dfBetween).toFixed(4)} / ${msWithin.toFixed(4)} = ${fStatistic.toFixed(6)}
                </div>
                <div style="margin-top: 12px; background: #d4edda; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>F-critical value:</strong> F<sub>${alpha}, ${dfBetween}, ${dfWithin}</sub> = ${fCritical.toFixed(4)}
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: SCHEFFÉ CRITICAL VALUE -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Calculate Scheffé Critical Value</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Formula:</strong> S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Components:</strong><br>
                    • (k-1) = ${k} - 1 = ${dfBetween}<br>
                    • F<sub>critical</sub> = ${fCritical.toFixed(4)} (at α = ${alpha})<br>
                    • MS<sub>within</sub> = ${msWithin.toFixed(6)}<br>
                    • (1/n<sub>i</sub> + 1/n<sub>j</sub>) = varies by comparison
                </div>
                
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                    <strong>📖 Why is Scheffé the most conservative?</strong><br>
                    It uses (k-1) × F<sub>critical</sub> instead of just t or q. For k=3, this multiplies the critical value by √2 ≈ 1.41, making it harder to find significance.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: PAIRWISE COMPARISONS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Apply Scheffé Test to All Pairwise Comparisons</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 12px;">Comparison</th>
                            <th style="padding: 12px;">Mean Difference</th>
                            <th style="padding: 12px;">Scheffé Calculation</th>
                            <th style="padding: 12px;">S Critical Value</th>
                            <th style="padding: 12px;">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => {
                            const scheffeCalc = `√[${dfBetween} × ${fCritical.toFixed(4)} × ${msWithin.toFixed(4)} × (1/${c.n1} + 1/${c.n2})]`;
                            return `<tr style="border-bottom: 1px solid #e9ecef;">
                                <td style="padding: 12px; font-weight: bold;">${c.group1} vs ${c.group2}</td>
                                <td style="padding: 12px; text-align: center;">|${c.mean1.toFixed(4)} - ${c.mean2.toFixed(4)}| = ${c.diff.toFixed(4)}</td>
                                <td style="padding: 12px; font-family: monospace; font-size: 11px;">${scheffeCalc}</td>
                                <td style="padding: 12px; text-align: center; font-weight: bold;">${c.scheffeValue.toFixed(4)}</td>
                                <td style="padding: 12px; text-align: center; color: ${c.significant ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                    ${c.significant ? '✓ Significant' : '✗ Not Significant'}
                                 </td>
                             </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Scheffé Test Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Parameter</th>
                        <th style="padding: 12px;">Value</th>
                        <th style="padding: 12px;">Explanation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Number of groups (k)</td>
                        <td style="text-align: center;">${k}</td>
                        <td>Categories compared in ANOVA</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">MS<sub>within</sub> (Error variance)</td>
                        <td style="text-align: center;">${msWithin.toFixed(6)}</td>
                        <td>Pooled variance within groups</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">F<sub>critical</sub> (ANOVA)</td>
                        <td style="text-align: center;">${fCritical.toFixed(4)}</td>
                        <td>Critical value for overall ANOVA</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Scheffé Multiplier</td>
                        <td style="text-align: center; font-weight: bold;">${Math.sqrt(dfBetween * fCritical).toFixed(4)}</td>
                        <td>√[(k-1) × F<sub>critical</sub>] = ${Math.sqrt(dfBetween * fCritical).toFixed(4)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Total Comparisons</td>
                        <td style="text-align: center;">${comparisons.length}</td>
                        <td>All possible pairwise comparisons</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Significant Comparisons</td>
                        <td style="text-align: center; font-weight: bold; color: ${comparisons.filter(c => c.significant).length > 0 ? '#28a745' : '#dc3545'};">${comparisons.filter(c => c.significant).length}</td>
                        <td>Pairs where |diff| > S</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 CONCLUSION -->
        <div style="border-radius: 20px; padding: 25px; ${comparisons.some(c => c.significant) ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'} margin-bottom: 30px;">
            <h2 style="margin-top: 0;">📌 Step 5: Statistical Conclusion</h2>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>For each comparison, reject H₀ if |x̄<sub>i</sub> - x̄<sub>j</sub>| > S (Scheffé critical value)</p>
                
                <div style="margin: 15px 0; padding: 12px; background: white; border-radius: 8px;">
                    <strong>Overall ANOVA Result:</strong><br>
                    F = ${fStatistic.toFixed(4)} | Critical F = ${fCritical.toFixed(4)} | ${fStatistic > fCritical ? 'ANOVA is SIGNIFICANT' : 'ANOVA is NOT significant'}
                </div>
                
                <div style="margin: 15px 0; padding: 12px; background: white; border-radius: 8px;">
                    <strong>Scheffé Test Result:</strong><br>
                    ${comparisons.some(c => c.significant) ? 
                        `✅ <strong>Significant differences detected</strong> with Scheffé test.<br>
                        ${comparisons.filter(c => c.significant).map(c => `• <strong>${c.group1} vs ${c.group2}</strong>: |diff| = ${c.diff.toFixed(4)} > S = ${c.scheffeValue.toFixed(4)}`).join('<br>')}` : 
                        `❌ <strong>No significant differences</strong> with Scheffé test.<br>
                        All mean differences are less than the Scheffé critical values.`}
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    💡 <strong>Practical Interpretation:</strong><br>
                    The Scheffé test is the <strong>most conservative</strong> post-hoc method. 
                    ${comparisons.some(c => c.significant) ? 
                        'Since significant differences were found despite the conservative nature, these group differences are very robust.' : 
                        'Even if the ANOVA was significant, Scheffé found no specific pairwise differences. This often happens when group means overlap or with small sample sizes.'}
                </div>
            </div>
        </div>
        
        <!-- 💡 COMPARISON WITH OTHER TESTS -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="color: #1a5490; margin-top: 0;">💡 When to Use Scheffé vs Other Post-hoc Tests</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #28a745;">✅ Use Scheffé when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0; font-size: 12px;">
                        <li>Testing complex contrasts</li>
                        <li>Sample sizes are unequal</li>
                        <li>You want maximum protection</li>
                        <li>ANOVA is significant</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #ffc107;">📊 Use Tukey when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0; font-size: 12px;">
                        <li>Only pairwise comparisons needed</li>
                        <li>Sample sizes are equal/similar</li>
                        <li>You want more power</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #17a2b8;">📈 Use Bonferroni when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0; font-size: 12px;">
                        <li>Few comparisons (small m)</li>
                        <li>Simplicity is important</li>
                        <li>Tests are independent</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    
    return { comparisons, scheffeCritical: comparisons[0]?.scheffeValue, fCritical, fStatistic, steps };
}

// ========== SCHEFFÉ SETUP ==========
function setupScheffeLogic() {
    const computeBtn = document.getElementById("scheffeComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("scheffeData").value;
        const alpha = parseFloat(document.getElementById("scheffeAlpha").value);
        const resultDiv = document.getElementById("scheffeResultArea");
        const valueSpan = document.getElementById("scheffeValueDisplay");
        const stepsSpan = document.getElementById("scheffeStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeScheffeTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            const sigCount = result.comparisons.filter(c => c.significant).length;
            setHtml(valueSpan, `${sigCount}/${result.comparisons.length} comparisons significant | F_crit = ${result.fCritical?.toFixed(4) || 'N/A'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("scheffeClearBtn", "scheffeData", "scheffeResultArea");
}
