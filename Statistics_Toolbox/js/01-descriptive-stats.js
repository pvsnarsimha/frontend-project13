/* Descriptive statistics (mean, spread, shape, quartiles) and shared helpers */
    // Robust numeric parser: values may be separated by commas, semicolons, spaces, tabs or new lines.
    // Accepts negatives (also the typographic minus), decimals and scientific notation. A token that is not
    // a complete number ("12abc", "1.2.3") is skipped instead of being silently read as 12 or 1.2.
    const NUMBER_TOKEN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
    function parseNumbersFromInput(rawText) {
        const parts = String(rawText).replace(/\u2212/g, '-').split(/[,;\s]+/);
        const numbers = [];
        for (const part of parts) {
            if (!NUMBER_TOKEN.test(part)) continue;
            const num = Number(part);
            if (isFinite(num)) numbers.push(num);
        }
        return numbers;
    }

    // ------------------ MEAN with detailed textual formula & steps ------------------
    function computeMeanWithSteps(numbers) {
        if (!numbers.length) return { value: null, steps: "⚠️ No valid numbers provided. Enter numeric values first." };
        let sum = numbers.reduce((acc, v) => acc + v, 0);
        let n = numbers.length;
        let mean = sum / n;
        let sumExpression = numbers.map((v, i) => `${v}`).join(" + ");
        let steps = `📐 FORMULA: Arithmetic Mean = (Σ xᵢ) / n\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `Step 1: Sum all values (Σ xᵢ) = ${sumExpression}\n`;
        steps += `        = ${sum.toFixed(8)} (total sum)\n`;
        steps += `Step 2: Count observations (n) = ${n}\n`;
        steps += `Step 3: Divide sum by n →  ${sum.toFixed(8)} ÷ ${n}\n`;
        steps += `Result: \\bar{x} = ${mean.toFixed(10)}\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `✅ Arithmetic Mean = ${mean.toFixed(10)}`;
        return { value: mean, steps: steps, sum, n };
    }

    // ------------------ MEDIAN with sorted list and middle logic ------------------
    function computeMedianWithSteps(numbers) {
        if (!numbers.length) return { value: null, steps: "⚠️ No data. Please enter numbers." };
        const sorted = [...numbers].sort((a, b) => a - b);
        const n = sorted.length;
        let median;
        let steps = `📈 FORMULA: Median = middle value of ordered dataset\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        let sortedStr = sorted.map(v => Number.isInteger(v) ? v : v.toFixed(6)).join(", ");
        steps += `Step 1: Sort the data in ascending order:\n   [${sortedStr}]\n`;
        steps += `Step 2: Number of observations (n) = ${n}\n`;
        if (n % 2 === 0) {
            let leftIdx = n / 2 - 1;
            let rightIdx = n / 2;
            let leftVal = sorted[leftIdx];
            let rightVal = sorted[rightIdx];
            median = (leftVal + rightVal) / 2;
            steps += `Step 3: n is even → median = average of the two middle values.\n`;
            steps += `   Middle positions: index ${leftIdx+1} = ${leftVal}, index ${rightIdx+1} = ${rightVal}\n`;
            steps += `   Median = (${leftVal} + ${rightVal}) / 2 = ${median.toFixed(10)}\n`;
        } else {
            let midIdx = Math.floor(n / 2);
            median = sorted[midIdx];
            steps += `Step 3: n is odd → median = value at position (n+1)/2 = position ${midIdx+1}\n`;
            steps += `   Value at position ${midIdx+1} = ${median}\n`;
        }
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `✅ Median = ${(Number.isInteger(median) ? median : median.toFixed(10))}`;
        return { value: median, steps: steps };
    }

    // ------------------ MODE with frequency table and textual breakdown ------------------
    function computeModeWithSteps(numbers) {
        if (!numbers.length) return { value: null, steps: "No data provided.", display: "No data" };
        const freqMap = new Map();
        for (let num of numbers) freqMap.set(num, (freqMap.get(num) || 0) + 1);
        let maxFreq = 0;
        for (let f of freqMap.values()) if (f > maxFreq) maxFreq = f;
        
        let steps = `⭐ FORMULA: Mode = value(s) that appear most frequently\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `Frequency distribution:\n`;
        let freqEntries = Array.from(freqMap.entries()).sort((a,b)=>a[0]-b[0]);
        for (let [val, freq] of freqEntries) {
            steps += `   • ${val}  →  appears ${freq} time(s)\n`;
        }
        if (maxFreq === 1) {
            steps += `\nAll values have frequency = 1 → No mode exists.\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            return { value: null, steps: steps, display: "No mode (all values unique)", modesList: [] };
        }
        let modesList = [];
        for (let [val, freq] of freqMap.entries()) if (freq === maxFreq) modesList.push(val);
        modesList.sort((a,b)=>a-b);
        let displayStr = modesList.map(v => (Number.isInteger(v) ? v : v.toFixed(6))).join(', ');
        if (modesList.length > 1) displayStr = `Multimodal: ${displayStr} (each appears ${maxFreq} times)`;
        else displayStr = `${modesList[0]} (frequency: ${maxFreq})`;
        
        steps += `\nHighest frequency = ${maxFreq}\n`;
        steps += `Value(s) achieving highest frequency: ${modesList.map(v=>v).join(', ')}\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `✅ Mode = ${displayStr}`;
        return { value: modesList, steps: steps, display: displayStr, modesList: modesList };
    }

    // ------------------ GEOMETRIC MEAN with product/log safety + detailed steps ------------------
    function computeGeometricWithSteps(numbers) {
        if (!numbers.length) return { error: true, message: "No numbers entered. Provide at least one positive value.", value: null };
        const nonPositive = numbers.filter(v => v <= 0);
        if (nonPositive.length > 0) {
            return { error: true, message: `❌ Geometric mean requires ALL values > 0 (strictly positive). Invalid entries: ${nonPositive.join(', ')}`, value: null };
        }
        let n = numbers.length;
        let product = 1;
        let steps = `📉 FORMULA: Geometric Mean = (∏ xᵢ)^{1/n}   (all xᵢ > 0)\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `Data: [${numbers.map(v => v.toFixed(6)).join(", ")}]\n`;
        steps += `n (sample size) = ${n}\n`;
        
        // Safe approach: if product might overflow or is extremely large, use log-sum
        let useLogMethod = false;
        let testProduct = numbers.reduce((acc, v) => acc * Math.abs(v), 1);
        if (testProduct > 1e100 || testProduct === Infinity || numbers.some(v => v === 0)) useLogMethod = true;
        
        if (useLogMethod) {
            let sumLog = numbers.reduce((acc, v) => acc + Math.log(v), 0);
            let geomMean = Math.exp(sumLog / n);
            steps += `Step 1 (log method): Compute natural logs\n`;
            let logTerms = numbers.map(v => `ln(${v.toFixed(6)})`).join(" + ");
            steps += `   Σ ln(xᵢ) = ${logTerms}\n`;
            steps += `            = ${sumLog.toFixed(10)}\n`;
            steps += `Step 2: Divide sum of logs by n → ${sumLog.toFixed(10)} / ${n} = ${(sumLog/n).toFixed(10)}\n`;
            steps += `Step 3: Exponentiate → e^( ${(sumLog/n).toFixed(10)} ) = ${geomMean.toFixed(12)}\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            steps += `✅ Geometric Mean = ${geomMean.toFixed(12)}`;
            return { error: false, value: geomMean, steps: steps };
        } else {
            for (let v of numbers) product *= v;
            let geomMean = Math.pow(product, 1 / n);
            let productExpr = numbers.map(v => v.toFixed(6)).join(" × ");
            steps += `Step 1: Multiply all values together → ${productExpr}\n`;
            steps += `        Product = ${product.toFixed(10)}\n`;
            steps += `Step 2: Raise product to power 1/${n} → (${product.toFixed(10)})^(1/${n})\n`;
            steps += `        = ${geomMean.toFixed(12)}\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            steps += `✅ Geometric Mean = ${geomMean.toFixed(12)}`;
            return { error: false, value: geomMean, steps: steps };
        }
    }

    function attachClearHandler(clearBtnId, textareaId, resultAreaId) {
        const clearBtn = document.getElementById(clearBtnId);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const textarea = document.getElementById(textareaId);
                if (textarea) textarea.value = '';
                const resultDiv = document.getElementById(resultAreaId);
                if (resultDiv) resultDiv.style.display = 'none';
            });
        }
    }

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

// FIVE-NUMBER SUMMARY (Min, Q1, Median, Q3, Max)
function renderFiveNumInterface() {
    return `
        <div class="stat-interface" id="statFiveNumInterface">
            <div class="interface-title">📦 Five-Number Summary (Min, Q₁, Median, Q₃, Max)</div>
            <div class="formula-card">
                <div class="formula">📌 Min | Q₁ | Median | Q₃ | Max</div>
                <div class="desc">The five-number summary provides a complete snapshot of data distribution: minimum, first quartile (25th percentile), median (50th percentile), third quartile (75th percentile), and maximum.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values</label>
                <textarea id="fiveNumInput" rows="3" placeholder="Example: 12, 45, 23, 67, 34, 89, 56, 78, 90"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="fiveNumComputeBtn">📦 Calculate Five-Number Summary + Steps</button>
                    <button class="secondary-btn" id="fiveNumClearBtn">Clear</button>
                </div>
            </div>
            <div id="fiveNumResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 FIVE-NUMBER SUMMARY RESULTS</div>
                    <div class="result-value" id="fiveNumValueDisplay">—</div>
                    <div class="calculation-steps" id="fiveNumStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// SUM OF SQUARES (Total, Within, Between)
function renderSumSquaresInterface() {
    return `
        <div class="stat-interface" id="statSumSquaresInterface">
            <div class="interface-title">🔲 Sum of Squares (SS) - Total, Within, Between</div>
            <div class="formula-card">
                <div class="formula">📌 SSₜₒₜₐₗ = Σ(xᵢ - x̄)² | SS_wᵢₜₕᵢₙ = Σ(xᵢⱼ - x̄ⱼ)² | SS_bₑₜwₑₑₙ = Σ nⱼ(x̄ⱼ - x̄)²</div>
                <div class="desc">Measures variability. For multiple groups, enter data with group labels (format: value:group). Example: "23:A, 45:A, 32:B, 56:B"</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (for single group) OR values with group labels (format: value:group)</label>
                <textarea id="sumSquaresInput" rows="4" placeholder="Single group: 12, 45, 23, 67, 34, 89
Multiple groups: 23:A, 45:A, 32:B, 56:B, 78:B, 44:C, 67:C"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="sumSquaresComputeBtn">🔲 Calculate Sum of Squares + Steps</button>
                    <button class="secondary-btn" id="sumSquaresClearBtn">Clear</button>
                </div>
            </div>
            <div id="sumSquaresResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 SUM OF SQUARES RESULTS</div>
                    <div class="result-value" id="sumSquaresValueDisplay">—</div>
                    <div class="calculation-steps" id="sumSquaresStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// FIVE-NUMBER SUMMARY COMPUTATION

// SUM OF SQUARES COMPUTATION
// Mean Absolute Deviation Interface
function renderMeanAbsDevInterface() {
    return `
        <div class="stat-interface" id="statMeanAbsDevInterface">
            <div class="interface-title">📊 Mean Absolute Deviation (MAD)</div>
            <div class="formula-card">
                <div class="formula">📌 MAD = Σ|xᵢ - x̄| / n</div>
                <div class="desc">Average absolute distance from the mean. Measures dispersion like standard deviation but less sensitive to outliers.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (commas, spaces, or line breaks)</label>
                <textarea id="meanAbsDevInput" rows="3" placeholder="Example: 12, 45.5, 78, 99.99, 23"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="meanAbsDevComputeBtn">📊 Calculate Mean Absolute Deviation + Full Steps</button>
                    <button class="secondary-btn" id="meanAbsDevClearBtn">Clear</button>
                </div>
            </div>
            <div id="meanAbsDevResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">📊 MEAN ABSOLUTE DEVIATION RESULT</div>
                    <div class="result-value" id="meanAbsDevValueDisplay">—</div>
                    <div class="calculation-steps" id="meanAbsDevStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

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
    
    let q1, q3;
    let lowerHalf, upperHalf;
    
    if (n % 2 === 0) {
        lowerHalf = sorted.slice(0, n/2);
        upperHalf = sorted.slice(n/2);
    } else {
        lowerHalf = sorted.slice(0, Math.floor(n/2));
        upperHalf = sorted.slice(Math.floor(n/2) + 1);
    }
    
    let q1Result = getMedian(lowerHalf, "lower");
    let q3Result = getMedian(upperHalf, "upper");
    q1 = q1Result.value;
    q3 = q3Result.value;
    
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
    
    steps += `Step 3: Split data into lower and upper halves\n`;
    steps += `   Lower half (values below Q₂): [${lowerHalf.join(', ')}]\n`;
    steps += `   Upper half (values above Q₂): [${upperHalf.join(', ')}]\n\n`;
    
    steps += `Step 4: Find Q₁ (Median of lower half - 25th percentile)\n`;
    let lowerLen = lowerHalf.length;
    if (lowerLen % 2 === 0) {
        steps += `   Lower half has ${lowerLen} values (even)\n`;
        steps += `   Q₁ = average of values at positions ${lowerLen/2} and ${lowerLen/2 + 1}\n`;
        steps += `   Q₁ = (${q1Result.left} + ${q1Result.right}) / 2 = ${q1}\n\n`;
    } else {
        steps += `   Lower half has ${lowerLen} values (odd)\n`;
        steps += `   Q₁ = value at position ${Math.floor(lowerLen/2) + 1} = ${q1}\n\n`;
    }
    
    steps += `Step 5: Find Q₃ (Median of upper half - 75th percentile)\n`;
    let upperLen = upperHalf.length;
    if (upperLen % 2 === 0) {
        steps += `   Upper half has ${upperLen} values (even)\n`;
        steps += `   Q₃ = average of values at positions ${upperLen/2} and ${upperLen/2 + 1}\n`;
        steps += `   Q₃ = (${q3Result.left} + ${q3Result.right}) / 2 = ${q3}\n\n`;
    } else {
        steps += `   Upper half has ${upperLen} values (odd)\n`;
        steps += `   Q₃ = value at position ${Math.floor(upperLen/2) + 1} = ${q3}\n\n`;
    }
    
    steps += `Step 6: Calculate Interquartile Range (IQR)\n`;
    steps += `   IQR = Q₃ - Q₁ = ${q3} - ${q1} = ${iqr}\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Q₁ (25th percentile) = ${q1}\n`;
    steps += `✅ Q₂ (50th percentile / Median) = ${q2}\n`;
    steps += `✅ Q₃ (75th percentile) = ${q3}\n`;
    steps += `✅ IQR (Interquartile Range) = ${iqr}`;
    
    return { q1, q2, q3, iqr: iqr, steps: steps };
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

// COEFFICIENT OF VARIATION - COMPUTE FUNCTION
function computeCVWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    let n = numbers.length;
    
    let steps = `📊 FORMULA: CV = (σ / μ) × 100%\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Step 1: Calculate mean
    let sum = 0;
    let sumTerms = [];
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
        sumTerms.push(numbers[i]);
    }
    let mean = sum / n;
    
    steps += `Step 1: Calculate the mean (μ)\n`;
    steps += `   Sum (Σx) = ${sumTerms.join(' + ')} = ${sum}\n`;
    steps += `   n = ${n}\n`;
    steps += `   μ = Σx / n = ${sum} / ${n} = ${mean.toFixed(6)}\n\n`;
    
    // Step 2: Calculate variance
    steps += `Step 2: Calculate the variance (σ²)\n`;
    steps += `   Formula: σ² = Σ(xᵢ - μ)² / n\n`;
    
    let squaredDiffs = [];
    let sumSqDiffs = 0;
    for (let i = 0; i < numbers.length; i++) {
        let diff = numbers[i] - mean;
        let sqDiff = diff * diff;
        squaredDiffs.push(sqDiff);
        sumSqDiffs += sqDiff;
        steps += `   (${numbers[i]} - ${mean.toFixed(6)})² = (${diff.toFixed(6)})² = ${sqDiff.toFixed(6)}\n`;
    }
    steps += `   Σ(xᵢ - μ)² = ${squaredDiffs.map(d => d.toFixed(6)).join(' + ')} = ${sumSqDiffs.toFixed(6)}\n`;
    
    let variance = sumSqDiffs / n;
    steps += `   σ² = ${sumSqDiffs.toFixed(6)} / ${n} = ${variance.toFixed(6)}\n\n`;
    
    // Step 3: Calculate standard deviation
    let stdDev = Math.sqrt(variance);
    steps += `Step 3: Calculate the standard deviation (σ)\n`;
    steps += `   σ = √σ² = √${variance.toFixed(6)} = ${stdDev.toFixed(6)}\n\n`;
    
    // Step 4: Calculate CV
    let cv = (stdDev / mean) * 100;
    steps += `Step 4: Calculate Coefficient of Variation\n`;
    steps += `   CV = (σ / μ) × 100%\n`;
    steps += `   CV = (${stdDev.toFixed(6)} / ${mean.toFixed(6)}) × 100 = ${cv.toFixed(2)}%\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Coefficient of Variation = ${cv.toFixed(2)}%\n`;
    if (cv < 30) steps += `📌 Interpretation: Low variability (CV < 30%) - Data is consistent\n`;
    else if (cv < 60) steps += `📌 Interpretation: Moderate variability (CV between 30-60%)\n`;
    else steps += `📌 Interpretation: High variability (CV > 60%) - Data is widely spread\n`;
    
    return { cv: cv, steps: steps };
}

// SKEWNESS - COMPUTE FUNCTION
function computeSkewnessWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    if (numbers.length < 3) return { error: true, message: "Need at least 3 values for skewness calculation." };
    
    let n = numbers.length;
    
    let steps = `📈 FORMULA: Skewness = [n / ((n-1)(n-2))] × Σ((xᵢ - x̄)/s)³\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Step 1: Calculate mean
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) sum += numbers[i];
    let mean = sum / n;
    
    steps += `Step 1: Calculate the mean (x̄)\n`;
    steps += `   Σx = ${numbers.join(' + ')} = ${sum}\n`;
    steps += `   n = ${n}\n`;
    steps += `   x̄ = ${sum} / ${n} = ${mean.toFixed(6)}\n\n`;
    
    // Step 2: Calculate standard deviation
    steps += `Step 2: Calculate the standard deviation (s)\n`;
    let sumSqDiffs = 0;
    let diffTerms = [];
    for (let i = 0; i < numbers.length; i++) {
        let diff = numbers[i] - mean;
        let sqDiff = diff * diff;
        sumSqDiffs += sqDiff;
        diffTerms.push(`(${numbers[i]} - ${mean.toFixed(6)})² = ${sqDiff.toFixed(6)}`);
    }
    let variance = sumSqDiffs / (n - 1);
    let stdDev = Math.sqrt(variance);
    
    steps += `   Σ(xᵢ - x̄)² = ${diffTerms.join(' + ')}\n`;
    steps += `   Σ(xᵢ - x̄)² = ${sumSqDiffs.toFixed(6)}\n`;
    steps += `   s² = Σ(xᵢ - x̄)² / (n-1) = ${sumSqDiffs.toFixed(6)} / ${n-1} = ${variance.toFixed(6)}\n`;
    steps += `   s = √${variance.toFixed(6)} = ${stdDev.toFixed(6)}\n\n`;
    
    // Step 3: Calculate cubed deviations
    steps += `Step 3: Calculate cubed deviations ((xᵢ - x̄)/s)³\n`;
    let sumCubed = 0;
    let cubedTerms = [];
    for (let i = 0; i < numbers.length; i++) {
        let z = (numbers[i] - mean) / stdDev;
        let zCubed = z * z * z;
        sumCubed += zCubed;
        cubedTerms.push(`((${numbers[i]} - ${mean.toFixed(6)})/${stdDev.toFixed(6)})³ = ${zCubed.toFixed(6)}`);
        steps += `   ${cubedTerms[i]}\n`;
    }
    steps += `   Σ((xᵢ - x̄)/s)³ = ${sumCubed.toFixed(6)}\n\n`;
    
    // Step 4: Calculate skewness
    let skewness = (n / ((n - 1) * (n - 2))) * sumCubed;
    
    steps += `Step 4: Calculate skewness\n`;
    steps += `   Skewness = [${n} / ((${n-1}) × (${n-2}))] × ${sumCubed.toFixed(6)}\n`;
    steps += `   Skewness = [${n} / ${(n-1)*(n-2)}] × ${sumCubed.toFixed(6)}\n`;
    steps += `   Skewness = ${(n / ((n-1)*(n-2))).toFixed(6)} × ${sumCubed.toFixed(6)} = ${skewness.toFixed(6)}\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Skewness = ${skewness.toFixed(6)}\n`;
    if (Math.abs(skewness) < 0.1) steps += `📌 Interpretation: Approximately symmetric (skewness ≈ 0)\n`;
    else if (skewness > 0) steps += `📌 Interpretation: Right-skewed (positive skew) - Tail extends to the right\n`;
    else steps += `📌 Interpretation: Left-skewed (negative skew) - Tail extends to the left\n`;
    
    return { skewness: skewness, steps: steps };
}


// KURTOSIS - COMPUTE FUNCTION
function computeKurtosisWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    if (numbers.length < 4) return { error: true, message: "Need at least 4 values for kurtosis calculation." };
    
    let n = numbers.length;
    
    let steps = `🎯 FORMULA: Excess Kurtosis = [n(n+1)/((n-1)(n-2)(n-3))] × Σ((xᵢ - x̄)/s)⁴ - [3(n-1)²/((n-2)(n-3))]\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Step 1: Calculate mean
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) sum += numbers[i];
    let mean = sum / n;
    
    steps += `Step 1: Calculate the mean (x̄)\n`;
    steps += `   Σx = ${numbers.join(' + ')} = ${sum}\n`;
    steps += `   n = ${n}\n`;
    steps += `   x̄ = ${sum} / ${n} = ${mean.toFixed(6)}\n\n`;
    
    // Step 2: Calculate standard deviation
    steps += `Step 2: Calculate the standard deviation (s)\n`;
    let sumSqDiffs = 0;
    for (let i = 0; i < numbers.length; i++) {
        let diff = numbers[i] - mean;
        let sqDiff = diff * diff;
        sumSqDiffs += sqDiff;
    }
    let variance = sumSqDiffs / (n - 1);
    let stdDev = Math.sqrt(variance);
    
    steps += `   Σ(xᵢ - x̄)² = ${sumSqDiffs.toFixed(6)}\n`;
    steps += `   s² = ${sumSqDiffs.toFixed(6)} / ${n-1} = ${variance.toFixed(6)}\n`;
    steps += `   s = √${variance.toFixed(6)} = ${stdDev.toFixed(6)}\n\n`;
    
    // Step 3: Calculate fourth power deviations
    steps += `Step 3: Calculate ((xᵢ - x̄)/s)⁴ for each value\n`;
    let sumFourth = 0;
    let fourthTerms = [];
    for (let i = 0; i < numbers.length; i++) {
        let z = (numbers[i] - mean) / stdDev;
        let zFourth = z * z * z * z;
        sumFourth += zFourth;
        fourthTerms.push(`((${numbers[i]} - ${mean.toFixed(6)})/${stdDev.toFixed(6)})⁴ = ${zFourth.toFixed(6)}`);
        steps += `   ${fourthTerms[i]}\n`;
    }
    steps += `   Σ((xᵢ - x̄)/s)⁴ = ${sumFourth.toFixed(6)}\n\n`;
    
    // Step 4: Calculate kurtosis
    let term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
    let term2 = (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
    let kurtosis = term1 * sumFourth - term2;
    
    steps += `Step 4: Calculate excess kurtosis\n`;
    steps += `   First term = [n(n+1)] / [(n-1)(n-2)(n-3)]\n`;
    steps += `              = [${n} × ${n+1}] / [${n-1} × ${n-2} × ${n-3}]\n`;
    steps += `              = ${n*(n+1)} / ${(n-1)*(n-2)*(n-3)} = ${term1.toFixed(6)}\n\n`;
    steps += `   Second term = [3(n-1)²] / [(n-2)(n-3)]\n`;
    steps += `               = [3 × ${n-1}²] / [${n-2} × ${n-3}]\n`;
    steps += `               = ${3*(n-1)*(n-1)} / ${(n-2)*(n-3)} = ${term2.toFixed(6)}\n\n`;
    steps += `   Kurtosis = (${term1.toFixed(6)} × ${sumFourth.toFixed(6)}) - ${term2.toFixed(6)}\n`;
    steps += `   Kurtosis = ${(term1 * sumFourth).toFixed(6)} - ${term2.toFixed(6)} = ${kurtosis.toFixed(6)}\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Excess Kurtosis = ${kurtosis.toFixed(6)}\n`;
    if (Math.abs(kurtosis) < 0.5) steps += `📌 Interpretation: Mesokurtic (normal-like peak)\n`;
    else if (kurtosis > 0) steps += `📌 Interpretation: Leptokurtic (heavy tails, sharp peak) - More outliers than normal\n`;
    else steps += `📌 Interpretation: Platykurtic (light tails, flat peak) - Fewer outliers than normal\n`;
    
    return { kurtosis: kurtosis, steps: steps };
}

// INTERQUARTILE RANGE (IQR)
function renderIQRInterface() {
    return `
        <div class="stat-interface" id="statIQRInterface">
            <div class="interface-title">📦 Interquartile Range (IQR = Q₃ - Q₁)</div>
            <div class="formula-card">
                <div class="formula">📌 IQR = Q₃ (75th percentile) - Q₁ (25th percentile)</div>
                <div class="desc">Measures spread of middle 50% of data. Robust against outliers.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values</label>
                <textarea id="iqrInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="iqrComputeBtn">📦 Calculate IQR + Steps</button>
                    <button class="secondary-btn" id="iqrClearBtn">Clear</button>
                </div>
            </div>
            <div id="iqrResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 IQR RESULT</div>
                    <div class="result-value" id="iqrValueDisplay">—</div>
                    <div class="calculation-steps" id="iqrStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// QUARTILES & QUANTILES
function renderQuartilesInterface() {
    return `
        <div class="stat-interface" id="statQuartilesInterface">
            <div class="interface-title">🔢 Quartiles & Quantiles</div>
            <div class="formula-card">
                <div class="formula">📌 Q₁ (25th), Q₂ (50th/Median), Q₃ (75th percentile)</div>
                <div class="desc">Divides data into 4 equal parts. Quantiles generalize to any division (deciles, percentiles).</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values</label>
                <textarea id="quartilesInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="quartilesComputeBtn">🔢 Calculate Quartiles + Steps</button>
                    <button class="secondary-btn" id="quartilesClearBtn">Clear</button>
                </div>
            </div>
            <div id="quartilesResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 QUARTILES & QUANTILES RESULTS</div>
                    <div class="result-value" id="quartilesValueDisplay">—</div>
                    <div class="calculation-steps" id="quartilesStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// PERCENTILES
function renderPercentilesInterface() {
    return `
        <div class="stat-interface" id="statPercentilesInterface">
            <div class="interface-title">% Percentiles</div>
            <div class="formula-card">
                <div class="formula">📌 Pₖ = value below which k% of data falls</div>
                <div class="desc">Shows relative standing. Common: 10th, 25th, 50th, 75th, 90th percentiles.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values</label>
                <textarea id="percentilesInput" rows="3" placeholder="Example: 15, 20, 35, 40, 50, 55, 60, 65, 70, 75"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="percentilesComputeBtn">% Calculate Percentiles + Steps</button>
                    <button class="secondary-btn" id="percentilesClearBtn">Clear</button>
                </div>
            </div>
            <div id="percentilesResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 PERCENTILES RESULTS</div>
                    <div class="result-value" id="percentilesValueDisplay">—</div>
                    <div class="calculation-steps" id="percentilesStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// HARMONIC MEAN
function computeHarmonicWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    const nonPositive = numbers.filter(v => v <= 0);
    if (nonPositive.length > 0) {
        return { error: true, message: `❌ Harmonic mean requires ALL values > 0. Invalid: ${nonPositive.join(', ')}` };
    }
    let n = numbers.length;
    let recipSum = numbers.reduce((sum, v) => sum + (1 / v), 0);
    let harmonicMean = n / recipSum;
    let steps = `🎵 FORMULA: Harmonic Mean = n / Σ(1/xᵢ)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Step 1: Count observations (n) = ${n}\n`;
    steps += `Step 2: Calculate reciprocals and sum:\n`;
    let recipTerms = numbers.map(v => `1/${v} = ${(1/v).toFixed(6)}`).join("\n   ");
    steps += `   ${recipTerms}\n`;
    steps += `   Σ(1/xᵢ) = ${recipSum.toFixed(10)}\n`;
    steps += `Step 3: Divide n by sum of reciprocals → ${n} / ${recipSum.toFixed(10)}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Harmonic Mean = ${harmonicMean.toFixed(10)}`;
    return { error: false, value: harmonicMean, steps: steps };
}

// VARIANCE
function computeVarianceWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    let n = numbers.length;
    let mean = numbers.reduce((a,b) => a+b, 0) / n;
    let squaredDiffs = numbers.map(v => (v - mean) ** 2);
    let sumSqDiffs = squaredDiffs.reduce((a,b) => a+b, 0);
    let populationVar = sumSqDiffs / n;
    let sampleVar = sumSqDiffs / (n - 1);
    let steps = `📊 FORMULA: Variance\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Step 1: Calculate mean (μ or x̄) = ${mean.toFixed(8)}\n`;
    steps += `Step 2: Find squared deviations (xᵢ - mean)²:\n`;
    numbers.forEach((v, i) => {
        steps += `   ${v} → (${v} - ${mean.toFixed(8)})² = ${squaredDiffs[i].toFixed(8)}\n`;
    });
    steps += `Step 3: Sum of squared deviations = ${sumSqDiffs.toFixed(10)}\n`;
    steps += `Step 4: Population variance (σ²) = ${sumSqDiffs.toFixed(10)} / ${n} = ${populationVar.toFixed(10)}\n`;
    steps += `Step 5: Sample variance (s²) = ${sumSqDiffs.toFixed(10)} / ${n-1} = ${sampleVar.toFixed(10)}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Population Variance = ${populationVar.toFixed(10)}\n✅ Sample Variance = ${sampleVar.toFixed(10)}`;
    return { population: populationVar, sample: sampleVar, steps: steps };
}

