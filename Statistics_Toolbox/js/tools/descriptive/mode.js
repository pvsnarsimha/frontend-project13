/* mode: mode tool (render, compute, setup) */

// ------------------ MODE with frequency table and textual breakdown ------------------
function computeModeWithSteps(numbers) {
        if (!numbers.length) return { value: null, steps: "No data provided.", display: "No data" };
        const freqMap = new Map();
        for (let num of numbers) freqMap.set(num, (freqMap.get(num) || 0) + 1);
        let maxFreq = 0;
        for (let f of freqMap.values()) if (f > maxFreq) maxFreq = f;
        
        let steps = `⭐ FORMULA: Mode = value(s) that appear most frequently\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `Frequency distribution:\n`;
        let freqEntries = Array.from(freqMap.entries()).sort((a,b)=>a[0]-b[0]);
        for (let [val, freq] of freqEntries) {
            steps += `   • ${val}  →  appears ${freq} time(s)\n`;
        }
        if (maxFreq === 1) {
            steps += `\nAll values have frequency = 1 → No mode exists.\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            return { value: null, steps: steps, display: "No mode (all values unique)", modesList: [] };
        }
        let modesList = [];
        for (let [val, freq] of freqMap.entries()) if (freq === maxFreq) modesList.push(val);
        modesList.sort((a,b)=>a-b);
        let displayStr = modesList.map(v => (Number.isInteger(v) ? v : v.toFixed(6))).join(', ');
        if (modesList.length > 1) displayStr = `Multimodal: ${displayStr} (each appears ${maxFreq} times)`;
        else displayStr = `${modesList[0]} (frequency: ${maxFreq})`;
        
        steps += `\nHighest frequency = ${maxFreq}\n`;
        steps += `Value(s) achieving highest frequency: ${modesList.map(v=>v).join(', ')}\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `✅ Mode = ${displayStr}`;
        return { value: modesList, steps: steps, display: displayStr, modesList: modesList };
    }

const modeTool = defineListTool({
    id: 'mode', interfaceId: 'statModeInterface',
    title: "⭐ Mode (Most Frequent Value)",
    formula: "📌 Mode = argmax_v freq(v)",
    desc: "Value(s) that occur most often. Dataset can have one mode, multiple modes, or no mode.",
    placeholder: "Example: 5, 3, 5, 2, 5, 8, 2, 2",
    buttonText: "⭐ Calculate Mode + Frequency Steps",
    resultLabel: "🔥 MODE RESULT",
    empty: { value: "No data", steps: "Provide numeric values for mode analysis." },
    compute: computeModeWithSteps,
    display: r => r.display
});

function computeModelSummary(actual, predicted) {
    if (!actual.length || !predicted.length) {
        return { error: true, message: "Please enter both actual and predicted values." };
    }
    if (actual.length !== predicted.length) {
        return { error: true, message: "Actual and predicted must have the same number of values." };
    }
    if (actual.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
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
    const rSquared = 1 - (ssRes / ssTot);
    const adjRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - 2));
    const rmse = Math.sqrt(ssRes / n);
    const mae = residuals.reduce((sum, r) => sum + Math.abs(r), 0) / n;
    const mape = residuals.reduce((sum, r, i) => sum + Math.abs(r / actual[i]) * 100, 0) / n;
    
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
        return '  ' + (idx+1) + '. |' + r.residual.toFixed(4) + '/' + r.actual + '| × 100 = ' + (Math.abs(r.residual/r.actual)*100).toFixed(2) + '%';
    }).join('\n');
    
    const sumAbsResiduals = residualDetails.reduce(function(s, r) { return s + Math.abs(r.residual); }, 0);
    const sumMape = residualDetails.reduce(function(s, r) { return s + Math.abs(r.residual/r.actual)*100; }, 0);
    
    let steps = [
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">',
        
        // HEADER SECTION
        '<div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2b45 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">',
        '<div style="display: flex; align-items: center; gap: 12px;">',
        '<span style="font-size: 32px;">📈</span>',
        '<h2 style="margin: 0;">Regression Model Dashboard</h2>',
        '</div>',
        '<p style="margin: 8px 0 0 0; opacity: 0.9;">Model Performance Analysis & Diagnostics | ' + n + ' Observations</p>',
        '</div>',
        
        // KPI CARDS SECTION
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 28px;">',
        
        // R² Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">R-Squared (R²)</span>',
        '<span style="font-size: 24px;">📊</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + (rSquared * 100).toFixed(1) + '<span style="font-size: 18px;">%</span></div>',
        '<div style="font-size: 12px; display: flex; align-items: center; gap: 8px;">',
        '<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ' + r2Perf.bg + '; color: ' + r2Perf.color + ';">' + r2Perf.icon + ' ' + r2Perf.text + '</span>',
        '<span>Variance explained</span>',
        '</div></div>',
        
        // Adjusted R² Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">Adjusted R²</span>',
        '<span style="font-size: 24px;">⚙️</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + (adjRSquared * 100).toFixed(1) + '<span style="font-size: 18px;">%</span></div>',
        '<div style="font-size: 12px;">Penalized for ' + (n-2) + ' df</div></div>',
        
        // RMSE Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">RMSE</span>',
        '<span style="font-size: 24px;">🎯</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + rmse.toFixed(4) + '</div>',
        '<div style="font-size: 12px;">Root Mean Square Error</div></div>',
        
        // MAE Card (with Mean Y)
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">MAE</span>',
        '<span style="font-size: 24px;">📏</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + mae.toFixed(4) + '</div>',
        '<div style="font-size: 12px;">Mean Absolute Error</div>',
        '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">',
        '<span style="font-size: 11px; color: #6b7280;">Mean of Y (ȳ) = ' + meanY.toFixed(4) + '</span>',
        '</div></div>',
        
        // MAPE Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">MAPE</span>',
        '<span style="font-size: 24px;">%</span>',
        '</div>',
        '<div style="font-size: 36px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">' + mape.toFixed(1) + '<span style="font-size: 18px;">%</span></div>',
        '<div style="font-size: 12px;">',
        '<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ' + mapePerf.bg + '; color: ' + mapePerf.color + ';">' + mapePerf.icon + ' ' + (mape < 10 ? 'High Accuracy' : (mape < 20 ? 'Moderate Accuracy' : 'Low Accuracy')) + '</span>',
        '</div></div>',
        
        // Sum of Squares Card
        '<div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">',
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">',
        '<span style="font-size: 14px; font-weight: 500; color: #6b7280; text-transform: uppercase;">Sum of Squares</span>',
        '<span style="font-size: 24px;">🔢</span>',
        '</div>',
        '<div style="font-size: 20px; font-weight: 800; color: #1f2937;">SS<sub>res</sub>: ' + ssRes.toFixed(2) + '</div>',
        '<div style="font-size: 12px;">SS<sub>tot</sub>: ' + ssTot.toFixed(2) + '</div></div>',
        '</div>',
        
        // MAIN CONTENT: 2 COLUMNS (Data Table + Expandable Metrics)
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">',
        
        // LEFT COLUMN: Data Table
        '<div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">',
        '<div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">',
        '<span>📋</span> Observed vs Predicted Values',
        '</div>',
        '<div style="overflow-x: auto;">',
        '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">',
        '<thead><tr style="background: #f8fafc;">',
        '<th style="padding: 12px; text-align: center;">#</th>',
        '<th style="padding: 12px; text-align: center;">Actual (y)</th>',
        '<th style="padding: 12px; text-align: center;">Predicted (ŷ)</th>',
        '<th style="padding: 12px; text-align: center;">Residual (e)</th>',
        '<th style="padding: 12px; text-align: center;">e²</th>',
        '<th style="padding: 12px; text-align: center;">(y-ȳ)²</th>',
        '</tr></thead>',
        '<tbody>'
    ];
    
    // Add table rows
    for (var i = 0; i < residualDetails.length; i++) {
        var r = residualDetails[i];
        steps.push('<tr style="border-bottom: 1px solid #f1f5f9;">');
        steps.push('<td style="padding: 10px; text-align: center;">' + (i+1) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center;"><strong>' + r.actual + '</strong></td>');
        steps.push('<td style="padding: 10px; text-align: center;">' + r.predicted.toFixed(4) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center; color: ' + (r.residual >= 0 ? '#10b981' : '#ef4444') + ';">' + (r.residual >= 0 ? '+' : '') + r.residual.toFixed(4) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center;">' + r.squaredRes.toFixed(4) + '</td>');
        steps.push('<td style="padding: 10px; text-align: center;">' + r.squaredDev.toFixed(4) + '</td>');
        steps.push('</tr>');
    }
    
    steps.push('<tr style="background: #f1f5f9; font-weight: 600;">');
    steps.push('<td colspan="4" style="padding: 10px; text-align: right;">SUMS →</td>');
    steps.push('<td style="padding: 10px; text-align: center;">' + ssRes.toFixed(4) + '</td>');
    steps.push('<td style="padding: 10px; text-align: center;">' + ssTot.toFixed(4) + '</td>');
    steps.push('</tr></tbody></table></div></div>');
    
    // RIGHT COLUMN: Expandable Metrics
    steps.push('<div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">');
    steps.push('<div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">');
    steps.push('<span>🧮</span> How Metrics Are Calculated');
    steps.push('<span style="font-size: 12px; margin-left: auto;">▼ Click any metric to expand</span>');
    steps.push('</div>');
    
    // R² Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div data-toggle-metric="1" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">📐 R-Squared (R²)</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + rSquared.toFixed(6) + '</span>');
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
    steps.push('<span style="background: #e0e7ff; padding: 2px 6px; border-radius: 4px;">✅ ' + (rSquared * 100).toFixed(1) + '% of variance explained</span>');
    steps.push('</div></div>');
    
    // Adjusted R² Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div data-toggle-metric="1" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">🔧 Adjusted R-Squared</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + adjRSquared.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> R²<sub>adj</sub> = 1 - (1-R²)(n-1)/(n-k-1)<br><br>');
    steps.push('<strong>Step 1:</strong> 1 - R² = 1 - ' + rSquared.toFixed(6) + ' = ' + (1-rSquared).toFixed(6) + '<br>');
    steps.push('<strong>Step 2:</strong> (n-1)/(n-k-1) = (' + n + '-1)/(' + n + '-2) = ' + ((n-1)/(n-2)).toFixed(4) + '<br>');
    steps.push('<strong>Step 3:</strong> Multiply: ' + (1-rSquared).toFixed(6) + ' × ' + ((n-1)/(n-2)).toFixed(4) + ' = ' + ((1-rSquared)*(n-1)/(n-2)).toFixed(6) + '<br>');
    steps.push('<strong>Step 4:</strong> 1 - ' + ((1-rSquared)*(n-1)/(n-2)).toFixed(6) + ' = <strong>' + adjRSquared.toFixed(6) + '</strong><br>');
    steps.push('</div></div>');
    
    // RMSE Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div data-toggle-metric="1" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">📏 RMSE (Root Mean Square Error)</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + rmse.toFixed(6) + '</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> RMSE = √(SS<sub>res</sub>/n)<br><br>');
    steps.push('<strong>Step 1:</strong> SS<sub>res</sub>/n = ' + ssRes.toFixed(4) + ' / ' + n + ' = ' + (ssRes/n).toFixed(4) + '<br>');
    steps.push('<strong>Step 2:</strong> √(' + (ssRes/n).toFixed(4) + ') = <strong>' + rmse.toFixed(6) + '</strong><br><br>');
    steps.push('<span>📖 Typical prediction error: ±' + rmse.toFixed(4) + ' units</span>');
    steps.push('</div></div>');
    
    // MAE Expandable
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div data-toggle-metric="1" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">📊 MAE (Mean Absolute Error)</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + mae.toFixed(6) + '</span>');
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
    steps.push('<div style="margin-bottom: 20px;">');
    steps.push('<div data-toggle-metric="1" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: #f8fafc; border-radius: 12px;">');
    steps.push('<span style="font-weight: 600;">% MAPE (Mean Absolute Percentage Error)</span>');
    steps.push('<span style="font-weight: 700; color: #1e3a5f;">' + mape.toFixed(2) + '%</span>');
    steps.push('</div>');
    steps.push('<div class="metric-formula" style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; margin-top: 8px; display: none; border-left: 3px solid #1e3a5f;">');
    steps.push('<strong>Formula:</strong> MAPE = (100/n) × Σ|(yᵢ - ŷᵢ)/yᵢ|<br><br>');
    steps.push('<strong>Step 1 - Calculate percentage errors:</strong><br>' + mapeCalculation.replace(/\n/g, '<br>') + '<br>');
    steps.push('<strong>Sum of percentages = ' + sumMape.toFixed(2) + '%</strong><br><br>');
    steps.push('<strong>Step 2 - Divide by n:</strong><br>');
    steps.push('MAPE = ' + sumMape.toFixed(2) + ' / ' + n + '<br>');
    steps.push('<strong>MAPE = ' + mape.toFixed(2) + '%</strong>');
    steps.push('</div></div>');
    steps.push('</div></div>');
    
    // BOTTOM SECTION: Complete Calculation Details for All Metrics
    steps.push('<div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 24px; margin-top: 20px; border: 1px solid #bbf7d0;">');
    steps.push('<div style="font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">');
    steps.push('<span>📚</span> Complete Formula Reference & Calculation Summary');
    steps.push('</div>');
    
    steps.push('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">');
    
    // SSres Detailed Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">📐 Sum of Squared Residuals (SS<sub>res</sub>)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">SS<sub>res</sub> = Σ(yᵢ - ŷᵢ)²</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">');
    steps.push(ssResCalculation.replace(/\n/g, '<br>'));
    steps.push('</div>');
    steps.push('<p style="margin-top: 8px;"><strong>Total SS<sub>res</sub> = ' + ssRes.toFixed(4) + '</strong></p>');
    steps.push('</div>');
    
    // SStot Detailed Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">📊 Total Sum of Squares (SS<sub>tot</sub>)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">SS<sub>tot</sub> = Σ(yᵢ - ȳ)² where ȳ = ' + meanY.toFixed(4) + '</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">');
    steps.push(ssTotCalculation.replace(/\n/g, '<br>'));
    steps.push('</div>');
    steps.push('<p style="margin-top: 8px;"><strong>Total SS<sub>tot</sub> = ' + ssTot.toFixed(4) + '</strong></p>');
    steps.push('</div>');
    
    // R² Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">🎯 R-Squared (R²)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">R² = 1 - SS<sub>res</sub>/SS<sub>tot</sub></p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px;">');
    steps.push('R² = 1 - (' + ssRes.toFixed(4) + ' / ' + ssTot.toFixed(4) + ')<br>');
    steps.push('R² = 1 - ' + (ssRes/ssTot).toFixed(6) + '<br>');
    steps.push('<strong>R² = ' + rSquared.toFixed(6) + '</strong> (' + (rSquared*100).toFixed(1) + '%)');
    steps.push('</div></div>');
    
    // Adjusted R² Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">⚙️ Adjusted R-Squared</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">R²<sub>adj</sub> = 1 - (1-R²)(n-1)/(n-2)</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px;">');
    steps.push('1 - R² = ' + (1-rSquared).toFixed(6) + '<br>');
    steps.push('(n-1)/(n-2) = ' + (n-1) + '/' + (n-2) + ' = ' + ((n-1)/(n-2)).toFixed(4) + '<br>');
    steps.push('Product = ' + (1-rSquared).toFixed(6) + ' × ' + ((n-1)/(n-2)).toFixed(4) + ' = ' + ((1-rSquared)*(n-1)/(n-2)).toFixed(6) + '<br>');
    steps.push('R²<sub>adj</sub> = 1 - ' + ((1-rSquared)*(n-1)/(n-2)).toFixed(6) + '<br>');
    steps.push('<strong>R²<sub>adj</sub> = ' + adjRSquared.toFixed(6) + '</strong> (' + (adjRSquared*100).toFixed(1) + '%)');
    steps.push('</div></div>');
    
    // RMSE Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">📏 RMSE (Root Mean Square Error)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">RMSE = √(SS<sub>res</sub>/n)</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px;">');
    steps.push('SS<sub>res</sub>/n = ' + ssRes.toFixed(4) + ' / ' + n + ' = ' + (ssRes/n).toFixed(4) + '<br>');
    steps.push('RMSE = √(' + (ssRes/n).toFixed(4) + ')<br>');
    steps.push('<strong>RMSE = ' + rmse.toFixed(6) + '</strong>');
    steps.push('</div></div>');
    
    // MAE Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">📊 MAE (Mean Absolute Error)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">MAE = (1/n) Σ|yᵢ - ŷᵢ|</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">');
    steps.push(maeCalculation.replace(/\n/g, '<br>'));
    steps.push('<br><strong>Sum |eᵢ| = ' + sumAbsResiduals.toFixed(4) + '</strong><br>');
    steps.push('MAE = ' + sumAbsResiduals.toFixed(4) + ' / ' + n + ' = <strong>' + mae.toFixed(6) + '</strong>');
    steps.push('</div></div>');
    
    // MAPE Calculation
    steps.push('<div style="background: white; border-radius: 12px; padding: 16px;">');
    steps.push('<h4 style="margin: 0 0 8px 0; color: #1e3a5f;">% MAPE (Mean Absolute Percentage Error)</h4>');
    steps.push('<p style="font-family: monospace; font-size: 12px; margin: 0 0 8px 0;">MAPE = (100/n) Σ|(yᵢ - ŷᵢ)/yᵢ|</p>');
    steps.push('<div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">');
    steps.push(mapeCalculation.replace(/\n/g, '<br>'));
    steps.push('<br><strong>Sum of % = ' + sumMape.toFixed(2) + '%</strong><br>');
    steps.push('MAPE = ' + sumMape.toFixed(2) + ' / ' + n + ' = <strong>' + mape.toFixed(2) + '%</strong>');
    steps.push('</div></div>');
    
    steps.push('</div></div>');
    
    // Insights Section
    steps.push('<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; margin-top: 20px;">');
    steps.push('<div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">');
    steps.push('<span>💡</span> Model Performance Insights');
    steps.push('</div>');
    steps.push('<div style="font-size: 14px; line-height: 1.6; color: #78350f;">');
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
