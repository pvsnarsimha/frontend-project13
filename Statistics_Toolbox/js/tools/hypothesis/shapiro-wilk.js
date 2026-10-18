/* ShapiroWilk: shapirowilk tool (render, compute, setup) */

// ========== SHAPIRO-WILK TEST INTERFACE ==========
function renderShapiroWilkInterface() {
    return buildInterface({
        id: "statShapiroWilkInterface",
        title: "W Shapiro-Wilk Test (Normality)",
        formula: "📌 W = (Σ aᵢxᵢ)² / Σ(xᵢ - x̄)²",
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
        sqDevRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${d.value.toFixed(4)} - ${mean.toFixed(4)} = ${d.deviation.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">(${d.deviation.toFixed(4)})² = ${d.squaredDeviation.toFixed(4)}</td>
         </tr>`;
    }
    
    // Build coefficients table with formula
    let coeffRows = '';
    for (let c of aCoeffs) {
        coeffRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${c.i}</td>
            <td style="padding: 8px; text-align: center;">
                <div><strong>${c.a_i.toFixed(4)}</strong></div>
                <div style="font-size: 10px; color: #666;">${c.formula}</div>
            </td>
            <td style="padding: 8px; text-align: center;">${c.upperValue.toFixed(4)} - ${c.lowerValue.toFixed(4)} = ${c.diff.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: #1a5490;">${c.product.toFixed(4)}</td>
         </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">W</span>
                <h2 style="margin: 0;">Shapiro-Wilk Test (Normality)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">The most powerful test for normality</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <!-- Understanding the Test - How aᵢ is calculated -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 How are the Coefficients aᵢ Calculated?</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>The coefficients aᵢ are calculated using the formula:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; text-align: center;">
                    <strong>mᵢ = Φ⁻¹((i − 0.375)/(n + 0.25)), then aᵢ = mᵢ/√(Σmⱼ²) with Royston's polynomial correction for the two largest coefficients</strong>
                </div>
                <p style="margin-top: 12px;">Where:</p>
                <ul style="margin-left: 20px;">
                    <li><strong>i</strong> = the pair number (from 1 to floor(n/2))</li>
                    <li><strong>n</strong> = total sample size = <strong>${n}</strong></li>
                    <li><strong>mᵢ</strong> = expected value of the i-th normal order statistic (Blom's approximation)</li>
                </ul>
                <div style="margin-top: 12px; background: #e8f4f8; padding: 10px; border-radius: 6px; font-size: 13px;">
                    <strong>📌 Example for first pair (i=1):</strong><br>
                    m<sub>${n}</sub> = Φ⁻¹((${n} − 0.375)/(${n} + 0.25)) = ${normInv((n - 0.375) / (n + 0.25)).toFixed(4)}<br>
                    a₁ = ${aCoeffs[0]?.a_i.toFixed(4) || 'N/A'}
                </div>
            </div>
            
            <h3 style="margin: 16px 0 12px 0; color: #1a5490;">📖 What is the Shapiro-Wilk Test?</h3>
            <p style="margin: 0; line-height: 1.6;">The Shapiro-Wilk test compares the order statistics of your data to expected normal order statistics.</p>
            <ul style="margin-top: 12px; margin-left: 20px; line-height: 1.6;">
                <li><strong>W ≈ 1</strong> → Data is very close to normal</li>
                <li><strong>W significantly < 1</strong> → Data deviates from normality</li>
            </ul>
            <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 8px; font-size: 13px;">
                💡 <strong>Formula:</strong> W = (Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ))² / Σ(xᵢ - x̄)²
            </div>
        </div>
        
        <!-- Data Summary -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Mean (x̄)</div>
                <div style="font-size: 24px; font-weight: 700;">${mean.toFixed(4)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Number of Pairs (k)</div>
                <div style="font-size: 24px; font-weight: 700;">${Math.floor(n/2)}</div>
            </div>
        </div>
        
        <!-- Step 1: Calculate Sum of Squares -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Calculate SS = Σ(xᵢ - x̄)² (Denominator)
            </h3>
            <div style="padding: 12px 20px; background: #e8f4f8; font-size: 13px;">
                <strong>This measures the total variability in the data.</strong> Each value's deviation from the mean is squared and summed.
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">i</th>
                        <th style="padding: 10px;">xᵢ</th>
                        <th style="padding: 10px;">xᵢ - x̄</th>
                        <th style="padding: 10px;">(xᵢ - x̄)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${sqDevRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="3" style="padding: 10px; text-align: right;">SS = Σ(xᵢ - x̄)² →</td>
                        <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${ss.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Calculate Numerator -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 2: Calculate Numerator = Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ)
            </h3>
            <div style="padding: 12px 20px; background: #e8f4f8; font-size: 13px;">
                <strong>How aᵢ is calculated:</strong> aᵢ = [i/(n+1)] × [1 - i/(n+1)] × 2<br>
                This formula gives more weight to pairs near the center of the distribution.
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">Pair (i)</th>
                        <th style="padding: 10px;">Coefficient aᵢ (with formula)</th>
                        <th style="padding: 10px;">xₙ₋ᵢ₊₁ - xᵢ</th>
                        <th style="padding: 10px;">aᵢ × (xₙ₋ᵢ₊₁ - xᵢ)</th>
                    </tr>
                </thead>
                <tbody>
                    ${coeffRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="3" style="padding: 10px; text-align: right;">Sum = Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ) →</td>
                        <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${numerator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 3: Calculate W Statistic -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate W Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center;">
                    <strong>W = (Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ))² / Σ(xᵢ - x̄)²</strong><br><br>
                    W = (${numerator.toFixed(4)})² / ${ss.toFixed(4)}<br>
                    W = ${(numerator * numerator).toFixed(4)} / ${ss.toFixed(4)}<br>
                    <div style="font-size: 28px; font-weight: 700; color: #1a5490; margin-top: 12px;">W = ${w.toFixed(6)}</div>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #6c757d; text-align: center;">
                    W = 1 means perfect normality | Smaller W indicates deviation from normality
                </div>
            </div>
        </div>
        
        <!-- Step 4: Decision -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 4: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>W Statistic:</strong> ${w.toFixed(6)}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
                <div><strong>Significance Level (α):</strong> ${alpha}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Comparison:</strong> p-value ${pValue < alpha ? '<' : '>'} α = ${alpha}<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <!-- W Statistic Scale -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 W Statistic Interpretation Scale</h3>
            <div style="text-align: center;">
                <div style="height: 12px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); border-radius: 6px; margin: 16px 0;"></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px;">0.90</span>
                    <span style="font-size: 12px;">0.95</span>
                    <span style="font-size: 12px;">0.98</span>
                    <span style="font-size: 12px;">1.00</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; margin-top: 12px; display: inline-block; min-width: 200px;">
                    <div style="font-size: 48px; font-weight: 700; color: ${rejectH0 ? '#dc3545' : '#28a745'};">${w.toFixed(4)}</div>
                    <div style="font-size: 14px;">W Statistic</div>
                    <div style="margin-top: 8px;">
                        ${w > 0.95 ? '✓ Strong evidence of normality' : (w > 0.90 ? '⚠️ Moderate evidence of normality' : '❌ Weak evidence of normality')}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Quick Reference -->
        <div style="margin-top: 24px; padding: 16px; background: #e8f4f8; border-radius: 12px;">
            <h4 style="margin: 0 0 8px 0; color: #1a5490;">💡 Quick Interpretation Guide</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead><tr style="background: #1a5490; color: white;"><th style="padding: 8px;">W Value</th><th style="padding: 8px;">Interpretation</th><th style="padding: 8px;">Action</th></tr></thead>
                <tbody>
                    <tr style="background: white;"><td style="padding: 8px;">> 0.95</td><td style="padding: 8px;">Data is approximately normal</td><td style="padding: 8px;">Use parametric tests</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 8px;">0.90 - 0.95</td><td style="padding: 8px;">Mild deviation from normality</td><td style="padding: 8px;">Proceed with caution</td></tr>
                    <tr style="background: white;"><td style="padding: 8px;">< 0.90</td><td style="padding: 8px;">Significant deviation from normality</td><td style="padding: 8px;">Use non-parametric tests</td></tr>
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
