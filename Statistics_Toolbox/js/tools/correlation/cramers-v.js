/* CramersV: cramersv tool (render, compute, setup) */

// ========== CRAMÉR'S V INTERFACE RENDER ==========
function renderCramersVInterface() {
    return buildInterface({
        id: "statCramersVInterface",
        title: "V Cramér's V (Association for Categorical Variables)",
        formula: "📌 V = √[χ² / (n × min(k-1, r-1))]",
        desc: "Measures association between two categorical variables. Range: 0 (no association) to 1 (perfect association). Works for contingency tables of any size.",
        inputs: [
            {
                label: "📋 Enter data as comma-separated pairs (category1, category2):",
                textarea: {
                    id: "cramersvData",
                    rows: "5",
                    placeholder: "Example:&#10;Red, Apple&#10;Green, Apple&#10;Red, Orange&#10;Red, Apple&#10;Green, Orange&#10;Red, Orange&#10;Blue, Apple&#10;Blue, Orange"
                }
            },
            {
                hint: "Each line: value for Row Variable, value for Column Variable",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "cramersvComputeBtn", text: "V Calculate Cramér's V + Full Steps" },
        clear: { id: "cramersvClearBtn", text: "Clear" },
        result: {
            area: "cramersvResultArea",
            label: "🎯 CRAMÉR'S V RESULT",
            value: "cramersvValueDisplay",
            steps: "cramersvStepsDisplay"
        }
    });
}

// ========== CRAMÉR'S V COMPUTATION ==========
function computeCramersVWithSteps(inputText) {
    const lines = inputText.trim().split(/\r?\n/);
    const pairs = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 2) {
            pairs.push({ row: escapeHtml(parts[0]), col: escapeHtml(parts[1]) });      // category labels reach the HTML steps, so they are escaped once, here (as in the chi-square tool)
        }
    }
    
    if (pairs.length === 0) {
        return { error: true, message: "No valid data pairs entered." };
    }
    
    // Get unique row and column categories
    const rowCategories = [...new Set(pairs.map(p => p.row))].sort();
    const colCategories = [...new Set(pairs.map(p => p.col))].sort();
    
    const r = rowCategories.length;
    const c = colCategories.length;
    const n = pairs.length;
    
    // Create contingency table
    const observed = Object.create(null);
    const rowTotals = Object.create(null);
    const colTotals = Object.create(null);
    
    for (let row of rowCategories) {
        observed[row] = Object.create(null);
        rowTotals[row] = 0;
        for (let col of colCategories) {
            observed[row][col] = 0;
        }
    }
    for (let col of colCategories) {
        colTotals[col] = 0;
    }
    
    for (let pair of pairs) {
        observed[pair.row][pair.col]++;
        rowTotals[pair.row]++;
        colTotals[pair.col]++;
    }
    
    // Calculate Chi-Square with detailed table
    let chiSquare = 0;
    let chiDetails = [];
    
    // Build Observed Frequencies Table HTML
    let observedTableHtml = `<div class="s-360d05">
        <h4 class="s-6d5ef8">📊 Observed Frequencies (Oᵢⱼ)</h4>
        <table class="s-bc0646 gen-sized">
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-bf5c59">Row \\ Column</th>`;
    for (let col of colCategories) {
        observedTableHtml += `<th class="s-bf5c59">${col}</th>`;
    }
    observedTableHtml += `<th class="s-bf5c59">Row Total (Rᵢ)</th>
                </tr></thead><tbody>`;
    
    for (let row of rowCategories) {
        observedTableHtml += `<tr class="s-e467f0">
            <th class="s-6ab135">${row}</th>`;
        for (let col of colCategories) {
            observedTableHtml += `<td class="s-b31d4f">${observed[row][col]}</td>`;
        }
        observedTableHtml += `<td class="s-b4a640">${rowTotals[row]}</td>
        </tr>`;
    }
    
    observedTableHtml += `<tr class="s-5c058b">
        <th class="s-fa9d1c">Column Total (Cⱼ)</th>`;
    for (let col of colCategories) {
        observedTableHtml += `<td class="s-b31d4f">${colTotals[col]}</td>`;
    }
    observedTableHtml += `<td class="s-b31d4f">${n}</td>
    </tr></tbody></table></div>`;
    
    // Build Expected Frequencies Table HTML
    let expectedTableHtml = `<div class="s-360d05">
        <h4 class="s-6d5ef8">📈 Expected Frequencies (Eᵢⱼ = Rᵢ × Cⱼ / n)</h4>
        <table class="s-bc0646 gen-sized">
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-bf5c59">Row \\ Column</th>`;
    for (let col of colCategories) {
        expectedTableHtml += `<th class="s-bf5c59">${col}</th>`;
    }
    expectedTableHtml += `<th class="s-bf5c59">Row Total (Rᵢ)</th>
                </tr></thead><tbody>`;
    
    for (let row of rowCategories) {
        expectedTableHtml += `<tr class="s-e467f0">
            <th class="s-6ab135">${row}</th>`;
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / n;
            expectedTableHtml += `<td class="s-47c600">${expected.toFixed(4)}</td>`;
        }
        expectedTableHtml += `<td class="s-b4a640">${rowTotals[row]}</td>
        </tr>`;
    }
    
    expectedTableHtml += `<tr class="s-5c058b">
        <th class="s-fa9d1c">Column Total (Cⱼ)</th>`;
    for (let col of colCategories) {
        expectedTableHtml += `<td class="s-b31d4f">${colTotals[col]}</td>`;
    }
    expectedTableHtml += `<td class="s-b31d4f">${n}</td>
    </tr></tbody></table></div>`;
    
    // Build Chi-Square Contributions Table
    let chiTableHtml = `<div class="s-360d05">
        <h4 class="s-6d5ef8">🔢 Chi-Square Contributions ((O-E)²/E)</h4>
        <table class="s-bc0646 gen-sized">
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-bf5c59">Row \\ Column</th>`;
    for (let col of colCategories) {
        chiTableHtml += `<th class="s-bf5c59">${col}</th>`;
    }
    chiTableHtml += `<th class="s-bf5c59">Formula</th>
                </tr></thead><tbody>`;
    
    for (let row of rowCategories) {
        chiTableHtml += `<tr class="s-e467f0">
            <th class="s-6ab135">${row}</th>`;
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / n;
            const observedVal = observed[row][col];
            const contribution = Math.pow(observedVal - expected, 2) / expected;
            chiSquare += contribution;
            chiDetails.push({ row, col, observed: observedVal, expected, contribution });
            chiTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-family: monospace; font-weight: bold; ${contribution > 2 ? 'background: #fff3cd;' : ''}">${contribution.toFixed(4)}</td>`;
        }
        chiTableHtml += `<td class="s-dddec9">—</td>
        </tr>`;
    }
    
    chiTableHtml += `</tbody></table></div>`;
    
    // Calculate Cramér's V
    const minDim = Math.min(r - 1, c - 1);
    let cramersV = 0;
    if (minDim > 0 && n > 0) {
        cramersV = Math.sqrt(chiSquare / (n * minDim));
    }
    
    // Interpret Cramér's V
    let interpretation = "";
    let strengthColor = "";
    if (cramersV < 0.1) { interpretation = "Very weak association"; strengthColor = "#dc3545"; }
    else if (cramersV < 0.3) { interpretation = "Weak association"; strengthColor = "#ffc107"; }
    else if (cramersV < 0.5) { interpretation = "Moderate association"; strengthColor = "#17a2b8"; }
    else if (cramersV < 0.7) { interpretation = "Strong association"; strengthColor = "#28a745"; }
    else { interpretation = "Very strong association"; strengthColor = "#28a745"; }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">V</span>
                <h2 class="s-f8a94d">Cramér's V</h2>
            </div>
            <p class="s-259079">Formula: V = √[χ² / (n × min(k-1, r-1))]</p>
            <p class="s-20a400">Range: 0 (no association) to 1 (perfect association) | Measures association between categorical variables</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-17247c gen-grid gen-grid-many">
                <div class="s-778100">
                    <div class="s-42da0a">Total Observations (n)</div>
                    <div class="s-93c0a8">${n}</div>
                </div>
                <div class="s-6c9323">
                    <div class="s-42da0a">Row Categories (r)</div>
                    <div class="s-93c0a8">${r}</div>
                    <div class="s-d52d0d">${rowCategories.join(', ')}</div>
                </div>
                <div class="s-d8cc27">
                    <div class="s-42da0a">Column Categories (c)</div>
                    <div class="s-93c0a8">${c}</div>
                    <div class="s-d52d0d">${colCategories.join(', ')}</div>
                </div>
            </div>
            
            ${observedTableHtml}
            ${expectedTableHtml}
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 2: Calculate Chi-Square (χ²)</h3>
            
            ${chiTableHtml}
            
            <div class="s-223f9e">
                <div class="s-4b0e48">
                    <strong>Formula:</strong> χ² = Σ [(Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ]<br><br>
                    <strong>Detailed calculations for each cell:</strong><br>`;
    
    for (let detail of chiDetails) {
        steps += `<div class="s-150395">
            Cell(${detail.row}, ${detail.col}):<br>
            &nbsp;&nbsp;O = ${detail.observed}, E = (${rowTotals[detail.row]} × ${colTotals[detail.col]})/${n} = ${detail.expected.toFixed(4)}<br>
            &nbsp;&nbsp;(O - E)² = (${detail.observed} - ${detail.expected.toFixed(4)})² = ${Math.pow(detail.observed - detail.expected, 2).toFixed(4)}<br>
            &nbsp;&nbsp;Contribution = ${Math.pow(detail.observed - detail.expected, 2).toFixed(4)} / ${detail.expected.toFixed(4)} = <strong>${detail.contribution.toFixed(6)}</strong>
        </div>`;
    }
    
    steps += `<br><strong>χ² = Σ Contributions = ${chiSquare.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 3: Calculate Cramér's V</h3>
            <div class="s-6025fc">
                <strong>Formula:</strong> V = √[χ² / (n × min(r-1, c-1))]<br><br>
                <div class="s-134fcb gen-grid">
                    <div class="s-991721">
                        n = ${n}<br>
                        r-1 = ${r-1}<br>
                        c-1 = ${c-1}
                    </div>
                    <div class="s-991721">
                        min(r-1, c-1) = min(${r-1}, ${c-1}) = ${minDim}<br>
                        Denominator = n × minDim = ${n} × ${minDim} = ${n * minDim}
                    </div>
                </div>
                χ² / Denominator = ${chiSquare.toFixed(6)} / ${n * minDim} = ${(chiSquare / (n * minDim)).toFixed(6)}<br>
                <div class="s-70e2ab">
                    V = √${(chiSquare / (n * minDim)).toFixed(6)} = ${cramersV.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: ${strengthColor}20; border-left: 6px solid ${strengthColor};">
            <h3 class="s-c7f0b4">📌 Interpretation</h3>
            <div class="s-45b8b7">
                <div><strong>Cramér's V:</strong> ${cramersV.toFixed(6)}</div>
                <div><strong>Interpretation:</strong> <span style="color: ${textSafeColor(strengthColor)}; font-weight: bold;">${interpretation}</span></div>
                <div><strong>Degrees of Freedom for χ²:</strong> (${r}-1) × (${c}-1) = ${(r-1)*(c-1)}</div>
                <div><strong>Chi-Square p-value:</strong> ${(1 - chiSquareCDF(chiSquare, (r-1)*(c-1))).toFixed(6)}</div>
                <div class="s-8d2e44">
                    💡 <strong>What Cramér's V tells us:</strong><br>
                    • V = 0 → No association between the variables<br>
                    • V = 1 → Perfect association (each row category predicts the column category)<br>
                    • Higher V = Stronger relationship between categorical variables
                </div>
            </div>
        </div>
    </div>`;
    
    return { cramersV, chiSquare, n, r, c, steps };
}

// ========== CRAMÉR'S V SETUP ==========
function setupCramersVLogic() {
    const computeBtn = document.getElementById("cramersvComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("cramersvData").value;
        const resultDiv = document.getElementById("cramersvResultArea");
        const valueSpan = document.getElementById("cramersvValueDisplay");
        const stepsSpan = document.getElementById("cramersvStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Enter data pairs (category1, category2)");
            return;
        }
        
        const result = computeCramersVWithSteps(raw);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `V = ${result.cramersV.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("cramersvClearBtn", "cramersvData", "cramersvResultArea");
}
