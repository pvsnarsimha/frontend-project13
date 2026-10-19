/* VIF: vif tool (render, compute, setup) */

// ========== VARIANCE INFLATION FACTOR (VIF) INTERFACE ==========
function renderVIFInterface() {
    return buildInterface({
        id: "statVIFInterface",
        title: "📊 Variance Inflation Factor (Multicollinearity)",
        formula: "📌 VIFⱼ = 1 / (1 - Rⱼ²)",
        desc: "<strong>What is VIF?</strong><br>\n                    Measures how much the variance of a regression coefficient is inflated due to multicollinearity.\n                    <br><br>\n                    <strong>Interpretation:</strong><br>\n                    • VIF = 1 → No correlation with other predictors<br>\n                    • 1 < VIF < 5 → Moderate correlation<br>\n                    • VIF ≥ 5 → High correlation (problematic)<br>\n                    • VIF ≥ 10 → Severe multicollinearity",
        inputs: [
            {
                label: "📋 Enter data (each column = one predictor variable, comma-separated):",
                textarea: {
                    id: "vifData",
                    rows: "6",
                    placeholder: "Example:&#10;2, 5, 7&#10;4, 3, 9&#10;5, 8, 6&#10;7, 6, 12&#10;9, 11, 10&#10;10, 9, 15&#10;12, 14, 13&#10;14, 12, 18"
                }
            },
            {
                hint: "Each row represents one observation. Columns are the predictor variables X1, X2, X3, ... (at least 2 columns, more rows than columns, and no constant or perfectly collinear column).",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "vifComputeBtn", text: "📊 Calculate VIF + Full Steps" },
        clear: { id: "vifClearBtn", text: "Clear" },
        result: {
            area: "vifResultArea",
            label: "🎯 VARIANCE INFLATION FACTOR RESULTS",
            value: "vifValueDisplay",
            steps: "vifStepsDisplay"
        }
    });
}

// ========== VIF COMPUTATION (PROFESSIONAL VERSION) ==========
// ========== VIF COMPUTATION (PROFESSIONAL VERSION WITH DETAILED R² CALCULATION) ==========
function computeVIF(dataMatrix) {
    if (!dataMatrix.length || dataMatrix[0].length < 2) {
        return { error: true, message: "Need at least 2 predictor variables for VIF calculation." };
    }
    
    const n = dataMatrix.length;
    const p = dataMatrix[0].length;
    if (n <= p) {
        return { error: true, message: `Need more observations than predictors for VIF (got ${n} rows and ${p} predictors).` };
    }
    for (let j = 0; j < p; j++) {
        const col = dataMatrix.map(row => row[j]);
        if (col.every(v => v === col[0])) {
            return { error: true, message: `Predictor X${j+1} is constant (zero variance), so its VIF is undefined. Remove it or enter data that varies.` };
        }
    }
    const vifs = [];
    const fmtVif = (x, d) => isFinite(x) ? x.toFixed(d) : '∞';   // perfect collinearity gives VIF = Infinity
    const detailedCalculations = []; // Store detailed R² calculations
    
    // Helper function for correlation
    function calcCorr(x, y) {
        if (!x.length || !y.length || x.length !== y.length) return 0;
        const len = x.length;
        const meanX = x.reduce((a, b) => a + b, 0) / len;
        const meanY = y.reduce((a, b) => a + b, 0) / len;
        let xySum = 0, xxSum = 0, yySum = 0;
        for (let i = 0; i < len; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            xySum += dx * dy;
            xxSum += dx * dx;
            yySum += dy * dy;
        }
        if (xxSum === 0 || yySum === 0) return NaN;
        return xySum / Math.sqrt(xxSum * yySum);
    }
    
    // Calculate correlation matrix
    const correlations = [];
    for (let i = 0; i < p; i++) {
        correlations[i] = [];
        for (let j = 0; j < p; j++) {
            const x = dataMatrix.map(row => row[i]);
            const y = dataMatrix.map(row => row[j]);
            correlations[i][j] = calcCorr(x, y);
        }
    }
    
    // Calculate VIF for each predictor with detailed R² calculation
    for (let j = 0; j < p; j++) {
        const dependent = dataMatrix.map(row => row[j]);
        const yMean = dependent.reduce((a, b) => a + b, 0) / n;
        
        let rSquared = 0;
        let calculationDetails = "";
        
        if (p === 2) {
            // Simple case: only one independent variable
            const otherIdx = j === 0 ? 1 : 0;
            const independent = dataMatrix.map(row => row[otherIdx]);
            const xMean = independent.reduce((a, b) => a + b, 0) / n;
            
            // Calculate regression coefficients
            let xySum = 0, xxSum = 0;
            let xyDetails = [];
            let xxDetails = [];
            
            for (let i = 0; i < n; i++) {
                const xDev = independent[i] - xMean;
                const yDev = dependent[i] - yMean;
                xySum += xDev * yDev;
                xxSum += xDev * xDev;
                xyDetails.push(`(${independent[i]} - ${xMean.toFixed(4)}) × (${dependent[i]} - ${yMean.toFixed(4)}) = ${xDev.toFixed(4)} × ${yDev.toFixed(4)} = ${(xDev * yDev).toFixed(4)}`);
                xxDetails.push(`(${independent[i]} - ${xMean.toFixed(4)})² = ${(xDev * xDev).toFixed(4)}`);
            }
            
            const beta = xySum / xxSum;
            const intercept = yMean - beta * xMean;
            
            // Calculate R²
            let ssRes = 0, ssTot = 0;
            let residualDetails = [];
            let totalDetails = [];
            
            for (let i = 0; i < n; i++) {
                const yPred = intercept + beta * independent[i];
                const residual = dependent[i] - yPred;
                const devTotal = dependent[i] - yMean;
                ssRes += residual * residual;
                ssTot += devTotal * devTotal;
                residualDetails.push(`ŷ = ${intercept.toFixed(4)} + ${beta.toFixed(4)}×${independent[i]} = ${yPred.toFixed(4)} → e = ${dependent[i]} - ${yPred.toFixed(4)} = ${residual.toFixed(4)} → e² = ${(residual * residual).toFixed(4)}`);
                totalDetails.push(`(${dependent[i]} - ${yMean.toFixed(4)})² = ${(devTotal * devTotal).toFixed(4)}`);
            }
            
            // Same routine as the multi-predictor path, so the two cannot drift; the walk-through above only explains it
            rSquared = olsRSquared(dependent, [independent]);
            
            calculationDetails = `
            <div style="margin-top: 15px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <strong>📐 Step-by-Step R² Calculation for X<sub>${j+1}</sub>:</strong><br><br>
                
                <strong>Step 1: Calculate means</strong><br>
                x̄ = ${xMean.toFixed(4)}, ȳ = ${yMean.toFixed(4)}<br><br>
                
                <strong>Step 2: Calculate covariance numerator Σ(x - x̄)(y - ȳ)</strong><br>
                ${xyDetails.join('<br>')}<br>
                <strong>Σ(x - x̄)(y - ȳ) = ${xySum.toFixed(4)}</strong><br><br>
                
                <strong>Step 3: Calculate Σ(x - x̄)²</strong><br>
                ${xxDetails.join('<br>')}<br>
                <strong>Σ(x - x̄)² = ${xxSum.toFixed(4)}</strong><br><br>
                
                <strong>Step 4: Calculate slope (β) and intercept</strong><br>
                β = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)² = ${xySum.toFixed(4)} / ${xxSum.toFixed(4)} = ${beta.toFixed(6)}<br>
                Intercept = ȳ - β·x̄ = ${yMean.toFixed(4)} - ${beta.toFixed(6)}×${xMean.toFixed(4)} = ${intercept.toFixed(6)}<br><br>
                
                <strong>Step 5: Calculate predictions and residuals</strong><br>
                ${residualDetails.join('<br>')}<br>
                <strong>SS<sub>res</sub> = Σe² = ${ssRes.toFixed(4)}</strong><br><br>
                
                <strong>Step 6: Calculate total sum of squares</strong><br>
                ${totalDetails.join('<br>')}<br>
                <strong>SS<sub>tot</sub> = Σ(y - ȳ)² = ${ssTot.toFixed(4)}</strong><br><br>
                
                <strong>Step 7: Calculate R²</strong><br>
                R² = 1 - SS<sub>res</sub>/SS<sub>tot</sub> = 1 - ${ssRes.toFixed(4)}/${ssTot.toFixed(4)} = ${rSquared.toFixed(6)}<br>
            </div>`;
            
        } else {
            // Multiple predictors: R² of the OLS regression of X_j on all the other predictors (with intercept)
            const others = [];
            for (let k = 0; k < p; k++) if (k !== j) others.push(dataMatrix.map(row => row[k]));
            rSquared = olsRSquared(dependent, others);
            
            calculationDetails = `
            <div style="margin-top: 15px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <strong>📐 R² Calculation for X<sub>${j+1}</sub>:</strong><br><br>
                
                <strong>Step 1: Regress X<sub>${j+1}</sub> on the other ${p - 1} predictors</strong><br>
                X<sub>${j+1}</sub> = b₀ + ${others.map((_, i) => `b${i + 1}·X<sub>${i < j ? i + 1 : i + 2}</sub>`).join(' + ')} (ordinary least squares, normal equations β = (XᵀX)⁻¹Xᵀy)<br><br>
                
                <strong>Step 2: R² = 1 - SS<sub>res</sub>/SS<sub>tot</sub></strong><br>
                R² = ${rSquared.toFixed(6)}<br>
            </div>`;
        }
        
        // Perfect collinearity (R² = 1) gives an infinite VIF
        const vif = rSquared >= 1 - 1e-12 ? Infinity : 1 / (1 - rSquared);
        
        let severity = "";
        let severityColor = "";
        let recommendation = "";
        if (vif < 5) { 
            severity = "Acceptable"; 
            severityColor = "#28a745"; 
            recommendation = "✓ No action needed"; 
        } else if (vif < 10) { 
            severity = "Moderate Concern"; 
            severityColor = "#ffc107"; 
            recommendation = "⚠️ Consider combining variables"; 
        } else { 
            severity = "Severe"; 
            severityColor = "#dc3545"; 
            recommendation = "❌ Remove or use regularization"; 
        }
        
        vifs.push({ 
            variable: j+1, 
            vif: vif, 
            rSquared: rSquared, 
            severity: severity, 
            severityColor: severityColor, 
            recommendation: recommendation,
            calculationDetails: calculationDetails
        });
    }
    
    // Build correlation matrix HTML
    let corrRows = '';
    for (let i = 0; i < p; i++) {
        corrRows += '<tr>';
        corrRows += `<th style="padding: 10px; background: #e8f4f8;">X<sub>${i+1}</sub></th>`;
        for (let j = 0; j < p; j++) {
            let bgColor = '';
            if (i !== j && Math.abs(correlations[i][j]) > 0.7) bgColor = 'background: #f8d7da;';
            else if (i !== j && Math.abs(correlations[i][j]) > 0.5) bgColor = 'background: #fff3cd;';
            corrRows += `<td style="padding: 10px; text-align: center; ${bgColor}">${correlations[i][j].toFixed(3)}</td>`;
        }
        corrRows += '</tr>';
    }
    
    // Build VIF results table with expandable R² details
    let vifRows = '';
    for (let v of vifs) {
        vifRows += `
        <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px; text-align: center; font-weight: 600;">X<sub>${v.variable}</sub></td>
            <td style="padding: 12px; text-align: center;">
                ${v.rSquared.toFixed(4)}
                <div style="font-size: 10px; margin-top: 4px;">
                    <details>
                        <summary style="cursor: pointer; color: #1a5490;">📐 Show R² Calculation</summary>
                        ${v.calculationDetails}
                    </details>
                </div>
            </td>
            <td style="padding: 12px; text-align: center; background: ${v.severityColor}20; font-weight: 700; font-size: 16px;">${fmtVif(v.vif, 4)}</td>
            <td style="padding: 12px; text-align: center; color: ${v.severityColor}; font-weight: 600;">${v.severity}</td>
            <td style="padding: 12px; text-align: center;">${v.recommendation}</td>
        </tr>`;
    }
    
    // Perfect collinearity gives VIF = Infinity; show ∞ and leave it out of the mean instead of printing "Infinity"
    const infiniteVifs = vifs.filter(v => !isFinite(v.vif)).length;
    const meanVifText = infiniteVifs ? `N/A (${infiniteVifs} predictor${infiniteVifs > 1 ? 's' : ''} with infinite VIF)` : (vifs.reduce((a, b) => a + b.vif, 0) / p).toFixed(2);
    
    // Build complete HTML
    let steps = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 100%;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #0d3b66 0%, #1a5490 100%); color: white; padding: 25px 30px; border-radius: 16px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div>
                    <h1 style="margin: 0; font-size: 28px;">📊 Variance Inflation Factor (VIF)</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Detecting Multicollinearity in Multiple Regression</p>
                </div>
                <div style="background: rgba(255,255,255,0.15); padding: 10px 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 11px;">Max VIF</div>
                    <div style="font-size: 32px; font-weight: 700;">${fmtVif(Math.max(...vifs.map(v => v.vif)), 2)}</div>
                </div>
            </div>
        </div>
        
        <!-- FORMULA SECTION -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #1a5490;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📐 Mathematical Formula</h3>
            <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-family: monospace; font-size: 22px; font-weight: 700; margin-bottom: 10px;">
                    VIF<sub>j</sub> = 1 / (1 - R<sub>j</sub>²)
                </div>
                <div style="font-family: monospace; font-size: 14px; color: #555; margin-top: 5px;">
                    where R<sub>j</sub>² = coefficient of determination from regressing X<sub>j</sub> on all other predictors
                </div>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 15px; border-radius: 8px;">
                <strong>📖 Step-by-Step VIF Calculation:</strong><br>
                1. <strong>Regress X<sub>j</sub></strong> against all other predictor variables<br>
                2. <strong>Calculate R<sub>j</sub>²</strong> (proportion of variance explained)<br>
                3. <strong>Apply formula:</strong> VIF<sub>j</sub> = 1 / (1 - R<sub>j</sub>²)<br><br>
                <strong>📊 Interpretation Thresholds:</strong><br>
                • <span style="color: #28a745;">VIF = 1</span> → No correlation with other predictors<br>
                • <span style="color: #ffc107;">1 < VIF < 5</span> → Moderate correlation<br>
                • <span style="color: #e65100;">VIF ≥ 5</span> → High correlation (problematic)<br>
                • <span style="color: #dc3545;">VIF ≥ 10</span> → Severe multicollinearity
            </div>
        </div>
        
        <!-- SUMMARY STATISTICS -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #666;">Observations (n)</div>
                <div style="font-size: 32px; font-weight: 700;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #666;">Predictors (k)</div>
                <div style="font-size: 32px; font-weight: 700;">${p}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #666;">Mean VIF</div>
                <div style="font-size: 24px; font-weight: 700;">${meanVifText}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #666;">Min VIF</div>
                <div style="font-size: 24px; font-weight: 700;">${fmtVif(Math.min(...vifs.map(v => v.vif)), 2)}</div>
            </div>
        </div>
        
        <!-- VIF RESULTS TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📊 Variance Inflation Factor Results</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Click "Show R² Calculation" to see detailed step-by-step derivation</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px; text-align: center;">Predictor</th>
                        <th style="padding: 12px; text-align: center;">R² (from regression)</th>
                        <th style="padding: 12px; text-align: center;">VIF = 1/(1-R²)</th>
                        <th style="padding: 12px; text-align: center;">Severity</th>
                        <th style="padding: 12px; text-align: center;">Recommendation</th>
                    </tr>
                </thead>
                <tbody>
                    ${vifRows}
                </tbody>
            </table>
        </div>
        
        <!-- CORRELATION MATRIX -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📈 Correlation Matrix (Between Predictors)</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Shows pairwise correlations used in R² calculation</p>
            </div>
            <div style="padding: 15px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: center;">
                    <thead>
                        <tr>
                            <th style="padding: 10px;"></th>
                            ${Array(p).fill().map((_, j) => `<th style="padding: 10px;">X<sub>${j+1}</sub></th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${corrRows}
                    </tbody>
                </table>
            </div>
            <div style="background: #f8f9fa; padding: 12px 20px; font-size: 12px;">
                <span style="background: #f8d7da; padding: 2px 8px; border-radius: 4px;">🔴 |r| > 0.7 (High correlation)</span>
                <span style="background: #fff3cd; padding: 2px 8px; border-radius: 4px; margin-left: 10px;">🟡 0.5 < |r| ≤ 0.7 (Moderate correlation)</span>
                <span style="background: white; padding: 2px 8px; border-radius: 4px; margin-left: 10px;">🟢 |r| ≤ 0.5 (Low correlation)</span>
            </div>
        </div>
        
        <!-- INTERPRETATION -->
        <div style="border-radius: 16px; padding: 20px; background: #e8f4f8; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📌 Interpretation & Recommendations</h3>
            
            <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <strong>🎯 What VIF Tells You:</strong>
                <ul style="margin-top: 10px; margin-bottom: 0;">
                    <li><strong>VIF = 1</strong> → Predictor is not correlated with others</li>
                    <li><strong>1 < VIF < 5</strong> → Moderate correlation, generally acceptable</li>
                    <li><strong>5 ≤ VIF < 10</strong> → High correlation, may cause issues</li>
                    <li><strong>VIF ≥ 10</strong> → Severe multicollinearity, must address</li>
                </ul>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 15px;">
                <strong>✅ Recommended Actions:</strong>
                <ul style="margin-top: 10px; margin-bottom: 0;">
                    <li>Remove one of the highly correlated predictors</li>
                    <li>Combine correlated predictors into a single composite variable</li>
                    <li>Use Ridge Regression or LASSO (regularization techniques)</li>
                    <li>Collect more data to reduce standard errors</li>
                </ul>
            </div>
        </div>
        
        <!-- DECISION SUMMARY -->
        <div style="border-radius: 16px; padding: 20px; ${Math.max(...vifs.map(v => v.vif)) >= 10 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : (Math.max(...vifs.map(v => v.vif)) >= 5 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #d4edda; border-left: 6px solid #28a745;')}">
            <h3 style="margin: 0 0 12px 0;">📊 Overall Assessment</h3>
            <p><strong>Maximum VIF:</strong> ${fmtVif(Math.max(...vifs.map(v => v.vif)), 4)}</p>
            <p><strong>Conclusion:</strong> ${Math.max(...vifs.map(v => v.vif)) >= 10 ? '❌ Severe multicollinearity detected. Model needs revision.' : (Math.max(...vifs.map(v => v.vif)) >= 5 ? '⚠️ Moderate multicollinearity detected. Consider addressing.' : '✅ No severe multicollinearity. Model is acceptable.')}</p>
        </div>
    </div>`;
    
    return { vifs, steps };
}

// ========== VIF SETUP FUNCTION (FIXED) ==========
function setupVIFLogic() {
    const computeBtn = document.getElementById("vifComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("vifData").value;
        const lines = raw.trim().split(/\r?\n/);
        let dataMatrix = [];
        
        for (let line of lines) {
            line = line.trim();
            if (line === "") continue;
            const values = parseNumbersFromInput(line);
            if (values.length > 0) {
                dataMatrix.push(values);
            }
        }
        
        const resultDiv = document.getElementById("vifResultArea");
        const valueSpan = document.getElementById("vifValueDisplay");
        const stepsSpan = document.getElementById("vifStepsDisplay");
        
        if (dataMatrix.length < 3) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data for at least 2 predictor variables.");  // ← innerHTML
            return;
        }
        
        const result = computeVIF(dataMatrix);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);  // ← innerHTML
        } else {
            const vifSummary = result.vifs.map(v => `X${v.variable}: ${v.vif.toFixed(2)}`).join(' | ');
            setHtml(valueSpan, vifSummary);
            setHtml(stepsSpan, result.steps);  // ← CRITICAL: use innerHTML not innerText
        }
    });
    
    attachClearHandler("vifClearBtn", "vifData", "vifResultArea");
}
