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
            inputModeItem("chisquareMode", "🧮 Table of counts (as given in a textbook)"),
            {
                html: modeGroupHtml("raw", '<label>📋 Enter data as comma-separated pairs (category1, category2):</label>\n<textarea id="chisquareData" rows="4" placeholder="Example:&#10;Red, Apple&#10;Green, Apple&#10;Red, Orange&#10;Red, Apple&#10;Green, Orange&#10;Red, Orange"></textarea>\n<small style="' + HINT_STYLE + '">Each line: value for Row Variable, value for Column Variable</small>') +
                    modeGroupHtml("summary", '<label>📋 Observed counts, one table row per line:</label>\n<textarea id="chisquareTable" rows="4" placeholder="Example:&#10;30, 20, 10&#10;20, 25, 15">30, 20, 10&#10;20, 25, 15</textarea>\n<small style="' + HINT_STYLE + '">Each line is a row of the table; separate the counts with commas or spaces.</small>')
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
    
    return computeChisquareFromCounts(rowCategories, colCategories, observed, rowTotals, colTotals, pairs.length, alpha);
}

// The same test from a table of counts, one line per row ("20, 30, 10"), as a textbook gives it
function computeChisquareFromTable(tableText, alpha = 0.05) {
    const rows = tableText.trim().split(/\r?\n/).map(l => l.trim()).filter(l => l !== "").map(l => l.split(/[,\s]+/).filter(v => v !== "").map(Number));
    if (rows.length < 2 || rows[0].length < 2) return { error: true, message: "Enter a table with at least 2 rows and 2 columns of counts, one row per line." };
    if (rows.some(r => r.length !== rows[0].length)) return { error: true, message: "Every row of the table must have the same number of counts." };
    if (rows.some(r => r.some(v => !(v >= 0) || !isFinite(v)))) return { error: true, message: "The counts must be numbers that are 0 or more." };
    const rowCategories = rows.map((_, i) => "Row " + (i + 1));
    const colCategories = rows[0].map((_, j) => "Col " + (j + 1));
    const observed = Object.create(null), rowTotals = Object.create(null), colTotals = Object.create(null);
    colCategories.forEach(c => { colTotals[c] = 0; });
    let grandTotal = 0;
    rows.forEach((r, i) => {
        observed[rowCategories[i]] = Object.create(null);
        rowTotals[rowCategories[i]] = 0;
        r.forEach((v, j) => {
            observed[rowCategories[i]][colCategories[j]] = v;
            rowTotals[rowCategories[i]] += v;
            colTotals[colCategories[j]] += v;
            grandTotal += v;
        });
    });
    if (Object.values(rowTotals).some(t => t === 0) || Object.values(colTotals).some(t => t === 0)) return { error: true, message: "A row or a column of the table adds up to 0, so its expected counts are 0 and χ² is undefined. Remove it." };
    return computeChisquareFromCounts(rowCategories, colCategories, observed, rowTotals, colTotals, grandTotal, alpha);
}

function computeChisquareFromCounts(rowCategories, colCategories, observed, rowTotals, colTotals, grandTotal, alpha) {
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
    
    // 2×2 table: Fisher's exact test needs no large-sample approximation, so it is reported next to the chi-square p-value
    // (and recommended when an expected count is below 5)
    const isTwoByTwo = rowCategories.length === 2 && colCategories.length === 2 && rowCategories.every(r => colCategories.every(c => Number.isInteger(observed[r][c])));
    const fisherP = isTwoByTwo ? fisherExact2x2(observed[rowCategories[0]][colCategories[0]], observed[rowCategories[0]][colCategories[1]], observed[rowCategories[1]][colCategories[0]], observed[rowCategories[1]][colCategories[1]]) : null;
    const lowExpected = calculationRows.some(r => r.expected < 5);
    const fisherNote = fisherP === null
        ? (lowExpected ? '<div><strong>⚠ Some expected counts are below 5:</strong> the chi-square p-value is unreliable here. Combine sparse categories or collect more data.</div>' : '')
        : `<div><strong>Fisher's exact p-value (2×2):</strong> ${fisherP.toFixed(6)}${lowExpected ? ' ⚠ an expected count is below 5, so prefer this exact p-value to the chi-square one' : ' (exact, for comparison)'}</div>`;
    
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
            ${fisherNote}
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
    
    return { chiSquare, df, criticalValue, pValue, fisherP, alpha, conclusion, interpretation, steps, observed, expected: calculationRows, chart: { dist: 'chisq', df: df, stat: chiSquare, alternative: 'greater', alpha: alpha, statLabel: 'χ²', critical: { lower: null, upper: criticalValue } } };
}

// ========== CHI-SQUARE TEST SETUP ==========
function setupChisquareLogic() {
    const computeBtn = document.getElementById("chisquareComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const tableMode = document.querySelector('#statChisquareInterface [data-mode-select]').value === 'summary';
        const raw = document.getElementById(tableMode ? "chisquareTable" : "chisquareData").value;
        const alphaSelect = document.getElementById("chisquareAlpha");
        const alpha = parseFloat(alphaSelect.value);
        const resultDiv = document.getElementById("chisquareResultArea");
        const valueSpan = document.getElementById("chisquareValueDisplay");
        const stepsSpan = document.getElementById("chisquareStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = tableMode ? "Enter the table of counts" : "Enter data pairs (category1, category2)";
            hideAllStatCharts();
            return;
        }
        
        const result = tableMode ? computeChisquareFromTable(raw, alpha) : computeChisquareWithSteps(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideAllStatCharts();
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSquare.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)} | α = ${result.alpha}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("chisquareResultArea", result.chart);
        }
    });
    
    attachClearHandler("chisquareClearBtn", ["chisquareData", "chisquareTable"], "chisquareResultArea");
}
