/* Levene: levene tool (render, compute, setup) */

// ========== LEVENE'S TEST INTERFACE RENDER ==========
function renderLeveneInterface() {
    return buildInterface({
        id: "statLeveneInterface",
        title: "📊 Levene's Test (Homogeneity of Variance)",
        formula: "📌 Tests whether multiple groups have equal variances",
        desc: "<strong>What is Levene's Test?</strong><br>\n                    Levene's test checks the assumption of homogeneity of variances across groups.\n                    H₀: All group variances are equal | H₁: At least one group variance differs.<br>\n                    <strong>Version:</strong> Levene's original mean-centred form (ANOVA F on |x − group mean|). scipy.stats.levene defaults to the median-centred Brown–Forsythe variant; use center='mean' there to match this tool.",
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "leveneData",
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
                select: { id: "leveneAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "leveneComputeBtn", text: "📊 Run Levene's Test + Full Steps" },
        clear: { id: "leveneClearBtn", text: "Clear" },
        result: {
            area: "leveneResultArea",
            label: "🎯 LEVENE'S TEST RESULTS",
            value: "leveneValueDisplay",
            steps: "leveneStepsDisplay"
        }
    });
}

// ========== LEVENE'S TEST COMPUTATION ==========
// ========== LEVENE'S TEST COMPUTATION ==========
function computeLeveneTest(inputText, alpha) {
    const parsed = parseValueGroupInput(inputText);
    const groups = parsed.groups;
    if (parsed.skipped.length) {
        return { error: true, message: `Could not read: ${parsed.skipped.slice(0, 5).map(x => escapeHtml(x)).join(', ')}${parsed.skipped.length > 5 ? ', …' : ''}. Each entry must look like value:group (for example 12.5:Control).` };
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Levene's test." };
    }
    
    // Calculate group means
    let groupMeans = new Map();
    let groupSizes = new Map();
    
    for (let [group, values] of groups) {
        let sum = values.reduce((a,b) => a+b, 0);
        let mean = sum / values.length;
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
    }
    
    let totalN = 0;
    for (let n of groupSizes.values()) totalN += n;
    let k = groups.size;
    
    // Calculate Zᵢⱼ = |Yᵢⱼ - Ȳⱼ| (absolute deviations from group mean)
    let zValues = new Map();
    let groupZMeans = new Map();
    let allZ = [];
    
    // Detailed calculations for Z-scores
    let zCalculationDetails = [];
    
    for (let [group, values] of groups) {
        let groupMean = groupMeans.get(group);
        let zs = [];
        let groupCalc = `<div class="s-9fc2d7"><strong>Group ${group}:</strong> Mean = ${groupMean.toFixed(4)}<br>`;
        
        for (let v of values) {
            let z = Math.abs(v - groupMean);
            zs.push(z);
            allZ.push(z);
            groupCalc += `&nbsp;&nbsp;|${v} - ${groupMean.toFixed(4)}| = ${z.toFixed(4)}<br>`;
        }
        let zMean = zs.reduce((a,b) => a+b, 0) / zs.length;
        groupZMeans.set(group, zMean);
        zValues.set(group, zs);
        groupCalc += `<strong>Mean of absolute deviations (Z̄${group}) = ${zMean.toFixed(4)}</strong><br>`;
        groupCalc += `This represents the average "distance" from the group mean.<br>`;
        zCalculationDetails.push(groupCalc + `</div>`);
    }
    
    let grandZMean = allZ.reduce((a,b) => a+b, 0) / totalN;
    
    // Calculate SS Between and SS Within for Z
    let ssBetween = 0;
    let ssWithin = 0;
    let betweenDetails = [];
    let withinDetails = [];
    
    for (let [group, zs] of zValues) {
        let zMean = groupZMeans.get(group);
        let n = groupSizes.get(group);
        let betweenContrib = n * Math.pow(zMean - grandZMean, 2);
        ssBetween += betweenContrib;
        betweenDetails.push(`Group ${group}: ${n} × (${zMean.toFixed(4)} - ${grandZMean.toFixed(4)})² = ${betweenContrib.toFixed(4)}`);
        
        for (let z of zs) {
            let withinContrib = Math.pow(z - zMean, 2);
            ssWithin += withinContrib;
            withinDetails.push(`Group ${group}: (${z.toFixed(4)} - ${zMean.toFixed(4)})² = ${withinContrib.toFixed(4)}`);
        }
    }
    
    let dfBetween = k - 1;
    let dfWithin = totalN - k;
    let msBetween = ssBetween / dfBetween;
    let msWithin = ssWithin / dfWithin;
    let fStatistic = msBetween / msWithin;
    
    let criticalValue = fCriticalValue(alpha, dfBetween, dfWithin);
    let pValue = 1 - fCDF(fStatistic, dfBetween, dfWithin);
    let rejectH0 = pValue < alpha;
    
    // Build comprehensive educational HTML
    const steps = stepsHtmlLevene({ alpha, betweenDetails, criticalValue, dfBetween, dfWithin, fStatistic, grandZMean, groupMeans, groups, k, msBetween, msWithin, pValue, rejectH0, ssBetween, ssWithin, totalN, withinDetails, zCalculationDetails });
    return { fStatistic, dfBetween, dfWithin, pValue, rejectH0, steps };
}

// ========== SETUP FUNCTIONS ==========
function setupLeveneLogic() {
    const computeBtn = document.getElementById("leveneComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("leveneData").value;
        const alpha = parseFloat(document.getElementById("leveneAlpha").value);
        const resultDiv = document.getElementById("leveneResultArea");
        const valueSpan = document.getElementById("leveneValueDisplay");
        const stepsSpan = document.getElementById("leveneStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeLeveneTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `F = ${result.fStatistic.toFixed(4)} | df = (${result.dfBetween}, ${result.dfWithin}) | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("leveneClearBtn", "leveneData", "leveneResultArea");
}
