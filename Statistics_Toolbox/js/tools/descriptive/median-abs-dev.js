/* MedianAbsDev: medianabsdev tool (render, compute, setup) */

// Median Absolute Deviation Interface
function renderMedianAbsDevInterface() {
    return `
        <div class="stat-interface" id="s
        <div class="interface-title">📏 Median Absolute Deviation (MAD)</div>
            <div class="formula-card">
                <div class="formula">📌 MAD = median(|xᵢ - median(x)|)</div>
                <div class="desc">Robust measure of dispersion using median instead of mean. Very resistant to outliers.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (commas, spaces, or line breaks)</label>
                <textarea id="medianAbsDevInput" rows="3" placeholder="Example: 12, 45.5, 78, 99.99, 23"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="medianAbsDevComputeBtn">📏 Calculate Median Absolute Deviation + Full Steps</button>
                    <button class="secondary-btn" id="medianAbsDevClearBtn">Clear</button>
                </div>
            </div>
            <div id="medianAbsDevResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">📏 MEDIAN ABSOLUTE DEVIATION RESULT</div>
                    <div class="result-value" id="medianAbsDevValueDisplay">—</div>
                    <div class="calculation-steps" id="medianAbsDevStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// Median Absolute Deviation Computation
function computeMedianAbsDevWithSteps(numbers) {
    if (!numbers.length) return { value: null, steps: "⚠️ No valid numbers provided." };
    
    let sorted = [...numbers].sort((a, b) => a - b);
    let n = sorted.length;
    
    // Calculate median
    let median;
    if (n % 2 === 0) {
        median = (sorted[n/2 - 1] + sorted[n/2]) / 2;
    } else {
        median = sorted[Math.floor(n/2)];
    }
    
    // Calculate absolute deviations from median
    let absoluteDeviations = numbers.map(v => Math.abs(v - median));
    let sortedAbsDev = [...absoluteDeviations].sort((a, b) => a - b);
    
    // Calculate median of absolute deviations
    let mad;
    if (sortedAbsDev.length % 2 === 0) {
        mad = (sortedAbsDev[sortedAbsDev.length/2 - 1] + sortedAbsDev[sortedAbsDev.length/2]) / 2;
    } else {
        mad = sortedAbsDev[Math.floor(sortedAbsDev.length/2)];
    }
    
    let steps = `📏 FORMULA: MAD = median(|xᵢ - median(x)|)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    steps += `Step 1: Sort the data and find median\n`;
    steps += `   Sorted data: [${sorted.join(', ')}]\n`;
    steps += `   n = ${n}\n`;
    if (n % 2 === 0) {
        steps += `   n is even → median = (${sorted[n/2 - 1]} + ${sorted[n/2]}) / 2 = ${median.toFixed(6)}\n\n`;
    } else {
        steps += `   n is odd → median = ${sorted[Math.floor(n/2)]} = ${median.toFixed(6)}\n\n`;
    }
    
    steps += `Step 2: Calculate absolute deviations from median\n`;
    numbers.forEach((v, i) => {
        steps += `   |${v} - ${median.toFixed(6)}| = ${absoluteDeviations[i].toFixed(6)}\n`;
    });
    
    steps += `\nStep 3: Sort absolute deviations\n`;
    steps += `   Sorted: [${sortedAbsDev.map(d => d.toFixed(6)).join(', ')}]\n`;
    
    steps += `\nStep 4: Find median of absolute deviations\n`;
    if (sortedAbsDev.length % 2 === 0) {
        steps += `   Even number → MAD = (${sortedAbsDev[sortedAbsDev.length/2 - 1].toFixed(6)} + ${sortedAbsDev[sortedAbsDev.length/2].toFixed(6)}) / 2 = ${mad.toFixed(6)}\n`;
    } else {
        steps += `   Odd number → MAD = ${sortedAbsDev[Math.floor(sortedAbsDev.length/2)].toFixed(6)} = ${mad.toFixed(6)}\n`;
    }
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Median Absolute Deviation (MAD) = ${mad.toFixed(10)}`;
    
    return { value: mad, steps: steps };
}

function setupMedianAbsDevLogic() {
    const computeBtn = document.getElementById("medianAbsDevComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("medianAbsDevInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("medianAbsDevResultArea");
        const valueSpan = document.getElementById("medianAbsDevValueDisplay");
        const stepsSpan = document.getElementById("medianAbsDevStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "⚠️ Invalid input";
            stepsSpan.innerText = "Please enter at least one numeric value.";
            return;
        }
        
        const result = computeMedianAbsDevWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = result.value.toFixed(10);
        stepsSpan.innerText = result.steps;
    });
    attachClearHandler("medianAbsDevClearBtn", "medianAbsDevInput", "medianAbsDevResultArea");
}
