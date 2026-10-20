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
    const parsed = parseValueGroupInput(inputText);
    const groups = parsed.groups;
    if (parsed.skipped.length) {
        return { error: true, message: `Could not read: ${parsed.skipped.slice(0, 5).map(x => escapeHtml(x)).join(', ')}${parsed.skipped.length > 5 ? ', …' : ''}. Each entry must look like value:group (for example 12.5:Control).` };
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
        tieCorrectionText = `<div class="s-85e0bb">
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
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        "There IS sufficient evidence that at least one group comes from a different distribution." :
        "There is NOT sufficient evidence that the groups come from different distributions.";
    
    // Build ranking table
    let rankTableRows = '';
    for (let idx = 0; idx < allValues.length; idx++) {
        rankTableRows += `<tr>
            <td class="s-a7c3f4">${idx + 1}</td>
            <td class="s-a7c3f4">${allValues[idx].value}</td>
            <td class="s-a7c3f4">${allValues[idx].group}</td>
            <td class="s-f8719c">${allValues[idx].rank}</td>
        </tr>`;
    }
    
    // Build rank sums table
    let rankSumRows = '';
    for (let [group, sumRank] of rankSums) {
        let n_j = groupSizes.get(group);
        rankSumRows += `<tr>
            <td class="s-641001">${group}</td>
            <td class="s-a7c3f4">${n_j}</td>
            <td class="s-a7c3f4">${sumRank.toFixed(2)}</td>
            <td class="s-a7c3f4">${Math.pow(sumRank, 2).toFixed(2)}</td>
            <td class="s-a7c3f4">${Math.pow(sumRank, 2).toFixed(2)} / ${n_j} = ${(Math.pow(sumRank, 2) / n_j).toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">H</span>
                <h2 class="s-f8a94d">Kruskal-Wallis H Test</h2>
            </div>
            <p class="s-259079">Non-parametric alternative to one-way ANOVA</p>
            <p class="s-20a400">H₀: All groups come from the same distribution | H₁: At least one group differs</p>
        </div>
        
        <!-- Formula Explanation Section -->
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📖 Understanding the Kruskal-Wallis H Formula</h3>
            <div class="s-6025fc">
                <div class="s-da7e8e">
                    <strong>H = (12 / [N(N+1)]) × Σ(Rⱼ²/nⱼ) - 3(N+1)</strong>
                </div>
                
                <div class="s-800734 gen-grid">
                    <div class="s-b93f03">
                        <strong>📊 Variables:</strong><br>
                        • <strong>N</strong> = Total number of observations across all groups<br>
                        • <strong>k</strong> = Number of groups<br>
                        • <strong>Rⱼ</strong> = Sum of ranks for group j<br>
                        • <strong>nⱼ</strong> = Number of observations in group j
                    </div>
                    <div class="s-b93f03">
                        <strong>🔢 Step-by-Step:</strong><br>
                        1. Rank ALL values together (smallest = rank 1)<br>
                        2. Sum ranks for each group (Rⱼ)<br>
                        3. Calculate Rⱼ²/nⱼ for each group<br>
                        4. Sum these values: Σ(Rⱼ²/nⱼ)<br>
                        5. Apply the formula to get H
                    </div>
                </div>
                
                <div class="s-319ae0">
                    <strong>💡 Intuition:</strong> If groups are similar, ranks will be evenly distributed → H is small.<br>
                    If groups differ, ranks will cluster within groups → H is large.
                </div>
            </div>
        </div>
        
        <div class="s-2311e6">
            <h3 class="s-10bf27">📋 Step 1: Rank All Values Together</h3>
            <table class="s-897d74 gen-sized">
                <thead><tr class="s-bfd0ae"><th>Position</th><th>Value</th><th>Group</th><th>Rank</th></tr></thead>
                <tbody>${rankTableRows}</tbody>
            </table>
        </div>
        
        <div class="s-2311e6">
            <h3 class="s-10bf27">📋 Step 2: Calculate Rank Sums per Group (Rⱼ)</h3>
            <table class="s-897d74 gen-sized">
                <thead><tr class="s-bfd0ae"><th>Group</th><th>nⱼ</th><th>Rⱼ (Sum of Ranks)</th><th>Rⱼ²</th><th>Rⱼ²/nⱼ</th></tr></thead>
                <tbody>${rankSumRows}</tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 3: Calculate H Statistic</h3>
            <div class="s-6025fc">
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
                H = ${((12 / (N * (N+1))) * rawH).toFixed(4)} - ${3 * (N+1)} = <strong class="s-bbce95">${H.toFixed(6)}</strong>
                
                ${tieCorrectionText}
                
                <div class="s-c803e1">
                    <strong>Degrees of Freedom:</strong> df = k - 1 = ${k} - 1 = ${df}<br>
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}<br>
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>H Statistic:</strong> ${H.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${rejectH0 ? '✓ p-value < α → Reject H₀' : '✗ p-value ≥ α → Cannot reject H₀'}
            </div>
        </div>
    </div>`;
    
    // the chi-square approximation to H is unreliable when a group has fewer than 5 values
    const smallSample = [...groupSizes.values()].some(s => s < 5);
    return { H, df, pValue, criticalValue, rejectH0, smallSample, steps, chart: { dist: 'chisq', df: df, stat: H, alternative: 'greater', alpha: alpha, statLabel: 'H (χ²)', critical: { lower: null, upper: criticalValue } } };
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
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `H = ${result.H.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}${result.smallSample ? ' | ⚠ small groups: chi-square approximation' : ''}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("kruskalResultArea", result.chart);
        }
    });
    
    attachClearHandler("kruskalClearBtn", "kruskalData", "kruskalResultArea");
}
