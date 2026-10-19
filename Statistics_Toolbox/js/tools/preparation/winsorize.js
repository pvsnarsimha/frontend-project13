/* Winsorize: winsorize tool (render, compute, setup) */

// ========== WINSORIZATION RENDER FUNCTION ==========
function renderWinsorizeInterface() {
    return buildInterface({
        id: "statWinsorizeInterface",
        title: "✂️ Winsorization (Cap Outliers)",
        formula: "📌 Replace extreme values with specified percentiles",
        desc: "Winsorization caps outliers at a specified percentile level (e.g., 5% winsorization caps values below 5th percentile and above 95th percentile). This reduces the impact of outliers without removing them entirely.",
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated):",
                textarea: { id: "winsorizeInput", rows: "4", placeholder: "Example: 12, 15, 14, 100, 16, 13, 15, 14, 200, 17, 16, 15" }
            },
            {
                label: "✂️ Winsorization Level (percent to cap from each tail):",
                labelAttrs: { style: FIELD_GAP },
                input: {
                    type: "number",
                    id: "winsorizeLevel",
                    value: "5",
                    step: "1",
                    min: "0",
                    max: "49",
                    style: FIELD_STYLE
                }
            },
            {
                hint: "Example: 5% caps values below 5th percentile and above 95th percentile",
                hintAttrs: { style: "font-size: 0.75rem;" }
            }
        ],
        run: { id: "winsorizeComputeBtn", text: "✂️ Apply Winsorization + Full Steps" },
        clear: { id: "winsorizeClearBtn", text: "Clear" },
        result: {
            area: "winsorizeResultArea",
            label: "🎯 WINSORIZATION RESULTS",
            value: "winsorizeValueDisplay",
            steps: "winsorizeStepsDisplay"
        }
    });
}

