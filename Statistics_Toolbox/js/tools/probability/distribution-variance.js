/* DistributionVariance: variancedist tool (render, compute, setup) */

// ========== DISTRIBUTION VARIANCE RENDER FUNCTION ==========
function renderDistributionVarianceInterface() {
    return buildInterface({
        id: "statDistributionVarianceInterface",
        title: "📏 Variance Var[X] of Distribution",
        formula: "📌 Var[X] = E[(X - μ)²] = E[X²] - (E[X])²",
        desc: "Variance measures the spread of a distribution around its mean.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: {
                    id: "varianceDistDistribution",
                    style: FIELD_STYLE
                },
                options: DISTRIBUTION_OPTIONS_2
            },
            {
                html: "<div id=\"varianceDistParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            }
        ],
        run: { id: "varianceDistComputeBtn", text: "📏 Calculate Variance + Steps" },
        clear: { id: "varianceDistClearBtn", text: "Clear" },
        result: {
            area: "varianceDistResultArea",
            label: "🎯 VARIANCE Var[X]",
            value: "varianceDistValueDisplay",
            steps: "varianceDistStepsDisplay"
        }
    });
}

function updateDistributionVarianceParams() {
    showDistributionParams('varianceDist', { skip: ['Mean'] });
}

function setupDistributionVarianceLogic() {
    const distSelect = document.getElementById('varianceDistDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateDistributionVarianceParams);
        updateDistributionVarianceParams();
    }
    
    const computeBtn = document.getElementById("varianceDistComputeBtn");
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById("varianceDistDistribution").value;
            let params = {};
            
            if (dist === 'normal') {
                params.stdDev = parseFloat(document.getElementById("varianceDistStd").value);
            } else if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById("varianceDistRate").value);
            } else if (dist === 'uniform') {
                params.min = parseFloat(document.getElementById("varianceDistMin").value);
                params.max = parseFloat(document.getElementById("varianceDistMax").value);
            } else if (dist === 'beta') {
                params.alpha = parseFloat(document.getElementById("varianceDistAlpha").value);
                params.beta = parseFloat(document.getElementById("varianceDistBeta").value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById("varianceDistLambda").value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById("varianceDistN").value);
                params.p = parseFloat(document.getElementById("varianceDistP").value);
            }
            
            const paramError = validateDistributionParams(dist, params);
            
            if (paramError) { showToolError('varianceDist', paramError); return; }
            
            const result = computeDistributionVarianceWithSteps(dist, params);
            const resultDiv = document.getElementById("varianceDistResultArea");
            const valueSpan = document.getElementById("varianceDistValueDisplay");
            const stepsSpan = document.getElementById("varianceDistStepsDisplay");
            
            resultDiv.style.display = "block";
            setHtml(valueSpan, `Var[X] = ${result.variance.toFixed(6)}`);
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler("varianceDistClearBtn", ["varianceDistStd", "varianceDistRate", "varianceDistMin", "varianceDistMax", "varianceDistAlpha", "varianceDistBeta", "varianceDistLambda", "varianceDistN", "varianceDistP"], "varianceDistResultArea");
}

