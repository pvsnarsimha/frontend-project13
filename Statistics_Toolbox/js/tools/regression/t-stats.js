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
    let deviationRows = '';
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
    
    // ========== STEP 2: Calculate β̂ coefficients ==========
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // ========== STEP 3: Build predictions and residuals table ==========
    let predictionsRows = '';
    let ssRes = 0;
    let residuals = [];
    let predictions = [];
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        predictions.push(yPred);
        residuals.push(residual);
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
    
    // ========== STEP 4: Calculate Standard Errors ==========
    const mse = ssRes / (n - 2);
    const seSlope = Math.sqrt(mse / denominator);
    const seIntercept = Math.sqrt(mse * (1/n + Math.pow(meanX, 2) / denominator));
    
    // ========== STEP 5: Calculate t-statistics ==========
    const tSlope = slope / seSlope;
    const tIntercept = intercept / seIntercept;
    
    const df = n - 2;
    const criticalT = tCriticalValue(0.025, df);
    const pSlope = 2 * (1 - tCDF(Math.abs(tSlope), df));
    const pIntercept = 2 * (1 - tCDF(Math.abs(tIntercept), df));
    
    // ========== Build complete HTML with all steps ==========
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">t-Statistics for Regression Coefficients</h1>
            <p style="margin: 0; opacity: 0.95;">t = β̂ / SE(β̂) | H₀: β = 0 | H₁: β ≠ 0</p>
            <p style="margin: 8px 0 0 0; font-size: 14px;">df = n - 2 = ${df} | Critical t (α=0.05, two-tailed) = ±${criticalT.toFixed(4)}</p>
        </div>
        
        <!-- ========== PART 1: CALCULATE β̂ (REGRESSION COEFFICIENTS) ========== -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 1: Calculate Regression Coefficients (β̂₀, β̂₁)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 1.1: Calculate Means</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>x̄ (Mean of X):</strong><br>
                        x̄ = Σx / n = ${sumX} / ${n} = <strong>${meanX.toFixed(6)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>ȳ (Mean of Y):</strong><br>
                        ȳ = Σy / n = ${sumY} / ${n} = <strong>${meanY.toFixed(6)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 1.2: Calculate Deviations and Cross-Products</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #1a5490; color: white;">
                                <th style="padding: 10px;">i</th>
                                <th style="padding: 10px;">x</th>
                                <th style="padding: 10px;">y</th>
                                <th style="padding: 10px;">x - x̄</th>
                                <th style="padding: 10px;">y - ȳ</th>
                                <th style="padding: 10px;">(x - x̄)(y - ȳ)</th>
                                <th style="padding: 10px;">(x - x̄)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deviationRows}
                            <tr style="background: #e9ecef; font-weight: 700;">
                                <td colspan="5" style="padding: 10px; text-align: right;">SUM →</td>
                                <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${numerator.toFixed(4)}</td>
                                <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${denominator.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Step 1.3: Calculate Slope (β̂₁) and Intercept (β̂₀)</h3>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📐 Formula for Slope (β̂₁):</strong><br>
                    β̂₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²<br><br>
                    β̂₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                    <strong style="color: #1a5490; font-size: 18px;">β̂₁ = ${slope.toFixed(8)}</strong>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>📐 Formula for Intercept (β̂₀):</strong><br>
                    β̂₀ = ȳ - β̂₁·x̄<br><br>
                    β̂₀ = ${meanY.toFixed(4)} - (${slope.toFixed(4)} × ${meanX.toFixed(4)})<br>
                    β̂₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)}<br>
                    <strong style="color: #1a5490; font-size: 18px;">β̂₀ = ${intercept.toFixed(8)}</strong>
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- ========== PART 2: CALCULATE STANDARD ERRORS ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 2: Calculate Standard Errors</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 2.1: Calculate Predictions and Residuals</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #1a5490; color: white;">
                                <th style="padding: 10px;">i</th>
                                <th style="padding: 10px;">x</th>
                                <th style="padding: 10px;">y</th>
                                <th style="padding: 10px;">ŷ = β̂₀ + β̂₁·x</th>
                                <th style="padding: 10px;">e = y - ŷ</th>
                                <th style="padding: 10px;">e²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${predictionsRows}
                            <tr style="background: #e9ecef; font-weight: 700;">
                                <td colspan="5" style="padding: 10px; text-align: right;">SS<sub>res</sub> = Σe² →</td>
                                <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${ssRes.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 2.2: Calculate Mean Squared Error (MSE)</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>Formula:</strong> MSE = SS<sub>res</sub> / (n - 2)<br>
                    MSE = ${ssRes.toFixed(4)} / ${n-2}<br>
                    <strong style="color: #1a5490;">MSE = ${mse.toFixed(8)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Step 2.3: Calculate Standard Errors</h3>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📐 Standard Error of Slope [SE(β̂₁)]:</strong><br>
                    SE(β̂₁) = √[MSE / Σ(x - x̄)²]<br>
                    SE(β̂₁) = √[${mse.toFixed(6)} / ${denominator.toFixed(4)}]<br>
                    SE(β̂₁) = √${(mse/denominator).toFixed(6)}<br>
                    <strong style="color: #1a5490;">SE(β̂₁) = ${seSlope.toFixed(8)}</strong>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>📐 Standard Error of Intercept [SE(β̂₀)]:</strong><br>
                    SE(β̂₀) = √[MSE × (1/n + x̄²/Σ(x - x̄)²)]<br>
                    SE(β̂₀) = √[${mse.toFixed(6)} × (1/${n} + ${Math.pow(meanX,2).toFixed(4)}/${denominator.toFixed(4)})]<br>
                    SE(β̂₀) = √[${mse.toFixed(6)} × ${(1/n + Math.pow(meanX,2)/denominator).toFixed(6)}]<br>
                    <strong style="color: #1a5490;">SE(β̂₀) = ${seIntercept.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 3: CALCULATE T-STATISTICS ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 3: Calculate t-Statistics</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <h3 style="color: #1a5490;">For Intercept (β̂₀):</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace;">
                    <strong>Formula:</strong> t = β̂₀ / SE(β̂₀)<br>
                    t = ${intercept.toFixed(6)} / ${seIntercept.toFixed(6)}<br>
                    <strong style="color: #1a5490; font-size: 18px;">t = ${tIntercept.toFixed(8)}</strong>
                </div>
                <div style="margin-top: 10px;">
                    <strong>p-value = ${pIntercept.toFixed(6)}</strong><br>
                    ${pIntercept < 0.05 ? '✓ p < 0.05 → Statistically significant (reject H₀)' : '✗ p > 0.05 → Not statistically significant (fail to reject H₀)'}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">For Slope (β̂₁):</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace;">
                    <strong>Formula:</strong> t = β̂₁ / SE(β̂₁)<br>
                    t = ${slope.toFixed(6)} / ${seSlope.toFixed(6)}<br>
                    <strong style="color: #1a5490; font-size: 18px;">t = ${tSlope.toFixed(8)}</strong>
                </div>
                <div style="margin-top: 10px;">
                    <strong>p-value = ${pSlope.toFixed(6)}</strong><br>
                    ${pSlope < 0.05 ? '✓ p < 0.05 → Statistically significant (reject H₀)' : '✗ p > 0.05 → Not statistically significant (fail to reject H₀)'}
                </div>
            </div>
        </div>
        
        <!-- ========== PART 4: RESULTS SUMMARY TABLE ========== -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; border: 2px solid #1a5490;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 Summary: Regression Coefficients with t-Statistics</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Coefficient</th>
                        <th style="padding: 12px;">Estimate (β̂)</th>
                        <th style="padding: 12px;">Standard Error (SE)</th>
                        <th style="padding: 12px;">t-statistic</th>
                        <th style="padding: 12px;">p-value</th>
                        <th style="padding: 12px;">Significant at α=0.05?</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Intercept (β₀)</td>
                        <td style="text-align: center;">${intercept.toFixed(6)}</td>
                        <td style="text-align: center;">${seIntercept.toFixed(6)}</td>
                        <td style="text-align: center; font-weight: 700; color: #1a5490;">${tIntercept.toFixed(6)}</td>
                        <td style="text-align: center;">${pIntercept.toFixed(6)}</td>
                        <td style="text-align: center; ${Math.abs(tIntercept) > criticalT ? 'color: #28a745; font-weight: bold;' : 'color: #dc3545;'}">
                            ${Math.abs(tIntercept) > criticalT ? '✓ Yes' : '✗ No'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Slope (β₁)</td>
                        <td style="text-align: center;">${slope.toFixed(6)}</td>
                        <td style="text-align: center;">${seSlope.toFixed(6)}</td>
                        <td style="text-align: center; font-weight: 700; color: #1a5490;">${tSlope.toFixed(6)}</td>
                        <td style="text-align: center;">${pSlope.toFixed(6)}</td>
                        <td style="text-align: center; ${Math.abs(tSlope) > criticalT ? 'color: #28a745; font-weight: bold;' : 'color: #dc3545;'}">
                            ${Math.abs(tSlope) > criticalT ? '✓ Yes' : '✗ No'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- ========== PART 5: CONCLUSION ========== -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(tSlope) > criticalT ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Conclusion</h3>
            <p><strong>Null Hypothesis (H₀):</strong> β = 0 (The coefficient is not significantly different from zero)</p>
            <p><strong>Alternative Hypothesis (H₁):</strong> β ≠ 0 (The coefficient is significantly different from zero)</p>
            <p><strong>Decision Rule:</strong> Reject H₀ if |t| > ${criticalT.toFixed(4)}</p>
            
            <div style="margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Intercept (β₀):</strong> |t| = ${Math.abs(tIntercept).toFixed(4)} ${Math.abs(tIntercept) > criticalT ? '>' : '<'} ${criticalT.toFixed(4)}<br>
                → ${Math.abs(tIntercept) > criticalT ? '✓ Reject H₀: The intercept is significantly different from zero' : '✗ Fail to reject H₀: The intercept is not significantly different from zero'}
            </div>
            <div style="margin-top: 10px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Slope (β₁):</strong> |t| = ${Math.abs(tSlope).toFixed(4)} ${Math.abs(tSlope) > criticalT ? '>' : '<'} ${criticalT.toFixed(4)}<br>
                → ${Math.abs(tSlope) > criticalT ? '✓ Reject H₀: The slope is significantly different from zero → X has a significant effect on Y' : '✗ Fail to reject H₀: The slope is not significantly different from zero → X does not predict Y'}
            </div>
        </div>
        
        <!-- ========== FORMULA REFERENCE ========== -->
        <div style="margin-top: 20px; background: #e8f4f8; border-radius: 12px; padding: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #1a5490;">📖 Formula Reference</h4>
            <div style="font-family: monospace; font-size: 12px;">
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
    
    const clearBtn = document.getElementById("tstatsClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("tstatsXInput").value = '';
            document.getElementById("tstatsYInput").value = '';
            document.getElementById("tstatsResultArea").style.display = 'none';
        });
    }
}
