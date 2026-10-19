/* DistSkewness: distSkewness tool (render, compute, setup) */

// ========== DISTRIBUTION SKEWNESS RENDER FUNCTION ==========
function renderDistSkewnessInterface() {
    return buildInterface({
        id: "statDistSkewnessInterface",
        title: "📈 Distribution Skewness γ₁",
        formula: "📌 γ₁ = E[(X-μ)³]/σ³ = μ₃/σ³",
        desc: "Skewness measures asymmetry of a distribution. 0 = symmetric, >0 = right-skewed, <0 = left-skewed.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: {
                    id: "distSkewnessDistribution",
                    style: FIELD_STYLE
                },
                options: DISTRIBUTION_OPTIONS_2
            },
            {
                html: "<div id=\"distSkewnessParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            }
        ],
        run: { id: "distSkewnessComputeBtn", text: "📈 Calculate Skewness + Steps" },
        clear: { id: "distSkewnessClearBtn", text: "Clear" },
        result: {
            area: "distSkewnessResultArea",
            label: "🎯 DISTRIBUTION SKEWNESS γ₁",
            value: "distSkewnessValueDisplay",
            steps: "distSkewnessStepsDisplay"
        }
    });
}

// ========== DISTRIBUTION SKEWNESS COMPUTATION ==========
function updateDistSkewnessParams() {
    showDistributionParams('distSkewness', {
        skip: ['Mean', 'Std', 'Min', 'Max'],
        notes: {
            normal: 'Normal distribution skewness = 0 (symmetric)',
            uniform: 'Uniform distribution skewness = 0 (symmetric)'
        }
    });
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
            setHtml(valueSpan, `γ₁ = ${result.skewness.toFixed(6)}`);
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler('distSkewnessClearBtn', '', 'distSkewnessResultArea');
}
