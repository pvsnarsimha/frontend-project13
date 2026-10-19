/* QQPlot: qqplot tool (render, compute, setup) */

function renderQQPlotInterface() {
    return buildInterface({
        id: "statQQPlotInterface",
        title: "📈 Q-Q Plot (Quantile-Quantile Plot)",
        card: [
            { formula: "📌 Compares sample quantiles against theoretical normal quantiles" },
            {
                desc: "<strong>What is a Q-Q Plot?</strong><br>\n                    A Q-Q plot compares the distribution of your data to a theoretical normal distribution.\n                    If the points fall approximately along a straight diagonal line, the data is likely normally distributed."
            },
            {
                desc: "<strong>Interpretation:</strong><br>\n                    • <span style=\"color: #28a745;\">Points follow the line</span> → Data is normally distributed<br>\n                    • <span style=\"color: #dc3545;\">S-shaped curve</span> → Heavy tails or light tails<br>\n                    • <span style=\"color: #ffc107;\">Curved pattern</span> → Skewed distribution",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated):",
                textarea: { id: "qqplotInput", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33" }
            }
        ],
        run: { id: "qqplotComputeBtn", text: "📈 Generate Q-Q Plot + Full Steps" },
        clear: { id: "qqplotClearBtn", text: "Clear" },
        result: {
            area: "qqplotResultArea",
            label: "🎯 Q-Q PLOT RESULTS",
            value: "qqplotValueDisplay",
            steps: "qqplotStepsDisplay"
        }
    });
}

function computeQQPlotWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const n = numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mean = numbers.reduce((a,b) => a+b, 0) / n;
    const variance = numbers.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // FIXED CONSTANTS (from Abramowitz & Stegun 1972)
    const CENTRAL_A5 = 2.506628277459239e+00;
    const CENTRAL_A4 = -3.066479806614716e+01;
    const CENTRAL_A3 = 1.383577518672690e+02;
    const CENTRAL_A2 = -2.759285104961687e+02;
    const CENTRAL_A1 = 2.209460984245205e+02;
    const CENTRAL_A0 = -3.969683028665376e+01;
    
    const CENTRAL_B4 = -1.328068155288572e+01;
    const CENTRAL_B3 = 6.680131188771972e+01;
    const CENTRAL_B2 = -1.556989798598866e+02;
    const CENTRAL_B1 = 1.615858368580409e+02;
    const CENTRAL_B0 = -5.447609879822406e+01;
    
    const TAIL_C5 = 2.938163982698783e+00;
    const TAIL_C4 = 4.374664141464968e+00;
    const TAIL_C3 = -2.549732539343734e+00;
    const TAIL_C2 = -2.400758277161838e+00;
    const TAIL_C1 = -3.223964580411365e-01;
    const TAIL_C0 = -7.784894002430293e-03;
    
    const TAIL_D3 = 3.754408661907416e+00;
    const TAIL_D2 = 2.445134137142996e+00;
    const TAIL_D1 = 3.224671290700398e-01;
    const TAIL_D0 = 7.784695709041462e-03;
    
    const theoreticalQuantiles = [];
    const sampleQuantiles = [];
    const calculationDetails = [];
    
    for (let i = 0; i < n; i++) {
        const p = (i + 1 - 0.375) / (n + 0.25);
        const q = p - 0.5;
        let z;
        let calculationType = "";
        let detailedSteps = "";
        
        if (p <= 0) {
            z = -Infinity;
            detailedSteps = "p = 0 → z = -∞";
        } else if (p >= 1) {
            z = Infinity;
            detailedSteps = "p = 1 → z = +∞";
        } else {
            if (Math.abs(q) <= 0.425) {
                calculationType = "central";
                const r = 0.180625 - q * q;
                
                detailedSteps = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                detailedSteps += `📊 CENTRAL REGION CALCULATION (|q| ≤ 0.425)\n`;
                detailedSteps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                detailedSteps += `📌 INPUT VALUES:\n`;
                detailedSteps += `   i = ${i+1}, p = ${p.toFixed(6)}, q = ${q.toFixed(6)}\n\n`;
                detailedSteps += `🔢 Step 1: Calculate r = 0.180625 - q²\n`;
                detailedSteps += `   q² = (${q.toFixed(6)})² = ${(q*q).toFixed(10)}\n`;
                detailedSteps += `   r = 0.180625 - ${(q*q).toFixed(10)} = ${r.toFixed(10)}\n\n`;
                
                const r2 = r * r;
                const r3 = r2 * r;
                const r4 = r3 * r;
                const r5 = r4 * r;
                
                const term5 = CENTRAL_A5 * r5;
                const term4 = CENTRAL_A4 * r4;
                const term3 = CENTRAL_A3 * r3;
                const term2 = CENTRAL_A2 * r2;
                const term1 = CENTRAL_A1 * r;
                const term0 = CENTRAL_A0;
                
                const P = term5 + term4 + term3 + term2 + term1 + term0;
                
                detailedSteps += `📐 Step 2: Calculate P(r) = a₅·r⁵ + a₄·r⁴ + a₃·r³ + a₂·r² + a₁·r + a₀\n`;
                detailedSteps += `   r = ${r.toFixed(8)}\n`;
                detailedSteps += `   r² = ${r2.toFixed(8)}\n`;
                detailedSteps += `   r³ = ${r3.toFixed(8)}\n`;
                detailedSteps += `   r⁴ = ${r4.toFixed(8)}\n`;
                detailedSteps += `   r⁵ = ${r5.toFixed(8)}\n\n`;
                detailedSteps += `   a₅·r⁵ = ${CENTRAL_A5.toFixed(4)} × ${r5.toExponential(6)} = ${term5.toExponential(8)}\n`;
                detailedSteps += `   a₄·r⁴ = ${CENTRAL_A4.toFixed(4)} × ${r4.toExponential(6)} = ${term4.toExponential(8)}\n`;
                detailedSteps += `   a₃·r³ = ${CENTRAL_A3.toFixed(4)} × ${r3.toExponential(6)} = ${term3.toExponential(8)}\n`;
                detailedSteps += `   a₂·r² = ${CENTRAL_A2.toFixed(4)} × ${r2.toExponential(6)} = ${term2.toExponential(8)}\n`;
                detailedSteps += `   a₁·r  = ${CENTRAL_A1.toFixed(4)} × ${r.toExponential(6)} = ${term1.toExponential(8)}\n`;
                detailedSteps += `   a₀    = ${CENTRAL_A0.toFixed(4)}\n`;
                detailedSteps += `   P(r) = ${P.toExponential(10)}\n\n`;
                
                const qterm4 = CENTRAL_B4 * r4;
                const qterm3 = CENTRAL_B3 * r3;
                const qterm2 = CENTRAL_B2 * r2;
                const qterm1 = CENTRAL_B1 * r;
                const qterm0 = CENTRAL_B0;
                
                const Q = qterm4 + qterm3 + qterm2 + qterm1 + qterm0;
                
                detailedSteps += `📐 Step 3: Calculate Q(r) = b₄·r⁴ + b₃·r³ + b₂·r² + b₁·r + b₀\n`;
                detailedSteps += `   b₄·r⁴ = ${CENTRAL_B4.toFixed(4)} × ${r4.toExponential(6)} = ${qterm4.toExponential(8)}\n`;
                detailedSteps += `   b₃·r³ = ${CENTRAL_B3.toFixed(4)} × ${r3.toExponential(6)} = ${qterm3.toExponential(8)}\n`;
                detailedSteps += `   b₂·r² = ${CENTRAL_B2.toFixed(4)} × ${r2.toExponential(6)} = ${qterm2.toExponential(8)}\n`;
                detailedSteps += `   b₁·r  = ${CENTRAL_B1.toFixed(4)} × ${r.toExponential(6)} = ${qterm1.toExponential(8)}\n`;
                detailedSteps += `   b₀    = ${CENTRAL_B0.toFixed(4)}\n`;
                detailedSteps += `   Q(r) = ${Q.toExponential(10)}\n\n`;
                
                const P_over_Q = P / Q;
                z = q * P_over_Q;
                
                detailedSteps += `📐 Step 4: Calculate z = q × P(r) / Q(r)\n`;
                detailedSteps += `   P(r)/Q(r) = ${P.toExponential(8)} / ${Q.toExponential(8)} = ${P_over_Q.toExponential(10)}\n`;
                detailedSteps += `   z = ${q.toFixed(6)} × ${P_over_Q.toExponential(10)} = ${z.toFixed(10)}\n\n`;
                detailedSteps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                detailedSteps += `✅ FINAL z = ${z.toFixed(10)}\n`;
                
            } else {
                calculationType = "tail";
                
                detailedSteps = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                detailedSteps += `📈 TAIL REGION CALCULATION (|q| > 0.425)\n`;
                detailedSteps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                detailedSteps += `📌 INPUT VALUES:\n`;
                detailedSteps += `   i = ${i+1}, p = ${p.toFixed(6)}, q = ${q.toFixed(6)}\n\n`;
                
                detailedSteps += `🔢 Step 1: Calculate r\n`;
                let r;
                if (q < 0) {
                    r = Math.sqrt(-Math.log(p));
                    detailedSteps += `   Since q = ${q.toFixed(6)} < 0 (lower tail):\n`;
                    detailedSteps += `   r = √[-ln(p)] = √[-ln(${p.toFixed(6)})]\n`;
                    detailedSteps += `   -ln(${p.toFixed(6)}) = ${(-Math.log(p)).toFixed(10)}\n`;
                    detailedSteps += `   r = √${(-Math.log(p)).toFixed(10)} = ${r.toFixed(10)}\n\n`;
                } else {
                    r = Math.sqrt(-Math.log(1 - p));
                    detailedSteps += `   Since q = ${q.toFixed(6)} > 0 (upper tail):\n`;
                    detailedSteps += `   r = √[-ln(1-p)] = √[-ln(${(1-p).toFixed(6)})]\n`;
                    detailedSteps += `   -ln(${(1-p).toFixed(6)}) = ${(-Math.log(1-p)).toFixed(10)}\n`;
                    detailedSteps += `   r = √${(-Math.log(1-p)).toFixed(10)} = ${r.toFixed(10)}\n\n`;
                }
                
                const r2 = r * r;
                const r3 = r2 * r;
                const r4 = r3 * r;
                const r5 = r4 * r;
                
                detailedSteps += `📐 Step 2: Calculate P(r) = c₅·r⁵ + c₄·r⁴ + c₃·r³ + c₂·r² + c₁·r + c₀\n`;
                detailedSteps += `   r = ${r.toFixed(8)}\n`;
                detailedSteps += `   r² = ${r2.toFixed(8)}\n`;
                detailedSteps += `   r³ = ${r3.toFixed(8)}\n`;
                detailedSteps += `   r⁴ = ${r4.toFixed(8)}\n`;
                detailedSteps += `   r⁵ = ${r5.toFixed(8)}\n\n`;
                
                const term5 = TAIL_C5 * r5;
                const term4 = TAIL_C4 * r4;
                const term3 = TAIL_C3 * r3;
                const term2 = TAIL_C2 * r2;
                const term1 = TAIL_C1 * r;
                const term0 = TAIL_C0;
                
                const P = term5 + term4 + term3 + term2 + term1 + term0;
                
                detailedSteps += `   c₅·r⁵ = ${TAIL_C5.toFixed(4)} × ${r5.toExponential(6)} = ${term5.toExponential(8)}\n`;
                detailedSteps += `   c₄·r⁴ = ${TAIL_C4.toFixed(4)} × ${r4.toExponential(6)} = ${term4.toExponential(8)}\n`;
                detailedSteps += `   c₃·r³ = ${TAIL_C3.toFixed(4)} × ${r3.toExponential(6)} = ${term3.toExponential(8)}\n`;
                detailedSteps += `   c₂·r² = ${TAIL_C2.toFixed(4)} × ${r2.toExponential(6)} = ${term2.toExponential(8)}\n`;
                detailedSteps += `   c₁·r  = ${TAIL_C1.toFixed(4)} × ${r.toExponential(6)} = ${term1.toExponential(8)}\n`;
                detailedSteps += `   c₀    = ${TAIL_C0.toFixed(4)}\n`;
                detailedSteps += `   P(r) = ${P.toExponential(10)}\n\n`;
                
                detailedSteps += `📐 Step 3: Calculate Q(r) = d₃·r³ + d₂·r² + d₁·r + d₀\n`;
                const qterm3 = TAIL_D3 * r3;
                const qterm2 = TAIL_D2 * r2;
                const qterm1 = TAIL_D1 * r;
                const qterm0 = TAIL_D0;
                
                const Q = qterm3 + qterm2 + qterm1 + qterm0;
                
                detailedSteps += `   d₃·r³ = ${TAIL_D3.toFixed(4)} × ${r3.toExponential(6)} = ${qterm3.toExponential(8)}\n`;
                detailedSteps += `   d₂·r² = ${TAIL_D2.toFixed(4)} × ${r2.toExponential(6)} = ${qterm2.toExponential(8)}\n`;
                detailedSteps += `   d₁·r  = ${TAIL_D1.toFixed(4)} × ${r.toExponential(6)} = ${qterm1.toExponential(8)}\n`;
                detailedSteps += `   d₀    = ${TAIL_D0.toFixed(4)}\n`;
                detailedSteps += `   Q(r) = ${Q.toExponential(10)}\n\n`;
                
                let raw_z = P / Q;
                z = raw_z;
                if (q < 0) z = -z;
                
                detailedSteps += `📐 Step 4: Calculate z = P(r) / Q(r) (sign adjusted)\n`;
                detailedSteps += `   P(r)/Q(r) = ${P.toExponential(8)} / ${Q.toExponential(8)} = ${raw_z.toExponential(10)}\n`;
                if (q < 0) {
                    detailedSteps += `   Since q < 0 (lower tail), z = -${raw_z.toExponential(10)} = ${z.toFixed(10)}\n`;
                } else {
                    detailedSteps += `   Since q > 0 (upper tail), z = ${raw_z.toExponential(10)} = ${z.toFixed(10)}\n`;
                }
                detailedSteps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                detailedSteps += `✅ FINAL z = ${z.toFixed(10)}\n`;
            }
        }
        
        theoreticalQuantiles.push(z);
        sampleQuantiles.push(sorted[i]);
        
        calculationDetails.push({
            i: i + 1,
            value: sorted[i],
            probability: p.toFixed(6),
            q: q.toFixed(6),
            zScore: z.toFixed(6),
            calculationType: calculationType,
            detailedSteps: detailedSteps
        });
    }
    
    // Calculate correlation coefficient
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    let xyDetails = [];
    
    for (let i = 0; i < n; i++) {
        const x = theoreticalQuantiles[i];
        const y = sampleQuantiles[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
        xyDetails.push({
            i: i + 1,
            x: x.toFixed(6),
            y: y.toFixed(4),
            xy: (x * y).toFixed(6),
            x2: (x * x).toFixed(6),
            y2: (y * y).toFixed(4)
        });
    }
    
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = sumXY - n * meanX * meanY;
    const denominator = Math.sqrt((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY));
    const correlation = numerator / denominator;
    
    // Build ALL correlation rows (no truncation!)
    let allCorrRows = '';
    for (let d of xyDetails) {
        allCorrRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${d.i}</td>
            <td style="padding: 8px; text-align: center; font-family: monospace;">${d.x}</td>
            <td style="padding: 8px; text-align: center; font-family: monospace;">${d.y}</td>
            <td style="padding: 8px; text-align: center;">${d.xy}</td>
            <td style="padding: 8px; text-align: center;">${d.x2}</td>
            <td style="padding: 8px; text-align: center;">${d.y2}</td>
        </tr>`;
    }
    
    // Build ALL calculation rows with expandable details (no truncation!)
    let allCalcRows = '';
    for (let d of calculationDetails) {
        let typeLabel = d.calculationType === "central" ? "📊 Central" : (d.calculationType === "tail" ? "📈 Tail" : "⚪ Edge");
        allCalcRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${d.i}</td>
            <td style="padding: 8px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${d.probability}</td>
            <td style="padding: 8px; text-align: center;">${d.q}</td>
            <td style="padding: 8px; text-align: center;">
                <details>
                    <summary style="cursor: pointer; display: inline-block; font-weight: bold; color: #1a5490;">${d.zScore}</summary>
                    <div style="background: #f8f9fa; padding: 15px; margin-top: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; white-space: pre-wrap; text-align: left; max-height: 400px; overflow-y: auto;">
                        ${d.detailedSteps.replace(/\n/g, '<br>')}
                    </div>
                </details>
                <span style="font-size: 10px; color: #666;">(${typeLabel})</span>
            </td>
        </tr>`;
    }
    
    let steps = `
<div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 48px;">📈</span>
                    <div>
                        <h1 style="margin: 0; font-size: 28px;">Q-Q Plot Analysis</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Quantile-Quantile Plot for Normality Assessment</p>
                    </div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.8;">SAMPLE SIZE</div>
                <div style="font-size: 36px; font-weight: 700;">${n}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #28a745;">
            <div style="font-size: 11px; color: #6c757d;">MEAN</div>
            <div style="font-size: 24px; font-weight: 700; color: #28a745;">${mean.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">STD DEVIATION</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${stdDev.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #ffc107;">
            <div style="font-size: 11px; color: #6c757d;">CORRELATION</div>
            <div style="font-size: 24px; font-weight: 700; color: #ffc107;">${correlation.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #1a5490;">
            <div style="font-size: 11px; color: #6c757d;">RANGE</div>
            <div style="font-size: 24px; font-weight: 700;">${(Math.max(...numbers) - Math.min(...numbers)).toFixed(4)}</div>
        </div>
    </div>
    
    <!-- Step 1: Understanding Q-Q Plot -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">1</span>
            📖 Understanding Q-Q Plots
        </h2>
        
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <p><strong>What is a Q-Q Plot?</strong> A Quantile-Quantile plot compares the quantiles of your data against the quantiles of a theoretical normal distribution.</p>
            
            <div style="margin: 15px 0; padding: 12px; background: #e8f4f8; border-radius: 8px;">
                <strong>📐 How to interpret:</strong><br>
                • <span style="color: #28a745;">Points follow the diagonal line</span> → Data is normally distributed<br>
                • <span style="color: #dc3545;">S-shaped pattern</span> → Heavy tails (more outliers than normal)<br>
                • <span style="color: #ffc107;">Curved upward/downward</span> → Skewed distribution<br>
                • <span style="color: #17a2b8;">Correlation near 1</span> → Strong evidence of normality
            </div>
            
            <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                <strong>💡 Formula for probability positions (Blom's method):</strong><br>
                p = (i - 0.375) / (n + 0.25)<br>
                where i = rank (1 to n), n = sample size<br><br>
                <strong>Then calculate:</strong> q = p - 0.5
            </div>
        </div>
    </div>
    
    <!-- Step 2: Calculation Table (ALL rows - scrollable) -->
    <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="background: #1a5490; color: white; padding: 14px 20px;">
            <h2 style="margin: 0; font-size: 16px;">🔢 Step 2: Quantile Calculations (All ${n} Data Points)</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">For each data point: p = (i - 0.375)/(n + 0.25) → q = p - 0.5 → z = Φ⁻¹(p)</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;"><strong>👇 Click on any z-value to see the complete step-by-step calculation!</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.8;">📌 Scroll horizontally if needed | ${n} total observations</p>
        </div>
        <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e9ecef; position: sticky; top: 0; z-index: 10;">
                        <th style="padding: 12px; background: #e9ecef;">Rank (i)</th>
                        <th style="padding: 12px; background: #e9ecef;">Sample Value (x)</th>
                        <th style="padding: 12px; background: #e9ecef;">Probability p</th>
                        <th style="padding: 12px; background: #e9ecef;">q = p - 0.5</th>
                        <th style="padding: 12px; background: #e9ecef;">Theoretical Quantile (z) - Click to see calculation</th>
                    </tr>
                </thead>
                <tbody>
                    ${allCalcRows}
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Step 3: Detailed Correlation Calculation (ALL rows) -->
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">3</span>
            📊 Step-by-Step Correlation Calculation (All ${n} Data Points)
        </h2>
        
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <p><strong>Formula:</strong> r = Σ(z - z̄)(x - x̄) / √[Σ(z - z̄)² × Σ(x - x̄)²]</p>
            
            <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #1a5490; color: white; position: sticky; top: 0;">
                            <th style="padding: 8px;">i</th>
                            <th style="padding: 8px;">z (Theoretical)</th>
                            <th style="padding: 8px;">x (Sample)</th>
                            <th style="padding: 8px;">z × x</th>
                            <th style="padding: 8px;">z²</th>
                            <th style="padding: 8px;">x²</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allCorrRows}
                        <tr style="background: #e9ecef; font-weight: bold;">
                            <td style="padding: 8px;">SUM →</td>
                            <td style="padding: 8px; text-align: center;">${sumX.toFixed(4)}</td>
                            <td style="padding: 8px; text-align: center;">${sumY.toFixed(4)}</td>
                            <td style="padding: 8px; text-align: center;">${sumXY.toFixed(4)}</td>
                            <td style="padding: 8px; text-align: center;">${sumX2.toFixed(4)}</td>
                            <td style="padding: 8px; text-align: center;">${sumY2.toFixed(4)}</td>
                        </table>
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>📐 Step 3a: Calculate means</strong><br>
                z̄ = Σz / n = ${sumX.toFixed(4)} / ${n} = ${meanX.toFixed(6)}<br>
                x̄ = Σx / n = ${sumY.toFixed(4)} / ${n} = ${meanY.toFixed(6)}
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>📐 Step 3b: Calculate numerator (Covariance sum)</strong><br>
                Σ(z - z̄)(x - x̄) = Σzx - n·z̄·x̄<br>
                = ${sumXY.toFixed(4)} - ${n} × ${meanX.toFixed(6)} × ${meanY.toFixed(6)}<br>
                = ${sumXY.toFixed(4)} - ${(n * meanX * meanY).toFixed(4)}<br>
                = <strong style="color: #1a5490;">${numerator.toFixed(6)}</strong>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>📐 Step 3c: Calculate denominator</strong><br>
                Σ(z - z̄)² = Σz² - n·z̄² = ${sumX2.toFixed(4)} - ${n} × ${(meanX * meanX).toFixed(6)} = ${(sumX2 - n * meanX * meanX).toFixed(6)}<br>
                Σ(x - x̄)² = Σx² - n·x̄² = ${sumY2.toFixed(4)} - ${n} × ${(meanY * meanY).toFixed(6)} = ${(sumY2 - n * meanY * meanY).toFixed(6)}<br>
                Product = ${(sumX2 - n * meanX * meanX).toFixed(6)} × ${(sumY2 - n * meanY * meanY).toFixed(6)} = ${((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY)).toFixed(6)}<br>
                √Product = ${denominator.toFixed(6)}
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #d4edda; border-radius: 8px;">
                <strong>📐 Step 3d: Calculate correlation</strong><br>
                r = ${numerator.toFixed(6)} / ${denominator.toFixed(6)}<br>
                <div style="font-size: 24px; text-align: center; padding: 10px;">
                    <strong style="color: #1a5490;">r = ${correlation.toFixed(8)}</strong>
                </div>
                <strong>Interpretation:</strong> ${Math.abs(correlation) > 0.98 ? '✅ Very strong linear relationship → Data appears normally distributed' : (Math.abs(correlation) > 0.95 ? '⚠️ Moderate relationship → Possible mild deviation from normality' : '❌ Weak relationship → Data likely NOT normally distributed')}
            </div>
        </div>
    </div>
    
    <!-- Step 4: Q-Q Plot Visualization -->
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%); border-radius: 20px; padding: 25px; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #4fc3f7; padding-bottom: 15px;">
            <span style="font-size: 28px;">📈</span>
            <h3 style="margin: 0; color: #4fc3f7;">Q-Q PLOT VISUALIZATION</h3>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #b39ddb;">💡 Hover over points to see values | Points should follow the red line for normality</p>
        </div>
        
        <canvas id="qqplotChartCanvas" style="max-height: 500px; width: 100%; margin-top: 10px;"></canvas>
        
        <div style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: #4fc3f7; border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">Sample Quantiles</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 20px; height: 2px; background: #ef5350;"></div><span style="color: #e6edf3; font-size: 11px;">Theoretical Line (y = x̄ + z·s)</span></div>
        </div>
    </div>
    
    <!-- Step 5: Interpretation -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 25px;">
        <h2 style="color: #1a5490; margin-top: 0;">📌 Final Interpretation</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Normality Assessment:</strong><br>
                • Correlation with theoretical line: ${(correlation * 100).toFixed(1)}%<br>
                • ${Math.abs(correlation) > 0.98 ? '✅ Data appears normally distributed' : (Math.abs(correlation) > 0.95 ? '⚠️ Data shows mild deviation from normality' : '❌ Data is likely NOT normally distributed')}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>What to look for in the plot:</strong><br>
                • Points close to red line → Good fit<br>
                • S-curve → Heavy tails<br>
                • Curved pattern → Skewness
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Recommended next steps:</strong><br>
                ${Math.abs(correlation) > 0.98 ? '✓ Use parametric tests (t-test, ANOVA, etc.)' : '⚠️ Consider non-parametric alternatives or data transformation'}
            </div>
        </div>
    </div>
</div>`;
    
    return { 
        steps, 
        theoreticalQuantiles, 
        sampleQuantiles, 
        correlation, 
        mean, 
        stdDev, 
        n,
        sorted
    };
}

