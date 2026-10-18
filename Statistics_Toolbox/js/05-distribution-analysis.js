/* Distribution fitting, expectation, variance, MGF, PMF, survival, entropy, partial correlation */
// ========== FIT DISTRIBUTION (MLE) RENDER FUNCTION ==========
function renderFitDistributionInterface() {
    return `
        <div class="stat-interface" id="statFitDistributionInterface">
            <div class="interface-title">📐 Fit Distribution Parameters (Maximum Likelihood Estimation)</div>
            <div class="formula-card">
                <div class="formula">📌 MLE finds parameters that maximize the likelihood function L(θ|x)</div>
                <div class="desc">Estimate distribution parameters from your data using Maximum Likelihood Estimation. Supports Normal, Exponential, and Uniform distributions.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter your data values (comma, space, or line separated):</label>
                <textarea id="fitDataInput" rows="4" placeholder="Example: 12.5, 15.3, 14.8, 16.2, 13.9, 15.1, 14.5, 15.7"></textarea>
                
                <label style="margin-top: 15px;">📊 Select Distribution to Fit:</label>
                <select id="fitDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution (Gaussian)</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="fitComputeBtn">📐 Fit Distribution + Full Steps</button>
                    <button class="secondary-btn" id="fitClearBtn">Clear</button>
                </div>
            </div>
            <div id="fitResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MLE PARAMETER ESTIMATES</div>
                    <div class="result-value" id="fitValueDisplay">—</div>
                    <div class="calculation-steps" id="fitStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== EXPECTED VALUE RENDER FUNCTION ==========
function renderExpectedValueInterface() {
    return `
        <div class="stat-interface" id="statExpectedValueInterface">
            <div class="interface-title">📊 Expected Value E[X] (Mean of Distribution)</div>
            <div class="formula-card">
                <div class="formula">📌 E[X] = ∫ x·f(x) dx (continuous) or Σ x·P(X=x) (discrete)</div>
                <div class="desc">The expected value is the theoretical mean of a probability distribution.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="expectedDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="beta">Beta Distribution</option>
                    <option value="poisson">Poisson Distribution (Discrete)</option>
                    <option value="binomial">Binomial Distribution (Discrete)</option>
                </select>
                
                <div id="expectedParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="expectedComputeBtn">📊 Calculate Expected Value + Steps</button>
                    <button class="secondary-btn" id="expectedClearBtn">Clear</button>
                </div>
            </div>
            <div id="expectedResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 EXPECTED VALUE E[X]</div>
                    <div class="result-value" id="expectedValueDisplay">—</div>
                    <div class="calculation-steps" id="expectedStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== DISTRIBUTION VARIANCE RENDER FUNCTION ==========
function renderDistributionVarianceInterface() {
    return `
        <div class="stat-interface" id="statDistributionVarianceInterface">
            <div class="interface-title">📏 Variance Var[X] of Distribution</div>
            <div class="formula-card">
                <div class="formula">📌 Var[X] = E[(X - μ)²] = E[X²] - (E[X])²</div>
                <div class="desc">Variance measures the spread of a distribution around its mean.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="varianceDistDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="beta">Beta Distribution</option>
                    <option value="poisson">Poisson Distribution (Discrete)</option>
                    <option value="binomial">Binomial Distribution (Discrete)</option>
                </select>
                
                <div id="varianceDistParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="varianceDistComputeBtn">📏 Calculate Variance + Steps</button>
                    <button class="secondary-btn" id="varianceDistClearBtn">Clear</button>
                </div>
            </div>
            <div id="varianceDistResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 VARIANCE Var[X]</div>
                    <div class="result-value" id="varianceDistValueDisplay">—</div>
                    <div class="calculation-steps" id="varianceDistStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== MOMENT GENERATING FUNCTION RENDER FUNCTION ==========
function renderMGFInterface() {
    return `
        <div class="stat-interface" id="statMGFInterface">
            <div class="interface-title">🔢 Moment Generating Function M_X(t) = E[e^{tX}]</div>
            <div class="formula-card">
                <div class="formula">📌 M_X(t) = E[e^{tX}] = Σ e^{tx}·P(X=x) or ∫ e^{tx}·f(x) dx</div>
                <div class="desc">The MGF uniquely determines the distribution and generates moments via derivatives.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="mgfDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="poisson">Poisson Distribution</option>
                    <option value="binomial">Binomial Distribution</option>
                </select>
                
                <div id="mgfParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <label>📊 t value (for evaluating MGF):</label>
                <input type="number" id="mgfTValue" value="0.5" step="0.1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                <div class="desc" style="font-size: 0.75rem;">Note: MGF exists only for t in certain interval</div>
                
                <div class="action-row">
                    <button class="primary-btn" id="mgfComputeBtn">🔢 Calculate MGF + Steps</button>
                    <button class="secondary-btn" id="mgfClearBtn">Clear</button>
                </div>
            </div>
            <div id="mgfResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MOMENT GENERATING FUNCTION</div>
                    <div class="result-value" id="mgfValueDisplay">—</div>
                    <div class="calculation-steps" id="mgfStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== SETUP FUNCTIONS FOR NEW FEATURES ==========
function setupFitDistributionLogic() {
    const computeBtn = document.getElementById("fitComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("fitDataInput").value;
        const data = parseNumbersFromInput(raw);
        const distType = document.getElementById("fitDistribution").value;
        const resultDiv = document.getElementById("fitResultArea");
        const valueSpan = document.getElementById("fitValueDisplay");
        const stepsSpan = document.getElementById("fitStepsDisplay");
        
        if (!data.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter numeric data.";
            return;
        }
        
        const result = computeFitDistributionWithSteps(data, distType);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerText = result.message;
        } else {
            if (result.results.type === 'normal') {
                valueSpan.innerHTML = `μ̂ = ${result.results.mean.toFixed(4)} | σ̂ = ${result.results.stdDev.toFixed(4)}`;
            } else if (result.results.type === 'exponential') {
                valueSpan.innerHTML = `λ̂ = ${result.results.rate.toFixed(4)} | Mean = ${result.results.mean.toFixed(4)}`;
            } else if (result.results.type === 'uniform') {
                valueSpan.innerHTML = `â = ${result.results.min.toFixed(4)} | b̂ = ${result.results.max.toFixed(4)}`;
            }
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("fitClearBtn", "fitDataInput", "fitResultArea");
}

function setupExpectedValueLogic() {
    const distSelect = document.getElementById('expectedDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateExpectedParams);
        updateExpectedParams();
    }
    
    const computeBtn = document.getElementById("expectedComputeBtn");
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById("expectedDistribution").value;
            let params = {};
            
            if (dist === 'normal') {
                params.mean = parseFloat(document.getElementById("expectedMean").value);
                params.stdDev = parseFloat(document.getElementById("expectedStd").value);
            } else if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById("expectedRate").value);
            } else if (dist === 'uniform') {
                params.min = parseFloat(document.getElementById("expectedMin").value);
                params.max = parseFloat(document.getElementById("expectedMax").value);
            } else if (dist === 'beta') {
                params.alpha = parseFloat(document.getElementById("expectedAlpha").value);
                params.beta = parseFloat(document.getElementById("expectedBeta").value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById("expectedLambda").value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById("expectedN").value);
                params.p = parseFloat(document.getElementById("expectedP").value);
            }
            
            const result = computeExpectedValueWithSteps(dist, params);
            const resultDiv = document.getElementById("expectedResultArea");
            const valueSpan = document.getElementById("expectedValueDisplay");
            const stepsSpan = document.getElementById("expectedStepsDisplay");
            
            resultDiv.style.display = "block";
            valueSpan.innerHTML = `E[X] = ${result.expectedValue.toFixed(6)}`;
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler("expectedClearBtn", "", "expectedResultArea");
}

function setupDistributionVarianceLogic() {
    const distSelect = document.getElementById('varianceDistDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateVarianceDistParams);
        updateVarianceDistParams();
    }
    
    const computeBtn = document.getElementById("varianceDistComputeBtn");
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById("varianceDistDistribution").value;
            let params = {};
            
            if (dist === 'normal') {
                params.stdDev = parseFloat(document.getElementById("varianceDistStd").value);
            } else if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById("varianceDistRate").value);
            } else if (dist === 'uniform') {
                params.min = parseFloat(document.getElementById("varianceDistMin").value);
                params.max = parseFloat(document.getElementById("varianceDistMax").value);
            } else if (dist === 'beta') {
                params.alpha = parseFloat(document.getElementById("varianceDistAlpha").value);
                params.beta = parseFloat(document.getElementById("varianceDistBeta").value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById("varianceDistLambda").value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById("varianceDistN").value);
                params.p = parseFloat(document.getElementById("varianceDistP").value);
            }
            
            const result = computeDistributionVarianceWithSteps(dist, params);
            const resultDiv = document.getElementById("varianceDistResultArea");
            const valueSpan = document.getElementById("varianceDistValueDisplay");
            const stepsSpan = document.getElementById("varianceDistStepsDisplay");
            
            resultDiv.style.display = "block";
            valueSpan.innerHTML = `Var[X] = ${result.variance.toFixed(6)}`;
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler("varianceDistClearBtn", "", "varianceDistResultArea");
}