// ========== DISTRIBUTION VARIANCE COMPUTATION - DETAILED ==========
function computeDistributionVarianceWithSteps(distType, params) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                    VARIANCE Var[X] CALCULATION                     ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS VARIANCE?                                              │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Variance measures the spread or dispersion of a distribution:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │   Var[X] = E[(X - μ)²] = E[X²] - (E[X])²                    │\n`;
    steps += `   │                                                             │\n`;
    steps += `   │   where μ = E[X] is the expected value                      │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   • Standard deviation = √Var[X]\n`;
    steps += `   • Larger variance = more spread out data\n`;
    steps += `   • Var[X] ≥ 0 always\n\n`;
    
    let variance = 0;
    
    if (distType === 'normal') {
        const stdDev = params.stdDev;
        variance = distributionMoments(distType, params).variance;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION                         ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Definition for Normal Distribution                     │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   For Normal(μ,σ²), the variance is the σ² parameter itself.\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    Var[X] = σ²                              │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Derivation (Second Moment Method)                      │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = ∫ x²·(1/(σ√(2π)))·exp(-(x-μ)²/(2σ²)) dx\n\n`;
        steps += `   Using the same substitution z = (x-μ)/σ:\n`;
        steps += `   E[X²] = ∫ (μ+σz)²·(1/√(2π))·e^{-z²/2} dz\n`;
        steps += `         = μ²·∫ (1/√(2π))·e^{-z²/2} dz + 2μσ·∫ z·(1/√(2π))·e^{-z²/2} dz\n`;
        steps += `           + σ²·∫ z²·(1/√(2π))·e^{-z²/2} dz\n`;
        steps += `         = μ²·1 + 2μσ·0 + σ²·1\n`;
        steps += `         = μ² + σ²\n\n`;
        steps += `   Therefore:\n`;
        steps += `   Var[X] = E[X²] - (E[X])² = (μ² + σ²) - μ² = σ²\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given σ = ${stdDev}\n`;
        steps += `   Var[X] = ${stdDev}² = ${variance.toFixed(8)}\n\n`;
        
    } else if (distType === 'exponential') {
        const rate = params.rate;
        variance = distributionMoments(distType, params).variance;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                    EXPONENTIAL DISTRIBUTION                      ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Find E[X²] for Exponential                             │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = ∫_{0}^{∞} x²·λ·e^{-λx} dx\n\n`;
        steps += `   Using integration by parts twice, or known result:\n`;
        steps += `   E[X²] = 2/λ²\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Derivation Details                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Let u = x², dv = λ·e^{-λx} dx\n`;
        steps += `   Then du = 2x·dx, v = -e^{-λx}\n\n`;
        steps += `   ∫ u·dv = u·v - ∫ v·du = -x²·e^{-λx} + ∫ 2x·e^{-λx} dx\n\n`;
        steps += `   The integral ∫ 2x·e^{-λx} dx = 2/λ² (from E[X] formula)\n\n`;
        steps += `   Evaluating from 0 to ∞: [ -x²·e^{-λx} ]₀^∞ = 0\n`;
        steps += `   Therefore: E[X²] = 0 + 2/λ² = 2/λ²\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Var[X] = E[X²] - (E[X])²\n`;
        steps += `         = 2/λ² - (1/λ)²\n`;
        steps += `         = 2/λ² - 1/λ²\n`;
        steps += `         = 1/λ²\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   Var[X] = 1/λ²                             │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ = ${rate}\n`;
        steps += `   Var[X] = 1/${rate}² = ${variance.toFixed(8)}\n\n`;
        
    } else if (distType === 'uniform') {
        const min = params.min;
        const max = params.max;
        variance = distributionMoments(distType, params).variance;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      UNIFORM DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Find E[X²] for Uniform                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = ∫_{a}^{b} x²·(1/(b-a)) dx\n`;
        steps += `        = (1/(b-a))·[x³/3]_{a}^{b}\n`;
        steps += `        = (1/(b-a))·(b³/3 - a³/3)\n`;
        steps += `        = (b³ - a³)/(3(b-a))\n`;
        steps += `        = (b² + ab + a²)/3\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Recall E[X] = (a+b)/2\n\n`;
        steps += `   Var[X] = E[X²] - (E[X])²\n`;
        steps += `         = (a² + ab + b²)/3 - (a+b)²/4\n`;
        steps += `         = [4(a² + ab + b²) - 3(a+b)²]/12\n`;
        steps += `         = [4a² + 4ab + 4b² - 3a² - 6ab - 3b²]/12\n`;
        steps += `         = [a² - 2ab + b²]/12\n`;
        steps += `         = (b - a)²/12\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   Var[X] = (b-a)²/12                        │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given a = ${min}, b = ${max}\n`;
        steps += `   b - a = ${max} - ${min} = ${(max-min).toFixed(6)}\n`;
        steps += `   Var[X] = (${(max-min).toFixed(6)})²/12 = ${variance.toFixed(8)}\n\n`;
        
    } else if (distType === 'beta') {
        const alpha = params.alpha;
        const beta = params.beta;
        variance = distributionMoments(distType, params).variance;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                       BETA DISTRIBUTION                          ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Known Results for Beta Distribution                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   For Beta(α,β):\n`;
        steps += `   • E[X] = α/(α+β)\n`;
        steps += `   • E[X²] = α(α+1)/[(α+β)(α+β+1)]\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Derivation Using Beta Function                         │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = ∫₀¹ x²·[x^{α-1}(1-x)^{β-1}]/B(α,β) dx\n`;
        steps += `         = B(α+2,β)/B(α,β)\n`;
        steps += `         = [Γ(α+2)Γ(β)/Γ(α+β+2)] / [Γ(α)Γ(β)/Γ(α+β)]\n`;
        steps += `         = [Γ(α+2)/Γ(α)]·[Γ(α+β)/Γ(α+β+2)]\n`;
        steps += `         = α(α+1)·[1/((α+β)(α+β+1))]\n`;
        steps += `         = α(α+1)/[(α+β)(α+β+1)]\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Var[X] = E[X²] - (E[X])²\n`;
        steps += `         = α(α+1)/[(α+β)(α+β+1)] - [α/(α+β)]²\n`;
        steps += `         = [α(α+1)(α+β) - α²(α+β+1)] / [(α+β)²(α+β+1)]\n`;
        steps += `         = αβ / [(α+β)²(α+β+1)]\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │            Var[X] = αβ / [(α+β)²(α+β+1)]                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given α = ${alpha}, β = ${beta}\n`;
        steps += `   α+β = ${alpha+beta}\n`;
        steps += `   α+β+1 = ${alpha+beta+1}\n`;
        steps += `   Numerator = ${alpha} × ${beta} = ${alpha*beta}\n`;
        steps += `   Denominator = (${alpha+beta})² × ${alpha+beta+1} = ${Math.pow(alpha+beta,2)} × ${alpha+beta+1} = ${Math.pow(alpha+beta,2)*(alpha+beta+1)}\n`;
        steps += `   Var[X] = ${variance.toFixed(8)}\n\n`;
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        variance = distributionMoments(distType, params).variance;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Find E[X²] for Poisson                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = Σ_{k=0}^{∞} k²·e^{-λ}·λ^{k}/k!\n`;
        steps += `         = e^{-λ}·Σ_{k=1}^{∞} k·λ^{k}/(k-1)!\n`;
        steps += `         = e^{-λ}·Σ_{j=0}^{∞} (j+1)·λ^{j+1}/j!  (j=k-1)\n`;
        steps += `         = λ·e^{-λ}·[ Σ_{j=0}^{∞} j·λ^{j}/j! + Σ_{j=0}^{∞} λ^{j}/j! ]\n`;
        steps += `         = λ·e^{-λ}·[ λ·e^{λ} + e^{λ} ]\n`;
        steps += `         = λ·e^{-λ}·e^{λ}·(λ+1)\n`;
        steps += `         = λ(λ+1)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Recall E[X] = λ\n`;
        steps += `   Var[X] = E[X²] - (E[X])² = λ(λ+1) - λ² = λ\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    Var[X] = λ                               │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ = ${lambda}\n`;
        steps += `   Var[X] = ${lambda.toFixed(8)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        variance = distributionMoments(distType, params).variance;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Find E[X²] for Binomial                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X²] = Σ_{k=0}^{n} k²·C(n,k)·p^{k}·(1-p)^{n-k}\n\n`;
        steps += `   Using k² = k(k-1) + k:\n`;
        steps += `   E[X²] = E[X(X-1)] + E[X]\n\n`;
        steps += `   E[X(X-1)] = Σ k(k-1)·C(n,k)·p^{k}·(1-p)^{n-k}\n`;
        steps += `             = n(n-1)p²·Σ C(n-2,j)·p^{j}·(1-p)^{n-2-j}\n`;
        steps += `             = n(n-1)p²·(p + (1-p))^{n-2}\n`;
        steps += `             = n(n-1)p²\n\n`;
        steps += `   Therefore: E[X²] = n(n-1)p² + np\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Calculate Variance                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Var[X] = E[X²] - (E[X])²\n`;
        steps += `         = [n(n-1)p² + np] - (np)²\n`;
        steps += `         = n(n-1)p² + np - n²p²\n`;
        steps += `         = n²p² - np² + np - n²p²\n`;
        steps += `         = np - np²\n`;
        steps += `         = np(1-p)\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                 Var[X] = n·p·(1-p)                          │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   1-p = ${(1-p).toFixed(6)}\n`;
        steps += `   Var[X] = ${n} × ${p} × ${(1-p).toFixed(6)} = ${variance.toFixed(8)}\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │                  Var[X] = ${variance.toFixed(10)}                    │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    steps += `\n   📌 Standard Deviation = √Var[X] = ${Math.sqrt(variance).toFixed(8)}\n`;
    
    return { variance, steps };
}
