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
    let meansTable = `<div class="s-01a9b9">
        <table class="s-d60c56 gen-sized">
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-20ba02">Variable</th>
                    <th class="s-20ba02">Data Values</th>
                    <th class="s-20ba02">Sum (Σ)</th>
                    <th class="s-20ba02">n</th>
                    <th class="s-20ba02">Mean (x̄ = Σ/n)</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let i = 0; i < numVars; i++) {
        let sum = variables[i].reduce((a,b) => a+b, 0);
        let mean = sum / numObs;
        means.push(mean);
        meansTable += `<tr>
            <td class="s-9551f5">X<sub>${i+1}</sub></td>
            <td class="s-4e4b77">${variables[i].join(', ')}</td>
            <td class="s-21fdcf">${sum}</td>
            <td class="s-21fdcf">${numObs}</td>
            <td class="s-e908bd">${mean.toFixed(6)}</td>
        </tr>`;
    }
    meansTable += `</tbody></table></div>`;
    
    // ========== STEP 2: Calculate STANDARD DEVIATIONS for each variable ==========
    let stdDevs = [];
    let stdTable = `<div class="s-01a9b9">
        <table class="s-d60c56 gen-sized">
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-20ba02">Variable</th>
                    <th class="s-20ba02">Deviations (x - x̄)</th>
                    <th class="s-20ba02">Squared Deviations (x - x̄)²</th>
                    <th class="s-20ba02">Σ(x - x̄)²</th>
                    <th class="s-20ba02">s² = Σ/(n-1)</th>
                    <th class="s-20ba02">s = √s²</th>
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
        if (sumSqDiff === 0) {
            return { error: true, message: `Variable ${i+1} has zero variance (all values identical), so its correlations are undefined. Remove it or enter data that varies.` };
        }
        stdDevs.push(stdDev);
        
        stdTable += `<tr>
            <td class="s-9551f5">X<sub>${i+1}</sub></td>
            <td class="s-4e4b77">${deviations.join(', ')}</td>
            <td class="s-4e4b77">${squaredDeviations.join(', ')}</td>
            <td class="s-21fdcf">${sumSqDiff.toFixed(4)}</td>
            <td class="s-21fdcf">${sumSqDiff.toFixed(4)}/${numObs-1} = ${variance.toFixed(6)}</td>
            <td class="s-e908bd">${stdDev.toFixed(6)}</td>
        </tr>`;
    }
    stdTable += `</tbody></table></div>`;
    
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
                <td class="s-1c9dad">${k+1}</td>
                <td class="s-1c9dad">${variables[pair.var1-1][k]}</td>
                <td class="s-1c9dad">${variables[pair.var2-1][k]}</td>
                <td class="s-1c9dad">${(variables[pair.var1-1][k] - pair.mean1).toFixed(4)}</td>
                <td class="s-1c9dad">${(variables[pair.var2-1][k] - pair.mean2).toFixed(4)}</td>
                <td class="s-7936e7">${pair.crossProducts[k].toFixed(4)}</td>
            </tr>`;
        }
        
        pairwiseHtml += `
        <div class="s-1be9ab gen-pad">
            <h4 class="s-3f62bc">📊 Correlation between X<sub>${pair.var1}</sub> and X<sub>${pair.var2}</sub></h4>
            
            <div class="s-58dab4">
                <strong>Step A: Calculate Covariance</strong>
                <div class="s-0fad0d">
                    Cov(X,Y) = Σ[(x - x̄)(y - ȳ)] / (n - 1)
                </div>
                
                <div class="s-c1ac02">
                    <table class="s-fb047b gen-sized">
                        <thead>
                            <tr class="s-2411fb">
                                <th class="s-e59e20">i</th>
                                <th class="s-e59e20">x</th>
                                <th class="s-e59e20">y</th>
                                <th class="s-e59e20">(x - x̄)</th>
                                <th class="s-e59e20">(y - ȳ)</th>
                                <th class="s-e59e20">(x - x̄)(y - ȳ)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${crossTableRows}
                            <tr class="s-17b154">
                                <td class="s-052be3" colspan="5">Σ =</td>
                                <td class="s-21fdcf">${pair.crossProducts.reduce((a,b)=>a+b,0).toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="s-453b71">
                    Cov(X<sub>${pair.var1}</sub>, X<sub>${pair.var2}</sub>) = ${pair.crossProducts.reduce((a,b)=>a+b,0).toFixed(4)} / ${pair.n - 1}<br>
                    = <strong class="s-f342b5">${pair.covariance.toFixed(8)}</strong>
                </div>
            </div>
            
            <div>
                <strong>Step B: Calculate Correlation</strong>
                <div class="s-0fad0d">
                    r = Cov(X,Y) / (s<sub>X</sub> × s<sub>Y</sub>)
                </div>
                <div class="s-4cf724">
                    r = ${pair.covariance.toFixed(6)} / (${pair.std1.toFixed(6)} × ${pair.std2.toFixed(6)})<br>
                    r = ${pair.covariance.toFixed(6)} / ${(pair.std1 * pair.std2).toFixed(6)}<br>
                    = <strong class="s-bbce95">${pair.correlation.toFixed(8)}</strong>
                </div>
                
                <div class="s-a1733a">
                    <strong>Interpretation:</strong> 
                    ${Math.abs(pair.correlation) > 0.7 ? 'Strong' : (Math.abs(pair.correlation) > 0.3 ? 'Moderate' : 'Weak')}
                    ${pair.correlation > 0 ? 'positive' : 'negative'} correlation
                </div>
            </div>
        </div>`;
    }
    
    // Build final correlation matrix table with color coding
    let matrixTable = `<div class="s-a1df57">
        <table class="s-1b48ff gen-sized">
            <thead>
                <tr class="s-e7b83b">
                    <th class="s-7d7706">Variable</th>`;
    for (let i = 0; i < numVars; i++) {
        matrixTable += `<th class="s-7d7706">X<sub>${i+1}</sub></th>`;
    }
    matrixTable += `</tr>
            </thead>
            <tbody>`;
    
    for (let i = 0; i < numVars; i++) {
        matrixTable += `<tr>
            <th class="s-32c0c9">X<sub>${i+1}</sub></th>`;
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
                <br><span class="s-d770c8">(${strengthText})</span>
             </td>`;
        }
        matrixTable += `</tr>`;
    }
    matrixTable += `</tbody></table></div>`;
    
    // Complete HTML output
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <h2 class="s-f8a94d">📊 Correlation Matrix</h2>
            <p class="s-28fe37">Formula: r<sub>ij</sub> = Cov(X<sub>i</sub>, X<sub>j</sub>) / (s<sub>i</sub> × s<sub>j</sub>)</p>
            <p class="s-cc450e">Range: -1 (perfect negative) to +1 (perfect positive) | 0 = no linear correlation</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-6cfbec">📊 STEP 1: Calculate Means (x̄ = Σx / n)</h3>
            ${meansTable}
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-6cfbec">📊 STEP 2: Calculate Standard Deviations (s = √[Σ(x - x̄)²/(n-1)])</h3>
            ${stdTable}
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-6cfbec">📊 STEP 3: Calculate Pairwise Correlations</h3>
            ${pairwiseHtml}
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-6cfbec">📊 FINAL CORRELATION MATRIX</h3>
            ${matrixTable}
            
            <div class="s-a5b049">
                <strong>📌 How to Read This Matrix:</strong><br>
                • <span class="s-7773e9">Green cells</span> = Strong correlation (|r| > 0.7)<br>
                • <span class="s-2673ca">Yellow cells</span> = Moderate correlation (0.3 < |r| ≤ 0.7)<br>
                • <span class="s-81c63c">Red cells</span> = Weak correlation (|r| ≤ 0.3)<br>
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
