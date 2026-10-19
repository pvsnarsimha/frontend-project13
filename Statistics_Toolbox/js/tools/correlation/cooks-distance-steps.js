// Worked-solution HTML for computeCooksDistance (split out of cooks-distance.js): receives the values the calculation produced.
function stepsHtmlCooksDistance(scope) {
    const { cookDetails, influentialCount, intercept, leverageDetails, meanX, meanY, moderateCount, mse, n, predictionDetails, slope, sortedD, ssRes, sxx, tableRows, xxDetails, xxSum, xyDetails, xySum } = scope;
    let steps = `
    <div class="s-c1f650">
        
        <!-- HEADER -->
        <div class="s-96937a gen-pad">
            <div class="s-def9b6 gen-flex">
                <div>
                    <h1 class="s-b31279">🔥 Cook's Distance</h1>
                    <p class="s-f50cbf">Identifying Influential Observations in Regression Analysis</p>
                </div>
                <div class="s-61f99d">
                    <div class="s-f6fd06">Influential Points</div>
                    <div class="s-595626 gen-big">${influentialCount}</div>
                </div>
            </div>
        </div>
        
        <!-- FORMULA SECTION -->
        <div class="s-0dcf5a gen-pad">
            <h3 class="s-5bd939">📐 Mathematical Formula</h3>
            <div class="s-1dffd8 gen-pad">
                <div class="s-d0078e">
                    <div class="s-565fdb">
                        D<sub>i</sub> = <span class="s-e03571">e<sub>i</sub>²</span> / (2 × MSE) × <span class="s-ece993">h<sub>ii</sub></span> / (1 - h<sub>ii</sub>)²
                    </div>
                </div>
                <div class="s-0237e3 gen-grid gen-grid-many">
                    <div class="s-27b252">
                        <div class="s-bd9333">e<sub>i</sub></div>
                        <div class="s-743ea5">Residual = y<sub>i</sub> - ŷ<sub>i</sub></div>
                    </div>
                    <div class="s-27b252">
                        <div class="s-f97f7f">MSE</div>
                        <div class="s-743ea5">Mean Squared Error = Σe<sub>i</sub>²/(n-2)</div>
                    </div>
                    <div class="s-27b252">
                        <div class="s-0a12f2">h<sub>ii</sub></div>
                        <div class="s-743ea5">Leverage = 1/n + (x<sub>i</sub>-x̄)²/Σ(x-x̄)²</div>
                    </div>
                </div>
            </div>
            <div class="s-77c0fb">
                <strong>📖 Step-by-Step Calculation Overview:</strong><br>
                1. Calculate regression coefficients (β₀, β₁)<br>
                2. Calculate residuals: e<sub>i</sub> = y<sub>i</sub> - ŷ<sub>i</sub><br>
                3. Calculate MSE = Σe<sub>i</sub>² / (n - 2)<br>
                4. Calculate leverage: h<sub>ii</sub> = 1/n + (x<sub>i</sub> - x̄)² / Σ(x - x̄)²<br>
                5. Apply formula: D<sub>i</sub> = [e<sub>i</sub>² / (2×MSE)] × [h<sub>ii</sub> / (1-h<sub>ii</sub>)²]<br><br>
                <strong>📊 Interpretation Thresholds:</strong><br>
                • <span class="s-689fb3">D<sub>i</sub> < 0.5</span> → Not influential<br>
                • <span class="s-54f524">0.5 ≤ D<sub>i</sub> < 1</span> → Moderately influential (investigate)<br>
                • <span class="s-e03571">D<sub>i</sub> ≥ 1</span> → Highly influential (must address)
            </div>
        </div>
        
        <!-- STEP 1: REGRESSION COEFFICIENTS CALCULATION -->
        <div class="s-ebcad9 gen-pad">
            <h3 class="s-8cbaeb">📈 Step 1: Calculate Regression Coefficients (β₀, β₁)</h3>
            
            <div class="s-b1c457">
                <strong>📐 Formula for Slope (β₁):</strong>
                <div class="s-2c850a">
                    β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²
                </div>
                
                <details>
                    <summary class="s-811976">📊 Click to see detailed Σ(x - x̄)(y - ȳ) calculation</summary>
                    <div class="s-adcc47">
                        ${xyDetails.join('<br>')}
                        <hr>
                        <strong>Σ(x - x̄)(y - ȳ) = ${xySum.toFixed(4)}</strong>
                    </div>
                </details>
                
                <details>
                    <summary class="s-8d84a7">📊 Click to see detailed Σ(x - x̄)² calculation</summary>
                    <div class="s-adcc47">
                        ${xxDetails.join('<br>')}
                        <hr>
                        <strong>Σ(x - x̄)² = ${xxSum.toFixed(4)}</strong>
                    </div>
                </details>
                
                <div class="s-ae13dd">
                    <strong>β₁ = ${xySum.toFixed(4)} / ${xxSum.toFixed(4)} = <span class="s-4cb8d3">${slope.toFixed(6)}</span></strong>
                </div>
            </div>
            
            <div class="s-cddfbe">
                <strong>📐 Formula for Intercept (β₀):</strong>
                <div class="s-2c850a">
                    β₀ = ȳ - β₁·x̄
                </div>
                <div class="s-8993d0">
                    β₀ = ${meanY.toFixed(4)} - (${slope.toFixed(6)} × ${meanX.toFixed(4)})<br>
                    β₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)} = <span class="s-4cb8d3">${intercept.toFixed(6)}</span>
                </div>
            </div>
            
            <div class="s-f07e36">
                <strong>Regression Equation: ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)} · x</strong>
            </div>
        </div>
        
        <!-- STEP 2: PREDICTIONS AND RESIDUALS -->
        <div class="s-ebcad9 gen-pad">
            <h3 class="s-8cbaeb">📊 Step 2: Calculate Predictions (ŷ) and Residuals (e)</h3>
            
            <details>
                <summary class="s-8e4404">📊 Click to see detailed prediction and residual calculations</summary>
                <div class="s-cb9830">
                    ${predictionDetails.join('<br>')}
                    <hr>
                    <strong>SS<sub>res</sub> = Σe² = ${ssRes.toFixed(4)}</strong>
                </div>
            </details>
            
            <div class="s-ae13dd">
                <strong>MSE = SS<sub>res</sub> / (n - 2) = ${ssRes.toFixed(4)} / ${n-2} = <span class="s-e03571">${mse.toFixed(6)}</span></strong>
            </div>
        </div>
        
        <!-- STEP 3: LEVERAGE CALCULATION -->
        <div class="s-ebcad9 gen-pad">
            <h3 class="s-8cbaeb">🔧 Step 3: Calculate Leverage Values (h<sub>ii</sub>)</h3>
            
            <div class="s-b1c457">
                <div class="s-7860e0">
                    <strong>h<sub>ii</sub> = 1/n + (xᵢ - x̄)² / Σ(x - x̄)²</strong>
                </div>
                
                <div class="s-52b92e gen-grid">
                    <div><strong>n =</strong> ${n}</div>
                    <div><strong>x̄ =</strong> ${meanX.toFixed(4)}</div>
                    <div><strong>Σ(x - x̄)² =</strong> ${sxx.toFixed(4)}</div>
                    <div><strong>1/n =</strong> ${(1/n).toFixed(6)}</div>
                </div>
                
                <details>
                    <summary class="s-811976">📊 Click to see detailed leverage calculation for each observation</summary>
                    <div class="s-bf36e2">
                        ${leverageDetails.join('')}
                    </div>
                </details>
            </div>
            
            <div class="s-9a5120">
                <strong>📌 Leverage Statistics:</strong><br>
                • Average leverage = ${(2/n).toFixed(4)}<br>
                • Threshold (2×average) = ${(4/n).toFixed(4)}<br>
                • Maximum leverage = ${Math.max(...cookDetails.map(d => d.leverage)).toFixed(4)}<br>
                💡 Observations with leverage > ${(4/n).toFixed(4)} have high influence on the regression line.
            </div>
        </div>
        
        <!-- STEP 4: COOK'S DISTANCE TABLE -->
        <div class="s-0b52ad">
            <div class="s-b047bc">
                <h3 class="s-c09e89">📊 Step 4: Cook's Distance Calculations</h3>
                <p class="s-b506d5">D<sub>i</sub> = [e<sub>i</sub>² / (2×MSE)] × [h<sub>ii</sub> / (1-h<sub>ii</sub>)²]</p>
            </div>
            <div class="s-74082b">
                <table class="s-54bb4c gen-sized">
                    <thead>
                        <tr class="s-85ccf4">
                            <th class="s-828f53">Obs #</th>
                            <th class="s-828f53">X</th>
                            <th class="s-828f53">Y</th>
                            <th class="s-828f53">Ŷ (Predicted)</th>
                            <th class="s-828f53">Residual (e)</th>
                            <th class="s-828f53">Leverage (h)</th>
                            <th class="s-828f53">Cook's D</th>
                            <th class="s-828f53">Influence Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- INTERPRETATION SECTION -->
        <div class="s-30a1a1 gen-pad ${influentialCount > 0 ? 'tp-bad-6' : (moderateCount > 0 ? 'tp-warn-6' : 'tp-ok-6')}">
            <h3 class="s-405429">📌 Step 5: Influence Assessment</h3>
            
            <div class="s-742bba gen-grid gen-grid-many">
                <div class="s-cae865">
                    <div class="s-f6fd06">Total Observations</div>
                    <div class="s-291d2a">${n}</div>
                </div>
                <div class="s-cae865">
                    <div class="s-f6fd06">Highly Influential (D ≥ 1)</div>
                    <div class="s-8743c8">${influentialCount}</div>
                </div>
                <div class="s-cae865">
                    <div class="s-f6fd06">Moderately Influential (0.5 ≤ D < 1)</div>
                    <div class="s-3ee5c8">${moderateCount}</div>
                </div>
            </div>
            
            <div class="s-524735">
                <strong>🎯 Decision:</strong><br>
                ${influentialCount > 0 ? 
                    '❌ <strong>ACTION REQUIRED:</strong> One or more observations have Cook\'s Distance ≥ 1. These points strongly influence the regression model.' : 
                    (moderateCount > 0 ? 
                        '⚠️ <strong>CAUTION:</strong> Some observations have moderate influence (0.5 ≤ D < 1). Investigate these points.' : 
                        '✅ <strong>ACCEPTABLE:</strong> No highly influential observations detected. The regression model is stable.')}
                
                ${influentialCount > 0 ? `
                <div class="s-cd967e">
                    <strong>🔧 Recommended Actions:</strong>
                    <ul class="s-ed7837">
                        <li>Investigate influential observations for data entry errors</li>
                        <li>Consider removing influential points and re-running analysis</li>
                        <li>Use robust regression methods (e.g., Huber, quantile regression)</li>
                        <li>Report results both with and without influential points</li>
                    </ul>
                </div>
                ` : (moderateCount > 0 ? `
                <div class="s-cd967e">
                    <strong>🔧 Recommended Actions:</strong>
                    <ul class="s-ed7837">
                        <li>Examine moderately influential observations in detail</li>
                        <li>Verify data accuracy for these points</li>
                        <li>Consider sensitivity analysis (excluding these points)</li>
                    </ul>
                </div>
                ` : '')}
            </div>
        </div>
        
        <!-- TOP INFLUENTIAL POINTS -->
        <div class="s-6524af gen-pad">
            <h3 class="s-8cbaeb">⭐ Top 5 Most Influential Observations</h3>
            <div class="s-74082b">
                <table class="s-523176 gen-sized">
                    <thead>
                        <tr class="s-0fb8dc">
                            <th class="s-828f53">Rank</th>
                            <th class="s-828f53">Observation #</th>
                            <th class="s-828f53">Cook's D</th>
                            <th class="s-828f53">Influence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedD.slice(0, 5).map((d, idx) => `
                        <tr class="s-0d2692">
                            <td class="s-182047">${idx + 1}</td>
                            <td class="s-182047">${d.obs}</td>
                            <td class="s-291e24 tp-infl-${d.influenceClass}">${d.cooksD.toFixed(6)}</td>
                            <td class="s-182047 tp-infl-${d.influenceClass}">${d.influence}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- SUMMARY STATISTICS -->
        <div class="s-ba1bb3">
            <strong>📊 Cook's Distance Summary Statistics:</strong>
            <div class="s-1d249f gen-flex">
                <div>Min D = ${Math.min(...cookDetails.map(d => d.cooksD)).toFixed(6)}</div>
                <div>Max D = ${Math.max(...cookDetails.map(d => d.cooksD)).toFixed(6)}</div>
                <div>Mean D = ${(cookDetails.reduce((a,b) => a + b.cooksD, 0) / n).toFixed(6)}</div>
                <div>Median D = ${[...cookDetails].sort((a,b) => a.cooksD - b.cooksD)[Math.floor(n/2)].cooksD.toFixed(6)}</div>
            </div>
        </div>
        
        <!-- QUICK REFERENCE CARD -->
        <div class="s-a790d4">
            <strong>📖 Quick Reference:</strong>
            <div class="s-1d249f gen-flex">
                <div>🟢 <strong>D < 0.5</strong> → Not influential</div>
                <div>🟡 <strong>0.5 ≤ D < 1</strong> → Moderately influential (investigate)</div>
                <div>🔴 <strong>D ≥ 1</strong> → Highly influential (must address)</div>
            </div>
        </div>
    </div>`;
    return steps;
}
