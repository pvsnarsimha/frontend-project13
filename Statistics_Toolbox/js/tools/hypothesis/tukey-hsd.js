/* TukeyHSD: tukeyhsd tool (render, compute, setup) */

// ========== TUKEY HSD RENDER FUNCTION ==========
function renderTukeyHSDInterface() {
    return buildInterface({
        id: "statTukeyHSDInterface",
        title: "📊 Tukey's HSD (Honestly Significant Difference)",
        card: [
            { formula: "📌 HSD = q × √[MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>) / 2]  (Tukey–Kramer; = q × √(MS<sub>within</sub> / n) when all n are equal)" },
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
    const parsed = parseValueGroupInput(inputText);
    const groups = parsed.groups;
    if (parsed.skipped.length) {
        return { error: true, message: `Could not read: ${parsed.skipped.slice(0, 5).map(x => escapeHtml(x)).join(', ')}${parsed.skipped.length > 5 ? ', …' : ''}. Each entry must look like value:group (for example 12.5:Control).` };
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
    {
        const guard = withinGroupError(dfWithin, ssWithin, 'Tukey HSD', 'values');
        if (guard) return guard;
    }
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
    let steps = `<div class="s-0932fc">
        
        <!-- HEADER SECTION -->
        <div class="s-954e6d gen-pad">
            <h1 class="s-b82e54">📊 Tukey's HSD Test</h1>
            <p class="s-522e7c">Honestly Significant Difference - Post-hoc Analysis After ANOVA</p>
            <div class="s-8b2ecd">
                <strong>📐 Formula:</strong> HSD = q<sub>α,k,df</sub> × √[MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>) / 2] (Tukey–Kramer)
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div class="s-467ef9 gen-pad">
            <h2 class="s-2ce3ad">📚 What is Tukey's HSD Test?</h2>
            
            <div class="s-09a0b8 gen-pad">
                <h3 class="s-6efabd">🎯 The Problem It Solves</h3>
                <p>After a significant ANOVA result (which tells us that <strong>at least one group differs</strong>), we need to know <strong>WHICH specific groups</strong> are different from each other.</p>
                <div class="s-4a5044">
                    💡 <strong>Analogy:</strong> ANOVA is like a fire alarm telling you there's a fire somewhere in the building. Tukey's HSD is like going room by room to find exactly which rooms are on fire!
                </div>
            </div>
            
            <div class="s-0d8f09 gen-pad">
                <h3 class="s-6efabd">🔬 How Tukey's HSD Works</h3>
                <p>The test calculates a <strong>critical difference value (HSD)</strong>. Any pair of group means that differ by more than this HSD value is considered statistically significant.</p>
                <div class="s-915e13">
                    <strong>Formula Breakdown:</strong><br>
                    • <strong>q</strong> = Studentized range statistic (from table, depends on k and df)<br>
                    • <strong>MS<sub>within</sub></strong> = Mean Square Within (error variance from ANOVA)<br>
                    • <strong>n<sub>i</sub>, n<sub>j</sub></strong> = Sample sizes of the two groups being compared<br><br>
                    <strong>HSD = q × √[MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>) / 2]</strong> (reduces to q × √(MS<sub>within</sub> / n) when group sizes are equal)
                </div>
                <p><strong>Key Advantage:</strong> Controls the <strong>family-wise error rate</strong> at α for ALL pairwise comparisons simultaneously.</p>
            </div>
        </div>
        
        <!-- 📊 STEP 1: INPUT DATA SUMMARY -->
        <div class="s-48543a gen-pad">
            <h2 class="s-2ce3ad">📋 Step 1: Input Data Summary</h2>
            <div class="s-01a9b9">
                <table class="s-006f8c gen-sized">
                    <thead><tr class="s-e7b83b">
                        <th class="s-d66e1c">Group</th>
                        <th class="s-d66e1c">Sample Size (n)</th>
                        <th class="s-d66e1c">Sum of Values (Σx)</th>
                        <th class="s-d66e1c">Mean (x̄)</th>
                        <th class="s-d66e1c">Values</th>
                    </tr></thead>
                    <tbody>
                        ${groupData.map(g => `
                        <tr class="s-00049c">
                            <td class="s-09833f">${g.group}</td>
                            <td class="s-618bb3">${g.n}</td>
                            <td class="s-618bb3">${g.sum}</td>
                            <td class="s-e75df6">${g.mean.toFixed(4)}</td>
                            <td class="s-aa3a8a">${g.values.join(', ')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="s-37a19a">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: ANOVA CALCULATIONS -->
        <div class="s-60475b gen-pad">
            <h2 class="s-2ce3ad">🔢 Step 2: Calculate ANOVA Components</h2>
            
            <div class="s-2a0883 gen-pad">
                <h3 class="s-6efabd">📊 Step 2a: Calculate Sum of Squares Within (SS<sub>within</sub>)</h3>
                <div class="s-f6a2e8">
                    <strong>Formula:</strong> SS<sub>within</sub> = Σ(xᵢⱼ - x̄ⱼ)² = Sum of squared deviations within each group
                </div>
                ${ssWithinDetails.join('<br>')}
                <div class="s-d539cd">
                    <strong>SS<sub>within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
            </div>
            
            <div class="s-2a0883 gen-pad">
                <h3 class="s-6efabd">📊 Step 2b: Calculate Degrees of Freedom Within</h3>
                <div class="s-063d6e">
                    <strong>Formula:</strong> df<sub>within</sub> = N - k = ${totalN} - ${k} = <strong class="s-f342b5">${dfWithin}</strong>
                </div>
            </div>
            
            <div class="s-6fab3a gen-pad">
                <h3 class="s-6efabd">📊 Step 2c: Calculate Mean Square Within (MS<sub>within</sub>)</h3>
                <div class="s-063d6e">
                    <strong>Formula:</strong> MS<sub>within</sub> = SS<sub>within</sub> / df<sub>within</sub><br>
                    MS<sub>within</sub> = ${ssWithin.toFixed(4)} / ${dfWithin} = <strong class="s-bbce95">${msWithin.toFixed(6)}</strong>
                </div>
                <div class="s-28c132">
                    💡 <strong>What is MS<sub>within</sub>?</strong> It's the average variance within groups — our estimate of the "noise" or random error.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: STUDENTIZED RANGE STATISTIC (q) -->
        <div class="s-60475b gen-pad">
            <h2 class="s-2ce3ad">🔢 Step 3: Find the Studentized Range Statistic (q)</h2>
            
            <div class="s-6fab3a gen-pad">
                <div class="s-7d57aa">
                    <strong>📖 What is the Studentized Range (q)?</strong><br>
                    The studentized range distribution is used for multiple comparisons. The q-value depends on:
                    <ul class="s-bfa798">
                        <li><strong>α</strong> = Significance level (${alpha})</li>
                        <li><strong>k</strong> = Number of groups (${k})</li>
                        <li><strong>df<sub>within</sub></strong> = Degrees of freedom (${dfWithin})</li>
                    </ul>
                </div>
                
                <div class="s-ee59d6">
                    <strong>From q-table lookup:</strong><br>
                    q<sub>${alpha}, ${k}, ${dfWithin}</sub> = <strong class="s-bbce95">${q.toFixed(4)}</strong>
                </div>
                
                <div class="s-10ba7a">
                    💡 <strong>Interpretation:</strong> This q-value is the critical threshold. Larger q means more conservative test (harder to find significance).
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE HSD FOR EACH COMPARISON -->
        <div class="s-60475b gen-pad">
            <h2 class="s-2ce3ad">🔢 Step 4: Calculate HSD for Each Pairwise Comparison</h2>
            
            <div class="s-2a0883 gen-pad">
                <div class="s-063d6e">
                    <strong>Formula:</strong> HSD = q × √[MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>) / 2]
                </div>
                <div class="s-fe253b">
                    Note: When sample sizes are unequal, we use the harmonic mean or the specific n for each pair.
                </div>
            </div>
            
            <div class="s-fff633 gen-pad">
                <table class="s-897d74 gen-sized">
                    <thead>
                        <tr class="s-e7b83b">
                            <th class="s-d66e1c">Comparison</th>
                            <th class="s-d66e1c">Mean₁ - Mean₂</th>
                            <th class="s-d66e1c">HSD Calculation</th>
                            <th class="s-d66e1c">HSD Critical Value</th>
                            <th class="s-d66e1c">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => {
                            const hsdCalc = `${q.toFixed(4)} × √[${msWithin.toFixed(4)} × (1/${c.n1} + 1/${c.n2}) / 2]`;
                            return `<tr class="s-00049c">
                                <td class="s-8136fa">${c.group1} vs ${c.group2}</td>
                                <td class="s-3294d6">|${c.mean1.toFixed(4)} - ${c.mean2.toFixed(4)}| = ${c.diff.toFixed(4)}</td>
                                <td class="s-f6b2e1">${hsdCalc}</td>
                                <td class="s-3873ce">${c.hsd.toFixed(4)}</td>
                                <td class="${c.significant ? 's-62e092' : 's-3eda47'}">
                                    ${c.significant ? '✓ Significant (Reject H₀)' : '✗ Not Significant (Fail to Reject H₀)'}
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY TABLE -->
        <div class="s-2dc07c">
            <h2 class="s-01214e gen-pad">📊 Tukey HSD Summary Table</h2>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-bfd0ae">
                        <th class="s-d66e1c">Comparison</th>
                        <th class="s-d66e1c">Mean Difference</th>
                        <th class="s-d66e1c">Standard Error</th>
                        <th class="s-d66e1c">HSD Critical</th>
                        <th class="s-d66e1c">95% CI Lower</th>
                        <th class="s-d66e1c">95% CI Upper</th>
                        <th class="s-d66e1c">Significant?</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparisons.map(c => {
                        const se = Math.sqrt(msWithin * (1/c.n1 + 1/c.n2) / 2);
                        const ciLower = c.diff - c.hsd;
                        const ciUpper = c.diff + c.hsd;
                        return `<tr class="s-b490b8">
                            <td class="s-8136fa">${c.group1} - ${c.group2}</td>
                            <td class="s-02528c">${c.diff.toFixed(4)}</td>
                            <td class="s-02528c">${se.toFixed(4)}</td>
                            <td class="s-f91e25">${c.hsd.toFixed(4)}</td>
                            <td class="s-02528c">${ciLower.toFixed(4)}</td>
                            <td class="s-02528c">${ciUpper.toFixed(4)}</td>
                            <td class="${c.significant ? 's-2dc3e3' : 's-a0f714'}">
                                ${c.significant ? '✓ Yes' : '✗ No'}
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- 📌 CONCLUSION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${comparisons.some(c => c.significant) ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'} margin-bottom: 30px;">
            <h2 class="s-984cf4">📌 Step 5: Statistical Conclusion</h2>
            
            <div class="s-e1300b gen-pad">
                <h3>Decision Rule:</h3>
                <p>If |x̄<sub>i</sub> - x̄<sub>j</sub>| > HSD → Reject H₀ (means are significantly different)</p>
                
                <div class="s-5c898f">
                    <strong>Results Summary:</strong><br>
                    • Total pairwise comparisons: ${comparisons.length}<br>
                    • Significant differences found: ${comparisons.filter(c => c.significant).length}<br>
                    • Not significant: ${comparisons.filter(c => !c.significant).length}
                </div>
                
                <h3>Final Interpretation:</h3>
                <p class="s-e56c5e">
                    ${comparisons.filter(c => c.significant).length > 0 ? 
                        `✅ <strong>Significant differences detected.</strong> The following pairs show statistically significant differences at α = ${alpha}:<br>
                        ${comparisons.filter(c => c.significant).map(c => `&nbsp;&nbsp;• <strong>${c.group1} vs ${c.group2}</strong> (difference = ${c.diff.toFixed(4)}, HSD = ${c.hsd.toFixed(4)})`).join('<br>')}` : 
                        `❌ <strong>No significant differences detected.</strong> None of the pairwise comparisons exceeded the HSD critical value at α = ${alpha}.`}
                </p>
                
                <div class="s-bb8f69">
                    💡 <strong>Practical Meaning:</strong> Tukey's HSD test controls the family-wise error rate. 
                    ${comparisons.filter(c => c.significant).length > 0 ? 
                        'The significant comparisons indicate that those groups have truly different population means.' : 
                        'Despite the significant ANOVA result, Tukey\'s HSD did not find specific pairwise differences (this can happen when groups overlap or with small sample sizes).'}
                </div>
            </div>
        </div>
        
        <!-- 💡 QUICK REFERENCE -->
        <div class="s-44d7a2 gen-pad">
            <h3 class="s-862845">💡 Quick Reference: When to Use Tukey HSD</h3>
            <div class="s-cb5968 gen-grid">
                <div class="s-2ca928">
                    <strong>✅ Use Tukey HSD when:</strong>
                    <ul class="s-bfa798">
                        <li>ANOVA is significant</li>
                        <li>Equal or similar sample sizes</li>
                        <li>Want to compare ALL pairs</li>
                        <li>Homogeneity of variance holds</li>
                    </ul>
                </div>
                <div class="s-2ca928">
                    <strong>❌ Consider alternatives when:</strong>
                    <ul class="s-bfa798">
                        <li>Sample sizes are very unequal (use Games-Howell)</li>
                        <li>Only comparing to control group (use Dunnett's)</li>
                        <li>Testing complex contrasts (use Scheffé)</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    
    // One HSD exists only when every pair has the same sample sizes; with unequal n (Tukey-Kramer) each pair has its own
    const sameHsd = comparisons.length > 0 && comparisons.every(c => Math.abs(c.hsd - comparisons[0].hsd) < 1e-9 * Math.max(1, comparisons[0].hsd));
    return { comparisons, hsd: sameHsd ? comparisons[0].hsd : null, msWithin, q, steps };
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
            setHtml(valueSpan, `${sigCount}/${result.comparisons.length} comparisons significant | ${result.hsd !== null && result.hsd !== undefined ? 'HSD = ' + result.hsd.toFixed(4) : 'HSD differs by pair (unequal n)'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("tukeyClearBtn", "tukeyData", "tukeyResultArea");
}
