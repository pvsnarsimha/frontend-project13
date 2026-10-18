/* IQR: iqr tool (render, compute, setup) */

// INTERQUARTILE RANGE (IQR)
function renderIQRInterface() {
    return buildInterface({
        id: "statIQRInterface",
        title: "📦 Interquartile Range (IQR = Q₃ - Q₁)",
        formula: "📌 IQR = Q₃ (75th percentile) - Q₁ (25th percentile)",
        desc: "Measures spread of middle 50% of data. Robust against outliers.",
        inputs: [
            {
                label: "📋 Enter numeric values",
                textarea: { id: "iqrInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            }
        ],
        run: { id: "iqrComputeBtn", text: "📦 Calculate IQR + Steps" },
        clear: { id: "iqrClearBtn", text: "Clear" },
        result: { area: "iqrResultArea", label: "🎯 IQR RESULT", value: "iqrValueDisplay", steps: "iqrStepsDisplay" }
    });
}

// INTERQUARTILE RANGE
function computeIQRWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    let sorted = [...numbers].sort((a,b) => a-b);
    let n = sorted.length;
    let getMedian = (arr) => {
        let m = arr.length;
        if (m % 2 === 0) return (arr[m/2 - 1] + arr[m/2]) / 2;
        else return arr[Math.floor(m/2)];
    };
    // Type 7 quantiles (linear interpolation at (n - 1)p), the same method as every other quantile in the app
    const q1 = quantileType7(sorted, 0.25);
    const q3 = quantileType7(sorted, 0.75);
    let iqr = q3 - q1;
    let steps = `📦 FORMULA: IQR = Q₃ - Q₁ (75th percentile - 25th percentile)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Step 1: Sort data → [${sorted.join(', ')}]\n`;
    steps += `Step 2: Find median (Q₂) = ${getMedian(sorted)}\n`;
    steps += `Step 3: Find Q₁ (25th percentile, Type 7)\n   ${describeQuantileType7(sorted, 0.25, 'Q₁')}\n`;
    steps += `Step 4: Find Q₃ (75th percentile, Type 7)\n   ${describeQuantileType7(sorted, 0.75, 'Q₃')}\n`;
    steps += `Step 5: Calculate IQR = ${q3} - ${q1} = ${iqr}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Interquartile Range (IQR) = ${iqr}`;
    return { value: iqr, steps: steps, q1: q1, q3: q3 };
}

function setupIQRCustomLogic() {
    const computeBtn = document.getElementById("iqrComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("iqrInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("iqrResultArea");
        const valueSpan = document.getElementById("iqrValueDisplay");
        const stepsSpan = document.getElementById("iqrStepsDisplay");
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to compute IQR.";
            return;
        }
        const iqrRes = computeIQRWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = iqrRes.value;
        stepsSpan.innerText = iqrRes.steps;
    });
    attachClearHandler("iqrClearBtn", "iqrInput", "iqrResultArea");
}
