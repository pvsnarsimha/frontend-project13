/* PartialCorrelation: partial tool (render, compute, setup) */

// ========== PARTIAL CORRELATION (r_xy.z) ==========
// ========== PARTIAL CORRELATION (r_xy.z) - COMPLETELY FIXED WITH FULL DETAILS ==========
function computePartialCorrelationWithSteps(x, y, z) {
    if (!x.length || !y.length || !z.length) {
        return { error: true, message: "Please enter X, Y, and Z variables." };
    }
    if (x.length !== y.length || x.length !== z.length) {
        return { error: true, message: "X, Y, and Z must have the same number of values." };
    }
    if (x.length < 5) {
        return { error: true, message: "Need at least 5 observations for meaningful partial correlation." };
    }
    
    const n = x.length;
    
    // Calculate means
    const meanX = x.reduce((s, v) => s + v, 0) / n;
    const meanY = y.reduce((s, v) => s + v, 0) / n;
    const meanZ = z.reduce((s, v) => s + v, 0) / n;
    
    // ========== CALCULATE r_xy WITH FULL DETAILS ==========
    let xy_sumAB = 0, xy_sumAA = 0, xy_sumBB = 0;
    let xy_details = "";
    
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        const product = dx * dy;
        xy_sumAB += product;
        xy_sumAA += dx * dx;
        xy_sumBB += dy * dy;
        xy_details += `      (${x[i]} - ${meanX.toFixed(4)}) × (${y[i]} - ${meanY.toFixed(4)}) = ${dx.toFixed(4)} × ${dy.toFixed(4)} = ${product.toFixed(4)}\n`;
    }
    if (xy_sumAA === 0 || xy_sumBB === 0) {
        return { error: true, message: `Partial correlation is undefined: all ${xy_sumAA === 0 ? 'X' : 'Y'} values are identical (zero variance).` };
    }
    const r_xy = xy_sumAB / Math.sqrt(xy_sumAA * xy_sumBB);
    
    // ========== CALCULATE r_xz WITH FULL DETAILS ==========
    let xz_sumAB = 0, xz_sumAA = 0, xz_sumBB = 0;
    let xz_details = "";
    
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dz = z[i] - meanZ;
        const product = dx * dz;
        xz_sumAB += product;
        xz_sumAA += dx * dx;
        xz_sumBB += dz * dz;
        xz_details += `      (${x[i]} - ${meanX.toFixed(4)}) × (${z[i]} - ${meanZ.toFixed(4)}) = ${dx.toFixed(4)} × ${dz.toFixed(4)} = ${product.toFixed(4)}\n`;
    }
    if (xz_sumBB === 0) {
        return { error: true, message: "Partial correlation is undefined: all control (Z) values are identical (zero variance)." };
    }
    const r_xz = xz_sumAB / Math.sqrt(xz_sumAA * xz_sumBB);
    
    // ========== CALCULATE r_yz WITH FULL DETAILS ==========
    let yz_sumAB = 0, yz_sumAA = 0, yz_sumBB = 0;
    let yz_details = "";
    
    for (let i = 0; i < n; i++) {
        const dy = y[i] - meanY;
        const dz = z[i] - meanZ;
        const product = dy * dz;
        yz_sumAB += product;
        yz_sumAA += dy * dy;
        yz_sumBB += dz * dz;
        yz_details += `      (${y[i]} - ${meanY.toFixed(4)}) × (${z[i]} - ${meanZ.toFixed(4)}) = ${dy.toFixed(4)} × ${dz.toFixed(4)} = ${product.toFixed(4)}\n`;
    }
    const r_yz = yz_sumAB / Math.sqrt(yz_sumAA * yz_sumBB);
    
    // ========== PARTIAL CORRELATION ==========
    const numerator = r_xy - r_xz * r_yz;
    const denominator = Math.sqrt((1 - r_xz * r_xz) * (1 - r_yz * r_yz));
    if (!(denominator > 1e-12)) {
        return { error: true, message: "Partial correlation is undefined: Z is perfectly correlated with X or Y, so nothing is left after controlling for Z." };
    }
    const r_xy_z = numerator / denominator;
    
    // Build the complete HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <div style="background: linear-gradient(135deg, #e65100 0%, #bf360c 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🔗</span>
                <h2 style="margin: 0;">Partial Correlation (r<sub>xy·z</sub>)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: r<sub>xy·z</sub> = (r<sub>xy</sub> - r<sub>xz</sub>·r<sub>yz</sub>) / √[(1 - r<sub>xz</sub>²)(1 - r<sub>yz</sub>²)]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Measures correlation between X and Y after removing the linear effect of Z.</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #e65100;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #e65100;">
                    <div style="font-size: 12px;">Number of Observations</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">X̄ (Mean X)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanX.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Ȳ (Mean Y)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanY.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px;">
                    <div style="font-size: 12px; color: #6c757d;">Z̄ (Mean Z)</div>
                    <div style="font-size: 18px; font-weight: 600;">${meanZ.toFixed(4)}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #e65100;">📋 Input Data</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e65100; color: white;">
                        <th style="padding: 10px;">i</th>
                        <th style="padding: 10px;">X</th>
                        <th style="padding: 10px;">Y</th>
                        <th style="padding: 10px;">Z (Control)</th>
                    </tr>
                </thead>
                <tbody>`;
    for (let i = 0; i < n; i++) {
        steps += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${x[i]}</td>
            <td style="padding: 8px; text-align: center;">${y[i]}</td>
            <td style="padding: 8px; text-align: center;">${z[i]}</td>
         </tr>`;
    }
    steps += `</tbody>
             </table>
        </div>`;
    
    // ========== SECTION 1: r_xy DETAILS ==========
    steps += `
        <div style="background: #e3f2fd; border-radius: 16px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #1565c0;">
            <h3 style="margin: 0 0 16px 0; color: #1565c0;">📐 Step 1: Calculate r<sub>xy</sub> (Correlation between X and Y)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 13px; line-height: 1.6;">
                    <strong>Formula:</strong> r<sub>xy</sub> = Σ[(x - x̄)(y - ȳ)] / √[Σ(x - x̄)² × Σ(y - ȳ)²]<br><br>
                    <strong>Means:</strong> x̄ = ${meanX.toFixed(6)}, ȳ = ${meanY.toFixed(6)}<br><br>
                    <strong>Deviations and Products:</strong><br>
                    ${xy_details.replace(/\n/g, '<br>')}<br>
                    <strong>Summations:</strong><br>
                    &nbsp;&nbsp;Σ[(x - x̄)(y - ȳ)] = ${xy_sumAB.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(x - x̄)² = ${xy_sumAA.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(y - ȳ)² = ${xy_sumBB.toFixed(6)}<br><br>
                    <strong>Calculation:</strong><br>
                    &nbsp;&nbsp;r<sub>xy</sub> = ${xy_sumAB.toFixed(6)} / √(${xy_sumAA.toFixed(6)} × ${xy_sumBB.toFixed(6)})<br>
                    &nbsp;&nbsp;r<sub>xy</sub> = ${xy_sumAB.toFixed(6)} / ${Math.sqrt(xy_sumAA * xy_sumBB).toFixed(6)}<br>
                    <div style="background: #1565c0; color: white; padding: 8px 12px; border-radius: 8px; display: inline-block; margin-top: 8px;">
                        ✅ r<sub>xy</sub> = ${r_xy.toFixed(8)}
                    </div>
                </div>
            </div>
        </div>`;
    
    // ========== SECTION 2: r_xz DETAILS ==========
    steps += `
        <div style="background: #e8f5e9; border-radius: 16px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #2e7d32;">
            <h3 style="margin: 0 0 16px 0; color: #2e7d32;">📐 Step 2: Calculate r<sub>xz</sub> (Correlation between X and Z)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 13px; line-height: 1.6;">
                    <strong>Formula:</strong> r<sub>xz</sub> = Σ[(x - x̄)(z - z̄)] / √[Σ(x - x̄)² × Σ(z - z̄)²]<br><br>
                    <strong>Means:</strong> x̄ = ${meanX.toFixed(6)}, z̄ = ${meanZ.toFixed(6)}<br><br>
                    <strong>Deviations and Products:</strong><br>
                    ${xz_details.replace(/\n/g, '<br>')}<br>
                    <strong>Summations:</strong><br>
                    &nbsp;&nbsp;Σ[(x - x̄)(z - z̄)] = ${xz_sumAB.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(x - x̄)² = ${xz_sumAA.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(z - z̄)² = ${xz_sumBB.toFixed(6)}<br><br>
                    <strong>Calculation:</strong><br>
                    &nbsp;&nbsp;r<sub>xz</sub> = ${xz_sumAB.toFixed(6)} / √(${xz_sumAA.toFixed(6)} × ${xz_sumBB.toFixed(6)})<br>
                    &nbsp;&nbsp;r<sub>xz</sub> = ${xz_sumAB.toFixed(6)} / ${Math.sqrt(xz_sumAA * xz_sumBB).toFixed(6)}<br>
                    <div style="background: #2e7d32; color: white; padding: 8px 12px; border-radius: 8px; display: inline-block; margin-top: 8px;">
                        ✅ r<sub>xz</sub> = ${r_xz.toFixed(8)}
                    </div>
                </div>
            </div>
        </div>`;
    
    // ========== SECTION 3: r_yz DETAILS ==========
    steps += `
        <div style="background: #fff3e0; border-radius: 16px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #e65100;">
            <h3 style="margin: 0 0 16px 0; color: #e65100;">📐 Step 3: Calculate r<sub>yz</sub> (Correlation between Y and Z)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 13px; line-height: 1.6;">
                    <strong>Formula:</strong> r<sub>yz</sub> = Σ[(y - ȳ)(z - z̄)] / √[Σ(y - ȳ)² × Σ(z - z̄)²]<br><br>
                    <strong>Means:</strong> ȳ = ${meanY.toFixed(6)}, z̄ = ${meanZ.toFixed(6)}<br><br>
                    <strong>Deviations and Products:</strong><br>
                    ${yz_details.replace(/\n/g, '<br>')}<br>
                    <strong>Summations:</strong><br>
                    &nbsp;&nbsp;Σ[(y - ȳ)(z - z̄)] = ${yz_sumAB.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(y - ȳ)² = ${yz_sumAA.toFixed(6)}<br>
                    &nbsp;&nbsp;Σ(z - z̄)² = ${yz_sumBB.toFixed(6)}<br><br>
                    <strong>Calculation:</strong><br>
                    &nbsp;&nbsp;r<sub>yz</sub> = ${yz_sumAB.toFixed(6)} / √(${yz_sumAA.toFixed(6)} × ${yz_sumBB.toFixed(6)})<br>
                    &nbsp;&nbsp;r<sub>yz</sub> = ${yz_sumAB.toFixed(6)} / ${Math.sqrt(yz_sumAA * yz_sumBB).toFixed(6)}<br>
                    <div style="background: #e65100; color: white; padding: 8px 12px; border-radius: 8px; display: inline-block; margin-top: 8px;">
                        ✅ r<sub>yz</sub> = ${r_yz.toFixed(8)}
                    </div>
                </div>
            </div>
        </div>`;
    
    // ========== SECTION 4: PARTIAL CORRELATION ==========
    steps += `
        <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #6a1b9a;">🔢 Step 4: Calculate Partial Correlation r<sub>xy·z</sub></h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Collected Correlation Values</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 16px;">
                    <div>r<sub>xy</sub> = ${r_xy.toFixed(8)}</div>
                    <div>r<sub>xz</sub> = ${r_xz.toFixed(8)}</div>
                    <div>r<sub>yz</sub> = ${r_yz.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate Numerator</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    <div>Numerator = r<sub>xy</sub> - r<sub>xz</sub> × r<sub>yz</sub></div>
                    <div>= ${r_xy.toFixed(8)} - (${r_xz.toFixed(8)} × ${r_yz.toFixed(8)})</div>
                    <div>= ${r_xy.toFixed(8)} - ${(r_xz * r_yz).toFixed(8)}</div>
                    <div style="font-size: 18px; font-weight: 700; color: #1565c0;">= ${numerator.toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Calculate Denominator</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">
                    <div>Denominator = √[(1 - r<sub>xz</sub>²) × (1 - r<sub>yz</sub>²)]</div>
                    <div>1 - r<sub>xz</sub>² = 1 - ${(r_xz * r_xz).toFixed(8)} = ${(1 - r_xz * r_xz).toFixed(8)}</div>
                    <div>1 - r<sub>yz</sub>² = 1 - ${(r_yz * r_yz).toFixed(8)} = ${(1 - r_yz * r_yz).toFixed(8)}</div>
                    <div>Product = ${(1 - r_xz * r_xz).toFixed(8)} × ${(1 - r_yz * r_yz).toFixed(8)} = ${((1 - r_xz*r_xz) * (1 - r_yz*r_yz)).toFixed(8)}</div>
                    <div>√Product = √${((1 - r_xz*r_xz) * (1 - r_yz*r_yz)).toFixed(8)} = ${Math.sqrt((1 - r_xz*r_xz) * (1 - r_yz*r_yz)).toFixed(8)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">4</div>
                    <div><strong>Calculate Final Partial Correlation</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div>r<sub>xy·z</sub> = Numerator / Denominator</div>
                    <div>= ${numerator.toFixed(8)} / ${Math.sqrt((1 - r_xz*r_xz) * (1 - r_yz*r_yz)).toFixed(8)}</div>
                    <div style="font-size: 28px; font-weight: 700; color: #6a1b9a; text-align: center; padding: 16px; background: #f3e5f5; border-radius: 12px; margin-top: 12px;">
                        r<sub>xy·z</sub> = ${r_xy_z.toFixed(8)}
                    </div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: #fff3e0; border-left: 6px solid #e65100;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Partial Correlation:</strong> r<sub>xy·z</sub> = ${r_xy_z.toFixed(6)}</div>
                <div><strong>Simple Correlation (r<sub>xy</sub>):</strong> ${r_xy.toFixed(6)}</div>
                <div><strong>Change after controlling for Z:</strong> ${(r_xy_z - r_xy).toFixed(6)}</div>
                <div><strong>Direction:</strong> ${r_xy_z > 0 ? 'Positive association between X and Y after removing Z' : (r_xy_z < 0 ? 'Negative association after removing Z' : 'No partial association')}</div>
                <div><strong>Strength:</strong> ${Math.abs(r_xy_z) >= 0.7 ? 'Strong' : (Math.abs(r_xy_z) >= 0.5 ? 'Moderate' : (Math.abs(r_xy_z) >= 0.3 ? 'Weak' : 'Very Weak or No'))} partial relationship</div>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    💡 <strong>Practical Meaning:</strong> After removing the linear effect of Z, 
                    ${Math.abs(r_xy_z) > 0.3 ? 'there is a ' + (Math.abs(r_xy_z) >= 0.7 ? 'strong' : (Math.abs(r_xy_z) >= 0.5 ? 'moderate' : 'weak')) + ' ' + (r_xy_z > 0 ? 'positive' : 'negative') + ' relationship between X and Y.' 
                    : 'there is little to no direct linear relationship between X and Y.'}
                    ${Math.abs(r_xy - r_xy_z) > 0.1 ? ` The control variable Z explains ${Math.abs(((r_xy - r_xy_z)/r_xy) * 100).toFixed(1)}% of the original correlation between X and Y.` : ''}
                </div>
            </div>
        </div>
    </div>`;
    
    return { r_xy_z, r_xy, r_xz, r_yz, numerator, denominator, steps };
}

