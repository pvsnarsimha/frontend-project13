/* CochranQ: cochranq tool (render, compute, setup) */

// ========== COCHRAN'S Q TEST INTERFACE ==========
function renderCochranQInterface() {
    return buildInterface({
        id: "statCochranQInterface",
        title: "🔬 Cochran's Q Test",
        formula: "📌 Q = (k(k-1) × Σ(Cⱼ - C̄)²) / (k × ΣRᵢ - ΣRᵢ²)",
        desc: "<strong>What is Cochran's Q Test?</strong><br>\n                    Extension of McNemar's test for 3+ related groups. Tests if multiple \n                    matched/binary outcomes have the same proportion of \"successes\".\n                    <br><br>\n                    <strong>H₀:</strong> All treatments have the same effect<br>\n                    <strong>H₁:</strong> At least one treatment differs",
        inputs: [
            {
                label: "📋 Enter data (each row = subject, each column = treatment, 0/1 values):",
                textarea: {
                    id: "cochranData",
                    rows: "6",
                    placeholder: "Example (subjects × treatments):&#10;1, 1, 0&#10;1, 0, 0&#10;0, 1, 1&#10;1, 1, 1&#10;0, 0, 1"
                }
            },
            {
                hint: "<strong>Format:</strong> Each row is one subject. Each column is one treatment/time point.<br>\n                    Values must be <strong>0 or 1</strong> (binary outcomes).",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "cochranAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "cochranComputeBtn", text: "🔬 Run Cochran's Q Test + Full Steps" },
        clear: { id: "cochranClearBtn", text: "Clear" },
        result: {
            area: "cochranResultArea",
            label: "🎯 COCHRAN'S Q TEST RESULTS",
            value: "cochranValueDisplay",
            steps: "cochranStepsDisplay"
        }
    });
}

// ========== COCHRAN'S Q TEST COMPUTATION ==========
function computeCochranQTest(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    for (let r = 0; r < lines.length; r++) {
        const line = lines[r].trim();
        if (line === "") continue;
        let values = parseNumbersFromInput(line);
        if (values.length > 0) {
            // Every value must be 0 or 1: reject the input (naming the row) instead of silently dropping the row
            if (values.some(val => val !== 0 && val !== 1)) {
                return { error: true, message: `Row ${r + 1} ("${escapeHtml(line)}") contains a value other than 0 or 1. Cochran's Q needs binary data (0 = failure, 1 = success) in every row.` };
            }
            data.push(values);
        }
    }
    
    if (data.length < 3) {
        return { error: true, message: "Need at least 3 subjects (rows) for Cochran's Q test." };
    }
    
    const n = data.length; // number of subjects
    const k = data[0].length; // number of treatments
    
    if (k < 3) {
        return { error: true, message: "Need at least 3 treatments (columns) for Cochran's Q test." };
    }
    
    // Check all rows have same number of columns
    for (let row of data) {
        if (row.length !== k) {
            return { error: true, message: "All rows must have the same number of treatments." };
        }
    }
    
    // Calculate column totals (Cⱼ)
    let colTotals = Array(k).fill(0);
    for (let j = 0; j < k; j++) {
        for (let i = 0; i < n; i++) {
            colTotals[j] += data[i][j];
        }
    }
    
    // Calculate row totals (Rᵢ)
    let rowTotals = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < k; j++) {
            rowTotals[i] += data[i][j];
        }
    }
    
    // Calculate Cochran's Q statistic
    let sumColTotals = colTotals.reduce((a,b) => a+b, 0);
    let sumColSquares = colTotals.reduce((a,b) => a + b*b, 0);
    let sumRowTotals = rowTotals.reduce((a,b) => a+b, 0);
    let sumRowSquares = rowTotals.reduce((a,b) => a + b*b, 0);
    
    let numerator = k * (k - 1) * sumColSquares - (k - 1) * sumColTotals * sumColTotals;
    let denominator = k * sumRowTotals - sumRowSquares;
    let Q = numerator / denominator;
    
    const df = k - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(Q, df);
    const rejectH0 = pValue < alpha;
    
    // Build data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        dataRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            ${data[i].map(val => `<td style="padding: 8px; text-align: center; font-weight: ${val === 1 ? 'bold' : 'normal'}; color: ${textSafeColor(val === 1 ? '#28a745' : '#6c757d')};">${val}</td>`).join('')}
            <td class="s-f8c27c">${rowTotals[i]}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-6d8291 gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">🔬</span>
                <div>
                    <h1 class="s-b80b8c">Cochran's Q Test</h1>
                    <p class="s-259079">Comparing Multiple Related Binary Outcomes</p>
                </div>
            </div>
        </div>
        
        <div class="s-2f2db9 gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-17247c gen-grid gen-grid-many">
                <div class="s-46421d">
                    <div class="s-137d30">Subjects (n)</div>
                    <div class="s-e35605 gen-big">${n}</div>
                </div>
                <div class="s-46421d">
                    <div class="s-137d30">Treatments (k)</div>
                    <div class="s-e35605 gen-big">${k}</div>
                </div>
                <div class="s-46421d">
                    <div class="s-137d30">Total "Successes"</div>
                    <div class="s-e35605 gen-big">${sumColTotals}</div>
                </div>
            </div>
            
            <div class="s-01a9b9">
                <table class="s-897d74 gen-sized">
                    <thead>
                        <tr class="s-e7b83b">
                            <th class="s-a756db">Subject</th>
                            ${Array(k).fill().map((_, j) => `<th class="s-a756db">Treatment ${j+1}</th>`).join('')}
                            <th class="s-a756db">Row Total (Rᵢ)</th>
                        </tr>
                    </thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
        </div>
        
        <div class="s-4b5ce2 gen-pad">
            <h3 class="s-d163b6">🔢 Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <strong>Step 1: Calculate column totals (Cⱼ)</strong><br>
                ${colTotals.map((c, j) => `C<sub>${j+1}</sub> = ${c}`).join(', ')}<br>
                ΣCⱼ = ${sumColTotals}<br>
                ΣCⱼ² = ${colTotals.map(c => `${c}² = ${c*c}`).join(' + ')} = ${sumColSquares}
            </div>
            
            <div class="s-ca9e5c">
                <strong>Step 2: Calculate row totals (Rᵢ)</strong><br>
                ${rowTotals.map((r, i) => `R<sub>${i+1}</sub> = ${r}`).join(', ')}<br>
                ΣRᵢ = ${sumRowTotals}<br>
                ΣRᵢ² = ${rowTotals.map(r => `${r}² = ${r*r}`).join(' + ')} = ${sumRowSquares}
            </div>
            
            <div class="s-6025fc">
                <strong>Step 3: Calculate Cochran's Q statistic</strong><br>
                Q = [k(k-1) × ΣCⱼ² - (k-1) × (ΣCⱼ)²] / [k × ΣRᵢ - ΣRᵢ²]<br>
                Q = [${k}×${k-1} × ${sumColSquares} - ${k-1} × ${sumColTotals}²] / [${k} × ${sumRowTotals} - ${sumRowSquares}]<br>
                Q = [${k*(k-1)} × ${sumColSquares} - ${k-1} × ${sumColTotals*sumColTotals}] / [${k*sumRowTotals} - ${sumRowSquares}]<br>
                Q = [${k*(k-1)*sumColSquares} - ${(k-1)*sumColTotals*sumColTotals}] / [${k*sumRowTotals} - ${sumRowSquares}]<br>
                Q = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                <strong class="s-bbce95">Q = ${Q.toFixed(6)}</strong>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>Q Statistic:</strong> ${Q.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision rule:</strong> p-value ${rejectH0 ? '<' : '≥'} α (${alpha})<br>
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Conclusion:</strong> ${rejectH0 ? 'There IS sufficient evidence that the treatments have different effects (proportions are not equal).' : 'There is NOT sufficient evidence that the treatments differ in their effects.'}
            </div>
        </div>
    </div>`;
    
    return { Q, df, pValue, criticalValue, rejectH0, steps, chart: { dist: 'chisq', df: df, stat: Q, alternative: 'greater', alpha: alpha, statLabel: 'Q (χ²)', critical: { lower: null, upper: criticalValue } } };
}

// ========== COCHRAN'S Q TEST SETUP ==========
function setupCochranQLogic() {
    const computeBtn = document.getElementById("cochranComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("cochranData").value;
        const alpha = parseFloat(document.getElementById("cochranAlpha").value);
        const resultDiv = document.getElementById("cochranResultArea");
        const valueSpan = document.getElementById("cochranValueDisplay");
        const stepsSpan = document.getElementById("cochranStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data (0/1 values, rows = subjects, columns = treatments).");
            return;
        }
        
        const result = computeCochranQTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `Q = ${result.Q.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("cochranResultArea", result.chart);
        }
    });
    
    attachClearHandler("cochranClearBtn", "cochranData", "cochranResultArea");
}
