/* Quantile: quantile tool (render, compute, setup) */

function renderQuantileInterface() {
    return buildInterface({
        id: "statQuantileInterface",
        title: "🎯 Quantile Function (Inverse CDF)",
        formula: "📌 Q(p) = F⁻¹(p) = smallest x such that F(x) ≥ p",
        desc: "Quantile function returns the value below which a given percentage of observations fall.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: {
                    id: "quantileDistribution",
                    style: FIELD_STYLE
                },
                options: DISTRIBUTION_OPTIONS
            },
            {
                html: "<div id=\"quantileParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            },
            {
                label: "📊 Probability Value(s) (between 0 and 1):",
                textarea: {
                    id: "quantileProbs",
                    rows: "3",
                    placeholder: "Enter probability value(s) (comma-separated)&#10;Example: 0.025, 0.5, 0.975"
                }
            }
        ],
        run: { id: "quantileComputeBtn", text: "🎯 Calculate Quantiles + Steps" },
        clear: { id: "quantileClearBtn", text: "Clear" },
        result: {
            area: "quantileResultArea",
            label: "🎯 QUANTILE RESULTS",
            value: "quantileValueDisplay",
            steps: "quantileStepsDisplay"
        }
    });
}

function normalQuantile(p, mean = 0, std = 1) {
    return mean + std * normInv(p);
}

function uniformQuantile(p, min = 0, max = 1) {
    return min + p * (max - min);
}

function exponentialQuantile(p, rate = 1) {
    return -Math.log(1 - p) / rate;
}

// ========== QUANTILE (INVERSE CDF) COMPUTATION FUNCTIONS ==========
function updateQuantileParams() {
    showDistributionParams('quantile');
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
