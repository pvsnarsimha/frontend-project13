/* Bonferroni: bonferroni tool (render, compute, setup) */

// ========== BONFERRONI CORRECTION RENDER FUNCTION ==========
function renderBonferroniInterface() {
    return buildInterface({
        id: "statBonferroniInterface",
        title: "✏️ Bonferroni Correction (Post-hoc)",
        card: [
            { formula: "📌 α<sub>adjusted</sub> = α / m" },
            {
                desc: "<strong>What is the Bonferroni Correction?</strong><br>\n                    A conservative post-hoc method that adjusts the significance level for multiple comparisons.\n                    Divides α by the number of comparisons to control family-wise error rate."
            },
            {
                desc: "<strong>When to use:</strong> After any test with multiple comparisons (ANOVA, t-tests, correlations). Simple and widely applicable.",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "bonferroniData",
                    rows: "5",
                    placeholder: "Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"
                }
            },
            {
                hint: "<strong>Format:</strong> value:group (comma or space separated)",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Original Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "bonferroniAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "bonferroniComputeBtn", text: "✏️ Run Bonferroni Correction + Full Steps" },
        clear: { id: "bonferroniClearBtn", text: "Clear" },
        result: {
            area: "bonferroniResultArea",
            label: "🎯 BONFERRONI CORRECTION RESULTS",
            value: "bonferroniValueDisplay",
            steps: "bonferroniStepsDisplay"
        }
    });
}

// ========== BONFERRONI CORRECTION COMPUTATION ==========
// ========== BONFERRONI CORRECTION COMPUTATION (DETAILED) ==========
function computeBonferroniCorrection(inputText, alpha) {
    const parsed = parseValueGroupInput(inputText);
    const groups = parsed.groups;
    if (parsed.skipped.length) {
        return { error: true, message: `Could not read: ${parsed.skipped.slice(0, 5).map(x => escapeHtml(x)).join(', ')}${parsed.skipped.length > 5 ? ', …' : ''}. Each entry must look like value:group (for example 12.5:Control).` };
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Bonferroni correction." };
    }
    
    const k = groups.size;
    const m = (k * (k - 1)) / 2; // number of pairwise comparisons
    const adjustedAlpha = alpha / m;
    
    // Calculate group statistics
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupVariances = new Map();
    let groupData = [];
    let allValues = [];
    
    for (let [group, values] of groups) {
        const sum = values.reduce((a,b) => a+b, 0);
        const mean = sum / values.length;
        const variance = values.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
        groupVariances.set(group, variance);
        allValues.push(...values);
        groupData.push({ group, values, mean, n: values.length, sum, variance });
    }
    
    const totalN = allValues.length;
    
    // Calculate pooled variance
    let ssWithin = 0;
    let ssWithinDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        ssWithinDetails.push(`\n   <strong>Group ${group}:</strong>`);
        for (let val of values) {
            const dev = val - mean;
            const sqDev = dev * dev;
            ssWithin += sqDev;
            ssWithinDetails.push(`      (${val} - ${mean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
        }
    }
    
    const dfWithin = totalN - k;
    {
        const guard = withinGroupError(dfWithin, ssWithin, 'Bonferroni comparisons', 'values');
        if (guard) return guard;
    }
    const pooledVar = ssWithin / dfWithin;
    const pooledStd = Math.sqrt(pooledVar);
    
    // Calculate t-tests for each pair
    let comparisons = [];
    const groupList = Array.from(groups.keys());
    
    for (let i = 0; i < groupList.length; i++) {
        for (let j = i + 1; j < groupList.length; j++) {
            const group1 = groupList[i];
            const group2 = groupList[j];
            const mean1 = groupMeans.get(group1);
            const mean2 = groupMeans.get(group2);
            const n1 = groupSizes.get(group1);
            const n2 = groupSizes.get(group2);
            const diff = mean1 - mean2;
            const se = Math.sqrt(pooledVar * (1/n1 + 1/n2));
            const tStat = Math.abs(diff / se);
            const criticalT = tCriticalValue(adjustedAlpha / 2, dfWithin);
            const pValue = 2 * (1 - tCDF(tStat, dfWithin));
            const significant = pValue < adjustedAlpha;
            
            comparisons.push({
                group1, group2, mean1, mean2, n1, n2,
                diff, se, tStat, criticalT, pValue, significant
            });
        }
    }
    
    // Build comprehensive HTML output
    const steps = stepsHtmlBonferroni({ adjustedAlpha, alpha, comparisons, dfWithin, groupData, k, m, pooledStd, pooledVar, ssWithin, ssWithinDetails, totalN });
    return { comparisons, adjustedAlpha, steps };
}

// ========== BONFERRONI SETUP ==========
function setupBonferroniLogic() {
    const computeBtn = document.getElementById("bonferroniComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("bonferroniData").value;
        const alpha = parseFloat(document.getElementById("bonferroniAlpha").value);
        const resultDiv = document.getElementById("bonferroniResultArea");
        const valueSpan = document.getElementById("bonferroniValueDisplay");
        const stepsSpan = document.getElementById("bonferroniStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeBonferroniCorrection(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `α_adj = ${result.adjustedAlpha.toFixed(6)} | ${result.comparisons.filter(c => c.significant).length} significant comparisons`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("bonferroniClearBtn", "bonferroniData", "bonferroniResultArea");
}