// STANDARD DEVIATION
function computeStdDevWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    let n = numbers.length;
    let mean = numbers.reduce((a,b) => a+b, 0) / n;
    let squaredDiffs = numbers.map(v => (v - mean) ** 2);
    let sumSqDiffs = squaredDiffs.reduce((a,b) => a+b, 0);
    let populationVar = sumSqDiffs / n;
    let sampleVar = sumSqDiffs / (n - 1);
    let populationStd = Math.sqrt(populationVar);
    let sampleStd = Math.sqrt(sampleVar);
    let steps = `📏 FORMULA: Standard Deviation = √Variance\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Step 1: Calculate mean = ${mean.toFixed(8)}\n`;
    steps += `Step 2: Sum of squared deviations = ${sumSqDiffs.toFixed(10)}\n`;
    steps += `Step 3: Population variance = ${populationVar.toFixed(10)} → σ = √${populationVar.toFixed(10)} = ${populationStd.toFixed(10)}\n`;
    steps += `Step 4: Sample variance = ${sampleVar.toFixed(10)} → s = √${sampleVar.toFixed(10)} = ${sampleStd.toFixed(10)}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Population Std Dev = ${populationStd.toFixed(10)}\n✅ Sample Std Dev = ${sampleStd.toFixed(10)}`;
    return { population: populationStd, sample: sampleStd, steps: steps };
}

