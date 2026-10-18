/* Probability distributions (PDF/CDF/quantile/random), contingency tables, chi-square */
// ========== PROBABILITY DISTRIBUTIONS RENDER FUNCTIONS ==========
function renderPDFInterface() {
    return `
        <div class="stat-interface" id="statPDFInterface">
            <div class="interface-title">📊 Probability Density Function (PDF)</div>
            <div class="formula-card">
                <div class="formula">📌 f(x) = density at point x for continuous distributions</div>
                <div class="desc">PDF gives the relative likelihood of a random variable taking a specific value.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="pdfDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="beta">Beta Distribution</option>
                </select>
                
                <div id="pdfParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <label>📊 X Value(s):</label>
                <textarea id="pdfXValues" rows="3" placeholder="Enter x value(s) (comma-separated)&#10;Example: 0, 1, 2, 3"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="pdfComputeBtn">📊 Calculate PDF + Steps</button>
                    <button class="secondary-btn" id="pdfClearBtn">Clear</button>
                </div>
            </div>
            <div id="pdfResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 PDF RESULTS</div>
                    <div class="result-value" id="pdfValueDisplay">—</div>
                    <div class="calculation-steps" id="pdfStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

function renderCDFInterface() {
    return `
        <div class="stat-interface" id="statCDFInterface">
            <div class="interface-title">📈 Cumulative Distribution Function (CDF)</div>
            <div class="formula-card">
                <div class="formula">📌 F(x) = P(X ≤ x)</div>
                <div class="desc">CDF gives the probability that a random variable is less than or equal to x.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="cdfDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="beta">Beta Distribution</option>
                </select>
                
                <div id="cdfParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <label>📊 X Value(s):</label>
                <textarea id="cdfXValues" rows="3" placeholder="Enter x value(s) (comma-separated)&#10;Example: 0, 1, 2, 3"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="cdfComputeBtn">📈 Calculate CDF + Steps</button>
                    <button class="secondary-btn" id="cdfClearBtn">Clear</button>
                </div>
            </div>
            <div id="cdfResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 CDF RESULTS</div>
                    <div class="result-value" id="cdfValueDisplay">—</div>
                    <div class="calculation-steps" id="cdfStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

function renderQuantileInterface() {
    return `
        <div class="stat-interface" id="statQuantileInterface">
            <div class="interface-title">🎯 Quantile Function (Inverse CDF)</div>
            <div class="formula-card">
                <div class="formula">📌 Q(p) = F⁻¹(p) = smallest x such that F(x) ≥ p</div>
                <div class="desc">Quantile function returns the value below which a given percentage of observations fall.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="quantileDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="beta">Beta Distribution</option>
                </select>
                
                <div id="quantileParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <label>📊 Probability Value(s) (between 0 and 1):</label>
                <textarea id="quantileProbs" rows="3" placeholder="Enter probability value(s) (comma-separated)&#10;Example: 0.025, 0.5, 0.975"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="quantileComputeBtn">🎯 Calculate Quantiles + Steps</button>
                    <button class="secondary-btn" id="quantileClearBtn">Clear</button>
                </div>
            </div>
            <div id="quantileResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 QUANTILE RESULTS</div>
                    <div class="result-value" id="quantileValueDisplay">—</div>
                    <div class="calculation-steps" id="quantileStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

function renderRandomInterface() {
    return `
        <div class="stat-interface" id="statRandomInterface">
            <div class="interface-title">🎲 Random Number Generation</div>
            <div class="formula-card">
                <div class="formula">📌 Generate random samples from specified distributions</div>
                <div class="desc">Generate random numbers following specific probability distributions.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Select Distribution:</label>
                <select id="randomDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                    <option value="beta">Beta Distribution</option>
                </select>
                
                <div id="randomParams">
                    <!-- Dynamic params will go here -->
                </div>
                
                <label>🔢 Number of Random Values to Generate:</label>
                <input type="number" id="randomCount" value="10" min="1" max="1000" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>🔢 Random Seed (optional, for reproducibility):</label>
                <input type="number" id="randomSeed" placeholder="Leave empty for random" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <div class="action-row">
                    <button class="primary-btn" id="randomComputeBtn">🎲 Generate Random Numbers + Steps</button>
                    <button class="secondary-btn" id="randomClearBtn">Clear</button>
                </div>
            </div>
            <div id="randomResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 RANDOM NUMBERS GENERATED</div>
                    <div class="result-value" id="randomValueDisplay">—</div>
                    <div class="calculation-steps" id="randomStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== PROBABILITY DISTRIBUTIONS COMPUTATION FUNCTIONS ==========

// Normal Distribution Functions
function normalPDF(x, mean = 0, std = 1) {
    const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
    return coefficient * Math.exp(exponent);
}

function normalCDF(x, mean = 0, std = 1) {
    return normCDF((x - mean) / std);
}

function normalQuantile(p, mean = 0, std = 1) {
    return mean + std * normInv(p);
}



// Uniform Distribution Functions
function uniformPDF(x, min = 0, max = 1) {
    if (x < min || x > max) return 0;
    return 1 / (max - min);
}

function uniformCDF(x, min = 0, max = 1) {
    if (x < min) return 0;
    if (x > max) return 1;
    return (x - min) / (max - min);
}

function uniformQuantile(p, min = 0, max = 1) {
    return min + p * (max - min);
}

// Exponential Distribution Functions
function exponentialPDF(x, rate = 1) {
    if (x < 0) return 0;
    return rate * Math.exp(-rate * x);
}

function exponentialCDF(x, rate = 1) {
    if (x < 0) return 0;
    return 1 - Math.exp(-rate * x);
}

function exponentialQuantile(p, rate = 1) {
    return -Math.log(1 - p) / rate;
}

// Beta Distribution Functions
function betaPDF(x, alpha = 2, beta = 5) {
    if (x < 0 || x > 1) return 0;
    // Beta function approximation
    const B = Math.exp(logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta));
    return Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1) / B;
}


