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
                return { error: true, message: `Line ${i + 1} ("${escapeHtml(line)}") has a non-numeric value. After the group label every value must be a number.` };
            }
            data.push(values);
        }
    }
    
    if (data.length < 6) {
        return { error: true, message: `Need at least 6 observations for MANOVA. You provided ${data.length}.` };
    }
    
    // Extract data
    const groups = [...new Set(data.map(row => escapeHtml(row[0].toString())))];   // labels reach the HTML steps: escaped once, here
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
    let group = data.map(row => escapeHtml(row[0].toString()));
    
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
    // B and W are symmetric, so the eigenvalues of W^-1 B (the same as those of B W^-1) are found in the symmetric form
    // L^-1 B L^-T (W = L L'), which is always real; the non-symmetric QR route is not used here.
    let eigenvalues = generalizedSymmetricEigenvalues(B, W);
    if (!eigenvalues || eigenvalues.some(v => !isFinite(v))) {
        return { error: true, message: "The eigenvalues of the between/within matrices could not be computed (the within-group matrix is not positive definite). Check for constant or perfectly correlated dependent variables." };
    }
    eigenvalues = eigenvalues.map(v => v < 0 && v > -1e-10 ? 0 : v);      // rounding noise below zero
    
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
    if (!(df2 > 0)) {
        return { error: true, message: `There are too few observations for Rao's F approximation here (denominator degrees of freedom = ${+df2.toFixed(4)}, which must be positive). Add more observations per group or drop a dependent variable.` };
    }
    let fStatistic = 0;
    if (!(wilksLambda > 0)) {
        return { error: true, message: "Wilks' Lambda is 0: the groups are separated perfectly (or the eigenvalues overflow), so F would be infinite. Add within-group variation or check the data." };
    }
    if (wilksLambda < 1) {
        const root = Math.pow(wilksLambda, 1 / raoT);
        fStatistic = (1 - root) / root * df2 / df1;
    }
    if (!isFinite(fStatistic)) {
        return { error: true, message: "The F statistic is not finite for these data (the eigenvalues are too large or degenerate). Rescale the data or check for near-perfect group separation." };
    }
    
    const criticalValue = fCriticalValue(alpha, df1, df2);
    const pValue = 1 - fCDF(fStatistic, df1, df2);
    const rejectH0 = fStatistic > criticalValue;
    
    // Build data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        let dvCells = '';
        for (let j = 0; j < p; j++) {
            dvCells += `<td class="s-182047">${y[j][i]}</td>`;
        }
        dataRows += `<tr class="s-0d2692">
            <td class="s-182047">${i+1}</td>
            <td class="s-9afb27">${group[i]}</td>
            ${dvCells}
        </tr>`;
    }
    
    // Build group means table
    let meansRows = '';
    for (let gm of groupMeans) {
        let meanCells = '';
        for (let j = 0; j < p; j++) {
            meanCells += `<td class="s-ea245f">${gm.means[j].toFixed(4)}</td>`;
        }
        meansRows += `<tr class="s-0d2692">
            <td class="s-a7d4d6">${gm.group}</td>
            <td class="s-1a6540">${gm.n}</td>
            ${meanCells}
        </tr>`;
    }
    
    // Build deviation table for Total SSCP
    let deviationRows = '';
    for (let d of totalDeviationDetails) {
        let devCells = '';
        for (let j = 0; j < p; j++) {
            devCells += `<td class="s-1a6540">${d.values[j]} - ${grandMeans[j].toFixed(4)} = ${d.deviations[j].toFixed(4)}</td>`;
        }
        deviationRows += `<tr class="s-0d2692">
            <td class="s-1a6540">${d.obs}</td>
            <td class="s-118507">${d.group}</td>
            ${devCells}
        </tr>`;
    }
    
    // Build deviation table for Within SSCP
    let withinDevRows = '';
    for (let d of withinDeviationDetails) {
        let devCells = '';
        let groupMeanDisplay = d.groupMeans.map(m => m.toFixed(4)).join(', ');
        for (let j = 0; j < p; j++) {
            devCells += `<td class="s-1a6540">${d.values[j]} - ${d.groupMeans[j].toFixed(4)} = ${d.deviations[j].toFixed(4)}</td>`;
        }
        withinDevRows += `<tr class="s-0d2692">
            <td class="s-1a6540">${d.obs}</td>
            <td class="s-118507">${d.group}</td>
            <td class="s-0ff496">Group Means: (${groupMeanDisplay})</td>
            ${devCells}
         </tr>`;
    }
    
    const steps = stepsHtmlManova({ B, T, W, alpha, betweenCalculations, criticalValue, data, dataRows, deviationRows, df1, df2, eigenvalues, fStatistic, grandMeanCalculations, group, groupMeanCalculations, groups, hotellingTrace, k, meansRows, n, p, pValue, pillaiTrace, q, raoT, rejectH0, roysRoot, totalMatrixCalculations, wilksLambda, withinDevRows, withinMatrixCalculations });
    
    // Rao's F for Wilks' Lambda is an exact F distribution when p <= 2 dependent variables or q = k - 1 <= 2 (up to 3 groups);
    // otherwise it is an approximation, and the tile says so
    const fExact = p <= 2 || q <= 2;
    return { eigenvalues, wilksLambda, pillaiTrace, hotellingTrace, roysRoot, fStatistic, df1, df2, pValue, rejectH0, fExact, steps, chart: { dist: 'f', df: df1, df2: df2, stat: fStatistic, alternative: 'greater', alpha: alpha, statLabel: 'F', critical: { lower: null, upper: criticalValue } } };
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
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `Λ = ${result.wilksLambda.toFixed(4)} | F = ${result.fStatistic.toFixed(4)} | p = ${result.pValue.toFixed(6)}${result.fExact ? ' (exact F)' : ' | ⚠ Rao F approximation (more than 2 variables and more than 3 groups)'}`);
            setHtml(stepsSpan, result.steps);
            showTestChart("manovaResultArea", result.chart);
        }
    });
    
    attachClearHandler("manovaClearBtn", "manovaData", "manovaResultArea");
}
