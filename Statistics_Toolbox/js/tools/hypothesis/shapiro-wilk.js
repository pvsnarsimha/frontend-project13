/* ShapiroWilk: shapirowilk tool (render, compute, setup) */

// ========== SHAPIRO-WILK TEST INTERFACE ==========
function renderShapiroWilkInterface() {
    return buildInterface({
        id: "statShapiroWilkInterface",
        title: "W Shapiro-Wilk Test (Normality)",
        formula: "📌 W = (Σ aᵢ(x₍ₙ₋ᵢ₊₁₎ - x₍ᵢ₎))² / Σ(xᵢ - x̄)²",
        desc: "Tests whether a sample comes from a normal distribution. H₀: Data is normally distributed. Most powerful test for normality.",
        inputs: [
            {
                label: "📋 Enter sample data (comma, space, or line separated):",
                textarea: { id: "swData", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15, 18, 19, 20" }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "swAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS
            }
        ],
        run: { id: "swComputeBtn", text: "W Run Shapiro-Wilk Test + Steps" },
        clear: { id: "swClearBtn", text: "Clear" },
        result: {
            area: "swResultArea",
            label: "🎯 SHAPIRO-WILK TEST RESULTS",
            value: "swValueDisplay",
            steps: "swStepsDisplay"
        }
    });
}

// ========== SHAPIRO-WILK TEST (WITH EXPLANATION OF aᵢ COEFFICIENTS) ==========
function computeShapiroWilkTest(data, alpha) {
    if (!data.length || data.length < 3 || data.length > 5000) {
        return { error: true, message: "Shapiro-Wilk test requires 3-5000 observations." };
    }
    
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((a,b) => a+b, 0) / n;
    
    // Calculate sum of squared deviations
    let ss = 0;
    let squaredDeviations = [];
    for (let i = 0; i < n; i++) {
        const dev = data[i] - mean;
        const sqDev = dev * dev;
        squaredDeviations.push({ value: data[i], deviation: dev, squaredDeviation: sqDev });
        ss += sqDev;
    }
    
    if (!(ss > 0)) {
        return { error: true, message: "All values are identical, so the normality test is undefined (zero variance)." };
    }
    
    // Calculate Shapiro-Wilk W statistic
    let numerator = 0;
    let aCoeffs = [];
    
    // Coefficients a_i from Royston's (1992) approximation to the expected normal order statistics
    const royston = shapiroWilkCoefficients(n);
    for (let i = 0; i < Math.floor(n/2); i++) {
        const m = normInv((n - i - 0.375) / (n + 0.25));   // expected normal order statistic (Blom)
        const a_i = royston[i];
        const diff = sorted[n - 1 - i] - sorted[i];
        numerator += a_i * diff;
        
        // Store calculation details
        const formula = `mᵢ = Φ⁻¹((${n - i} - 0.375)/(${n} + 0.25)) = ${m.toFixed(4)} → aᵢ = ${a_i.toFixed(4)}`;
        
        aCoeffs.push({ 
            i: i+1, 
            a_i: a_i, 
            formula: formula,
            lowerValue: sorted[i], 
            upperValue: sorted[n - 1 - i],
            diff: diff, 
            product: a_i * diff 
        });
    }
    
    let w = 0;
    if (Math.abs(ss) > 1e-10) {
        w = Math.pow(numerator, 2) / ss;
    }
    
    // p-value from Royston's (1995) normalising transformation of W (valid for 3 <= n <= 5000)
    let pValue = shapiroWilkPValue(w, n);
    pValue = Math.min(Math.max(pValue, 1e-10), 1);
    const rejectH0 = pValue < alpha;
    
    // Build squared deviations table
    let sqDevRows = '';
    for (let i = 0; i < squaredDeviations.length; i++) {
        const d = squaredDeviations[i];
        sqDevRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            <td class="s-a7c3f4">${d.value.toFixed(4)}</td>
            <td class="s-a7c3f4">${d.value.toFixed(4)} - ${mean.toFixed(4)} = ${d.deviation.toFixed(4)}</td>
            <td class="s-a7c3f4">(${d.deviation.toFixed(4)})² = ${d.squaredDeviation.toFixed(4)}</td>
         </tr>`;
    }
    
    // Build coefficients table with formula
    let coeffRows = '';
    for (let c of aCoeffs) {
        coeffRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${c.i}</td>
            <td class="s-a7c3f4">
                <div><strong>${c.a_i.toFixed(4)}</strong></div>
                <div class="s-994a3a">${c.formula}</div>
            </td>
            <td class="s-a7c3f4">${c.upperValue.toFixed(4)} - ${c.lowerValue.toFixed(4)} = ${c.diff.toFixed(4)}</td>
            <td class="s-b33403">${c.product.toFixed(4)}</td>
         </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <!-- Header -->
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">W</span>
                <h2 class="s-f8a94d">Shapiro-Wilk Test (Normality)</h2>
            </div>
            <p class="s-259079">The most powerful test for normality</p>
            <p class="s-20a400">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <!-- Understanding the Test - How aᵢ is calculated -->
        <div class="s-42ccf7 gen-pad">
            <h3 class="s-ed0bb5">📖 How are the Coefficients aᵢ Calculated?</h3>
            <div class="s-3a063a">
                <p class="s-7dacb1"><strong>The coefficients aᵢ are calculated using the formula:</strong></p>
                <div class="s-000adc">
                    <strong>mᵢ = Φ⁻¹((i − 0.375)/(n + 0.25)), then aᵢ = mᵢ/√(Σmⱼ²) with Royston's polynomial correction for the two largest coefficients</strong>
                </div>
                <p class="s-5e70e1">Where:</p>
                <ul class="s-d06bdc">
                    <li><strong>i</strong> = the pair number (from 1 to floor(n/2))</li>
                    <li><strong>n</strong> = total sample size = <strong>${n}</strong></li>
                    <li><strong>mᵢ</strong> = expected value of the i-th normal order statistic (Blom's approximation)</li>
                </ul>
                <div class="s-f79949">
                    <strong>📌 Example for first pair (i=1):</strong><br>
                    m<sub>${n}</sub> = Φ⁻¹((${n} − 0.375)/(${n} + 0.25)) = ${normInv((n - 0.375) / (n + 0.25)).toFixed(4)}<br>
                    a₁ = ${aCoeffs[0]?.a_i.toFixed(4) || 'N/A'}
                </div>
            </div>
            
            <h3 class="s-47beab">📖 What is the Shapiro-Wilk Test?</h3>
            <p class="s-d174a2">The Shapiro-Wilk test compares the order statistics of your data to expected normal order statistics.</p>
            <ul class="s-bcb1fd">
                <li><strong>W ≈ 1</strong> → Data is very close to normal</li>
                <li><strong>W significantly < 1</strong> → Data deviates from normality</li>
            </ul>
            <div class="s-bd7624">
                💡 <strong>Formula:</strong> W = (Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ))² / Σ(xᵢ - x̄)²
            </div>
        </div>
        
        <!-- Data Summary -->
        <div class="s-11aa18 gen-grid">
            <div class="s-edbb37">
                <div class="s-42da0a">Sample Size (n)</div>
                <div class="s-abfdfd gen-big">${n}</div>
            </div>
            <div class="s-edbb37">
                <div class="s-42da0a">Sample Mean (x̄)</div>
                <div class="s-c2434f">${mean.toFixed(4)}</div>
            </div>
            <div class="s-edbb37">
                <div class="s-42da0a">Number of Pairs (k)</div>
                <div class="s-c2434f">${Math.floor(n/2)}</div>
            </div>
        </div>
        
        <!-- Step 1: Calculate Sum of Squares -->
        <div class="s-90b704">
            <h3 class="s-c7276c">
                📊 Step 1: Calculate SS = Σ(xᵢ - x̄)² (Denominator)
            </h3>
            <div class="s-a35413">
                <strong>This measures the total variability in the data.</strong> Each value's deviation from the mean is squared and summed.
            </div>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-a756db">i</th>
                        <th class="s-a756db">xᵢ</th>
                        <th class="s-a756db">xᵢ - x̄</th>
                        <th class="s-a756db">(xᵢ - x̄)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${sqDevRows}
                    <tr class="s-767496">
                        <td class="s-c1430c" colspan="3">SS = Σ(xᵢ - x̄)² →</td>
                        <td class="s-ec616e">${ss.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Calculate Numerator -->
        <div class="s-90b704">
            <h3 class="s-c7276c">
                📊 Step 2: Calculate Numerator = Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ)
            </h3>
            <div class="s-a35413">
                <strong>How aᵢ is calculated:</strong> mᵢ = Φ⁻¹((n−i+1−0.375)/(n+0.25)) are approximate expected normal order statistics; aᵢ = mᵢ/√(Σmⱼ²), with Royston's (1992) polynomial correction for the largest coefficients.<br>
                The coefficients are largest for the extreme pairs, which carry the most information about the tails.
            </div>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-a756db">Pair (i)</th>
                        <th class="s-a756db">Coefficient aᵢ (with formula)</th>
                        <th class="s-a756db">xₙ₋ᵢ₊₁ - xᵢ</th>
                        <th class="s-a756db">aᵢ × (xₙ₋ᵢ₊₁ - xᵢ)</th>
                    </tr>
                </thead>
                <tbody>
                    ${coeffRows}
                    <tr class="s-767496">
                        <td class="s-c1430c" colspan="3">Sum = Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ) →</td>
                        <td class="s-ec616e">${numerator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 3: Calculate W Statistic -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 3: Calculate W Statistic</h3>
            <div class="s-6fab3a gen-pad">
                <div class="s-252832">
                    <strong>W = (Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ))² / Σ(xᵢ - x̄)²</strong><br><br>
                    W = (${numerator.toFixed(4)})² / ${ss.toFixed(4)}<br>
                    W = ${(numerator * numerator).toFixed(4)} / ${ss.toFixed(4)}<br>
                    <div class="s-b63603">W = ${w.toFixed(6)}</div>
                </div>
                <div class="s-45c6db">
                    W = 1 means perfect normality | Smaller W indicates deviation from normality
                </div>
            </div>
        </div>
        
        <!-- Step 4: Decision -->
        <div class="${rejectH0 ? 's-830a4f gen-pad' : 's-28eb84 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Step 4: Make Decision</h3>
            <div class="s-f27585">
                <div><strong>W Statistic:</strong> ${w.toFixed(6)}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
                <div><strong>Significance Level (α):</strong> ${alpha}</div>
                <div class="s-c6645b">
                    <strong>Comparison:</strong> p-value ${pValue < alpha ? '<' : '>'} α = ${alpha}<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <!-- W Statistic Scale -->
        <div class="s-44d7a2 gen-pad">
            <h3 class="s-ed0bb5">📊 W Statistic Interpretation Scale</h3>
            <div class="s-546056">
                <div class="s-49b675"></div>
                <div class="s-3d85f1 gen-flex">
                    <span class="s-888a4b">0.90</span>
                    <span class="s-888a4b">0.95</span>
                    <span class="s-888a4b">0.98</span>
                    <span class="s-888a4b">1.00</span>
                </div>
                <div class="s-d7f923 gen-sized">
                    <div class="${rejectH0 ? 's-1fd66a gen-big' : 's-c5b75d gen-big'}">${w.toFixed(4)}</div>
                    <div class="s-67e5d5">W Statistic</div>
                    <div class="s-af5894">
                        ${w > 0.95 ? '✓ Strong evidence of normality' : (w > 0.90 ? '⚠️ Moderate evidence of normality' : '❌ Weak evidence of normality')}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Quick Reference -->
        <div class="s-d7d007">
            <h4 class="s-bca61e">💡 Quick Interpretation Guide</h4>
            <table class="s-306b2c gen-sized">
                <thead><tr class="s-e7b83b"><th class="s-939795">W Value</th><th class="s-939795">Interpretation</th><th class="s-939795">Action</th></tr></thead>
                <tbody>
                    <tr class="s-67f264"><td class="s-641001">> 0.95</td><td class="s-641001">Data is approximately normal</td><td class="s-641001">Use parametric tests</td></tr>
                    <tr class="s-6d64ad"><td class="s-641001">0.90 - 0.95</td><td class="s-641001">Mild deviation from normality</td><td class="s-641001">Proceed with caution</td></tr>
                    <tr class="s-67f264"><td class="s-641001">< 0.90</td><td class="s-641001">Significant deviation from normality</td><td class="s-641001">Use non-parametric tests</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    
    return { W: w, pValue, rejectH0, steps };
}

function setupShapiroWilkLogic() {
    const computeBtn = document.getElementById("swComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("swData").value;
        const data = parseNumbersFromInput(raw);
        const alpha = parseFloat(document.getElementById("swAlpha").value);
        const resultDiv = document.getElementById("swResultArea");
        const valueSpan = document.getElementById("swValueDisplay");
        const stepsSpan = document.getElementById("swStepsDisplay");
        
        const result = computeShapiroWilkTest(data, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `W = ${result.W.toFixed(6)} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("swClearBtn", "swData", "swResultArea");
}