// Dynamic parameter UI generators
function updatePDFParams() {
    const dist = document.getElementById('pdfDistribution').value;
    const paramsDiv = document.getElementById('pdfParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Mean (μ):</label>
            <input type="number" id="pdfMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="pdfStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `
            <label>📊 Minimum (a):</label>
            <input type="number" id="pdfMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="pdfMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="pdfRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `
            <label>📊 Alpha (α):</label>
            <input type="number" id="pdfAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="pdfBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

// Main PDF computation
function computePDFWithSteps() {
    const dist = document.getElementById('pdfDistribution').value;
    const xValuesText = document.getElementById('pdfXValues').value;
    const xValues = parseNumbersFromInput(xValuesText);
    
    if (!xValues.length) return { error: true, message: "Please enter x values." };
    
    let results = [];
    let steps = `📊 PROBABILITY DENSITY FUNCTION (PDF) CALCULATION\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Distribution: ${dist.toUpperCase()}\n\n`;
    
    if (dist === 'normal') {
        const mean = parseFloat(document.getElementById('pdfMean').value);
        const std = parseFloat(document.getElementById('pdfStd').value);
        steps += `Parameters: μ = ${mean}, σ = ${std}\n`;
        steps += `Formula: f(x) = (1/(σ√(2π))) × e^(-(x-μ)²/(2σ²))\n\n`;
        
        xValues.forEach(x => {
            const pdf = normalPDF(x, mean, std);
            results.push(pdf);
            steps += `For x = ${x}:\n`;
            steps += `  f(${x}) = (1/(${std}√(2π))) × e^(-(${x}-${mean})²/(2×${std}²))\n`;
            steps += `  = ${pdf.toFixed(8)}\n\n`;
        });
    } else if (dist === 'uniform') {
        const min = parseFloat(document.getElementById('pdfMin').value);
        const max = parseFloat(document.getElementById('pdfMax').value);
        steps += `Parameters: a = ${min}, b = ${max}\n`;
        steps += `Formula: f(x) = 1/(b-a) for a ≤ x ≤ b, else 0\n\n`;
        
        xValues.forEach(x => {
            const pdf = uniformPDF(x, min, max);
            results.push(pdf);
            steps += `For x = ${x}:\n`;
            if (x >= min && x <= max) {
                steps += `  f(${x}) = 1/(${max}-${min}) = 1/${max-min} = ${pdf.toFixed(8)}\n\n`;
            } else {
                steps += `  f(${x}) = 0 (outside [${min}, ${max}] range)\n\n`;
            }
        });
    } else if (dist === 'exponential') {
        const rate = parseFloat(document.getElementById('pdfRate').value);
        steps += `Parameters: λ = ${rate}\n`;
        steps += `Formula: f(x) = λe^(-λx) for x ≥ 0\n\n`;
        
        xValues.forEach(x => {
            const pdf = exponentialPDF(x, rate);
            results.push(pdf);
            steps += `For x = ${x}:\n`;
            if (x >= 0) {
                steps += `  f(${x}) = ${rate} × e^(-${rate}×${x}) = ${pdf.toFixed(8)}\n\n`;
            } else {
                steps += `  f(${x}) = 0 (x < 0)\n\n`;
            }
        });
    } else if (dist === 'beta') {
    const alpha = parseFloat(document.getElementById('pdfAlpha').value);
    const beta = parseFloat(document.getElementById('pdfBeta').value);
    
    // Add comprehensive Beta distribution explanation
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📚 BETA DISTRIBUTION DETAILS:\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Parameters: α = ${alpha}, β = ${beta}\n\n`;
    
    steps += `🔬 WHAT IS BETA DISTRIBUTION?\n`;
    steps += `• Models random variables limited to interval [0,1] (proportions, probabilities)\n`;
    steps += `• Extremely flexible: Can take many shapes (U-shaped, bell-shaped, J-shaped)\n`;
    steps += `• Conjugate prior for binomial and Bernoulli distributions in Bayesian statistics\n`;
    steps += `• Applications: Bayesian inference, PERT distributions, project management\n\n`;
    
    steps += `📐 MATHEMATICAL FORMULA:\n`;
    steps += `   f(x; α,β) = [x^(α-1) × (1-x)^(β-1)] / B(α,β)\n`;
    steps += `   where B(α,β) = Γ(α)Γ(β)/Γ(α+β) is the Beta function\n`;
    steps += `   and Γ is the Gamma function (generalization of factorial)\n\n`;
    
    steps += `📊 CALCULATING THE BETA FUNCTION B(${alpha},${beta}):\n`;
    const logBetaVal = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
    const betaVal = Math.exp(logBetaVal);
    steps += `   ln(B) = ln(Γ(${alpha})) + ln(Γ(${beta})) - ln(Γ(${alpha+beta}))\n`;
    steps += `   ln(B) = ${logGamma(alpha).toFixed(6)} + ${logGamma(beta).toFixed(6)} - ${logGamma(alpha+beta).toFixed(6)}\n`;
    steps += `   ln(B) = ${logBetaVal.toFixed(6)}\n`;
    steps += `   B = e^(${logBetaVal.toFixed(6)}) = ${betaVal.toFixed(8)}\n\n`;
    
    steps += `📈 DISTRIBUTION SHAPE ANALYSIS:\n`;
    if (alpha > 1 && beta > 1) {
        const mode = (alpha - 1) / (alpha + beta - 2);
        steps += `• α > 1 and β > 1 → UNIMODAL (single peak)\n`;
        steps += `• Mode = (α-1)/(α+β-2) = ${mode.toFixed(6)}\n`;
        steps += `  This is the most likely value\n`;
    } else if (alpha < 1 && beta < 1) {
        steps += `• α < 1 and β < 1 → U-SHAPED (high density at extremes)\n`;
        steps += `  Values near 0 and 1 are most likely\n`;
    } else if (alpha < 1) {
        steps += `• α < 1, β ≥ 1 → J-SHAPED (decreasing function)\n`;
        steps += `  Higher density near 0, decreasing toward 1\n`;
    } else if (beta < 1) {
        steps += `• β < 1, α ≥ 1 → REVERSE J-SHAPED (increasing function)\n`;
        steps += `  Lower density near 0, increasing toward 1\n`;
    } else if (alpha === 1 && beta === 1) {
        steps += `• α = β = 1 → UNIFORM distribution on [0,1]\n`;
        steps += `  All values equally likely\n`;
    }
    
    steps += `\n📐 SKEWNESS ANALYSIS:\n`;
    if (alpha > beta) {
        steps += `• α (${alpha}) > β (${beta}) → LEFT-SKEWED (negative skew)\n`;
        steps += `  More probability mass near 1, tail extends to the left\n`;
    } else if (beta > alpha) {
        steps += `• β (${beta}) > α (${alpha}) → RIGHT-SKEWED (positive skew)\n`;
        steps += `  More probability mass near 0, tail extends to the right\n`;
    } else {
        steps += `• α = β → SYMMETRIC around 0.5\n`;
    }
    
    // Key statistics
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    const skewness = 2 * (beta - alpha) * Math.sqrt(alpha + beta + 1) / ((alpha + beta + 2) * Math.sqrt(alpha * beta));
    
    steps += `\n📊 KEY STATISTICAL MOMENTS:\n`;
    steps += `• Mean (μ) = α/(α+β) = ${alpha}/${alpha+beta} = ${mean.toFixed(6)}\n`;
    steps += `  Interpretation: Average value = ${(mean * 100).toFixed(2)}%\n`;
    steps += `• Variance (σ²) = αβ/[(α+β)²(α+β+1)] = ${variance.toFixed(6)}\n`;
    steps += `• Standard Deviation = √${variance.toFixed(6)} = ${stdDev.toFixed(6)}\n`;
    steps += `• Skewness = ${skewness.toFixed(6)}\n`;
    
    steps += `\n🔢 PDF CALCULATIONS:\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    xValues.forEach(x => {
        const pdf = betaPDF(x, alpha, beta);
        results.push(pdf);
        
        steps += `\nFor x = ${x}:\n`;
        if (x >= 0 && x <= 1) {
            const numerator1 = Math.pow(x, alpha - 1);
            const numerator2 = Math.pow(1 - x, beta - 1);
            steps += `  Step 1: Calculate x^(α-1) = ${x}^(${alpha}-1) = ${numerator1.toFixed(8)}\n`;
            steps += `  Step 2: Calculate (1-x)^(β-1) = (1-${x})^(${beta}-1) = ${numerator2.toFixed(8)}\n`;
            steps += `  Step 3: Multiply numerators = ${numerator1.toFixed(8)} × ${numerator2.toFixed(8)} = ${(numerator1 * numerator2).toFixed(8)}\n`;
            steps += `  Step 4: Divide by Beta function = ${(numerator1 * numerator2).toFixed(8)} / ${betaVal.toFixed(8)}\n`;
            steps += `  f(${x}) = ${pdf.toFixed(8)}\n`;
            
            if (x === mean) {
                steps += `  ✨ This is the mean value! The density at the mean is ${pdf.toFixed(6)}\n`;
            }
            if (alpha > 1 && beta > 1) {
                const mode = (alpha - 1) / (alpha + beta - 2);
                if (Math.abs(x - mode) < 0.01) {
                    steps += `  ⭐ This is the MODE (peak) of the distribution!\n`;
                }
            }
        } else {
            steps += `  f(${x}) = 0 (x must be between 0 and 1 for Beta distribution)\n`;
        }
    });
}
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ PDF RESULTS:\n`;
    xValues.forEach((x, i) => {
        steps += `  f(${x}) = ${results[i].toFixed(8)}\n`;
    });
    
    return { results, xValues, steps, resultStr: results.map(r => r.toFixed(6)).join(', ') };
}
// Add setup functions for each probability feature
// ========== CDF COMPUTATION FUNCTIONS ==========
function updateCDFParams() {
    const dist = document.getElementById('cdfDistribution').value;
    const paramsDiv = document.getElementById('cdfParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Mean (μ):</label>
            <input type="number" id="cdfMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="cdfStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `
            <label>📊 Minimum (a):</label>
            <input type="number" id="cdfMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="cdfMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="cdfRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `
            <label>📊 Alpha (α):</label>
            <input type="number" id="cdfAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="cdfBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

function computeCDFWithSteps() {
    const dist = document.getElementById('cdfDistribution').value;
    const xValuesText = document.getElementById('cdfXValues').value;
    const xValues = parseNumbersFromInput(xValuesText);
    
    if (!xValues.length) return { error: true, message: "Please enter x values." };
    
    let results = [];
    let steps = `📈 CUMULATIVE DISTRIBUTION FUNCTION (CDF) CALCULATION\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Distribution: ${dist.toUpperCase()}\n`;
    steps += `CDF gives P(X ≤ x)\n\n`;
    
    if (dist === 'normal') {
        const mean = parseFloat(document.getElementById('cdfMean').value);
        const std = parseFloat(document.getElementById('cdfStd').value);
        steps += `Parameters: μ = ${mean}, σ = ${std}\n`;
        steps += `Formula: F(x) = Φ((x-μ)/σ) where Φ is standard normal CDF\n\n`;
        
        xValues.forEach(x => {
            const cdf = normalCDF(x, mean, std);
            results.push(cdf);
            const z = (x - mean) / std;
            steps += `For x = ${x}:\n`;
            steps += `  z = (${x} - ${mean})/${std} = ${z.toFixed(6)}\n`;
            steps += `  F(${x}) = Φ(${z.toFixed(6)}) = ${cdf.toFixed(8)}\n`;
            steps += `  Interpretation: P(X ≤ ${x}) = ${(cdf * 100).toFixed(2)}%\n\n`;
        });
    } else if (dist === 'uniform') {
        const min = parseFloat(document.getElementById('cdfMin').value);
        const max = parseFloat(document.getElementById('cdfMax').value);
        steps += `Parameters: a = ${min}, b = ${max}\n`;
        steps += `Formula: F(x) = (x-a)/(b-a) for a ≤ x ≤ b\n\n`;
        
        xValues.forEach(x => {
            const cdf = uniformCDF(x, min, max);
            results.push(cdf);
            steps += `For x = ${x}:\n`;
            if (x < min) {
                steps += `  F(${x}) = 0 (x < a)\n`;
            } else if (x > max) {
                steps += `  F(${x}) = 1 (x > b)\n`;
            } else {
                steps += `  F(${x}) = (${x} - ${min})/(${max} - ${min}) = ${cdf.toFixed(8)}\n`;
            }
            steps += `  Interpretation: ${(cdf * 100).toFixed(2)}% of values ≤ ${x}\n\n`;
        });
    } else if (dist === 'exponential') {
        const rate = parseFloat(document.getElementById('cdfRate').value);
        steps += `Parameters: λ = ${rate}\n`;
        steps += `Formula: F(x) = 1 - e^(-λx) for x ≥ 0\n\n`;
        
        xValues.forEach(x => {
            const cdf = exponentialCDF(x, rate);
            results.push(cdf);
            steps += `For x = ${x}:\n`;
            if (x < 0) {
                steps += `  F(${x}) = 0 (x < 0)\n`;
            } else {
                steps += `  F(${x}) = 1 - e^(-${rate}×${x}) = ${cdf.toFixed(8)}\n`;
            }
            steps += `  Interpretation: P(X ≤ ${x}) = ${(cdf * 100).toFixed(2)}%\n\n`;
        });
    } else if (dist === 'beta') {
    const alpha = parseFloat(document.getElementById('cdfAlpha').value);
    const beta = parseFloat(document.getElementById('cdfBeta').value);
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📚 BETA DISTRIBUTION CDF DETAILS:\n`;
    steps += `Parameters: α = ${alpha}, β = ${beta}\n\n`;
    
    steps += `🔬 WHAT IS CUMULATIVE DISTRIBUTION FUNCTION (CDF)?\n`;
    steps += `• F(x) = P(X ≤ x) = Probability that random variable ≤ x\n`;
    steps += `• For Beta distribution: F(x) = I_x(α,β) (Regularized Incomplete Beta function)\n`;
    steps += `• Properties: F(0) = 0, F(1) = 1, increasing function\n\n`;
    
    const mean = alpha / (alpha + beta);
    const median = betaQuantile(0.5, alpha, beta);
    
    steps += `📊 DISTRIBUTION CHARACTERISTICS:\n`;
    steps += `• Mean (expected value) = ${mean.toFixed(6)}\n`;
    steps += `• Approximate Median = ${median.toFixed(6)}\n`;
    steps += `• 50% of probability mass is below the median\n\n`;
    
    steps += `🔢 CDF CALCULATIONS:\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    xValues.forEach(x => {
        let cdf = 0;
        if (x <= 0) {
            cdf = 0;
            steps += `\nFor x = ${x} ≤ 0:\n`;
            steps += `  F(${x}) = 0 (Below minimum possible value)\n`;
        } else if (x >= 1) {
            cdf = 1;
            steps += `\nFor x = ${x} ≥ 1:\n`;
            steps += `  F(${x}) = 1 (Above maximum possible value)\n`;
        } else {
            // Improved Beta CDF approximation using series expansion
            cdf = betaCDF(x, alpha, beta);
            
            steps += `\nFor x = ${x}:\n`;
            steps += `  F(${x}) = P(X ≤ ${x}) = I_${x}(${alpha},${beta})\n`;
            steps += `  Using series approximation:\n`;
            steps += `  F(${x}) = ${cdf.toFixed(8)}\n`;
            steps += `  Interpretation: ${(cdf * 100).toFixed(2)}% of values ≤ ${x}\n`;
            
            if (Math.abs(x - mean) < 0.01) {
                steps += `  📌 Note: x ≈ mean (${mean.toFixed(4)}), F(x) ≈ ${(cdf * 100).toFixed(1)}%\n`;
            }
            if (Math.abs(cdf - 0.5) < 0.05) {
                steps += `  📌 Note: x is near the median (${median.toFixed(4)})\n`;
            }
        }
        results.push(cdf);
    });
}

    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ CDF RESULTS (P(X ≤ x)):\n`;
    xValues.forEach((x, i) => {
        steps += `  P(X ≤ ${x}) = ${(results[i] * 100).toFixed(4)}%\n`;
    });
    
    return { results, xValues, steps, resultStr: results.map(r => (r * 100).toFixed(4) + '%').join(', ') };
}
function betaFunction(alpha, beta) {
    return Math.exp(logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta));
}

// ========== QUANTILE (INVERSE CDF) COMPUTATION FUNCTIONS ==========
function updateQuantileParams() {
    const dist = document.getElementById('quantileDistribution').value;
    const paramsDiv = document.getElementById('quantileParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Mean (μ):</label>
            <input type="number" id="quantileMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="quantileStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `
            <label>📊 Minimum (a):</label>
            <input type="number" id="quantileMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="quantileMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="quantileRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `
            <label>📊 Alpha (α):</label>
            <input type="number" id="quantileAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="quantileBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

function computeQuantileWithSteps() {
    const dist = document.getElementById('quantileDistribution').value;
    const probsText = document.getElementById('quantileProbs').value;
    const probabilities = parseNumbersFromInput(probsText);
    
    if (!probabilities.length) return { error: true, message: "Please enter probability values between 0 and 1." };
    
    // Validate probabilities
    for (let p of probabilities) {
        if (p < 0 || p > 1) {
            return { error: true, message: `Probability ${p} is not between 0 and 1.` };
        }
    }
    
    let results = [];
    let steps = `🎯 QUANTILE FUNCTION (INVERSE CDF) CALCULATION\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Distribution: ${dist.toUpperCase()}\n`;
    steps += `Quantile function Q(p) returns x such that P(X ≤ x) = p\n\n`;
    
    if (dist === 'normal') {
        const mean = parseFloat(document.getElementById('quantileMean').value);
        const std = parseFloat(document.getElementById('quantileStd').value);
        steps += `Parameters: μ = ${mean}, σ = ${std}\n`;
        steps += `Formula: Q(p) = μ + σ × Φ⁻¹(p)\n\n`;
        
        probabilities.forEach(p => {
            const quantile = normalQuantile(p, mean, std);
            results.push(quantile);
            steps += `For p = ${p}:\n`;
            steps += `  Φ⁻¹(${p}) = ${(Math.sqrt(2) * erfinv(2*p - 1)).toFixed(6)}\n`;
            steps += `  Q(${p}) = ${mean} + ${std} × ${(Math.sqrt(2) * erfinv(2*p - 1)).toFixed(6)} = ${quantile.toFixed(8)}\n`;
            steps += `  Interpretation: ${(p * 100)}% of values are ≤ ${quantile.toFixed(4)}\n\n`;
        });
    } else if (dist === 'uniform') {
        const min = parseFloat(document.getElementById('quantileMin').value);
        const max = parseFloat(document.getElementById('quantileMax').value);
        steps += `Parameters: a = ${min}, b = ${max}\n`;
        steps += `Formula: Q(p) = a + p × (b - a)\n\n`;
        
        probabilities.forEach(p => {
            const quantile = uniformQuantile(p, min, max);
            results.push(quantile);
            steps += `For p = ${p}:\n`;
            steps += `  Q(${p}) = ${min} + ${p} × (${max} - ${min}) = ${quantile.toFixed(8)}\n`;
            steps += `  Interpretation: ${(p * 100)}% of values are ≤ ${quantile.toFixed(4)}\n\n`;
        });
    } else if (dist === 'exponential') {
        const rate = parseFloat(document.getElementById('quantileRate').value);
        steps += `Parameters: λ = ${rate}\n`;
        steps += `Formula: Q(p) = -ln(1-p)/λ\n\n`;
        
        probabilities.forEach(p => {
            const quantile = exponentialQuantile(p, rate);
            results.push(quantile);
            steps += `For p = ${p}:\n`;
            steps += `  Q(${p}) = -ln(1-${p})/${rate} = ${quantile.toFixed(8)}\n`;
            steps += `  Interpretation: ${(p * 100)}% of values are ≤ ${quantile.toFixed(4)}\n\n`;
        });
    } else if (dist === 'beta') {
    const alpha = parseFloat(document.getElementById('quantileAlpha').value);
    const beta = parseFloat(document.getElementById('quantileBeta').value);
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📚 BETA DISTRIBUTION QUANTILE FUNCTION (INVERSE CDF)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Parameters: α (shape1) = ${alpha}, β (shape2) = ${beta}\n\n`;
    
    steps += `🔬 WHAT IS THE QUANTILE FUNCTION?\n`;
    steps += `• Q(p) = F⁻¹(p) = the smallest x such that F(x) ≥ p\n`;
    steps += `• Also called: Inverse CDF, percent point function (PPF)\n`;
    steps += `• For Beta distribution: Q(p) solves I_x(α,β) = p\n`;
    steps += `  where I_x(α,β) is the Regularized Incomplete Beta function\n\n`;
    
    // Calculate distribution properties first
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    const skewness = 2 * (beta - alpha) * Math.sqrt(alpha + beta + 1) / ((alpha + beta + 2) * Math.sqrt(alpha * beta));
    
    steps += `📊 DISTRIBUTION PROPERTIES (for reference):\n`;
    steps += `• Mean (μ) = α/(α+β) = ${alpha}/${alpha+beta} = ${mean.toFixed(6)}\n`;
    steps += `• Variance (σ²) = αβ/[(α+β)²(α+β+1)] = ${variance.toFixed(6)}\n`;
    steps += `• Standard Deviation (σ) = ${stdDev.toFixed(6)}\n`;
    steps += `• Skewness = ${skewness.toFixed(6)} `;
    if (skewness > 0) steps += `(positive → right-skewed)\n`;
    else if (skewness < 0) steps += `(negative → left-skewed)\n`;
    else steps += `(symmetric)\n`;
    
    // Calculate median precisely
    steps += `\n🔍 CALCULATING THE MEDIAN (50th percentile):\n`;
    steps += `   The median requires solving I_x(α,β) = 0.5\n`;
    const median = betaQuantile(0.5, alpha, beta);
    steps += `   Using Newton-Raphson iteration:\n`;
    steps += `   • Initial guess: x₀ = mean = ${mean.toFixed(6)}\n`;
    steps += `   • After iterations: median = ${median.toFixed(8)}\n`;
    steps += `   • Mean - Median = ${(mean - median).toFixed(6)} `;
    if (mean > median) steps += `(mean > median → right-skewed)\n`;
    else if (mean < median) steps += `(mean < median → left-skewed)\n`;
    else steps += `(symmetric)\n`;
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `🔢 QUANTILE CALCULATIONS (Solving I_x(α,β) = p)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    probabilities.forEach((p, idx) => {
        let quantile = 0;
        if (p <= 0) {
            quantile = 0;
            steps += `\n📌 QUANTILE #${idx+1}: p = ${p} (${(p*100).toFixed(0)}%)\n`;
            steps += `   Q(${p}) = 0 (Minimum possible value of Beta distribution)\n`;
            steps += `   Explanation: The ${(p*100).toFixed(0)}th percentile is the smallest possible value.\n`;
        } else if (p >= 1) {
            quantile = 1;
            steps += `\n📌 QUANTILE #${idx+1}: p = ${p} (${(p*100).toFixed(0)}%)\n`;
            steps += `   Q(${p}) = 1 (Maximum possible value of Beta distribution)\n`;
            steps += `   Explanation: The ${(p*100).toFixed(0)}th percentile is the largest possible value.\n`;
        } else {
            quantile = betaQuantile(p, alpha, beta);
            
            steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            steps += `📌 QUANTILE #${idx+1}: Finding x such that P(X ≤ x) = ${p} (${(p*100).toFixed(1)}%)\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            
            steps += `\n🔬 PROBLEM: Solve I_x(${alpha},${beta}) = ${p}\n`;
            steps += `   Where I_x(α,β) is the Regularized Incomplete Beta function\n\n`;
            
            steps += `⚙️ SOLUTION METHOD: Newton-Raphson Iteration\n`;
            steps += `   Formula: x_{n+1} = x_n - [F(x_n) - p] / f(x_n)\n`;
            steps += `   Where: F(x) = CDF, f(x) = PDF\n\n`;
            
            // Show iteration details
            let x = alpha / (alpha + beta); // Initial guess = mean
            steps += `   Step 1: Initial guess x₀ = mean = ${x.toFixed(6)}\n`;
            
            for (let iter = 0; iter < 5; iter++) {
                const cdf = betaCDF(x, alpha, beta);
                const pdf = betaPDF(x, alpha, beta);
                const fx = (cdf - p) / pdf;
                const x_new = x - fx;
                
                steps += `\n   Iteration ${iter + 1}:\n`;
                steps += `     • Current x = ${x.toFixed(8)}\n`;
                steps += `     • F(x) = CDF = ${cdf.toFixed(8)}\n`;
                steps += `     • f(x) = PDF = ${pdf.toFixed(8)}\n`;
                steps += `     • F(x) - p = ${(cdf - p).toFixed(8)}\n`;
                steps += `     • Correction = (F(x)-p)/f(x) = ${fx.toFixed(8)}\n`;
                steps += `     • New x = ${x.toFixed(8)} - ${fx.toFixed(8)} = ${x_new.toFixed(8)}\n`;
                
                if (Math.abs(fx) < 1e-10) {
                    steps += `     ✓ Converged! (change < 1e-10)\n`;
                    break;
                }
                x = x_new;
                if (x < 0) x = 1e-10;
                if (x > 1) x = 1 - 1e-10;
            }
            
            steps += `\n✅ FINAL RESULT:\n`;
            steps += `   Q(${p}) = ${quantile.toFixed(8)}\n`;
            steps += `   Interpretation: ${(p*100).toFixed(1)}% of Beta(α=${alpha},β=${beta}) values are ≤ ${quantile.toFixed(6)}\n`;
            
            // Add percentile interpretations
            if (Math.abs(p - 0.5) < 0.01) {
                steps += `\n   ⭐ INTERPRETATION: This is the MEDIAN\n`;
                steps += `      • 50% of values fall below ${quantile.toFixed(6)}\n`;
                steps += `      • 50% of values fall above ${quantile.toFixed(6)}\n`;
                steps += `      • The median is a robust measure of central tendency\n`;
            }
            if (Math.abs(p - 0.25) < 0.01) {
                steps += `\n   📌 INTERPRETATION: This is Q₁ (First Quartile, 25th percentile)\n`;
                steps += `      • 25% of values are ≤ ${quantile.toFixed(6)}\n`;
                steps += `      • 75% of values are ≥ ${quantile.toFixed(6)}\n`;
                steps += `      • The interquartile range (IQR) = Q₃ - Q₁ measures spread\n`;
            }
            if (Math.abs(p - 0.75) < 0.01) {
                steps += `\n   📌 INTERPRETATION: This is Q₃ (Third Quartile, 75th percentile)\n`;
                steps += `      • 75% of values are ≤ ${quantile.toFixed(6)}\n`;
                steps += `      • 25% of values are ≥ ${quantile.toFixed(6)}\n`;
            }
            if (Math.abs(p - 0.9) < 0.01) {
                steps += `\n   📌 INTERPRETATION: This is the 90th PERCENTILE\n`;
                steps += `      • 90% of values are below ${quantile.toFixed(6)}\n`;
                steps += `      • Only 10% exceed this value\n`;
                steps += `      • Often used for upper tail analysis\n`;
            }
            if (Math.abs(p - 0.95) < 0.01) {
                steps += `\n   📌 INTERPRETATION: This is the 95th PERCENTILE\n`;
                steps += `      • 95% of values are below ${quantile.toFixed(6)}\n`;
                steps += `      • Only 5% exceed this value\n`;
                steps += `      • Commonly used for 90% confidence intervals (between 5th and 95th)\n`;
            }
            if (Math.abs(p - 0.975) < 0.01) {
                steps += `\n   📌 INTERPRETATION: This is the 97.5th PERCENTILE\n`;
                steps += `      • 97.5% of values are below ${quantile.toFixed(6)}\n`;
                steps += `      • Only 2.5% exceed this value\n`;
                steps += `      • Used for 95% confidence intervals (between 2.5th and 97.5th)\n`;
            }
        }
        results.push(quantile);
    });
}

    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ QUANTILE RESULTS:\n`;
    probabilities.forEach((p, i) => {
        steps += `  Q(${p}) = ${results[i].toFixed(6)}\n`;
    });
    
    return { results, probabilities, steps, resultStr: results.map(r => r.toFixed(6)).join(', ') };
}

// ========== RANDOM NUMBER GENERATION FUNCTIONS ==========
function updateRandomParams() {
    const dist = document.getElementById('randomDistribution').value;
    const paramsDiv = document.getElementById('randomParams');
    
    if (dist === 'normal') {
        paramsDiv.innerHTML = `
            <label>📊 Mean (μ):</label>
            <input type="number" id="randomMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="randomStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'uniform') {
        paramsDiv.innerHTML = `
            <label>📊 Minimum (a):</label>
            <input type="number" id="randomMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="randomMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'exponential') {
        paramsDiv.innerHTML = `
            <label>📊 Rate (λ):</label>
            <input type="number" id="randomRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    } else if (dist === 'beta') {
        paramsDiv.innerHTML = `
            <label>📊 Alpha (α):</label>
            <input type="number" id="randomAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="randomBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `;
    }
}

function generateRandomNumbers(count, dist, params) {
    let numbers = [];
    
    // Set seed if provided
    const seedInput = document.getElementById('randomSeed');
    if (seedInput && seedInput.value) {
        const seed = parseInt(seedInput.value);
        if (!isNaN(seed)) {
            // Simple seeded random generator
            let seedValue = seed;
            const seededRandom = () => {
                seedValue = (seedValue * 9301 + 49297) % 233280;
                return seedValue / 233280;
            };
            
            for (let i = 0; i < count; i++) {
                const u = seededRandom();
                if (dist === 'normal') {
                    // Box-Muller transform
                    const u1 = seededRandom();
                    const u2 = seededRandom();
                    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                    numbers.push(params.mean + params.std * z0);
                } else if (dist === 'uniform') {
                    numbers.push(params.min + u * (params.max - params.min));
                } else if (dist === 'exponential') {
                    numbers.push(-Math.log(1 - u) / params.rate);
                } else if (dist === 'beta') {
                    // Beta distribution approximation using Gamma
                    let x = Math.pow(u, 1/params.alpha);
                    numbers.push(x);
                }
            }
        }
    } else {
        // Standard random generation
        for (let i = 0; i < count; i++) {
            if (dist === 'normal') {
                // Box-Muller transform
                const u1 = Math.random();
                const u2 = Math.random();
                const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                numbers.push(params.mean + params.std * z0);
            } else if (dist === 'uniform') {
                numbers.push(params.min + Math.random() * (params.max - params.min));
            } else if (dist === 'exponential') {
                numbers.push(-Math.log(1 - Math.random()) / params.rate);
            } else if (dist === 'beta') {
    // Enhanced Beta generation using acceptance-rejection method
    const alpha = params.alpha;
    const beta = params.beta;
    
    // For α,β > 1, use efficient method
    if (alpha > 1 && beta > 1) {
        const mode = (alpha - 1) / (alpha + beta - 2);
        const maxDensity = betaPDF(mode, alpha, beta);
        
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.random(); // Uniform [0,1]
                y = Math.random() * maxDensity; // Scale to max density
            } while (y > betaPDF(x, alpha, beta));
            numbers.push(x);
        }
    } else {
        // For other cases, use Gamma ratio method
        for (let i = 0; i < count; i++) {
            let u = Math.random();
            let v = Math.random();
            let x = Math.pow(u, 1/alpha);
            let y = Math.pow(v, 1/beta);
            numbers.push(x / (x + y));
        }
    }
}

        }
    }
    
    return numbers;
}

function computeRandomWithSteps() {
    const dist = document.getElementById('randomDistribution').value;
    const count = parseInt(document.getElementById('randomCount').value);
    
    if (isNaN(count) || count < 1) {
        return { error: true, message: "Please enter a valid number of values to generate (minimum 1)." };
    }
    
    if (count > 1000) {
        return { error: true, message: "Maximum 1000 values can be generated at once." };
    }
    
    let params = {};
    let steps = `🎲 RANDOM NUMBER GENERATION\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Distribution: ${dist.toUpperCase()}\n`;
    steps += `Number of values: ${count}\n\n`;
    
    // DECLARE randomNumbers HERE (in outer scope)
    let randomNumbers = [];
    
    if (dist === 'normal') {
        params.mean = parseFloat(document.getElementById('randomMean').value);
        params.std = parseFloat(document.getElementById('randomStd').value);
        steps += `Parameters: μ = ${params.mean}, σ = ${params.std}\n`;
        steps += `Method: Box-Muller transform\n`;
        steps += `Z = μ + σ × √(-2 ln(U₁)) × cos(2πU₂)\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params);
        
    } else if (dist === 'uniform') {
        params.min = parseFloat(document.getElementById('randomMin').value);
        params.max = parseFloat(document.getElementById('randomMax').value);
        steps += `Parameters: a = ${params.min}, b = ${params.max}\n`;
        steps += `Method: X = a + U × (b - a)\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params);
        
    } else if (dist === 'exponential') {
        params.rate = parseFloat(document.getElementById('randomRate').value);
        steps += `Parameters: λ = ${params.rate}\n`;
        steps += `Method: X = -ln(1 - U) / λ\n\n`;
        
        randomNumbers = generateRandomNumbers(count, dist, params);
        
    } else if (dist === 'beta') {
        params.alpha = parseFloat(document.getElementById('randomAlpha').value);
        params.beta = parseFloat(document.getElementById('randomBeta').value);
        
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `🎲 BETA DISTRIBUTION RANDOM NUMBER GENERATION\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `Parameters: α (shape1) = ${params.alpha}, β (shape2) = ${params.beta}\n\n`;
        
        // Calculate distribution statistics
        const theoreticalMean = params.alpha / (params.alpha + params.beta);
        const theoreticalVar = (params.alpha * params.beta) / ((params.alpha + params.beta) ** 2 * (params.alpha + params.beta + 1));
        const theoreticalStd = Math.sqrt(theoreticalVar);
        const mode = (params.alpha > 1 && params.beta > 1) ? (params.alpha - 1) / (params.alpha + params.beta - 2) : null;
        
        steps += `📊 DISTRIBUTION CHARACTERISTICS:\n`;
        steps += `• Mean (μ) = α/(α+β) = ${params.alpha}/${params.alpha+params.beta} = ${theoreticalMean.toFixed(6)}\n`;
        steps += `• Variance (σ²) = ${theoreticalVar.toFixed(6)}\n`;
        steps += `• Standard Deviation (σ) = ${theoreticalStd.toFixed(6)}\n`;
        if (mode) steps += `• Mode (peak) = (α-1)/(α+β-2) = ${mode.toFixed(6)}\n`;
        steps += `• Support (domain) = [0, 1] (proportions, probabilities, percentages)\n\n`;
        
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `🔬 GENERATION METHOD SELECTION\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        // Generate the random numbers and store in randomNumbers array
        randomNumbers = [];
        
        if (params.alpha > 1 && params.beta > 1) {
            steps += `✓ METHOD: Acceptance-Rejection Sampling (Best for α>1, β>1)\n\n`;
            steps += `Why this method?\n`;
            steps += `• Both shape parameters > 1 → Distribution is unimodal (has a single peak)\n`;
            steps += `• The mode (peak) provides a good bounding constant for rejection sampling\n`;
            steps += `• Efficient for generating values from the target distribution\n\n`;
            
            steps += `📐 ALGORITHM STEPS:\n`;
            steps += `1. Calculate the mode (peak) of the Beta distribution\n`;
            steps += `   Mode = (α-1)/(α+β-2) = ${mode.toFixed(6)}\n\n`;
            
            const maxDensity = betaPDF(mode, params.alpha, params.beta);
            steps += `2. Calculate maximum density at the mode:\n`;
            steps += `   f(mode) = f(${mode.toFixed(6)}) = ${maxDensity.toFixed(6)}\n\n`;
            
            steps += `3. For each random number to generate:\n`;
            steps += `   a) Generate candidate x ~ Uniform(0,1)\n`;
            steps += `   b) Generate y ~ Uniform(0, ${maxDensity.toFixed(6)})\n`;
            steps += `   c) Accept x if y ≤ f(x), otherwise reject and repeat\n`;
            steps += `   d) This ensures samples follow the Beta(α,β) distribution\n\n`;
            
            steps += `🔢 GENERATION PROCESS (showing first 5 samples in detail):\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            
            let samplesShown = 0;
            const maxShowDetails = Math.min(5, count);
            
            for (let i = 0; i < count; i++) {
                let x, y, attempts = 0;
                do {
                    x = Math.random();
                    y = Math.random() * maxDensity;
                    attempts++;
                } while (y > betaPDF(x, params.alpha, params.beta));
                randomNumbers.push(x);
                
                if (samplesShown < maxShowDetails) {
                    steps += `\nSample #${i+1}:\n`;
                    steps += `  Attempts needed: ${attempts}\n`;
                    steps += `  • Generated candidate x = ${x.toFixed(6)}\n`;
                    steps += `  • Generated y = ${y.toFixed(6)}\n`;
                    steps += `  • f(x) = ${betaPDF(x, params.alpha, params.beta).toFixed(6)}\n`;
                    steps += `  • y ≤ f(x)? ${y <= betaPDF(x, params.alpha, params.beta) ? '✓ YES → ACCEPTED' : '✗ NO → REJECTED'}\n`;
                    steps += `  • Final value = ${x.toFixed(6)}\n`;
                    samplesShown++;
                }
            }
            
            if (count > maxShowDetails) {
                steps += `\n... and ${count - maxShowDetails} more values generated similarly ...\n`;
            }
            
        } else {
            steps += `✓ METHOD: Gamma Ratio Transformation (Works for all α,β > 0)\n\n`;
            steps += `Why this method?\n`;
            steps += `• One or both shape parameters ≤ 1 → Distribution may be J-shaped or U-shaped\n`;
            steps += `• Gamma ratio method is more stable and works for all parameter values\n`;
            steps += `• Based on relationship between Beta and Gamma distributions\n\n`;
            
            steps += `📐 MATHEMATICAL BASIS:\n`;
            steps += `   If X ~ Gamma(α,1) and Y ~ Gamma(β,1) are independent,\n`;
            steps += `   then Z = X/(X+Y) ~ Beta(α,β)\n\n`;
            
            steps += `🔢 ALGORITHM STEPS:\n`;
            steps += `1. Generate U ~ Uniform(0,1)\n`;
            steps += `2. Generate V ~ Uniform(0,1) (independent)\n`;
            steps += `3. Transform using Gamma quantile:\n`;
            steps += `   X = (-ln(U))^(1/α)  [approximation for Gamma(α,1)]\n`;
            steps += `   Y = (-ln(V))^(1/β)  [approximation for Gamma(β,1)]\n`;
            steps += `4. Return Z = X/(X+Y) ~ Beta(α,β)\n\n`;
            
            steps += `🔢 GENERATION PROCESS (showing first 5 samples in detail):\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            
            let samplesShown = 0;
            const maxShowDetails = Math.min(5, count);
            
            for (let i = 0; i < count; i++) {
                const u = Math.random();
                const v = Math.random();
                const X = Math.pow(-Math.log(u), 1/params.alpha);
                const Y = Math.pow(-Math.log(v), 1/params.beta);
                const Z = X / (X + Y);
                randomNumbers.push(Z);
                
                if (samplesShown < maxShowDetails) {
                    steps += `\nSample #${i+1}:\n`;
                    steps += `  Step 1: Generate U = ${u.toFixed(6)}\n`;
                    steps += `  Step 2: Generate V = ${v.toFixed(6)}\n`;
                    steps += `  Step 3: Calculate X = (-ln(${u.toFixed(6)}))^(1/${params.alpha}) = ${X.toFixed(6)}\n`;
                    steps += `  Step 4: Calculate Y = (-ln(${v.toFixed(6)}))^(1/${params.beta}) = ${Y.toFixed(6)}\n`;
                    steps += `  Step 5: Calculate Z = X/(X+Y) = ${X.toFixed(6)}/(${X.toFixed(6)}+${Y.toFixed(6)}) = ${Z.toFixed(6)}\n`;
                    steps += `  ✓ Generated Beta(α=${params.alpha}, β=${params.beta}) value = ${Z.toFixed(6)}\n`;
                    samplesShown++;
                }
            }
            
            if (count > maxShowDetails) {
                steps += `\n... and ${count - maxShowDetails} more values generated similarly ...\n`;
            }
        }
        
        steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `📊 GENERATION SUMMARY\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        // Calculate sample statistics from generated numbers
        const sampleMean = randomNumbers.reduce((a,b) => a+b, 0) / randomNumbers.length;
        const sampleVar = randomNumbers.reduce((a,b) => a + Math.pow(b - sampleMean, 2), 0) / randomNumbers.length;
        const sampleStd = Math.sqrt(sampleVar);
        const sampleMin = Math.min(...randomNumbers);
        const sampleMax = Math.max(...randomNumbers);
        
        steps += `Sample Statistics (based on generated values):\n`;
        steps += `• Sample Mean = ${sampleMean.toFixed(6)} (theoretical: ${theoreticalMean.toFixed(6)})\n`;
        steps += `• Sample Std Dev = ${sampleStd.toFixed(6)} (theoretical: ${theoreticalStd.toFixed(6)})\n`;
        steps += `• Sample Min = ${sampleMin.toFixed(6)} (theoretical: 0)\n`;
        steps += `• Sample Max = ${sampleMax.toFixed(6)} (theoretical: 1)\n`;
        steps += `• Sample Range = ${(sampleMax - sampleMin).toFixed(6)}\n`;
        
        steps += `\n💡 QUALITY CHECK:\n`;
        const meanDiff = Math.abs(sampleMean - theoreticalMean);
        if (meanDiff < 0.05 * theoreticalStd) {
            steps += `✓ Sample mean is close to theoretical mean → Good approximation\n`;
        } else {
            steps += `⚠ Sample mean differs from theoretical mean. Try generating more samples.\n`;
        }
        
        steps += `\n🎯 PRACTICAL APPLICATIONS:\n`;
        steps += `• These random values follow a Beta(${params.alpha},${params.beta}) distribution\n`;
        steps += `• Can be used for: Monte Carlo simulation, Bayesian inference, A/B testing\n`;
        steps += `• Values represent: probabilities, proportions, percentages, rates\n`;
    }
    
    // If randomNumbers is still empty (shouldn't happen), generate generic
    if (randomNumbers.length === 0) {
        randomNumbers = generateRandomNumbers(count, dist, params);
    }
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ RANDOM NUMBERS GENERATED:\n`;
    steps += randomNumbers.map(n => n.toFixed(6)).join(', ');
    
    // Calculate summary statistics for the result display
    const sum = randomNumbers.reduce((a,b) => a+b, 0);
    const mean = sum / count;
    const min = Math.min(...randomNumbers);
    const max = Math.max(...randomNumbers);
    const variance = randomNumbers.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    
    steps += `\n\n📊 Summary Statistics:\n`;
    steps += `  Mean: ${mean.toFixed(6)}\n`;
    steps += `  Standard Deviation: ${stdDev.toFixed(6)}\n`;
    steps += `  Minimum: ${min.toFixed(6)}\n`;
    steps += `  Maximum: ${max.toFixed(6)}\n`;
    steps += `  Range: ${(max - min).toFixed(6)}\n`;
    
    return { randomNumbers, steps, resultStr: randomNumbers.map(n => n.toFixed(4)).join(', ') };
}

// ========== SETUP FUNCTIONS FOR EACH PROBABILITY FEATURE ==========
function setupPDFLogic() {
    const distSelect = document.getElementById('pdfDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updatePDFParams);
        updatePDFParams();
    }
    
    const computeBtn = document.getElementById('pdfComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computePDFWithSteps();
            const resultDiv = document.getElementById('pdfResultArea');
            const valueSpan = document.getElementById('pdfValueDisplay');
            const stepsSpan = document.getElementById('pdfStepsDisplay');
            
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
    
    attachClearHandler('pdfClearBtn', 'pdfXValues', 'pdfResultArea');
}

function setupCDFLogic() {
    const distSelect = document.getElementById('cdfDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateCDFParams);
        updateCDFParams();
    }
    
    const computeBtn = document.getElementById('cdfComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computeCDFWithSteps();
            const resultDiv = document.getElementById('cdfResultArea');
            const valueSpan = document.getElementById('cdfValueDisplay');
            const stepsSpan = document.getElementById('cdfStepsDisplay');
            
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
    
    attachClearHandler('cdfClearBtn', 'cdfXValues', 'cdfResultArea');
}

function setupQuantileLogic() {
    const distSelect = document.getElementById('quantileDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateQuantileParams);
        updateQuantileParams();
    }
    
    const computeBtn = document.getElementById('quantileComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computeQuantileWithSteps();
            const resultDiv = document.getElementById('quantileResultArea');
            const valueSpan = document.getElementById('quantileValueDisplay');
            const stepsSpan = document.getElementById('quantileStepsDisplay');
            
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
    
    attachClearHandler('quantileClearBtn', 'quantileProbs', 'quantileResultArea');
}

function setupRandomLogic() {
    const distSelect = document.getElementById('randomDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateRandomParams);
        updateRandomParams();
    }
    
    const computeBtn = document.getElementById('randomComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computeRandomWithSteps();
            const resultDiv = document.getElementById('randomResultArea');
            const valueSpan = document.getElementById('randomValueDisplay');
            const stepsSpan = document.getElementById('randomStepsDisplay');
            
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
    
    attachClearHandler('randomClearBtn', 'randomCount', 'randomResultArea');
}
// ========== CONTINGENCY TABLE RENDER FUNCTION ==========
function renderContingencyInterface() {
    return `
        <div class="stat-interface" id="statContingencyInterface">
            <div class="interface-title">📋 Contingency Table (Cross-Tabulation)</div>
            <div class="formula-card">
                <div class="formula">📌 Frequency table showing distribution of two categorical variables</div>
                <div class="desc">Shows frequency counts for combinations of two categorical variables. Each cell contains the count of observations falling into that category pair.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data as comma-separated pairs (category1, category2):</label>
                <textarea id="contingencyData" rows="4" placeholder="Example:&#10;Red, Apple&#10;Green, Apple&#10;Red, Orange&#10;Red, Apple&#10;Green, Orange&#10;Red, Orange"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">Each line: value for Row Variable, value for Column Variable</div>
                <div class="action-row">
                    <button class="primary-btn" id="contingencyComputeBtn">📋 Build Contingency Table</button>
                    <button class="secondary-btn" id="contingencyClearBtn">Clear</button>
                </div>
            </div>
            <div id="contingencyResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 CONTINGENCY TABLE</div>
                    <div class="result-value" id="contingencyValueDisplay">—</div>
                    <div class="calculation-steps" id="contingencyStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== CHI-SQUARE TEST RENDER FUNCTION ==========
// ========== CHI-SQUARE TEST RENDER FUNCTION ==========
function renderChisquareInterface() {
    return `
        <div class="stat-interface" id="statChisquareInterface">
            <div class="interface-title">🔬 Chi-Square Test of Independence</div>
            <div class="formula-card">
                <div class="formula">📌 χ² = Σ (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ</div>
                <div class="desc">Tests whether two categorical variables are independent. Null hypothesis: variables are independent.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data as comma-separated pairs (category1, category2):</label>
                <textarea id="chisquareData" rows="4" placeholder="Example:&#10;Red, Apple&#10;Green, Apple&#10;Red, Orange&#10;Red, Apple&#10;Green, Orange&#10;Red, Orange"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">Each line: value for Row Variable, value for Column Variable</div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="chisquareAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                    <option value="0.001">α = 0.001 (99.9% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="chisquareComputeBtn">🔬 Run Chi-Square Test + Full Steps</button>
                    <button class="secondary-btn" id="chisquareClearBtn">Clear</button>
                </div>
            </div>
            <div id="chisquareResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 CHI-SQUARE TEST RESULTS</div>
                    <div class="result-value" id="chisquareValueDisplay">—</div>
                    <div class="calculation-steps" id="chisquareStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== CONTINGENCY TABLE COMPUTATION ==========
function computeContingencyTableWithSteps(inputText) {
    const lines = inputText.trim().split(/\r?\n/);
    const pairs = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 2) {
            pairs.push({ row: parts[0], col: parts[1] });
        }
    }
    
    if (pairs.length === 0) {
        return { error: true, message: "No valid data pairs entered." };
    }
    
    // Get unique row and column categories
    const rowCategories = [...new Set(pairs.map(p => p.row))].sort();
    const colCategories = [...new Set(pairs.map(p => p.col))].sort();
    
    // Create contingency table
    const table = {};
    const rowTotals = {};
    const colTotals = {};
    
    // Initialize table
    for (let row of rowCategories) {
        table[row] = {};
        rowTotals[row] = 0;
        for (let col of colCategories) {
            table[row][col] = 0;
        }
    }
    for (let col of colCategories) {
        colTotals[col] = 0;
    }
    
    // Fill table
    for (let pair of pairs) {
        table[pair.row][pair.col]++;
        rowTotals[pair.row]++;
        colTotals[pair.col]++;
    }
    
    const grandTotal = pairs.length;
    
    // Build HTML table
    let tableHtml = `<div style="overflow-x: auto;">
        <table style="border-collapse: collapse; width: 100%; margin: 15px 0; font-family: monospace;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #1a5490; color: white;"></th>`;
    for (let col of colCategories) {
        tableHtml += `<th style="border: 1px solid #ddd; padding: 8px; background: #1a5490; color: white;">${col}</th>`;
    }
    tableHtml += `<th style="border: 1px solid #ddd; padding: 8px; background: #1a5490; color: white;">Row Total</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let row of rowCategories) {
        tableHtml += `<tr>
            <th style="border: 1px solid #ddd; padding: 8px; background: #e8f4f8;">${row}</th>`;
        for (let col of colCategories) {
            tableHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${table[row][col]}</td>`;
        }
        tableHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; background: #e8f4f8; font-weight: bold;">${rowTotals[row]}</td>
        </tr>`;
    }
    
    tableHtml += `<tr>
        <th style="border: 1px solid #ddd; padding: 8px; background: #e8f4f8;">Column Total</th>`;
    for (let col of colCategories) {
        tableHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; background: #e8f4f8; font-weight: bold;">${colTotals[col]}</td>`;
    }
    tableHtml += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; background: #e8f4f8; font-weight: bold;">${grandTotal}</td>
    </tr>`;
    tableHtml += `</tbody></table></div>`;
    
    let steps = `📋 CONTINGENCY TABLE (Cross-Tabulation)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Total observations: ${grandTotal}\n\n`;
    steps += `Row variable categories: ${rowCategories.join(', ')}\n`;
    steps += `Column variable categories: ${colCategories.join(', ')}\n\n`;
    steps += `${tableHtml}`;
    
    return { table, rowCategories, colCategories, rowTotals, colTotals, grandTotal, steps, tableHtml };
}

// ========== CHI-SQUARE TEST COMPUTATION ==========
// ========== CHI-SQUARE TEST COMPUTATION ==========
function computeChisquareWithSteps(inputText, alpha = 0.05) {
    const lines = inputText.trim().split(/\r?\n/);
    const pairs = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 2) {
            pairs.push({ row: parts[0], col: parts[1] });
        }
    }
    
    if (pairs.length === 0) {
        return { error: true, message: "No valid data pairs entered." };
    }
    
    // Get unique row and column categories
    const rowCategories = [...new Set(pairs.map(p => p.row))].sort();
    const colCategories = [...new Set(pairs.map(p => p.col))].sort();
    
    // Create observed frequencies
    const observed = {};
    const rowTotals = {};
    const colTotals = {};
    
    for (let row of rowCategories) {
        observed[row] = {};
        rowTotals[row] = 0;
        for (let col of colCategories) {
            observed[row][col] = 0;
        }
    }
    for (let col of colCategories) {
        colTotals[col] = 0;
    }
    
    for (let pair of pairs) {
        observed[pair.row][pair.col]++;
        rowTotals[pair.row]++;
        colTotals[pair.col]++;
    }
    
    const grandTotal = pairs.length;
    const df = (rowCategories.length - 1) * (colCategories.length - 1);
    
    // Calculate expected frequencies and chi-square
    let chiSquare = 0;
    let calculationRows = [];
    
    for (let row of rowCategories) {
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / grandTotal;
            const observedVal = observed[row][col];
            const contribution = Math.pow(observedVal - expected, 2) / expected;
            chiSquare += contribution;
            calculationRows.push({ row, col, observed: observedVal, expected, contribution });
        }
    }
    
    // Exact critical value for any df and alpha
    const criticalValue = chiSquareCriticalValue(alpha, df);
    
    // p-value from the exact chi-square distribution
    const pValue = 1 - chiSquareCDF(chiSquare, df);
    
    // Determine conclusion
    let conclusion, interpretation, recommendation;
    if (chiSquare > criticalValue) {
        conclusion = "REJECT the null hypothesis";
        interpretation = "There IS a statistically significant association between the variables.";
        recommendation = `At α = ${alpha}, we have sufficient evidence that the variables are NOT independent.`;
    } else {
        conclusion = "FAIL TO REJECT the null hypothesis";
        interpretation = "There is NOT enough evidence of an association between the variables.";
        recommendation = `At α = ${alpha}, we cannot conclude that the variables are dependent. They may be independent.`;
    }
    
    // Build steps HTML
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🔬</span>
                <h2 style="margin: 0;">Chi-Square Test of Independence</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: χ² = Σ (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #1a5490;">
                    <div style="font-size: 12px; color: #6c757d;">Total Observations</div>
                    <div style="font-size: 28px; font-weight: 700;">${grandTotal}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Row Categories</div>
                    <div style="font-size: 20px;">${rowCategories.length}</div>
                    <div style="font-size: 11px;">${rowCategories.join(', ')}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Column Categories</div>
                    <div style="font-size: 20px;">${colCategories.length}</div>
                    <div style="font-size: 11px;">${colCategories.join(', ')}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #ffc107;">
                    <div style="font-size: 12px; color: #6c757d;">Degrees of Freedom</div>
                    <div style="font-size: 28px; font-weight: 700;">${df}</div>
                    <div style="font-size: 11px;">= (${rowCategories.length}-1) × (${colCategories.length}-1)</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490;">📋 Observed Frequencies (Oᵢⱼ)</h3>
            <table style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px; border: 1px solid #ddd;"></th>`;
    for (let col of colCategories) {
        steps += `<th style="padding: 10px; border: 1px solid #ddd;">${col}</th>`;
    }
    steps += `<th style="padding: 10px; border: 1px solid #ddd;">Row Total</th>
                    </tr>
                </thead>
                <tbody>`;
    for (let row of rowCategories) {
        steps += `<tr>
            <th style="padding: 10px; border: 1px solid #ddd; background: #e8f4f8;">${row}</th>`;
        for (let col of colCategories) {
            steps += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${observed[row][col]}</td>`;
        }
        steps += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; background: #e8f4f8;">${rowTotals[row]}</td>
        </tr>`;
    }
    steps += `<tr>
        <th style="padding: 10px; border: 1px solid #ddd; background: #e8f4f8;">Column Total</th>`;
    for (let col of colCategories) {
        steps += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; background: #e8f4f8;">${colTotals[col]}</td>`;
    }
    steps += `<td style="padding: 10px; border: 1px solid #ddd; text-align: center; background: #e8f4f8;">${grandTotal}</td>
    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate Expected Frequencies</strong></div>
                </div>
                <div style="margin-left: 40px; font-size: 13px;">Formula: Eᵢⱼ = (Row Total × Column Total) / Grand Total</div>`;
    
    for (let row of rowCategories) {
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / grandTotal;
            steps += `<div style="margin-left: 40px; font-family: monospace; margin-top: 8px;">
                E(${row},${col}) = (${rowTotals[row]} × ${colTotals[col]}) / ${grandTotal} = ${expected.toFixed(4)}
            </div>`;
        }
    }
    
    steps += `</div>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate Chi-Square Contributions</strong></div>
                </div>
                <div style="margin-left: 40px; font-size: 13px;">Formula: (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ</div>`;
    
    for (let row of rowCategories) {
        for (let col of colCategories) {
            const expected = (rowTotals[row] * colTotals[col]) / grandTotal;
            const observedVal = observed[row][col];
            const contribution = Math.pow(observedVal - expected, 2) / expected;
            steps += `<div style="margin-left: 40px; font-family: monospace; margin-top: 8px;">
                (${observedVal} - ${expected.toFixed(4)})² / ${expected.toFixed(4)} = ${contribution.toFixed(6)}
            </div>`;
        }
    }
    
    steps += `</div>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Sum All Contributions</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 18px; font-weight: 700;">
                    χ² = ${chiSquare.toFixed(6)}
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Hypothesis Test Decision</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Significance Level (α)</div>
                    <div style="font-size: 20px; font-weight: 700;">${alpha} (${(1-alpha)*100}% Confidence)</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Critical Value</div>
                    <div style="font-size: 20px; font-weight: 700;">χ²_critical = ${criticalValue.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">p-value</div>
                    <div style="font-size: 20px; font-weight: 700;">${pValue.toFixed(6)}</div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${chiSquare > criticalValue ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>Chi-Square Statistic:</strong> χ² = ${chiSquare.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> df = ${df}</div>
            <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                <strong>Recommendation:</strong> ${recommendation}
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Null Hypothesis (H₀):</strong> The row and column variables are independent (no association).<br>
                💡 <strong>Alternative Hypothesis (H₁):</strong> The row and column variables are dependent (there is an association).
            </div>
        </div>
    </div>`;
    
    return { chiSquare, df, criticalValue, pValue, alpha, conclusion, interpretation, steps, observed, expected: calculationRows };
}



// ========== CONTINGENCY TABLE SETUP ==========
function setupContingencyLogic() {
    const computeBtn = document.getElementById("contingencyComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("contingencyData").value;
        const resultDiv = document.getElementById("contingencyResultArea");
        const valueSpan = document.getElementById("contingencyValueDisplay");
        const stepsSpan = document.getElementById("contingencyStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter data pairs (category1, category2)";
            return;
        }
        
        const result = computeContingencyTableWithSteps(raw);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerText = result.message;
        } else {
            valueSpan.innerHTML = `${result.rowCategories.length} rows × ${result.colCategories.length} columns | Total: ${result.grandTotal} observations`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("contingencyClearBtn", "contingencyData", "contingencyResultArea");
}

// ========== CHI-SQUARE TEST SETUP ==========
function setupChisquareLogic() {
    const computeBtn = document.getElementById("chisquareComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("chisquareData").value;
        const alphaSelect = document.getElementById("chisquareAlpha");
        const alpha = parseFloat(alphaSelect.value);
        const resultDiv = document.getElementById("chisquareResultArea");
        const valueSpan = document.getElementById("chisquareValueDisplay");
        const stepsSpan = document.getElementById("chisquareStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter data pairs (category1, category2)";
            return;
        }
        
        const result = computeChisquareWithSteps(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerText = result.message;
        } else {
            valueSpan.innerHTML = `χ² = ${result.chiSquare.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)} | α = ${result.alpha}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("chisquareClearBtn", "chisquareData", "chisquareResultArea");
}
