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
                hint: "First row: column headers (optional). Each row: Actual value, Predicted value",
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
        
        const result = computeModelSummary(actual, predicted);
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
