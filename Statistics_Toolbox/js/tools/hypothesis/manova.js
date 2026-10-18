/* MANOVA: manova tool (render, compute, setup) */

// ========== MANOVA INTERFACE RENDER ==========
function renderMANOVAInterface() {
    return buildInterface({
        id: "statMANOVAInterface",
        title: "📈 MANOVA (Multivariate Analysis of Variance)",
        formula: "📌 Tests group differences across multiple dependent variables",
        desc: "<strong>What is MANOVA?</strong><br>\n                    MANOVA extends ANOVA to handle multiple correlated dependent variables simultaneously.<br><br>\n                    <strong>Test statistics:</strong> Wilks' Lambda (Λ), Pillai's Trace, Hotelling's Trace<br><br>\n                    <strong>H₀:</strong> All group mean vectors are equal<br>\n                    <strong>H₁:</strong> At least one group mean vector differs",
        inputs: [
            {
                label: "📋 Enter data (format: group, Y1, Y2, Y3, ...):",
                textarea: {
                    id: "manovaData",
                    rows: "6",
                    placeholder: "Example:&#10;Group, Y1, Y2, Y3&#10;A, 12, 15, 14&#10;A, 14, 16, 17&#10;A, 13, 14, 13&#10;B, 18, 20, 19&#10;B, 20, 22, 24&#10;B, 19, 21, 20&#10;C, 25, 27, 26&#10;C, 27, 29, 28&#10;C, 26, 28, 30"
                }
            },
            {
                hint: "<strong>Format:</strong> First column = Group, remaining columns = Dependent variables<br>\n                    <strong>Example:</strong> A, 12, 15, 14 means Group=A, Y1=12, Y2=15, Y3=14",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "manovaAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "manovaComputeBtn", text: "📈 Run MANOVA + Full Steps" },
        clear: { id: "manovaClearBtn", text: "Clear" },
        result: {
            area: "manovaResultArea",
            label: "🎯 MANOVA RESULTS",
            value: "manovaValueDisplay",
            steps: "manovaStepsDisplay"
        }
    });
}

// ========== MANOVA COMPUTATION ==========
function computeMANOVA(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    // Parse input data
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;
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
        if (values.length >= 3) {
            const nonNumeric = values.slice(1).some(v => typeof v !== 'number');
            if (nonNumeric && data.length === 0) continue;   // header row such as "Group, Y1, Y2, Y3"
            if (nonNumeric) {
                return { error: true, message: `Line ${i + 1} ("${line}") has a non-numeric value. After the group label every value must be a number.` };
            }
            data.push(values);
        }
    }
    
    if (data.length < 6) {
        return { error: true, message: `Need at least 6 observations for MANOVA. You provided ${data.length}.` };
    }
    
    // Extract data
    const groups = [...new Set(data.map(row => row[0].toString()))];
    const k = groups.length;
    const p = data[0].length - 1;
    const n = data.length;
    
    if (k < 2) {
        return { error: true, message: `Need at least 2 groups for MANOVA. Found groups: ${groups.join(', ')}` };
    }
    
    if (p < 2) {
        return { error: true, message: `Need at least 2 dependent variables for MANOVA. Found ${p} dependent variable(s).` };
    }
    
    // Extract dependent variables
    let y = [];
    for (let j = 0; j < p; j++) {
        y.push(data.map(row => parseFloat(row[j + 1])));
    }
    let group = data.map(row => row[0].toString());
    
    // ========== STEP 1: Grand Means ==========
    let grandMeans = [];
    let grandMeanCalculations = [];
    for (let j = 0; j < p; j++) {
        let sum = y[j].reduce((a,b) => a+b, 0);
        let mean = sum / n;
        grandMeans.push(mean);
        grandMeanCalculations.push(`Ȳ<sub>${j+1}</sub> = (${y[j].join(' + ')}) / ${n} = ${sum} / ${n} = ${mean.toFixed(4)}`);
    }
    
    // ========== STEP 2: Group Means ==========
    let groupMeans = [];
    let groupSizes = new Map();
    let groupMeanCalculations = [];
    
    for (let g of groups) {
        let indices = [];
        for (let idx = 0; idx < group.length; idx++) {
            if (group[idx] === g) indices.push(idx);
        }
        groupSizes.set(g, indices.length);
        let means = [];
        let calcText = `<strong>Group ${g}:</strong><br>`;
        for (let j = 0; j < p; j++) {
            let sum = 0;
            let values = [];
            for (let idx of indices) {
                sum += y[j][idx];
                values.push(y[j][idx]);
            }
            let mean = sum / indices.length;
            means.push(mean);
            calcText += `&nbsp;&nbsp;Ȳ<sub>${j+1}</sub> = (${values.join(' + ')}) / ${indices.length} = ${sum} / ${indices.length} = ${mean.toFixed(4)}<br>`;
        }
        groupMeanCalculations.push(calcText);
        groupMeans.push({ group: g, means: means, n: indices.length, indices: indices });
    }
    
    // ========== STEP 3: Total SSCP Matrix (T) with DETAILED CALCULATIONS ==========
    let T = Array(p).fill().map(() => Array(p).fill(0));
    let totalDeviationDetails = [];
    let totalMatrixCalculations = [];
    
    // Calculate deviation scores for each observation
    for (let i = 0; i < n; i++) {
        let deviations = [];
        for (let a = 0; a < p; a++) {
            let dev = y[a][i] - grandMeans[a];
            deviations.push(dev);
        }
        totalDeviationDetails.push({
            obs: i+1,
            group: group[i],
            values: y.map((_, idx) => y[idx][i]),
            deviations: deviations
        });
        
        // Calculate contributions to T matrix
        let rowCalculations = [];
        for (let a = 0; a < p; a++) {
            for (let b = 0; b < p; b++) {
                let product = deviations[a] * deviations[b];
                T[a][b] += product;
                if (a === 0 && b === 0) {
                    rowCalculations.push(`(${deviations[a].toFixed(4)})² = ${product.toFixed(4)}`);
                } else if (a === 0 && b === 1) {
                    rowCalculations.push(`${deviations[a].toFixed(4)} × ${deviations[b].toFixed(4)} = ${product.toFixed(4)}`);
                }
            }
        }
        totalMatrixCalculations.push(`Observation ${i+1}: ${rowCalculations.join(', ')}`);
    }
    
    // ========== STEP 4: Within-Group SSCP Matrix (W) with DETAILED CALCULATIONS ==========
    let W = Array(p).fill().map(() => Array(p).fill(0));
    let withinDeviationDetails = [];
    let withinMatrixCalculations = [];
    
    for (let gm of groupMeans) {
        let groupCalcDetails = [];
        for (let idx of gm.indices) {
            let deviations = [];
            for (let a = 0; a < p; a++) {
                let dev = y[a][idx] - gm.means[a];
                deviations.push(dev);
            }
            withinDeviationDetails.push({
                obs: idx+1,
                group: gm.group,
                values: y.map((_, j) => y[j][idx]),
                groupMeans: gm.means,
                deviations: deviations
            });
            
            let rowCalculations = [];
            for (let a = 0; a < p; a++) {
                for (let b = 0; b < p; b++) {
                    let product = deviations[a] * deviations[b];
                    W[a][b] += product;
                    if (a === 0 && b === 0) {
                        rowCalculations.push(`(${deviations[a].toFixed(4)})² = ${product.toFixed(4)}`);
                    } else if (a === 0 && b === 1) {
                        rowCalculations.push(`${deviations[a].toFixed(4)} × ${deviations[b].toFixed(4)} = ${product.toFixed(4)}`);
                    }
                }
            }
            groupCalcDetails.push(`Observation ${idx+1}: ${rowCalculations.join(', ')}`);
        }
        withinMatrixCalculations.push({ group: gm.group, calculations: groupCalcDetails });
    }
    
    // ========== STEP 5: Between-Group SSCP Matrix (B) ==========
    let B = Array(p).fill().map(() => Array(p).fill(0));
    let betweenCalculations = [];
    
    for (let gm of groupMeans) {
        let calcText = `<strong>Group ${gm.group}:</strong><br>`;
        for (let a = 0; a < p; a++) {
            for (let b = 0; b < p; b++) {
                let diffA = gm.means[a] - grandMeans[a];
                let diffB = gm.means[b] - grandMeans[b];
                let contribution = gm.n * diffA * diffB;
                B[a][b] += contribution;
                if (a === 0 && b === 0) {
                    calcText += `&nbsp;&nbsp;${gm.n} × (${gm.means[a].toFixed(4)} - ${grandMeans[a].toFixed(4)})² = ${contribution.toFixed(4)}<br>`;
                } else if (a === 0 && b === 1) {
                    calcText += `&nbsp;&nbsp;${gm.n} × (${gm.means[a].toFixed(4)} - ${grandMeans[a].toFixed(4)}) × (${gm.means[b].toFixed(4)} - ${grandMeans[b].toFixed(4)}) = ${contribution.toFixed(4)}<br>`;
                }
            }
        }
        betweenCalculations.push(calcText);
    }
    
    // ========== STEP 6: Calculate Eigenvalues ==========
    let W_inv = inverseMatrix(W);
    if (!W_inv) {
        return { error: true, message: "The within-group covariance matrix is singular, so MANOVA cannot be computed. This happens when a dependent variable is constant within the groups, two dependent variables are perfectly correlated (one is a multiple or sum of another), or there are too few observations per group (each group needs more observations than there are dependent variables). Remove the redundant variable or add more data." };
    }
    let B_Winv = multiplyMatrices(B, W_inv);
    let eigenvalues = computeEigenvalues(B_Winv);
    
    // ========== STEP 7: Test Statistics ==========
    let wilksLambda = 1;
    let pillaiTrace = 0;
    for (let lambda of eigenvalues) {
        if (lambda > 0) {
            wilksLambda *= 1 / (1 + lambda);
            pillaiTrace += lambda / (1 + lambda);
        }
    }
    let hotellingTrace = eigenvalues.reduce((a,b) => a+b, 0);
    let roysRoot = Math.max(...eigenvalues);
    
    // ========== STEP 8: F-statistic ==========
    // Rao's F approximation to Wilks' Lambda (exact when p = 1, 2 or q = 1, 2)
    const q = k - 1;
    const rao = (n - k) - (p - q + 1) / 2;
    const raoU = (p * q - 2) / 4;
    const raoT = (p * p + q * q - 5) > 0 ? Math.sqrt((p * p * q * q - 4) / (p * p + q * q - 5)) : 1;
    let df1 = p * q;
    let df2 = rao * raoT - 2 * raoU;
    let fStatistic = 0;
    if (wilksLambda > 0 && wilksLambda < 1 && df2 > 0) {
        const root = Math.pow(wilksLambda, 1 / raoT);
        fStatistic = (1 - root) / root * df2 / df1;
    }
    if (isNaN(fStatistic) || !isFinite(fStatistic)) fStatistic = 0;
    
    const criticalValue = fCriticalValue(alpha, df1, df2);
    const pValue = 1 - fCDF(fStatistic, df1, df2);
    const rejectH0 = fStatistic > criticalValue;
    
    // Build data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        let dvCells = '';
        for (let j = 0; j < p; j++) {
            dvCells += `<td style="padding: 8px; text-align: center;">${y[j][i]}</td>`;
        }
        dataRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: #1a5490;">${group[i]}</td>
            ${dvCells}
        </tr>`;
    }
    
    // Build group means table
    let meansRows = '';
    for (let gm of groupMeans) {
        let meanCells = '';
        for (let j = 0; j < p; j++) {
            meanCells += `<td style="text-align: center; font-weight: bold; color: #1a5490;">${gm.means[j].toFixed(4)}</td>`;
        }
        meansRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; font-weight: bold;">${gm.group}</td>
            <td style="text-align: center;">${gm.n}</td>
            ${meanCells}
        </tr>`;
    }
    
    // Build deviation table for Total SSCP
    let deviationRows = '';
    for (let d of totalDeviationDetails) {
        let devCells = '';
        for (let j = 0; j < p; j++) {
            devCells += `<td style="text-align: center;">${d.values[j]} - ${grandMeans[j].toFixed(4)} = ${d.deviations[j].toFixed(4)}</td>`;
        }
        deviationRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="text-align: center;">${d.obs}</td>
            <td style="text-align: center; font-weight: bold;">${d.group}</td>
            ${devCells}
        </tr>`;
    }
    
    // Build deviation table for Within SSCP
    let withinDevRows = '';
    for (let d of withinDeviationDetails) {
        let devCells = '';
        let groupMeanDisplay = d.groupMeans.map(m => m.toFixed(4)).join(', ');
        for (let j = 0; j < p; j++) {
            devCells += `<td style="text-align: center;">${d.values[j]} - ${d.groupMeans[j].toFixed(4)} = ${d.deviations[j].toFixed(4)}</td>`;
        }
        withinDevRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="text-align: center;">${d.obs}</td>
            <td style="text-align: center; font-weight: bold;">${d.group}</td>
            <td style="font-size: 11px; color: #666;">Group Means: (${groupMeanDisplay})</td>
            ${devCells}
         </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 45px;">📈</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">Multivariate Analysis of Variance (MANOVA)</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">A statistical test that compares group differences across MULTIPLE dependent variables simultaneously</p>
                </div>
            </div>
        </div>
        
        <!-- INTRODUCTION SECTION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📖 What is MANOVA?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490; margin-top: 0;">🎯 Definition</h3>
                <p style="line-height: 1.6; font-size: 15px;">MANOVA is an extension of ANOVA that allows you to test whether there are significant differences between groups on <strong>TWO OR MORE dependent variables simultaneously</strong>.</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="color: #28a745; margin-top: 0;">✅ When to Use MANOVA?</h3>
                    <ul style="line-height: 1.8;">
                        <li>You have <strong>2+ dependent variables</strong> that are correlated</li>
                        <li>You want to <strong>control Type I error</strong> (running multiple ANOVAs increases error rate)</li>
                        <li>You want to detect <strong>patterns across multiple outcomes</strong></li>
                        <li>Your dependent variables measure <strong>different aspects</strong> of a construct</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="color: #dc3545; margin-top: 0;">❌ When NOT to Use MANOVA?</h3>
                    <ul style="line-height: 1.8;">
                        <li>Dependent variables are <strong>not correlated</strong></li>
                        <li>You have <strong>only one dependent variable</strong> (use ANOVA instead)</li>
                        <li>Your sample size is <strong>too small</strong></li>
                        <li>Assumptions are <strong>severely violated</strong></li>
                    </ul>
                </div>
            </div>
            
            <div style="background: #fff3cd; border-radius: 15px; padding: 20px; border-left: 5px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">💡 Real-World Example</h3>
                <p style="margin: 0; line-height: 1.6;">A researcher wants to compare three teaching methods (Group A, B, C) on TWO outcomes: <strong>exam score AND student satisfaction</strong>. Instead of running two separate ANOVAs (which increases error rate), they use MANOVA to test both outcomes together.</p>
            </div>
        </div>
        
        <!-- HYPOTHESIS SECTION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📊 Hypotheses in MANOVA</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <h3 style="color: #28a745;">Null Hypothesis (H₀)</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; font-family: monospace; font-size: 16px;">
                        μ₁ = μ₂ = μ₃ = ... = μ<sub>k</sub>
                    </div>
                    <p style="margin-top: 10px;">The mean vectors of all groups are equal.<br>No difference exists between groups.</p>
                </div>
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <h3 style="color: #dc3545;">Alternative Hypothesis (H₁)</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; font-family: monospace; font-size: 16px;">
                        At least one μ<sub>i</sub> ≠ μ<sub>j</sub>
                    </div>
                    <p style="margin-top: 10px;">At least one group's mean vector is different from others.<br>There is a significant difference between groups.</p>
                </div>
            </div>
        </div>
        
        <!-- INPUT DATA SECTION -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📋 Step 1: Input Data</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">#</th>
                        <th style="padding: 12px;">Group</th>
                        ${Array(p).fill().map((_, j) => `<th style="padding: 12px;">Y<sub>${j+1}</sub></th>`).join('')}
                    </tr></thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Data Summary:</strong> ${n} total observations, ${k} groups, ${p} dependent variables
            </div>
        </div>
        
        <!-- STEP 2: GRAND MEANS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 2: Calculate Grand Means (Ȳ)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> Grand Mean = (Sum of all values) / (Total number of observations)
                </div>
                ${grandMeanCalculations.map(calc => `<div style="margin-bottom: 10px;">${calc}</div>`).join('')}
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation:</strong> Grand means represent the overall average of each dependent variable across ALL groups.
                </div>
            </div>
        </div>
        
        <!-- STEP 3: GROUP MEANS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 3: Calculate Group Means (Ȳⱼ)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> Group Mean = (Sum of values in group) / (Number in group)
                </div>
                ${groupMeanCalculations.map(calc => `<div style="margin-bottom: 15px;">${calc}</div>`).join('')}
                <div style="overflow-x: auto; margin-top: 15px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #1a5490; color: white;">
                            <th style="padding: 12px;">Group</th>
                            <th style="padding: 12px;">n</th>
                            ${Array(p).fill().map((_, j) => `<th style="padding: 12px;">Mean Y<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${meansRows}</tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation:</strong> Group means show how each group performs on each dependent variable. Large differences suggest possible group effects.
                </div>
            </div>
        </div>
        
        <!-- WHAT ARE SSCP MATRICES? -->
        <div style="background: #f0f4fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📐 Understanding SSCP Matrices</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">What is SSCP?</h3>
                <p><strong>SSCP = Sum of Squares and Cross Products</strong></p>
                <p>It's like variance-covariance, but for multivariate data:</p>
                <ul>
                    <li><strong>Diagonal elements</strong> = Sum of Squares (variance of one variable)</li>
                    <li><strong>Off-diagonal elements</strong> = Cross Products (covariance between variables)</li>
                </ul>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <strong>Example for 2 variables (Y₁, Y₂):</strong><br>
                    T = [ Σ(Y₁-Ȳ₁)² , Σ(Y₁-Ȳ₁)(Y₂-Ȳ₂) ]<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;[ Σ(Y₂-Ȳ₂)(Y₁-Ȳ₁) , Σ(Y₂-Ȳ₂)² ]
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <div style="font-size: 36px;">📊</div>
                    <h3>T (Total)</h3>
                    <p>Total variability in all DVs</p>
                    <p style="font-size: 12px; color: #666;">Measures overall spread</p>
                </div>
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <div style="font-size: 36px;">📈</div>
                    <h3>W (Within)</h3>
                    <p>Error/Residual variability</p>
                    <p style="font-size: 12px; color: #666;">Unexplained variation</p>
                </div>
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <div style="font-size: 36px;">🎯</div>
                    <h3>B (Between)</h3>
                    <p>Variability explained by groups</p>
                    <p style="font-size: 12px; color: #666;">Treatment effect</p>
                </div>
            </div>
            
            <div style="background: #d4edda; border-radius: 15px; padding: 15px; margin-top: 15px; text-align: center;">
                <strong>Relationship:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 18px;">T = B + W</span>
            </div>
        </div>
        
        <!-- STEP 4: TOTAL SSCP MATRIX (T) - DETAILED -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 4: Calculate Total SSCP Matrix (T)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> T = Σ(Yᵢ - Ȳ)(Yᵢ - Ȳ)<sup>T</sup>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>🔍 What does this formula mean?</strong><br>
                    For each observation, we calculate how far it deviates from the grand mean (Yᵢ - Ȳ).<br>
                    Then we multiply this deviation vector by itself (outer product) and sum across all observations.
                </div>
                
                <h3 style="color: #1a5490;">Step 4a: Calculate Deviation Scores (Yᵢ - Ȳ)</h3>
                <div style="overflow-x: auto; margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #1a5490; color: white;">
                            <th style="padding: 8px;">#</th>
                            <th style="padding: 8px;">Group</th>
                            ${Array(p).fill().map((_, j) => `<th style="padding: 8px;">Y<sub>${j+1}</sub> - Ȳ<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${deviationRows}</tbody>
                    </table>
                </div>
                
                <h3 style="color: #1a5490;">Step 4b: Calculate Cross Products and Sum</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px; font-family: monospace; font-size: 13px;">
                    ${totalMatrixCalculations.join('<br>')}
                </div>
                
                <h3 style="color: #1a5490;">Step 4c: Final T Matrix</h3>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; font-family: monospace; text-align: center;">
                    <strong>T Matrix (${p}×${p}):</strong><br>
                    ${T.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    💡 <strong>What does T represent?</strong> T measures the TOTAL variation in all dependent variables. 
                    The diagonal elements are Sum of Squares (variance within each DV), and off-diagonals are Cross Products (covariance between DVs).
                </div>
            </div>
        </div>
        
        <!-- STEP 5: WITHIN-GROUP SSCP MATRIX (W) - DETAILED -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 5: Calculate Within-Group SSCP Matrix (W)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> W = Σⱼ Σ(Yᵢⱼ - Ȳⱼ)(Yᵢⱼ - Ȳⱼ)<sup>T</sup>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>🔍 What does this formula mean?</strong><br>
                    For each observation, we calculate how far it deviates from its OWN GROUP MEAN (Yᵢⱼ - Ȳⱼ).<br>
                    This measures variation WITHIN groups - the "error" or "unexplained" variation.
                </div>
                
                <h3 style="color: #1a5490;">Step 5a: Calculate Deviation Scores (Yᵢⱼ - Ȳⱼ)</h3>
                <div style="overflow-x: auto; margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #1a5490; color: white;">
                            <th style="padding: 8px;">#</th>
                            <th style="padding: 8px;">Group</th>
                            <th style="padding: 8px;">Group Means</th>
                            ${Array(p).fill().map((_, j) => `<th style="padding: 8px;">Y<sub>${j+1}</sub> - Ȳⱼ<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${withinDevRows}</tbody>
                    </table>
                </div>
                
                <h3 style="color: #1a5490;">Step 5b: Calculate Cross Products and Sum Within Each Group</h3>
                ${withinMatrixCalculations.map(g => `
                    <div style="margin-bottom: 15px;">
                        <strong>Group ${g.group}:</strong>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; margin-top: 5px;">
                            ${g.calculations.join('<br>')}
                        </div>
                    </div>
                `).join('')}
                
                <h3 style="color: #1a5490;">Step 5c: Final W Matrix</h3>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; font-family: monospace; text-align: center;">
                    <strong>W Matrix (${p}×${p}):</strong><br>
                    ${W.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    💡 <strong>What does W represent?</strong> W measures the VARIATION WITHIN each group. 
                    If W is small, it means observations within groups are very similar (low error variance).<br>
                    <strong>Key insight:</strong> W represents the "noise" or "unexplained" variation that cannot be attributed to group differences.
                </div>
            </div>
        </div>
        
        <!-- STEP 6: BETWEEN-GROUP SSCP MATRIX (B) -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 6: Calculate Between-Group SSCP Matrix (B)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> B = Σ nⱼ(Ȳⱼ - Ȳ)(Ȳⱼ - Ȳ)<sup>T</sup>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>🔍 What does this formula mean?</strong><br>
                    This measures how far each GROUP MEAN deviates from the GRAND MEAN, weighted by group size.<br>
                    This represents the "signal" or "explained" variation - the part attributed to group differences.
                </div>
                
                <h3 style="color: #1a5490;">Step 6a: Calculate Group Mean Deviations and Contributions</h3>
                ${betweenCalculations.map(calc => `<div style="margin-bottom: 15px;">${calc}</div>`).join('')}
                
                <h3 style="color: #1a5490;">Step 6b: Final B Matrix</h3>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; font-family: monospace; text-align: center;">
                    <strong>B Matrix (${p}×${p}):</strong><br>
                    ${B.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    💡 <strong>Check the relationship:</strong> T = B + W?<br>
                    T[0,0] = ${T[0][0].toFixed(2)} = B[0,0] (${B[0][0].toFixed(2)}) + W[0,0] (${W[0][0].toFixed(2)}) = ${(B[0][0] + W[0][0]).toFixed(2)} ✅
                </div>
                
                <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation:</strong> B represents the VARIATION BETWEEN groups. 
                    Larger B relative to W means groups are more different (stronger treatment effect).
                </div>
            </div>
        </div>
        
        <!-- EIGENVALUES EXPLANATION -->
        <div style="background: #f0f4fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📊 Step 7: Understanding Eigenvalues in MANOVA</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <p><strong>What are Eigenvalues?</strong> In MANOVA, eigenvalues (λ) represent how well the dependent variables separate the groups. We solve |B - λW| = 0 to find λ.</p>
                <ul>
                    <li><strong>Large λ</strong> → Strong group separation on that dimension</li>
                    <li><strong>Small λ</strong> → Weak group separation</li>
                    <li><strong>λ = 0</strong> → No group separation</li>
                </ul>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; margin-top: 15px; font-family: monospace;">
                    <strong>Eigenvalues (λ):</strong> ${eigenvalues.map(l => l.toFixed(4)).join(', ')}
                </div>
                <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation:</strong> ${eigenvalues[0] > 1 ? 'The first eigenvalue > 1 suggests strong group separation.' : 'The eigenvalues suggest moderate group separation.'}
                </div>
            </div>
        </div>
        
        <!-- MANOVA TEST STATISTICS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 8: Calculate MANOVA Test Statistics</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">Four Common MANOVA Test Statistics</h3>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <strong>1. Wilks' Lambda (Λ)</strong><br>
                    Formula: Λ = ∏(1/(1+λᵢ)) = ${wilksLambda.toFixed(6)}<br>
                    <span style="font-size: 13px;">📌 Range: 0 to 1 | Smaller values = stronger group differences | Most commonly reported</span>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <strong>2. Pillai's Trace (V)</strong><br>
                    Formula: V = Σ(λᵢ/(1+λᵢ)) = ${pillaiTrace.toFixed(6)}<br>
                    <span style="font-size: 13px;">📌 Range: 0 to 1 | More robust to violations | Recommended for unequal sample sizes</span>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <strong>3. Hotelling's Trace (T²)</strong><br>
                    Formula: T² = Σ λᵢ = ${hotellingTrace.toFixed(6)}<br>
                    <span style="font-size: 13px;">📌 Range: 0 to ∞ | Most powerful when assumptions are met</span>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <strong>4. Roy's Largest Root (θ)</strong><br>
                    Formula: θ = max(λᵢ) = ${roysRoot.toFixed(6)}<br>
                    <span style="font-size: 13px;">📌 Range: 0 to ∞ | Most powerful when one eigenvalue dominates</span>
                </div>
            </div>
        </div>
        
        <!-- F-STATISTIC CALCULATION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 9: Calculate F-statistic (from Wilks' Lambda)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula (Rao's approximation):</strong> F = (1 - Λ^{1/t}) / Λ^{1/t} × df₂ / df₁
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <strong>t = √((p²q² - 4)/(p² + q² - 5))</strong> (q = k-1) = ${raoT.toFixed(6)}
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <strong>df₁ = p × q</strong> = ${p} × ${q} = ${df1}
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <strong>df₂ = t × (n - k - (p - q + 1)/2) - (pq - 2)/2</strong> = ${df2.toFixed(4)}
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <strong>Λ^{1/t}</strong> = ${Math.pow(wilksLambda, 1/raoT).toFixed(6)}
                    </div>
                </div>
                
                <div style="font-size: 24px; font-weight: bold; color: #1a5490; text-align: center; padding: 20px; background: #e8f4f8; border-radius: 10px;">
                    F = ${fStatistic.toFixed(6)}
                </div>
                
                <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation of F:</strong> The F-statistic compares the between-group variance to the within-group variance. Larger F = stronger evidence of group differences.
                </div>
            </div>
        </div>
        
        <!-- MANOVA SUMMARY TABLE -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 MANOVA Summary Table</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 15px;">Test Statistic</th>
                        <th style="padding: 15px;">Value</th>
                        <th style="padding: 15px;">F-value</th>
                        <th style="padding: 15px;">df₁</th>
                        <th style="padding: 15px;">df₂</th>
                        <th style="padding: 15px;">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Wilks' Lambda (Λ)</td>
                        <td style="text-align: center;">${wilksLambda.toFixed(6)}</td>
                        <td style="text-align: center;">${fStatistic.toFixed(4)}</td>
                        <td style="text-align: center;">${df1}</td>
                        <td style="text-align: center;">${df2}</td>
                        <td style="text-align: center;">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Pillai's Trace (V)</td>
                        <td style="text-align: center;" colspan="5">${pillaiTrace.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Hotelling's Trace (T²)</td>
                        <td style="text-align: center;" colspan="5">${hotellingTrace.toFixed(6)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Roy's Largest Root (θ)</td>
                        <td style="text-align: center;" colspan="5">${roysRoot.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- CONCLUSION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${rejectH0 ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'} margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">📌 Step 10: Statistical Decision</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>F-statistic:</strong> ${fStatistic.toFixed(6)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>Comparison:</strong> ${fStatistic > criticalValue ? 'F > Critical Value' : 'F < Critical Value'}
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3 style="margin-top: 0;">Decision Rule:</h3>
                <p>If p-value < α (${alpha}), we REJECT the null hypothesis.</p>
                <p>Here, p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <h3>Final Decision:</h3>
                <div style="font-size: 20px; font-weight: bold; margin: 15px 0;">
                    ${rejectH0 ? '✅ REJECT H₀' : '❌ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Interpretation:</h3>
                <p style="font-size: 16px; line-height: 1.6;">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group mean vectors differ across the dependent variables. ' +
                        'This means that the groups are significantly different when considering all dependent variables together.' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group mean vectors differ across the dependent variables. ' +
                        'This means that the groups are not significantly different when considering all dependent variables together.'}
                </p>
            </div>
        </div>
        
        <!-- FOLLOW-UP SECTION -->
        <div style="background: #e8f4f8; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #1a5490;">📌 What to Do After a Significant MANOVA?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <p>If MANOVA is significant, follow up with:</p>
                <ol style="line-height: 1.8;">
                    <li><strong>Separate ANOVAs</strong> for each dependent variable (with Bonferroni correction)</li>
                    <li><strong>Discriminant Analysis</strong> to identify which variables contribute most to group separation</li>
                    <li><strong>Post-hoc tests</strong> to determine which specific groups differ</li>
                </ol>
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px; margin-top: 15px;">
                    💡 <strong>Bonferroni Correction:</strong> α<sub>adjusted</sub> = α / p = ${alpha} / ${p} = ${(alpha/p).toFixed(4)}
                </div>
            </div>
        </div>
        
        <!-- ASSUMPTIONS SECTION -->
        <div style="background: #f0f4fa; border-radius: 20px; padding: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #1a5490;">⚠️ Important MANOVA Assumptions</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background: white; border-radius: 12px; padding: 15px;">
                    <strong>1. Multivariate Normality</strong>
                    <p style="font-size: 13px; margin-top: 8px;">The dependent variables should be multivariate normally distributed within groups.</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px;">
                    <strong>2. Homogeneity of Covariance Matrices</strong>
                    <p style="font-size: 13px; margin-top: 8px;">Variance-covariance matrices should be equal across groups (Box's M test).</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px;">
                    <strong>3. Independence of Observations</strong>
                    <p style="font-size: 13px; margin-top: 8px;">Observations should be independent of each other.</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px;">
                    <strong>4. No Multicollinearity</strong>
                    <p style="font-size: 13px; margin-top: 8px;">Dependent variables should be moderately correlated (not perfectly correlated).</p>
                </div>
            </div>
        </div>
    </div>`;
    
    return { wilksLambda, pillaiTrace, hotellingTrace, roysRoot, fStatistic, df1, df2, pValue, rejectH0, steps };
}

// Helper functions for matrix operations
function multiplyMatrices(A, B) {
    let result = Array(A.length).fill().map(() => Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            for (let k = 0; k < A[0].length; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}

// Returns the inverse, or null when the matrix is singular (callers must handle null)
function inverseMatrix(matrix) {
    const n = matrix.length;
    let augmented = matrix.map((row, i) => [...row, ...Array(n).fill().map((_, j) => i === j ? 1 : 0)]);
    
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) maxRow = k;
        }
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        let pivot = augmented[i][i];
        if (!isFinite(pivot) || Math.abs(pivot) < 1e-12) return null;   // singular (or numerically singular)
        for (let j = 0; j < 2 * n; j++) augmented[i][j] /= pivot;
        
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) augmented[k][j] -= factor * augmented[i][j];
            }
        }
    }
    
    return augmented.map(row => row.slice(n));
}

function computeEigenvalues(matrix) {
    // Eigenvalues (largest first) of a square matrix with real eigenvalues, such as B * W^-1 in MANOVA.
    const n = matrix.length;
    if (n === 1) return [matrix[0][0]];
    if (n === 2) {
        const [[a, b], [c, d]] = matrix;
        const trace = a + d, disc = Math.max(0, trace * trace - 4 * (a * d - b * c));
        return [(trace + Math.sqrt(disc)) / 2, (trace - Math.sqrt(disc)) / 2];
    }
    // Shifted QR iteration (Gram-Schmidt QR)
    let A = matrix.map(r => r.slice());
    for (let iter = 0; iter < 1000; iter++) {
        const mu = A[n - 1][n - 1];
        const M = A.map((r, i) => r.map((v, j) => v - (i === j ? mu : 0)));
        const Q = Array.from({ length: n }, () => new Array(n).fill(0));
        const R = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let j = 0; j < n; j++) {
            const v = M.map(r => r[j]);
            for (let i = 0; i < j; i++) {
                R[i][j] = Q.reduce((s, r, k) => s + r[i] * M[k][j], 0);
                for (let k = 0; k < n; k++) v[k] -= R[i][j] * Q[k][i];
            }
            R[j][j] = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
            for (let k = 0; k < n; k++) Q[k][j] = R[j][j] > 1e-300 ? v[k] / R[j][j] : 0;
        }
        A = R.map((r, i) => r.map((_, j) => r.reduce((s, _x, k) => s + R[i][k] * Q[k][j], 0) + (i === j ? mu : 0)));
        let off = 0;
        for (let i = 1; i < n; i++) for (let j = 0; j < i; j++) off += Math.abs(A[i][j]);
        if (off < 1e-12) break;
    }
    return A.map((r, i) => r[i]).sort((x, y) => y - x);
}

function setupMANOVALogic() {
    const computeBtn = document.getElementById("manovaComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("manovaData").value;
        const alpha = parseFloat(document.getElementById("manovaAlpha").value);
        const resultDiv = document.getElementById("manovaResultArea");
        const valueSpan = document.getElementById("manovaValueDisplay");
        const stepsSpan = document.getElementById("manovaStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format: Group, Y1, Y2, Y3, ...");
            return;
        }
        
        const result = computeMANOVA(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `Λ = ${result.wilksLambda.toFixed(4)} | F = ${result.fStatistic.toFixed(4)} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("manovaClearBtn", "manovaData", "manovaResultArea");
}
