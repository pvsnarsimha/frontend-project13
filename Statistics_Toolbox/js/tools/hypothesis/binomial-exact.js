/* BinomialExact: binomialexact tool (render, compute, setup) */

// ========== BINOMIAL EXACT TEST INTERFACE ==========
function renderBinomialExactInterface() {
    return buildInterface({
        id: "statBinomialExactInterface",
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
        calculationDetails = `<div style="margin-top: 12px;"><strong>P(X ≥ ${successes}) =</strong><br>`;
        for (let k = successes; k <= n; k++) {
            const prob = binomialPMF(n, k, p0);
            pValue += prob;
            calculationDetails += `P(X = ${k}) = C(${n},${k}) × ${p0}^${k} × ${(1-p0).toFixed(4)}^${n-k} = ${prob.toFixed(8)}<br>`;
        }
        calculationDetails += `</div>`;
    } else if (alternative === 'less') {
        pValue = 0;
        calculationDetails = `<div style="margin-top: 12px;"><strong>P(X ≤ ${successes}) =</strong><br>`;
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
        calculationDetails = `<div style="margin-top: 12px;"><strong>Two-tailed p-value calculation:</strong><br>
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
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">B</span>
                <h2 style="margin: 0;">Binomial Exact Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: P(X = k) = C(n,k) × p^k × (1-p)^(n-k)</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: p = ${p0} | H₁: p ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${p0}</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Size (n)</div><div style="font-size: 24px; font-weight: 700;">${n}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Successes (k)</div><div style="font-size: 24px; font-weight: 700;">${successes}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Sample Proportion (p̂)</div><div style="font-size: 20px;">${(successes/n).toFixed(6)}</div></div>
                <div style="background: white; padding: 12px; border-radius: 12px;"><div style="font-size: 12px;">Hypothesized p₀</div><div style="font-size: 20px;">${p0}</div></div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Understanding the Binomial Distribution</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    Under H₀ (p = ${p0}), the number of successes follows Binomial(n=${n}, p=${p0})<br>
                    Probability mass function: P(X = k) = C(${n}, k) × ${p0}^k × ${(1-p0).toFixed(4)}^(${n}-k)
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate the p-value</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    ${calculationDetails}
                    <div style="margin-top: 12px; font-weight: bold;">p-value = ${pValue.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Compare with Significance Level</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    α = ${alpha}<br>
                    p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} α = ${alpha}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${conclusion}<br>
                <strong>Interpretation:</strong> ${interpretation}<br>
                ${pValue < alpha ? `✓ p-value < α → Statistically significant at α = ${alpha}` : `✗ p-value > α → Not statistically significant at α = ${alpha}`}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px; font-size: 13px;">
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
