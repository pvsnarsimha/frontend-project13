/* Survival: survival tool (render, compute, setup) */

// ========== SURVIVAL FUNCTION S(t) = 1 - CDF(t) ==========
function computeSurvivalWithSteps() {
    const dist = document.getElementById('survivalDistribution').value;
    const xValuesText = document.getElementById('survivalXValues').value;
    const xValues = parseNumbersFromInput(xValuesText);
    
    if (!xValues.length) return { error: true, message: "Please enter x values." };
    
    let results = [];
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                    SURVIVAL FUNCTION S(t) CALCULATION              ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${dist.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS THE SURVIVAL FUNCTION?                                 │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The Survival Function (also called Reliability Function) is:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                    S(t) = P(X > t) = 1 - F(t)                │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Where F(t) is the CDF (cumulative distribution function).\n\n`;
    steps += `   Properties:\n`;
    steps += `   • S(0) = 1 (all subjects survive at time 0)\n`;
    steps += `   • S(∞) = 0 (eventually all subjects experience the event)\n`;
    steps += `   • S(t) is non-increasing (survival probability decreases over time)\n`;
    steps += `   • Used in survival analysis, reliability engineering, and time-to-event analysis\n\n`;
    
    if (dist === 'exponential') {
        const rate = parseFloat(document.getElementById('survivalRate').value);
        const rateError = validateDistributionParams('exponential', { rate });
        if (rateError) return { error: true, message: rateError };
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION SURVIVAL               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Exponential distribution: CDF F(t) = 1 - e^{-λt}\n`;
        steps += `   Therefore: S(t) = 1 - (1 - e^{-λt}) = e^{-λt}\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    S(t) = e^{-λt}                           │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ (rate) = ${rate}\n\n`;
        
        xValues.forEach(t => {
            if (t < 0) {
                results.push(1);
                steps += `\nFor t = ${t} (< 0):\n`;
                steps += `  S(${t}) = 1 (survival probability is 1 before time 0)\n\n`;
            } else {
                const survival = Math.exp(-rate * t);
                results.push(survival);
                
                steps += `\nFor t = ${t}:\n`;
                steps += `  Step 1: Calculate λt = ${rate} × ${t} = ${(rate*t).toFixed(6)}\n`;
                steps += `  Step 2: Calculate e^{-λt} = e^{-${(rate*t).toFixed(6)}} = ${Math.exp(-rate*t).toFixed(8)}\n`;
                steps += `  S(${t}) = ${survival.toFixed(8)}\n`;
                steps += `  Interpretation: ${(survival * 100).toFixed(2)}% survive beyond time ${t}\n\n`;
            }
        });
        
    } else if (dist === 'normal') {
        const mean = parseFloat(document.getElementById('survivalMean').value);
        const std = parseFloat(document.getElementById('survivalStd').value);
        const normalError = validateDistributionParams('normal', { mean, stdDev: std });
        if (normalError) return { error: true, message: normalError };
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION SURVIVAL                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Normal distribution: S(t) = 1 - Φ((t-μ)/σ)\n`;
        steps += `   where Φ is the standard normal CDF.\n\n`;
        steps += `   Given μ (mean) = ${mean}, σ (std dev) = ${std}\n\n`;
        
        xValues.forEach(t => {
            const z = (t - mean) / std;
            const cdf = normalCDF(t, mean, std);
            const survival = 1 - cdf;
            results.push(survival);
            
            steps += `\nFor t = ${t}:\n`;
            steps += `  Step 1: Calculate z-score: z = (${t} - ${mean})/${std} = ${z.toFixed(6)}\n`;
            steps += `  Step 2: Find CDF at t: F(${t}) = Φ(${z.toFixed(6)}) = ${cdf.toFixed(8)}\n`;
            steps += `  Step 3: Calculate S(t) = 1 - F(${t}) = 1 - ${cdf.toFixed(8)} = ${survival.toFixed(8)}\n`;
            steps += `  Interpretation: ${(survival * 100).toFixed(2)}% survive beyond ${t}\n\n`;
        });
        
    } else if (dist === 'weibull') {
        const shape = parseFloat(document.getElementById('survivalShape').value);
        const scale = parseFloat(document.getElementById('survivalScale').value);
        const weibullError = validateDistributionParams('weibull', { shape, scale });
        if (weibullError) return { error: true, message: weibullError };
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      WEIBULL DISTRIBUTION SURVIVAL               ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Weibull distribution: CDF F(t) = 1 - e^{-(t/λ)^{k}}\n`;
        steps += `   Therefore: S(t) = e^{-(t/λ)^{k}}\n\n`;
        steps += `   Where:\n`;
        steps += `   • k = shape parameter\n`;
        steps += `   • λ = scale parameter\n\n`;
        steps += `   Given shape k = ${shape}, scale λ = ${scale}\n\n`;
        
        xValues.forEach(t => {
            if (t < 0) {
                results.push(1);
                steps += `\nFor t = ${t} (< 0):\n`;
                steps += `  S(${t}) = 1 (survival probability is 1 for negative time)\n\n`;
            } else {
                const survival = Math.exp(-Math.pow(t / scale, shape));
                results.push(survival);
                
                steps += `\nFor t = ${t}:\n`;
                steps += `  Step 1: Calculate t/λ = ${t}/${scale} = ${(t/scale).toFixed(6)}\n`;
                steps += `  Step 2: Calculate (t/λ)^{k} = ${(t/scale).toFixed(6)}^${shape} = ${Math.pow(t/scale, shape).toFixed(8)}\n`;
                steps += `  Step 3: Calculate e^{-(t/λ)^{k}} = e^{-${Math.pow(t/scale, shape).toFixed(8)}} = ${survival.toFixed(8)}\n`;
                steps += `  S(${t}) = ${survival.toFixed(8)}\n`;
                steps += `  Interpretation: ${(survival * 100).toFixed(2)}% survive beyond time ${t}\n\n`;
            }
        });
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    xValues.forEach((x, i) => {
        steps += `   │  S(${x}) = ${results[i].toFixed(10)}${' '.repeat(25 - results[i].toFixed(10).length)}│\n`;
    });
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { results, xValues, steps, resultStr: results.map(r => (r * 100).toFixed(4) + '%').join(', ') };
}

function updateSurvivalParams() {
    const dist = document.getElementById('survivalDistribution').value;
    const paramsDiv = document.getElementById('survivalParams');
    
    if (dist === 'exponential') {
        setHtml(paramsDiv, `
            <label>📊 Rate (λ):</label>
            <input class="s-c689ef gen-sized" type="number" id="survivalRate" value="1" step="0.5" min="0.01">
            <div class="desc s-8b77e0">Higher rate = faster failure</div>
        `);
    } else if (dist === 'normal') {
        setHtml(paramsDiv, `
            <label>📊 Mean (μ):</label>
            <input class="s-c689ef gen-sized" type="number" id="survivalMean" value="0" step="any">
            <label>📊 Standard Deviation (σ):</label>
            <input class="s-c689ef gen-sized" type="number" id="survivalStd" value="1" step="any" min="0.01">
        `);
    } else if (dist === 'weibull') {
        setHtml(paramsDiv, `
            <label>📊 Shape parameter (k):</label>
            <input class="s-c689ef gen-sized" type="number" id="survivalShape" value="1.5" step="0.5" min="0.1">
            <div class="desc s-8b77e0">k < 1: decreasing hazard, k = 1: constant, k > 1: increasing</div>
            <label>📊 Scale parameter (λ):</label>
            <input class="s-c689ef gen-sized" type="number" id="survivalScale" value="1" step="any" min="0.01">
        `);
    }
}

// ========== SURVIVAL FUNCTION INTERFACE RENDER FUNCTION ==========
function renderSurvivalInterface() {
    return buildInterface({
        id: "statSurvivalInterface",
        title: "📉 Survival Function S(t) = 1 - F(t)",
        formula: "📌 S(t) = P(T > t) = 1 - F(t)",
        desc: "The survival function gives the probability that a subject survives beyond time t. Used in reliability engineering and survival analysis.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: {
                    id: "survivalDistribution",
                    style: FIELD_STYLE
                },
                options: [
                    ["exponential", "Exponential Distribution"],
                    ["normal", "Normal Distribution"],
                    ["weibull", "Weibull Distribution"]
                ]
            },
            {
                html: "<div id=\"survivalParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            },
            {
                label: "📊 Time Value(s) (t):",
                textarea: {
                    id: "survivalXValues",
                    rows: "3",
                    placeholder: "Enter time value(s) (comma-separated)&#10;Example: 0.5, 1, 2, 5, 10"
                }
            }
        ],
        run: { id: "survivalComputeBtn", text: "📉 Calculate Survival + Steps" },
        clear: { id: "survivalClearBtn", text: "Clear" },
        result: {
            area: "survivalResultArea",
            label: "🎯 SURVIVAL FUNCTION RESULTS",
            value: "survivalValueDisplay",
            steps: "survivalStepsDisplay"
        }
    });
}

// ========== SURVIVAL FUNCTION SETUP ==========
function setupSurvivalLogic() {
    const distSelect = document.getElementById('survivalDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateSurvivalParams);
        updateSurvivalParams();
    }
    
    const computeBtn = document.getElementById('survivalComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computeSurvivalWithSteps();
            const resultDiv = document.getElementById('survivalResultArea');
            const valueSpan = document.getElementById('survivalValueDisplay');
            const stepsSpan = document.getElementById('survivalStepsDisplay');
            
            if (result.error) {
                resultDiv.style.display = 'block';
                valueSpan.innerText = 'Error';
                hideAllStatCharts();
                setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
            } else {
                resultDiv.style.display = 'block';
                valueSpan.innerText = result.resultStr;
                stepsSpan.innerText = result.steps;
                showDistributionGraph('survivalResultArea', 'survival', 'survival', parseNumbersFromInput(document.getElementById('survivalXValues').value));
            }
        });
    }
    
    attachClearHandler('survivalClearBtn', 'survivalXValues', 'survivalResultArea');
}
