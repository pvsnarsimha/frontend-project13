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
// Cook's D as text. D is infinite for two different reasons, and the wording says which:
//  - leverage = 1 (1 - h within 1e-12 of 0): the observation alone determines the fitted line, so deleting it changes the fit without limit;
//  - numerical overflow: the leverage is below 1 but the residual / leverage terms are too large for a double.
// `leverage` is the observation's h_ii (omit it when only the value is known: it is then read as the leverage = 1 case).
function formatCooksD(value, digits, leverage) {
    if (isFinite(value)) return value.toFixed(digits === undefined ? 6 : digits);
    if (leverage === undefined || 1 - leverage < 1e-12) return '∞ (leverage = 1)';
    return `∞ (numerical overflow, h = ${leverage.toFixed(6)} < 1)`;
}

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
    const ssTot = yValues.reduce((a, y) => a + (y - meanY) * (y - meanY), 0);
    const perfectFit = isPerfectFit(ssRes, ssTot);      // the same relative rule as every regression tool (absolute MSE < 1e-15 depends on the units of y)
    
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
            <div class="s-93cb1d">
                <strong>Observation ${i+1}:</strong><br>
                h<sub>ii</sub> = 1/${n} + (${xValues[i]} - ${meanX.toFixed(4)})² / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + (${xDev.toFixed(4)})² / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + ${xDevSq.toFixed(4)} / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + ${leverageTerm2.toFixed(6)}<br>
                = <strong class="s-ece993">${hii.toFixed(6)}</strong>
            </div>
        `);
        
        // A leverage of 1 (the only observation at its x value) makes the denominator 0; a perfect fit makes MSE 0
        const D = perfectFit ? 0
            : (1 - hii) < 1e-12 ? Infinity
            : (residuals[i] * residuals[i]) / (2 * mse) * (hii / Math.pow(1 - hii, 2));
        
        let influence = "";
        let influenceClass = "";   // colour comes from css/tool-panels.css (tp-infl-*)
        if (D < 0.5) { 
            influence = "Not Influential"; 
            influenceClass = "ok"; 
        } else if (D < 1) { 
            influence = "Moderately Influential"; 
            influenceClass = "warn"; 
        } else { 
            influence = "Highly Influential"; 
            influenceClass = "bad"; 
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
            influenceClass: influenceClass
        });
    }
    
    const influentialCount = cookDetails.filter(d => d.cooksD >= 1).length;
    const moderateCount = cookDetails.filter(d => d.cooksD >= 0.5 && d.cooksD < 1).length;
    const sortedD = [...cookDetails].sort((a,b) => b.cooksD - a.cooksD);
    
    // Build table rows
    let tableRows = '';
    for (let d of cookDetails) {
        tableRows += `
        <tr class="s-0d2692">
            <td class="s-e73169">${d.obs}</td>
            <td class="s-9da549">${d.x}</td>
            <td class="s-9da549">${d.y}</td>
            <td class="s-69c02e">${d.yPred.toFixed(4)}</td>
            <td class="s-69c02e ${d.residual >= 0 ? 'tp-text-ok' : 'tp-text-bad'}">${d.residual.toFixed(4)}</td>
            <td class="s-69c02e">${d.leverage.toFixed(4)}</td>
            <td class="s-34f862 tp-infl-${d.influenceClass}-bg">${formatCooksD(d.cooksD, 6, d.leverage)}</td>
            <td class="s-e73169 tp-infl-${d.influenceClass}">${d.influence}</td>
        </tr>`;
    }
    
    // Build complete HTML
    // A perfect fit has MSE = 0, so every Cook's D is 0 / 0. It is shown as 0 (no point moves a line that already passes through all of them), and the page says so.
    const perfectFitNote = perfectFit ? `<div class="tp-warn-6 tp-perfect-note">⚠️ The line fits the data perfectly: all residuals are 0, so MSE = 0 and Cook's D = e²/(p·MSE) · h/(1−h)² is 0/0 for every point. D is shown as 0 here (no point is influential), but the measure is not informative for a perfect fit.</div>` : '';
    const steps = perfectFitNote + stepsHtmlCooksDistance({ cookDetails, influentialCount, intercept, leverageDetails, meanX, meanY, moderateCount, mse, n, predictionDetails, slope, sortedD, ssRes, sxx, tableRows, xxDetails, xxSum, xyDetails, xySum });
    return { cooksDistances: cookDetails.map(d => d.cooksD), leverages: cookDetails.map(d => d.leverage), residuals, mse, perfectFit, steps, cookDetails };
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
            const top = result.cookDetails.reduce((a, b) => (b.cooksD > a.cooksD ? b : a));
            // an infinite D is explained (leverage 1 or numerical overflow) instead of printing "Infinity"
            setHtml(valueSpan, `${influential} influential obs | Max D = ${formatCooksD(top.cooksD, 4, top.leverage)}`);
            setHtml(stepsSpan, result.steps);  // ← CRITICAL: use innerHTML not innerText
        }
    });
    
    attachClearHandler("cooksClearBtn", ["cooksXInput", "cooksYInput"], "cooksResultArea");
}
