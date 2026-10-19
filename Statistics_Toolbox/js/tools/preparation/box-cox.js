/* BoxCox: boxcox tool (render, compute, setup) */

// ========== BOX-COX TRANSFORMATION RENDER FUNCTION ==========
function renderBoxCoxInterface() {
    return buildInterface({
        id: "statBoxCoxInterface",
        title: "📐 Box-Cox Transformation",
        formula: "📌 y(λ) = (x^λ - 1)/λ for λ ≠ 0, y(λ) = ln(x) for λ = 0",
        desc: "Box-Cox transformation stabilizes variance and makes data more normally distributed. All values must be positive (x > 0). The optimal λ maximizes the log-likelihood function.",
        inputs: [
            {
                label: "📋 Enter positive numeric values (comma, space, or line separated):",
                textarea: { id: "boxcoxInput", rows: "4", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📐 Lambda (λ) parameter:",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "boxcoxLambdaType", style: FIELD_STYLE },
                options: [["optimal", "Find Optimal λ (Recommended)"], ["custom", "Use Custom λ"]]
            },
            {
                html: "<div id=\"boxcoxCustomLambdaDiv\" style=\"display: none;\">\n                    <label>✏️ Custom Lambda value:</label>\n                    <input type=\"number\" id=\"boxcoxCustomLambda\" value=\"0.5\" step=\"0.1\" style=\"width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;\">\n                    <div class=\"desc\" style=\"font-size: 0.75rem;\">λ = 0 → log transform | λ = 0.5 → square root | λ = 1 → no change | λ = 2 → square</div>\n                </div>"
            }
        ],
        run: { id: "boxcoxComputeBtn", text: "📐 Apply Box-Cox Transformation + Steps" },
        clear: { id: "boxcoxClearBtn", text: "Clear" },
        result: {
            area: "boxcoxResultArea",
            label: "🎯 BOX-COX TRANSFORMATION RESULTS",
            value: "boxcoxValueDisplay",
            steps: "boxcoxStepsDisplay"
        }
    });
}

// ========== BOX-COX TRANSFORMATION COMPUTATION ==========
// ========== BOX-COX TRANSFORMATION COMPUTATION (FIXED) ==========
// (x^λ - 1) / λ, with its limit ln(x) as λ → 0. Near zero the textbook form subtracts two almost equal numbers and
// loses digits, so it is written with expm1 (x^λ - 1 = expm1(λ ln x)), which stays accurate down to the switch-over.
const BOXCOX_LAMBDA_ZERO = 1e-10;
function boxCoxValue(x, lambda) {
    return Math.abs(lambda) < BOXCOX_LAMBDA_ZERO ? Math.log(x) : Math.expm1(lambda * Math.log(x)) / lambda;
}

function computeBoxCoxWithSteps(numbers, lambdaType, customLambda = null) {
    if (!numbers || numbers.length === 0) return { error: true, message: "No numbers provided." };
    
    // Filter out invalid numbers
    const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n) && isFinite(n));
    if (validNumbers.length === 0) return { error: true, message: "No valid numbers provided." };
    
    const nonPositive = validNumbers.filter(v => v <= 0);
    if (nonPositive.length > 0) {
        return { error: true, message: `❌ Box-Cox transformation requires ALL values > 0. Invalid: ${nonPositive.join(', ')}` };
    }
    
    const n = validNumbers.length;
    let lambda;
    let isOptimal = false;
    
    // Determine lambda
    if (lambdaType === 'optimal') {
        isOptimal = true;
        // Find the optimal lambda by maximizing the profile log-likelihood:
        // coarse grid scan on [-5, 5] to bracket the peak, then golden-section search inside the bracket.
        const sumLogX = validNumbers.reduce((a, b) => a + Math.log(b), 0);
        const logLikelihood = lam => {
            const transformed = validNumbers.map(x => boxCoxValue(x, lam));
            const mean = transformed.reduce((a, b) => a + b, 0) / n;
            const variance = transformed.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n;
            return variance > 0 ? -n / 2 * Math.log(variance) + (lam - 1) * sumLogX : -Infinity;
        };
        const LAMBDA_MIN = -5, LAMBDA_MAX = 5, GRID_STEP = 0.25;
        let bestLam = LAMBDA_MIN, bestLL = -Infinity;
        for (let lam = LAMBDA_MIN; lam <= LAMBDA_MAX + 1e-9; lam += GRID_STEP) {
            const ll = logLikelihood(lam);
            if (ll > bestLL) { bestLL = ll; bestLam = lam; }
        }
        if (!isFinite(bestLL)) {
            return { error: true, message: "❌ All values are identical, so Box-Cox cannot choose λ (the transformed variance is 0)." };
        }
        let lo = Math.max(LAMBDA_MIN, bestLam - GRID_STEP), hi = Math.min(LAMBDA_MAX, bestLam + GRID_STEP);
        const INV_PHI = (Math.sqrt(5) - 1) / 2;
        let x1 = hi - INV_PHI * (hi - lo), x2 = lo + INV_PHI * (hi - lo);
        let f1 = logLikelihood(x1), f2 = logLikelihood(x2);
        while (hi - lo > 1e-8) {
            if (f1 < f2) { lo = x1; x1 = x2; f1 = f2; x2 = lo + INV_PHI * (hi - lo); f2 = logLikelihood(x2); }
            else { hi = x2; x2 = x1; f2 = f1; x1 = hi - INV_PHI * (hi - lo); f1 = logLikelihood(x1); }
        }
        lambda = (lo + hi) / 2;
    } else {
        lambda = customLambda;
        if (lambda === null || isNaN(lambda)) lambda = 0;
    }
    
    // Apply transformation
    let transformed;
    let formula;
    transformed = validNumbers.map(x => boxCoxValue(x, lambda));
    if (Math.abs(lambda) < BOXCOX_LAMBDA_ZERO) {
        formula = `y = ln(x)`;
    } else {
        formula = `y = (x^${lambda.toFixed(4)} - 1) / ${lambda.toFixed(4)}`;
    }
    
    // Calculate statistics
    const origMean = validNumbers.reduce((a, b) => a + b, 0) / n;
    const origStd = Math.sqrt(validNumbers.reduce((a, b) => a + Math.pow(b - origMean, 2), 0) / n);
    const transMean = transformed.reduce((a, b) => a + b, 0) / n;
    const transStd = Math.sqrt(transformed.reduce((a, b) => a + Math.pow(b - transMean, 2), 0) / n);
    
    // Calculate skewness before and after
    const origSkew = validNumbers.reduce((a, b) => a + Math.pow((b - origMean) / origStd, 3), 0) / n;
    const transSkew = transformed.reduce((a, b) => a + Math.pow((b - transMean) / transStd, 3), 0) / n;
    
    let steps = `📐 BOX-COX TRANSFORMATION - STEP BY STEP\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📋 INPUT DATA:\n`;
    steps += `   Data: [${validNumbers.join(', ')}]\n`;
    steps += `   n = ${n}\n\n`;
    
    if (isOptimal) {
        steps += `🔍 STEP 1: Find optimal λ by maximizing log-likelihood\n`;
        steps += `   Formula: LL(λ) = -n/2 × ln(σ̂²(λ)) + (λ-1) × Σ ln(xᵢ)\n`;
        steps += `   Search: grid scan on [-5, 5], then golden-section refinement (no rounding)\n`;
        steps += `   Optimal λ = ${lambda.toFixed(4)}\n\n`;
    } else {
        steps += `📐 STEP 1: Using custom λ = ${lambda.toFixed(2)}\n`;
        steps += `   Formula: ${formula}\n\n`;
    }
    
    steps += `📐 STEP 2: Apply transformation to each value\n`;
    steps += `   Formula: ${formula}\n\n`;
    steps += `   ┌──────┬──────────┬──────────────────────┐\n`;
    steps += `   │  #   │ Original │ Transformed          │\n`;
    steps += `   ├──────┼──────────┼──────────────────────┤\n`;
    for (let i = 0; i < validNumbers.length; i++) {
        steps += `   │ ${(i+1).toString().padStart(2)} │ ${validNumbers[i].toString().padStart(8)} │ ${transformed[i].toFixed(8).padStart(16)} │\n`;
    }
    steps += `   └──────┴──────────┴──────────────────────┘\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 EFFECT ON DISTRIBUTION:\n`;
    steps += `   Original Mean: ${origMean.toFixed(6)}\n`;
    steps += `   Transformed Mean: ${transMean.toFixed(6)}\n`;
    steps += `   Original Std Dev: ${origStd.toFixed(6)}\n`;
    steps += `   Transformed Std Dev: ${transStd.toFixed(6)}\n`;
    steps += `   Original Skewness: ${origSkew.toFixed(6)}\n`;
    steps += `   Transformed Skewness: ${transSkew.toFixed(6)} `;
    if (Math.abs(transSkew) < Math.abs(origSkew)) {
        steps += `(✓ Reduced skewness)\n`;
    } else {
        steps += `(⚠ Skewness increased - try different λ)\n`;
    }
    steps += `\n`;
    
    steps += `✅ BOX-COX TRANSFORMATION SUMMARY:\n`;
    steps += `   • Lambda (λ) = ${lambda.toFixed(4)}\n`;
    steps += `   • Transformation: ${formula}\n`;
    steps += `   • Transformed data: [${transformed.map(x => x.toFixed(6)).join(', ')}]\n`;
    if (isOptimal) {
        if (Math.abs(lambda) < 0.1) {
            steps += `   • λ ≈ 0 → Natural log transformation is optimal\n`;
        } else if (Math.abs(lambda - 1) < 0.1) {
            steps += `   • λ ≈ 1 → No transformation needed (data already normal)\n`;
        } else if (Math.abs(lambda - 0.5) < 0.1) {
            steps += `   • λ ≈ 0.5 → Square root transformation is optimal\n`;
        } else if (Math.abs(lambda - 2) < 0.1) {
            steps += `   • λ ≈ 2 → Square transformation is optimal\n`;
        } else {
            steps += `   • λ = ${lambda.toFixed(4)} maximizes normality of the data\n`;
        }
    }
    
    return { 
        original: validNumbers, 
        transformed, 
        lambda, 
        formula, 
        origSkew, 
        transSkew,
        steps 
    };
}

