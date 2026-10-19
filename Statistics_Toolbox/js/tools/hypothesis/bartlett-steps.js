// Worked-solution HTML for computeBartlettTest (split out of bartlett.js): receives the values the calculation produced.
function stepsHtmlBartlett(scope) {
    const { C, alpha, chiSquare, chiSquareAdj, criticalValue, denominator, df, groupMeans, groupSizes, groups, k, numerator, pValue, pooledDetails, pooledVar, rejectH0, sumInv, term1, term2, term2Details, totalN, varianceDetails } = scope;
    let steps = `<div class="s-8f7049">
        
        <!-- HEADER -->
        <div class="s-93ccd1 gen-pad">
            <h1 class="s-6b0f3f">📐 Bartlett's Test for Homogeneity of Variance</h1>
            <p class="s-6b9200">A parametric test to check if multiple groups have EQUAL variances</p>
            <div class="s-7b320b">
                <strong>📐 Formula:</strong> χ² = (N - k) ln(s²) - Σ(nⱼ - 1) ln(sⱼ²)
            </div>
            <p class="s-d0a272">
                <strong>H₀ (Null Hypothesis):</strong> σ₁² = σ₂² = ... = σ<sub>k</sub>² (All group variances are equal)<br>
                <strong>H₁ (Alternative):</strong> At least one group variance is different
            </p>
            <div class="s-b56f90">
                ⚠️ <strong>Important Assumption:</strong> Bartlett's test assumes the data is NORMALLY distributed. If normality is violated, use Levene's test instead.
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div class="s-23f289 gen-pad">
            <h2 class="s-404196">📚 Understanding Bartlett's Test</h2>
            
            <div class="s-b11199 gen-pad">
                <h3 class="s-ece993">🎯 What Problem Does It Solve?</h3>
                <p>Before comparing group means (using ANOVA), we must check if the variances are equal. Unequal variances can lead to:</p>
                <ul>
                    <li>Increased Type I error (false positives)</li>
                    <li>Reduced statistical power</li>
                    <li>Invalid confidence intervals</li>
                </ul>
                <div class="s-a6a712">
                    💡 <strong>Think of it like this:</strong> Imagine comparing three basketball players' scoring averages. If one player scores consistently (low variance) while another is inconsistent (high variance), their averages might not be comparable!
                </div>
            </div>
            
            <div class="s-c25532 gen-pad">
                <h3 class="s-ece993">🔬 How Bartlett's Test Works</h3>
                <p>Bartlett's test uses the ratio of the <strong>pooled variance</strong> to the individual group variances:</p>
                <div class="s-d68a27">
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
        <div class="s-6b30cb gen-pad">
            <h2 class="s-404196">📋 Step 1: Input Data Summary</h2>
            <div class="s-74082b">
                <table class="s-2b65ac gen-sized">
                    <thead><tr class="s-0fb8dc">
                        <th class="s-92407c">Group</th>
                        <th class="s-92407c">n</th>
                        <th class="s-92407c">Values</th>
                        <th class="s-92407c">Mean</th>
                    </tr></thead>
                    <tbody>
                        ${Array.from(groups.entries()).map(([group, values]) => `
                        <tr class="s-0d2692">
                            <td class="s-4370aa">${group}</td>
                            <td class="s-9da549">${values.length}</td>
                            <td class="s-828f53">${values.join(', ')}</td>
                            <td class="s-374df0">${groupMeans.get(group).toFixed(4)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="s-ffb54b">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Degrees of freedom (df) = ${df}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE GROUP VARIANCES -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 2: Calculate Each Group's Variance (sⱼ²)</h2>
            <div class="s-56af1d">
                <strong>💡 What is Variance?</strong> Variance measures how spread out the data is. A small variance means values are close to the mean; a large variance means they're widely scattered.
            </div>
            <div class="s-faa287 gen-pad">
                <strong>Formula:</strong> s² = Σ(x - x̄)² / (n - 1)
                ${varianceDetails.join('')}
            </div>
        </div>
        
        <!-- 🔢 STEP 3: CALCULATE POOLED VARIANCE -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 3: Calculate Pooled Variance (s²)</h2>
            <div class="s-56af1d">
                <strong>💡 What is Pooled Variance?</strong> It's a weighted average of all group variances. Think of it as the "overall" variance assuming all groups have the same underlying variance.
            </div>
            <div class="s-faa287 gen-pad">
                <strong>Formula:</strong> s² = Σ(nⱼ - 1) × sⱼ² / Σ(nⱼ - 1)<br><br>
                Numerator: ${pooledDetails.join(' + ')} = ${numerator.toFixed(4)}<br>
                Denominator: ${denominator}<br>
                <div class="s-c51e38">
                    <strong>Pooled Variance (s²) = ${pooledVar.toFixed(6)}</strong>
                </div>
                <p class="s-51eb7f">📌 This is our estimate of the common variance if H₀ (equal variances) were true.</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE BARTLETT'S STATISTIC -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 4: Calculate Bartlett's χ² Statistic</h2>
            
            <div class="s-e97429 gen-pad">
                <h3 class="s-ece993">Part A: Calculate (N - k) × ln(s²)</h3>
                <div class="s-4f4867">
                    N - k = ${totalN} - ${k} = ${totalN - k}<br>
                    ln(s²) = ln(${pooledVar.toFixed(6)}) = ${Math.log(pooledVar).toFixed(6)}<br>
                    <strong>Term A = ${totalN - k} × ${Math.log(pooledVar).toFixed(6)} = ${term1.toFixed(6)}</strong>
                </div>
            </div>
            
            <div class="s-e97429 gen-pad">
                <h3 class="s-ece993">Part B: Calculate Σ(nⱼ - 1) × ln(sⱼ²)</h3>
                ${term2Details.map(d => `<div class="s-914a81">• ${d}</div>`).join('')}
                <div class="s-bf36e2"><strong>Term B = ${term2.toFixed(6)}</strong></div>
            </div>
            
            <div class="s-faa287 gen-pad">
                <h3 class="s-ece993">Part C: Calculate χ² = Term A - Term B</h3>
                <div class="s-25f06d">
                    χ² = ${term1.toFixed(6)} - ${term2.toFixed(6)} = <strong class="s-ece993">${chiSquare.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 5: APPLY CORRECTION FACTOR -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-404196">🔢 Step 5: Apply Correction Factor for Small Samples</h2>
            <div class="s-56af1d">
                <strong>💡 Why a correction?</strong> Bartlett's test is biased for small samples. The correction factor adjusts the statistic to be more accurate.
            </div>
            <div class="s-faa287 gen-pad">
                <strong>Formula:</strong> C = 1 + [1/(3(k-1))] × [Σ 1/(nⱼ-1) - 1/(N-k)]<br><br>
                Σ 1/(nⱼ-1) = ${Array.from(groupSizes.values()).map(n => `1/(${n}-1) = ${(1/(n-1)).toFixed(4)}`).join(' + ')} = ${sumInv.toFixed(6)}<br>
                1/(N-k) = 1/(${totalN}-${k}) = ${(1/(totalN - k)).toFixed(6)}<br>
                Σ 1/(nⱼ-1) - 1/(N-k) = ${sumInv.toFixed(6)} - ${(1/(totalN - k)).toFixed(6)} = ${(sumInv - 1/(totalN - k)).toFixed(6)}<br>
                1/(3(k-1)) = 1/(3×${k-1}) = ${(1/(3*(k-1))).toFixed(6)}<br>
                <div class="s-bf36e2">
                    <strong>C = 1 + ${(1/(3*(k-1))).toFixed(6)} × ${(sumInv - 1/(totalN - k)).toFixed(6)} = ${C.toFixed(6)}</strong>
                </div>
                <div class="s-bf36e2">
                    <strong>Corrected χ² = χ² / C = ${chiSquare.toFixed(6)} / ${C.toFixed(6)} = <span class="s-c86f47">${chiSquareAdj.toFixed(6)}</span></strong>
                </div>
            </div>
        </div>
        
        <!-- 📊 STEP 6: RESULTS TABLE -->
        <div class="s-699d6d">
            <h2 class="s-6d943d gen-pad">📊 Bartlett's Test Summary</h2>
            <table class="s-1b1faa gen-sized">
                <thead>
                    <tr class="s-a9ce51">
                        <th class="s-92407c">Statistic</th>
                        <th class="s-92407c">Value</th>
                        <th class="s-92407c">Interpretation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td class="s-92407c">χ² (uncorrected)</td><td class="s-1a6540">${chiSquare.toFixed(6)}</td><td>Raw test statistic</td></tr>
                    <tr class="s-e17e49"><td class="s-92407c">Correction Factor (C)</td><td class="s-1a6540">${C.toFixed(6)}</td><td>Small sample adjustment</td></tr>
                    <tr><td class="s-92407c"><strong>χ² (corrected)</strong></td><td class="s-1a6540"><strong>${chiSquareAdj.toFixed(6)}</strong></td><td>Final test statistic</td></tr>
                    <tr class="s-e17e49"><td class="s-92407c">Degrees of Freedom (df)</td><td class="s-1a6540">${df}</td><td>df = k - 1 = ${k} - 1</td></tr>
                    <tr><td class="s-92407c">Critical Value (α = ${alpha})</td><td class="s-1a6540">${criticalValue.toFixed(6)}</td><td>From χ² distribution table</td></tr>
                    <tr class="s-e17e49"><td class="s-92407c">p-value</td><td class="s-1a6540">${pValue.toFixed(8)}</td><td>Probability of observing this result if H₀ is true</td></tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 DECISION SECTION -->
        <div class="s-e0012b gen-pad ${rejectH0 ? 'tp-bad-8' : 'tp-ok-8'}">
            <h2 class="s-ec2386">📌 Step 6: Statistical Decision</h2>
            
            <div class="s-19d20b gen-pad">
                <h3>Decision Rule:</h3>
                <p>If χ² > Critical Value OR p-value < α, we REJECT the null hypothesis.</p>
                <p>Here, χ² = ${chiSquareAdj.toFixed(6)} ${chiSquareAdj > criticalValue ? '>' : '<'} ${criticalValue.toFixed(6)}</p>
                <p>p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <div class="s-b31270">
                    ${rejectH0 ? '❌ REJECT H₀' : '✅ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Conclusion:</h3>
                <p class="s-0ab03b">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group variances are NOT equal. ' +
                        'The homogeneity of variance assumption is VIOLATED. Consider using Welch\'s ANOVA or transforming your data.' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group variances differ. ' +
                        'The homogeneity of variance assumption is SATISFIED. You can proceed with standard ANOVA.'}
                </p>
            </div>
        </div>
        
        <!-- 📊 VISUAL COMPARISON: BARTLETT'S VS LEVENE'S -->
        <div class="s-9a73cc gen-pad">
            <h2 class="s-404196">📊 Which Test Should You Use?</h2>
            
            <div class="s-ebc8c2 gen-grid">
                <div class="s-c25532 gen-pad">
                    <h3 class="s-689fb3">✅ Use Bartlett's Test When:</h3>
                    <ul class="s-48531a">
                        <li>Data is <strong>normally distributed</strong></li>
                        <li>Sample sizes are <strong>equal or large</strong></li>
                        <li>You want the <strong>most powerful test</strong> (when assumptions are met)</li>
                    </ul>
                </div>
                
                <div class="s-c25532 gen-pad">
                    <h3 class="s-54f524">⚠️ Use Levene's Test When:</h3>
                    <ul class="s-48531a">
                        <li>Data is <strong>not normally distributed</strong></li>
                        <li>You have <strong>small sample sizes</strong></li>
                        <li>You want a <strong>robust test</strong> that's less sensitive to outliers</li>
                    </ul>
                </div>
            </div>
            
            <div class="s-b07909">
                <strong>💡 Pro Tip:</strong> If you're unsure about normality, run BOTH tests. If they agree, you can be confident in your conclusion. If they disagree, examine your data for outliers or non-normality.
            </div>
        </div>
    </div>`;
    return steps;
}
