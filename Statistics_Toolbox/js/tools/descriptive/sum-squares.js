/* SumSquares: sumsquares tool (render, compute, setup) */

// SUM OF SQUARES (Total, Within, Between)
function renderSumSquaresInterface() {
    return buildInterface({
        id: "statSumSquaresInterface",
        title: "🔲 Sum of Squares (SS) - Total, Within, Between",
        formula: "📌 SSₜₒₜₐₗ = Σ(xᵢ - x̄)² | SS_wᵢₜₕᵢₙ = Σ(xᵢⱼ - x̄ⱼ)² | SS_bₑₜwₑₑₙ = Σ nⱼ(x̄ⱼ - x̄)²",
        desc: "Measures variability. For multiple groups, enter data with group labels (format: value:group). Example: \"23:A, 45:A, 32:B, 56:B\"",
        inputs: [
            {
                label: "📋 Enter numeric values (single group, e.g. 12, 45, 23, 67) OR values with group labels (format: value:group)",
                textarea: {
                    id: "sumSquaresInput",
                    rows: "4",
                    placeholder: "Example: 23:A, 45:A, 32:B, 56:B, 78:B, 44:C, 67:C"
                }
            }
        ],
        run: { id: "sumSquaresComputeBtn", text: "🔲 Calculate Sum of Squares + Steps" },
        clear: { id: "sumSquaresClearBtn", text: "Clear" },
        result: {
            area: "sumSquaresResultArea",
            label: "🎯 SUM OF SQUARES RESULTS",
            value: "sumSquaresValueDisplay",
            steps: "sumSquaresStepsDisplay"
        }
    });
}

