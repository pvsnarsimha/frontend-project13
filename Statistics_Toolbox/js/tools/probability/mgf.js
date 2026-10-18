/* MGF: mgf tool (render, compute, setup) */

// ========== MOMENT GENERATING FUNCTION RENDER FUNCTION ==========
function renderMGFInterface() {
    return buildInterface({
        id: "statMGFInterface",
        title: "🔢 Moment Generating Function M_X(t) = E[e^{tX}]",
        formula: "📌 M_X(t) = E[e^{tX}] = Σ e^{tx}·P(X=x) or ∫ e^{tx}·f(x) dx",
        desc: "The MGF uniquely determines the distribution and generates moments via derivatives.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: { id: "mgfDistribution", style: FIELD_STYLE },
                options: [
                    ["normal", "Normal Distribution"],
                    ["exponential", "Exponential Distribution"],
                    ["uniform", "Uniform Distribution"],
                    ["poisson", "Poisson Distribution"],
                    ["binomial", "Binomial Distribution"]
                ]
            },
            {
                html: "<div id=\"mgfParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            },
            {
                label: "📊 t value (for evaluating MGF):",
                input: {
                    type: "number",
                    id: "mgfTValue",
                    value: "0.5",
                    step: "0.1",
                    style: FIELD_STYLE
                }
            },
            { hint: "Note: MGF exists only for t in certain interval", hintAttrs: { style: "font-size: 0.75rem;" } }
        ],
        run: { id: "mgfComputeBtn", text: "🔢 Calculate MGF + Steps" },
        clear: { id: "mgfClearBtn", text: "Clear" },
        result: {
            area: "mgfResultArea",
            label: "🎯 MOMENT GENERATING FUNCTION",
            value: "mgfValueDisplay",
            steps: "mgfStepsDisplay"
        }
    });
}

function setupMGFLogic() {
    const distSelect = document.getElementById('mgfDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateMGFParams);
        updateMGFParams();
    }
    
    const computeBtn = document.getElementById("mgfComputeBtn");
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const dist = document.getElementById("mgfDistribution").value;
            const t = parseFloat(document.getElementById("mgfTValue").value);
            let params = {};
            
            if (dist === 'normal') {
                params.mean = parseFloat(document.getElementById("mgfMean").value);
                params.stdDev = parseFloat(document.getElementById("mgfStd").value);
            } else if (dist === 'exponential') {
                params.rate = parseFloat(document.getElementById("mgfRate").value);
            } else if (dist === 'uniform') {
                params.min = parseFloat(document.getElementById("mgfMin").value);
                params.max = parseFloat(document.getElementById("mgfMax").value);
            } else if (dist === 'poisson') {
                params.lambda = parseFloat(document.getElementById("mgfLambda").value);
            } else if (dist === 'binomial') {
                params.n = parseInt(document.getElementById("mgfN").value);
                params.p = parseFloat(document.getElementById("mgfP").value);
            }
            
            const result = computeMGFWithSteps(dist, params, t);
            const resultDiv = document.getElementById("mgfResultArea");
            const valueSpan = document.getElementById("mgfValueDisplay");
            const stepsSpan = document.getElementById("mgfStepsDisplay");
            
            resultDiv.style.display = "block";
            setHtml(valueSpan, `M_X(${t}) = ${result.mgfValue.toFixed(6)}`);
            stepsSpan.innerText = result.steps;
        });
    }
    
    attachClearHandler("mgfClearBtn", ["mgfTValue"], "mgfResultArea");
}

