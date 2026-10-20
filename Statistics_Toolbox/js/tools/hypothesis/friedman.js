/* Friedman: friedman tool (render, compute, setup) */

// ========== FRIEDMAN TEST INTERFACE RENDER ==========
function renderFriedmanInterface() {
    return buildInterface({
        id: "statFriedmanInterface",
        title: "χ² Friedman Test (Non-parametric Repeated Measures)",
        formula: "📌 χ² = (12 / (nk(k+1))) × Σ Rⱼ² - 3n(k+1)",
        desc: "Non-parametric alternative to repeated measures ANOVA. Tests for differences across multiple related groups.",
        inputs: [
            {
                label: "📋 Enter data (each row = subject, each column = condition):",
                textarea: {
                    id: "friedmanData",
                    rows: "5",
                    placeholder: "Example (each row is a subject):&#10;5, 6, 7, 8&#10;4, 5, 6, 7&#10;6, 7, 8, 9&#10;5, 5, 6, 7&#10;7, 8, 9, 10"
                }
            },
            {
                hint: "<strong>Format:</strong> Comma-separated values per row (each row = one subject, each column = one condition/time point)",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "friedmanAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "friedmanComputeBtn", text: "χ² Run Friedman Test + Full Steps" },
        clear: { id: "friedmanClearBtn", text: "Clear" },
        result: {
            area: "friedmanResultArea",
            label: "🎯 FRIEDMAN TEST RESULTS",
            value: "friedmanValueDisplay",
            steps: "friedmanStepsDisplay"
        }
    });
}

// ========== FRIEDMAN TEST COMPUTATION ==========
// ========== FRIEDMAN TEST COMPUTATION ==========
function computeFriedmanTest(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        let values = parseNumbersFromInput(line);
        if (values.length > 0) data.push(values);
    }
    
    if (data.length < 3) {
        return { error: true, message: "Need at least 3 subjects (rows) for Friedman test." };
    }
    
    const n = data.length; // number of subjects
    const k = data[0].length; // number of conditions
    
    // Check all rows have same number of columns
    for (let row of data) {
        if (row.length !== k) {
            return { error: true, message: "All rows must have the same number of values." };
        }
    }
    
    if (k < 2) {
        return { error: true, message: "Need at least 2 conditions (columns) for Friedman test." };
    }
    
    // Rank within each row
    let tieTerm = 0;   // Σ(t³ - t) over every group of t tied values within a subject, for the tie correction
    let ranks = [];
    let rankingDetails = [];
    
    for (let i = 0; i < n; i++) {
        let rowRanks = [];
        let rowData = data[i].map((val, idx) => ({ value: val, col: idx }));
        rowData.sort((a, b) => a.value - b.value);
        
        // Assign ranks (handle ties within row)
        let j = 0;
        while (j < rowData.length) {
            let l = j;
            while (l < rowData.length && rowData[l].value === rowData[j].value) l++;
            let avgRank = (j + 1 + l) / 2;
            for (let m = j; m < l; m++) rowData[m].rank = avgRank;
            tieTerm += Math.pow(l - j, 3) - (l - j);
            j = l;
        }
        
        rowRanks = new Array(k);
        for (let item of rowData) rowRanks[item.col] = item.rank;
        ranks.push(rowRanks);
        
        // Store ranking details for display
        rankingDetails.push({
            subject: i + 1,
            values: data[i],
            ranks: rowRanks
        });
    }
    
    // Calculate column rank sums
    let colRankSums = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < k; j++) {
            colRankSums[j] += ranks[i][j];
        }
    }
    
    // Calculate Friedman statistic
    let sumRjSquared = colRankSums.reduce((sum, Rj) => sum + Math.pow(Rj, 2), 0);
    let chiSqUncorrected = (12 / (n * k * (k + 1))) * sumRjSquared - 3 * n * (k + 1);
    // Tie correction: divide by C = 1 - Σ(t³ - t) / (n k (k² - 1)); C = 1 when there are no ties
    const tieCorrection = 1 - tieTerm / (n * k * (k * k - 1));
    if (tieCorrection <= 0) {
        return { error: true, message: "Every subject has all values tied, so the Friedman statistic is undefined." };
    }
    let chiSq = chiSqUncorrected / tieCorrection;
    
    const df = k - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(chiSq, df);
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        "There IS sufficient evidence that at least one condition differs from others." :
        "There is NOT sufficient evidence that the conditions differ.";
    
    // Build ranking table for each subject
    let rankingRows = '';
    for (let item of rankingDetails) {
        rankingRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${item.subject}</td>`;
        for (let j = 0; j < k; j++) {
            rankingRows += `<td class="s-a7c3f4">${item.values[j]} → Rank ${item.ranks[j]}</td>`;
        }
        rankingRows += `</tr>`;
    }
    
    // Build column rank sums table
    let colSumRows = '';
    for (let j = 0; j < k; j++) {
        colSumRows += `<tr>
            <td class="s-a7c3f4">Condition ${j + 1}</td>
            <td class="s-a7c3f4">${colRankSums[j].toFixed(2)}</td>
            <td class="s-a7c3f4">${Math.pow(colRankSums[j], 2).toFixed(2)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">χ²</span>
                <h2 class="s-f8a94d">Friedman Test</h2>
            </div>
            <p class="s-259079">Non-parametric alternative to repeated measures ANOVA</p>
            <p class="s-20a400">H₀: All conditions have the same distribution | H₁: At least one condition differs</p>
        </div>
        
        <!-- Formula Explanation Section -->
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📖 Understanding the Friedman Test Formula</h3>
            <div class="s-6025fc">
                <div class="s-da7e8e">
                    <strong>χ² = (12 / [n × k × (k+1)]) × Σ(Rⱼ²) - 3n(k+1)</strong>
                </div>
                
                <div class="s-800734 gen-grid">
                    <div class="s-b93f03">
                        <strong>📊 Variables:</strong><br>
                        • <strong>n</strong> = Number of subjects (rows)<br>
                        • <strong>k</strong> = Number of conditions (columns)<br>
                        • <strong>Rⱼ</strong> = Sum of ranks for condition j<br>
                        • <strong>Σ(Rⱼ²)</strong> = Sum of squared column rank sums
                    </div>
                    <div class="s-b93f03">
                        <strong>🔢 Step-by-Step:</strong><br>
                        1. Rank values WITHIN each subject (row)<br>
                        2. Sum ranks for each condition (column): Rⱼ<br>
                        3. Square each Rⱼ and sum: Σ(Rⱼ²)<br>
                        4. Apply the formula to get χ²
                    </div>
                </div>
                
                <div class="s-319ae0">
                    <strong>💡 Intuition:</strong> If conditions are similar, ranks will be evenly distributed across columns → χ² is small.<br>
                    If conditions differ, ranks will cluster in certain columns → χ² is large.
                </div>
                
                <div class="s-edac2c">
                    <strong>⚠️ Important:</strong> The Friedman test ranks WITHIN each row separately!<br>
                    For each subject, the smallest value gets rank 1, next gets rank 2, etc.<br>
                    This removes subject-to-subject variability.
                </div>
            </div>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-9f129a gen-grid gen-grid-many">
                <div class="s-46421d">
                    <div class="s-42da0a">Subjects (n)</div>
                    <div class="s-b3bc14 gen-big">${n}</div>
                    <div class="s-d52d0d">Number of rows</div>
                </div>
                <div class="s-46421d">
                    <div class="s-42da0a">Conditions (k)</div>
                    <div class="s-b3bc14 gen-big">${k}</div>
                    <div class="s-d52d0d">Number of columns</div>
                </div>
                <div class="s-46421d">
                    <div class="s-42da0a">Total Observations</div>
                    <div class="s-b3bc14 gen-big">${n * k}</div>
                    <div class="s-d52d0d">n × k</div>
                </div>
            </div>
        </div>
        
        <div class="s-2311e6">
            <h3 class="s-10bf27">📋 Step 1: Rank Values Within Each Subject (Row)</h3>
            <div class="s-d3acac">
                <strong>How ranking works:</strong> For each subject, the smallest value gets rank 1, next gets rank 2, etc.<br>
                If there are ties, average ranks are assigned.
            </div>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-bfd0ae">
                        <th class="s-a756db">Subject</th>
                        ${Array(k).fill().map((_, i) => `<th class="s-a756db">Condition ${i + 1} (Value → Rank)</th>`).join('')}
                    </tr>
                </thead>
                <tbody>${rankingRows}</tbody>
            </table>
        </div>
        
        <div class="s-2311e6">
            <h3 class="s-10bf27">📋 Step 2: Calculate Column Rank Sums (Rⱼ)</h3>
            <div class="s-d3acac">
                <strong>Formula:</strong> Rⱼ = Sum of ranks in column j (across all subjects)
            </div>
            <table class="s-897d74 gen-sized">
                <thead><tr class="s-bfd0ae"><th>Condition</th><th>Rⱼ (Sum of Ranks)</th><th>Rⱼ²</th></tr></thead>
                <tbody>${colSumRows}
                    <tr class="s-17b154">
                        <td class="s-641001">Σ (Sum) →</td>
                        <td class="s-a7c3f4">${colRankSums.reduce((a,b)=>a+b,0).toFixed(2)}</td>
                        <td class="s-a7c3f4">${sumRjSquared.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="s-4aae2c">
                <strong>✅ Check:</strong> Total sum of all ranks should equal n × k(k+1)/2 = ${n} × ${k}×${k+1}/2 = ${n * k * (k+1) / 2}
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 3: Calculate Friedman χ² Statistic</h3>
            <div class="s-6025fc">
                <strong>Formula:</strong> χ² = (12 / [n × k × (k+1)]) × Σ(Rⱼ²) - 3n(k+1)<br><br>
                
                <strong>Step 3a: Calculate the denominator</strong><br>
                n × k × (k+1) = ${n} × ${k} × ${k+1} = ${n * k * (k+1)}<br>
                12 / [n × k × (k+1)] = 12 / ${n * k * (k+1)} = ${(12 / (n * k * (k+1))).toFixed(6)}<br><br>
                
                <strong>Step 3b: Σ(Rⱼ²) (from Step 2)</strong><br>
                Σ(Rⱼ²) = ${sumRjSquared.toFixed(2)}<br><br>
                
                <strong>Step 3c: Multiply</strong><br>
                ${(12 / (n * k * (k+1))).toFixed(6)} × ${sumRjSquared.toFixed(2)} = ${((12 / (n * k * (k+1))) * sumRjSquared).toFixed(4)}<br><br>
                
                <strong>Step 3d: Calculate 3n(k+1)</strong><br>
                3n(k+1) = 3 × ${n} × ${k+1} = ${3 * n * (k+1)}<br><br>
                
                <strong>Step 3e: Final χ²</strong><br>
                χ² = ${((12 / (n * k * (k+1))) * sumRjSquared).toFixed(4)} - ${3 * n * (k+1)} = ${chiSqUncorrected.toFixed(6)}${tieTerm > 0 ? `<br><br>Ties present → divide by C = 1 - Σ(t³ - t) / [n·k·(k²-1)] = 1 - ${tieTerm} / ${n * k * (k * k - 1)} = ${tieCorrection.toFixed(6)}<br>Corrected χ² = ${chiSqUncorrected.toFixed(6)} / ${tieCorrection.toFixed(6)} = ` : ' = '}<strong class="s-bbce95">${chiSq.toFixed(6)}</strong>
                
                <div class="s-c803e1">
                    <strong>Degrees of Freedom:</strong> df = k - 1 = ${k} - 1 = ${df}<br>
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}<br>
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>χ² Statistic:</strong> ${chiSq.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${rejectH0 ? '✓ p-value < α → Reject H₀, conditions differ significantly' : '✗ p-value ≥ α → Cannot reject H₀, conditions are similar'}
                ${pValue < alpha ? '✓ p-value < α → Statistically significant' : '✗ p-value > α → Not statistically significant'}
            </div>
        </div>
        
        <div class="s-afe18c">
            <strong>📚 Summary of Friedman Test:</strong><br><br>
            • <strong>What it does:</strong> Tests if multiple related groups (conditions) have the same distribution<br>
            • <strong>When to use:</strong> Repeated measures design with ordinal data or violated normality assumption<br>
            • <strong>How it works:</strong> Ranks values within each subject, then compares rank sums across conditions<br>
            • <strong>Null hypothesis:</strong> All conditions have the same median<br>
            • <strong>Alternative hypothesis:</strong> At least one condition differs
        </div>
    </div>`;
    
    return { chiSq, df, pValue, criticalValue, rejectH0, steps, chart: { dist: 'chisq', df: df, stat: chiSq, alternative: 'greater', alpha: alpha, statLabel: 'χ²', critical: { lower: null, upper: criticalValue } } };
}

// ========== FRIEDMAN SETUP ==========
function setupFriedmanLogic() {
    const computeBtn = document.getElementById("friedmanComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("friedmanData").value;
        const alpha = parseFloat(document.getElementById("friedmanAlpha").value);
        const resultDiv = document.getElementById("friedmanResultArea");
        const valueSpan = document.getElementById("friedmanValueDisplay");
        const stepsSpan = document.getElementById("friedmanStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data (each row = subject, values comma-separated)");
            return;
        }
        
        const result = computeFriedmanTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSq.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("friedmanResultArea", result.chart);
        }
    });
    
    attachClearHandler("friedmanClearBtn", "friedmanData", "friedmanResultArea");
}
