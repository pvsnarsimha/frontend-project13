/* Percentiles: percentiles tool (render, compute, setup) */

function setupPercentilesLogic() {
    const computeBtn = document.getElementById("percentilesComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("percentilesInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("percentilesResultArea");
        const valueSpan = document.getElementById("percentilesValueDisplay");
        const stepsSpan = document.getElementById("percentilesStepsDisplay");
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to compute percentiles.";
            return;
        }
        const percentilesRes = computePercentilesWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = percentilesRes.resultStr;
        stepsSpan.innerText = percentilesRes.steps;
    });
    attachClearHandler("percentilesClearBtn", "percentilesInput", "percentilesResultArea");
}

// PERCENTILES - COMPUTE FUNCTION
function computePercentilesWithSteps(numbers, percentiles = [10, 25, 50, 75, 90]) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    let sorted = [...numbers].sort((a,b) => a-b);
    let n = sorted.length;
    
    let getPercentile = (p) => {
        let index = (p / 100) * (n - 1);
        let lower = Math.floor(index);
        let upper = Math.ceil(index);
        if (lower === upper) return { value: sorted[lower], index: index, lowerIdx: lower, upperIdx: upper };
        let value = sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
        return { value: value, index: index, lowerIdx: lower, upperIdx: upper };
    };
    
    let results = {};
    let percentileDetails = {};
    percentiles.forEach(p => { 
        let detail = getPercentile(p);
        results[p] = detail.value;
        percentileDetails[p] = detail;
    });
    
    let steps = `% FORMULA: Pₖ = value at position (k/100) × (n-1) using linear interpolation\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Sort the data in ascending order\n`;
    steps += `   Original: [${numbers.join(', ')}]\n`;
    steps += `   Sorted:   [${sorted.join(', ')}]\n`;
    steps += `   Sample size (n) = ${n}\n\n`;
    
    steps += `Step 2: For each percentile, calculate position and value\n`;
    steps += `   Formula: Position = (k/100) × (n - 1)\n\n`;
    
    percentiles.forEach(p => {
        let detail = percentileDetails[p];
        let pos = detail.index;
        steps += `📌 ${p}th Percentile:\n`;
        steps += `   Position = (${p}/100) × (${n} - 1) = (${p}/100) × ${n-1} = ${pos.toFixed(4)}\n`;
        
        if (detail.lowerIdx === detail.upperIdx) {
            steps += `   Position is exact integer → P${p} = value at index ${detail.lowerIdx}\n`;
            steps += `   P${p} = ${sorted[detail.lowerIdx]}\n\n`;
        } else {
            steps += `   Position is between index ${detail.lowerIdx} and ${detail.upperIdx}\n`;
            steps += `   Lower value (x₁) = ${sorted[detail.lowerIdx]}\n`;
            steps += `   Upper value (x₂) = ${sorted[detail.upperIdx]}\n`;
            let fraction = pos - detail.lowerIdx;
            steps += `   Fractional part = ${pos.toFixed(4)} - ${detail.lowerIdx} = ${fraction.toFixed(4)}\n`;
            steps += `   P${p} = x₁ + (x₂ - x₁) × fraction\n`;
            steps += `   P${p} = ${sorted[detail.lowerIdx]} + (${sorted[detail.upperIdx]} - ${sorted[detail.lowerIdx]}) × ${fraction.toFixed(4)}\n`;
            steps += `   P${p} = ${sorted[detail.lowerIdx]} + ${(sorted[detail.upperIdx] - sorted[detail.lowerIdx]) * fraction} = ${results[p].toFixed(6)}\n\n`;
        }
    });
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    let resultStr = Object.entries(results).map(([k,v]) => `P${k}: ${v.toFixed(6)}`).join(' | ');
    steps += `✅ Results: ${resultStr}`;
    
    return { results, steps: steps, resultStr };
}

// PERCENTILES
function renderPercentilesInterface() {
    return buildInterface({
        id: "statPercentilesInterface",
        title: "% Percentiles",
        formula: "📌 Pₖ = value below which k% of data falls",
        desc: "Shows relative standing. Common: 10th, 25th, 50th, 75th, 90th percentiles.",
        inputs: [
            {
                label: "📋 Enter numeric values",
                textarea: { id: "percentilesInput", rows: "3", placeholder: "Example: 15, 20, 35, 40, 50, 55, 60, 65, 70, 75" }
            }
        ],
        run: { id: "percentilesComputeBtn", text: "% Calculate Percentiles + Steps" },
        clear: { id: "percentilesClearBtn", text: "Clear" },
        result: {
            area: "percentilesResultArea",
            label: "🎯 PERCENTILES RESULTS",
            value: "percentilesValueDisplay",
            steps: "percentilesStepsDisplay"
        }
    });
}
