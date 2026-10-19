/* PDF: pdf tool (render, compute, setup) */

// ========== PROBABILITY DISTRIBUTIONS RENDER FUNCTIONS ==========
function renderPDFInterface() {
    return buildInterface({
        id: "statPDFInterface",
        title: "📊 Probability Density Function (PDF)",
        formula: "📌 f(x) = density at point x for continuous distributions",
        desc: "PDF gives the relative likelihood of a random variable taking a specific value.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: { id: "pdfDistribution", style: FIELD_STYLE },
                options: DISTRIBUTION_OPTIONS
            },
            {
                html: "<div id=\"pdfParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            },
            {
                label: "📊 X Value(s):",
                textarea: { id: "pdfXValues", rows: "3", placeholder: "Enter x value(s) (comma-separated)&#10;Example: 0, 1, 2, 3" }
            }
        ],
        run: { id: "pdfComputeBtn", text: "📊 Calculate PDF + Steps" },
        clear: { id: "pdfClearBtn", text: "Clear" },
        result: { area: "pdfResultArea", label: "🎯 PDF RESULTS", value: "pdfValueDisplay", steps: "pdfStepsDisplay" }
    });
}

// Uniform Distribution Functions
function uniformPDF(x, min = 0, max = 1) {
    if (x < min || x > max) return 0;
    return 1 / (max - min);
}

// Exponential Distribution Functions
function exponentialPDF(x, rate = 1) {
    if (x < 0) return 0;
    return rate * Math.exp(-rate * x);
}

// Dynamic parameter UI generators
function updatePDFParams() {
    showDistributionParams('pdf');
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
