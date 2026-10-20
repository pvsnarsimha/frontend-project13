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
            pairs.push({ row: escapeHtml(parts[0]), col: escapeHtml(parts[1]) });   // category labels reach the HTML steps, so they are escaped once, here
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
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">🔬</span>
                <h2 class="s-f8a94d">Chi-Square Test of Independence</h2>
            </div>
            <p class="s-259079">Formula: χ² = Σ (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-a7ffd4 gen-grid">
                <div class="s-6ead76">
                    <div class="s-42da0a">Total Observations</div>
                    <div class="s-93c0a8">${grandTotal}</div>
                </div>
                <div class="s-a31255">
                    <div class="s-42da0a">Row Categories</div>
                    <div class="s-23ee8e">${rowCategories.length}</div>
                    <div class="s-d52d0d">${rowCategories.join(', ')}</div>
                </div>
                <div class="s-d2b9d3">
                    <div class="s-42da0a">Column Categories</div>
                    <div class="s-23ee8e">${colCategories.length}</div>
                    <div class="s-d52d0d">${colCategories.join(', ')}</div>
                </div>
                <div class="s-647a92">
                    <div class="s-42da0a">Degrees of Freedom</div>
                    <div class="s-93c0a8">${df}</div>
                    <div class="s-d52d0d">= (${rowCategories.length}-1) × (${colCategories.length}-1)</div>
                </div>
            </div>
        </div>
        
        <div class="s-8b4bbf">
            <h3 class="s-f1a16d">📋 Observed Frequencies (Oᵢⱼ)</h3>
            <table class="s-fb047b gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-35e61a"></th>`;
    for (let col of colCategories) {
        steps += `<th class="s-35e61a">${col}</th>`;
    }
    steps += `<th class="s-35e61a">Row Total</th>
                    </tr>
                </thead>
                <tbody>`;
    for (let row of rowCategories) {
        steps += `<tr>
            <th class="s-784ef0">${row}</th>`;
        for (let col of colCategories) {
            steps += `<td class="s-1caf01">${observed[row][col]}</td>`;
        }
        steps += `<td class="s-959cae">${rowTotals[row]}</td>
        </tr>`;
    }
    steps += `<tr>
        <th class="s-784ef0">Column Total</th>`;
    for (let col of colCategories) {
        steps += `<td class="s-959cae">${colTotals[col]}</td>`;
    }
    steps += `<td class="s-959cae">${grandTotal}</td>
    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step-by-Step Calculation</h3>
            <div class="s-ca9e5c">
                <div class="s-578789 gen-flex">
                    <div class="s-541469 gen-flex gen-sized">1</div>
                    <div><strong>Calculate Expected Frequencies</strong></div>
                </div>
                <div class="s-dd65a8">Formula: Eᵢⱼ = (Row Total × Column Total) / Grand Total</div>`;
    
    for (let row of rowCategories) {
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / grandTotal;
            steps += `<div class="s-cce988">
                E(${row},${col}) = (${rowTotals[row]} × ${colTotals[col]}) / ${grandTotal} = ${expected.toFixed(4)}
            </div>`;
        }
    }
    
    steps += `</div>
            <div class="s-ca9e5c">
                <div class="s-578789 gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Calculate Chi-Square Contributions</strong></div>
                </div>
                <div class="s-dd65a8">Formula: (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ</div>`;
    
    for (let row of rowCategories) {
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / grandTotal;
            const observedVal = observed[row][col];
            const contribution = Math.pow(observedVal - expected, 2) / expected;
            steps += `<div class="s-cce988">
                (${observedVal} - ${expected.toFixed(4)})² / ${expected.toFixed(4)} = ${contribution.toFixed(6)}
            </div>`;
        }
    }
    
    steps += `</div>
            <div class="s-6025fc">
                <div class="s-578789 gen-flex">
                    <div class="s-541469 gen-flex gen-sized">3</div>
                    <div><strong>Sum All Contributions</strong></div>
                </div>
                <div class="s-2f80ad">
                    χ² = ${chiSquare.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Hypothesis Test Decision</h3>
            <div class="s-0ad64d gen-grid">
                <div class="s-63afdf">
                    <div class="s-42da0a">Significance Level (α)</div>
                    <div class="s-9d1896">${alpha} (${(1-alpha)*100}% Confidence)</div>
                </div>
                <div class="s-63afdf">
                    <div class="s-42da0a">Critical Value</div>
                    <div class="s-9d1896">χ²_critical = ${criticalValue.toFixed(4)}</div>
                </div>
                <div class="s-63afdf">
                    <div class="s-42da0a">p-value</div>
                    <div class="s-9d1896">${pValue.toFixed(6)}</div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${chiSquare > criticalValue ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>Chi-Square Statistic:</strong> χ² = ${chiSquare.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> df = ${df}</div>
            <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                <strong>Recommendation:</strong> ${recommendation}
            </div>
            <div class="s-8d2e44">
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
