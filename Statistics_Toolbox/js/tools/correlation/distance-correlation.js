/* DistanceCorrelation: distcorr tool (render, compute, setup) */

// ========== DISTANCE CORRELATION INTERFACE RENDER ==========
function renderDistanceCorrelationInterface() {
    return buildInterface({
        id: "statDistanceCorrelationInterface",
        title: "📏 Distance Correlation (dCor)",
        formula: "📌 dCor(X,Y) = √[ dCov²(X,Y) / √(dVar²(X)·dVar²(Y)) ]",
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
    aMatrixHtml = `<div class="s-babcad">
        <table class="s-91a2ac">
            <caption class="s-6723a1">Distance Matrix A (for X): a<sub>ij</sub> = |x<sub>i</sub> - x<sub>j</sub>|</caption>
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-20ba02">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        aMatrixHtml += `<th class="s-20ba02">j=${j+1}<br>(x=${x[j]})</th>`;
    }
    aMatrixHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        aMatrixHtml += `<tr class="${i % 2 === 0 ? 's-6d64ad' : 's-67f264'}">
            <th class="s-172be4">i=${i+1}<br>(x=${x[i]})</th>`;
        for (let j = 0; j < n; j++) {
            let bgColor = (i === j) ? '#d4edda' : '';
            let value = a[i][j];
            aMatrixHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; background: ${bgColor};">
                ${value.toFixed(2)}
                ${i === j ? '<br><span class="s-55fe05">(zero)</span>' : ''}
            </td>`;
        }
        aMatrixHtml += `</tr>`;
    }
    aMatrixHtml += `</tbody></table>
        <div class="s-0a741a">
            💡 Note: Diagonal values (i=j) are always 0 because distance from a point to itself is zero.<br>
            The matrix is symmetric: a<sub>ij</sub> = a<sub>ji</sub>
        </div>
    </div>`;
    
    // Build properly labeled distance matrix B (for Y)
    bMatrixHtml = `<div class="s-babcad">
        <table class="s-4ff558">
            <caption class="s-e1ed0a">Distance Matrix B (for Y): b<sub>ij</sub> = |y<sub>i</sub> - y<sub>j</sub>|</caption>
            <thead>
                <tr class="s-257ed8">
                    <th class="s-20ba02">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        bMatrixHtml += `<th class="s-20ba02">j=${j+1}<br>(y=${y[j]})</th>`;
    }
    bMatrixHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        bMatrixHtml += `<tr class="${i % 2 === 0 ? 's-6d64ad' : 's-67f264'}">
            <th class="s-172be4">i=${i+1}<br>(y=${y[i]})</th>`;
        for (let j = 0; j < n; j++) {
            let bgColor = (i === j) ? '#d4edda' : '';
            let value = b[i][j];
            bMatrixHtml += `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; background: ${bgColor};">
                ${value.toFixed(2)}
                ${i === j ? '<br><span class="s-55fe05">(zero)</span>' : ''}
            </td>`;
        }
        bMatrixHtml += `</tr>`;
    }
    bMatrixHtml += `</tbody></table>
        <div class="s-0a741a">
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
    
    centeredAHtml = `<div class="s-babcad">
        <table class="s-0fedbe">
            <caption class="s-ba2d91">Centered Matrix A': A'<sub>ij</sub> = a<sub>ij</sub> - Ā<sub>i·</sub> - Ā<sub>·j</sub> + Ā<sub>··</sub></caption>
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-e59e20">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        centeredAHtml += `<th class="s-e59e20">${j+1}</th>`;
    }
    centeredAHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        centeredAHtml += `<tr>
            <th class="s-131038">${i+1}</th>`;
        for (let j = 0; j < n; j++) {
            let val = A_centered[i][j];
            centeredAHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; ${val >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">
                ${val >= 0 ? '+' : ''}${val.toFixed(2)}
            </td>`;
        }
        centeredAHtml += `</tr>`;
    }
    centeredAHtml += `</tbody></table></div>`;
    
    centeredBHtml = `<div class="s-babcad">
        <table class="s-0fedbe">
            <caption class="s-ba2d91">Centered Matrix B': B'<sub>ij</sub> = b<sub>ij</sub> - B̄<sub>i·</sub> - B̄<sub>·j</sub> + B̄<sub>··</sub></caption>
            <thead>
                <tr class="s-257ed8">
                    <th class="s-e59e20">i \\ j</th>`;
    for (let j = 0; j < n; j++) {
        centeredBHtml += `<th class="s-e59e20">${j+1}</th>`;
    }
    centeredBHtml += `</tr></thead><tbody>`;
    
    for (let i = 0; i < n; i++) {
        centeredBHtml += `<tr>
            <th class="s-131038">${i+1}</th>`;
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
    
    if (!(dVarX > 0) || !(dVarY > 0)) {
        return { error: true, message: `Distance correlation is undefined: all ${!(dVarX > 0) ? 'X' : 'Y'} values are identical (zero distance variance).` };
    }
    // dCov, dVarX and dVarY above are the squared quantities dCov², dVar²(X), dVar²(Y) (means of products of the centred
    // matrices), so their ratio is dCor²; the distance correlation itself is its square root (Székely et al. 2007).
    const dCor2 = dCov / Math.sqrt(dVarX * dVarY);
    const dCor = Math.sqrt(Math.max(0, Math.min(1, dCor2)));
    
    // Calculate Pearson correlation for comparison
    let pearsonResult = computePearsonWithSteps(x, y);
    let pearsonR = pearsonResult.r || 0;
    
    // Build complete HTML output
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">📏</span>
                <h2 class="s-f8a94d">Distance Correlation (dCor)</h2>
            </div>
            <div class="s-e414b5">
                <div><strong>What is Distance Correlation?</strong></div>
                <div>Unlike Pearson correlation which only detects LINEAR relationships, distance correlation can detect ANY type of relationship (linear, quadratic, exponential, periodic, etc.)</div>
            </div>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Input Data</h3>
            <div class="s-720c2d gen-grid">
                <div class="s-63afdf">
                    <div class="s-42da0a">Number of Observations (n)</div>
                    <div class="s-93c0a8">${n}</div>
                </div>
                <div class="s-63afdf">
                    <div class="s-42da0a">Pearson Correlation (for comparison)</div>
                    <div class="s-23ee8e">${pearsonR.toFixed(6)}</div>
                </div>
            </div>
            
            <div class="s-01a9b9">
                <table class="s-92a0fb gen-sized">
                    <thead>
                        <tr class="s-e7b83b">
                            <th class="s-a756db">i</th>
                            <th class="s-a756db">Xᵢ</th>
                            <th class="s-a756db">Yᵢ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${x.map((val, i) => `<tr class="s-00049c">
                            <td class="s-f8719c">${i+1}</td>
                            <td class="s-a7c3f4">${val}</td>
                            <td class="s-a7c3f4">${y[i]}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📐 Step 1: Calculate Distance Matrices</h3>
            <div class="s-65a263">
                <strong>Formula: a<sub>ij</sub> = |x<sub>i</sub> - x<sub>j</sub>|</strong> (Euclidean distance for 1D)
            </div>
            
            ${aMatrixHtml}
            ${bMatrixHtml}
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📐 Step 2: Calculate Row Means and Grand Means</h3>
            
            <div class="s-ca9e5c">
                <strong>For Matrix A (X distances):</strong>
                <div class="s-e2c3c6">
                    <strong>Row means (Ā<sub>i·</sub>):</strong> ${aRowMeans.map((m, i) => `Ā<sub>${i+1}·</sub> = ${m.toFixed(4)}`).join(', ')}<br>
                    <strong>Grand mean (Ā<sub>··</sub>):</strong> ${aGrandMean.toFixed(6)}
                </div>
            </div>
            
            <div class="s-6025fc">
                <strong>For Matrix B (Y distances):</strong>
                <div class="s-e2c3c6">
                    <strong>Row means (B̄<sub>i·</sub>):</strong> ${bRowMeans.map((m, i) => `B̄<sub>${i+1}·</sub> = ${m.toFixed(4)}`).join(', ')}<br>
                    <strong>Grand mean (B̄<sub>··</sub>):</strong> ${bGrandMean.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📐 Step 3: Double-Center the Distance Matrices</h3>
            <div class="s-65a263">
                <strong>Formula: A'<sub>ij</sub> = a<sub>ij</sub> - Ā<sub>i·</sub> - Ā<sub>·j</sub> + Ā<sub>··</sub></strong><br>
                <span class="s-888a4b">This centers the matrix so that row and column means are zero.</span>
            </div>
            
            <details open>
                <summary class="s-918799">Click to see double-centered matrices</summary>
                <div class="s-9d5978">
                    <h4>Centered Matrix A' (Green = positive, Red = negative):</h4>
                    ${centeredAHtml}
                    <h4>Centered Matrix B' (Green = positive, Red = negative):</h4>
                    ${centeredBHtml}
                </div>
            </details>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 4: Calculate Distance Covariance and Variances</h3>
            
            <div class="s-ca9e5c">
                <strong>Squared Distance Covariance (dCov²):</strong>
                <div class="s-4b0e48">
                    dCov² = (1/n²) × Σ Σ A'<sub>ij</sub> × B'<sub>ij</sub><br>
                    dCov² = (1/${n}²) × ${(dCov * n * n).toFixed(6)}<br>
                    dCov² = ${(dCov * n * n).toFixed(6)} / ${n*n} = <strong class="s-f342b5">${dCov.toFixed(8)}</strong>
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <strong>Squared Distance Variance of X (dVar²X):</strong>
                <div class="s-4b0e48">
                    dVar²X = (1/n²) × Σ Σ (A'<sub>ij</sub>)²<br>
                    dVar²X = (1/${n}²) × ${(dVarX * n * n).toFixed(6)}<br>
                    dVar²X = ${(dVarX * n * n).toFixed(6)} / ${n*n} = <strong class="s-f342b5">${dVarX.toFixed(8)}</strong>
                </div>
            </div>
            
            <div class="s-6025fc">
                <strong>Squared Distance Variance of Y (dVar²Y):</strong>
                <div class="s-4b0e48">
                    dVar²Y = (1/n²) × Σ Σ (B'<sub>ij</sub>)²<br>
                    dVar²Y = (1/${n}²) × ${(dVarY * n * n).toFixed(6)}<br>
                    dVar²Y = ${(dVarY * n * n).toFixed(6)} / ${n*n} = <strong class="s-f342b5">${dVarY.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 5: Calculate Distance Correlation</h3>
            <div class="s-20865b gen-pad">
                <div class="s-8308fb">
                    dCor² = dCov² / √(dVar²X × dVar²Y)<br>
                    dCor² = ${dCov.toFixed(6)} / √(${dVarX.toFixed(6)} × ${dVarY.toFixed(6)})<br>
                    dCor² = ${dCov.toFixed(6)} / √${(dVarX * dVarY).toFixed(6)}<br>
                    dCor² = ${dCov.toFixed(6)} / ${Math.sqrt(dVarX * dVarY).toFixed(6)} = ${dCor2.toFixed(6)}<br>
                    dCor = √dCor² = √${dCor2.toFixed(6)}
                </div>
                <div class="s-9c9645 gen-big">
                    dCor = ${dCor.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div class="s-6fb674 gen-pad">
            <h3 class="s-c7f0b4">📌 Interpretation & Comparison</h3>
            <div class="s-45b8b7">
                <div><strong>Distance Correlation (dCor):</strong> ${dCor.toFixed(6)}</div>
                <div><strong>Pearson Correlation (r):</strong> ${pearsonR.toFixed(6)}</div>
                <div><strong>Difference:</strong> ${Math.abs(dCor - Math.abs(pearsonR)).toFixed(6)}</div>
                
                <div class="s-d605bd">
                    <strong>🔍 What does this tell us?</strong><br><br>
                    ${Math.abs(pearsonR) < 0.3 && dCor > 0.5 ? 
                        `✓ <strong class="s-15a612">NON-LINEAR RELATIONSHIP DETECTED!</strong><br>
                        Pearson correlation (${pearsonR.toFixed(3)}) suggests weak linear relationship, but distance correlation (${dCor.toFixed(3)}) reveals a strong overall relationship.<br>
                        This indicates a non-linear pattern (e.g., quadratic, exponential, periodic, or other complex relationship).` : 
                        
                        Math.abs(pearsonR) > 0.7 && Math.abs(dCor - Math.abs(pearsonR)) < 0.1 ?
                        `✓ <strong class="s-15a612">STRONG LINEAR RELATIONSHIP</strong><br>
                        Both Pearson (${pearsonR.toFixed(3)}) and distance (${dCor.toFixed(3)}) correlations are strong and similar.<br>
                        This suggests the relationship is approximately linear.` :
                        
                        Math.abs(pearsonR) > 0.7 && dCor < 0.7 ?
                        `⚠ <strong class="s-8df210">POSSIBLE OUTLIER EFFECT</strong><br>
                        Pearson shows strong correlation (${pearsonR.toFixed(3)}) but distance correlation is weaker (${dCor.toFixed(3)}).<br>
                        This may indicate that outliers are affecting Pearson correlation.` :
                        
                        `📊 <strong>MODERATE RELATIONSHIP</strong><br>
                        Both measures suggest a moderate relationship between X and Y.<br>
                        Consider visualizing the data to understand the pattern better.`
                    }
                </div>
                
                <div class="s-f8d781">
                    <strong>💡 Key Insight:</strong> Distance correlation = 0 if and only if X and Y are statistically independent.<br>
                    Pearson correlation = 0 does NOT imply independence (only no LINEAR relationship).<br>
                    Distance correlation captures ALL types of relationships (linear, quadratic, exponential, periodic, etc.).
                </div>
            </div>
        </div>
    </div>`;
    
    return { dCor, dCor2, dCov, dVarX, dVarY, pearsonR, steps };   // dCov, dVarX, dVarY are the squared quantities
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
    
    attachClearHandler("distCorrClearBtn", ["distCorrXInput", "distCorrYInput"], "distCorrResultArea");
}
