/* TStats: tstats tool (render, compute, setup) */

// ========== T-STATISTICS FOR COEFFICIENTS INTERFACE ==========
function renderTStatsInterface() {
    return buildInterface({
        id: "statTStatsInterface",
        title: "t-Statistics for Regression Coefficients",
        formula: "📌 t = β̂ / SE(β̂)",
        desc: "<strong>What are t-statistics?</strong><br>\n                    t-statistics test whether coefficients are significantly different from zero.\n                    H₀: β = 0 (no effect) | H₁: β ≠ 0 (significant effect)\n                    |t| > 2 typically indicates significance at α = 0.05.",
        inputs: [
            {
                label: "📋 Enter X values (independent variable):",
                textarea: { id: "tstatsXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📋 Enter Y values (dependent variable):",
                labelAttrs: { style: FIELD_GAP },
                textarea: {
                    id: "tstatsYInput",
                    rows: "3",
                    placeholder: "Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"
                }
            }
        ],
        run: { id: "tstatsComputeBtn", text: "t Calculate t-Statistics + Full Steps" },
        clear: { id: "tstatsClearBtn", text: "Clear All" },
        result: {
            area: "tstatsResultArea",
            label: "🎯 T-STATISTICS RESULTS",
            value: "tstatsValueDisplay",
            steps: "tstatsStepsDisplay"
        }
    });
}

// ========== T-STATISTICS COMPUTATION (REDESIGNED WITH TABLES) ==========
// ========== T-STATISTICS COMPUTATION (COMPLETE WITH FULL β̂ DERIVATION) ==========
function computeTStatsWithSteps(xValues, yValues) {
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
    
    // ========== STEP 1: Build complete deviation table ==========
    const deviationRows = buildDeviationRows(xValues, yValues, meanX, meanY);
    let numerator = 0, denominator = 0;
    let sumX = 0, sumY = 0;
    let xyProducts = [], xxSquares = [];
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        const product = xDev * yDev;
        const xSq = xDev * xDev;
        numerator += product;
        denominator += xSq;
        sumX += xValues[i];
        sumY += yValues[i];
        xyProducts.push(product);
        xxSquares.push(xSq);
        
    }
    
    // ========== STEP 2: Calculate β̂ coefficients ==========
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
    
    // ========== STEP 3: Build predictions and residuals table ==========
    const predictionsRows = buildPredictionRows(xValues, yValues, slope, intercept);
    let ssRes = 0;
    let residuals = [];
    let predictions = [];
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        predictions.push(yPred);
        residuals.push(residual);
        ssRes += residual * residual;
        
    }
    
    // ========== STEP 4: Calculate Standard Errors ==========
    const mse = core.mse;
    const seSlope = core.seSlope;
    const seIntercept = core.seIntercept;
    
    // ========== STEP 5: Calculate t-statistics ==========
    const tSlope = slope / seSlope;
    const tIntercept = intercept / seIntercept;
    
    const df = n - 2;
    const criticalT = tCriticalValue(0.025, df);
    const pSlope = 2 * (1 - tCDF(Math.abs(tSlope), df));
    const pIntercept = 2 * (1 - tCDF(Math.abs(tIntercept), df));
    
    // ========== Build complete HTML with all steps ==========
    let steps = `<div class="s-9217e5">
        
        <!-- HEADER -->
        <div class="s-954e6d gen-pad">
            <h1 class="s-b82e54">t-Statistics for Regression Coefficients</h1>
            <p class="s-cf6932">t = β̂ / SE(β̂) | H₀: β = 0 | H₁: β ≠ 0</p>
            <p class="s-b5eb65">df = n - 2 = ${df} | Critical t (α=0.05, two-tailed) = ±${criticalT.toFixed(4)}</p>
        </div>
        
        <!-- ========== PART 1: CALCULATE β̂ (REGRESSION COEFFICIENTS) ========== -->
        <div class="s-bfd155 gen-pad">
            <h2 class="s-2ce3ad">📐 PART 1: Calculate Regression Coefficients (β̂₀, β̂₁)</h2>
            
            <div class="s-2a0883 gen-pad">
                <h3 class="s-6efabd">Step 1.1: Calculate Means</h3>
                <div class="s-87555e gen-grid">
                    <div class="s-ee59d6">
                        <strong>x̄ (Mean of X):</strong><br>
                        x̄ = Σx / n = ${sumX} / ${n} = <strong>${meanX.toFixed(6)}</strong>
                    </div>
                    <div class="s-ee59d6">
                        <strong>ȳ (Mean of Y):</strong><br>
                        ȳ = Σy / n = ${sumY} / ${n} = <strong>${meanY.toFixed(6)}</strong>
                    </div>
                </div>
            </div>
            
            <div class="s-2a0883 gen-pad">
                <h3 class="s-6efabd">Step 1.2: Calculate Deviations and Cross-Products</h3>
                <div class="s-01a9b9">
                    <table class="s-306b2c gen-sized">
                        <thead>
                            <tr class="s-e7b83b">
                                <th class="s-a756db">i</th>
                                <th class="s-a756db">x</th>
                                <th class="s-a756db">y</th>
                                <th class="s-a756db">x - x̄</th>
                                <th class="s-a756db">y - ȳ</th>
                                <th class="s-a756db">(x - x̄)(y - ȳ)</th>
                                <th class="s-a756db">(x - x̄)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deviationRows}
                            <tr class="s-767496">
                                <td class="s-c1430c" colspan="5">SUM →</td>
                                <td class="s-ec616e">${numerator.toFixed(4)}</td>
                                <td class="s-ec616e">${denominator.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="s-6fab3a gen-pad">
                <h3 class="s-6efabd">Step 1.3: Calculate Slope (β̂₁) and Intercept (β̂₀)</h3>
                
                <div class="s-71ba82">
                    <strong>📐 Formula for Slope (β̂₁):</strong><br>
                    β̂₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²<br><br>
                    β̂₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                    <strong class="s-bbce95">β̂₁ = ${slope.toFixed(8)}</strong>
                </div>
                
                <div class="s-ee59d6">
                    <strong>📐 Formula for Intercept (β̂₀):</strong><br>
                    β̂₀ = ȳ - β̂₁·x̄<br><br>
                    β̂₀ = ${meanY.toFixed(4)} - (${slope.toFixed(4)} × ${meanX.toFixed(4)})<br>
                    β̂₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)}<br>
                    <strong class="s-bbce95">β̂₀ = ${intercept.toFixed(8)}</strong>
                </div>
                
                <div class="s-6d6368">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- ========== PART 2: CALCULATE STANDARD ERRORS ========== -->
        <div class="s-95d04a gen-pad">
            <h2 class="s-2ce3ad">📐 PART 2: Calculate Standard Errors</h2>
            
            <div class="s-2a0883 gen-pad">
                <h3 class="s-6efabd">Step 2.1: Calculate Predictions and Residuals</h3>
                <div class="s-01a9b9">
                    <table class="s-306b2c gen-sized">
                        <thead>
                            <tr class="s-e7b83b">
                                <th class="s-a756db">i</th>
                                <th class="s-a756db">x</th>
                                <th class="s-a756db">y</th>
                                <th class="s-a756db">ŷ = β̂₀ + β̂₁·x</th>
                                <th class="s-a756db">e = y - ŷ</th>
                                <th class="s-a756db">e²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${predictionsRows}
                            <tr class="s-767496">
                                <td class="s-c1430c" colspan="5">SS<sub>res</sub> = Σe² →</td>
                                <td class="s-ec616e">${ssRes.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="s-2a0883 gen-pad">
                <h3 class="s-6efabd">Step 2.2: Calculate Mean Squared Error (MSE)</h3>
                <div class="s-ee59d6">
                    <strong>Formula:</strong> MSE = SS<sub>res</sub> / (n - 2)<br>
                    MSE = ${ssRes.toFixed(4)} / ${n-2}<br>
                    <strong class="s-f342b5">MSE = ${mse.toFixed(8)}</strong>
                </div>
            </div>
            
            <div class="s-6fab3a gen-pad">
                <h3 class="s-6efabd">Step 2.3: Calculate Standard Errors</h3>
                
                <div class="s-71ba82">
                    <strong>📐 Standard Error of Slope [SE(β̂₁)]:</strong><br>
                    SE(β̂₁) = √[MSE / Σ(x - x̄)²]<br>
                    SE(β̂₁) = √[${mse.toFixed(6)} / ${denominator.toFixed(4)}]<br>
                    SE(β̂₁) = √${(mse/denominator).toFixed(6)}<br>
                    <strong class="s-f342b5">SE(β̂₁) = ${seSlope.toFixed(8)}</strong>
                </div>
                
                <div class="s-ee59d6">
                    <strong>📐 Standard Error of Intercept [SE(β̂₀)]:</strong><br>
                    SE(β̂₀) = √[MSE × (1/n + x̄²/Σ(x - x̄)²)]<br>
                    SE(β̂₀) = √[${mse.toFixed(6)} × (1/${n} + ${Math.pow(meanX,2).toFixed(4)}/${denominator.toFixed(4)})]<br>
                    SE(β̂₀) = √[${mse.toFixed(6)} × ${(1/n + Math.pow(meanX,2)/denominator).toFixed(6)}]<br>
                    <strong class="s-f342b5">SE(β̂₀) = ${seIntercept.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 3: CALCULATE T-STATISTICS ========== -->
        <div class="s-95d04a gen-pad">
            <h2 class="s-2ce3ad">📐 PART 3: Calculate t-Statistics</h2>
            
            <div class="s-41df42 gen-pad">
                <h3 class="s-6efabd">For Intercept (β̂₀):</h3>
                <div class="s-75b18d">
                    <strong>Formula:</strong> t = β̂₀ / SE(β̂₀)<br>
                    t = ${intercept.toFixed(6)} / ${seIntercept.toFixed(6)}<br>
                    <strong class="s-bbce95">t = ${tIntercept.toFixed(8)}</strong>
                </div>
                <div class="s-7fd1d1">
                    <strong>p-value = ${pIntercept.toFixed(6)}</strong><br>
                    ${pIntercept < 0.05 ? '✓ p < 0.05 → Statistically significant (reject H₀)' : '✗ p > 0.05 → Not statistically significant (fail to reject H₀)'}
                </div>
            </div>
            
            <div class="s-6fab3a gen-pad">
                <h3 class="s-6efabd">For Slope (β̂₁):</h3>
                <div class="s-75b18d">
                    <strong>Formula:</strong> t = β̂₁ / SE(β̂₁)<br>
                    t = ${slope.toFixed(6)} / ${seSlope.toFixed(6)}<br>
                    <strong class="s-bbce95">t = ${tSlope.toFixed(8)}</strong>
                </div>
                <div class="s-7fd1d1">
                    <strong>p-value = ${pSlope.toFixed(6)}</strong><br>
                    ${pSlope < 0.05 ? '✓ p < 0.05 → Statistically significant (reject H₀)' : '✗ p > 0.05 → Not statistically significant (fail to reject H₀)'}
                </div>
            </div>
        </div>
        
        <!-- ========== PART 4: RESULTS SUMMARY TABLE ========== -->
        <div class="s-5b0d25">
            <h3 class="s-ba9de1">📊 Summary: Regression Coefficients with t-Statistics</h3>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-bfd0ae">
                        <th class="s-d66e1c">Coefficient</th>
                        <th class="s-d66e1c">Estimate (β̂)</th>
                        <th class="s-d66e1c">Standard Error (SE)</th>
                        <th class="s-d66e1c">t-statistic</th>
                        <th class="s-d66e1c">p-value</th>
                        <th class="s-d66e1c">Significant at α=0.05?</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="s-b490b8">
                        <td class="s-8136fa">Intercept (β₀)</td>
                        <td class="s-02528c">${intercept.toFixed(6)}</td>
                        <td class="s-02528c">${seIntercept.toFixed(6)}</td>
                        <td class="s-21d431">${tIntercept.toFixed(6)}</td>
                        <td class="s-02528c">${pIntercept.toFixed(6)}</td>
                        <td style="text-align: center; ${Math.abs(tIntercept) > criticalT ? 'color: #28a745; font-weight: bold;' : 'color: #dc3545;'}">
                            ${Math.abs(tIntercept) > criticalT ? '✓ Yes' : '✗ No'}
                        </td>
                    </tr>
                    <tr>
                        <td class="s-8136fa">Slope (β₁)</td>
                        <td class="s-02528c">${slope.toFixed(6)}</td>
                        <td class="s-02528c">${seSlope.toFixed(6)}</td>
                        <td class="s-21d431">${tSlope.toFixed(6)}</td>
                        <td class="s-02528c">${pSlope.toFixed(6)}</td>
                        <td style="text-align: center; ${Math.abs(tSlope) > criticalT ? 'color: #28a745; font-weight: bold;' : 'color: #dc3545;'}">
                            ${Math.abs(tSlope) > criticalT ? '✓ Yes' : '✗ No'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- ========== PART 5: CONCLUSION ========== -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(tSlope) > criticalT ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 class="s-c7f0b4">📌 Conclusion</h3>
            <p><strong>Null Hypothesis (H₀):</strong> β = 0 (The coefficient is not significantly different from zero)</p>
            <p><strong>Alternative Hypothesis (H₁):</strong> β ≠ 0 (The coefficient is significantly different from zero)</p>
            <p><strong>Decision Rule:</strong> Reject H₀ if |t| > ${criticalT.toFixed(4)}</p>
            
            <div class="s-ab6715">
                <strong>Intercept (β₀):</strong> |t| = ${Math.abs(tIntercept).toFixed(4)} ${Math.abs(tIntercept) > criticalT ? '>' : '<'} ${criticalT.toFixed(4)}<br>
                → ${Math.abs(tIntercept) > criticalT ? '✓ Reject H₀: The intercept is significantly different from zero' : '✗ Fail to reject H₀: The intercept is not significantly different from zero'}
            </div>
            <div class="s-f0f227">
                <strong>Slope (β₁):</strong> |t| = ${Math.abs(tSlope).toFixed(4)} ${Math.abs(tSlope) > criticalT ? '>' : '<'} ${criticalT.toFixed(4)}<br>
                → ${Math.abs(tSlope) > criticalT ? '✓ Reject H₀: The slope is significantly different from zero → X has a significant effect on Y' : '✗ Fail to reject H₀: The slope is not significantly different from zero → X does not predict Y'}
            </div>
        </div>
        
        <!-- ========== FORMULA REFERENCE ========== -->
        <div class="s-119ec7">
            <h4 class="s-bca61e">📖 Formula Reference</h4>
            <div class="s-1b0f6a">
                <strong>β̂₁ (Slope):</strong> Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²<br>
                <strong>β̂₀ (Intercept):</strong> ȳ - β̂₁·x̄<br>
                <strong>SE(β̂₁):</strong> √[MSE / Σ(xᵢ - x̄)²]<br>
                <strong>SE(β̂₀):</strong> √[MSE × (1/n + x̄²/Σ(xᵢ - x̄)²)]<br>
                <strong>t-statistic:</strong> β̂ / SE(β̂)<br>
                <strong>MSE:</strong> Σ(yᵢ - ŷᵢ)² / (n - 2)
            </div>
        </div>
    </div>`;
    
    return { tIntercept, tSlope, pIntercept, pSlope, df, criticalT, steps };
}

// ========== T-STATISTICS SETUP ==========
function setupTStatsLogic() {
    const computeBtn = document.getElementById("tstatsComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("tstatsXInput").value;
        const rawY = document.getElementById("tstatsYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("tstatsResultArea");
        const valueSpan = document.getElementById("tstatsValueDisplay");
        const stepsSpan = document.getElementById("tstatsStepsDisplay");
        
        const result = computeTStatsWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `t(β₀) = ${result.tIntercept.toFixed(6)} | t(β₁) = ${result.tSlope.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("tstatsClearBtn", ["tstatsXInput", "tstatsYInput"], "tstatsResultArea");
}
