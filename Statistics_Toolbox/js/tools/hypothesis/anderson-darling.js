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
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${d.i}</td>
            <td style="padding: 10px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">z = (${d.value.toFixed(4)} - ${mean.toFixed(4)})/${stdDev.toFixed(4)} = ${d.zScore.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">F(x) = Φ(${d.zScore.toFixed(4)}) = ${d.Fx.toFixed(6)}</td>
            <td style="padding: 10px; text-align: center;">(2×${d.i}−1)ln F(x<sub>${d.i}</sub>) = ${d.term1.toFixed(6)}</td>
            <td style="padding: 10px; text-align: center;">(2×${d.i}−1)ln(1−F(x<sub>${n+1-d.i}</sub>)) = ${d.term2.toFixed(6)}</td>
        </td>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">A²</span>
                <h2 style="margin: 0;">Anderson-Darling Test (Normality)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">A powerful normality test with emphasis on tail behavior</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 Understanding the Anderson-Darling Test</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>How it works:</strong></p>
                <ul style="margin-left: 20px; line-height: 1.6;">
                    <li>Compares empirical distribution to normal distribution</li>
                    <li>Gives MORE weight to tails than KS test</li>
                    <li>Better at detecting deviations at distribution extremes</li>
                </ul>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin-top: 12px;">
                    <strong>A² = -n - (1/n) Σ (2i-1)[ln(F(xᵢ)) + ln(1-F(xₙ₋ᵢ₊₁))]</strong>
                </div>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>Interpretation:</strong> Small A² = good fit to normal | Large A² = poor fit
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Mean (x̄)</div>
                <div style="font-size: 20px; font-weight: 700;">${mean.toFixed(4)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Std Dev (s)</div>
                <div style="font-size: 20px; font-weight: 700;">${stdDev.toFixed(4)}</div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Calculate A² Statistic Components
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 8px;">i</th>
                        <th style="padding: 8px;">xᵢ</th>
                        <th style="padding: 8px;">z = (x-μ)/σ</th>
                        <th style="padding: 8px;">F(x) = Φ(z)</th>
                        <th style="padding: 8px;">(2i-1)ln(F)</th>
                        <th style="padding: 8px;">(2(n-i)+1)ln(1-F)</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate A² Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; margin-bottom: 12px;">
                    Σ = ${sum.toFixed(6)}<br>
                    A² = -n - (1/n) × Σ<br>
                    A² = -${n} - (1/${n}) × ${sum.toFixed(6)}<br>
                    A² = -${n} - ${(sum/n).toFixed(6)}<br>
                    <strong style="font-size: 18px;">A² = ${A2.toFixed(6)}</strong>
                </div>
                
                <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #dee2e6;">
                    <strong>Adjusted A² (Stephens, 1974):</strong><br>
                    A²<sub>adj</sub> = A² × (1 + 0.75/n + 2.25/n²)<br>
                    A²<sub>adj</sub> = ${A2.toFixed(6)} × (1 + 0.75/${n} + 2.25/${n*n})<br>
                    A²<sub>adj</sub> = ${A2.toFixed(6)} × ${(1 + 0.75/n + 2.25/(n*n)).toFixed(4)}<br>
                    <strong style="font-size: 18px; color: #1a5490;">A²<sub>adj</sub> = ${adjA2.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Step 3: Compare with Critical Value</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Significance Level (α)</div>
                        <div style="font-size: 28px; font-weight: 700;">${alpha}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Critical Value</div>
                        <div style="font-size: 28px; font-weight: 700; color: #dc3545;">${criticalValue}</div>
                    </div>
                </div>
                <div style="margin-top: 16px; text-align: center;">
                    ${adjA2 > criticalValue ? `A²<sub>adj</sub> (${adjA2.toFixed(4)}) > Critical (${criticalValue})` : `A²<sub>adj</sub> (${adjA2.toFixed(4)}) < Critical (${criticalValue})`}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 4: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>A² Statistic (adjusted):</strong> ${adjA2.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 A² Statistic Scale</h3>
            <div style="text-align: center;">
                <div style="height: 8px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); border-radius: 4px; margin: 12px 0;"></div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 11px;">Good Fit (A²<0.5)</span>
                    <span style="font-size: 11px;">Borderline (0.5-0.75)</span>
                    <span style="font-size: 11px;">Poor Fit (>0.75)</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; margin-top: 16px; display: inline-block; min-width: 200px;">
                    <div style="font-size: 48px; font-weight: 700; color: ${rejectH0 ? '#dc3545' : '#28a745'};">${adjA2.toFixed(4)}</div>
                    <div style="font-size: 14px;">A² Statistic</div>
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
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `A² = ${result.A2.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("adClearBtn", "adData", "adResultArea");
}
