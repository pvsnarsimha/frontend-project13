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
        let bgColor = item.group === 1 ? '#e8f4f8' : '#f8f9fa';
        rankTableRows += `<tr style="border-bottom: 1px solid #e9ecef; background: ${bgColor};">
            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; text-align: center;">${item.value}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold;">${item.rank}</td>
            <td style="padding: 8px; text-align: center;">${item.group === 1 ? 'Sample 1' : 'Sample 2'}</td>
        </tr>`;
    });
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">U</span>
                <h2 style="margin: 0;">Mann-Whitney U Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: U = n₁n₂ + [n₁(n₁+1)/2] - R₁</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Non-parametric alternative to independent t-test</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Sample Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-weight: 700;">Sample 1</div>
                    <div>n₁ = ${n1}</div>
                    <div>Data: ${sample1.join(', ')}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #dc3545;">
                    <div style="font-weight: 700;">Sample 2</div>
                    <div>n₂ = ${n2}</div>
                    <div>Data: ${sample2.join(', ')}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Rank All Values Together</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 10px;">Position</th>
                        <th style="padding: 10px;">Value</th>
                        <th style="padding: 10px;">Rank</th>
                        <th style="padding: 10px;">Group</th>
                    </tr>
                </thead>
                <tbody>${rankTableRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate U Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Sum of ranks for Sample 1 (R₁):</strong> ${sumRank1.toFixed(2)}<br><br>
                <strong>U₁ = n₁n₂ + n₁(n₁+1)/2 - R₁</strong><br>
                U₁ = ${n1}×${n2} + ${n1}×${n1+1}/2 - ${sumRank1.toFixed(2)}<br>
                U₁ = ${n1*n2} + ${n1*(n1+1)/2} - ${sumRank1.toFixed(2)} = ${U1.toFixed(2)}<br><br>
                <strong>U₂ = n₁n₂ - U₁</strong><br>
                U₂ = ${n1*n2} - ${U1.toFixed(2)} = ${U2.toFixed(2)}<br><br>
                <strong>U = min(U₁, U₂) = ${U.toFixed(2)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Step 3: Calculate z-score approximation</strong><br>
                Expected U = n₁n₂/2 = ${expectedU.toFixed(2)}<br>
                Standard Deviation = √(tie-corrected variance) = ${stdU.toFixed(4)}<br>
                Tie-corrected variance = n₁n₂/12 × [(N+1) − Σ(t³−t)/(N(N−1))] = ${varU.toFixed(4)}<br>
                z = (ExpectedU − U₁ ∓ 0.5) / SD = ${z.toFixed(6)} (continuity correction 0.5 toward H₀; positive z means Sample 1 tends to be larger, so a one-sided test uses the matching tail)<br>
                p-value = ${pValue.toFixed(8)}
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>U Statistic:</strong> ${U.toFixed(2)}</div>
            <div><strong>z-score:</strong> ${z.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
    </div>`;
    
    return { U, z, pValue, rejectH0, conclusion, interpretation, steps };
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
            setHtml(valueSpan, `U = ${result.U.toFixed(2)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("mannWhitneyClearBtn", ["mannWhitneyData1", "mannWhitneyData2"], "mannWhitneyResultArea");
}
