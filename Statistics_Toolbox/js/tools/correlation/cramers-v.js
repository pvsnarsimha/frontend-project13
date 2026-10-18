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
            pairs.push({ row: parts[0], col: parts[1] });
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
    const observed = {};
    const rowTotals = {};
    const colTotals = {};
    
    for (let row of rowCategories) {
        observed[row] = {};
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
    let observedTableHtml = `<div style="overflow-x: auto; margin-bottom: 25px;">
        <h4 style="color: #1a5490; margin-bottom: 10px;">📊 Observed Frequencies (Oᵢⱼ)</h4>
        <table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 2px solid #1a5490;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Row \\ Column</th>`;
    for (let col of colCategories) {
        observedTableHtml += `<th style="border: 1px solid #ddd; padding: 12px; text-align: center;">${col}</th>`;
    }
    observedTableHtml += `<th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Row Total (Rᵢ)</th>
                </tr></thead><tbody>`;
    
    for (let row of rowCategories) {
        observedTableHtml += `<tr style="border-bottom: 1px solid #ddd;">
            <th style="border: 1px solid #ddd; padding: 10px; background: #e8f4f8; text-align: center;">${row}</th>`;
        for (let col of colCategories) {
            observedTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${observed[row][col]}</td>`;
        }
        observedTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${rowTotals[row]}</td>
        </tr>`;
    }
    
    observedTableHtml += `<tr style="background: #e8f4f8; font-weight: bold;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Column Total (Cⱼ)</th>`;
    for (let col of colCategories) {
        observedTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${colTotals[col]}</td>`;
    }
    observedTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${n}</td>
    <tr></tbody>\\tour</div>`;
    
    // Build Expected Frequencies Table HTML
    let expectedTableHtml = `<div style="overflow-x: auto; margin-bottom: 25px;">
        <h4 style="color: #1a5490; margin-bottom: 10px;">📈 Expected Frequencies (Eᵢⱼ = Rᵢ × Cⱼ / n)</h4>
        <table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 2px solid #1a5490;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Row \\ Column</th>`;
    for (let col of colCategories) {
        expectedTableHtml += `<th style="border: 1px solid #ddd; padding: 12px; text-align: center;">${col}</th>`;
    }
    expectedTableHtml += `<th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Row Total (Rᵢ)</th>
                </tr></thead><tbody>`;
    
    for (let row of rowCategories) {
        expectedTableHtml += `<tr style="border-bottom: 1px solid #ddd;">
            <th style="border: 1px solid #ddd; padding: 10px; background: #e8f4f8; text-align: center;">${row}</th>`;
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / n;
            expectedTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-family: monospace;">${expected.toFixed(4)}</td>`;
        }
        expectedTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${rowTotals[row]}</td>
        </tr>`;
    }
    
    expectedTableHtml += `<tr style="background: #e8f4f8; font-weight: bold;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Column Total (Cⱼ)</th>`;
    for (let col of colCategories) {
        expectedTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${colTotals[col]}</td>`;
    }
    expectedTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${n}</td>
    <tr></tbody>\\tour</div>`;
    
    // Build Chi-Square Contributions Table
    let chiTableHtml = `<div style="overflow-x: auto; margin-bottom: 25px;">
        <h4 style="color: #1a5490; margin-bottom: 10px;">🔢 Chi-Square Contributions ((O-E)²/E)</h4>
        <table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 2px solid #1a5490;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Row \\ Column</th>`;
    for (let col of colCategories) {
        chiTableHtml += `<th style="border: 1px solid #ddd; padding: 12px; text-align: center;">${col}</th>`;
    }
    chiTableHtml += `<th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Formula</th>
                </tr></thead><tbody>`;
    
    for (let row of rowCategories) {
        chiTableHtml += `<tr style="border-bottom: 1px solid #ddd;">
            <th style="border: 1px solid #ddd; padding: 10px; background: #e8f4f8; text-align: center;">${row}</th>`;
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / n;
            const observedVal = observed[row][col];
            const contribution = Math.pow(observedVal - expected, 2) / expected;
            chiSquare += contribution;
            chiDetails.push({ row, col, observed: observedVal, expected, contribution });
            chiTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-family: monospace; font-weight: bold; ${contribution > 2 ? 'background: #fff3cd;' : ''}">${contribution.toFixed(4)}</td>`;
        }
        chiTableHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 11px; font-family: monospace;">—</td>
        </tr>`;
    }
    
    chiTableHtml += `</tbody>\\tour</div>`;
    
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
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">V</span>
                <h2 style="margin: 0;">Cramér's V</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: V = √[χ² / (n × min(k-1, r-1))]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Range: 0 (no association) to 1 (perfect association) | Measures association between categorical variables</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center; border-left: 4px solid #1a5490;">
                    <div style="font-size: 12px; color: #6c757d;">Total Observations (n)</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Row Categories (r)</div>
                    <div style="font-size: 28px; font-weight: 700;">${r}</div>
                    <div style="font-size: 11px;">${rowCategories.join(', ')}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center; border-left: 4px solid #dc3545;">
                    <div style="font-size: 12px; color: #6c757d;">Column Categories (c)</div>
                    <div style="font-size: 28px; font-weight: 700;">${c}</div>
                    <div style="font-size: 11px;">${colCategories.join(', ')}</div>
                </div>
            </div>
            
            ${observedTableHtml}
            ${expectedTableHtml}
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Chi-Square (χ²)</h3>
            
            ${chiTableHtml}
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-top: 15px;">
                <div style="font-family: monospace; font-size: 14px;">
                    <strong>Formula:</strong> χ² = Σ [(Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ]<br><br>
                    <strong>Detailed calculations for each cell:</strong><br>`;
    
    for (let detail of chiDetails) {
        steps += `<div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 6px;">
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
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate Cramér's V</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula:</strong> V = √[χ² / (n × min(r-1, c-1))]<br><br>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                        n = ${n}<br>
                        r-1 = ${r-1}<br>
                        c-1 = ${c-1}
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                        min(r-1, c-1) = min(${r-1}, ${c-1}) = ${minDim}<br>
                        Denominator = n × minDim = ${n} × ${minDim} = ${n * minDim}
                    </div>
                </div>
                χ² / Denominator = ${chiSquare.toFixed(6)} / ${n * minDim} = ${(chiSquare / (n * minDim)).toFixed(6)}<br>
                <div style="font-size: 24px; font-weight: 700; color: #1a5490; text-align: center; padding: 15px; background: #e8f4f8; border-radius: 12px; margin-top: 15px;">
                    V = √${(chiSquare / (n * minDim)).toFixed(6)} = ${cramersV.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: ${strengthColor}20; border-left: 6px solid ${strengthColor};">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Cramér's V:</strong> ${cramersV.toFixed(6)}</div>
                <div><strong>Interpretation:</strong> <span style="color: ${strengthColor}; font-weight: bold;">${interpretation}</span></div>
                <div><strong>Degrees of Freedom for χ²:</strong> (${r}-1) × (${c}-1) = ${(r-1)*(c-1)}</div>
                <div><strong>Chi-Square p-value:</strong> ${(1 - chiSquareCDF(chiSquare, (r-1)*(c-1))).toFixed(6)}</div>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
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
