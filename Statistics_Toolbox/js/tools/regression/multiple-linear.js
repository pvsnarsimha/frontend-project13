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
    
    // Build design matrix X (with column of 1's for intercept)
    const X = [];
    for (let i = 0; i < n; i++) {
        const row = [1]; // intercept term
        for (let j = 0; j < p; j++) {
            row.push(x[i][j]);
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
            xtxDetails += `<div style="margin: 8px 0; font-size: 13px;">
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
        xtyDetails += `<div style="margin: 8px 0; font-size: 13px;">
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
        
        let stepLog = '<div style="font-size: 13px;">';
        
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
                stepLog += `<div style="margin: 8px 0; color: #856404;">↔️ Swap row ${i+1} with row ${maxRow+1}</div>`;
            }
            
            // Make diagonal 1
            const pivot = augmented[i][i];
            if (Math.abs(pivot) < 1e-10 * matrixScale) {
                throw new Error("Matrix is singular, cannot compute inverse");
            }
            
            stepLog += `<div style="margin: 8px 0;">📐 Make pivot at (${i+1},${i+1}) = 1: Divide row ${i+1} by ${pivot.toFixed(4)}</div>`;
            for (let j = 0; j < 2 * size; j++) {
                augmented[i][j] /= pivot;
            }
            
            // Eliminate other rows
            for (let k = 0; k < size; k++) {
                if (k !== i) {
                    const factor = augmented[k][i];
                    if (Math.abs(factor) > 1e-10) {
                        stepLog += `<div style="margin: 8px 0;">➖ Eliminate column ${i+1} in row ${k+1}: R${k+1} ← R${k+1} - ${factor.toFixed(4)} × R${i+1}</div>`;
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
            throw new Error(`X'X is numerically singular (condition number ≈ ${cond.toExponential(1)})`);
        }
        if (cond > 1e6) {
            stepLog += `<div style="margin: 8px 0; padding: 8px 12px; background: #fff3cd; border-radius: 6px; color: #856404;">⚠️ Near-collinearity: the condition number of X'X is ≈ ${cond.toExponential(1)}. Two or more predictors are almost linearly dependent, so individual coefficients may be unreliable even though the fit looks fine. Consider removing or combining correlated predictors (see VIF).</div>`;
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
    let inverseSteps = '';
    let XtX_inv;
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📊</span>
                <h2 style="margin: 0;">Multiple Linear Regression</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: ŷ = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Estimates the linear relationship between multiple predictors and one outcome</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px;">Observations (n)</div>
                    <div style="font-size: 24px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px;">Predictors (k)</div>
                    <div style="font-size: 24px; font-weight: 700;">${p}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px;">Mean of Y (ȳ)</div>
                    <div style="font-size: 18px;">${yMean.toFixed(4)}</div>
                </div>
            </div>
            
            <h4 style="margin: 16px 0 8px 0;">Input Data</h4>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 8px;">Obs</th>
                        <th style="padding: 8px;">Y</th>
                        ${Array(p).fill().map((_, j) => `<th style="padding: 8px;">X<sub>${j+1}</sub></th>`).join('')}
                       </tr></thead>
                    <tbody>
                        ${dataMatrix.map((row, i) => `<tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 8px; text-align: center;">${i+1}</td>
                            ${row.map(val => `<td style="padding: 8px; text-align: center;">${val}</td>`).join('')}
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step 1: The Regression Equation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p>The multiple linear regression model is written as:</p>
                <div style="background: #f0f4f8; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin: 12px 0;">
                    <strong>y = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ + ε</strong>
                </div>
                <p>The goal is to find β coefficients that minimize the sum of squared errors: <strong>Σ(yᵢ - ŷᵢ)²</strong></p>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🧮 Step 2: Matrix Formulation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p>For all n observations, we write the system in matrix form:</p>
                <div style="background: #f0f4f8; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin: 12px 0;">
                    <strong>y = Xβ + ε</strong>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Design Matrix X (with intercept column):</h4>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; overflow-x: auto; font-family: monospace;">
                    X = 
                    <table style="display: inline-table; border-collapse: collapse; margin-left: 10px;">
                        ${X.map(row => `<tr>${row.map(val => `<td style="padding: 4px 8px; border: 1px solid #dee2e6;">${val}</td>`).join('')}</tr>`).join('')}
                    </table>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Y vector:</h4>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-family: monospace;">
                    y = [${y.join(', ')}]<sup>T</sup>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">⚙️ Step 3: Solving for β (Normal Equation)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p>The OLS estimator is:</p>
                <div style="background: #f0f4f8; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin: 12px 0;">
                    <strong>β = (X<sup>T</sup>X)<sup>-1</sup> X<sup>T</sup>y</strong>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Step 3.1: Calculate X<sup>T</sup>X (the moment matrix)</h4>
                <div style="background: #fff8e1; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <div style="font-weight: bold; margin-bottom: 12px;">📝 Detailed Calculation:</div>
                    ${xtxDetails}
                </div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 12px; overflow-x: auto;">
                    <div style="font-family: monospace; font-size: 14px; font-weight: bold;">Result: X<sup>T</sup>X = </div>
                    <table style="border-collapse: collapse; margin-top: 8px;">
                        ${Array(p+1).fill().map((_, i) => `<tr>${Array(p+1).fill().map((_, j) => `<td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">${XtX[i][j].toFixed(2)}</td>`).join('')}</tr>`).join('')}
                    </table>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Step 3.2: Calculate X<sup>T</sup>y</h4>
                <div style="background: #fff8e1; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <div style="font-weight: bold; margin-bottom: 12px;">📝 Detailed Calculation:</div>
                    ${xtyDetails}
                </div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <div style="font-family: monospace;">
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
            coeffDetails += `<div style="margin: 8px 0;">
                <strong>β<sub>${i}</sub></strong> = ${terms.join(' + ')} = ${sum.toFixed(6)}
            </div>`;
        }
        
        steps += `
                <h4 style="margin: 20px 0 10px 0;">Step 3.3: Calculate (X<sup>T</sup>X)<sup>-1</sup> using Gaussian Elimination</h4>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                    <details open>
                        <summary style="cursor: pointer; font-weight: bold; margin-bottom: 12px;">🔍 Click to see matrix inversion steps</summary>
                        ${inverseSteps}
                    </details>
                    <div style="margin-top: 16px; overflow-x: auto;">
                        <div style="font-family: monospace; font-size: 14px; font-weight: bold;">Result: (X<sup>T</sup>X)<sup>-1</sup> = </div>
                        <table style="border-collapse: collapse; margin-top: 8px;">
                            ${Array(p+1).fill().map((_, i) => `<tr>${Array(p+1).fill().map((_, j) => `<td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: center;">${XtX_inv[i][j].toFixed(4)}</td>`).join('')}</tr>`).join('')}
                        </table>
                    </div>
                </div>
                
                <h4 style="margin: 20px 0 10px 0;">Step 3.4: Calculate β = (X<sup>T</sup>X)<sup>-1</sup> X<sup>T</sup>y</h4>
                <div style="background: #fff8e1; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <div style="font-weight: bold; margin-bottom: 12px;">📝 Detailed Coefficient Calculation:</div>
                    ${coeffDetails}
                </div>
                <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <div style="font-family: monospace; font-size: 16px; font-weight: bold;">Results:</div>
                    <div style="font-family: monospace; margin-top: 8px;">
                        β₀ (intercept) = ${coefficients[0].toFixed(6)}<br>
                        ${Array(p).fill().map((_, j) => `β<sub>${j+1}</sub> = ${coefficients[j+1].toFixed(6)}`).join('<br>')}
                    </div>
                </div>`;
                
    } catch (error) {
        steps += `
                <div style="background: #f8d7da; border-radius: 8px; padding: 12px; color: #721c24;">
                    ⚠️ Cannot compute coefficients: ${error.message}. At least one predictor is an exact copy or linear combination of the others (perfect multicollinearity), or there are fewer observations than parameters. Remove or combine the redundant predictor, or add more observations.
                </div>`;
        coefficients = null;
    }
    
    // Generate regression equation
    if (coefficients) {
        let equation = `ŷ = ${coefficients[0].toFixed(4)}`;
        for (let j = 0; j < p; j++) {
            const sign = coefficients[j+1] >= 0 ? '+' : '-';
            equation += ` ${sign} ${Math.abs(coefficients[j+1]).toFixed(4)}·x<sub>${j+1}</sub>`;
        }
        
        steps += `
        <div style="border-radius: 16px; padding: 20px; margin-top: 24px; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-left: 6px solid #28a745;">
            <h3 style="margin: 0 0 12px 0;">📈 Step 4: The Final Regression Equation</h3>
            <div style="background: white; border-radius: 8px; padding: 16px; text-align: center; font-size: 18px; font-family: monospace;">
                ${equation}
            </div>
            <div style="margin-top: 16px;">
                <h4>📖 Interpretation:</h4>
                <ul style="margin: 8px 0;">
                    <li><strong>β₀ = ${coefficients[0].toFixed(4)}</strong>: When all predictors are 0, the predicted Y is ${coefficients[0].toFixed(4)}</li>
                    ${Array(p).fill().map((_, j) => `<li><strong>β<sub>${j+1}</sub> = ${coefficients[j+1].toFixed(4)}</strong>: For each 1-unit increase in x<sub>${j+1}</sub>, Y changes by ${coefficients[j+1].toFixed(4)} units, holding other predictors constant</li>`).join('')}
                </ul>
            </div>
        </div>`;
    }
    
    steps += `
        <div style="border-radius: 16px; padding: 20px; margin-top: 24px; background: #fff3cd; border-left: 6px solid #ffc107;">
            <h3 style="margin: 0 0 12px 0;">📌 Key Assumptions of Multiple Regression</h3>
            <ul>
                <li><strong>Linearity:</strong> The relationship between predictors and outcome is linear</li>
                <li><strong>Independence:</strong> Observations are independent of each other</li>
                <li><strong>Homoscedasticity:</strong> Constant variance of residuals</li>
                <li><strong>Normality:</strong> Residuals are normally distributed</li>
                <li><strong>No perfect multicollinearity:</strong> Predictors are not perfectly correlated</li>
            </ul>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Note:</strong> The quality of the regression model should be assessed using R², adjusted R², F-test, and residual diagnostics.
            </div>
        </div>
    </div>`;
    
    return { 
        steps, 
        n, 
        p, 
        yMean,
        coefficients: coefficients,
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
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `${result.n} observations, ${result.p} predictors | Mean Y = ${result.yMean.toFixed(4)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    const clearBtn = document.getElementById("multipleLinearClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("multipleData").value = '';
            document.getElementById("multipleLinearResultArea").style.display = 'none';
        });
    }
}
