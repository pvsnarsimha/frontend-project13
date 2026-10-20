/* KolmogorovSmirnov: kolmogorovsmirnov tool (render, compute, setup) */

// ========== KOLMOGOROV-SMIRNOV TEST INTERFACE ==========
function renderKolmogorovSmirnovInterface() {
    return buildInterface({
        id: "statKolmogorovSmirnovInterface",
        title: "D Kolmogorov-Smirnov Test (Normality)",
        formula: "📌 D = max over i of max( i/n − F(xᵢ), F(xᵢ) − (i−1)/n )",
        desc: "Tests whether a sample comes from a normal distribution. H₀: Data is normally distributed. Compares empirical vs theoretical CDF.",
        inputs: [
            {
                label: "📋 Enter sample data (comma, space, or line separated):",
                textarea: { id: "ksData", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15, 18, 19, 20" }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "ksAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS
            }
        ],
        run: { id: "ksComputeBtn", text: "D Run Kolmogorov-Smirnov Test + Steps" },
        clear: { id: "ksClearBtn", text: "Clear" },
        result: {
            area: "ksResultArea",
            label: "🎯 KOLMOGOROV-SMIRNOV TEST RESULTS",
            value: "ksValueDisplay",
            steps: "ksStepsDisplay"
        }
    });
}

// ========== KOLMOGOROV-SMIRNOV TEST COMPUTATION ==========
// ========== KOLMOGOROV-SMIRNOV TEST (WITH EXPLANATION OF F(x)) ==========
function computeKolmogorovSmirnovTest(data, alpha) {
    if (!data.length || data.length < 4) {
        return { error: true, message: "Need at least 4 observations for KS test." };
    }
    
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((a,b) => a+b, 0) / n;
    const variance = data.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / (n - 1);   // sample variance (parameters estimated from the data)
    const stdDev = Math.sqrt(variance);
    if (!(stdDev > 0)) {
        return { error: true, message: "All values are identical, so the normality test is undefined (zero variance)." };
    }
    
    let maxDiff = 0;
    let diffs = [];
    let maxIndex = -1;
    
    for (let i = 0; i < n; i++) {
        const empiricalCDF = (i + 1) / n;
        // Calculate z-score for theoretical CDF
        const zScore = (sorted[i] - mean) / stdDev;
        const theoreticalCDF = normalCDF(sorted[i], mean, stdDev);
        // D = max over i of max( i/n - F(x_i), F(x_i) - (i-1)/n ): the ECDF jumps at each point, so both sides count
        const diff = Math.max(Math.abs(empiricalCDF - theoreticalCDF), Math.abs(theoreticalCDF - i / n));
        
        // Store calculation details for display
        const zCalc = `(${sorted[i].toFixed(4)} - ${mean.toFixed(4)}) / ${stdDev.toFixed(4)} = ${zScore.toFixed(4)}`;
        
        diffs.push({ 
            i: i+1,
            value: sorted[i], 
            zScore: zScore,
            zCalc: zCalc,
            empirical: empiricalCDF, 
            theoretical: theoreticalCDF,
            theoreticalFormula: `Φ(${zScore.toFixed(4)})`,
            diff: diff 
        });
        if (diff > maxDiff) {
            maxDiff = diff;
            maxIndex = i;
        }
    }
    
    // The mean and SD are estimated from the data, so the plain Kolmogorov distribution is too conservative.
    // Critical value and p-value come from the Lilliefors null distribution (simulated, seeded, cached per n).
    const criticalValue = lillieforsCritical(alpha, n);
    const rejectH0 = maxDiff > criticalValue;
    const pValue = lillieforsPValue(maxDiff, n);
    
    // Build table rows with formula explanations
    let tableRows = '';
    for (let d of diffs) {
        const isMax = d.diff === maxDiff;
        tableRows += `<tr class="${isMax ? 's-a28558' : 's-00049c'}">
            <td class="s-618bb3">${d.i}</td>
            <td class="s-618bb3">${d.value.toFixed(4)}</td>
            <td class="s-618bb3">${d.i}/${n} = ${d.empirical.toFixed(4)}</td>
            <td class="s-618bb3">
                <div><strong>z = ${d.zCalc}</strong></div>
                <div class="s-8ddc1c">F(x) = Φ(z) = ${d.theoretical.toFixed(4)}</div>
            </td>
            <td class="${isMax ? 's-1f27db' : 's-3c52bb'}">${d.diff.toFixed(4)}</td>
         </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <!-- Header -->
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">D</span>
                <h2 class="s-f8a94d">Kolmogorov-Smirnov Test (Normality)</h2>
            </div>
            <p class="s-259079">Tests whether a sample comes from a normal distribution</p>
            <p class="s-20a400">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <!-- Understanding the Test -->
        <div class="s-42ccf7 gen-pad">
            <h3 class="s-ed0bb5">📖 How is F(x) Calculated?</h3>
            <div class="s-3a063a">
                <p class="s-7dacb1"><strong>Theoretical CDF F(x) for Normal Distribution:</strong></p>
                <div class="s-000adc">
                    <strong>F(x) = Φ(z) = Φ((x - μ) / σ)</strong>
                </div>
                <p class="s-5e70e1">Where:</p>
                <ul class="s-d06bdc">
                    <li><strong>Φ(z)</strong> = Standard Normal Cumulative Distribution Function</li>
                    <li><strong>z = (x - μ) / σ</strong> = Standardized value (z-score)</li>
                    <li><strong>μ</strong> = Sample mean = <strong>${mean.toFixed(4)}</strong></li>
                    <li><strong>σ</strong> = Sample standard deviation = <strong>${stdDev.toFixed(4)}</strong></li>
                </ul>
                <div class="s-f79949">
                    <strong>📌 Example for first value:</strong> x = ${sorted[0].toFixed(4)}<br>
                    z = (${sorted[0].toFixed(4)} - ${mean.toFixed(4)}) / ${stdDev.toFixed(4)} = ${((sorted[0] - mean)/stdDev).toFixed(4)}<br>
                    F(x) = Φ(${((sorted[0] - mean)/stdDev).toFixed(4)}) = ${normalCDF(sorted[0], mean, stdDev).toFixed(4)}
                </div>
            </div>
            
            <h3 class="s-47beab">📖 What is the Kolmogorov-Smirnov Test?</h3>
            <p class="s-d174a2">The KS test compares the empirical cumulative distribution of your data to the theoretical normal cumulative distribution.</p>
            <ul class="s-bcb1fd">
                <li><strong>Fₙ(x)</strong> = Empirical CDF = (rank i) / n (proportion of data ≤ x)</li>
                <li><strong>F(x)</strong> = Theoretical Normal CDF = Φ((x - μ)/σ)</li>
                <li><strong>D statistic</strong> = largest vertical distance between the empirical step function and the normal CDF (checked on both sides of each jump)</li>
                <li><strong>Small D</strong> → Data follows normal distribution closely</li>
                <li><strong>Large D</strong> → Data deviates from normality</li>
            </ul>
            <div class="s-bd7624">
                💡 <strong>Formula:</strong> D = max over i of max( i/n − F(xᵢ), F(xᵢ) − (i−1)/n )
            </div>
        </div>
        
        <!-- Data Summary -->
        <div class="s-11aa18 gen-grid">
            <div class="s-edbb37">
                <div class="s-42da0a">Sample Size (n)</div>
                <div class="s-abfdfd gen-big">${n}</div>
            </div>
            <div class="s-edbb37">
                <div class="s-42da0a">Sample Mean (x̄ = μ)</div>
                <div class="s-c2434f">${mean.toFixed(4)}</div>
            </div>
            <div class="s-edbb37">
                <div class="s-42da0a">Sample Std Dev (s = σ)</div>
                <div class="s-c2434f">${stdDev.toFixed(4)}</div>
            </div>
        </div>
        
        <!-- Step 1: Calculation Table -->
        <div class="s-90b704">
            <h3 class="s-c7276c">
                📊 Step 1: Calculate Empirical vs Theoretical CDF
            </h3>
            <div class="s-a35413">
                <strong>How each column is calculated:</strong><br>
                • <strong>Fₙ(x)</strong> = i / n (where i is the rank from 1 to n)<br>
                • <strong>z-score</strong> = (x - μ) / σ<br>
                • <strong>F(x)</strong> = Φ(z) = Standard Normal CDF (computed exactly, no table lookup)<br>
                • <strong>Dᵢ</strong> = max( |i/n − F(xᵢ)|, |F(xᵢ) − (i−1)/n| ); the statistic D is the largest Dᵢ
            </div>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-d66e1c">Rank (i)</th>
                        <th class="s-d66e1c">Value (x)</th>
                        <th class="s-d66e1c">Fₙ(x) = i/n</th>
                        <th class="s-d66e1c">F(x) = Φ((x-μ)/σ)</th>
                        <th class="s-d66e1c">Dᵢ = max(|i/n − F|, |F − (i−1)/n|)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="s-767496">
                        <td class="s-6ecd26" colspan="4">Maximum D (highlighted in yellow) →</td>
                        <td class="s-df2ba7">${maxDiff.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Critical Value -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 2: Calculate Critical Value</h3>
            <div class="s-6025fc">
                <div class="s-252832">
                    D<sub>critical</sub> (Lilliefors critical value for α = ${alpha}, n = ${n}) = <strong class="s-f342b5">${criticalValue.toFixed(4)}</strong>
                </div>
                <div class="s-45c6db">
                    Using α = ${alpha} significance level (${(1-alpha)*100}% confidence)
                </div>
            </div>
        </div>
        
        <!-- Step 3: Decision -->
        <div class="${rejectH0 ? 's-830a4f gen-pad' : 's-28eb84 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Step 3: Make Decision</h3>
            <div class="s-f27585">
                <div><strong>D Statistic (Maximum Difference):</strong> ${maxDiff.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
                <div><strong>p-value (approximate):</strong> ${pValue.toFixed(6)}</div>
                <div class="s-c6645b">
                    <strong>Comparison:</strong> ${maxDiff.toFixed(4)} ${maxDiff > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)}<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <!-- Visual Interpretation -->
        <div class="s-44d7a2 gen-pad">
            <h3 class="s-ed0bb5">📊 Interpretation Guide</h3>
            <div class="s-546056">
                <div class="s-92bac6 gen-pad gen-sized">
                    <div class="${rejectH0 ? 's-1fd66a gen-big' : 's-c5b75d gen-big'}">${maxDiff.toFixed(4)}</div>
                    <div class="s-67e5d5">D Statistic</div>
                    <div class="s-2c893c"></div>
                    <div class="s-e19eba gen-flex">
                        <span class="s-fb8dcc">Normal</span>
                        <span class="s-fb8dcc">Borderline</span>
                        <span class="s-fb8dcc">Not Normal</span>
                    </div>
                    <div class="s-f89ee5">
                        Critical Value: <strong>${criticalValue.toFixed(4)}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    return { D: maxDiff, criticalValue, pValue, rejectH0, steps };
}

function setupKolmogorovSmirnovLogic() {
    const computeBtn = document.getElementById("ksComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("ksData").value;
        const data = parseNumbersFromInput(raw);
        const alpha = parseFloat(document.getElementById("ksAlpha").value);
        const resultDiv = document.getElementById("ksResultArea");
        const valueSpan = document.getElementById("ksValueDisplay");
        const stepsSpan = document.getElementById("ksStepsDisplay");
        
        const result = computeKolmogorovSmirnovTest(data, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `D = ${result.D.toFixed(6)} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("ksClearBtn", "ksData", "ksResultArea");
}
