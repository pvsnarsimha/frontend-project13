/* StdError: stderror tool (render, compute, setup) */

// STANDARD ERROR OF MEAN INTERFACE
function renderStdErrorInterface() {
    return buildInterface({
        id: "statStdErrorInterface",
        title: "📏 Standard Error of the Mean (SEM)",
        formula: "📌 SEM = s / √n",
        desc: "The standard error measures how far the sample mean is likely to be from the population mean. Smaller SEM = more precise estimate.",
        inputs: [
            {
                label: "📋 Enter numeric values (commas, spaces, or line breaks)",
                textarea: { id: "stderrorInput", rows: "3", placeholder: "Example: 12, 45.5, 78, 99.99, 23" }
            }
        ],
        run: { id: "stderrorComputeBtn", text: "📏 Calculate Standard Error + Full Steps" },
        clear: { id: "stderrorClearBtn", text: "Clear" },
        result: {
            area: "stderrorResultArea",
            label: "📏 STANDARD ERROR RESULT",
            value: "stderrorValueDisplay",
            steps: "stderrorStepsDisplay"
        }
    });
}

// STANDARD ERROR OF MEAN COMPUTATION
function computeStdErrorWithSteps(numbers) {
    if (!numbers.length) return { value: null, steps: "⚠️ No valid numbers provided." };
    if (numbers.length < 2) return { value: null, steps: "⚠️ Need at least 2 values to calculate standard error." };
    
    let n = numbers.length;
    let sum = numbers.reduce((acc, v) => acc + v, 0);
    let mean = sum / n;
    
    // Calculate sample standard deviation
    let squaredDiffs = numbers.map(v => Math.pow(v - mean, 2));
    let sumSqDiffs = squaredDiffs.reduce((acc, v) => acc + v, 0);
    let variance = sumSqDiffs / (n - 1);
    let stdDev = Math.sqrt(variance);
    
    // Calculate standard error
    let stdError = stdDev / Math.sqrt(n);
    
    let steps = `📏 FORMULA: Standard Error of the Mean = s / √n\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Step 1: Calculate the sample mean (x̄)\n`;
    steps += `   Sum (Σx) = ${numbers.join(' + ')} = ${sum}\n`;
    steps += `   n = ${n}\n`;
    steps += `   x̄ = ${sum} / ${n} = ${mean.toFixed(6)}\n\n`;
    
    steps += `Step 2: Calculate the sample standard deviation (s)\n`;
    steps += `   Formula: s = √[Σ(xᵢ - x̄)² / (n-1)]\n`;
    squaredDiffs.forEach((sq, i) => {
        steps += `   (${numbers[i]} - ${mean.toFixed(6)})² = ${sq.toFixed(6)}\n`;
    });
    steps += `   Σ(xᵢ - x̄)² = ${sumSqDiffs.toFixed(6)}\n`;
    steps += `   s² = ${sumSqDiffs.toFixed(6)} / ${n-1} = ${variance.toFixed(6)}\n`;
    steps += `   s = √${variance.toFixed(6)} = ${stdDev.toFixed(6)}\n\n`;
    
    steps += `Step 3: Calculate Standard Error\n`;
    steps += `   SEM = s / √n = ${stdDev.toFixed(6)} / √${n}\n`;
    steps += `   SEM = ${stdDev.toFixed(6)} / ${Math.sqrt(n).toFixed(6)} = ${stdError.toFixed(6)}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Standard Error of the Mean = ${stdError.toFixed(10)}\n`;
    steps += `\n📌 INTERPRETATION:\n`;
    const tCrit = tCriticalValue(0.025, n - 1);   // t quantile, not 1.96: matters for small n
    steps += `   • With t(0.025, df = ${n - 1}) = ${tCrit.toFixed(4)}, the sample mean is estimated to be within ±${(stdError * tCrit).toFixed(6)} of the population mean (95% CI)\n`;
    steps += `   • Smaller SEM = more precise estimate of the population mean\n`;
    steps += `   • 95% Confidence Interval: ${mean.toFixed(6)} ± ${tCrit.toFixed(4)} × ${stdError.toFixed(6)} = ${mean.toFixed(6)} ± ${(stdError * tCrit).toFixed(6)}`;
    
    return { value: stdError, mean: mean, stdDev: stdDev, n: n, steps: steps };
}

function setupStdErrorLogic() {
    const computeBtn = document.getElementById("stderrorComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("stderrorInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("stderrorResultArea");
        const valueSpan = document.getElementById("stderrorValueDisplay");
        const stepsSpan = document.getElementById("stderrorStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "⚠️ Invalid input";
            stepsSpan.innerText = "Please enter at least one numeric value.";
            return;
        }
        
        if (numbers.length < 2) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "⚠️ Need more data";
            stepsSpan.innerText = "Standard error requires at least 2 values for meaningful calculation.";
            return;
        }
        
        const result = computeStdErrorWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = result.value.toFixed(10);
        stepsSpan.innerText = result.steps;
    });
    attachClearHandler("stderrorClearBtn", "stderrorInput", "stderrorResultArea");
}
