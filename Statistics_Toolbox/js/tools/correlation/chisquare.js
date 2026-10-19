/* Chisquare: chisquare tool (render, compute, setup) */

// ========== CHI-SQUARE TEST RENDER FUNCTION ==========
// ========== CHI-SQUARE TEST RENDER FUNCTION ==========
function renderChisquareInterface() {
    return buildInterface({
        id: "statChisquareInterface",
        title: "🔬 Chi-Square Test of Independence",
        formula: "📌 χ² = Σ (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ",
        desc: "Tests whether two categorical variables are independent. Null hypothesis: variables are independent.",
        inputs: [
            {
                label: "📋 Enter data as comma-separated pairs (category1, category2):",
                textarea: {
                    id: "chisquareData",
                    rows: "4",
                    placeholder: "Example:&#10;Red, Apple&#10;Green, Apple&#10;Red, Orange&#10;Red, Apple&#10;Green, Orange&#10;Red, Orange"
                }
            },
            {
                hint: "Each line: value for Row Variable, value for Column Variable",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "chisquareAlpha", style: FIELD_STYLE },
                options: [
                    ["0.10", "α = 0.10 (90% Confidence Level)"],
                    ["0.05", "α = 0.05 (95% Confidence Level) - Standard", true],
                    ["0.01", "α = 0.01 (99% Confidence Level)"],
                    ["0.001", "α = 0.001 (99.9% Confidence Level)"]
                ]
            }
        ],
        run: { id: "chisquareComputeBtn", text: "🔬 Run Chi-Square Test + Full Steps" },
        clear: { id: "chisquareClearBtn", text: "Clear" },
        result: {
            area: "chisquareResultArea",
            label: "🎯 CHI-SQUARE TEST RESULTS",
            value: "chisquareValueDisplay",
            steps: "chisquareStepsDisplay"
        }
    });
}