// RANGE
function computeRangeWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    let min = Math.min(...numbers);
    let max = Math.max(...numbers);
    let range = max - min;
    let steps = `↗️ FORMULA: Range = Maximum - Minimum\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Step 1: Find maximum value = ${max}\n`;
    steps += `Step 2: Find minimum value = ${min}\n`;
    steps += `Step 3: Calculate range = ${max} - ${min} = ${range}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Range = ${range}`;
    return { value: range, steps: steps, min: min, max: max };
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
    let q1, q3;
    if (n % 2 === 0) {
        q1 = getMedian(sorted.slice(0, n/2));
        q3 = getMedian(sorted.slice(n/2));
    } else {
        q1 = getMedian(sorted.slice(0, Math.floor(n/2)));
        q3 = getMedian(sorted.slice(Math.floor(n/2) + 1));
    }
    let iqr = q3 - q1;
    let steps = `📦 FORMULA: IQR = Q₃ - Q₁ (75th percentile - 25th percentile)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `Step 1: Sort data → [${sorted.join(', ')}]\n`;
    steps += `Step 2: Find median (Q₂) = ${getMedian(sorted)}\n`;
    steps += `Step 3: Find Q₁ (median of lower half) = ${q1}\n`;
    steps += `Step 4: Find Q₃ (median of upper half) = ${q3}\n`;
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
// DECILES INTERFACE
function renderDecilesInterface() {
    return `
        <div class="stat-interface" id="statDecilesInterface">
            <div class="interface-title">📊 Deciles (10th, 20th, ..., 90th Percentiles)</div>
            <div class="formula-card">
                <div class="formula">📌 Dₖ = value at position (k × n / 10)</div>
                <div class="desc">Deciles divide data into 10 equal parts. D₁ = 10th percentile, D₅ = 50th percentile (median), D₉ = 90th percentile.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values</label>
                <textarea id="decilesInput" rows="3" placeholder="Example: 15, 20, 35, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="decilesComputeBtn">📊 Calculate Deciles + Steps</button>
                    <button class="secondary-btn" id="decilesClearBtn">Clear</button>
                </div>
            </div>
            <div id="decilesResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 DECILES RESULTS</div>
                    <div class="result-value" id="decilesValueDisplay">—</div>
                    <div class="calculation-steps" id="decilesStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// DECILES COMPUTE FUNCTION
function computeDecilesWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    let sorted = [...numbers].sort((a, b) => a - b);
    let n = sorted.length;
    
    let deciles = {};
    let steps = `📊 FORMULA: Decile Dₖ = value at position (k × n / 10)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Sort the data in ascending order\n`;
    steps += `   Original: [${numbers.join(', ')}]\n`;
    steps += `   Sorted:   [${sorted.join(', ')}]\n`;
    steps += `   Sample size (n) = ${n}\n\n`;
    
    steps += `Step 2: Calculate each decile using linear interpolation\n`;
    steps += `   Formula: Position = k × n / 10\n\n`;
    
    for (let k = 1; k <= 9; k++) {
        let position = (k * n) / 10;
        let value;
        
        if (Number.isInteger(position)) {
            // Exact position - average with next value
            let idx = position - 1;
            if (idx + 1 < n) {
                value = (sorted[idx] + sorted[idx + 1]) / 2;
                steps += `📌 D${k} (${k * 10}th percentile):\n`;
                steps += `   Position = ${k} × ${n} / 10 = ${position}\n`;
                steps += `   Exact integer → average of positions ${position} and ${position + 1}\n`;
                steps += `   D${k} = (${sorted[idx]} + ${sorted[idx + 1]}) / 2 = ${value.toFixed(6)}\n\n`;
            } else {
                value = sorted[idx];
                steps += `📌 D${k} (${k * 10}th percentile):\n`;
                steps += `   Position = ${position}\n`;
                steps += `   D${k} = ${value.toFixed(6)}\n\n`;
            }
        } else {
            let lowerIdx = Math.floor(position);
            let upperIdx = Math.ceil(position);
            let fraction = position - lowerIdx;
            let lowerIdxCorrected = Math.max(0, lowerIdx - 1);
            let upperIdxCorrected = Math.min(n - 1, upperIdx - 1);
            
            value = sorted[lowerIdxCorrected] + fraction * (sorted[upperIdxCorrected] - sorted[lowerIdxCorrected]);
            
            steps += `📌 D${k} (${k * 10}th percentile):\n`;
            steps += `   Position = ${k} × ${n} / 10 = ${position.toFixed(4)}\n`;
            steps += `   Between indices ${lowerIdx} and ${upperIdx}\n`;
            steps += `   Lower value = ${sorted[lowerIdxCorrected]}\n`;
            steps += `   Upper value = ${sorted[upperIdxCorrected]}\n`;
            steps += `   Fraction = ${fraction.toFixed(4)}\n`;
            steps += `   D${k} = ${sorted[lowerIdxCorrected]} + ${fraction.toFixed(4)} × (${sorted[upperIdxCorrected]} - ${sorted[lowerIdxCorrected]}) = ${value.toFixed(6)}\n\n`;
        }
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
// STANDARD ERROR OF MEAN INTERFACE
function renderStdErrorInterface() {
    return `
        <div class="stat-interface" id="statStdErrorInterface">
            <div class="interface-title">📏 Standard Error of the Mean (SEM)</div>
            <div class="formula-card">
                <div class="formula">📌 SEM = s / √n</div>
                <div class="desc">The standard error measures how far the sample mean is likely to be from the population mean. Smaller SEM = more precise estimate.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (commas, spaces, or line breaks)</label>
                <textarea id="stderrorInput" rows="3" placeholder="Example: 12, 45.5, 78, 99.99, 23"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="stderrorComputeBtn">📏 Calculate Standard Error + Full Steps</button>
                    <button class="secondary-btn" id="stderrorClearBtn">Clear</button>
                </div>
            </div>
            <div id="stderrorResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">📏 STANDARD ERROR RESULT</div>
                    <div class="result-value" id="stderrorValueDisplay">—</div>
                    <div class="calculation-steps" id="stderrorStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
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
    steps += `   • The sample mean is estimated to be ±${(stdError * 1.96).toFixed(6)} from the population mean (95% CI)\n`;
    steps += `   • Smaller SEM = more precise estimate of the population mean\n`;
    steps += `   • 95% Confidence Interval: ${mean.toFixed(6)} ± ${(stdError * 1.96).toFixed(6)}`;
    
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
// Chart instance reference
let currentChart = null;

// Function to generate detailed distribution analysis
// Function to generate detailed distribution analysis
function generateDistributionAnalysis(numbers) {
    if (!numbers || numbers.length === 0) return "No data available for analysis.";
    
    const n = numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    
    // Calculate mean
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Calculate median
    let median;
    if (n % 2 === 0) {
        median = (sorted[n/2 - 1] + sorted[n/2]) / 2;
    } else {
        median = sorted[Math.floor(n/2)];
    }
    
    // Calculate mode
    const freqMap = new Map();
    numbers.forEach(num => freqMap.set(num, (freqMap.get(num) || 0) + 1));
    let maxFreq = 0;
    let modes = [];
    for (let [num, freq] of freqMap) {
        if (freq > maxFreq) {
            maxFreq = freq;
            modes = [num];
        } else if (freq === maxFreq) {
            modes.push(num);
        }
    }
    const modeText = maxFreq === 1 ? "No mode (all values unique)" : modes.join(", ") + ` (appears ${maxFreq} time${maxFreq > 1 ? 's' : ''})`;
    
    // Calculate variance and standard deviation
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Calculate Coefficient of Variation (CV)
    const cv = stdDev / mean;
    
    // Calculate quartiles
    const getQ = (arr, percentile) => {
        const pos = (arr.length - 1) * percentile;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (rest === 0) return arr[base];
        return arr[base] + rest * (arr[base + 1] - arr[base]);
    };
    const q1 = getQ(sorted, 0.25);
    const q3 = getQ(sorted, 0.75);
    const iqr = q3 - q1;
    
    // Determine skewness
    const skewness = (mean - median) / stdDev;
    let skewType = "";
    if (Math.abs(skewness) < 0.1) skewType = "Approximately symmetric";
    else if (skewness > 0) skewType = "Right-skewed (positive skew)";
    else skewType = "Left-skewed (negative skew)";
    
    // Determine kurtosis approximation
    const fourthMoment = numbers.reduce((a, b) => a + Math.pow(b - mean, 4), 0) / n;
    const kurtosis = fourthMoment / Math.pow(variance, 2) - 3;
    let kurtosisType = "";
    if (Math.abs(kurtosis) < 0.5) kurtosisType = "Mesokurtic (normal-like peak)";
    else if (kurtosis > 0) kurtosisType = "Leptokurtic (heavy tails, sharp peak)";
    else kurtosisType = "Platykurtic (light tails, flat peak)";
    
    // Outlier detection (using IQR method)
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = numbers.filter(x => x < lowerBound || x > upperBound);
    
    // Generate analysis text
    let analysis = `📊 DETAILED DISTRIBUTION ANALYSIS\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    analysis += `📌 BASIC STATISTICS:\n`;
    analysis += `• Sample size (n): ${n}\n`;
    analysis += `• Minimum value: ${min.toFixed(4)}\n`;
    analysis += `• Maximum value: ${max.toFixed(4)}\n`;
    analysis += `• Range: ${range.toFixed(4)}\n\n`;
    
    analysis += `📌 CENTRAL TENDENCY:\n`;
    analysis += `• Mean (average): ${mean.toFixed(4)}\n`;
    analysis += `• Median (middle): ${median.toFixed(4)}\n`;
    analysis += `• Mode (most frequent): ${modeText}\n`;
    analysis += `• Mean vs Median difference: ${Math.abs(mean - median).toFixed(4)}\n\n`;
    
    analysis += `📌 DISPERSION (SPREAD):\n`;
    analysis += `• Variance: ${variance.toFixed(4)}\n`;
    analysis += `• Standard Deviation: ${stdDev.toFixed(4)}\n`;
    analysis += `• Coefficient of Variation (CV): ${(cv * 100).toFixed(2)}%\n`;
    analysis += `• Q1 (25th percentile): ${q1.toFixed(4)}\n`;
    analysis += `• Q3 (75th percentile): ${q3.toFixed(4)}\n`;
    analysis += `• Interquartile Range (IQR): ${iqr.toFixed(4)}\n\n`;
    
    analysis += `📌 DISTRIBUTION SHAPE:\n`;
    analysis += `• Skewness: ${skewness.toFixed(4)} → ${skewType}\n`;
    analysis += `  `;
    if (skewness > 0.1) analysis += `Mean > Median, tail extends to the right.\n`;
    else if (skewness < -0.1) analysis += `Mean < Median, tail extends to the left.\n`;
    else analysis += `Mean ≈ Median, roughly bell-shaped.\n`;
    
    analysis += `• Kurtosis: ${kurtosis.toFixed(4)} → ${kurtosisType}\n`;
    analysis += `  `;
    if (kurtosis > 0.5) analysis += `Distribution has heavier tails and sharper peak than normal.\n`;
    else if (kurtosis < -0.5) analysis += `Distribution has lighter tails and flatter peak than normal.\n`;
    else analysis += `Distribution similar to normal curve.\n\n`;
    
    analysis += `📌 OUTLIER DETECTION (IQR Method):\n`;
    analysis += `• Lower bound (Q1 - 1.5×IQR): ${lowerBound.toFixed(4)}\n`;
    analysis += `• Upper bound (Q3 + 1.5×IQR): ${upperBound.toFixed(4)}\n`;
    if (outliers.length === 0) {
        analysis += `• ✅ No outliers detected in the dataset.\n`;
    } else {
        analysis += `• ⚠️ Outliers found (${outliers.length} value${outliers.length > 1 ? 's' : ''}): ${outliers.map(x => x.toFixed(4)).join(", ")}\n`;
        analysis += `  These values fall outside the typical range and may affect statistical measures.\n`;
    }
    analysis += `\n`;
    
    analysis += `📌 INTERPRETATION:\n`;
    if (Math.abs(mean - median) < 0.1 * stdDev) {
        analysis += `• The data appears roughly symmetric. The mean and median are close,\n`;
        analysis += `  suggesting the average is representative of typical values.\n`;
    } else if (mean > median) {
        analysis += `• The data is right-skewed (positively skewed). This means there are\n`;
        analysis += `  some relatively high values pulling the mean above the median.\n`;
        analysis += `  Consider using median for central tendency.\n`;
    } else {
        analysis += `• The data is left-skewed (negatively skewed). This means there are\n`;
        analysis += `  some relatively low values pulling the mean below the median.\n`;
        analysis += `  Consider using median for central tendency.\n`;
    }
    
    if (outliers.length > 0) {
        analysis += `\n• Outliers detected! These extreme values may significantly impact\n`;
        analysis += `  the mean and standard deviation. Consider investigating these\n`;
        analysis += `  values or using robust statistics (median, IQR).\n`;
    }
    
    if (cv > 0.3) {
        analysis += `\n• High relative variability (CV > 30%). The data shows substantial\n`;
        analysis += `  spread relative to the mean.\n`;
    } else if (cv < 0.1) {
        analysis += `\n• Low relative variability (CV < 10%). The data is tightly clustered\n`;
        analysis += `  around the mean.\n`;
    } else {
        analysis += `\n• Moderate relative variability (CV between 10-30%). The data has\n`;
        analysis += `  reasonable spread around the mean.\n`;
    }
    
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    return analysis;
}
// ========== FIVE-NUMBER SUMMARY COMPUTATION ==========
function computeFiveNumWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    let sorted = [...numbers].sort((a,b) => a-b);
    let n = sorted.length;
    let min = sorted[0];
    let max = sorted[n-1];
    
    let getMedian = (arr) => {
        let m = arr.length;
        if (m % 2 === 0) return (arr[m/2 - 1] + arr[m/2]) / 2;
        else return arr[Math.floor(m/2)];
    };
    
    let q1, q3;
    if (n % 2 === 0) {
        q1 = getMedian(sorted.slice(0, n/2));
        q3 = getMedian(sorted.slice(n/2));
    } else {
        q1 = getMedian(sorted.slice(0, Math.floor(n/2)));
        q3 = getMedian(sorted.slice(Math.floor(n/2) + 1));
    }
    
    let median = getMedian(sorted);
    let iqr = q3 - q1;
    
    let steps = `📦 FORMULA: Five-Number Summary = {Min, Q₁, Median, Q₃, Max}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Sort the data in ascending order\n`;
    steps += `   Original: [${numbers.join(', ')}]\n`;
    steps += `   Sorted:   [${sorted.join(', ')}]\n`;
    steps += `   n = ${n}\n\n`;
    
    steps += `Step 2: Find Minimum value\n`;
    steps += `   Minimum = first value in sorted list = ${min}\n\n`;
    
    steps += `Step 3: Find Maximum value\n`;
    steps += `   Maximum = last value in sorted list = ${max}\n\n`;
    
    steps += `Step 4: Find Median (Q₂)\n`;
    if (n % 2 === 0) {
        let left = sorted[n/2 - 1];
        let right = sorted[n/2];
        steps += `   n is even → median = (${left} + ${right}) / 2 = ${median}\n\n`;
    } else {
        let pos = Math.floor(n/2);
        steps += `   n is odd → median = value at position ${pos+1} = ${median}\n\n`;
    }
    
    steps += `Step 5: Find Q₁ (25th percentile - median of lower half)\n`;
    if (n % 2 === 0) {
        let lowerHalf = sorted.slice(0, n/2);
        steps += `   Lower half = [${lowerHalf.join(', ')}]\n`;
        if (lowerHalf.length % 2 === 0) {
            let left = lowerHalf[lowerHalf.length/2 - 1];
            let right = lowerHalf[lowerHalf.length/2];
            steps += `   Q₁ = (${left} + ${right}) / 2 = ${q1}\n\n`;
        } else {
            steps += `   Q₁ = ${q1}\n\n`;
        }
    } else {
        let lowerHalf = sorted.slice(0, Math.floor(n/2));
        steps += `   Lower half = [${lowerHalf.join(', ')}]\n`;
        steps += `   Q₁ = ${q1}\n\n`;
    }
    
    steps += `Step 6: Find Q₃ (75th percentile - median of upper half)\n`;
    if (n % 2 === 0) {
        let upperHalf = sorted.slice(n/2);
        steps += `   Upper half = [${upperHalf.join(', ')}]\n`;
        if (upperHalf.length % 2 === 0) {
            let left = upperHalf[upperHalf.length/2 - 1];
            let right = upperHalf[upperHalf.length/2];
            steps += `   Q₃ = (${left} + ${right}) / 2 = ${q3}\n\n`;
        } else {
            steps += `   Q₃ = ${q3}\n\n`;
        }
    } else {
        let upperHalf = sorted.slice(Math.floor(n/2) + 1);
        steps += `   Upper half = [${upperHalf.join(', ')}]\n`;
        steps += `   Q₃ = ${q3}\n\n`;
    }
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Five-Number Summary:\n`;
    steps += `   Minimum (Min) = ${min}\n`;
    steps += `   Q₁ (25th percentile) = ${q1.toFixed(4)}\n`;
    steps += `   Median (Q₂ / 50th percentile) = ${median.toFixed(4)}\n`;
    steps += `   Q₃ (75th percentile) = ${q3.toFixed(4)}\n`;
    steps += `   Maximum (Max) = ${max}\n`;
    steps += `   IQR = ${iqr.toFixed(4)}`;
    
    return { min, q1, median, q3, max, iqr, steps: steps };
}

// ========== SUM OF SQUARES COMPUTATION ==========
function computeSumSquaresWithSteps(inputText) {
    let hasGroups = inputText.includes(':');
    let groups = new Map();
    let allValues = [];
    
    if (hasGroups) {
        let entries = inputText.split(/[,\s\n]+/);
        for (let entry of entries) {
            entry = entry.trim();
            if (entry === "") continue;
            let [valStr, groupName] = entry.split(':');
            let val = parseFloat(valStr);
            if (!isNaN(val) && isFinite(val) && groupName) {
                groupName = escapeHtml(groupName.trim());
                if (!groups.has(groupName)) groups.set(groupName, []);
                groups.get(groupName).push(val);
                allValues.push(val);
            }
        }
    } else {
        let numbers = parseNumbersFromInput(inputText);
        allValues = numbers;
        if (numbers.length > 0) {
            groups.set('All Data', numbers);
        }
    }
    
    if (allValues.length === 0) return { error: true, message: "No valid numbers provided." };
    
    let n = allValues.length;
    let grandMean = allValues.reduce((a,b) => a+b, 0) / n;
    
    let steps = `🔲 FORMULA: Sum of Squares\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📌 TOTAL SUM OF SQUARES (SSₜₒₜₐₗ)\n`;
    steps += `   Formula: SSₜₒₜₐₗ = Σ(xᵢ - x̄)² where x̄ is grand mean\n\n`;
    steps += `   Grand Mean (x̄) = Σx / N = ${allValues.reduce((a,b)=>a+b,0)} / ${n} = ${grandMean.toFixed(6)}\n\n`;
    
    let totalSS = 0;
    let totalTerms = [];
    for (let val of allValues) {
        let diff = val - grandMean;
        let sqDiff = diff * diff;
        totalSS += sqDiff;
        totalTerms.push(`(${val} - ${grandMean.toFixed(6)})² = ${sqDiff.toFixed(6)}`);
    }
    steps += `   Σ(xᵢ - x̄)² calculations:\n`;
    totalTerms.forEach(term => steps += `   ${term}\n`);
    steps += `   SSₜₒₜₐₗ = ${totalSS.toFixed(6)}\n\n`;
    
    let withinSS = 0;
    let betweenSS = 0;
    
    if (groups.size > 1) {
        steps += `📌 WITHIN-GROUPS SUM OF SQUARES (SS_wᵢₜₕᵢₙ)\n`;
        steps += `   Formula: SS_wᵢₜₕᵢₙ = Σⱼ Σ(xᵢⱼ - x̄ⱼ)² where x̄ⱼ is group mean\n\n`;
        
        let groupMeans = new Map();
        
        for (let [groupName, values] of groups) {
            let groupMean = values.reduce((a,b) => a+b, 0) / values.length;
            groupMeans.set(groupName, groupMean);
            steps += `\n   Group "${groupName}":\n`;
            steps += `      Mean (x̄ⱼ) = ${values.join(' + ')} / ${values.length} = ${groupMean.toFixed(6)}\n`;
            
            let groupSS = 0;
            for (let val of values) {
                let diff = val - groupMean;
                let sqDiff = diff * diff;
                groupSS += sqDiff;
                steps += `      (${val} - ${groupMean.toFixed(6)})² = ${sqDiff.toFixed(6)}\n`;
            }
            steps += `      SS for group = ${groupSS.toFixed(6)}\n`;
            withinSS += groupSS;
        }
        steps += `\n   SS_wᵢₜₕᵢₙ = Sum of all group SS = ${withinSS.toFixed(6)}\n\n`;
        
        steps += `📌 BETWEEN-GROUPS SUM OF SQUARES (SS_bₑₜwₑₑₙ)\n`;
        steps += `   Formula: SS_bₑₜwₑₑₙ = Σ nⱼ(x̄ⱼ - x̄)² where nⱼ is group size\n\n`;
        
        for (let [groupName, values] of groups) {
            let groupMean = groupMeans.get(groupName);
            let nj = values.length;
            let diff = groupMean - grandMean;
            let contribution = nj * (diff * diff);
            betweenSS += contribution;
            steps += `   Group "${groupName}": nⱼ = ${nj}, x̄ⱼ = ${groupMean.toFixed(6)}\n`;
            steps += `      (x̄ⱼ - x̄)² = (${groupMean.toFixed(6)} - ${grandMean.toFixed(6)})² = ${(diff*diff).toFixed(6)}\n`;
            steps += `      nⱼ × (x̄ⱼ - x̄)² = ${nj} × ${(diff*diff).toFixed(6)} = ${contribution.toFixed(6)}\n\n`;
        }
        steps += `   SS_bₑₜwₑₑₙ = ${betweenSS.toFixed(6)}\n\n`;
        
        steps += `📌 VERIFICATION: SSₜₒₜₐₗ = SS_wᵢₜₕᵢₙ + SS_bₑₜwₑₑₙ\n`;
        steps += `   ${totalSS.toFixed(6)} = ${withinSS.toFixed(6)} + ${betweenSS.toFixed(6)}\n`;
        steps += `   ${totalSS.toFixed(6)} = ${(withinSS + betweenSS).toFixed(6)} ✅\n\n`;
    } else {
        steps += `📌 NOTE: Only one group detected. For multiple groups, use format "value:group"\n`;
        steps += `   Within-groups SS and Between-groups SS require at least 2 groups.\n\n`;
        withinSS = "N/A (only one group)";
        betweenSS = "N/A (only one group)";
    }
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ SUM OF SQUARES RESULTS:\n`;
    steps += `   • Total Sum of Squares (SSₜₒₜₐₗ) = ${totalSS.toFixed(6)}\n`;
    if (groups.size > 1) {
        steps += `   • Within-Groups Sum of Squares (SS_wᵢₜₕᵢₙ) = ${withinSS.toFixed(6)}\n`;
        steps += `   • Between-Groups Sum of Squares (SS_bₑₜwₑₑₙ) = ${betweenSS.toFixed(6)}\n`;
    }
    
    return { 
        totalSS: totalSS, 
        withinSS: (typeof withinSS === 'number') ? withinSS : withinSS, 
        betweenSS: (typeof betweenSS === 'number') ? betweenSS : betweenSS,
        grandMean: grandMean,
        n: n,
        hasGroups: (groups.size > 1),
        steps: steps 
    };
}

