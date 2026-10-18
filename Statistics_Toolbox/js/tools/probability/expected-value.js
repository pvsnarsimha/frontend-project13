/* ExpectedValue: expectedvalue tool (render, compute, setup) */

// ========== EXPECTED VALUE RENDER FUNCTION ==========
function renderExpectedValueInterface() {
    return buildInterface({
        id: "statExpectedValueInterface",
        title: "📊 Expected Value E[X] (Mean of Distribution)",
        formula: "📌 E[X] = ∫ x·f(x) dx (continuous) or Σ x·P(X=x) (discrete)",
        desc: "The expected value is the theoretical mean of a probability distribution.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: {
                    id: "expectedDistribution",
                    style: FIELD_STYLE
                },
                options: DISTRIBUTION_OPTIONS_2
            },
            {
                html: "<div id=\"expectedParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            }
        ],
        run: { id: "expectedComputeBtn", text: "📊 Calculate Expected Value + Steps" },
        clear: { id: "expectedClearBtn", text: "Clear" },
        result: {
            area: "expectedResultArea",
            label: "🎯 EXPECTED VALUE E[X]",
            value: "expectedValueDisplay",
            steps: "expectedStepsDisplay"
        }
    });
}

function setupExpectedValueLogic() {
    const distSelect = document.getElementById('expectedDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateExpectedValueParams);
        updateExpectedValueParams();
    }
    
    const computeBtn = document.getElementById("expectedComputeBtn");
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById("expectedDistribution").value;
            let params = {};
            
            if (dist === 'normal') {
                params.mean = parseFloat(document.getElementById("expectedMean").value);
                params.stdDev = parseFloat(document.getElementById("expectedStd").value);
            } else if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById("expectedRate").value);
            } else if (dist === 'uniform') {
                params.min = parseFloat(document.getElementById("expectedMin").value);
                params.max = parseFloat(document.getElementById("expectedMax").value);
            } else if (dist === 'beta') {
                params.alpha = parseFloat(document.getElementById("expectedAlpha").value);
                params.beta = parseFloat(document.getElementById("expectedBeta").value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById("expectedLambda").value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById("expectedN").value);
                params.p = parseFloat(document.getElementById("expectedP").value);
            }
            
            const result = computeExpectedValueWithSteps(dist, params);
            const resultDiv = document.getElementById("expectedResultArea");
            const valueSpan = document.getElementById("expectedValueDisplay");
            const stepsSpan = document.getElementById("expectedStepsDisplay");
            
            resultDiv.style.display = "block";
            setHtml(valueSpan, `E[X] = ${result.expectedValue.toFixed(6)}`);
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler("expectedClearBtn", "", "expectedResultArea");
}

