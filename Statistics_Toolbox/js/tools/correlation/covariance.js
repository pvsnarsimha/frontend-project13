/* Covariance: covariance tool (render, compute, setup) */

// COVARIANCE INTERFACE
function renderCovarianceInterface() {
    return buildInterface({
        id: "statCovarianceInterface",
        title: "📊 Covariance",
        formula: "📌 Cov(X,Y) = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / (n-1)  [Sample]",
        desc: "Measures direction of linear relationship. Positive = variables move together, Negative = move opposite.",
        inputs: [
            {
                label: "📋 Enter X values:",
                textarea: { id: "covarianceXInput", rows: "3", placeholder: "Example: 2, 4, 6, 8, 10, 12, 14, 16" }
            },
            {
                label: "📋 Enter Y values (same number of values):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "covarianceYInput", rows: "3", placeholder: "Example: 1, 3, 5, 7, 9, 11, 13, 15" }
            }
        ],
        run: { id: "covarianceComputeBtn", text: "📊 Calculate Covariance + Steps" },
        clear: { id: "covarianceClearBtn", text: "Clear All" },
        result: {
            area: "covarianceResultArea",
            label: "🎯 COVARIANCE RESULT",
            value: "covarianceValueDisplay",
            steps: "covarianceStepsDisplay"
        }
    });
}

// ========== COVARIANCE - BEAUTIFUL VERSION ==========
function computeCovarianceWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 2) {
        return { error: true, message: "Need at least 2 pairs for covariance." };
    }
    
    const n = xValues.length;
    let sumX = xValues.reduce((a,b) => a+b, 0);
    let sumY = yValues.reduce((a,b) => a+b, 0);
    let meanX = sumX / n;
    let meanY = sumY / n;
    
    let devData = [];
    let sumProduct = 0;
    
    for (let i = 0; i < n; i++) {
        let devX = xValues[i] - meanX;
        let devY = yValues[i] - meanY;
        let product = devX * devY;
        sumProduct += product;
        devData.push({
            i: i+1,
            x: xValues[i],
            y: yValues[i],
            devX: devX,
            devY: devY,
            product: product
        });
    }
    
    let covariance = sumProduct / (n - 1);
    let sumDevX = xValues.reduce((a, b) => a + Math.pow(b - meanX, 2), 0);
    let sumDevY = yValues.reduce((a, b) => a + Math.pow(b - meanY, 2), 0);
    let r = sumProduct / Math.sqrt(sumDevX * sumDevY);
    
    let tableRows = '';
    for (let d of devData) {
        tableRows += `<tr class="s-00049c">
            <td class="s-508417">${d.i}</td>
            <td class="s-dd18f4">${d.x}</td>
            <td class="s-dd18f4">${d.y}</td>
            <td class="s-f74f20">${d.devX.toFixed(4)}</td>
            <td class="s-f74f20">${d.devY.toFixed(4)}</td>
            <td class="s-3f21e0">${d.product.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-3c49f1">
        <div class="s-2800d6 gen-pad">
            <div class="s-94fb6b gen-flex">
                <span class="s-1f18a8 gen-big">📊</span>
                <h2 class="s-66423b">Covariance (Sample)</h2>
            </div>
            <p class="s-259079">Formula: Cov(X,Y) = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / (n-1)</p>
            <p class="s-1eab71">Measures direction of linear relationship | Positive = same direction, Negative = opposite direction</p>
        </div>
        
        <div class="s-d9cff0 gen-pad">
            <h3 class="s-1fd4d8"><span>📊</span> Data Summary</h3>
            <div class="s-5728d8 gen-grid">
                <div class="s-31f9d1"><div class="s-42da0a">n (Pairs)</div><div class="s-c2434f">${n}</div></div>
                <div class="s-768837"><div class="s-42da0a">x̄ (Mean X)</div><div class="s-e28abf">${meanX.toFixed(6)}</div></div>
                <div class="s-446f0e"><div class="s-42da0a">ȳ (Mean Y)</div><div class="s-e28abf">${meanY.toFixed(6)}</div></div>
            </div>
        </div>
        
        <div class="s-8b4bbf">
            <h3 class="s-4f23d0"><span>📋</span> Deviation Products</h3>
            <table class="s-306b2c gen-sized">
                <thead><tr class="s-621d6a">
                    <th class="s-a756db">i</th><th class="s-a756db">xᵢ</th><th class="s-a756db">yᵢ</th>
                    <th class="s-a756db">(xᵢ - x̄)</th><th class="s-a756db">(yᵢ - ȳ)</th>
                    <th class="s-a756db">(xᵢ - x̄)(yᵢ - ȳ)</th>
                </tr></thead>
                <tbody>${tableRows}<tr class="s-767496"><td class="s-c1430c" colspan="5">SUM →</td><td class="s-e1ff77">${sumProduct.toFixed(4)}</td></tr></tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-1fd4d8"><span>🔢</span> Calculation</h3>
            <div class="s-6025fc">
                <div class="s-168eee">Σ[(xᵢ - x̄)(yᵢ - ȳ)] = ${sumProduct.toFixed(6)}</div>
                <div class="s-168eee">Cov(X,Y) = ${sumProduct.toFixed(6)} / (${n} - 1)</div>
                <div class="s-6920c9">
                    Covariance = ${covariance.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${covariance > 0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (covariance < 0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #fff3cd; border-left: 6px solid #ffc107;')}">
            <h3 class="s-3c2890"><span>📌</span> Interpretation</h3>
            <div><strong>Covariance:</strong> ${covariance.toFixed(6)} → <strong style="color: ${textSafeColor(covariance > 0 ? '#28a745' : (covariance < 0 ? '#dc3545' : '#ffc107'))};">${covariance > 0 ? 'POSITIVE' : (covariance < 0 ? 'NEGATIVE' : 'ZERO')}</strong> relationship</div>
            <div>${covariance > 0 ? '✓ X and Y tend to move in the SAME direction' : (covariance < 0 ? '✓ X and Y tend to move in OPPOSITE directions' : '✓ No linear relationship between X and Y')}</div>
            <div class="s-0d79c9">
                💡 <strong>Note:</strong> Covariance magnitude depends on units. For standardized comparison, use Pearson correlation (r = ${r.toFixed(6)}).
            </div>
        </div>
    </div>`;
    
    return { covariance, steps, meanX, meanY, sumProduct, n };
}

function setupCovarianceLogic() {
    const computeBtn = document.getElementById("covarianceComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("covarianceXInput").value;
        const rawY = document.getElementById("covarianceYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("covarianceResultArea");
        const valueSpan = document.getElementById("covarianceValueDisplay");
        const stepsSpan = document.getElementById("covarianceStepsDisplay");
        
        const result = computeCovarianceWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideAllStatCharts();
            setHtml(stepsSpan, result.message);  // Changed to innerHTML
        } else {
            setHtml(valueSpan, `Cov = ${result.covariance.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showFitCharts("covarianceResultArea", xValues, yValues, { xName: "x", yName: "y" });  // Changed to innerHTML
        }
    });
    
    attachClearHandler("covarianceClearBtn", ["covarianceXInput", "covarianceYInput"], "covarianceResultArea");
}
