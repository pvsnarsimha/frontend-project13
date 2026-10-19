/* FTestOverall: ftestoverall tool (render, compute, setup) */

// ========== F-TEST FOR OVERALL SIGNIFICANCE INTERFACE ==========
function renderFTestOverallInterface() {
    return buildInterface({
        id: "statFTestOverallInterface",
        title: "F-Test for Overall Model Significance",
        formula: "📌 F = (SS<sub>reg</sub> / k) / (SS<sub>res</sub> / (n - k - 1))",
        desc: "<strong>What is the F-test?</strong><br>\n                    Tests whether the regression model explains a significant portion of variance.\n                    H₀: All coefficients = 0 (model is useless) | H₁: At least one coefficient ≠ 0 (model is useful)",
        inputs: [
            {
                label: "📋 Enter X values (independent variable):",
                textarea: { id: "ftestOverallXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📋 Enter Y values (dependent variable):",
                labelAttrs: { style: FIELD_GAP },
                textarea: {
                    id: "ftestOverallYInput",
                    rows: "3",
                    placeholder: "Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"
                }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "ftestOverallAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS
            }
        ],
        run: { id: "ftestOverallComputeBtn", text: "F Calculate F-Test + Full Steps" },
        clear: { id: "ftestOverallClearBtn", text: "Clear All" },
        result: {
            area: "ftestOverallResultArea",
            label: "🎯 F-TEST RESULTS",
            value: "ftestOverallValueDisplay",
            steps: "ftestOverallStepsDisplay"
        }
    });
}

// ========== F-TEST FOR OVERALL SIGNIFICANCE (COMPLETE WITH ALL DETAILS) ==========
function computeFTestOverallWithSteps(xValues, yValues, alpha) {
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
    const sumX = xValues.reduce((a,b) => a+b, 0);
    const sumY = yValues.reduce((a,b) => a+b, 0);
    
    // ========== STEP 1: Calculate β̂ coefficients ==========
    let numerator = 0, denominator = 0;
    let deviationRows = '';
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        numerator += xDev * yDev;
        denominator += xDev * xDev;
        
        deviationRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]} - ${meanX.toFixed(4)} = ${xDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]} - ${meanY.toFixed(4)} = ${yDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${xDev.toFixed(4)} × ${yDev.toFixed(4)} = ${(xDev * yDev).toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">(${xDev.toFixed(4)})² = ${(xDev * xDev).toFixed(4)}</td>
        </tr>`;
    }
    
    if (!(denominator > 0)) {
        return { error: true, message: "All X values are identical, so Σ(x - x̄)² = 0 and the slope is undefined. Enter X values that vary." };
    }
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // ========== STEP 2: Calculate ŷ (predictions) and residuals ==========
    let predictionsRows = '';
    let ssRes = 0;
    let ssReg = 0;
    let ssTot = 0;
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const regDev = yPred - meanY;      // Explained deviation
        const resDev = yValues[i] - yPred;  // Residual deviation
        const totDev = yValues[i] - meanY;  // Total deviation
        
        const regContribution = regDev * regDev;
        const resContribution = resDev * resDev;
        const totContribution = totDev * totDev;
        
        ssReg += regContribution;
        ssRes += resContribution;
        ssTot += totContribution;
        
        predictionsRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${intercept.toFixed(4)} + ${slope.toFixed(4)}×${xValues[i]} = ${yPred.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yPred.toFixed(4)} - ${meanY.toFixed(4)} = ${regDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">(${regDev.toFixed(4)})² = ${regContribution.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; ${resDev >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">${resDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">(${resDev.toFixed(4)})² = ${resContribution.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]} - ${meanY.toFixed(4)} = ${totDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">(${totDev.toFixed(4)})² = ${totContribution.toFixed(4)}</td>
        </tr>`;
    }
    
    // ========== STEP 3: Degrees of Freedom ==========
    const dfReg = 1;           // k = number of predictors
    const dfRes = n - 2;       // n - k - 1
    const dfTot = n - 1;       // n - 1
    
    // ========== STEP 4: Mean Squares ==========
    if (!isFinite(ssTot) || !isFinite(ssRes)) {
        return { error: true, message: "The values are too large to compute with (the sums of squares overflow). Rescale the data and try again." };
    }
    if (!(ssTot > 0)) {
        return { error: true, message: "All Y values are identical, so the total sum of squares is 0 and the F test is undefined. Enter Y values that vary." };
    }
    if (ssRes <= 1e-12 * ssTot) {
        return { error: true, message: "The line fits the data perfectly (residual sum of squares ≈ 0), so MSE = 0 and F is infinite. The F test needs some unexplained variation." };
    }
    
    const msReg = ssReg / dfReg;
    const msRes = ssRes / dfRes;
    
    // ========== STEP 5: F-statistic ==========
    const fStatistic = msReg / msRes;
    
    // ========== STEP 6: R² and Adjusted R² ==========
    const rSquared = ssReg / ssTot;
    const adjRSquared = 1 - (1 - rSquared) * (n - 1) / (n - 2);
    
    // ========== STEP 7: Critical value and p-value ==========
    const criticalValue = fCriticalValue(alpha, dfReg, dfRes);
    const pValue = 1 - fCDF(fStatistic, dfReg, dfRes);
    const rejectH0 = fStatistic > criticalValue;
    
    // ========== Build complete HTML with all detailed steps ==========
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">F-Test for Overall Model Significance</h1>
            <p style="margin: 0; opacity: 0.95;">F = (SS<sub>reg</sub> / k) / (SS<sub>res</sub> / (n - k - 1))</p>
            <p style="margin: 8px 0 0 0; font-size: 14px;">H₀: β₁ = 0 (Model explains no variance) | H₁: β₁ ≠ 0 (Model is useful)</p>
        </div>
        
        <!-- ========== PART 1: CALCULATE REGRESSION COEFFICIENTS ========== -->
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
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background: #1a5490; color: white;">
                                <th style="padding: 8px;">i</th>
                                <th style="padding: 8px;">x</th>
                                <th style="padding: 8px;">y</th>
                                <th style="padding: 8px;">x - x̄</th>
                                <th style="padding: 8px;">y - ȳ</th>
                                <th style="padding: 8px;">(x - x̄)(y - ȳ)</th>
                                <th style="padding: 8px;">(x - x̄)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deviationRows}
                            <tr style="background: #e9ecef; font-weight: 700;">
                                <td colspan="5" style="padding: 8px; text-align: right;">SUM →</td>
                                <td style="padding: 8px; text-align: center; background: #1a5490; color: white;">${numerator.toFixed(4)}</td>
                                <td style="padding: 8px; text-align: center; background: #1a5490; color: white;">${denominator.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Step 1.3: Calculate Slope and Intercept</h3>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📐 Slope (β̂₁) = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²</strong><br>
                    β̂₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                    <strong style="color: #1a5490;">β̂₁ = ${slope.toFixed(8)}</strong>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>📐 Intercept (β̂₀) = ȳ - β̂₁·x̄</strong><br>
                    β̂₀ = ${meanY.toFixed(4)} - (${slope.toFixed(4)} × ${meanX.toFixed(4)})<br>
                    β̂₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)}<br>
                    <strong style="color: #1a5490;">β̂₀ = ${intercept.toFixed(8)}</strong>
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- ========== PART 2: ANOVA DECOMPOSITION (ŷ, SSreg, SSres, SStot) ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 2: ANOVA Decomposition</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 2.1: Calculate Predicted Values (ŷ), Residuals, and Sums of Squares</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #1a5490; color: white;">
                                <th rowspan="2" style="padding: 8px;">i</th>
                                <th rowspan="2" style="padding: 8px;">x</th>
                                <th rowspan="2" style="padding: 8px;">y</th>
                                <th rowspan="2" style="padding: 8px;">ŷ = β₀ + β₁·x</th>
                                <th colspan="2" style="padding: 8px;">Explained (ŷ - ȳ)</th>
                                <th colspan="2" style="padding: 8px;">Residual (y - ŷ)</th>
                                <th colspan="2" style="padding: 8px;">Total (y - ȳ)</th>
                            </tr>
                            <tr style="background: #1a5490; color: white;">
                                <th style="padding: 8px;">Deviation</th>
                                <th style="padding: 8px;">(Deviation)²</th>
                                <th style="padding: 8px;">Deviation</th>
                                <th style="padding: 8px;">(Deviation)²</th>
                                <th style="padding: 8px;">Deviation</th>
                                <th style="padding: 8px;">(Deviation)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${predictionsRows}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Step 2.2: Sum of Squares Summary</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <strong>SS<sub>reg</sub> (Explained)</strong><br>
                        = Σ(ŷ - ȳ)²<br>
                        = <strong style="color: #1a5490;">${ssReg.toFixed(6)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <strong>SS<sub>res</sub> (Residual)</strong><br>
                        = Σ(y - ŷ)²<br>
                        = <strong style="color: #dc3545;">${ssRes.toFixed(6)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <strong>SS<sub>tot</sub> (Total)</strong><br>
                        = Σ(y - ȳ)²<br>
                        = <strong style="color: #1a5490;">${ssTot.toFixed(6)}</strong>
                    </div>
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">
                    <strong>Check: SS<sub>tot</sub> = SS<sub>reg</sub> + SS<sub>res</sub></strong><br>
                    ${ssTot.toFixed(4)} = ${ssReg.toFixed(4)} + ${ssRes.toFixed(4)} = ${(ssReg + ssRes).toFixed(4)} ✅
                </div>
            </div>
        </div>
        
        <!-- ========== PART 3: DEGREES OF FREEDOM ========== -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 3: Degrees of Freedom</h2>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                    <strong>df<sub>reg</sub> (Regression)</strong><br>
                    = k = number of predictors<br>
                    = <strong style="color: #1a5490;">${dfReg}</strong>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                    <strong>df<sub>res</sub> (Residual)</strong><br>
                    = n - k - 1<br>
                    = ${n} - 1 - 1 = <strong style="color: #1a5490;">${dfRes}</strong>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                    <strong>df<sub>tot</sub> (Total)</strong><br>
                    = n - 1<br>
                    = ${n} - 1 = <strong style="color: #1a5490;">${dfTot}</strong>
                </div>
            </div>
            
            <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                <strong>Check: df<sub>tot</sub> = df<sub>reg</sub> + df<sub>res</sub></strong><br>
                ${dfTot} = ${dfReg} + ${dfRes} = ${dfReg + dfRes} ✅
            </div>
        </div>
        
        <!-- ========== PART 4: MEAN SQUARES ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 4: Mean Squares</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; border-radius: 12px; padding: 20px; text-align: center;">
                    <strong>MS<sub>reg</sub> (Mean Square Regression)</strong><br>
                    = SS<sub>reg</sub> / df<sub>reg</sub><br>
                    = ${ssReg.toFixed(4)} / ${dfReg}<br>
                    = <strong style="color: #1a5490;">${msReg.toFixed(6)}</strong>
                </div>
                <div style="background: white; border-radius: 12px; padding: 20px; text-align: center;">
                    <strong>MS<sub>res</sub> (Mean Square Residual)</strong><br>
                    = SS<sub>res</sub> / df<sub>res</sub><br>
                    = ${ssRes.toFixed(4)} / ${dfRes}<br>
                    = <strong style="color: #1a5490;">${msRes.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 5: R² AND ADJUSTED R² ========== -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 5: R² and Adjusted R²</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <strong>📐 R² (Coefficient of Determination)</strong><br>
                R² = SS<sub>reg</sub> / SS<sub>tot</sub><br>
                R² = ${ssReg.toFixed(4)} / ${ssTot.toFixed(4)}<br>
                <strong style="color: #1a5490;">R² = ${rSquared.toFixed(8)} (${(rSquared * 100).toFixed(2)}%)</strong><br>
                <span style="font-size: 13px;">→ ${(rSquared * 100).toFixed(1)}% of the variance in Y is explained by X</span>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>📐 Adjusted R² (Penalized for number of predictors)</strong><br>
                R²<sub>adj</sub> = 1 - (1 - R²) × (n - 1) / (n - k - 1)<br>
                R²<sub>adj</sub> = 1 - (1 - ${rSquared.toFixed(6)}) × (${n} - 1) / (${n} - 2)<br>
                R²<sub>adj</sub> = 1 - (${(1 - rSquared).toFixed(6)}) × ${(n-1)} / ${(n-2)}<br>
                R²<sub>adj</sub> = 1 - ${((1 - rSquared) * (n-1) / (n-2)).toFixed(6)}<br>
                <strong style="color: #1a5490;">R²<sub>adj</sub> = ${adjRSquared.toFixed(8)}</strong>
            </div>
        </div>
        
        <!-- ========== PART 6: F-STATISTIC CALCULATION ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 6: F-Statistic Calculation</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <strong>F = MS<sub>reg</sub> / MS<sub>res</sub></strong><br>
                    F = ${msReg.toFixed(6)} / ${msRes.toFixed(6)}<br>
                    <strong style="color: #1a5490; font-size: 28px;">F = ${fStatistic.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 7: ANOVA SUMMARY TABLE ========== -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; border: 2px solid #1a5490;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 ANOVA Summary Table</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Source</th>
                        <th style="padding: 12px;">Sum of Squares (SS)</th>
                        <th style="padding: 12px;">df</th>
                        <th style="padding: 12px;">Mean Square (MS)</th>
                        <th style="padding: 12px;">F-statistic</th>
                        <th style="padding: 12px;">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Regression (Explained)</td>
                        <td style="text-align: center;">${ssReg.toFixed(4)}</td>
                        <td style="text-align: center;">${dfReg}</td>
                        <td style="text-align: center;">${msReg.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle; font-weight: 700; font-size: 20px; background: #e8f4f8;">${fStatistic.toFixed(6)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle;">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Residual (Error)</td>
                        <td style="text-align: center;">${ssRes.toFixed(4)}</td>
                        <td style="text-align: center;">${dfRes}</td>
                        <td style="text-align: center;">${msRes.toFixed(4)}</td>
                    </tr>
                    <tr style="background: #e9ecef;">
                        <td style="padding: 12px; font-weight: bold;">Total</td>
                        <td style="text-align: center;">${ssTot.toFixed(4)}</td>
                        <td style="text-align: center;">${dfTot}</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- ========== PART 8: CONCLUSION ========== -->
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Conclusion</h3>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
                <div style="background: white; border-radius: 8px; padding: 10px; text-align: center;">
                    <strong>F-statistic:</strong><br>${fStatistic.toFixed(4)}
                </div>
                <div style="background: white; border-radius: 8px; padding: 10px; text-align: center;">
                    <strong>Critical F (α=${alpha}):</strong><br>${criticalValue.toFixed(4)}
                </div>
                <div style="background: white; border-radius: 8px; padding: 10px; text-align: center;">
                    <strong>p-value:</strong><br>${pValue.toFixed(8)}
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 15px;">
                <strong>Null Hypothesis (H₀):</strong> β₁ = 0 (The model explains no variance)<br>
                <strong>Alternative Hypothesis (H₁):</strong> β₁ ≠ 0 (The model is useful)<br>
                <strong>Decision Rule:</strong> Reject H₀ if F > ${criticalValue.toFixed(4)}<br>
                <strong>Comparison:</strong> ${fStatistic.toFixed(4)} ${fStatistic > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)}<br><br>
                
                <strong style="font-size: 18px;">Decision: ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}</strong><br><br>
                
                <strong>Interpretation:</strong> ${rejectH0 ? 
                    'The regression model is statistically significant. The independent variable (X) explains a significant portion of variance in the dependent variable (Y).' : 
                    'The regression model is NOT statistically significant. The independent variable (X) does not predict the dependent variable (Y).'}
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Practical Meaning:</strong> The F-test tells us whether our model is better than just using the mean of Y. 
                ${rejectH0 ? 
                    'Here, the model is useful and the X variable significantly predicts Y. The explained variance (SSreg) is large relative to the unexplained variance (SSres).' : 
                    'Here, the model does not provide a better fit than simply using the mean of Y. The explained variance is not significantly different from zero.'}
            </div>
        </div>
        
        <!-- ========== FORMULA REFERENCE ========== -->
        <div style="margin-top: 20px; background: #e8f4f8; border-radius: 12px; padding: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #1a5490;">📖 Complete Formula Reference</h4>
            <div style="font-family: monospace; font-size: 12px;">
                <strong>ŷ (Predicted Value):</strong> ŷ = β̂₀ + β̂₁·x<br>
                <strong>SS<sub>reg</sub> (Explained):</strong> Σ(ŷ - ȳ)²<br>
                <strong>SS<sub>res</sub> (Residual):</strong> Σ(y - ŷ)²<br>
                <strong>SS<sub>tot</sub> (Total):</strong> Σ(y - ȳ)²<br>
                <strong>R²:</strong> SS<sub>reg</sub> / SS<sub>tot</sub><br>
                <strong>R²<sub>adj</sub>:</strong> 1 - (1 - R²)(n - 1)/(n - k - 1)<br>
                <strong>df<sub>reg</sub>:</strong> k (number of predictors)<br>
                <strong>df<sub>res</sub>:</strong> n - k - 1<br>
                <strong>MS<sub>reg</sub>:</strong> SS<sub>reg</sub> / df<sub>reg</sub><br>
                <strong>MS<sub>res</sub>:</strong> SS<sub>res</sub> / df<sub>res</sub><br>
                <strong>F-statistic:</strong> MS<sub>reg</sub> / MS<sub>res</sub>
            </div>
        </div>
    </div>`;
    
    return { fStatistic, dfReg, dfRes, pValue, criticalValue, rejectH0, rSquared, adjRSquared, steps };
}

// ========== F-TEST OVERALL SETUP ==========
function setupFTestOverallLogic() {
    const computeBtn = document.getElementById("ftestOverallComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("ftestOverallXInput").value;
        const rawY = document.getElementById("ftestOverallYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const alpha = parseFloat(document.getElementById("ftestOverallAlpha").value);
        const resultDiv = document.getElementById("ftestOverallResultArea");
        const valueSpan = document.getElementById("ftestOverallValueDisplay");
        const stepsSpan = document.getElementById("ftestOverallStepsDisplay");
        
        const result = computeFTestOverallWithSteps(xValues, yValues, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `F = ${result.fStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("ftestOverallClearBtn", ["ftestOverallXInput", "ftestOverallYInput"], "ftestOverallResultArea");
}
