/* MultipleLinear: multiplelinear tool (render, compute, setup) */

// ========== MULTIPLE LINEAR REGRESSION INTERFACE ==========
function renderMultipleLinearInterface() {
    return buildInterface({
        id: "statMultipleLinearInterface",
        title: "📊 Multiple Linear Regression",
        card: [
            { formula: "📌 y = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ + ε" },
            {
                desc: "<strong>Formula details:</strong><br>\n                    • Models relationship between multiple predictors and one outcome<br>\n                    • Uses matrix algebra: β = (X'X)⁻¹X'y<br>\n                    • R² = 1 - SS<sub>res</sub> / SS<sub>tot</sub> (Multiple R-squared)<br>\n                    • R²<sub>adj</sub> = 1 - (1-R²)(n-1)/(n-k-1) (Adjusted R-squared)"
            },
            {
                desc: "Enter data with first column as Y (dependent), remaining columns as X₁, X₂, ... (independent)",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter data (comma-separated values, first column = Y, rest = X variables):",
                textarea: {
                    id: "multipleData",
                    rows: "5",
                    placeholder: "Example:&#10;Y, X1, X2, X3&#10;2, 1, 4, 7&#10;3, 2, 5, 8&#10;4, 3, 6, 9&#10;5, 4, 7, 10&#10;6, 5, 8, 11"
                }
            },
            {
                hint: "First row can be column headers (optional). Each subsequent row: Y value, then X1, X2, ... values",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "multipleLinearComputeBtn", text: "📊 Fit Multiple Regression + Steps" },
        clear: { id: "multipleLinearClearBtn", text: "Clear All" },
        result: {
            area: "multipleLinearResultArea",
            label: "🎯 MULTIPLE REGRESSION RESULTS",
            value: "multipleLinearValueDisplay",
            steps: "multipleLinearStepsDisplay"
        }
    });
}

// Helper function for multiple regression with detailed matrix algebra explanation
// Helper function for multiple regression with detailed matrix algebra explanation
function computeMultipleLinearRegression(dataMatrix) {
    // dataMatrix: each row = [y, x1, x2, ...]
    if (dataMatrix.length < 3) {
        return { error: true, message: "Need at least 3 observations for regression." };
    }
    
    const n = dataMatrix.length;
    const p = dataMatrix[0].length - 1; // number of predictors
    const ragged = dataMatrix.findIndex(row => row.length !== dataMatrix[0].length);
    if (ragged >= 0) {
        return { error: true, message: `Row ${ragged + 1} has ${dataMatrix[ragged].length} values but row 1 has ${dataMatrix[0].length}. Every row needs the same number of values (Y followed by each predictor).` };
    }
    
    if (p < 1) {
        return { error: true, message: "Need at least one predictor variable." };
    }
    
    // Extract Y vector and X matrix
    const y = dataMatrix.map(row => row[0]);
    const x = dataMatrix.map(row => row.slice(1));
    
    // Calculate means
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    const xMeans = [];
    for (let j = 0; j < p; j++) {
        xMeans.push(x.reduce((sum, row) => sum + row[j], 0) / n);
    }
    // A predictor that sits far from 0 relative to its spread (for example years, or values near 1,000,000) makes X'X so badly
    // scaled that a perfectly valid design looks singular. Such predictors are centred (x - mean) before solving, and the
    // intercept is converted back to the original scale afterwards; the other coefficients are unchanged by centring.
    const shift = xMeans.map((m, j) => {
        const sd = Math.sqrt(x.reduce((sum, row) => sum + (row[j] - m) ** 2, 0) / n);
        return sd > 0 && Math.abs(m) > 100 * sd ? m : 0;
    });
    const centred = shift.some(v => v !== 0);
    
    // Build design matrix X (with column of 1's for intercept)
    const X = [];
    for (let i = 0; i < n; i++) {
        const row = [1]; // intercept term
        for (let j = 0; j < p; j++) {
            row.push(x[i][j] - shift[j]);
        }
        X.push(row);
    }
    
    // Calculate X'X (X transpose times X)
    const XtX = [];
    for (let i = 0; i <= p; i++) {
        XtX.push([]);
        for (let j = 0; j <= p; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += X[k][i] * X[k][j];
            }
            XtX[i].push(sum);
        }
    }
    
    // Calculate X'y (X transpose times y)
    const Xty = [];
    for (let i = 0; i <= p; i++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
            sum += X[k][i] * y[k];
        }
        Xty.push(sum);
    }
    
    // Generate detailed XtX calculation steps
    let xtxDetails = '';
    for (let i = 0; i <= p; i++) {
        for (let j = 0; j <= p; j++) {
            const terms = [];
            for (let k = 0; k < n; k++) {
                terms.push(`(${X[k][i]} × ${X[k][j]})`);
            }
            xtxDetails += `<div class="s-72ef09">
                <strong>(X<sup>T</sup>X)<sub>${i+1},${j+1}</sub></strong> = ${terms.join(' + ')} = ${XtX[i][j].toFixed(2)}
            </div>`;
        }
    }
    
    // Generate detailed Xty calculation steps
    let xtyDetails = '';
    for (let i = 0; i <= p; i++) {
        const terms = [];
        for (let k = 0; k < n; k++) {
            terms.push(`(${X[k][i]} × ${y[k]})`);
        }
        xtyDetails += `<div class="s-72ef09">
            <strong>(X<sup>T</sup>y)<sub>${i+1}</sub></strong> = ${terms.join(' + ')} = ${Xty[i].toFixed(2)}
        </div>`;
    }
    
    // Calculate inverse of XtX with detailed steps
    function matrixInverseWithSteps(matrix, stepCallback) {
        const size = matrix.length;
        const matrixScale = Math.max(1, ...matrix.map(r => Math.max(...r.map(Math.abs))));   // pivots are judged relative to the data scale
        // Create augmented matrix [A|I]
        const augmented = [];
        for (let i = 0; i < size; i++) {
            augmented.push([...matrix[i]]);
            for (let j = 0; j < size; j++) {
                augmented[i].push(i === j ? 1 : 0);
            }
        }
        
        let stepLog = '<div class="s-9fdf0e">';
        
        // Gaussian elimination
        for (let i = 0; i < size; i++) {
            // Find pivot
            let maxRow = i;
            for (let k = i + 1; k < size; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            
            if (maxRow !== i) {
                [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
                stepLog += `<div class="s-c4e3d2">↔️ Swap row ${i+1} with row ${maxRow+1}</div>`;
            }
            
            // Make diagonal 1
            const pivot = augmented[i][i];
            if (Math.abs(pivot) < 1e-10 * matrixScale) {
                throw Object.assign(new Error("Matrix is singular, cannot compute inverse"), { kind: "pivot" });
            }
            
            stepLog += `<div class="s-a08134">📐 Make pivot at (${i+1},${i+1}) = 1: Divide row ${i+1} by ${pivot.toFixed(4)}</div>`;
            for (let j = 0; j < 2 * size; j++) {
                augmented[i][j] /= pivot;
            }
            
            // Eliminate other rows
            for (let k = 0; k < size; k++) {
                if (k !== i) {
                    const factor = augmented[k][i];
                    if (Math.abs(factor) > 1e-10) {
                        stepLog += `<div class="s-a08134">➖ Eliminate column ${i+1} in row ${k+1}: R${k+1} ← R${k+1} - ${factor.toFixed(4)} × R${i+1}</div>`;
                        for (let j = 0; j < 2 * size; j++) {
                            augmented[k][j] -= factor * augmented[i][j];
                        }
                    }
                }
            }
        }
        
        // Condition number (1-norm) of X'X: near-collinear predictors make the coefficients unstable
        const norm1 = m => Math.max(...m[0].map((_, j) => m.reduce((sum, row) => sum + Math.abs(row[j]), 0)));
        const inv = augmented.map(row => row.slice(size));
        const cond = norm1(matrix) * norm1(inv);
        if (cond > 1e12) {
            throw Object.assign(new Error(`X'X is numerically singular (condition number ≈ ${cond.toExponential(1)})`), { kind: "condition" });
        }
        if (cond > 1e6) {
            stepLog += `<div class="s-847a0d">⚠️ Near-collinearity: the condition number of X'X is ≈ ${cond.toExponential(1)} (a different yardstick from the VIF: it is the matrix's overall sensitivity, so it can be high while every single VIF is below 10 when predictors are on very different scales). Two or more predictors may be almost linearly dependent, so individual coefficients may be unreliable even though the fit looks fine. Consider removing or combining correlated predictors (see VIF).</div>`;
        }
        
        stepLog += '</div>';
        if (stepCallback) stepCallback(stepLog);
        
        // Extract inverse
        const inverse = [];
        for (let i = 0; i < size; i++) {
            inverse.push(augmented[i].slice(size));
        }
        return inverse;
    }
    
    // Calculate coefficients: β = (X'X)⁻¹ X'y
    let coefficients;
    let failure = null;
    let inverseSteps = '';
    let XtX_inv;
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">📊</span>
                <h2 class="s-f8a94d">Multiple Linear Regression</h2>
            </div>
            <p class="s-259079">Formula: ŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ</p>
            <p class="s-20a400">Estimates the linear relationship between multiple predictors and one outcome</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-9f129a gen-grid gen-grid-many">
                <div class="s-63afdf">
                    <div class="s-137d30">Observations (n)</div>
                    <div class="s-c2434f">${n}</div>
                </div>
                <div class="s-63afdf">
                    <div class="s-137d30">Predictors (k)</div>
                    <div class="s-c2434f">${p}</div>
                </div>
                <div class="s-63afdf">
                    <div class="s-137d30">Mean of Y (ȳ)</div>
                    <div class="s-2ba433">${yMean.toFixed(4)}</div>
                </div>
            </div>
            
            <h4 class="s-eea75b">Input Data</h4>
            <div class="s-01a9b9">
                <table class="s-897d74 gen-sized">
                    <thead><tr class="s-e7b83b">
                        <th class="s-939795">Obs</th>
                        <th class="s-939795">Y</th>
                        ${Array(p).fill().map((_, j) => `<th class="s-939795">X<sub>${j+1}</sub></th>`).join('')}
                       </tr></thead>
                    <tbody>
                        ${dataMatrix.map((row, i) => `<tr class="s-00049c">
                            <td class="s-a7c3f4">${i+1}</td>
                            ${row.map(val => `<td class="s-a7c3f4">${val}</td>`).join('')}
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">📐 Step 1: The Regression Equation</h3>
            <div class="s-6025fc">
                <p>The multiple linear regression model is written as:</p>
                <div class="s-dc84cb">
                    <strong>y = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ + ε</strong>
                </div>
                <p>The goal is to find β coefficients that minimize the sum of squared errors: <strong>Σ(yᵢ - ŷᵢ)²</strong></p>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🧮 Step 2: Matrix Formulation</h3>
            ${centred ? `<div class="s-03c7e3">ℹ️ Numerical stability: the predictors ${shift.map((v, j) => v !== 0 ? 'X' + (j + 1) + ' (mean ' + +v.toFixed(6) + ')' : null).filter(Boolean).join(', ')} are far from 0 relative to their spread, so the matrices below use the centred values (x − mean). The intercept is converted back to the original scale in the result; the slopes are the same either way.</div>` : ''}
            <div class="s-6025fc">
                <p>For all n observations, we write the system in matrix form:</p>
                <div class="s-dc84cb">
                    <strong>y = Xβ + ε</strong>
                </div>
                
                <h4 class="s-cb85f3">Design Matrix X (with intercept column):</h4>
                <div class="s-38dd74">
                    X = 
                    <table class="s-1fe640">
                        ${X.map(row => `<tr>${row.map(val => `<td class="s-ae9ee2">${val}</td>`).join('')}</tr>`).join('')}
                    </table>
                </div>
                
                <h4 class="s-cb85f3">Y vector:</h4>
                <div class="s-ab1ee9">
                    y = [${y.join(', ')}]<sup>T</sup>
                </div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">⚙️ Step 3: Solving for β (Normal Equation)</h3>
            <div class="s-6025fc">
                <p>The OLS estimator is:</p>
                <div class="s-dc84cb">
                    <strong>β = (X<sup>T</sup>X)<sup>-1</sup> X<sup>T</sup>y</strong>
                </div>
                
                <h4 class="s-cb85f3">Step 3.1: Calculate X<sup>T</sup>X (the moment matrix)</h4>
                <div class="s-65e8e0">
                    <div class="s-9506eb">📝 Detailed Calculation:</div>
                    ${xtxDetails}
                </div>
                <div class="s-70ea45">
                    <div class="s-c34ee8">Result: X<sup>T</sup>X${centred ? ' (of the centred predictors)' : ''} = </div>
                    <table class="s-db1a34">
                        ${Array(p+1).fill().map((_, i) => `<tr>${Array(p+1).fill().map((_, j) => `<td class="s-d58239">${XtX[i][j].toFixed(2)}</td>`).join('')}</tr>`).join('')}
                    </table>
                </div>
                
                <h4 class="s-cb85f3">Step 3.2: Calculate X<sup>T</sup>y</h4>
                <div class="s-65e8e0">
                    <div class="s-9506eb">📝 Detailed Calculation:</div>
                    ${xtyDetails}
                </div>
                <div class="s-7db613">
                    <div class="s-1a4440">
                        X<sup>T</sup>y = [${Xty.map(v => v.toFixed(2)).join(', ')}]<sup>T</sup>
                    </div>
                </div>`;
    
    try {
        XtX_inv = matrixInverseWithSteps(XtX, (stepLog) => {
            inverseSteps = stepLog;
        });
        
        // Calculate coefficients with detailed steps
        coefficients = [];
        let coeffDetails = '';
        for (let i = 0; i <= p; i++) {
            let sum = 0;
            const terms = [];
            for (let j = 0; j <= p; j++) {
                const product = XtX_inv[i][j] * Xty[j];
                sum += product;
                terms.push(`(${XtX_inv[i][j].toFixed(4)} × ${Xty[j].toFixed(2)})`);
            }
            coefficients.push(sum);
            coeffDetails += `<div class="s-a08134">
                <strong>β<sub>${i}</sub></strong> = ${terms.join(' + ')} = ${sum.toFixed(6)}
            </div>`;
        }
        if (centred) {
            // β₀ for the original x: ȳ-form intercept minus the slopes times the amounts the predictors were shifted by
            const centredIntercept = coefficients[0];
            coefficients[0] = centredIntercept - shift.reduce((sum, v, jx) => sum + coefficients[jx + 1] * v, 0);
            coeffDetails += `<div class="s-c4e3d2">Intercept converted back to the original scale: β₀ = ${centredIntercept.toFixed(6)} − Σ βⱼ × (shift of Xⱼ) = ${coefficients[0].toFixed(6)}</div>`;
        }
        
        steps += `
                <h4 class="s-cb85f3">Step 3.3: Calculate (X<sup>T</sup>X)<sup>-1</sup> using Gaussian Elimination</h4>
                <div class="s-f573c2">
                    <details open>
                        <summary class="s-ba392c">🔍 Click to see matrix inversion steps</summary>
                        ${inverseSteps}
                    </details>
                    <div class="s-417688">
                        <div class="s-c34ee8">Result: (X<sup>T</sup>X)<sup>-1</sup>${centred ? ' (of the centred predictors)' : ''} = </div>
                        <table class="s-db1a34">
                            ${Array(p+1).fill().map((_, i) => `<tr>${Array(p+1).fill().map((_, j) => `<td class="s-d58239">${XtX_inv[i][j].toFixed(4)}</td>`).join('')}</tr>`).join('')}
                        </table>
                    </div>
                </div>
                
                <h4 class="s-cb85f3">Step 3.4: Calculate β = (X<sup>T</sup>X)<sup>-1</sup> X<sup>T</sup>y</h4>
                <div class="s-65e8e0">
                    <div class="s-9506eb">📝 Detailed Coefficient Calculation:</div>
                    ${coeffDetails}
                </div>
                <div class="s-328229">
                    <div class="s-75073d">Results:</div>
                    <div class="s-ba57d6">
                        β₀ (intercept) = ${coefficients[0].toFixed(6)}<br>
                        ${Array(p).fill().map((_, j) => `β<sub>${j+1}</sub> = ${coefficients[j+1].toFixed(6)}`).join('<br>')}
                    </div>
                </div>`;
                
    } catch (error) {
        // say what actually went wrong: an exactly dependent predictor, or a design that is only numerically ill-conditioned
        const failureAdvice = error.kind === "condition"
            ? "The design is numerically ill-conditioned: two or more predictors are almost linearly dependent, the predictors are on very different scales, or there are barely more observations than parameters (n is close to p + 1). Remove or combine highly correlated predictors (see VIF), rescale the predictors, or add more observations."
            : "At least one predictor is an exact copy or linear combination of the others (perfect multicollinearity), or there are fewer observations than parameters. Remove or combine the redundant predictor, or add more observations.";
        steps += `
                <div class="s-a1c250">
                    ⚠️ Cannot compute coefficients: ${error.message}. ${failureAdvice}
                </div>
            </div>
        </div>`;
        coefficients = null;
        failure = error.message;
    }
    
    // Generate regression equation
    if (coefficients) {
        let equation = `ŷ = ${coefficients[0].toFixed(4)}`;
        for (let j = 0; j < p; j++) {
            const sign = coefficients[j+1] >= 0 ? '+' : '-';
            equation += ` ${sign} ${Math.abs(coefficients[j+1]).toFixed(4)}·x<sub>${j+1}</sub>`;
        }
        
        steps += `
        <div class="s-8ec84a gen-pad">
            <h3 class="s-c7f0b4">📈 Step 4: The Final Regression Equation</h3>
            <div class="s-c0f296">
                ${equation}
            </div>
            <div class="s-c803e1">
                <h4>📖 Interpretation:</h4>
                <ul class="s-117dd0">
                    <li><strong>β₀ = ${coefficients[0].toFixed(4)}</strong>: When all predictors are 0, the predicted Y is ${coefficients[0].toFixed(4)}</li>
                    ${Array(p).fill().map((_, j) => `<li><strong>β<sub>${j+1}</sub> = ${coefficients[j+1].toFixed(4)}</strong>: For each 1-unit increase in x<sub>${j+1}</sub>, Y changes by ${coefficients[j+1].toFixed(4)} units, holding other predictors constant</li>`).join('')}
                </ul>
            </div>
        </div>`;
    }
    
    steps += `
        <div class="s-4ee81e gen-pad">
            <h3 class="s-c7f0b4">📌 Key Assumptions of Multiple Regression</h3>
            <ul>
                <li><strong>Linearity:</strong> The relationship between predictors and outcome is linear</li>
                <li><strong>Independence:</strong> Observations are independent of each other</li>
                <li><strong>Homoscedasticity:</strong> Constant variance of residuals</li>
                <li><strong>Normality:</strong> Residuals are normally distributed</li>
                <li><strong>No perfect multicollinearity:</strong> Predictors are not perfectly correlated</li>
            </ul>
            <div class="s-8d2e44">
                💡 <strong>Note:</strong> The quality of the regression model should be assessed using R², adjusted R², F-test, and residual diagnostics.
            </div>
        </div>
    </div>`;
    
    return { 
        // set when X'X cannot be inverted: the tile must report the failure, with the explanation kept in `steps`
        ...(failure ? { error: true, message: `Cannot compute coefficients: ${failure}.` } : {}),
        steps, 
        n, 
        p, 
        yMean,
        coefficients: coefficients,
        centred,                       // true: XtX / XtX_inv / Xty are for the centred predictors (the coefficients are converted back)
        XtX: XtX,
        Xty: Xty,
        XtX_inv: XtX_inv,
        equation: coefficients ? `ŷ = ${coefficients[0].toFixed(4)} + ${coefficients.slice(1).map((c, i) => `${c.toFixed(4)}·x${i+1}`).join(' + ')}` : null
    };
}

function setupMultipleLinearLogic() {
    const computeBtn = document.getElementById("multipleLinearComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("multipleData").value;
        const lines = raw.trim().split(/\r?\n/);
        let dataMatrix = [];
        
        // Skip header row if present
        let startRow = 0;
        if (lines.length > 0 && lines[0].toLowerCase().includes('y') && lines[0].toLowerCase().includes('x')) {
            startRow = 1;
        }
        
        for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") continue;
            const values = parseNumbersFromInput(line);
            if (values.length > 0) {
                dataMatrix.push(values);
            }
        }
        
        const resultDiv = document.getElementById("multipleLinearResultArea");
        const valueSpan = document.getElementById("multipleLinearValueDisplay");
        const stepsSpan = document.getElementById("multipleLinearStepsDisplay");
        
        if (dataMatrix.length === 0) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in the correct format.");
            return;
        }
        
        const result = computeMultipleLinearRegression(dataMatrix);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.steps || result.message);
        } else {
            setHtml(valueSpan, `${result.n} observations, ${result.p} predictors | Mean Y = ${result.yMean.toFixed(4)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("multipleLinearClearBtn", ["multipleData"], "multipleLinearResultArea");
}
