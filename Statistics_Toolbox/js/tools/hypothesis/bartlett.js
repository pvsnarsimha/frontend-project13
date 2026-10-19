/* Bartlett: bartlett tool (render, compute, setup) */

// ========== BARTLETT'S TEST INTERFACE RENDER ==========
function renderBartlettInterface() {
    return buildInterface({
        id: "statBartlettInterface",
        title: "📐 Bartlett's Test (Sphericity / Homogeneity of Variance)",
        formula: "📌 χ² = (N - k) ln(s²) - Σ(nⱼ - 1) ln(sⱼ²)",
        desc: "<strong>What is Bartlett's Test?</strong><br>\n                    Bartlett's test checks the assumption of equal variances across groups.\n                    H₀: All group variances are equal | H₁: At least one group variance differs.\n                    <strong>Note:</strong> Assumes normality; sensitive to non-normality.",
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "bartlettData",
                    rows: "5",
                    placeholder: "Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"
                }
            },
            {
                hint: "<strong>Format:</strong> value:group (comma or space separated)",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "bartlettAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "bartlettComputeBtn", text: "📐 Run Bartlett's Test + Full Steps" },
        clear: { id: "bartlettClearBtn", text: "Clear" },
        result: {
            area: "bartlettResultArea",
            label: "🎯 BARTLETT'S TEST RESULTS",
            value: "bartlettValueDisplay",
            steps: "bartlettStepsDisplay"
        }
    });
}

// ========== BARTLETT'S TEST COMPUTATION ==========
// ========== BARTLETT'S TEST COMPUTATION ==========
function computeBartlettTest(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = escapeHtml(groupName.trim());
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Bartlett's test." };
    }
    
    let groupVars = new Map();
    let groupSizes = new Map();
    let groupMeans = new Map();
    let totalN = 0;
    
    // Detailed variance calculations
    let varianceDetails = [];
    
    for (let [group, values] of groups) {
        let n = values.length;
        let mean = values.reduce((a,b) => a+b, 0) / n;
        groupMeans.set(group, mean);
        
        // Calculate variance with detailed steps
        let squaredDiffs = [];
        for (let v of values) {
            let diff = v - mean;
            squaredDiffs.push(diff * diff);
        }
        let sumSqDiffs = squaredDiffs.reduce((a,b) => a+b, 0);
        let variance = sumSqDiffs / (n - 1);
        
        groupVars.set(group, variance);
        groupSizes.set(group, n);
        totalN += n;
        
        varianceDetails.push(`
            <div class="s-f253ee">
                <strong class="s-ece993">Group ${group}</strong> (n = ${n})<br>
                Mean = ${mean.toFixed(4)}<br>
                Squared deviations: ${squaredDiffs.map((d, i) => `(${values[i]} - ${mean.toFixed(4)})² = ${d.toFixed(4)}`).join(', ')}<br>
                Σ(x - x̄)² = ${sumSqDiffs.toFixed(4)}<br>
                <strong>Variance (s²) = ${sumSqDiffs.toFixed(4)} / ${n-1} = ${variance.toFixed(6)}</strong>
            </div>
        `);
    }
    
    let k = groups.size;
    
    // Calculate pooled variance
    let numerator = 0;
    let denominator = 0;
    let pooledDetails = [];
    
    for (let [group, n] of groupSizes) {
        let variance = groupVars.get(group);
        let term = (n - 1) * variance;
        numerator += term;
        denominator += (n - 1);
        pooledDetails.push(`(${n}-1) × ${variance.toFixed(4)} = ${term.toFixed(4)}`);
    }
    let pooledVar = numerator / denominator;
    
    // Calculate Bartlett's chi-square statistic
    let term1 = (totalN - k) * Math.log(pooledVar);
    let term2 = 0;
    let term2Details = [];
    
    for (let [group, n] of groupSizes) {
        let variance = groupVars.get(group);
        let term = (n - 1) * Math.log(variance);
        term2 += term;
        term2Details.push(`(${n}-1) × ln(${variance.toFixed(4)}) = ${term.toFixed(4)}`);
    }
    let chiSquare = term1 - term2;
    
    // Correction factor
    let sumInv = Array.from(groupSizes.values()).reduce((sum, n) => sum + 1/(n-1), 0);
    let C = 1 + (1 / (3 * (k - 1))) * (sumInv - 1/(totalN - k));
    let chiSquareAdj = chiSquare / C;
    
    let df = k - 1;
    let criticalValue = chiSquareCriticalValue(alpha, df);
    let pValue = 1 - chiSquareCDF(chiSquareAdj, df);
    let rejectH0 = chiSquareAdj > criticalValue;
    
    // Build comprehensive educational HTML
    const steps = stepsHtmlBartlett({ C, alpha, chiSquare, chiSquareAdj, criticalValue, denominator, df, groupMeans, groupSizes, groups, k, numerator, pValue, pooledDetails, pooledVar, rejectH0, sumInv, term1, term2, term2Details, totalN, varianceDetails });
    return { chiSquare: chiSquareAdj, df, pValue, rejectH0, steps };
}

function setupBartlettLogic() {
    const computeBtn = document.getElementById("bartlettComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("bartlettData").value;
        const alpha = parseFloat(document.getElementById("bartlettAlpha").value);
        const resultDiv = document.getElementById("bartlettResultArea");
        const valueSpan = document.getElementById("bartlettValueDisplay");
        const stepsSpan = document.getElementById("bartlettStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeBartlettTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSquare.toFixed(4)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("bartlettClearBtn", "bartlettData", "bartlettResultArea");
}
