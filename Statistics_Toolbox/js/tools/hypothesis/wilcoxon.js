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
        diffTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; text-align: center;">${d.before}</td>
            <td style="padding: 8px; text-align: center;">${d.after}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: ${diffColor};">${sign}${Math.abs(d.diff).toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${rank}</td>
            <td style="padding: 8px; text-align: center;">${sign === '+' ? 'Positive' : (sign === '-' ? 'Negative' : 'Zero')}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">W</span>
                <h2 style="margin: 0;">Wilcoxon Signed-Rank Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Non-parametric alternative to paired t-test</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Tests whether the median difference between paired observations is zero</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-weight: 700;">Number of Pairs</div>
                    <div style="font-size: 24px;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-weight: 700;">Non-zero Differences</div>
                    <div style="font-size: 24px;">${withRanks.length}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Calculate Differences and Ranks</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 10px;">Pair</th>
                        <th style="padding: 10px;">Before</th>
                        <th style="padding: 10px;">After</th>
                        <th style="padding: 10px;">Difference</th>
                        <th style="padding: 10px;">Rank |d|</th>
                        <th style="padding: 10px;">Sign</th>
                    </tr>
                </thead>
                <tbody>${diffTableRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Test Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Sum of positive ranks (W⁺):</strong> ${Wpos.toFixed(2)}<br>
                <strong>Sum of negative ranks (W⁻):</strong> ${Wneg.toFixed(2)}<br>
                <strong>W = min(W⁺, W⁻) = ${W.toFixed(2)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Step 3: Calculate z-score approximation</strong><br>
                Non-zero differences used: n = ${nEff} of ${n}<br>
                Expected W = n(n+1)/4 = ${expectedW.toFixed(2)}<br>
                Standard Deviation = √[n(n+1)(2n+1)/24 − Σ(t³−t)/48] = ${stdW.toFixed(4)}<br>
                z = (W⁺ − ExpectedW ∓ 0.5) / SD = ${z.toFixed(6)} (continuity correction 0.5 toward H₀; sign follows W⁺, so a one-sided test uses the matching tail)<br>
                p-value = ${pValue.toFixed(8)}
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>W Statistic:</strong> ${W.toFixed(2)}</div>
            <div><strong>z-score:</strong> ${z.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
    </div>`;
    
    return { W, Wpos, Wneg, z, pValue, rejectH0, conclusion, interpretation, steps };
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
            setHtml(valueSpan, `W = ${result.W.toFixed(2)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("wilcoxonClearBtn", ["wilcoxonBeforeData", "wilcoxonAfterData"], "wilcoxonResultArea");
}
