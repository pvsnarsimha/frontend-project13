/* DistKurtosis: distKurtosis tool (render, compute, setup) */

// ========== DISTRIBUTION KURTOSIS RENDER FUNCTION ==========
function renderDistKurtosisInterface() {
    return buildInterface({
        id: "statDistKurtosisInterface",
        title: "🎯 Distribution Kurtosis γ₂",
        formula: "📌 γ₂ = E[(X-μ)⁴]/σ⁴ - 3 (Excess Kurtosis)",
        desc: "Kurtosis measures tail heaviness. 0 = mesokurtic (normal), >0 = leptokurtic (heavy tails), <0 = platykurtic (light tails).",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: {
                    id: "distKurtosisDistribution",
                    style: FIELD_STYLE
                },
                options: DISTRIBUTION_OPTIONS_2
            },
            {
                html: "<div id=\"distKurtosisParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            }
        ],
        run: { id: "distKurtosisComputeBtn", text: "🎯 Calculate Kurtosis + Steps" },
        clear: { id: "distKurtosisClearBtn", text: "Clear" },
        result: {
            area: "distKurtosisResultArea",
            label: "🎯 DISTRIBUTION KURTOSIS γ₂",
            value: "distKurtosisValueDisplay",
            steps: "distKurtosisStepsDisplay"
        }
    });
}

// ========== DISTRIBUTION KURTOSIS COMPUTATION ==========
function updateDistKurtosisParams() {
    const dist = document.getElementById('distKurtosisDistribution').value;
    const paramsDiv = document.getElementById('distKurtosisParams');
    
    if (dist === 'normal') {
        setHtml(paramsDiv, `<div class="desc">Normal distribution excess kurtosis = 0 (mesokurtic)</div>`);
    } else if (dist === 'exponential') {
        setHtml(paramsDiv, `<label>📊 Rate (λ):</label>
            <input type="number" id="distKurtosisRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`);
    } else if (dist === 'uniform') {
        setHtml(paramsDiv, `<div class="desc">Uniform distribution excess kurtosis = -1.2 (platykurtic)</div>`);
    } else if (dist === 'beta') {
        setHtml(paramsDiv, `<label>📊 Alpha (α):</label>
            <input type="number" id="distKurtosisAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="distKurtosisBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`);
    } else if (dist === 'poisson') {
        setHtml(paramsDiv, `<label>📊 Lambda (λ):</label>
            <input type="number" id="distKurtosisLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`);
    } else if (dist === 'binomial') {
        setHtml(paramsDiv, `<label>📊 Number of trials (n):</label>
            <input type="number" id="distKurtosisN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="distKurtosisP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">`);
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
            setHtml(valueSpan, `γ₂ = ${result.kurtosis.toFixed(6)}`);
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler('distKurtosisClearBtn', '', 'distKurtosisResultArea');
}
