// Worked-solution HTML for computeLeveneTest (split out of levene.js): receives the values the calculation produced.
function stepsHtmlLevene(scope) {
    const { alpha, betweenDetails, criticalValue, dfBetween, dfWithin, fStatistic, grandZMean, groupMeans, groups, k, msBetween, msWithin, pValue, rejectH0, ssBetween, ssWithin, totalN, withinDetails, zCalculationDetails } = scope;
    let steps = `<div class="s-8f7049">
        
        <!-- HEADER WITH FORMULA -->
        <div class="s-93ccd1 gen-pad">
            <h1 class="s-6b0f3f">📊 Levene's Test for Homogeneity of Variance</h1>
            <p class="s-6b9200">Tests whether multiple groups have EQUAL variances (an important assumption for ANOVA)</p>
            <div class="s-7b320b">
                <strong>📐 Formula:</strong> F = (SS<sub>Between</sub> / df<sub>Between</sub>) / (SS<sub>Within</sub> / df<sub>Within</sub>)
            </div>
            <p class="s-d0a272">
                <strong>H₀ (Null Hypothesis):</strong> σ₁² = σ₂² = ... = σ<sub>k</sub>² (All group variances are equal)<br>
                <strong>H₁ (Alternative):</strong> At least one group variance is different
            </p>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION SECTION -->
        <div class="s-23f289 gen-pad">
            <h2 class="s-404196">📚 What is Levene's Test and Why Do We Need It?</h2>
            
            <div class="s-b11199 gen-pad">
                <h3 class="s-ece993">🎯 The Big Picture</h3>
                <p>Imagine you're comparing test scores from three different teaching methods. Before you can trust your ANOVA results, you need to check if the <strong>spread (variance)</strong> of scores is similar across all methods.</p>
                <ul class="s-bf36e2">
                    <li><strong>Equal variances</strong> → ANOVA is valid and trustworthy</li>
                    <li><strong>Unequal variances</strong> → ANOVA results may be misleading</li>
                </ul>
                <div class="s-a6a712">
                    💡 <strong>Think of it this way:</strong> If one teaching method produces very consistent scores (small spread) while another produces wildly varying scores (large spread), we can't fairly compare their averages!
                </div>
            </div>
            
            <div class="s-c25532 gen-pad">
                <h3 class="s-ece993">🔬 How Levene's Test Works - The Intuition</h3>
                <p>Instead of comparing the original data directly, Levene's test transforms the data by calculating:</p>
                <div class="s-d68a27">
                    <strong>Zᵢⱼ = |Yᵢⱼ - Ȳⱼ|</strong>
                </div>
                <p>This means: For each value, we measure how FAR it is from its group mean (absolute deviation).</p>
                <p><strong>Key Insight:</strong> If groups have similar variances, their average absolute deviations should also be similar. If one group has much larger absolute deviations on average, that indicates larger variance!</p>
                <p>Then we run an ANOVA on these Z-values to see if the group means of absolute deviations differ significantly.</p>
            </div>
        </div>
        
        <!-- 📊 INPUT DATA SECTION -->
        <div class="s-6b30cb gen-pad">
            <h2 class="s-404196">📋 Step 1: Input Data Summary</h2>
            <div class="s-74082b">
                <table class="s-2b65ac gen-sized">
                    <thead><tr class="s-0fb8dc">
                        <th class="s-92407c">Group</th>
                        <th class="s-92407c">Sample Size (n)</th>
                        <th class="s-92407c">Values</th>
                        <th class="s-92407c">Group Mean (Ȳⱼ)</th>
                    </tr></thead>
                    <tbody>
                        ${Array.from(groups.entries()).map(([group, values]) => `
                        <tr class="s-0d2692">
                            <td class="s-4370aa">${group}</td>
                            <td class="s-9da549">${values.length}</td>
                            <td class="s-828f53">${values.join(', ')}</td>
                            <td class="s-99614e">${groupMeans.get(group).toFixed(4)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="s-ffb54b">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Degrees of freedom (between) = ${dfBetween} | Degrees of freedom (within) = ${dfWithin}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE ABSOLUTE DEVIATIONS -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 2: Calculate Absolute Deviations Zᵢⱼ = |Yᵢⱼ - Ȳⱼ|</h2>
            <div class="s-56af1d">
                <strong>💡 Why do we do this?</strong> We transform each value into a "distance from its group mean." This converts the problem of comparing VARIANCES into comparing MEANS of these distances.
            </div>
            ${zCalculationDetails.join('')}
            <div class="s-53a981">
                <strong>Grand Mean of all Z-values (Z̄):</strong> ${grandZMean.toFixed(6)}<br>
                <span class="s-62d24b">This is the overall average distance from group means across ALL observations.</span>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: CALCULATE SUM OF SQUARES -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 3: Calculate Between-Group and Within-Group Sum of Squares</h2>
            
            <div class="s-e97429 gen-pad">
                <h3 class="s-ece993">📊 Between-Group Sum of Squares (SS<sub>Between</sub>)</h3>
                <p>Measures how much each group's mean of Z-values deviates from the grand mean.</p>
                <div class="s-b0242a">
                    <strong>Formula:</strong> SS<sub>Between</sub> = Σ nⱼ × (Z̄ⱼ - Z̄)²
                </div>
                ${betweenDetails.map(d => `<div class="s-38a5eb">• ${d}</div>`).join('')}
                <div class="s-b8aac1">
                    <strong>SS<sub>Between</sub> = ${ssBetween.toFixed(4)}</strong>
                </div>
                <p class="s-51eb7f">📌 <strong>Interpretation:</strong> A large SS<sub>Between</sub> means the groups have very different average absolute deviations → evidence of unequal variances.</p>
            </div>
            
            <div class="s-faa287 gen-pad">
                <h3 class="s-ece993">📊 Within-Group Sum of Squares (SS<sub>Within</sub>)</h3>
                <p>Measures how much individual Z-values vary within each group.</p>
                <div class="s-b0242a">
                    <strong>Formula:</strong> SS<sub>Within</sub> = Σ Σ (Zᵢⱼ - Z̄ⱼ)²
                </div>
                ${withinDetails.slice(0, 10).map(d => `<div class="s-123c4f">• ${d}</div>`).join('')}
                ${withinDetails.length > 10 ? `<div class="s-914a81">... and ${withinDetails.length - 10} more calculations</div>` : ''}
                <div class="s-b8aac1">
                    <strong>SS<sub>Within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
                <p class="s-51eb7f">📌 <strong>Interpretation:</strong> This is the "noise" or random variation within groups. We compare it to the between-group variation.</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE MEAN SQUARES -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 4: Calculate Mean Squares (MS)</h2>
            
            <div class="s-e97429 gen-pad">
                <h3 class="s-ece993">📊 Mean Square Between (MS<sub>Between</sub>)</h3>
                <div class="s-cd64f9">
                    MS<sub>Between</sub> = SS<sub>Between</sub> / df<sub>Between</sub><br>
                    = ${ssBetween.toFixed(4)} / ${dfBetween}<br>
                    = <strong class="s-ece993">${msBetween.toFixed(6)}</strong>
                </div>
                <p class="s-b70585">This represents the AVERAGE variability BETWEEN groups (the "signal").</p>
            </div>
            
            <div class="s-faa287 gen-pad">
                <h3 class="s-ece993">📊 Mean Square Within (MS<sub>Within</sub>)</h3>
                <div class="s-cd64f9">
                    MS<sub>Within</sub> = SS<sub>Within</sub> / df<sub>Within</sub><br>
                    = ${ssWithin.toFixed(4)} / ${dfWithin}<br>
                    = <strong class="s-ece993">${msWithin.toFixed(6)}</strong>
                </div>
                <p class="s-b70585">This represents the AVERAGE variability WITHIN groups (the "noise").</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 5: CALCULATE F-STATISTIC -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 5: Calculate the F-Statistic</h2>
            
            <div class="s-faa287 gen-pad">
                <div class="s-22063d">
                    <strong>F = MS<sub>Between</sub> / MS<sub>Within</sub></strong>
                </div>
                <div class="s-25f06d">
                    F = ${msBetween.toFixed(6)} / ${msWithin.toFixed(6)}<br>
                    <div class="s-49454e">
                        F = ${fStatistic.toFixed(8)}
                    </div>
                </div>
                <p class="s-aa2769">
                    <strong>📌 Understanding the F-statistic:</strong><br>
                    • If F is close to 1 → Signal ≈ Noise → Groups have similar variances<br>
                    • If F is large (> 1) → Signal > Noise → Groups have different variances<br>
                    • We compare F to a critical value from the F-distribution
                </p>
            </div>
        </div>
        
        <!-- 📊 STEP 6: RESULTS TABLE -->
        <div class="s-699d6d">
            <h2 class="s-6d943d gen-pad">📊 Levene's Test Summary Table</h2>
            <table class="s-1b1faa gen-sized">
                <thead>
                    <tr class="s-a9ce51">
                        <th class="s-92407c">Source</th>
                        <th class="s-92407c">Sum of Squares (SS)</th>
                        <th class="s-92407c">df</th>
                        <th class="s-92407c">Mean Square (MS)</th>
                        <th class="s-92407c">F</th>
                        <th class="s-92407c">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Between Groups</td>
                        <td class="s-1a6540">${ssBetween.toFixed(4)}</td>
                        <td class="s-1a6540">${dfBetween}</td>
                        <td class="s-1a6540">${msBetween.toFixed(4)}</td>
                        <td class="s-349283" rowspan="2">${fStatistic.toFixed(4)}</td>
                        <td class="s-0bbdfe" rowspan="2">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Within Groups (Error)</td>
                        <td class="s-1a6540">${ssWithin.toFixed(4)}</td>
                        <td class="s-1a6540">${dfWithin}</td>
                        <td class="s-1a6540">${msWithin.toFixed(4)}</td>
                    </tr>
                    <tr class="s-a9ce51">
                        <td class="s-eddf4d">Total</td>
                        <td class="s-1a6540">${(ssBetween + ssWithin).toFixed(4)}</td>
                        <td class="s-1a6540">${totalN - 1}</td>
                        <td class="s-1a6540">—</td>
                        <td class="s-1a6540">—</td>
                        <td class="s-1a6540">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 DECISION SECTION -->
        <div class="s-e0012b gen-pad ${rejectH0 ? 'tp-bad-8' : 'tp-ok-8'}">
            <h2 class="s-ec2386">📌 Step 6: Statistical Decision</h2>
            
            <div class="s-358b7f gen-grid">
                <div class="s-30cdaa">
                    <strong>F-statistic:</strong> ${fStatistic.toFixed(6)}
                </div>
                <div class="s-30cdaa">
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}
                </div>
                <div class="s-30cdaa">
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
                <div class="s-30cdaa">
                    <strong>Comparison:</strong> ${fStatistic > criticalValue ? 'F > Critical Value' : 'F < Critical Value'}
                </div>
            </div>
            
            <div class="s-19d20b gen-pad">
                <h3>Decision Rule:</h3>
                <p>If p-value < α (${alpha}), we REJECT the null hypothesis.</p>
                <p>Here, p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <div class="s-b31270">
                    ${rejectH0 ? '❌ REJECT H₀' : '✅ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Conclusion:</h3>
                <p class="s-0ab03b">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group variances are NOT equal. ' +
                        'The homogeneity of variance assumption is VIOLATED. Consider using Welch\'s ANOVA or a non-parametric alternative (Kruskal-Wallis test).' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group variances differ. ' +
                        'The homogeneity of variance assumption is SATISFIED. You can proceed with standard ANOVA.'}
                </p>
            </div>
        </div>
        
        <!-- 💡 VISUAL INTERPRETATION -->
        <div class="s-9a73cc gen-pad">
            <h2 class="s-404196">💡 Visual Interpretation: What Does This Mean?</h2>
            
            <div class="s-321489 gen-flex">
                <div class="s-ce0746 gen-pad gen-sized">
                    <div class="s-505c22 gen-big">📊</div>
                    <h3>F-Statistic Scale</h3>
                    <div class="s-0f9f94"></div>
                    <div class="s-32ebb5 gen-flex">
                        <span>F ≈ 1</span>
                        <span>F > Critical</span>
                    </div>
                    <div class="s-5370f8 ${rejectH0 ? 'tp-text-bad' : 'tp-text-ok'}">
                        ${rejectH0 ? 'F = ' + fStatistic.toFixed(2) + ' → Large' : 'F = ' + fStatistic.toFixed(2) + ' → Small'}
                    </div>
                </div>
                
                <div class="s-d8eedf gen-pad">
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
    return steps;
}
