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
        <tr class="s-00049c">
            <td class="s-6e1b96">${row.t}</td>
            <td class="s-1d6537">${row.e_t.toFixed(4)}</td>
            <td class="s-1d6537">${row.e_t_1.toFixed(4)}</td>
            <td class="s-ff6d0f">${row.diff.toFixed(4)}</td>
            <td class="s-ee2ee1">${row.sqDiff.toFixed(6)}</td>
        </tr>`;
    }
    
    // Build HTML table rows for squared residuals
    let sqResRows = '';
    for (let row of squaredResTable) {
        sqResRows += `
        <tr class="s-00049c">
            <td class="s-6e1b96">${row.t}</td>
            <td class="s-1d6537">${row.e_t.toFixed(4)}</td>
            <td class="s-3f18d1">${row.e_t_sq.toFixed(6)}</td>
        </tr>`;
    }
    
    // Build complete HTML
    let steps = `
    <div class="s-e3295e">
        
        <!-- HEADER SECTION -->
        <div class="s-a73c71 gen-pad">
            <div class="s-b15718 gen-flex">
                <div>
                    <h1 class="s-b80b8c">🔄 Durbin-Watson Statistic</h1>
                    <p class="s-3d1a65">Testing for First-Order Autocorrelation in Regression Residuals</p>
                </div>
                <div class="s-0c68a3">
                    <div class="s-fec7da">TEST STATISTIC</div>
                    <div class="s-196c52 gen-big">${durbinWatson.toFixed(4)}</div>
                </div>
            </div>
        </div>
        
        <!-- FORMULA CARD -->
        <div class="s-c21c61 gen-pad">
            <h3 class="s-ed0bb5">📐 Mathematical Formula</h3>
            <div class="s-f6c676 gen-pad">
                <strong>d = \\(\\frac{\\sum_{t=2}^{n} (e_t - e_{t-1})^2}{\\sum_{t=1}^{n} e_t^2}\\)</strong>
            </div>
            <div class="s-938536">
                <strong>📖 Where:</strong><br>
                • e<sub>t</sub> = Residual at time t<br>
                • e<sub>t-1</sub> = Residual at previous time period<br>
                • n = Number of observations (${n})<br>
                • d = 2 → No autocorrelation | d < 2 → Positive | d > 2 → Negative
            </div>
        </div>
        
        <!-- STEP 1: DIFFERENCES TABLE -->
        <div class="s-83f9af">
            <div class="s-63fd4e">
                <h3 class="s-2eb15f">📊 Step 1: Calculate Differences (e<sub>t</sub> - e<sub>t-1</sub>) and Squared Differences</h3>
            </div>
            <table class="s-306b2c gen-sized">
                <thead>
                    <tr class="s-df5107">
                        <th class="s-34ffd2">Time (t)</th>
                        <th class="s-34ffd2">e<sub>t</sub></th>
                        <th class="s-34ffd2">e<sub>t-1</sub></th>
                        <th class="s-34ffd2">Difference = e<sub>t</sub> - e<sub>t-1</sub></th>
                        <th class="s-34ffd2">(Difference)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${diffRows}
                    <tr class="s-6c2756">
                        <td class="s-6ecd26" colspan="4">Σ (e<sub>t</sub> - e<sub>t-1</sub>)² →</td>
                        <td class="s-2f88df">${numerator.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 2: SQUARED RESIDUALS TABLE -->
        <div class="s-83f9af">
            <div class="s-63fd4e">
                <h3 class="s-2eb15f">📊 Step 2: Calculate Squared Residuals (e<sub>t</sub>²)</h3>
            </div>
            <table class="s-306b2c gen-sized">
                <thead>
                    <tr class="s-df5107">
                        <th class="s-34ffd2">Time (t)</th>
                        <th class="s-34ffd2">e<sub>t</sub></th>
                        <th class="s-34ffd2">e<sub>t</sub>²</th>
                    </tr>
                </thead>
                <tbody>
                    ${sqResRows}
                    <tr class="s-6c2756">
                        <td class="s-6ecd26" colspan="2">Σ e<sub>t</sub>² →</td>
                        <td class="s-2f88df">${denominator.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 3: FINAL CALCULATION -->
        <div class="s-5ff38e gen-pad">
            <h3 class="s-10a1d4">🔢 Step 3: Calculate Durbin-Watson Statistic</h3>
            <div class="s-6fab3a gen-pad">
                <div class="s-c835b7">
                    <strong>d = Σ(e<sub>t</sub> - e<sub>t-1</sub>)² / Σe<sub>t</sub>²</strong>
                </div>
                <div class="s-eb3f9c gen-pad">
                    <table class="s-897d74 gen-sized">
                        <tr>
                            <td class="s-641001"><strong>Numerator:</strong></td>
                            <td class="s-2e1d0b">${numerator.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td class="s-641001"><strong>Denominator:</strong></td>
                            <td class="s-2e1d0b">${denominator.toFixed(6)}</td>
                        </tr>
                        <tr class="s-fba762">
                            <td class="s-61a8ef"><strong>d =</strong></td>
                            <td class="s-e80ab1">${numerator.toFixed(6)} / ${denominator.toFixed(6)} = ${durbinWatson.toFixed(6)}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- INTERPRETATION SECTION -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 25px; background: ${severityColor}15; border-left: 6px solid ${severityColor};">
            <h3 class="s-a63d7a">📌 Interpretation & Decision</h3>
            
            <div class="s-6961ce gen-grid gen-grid-many">
                <div class="s-9f52da">
                    <div class="s-9a23a8">Test Statistic (d)</div>
                    <div style="font-size: 28px; font-weight: 700; color: ${textSafeColor(severityColor)};">${durbinWatson.toFixed(4)}</div>
                </div>
                <div class="s-9f52da">
                    <div class="s-9a23a8">Observations (n)</div>
                    <div class="s-93c0a8">${n}</div>
                </div>
                <div class="s-9f52da">
                    <div class="s-9a23a8">Verdict</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${textSafeColor(severityColor)};">${severity}</div>
                </div>
            </div>
            
            <div class="s-2e46b1">
                <p><strong>🎯 Interpretation:</strong> ${interpretation}</p>
                <div class="s-df3fc8">
                    <strong>📊 Decision Rules:</strong><br>
                    <table class="s-770f02 gen-sized">
                        <tr><td class="s-4e9d15">• d = 2</td><td>→ No autocorrelation</td></tr>
                        <tr><td class="s-4e9d15">• d < 2</td><td>→ Positive autocorrelation</td></tr>
                        <tr><td class="s-4e9d15">• d > 2</td><td>→ Negative autocorrelation</td></tr>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- REFERENCE TABLE -->
        <div class="s-44d7a2 gen-pad">
            <h3 class="s-6cfbec">📖 Durbin-Watson Critical Values Reference (α = 0.05)</h3>
            <div class="s-01a9b9">
                <table class="s-776a1d gen-sized">
                    <thead>
                        <tr class="s-e7b83b">
                            <th class="s-a756db">n</th>
                            <th class="s-a756db">k=1</th>
                            <th class="s-a756db">k=2</th>
                            <th class="s-a756db">k=3</th>
                            <th class="s-a756db">k=4</th>
                            <th class="s-a756db">k=5</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="s-67f264"><td class="s-641001">15</td><td>1.08, 1.36</td><td>0.95, 1.54</td><td>0.82, 1.75</td><td>0.69, 1.97</td><td>0.56, 2.21</td></tr>
                        <tr class="s-6d64ad"><td class="s-641001">20</td><td>1.20, 1.41</td><td>1.10, 1.54</td><td>1.00, 1.68</td><td>0.90, 1.83</td><td>0.79, 1.99</td></tr>
                        <tr class="s-67f264"><td class="s-641001">30</td><td>1.35, 1.49</td><td>1.28, 1.57</td><td>1.21, 1.65</td><td>1.14, 1.74</td><td>1.07, 1.83</td></tr>
                        <tr class="s-6d64ad"><td class="s-641001">40</td><td>1.44, 1.54</td><td>1.39, 1.60</td><td>1.34, 1.66</td><td>1.29, 1.72</td><td>1.23, 1.79</td></tr>
                        <tr class="s-67f264"><td class="s-641001">50</td><td>1.50, 1.59</td><td>1.46, 1.63</td><td>1.42, 1.67</td><td>1.38, 1.72</td><td>1.34, 1.77</td></tr>
                    </tbody>
                </table>
            </div>
            <div class="s-fa6d3d">
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
            hideAllStatCharts();
            setHtml(stepsSpan, result.message);  // ← Use innerHTML
        } else {
            setHtml(valueSpan, `d = ${result.durbinWatson.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showResidualSequenceChart("dwResultArea", residuals);  // ← Use innerHTML (THIS IS CRITICAL)
        }
    });
    
    attachClearHandler("dwClearBtn", "dwResiduals", "dwResultArea");
}
