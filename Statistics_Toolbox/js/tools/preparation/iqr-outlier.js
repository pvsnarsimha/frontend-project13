/* IQROutlier: iqroutlier tool (render, compute, setup) */

// ========== IQR OUTLIER DETECTION INTERFACE ==========
function renderIQROutlierInterface() {
    return buildInterface({
        id: "statIQROutlierInterface",
        title: "📊 Detect Outliers (IQR Rule)",
        formula: "📌 Lower Bound = Q₁ - 1.5×IQR | Upper Bound = Q₃ + 1.5×IQR",
        desc: "The Interquartile Range (IQR) method identifies outliers as values that fall below Q₁ - 1.5×IQR or above Q₃ + 1.5×IQR. This is a robust method that works well for skewed distributions.",
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated):",
                textarea: {
                    id: "iqrOutlierInput",
                    rows: "4",
                    placeholder: "Example: 12, 15, 14, 16, 13, 100, 15, 14, 17, 16, 15, 200"
                }
            }
        ],
        run: { id: "iqrOutlierComputeBtn", text: "📊 Detect Outliers (IQR) + Full Steps" },
        clear: { id: "iqrOutlierClearBtn", text: "Clear" },
        result: {
            area: "iqrOutlierResultArea",
            label: "🎯 IQR OUTLIER DETECTION RESULTS",
            value: "iqrOutlierValueDisplay",
            steps: "iqrOutlierStepsDisplay"
        }
    });
}

// ========== IQR OUTLIER DETECTION COMPUTATION ==========
function computeIQROutlierWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Calculate Quartiles
    
    // Type 7 quantiles (linear interpolation at (n - 1)p), the same method as every other quantile in the app
    const q1 = quantileType7(sorted, 0.25);
    const q3 = quantileType7(sorted, 0.75);
    
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Identify outliers
    const outliers = [];
    const normal = [];
    const outlierDetails = [];
    
    for (let val of numbers) {
        if (val < lowerBound || val > upperBound) {
            outliers.push(val);
            outlierDetails.push({ value: val, status: "OUTLIER", reason: val < lowerBound ? `Below Q₁ - 1.5×IQR (${lowerBound.toFixed(4)})` : `Above Q₃ + 1.5×IQR (${upperBound.toFixed(4)})` });
        } else {
            normal.push(val);
            outlierDetails.push({ value: val, status: "Normal", reason: `Within [${lowerBound.toFixed(4)}, ${upperBound.toFixed(4)}]` });
        }
    }
    
    // Build detailed steps
    let steps = `📊 IQR OUTLIER DETECTION - STEP BY STEP\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📋 INPUT DATA:\n`;
    steps += `   Original: [${numbers.join(', ')}]\n`;
    steps += `   n = ${n}\n\n`;
    
    steps += `🔢 STEP 1: Sort the data\n`;
    steps += `   Sorted: [${sorted.join(', ')}]\n\n`;
    
    steps += `📐 STEP 2: Calculate Quartiles\n`;
    steps += `   Q₁ (25th percentile) = ${q1.toFixed(6)}\n`;
    steps += `   Q₃ (75th percentile) = ${q3.toFixed(6)}\n\n`;
    
    steps += `📊 STEP 3: Calculate IQR (Interquartile Range)\n`;
    steps += `   IQR = Q₃ - Q₁ = ${q3.toFixed(6)} - ${q1.toFixed(6)} = ${iqr.toFixed(6)}\n\n`;
    
    steps += `🎯 STEP 4: Calculate Outlier Boundaries\n`;
    steps += `   Lower Bound = Q₁ - 1.5 × IQR = ${q1.toFixed(6)} - 1.5 × ${iqr.toFixed(6)} = ${lowerBound.toFixed(6)}\n`;
    steps += `   Upper Bound = Q₃ + 1.5 × IQR = ${q3.toFixed(6)} + 1.5 × ${iqr.toFixed(6)} = ${upperBound.toFixed(6)}\n\n`;
    
    steps += `🔍 STEP 5: Identify Outliers\n`;
    steps += `   ┌──────┬──────────┬────────────────────────────────────────────┐\n`;
    steps += `   │  #   │  Value   │  Status (Reason)                          │\n`;
    steps += `   ├──────┼──────────┼────────────────────────────────────────────┤\n`;
    for (let i = 0; i < outlierDetails.length; i++) {
        const d = outlierDetails[i];
        const marker = d.status === "OUTLIER" ? "⚠️" : "✓";
        steps += `   │ ${(i+1).toString().padStart(2)} │ ${d.value.toString().padStart(6)} │ ${marker} ${d.status.padEnd(6)} (${d.reason})${' '.repeat(Math.max(0, 45 - d.reason.length))}│\n`;
    }
    steps += `   └──────┴──────────┴────────────────────────────────────────────┘\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ OUTLIER DETECTION SUMMARY:\n`;
    steps += `   • Total observations: ${n}\n`;
    steps += `   • Outliers found: ${outliers.length}\n`;
    steps += `   • Normal values: ${normal.length}\n`;
    if (outliers.length > 0) {
        steps += `   • Outlier values: ${outliers.join(', ')}\n`;
    } else {
        steps += `   • No outliers detected ✓\n`;
    }
    steps += `   • Boundaries: [${lowerBound.toFixed(6)}, ${upperBound.toFixed(6)}]\n`;
    
    return { outliers, normal, lowerBound, upperBound, q1, q3, iqr, n, steps };
}

// ========== SETUP FUNCTIONS FOR OUTLIER DETECTION ==========
function setupIQROutlierLogic() {
    const computeBtn = document.getElementById("iqrOutlierComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("iqrOutlierInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("iqrOutlierResultArea");
        const valueSpan = document.getElementById("iqrOutlierValueDisplay");
        const stepsSpan = document.getElementById("iqrOutlierStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter numbers to detect outliers.";
            return;
        }
        
        const result = computeIQROutlierWithSteps(numbers);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
        } else {
            setHtml(valueSpan, `🔍 ${result.outliers.length} outlier(s) found | IQR = ${result.iqr.toFixed(4)} | Boundaries: [${result.lowerBound.toFixed(4)}, ${result.upperBound.toFixed(4)}]`);
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("iqrOutlierClearBtn", "iqrOutlierInput", "iqrOutlierResultArea");
}