// ========== SETUP FUNCTIONS ==========
function setupFiveNumLogic() {
    const computeBtn = document.getElementById("fiveNumComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("fiveNumInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("fiveNumResultArea");
        const valueSpan = document.getElementById("fiveNumValueDisplay");
        const stepsSpan = document.getElementById("fiveNumStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to compute five-number summary.";
            return;
        }
        
        const fiveNumRes = computeFiveNumWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = `Min: ${fiveNumRes.min} | Q₁: ${fiveNumRes.q1.toFixed(4)} | Median: ${fiveNumRes.median.toFixed(4)} | Q₃: ${fiveNumRes.q3.toFixed(4)} | Max: ${fiveNumRes.max}`;
        stepsSpan.innerText = fiveNumRes.steps;
    });
    attachClearHandler("fiveNumClearBtn", "fiveNumInput", "fiveNumResultArea");
}

function setupSumSquaresLogic() {
    const computeBtn = document.getElementById("sumSquaresComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("sumSquaresInput").value;
        const resultDiv = document.getElementById("sumSquaresResultArea");
        const valueSpan = document.getElementById("sumSquaresValueDisplay");
        const stepsSpan = document.getElementById("sumSquaresStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to compute sum of squares.";
            return;
        }
        
        const ssRes = computeSumSquaresWithSteps(raw);
        if (ssRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerText = ssRes.message;
            return;
        }
        
        resultDiv.style.display = "block";
        if (ssRes.hasGroups) {
            valueSpan.innerHTML = `SSₜₒₜₐₗ: ${ssRes.totalSS.toFixed(4)} | SS_wᵢₜₕᵢₙ: ${ssRes.withinSS.toFixed(4)} | SS_bₑₜwₑₑₙ: ${ssRes.betweenSS.toFixed(4)}`;
        } else {
            valueSpan.innerHTML = `SSₜₒₜₐₗ: ${ssRes.totalSS.toFixed(4)}`;
        }
        stepsSpan.innerText = ssRes.steps;
    });
    attachClearHandler("sumSquaresClearBtn", "sumSquaresInput", "sumSquaresResultArea");
}