function updateMGFParams() {
    const dist = document.getElementById('mgfDistribution').value;
    const paramsDiv = document.getElementById('mgfParams');
    
    if (dist === 'normal') {
        setHtml(paramsDiv, `
            <label>📊 Mean (μ):</label>
            <input type="number" id="mgfMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="mgfStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'exponential') {
        setHtml(paramsDiv, `
            <label>📊 Rate (λ):</label>
            <input type="number" id="mgfRate" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'uniform') {
        setHtml(paramsDiv, `
            <label>📊 Minimum (a):</label>
            <input type="number" id="mgfMin" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Maximum (b):</label>
            <input type="number" id="mgfMax" value="1" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'poisson') {
        setHtml(paramsDiv, `
            <label>📊 Lambda (λ):</label>
            <input type="number" id="mgfLambda" value="3" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'binomial') {
        setHtml(paramsDiv, `
            <label>📊 Number of trials (n):</label>
            <input type="number" id="mgfN" value="10" step="1" min="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Probability of success (p):</label>
            <input type="number" id="mgfP" value="0.5" step="0.1" min="0" max="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    }
}

// ========== MGF COMPUTATION - DETAILED ==========
function computeMGFWithSteps(distType, params, t) {
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║           MOMENT GENERATING FUNCTION M_X(t) CALCULATION            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${distType.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS THE MOMENT GENERATING FUNCTION?                        │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The Moment Generating Function (MGF) is defined as:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │              M_X(t) = E[e^{tX}]                             │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   For continuous distributions: M_X(t) = ∫ e^{tx}·f(x) dx\n`;
    steps += `   For discrete distributions:   M_X(t) = Σ e^{tx}·P(X=x)\n\n`;
    steps += `   Properties:\n`;
    steps += `   • M_X(0) = 1\n`;
    steps += `   • E[X^k] = M_X^{(k)}(0)  (k-th derivative at 0)\n`;
    steps += `   • Uniquely determines the distribution\n\n`;
    
    steps += `   Given t = ${t}\n\n`;
    
    let mgfValue = 0;
    
    if (distType === 'normal') {
        const mean = params.mean;
        const stdDev = params.stdDev;
        mgfValue = Math.exp(mean * t + 0.5 * stdDev * stdDev * t * t);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION MGF                     ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Definition                                            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   M_X(t) = E[e^{tX}] = ∫_{-∞}^{∞} e^{tx}·(1/(σ√(2π)))·e^{-(x-μ)²/(2σ²)} dx\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Complete the Square in the Exponent                   │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Combine exponents: tx - (x-μ)²/(2σ²)\n`;
        steps += `   = -(x² - 2μx + μ²)/(2σ²) + tx\n`;
        steps += `   = -[x² - 2μx + μ² - 2σ²tx]/(2σ²)\n`;
        steps += `   = -[x² - 2x(μ + σ²t) + μ²]/(2σ²)\n`;
        steps += `   = -[(x - (μ+σ²t))² - (μ+σ²t)² + μ²]/(2σ²)\n`;
        steps += `   = -(x - (μ+σ²t))²/(2σ²) + [(μ+σ²t)² - μ²]/(2σ²)\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Simplify the Constant Term                            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   [(μ+σ²t)² - μ²]/(2σ²) = [μ² + 2μσ²t + σ⁴t² - μ²]/(2σ²)\n`;
        steps += `                           = [2μσ²t + σ⁴t²]/(2σ²)\n`;
        steps += `                           = μt + σ²t²/2\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 4: Evaluate the Integral                                 │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   M_X(t) = e^{μt + σ²t²/2}·∫_{-∞}^{∞} (1/(σ√(2π)))·e^{-(x-(μ+σ²t))²/(2σ²)} dx\n`;
        steps += `   The integral is the PDF of a Normal(μ+σ²t, σ²) integrated over all x = 1\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │              M_X(t) = exp(μt + σ²t²/2)                      │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 5: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   μ = ${mean}, σ = ${stdDev}, t = ${t}\n`;
        steps += `   μt = ${mean} × ${t} = ${(mean*t).toFixed(6)}\n`;
        steps += `   σ²t²/2 = (${stdDev}² × ${t}²)/2 = ${(stdDev*stdDev*t*t/2).toFixed(6)}\n`;
        steps += `   Exponent = ${(mean*t).toFixed(6)} + ${(stdDev*stdDev*t*t/2).toFixed(6)} = ${(mean*t + 0.5*stdDev*stdDev*t*t).toFixed(6)}\n`;
        steps += `   M_X(${t}) = e^{${(mean*t + 0.5*stdDev*stdDev*t*t).toFixed(6)}} = ${mgfValue.toFixed(8)}\n\n`;
        
    } else if (distType === 'exponential') {
        const rate = params.rate;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION MGF                   ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        if (t < rate) {
            mgfValue = rate / (rate - t);
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 1: Definition                                            │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   M_X(t) = E[e^{tX}] = ∫_{0}^{∞} e^{tx}·λ·e^{-λx} dx\n`;
            steps += `         = λ·∫_{0}^{∞} e^{-(λ-t)x} dx\n\n`;
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 2: Evaluate the Integral                                 │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   ∫_{0}^{∞} e^{-(λ-t)x} dx = [ -e^{-(λ-t)x}/(λ-t) ]_{0}^{∞}\n`;
            steps += `   = 0 - (-1/(λ-t)) = 1/(λ-t)\n\n`;
            steps += `   Therefore:\n`;
            steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
            steps += `   │              M_X(t) = λ/(λ-t)  for t < λ                    │\n`;
            steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 3: Substitute Given Values                               │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   λ = ${rate}, t = ${t}\n`;
            steps += `   λ - t = ${rate} - ${t} = ${(rate-t).toFixed(6)}\n`;
            steps += `   M_X(${t}) = ${rate} / ${(rate-t).toFixed(6)} = ${mgfValue.toFixed(8)}\n\n`;
        } else {
            steps += `   ⚠️ WARNING: MGF does not exist for t ≥ λ\n`;
            steps += `   Because the integral ∫ e^{-(λ-t)x} dx diverges when λ-t ≤ 0.\n`;
            steps += `   For t = ${t}, λ = ${rate}, we have λ-t = ${(rate-t).toFixed(6)} ≤ 0\n`;
            mgfValue = Infinity;
        }
        
    } else if (distType === 'uniform') {
        const min = params.min;
        const max = params.max;
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     UNIFORM DISTRIBUTION MGF                     ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        if (t !== 0) {
            mgfValue = (Math.exp(t * max) - Math.exp(t * min)) / (t * (max - min));
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 1: Definition                                            │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   M_X(t) = E[e^{tX}] = ∫_{a}^{b} e^{tx}·(1/(b-a)) dx\n`;
            steps += `         = (1/(b-a))·∫_{a}^{b} e^{tx} dx\n\n`;
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 2: Evaluate the Integral                                 │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   ∫ e^{tx} dx = e^{tx}/t\n\n`;
            steps += `   ∫_{a}^{b} e^{tx} dx = [e^{tx}/t]_{a}^{b} = (e^{tb} - e^{ta})/t\n\n`;
            steps += `   Therefore:\n`;
            steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
            steps += `   │              M_X(t) = (e^{tb} - e^{ta})/[t(b-a)]            │\n`;
            steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
            
            steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
            steps += `│  STEP 3: Substitute Given Values                               │\n`;
            steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
            steps += `   a = ${min}, b = ${max}, t = ${t}\n`;
            steps += `   e^{tb} = e^{${t}×${max}} = ${Math.exp(t*max).toFixed(6)}\n`;
            steps += `   e^{ta} = e^{${t}×${min}} = ${Math.exp(t*min).toFixed(6)}\n`;
            steps += `   e^{tb} - e^{ta} = ${(Math.exp(t*max)-Math.exp(t*min)).toFixed(6)}\n`;
            steps += `   t(b-a) = ${t} × (${max} - ${min}) = ${(t*(max-min)).toFixed(6)}\n`;
            steps += `   M_X(${t}) = ${(Math.exp(t*max)-Math.exp(t*min)).toFixed(6)} / ${(t*(max-min)).toFixed(6)} = ${mgfValue.toFixed(8)}\n\n`;
        } else {
            mgfValue = 1;
            steps += `   When t = 0, M_X(0) = E[e^{0·X}] = E[1] = 1\n\n`;
        }
        
    } else if (distType === 'poisson') {
        const lambda = params.lambda;
        mgfValue = Math.exp(lambda * (Math.exp(t) - 1));
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     POISSON DISTRIBUTION MGF                     ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Definition                                            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   M_X(t) = E[e^{tX}] = Σ_{k=0}^{∞} e^{tk}·(e^{-λ}·λ^{k}/k!)\n`;
        steps += `         = e^{-λ}·Σ_{k=0}^{∞} (λ·e^{t})^{k}/k!\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Use Exponential Series                                │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Recall that Σ_{k=0}^{∞} x^{k}/k! = e^{x}\n`;
        steps += `   Let x = λ·e^{t}\n\n`;
        steps += `   Then Σ_{k=0}^{∞} (λ·e^{t})^{k}/k! = e^{λ·e^{t}}\n\n`;
        steps += `   Therefore:\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │              M_X(t) = e^{-λ}·e^{λ·e^{t}} = e^{λ(e^{t}-1)}   │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   λ = ${lambda}, t = ${t}\n`;
        steps += `   e^{t} = ${Math.exp(t).toFixed(6)}\n`;
        steps += `   e^{t} - 1 = ${(Math.exp(t)-1).toFixed(6)}\n`;
        steps += `   λ(e^{t}-1) = ${lambda} × ${(Math.exp(t)-1).toFixed(6)} = ${(lambda*(Math.exp(t)-1)).toFixed(6)}\n`;
        steps += `   M_X(${t}) = e^{${(lambda*(Math.exp(t)-1)).toFixed(6)}} = ${mgfValue.toFixed(8)}\n\n`;
        
    } else if (distType === 'binomial') {
        const n = params.n;
        const p = params.p;
        mgfValue = Math.pow(1 - p + p * Math.exp(t), n);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                     BINOMIAL DISTRIBUTION MGF                    ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 1: Definition                                            │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   M_X(t) = E[e^{tX}] = Σ_{k=0}^{n} e^{tk}·C(n,k)·p^{k}·(1-p)^{n-k}\n`;
        steps += `         = Σ_{k=0}^{n} C(n,k)·(p·e^{t})^{k}·(1-p)^{n-k}\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 2: Use Binomial Theorem                                  │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Recall the Binomial Theorem: (a + b)^n = Σ_{k=0}^{n} C(n,k)·a^{k}·b^{n-k}\n`;
        steps += `   Let a = p·e^{t}, b = 1-p\n\n`;
        steps += `   Then:\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │              M_X(t) = (1-p + p·e^{t})^{n}                    │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        
        steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
        steps += `│  STEP 3: Substitute Given Values                               │\n`;
        steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   n = ${n}, p = ${p}, t = ${t}\n`;
        steps += `   e^{t} = ${Math.exp(t).toFixed(6)}\n`;
        steps += `   p·e^{t} = ${p} × ${Math.exp(t).toFixed(6)} = ${(p*Math.exp(t)).toFixed(6)}\n`;
        steps += `   1-p + p·e^{t} = ${(1-p).toFixed(6)} + ${(p*Math.exp(t)).toFixed(6)} = ${(1-p+p*Math.exp(t)).toFixed(6)}\n`;
        steps += `   M_X(${t}) = (${(1-p+p*Math.exp(t)).toFixed(6)})^{${n}} = ${mgfValue.toFixed(8)}\n\n`;
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                                                             │\n`;
    steps += `   │              M_X(${t}) = ${mgfValue.toFixed(10)}                    │\n`;
    steps += `   │                                                             │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    steps += `\n   📌 The first few moments can be obtained by differentiation:\n`;
    steps += `      • E[X] = M'_X(0)\n`;
    steps += `      • E[X²] = M''_X(0)\n`;
    steps += `      • Var[X] = M''_X(0) - [M'_X(0)]²\n`;
    
    return { mgfValue, steps };
}
