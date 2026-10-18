/* ZOutlier: zoutlier tool (render, compute, setup) */

// ========== Z-SCORE OUTLIER DETECTION INTERFACE ==========
function renderZOutlierInterface() {
    return buildInterface({
        id: "statZOutlierInterface",
        title: "📏 Detect Outliers (Z-score > 3)",
        formula: "📌 Z-score = |x - μ| / σ",
        desc: "The Z-score method identifies outliers as values where |Z-score| > 3, meaning they are more than 3 standard deviations from the mean. This works best for normally distributed data.",
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated):",
                textarea: { id: "zOutlierInput", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 100, 15, 14, 17, 16, 15, 200" }
            }
        ],
        run: { id: "zOutlierComputeBtn", text: "📏 Detect Outliers (Z-score) + Full Steps" },
        clear: { id: "zOutlierClearBtn", text: "Clear" },
        result: {
            area: "zOutlierResultArea",
            label: "🎯 Z-SCORE OUTLIER DETECTION RESULTS",
            value: "zOutlierValueDisplay",
            steps: "zOutlierStepsDisplay"
        }
    });
}

// ========== Z-SCORE OUTLIER DETECTION COMPUTATION ==========
function computeZOutlierWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    if (numbers.length < 2) return { error: true, message: "Need at least 2 values for Z-score calculation." };
    
    const n = numbers.length;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Calculate standard deviation (sample)
    const squaredDiffs = numbers.map(x => Math.pow(x - mean, 2));
    const sumSqDiffs = squaredDiffs.reduce((a, b) => a + b, 0);
    const variance = sumSqDiffs / (n - 1);
    const stdDev = Math.sqrt(variance);
    
    const threshold = 3;
    
    // Identify outliers
    const outliers = [];
    const normal = [];
    const zScoreDetails = [];
    
    for (let val of numbers) {
        const zScore = Math.abs(val - mean) / stdDev;
        const isOutlier = zScore > threshold;
        if (isOutlier) {
            outliers.push(val);
            zScoreDetails.push({ value: val, zScore: zScore, status: "OUTLIER", reason: `|Z| = ${zScore.toFixed(4)} > ${threshold}` });
        } else {
            normal.push(val);
            zScoreDetails.push({ value: val, zScore: zScore, status: "Normal", reason: `|Z| = ${zScore.toFixed(4)} ≤ ${threshold}` });
        }
    }
    
    // Build detailed steps
    let steps = `📏 Z-SCORE OUTLIER DETECTION - STEP BY STEP\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📋 INPUT DATA:\n`;
    steps += `   Data: [${numbers.join(', ')}]\n`;
    steps += `   n = ${n}\n\n`;
    
    steps += `📐 STEP 1: Calculate the Mean (μ)\n`;
    steps += `   μ = Σx / n = ${sum} / ${n} = ${mean.toFixed(6)}\n\n`;
    
    steps += `📊 STEP 2: Calculate the Standard Deviation (σ)\n`;
    steps += `   σ = √[Σ(x - μ)² / (n-1)]\n`;
    for (let i = 0; i < numbers.length; i++) {
        const diff = numbers[i] - mean;
        steps += `   (${numbers[i]} - ${mean.toFixed(6)})² = ${(diff * diff).toFixed(6)}\n`;
    }
    steps += `   Σ(x - μ)² = ${sumSqDiffs.toFixed(6)}\n`;
    steps += `   σ = √(${sumSqDiffs.toFixed(6)} / ${n-1}) = √${(sumSqDiffs/(n-1)).toFixed(6)} = ${stdDev.toFixed(6)}\n\n`;
    
    steps += `🎯 STEP 3: Calculate Z-scores for each value\n`;
    steps += `   Formula: Z = |x - μ| / σ\n`;
    steps += `   Threshold: |Z| > ${threshold} indicates outlier\n\n`;
    
    steps += `   ┌──────┬──────────┬────────────────┬────────────┬────────────────────────────────┐\n`;
    steps += `   │  #   │  Value   │   |x - μ|      │   Z-score  │  Status                         │\n`;
    steps += `   ├──────┼──────────┼────────────────┼────────────┼────────────────────────────────┤\n`;
    for (let i = 0; i < zScoreDetails.length; i++) {
        const d = zScoreDetails[i];
        const marker = d.status === "OUTLIER" ? "⚠️" : "✓";
        const absDiff = Math.abs(d.value - mean);
        steps += `   │ ${(i+1).toString().padStart(2)} │ ${d.value.toString().padStart(6)} │ ${absDiff.toFixed(6).padStart(12)} │ ${d.zScore.toFixed(4).padStart(8)} │ ${marker} ${d.status.padEnd(6)} (${d.reason})${' '.repeat(30 - d.reason.length)}│\n`;
    }
    steps += `   └──────┴──────────┴────────────────┴────────────┴────────────────────────────────┘\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ OUTLIER DETECTION SUMMARY:\n`;
    steps += `   • Mean (μ) = ${mean.toFixed(6)}\n`;
    steps += `   • Standard Deviation (σ) = ${stdDev.toFixed(6)}\n`;
    steps += `   • Z-score threshold = ${threshold}\n`;
    steps += `   • Total observations: ${n}\n`;
    steps += `   • Outliers found: ${outliers.length}\n`;
    steps += `   • Normal values: ${normal.length}\n`;
    if (outliers.length > 0) {
        steps += `   • Outlier values: ${outliers.join(', ')}\n`;
    } else {
        steps += `   • No outliers detected ✓\n`;
    }
    
    return { outliers, normal, mean, stdDev, threshold, n, steps };
}

function setupZOutlierLogic() {
    const computeBtn = document.getElementById("zOutlierComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("zOutlierInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("zOutlierResultArea");
        const valueSpan = document.getElementById("zOutlierValueDisplay");
        const stepsSpan = document.getElementById("zOutlierStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter numbers to detect outliers.";
            return;
        }
        
        if (numbers.length < 2) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Insufficient data";
            stepsSpan.innerText = "Need at least 2 values for Z-score calculation.";
            return;
        }
        
        const result = computeZOutlierWithSteps(numbers);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerText = result.message;
        } else {
            setHtml(valueSpan, `🔍 ${result.outliers.length} outlier(s) found | Mean = ${result.mean.toFixed(4)} | Std Dev = ${result.stdDev.toFixed(4)} | Threshold = |Z| > ${result.threshold}`);
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("zOutlierClearBtn", "zOutlierInput", "zOutlierResultArea");
}
