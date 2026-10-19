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
    const deviationRows = buildDeviationRows(xValues, yValues, meanX, meanY);
    let numerator = 0, denominator = 0;
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        const product = xDev * yDev;
        const xSq = xDev * xDev;
        numerator += product;
        denominator += xSq;
        
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
    const predictionsRows = buildPredictionRows(xValues, yValues, slope, intercept);
    let ssRes = 0;
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        ssRes += residual * residual;
        
    }
    
    const mse = core.mse;
    const tCrit = n > 2 ? tCriticalValue(0.025, n - 2) : NaN;   // 95% CI uses the t quantile with n - 2 df
    const seSlope = core.seSlope;
    const seIntercept = core.seIntercept;
    
    let steps = `<div class="s-9217e5">
        
        <!-- HEADER -->
        <div class="s-954e6d gen-pad">
            <h1 class="s-b82e54">📏 Standard Errors of Regression Coefficients</h1>
            <p class="s-cf6932">SE(β₁) = √[MSE / Σ(xᵢ - x̄)²] &nbsp;|&nbsp; SE(β₀) = √[MSE × (1/n + x̄²/Σ(xᵢ - x̄)²)]</p>
        </div>
        
        <!-- STEP 1: DEVIATIONS TABLE -->
        <div class="s-802cd7">
            <div class="s-63fd4e">
                <h3 class="s-ee9eaa">📊 Step 1: Calculate Deviations and Cross-Products</h3>
            </div>
            <table class="s-306b2c gen-sized">
                <thead>
                    <tr class="s-df5107">
                        <th class="s-d66e1c">i</th>
                        <th class="s-d66e1c">x</th>
                        <th class="s-d66e1c">y</th>
                        <th class="s-d66e1c">x - x̄</th>
                        <th class="s-d66e1c">y - ȳ</th>
                        <th class="s-d66e1c">(x - x̄)(y - ȳ)</th>
                        <th class="s-d66e1c">(x - x̄)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${deviationRows}
                    <tr class="s-9ceeb6">
                        <td class="s-6ecd26" colspan="5">SUM →</td>
                        <td class="s-5eb347">${numerator.toFixed(4)}</td>
                        <td class="s-5eb347">${denominator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 2: REGRESSION COEFFICIENTS -->
        <div class="s-95d04a gen-pad">
            <h3 class="s-862845">🔢 Step 2: Calculate Regression Coefficients</h3>
            <div class="s-6fab3a gen-pad">
                <div class="s-87555e gen-grid">
                    <div class="s-299a65">
                        <div class="s-80a200">Slope (β₁)</div>
                        <div class="s-fad2be">β₁ = ${slope.toFixed(6)}</div>
                        <div class="s-d52d0d">= ${numerator.toFixed(4)} / ${denominator.toFixed(4)}</div>
                    </div>
                    <div class="s-299a65">
                        <div class="s-80a200">Intercept (β₀)</div>
                        <div class="s-fad2be">β₀ = ${intercept.toFixed(6)}</div>
                        <div class="s-d52d0d">= ${meanY.toFixed(4)} - ${slope.toFixed(4)}×${meanX.toFixed(4)}</div>
                    </div>
                </div>
                <div class="s-f34d93">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- STEP 3: PREDICTIONS AND RESIDUALS TABLE -->
        <div class="s-802cd7">
            <div class="s-63fd4e">
                <h3 class="s-ee9eaa">📊 Step 3: Calculate Predictions and Residuals</h3>
            </div>
            <table class="s-306b2c gen-sized">
                <thead>
                    <tr class="s-df5107">
                        <th class="s-d66e1c">i</th>
                        <th class="s-d66e1c">x</th>
                        <th class="s-d66e1c">y</th>
                        <th class="s-d66e1c">Predicted (ŷ)</th>
                        <th class="s-d66e1c">Residual (e = y - ŷ)</th>
                        <th class="s-d66e1c">e²</th>
                    </tr>
                </thead>
                <tbody>
                    ${predictionsRows}
                    <tr class="s-9ceeb6">
                        <td class="s-6ecd26" colspan="5">SS<sub>res</sub> = Σe² →</td>
                        <td class="s-5eb347">${ssRes.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 4: MSE AND STANDARD ERRORS -->
        <div class="s-95d04a gen-pad">
            <h3 class="s-862845">🔢 Step 4: Calculate MSE and Standard Errors</h3>
            
            <div class="s-41df42 gen-pad">
                <div class="s-6e278c">
                    <strong>📐 Mean Squared Error (MSE)</strong><br>
                    MSE = SS<sub>res</sub> / (n - 2) = ${ssRes.toFixed(4)} / ${n-2} = <strong class="s-f342b5">${mse.toFixed(6)}</strong>
                </div>
                
                <div class="s-87555e gen-grid">
                    <div class="s-cb281a">
                        <strong>📐 Standard Error of Slope (SE<sub>β₁</sub>)</strong><br>
                        SE(β₁) = √[MSE / Σ(x - x̄)²]<br>
                        = √[${mse.toFixed(6)} / ${denominator.toFixed(4)}]<br>
                        = √${(mse/denominator).toFixed(6)}<br>
                        = <strong class="s-bbce95">${seSlope.toFixed(8)}</strong>
                    </div>
                    <div class="s-cb281a">
                        <strong>📐 Standard Error of Intercept (SE<sub>β₀</sub>)</strong><br>
                        SE(β₀) = √[MSE × (1/n + x̄²/Σ(x - x̄)²)]<br>
                        = √[${mse.toFixed(6)} × (1/${n} + ${Math.pow(meanX,2).toFixed(4)}/${denominator.toFixed(4)})]<br>
                        = √[${mse.toFixed(6)} × ${(1/n + Math.pow(meanX,2)/denominator).toFixed(6)}]<br>
                        = <strong class="s-bbce95">${seIntercept.toFixed(8)}</strong>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- RESULTS SUMMARY -->
        <div class="s-20f162">
            <h3 class="s-ba9de1">📊 Standard Errors Summary</h3>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-bfd0ae">
                        <th class="s-d66e1c">Coefficient</th>
                        <th class="s-d66e1c">Estimate (β̂)</th>
                        <th class="s-d66e1c">Standard Error (SE)</th>
                        <th class="s-d66e1c">95% Confidence Interval (t, df = n − 2)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="s-b490b8">
                        <td class="s-8136fa">Intercept (β₀)</td>
                        <td class="s-02528c">${intercept.toFixed(6)}</td>
                        <td class="s-a79d4a">${seIntercept.toFixed(6)}</td>
                        <td class="s-02528c">[${(intercept - tCrit*seIntercept).toFixed(4)}, ${(intercept + tCrit*seIntercept).toFixed(4)}]</td>
                    </tr>
                    <tr>
                        <td class="s-8136fa">Slope (β₁)</td>
                        <td class="s-02528c">${slope.toFixed(6)}</td>
                        <td class="s-a79d4a">${seSlope.toFixed(6)}</td>
                        <td class="s-02528c">[${(slope - tCrit*seSlope).toFixed(4)}, ${(slope + tCrit*seSlope).toFixed(4)}]</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- INTERPRETATION -->
        <div class="s-b888ff gen-pad">
            <h3 class="s-c7f0b4">📌 Interpretation</h3>
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
