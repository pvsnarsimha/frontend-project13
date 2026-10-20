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
    <div class="s-907186 gen-pad">
        <h3 class="s-d163b6">📊 Contingency Table</h3>
        <table class="s-07201c gen-sized">
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-7d7706"></th>
                    <th class="s-7d7706">After: No</th>
                    <th class="s-7d7706">After: Yes</th>
                    <th class="s-7d7706">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr class="s-e467f0">
                    <th class="s-32c0c9">Before: No</th>
                    <td class="s-8a7755">a = ${a}</td>
                    <td class="s-8a7755">b = ${b}</td>
                    <td class="s-8a7755">${a+b}</td>
                </tr>
                <tr class="s-e467f0">
                    <th class="s-32c0c9">Before: Yes</th>
                    <td class="s-8a7755">c = ${c}</td>
                    <td class="s-8a7755">d = ${d}</td>
                    <td class="s-8a7755">${c+d}</td>
                </tr>
                <tr class="s-bfd0ae">
                    <th class="s-7d7706">Total</th>
                    <td class="s-8a7755">${a+c}</td>
                    <td class="s-8a7755">${b+d}</td>
                    <td class="s-8a7755">${n}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    let steps = `<div class="s-9217e5">
        <div class="s-6d8291 gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">📊</span>
                <div>
                    <h1 class="s-b80b8c">McNemar's Test</h1>
                    <p class="s-259079">Paired Categorical Data Analysis</p>
                </div>
            </div>
        </div>
        
        ${tableHtml}
        
        <div class="s-2f2db9 gen-pad">
            <h3 class="s-d163b6">📐 Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <strong>Step 1: Identify discordant pairs</strong><br>
                • b = number where Before: No, After: Yes = ${b}<br>
                • c = number where Before: Yes, After: No = ${c}<br>
                • Discordant pairs = b + c = ${b + c}
            </div>
            
            <div class="s-ca9e5c">
                <strong>Step 2: Calculate McNemar's chi-square statistic</strong><br>
                Formula: χ² = (|b - c| - 1)² / (b + c) [with continuity correction]<br>
                = (|${b} - ${c}| - 1)² / (${b} + ${c})<br>
                = (${Math.abs(b - c)} - 1)² / ${b + c}<br>
                ${Math.abs(b - c) < 1 ? `|b - c| - 1 would be negative (b = c), so the corrected numerator is taken as 0: χ² = 0 / ${b + c}<br>` : `= (${Math.abs(b - c) - 1})² / ${b + c}<br>
                = ${Math.pow(Math.abs(b - c) - 1, 2)} / ${b + c}<br>`}
                = <strong class="s-bbce95">χ² = ${chiSquare.toFixed(6)}</strong>
            </div>
            
            <div class="s-6025fc">
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
    
    return { chiSquare, df, pValue, criticalValue, rejectH0, steps, chart: { dist: 'chisq', df: df, stat: chiSquare, alternative: 'greater', alpha: alpha, statLabel: 'χ²', critical: { lower: null, upper: criticalValue } } };
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
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSquare.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("mcnemarResultArea", result.chart);
        }
    });
    
    attachClearHandler("mcnemarClearBtn", "mcnemarData", "mcnemarResultArea");
}