// ========== CHI-SQUARE TEST COMPUTATION ==========
// ========== CHI-SQUARE TEST COMPUTATION ==========
function computeChisquareWithSteps(inputText, alpha = 0.05) {
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
    
    // Create observed frequencies
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
    
    const grandTotal = pairs.length;
    const df = (rowCategories.length - 1) * (colCategories.length - 1);
    
    // Calculate expected frequencies and chi-square
    let chiSquare = 0;
    let calculationRows = [];
    
    for (let row of rowCategories) {
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / grandTotal;
            const observedVal = observed[row][col];
            const contribution = Math.pow(observedVal - expected, 2) / expected;
            chiSquare += contribution;
            calculationRows.push({ row, col, observed: observedVal, expected, contribution });
        }
    }
    
    // Exact critical value for any df and alpha
    const criticalValue = chiSquareCriticalValue(alpha, df);
    
    // p-value from the exact chi-square distribution
    const pValue = 1 - chiSquareCDF(chiSquare, df);
    
    // Determine conclusion
    let conclusion, interpretation, recommendation;
    if (chiSquare > criticalValue) {
        conclusion = "REJECT the null hypothesis";
        interpretation = "There IS a statistically significant association between the variables.";
        recommendation = `At α = ${alpha}, we have sufficient evidence that the variables are NOT independent.`;
    } else {
        conclusion = "FAIL TO REJECT the null hypothesis";
        interpretation = "There is NOT enough evidence of an association between the variables.";
        recommendation = `At α = ${alpha}, we cannot conclude that the variables are dependent. They may be independent.`;
    }
    
    // Build steps HTML
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🔬</span>
                <h2 style="margin: 0;">Chi-Square Test of Independence</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: χ² = Σ (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #1a5490;">
                    <div style="font-size: 12px; color: #6c757d;">Total Observations</div>
                    <div style="font-size: 28px; font-weight: 700;">${grandTotal}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Row Categories</div>
                    <div style="font-size: 20px;">${rowCategories.length}</div>
                    <div style="font-size: 11px;">${rowCategories.join(', ')}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Column Categories</div>
                    <div style="font-size: 20px;">${colCategories.length}</div>
                    <div style="font-size: 11px;">${colCategories.join(', ')}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #ffc107;">
                    <div style="font-size: 12px; color: #6c757d;">Degrees of Freedom</div>
                    <div style="font-size: 28px; font-weight: 700;">${df}</div>
                    <div style="font-size: 11px;">= (${rowCategories.length}-1) × (${colCategories.length}-1)</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490;">📋 Observed Frequencies (Oᵢⱼ)</h3>
            <table style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px; border: 1px solid #ddd;"></th>`;
    for (let col of colCategories) {
        steps += `<th style="padding: 10px; border: 1px solid #ddd;">${col}</th>`;
    }
    steps += `<th style="padding: 10px; border: 1px solid #ddd;">Row Total</th>
                    </tr>
                </thead>
                <tbody>`;
    for (let row of rowCategories) {
        steps += `<tr>
            <th style="padding: 10px; border: 1px solid #ddd; background: #e8f4f8;">${row}</th>`;
        for (let col of colCategories) {
            steps += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${observed[row][col]}</td>`;
        }
        steps += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; background: #e8f4f8;">${rowTotals[row]}</td>
        </tr>`;
    }
    steps += `<tr>
        <th style="padding: 10px; border: 1px solid #ddd; background: #e8f4f8;">Column Total</th>`;
    for (let col of colCategories) {
        steps += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; background: #e8f4f8;">${colTotals[col]}</td>`;
    }
    steps += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; background: #e8f4f8;">${grandTotal}</td>
    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate Expected Frequencies</strong></div>
                </div>
                <div style="margin-left: 40px; font-size: 13px;">Formula: Eᵢⱼ = (Row Total × Column Total) / Grand Total</div>`;
    
    for (let row of rowCategories) {
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / grandTotal;
            steps += `<div style="margin-left: 40px; font-family: monospace; margin-top: 8px;">
                E(${row},${col}) = (${rowTotals[row]} × ${colTotals[col]}) / ${grandTotal} = ${expected.toFixed(4)}
            </div>`;
        }
    }
    
    steps += `</div>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate Chi-Square Contributions</strong></div>
                </div>
                <div style="margin-left: 40px; font-size: 13px;">Formula: (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ</div>`;
    
    for (let row of rowCategories) {
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / grandTotal;
            const observedVal = observed[row][col];
            const contribution = Math.pow(observedVal - expected, 2) / expected;
            steps += `<div style="margin-left: 40px; font-family: monospace; margin-top: 8px;">
                (${observedVal} - ${expected.toFixed(4)})² / ${expected.toFixed(4)} = ${contribution.toFixed(6)}
            </div>`;
        }
    }
    
    steps += `</div>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Sum All Contributions</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 18px; font-weight: 700;">
                    χ² = ${chiSquare.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Hypothesis Test Decision</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Significance Level (α)</div>
                    <div style="font-size: 20px; font-weight: 700;">${alpha} (${(1-alpha)*100}% Confidence)</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Critical Value</div>
                    <div style="font-size: 20px; font-weight: 700;">χ²_critical = ${criticalValue.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">p-value</div>
                    <div style="font-size: 20px; font-weight: 700;">${pValue.toFixed(6)}</div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${chiSquare > criticalValue ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>Chi-Square Statistic:</strong> χ² = ${chiSquare.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> df = ${df}</div>
            <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                <strong>Recommendation:</strong> ${recommendation}
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Null Hypothesis (H₀):</strong> The row and column variables are independent (no association).<br>
                💡 <strong>Alternative Hypothesis (H₁):</strong> The row and column variables are dependent (there is an association).
            </div>
        </div>
    </div>`;
    
    return { chiSquare, df, criticalValue, pValue, alpha, conclusion, interpretation, steps, observed, expected: calculationRows };
}

// ========== CHI-SQUARE TEST SETUP ==========
function setupChisquareLogic() {
    const computeBtn = document.getElementById("chisquareComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("chisquareData").value;
        const alphaSelect = document.getElementById("chisquareAlpha");
        const alpha = parseFloat(alphaSelect.value);
        const resultDiv = document.getElementById("chisquareResultArea");
        const valueSpan = document.getElementById("chisquareValueDisplay");
        const stepsSpan = document.getElementById("chisquareStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter data pairs (category1, category2)";
            return;
        }
        
        const result = computeChisquareWithSteps(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSquare.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)} | α = ${result.alpha}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("chisquareClearBtn", "chisquareData", "chisquareResultArea");
}
