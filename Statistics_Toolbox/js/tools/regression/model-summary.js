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
    // RMSE divides by n (the average size of the prediction error on these points); the residual standard error
    // divides by the residual df n - k - 1 (the estimate of sigma). Both are shown and labelled.
    const rmse = Math.sqrt(ssRes / n);
    const rse = Math.sqrt(ssRes / dfRes);
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
    const mapeDefined = isFinite(mape);                         // NaN when every actual value is 0
    const mapeText = mapeDefined ? mape.toFixed(1) : 'N/A';
    const mapeText2 = mapeDefined ? mape.toFixed(2) : 'N/A';
    const mapeVerdict = !mapeDefined ? 'Not defined' : (mape < 10 ? 'High Accuracy' : (mape < 20 ? 'Moderate Accuracy' : 'Low Accuracy'));
    
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
    
    const finalSteps = stepsHtmlModelSummary({ actual, adjRSquared, dfRes, k, mae, maeCalculation, mape, mapeCalculation, mapeCount, mapeDefined, mapePerf, mapeText, mapeText2, mapeVerdict, meanY, n, r2Perf, rSquared, residualDetails, residuals, rmse, rse, ssRes, ssResCalculation, ssTot, ssTotCalculation, sumAbsResiduals, sumMape });
    
    return { 
        rSquared: rSquared, 
        adjRSquared: adjRSquared, 
        rmse: rmse, 
        rse: rse,
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
            hideAllStatCharts();
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `R² = ${result.rSquared.toFixed(4)} | RMSE = ${result.rmse.toFixed(4)} | MAE = ${result.mae.toFixed(4)}`);
            setHtml(stepsSpan, result.steps);
            showActualVsPredictedCharts("modelSummaryResultArea", actual, predicted);
        }
    });
    
    attachClearHandler("modelSummaryClearBtn", "modelSummaryData", "modelSummaryResultArea");
}
