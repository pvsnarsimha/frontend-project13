// Worked-solution HTML for computeMANOVA (split out of manova.js): receives the values the calculation produced.
function stepsHtmlManova(scope) {
    const { B, T, W, alpha, betweenCalculations, criticalValue, data, dataRows, deviationRows, df1, df2, eigenvalues, fStatistic, grandMeanCalculations, group, groupMeanCalculations, groups, hotellingTrace, k, meansRows, n, p, pValue, pillaiTrace, q, raoT, rejectH0, roysRoot, totalMatrixCalculations, wilksLambda, withinDevRows, withinMatrixCalculations } = scope;
    let steps = `<div class="s-f3b550">
        <!-- HEADER SECTION -->
        <div class="s-93ccd1 gen-pad">
            <div class="s-1ecd2c gen-flex">
                <span class="s-4e312a gen-big">📈</span>
                <div>
                    <h1 class="s-b31279">Multivariate Analysis of Variance (MANOVA)</h1>
                    <p class="s-2796ed">A statistical test that compares group differences across MULTIPLE dependent variables simultaneously</p>
                </div>
            </div>
        </div>
        
        <!-- INTRODUCTION SECTION -->
        <div class="s-23f289 gen-pad">
            <h2 class="s-5a0af4">📖 What is MANOVA?</h2>
            
            <div class="s-b11199 gen-pad">
                <h3 class="s-404196">🎯 Definition</h3>
                <p class="s-810796">MANOVA is an extension of ANOVA that allows you to test whether there are significant differences between groups on <strong>TWO OR MORE dependent variables simultaneously</strong>.</p>
            </div>
            
            <div class="s-b8221f gen-grid">
                <div class="s-c25532 gen-pad">
                    <h3 class="s-201633">✅ When to Use MANOVA?</h3>
                    <ul class="s-17e8e5">
                        <li>You have <strong>2+ dependent variables</strong> that are correlated</li>
                        <li>You want to <strong>control Type I error</strong> (running multiple ANOVAs increases error rate)</li>
                        <li>You want to detect <strong>patterns across multiple outcomes</strong></li>
                        <li>Your dependent variables measure <strong>different aspects</strong> of a construct</li>
                    </ul>
                </div>
                <div class="s-c25532 gen-pad">
                    <h3 class="s-bc1973">❌ When NOT to Use MANOVA?</h3>
                    <ul class="s-17e8e5">
                        <li>Dependent variables are <strong>not correlated</strong></li>
                        <li>You have <strong>only one dependent variable</strong> (use ANOVA instead)</li>
                        <li>Your sample size is <strong>too small</strong></li>
                        <li>Assumptions are <strong>severely violated</strong></li>
                    </ul>
                </div>
            </div>
            
            <div class="s-36f49e gen-pad">
                <h3 class="s-90d08d">💡 Real-World Example</h3>
                <p class="s-20ac96">A researcher wants to compare three teaching methods (Group A, B, C) on TWO outcomes: <strong>exam score AND student satisfaction</strong>. Instead of running two separate ANOVAs (which increases error rate), they use MANOVA to test both outcomes together.</p>
            </div>
        </div>
        
        <!-- HYPOTHESIS SECTION -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-5a0af4">📊 Hypotheses in MANOVA</h2>
            
            <div class="s-ebc8c2 gen-grid">
                <div class="s-a9d0a1 gen-pad">
                    <h3 class="s-689fb3">Null Hypothesis (H₀)</h3>
                    <div class="s-49b8e0">
                        μ₁ = μ₂ = μ₃ = ... = μ<sub>k</sub>
                    </div>
                    <p class="s-bf36e2">The mean vectors of all groups are equal.<br>No difference exists between groups.</p>
                </div>
                <div class="s-a9d0a1 gen-pad">
                    <h3 class="s-e03571">Alternative Hypothesis (H₁)</h3>
                    <div class="s-49b8e0">
                        At least one μ<sub>i</sub> ≠ μ<sub>j</sub>
                    </div>
                    <p class="s-bf36e2">At least one group's mean vector is different from others.<br>There is a significant difference between groups.</p>
                </div>
            </div>
        </div>
        
        <!-- INPUT DATA SECTION -->
        <div class="s-6b30cb gen-pad">
            <h2 class="s-5a0af4">📋 Step 1: Input Data</h2>
            <div class="s-74082b">
                <table class="s-d8b02c gen-sized">
                    <thead><tr class="s-0fb8dc">
                        <th class="s-92407c">#</th>
                        <th class="s-92407c">Group</th>
                        ${Array(p).fill().map((_, j) => `<th class="s-92407c">Y<sub>${j+1}</sub></th>`).join('')}
                    </tr></thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
            <div class="s-ffb54b">
                <strong>📌 Data Summary:</strong> ${n} total observations, ${k} groups, ${p} dependent variables
            </div>
        </div>
        
        <!-- STEP 2: GRAND MEANS -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-5a0af4">🔢 Step 2: Calculate Grand Means (Ȳ)</h2>
            
            <div class="s-c25532 gen-pad">
                <div class="s-09ec68">
                    <strong>📐 Formula:</strong> Grand Mean = (Sum of all values) / (Total number of observations)
                </div>
                ${grandMeanCalculations.map(calc => `<div class="s-dc57cd">${calc}</div>`).join('')}
                <div class="s-901a87">
                    💡 <strong>Interpretation:</strong> Grand means represent the overall average of each dependent variable across ALL groups.
                </div>
            </div>
        </div>
        
        <!-- STEP 3: GROUP MEANS -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-5a0af4">🔢 Step 3: Calculate Group Means (Ȳⱼ)</h2>
            
            <div class="s-c25532 gen-pad">
                <div class="s-09ec68">
                    <strong>📐 Formula:</strong> Group Mean = (Sum of values in group) / (Number in group)
                </div>
                ${groupMeanCalculations.map(calc => `<div class="s-6a2b17">${calc}</div>`).join('')}
                <div class="s-5f7a44">
                    <table class="s-1b1faa gen-sized">
                        <thead><tr class="s-0fb8dc">
                            <th class="s-92407c">Group</th>
                            <th class="s-92407c">n</th>
                            ${Array(p).fill().map((_, j) => `<th class="s-92407c">Mean Y<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${meansRows}</tbody>
                    </table>
                </div>
                <div class="s-b350b0">
                    💡 <strong>Interpretation:</strong> Group means show how each group performs on each dependent variable. Large differences suggest possible group effects.
                </div>
            </div>
        </div>
        
        <!-- WHAT ARE SSCP MATRICES? -->
        <div class="s-8397c1 gen-pad">
            <h2 class="s-5a0af4">📐 Understanding SSCP Matrices</h2>
            
            <div class="s-c25532 gen-pad">
                <h3 class="s-ece993">What is SSCP?</h3>
                <p><strong>SSCP = Sum of Squares and Cross Products</strong></p>
                <p>It's like variance-covariance, but for multivariate data:</p>
                <ul>
                    <li><strong>Diagonal elements</strong> = Sum of Squares (variance of one variable)</li>
                    <li><strong>Off-diagonal elements</strong> = Cross Products (covariance between variables)</li>
                </ul>
                <div class="s-d38fa2">
                    <strong>Example for 2 variables (Y₁, Y₂):</strong><br>
                    T = [ Σ(Y₁-Ȳ₁)² , Σ(Y₁-Ȳ₁)(Y₂-Ȳ₂) ]<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;[ Σ(Y₂-Ȳ₂)(Y₁-Ȳ₁) , Σ(Y₂-Ȳ₂)² ]
                </div>
            </div>
            
            <div class="s-c7e6a1 gen-grid gen-grid-many">
                <div class="s-a9d0a1 gen-pad">
                    <div class="s-e577bc gen-big">📊</div>
                    <h3>T (Total)</h3>
                    <p>Total variability in all DVs</p>
                    <p class="s-76da17">Measures overall spread</p>
                </div>
                <div class="s-a9d0a1 gen-pad">
                    <div class="s-e577bc gen-big">📈</div>
                    <h3>W (Within)</h3>
                    <p>Error/Residual variability</p>
                    <p class="s-76da17">Unexplained variation</p>
                </div>
                <div class="s-a9d0a1 gen-pad">
                    <div class="s-e577bc gen-big">🎯</div>
                    <h3>B (Between)</h3>
                    <p>Variability explained by groups</p>
                    <p class="s-76da17">Treatment effect</p>
                </div>
            </div>
            
            <div class="s-c5bb82">
                <strong>Relationship:</strong> <span class="s-df7286">T = B + W</span>
            </div>
        </div>
        
        <!-- STEP 4: TOTAL SSCP MATRIX (T) - DETAILED -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-5a0af4">🔢 Step 4: Calculate Total SSCP Matrix (T)</h2>
            
            <div class="s-c25532 gen-pad">
                <div class="s-09ec68">
                    <strong>📐 Formula:</strong> T = Σ(Yᵢ - Ȳ)(Yᵢ - Ȳ)<sup>T</sup>
                </div>
                
                <div class="s-a2c7ca">
                    <strong>🔍 What does this formula mean?</strong><br>
                    For each observation, we calculate how far it deviates from the grand mean (Yᵢ - Ȳ).<br>
                    Then we multiply this deviation vector by itself (outer product) and sum across all observations.
                </div>
                
                <h3 class="s-ece993">Step 4a: Calculate Deviation Scores (Yᵢ - Ȳ)</h3>
                <div class="s-031466">
                    <table class="s-1b1faa gen-sized">
                        <thead><tr class="s-0fb8dc">
                            <th class="s-8cbbf2">#</th>
                            <th class="s-8cbbf2">Group</th>
                            ${Array(p).fill().map((_, j) => `<th class="s-8cbbf2">Y<sub>${j+1}</sub> - Ȳ<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${deviationRows}</tbody>
                    </table>
                </div>
                
                <h3 class="s-ece993">Step 4b: Calculate Cross Products and Sum</h3>
                <div class="s-dc1bce">
                    ${totalMatrixCalculations.join('<br>')}
                </div>
                
                <h3 class="s-ece993">Step 4c: Final T Matrix</h3>
                <div class="s-f6e3be">
                    <strong>T Matrix (${p}×${p}):</strong><br>
                    ${T.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div class="s-901a87">
                    💡 <strong>What does T represent?</strong> T measures the TOTAL variation in all dependent variables. 
                    The diagonal elements are Sum of Squares (variance within each DV), and off-diagonals are Cross Products (covariance between DVs).
                </div>
            </div>
        </div>
        
        <!-- STEP 5: WITHIN-GROUP SSCP MATRIX (W) - DETAILED -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-5a0af4">🔢 Step 5: Calculate Within-Group SSCP Matrix (W)</h2>
            
            <div class="s-c25532 gen-pad">
                <div class="s-09ec68">
                    <strong>📐 Formula:</strong> W = Σⱼ Σ(Yᵢⱼ - Ȳⱼ)(Yᵢⱼ - Ȳⱼ)<sup>T</sup>
                </div>
                
                <div class="s-a2c7ca">
                    <strong>🔍 What does this formula mean?</strong><br>
                    For each observation, we calculate how far it deviates from its OWN GROUP MEAN (Yᵢⱼ - Ȳⱼ).<br>
                    This measures variation WITHIN groups - the "error" or "unexplained" variation.
                </div>
                
                <h3 class="s-ece993">Step 5a: Calculate Deviation Scores (Yᵢⱼ - Ȳⱼ)</h3>
                <div class="s-031466">
                    <table class="s-1b1faa gen-sized">
                        <thead><tr class="s-0fb8dc">
                            <th class="s-8cbbf2">#</th>
                            <th class="s-8cbbf2">Group</th>
                            <th class="s-8cbbf2">Group Means</th>
                            ${Array(p).fill().map((_, j) => `<th class="s-8cbbf2">Y<sub>${j+1}</sub> - Ȳⱼ<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${withinDevRows}</tbody>
                    </table>
                </div>
                
                <h3 class="s-ece993">Step 5b: Calculate Cross Products and Sum Within Each Group</h3>
                ${withinMatrixCalculations.map(g => `
                    <div class="s-6a2b17">
                        <strong>Group ${g.group}:</strong>
                        <div class="s-c01a65">
                            ${g.calculations.join('<br>')}
                        </div>
                    </div>
                `).join('')}
                
                <h3 class="s-ece993">Step 5c: Final W Matrix</h3>
                <div class="s-f6e3be">
                    <strong>W Matrix (${p}×${p}):</strong><br>
                    ${W.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div class="s-901a87">
                    💡 <strong>What does W represent?</strong> W measures the VARIATION WITHIN each group. 
                    If W is small, it means observations within groups are very similar (low error variance).<br>
                    <strong>Key insight:</strong> W represents the "noise" or "unexplained" variation that cannot be attributed to group differences.
                </div>
            </div>
        </div>
        
        <!-- STEP 6: BETWEEN-GROUP SSCP MATRIX (B) -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-5a0af4">🔢 Step 6: Calculate Between-Group SSCP Matrix (B)</h2>
            
            <div class="s-c25532 gen-pad">
                <div class="s-09ec68">
                    <strong>📐 Formula:</strong> B = Σ nⱼ(Ȳⱼ - Ȳ)(Ȳⱼ - Ȳ)<sup>T</sup>
                </div>
                
                <div class="s-a2c7ca">
                    <strong>🔍 What does this formula mean?</strong><br>
                    This measures how far each GROUP MEAN deviates from the GRAND MEAN, weighted by group size.<br>
                    This represents the "signal" or "explained" variation - the part attributed to group differences.
                </div>
                
                <h3 class="s-ece993">Step 6a: Calculate Group Mean Deviations and Contributions</h3>
                ${betweenCalculations.map(calc => `<div class="s-6a2b17">${calc}</div>`).join('')}
                
                <h3 class="s-ece993">Step 6b: Final B Matrix</h3>
                <div class="s-f6e3be">
                    <strong>B Matrix (${p}×${p}):</strong><br>
                    ${B.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div class="s-901a87">
                    💡 <strong>Check the relationship:</strong> T = B + W?<br>
                    T[0,0] = ${T[0][0].toFixed(2)} = B[0,0] (${B[0][0].toFixed(2)}) + W[0,0] (${W[0][0].toFixed(2)}) = ${(B[0][0] + W[0][0]).toFixed(2)} ✅
                </div>
                
                <div class="s-b350b0">
                    💡 <strong>Interpretation:</strong> B represents the VARIATION BETWEEN groups. 
                    Larger B relative to W means groups are more different (stronger treatment effect).
                </div>
            </div>
        </div>
        
        <!-- EIGENVALUES EXPLANATION -->
        <div class="s-8397c1 gen-pad">
            <h2 class="s-5a0af4">📊 Step 7: Understanding Eigenvalues in MANOVA</h2>
            
            <div class="s-c25532 gen-pad">
                <p><strong>What are Eigenvalues?</strong> In MANOVA, eigenvalues (λ) represent how well the dependent variables separate the groups. We solve |B - λW| = 0 to find λ.</p>
                <ul>
                    <li><strong>Large λ</strong> → Strong group separation on that dimension</li>
                    <li><strong>Small λ</strong> → Weak group separation</li>
                    <li><strong>λ = 0</strong> → No group separation</li>
                </ul>
                <div class="s-1423b4">
                    <strong>Eigenvalues (λ):</strong> ${eigenvalues.map(l => l.toFixed(4)).join(', ')}
                </div>
                <div class="s-b350b0">
                    💡 <strong>Interpretation:</strong> ${eigenvalues[0] > 1 ? 'The first eigenvalue > 1 suggests strong group separation.' : 'The eigenvalues suggest moderate group separation.'}
                </div>
            </div>
        </div>
        
        <!-- MANOVA TEST STATISTICS -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-5a0af4">🔢 Step 8: Calculate MANOVA Test Statistics</h2>
            
            <div class="s-c25532 gen-pad">
                <h3 class="s-ece993">Four Common MANOVA Test Statistics</h3>
                
                <div class="s-bd82df">
                    <strong>1. Wilks' Lambda (Λ)</strong><br>
                    Formula: Λ = ∏(1/(1+λᵢ)) = ${wilksLambda.toFixed(6)}<br>
                    <span class="s-79fac4">📌 Range: 0 to 1 | Smaller values = stronger group differences | Most commonly reported</span>
                </div>
                
                <div class="s-bd82df">
                    <strong>2. Pillai's Trace (V)</strong><br>
                    Formula: V = Σ(λᵢ/(1+λᵢ)) = ${pillaiTrace.toFixed(6)}<br>
                    <span class="s-79fac4">📌 Range: 0 to 1 | More robust to violations | Recommended for unequal sample sizes</span>
                </div>
                
                <div class="s-bd82df">
                    <strong>3. Hotelling's Trace (T²)</strong><br>
                    Formula: T² = Σ λᵢ = ${hotellingTrace.toFixed(6)}<br>
                    <span class="s-79fac4">📌 Range: 0 to ∞ | Most powerful when assumptions are met</span>
                </div>
                
                <div class="s-bd82df">
                    <strong>4. Roy's Largest Root (θ)</strong><br>
                    Formula: θ = max(λᵢ) = ${roysRoot.toFixed(6)}<br>
                    <span class="s-79fac4">📌 Range: 0 to ∞ | Most powerful when one eigenvalue dominates</span>
                </div>
            </div>
        </div>
        
        <!-- F-STATISTIC CALCULATION -->
        <div class="s-e28085 gen-pad">
            <h2 class="s-5a0af4">🔢 Step 9: Calculate F-statistic (from Wilks' Lambda)</h2>
            
            <div class="s-c25532 gen-pad">
                <div class="s-09ec68">
                    <strong>📐 Formula (Rao's approximation):</strong> F = (1 - Λ^{1/t}) / Λ^{1/t} × df₂ / df₁
                </div>
                
                <div class="s-358b7f gen-grid">
                    <div class="s-dcae05">
                        <strong>t = √((p²q² - 4)/(p² + q² - 5))</strong> (q = k-1) = ${raoT.toFixed(6)}
                    </div>
                    <div class="s-dcae05">
                        <strong>df₁ = p × q</strong> = ${p} × ${q} = ${df1}
                    </div>
                    <div class="s-dcae05">
                        <strong>df₂ = t × (n - k - (p - q + 1)/2) - (pq - 2)/2</strong> = ${df2.toFixed(4)}
                    </div>
                    <div class="s-dcae05">
                        <strong>Λ^{1/t}</strong> = ${Math.pow(wilksLambda, 1/raoT).toFixed(6)}
                    </div>
                </div>
                
                <div class="s-663986 gen-pad">
                    F = ${fStatistic.toFixed(6)}
                </div>
                
                <div class="s-b350b0">
                    💡 <strong>Interpretation of F:</strong> The F-statistic compares the between-group variance to the within-group variance. Larger F = stronger evidence of group differences.
                </div>
            </div>
        </div>
        
        <!-- MANOVA SUMMARY TABLE -->
        <div class="s-699d6d">
            <h2 class="s-6d943d gen-pad">📊 MANOVA Summary Table</h2>
            <table class="s-1b1faa gen-sized">
                <thead>
                    <tr class="s-a9ce51">
                        <th class="s-ceaf3b">Test Statistic</th>
                        <th class="s-ceaf3b">Value</th>
                        <th class="s-ceaf3b">F-value</th>
                        <th class="s-ceaf3b">df₁</th>
                        <th class="s-ceaf3b">df₂</th>
                        <th class="s-ceaf3b">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Wilks' Lambda (Λ)</td>
                        <td class="s-1a6540">${wilksLambda.toFixed(6)}</td>
                        <td class="s-1a6540">${fStatistic.toFixed(4)}</td>
                        <td class="s-1a6540">${df1}</td>
                        <td class="s-1a6540">${df2}</td>
                        <td class="s-1a6540">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Pillai's Trace (V)</td>
                        <td class="s-1a6540" colspan="5">${pillaiTrace.toFixed(6)}</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Hotelling's Trace (T²)</td>
                        <td class="s-1a6540" colspan="5">${hotellingTrace.toFixed(6)}</td>
                    </tr>
                    <tr>
                        <td class="s-eddf4d">Roy's Largest Root (θ)</td>
                        <td class="s-1a6540" colspan="5">${roysRoot.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- CONCLUSION SECTION -->
        <div class="s-e0012b gen-pad ${rejectH0 ? 'tp-ok-8' : 'tp-bad-8'}">
            <h2 class="s-405429">📌 Step 10: Statistical Decision</h2>
            
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
                <h3 class="s-ec2386">Decision Rule:</h3>
                <p>If p-value < α (${alpha}), we REJECT the null hypothesis.</p>
                <p>Here, p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <h3>Final Decision:</h3>
                <div class="s-b37e47">
                    ${rejectH0 ? '✅ REJECT H₀' : '❌ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Interpretation:</h3>
                <p class="s-47ec88">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group mean vectors differ across the dependent variables. ' +
                        'This means that the groups are significantly different when considering all dependent variables together.' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group mean vectors differ across the dependent variables. ' +
                        'This means that the groups are not significantly different when considering all dependent variables together.'}
                </p>
            </div>
        </div>
        
        <!-- FOLLOW-UP SECTION -->
        <div class="s-5bd095 gen-pad">
            <h2 class="s-8cbaeb">📌 What to Do After a Significant MANOVA?</h2>
            
            <div class="s-c25532 gen-pad">
                <p>If MANOVA is significant, follow up with:</p>
                <ol class="s-17e8e5">
                    <li><strong>Separate ANOVAs</strong> for each dependent variable (with Bonferroni correction)</li>
                    <li><strong>Discriminant Analysis</strong> to identify which variables contribute most to group separation</li>
                    <li><strong>Post-hoc tests</strong> to determine which specific groups differ</li>
                </ol>
                <div class="s-742df5">
                    💡 <strong>Bonferroni Correction:</strong> α<sub>adjusted</sub> = α / p = ${alpha} / ${p} = ${(alpha/p).toFixed(4)}
                </div>
            </div>
        </div>
        
        <!-- ASSUMPTIONS SECTION -->
        <div class="s-e39411 gen-pad">
            <h2 class="s-8cbaeb">⚠️ Important MANOVA Assumptions</h2>
            
            <div class="s-30e721 gen-grid">
                <div class="s-80e95a">
                    <strong>1. Multivariate Normality</strong>
                    <p class="s-27faee">The dependent variables should be multivariate normally distributed within groups.</p>
                </div>
                <div class="s-80e95a">
                    <strong>2. Homogeneity of Covariance Matrices</strong>
                    <p class="s-27faee">Variance-covariance matrices should be equal across groups (Box's M test).</p>
                </div>
                <div class="s-80e95a">
                    <strong>3. Independence of Observations</strong>
                    <p class="s-27faee">Observations should be independent of each other.</p>
                </div>
                <div class="s-80e95a">
                    <strong>4. No Multicollinearity</strong>
                    <p class="s-27faee">Dependent variables should be moderately correlated (not perfectly correlated).</p>
                </div>
            </div>
        </div>
    </div>`;
    return steps;
}
