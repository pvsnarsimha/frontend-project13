/* Wilcoxon: wilcoxon tool (render, compute, setup) */

// ========== WILCOXON SIGNED-RANK TEST INTERFACE RENDER ==========
function renderWilcoxonInterface() {
    return buildInterface({
        id: "statWilcoxonInterface",
        title: "W Wilcoxon Signed-Rank Test (Non-parametric)",
        formula: "📌 W = sum of signed ranks",
        desc: "Non-parametric alternative to paired t-test. Tests whether the median difference between paired observations is zero. Does not assume normal distribution.",
        inputs: [
            {
                label: "📋 Enter Before values (comma, space, or line separated):",
                textarea: { id: "wilcoxonBeforeData", rows: "3", placeholder: "Example: 12, 15, 14, 16, 13, 15, 14" }
            },
            {
                label: "📋 Enter After values (same number of observations):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "wilcoxonAfterData", rows: "3", placeholder: "Example: 14, 16, 15, 18, 15, 17, 16" }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "wilcoxonAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS
            },
            {
                label: "📋 Alternative Hypothesis:",
                select: { id: "wilcoxonAlternative", style: FIELD_STYLE },
                options: [
                    ["two.sided", "Median difference ≠ 0 (Two-tailed)"],
                    ["greater", "Median difference > 0 (After > Before)"],
                    ["less", "Median difference < 0 (After < Before)"]
                ]
            }
        ],
        run: { id: "wilcoxonComputeBtn", text: "W Run Wilcoxon Signed-Rank Test + Full Steps" },
        clear: { id: "wilcoxonClearBtn", text: "Clear All" },
        result: {
            area: "wilcoxonResultArea",
            label: "🎯 WILCOXON SIGNED-RANK TEST RESULTS",
            value: "wilcoxonValueDisplay",
            steps: "wilcoxonStepsDisplay"
        }
    });
}

