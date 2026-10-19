/* StdErrors: stderrors tool (render, compute, setup) */

// ========== STANDARD ERRORS OF COEFFICIENTS INTERFACE ==========
function renderStdErrorsInterface() {
    return buildInterface({
        id: "statStdErrorsInterface",
        title: "📏 Standard Errors of Regression Coefficients",
        card: [
            { formula: "📌 SE(β₁) = √[MSE / Σ(xᵢ - x̄)²]" },
            { formula: "📌 SE(β₀) = √[MSE × (1/n + x̄²/Σ(xᵢ - x̄)²)]", attrs: { style: CARD_GAP } },
            {
                desc: "<strong>What are Standard Errors?</strong><br>\n                    Standard errors measure the precision of coefficient estimates. \n                    Smaller SE = more precise estimate. Used to construct confidence intervals and t-statistics."
            }
        ],
        inputs: [
            {
                label: "📋 Enter X values (independent variable):",
                textarea: { id: "stderrorsXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📋 Enter Y values (dependent variable):",
                labelAttrs: { style: FIELD_GAP },
                textarea: {
                    id: "stderrorsYInput",
                    rows: "3",
                    placeholder: "Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"
                }
            }
        ],
        run: { id: "stderrorsComputeBtn", text: "📏 Calculate Standard Errors + Full Steps" },
        clear: { id: "stderrorsClearBtn", text: "Clear All" },
        result: {
            area: "stderrorsResultArea",
            label: "🎯 STANDARD ERRORS RESULTS",
            value: "stderrorsValueDisplay",
            steps: "stderrorsStepsDisplay"
        }
    });
}

// ========== STANDARD ERRORS COMPUTATION (REDESIGNED WITH TABLES) ==========
function computeStdErrorsWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
    }
    
    const n = xValues.length;
    const meanX = xValues.reduce((a,b) => a+b, 0) / n;
    const meanY = yValues.reduce((a,b) => a+b, 0) / n;
    
    // Build deviation table
    let deviationRows = '';
    let numerator = 0, denominator = 0;
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        const product = xDev * yDev;
        const xSq = xDev * xDev;
        numerator += product;
        denominator += xSq;
        
        deviationRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]} - ${meanX.toFixed(4)} = ${xDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]} - ${meanY.toFixed(4)} = ${yDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; font-weight: 600; color: #1a5490;">${product.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${xSq.toFixed(4)}</td>
        </tr>`;
    }
    
    if (!(denominator > 0)) {
        return { error: true, message: "All X values are identical, so Σ(x - x̄)² = 0 and the slope is undefined. Enter X values that vary." };
    }
    const core = simpleRegressionCore(xValues, yValues);   // the shared formulas (core/helpers.js); the loops below only build the display tables
    if (!(core.ssTot > 0)) {
        return { error: true, message: "All Y values are identical, so the slope is 0 and there is no variation to test (R² is undefined). Enter Y values that vary." };
    }
    if (core.ssRes <= 1e-12 * core.ssTot) {
        return { error: true, message: "The line fits the data perfectly (residual sum of squares ≈ 0), so the standard errors are 0 and the t statistics are infinite. Inference needs some scatter around the line." };
    }
    const slope = core.slope;
    const intercept = core.intercept;
    
    // Build predictions and residuals table
    let predictionsRows = '';
    let ssRes = 0;
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        ssRes += residual * residual;
        
        predictionsRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${intercept.toFixed(4)} + ${slope.toFixed(4)}×${xValues[i]} = ${yPred.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; ${residual >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">${residual.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${(residual * residual).toFixed(4)}</td>
        </tr>`;
    }
    
    const mse = core.mse;
    const tCrit = n > 2 ? tCriticalValue(0.025, n - 2) : NaN;   // 95% CI uses the t quantile with n - 2 df
    const seSlope = core.seSlope;
    const seIntercept = core.seIntercept;
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📏 Standard Errors of Regression Coefficients</h1>
            <p style="margin: 0; opacity: 0.95;">SE(β₁) = √[MSE / Σ(xᵢ - x̄)²] &nbsp;|&nbsp; SE(β₀) = √[MSE × (1/n + x̄²/Σ(xᵢ - x̄)²)]</p>
        </div>
        
        <!-- STEP 1: DEVIATIONS TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0;">📊 Step 1: Calculate Deviations and Cross-Products</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px;">i</th>
                        <th style="padding: 12px;">x</th>
                        <th style="padding: 12px;">y</th>
                        <th style="padding: 12px;">x - x̄</th>
                        <th style="padding: 12px;">y - ȳ</th>
                        <th style="padding: 12px;">(x - x̄)(y - ȳ)</th>
                        <th style="padding: 12px;">(x - x̄)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${deviationRows}
                    <tr style="background: #e9ecef; font-weight: 700; border-top: 2px solid #1a5490;">
                        <td colspan="5" style="padding: 12px; text-align: right;">SUM →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white;">${numerator.toFixed(4)}</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white;">${denominator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 2: REGRESSION COEFFICIENTS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate Regression Coefficients</h3>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 12px; color: #666;">Slope (β₁)</div>
                        <div style="font-size: 24px; font-weight: 700; color: #1a5490;">β₁ = ${slope.toFixed(6)}</div>
                        <div style="font-size: 11px;">= ${numerator.toFixed(4)} / ${denominator.toFixed(4)}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 12px; color: #666;">Intercept (β₀)</div>
                        <div style="font-size: 24px; font-weight: 700; color: #1a5490;">β₀ = ${intercept.toFixed(6)}</div>
                        <div style="font-size: 11px;">= ${meanY.toFixed(4)} - ${slope.toFixed(4)}×${meanX.toFixed(4)}</div>
                    </div>
                </div>
                <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 8px; text-align: center;">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- STEP 3: PREDICTIONS AND RESIDUALS TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0;">📊 Step 3: Calculate Predictions and Residuals</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px;">i</th>
                        <th style="padding: 12px;">x</th>
                        <th style="padding: 12px;">y</th>
                        <th style="padding: 12px;">Predicted (ŷ)</th>
                        <th style="padding: 12px;">Residual (e = y - ŷ)</th>
                        <th style="padding: 12px;">e²</th>
                    </tr>
                </thead>
                <tbody>
                    ${predictionsRows}
                    <tr style="background: #e9ecef; font-weight: 700; border-top: 2px solid #1a5490;">
                        <td colspan="5" style="padding: 12px; text-align: right;">SS<sub>res</sub> = Σe² →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white;">${ssRes.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 4: MSE AND STANDARD ERRORS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Calculate MSE and Standard Errors</h3>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <strong>📐 Mean Squared Error (MSE)</strong><br>
                    MSE = SS<sub>res</sub> / (n - 2) = ${ssRes.toFixed(4)} / ${n-2} = <strong style="color: #1a5490;">${mse.toFixed(6)}</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                        <strong>📐 Standard Error of Slope (SE<sub>β₁</sub>)</strong><br>
                        SE(β₁) = √[MSE / Σ(x - x̄)²]<br>
                        = √[${mse.toFixed(6)} / ${denominator.toFixed(4)}]<br>
                        = √${(mse/denominator).toFixed(6)}<br>
                        = <strong style="color: #1a5490; font-size: 18px;">${seSlope.toFixed(8)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                        <strong>📐 Standard Error of Intercept (SE<sub>β₀</sub>)</strong><br>
                        SE(β₀) = √[MSE × (1/n + x̄²/Σ(x - x̄)²)]<br>
                        = √[${mse.toFixed(6)} × (1/${n} + ${Math.pow(meanX,2).toFixed(4)}/${denominator.toFixed(4)})]<br>
                        = √[${mse.toFixed(6)} × ${(1/n + Math.pow(meanX,2)/denominator).toFixed(6)}]<br>
                        = <strong style="color: #1a5490; font-size: 18px;">${seIntercept.toFixed(8)}</strong>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- RESULTS SUMMARY -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; border: 2px solid #1a5490; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 Standard Errors Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Coefficient</th>
                        <th style="padding: 12px;">Estimate (β̂)</th>
                        <th style="padding: 12px;">Standard Error (SE)</th>
                        <th style="padding: 12px;">95% Confidence Interval (t, df = n − 2)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Intercept (β₀)</td>
                        <td style="text-align: center;">${intercept.toFixed(6)}</td>
                        <td style="text-align: center; font-weight: bold; color: #1a5490;">${seIntercept.toFixed(6)}</td>
                        <td style="text-align: center;">[${(intercept - tCrit*seIntercept).toFixed(4)}, ${(intercept + tCrit*seIntercept).toFixed(4)}]</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Slope (β₁)</td>
                        <td style="text-align: center;">${slope.toFixed(6)}</td>
                        <td style="text-align: center; font-weight: bold; color: #1a5490;">${seSlope.toFixed(6)}</td>
                        <td style="text-align: center;">[${(slope - tCrit*seSlope).toFixed(4)}, ${(slope + tCrit*seSlope).toFixed(4)}]</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- INTERPRETATION -->
        <div style="background: #d4edda; border-radius: 16px; padding: 20px; border-left: 6px solid #28a745;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <p><strong>SE(β₀) = ${seIntercept.toFixed(6)}</strong> → The intercept estimate has a standard error of ${seIntercept.toFixed(4)} units.</p>
            <p><strong>SE(β₁) = ${seSlope.toFixed(6)}</strong> → For each 1-unit change in X, the predicted Y changes by ${slope.toFixed(4)} ± ${(tCrit*seSlope).toFixed(4)} (95% CI).</p>
            <p><strong>Smaller SE = More precise estimate.</strong> SE depends on: variance of residuals (MSE) and spread of X values.</p>
        </div>
    </div>`;
    
    return { seIntercept, seSlope, slope, intercept, mse, steps };
}

// ========== STANDARD ERRORS SETUP ==========
function setupStdErrorsLogic() {
    const computeBtn = document.getElementById("stderrorsComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("stderrorsXInput").value;
        const rawY = document.getElementById("stderrorsYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("stderrorsResultArea");
        const valueSpan = document.getElementById("stderrorsValueDisplay");
        const stepsSpan = document.getElementById("stderrorsStepsDisplay");
        
        const result = computeStdErrorsWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `SE(β₀) = ${result.seIntercept.toFixed(6)} | SE(β₁) = ${result.seSlope.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("stderrorsClearBtn", ["stderrorsXInput", "stderrorsYInput"], "stderrorsResultArea");
}
