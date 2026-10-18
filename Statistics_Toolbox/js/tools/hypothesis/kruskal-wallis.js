/* KruskalWallis: kruskalwallis tool (render, compute, setup) */

// ========== KRUSKAL-WALLIS H TEST INTERFACE RENDER ==========
function renderKruskalWallisInterface() {
    return buildInterface({
        id: "statKruskalWallisInterface",
        title: "H Kruskal-Wallis H Test (Non-parametric ANOVA)",
        formula: "📌 H = (12 / N(N+1)) × Σ(Rⱼ²/nⱼ) - 3(N+1)",
        desc: "Non-parametric alternative to one-way ANOVA. Tests whether samples come from the same distribution. Does not assume normality.",
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "kruskalData",
                    rows: "5",
                    placeholder: "Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"
                }
            },
            {
                hint: "<strong>Format:</strong> value:group (comma or space separated)<br>\n                    <strong>Example:</strong> 23:A means value 23 belongs to group A",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "kruskalAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "kruskalComputeBtn", text: "H Run Kruskal-Wallis Test + Full Steps" },
        clear: { id: "kruskalClearBtn", text: "Clear" },
        result: {
            area: "kruskalResultArea",
            label: "🎯 KRUSKAL-WALLIS H TEST RESULTS",
            value: "kruskalValueDisplay",
            steps: "kruskalStepsDisplay"
        }
    });
}

