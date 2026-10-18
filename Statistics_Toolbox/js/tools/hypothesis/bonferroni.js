/* Bonferroni: bonferroni tool (render, compute, setup) */

// ========== BONFERRONI CORRECTION RENDER FUNCTION ==========
function renderBonferroniInterface() {
    return buildInterface({
        id: "statBonferroniInterface",
        title: "✏️ Bonferroni Correction (Post-hoc)",
        card: [
            { formula: "📌 α<sub>adjusted</sub> = α / m" },
            {
                desc: "<strong>What is the Bonferroni Correction?</strong><br>\n                    A conservative post-hoc method that adjusts the significance level for multiple comparisons.\n                    Divides α by the number of comparisons to control family-wise error rate."
            },
            {
                desc: "<strong>When to use:</strong> After any test with multiple comparisons (ANOVA, t-tests, correlations). Simple and widely applicable.",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "bonferroniData",
                    rows: "5",
                    placeholder: "Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"
                }
            },
            {
                hint: "<strong>Format:</strong> value:group (comma or space separated)",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Original Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "bonferroniAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "bonferroniComputeBtn", text: "✏️ Run Bonferroni Correction + Full Steps" },
        clear: { id: "bonferroniClearBtn", text: "Clear" },
        result: {
            area: "bonferroniResultArea",
            label: "🎯 BONFERRONI CORRECTION RESULTS",
            value: "bonferroniValueDisplay",
            steps: "bonferroniStepsDisplay"
        }
    });
}

// ========== BONFERRONI CORRECTION COMPUTATION ==========
// ========== BONFERRONI CORRECTION COMPUTATION (DETAILED) ==========
function computeBonferroniCorrection(inputText, alpha) {
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
        return { error: true, message: "Need at least 2 groups for Bonferroni correction." };
    }
    
    const k = groups.size;
    const m = (k * (k - 1)) / 2; // number of pairwise comparisons
    const adjustedAlpha = alpha / m;
    
    // Calculate group statistics
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupVariances = new Map();
    let groupData = [];
    let allValues = [];
    
    for (let [group, values] of groups) {
        const sum = values.reduce((a,b) => a+b, 0);
        const mean = sum / values.length;
        const variance = values.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
        groupVariances.set(group, variance);
        allValues.push(...values);
        groupData.push({ group, values, mean, n: values.length, sum, variance });
    }
    
    const totalN = allValues.length;
    
    // Calculate pooled variance
    let ssWithin = 0;
    let ssWithinDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        ssWithinDetails.push(`\n   <strong>Group ${group}:</strong>`);
        for (let val of values) {
            const dev = val - mean;
            const sqDev = dev * dev;
            ssWithin += sqDev;
            ssWithinDetails.push(`      (${val} - ${mean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
        }
    }
    
    const dfWithin = totalN - k;
    const pooledVar = ssWithin / dfWithin;
    const pooledStd = Math.sqrt(pooledVar);
    
    // Calculate t-tests for each pair
    let comparisons = [];
    const groupList = Array.from(groups.keys());
    
    for (let i = 0; i < groupList.length; i++) {
        for (let j = i + 1; j < groupList.length; j++) {
            const group1 = groupList[i];
            const group2 = groupList[j];
            const mean1 = groupMeans.get(group1);
            const mean2 = groupMeans.get(group2);
            const n1 = groupSizes.get(group1);
            const n2 = groupSizes.get(group2);
            const diff = mean1 - mean2;
            const se = Math.sqrt(pooledVar * (1/n1 + 1/n2));
            const tStat = Math.abs(diff / se);
            const criticalT = tCriticalValue(adjustedAlpha / 2, dfWithin);
            const pValue = 2 * (1 - tCDF(tStat, dfWithin));
            const significant = pValue < adjustedAlpha;
            
            comparisons.push({
                group1, group2, mean1, mean2, n1, n2,
                diff, se, tStat, criticalT, pValue, significant
            });
        }
    }
    
    // Build comprehensive HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">✏️ Bonferroni Correction</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">Adjusting Significance Levels for Multiple Comparisons</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> α<sub>adjusted</sub> = α / m &nbsp;&nbsp;|&nbsp;&nbsp; m = number of comparisons
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 What is the Bonferroni Correction?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 The Multiple Comparisons Problem</h3>
                <p>When you perform multiple statistical tests, the chance of making a <strong>Type I error (false positive)</strong> increases dramatically.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <strong>Example:</strong> If you perform 10 independent tests each at α = 0.05:<br>
                    Probability of at least one false positive = 1 - (0.95)¹⁰ ≈ <strong style="color: #dc3545;">40%!</strong>
                </div>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px;">
                    💡 <strong>Analogy:</strong> It's like buying 10 lottery tickets instead of 1 — your chance of winning (or making a false discovery) increases with each test!
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How the Bonferroni Correction Works</h3>
                <p>The Bonferroni correction divides the original significance level (α) by the number of comparisons (m):</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; margin: 15px 0;">
                    <strong>α<sub>adjusted</sub> = α / m</strong>
                </div>
                <p>This ensures that the <strong>family-wise error rate</strong> (probability of making at least one Type I error across all tests) ≤ α.</p>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    ⚠️ <strong>Trade-off:</strong> The correction is conservative — it reduces false positives but increases the risk of false negatives (Type II errors).
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
                        <th style="padding: 12px;">Variance (s²)</th>
                        <th style="padding: 12px;">Values</th>
                    </tr></thead>
                    <tbody>
                        ${groupData.map(g => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${g.group}</td>
                            <td style="padding: 10px; text-align: center;">${g.n}</td>
                            <td style="padding: 10px; text-align: center;">${g.sum}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${g.mean.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${g.variance.toFixed(4)}</td>
                            <td style="padding: 10px;">${g.values.join(', ')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Number of pairwise comparisons (m) = ${m}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE POOLED VARIANCE -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate Pooled Variance (s²<sub>pooled</sub>)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Formula:</strong> s²<sub>pooled</sub> = Σ(xᵢⱼ - x̄ⱼ)² / (N - k)
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Step 2a: Calculate Sum of Squared Deviations Within Groups</strong>
                    ${ssWithinDetails.join('<br>')}
                    <div style="margin-top: 10px;"><strong>Σ(xᵢⱼ - x̄ⱼ)² = ${ssWithin.toFixed(4)}</strong></div>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>Step 2b: Calculate Pooled Variance</strong><br>
                    s²<sub>pooled</sub> = ${ssWithin.toFixed(4)} / (${totalN} - ${k}) = ${ssWithin.toFixed(4)} / ${dfWithin}<br>
                    <strong style="color: #1a5490; font-size: 18px;">s²<sub>pooled</sub> = ${pooledVar.toFixed(6)}</strong><br>
                    s<sub>pooled</sub> = √${pooledVar.toFixed(6)} = ${pooledStd.toFixed(6)}
                </div>
                
                <div style="margin-top: 12px; background: #d4edda; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>What is pooled variance?</strong> It's a weighted average of the group variances, assuming the true population variances are equal.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: APPLY BONFERRONI CORRECTION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Apply the Bonferroni Correction</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Formula:</strong> α<sub>adjusted</sub> = α / m
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: #666;">Original α</div>
                        <div style="font-size: 28px; font-weight: 700;">${alpha}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: #666;">Number of Comparisons (m)</div>
                        <div style="font-size: 28px; font-weight: 700;">${m}</div>
                        <div style="font-size: 11px;">= ${k} × (${k}-1) / 2</div>
                    </div>
                    <div style="background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: #155724;">Adjusted α</div>
                        <div style="font-size: 28px; font-weight: 700; color: #28a745;">${adjustedAlpha.toFixed(6)}</div>
                    </div>
                </div>
                
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                    <strong>📖 Interpretation:</strong> Each individual comparison must have p-value &lt; ${adjustedAlpha.toFixed(6)} to be considered statistically significant at family-wise α = ${alpha}.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: PAIRWISE T-TESTS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Perform Pairwise t-tests with Bonferroni Correction</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>Formula:</strong> t = (x̄₁ - x̄₂) / √[s²<sub>pooled</sub> × (1/n₁ + 1/n₂)]
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Comparison</th>
                            <th style="padding: 10px;">Mean Diff</th>
                            <th style="padding: 10px;">Standard Error</th>
                            <th style="padding: 10px;">t-statistic</th>
                            <th style="padding: 10px;">Critical t</th>
                            <th style="padding: 10px;">p-value</th>
                            <th style="padding: 10px;">Significant?</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; font-weight: bold;">${c.group1} vs ${c.group2}</td>
                            <td style="padding: 10px; text-align: center;">${c.diff.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${c.se.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${c.tStat.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${c.criticalT.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${c.pValue.toFixed(6)}</td>
                            <td style="padding: 10px; text-align: center; color: ${c.significant ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                ${c.significant ? '✓ Yes' : '✗ No'}
                             </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <strong>Detailed Calculation for ${comparisons[0]?.group1} vs ${comparisons[0]?.group2}:</strong><br>
                t = (${comparisons[0]?.mean1.toFixed(4)} - ${comparisons[0]?.mean2.toFixed(4)}) / √[${pooledVar.toFixed(4)} × (1/${comparisons[0]?.n1} + 1/${comparisons[0]?.n2})]<br>
                t = ${comparisons[0]?.diff.toFixed(4)} / √[${pooledVar.toFixed(4)} × ${(1/comparisons[0]?.n1 + 1/comparisons[0]?.n2).toFixed(4)}]<br>
                t = ${comparisons[0]?.diff.toFixed(4)} / ${comparisons[0]?.se.toFixed(4)} = <strong>${comparisons[0]?.tStat.toFixed(4)}</strong>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Bonferroni Correction Summary</h2>
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
                        <td>Number of categories being compared</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Number of comparisons (m)</td>
                        <td style="text-align: center;">${m}</td>
                        <td>Total pairwise comparisons = k(k-1)/2</td>
                     </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Original α</td>
                        <td style="text-align: center;">${alpha}</td>
                        <td>Desired family-wise error rate</td>
                     </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Adjusted α</td>
                        <td style="text-align: center; font-weight: bold; color: #1a5490;">${adjustedAlpha.toFixed(6)}</td>
                        <td>α / m = ${alpha} / ${m}</td>
                     </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Pooled Variance (s²<sub>pooled</sub>)</td>
                        <td style="text-align: center;">${pooledVar.toFixed(6)}</td>
                        <td>Weighted average of group variances</td>
                     </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Degrees of Freedom (df)</td>
                        <td style="text-align: center;">${dfWithin}</td>
                        <td>N - k = ${totalN} - ${k}</td>
                     </tr>
                    <tr>
                        <td style="padding: 12px;">Significant Comparisons</td>
                        <td style="text-align: center; font-weight: bold; color: ${comparisons.filter(c => c.significant).length > 0 ? '#28a745' : '#dc3545'};">${comparisons.filter(c => c.significant).length} / ${comparisons.length}</td>
                        <td>Comparisons with p-value &lt; ${adjustedAlpha.toFixed(6)}</td>
                     </tr>
                </tbody>
             </table>
        </div>
        
        <!-- 📌 CONCLUSION -->
        <div style="border-radius: 20px; padding: 25px; ${comparisons.some(c => c.significant) ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'}">
            <h2 style="margin-top: 0;">📌 Step 5: Conclusion</h2>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>For each comparison, reject H₀ if p-value &lt; α<sub>adjusted</sub> = ${adjustedAlpha.toFixed(6)}</p>
                
                <div style="margin: 15px 0; padding: 12px; background: white; border-radius: 8px;">
                    <strong>Final Result:</strong><br>
                    ${comparisons.some(c => c.significant) ? 
                        `✅ <strong>Significant differences detected</strong> after Bonferroni correction.<br>
                        ${comparisons.filter(c => c.significant).map(c => `• <strong>${c.group1} vs ${c.group2}</strong>: p = ${c.pValue.toFixed(6)} &lt; ${adjustedAlpha.toFixed(6)}`).join('<br>')}` : 
                        `❌ <strong>No significant differences</strong> after Bonferroni correction.<br>
                        All p-values > ${adjustedAlpha.toFixed(6)}`}
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    💡 <strong>Practical Interpretation:</strong><br>
                    The Bonferroni correction controls the family-wise error rate at α = ${alpha}. 
                    ${comparisons.some(c => c.significant) ? 
                        'This means we can be confident that the observed differences are not due to chance.' : 
                        'Even though the ANOVA might have been significant, the Bonferroni correction suggests no specific pairwise differences (this can happen when groups overlap or with small sample sizes).'}
                </div>
            </div>
        </div>
        
        <!-- 💡 ADVANTAGES & DISADVANTAGES -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 20px;">
            <h3 style="color: #1a5490; margin-top: 0;">💡 Pros & Cons of Bonferroni Correction</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #28a745;">✅ Advantages:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Simple and easy to understand</li>
                        <li>Very conservative — controls Type I error well</li>
                        <li>Works for any number of comparisons</li>
                        <li>Doesn't require equal sample sizes</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #dc3545;">❌ Disadvantages:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Can be too conservative (increases Type II error)</li>
                        <li>Less powerful than other methods (Tukey, Scheffé)</li>
                        <li>Assumes independent tests</li>
                        <li>Not recommended for large numbers of comparisons</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    
    return { comparisons, adjustedAlpha, steps };
}

// ========== BONFERRONI SETUP ==========
function setupBonferroniLogic() {
    const computeBtn = document.getElementById("bonferroniComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("bonferroniData").value;
        const alpha = parseFloat(document.getElementById("bonferroniAlpha").value);
        const resultDiv = document.getElementById("bonferroniResultArea");
        const valueSpan = document.getElementById("bonferroniValueDisplay");
        const stepsSpan = document.getElementById("bonferroniStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeBonferroniCorrection(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `α_adj = ${result.adjustedAlpha.toFixed(6)} | ${result.comparisons.filter(c => c.significant).length} significant comparisons`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("bonferroniClearBtn", "bonferroniData", "bonferroniResultArea");
}
