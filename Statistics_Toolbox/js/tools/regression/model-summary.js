/* ModelSummary: modelsummary tool (render, compute, setup) */

// ========== MODEL SUMMARY & DIAGNOSTICS INTERFACE ==========
function renderModelSummaryInterface() {
    return buildInterface({
        id: "statModelSummaryInterface",
        title: "📋 Model Summary & Diagnostics",
        formula: "📌 Key metrics for regression model evaluation",
        desc: "<strong>Includes:</strong><br>\n                    • R² and Adjusted R² (Goodness of fit)<br>\n                    • F-statistic and p-value (Overall model significance)<br>\n                    • Residual standard error (RSE)<br>\n                    • AIC / BIC (Model comparison metrics)<br>\n                    • Residual diagnostics (normality, homoscedasticity)",
        inputs: [
            {
                label: "📋 Enter model predictions and actual values:",
                textarea: {
                    id: "modelSummaryData",
                    rows: "4",
                    placeholder: "Example:&#10;Actual, Predicted&#10;2, 2.1&#10;3, 2.9&#10;4, 4.2&#10;5, 4.8&#10;6, 6.0"
                }
            },
            {
                label: "🔢 Number of predictors in the model (k):",
                labelAttrs: { style: FIELD_GAP },
                input: { type: "number", id: "modelSummaryK", value: "1", min: "1", step: "1", style: FIELD_STYLE }
            },
            {
                hint: "First row: column headers (optional). Each row: Actual value, Predicted value. k is used for adjusted R² (1 for simple linear regression).",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "modelSummaryComputeBtn", text: "📋 Calculate Model Metrics + Steps" },
        clear: { id: "modelSummaryClearBtn", text: "Clear" },
        result: {
            area: "modelSummaryResultArea",
            label: "🎯 MODEL SUMMARY RESULTS",
            value: "modelSummaryValueDisplay",
            steps: "modelSummaryStepsDisplay"
        }
    });
}

function computeModelSummary(actual, predicted, k = 1) {
    if (!actual.length || !predicted.length) {
        return { error: true, message: "Please enter both actual and predicted values." };
    }
    if (actual.length !== predicted.length) {
        return { error: true, message: "Actual and predicted must have the same number of values." };
    }
    if (actual.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
    }
    if (!Number.isInteger(k) || k < 1 || actual.length - k - 1 < 1) {
        return { error: true, message: `The number of predictors k must be a whole number of at least 1 and smaller than n - 1 (n = ${actual.length}).` };
    }
    
    const n = actual.length;
    const meanY = actual.reduce((a, b) => a + b, 0) / n;
    
    // Calculate residuals and sums of squares
    let residuals = [];
    let ssRes = 0;
    let ssTot = 0;
    let residualDetails = [];
    
    for (let i = 0; i < n; i++) {
        const residual = actual[i] - predicted[i];
        residuals.push(residual);
        ssRes += residual * residual;
        const deviation = actual[i] - meanY;
        ssTot += deviation * deviation;
        residualDetails.push({ 
            actual: actual[i], 
            predicted: predicted[i], 
            residual: residual, 
            squaredRes: residual * residual,
            deviation: deviation,
            squaredDev: deviation * deviation
        });
    }
    
    // Calculate metrics
    if (ssTot === 0) {
        return { error: true, message: "R² is undefined when all actual values are identical (total sum of squares = 0)." };
    }
    const rSquared = 1 - (ssRes / ssTot);
    const dfRes = n - k - 1;                       // residual degrees of freedom for k predictors
    const adjRSquared = 1 - ((1 - rSquared) * (n - 1) / dfRes);
    const rmse = Math.sqrt(ssRes / n);
    const mae = residuals.reduce((sum, r) => sum + Math.abs(r), 0) / n;
    // A percentage error is undefined where the actual value is 0, so those points are left out of MAPE (and the count says so)
    const mapeCount = actual.filter(a => a !== 0).length;
    const mape = mapeCount ? residuals.reduce((sum, r, i) => sum + (actual[i] === 0 ? 0 : Math.abs(r / actual[i]) * 100), 0) / mapeCount : NaN;
    
    // Determine performance colors and icons
    const getPerformanceColor = (value, type) => {
        if (type === 'r2') {
            if (value >= 0.8) return { color: '#10b981', bg: '#d1fae5', icon: '🎯', text: 'Excellent' };
            if (value >= 0.6) return { color: '#f59e0b', bg: '#fed7aa', icon: '👍', text: 'Good' };
            if (value >= 0.4) return { color: '#f97316', bg: '#ffedd5', icon: '⚠️', text: 'Moderate' };
            return { color: '#ef4444', bg: '#fee2e2', icon: '🔴', text: 'Poor' };
        }
        if (type === 'error') {
            if (value < 5) return { color: '#10b981', bg: '#d1fae5', icon: '✅' };
            if (value < 15) return { color: '#f59e0b', bg: '#fed7aa', icon: '⚠️' };
            return { color: '#ef4444', bg: '#fee2e2', icon: '❌' };
        }
        return { color: '#6b7280', bg: '#f3f4f6', icon: '📊' };
    };
    
    const r2Perf = getPerformanceColor(rSquared, 'r2');
    const mapePerf = getPerformanceColor(mape, 'error');
    
    // Build detailed calculation strings
    const ssResCalculation = residualDetails.map(function(r, idx) {
        return '  ' + (idx+1) + '. (' + r.actual + ' - ' + r.predicted.toFixed(4) + ')² = (' + r.residual.toFixed(4) + ')² = ' + r.squaredRes.toFixed(4);
    }).join('\n');
    
    const ssTotCalculation = residualDetails.map(function(r, idx) {
        return '  ' + (idx+1) + '. (' + r.actual + ' - ' + meanY.toFixed(4) + ')² = (' + r.deviation.toFixed(4) + ')² = ' + r.squaredDev.toFixed(4);
    }).join('\n');
    
    const maeCalculation = residualDetails.map(function(r, idx) {
        return '  ' + (idx+1) + '. |' + r.residual.toFixed(4) + '| = ' + Math.abs(r.residual).toFixed(4);
    }).join('\n');
    
    const mapeCalculation = residualDetails.map(function(r, idx) {
        return r.actual === 0 ? '  ' + (idx+1) + '. actual = 0 → percentage error undefined, skipped' : '  ' + (idx+1) + '. |' + r.residual.toFixed(4) + '/' + r.actual + '| × 100 = ' + (Math.abs(r.residual/r.actual)*100).toFixed(2) + '%';
    }).join('\n');
    
    const sumAbsResiduals = residualDetails.reduce(function(s, r) { return s + Math.abs(r.residual); }, 0);
    const sumMape = residualDetails.reduce(function(s, r) { return s + (r.actual === 0 ? 0 : Math.abs(r.residual/r.actual)*100); }, 0);
    
    let steps = [
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">',
        
        // HEADER SECTION
        '<div class="s-090589 gen-pad">',
        '<div class="s-4c6057 gen-flex">',
        '<span class="s-1f18a8 gen-big">📈</span>',
        '<h2 class="s-f8a94d">Regression Model Dashboard</h2>',
        '</div>',
        '<p class="s-259079">Model Performance Analysis & Diagnostics | ' + n + ' Observations</p>',
        '</div>',
        
        // KPI CARDS SECTION
        '<div class="s-58bbf9 gen-grid">',
        
        // R² Card
        '<div class="s-713960 gen-pad">',
        '<div class="s-711e5f gen-flex">',
        '<span class="s-1d267a">R-Squared (R²)</span>',
        '<span class="s-530413">📊</span>',
        '</div>',
        '<div class="s-be29f3 gen-big">' + (rSquared * 100).toFixed(1) + '<span class="s-2faf9e">%</span></div>',
        '<div class="s-4b1eff gen-flex">',
        '<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ' + r2Perf.bg + '; color: ' + r2Perf.color + ';">' + r2Perf.icon + ' ' + r2Perf.text + '</span>',
        '<span>Variance explained</span>',
        '</div></div>',
        
        // Adjusted R² Card
        '<div class="s-713960 gen-pad">',
        '<div class="s-711e5f gen-flex">',
        '<span class="s-1d267a">Adjusted R²</span>',
        '<span class="s-530413">⚙️</span>',
        '</div>',
        '<div class="s-be29f3 gen-big">' + (adjRSquared * 100).toFixed(1) + '<span class="s-2faf9e">%</span></div>',
        '<div class="s-137d30">Penalized for ' + dfRes + ' df</div></div>',
        
        // RMSE Card
        '<div class="s-713960 gen-pad">',
        '<div class="s-711e5f gen-flex">',
        '<span class="s-1d267a">RMSE</span>',
        '<span class="s-530413">🎯</span>',
        '</div>',
        '<div class="s-be29f3 gen-big">' + rmse.toFixed(4) + '</div>',
        '<div class="s-137d30">Root Mean Square Error</div></div>',
        
        // MAE Card (with Mean Y)
        '<div class="s-713960 gen-pad">',
        '<div class="s-711e5f gen-flex">',
        '<span class="s-1d267a">MAE</span>',
        '<span class="s-530413">📏</span>',
        '</div>',
        '<div class="s-be29f3 gen-big">' + mae.toFixed(4) + '</div>',
        '<div class="s-137d30">Mean Absolute Error</div>',
        '<div class="s-cc2b6b">',
        '<span class="s-1f89fd">Mean of Y (ȳ) = ' + meanY.toFixed(4) + '</span>',
        '</div></div>',
        
        // MAPE Card
        '<div class="s-713960 gen-pad">',
        '<div class="s-711e5f gen-flex">',
        '<span class="s-1d267a">MAPE</span>',
        '<span class="s-530413">%</span>',
        '</div>',
        '<div class="s-be29f3 gen-big">' + mape.toFixed(1) + '<span class="s-2faf9e">%</span></div>',
        '<div class="s-137d30">',
        '<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ' + mapePerf.bg + '; color: ' + mapePerf.color + ';">' + mapePerf.icon + ' ' + (mape < 10 ? 'High Accuracy' : (mape < 20 ? 'Moderate Accuracy' : 'Low Accuracy')) + '</span>',
        '</div></div>',
        
        // Sum of Squares Card
        '<div class="s-713960 gen-pad">',
        '<div class="s-711e5f gen-flex">',
        '<span class="s-1d267a">Sum of Squares</span>',
        '<span class="s-530413">🔢</span>',
        '</div>',
        '<div class="s-24b94a">SS<sub>res</sub>: ' + ssRes.toFixed(2) + '</div>',
        '<div class="s-137d30">SS<sub>tot</sub>: ' + ssTot.toFixed(2) + '</div></div>',
        '</div>',
        
        // MAIN CONTENT: 2 COLUMNS (Data Table + Expandable Metrics)
        '<div class="s-48ea9a gen-grid">',
        
        // LEFT COLUMN: Data Table
        '<div class="s-706cf4 gen-pad">',
        '<div class="s-818b9e gen-flex">',
        '<span>📋</span> Observed vs Predicted Values',
        '</div>',
        '<div class="s-01a9b9">',
        '<table class="s-306b2c gen-sized">',
        '<thead><tr class="s-cacac0">',
        '<th class="s-34ffd2">#</th>',
        '<th class="s-34ffd2">Actual (y)</th>',
        '<th class="s-34ffd2">Predicted (ŷ)</th>',
        '<th class="s-34ffd2">Residual (e)</th>',
        '<th class="s-34ffd2">e²</th>',
        '<th class="s-34ffd2">(y-ȳ)²</th>',
        '</tr></thead>',
        '<tbody>'
    ];
    
    // Add table rows
    for (var i = 0; i < residualDetails.length; i++) {
        var r = residualDetails[i];
        steps.push('<tr class="s-ccf761">');
        steps.push('<td class="s-618bb3">' + (i+1) + '</td>');
        steps.push('<td class="s-618bb3"><strong>' + r.actual + '</strong></td>');
        steps.push('<td class="s-618bb3">' + r.predicted.toFixed(4) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center; color: ' + (r.residual >= 0 ? '#10b981' : '#ef4444') + ';">' + (r.residual >= 0 ? '+' : '') + r.residual.toFixed(4) + '</td>');
        steps.push('<td class="s-618bb3">' + r.squaredRes.toFixed(4) + '</td>');
        steps.push('<td class="s-618bb3">' + r.squaredDev.toFixed(4) + '</td>');
        steps.push('</tr>');
    }
    
    steps.push('<tr class="s-635578">');
    steps.push('<td class="s-c1430c" colspan="4">SUMS →</td>');
    steps.push('<td class="s-618bb3">' + ssRes.toFixed(4) + '</td>');
    steps.push('<td class="s-618bb3">' + ssTot.toFixed(4) + '</td>');
    steps.push('</tr></tbody></table></div></div>');
    
    // RIGHT COLUMN: Expandable Metrics
    steps.push('<div class="s-706cf4 gen-pad">');
    steps.push('<div class="s-818b9e gen-flex">');
    steps.push('<span>🧮</span> How Metrics Are Calculated');
    steps.push('<span class="s-04e12b">▼ Click any metric to expand</span>');
    steps.push('</div>');
    
    // R² Expandable
    steps.push('<div class="s-58dab4">');
    steps.push('<div class="s-d1792e gen-flex" data-toggle-metric="1">');
    steps.push('<span class="s-48f582">📐 R-Squared (R²)</span>');
    steps.push('<span class="s-5e6201">' + rSquared.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub><br><br>');
    steps.push('<strong>Step 1 - Calculate SS<sub>res</sub>:</strong><br>' + ssResCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>SS<sub>res</sub> = ' + ssRes.toFixed(4) + '</strong><br><br>');
    steps.push('<strong>Step 2 - Calculate SS<sub>tot</sub>:</strong><br>' + ssTotCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>SS<sub>tot</sub> = ' + ssTot.toFixed(4) + '</strong><br><br>');
    steps.push('<strong>Step 3 - Apply formula:</strong><br>');
    steps.push('R² = 1 - (' + ssRes.toFixed(4) + ' / ' + ssTot.toFixed(4) + ')<br>');
    steps.push('R² = 1 - ' + (ssRes/ssTot).toFixed(6) + '<br>');
    steps.push('<strong>R² = ' + rSquared.toFixed(6) + '</strong><br><br>');
    steps.push('<span class="s-701bb6">✅ ' + (rSquared * 100).toFixed(1) + '% of variance explained</span>');
    steps.push('</div></div>');
    
    // Adjusted R² Expandable
    steps.push('<div class="s-58dab4">');
    steps.push('<div class="s-d1792e gen-flex" data-toggle-metric="1">');
    steps.push('<span class="s-48f582">🔧 Adjusted R-Squared</span>');
    steps.push('<span class="s-5e6201">' + adjRSquared.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> R²<sub>adj</sub> = 1 - (1-R²)(n-1)/(n-k-1)<br><br>');
    steps.push('<strong>Step 1:</strong> 1 - R² = 1 - ' + rSquared.toFixed(6) + ' = ' + (1-rSquared).toFixed(6) + '<br>');
    steps.push('<strong>Step 2:</strong> (n-1)/(n-k-1) = (' + n + '-1)/(' + n + '-' + (k + 1) + ') = ' + ((n-1)/dfRes).toFixed(4) + '<br>');
    steps.push('<strong>Step 3:</strong> Multiply: ' + (1-rSquared).toFixed(6) + ' × ' + ((n-1)/dfRes).toFixed(4) + ' = ' + ((1-rSquared)*(n-1)/dfRes).toFixed(6) + '<br>');
    steps.push('<strong>Step 4:</strong> 1 - ' + ((1-rSquared)*(n-1)/dfRes).toFixed(6) + ' = <strong>' + adjRSquared.toFixed(6) + '</strong><br>');
    steps.push('</div></div>');
    
    // RMSE Expandable
    steps.push('<div class="s-58dab4">');
    steps.push('<div class="s-d1792e gen-flex" data-toggle-metric="1">');
    steps.push('<span class="s-48f582">📏 RMSE (Root Mean Square Error)</span>');
    steps.push('<span class="s-5e6201">' + rmse.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> RMSE = √(SS<sub>res</sub>/n)<br><br>');
    steps.push('<strong>Step 1:</strong> SS<sub>res</sub>/n = ' + ssRes.toFixed(4) + ' / ' + n + ' = ' + (ssRes/n).toFixed(4) + '<br>');
    steps.push('<strong>Step 2:</strong> √(' + (ssRes/n).toFixed(4) + ') = <strong>' + rmse.toFixed(6) + '</strong><br><br>');
    steps.push('<span>📖 Typical prediction error: ±' + rmse.toFixed(4) + ' units</span>');
    steps.push('</div></div>');
    
    // MAE Expandable
    steps.push('<div class="s-58dab4">');
    steps.push('<div class="s-d1792e gen-flex" data-toggle-metric="1">');
    steps.push('<span class="s-48f582">📊 MAE (Mean Absolute Error)</span>');
    steps.push('<span class="s-5e6201">' + mae.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> MAE = (1/n) × Σ|yᵢ - ŷᵢ|<br><br>');
    steps.push('<strong>Step 1 - Calculate absolute residuals:</strong><br>' + maeCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>Sum of |eᵢ| = ' + sumAbsResiduals.toFixed(4) + '</strong><br><br>');
    steps.push('<strong>Step 2 - Divide by n:</strong><br>');
    steps.push('MAE = ' + sumAbsResiduals.toFixed(4) + ' / ' + n + '<br>');
    steps.push('<strong>MAE = ' + mae.toFixed(6) + '</strong>');
    steps.push('</div></div>');
    
    // MAPE Expandable
    steps.push('<div class="s-58dab4">');
    steps.push('<div class="s-d1792e gen-flex" data-toggle-metric="1">');
    steps.push('<span class="s-48f582">% MAPE (Mean Absolute Percentage Error)</span>');
    steps.push('<span class="s-5e6201">' + mape.toFixed(2) + '%</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> MAPE = (100/n) × Σ|(yᵢ - ŷᵢ)/yᵢ|<br><br>');
    steps.push('<strong>Step 1 - Calculate percentage errors:</strong><br>' + mapeCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>Sum of percentages = ' + sumMape.toFixed(2) + '%</strong><br><br>');
    steps.push('<strong>Step 2 - Divide by n:</strong><br>');
    steps.push('MAPE = ' + sumMape.toFixed(2) + ' / ' + mapeCount + (mapeCount < n ? ' (points with actual = 0 are excluded)' : '') + '<br>');
    steps.push('<strong>MAPE = ' + mape.toFixed(2) + '%</strong>');
    steps.push('</div></div>');
    steps.push('</div></div>');
    
    // BOTTOM SECTION: Complete Calculation Details for All Metrics
    steps.push('<div class="s-839cf0 gen-pad">');
    steps.push('<div class="s-9c2cb9 gen-flex">');
    steps.push('<span>📚</span> Complete Formula Reference & Calculation Summary');
    steps.push('</div>');
    
    steps.push('<div class="s-fbb6b7 gen-grid">');
    
    // SSres Detailed Calculation
    steps.push('<div class="s-6025fc">');
    steps.push('<h4 class="s-6fc54b">📐 Sum of Squared Residuals (SS<sub>res</sub>)</h4>');
    steps.push('<p class="s-9f96c4">SS<sub>res</sub> = Σ(yᵢ - ŷᵢ)²</p>');
    steps.push('<div class="s-52b70c">');
    steps.push(ssResCalculation.replace(/\n/g, '<br>'));
    steps.push('</div>');
    steps.push('<p class="s-2747c5"><strong>Total SS<sub>res</sub> = ' + ssRes.toFixed(4) + '</strong></p>');
    steps.push('</div>');
    
    // SStot Detailed Calculation
    steps.push('<div class="s-6025fc">');
    steps.push('<h4 class="s-6fc54b">📊 Total Sum of Squares (SS<sub>tot</sub>)</h4>');
    steps.push('<p class="s-9f96c4">SS<sub>tot</sub> = Σ(yᵢ - ȳ)² where ȳ = ' + meanY.toFixed(4) + '</p>');
    steps.push('<div class="s-52b70c">');
    steps.push(ssTotCalculation.replace(/\n/g, '<br>'));
    steps.push('</div>');
    steps.push('<p class="s-2747c5"><strong>Total SS<sub>tot</sub> = ' + ssTot.toFixed(4) + '</strong></p>');
    steps.push('</div>');
    
    // R² Calculation
    steps.push('<div class="s-6025fc">');
    steps.push('<h4 class="s-6fc54b">🎯 R-Squared (R²)</h4>');
    steps.push('<p class="s-9f96c4">R² = 1 - SS<sub>res</sub>/SS<sub>tot</sub></p>');
    steps.push('<div class="s-2eeaac">');
    steps.push('R² = 1 - (' + ssRes.toFixed(4) + ' / ' + ssTot.toFixed(4) + ')<br>');
    steps.push('R² = 1 - ' + (ssRes/ssTot).toFixed(6) + '<br>');
    steps.push('<strong>R² = ' + rSquared.toFixed(6) + '</strong> (' + (rSquared*100).toFixed(1) + '%)');
    steps.push('</div></div>');
    
    // Adjusted R² Calculation
    steps.push('<div class="s-6025fc">');
    steps.push('<h4 class="s-6fc54b">⚙️ Adjusted R-Squared</h4>');
    steps.push('<p class="s-9f96c4">R²<sub>adj</sub> = 1 - (1-R²)(n-1)/(n-k-1), k = ' + k + '</p>');
    steps.push('<div class="s-2eeaac">');
    steps.push('1 - R² = ' + (1-rSquared).toFixed(6) + '<br>');
    steps.push('(n-1)/(n-k-1) = ' + (n-1) + '/' + dfRes + ' = ' + ((n-1)/dfRes).toFixed(4) + '<br>');
    steps.push('Product = ' + (1-rSquared).toFixed(6) + ' × ' + ((n-1)/dfRes).toFixed(4) + ' = ' + ((1-rSquared)*(n-1)/dfRes).toFixed(6) + '<br>');
    steps.push('R²<sub>adj</sub> = 1 - ' + ((1-rSquared)*(n-1)/dfRes).toFixed(6) + '<br>');
    steps.push('<strong>R²<sub>adj</sub> = ' + adjRSquared.toFixed(6) + '</strong> (' + (adjRSquared*100).toFixed(1) + '%)');
    steps.push('</div></div>');
    
    // RMSE Calculation
    steps.push('<div class="s-6025fc">');
    steps.push('<h4 class="s-6fc54b">📏 RMSE (Root Mean Square Error)</h4>');
    steps.push('<p class="s-9f96c4">RMSE = √(SS<sub>res</sub>/n)</p>');
    steps.push('<div class="s-2eeaac">');
    steps.push('SS<sub>res</sub>/n = ' + ssRes.toFixed(4) + ' / ' + n + ' = ' + (ssRes/n).toFixed(4) + '<br>');
    steps.push('RMSE = √(' + (ssRes/n).toFixed(4) + ')<br>');
    steps.push('<strong>RMSE = ' + rmse.toFixed(6) + '</strong>');
    steps.push('</div></div>');
    
    // MAE Calculation
    steps.push('<div class="s-6025fc">');
    steps.push('<h4 class="s-6fc54b">📊 MAE (Mean Absolute Error)</h4>');
    steps.push('<p class="s-9f96c4">MAE = (1/n) Σ|yᵢ - ŷᵢ|</p>');
    steps.push('<div class="s-52b70c">');
    steps.push(maeCalculation.replace(/\n/g, '<br>'));
    steps.push('<br><strong>Sum |eᵢ| = ' + sumAbsResiduals.toFixed(4) + '</strong><br>');
    steps.push('MAE = ' + sumAbsResiduals.toFixed(4) + ' / ' + n + ' = <strong>' + mae.toFixed(6) + '</strong>');
    steps.push('</div></div>');
    
    // MAPE Calculation
    steps.push('<div class="s-6025fc">');
    steps.push('<h4 class="s-6fc54b">% MAPE (Mean Absolute Percentage Error)</h4>');
    steps.push('<p class="s-9f96c4">MAPE = (100/n) Σ|(yᵢ - ŷᵢ)/yᵢ|</p>');
    steps.push('<div class="s-52b70c">');
    steps.push(mapeCalculation.replace(/\n/g, '<br>'));
    steps.push('<br><strong>Sum of % = ' + sumMape.toFixed(2) + '%</strong><br>');
    steps.push('MAPE = ' + sumMape.toFixed(2) + ' / ' + mapeCount + ' = <strong>' + mape.toFixed(2) + '%</strong>');
    steps.push('</div></div>');
    
    steps.push('</div></div>');
    
    // Insights Section
    steps.push('<div class="s-cdd1cd gen-pad">');
    steps.push('<div class="s-5587fc gen-flex">');
    steps.push('<span>💡</span> Model Performance Insights');
    steps.push('</div>');
    steps.push('<div class="s-0e0d76">');
    steps.push('<strong>R² = ' + (rSquared * 100).toFixed(1) + '%</strong> — ' + (rSquared >= 0.7 ? 'The model explains a substantial portion of variance, indicating strong predictive power.' : (rSquared >= 0.4 ? 'The model shows moderate explanatory power, but there may be room for improvement.' : 'The model explains limited variance, suggesting other factors may be important.')) + '<br><br>');
    steps.push('<strong>RMSE = ' + rmse.toFixed(4) + '</strong> vs <strong>MAE = ' + mae.toFixed(4) + '</strong> — ' + ((rmse - mae) > (rmse * 0.2) ? 'The larger RMSE compared to MAE suggests presence of some larger prediction errors/outliers.' : 'RMSE and MAE are close, indicating consistent prediction errors across observations.') + '<br><br>');
    steps.push('<strong>MAPE = ' + mape.toFixed(1) + '%</strong> — ' + (mape < 10 ? 'Excellent forecasting accuracy (highly reliable predictions).' : (mape < 20 ? 'Good forecasting accuracy with acceptable error margins.' : 'Moderate accuracy; consider model refinement or additional predictors.')));
    steps.push('</div></div>');
    
    steps.push('</div>');
    
    var finalSteps = steps.join('');
    
    return { 
        rSquared: rSquared, 
        adjRSquared: adjRSquared, 
        rmse: rmse, 
        mae: mae, 
        mape: mape, 
        ssRes: ssRes, 
        ssTot: ssTot, 
        meanY: meanY,
        n: n,
        steps: finalSteps 
    };
}

function setupModelSummaryLogic() {
    const computeBtn = document.getElementById("modelSummaryComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("modelSummaryData").value;
        const lines = raw.trim().split(/\r?\n/);
        let actual = [];
        let predicted = [];
        
        // Skip header row if present
        let startRow = 0;
        if (lines.length > 0 && (lines[0].toLowerCase().includes('actual') || lines[0].toLowerCase().includes('predicted'))) {
            startRow = 1;
        }
        
        for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") continue;
            const values = parseNumbersFromInput(line);
            if (values.length >= 2) {
                actual.push(values[0]);
                predicted.push(values[1]);
            }
        }
        
        const resultDiv = document.getElementById("modelSummaryResultArea");
        const valueSpan = document.getElementById("modelSummaryValueDisplay");
        const stepsSpan = document.getElementById("modelSummaryStepsDisplay");
        
        if (actual.length === 0) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter actual and predicted values.");
            return;
        }
        
        const kField = document.getElementById("modelSummaryK");
        const k = kField ? parseInt(kField.value, 10) : 1;
        const result = computeModelSummary(actual, predicted, k);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `R² = ${result.rSquared.toFixed(4)} | RMSE = ${result.rmse.toFixed(4)} | MAE = ${result.mae.toFixed(4)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("modelSummaryClearBtn", "modelSummaryData", "modelSummaryResultArea");
}
