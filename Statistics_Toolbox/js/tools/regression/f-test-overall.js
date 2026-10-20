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
        
        deviationRows += `<tr class="s-00049c">
            <td class="s-618bb3">${i+1}</td>
            <td class="s-618bb3">${xValues[i]}</td>
            <td class="s-618bb3">${yValues[i]}</td>
            <td class="s-618bb3">${xValues[i]} - ${meanX.toFixed(4)} = ${xDev.toFixed(4)}</td>
            <td class="s-618bb3">${yValues[i]} - ${meanY.toFixed(4)} = ${yDev.toFixed(4)}</td>
            <td class="s-618bb3">${xDev.toFixed(4)} × ${yDev.toFixed(4)} = ${(xDev * yDev).toFixed(4)}</td>
            <td class="s-618bb3">(${xDev.toFixed(4)})² = ${(xDev * xDev).toFixed(4)}</td>
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
        
        predictionsRows += `<tr class="s-00049c">
            <td class="s-618bb3">${i+1}</td>
            <td class="s-618bb3">${xValues[i]}</td>
            <td class="s-618bb3">${yValues[i]}</td>
            <td class="s-d9b386">${intercept.toFixed(4)} + ${slope.toFixed(4)}×${xValues[i]} = ${yPred.toFixed(4)}</td>
            <td class="s-618bb3">${yPred.toFixed(4)} - ${meanY.toFixed(4)} = ${regDev.toFixed(4)}</td>
            <td class="s-618bb3">(${regDev.toFixed(4)})² = ${regContribution.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; ${resDev >= 0 ? 'color: #1a6f2e;' : 'color: #b02a37;'}">${resDev.toFixed(4)}</td>
            <td class="s-618bb3">(${resDev.toFixed(4)})² = ${resContribution.toFixed(4)}</td>
            <td class="s-618bb3">${yValues[i]} - ${meanY.toFixed(4)} = ${totDev.toFixed(4)}</td>
            <td class="s-618bb3">(${totDev.toFixed(4)})² = ${totContribution.toFixed(4)}</td>
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
    if (isPerfectFit(ssRes, ssTot)) {
        return { error: true, message: PERFECT_FIT_MESSAGE };
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
    // One decision rule, used for the verdict AND the displayed comparison: reject when p < alpha. (Comparing F with a
    // separately computed critical value could disagree with the p-value in the far tail or right at the boundary.)
    const rejectH0 = pValue < alpha;
    
    // ========== Build complete HTML with all detailed steps ==========
    let steps = `<div class="s-9217e5">
        
        <!-- HEADER -->
        <div class="s-954e6d gen-pad">
            <h1 class="s-b82e54">F-Test for Overall Model Significance</h1>
            <p class="s-cf6932">F = (SS<sub>reg</sub> / k) / (SS<sub>res</sub> / (n - k - 1))</p>
            <p class="s-b5eb65">H₀: β₁ = 0 (Model explains no variance) | H₁: β₁ ≠ 0 (Model is useful)</p>
        </div>
        
        <!-- ========== PART 1: CALCULATE REGRESSION COEFFICIENTS ========== -->
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
                    <table class="s-776a1d gen-sized">
                        <thead>
                            <tr class="s-e7b83b">
                                <th class="s-939795">i</th>
                                <th class="s-939795">x</th>
                                <th class="s-939795">y</th>
                                <th class="s-939795">x - x̄</th>
                                <th class="s-939795">y - ȳ</th>
                                <th class="s-939795">(x - x̄)(y - ȳ)</th>
                                <th class="s-939795">(x - x̄)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deviationRows}
                            <tr class="s-767496">
                                <td class="s-ebe99d" colspan="5">SUM →</td>
                                <td class="s-8cdb56">${numerator.toFixed(4)}</td>
                                <td class="s-8cdb56">${denominator.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="s-6fab3a gen-pad">
                <h3 class="s-6efabd">Step 1.3: Calculate Slope and Intercept</h3>
                
                <div class="s-71ba82">
                    <strong>📐 Slope (β̂₁) = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²</strong><br>
                    β̂₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                    <strong class="s-f342b5">β̂₁ = ${slope.toFixed(8)}</strong>
                </div>
                
                <div class="s-ee59d6">
                    <strong>📐 Intercept (β̂₀) = ȳ - β̂₁·x̄</strong><br>
                    β̂₀ = ${meanY.toFixed(4)} - (${slope.toFixed(4)} × ${meanX.toFixed(4)})<br>
                    β̂₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)}<br>
                    <strong class="s-f342b5">β̂₀ = ${intercept.toFixed(8)}</strong>
                </div>
                
                <div class="s-6d6368">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- ========== PART 2: ANOVA DECOMPOSITION (ŷ, SSreg, SSres, SStot) ========== -->
        <div class="s-95d04a gen-pad">
            <h2 class="s-2ce3ad">📐 PART 2: ANOVA Decomposition</h2>
            
            <div class="s-2a0883 gen-pad">
                <h3 class="s-6efabd">Step 2.1: Calculate Predicted Values (ŷ), Residuals, and Sums of Squares</h3>
                <div class="s-01a9b9">
                    <table class="s-1d014b gen-sized">
                        <thead>
                            <tr class="s-e7b83b">
                                <th class="s-939795" rowspan="2">i</th>
                                <th class="s-939795" rowspan="2">x</th>
                                <th class="s-939795" rowspan="2">y</th>
                                <th class="s-939795" rowspan="2">ŷ = β₀ + β₁·x</th>
                                <th class="s-939795" colspan="2">Explained (ŷ - ȳ)</th>
                                <th class="s-939795" colspan="2">Residual (y - ŷ)</th>
                                <th class="s-939795" colspan="2">Total (y - ȳ)</th>
                            </tr>
                            <tr class="s-e7b83b">
                                <th class="s-939795">Deviation</th>
                                <th class="s-939795">(Deviation)²</th>
                                <th class="s-939795">Deviation</th>
                                <th class="s-939795">(Deviation)²</th>
                                <th class="s-939795">Deviation</th>
                                <th class="s-939795">(Deviation)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${predictionsRows}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="s-6fab3a gen-pad">
                <h3 class="s-6efabd">Step 2.2: Sum of Squares Summary</h3>
                <div class="s-97d0e6 gen-grid gen-grid-many">
                    <div class="s-380180">
                        <strong>SS<sub>reg</sub> (Explained)</strong><br>
                        = Σ(ŷ - ȳ)²<br>
                        = <strong class="s-f342b5">${ssReg.toFixed(6)}</strong>
                    </div>
                    <div class="s-380180">
                        <strong>SS<sub>res</sub> (Residual)</strong><br>
                        = Σ(y - ŷ)²<br>
                        = <strong class="s-c451e2">${ssRes.toFixed(6)}</strong>
                    </div>
                    <div class="s-380180">
                        <strong>SS<sub>tot</sub> (Total)</strong><br>
                        = Σ(y - ȳ)²<br>
                        = <strong class="s-f342b5">${ssTot.toFixed(6)}</strong>
                    </div>
                </div>
                
                <div class="s-6d6368">
                    <strong>Check: SS<sub>tot</sub> = SS<sub>reg</sub> + SS<sub>res</sub></strong><br>
                    ${ssTot.toFixed(4)} = ${ssReg.toFixed(4)} + ${ssRes.toFixed(4)} = ${(ssReg + ssRes).toFixed(4)} ✅
                </div>
            </div>
        </div>
        
        <!-- ========== PART 3: DEGREES OF FREEDOM ========== -->
        <div class="s-bfd155 gen-pad">
            <h2 class="s-2ce3ad">📐 PART 3: Degrees of Freedom</h2>
            
            <div class="s-97d0e6 gen-grid gen-grid-many">
                <div class="s-64b6dd">
                    <strong>df<sub>reg</sub> (Regression)</strong><br>
                    = k = number of predictors<br>
                    = <strong class="s-f342b5">${dfReg}</strong>
                </div>
                <div class="s-64b6dd">
                    <strong>df<sub>res</sub> (Residual)</strong><br>
                    = n - k - 1<br>
                    = ${n} - 1 - 1 = <strong class="s-f342b5">${dfRes}</strong>
                </div>
                <div class="s-64b6dd">
                    <strong>df<sub>tot</sub> (Total)</strong><br>
                    = n - 1<br>
                    = ${n} - 1 = <strong class="s-f342b5">${dfTot}</strong>
                </div>
            </div>
            
            <div class="s-656c80">
                <strong>Check: df<sub>tot</sub> = df<sub>reg</sub> + df<sub>res</sub></strong><br>
                ${dfTot} = ${dfReg} + ${dfRes} = ${dfReg + dfRes} ✅
            </div>
        </div>
        
        <!-- ========== PART 4: MEAN SQUARES ========== -->
        <div class="s-95d04a gen-pad">
            <h2 class="s-2ce3ad">📐 PART 4: Mean Squares</h2>
            
            <div class="s-87555e gen-grid">
                <div class="s-20865b gen-pad">
                    <strong>MS<sub>reg</sub> (Mean Square Regression)</strong><br>
                    = SS<sub>reg</sub> / df<sub>reg</sub><br>
                    = ${ssReg.toFixed(4)} / ${dfReg}<br>
                    = <strong class="s-f342b5">${msReg.toFixed(6)}</strong>
                </div>
                <div class="s-20865b gen-pad">
                    <strong>MS<sub>res</sub> (Mean Square Residual)</strong><br>
                    = SS<sub>res</sub> / df<sub>res</sub><br>
                    = ${ssRes.toFixed(4)} / ${dfRes}<br>
                    = <strong class="s-f342b5">${msRes.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 5: R² AND ADJUSTED R² ========== -->
        <div class="s-bfd155 gen-pad">
            <h2 class="s-2ce3ad">📐 PART 5: R² and Adjusted R²</h2>
            
            <div class="s-41df42 gen-pad">
                <strong>📐 R² (Coefficient of Determination)</strong><br>
                R² = SS<sub>reg</sub> / SS<sub>tot</sub><br>
                R² = ${ssReg.toFixed(4)} / ${ssTot.toFixed(4)}<br>
                <strong class="s-f342b5">R² = ${rSquared.toFixed(8)} (${(rSquared * 100).toFixed(2)}%)</strong><br>
                <span class="s-a2bbfd">→ ${(rSquared * 100).toFixed(1)}% of the variance in Y is explained by X</span>
            </div>
            
            <div class="s-6fab3a gen-pad">
                <strong>📐 Adjusted R² (Penalized for number of predictors)</strong><br>
                R²<sub>adj</sub> = 1 - (1 - R²) × (n - 1) / (n - k - 1)<br>
                R²<sub>adj</sub> = 1 - (1 - ${rSquared.toFixed(6)}) × (${n} - 1) / (${n} - 2)<br>
                R²<sub>adj</sub> = 1 - (${(1 - rSquared).toFixed(6)}) × ${(n-1)} / ${(n-2)}<br>
                R²<sub>adj</sub> = 1 - ${((1 - rSquared) * (n-1) / (n-2)).toFixed(6)}<br>
                <strong class="s-f342b5">R²<sub>adj</sub> = ${adjRSquared.toFixed(8)}</strong>
            </div>
        </div>
        
        <!-- ========== PART 6: F-STATISTIC CALCULATION ========== -->
        <div class="s-95d04a gen-pad">
            <h2 class="s-2ce3ad">📐 PART 6: F-Statistic Calculation</h2>
            
            <div class="s-6fab3a gen-pad">
                <div class="s-22da77 gen-pad">
                    <strong>F = MS<sub>reg</sub> / MS<sub>res</sub></strong><br>
                    F = ${msReg.toFixed(6)} / ${msRes.toFixed(6)}<br>
                    <strong class="s-6fccf1">F = ${fStatistic.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 7: ANOVA SUMMARY TABLE ========== -->
        <div class="s-5b0d25">
            <h3 class="s-ba9de1">📊 ANOVA Summary Table</h3>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-bfd0ae">
                        <th class="s-d66e1c">Source</th>
                        <th class="s-d66e1c">Sum of Squares (SS)</th>
                        <th class="s-d66e1c">df</th>
                        <th class="s-d66e1c">Mean Square (MS)</th>
                        <th class="s-d66e1c">F-statistic</th>
                        <th class="s-d66e1c">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="s-b490b8">
                        <td class="s-8136fa">Regression (Explained)</td>
                        <td class="s-02528c">${ssReg.toFixed(4)}</td>
                        <td class="s-02528c">${dfReg}</td>
                        <td class="s-02528c">${msReg.toFixed(4)}</td>
                        <td class="s-3baba2" rowspan="2">${fStatistic.toFixed(6)}</td>
                        <td class="s-02f22d" rowspan="2">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr class="s-b490b8">
                        <td class="s-8136fa">Residual (Error)</td>
                        <td class="s-02528c">${ssRes.toFixed(4)}</td>
                        <td class="s-02528c">${dfRes}</td>
                        <td class="s-02528c">${msRes.toFixed(4)}</td>
                    </tr>
                    <tr class="s-bfd0ae">
                        <td class="s-8136fa">Total</td>
                        <td class="s-02528c">${ssTot.toFixed(4)}</td>
                        <td class="s-02528c">${dfTot}</td>
                        <td class="s-02528c">—</td>
                        <td class="s-02528c">—</td>
                        <td class="s-02528c">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- ========== PART 8: CONCLUSION ========== -->
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Conclusion</h3>
            
            <div class="s-7aca59 gen-grid gen-grid-many">
                <div class="s-7de73c">
                    <strong>F-statistic:</strong><br>${fStatistic.toFixed(4)}
                </div>
                <div class="s-7de73c">
                    <strong>Critical F (α=${alpha}):</strong><br>${criticalValue.toFixed(4)}
                </div>
                <div class="s-7de73c">
                    <strong>p-value:</strong><br>${pValue.toFixed(8)}
                </div>
            </div>
            
            <div class="s-6a2df1">
                <strong>Null Hypothesis (H₀):</strong> β₁ = 0 (The model explains no variance)<br>
                <strong>Alternative Hypothesis (H₁):</strong> β₁ ≠ 0 (The model is useful)<br>
                <strong>Decision Rule:</strong> Reject H₀ if F > ${criticalValue.toFixed(4)}<br>
                <strong>Comparison:</strong> ${fStatistic.toFixed(4)} ${fStatistic > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)} (p = ${pValue.toFixed(6)} ${rejectH0 ? '<' : '≥'} α = ${alpha})<br><br>
                
                <strong class="s-b72ae1">Decision: ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}</strong><br><br>
                
                <strong>Interpretation:</strong> ${rejectH0 ? 
                    'The regression model is statistically significant. The independent variable (X) explains a significant portion of variance in the dependent variable (Y).' : 
                    'The regression model is NOT statistically significant. The independent variable (X) does not predict the dependent variable (Y).'}
            </div>
            
            <div class="s-bb8f69">
                💡 <strong>Practical Meaning:</strong> The F-test tells us whether our model is better than just using the mean of Y. 
                ${rejectH0 ? 
                    'Here, the model is useful and the X variable significantly predicts Y. The explained variance (SSreg) is large relative to the unexplained variance (SSres).' : 
                    'Here, the model does not provide a better fit than simply using the mean of Y. The explained variance is not significantly different from zero.'}
            </div>
        </div>
        
        <!-- ========== FORMULA REFERENCE ========== -->
        <div class="s-119ec7">
            <h4 class="s-bca61e">📖 Complete Formula Reference</h4>
            <div class="s-1b0f6a">
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
    
    return { fStatistic, dfReg, dfRes, pValue, criticalValue, rejectH0, rSquared, adjRSquared, steps, chart: { dist: 'f', df: dfReg, df2: dfRes, stat: fStatistic, alternative: 'greater', alpha: alpha, statLabel: 'F', critical: { lower: null, upper: criticalValue } } };
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
            hideAllStatCharts();
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `F = ${result.fStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("ftestOverallResultArea", result.chart);
            showFitCharts("ftestOverallResultArea", xValues, yValues, { xName: "x", yName: "y" });
        }
    });
    
    attachClearHandler("ftestOverallClearBtn", ["ftestOverallXInput", "ftestOverallYInput"], "ftestOverallResultArea");
}