function setupPartialCorrelationLogic() {
    const computeBtn = document.getElementById("corrPartialComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("partialXInput").value;
        const rawY = document.getElementById("partialYInput").value;
        const rawZ = document.getElementById("partialZInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const zValues = parseNumbersFromInput(rawZ);
        const resultDiv = document.getElementById("partialResultArea");
        const valueSpan = document.getElementById("partialValueDisplay");
        const stepsSpan = document.getElementById("partialStepsDisplay");
        
        const result = computePartialCorrelationWithSteps(xValues, yValues, zValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `r<sub>xy·z</sub> = ${result.r_xy_z.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("partialClearBtn", ["partialXInput", "partialYInput", "partialZInput"], "partialResultArea");
}

// ========== PARTIAL CORRELATION INTERFACE RENDER ==========
function renderPartialCorrelationInterface() {
    return buildInterface({
        id: "statPartialCorrelationInterface",
        title: "🔗 Partial Correlation (r<sub>xy·z</sub>)",
        formula: "📌 r<sub>xy·z</sub> = (r<sub>xy</sub> - r<sub>xz</sub>·r<sub>yz</sub>) / √[(1 - r<sub>xz</sub>²)(1 - r<sub>yz</sub>²)]",
        desc: "Measures correlation between X and Y after statistically removing the linear effect of Z (control variable).",
        inputs: [
            {
                label: "📋 Enter X values (independent variable):",
                textarea: { id: "partialXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8" }
            },
            {
                label: "📋 Enter Y values (dependent variable):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "partialYInput", rows: "3", placeholder: "Example: 2, 4, 6, 8, 10, 12, 14, 16" }
            },
            {
                label: "📋 Enter Z values (control variable):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "partialZInput", rows: "3", placeholder: "Example: 1, 1, 2, 2, 3, 3, 4, 4" }
            }
        ],
        run: { id: "corrPartialComputeBtn", text: "🔗 Calculate Partial Correlation + Steps" },
        clear: { id: "partialClearBtn", text: "Clear All" },
        result: {
            area: "partialResultArea",
            label: "🎯 PARTIAL CORRELATION RESULT",
            value: "partialValueDisplay",
            steps: "partialStepsDisplay"
        }
    });
}
