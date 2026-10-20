/* BinomialExact: binomialexact tool (render, compute, setup) */

// ========== BINOMIAL EXACT TEST INTERFACE ==========
function renderBinomialExactInterface() {
    return buildInterface({
        id: "statBinomialExactInterface",
        parameterOnly: true,   // number fields and drop-downs only: no pasted data, so no sample button
        title: "B Binomial Exact Test",
        formula: "📌 P(X = k) = C(n,k) × p^k × (1-p)^(n-k)",
        desc: "Exact test for binomial proportion using the binomial distribution (not approximation).",
        inputs: [
            {
                label: "📊 Number of Successes (k):",
                input: {
                    type: "number",
                    id: "binomSuccesses",
                    value: "8",
                    step: "1",
                    min: "0",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Sample Size (n):",
                input: {
                    type: "number",
                    id: "binomSampleSize",
                    value: "20",
                    step: "1",
                    min: "1",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Hypothesized Probability (p₀):",
                input: {
                    type: "number",
                    id: "binomHypProp",
                    value: "0.5",
                    step: "0.1",
                    min: "0",
                    max: "1",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Significance Level (α):",
                select: { id: "binomAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_3
            },
            {
                label: "📋 Alternative Hypothesis:",
                select: { id: "binomAlternative", style: FIELD_STYLE },
                options: [["two.sided", "p ≠ p₀ (Two-tailed)"], ["greater", "p > p₀ (Greater than)"], ["less", "p < p₀ (Less than)"]]
            }
        ],
        run: { id: "binomExactComputeBtn", text: "B Run Binomial Exact Test + Steps" },
        clear: { id: "binomExactClearBtn", text: "Clear" },
        result: {
            area: "binomExactResultArea",
            label: "🎯 BINOMIAL EXACT TEST RESULTS",
            value: "binomExactValueDisplay",
            steps: "binomExactStepsDisplay"
        }
    });
}

// ========== BINOMIAL EXACT TEST COMPUTATION (COMPLETE WITH DETAILED STEPS) ==========
function computeBinomialExactTest(successes, n, p0, alpha, alternative) {
    if (n < 1) return { error: true, message: "Sample size must be at least 1." };
    if (!(p0 >= 0 && p0 <= 1)) return { error: true, message: "The hypothesized probability p₀ must be a number between 0 and 1." };
    if (successes < 0 || successes > n) return { error: true, message: "Successes must be between 0 and n." };
    
    let pValue;
    let calculationDetails = "";
    
    if (alternative === 'greater') {
        pValue = 0;
        calculationDetails = `<div class="s-9d5978"><strong>P(X ≥ ${successes}) =</strong><br>`;
        for (let k = successes; k <= n; k++) {
            const prob = binomialPMF(n, k, p0);
            pValue += prob;
            calculationDetails += `P(X = ${k}) = C(${n},${k}) × ${p0}^${k} × ${(1-p0).toFixed(4)}^${n-k} = ${prob.toFixed(8)}<br>`;
        }
        calculationDetails += `</div>`;
    } else if (alternative === 'less') {
        pValue = 0;
        calculationDetails = `<div class="s-9d5978"><strong>P(X ≤ ${successes}) =</strong><br>`;
        for (let k = 0; k <= successes; k++) {
            const prob = binomialPMF(n, k, p0);
            pValue += prob;
            calculationDetails += `P(X = ${k}) = C(${n},${k}) × ${p0}^${k} × ${(1-p0).toFixed(4)}^${n-k} = ${prob.toFixed(8)}<br>`;
        }
        calculationDetails += `</div>`;
    } else {
        // Two-tailed
        pValue = 0;
        const observedProb = binomialPMF(n, successes, p0);
        calculationDetails = `<div class="s-9d5978"><strong>Two-tailed p-value calculation:</strong><br>
        Observed probability = ${observedProb.toFixed(8)}<br>
        Including all outcomes with probability ≤ observed probability:<br>`;
        
        for (let k = 0; k <= n; k++) {
            const prob = binomialPMF(n, k, p0);
            if (prob <= observedProb + 1e-10) {
                pValue += prob;
                calculationDetails += `P(X = ${k}) = ${prob.toFixed(8)} ✓<br>`;
            }
        }
        pValue = Math.min(pValue, 1);
        calculationDetails += `</div>`;
    }
    
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the population proportion is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${p0}.` :
        `There is NOT sufficient evidence that the population proportion is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${p0}.`;
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">B</span>
                <h2 class="s-f8a94d">Binomial Exact Test</h2>
            </div>
            <p class="s-259079">Formula: P(X = k) = C(n,k) × p^k × (1-p)^(n-k)</p>
            <p class="s-20a400">H₀: p = ${p0} | H₁: p ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${p0}</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-d163b6">📊 Data Summary</h3>
            <div class="s-a7ffd4 gen-grid">
                <div class="s-63afdf"><div class="s-137d30">Sample Size (n)</div><div class="s-c2434f">${n}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Successes (k)</div><div class="s-c2434f">${successes}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Sample Proportion (p̂)</div><div class="s-23ee8e">${(successes/n).toFixed(6)}</div></div>
                <div class="s-63afdf"><div class="s-137d30">Hypothesized p₀</div><div class="s-23ee8e">${p0}</div></div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">1</div>
                    <div><strong>Understanding the Binomial Distribution</strong></div>
                </div>
                <div class="s-f55593">
                    Under H₀ (p = ${p0}), the number of successes follows Binomial(n=${n}, p=${p0})<br>
                    Probability mass function: P(X = k) = C(${n}, k) × ${p0}^k × ${(1-p0).toFixed(4)}^(${n}-k)
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">2</div>
                    <div><strong>Calculate the p-value</strong></div>
                </div>
                <div class="s-78a84b">
                    ${calculationDetails}
                    <div class="s-6cabac">p-value = ${pValue.toFixed(8)}</div>
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-541469 gen-flex gen-sized">3</div>
                    <div><strong>Compare with Significance Level</strong></div>
                </div>
                <div class="s-f55593">
                    α = ${alpha}<br>
                    p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} α = ${alpha}
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-d45b93 gen-pad' : 's-a314d9 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Test Conclusion</h3>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-34b24f">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value < α → Statistically significant at α = ${alpha}` : `✗ p-value > α → Not statistically significant at α = ${alpha}`}
            </div>
        </div>
        
        <div class="s-afe18c">
            💡 <strong>What is the Binomial Exact Test?</strong><br>
            Unlike the z-test approximation, the binomial exact test calculates the exact p-value using the binomial distribution.
            This is more accurate, especially for small sample sizes or when p is close to 0 or 1.
        </div>
    </div>`;
    
    return { pValue, rejectH0, successes, n, pHat: successes/n, steps };
}

function setupBinomialExactLogic() {
    const computeBtn = document.getElementById("binomExactComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const successes = parseInt(document.getElementById("binomSuccesses").value);
        const n = parseInt(document.getElementById("binomSampleSize").value);
        const p0 = parseFloat(document.getElementById("binomHypProp").value);
        const alpha = parseFloat(document.getElementById("binomAlpha").value);
        const alternative = document.getElementById("binomAlternative").value;
        const resultDiv = document.getElementById("binomExactResultArea");
        const valueSpan = document.getElementById("binomExactValueDisplay");
        const stepsSpan = document.getElementById("binomExactStepsDisplay");
        
        const result = computeBinomialExactTest(successes, n, p0, alpha, alternative);
        resultDiv.style.display = "block";
        if (result.error) {
            valueSpan.textContent = "Error";
            setHtml(stepsSpan, "⚠️ " + escapeHtml(result.message));
            return;
        }
        setHtml(valueSpan, `p = ${result.pValue?.toFixed(6) || 'Error'} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
        setHtml(stepsSpan, result.steps || "Calculation completed.");
    });
    attachClearHandler("binomExactClearBtn", ["binomSuccesses", "binomSampleSize"], "binomExactResultArea");
}
