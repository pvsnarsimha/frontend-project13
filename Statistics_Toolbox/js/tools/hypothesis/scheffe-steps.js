// Worked-solution HTML for computeScheffeTest (split out of scheffe.js): receives the values the calculation produced.
function stepsHtmlScheffe(scope) {
    const { alpha, comparisons, dfBetween, dfWithin, fCritical, fStatistic, grandMean, groupData, k, msWithin, ssBetween, ssBetweenDetails, ssWithin, ssWithinDetails, totalN } = scope;
    let steps = `<div class="s-8f7049">
        
        <!-- HEADER SECTION -->
        <div class="s-93ccd1 gen-pad">
            <h1 class="s-6b0f3f">📐 Scheffé Test</h1>
            <p class="s-6b9200">The Most Flexible Post-hoc Test for Complex Comparisons</p>
            <div class="s-7b320b">
                <strong>📐 Formula:</strong> S = √[(k-1) × F<sub>α,k-1,N-k</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div class="s-23f289 gen-pad">
            <h2 class="s-404196">📚 What is the Scheffé Test?</h2>
            
            <div class="s-b11199 gen-pad">
                <h3 class="s-ece993">🎯 What Makes Scheffé Special?</h3>
                <p>The Scheffé test is the <strong>most flexible</strong> post-hoc method because it allows testing <strong>any contrast</strong> (not just pairwise comparisons).</p>
                <div class="s-a6a712">
                    💡 <strong>What's a contrast?</strong> A contrast is a linear combination of group means. Examples:<br>
                    • Pairwise: μ<sub>A</sub> - μ<sub>B</sub><br>
                    • Complex: (μ<sub>A</sub> + μ<sub>B</sub>)/2 - μ<sub>C</sub><br>
                    • Trend: μ<sub>A</sub> - 2μ<sub>B</sub> + μ<sub>C</sub>
                </div>
            </div>
            
            <div class="s-c25532 gen-pad">
                <h3 class="s-ece993">🔬 How the Scheffé Test Works</h3>
                <p>The Scheffé test uses the same F-distribution as ANOVA but with an adjusted critical value:</p>
                <div class="s-d68a27">
                    <strong>S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]</strong>
                </div>
                <p><strong>Key Property:</strong> If the overall ANOVA is not significant, NO contrast will be significant with Scheffé. This makes it the most conservative test.</p>
                <div class="s-35834d">
                    ⚠️ <strong>Trade-off:</strong> Most conservative → Hardest to find significance, but protects against Type I error for ALL possible contrasts.
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
                        <th class="s-92407c">Values</th>
                    </tr></thead>
                    <tbody>
                        ${groupData.map(g => `
                        <tr class="s-0d2692">
                            <td class="s-4370aa">${g.group}</td>
                            <td class="s-9da549">${g.n}</td>
                            <td class="s-9da549">${g.sum}</td>
                            <td class="s-99614e">${g.mean.toFixed(4)}</td>
                            <td class="s-828f53">${g.values.join(', ')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="s-ffb54b">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Grand Mean = ${grandMean.toFixed(4)}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: ANOVA CALCULATIONS -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 2: Complete ANOVA Calculations</h2>
            
            <div class="s-e97429 gen-pad">
                <h3 class="s-ece993">📊 Step 2a: Sum of Squares Within (SS<sub>within</sub>)</h3>
                <div class="s-5a798c">
                    <strong>Formula:</strong> SS<sub>within</sub> = Σ(xᵢⱼ - x̄ⱼ)²
                </div>
                ${ssWithinDetails.join('<br>')}
                <div class="s-629d96">
                    <strong>SS<sub>within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
            </div>
            
            <div class="s-e97429 gen-pad">
                <h3 class="s-ece993">📊 Step 2b: Sum of Squares Between (SS<sub>between</sub>)</h3>
                <div class="s-5a798c">
                    <strong>Formula:</strong> SS<sub>between</sub> = Σ nⱼ(x̄ⱼ - x̄)²
                </div>
                ${ssBetweenDetails.join('<br>')}
                <div class="s-629d96">
                    <strong>SS<sub>between</sub> = ${ssBetween.toFixed(4)}</strong>
                </div>
            </div>
            
            <div class="s-faa287 gen-pad">
                <h3 class="s-ece993">📊 Step 2c: Mean Squares and F-statistic</h3>
                <div class="s-9c0ea3">
                    <strong>df<sub>between</sub></strong> = k - 1 = ${k} - 1 = ${dfBetween}<br>
                    <strong>MS<sub>between</sub></strong> = SS<sub>between</sub> / df<sub>between</sub> = ${ssBetween.toFixed(4)} / ${dfBetween} = ${(ssBetween/dfBetween).toFixed(4)}<br><br>
                    <strong>df<sub>within</sub></strong> = N - k = ${totalN} - ${k} = ${dfWithin}<br>
                    <strong>MS<sub>within</sub></strong> = SS<sub>within</sub> / df<sub>within</sub> = ${ssWithin.toFixed(4)} / ${dfWithin} = <strong class="s-ece993">${msWithin.toFixed(6)}</strong><br><br>
                    <strong>F-statistic</strong> = MS<sub>between</sub> / MS<sub>within</sub> = ${(ssBetween/dfBetween).toFixed(4)} / ${msWithin.toFixed(4)} = ${fStatistic.toFixed(6)}
                </div>
                <div class="s-4e6da5">
                    💡 <strong>F-critical value:</strong> F<sub>${alpha}, ${dfBetween}, ${dfWithin}</sub> = ${fCritical.toFixed(4)}
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: SCHEFFÉ CRITICAL VALUE -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 3: Calculate Scheffé Critical Value</h2>
            
            <div class="s-faa287 gen-pad">
                <div class="s-8dc3df">
                    <strong>Formula:</strong> S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]
                </div>
                
                <div class="s-c53f8e">
                    <strong>Components:</strong><br>
                    • (k-1) = ${k} - 1 = ${dfBetween}<br>
                    • F<sub>critical</sub> = ${fCritical.toFixed(4)} (at α = ${alpha})<br>
                    • MS<sub>within</sub> = ${msWithin.toFixed(6)}<br>
                    • (1/n<sub>i</sub> + 1/n<sub>j</sub>) = varies by comparison
                </div>
                
                <div class="s-c6ba0c">
                    <strong>📖 Why is Scheffé the most conservative?</strong><br>
                    It uses (k-1) × F<sub>critical</sub> instead of just t or q. For k=3, this multiplies the critical value by √2 ≈ 1.41, making it harder to find significance.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: PAIRWISE COMPARISONS -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 4: Apply Scheffé Test to All Pairwise Comparisons</h2>
            
            <div class="s-96fc5e gen-pad">
                <table class="s-1b1faa gen-sized">
                    <thead>
                        <tr class="s-0fb8dc">
                            <th class="s-92407c">Comparison</th>
                            <th class="s-92407c">Mean Difference</th>
                            <th class="s-92407c">Scheffé Calculation</th>
                            <th class="s-92407c">S Critical Value</th>
                            <th class="s-92407c">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => {
                            const scheffeCalc = `√[${dfBetween} × ${fCritical.toFixed(4)} × ${msWithin.toFixed(4)} × (1/${c.n1} + 1/${c.n2})]`;
                            return `<tr class="s-0d2692">
                                <td class="s-eddf4d">${c.group1} vs ${c.group2}</td>
                                <td class="s-d32c36">|${c.mean1.toFixed(4)} - ${c.mean2.toFixed(4)}| = ${c.diff.toFixed(4)}</td>
                                <td class="s-098123">${scheffeCalc}</td>
                                <td class="s-3b2dbd">${c.scheffeValue.toFixed(4)}</td>
                                <td class="s-3b2dbd ${c.significant ? 'tp-text-ok' : 'tp-text-bad'}">
                                    ${c.significant ? '✓ Significant' : '✗ Not Significant'}
                                 </td>
                             </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY -->
        <div class="s-699d6d">
            <h2 class="s-6d943d gen-pad">📊 Scheffé Test Summary</h2>
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
                        <td>Categories compared in ANOVA</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-92407c">MS<sub>within</sub> (Error variance)</td>
                        <td class="s-1a6540">${msWithin.toFixed(6)}</td>
                        <td>Pooled variance within groups</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-92407c">F<sub>critical</sub> (ANOVA)</td>
                        <td class="s-1a6540">${fCritical.toFixed(4)}</td>
                        <td>Critical value for overall ANOVA</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Scheffé Multiplier</td>
                        <td class="s-118507">${Math.sqrt(dfBetween * fCritical).toFixed(4)}</td>
                        <td>√[(k-1) × F<sub>critical</sub>] = ${Math.sqrt(dfBetween * fCritical).toFixed(4)}</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-92407c">Total Comparisons</td>
                        <td class="s-1a6540">${comparisons.length}</td>
                        <td>All possible pairwise comparisons</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-92407c">Significant Comparisons</td>
                        <td class="s-118507 ${comparisons.filter(c => c.significant).length > 0 ? 'tp-text-ok' : 'tp-text-bad'}">${comparisons.filter(c => c.significant).length}</td>
                        <td>Pairs where |diff| > S</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 CONCLUSION -->
        <div class="s-e0012b gen-pad ${comparisons.some(c => c.significant) ? 'tp-ok-8' : 'tp-bad-8'}">
            <h2 class="s-ec2386">📌 Step 5: Statistical Conclusion</h2>
            
            <div class="s-19d20b gen-pad">
                <h3>Decision Rule:</h3>
                <p>For each comparison, reject H₀ if |x̄<sub>i</sub> - x̄<sub>j</sub>| > S (Scheffé critical value)</p>
                
                <div class="s-0021f5">
                    <strong>Overall ANOVA Result:</strong><br>
                    F = ${fStatistic.toFixed(4)} | Critical F = ${fCritical.toFixed(4)} | ${fStatistic > fCritical ? 'ANOVA is SIGNIFICANT' : 'ANOVA is NOT significant'}
                </div>
                
                <div class="s-0021f5">
                    <strong>Scheffé Test Result:</strong><br>
                    ${comparisons.some(c => c.significant) ? 
                        `✅ <strong>Significant differences detected</strong> with Scheffé test.<br>
                        ${comparisons.filter(c => c.significant).map(c => `• <strong>${c.group1} vs ${c.group2}</strong>: |diff| = ${c.diff.toFixed(4)} > S = ${c.scheffeValue.toFixed(4)}`).join('<br>')}` : 
                        `❌ <strong>No significant differences</strong> with Scheffé test.<br>
                        All mean differences are less than the Scheffé critical values.`}
                </div>
                
                <div class="s-aa70dd">
                    💡 <strong>Practical Interpretation:</strong><br>
                    The Scheffé test is the <strong>most conservative</strong> post-hoc method. 
                    ${comparisons.some(c => c.significant) ? 
                        'Since significant differences were found despite the conservative nature, these group differences are very robust.' : 
                        'Even if the ANOVA was significant, Scheffé found no specific pairwise differences. This often happens when group means overlap or with small sample sizes.'}
                </div>
            </div>
        </div>
        
        <!-- 💡 COMPARISON WITH OTHER TESTS -->
        <div class="s-d15ab1 gen-pad">
            <h3 class="s-404196">💡 When to Use Scheffé vs Other Post-hoc Tests</h3>
            <div class="s-000c50 gen-grid gen-grid-many">
                <div class="s-30cdaa">
                    <strong class="s-689fb3">✅ Use Scheffé when:</strong>
                    <ul class="s-b70bca">
                        <li>Testing complex contrasts</li>
                        <li>Sample sizes are unequal</li>
                        <li>You want maximum protection</li>
                        <li>ANOVA is significant</li>
                    </ul>
                </div>
                <div class="s-30cdaa">
                    <strong class="s-54f524">📊 Use Tukey when:</strong>
                    <ul class="s-b70bca">
                        <li>Only pairwise comparisons needed</li>
                        <li>Sample sizes are equal/similar</li>
                        <li>You want more power</li>
                    </ul>
                </div>
                <div class="s-30cdaa">
                    <strong class="s-4a607c">📈 Use Bonferroni when:</strong>
                    <ul class="s-b70bca">
                        <li>Few comparisons (small m)</li>
                        <li>Simplicity is important</li>
                        <li>Tests are independent</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    return steps;
}
