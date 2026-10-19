// Worked-solution HTML for computeBonferroniCorrection (split out of bonferroni.js): receives the values the calculation produced.
function stepsHtmlBonferroni(scope) {
    const { adjustedAlpha, alpha, comparisons, dfWithin, groupData, k, m, pooledStd, pooledVar, ssWithin, ssWithinDetails, totalN } = scope;
    let steps = `<div class="s-8f7049">
        
        <!-- HEADER SECTION -->
        <div class="s-93ccd1 gen-pad">
            <h1 class="s-6b0f3f">✏️ Bonferroni Correction</h1>
            <p class="s-6b9200">Adjusting Significance Levels for Multiple Comparisons</p>
            <div class="s-7b320b">
                <strong>📐 Formula:</strong> α<sub>adjusted</sub> = α / m &nbsp;&nbsp;|&nbsp;&nbsp; m = number of comparisons
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div class="s-23f289 gen-pad">
            <h2 class="s-404196">📚 What is the Bonferroni Correction?</h2>
            
            <div class="s-b11199 gen-pad">
                <h3 class="s-ece993">🎯 The Multiple Comparisons Problem</h3>
                <p>When you perform multiple statistical tests, the chance of making a <strong>Type I error (false positive)</strong> increases dramatically.</p>
                <div class="s-279259">
                    <strong>Example:</strong> If you perform 10 independent tests each at α = 0.05:<br>
                    Probability of at least one false positive = 1 - (0.95)¹⁰ ≈ <strong class="s-e03571">40%!</strong>
                </div>
                <div class="s-91ec11">
                    💡 <strong>Analogy:</strong> It's like buying 10 lottery tickets instead of 1 — your chance of winning (or making a false discovery) increases with each test!
                </div>
            </div>
            
            <div class="s-c25532 gen-pad">
                <h3 class="s-ece993">🔬 How the Bonferroni Correction Works</h3>
                <p>The Bonferroni correction divides the original significance level (α) by the number of comparisons (m):</p>
                <div class="s-d68a27">
                    <strong>α<sub>adjusted</sub> = α / m</strong>
                </div>
                <p>This ensures that the <strong>family-wise error rate</strong> (probability of making at least one Type I error across all tests) ≤ α.</p>
                <div class="s-35834d">
                    ⚠️ <strong>Trade-off:</strong> The correction is conservative — it reduces false positives but increases the risk of false negatives (Type II errors).
                </div>
            </div>
        </div>
        
        <!-- 📊 STEP 1: INPUT DATA -->
        <div class="s-6b30cb gen-pad">
            <h2 class="s-404196">📋 Step 1: Input Data Summary</h2>
            <div class="s-74082b">
                <table class="s-2b65ac gen-sized">
                    <thead><tr class="s-0fb8dc">
                        <th class="s-92407c">Group</th>
                        <th class="s-92407c">n</th>
                        <th class="s-92407c">Σx</th>
                        <th class="s-92407c">Mean (x̄)</th>
                        <th class="s-92407c">Variance (s²)</th>
                        <th class="s-92407c">Values</th>
                    </tr></thead>
                    <tbody>
                        ${groupData.map(g => `
                        <tr class="s-0d2692">
                            <td class="s-4370aa">${g.group}</td>
                            <td class="s-9da549">${g.n}</td>
                            <td class="s-9da549">${g.sum}</td>
                            <td class="s-99614e">${g.mean.toFixed(4)}</td>
                            <td class="s-9da549">${g.variance.toFixed(4)}</td>
                            <td class="s-828f53">${g.values.join(', ')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="s-ffb54b">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Number of pairwise comparisons (m) = ${m}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE POOLED VARIANCE -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 2: Calculate Pooled Variance (s²<sub>pooled</sub>)</h2>
            
            <div class="s-faa287 gen-pad">
                <div class="s-8dc3df">
                    <strong>Formula:</strong> s²<sub>pooled</sub> = Σ(xᵢⱼ - x̄ⱼ)² / (N - k)
                </div>
                
                <div class="s-c53f8e">
                    <strong>Step 2a: Calculate Sum of Squared Deviations Within Groups</strong>
                    ${ssWithinDetails.join('<br>')}
                    <div class="s-bf36e2"><strong>Σ(xᵢⱼ - x̄ⱼ)² = ${ssWithin.toFixed(4)}</strong></div>
                </div>
                
                <div class="s-9c0ea3">
                    <strong>Step 2b: Calculate Pooled Variance</strong><br>
                    s²<sub>pooled</sub> = ${ssWithin.toFixed(4)} / (${totalN} - ${k}) = ${ssWithin.toFixed(4)} / ${dfWithin}<br>
                    <strong class="s-c86f47">s²<sub>pooled</sub> = ${pooledVar.toFixed(6)}</strong><br>
                    s<sub>pooled</sub> = √${pooledVar.toFixed(6)} = ${pooledStd.toFixed(6)}
                </div>
                
                <div class="s-4e6da5">
                    💡 <strong>What is pooled variance?</strong> It's a weighted average of the group variances, assuming the true population variances are equal.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: APPLY BONFERRONI CORRECTION -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 3: Apply the Bonferroni Correction</h2>
            
            <div class="s-faa287 gen-pad">
                <div class="s-8dc3df">
                    <strong>Formula:</strong> α<sub>adjusted</sub> = α / m
                </div>
                
                <div class="s-742bba gen-grid gen-grid-many">
                    <div class="s-9bccbf">
                        <div class="s-0ff496">Original α</div>
                        <div class="s-291d2a">${alpha}</div>
                    </div>
                    <div class="s-9bccbf">
                        <div class="s-0ff496">Number of Comparisons (m)</div>
                        <div class="s-291d2a">${m}</div>
                        <div class="s-f6fd06">= ${k} × (${k}-1) / 2</div>
                    </div>
                    <div class="s-5258ea">
                        <div class="s-331772">Adjusted α</div>
                        <div class="s-20161f">${adjustedAlpha.toFixed(6)}</div>
                    </div>
                </div>
                
                <div class="s-c6ba0c">
                    <strong>📖 Interpretation:</strong> Each individual comparison must have p-value &lt; ${adjustedAlpha.toFixed(6)} to be considered statistically significant at family-wise α = ${alpha}.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: PAIRWISE T-TESTS -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 4: Perform Pairwise t-tests with Bonferroni Correction</h2>
            
            <div class="s-e97429 gen-pad">
                <div class="s-9454cf">
                    <strong>Formula:</strong> t = (x̄₁ - x̄₂) / √[s²<sub>pooled</sub> × (1/n₁ + 1/n₂)]
                </div>
            </div>
            
            <div class="s-96fc5e gen-pad">
                <table class="s-1b1faa gen-sized">
                    <thead>
                        <tr class="s-0fb8dc">
                            <th class="s-828f53">Comparison</th>
                            <th class="s-828f53">Mean Diff</th>
                            <th class="s-828f53">Standard Error</th>
                            <th class="s-828f53">t-statistic</th>
                            <th class="s-828f53">Critical t</th>
                            <th class="s-828f53">p-value</th>
                            <th class="s-828f53">Significant?</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => `
                        <tr class="s-0d2692">
                            <td class="s-588c6b">${c.group1} vs ${c.group2}</td>
                            <td class="s-9da549">${c.diff.toFixed(4)}</td>
                            <td class="s-9da549">${c.se.toFixed(4)}</td>
                            <td class="s-9da549">${c.tStat.toFixed(4)}</td>
                            <td class="s-9da549">${c.criticalT.toFixed(4)}</td>
                            <td class="s-9da549">${c.pValue.toFixed(6)}</td>
                            <td class="s-4370aa ${c.significant ? 'tp-text-ok' : 'tp-text-bad'}">
                                ${c.significant ? '✓ Yes' : '✗ No'}
                             </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="s-2a0932">
                <strong>Detailed Calculation for ${comparisons[0]?.group1} vs ${comparisons[0]?.group2}:</strong><br>
                t = (${comparisons[0]?.mean1.toFixed(4)} - ${comparisons[0]?.mean2.toFixed(4)}) / √[${pooledVar.toFixed(4)} × (1/${comparisons[0]?.n1} + 1/${comparisons[0]?.n2})]<br>
                t = ${comparisons[0]?.diff.toFixed(4)} / √[${pooledVar.toFixed(4)} × ${(1/comparisons[0]?.n1 + 1/comparisons[0]?.n2).toFixed(4)}]<br>
                t = ${comparisons[0]?.diff.toFixed(4)} / ${comparisons[0]?.se.toFixed(4)} = <strong>${comparisons[0]?.tStat.toFixed(4)}</strong>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY -->
        <div class="s-699d6d">
            <h2 class="s-6d943d gen-pad">📊 Bonferroni Correction Summary</h2>
            <table class="s-1b1faa gen-sized">
                <thead>
                    <tr class="s-a9ce51">
                        <th class="s-92407c">Parameter</th>
                        <th class="s-92407c">Value</th>
                        <th class="s-92407c">Explanation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="s-6085d7">
                        <td class="s-92407c">Number of groups (k)</td>
                        <td class="s-1a6540">${k}</td>
                        <td>Number of categories being compared</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-92407c">Number of comparisons (m)</td>
                        <td class="s-1a6540">${m}</td>
                        <td>Total pairwise comparisons = k(k-1)/2</td>
                     </tr>
                    <tr class="s-6085d7">
                        <td class="s-92407c">Original α</td>
                        <td class="s-1a6540">${alpha}</td>
                        <td>Desired family-wise error rate</td>
                     </tr>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Adjusted α</td>
                        <td class="s-ea245f">${adjustedAlpha.toFixed(6)}</td>
                        <td>α / m = ${alpha} / ${m}</td>
                     </tr>
                    <tr class="s-6085d7">
                        <td class="s-92407c">Pooled Variance (s²<sub>pooled</sub>)</td>
                        <td class="s-1a6540">${pooledVar.toFixed(6)}</td>
                        <td>Weighted average of group variances</td>
                     </tr>
                    <tr class="s-6085d7">
                        <td class="s-92407c">Degrees of Freedom (df)</td>
                        <td class="s-1a6540">${dfWithin}</td>
                        <td>N - k = ${totalN} - ${k}</td>
                     </tr>
                    <tr>
                        <td class="s-92407c">Significant Comparisons</td>
                        <td class="s-118507 ${comparisons.filter(c => c.significant).length > 0 ? 'tp-text-ok' : 'tp-text-bad'}">${comparisons.filter(c => c.significant).length} / ${comparisons.length}</td>
                        <td>Comparisons with p-value &lt; ${adjustedAlpha.toFixed(6)}</td>
                     </tr>
                </tbody>
             </table>
        </div>
        
        <!-- 📌 CONCLUSION -->
        <div class="s-411b0f gen-pad ${comparisons.some(c => c.significant) ? 'tp-ok-8' : 'tp-bad-8'}">
            <h2 class="s-ec2386">📌 Step 5: Conclusion</h2>
            
            <div class="s-19d20b gen-pad">
                <h3>Decision Rule:</h3>
                <p>For each comparison, reject H₀ if p-value &lt; α<sub>adjusted</sub> = ${adjustedAlpha.toFixed(6)}</p>
                
                <div class="s-0021f5">
                    <strong>Final Result:</strong><br>
                    ${comparisons.some(c => c.significant) ? 
                        `✅ <strong>Significant differences detected</strong> after Bonferroni correction.<br>
                        ${comparisons.filter(c => c.significant).map(c => `• <strong>${c.group1} vs ${c.group2}</strong>: p = ${c.pValue.toFixed(6)} &lt; ${adjustedAlpha.toFixed(6)}`).join('<br>')}` : 
                        `❌ <strong>No significant differences</strong> after Bonferroni correction.<br>
                        All p-values > ${adjustedAlpha.toFixed(6)}`}
                </div>
                
                <div class="s-aa70dd">
                    💡 <strong>Practical Interpretation:</strong><br>
                    The Bonferroni correction controls the family-wise error rate at α = ${alpha}. 
                    ${comparisons.some(c => c.significant) ? 
                        'This means we can be confident that the observed differences are not due to chance.' : 
                        'Even though the ANOVA might have been significant, the Bonferroni correction suggests no specific pairwise differences (this can happen when groups overlap or with small sample sizes).'}
                </div>
            </div>
        </div>
        
        <!-- 💡 ADVANTAGES & DISADVANTAGES -->
        <div class="s-70e41e gen-pad">
            <h3 class="s-404196">💡 Pros & Cons of Bonferroni Correction</h3>
            <div class="s-67b192 gen-grid">
                <div class="s-30cdaa">
                    <strong class="s-689fb3">✅ Advantages:</strong>
                    <ul class="s-ed7837">
                        <li>Simple and easy to understand</li>
                        <li>Very conservative — controls Type I error well</li>
                        <li>Works for any number of comparisons</li>
                        <li>Doesn't require equal sample sizes</li>
                    </ul>
                </div>
                <div class="s-30cdaa">
                    <strong class="s-e03571">❌ Disadvantages:</strong>
                    <ul class="s-ed7837">
                        <li>Can be too conservative (increases Type II error)</li>
                        <li>Less powerful than other methods (Tukey, Scheffé)</li>
                        <li>Assumes independent tests</li>
                        <li>Not recommended for large numbers of comparisons</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    return steps;
}
