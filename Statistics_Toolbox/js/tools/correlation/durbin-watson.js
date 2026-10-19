/* DurbinWatson: durbinwatson tool (render, compute, setup) */

// ========== DURBIN-WATSON STATISTIC INTERFACE ==========
function renderDurbinWatsonInterface() {
    return buildInterface({
        id: "statDurbinWatsonInterface",
        title: "🔄 Durbin-Watson Statistic (Autocorrelation)",
        formula: "📌 d = Σ(eᵢ - eᵢ₋₁)² / Σeᵢ²",
        desc: "<strong>What is the Durbin-Watson statistic?</strong><br>\n                    Tests for first-order autocorrelation in regression residuals.\n                    <br><br>\n                    <strong>Interpretation:</strong><br>\n                    • d ≈ 2 → No autocorrelation<br>\n                    • d < 2 → Positive autocorrelation<br>\n                    • d > 2 → Negative autocorrelation",
        inputs: [
            {
                label: "📋 Enter residuals from regression model (comma, space, or line separated):",
                textarea: { id: "dwResiduals", rows: "4", placeholder: "Example: 0.5, -0.3, 0.2, -0.1, 0.4, -0.2, 0.1, -0.4" }
            },
            {
                hint: "Residuals = Observed - Predicted values from your regression model",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "dwComputeBtn", text: "🔄 Calculate Durbin-Watson + Full Steps" },
        clear: { id: "dwClearBtn", text: "Clear" },
        result: { area: "dwResultArea", label: "🎯 DURBIN-WATSON RESULTS", value: "dwValueDisplay", steps: "dwStepsDisplay" }
    });
}

// ========== DURBIN-WATSON COMPUTATION (PROFESSIONAL VERSION) ==========
function computeDurbinWatson(residuals) {
    if (!residuals.length || residuals.length < 2) {
        return { error: true, message: "Need at least 2 residuals for Durbin-Watson test." };
    }
    
    const n = residuals.length;
    let numerator = 0;
    let denominator = 0;
    let diffTable = [];
    let squaredResTable = [];
    
    // Build difference table
    for (let i = 1; i < n; i++) {
        const et = residuals[i];
        const et_1 = residuals[i-1];
        const diff = et - et_1;
        const sqDiff = diff * diff;
        numerator += sqDiff;
        diffTable.push({ t: i, e_t: et, e_t_1: et_1, diff: diff, sqDiff: sqDiff });
    }
    
    // Build squared residuals table
    for (let i = 0; i < n; i++) {
        const sq = residuals[i] * residuals[i];
        denominator += sq;
        squaredResTable.push({ t: i+1, e_t: residuals[i], e_t_sq: sq });
    }
    
    const durbinWatson = numerator / denominator;
    
    // Determine interpretation with precise boundaries
    let interpretation = "";
    let severity = "";
    let severityColor = "";
    if (durbinWatson > 1.5 && durbinWatson < 2.5) {
        interpretation = "No significant autocorrelation";
        severity = "ACCEPTABLE";
        severityColor = "#28a745";
    } else if (durbinWatson <= 1.5 && durbinWatson > 1) {
        interpretation = "Mild positive autocorrelation";
        severity = "CAUTION";
        severityColor = "#ffc107";
    } else if (durbinWatson <= 1) {
        interpretation = "Strong positive autocorrelation";
        severity = "PROBLEMATIC";
        severityColor = "#dc3545";
    } else if (durbinWatson >= 2.5 && durbinWatson < 3) {
        interpretation = "Mild negative autocorrelation";
        severity = "CAUTION";
        severityColor = "#ffc107";
    } else if (durbinWatson >= 3) {
        interpretation = "Strong negative autocorrelation";
        severity = "PROBLEMATIC";
        severityColor = "#dc3545";
    }
    
    // Build HTML table rows for differences
    let diffRows = '';
    for (let row of diffTable) {
        diffRows += `
        <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px; text-align: center; font-weight: 500;">${row.t}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace;">${row.e_t.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace;">${row.e_t_1.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace; color: #dc3545;">${row.diff.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; background: #fff3cd; font-weight: 600; font-family: monospace;">${row.sqDiff.toFixed(6)}</td>
        </tr>`;
    }
    
    // Build HTML table rows for squared residuals
    let sqResRows = '';
    for (let row of squaredResTable) {
        sqResRows += `
        <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px; text-align: center; font-weight: 500;">${row.t}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace;">${row.e_t.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; background: #d4edda; font-weight: 600; font-family: monospace;">${row.e_t_sq.toFixed(6)}</td>
        </tr>`;
    }
    
    // Build complete HTML
    let steps = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 100%;">
        
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #0d3b66 0%, #1a5490 100%); color: white; padding: 25px 30px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div>
                    <h1 style="margin: 0; font-size: 28px;">🔄 Durbin-Watson Statistic</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Testing for First-Order Autocorrelation in Regression Residuals</p>
                </div>
                <div style="background: rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 11px; opacity: 0.8; letter-spacing: 1px;">TEST STATISTIC</div>
                    <div style="font-size: 42px; font-weight: 700;">${durbinWatson.toFixed(4)}</div>
                </div>
            </div>
        </div>
        
        <!-- FORMULA CARD -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #1a5490;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📐 Mathematical Formula</h3>
            <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; font-family: monospace; font-size: 18px;">
                <strong>d = \\(\\frac{\\sum_{t=2}^{n} (e_t - e_{t-1})^2}{\\sum_{t=1}^{n} e_t^2}\\)</strong>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 15px; border-radius: 8px;">
                <strong>📖 Where:</strong><br>
                • e<sub>t</sub> = Residual at time t<br>
                • e<sub>t-1</sub> = Residual at previous time period<br>
                • n = Number of observations (${n})<br>
                • d = 2 → No autocorrelation | d < 2 → Positive | d > 2 → Negative
            </div>
        </div>
        
        <!-- STEP 1: DIFFERENCES TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📊 Step 1: Calculate Differences (e<sub>t</sub> - e<sub>t-1</sub>) and Squared Differences</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px; text-align: center;">Time (t)</th>
                        <th style="padding: 12px; text-align: center;">e<sub>t</sub></th>
                        <th style="padding: 12px; text-align: center;">e<sub>t-1</sub></th>
                        <th style="padding: 12px; text-align: center;">Difference = e<sub>t</sub> - e<sub>t-1</sub></th>
                        <th style="padding: 12px; text-align: center;">(Difference)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${diffRows}
                    <tr style="background: #e8f4f8; font-weight: 700; border-top: 2px solid #1a5490;">
                        <td colspan="4" style="padding: 12px; text-align: right;">Σ (e<sub>t</sub> - e<sub>t-1</sub>)² →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white; font-size: 16px;">${numerator.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 2: SQUARED RESIDUALS TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📊 Step 2: Calculate Squared Residuals (e<sub>t</sub>²)</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px; text-align: center;">Time (t)</th>
                        <th style="padding: 12px; text-align: center;">e<sub>t</sub></th>
                        <th style="padding: 12px; text-align: center;">e<sub>t</sub>²</th>
                    </tr>
                </thead>
                <tbody>
                    ${sqResRows}
                    <tr style="background: #e8f4f8; font-weight: 700; border-top: 2px solid #1a5490;">
                        <td colspan="2" style="padding: 12px; text-align: right;">Σ e<sub>t</sub>² →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white; font-size: 16px;">${denominator.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 3: FINAL CALCULATION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 25px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 20px 0; color: #1a5490;">🔢 Step 3: Calculate Durbin-Watson Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="font-family: monospace; font-size: 18px; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>d = Σ(e<sub>t</sub> - e<sub>t-1</sub>)² / Σe<sub>t</sub>²</strong>
                </div>
                <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px;"><strong>Numerator:</strong></td>
                            <td style="padding: 8px; font-family: monospace;">${numerator.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Denominator:</strong></td>
                            <td style="padding: 8px; font-family: monospace;">${denominator.toFixed(6)}</td>
                        </tr>
                        <tr style="border-top: 1px solid #dee2e6;">
                            <td style="padding: 12px;"><strong>d =</strong></td>
                            <td style="padding: 12px; font-family: monospace; font-size: 20px; font-weight: 700; color: #1a5490;">${numerator.toFixed(6)} / ${denominator.toFixed(6)} = ${durbinWatson.toFixed(6)}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- INTERPRETATION SECTION -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 25px; background: ${severityColor}15; border-left: 6px solid ${severityColor};">
            <h3 style="margin: 0 0 15px 0;">📌 Interpretation & Decision</h3>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size: 11px; color: #666; text-transform: uppercase;">Test Statistic (d)</div>
                    <div style="font-size: 28px; font-weight: 700; color: ${severityColor};">${durbinWatson.toFixed(4)}</div>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size: 11px; color: #666; text-transform: uppercase;">Observations (n)</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size: 11px; color: #666; text-transform: uppercase;">Verdict</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${severityColor};">${severity}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 15px;">
                <p><strong>🎯 Interpretation:</strong> ${interpretation}</p>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #dee2e6;">
                    <strong>📊 Decision Rules:</strong><br>
                    <table style="width: 100%; margin-top: 8px; font-size: 13px;">
                        <tr><td style="padding: 4px;">• d = 2</td><td>→ No autocorrelation</td></tr>
                        <tr><td style="padding: 4px;">• d < 2</td><td>→ Positive autocorrelation</td></tr>
                        <tr><td style="padding: 4px;">• d > 2</td><td>→ Negative autocorrelation</td></tr>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- REFERENCE TABLE -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📖 Durbin-Watson Critical Values Reference (α = 0.05)</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">n</th>
                            <th style="padding: 10px;">k=1</th>
                            <th style="padding: 10px;">k=2</th>
                            <th style="padding: 10px;">k=3</th>
                            <th style="padding: 10px;">k=4</th>
                            <th style="padding: 10px;">k=5</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background: white;"><td style="padding: 8px;">15</td><td>1.08, 1.36</td><td>0.95, 1.54</td><td>0.82, 1.75</td><td>0.69, 1.97</td><td>0.56, 2.21</td></tr>
                        <tr style="background: #f8f9fa;"><td style="padding: 8px;">20</td><td>1.20, 1.41</td><td>1.10, 1.54</td><td>1.00, 1.68</td><td>0.90, 1.83</td><td>0.79, 1.99</td></tr>
                        <tr style="background: white;"><td style="padding: 8px;">30</td><td>1.35, 1.49</td><td>1.28, 1.57</td><td>1.21, 1.65</td><td>1.14, 1.74</td><td>1.07, 1.83</td></tr>
                        <tr style="background: #f8f9fa;"><td style="padding: 8px;">40</td><td>1.44, 1.54</td><td>1.39, 1.60</td><td>1.34, 1.66</td><td>1.29, 1.72</td><td>1.23, 1.79</td></tr>
                        <tr style="background: white;"><td style="padding: 8px;">50</td><td>1.50, 1.59</td><td>1.46, 1.63</td><td>1.42, 1.67</td><td>1.38, 1.72</td><td>1.34, 1.77</td></tr>
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #666; text-align: center;">
                💡 <strong>Note:</strong> Values shown as (d<sub>L</sub>, d<sub>U</sub>). Reject H₀ if d < d<sub>L</sub> or d > 4 - d<sub>L</sub>.
            </div>
        </div>
    </div>`;
    
    return { durbinWatson, numerator, denominator, n, interpretation, steps };
}

// ========== SETUP FUNCTIONS ==========
function setupDurbinWatsonLogic() {
    const computeBtn = document.getElementById("dwComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("dwResiduals").value;
        const residuals = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("dwResultArea");
        const valueSpan = document.getElementById("dwValueDisplay");
        const stepsSpan = document.getElementById("dwStepsDisplay");
        
        if (!residuals.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter residuals.");  // ← Use innerHTML
            return;
        }
        
        const result = computeDurbinWatson(residuals);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);  // ← Use innerHTML
        } else {
            setHtml(valueSpan, `d = ${result.durbinWatson.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);  // ← Use innerHTML (THIS IS CRITICAL)
        }
    });
    
    attachClearHandler("dwClearBtn", "dwResiduals", "dwResultArea");
}
