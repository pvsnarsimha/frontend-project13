/* AndersonDarling: andersonDarling tool (render, compute, setup) */

// ========== ANDERSON-DARLING TEST (NORMALITY) ==========
function renderAndersonDarlingInterface() {
    return buildInterface({
        id: "statAndersonDarlingInterface",
        title: "A² Anderson-Darling Test (Normality)",
        card: [
            { formula: "📌 A² = -n - (1/n) Σ(2i-1)[ln(F(xᵢ)) + ln(1-F(xₙ₋ᵢ₊₁))]" },
            {
                desc: "<strong>What is the Anderson-Darling Test?</strong><br>\n                    A powerful test for normality that gives more weight to the tails of the distribution.\n                    H₀: Data is normally distributed | H₁: Data is NOT normally distributed"
            },
            {
                desc: "<strong>Key differences from KS test:</strong><br>\n                    • More sensitive to deviations in the tails<br>\n                    • Uses weighted squared differences<br>\n                    • Generally more powerful for normality testing",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter sample data (comma, space, or line separated):",
                textarea: { id: "adData", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15, 18, 19, 20" }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "adAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS
            }
        ],
        run: { id: "adComputeBtn", text: "A² Run Anderson-Darling Test + Full Steps" },
        clear: { id: "adClearBtn", text: "Clear" },
        result: {
            area: "adResultArea",
            label: "🎯 ANDERSON-DARLING TEST RESULTS",
            value: "adValueDisplay",
            steps: "adStepsDisplay"
        }
    });
}

function computeAndersonDarlingTest(data, alpha) {
    if (!data.length || data.length < 4) {
        return { error: true, message: "Need at least 4 observations for Anderson-Darling test." };
    }
    
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((a,b) => a+b, 0) / n;
    const variance = data.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / (n - 1);   // sample variance (parameters estimated from the data)
    const stdDev = Math.sqrt(variance);
    if (!(stdDev > 0)) {
        return { error: true, message: "All values are identical, so the normality test is undefined (zero variance)." };
    }
    
    // Calculate A² statistic
    let sum = 0;
    let calcDetails = [];
    
    // A² = -n - (1/n) Σ (2i-1) [ ln F(x_i) + ln(1 - F(x_{n+1-i})) ]
    const cdfAt = k => normalCDF((sorted[k] - mean) / stdDev, 0, 1);
    for (let i = 0; i < n; i++) {
        const zScore = (sorted[i] - mean) / stdDev;
        const Fx = cdfAt(i);
        const term1 = (2 * i + 1) * Math.log(Fx);
        const term2 = (2 * i + 1) * Math.log(1 - cdfAt(n - 1 - i));
        const contribution = term1 + term2;
        sum += contribution;
        
        calcDetails.push({
            i: i + 1,
            value: sorted[i],
            zScore: zScore,
            Fx: Fx,
            term1: term1,
            term2: term2,
            contribution: contribution
        });
    }
    
    let A2 = -n - sum / n;
    
    // Apply correction for small samples (Stephens, 1974)
    let adjA2;
    adjA2 = A2 * (1 + 0.75 / n + 2.25 / (n * n));
    
    // Critical values for Anderson-Darling
    const criticalValues = {
        0.10: 0.631,
        0.05: 0.752,
        0.025: 0.873,
        0.01: 1.035,
        0.001: 1.159
    };
    
    const criticalValue = criticalValues[alpha] || 0.752;
    const rejectH0 = adjA2 > criticalValue;
    
    // Approximate p-value
    let pValue;
    if (adjA2 < 0.2) pValue = 1 - Math.exp(-13.436 + 101.14 * adjA2 - 223.73 * adjA2 * adjA2);
    else if (adjA2 < 0.34) pValue = 1 - Math.exp(-8.318 + 42.796 * adjA2 - 59.938 * adjA2 * adjA2);
    else if (adjA2 < 0.6) pValue = Math.exp(0.9177 - 4.279 * adjA2 - 1.38 * adjA2 * adjA2);
    else pValue = Math.exp(1.2937 - 5.709 * adjA2 + 0.0186 * adjA2 * adjA2);
    pValue = Math.min(Math.max(pValue, 0.0001), 0.9999);
    
    // Build calculation table
    let tableRows = '';
    for (let d of calcDetails) {
        tableRows += `<tr class="s-00049c">
            <td class="s-618bb3">${d.i}</td>
            <td class="s-618bb3">${d.value.toFixed(4)}</td>
            <td class="s-618bb3">z = (${d.value.toFixed(4)} - ${mean.toFixed(4)})/${stdDev.toFixed(4)} = ${d.zScore.toFixed(4)}</td>
            <td class="s-618bb3">F(x) = Φ(${d.zScore.toFixed(4)}) = ${d.Fx.toFixed(6)}</td>
            <td class="s-618bb3">(2×${d.i}−1)ln F(x<sub>${d.i}</sub>) = ${d.term1.toFixed(6)}</td>
            <td class="s-618bb3">(2×${d.i}−1)ln(1−F(x<sub>${n+1-d.i}</sub>)) = ${d.term2.toFixed(6)}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">A²</span>
                <h2 class="s-f8a94d">Anderson-Darling Test (Normality)</h2>
            </div>
            <p class="s-259079">A powerful normality test with emphasis on tail behavior</p>
            <p class="s-20a400">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <div class="s-42ccf7 gen-pad">
            <h3 class="s-ed0bb5">📖 Understanding the Anderson-Darling Test</h3>
            <div class="s-6025fc">
                <p class="s-7dacb1"><strong>How it works:</strong></p>
                <ul class="s-c1e0ca">
                    <li>Compares empirical distribution to normal distribution</li>
                    <li>Gives MORE weight to tails than KS test</li>
                    <li>Better at detecting deviations at distribution extremes</li>
                </ul>
                <div class="s-0f748e">
                    <strong>A² = -n - (1/n) Σ (2i-1)[ln(F(xᵢ)) + ln(1-F(xₙ₋ᵢ₊₁))]</strong>
                </div>
                <div class="s-28c132">
                    💡 <strong>Interpretation:</strong> Small A² = good fit to normal | Large A² = poor fit
                </div>
            </div>
        </div>
        
        <div class="s-5d9fe4 gen-grid">
            <div class="s-a739ec">
                <div class="s-42da0a">Sample Size (n)</div>
                <div class="s-abfdfd gen-big">${n}</div>
            </div>
            <div class="s-a739ec">
                <div class="s-42da0a">Sample Mean (x̄)</div>
                <div class="s-9d1896">${mean.toFixed(4)}</div>
            </div>
            <div class="s-a739ec">
                <div class="s-42da0a">Sample Std Dev (s)</div>
                <div class="s-9d1896">${stdDev.toFixed(4)}</div>
            </div>
        </div>
        
        <div class="s-90b704">
            <h3 class="s-c7276c">
                📊 Step 1: Calculate A² Statistic Components
            </h3>
            <table class="s-776a1d gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-939795">i</th>
                        <th class="s-939795">xᵢ</th>
                        <th class="s-939795">z = (x-μ)/σ</th>
                        <th class="s-939795">F(x) = Φ(z)</th>
                        <th class="s-939795">(2i-1)ln(F)</th>
                        <th class="s-939795">(2(n-i)+1)ln(1-F)</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 2: Calculate A² Statistic</h3>
            <div class="s-6025fc">
                <div class="s-5ec686">
                    Σ = ${sum.toFixed(6)}<br>
                    A² = -n - (1/n) × Σ<br>
                    A² = -${n} - (1/${n}) × ${sum.toFixed(6)}<br>
                    A² = -${n} - ${(sum/n).toFixed(6)}<br>
                    <strong class="s-b72ae1">A² = ${A2.toFixed(6)}</strong>
                </div>
                
                <div class="s-93e3f3">
                    <strong>Adjusted A² (Stephens, 1974):</strong><br>
                    A²<sub>adj</sub> = A² × (1 + 0.75/n + 2.25/n²)<br>
                    A²<sub>adj</sub> = ${A2.toFixed(6)} × (1 + 0.75/${n} + 2.25/${n*n})<br>
                    A²<sub>adj</sub> = ${A2.toFixed(6)} × ${(1 + 0.75/n + 2.25/(n*n)).toFixed(4)}<br>
                    <strong class="s-acbeaf">A²<sub>adj</sub> = ${adjA2.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">📊 Step 3: Compare with Critical Value</h3>
            <div class="s-6025fc">
                <div class="s-800734 gen-grid">
                    <div class="s-546056">
                        <div class="s-42da0a">Significance Level (α)</div>
                        <div class="s-93c0a8">${alpha}</div>
                    </div>
                    <div class="s-546056">
                        <div class="s-42da0a">Critical Value</div>
                        <div class="s-a516d1">${criticalValue}</div>
                    </div>
                </div>
                <div class="s-64c1da">
                    ${adjA2 > criticalValue ? `A²<sub>adj</sub> (${adjA2.toFixed(4)}) > Critical (${criticalValue})` : `A²<sub>adj</sub> (${adjA2.toFixed(4)}) < Critical (${criticalValue})`}
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-830a4f gen-pad' : 's-28eb84 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Step 4: Make Decision</h3>
            <div class="s-f27585">
                <div><strong>A² Statistic (adjusted):</strong> ${adjA2.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue}</div>
                <div><strong>p-value:</strong> ${pValue.toPrecision(3)} (approximate, about 3 digits: D'Agostino–Stephens polynomial)</div>
                <div class="s-c6645b">
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <div class="s-44d7a2 gen-pad">
            <h3 class="s-ed0bb5">📊 A² Statistic Scale</h3>
            <div class="s-546056">
                <div class="s-654dc6"></div>
                <div class="s-e19eba gen-flex">
                    <span class="s-fb8dcc">Good Fit (A²<0.5)</span>
                    <span class="s-fb8dcc">Borderline (0.5-0.75)</span>
                    <span class="s-fb8dcc">Poor Fit (>0.75)</span>
                </div>
                <div class="s-703843 gen-sized">
                    <div class="${rejectH0 ? 's-1fd66a gen-big' : 's-c5b75d gen-big'}">${adjA2.toFixed(4)}</div>
                    <div class="s-67e5d5">A² Statistic</div>
                </div>
            </div>
        </div>
    </div>`;
    
    return { A2: adjA2, criticalValue, pValue, rejectH0, steps };
}

function setupAndersonDarlingLogic() {
    const computeBtn = document.getElementById("adComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("adData").value;
        const data = parseNumbersFromInput(raw);
        const alpha = parseFloat(document.getElementById("adAlpha").value);
        const resultDiv = document.getElementById("adResultArea");
        const valueSpan = document.getElementById("adValueDisplay");
        const stepsSpan = document.getElementById("adStepsDisplay");
        
        const result = computeAndersonDarlingTest(data, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideAllStatCharts();
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `A² = ${result.A2.toFixed(6)} | p ≈ ${result.pValue.toPrecision(3)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
            showNormalityCharts("adResultArea", data, false);
        }
    });
    
    attachClearHandler("adClearBtn", "adData", "adResultArea");
}
