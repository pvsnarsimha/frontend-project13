/* Phi: phi tool (render, compute, setup) */

// ========== PHI COEFFICIENT INTERFACE RENDER ==========
function renderPhiInterface() {
    return buildInterface({
        id: "statPhiInterface",
        title: "φ Phi Coefficient (2×2 Binary Association)",
        formula: "📌 φ = (ad - bc) / √[(a+b)(c+d)(a+c)(b+d)]",
        desc: "Measures association between two binary (0/1) variables. Range: -1 to +1. Special case of Pearson correlation for 2×2 tables.",
        inputs: [
            {
                label: "📋 Enter 2×2 contingency table as 4 comma-separated values (a, b, c, d):",
                textarea: {
                    id: "phiData",
                    rows: "3",
                    placeholder: "Example: 10, 5, 3, 8&#10;&#10;Where:&#10;a = count where X=0, Y=0&#10;b = count where X=0, Y=1&#10;c = count where X=1, Y=0&#10;d = count where X=1, Y=1"
                }
            },
            {
                hint: "<strong>Table layout:</strong><br>\n                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y=0&nbsp;&nbsp;Y=1<br>\n                    X=0:&nbsp;&nbsp;&nbsp;a&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b<br>\n                    X=1:&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "phiComputeBtn", text: "φ Calculate Phi Coefficient + Full Steps" },
        clear: { id: "phiClearBtn", text: "Clear" },
        result: {
            area: "phiResultArea",
            label: "🎯 PHI COEFFICIENT RESULT",
            value: "phiValueDisplay",
            steps: "phiStepsDisplay"
        }
    });
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
    if (denominator === 0) {
        return { error: true, message: "Phi is undefined: a row or a column of the 2×2 table sums to zero (one variable has no variation)." };
    }
    const phi = numerator / denominator;
    
    // Interpret Phi
    let interpretation = "";
    if (Math.abs(phi) < 0.1) interpretation = "Very weak association";
    else if (Math.abs(phi) < 0.3) interpretation = "Weak association";
    else if (Math.abs(phi) < 0.5) interpretation = "Moderate association";
    else if (Math.abs(phi) < 0.7) interpretation = "Strong association";
    else interpretation = "Very strong association";
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">φ</span>
                <h2 class="s-f8a94d">Phi Coefficient (φ)</h2>
            </div>
            <p class="s-259079">Formula: φ = (ad - bc) / √[(a+b)(c+d)(a+c)(b+d)]</p>
            <p class="s-20a400">Range: -1 to +1 | Measures association between two binary variables</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 2×2 Contingency Table</h3>
            <div class="s-01a9b9">
                <table class="s-26e7d0">
                    <thead>
                        <tr>
                            <th class="s-7d7706"></th>
                            <th class="s-7d7706">Y = 0</th>
                            <th class="s-7d7706">Y = 1</th>
                            <th class="s-7d7706">Row Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th class="s-32c0c9">X = 0</th>
                            <td class="s-8a7755">a = ${a}</td>
                            <td class="s-8a7755">b = ${b}</td>
                            <td class="s-8f1da4">${row1Total}</td>
                        </tr>
                        <tr>
                            <th class="s-32c0c9">X = 1</th>
                            <td class="s-8a7755">c = ${c}</td>
                            <td class="s-8a7755">d = ${d}</td>
                            <td class="s-8f1da4">${row2Total}</td>
                        </tr>
                        <tr>
                            <th class="s-32c0c9">Column Total</th>
                            <td class="s-8f1da4">${col1Total}</td>
                            <td class="s-8f1da4">${col2Total}</td>
                            <td class="s-8f1da4">${n}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">1</div>
                    <div><strong>Calculate Numerator (ad - bc)</strong></div>
                </div>
                <div class="s-f55593">
                    ad = ${a} × ${d} = ${a * d}<br>
                    bc = ${b} × ${c} = ${b * c}<br>
                    ad - bc = ${a * d} - ${b * c} = ${numerator}
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Calculate Denominator √[(a+b)(c+d)(a+c)(b+d)]</strong></div>
                </div>
                <div class="s-f55593">
                    (a+b) = ${row1Total}<br>
                    (c+d) = ${row2Total}<br>
                    (a+c) = ${col1Total}<br>
                    (b+d) = ${col2Total}<br>
                    Product = ${row1Total} × ${row2Total} × ${col1Total} × ${col2Total} = ${row1Total * row2Total * col1Total * col2Total}<br>
                    √Product = √${row1Total * row2Total * col1Total * col2Total} = ${denominator.toFixed(6)}
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">3</div>
                    <div><strong>Calculate Phi Coefficient</strong></div>
                </div>
                <div class="s-f55593">
                    φ = (ad - bc) / √[(a+b)(c+d)(a+c)(b+d)]<br>
                    φ = ${numerator} / ${denominator.toFixed(6)}<br>
                    <div class="s-56b421">φ = ${phi.toFixed(8)}</div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(phi) > 0.3 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 class="s-c7f0b4">📌 Interpretation</h3>
            <div><strong>Phi Coefficient:</strong> ${phi.toFixed(6)}</div>
            <div><strong>Direction:</strong> ${phi > 0 ? 'Positive association' : (phi < 0 ? 'Negative association' : 'No association')}</div>
            <div><strong>Strength:</strong> ${interpretation}</div>
            <div class="s-8d2e44">
                💡 <strong>Note:</strong> Phi coefficient is equivalent to Pearson correlation for 2×2 binary variables.<br>
                It ranges from -1 (perfect negative association) to +1 (perfect positive association).
            </div>
        </div>
    </div>`;
    
    return { phi, numerator, denominator, n, a, b, c, d, steps };
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
            setHtml(stepsSpan, "Enter 4 values (a, b, c, d) for the 2×2 table");
            return;
        }
        
        const result = computePhiWithSteps(raw);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `φ = ${result.phi.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("phiClearBtn", "phiData", "phiResultArea");
}