// ========== Tools defined with defineListTool (see js/00-toolkit.js) ==========
const meanTool = defineListTool({
    id: 'mean', interfaceId: 'statMeanInterface',
    title: "📐 Arithmetic Mean (Average)",
    formula: "📌 μ = (Σ xᵢ) / n",
    desc: "Sum of all data points divided by the total count. Most common measure of central tendency.",
    label: "📋 Enter numeric values (commas, spaces, or line breaks)",
    placeholder: "Example: 12, 45.5, 78, 99.99, 23",
    buttonText: "📐 Calculate Mean + Full Steps",
    resultLabel: "📊 ARITHMETIC MEAN RESULT",
    stepsPlaceholder: "Detailed calculation will appear here...",
    empty: { value: "⚠️ Invalid input", steps: "Please enter at least one numeric value (e.g., 4, 7.5, 12)." },
    compute: computeMeanWithSteps,
    display: r => r.value.toFixed(10)
});

const medianTool = defineListTool({
    id: 'median', interfaceId: 'statMedianInterface',
    title: "📈 Median (50th Percentile)",
    formula: "📌 Median = { x_{(n+1)/2} if n odd | (x_{n/2} + x_{n/2+1})/2 if n even }",
    desc: "Middle value after sorting data. Robust against outliers.",
    placeholder: "Example: 2, 8, 3, 10, 5, 4",
    buttonText: "📈 Calculate Median + Full Steps",
    resultLabel: "🎯 MEDIAN RESULT",
    empty: { value: "No data", steps: "Enter numbers to compute median (e.g., 10, 20, 30)." },
    compute: computeMedianWithSteps,
    display: r => (Number.isInteger(r.value) ? r.value : r.value.toFixed(10))
});

