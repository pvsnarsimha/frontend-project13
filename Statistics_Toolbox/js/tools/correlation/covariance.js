/* Covariance: covariance tool (render, compute, setup) */

// COVARIANCE INTERFACE
function renderCovarianceInterface() {
    return buildInterface({
        id: "statCovarianceInterface",
        title: "📊 Covariance",
        formula: "📌 Cov(X,Y) = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / (n-1)  [Sample]",
        desc: "Measures direction of linear relationship. Positive = variables move together, Negative = move opposite.",
        inputs: [
            {
                label: "📋 Enter X values:",
                textarea: { id: "covarianceXInput", rows: "3", placeholder: "Example: 2, 4, 6, 8, 10, 12, 14, 16" }
            },
            {
                label: "📋 Enter Y values (same number of values):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "covarianceYInput", rows: "3", placeholder: "Example: 1, 3, 5, 7, 9, 11, 13, 15" }
            }
        ],
        run: { id: "covarianceComputeBtn", text: "📊 Calculate Covariance + Steps" },
        clear: { id: "covarianceClearBtn", text: "Clear All" },
        result: {
            area: "covarianceResultArea",
            label: "🎯 COVARIANCE RESULT",
            value: "covarianceValueDisplay",
            steps: "covarianceStepsDisplay"
        }
    });
}

// ========== COVARIANCE - BEAUTIFUL VERSION ==========
function computeCovarianceWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 2) {
        return { error: true, message: "Need at least 2 pairs for covariance." };
    }
    
    const n = xValues.length;
    let sumX = xValues.reduce((a,b) => a+b, 0);
    let sumY = yValues.reduce((a,b) => a+b, 0);
    let meanX = sumX / n;
    let meanY = sumY / n;
    
    let devData = [];
    let sumProduct = 0;
    
    for (let i = 0; i < n; i++) {
        let devX = xValues[i] - meanX;
        let devY = yValues[i] - meanY;
        let product = devX * devY;
        sumProduct += product;
        devData.push({
            i: i+1,
            x: xValues[i],
            y: yValues[i],
            devX: devX,
            devY: devY,
            product: product
        });
    }
    
    let covariance = sumProduct / (n - 1);
    let sumDevX = xValues.reduce((a, b) => a + Math.pow(b - meanX, 2), 0);
    let sumDevY = yValues.reduce((a, b) => a + Math.pow(b - meanY, 2), 0);
    let r = sumProduct / Math.sqrt(sumDevX * sumDevY);
    
    let tableRows = '';
    for (let d of devData) {
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px 8px; text-align: center; font-weight: 500;">${d.i}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.x}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.y}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc3545;">${d.devX.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; color: #dc3545;">${d.devY.toFixed(4)}</td>
            <td style="padding: 10px 8px; text-align: center; background: #e8f4f8; font-weight: 600; color: #1a5490;">${d.product.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <div style="background: linear-gradient(135deg, #495057 0%, #343a40 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">📊</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Covariance (Sample)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: Cov(X,Y) = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / (n-1)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75; font-size: 13px;">Measures direction of linear relationship | Positive = same direction, Negative = opposite direction</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #495057; font-size: 18px;"><span>📊</span> Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #495057;"><div style="font-size: 12px; color: #6c757d;">n (Pairs)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #28a745;"><div style="font-size: 12px; color: #6c757d;">x̄ (Mean X)</div><div style="font-size: 18px; font-weight: 600;">${meanX.toFixed(6)}</div></div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;"><div style="font-size: 12px; color: #6c757d;">ȳ (Mean Y)</div><div style="font-size: 18px; font-weight: 600;">${meanY.toFixed(6)}</div></div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #495057; color: #495057;"><span>📋</span> Deviation Products</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead><tr style="background: #495057; color: white;">
                    <th style="padding: 10px;">i</th><th style="padding: 10px;">xᵢ</th><th style="padding: 10px;">yᵢ</th>
                    <th style="padding: 10px;">(xᵢ - x̄)</th><th style="padding: 10px;">(yᵢ - ȳ)</th>
                    <th style="padding: 10px;">(xᵢ - x̄)(yᵢ - ȳ)</th>
                </tr></thead>
                <tbody>${tableRows}<tr style="background: #e9ecef; font-weight: 700;"><td colspan="5" style="padding: 10px; text-align: right;">SUM →</td><td style="padding: 10px; text-align: center; background: #e8f4f8;">${sumProduct.toFixed(4)}</td></tr></tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #495057; font-size: 18px;"><span>🔢</span> Calculation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">Σ[(xᵢ - x̄)(yᵢ - ȳ)] = ${sumProduct.toFixed(6)}</div>
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">Cov(X,Y) = ${sumProduct.toFixed(6)} / (${n} - 1)</div>
                <div style="font-family: monospace; font-size: 20px; font-weight: 700; color: #495057; text-align: center; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    Covariance = ${covariance.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${covariance > 0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (covariance < 0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #fff3cd; border-left: 6px solid #ffc107;')}">
            <h3 style="margin: 0 0 12px 0; font-size: 18px;"><span>📌</span> Interpretation</h3>
            <div><strong>Covariance:</strong> ${covariance.toFixed(6)} → <strong style="color: ${covariance > 0 ? '#28a745' : (covariance < 0 ? '#dc3545' : '#ffc107')};">${covariance > 0 ? 'POSITIVE' : (covariance < 0 ? 'NEGATIVE' : 'ZERO')}</strong> relationship</div>
            <div>${covariance > 0 ? '✓ X and Y tend to move in the SAME direction' : (covariance < 0 ? '✓ X and Y tend to move in OPPOSITE directions' : '✓ No linear relationship between X and Y')}</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px; color: #555;">
                💡 <strong>Note:</strong> Covariance magnitude depends on units. For standardized comparison, use Pearson correlation (r = ${r.toFixed(6)}).
            </div>
        </div>
    </div>`;
    
    return { covariance, steps, meanX, meanY, sumProduct, n };
}

function setupCovarianceLogic() {
    const computeBtn = document.getElementById("covarianceComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("covarianceXInput").value;
        const rawY = document.getElementById("covarianceYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("covarianceResultArea");
        const valueSpan = document.getElementById("covarianceValueDisplay");
        const stepsSpan = document.getElementById("covarianceStepsDisplay");
        
        const result = computeCovarianceWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);  // Changed to innerHTML
        } else {
            setHtml(valueSpan, `Cov = ${result.covariance.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);  // Changed to innerHTML
        }
    });
    
    const clearBtn = document.getElementById("covarianceClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("covarianceXInput").value = '';
            document.getElementById("covarianceYInput").value = '';
            document.getElementById("covarianceResultArea").style.display = 'none';
        });
    }
}
