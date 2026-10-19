/* McNemar: mcnemar tool (render, compute, setup) */

// ========== MCNEMAR'S TEST INTERFACE ==========
function renderMcNemarInterface() {
    return buildInterface({
        id: "statMcNemarInterface",
        title: "📊 McNemar's Test (Paired Categorical Data)",
        formula: "📌 χ² = (b - c)² / (b + c)",
        desc: "<strong>What is McNemar's Test?</strong><br>\n                    Tests for changes in paired categorical data (before-after, matched pairs).\n                    Used for 2×2 contingency tables with paired observations.\n                    <br><br>\n                    <strong>H₀:</strong> Marginal proportions are equal (no change)<br>\n                    <strong>H₁:</strong> Marginal proportions are different (change occurred)",
        inputs: [
            {
                label: "📋 Enter the 2×2 contingency table as 4 values (a, b, c, d):",
                textarea: {
                    id: "mcnemarData",
                    rows: "4",
                    placeholder: "Example:&#10;10, 5, 3, 8&#10;&#10;Where:&#10;Before: Yes, After: No → a = both Yes&#10;Before: Yes, After: Yes → b&#10;Before: No, After: No → c&#10;Before: No, After: Yes → d"
                }
            },
            {
                hint: "<strong>Table layout:</strong><br>\n                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;After: No&nbsp;&nbsp;&nbsp;After: Yes<br>\n                    Before: No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b<br>\n                    Before: Yes&nbsp;&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "mcnemarAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "mcnemarComputeBtn", text: "📊 Run McNemar's Test + Full Steps" },
        clear: { id: "mcnemarClearBtn", text: "Clear" },
        result: {
            area: "mcnemarResultArea",
            label: "🎯 MCNEMAR'S TEST RESULTS",
            value: "mcnemarValueDisplay",
            steps: "mcnemarStepsDisplay"
        }
    });
}

// ========== MCNEMAR'S TEST COMPUTATION ==========
function computeMcNemarTest(inputText, alpha) {
    const values = parseNumbersFromInput(inputText);
    
    if (values.length !== 4) {
        return { error: true, message: "Please enter exactly 4 values (a, b, c, d) for the 2×2 contingency table." };
    }
    
    const [a, b, c, d] = values;
    const n = a + b + c + d;
    
    // Calculate McNemar's chi-square statistic
    let chiSquare;
    let continuityCorrection = 0;
    
    if (b + c > 0) {
        // With continuity correction (recommended)
        chiSquare = Math.pow(Math.max(Math.abs(b - c) - 1, 0), 2) / (b + c);   // never below 0: for b = c the corrected statistic is 0, not 1/(b + c)
        continuityCorrection = 1;
    } else {
        chiSquare = 0;
    }
    
    const df = 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(chiSquare, df);
    const rejectH0 = pValue < alpha;
    
    // Build HTML table
    let tableHtml = `
    <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 20px; overflow-x: auto;">
        <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Contingency Table</h3>
        <table style="border-collapse: collapse; width: 100%; margin: 0 auto;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px;"></th>
                    <th style="border: 1px solid #ddd; padding: 12px;">After: No</th>
                    <th style="border: 1px solid #ddd; padding: 12px;">After: Yes</th>
                    <th style="border: 1px solid #ddd; padding: 12px;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #ddd;">
                    <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">Before: No</th>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">a = ${a}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">b = ${b}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${a+b}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                    <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">Before: Yes</th>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">c = ${c}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">d = ${d}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${c+d}</td>
                </tr>
                <tr style="background: #e9ecef;">
                    <th style="border: 1px solid #ddd; padding: 12px;">Total</th>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${a+c}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${b+d}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${n}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📊</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">McNemar's Test</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Paired Categorical Data Analysis</p>
                </div>
            </div>
        </div>
        
        ${tableHtml}
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Step 1: Identify discordant pairs</strong><br>
                • b = number where Before: No, After: Yes = ${b}<br>
                • c = number where Before: Yes, After: No = ${c}<br>
                • Discordant pairs = b + c = ${b + c}
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Step 2: Calculate McNemar's chi-square statistic</strong><br>
                Formula: χ² = (|b - c| - 1)² / (b + c) [with continuity correction]<br>
                = (|${b} - ${c}| - 1)² / (${b} + ${c})<br>
                = (${Math.abs(b - c)} - 1)² / ${b + c}<br>
                = (${Math.abs(b - c) - 1})² / ${b + c}<br>
                = ${Math.pow(Math.abs(b - c) - 1, 2)} / ${b + c}<br>
                = <strong style="color: #1a5490; font-size: 18px;">χ² = ${chiSquare.toFixed(6)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Step 3: Compare with critical value</strong><br>
                Degrees of freedom = 1<br>
                Critical value (α = ${alpha}) = ${criticalValue.toFixed(4)}<br>
                p-value = ${pValue.toFixed(8)}<br><br>
                <strong>Decision rule:</strong> p-value ${rejectH0 ? '<' : '≥'} α (${alpha})<br>
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the proportions are different (significant change).' : 'There is NOT sufficient evidence of a difference between proportions.'}
            </div>
        </div>
    </div>`;
    
    return { chiSquare, df, pValue, criticalValue, rejectH0, steps };
}

// ========== MCNEMAR'S TEST SETUP ==========
function setupMcNemarLogic() {
    const computeBtn = document.getElementById("mcnemarComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("mcnemarData").value;
        const alpha = parseFloat(document.getElementById("mcnemarAlpha").value);
        const resultDiv = document.getElementById("mcnemarResultArea");
        const valueSpan = document.getElementById("mcnemarValueDisplay");
        const stepsSpan = document.getElementById("mcnemarStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter 4 values (a, b, c, d).");
            return;
        }
        
        const result = computeMcNemarTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSquare.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("mcnemarClearBtn", "mcnemarData", "mcnemarResultArea");
}