const modeTool = defineListTool({
    id: 'mode', interfaceId: 'statModeInterface',
    title: "⭐ Mode (Most Frequent Value)",
    formula: "📌 Mode = argmax_v freq(v)",
    desc: "Value(s) that occur most often. Dataset can have one mode, multiple modes, or no mode.",
    placeholder: "Example: 5, 3, 5, 2, 5, 8, 2, 2",
    buttonText: "⭐ Calculate Mode + Frequency Steps",
    resultLabel: "🔥 MODE RESULT",
    empty: { value: "No data", steps: "Provide numeric values for mode analysis." },
    compute: computeModeWithSteps,
    display: r => r.display
});

const geometricTool = defineListTool({
    id: 'geometric', interfaceId: 'statGeomInterface', elementPrefix: 'geom',
    title: "📉 Geometric Mean (Multiplicative Average)",
    formula: "📌 GM = (∏ x_i)^{1/n}   (all x_i > 0)",
    desc: "Used for growth rates, ratios, percentages. Always ≤ arithmetic mean for positive data.",
    label: "📋 Enter positive numeric values (growth rates, ratios, or any positive numbers)",
    placeholder: "Example: 1.05, 1.08, 1.02   or   2, 8, 4",
    buttonText: "📉 Calculate Geometric Mean + Steps",
    resultLabel: "📐 GEOMETRIC MEAN RESULT",
    empty: { value: "⚠️ No valid numbers", steps: "Please enter positive numbers for geometric mean." },
    errorValue: "❌ Invalid",
    compute: computeGeometricWithSteps,
    display: r => r.value.toFixed(12)
});

