/* MeanAbsDev: meanabsdev tool (render, compute, setup) */

// Mean Absolute Deviation Interface
function renderMeanAbsDevInterface() {
    return buildInterface({
        id: "statMeanAbsDevInterface",
        title: "📊 Mean Absolute Deviation (MAD)",
        formula: "📌 MAD = Σ|xᵢ - x̄| / n",
        desc: "Average absolute distance from the mean. Measures dispersion like standard deviation but less sensitive to outliers.",
        inputs: [
            {
                label: "📋 Enter numeric values (commas, spaces, or line breaks)",
                textarea: { id: "meanAbsDevInput", rows: "3", placeholder: "Example: 12, 45.5, 78, 99.99, 23" }
            }
        ],
        run: { id: "meanAbsDevComputeBtn", text: "📊 Calculate Mean Absolute Deviation + Full Steps" },
        clear: { id: "meanAbsDevClearBtn", text: "Clear" },
        result: {
            area: "meanAbsDevResultArea",
            label: "📊 MEAN ABSOLUTE DEVIATION RESULT",
            value: "meanAbsDevValueDisplay",
            steps: "meanAbsDevStepsDisplay"
        }
    });
}

// Mean Absolute Deviation Computation
function computeMeanAbsDevWithSteps(numbers) {
    if (!numbers.length) return { value: null, steps: "⚠️ No valid numbers provided." };
    
    let n = numbers.length;
    let sum = numbers.reduce((acc, v) => acc + v, 0);
    let mean = sum / n;
    
    let absoluteDeviations = numbers.map(v => Math.abs(v - mean));
    let sumAbsDev = absoluteDeviations.reduce((acc, v) => acc + v, 0);
    let mad = sumAbsDev / n;
    
    let steps = `📊 FORMULA: Mean Absolute Deviation = Σ|xᵢ - x̄| / n\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Step 1: Calculate the mean (x̄)\n`;
    steps += `   Sum (Σx) = ${numbers.join(' + ')} = ${sum}\n`;
    steps += `   n = ${n}\n`;
    steps += `   x̄ = ${sum} / ${n} = ${mean.toFixed(6)}\n\n`;
    
    steps += `Step 2: Calculate absolute deviations |xᵢ - x̄|\n`;
    numbers.forEach((v, i) => {
        steps += `   |${v} - ${mean.toFixed(6)}| = ${absoluteDeviations[i].toFixed(6)}\n`;
    });
    
    steps += `\nStep 3: Sum absolute deviations\n`;
    steps += `   Σ|xᵢ - x̄| = ${absoluteDeviations.map(d => d.toFixed(6)).join(' + ')} = ${sumAbsDev.toFixed(6)}\n`;
    
    steps += `\nStep 4: Divide by n\n`;
    steps += `   MAD = ${sumAbsDev.toFixed(6)} / ${n} = ${mad.toFixed(6)}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Mean Absolute Deviation = ${mad.toFixed(10)}`;
    
    return { value: mad, steps: steps };
}

function setupMeanAbsDevLogic() {
    const computeBtn = document.getElementById("meanAbsDevComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("meanAbsDevInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("meanAbsDevResultArea");
        const valueSpan = document.getElementById("meanAbsDevValueDisplay");
        const stepsSpan = document.getElementById("meanAbsDevStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "⚠️ Invalid input";
            stepsSpan.innerText = "Please enter at least one numeric value.";
            return;
        }
        
        const result = computeMeanAbsDevWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = result.value.toFixed(10);
        stepsSpan.innerText = result.steps;
    });
    attachClearHandler("meanAbsDevClearBtn", "meanAbsDevInput", "meanAbsDevResultArea");
}
