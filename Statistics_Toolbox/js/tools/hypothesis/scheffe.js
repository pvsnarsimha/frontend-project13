/* Scheffe: scheffe tool (render, compute, setup) */

// ========== SCHEFFÉ TEST RENDER FUNCTION ==========
function renderScheffeInterface() {
    return buildInterface({
        id: "statScheffeInterface",
        title: "📐 Scheffé Test (Post-hoc)",
        card: [
            {
                formula: "📌 S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]"
            },
            {
                desc: "<strong>What is the Scheffé Test?</strong><br>\n                    A post-hoc test that allows testing all possible contrasts (not just pairwise comparisons).\n                    Most conservative but most flexible post-hoc method."
            },
            {
                desc: "<strong>When to use:</strong> When you want to test complex contrasts or have unequal sample sizes.",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "scheffeData",
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
                select: { id: "scheffeAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "scheffeComputeBtn", text: "📐 Run Scheffé Test + Full Steps" },
        clear: { id: "scheffeClearBtn", text: "Clear" },
        result: {
            area: "scheffeResultArea",
            label: "🎯 SCHEFFÉ TEST RESULTS",
            value: "scheffeValueDisplay",
            steps: "scheffeStepsDisplay"
        }
    });
}

// ========== SCHEFFÉ TEST COMPUTATION ==========
// ========== SCHEFFÉ TEST COMPUTATION (DETAILED) ==========
function computeScheffeTest(inputText, alpha) {
    const parsed = parseValueGroupInput(inputText);
    const groups = parsed.groups;
    if (parsed.skipped.length) {
        return { error: true, message: `Could not read: ${parsed.skipped.slice(0, 5).map(x => escapeHtml(x)).join(', ')}${parsed.skipped.length > 5 ? ', …' : ''}. Each entry must look like value:group (for example 12.5:Control).` };
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Scheffé test." };
    }
    
    const k = groups.size;
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupData = [];
    let allValues = [];
    
    for (let [group, values] of groups) {
        const sum = values.reduce((a,b) => a+b, 0);
        const mean = sum / values.length;
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
        allValues.push(...values);
        groupData.push({ group, values, mean, n: values.length, sum });
    }
    
    const totalN = allValues.length;
    const grandMean = allValues.reduce((a,b) => a+b, 0) / totalN;
    
    // Calculate SS_within
    let ssWithin = 0;
    let ssWithinDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        ssWithinDetails.push(`\n   <strong>Group ${group}:</strong> Mean = ${mean.toFixed(4)}`);
        for (let val of values) {
            const dev = val - mean;
            const sqDev = dev * dev;
            ssWithin += sqDev;
            ssWithinDetails.push(`      (${val} - ${mean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
        }
    }
    
    const dfWithin = totalN - k;
    const msWithin = ssWithin / dfWithin;
    
    // Calculate SS_between
    let ssBetween = 0;
    let ssBetweenDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        const n = groupSizes.get(group);
        const dev = mean - grandMean;
        const contribution = n * dev * dev;
        ssBetween += contribution;
        ssBetweenDetails.push(`   Group ${group}: ${n} × (${mean.toFixed(4)} - ${grandMean.toFixed(4)})² = ${contribution.toFixed(4)}`);
    }
    
    const dfBetween = k - 1;
    const fStatistic = (ssBetween / dfBetween) / msWithin;
    const fCritical = fCriticalValue(alpha, dfBetween, dfWithin);
    
    // Calculate comparisons
    const groupList = Array.from(groups.keys());
    let comparisons = [];
    
    for (let i = 0; i < groupList.length; i++) {
        for (let j = i + 1; j < groupList.length; j++) {
            const group1 = groupList[i];
            const group2 = groupList[j];
            const mean1 = groupMeans.get(group1);
            const mean2 = groupMeans.get(group2);
            const n1 = groupSizes.get(group1);
            const n2 = groupSizes.get(group2);
            const diff = Math.abs(mean1 - mean2);
            const scheffeValue = Math.sqrt((k - 1) * fCritical * msWithin * (1/n1 + 1/n2));
            const significant = diff > scheffeValue;
            
            comparisons.push({
                group1, group2, mean1, mean2, n1, n2,
                diff, scheffeValue, significant
            });
        }
    }
    
    // Build comprehensive HTML output
    const steps = stepsHtmlScheffe({ alpha, comparisons, dfBetween, dfWithin, fCritical, fStatistic, grandMean, groupData, k, msWithin, ssBetween, ssBetweenDetails, ssWithin, ssWithinDetails, totalN });
    return { comparisons, scheffeCritical: comparisons[0]?.scheffeValue, fCritical, fStatistic, steps };
}

// ========== SCHEFFÉ SETUP ==========
function setupScheffeLogic() {
    const computeBtn = document.getElementById("scheffeComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("scheffeData").value;
        const alpha = parseFloat(document.getElementById("scheffeAlpha").value);
        const resultDiv = document.getElementById("scheffeResultArea");
        const valueSpan = document.getElementById("scheffeValueDisplay");
        const stepsSpan = document.getElementById("scheffeStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeScheffeTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            const sigCount = result.comparisons.filter(c => c.significant).length;
            setHtml(valueSpan, `${sigCount}/${result.comparisons.length} comparisons significant | F_crit = ${result.fCritical?.toFixed(4) || 'N/A'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("scheffeClearBtn", "scheffeData", "scheffeResultArea");
}
