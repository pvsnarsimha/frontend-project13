/* Deciles: deciles tool (render, compute, setup) */

// DECILES INTERFACE
function renderDecilesInterface() {
    return buildInterface({
        id: "statDecilesInterface",
        title: "📊 Deciles (10th, 20th, ..., 90th Percentiles)",
        formula: "📌 Dₖ = x[⌊h⌋] + (h - ⌊h⌋)(x[⌈h⌉] - x[⌊h⌋]), h = (n - 1)k/10",
        desc: "Deciles divide data into 10 equal parts. D₁ = 10th percentile, D₅ = 50th percentile (median), D₉ = 90th percentile.",
        inputs: [
            {
                label: "📋 Enter numeric values",
                textarea: {
                    id: "decilesInput",
                    rows: "3",
                    placeholder: "Example: 15, 20, 35, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100"
                }
            }
        ],
        run: { id: "decilesComputeBtn", text: "📊 Calculate Deciles + Steps" },
        clear: { id: "decilesClearBtn", text: "Clear" },
        result: {
            area: "decilesResultArea",
            label: "🎯 DECILES RESULTS",
            value: "decilesValueDisplay",
            steps: "decilesStepsDisplay"
        }
    });
}

// DECILES COMPUTE FUNCTION
function computeDecilesWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    let sorted = [...numbers].sort((a, b) => a - b);
    let n = sorted.length;
    
    let deciles = {};
    let steps = `📊 FORMULA: Decile Dₖ = Type 7 quantile at p = k/10\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Sort the data in ascending order\n`;
    steps += `   Original: [${numbers.join(', ')}]\n`;
    steps += `   Sorted:   [${sorted.join(', ')}]\n`;
    steps += `   Sample size (n) = ${n}\n\n`;
    
    steps += `Step 2: Calculate each decile using linear interpolation\n`;
    steps += `   Formula: h = (n - 1) × k / 10 (0-based position), interpolate between neighbouring order statistics (Type 7)\n\n`;
    
    for (let k = 1; k <= 9; k++) {
        const value = quantileType7(sorted, k / 10);
        steps += `📌 D${k} (${k * 10}th percentile):\n`;
        steps += `   ${describeQuantileType7(sorted, k / 10, 'D' + k)}\n\n`;
        deciles[`D${k}`] = value;
    }
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ DECILES RESULTS:\n`;
    let resultStr = '';
    for (let k = 1; k <= 9; k++) {
        steps += `   D${k} (${k * 10}th percentile) = ${deciles[`D${k}`].toFixed(6)}\n`;
        resultStr += `D${k}: ${deciles[`D${k}`].toFixed(4)} | `;
    }
    resultStr = resultStr.slice(0, -3);
    
    // Add interpretation
    steps += `\n📌 INTERPRETATION:\n`;
    steps += `   • D₅ is the MEDIAN (50th percentile)\n`;
    steps += `   • D₁ = 10th percentile: 10% of data falls below this value\n`;
    steps += `   • D₉ = 90th percentile: 90% of data falls below this value\n`;
    steps += `   • Deciles divide data into 10 equal parts (each containing 10% of observations)\n`;
    
    return { deciles, steps: steps, resultStr };
}

function setupDecilesLogic() {
    const computeBtn = document.getElementById("decilesComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("decilesInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("decilesResultArea");
        const valueSpan = document.getElementById("decilesValueDisplay");
        const stepsSpan = document.getElementById("decilesStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to compute deciles.";
            return;
        }
        
        const decilesRes = computeDecilesWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = decilesRes.resultStr;
        stepsSpan.innerText = decilesRes.steps;
    });
    attachClearHandler("decilesClearBtn", "decilesInput", "decilesResultArea");
}
