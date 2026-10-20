/* PMF: pmf tool (render, compute, setup) */

// ========== PMF (PROBABILITY MASS FUNCTION) FOR DISCRETE DISTRIBUTIONS ==========
function computePMFWithSteps() {
    const dist = document.getElementById('pmfDistribution').value;
    const xValuesText = document.getElementById('pmfXValues').value;
    const xValues = parseNumbersFromInput(xValuesText);
    
    if (!xValues.length) return { error: true, message: "Please enter x values." };
    
    let results = [];
    let steps = `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║           PROBABILITY MASS FUNCTION (PMF) CALCULATION              ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 DISTRIBUTION: ${dist.toUpperCase()} (DISCRETE)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `┌─────────────────────────────────────────────────────────────────┐\n`;
    steps += `│  WHAT IS THE PROBABILITY MASS FUNCTION (PMF)?                   │\n`;
    steps += `└─────────────────────────────────────────────────────────────────┘\n\n`;
    steps += `   The PMF gives the probability that a discrete random variable\n`;
    steps += `   takes on a specific value: P(X = x).\n\n`;
    steps += `   Properties:\n`;
    steps += `   • 0 ≤ P(X=x) ≤ 1 for all x\n`;
    steps += `   • Σ P(X=x) = 1 over all possible x\n\n`;
    
    if (dist === 'poisson') {
        const lambda = parseFloat(document.getElementById('pmfLambda').value);
        const lambdaError = validateDistributionParams('poisson', { lambda });
        if (lambdaError) return { error: true, message: lambdaError };
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      POISSON DISTRIBUTION PMF                    ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: P(X=k) = (e^{-λ} · λ^{k}) / k!\n\n`;
        steps += `   Where:\n`;
        steps += `   • λ (lambda) = average number of events per interval\n`;
        steps += `   • k = number of events (non-negative integer)\n`;
        steps += `   • e ≈ 2.71828 (Euler's number)\n\n`;
        
        steps += `   Given λ = ${lambda}\n\n`;
        
        xValues.forEach(k => {
            if (k < 0 || !Number.isInteger(k)) {
                results.push(0);
                steps += `\nFor x = ${k}:\n`;
                steps += `  ⚠️ x must be a non-negative integer for Poisson distribution.\n`;
                steps += `  P(X=${k}) = 0\n\n`;
            } else {
                const pmf = Math.exp(-lambda + k * Math.log(lambda) - logGamma(k + 1));   // log form: stays finite for large k
                results.push(pmf);
                
                steps += `\nFor x = ${k}:\n`;
                steps += `  Step 1: Calculate e^{-λ} = e^{-${lambda}} = ${Math.exp(-lambda).toFixed(8)}\n`;
                steps += `  Step 2: Calculate λ^{k} = ${lambda}^${k} = ${powerText(lambda, k)}\n`;
                steps += `  Step 3: Calculate k! = ${k}! = ${formatFactorial(k)}\n`;
                steps += `  Step 4: Apply formula: (${Math.exp(-lambda).toFixed(8)} × ${powerText(lambda, k)}) / ${formatFactorial(k)}\n`;
                steps += `  P(X=${k}) = ${pmf.toFixed(8)}\n`;
                steps += `  Interpretation: ${(pmf * 100).toFixed(4)}% chance of exactly ${k} events\n\n`;
            }
        });
        
    } else if (dist === 'binomial') {
        const n = parseInt(document.getElementById('pmfN').value);
        const p = parseFloat(document.getElementById('pmfP').value);
        const binomialError = validateDistributionParams('binomial', { n, p });
        if (binomialError) return { error: true, message: binomialError };
        
        steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
        steps += `║                      BINOMIAL DISTRIBUTION PMF                   ║\n`;
        steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
        steps += `   Formula: P(X=k) = C(n,k) · p^{k} · (1-p)^{n-k}\n\n`;
        steps += `   Where:\n`;
        steps += `   • n = number of trials\n`;
        steps += `   • p = probability of success on each trial\n`;
        steps += `   • k = number of successes (0 ≤ k ≤ n)\n`;
        steps += `   • C(n,k) = n!/(k!(n-k)!) (binomial coefficient)\n\n`;
        
        steps += `   Given n = ${n}, p = ${p}\n`;
        steps += `   q = 1-p = ${(1-p).toFixed(6)}\n\n`;
        
        xValues.forEach(k => {
            if (k < 0 || k > n || !Number.isInteger(k)) {
                results.push(0);
                steps += `\nFor x = ${k}:\n`;
                steps += `  ⚠️ x must be an integer between 0 and ${n} for Binomial distribution.\n`;
                steps += `  P(X=${k}) = 0\n\n`;
            } else {
                const comb = combination(n, k);
                const pmf = binomialPMF(n, k, p);
                results.push(pmf);
                
                steps += `\nFor x = ${k}:\n`;
                steps += `  Step 1: Calculate C(${n},${k}) = ${n}!/(${k}!·${n-k}!) = ${formatCombination(n, k)}\n`;
                steps += `  Step 2: Calculate p^{k} = ${p}^${k} = ${Math.pow(p, k).toFixed(8)}\n`;
                steps += `  Step 3: Calculate (1-p)^{n-k} = ${(1-p).toFixed(6)}^${n-k} = ${Math.pow(1-p, n-k).toFixed(8)}\n`;
                steps += `  Step 4: Multiply: ${combination(n, k) === comb && isFinite(comb) ? comb : 'C(n,k)'} × ${Math.pow(p, k).toFixed(8)} × ${Math.pow(1-p, n-k).toFixed(8)}\n`;
                steps += `  P(X=${k}) = ${pmf.toFixed(8)}\n`;
                steps += `  Interpretation: ${(pmf * 100).toFixed(4)}% chance of exactly ${k} successes in ${n} trials\n\n`;
            }
        });
    }
    
    steps += `╔══════════════════════════════════════════════════════════════════╗\n`;
    steps += `║                          FINAL ANSWER                            ║\n`;
    steps += `╚══════════════════════════════════════════════════════════════════╝\n\n`;
    steps += `   ┌─────────────────────────────────────────────────────────────┐\n`;
    xValues.forEach((x, i) => {
        steps += `   │  P(X=${x}) = ${results[i].toFixed(10)}${' '.repeat(20 - results[i].toFixed(10).length)}│\n`;
    });
    steps += `   └─────────────────────────────────────────────────────────────┘\n`;
    
    return { results, xValues, steps, resultStr: results.map(r => r.toFixed(8)).join(', ') };
}

