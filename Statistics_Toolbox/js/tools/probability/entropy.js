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
    showDistributionParams('entropy', {
        skip: ['Mean'],
        notes: {
            normal: 'Entropy for Normal: H = ln(σ√(2πe))',
            exponential: 'Entropy for Exponential: H = 1 - ln(λ)',
            uniform: 'Entropy for Uniform: H = ln(b-a)'
        }
    });
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
        // Exact: H = -Σ P(k) ln P(k), summed until the remaining tail is negligible
        entropy = 0;
        if (lambda > 1e7) {
            // Beyond ~1e7 the sum has millions of terms; the asymptotic expansion is exact to far more digits than shown
            entropy = 0.5 * Math.log(2 * Math.PI * Math.E * lambda) - 1 / (12 * lambda) - 1 / (24 * lambda * lambda);
        } else {
            // only the window around the mean carries probability: 40 standard deviations each side is far past double precision
            const spreadK = 40 * Math.sqrt(lambda) + 50;
            const kMin = Math.max(0, Math.floor(lambda - spreadK)), kMax = Math.ceil(lambda + spreadK);
            for (let k = kMin; k <= kMax; k++) {
                const logP = -lambda + k * Math.log(lambda) - logGamma(k + 1);
                entropy -= Math.exp(logP) * logP;
            }
        }
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION ENTROPY                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Exact sum: H = -Σ P(k) ln P(k), with P(k) = e^(-λ) λ^k / k!\n\n`;
        steps += `   Given λ = ${lambda}\n`;
        steps += `   H = ${entropy.toFixed(8)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        // Exact: H = -Σ P(k) ln P(k) over k = 0..n
        entropy = 0;
        // only the window around n·p carries probability (40 standard deviations each side), so a huge n costs the same
        const spreadK = 40 * Math.sqrt(n * p * (1 - p)) + 50;
        const kLo = Math.max(0, Math.floor(n * p - spreadK)), kHi = Math.min(n, Math.ceil(n * p + spreadK));
        for (let k = kLo; k <= kHi; k++) {
            const logP = logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1) + (k > 0 ? k * Math.log(p) : 0) + (n - k > 0 ? (n - k) * Math.log(1 - p) : 0);
            if (isFinite(logP)) entropy -= Math.exp(logP) * logP;
        }
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION ENTROPY                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Exact sum: H = -Σ P(k) ln P(k), with P(k) = C(n,k) p^k (1-p)^(n-k)\n\n`;
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   H = ${entropy.toFixed(8)}\n\n`;
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

// Digamma ψ(x) for x > 0: shift x upward with the recurrence ψ(x) = ψ(x+1) - 1/x, then use the asymptotic series
function digamma(x) {
    if (!(x > 0)) return NaN;
    let result = 0;
    while (x < 10) { result -= 1 / x; x += 1; }
    const inv2 = 1 / (x * x);
    return result + Math.log(x) - 0.5 / x - inv2 * (1 / 12 - inv2 * (1 / 120 - inv2 * (1 / 252 - inv2 / 240)));
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
            
            const paramError = validateDistributionParams(dist, params, { openProbability: true });
            
            if (paramError) { showToolError('entropy', paramError); return; }
            
            const result = computeEntropyWithSteps(dist, params);
            const resultDiv = document.getElementById('entropyResultArea');
            const valueSpan = document.getElementById('entropyValueDisplay');
            const stepsSpan = document.getElementById('entropyStepsDisplay');
            
            resultDiv.style.display = 'block';
            setHtml(valueSpan, `H(X) = ${result.entropy.toFixed(6)}`);
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler("entropyClearBtn", ["entropyStd", "entropyRate", "entropyMin", "entropyMax", "entropyAlpha", "entropyBeta", "entropyLambda", "entropyN", "entropyP"], "entropyResultArea");
}