function setupMGFLogic() {
    const distSelect = document.getElementById('mgfDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateMGFParams);
        updateMGFParams();
    }
    
    const computeBtn = document.getElementById("mgfComputeBtn");
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById("mgfDistribution").value;
            const t = parseFloat(document.getElementById("mgfTValue").value);
            let params = {};
            
            if (dist === 'normal') {
                params.mean = parseFloat(document.getElementById("mgfMean").value);
                params.stdDev = parseFloat(document.getElementById("mgfStd").value);
            } else if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById("mgfRate").value);
            } else if (dist === 'uniform') {
                params.min = parseFloat(document.getElementById("mgfMin").value);
                params.max = parseFloat(document.getElementById("mgfMax").value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById("mgfLambda").value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById("mgfN").value);
                params.p = parseFloat(document.getElementById("mgfP").value);
            }
            
            const result = computeMGFWithSteps(dist, params, t);
            const resultDiv = document.getElementById("mgfResultArea");
            const valueSpan = document.getElementById("mgfValueDisplay");
            const stepsSpan = document.getElementById("mgfStepsDisplay");
            
            resultDiv.style.display = "block";
            valueSpan.innerHTML = `M_X(${t}) = ${result.mgfValue.toFixed(6)}`;
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler("mgfClearBtn", "", "mgfResultArea");
}
// ========== PARAMETER UPDATE FUNCTIONS ==========
function updateExpectedParams() {
    const dist = document.getElementById('expectedDistribution').value;
    const paramsDiv = document.getElementById('expectedParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Mean (μ):</label>
            <input type="number" id="expectedMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="expectedStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="expectedRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `
            <label>📊 Minimum (a):</label>
            <input type="number" id="expectedMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="expectedMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `
            <label>📊 Alpha (α):</label>
            <input type="number" id="expectedAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="expectedBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'poisson') {
        paramsDiv.innerHTML = `
            <label>📊 Lambda (λ):</label>
            <input type="number" id="expectedLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'binomial') {
        paramsDiv.innerHTML = `
            <label>📊 Number of trials (n):</label>
            <input type="number" id="expectedN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="expectedP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

function updateVarianceDistParams() {
    const dist = document.getElementById('varianceDistDistribution').value;
    const paramsDiv = document.getElementById('varianceDistParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="varianceDistStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="varianceDistRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `
            <label>📊 Minimum (a):</label>
            <input type="number" id="varianceDistMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="varianceDistMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `
            <label>📊 Alpha (α):</label>
            <input type="number" id="varianceDistAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="varianceDistBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'poisson') {
        paramsDiv.innerHTML = `
            <label>📊 Lambda (λ):</label>
            <input type="number" id="varianceDistLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'binomial') {
        paramsDiv.innerHTML = `
            <label>📊 Number of trials (n):</label>
            <input type="number" id="varianceDistN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="varianceDistP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

function updateMGFParams() {
    const dist = document.getElementById('mgfDistribution').value;
    const paramsDiv = document.getElementById('mgfParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Mean (μ):</label>
            <input type="number" id="mgfMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="mgfStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="mgfRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `
            <label>📊 Minimum (a):</label>
            <input type="number" id="mgfMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="mgfMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'poisson') {
        paramsDiv.innerHTML = `
            <label>📊 Lambda (λ):</label>
            <input type="number" id="mgfLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'binomial') {
        paramsDiv.innerHTML = `
            <label>📊 Number of trials (n):</label>
            <input type="number" id="mgfN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="mgfP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}
// ========== FIT DISTRIBUTION (MLE) COMPUTATION - DETAILED ==========
function computeFitDistributionWithSteps(data, distType) {
    if (!data.length) return { error: true, message: "No data provided." };
    if (data.length < 2) return { error: true, message: "Need at least 2 data points for fitting." };
    
    const n = data.length;
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║           MAXIMUM LIKELIHOOD ESTIMATION (MLE) - DETAILED        ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📋 INPUT DATA SUMMARY:\n`;
    steps += `   • Number of observations (n) = ${n}\n`;
    steps += `   • Data points: [${data.map(d => d.toFixed(4)).join(', ')}]\n`;
    steps += `   • Sample mean (x̄) = ${(data.reduce((a,b)=>a+b,0)/n).toFixed(6)}\n`;
    steps += `   • Sample range = ${(Math.max(...data) - Math.min(...data)).toFixed(6)}\n\n`;
    
    let results = {};
    
    if (distType === 'normal') {
        const sum = data.reduce((a,b) => a+b, 0);
        const mean = sum / n;
        const sumSqDiffs = data.reduce((a,b) => a + Math.pow(b - mean, 2), 0);
        const variance = sumSqDiffs / n;
        const stdDev = Math.sqrt(variance);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                    NORMAL DISTRIBUTION MLE                      ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: UNDERSTAND THE NORMAL DISTRIBUTION                     │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   The Normal (Gaussian) distribution has probability density function:\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   1              (x - μ)²                   │\n`;
        steps += `   │      f(x|μ,σ²) = ──────── × exp( ──────── )                  │\n`;
        steps += `   │                  σ√(2π)           2σ²                      │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Where:\n`;
        steps += `   • μ (mu) = population mean (center of distribution)\n`;
        steps += `   • σ (sigma) = population standard deviation (spread)\n`;
        steps += `   • σ² = population variance\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: LIKELIHOOD FUNCTION                                   │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   For independent observations, the likelihood function is the product\n`;
        steps += `   of individual densities:\n\n`;
        steps += `   L(μ,σ²|x₁,...,xₙ) = ∏ f(xᵢ|μ,σ²)\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                     n   1              (xᵢ - μ)²            │\n`;
        steps += `   │      L(μ,σ²) =   ∏   ──────── × exp( ──────── )              │\n`;
        steps += `   │                   i=1 σ√(2π)           2σ²                  │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   This simplifies to:\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    1               Σ(xᵢ - μ)²              │\n`;
        steps += `   │      L(μ,σ²) = ────────── × exp( ────────── )               │\n`;
        steps += `   │                (σ√(2π))ⁿ            2σ²                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: LOG-LIKELIHOOD FUNCTION (Easier to maximize)          │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Taking natural logarithm (ln) converts products to sums:\n\n`;
        steps += `   ℓ(μ,σ²) = ln[L(μ,σ²)]\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                n          n        Σ(xᵢ - μ)²               │\n`;
        steps += `   │      ℓ(μ,σ²) = -─ ln(2π) - ─ ln(σ²) - ──────────            │\n`;
        steps += `   │                2          2            2σ²                  │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: ESTIMATE μ (MEAN) - Take derivative w.r.t μ           │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   ∂ℓ/∂μ = Σ(xᵢ - μ)/σ²\n\n`;
        steps += `   Set derivative = 0 to find maximum:\n`;
        steps += `   Σ(xᵢ - μ̂) = 0\n`;
        steps += `   Σxᵢ - n·μ̂ = 0\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                       Σxᵢ                                   │\n`;
        steps += `   │              μ̂ = ──────  (Sample Mean)                      │\n`;
        steps += `   │                        n                                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `   Now substitute our actual values:\n`;
        steps += `   Σxᵢ = ${data.map(x => x).join(' + ')} = ${sum}\n`;
        steps += `   n = ${n}\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    ${sum}                                      │\n`;
        steps += `   │           μ̂ = ────── = ${mean.toFixed(8)}                    │\n`;
        steps += `   │                     ${n}                                      │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: ESTIMATE σ² (VARIANCE) - Take derivative w.r.t σ²     │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   ∂ℓ/∂σ² = -n/(2σ²) + Σ(xᵢ - μ)²/(2σ⁴)\n\n`;
        steps += `   Set derivative = 0 and solve:\n`;
        steps += `   -n/(2σ̂²) + Σ(xᵢ - μ̂)²/(2σ̂⁴) = 0\n`;
        steps += `   Multiply by 2σ̂⁴: -n·σ̂² + Σ(xᵢ - μ̂)² = 0\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    Σ(xᵢ - μ̂)²                               │\n`;
        steps += `   │              σ̂² = ──────────  (MLE Variance)                │\n`;
        steps += `   │                        n                                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `   Calculate squared deviations (xᵢ - μ̂)²:\n`;
        steps += `   ┌──────┬──────────┬────────────────┬──────────────────────┐\n`;
        steps += `   │  i   │   xᵢ     │   xᵢ - μ̂       │   (xᵢ - μ̂)²          │\n`;
        steps += `   ├──────┼──────────┼────────────────┼──────────────────────┤\n`;
        data.forEach((x, i) => {
            const diff = x - mean;
            steps += `   │  ${i+1}   │ ${x.toFixed(4)}    │ ${diff.toFixed(6)}    │ ${(diff*diff).toFixed(8)}    │\n`;
        });
        steps += `   └──────┴──────────┴────────────────┴──────────────────────┘\n\n`;
        steps += `   Σ(xᵢ - μ̂)² = ${sumSqDiffs.toFixed(8)}\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │           ${sumSqDiffs.toFixed(6)}                              │\n`;
        steps += `   │    σ̂² = ────────── = ${variance.toFixed(8)}                  │\n`;
        steps += `   │                ${n}                                          │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │    σ̂ = √σ̂² = √${variance.toFixed(6)} = ${stdDev.toFixed(8)}    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 6: MAXIMUM LOG-LIKELIHOOD VALUE                           │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Substitute estimates back into log-likelihood:\n\n`;
        steps += `   ℓ_max = -${n}/2 × ln(2π) - ${n}/2 × ln(${variance.toFixed(6)}) - ${sumSqDiffs.toFixed(6)}/(2×${variance.toFixed(6)})\n`;
        const logLikelihood = -n/2 * Math.log(2 * Math.PI * variance) - sumSqDiffs/(2 * variance);
        steps += `   ℓ_max = ${logLikelihood.toFixed(8)}\n\n`;
        
        results = { type: 'normal', mean, variance, stdDev, logLikelihood, n };
        
    } else if (distType === 'exponential') {
        const sum = data.reduce((a,b) => a+b, 0);
        const mean = sum / n;
        const rate = 1 / mean;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                  EXPONENTIAL DISTRIBUTION MLE                    ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: UNDERSTAND THE EXPONENTIAL DISTRIBUTION                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   The Exponential distribution has probability density function:\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                                                             │\n`;
        steps += `   │      f(x|λ) = λ·e^{-λx}    for x ≥ 0, λ > 0                │\n`;
        steps += `   │                                                             │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Where λ (lambda) = rate parameter\n`;
        steps += `   • Mean = 1/λ\n`;
        steps += `   • Variance = 1/λ²\n`;
        steps += `   • Used to model waiting times, inter-arrival times\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: LIKELIHOOD FUNCTION                                   │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   For independent observations:\n\n`;
        steps += `   L(λ|x₁,...,xₙ) = ∏ λ·e^{-λxᵢ}\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                                                             │\n`;
        steps += `   │      L(λ) = λⁿ × exp(-λ Σxᵢ)                               │\n`;
        steps += `   │                                                             │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `   Substituting our values:\n`;
        steps += `   Σxᵢ = ${data.map(x => x).join(' + ')} = ${sum}\n`;
        steps += `   n = ${n}\n\n`;
        steps += `   L(λ) = λ^${n} × e^(-λ × ${sum})\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: LOG-LIKELIHOOD FUNCTION                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Taking natural logarithm:\n\n`;
        steps += `   ℓ(λ) = ln(L(λ)) = ln(λⁿ) + ln(e^{-λ Σxᵢ})\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                                                             │\n`;
        steps += `   │      ℓ(λ) = n·ln(λ) - λ·Σxᵢ                               │\n`;
        steps += `   │                                                             │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   ℓ(λ) = ${n}·ln(λ) - λ·${sum}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: FIND MLE BY TAKING DERIVATIVE                         │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Take derivative with respect to λ:\n\n`;
        steps += `   dℓ/dλ = n/λ - Σxᵢ\n\n`;
        steps += `   Set derivative = 0 to find maximum:\n`;
        steps += `   n/λ̂ - Σxᵢ = 0\n`;
        steps += `   n/λ̂ = Σxᵢ\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                       n                                     │\n`;
        steps += `   │              λ̂ = ──────  = 1 / x̄                          │\n`;
        steps += `   │                     Σxᵢ                                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `   Substitute our values:\n`;
        steps += `   λ̂ = ${n} / ${sum} = ${rate.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: VERIFY SECOND DERIVATIVE (Ensures maximum)            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   d²ℓ/dλ² = -n/λ² < 0 for all λ > 0 ✅ (Confirms maximum)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 6: MAXIMUM LOG-LIKELIHOOD VALUE                           │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   ℓ_max = n·ln(λ̂) - λ̂·Σxᵢ\n`;
        steps += `   ℓ_max = ${n}·ln(${rate.toFixed(6)}) - ${rate.toFixed(6)}·${sum}\n`;
        const logLikelihood = n * Math.log(rate) - rate * sum;
        steps += `   ℓ_max = ${logLikelihood.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 7: INTERPRETATION                                         │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • Estimated rate λ̂ = ${rate.toFixed(6)} events per unit time\n`;
        steps += `   • Estimated mean waiting time = 1/λ̂ = ${mean.toFixed(6)} units\n`;
        steps += `   • The data suggests events occur at a rate of ${rate.toFixed(6)} per unit time\n\n`;
        
        results = { type: 'exponential', mean, rate, logLikelihood, n };
        
    } else if (distType === 'uniform') {
        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                    UNIFORM DISTRIBUTION MLE                      ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: UNDERSTAND THE UNIFORM DISTRIBUTION                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   The Uniform distribution has probability density function:\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                     1                                       │\n`;
        steps += `   │      f(x|a,b) = ───────   for a ≤ x ≤ b                     │\n`;
        steps += `   │                    b - a                                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Where:\n`;
        steps += `   • a = minimum value (lower bound)\n`;
        steps += `   • b = maximum value (upper bound)\n`;
        steps += `   • All values between a and b are equally likely\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: LIKELIHOOD FUNCTION                                   │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   For independent observations, all must lie within [a,b]:\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    1                                        │\n`;
        steps += `   │      L(a,b) = ─────────  if a ≤ min(xᵢ) and max(xᵢ) ≤ b    │\n`;
        steps += `   │                  (b - a)ⁿ                                   │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   To maximize L(a,b), we need to MINIMIZE (b - a) while keeping\n`;
        steps += `   all observations inside [a,b].\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: DETERMINE MLE ESTIMATES                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   The smallest possible interval containing all data is:\n\n`;
        steps += `   â = minimum observed value = ${minVal}\n`;
        steps += `   b̂ = maximum observed value = ${maxVal}\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                                                             │\n`;
        steps += `   │      â = min(x₁, x₂, ..., xₙ) = ${minVal}                   │\n`;
        steps += `   │      b̂ = max(x₁, x₂, ..., xₙ) = ${maxVal}                   │\n`;
        steps += `   │                                                             │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: VERIFICATION - Check all observations in [â, b̂]       │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Data range: [${minVal}, ${maxVal}]\n`;
        steps += `   All ${n} observations lie within this interval ✅\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: MAXIMUM LIKELIHOOD VALUE                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   L_max = 1/(b̂ - â)ⁿ = 1/(${maxVal} - ${minVal})^${n}\n`;
        steps += `   L_max = 1/${(maxVal - minVal).toFixed(6)}^${n}\n\n`;
        steps += `   Log-likelihood: ℓ_max = -${n} × ln(${(maxVal - minVal).toFixed(6)})\n`;
        const logLikelihood = -n * Math.log(maxVal - minVal);
        steps += `   ℓ_max = ${logLikelihood.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 6: INTERPRETATION                                         │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • Estimated lower bound â = ${minVal}\n`;
        steps += `   • Estimated upper bound b̂ = ${maxVal}\n`;
        steps += `   • Estimated range = ${(maxVal - minVal).toFixed(6)}\n`;
        steps += `   • Any value between ${minVal} and ${maxVal} is equally likely\n\n`;
        
        results = { type: 'uniform', min: minVal, max: maxVal, range: maxVal - minVal, logLikelihood, n };
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                       FINAL RESULTS                              ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    if (results.type === 'normal') {
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │  NORMAL DISTRIBUTION MLE Estimates:                         │\n`;
        steps += `   ├─────────────────────────────────────────────────────────────┤\n`;
        steps += `   │  μ̂ (Mean)           = ${results.mean.toFixed(8)}                    │\n`;
        steps += `   │  σ̂² (Variance)      = ${results.variance.toFixed(8)}                    │\n`;
        steps += `   │  σ̂ (Std Dev)        = ${results.stdDev.toFixed(8)}                    │\n`;
        steps += `   │  Max Log-Likelihood = ${results.logLikelihood.toFixed(8)}                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n`;
        steps += `\n   📌 Interpretation: The data follows N(μ=${results.mean.toFixed(4)}, σ=${results.stdDev.toFixed(4)})\n`;
    } else if (results.type === 'exponential') {
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │  EXPONENTIAL DISTRIBUTION MLE Estimates:                    │\n`;
        steps += `   ├─────────────────────────────────────────────────────────────┤\n`;
        steps += `   │  λ̂ (Rate)           = ${results.rate.toFixed(8)}                    │\n`;
        steps += `   │  Mean (1/λ)         = ${results.mean.toFixed(8)}                    │\n`;
        steps += `   │  Max Log-Likelihood = ${results.logLikelihood.toFixed(8)}                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n`;
        steps += `\n   📌 Interpretation: The data follows Exp(λ=${results.rate.toFixed(4)}) with mean ${results.mean.toFixed(4)}\n`;
    } else if (results.type === 'uniform') {
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │  UNIFORM DISTRIBUTION MLE Estimates:                        │\n`;
        steps += `   ├─────────────────────────────────────────────────────────────┤\n`;
        steps += `   │  â (Lower Bound)    = ${results.min.toFixed(8)}                    │\n`;
        steps += `   │  b̂ (Upper Bound)    = ${results.max.toFixed(8)}                    │\n`;
        steps += `   │  Range (b̂ - â)      = ${results.range.toFixed(8)}                    │\n`;
        steps += `   │  Max Log-Likelihood = ${results.logLikelihood.toFixed(8)}                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n`;
        steps += `\n   📌 Interpretation: The data follows Uniform(${results.min.toFixed(4)}, ${results.max.toFixed(4)})\n`;
    }
    
    return { results, steps };
}
// ========== EXPECTED VALUE COMPUTATION - DETAILED ==========
function computeExpectedValueWithSteps(distType, params) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                   EXPECTED VALUE E[X] CALCULATION                  ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS EXPECTED VALUE?                                        │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The expected value (mean, first moment) is the long-run average\n`;
    steps += `   value of a random variable. For continuous distributions:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │              E[X] = ∫ x·f(x) dx   (over all x)              │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   For discrete distributions:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │              E[X] = Σ x·P(X=x)   (over all x)               │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    
    let expectedValue = 0;
    let formula = "";
    
    if (distType === 'normal') {
        const mean = params.mean;
        const stdDev = params.stdDev;
        expectedValue = mean;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION                         ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Normal Distribution PDF                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   f(x) = (1/(σ√(2π))) × exp(-(x-μ)²/(2σ²))\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = ∫_{-∞}^{∞} x·(1/(σ√(2π)))·exp(-(x-μ)²/(2σ²)) dx\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Change of Variables                                   │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Let z = (x-μ)/σ, then x = μ + σz, dx = σ·dz\n`;
        steps += `   The integral becomes:\n\n`;
        steps += `   E[X] = ∫ (μ + σz)·(1/√(2π))·e^{-z²/2} dz\n`;
        steps += `        = μ·∫ (1/√(2π))·e^{-z²/2} dz + σ·∫ z·(1/√(2π))·e^{-z²/2} dz\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Evaluate Integrals                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   First integral: ∫ (1/√(2π))·e^{-z²/2} dz = 1 (total probability)\n`;
        steps += `   Second integral: ∫ z·(1/√(2π))·e^{-z²/2} dz = 0 (odd function)\n\n`;
        steps += `   Therefore:\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                     E[X] = μ                                │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given μ = ${mean}\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                E[X] = ${mean.toFixed(8)}                       │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For a normal distribution, the expected value equals the mean parameter μ\n`;
        steps += `   • This is the center of the symmetric bell curve\n`;
        steps += `   • 50% of values fall below μ, 50% above μ\n`;
        steps += `   • The expected value is ${expectedValue.toFixed(4)}\n\n`;
        
    } else if (distType === 'exponential') {
        const rate = params.rate;
        expectedValue = 1 / rate;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                    EXPONENTIAL DISTRIBUTION                      ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Exponential Distribution PDF                           │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   f(x) = λ·e^{-λx}  for x ≥ 0\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = ∫_{0}^{∞} x·λ·e^{-λx} dx\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Integration by Parts                                  │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Let u = x, dv = λ·e^{-λx} dx\n`;
        steps += `   Then du = dx, v = -e^{-λx}\n\n`;
        steps += `   ∫ u·dv = u·v - ∫ v·du\n`;
        steps += `   = x·(-e^{-λx}) - ∫ (-e^{-λx}) dx\n`;
        steps += `   = -x·e^{-λx} + ∫ e^{-λx} dx\n`;
        steps += `   = -x·e^{-λx} - (1/λ)·e^{-λx}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Evaluate Limits                                       │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Evaluate from 0 to ∞:\n\n`;
        steps += `   As x → ∞: -x·e^{-λx} → 0 and -e^{-λx}/λ → 0\n`;
        steps += `   At x = 0: -0·e⁰ - e⁰/λ = -1/λ\n\n`;
        steps += `   Therefore:\n`;
        steps += `   E[X] = 0 - (-1/λ) = 1/λ\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    E[X] = 1/λ                               │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ = ${rate}\n`;
        steps += `   E[X] = 1/${rate} = ${expectedValue.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For exponential distribution, expected value = 1/λ\n`;
        steps += `   • This represents the mean waiting time between events\n`;
        steps += `   • Memoryless property: P(X > s+t | X > s) = P(X > t)\n`;
        steps += `   • The expected waiting time is ${expectedValue.toFixed(4)} units\n\n`;
        
    } else if (distType === 'uniform') {
        const min = params.min;
        const max = params.max;
        expectedValue = (min + max) / 2;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      UNIFORM DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Uniform Distribution PDF                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   f(x) = 1/(b-a)  for a ≤ x ≤ b\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = ∫_{a}^{b} x·(1/(b-a)) dx\n`;
        steps += `        = (1/(b-a))·∫_{a}^{b} x dx\n`;
        steps += `        = (1/(b-a))·[x²/2]_{a}^{b}\n`;
        steps += `        = (1/(b-a))·(b²/2 - a²/2)\n`;
        steps += `        = (1/(b-a))·((b² - a²)/2)\n`;
        steps += `        = (1/(b-a))·((b-a)(b+a)/2)\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   E[X] = (a+b)/2                            │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given a = ${min}, b = ${max}\n`;
        steps += `   E[X] = (${min} + ${max})/2 = ${expectedValue.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For uniform distribution, expected value = midpoint of [a,b]\n`;
        steps += `   • All values between a and b are equally likely\n`;
        steps += `   • The average is exactly the center of the interval\n`;
        steps += `   • Expected value = ${expectedValue.toFixed(4)}\n\n`;
        
    } else if (distType === 'beta') {
        const alpha = params.alpha;
        const beta = params.beta;
        expectedValue = alpha / (alpha + beta);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                       BETA DISTRIBUTION                          ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Beta Distribution PDF                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   f(x) = [x^{α-1}·(1-x)^{β-1}] / B(α,β)  for 0 ≤ x ≤ 1\n`;
        steps += `   where B(α,β) = Γ(α)Γ(β)/Γ(α+β) is the Beta function\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = ∫_{0}^{1} x·[x^{α-1}·(1-x)^{β-1}]/B(α,β) dx\n`;
        steps += `        = [1/B(α,β)]·∫_{0}^{1} x^{α}·(1-x)^{β-1} dx\n`;
        steps += `        = B(α+1,β)/B(α,β)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Simplify Using Gamma Function Properties              │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   B(α+1,β)/B(α,β) = [Γ(α+1)Γ(β)/Γ(α+β+1)] / [Γ(α)Γ(β)/Γ(α+β)]\n`;
        steps += `                     = [Γ(α+1)/Γ(α)]·[Γ(α+β)/Γ(α+β+1)]\n`;
        steps += `                     = α·[1/(α+β)]\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   E[X] = α/(α+β)                            │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given α = ${alpha}, β = ${beta}\n`;
        steps += `   E[X] = ${alpha}/(${alpha} + ${beta}) = ${expectedValue.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For Beta distribution, expected value = α/(α+β)\n`;
        steps += `   • This represents the mean proportion or probability\n`;
        steps += `   • When α=β, distribution is symmetric around 0.5\n`;
        steps += `   • Expected value = ${(expectedValue * 100).toFixed(2)}%\n\n`;
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        expectedValue = lambda;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Poisson PMF                                           │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   P(X=k) = (e^{-λ}·λ^{k}) / k!  for k = 0,1,2,...\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = Σ_{k=0}^{∞} k·P(X=k)\n`;
        steps += `        = Σ_{k=0}^{∞} k·(e^{-λ}·λ^{k})/k!\n`;
        steps += `        = e^{-λ}·Σ_{k=1}^{∞} λ^{k}/(k-1)!  (since term k=0 is 0)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Change Index                                          │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Let j = k-1, then k = j+1:\n`;
        steps += `   E[X] = e^{-λ}·Σ_{j=0}^{∞} λ^{j+1}/j!\n`;
        steps += `        = e^{-λ}·λ·Σ_{j=0}^{∞} λ^{j}/j!\n`;
        steps += `        = λ·e^{-λ}·e^{λ}\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    E[X] = λ                                 │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ = ${lambda}\n`;
        steps += `   E[X] = ${lambda.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For Poisson distribution, expected value = λ (rate parameter)\n`;
        steps += `   • This represents the average number of events per interval\n`;
        steps += `   • Variance also equals λ (equidispersion property)\n`;
        steps += `   • Expected number of events = ${expectedValue.toFixed(4)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        expectedValue = n * p;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Binomial PMF                                          │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   P(X=k) = C(n,k)·p^{k}·(1-p)^{n-k}  for k = 0,1,...,n\n`;
        steps += `   where C(n,k) = n!/(k!(n-k)!)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = Σ_{k=0}^{n} k·C(n,k)·p^{k}·(1-p)^{n-k}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Use Identity k·C(n,k) = n·C(n-1,k-1)                  │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = Σ_{k=1}^{n} n·C(n-1,k-1)·p^{k}·(1-p)^{n-k}\n`;
        steps += `        = n·p·Σ_{j=0}^{n-1} C(n-1,j)·p^{j}·(1-p)^{(n-1)-j}  (let j=k-1)\n`;
        steps += `        = n·p·(p + (1-p))^{n-1}\n`;
        steps += `        = n·p·1^{n-1}\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   E[X] = n·p                                │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   E[X] = ${n} × ${p} = ${expectedValue.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For Binomial distribution, expected value = n·p\n`;
        steps += `   • This represents the expected number of successes\n`;
        steps += `   • n = number of trials, p = probability of success per trial\n`;
        steps += `   • Expected successes = ${expectedValue.toFixed(4)} out of ${n} trials\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │                    E[X] = ${expectedValue.toFixed(10)}                     │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { expectedValue, steps };
}
// ========== DISTRIBUTION VARIANCE COMPUTATION - DETAILED ==========
function computeDistributionVarianceWithSteps(distType, params) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                    VARIANCE Var[X] CALCULATION                     ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS VARIANCE?                                              │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Variance measures the spread or dispersion of a distribution:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │   Var[X] = E[(X - μ)²] = E[X²] - (E[X])²                    │\n`;
    steps += `   │                                                             │\n`;
    steps += `   │   where μ = E[X] is the expected value                      │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   • Standard deviation = √Var[X]\n`;
    steps += `   • Larger variance = more spread out data\n`;
    steps += `   • Var[X] ≥ 0 always\n\n`;
    
    let variance = 0;
    
    if (distType === 'normal') {
        const stdDev = params.stdDev;
        variance = stdDev * stdDev;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION                         ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Definition for Normal Distribution                     │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   For Normal(μ,σ²), the variance is the σ² parameter itself.\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    Var[X] = σ²                              │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Derivation (Second Moment Method)                      │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = ∫ x²·(1/(σ√(2π)))·exp(-(x-μ)²/(2σ²)) dx\n\n`;
        steps += `   Using the same substitution z = (x-μ)/σ:\n`;
        steps += `   E[X²] = ∫ (μ+σz)²·(1/√(2π))·e^{-z²/2} dz\n`;
        steps += `         = μ²·∫ (1/√(2π))·e^{-z²/2} dz + 2μσ·∫ z·(1/√(2π))·e^{-z²/2} dz\n`;
        steps += `           + σ²·∫ z²·(1/√(2π))·e^{-z²/2} dz\n`;
        steps += `         = μ²·1 + 2μσ·0 + σ²·1\n`;
        steps += `         = μ² + σ²\n\n`;
        steps += `   Therefore:\n`;
        steps += `   Var[X] = E[X²] - (E[X])² = (μ² + σ²) - μ² = σ²\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given σ = ${stdDev}\n`;
        steps += `   Var[X] = ${stdDev}² = ${variance.toFixed(8)}\n\n`;
        
    } else if (distType === 'exponential') {
        const rate = params.rate;
        variance = 1 / (rate * rate);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                    EXPONENTIAL DISTRIBUTION                      ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Find E[X²] for Exponential                             │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = ∫_{0}^{∞} x²·λ·e^{-λx} dx\n\n`;
        steps += `   Using integration by parts twice, or known result:\n`;
        steps += `   E[X²] = 2/λ²\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Derivation Details                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Let u = x², dv = λ·e^{-λx} dx\n`;
        steps += `   Then du = 2x·dx, v = -e^{-λx}\n\n`;
        steps += `   ∫ u·dv = u·v - ∫ v·du = -x²·e^{-λx} + ∫ 2x·e^{-λx} dx\n\n`;
        steps += `   The integral ∫ 2x·e^{-λx} dx = 2/λ² (from E[X] formula)\n\n`;
        steps += `   Evaluating from 0 to ∞: [ -x²·e^{-λx} ]₀^∞ = 0\n`;
        steps += `   Therefore: E[X²] = 0 + 2/λ² = 2/λ²\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Var[X] = E[X²] - (E[X])²\n`;
        steps += `         = 2/λ² - (1/λ)²\n`;
        steps += `         = 2/λ² - 1/λ²\n`;
        steps += `         = 1/λ²\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   Var[X] = 1/λ²                             │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ = ${rate}\n`;
        steps += `   Var[X] = 1/${rate}² = ${variance.toFixed(8)}\n\n`;
        
    } else if (distType === 'uniform') {
        const min = params.min;
        const max = params.max;
        variance = Math.pow(max - min, 2) / 12;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      UNIFORM DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Find E[X²] for Uniform                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = ∫_{a}^{b} x²·(1/(b-a)) dx\n`;
        steps += `        = (1/(b-a))·[x³/3]_{a}^{b}\n`;
        steps += `        = (1/(b-a))·(b³/3 - a³/3)\n`;
        steps += `        = (b³ - a³)/(3(b-a))\n`;
        steps += `        = (b² + ab + a²)/3\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Recall E[X] = (a+b)/2\n\n`;
        steps += `   Var[X] = E[X²] - (E[X])²\n`;
        steps += `         = (a² + ab + b²)/3 - (a+b)²/4\n`;
        steps += `         = [4(a² + ab + b²) - 3(a+b)²]/12\n`;
        steps += `         = [4a² + 4ab + 4b² - 3a² - 6ab - 3b²]/12\n`;
        steps += `         = [a² - 2ab + b²]/12\n`;
        steps += `         = (b - a)²/12\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   Var[X] = (b-a)²/12                        │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given a = ${min}, b = ${max}\n`;
        steps += `   b - a = ${max} - ${min} = ${(max-min).toFixed(6)}\n`;
        steps += `   Var[X] = (${(max-min).toFixed(6)})²/12 = ${variance.toFixed(8)}\n\n`;
        
    } else if (distType === 'beta') {
        const alpha = params.alpha;
        const beta = params.beta;
        variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                       BETA DISTRIBUTION                          ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Known Results for Beta Distribution                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   For Beta(α,β):\n`;
        steps += `   • E[X] = α/(α+β)\n`;
        steps += `   • E[X²] = α(α+1)/[(α+β)(α+β+1)]\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Derivation Using Beta Function                         │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = ∫₀¹ x²·[x^{α-1}(1-x)^{β-1}]/B(α,β) dx\n`;
        steps += `         = B(α+2,β)/B(α,β)\n`;
        steps += `         = [Γ(α+2)Γ(β)/Γ(α+β+2)] / [Γ(α)Γ(β)/Γ(α+β)]\n`;
        steps += `         = [Γ(α+2)/Γ(α)]·[Γ(α+β)/Γ(α+β+2)]\n`;
        steps += `         = α(α+1)·[1/((α+β)(α+β+1))]\n`;
        steps += `         = α(α+1)/[(α+β)(α+β+1)]\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Var[X] = E[X²] - (E[X])²\n`;
        steps += `         = α(α+1)/[(α+β)(α+β+1)] - [α/(α+β)]²\n`;
        steps += `         = [α(α+1)(α+β) - α²(α+β+1)] / [(α+β)²(α+β+1)]\n`;
        steps += `         = αβ / [(α+β)²(α+β+1)]\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │            Var[X] = αβ / [(α+β)²(α+β+1)]                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given α = ${alpha}, β = ${beta}\n`;
        steps += `   α+β = ${alpha+beta}\n`;
        steps += `   α+β+1 = ${alpha+beta+1}\n`;
        steps += `   Numerator = ${alpha} × ${beta} = ${alpha*beta}\n`;
        steps += `   Denominator = (${alpha+beta})² × ${alpha+beta+1} = ${Math.pow(alpha+beta,2)} × ${alpha+beta+1} = ${Math.pow(alpha+beta,2)*(alpha+beta+1)}\n`;
        steps += `   Var[X] = ${variance.toFixed(8)}\n\n`;
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        variance = lambda;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Find E[X²] for Poisson                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = Σ_{k=0}^{∞} k²·e^{-λ}·λ^{k}/k!\n`;
        steps += `         = e^{-λ}·Σ_{k=1}^{∞} k·λ^{k}/(k-1)!\n`;
        steps += `         = e^{-λ}·Σ_{j=0}^{∞} (j+1)·λ^{j+1}/j!  (j=k-1)\n`;
        steps += `         = λ·e^{-λ}·[ Σ_{j=0}^{∞} j·λ^{j}/j! + Σ_{j=0}^{∞} λ^{j}/j! ]\n`;
        steps += `         = λ·e^{-λ}·[ λ·e^{λ} + e^{λ} ]\n`;
        steps += `         = λ·e^{-λ}·e^{λ}·(λ+1)\n`;
        steps += `         = λ(λ+1)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Recall E[X] = λ\n`;
        steps += `   Var[X] = E[X²] - (E[X])² = λ(λ+1) - λ² = λ\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    Var[X] = λ                               │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ = ${lambda}\n`;
        steps += `   Var[X] = ${lambda.toFixed(8)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        variance = n * p * (1 - p);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Find E[X²] for Binomial                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = Σ_{k=0}^{n} k²·C(n,k)·p^{k}·(1-p)^{n-k}\n\n`;
        steps += `   Using k² = k(k-1) + k:\n`;
        steps += `   E[X²] = E[X(X-1)] + E[X]\n\n`;
        steps += `   E[X(X-1)] = Σ k(k-1)·C(n,k)·p^{k}·(1-p)^{n-k}\n`;
        steps += `             = n(n-1)p²·Σ C(n-2,j)·p^{j}·(1-p)^{n-2-j}\n`;
        steps += `             = n(n-1)p²·(p + (1-p))^{n-2}\n`;
        steps += `             = n(n-1)p²\n\n`;
        steps += `   Therefore: E[X²] = n(n-1)p² + np\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Var[X] = E[X²] - (E[X])²\n`;
        steps += `         = [n(n-1)p² + np] - (np)²\n`;
        steps += `         = n(n-1)p² + np - n²p²\n`;
        steps += `         = n²p² - np² + np - n²p²\n`;
        steps += `         = np - np²\n`;
        steps += `         = np(1-p)\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                 Var[X] = n·p·(1-p)                          │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   1-p = ${(1-p).toFixed(6)}\n`;
        steps += `   Var[X] = ${n} × ${p} × ${(1-p).toFixed(6)} = ${variance.toFixed(8)}\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │                  Var[X] = ${variance.toFixed(10)}                    │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    steps += `\n   📌 Standard Deviation = √Var[X] = ${Math.sqrt(variance).toFixed(8)}\n`;
    
    return { variance, steps };
}
// ========== MGF COMPUTATION - DETAILED ==========
function computeMGFWithSteps(distType, params, t) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║           MOMENT GENERATING FUNCTION M_X(t) CALCULATION            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS THE MOMENT GENERATING FUNCTION?                        │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The Moment Generating Function (MGF) is defined as:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │              M_X(t) = E[e^{tX}]                             │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   For continuous distributions: M_X(t) = ∫ e^{tx}·f(x) dx\n`;
    steps += `   For discrete distributions:   M_X(t) = Σ e^{tx}·P(X=x)\n\n`;
    steps += `   Properties:\n`;
    steps += `   • M_X(0) = 1\n`;
    steps += `   • E[X^k] = M_X^{(k)}(0)  (k-th derivative at 0)\n`;
    steps += `   • Uniquely determines the distribution\n\n`;
    
    steps += `   Given t = ${t}\n\n`;
    
    let mgfValue = 0;
    
    if (distType === 'normal') {
        const mean = params.mean;
        const stdDev = params.stdDev;
        mgfValue = Math.exp(mean * t + 0.5 * stdDev * stdDev * t * t);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION MGF                     ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Definition                                            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   M_X(t) = E[e^{tX}] = ∫_{-∞}^{∞} e^{tx}·(1/(σ√(2π)))·e^{-(x-μ)²/(2σ²)} dx\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Complete the Square in the Exponent                   │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Combine exponents: tx - (x-μ)²/(2σ²)\n`;
        steps += `   = -(x² - 2μx + μ²)/(2σ²) + tx\n`;
        steps += `   = -[x² - 2μx + μ² - 2σ²tx]/(2σ²)\n`;
        steps += `   = -[x² - 2x(μ + σ²t) + μ²]/(2σ²)\n`;
        steps += `   = -[(x - (μ+σ²t))² - (μ+σ²t)² + μ²]/(2σ²)\n`;
        steps += `   = -(x - (μ+σ²t))²/(2σ²) + [(μ+σ²t)² - μ²]/(2σ²)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Simplify the Constant Term                            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   [(μ+σ²t)² - μ²]/(2σ²) = [μ² + 2μσ²t + σ⁴t² - μ²]/(2σ²)\n`;
        steps += `                           = [2μσ²t + σ⁴t²]/(2σ²)\n`;
        steps += `                           = μt + σ²t²/2\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Evaluate the Integral                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   M_X(t) = e^{μt + σ²t²/2}·∫_{-∞}^{∞} (1/(σ√(2π)))·e^{-(x-(μ+σ²t))²/(2σ²)} dx\n`;
        steps += `   The integral is the PDF of a Normal(μ+σ²t, σ²) integrated over all x = 1\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │              M_X(t) = exp(μt + σ²t²/2)                      │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   μ = ${mean}, σ = ${stdDev}, t = ${t}\n`;
        steps += `   μt = ${mean} × ${t} = ${(mean*t).toFixed(6)}\n`;
        steps += `   σ²t²/2 = (${stdDev}² × ${t}²)/2 = ${(stdDev*stdDev*t*t/2).toFixed(6)}\n`;
        steps += `   Exponent = ${(mean*t).toFixed(6)} + ${(stdDev*stdDev*t*t/2).toFixed(6)} = ${(mean*t + 0.5*stdDev*stdDev*t*t).toFixed(6)}\n`;
        steps += `   M_X(${t}) = e^{${(mean*t + 0.5*stdDev*stdDev*t*t).toFixed(6)}} = ${mgfValue.toFixed(8)}\n\n`;
        
    } else if (distType === 'exponential') {
        const rate = params.rate;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION MGF                   ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        if (t < rate) {
            mgfValue = rate / (rate - t);
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 1: Definition                                            │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   M_X(t) = E[e^{tX}] = ∫_{0}^{∞} e^{tx}·λ·e^{-λx} dx\n`;
            steps += `         = λ·∫_{0}^{∞} e^{-(λ-t)x} dx\n\n`;
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 2: Evaluate the Integral                                 │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   ∫_{0}^{∞} e^{-(λ-t)x} dx = [ -e^{-(λ-t)x}/(λ-t) ]_{0}^{∞}\n`;
            steps += `   = 0 - (-1/(λ-t)) = 1/(λ-t)\n\n`;
            steps += `   Therefore:\n`;
            steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
            steps += `   │              M_X(t) = λ/(λ-t)  for t < λ                    │\n`;
            steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 3: Substitute Given Values                               │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   λ = ${rate}, t = ${t}\n`;
            steps += `   λ - t = ${rate} - ${t} = ${(rate-t).toFixed(6)}\n`;
            steps += `   M_X(${t}) = ${rate} / ${(rate-t).toFixed(6)} = ${mgfValue.toFixed(8)}\n\n`;
        } else {
            steps += `   ⚠️ WARNING: MGF does not exist for t ≥ λ\n`;
            steps += `   Because the integral ∫ e^{-(λ-t)x} dx diverges when λ-t ≤ 0.\n`;
            steps += `   For t = ${t}, λ = ${rate}, we have λ-t = ${(rate-t).toFixed(6)} ≤ 0\n`;
            mgfValue = Infinity;
        }
        
    } else if (distType === 'uniform') {
        const min = params.min;
        const max = params.max;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     UNIFORM DISTRIBUTION MGF                     ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        if (t !== 0) {
            mgfValue = (Math.exp(t * max) - Math.exp(t * min)) / (t * (max - min));
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 1: Definition                                            │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   M_X(t) = E[e^{tX}] = ∫_{a}^{b} e^{tx}·(1/(b-a)) dx\n`;
            steps += `         = (1/(b-a))·∫_{a}^{b} e^{tx} dx\n\n`;
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 2: Evaluate the Integral                                 │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   ∫ e^{tx} dx = e^{tx}/t\n\n`;
            steps += `   ∫_{a}^{b} e^{tx} dx = [e^{tx}/t]_{a}^{b} = (e^{tb} - e^{ta})/t\n\n`;
            steps += `   Therefore:\n`;
            steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
            steps += `   │              M_X(t) = (e^{tb} - e^{ta})/[t(b-a)]            │\n`;
            steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 3: Substitute Given Values                               │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   a = ${min}, b = ${max}, t = ${t}\n`;
            steps += `   e^{tb} = e^{${t}×${max}} = ${Math.exp(t*max).toFixed(6)}\n`;
            steps += `   e^{ta} = e^{${t}×${min}} = ${Math.exp(t*min).toFixed(6)}\n`;
            steps += `   e^{tb} - e^{ta} = ${(Math.exp(t*max)-Math.exp(t*min)).toFixed(6)}\n`;
            steps += `   t(b-a) = ${t} × (${max} - ${min}) = ${(t*(max-min)).toFixed(6)}\n`;
            steps += `   M_X(${t}) = ${(Math.exp(t*max)-Math.exp(t*min)).toFixed(6)} / ${(t*(max-min)).toFixed(6)} = ${mgfValue.toFixed(8)}\n\n`;
        } else {
            mgfValue = 1;
            steps += `   When t = 0, M_X(0) = E[e^{0·X}] = E[1] = 1\n\n`;
        }
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        mgfValue = Math.exp(lambda * (Math.exp(t) - 1));
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     POISSON DISTRIBUTION MGF                     ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Definition                                            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   M_X(t) = E[e^{tX}] = Σ_{k=0}^{∞} e^{tk}·(e^{-λ}·λ^{k}/k!)\n`;
        steps += `         = e^{-λ}·Σ_{k=0}^{∞} (λ·e^{t})^{k}/k!\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Use Exponential Series                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Recall that Σ_{k=0}^{∞} x^{k}/k! = e^{x}\n`;
        steps += `   Let x = λ·e^{t}\n\n`;
        steps += `   Then Σ_{k=0}^{∞} (λ·e^{t})^{k}/k! = e^{λ·e^{t}}\n\n`;
        steps += `   Therefore:\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │              M_X(t) = e^{-λ}·e^{λ·e^{t}} = e^{λ(e^{t}-1)}   │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   λ = ${lambda}, t = ${t}\n`;
        steps += `   e^{t} = ${Math.exp(t).toFixed(6)}\n`;
        steps += `   e^{t} - 1 = ${(Math.exp(t)-1).toFixed(6)}\n`;
        steps += `   λ(e^{t}-1) = ${lambda} × ${(Math.exp(t)-1).toFixed(6)} = ${(lambda*(Math.exp(t)-1)).toFixed(6)}\n`;
        steps += `   M_X(${t}) = e^{${(lambda*(Math.exp(t)-1)).toFixed(6)}} = ${mgfValue.toFixed(8)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        mgfValue = Math.pow(1 - p + p * Math.exp(t), n);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION MGF                    ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Definition                                            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   M_X(t) = E[e^{tX}] = Σ_{k=0}^{n} e^{tk}·C(n,k)·p^{k}·(1-p)^{n-k}\n`;
        steps += `         = Σ_{k=0}^{n} C(n,k)·(p·e^{t})^{k}·(1-p)^{n-k}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Use Binomial Theorem                                  │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Recall the Binomial Theorem: (a + b)^n = Σ_{k=0}^{n} C(n,k)·a^{k}·b^{n-k}\n`;
        steps += `   Let a = p·e^{t}, b = 1-p\n\n`;
        steps += `   Then:\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │              M_X(t) = (1-p + p·e^{t})^{n}                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   n = ${n}, p = ${p}, t = ${t}\n`;
        steps += `   e^{t} = ${Math.exp(t).toFixed(6)}\n`;
        steps += `   p·e^{t} = ${p} × ${Math.exp(t).toFixed(6)} = ${(p*Math.exp(t)).toFixed(6)}\n`;
        steps += `   1-p + p·e^{t} = ${(1-p).toFixed(6)} + ${(p*Math.exp(t)).toFixed(6)} = ${(1-p+p*Math.exp(t)).toFixed(6)}\n`;
        steps += `   M_X(${t}) = (${(1-p+p*Math.exp(t)).toFixed(6)})^{${n}} = ${mgfValue.toFixed(8)}\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │              M_X(${t}) = ${mgfValue.toFixed(10)}                    │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    steps += `\n   📌 The first few moments can be obtained by differentiation:\n`;
    steps += `      • E[X] = M'_X(0)\n`;
    steps += `      • E[X²] = M''_X(0)\n`;
    steps += `      • Var[X] = M''_X(0) - [M'_X(0)]²\n`;
    
    return { mgfValue, steps };
}
// ========== PMF (PROBABILITY MASS FUNCTION) FOR DISCRETE DISTRIBUTIONS ==========
function computePMFWithSteps() {
    const dist = document.getElementById('pmfDistribution').value;
    const xValuesText = document.getElementById('pmfXValues').value;
    const xValues = parseNumbersFromInput(xValuesText);
    
    if (!xValues.length) return { error: true, message: "Please enter x values." };
    
    let results = [];
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║           PROBABILITY MASS FUNCTION (PMF) CALCULATION              ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${dist.toUpperCase()} (DISCRETE)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS THE PROBABILITY MASS FUNCTION (PMF)?                   │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The PMF gives the probability that a discrete random variable\n`;
    steps += `   takes on a specific value: P(X = x).\n\n`;
    steps += `   Properties:\n`;
    steps += `   • 0 ≤ P(X=x) ≤ 1 for all x\n`;
    steps += `   • Σ P(X=x) = 1 over all possible x\n\n`;
    
    if (dist === 'poisson') {
        const lambda = parseFloat(document.getElementById('pmfLambda').value);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION PMF                    ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: P(X=k) = (e^{-λ} · λ^{k}) / k!\n\n`;
        steps += `   Where:\n`;
        steps += `   • λ (lambda) = average number of events per interval\n`;
        steps += `   • k = number of events (non-negative integer)\n`;
        steps += `   • e ≈ 2.71828 (Euler's number)\n\n`;
        
        steps += `   Given λ = ${lambda}\n\n`;
        
        xValues.forEach(k => {
            if (k < 0 || !Number.isInteger(k)) {
                results.push(0);
                steps += `\nFor x = ${k}:\n`;
                steps += `  ⚠️ x must be a non-negative integer for Poisson distribution.\n`;
                steps += `  P(X=${k}) = 0\n\n`;
            } else {
                const pmf = Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
                results.push(pmf);
                
                steps += `\nFor x = ${k}:\n`;
                steps += `  Step 1: Calculate e^{-λ} = e^{-${lambda}} = ${Math.exp(-lambda).toFixed(8)}\n`;
                steps += `  Step 2: Calculate λ^{k} = ${lambda}^${k} = ${Math.pow(lambda, k).toFixed(8)}\n`;
                steps += `  Step 3: Calculate k! = ${k}! = ${factorial(k)}\n`;
                steps += `  Step 4: Apply formula: (${Math.exp(-lambda).toFixed(8)} × ${Math.pow(lambda, k).toFixed(8)}) / ${factorial(k)}\n`;
                steps += `  P(X=${k}) = ${pmf.toFixed(8)}\n`;
                steps += `  Interpretation: ${(pmf * 100).toFixed(4)}% chance of exactly ${k} events\n\n`;
            }
        });
        
    } else if (dist === 'binomial') {
        const n = parseInt(document.getElementById('pmfN').value);
        const p = parseFloat(document.getElementById('pmfP').value);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      BINOMIAL DISTRIBUTION PMF                   ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: P(X=k) = C(n,k) · p^{k} · (1-p)^{n-k}\n\n`;
        steps += `   Where:\n`;
        steps += `   • n = number of trials\n`;
        steps += `   • p = probability of success on each trial\n`;
        steps += `   • k = number of successes (0 ≤ k ≤ n)\n`;
        steps += `   • C(n,k) = n!/(k!(n-k)!) (binomial coefficient)\n\n`;
        
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   q = 1-p = ${(1-p).toFixed(6)}\n\n`;
        
        xValues.forEach(k => {
            if (k < 0 || k > n || !Number.isInteger(k)) {
                results.push(0);
                steps += `\nFor x = ${k}:\n`;
                steps += `  ⚠️ x must be an integer between 0 and ${n} for Binomial distribution.\n`;
                steps += `  P(X=${k}) = 0\n\n`;
            } else {
                const comb = combination(n, k);
                const pmf = comb * Math.pow(p, k) * Math.pow(1-p, n-k);
                results.push(pmf);
                
                steps += `\nFor x = ${k}:\n`;
                steps += `  Step 1: Calculate C(${n},${k}) = ${n}!/(${k}!·${n-k}!) = ${comb}\n`;
                steps += `  Step 2: Calculate p^{k} = ${p}^${k} = ${Math.pow(p, k).toFixed(8)}\n`;
                steps += `  Step 3: Calculate (1-p)^{n-k} = ${(1-p).toFixed(6)}^${n-k} = ${Math.pow(1-p, n-k).toFixed(8)}\n`;
                steps += `  Step 4: Multiply: ${comb} × ${Math.pow(p, k).toFixed(8)} × ${Math.pow(1-p, n-k).toFixed(8)}\n`;
                steps += `  P(X=${k}) = ${pmf.toFixed(8)}\n`;
                steps += `  Interpretation: ${(pmf * 100).toFixed(4)}% chance of exactly ${k} successes in ${n} trials\n\n`;
            }
        });
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    xValues.forEach((x, i) => {
        steps += `   │  P(X=${x}) = ${results[i].toFixed(10)}${' '.repeat(20 - results[i].toFixed(10).length)}│\n`;
    });
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { results, xValues, steps, resultStr: results.map(r => r.toFixed(8)).join(', ') };
}

// ========== SURVIVAL FUNCTION S(t) = 1 - CDF(t) ==========
function computeSurvivalWithSteps() {
    const dist = document.getElementById('survivalDistribution').value;
    const xValuesText = document.getElementById('survivalXValues').value;
    const xValues = parseNumbersFromInput(xValuesText);
    
    if (!xValues.length) return { error: true, message: "Please enter x values." };
    
    let results = [];
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                    SURVIVAL FUNCTION S(t) CALCULATION              ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${dist.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS THE SURVIVAL FUNCTION?                                 │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The Survival Function (also called Reliability Function) is:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                    S(t) = P(X > t) = 1 - F(t)                │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Where F(t) is the CDF (cumulative distribution function).\n\n`;
    steps += `   Properties:\n`;
    steps += `   • S(0) = 1 (all subjects survive at time 0)\n`;
    steps += `   • S(∞) = 0 (eventually all subjects experience the event)\n`;
    steps += `   • S(t) is non-increasing (survival probability decreases over time)\n`;
    steps += `   • Used in survival analysis, reliability engineering, and time-to-event analysis\n\n`;
    
    if (dist === 'exponential') {
        const rate = parseFloat(document.getElementById('survivalRate').value);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION SURVIVAL               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Exponential distribution: CDF F(t) = 1 - e^{-λt}\n`;
        steps += `   Therefore: S(t) = 1 - (1 - e^{-λt}) = e^{-λt}\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    S(t) = e^{-λt}                           │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ (rate) = ${rate}\n\n`;
        
        xValues.forEach(t => {
            if (t < 0) {
                results.push(1);
                steps += `\nFor t = ${t} (< 0):\n`;
                steps += `  S(${t}) = 1 (survival probability is 1 before time 0)\n\n`;
            } else {
                const survival = Math.exp(-rate * t);
                results.push(survival);
                
                steps += `\nFor t = ${t}:\n`;
                steps += `  Step 1: Calculate λt = ${rate} × ${t} = ${(rate*t).toFixed(6)}\n`;
                steps += `  Step 2: Calculate e^{-λt} = e^{-${(rate*t).toFixed(6)}} = ${Math.exp(-rate*t).toFixed(8)}\n`;
                steps += `  S(${t}) = ${survival.toFixed(8)}\n`;
                steps += `  Interpretation: ${(survival * 100).toFixed(2)}% survive beyond time ${t}\n\n`;
            }
        });
        
    } else if (dist === 'normal') {
        const mean = parseFloat(document.getElementById('survivalMean').value);
        const std = parseFloat(document.getElementById('survivalStd').value);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION SURVIVAL                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Normal distribution: S(t) = 1 - Φ((t-μ)/σ)\n`;
        steps += `   where Φ is the standard normal CDF.\n\n`;
        steps += `   Given μ (mean) = ${mean}, σ (std dev) = ${std}\n\n`;
        
        xValues.forEach(t => {
            const z = (t - mean) / std;
            const cdf = normalCDF(t, mean, std);
            const survival = 1 - cdf;
            results.push(survival);
            
            steps += `\nFor t = ${t}:\n`;
            steps += `  Step 1: Calculate z-score: z = (${t} - ${mean})/${std} = ${z.toFixed(6)}\n`;
            steps += `  Step 2: Find CDF at t: F(${t}) = Φ(${z.toFixed(6)}) = ${cdf.toFixed(8)}\n`;
            steps += `  Step 3: Calculate S(t) = 1 - F(${t}) = 1 - ${cdf.toFixed(8)} = ${survival.toFixed(8)}\n`;
            steps += `  Interpretation: ${(survival * 100).toFixed(2)}% survive beyond ${t}\n\n`;
        });
        
    } else if (dist === 'weibull') {
        const shape = parseFloat(document.getElementById('survivalShape').value);
        const scale = parseFloat(document.getElementById('survivalScale').value);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      WEIBULL DISTRIBUTION SURVIVAL               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Weibull distribution: CDF F(t) = 1 - e^{-(t/λ)^{k}}\n`;
        steps += `   Therefore: S(t) = e^{-(t/λ)^{k}}\n\n`;
        steps += `   Where:\n`;
        steps += `   • k = shape parameter\n`;
        steps += `   • λ = scale parameter\n\n`;
        steps += `   Given shape k = ${shape}, scale λ = ${scale}\n\n`;
        
        xValues.forEach(t => {
            if (t < 0) {
                results.push(1);
                steps += `\nFor t = ${t} (< 0):\n`;
                steps += `  S(${t}) = 1 (survival probability is 1 for negative time)\n\n`;
            } else {
                const survival = Math.exp(-Math.pow(t / scale, shape));
                results.push(survival);
                
                steps += `\nFor t = ${t}:\n`;
                steps += `  Step 1: Calculate t/λ = ${t}/${scale} = ${(t/scale).toFixed(6)}\n`;
                steps += `  Step 2: Calculate (t/λ)^{k} = ${(t/scale).toFixed(6)}^${shape} = ${Math.pow(t/scale, shape).toFixed(8)}\n`;
                steps += `  Step 3: Calculate e^{-(t/λ)^{k}} = e^{-${Math.pow(t/scale, shape).toFixed(8)}} = ${survival.toFixed(8)}\n`;
                steps += `  S(${t}) = ${survival.toFixed(8)}\n`;
                steps += `  Interpretation: ${(survival * 100).toFixed(2)}% survive beyond time ${t}\n\n`;
            }
        });
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    xValues.forEach((x, i) => {
        steps += `   │  S(${x}) = ${results[i].toFixed(10)}${' '.repeat(25 - results[i].toFixed(10).length)}│\n`;
    });
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { results, xValues, steps, resultStr: results.map(r => (r * 100).toFixed(4) + '%').join(', ') };
}

// ========== HAZARD FUNCTION h(t) = f(t)/S(t) ==========
function computeHazardWithSteps() {
    const dist = document.getElementById('hazardDistribution').value;
    const xValuesText = document.getElementById('hazardXValues').value;
    const xValues = parseNumbersFromInput(xValuesText);
    
    if (!xValues.length) return { error: true, message: "Please enter time values." };
    
    let results = [];
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                     HAZARD FUNCTION h(t) CALCULATION               ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${dist.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS THE HAZARD FUNCTION?                                  │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The Hazard Function (also called Failure Rate) is:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                    h(t) = f(t) / S(t)                        │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Where:\n`;
    steps += `   • f(t) = PDF (probability density function)\n`;
    steps += `   • S(t) = Survival function = 1 - F(t)\n\n`;
    steps += `   Interpretation: h(t) dt ≈ probability of failure in [t, t+dt]\n`;
    steps += `   given survival up to time t.\n\n`;
    steps += `   Properties:\n`;
    steps += `   • h(t) ≥ 0 for all t\n`;
    steps += `   • Can be constant, increasing, or decreasing over time\n`;
    steps += `   • Used to model failure rates in reliability engineering\n\n`;
    
    if (dist === 'exponential') {
        const rate = parseFloat(document.getElementById('hazardRate').value);
        results = xValues.map(() => rate);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION HAZARD                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Exponential distribution:\n`;
        steps += `   • PDF: f(t) = λ·e^{-λt}\n`;
        steps += `   • Survival: S(t) = e^{-λt}\n`;
        steps += `   • Hazard: h(t) = f(t)/S(t) = (λ·e^{-λt})/e^{-λt} = λ\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    h(t) = λ (constant)                      │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ (rate) = ${rate}\n\n`;
        steps += `   The Exponential distribution has a CONSTANT hazard rate,\n`;
        steps += `   meaning the failure risk does not change over time (memoryless property).\n\n`;
        
        xValues.forEach(t => {
            const pdf = rate * Math.exp(-rate * t);
            const surv = Math.exp(-rate * t);
            steps += `\nFor t = ${t}:\n`;
            steps += `  Step 1: Calculate PDF: f(${t}) = λ·e^{-λt} = ${rate} × e^{-${rate}×${t}} = ${pdf.toFixed(8)}\n`;
            steps += `  Step 2: Calculate Survival: S(${t}) = e^{-λt} = e^{-${rate}×${t}} = ${surv.toFixed(8)}\n`;
            steps += `  Step 3: Calculate hazard: h(${t}) = f(${t})/S(${t}) = ${pdf.toFixed(8)}/${surv.toFixed(8)}\n`;
            steps += `  h(${t}) = ${(pdf / surv).toFixed(8)} = λ\n`;
            steps += `  Interpretation: Instantaneous failure rate is ${rate} at time ${t}\n\n`;
        });
        
    } else if (dist === 'weibull') {
        const shape = parseFloat(document.getElementById('hazardShape').value);
        const scale = parseFloat(document.getElementById('hazardScale').value);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      WEIBULL DISTRIBUTION HAZARD                 ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Weibull distribution:\n`;
        steps += `   • PDF: f(t) = (k/λ)·(t/λ)^{k-1}·e^{-(t/λ)^{k}}\n`;
        steps += `   • Survival: S(t) = e^{-(t/λ)^{k}}\n`;
        steps += `   • Hazard: h(t) = (k/λ)·(t/λ)^{k-1}\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │              h(t) = (k/λ)·(t/λ)^{k-1}                       │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Where:\n`;
        steps += `   • k = shape parameter\n`;
        steps += `   • λ = scale parameter\n\n`;
        steps += `   Given shape k = ${shape}, scale λ = ${scale}\n\n`;
        steps += `   Hazard function interpretation:\n`;
        if (shape < 1) steps += `   • k < 1: Decreasing hazard (infant mortality/burn-in period)\n`;
        else if (shape === 1) steps += `   • k = 1: Constant hazard (Exponential special case)\n`;
        else steps += `   • k > 1: Increasing hazard (wear-out period)\n\n`;
        
        xValues.forEach(t => {
            if (t < 0) {
                results.push(0);
                steps += `\nFor t = ${t} (< 0):\n`;
                steps += `  h(${t}) = 0 (hazard is zero for negative time)\n\n`;
            } else {
                const hazard = (shape / scale) * Math.pow(t / scale, shape - 1);
                results.push(hazard);
                
                steps += `\nFor t = ${t}:\n`;
                steps += `  Step 1: Calculate t/λ = ${t}/${scale} = ${(t/scale).toFixed(6)}\n`;
                steps += `  Step 2: Calculate (t/λ)^{k-1} = ${(t/scale).toFixed(6)}^${shape-1} = ${Math.pow(t/scale, shape-1).toFixed(8)}\n`;
                steps += `  Step 3: Calculate k/λ = ${shape}/${scale} = ${(shape/scale).toFixed(6)}\n`;
                steps += `  Step 4: Multiply: ${(shape/scale).toFixed(6)} × ${Math.pow(t/scale, shape-1).toFixed(8)}\n`;
                const wSurv = Math.exp(-Math.pow(t / scale, shape));
                steps += `  Step 5: Check with S(${t}) = e^{-(t/λ)^k} = ${wSurv.toFixed(8)} and f(${t}) = h(${t})·S(${t}) = ${(hazard * wSurv).toFixed(8)}\n`;
                steps += `  h(${t}) = ${hazard.toFixed(8)}\n`;
                steps += `  Interpretation: Instantaneous failure rate at time ${t} is ${hazard.toFixed(6)}\n\n`;
            }
        });
        
    } else if (dist === 'normal') {
        const mean = parseFloat(document.getElementById('hazardMean').value);
        const std = parseFloat(document.getElementById('hazardStd').value);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION HAZARD                  ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Normal distribution:\n`;
        steps += `   • PDF: f(t) = (1/(σ√(2π)))·e^{-(t-μ)²/(2σ²)}\n`;
        steps += `   • Survival: S(t) = 1 - Φ((t-μ)/σ)\n`;
        steps += `   • Hazard: h(t) = f(t)/S(t)\n\n`;
        steps += `   Given μ (mean) = ${mean}, σ (std dev) = ${std}\n\n`;
        steps += `   ⚠️ Note: Normal distribution hazard is NOT monotonic.\n`;
        steps += `   It increases and then decreases (bathtub-shaped for negative times).\n\n`;
        
        xValues.forEach(t => {
            const pdf = normalPDF(t, mean, std);
            const cdf = normalCDF(t, mean, std);
            const survival = 1 - cdf;
            const hazard = survival > 0 ? pdf / survival : Infinity;
            results.push(hazard);
            
            steps += `\nFor t = ${t}:\n`;
            steps += `  Step 1: Calculate PDF: f(${t}) = ${pdf.toFixed(8)}\n`;
            steps += `  Step 2: Calculate CDF: F(${t}) = ${cdf.toFixed(8)}\n`;
            steps += `  Step 3: Calculate Survival: S(${t}) = 1 - ${cdf.toFixed(8)} = ${survival.toFixed(8)}\n`;
            steps += `  Step 4: Calculate hazard: h(${t}) = f(${t})/S(${t}) = ${pdf.toFixed(8)}/${survival.toFixed(8)}\n`;
            steps += `  h(${t}) = ${hazard.toFixed(8)}\n`;
            if (survival > 0) {
                steps += `  Interpretation: Instantaneous failure rate at time ${t} is ${hazard.toFixed(6)}\n\n`;
            } else {
                steps += `  Interpretation: Hazard is infinite (certain failure by this time)\n\n`;
            }
        });
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    xValues.forEach((x, i) => {
        steps += `   │  h(${x}) = ${results[i].toFixed(10)}${' '.repeat(30 - results[i].toFixed(10).length)}│\n`;
    });
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { results, xValues, steps, resultStr: results.map(r => r.toFixed(6)).join(', ') };
}

// Helper functions for factorial and combinations
function factorial(n) {
    if (n < 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function combination(n, k) {
    if (k < 0 || k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
}
// ========== PARAMETER UI UPDATE FUNCTIONS FOR NEW FEATURES ==========
function updatePMFParams() {
    const dist = document.getElementById('pmfDistribution').value;
    const paramsDiv = document.getElementById('pmfParams');
    
    if (dist === 'poisson') {
        paramsDiv.innerHTML = `
            <label>📊 Lambda (λ) - Average rate:</label>
            <input type="number" id="pmfLambda" value="3" step="0.5" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">Average number of events per interval</div>
        `;
    } else if (dist === 'binomial') {
        paramsDiv.innerHTML = `
            <label>📊 Number of trials (n):</label>
            <input type="number" id="pmfN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="pmfP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

function updateSurvivalParams() {
    const dist = document.getElementById('survivalDistribution').value;
    const paramsDiv = document.getElementById('survivalParams');
    
    if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="survivalRate" value="1" step="0.5" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">Higher rate = faster failure</div>
        `;
    } else if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Mean (μ):</label>
            <input type="number" id="survivalMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="survivalStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'weibull') {
        paramsDiv.innerHTML = `
            <label>📊 Shape parameter (k):</label>
            <input type="number" id="survivalShape" value="1.5" step="0.5" min="0.1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">k < 1: decreasing hazard, k = 1: constant, k > 1: increasing</div>
            <label>📊 Scale parameter (λ):</label>
            <input type="number" id="survivalScale" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

function updateHazardParams() {
    const dist = document.getElementById('hazardDistribution').value;
    const paramsDiv = document.getElementById('hazardParams');
    
    if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="hazardRate" value="1" step="0.5" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">Constant hazard rate = λ</div>
        `;
    } else if (dist === 'weibull') {
        paramsDiv.innerHTML = `
            <label>📊 Shape parameter (k):</label>
            <input type="number" id="hazardShape" value="1.5" step="0.5" min="0.1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">k < 1: decreasing hazard, k = 1: constant, k > 1: increasing</div>
            <label>📊 Scale parameter (λ):</label>
            <input type="number" id="hazardScale" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Mean (μ):</label>
            <input type="number" id="hazardMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="hazardStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">Normal hazard is non-monotonic (increases then decreases)</div>
        `;
    }
}
// ========== PMF INTERFACE RENDER FUNCTION ==========
function renderPMFInterface() {
    return `
        <div class="stat-interface" id="statPMFInterface">
            <div class="interface-title">🎲 Probability Mass Function (PMF) - Discrete Distributions</div>
            <div class="formula-card">
                <div class="formula">📌 P(X = x) = probability of exactly x events</div>
                <div class="desc">The PMF gives the probability that a discrete random variable equals a specific value. For Poisson: P(X=k) = (e^{-λ}·λ^{k})/k! | For Binomial: P(X=k) = C(n,k)·p^{k}·(1-p)^{n-k}</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="pmfDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="poisson">Poisson Distribution</option>
                    <option value="binomial">Binomial Distribution</option>
                </select>
                
                <div id="pmfParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <label>📊 X Value(s) (k):</label>
                <textarea id="pmfXValues" rows="3" placeholder="Enter integer value(s) (comma-separated)&#10;Example: 0, 1, 2, 3, 4, 5"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="pmfComputeBtn">🎲 Calculate PMF + Steps</button>
                    <button class="secondary-btn" id="pmfClearBtn">Clear</button>
                </div>
            </div>
            <div id="pmfResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 PMF RESULTS</div>
                    <div class="result-value" id="pmfValueDisplay">—</div>
                    <div class="calculation-steps" id="pmfStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== SURVIVAL FUNCTION INTERFACE RENDER FUNCTION ==========
function renderSurvivalInterface() {
    return `
        <div class="stat-interface" id="statSurvivalInterface">
            <div class="interface-title">📉 Survival Function S(t) = 1 - F(t)</div>
            <div class="formula-card">
                <div class="formula">📌 S(t) = P(T > t) = 1 - F(t)</div>
                <div class="desc">The survival function gives the probability that a subject survives beyond time t. Used in reliability engineering and survival analysis.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="survivalDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="exponential">Exponential Distribution</option>
                    <option value="normal">Normal Distribution</option>
                    <option value="weibull">Weibull Distribution</option>
                </select>
                
                <div id="survivalParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <label>📊 Time Value(s) (t):</label>
                <textarea id="survivalXValues" rows="3" placeholder="Enter time value(s) (comma-separated)&#10;Example: 0.5, 1, 2, 5, 10"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="survivalComputeBtn">📉 Calculate Survival + Steps</button>
                    <button class="secondary-btn" id="survivalClearBtn">Clear</button>
                </div>
            </div>
            <div id="survivalResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 SURVIVAL FUNCTION RESULTS</div>
                    <div class="result-value" id="survivalValueDisplay">—</div>
                    <div class="calculation-steps" id="survivalStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== HAZARD FUNCTION INTERFACE RENDER FUNCTION ==========
function renderHazardInterface() {
    return `
        <div class="stat-interface" id="statHazardInterface">
            <div class="interface-title">⚠️ Hazard Function h(t) = f(t)/S(t)</div>
            <div class="formula-card">
                <div class="formula">📌 h(t) = f(t) / S(t)</div>
                <div class="desc">The hazard function (failure rate) gives the instantaneous rate of failure at time t, conditional on survival up to t. For Exponential: constant λ | For Weibull: (k/λ)(t/λ)^{k-1}</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="hazardDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="exponential">Exponential Distribution (Constant Hazard)</option>
                    <option value="weibull">Weibull Distribution</option>
                    <option value="normal">Normal Distribution</option>
                </select>
                
                <div id="hazardParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <label>📊 Time Value(s) (t):</label>
                <textarea id="hazardXValues" rows="3" placeholder="Enter time value(s) (comma-separated)&#10;Example: 0.5, 1, 2, 5, 10"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="hazardComputeBtn">⚠️ Calculate Hazard + Steps</button>
                    <button class="secondary-btn" id="hazardClearBtn">Clear</button>
                </div>
            </div>
            <div id="hazardResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 HAZARD FUNCTION RESULTS</div>
                    <div class="result-value" id="hazardValueDisplay">—</div>
                    <div class="calculation-steps" id="hazardStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== PMF SETUP FUNCTION ==========
function setupPMFLogic() {
    const distSelect = document.getElementById('pmfDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updatePMFParams);
        updatePMFParams();
    }
    
    const computeBtn = document.getElementById('pmfComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computePMFWithSteps();
            const resultDiv = document.getElementById('pmfResultArea');
            const valueSpan = document.getElementById('pmfValueDisplay');
            const stepsSpan = document.getElementById('pmfStepsDisplay');
            
            if (result.error) {
                resultDiv.style.display = 'block';
                valueSpan.innerText = 'Error';
                stepsSpan.innerText = result.message;
            } else {
                resultDiv.style.display = 'block';
                valueSpan.innerText = result.resultStr;
                stepsSpan.innerText = result.steps;
            }
        });
    }
    
    attachClearHandler('pmfClearBtn', 'pmfXValues', 'pmfResultArea');
}

// ========== SURVIVAL FUNCTION SETUP ==========
function setupSurvivalLogic() {
    const distSelect = document.getElementById('survivalDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateSurvivalParams);
        updateSurvivalParams();
    }
    
    const computeBtn = document.getElementById('survivalComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computeSurvivalWithSteps();
            const resultDiv = document.getElementById('survivalResultArea');
            const valueSpan = document.getElementById('survivalValueDisplay');
            const stepsSpan = document.getElementById('survivalStepsDisplay');
            
            if (result.error) {
                resultDiv.style.display = 'block';
                valueSpan.innerText = 'Error';
                stepsSpan.innerText = result.message;
            } else {
                resultDiv.style.display = 'block';
                valueSpan.innerText = result.resultStr;
                stepsSpan.innerText = result.steps;
            }
        });
    }
    
    attachClearHandler('survivalClearBtn', 'survivalXValues', 'survivalResultArea');
}

// ========== HAZARD FUNCTION SETUP ==========
function setupHazardLogic() {
    const distSelect = document.getElementById('hazardDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateHazardParams);
        updateHazardParams();
    }
    
    const computeBtn = document.getElementById('hazardComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computeHazardWithSteps();
            const resultDiv = document.getElementById('hazardResultArea');
            const valueSpan = document.getElementById('hazardValueDisplay');
            const stepsSpan = document.getElementById('hazardStepsDisplay');
            
            if (result.error) {
                resultDiv.style.display = 'block';
                valueSpan.innerText = 'Error';
                stepsSpan.innerText = result.message;
            } else {
                resultDiv.style.display = 'block';
                valueSpan.innerText = result.resultStr;
                stepsSpan.innerText = result.steps;
            }
        });
    }
    
    attachClearHandler('hazardClearBtn', 'hazardXValues', 'hazardResultArea');
}
// ========== DISTRIBUTION ENTROPY RENDER FUNCTION ==========
function renderEntropyInterface() {
    return `
        <div class="stat-interface" id="statEntropyInterface">
            <div class="interface-title">📊 Distribution Entropy H(X)</div>
            <div class="formula-card">
                <div class="formula">📌 Continuous: H(X) = -∫ f(x)·ln(f(x)) dx | Discrete: H(X) = -Σ P(x)·ln(P(x))</div>
                <div class="desc">Entropy measures the uncertainty or randomness in a probability distribution. Higher entropy = more uncertainty/randomness.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="entropyDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="beta">Beta Distribution</option>
                    <option value="poisson">Poisson Distribution (Discrete)</option>
                    <option value="binomial">Binomial Distribution (Discrete)</option>
                </select>
                
                <div id="entropyParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="entropyComputeBtn">📊 Calculate Entropy + Steps</button>
                    <button class="secondary-btn" id="entropyClearBtn">Clear</button>
                </div>
            </div>
            <div id="entropyResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 DISTRIBUTION ENTROPY H(X)</div>
                    <div class="result-value" id="entropyValueDisplay">—</div>
                    <div class="calculation-steps" id="entropyStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== DISTRIBUTION SKEWNESS RENDER FUNCTION ==========
function renderDistSkewnessInterface() {
    return `
        <div class="stat-interface" id="statDistSkewnessInterface">
            <div class="interface-title">📈 Distribution Skewness γ₁</div>
            <div class="formula-card">
                <div class="formula">📌 γ₁ = E[(X-μ)³]/σ³ = μ₃/σ³</div>
                <div class="desc">Skewness measures asymmetry of a distribution. 0 = symmetric, >0 = right-skewed, <0 = left-skewed.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="distSkewnessDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="beta">Beta Distribution</option>
                    <option value="poisson">Poisson Distribution (Discrete)</option>
                    <option value="binomial">Binomial Distribution (Discrete)</option>
                </select>
                
                <div id="distSkewnessParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="distSkewnessComputeBtn">📈 Calculate Skewness + Steps</button>
                    <button class="secondary-btn" id="distSkewnessClearBtn">Clear</button>
                </div>
            </div>
            <div id="distSkewnessResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 DISTRIBUTION SKEWNESS γ₁</div>
                    <div class="result-value" id="distSkewnessValueDisplay">—</div>
                    <div class="calculation-steps" id="distSkewnessStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== DISTRIBUTION KURTOSIS RENDER FUNCTION ==========
function renderDistKurtosisInterface() {
    return `
        <div class="stat-interface" id="statDistKurtosisInterface">
            <div class="interface-title">🎯 Distribution Kurtosis γ₂</div>
            <div class="formula-card">
                <div class="formula">📌 γ₂ = E[(X-μ)⁴]/σ⁴ - 3 (Excess Kurtosis)</div>
                <div class="desc">Kurtosis measures tail heaviness. 0 = mesokurtic (normal), >0 = leptokurtic (heavy tails), <0 = platykurtic (light tails).</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="distKurtosisDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="beta">Beta Distribution</option>
                    <option value="poisson">Poisson Distribution (Discrete)</option>
                    <option value="binomial">Binomial Distribution (Discrete)</option>
                </select>
                
                <div id="distKurtosisParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="distKurtosisComputeBtn">🎯 Calculate Kurtosis + Steps</button>
                    <button class="secondary-btn" id="distKurtosisClearBtn">Clear</button>
                </div>
            </div>
            <div id="distKurtosisResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 DISTRIBUTION KURTOSIS γ₂</div>
                    <div class="result-value" id="distKurtosisValueDisplay">—</div>
                    <div class="calculation-steps" id="distKurtosisStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== ENTROPY COMPUTATION FUNCTIONS ==========
function updateEntropyParams() {
    const dist = document.getElementById('entropyDistribution').value;
    const paramsDiv = document.getElementById('entropyParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="entropyStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc">Entropy for Normal: H = ln(σ√(2πe))</div>
        `;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="entropyRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc">Entropy for Exponential: H = 1 - ln(λ)</div>
        `;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `
            <label>📊 Minimum (a):</label>
            <input type="number" id="entropyMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="entropyMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc">Entropy for Uniform: H = ln(b-a)</div>
        `;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `
            <label>📊 Alpha (α):</label>
            <input type="number" id="entropyAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="entropyBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'poisson') {
        paramsDiv.innerHTML = `
            <label>📊 Lambda (λ):</label>
            <input type="number" id="entropyLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'binomial') {
        paramsDiv.innerHTML = `
            <label>📊 Number of trials (n):</label>
            <input type="number" id="entropyN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="entropyP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

function computeEntropyWithSteps(distType, params) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                    DISTRIBUTION ENTROPY H(X) CALCULATION            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS DISTRIBUTION ENTROPY?                                  │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Entropy measures the uncertainty or randomness in a distribution.\n\n`;
    steps += `   For continuous distributions: H(X) = -∫ f(x)·ln(f(x)) dx\n`;
    steps += `   For discrete distributions:   H(X) = -Σ P(x)·ln(P(x))\n\n`;
    steps += `   Higher entropy = more uncertainty/randomness.\n\n`;
    
    let entropy = 0;
    
    if (distType === 'normal') {
        const stdDev = params.stdDev;
        entropy = Math.log(stdDev * Math.sqrt(2 * Math.PI * Math.E));
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION ENTROPY                 ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: H = ln(σ√(2πe))\n\n`;
        steps += `   Given σ = ${stdDev}\n`;
        steps += `   σ√(2πe) = ${stdDev} × √(2πe) = ${stdDev} × ${Math.sqrt(2 * Math.PI * Math.E).toFixed(6)} = ${(stdDev * Math.sqrt(2 * Math.PI * Math.E)).toFixed(6)}\n`;
        steps += `   H = ln(${(stdDev * Math.sqrt(2 * Math.PI * Math.E)).toFixed(6)}) = ${entropy.toFixed(8)}\n\n`;
        
    } else if (distType === 'exponential') {
        const rate = params.rate;
        entropy = 1 - Math.log(rate);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION ENTROPY               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: H = 1 - ln(λ)\n\n`;
        steps += `   Given λ = ${rate}\n`;
        steps += `   ln(λ) = ln(${rate}) = ${Math.log(rate).toFixed(6)}\n`;
        steps += `   H = 1 - ${Math.log(rate).toFixed(6)} = ${entropy.toFixed(8)}\n\n`;
        
    } else if (distType === 'uniform') {
        const min = params.min;
        const max = params.max;
        entropy = Math.log(max - min);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     UNIFORM DISTRIBUTION ENTROPY                 ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: H = ln(b - a)\n\n`;
        steps += `   Given a = ${min}, b = ${max}\n`;
        steps += `   b - a = ${max} - ${min} = ${(max-min).toFixed(6)}\n`;
        steps += `   H = ln(${(max-min).toFixed(6)}) = ${entropy.toFixed(8)}\n\n`;
        
    } else if (distType === 'beta') {
        const alpha = params.alpha;
        const beta = params.beta;
        const B = betaFunction(alpha, beta);
        const psi = digamma(alpha + beta);
        entropy = Math.log(B) - (alpha - 1) * digamma(alpha) - (beta - 1) * digamma(beta) + (alpha + beta - 2) * psi;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                       BETA DISTRIBUTION ENTROPY                  ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: H = ln(B(α,β)) - (α-1)ψ(α) - (β-1)ψ(β) + (α+β-2)ψ(α+β)\n\n`;
        steps += `   Given α = ${alpha}, β = ${beta}\n`;
        steps += `   H = ${entropy.toFixed(8)}\n\n`;
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        entropy = lambda * (1 - Math.log(lambda)) + Math.exp(-lambda) * 
                  (lambda * Math.log(lambda) + (1 - lambda) * Math.log(1 + 1/lambda) - 
                   lambda * Math.log(2 * Math.PI * lambda) / 2);
        // Approximation
        entropy = 0.5 * Math.log(2 * Math.PI * Math.E * lambda) - 1/(12 * lambda) - 1/(24 * lambda * lambda);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION ENTROPY                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Approximation: H ≈ ½ ln(2πeλ) - 1/(12λ) - 1/(24λ²)\n\n`;
        steps += `   Given λ = ${lambda}\n`;
        steps += `   H = ${entropy.toFixed(8)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        entropy = 0.5 * Math.log(2 * Math.PI * Math.E * n * p * (1 - p));
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION ENTROPY                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Approximation: H ≈ ½ ln(2πe n p (1-p))\n\n`;
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   n·p·(1-p) = ${n} × ${p} × ${(1-p).toFixed(6)} = ${(n * p * (1-p)).toFixed(6)}\n`;
        steps += `   H = ½ ln(2πe × ${(n * p * (1-p)).toFixed(6)}) = ${entropy.toFixed(8)}\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │                    H(X) = ${entropy.toFixed(10)}                     │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { entropy, steps };
}

// Helper function for digamma (approximation)
function digamma(x) {
    if (x <= 0) return 0;
    let result = 0;
    // Use asymptotic expansion for large x
    if (x < 7) {
        result = digamma(x + 1) - 1/x;
    } else {
        const invX = 1/x;
        result = Math.log(x) - 0.5 * invX - 1/(12 * x * x) + 1/(120 * x * x * x * x);
    }
    return result;
}

// ========== DISTRIBUTION SKEWNESS COMPUTATION ==========
function updateDistSkewnessParams() {
    const dist = document.getElementById('distSkewnessDistribution').value;
    const paramsDiv = document.getElementById('distSkewnessParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `<div class="desc">Normal distribution skewness = 0 (symmetric)</div>`;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `<label>📊 Rate (λ):</label>
            <input type="number" id="distSkewnessRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `<div class="desc">Uniform distribution skewness = 0 (symmetric)</div>`;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `<label>📊 Alpha (α):</label>
            <input type="number" id="distSkewnessAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="distSkewnessBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`;
    } else if (dist === 'poisson') {
        paramsDiv.innerHTML = `<label>📊 Lambda (λ):</label>
            <input type="number" id="distSkewnessLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`;
    } else if (dist === 'binomial') {
        paramsDiv.innerHTML = `<label>📊 Number of trials (n):</label>
            <input type="number" id="distSkewnessN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="distSkewnessP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`;
    }
}

function computeDistSkewnessWithSteps(distType, params) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                    DISTRIBUTION SKEWNESS γ₁ CALCULATION            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS DISTRIBUTION SKEWNESS?                                 │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Skewness measures asymmetry of a distribution:\n\n`;
    steps += `   Formula: γ₁ = E[(X-μ)³]/σ³ = μ₃/σ³\n\n`;
    steps += `   • γ₁ = 0 → Symmetric (e.g., Normal)\n`;
    steps += `   • γ₁ > 0 → Right-skewed (tail on right)\n`;
    steps += `   • γ₁ < 0 → Left-skewed (tail on left)\n\n`;
    
    let skewness = 0;
    
    if (distType === 'normal') {
        skewness = 0;
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION SKEWNESS               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   The Normal distribution is perfectly symmetric.\n`;
        steps += `   Therefore, γ₁ = 0\n\n`;
        
    } else if (distType === 'exponential') {
        skewness = 2;
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION SKEWNESS              ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   The Exponential distribution has constant skewness = 2\n`;
        steps += `   (independent of the rate parameter λ)\n\n`;
        steps += `   γ₁ = 2 (positive, right-skewed)\n\n`;
        
    } else if (distType === 'uniform') {
        skewness = 0;
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     UNIFORM DISTRIBUTION SKEWNESS                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   The Uniform distribution is symmetric.\n`;
        steps += `   Therefore, γ₁ = 0\n\n`;
        
    } else if (distType === 'beta') {
        const alpha = params.alpha;
        const beta = params.beta;
        skewness = 2 * (beta - alpha) * Math.sqrt(alpha + beta + 1) / ((alpha + beta + 2) * Math.sqrt(alpha * beta));
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                       BETA DISTRIBUTION SKEWNESS                 ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: γ₁ = 2(β-α)√(α+β+1) / [(α+β+2)√(αβ)]\n\n`;
        steps += `   Given α = ${alpha}, β = ${beta}\n`;
        steps += `   β-α = ${beta - alpha}\n`;
        steps += `   α+β+1 = ${alpha + beta + 1}\n`;
        steps += `   α+β+2 = ${alpha + beta + 2}\n`;
        steps += `   αβ = ${alpha * beta}\n`;
        steps += `   γ₁ = ${skewness.toFixed(8)}\n\n`;
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        skewness = 1 / Math.sqrt(lambda);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION SKEWNESS               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: γ₁ = 1/√λ\n\n`;
        steps += `   Given λ = ${lambda}\n`;
        steps += `   γ₁ = 1/√${lambda} = ${skewness.toFixed(8)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        skewness = (1 - 2 * p) / Math.sqrt(n * p * (1 - p));
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION SKEWNESS               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: γ₁ = (1-2p)/√[np(1-p)]\n\n`;
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   1-2p = ${(1 - 2 * p).toFixed(6)}\n`;
        steps += `   np(1-p) = ${n} × ${p} × ${(1-p).toFixed(6)} = ${(n * p * (1-p)).toFixed(6)}\n`;
        steps += `   γ₁ = ${skewness.toFixed(8)}\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │                    γ₁ = ${skewness.toFixed(10)}                      │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { skewness, steps };
}

// ========== DISTRIBUTION KURTOSIS COMPUTATION ==========
function updateDistKurtosisParams() {
    const dist = document.getElementById('distKurtosisDistribution').value;
    const paramsDiv = document.getElementById('distKurtosisParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `<div class="desc">Normal distribution excess kurtosis = 0 (mesokurtic)</div>`;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `<label>📊 Rate (λ):</label>
            <input type="number" id="distKurtosisRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `<div class="desc">Uniform distribution excess kurtosis = -1.2 (platykurtic)</div>`;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `<label>📊 Alpha (α):</label>
            <input type="number" id="distKurtosisAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="distKurtosisBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`;
    } else if (dist === 'poisson') {
        paramsDiv.innerHTML = `<label>📊 Lambda (λ):</label>
            <input type="number" id="distKurtosisLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`;
    } else if (dist === 'binomial') {
        paramsDiv.innerHTML = `<label>📊 Number of trials (n):</label>
            <input type="number" id="distKurtosisN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="distKurtosisP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`;
    }
}

function computeDistKurtosisWithSteps(distType, params) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                    DISTRIBUTION KURTOSIS γ₂ CALCULATION            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS DISTRIBUTION KURTOSIS?                                 │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Excess Kurtosis measures tail heaviness:\n\n`;
    steps += `   Formula: γ₂ = E[(X-μ)⁴]/σ⁴ - 3\n\n`;
    steps += `   • γ₂ = 0 → Mesokurtic (normal-like tails)\n`;
    steps += `   • γ₂ > 0 → Leptokurtic (heavy tails, more outliers)\n`;
    steps += `   • γ₂ < 0 → Platykurtic (light tails, fewer outliers)\n\n`;
    
    let kurtosis = 0;
    
    if (distType === 'normal') {
        kurtosis = 0;
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION KURTOSIS                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   The Normal distribution has excess kurtosis = 0\n`;
        steps += `   (by definition, it is the reference)\n\n`;
        steps += `   γ₂ = 0 (mesokurtic)\n\n`;
        
    } else if (distType === 'exponential') {
        kurtosis = 6;
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION KURTOSIS              ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   The Exponential distribution has constant excess kurtosis = 6\n`;
        steps += `   (independent of the rate parameter λ)\n\n`;
        steps += `   γ₂ = 6 (leptokurtic, heavy tails)\n\n`;
        
    } else if (distType === 'uniform') {
        kurtosis = -1.2;
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     UNIFORM DISTRIBUTION KURTOSIS                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   The Uniform distribution has excess kurtosis = -6/5 = -1.2\n\n`;
        steps += `   γ₂ = -1.2 (platykurtic, light tails)\n\n`;
        
    } else if (distType === 'beta') {
        const alpha = params.alpha;
        const beta = params.beta;
        const numerator = 6 * (Math.pow(alpha - beta, 2) * (alpha + beta + 1) - alpha * beta * (alpha + beta + 2));
        const denominator = alpha * beta * (alpha + beta + 2) * (alpha + beta + 3);
        kurtosis = numerator / denominator;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                       BETA DISTRIBUTION KURTOSIS                 ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: γ₂ = 6[(α-β)²(α+β+1) - αβ(α+β+2)] / [αβ(α+β+2)(α+β+3)]\n\n`;
        steps += `   Given α = ${alpha}, β = ${beta}\n`;
        steps += `   γ₂ = ${kurtosis.toFixed(8)}\n\n`;
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        kurtosis = 1 / lambda;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION KURTOSIS               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: γ₂ = 1/λ\n\n`;
        steps += `   Given λ = ${lambda}\n`;
        steps += `   γ₂ = 1/${lambda} = ${kurtosis.toFixed(8)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        kurtosis = (1 - 6 * p * (1 - p)) / (n * p * (1 - p));
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION KURTOSIS               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: γ₂ = [1 - 6p(1-p)] / [np(1-p)]\n\n`;
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   p(1-p) = ${p} × ${(1-p).toFixed(6)} = ${(p * (1-p)).toFixed(6)}\n`;
        steps += `   1 - 6p(1-p) = 1 - ${(6 * p * (1-p)).toFixed(6)} = ${(1 - 6 * p * (1-p)).toFixed(6)}\n`;
        steps += `   γ₂ = ${kurtosis.toFixed(8)}\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │                    γ₂ = ${kurtosis.toFixed(10)}                      │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { kurtosis, steps };
}

// ========== SETUP FUNCTIONS FOR NEW FEATURES ==========
function setupEntropyLogic() {
    const distSelect = document.getElementById('entropyDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateEntropyParams);
        updateEntropyParams();
    }
    
    const computeBtn = document.getElementById('entropyComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById('entropyDistribution').value;
            let params = {};
            
            if (dist === 'normal') {
                params.stdDev = parseFloat(document.getElementById('entropyStd').value);
            } else if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById('entropyRate').value);
            } else if (dist === 'uniform') {
                params.min = parseFloat(document.getElementById('entropyMin').value);
                params.max = parseFloat(document.getElementById('entropyMax').value);
            } else if (dist === 'beta') {
                params.alpha = parseFloat(document.getElementById('entropyAlpha').value);
                params.beta = parseFloat(document.getElementById('entropyBeta').value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById('entropyLambda').value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById('entropyN').value);
                params.p = parseFloat(document.getElementById('entropyP').value);
            }
            
            const result = computeEntropyWithSteps(dist, params);
            const resultDiv = document.getElementById('entropyResultArea');
            const valueSpan = document.getElementById('entropyValueDisplay');
            const stepsSpan = document.getElementById('entropyStepsDisplay');
            
            resultDiv.style.display = 'block';
            valueSpan.innerHTML = `H(X) = ${result.entropy.toFixed(6)}`;
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler('entropyClearBtn', '', 'entropyResultArea');
}

function setupDistSkewnessLogic() {
    const distSelect = document.getElementById('distSkewnessDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateDistSkewnessParams);
        updateDistSkewnessParams();
    }
    
    const computeBtn = document.getElementById('distSkewnessComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById('distSkewnessDistribution').value;
            let params = {};
            
            if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById('distSkewnessRate').value);
            } else if (dist === 'beta') {
                params.alpha = parseFloat(document.getElementById('distSkewnessAlpha').value);
                params.beta = parseFloat(document.getElementById('distSkewnessBeta').value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById('distSkewnessLambda').value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById('distSkewnessN').value);
                params.p = parseFloat(document.getElementById('distSkewnessP').value);
            }
            
            const result = computeDistSkewnessWithSteps(dist, params);
            const resultDiv = document.getElementById('distSkewnessResultArea');
            const valueSpan = document.getElementById('distSkewnessValueDisplay');
            const stepsSpan = document.getElementById('distSkewnessStepsDisplay');
            
            resultDiv.style.display = 'block';
            valueSpan.innerHTML = `γ₁ = ${result.skewness.toFixed(6)}`;
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler('distSkewnessClearBtn', '', 'distSkewnessResultArea');
}

function setupDistKurtosisLogic() {
    const distSelect = document.getElementById('distKurtosisDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateDistKurtosisParams);
        updateDistKurtosisParams();
    }
    
    const computeBtn = document.getElementById('distKurtosisComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById('distKurtosisDistribution').value;
            let params = {};
            
            if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById('distKurtosisRate').value);
            } else if (dist === 'beta') {
                params.alpha = parseFloat(document.getElementById('distKurtosisAlpha').value);
                params.beta = parseFloat(document.getElementById('distKurtosisBeta').value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById('distKurtosisLambda').value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById('distKurtosisN').value);
                params.p = parseFloat(document.getElementById('distKurtosisP').value);
            }
            
            const result = computeDistKurtosisWithSteps(dist, params);
            const resultDiv = document.getElementById('distKurtosisResultArea');
            const valueSpan = document.getElementById('distKurtosisValueDisplay');
            const stepsSpan = document.getElementById('distKurtosisStepsDisplay');
            
            resultDiv.style.display = 'block';
            valueSpan.innerHTML = `γ₂ = ${result.kurtosis.toFixed(6)}`;
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler('distKurtosisClearBtn', '', 'distKurtosisResultArea');
}
// ========== POINT-BISERIAL CORRELATION (r_pb) ==========
function computePointBiserialWithSteps(xContinuous, yBinary) {
    if (!xContinuous.length || !yBinary.length) {
        return { error: true, message: "Please enter both continuous and binary variables." };
    }
    if (xContinuous.length !== yBinary.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xContinuous.length < 3) {
        return { error: true, message: "Need at least 3 pairs for meaningful correlation." };
    }
    
    const n = xContinuous.length;
    let sumX = 0, sumX1 = 0, sumX0 = 0;
    let n1 = 0, n0 = 0;
    let values1 = [], values0 = [];
    
    for (let i = 0; i < n; i++) {
        sumX += xContinuous[i];
        if (yBinary[i] === 1) {
            n1++;
            sumX1 += xContinuous[i];
            values1.push(xContinuous[i]);
        } else if (yBinary[i] === 0) {
            n0++;
            sumX0 += xContinuous[i];
            values0.push(xContinuous[i]);
        }
    }
    
    // Validate binary values
    if (n1 + n0 !== n) {
        return { error: true, message: "Binary variable must contain only 0 and 1 values." };
    }
    
    const meanX = sumX / n;
    const meanX1 = n1 > 0 ? sumX1 / n1 : 0;
    const meanX0 = n0 > 0 ? sumX0 / n0 : 0;
    
    let sumSqDiff = 0;
    for (let i = 0; i < n; i++) {
        sumSqDiff += Math.pow(xContinuous[i] - meanX, 2);
    }
    const sdX = Math.sqrt(sumSqDiff / n);
    
    const r_pb = (meanX1 - meanX0) / sdX * Math.sqrt((n1 * n0) / (n * n));
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <div style="background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🎯</span>
                <h2 style="margin: 0;">Point-Biserial Correlation (r<sub>pb</sub>)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: r<sub>pb</sub> = (M₁ - M₀)/s<sub>X</sub> × √[(n₁·n₀)/(n²)]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Measures correlation between a continuous variable and a true binary variable (0/1).</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #6a1b9a;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #6a1b9a;">
                    <div style="font-size: 12px; color: #6c757d;">Total Pairs</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Group 1 (Y=1)</div>
                    <div style="font-size: 20px; font-weight: 600;">n₁ = ${n1}</div>
                    <div style="font-size: 13px;">Mean₁ = ${meanX1.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #dc3545;">
                    <div style="font-size: 12px; color: #6c757d;">Group 0 (Y=0)</div>
                    <div style="font-size: 20px; font-weight: 600;">n₀ = ${n0}</div>
                    <div style="font-size: 13px;">Mean₀ = ${meanX0.toFixed(4)}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #6a1b9a;">📋 Input Data</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #6a1b9a; color: white;">
                        <th style="padding: 10px;">i</th>
                        <th style="padding: 10px;">X (Continuous)</th>
                        <th style="padding: 10px;">Y (Binary 0/1)</th>
                    </tr>
                </thead>
                <tbody>`;
    for (let i = 0; i < n; i++) {
        steps += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${xContinuous[i]}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: ${yBinary[i] === 1 ? '#28a745' : '#dc3545'};">${yBinary[i]}</td>
        </tr>`;
    }
    steps += `</tbody>${"</table>"}</div>
        
        <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #6a1b9a;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate Group Means</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div>M₁ = ΣX(Y=1) / n₁ = ${sumX1} / ${n1} = ${meanX1.toFixed(6)}</div>
                    <div>M₀ = ΣX(Y=0) / n₀ = ${sumX0} / ${n0} = ${meanX0.toFixed(6)}</div>
                    <div>M₁ - M₀ = ${(meanX1 - meanX0).toFixed(6)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate Standard Deviation of X</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div>Mean X (overall) = ${meanX.toFixed(6)}</div>
                    <div>Σ(X - X̄)² = ${sumSqDiff.toFixed(6)}</div>
                    <div>s<sub>X</sub> = √(${sumSqDiff.toFixed(6)} / ${n}) = ${sdX.toFixed(6)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Calculate Point-Biserial Correlation</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div>r<sub>pb</sub> = (M₁ - M₀) / s<sub>X</sub> × √[(n₁·n₀) / n²]</div>
                    <div>= ${(meanX1 - meanX0).toFixed(6)} / ${sdX.toFixed(6)} × √[(${n1} × ${n0}) / ${n}²]</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × √[${n1*n0} / ${n*n}]</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × √${(n1*n0/(n*n)).toFixed(6)}</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × ${Math.sqrt(n1*n0/(n*n)).toFixed(6)}</div>
                    <div style="font-size: 20px; font-weight: 700; color: #6a1b9a; margin-top: 12px;">r<sub>pb</sub> = ${r_pb.toFixed(8)}</div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: #f3e5f5; border-left: 6px solid #6a1b9a;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <div><strong>Point-Biserial Correlation:</strong> r<sub>pb</sub> = ${r_pb.toFixed(6)}</div>
            <div><strong>Direction:</strong> ${r_pb > 0 ? 'Positive (higher X associated with Y=1)' : (r_pb < 0 ? 'Negative (higher X associated with Y=0)' : 'No association')}</div>
            <div><strong>Strength:</strong> ${Math.abs(r_pb) >= 0.7 ? 'Strong' : (Math.abs(r_pb) >= 0.5 ? 'Moderate' : (Math.abs(r_pb) >= 0.3 ? 'Weak' : 'Very Weak or No'))} relationship</div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Practical Meaning:</strong> The point-biserial correlation is equivalent to the Pearson correlation when Y is binary (0/1). 
                It tells you how well the continuous variable can distinguish between the two binary groups.
            </div>
        </div>
    </div>`;
    
    return { r_pb, steps, n1, n0, meanX1, meanX0, sdX };
}

// ========== PARTIAL CORRELATION (r_xy.z) ==========
// ========== PARTIAL CORRELATION (r_xy.z) - COMPLETELY FIXED WITH FULL DETAILS ==========
function computePartialCorrelationWithSteps(x, y, z) {
    if (!x.length || !y.length || !z.length) {
        return { error: true, message: "Please enter X, Y, and Z variables." };
    }
    if (x.length !== y.length || x.length !== z.length) {
        return { error: true, message: "X, Y, and Z must have the same number of values." };
    }
    if (x.length < 5) {
        return { error: true, message: "Need at least 5 observations for meaningful partial correlation." };
    }
    
    const n = x.length;
    
    // Calculate means
    const meanX = x.reduce((s, v) => s + v, 0) / n;
    const meanY = y.reduce((s, v) => s + v, 0) / n;
    const meanZ = z.reduce((s, v) => s + v, 0) / n;
    
    // ========== CALCULATE r_xy WITH FULL DETAILS ==========
    let xy_sumAB = 0, xy_sumAA = 0, xy_sumBB = 0;
    let xy_details = "";
    
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        const product = dx * dy;
        xy_sumAB += product;
        xy_sumAA += dx * dx;
        xy_sumBB += dy * dy;
        xy_details += `      (${x[i]} - ${meanX.toFixed(4)}) × (${y[i]} - ${meanY.toFixed(4)}) = ${dx.toFixed(4)} × ${dy.toFixed(4)} = ${product.toFixed(4)}\n`;
    }
    const r_xy = xy_sumAB / Math.sqrt(xy_sumAA * xy_sumBB);
    
    // ========== CALCULATE r_xz WITH FULL DETAILS ==========
    let xz_sumAB = 0, xz_sumAA = 0, xz_sumBB = 0;
    let xz_details = "";
    
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dz = z[i] - meanZ;
        const product = dx * dz;
        xz_sumAB += product;
        xz_sumAA += dx * dx;
        xz_sumBB += dz * dz;
        xz_details += `      (${x[i]} - ${meanX.toFixed(4)}) × (${z[i]} - ${meanZ.toFixed(4)}) = ${dx.toFixed(4)} × ${dz.toFixed(4)} = ${product.toFixed(4)}\n`;
    }
    const r_xz = xz_sumAB / Math.sqrt(xz_sumAA * xz_sumBB);
    
    // ========== CALCULATE r_yz WITH FULL DETAILS ==========
    let yz_sumAB = 0, yz_sumAA = 0, yz_sumBB = 0;
    let yz_details = "";
    
    for (let i = 0; i < n; i++) {
        const dy = y[i] - meanY;
        const dz = z[i] - meanZ;
        const product = dy * dz;
        yz_sumAB += product;
        yz_sumAA += dy * dy;
        yz_sumBB += dz * dz;
        yz_details += `      (${y[i]} - ${meanY.toFixed(4)}) × (${z[i]} - ${meanZ.toFixed(4)}) = ${dy.toFixed(4)} × ${dz.toFixed(4)} = ${product.toFixed(4)}\n`;
    }
    const r_yz = yz_sumAB / Math.sqrt(yz_sumAA * yz_sumBB);
    
    // ========== PARTIAL CORRELATION ==========
    const numerator = r_xy - r_xz * r_yz;
    const denominator = Math.sqrt((1 - r_xz * r_xz) * (1 - r_yz * r_yz));
    const r_xy_z = numerator / denominator;
    
    // Build the complete HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <div style="background: linear-gradient(135deg, #e65100 0%, #bf360c 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🔗</span>
                <h2 style="margin: 0;">Partial Correlation (r<sub>xy·z</sub>)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: r<sub>xy·z</sub> = (r<sub>xy</sub> - r<sub>xz</sub>·r<sub>yz</sub>) / √[(1 - r<sub>xz</sub>²)(1 - r<sub>yz</sub>²)]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Measures correlation between X and Y after removing the linear effect of Z.</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #e65100;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #e65100;">
                    <div style="font-size: 12px;">Number of Observations</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">X̄ (Mean X)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanX.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Ȳ (Mean Y)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanY.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Z̄ (Mean Z)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanZ.toFixed(4)}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #e65100;">📋 Input Data</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e65100; color: white;">
                        <th style="padding: 10px;">i</th>
                        <th style="padding: 10px;">X</th>
                        <th style="padding: 10px;">Y</th>
                        <th style="padding: 10px;">Z (Control)</th>
                    </tr>
                </thead>
                <tbody>`;
    for (let i = 0; i < n; i++) {
        steps += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${x[i]}</td>
            <td style="padding: 8px; text-align: center;">${y[i]}</td>
            <td style="padding: 8px; text-align: center;">${z[i]}</td>
         </tr>`;
    }
    steps += `</tbody>
             </table>
        </div>`;
    
    // ========== SECTION 1: r_xy DETAILS ==========
    steps += `
        <div style="background: #e3f2fd; border-radius: 16px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #1565c0;">
            <h3 style="margin: 0 0 16px 0; color: #1565c0;">📐 Step 1: Calculate r<sub>xy</sub> (Correlation between X and Y)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 13px; line-height: 1.6;">
                    <strong>Formula:</strong> r<sub>xy</sub> = Σ[(x - x̄)(y - ȳ)] / √[Σ(x - x̄)² × Σ(y - ȳ)²]<br><br>
                    <strong>Means:</strong> x̄ = ${meanX.toFixed(6)}, ȳ = ${meanY.toFixed(6)}<br><br>
                    <strong>Deviations and Products:</strong><br>
                    ${xy_details.replace(/\n/g, '<br>')}<br>
                    <strong>Summations:</strong><br>
                    &nbsp;&nbsp;Σ[(x - x̄)(y - ȳ)] = ${xy_sumAB.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(x - x̄)² = ${xy_sumAA.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(y - ȳ)² = ${xy_sumBB.toFixed(6)}<br><br>
                    <strong>Calculation:</strong><br>
                    &nbsp;&nbsp;r<sub>xy</sub> = ${xy_sumAB.toFixed(6)} / √(${xy_sumAA.toFixed(6)} × ${xy_sumBB.toFixed(6)})<br>
                    &nbsp;&nbsp;r<sub>xy</sub> = ${xy_sumAB.toFixed(6)} / ${Math.sqrt(xy_sumAA * xy_sumBB).toFixed(6)}<br>
                    <div style="background: #1565c0; color: white; padding: 8px 12px; border-radius: 8px; display: inline-block; margin-top: 8px;">
                        ✅ r<sub>xy</sub> = ${r_xy.toFixed(8)}
                    </div>
                </div>
            </div>
        </div>`;
    
    // ========== SECTION 2: r_xz DETAILS ==========
    steps += `
        <div style="background: #e8f5e9; border-radius: 16px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #2e7d32;">
            <h3 style="margin: 0 0 16px 0; color: #2e7d32;">📐 Step 2: Calculate r<sub>xz</sub> (Correlation between X and Z)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 13px; line-height: 1.6;">
                    <strong>Formula:</strong> r<sub>xz</sub> = Σ[(x - x̄)(z - z̄)] / √[Σ(x - x̄)² × Σ(z - z̄)²]<br><br>
                    <strong>Means:</strong> x̄ = ${meanX.toFixed(6)}, z̄ = ${meanZ.toFixed(6)}<br><br>
                    <strong>Deviations and Products:</strong><br>
                    ${xz_details.replace(/\n/g, '<br>')}<br>
                    <strong>Summations:</strong><br>
                    &nbsp;&nbsp;Σ[(x - x̄)(z - z̄)] = ${xz_sumAB.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(x - x̄)² = ${xz_sumAA.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(z - z̄)² = ${xz_sumBB.toFixed(6)}<br><br>
                    <strong>Calculation:</strong><br>
                    &nbsp;&nbsp;r<sub>xz</sub> = ${xz_sumAB.toFixed(6)} / √(${xz_sumAA.toFixed(6)} × ${xz_sumBB.toFixed(6)})<br>
                    &nbsp;&nbsp;r<sub>xz</sub> = ${xz_sumAB.toFixed(6)} / ${Math.sqrt(xz_sumAA * xz_sumBB).toFixed(6)}<br>
                    <div style="background: #2e7d32; color: white; padding: 8px 12px; border-radius: 8px; display: inline-block; margin-top: 8px;">
                        ✅ r<sub>xz</sub> = ${r_xz.toFixed(8)}
                    </div>
                </div>
            </div>
        </div>`;
    
    // ========== SECTION 3: r_yz DETAILS ==========
    steps += `
        <div style="background: #fff3e0; border-radius: 16px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #e65100;">
            <h3 style="margin: 0 0 16px 0; color: #e65100;">📐 Step 3: Calculate r<sub>yz</sub> (Correlation between Y and Z)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 13px; line-height: 1.6;">
                    <strong>Formula:</strong> r<sub>yz</sub> = Σ[(y - ȳ)(z - z̄)] / √[Σ(y - ȳ)² × Σ(z - z̄)²]<br><br>
                    <strong>Means:</strong> ȳ = ${meanY.toFixed(6)}, z̄ = ${meanZ.toFixed(6)}<br><br>
                    <strong>Deviations and Products:</strong><br>
                    ${yz_details.replace(/\n/g, '<br>')}<br>
                    <strong>Summations:</strong><br>
                    &nbsp;&nbsp;Σ[(y - ȳ)(z - z̄)] = ${yz_sumAB.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(y - ȳ)² = ${yz_sumAA.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(z - z̄)² = ${yz_sumBB.toFixed(6)}<br><br>
                    <strong>Calculation:</strong><br>
                    &nbsp;&nbsp;r<sub>yz</sub> = ${yz_sumAB.toFixed(6)} / √(${yz_sumAA.toFixed(6)} × ${yz_sumBB.toFixed(6)})<br>
                    &nbsp;&nbsp;r<sub>yz</sub> = ${yz_sumAB.toFixed(6)} / ${Math.sqrt(yz_sumAA * yz_sumBB).toFixed(6)}<br>
                    <div style="background: #e65100; color: white; padding: 8px 12px; border-radius: 8px; display: inline-block; margin-top: 8px;">
                        ✅ r<sub>yz</sub> = ${r_yz.toFixed(8)}
                    </div>
                </div>
            </div>
        </div>`;
    
    // ========== SECTION 4: PARTIAL CORRELATION ==========
    steps += `
        <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #6a1b9a;">🔢 Step 4: Calculate Partial Correlation r<sub>xy·z</sub></h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Collected Correlation Values</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 16px;">
                    <div>r<sub>xy</sub> = ${r_xy.toFixed(8)}</div>
                    <div>r<sub>xz</sub> = ${r_xz.toFixed(8)}</div>
                    <div>r<sub>yz</sub> = ${r_yz.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate Numerator</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    <div>Numerator = r<sub>xy</sub> - r<sub>xz</sub> × r<sub>yz</sub></div>
                    <div>= ${r_xy.toFixed(8)} - (${r_xz.toFixed(8)} × ${r_yz.toFixed(8)})</div>
                    <div>= ${r_xy.toFixed(8)} - ${(r_xz * r_yz).toFixed(8)}</div>
                    <div style="font-size: 18px; font-weight: 700; color: #1565c0;">= ${numerator.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Calculate Denominator</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    <div>Denominator = √[(1 - r<sub>xz</sub>²) × (1 - r<sub>yz</sub>²)]</div>
                    <div>1 - r<sub>xz</sub>² = 1 - ${(r_xz * r_xz).toFixed(8)} = ${(1 - r_xz * r_xz).toFixed(8)}</div>
                    <div>1 - r<sub>yz</sub>² = 1 - ${(r_yz * r_yz).toFixed(8)} = ${(1 - r_yz * r_yz).toFixed(8)}</div>
                    <div>Product = ${(1 - r_xz * r_xz).toFixed(8)} × ${(1 - r_yz * r_yz).toFixed(8)} = ${((1 - r_xz*r_xz) * (1 - r_yz*r_yz)).toFixed(8)}</div>
                    <div>√Product = √${((1 - r_xz*r_xz) * (1 - r_yz*r_yz)).toFixed(8)} = ${Math.sqrt((1 - r_xz*r_xz) * (1 - r_yz*r_yz)).toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">4</div>
                    <div><strong>Calculate Final Partial Correlation</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div>r<sub>xy·z</sub> = Numerator / Denominator</div>
                    <div>= ${numerator.toFixed(8)} / ${Math.sqrt((1 - r_xz*r_xz) * (1 - r_yz*r_yz)).toFixed(8)}</div>
                    <div style="font-size: 28px; font-weight: 700; color: #6a1b9a; text-align: center; padding: 16px; background: #f3e5f5; border-radius: 12px; margin-top: 12px;">
                        r<sub>xy·z</sub> = ${r_xy_z.toFixed(8)}
                    </div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: #fff3e0; border-left: 6px solid #e65100;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Partial Correlation:</strong> r<sub>xy·z</sub> = ${r_xy_z.toFixed(6)}</div>
                <div><strong>Simple Correlation (r<sub>xy</sub>):</strong> ${r_xy.toFixed(6)}</div>
                <div><strong>Change after controlling for Z:</strong> ${(r_xy_z - r_xy).toFixed(6)}</div>
                <div><strong>Direction:</strong> ${r_xy_z > 0 ? 'Positive association between X and Y after removing Z' : (r_xy_z < 0 ? 'Negative association after removing Z' : 'No partial association')}</div>
                <div><strong>Strength:</strong> ${Math.abs(r_xy_z) >= 0.7 ? 'Strong' : (Math.abs(r_xy_z) >= 0.5 ? 'Moderate' : (Math.abs(r_xy_z) >= 0.3 ? 'Weak' : 'Very Weak or No'))} partial relationship</div>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    💡 <strong>Practical Meaning:</strong> After removing the linear effect of Z, 
                    ${Math.abs(r_xy_z) > 0.3 ? 'there is a ' + (Math.abs(r_xy_z) >= 0.7 ? 'strong' : (Math.abs(r_xy_z) >= 0.5 ? 'moderate' : 'weak')) + ' ' + (r_xy_z > 0 ? 'positive' : 'negative') + ' relationship between X and Y.' 
                    : 'there is little to no direct linear relationship between X and Y.'}
                    ${Math.abs(r_xy - r_xy_z) > 0.1 ? ` The control variable Z explains ${Math.abs(((r_xy - r_xy_z)/r_xy) * 100).toFixed(1)}% of the original correlation between X and Y.` : ''}
                </div>
            </div>
        </div>
    </div>`;
    
    return { r_xy_z, r_xy, r_xz, r_yz, numerator, denominator, steps };
}
// ========== SETUP FUNCTIONS FOR NEW BUTTONS ==========
function setupPointBiserialLogic() {
    const computeBtn = document.getElementById("corrPointBiserialComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("pointBiserialXInput").value;
        const rawY = document.getElementById("pointBiserialYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("pointBiserialResultArea");
        const valueSpan = document.getElementById("pointBiserialValueDisplay");
        const stepsSpan = document.getElementById("pointBiserialStepsDisplay");
        
        // Validate binary values
        let valid = true;
        for (let val of yValues) {
            if (val !== 0 && val !== 1) {
                valid = false;
                break;
            }
        }
        if (!valid) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = "Binary variable must contain only 0 and 1 values.";
            return;
        }
        
        const result = computePointBiserialWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `r<sub>pb</sub> = ${result.r_pb.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("pointBiserialClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("pointBiserialXInput").value = '';
            document.getElementById("pointBiserialYInput").value = '';
            document.getElementById("pointBiserialResultArea").style.display = 'none';
        });
    }
}

function setupPartialCorrelationLogic() {
    const computeBtn = document.getElementById("corrPartialComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("partialXInput").value;
        const rawY = document.getElementById("partialYInput").value;
        const rawZ = document.getElementById("partialZInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const zValues = parseNumbersFromInput(rawZ);
        const resultDiv = document.getElementById("partialResultArea");
        const valueSpan = document.getElementById("partialValueDisplay");
        const stepsSpan = document.getElementById("partialStepsDisplay");
        
        const result = computePartialCorrelationWithSteps(xValues, yValues, zValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `r<sub>xy·z</sub> = ${result.r_xy_z.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("partialClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("partialXInput").value = '';
            document.getElementById("partialYInput").value = '';
            document.getElementById("partialZInput").value = '';
            document.getElementById("partialResultArea").style.display = 'none';
        });
    }
}
// ========== POINT-BISERIAL INTERFACE RENDER ==========
function renderPointBiserialInterface() {
    return `
        <div class="stat-interface" id="statPointBiserialInterface">
            <div class="interface-title">🎯 Point-Biserial Correlation (r<sub>pb</sub>)</div>
            <div class="formula-card">
                <div class="formula">📌 r<sub>pb</sub> = (M₁ - M₀)/s<sub>X</sub> × √[(n₁·n₀)/n²]</div>
                <div class="desc">Measures correlation between a continuous variable and a true binary (0/1) variable. Equivalent to Pearson correlation for binary Y.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter Continuous Variable (X) values:</label>
                <textarea id="pointBiserialXInput" rows="3" placeholder="Example: 12, 15, 18, 22, 25, 28, 30"></textarea>
                <label style="margin-top: 15px;">📋 Enter Binary Variable (Y) values (0 or 1 only):</label>
                <textarea id="pointBiserialYInput" rows="3" placeholder="Example: 0, 1, 0, 1, 0, 1, 1"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="corrPointBiserialComputeBtn">🎯 Calculate Point-Biserial + Steps</button>
                    <button class="secondary-btn" id="pointBiserialClearBtn">Clear All</button>
                </div>
            </div>
            <div id="pointBiserialResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 POINT-BISERIAL CORRELATION RESULT</div>
                    <div class="result-value" id="pointBiserialValueDisplay">—</div>
                    <div class="calculation-steps" id="pointBiserialStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== PARTIAL CORRELATION INTERFACE RENDER ==========
function renderPartialCorrelationInterface() {
    return `
        <div class="stat-interface" id="statPartialCorrelationInterface">
            <div class="interface-title">🔗 Partial Correlation (r<sub>xy·z</sub>)</div>
            <div class="formula-card">
                <div class="formula">📌 r<sub>xy·z</sub> = (r<sub>xy</sub> - r<sub>xz</sub>·r<sub>yz</sub>) / √[(1 - r<sub>xz</sub>²)(1 - r<sub>yz</sub>²)]</div>
                <div class="desc">Measures correlation between X and Y after statistically removing the linear effect of Z (control variable).</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (independent variable):</label>
                <textarea id="partialXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8"></textarea>
                <label style="margin-top: 15px;">📋 Enter Y values (dependent variable):</label>
                <textarea id="partialYInput" rows="3" placeholder="Example: 2, 4, 6, 8, 10, 12, 14, 16"></textarea>
                <label style="margin-top: 15px;">📋 Enter Z values (control variable):</label>
                <textarea id="partialZInput" rows="3" placeholder="Example: 1, 1, 2, 2, 3, 3, 4, 4"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="corrPartialComputeBtn">🔗 Calculate Partial Correlation + Steps</button>
                    <button class="secondary-btn" id="partialClearBtn">Clear All</button>
                </div>
            </div>
            <div id="partialResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 PARTIAL CORRELATION RESULT</div>
                    <div class="result-value" id="partialValueDisplay">—</div>
                    <div class="calculation-steps" id="partialStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