// ========== WILCOXON SIGNED-RANK TEST COMPUTATION ==========
function computeWilcoxonTest(before, after, alpha, alternative) {
    if (!before.length || !after.length) {
        return { error: true, message: "Please enter both before and after data." };
    }
    if (before.length !== after.length) {
        return { error: true, message: "Before and after data must have the same number of observations." };
    }
    
    const n = before.length;
    let differences = [];
    let nonZeroDiffs = [];
    
    for (let i = 0; i < n; i++) {
        let diff = after[i] - before[i];
        differences.push({ before: before[i], after: after[i], diff: diff, absDiff: Math.abs(diff) });
        if (diff !== 0) nonZeroDiffs.push(Math.abs(diff));
    }
    
    // Rank absolute differences
    let withRanks = [];
    for (let i = 0; i < n; i++) {
        if (differences[i].diff !== 0) {
            withRanks.push({ 
                ...differences[i], 
                originalIndex: i,
                absDiff: Math.abs(differences[i].diff)
            });
        }
    }
    withRanks.sort((a, b) => a.absDiff - b.absDiff);
    
    // Assign ranks (handle ties)
    let i = 0;
    while (i < withRanks.length) {
        let j = i;
        while (j < withRanks.length && withRanks[j].absDiff === withRanks[i].absDiff) j++;
        let avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) withRanks[k].rank = avgRank;
        i = j;
    }
    
    // Calculate W+ and W-
    let Wpos = 0;
    let Wneg = 0;
    let rankDetails = [];
    
    for (let item of withRanks) {
        if (item.diff > 0) {
            Wpos += item.rank;
            rankDetails.push({ ...item, sign: 'positive' });
        } else {
            Wneg += item.rank;
            rankDetails.push({ ...item, sign: 'negative' });
        }
    }
    
    rankDetails.sort((a, b) => a.originalIndex - b.originalIndex);
    
    let W = Math.min(Wpos, Wneg);
    
    // Zero differences are dropped (Wilcoxon's method), so the normal approximation uses the number of non-zero pairs
    const nEff = withRanks.length;
    if (nEff === 0) {
        return { error: true, message: "All differences are zero, so the Wilcoxon test cannot be computed." };
    }
    let tieTerm = 0;
    for (let a = 0; a < nEff;) {
        let b = a;
        while (b < nEff && withRanks[b].absDiff === withRanks[a].absDiff) b++;
        const t = b - a;
        tieTerm += t * t * t - t;
        a = b;
    }
    const expectedW = (nEff * (nEff + 1)) / 4;
    const stdW = Math.sqrt((nEff * (nEff + 1) * (2 * nEff + 1)) / 24 - tieTerm / 48);
    
    // z-score with continuity correction: 0.5 is always moved toward the null (W⁺ = n(n+1)/4).
    // Differences are after − before, so W⁺ large means "after > before" (alternative "greater").
    const diffW = Wpos - expectedW;
    let z;
    if (alternative === 'two.sided') {
        z = Math.sign(diffW) * Math.max(Math.abs(diffW) - 0.5, 0) / stdW;
    } else if (alternative === 'greater') {
        z = (diffW - 0.5) / stdW;
    } else {
        z = (diffW + 0.5) / stdW;
    }
    
    // Calculate p-value
    let pValue;
    if (alternative === 'two.sided') {
        pValue = Math.min(1, 2 * normCDF(-Math.abs(z)));
    } else if (alternative === 'greater') {
        pValue = normCDF(-z);
    } else {
        pValue = normCDF(z);
    }
    
    const criticalZ = normInv(1 - (alternative === 'two.sided' ? alpha / 2 : alpha));
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the median difference is ${alternative === 'two.sided' ? 'different from zero' : (alternative === 'greater' ? 'greater than zero (after > before)' : 'less than zero (after < before)')}.` :
        `There is NOT sufficient evidence that the median difference is ${alternative === 'two.sided' ? 'different from zero' : (alternative === 'greater' ? 'greater than zero' : 'less than zero')}.`;
    
    // Build difference table
    let diffTableRows = '';
    for (let idx = 0; idx < n; idx++) {
        let d = differences[idx];
        let diffColor = d.diff > 0 ? '#28a745' : (d.diff < 0 ? '#dc3545' : '#6c757d');
        let rank = rankDetails.find(r => r.originalIndex === idx)?.rank || '-';
        let sign = d.diff > 0 ? '+' : (d.diff < 0 ? '-' : '0');
        diffTableRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${idx + 1}</td>
            <td class="s-a7c3f4">${d.before}</td>
            <td class="s-a7c3f4">${d.after}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: ${diffColor};">${sign}${Math.abs(d.diff).toFixed(4)}</td>
            <td class="s-a7c3f4">${rank}</td>
            <td class="s-a7c3f4">${sign === '+' ? 'Positive' : (sign === '-' ? 'Negative' : 'Zero')}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">W</span>
                <h2 class="s-f8a94d">Wilcoxon Signed-Rank Test</h2>
            </div>
            <p class="s-259079">Non-parametric alternative to paired t-test</p>
            <p class="s-20a400">Tests whether the median difference between paired observations is zero</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-b00abc gen-grid">
                <div class="s-63afdf">
                    <div class="s-cbd2a7">Number of Pairs</div>
                    <div class="s-af5c21">${n}</div>
                </div>
                <div class="s-63afdf">
                    <div class="s-cbd2a7">Non-zero Differences</div>
                    <div class="s-af5c21">${withRanks.length}</div>
                </div>
            </div>
        </div>
        
        <div class="s-2311e6">
            <h3 class="s-10bf27">📋 Step 1: Calculate Differences and Ranks</h3>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-bfd0ae">
                        <th class="s-a756db">Pair</th>
                        <th class="s-a756db">Before</th>
                        <th class="s-a756db">After</th>
                        <th class="s-a756db">Difference</th>
                        <th class="s-a756db">Rank |d|</th>
                        <th class="s-a756db">Sign</th>
                    </tr>
                </thead>
                <tbody>${diffTableRows}</tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 2: Calculate Test Statistic</h3>
            <div class="s-ca9e5c">
                <strong>Sum of positive ranks (W⁺):</strong> ${Wpos.toFixed(2)}<br>
                <strong>Sum of negative ranks (W⁻):</strong> ${Wneg.toFixed(2)}<br>
                <strong>W = min(W⁺, W⁻) = ${W.toFixed(2)}</strong>
            </div>
            
            <div class="s-6025fc">
                <strong>Step 3: Calculate z-score approximation</strong><br>
                Non-zero differences used: n = ${nEff} of ${n}<br>
                Expected W = n(n+1)/4 = ${expectedW.toFixed(2)}<br>
                Standard Deviation = √[n(n+1)(2n+1)/24 − Σ(t³−t)/48] = ${stdW.toFixed(4)}<br>
                z = (W⁺ − ExpectedW ∓ 0.5) / SD = ${z.toFixed(6)} (continuity correction 0.5 toward H₀; sign follows W⁺, so a one-sided test uses the matching tail)<br>
                p-value = ${pValue.toFixed(8)}
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>W Statistic:</strong> ${W.toFixed(2)}</div>
            <div><strong>z-score:</strong> ${z.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
    </div>`;
    
    // the p-value uses the normal approximation, which is rough for fewer than ~10 non-zero pairs
    return { W, Wpos, Wneg, z, pValue, rejectH0, conclusion, interpretation, steps, smallSample: nEff < 10 };
}

// ========== WILCOXON SETUP ==========
function setupWilcoxonLogic() {
    const computeBtn = document.getElementById("wilcoxonComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawBefore = document.getElementById("wilcoxonBeforeData").value;
        const rawAfter = document.getElementById("wilcoxonAfterData").value;
        const before = parseNumbersFromInput(rawBefore);
        const after = parseNumbersFromInput(rawAfter);
        const alpha = parseFloat(document.getElementById("wilcoxonAlpha").value);
        const alternative = document.getElementById("wilcoxonAlternative").value;
        const resultDiv = document.getElementById("wilcoxonResultArea");
        const valueSpan = document.getElementById("wilcoxonValueDisplay");
        const stepsSpan = document.getElementById("wilcoxonStepsDisplay");
        
        if (!before.length || !after.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter both before and after data.");
            return;
        }
        
        const result = computeWilcoxonTest(before, after, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `W = ${result.W.toFixed(2)} | p${result.smallSample ? ' (normal approx.)' : ''} = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}${result.smallSample ? ' | ⚠ small sample: treat p as approximate' : ''}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("wilcoxonClearBtn", ["wilcoxonBeforeData", "wilcoxonAfterData"], "wilcoxonResultArea");
}
