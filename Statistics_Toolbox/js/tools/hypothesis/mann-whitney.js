/* MannWhitney: mannwhitney tool (render, compute, setup) */

// ========== MANN-WHITNEY U TEST INTERFACE RENDER ==========
function renderMannWhitneyInterface() {
    return buildInterface({
        id: "statMannWhitneyInterface",
        title: "U Mann-Whitney U Test (Non-parametric)",
        formula: "📌 U = n₁n₂ + [n₁(n₁+1)/2] - R₁",
        desc: "Non-parametric alternative to independent t-test. Tests whether one group tends to have larger values than the other. Does not assume normal distribution.",
        inputs: [
            {
                label: "📋 Enter Sample 1 data (comma, space, or line separated):",
                textarea: { id: "mannWhitneyData1", rows: "3", placeholder: "Example: 12, 15, 14, 16, 13, 15" }
            },
            {
                label: "📋 Enter Sample 2 data (comma, space, or line separated):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "mannWhitneyData2", rows: "3", placeholder: "Example: 18, 20, 19, 21, 22, 20, 19" }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "mannWhitneyAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS
            },
            {
                label: "📋 Alternative Hypothesis:",
                select: {
                    id: "mannWhitneyAlternative",
                    style: FIELD_STYLE
                },
                options: [
                    ["two.sided", "Population1 ≠ Population2 (Two-tailed)"],
                    ["greater", "Population1 > Population2 (One-tailed)"],
                    ["less", "Population1 < Population2 (One-tailed)"]
                ]
            }
        ],
        run: { id: "mannWhitneyComputeBtn", text: "U Run Mann-Whitney U Test + Full Steps" },
        clear: { id: "mannWhitneyClearBtn", text: "Clear All" },
        result: {
            area: "mannWhitneyResultArea",
            label: "🎯 MANN-WHITNEY U TEST RESULTS",
            value: "mannWhitneyValueDisplay",
            steps: "mannWhitneyStepsDisplay"
        }
    });
}

