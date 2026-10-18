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
                    placeholder: "Example:&#10;Dependent Y, Group, Covariate X&#10;12, A, 5&#10;15, A, 6&#10;14, A, 4&#10;18, B, 7&#10;20, B, 8&#10;19, B, 6&#10;25, C, 9&#10;27, C, 10&#10;24, C, 8"
                }
            },
            {
                hint: "<strong>Format:</strong> Each row: Y (outcome), Group (categorical), X1 (covariate), X2 (optional), ...<br>\n                    <strong>Example:</strong> 12, A, 5 means Y=12, Group=A, Covariate=5",
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
    let group = data.map(row => row[1].toString());
    
    // Third column and beyond are covariates (use first covariate for simplicity)
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
        groupTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center; font-weight: bold;">${g}</td>
            <td style="padding: 10px; text-align: center;">${groupSizes.get(g)}</td>
            <td style="padding: 10px; text-align: center;">${sumY}</td>
            <td style="padding: 10px; text-align: center; font-weight: bold; color: #1a5490;">${groupMeans.get(g).toFixed(6)}</td>
            <td style="padding: 10px; text-align: center;">${sumCov}</td>
            <td style="padding: 10px; text-align: center;">${groupCovMeans.get(g).toFixed(6)}</td>
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
    const rejectH0 = fStatistic > criticalValue;
    
    // Build input data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        dataRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${y[i]}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: #1a5490;">${group[i]}</td>
            <td style="padding: 8px; text-align: center;">${cov[i]}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📊</span>
                <h2 style="margin: 0;">Analysis of Covariance (ANCOVA)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Testing group differences while controlling for covariates</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: All group means are equal after adjusting for covariates</p>
        </div>
        
        <!-- Input Data -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Input Data</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">#</th>
                        <th style="padding: 10px;">Y (Outcome)</th>
                        <th style="padding: 10px;">Group</th>
                        <th style="padding: 10px;">X (Covariate)</th>
                    </tr></thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 1: Group Means -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 1: Calculate Group Means for Y and Covariate X</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">Group</th>
                        <th style="padding: 10px;">n</th>
                        <th style="padding: 10px;">ΣY</th>
                        <th style="padding: 10px;">Mean Y (Ȳⱼ)</th>
                        <th style="padding: 10px;">ΣX</th>
                        <th style="padding: 10px;">Mean X (X̄ⱼ)</th>
                    </tr></thead>
                    <tbody>${groupTableRows}</tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 2: Grand Mean -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Grand Means</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div><strong>Grand Mean of Y (Ȳ):</strong> ${grandMean.toFixed(6)}</div>
                <div><strong>Grand Mean of X (X̄):</strong> ${covMean.toFixed(6)}</div>
            </div>
        </div>
        
        <!-- Step 3: Total Sum of Squares -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate Total Sum of Squares (SS<sub>Total</sub>)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;"><strong>Formula:</strong> SS<sub>Total</sub> = Σ(Yᵢ - Ȳ)²</div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 12px 0;">
                    ${ssTotalDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Total</sub> = ${ssTotal.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- Step 4: Within-Group SS (Unadjusted) -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 4: Calculate Within-Group SS (Unadjusted)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;"><strong>Formula:</strong> SS<sub>Within</sub> = Σ(Yᵢ - Ȳⱼ)²</div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 12px 0;">
                    ${ssWithinUnadjDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Within, unadj</sub> = ${ssWithinUnadj.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- Step 5: Regression Coefficient -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 5: Calculate Regression Coefficient (β)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;"><strong>Formula:</strong> β = Σ(Yᵢ - Ȳ<sub>group</sub>)(Xᵢ - X̄<sub>group</sub>) / Σ(Xᵢ - X̄<sub>group</sub>)²  (pooled within-group slope)</div>
                
                <div><strong>Numerator Σ(Yᵢ - Ȳ<sub>group</sub>)(Xᵢ - X̄<sub>group</sub>):</strong></div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 8px 0;">
                    ${xyDetails.join('<br>')}
                    <strong>Σ = ${xySum.toFixed(6)}</strong>
                </div>
                
                <div><strong>Denominator Σ(Xᵢ - X̄<sub>group</sub>)²:</strong></div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 8px 0;">
                    ${xxDetails.join('<br>')}
                    <strong>Σ = ${xxSum.toFixed(6)}</strong>
                </div>
                
                <div><strong>β = ${xySum.toFixed(6)} / ${xxSum.toFixed(6)} = <span style="color: #1a5490; font-weight: bold;">${beta.toFixed(6)}</span></strong></div>
            </div>
        </div>
        
        <!-- Step 6: Adjusted Means -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 6: Calculate Adjusted Group Means</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;"><strong>Formula:</strong> Ȳⱼ<sub>adj</sub> = Ȳⱼ - β × (X̄ⱼ - X̄)</div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 12px 0;">
                    ${adjMeanDetails.join('<br>')}
                </div>
            </div>
        </div>
        
        <!-- Step 7: Adjusted Within-Group SS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 7: Calculate Adjusted Within-Group SS</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    ${ssWithinAdjDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Within, adj</sub> = ${ssWithinAdj.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- ANCOVA Summary Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 2px solid #1a5490; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 ANCOVA Summary Table</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;">
                    <th style="padding: 12px;">Source</th>
                    <th style="padding: 12px;">SS</th>
                    <th style="padding: 12px;">df</th>
                    <th style="padding: 12px;">MS</th>
                    <th style="padding: 12px;">F</th>
                    <th style="padding: 12px;">p-value</th>
                </tr></thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Covariate (X)</td>
                        <td style="text-align: center;">${ssCovariate.toFixed(4)}</td>
                        <td style="text-align: center;">1</td>
                        <td style="text-align: center;">${ssCovariate.toFixed(4)}</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Between Groups (Adjusted)</td>
                        <td style="text-align: center;">${ssBetweenAdj.toFixed(4)}</td>
                        <td style="text-align: center;">${dfBetween}</td>
                        <td style="text-align: center;">${msBetween.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle; font-weight: bold; font-size: 18px;">${fStatistic.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle;">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Within Groups (Error)</td>
                        <td style="text-align: center;">${ssWithinAdj.toFixed(4)}</td>
                        <td style="text-align: center;">${dfWithin}</td>
                        <td style="text-align: center;">${msWithin.toFixed(4)}</td>
                    </tr>
                    <tr style="background: #e9ecef;">
                        <td style="padding: 12px; font-weight: bold;">Total</td>
                        <td style="text-align: center;">${ssTotal.toFixed(4)}</td>
                        <td style="text-align: center;">${dfTotal}</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Conclusion -->
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Conclusion</h3>
            <div><strong>F-statistic:</strong> ${fStatistic.toFixed(6)}</div>
            <div><strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Interpretation:</strong> ${rejectH0 ? 'There IS sufficient evidence that group means differ after controlling for the covariate.' : 'There is NOT sufficient evidence that group means differ after controlling for the covariate.'}
            </div>
        </div>
        
        <!-- Adjusted Means -->
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px;">
            <h4 style="margin: 0 0 8px 0;">📊 Adjusted Group Means</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                ${Array.from(adjustedMeans.entries()).map(([g, mean]) => `
                    <div style="background: white; padding: 8px; border-radius: 8px; text-align: center;">
                        <strong>Group ${g}</strong><br>
                        Original: ${groupMeans.get(g).toFixed(4)}<br>
                        Adjusted: <strong style="color: #1a5490;">${mean.toFixed(4)}</strong>
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
