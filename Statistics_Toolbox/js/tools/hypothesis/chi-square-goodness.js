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
                hint: "Expected frequencies can be equal proportions or custom values",
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
    const rejectH0 = chiSquare > criticalValue;
    
    // Build table rows
    let tableRows = '';
    for (let c of contributions) {
        const diffColor = c.diff >= 0 ? '#28a745' : '#dc3545';
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px; text-align: center; font-weight: 500;">${c.category}</td>
            <td style="padding: 12px; text-align: center;">${c.observed}</td>
            <td style="padding: 12px; text-align: center;">${c.expected.toFixed(2)}</td>
            <td style="padding: 12px; text-align: center; color: ${diffColor}; font-weight: 500;">${c.diff >= 0 ? '+' : ''}${c.diff.toFixed(2)}</td>
            <td style="padding: 12px; text-align: center;">(${c.diff.toFixed(2)})² = ${c.diffSq.toFixed(2)}</td>
            <td style="padding: 12px; text-align: center; background: #e8f4f8; font-weight: 600; color: #1a5490;">${c.contribution.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">χ²</span>
                <h2 style="margin: 0;">Chi-Square Goodness-of-Fit Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Tests whether observed frequencies match expected frequencies</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: The data follows the specified distribution | H₁: The data does NOT follow the specified distribution</p>
        </div>
        
        <!-- Understanding the Test -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 What is the Chi-Square Goodness-of-Fit Test?</h3>
            <p style="margin: 0; line-height: 1.6;">This test compares how many items fall into each category (observed) versus how many we would expect (expected).</p>
            <ul style="margin-top: 12px; margin-left: 20px; line-height: 1.6;">
                <li><strong>Large χ² value</strong> → Big difference between observed and expected → Reject H₀</li>
                <li><strong>Small χ² value</strong> → Observed matches expected → Cannot reject H₀</li>
            </ul>
            <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 8px; font-size: 13px;">
                💡 <strong>Formula:</strong> χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ
            </div>
        </div>
        
        <!-- Data Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Total Categories (k)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Total Observations</div>
                <div style="font-size: 32px; font-weight: 700; color: #28a745;">${totalObserved}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Degrees of Freedom (df)</div>
                <div style="font-size: 32px; font-weight: 700; color: #17a2b8;">${df}</div>
                <div style="font-size: 11px;">df = k - 1 = ${n} - 1</div>
            </div>
        </div>
        
        <!-- Main Calculation Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Calculate (O - E)² / E for Each Category
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Category</th>
                        <th style="padding: 12px;">Observed (O)</th>
                        <th style="padding: 12px;">Expected (E)</th>
                        <th style="padding: 12px;">O - E</th>
                        <th style="padding: 12px;">(O - E)²</th>
                        <th style="padding: 12px;">(O - E)² / E</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="5" style="padding: 12px; text-align: right;">χ² = Σ (O - E)² / E →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white;">${chiSquare.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Degrees of Freedom -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Determine Degrees of Freedom</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center;">
                    df = k - 1 = ${n} - 1 = <strong style="color: #1a5490;">${df}</strong>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #6c757d; text-align: center;">
                    Where k = number of categories
                </div>
            </div>
        </div>
        
        <!-- Step 3: Critical Value -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Step 3: Find Critical Value</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Significance Level (α)</div>
                        <div style="font-size: 28px; font-weight: 700;">${alpha}</div>
                        <div style="font-size: 11px;">(${(1-alpha)*100}% Confidence)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Critical Value</div>
                        <div style="font-size: 28px; font-weight: 700; color: #dc3545;">${criticalValue.toFixed(4)}</div>
                        <div style="font-size: 11px;">From χ² table with df = ${df}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Step 4: Decision -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 4: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>χ² Statistic:</strong> ${chiSquare.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Comparison:</strong> ${chiSquare.toFixed(4)} ${chiSquare > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)}<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the observed distribution differs from the expected distribution.' : 'There is NOT sufficient evidence that the observed distribution differs from the expected distribution.'}
                </div>
            </div>
        </div>
        
        <!-- Visual Interpretation -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 Interpretation Guide</h3>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                <div style="flex: 1; text-align: center;">
                    <div style="width: 100%; height: 8px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); border-radius: 4px; margin-bottom: 8px;"></div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 11px;">Good Fit</span>
                        <span style="font-size: 11px;">Moderate</span>
                        <span style="font-size: 11px;">Poor Fit</span>
                    </div>
                </div>
                <div style="min-width: 150px; text-align: center; padding: 12px; background: white; border-radius: 12px;">
                    <div>χ² = ${chiSquare.toFixed(4)}</div>
                    <div style="font-size: 12px; color: #6c757d;">Critical = ${criticalValue.toFixed(4)}</div>
                    <div style="margin-top: 8px; font-weight: bold; color: ${rejectH0 ? '#dc3545' : '#28a745'}">
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
