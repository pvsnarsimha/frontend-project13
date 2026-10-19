// Table rows shared by the simple-regression worked solutions (standard errors, t statistics): the deviation table of Step 1
// and the predictions-and-residuals table. Keeping the markup here means a display change is made once.

// One row per observation: x, y, x - x̄, y - ȳ, the cross-product and the squared x deviation
function buildDeviationRows(xValues, yValues, meanX, meanY) {
    let rows = '';
    for (let i = 0; i < xValues.length; i++) {
        const xDev = xValues[i] - meanX, yDev = yValues[i] - meanY;
        rows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]} - ${meanX.toFixed(4)} = ${xDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]} - ${meanY.toFixed(4)} = ${yDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; font-weight: 600; color: #1a5490;">${(xDev * yDev).toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${(xDev * xDev).toFixed(4)}</td>
        </tr>`;
    }
    return rows;
}

// One row per observation: x, y, the fitted value ŷ, the residual and its square
function buildPredictionRows(xValues, yValues, slope, intercept) {
    let rows = '';
    for (let i = 0; i < xValues.length; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        rows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${intercept.toFixed(4)} + ${slope.toFixed(4)}×${xValues[i]} = ${yPred.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; ${residual >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">${residual.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${(residual * residual).toFixed(4)}</td>
        </tr>`;
    }
    return rows;
}