// ========== WINSORIZATION COMPUTATION ==========
// ========== WINSORIZATION COMPUTATION (FIXED) ==========
function computeWinsorizeWithSteps(numbers, winsorPercent) {
    if (!numbers || numbers.length === 0) return { error: true, message: "No numbers provided." };
    
    // Filter out invalid numbers
    const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n) && isFinite(n));
    if (validNumbers.length === 0) return { error: true, message: "No valid numbers provided." };
    
    const n = validNumbers.length;
    const sorted = [...validNumbers].sort((a, b) => a - b);
    
    // Calculate percentile indices
    const lowerPercentile = winsorPercent / 100;
    const upperPercentile = 1 - winsorPercent / 100;
    
    // Same Type 7 percentiles as the Percentiles tool, so both tools agree at the same level
    const lowerBound = quantileType7(sorted, lowerPercentile);
    const upperBound = quantileType7(sorted, upperPercentile);
    
    // Apply winsorization
    const winsorized = validNumbers.map(val => {
        if (val < lowerBound) return lowerBound;
        if (val > upperBound) return upperBound;
        return val;
    });
    
    // Calculate statistics before and after
    const origMean = validNumbers.reduce((a, b) => a + b, 0) / n;
    const origStd = Math.sqrt(validNumbers.reduce((a, b) => a + Math.pow(b - origMean, 2), 0) / n);
    
    const winsorizedMean = winsorized.reduce((a, b) => a + b, 0) / n;
    const winsorizedStd = Math.sqrt(winsorized.reduce((a, b) => a + Math.pow(b - winsorizedMean, 2), 0) / n);
    
    // Count capped values
    const cappedCount = winsorized.filter((v, i) => v !== validNumbers[i]).length;
    
    let steps = `✂️ WINSORIZATION (${winsorPercent}% from each tail) - STEP BY STEP\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📋 INPUT DATA:\n`;
    steps += `   Original: [${validNumbers.join(', ')}]\n`;
    steps += `   n = ${n}\n\n`;
    
    steps += `🔢 STEP 1: Sort the data\n`;
    steps += `   Sorted: [${sorted.join(', ')}]\n\n`;
    
    steps += `📐 STEP 2: Calculate ${winsorPercent}th and ${100-winsorPercent}th percentiles\n`;
    steps += `   Type 7 percentile: h = (n-1)p, then interpolate between neighbouring sorted values\n`;
    steps += `   Lower bound: h = (${n}-1) × ${lowerPercentile} = ${((n-1)*lowerPercentile).toFixed(4)} → ${+lowerBound.toFixed(6)}\n`;
    steps += `   Upper bound: h = (${n}-1) × ${upperPercentile} = ${((n-1)*upperPercentile).toFixed(4)} → ${+upperBound.toFixed(6)}\n\n`;
    
    steps += `✂️ STEP 3: Apply Winsorization\n`;
    steps += `   Values < ${lowerBound} → replaced with ${lowerBound}\n`;
    steps += `   Values > ${upperBound} → replaced with ${upperBound}\n`;
    steps += `   Other values → unchanged\n\n`;
    
    steps += `   ┌──────┬──────────┬──────────────────┬────────────────────────────────────────┐\n`;
    steps += `   │  #   │ Original │ Winsorized       │ Status                                 │\n`;
    steps += `   ├──────┼──────────┼──────────────────┼────────────────────────────────────────┤\n`;
    
    for (let i = 0; i < validNumbers.length; i++) {
        const orig = validNumbers[i];
        const wins = winsorized[i];
        const changed = orig !== wins;
        let status = '';
        if (changed) {
            status = orig < lowerBound ? `Below ${lowerBound.toFixed(4)}` : `Above ${upperBound.toFixed(4)}`;
        } else {
            status = 'Unchanged';
        }
        steps += `   │ ${(i+1).toString().padStart(2)} │ ${orig.toString().padStart(8)} │ ${wins.toString().padStart(12)} │ ${status.padEnd(30)} │\n`;
    }
    steps += `   └──────┴──────────┴──────────────────┴────────────────────────────────────────┘\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 EFFECT ON STATISTICS:\n`;
    steps += `   Original Mean: ${origMean.toFixed(6)}\n`;
    steps += `   Winsorized Mean: ${winsorizedMean.toFixed(6)} `;
    if (origMean !== 0) {
        steps += `(${((winsorizedMean - origMean)/Math.abs(origMean) * 100).toFixed(2)}% change)\n`;
    } else {
        steps += `\n`;
    }
    steps += `   Original Std Dev: ${origStd.toFixed(6)}\n`;
    steps += `   Winsorized Std Dev: ${winsorizedStd.toFixed(6)} `;
    if (origStd !== 0) {
        steps += `(${((winsorizedStd - origStd)/origStd * 100).toFixed(2)}% change)\n`;
    } else {
        steps += `\n`;
    }
    steps += `\n`;
    
    steps += `✅ WINSORIZATION SUMMARY:\n`;
    steps += `   • ${winsorPercent}% Winsorization applied\n`;
    steps += `   • Lower bound (${winsorPercent}th percentile): ${lowerBound.toFixed(6)}\n`;
    steps += `   • Upper bound (${100-winsorPercent}th percentile): ${upperBound.toFixed(6)}\n`;
    steps += `   • ${cappedCount} value(s) were capped\n`;
    steps += `   • Winsorized data: [${winsorized.join(', ')}]`;
    
    return { 
        original: validNumbers, 
        winsorized, 
        lowerBound, 
        upperBound, 
        winsorPercent, 
        origMean, 
        winsorizedMean,
        cappedCount,
        steps 
    };
}

// ========== WINSORIZATION SETUP ==========
function setupWinsorizeLogic() {
    const computeBtn = document.getElementById("winsorizeComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("winsorizeInput").value;
        const numbers = parseNumbersFromInput(raw);
        const level = parseFloat(document.getElementById("winsorizeLevel").value);
        const resultDiv = document.getElementById("winsorizeResultArea");
        const valueSpan = document.getElementById("winsorizeValueDisplay");
        const stepsSpan = document.getElementById("winsorizeStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter numbers to winsorize.";
            return;
        }
        
        if (level < 0 || level >= 50) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Invalid level";
            stepsSpan.innerText = "Winsorization level must be between 0 and 49.";
            return;
        }
        
        const result = computeWinsorizeWithSteps(numbers, level);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
        } else {
            setHtml(valueSpan, `✂️ ${level}% Winsorization | Capped ${result.winsorized.filter((v,i) => v !== result.original[i]).length} values`);
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("winsorizeClearBtn", "winsorizeInput", "winsorizeResultArea");
}
