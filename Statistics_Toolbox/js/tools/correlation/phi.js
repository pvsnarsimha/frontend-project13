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
