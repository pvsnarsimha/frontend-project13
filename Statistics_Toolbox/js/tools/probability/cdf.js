/* CDF: cdf tool (render, compute, setup) */

function renderCDFInterface() {
    return buildInterface({
        id: "statCDFInterface",
        title: "📈 Cumulative Distribution Function (CDF)",
        formula: "📌 F(x) = P(X ≤ x)",
        desc: "CDF gives the probability that a random variable is less than or equal to x.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: { id: "cdfDistribution", style: FIELD_STYLE },
                options: DISTRIBUTION_OPTIONS
            },
            {
                html: "<div id=\"cdfParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            },
            {
                label: "📊 X Value(s):",
                textarea: { id: "cdfXValues", rows: "3", placeholder: "Enter x value(s) (comma-separated)&#10;Example: 0, 1, 2, 3" }
            }
        ],
        run: { id: "cdfComputeBtn", text: "📈 Calculate CDF + Steps" },
        clear: { id: "cdfClearBtn", text: "Clear" },
        result: { area: "cdfResultArea", label: "🎯 CDF RESULTS", value: "cdfValueDisplay", steps: "cdfStepsDisplay" }
    });
}

function uniformCDF(x, min = 0, max = 1) {
    if (x < min) return 0;
    if (x > max) return 1;
    return (x - min) / (max - min);
}

function exponentialCDF(x, rate = 1) {
    if (x < 0) return 0;
    return 1 - Math.exp(-rate * x);
}

// Add setup functions for each probability feature
// ========== CDF COMPUTATION FUNCTIONS ==========
function updateCDFParams() {
    const dist = document.getElementById('cdfDistribution').value;
    const paramsDiv = document.getElementById('cdfParams');
    
    if (dist === 'normal') {
        setHtml(paramsDiv, `
            <label>📊 Mean (μ):</label>
            <input type="number" id="cdfMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="cdfStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'uniform') {
        setHtml(paramsDiv, `
            <label>📊 Minimum (a):</label>
            <input type="number" id="cdfMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="cdfMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'exponential') {
        setHtml(paramsDiv, `
            <label>📊 Rate (λ):</label>
            <input type="number" id="cdfRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'beta') {
        setHtml(paramsDiv, `
            <label>📊 Alpha (α):</label>
            <input type="number" id="cdfAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="cdfBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
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