// ========== BOX-COX SETUP ==========
function setupBoxCoxLogic() {
    const lambdaTypeSelect = document.getElementById("boxcoxLambdaType");
    const customLambdaDiv = document.getElementById("boxcoxCustomLambdaDiv");
    
    if (lambdaTypeSelect) {
        lambdaTypeSelect.addEventListener('change', () => {
            customLambdaDiv.style.display = lambdaTypeSelect.value === 'custom' ? 'block' : 'none';
        });
    }
    
    const computeBtn = document.getElementById("boxcoxComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("boxcoxInput").value;
        const numbers = parseNumbersFromInput(raw);
        const lambdaType = document.getElementById("boxcoxLambdaType").value;
        let customLambda = null;
        
        if (lambdaType === 'custom') {
            customLambda = parseFloat(document.getElementById("boxcoxCustomLambda").value);
        }
        
        const resultDiv = document.getElementById("boxcoxResultArea");
        const valueSpan = document.getElementById("boxcoxValueDisplay");
        const stepsSpan = document.getElementById("boxcoxStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter positive numbers for Box-Cox transformation.";
            return;
        }
        
        const result = computeBoxCoxWithSteps(numbers, lambdaType, customLambda);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerText = result.message;
        } else {
            setHtml(valueSpan, `λ = ${result.lambda.toFixed(4)} | Skewness: ${result.origSkew.toFixed(4)} → ${result.transSkew.toFixed(4)}`);
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("boxcoxClearBtn", "boxcoxInput", "boxcoxResultArea");
}