// ========== SUM OF SQUARES COMPUTATION ==========
function computeSumSquaresWithSteps(inputText) {
    let hasGroups = inputText.includes(':');
    let groups = new Map();
    let allValues = [];
    
    if (hasGroups) {
        // the same parser as the group-comparison tests: a group name may contain spaces ("1:Group A 2:Group B"), and anything
        // that is not value:group is reported instead of being dropped silently
        const parsed = parseValueGroupInput(inputText);
        if (parsed.skipped.length) {
            return { error: true, message: `Could not read: ${parsed.skipped.slice(0, 5).join(', ')}${parsed.skipped.length > 5 ? ', …' : ''}. Each entry must look like value:group (for example 12.5:Control).` };   // shown through escapeHtml by the caller
        }
        groups = parsed.groups;
        for (const values of groups.values()) allValues.push(...values);
    } else {
        let numbers = parseNumbersFromInput(inputText);
        allValues = numbers;
        if (numbers.length > 0) {
            groups.set('All Data', numbers);
        }
    }
    
    if (allValues.length === 0) return { error: true, message: "No valid numbers provided." };
    
    let n = allValues.length;
    let grandMean = allValues.reduce((a,b) => a+b, 0) / n;
    
    let steps = `🔲 FORMULA: Sum of Squares\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📌 TOTAL SUM OF SQUARES (SSₜₒₜₐₗ)\n`;
    steps += `   Formula: SSₜₒₜₐₗ = Σ(xᵢ - x̄)² where x̄ is grand mean\n\n`;
    steps += `   Grand Mean (x̄) = Σx / N = ${allValues.reduce((a,b)=>a+b,0)} / ${n} = ${grandMean.toFixed(6)}\n\n`;
    
    let totalSS = 0;
    let totalTerms = [];
    for (let val of allValues) {
        let diff = val - grandMean;
        let sqDiff = diff * diff;
        totalSS += sqDiff;
        totalTerms.push(`(${val} - ${grandMean.toFixed(6)})² = ${sqDiff.toFixed(6)}`);
    }
    steps += `   Σ(xᵢ - x̄)² calculations:\n`;
    totalTerms.forEach(term => steps += `   ${term}\n`);
    steps += `   SSₜₒₜₐₗ = ${totalSS.toFixed(6)}\n\n`;
    
    let withinSS = 0;
    let betweenSS = 0;
    
    if (groups.size > 1) {
        steps += `📌 WITHIN-GROUPS SUM OF SQUARES (SS_wᵢₜₕᵢₙ)\n`;
        steps += `   Formula: SS_wᵢₜₕᵢₙ = Σⱼ Σ(xᵢⱼ - x̄ⱼ)² where x̄ⱼ is group mean\n\n`;
        
        let groupMeans = new Map();
        
        for (let [groupName, values] of groups) {
            let groupMean = values.reduce((a,b) => a+b, 0) / values.length;
            groupMeans.set(groupName, groupMean);
            steps += `\n   Group "${groupName}":\n`;
            steps += `      Mean (x̄ⱼ) = ${values.join(' + ')} / ${values.length} = ${groupMean.toFixed(6)}\n`;
            
            let groupSS = 0;
            for (let val of values) {
                let diff = val - groupMean;
                let sqDiff = diff * diff;
                groupSS += sqDiff;
                steps += `      (${val} - ${groupMean.toFixed(6)})² = ${sqDiff.toFixed(6)}\n`;
            }
            steps += `      SS for group = ${groupSS.toFixed(6)}\n`;
            withinSS += groupSS;
        }
        steps += `\n   SS_wᵢₜₕᵢₙ = Sum of all group SS = ${withinSS.toFixed(6)}\n\n`;
        
        steps += `📌 BETWEEN-GROUPS SUM OF SQUARES (SS_bₑₜwₑₑₙ)\n`;
        steps += `   Formula: SS_bₑₜwₑₑₙ = Σ nⱼ(x̄ⱼ - x̄)² where nⱼ is group size\n\n`;
        
        for (let [groupName, values] of groups) {
            let groupMean = groupMeans.get(groupName);
            let nj = values.length;
            let diff = groupMean - grandMean;
            let contribution = nj * (diff * diff);
            betweenSS += contribution;
            steps += `   Group "${groupName}": nⱼ = ${nj}, x̄ⱼ = ${groupMean.toFixed(6)}\n`;
            steps += `      (x̄ⱼ - x̄)² = (${groupMean.toFixed(6)} - ${grandMean.toFixed(6)})² = ${(diff*diff).toFixed(6)}\n`;
            steps += `      nⱼ × (x̄ⱼ - x̄)² = ${nj} × ${(diff*diff).toFixed(6)} = ${contribution.toFixed(6)}\n\n`;
        }
        steps += `   SS_bₑₜwₑₑₙ = ${betweenSS.toFixed(6)}\n\n`;
        
        steps += `📌 VERIFICATION: SSₜₒₜₐₗ = SS_wᵢₜₕᵢₙ + SS_bₑₜwₑₑₙ\n`;
        steps += `   ${totalSS.toFixed(6)} = ${withinSS.toFixed(6)} + ${betweenSS.toFixed(6)}\n`;
        steps += `   ${totalSS.toFixed(6)} = ${(withinSS + betweenSS).toFixed(6)} ✅\n\n`;
    } else {
        steps += `📌 NOTE: Only one group detected. For multiple groups, use format "value:group"\n`;
        steps += `   Within-groups SS and Between-groups SS require at least 2 groups.\n`;
        steps += `   (For a single group, SSₜₒₜₐₗ is itself the within-group sum of squares: there is no between-group component.)\n\n`;
        withinSS = "N/A (only one group)";
        betweenSS = "N/A (only one group)";
    }
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ SUM OF SQUARES RESULTS:\n`;
    steps += `   • Total Sum of Squares (SSₜₒₜₐₗ) = ${totalSS.toFixed(6)}\n`;
    if (groups.size > 1) {
        steps += `   • Within-Groups Sum of Squares (SS_wᵢₜₕᵢₙ) = ${withinSS.toFixed(6)}\n`;
        steps += `   • Between-Groups Sum of Squares (SS_bₑₜwₑₑₙ) = ${betweenSS.toFixed(6)}\n`;
    }
    
    return { 
        totalSS: totalSS, 
        withinSS: withinSS,
        betweenSS: betweenSS,
        grandMean: grandMean,
        n: n,
        hasGroups: (groups.size > 1),
        steps: steps 
    };
}

function setupSumSquaresLogic() {
    const computeBtn = document.getElementById("sumSquaresComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("sumSquaresInput").value;
        const resultDiv = document.getElementById("sumSquaresResultArea");
        const valueSpan = document.getElementById("sumSquaresValueDisplay");
        const stepsSpan = document.getElementById("sumSquaresStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to compute sum of squares.";
            return;
        }
        
        const ssRes = computeSumSquaresWithSteps(raw);
        if (ssRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(ssRes.message));
            return;
        }
        
        resultDiv.style.display = "block";
        if (ssRes.hasGroups) {
            setHtml(valueSpan, `SSₜₒₜₐₗ: ${ssRes.totalSS.toFixed(4)} | SS_wᵢₜₕᵢₙ: ${ssRes.withinSS.toFixed(4)} | SS_bₑₜwₑₑₙ: ${ssRes.betweenSS.toFixed(4)}`);
        } else {
            setHtml(valueSpan, `SSₜₒₜₐₗ: ${ssRes.totalSS.toFixed(4)}`);
        }
        stepsSpan.innerText = ssRes.steps;
    });
    attachClearHandler("sumSquaresClearBtn", "sumSquaresInput", "sumSquaresResultArea");
}
