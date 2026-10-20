/* SimpleLinear: simplelinear tool (render, compute, setup) */

// ========== SIMPLE LINEAR REGRESSION INTERFACE ==========
function renderSimpleLinearInterface() {
    return buildInterface({
        id: "statSimpleLinearInterface",
        title: "📈 Simple Linear Regression",
        card: [
            { formula: "📌 y = β₀ + β₁x + ε" },
            {
                desc: "<strong>Formula details:</strong><br>\n                    • β₁ = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / Σ(xᵢ - x̄)² (Slope)<br>\n                    • β₀ = ȳ - β₁x̄ (Intercept)<br>\n                    • R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub> (Coefficient of determination)"
            },
            {
                desc: "Models the linear relationship between one independent variable (X) and one dependent variable (Y).",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter X values (independent variable):",
                textarea: { id: "simpleXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📋 Enter Y values (dependent variable):",
                labelAttrs: { style: FIELD_GAP },
                textarea: {
                    id: "simpleYInput",
                    rows: "3",
                    placeholder: "Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"
                }
            }
        ],
        run: { id: "simpleLinearComputeBtn", text: "📈 Fit Regression Model + Full Steps" },
        clear: { id: "simpleLinearClearBtn", text: "Clear All" },
        result: {
            area: "simpleLinearResultArea",
            label: "🎯 REGRESSION RESULTS",
            value: "simpleLinearValueDisplay",
            steps: "simpleLinearStepsDisplay"
        }
    });
}

// ========== SIMPLE LINEAR REGRESSION COMPUTATION ==========
function computeSimpleLinearRegression(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 observations for regression." };
    }
    
    const n = xValues.length;
    
    // Calculate means
    const meanX = xValues.reduce((a, b) => a + b, 0) / n;
    const meanY = yValues.reduce((a, b) => a + b, 0) / n;
    
    // Calculate slope (β₁) and intercept (β₀)
    let numerator = 0;
    let denominator = 0;
    let xyDetails = [];
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        numerator += xDev * yDev;
        denominator += xDev * xDev;
        xyDetails.push({ x: xValues[i], y: yValues[i], xDev, yDev, product: xDev * yDev, xSq: xDev * xDev });
    }
    
    if (!(denominator > 0)) {
        return { error: true, message: "All X values are identical, so Σ(x - x̄)² = 0 and the slope is undefined. Enter X values that vary." };
    }
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Calculate predictions and residuals
    let predictions = [];
    let residuals = [];
    let ssRes = 0;
    let ssTot = 0;
    let residualDetails = [];
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        predictions.push(yPred);
        residuals.push(residual);
        ssRes += residual * residual;
        ssTot += Math.pow(yValues[i] - meanY, 2);
        residualDetails.push({ x: xValues[i], y: yValues[i], yPred, residual, squaredRes: residual * residual });
    }
    
    if (!(ssTot > 0)) {
        return { error: true, message: "All Y values are identical, so the total sum of squares is 0 and R² is undefined (0 / 0). Enter Y values that vary." };
    }
    const rSquared = 1 - (ssRes / ssTot);
    const adjRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - 2));
    
    // Standard error of coefficients
    const residualStdError = Math.sqrt(ssRes / (n - 2));
    const seSlope = residualStdError / Math.sqrt(denominator);
    const seIntercept = residualStdError * Math.sqrt(1/n + Math.pow(meanX, 2) / denominator);
    
    // t-statistics and p-values
    // On a perfect fit the standard errors are 0, so t and F are infinite: reported as null ("undefined"), as in the other regression tools
    const perfect = isPerfectFit(ssRes, ssTot);
    const tSlope = perfect ? null : slope / seSlope;
    const tIntercept = perfect ? null : intercept / seIntercept;
    const pSlope = perfect ? null : 2 * (1 - tCDF(Math.abs(tSlope), n - 2));
    const pIntercept = perfect ? null : 2 * (1 - tCDF(Math.abs(tIntercept), n - 2));
    
    // F-statistic for overall model
    const fStatistic = perfect ? null : (rSquared / 1) / ((1 - rSquared) / (n - 2));
    const pF = perfect ? null : 1 - fCDF(fStatistic, 1, n - 2);
    const fmt = (v, d) => v === null ? 'undefined (perfect fit)' : v.toFixed(d);
    
    // Build calculation table HTML
    let calcTableRows = '';
    for (let i = 0; i < n; i++) {
        const d = xyDetails[i];
        calcTableRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            <td class="s-a7c3f4">${d.x}</td>
            <td class="s-a7c3f4">${d.y}</td>
            <td class="s-a7c3f4">${d.xDev.toFixed(4)}</td>
            <td class="s-a7c3f4">${d.yDev.toFixed(4)}</td>
            <td class="s-f8719c">${d.product.toFixed(4)}</td>
            <td class="s-a7c3f4">${d.xSq.toFixed(4)}</td>
        </tr>`;
    }
    
    let residualTableRows = '';
    for (let i = 0; i < n; i++) {
        const r = residualDetails[i];
        residualTableRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            <td class="s-a7c3f4">${r.x}</td>
            <td class="s-a7c3f4">${r.y}</td>
            <td class="s-a7c3f4">${r.yPred.toFixed(4)}</td>
            <td class="s-a7c3f4">${r.residual.toFixed(4)}</td>
            <td class="s-a7c3f4">${r.squaredRes.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">📈</span>
                <h2 class="s-f8a94d">Simple Linear Regression</h2>
            </div>
            <p class="s-259079">Formula: ŷ = β₀ + β₁x</p>
            <p class="s-20a400">β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)² | β₀ = ȳ - β₁x̄</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-a05b64 gen-grid gen-grid-many">
                <div class="s-63afdf"><div class="s-137d30">n (Observations)</div><div class="s-c2434f">${n}</div></div>
                <div class="s-63afdf"><div class="s-137d30">x̄ (Mean X)</div><div class="s-2ba433">${meanX.toFixed(4)}</div></div>
                <div class="s-63afdf"><div class="s-137d30">ȳ (Mean Y)</div><div class="s-2ba433">${meanY.toFixed(4)}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Σ(x - x̄)(y - ȳ)</div><div class="s-2ba433">${numerator.toFixed(4)}</div></div>
            </div>
        </div>
        
        <div class="s-2311e6">
            <h3 class="s-10bf27">📋 Step 1: Calculate Deviations and Cross-Products</h3>
            <table class="s-897d74 gen-sized">
                <thead><tr class="s-bfd0ae">
                    <th class="s-939795">i</th><th class="s-939795">x</th><th class="s-939795">y</th>
                    <th class="s-939795">x - x̄</th><th class="s-939795">y - ȳ</th>
                    <th class="s-939795">(x - x̄)(y - ȳ)</th><th class="s-939795">(x - x̄)²</th>
                 </tr></thead>
                <tbody>${calcTableRows}
                    <tr class="s-17b154">
                        <td class="s-ebe99d" colspan="5">Σ →</td>
                        <td class="s-a7c3f4">${numerator.toFixed(4)}</td>
                        <td class="s-a7c3f4">${denominator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 2: Calculate Coefficients</h3>
            
            <div class="s-ca9e5c">
                <strong>Slope (β₁):</strong><br>
                β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²<br>
                β₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)} = <strong class="s-f342b5">${slope.toFixed(8)}</strong>
            </div>
            
            <div class="s-6025fc">
                <strong>Intercept (β₀):</strong><br>
                β₀ = ȳ - β₁·x̄<br>
                β₀ = ${meanY.toFixed(4)} - (${slope.toFixed(6)} × ${meanX.toFixed(4)})<br>
                β₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)} = <strong class="s-f342b5">${intercept.toFixed(8)}</strong>
            </div>
        </div>
        
        <div class="s-2311e6">
            <h3 class="s-10bf27">📋 Step 3: Predictions and Residuals</h3>
            <div class="s-d3acac">
                <strong>Regression equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
            </div>
            <table class="s-897d74 gen-sized">
                <thead><tr class="s-bfd0ae">
                    <th class="s-939795">i</th><th class="s-939795">x</th><th class="s-939795">y</th>
                    <th class="s-939795">ŷ (Predicted)</th><th class="s-939795">Residual (y - ŷ)</th>
                    <th class="s-939795">(y - ŷ)²</th>
                 </tr></thead>
                <tbody>${residualTableRows}
                    <tr class="s-17b154">
                        <td class="s-ebe99d" colspan="5">SS<sub>res</sub> (Sum of Squared Residuals) →</td>
                        <td class="s-a7c3f4">${ssRes.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">📊 Step 4: Model Fit Statistics</h3>
            
            <div class="s-ca9e5c">
                <strong>R-squared (R²):</strong><br>
                R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub><br>
                SS<sub>tot</sub> = Σ(yᵢ - ȳ)² = ${ssTot.toFixed(4)}<br>
                R² = 1 - ${ssRes.toFixed(4)} / ${ssTot.toFixed(4)} = <strong class="s-f342b5">${rSquared.toFixed(8)}</strong><br>
                <span class="s-888a4b">Interpretation: ${(rSquared * 100).toFixed(1)}% of variance in Y is explained by X</span>
            </div>
            
            <div class="s-ca9e5c">
                <strong>Adjusted R-squared:</strong><br>
                R²<sub>adj</sub> = 1 - (1 - R²)(n - 1)/(n - 2)<br>
                R²<sub>adj</sub> = 1 - (1 - ${rSquared.toFixed(4)}) × ${n-1}/${n-2} = <strong class="s-f342b5">${adjRSquared.toFixed(8)}</strong>
            </div>
            
            <div class="s-6025fc">
                <strong>Overall Model F-test:</strong><br>
                F = (R² / k) / ((1 - R²) / (n - k - 1))<br>
                F = ${fmt(fStatistic, 6)}<br>
                p-value = ${fmt(pF, 8)}<br>
                <strong>Regression equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
            </div>
        </div>
        
        <div class="s-d45b93 gen-pad">
            <h3 class="s-c7f0b4">📌 Interpretation</h3>
            <div><strong>Slope (β₁):</strong> ${slope.toFixed(6)} → For each 1-unit increase in X, Y changes by ${slope.toFixed(4)} units</div>
            <div><strong>Intercept (β₀):</strong> ${intercept.toFixed(6)} → Predicted Y when X = 0</div>
            <div><strong>R-squared:</strong> ${(rSquared * 100).toFixed(1)}% of variance explained</div>
            <div class="s-8d2e44">
                💡 <strong>Model:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x<br>
                💡 <strong>Coefficient Statistics:</strong> t<sub>slope</sub> = ${fmt(tSlope, 4)} (p = ${fmt(pSlope, 6)})
            </div>
        </div>
    </div>`;
    
    return { slope, intercept, rSquared, adjRSquared, fStatistic, pF, perfectFit: perfect, steps };
}

// ========== REGRESSION SETUP FUNCTIONS ==========
function setupSimpleLinearLogic() {
    const computeBtn = document.getElementById("simpleLinearComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("simpleXInput").value;
        const rawY = document.getElementById("simpleYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("simpleLinearResultArea");
        const valueSpan = document.getElementById("simpleLinearValueDisplay");
        const stepsSpan = document.getElementById("simpleLinearStepsDisplay");
        
        const result = computeSimpleLinearRegression(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `ŷ = ${result.intercept.toFixed(4)} + ${result.slope.toFixed(4)}x | R² = ${result.rSquared.toFixed(4)} | adjusted R² = ${result.adjRSquared.toFixed(4)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("simpleLinearClearBtn", ["simpleXInput", "simpleYInput"], "simpleLinearResultArea");
}
