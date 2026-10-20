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
    const parsed = parseValueGroupInput(inputText);
    const groups = parsed.groups;
    if (parsed.skipped.length) {
        return { error: true, message: `Could not read: ${parsed.skipped.slice(0, 5).map(x => escapeHtml(x)).join(', ')}${parsed.skipped.length > 5 ? ', …' : ''}. Each entry must look like value:group (for example 12.5:Control).` };
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
            deviationDetails += `<tr><td class="s-a7d6d8">${val}</td><td class="s-a7d6d8">${val} - ${mean.toFixed(4)} = ${dev.toFixed(4)}</td><td class="s-a7d6d8">${sqDev.toFixed(4)}</td></tr>`;
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
            <div class="s-1882ad">
                <h4 class="s-bb6f08">Group "${group}"</h4>
                <div class="s-419e95 gen-grid gen-grid-many">
                    <div><strong>n = ${n}</strong></div>
                    <div><strong>Σx = ${sum}</strong></div>
                    <div><strong>Mean (x̄) = ${mean.toFixed(6)}</strong></div>
                </div>
                <div class="s-9d5978">
                    <strong>Calculating Sum of Squares within group (SS_within):</strong>
                    <table class="s-f4f776 gen-sized">
                        <thead><tr class="s-bfd0ae"><th>Value (x)</th><th>Deviation (x - x̄)</th><th>Squared Deviation (x - x̄)²</th></tr></thead>
                        <tbody>${deviationDetails}</tbody>
                        <tfoot><tr class="s-2411fb"><td colspan="2"><strong>Sum (SS) =</strong></td><td><strong>${ssGroup.toFixed(6)}</strong></td></tr></tfoot>
                    </table>
                </div>
                <div class="s-e414b5">
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
            <tr class="s-00049c">
                <td class="s-641001">${group}</td>
                <td class="s-a7c3f4">${n}</td>
                <td class="s-a7c3f4">${mean.toFixed(6)}</td>
                <td class="s-a7c3f4">${mean.toFixed(6)} - ${grandMean.toFixed(6)} = ${deviation.toFixed(6)}</td>
                <td class="s-a7c3f4">${n} × (${deviation.toFixed(6)})² = ${contribution.toFixed(6)}</td>
            </tr>
        `;
    }
    
    // Calculate SS Within (Within Groups) - sum of all group SS
    let ssWithin = 0;
    let ssWithinDetails = '';
    for (let [group, ss] of groupSS) {
        ssWithin += ss;
        ssWithinDetails += `<tr><td class="s-641001">${group}</td><td class="s-02528c">${ss.toFixed(6)}</td></tr>`;
    }
    
    let ssTotal = ssBetween + ssWithin;
    let dfBetween = k - 1;
    let dfWithin = totalN - k;
    let dfTotal = totalN - 1;
    
    {
        const guard = withinGroupError(dfWithin, ssWithin, 'ANOVA', 'values');
        if (guard) return guard;
    }
    
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
    
    let steps = `<div class="s-9217e5">
        <!-- Header -->
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">F</span>
                <h2 class="s-f8a94d">Analysis of Variance (ANOVA)</h2>
            </div>
            <div class="s-55b017">
                <div><strong>F = MS<sub>between</sub> / MS<sub>within</sub></strong></div>
                <div class="s-af5894">Where:</div>
                <div>• MS<sub>between</sub> = Mean Square Between Groups = SS<sub>between</sub> / df<sub>between</sub></div>
                <div>• MS<sub>within</sub> = Mean Square Within Groups = SS<sub>within</sub> / df<sub>within</sub></div>
            </div>
            <p class="s-98fe52">H₀: μ₁ = μ₂ = ... = μ<sub>k</sub> (All group means are equal)</p>
            <p class="s-20a400">H₁: At least one group mean is different</p>
        </div>
        
        <!-- Section 1: Grand Mean -->
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">Step 1: Calculate the Grand Mean (Overall Mean)</h3>
            <div class="s-6025fc">
                <div class="s-4b0e48">
                    <strong>Formula: x̄<sub>grand</sub> = (Σ all values) / N</strong><br><br>
                    Σ all values = ${totalSum.toFixed(6)}<br>
                    Total observations (N) = ${totalN}<br>
                    x̄<sub>grand</sub> = ${totalSum.toFixed(6)} / ${totalN} = <strong class="s-f342b5">${grandMean.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- Section 2: Individual Group Statistics -->
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">Step 2: Calculate Statistics for Each Group</h3>
            ${groupDetailsHtml}
        </div>
        
        <!-- Section 3: Sum of Squares Between Groups (SS_between) -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">Step 3: Calculate SS<sub>between</sub> (Between-Groups Sum of Squares)</h3>
            <div class="s-ca9e5c">
                <div class="s-fa2325">
                    <strong>Formula: SS<sub>between</sub> = Σ n<sub>j</sub> × (x̄<sub>j</sub> - x̄<sub>grand</sub>)²</strong>
                </div>
                <div class="s-a5b3cd">
                    <strong>What does SS<sub>between</sub> measure?</strong><br>
                    It measures how much the group means deviate from the grand mean, weighted by group size.
                    A larger SS<sub>between</sub> indicates that the groups are more different from each other.
                </div>
                
                <table class="s-897d74 gen-sized">
                    <thead>
                        <tr class="s-e7b83b">
                            <th class="s-a756db">Group</th>
                            <th class="s-a756db">n<sub>j</sub></th>
                            <th class="s-a756db">x̄<sub>j</sub></th>
                            <th class="s-a756db">x̄<sub>j</sub> - x̄<sub>grand</sub></th>
                            <th class="s-a756db">Contribution = n<sub>j</sub> × (x̄<sub>j</sub> - x̄<sub>grand</sub>)²</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ssBetweenDetails}
                        <tr class="s-767496">
                            <td class="s-c1430c" colspan="4">SS<sub>between</sub> =</td>
                            <td class="s-618bb3">${ssBetween.toFixed(6)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Section 4: Sum of Squares Within Groups (SS_within) -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">Step 4: Calculate SS<sub>within</sub> (Within-Groups Sum of Squares)</h3>
            <div class="s-ca9e5c">
                <div class="s-fa2325">
                    <strong>Formula: SS<sub>within</sub> = Σ SS<sub>j</sub> = Σ Σ (x<sub>ij</sub> - x̄<sub>j</sub>)²</strong>
                </div>
                <div class="s-a5b3cd">
                    <strong>What does SS<sub>within</sub> measure?</strong><br>
                    It measures the variability within each group (how spread out the values are around their group mean).
                    This is the sum of all squared deviations from each group's mean.
                </div>
                
                <table class="s-897d74 gen-sized">
                    <thead>
                        <tr class="s-e7b83b">
                            <th class="s-a756db">Group</th>
                            <th class="s-a756db">SS<sub>within</sub> for Group (from Step 2)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ssWithinDetails}
                        <tr class="s-767496">
                            <td class="s-aa3a8a">SS<sub>within</sub> =</td>
                            <td class="s-618bb3">${ssWithin.toFixed(6)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Section 5: Total Sum of Squares -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">Step 5: Calculate SS<sub>total</sub> (Total Sum of Squares)</h3>
            <div class="s-6025fc">
                <div class="s-4b0e48">
                    <strong>Formula: SS<sub>total</sub> = SS<sub>between</sub> + SS<sub>within</sub></strong><br><br>
                    SS<sub>total</sub> = ${ssBetween.toFixed(6)} + ${ssWithin.toFixed(6)} = <strong class="s-f342b5">${ssTotal.toFixed(6)}</strong>
                </div>
                <div class="s-b3fd00">
                    <strong>What does SS<sub>total</sub> represent?</strong><br>
                    Total variability in the data = Variability BETWEEN groups + Variability WITHIN groups.
                    This partitions the total variance into explained (between) and unexplained (within) components.
                </div>
            </div>
        </div>
        
        <!-- Section 6: Degrees of Freedom -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">Step 6: Calculate Degrees of Freedom (df)</h3>
            <div class="s-6025fc">
                <div class="s-4b0e48">
                    <div><strong>df<sub>between</sub> = k - 1</strong> = ${groups.size} - 1 = ${dfBetween}</div>
                    <div class="s-af5894"><strong>df<sub>within</sub> = N - k</strong> = ${totalN} - ${groups.size} = ${dfWithin}</div>
                    <div class="s-af5894"><strong>df<sub>total</sub> = N - 1</strong> = ${totalN} - 1 = ${dfTotal}</div>
                </div>
                <div class="s-b3fd00">
                    <strong>What are Degrees of Freedom?</strong><br>
                    • df<sub>between</sub>: Number of groups minus 1 (independent comparisons between group means)<br>
                    • df<sub>within</sub>: Total observations minus number of groups (variation within groups)<br>
                    • df<sub>total</sub>: Total observations minus 1 (total variation in the data)
                </div>
            </div>
        </div>
        
        <!-- Section 7: Mean Squares -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">Step 7: Calculate Mean Squares (MS)</h3>
            <div class="s-6025fc">
                <div class="s-4b0e48">
                    <div><strong>MS<sub>between</sub> = SS<sub>between</sub> / df<sub>between</sub></strong> = ${ssBetween.toFixed(6)} / ${dfBetween} = <strong>${msBetween.toFixed(8)}</strong></div>
                    <div class="s-9d5978"><strong>MS<sub>within</sub> = SS<sub>within</sub> / df<sub>within</sub></strong> = ${ssWithin.toFixed(6)} / ${dfWithin} = <strong>${msWithin.toFixed(8)}</strong></div>
                </div>
                <div class="s-b3fd00">
                    <strong>What are Mean Squares?</strong><br>
                    • MS<sub>between</sub> = Average variability BETWEEN groups<br>
                    • MS<sub>within</sub> = Average variability WITHIN groups (also called "error variance")<br>
                    • They are "variance estimates" - the between-group variance and within-group variance
                </div>
            </div>
        </div>
        
        <!-- Section 8: F-statistic -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">Step 8: Calculate the F-statistic</h3>
            <div class="s-6025fc">
                <div class="s-252832">
                    <strong>F = MS<sub>between</sub> / MS<sub>within</sub></strong><br>
                    F = ${msBetween.toFixed(6)} / ${msWithin.toFixed(6)}<br>
                    <div class="s-56b421">F = ${fStatistic.toFixed(8)}</div>
                </div>
                <div class="s-b3fd00">
                    <strong>What does the F-statistic tell us?</strong><br>
                    • F = (Variance BETWEEN groups) / (Variance WITHIN groups)<br>
                    • If F is large (> 1), group means differ more than expected by chance<br>
                    • If F ≈ 1, group means are similar (variation is just random error)<br>
                    • We compare F to a critical value from the F-distribution
                </div>
            </div>
        </div>
        
        <!-- Section 9: ANOVA Summary Table -->
        <div class="s-130975 gen-pad">
            <h3 class="s-82394a">ANOVA Summary Table</h3>
            <div class="s-01a9b9">
                <table class="s-f29cc6 gen-sized">
                    <thead>
                        <tr class="s-e7b83b">
                            <th class="s-d66e1c">Source of Variation</th>
                            <th class="s-d66e1c">Sum of Squares (SS)</th>
                            <th class="s-d66e1c">Degrees of Freedom (df)</th>
                            <th class="s-d66e1c">Mean Square (MS)</th>
                            <th class="s-d66e1c">F-statistic</th>
                            <th class="s-d66e1c">p-value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="s-00049c">
                            <td class="s-61a8ef">Between Groups</td>
                            <td class="s-02528c">${ssBetween.toFixed(4)}</td>
                            <td class="s-02528c">${dfBetween}</td>
                            <td class="s-02528c">${msBetween.toFixed(4)}</td>
                            <td class="s-470ce2" rowspan="3">${fStatistic.toFixed(6)}</td>
                            <td class="s-2dd257" rowspan="3">${pValue.toFixed(6)}</td>
                         </tr>
                        <tr class="s-00049c">
                            <td class="s-61a8ef">Within Groups (Error)</td>
                            <td class="s-02528c">${ssWithin.toFixed(4)}</td>
                            <td class="s-02528c">${dfWithin}</td>
                            <td class="s-02528c">${msWithin.toFixed(4)}</td>
                         </tr>
                        <tr class="s-767496">
                            <td class="s-61a8ef">Total</td>
                            <td class="s-02528c">${ssTotal.toFixed(4)}</td>
                            <td class="s-02528c">${dfTotal}</td>
                            <td class="s-02528c">—</td>
                         </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Section 10: Conclusion -->
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">Test Conclusion</h3>
            <div><strong>F-statistic:</strong> ${fStatistic.toFixed(6)}</div>
            <div><strong>Critical value F<sub>critical</sub>(${dfBetween}, ${dfWithin}) at α = ${alpha}:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
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
        
        <div class="s-afe18c">
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