// ========== MANN-WHITNEY U TEST COMPUTATION ==========
function computeMannWhitneyTest(sample1, sample2, alpha, alternative) {
    if (!sample1.length || !sample2.length) {
        return { error: true, message: "Please enter both samples." };
    }
    
    const n1 = sample1.length;
    const n2 = sample2.length;
    
    // Combine and rank all values
    let combined = [];
    for (let val of sample1) combined.push({ value: val, group: 1 });
    for (let val of sample2) combined.push({ value: val, group: 2 });
    
    combined.sort((a, b) => a.value - b.value);
    
    // Assign ranks (handle ties)
    let ranks = new Array(combined.length);
    let i = 0;
    while (i < combined.length) {
        let j = i;
        while (j < combined.length && combined[j].value === combined[i].value) j++;
        let avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) ranks[k] = avgRank;
        i = j;
    }
    
    // Sum ranks for group 1
    let sumRank1 = 0;
    let rankDetails = [];
    for (let idx = 0; idx < combined.length; idx++) {
        if (combined[idx].group === 1) {
            sumRank1 += ranks[idx];
            rankDetails.push({ value: combined[idx].value, rank: ranks[idx], group: 1 });
        } else {
            rankDetails.push({ value: combined[idx].value, rank: ranks[idx], group: 2 });
        }
    }
    
    // Calculate U statistic
    let U1 = n1 * n2 + (n1 * (n1 + 1)) / 2 - sumRank1;
    let U2 = n1 * n2 - U1;
    let U = Math.min(U1, U2);
    
    // Calculate expected U and standard deviation (with the tie correction to the variance)
    const N = n1 + n2;
    const expectedU = (n1 * n2) / 2;
    let tieTerm = 0;
    for (let a = 0; a < N;) {
        let b = a;
        while (b < N && combined[b].value === combined[a].value) b++;
        const t = b - a;
        tieTerm += t * t * t - t;
        a = b;
    }
    const varU = (n1 * n2 / 12) * ((N + 1) - tieTerm / (N * (N - 1)));
    if (!(varU > 0)) {
        return { error: true, message: "All values are identical, so the Mann-Whitney test cannot be computed." };
    }
    const stdU = Math.sqrt(varU);
    
    // z-score with continuity correction: 0.5 is always moved toward the null (U₁ = n₁n₂/2).
    // U₁ = n₁n₂ + n₁(n₁+1)/2 - R₁ is SMALL when Sample 1 has the larger ranks, so "greater" (Sample 1 > Sample 2)
    // uses the lower tail of U₁; diffU1 flips the sign so that a positive z always points toward "Sample 1 larger".
    const continuityCorrection = 0.5;
    const diffU1 = expectedU - U1;
    let z;
    if (alternative === 'two.sided') {
        z = Math.sign(diffU1) * Math.max(Math.abs(diffU1) - continuityCorrection, 0) / stdU;
    } else if (alternative === 'greater') {
        z = (diffU1 - continuityCorrection) / stdU;
    } else {
        z = (diffU1 + continuityCorrection) / stdU;
    }
    
    // Calculate p-value based on alternative
    let pValue;
    if (alternative === 'two.sided') {
        pValue = Math.min(1, 2 * normCDF(-Math.abs(z)));
    } else if (alternative === 'greater') {
        pValue = normCDF(-z);
    } else {
        pValue = normCDF(z);
    }
    
    // Small samples without ties: the exact p-value from the null distribution of U replaces the normal approximation
    // (the same as SciPy's method="exact"). Us is U for sample 1 in the usual orientation (large when sample 1 has the larger ranks).
    const EXACT_MAX_N = 20;
    const exact = tieTerm === 0 && n1 <= EXACT_MAX_N && n2 <= EXACT_MAX_N;
    if (exact) {
        const tails = exactTailProbabilities(mannWhitneyUCounts(n1, n2), n1 * n2 - U1);
        pValue = alternative === 'two.sided' ? Math.min(1, 2 * Math.min(tails.lower, tails.upper))
            : (alternative === 'greater' ? tails.upper : tails.lower);
    }
    
    // Critical value (approximate)
    const criticalZ = normInv(1 - (alternative === 'two.sided' ? alpha / 2 : alpha));
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the populations are ${alternative === 'two.sided' ? 'different' : (alternative === 'greater' ? 'Sample1 > Sample2' : 'Sample1 < Sample2')}.` :
        `There is NOT sufficient evidence that the populations are ${alternative === 'two.sided' ? 'different' : (alternative === 'greater' ? 'Sample1 > Sample2' : 'Sample1 < Sample2')}.`;
    
    // Build ranking table
    let rankTableRows = '';
    rankDetails.forEach((item, idx) => {
        rankTableRows += `<tr class="${item.group === 1 ? 's-42c5fb' : 's-d7104c'}">
            <td class="s-a7c3f4">${idx + 1}</td>
            <td class="s-a7c3f4">${item.value}</td>
            <td class="s-f8719c">${item.rank}</td>
            <td class="s-a7c3f4">${item.group === 1 ? 'Sample 1' : 'Sample 2'}</td>
        </tr>`;
    });
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">U</span>
                <h2 class="s-f8a94d">Mann-Whitney U Test</h2>
            </div>
            <p class="s-259079">Formula: U = n₁n₂ + [n₁(n₁+1)/2] - R₁</p>
            <p class="s-20a400">Non-parametric alternative to independent t-test</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Sample Statistics</h3>
            <div class="s-b00abc gen-grid">
                <div class="s-a31255">
                    <div class="s-cbd2a7">Sample 1</div>
                    <div>n₁ = ${n1}</div>
                    <div>Data: ${sample1.join(', ')}</div>
                </div>
                <div class="s-30eb0c">
                    <div class="s-cbd2a7">Sample 2</div>
                    <div>n₂ = ${n2}</div>
                    <div>Data: ${sample2.join(', ')}</div>
                </div>
            </div>
        </div>
        
        <div class="s-2311e6">
            <h3 class="s-10bf27">📋 Step 1: Rank All Values Together</h3>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-bfd0ae">
                        <th class="s-a756db">Position</th>
                        <th class="s-a756db">Value</th>
                        <th class="s-a756db">Rank</th>
                        <th class="s-a756db">Group</th>
                    </tr>
                </thead>
                <tbody>${rankTableRows}</tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 2: Calculate U Statistic</h3>
            <div class="s-ca9e5c">
                <strong>Sum of ranks for Sample 1 (R₁):</strong> ${sumRank1.toFixed(2)}<br><br>
                <strong>U₁ = n₁n₂ + n₁(n₁+1)/2 - R₁</strong><br>
                U₁ = ${n1}×${n2} + ${n1}×${n1+1}/2 - ${sumRank1.toFixed(2)}<br>
                U₁ = ${n1*n2} + ${n1*(n1+1)/2} - ${sumRank1.toFixed(2)} = ${U1.toFixed(2)}<br><br>
                <strong>U₂ = n₁n₂ - U₁</strong><br>
                U₂ = ${n1*n2} - ${U1.toFixed(2)} = ${U2.toFixed(2)}<br><br>
                <strong>U = min(U₁, U₂) = ${U.toFixed(2)}</strong>
            </div>
            
            ${exact ? `<div class="s-6025fc">
                <strong>Step 3: Exact p-value</strong><br>
                There are no ties and the samples are small (n₁ = ${n1}, n₂ = ${n2}), so the p-value is computed exactly from the null distribution of U:
                all ${(() => { let c = 1; for (let i = 1; i <= Math.min(n1, n2); i++) c = c * (N - Math.min(n1, n2) + i) / i; return Math.round(c); })()} equally likely arrangements of the ranks are counted (no normal approximation).<br>
                p-value = ${pValue.toFixed(8)}
            </div>` : `<div class="s-6025fc">
                <strong>Step 3: Calculate z-score approximation</strong><br>
                Expected U = n₁n₂/2 = ${expectedU.toFixed(2)}<br>
                Standard Deviation = √(tie-corrected variance) = ${stdU.toFixed(4)}<br>
                Tie-corrected variance = n₁n₂/12 × [(N+1) − Σ(t³−t)/(N(N−1))] = ${varU.toFixed(4)}<br>
                z = (ExpectedU − U₁ ∓ 0.5) / SD = ${z.toFixed(6)} (continuity correction 0.5 toward H₀; positive z means Sample 1 tends to be larger, so a one-sided test uses the matching tail)<br>
                p-value = ${pValue.toFixed(8)}
            </div>`}
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>U Statistic:</strong> ${U.toFixed(2)}</div>
            ${exact ? '' : `<div><strong>z-score:</strong> ${z.toFixed(6)}</div>`}
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
    </div>`;
    
    // the p-value uses the normal approximation, which is rough for small samples
    return { U, z, pValue, rejectH0, conclusion, interpretation, steps, exact, method: exact ? 'exact' : 'normal approximation', smallSample: !exact && n1 * n2 < 20 };
}

