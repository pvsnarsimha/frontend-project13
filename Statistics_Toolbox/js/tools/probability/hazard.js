/* Hazard: hazard tool (render, compute, setup) */

// ========== HAZARD FUNCTION h(t) = f(t)/S(t) ==========
function computeHazardWithSteps() {
    const dist = document.getElementById('hazardDistribution').value;
    const xValuesText = document.getElementById('hazardXValues').value;
    const xValues = parseNumbersFromInput(xValuesText);
    
    if (!xValues.length) return { error: true, message: "Please enter time values." };
    
    let results = [];
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                     HAZARD FUNCTION h(t) CALCULATION               ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${dist.toUpperCase()}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS THE HAZARD FUNCTION?                                  │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The Hazard Function (also called Failure Rate) is:\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    steps += `   │                    h(t) = f(t) / S(t)                        │\n`;
    steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   Where:\n`;
    steps += `   • f(t) = PDF (probability density function)\n`;
    steps += `   • S(t) = Survival function = 1 - F(t)\n\n`;
    steps += `   Interpretation: h(t) dt ≈ probability of failure in [t, t+dt]\n`;
    steps += `   given survival up to time t.\n\n`;
    steps += `   Properties:\n`;
    steps += `   • h(t) ≥ 0 for all t\n`;
    steps += `   • Can be constant, increasing, or decreasing over time\n`;
    steps += `   • Used to model failure rates in reliability engineering\n\n`;
    
    if (dist === 'exponential') {
        const rate = parseFloat(document.getElementById('hazardRate').value);
        const rateError = validateDistributionParams('exponential', { rate });
        if (rateError) return { error: true, message: rateError };
        results = xValues.map(() => rate);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                   EXPONENTIAL DISTRIBUTION HAZARD                ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Exponential distribution:\n`;
        steps += `   • PDF: f(t) = λ·e^{-λt}\n`;
        steps += `   • Survival: S(t) = e^{-λt}\n`;
        steps += `   • Hazard: h(t) = f(t)/S(t) = (λ·e^{-λt})/e^{-λt} = λ\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │                    h(t) = λ (constant)                      │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Given λ (rate) = ${rate}\n\n`;
        steps += `   The Exponential distribution has a CONSTANT hazard rate,\n`;
        steps += `   meaning the failure risk does not change over time (memoryless property).\n\n`;
        
        xValues.forEach(t => {
            const pdf = rate * Math.exp(-rate * t);
            const surv = Math.exp(-rate * t);
            steps += `\nFor t = ${t}:\n`;
            steps += `  Step 1: Calculate PDF: f(${t}) = λ·e^{-λt} = ${rate} × e^{-${rate}×${t}} = ${pdf.toFixed(8)}\n`;
            steps += `  Step 2: Calculate Survival: S(${t}) = e^{-λt} = e^{-${rate}×${t}} = ${surv.toFixed(8)}\n`;
            if (surv > 0) {
                steps += `  Step 3: Calculate hazard: h(${t}) = f(${t})/S(${t}) = ${pdf.toFixed(8)}/${surv.toFixed(8)}\n`;
                steps += `  h(${t}) = ${(pdf / surv).toFixed(8)} = λ\n`;
            } else {
                // both f(t) and S(t) underflow to 0 for large λt, so the ratio is taken symbolically: (λe^{-λt}) / e^{-λt} = λ\n                steps += `  Step 3: f(${t}) and S(${t}) are both smaller than the smallest number a computer stores, so cancel e^{-λt} symbolically:\n`;
                steps += `  h(${t}) = (λ·e^{-λt}) / e^{-λt} = λ = ${rate}\n`;
            }
            steps += `  Interpretation: Instantaneous failure rate is ${rate} at time ${t}\n\n`;
        });
        
    } else if (dist === 'weibull') {
        const shape = parseFloat(document.getElementById('hazardShape').value);
        const scale = parseFloat(document.getElementById('hazardScale').value);
        if (!(shape > 0 && scale > 0 && isFinite(shape) && isFinite(scale))) return { error: true, message: "The Weibull distribution needs a shape k > 0 and a scale λ > 0." };
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      WEIBULL DISTRIBUTION HAZARD                 ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Weibull distribution:\n`;
        steps += `   • PDF: f(t) = (k/λ)·(t/λ)^{k-1}·e^{-(t/λ)^{k}}\n`;
        steps += `   • Survival: S(t) = e^{-(t/λ)^{k}}\n`;
        steps += `   • Hazard: h(t) = (k/λ)·(t/λ)^{k-1}\n\n`;
        steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
        steps += `   │              h(t) = (k/λ)·(t/λ)^{k-1}                       │\n`;
        steps += `   └─────────────────────────────────────────────────────────────┘\n\n`;
        steps += `   Where:\n`;
        steps += `   • k = shape parameter\n`;
        steps += `   • λ = scale parameter\n\n`;
        steps += `   Given shape k = ${shape}, scale λ = ${scale}\n\n`;
        steps += `   Hazard function interpretation:\n`;
        if (shape < 1) steps += `   • k < 1: Decreasing hazard (infant mortality/burn-in period)\n`;
        else if (shape === 1) steps += `   • k = 1: Constant hazard (Exponential special case)\n`;
        else steps += `   • k > 1: Increasing hazard (wear-out period)\n\n`;
        
        xValues.forEach(t => {
            if (t < 0) {
                results.push(0);
                steps += `\nFor t = ${t} (< 0):\n`;
                steps += `  h(${t}) = 0 (hazard is zero for negative time)\n\n`;
            } else {
                const hazard = (shape / scale) * Math.pow(t / scale, shape - 1);
                results.push(hazard);
                
                steps += `\nFor t = ${t}:\n`;
                steps += `  Step 1: Calculate t/λ = ${t}/${scale} = ${(t/scale).toFixed(6)}\n`;
                steps += `  Step 2: Calculate (t/λ)^{k-1} = ${(t/scale).toFixed(6)}^${shape-1} = ${Math.pow(t/scale, shape-1).toFixed(8)}\n`;
                steps += `  Step 3: Calculate k/λ = ${shape}/${scale} = ${(shape/scale).toFixed(6)}\n`;
                steps += `  Step 4: Multiply: ${(shape/scale).toFixed(6)} × ${Math.pow(t/scale, shape-1).toFixed(8)}\n`;
                const wSurv = Math.exp(-Math.pow(t / scale, shape));
                steps += `  Step 5: Check with S(${t}) = e^{-(t/λ)^k} = ${wSurv.toFixed(8)} and f(${t}) = h(${t})·S(${t}) = ${(hazard * wSurv).toFixed(8)}\n`;
                steps += `  h(${t}) = ${hazard.toFixed(8)}\n`;
                steps += `  Interpretation: Instantaneous failure rate at time ${t} is ${hazard.toFixed(6)}\n\n`;
            }
        });
        
    } else if (dist === 'normal') {
        const mean = parseFloat(document.getElementById('hazardMean').value);
        const std = parseFloat(document.getElementById('hazardStd').value);
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      NORMAL DISTRIBUTION HAZARD                  ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   For Normal distribution:\n`;
        steps += `   • PDF: f(t) = (1/(σ√(2π)))·e^{-(t-μ)²/(2σ²)}\n`;
        steps += `   • Survival: S(t) = 1 - Φ((t-μ)/σ)\n`;
        steps += `   • Hazard: h(t) = f(t)/S(t)\n\n`;
        steps += `   Given μ (mean) = ${mean}, σ (std dev) = ${std}\n\n`;
        steps += `   ⚠️ Note: Normal distribution hazard is NOT monotonic.\n`;
        steps += `   It increases and then decreases (bathtub-shaped for negative times).\n\n`;
        
        xValues.forEach(t => {
            const pdf = normalPDF(t, mean, std);
            const cdf = normalCDF(t, mean, std);
            const survival = 1 - cdf;
            const hazard = survival > 0 ? pdf / survival : Infinity;
            results.push(hazard);
            
            steps += `\nFor t = ${t}:\n`;
            steps += `  Step 1: Calculate PDF: f(${t}) = ${pdf.toFixed(8)}\n`;
            steps += `  Step 2: Calculate CDF: F(${t}) = ${cdf.toFixed(8)}\n`;
            steps += `  Step 3: Calculate Survival: S(${t}) = 1 - ${cdf.toFixed(8)} = ${survival.toFixed(8)}\n`;
            steps += `  Step 4: Calculate hazard: h(${t}) = f(${t})/S(${t}) = ${pdf.toFixed(8)}/${survival.toFixed(8)}\n`;
            steps += `  h(${t}) = ${hazard.toFixed(8)}\n`;
            if (survival > 0) {
                steps += `  Interpretation: Instantaneous failure rate at time ${t} is ${hazard.toFixed(6)}\n\n`;
            } else {
                steps += `  Interpretation: Hazard is infinite (certain failure by this time)\n\n`;
            }
        });
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    xValues.forEach((x, i) => {
        steps += `   │  h(${x}) = ${results[i].toFixed(10)}${' '.repeat(30 - results[i].toFixed(10).length)}│\n`;
    });
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { results, xValues, steps, resultStr: results.map(r => r.toFixed(6)).join(', ') };
}