// Helper functions for factorial and combinations
// λ^k as text: the number when it fits in a double, otherwise a power of ten (200^200 is "Infinity" in floating point)
function powerText(base, exponent) {
    const value = Math.pow(base, exponent);
    return isFinite(value) ? value.toFixed(8) : `≈ 10^${(exponent * Math.log10(base)).toFixed(2)}`;
}

function factorial(n) {
    if (n < 0) return 1;
    if (n > 170) return Infinity;           // 171! overflows a double; never loop up to a huge n
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

// ========== PARAMETER UI UPDATE FUNCTIONS FOR NEW FEATURES ==========
function updatePMFParams() {
    const dist = document.getElementById('pmfDistribution').value;
    const paramsDiv = document.getElementById('pmfParams');
    
    if (dist === 'poisson') {
        setHtml(paramsDiv, `
            <label>📊 Lambda (λ) - Average rate:</label>
            <input class="s-c689ef gen-sized" type="number" id="pmfLambda" value="3" step="0.5" min="0.01">
            <div class="desc s-8b77e0">Average number of events per interval</div>
        `);
    } else if (dist === 'binomial') {
        setHtml(paramsDiv, `
            <label>📊 Number of trials (n):</label>
            <input class="s-c689ef gen-sized" type="number" id="pmfN" value="10" step="1" min="1">
            <label>📊 Probability of success (p):</label>
            <input class="s-c689ef gen-sized" type="number" id="pmfP" value="0.5" step="0.1" min="0" max="1">
        `);
    }
}

// ========== PMF INTERFACE RENDER FUNCTION ==========
function renderPMFInterface() {
    return buildInterface({
        id: "statPMFInterface",
        title: "🎲 Probability Mass Function (PMF) - Discrete Distributions",
        formula: "📌 P(X = x) = probability of exactly x events",
        desc: "The PMF gives the probability that a discrete random variable equals a specific value. For Poisson: P(X=k) = (e^{-λ}·λ^{k})/k! | For Binomial: P(X=k) = C(n,k)·p^{k}·(1-p)^{n-k}",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: { id: "pmfDistribution", style: FIELD_STYLE },
                options: [["poisson", "Poisson Distribution"], ["binomial", "Binomial Distribution"]]
            },
            {
                html: "<div id=\"pmfParams\">\n                    <!-- Dynamic params will go here -->\n                </div>"
            },
            {
                label: "📊 X Value(s) (k):",
                textarea: {
                    id: "pmfXValues",
                    rows: "3",
                    placeholder: "Enter integer value(s) (comma-separated)&#10;Example: 0, 1, 2, 3, 4, 5"
                }
            }
        ],
        run: { id: "pmfComputeBtn", text: "🎲 Calculate PMF + Steps" },
        clear: { id: "pmfClearBtn", text: "Clear" },
        result: { area: "pmfResultArea", label: "🎯 PMF RESULTS", value: "pmfValueDisplay", steps: "pmfStepsDisplay" }
    });
}

// ========== PMF SETUP FUNCTION ==========
function setupPMFLogic() {
    const distSelect = document.getElementById('pmfDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updatePMFParams);
        updatePMFParams();
    }
    
    const computeBtn = document.getElementById('pmfComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const result = computePMFWithSteps();
            const resultDiv = document.getElementById('pmfResultArea');
            const valueSpan = document.getElementById('pmfValueDisplay');
            const stepsSpan = document.getElementById('pmfStepsDisplay');
            
            if (result.error) {
                resultDiv.style.display = 'block';
                valueSpan.innerText = 'Error';
                hideAllStatCharts();
                setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
            } else {
                resultDiv.style.display = 'block';
                valueSpan.innerText = result.resultStr;
                stepsSpan.innerText = result.steps;
                showDistributionGraph('pmfResultArea', 'pmf', 'pmf', parseNumbersFromInput(document.getElementById('pmfXValues').value));
            }
        });
    }
    
    attachClearHandler('pmfClearBtn', 'pmfXValues', 'pmfResultArea');
}
