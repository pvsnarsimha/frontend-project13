/* DistanceCorrelation: distcorr tool (render, compute, setup) */

// ========== DISTANCE CORRELATION INTERFACE RENDER ==========
function renderDistanceCorrelationInterface() {
    return buildInterface({
        id: "statDistanceCorrelationInterface",
        title: "📏 Distance Correlation (dCor)",
        formula: "📌 dCor(X,Y) = dCov(X,Y) / √(dVar(X)·dVar(Y))",
        desc: "Distance correlation measures both linear and non-linear association between variables. dCor = 0 implies independence, dCor = 1 implies perfect dependence.",
        inputs: [
            {
                label: "📋 Enter X values (comma, space, or line separated):",
                textarea: { id: "distCorrXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📋 Enter Y values (same number of values):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "distCorrYInput", rows: "3", placeholder: "Example: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100" }
            }
        ],
        run: { id: "distCorrComputeBtn", text: "📏 Calculate Distance Correlation + Steps" },
        clear: { id: "distCorrClearBtn", text: "Clear All" },
        result: {
            area: "distCorrResultArea",
            label: "🎯 DISTANCE CORRELATION RESULT",
            value: "distCorrValueDisplay",
            steps: "distCorrStepsDisplay"
        }
    });
}

// ========== DISTANCE CORRELATION COMPUTATION ==========
// ========== DISTANCE CORRELATION COMPUTATION - WITH PROPERLY LABELED MATRICES ==========
function computeDistanceCorrelationWithSteps(x, y) {
    if (!x.length || !y.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (x.length !== y.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (x.length < 4) {
        return { error: true, message: "Need at least 4 observations for distance correlation." };
    }
    
    const n = x.length;
    
    // Step 1: Calculate Euclidean distance matrices
    let a = Array(n).fill().map(() => Array(n).fill(0));  // Distance matrix for X
    let b = Array(n).fill().map(() => Array(n).fill(0));  // Distance matrix for Y
    
    // Build matrices with proper formatting
    let aMatrixHtml = '';
    let bMatrixHtml = '';
    
    // First, create the distance matrices
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            a[i][j] = Math.abs(x[i] - x[j]);
            b[i][j] = Math.abs(y[i] - y[j]);
        }
    }
    
    // Build properly labeled distance matrix A (for X)
    aMatrixHtml = `<div style="overflow-x: auto; margin: 15px 0;">
        <table style="border-collapse: collapse; border: 2px solid #1a5490; margin: 0 auto;">
            <caption style="caption-side: top; margin-bottom: 10px; font-weight: bold; color: #1a5490;">Distance Matrix A (for X): a<sub>ij</sub> = |x<sub>i</sub> - x<sub>j</sub>|</caption>
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px;">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        aMatrixHtml += `<th style="border: 1px solid #ddd; padding: 10px;">j=${j+1}<br>(x=${x[j]})</th>`;
    }
    aMatrixHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        aMatrixHtml += `<tr style="background: ${i % 2 === 0 ? '#f8f9fa' : 'white'};">
            <th style="border: 1px solid #ddd; padding: 10px; background: #e8f4f8;">i=${i+1}<br>(x=${x[i]})</th>`;
        for (let j = 0; j < n; j++) {
            let bgColor = (i === j) ? '#d4edda' : '';
            let value = a[i][j];
            aMatrixHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; background: ${bgColor};">
                ${value.toFixed(2)}
                ${i === j ? '<br><span style="font-size: 10px;">(zero)</span>' : ''}
            </td>`;
        }
        aMatrixHtml += `</tr>`;
    }
    aMatrixHtml += `</tbody></table>
        <div style="margin-top: 8px; font-size: 12px; color: #6c757d; text-align: center;">
            💡 Note: Diagonal values (i=j) are always 0 because distance from a point to itself is zero.<br>
            The matrix is symmetric: a<sub>ij</sub> = a<sub>ji</sub>
        </div>
    </div>`;
    
    // Build properly labeled distance matrix B (for Y)
    bMatrixHtml = `<div style="overflow-x: auto; margin: 15px 0;">
        <table style="border-collapse: collapse; border: 2px solid #2e7d32; margin: 0 auto;">
            <caption style="caption-side: top; margin-bottom: 10px; font-weight: bold; color: #2e7d32;">Distance Matrix B (for Y): b<sub>ij</sub> = |y<sub>i</sub> - y<sub>j</sub>|</caption>
            <thead>
                <tr style="background: #2e7d32; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px;">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        bMatrixHtml += `<th style="border: 1px solid #ddd; padding: 10px;">j=${j+1}<br>(y=${y[j]})</th>`;
    }
    bMatrixHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        bMatrixHtml += `<tr style="background: ${i % 2 === 0 ? '#f8f9fa' : 'white'};">
            <th style="border: 1px solid #ddd; padding: 10px; background: #e8f4f8;">i=${i+1}<br>(y=${y[i]})</th>`;
        for (let j = 0; j < n; j++) {
            let bgColor = (i === j) ? '#d4edda' : '';
            let value = b[i][j];
            bMatrixHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; background: ${bgColor};">
                ${value.toFixed(2)}
                ${i === j ? '<br><span style="font-size: 10px;">(zero)</span>' : ''}
            </td>`;
        }
        bMatrixHtml += `</tr>`;
    }
    bMatrixHtml += `</tbody></table>
        <div style="margin-top: 8px; font-size: 12px; color: #6c757d; text-align: center;">
            💡 The distance matrix shows how far apart each pair of observations is.
        </div>
    </div>`;
    
    // Step 2: Calculate row means and grand mean for A
    let aRowMeans = Array(n).fill(0);
    let aGrandMean = 0;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += a[i][j];
        }
        aRowMeans[i] = sum / n;
        aGrandMean += sum;
    }
    aGrandMean = aGrandMean / (n * n);
    
    // Step 3: Calculate row means and grand mean for B
    let bRowMeans = Array(n).fill(0);
    let bGrandMean = 0;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += b[i][j];
        }
        bRowMeans[i] = sum / n;
        bGrandMean += sum;
    }
    bGrandMean = bGrandMean / (n * n);
    
    // Step 4: Double-center the distance matrices
    let A_centered = Array(n).fill().map(() => Array(n).fill(0));
    let B_centered = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            A_centered[i][j] = a[i][j] - aRowMeans[i] - aRowMeans[j] + aGrandMean;
            B_centered[i][j] = b[i][j] - bRowMeans[i] - bRowMeans[j] + bGrandMean;
        }
    }
    
    // Build centered matrices HTML
    let centeredAHtml = '';
    let centeredBHtml = '';
    
    centeredAHtml = `<div style="overflow-x: auto; margin: 15px 0;">
        <table style="border-collapse: collapse; border: 1px solid #ddd; margin: 0 auto;">
            <caption style="caption-side: top; margin-bottom: 10px; font-weight: bold;">Centered Matrix A': A'<sub>ij</sub> = a<sub>ij</sub> - Ā<sub>i·</sub> - Ā<sub>·j</sub> + Ā<sub>··</sub></caption>
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 8px;">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        centeredAHtml += `<th style="border: 1px solid #ddd; padding: 8px;">${j+1}</th>`;
    }
    centeredAHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        centeredAHtml += `<tr>
            <th style="border: 1px solid #ddd; padding: 8px; background: #e8f4f8;">${i+1}</th>`;
        for (let j = 0; j < n; j++) {
            let val = A_centered[i][j];
            centeredAHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; ${val >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">
                ${val >= 0 ? '+' : ''}${val.toFixed(2)}
            </td>`;
        }
        centeredAHtml += `</tr>`;
    }
    centeredAHtml += `</tbody></table></div>`;
    
    centeredBHtml = `<div style="overflow-x: auto; margin: 15px 0;">
        <table style="border-collapse: collapse; border: 1px solid #ddd; margin: 0 auto;">
            <caption style="caption-side: top; margin-bottom: 10px; font-weight: bold;">Centered Matrix B': B'<sub>ij</sub> = b<sub>ij</sub> - B̄<sub>i·</sub> - B̄<sub>·j</sub> + B̄<sub>··</sub></caption>
            <thead>
                <tr style="background: #2e7d32; color: white;">
                    <th style="border: 1px solid #ddd; padding: 8px;">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        centeredBHtml += `<th style="border: 1px solid #ddd; padding: 8px;">${j+1}</th>`;
    }
    centeredBHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        centeredBHtml += `<tr>
            <th style="border: 1px solid #ddd; padding: 8px; background: #e8f4f8;">${i+1}</th>`;
        for (let j = 0; j < n; j++) {
            let val = B_centered[i][j];
            centeredBHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; ${val >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">
                ${val >= 0 ? '+' : ''}${val.toFixed(2)}
            </td>`;
        }
        centeredBHtml += `</tr>`;
    }
    centeredBHtml += `</tbody></table></div>`;
    
    // Step 5: Calculate distance covariance and variances
    let dCov = 0;
    let dVarX = 0;
    let dVarY = 0;
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            dCov += A_centered[i][j] * B_centered[i][j];
            dVarX += A_centered[i][j] * A_centered[i][j];
            dVarY += B_centered[i][j] * B_centered[i][j];
        }
    }
    
    dCov = dCov / (n * n);
    dVarX = dVarX / (n * n);
    dVarY = dVarY / (n * n);
    
    let dCor = dCov / Math.sqrt(dVarX * dVarY);
    
    // Calculate Pearson correlation for comparison
    let pearsonResult = computePearsonWithSteps(x, y);
    let pearsonR = pearsonResult.r || 0;
    
    // Build complete HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📏</span>
                <h2 style="margin: 0;">Distance Correlation (dCor)</h2>
            </div>
            <div style="margin-top: 12px; font-family: monospace; font-size: 13px;">
                <div><strong>What is Distance Correlation?</strong></div>
                <div>Unlike Pearson correlation which only detects LINEAR relationships, distance correlation can detect ANY type of relationship (linear, quadratic, exponential, periodic, etc.)</div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Input Data</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Observations (n)</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Pearson Correlation (for comparison)</div>
                    <div style="font-size: 20px;">${pearsonR.toFixed(6)}</div>
                </div>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">i</th>
                            <th style="padding: 10px;">Xᵢ</th>
                            <th style="padding: 10px;">Yᵢ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${x.map((val, i) => `<tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 8px; text-align: center; font-weight: bold;">${i+1}</td>
                            <td style="padding: 8px; text-align: center;">${val}</td>
                            <td style="padding: 8px; text-align: center;">${y[i]}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step 1: Calculate Distance Matrices</h3>
            <div style="font-family: monospace; font-size: 13px; margin-bottom: 12px;">
                <strong>Formula: a<sub>ij</sub> = |x<sub>i</sub> - x<sub>j</sub>|</strong> (Euclidean distance for 1D)
            </div>
            
            ${aMatrixHtml}
            ${bMatrixHtml}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step 2: Calculate Row Means and Grand Means</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>For Matrix A (X distances):</strong>
                <div style="font-family: monospace; font-size: 13px; margin-top: 8px;">
                    <strong>Row means (Ā<sub>i·</sub>):</strong> ${aRowMeans.map((m, i) => `Ā<sub>${i+1}·</sub> = ${m.toFixed(4)}`).join(', ')}<br>
                    <strong>Grand mean (Ā<sub>··</sub>):</strong> ${aGrandMean.toFixed(6)}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>For Matrix B (Y distances):</strong>
                <div style="font-family: monospace; font-size: 13px; margin-top: 8px;">
                    <strong>Row means (B̄<sub>i·</sub>):</strong> ${bRowMeans.map((m, i) => `B̄<sub>${i+1}·</sub> = ${m.toFixed(4)}`).join(', ')}<br>
                    <strong>Grand mean (B̄<sub>··</sub>):</strong> ${bGrandMean.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step 3: Double-Center the Distance Matrices</h3>
            <div style="font-family: monospace; font-size: 13px; margin-bottom: 12px;">
                <strong>Formula: A'<sub>ij</sub> = a<sub>ij</sub> - Ā<sub>i·</sub> - Ā<sub>·j</sub> + Ā<sub>··</sub></strong><br>
                <span style="font-size: 12px;">This centers the matrix so that row and column means are zero.</span>
            </div>
            
            <details open>
                <summary style="cursor: pointer; color: #1a5490; font-weight: bold;">Click to see double-centered matrices</summary>
                <div style="margin-top: 12px;">
                    <h4>Centered Matrix A' (Green = positive, Red = negative):</h4>
                    ${centeredAHtml}
                    <h4>Centered Matrix B' (Green = positive, Red = negative):</h4>
                    ${centeredBHtml}
                </div>
            </details>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 4: Calculate Distance Covariance and Variances</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Distance Covariance (dCov):</strong>
                <div style="font-family: monospace; font-size: 14px;">
                    dCov = (1/n²) × Σ Σ A'<sub>ij</sub> × B'<sub>ij</sub><br>
                    dCov = (1/${n}²) × ${(dCov * n * n).toFixed(6)}<br>
                    dCov = ${(dCov * n * n).toFixed(6)} / ${n*n} = <strong style="color: #1a5490;">${dCov.toFixed(8)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Distance Variance of X (dVarX):</strong>
                <div style="font-family: monospace; font-size: 14px;">
                    dVarX = (1/n²) × Σ Σ (A'<sub>ij</sub>)²<br>
                    dVarX = (1/${n}²) × ${(dVarX * n * n).toFixed(6)}<br>
                    dVarX = ${(dVarX * n * n).toFixed(6)} / ${n*n} = <strong style="color: #1a5490;">${dVarX.toFixed(8)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Distance Variance of Y (dVarY):</strong>
                <div style="font-family: monospace; font-size: 14px;">
                    dVarY = (1/n²) × Σ Σ (B'<sub>ij</sub>)²<br>
                    dVarY = (1/${n}²) × ${(dVarY * n * n).toFixed(6)}<br>
                    dVarY = ${(dVarY * n * n).toFixed(6)} / ${n*n} = <strong style="color: #1a5490;">${dVarY.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 5: Calculate Distance Correlation</h3>
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-family: monospace; font-size: 16px;">
                    dCor = dCov / √(dVarX × dVarY)<br>
                    dCor = ${dCov.toFixed(6)} / √(${dVarX.toFixed(6)} × ${dVarY.toFixed(6)})<br>
                    dCor = ${dCov.toFixed(6)} / √${(dVarX * dVarY).toFixed(6)}<br>
                    dCor = ${dCov.toFixed(6)} / ${Math.sqrt(dVarX * dVarY).toFixed(6)}
                </div>
                <div style="font-size: 36px; font-weight: 700; color: #1a5490; margin-top: 16px;">
                    dCor = ${dCor.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: #f3e5f5; border-left: 6px solid #6a1b9a;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation & Comparison</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Distance Correlation (dCor):</strong> ${dCor.toFixed(6)}</div>
                <div><strong>Pearson Correlation (r):</strong> ${pearsonR.toFixed(6)}</div>
                <div><strong>Difference:</strong> ${Math.abs(dCor - Math.abs(pearsonR)).toFixed(6)}</div>
                
                <div style="margin-top: 8px; padding: 12px; background: white; border-radius: 8px;">
                    <strong>🔍 What does this tell us?</strong><br><br>
                    ${Math.abs(pearsonR) < 0.3 && dCor > 0.5 ? 
                        `✓ <strong style="color: #28a745;">NON-LINEAR RELATIONSHIP DETECTED!</strong><br>
                        Pearson correlation (${pearsonR.toFixed(3)}) suggests weak linear relationship, but distance correlation (${dCor.toFixed(3)}) reveals a strong overall relationship.<br>
                        This indicates a non-linear pattern (e.g., quadratic, exponential, periodic, or other complex relationship).` : 
                        
                        Math.abs(pearsonR) > 0.7 && Math.abs(dCor - Math.abs(pearsonR)) < 0.1 ?
                        `✓ <strong style="color: #28a745;">STRONG LINEAR RELATIONSHIP</strong><br>
                        Both Pearson (${pearsonR.toFixed(3)}) and distance (${dCor.toFixed(3)}) correlations are strong and similar.<br>
                        This suggests the relationship is approximately linear.` :
                        
                        Math.abs(pearsonR) > 0.7 && dCor < 0.7 ?
                        `⚠ <strong style="color: #ffc107;">POSSIBLE OUTLIER EFFECT</strong><br>
                        Pearson shows strong correlation (${pearsonR.toFixed(3)}) but distance correlation is weaker (${dCor.toFixed(3)}).<br>
                        This may indicate that outliers are affecting Pearson correlation.` :
                        
                        `📊 <strong>MODERATE RELATIONSHIP</strong><br>
                        Both measures suggest a moderate relationship between X and Y.<br>
                        Consider visualizing the data to understand the pattern better.`
                    }
                </div>
                
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    <strong>💡 Key Insight:</strong> Distance correlation = 0 if and only if X and Y are statistically independent.<br>
                    Pearson correlation = 0 does NOT imply independence (only no LINEAR relationship).<br>
                    Distance correlation captures ALL types of relationships (linear, quadratic, exponential, periodic, etc.).
                </div>
            </div>
        </div>
    </div>`;
    
    return { dCor, dCov, dVarX, dVarY, pearsonR, steps };
}

function setupDistanceCorrelationLogic() {
    const computeBtn = document.getElementById("distCorrComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("distCorrXInput").value;
        const rawY = document.getElementById("distCorrYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("distCorrResultArea");
        const valueSpan = document.getElementById("distCorrValueDisplay");
        const stepsSpan = document.getElementById("distCorrStepsDisplay");
        
        const result = computeDistanceCorrelationWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `dCor = ${result.dCor.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    const clearBtn = document.getElementById("distCorrClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("distCorrXInput").value = '';
            document.getElementById("distCorrYInput").value = '';
            document.getElementById("distCorrResultArea").style.display = 'none';
        });
    }
}
