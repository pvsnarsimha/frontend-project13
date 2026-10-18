/* Entropy: entropy tool (render, compute, setup) */

function betaFunction(alpha, beta) {
    return Math.exp(logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta));
}

// ========== DISTRIBUTION ENTROPY RENDER FUNCTION ==========
function renderEntropyInterface() {
    return buildInterface({
        id: "statEntropyInterface",
        title: "📊 Distribution Entropy H(X)",
        formula: "📌 Continuous: H(X) = -∫ f(x)·ln(f(x)) dx | Discrete: H(X) = -Σ P(x)·ln(P(x))",
        desc: "Entropy measures the uncertainty or randomness in a probability distribution. Higher entropy = more uncertainty/randomness.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: { id: "entropyDistribution", style: FIELD_STYLE },
                options: DISTRIBUTION_OPTIONS_2
            },
            {
                html: "<div id=\"entropyParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            }
        ],
        run: { id: "entropyComputeBtn", text: "📊 Calculate Entropy + Steps" },
        clear: { id: "entropyClearBtn", text: "Clear" },
        result: {
            area: "entropyResultArea",
            label: "🎯 DISTRIBUTION ENTROPY H(X)",
            value: "entropyValueDisplay",
            steps: "entropyStepsDisplay"
        }
    });
}

// ========== ENTROPY COMPUTATION FUNCTIONS ==========
function updateEntropyParams() {
    const dist = document.getElementById('entropyDistribution').value;
    const paramsDiv = document.getElementById('entropyParams');
    
    if (dist === 'normal') {
        setHtml(paramsDiv, `
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="entropyStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc">Entropy for Normal: H = ln(σ√(2πe))</div>
        `);
    } else if (dist === 'exponential') {
        setHtml(paramsDiv, `
            <label>📊 Rate (λ):</label>
            <input type="number" id="entropyRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc">Entropy for Exponential: H = 1 - ln(λ)</div>
        `);
    } else if (dist === 'uniform') {
        setHtml(paramsDiv, `
            <label>📊 Minimum (a):</label>
            <input type="number" id="entropyMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="entropyMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc">Entropy for Uniform: H = ln(b-a)</div>
        `);
    } else if (dist === 'beta') {
        setHtml(paramsDiv, `
            <label>📊 Alpha (α):</label>
            <input type="number" id="entropyAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="entropyBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'poisson') {
        setHtml(paramsDiv, `
            <label>📊 Lambda (λ):</label>
            <input type="number" id="entropyLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'binomial') {
        setHtml(paramsDiv, `
            <label>📊 Number of trials (n):</label>
            <input type="number" id="entropyN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="entropyP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
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
            setHtml(valueSpan, `H(X) = ${result.entropy.toFixed(6)}`);
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler('entropyClearBtn', '', 'entropyResultArea');
}
