/* ChiSquareGoodness: chisquaregoodness tool (render, compute, setup) */

// ========== CHI-SQUARE GOODNESS-OF-FIT TEST INTERFACE ==========
function renderChiSquareGoodnessInterface() {
    return buildInterface({
        id: "statChiSquareGoodnessInterface",
        title: "χ² Chi-Square Goodness-of-Fit Test",
        formula: "📌 χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ",
        desc: "Tests whether observed frequencies match expected frequencies for a categorical variable. H₀: The data follows the specified distribution.",
        inputs: [
            {
                label: "📋 Enter observed frequencies (comma-separated):",
                textarea: { id: "goodnessObserved", rows: "3", placeholder: "Example: 20, 30, 25, 15, 10" }
            },
            {
                label: "📋 Enter expected frequencies (comma-separated):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "goodnessExpected", rows: "3", placeholder: "Example: 20, 20, 20, 20, 20" }
            },
            {
                hint: "Expected values can be counts, or proportions that sum to 1 (they are then scaled by the total observed count)",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "goodnessAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS
            }
        ],
        run: { id: "goodnessComputeBtn", text: "χ² Run Goodness-of-Fit Test + Steps" },
        clear: { id: "goodnessClearBtn", text: "Clear" },
        result: {
            area: "goodnessResultArea",
            label: "🎯 CHI-SQUARE GOODNESS-OF-FIT RESULTS",
            value: "goodnessValueDisplay",
            steps: "goodnessStepsDisplay"
        }
    });
}

