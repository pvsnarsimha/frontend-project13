/* CooksDistance: cooksdistance tool (render, compute, setup) */

// ========== COOK'S DISTANCE INTERFACE ==========
function renderCooksDistanceInterface() {
    return buildInterface({
        id: "statCooksDistanceInterface",
        title: "🔥 Cook's Distance (Influential Observations)",
        formula: "📌 Dᵢ = (ŷ - ŷ₍ᵢ₎)'(ŷ - ŷ₍ᵢ₎) / (p × MSE)",
        desc: "<strong>What is Cook's Distance?</strong><br>\n                    Measures how influential each observation is on the regression model.\n                    <br><br>\n                    <strong>Interpretation:</strong><br>\n                    • Dᵢ < 0.5 → Not influential<br>\n                    • 0.5 ≤ Dᵢ < 1 → Moderately influential (investigate)<br>\n                    • Dᵢ ≥ 1 → Highly influential (needs attention)",
        inputs: [
            {
                label: "📋 Enter X values (predictor):",
                textarea: { id: "cooksXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📋 Enter Y values (outcome):",
                labelAttrs: { style: FIELD_GAP },
                textarea: {
                    id: "cooksYInput",
                    rows: "3",
                    placeholder: "Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"
                }
            }
        ],
        run: { id: "cooksComputeBtn", text: "🔥 Calculate Cook's Distance + Full Steps" },
        clear: { id: "cooksClearBtn", text: "Clear All" },
        result: {
            area: "cooksResultArea",
            label: "🎯 COOK'S DISTANCE RESULTS",
            value: "cooksValueDisplay",
            steps: "cooksStepsDisplay"
        }
    });
}

// ========== COOK'S DISTANCE COMPUTATION (PROFESSIONAL VERSION WITH DETAILED CALCULATIONS) ==========
function computeCooksDistance(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: "X and Y must have the same number of values." };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
    }
    
    const n = xValues.length;
    const meanX = xValues.reduce((a,b) => a+b, 0) / n;
    const meanY = yValues.reduce((a,b) => a+b, 0) / n;
    
    // ========== DETAILED REGRESSION COEFFICIENT CALCULATION ==========
    let xySum = 0, xxSum = 0;
    let xyDetails = [];
    let xxDetails = [];
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        xySum += xDev * yDev;
        xxSum += xDev * xDev;
        xyDetails.push(`(${xValues[i]} - ${meanX.toFixed(4)}) × (${yValues[i]} - ${meanY.toFixed(4)}) = ${xDev.toFixed(4)} × ${yDev.toFixed(4)} = ${(xDev * yDev).toFixed(4)}`);
        xxDetails.push(`(${xValues[i]} - ${meanX.toFixed(4)})² = ${(xDev * xDev).toFixed(4)}`);
    }
    
    const slope = xySum / xxSum;
    const intercept = meanY - slope * meanX;
    const sxx = xxSum;
    
    // Calculate predictions, residuals, and leverage
    let predictions = [];
    let residuals = [];
    let ssRes = 0;
    let predictionDetails = [];
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        predictions.push(yPred);
        const residual = yValues[i] - yPred;
        residuals.push(residual);
        ssRes += residual * residual;
        predictionDetails.push(`ŷ${i+1} = ${intercept.toFixed(4)} + ${slope.toFixed(4)} × ${xValues[i]} = ${yPred.toFixed(4)} → e${i+1} = ${yValues[i]} - ${yPred.toFixed(4)} = ${residual.toFixed(4)} → e² = ${(residual * residual).toFixed(4)}`);
    }
    
    const mse = ssRes / (n - 2);
    
    // Calculate Cook's Distance for each observation with detailed leverage calculation
    let cookDetails = [];
    let leverageDetails = [];
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const xDevSq = xDev * xDev;
        const leverageTerm1 = 1/n;
        const leverageTerm2 = xDevSq / sxx;
        const hii = leverageTerm1 + leverageTerm2;
        
        leverageDetails.push(`
            <div style="margin-bottom: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                <strong>Observation ${i+1}:</strong><br>
                h<sub>ii</sub> = 1/${n} + (${xValues[i]} - ${meanX.toFixed(4)})² / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + (${xDev.toFixed(4)})² / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + ${xDevSq.toFixed(4)} / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + ${leverageTerm2.toFixed(6)}<br>
                = <strong style="color: #1a5490;">${hii.toFixed(6)}</strong>
            </div>
        `);
        
        // A leverage of 1 (the only observation at its x value) makes the denominator 0; a perfect fit makes MSE 0
        const D = mse < 1e-15 ? 0
            : (1 - hii) < 1e-12 ? Infinity
            : (residuals[i] * residuals[i]) / (2 * mse) * (hii / Math.pow(1 - hii, 2));
        
        let influence = "";
        let influenceColor = "";
        if (D < 0.5) { 
            influence = "Not Influential"; 
            influenceColor = "#28a745"; 
        } else if (D < 1) { 
            influence = "Moderately Influential"; 
            influenceColor = "#ffc107"; 
        } else { 
            influence = "Highly Influential"; 
            influenceColor = "#dc3545"; 
        }
        
        cookDetails.push({
            obs: i+1,
            x: xValues[i],
            y: yValues[i],
            yPred: predictions[i],
            residual: residuals[i],
            leverage: hii,
            cooksD: D,
            influence: influence,
            influenceColor: influenceColor
        });
    }
    
    const influentialCount = cookDetails.filter(d => d.cooksD >= 1).length;
    const moderateCount = cookDetails.filter(d => d.cooksD >= 0.5 && d.cooksD < 1).length;
    const sortedD = [...cookDetails].sort((a,b) => b.cooksD - a.cooksD);
    
    // Build table rows
    let tableRows = '';
    for (let d of cookDetails) {
        tableRows += `
        <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center; font-weight: 600;">${d.obs}</td>
            <td style="padding: 10px; text-align: center;">${d.x}</td>
            <td style="padding: 10px; text-align: center;">${d.y}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${d.yPred.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace; ${d.residual >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">${d.residual.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${d.leverage.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; background: ${d.influenceColor}20; font-weight: 700; font-family: monospace;">${d.cooksD.toFixed(6)}</td>
            <td style="padding: 10px; text-align: center; color: ${d.influenceColor}; font-weight: 600;">${d.influence}</td>
        </tr>`;
    }
    
    // Build complete HTML
    let steps = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 100%;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #d4380d 0%, #e65100 100%); color: white; padding: 25px 30px; border-radius: 16px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div>
                    <h1 style="margin: 0; font-size: 28px;">🔥 Cook's Distance</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Identifying Influential Observations in Regression Analysis</p>
                </div>
                <div style="background: rgba(255,255,255,0.15); padding: 10px 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 11px;">Influential Points</div>
                    <div style="font-size: 32px; font-weight: 700;">${influentialCount}</div>
                </div>
            </div>
        </div>
        
        <!-- FORMULA SECTION -->
        <div style="background: #fff3e0; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #e65100;">
            <h3 style="margin: 0 0 12px 0; color: #e65100;">📐 Mathematical Formula</h3>
            <div style="background: white; padding: 20px; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-family: monospace; font-size: 20px; font-weight: 700; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        D<sub>i</sub> = <span style="color: #dc3545;">e<sub>i</sub>²</span> / (2 × MSE) × <span style="color: #1a5490;">h<sub>ii</sub></span> / (1 - h<sub>ii</sub>)²
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0;">
                    <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-weight: 700; color: #dc3545;">e<sub>i</sub></div>
                        <div style="font-size: 12px;">Residual = y<sub>i</sub> - ŷ<sub>i</sub></div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-weight: 700;">MSE</div>
                        <div style="font-size: 12px;">Mean Squared Error = Σe<sub>i</sub>²/(n-2)</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-weight: 700; color: #1a5490;">h<sub>ii</sub></div>
                        <div style="font-size: 12px;">Leverage = 1/n + (x<sub>i</sub>-x̄)²/Σ(x-x̄)²</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 15px; background: #fff8f0; padding: 15px; border-radius: 8px;">
                <strong>📖 Step-by-Step Calculation Overview:</strong><br>
                1. Calculate regression coefficients (β₀, β₁)<br>
                2. Calculate residuals: e<sub>i</sub> = y<sub>i</sub> - ŷ<sub>i</sub><br>
                3. Calculate MSE = Σe<sub>i</sub>² / (n - 2)<br>
                4. Calculate leverage: h<sub>ii</sub> = 1/n + (x<sub>i</sub> - x̄)² / Σ(x - x̄)²<br>
                5. Apply formula: D<sub>i</sub> = [e<sub>i</sub>² / (2×MSE)] × [h<sub>ii</sub> / (1-h<sub>ii</sub>)²]<br><br>
                <strong>📊 Interpretation Thresholds:</strong><br>
                • <span style="color: #28a745;">D<sub>i</sub> < 0.5</span> → Not influential<br>
                • <span style="color: #ffc107;">0.5 ≤ D<sub>i</sub> < 1</span> → Moderately influential (investigate)<br>
                • <span style="color: #dc3545;">D<sub>i</sub> ≥ 1</span> → Highly influential (must address)
            </div>
        </div>
        
        <!-- STEP 1: REGRESSION COEFFICIENTS CALCULATION -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📈 Step 1: Calculate Regression Coefficients (β₀, β₁)</h3>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <strong>📐 Formula for Slope (β₁):</strong>
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin: 10px 0;">
                    β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²
                </div>
                
                <details>
                    <summary style="cursor: pointer; color: #1a5490; font-weight: 600;">📊 Click to see detailed Σ(x - x̄)(y - ȳ) calculation</summary>
                    <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 6px;">
                        ${xyDetails.join('<br>')}
                        <hr>
                        <strong>Σ(x - x̄)(y - ȳ) = ${xySum.toFixed(4)}</strong>
                    </div>
                </details>
                
                <details>
                    <summary style="cursor: pointer; color: #1a5490; font-weight: 600; margin-top: 10px;">📊 Click to see detailed Σ(x - x̄)² calculation</summary>
                    <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 6px;">
                        ${xxDetails.join('<br>')}
                        <hr>
                        <strong>Σ(x - x̄)² = ${xxSum.toFixed(4)}</strong>
                    </div>
                </details>
                
                <div style="margin-top: 15px; padding: 10px; background: #e8f4f8; border-radius: 6px;">
                    <strong>β₁ = ${xySum.toFixed(4)} / ${xxSum.toFixed(4)} = <span style="color: #dc3545; font-size: 18px;">${slope.toFixed(6)}</span></strong>
                </div>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px;">
                <strong>📐 Formula for Intercept (β₀):</strong>
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin: 10px 0;">
                    β₀ = ȳ - β₁·x̄
                </div>
                <div style="padding: 10px; background: #e8f4f8; border-radius: 6px;">
                    β₀ = ${meanY.toFixed(4)} - (${slope.toFixed(6)} × ${meanX.toFixed(4)})<br>
                    β₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)} = <span style="color: #dc3545; font-size: 18px;">${intercept.toFixed(6)}</span>
                </div>
            </div>
            
            <div style="margin-top: 15px; background: #d4edda; border-radius: 8px; padding: 12px; text-align: center; font-family: monospace; font-size: 16px;">
                <strong>Regression Equation: ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)} · x</strong>
            </div>
        </div>
        
        <!-- STEP 2: PREDICTIONS AND RESIDUALS -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 Step 2: Calculate Predictions (ŷ) and Residuals (e)</h3>
            
            <details>
                <summary style="cursor: pointer; color: #1a5490; font-weight: 600; margin-bottom: 10px;">📊 Click to see detailed prediction and residual calculations</summary>
                <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    ${predictionDetails.join('<br>')}
                    <hr>
                    <strong>SS<sub>res</sub> = Σe² = ${ssRes.toFixed(4)}</strong>
                </div>
            </details>
            
            <div style="margin-top: 15px; padding: 10px; background: #e8f4f8; border-radius: 6px;">
                <strong>MSE = SS<sub>res</sub> / (n - 2) = ${ssRes.toFixed(4)} / ${n-2} = <span style="color: #dc3545;">${mse.toFixed(6)}</span></strong>
            </div>
        </div>
        
        <!-- STEP 3: LEVERAGE CALCULATION -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">🔧 Step 3: Calculate Leverage Values (h<sub>ii</sub>)</h3>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin-bottom: 15px;">
                    <strong>h<sub>ii</sub> = 1/n + (xᵢ - x̄)² / Σ(x - x̄)²</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
                    <div><strong>n =</strong> ${n}</div>
                    <div><strong>x̄ =</strong> ${meanX.toFixed(4)}</div>
                    <div><strong>Σ(x - x̄)² =</strong> ${sxx.toFixed(4)}</div>
                    <div><strong>1/n =</strong> ${(1/n).toFixed(6)}</div>
                </div>
                
                <details>
                    <summary style="cursor: pointer; color: #1a5490; font-weight: 600;">📊 Click to see detailed leverage calculation for each observation</summary>
                    <div style="margin-top: 10px;">
                        ${leverageDetails.join('')}
                    </div>
                </details>
            </div>
            
            <div style="background: #e8f4f8; border-radius: 10px; padding: 12px;">
                <strong>📌 Leverage Statistics:</strong><br>
                • Average leverage = ${(2/n).toFixed(4)}<br>
                • Threshold (2×average) = ${(4/n).toFixed(4)}<br>
                • Maximum leverage = ${Math.max(...cookDetails.map(d => d.leverage)).toFixed(4)}<br>
                💡 Observations with leverage > ${(4/n).toFixed(4)} have high influence on the regression line.
            </div>
        </div>
        
        <!-- STEP 4: COOK'S DISTANCE TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #e65100; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📊 Step 4: Cook's Distance Calculations</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">D<sub>i</sub> = [e<sub>i</sub>² / (2×MSE)] × [h<sub>ii</sub> / (1-h<sub>ii</sub>)²]</p>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #e65100;">
                            <th style="padding: 10px;">Obs #</th>
                            <th style="padding: 10px;">X</th>
                            <th style="padding: 10px;">Y</th>
                            <th style="padding: 10px;">Ŷ (Predicted)</th>
                            <th style="padding: 10px;">Residual (e)</th>
                            <th style="padding: 10px;">Leverage (h)</th>
                            <th style="padding: 10px;">Cook's D</th>
                            <th style="padding: 10px;">Influence Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- INTERPRETATION SECTION -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 25px; ${influentialCount > 0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : (moderateCount > 0 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #d4edda; border-left: 6px solid #28a745;')}">
            <h3 style="margin: 0 0 15px 0;">📌 Step 5: Influence Assessment</h3>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px;">Total Observations</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px;">Highly Influential (D ≥ 1)</div>
                    <div style="font-size: 28px; font-weight: 700; color: #dc3545;">${influentialCount}</div>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px;">Moderately Influential (0.5 ≤ D < 1)</div>
                    <div style="font-size: 28px; font-weight: 700; color: #ffc107;">${moderateCount}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 15px;">
                <strong>🎯 Decision:</strong><br>
                ${influentialCount > 0 ? 
                    '❌ <strong>ACTION REQUIRED:</strong> One or more observations have Cook\'s Distance ≥ 1. These points strongly influence the regression model.' : 
                    (moderateCount > 0 ? 
                        '⚠️ <strong>CAUTION:</strong> Some observations have moderate influence (0.5 ≤ D < 1). Investigate these points.' : 
                        '✅ <strong>ACCEPTABLE:</strong> No highly influential observations detected. The regression model is stable.')}
                
                ${influentialCount > 0 ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                    <strong>🔧 Recommended Actions:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Investigate influential observations for data entry errors</li>
                        <li>Consider removing influential points and re-running analysis</li>
                        <li>Use robust regression methods (e.g., Huber, quantile regression)</li>
                        <li>Report results both with and without influential points</li>
                    </ul>
                </div>
                ` : (moderateCount > 0 ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                    <strong>🔧 Recommended Actions:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Examine moderately influential observations in detail</li>
                        <li>Verify data accuracy for these points</li>
                        <li>Consider sensitivity analysis (excluding these points)</li>
                    </ul>
                </div>
                ` : '')}
            </div>
        </div>
        
        <!-- TOP INFLUENTIAL POINTS -->
        <div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">⭐ Top 5 Most Influential Observations</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Rank</th>
                            <th style="padding: 10px;">Observation #</th>
                            <th style="padding: 10px;">Cook's D</th>
                            <th style="padding: 10px;">Influence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedD.slice(0, 5).map((d, idx) => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
                            <td style="padding: 8px; text-align: center;">${d.obs}</td>
                            <td style="padding: 8px; text-align: center; font-weight: 700; color: ${d.influenceColor};">${d.cooksD.toFixed(6)}</td>
                            <td style="padding: 8px; text-align: center; color: ${d.influenceColor};">${d.influence}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- SUMMARY STATISTICS -->
        <div style="margin-top: 20px; background: #e8f4f8; border-radius: 12px; padding: 15px; font-size: 12px;">
            <strong>📊 Cook's Distance Summary Statistics:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 8px;">
                <div>Min D = ${Math.min(...cookDetails.map(d => d.cooksD)).toFixed(6)}</div>
                <div>Max D = ${Math.max(...cookDetails.map(d => d.cooksD)).toFixed(6)}</div>
                <div>Mean D = ${(cookDetails.reduce((a,b) => a + b.cooksD, 0) / n).toFixed(6)}</div>
                <div>Median D = ${[...cookDetails].sort((a,b) => a.cooksD - b.cooksD)[Math.floor(n/2)].cooksD.toFixed(6)}</div>
            </div>
        </div>
        
        <!-- QUICK REFERENCE CARD -->
        <div style="margin-top: 15px; background: #e8f4f8; border-radius: 12px; padding: 15px; font-size: 12px;">
            <strong>📖 Quick Reference:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 8px;">
                <div>🟢 <strong>D < 0.5</strong> → Not influential</div>
                <div>🟡 <strong>0.5 ≤ D < 1</strong> → Moderately influential (investigate)</div>
                <div>🔴 <strong>D ≥ 1</strong> → Highly influential (must address)</div>
            </div>
        </div>
    </div>`;
    
    return { cooksDistances: cookDetails.map(d => d.cooksD), leverages: cookDetails.map(d => d.leverage), residuals, mse, steps, cookDetails };
}

// ========== COOK'S DISTANCE SETUP FUNCTION (FIXED) ==========
function setupCooksDistanceLogic() {
    const computeBtn = document.getElementById("cooksComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("cooksXInput").value;
        const rawY = document.getElementById("cooksYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("cooksResultArea");
        const valueSpan = document.getElementById("cooksValueDisplay");
        const stepsSpan = document.getElementById("cooksStepsDisplay");
        
        const result = computeCooksDistance(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);  // ← innerHTML
        } else {
            const influential = result.cooksDistances.filter(d => d >= 1).length;
            setHtml(valueSpan, `${influential} influential obs | Max D = ${Math.max(...result.cooksDistances).toFixed(4)}`);
            setHtml(stepsSpan, result.steps);  // ← CRITICAL: use innerHTML not innerText
        }
    });
    
    attachClearHandler("cooksClearBtn", ["cooksXInput", "cooksYInput"], "cooksResultArea");
}