// ========== MANN-WHITNEY SETUP ==========
function setupMannWhitneyLogic() {
    const computeBtn = document.getElementById("mannWhitneyComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw1 = document.getElementById("mannWhitneyData1").value;
        const raw2 = document.getElementById("mannWhitneyData2").value;
        const sample1 = parseNumbersFromInput(raw1);
        const sample2 = parseNumbersFromInput(raw2);
        const alpha = parseFloat(document.getElementById("mannWhitneyAlpha").value);
        const alternative = document.getElementById("mannWhitneyAlternative").value;
        const resultDiv = document.getElementById("mannWhitneyResultArea");
        const valueSpan = document.getElementById("mannWhitneyValueDisplay");
        const stepsSpan = document.getElementById("mannWhitneyStepsDisplay");
        
        if (!sample1.length || !sample2.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter both sample datasets.");
            return;
        }
        
        const result = computeMannWhitneyTest(sample1, sample2, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `U = ${result.U.toFixed(2)} | p${result.exact ? ' (exact)' : (result.smallSample ? ' (normal approx.)' : '')} = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}${result.smallSample ? ' | ⚠ small sample: treat p as approximate' : ''}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("mannWhitneyClearBtn", ["mannWhitneyData1", "mannWhitneyData2"], "mannWhitneyResultArea");
}