// ========== CHI-SQUARE GOODNESS-OF-FIT COMPUTATION ==========
// ========== CHI-SQUARE GOODNESS-OF-FIT TEST (REDESIGNED) ==========
function computeChiSquareGoodnessTest(observed, expected, alpha) {
    if (!observed.length || !expected.length) {
        return { error: true, message: "Please enter both observed and expected frequencies." };
    }
    if (observed.length !== expected.length) {
        return { error: true, message: "Observed and expected must have the same number of categories." };
    }
    if (observed.length < 2) {
        return { error: true, message: "Need at least 2 categories." };
    }
    
    if (expected.some(e => !(e > 0) || !isFinite(e))) {
        return { error: true, message: "Every expected frequency must be a number greater than 0 (a category with expected frequency 0 makes (O − E)² / E undefined). Combine or remove such categories." };
    }
    if (observed.some(o => !(o >= 0) || !isFinite(o))) {
        return { error: true, message: "Observed frequencies must be numbers that are 0 or greater." };
    }
    
    const n = observed.length;
    let chiSquare = 0;
    let contributions = [];
    let totalObserved = observed.reduce((a,b) => a+b, 0);
    let totalExpected = expected.reduce((a,b) => a+b, 0);
    // Expected values given as proportions (summing to 1) are scaled to counts: E_i = p_i × (total observed)
    const proportionsScaled = Math.abs(totalExpected - 1) < 1e-6 && totalObserved > 1;
    if (proportionsScaled) {
        expected = expected.map(e => e * totalObserved);
        totalExpected = totalObserved;
    }
    
    for (let i = 0; i < n; i++) {
        const diff = observed[i] - expected[i];
        const contribution = (diff * diff) / expected[i];
        chiSquare += contribution;
        contributions.push({ 
            category: i+1, 
            observed: observed[i], 
            expected: expected[i], 
            diff: diff,
            diffSq: diff * diff,
            contribution 
        });
    }
    
    const df = n - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(chiSquare, df);
    const rejectH0 = pValue < alpha;
    
    // Build table rows
    let tableRows = '';
    for (let c of contributions) {
        const diffColor = c.diff >= 0 ? '#28a745' : '#dc3545';
        tableRows += `<tr class="s-00049c">
            <td class="s-6e1b96">${c.category}</td>
            <td class="s-3294d6">${c.observed}</td>
            <td class="s-3294d6">${c.expected.toFixed(2)}</td>
            <td style="padding: 12px; text-align: center; color: ${diffColor}; font-weight: 500;">${c.diff >= 0 ? '+' : ''}${c.diff.toFixed(2)}</td>
            <td class="s-3294d6">(${c.diff.toFixed(2)})² = ${c.diffSq.toFixed(2)}</td>
            <td class="s-1204a5">${c.contribution.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <!-- Header -->
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">χ²</span>
                <h2 class="s-f8a94d">Chi-Square Goodness-of-Fit Test</h2>
            </div>
            <p class="s-259079">Tests whether observed frequencies match expected frequencies</p>
            ${proportionsScaled ? `<p class="s-ffad1e">ℹ️ The expected values sum to 1, so they were read as proportions and scaled by the total observed count (${totalObserved}): E<sub>i</sub> = p<sub>i</sub> × ${totalObserved}.</p>` : ''}
            <p class="s-20a400">H₀: The data follows the specified distribution | H₁: The data does NOT follow the specified distribution</p>
        </div>
        
        <!-- Understanding the Test -->
        <div class="s-42ccf7 gen-pad">
            <h3 class="s-ed0bb5">📖 What is the Chi-Square Goodness-of-Fit Test?</h3>
            <p class="s-d174a2">This test compares how many items fall into each category (observed) versus how many we would expect (expected).</p>
            <ul class="s-bcb1fd">
                <li><strong>Large χ² value</strong> → Big difference between observed and expected → Reject H₀</li>
                <li><strong>Small χ² value</strong> → Observed matches expected → Cannot reject H₀</li>
            </ul>
            <div class="s-bd7624">
                💡 <strong>Formula:</strong> χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ
            </div>
        </div>
        
        <!-- Data Summary Cards -->
        <div class="s-11aa18 gen-grid">
            <div class="s-edbb37">
                <div class="s-42da0a">Total Categories (k)</div>
                <div class="s-abfdfd gen-big">${n}</div>
            </div>
            <div class="s-edbb37">
                <div class="s-42da0a">Total Observations</div>
                <div class="s-d17747 gen-big">${totalObserved}</div>
            </div>
            <div class="s-edbb37">
                <div class="s-42da0a">Degrees of Freedom (df)</div>
                <div class="s-006063 gen-big">${df}</div>
                <div class="s-d52d0d">df = k - 1 = ${n} - 1</div>
            </div>
        </div>
        
        <!-- Main Calculation Table -->
        <div class="s-90b704">
            <h3 class="s-c7276c">
                📊 Step 1: Calculate (O - E)² / E for Each Category
            </h3>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-d66e1c">Category</th>
                        <th class="s-d66e1c">Observed (O)</th>
                        <th class="s-d66e1c">Expected (E)</th>
                        <th class="s-d66e1c">O - E</th>
                        <th class="s-d66e1c">(O - E)²</th>
                        <th class="s-d66e1c">(O - E)² / E</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="s-767496">
                        <td class="s-6ecd26" colspan="5">χ² = Σ (O - E)² / E →</td>
                        <td class="s-5eb347">${chiSquare.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Degrees of Freedom -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 2: Determine Degrees of Freedom</h3>
            <div class="s-6025fc">
                <div class="s-252832">
                    df = k - 1 = ${n} - 1 = <strong class="s-f342b5">${df}</strong>
                </div>
                <div class="s-45c6db">
                    Where k = number of categories
                </div>
            </div>
        </div>
        
        <!-- Step 3: Critical Value -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">📊 Step 3: Find Critical Value</h3>
            <div class="s-6025fc">
                <div class="s-87555e gen-grid">
                    <div class="s-546056">
                        <div class="s-42da0a">Significance Level (α)</div>
                        <div class="s-93c0a8">${alpha}</div>
                        <div class="s-d52d0d">(${(1-alpha)*100}% Confidence)</div>
                    </div>
                    <div class="s-546056">
                        <div class="s-42da0a">Critical Value</div>
                        <div class="s-a516d1">${criticalValue.toFixed(4)}</div>
                        <div class="s-d52d0d">From χ² table with df = ${df}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Step 4: Decision -->
        <div class="${rejectH0 ? 's-830a4f gen-pad' : 's-28eb84 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Step 4: Make Decision</h3>
            <div class="s-f27585">
                <div><strong>χ² Statistic:</strong> ${chiSquare.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
                <div class="s-c6645b">
                    <strong>Comparison:</strong> ${chiSquare.toFixed(4)} ${chiSquare > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)}<br>
                    <strong>Decision rule:</strong> p-value ${rejectH0 ? '<' : '≥'} α (${alpha})<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the observed distribution differs from the expected distribution.' : 'There is NOT sufficient evidence that the observed distribution differs from the expected distribution.'}
                </div>
            </div>
        </div>
        
        <!-- Visual Interpretation -->
        <div class="s-44d7a2 gen-pad">
            <h3 class="s-ed0bb5">📊 Interpretation Guide</h3>
            <div class="s-05c1db gen-flex">
                <div class="s-4b1265">
                    <div class="s-e8d5b8 gen-sized"></div>
                    <div class="s-e19eba gen-flex">
                        <span class="s-fb8dcc">Good Fit</span>
                        <span class="s-fb8dcc">Moderate</span>
                        <span class="s-fb8dcc">Poor Fit</span>
                    </div>
                </div>
                <div class="s-b8ce58 gen-sized">
                    <div>χ² = ${chiSquare.toFixed(4)}</div>
                    <div class="s-42da0a">Critical = ${criticalValue.toFixed(4)}</div>
                    <div class="${rejectH0 ? 's-90382c' : 's-6e12f1'}">
                        ${rejectH0 ? '⚠️ Poor Fit - Reject H₀' : '✓ Good Fit - Cannot Reject H₀'}
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    return { chiSquare, df, criticalValue, pValue, rejectH0, steps };
}

function setupChiSquareGoodnessLogic() {
    const computeBtn = document.getElementById("goodnessComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const observedRaw = document.getElementById("goodnessObserved").value;
        const expectedRaw = document.getElementById("goodnessExpected").value;
        const observed = parseNumbersFromInput(observedRaw);
        const expected = parseNumbersFromInput(expectedRaw);
        const alpha = parseFloat(document.getElementById("goodnessAlpha").value);
        const resultDiv = document.getElementById("goodnessResultArea");
        const valueSpan = document.getElementById("goodnessValueDisplay");
        const stepsSpan = document.getElementById("goodnessStepsDisplay");
        
        const result = computeChiSquareGoodnessTest(observed, expected, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSquare.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("goodnessClearBtn", ["goodnessObserved", "goodnessExpected"], "goodnessResultArea");
}