const harmonicTool = defineListTool({
    id: 'harmonic', interfaceId: 'statHarmonicInterface',
    title: "🎵 Harmonic Mean (For Rates & Ratios)",
    formula: "📌 HM = n / Σ(1/xᵢ)",
    desc: "Best for rates, speeds, ratios. All values must be > 0.",
    label: "📋 Enter positive numeric values (rates, speeds, ratios)",
    placeholder: "Example: 2, 4, 8, 16",
    buttonText: "🎵 Calculate Harmonic Mean + Steps",
    resultLabel: "📐 HARMONIC MEAN RESULT",
    empty: { value: "⚠️ Invalid input", steps: "Please enter positive numbers." },
    errorValue: "❌ Invalid",
    compute: computeHarmonicWithSteps,
    display: r => r.value.toFixed(10)
});

const varianceTool = defineListTool({
    id: 'variance', interfaceId: 'statVarianceInterface',
    title: "📊 Variance (Population & Sample)",
    formula: "📌 Population: σ² = Σ(xᵢ - μ)² / N &nbsp;|&nbsp; Sample: s² = Σ(xᵢ - x̄)² / (n-1)",
    desc: "Measures spread around the mean. Sample variance uses (n-1) for unbiased estimation.",
    placeholder: "Example: 2, 4, 4, 4, 5, 5, 7, 9",
    buttonText: "📊 Calculate Variance + Steps",
    resultLabel: "🎯 VARIANCE RESULTS",
    empty: { value: "No data", steps: "Enter numbers to compute variance." },
    min: { count: 2, value: "❌ Need at least 2 values", steps: "Sample variance requires at least 2 observations." },
    compute: computeVarianceWithSteps,
    display: r => `Pop: ${r.population.toFixed(8)} | Sample: ${r.sample.toFixed(8)}`
});

const stddevTool = defineListTool({
    id: 'stddev', interfaceId: 'statStdDevInterface',
    title: "📏 Standard Deviation (Spread Around Mean)",
    formula: "📌 Population: σ = √σ² &nbsp;|&nbsp; Sample: s = √s²",
    desc: "Square root of variance. Measures average distance from mean.",
    placeholder: "Example: 2, 4, 4, 4, 5, 5, 7, 9",
    buttonText: "📏 Calculate Std Dev + Steps",
    resultLabel: "🎯 STANDARD DEVIATION RESULTS",
    empty: { value: "No data", steps: "Enter numbers to compute standard deviation." },
    min: { count: 2, value: "❌ Need at least 2 values", steps: "Sample standard deviation requires at least 2 observations." },
    compute: computeStdDevWithSteps,
    display: r => `Pop: ${r.population.toFixed(8)} | Sample: ${r.sample.toFixed(8)}`
});

const rangeTool = defineListTool({
    id: 'range', interfaceId: 'statRangeInterface',
    title: "↗️ Range (Max - Min)",
    formula: "📌 Range = Maximum Value - Minimum Value",
    desc: "Simplest measure of dispersion. Sensitive to outliers.",
    placeholder: "Example: 5, 12, 8, 20, 15, 9",
    buttonText: "↗️ Calculate Range + Steps",
    resultLabel: "🎯 RANGE RESULT",
    empty: { value: "No data", steps: "Enter numbers to compute range." },
    compute: computeRangeWithSteps,
    display: r => r.value
});

const cvTool = defineListTool({
    id: 'cv', interfaceId: 'statCVInterface',
    title: "📊 Coefficient of Variation (CV)",
    formula: "📌 CV = (σ / μ) × 100%",
    desc: "Relative measure of dispersion. Compares variability regardless of units. CV < 30% = low variability.",
    placeholder: "Example: 10, 12, 14, 11, 13, 15",
    buttonText: "📊 Calculate CV + Steps",
    resultLabel: "🎯 COEFFICIENT OF VARIATION RESULT",
    empty: { value: "No data", steps: "Enter numbers to compute CV." },
    compute: computeCVWithSteps,
    display: r => `${r.cv.toFixed(2)}%`
});

const skewnessTool = defineListTool({
    id: 'skewness', interfaceId: 'statSkewnessInterface',
    title: "📈 Skewness (Asymmetry)",
    formula: "📌 Skewness = Σ(xᵢ - x̄)³ / [(n-1)s³]",
    desc: "Measures asymmetry. 0 = symmetric, >0 = right-skewed, <0 = left-skewed.",
    placeholder: "Example: 2, 3, 5, 7, 8, 10, 12, 15, 20",
    buttonText: "📈 Calculate Skewness + Steps",
    resultLabel: "🎯 SKEWNESS RESULT",
    empty: { value: "No data", steps: "Enter numbers to compute skewness." },
    min: { count: 3, value: "❌ Need at least 3 values", steps: "Skewness calculation requires at least 3 data points." },
    compute: computeSkewnessWithSteps,
    display: r => r.skewness.toFixed(6)
});

const kurtosisTool = defineListTool({
    id: 'kurtosis', interfaceId: 'statKurtosisInterface',
    title: "🎯 Kurtosis (Tails & Peakedness)",
    formula: "📌 Kurtosis = Σ(xᵢ - x̄)⁴ / [(n-1)s⁴] - 3",
    desc: "Excess kurtosis. 0 = mesokurtic (normal), >0 = leptokurtic (heavy tails), <0 = platykurtic (light tails).",
    placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
    buttonText: "🎯 Calculate Kurtosis + Steps",
    resultLabel: "🎯 KURTOSIS RESULT",
    empty: { value: "No data", steps: "Enter numbers to compute kurtosis." },
    min: { count: 4, value: "❌ Need at least 4 values", steps: "Kurtosis calculation requires at least 4 data points." },
    compute: computeKurtosisWithSteps,
    display: r => r.kurtosis.toFixed(6)
});
