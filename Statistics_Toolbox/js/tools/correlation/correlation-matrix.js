/* CorrelationMatrix: corrmatrix tool (render, compute, setup) */

// ========== CORRELATION MATRIX INTERFACE RENDER ==========
function renderCorrelationMatrixInterface() {
    return buildInterface({
        id: "statCorrelationMatrixInterface",
        title: "📊 Correlation Matrix",
        formula: "📌 r<sub>ij</sub> = correlation between variable i and variable j",
        desc: "A correlation matrix shows pairwise correlation coefficients between multiple variables. Values range from -1 to +1.",
        inputs: [
            {
                label: "📋 Enter multiple variables (each line = one variable, values comma-separated):",
                textarea: {
                    id: "corrMatrixData",
                    rows: "6",
                    placeholder: "Example:&#10;1, 2, 3, 4, 5, 6, 7, 8&#10;2, 4, 6, 8, 10, 12, 14, 16&#10;1, 3, 5, 7, 9, 11, 13, 15"
                }
            },
            {
                hint: "Each line represents one variable. All variables must have the same number of observations.",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "corrMatrixComputeBtn", text: "📊 Calculate Correlation Matrix + Steps" },
        clear: { id: "corrMatrixClearBtn", text: "Clear" },
        result: {
            area: "corrMatrixResultArea",
            label: "🎯 CORRELATION MATRIX",
            value: "corrMatrixValueDisplay",
            steps: "corrMatrixStepsDisplay"
        }
    });
}

// ========== CORRELATION MATRIX COMPUTATION ==========
// ========== CORRELATION MATRIX COMPUTATION - WITH ULTRA DETAILED STEPS ==========
function computeCorrelationMatrixWithSteps(variables) {
    if (variables.length < 2) {
        return { error: true, message: "Need at least 2 variables for correlation matrix." };
    }
    
    const numVars = variables.length;  // number of variables
    const numObs = variables[0].length;  // number of observations per variable
    
    // Check all variables have same length
    for (let i = 0; i < numVars; i++) {
        if (variables[i].length !== numObs) {
            return { error: true, message: `Variable ${i+1} has ${variables[i].length} observations, expected ${numObs}.` };
        }
    }
    
    if (numObs < 3) {
        return { error: true, message: "Need at least 3 observations per variable." };
    }
    
    // ========== STEP 1: Calculate MEANS for each variable ==========
    let means = [];
    let meansTable = `<div style="overflow-x: auto;">
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px;">Variable</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Data Values</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Sum (Σ)</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">n</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Mean (x̄ = Σ/n)</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let i = 0; i < numVars; i++) {
        let sum = variables[i].reduce((a,b) => a+b, 0);
        let mean = sum / numObs;
        means.push(mean);
        meansTable += `<tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">X<sub>${i+1}</sub></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${variables[i].join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${sum}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${numObs}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; background: #e8f4f8; font-weight: bold;">${mean.toFixed(6)}</td>
        </tr>`;
    }
    meansTable += `</tbody>\\tour</div>`;
    
    // ========== STEP 2: Calculate STANDARD DEVIATIONS for each variable ==========
    let stdDevs = [];
    let stdTable = `<div style="overflow-x: auto;">
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px;">Variable</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Deviations (x - x̄)</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Squared Deviations (x - x̄)²</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">Σ(x - x̄)²</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">s² = Σ/(n-1)</th>
                    <th style="border: 1px solid #ddd; padding: 10px;">s = √s²</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let i = 0; i < numVars; i++) {
        let sumSqDiff = 0;
        let deviations = [];
        let squaredDeviations = [];
        
        for (let k = 0; k < numObs; k++) {
            let dev = variables[i][k] - means[i];
            let sqDev = dev * dev;
            deviations.push(dev.toFixed(4));
            squaredDeviations.push(sqDev.toFixed(4));
            sumSqDiff += sqDev;
        }
        
        let variance = sumSqDiff / (numObs - 1);
        let stdDev = Math.sqrt(variance);
        stdDevs.push(stdDev);
        
        stdTable += `<tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">X<sub>${i+1}</sub></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${deviations.join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${squaredDeviations.join(', ')}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${sumSqDiff.toFixed(4)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${sumSqDiff.toFixed(4)}/${numObs-1} = ${variance.toFixed(6)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; background: #e8f4f8; font-weight: bold;">${stdDev.toFixed(6)}</td>
        </tr>`;
    }
    stdTable += `</tbody>\\tour</div>`;
    
    // ========== STEP 3: Calculate PAIRWISE CORRELATIONS ==========
    let corrMatrix = Array(numVars).fill().map(() => Array(numVars).fill(0));
    let pairwiseDetails = [];
    
    for (let i = 0; i < numVars; i++) {
        for (let j = i; j < numVars; j++) {
            if (i === j) {
                corrMatrix[i][j] = 1;
            } else {
                // Calculate covariance
                let cov = 0;
                let productDetails = [];
                let crossProducts = [];
                
                for (let k = 0; k < numObs; k++) {
                    let dev_i = variables[i][k] - means[i];
                    let dev_j = variables[j][k] - means[j];
                    let product = dev_i * dev_j;
                    cov += product;
                    crossProducts.push(product);
                    productDetails.push(`${dev_i.toFixed(4)} × ${dev_j.toFixed(4)} = ${product.toFixed(4)}`);
                }
                cov = cov / (numObs - 1);
                
                // Calculate correlation
                let r = cov / (stdDevs[i] * stdDevs[j]);
                corrMatrix[i][j] = r;
                corrMatrix[j][i] = r;
                
                pairwiseDetails.push({
                    var1: i+1,
                    var2: j+1,
                    mean1: means[i],
                    mean2: means[j],
                    std1: stdDevs[i],
                    std2: stdDevs[j],
                    covariance: cov,
                    correlation: r,
                    crossProducts: crossProducts,
                    productDetails: productDetails,
                    n: numObs
                });
            }
        }
    }
    
    // Build pairwise correlation HTML
    let pairwiseHtml = '';
    for (let pair of pairwiseDetails) {
        let crossTableRows = '';
        for (let k = 0; k < numObs; k++) {
            crossTableRows += `<tr>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${k+1}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${variables[pair.var1-1][k]}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${variables[pair.var2-1][k]}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${(variables[pair.var1-1][k] - pair.mean1).toFixed(4)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${(variables[pair.var2-1][k] - pair.mean2).toFixed(4)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold; background: #e8f4f8;">${pair.crossProducts[k].toFixed(4)}</td>
            </tr>`;
        }
        
        pairwiseHtml += `
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #1a5490;">
            <h4 style="margin: 0 0 15px 0; color: #1a5490;">📊 Correlation between X<sub>${pair.var1}</sub> and X<sub>${pair.var2}</sub></h4>
            
            <div style="margin-bottom: 20px;">
                <strong>Step A: Calculate Covariance</strong>
                <div style="font-family: monospace; font-size: 13px; margin-top: 10px;">
                    Cov(X,Y) = Σ[(x - x̄)(y - ȳ)] / (n - 1)
                </div>
                
                <div style="overflow-x: auto; margin-top: 10px;">
                    <table style="border-collapse: collapse; width: 100%;">
                        <thead>
                            <tr style="background: #f0f4fa;">
                                <th style="border: 1px solid #ddd; padding: 8px;">i</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">x</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">y</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">(x - x̄)</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">(y - ȳ)</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">(x - x̄)(y - ȳ)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${crossTableRows}
                            <tr style="background: #e9ecef; font-weight: bold;">
                                <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Σ =</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${pair.crossProducts.reduce((a,b)=>a+b,0).toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 15px; font-family: monospace;">
                    Cov(X<sub>${pair.var1}</sub>, X<sub>${pair.var2}</sub>) = ${pair.crossProducts.reduce((a,b)=>a+b,0).toFixed(4)} / ${pair.n - 1}<br>
                    = <strong style="color: #1a5490;">${pair.covariance.toFixed(8)}</strong>
                </div>
            </div>
            
            <div>
                <strong>Step B: Calculate Correlation</strong>
                <div style="font-family: monospace; font-size: 13px; margin-top: 10px;">
                    r = Cov(X,Y) / (s<sub>X</sub> × s<sub>Y</sub>)
                </div>
                <div style="margin-top: 10px; font-family: monospace;">
                    r = ${pair.covariance.toFixed(6)} / (${pair.std1.toFixed(6)} × ${pair.std2.toFixed(6)})<br>
                    r = ${pair.covariance.toFixed(6)} / ${(pair.std1 * pair.std2).toFixed(6)}<br>
                    = <strong style="color: #1a5490; font-size: 18px;">${pair.correlation.toFixed(8)}</strong>
                </div>
                
                <div style="margin-top: 10px; padding: 8px; background: #f0f4fa; border-radius: 6px;">
                    <strong>Interpretation:</strong> 
                    ${Math.abs(pair.correlation) > 0.7 ? 'Strong' : (Math.abs(pair.correlation) > 0.3 ? 'Moderate' : 'Weak')}
                    ${pair.correlation > 0 ? 'positive' : 'negative'} correlation
                </div>
            </div>
        </div>`;
    }
    
    // Build final correlation matrix table with color coding
    let matrixTable = `<div style="overflow-x: auto; margin-top: 20px;">
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0; text-align: center;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px;">Variable</th>`;
    for (let i = 0; i < numVars; i++) {
        matrixTable += `<th style="border: 1px solid #ddd; padding: 12px;">X<sub>${i+1}</sub></th>`;
    }
    matrixTable += `</tr>
            </thead>
            <tbody>`;
    
    for (let i = 0; i < numVars; i++) {
        matrixTable += `<tr>
            <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">X<sub>${i+1}</sub></th>`;
        for (let j = 0; j < numVars; j++) {
            let rVal = corrMatrix[i][j];
            let bgColor = '';
            let strengthText = '';
            
            if (i === j) {
                bgColor = '#d4edda';
                strengthText = 'Perfect';
            } else if (Math.abs(rVal) > 0.7) {
                bgColor = '#d4edda';
                strengthText = 'Strong';
            } else if (Math.abs(rVal) > 0.3) {
                bgColor = '#fff3cd';
                strengthText = 'Moderate';
            } else {
                bgColor = '#f8d7da';
                strengthText = 'Weak';
            }
            
            matrixTable += `<td style="border: 1px solid #ddd; padding: 12px; background: ${bgColor};">
                ${rVal.toFixed(4)}
                <br><span style="font-size: 10px; color: #666;">(${strengthText})</span>
             </td>`;
        }
        matrixTable += `</tr>`;
    }
    matrixTable += `</tbody>\\tour</div>`;
    
    // Complete HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <h2 style="margin: 0;">📊 Correlation Matrix</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Formula: r<sub>ij</sub> = Cov(X<sub>i</sub>, X<sub>j</sub>) / (s<sub>i</sub> × s<sub>j</sub>)</p>
            <p style="margin: 5px 0 0 0; opacity: 0.75;">Range: -1 (perfect negative) to +1 (perfect positive) | 0 = no linear correlation</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 STEP 1: Calculate Means (x̄ = Σx / n)</h3>
            ${meansTable}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 STEP 2: Calculate Standard Deviations (s = √[Σ(x - x̄)²/(n-1)])</h3>
            ${stdTable}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 STEP 3: Calculate Pairwise Correlations</h3>
            ${pairwiseHtml}
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 FINAL CORRELATION MATRIX</h3>
            ${matrixTable}
            
            <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 8px;">
                <strong>📌 How to Read This Matrix:</strong><br>
                • <span style="color: #28a745;">Green cells</span> = Strong correlation (|r| > 0.7)<br>
                • <span style="color: #ffc107;">Yellow cells</span> = Moderate correlation (0.3 < |r| ≤ 0.7)<br>
                • <span style="color: #dc3545;">Red cells</span> = Weak correlation (|r| ≤ 0.3)<br>
                • Diagonal = Perfect correlation with itself (r = 1)<br>
                • Matrix is symmetric: r<sub>ij</sub> = r<sub>ji</sub>
            </div>
        </div>
    </div>`;
    
    return { corrMatrix, steps };
}

// ========== SETUP FUNCTIONS FOR NEW BUTTONS ==========
function setupCorrelationMatrixLogic() {
    const computeBtn = document.getElementById("corrMatrixComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("corrMatrixData").value;
        const lines = raw.trim().split(/\r?\n/);
        let variables = [];
        
        for (let line of lines) {
            line = line.trim();
            if (line === "") continue;
            let values = parseNumbersFromInput(line);
            if (values.length > 0) {
                variables.push(values);
            }
        }
        
        const resultDiv = document.getElementById("corrMatrixResultArea");
        const valueSpan = document.getElementById("corrMatrixValueDisplay");
        const stepsSpan = document.getElementById("corrMatrixStepsDisplay");
        
        if (variables.length < 2) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, "Please enter at least 2 variables (each on a new line).");
            return;
        }
        
        const result = computeCorrelationMatrixWithSteps(variables);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `${variables.length}×${variables[0].length} correlation matrix computed`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("corrMatrixClearBtn", "corrMatrixData", "corrMatrixResultArea");
}
