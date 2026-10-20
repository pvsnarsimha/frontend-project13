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
        tableRows += `<tr class="s-00049c">
            <td class="s-508417">${d.i}</td>
            <td class="s-dd18f4">${d.x}</td>
            <td class="s-dd18f4">${d.y}</td>
            <td class="s-f74f20">${d.devX.toFixed(4)}</td>
            <td class="s-f74f20">${d.devY.toFixed(4)}</td>
            <td class="s-ff4a94">${d.sqDevX.toFixed(4)}</td>
            <td class="s-ff4a94">${d.sqDevY.toFixed(4)}</td>
            <td class="s-2da758">${d.product.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-3c49f1">
        <!-- Header Section -->
        <div class="s-97b34b gen-pad">
            <div class="s-94fb6b gen-flex">
                <span class="s-1f18a8 gen-big">📐</span>
                <h2 class="s-66423b">Pearson Correlation Coefficient (r)</h2>
            </div>
            <p class="s-3d1a65">Formula: r = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]</p>
            <p class="s-1eab71">Range: -1 to +1 | -1 = perfect negative, 0 = no linear, +1 = perfect positive</p>
        </div>
        
        <!-- Data Summary Grid -->
        <div class="s-d9cff0 gen-pad">
            <h3 class="s-4b9a54 gen-flex"><span>📊</span> Data Summary</h3>
            <div class="s-0ad64d gen-grid">
                <div class="s-2b3ed5">
                    <div class="s-42da0a">Number of Pairs</div>
                    <div class="s-fad2be">${n}</div>
                </div>
                <div class="s-768837">
                    <div class="s-42da0a">Σx (Sum of X)</div>
                    <div class="s-0f4638">${sumX.toFixed(4)}</div>
                </div>
                <div class="s-768837">
                    <div class="s-42da0a">Σy (Sum of Y)</div>
                    <div class="s-0f4638">${sumY.toFixed(4)}</div>
                </div>
                <div class="s-446f0e">
                    <div class="s-42da0a">Mean of X (x̄)</div>
                    <div class="s-e28abf">${meanX.toFixed(6)}</div>
                </div>
                <div class="s-446f0e">
                    <div class="s-42da0a">Mean of Y (ȳ)</div>
                    <div class="s-e28abf">${meanY.toFixed(6)}</div>
                </div>
            </div>
        </div>
        
        <!-- Calculations Table -->
        <div class="s-8b4bbf">
            <h3 class="s-19a112 gen-flex"><span>📋</span> Deviation Calculations</h3>
            <table class="s-306b2c gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-b5a9ed">i</th>
                        <th class="s-b5a9ed">xᵢ</th>
                        <th class="s-b5a9ed">yᵢ</th>
                        <th class="s-b5a9ed">(xᵢ - x̄)</th>
                        <th class="s-b5a9ed">(yᵢ - ȳ)</th>
                        <th class="s-b5a9ed">(xᵢ - x̄)²</th>
                        <th class="s-b5a9ed">(yᵢ - ȳ)²</th>
                        <th class="s-b5a9ed">(xᵢ - x̄)(yᵢ - ȳ)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="s-859e2b">
                        <td class="s-e629ee" colspan="5">SUM →</td>
                        <td class="s-622a05">${sumDevX.toFixed(4)}</td>
                        <td class="s-622a05">${sumDevY.toFixed(4)}</td>
                        <td class="s-b19ffa">${sumProduct.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Calculation Steps -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-4b9a54 gen-flex"><span>🔢</span> Step-by-Step Calculation</h3>
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-a4a5e4 gen-flex gen-sized">1</div>
                    <div><strong>Calculate Covariance Sum (Numerator)</strong></div>
                </div>
                <div class="s-59ef88">
                    Σ(xᵢ - x̄)(yᵢ - ȳ) = ${sumProduct.toFixed(6)}
                </div>
            </div>
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-a4a5e4 gen-flex gen-sized">2</div>
                    <div><strong>Calculate Denominator</strong></div>
                </div>
                <div class="s-59ef88">
                    √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²] = √(${sumDevX.toFixed(6)} × ${sumDevY.toFixed(6)}) = ${denominator.toFixed(6)}
                </div>
            </div>
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-a4a5e4 gen-flex gen-sized">3</div>
                    <div><strong>Calculate Pearson r</strong></div>
                </div>
                <div class="s-a17211">
                    r = ${sumProduct.toFixed(6)} / ${denominator.toFixed(6)} = ${r.toFixed(8)}
                </div>
            </div>
        </div>
        
        <!-- Interpretation Section -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(r) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(r) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 class="s-b140c2 gen-flex"><span>📌</span> Interpretation</h3>
            <div class="s-45b8b7">
                <div><strong>Correlation Coefficient:</strong> r = ${r.toFixed(6)} → <strong style="color: ${textSafeColor(r > 0 ? '#28a745' : '#dc3545')};">${r > 0 ? 'Positive' : 'Negative'}</strong> correlation</div>
                <div><strong>Strength:</strong> ${Math.abs(r) >= 0.9 ? '🔥 Very Strong' : (Math.abs(r) >= 0.7 ? '✅ Strong' : (Math.abs(r) >= 0.5 ? '📊 Moderate' : (Math.abs(r) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No')))} ${Math.abs(r) >= 0.3 ? 'linear relationship' : 'linear correlation'}</div>
                <div><strong>Coefficient of Determination (r²):</strong> ${(r*r).toFixed(6)} → ${((r*r)*100).toFixed(1)}% of variance in Y is explained by X</div>
                <div class="s-0d79c9">
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
            hideAllStatCharts();
            setHtml(stepsSpan, result.message);  // Changed to innerHTML
        } else {
            setHtml(valueSpan, `r = ${result.r.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showFitCharts("pearsonResultArea", xValues, yValues, { xName: "x", yName: "y" });  // Changed to innerHTML
        }
    });
    
    attachClearHandler("pearsonClearBtn", ["pearsonXInput", "pearsonYInput"], "pearsonResultArea");
}
