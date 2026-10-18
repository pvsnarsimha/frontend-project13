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
        rankingRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${item.subject}</td>`;
        for (let j = 0; j < k; j++) {
            rankingRows += `<td style="padding: 8px; text-align: center;">${item.values[j]} → Rank ${item.ranks[j]}</td>`;
        }
        rankingRows += `</tr>`;
    }
    
    // Build column rank sums table
    let colSumRows = '';
    for (let j = 0; j < k; j++) {
        colSumRows += `<tr>
            <td style="padding: 8px; text-align: center;">Condition ${j + 1}</td>
            <td style="padding: 8px; text-align: center;">${colRankSums[j].toFixed(2)}</td>
            <td style="padding: 8px; text-align: center;">${Math.pow(colRankSums[j], 2).toFixed(2)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">χ²</span>
                <h2 style="margin: 0;">Friedman Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Non-parametric alternative to repeated measures ANOVA</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: All conditions have the same distribution | H₁: At least one condition differs</p>
        </div>
        
        <!-- Formula Explanation Section -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📖 Understanding the Friedman Test Formula</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin-bottom: 20px;">
                    <strong>χ² = (12 / [n × k × (k+1)]) × Σ(Rⱼ²) - 3n(k+1)</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: #e8f4f8; padding: 12px; border-radius: 8px;">
                        <strong>📊 Variables:</strong><br>
                        • <strong>n</strong> = Number of subjects (rows)<br>
                        • <strong>k</strong> = Number of conditions (columns)<br>
                        • <strong>Rⱼ</strong> = Sum of ranks for condition j<br>
                        • <strong>Σ(Rⱼ²)</strong> = Sum of squared column rank sums
                    </div>
                    <div style="background: #e8f4f8; padding: 12px; border-radius: 8px;">
                        <strong>🔢 Step-by-Step:</strong><br>
                        1. Rank values WITHIN each subject (row)<br>
                        2. Sum ranks for each condition (column): Rⱼ<br>
                        3. Square each Rⱼ and sum: Σ(Rⱼ²)<br>
                        4. Apply the formula to get χ²
                    </div>
                </div>
                
                <div style="margin-top: 16px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    <strong>💡 Intuition:</strong> If conditions are similar, ranks will be evenly distributed across columns → χ² is small.<br>
                    If conditions differ, ranks will cluster in certain columns → χ² is large.
                </div>
                
                <div style="margin-top: 16px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    <strong>⚠️ Important:</strong> The Friedman test ranks WITHIN each row separately!<br>
                    For each subject, the smallest value gets rank 1, next gets rank 2, etc.<br>
                    This removes subject-to-subject variability.
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: #6c757d;">Subjects (n)</div>
                    <div style="font-size: 32px; font-weight: bold;">${n}</div>
                    <div style="font-size: 11px;">Number of rows</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: #6c757d;">Conditions (k)</div>
                    <div style="font-size: 32px; font-weight: bold;">${k}</div>
                    <div style="font-size: 11px;">Number of columns</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; color: #6c757d;">Total Observations</div>
                    <div style="font-size: 32px; font-weight: bold;">${n * k}</div>
                    <div style="font-size: 11px;">n × k</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Rank Values Within Each Subject (Row)</h3>
            <div style="padding: 12px; background: #e8f4f8; font-size: 13px;">
                <strong>How ranking works:</strong> For each subject, the smallest value gets rank 1, next gets rank 2, etc.<br>
                If there are ties, average ranks are assigned.
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 10px;">Subject</th>
                        ${Array(k).fill().map((_, i) => `<th style="padding: 10px;">Condition ${i + 1} (Value → Rank)</th>`).join('')}
                    </tr>
                </thead>
                <tbody>${rankingRows}</tbody>
            </table>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 2: Calculate Column Rank Sums (Rⱼ)</h3>
            <div style="padding: 12px; background: #e8f4f8; font-size: 13px;">
                <strong>Formula:</strong> Rⱼ = Sum of ranks in column j (across all subjects)
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;"><th>Condition</th><th>Rⱼ (Sum of Ranks)</th><th>Rⱼ²</th></tr></thead>
                <tbody>${colSumRows}
                    <tr style="background: #e9ecef; font-weight: bold;">
                        <td style="padding: 8px;">Σ (Sum) →</td>
                        <td style="padding: 8px; text-align: center;">${colRankSums.reduce((a,b)=>a+b,0).toFixed(2)}</td>
                        <td style="padding: 8px; text-align: center;">${sumRjSquared.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            <div style="padding: 12px; background: #d4edda; font-size: 13px; margin-top: 8px;">
                <strong>✅ Check:</strong> Total sum of all ranks should equal n × k(k+1)/2 = ${n} × ${k}×${k+1}/2 = ${n * k * (k+1) / 2}
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate Friedman χ² Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
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
                χ² = ${((12 / (n * k * (k+1))) * sumRjSquared).toFixed(4)} - ${3 * n * (k+1)} = ${chiSqUncorrected.toFixed(6)}${tieTerm > 0 ? `<br><br>Ties present → divide by C = 1 - Σ(t³ - t) / [n·k·(k²-1)] = 1 - ${tieTerm} / ${n * k * (k * k - 1)} = ${tieCorrection.toFixed(6)}<br>Corrected χ² = ${chiSqUncorrected.toFixed(6)} / ${tieCorrection.toFixed(6)} = ` : ' = '}<strong style="color: #1a5490; font-size: 18px;">${chiSq.toFixed(6)}</strong>
                
                <div style="margin-top: 16px;">
                    <strong>Degrees of Freedom:</strong> df = k - 1 = ${k} - 1 = ${df}<br>
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}<br>
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>χ² Statistic:</strong> ${chiSq.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value:</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${rejectH0 ? '✓ χ² > Critical value → Reject H₀, conditions differ significantly' : '✗ χ² < Critical value → Cannot reject H₀, conditions are similar'}
                ${pValue < alpha ? '✓ p-value < α → Statistically significant' : '✗ p-value > α → Not statistically significant'}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            <strong>📚 Summary of Friedman Test:</strong><br><br>
            • <strong>What it does:</strong> Tests if multiple related groups (conditions) have the same distribution<br>
            • <strong>When to use:</strong> Repeated measures design with ordinal data or violated normality assumption<br>
            • <strong>How it works:</strong> Ranks values within each subject, then compares rank sums across conditions<br>
            • <strong>Null hypothesis:</strong> All conditions have the same median<br>
            • <strong>Alternative hypothesis:</strong> At least one condition differs
        </div>
    </div>`;
    
    return { chiSq, df, pValue, criticalValue, rejectH0, steps };
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
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSq.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("friedmanClearBtn", "friedmanData", "friedmanResultArea");
}
