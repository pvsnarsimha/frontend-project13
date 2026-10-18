/* Cramer's V, phi, z-tests, binomial test, linear regression */
// ========== CRAMÉR'S V INTERFACE RENDER ==========
function renderCramersVInterface() {
    return `
        <div class="stat-interface" id="statCramersVInterface">
            <div class="interface-title">V Cramér's V (Association for Categorical Variables)</div>
            <div class="formula-card">
                <div class="formula">📌 V = √[χ² / (n × min(k-1, r-1))]</div>
                <div class="desc">Measures association between two categorical variables. Range: 0 (no association) to 1 (perfect association). Works for contingency tables of any size.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data as comma-separated pairs (category1, category2):</label>
                <textarea id="cramersvData" rows="5" placeholder="Example:&#10;Red, Apple&#10;Green, Apple&#10;Red, Orange&#10;Red, Apple&#10;Green, Orange&#10;Red, Orange&#10;Blue, Apple&#10;Blue, Orange"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">Each line: value for Row Variable, value for Column Variable</div>
                <div class="action-row">
                    <button class="primary-btn" id="cramersvComputeBtn">V Calculate Cramér's V + Full Steps</button>
                    <button class="secondary-btn" id="cramersvClearBtn">Clear</button>
                </div>
            </div>
            <div id="cramersvResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 CRAMÉR'S V RESULT</div>
                    <div class="result-value" id="cramersvValueDisplay">—</div>
                    <div class="calculation-steps" id="cramersvStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== PHI COEFFICIENT INTERFACE RENDER ==========
function renderPhiInterface() {
    return `
        <div class="stat-interface" id="statPhiInterface">
            <div class="interface-title">φ Phi Coefficient (2×2 Binary Association)</div>
            <div class="formula-card">
                <div class="formula">📌 φ = (ad - bc) / √[(a+b)(c+d)(a+c)(b+d)]</div>
                <div class="desc">Measures association between two binary (0/1) variables. Range: -1 to +1. Special case of Pearson correlation for 2×2 tables.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter 2×2 contingency table as 4 comma-separated values (a, b, c, d):</label>
                <textarea id="phiData" rows="3" placeholder="Example: 10, 5, 3, 8&#10;&#10;Where:&#10;a = count where X=0, Y=0&#10;b = count where X=0, Y=1&#10;c = count where X=1, Y=0&#10;d = count where X=1, Y=1"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Table layout:</strong><br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y=0&nbsp;&nbsp;Y=1<br>
                    X=0:&nbsp;&nbsp;&nbsp;a&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b<br>
                    X=1:&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d
                </div>
                <div class="action-row">
                    <button class="primary-btn" id="phiComputeBtn">φ Calculate Phi Coefficient + Full Steps</button>
                    <button class="secondary-btn" id="phiClearBtn">Clear</button>
                </div>
            </div>
            <div id="phiResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 PHI COEFFICIENT RESULT</div>
                    <div class="result-value" id="phiValueDisplay">—</div>
                    <div class="calculation-steps" id="phiStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
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

// ========== PHI COEFFICIENT COMPUTATION ==========
function computePhiWithSteps(inputText) {
    const values = parseNumbersFromInput(inputText);
    
    if (values.length !== 4) {
        return { error: true, message: "Please enter exactly 4 values (a, b, c, d) for the 2×2 contingency table." };
    }
    
    const [a, b, c, d] = values;
    
    // Calculate row and column totals
    const row1Total = a + b;
    const row2Total = c + d;
    const col1Total = a + c;
    const col2Total = b + d;
    const n = a + b + c + d;
    
    // Calculate Phi coefficient
    const numerator = (a * d) - (b * c);
    const denominator = Math.sqrt((a + b) * (c + d) * (a + c) * (b + d));
    let phi = 0;
    if (denominator !== 0) {
        phi = numerator / denominator;
    }
    
    // Interpret Phi
    let interpretation = "";
    if (Math.abs(phi) < 0.1) interpretation = "Very weak association";
    else if (Math.abs(phi) < 0.3) interpretation = "Weak association";
    else if (Math.abs(phi) < 0.5) interpretation = "Moderate association";
    else if (Math.abs(phi) < 0.7) interpretation = "Strong association";
    else interpretation = "Very strong association";
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">φ</span>
                <h2 style="margin: 0;">Phi Coefficient (φ)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: φ = (ad - bc) / √[(a+b)(c+d)(a+c)(b+d)]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Range: -1 to +1 | Measures association between two binary variables</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 2×2 Contingency Table</h3>
            <div style="overflow-x: auto;">
                <table style="border-collapse: collapse; margin: 0 auto;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 12px;"></th>
                            <th style="border: 1px solid #ddd; padding: 12px;">Y = 0</th>
                            <th style="border: 1px solid #ddd; padding: 12px;">Y = 1</th>
                            <th style="border: 1px solid #ddd; padding: 12px;">Row Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">X = 0</th>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">a = ${a}</td>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">b = ${b}</td>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f4f8;">${row1Total}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">X = 1</th>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">c = ${c}</td>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">d = ${d}</td>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f4f8;">${row2Total}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">Column Total</th>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f4f8;">${col1Total}</td>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f4f8;">${col2Total}</td>
                            <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: #e8f4f8;">${n}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate Numerator (ad - bc)</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    ad = ${a} × ${d} = ${a * d}<br>
                    bc = ${b} × ${c} = ${b * c}<br>
                    ad - bc = ${a * d} - ${b * c} = ${numerator}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate Denominator √[(a+b)(c+d)(a+c)(b+d)]</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    (a+b) = ${row1Total}<br>
                    (c+d) = ${row2Total}<br>
                    (a+c) = ${col1Total}<br>
                    (b+d) = ${col2Total}<br>
                    Product = ${row1Total} × ${row2Total} × ${col1Total} × ${col2Total} = ${row1Total * row2Total * col1Total * col2Total}<br>
                    √Product = √${row1Total * row2Total * col1Total * col2Total} = ${denominator.toFixed(6)}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Calculate Phi Coefficient</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    φ = (ad - bc) / √[(a+b)(c+d)(a+c)(b+d)]<br>
                    φ = ${numerator} / ${denominator.toFixed(6)}<br>
                    <div style="font-size: 24px; font-weight: 700; color: #1a5490; margin-top: 12px;">φ = ${phi.toFixed(8)}</div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(phi) > 0.3 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <div><strong>Phi Coefficient:</strong> ${phi.toFixed(6)}</div>
            <div><strong>Direction:</strong> ${phi > 0 ? 'Positive association' : (phi < 0 ? 'Negative association' : 'No association')}</div>
            <div><strong>Strength:</strong> ${interpretation}</div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Note:</strong> Phi coefficient is equivalent to Pearson correlation for 2×2 binary variables.<br>
                It ranges from -1 (perfect negative association) to +1 (perfect positive association).
            </div>
        </div>
    </div>`;
    
    return { phi, numerator, denominator, n, a, b, c, d, steps };
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
            stepsSpan.innerHTML = "Enter data pairs (category1, category2)";
            return;
        }
        
        const result = computeCramersVWithSteps(raw);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `V = ${result.cramersV.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("cramersvClearBtn", "cramersvData", "cramersvResultArea");
}

// ========== PHI COEFFICIENT SETUP ==========
function setupPhiLogic() {
    const computeBtn = document.getElementById("phiComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("phiData").value;
        const resultDiv = document.getElementById("phiResultArea");
        const valueSpan = document.getElementById("phiValueDisplay");
        const stepsSpan = document.getElementById("phiStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Enter 4 values (a, b, c, d) for the 2×2 table";
            return;
        }
        
        const result = computePhiWithSteps(raw);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `φ = ${result.phi.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("phiClearBtn", "phiData", "phiResultArea");
}
// ========== ONE-SAMPLE Z-TEST (KNOWN VARIANCE) INTERFACE ==========
function renderOneSampleZInterface() {
    return `
        <div class="stat-interface" id="statOneSampleZInterface">
            <div class="interface-title">z One-Sample z-test (Known Population Variance)</div>
            <div class="formula-card">
                <div class="formula">📌 z = (x̄ - μ₀) / (σ / √n)</div>
                <div class="desc">Tests whether the sample mean differs from a hypothesized population mean when the population variance is KNOWN.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter sample data (comma, space, or line separated):</label>
                <textarea id="oneSampleZData" rows="3" placeholder="Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15"></textarea>
                
                <label style="margin-top: 15px;">📊 Hypothesized Population Mean (μ₀):</label>
                <input type="number" id="hypothesizedMeanZ" value="15" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Known Population Standard Deviation (σ):</label>
                <input type="number" id="knownStdDev" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Significance Level (α):</label>
                <select id="oneSampleZAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence)</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <label>📋 Alternative Hypothesis:</label>
                <select id="oneSampleZAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">μ ≠ μ₀ (Two-tailed)</option>
                    <option value="greater">μ > μ₀ (Greater than)</option>
                    <option value="less">μ < μ₀ (Less than)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="oneSampleZComputeBtn">z Run One-Sample z-test + Steps</button>
                    <button class="secondary-btn" id="oneSampleZClearBtn">Clear</button>
                </div>
            </div>
            <div id="oneSampleZResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 ONE-SAMPLE Z-TEST RESULTS</div>
                    <div class="result-value" id="oneSampleZValueDisplay">—</div>
                    <div class="calculation-steps" id="oneSampleZStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== ONE-SAMPLE PROPORTION Z-TEST INTERFACE ==========
function renderOneProportionZInterface() {
    return `
        <div class="stat-interface" id="statOneProportionZInterface">
            <div class="interface-title">p One-Sample Proportion z-test</div>
            <div class="formula-card">
                <div class="formula">📌 z = (p̂ - p₀) / √[p₀(1-p₀)/n]</div>
                <div class="desc">Tests whether the sample proportion differs from a hypothesized population proportion.</div>
            </div>
            <div class="data-input-section">
                <label>📊 Number of Successes (x):</label>
                <input type="number" id="propSuccesses" value="8" step="1" min="0" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Sample Size (n):</label>
                <input type="number" id="propSampleSize" value="20" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Hypothesized Population Proportion (p₀):</label>
                <input type="number" id="hypothesizedProp" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Significance Level (α):</label>
                <select id="propZAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence)</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <label>📋 Alternative Hypothesis:</label>
                <select id="propZAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">p ≠ p₀ (Two-tailed)</option>
                    <option value="greater">p > p₀ (Greater than)</option>
                    <option value="less">p < p₀ (Less than)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="onePropZComputeBtn">p Run Proportion z-test + Steps</button>
                    <button class="secondary-btn" id="onePropZClearBtn">Clear</button>
                </div>
            </div>
            <div id="onePropZResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 PROPORTION Z-TEST RESULTS</div>
                    <div class="result-value" id="onePropZValueDisplay">—</div>
                    <div class="calculation-steps" id="onePropZStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== BINOMIAL EXACT TEST INTERFACE ==========
function renderBinomialExactInterface() {
    return `
        <div class="stat-interface" id="statBinomialExactInterface">
            <div class="interface-title">B Binomial Exact Test</div>
            <div class="formula-card">
                <div class="formula">📌 P(X = k) = C(n,k) × p^k × (1-p)^(n-k)</div>
                <div class="desc">Exact test for binomial proportion using the binomial distribution (not approximation).</div>
            </div>
            <div class="data-input-section">
                <label>📊 Number of Successes (k):</label>
                <input type="number" id="binomSuccesses" value="8" step="1" min="0" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Sample Size (n):</label>
                <input type="number" id="binomSampleSize" value="20" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Hypothesized Probability (p₀):</label>
                <input type="number" id="binomHypProp" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Significance Level (α):</label>
                <select id="binomAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence)</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <label>📋 Alternative Hypothesis:</label>
                <select id="binomAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">p ≠ p₀ (Two-tailed)</option>
                    <option value="greater">p > p₀ (Greater than)</option>
                    <option value="less">p < p₀ (Less than)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="binomExactComputeBtn">B Run Binomial Exact Test + Steps</button>
                    <button class="secondary-btn" id="binomExactClearBtn">Clear</button>
                </div>
            </div>
            <div id="binomExactResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 BINOMIAL EXACT TEST RESULTS</div>
                    <div class="result-value" id="binomExactValueDisplay">—</div>
                    <div class="calculation-steps" id="binomExactStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== ONE-SAMPLE Z-TEST COMPUTATION (COMPLETE WITH DETAILED STEPS) ==========
function computeOneSampleZTest(data, mu0, sigma, alpha, alternative) {
    if (!data.length || data.length < 2) {
        return { error: true, message: "Need at least 2 observations." };
    }
    
    const n = data.length;
    const sum = data.reduce((a,b) => a+b, 0);
    const mean = sum / n;
    const standardError = sigma / Math.sqrt(n);
    const zStatistic = (mean - mu0) / standardError;
    
    let pValue;
    if (alternative === 'two.sided') {
        pValue = 2 * (1 - normCDF(Math.abs(zStatistic)));
    } else if (alternative === 'greater') {
        pValue = 1 - normCDF(zStatistic);
    } else {
        pValue = normCDF(zStatistic);
    }
    
    const criticalZ = normInv(1 - (alternative === 'two.sided' ? alpha / 2 : alpha));
    const rejectH0 = Math.abs(zStatistic) > criticalZ;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the population mean is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${mu0}.` :
        `There is NOT sufficient evidence that the population mean is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${mu0}.`;
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">z</span>
                <h2 style="margin: 0;">One-Sample z-test (Known Population Variance)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: z = (x̄ - μ₀) / (σ / √n)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: μ = ${mu0} | H₁: μ ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${mu0}</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Sample Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Size (n)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Mean (x̄)</div><div style="font-size: 24px; font-weight: 700;">${mean.toFixed(6)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Known σ (Std Dev)</div><div style="font-size: 20px;">${sigma}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Standard Error (SE)</div><div style="font-size: 20px;">${standardError.toFixed(6)}</div></div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate the Standard Error</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    SE = σ / √n = ${sigma} / √${n} = ${sigma} / ${Math.sqrt(n).toFixed(4)} = ${standardError.toFixed(6)}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate the z-statistic</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    z = (x̄ - μ₀) / SE<br>
                    z = (${mean.toFixed(6)} - ${mu0}) / ${standardError.toFixed(6)}<br>
                    z = ${(mean - mu0).toFixed(6)} / ${standardError.toFixed(6)}<br>
                    <div style="font-size: 20px; font-weight: 700; color: #1a5490; margin-top: 8px;">z = ${zStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Critical Value & p-value</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    α = ${alpha} (${(1-alpha)*100}% Confidence Level)<br>
                    Critical z-value = ${criticalZ.toFixed(6)}<br>
                    p-value = ${pValue.toFixed(8)}<br>
                    |z| = ${Math.abs(zStatistic).toFixed(6)} ${Math.abs(zStatistic) > criticalZ ? '>' : '<'} ${criticalZ.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>z-statistic:</strong> ${zStatistic.toFixed(6)}</div>
            <div><strong>Critical value:</strong> ${criticalZ.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value (${pValue.toFixed(6)}) < α (${alpha}) → Statistically significant` : `✗ p-value (${pValue.toFixed(6)}) > α (${alpha}) → Not statistically significant`}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for μ:</strong><br>
            ${mean.toFixed(4)} ± ${(criticalZ * standardError).toFixed(4)} → [${(mean - criticalZ * standardError).toFixed(4)}, ${(mean + criticalZ * standardError).toFixed(4)}]
        </div>
    </div>`;
    
    return { zStatistic, pValue, criticalZ, rejectH0, mean, n, steps };
}

// ========== ONE-SAMPLE PROPORTION Z-TEST COMPUTATION (COMPLETE WITH DETAILED STEPS) ==========
function computeOneProportionZTest(successes, n, p0, alpha, alternative) {
    if (n < 1) return { error: true, message: "Sample size must be at least 1." };
    if (successes < 0 || successes > n) return { error: true, message: "Successes must be between 0 and n." };
    
    const pHat = successes / n;
    const standardError = Math.sqrt(p0 * (1 - p0) / n);
    const zStatistic = (pHat - p0) / standardError;
    
    let pValue;
    if (alternative === 'two.sided') {
        pValue = 2 * (1 - normCDF(Math.abs(zStatistic)));
    } else if (alternative === 'greater') {
        pValue = 1 - normCDF(zStatistic);
    } else {
        pValue = normCDF(zStatistic);
    }
    
    const criticalZ = normInv(1 - (alternative === 'two.sided' ? alpha / 2 : alpha));
    const rejectH0 = Math.abs(zStatistic) > criticalZ;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the population proportion is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${p0}.` :
        `There is NOT sufficient evidence that the population proportion is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${p0}.`;
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">p</span>
                <h2 style="margin: 0;">One-Sample Proportion z-test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: z = (p̂ - p₀) / √[p₀(1-p₀)/n]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: p = ${p0} | H₁: p ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${p0}</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Size (n)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Successes (x)</div><div style="font-size: 24px; font-weight: 700;">${successes}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Proportion (p̂)</div><div style="font-size: 20px;">${pHat.toFixed(6)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Hypothesized Proportion (p₀)</div><div style="font-size: 20px;">${p0}</div></div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate the Standard Error</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    SE = √[p₀(1-p₀)/n]<br>
                    SE = √[${p0} × ${(1-p0).toFixed(4)} / ${n}]<br>
                    SE = √[${(p0 * (1-p0)).toFixed(6)} / ${n}]<br>
                    SE = √${((p0 * (1-p0)) / n).toFixed(6)} = ${standardError.toFixed(6)}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate the z-statistic</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    z = (p̂ - p₀) / SE<br>
                    z = (${pHat.toFixed(6)} - ${p0}) / ${standardError.toFixed(6)}<br>
                    z = ${(pHat - p0).toFixed(6)} / ${standardError.toFixed(6)}<br>
                    <div style="font-size: 20px; font-weight: 700; color: #1a5490; margin-top: 8px;">z = ${zStatistic.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Critical Value & p-value</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    α = ${alpha} (${(1-alpha)*100}% Confidence Level)<br>
                    Critical z-value = ${criticalZ.toFixed(6)}<br>
                    p-value = ${pValue.toFixed(8)}<br>
                    |z| = ${Math.abs(zStatistic).toFixed(6)} ${Math.abs(zStatistic) > criticalZ ? '>' : '<'} ${criticalZ.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>z-statistic:</strong> ${zStatistic.toFixed(6)}</div>
            <div><strong>Critical value:</strong> ${criticalZ.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            💡 <strong>${(1-alpha)*100}% Confidence Interval for p:</strong><br>
            ${pHat.toFixed(4)} ± ${(criticalZ * standardError).toFixed(4)} → [${(pHat - criticalZ * standardError).toFixed(4)}, ${(pHat + criticalZ * standardError).toFixed(4)}]
        </div>
    </div>`;
    
    return { zStatistic, pValue, criticalZ, rejectH0, pHat, n, steps };
}

// ========== BINOMIAL EXACT TEST COMPUTATION (COMPLETE WITH DETAILED STEPS) ==========
function computeBinomialExactTest(successes, n, p0, alpha, alternative) {
    if (n < 1) return { error: true, message: "Sample size must be at least 1." };
    
    let pValue;
    let calculationDetails = "";
    
    if (alternative === 'greater') {
        pValue = 0;
        calculationDetails = `<div style="margin-top: 12px;"><strong>P(X ≥ ${successes}) =</strong><br>`;
        for (let k = successes; k <= n; k++) {
            const prob = combination(n, k) * Math.pow(p0, k) * Math.pow(1 - p0, n - k);
            pValue += prob;
            calculationDetails += `P(X = ${k}) = C(${n},${k}) × ${p0}^${k} × ${(1-p0).toFixed(4)}^${n-k} = ${prob.toFixed(8)}<br>`;
        }
        calculationDetails += `</div>`;
    } else if (alternative === 'less') {
        pValue = 0;
        calculationDetails = `<div style="margin-top: 12px;"><strong>P(X ≤ ${successes}) =</strong><br>`;
        for (let k = 0; k <= successes; k++) {
            const prob = combination(n, k) * Math.pow(p0, k) * Math.pow(1 - p0, n - k);
            pValue += prob;
            calculationDetails += `P(X = ${k}) = C(${n},${k}) × ${p0}^${k} × ${(1-p0).toFixed(4)}^${n-k} = ${prob.toFixed(8)}<br>`;
        }
        calculationDetails += `</div>`;
    } else {
        // Two-tailed
        pValue = 0;
        const observedProb = combination(n, successes) * Math.pow(p0, successes) * Math.pow(1 - p0, n - successes);
        calculationDetails = `<div style="margin-top: 12px;"><strong>Two-tailed p-value calculation:</strong><br>
        Observed probability = ${observedProb.toFixed(8)}<br>
        Including all outcomes with probability ≤ observed probability:<br>`;
        
        for (let k = 0; k <= n; k++) {
            const prob = combination(n, k) * Math.pow(p0, k) * Math.pow(1 - p0, n - k);
            if (prob <= observedProb + 1e-10) {
                pValue += prob;
                calculationDetails += `P(X = ${k}) = ${prob.toFixed(8)} ✓<br>`;
            }
        }
        pValue = Math.min(pValue, 1);
        calculationDetails += `</div>`;
    }
    
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the population proportion is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${p0}.` :
        `There is NOT sufficient evidence that the population proportion is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${p0}.`;
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">B</span>
                <h2 style="margin: 0;">Binomial Exact Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: P(X = k) = C(n,k) × p^k × (1-p)^(n-k)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: p = ${p0} | H₁: p ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${p0}</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Size (n)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Successes (k)</div><div style="font-size: 24px; font-weight: 700;">${successes}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Proportion (p̂)</div><div style="font-size: 20px;">${(successes/n).toFixed(6)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Hypothesized p₀</div><div style="font-size: 20px;">${p0}</div></div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Understanding the Binomial Distribution</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    Under H₀ (p = ${p0}), the number of successes follows Binomial(n=${n}, p=${p0})<br>
                    Probability mass function: P(X = k) = C(${n}, k) × ${p0}^k × ${(1-p0).toFixed(4)}^(${n}-k)
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate the p-value</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    ${calculationDetails}
                    <div style="margin-top: 12px; font-weight: bold;">p-value = ${pValue.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Compare with Significance Level</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    α = ${alpha}<br>
                    p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} α = ${alpha}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value < α → Statistically significant at α = ${alpha}` : `✗ p-value > α → Not statistically significant at α = ${alpha}`}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
            💡 <strong>What is the Binomial Exact Test?</strong><br>
            Unlike the z-test approximation, the binomial exact test calculates the exact p-value using the binomial distribution.
            This is more accurate, especially for small sample sizes or when p is close to 0 or 1.
        </div>
    </div>`;
    
    return { pValue, rejectH0, successes, n, pHat: successes/n, steps };
}
function setupOneSampleZLogic() {
    const computeBtn = document.getElementById("oneSampleZComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("oneSampleZData").value;
        const data = parseNumbersFromInput(raw);
        const mu0 = parseFloat(document.getElementById("hypothesizedMeanZ").value);
        const sigma = parseFloat(document.getElementById("knownStdDev").value);
        const alpha = parseFloat(document.getElementById("oneSampleZAlpha").value);
        const alternative = document.getElementById("oneSampleZAlternative").value;
        const resultDiv = document.getElementById("oneSampleZResultArea");
        const valueSpan = document.getElementById("oneSampleZValueDisplay");
        const stepsSpan = document.getElementById("oneSampleZStepsDisplay");
        
        if (!data.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter sample data.";
            return;
        }
        
        const result = computeOneSampleZTest(data, mu0, sigma, alpha, alternative);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `z = ${result.zStatistic?.toFixed(6) || 'Error'} | p = ${result.pValue?.toFixed(6) || 'Error'}`;
        stepsSpan.innerHTML = result.steps || "Calculation completed.";
    });
    attachClearHandler("oneSampleZClearBtn", "oneSampleZData", "oneSampleZResultArea");
}

function setupOneProportionZLogic() {
    const computeBtn = document.getElementById("onePropZComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const successes = parseInt(document.getElementById("propSuccesses").value);
        const n = parseInt(document.getElementById("propSampleSize").value);
        const p0 = parseFloat(document.getElementById("hypothesizedProp").value);
        const alpha = parseFloat(document.getElementById("propZAlpha").value);
        const alternative = document.getElementById("propZAlternative").value;
        const resultDiv = document.getElementById("onePropZResultArea");
        const valueSpan = document.getElementById("onePropZValueDisplay");
        const stepsSpan = document.getElementById("onePropZStepsDisplay");
        
        const result = computeOneProportionZTest(successes, n, p0, alpha, alternative);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `z = ${result.zStatistic?.toFixed(6) || 'Error'} | p = ${result.pValue?.toFixed(6) || 'Error'}`;
        stepsSpan.innerHTML = result.steps || "Calculation completed.";
    });
    attachClearHandler("onePropZClearBtn", "", "onePropZResultArea");
}

function setupBinomialExactLogic() {
    const computeBtn = document.getElementById("binomExactComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const successes = parseInt(document.getElementById("binomSuccesses").value);
        const n = parseInt(document.getElementById("binomSampleSize").value);
        const p0 = parseFloat(document.getElementById("binomHypProp").value);
        const alpha = parseFloat(document.getElementById("binomAlpha").value);
        const alternative = document.getElementById("binomAlternative").value;
        const resultDiv = document.getElementById("binomExactResultArea");
        const valueSpan = document.getElementById("binomExactValueDisplay");
        const stepsSpan = document.getElementById("binomExactStepsDisplay");
        
        const result = computeBinomialExactTest(successes, n, p0, alpha, alternative);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `p = ${result.pValue?.toFixed(6) || 'Error'} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`;
        stepsSpan.innerHTML = result.steps || "Calculation completed.";
    });
    attachClearHandler("binomExactClearBtn", "", "binomExactResultArea");
}
// ========== SIMPLE LINEAR REGRESSION INTERFACE ==========
function renderSimpleLinearInterface() {
    return `
        <div class="stat-interface" id="statSimpleLinearInterface">
            <div class="interface-title">📈 Simple Linear Regression</div>
            <div class="formula-card">
                <div class="formula">📌 y = β₀ + β₁x + ε</div>
                <div class="desc">
                    <strong>Formula details:</strong><br>
                    • β₁ = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / Σ(xᵢ - x̄)² (Slope)<br>
                    • β₀ = ȳ - β₁x̄ (Intercept)<br>
                    • R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub> (Coefficient of determination)
                </div>
                <div class="desc" style="margin-top: 8px;">
                    Models the linear relationship between one independent variable (X) and one dependent variable (Y).
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (independent variable):</label>
                <textarea id="simpleXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter Y values (dependent variable):</label>
                <textarea id="simpleYInput" rows="3" placeholder="Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="simpleLinearComputeBtn">📈 Fit Regression Model + Full Steps</button>
                    <button class="secondary-btn" id="simpleLinearClearBtn">Clear All</button>
                </div>
            </div>
            <div id="simpleLinearResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 REGRESSION RESULTS</div>
                    <div class="result-value" id="simpleLinearValueDisplay">—</div>
                    <div class="calculation-steps" id="simpleLinearStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== MULTIPLE LINEAR REGRESSION INTERFACE ==========
function renderMultipleLinearInterface() {
    return `
        <div class="stat-interface" id="statMultipleLinearInterface">
            <div class="interface-title">📊 Multiple Linear Regression</div>
            <div class="formula-card">
                <div class="formula">📌 y = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ + ε</div>
                <div class="desc">
                    <strong>Formula details:</strong><br>
                    • Models relationship between multiple predictors and one outcome<br>
                    • Uses matrix algebra: β = (X'X)⁻¹X'y<br>
                    • R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub> (Multiple R-squared)<br>
                    • R²<sub>adj</sub> = 1 - (1-R²)(n-1)/(n-k-1) (Adjusted R-squared)
                </div>
                <div class="desc" style="margin-top: 8px;">
                    Enter data with first column as Y (dependent), remaining columns as X₁, X₂, ... (independent)
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data (comma-separated values, first column = Y, rest = X variables):</label>
                <textarea id="multipleData" rows="5" placeholder="Example:&#10;Y, X1, X2, X3&#10;2, 1, 4, 7&#10;3, 2, 5, 8&#10;4, 3, 6, 9&#10;5, 4, 7, 10&#10;6, 5, 8, 11"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    First row can be column headers (optional). Each subsequent row: Y value, then X1, X2, ... values
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="multipleLinearComputeBtn">📊 Fit Multiple Regression + Steps</button>
                    <button class="secondary-btn" id="multipleLinearClearBtn">Clear All</button>
                </div>
            </div>
            <div id="multipleLinearResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MULTIPLE REGRESSION RESULTS</div>
                    <div class="result-value" id="multipleLinearValueDisplay">—</div>
                    <div class="calculation-steps" id="multipleLinearStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== MODEL SUMMARY & DIAGNOSTICS INTERFACE ==========
function renderModelSummaryInterface() {
    return `
        <div class="stat-interface" id="statModelSummaryInterface">
            <div class="interface-title">📋 Model Summary & Diagnostics</div>
            <div class="formula-card">
                <div class="formula">📌 Key metrics for regression model evaluation</div>
                <div class="desc">
                    <strong>Includes:</strong><br>
                    • R² and Adjusted R² (Goodness of fit)<br>
                    • F-statistic and p-value (Overall model significance)<br>
                    • Residual standard error (RSE)<br>
                    • AIC / BIC (Model comparison metrics)<br>
                    • Residual diagnostics (normality, homoscedasticity)
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter model predictions and actual values:</label>
                <textarea id="modelSummaryData" rows="4" placeholder="Example:&#10;Actual, Predicted&#10;2, 2.1&#10;3, 2.9&#10;4, 4.2&#10;5, 4.8&#10;6, 6.0"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    First row: column headers (optional). Each row: Actual value, Predicted value
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="modelSummaryComputeBtn">📋 Calculate Model Metrics + Steps</button>
                    <button class="secondary-btn" id="modelSummaryClearBtn">Clear</button>
                </div>
            </div>
            <div id="modelSummaryResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MODEL SUMMARY RESULTS</div>
                    <div class="result-value" id="modelSummaryValueDisplay">—</div>
                    <div class="calculation-steps" id="modelSummaryStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== SIMPLE LINEAR REGRESSION COMPUTATION ==========
function computeSimpleLinearRegression(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 observations for regression." };
    }
    
    const n = xValues.length;
    
    // Calculate means
    const meanX = xValues.reduce((a, b) => a + b, 0) / n;
    const meanY = yValues.reduce((a, b) => a + b, 0) / n;
    
    // Calculate slope (β₁) and intercept (β₀)
    let numerator = 0;
    let denominator = 0;
    let xyDetails = [];
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        numerator += xDev * yDev;
        denominator += xDev * xDev;
        xyDetails.push({ x: xValues[i], y: yValues[i], xDev, yDev, product: xDev * yDev, xSq: xDev * xDev });
    }
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Calculate predictions and residuals
    let predictions = [];
    let residuals = [];
    let ssRes = 0;
    let ssTot = 0;
    let residualDetails = [];
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        predictions.push(yPred);
        residuals.push(residual);
        ssRes += residual * residual;
        ssTot += Math.pow(yValues[i] - meanY, 2);
        residualDetails.push({ x: xValues[i], y: yValues[i], yPred, residual, squaredRes: residual * residual });
    }
    
    const rSquared = 1 - (ssRes / ssTot);
    const adjRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - 2));
    
    // Standard error of coefficients
    const residualStdError = Math.sqrt(ssRes / (n - 2));
    const seSlope = residualStdError / Math.sqrt(denominator);
    const seIntercept = residualStdError * Math.sqrt(1/n + Math.pow(meanX, 2) / denominator);
    
    // t-statistics and p-values
    const tSlope = slope / seSlope;
    const tIntercept = intercept / seIntercept;
    const pSlope = 2 * (1 - tCDF(Math.abs(tSlope), n - 2));
    const pIntercept = 2 * (1 - tCDF(Math.abs(tIntercept), n - 2));
    
    // F-statistic for overall model
    const fStatistic = (rSquared / 1) / ((1 - rSquared) / (n - 2));
    const pF = 1 - fCDF(fStatistic, 1, n - 2);
    
    // Build calculation table HTML
    let calcTableRows = '';
    for (let i = 0; i < n; i++) {
        const d = xyDetails[i];
        calcTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${d.x}</td>
            <td style="padding: 8px; text-align: center;">${d.y}</td>
            <td style="padding: 8px; text-align: center;">${d.xDev.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${d.yDev.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold;">${d.product.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${d.xSq.toFixed(4)}</td>
        </tr>`;
    }
    
    let residualTableRows = '';
    for (let i = 0; i < n; i++) {
        const r = residualDetails[i];
        residualTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${r.x}</td>
            <td style="padding: 8px; text-align: center;">${r.y}</td>
            <td style="padding: 8px; text-align: center;">${r.yPred.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${r.residual.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${r.squaredRes.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📈</span>
                <h2 style="margin: 0;">Simple Linear Regression</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: ŷ = β₀ + β₁x</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)² | β₀ = ȳ - β₁x̄</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">n (Observations)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">x̄ (Mean X)</div><div style="font-size: 18px;">${meanX.toFixed(4)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">ȳ (Mean Y)</div><div style="font-size: 18px;">${meanY.toFixed(4)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Σ(x - x̄)(y - ȳ)</div><div style="font-size: 18px;">${numerator.toFixed(4)}</div></div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Calculate Deviations and Cross-Products</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;">
                    <th style="padding: 8px;">i</th><th style="padding: 8px;">x</th><th style="padding: 8px;">y</th>
                    <th style="padding: 8px;">x - x̄</th><th style="padding: 8px;">y - ȳ</th>
                    <th style="padding: 8px;">(x - x̄)(y - ȳ)</th><th style="padding: 8px;">(x - x̄)²</th>
                 </tr></thead>
                <tbody>${calcTableRows}
                    <tr style="background: #e9ecef; font-weight: bold;">
                        <td colspan="5" style="padding: 8px; text-align: right;">Σ →</td>
                        <td style="padding: 8px; text-align: center;">${numerator.toFixed(4)}</td>
                        <td style="padding: 8px; text-align: center;">${denominator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Coefficients</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Slope (β₁):</strong><br>
                β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²<br>
                β₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)} = <strong style="color: #1a5490;">${slope.toFixed(8)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Intercept (β₀):</strong><br>
                β₀ = ȳ - β₁·x̄<br>
                β₀ = ${meanY.toFixed(4)} - (${slope.toFixed(6)} × ${meanX.toFixed(4)})<br>
                β₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)} = <strong style="color: #1a5490;">${intercept.toFixed(8)}</strong>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 3: Predictions and Residuals</h3>
            <div style="padding: 12px; background: #e8f4f8; font-size: 13px;">
                <strong>Regression equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;">
                    <th style="padding: 8px;">i</th><th style="padding: 8px;">x</th><th style="padding: 8px;">y</th>
                    <th style="padding: 8px;">ŷ (Predicted)</th><th style="padding: 8px;">Residual (y - ŷ)</th>
                    <th style="padding: 8px;">(y - ŷ)²</th>
                 </tr></thead>
                <tbody>${residualTableRows}
                    <tr style="background: #e9ecef; font-weight: bold;">
                        <td colspan="5" style="padding: 8px; text-align: right;">SS<sub>res</sub> (Sum of Squared Residuals) →</td>
                        <td style="padding: 8px; text-align: center;">${ssRes.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Step 4: Model Fit Statistics</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>R-squared (R²):</strong><br>
                R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub><br>
                SS<sub>tot</sub> = Σ(yᵢ - ȳ)² = ${ssTot.toFixed(4)}<br>
                R² = 1 - ${ssRes.toFixed(4)} / ${ssTot.toFixed(4)} = <strong style="color: #1a5490;">${rSquared.toFixed(8)}</strong><br>
                <span style="font-size: 12px;">Interpretation: ${(rSquared * 100).toFixed(1)}% of variance in Y is explained by X</span>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Adjusted R-squared:</strong><br>
                R²<sub>adj</sub> = 1 - (1 - R²)(n - 1)/(n - 2)<br>
                R²<sub>adj</sub> = 1 - (1 - ${rSquared.toFixed(4)}) × ${n-1}/${n-2} = <strong style="color: #1a5490;">${adjRSquared.toFixed(8)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Overall Model F-test:</strong><br>
                F = (R² / k) / ((1 - R²) / (n - k - 1))<br>
                F = ${fStatistic.toFixed(6)}<br>
                p-value = ${pF.toFixed(8)}<br>
                <strong>Regression equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: #d4edda; border-left: 6px solid #28a745;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <div><strong>Slope (β₁):</strong> ${slope.toFixed(6)} → For each 1-unit increase in X, Y changes by ${slope.toFixed(4)} units</div>
            <div><strong>Intercept (β₀):</strong> ${intercept.toFixed(6)} → Predicted Y when X = 0</div>
            <div><strong>R-squared:</strong> ${(rSquared * 100).toFixed(1)}% of variance explained</div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Model:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x<br>
                💡 <strong>Coefficient Statistics:</strong> t<sub>slope</sub> = ${tSlope.toFixed(4)} (p = ${pSlope.toFixed(6)})
            </div>
        </div>
    </div>`;
    
    return { slope, intercept, rSquared, adjRSquared, fStatistic, pF, steps };
}

// Helper function for multiple regression with detailed matrix algebra explanation
// Helper function for multiple regression with detailed matrix algebra explanation
function computeMultipleLinearRegression(dataMatrix) {
    // dataMatrix: each row = [y, x1, x2, ...]
    if (dataMatrix.length < 3) {
        return { error: true, message: "Need at least 3 observations for regression." };
    }
    
    const n = dataMatrix.length;
    const p = dataMatrix[0].length - 1; // number of predictors
    
    if (p < 1) {
        return { error: true, message: "Need at least one predictor variable." };
    }
    
    // Extract Y vector and X matrix
    const y = dataMatrix.map(row => row[0]);
    const x = dataMatrix.map(row => row.slice(1));
    
    // Calculate means
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    const xMeans = [];
    for (let j = 0; j < p; j++) {
        xMeans.push(x.reduce((sum, row) => sum + row[j], 0) / n);
    }
    
    // Build design matrix X (with column of 1's for intercept)
    const X = [];
    for (let i = 0; i < n; i++) {
        const row = [1]; // intercept term
        for (let j = 0; j < p; j++) {
            row.push(x[i][j]);
        }
        X.push(row);
    }
    
    // Calculate X'X (X transpose times X)
    const XtX = [];
    for (let i = 0; i <= p; i++) {
        XtX.push([]);
        for (let j = 0; j <= p; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += X[k][i] * X[k][j];
            }
            XtX[i].push(sum);
        }
    }
    
    // Calculate X'y (X transpose times y)
    const Xty = [];
    for (let i = 0; i <= p; i++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
            sum += X[k][i] * y[k];
        }
        Xty.push(sum);
    }
    
    // Generate detailed XtX calculation steps
    let xtxDetails = '';
    for (let i = 0; i <= p; i++) {
        for (let j = 0; j <= p; j++) {
            const terms = [];
            for (let k = 0; k < n; k++) {
                terms.push(`(${X[k][i]} × ${X[k][j]})`);
            }
            xtxDetails += `<div style="margin: 8px 0; font-size: 13px;">
                <strong>(X<sup>T</sup>X)<sub>${i+1},${j+1}</sub></strong> = ${terms.join(' + ')} = ${XtX[i][j].toFixed(2)}
            </div>`;
        }
    }
    
    // Generate detailed Xty calculation steps
    let xtyDetails = '';
    for (let i = 0; i <= p; i++) {
        const terms = [];
        for (let k = 0; k < n; k++) {
            terms.push(`(${X[k][i]} × ${y[k]})`);
        }
        xtyDetails += `<div style="margin: 8px 0; font-size: 13px;">
            <strong>(X<sup>T</sup>y)<sub>${i+1}</sub></strong> = ${terms.join(' + ')} = ${Xty[i].toFixed(2)}
        </div>`;
    }
    
    // Calculate inverse of XtX with detailed steps
    function matrixInverseWithSteps(matrix, stepCallback) {
        const size = matrix.length;
        // Create augmented matrix [A|I]
        const augmented = [];
        for (let i = 0; i < size; i++) {
            augmented.push([...matrix[i]]);
            for (let j = 0; j < size; j++) {
                augmented[i].push(i === j ? 1 : 0);
            }
        }
        
        let stepLog = '<div style="font-size: 13px;">';
        
        // Gaussian elimination
        for (let i = 0; i < size; i++) {
            // Find pivot
            let maxRow = i;
            for (let k = i + 1; k < size; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            
            if (maxRow !== i) {
                [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
                stepLog += `<div style="margin: 8px 0; color: #856404;">↔️ Swap row ${i+1} with row ${maxRow+1}</div>`;
            }
            
            // Make diagonal 1
            const pivot = augmented[i][i];
            if (Math.abs(pivot) < 1e-10) {
                throw new Error("Matrix is singular, cannot compute inverse");
            }
            
            stepLog += `<div style="margin: 8px 0;">📐 Make pivot at (${i+1},${i+1}) = 1: Divide row ${i+1} by ${pivot.toFixed(4)}</div>`;
            for (let j = 0; j < 2 * size; j++) {
                augmented[i][j] /= pivot;
            }
            
            // Eliminate other rows
            for (let k = 0; k < size; k++) {
                if (k !== i) {
                    const factor = augmented[k][i];
                    if (Math.abs(factor) > 1e-10) {
                        stepLog += `<div style="margin: 8px 0;">➖ Eliminate column ${i+1} in row ${k+1}: R${k+1} ← R${k+1} - ${factor.toFixed(4)} × R${i+1}</div>`;
                        for (let j = 0; j < 2 * size; j++) {
                            augmented[k][j] -= factor * augmented[i][j];
                        }
                    }
                }
            }
        }
        
        stepLog += '</div>';
        if (stepCallback) stepCallback(stepLog);
        
        // Extract inverse
        const inverse = [];
        for (let i = 0; i < size; i++) {
            inverse.push(augmented[i].slice(size));
        }
        return inverse;
    }
    
    // Calculate coefficients: β = (X'X)⁻¹ X'y
    let coefficients;
    let inverseSteps = '';
    let XtX_inv;
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📊</span>
                <h2 style="margin: 0;">Multiple Linear Regression</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: ŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Estimates the linear relationship between multiple predictors and one outcome</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px;">Observations (n)</div>
                    <div style="font-size: 24px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px;">Predictors (k)</div>
                    <div style="font-size: 24px; font-weight: 700;">${p}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px;">Mean of Y (ȳ)</div>
                    <div style="font-size: 18px;">${yMean.toFixed(4)}</div>
                </div>
            </div>
            
            <h4 style="margin: 16px 0 8px 0;">Input Data</h4>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 8px;">Obs</th>
                        <th style="padding: 8px;">Y</th>
                        ${Array(p).fill().map((_, j) => `<th style="padding: 8px;">X<sub>${j+1}</sub></th>`).join('')}
                       </tr></thead>
                    <tbody>
                        ${dataMatrix.map((row, i) => `<tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 8px; text-align: center;">${i+1}</td>
                            ${row.map(val => `<td style="padding: 8px; text-align: center;">${val}</td>`).join('')}
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step 1: The Regression Equation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p>The multiple linear regression model is written as:</p>
                <div style="background: #f0f4f8; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin: 12px 0;">
                    <strong>y = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ + ε</strong>
                </div>
                <p>The goal is to find β coefficients that minimize the sum of squared errors: <strong>Σ(yᵢ - ŷᵢ)²</strong></p>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🧮 Step 2: Matrix Formulation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p>For all n observations, we write the system in matrix form:</p>
                <div style="background: #f0f4f8; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin: 12px 0;">
                    <strong>y = Xβ + ε</strong>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Design Matrix X (with intercept column):</h4>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; overflow-x: auto; font-family: monospace;">
                    X = 
                    <table style="display: inline-table; border-collapse: collapse; margin-left: 10px;">
                        ${X.map(row => `<tr>${row.map(val => `<td style="padding: 4px 8px; border: 1px solid #dee2e6;">${val}</td>`).join('')}</tr>`).join('')}
                    </table>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Y vector:</h4>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-family: monospace;">
                    y = [${y.join(', ')}]<sup>T</sup>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">⚙️ Step 3: Solving for β (Normal Equation)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p>The OLS estimator is:</p>
                <div style="background: #f0f4f8; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin: 12px 0;">
                    <strong>β = (X<sup>T</sup>X)<sup>-1</sup> X<sup>T</sup>y</strong>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Step 3.1: Calculate X<sup>T</sup>X (the moment matrix)</h4>
                <div style="background: #fff8e1; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <div style="font-weight: bold; margin-bottom: 12px;">📝 Detailed Calculation:</div>
                    ${xtxDetails}
                </div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 12px; overflow-x: auto;">
                    <div style="font-family: monospace; font-size: 14px; font-weight: bold;">Result: X<sup>T</sup>X = </div>
                    <table style="border-collapse: collapse; margin-top: 8px;">
                        ${Array(p+1).fill().map((_, i) => `<tr>${Array(p+1).fill().map((_, j) => `<td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">${XtX[i][j].toFixed(2)}</td>`).join('')}</tr>`).join('')}
                    </table>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Step 3.2: Calculate X<sup>T</sup>y</h4>
                <div style="background: #fff8e1; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <div style="font-weight: bold; margin-bottom: 12px;">📝 Detailed Calculation:</div>
                    ${xtyDetails}
                </div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <div style="font-family: monospace;">
                        X<sup>T</sup>y = [${Xty.map(v => v.toFixed(2)).join(', ')}]<sup>T</sup>
                    </div>
                </div>`;
    
    try {
        XtX_inv = matrixInverseWithSteps(XtX, (stepLog) => {
            inverseSteps = stepLog;
        });
        
        // Calculate coefficients with detailed steps
        coefficients = [];
        let coeffDetails = '';
        for (let i = 0; i <= p; i++) {
            let sum = 0;
            const terms = [];
            for (let j = 0; j <= p; j++) {
                const product = XtX_inv[i][j] * Xty[j];
                sum += product;
                terms.push(`(${XtX_inv[i][j].toFixed(4)} × ${Xty[j].toFixed(2)})`);
            }
            coefficients.push(sum);
            coeffDetails += `<div style="margin: 8px 0;">
                <strong>β<sub>${i}</sub></strong> = ${terms.join(' + ')} = ${sum.toFixed(6)}
            </div>`;
        }
        
        steps += `
                <h4 style="margin: 20px 0 10px 0;">Step 3.3: Calculate (X<sup>T</sup>X)<sup>-1</sup> using Gaussian Elimination</h4>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                    <details open>
                        <summary style="cursor: pointer; font-weight: bold; margin-bottom: 12px;">🔍 Click to see matrix inversion steps</summary>
                        ${inverseSteps}
                    </details>
                    <div style="margin-top: 16px; overflow-x: auto;">
                        <div style="font-family: monospace; font-size: 14px; font-weight: bold;">Result: (X<sup>T</sup>X)<sup>-1</sup> = </div>
                        <table style="border-collapse: collapse; margin-top: 8px;">
                            ${Array(p+1).fill().map((_, i) => `<tr>${Array(p+1).fill().map((_, j) => `<td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">${XtX_inv[i][j].toFixed(4)}</td>`).join('')}</tr>`).join('')}
                        </table>
                    </div>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Step 3.4: Calculate β = (X<sup>T</sup>X)<sup>-1</sup> X<sup>T</sup>y</h4>
                <div style="background: #fff8e1; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <div style="font-weight: bold; margin-bottom: 12px;">📝 Detailed Coefficient Calculation:</div>
                    ${coeffDetails}
                </div>
                <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <div style="font-family: monospace; font-size: 16px; font-weight: bold;">Results:</div>
                    <div style="font-family: monospace; margin-top: 8px;">
                        β₀ (intercept) = ${coefficients[0].toFixed(6)}<br>
                        ${Array(p).fill().map((_, j) => `β<sub>${j+1}</sub> = ${coefficients[j+1].toFixed(6)}`).join('<br>')}
                    </div>
                </div>`;
                
    } catch (error) {
        steps += `
                <div style="background: #f8d7da; border-radius: 8px; padding: 12px; color: #721c24;">
                    ⚠️ Cannot compute coefficients: ${error.message}. At least one predictor is an exact copy or linear combination of the others (perfect multicollinearity), or there are fewer observations than parameters. Remove or combine the redundant predictor, or add more observations.
                </div>`;
        coefficients = null;
    }
    
    // Generate regression equation
    if (coefficients) {
        let equation = `ŷ = ${coefficients[0].toFixed(4)}`;
        for (let j = 0; j < p; j++) {
            const sign = coefficients[j+1] >= 0 ? '+' : '-';
            equation += ` ${sign} ${Math.abs(coefficients[j+1]).toFixed(4)}·x<sub>${j+1}</sub>`;
        }
        
        steps += `
        <div style="border-radius: 16px; padding: 20px; margin-top: 24px; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-left: 6px solid #28a745;">
            <h3 style="margin: 0 0 12px 0;">📈 Step 4: The Final Regression Equation</h3>
            <div style="background: white; border-radius: 8px; padding: 16px; text-align: center; font-size: 18px; font-family: monospace;">
                ${equation}
            </div>
            <div style="margin-top: 16px;">
                <h4>📖 Interpretation:</h4>
                <ul style="margin: 8px 0;">
                    <li><strong>β₀ = ${coefficients[0].toFixed(4)}</strong>: When all predictors are 0, the predicted Y is ${coefficients[0].toFixed(4)}</li>
                    ${Array(p).fill().map((_, j) => `<li><strong>β<sub>${j+1}</sub> = ${coefficients[j+1].toFixed(4)}</strong>: For each 1-unit increase in x<sub>${j+1}</sub>, Y changes by ${coefficients[j+1].toFixed(4)} units, holding other predictors constant</li>`).join('')}
                </ul>
            </div>
        </div>`;
    }
    
    steps += `
        <div style="border-radius: 16px; padding: 20px; margin-top: 24px; background: #fff3cd; border-left: 6px solid #ffc107;">
            <h3 style="margin: 0 0 12px 0;">📌 Key Assumptions of Multiple Regression</h3>
            <ul>
                <li><strong>Linearity:</strong> The relationship between predictors and outcome is linear</li>
                <li><strong>Independence:</strong> Observations are independent of each other</li>
                <li><strong>Homoscedasticity:</strong> Constant variance of residuals</li>
                <li><strong>Normality:</strong> Residuals are normally distributed</li>
                <li><strong>No perfect multicollinearity:</strong> Predictors are not perfectly correlated</li>
            </ul>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Note:</strong> The quality of the regression model should be assessed using R², adjusted R², F-test, and residual diagnostics.
            </div>
        </div>
    </div>`;
    
    return { 
        steps, 
        n, 
        p, 
        yMean,
        coefficients: coefficients,
        XtX: XtX,
        Xty: Xty,
        XtX_inv: XtX_inv,
        equation: coefficients ? `ŷ = ${coefficients[0].toFixed(4)} + ${coefficients.slice(1).map((c, i) => `${c.toFixed(4)}·x${i+1}`).join(' + ')}` : null
    };
}
function computeModelSummary(actual, predicted) {
    if (!actual.length || !predicted.length) {
        return { error: true, message: "Please enter both actual and predicted values." };
    }
    if (actual.length !== predicted.length) {
        return { error: true, message: "Actual and predicted must have the same number of values." };
    }
    if (actual.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
    }
    
    const n = actual.length;
    const meanY = actual.reduce((a, b) => a + b, 0) / n;
    
    // Calculate residuals and sums of squares
    let residuals = [];
    let ssRes = 0;
    let ssTot = 0;
    let residualDetails = [];
    
    for (let i = 0; i < n; i++) {
        const residual = actual[i] - predicted[i];
        residuals.push(residual);
        ssRes += residual * residual;
        const deviation = actual[i] - meanY;
        ssTot += deviation * deviation;
        residualDetails.push({ 
            actual: actual[i], 
            predicted: predicted[i], 
            residual: residual, 
            squaredRes: residual * residual,
            deviation: deviation,
            squaredDev: deviation * deviation
        });
    }
    
    // Calculate metrics
    const rSquared = 1 - (ssRes / ssTot);
    const adjRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - 2));
    const rmse = Math.sqrt(ssRes / n);
    const mae = residuals.reduce((sum, r) => sum + Math.abs(r), 0) / n;
    const mape = residuals.reduce((sum, r, i) => sum + Math.abs(r / actual[i]) * 100, 0) / n;
    
    // Determine performance colors and icons
    const getPerformanceColor = (value, type) => {
        if (type === 'r2') {
            if (value >= 0.8) return { color: '#10b981', bg: '#d1fae5', icon: '🎯', text: 'Excellent' };
            if (value >= 0.6) return { color: '#f59e0b', bg: '#fed7aa', icon: '👍', text: 'Good' };
            if (value >= 0.4) return { color: '#f97316', bg: '#ffedd5', icon: '⚠️', text: 'Moderate' };
            return { color: '#ef4444', bg: '#fee2e2', icon: '🔴', text: 'Poor' };
        }
        if (type === 'error') {
            if (value < 5) return { color: '#10b981', bg: '#d1fae5', icon: '✅' };
            if (value < 15) return { color: '#f59e0b', bg: '#fed7aa', icon: '⚠️' };
            return { color: '#ef4444', bg: '#fee2e2', icon: '❌' };
        }
        return { color: '#6b7280', bg: '#f3f4f6', icon: '📊' };
    };
    
    const r2Perf = getPerformanceColor(rSquared, 'r2');
    const mapePerf = getPerformanceColor(mape, 'error');
    
    // Build detailed calculation strings
    const ssResCalculation = residualDetails.map(function(r, idx) {
        return '  ' + (idx+1) + '. (' + r.actual + ' - ' + r.predicted.toFixed(4) + ')² = (' + r.residual.toFixed(4) + ')² = ' + r.squaredRes.toFixed(4);
    }).join('\n');
    
    const ssTotCalculation = residualDetails.map(function(r, idx) {
        return '  ' + (idx+1) + '. (' + r.actual + ' - ' + meanY.toFixed(4) + ')² = (' + r.deviation.toFixed(4) + ')² = ' + r.squaredDev.toFixed(4);
    }).join('\n');
    
    const maeCalculation = residualDetails.map(function(r, idx) {
        return '  ' + (idx+1) + '. |' + r.residual.toFixed(4) + '| = ' + Math.abs(r.residual).toFixed(4);
    }).join('\n');
    
    const mapeCalculation = residualDetails.map(function(r, idx) {
        return '  ' + (idx+1) + '. |' + r.residual.toFixed(4) + '/' + r.actual + '| × 100 = ' + (Math.abs(r.residual/r.actual)*100).toFixed(2) + '%';
    }).join('\n');
    
    const sumAbsResiduals = residualDetails.reduce(function(s, r) { return s + Math.abs(r.residual); }, 0);
    const sumMape = residualDetails.reduce(function(s, r) { return s + Math.abs(r.residual/r.actual)*100; }, 0);
    
    let steps = [
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">',
        
        // HEADER SECTION
        '<div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b45 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">',
        '<div style="display: flex; align-items: center; gap: 12px;">',
        '<span style="font-size: 32px;">📈</span>',
        '<h2 style="margin: 0;">Regression Model Dashboard</h2>',
        '</div>',
        '<p style="margin: 8px 0 0 0; opacity: 0.9;">Model Performance Analysis & Diagnostics | ' + n + ' Observations</p>',
        '</div>',
        
        // KPI CARDS SECTION
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 28px;">',
        
        // R² Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">R-Squared (R²)</span>',
        '<span style="font-size: 24px;">📊</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + (rSquared * 100).toFixed(1) + '<span style="font-size: 18px;">%</span></div>',
        '<div style="font-size: 12px; display: flex; align-items: center; gap: 8px;">',
        '<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ' + r2Perf.bg + '; color: ' + r2Perf.color + ';">' + r2Perf.icon + ' ' + r2Perf.text + '</span>',
        '<span>Variance explained</span>',
        '</div></div>',
        
        // Adjusted R² Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">Adjusted R²</span>',
        '<span style="font-size: 24px;">⚙️</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + (adjRSquared * 100).toFixed(1) + '<span style="font-size: 18px;">%</span></div>',
        '<div style="font-size: 12px;">Penalized for ' + (n-2) + ' df</div></div>',
        
        // RMSE Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">RMSE</span>',
        '<span style="font-size: 24px;">🎯</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + rmse.toFixed(4) + '</div>',
        '<div style="font-size: 12px;">Root Mean Square Error</div></div>',
        
        // MAE Card (with Mean Y)
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">MAE</span>',
        '<span style="font-size: 24px;">📏</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + mae.toFixed(4) + '</div>',
        '<div style="font-size: 12px;">Mean Absolute Error</div>',
        '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">',
        '<span style="font-size: 11px; color: #6b7280;">Mean of Y (ȳ) = ' + meanY.toFixed(4) + '</span>',
        '</div></div>',
        
        // MAPE Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">MAPE</span>',
        '<span style="font-size: 24px;">%</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + mape.toFixed(1) + '<span style="font-size: 18px;">%</span></div>',
        '<div style="font-size: 12px;">',
        '<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ' + mapePerf.bg + '; color: ' + mapePerf.color + ';">' + mapePerf.icon + ' ' + (mape < 10 ? 'High Accuracy' : (mape < 20 ? 'Moderate Accuracy' : 'Low Accuracy')) + '</span>',
        '</div></div>',
        
        // Sum of Squares Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">Sum of Squares</span>',
        '<span style="font-size: 24px;">🔢</span>',
        '</div>',
        '<div style="font-size: 20px; font-weight: 800; color: #1f2937;">SS<sub>res</sub>: ' + ssRes.toFixed(2) + '</div>',
        '<div style="font-size: 12px;">SS<sub>tot</sub>: ' + ssTot.toFixed(2) + '</div></div>',
        '</div>',
        
        // MAIN CONTENT: 2 COLUMNS (Data Table + Expandable Metrics)
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">',
        
        // LEFT COLUMN: Data Table
        '<div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">',
        '<div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">',
        '<span>📋</span> Observed vs Predicted Values',
        '</div>',
        '<div style="overflow-x: auto;">',
        '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">',
        '<thead><tr style="background: #f8fafc;">',
        '<th style="padding: 12px; text-align: center;">#</th>',
        '<th style="padding: 12px; text-align: center;">Actual (y)</th>',
        '<th style="padding: 12px; text-align: center;">Predicted (ŷ)</th>',
        '<th style="padding: 12px; text-align: center;">Residual (e)</th>',
        '<th style="padding: 12px; text-align: center;">e²</th>',
        '<th style="padding: 12px; text-align: center;">(y-ȳ)²</th>',
        '</tr></thead>',
        '<tbody>'
    ];
    
    // Add table rows
    for (var i = 0; i < residualDetails.length; i++) {
        var r = residualDetails[i];
        steps.push('<tr style="border-bottom: 1px solid #f1f5f9;">');
        steps.push('<td style="padding: 10px; text-align: center;">' + (i+1) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center;"><strong>' + r.actual + '</strong></td>');
        steps.push('<td style="padding: 10px; text-align: center;">' + r.predicted.toFixed(4) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center; color: ' + (r.residual >= 0 ? '#10b981' : '#ef4444') + ';">' + (r.residual >= 0 ? '+' : '') + r.residual.toFixed(4) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center;">' + r.squaredRes.toFixed(4) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center;">' + r.squaredDev.toFixed(4) + '</td>');
        steps.push('</tr>');
    }
    
    steps.push('<tr style="background: #f1f5f9; font-weight: 600;">');
    steps.push('<td colspan="4" style="padding: 10px; text-align: right;">SUMS →</td>');
    steps.push('<td style="padding: 10px; text-align: center;">' + ssRes.toFixed(4) + '</td>');
    steps.push('<td style="padding: 10px; text-align: center;">' + ssTot.toFixed(4) + '</td>');
    steps.push('</tr></tbody></table></div></div>');
    
    // RIGHT COLUMN: Expandable Metrics
    steps.push('<div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">');
    steps.push('<div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">');
    steps.push('<span>🧮</span> How Metrics Are Calculated');
    steps.push('<span style="font-size: 12px; margin-left: auto;">▼ Click any metric to expand</span>');
    steps.push('</div>');
    
    // R² Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div onclick="toggleMetric(this)" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">📐 R-Squared (R²)</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + rSquared.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub><br><br>');
    steps.push('<strong>Step 1 - Calculate SS<sub>res</sub>:</strong><br>' + ssResCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>SS<sub>res</sub> = ' + ssRes.toFixed(4) + '</strong><br><br>');
    steps.push('<strong>Step 2 - Calculate SS<sub>tot</sub>:</strong><br>' + ssTotCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>SS<sub>tot</sub> = ' + ssTot.toFixed(4) + '</strong><br><br>');
    steps.push('<strong>Step 3 - Apply formula:</strong><br>');
    steps.push('R² = 1 - (' + ssRes.toFixed(4) + ' / ' + ssTot.toFixed(4) + ')<br>');
    steps.push('R² = 1 - ' + (ssRes/ssTot).toFixed(6) + '<br>');
    steps.push('<strong>R² = ' + rSquared.toFixed(6) + '</strong><br><br>');
    steps.push('<span style="background: #e0e7ff; padding: 2px 6px; border-radius: 4px;">✅ ' + (rSquared * 100).toFixed(1) + '% of variance explained</span>');
    steps.push('</div></div>');
    
    // Adjusted R² Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div onclick="toggleMetric(this)" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">🔧 Adjusted R-Squared</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + adjRSquared.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> R²<sub>adj</sub> = 1 - (1-R²)(n-1)/(n-k-1)<br><br>');
    steps.push('<strong>Step 1:</strong> 1 - R² = 1 - ' + rSquared.toFixed(6) + ' = ' + (1-rSquared).toFixed(6) + '<br>');
    steps.push('<strong>Step 2:</strong> (n-1)/(n-k-1) = (' + n + '-1)/(' + n + '-2) = ' + ((n-1)/(n-2)).toFixed(4) + '<br>');
    steps.push('<strong>Step 3:</strong> Multiply: ' + (1-rSquared).toFixed(6) + ' × ' + ((n-1)/(n-2)).toFixed(4) + ' = ' + ((1-rSquared)*(n-1)/(n-2)).toFixed(6) + '<br>');
    steps.push('<strong>Step 4:</strong> 1 - ' + ((1-rSquared)*(n-1)/(n-2)).toFixed(6) + ' = <strong>' + adjRSquared.toFixed(6) + '</strong><br>');
    steps.push('</div></div>');
    
    // RMSE Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div onclick="toggleMetric(this)" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">📏 RMSE (Root Mean Square Error)</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + rmse.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> RMSE = √(SS<sub>res</sub>/n)<br><br>');
    steps.push('<strong>Step 1:</strong> SS<sub>res</sub>/n = ' + ssRes.toFixed(4) + ' / ' + n + ' = ' + (ssRes/n).toFixed(4) + '<br>');
    steps.push('<strong>Step 2:</strong> √(' + (ssRes/n).toFixed(4) + ') = <strong>' + rmse.toFixed(6) + '</strong><br><br>');
    steps.push('<span>📖 Typical prediction error: ±' + rmse.toFixed(4) + ' units</span>');
    steps.push('</div></div>');
    
    // MAE Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div onclick="toggleMetric(this)" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">📊 MAE (Mean Absolute Error)</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + mae.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> MAE = (1/n) × Σ|yᵢ - ŷᵢ|<br><br>');
    steps.push('<strong>Step 1 - Calculate absolute residuals:</strong><br>' + maeCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>Sum of |eᵢ| = ' + sumAbsResiduals.toFixed(4) + '</strong><br><br>');
    steps.push('<strong>Step 2 - Divide by n:</strong><br>');
    steps.push('MAE = ' + sumAbsResiduals.toFixed(4) + ' / ' + n + '<br>');
    steps.push('<strong>MAE = ' + mae.toFixed(6) + '</strong>');
    steps.push('</div></div>');
    
    // MAPE Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div onclick="toggleMetric(this)" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">% MAPE (Mean Absolute Percentage Error)</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + mape.toFixed(2) + '%</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> MAPE = (100/n) × Σ|(yᵢ - ŷᵢ)/yᵢ|<br><br>');
    steps.push('<strong>Step 1 - Calculate percentage errors:</strong><br>' + mapeCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>Sum of percentages = ' + sumMape.toFixed(2) + '%</strong><br><br>');
    steps.push('<strong>Step 2 - Divide by n:</strong><br>');
    steps.push('MAPE = ' + sumMape.toFixed(2) + ' / ' + n + '<br>');
    steps.push('<strong>MAPE = ' + mape.toFixed(2) + '%</strong>');
    steps.push('</div></div>');
    steps.push('</div></div>');
    
    // BOTTOM SECTION: Complete Calculation Details for All Metrics
    steps.push('<div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 24px; margin-top: 20px; border: 1px solid #bbf7d0;">');
    steps.push('<div style="font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">');
    steps.push('<span>📚</span> Complete Formula Reference & Calculation Summary');
    steps.push('</div>');
    
    steps.push('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">');
    
    // SSres Detailed Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">📐 Sum of Squared Residuals (SS<sub>res</sub>)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">SS<sub>res</sub> = Σ(yᵢ - ŷᵢ)²</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">');
    steps.push(ssResCalculation.replace(/\n/g, '<br>'));
    steps.push('</div>');
    steps.push('<p style="margin-top: 8px;"><strong>Total SS<sub>res</sub> = ' + ssRes.toFixed(4) + '</strong></p>');
    steps.push('</div>');
    
    // SStot Detailed Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">📊 Total Sum of Squares (SS<sub>tot</sub>)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">SS<sub>tot</sub> = Σ(yᵢ - ȳ)² where ȳ = ' + meanY.toFixed(4) + '</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">');
    steps.push(ssTotCalculation.replace(/\n/g, '<br>'));
    steps.push('</div>');
    steps.push('<p style="margin-top: 8px;"><strong>Total SS<sub>tot</sub> = ' + ssTot.toFixed(4) + '</strong></p>');
    steps.push('</div>');
    
    // R² Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">🎯 R-Squared (R²)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">R² = 1 - SS<sub>res</sub>/SS<sub>tot</sub></p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px;">');
    steps.push('R² = 1 - (' + ssRes.toFixed(4) + ' / ' + ssTot.toFixed(4) + ')<br>');
    steps.push('R² = 1 - ' + (ssRes/ssTot).toFixed(6) + '<br>');
    steps.push('<strong>R² = ' + rSquared.toFixed(6) + '</strong> (' + (rSquared*100).toFixed(1) + '%)');
    steps.push('</div></div>');
    
    // Adjusted R² Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">⚙️ Adjusted R-Squared</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">R²<sub>adj</sub> = 1 - (1-R²)(n-1)/(n-2)</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px;">');
    steps.push('1 - R² = ' + (1-rSquared).toFixed(6) + '<br>');
    steps.push('(n-1)/(n-2) = ' + (n-1) + '/' + (n-2) + ' = ' + ((n-1)/(n-2)).toFixed(4) + '<br>');
    steps.push('Product = ' + (1-rSquared).toFixed(6) + ' × ' + ((n-1)/(n-2)).toFixed(4) + ' = ' + ((1-rSquared)*(n-1)/(n-2)).toFixed(6) + '<br>');
    steps.push('R²<sub>adj</sub> = 1 - ' + ((1-rSquared)*(n-1)/(n-2)).toFixed(6) + '<br>');
    steps.push('<strong>R²<sub>adj</sub> = ' + adjRSquared.toFixed(6) + '</strong> (' + (adjRSquared*100).toFixed(1) + '%)');
    steps.push('</div></div>');
    
    // RMSE Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">📏 RMSE (Root Mean Square Error)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">RMSE = √(SS<sub>res</sub>/n)</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px;">');
    steps.push('SS<sub>res</sub>/n = ' + ssRes.toFixed(4) + ' / ' + n + ' = ' + (ssRes/n).toFixed(4) + '<br>');
    steps.push('RMSE = √(' + (ssRes/n).toFixed(4) + ')<br>');
    steps.push('<strong>RMSE = ' + rmse.toFixed(6) + '</strong>');
    steps.push('</div></div>');
    
    // MAE Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">📊 MAE (Mean Absolute Error)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">MAE = (1/n) Σ|yᵢ - ŷᵢ|</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">');
    steps.push(maeCalculation.replace(/\n/g, '<br>'));
    steps.push('<br><strong>Sum |eᵢ| = ' + sumAbsResiduals.toFixed(4) + '</strong><br>');
    steps.push('MAE = ' + sumAbsResiduals.toFixed(4) + ' / ' + n + ' = <strong>' + mae.toFixed(6) + '</strong>');
    steps.push('</div></div>');
    
    // MAPE Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">% MAPE (Mean Absolute Percentage Error)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">MAPE = (100/n) Σ|(yᵢ - ŷᵢ)/yᵢ|</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">');
    steps.push(mapeCalculation.replace(/\n/g, '<br>'));
    steps.push('<br><strong>Sum of % = ' + sumMape.toFixed(2) + '%</strong><br>');
    steps.push('MAPE = ' + sumMape.toFixed(2) + ' / ' + n + ' = <strong>' + mape.toFixed(2) + '%</strong>');
    steps.push('</div></div>');
    
    steps.push('</div></div>');
    
    // Insights Section
    steps.push('<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; margin-top: 20px;">');
    steps.push('<div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">');
    steps.push('<span>💡</span> Model Performance Insights');
    steps.push('</div>');
    steps.push('<div style="font-size: 14px; line-height: 1.6; color: #78350f;">');
    steps.push('<strong>R² = ' + (rSquared * 100).toFixed(1) + '%</strong> — ' + (rSquared >= 0.7 ? 'The model explains a substantial portion of variance, indicating strong predictive power.' : (rSquared >= 0.4 ? 'The model shows moderate explanatory power, but there may be room for improvement.' : 'The model explains limited variance, suggesting other factors may be important.')) + '<br><br>');
    steps.push('<strong>RMSE = ' + rmse.toFixed(4) + '</strong> vs <strong>MAE = ' + mae.toFixed(4) + '</strong> — ' + ((rmse - mae) > (rmse * 0.2) ? 'The larger RMSE compared to MAE suggests presence of some larger prediction errors/outliers.' : 'RMSE and MAE are close, indicating consistent prediction errors across observations.') + '<br><br>');
    steps.push('<strong>MAPE = ' + mape.toFixed(1) + '%</strong> — ' + (mape < 10 ? 'Excellent forecasting accuracy (highly reliable predictions).' : (mape < 20 ? 'Good forecasting accuracy with acceptable error margins.' : 'Moderate accuracy; consider model refinement or additional predictors.')));
    steps.push('</div></div>');
    
    // JavaScript
    steps.push('<script>');
    steps.push('function toggleMetric(element) {');
    steps.push('  var formulaDiv = element.nextElementSibling;');
    steps.push('  if (formulaDiv.style.display === "none" || formulaDiv.style.display === "") {');
    steps.push('    formulaDiv.style.display = "block";');
    steps.push('  } else {');
    steps.push('    formulaDiv.style.display = "none";');
    steps.push('  }');
    steps.push('}');
    steps.push('var firstMetric = document.querySelectorAll(".metric-formula")[0];');
    steps.push('if (firstMetric) firstMetric.style.display = "block";');
    steps.push('<\/script>');
    steps.push('</div>');
    
    var finalSteps = steps.join('');
    
    return { 
        rSquared: rSquared, 
        adjRSquared: adjRSquared, 
        rmse: rmse, 
        mae: mae, 
        mape: mape, 
        ssRes: ssRes, 
        ssTot: ssTot, 
        meanY: meanY,
        n: n,
        steps: finalSteps 
    };
}
// ========== REGRESSION SETUP FUNCTIONS ==========
function setupSimpleLinearLogic() {
    const computeBtn = document.getElementById("simpleLinearComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("simpleXInput").value;
        const rawY = document.getElementById("simpleYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("simpleLinearResultArea");
        const valueSpan = document.getElementById("simpleLinearValueDisplay");
        const stepsSpan = document.getElementById("simpleLinearStepsDisplay");
        
        const result = computeSimpleLinearRegression(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `ŷ = ${result.intercept.toFixed(4)} + ${result.slope.toFixed(4)}x | R² = ${result.rSquared.toFixed(4)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("simpleLinearClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("simpleXInput").value = '';
            document.getElementById("simpleYInput").value = '';
            document.getElementById("simpleLinearResultArea").style.display = 'none';
        });
    }
}

function setupMultipleLinearLogic() {
    const computeBtn = document.getElementById("multipleLinearComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("multipleData").value;
        const lines = raw.trim().split(/\r?\n/);
        let dataMatrix = [];
        
        // Skip header row if present
        let startRow = 0;
        if (lines.length > 0 && lines[0].toLowerCase().includes('y') && lines[0].toLowerCase().includes('x')) {
            startRow = 1;
        }
        
        for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") continue;
            const values = parseNumbersFromInput(line);
            if (values.length > 0) {
                dataMatrix.push(values);
            }
        }
        
        const resultDiv = document.getElementById("multipleLinearResultArea");
        const valueSpan = document.getElementById("multipleLinearValueDisplay");
        const stepsSpan = document.getElementById("multipleLinearStepsDisplay");
        
        if (dataMatrix.length === 0) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in the correct format.";
            return;
        }
        
        const result = computeMultipleLinearRegression(dataMatrix);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `${result.n} observations, ${result.p} predictors | Mean Y = ${result.yMean.toFixed(4)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("multipleLinearClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("multipleData").value = '';
            document.getElementById("multipleLinearResultArea").style.display = 'none';
        });
    }
}

function setupModelSummaryLogic() {
    const computeBtn = document.getElementById("modelSummaryComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("modelSummaryData").value;
        const lines = raw.trim().split(/\r?\n/);
        let actual = [];
        let predicted = [];
        
        // Skip header row if present
        let startRow = 0;
        if (lines.length > 0 && (lines[0].toLowerCase().includes('actual') || lines[0].toLowerCase().includes('predicted'))) {
            startRow = 1;
        }
        
        for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") continue;
            const values = parseNumbersFromInput(line);
            if (values.length >= 2) {
                actual.push(values[0]);
                predicted.push(values[1]);
            }
        }
        
        const resultDiv = document.getElementById("modelSummaryResultArea");
        const valueSpan = document.getElementById("modelSummaryValueDisplay");
        const stepsSpan = document.getElementById("modelSummaryStepsDisplay");
        
        if (actual.length === 0) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter actual and predicted values.";
            return;
        }
        
        const result = computeModelSummary(actual, predicted);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `R² = ${result.rSquared.toFixed(4)} | RMSE = ${result.rmse.toFixed(4)} | MAE = ${result.mae.toFixed(4)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("modelSummaryClearBtn", "modelSummaryData", "modelSummaryResultArea");
}
