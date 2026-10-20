// Worked-solution HTML for computeMultipleLinearRegression (split out of multiple-linear.js): each function receives the values the calculation produced.

function stepsHtmlMultipleLinearAssumptions(scope) {
    return `
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
}

function stepsHtmlMultipleLinearEquation(scope) {
    const { coefficients, equation, p, x } = scope;
        return `
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

function stepsHtmlMultipleLinearSolution(scope) {
    const { X, XtX_inv, centred, coeffDetails, coefficients, inverseSteps, p, y } = scope;
        return `
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
}

function stepsHtmlMultipleLinearSetup(scope) {
    const { X, XtX, Xty, centred, coefficients, dataMatrix, n, p, shift, x, xtxDetails, xtyDetails, y, yMean } = scope;
    return `<div class="s-9217e5">
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
}
