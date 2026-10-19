/* FitDistribution: fitdistribution tool (render, compute, setup) */

// ========== FIT DISTRIBUTION (MLE) RENDER FUNCTION ==========
function renderFitDistributionInterface() {
    return buildInterface({
        id: "statFitDistributionInterface",
        title: "📐 Fit Distribution Parameters (Maximum Likelihood Estimation)",
        formula: "📌 MLE finds parameters that maximize the likelihood function L(θ|x)",
        desc: "Estimate distribution parameters from your data using Maximum Likelihood Estimation. Supports Normal, Exponential, and Uniform distributions.",
        inputs: [
            {
                label: "📋 Enter your data values (comma, space, or line separated):",
                textarea: { id: "fitDataInput", rows: "4", placeholder: "Example: 12.5, 15.3, 14.8, 16.2, 13.9, 15.1, 14.5, 15.7" }
            },
            {
                label: "📊 Select Distribution to Fit:",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "fitDistribution", style: FIELD_STYLE },
                options: [
                    ["normal", "Normal Distribution (Gaussian)"],
                    ["exponential", "Exponential Distribution"],
                    ["uniform", "Uniform Distribution"]
                ]
            }
        ],
        run: { id: "fitComputeBtn", text: "📐 Fit Distribution + Full Steps" },
        clear: { id: "fitClearBtn", text: "Clear" },
        result: {
            area: "fitResultArea",
            label: "🎯 MLE PARAMETER ESTIMATES",
            value: "fitValueDisplay",
            steps: "fitStepsDisplay"
        }
    });
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
                setHtml(valueSpan, `μ̂ = ${result.results.mean.toFixed(4)} | σ̂ (MLE, ÷ n) = ${result.results.stdDev.toFixed(4)}`);
            } else if (result.results.type === 'exponential') {
                setHtml(valueSpan, `λ̂ = ${result.results.rate.toFixed(4)} | Mean = ${result.results.mean.toFixed(4)}`);
            } else if (result.results.type === 'uniform') {
                setHtml(valueSpan, `â = ${result.results.min.toFixed(4)} | b̂ = ${result.results.max.toFixed(4)}`);
            }
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("fitClearBtn", "fitDataInput", "fitResultArea");
}

// ========== FIT DISTRIBUTION (MLE) COMPUTATION - DETAILED ==========
function computeFitDistributionWithSteps(data, distType) {
    if (!data.length) return { error: true, message: "No data provided." };
    if (data.length < 2) return { error: true, message: "Need at least 2 data points for fitting." };
    
    const n = data.length;
    const spread = Math.max(...data) - Math.min(...data);
    if ((distType === 'normal' || distType === 'uniform') && !(spread > 0)) {
        return { error: true, message: `All values are identical, so a ${distType} distribution cannot be fitted (${distType === 'normal' ? 'σ̂ = 0 and the likelihood is undefined' : 'the interval a to b has zero width and the likelihood is infinite'}). Enter values that vary.` };
    }
    if (distType === 'exponential' && (data.some(v => v < 0) || !(data.reduce((a, b) => a + b, 0) > 0))) {
        return { error: true, message: "Exponential data must be non-negative with a positive mean." };
    }
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
