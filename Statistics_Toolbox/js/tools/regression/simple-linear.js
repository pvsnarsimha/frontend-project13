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
    
    const rSquared = 1 - (ssRes / ssTot);
    const adjRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - 2));
    
    // Standard error of coefficients
    const residualStdError = Math.sqrt(ssRes / (n - 2));
    const seSlope = residualStdError / Math.sqrt(denominator);
    const seIntercept = residualStdError * Math.sqrt(1/n + Math.pow(meanX, 2) / denominator);
    
    // t-statistics and p-values
    const tSlope = slope / seSlope;
    const tIntercept = intercept / seIntercept;
    const pSlope = 2 * (1 - tCDF(Math.abs(tSlope), n - 2));
    const pIntercept = 2 * (1 - tCDF(Math.abs(tIntercept), n - 2));
    
    // F-statistic for overall model
    const fStatistic = (rSquared / 1) / ((1 - rSquared) / (n - 2));
    const pF = 1 - fCDF(fStatistic, 1, n - 2);
    
    // Build calculation table HTML
    let calcTableRows = '';
    for (let i = 0; i < n; i++) {
        const d = xyDetails[i];
        calcTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${d.x}</td>
            <td style="padding: 8px; text-align: center;">${d.y}</td>
            <td style="padding: 8px; text-align: center;">${d.xDev.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${d.yDev.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold;">${d.product.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${d.xSq.toFixed(4)}</td>
        </tr>`;
    }
    
    let residualTableRows = '';
    for (let i = 0; i < n; i++) {
        const r = residualDetails[i];
        residualTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${r.x}</td>
            <td style="padding: 8px; text-align: center;">${r.y}</td>
            <td style="padding: 8px; text-align: center;">${r.yPred.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${r.residual.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${r.squaredRes.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📈</span>
                <h2 style="margin: 0;">Simple Linear Regression</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: ŷ = β₀ + β₁x</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)² | β₀ = ȳ - β₁x̄</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">n (Observations)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">x̄ (Mean X)</div><div style="font-size: 18px;">${meanX.toFixed(4)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">ȳ (Mean Y)</div><div style="font-size: 18px;">${meanY.toFixed(4)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Σ(x - x̄)(y - ȳ)</div><div style="font-size: 18px;">${numerator.toFixed(4)}</div></div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Calculate Deviations and Cross-Products</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;">
                    <th style="padding: 8px;">i</th><th style="padding: 8px;">x</th><th style="padding: 8px;">y</th>
                    <th style="padding: 8px;">x - x̄</th><th style="padding: 8px;">y - ȳ</th>
                    <th style="padding: 8px;">(x - x̄)(y - ȳ)</th><th style="padding: 8px;">(x - x̄)²</th>
                 </tr></thead>
                <tbody>${calcTableRows}
                    <tr style="background: #e9ecef; font-weight: bold;">
                        <td colspan="5" style="padding: 8px; text-align: right;">Σ →</td>
                        <td style="padding: 8px; text-align: center;">${numerator.toFixed(4)}</td>
                        <td style="padding: 8px; text-align: center;">${denominator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Coefficients</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Slope (β₁):</strong><br>
                β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²<br>
                β₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)} = <strong style="color: #1a5490;">${slope.toFixed(8)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Intercept (β₀):</strong><br>
                β₀ = ȳ - β₁·x̄<br>
                β₀ = ${meanY.toFixed(4)} - (${slope.toFixed(6)} × ${meanX.toFixed(4)})<br>
                β₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)} = <strong style="color: #1a5490;">${intercept.toFixed(8)}</strong>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 3: Predictions and Residuals</h3>
            <div style="padding: 12px; background: #e8f4f8; font-size: 13px;">
                <strong>Regression equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;">
                    <th style="padding: 8px;">i</th><th style="padding: 8px;">x</th><th style="padding: 8px;">y</th>
                    <th style="padding: 8px;">ŷ (Predicted)</th><th style="padding: 8px;">Residual (y - ŷ)</th>
                    <th style="padding: 8px;">(y - ŷ)²</th>
                 </tr></thead>
                <tbody>${residualTableRows}
                    <tr style="background: #e9ecef; font-weight: bold;">
                        <td colspan="5" style="padding: 8px; text-align: right;">SS<sub>res</sub> (Sum of Squared Residuals) →</td>
                        <td style="padding: 8px; text-align: center;">${ssRes.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Step 4: Model Fit Statistics</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>R-squared (R²):</strong><br>
                R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub><br>
                SS<sub>tot</sub> = Σ(yᵢ - ȳ)² = ${ssTot.toFixed(4)}<br>
                R² = 1 - ${ssRes.toFixed(4)} / ${ssTot.toFixed(4)} = <strong style="color: #1a5490;">${rSquared.toFixed(8)}</strong><br>
                <span style="font-size: 12px;">Interpretation: ${(rSquared * 100).toFixed(1)}% of variance in Y is explained by X</span>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Adjusted R-squared:</strong><br>
                R²<sub>adj</sub> = 1 - (1 - R²)(n - 1)/(n - 2)<br>
                R²<sub>adj</sub> = 1 - (1 - ${rSquared.toFixed(4)}) × ${n-1}/${n-2} = <strong style="color: #1a5490;">${adjRSquared.toFixed(8)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Overall Model F-test:</strong><br>
                F = (R² / k) / ((1 - R²) / (n - k - 1))<br>
                F = ${fStatistic.toFixed(6)}<br>
                p-value = ${pF.toFixed(8)}<br>
                <strong>Regression equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: #d4edda; border-left: 6px solid #28a745;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <div><strong>Slope (β₁):</strong> ${slope.toFixed(6)} → For each 1-unit increase in X, Y changes by ${slope.toFixed(4)} units</div>
            <div><strong>Intercept (β₀):</strong> ${intercept.toFixed(6)} → Predicted Y when X = 0</div>
            <div><strong>R-squared:</strong> ${(rSquared * 100).toFixed(1)}% of variance explained</div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Model:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x<br>
                💡 <strong>Coefficient Statistics:</strong> t<sub>slope</sub> = ${tSlope.toFixed(4)} (p = ${pSlope.toFixed(6)})
            </div>
        </div>
    </div>`;
    
    return { slope, intercept, rSquared, adjRSquared, fStatistic, pF, steps };
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
            setHtml(valueSpan, `ŷ = ${result.intercept.toFixed(4)} + ${result.slope.toFixed(4)}x | R² = ${result.rSquared.toFixed(4)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("simpleLinearClearBtn", ["simpleXInput", "simpleYInput"], "simpleLinearResultArea");
}
