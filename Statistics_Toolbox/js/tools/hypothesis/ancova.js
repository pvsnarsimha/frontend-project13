/* ANCOVA: ancova tool (render, compute, setup) */

// ========== ANCOVA INTERFACE RENDER ==========
function renderANCOVAInterface() {
    return buildInterface({
        id: "statANCOVAInterface",
        title: "📊 ANCOVA (Analysis of Covariance)",
        formula: "📌 Tests group differences while controlling for covariates",
        desc: "<strong>What is ANCOVA?</strong><br>\n                    ANCOVA combines ANOVA and regression to compare group means while statistically \n                    controlling for the effect of one or more continuous covariates.<br><br>\n                    <strong>Formula:</strong> Y = β₀ + β₁X + β₂Group + ε<br><br>\n                    <strong>H₀:</strong> All group means are equal after adjusting for covariates<br>\n                    <strong>H₁:</strong> At least one group mean differs after adjusting for covariates",
        inputs: [
            {
                label: "📋 Enter data (format: outcome, group, covariate1, covariate2, ...):",
                textarea: {
                    id: "ancovaData",
                    rows: "6",
                    placeholder: "Example:&#10;Y, Group, Covariate&#10;12, A, 5&#10;15, A, 6&#10;14, A, 4&#10;18, B, 7&#10;20, B, 8&#10;19, B, 6&#10;25, C, 9&#10;27, C, 10&#10;24, C, 8"
                }
            },
            {
                hint: "<strong>Format:</strong> Each row: Y (outcome), Group (categorical), Covariate (numeric). Only one covariate is used; any extra columns are ignored.<br>\n                    <strong>Example:</strong> 12, A, 5 means Y=12, Group=A, Covariate=5",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "ancovaAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "ancovaComputeBtn", text: "📊 Run ANCOVA + Full Steps" },
        clear: { id: "ancovaClearBtn", text: "Clear" },
        result: {
            area: "ancovaResultArea",
            label: "🎯 ANCOVA RESULTS",
            value: "ancovaValueDisplay",
            steps: "ancovaStepsDisplay"
        }
    });
}

// ========== ANCOVA COMPUTATION ==========
function computeANCOVA(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    // Parse input data - support both comma and space separated
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;
        // Split by comma or space
        let parts;
        if (line.includes(',')) {
            parts = line.split(',').map(s => s.trim());
        } else {
            parts = line.split(/\s+/);
        }
        
        const values = [];
        for (let part of parts) {
            if (part === "") continue;
            const num = parseFloat(part);
            if (!isNaN(num)) {
                values.push(num);
            } else {
                values.push(part);
            }
        }
        if (values.length >= 3) {  // Need at least: Y, Group, Covariate
            if (data.length === 0 && typeof values[0] !== 'number') continue;   // header row such as "Y, Group, X"
            data.push(values);
        }
    }
    
    if (data.length < 6) {
        return { error: true, message: `Need at least 6 observations for ANCOVA. You provided ${data.length}.` };
    }
    
    // Detect format: If first value is a number and second is a letter, then format is [Y, Group, Covariate1, Covariate2...]
    // But your data seems to have Y as first, Group as second, Covariates as rest
    const n = data.length;
    
    // First column is Y (outcome)
    let y = data.map(row => parseFloat(row[0]));
    
    // Second column is Group (categorical)
    let group = data.map(row => escapeHtml(row[1].toString()));   // labels reach the HTML steps: escaped once, here
    
    // Third column is the covariate (single-covariate ANCOVA; extra columns are ignored)
    let cov = data.map(row => parseFloat(row[2]));
    
    const groups = [...new Set(group)];
    const k = groups.length;
    
    if (k < 2) {
        return { error: true, message: `Need at least 2 groups for ANCOVA. Found groups: ${groups.join(', ')}` };
    }
    
    // Check for missing values
    if (y.some(isNaN) || cov.some(isNaN)) {
        return { error: true, message: "Invalid numeric values detected. Please check your data format." };
    }
    
    // ========== STEP 1: Calculate Group Means ==========
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupCovMeans = new Map();
    
    for (let g of groups) {
        let indices = [];
        for (let idx = 0; idx < group.length; idx++) {
            if (group[idx] === g) indices.push(idx);
        }
        groupSizes.set(g, indices.length);
        
        let sumY = 0, sumCov = 0;
        for (let idx of indices) {
            sumY += y[idx];
            sumCov += cov[idx];
        }
        groupMeans.set(g, sumY / indices.length);
        groupCovMeans.set(g, sumCov / indices.length);
    }
    
    // ========== STEP 2: Calculate Grand Mean ==========
    const grandMean = y.reduce((a,b) => a+b, 0) / n;
    const covMean = cov.reduce((a,b) => a+b, 0) / n;
    
    // Build the group means table (the one you showed with issues)
    let groupTableRows = '';
    for (let g of groups) {
        let sumY = 0, sumCov = 0;
        for (let idx = 0; idx < n; idx++) {
            if (group[idx] === g) {
                sumY += y[idx];
                sumCov += cov[idx];
            }
        }
        groupTableRows += `<tr class="s-0d2692">
            <td class="s-4370aa">${g}</td>
            <td class="s-9da549">${groupSizes.get(g)}</td>
            <td class="s-9da549">${sumY}</td>
            <td class="s-a6efc7">${groupMeans.get(g).toFixed(6)}</td>
            <td class="s-9da549">${sumCov}</td>
            <td class="s-9da549">${groupCovMeans.get(g).toFixed(6)}</td>
        </tr>`;
    }
    
    // ========== STEP 3: Calculate Total Sum of Squares ==========
    let ssTotal = 0;
    let ssTotalDetails = [];
    for (let i = 0; i < n; i++) {
        let dev = y[i] - grandMean;
        let sqDev = dev * dev;
        ssTotal += sqDev;
        ssTotalDetails.push(`(${y[i]} - ${grandMean.toFixed(4)})² = (${dev.toFixed(4)})² = ${sqDev.toFixed(4)}`);
    }
    
    // ========== STEP 4: Calculate Within-Group SS (Unadjusted) ==========
    let ssWithinUnadj = 0;
    let ssWithinUnadjDetails = [];
    for (let g of groups) {
        let groupMean = groupMeans.get(g);
        ssWithinUnadjDetails.push(`\n   <strong>Group ${g}</strong> (mean = ${groupMean.toFixed(4)}):`);
        for (let idx = 0; idx < n; idx++) {
            if (group[idx] === g) {
                let dev = y[idx] - groupMean;
                let sqDev = dev * dev;
                ssWithinUnadj += sqDev;
                ssWithinUnadjDetails.push(`      (${y[idx]} - ${groupMean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
            }
        }
    }
    
    // ========== STEP 5: Calculate Regression Coefficient (β) ==========
    // ANCOVA uses the POOLED WITHIN-GROUP slope: deviations are taken from each group's own means,
    // so the covariate slope is not contaminated by differences between the groups.
    let xySum = 0, xxSum = 0;
    let xyDetails = [], xxDetails = [];
    // Totals around the grand means (needed for the covariate-adjusted total sum of squares)
    let xyTotal = 0, xxTotal = 0;
    
    for (let i = 0; i < n; i++) {
        xyTotal += (y[i] - grandMean) * (cov[i] - covMean);
        xxTotal += (cov[i] - covMean) * (cov[i] - covMean);
        const gMeanY = groupMeans.get(group[i]), gMeanX = groupCovMeans.get(group[i]);
        let yDev = y[i] - gMeanY;
        let xDev = cov[i] - gMeanX;
        xySum += yDev * xDev;
        xxSum += xDev * xDev;
        xyDetails.push(`(${y[i]} - ${gMeanY.toFixed(4)}) × (${cov[i]} - ${gMeanX.toFixed(4)}) = ${yDev.toFixed(4)} × ${xDev.toFixed(4)} = ${(yDev * xDev).toFixed(4)}`);
        xxDetails.push(`(${cov[i]} - ${gMeanX.toFixed(4)})² = ${xDev.toFixed(4)}² = ${(xDev * xDev).toFixed(4)}`);
    }
    
    const beta = xxSum !== 0 ? xySum / xxSum : 0;
    
    // ========== STEP 6: Calculate Adjusted Means ==========
    let adjustedMeans = new Map();
    let adjMeanDetails = [];
    for (let g of groups) {
        let groupMean = groupMeans.get(g);
        let groupCovMean = groupCovMeans.get(g);
        let adjMean = groupMean - beta * (groupCovMean - covMean);
        adjustedMeans.set(g, adjMean);
        adjMeanDetails.push(`${g}: ${groupMean.toFixed(4)} - ${beta.toFixed(4)} × (${groupCovMean.toFixed(4)} - ${covMean.toFixed(4)}) = ${adjMean.toFixed(4)}`);
    }
    
    // ========== STEP 7: Calculate Adjusted Within-Group SS ==========
    let ssWithinAdj = 0;
    let ssWithinAdjDetails = [];
    for (let g of groups) {
        let adjMean = adjustedMeans.get(g);
        ssWithinAdjDetails.push(`\n   <strong>Group ${g}</strong> (adjusted mean = ${adjMean.toFixed(4)}):`);
        for (let idx = 0; idx < n; idx++) {
            if (group[idx] === g) {
                let residual = y[idx] - adjMean - beta * (cov[idx] - covMean);
                let sqResidual = residual * residual;
                ssWithinAdj += sqResidual;
                ssWithinAdjDetails.push(`      ${y[idx]} - ${adjMean.toFixed(4)} - ${beta.toFixed(4)}×(${cov[idx]} - ${covMean.toFixed(4)}) = ${residual.toFixed(4)} → squared = ${sqResidual.toFixed(4)}`);
            }
        }
    }
    
    // ========== STEP 8: Calculate Adjusted Between-Group SS ==========
    // Covariate-adjusted total SS minus covariate-adjusted error SS
    const ssTotalAdj = ssTotal - (xxTotal !== 0 ? xyTotal * xyTotal / xxTotal : 0);
    let ssBetweenAdj = ssTotalAdj - ssWithinAdj;
    // Tiny negatives are floating-point cancellation; anything larger means the adjusted SS decomposition failed
    if (ssBetweenAdj < -1e-9 * Math.max(1, Math.abs(ssTotalAdj))) {
        return { error: true, message: "The covariate-adjusted between-group sum of squares came out negative, so the ANCOVA decomposition is not reliable for this data. Check for a constant covariate or near-collinear groups." };
    }
    if (ssBetweenAdj < 0) ssBetweenAdj = 0;
    const ssCovariate = ssTotal - ssBetweenAdj - ssWithinAdj;
    
    // ========== STEP 9: Degrees of Freedom ==========
    const dfBetween = k - 1;
    const dfWithin = n - k - 1;
    const dfTotal = n - 1;
    
    // ========== STEP 10: Mean Squares ==========
    const msBetween = ssBetweenAdj / dfBetween;
    const msWithin = ssWithinAdj / dfWithin;
    
    // ========== STEP 11: F-statistic ==========
    const fStatistic = msBetween / msWithin;
    
    // ========== STEP 12: Critical Value and p-value ==========
    const criticalValue = fCriticalValue(alpha, dfBetween, dfWithin);
    const pValue = 1 - fCDF(fStatistic, dfBetween, dfWithin);
    const rejectH0 = pValue < alpha;
    
    // Build input data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        dataRows += `<tr class="s-0d2692">
            <td class="s-182047">${i+1}</td>
            <td class="s-182047">${y[i]}</td>
            <td class="s-9afb27">${group[i]}</td>
            <td class="s-182047">${cov[i]}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-f3b550">
        <!-- Header -->
        <div class="s-c0b227 gen-pad">
            <div class="s-cef60d gen-flex">
                <span class="s-e21123 gen-big">📊</span>
                <h2 class="s-0f229a">Analysis of Covariance (ANCOVA)</h2>
            </div>
            <p class="s-f50cbf">Testing group differences while controlling for covariates</p>
            <p class="s-3cce3a">H₀: All group means are equal after adjusting for covariates</p>
        </div>
        
        <!-- Input Data -->
        <div class="s-96a3c9 gen-pad">
            <h3 class="s-1c9d4d">📊 Input Data</h3>
            <div class="s-74082b">
                <table class="s-801d2c gen-sized">
                    <thead><tr class="s-0fb8dc">
                        <th class="s-828f53">#</th>
                        <th class="s-828f53">Y (Outcome)</th>
                        <th class="s-828f53">Group</th>
                        <th class="s-828f53">X (Covariate)</th>
                    </tr></thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 1: Group Means -->
        <div class="s-71e180 gen-pad">
            <h3 class="s-1c9d4d">🔢 Step 1: Calculate Group Means for Y and Covariate X</h3>
            <div class="s-7a1b94">
                <table class="s-1b1faa gen-sized">
                    <thead><tr class="s-0fb8dc">
                        <th class="s-828f53">Group</th>
                        <th class="s-828f53">n</th>
                        <th class="s-828f53">ΣY</th>
                        <th class="s-828f53">Mean Y (Ȳⱼ)</th>
                        <th class="s-828f53">ΣX</th>
                        <th class="s-828f53">Mean X (X̄ⱼ)</th>
                    </tr></thead>
                    <tbody>${groupTableRows}</tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 2: Grand Mean -->
        <div class="s-71e180 gen-pad">
            <h3 class="s-1c9d4d">🔢 Step 2: Calculate Grand Means</h3>
            <div class="s-f4c7f0">
                <div><strong>Grand Mean of Y (Ȳ):</strong> ${grandMean.toFixed(6)}</div>
                <div><strong>Grand Mean of X (X̄):</strong> ${covMean.toFixed(6)}</div>
            </div>
        </div>
        
        <!-- Step 3: Total Sum of Squares -->
        <div class="s-71e180 gen-pad">
            <h3 class="s-1c9d4d">🔢 Step 3: Calculate Total Sum of Squares (SS<sub>Total</sub>)</h3>
            <div class="s-f4c7f0">
                <div class="s-4f4867"><strong>Formula:</strong> SS<sub>Total</sub> = Σ(Yᵢ - Ȳ)²</div>
                <div class="s-dc2163">
                    ${ssTotalDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Total</sub> = ${ssTotal.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- Step 4: Within-Group SS (Unadjusted) -->
        <div class="s-71e180 gen-pad">
            <h3 class="s-1c9d4d">🔢 Step 4: Calculate Within-Group SS (Unadjusted)</h3>
            <div class="s-f4c7f0">
                <div class="s-4f4867"><strong>Formula:</strong> SS<sub>Within</sub> = Σ(Yᵢ - Ȳⱼ)²</div>
                <div class="s-dc2163">
                    ${ssWithinUnadjDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Within, unadj</sub> = ${ssWithinUnadj.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- Step 5: Regression Coefficient -->
        <div class="s-71e180 gen-pad">
            <h3 class="s-1c9d4d">🔢 Step 5: Calculate Regression Coefficient (β)</h3>
            <div class="s-f4c7f0">
                <div class="s-4f4867"><strong>Formula:</strong> β = Σ(Yᵢ - Ȳ<sub>group</sub>)(Xᵢ - X̄<sub>group</sub>) / Σ(Xᵢ - X̄<sub>group</sub>)²  (pooled within-group slope)</div>
                
                <div><strong>Numerator Σ(Yᵢ - Ȳ<sub>group</sub>)(Xᵢ - X̄<sub>group</sub>):</strong></div>
                <div class="s-abdf37">
                    ${xyDetails.join('<br>')}
                    <strong>Σ = ${xySum.toFixed(6)}</strong>
                </div>
                
                <div><strong>Denominator Σ(Xᵢ - X̄<sub>group</sub>)²:</strong></div>
                <div class="s-abdf37">
                    ${xxDetails.join('<br>')}
                    <strong>Σ = ${xxSum.toFixed(6)}</strong>
                </div>
                
                <div><strong>β = ${xySum.toFixed(6)} / ${xxSum.toFixed(6)} = <span class="s-8eb90d">${beta.toFixed(6)}</span></strong></div>
            </div>
        </div>
        
        <!-- Step 6: Adjusted Means -->
        <div class="s-71e180 gen-pad">
            <h3 class="s-1c9d4d">🔢 Step 6: Calculate Adjusted Group Means</h3>
            <div class="s-f4c7f0">
                <div class="s-4f4867"><strong>Formula:</strong> Ȳⱼ<sub>adj</sub> = Ȳⱼ - β × (X̄ⱼ - X̄)</div>
                <div class="s-dc2163">
                    ${adjMeanDetails.join('<br>')}
                </div>
            </div>
        </div>
        
        <!-- Step 7: Adjusted Within-Group SS -->
        <div class="s-71e180 gen-pad">
            <h3 class="s-1c9d4d">🔢 Step 7: Calculate Adjusted Within-Group SS</h3>
            <div class="s-f4c7f0">
                <div class="s-1d65fe">
                    ${ssWithinAdjDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Within, adj</sub> = ${ssWithinAdj.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- ANCOVA Summary Table -->
        <div class="s-1082f7">
            <h3 class="s-d0a196">📊 ANCOVA Summary Table</h3>
            <table class="s-1b1faa gen-sized">
                <thead><tr class="s-a9ce51">
                    <th class="s-92407c">Source</th>
                    <th class="s-92407c">SS</th>
                    <th class="s-92407c">df</th>
                    <th class="s-92407c">MS</th>
                    <th class="s-92407c">F</th>
                    <th class="s-92407c">p-value</th>
                </tr></thead>
                <tbody>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Covariate (X)</td>
                        <td class="s-1a6540">${ssCovariate.toFixed(4)}</td>
                        <td class="s-1a6540">1</td>
                        <td class="s-1a6540">${ssCovariate.toFixed(4)}</td>
                        <td class="s-1a6540">—</td>
                        <td class="s-1a6540">—</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Between Groups (Adjusted)</td>
                        <td class="s-1a6540">${ssBetweenAdj.toFixed(4)}</td>
                        <td class="s-1a6540">${dfBetween}</td>
                        <td class="s-1a6540">${msBetween.toFixed(4)}</td>
                        <td class="s-718840" rowspan="2">${fStatistic.toFixed(4)}</td>
                        <td class="s-3354ca" rowspan="2">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr class="s-6085d7">
                        <td class="s-eddf4d">Within Groups (Error)</td>
                        <td class="s-1a6540">${ssWithinAdj.toFixed(4)}</td>
                        <td class="s-1a6540">${dfWithin}</td>
                        <td class="s-1a6540">${msWithin.toFixed(4)}</td>
                    </tr>
                    <tr class="s-a9ce51">
                        <td class="s-eddf4d">Total</td>
                        <td class="s-1a6540">${ssTotal.toFixed(4)}</td>
                        <td class="s-1a6540">${dfTotal}</td>
                        <td class="s-1a6540">—</td>
                        <td class="s-1a6540">—</td>
                        <td class="s-1a6540">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Conclusion -->
        <div class="s-d9a232 gen-pad ${rejectH0 ? 'tp-ok-6' : 'tp-bad-6'}">
            <h3 class="s-5e9494">📌 Conclusion</h3>
            <div><strong>F-statistic:</strong> ${fStatistic.toFixed(6)}</div>
            <div><strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div class="s-0aae12">
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Interpretation:</strong> ${rejectH0 ? 'There IS sufficient evidence that group means differ after controlling for the covariate.' : 'There is NOT sufficient evidence that group means differ after controlling for the covariate.'}
            </div>
        </div>
        
        <!-- Adjusted Means -->
        <div class="s-d14fe6">
            <h4 class="s-be30d6">📊 Adjusted Group Means</h4>
            <div class="s-457476 gen-grid">
                ${Array.from(adjustedMeans.entries()).map(([g, mean]) => `
                    <div class="s-6502eb">
                        <strong>Group ${g}</strong><br>
                        Original: ${groupMeans.get(g).toFixed(4)}<br>
                        Adjusted: <strong class="s-ece993">${mean.toFixed(4)}</strong>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>`;
    
    return { fStatistic, dfBetween, dfWithin, pValue, rejectH0, steps, adjustedMeans };
}

// ========== SETUP FUNCTIONS ==========
function setupANCOVALogic() {
    const computeBtn = document.getElementById("ancovaComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("ancovaData").value;
        const alpha = parseFloat(document.getElementById("ancovaAlpha").value);
        const resultDiv = document.getElementById("ancovaResultArea");
        const valueSpan = document.getElementById("ancovaValueDisplay");
        const stepsSpan = document.getElementById("ancovaStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format: Y, Group, Covariate");
            return;
        }
        
        const result = computeANCOVA(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `F = ${result.fStatistic.toFixed(4)} | df = (${result.dfBetween}, ${result.dfWithin}) | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("ancovaClearBtn", "ancovaData", "ancovaResultArea");
}
