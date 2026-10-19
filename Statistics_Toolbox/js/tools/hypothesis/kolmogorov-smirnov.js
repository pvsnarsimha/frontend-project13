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
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef; ${isMax ? 'background: #fff3cd;' : ''}">
            <td style="padding: 10px; text-align: center;">${d.i}</td>
            <td style="padding: 10px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${d.i}/${n} = ${d.empirical.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">
                <div><strong>z = ${d.zCalc}</strong></div>
                <div style="font-size: 11px; color: #666;">F(x) = Φ(z) = ${d.theoretical.toFixed(4)}</div>
            </td>
            <td style="padding: 10px; text-align: center; font-weight: 600; ${isMax ? 'color: #dc3545; background: #fff3cd;' : ''}">${d.diff.toFixed(4)}</td>
         </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">D</span>
                <h2 style="margin: 0;">Kolmogorov-Smirnov Test (Normality)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Tests whether a sample comes from a normal distribution</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <!-- Understanding the Test -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 How is F(x) Calculated?</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>Theoretical CDF F(x) for Normal Distribution:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; text-align: center;">
                    <strong>F(x) = Φ(z) = Φ((x - μ) / σ)</strong>
                </div>
                <p style="margin-top: 12px;">Where:</p>
                <ul style="margin-left: 20px;">
                    <li><strong>Φ(z)</strong> = Standard Normal Cumulative Distribution Function</li>
                    <li><strong>z = (x - μ) / σ</strong> = Standardized value (z-score)</li>
                    <li><strong>μ</strong> = Sample mean = <strong>${mean.toFixed(4)}</strong></li>
                    <li><strong>σ</strong> = Sample standard deviation = <strong>${stdDev.toFixed(4)}</strong></li>
                </ul>
                <div style="margin-top: 12px; background: #e8f4f8; padding: 10px; border-radius: 6px; font-size: 13px;">
                    <strong>📌 Example for first value:</strong> x = ${sorted[0].toFixed(4)}<br>
                    z = (${sorted[0].toFixed(4)} - ${mean.toFixed(4)}) / ${stdDev.toFixed(4)} = ${((sorted[0] - mean)/stdDev).toFixed(4)}<br>
                    F(x) = Φ(${((sorted[0] - mean)/stdDev).toFixed(4)}) = ${normalCDF(sorted[0], mean, stdDev).toFixed(4)}
                </div>
            </div>
            
            <h3 style="margin: 16px 0 12px 0; color: #1a5490;">📖 What is the Kolmogorov-Smirnov Test?</h3>
            <p style="margin: 0; line-height: 1.6;">The KS test compares the empirical cumulative distribution of your data to the theoretical normal cumulative distribution.</p>
            <ul style="margin-top: 12px; margin-left: 20px; line-height: 1.6;">
                <li><strong>Fₙ(x)</strong> = Empirical CDF = (rank i) / n (proportion of data ≤ x)</li>
                <li><strong>F(x)</strong> = Theoretical Normal CDF = Φ((x - μ)/σ)</li>
                <li><strong>D statistic</strong> = largest vertical distance between the empirical step function and the normal CDF (checked on both sides of each jump)</li>
                <li><strong>Small D</strong> → Data follows normal distribution closely</li>
                <li><strong>Large D</strong> → Data deviates from normality</li>
            </ul>
            <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 8px; font-size: 13px;">
                💡 <strong>Formula:</strong> D = max over i of max( i/n − F(xᵢ), F(xᵢ) − (i−1)/n )
            </div>
        </div>
        
        <!-- Data Summary -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Mean (x̄ = μ)</div>
                <div style="font-size: 24px; font-weight: 700;">${mean.toFixed(4)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Std Dev (s = σ)</div>
                <div style="font-size: 24px; font-weight: 700;">${stdDev.toFixed(4)}</div>
            </div>
        </div>
        
        <!-- Step 1: Calculation Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Calculate Empirical vs Theoretical CDF
            </h3>
            <div style="padding: 12px 20px; background: #e8f4f8; font-size: 13px;">
                <strong>How each column is calculated:</strong><br>
                • <strong>Fₙ(x)</strong> = i / n (where i is the rank from 1 to n)<br>
                • <strong>z-score</strong> = (x - μ) / σ<br>
                • <strong>F(x)</strong> = Φ(z) = Standard Normal CDF (computed exactly, no table lookup)<br>
                • <strong>Dᵢ</strong> = max( |i/n − F(xᵢ)|, |F(xᵢ) − (i−1)/n| ); the statistic D is the largest Dᵢ
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Rank (i)</th>
                        <th style="padding: 12px;">Value (x)</th>
                        <th style="padding: 12px;">Fₙ(x) = i/n</th>
                        <th style="padding: 12px;">F(x) = Φ((x-μ)/σ)</th>
                        <th style="padding: 12px;">Dᵢ = max(|i/n − F|, |F − (i−1)/n|)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="4" style="padding: 12px; text-align: right;">Maximum D (highlighted in yellow) →</td>
                        <td style="padding: 12px; text-align: center; background: #dc3545; color: white;">${maxDiff.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Critical Value -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Critical Value</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center;">
                    D<sub>critical</sub> (Lilliefors critical value for α = ${alpha}, n = ${n}) = <strong style="color: #1a5490;">${criticalValue.toFixed(4)}</strong>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #6c757d; text-align: center;">
                    Using α = ${alpha} significance level (${(1-alpha)*100}% confidence)
                </div>
            </div>
        </div>
        
        <!-- Step 3: Decision -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 3: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>D Statistic (Maximum Difference):</strong> ${maxDiff.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
                <div><strong>p-value (approximate):</strong> ${pValue.toFixed(6)}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Comparison:</strong> ${maxDiff.toFixed(4)} ${maxDiff > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)}<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <!-- Visual Interpretation -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 Interpretation Guide</h3>
            <div style="text-align: center;">
                <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block; min-width: 200px;">
                    <div style="font-size: 48px; font-weight: 700; color: ${rejectH0 ? '#dc3545' : '#28a745'};">${maxDiff.toFixed(4)}</div>
                    <div style="font-size: 14px;">D Statistic</div>
                    <div style="height: 4px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); margin: 12px 0; border-radius: 2px;"></div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 11px;">Normal</span>
                        <span style="font-size: 11px;">Borderline</span>
                        <span style="font-size: 11px;">Not Normal</span>
                    </div>
                    <div style="margin-top: 12px; font-size: 13px;">
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
