/* Pearson: pearson tool (render, compute, setup) */

// PEARSON CORRELATION INTERFACE
function renderPearsonInterface() {
    return buildInterface({
        id: "statPearsonInterface",
        title: "📐 Pearson Correlation Coefficient (r)",
        formula: "📌 r = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]",
        desc: "Measures linear relationship between two variables. Range: -1 to +1. \n                -1 = perfect negative, 0 = no linear, +1 = perfect positive correlation.",
        inputs: [
            {
                label: "📋 Enter X values (comma, space, or line separated):",
                textarea: { id: "pearsonXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📋 Enter Y values (same number of values):",
                labelAttrs: { style: FIELD_GAP },
                textarea: {
                    id: "pearsonYInput",
                    rows: "3",
                    placeholder: "Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"
                }
            }
        ],
        run: { id: "pearsonComputeBtn", text: "📐 Calculate Pearson r + Full Steps" },
        clear: { id: "pearsonClearBtn", text: "Clear All" },
        result: {
            area: "pearsonResultArea",
            label: "🎯 PEARSON CORRELATION RESULT",
            value: "pearsonValueDisplay",
            steps: "pearsonStepsDisplay"
        }
    });
}

// ========== PEARSON CORRELATION - BEAUTIFUL VERSION ==========
function computePearsonWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values. X has ${xValues.length}, Y has ${yValues.length}.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 pairs for meaningful correlation." };
    }
    
    const n = xValues.length;
    let sumX = xValues.reduce((a,b) => a+b, 0);
    let sumY = yValues.reduce((a,b) => a+b, 0);
    let meanX = sumX / n;
    let meanY = sumY / n;
    
    let deviations = [];
    let sumDevX = 0, sumDevY = 0, sumProduct = 0;
    
    for (let i = 0; i < n; i++) {
        let devX = xValues[i] - meanX;
        let devY = yValues[i] - meanY;
        let sqDevX = devX * devX;
        let sqDevY = devY * devY;
        let product = devX * devY;
        
        deviations.push({
            i: i+1,
            x: xValues[i],
            y: yValues[i],
            devX: devX,
            devY: devY,
            sqDevX: sqDevX,
            sqDevY: sqDevY,
            product: product
        });
        
        sumDevX += sqDevX;
        sumDevY += sqDevY;
        sumProduct += product;
    }
    
    if (sumDevX === 0 || sumDevY === 0) {
        return { error: true, message: `Pearson's r is undefined: all ${sumDevX === 0 ? 'X' : 'Y'} values are identical (zero variance). Enter data that varies.` };
    }
    let denominator = Math.sqrt(sumDevX * sumDevY);
    let r = sumProduct / denominator;
    
    // Build table rows with perfect alignment
    let tableRows = '';
    for (let d of deviations) {
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px 8px; text-align: center; font-weight: 500;">${d.i}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.x}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.y}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc3545;">${d.devX.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc3545;">${d.devY.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; color: #28a745;">${d.sqDevX.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; color: #28a745;">${d.sqDevY.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; background: #e8f4f8; font-weight: 600; color: #1f6392;">${d.product.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">📐</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Pearson Correlation Coefficient (r)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Formula: r = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75; font-size: 13px;">Range: -1 to +1 | -1 = perfect negative, 0 = no linear, +1 = perfect positive</p>
        </div>
        
        <!-- Data Summary Grid -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📊</span> Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #1a5490;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Pairs</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1a5490;">${n}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Σx (Sum of X)</div>
                    <div style="font-size: 20px; font-weight: 600;">${sumX.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Σy (Sum of Y)</div>
                    <div style="font-size: 20px; font-weight: 600;">${sumY.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Mean of X (x̄)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanX.toFixed(6)}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Mean of Y (ȳ)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanY.toFixed(6)}</div>
                </div>
            </div>
        </div>
        
        <!-- Calculations Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490; font-size: 16px; display: flex; align-items: center; gap: 8px;"><span>📋</span> Deviation Calculations</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px 8px; text-align: center;">i</th>
                        <th style="padding: 12px 8px; text-align: center;">xᵢ</th>
                        <th style="padding: 12px 8px; text-align: center;">yᵢ</th>
                        <th style="padding: 12px 8px; text-align: center;">(xᵢ - x̄)</th>
                        <th style="padding: 12px 8px; text-align: center;">(yᵢ - ȳ)</th>
                        <th style="padding: 12px 8px; text-align: center;">(xᵢ - x̄)²</th>
                        <th style="padding: 12px 8px; text-align: center;">(yᵢ - ȳ)²</th>
                        <th style="padding: 12px 8px; text-align: center;">(xᵢ - x̄)(yᵢ - ȳ)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="background: #e9ecef; font-weight: 700; border-top: 2px solid #dee2e6;">
                        <td colspan="5" style="padding: 12px 8px; text-align: right;">SUM →</td>
                        <td style="padding: 12px 8px; text-align: center; color: #28a745;">${sumDevX.toFixed(4)}</td>
                        <td style="padding: 12px 8px; text-align: center; color: #28a745;">${sumDevY.toFixed(4)}</td>
                        <td style="padding: 12px 8px; text-align: center; background: #e8f4f8; color: #1a5490;">${sumProduct.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Calculation Steps -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>🔢</span> Step-by-Step Calculation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">1</div>
                    <div><strong>Calculate Covariance Sum (Numerator)</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 14px;">
                    Σ(xᵢ - x̄)(yᵢ - ȳ) = ${sumProduct.toFixed(6)}
                </div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">2</div>
                    <div><strong>Calculate Denominator</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 14px;">
                    √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²] = √(${sumDevX.toFixed(6)} × ${sumDevY.toFixed(6)}) = ${denominator.toFixed(6)}
                </div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">3</div>
                    <div><strong>Calculate Pearson r</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 16px; font-weight: 700; color: #1a5490;">
                    r = ${sumProduct.toFixed(6)} / ${denominator.toFixed(6)} = ${r.toFixed(8)}
                </div>
            </div>
        </div>
        
        <!-- Interpretation Section -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(r) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(r) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 style="margin: 0 0 12px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📌</span> Interpretation</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Correlation Coefficient:</strong> r = ${r.toFixed(6)} → <strong style="color: ${r > 0 ? '#28a745' : '#dc3545'};">${r > 0 ? 'Positive' : 'Negative'}</strong> correlation</div>
                <div><strong>Strength:</strong> ${Math.abs(r) >= 0.9 ? '🔥 Very Strong' : (Math.abs(r) >= 0.7 ? '✅ Strong' : (Math.abs(r) >= 0.5 ? '📊 Moderate' : (Math.abs(r) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No')))} ${Math.abs(r) >= 0.3 ? 'linear relationship' : 'linear correlation'}</div>
                <div><strong>Coefficient of Determination (r²):</strong> ${(r*r).toFixed(6)} → ${((r*r)*100).toFixed(1)}% of variance in Y is explained by X</div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px; color: #555;">
                    💡 <strong>Practical Meaning:</strong> ${r > 0.7 ? 'Strong positive relationship - as X increases, Y tends to increase significantly.' : (r < -0.7 ? 'Strong negative relationship - as X increases, Y tends to decrease significantly.' : (Math.abs(r) > 0.3 ? 'Moderate relationship exists between X and Y.' : 'Little to no linear relationship between X and Y.'))}
                </div>
            </div>
        </div>
    </div>`;
    
    return { r, steps, n, meanX, meanY, sumProduct, sumDevX, sumDevY };
}

// ========== CORRELATION SETUP FUNCTIONS (FIXED) ==========
function setupPearsonLogic() {
    const computeBtn = document.getElementById("pearsonComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("pearsonXInput").value;
        const rawY = document.getElementById("pearsonYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("pearsonResultArea");
        const valueSpan = document.getElementById("pearsonValueDisplay");
        const stepsSpan = document.getElementById("pearsonStepsDisplay");
        
        const result = computePearsonWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);  // Changed to innerHTML
        } else {
            setHtml(valueSpan, `r = ${result.r.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);  // Changed to innerHTML
        }
    });
    
    attachClearHandler("pearsonClearBtn", ["pearsonXInput", "pearsonYInput"], "pearsonResultArea");
}