function updateHazardParams() {
    const dist = document.getElementById('hazardDistribution').value;
    const paramsDiv = document.getElementById('hazardParams');
    
    if (dist === 'exponential') {
        setHtml(paramsDiv, `
            <label>📊 Rate (λ):</label>
            <input type="number" id="hazardRate" value="1" step="0.5" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">Constant hazard rate = λ</div>
        `);
    } else if (dist === 'weibull') {
        setHtml(paramsDiv, `
            <label>📊 Shape parameter (k):</label>
            <input type="number" id="hazardShape" value="1.5" step="0.5" min="0.1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">k < 1: decreasing hazard, k = 1: constant, k > 1: increasing</div>
            <label>📊 Scale parameter (λ):</label>
            <input type="number" id="hazardScale" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
        `);
    } else if (dist === 'normal') {
        setHtml(paramsDiv, `
            <label>📊 Mean (μ):</label>
            <input type="number" id="hazardMean" value="0" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <label>📊 Standard Deviation (σ):</label>
            <input type="number" id="hazardStd" value="1" step="any" min="0.01" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;">
            <div class="desc" style="font-size: 0.75rem;">Normal hazard is non-monotonic (increases then decreases)</div>
        `);
    }
}

// ========== HAZARD FUNCTION INTERFACE RENDER FUNCTION ==========
function renderHazardInterface() {
    return buildInterface({
        id: "statHazardInterface",
        title: "⚠️ Hazard Function h(t) = f(t)/S(t)",
        formula: "📌 h(t) = f(t) / S(t)",
        desc: "The hazard function (failure rate) gives the instantaneous rate of failure at time t, conditional on survival up to t. For Exponential: constant λ | For Weibull: (k/λ)(t/λ)^{k-1}",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: { id: "hazardDistribution", style: FIELD_STYLE },
                options: [
                    ["exponential", "Exponential Distribution (Constant Hazard)"],
                    ["weibull", "Weibull Distribution"],
                    ["normal", "Normal Distribution"]
                ]
            },
            {
                html: "<div id=\"hazardParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            },
            {
                label: "📊 Time Value(s) (t):",
                textarea: {
                    id: "hazardXValues",
                    rows: "3",
                    placeholder: "Enter time value(s) (comma-separated)&#10;Example: 0.5, 1, 2, 5, 10"
                }
            }
        ],
        run: { id: "hazardComputeBtn", text: "⚠️ Calculate Hazard + Steps" },
        clear: { id: "hazardClearBtn", text: "Clear" },
        result: {
            area: "hazardResultArea",
            label: "🎯 HAZARD FUNCTION RESULTS",
            value: "hazardValueDisplay",
            steps: "hazardStepsDisplay"
        }
    });
}

// ========== HAZARD FUNCTION SETUP ==========
function setupHazardLogic() {
    const distSelect = document.getElementById('hazardDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateHazardParams);
        updateHazardParams();
    }
    
    const computeBtn = document.getElementById('hazardComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computeHazardWithSteps();
            const resultDiv = document.getElementById('hazardResultArea');
            const valueSpan = document.getElementById('hazardValueDisplay');
            const stepsSpan = document.getElementById('hazardStepsDisplay');
            
            if (result.error) {
                resultDiv.style.display = 'block';
                valueSpan.innerText = 'Error';
                setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
            } else {
                resultDiv.style.display = 'block';
                valueSpan.innerText = result.resultStr;
                stepsSpan.innerText = result.steps;
            }
        });
    }
    
    attachClearHandler('hazardClearBtn', 'hazardXValues', 'hazardResultArea');
}