// ========== KRUSKAL-WALLIS H TEST COMPUTATION ==========
// ========== KRUSKAL-WALLIS H TEST COMPUTATION ==========
function computeKruskalWallisTest(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = escapeHtml(groupName.trim());
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Kruskal-Wallis test." };
    }
    
    // Combine all values with group labels
    let allValues = [];
    for (let [group, values] of groups) {
        for (let val of values) {
            allValues.push({ value: val, group: group });
        }
    }
    
    // Sort and rank all values
    allValues.sort((a, b) => a.value - b.value);
    
    // Assign ranks (handle ties)
    let i = 0;
    while (i < allValues.length) {
        let j = i;
        while (j < allValues.length && allValues[j].value === allValues[i].value) j++;
        let avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) allValues[k].rank = avgRank;
        i = j;
    }
    
    // Calculate rank sums per group
    let rankSums = new Map();
    let groupSizes = new Map();
    for (let [group, values] of groups) {
        rankSums.set(group, 0);
        groupSizes.set(group, values.length);
    }
    
    for (let item of allValues) {
        rankSums.set(item.group, rankSums.get(item.group) + item.rank);
    }
    
    const N = allValues.length;
    const k = groups.size;
    
    // Calculate H statistic
    let H = 0;
    let formulaParts = [];
    for (let [group, sumRank] of rankSums) {
        let n_j = groupSizes.get(group);
        let term = Math.pow(sumRank, 2) / n_j;
        formulaParts.push(`(${sumRank.toFixed(2)}²/${n_j}) = ${term.toFixed(4)}`);
        H += term;
    }
    let rawH = H;
    H = (12 / (N * (N + 1))) * H - 3 * (N + 1);
    
    // Correction for ties
    let tieCorrection = 0;
    let tieCounts = [];
    let currentVal = allValues[0].value;
    let count = 1;
    for (let idx = 1; idx < allValues.length; idx++) {
        if (allValues[idx].value === currentVal) {
            count++;
        } else {
            if (count > 1) tieCounts.push(count);
            currentVal = allValues[idx].value;
            count = 1;
        }
    }
    if (count > 1) tieCounts.push(count);
    
    let tieCorrectionText = "";
    if (tieCounts.length > 0) {
        let tieSum = tieCounts.reduce((sum, t) => sum + (Math.pow(t, 3) - t), 0);
        tieCorrection = 1 - (tieSum / (Math.pow(N, 3) - N));
        let oldH = H;
        H = H / tieCorrection;
        tieCorrectionText = `<div style="background: #fff3cd; padding: 12px; border-radius: 8px; margin-top: 12px;">
            <strong>⚠️ Tie Correction Applied:</strong><br>
            Ties detected: ${tieCounts.map(t => `${t} values`).join(', ')}<br>
            Correction factor = 1 - [Σ(t³ - t)] / (N³ - N)<br>
            Correction factor = 1 - [${tieSum}] / (${Math.pow(N, 3)} - ${N}) = ${tieCorrection.toFixed(6)}<br>
            Corrected H = ${oldH.toFixed(6)} / ${tieCorrection.toFixed(6)} = ${H.toFixed(6)}
        </div>`;
    }
    
    const df = k - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(H, df);
    const rejectH0 = H > criticalValue;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        "There IS sufficient evidence that at least one group comes from a different distribution." :
        "There is NOT sufficient evidence that the groups come from different distributions.";
    
    // Build ranking table
    let rankTableRows = '';
    for (let idx = 0; idx < allValues.length; idx++) {
        rankTableRows += `<tr>
            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; text-align: center;">${allValues[idx].value}</td>
            <td style="padding: 8px; text-align: center;">${allValues[idx].group}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold;">${allValues[idx].rank}</td>
        </tr>`;
    }
    
    // Build rank sums table
    let rankSumRows = '';
    for (let [group, sumRank] of rankSums) {
        let n_j = groupSizes.get(group);
        rankSumRows += `<tr>
            <td style="padding: 8px;">${group}</td>
            <td style="padding: 8px; text-align: center;">${n_j}</td>
            <td style="padding: 8px; text-align: center;">${sumRank.toFixed(2)}</td>
            <td style="padding: 8px; text-align: center;">${Math.pow(sumRank, 2).toFixed(2)}</td>
            <td style="padding: 8px; text-align: center;">${Math.pow(sumRank, 2).toFixed(2)} / ${n_j} = ${(Math.pow(sumRank, 2) / n_j).toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">H</span>
                <h2 style="margin: 0;">Kruskal-Wallis H Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Non-parametric alternative to one-way ANOVA</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: All groups come from the same distribution | H₁: At least one group differs</p>
        </div>
        
        <!-- Formula Explanation Section -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📖 Understanding the Kruskal-Wallis H Formula</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin-bottom: 20px;">
                    <strong>H = (12 / [N(N+1)]) × Σ(Rⱼ²/nⱼ) - 3(N+1)</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: #e8f4f8; padding: 12px; border-radius: 8px;">
                        <strong>📊 Variables:</strong><br>
                        • <strong>N</strong> = Total number of observations across all groups<br>
                        • <strong>k</strong> = Number of groups<br>
                        • <strong>Rⱼ</strong> = Sum of ranks for group j<br>
                        • <strong>nⱼ</strong> = Number of observations in group j
                    </div>
                    <div style="background: #e8f4f8; padding: 12px; border-radius: 8px;">
                        <strong>🔢 Step-by-Step:</strong><br>
                        1. Rank ALL values together (smallest = rank 1)<br>
                        2. Sum ranks for each group (Rⱼ)<br>
                        3. Calculate Rⱼ²/nⱼ for each group<br>
                        4. Sum these values: Σ(Rⱼ²/nⱼ)<br>
                        5. Apply the formula to get H
                    </div>
                </div>
                
                <div style="margin-top: 16px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    <strong>💡 Intuition:</strong> If groups are similar, ranks will be evenly distributed → H is small.<br>
                    If groups differ, ranks will cluster within groups → H is large.
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Rank All Values Together</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;"><th>Position</th><th>Value</th><th>Group</th><th>Rank</th></tr></thead>
                <tbody>${rankTableRows}</tbody>
            </table>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 2: Calculate Rank Sums per Group (Rⱼ)</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;"><th>Group</th><th>nⱼ</th><th>Rⱼ (Sum of Ranks)</th><th>Rⱼ²</th><th>Rⱼ²/nⱼ</th></tr></thead>
                <tbody>${rankSumRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate H Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula:</strong> H = (12 / [N(N+1)]) × Σ(Rⱼ²/nⱼ) - 3(N+1)<br><br>
                
                <strong>Step 3a: Calculate Σ(Rⱼ²/nⱼ)</strong><br>
                Σ(Rⱼ²/nⱼ) = ${formulaParts.join(' + ')} = ${rawH.toFixed(4)}<br><br>
                
                <strong>Step 3b: Calculate the multiplier</strong><br>
                12 / [N(N+1)] = 12 / [${N} × ${N+1}] = 12 / ${N * (N+1)} = ${(12 / (N * (N+1))).toFixed(6)}<br><br>
                
                <strong>Step 3c: Multiply</strong><br>
                ${(12 / (N * (N+1))).toFixed(6)} × ${rawH.toFixed(4)} = ${((12 / (N * (N+1))) * rawH).toFixed(4)}<br><br>
                
                <strong>Step 3d: Subtract 3(N+1)</strong><br>
                3(${N}+1) = 3 × ${N+1} = ${3 * (N+1)}<br><br>
                
                <strong>Step 3e: Final H</strong><br>
                H = ${((12 / (N * (N+1))) * rawH).toFixed(4)} - ${3 * (N+1)} = <strong style="color: #1a5490; font-size: 18px;">${H.toFixed(6)}</strong>
                
                ${tieCorrectionText}
                
                <div style="margin-top: 16px;">
                    <strong>Degrees of Freedom:</strong> df = k - 1 = ${k} - 1 = ${df}<br>
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}<br>
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>H Statistic:</strong> ${H.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${H > criticalValue ? '✓ H > Critical value → Reject H₀' : '✗ H < Critical value → Cannot reject H₀'}
            </div>
        </div>
    </div>`;
    
    return { H, df, pValue, criticalValue, rejectH0, steps };
}

// ========== KRUSKAL-WALLIS SETUP ==========
function setupKruskalWallisLogic() {
    const computeBtn = document.getElementById("kruskalComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("kruskalData").value;
        const alpha = parseFloat(document.getElementById("kruskalAlpha").value);
        const resultDiv = document.getElementById("kruskalResultArea");
        const valueSpan = document.getElementById("kruskalValueDisplay");
        const stepsSpan = document.getElementById("kruskalStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeKruskalWallisTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `H = ${result.H.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("kruskalClearBtn", "kruskalData", "kruskalResultArea");
}