function renderQQPlotChart(stats) {
    if (!chartJsReady(renderQQPlotChart, arguments)) return;
    const canvas = document.getElementById('qqplotChartCanvas');
    if (!canvas) return;
    labelChart(canvas, `Normal Q-Q plot of ${describeSample(stats.sorted)}. Sample quantiles are plotted against theoretical normal quantiles; points near the reference line mean the data are close to normal.`);
    
    if (qqplotChart) qqplotChart.destroy();
    
    const { theoreticalQuantiles, sampleQuantiles, mean, stdDev, sorted } = stats;
    
    // Create points for the theoretical line
    const minZ = Math.min(...theoreticalQuantiles);
    const maxZ = Math.max(...theoreticalQuantiles);
    const linePoints = [
        { x: minZ, y: mean + stdDev * minZ },
        { x: maxZ, y: mean + stdDev * maxZ }
    ];
    
    const ctx = canvas.getContext('2d');
    
    qqplotChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Sample Quantiles',
                    data: theoreticalQuantiles.map((z, i) => ({ x: z, y: sampleQuantiles[i] })),
                    backgroundColor: '#4fc3f7',
                    borderColor: '#4fc3f7',
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    pointStyle: 'circle',
                    showLine: false
                },
                {
                    label: 'Theoretical Normal Line',
                    data: linePoints,
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#ef5350',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    fill: false,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Q-Q Plot (n = ${stats.n}) | Correlation = ${stats.correlation.toFixed(4)}`,
                    font: { size: 14, weight: 'bold', family: "'Segoe UI', sans-serif" },
                    color: '#e6edf3',
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return [
                                `Theoretical Quantile (z): ${context.parsed.x.toFixed(4)}`,
                                `Sample Quantile: ${context.parsed.y.toFixed(4)}`
                            ];
                        }
                    },
                    backgroundColor: '#1a5490',
                    titleColor: 'white',
                    bodyColor: 'white'
                },
                legend: { 
                    position: 'top',
                    labels: { color: '#e6edf3', font: { size: 11 } }
                }
            },
            scales: {
                x: {
                    title: { 
                        display: true, 
                        text: 'Theoretical Quantiles (Standard Normal)', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { color: '#e6edf3', font: { size: 11 } }
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Sample Quantiles', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { color: '#e6edf3', font: { size: 11 } }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 50,
                    right: 50
                }
            }
        }
    });
}

function setupQQPlotLogic() {
    const computeBtn = document.getElementById("qqplotComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("qqplotInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("qqplotResultArea");
        const valueSpan = document.getElementById("qqplotValueDisplay");
        const stepsSpan = document.getElementById("qqplotStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter numbers to generate Q-Q plot.");
            return;
        }
        
        const result = computeQQPlotWithSteps(numbers);
        resultDiv.style.display = "block";
        setHtml(valueSpan, `📈 Q-Q Plot | n = ${result.n} | Correlation = ${result.correlation.toFixed(4)} | ${Math.abs(result.correlation) > 0.98 ? 'Normal' : (Math.abs(result.correlation) > 0.95 ? 'Mild deviation' : 'Non-normal')}`);
        setHtml(stepsSpan, result.steps);
        
        setTimeout(() => {
            renderQQPlotChart(result);
        }, 100);
    });
    
    attachClearHandler("qqplotClearBtn", "qqplotInput", "qqplotResultArea");
}