// ========== PARAMETER UPDATE FUNCTIONS ==========
function updateExpectedValueParams() {
    const dist = document.getElementById('expectedDistribution').value;
    const paramsDiv = document.getElementById('expectedParams');
    
    if (dist === 'normal') {
        setHtml(paramsDiv, `
            <label>📊 Mean (μ):</label>
            <input type="number" id="expectedMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="expectedStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'exponential') {
        setHtml(paramsDiv, `
            <label>📊 Rate (λ):</label>
            <input type="number" id="expectedRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'uniform') {
        setHtml(paramsDiv, `
            <label>📊 Minimum (a):</label>
            <input type="number" id="expectedMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="expectedMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'beta') {
        setHtml(paramsDiv, `
            <label>📊 Alpha (α):</label>
            <input type="number" id="expectedAlpha" value="2" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Beta (β):</label>
            <input type="number" id="expectedBeta" value="5" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'poisson') {
        setHtml(paramsDiv, `
            <label>📊 Lambda (λ):</label>
            <input type="number" id="expectedLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'binomial') {
        setHtml(paramsDiv, `
            <label>📊 Number of trials (n):</label>
            <input type="number" id="expectedN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="expectedP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    }
}

// ========== EXPECTED VALUE COMPUTATION - DETAILED ==========
function computeExpectedValueWithSteps(distType, params) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                   EXPECTED VALUE E[X] CALCULATION                  ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS EXPECTED VALUE?                                        │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The expected value (mean, first moment) is the long-run average\n`;
    steps += `   value of a random variable. For continuous distributions:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │              E[X] = ∫ x·f(x) dx   (over all x)              │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   For discrete distributions:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │              E[X] = Σ x·P(X=x)   (over all x)               │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    
    let expectedValue = 0;
    let formula = "";
    
    if (distType === 'normal') {
        const mean = params.mean;
        const stdDev = params.stdDev;
        expectedValue = mean;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION                         ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Normal Distribution PDF                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   f(x) = (1/(σ√(2π))) × exp(-(x-μ)²/(2σ²))\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = ∫_{-∞}^{∞} x·(1/(σ√(2π)))·exp(-(x-μ)²/(2σ²)) dx\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Change of Variables                                   │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Let z = (x-μ)/σ, then x = μ + σz, dx = σ·dz\n`;
        steps += `   The integral becomes:\n\n`;
        steps += `   E[X] = ∫ (μ + σz)·(1/√(2π))·e^{-z²/2} dz\n`;
        steps += `        = μ·∫ (1/√(2π))·e^{-z²/2} dz + σ·∫ z·(1/√(2π))·e^{-z²/2} dz\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Evaluate Integrals                                    │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   First integral: ∫ (1/√(2π))·e^{-z²/2} dz = 1 (total probability)\n`;
        steps += `   Second integral: ∫ z·(1/√(2π))·e^{-z²/2} dz = 0 (odd function)\n\n`;
        steps += `   Therefore:\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                     E[X] = μ                                │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given μ = ${mean}\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                E[X] = ${mean.toFixed(8)}                       │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For a normal distribution, the expected value equals the mean parameter μ\n`;
        steps += `   • This is the center of the symmetric bell curve\n`;
        steps += `   • 50% of values fall below μ, 50% above μ\n`;
        steps += `   • The expected value is ${expectedValue.toFixed(4)}\n\n`;
        
    } else if (distType === 'exponential') {
        const rate = params.rate;
        expectedValue = 1 / rate;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                    EXPONENTIAL DISTRIBUTION                      ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Exponential Distribution PDF                           │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   f(x) = λ·e^{-λx}  for x ≥ 0\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = ∫_{0}^{∞} x·λ·e^{-λx} dx\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Integration by Parts                                  │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Let u = x, dv = λ·e^{-λx} dx\n`;
        steps += `   Then du = dx, v = -e^{-λx}\n\n`;
        steps += `   ∫ u·dv = u·v - ∫ v·du\n`;
        steps += `   = x·(-e^{-λx}) - ∫ (-e^{-λx}) dx\n`;
        steps += `   = -x·e^{-λx} + ∫ e^{-λx} dx\n`;
        steps += `   = -x·e^{-λx} - (1/λ)·e^{-λx}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Evaluate Limits                                       │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Evaluate from 0 to ∞:\n\n`;
        steps += `   As x → ∞: -x·e^{-λx} → 0 and -e^{-λx}/λ → 0\n`;
        steps += `   At x = 0: -0·e⁰ - e⁰/λ = -1/λ\n\n`;
        steps += `   Therefore:\n`;
        steps += `   E[X] = 0 - (-1/λ) = 1/λ\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    E[X] = 1/λ                               │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ = ${rate}\n`;
        steps += `   E[X] = 1/${rate} = ${expectedValue.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For exponential distribution, expected value = 1/λ\n`;
        steps += `   • This represents the mean waiting time between events\n`;
        steps += `   • Memoryless property: P(X > s+t | X > s) = P(X > t)\n`;
        steps += `   • The expected waiting time is ${expectedValue.toFixed(4)} units\n\n`;
        
    } else if (distType === 'uniform') {
        const min = params.min;
        const max = params.max;
        expectedValue = (min + max) / 2;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      UNIFORM DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Uniform Distribution PDF                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   f(x) = 1/(b-a)  for a ≤ x ≤ b\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = ∫_{a}^{b} x·(1/(b-a)) dx\n`;
        steps += `        = (1/(b-a))·∫_{a}^{b} x dx\n`;
        steps += `        = (1/(b-a))·[x²/2]_{a}^{b}\n`;
        steps += `        = (1/(b-a))·(b²/2 - a²/2)\n`;
        steps += `        = (1/(b-a))·((b² - a²)/2)\n`;
        steps += `        = (1/(b-a))·((b-a)(b+a)/2)\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   E[X] = (a+b)/2                            │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given a = ${min}, b = ${max}\n`;
        steps += `   E[X] = (${min} + ${max})/2 = ${expectedValue.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For uniform distribution, expected value = midpoint of [a,b]\n`;
        steps += `   • All values between a and b are equally likely\n`;
        steps += `   • The average is exactly the center of the interval\n`;
        steps += `   • Expected value = ${expectedValue.toFixed(4)}\n\n`;
        
    } else if (distType === 'beta') {
        const alpha = params.alpha;
        const beta = params.beta;
        expectedValue = alpha / (alpha + beta);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                       BETA DISTRIBUTION                          ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Beta Distribution PDF                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   f(x) = [x^{α-1}·(1-x)^{β-1}] / B(α,β)  for 0 ≤ x ≤ 1\n`;
        steps += `   where B(α,β) = Γ(α)Γ(β)/Γ(α+β) is the Beta function\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = ∫_{0}^{1} x·[x^{α-1}·(1-x)^{β-1}]/B(α,β) dx\n`;
        steps += `        = [1/B(α,β)]·∫_{0}^{1} x^{α}·(1-x)^{β-1} dx\n`;
        steps += `        = B(α+1,β)/B(α,β)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Simplify Using Gamma Function Properties              │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   B(α+1,β)/B(α,β) = [Γ(α+1)Γ(β)/Γ(α+β+1)] / [Γ(α)Γ(β)/Γ(α+β)]\n`;
        steps += `                     = [Γ(α+1)/Γ(α)]·[Γ(α+β)/Γ(α+β+1)]\n`;
        steps += `                     = α·[1/(α+β)]\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   E[X] = α/(α+β)                            │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given α = ${alpha}, β = ${beta}\n`;
        steps += `   E[X] = ${alpha}/(${alpha} + ${beta}) = ${expectedValue.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For Beta distribution, expected value = α/(α+β)\n`;
        steps += `   • This represents the mean proportion or probability\n`;
        steps += `   • When α=β, distribution is symmetric around 0.5\n`;
        steps += `   • Expected value = ${(expectedValue * 100).toFixed(2)}%\n\n`;
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        expectedValue = lambda;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Poisson PMF                                           │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   P(X=k) = (e^{-λ}·λ^{k}) / k!  for k = 0,1,2,...\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = Σ_{k=0}^{∞} k·P(X=k)\n`;
        steps += `        = Σ_{k=0}^{∞} k·(e^{-λ}·λ^{k})/k!\n`;
        steps += `        = e^{-λ}·Σ_{k=1}^{∞} λ^{k}/(k-1)!  (since term k=0 is 0)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Change Index                                          │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Let j = k-1, then k = j+1:\n`;
        steps += `   E[X] = e^{-λ}·Σ_{j=0}^{∞} λ^{j+1}/j!\n`;
        steps += `        = e^{-λ}·λ·Σ_{j=0}^{∞} λ^{j}/j!\n`;
        steps += `        = λ·e^{-λ}·e^{λ}\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    E[X] = λ                                 │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ = ${lambda}\n`;
        steps += `   E[X] = ${lambda.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For Poisson distribution, expected value = λ (rate parameter)\n`;
        steps += `   • This represents the average number of events per interval\n`;
        steps += `   • Variance also equals λ (equidispersion property)\n`;
        steps += `   • Expected number of events = ${expectedValue.toFixed(4)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        expectedValue = n * p;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION                        ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Binomial PMF                                          │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   P(X=k) = C(n,k)·p^{k}·(1-p)^{n-k}  for k = 0,1,...,n\n`;
        steps += `   where C(n,k) = n!/(k!(n-k)!)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Expected Value Formula                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = Σ_{k=0}^{n} k·C(n,k)·p^{k}·(1-p)^{n-k}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Use Identity k·C(n,k) = n·C(n-1,k-1)                  │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   E[X] = Σ_{k=1}^{n} n·C(n-1,k-1)·p^{k}·(1-p)^{n-k}\n`;
        steps += `        = n·p·Σ_{j=0}^{n-1} C(n-1,j)·p^{j}·(1-p)^{(n-1)-j}  (let j=k-1)\n`;
        steps += `        = n·p·(p + (1-p))^{n-1}\n`;
        steps += `        = n·p·1^{n-1}\n\n`;
        
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                   E[X] = n·p                                │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   E[X] = ${n} × ${p} = ${expectedValue.toFixed(8)}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  INTERPRETATION                                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   • For Binomial distribution, expected value = n·p\n`;
        steps += `   • This represents the expected number of successes\n`;
        steps += `   • n = number of trials, p = probability of success per trial\n`;
        steps += `   • Expected successes = ${expectedValue.toFixed(4)} out of ${n} trials\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │                    E[X] = ${expectedValue.toFixed(10)}                     │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { expectedValue, steps };
}
