/* Quartiles: quartiles tool (render, compute, setup) */

function setupQuartilesLogic() {
    const computeBtn = document.getElementById("quartilesComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("quartilesInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("quartilesResultArea");
        const valueSpan = document.getElementById("quartilesValueDisplay");
        const stepsSpan = document.getElementById("quartilesStepsDisplay");
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to compute quartiles.";
            return;
        }
        const quartilesRes = computeQuartilesWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = `Q₁: ${quartilesRes.q1.toFixed(4)} | Q₂: ${quartilesRes.q2.toFixed(4)} | Q₃: ${quartilesRes.q3.toFixed(4)} | IQR: ${quartilesRes.iqr.toFixed(4)}`;
        stepsSpan.innerText = quartilesRes.steps;
    });
    attachClearHandler("quartilesClearBtn", "quartilesInput", "quartilesResultArea");
}

// QUARTILES & QUANTILES - COMPUTE FUNCTION
// QUARTILES & QUANTILES - COMPUTE FUNCTION
function computeQuartilesWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    let sorted = [...numbers].sort((a,b) => a-b);
    let n = sorted.length;
    
    let getMedian = (arr, arrName) => {
        let m = arr.length;
        if (m % 2 === 0) {
            let left = arr[m/2 - 1];
            let right = arr[m/2];
            let median = (left + right) / 2;
            return { value: median, left, right };
        } else {
            return { value: arr[Math.floor(m/2)], left: null, right: null };
        }
    };
    
    // Calculate Q2 (Median) first
    let q2Result = getMedian(sorted, "full");
    let q2 = q2Result.value;
    
    // Type 7 quantiles (linear interpolation at (n - 1)p)
    const q1 = quantileType7(sorted, 0.25);
    const q3 = quantileType7(sorted, 0.75);
    
    let iqr = q3 - q1;
    
    let steps = `🔢 FORMULA: Quartiles divide sorted data into 4 equal parts\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Sort the data in ascending order\n`;
    steps += `   Original: [${numbers.join(', ')}]\n`;
    steps += `   Sorted:   [${sorted.join(', ')}]\n`;
    steps += `   Number of observations (n) = ${n}\n\n`;
    
    steps += `Step 2: Find Q₂ (Median - 50th percentile)\n`;
    if (n % 2 === 0) {
        steps += `   n is even, so median = average of two middle values\n`;
        steps += `   Position ${n/2} = ${q2Result.left}\n`;
        steps += `   Position ${n/2 + 1} = ${q2Result.right}\n`;
        steps += `   Q₂ = (${q2Result.left} + ${q2Result.right}) / 2 = ${q2}\n\n`;
    } else {
        steps += `   n is odd, so median = value at position (n+1)/2 = ${Math.floor(n/2) + 1}\n`;
        steps += `   Q₂ = ${q2}\n\n`;
    }
    
    steps += `Step 3: Find Q₁ (25th percentile) with Type 7 linear interpolation\n`;
    steps += `   Position h = (n - 1) × p (0-based); Q = x[⌊h⌋] + (h - ⌊h⌋) × (x[⌈h⌉] - x[⌊h⌋])\n`;
    steps += `   ${describeQuantileType7(sorted, 0.25, 'Q₁')}\n\n`;
    
    steps += `Step 4: Find Q₃ (75th percentile) the same way\n`;
    steps += `   ${describeQuantileType7(sorted, 0.75, 'Q₃')}\n\n`;
    
    steps += `Step 5: Calculate Interquartile Range (IQR)\n`;
    steps += `   IQR = Q₃ - Q₁ = ${q3} - ${q1} = ${iqr}\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Q₁ (25th percentile) = ${q1}\n`;
    steps += `✅ Q₂ (50th percentile / Median) = ${q2}\n`;
    steps += `✅ Q₃ (75th percentile) = ${q3}\n`;
    steps += `✅ IQR (Interquartile Range) = ${iqr}`;
    
    return { q1, q2, q3, iqr: iqr, steps: steps };
}

// QUARTILES & QUANTILES
function renderQuartilesInterface() {
    return buildInterface({
        id: "statQuartilesInterface",
        title: "🔢 Quartiles & Quantiles",
        formula: "📌 Q₁ (25th), Q₂ (50th/Median), Q₃ (75th percentile)",
        desc: "Divides data into 4 equal parts. Quantiles generalize to any division (deciles, percentiles).",
        inputs: [
            {
                label: "📋 Enter numeric values",
                textarea: { id: "quartilesInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            }
        ],
        run: { id: "quartilesComputeBtn", text: "🔢 Calculate Quartiles + Steps" },
        clear: { id: "quartilesClearBtn", text: "Clear" },
        result: {
            area: "quartilesResultArea",
            label: "🎯 QUARTILES & QUANTILES RESULTS",
            value: "quartilesValueDisplay",
            steps: "quartilesStepsDisplay"
        }
    });
}
