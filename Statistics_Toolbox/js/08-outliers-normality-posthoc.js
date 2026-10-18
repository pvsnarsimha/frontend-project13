/* Outliers, transformations, normality tests, ANCOVA/MANOVA, variance tests, post-hoc tests */
// ========== IQR OUTLIER DETECTION INTERFACE ==========
function renderIQROutlierInterface() {
    return `
        <div class="stat-interface" id="statIQROutlierInterface">
            <div class="interface-title">📊 Detect Outliers (IQR Rule)</div>
            <div class="formula-card">
                <div class="formula">📌 Lower Bound = Q₁ - 1.5×IQR | Upper Bound = Q₃ + 1.5×IQR</div>
                <div class="desc">The Interquartile Range (IQR) method identifies outliers as values that fall below Q₁ - 1.5×IQR or above Q₃ + 1.5×IQR. This is a robust method that works well for skewed distributions.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated):</label>
                <textarea id="iqrOutlierInput" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 100, 15, 14, 17, 16, 15, 200"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="iqrOutlierComputeBtn">📊 Detect Outliers (IQR) + Full Steps</button>
                    <button class="secondary-btn" id="iqrOutlierClearBtn">Clear</button>
                </div>
            </div>
            <div id="iqrOutlierResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 IQR OUTLIER DETECTION RESULTS</div>
                    <div class="result-value" id="iqrOutlierValueDisplay">—</div>
                    <div class="calculation-steps" id="iqrOutlierStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== Z-SCORE OUTLIER DETECTION INTERFACE ==========
function renderZOutlierInterface() {
    return `
        <div class="stat-interface" id="statZOutlierInterface">
            <div class="interface-title">📏 Detect Outliers (Z-score > 3)</div>
            <div class="formula-card">
                <div class="formula">📌 Z-score = |x - μ| / σ</div>
                <div class="desc">The Z-score method identifies outliers as values where |Z-score| > 3, meaning they are more than 3 standard deviations from the mean. This works best for normally distributed data.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated):</label>
                <textarea id="zOutlierInput" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 100, 15, 14, 17, 16, 15, 200"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="zOutlierComputeBtn">📏 Detect Outliers (Z-score) + Full Steps</button>
                    <button class="secondary-btn" id="zOutlierClearBtn">Clear</button>
                </div>
            </div>
            <div id="zOutlierResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 Z-SCORE OUTLIER DETECTION RESULTS</div>
                    <div class="result-value" id="zOutlierValueDisplay">—</div>
                    <div class="calculation-steps" id="zOutlierStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== IQR OUTLIER DETECTION COMPUTATION ==========
function computeIQROutlierWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Calculate Quartiles
    const getMedian = (arr) => {
        const m = arr.length;
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
        steps += `   │ ${(i+1).toString().padStart(2)} │ ${d.value.toString().padStart(6)} │ ${marker} ${d.status.padEnd(6)} (${d.reason})${' '.repeat(45 - d.reason.length)}│\n`;
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
            stepsSpan.innerText = result.message;
        } else {
            valueSpan.innerHTML = `🔍 ${result.outliers.length} outlier(s) found | IQR = ${result.iqr.toFixed(4)} | Boundaries: [${result.lowerBound.toFixed(4)}, ${result.upperBound.toFixed(4)}]`;
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("iqrOutlierClearBtn", "iqrOutlierInput", "iqrOutlierResultArea");
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
            valueSpan.innerHTML = `🔍 ${result.outliers.length} outlier(s) found | Mean = ${result.mean.toFixed(4)} | Std Dev = ${result.stdDev.toFixed(4)} | Threshold = |Z| > ${result.threshold}`;
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("zOutlierClearBtn", "zOutlierInput", "zOutlierResultArea");
}
// ========== WINSORIZATION RENDER FUNCTION ==========
function renderWinsorizeInterface() {
    return `
        <div class="stat-interface" id="statWinsorizeInterface">
            <div class="interface-title">✂️ Winsorization (Cap Outliers)</div>
            <div class="formula-card">
                <div class="formula">📌 Replace extreme values with specified percentiles</div>
                <div class="desc">Winsorization caps outliers at a specified percentile level (e.g., 5% winsorization caps values below 5th percentile and above 95th percentile). This reduces the impact of outliers without removing them entirely.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated):</label>
                <textarea id="winsorizeInput" rows="4" placeholder="Example: 12, 15, 14, 100, 16, 13, 15, 14, 200, 17, 16, 15"></textarea>
                
                <label style="margin-top: 15px;">✂️ Winsorization Level (percent to cap from each tail):</label>
                <input type="number" id="winsorizeLevel" value="5" step="1" min="0" max="49" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                <div class="desc" style="font-size: 0.75rem;">Example: 5% caps values below 5th percentile and above 95th percentile</div>
                
                <div class="action-row">
                    <button class="primary-btn" id="winsorizeComputeBtn">✂️ Apply Winsorization + Full Steps</button>
                    <button class="secondary-btn" id="winsorizeClearBtn">Clear</button>
                </div>
            </div>
            <div id="winsorizeResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 WINSORIZATION RESULTS</div>
                    <div class="result-value" id="winsorizeValueDisplay">—</div>
                    <div class="calculation-steps" id="winsorizeStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== BOX-COX TRANSFORMATION RENDER FUNCTION ==========
function renderBoxCoxInterface() {
    return `
        <div class="stat-interface" id="statBoxCoxInterface">
            <div class="interface-title">📐 Box-Cox Transformation</div>
            <div class="formula-card">
                <div class="formula">📌 y(λ) = (x^λ - 1)/λ for λ ≠ 0, y(λ) = ln(x) for λ = 0</div>
                <div class="desc">Box-Cox transformation stabilizes variance and makes data more normally distributed. All values must be positive (x > 0). The optimal λ maximizes the log-likelihood function.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter positive numeric values (comma, space, or line separated):</label>
                <textarea id="boxcoxInput" rows="4" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                
                <label style="margin-top: 15px;">📐 Lambda (λ) parameter:</label>
                <select id="boxcoxLambdaType" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="optimal">Find Optimal λ (Recommended)</option>
                    <option value="custom">Use Custom λ</option>
                </select>
                
                <div id="boxcoxCustomLambdaDiv" style="display: none;">
                    <label>✏️ Custom Lambda value:</label>
                    <input type="number" id="boxcoxCustomLambda" value="0.5" step="0.1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <div class="desc" style="font-size: 0.75rem;">λ = 0 → log transform | λ = 0.5 → square root | λ = 1 → no change | λ = 2 → square</div>
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="boxcoxComputeBtn">📐 Apply Box-Cox Transformation + Steps</button>
                    <button class="secondary-btn" id="boxcoxClearBtn">Clear</button>
                </div>
            </div>
            <div id="boxcoxResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 BOX-COX TRANSFORMATION RESULTS</div>
                    <div class="result-value" id="boxcoxValueDisplay">—</div>
                    <div class="calculation-steps" id="boxcoxStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
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
    
    const lowerIndex = Math.floor((n - 1) * lowerPercentile);
    const upperIndex = Math.ceil((n - 1) * upperPercentile);
    
    const lowerBound = sorted[lowerIndex];
    const upperBound = sorted[upperIndex];
    
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
    steps += `   Lower bound index = floor((${n}-1) × ${lowerPercentile}) = floor(${(n-1)*lowerPercentile}) = ${lowerIndex}\n`;
    steps += `   Lower bound value = ${lowerBound}\n`;
    steps += `   Upper bound index = ceil((${n}-1) × ${upperPercentile}) = ceil(${(n-1)*upperPercentile}) = ${upperIndex}\n`;
    steps += `   Upper bound value = ${upperBound}\n\n`;
    
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
// ========== BOX-COX TRANSFORMATION COMPUTATION ==========
// ========== BOX-COX TRANSFORMATION COMPUTATION (FIXED) ==========
function computeBoxCoxWithSteps(numbers, lambdaType, customLambda = null) {
    if (!numbers || numbers.length === 0) return { error: true, message: "No numbers provided." };
    
    // Filter out invalid numbers
    const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n) && isFinite(n));
    if (validNumbers.length === 0) return { error: true, message: "No valid numbers provided." };
    
    const nonPositive = validNumbers.filter(v => v <= 0);
    if (nonPositive.length > 0) {
        return { error: true, message: `❌ Box-Cox transformation requires ALL values > 0. Invalid: ${nonPositive.join(', ')}` };
    }
    
    const n = validNumbers.length;
    let lambda;
    let isOptimal = false;
    
    // Determine lambda
    if (lambdaType === 'optimal') {
        isOptimal = true;
        // Find optimal lambda by maximizing log-likelihood
        const lambdas = [];
        const logLikelihoods = [];
        
        // Try lambdas from -2 to 2
        for (let lam = -2; lam <= 2; lam += 0.1) {
            let transformed;
            if (Math.abs(lam) < 1e-6) {
                transformed = validNumbers.map(x => Math.log(x));
            } else {
                transformed = validNumbers.map(x => (Math.pow(x, lam) - 1) / lam);
            }
            const mean = transformed.reduce((a, b) => a + b, 0) / n;
            const variance = transformed.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
            const logLik = -n/2 * Math.log(variance) + (lam - 1) * validNumbers.reduce((a, b) => a + Math.log(b), 0);
            lambdas.push(lam);
            logLikelihoods.push(logLik);
        }
        
        // Find lambda with max log-likelihood
        let maxIdx = 0;
        for (let i = 1; i < logLikelihoods.length; i++) {
            if (logLikelihoods[i] > logLikelihoods[maxIdx]) maxIdx = i;
        }
        lambda = lambdas[maxIdx];
        lambda = Math.round(lambda * 10) / 10; // Round to 1 decimal
    } else {
        lambda = customLambda;
        if (lambda === null || isNaN(lambda)) lambda = 0;
    }
    
    // Apply transformation
    let transformed;
    let formula;
    if (Math.abs(lambda) < 1e-6) {
        transformed = validNumbers.map(x => Math.log(x));
        formula = `y = ln(x)`;
    } else {
        transformed = validNumbers.map(x => (Math.pow(x, lambda) - 1) / lambda);
        formula = `y = (x^${lambda.toFixed(2)} - 1) / ${lambda.toFixed(2)}`;
    }
    
    // Calculate statistics
    const origMean = validNumbers.reduce((a, b) => a + b, 0) / n;
    const origStd = Math.sqrt(validNumbers.reduce((a, b) => a + Math.pow(b - origMean, 2), 0) / n);
    const transMean = transformed.reduce((a, b) => a + b, 0) / n;
    const transStd = Math.sqrt(transformed.reduce((a, b) => a + Math.pow(b - transMean, 2), 0) / n);
    
    // Calculate skewness before and after
    const origSkew = validNumbers.reduce((a, b) => a + Math.pow((b - origMean) / origStd, 3), 0) / n;
    const transSkew = transformed.reduce((a, b) => a + Math.pow((b - transMean) / transStd, 3), 0) / n;
    
    let steps = `📐 BOX-COX TRANSFORMATION - STEP BY STEP\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📋 INPUT DATA:\n`;
    steps += `   Data: [${validNumbers.join(', ')}]\n`;
    steps += `   n = ${n}\n\n`;
    
    if (isOptimal) {
        steps += `🔍 STEP 1: Find optimal λ by maximizing log-likelihood\n`;
        steps += `   Formula: LL(λ) = -n/2 × ln(σ̂²(λ)) + (λ-1) × Σ ln(xᵢ)\n`;
        steps += `   Optimal λ = ${lambda.toFixed(2)}\n\n`;
    } else {
        steps += `📐 STEP 1: Using custom λ = ${lambda.toFixed(2)}\n`;
        steps += `   Formula: ${formula}\n\n`;
    }
    
    steps += `📐 STEP 2: Apply transformation to each value\n`;
    steps += `   Formula: ${formula}\n\n`;
    steps += `   ┌──────┬──────────┬──────────────────────┐\n`;
    steps += `   │  #   │ Original │ Transformed          │\n`;
    steps += `   ├──────┼──────────┼──────────────────────┤\n`;
    for (let i = 0; i < validNumbers.length; i++) {
        steps += `   │ ${(i+1).toString().padStart(2)} │ ${validNumbers[i].toString().padStart(8)} │ ${transformed[i].toFixed(8).padStart(16)} │\n`;
    }
    steps += `   └──────┴──────────┴──────────────────────┘\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 EFFECT ON DISTRIBUTION:\n`;
    steps += `   Original Mean: ${origMean.toFixed(6)}\n`;
    steps += `   Transformed Mean: ${transMean.toFixed(6)}\n`;
    steps += `   Original Std Dev: ${origStd.toFixed(6)}\n`;
    steps += `   Transformed Std Dev: ${transStd.toFixed(6)}\n`;
    steps += `   Original Skewness: ${origSkew.toFixed(6)}\n`;
    steps += `   Transformed Skewness: ${transSkew.toFixed(6)} `;
    if (Math.abs(transSkew) < Math.abs(origSkew)) {
        steps += `(✓ Reduced skewness)\n`;
    } else {
        steps += `(⚠ Skewness increased - try different λ)\n`;
    }
    steps += `\n`;
    
    steps += `✅ BOX-COX TRANSFORMATION SUMMARY:\n`;
    steps += `   • Lambda (λ) = ${lambda.toFixed(2)}\n`;
    steps += `   • Transformation: ${formula}\n`;
    steps += `   • Transformed data: [${transformed.map(x => x.toFixed(6)).join(', ')}]\n`;
    if (isOptimal) {
        if (Math.abs(lambda) < 0.1) {
            steps += `   • λ ≈ 0 → Natural log transformation is optimal\n`;
        } else if (Math.abs(lambda - 1) < 0.1) {
            steps += `   • λ ≈ 1 → No transformation needed (data already normal)\n`;
        } else if (Math.abs(lambda - 0.5) < 0.1) {
            steps += `   • λ ≈ 0.5 → Square root transformation is optimal\n`;
        } else if (Math.abs(lambda - 2) < 0.1) {
            steps += `   • λ ≈ 2 → Square transformation is optimal\n`;
        } else {
            steps += `   • λ = ${lambda.toFixed(2)} maximizes normality of the data\n`;
        }
    }
    
    return { 
        original: validNumbers, 
        transformed, 
        lambda, 
        formula, 
        origSkew, 
        transSkew,
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
            stepsSpan.innerText = result.message;
        } else {
            valueSpan.innerHTML = `✂️ ${level}% Winsorization | Capped ${result.winsorized.filter((v,i) => v !== result.original[i]).length} values`;
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("winsorizeClearBtn", "winsorizeInput", "winsorizeResultArea");
}

// ========== BOX-COX SETUP ==========
function setupBoxCoxLogic() {
    const lambdaTypeSelect = document.getElementById("boxcoxLambdaType");
    const customLambdaDiv = document.getElementById("boxcoxCustomLambdaDiv");
    
    if (lambdaTypeSelect) {
        lambdaTypeSelect.addEventListener('change', () => {
            customLambdaDiv.style.display = lambdaTypeSelect.value === 'custom' ? 'block' : 'none';
        });
    }
    
    const computeBtn = document.getElementById("boxcoxComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("boxcoxInput").value;
        const numbers = parseNumbersFromInput(raw);
        const lambdaType = document.getElementById("boxcoxLambdaType").value;
        let customLambda = null;
        
        if (lambdaType === 'custom') {
            customLambda = parseFloat(document.getElementById("boxcoxCustomLambda").value);
        }
        
        const resultDiv = document.getElementById("boxcoxResultArea");
        const valueSpan = document.getElementById("boxcoxValueDisplay");
        const stepsSpan = document.getElementById("boxcoxStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Please enter positive numbers for Box-Cox transformation.";
            return;
        }
        
        const result = computeBoxCoxWithSteps(numbers, lambdaType, customLambda);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerText = result.message;
        } else {
            valueSpan.innerHTML = `λ = ${result.lambda.toFixed(2)} | Skewness: ${result.origSkew.toFixed(4)} → ${result.transSkew.toFixed(4)}`;
            stepsSpan.innerText = result.steps;
        }
    });
    
    attachClearHandler("boxcoxClearBtn", "boxcoxInput", "boxcoxResultArea");
}
// ========== CHI-SQUARE GOODNESS-OF-FIT TEST INTERFACE ==========
function renderChiSquareGoodnessInterface() {
    return `
        <div class="stat-interface" id="statChiSquareGoodnessInterface">
            <div class="interface-title">χ² Chi-Square Goodness-of-Fit Test</div>
            <div class="formula-card">
                <div class="formula">📌 χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ</div>
                <div class="desc">Tests whether observed frequencies match expected frequencies for a categorical variable. H₀: The data follows the specified distribution.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter observed frequencies (comma-separated):</label>
                <textarea id="goodnessObserved" rows="3" placeholder="Example: 20, 30, 25, 15, 10"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter expected frequencies (comma-separated):</label>
                <textarea id="goodnessExpected" rows="3" placeholder="Example: 20, 20, 20, 20, 20"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">Expected frequencies can be equal proportions or custom values</div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="goodnessAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="goodnessComputeBtn">χ² Run Goodness-of-Fit Test + Steps</button>
                    <button class="secondary-btn" id="goodnessClearBtn">Clear</button>
                </div>
            </div>
            <div id="goodnessResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 CHI-SQUARE GOODNESS-OF-FIT RESULTS</div>
                    <div class="result-value" id="goodnessValueDisplay">—</div>
                    <div class="calculation-steps" id="goodnessStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== KOLMOGOROV-SMIRNOV TEST INTERFACE ==========
function renderKolmogorovSmirnovInterface() {
    return `
        <div class="stat-interface" id="statKolmogorovSmirnovInterface">
            <div class="interface-title">D Kolmogorov-Smirnov Test (Normality)</div>
            <div class="formula-card">
                <div class="formula">📌 D = max|Fₙ(x) - F(x)|</div>
                <div class="desc">Tests whether a sample comes from a normal distribution. H₀: Data is normally distributed. Compares empirical vs theoretical CDF.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter sample data (comma, space, or line separated):</label>
                <textarea id="ksData" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15, 18, 19, 20"></textarea>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="ksAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="ksComputeBtn">D Run Kolmogorov-Smirnov Test + Steps</button>
                    <button class="secondary-btn" id="ksClearBtn">Clear</button>
                </div>
            </div>
            <div id="ksResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 KOLMOGOROV-SMIRNOV TEST RESULTS</div>
                    <div class="result-value" id="ksValueDisplay">—</div>
                    <div class="calculation-steps" id="ksStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== SHAPIRO-WILK TEST INTERFACE ==========
function renderShapiroWilkInterface() {
    return `
        <div class="stat-interface" id="statShapiroWilkInterface">
            <div class="interface-title">W Shapiro-Wilk Test (Normality)</div>
            <div class="formula-card">
                <div class="formula">📌 W = (Σ aᵢxᵢ)² / Σ(xᵢ - x̄)²</div>
                <div class="desc">Tests whether a sample comes from a normal distribution. H₀: Data is normally distributed. Most powerful test for normality.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter sample data (comma, space, or line separated):</label>
                <textarea id="swData" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15, 18, 19, 20"></textarea>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="swAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="swComputeBtn">W Run Shapiro-Wilk Test + Steps</button>
                    <button class="secondary-btn" id="swClearBtn">Clear</button>
                </div>
            </div>
            <div id="swResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 SHAPIRO-WILK TEST RESULTS</div>
                    <div class="result-value" id="swValueDisplay">—</div>
                    <div class="calculation-steps" id="swStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== CHI-SQUARE GOODNESS-OF-FIT COMPUTATION ==========
// ========== CHI-SQUARE GOODNESS-OF-FIT TEST (REDESIGNED) ==========
function computeChiSquareGoodnessTest(observed, expected, alpha) {
    if (!observed.length || !expected.length) {
        return { error: true, message: "Please enter both observed and expected frequencies." };
    }
    if (observed.length !== expected.length) {
        return { error: true, message: "Observed and expected must have the same number of categories." };
    }
    if (observed.length < 2) {
        return { error: true, message: "Need at least 2 categories." };
    }
    
    const n = observed.length;
    let chiSquare = 0;
    let contributions = [];
    let totalObserved = observed.reduce((a,b) => a+b, 0);
    let totalExpected = expected.reduce((a,b) => a+b, 0);
    
    for (let i = 0; i < n; i++) {
        const diff = observed[i] - expected[i];
        const contribution = (diff * diff) / expected[i];
        chiSquare += contribution;
        contributions.push({ 
            category: i+1, 
            observed: observed[i], 
            expected: expected[i], 
            diff: diff,
            diffSq: diff * diff,
            contribution 
        });
    }
    
    const df = n - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(chiSquare, df);
    const rejectH0 = chiSquare > criticalValue;
    
    // Build table rows
    let tableRows = '';
    for (let c of contributions) {
        const diffColor = c.diff >= 0 ? '#28a745' : '#dc3545';
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px; text-align: center; font-weight: 500;">${c.category}</td>
            <td style="padding: 12px; text-align: center;">${c.observed}</td>
            <td style="padding: 12px; text-align: center;">${c.expected.toFixed(2)}</td>
            <td style="padding: 12px; text-align: center; color: ${diffColor}; font-weight: 500;">${c.diff >= 0 ? '+' : ''}${c.diff.toFixed(2)}</td>
            <td style="padding: 12px; text-align: center;">(${c.diff.toFixed(2)})² = ${c.diffSq.toFixed(2)}</td>
            <td style="padding: 12px; text-align: center; background: #e8f4f8; font-weight: 600; color: #1a5490;">${c.contribution.toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">χ²</span>
                <h2 style="margin: 0;">Chi-Square Goodness-of-Fit Test</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Tests whether observed frequencies match expected frequencies</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: The data follows the specified distribution | H₁: The data does NOT follow the specified distribution</p>
        </div>
        
        <!-- Understanding the Test -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 What is the Chi-Square Goodness-of-Fit Test?</h3>
            <p style="margin: 0; line-height: 1.6;">This test compares how many items fall into each category (observed) versus how many we would expect (expected).</p>
            <ul style="margin-top: 12px; margin-left: 20px; line-height: 1.6;">
                <li><strong>Large χ² value</strong> → Big difference between observed and expected → Reject H₀</li>
                <li><strong>Small χ² value</strong> → Observed matches expected → Cannot reject H₀</li>
            </ul>
            <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 8px; font-size: 13px;">
                💡 <strong>Formula:</strong> χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ
            </div>
        </div>
        
        <!-- Data Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Total Categories (k)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Total Observations</div>
                <div style="font-size: 32px; font-weight: 700; color: #28a745;">${totalObserved}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Degrees of Freedom (df)</div>
                <div style="font-size: 32px; font-weight: 700; color: #17a2b8;">${df}</div>
                <div style="font-size: 11px;">df = k - 1 = ${n} - 1</div>
            </div>
        </div>
        
        <!-- Main Calculation Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Calculate (O - E)² / E for Each Category
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Category</th>
                        <th style="padding: 12px;">Observed (O)</th>
                        <th style="padding: 12px;">Expected (E)</th>
                        <th style="padding: 12px;">O - E</th>
                        <th style="padding: 12px;">(O - E)²</th>
                        <th style="padding: 12px;">(O - E)² / E</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="5" style="padding: 12px; text-align: right;">χ² = Σ (O - E)² / E →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white;">${chiSquare.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Degrees of Freedom -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Determine Degrees of Freedom</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center;">
                    df = k - 1 = ${n} - 1 = <strong style="color: #1a5490;">${df}</strong>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #6c757d; text-align: center;">
                    Where k = number of categories
                </div>
            </div>
        </div>
        
        <!-- Step 3: Critical Value -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Step 3: Find Critical Value</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Significance Level (α)</div>
                        <div style="font-size: 28px; font-weight: 700;">${alpha}</div>
                        <div style="font-size: 11px;">(${(1-alpha)*100}% Confidence)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Critical Value</div>
                        <div style="font-size: 28px; font-weight: 700; color: #dc3545;">${criticalValue.toFixed(4)}</div>
                        <div style="font-size: 11px;">From χ² table with df = ${df}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Step 4: Decision -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 4: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>χ² Statistic:</strong> ${chiSquare.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Comparison:</strong> ${chiSquare.toFixed(4)} ${chiSquare > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)}<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the observed distribution differs from the expected distribution.' : 'There is NOT sufficient evidence that the observed distribution differs from the expected distribution.'}
                </div>
            </div>
        </div>
        
        <!-- Visual Interpretation -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 Interpretation Guide</h3>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                <div style="flex: 1; text-align: center;">
                    <div style="width: 100%; height: 8px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); border-radius: 4px; margin-bottom: 8px;"></div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 11px;">Good Fit</span>
                        <span style="font-size: 11px;">Moderate</span>
                        <span style="font-size: 11px;">Poor Fit</span>
                    </div>
                </div>
                <div style="min-width: 150px; text-align: center; padding: 12px; background: white; border-radius: 12px;">
                    <div>χ² = ${chiSquare.toFixed(4)}</div>
                    <div style="font-size: 12px; color: #6c757d;">Critical = ${criticalValue.toFixed(4)}</div>
                    <div style="margin-top: 8px; font-weight: bold; color: ${rejectH0 ? '#dc3545' : '#28a745'}">
                        ${rejectH0 ? '⚠️ Poor Fit - Reject H₀' : '✓ Good Fit - Cannot Reject H₀'}
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    return { chiSquare, df, criticalValue, pValue, rejectH0, steps };
}

function setupChiSquareGoodnessLogic() {
    const computeBtn = document.getElementById("goodnessComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const observedRaw = document.getElementById("goodnessObserved").value;
        const expectedRaw = document.getElementById("goodnessExpected").value;
        const observed = parseNumbersFromInput(observedRaw);
        const expected = parseNumbersFromInput(expectedRaw);
        const alpha = parseFloat(document.getElementById("goodnessAlpha").value);
        const resultDiv = document.getElementById("goodnessResultArea");
        const valueSpan = document.getElementById("goodnessValueDisplay");
        const stepsSpan = document.getElementById("goodnessStepsDisplay");
        
        const result = computeChiSquareGoodnessTest(observed, expected, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `χ² = ${result.chiSquare.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("goodnessClearBtn", "goodnessObserved", "goodnessResultArea");
}

// ========== KOLMOGOROV-SMIRNOV TEST COMPUTATION ==========
// ========== KOLMOGOROV-SMIRNOV TEST (WITH EXPLANATION OF F(x)) ==========
function computeKolmogorovSmirnovTest(data, alpha) {
    if (!data.length || data.length < 4) {
        return { error: true, message: "Need at least 4 observations for KS test." };
    }
    
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((a,b) => a+b, 0) / n;
    const variance = data.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / (n - 1);   // sample variance (parameters estimated from the data)
    const stdDev = Math.sqrt(variance);
    
    let maxDiff = 0;
    let diffs = [];
    let maxIndex = -1;
    
    for (let i = 0; i < n; i++) {
        const empiricalCDF = (i + 1) / n;
        // Calculate z-score for theoretical CDF
        const zScore = (sorted[i] - mean) / stdDev;
        const theoreticalCDF = normalCDF(sorted[i], mean, stdDev);
        // D = max over i of max( i/n - F(x_i), F(x_i) - (i-1)/n ): the ECDF jumps at each point, so both sides count
        const diff = Math.max(Math.abs(empiricalCDF - theoreticalCDF), Math.abs(theoreticalCDF - i / n));
        
        // Store calculation details for display
        const zCalc = `(${sorted[i].toFixed(4)} - ${mean.toFixed(4)}) / ${stdDev.toFixed(4)} = ${zScore.toFixed(4)}`;
        
        diffs.push({ 
            i: i+1,
            value: sorted[i], 
            zScore: zScore,
            zCalc: zCalc,
            empirical: empiricalCDF, 
            theoretical: theoreticalCDF,
            theoreticalFormula: `Φ(${zScore.toFixed(4)})`,
            diff: diff 
        });
        if (diff > maxDiff) {
            maxDiff = diff;
            maxIndex = i;
        }
    }
    
    // The mean and SD are estimated from the data, so the plain Kolmogorov distribution is too conservative.
    // Critical value and p-value come from the Lilliefors null distribution (simulated, seeded, cached per n).
    const criticalValue = lillieforsCritical(alpha, n);
    const rejectH0 = maxDiff > criticalValue;
    const pValue = lillieforsPValue(maxDiff, n);
    
    // Build table rows with formula explanations
    let tableRows = '';
    for (let d of diffs) {
        const isMax = d.diff === maxDiff;
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef; ${isMax ? 'background: #fff3cd;' : ''}">
            <td style="padding: 10px; text-align: center;">${d.i}</td>
            <td style="padding: 10px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${d.i}/${n} = ${d.empirical.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">
                <div><strong>z = ${d.zCalc}</strong></div>
                <div style="font-size: 11px; color: #666;">F(x) = Φ(z) = ${d.theoretical.toFixed(4)}</div>
            </td>
            <td style="padding: 10px; text-align: center; font-weight: 600; ${isMax ? 'color: #dc3545; background: #fff3cd;' : ''}">${d.diff.toFixed(4)}</td>
         </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">D</span>
                <h2 style="margin: 0;">Kolmogorov-Smirnov Test (Normality)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Tests whether a sample comes from a normal distribution</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <!-- Understanding the Test -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 How is F(x) Calculated?</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>Theoretical CDF F(x) for Normal Distribution:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; text-align: center;">
                    <strong>F(x) = Φ(z) = Φ((x - μ) / σ)</strong>
                </div>
                <p style="margin-top: 12px;">Where:</p>
                <ul style="margin-left: 20px;">
                    <li><strong>Φ(z)</strong> = Standard Normal Cumulative Distribution Function</li>
                    <li><strong>z = (x - μ) / σ</strong> = Standardized value (z-score)</li>
                    <li><strong>μ</strong> = Sample mean = <strong>${mean.toFixed(4)}</strong></li>
                    <li><strong>σ</strong> = Sample standard deviation = <strong>${stdDev.toFixed(4)}</strong></li>
                </ul>
                <div style="margin-top: 12px; background: #e8f4f8; padding: 10px; border-radius: 6px; font-size: 13px;">
                    <strong>📌 Example for first value:</strong> x = ${sorted[0].toFixed(4)}<br>
                    z = (${sorted[0].toFixed(4)} - ${mean.toFixed(4)}) / ${stdDev.toFixed(4)} = ${((sorted[0] - mean)/stdDev).toFixed(4)}<br>
                    F(x) = Φ(${((sorted[0] - mean)/stdDev).toFixed(4)}) = ${normalCDF(sorted[0], mean, stdDev).toFixed(4)}
                </div>
            </div>
            
            <h3 style="margin: 16px 0 12px 0; color: #1a5490;">📖 What is the Kolmogorov-Smirnov Test?</h3>
            <p style="margin: 0; line-height: 1.6;">The KS test compares the empirical cumulative distribution of your data to the theoretical normal cumulative distribution.</p>
            <ul style="margin-top: 12px; margin-left: 20px; line-height: 1.6;">
                <li><strong>Fₙ(x)</strong> = Empirical CDF = (rank i) / n (proportion of data ≤ x)</li>
                <li><strong>F(x)</strong> = Theoretical Normal CDF = Φ((x - μ)/σ)</li>
                <li><strong>D statistic</strong> = max|Fₙ(x) - F(x)| = Maximum distance between the two distributions</li>
                <li><strong>Small D</strong> → Data follows normal distribution closely</li>
                <li><strong>Large D</strong> → Data deviates from normality</li>
            </ul>
            <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 8px; font-size: 13px;">
                💡 <strong>Formula:</strong> D = max|Fₙ(x) - F(x)|
            </div>
        </div>
        
        <!-- Data Summary -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Mean (x̄ = μ)</div>
                <div style="font-size: 24px; font-weight: 700;">${mean.toFixed(4)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Std Dev (s = σ)</div>
                <div style="font-size: 24px; font-weight: 700;">${stdDev.toFixed(4)}</div>
            </div>
        </div>
        
        <!-- Step 1: Calculation Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Calculate Empirical vs Theoretical CDF
            </h3>
            <div style="padding: 12px 20px; background: #e8f4f8; font-size: 13px;">
                <strong>How each column is calculated:</strong><br>
                • <strong>Fₙ(x)</strong> = i / n (where i is the rank from 1 to n)<br>
                • <strong>z-score</strong> = (x - μ) / σ<br>
                • <strong>F(x)</strong> = Φ(z) = Standard Normal CDF (lookup from z-table)<br>
                • <strong>D</strong> = |Fₙ(x) - F(x)|
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Rank (i)</th>
                        <th style="padding: 12px;">Value (x)</th>
                        <th style="padding: 12px;">Fₙ(x) = i/n</th>
                        <th style="padding: 12px;">F(x) = Φ((x-μ)/σ)</th>
                        <th style="padding: 12px;">D = |Fₙ(x) - F(x)|</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="4" style="padding: 12px; text-align: right;">Maximum D (highlighted in yellow) →</td>
                        <td style="padding: 12px; text-align: center; background: #dc3545; color: white;">${maxDiff.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Critical Value -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Critical Value</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center;">
                    D<sub>critical</sub> = 1.36 / √n = 1.36 / √${n} = <strong style="color: #1a5490;">${criticalValue.toFixed(4)}</strong>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #6c757d; text-align: center;">
                    Using α = ${alpha} significance level (${(1-alpha)*100}% confidence)
                </div>
            </div>
        </div>
        
        <!-- Step 3: Decision -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 3: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>D Statistic (Maximum Difference):</strong> ${maxDiff.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
                <div><strong>p-value (approximate):</strong> ${pValue.toFixed(6)}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Comparison:</strong> ${maxDiff.toFixed(4)} ${maxDiff > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)}<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <!-- Visual Interpretation -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 Interpretation Guide</h3>
            <div style="text-align: center;">
                <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block; min-width: 200px;">
                    <div style="font-size: 48px; font-weight: 700; color: ${rejectH0 ? '#dc3545' : '#28a745'};">${maxDiff.toFixed(4)}</div>
                    <div style="font-size: 14px;">D Statistic</div>
                    <div style="height: 4px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); margin: 12px 0; border-radius: 2px;"></div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 11px;">Normal</span>
                        <span style="font-size: 11px;">Borderline</span>
                        <span style="font-size: 11px;">Not Normal</span>
                    </div>
                    <div style="margin-top: 12px; font-size: 13px;">
                        Critical Value: <strong>${criticalValue.toFixed(4)}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    return { D: maxDiff, criticalValue, pValue, rejectH0, steps };
}
function setupKolmogorovSmirnovLogic() {
    const computeBtn = document.getElementById("ksComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("ksData").value;
        const data = parseNumbersFromInput(raw);
        const alpha = parseFloat(document.getElementById("ksAlpha").value);
        const resultDiv = document.getElementById("ksResultArea");
        const valueSpan = document.getElementById("ksValueDisplay");
        const stepsSpan = document.getElementById("ksStepsDisplay");
        
        const result = computeKolmogorovSmirnovTest(data, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `D = ${result.D.toFixed(6)} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("ksClearBtn", "ksData", "ksResultArea");
}

// ========== SHAPIRO-WILK TEST (WITH EXPLANATION OF aᵢ COEFFICIENTS) ==========
function computeShapiroWilkTest(data, alpha) {
    if (!data.length || data.length < 3 || data.length > 5000) {
        return { error: true, message: "Shapiro-Wilk test requires 3-5000 observations." };
    }
    
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((a,b) => a+b, 0) / n;
    
    // Calculate sum of squared deviations
    let ss = 0;
    let squaredDeviations = [];
    for (let i = 0; i < n; i++) {
        const dev = data[i] - mean;
        const sqDev = dev * dev;
        squaredDeviations.push({ value: data[i], deviation: dev, squaredDeviation: sqDev });
        ss += sqDev;
    }
    
    // Calculate Shapiro-Wilk W statistic
    let numerator = 0;
    let aCoeffs = [];
    
    // Coefficients a_i from Royston's (1992) approximation to the expected normal order statistics
    const royston = shapiroWilkCoefficients(n);
    for (let i = 0; i < Math.floor(n/2); i++) {
        const m = normInv((n - i - 0.375) / (n + 0.25));   // expected normal order statistic (Blom)
        const a_i = royston[i];
        const diff = sorted[n - 1 - i] - sorted[i];
        numerator += a_i * diff;
        
        // Store calculation details
        const formula = `mᵢ = Φ⁻¹((${n - i} - 0.375)/(${n} + 0.25)) = ${m.toFixed(4)} → aᵢ = ${a_i.toFixed(4)}`;
        
        aCoeffs.push({ 
            i: i+1, 
            a_i: a_i, 
            formula: formula,
            lowerValue: sorted[i], 
            upperValue: sorted[n - 1 - i],
            diff: diff, 
            product: a_i * diff 
        });
    }
    
    let w = 0;
    if (Math.abs(ss) > 1e-10) {
        w = Math.pow(numerator, 2) / ss;
    }
    
    // p-value from Royston's (1995) normalising transformation of W (valid for 3 <= n <= 5000)
    let pValue = shapiroWilkPValue(w, n);
    pValue = Math.min(Math.max(pValue, 1e-10), 1);
    const rejectH0 = pValue < alpha;
    
    // Build squared deviations table
    let sqDevRows = '';
    for (let i = 0; i < squaredDeviations.length; i++) {
        const d = squaredDeviations[i];
        sqDevRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${d.value.toFixed(4)} - ${mean.toFixed(4)} = ${d.deviation.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">(${d.deviation.toFixed(4)})² = ${d.squaredDeviation.toFixed(4)}</td>
         </tr>`;
    }
    
    // Build coefficients table with formula
    let coeffRows = '';
    for (let c of aCoeffs) {
        coeffRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${c.i}</td>
            <td style="padding: 8px; text-align: center;">
                <div><strong>${c.a_i.toFixed(4)}</strong></div>
                <div style="font-size: 10px; color: #666;">${c.formula}</div>
            </td>
            <td style="padding: 8px; text-align: center;">${c.upperValue.toFixed(4)} - ${c.lowerValue.toFixed(4)} = ${c.diff.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: #1a5490;">${c.product.toFixed(4)}</td>
         </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">W</span>
                <h2 style="margin: 0;">Shapiro-Wilk Test (Normality)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">The most powerful test for normality</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <!-- Understanding the Test - How aᵢ is calculated -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 How are the Coefficients aᵢ Calculated?</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>The coefficients aᵢ are calculated using the formula:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; text-align: center;">
                    <strong>mᵢ = Φ⁻¹((i − 0.375)/(n + 0.25)), then aᵢ = mᵢ/√(Σmⱼ²) with Royston's polynomial correction for the two largest coefficients</strong>
                </div>
                <p style="margin-top: 12px;">Where:</p>
                <ul style="margin-left: 20px;">
                    <li><strong>i</strong> = the pair number (from 1 to floor(n/2))</li>
                    <li><strong>n</strong> = total sample size = <strong>${n}</strong></li>
                    <li><strong>mᵢ</strong> = expected value of the i-th normal order statistic (Blom's approximation)</li>
                </ul>
                <div style="margin-top: 12px; background: #e8f4f8; padding: 10px; border-radius: 6px; font-size: 13px;">
                    <strong>📌 Example for first pair (i=1):</strong><br>
                    m<sub>${n}</sub> = Φ⁻¹((${n} − 0.375)/(${n} + 0.25)) = ${normInv((n - 0.375) / (n + 0.25)).toFixed(4)}<br>
                    a₁ = ${aCoeffs[0]?.a_i.toFixed(4) || 'N/A'}
                </div>
            </div>
            
            <h3 style="margin: 16px 0 12px 0; color: #1a5490;">📖 What is the Shapiro-Wilk Test?</h3>
            <p style="margin: 0; line-height: 1.6;">The Shapiro-Wilk test compares the order statistics of your data to expected normal order statistics.</p>
            <ul style="margin-top: 12px; margin-left: 20px; line-height: 1.6;">
                <li><strong>W ≈ 1</strong> → Data is very close to normal</li>
                <li><strong>W significantly < 1</strong> → Data deviates from normality</li>
            </ul>
            <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 8px; font-size: 13px;">
                💡 <strong>Formula:</strong> W = (Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ))² / Σ(xᵢ - x̄)²
            </div>
        </div>
        
        <!-- Data Summary -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Mean (x̄)</div>
                <div style="font-size: 24px; font-weight: 700;">${mean.toFixed(4)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Number of Pairs (k)</div>
                <div style="font-size: 24px; font-weight: 700;">${Math.floor(n/2)}</div>
            </div>
        </div>
        
        <!-- Step 1: Calculate Sum of Squares -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Calculate SS = Σ(xᵢ - x̄)² (Denominator)
            </h3>
            <div style="padding: 12px 20px; background: #e8f4f8; font-size: 13px;">
                <strong>This measures the total variability in the data.</strong> Each value's deviation from the mean is squared and summed.
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">i</th>
                        <th style="padding: 10px;">xᵢ</th>
                        <th style="padding: 10px;">xᵢ - x̄</th>
                        <th style="padding: 10px;">(xᵢ - x̄)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${sqDevRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="3" style="padding: 10px; text-align: right;">SS = Σ(xᵢ - x̄)² →</td>
                        <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${ss.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 2: Calculate Numerator -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 2: Calculate Numerator = Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ)
            </h3>
            <div style="padding: 12px 20px; background: #e8f4f8; font-size: 13px;">
                <strong>How aᵢ is calculated:</strong> aᵢ = [i/(n+1)] × [1 - i/(n+1)] × 2<br>
                This formula gives more weight to pairs near the center of the distribution.
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">Pair (i)</th>
                        <th style="padding: 10px;">Coefficient aᵢ (with formula)</th>
                        <th style="padding: 10px;">xₙ₋ᵢ₊₁ - xᵢ</th>
                        <th style="padding: 10px;">aᵢ × (xₙ₋ᵢ₊₁ - xᵢ)</th>
                    </tr>
                </thead>
                <tbody>
                    ${coeffRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="3" style="padding: 10px; text-align: right;">Sum = Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ) →</td>
                        <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${numerator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Step 3: Calculate W Statistic -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate W Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center;">
                    <strong>W = (Σ aᵢ × (xₙ₋ᵢ₊₁ - xᵢ))² / Σ(xᵢ - x̄)²</strong><br><br>
                    W = (${numerator.toFixed(4)})² / ${ss.toFixed(4)}<br>
                    W = ${(numerator * numerator).toFixed(4)} / ${ss.toFixed(4)}<br>
                    <div style="font-size: 28px; font-weight: 700; color: #1a5490; margin-top: 12px;">W = ${w.toFixed(6)}</div>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #6c757d; text-align: center;">
                    W = 1 means perfect normality | Smaller W indicates deviation from normality
                </div>
            </div>
        </div>
        
        <!-- Step 4: Decision -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 4: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>W Statistic:</strong> ${w.toFixed(6)}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
                <div><strong>Significance Level (α):</strong> ${alpha}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Comparison:</strong> p-value ${pValue < alpha ? '<' : '>'} α = ${alpha}<br>
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <!-- W Statistic Scale -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 W Statistic Interpretation Scale</h3>
            <div style="text-align: center;">
                <div style="height: 12px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); border-radius: 6px; margin: 16px 0;"></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px;">0.90</span>
                    <span style="font-size: 12px;">0.95</span>
                    <span style="font-size: 12px;">0.98</span>
                    <span style="font-size: 12px;">1.00</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; margin-top: 12px; display: inline-block; min-width: 200px;">
                    <div style="font-size: 48px; font-weight: 700; color: ${rejectH0 ? '#dc3545' : '#28a745'};">${w.toFixed(4)}</div>
                    <div style="font-size: 14px;">W Statistic</div>
                    <div style="margin-top: 8px;">
                        ${w > 0.95 ? '✓ Strong evidence of normality' : (w > 0.90 ? '⚠️ Moderate evidence of normality' : '❌ Weak evidence of normality')}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Quick Reference -->
        <div style="margin-top: 24px; padding: 16px; background: #e8f4f8; border-radius: 12px;">
            <h4 style="margin: 0 0 8px 0; color: #1a5490;">💡 Quick Interpretation Guide</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead><tr style="background: #1a5490; color: white;"><th style="padding: 8px;">W Value</th><th style="padding: 8px;">Interpretation</th><th style="padding: 8px;">Action</th></tr></thead>
                <tbody>
                    <tr style="background: white;"><td style="padding: 8px;">> 0.95</td><td style="padding: 8px;">Data is approximately normal</td><td style="padding: 8px;">Use parametric tests</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 8px;">0.90 - 0.95</td><td style="padding: 8px;">Mild deviation from normality</td><td style="padding: 8px;">Proceed with caution</td></tr>
                    <tr style="background: white;"><td style="padding: 8px;">< 0.90</td><td style="padding: 8px;">Significant deviation from normality</td><td style="padding: 8px;">Use non-parametric tests</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    
    return { W: w, pValue, rejectH0, steps };
}
function setupShapiroWilkLogic() {
    const computeBtn = document.getElementById("swComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("swData").value;
        const data = parseNumbersFromInput(raw);
        const alpha = parseFloat(document.getElementById("swAlpha").value);
        const resultDiv = document.getElementById("swResultArea");
        const valueSpan = document.getElementById("swValueDisplay");
        const stepsSpan = document.getElementById("swStepsDisplay");
        
        const result = computeShapiroWilkTest(data, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `W = ${result.W.toFixed(6)} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("swClearBtn", "swData", "swResultArea");
}
// ========== ANDERSON-DARLING TEST (NORMALITY) ==========
function renderAndersonDarlingInterface() {
    return `
        <div class="stat-interface" id="statAndersonDarlingInterface">
            <div class="interface-title">A² Anderson-Darling Test (Normality)</div>
            <div class="formula-card">
                <div class="formula">📌 A² = -n - (1/n) Σ(2i-1)[ln(F(xᵢ)) + ln(1-F(xₙ₋ᵢ₊₁))]</div>
                <div class="desc">
                    <strong>What is the Anderson-Darling Test?</strong><br>
                    A powerful test for normality that gives more weight to the tails of the distribution.
                    H₀: Data is normally distributed | H₁: Data is NOT normally distributed
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>Key differences from KS test:</strong><br>
                    • More sensitive to deviations in the tails<br>
                    • Uses weighted squared differences<br>
                    • Generally more powerful for normality testing
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter sample data (comma, space, or line separated):</label>
                <textarea id="adData" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15, 18, 19, 20"></textarea>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="adAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="adComputeBtn">A² Run Anderson-Darling Test + Full Steps</button>
                    <button class="secondary-btn" id="adClearBtn">Clear</button>
                </div>
            </div>
            <div id="adResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 ANDERSON-DARLING TEST RESULTS</div>
                    <div class="result-value" id="adValueDisplay">—</div>
                    <div class="calculation-steps" id="adStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

function computeAndersonDarlingTest(data, alpha) {
    if (!data.length || data.length < 4) {
        return { error: true, message: "Need at least 4 observations for Anderson-Darling test." };
    }
    
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((a,b) => a+b, 0) / n;
    const variance = data.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / (n - 1);   // sample variance (parameters estimated from the data)
    const stdDev = Math.sqrt(variance);
    
    // Calculate A² statistic
    let sum = 0;
    let calcDetails = [];
    
    // A² = -n - (1/n) Σ (2i-1) [ ln F(x_i) + ln(1 - F(x_{n+1-i})) ]
    const cdfAt = k => normalCDF((sorted[k] - mean) / stdDev, 0, 1);
    for (let i = 0; i < n; i++) {
        const zScore = (sorted[i] - mean) / stdDev;
        const Fx = cdfAt(i);
        const term1 = (2 * i + 1) * Math.log(Fx);
        const term2 = (2 * i + 1) * Math.log(1 - cdfAt(n - 1 - i));
        const contribution = term1 + term2;
        sum += contribution;
        
        calcDetails.push({
            i: i + 1,
            value: sorted[i],
            zScore: zScore,
            Fx: Fx,
            term1: term1,
            term2: term2,
            contribution: contribution
        });
    }
    
    let A2 = -n - sum / n;
    
    // Apply correction for small samples (Stephens, 1974)
    let adjA2;
    adjA2 = A2 * (1 + 0.75 / n + 2.25 / (n * n));
    
    // Critical values for Anderson-Darling
    const criticalValues = {
        0.10: 0.631,
        0.05: 0.752,
        0.025: 0.873,
        0.01: 1.035,
        0.001: 1.159
    };
    
    const criticalValue = criticalValues[alpha] || 0.752;
    const rejectH0 = adjA2 > criticalValue;
    
    // Approximate p-value
    let pValue;
    if (adjA2 < 0.2) pValue = 1 - Math.exp(-13.436 + 101.14 * adjA2 - 223.73 * adjA2 * adjA2);
    else if (adjA2 < 0.34) pValue = 1 - Math.exp(-8.318 + 42.796 * adjA2 - 59.938 * adjA2 * adjA2);
    else if (adjA2 < 0.6) pValue = Math.exp(0.9177 - 4.279 * adjA2 - 1.38 * adjA2 * adjA2);
    else pValue = Math.exp(1.2937 - 5.709 * adjA2 + 0.0186 * adjA2 * adjA2);
    pValue = Math.min(Math.max(pValue, 0.0001), 0.9999);
    
    // Build calculation table
    let tableRows = '';
    for (let d of calcDetails) {
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${d.i}</td>
            <td style="padding: 10px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">z = (${d.value.toFixed(4)} - ${mean.toFixed(4)})/${stdDev.toFixed(4)} = ${d.zScore.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">F(x) = Φ(${d.zScore.toFixed(4)}) = ${d.Fx.toFixed(6)}</td>
            <td style="padding: 10px; text-align: center;">(2×${d.i}−1)ln F(x<sub>${d.i}</sub>) = ${d.term1.toFixed(6)}</td>
            <td style="padding: 10px; text-align: center;">(2×${d.i}−1)ln(1−F(x<sub>${n+1-d.i}</sub>)) = ${d.term2.toFixed(6)}</td>
        </td>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">A²</span>
                <h2 style="margin: 0;">Anderson-Darling Test (Normality)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">A powerful normality test with emphasis on tail behavior</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: Data is normally distributed | H₁: Data is NOT normally distributed</p>
        </div>
        
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 Understanding the Anderson-Darling Test</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>How it works:</strong></p>
                <ul style="margin-left: 20px; line-height: 1.6;">
                    <li>Compares empirical distribution to normal distribution</li>
                    <li>Gives MORE weight to tails than KS test</li>
                    <li>Better at detecting deviations at distribution extremes</li>
                </ul>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin-top: 12px;">
                    <strong>A² = -n - (1/n) Σ (2i-1)[ln(F(xᵢ)) + ln(1-F(xₙ₋ᵢ₊₁))]</strong>
                </div>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>Interpretation:</strong> Small A² = good fit to normal | Large A² = poor fit
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Mean (x̄)</div>
                <div style="font-size: 20px; font-weight: 700;">${mean.toFixed(4)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Std Dev (s)</div>
                <div style="font-size: 20px; font-weight: 700;">${stdDev.toFixed(4)}</div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Calculate A² Statistic Components
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 8px;">i</th>
                        <th style="padding: 8px;">xᵢ</th>
                        <th style="padding: 8px;">z = (x-μ)/σ</th>
                        <th style="padding: 8px;">F(x) = Φ(z)</th>
                        <th style="padding: 8px;">(2i-1)ln(F)</th>
                        <th style="padding: 8px;">(2(n-i)+1)ln(1-F)</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate A² Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; margin-bottom: 12px;">
                    Σ = ${sum.toFixed(6)}<br>
                    A² = -n - (1/n) × Σ<br>
                    A² = -${n} - (1/${n}) × ${sum.toFixed(6)}<br>
                    A² = -${n} - ${(sum/n).toFixed(6)}<br>
                    <strong style="font-size: 18px;">A² = ${A2.toFixed(6)}</strong>
                </div>
                
                <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #dee2e6;">
                    <strong>Adjusted A² (Stephens, 1974):</strong><br>
                    A²<sub>adj</sub> = A² × (1 + 0.75/n + 2.25/n²)<br>
                    A²<sub>adj</sub> = ${A2.toFixed(6)} × (1 + 0.75/${n} + 2.25/${n*n})<br>
                    A²<sub>adj</sub> = ${A2.toFixed(6)} × ${(1 + 0.75/n + 2.25/(n*n)).toFixed(4)}<br>
                    <strong style="font-size: 18px; color: #1a5490;">A²<sub>adj</sub> = ${adjA2.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Step 3: Compare with Critical Value</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Significance Level (α)</div>
                        <div style="font-size: 28px; font-weight: 700;">${alpha}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Critical Value</div>
                        <div style="font-size: 28px; font-weight: 700; color: #dc3545;">${criticalValue}</div>
                    </div>
                </div>
                <div style="margin-top: 16px; text-align: center;">
                    ${adjA2 > criticalValue ? `A²<sub>adj</sub> (${adjA2.toFixed(4)}) > Critical (${criticalValue})` : `A²<sub>adj</sub> (${adjA2.toFixed(4)}) < Critical (${criticalValue})`}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 4: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>A² Statistic (adjusted):</strong> ${adjA2.toFixed(6)}</div>
                <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(6)}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                    <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the data is NOT normally distributed.' : 'There is NOT sufficient evidence to reject normality. The data appears normally distributed.'}
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 A² Statistic Scale</h3>
            <div style="text-align: center;">
                <div style="height: 8px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); border-radius: 4px; margin: 12px 0;"></div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 11px;">Good Fit (A²<0.5)</span>
                    <span style="font-size: 11px;">Borderline (0.5-0.75)</span>
                    <span style="font-size: 11px;">Poor Fit (>0.75)</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; margin-top: 16px; display: inline-block; min-width: 200px;">
                    <div style="font-size: 48px; font-weight: 700; color: ${rejectH0 ? '#dc3545' : '#28a745'};">${adjA2.toFixed(4)}</div>
                    <div style="font-size: 14px;">A² Statistic</div>
                </div>
            </div>
        </div>
    </div>`;
    
    return { A2: adjA2, criticalValue, pValue, rejectH0, steps };
}

function setupAndersonDarlingLogic() {
    const computeBtn = document.getElementById("adComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("adData").value;
        const data = parseNumbersFromInput(raw);
        const alpha = parseFloat(document.getElementById("adAlpha").value);
        const resultDiv = document.getElementById("adResultArea");
        const valueSpan = document.getElementById("adValueDisplay");
        const stepsSpan = document.getElementById("adStepsDisplay");
        
        const result = computeAndersonDarlingTest(data, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `A² = ${result.A2.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("adClearBtn", "adData", "adResultArea");
}

// ========== SIGN TEST (MEDIAN) ==========
function renderSignTestInterface() {
    return `
        <div class="stat-interface" id="statSignTestInterface">
            <div class="interface-title">± Sign Test (Median)</div>
            <div class="formula-card">
                <div class="formula">📌 Test statistic = number of observations above/below hypothesized median</div>
                <div class="desc">
                    <strong>What is the Sign Test?</strong><br>
                    A non-parametric test that tests whether the population median equals a hypothesized value.
                    H₀: Median = M₀ | H₁: Median ≠ M₀ (or >, or <)
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>Key features:</strong><br>
                    • No normality assumption required<br>
                    • Based only on signs (+ or -) of deviations<br>
                    • Works with ordinal or continuous data
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter sample data (comma, space, or line separated):</label>
                <textarea id="signData" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15, 18, 19, 20"></textarea>
                
                <label style="margin-top: 15px;">📊 Hypothesized Median (M₀):</label>
                <input type="number" id="hypothesizedMedian" value="15" step="any" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                
                <label>📊 Significance Level (α):</label>
                <select id="signAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <label>📋 Alternative Hypothesis:</label>
                <select id="signAlternative" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="two.sided">Median ≠ M₀ (Two-tailed)</option>
                    <option value="greater">Median > M₀ (Greater than)</option>
                    <option value="less">Median < M₀ (Less than)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="signComputeBtn">± Run Sign Test + Full Steps</button>
                    <button class="secondary-btn" id="signClearBtn">Clear</button>
                </div>
            </div>
            <div id="signResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 SIGN TEST RESULTS</div>
                    <div class="result-value" id="signValueDisplay">—</div>
                    <div class="calculation-steps" id="signStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

function computeSignTest(data, hypothesizedMedian, alpha, alternative) {
    if (!data.length || data.length < 2) {
        return { error: true, message: "Need at least 2 observations for Sign test." };
    }
    
    const n = data.length;
    let positives = 0;
    let negatives = 0;
    let zeros = 0;
    let signs = [];
    
    for (let i = 0; i < n; i++) {
        const diff = data[i] - hypothesizedMedian;
        if (diff > 0) {
            positives++;
            signs.push({ value: data[i], diff: diff, sign: "+" });
        } else if (diff < 0) {
            negatives++;
            signs.push({ value: data[i], diff: diff, sign: "-" });
        } else {
            zeros++;
            signs.push({ value: data[i], diff: diff, sign: "0" });
        }
    }
    
    const nonZero = positives + negatives;
    let testStatistic;
    let pValue;
    
    if (alternative === 'two.sided') {
        testStatistic = Math.min(positives, negatives);
        pValue = 2 * binomialCumulative(testStatistic, nonZero, 0.5);
    } else if (alternative === 'greater') {
        testStatistic = positives;
        pValue = binomialCumulativeComplement(testStatistic - 1, nonZero, 0.5);
    } else {
        testStatistic = negatives;
        pValue = binomialCumulativeComplement(testStatistic - 1, nonZero, 0.5);
    }
    
    pValue = Math.min(Math.max(pValue, 0), 1);
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the population median is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${hypothesizedMedian}.` :
        `There is NOT sufficient evidence that the population median is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${hypothesizedMedian}.`;
    
    // Build sign table
    let signTableRows = '';
    for (let i = 0; i < signs.length; i++) {
        const s = signs[i];
        const signColor = s.sign === '+' ? '#28a745' : (s.sign === '-' ? '#dc3545' : '#6c757d');
        signTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${s.value}</td>
            <td style="padding: 8px; text-align: center;">${s.value} - ${hypothesizedMedian} = ${s.diff.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: ${signColor};">${s.sign === '0' ? 'Tie (ignored)' : (s.sign === '+' ? 'Positive (+) → Above Median' : 'Negative (-) → Below Median')}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">±</span>
                <h2 style="margin: 0;">Sign Test (Median)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">A non-parametric test for the population median</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: Median = ${hypothesizedMedian} | H₁: Median ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${hypothesizedMedian}</p>
        </div>
        
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 Understanding the Sign Test</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>How it works:</strong></p>
                <ul style="margin-left: 20px; line-height: 1.6;">
                    <li>Count how many observations are ABOVE the hypothesized median (+) </li>
                    <li>Count how many are BELOW the hypothesized median (-) </li>
                    <li>Ignore values exactly equal to the hypothesized median</li>
                    <li>Under H₀, expect ~50% above and ~50% below</li>
                </ul>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin-top: 12px;">
                    <strong>Test statistic = min(# of +, # of -)</strong>
                </div>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>Interpretation:</strong> If the test statistic is small, the median is likely different from hypothesized value.
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Hypothesized Median</div>
                <div style="font-size: 24px; font-weight: 700;">${hypothesizedMedian}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Non-zero Observations</div>
                <div style="font-size: 24px; font-weight: 700;">${nonZero}</div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Determine Signs for Each Observation
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">i</th>
                        <th style="padding: 10px;">Value</th>
                        <th style="padding: 10px;">Deviation (Value - M₀)</th>
                        <th style="padding: 10px;">Sign</th>
                    </tr>
                </thead>
                <tbody>${signTableRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Count Signs</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                    <div style="background: #d4edda; padding: 12px; border-radius: 8px;">
                        <div style="font-size: 36px; font-weight: 700; color: #28a745;">${positives}</div>
                        <div>Positive (+) → Above M₀</div>
                    </div>
                    <div style="background: #f8d7da; padding: 12px; border-radius: 8px;">
                        <div style="font-size: 36px; font-weight: 700; color: #dc3545;">${negatives}</div>
                        <div>Negative (-) → Below M₀</div>
                    </div>
                    <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                        <div style="font-size: 36px; font-weight: 700; color: #ffc107;">${zeros}</div>
                        <div>Ties (ignored)</div>
                    </div>
                </div>
                <div style="margin-top: 16px; text-align: center;">
                    <strong>Non-zero observations (m) = ${positives} + ${negatives} = ${nonZero}</strong>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate Test Statistic & p-value</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;">
                    <strong>Test statistic = min(${positives}, ${negatives}) = ${testStatistic}</strong>
                </div>
                <div style="margin-top: 12px;">
                    Under H₀, signs follow Binomial(m, 0.5)<br>
                    p-value = ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 4: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>Test Statistic:</strong> ${testStatistic}</div>
                <div><strong>Non-zero observations (m):</strong> ${nonZero}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
                <div><strong>Significance Level (α):</strong> ${alpha}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Decision:</strong> ${conclusion}<br>
                    <strong>Interpretation:</strong> ${interpretation}
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 Interpretation Guide</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead><tr style="background: #1a5490; color: white;"><th style="padding: 8px;">Test Statistic</th><th style="padding: 8px;">Interpretation</th><th style="padding: 8px;">Conclusion</th></tr></thead>
                <tbody>
                    <tr style="background: white;"><td style="padding: 8px;">Large (close to m/2)</td><td style="padding: 8px;">Roughly equal +/- counts</td><td style="padding: 8px;">Cannot reject H₀ (median = M₀)</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 8px;">Small (near 0)</td><td style="padding: 8px;">Most values on one side</td><td style="padding: 8px;">Reject H₀ (median ≠ M₀)</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    
    return { testStatistic, nonZero, pValue, rejectH0, positives, negatives, zeros, steps };
}

function binomialCumulative(k, n, p) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
        sum += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
    }
    return sum;
}

function binomialCumulativeComplement(k, n, p) {
    let sum = 0;
    for (let i = k; i <= n; i++) {
        sum += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
    }
    return sum;
}

function setupSignTestLogic() {
    const computeBtn = document.getElementById("signComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("signData").value;
        const data = parseNumbersFromInput(raw);
        const hypothesizedMedian = parseFloat(document.getElementById("hypothesizedMedian").value);
        const alpha = parseFloat(document.getElementById("signAlpha").value);
        const alternative = document.getElementById("signAlternative").value;
        const resultDiv = document.getElementById("signResultArea");
        const valueSpan = document.getElementById("signValueDisplay");
        const stepsSpan = document.getElementById("signStepsDisplay");
        
        if (!data.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data.";
            return;
        }
        
        const result = computeSignTest(data, hypothesizedMedian, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `Test stat = ${result.testStatistic} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("signClearBtn", "signData", "signResultArea");
}
// ========== ANCOVA INTERFACE RENDER ==========
function renderANCOVAInterface() {
    return `
        <div class="stat-interface" id="statANCOVAInterface">
            <div class="interface-title">📊 ANCOVA (Analysis of Covariance)</div>
            <div class="formula-card">
                <div class="formula">📌 Tests group differences while controlling for covariates</div>
                <div class="desc">
                    <strong>What is ANCOVA?</strong><br>
                    ANCOVA combines ANOVA and regression to compare group means while statistically 
                    controlling for the effect of one or more continuous covariates.<br><br>
                    <strong>Formula:</strong> Y = β₀ + β₁X + β₂Group + ε<br><br>
                    <strong>H₀:</strong> All group means are equal after adjusting for covariates<br>
                    <strong>H₁:</strong> At least one group mean differs after adjusting for covariates
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data (format: outcome, group, covariate1, covariate2, ...):</label>
                <textarea id="ancovaData" rows="6" placeholder="Example:&#10;Dependent Y, Group, Covariate X&#10;12, A, 5&#10;15, A, 6&#10;14, A, 4&#10;18, B, 7&#10;20, B, 8&#10;19, B, 6&#10;25, C, 9&#10;27, C, 10&#10;24, C, 8"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> Each row: Y (outcome), Group (categorical), X1 (covariate), X2 (optional), ...<br>
                    <strong>Example:</strong> 12, A, 5 means Y=12, Group=A, Covariate=5
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="ancovaAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="ancovaComputeBtn">📊 Run ANCOVA + Full Steps</button>
                    <button class="secondary-btn" id="ancovaClearBtn">Clear</button>
                </div>
            </div>
            <div id="ancovaResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 ANCOVA RESULTS</div>
                    <div class="result-value" id="ancovaValueDisplay">—</div>
                    <div class="calculation-steps" id="ancovaStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== MANOVA INTERFACE RENDER ==========
function renderMANOVAInterface() {
    return `
        <div class="stat-interface" id="statMANOVAInterface">
            <div class="interface-title">📈 MANOVA (Multivariate Analysis of Variance)</div>
            <div class="formula-card">
                <div class="formula">📌 Tests group differences across multiple dependent variables</div>
                <div class="desc">
                    <strong>What is MANOVA?</strong><br>
                    MANOVA extends ANOVA to handle multiple correlated dependent variables simultaneously.<br><br>
                    <strong>Test statistics:</strong> Wilks' Lambda (Λ), Pillai's Trace, Hotelling's Trace<br><br>
                    <strong>H₀:</strong> All group mean vectors are equal<br>
                    <strong>H₁:</strong> At least one group mean vector differs
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data (format: group, Y1, Y2, Y3, ...):</label>
                <textarea id="manovaData" rows="6" placeholder="Example:&#10;Group, Y1, Y2, Y3&#10;A, 12, 15, 14&#10;A, 14, 16, 17&#10;A, 13, 14, 13&#10;B, 18, 20, 19&#10;B, 20, 22, 24&#10;B, 19, 21, 20&#10;C, 25, 27, 26&#10;C, 27, 29, 28&#10;C, 26, 28, 30"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> First column = Group, remaining columns = Dependent variables<br>
                    <strong>Example:</strong> A, 12, 15, 14 means Group=A, Y1=12, Y2=15, Y3=14
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="manovaAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="manovaComputeBtn">📈 Run MANOVA + Full Steps</button>
                    <button class="secondary-btn" id="manovaClearBtn">Clear</button>
                </div>
            </div>
            <div id="manovaResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MANOVA RESULTS</div>
                    <div class="result-value" id="manovaValueDisplay">—</div>
                    <div class="calculation-steps" id="manovaStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== ANCOVA COMPUTATION ==========
function computeANCOVA(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    // Parse input data - support both comma and space separated
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;
        // Split by comma or space
        let parts;
        if (line.includes(',')) {
            parts = line.split(',').map(s => s.trim());
        } else {
            parts = line.split(/\s+/);
        }
        
        const values = [];
        for (let part of parts) {
            if (part === "") continue;
            const num = parseFloat(part);
            if (!isNaN(num)) {
                values.push(num);
            } else {
                values.push(part);
            }
        }
        if (values.length >= 3) {  // Need at least: Y, Group, Covariate
            if (data.length === 0 && typeof values[0] !== 'number') continue;   // header row such as "Y, Group, X"
            data.push(values);
        }
    }
    
    if (data.length < 6) {
        return { error: true, message: `Need at least 6 observations for ANCOVA. You provided ${data.length}.` };
    }
    
    // Detect format: If first value is a number and second is a letter, then format is [Y, Group, Covariate1, Covariate2...]
    // But your data seems to have Y as first, Group as second, Covariates as rest
    const n = data.length;
    
    // First column is Y (outcome)
    let y = data.map(row => parseFloat(row[0]));
    
    // Second column is Group (categorical)
    let group = data.map(row => row[1].toString());
    
    // Third column and beyond are covariates (use first covariate for simplicity)
    let cov = data.map(row => parseFloat(row[2]));
    
    const groups = [...new Set(group)];
    const k = groups.length;
    
    if (k < 2) {
        return { error: true, message: `Need at least 2 groups for ANCOVA. Found groups: ${groups.join(', ')}` };
    }
    
    // Check for missing values
    if (y.some(isNaN) || cov.some(isNaN)) {
        return { error: true, message: "Invalid numeric values detected. Please check your data format." };
    }
    
    // ========== STEP 1: Calculate Group Means ==========
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupCovMeans = new Map();
    
    for (let g of groups) {
        let indices = [];
        for (let idx = 0; idx < group.length; idx++) {
            if (group[idx] === g) indices.push(idx);
        }
        groupSizes.set(g, indices.length);
        
        let sumY = 0, sumCov = 0;
        for (let idx of indices) {
            sumY += y[idx];
            sumCov += cov[idx];
        }
        groupMeans.set(g, sumY / indices.length);
        groupCovMeans.set(g, sumCov / indices.length);
    }
    
    // ========== STEP 2: Calculate Grand Mean ==========
    const grandMean = y.reduce((a,b) => a+b, 0) / n;
    const covMean = cov.reduce((a,b) => a+b, 0) / n;
    
    // Build the group means table (the one you showed with issues)
    let groupTableRows = '';
    for (let g of groups) {
        let sumY = 0, sumCov = 0;
        for (let idx = 0; idx < n; idx++) {
            if (group[idx] === g) {
                sumY += y[idx];
                sumCov += cov[idx];
            }
        }
        groupTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center; font-weight: bold;">${g}</td>
            <td style="padding: 10px; text-align: center;">${groupSizes.get(g)}</td>
            <td style="padding: 10px; text-align: center;">${sumY}</td>
            <td style="padding: 10px; text-align: center; font-weight: bold; color: #1a5490;">${groupMeans.get(g).toFixed(6)}</td>
            <td style="padding: 10px; text-align: center;">${sumCov}</td>
            <td style="padding: 10px; text-align: center;">${groupCovMeans.get(g).toFixed(6)}</td>
        </tr>`;
    }
    
    // ========== STEP 3: Calculate Total Sum of Squares ==========
    let ssTotal = 0;
    let ssTotalDetails = [];
    for (let i = 0; i < n; i++) {
        let dev = y[i] - grandMean;
        let sqDev = dev * dev;
        ssTotal += sqDev;
        ssTotalDetails.push(`(${y[i]} - ${grandMean.toFixed(4)})² = (${dev.toFixed(4)})² = ${sqDev.toFixed(4)}`);
    }
    
    // ========== STEP 4: Calculate Within-Group SS (Unadjusted) ==========
    let ssWithinUnadj = 0;
    let ssWithinUnadjDetails = [];
    for (let g of groups) {
        let groupMean = groupMeans.get(g);
        ssWithinUnadjDetails.push(`\n   <strong>Group ${g}</strong> (mean = ${groupMean.toFixed(4)}):`);
        for (let idx = 0; idx < n; idx++) {
            if (group[idx] === g) {
                let dev = y[idx] - groupMean;
                let sqDev = dev * dev;
                ssWithinUnadj += sqDev;
                ssWithinUnadjDetails.push(`      (${y[idx]} - ${groupMean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
            }
        }
    }
    
    // ========== STEP 5: Calculate Regression Coefficient (β) ==========
    // ANCOVA uses the POOLED WITHIN-GROUP slope: deviations are taken from each group's own means,
    // so the covariate slope is not contaminated by differences between the groups.
    let xySum = 0, xxSum = 0;
    let xyDetails = [], xxDetails = [];
    // Totals around the grand means (needed for the covariate-adjusted total sum of squares)
    let xyTotal = 0, xxTotal = 0;
    
    for (let i = 0; i < n; i++) {
        xyTotal += (y[i] - grandMean) * (cov[i] - covMean);
        xxTotal += (cov[i] - covMean) * (cov[i] - covMean);
        const gMeanY = groupMeans.get(group[i]), gMeanX = groupCovMeans.get(group[i]);
        let yDev = y[i] - gMeanY;
        let xDev = cov[i] - gMeanX;
        xySum += yDev * xDev;
        xxSum += xDev * xDev;
        xyDetails.push(`(${y[i]} - ${gMeanY.toFixed(4)}) × (${cov[i]} - ${gMeanX.toFixed(4)}) = ${yDev.toFixed(4)} × ${xDev.toFixed(4)} = ${(yDev * xDev).toFixed(4)}`);
        xxDetails.push(`(${cov[i]} - ${gMeanX.toFixed(4)})² = ${xDev.toFixed(4)}² = ${(xDev * xDev).toFixed(4)}`);
    }
    
    const beta = xxSum !== 0 ? xySum / xxSum : 0;
    
    // ========== STEP 6: Calculate Adjusted Means ==========
    let adjustedMeans = new Map();
    let adjMeanDetails = [];
    for (let g of groups) {
        let groupMean = groupMeans.get(g);
        let groupCovMean = groupCovMeans.get(g);
        let adjMean = groupMean - beta * (groupCovMean - covMean);
        adjustedMeans.set(g, adjMean);
        adjMeanDetails.push(`${g}: ${groupMean.toFixed(4)} - ${beta.toFixed(4)} × (${groupCovMean.toFixed(4)} - ${covMean.toFixed(4)}) = ${adjMean.toFixed(4)}`);
    }
    
    // ========== STEP 7: Calculate Adjusted Within-Group SS ==========
    let ssWithinAdj = 0;
    let ssWithinAdjDetails = [];
    for (let g of groups) {
        let adjMean = adjustedMeans.get(g);
        ssWithinAdjDetails.push(`\n   <strong>Group ${g}</strong> (adjusted mean = ${adjMean.toFixed(4)}):`);
        for (let idx = 0; idx < n; idx++) {
            if (group[idx] === g) {
                let residual = y[idx] - adjMean - beta * (cov[idx] - covMean);
                let sqResidual = residual * residual;
                ssWithinAdj += sqResidual;
                ssWithinAdjDetails.push(`      ${y[idx]} - ${adjMean.toFixed(4)} - ${beta.toFixed(4)}×(${cov[idx]} - ${covMean.toFixed(4)}) = ${residual.toFixed(4)} → squared = ${sqResidual.toFixed(4)}`);
            }
        }
    }
    
    // ========== STEP 8: Calculate Adjusted Between-Group SS ==========
    // Covariate-adjusted total SS minus covariate-adjusted error SS
    const ssTotalAdj = ssTotal - (xxTotal !== 0 ? xyTotal * xyTotal / xxTotal : 0);
    let ssBetweenAdj = ssTotalAdj - ssWithinAdj;
    if (ssBetweenAdj < 0) ssBetweenAdj = 0;
    const ssCovariate = ssTotal - ssBetweenAdj - ssWithinAdj;
    
    // ========== STEP 9: Degrees of Freedom ==========
    const dfBetween = k - 1;
    const dfWithin = n - k - 1;
    const dfTotal = n - 1;
    
    // ========== STEP 10: Mean Squares ==========
    const msBetween = ssBetweenAdj / dfBetween;
    const msWithin = ssWithinAdj / dfWithin;
    
    // ========== STEP 11: F-statistic ==========
    const fStatistic = msBetween / msWithin;
    
    // ========== STEP 12: Critical Value and p-value ==========
    const criticalValue = fCriticalValue(alpha, dfBetween, dfWithin);
    const pValue = 1 - fCDF(fStatistic, dfBetween, dfWithin);
    const rejectH0 = fStatistic > criticalValue;
    
    // Build input data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        dataRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${y[i]}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: #1a5490;">${group[i]}</td>
            <td style="padding: 8px; text-align: center;">${cov[i]}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📊</span>
                <h2 style="margin: 0;">Analysis of Covariance (ANCOVA)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Testing group differences while controlling for covariates</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: All group means are equal after adjusting for covariates</p>
        </div>
        
        <!-- Input Data -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Input Data</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">#</th>
                        <th style="padding: 10px;">Y (Outcome)</th>
                        <th style="padding: 10px;">Group</th>
                        <th style="padding: 10px;">X (Covariate)</th>
                    </tr></thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 1: Group Means -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 1: Calculate Group Means for Y and Covariate X</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">Group</th>
                        <th style="padding: 10px;">n</th>
                        <th style="padding: 10px;">ΣY</th>
                        <th style="padding: 10px;">Mean Y (Ȳⱼ)</th>
                        <th style="padding: 10px;">ΣX</th>
                        <th style="padding: 10px;">Mean X (X̄ⱼ)</th>
                    </tr></thead>
                    <tbody>${groupTableRows}</tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 2: Grand Mean -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Grand Means</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div><strong>Grand Mean of Y (Ȳ):</strong> ${grandMean.toFixed(6)}</div>
                <div><strong>Grand Mean of X (X̄):</strong> ${covMean.toFixed(6)}</div>
            </div>
        </div>
        
        <!-- Step 3: Total Sum of Squares -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate Total Sum of Squares (SS<sub>Total</sub>)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;"><strong>Formula:</strong> SS<sub>Total</sub> = Σ(Yᵢ - Ȳ)²</div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 12px 0;">
                    ${ssTotalDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Total</sub> = ${ssTotal.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- Step 4: Within-Group SS (Unadjusted) -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 4: Calculate Within-Group SS (Unadjusted)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;"><strong>Formula:</strong> SS<sub>Within</sub> = Σ(Yᵢ - Ȳⱼ)²</div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 12px 0;">
                    ${ssWithinUnadjDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Within, unadj</sub> = ${ssWithinUnadj.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- Step 5: Regression Coefficient -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 5: Calculate Regression Coefficient (β)</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;"><strong>Formula:</strong> β = Σ(Yᵢ - Ȳ<sub>group</sub>)(Xᵢ - X̄<sub>group</sub>) / Σ(Xᵢ - X̄<sub>group</sub>)²  (pooled within-group slope)</div>
                
                <div><strong>Numerator Σ(Yᵢ - Ȳ<sub>group</sub>)(Xᵢ - X̄<sub>group</sub>):</strong></div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 8px 0;">
                    ${xyDetails.join('<br>')}
                    <strong>Σ = ${xySum.toFixed(6)}</strong>
                </div>
                
                <div><strong>Denominator Σ(Xᵢ - X̄<sub>group</sub>)²:</strong></div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 8px 0;">
                    ${xxDetails.join('<br>')}
                    <strong>Σ = ${xxSum.toFixed(6)}</strong>
                </div>
                
                <div><strong>β = ${xySum.toFixed(6)} / ${xxSum.toFixed(6)} = <span style="color: #1a5490; font-weight: bold;">${beta.toFixed(6)}</span></strong></div>
            </div>
        </div>
        
        <!-- Step 6: Adjusted Means -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 6: Calculate Adjusted Group Means</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;"><strong>Formula:</strong> Ȳⱼ<sub>adj</sub> = Ȳⱼ - β × (X̄ⱼ - X̄)</div>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 12px 0;">
                    ${adjMeanDetails.join('<br>')}
                </div>
            </div>
        </div>
        
        <!-- Step 7: Adjusted Within-Group SS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 7: Calculate Adjusted Within-Group SS</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    ${ssWithinAdjDetails.join('<br>')}
                </div>
                <div><strong>SS<sub>Within, adj</sub> = ${ssWithinAdj.toFixed(6)}</strong></div>
            </div>
        </div>
        
        <!-- ANCOVA Summary Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 2px solid #1a5490; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 ANCOVA Summary Table</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #e9ecef;">
                    <th style="padding: 12px;">Source</th>
                    <th style="padding: 12px;">SS</th>
                    <th style="padding: 12px;">df</th>
                    <th style="padding: 12px;">MS</th>
                    <th style="padding: 12px;">F</th>
                    <th style="padding: 12px;">p-value</th>
                </tr></thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Covariate (X)</td>
                        <td style="text-align: center;">${ssCovariate.toFixed(4)}</td>
                        <td style="text-align: center;">1</td>
                        <td style="text-align: center;">${ssCovariate.toFixed(4)}</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Between Groups (Adjusted)</td>
                        <td style="text-align: center;">${ssBetweenAdj.toFixed(4)}</td>
                        <td style="text-align: center;">${dfBetween}</td>
                        <td style="text-align: center;">${msBetween.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle; font-weight: bold; font-size: 18px;">${fStatistic.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle;">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Within Groups (Error)</td>
                        <td style="text-align: center;">${ssWithinAdj.toFixed(4)}</td>
                        <td style="text-align: center;">${dfWithin}</td>
                        <td style="text-align: center;">${msWithin.toFixed(4)}</td>
                    </tr>
                    <tr style="background: #e9ecef;">
                        <td style="padding: 12px; font-weight: bold;">Total</td>
                        <td style="text-align: center;">${ssTotal.toFixed(4)}</td>
                        <td style="text-align: center;">${dfTotal}</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Conclusion -->
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Conclusion</h3>
            <div><strong>F-statistic:</strong> ${fStatistic.toFixed(6)}</div>
            <div><strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Interpretation:</strong> ${rejectH0 ? 'There IS sufficient evidence that group means differ after controlling for the covariate.' : 'There is NOT sufficient evidence that group means differ after controlling for the covariate.'}
            </div>
        </div>
        
        <!-- Adjusted Means -->
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px;">
            <h4 style="margin: 0 0 8px 0;">📊 Adjusted Group Means</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                ${Array.from(adjustedMeans.entries()).map(([g, mean]) => `
                    <div style="background: white; padding: 8px; border-radius: 8px; text-align: center;">
                        <strong>Group ${g}</strong><br>
                        Original: ${groupMeans.get(g).toFixed(4)}<br>
                        Adjusted: <strong style="color: #1a5490;">${mean.toFixed(4)}</strong>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>`;
    
    return { fStatistic, dfBetween, dfWithin, pValue, rejectH0, steps, adjustedMeans };
}
// ========== MANOVA COMPUTATION ==========
function computeMANOVA(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    // Parse input data
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;
        let parts;
        if (line.includes(',')) {
            parts = line.split(',').map(s => s.trim());
        } else {
            parts = line.split(/\s+/);
        }
        
        const values = [];
        for (let part of parts) {
            if (part === "") continue;
            const num = parseFloat(part);
            if (!isNaN(num)) {
                values.push(num);
            } else {
                values.push(part);
            }
        }
        if (values.length >= 3) {
            const nonNumeric = values.slice(1).some(v => typeof v !== 'number');
            if (nonNumeric && data.length === 0) continue;   // header row such as "Group, Y1, Y2, Y3"
            if (nonNumeric) {
                return { error: true, message: `Line ${i + 1} ("${line}") has a non-numeric value. After the group label every value must be a number.` };
            }
            data.push(values);
        }
    }
    
    if (data.length < 6) {
        return { error: true, message: `Need at least 6 observations for MANOVA. You provided ${data.length}.` };
    }
    
    // Extract data
    const groups = [...new Set(data.map(row => row[0].toString()))];
    const k = groups.length;
    const p = data[0].length - 1;
    const n = data.length;
    
    if (k < 2) {
        return { error: true, message: `Need at least 2 groups for MANOVA. Found groups: ${groups.join(', ')}` };
    }
    
    if (p < 2) {
        return { error: true, message: `Need at least 2 dependent variables for MANOVA. Found ${p} dependent variable(s).` };
    }
    
    // Extract dependent variables
    let y = [];
    for (let j = 0; j < p; j++) {
        y.push(data.map(row => parseFloat(row[j + 1])));
    }
    let group = data.map(row => row[0].toString());
    
    // ========== STEP 1: Grand Means ==========
    let grandMeans = [];
    let grandMeanCalculations = [];
    for (let j = 0; j < p; j++) {
        let sum = y[j].reduce((a,b) => a+b, 0);
        let mean = sum / n;
        grandMeans.push(mean);
        grandMeanCalculations.push(`Ȳ<sub>${j+1}</sub> = (${y[j].join(' + ')}) / ${n} = ${sum} / ${n} = ${mean.toFixed(4)}`);
    }
    
    // ========== STEP 2: Group Means ==========
    let groupMeans = [];
    let groupSizes = new Map();
    let groupMeanCalculations = [];
    
    for (let g of groups) {
        let indices = [];
        for (let idx = 0; idx < group.length; idx++) {
            if (group[idx] === g) indices.push(idx);
        }
        groupSizes.set(g, indices.length);
        let means = [];
        let calcText = `<strong>Group ${g}:</strong><br>`;
        for (let j = 0; j < p; j++) {
            let sum = 0;
            let values = [];
            for (let idx of indices) {
                sum += y[j][idx];
                values.push(y[j][idx]);
            }
            let mean = sum / indices.length;
            means.push(mean);
            calcText += `&nbsp;&nbsp;Ȳ<sub>${j+1}</sub> = (${values.join(' + ')}) / ${indices.length} = ${sum} / ${indices.length} = ${mean.toFixed(4)}<br>`;
        }
        groupMeanCalculations.push(calcText);
        groupMeans.push({ group: g, means: means, n: indices.length, indices: indices });
    }
    
    // ========== STEP 3: Total SSCP Matrix (T) with DETAILED CALCULATIONS ==========
    let T = Array(p).fill().map(() => Array(p).fill(0));
    let totalDeviationDetails = [];
    let totalMatrixCalculations = [];
    
    // Calculate deviation scores for each observation
    for (let i = 0; i < n; i++) {
        let deviations = [];
        for (let a = 0; a < p; a++) {
            let dev = y[a][i] - grandMeans[a];
            deviations.push(dev);
        }
        totalDeviationDetails.push({
            obs: i+1,
            group: group[i],
            values: y.map((_, idx) => y[idx][i]),
            deviations: deviations
        });
        
        // Calculate contributions to T matrix
        let rowCalculations = [];
        for (let a = 0; a < p; a++) {
            for (let b = 0; b < p; b++) {
                let product = deviations[a] * deviations[b];
                T[a][b] += product;
                if (a === 0 && b === 0) {
                    rowCalculations.push(`(${deviations[a].toFixed(4)})² = ${product.toFixed(4)}`);
                } else if (a === 0 && b === 1) {
                    rowCalculations.push(`${deviations[a].toFixed(4)} × ${deviations[b].toFixed(4)} = ${product.toFixed(4)}`);
                }
            }
        }
        totalMatrixCalculations.push(`Observation ${i+1}: ${rowCalculations.join(', ')}`);
    }
    
    // ========== STEP 4: Within-Group SSCP Matrix (W) with DETAILED CALCULATIONS ==========
    let W = Array(p).fill().map(() => Array(p).fill(0));
    let withinDeviationDetails = [];
    let withinMatrixCalculations = [];
    
    for (let gm of groupMeans) {
        let groupCalcDetails = [];
        for (let idx of gm.indices) {
            let deviations = [];
            for (let a = 0; a < p; a++) {
                let dev = y[a][idx] - gm.means[a];
                deviations.push(dev);
            }
            withinDeviationDetails.push({
                obs: idx+1,
                group: gm.group,
                values: y.map((_, j) => y[j][idx]),
                groupMeans: gm.means,
                deviations: deviations
            });
            
            let rowCalculations = [];
            for (let a = 0; a < p; a++) {
                for (let b = 0; b < p; b++) {
                    let product = deviations[a] * deviations[b];
                    W[a][b] += product;
                    if (a === 0 && b === 0) {
                        rowCalculations.push(`(${deviations[a].toFixed(4)})² = ${product.toFixed(4)}`);
                    } else if (a === 0 && b === 1) {
                        rowCalculations.push(`${deviations[a].toFixed(4)} × ${deviations[b].toFixed(4)} = ${product.toFixed(4)}`);
                    }
                }
            }
            groupCalcDetails.push(`Observation ${idx+1}: ${rowCalculations.join(', ')}`);
        }
        withinMatrixCalculations.push({ group: gm.group, calculations: groupCalcDetails });
    }
    
    // ========== STEP 5: Between-Group SSCP Matrix (B) ==========
    let B = Array(p).fill().map(() => Array(p).fill(0));
    let betweenCalculations = [];
    
    for (let gm of groupMeans) {
        let calcText = `<strong>Group ${gm.group}:</strong><br>`;
        for (let a = 0; a < p; a++) {
            for (let b = 0; b < p; b++) {
                let diffA = gm.means[a] - grandMeans[a];
                let diffB = gm.means[b] - grandMeans[b];
                let contribution = gm.n * diffA * diffB;
                B[a][b] += contribution;
                if (a === 0 && b === 0) {
                    calcText += `&nbsp;&nbsp;${gm.n} × (${gm.means[a].toFixed(4)} - ${grandMeans[a].toFixed(4)})² = ${contribution.toFixed(4)}<br>`;
                } else if (a === 0 && b === 1) {
                    calcText += `&nbsp;&nbsp;${gm.n} × (${gm.means[a].toFixed(4)} - ${grandMeans[a].toFixed(4)}) × (${gm.means[b].toFixed(4)} - ${grandMeans[b].toFixed(4)}) = ${contribution.toFixed(4)}<br>`;
                }
            }
        }
        betweenCalculations.push(calcText);
    }
    
    // ========== STEP 6: Calculate Eigenvalues ==========
    let W_inv = inverseMatrix(W);
    if (!W_inv) {
        return { error: true, message: "The within-group covariance matrix is singular, so MANOVA cannot be computed. This happens when a dependent variable is constant within the groups, two dependent variables are perfectly correlated (one is a multiple or sum of another), or there are too few observations per group (each group needs more observations than there are dependent variables). Remove the redundant variable or add more data." };
    }
    let B_Winv = multiplyMatrices(B, W_inv);
    let eigenvalues = computeEigenvalues(B_Winv);
    
    // ========== STEP 7: Test Statistics ==========
    let wilksLambda = 1;
    let pillaiTrace = 0;
    for (let lambda of eigenvalues) {
        if (lambda > 0) {
            wilksLambda *= 1 / (1 + lambda);
            pillaiTrace += lambda / (1 + lambda);
        }
    }
    let hotellingTrace = eigenvalues.reduce((a,b) => a+b, 0);
    let roysRoot = Math.max(...eigenvalues);
    
    // ========== STEP 8: F-statistic ==========
    // Rao's F approximation to Wilks' Lambda (exact when p = 1, 2 or q = 1, 2)
    const q = k - 1;
    const rao = (n - k) - (p - q + 1) / 2;
    const raoU = (p * q - 2) / 4;
    const raoT = (p * p + q * q - 5) > 0 ? Math.sqrt((p * p * q * q - 4) / (p * p + q * q - 5)) : 1;
    let df1 = p * q;
    let df2 = rao * raoT - 2 * raoU;
    let fStatistic = 0;
    if (wilksLambda > 0 && wilksLambda < 1 && df2 > 0) {
        const root = Math.pow(wilksLambda, 1 / raoT);
        fStatistic = (1 - root) / root * df2 / df1;
    }
    if (isNaN(fStatistic) || !isFinite(fStatistic)) fStatistic = 0;
    
    const criticalValue = fCriticalValue(alpha, df1, df2);
    const pValue = 1 - fCDF(fStatistic, df1, df2);
    const rejectH0 = fStatistic > criticalValue;
    
    // Build data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        let dvCells = '';
        for (let j = 0; j < p; j++) {
            dvCells += `<td style="padding: 8px; text-align: center;">${y[j][i]}</td>`;
        }
        dataRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: #1a5490;">${group[i]}</td>
            ${dvCells}
        </tr>`;
    }
    
    // Build group means table
    let meansRows = '';
    for (let gm of groupMeans) {
        let meanCells = '';
        for (let j = 0; j < p; j++) {
            meanCells += `<td style="text-align: center; font-weight: bold; color: #1a5490;">${gm.means[j].toFixed(4)}</td>`;
        }
        meansRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; font-weight: bold;">${gm.group}</td>
            <td style="text-align: center;">${gm.n}</td>
            ${meanCells}
        </tr>`;
    }
    
    // Build deviation table for Total SSCP
    let deviationRows = '';
    for (let d of totalDeviationDetails) {
        let devCells = '';
        for (let j = 0; j < p; j++) {
            devCells += `<td style="text-align: center;">${d.values[j]} - ${grandMeans[j].toFixed(4)} = ${d.deviations[j].toFixed(4)}</td>`;
        }
        deviationRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="text-align: center;">${d.obs}</td>
            <td style="text-align: center; font-weight: bold;">${d.group}</td>
            ${devCells}
        </tr>`;
    }
    
    // Build deviation table for Within SSCP
    let withinDevRows = '';
    for (let d of withinDeviationDetails) {
        let devCells = '';
        let groupMeanDisplay = d.groupMeans.map(m => m.toFixed(4)).join(', ');
        for (let j = 0; j < p; j++) {
            devCells += `<td style="text-align: center;">${d.values[j]} - ${d.groupMeans[j].toFixed(4)} = ${d.deviations[j].toFixed(4)}</td>`;
        }
        withinDevRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="text-align: center;">${d.obs}</td>
            <td style="text-align: center; font-weight: bold;">${d.group}</td>
            <td style="font-size: 11px; color: #666;">Group Means: (${groupMeanDisplay})</td>
            ${devCells}
         </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 45px;">📈</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">Multivariate Analysis of Variance (MANOVA)</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">A statistical test that compares group differences across MULTIPLE dependent variables simultaneously</p>
                </div>
            </div>
        </div>
        
        <!-- INTRODUCTION SECTION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📖 What is MANOVA?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490; margin-top: 0;">🎯 Definition</h3>
                <p style="line-height: 1.6; font-size: 15px;">MANOVA is an extension of ANOVA that allows you to test whether there are significant differences between groups on <strong>TWO OR MORE dependent variables simultaneously</strong>.</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="color: #28a745; margin-top: 0;">✅ When to Use MANOVA?</h3>
                    <ul style="line-height: 1.8;">
                        <li>You have <strong>2+ dependent variables</strong> that are correlated</li>
                        <li>You want to <strong>control Type I error</strong> (running multiple ANOVAs increases error rate)</li>
                        <li>You want to detect <strong>patterns across multiple outcomes</strong></li>
                        <li>Your dependent variables measure <strong>different aspects</strong> of a construct</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="color: #dc3545; margin-top: 0;">❌ When NOT to Use MANOVA?</h3>
                    <ul style="line-height: 1.8;">
                        <li>Dependent variables are <strong>not correlated</strong></li>
                        <li>You have <strong>only one dependent variable</strong> (use ANOVA instead)</li>
                        <li>Your sample size is <strong>too small</strong></li>
                        <li>Assumptions are <strong>severely violated</strong></li>
                    </ul>
                </div>
            </div>
            
            <div style="background: #fff3cd; border-radius: 15px; padding: 20px; border-left: 5px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">💡 Real-World Example</h3>
                <p style="margin: 0; line-height: 1.6;">A researcher wants to compare three teaching methods (Group A, B, C) on TWO outcomes: <strong>exam score AND student satisfaction</strong>. Instead of running two separate ANOVAs (which increases error rate), they use MANOVA to test both outcomes together.</p>
            </div>
        </div>
        
        <!-- HYPOTHESIS SECTION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📊 Hypotheses in MANOVA</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <h3 style="color: #28a745;">Null Hypothesis (H₀)</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; font-family: monospace; font-size: 16px;">
                        μ₁ = μ₂ = μ₃ = ... = μ<sub>k</sub>
                    </div>
                    <p style="margin-top: 10px;">The mean vectors of all groups are equal.<br>No difference exists between groups.</p>
                </div>
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <h3 style="color: #dc3545;">Alternative Hypothesis (H₁)</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; font-family: monospace; font-size: 16px;">
                        At least one μ<sub>i</sub> ≠ μ<sub>j</sub>
                    </div>
                    <p style="margin-top: 10px;">At least one group's mean vector is different from others.<br>There is a significant difference between groups.</p>
                </div>
            </div>
        </div>
        
        <!-- INPUT DATA SECTION -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📋 Step 1: Input Data</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">#</th>
                        <th style="padding: 12px;">Group</th>
                        ${Array(p).fill().map((_, j) => `<th style="padding: 12px;">Y<sub>${j+1}</sub></th>`).join('')}
                    </tr></thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Data Summary:</strong> ${n} total observations, ${k} groups, ${p} dependent variables
            </div>
        </div>
        
        <!-- STEP 2: GRAND MEANS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 2: Calculate Grand Means (Ȳ)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> Grand Mean = (Sum of all values) / (Total number of observations)
                </div>
                ${grandMeanCalculations.map(calc => `<div style="margin-bottom: 10px;">${calc}</div>`).join('')}
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation:</strong> Grand means represent the overall average of each dependent variable across ALL groups.
                </div>
            </div>
        </div>
        
        <!-- STEP 3: GROUP MEANS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 3: Calculate Group Means (Ȳⱼ)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> Group Mean = (Sum of values in group) / (Number in group)
                </div>
                ${groupMeanCalculations.map(calc => `<div style="margin-bottom: 15px;">${calc}</div>`).join('')}
                <div style="overflow-x: auto; margin-top: 15px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #1a5490; color: white;">
                            <th style="padding: 12px;">Group</th>
                            <th style="padding: 12px;">n</th>
                            ${Array(p).fill().map((_, j) => `<th style="padding: 12px;">Mean Y<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${meansRows}</tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation:</strong> Group means show how each group performs on each dependent variable. Large differences suggest possible group effects.
                </div>
            </div>
        </div>
        
        <!-- WHAT ARE SSCP MATRICES? -->
        <div style="background: #f0f4fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📐 Understanding SSCP Matrices</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">What is SSCP?</h3>
                <p><strong>SSCP = Sum of Squares and Cross Products</strong></p>
                <p>It's like variance-covariance, but for multivariate data:</p>
                <ul>
                    <li><strong>Diagonal elements</strong> = Sum of Squares (variance of one variable)</li>
                    <li><strong>Off-diagonal elements</strong> = Cross Products (covariance between variables)</li>
                </ul>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <strong>Example for 2 variables (Y₁, Y₂):</strong><br>
                    T = [ Σ(Y₁-Ȳ₁)² , Σ(Y₁-Ȳ₁)(Y₂-Ȳ₂) ]<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;[ Σ(Y₂-Ȳ₂)(Y₁-Ȳ₁) , Σ(Y₂-Ȳ₂)² ]
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <div style="font-size: 36px;">📊</div>
                    <h3>T (Total)</h3>
                    <p>Total variability in all DVs</p>
                    <p style="font-size: 12px; color: #666;">Measures overall spread</p>
                </div>
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <div style="font-size: 36px;">📈</div>
                    <h3>W (Within)</h3>
                    <p>Error/Residual variability</p>
                    <p style="font-size: 12px; color: #666;">Unexplained variation</p>
                </div>
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <div style="font-size: 36px;">🎯</div>
                    <h3>B (Between)</h3>
                    <p>Variability explained by groups</p>
                    <p style="font-size: 12px; color: #666;">Treatment effect</p>
                </div>
            </div>
            
            <div style="background: #d4edda; border-radius: 15px; padding: 15px; margin-top: 15px; text-align: center;">
                <strong>Relationship:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 18px;">T = B + W</span>
            </div>
        </div>
        
        <!-- STEP 4: TOTAL SSCP MATRIX (T) - DETAILED -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 4: Calculate Total SSCP Matrix (T)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> T = Σ(Yᵢ - Ȳ)(Yᵢ - Ȳ)<sup>T</sup>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>🔍 What does this formula mean?</strong><br>
                    For each observation, we calculate how far it deviates from the grand mean (Yᵢ - Ȳ).<br>
                    Then we multiply this deviation vector by itself (outer product) and sum across all observations.
                </div>
                
                <h3 style="color: #1a5490;">Step 4a: Calculate Deviation Scores (Yᵢ - Ȳ)</h3>
                <div style="overflow-x: auto; margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #1a5490; color: white;">
                            <th style="padding: 8px;">#</th>
                            <th style="padding: 8px;">Group</th>
                            ${Array(p).fill().map((_, j) => `<th style="padding: 8px;">Y<sub>${j+1}</sub> - Ȳ<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${deviationRows}</tbody>
                    </table>
                </div>
                
                <h3 style="color: #1a5490;">Step 4b: Calculate Cross Products and Sum</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px; font-family: monospace; font-size: 13px;">
                    ${totalMatrixCalculations.join('<br>')}
                </div>
                
                <h3 style="color: #1a5490;">Step 4c: Final T Matrix</h3>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; font-family: monospace; text-align: center;">
                    <strong>T Matrix (${p}×${p}):</strong><br>
                    ${T.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    💡 <strong>What does T represent?</strong> T measures the TOTAL variation in all dependent variables. 
                    The diagonal elements are Sum of Squares (variance within each DV), and off-diagonals are Cross Products (covariance between DVs).
                </div>
            </div>
        </div>
        
        <!-- STEP 5: WITHIN-GROUP SSCP MATRIX (W) - DETAILED -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 5: Calculate Within-Group SSCP Matrix (W)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> W = Σⱼ Σ(Yᵢⱼ - Ȳⱼ)(Yᵢⱼ - Ȳⱼ)<sup>T</sup>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>🔍 What does this formula mean?</strong><br>
                    For each observation, we calculate how far it deviates from its OWN GROUP MEAN (Yᵢⱼ - Ȳⱼ).<br>
                    This measures variation WITHIN groups - the "error" or "unexplained" variation.
                </div>
                
                <h3 style="color: #1a5490;">Step 5a: Calculate Deviation Scores (Yᵢⱼ - Ȳⱼ)</h3>
                <div style="overflow-x: auto; margin-bottom: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #1a5490; color: white;">
                            <th style="padding: 8px;">#</th>
                            <th style="padding: 8px;">Group</th>
                            <th style="padding: 8px;">Group Means</th>
                            ${Array(p).fill().map((_, j) => `<th style="padding: 8px;">Y<sub>${j+1}</sub> - Ȳⱼ<sub>${j+1}</sub></th>`).join('')}
                        </tr></thead>
                        <tbody>${withinDevRows}</tbody>
                    </table>
                </div>
                
                <h3 style="color: #1a5490;">Step 5b: Calculate Cross Products and Sum Within Each Group</h3>
                ${withinMatrixCalculations.map(g => `
                    <div style="margin-bottom: 15px;">
                        <strong>Group ${g.group}:</strong>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; margin-top: 5px;">
                            ${g.calculations.join('<br>')}
                        </div>
                    </div>
                `).join('')}
                
                <h3 style="color: #1a5490;">Step 5c: Final W Matrix</h3>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; font-family: monospace; text-align: center;">
                    <strong>W Matrix (${p}×${p}):</strong><br>
                    ${W.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    💡 <strong>What does W represent?</strong> W measures the VARIATION WITHIN each group. 
                    If W is small, it means observations within groups are very similar (low error variance).<br>
                    <strong>Key insight:</strong> W represents the "noise" or "unexplained" variation that cannot be attributed to group differences.
                </div>
            </div>
        </div>
        
        <!-- STEP 6: BETWEEN-GROUP SSCP MATRIX (B) -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 6: Calculate Between-Group SSCP Matrix (B)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula:</strong> B = Σ nⱼ(Ȳⱼ - Ȳ)(Ȳⱼ - Ȳ)<sup>T</sup>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>🔍 What does this formula mean?</strong><br>
                    This measures how far each GROUP MEAN deviates from the GRAND MEAN, weighted by group size.<br>
                    This represents the "signal" or "explained" variation - the part attributed to group differences.
                </div>
                
                <h3 style="color: #1a5490;">Step 6a: Calculate Group Mean Deviations and Contributions</h3>
                ${betweenCalculations.map(calc => `<div style="margin-bottom: 15px;">${calc}</div>`).join('')}
                
                <h3 style="color: #1a5490;">Step 6b: Final B Matrix</h3>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; font-family: monospace; text-align: center;">
                    <strong>B Matrix (${p}×${p}):</strong><br>
                    ${B.map(row => `&nbsp;&nbsp;[${row.map(v => v.toFixed(2)).join(', ')}]`).join('<br>')}
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px;">
                    💡 <strong>Check the relationship:</strong> T = B + W?<br>
                    T[0,0] = ${T[0][0].toFixed(2)} = B[0,0] (${B[0][0].toFixed(2)}) + W[0,0] (${W[0][0].toFixed(2)}) = ${(B[0][0] + W[0][0]).toFixed(2)} ✅
                </div>
                
                <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation:</strong> B represents the VARIATION BETWEEN groups. 
                    Larger B relative to W means groups are more different (stronger treatment effect).
                </div>
            </div>
        </div>
        
        <!-- EIGENVALUES EXPLANATION -->
        <div style="background: #f0f4fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">📊 Step 7: Understanding Eigenvalues in MANOVA</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <p><strong>What are Eigenvalues?</strong> In MANOVA, eigenvalues (λ) represent how well the dependent variables separate the groups. We solve |B - λW| = 0 to find λ.</p>
                <ul>
                    <li><strong>Large λ</strong> → Strong group separation on that dimension</li>
                    <li><strong>Small λ</strong> → Weak group separation</li>
                    <li><strong>λ = 0</strong> → No group separation</li>
                </ul>
                <div style="background: #e9ecef; padding: 15px; border-radius: 10px; margin-top: 15px; font-family: monospace;">
                    <strong>Eigenvalues (λ):</strong> ${eigenvalues.map(l => l.toFixed(4)).join(', ')}
                </div>
                <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation:</strong> ${eigenvalues[0] > 1 ? 'The first eigenvalue > 1 suggests strong group separation.' : 'The eigenvalues suggest moderate group separation.'}
                </div>
            </div>
        </div>
        
        <!-- MANOVA TEST STATISTICS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 8: Calculate MANOVA Test Statistics</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">Four Common MANOVA Test Statistics</h3>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <strong>1. Wilks' Lambda (Λ)</strong><br>
                    Formula: Λ = ∏(1/(1+λᵢ)) = ${wilksLambda.toFixed(6)}<br>
                    <span style="font-size: 13px;">📌 Range: 0 to 1 | Smaller values = stronger group differences | Most commonly reported</span>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <strong>2. Pillai's Trace (V)</strong><br>
                    Formula: V = Σ(λᵢ/(1+λᵢ)) = ${pillaiTrace.toFixed(6)}<br>
                    <span style="font-size: 13px;">📌 Range: 0 to 1 | More robust to violations | Recommended for unequal sample sizes</span>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <strong>3. Hotelling's Trace (T²)</strong><br>
                    Formula: T² = Σ λᵢ = ${hotellingTrace.toFixed(6)}<br>
                    <span style="font-size: 13px;">📌 Range: 0 to ∞ | Most powerful when assumptions are met</span>
                </div>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <strong>4. Roy's Largest Root (θ)</strong><br>
                    Formula: θ = max(λᵢ) = ${roysRoot.toFixed(6)}<br>
                    <span style="font-size: 13px;">📌 Range: 0 to ∞ | Most powerful when one eigenvalue dominates</span>
                </div>
            </div>
        </div>
        
        <!-- F-STATISTIC CALCULATION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1a5490; border-left: 5px solid #1a5490; padding-left: 15px;">🔢 Step 9: Calculate F-statistic (from Wilks' Lambda)</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <strong>📐 Formula (Rao's approximation):</strong> F = (1 - Λ^{1/t}) / Λ^{1/t} × df₂ / df₁
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <strong>t = √((p²q² - 4)/(p² + q² - 5))</strong> (q = k-1) = ${raoT.toFixed(6)}
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <strong>df₁ = p × q</strong> = ${p} × ${q} = ${df1}
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <strong>df₂ = t × (n - k - (p - q + 1)/2) - (pq - 2)/2</strong> = ${df2.toFixed(4)}
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <strong>Λ^{1/t}</strong> = ${Math.pow(wilksLambda, 1/raoT).toFixed(6)}
                    </div>
                </div>
                
                <div style="font-size: 24px; font-weight: bold; color: #1a5490; text-align: center; padding: 20px; background: #e8f4f8; border-radius: 10px;">
                    F = ${fStatistic.toFixed(6)}
                </div>
                
                <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 <strong>Interpretation of F:</strong> The F-statistic compares the between-group variance to the within-group variance. Larger F = stronger evidence of group differences.
                </div>
            </div>
        </div>
        
        <!-- MANOVA SUMMARY TABLE -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 MANOVA Summary Table</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 15px;">Test Statistic</th>
                        <th style="padding: 15px;">Value</th>
                        <th style="padding: 15px;">F-value</th>
                        <th style="padding: 15px;">df₁</th>
                        <th style="padding: 15px;">df₂</th>
                        <th style="padding: 15px;">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Wilks' Lambda (Λ)</td>
                        <td style="text-align: center;">${wilksLambda.toFixed(6)}</td>
                        <td style="text-align: center;">${fStatistic.toFixed(4)}</td>
                        <td style="text-align: center;">${df1}</td>
                        <td style="text-align: center;">${df2}</td>
                        <td style="text-align: center;">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Pillai's Trace (V)</td>
                        <td style="text-align: center;" colspan="5">${pillaiTrace.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Hotelling's Trace (T²)</td>
                        <td style="text-align: center;" colspan="5">${hotellingTrace.toFixed(6)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Roy's Largest Root (θ)</td>
                        <td style="text-align: center;" colspan="5">${roysRoot.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- CONCLUSION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${rejectH0 ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'} margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0;">📌 Step 10: Statistical Decision</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>F-statistic:</strong> ${fStatistic.toFixed(6)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>Comparison:</strong> ${fStatistic > criticalValue ? 'F > Critical Value' : 'F < Critical Value'}
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3 style="margin-top: 0;">Decision Rule:</h3>
                <p>If p-value < α (${alpha}), we REJECT the null hypothesis.</p>
                <p>Here, p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <h3>Final Decision:</h3>
                <div style="font-size: 20px; font-weight: bold; margin: 15px 0;">
                    ${rejectH0 ? '✅ REJECT H₀' : '❌ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Interpretation:</h3>
                <p style="font-size: 16px; line-height: 1.6;">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group mean vectors differ across the dependent variables. ' +
                        'This means that the groups are significantly different when considering all dependent variables together.' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group mean vectors differ across the dependent variables. ' +
                        'This means that the groups are not significantly different when considering all dependent variables together.'}
                </p>
            </div>
        </div>
        
        <!-- FOLLOW-UP SECTION -->
        <div style="background: #e8f4f8; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #1a5490;">📌 What to Do After a Significant MANOVA?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <p>If MANOVA is significant, follow up with:</p>
                <ol style="line-height: 1.8;">
                    <li><strong>Separate ANOVAs</strong> for each dependent variable (with Bonferroni correction)</li>
                    <li><strong>Discriminant Analysis</strong> to identify which variables contribute most to group separation</li>
                    <li><strong>Post-hoc tests</strong> to determine which specific groups differ</li>
                </ol>
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px; margin-top: 15px;">
                    💡 <strong>Bonferroni Correction:</strong> α<sub>adjusted</sub> = α / p = ${alpha} / ${p} = ${(alpha/p).toFixed(4)}
                </div>
            </div>
        </div>
        
        <!-- ASSUMPTIONS SECTION -->
        <div style="background: #f0f4fa; border-radius: 20px; padding: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #1a5490;">⚠️ Important MANOVA Assumptions</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background: white; border-radius: 12px; padding: 15px;">
                    <strong>1. Multivariate Normality</strong>
                    <p style="font-size: 13px; margin-top: 8px;">The dependent variables should be multivariate normally distributed within groups.</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px;">
                    <strong>2. Homogeneity of Covariance Matrices</strong>
                    <p style="font-size: 13px; margin-top: 8px;">Variance-covariance matrices should be equal across groups (Box's M test).</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px;">
                    <strong>3. Independence of Observations</strong>
                    <p style="font-size: 13px; margin-top: 8px;">Observations should be independent of each other.</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px;">
                    <strong>4. No Multicollinearity</strong>
                    <p style="font-size: 13px; margin-top: 8px;">Dependent variables should be moderately correlated (not perfectly correlated).</p>
                </div>
            </div>
        </div>
    </div>`;
    
    return { wilksLambda, pillaiTrace, hotellingTrace, roysRoot, fStatistic, df1, df2, pValue, rejectH0, steps };
}
// Helper functions for matrix operations
function multiplyMatrices(A, B) {
    let result = Array(A.length).fill().map(() => Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            for (let k = 0; k < A[0].length; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}

// Returns the inverse, or null when the matrix is singular (callers must handle null)
function inverseMatrix(matrix) {
    const n = matrix.length;
    let augmented = matrix.map((row, i) => [...row, ...Array(n).fill().map((_, j) => i === j ? 1 : 0)]);
    
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) maxRow = k;
        }
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        let pivot = augmented[i][i];
        if (!isFinite(pivot) || Math.abs(pivot) < 1e-12) return null;   // singular (or numerically singular)
        for (let j = 0; j < 2 * n; j++) augmented[i][j] /= pivot;
        
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) augmented[k][j] -= factor * augmented[i][j];
            }
        }
    }
    
    return augmented.map(row => row.slice(n));
}

function computeEigenvalues(matrix) {
    // Eigenvalues (largest first) of a square matrix with real eigenvalues, such as B * W^-1 in MANOVA.
    const n = matrix.length;
    if (n === 1) return [matrix[0][0]];
    if (n === 2) {
        const [[a, b], [c, d]] = matrix;
        const trace = a + d, disc = Math.max(0, trace * trace - 4 * (a * d - b * c));
        return [(trace + Math.sqrt(disc)) / 2, (trace - Math.sqrt(disc)) / 2];
    }
    // Shifted QR iteration (Gram-Schmidt QR)
    let A = matrix.map(r => r.slice());
    for (let iter = 0; iter < 1000; iter++) {
        const mu = A[n - 1][n - 1];
        const M = A.map((r, i) => r.map((v, j) => v - (i === j ? mu : 0)));
        const Q = Array.from({ length: n }, () => new Array(n).fill(0));
        const R = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let j = 0; j < n; j++) {
            const v = M.map(r => r[j]);
            for (let i = 0; i < j; i++) {
                R[i][j] = Q.reduce((s, r, k) => s + r[i] * M[k][j], 0);
                for (let k = 0; k < n; k++) v[k] -= R[i][j] * Q[k][i];
            }
            R[j][j] = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
            for (let k = 0; k < n; k++) Q[k][j] = R[j][j] > 1e-300 ? v[k] / R[j][j] : 0;
        }
        A = R.map((r, i) => r.map((_, j) => r.reduce((s, _x, k) => s + R[i][k] * Q[k][j], 0) + (i === j ? mu : 0)));
        let off = 0;
        for (let i = 1; i < n; i++) for (let j = 0; j < i; j++) off += Math.abs(A[i][j]);
        if (off < 1e-12) break;
    }
    return A.map((r, i) => r[i]).sort((x, y) => y - x);
}

// ========== SETUP FUNCTIONS ==========
function setupANCOVALogic() {
    const computeBtn = document.getElementById("ancovaComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("ancovaData").value;
        const alpha = parseFloat(document.getElementById("ancovaAlpha").value);
        const resultDiv = document.getElementById("ancovaResultArea");
        const valueSpan = document.getElementById("ancovaValueDisplay");
        const stepsSpan = document.getElementById("ancovaStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format: Y, Group, Covariate";
            return;
        }
        
        const result = computeANCOVA(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `F = ${result.fStatistic.toFixed(4)} | df = (${result.dfBetween}, ${result.dfWithin}) | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("ancovaClearBtn", "ancovaData", "ancovaResultArea");
}

function setupMANOVALogic() {
    const computeBtn = document.getElementById("manovaComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("manovaData").value;
        const alpha = parseFloat(document.getElementById("manovaAlpha").value);
        const resultDiv = document.getElementById("manovaResultArea");
        const valueSpan = document.getElementById("manovaValueDisplay");
        const stepsSpan = document.getElementById("manovaStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format: Group, Y1, Y2, Y3, ...";
            return;
        }
        
        const result = computeMANOVA(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `Λ = ${result.wilksLambda.toFixed(4)} | F = ${result.fStatistic.toFixed(4)} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("manovaClearBtn", "manovaData", "manovaResultArea");
}
// ========== LEVENE'S TEST INTERFACE RENDER ==========
function renderLeveneInterface() {
    return `
        <div class="stat-interface" id="statLeveneInterface">
            <div class="interface-title">📊 Levene's Test (Homogeneity of Variance)</div>
            <div class="formula-card">
                <div class="formula">📌 Tests whether multiple groups have equal variances</div>
                <div class="desc">
                    <strong>What is Levene's Test?</strong><br>
                    Levene's test checks the assumption of homogeneity of variances across groups.
                    H₀: All group variances are equal | H₁: At least one group variance differs.
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data with group labels (format: value:group):</label>
                <textarea id="leveneData" rows="5" placeholder="Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> value:group (comma or space separated)
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="leveneAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="leveneComputeBtn">📊 Run Levene's Test + Full Steps</button>
                    <button class="secondary-btn" id="leveneClearBtn">Clear</button>
                </div>
            </div>
            <div id="leveneResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 LEVENE'S TEST RESULTS</div>
                    <div class="result-value" id="leveneValueDisplay">—</div>
                    <div class="calculation-steps" id="leveneStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== BARTLETT'S TEST INTERFACE RENDER ==========
function renderBartlettInterface() {
    return `
        <div class="stat-interface" id="statBartlettInterface">
            <div class="interface-title">📐 Bartlett's Test (Sphericity / Homogeneity of Variance)</div>
            <div class="formula-card">
                <div class="formula">📌 χ² = (N - k) ln(s²) - Σ(nⱼ - 1) ln(sⱼ²)</div>
                <div class="desc">
                    <strong>What is Bartlett's Test?</strong><br>
                    Bartlett's test checks the assumption of equal variances across groups.
                    H₀: All group variances are equal | H₁: At least one group variance differs.
                    <strong>Note:</strong> Assumes normality; sensitive to non-normality.
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data with group labels (format: value:group):</label>
                <textarea id="bartlettData" rows="5" placeholder="Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> value:group (comma or space separated)
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="bartlettAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="bartlettComputeBtn">📐 Run Bartlett's Test + Full Steps</button>
                    <button class="secondary-btn" id="bartlettClearBtn">Clear</button>
                </div>
            </div>
            <div id="bartlettResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 BARTLETT'S TEST RESULTS</div>
                    <div class="result-value" id="bartlettValueDisplay">—</div>
                    <div class="calculation-steps" id="bartlettStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== LEVENE'S TEST COMPUTATION ==========
// ========== LEVENE'S TEST COMPUTATION ==========
function computeLeveneTest(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = groupName.trim();
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Levene's test." };
    }
    
    // Calculate group means
    let groupMeans = new Map();
    let groupSizes = new Map();
    
    for (let [group, values] of groups) {
        let sum = values.reduce((a,b) => a+b, 0);
        let mean = sum / values.length;
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
    }
    
    let totalN = 0;
    for (let n of groupSizes.values()) totalN += n;
    let k = groups.size;
    
    // Calculate Zᵢⱼ = |Yᵢⱼ - Ȳⱼ| (absolute deviations from group mean)
    let zValues = new Map();
    let groupZMeans = new Map();
    let allZ = [];
    
    // Detailed calculations for Z-scores
    let zCalculationDetails = [];
    
    for (let [group, values] of groups) {
        let groupMean = groupMeans.get(group);
        let zs = [];
        let groupCalc = `<div style="margin-bottom: 20px;"><strong>Group ${group}:</strong> Mean = ${groupMean.toFixed(4)}<br>`;
        
        for (let v of values) {
            let z = Math.abs(v - groupMean);
            zs.push(z);
            allZ.push(z);
            groupCalc += `&nbsp;&nbsp;|${v} - ${groupMean.toFixed(4)}| = ${z.toFixed(4)}<br>`;
        }
        let zMean = zs.reduce((a,b) => a+b, 0) / zs.length;
        groupZMeans.set(group, zMean);
        zValues.set(group, zs);
        groupCalc += `<strong>Mean of absolute deviations (Z̄${group}) = ${zMean.toFixed(4)}</strong><br>`;
        groupCalc += `This represents the average "distance" from the group mean.<br>`;
        zCalculationDetails.push(groupCalc + `</div>`);
    }
    
    let grandZMean = allZ.reduce((a,b) => a+b, 0) / totalN;
    
    // Calculate SS Between and SS Within for Z
    let ssBetween = 0;
    let ssWithin = 0;
    let betweenDetails = [];
    let withinDetails = [];
    
    for (let [group, zs] of zValues) {
        let zMean = groupZMeans.get(group);
        let n = groupSizes.get(group);
        let betweenContrib = n * Math.pow(zMean - grandZMean, 2);
        ssBetween += betweenContrib;
        betweenDetails.push(`Group ${group}: ${n} × (${zMean.toFixed(4)} - ${grandZMean.toFixed(4)})² = ${betweenContrib.toFixed(4)}`);
        
        for (let z of zs) {
            let withinContrib = Math.pow(z - zMean, 2);
            ssWithin += withinContrib;
            withinDetails.push(`Group ${group}: (${z.toFixed(4)} - ${zMean.toFixed(4)})² = ${withinContrib.toFixed(4)}`);
        }
    }
    
    let dfBetween = k - 1;
    let dfWithin = totalN - k;
    let msBetween = ssBetween / dfBetween;
    let msWithin = ssWithin / dfWithin;
    let fStatistic = msBetween / msWithin;
    
    let criticalValue = fCriticalValue(alpha, dfBetween, dfWithin);
    let pValue = 1 - fCDF(fStatistic, dfBetween, dfWithin);
    let rejectH0 = fStatistic > criticalValue;
    
    // Build comprehensive educational HTML
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER WITH FORMULA -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📊 Levene's Test for Homogeneity of Variance</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">Tests whether multiple groups have EQUAL variances (an important assumption for ANOVA)</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> F = (SS<sub>Between</sub> / df<sub>Between</sub>) / (SS<sub>Within</sub> / df<sub>Within</sub>)
            </div>
            <p style="margin-top: 12px; font-size: 14px;">
                <strong>H₀ (Null Hypothesis):</strong> σ₁² = σ₂² = ... = σ<sub>k</sub>² (All group variances are equal)<br>
                <strong>H₁ (Alternative):</strong> At least one group variance is different
            </p>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION SECTION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 What is Levene's Test and Why Do We Need It?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 The Big Picture</h3>
                <p>Imagine you're comparing test scores from three different teaching methods. Before you can trust your ANOVA results, you need to check if the <strong>spread (variance)</strong> of scores is similar across all methods.</p>
                <ul style="margin-top: 10px;">
                    <li><strong>Equal variances</strong> → ANOVA is valid and trustworthy</li>
                    <li><strong>Unequal variances</strong> → ANOVA results may be misleading</li>
                </ul>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px; margin-top: 10px;">
                    💡 <strong>Think of it this way:</strong> If one teaching method produces very consistent scores (small spread) while another produces wildly varying scores (large spread), we can't fairly compare their averages!
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How Levene's Test Works - The Intuition</h3>
                <p>Instead of comparing the original data directly, Levene's test transforms the data by calculating:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; margin: 15px 0;">
                    <strong>Zᵢⱼ = |Yᵢⱼ - Ȳⱼ|</strong>
                </div>
                <p>This means: For each value, we measure how FAR it is from its group mean (absolute deviation).</p>
                <p><strong>Key Insight:</strong> If groups have similar variances, their average absolute deviations should also be similar. If one group has much larger absolute deviations on average, that indicates larger variance!</p>
                <p>Then we run an ANOVA on these Z-values to see if the group means of absolute deviations differ significantly.</p>
            </div>
        </div>
        
        <!-- 📊 INPUT DATA SECTION -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📋 Step 1: Input Data Summary</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Group</th>
                        <th style="padding: 12px;">Sample Size (n)</th>
                        <th style="padding: 12px;">Values</th>
                        <th style="padding: 12px;">Group Mean (Ȳⱼ)</th>
                    </tr></thead>
                    <tbody>
                        ${Array.from(groups.entries()).map(([group, values]) => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${group}</td>
                            <td style="padding: 10px; text-align: center;">${values.length}</td>
                            <td style="padding: 10px;">${values.join(', ')}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${groupMeans.get(group).toFixed(4)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Degrees of freedom (between) = ${dfBetween} | Degrees of freedom (within) = ${dfWithin}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE ABSOLUTE DEVIATIONS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate Absolute Deviations Zᵢⱼ = |Yᵢⱼ - Ȳⱼ|</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <strong>💡 Why do we do this?</strong> We transform each value into a "distance from its group mean." This converts the problem of comparing VARIANCES into comparing MEANS of these distances.
            </div>
            ${zCalculationDetails.join('')}
            <div style="background: white; border-radius: 12px; padding: 15px; margin-top: 15px;">
                <strong>Grand Mean of all Z-values (Z̄):</strong> ${grandZMean.toFixed(6)}<br>
                <span style="font-size: 13px; color: #666;">This is the overall average distance from group means across ALL observations.</span>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: CALCULATE SUM OF SQUARES -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Calculate Between-Group and Within-Group Sum of Squares</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Between-Group Sum of Squares (SS<sub>Between</sub>)</h3>
                <p>Measures how much each group's mean of Z-values deviates from the grand mean.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                    <strong>Formula:</strong> SS<sub>Between</sub> = Σ nⱼ × (Z̄ⱼ - Z̄)²
                </div>
                ${betweenDetails.map(d => `<div style="margin: 8px 0;">• ${d}</div>`).join('')}
                <div style="margin-top: 12px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>Between</sub> = ${ssBetween.toFixed(4)}</strong>
                </div>
                <p style="margin-top: 10px; font-size: 13px;">📌 <strong>Interpretation:</strong> A large SS<sub>Between</sub> means the groups have very different average absolute deviations → evidence of unequal variances.</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">📊 Within-Group Sum of Squares (SS<sub>Within</sub>)</h3>
                <p>Measures how much individual Z-values vary within each group.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                    <strong>Formula:</strong> SS<sub>Within</sub> = Σ Σ (Zᵢⱼ - Z̄ⱼ)²
                </div>
                ${withinDetails.slice(0, 10).map(d => `<div style="margin: 5px 0; font-size: 12px;">• ${d}</div>`).join('')}
                ${withinDetails.length > 10 ? `<div style="margin: 5px 0;">... and ${withinDetails.length - 10} more calculations</div>` : ''}
                <div style="margin-top: 12px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>Within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
                <p style="margin-top: 10px; font-size: 13px;">📌 <strong>Interpretation:</strong> This is the "noise" or random variation within groups. We compare it to the between-group variation.</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE MEAN SQUARES -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Calculate Mean Squares (MS)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Mean Square Between (MS<sub>Between</sub>)</h3>
                <div style="font-family: monospace; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    MS<sub>Between</sub> = SS<sub>Between</sub> / df<sub>Between</sub><br>
                    = ${ssBetween.toFixed(4)} / ${dfBetween}<br>
                    = <strong style="color: #1a5490;">${msBetween.toFixed(6)}</strong>
                </div>
                <p style="margin-top: 8px; font-size: 13px;">This represents the AVERAGE variability BETWEEN groups (the "signal").</p>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">📊 Mean Square Within (MS<sub>Within</sub>)</h3>
                <div style="font-family: monospace; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    MS<sub>Within</sub> = SS<sub>Within</sub> / df<sub>Within</sub><br>
                    = ${ssWithin.toFixed(4)} / ${dfWithin}<br>
                    = <strong style="color: #1a5490;">${msWithin.toFixed(6)}</strong>
                </div>
                <p style="margin-top: 8px; font-size: 13px;">This represents the AVERAGE variability WITHIN groups (the "noise").</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 5: CALCULATE F-STATISTIC -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 5: Calculate the F-Statistic</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="text-align: center; font-size: 18px; margin-bottom: 15px;">
                    <strong>F = MS<sub>Between</sub> / MS<sub>Within</sub></strong>
                </div>
                <div style="font-family: monospace; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    F = ${msBetween.toFixed(6)} / ${msWithin.toFixed(6)}<br>
                    <div style="font-size: 24px; font-weight: bold; color: #1a5490; margin-top: 10px;">
                        F = ${fStatistic.toFixed(8)}
                    </div>
                </div>
                <p style="margin-top: 15px; font-size: 14px;">
                    <strong>📌 Understanding the F-statistic:</strong><br>
                    • If F is close to 1 → Signal ≈ Noise → Groups have similar variances<br>
                    • If F is large (> 1) → Signal > Noise → Groups have different variances<br>
                    • We compare F to a critical value from the F-distribution
                </p>
            </div>
        </div>
        
        <!-- 📊 STEP 6: RESULTS TABLE -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Levene's Test Summary Table</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Source</th>
                        <th style="padding: 12px;">Sum of Squares (SS)</th>
                        <th style="padding: 12px;">df</th>
                        <th style="padding: 12px;">Mean Square (MS)</th>
                        <th style="padding: 12px;">F</th>
                        <th style="padding: 12px;">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Between Groups</td>
                        <td style="text-align: center;">${ssBetween.toFixed(4)}</td>
                        <td style="text-align: center;">${dfBetween}</td>
                        <td style="text-align: center;">${msBetween.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle; font-weight: bold; font-size: 22px;">${fStatistic.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle; font-weight: bold;">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Within Groups (Error)</td>
                        <td style="text-align: center;">${ssWithin.toFixed(4)}</td>
                        <td style="text-align: center;">${dfWithin}</td>
                        <td style="text-align: center;">${msWithin.toFixed(4)}</td>
                    </tr>
                    <tr style="background: #e9ecef;">
                        <td style="padding: 12px; font-weight: bold;">Total</td>
                        <td style="text-align: center;">${(ssBetween + ssWithin).toFixed(4)}</td>
                        <td style="text-align: center;">${totalN - 1}</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 DECISION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${rejectH0 ? 'background: #f8d7da; border-left: 8px solid #dc3545;' : 'background: #d4edda; border-left: 8px solid #28a745;'} margin-bottom: 30px;">
            <h2 style="margin-top: 0;">📌 Step 6: Statistical Decision</h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>F-statistic:</strong> ${fStatistic.toFixed(6)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(6)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>p-value:</strong> ${pValue.toFixed(8)}
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>Comparison:</strong> ${fStatistic > criticalValue ? 'F > Critical Value' : 'F < Critical Value'}
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>If p-value < α (${alpha}), we REJECT the null hypothesis.</p>
                <p>Here, p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <div style="font-size: 24px; font-weight: bold; margin: 15px 0; text-align: center;">
                    ${rejectH0 ? '❌ REJECT H₀' : '✅ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Conclusion:</h3>
                <p style="font-size: 16px;">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group variances are NOT equal. ' +
                        'The homogeneity of variance assumption is VIOLATED. Consider using Welch\'s ANOVA or a non-parametric alternative (Kruskal-Wallis test).' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group variances differ. ' +
                        'The homogeneity of variance assumption is SATISFIED. You can proceed with standard ANOVA.'}
                </p>
            </div>
        </div>
        
        <!-- 💡 VISUAL INTERPRETATION -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">💡 Visual Interpretation: What Does This Mean?</h2>
            
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px; margin-top: 20px;">
                <div style="flex: 1; min-width: 200px; background: white; border-radius: 15px; padding: 20px; text-align: center;">
                    <div style="font-size: 48px;">📊</div>
                    <h3>F-Statistic Scale</h3>
                    <div style="height: 10px; background: linear-gradient(to right, #28a745, #ffc107, #dc3545); border-radius: 5px; margin: 15px 0;"></div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>F ≈ 1</span>
                        <span>F > Critical</span>
                    </div>
                    <div style="margin-top: 15px; font-weight: bold; font-size: 20px; color: ${rejectH0 ? '#dc3545' : '#28a745'}">
                        ${rejectH0 ? 'F = ' + fStatistic.toFixed(2) + ' → Large' : 'F = ' + fStatistic.toFixed(2) + ' → Small'}
                    </div>
                </div>
                
                <div style="flex: 2; background: white; border-radius: 15px; padding: 20px;">
                    <h3>📖 Real-World Interpretation</h3>
                    ${rejectH0 ? `
                        <p><strong>🔴 Unequal Variances Detected:</strong> The spread/spread of your data differs significantly across groups.</p>
                        <p><strong>Example:</strong> If Group A's scores range from 80-85 (tight spread) and Group B's scores range from 60-100 (wide spread), they have unequal variances.</p>
                        <p><strong>What to do next:</strong> Use Welch's ANOVA or transform your data (e.g., log transformation) to stabilize variances.</p>
                    ` : `
                        <p><strong>🟢 Equal Variances Assumption Met:</strong> The spread of your data is similar across all groups.</p>
                        <p><strong>Example:</strong> If all groups have roughly the same range of scores (e.g., all range from 70-90), variances are equal.</p>
                        <p><strong>What to do next:</strong> You can confidently use standard ANOVA to compare group means!</p>
                    `}
                </div>
            </div>
        </div>
    </div>`;
    
    return { fStatistic, dfBetween, dfWithin, pValue, rejectH0, steps };
}

// ========== BARTLETT'S TEST COMPUTATION ==========
// ========== BARTLETT'S TEST COMPUTATION ==========
function computeBartlettTest(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = groupName.trim();
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Bartlett's test." };
    }
    
    let groupVars = new Map();
    let groupSizes = new Map();
    let groupMeans = new Map();
    let totalN = 0;
    
    // Detailed variance calculations
    let varianceDetails = [];
    
    for (let [group, values] of groups) {
        let n = values.length;
        let mean = values.reduce((a,b) => a+b, 0) / n;
        groupMeans.set(group, mean);
        
        // Calculate variance with detailed steps
        let squaredDiffs = [];
        for (let v of values) {
            let diff = v - mean;
            squaredDiffs.push(diff * diff);
        }
        let sumSqDiffs = squaredDiffs.reduce((a,b) => a+b, 0);
        let variance = sumSqDiffs / (n - 1);
        
        groupVars.set(group, variance);
        groupSizes.set(group, n);
        totalN += n;
        
        varianceDetails.push(`
            <div style="background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                <strong style="color: #1a5490;">Group ${group}</strong> (n = ${n})<br>
                Mean = ${mean.toFixed(4)}<br>
                Squared deviations: ${squaredDiffs.map((d, i) => `(${values[i]} - ${mean.toFixed(4)})² = ${d.toFixed(4)}`).join(', ')}<br>
                Σ(x - x̄)² = ${sumSqDiffs.toFixed(4)}<br>
                <strong>Variance (s²) = ${sumSqDiffs.toFixed(4)} / ${n-1} = ${variance.toFixed(6)}</strong>
            </div>
        `);
    }
    
    let k = groups.size;
    
    // Calculate pooled variance
    let numerator = 0;
    let denominator = 0;
    let pooledDetails = [];
    
    for (let [group, n] of groupSizes) {
        let variance = groupVars.get(group);
        let term = (n - 1) * variance;
        numerator += term;
        denominator += (n - 1);
        pooledDetails.push(`(${n}-1) × ${variance.toFixed(4)} = ${term.toFixed(4)}`);
    }
    let pooledVar = numerator / denominator;
    
    // Calculate Bartlett's chi-square statistic
    let term1 = (totalN - k) * Math.log(pooledVar);
    let term2 = 0;
    let term2Details = [];
    
    for (let [group, n] of groupSizes) {
        let variance = groupVars.get(group);
        let term = (n - 1) * Math.log(variance);
        term2 += term;
        term2Details.push(`(${n}-1) × ln(${variance.toFixed(4)}) = ${term.toFixed(4)}`);
    }
    let chiSquare = term1 - term2;
    
    // Correction factor
    let sumInv = Array.from(groupSizes.values()).reduce((sum, n) => sum + 1/(n-1), 0);
    let C = 1 + (1 / (3 * (k - 1))) * (sumInv - 1/(totalN - k));
    let chiSquareAdj = chiSquare / C;
    
    let df = k - 1;
    let criticalValue = chiSquareCriticalValue(alpha, df);
    let pValue = 1 - chiSquareCDF(chiSquareAdj, df);
    let rejectH0 = chiSquareAdj > criticalValue;
    
    // Build comprehensive educational HTML
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📐 Bartlett's Test for Homogeneity of Variance</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">A parametric test to check if multiple groups have EQUAL variances</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> χ² = (N - k) ln(s²) - Σ(nⱼ - 1) ln(sⱼ²)
            </div>
            <p style="margin-top: 12px; font-size: 14px;">
                <strong>H₀ (Null Hypothesis):</strong> σ₁² = σ₂² = ... = σ<sub>k</sub>² (All group variances are equal)<br>
                <strong>H₁ (Alternative):</strong> At least one group variance is different
            </p>
            <div style="margin-top: 10px; background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 8px; font-size: 13px;">
                ⚠️ <strong>Important Assumption:</strong> Bartlett's test assumes the data is NORMALLY distributed. If normality is violated, use Levene's test instead.
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 Understanding Bartlett's Test</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 What Problem Does It Solve?</h3>
                <p>Before comparing group means (using ANOVA), we must check if the variances are equal. Unequal variances can lead to:</p>
                <ul>
                    <li>Increased Type I error (false positives)</li>
                    <li>Reduced statistical power</li>
                    <li>Invalid confidence intervals</li>
                </ul>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px; margin-top: 10px;">
                    💡 <strong>Think of it like this:</strong> Imagine comparing three basketball players' scoring averages. If one player scores consistently (low variance) while another is inconsistent (high variance), their averages might not be comparable!
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How Bartlett's Test Works</h3>
                <p>Bartlett's test uses the ratio of the <strong>pooled variance</strong> to the individual group variances:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; margin: 15px 0;">
                    <strong>χ² = (N - k) ln(s²) - Σ(nⱼ - 1) ln(sⱼ²)</strong>
                </div>
                <p>Where:</p>
                <ul>
                    <li><strong>s²</strong> = Pooled variance (weighted average of group variances)</li>
                    <li><strong>sⱼ²</strong> = Variance of group j</li>
                    <li><strong>nⱼ</strong> = Sample size of group j</li>
                    <li><strong>N</strong> = Total sample size</li>
                    <li><strong>k</strong> = Number of groups</li>
                </ul>
                <p><strong>Key Insight:</strong> If all variances are equal, the test statistic will be small. Large values indicate unequal variances.</p>
            </div>
        </div>
        
        <!-- 📊 STEP 1: INPUT DATA -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📋 Step 1: Input Data Summary</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Group</th>
                        <th style="padding: 12px;">n</th>
                        <th style="padding: 12px;">Values</th>
                        <th style="padding: 12px;">Mean</th>
                    </tr></thead>
                    <tbody>
                        ${Array.from(groups.entries()).map(([group, values]) => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${group}</td>
                            <td style="padding: 10px; text-align: center;">${values.length}</td>
                            <td style="padding: 10px;">${values.join(', ')}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8;">${groupMeans.get(group).toFixed(4)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Degrees of freedom (df) = ${df}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE GROUP VARIANCES -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate Each Group's Variance (sⱼ²)</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <strong>💡 What is Variance?</strong> Variance measures how spread out the data is. A small variance means values are close to the mean; a large variance means they're widely scattered.
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>Formula:</strong> s² = Σ(x - x̄)² / (n - 1)
                ${varianceDetails.join('')}
            </div>
        </div>
        
        <!-- 🔢 STEP 3: CALCULATE POOLED VARIANCE -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Calculate Pooled Variance (s²)</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <strong>💡 What is Pooled Variance?</strong> It's a weighted average of all group variances. Think of it as the "overall" variance assuming all groups have the same underlying variance.
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>Formula:</strong> s² = Σ(nⱼ - 1) × sⱼ² / Σ(nⱼ - 1)<br><br>
                Numerator: ${pooledDetails.join(' + ')} = ${numerator.toFixed(4)}<br>
                Denominator: ${denominator}<br>
                <div style="margin-top: 10px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>Pooled Variance (s²) = ${pooledVar.toFixed(6)}</strong>
                </div>
                <p style="margin-top: 10px; font-size: 13px;">📌 This is our estimate of the common variance if H₀ (equal variances) were true.</p>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE BARTLETT'S STATISTIC -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Calculate Bartlett's χ² Statistic</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Part A: Calculate (N - k) × ln(s²)</h3>
                <div style="font-family: monospace;">
                    N - k = ${totalN} - ${k} = ${totalN - k}<br>
                    ln(s²) = ln(${pooledVar.toFixed(6)}) = ${Math.log(pooledVar).toFixed(6)}<br>
                    <strong>Term A = ${totalN - k} × ${Math.log(pooledVar).toFixed(6)} = ${term1.toFixed(6)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Part B: Calculate Σ(nⱼ - 1) × ln(sⱼ²)</h3>
                ${term2Details.map(d => `<div style="margin: 5px 0;">• ${d}</div>`).join('')}
                <div style="margin-top: 10px;"><strong>Term B = ${term2.toFixed(6)}</strong></div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Part C: Calculate χ² = Term A - Term B</h3>
                <div style="font-family: monospace; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    χ² = ${term1.toFixed(6)} - ${term2.toFixed(6)} = <strong style="color: #1a5490;">${chiSquare.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 5: APPLY CORRECTION FACTOR -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 5: Apply Correction Factor for Small Samples</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <strong>💡 Why a correction?</strong> Bartlett's test is biased for small samples. The correction factor adjusts the statistic to be more accurate.
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>Formula:</strong> C = 1 + [1/(3(k-1))] × [Σ 1/(nⱼ-1) - 1/(N-k)]<br><br>
                Σ 1/(nⱼ-1) = ${Array.from(groupSizes.values()).map(n => `1/(${n}-1) = ${(1/(n-1)).toFixed(4)}`).join(' + ')} = ${sumInv.toFixed(6)}<br>
                1/(N-k) = 1/(${totalN}-${k}) = ${(1/(totalN - k)).toFixed(6)}<br>
                Σ 1/(nⱼ-1) - 1/(N-k) = ${sumInv.toFixed(6)} - ${(1/(totalN - k)).toFixed(6)} = ${(sumInv - 1/(totalN - k)).toFixed(6)}<br>
                1/(3(k-1)) = 1/(3×${k-1}) = ${(1/(3*(k-1))).toFixed(6)}<br>
                <div style="margin-top: 10px;">
                    <strong>C = 1 + ${(1/(3*(k-1))).toFixed(6)} × ${(sumInv - 1/(totalN - k)).toFixed(6)} = ${C.toFixed(6)}</strong>
                </div>
                <div style="margin-top: 10px;">
                    <strong>Corrected χ² = χ² / C = ${chiSquare.toFixed(6)} / ${C.toFixed(6)} = <span style="color: #1a5490; font-size: 18px;">${chiSquareAdj.toFixed(6)}</span></strong>
                </div>
            </div>
        </div>
        
        <!-- 📊 STEP 6: RESULTS TABLE -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Bartlett's Test Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Statistic</th>
                        <th style="padding: 12px;">Value</th>
                        <th style="padding: 12px;">Interpretation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="padding: 12px;">χ² (uncorrected)</td><td style="text-align: center;">${chiSquare.toFixed(6)}</td><td>Raw test statistic</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 12px;">Correction Factor (C)</td><td style="text-align: center;">${C.toFixed(6)}</td><td>Small sample adjustment</td></tr>
                    <tr><td style="padding: 12px;"><strong>χ² (corrected)</strong></td><td style="text-align: center;"><strong>${chiSquareAdj.toFixed(6)}</strong></td><td>Final test statistic</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 12px;">Degrees of Freedom (df)</td><td style="text-align: center;">${df}</td><td>df = k - 1 = ${k} - 1</td></tr>
                    <tr><td style="padding: 12px;">Critical Value (α = ${alpha})</td><td style="text-align: center;">${criticalValue.toFixed(6)}</td><td>From χ² distribution table</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 12px;">p-value</td><td style="text-align: center;">${pValue.toFixed(8)}</td><td>Probability of observing this result if H₀ is true</td></tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 DECISION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${rejectH0 ? 'background: #f8d7da; border-left: 8px solid #dc3545;' : 'background: #d4edda; border-left: 8px solid #28a745;'} margin-bottom: 30px;">
            <h2 style="margin-top: 0;">📌 Step 6: Statistical Decision</h2>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>If χ² > Critical Value OR p-value < α, we REJECT the null hypothesis.</p>
                <p>Here, χ² = ${chiSquareAdj.toFixed(6)} ${chiSquareAdj > criticalValue ? '>' : '<'} ${criticalValue.toFixed(6)}</p>
                <p>p-value = ${pValue.toFixed(6)} ${pValue < alpha ? '<' : '>'} ${alpha}</p>
                
                <div style="font-size: 24px; font-weight: bold; margin: 15px 0; text-align: center;">
                    ${rejectH0 ? '❌ REJECT H₀' : '✅ FAIL TO REJECT H₀'}
                </div>
                
                <h3>Conclusion:</h3>
                <p style="font-size: 16px;">
                    ${rejectH0 ? 
                        'There is <strong>SUFFICIENT EVIDENCE</strong> to conclude that the group variances are NOT equal. ' +
                        'The homogeneity of variance assumption is VIOLATED. Consider using Welch\'s ANOVA or transforming your data.' : 
                        'There is <strong>NOT SUFFICIENT EVIDENCE</strong> to conclude that the group variances differ. ' +
                        'The homogeneity of variance assumption is SATISFIED. You can proceed with standard ANOVA.'}
                </p>
            </div>
        </div>
        
        <!-- 📊 VISUAL COMPARISON: BARTLETT'S VS LEVENE'S -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📊 Which Test Should You Use?</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="color: #28a745;">✅ Use Bartlett's Test When:</h3>
                    <ul style="margin-bottom: 0;">
                        <li>Data is <strong>normally distributed</strong></li>
                        <li>Sample sizes are <strong>equal or large</strong></li>
                        <li>You want the <strong>most powerful test</strong> (when assumptions are met)</li>
                    </ul>
                </div>
                
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="color: #ffc107;">⚠️ Use Levene's Test When:</h3>
                    <ul style="margin-bottom: 0;">
                        <li>Data is <strong>not normally distributed</strong></li>
                        <li>You have <strong>small sample sizes</strong></li>
                        <li>You want a <strong>robust test</strong> that's less sensitive to outliers</li>
                    </ul>
                </div>
            </div>
            
            <div style="margin-top: 20px; background: #e8f4f8; padding: 15px; border-radius: 12px;">
                <strong>💡 Pro Tip:</strong> If you're unsure about normality, run BOTH tests. If they agree, you can be confident in your conclusion. If they disagree, examine your data for outliers or non-normality.
            </div>
        </div>
    </div>`;
    
    return { chiSquare: chiSquareAdj, df, pValue, rejectH0, steps };
}

// ========== SETUP FUNCTIONS ==========
function setupLeveneLogic() {
    const computeBtn = document.getElementById("leveneComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("leveneData").value;
        const alpha = parseFloat(document.getElementById("leveneAlpha").value);
        const resultDiv = document.getElementById("leveneResultArea");
        const valueSpan = document.getElementById("leveneValueDisplay");
        const stepsSpan = document.getElementById("leveneStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format 'value:group'";
            return;
        }
        
        const result = computeLeveneTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `F = ${result.fStatistic.toFixed(4)} | df = (${result.dfBetween}, ${result.dfWithin}) | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("leveneClearBtn", "leveneData", "leveneResultArea");
}

function setupBartlettLogic() {
    const computeBtn = document.getElementById("bartlettComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("bartlettData").value;
        const alpha = parseFloat(document.getElementById("bartlettAlpha").value);
        const resultDiv = document.getElementById("bartlettResultArea");
        const valueSpan = document.getElementById("bartlettValueDisplay");
        const stepsSpan = document.getElementById("bartlettStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format 'value:group'";
            return;
        }
        
        const result = computeBartlettTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `χ² = ${result.chiSquare.toFixed(4)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("bartlettClearBtn", "bartlettData", "bartlettResultArea");
}
// ========== DURBIN-WATSON STATISTIC INTERFACE ==========
function renderDurbinWatsonInterface() {
    return `
        <div class="stat-interface" id="statDurbinWatsonInterface">
            <div class="interface-title">🔄 Durbin-Watson Statistic (Autocorrelation)</div>
            <div class="formula-card">
                <div class="formula">📌 d = Σ(eᵢ - eᵢ₋₁)² / Σeᵢ²</div>
                <div class="desc">
                    <strong>What is the Durbin-Watson statistic?</strong><br>
                    Tests for first-order autocorrelation in regression residuals.
                    <br><br>
                    <strong>Interpretation:</strong><br>
                    • d ≈ 2 → No autocorrelation<br>
                    • d < 2 → Positive autocorrelation<br>
                    • d > 2 → Negative autocorrelation
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter residuals from regression model (comma, space, or line separated):</label>
                <textarea id="dwResiduals" rows="4" placeholder="Example: 0.5, -0.3, 0.2, -0.1, 0.4, -0.2, 0.1, -0.4"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    Residuals = Observed - Predicted values from your regression model
                </div>
                <div class="action-row">
                    <button class="primary-btn" id="dwComputeBtn">🔄 Calculate Durbin-Watson + Full Steps</button>
                    <button class="secondary-btn" id="dwClearBtn">Clear</button>
                </div>
            </div>
            <div id="dwResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 DURBIN-WATSON RESULTS</div>
                    <div class="result-value" id="dwValueDisplay">—</div>
                    <div class="calculation-steps" id="dwStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== VARIANCE INFLATION FACTOR (VIF) INTERFACE ==========
function renderVIFInterface() {
    return `
        <div class="stat-interface" id="statVIFInterface">
            <div class="interface-title">📊 Variance Inflation Factor (Multicollinearity)</div>
            <div class="formula-card">
                <div class="formula">📌 VIFⱼ = 1 / (1 - Rⱼ²)</div>
                <div class="desc">
                    <strong>What is VIF?</strong><br>
                    Measures how much the variance of a regression coefficient is inflated due to multicollinearity.
                    <br><br>
                    <strong>Interpretation:</strong><br>
                    • VIF = 1 → No correlation with other predictors<br>
                    • 1 < VIF < 5 → Moderate correlation<br>
                    • VIF ≥ 5 → High correlation (problematic)<br>
                    • VIF ≥ 10 → Severe multicollinearity
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data (each column = one predictor variable, comma-separated):</label>
                <textarea id="vifData" rows="6" placeholder="Example (X1, X2, X3, ...):&#10;1, 4, 7&#10;2, 5, 8&#10;3, 6, 9&#10;4, 7, 10&#10;5, 8, 11"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    Each row represents one observation. Columns are predictor variables.
                </div>
                <div class="action-row">
                    <button class="primary-btn" id="vifComputeBtn">📊 Calculate VIF + Full Steps</button>
                    <button class="secondary-btn" id="vifClearBtn">Clear</button>
                </div>
            </div>
            <div id="vifResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 VARIANCE INFLATION FACTOR RESULTS</div>
                    <div class="result-value" id="vifValueDisplay">—</div>
                    <div class="calculation-steps" id="vifStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== COOK'S DISTANCE INTERFACE ==========
function renderCooksDistanceInterface() {
    return `
        <div class="stat-interface" id="statCooksDistanceInterface">
            <div class="interface-title">🔥 Cook's Distance (Influential Observations)</div>
            <div class="formula-card">
                <div class="formula">📌 Dᵢ = (ŷ - ŷ₍ᵢ₎)'(ŷ - ŷ₍ᵢ₎) / (p × MSE)</div>
                <div class="desc">
                    <strong>What is Cook's Distance?</strong><br>
                    Measures how influential each observation is on the regression model.
                    <br><br>
                    <strong>Interpretation:</strong><br>
                    • Dᵢ < 0.5 → Not influential<br>
                    • 0.5 ≤ Dᵢ < 1 → Moderately influential (investigate)<br>
                    • Dᵢ ≥ 1 → Highly influential (needs attention)
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (predictor):</label>
                <textarea id="cooksXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter Y values (outcome):</label>
                <textarea id="cooksYInput" rows="3" placeholder="Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="cooksComputeBtn">🔥 Calculate Cook's Distance + Full Steps</button>
                    <button class="secondary-btn" id="cooksClearBtn">Clear All</button>
                </div>
            </div>
            <div id="cooksResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 COOK'S DISTANCE RESULTS</div>
                    <div class="result-value" id="cooksValueDisplay">—</div>
                    <div class="calculation-steps" id="cooksStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== DURBIN-WATSON COMPUTATION (PROFESSIONAL VERSION) ==========
function computeDurbinWatson(residuals) {
    if (!residuals.length || residuals.length < 2) {
        return { error: true, message: "Need at least 2 residuals for Durbin-Watson test." };
    }
    
    const n = residuals.length;
    let numerator = 0;
    let denominator = 0;
    let diffTable = [];
    let squaredResTable = [];
    
    // Build difference table
    for (let i = 1; i < n; i++) {
        const et = residuals[i];
        const et_1 = residuals[i-1];
        const diff = et - et_1;
        const sqDiff = diff * diff;
        numerator += sqDiff;
        diffTable.push({ t: i, e_t: et, e_t_1: et_1, diff: diff, sqDiff: sqDiff });
    }
    
    // Build squared residuals table
    for (let i = 0; i < n; i++) {
        const sq = residuals[i] * residuals[i];
        denominator += sq;
        squaredResTable.push({ t: i+1, e_t: residuals[i], e_t_sq: sq });
    }
    
    const durbinWatson = numerator / denominator;
    
    // Determine interpretation with precise boundaries
    let interpretation = "";
    let severity = "";
    let severityColor = "";
    if (durbinWatson > 1.5 && durbinWatson < 2.5) {
        interpretation = "No significant autocorrelation";
        severity = "ACCEPTABLE";
        severityColor = "#28a745";
    } else if (durbinWatson <= 1.5 && durbinWatson > 1) {
        interpretation = "Mild positive autocorrelation";
        severity = "CAUTION";
        severityColor = "#ffc107";
    } else if (durbinWatson <= 1) {
        interpretation = "Strong positive autocorrelation";
        severity = "PROBLEMATIC";
        severityColor = "#dc3545";
    } else if (durbinWatson >= 2.5 && durbinWatson < 3) {
        interpretation = "Mild negative autocorrelation";
        severity = "CAUTION";
        severityColor = "#ffc107";
    } else if (durbinWatson >= 3) {
        interpretation = "Strong negative autocorrelation";
        severity = "PROBLEMATIC";
        severityColor = "#dc3545";
    }
    
    // Build HTML table rows for differences
    let diffRows = '';
    for (let row of diffTable) {
        diffRows += `
        <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px; text-align: center; font-weight: 500;">${row.t}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace;">${row.e_t.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace;">${row.e_t_1.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace; color: #dc3545;">${row.diff.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; background: #fff3cd; font-weight: 600; font-family: monospace;">${row.sqDiff.toFixed(6)}</td>
        </tr>`;
    }
    
    // Build HTML table rows for squared residuals
    let sqResRows = '';
    for (let row of squaredResTable) {
        sqResRows += `
        <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px; text-align: center; font-weight: 500;">${row.t}</td>
            <td style="padding: 12px; text-align: center; font-family: monospace;">${row.e_t.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; background: #d4edda; font-weight: 600; font-family: monospace;">${row.e_t_sq.toFixed(6)}</td>
        </tr>`;
    }
    
    // Build complete HTML
    let steps = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 100%;">
        
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #0d3b66 0%, #1a5490 100%); color: white; padding: 25px 30px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div>
                    <h1 style="margin: 0; font-size: 28px;">🔄 Durbin-Watson Statistic</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Testing for First-Order Autocorrelation in Regression Residuals</p>
                </div>
                <div style="background: rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 11px; opacity: 0.8; letter-spacing: 1px;">TEST STATISTIC</div>
                    <div style="font-size: 42px; font-weight: 700;">${durbinWatson.toFixed(4)}</div>
                </div>
            </div>
        </div>
        
        <!-- FORMULA CARD -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #1a5490;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📐 Mathematical Formula</h3>
            <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; font-family: monospace; font-size: 18px;">
                <strong>d = \\(\\frac{\\sum_{t=2}^{n} (e_t - e_{t-1})^2}{\\sum_{t=1}^{n} e_t^2}\\)</strong>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 15px; border-radius: 8px;">
                <strong>📖 Where:</strong><br>
                • e<sub>t</sub> = Residual at time t<br>
                • e<sub>t-1</sub> = Residual at previous time period<br>
                • n = Number of observations (${n})<br>
                • d = 2 → No autocorrelation | d < 2 → Positive | d > 2 → Negative
            </div>
        </div>
        
        <!-- STEP 1: DIFFERENCES TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📊 Step 1: Calculate Differences (e<sub>t</sub> - e<sub>t-1</sub>) and Squared Differences</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px; text-align: center;">Time (t)</th>
                        <th style="padding: 12px; text-align: center;">e<sub>t</sub></th>
                        <th style="padding: 12px; text-align: center;">e<sub>t-1</sub></th>
                        <th style="padding: 12px; text-align: center;">Difference = e<sub>t</sub> - e<sub>t-1</sub></th>
                        <th style="padding: 12px; text-align: center;">(Difference)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${diffRows}
                    <tr style="background: #e8f4f8; font-weight: 700; border-top: 2px solid #1a5490;">
                        <td colspan="4" style="padding: 12px; text-align: right;">Σ (e<sub>t</sub> - e<sub>t-1</sub>)² →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white; font-size: 16px;">${numerator.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 2: SQUARED RESIDUALS TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📊 Step 2: Calculate Squared Residuals (e<sub>t</sub>²)</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px; text-align: center;">Time (t)</th>
                        <th style="padding: 12px; text-align: center;">e<sub>t</sub></th>
                        <th style="padding: 12px; text-align: center;">e<sub>t</sub>²</th>
                    </tr>
                </thead>
                <tbody>
                    ${sqResRows}
                    <tr style="background: #e8f4f8; font-weight: 700; border-top: 2px solid #1a5490;">
                        <td colspan="2" style="padding: 12px; text-align: right;">Σ e<sub>t</sub>² →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white; font-size: 16px;">${denominator.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 3: FINAL CALCULATION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 25px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 20px 0; color: #1a5490;">🔢 Step 3: Calculate Durbin-Watson Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="font-family: monospace; font-size: 18px; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>d = Σ(e<sub>t</sub> - e<sub>t-1</sub>)² / Σe<sub>t</sub>²</strong>
                </div>
                <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px;"><strong>Numerator:</strong></td>
                            <td style="padding: 8px; font-family: monospace;">${numerator.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;"><strong>Denominator:</strong></td>
                            <td style="padding: 8px; font-family: monospace;">${denominator.toFixed(6)}</td>
                        </tr>
                        <tr style="border-top: 1px solid #dee2e6;">
                            <td style="padding: 12px;"><strong>d =</strong></td>
                            <td style="padding: 12px; font-family: monospace; font-size: 20px; font-weight: 700; color: #1a5490;">${numerator.toFixed(6)} / ${denominator.toFixed(6)} = ${durbinWatson.toFixed(6)}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- INTERPRETATION SECTION -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 25px; background: ${severityColor}15; border-left: 6px solid ${severityColor};">
            <h3 style="margin: 0 0 15px 0;">📌 Interpretation & Decision</h3>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size: 11px; color: #666; text-transform: uppercase;">Test Statistic (d)</div>
                    <div style="font-size: 28px; font-weight: 700; color: ${severityColor};">${durbinWatson.toFixed(4)}</div>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size: 11px; color: #666; text-transform: uppercase;">Observations (n)</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size: 11px; color: #666; text-transform: uppercase;">Verdict</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${severityColor};">${severity}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 15px;">
                <p><strong>🎯 Interpretation:</strong> ${interpretation}</p>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #dee2e6;">
                    <strong>📊 Decision Rules:</strong><br>
                    <table style="width: 100%; margin-top: 8px; font-size: 13px;">
                        <tr><td style="padding: 4px;">• d = 2</td><td>→ No autocorrelation</td></tr>
                        <tr><td style="padding: 4px;">• d < 2</td><td>→ Positive autocorrelation</td></tr>
                        <tr><td style="padding: 4px;">• d > 2</td><td>→ Negative autocorrelation</td></tr>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- REFERENCE TABLE -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📖 Durbin-Watson Critical Values Reference (α = 0.05)</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">n</th>
                            <th style="padding: 10px;">k=1</th>
                            <th style="padding: 10px;">k=2</th>
                            <th style="padding: 10px;">k=3</th>
                            <th style="padding: 10px;">k=4</th>
                            <th style="padding: 10px;">k=5</th>
                        </td>
                    </thead>
                    <tbody>
                        <tr style="background: white;"><td style="padding: 8px;">15</td><td>1.08, 1.36</td><td>0.95, 1.54</td><td>0.82, 1.75</td><td>0.69, 1.97</td><td>0.56, 2.21</td></tr>
                        <tr style="background: #f8f9fa;"><td style="padding: 8px;">20</td><td>1.20, 1.41</td><td>1.10, 1.54</td><td>1.00, 1.68</td><td>0.90, 1.83</td><td>0.79, 1.99</td></tr>
                        <tr style="background: white;"><td style="padding: 8px;">30</td><td>1.35, 1.49</td><td>1.28, 1.57</td><td>1.21, 1.65</td><td>1.14, 1.74</td><td>1.07, 1.83</td></tr>
                        <tr style="background: #f8f9fa;"><td style="padding: 8px;">40</td><td>1.44, 1.54</td><td>1.39, 1.60</td><td>1.34, 1.66</td><td>1.29, 1.72</td><td>1.23, 1.79</td></tr>
                        <tr style="background: white;"><td style="padding: 8px;">50</td><td>1.50, 1.59</td><td>1.46, 1.63</td><td>1.42, 1.67</td><td>1.38, 1.72</td><td>1.34, 1.77</td></tr>
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #666; text-align: center;">
                💡 <strong>Note:</strong> Values shown as (d<sub>L</sub>, d<sub>U</sub>). Reject H₀ if d < d<sub>L</sub> or d > 4 - d<sub>L</sub>.
            </div>
        </div>
    </div>`;
    
    return { durbinWatson, numerator, denominator, n, interpretation, steps };
}
// ========== HELPER FUNCTIONS (Place these BEFORE computeVIF) ==========
function calculateCorrelation(x, y) {
    if (!x.length || !y.length || x.length !== y.length) return 0;
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let xySum = 0, xxSum = 0, yySum = 0;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        xySum += dx * dy;
        xxSum += dx * dx;
        yySum += dy * dy;
    }
    if (xxSum === 0 || yySum === 0) return 0;
    return xySum / Math.sqrt(xxSum * yySum);
}

function calculateCorrelationArray(y, x) {
    return calculateCorrelation(y, x);
}
// ========== VIF COMPUTATION (PROFESSIONAL VERSION) ==========
// ========== VIF COMPUTATION (PROFESSIONAL VERSION WITH DETAILED R² CALCULATION) ==========
function computeVIF(dataMatrix) {
    if (!dataMatrix.length || dataMatrix[0].length < 2) {
        return { error: true, message: "Need at least 2 predictor variables for VIF calculation." };
    }
    
    const n = dataMatrix.length;
    const p = dataMatrix[0].length;
    const vifs = [];
    const detailedCalculations = []; // Store detailed R² calculations
    
    // Helper function for correlation
    function calcCorr(x, y) {
        if (!x.length || !y.length || x.length !== y.length) return 0;
        const len = x.length;
        const meanX = x.reduce((a, b) => a + b, 0) / len;
        const meanY = y.reduce((a, b) => a + b, 0) / len;
        let xySum = 0, xxSum = 0, yySum = 0;
        for (let i = 0; i < len; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            xySum += dx * dy;
            xxSum += dx * dx;
            yySum += dy * dy;
        }
        if (xxSum === 0 || yySum === 0) return 0;
        return xySum / Math.sqrt(xxSum * yySum);
    }
    
    // Calculate correlation matrix
    const correlations = [];
    for (let i = 0; i < p; i++) {
        correlations[i] = [];
        for (let j = 0; j < p; j++) {
            const x = dataMatrix.map(row => row[i]);
            const y = dataMatrix.map(row => row[j]);
            correlations[i][j] = calcCorr(x, y);
        }
    }
    
    // Calculate VIF for each predictor with detailed R² calculation
    for (let j = 0; j < p; j++) {
        const dependent = dataMatrix.map(row => row[j]);
        const yMean = dependent.reduce((a, b) => a + b, 0) / n;
        
        let rSquared = 0;
        let calculationDetails = "";
        
        if (p === 2) {
            // Simple case: only one independent variable
            const otherIdx = j === 0 ? 1 : 0;
            const independent = dataMatrix.map(row => row[otherIdx]);
            const xMean = independent.reduce((a, b) => a + b, 0) / n;
            
            // Calculate regression coefficients
            let xySum = 0, xxSum = 0;
            let xyDetails = [];
            let xxDetails = [];
            
            for (let i = 0; i < n; i++) {
                const xDev = independent[i] - xMean;
                const yDev = dependent[i] - yMean;
                xySum += xDev * yDev;
                xxSum += xDev * xDev;
                xyDetails.push(`(${independent[i]} - ${xMean.toFixed(4)}) × (${dependent[i]} - ${yMean.toFixed(4)}) = ${xDev.toFixed(4)} × ${yDev.toFixed(4)} = ${(xDev * yDev).toFixed(4)}`);
                xxDetails.push(`(${independent[i]} - ${xMean.toFixed(4)})² = ${(xDev * xDev).toFixed(4)}`);
            }
            
            const beta = xySum / xxSum;
            const intercept = yMean - beta * xMean;
            
            // Calculate R²
            let ssRes = 0, ssTot = 0;
            let residualDetails = [];
            let totalDetails = [];
            
            for (let i = 0; i < n; i++) {
                const yPred = intercept + beta * independent[i];
                const residual = dependent[i] - yPred;
                const devTotal = dependent[i] - yMean;
                ssRes += residual * residual;
                ssTot += devTotal * devTotal;
                residualDetails.push(`ŷ = ${intercept.toFixed(4)} + ${beta.toFixed(4)}×${independent[i]} = ${yPred.toFixed(4)} → e = ${dependent[i]} - ${yPred.toFixed(4)} = ${residual.toFixed(4)} → e² = ${(residual * residual).toFixed(4)}`);
                totalDetails.push(`(${dependent[i]} - ${yMean.toFixed(4)})² = ${(devTotal * devTotal).toFixed(4)}`);
            }
            
            rSquared = 1 - (ssRes / ssTot);
            if (isNaN(rSquared) || !isFinite(rSquared)) rSquared = 0;
            
            calculationDetails = `
            <div style="margin-top: 15px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <strong>📐 Step-by-Step R² Calculation for X<sub>${j+1}</sub>:</strong><br><br>
                
                <strong>Step 1: Calculate means</strong><br>
                x̄ = ${xMean.toFixed(4)}, ȳ = ${yMean.toFixed(4)}<br><br>
                
                <strong>Step 2: Calculate covariance numerator Σ(x - x̄)(y - ȳ)</strong><br>
                ${xyDetails.join('<br>')}<br>
                <strong>Σ(x - x̄)(y - ȳ) = ${xySum.toFixed(4)}</strong><br><br>
                
                <strong>Step 3: Calculate Σ(x - x̄)²</strong><br>
                ${xxDetails.join('<br>')}<br>
                <strong>Σ(x - x̄)² = ${xxSum.toFixed(4)}</strong><br><br>
                
                <strong>Step 4: Calculate slope (β) and intercept</strong><br>
                β = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)² = ${xySum.toFixed(4)} / ${xxSum.toFixed(4)} = ${beta.toFixed(6)}<br>
                Intercept = ȳ - β·x̄ = ${yMean.toFixed(4)} - ${beta.toFixed(6)}×${xMean.toFixed(4)} = ${intercept.toFixed(6)}<br><br>
                
                <strong>Step 5: Calculate predictions and residuals</strong><br>
                ${residualDetails.join('<br>')}<br>
                <strong>SS<sub>res</sub> = Σe² = ${ssRes.toFixed(4)}</strong><br><br>
                
                <strong>Step 6: Calculate total sum of squares</strong><br>
                ${totalDetails.join('<br>')}<br>
                <strong>SS<sub>tot</sub> = Σ(y - ȳ)² = ${ssTot.toFixed(4)}</strong><br><br>
                
                <strong>Step 7: Calculate R²</strong><br>
                R² = 1 - SS<sub>res</sub>/SS<sub>tot</sub> = 1 - ${ssRes.toFixed(4)}/${ssTot.toFixed(4)} = ${rSquared.toFixed(6)}<br>
            </div>`;
            
        } else {
            // Multiple predictors: calculate R² using correlation matrix
            let sumCorrSq = 0;
            let corrDetails = [];
            for (let k = 0; k < p; k++) {
                if (k !== j) {
                    const corr = correlations[j][k];
                    sumCorrSq += corr * corr;
                    corrDetails.push(`r(X<sub>${j+1}</sub>, X<sub>${k+1}</sub>) = ${corr.toFixed(4)} → squared = ${(corr * corr).toFixed(4)}`);
                }
            }
            rSquared = Math.min(Math.max(sumCorrSq / (p - 1), 0.01), 0.99);
            
            calculationDetails = `
            <div style="margin-top: 15px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <strong>📐 Step-by-Step R² Calculation for X<sub>${j+1}</sub>:</strong><br><br>
                
                <strong>Step 1: Calculate correlations with other predictors</strong><br>
                ${corrDetails.join('<br>')}<br><br>
                
                <strong>Step 2: Calculate average squared correlation</strong><br>
                Σr² = ${sumCorrSq.toFixed(4)}<br>
                Average r² = Σr² / (k-1) = ${sumCorrSq.toFixed(4)} / ${p-1} = ${(sumCorrSq/(p-1)).toFixed(4)}<br><br>
                
                <strong>Step 3: R² ≈ Average r² (approximation for multiple regression)</strong><br>
                R² = ${rSquared.toFixed(6)}<br>
            </div>`;
        }
        
        // Ensure R² is not exactly 1 to avoid division by zero
        rSquared = Math.min(rSquared, 0.999999);
        const vif = 1 / (1 - rSquared);
        
        let severity = "";
        let severityColor = "";
        let recommendation = "";
        if (vif < 5) { 
            severity = "Acceptable"; 
            severityColor = "#28a745"; 
            recommendation = "✓ No action needed"; 
        } else if (vif < 10) { 
            severity = "Moderate Concern"; 
            severityColor = "#ffc107"; 
            recommendation = "⚠️ Consider combining variables"; 
        } else { 
            severity = "Severe"; 
            severityColor = "#dc3545"; 
            recommendation = "❌ Remove or use regularization"; 
        }
        
        vifs.push({ 
            variable: j+1, 
            vif: vif, 
            rSquared: rSquared, 
            severity: severity, 
            severityColor: severityColor, 
            recommendation: recommendation,
            calculationDetails: calculationDetails
        });
    }
    
    // Build correlation matrix HTML
    let corrRows = '';
    for (let i = 0; i < p; i++) {
        corrRows += '<tr>';
        corrRows += `<th style="padding: 10px; background: #e8f4f8;">X<sub>${i+1}</sub></th>`;
        for (let j = 0; j < p; j++) {
            let bgColor = '';
            if (i !== j && Math.abs(correlations[i][j]) > 0.7) bgColor = 'background: #f8d7da;';
            else if (i !== j && Math.abs(correlations[i][j]) > 0.5) bgColor = 'background: #fff3cd;';
            corrRows += `<td style="padding: 10px; text-align: center; ${bgColor}">${correlations[i][j].toFixed(3)}</td>`;
        }
        corrRows += '</tr>';
    }
    
    // Build VIF results table with expandable R² details
    let vifRows = '';
    for (let v of vifs) {
        vifRows += `
        <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px; text-align: center; font-weight: 600;">X<sub>${v.variable}</sub></td>
            <td style="padding: 12px; text-align: center;">
                ${v.rSquared.toFixed(4)}
                <div style="font-size: 10px; margin-top: 4px;">
                    <details>
                        <summary style="cursor: pointer; color: #1a5490;">📐 Show R² Calculation</summary>
                        ${v.calculationDetails}
                    </details>
                </div>
            </td>
            <td style="padding: 12px; text-align: center; background: ${v.severityColor}20; font-weight: 700; font-size: 16px;">${v.vif.toFixed(4)}</td>
            <td style="padding: 12px; text-align: center; color: ${v.severityColor}; font-weight: 600;">${v.severity}</td>
            <td style="padding: 12px; text-align: center;">${v.recommendation}</td>
        </tr>`;
    }
    
    // Build complete HTML
    let steps = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 100%;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #0d3b66 0%, #1a5490 100%); color: white; padding: 25px 30px; border-radius: 16px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div>
                    <h1 style="margin: 0; font-size: 28px;">📊 Variance Inflation Factor (VIF)</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Detecting Multicollinearity in Multiple Regression</p>
                </div>
                <div style="background: rgba(255,255,255,0.15); padding: 10px 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 11px;">Max VIF</div>
                    <div style="font-size: 32px; font-weight: 700;">${Math.max(...vifs.map(v => v.vif)).toFixed(2)}</div>
                </div>
            </div>
        </div>
        
        <!-- FORMULA SECTION -->
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #1a5490;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📐 Mathematical Formula</h3>
            <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-family: monospace; font-size: 22px; font-weight: 700; margin-bottom: 10px;">
                    VIF<sub>j</sub> = 1 / (1 - R<sub>j</sub>²)
                </div>
                <div style="font-family: monospace; font-size: 14px; color: #555; margin-top: 5px;">
                    where R<sub>j</sub>² = coefficient of determination from regressing X<sub>j</sub> on all other predictors
                </div>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 15px; border-radius: 8px;">
                <strong>📖 Step-by-Step VIF Calculation:</strong><br>
                1. <strong>Regress X<sub>j</sub></strong> against all other predictor variables<br>
                2. <strong>Calculate R<sub>j</sub>²</strong> (proportion of variance explained)<br>
                3. <strong>Apply formula:</strong> VIF<sub>j</sub> = 1 / (1 - R<sub>j</sub>²)<br><br>
                <strong>📊 Interpretation Thresholds:</strong><br>
                • <span style="color: #28a745;">VIF = 1</span> → No correlation with other predictors<br>
                • <span style="color: #ffc107;">1 < VIF < 5</span> → Moderate correlation<br>
                • <span style="color: #e65100;">VIF ≥ 5</span> → High correlation (problematic)<br>
                • <span style="color: #dc3545;">VIF ≥ 10</span> → Severe multicollinearity
            </div>
        </div>
        
        <!-- SUMMARY STATISTICS -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #666;">Observations (n)</div>
                <div style="font-size: 32px; font-weight: 700;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #666;">Predictors (k)</div>
                <div style="font-size: 32px; font-weight: 700;">${p}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #666;">Mean VIF</div>
                <div style="font-size: 24px; font-weight: 700;">${(vifs.reduce((a, b) => a + b.vif, 0) / p).toFixed(2)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 11px; color: #666;">Min VIF</div>
                <div style="font-size: 24px; font-weight: 700;">${Math.min(...vifs.map(v => v.vif)).toFixed(2)}</div>
            </div>
        </div>
        
        <!-- VIF RESULTS TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📊 Variance Inflation Factor Results</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Click "Show R² Calculation" to see detailed step-by-step derivation</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px; text-align: center;">Predictor</th>
                        <th style="padding: 12px; text-align: center;">R² (from regression)</th>
                        <th style="padding: 12px; text-align: center;">VIF = 1/(1-R²)</th>
                        <th style="padding: 12px; text-align: center;">Severity</th>
                        <th style="padding: 12px; text-align: center;">Recommendation</th>
                    </tr>
                </thead>
                <tbody>
                    ${vifRows}
                </tbody>
            </table>
        </div>
        
        <!-- CORRELATION MATRIX -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📈 Correlation Matrix (Between Predictors)</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Shows pairwise correlations used in R² calculation</p>
            </div>
            <div style="padding: 15px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: center;">
                    <thead>
                        <tr>
                            <th style="padding: 10px;"></th>
                            ${Array(p).fill().map((_, j) => `<th style="padding: 10px;">X<sub>${j+1}</sub></th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${corrRows}
                    </tbody>
                </table>
            </div>
            <div style="background: #f8f9fa; padding: 12px 20px; font-size: 12px;">
                <span style="background: #f8d7da; padding: 2px 8px; border-radius: 4px;">🔴 |r| > 0.7 (High correlation)</span>
                <span style="background: #fff3cd; padding: 2px 8px; border-radius: 4px; margin-left: 10px;">🟡 0.5 < |r| ≤ 0.7 (Moderate correlation)</span>
                <span style="background: white; padding: 2px 8px; border-radius: 4px; margin-left: 10px;">🟢 |r| ≤ 0.5 (Low correlation)</span>
            </div>
        </div>
        
        <!-- INTERPRETATION -->
        <div style="border-radius: 16px; padding: 20px; background: #e8f4f8; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📌 Interpretation & Recommendations</h3>
            
            <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <strong>🎯 What VIF Tells You:</strong>
                <ul style="margin-top: 10px; margin-bottom: 0;">
                    <li><strong>VIF = 1</strong> → Predictor is not correlated with others</li>
                    <li><strong>1 < VIF < 5</strong> → Moderate correlation, generally acceptable</li>
                    <li><strong>5 ≤ VIF < 10</strong> → High correlation, may cause issues</li>
                    <li><strong>VIF ≥ 10</strong> → Severe multicollinearity, must address</li>
                </ul>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 15px;">
                <strong>✅ Recommended Actions:</strong>
                <ul style="margin-top: 10px; margin-bottom: 0;">
                    <li>Remove one of the highly correlated predictors</li>
                    <li>Combine correlated predictors into a single composite variable</li>
                    <li>Use Ridge Regression or LASSO (regularization techniques)</li>
                    <li>Collect more data to reduce standard errors</li>
                </ul>
            </div>
        </div>
        
        <!-- DECISION SUMMARY -->
        <div style="border-radius: 16px; padding: 20px; ${Math.max(...vifs.map(v => v.vif)) >= 10 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : (Math.max(...vifs.map(v => v.vif)) >= 5 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #d4edda; border-left: 6px solid #28a745;')}">
            <h3 style="margin: 0 0 12px 0;">📊 Overall Assessment</h3>
            <p><strong>Maximum VIF:</strong> ${Math.max(...vifs.map(v => v.vif)).toFixed(4)}</p>
            <p><strong>Conclusion:</strong> ${Math.max(...vifs.map(v => v.vif)) >= 10 ? '❌ Severe multicollinearity detected. Model needs revision.' : (Math.max(...vifs.map(v => v.vif)) >= 5 ? '⚠️ Moderate multicollinearity detected. Consider addressing.' : '✅ No severe multicollinearity. Model is acceptable.')}</p>
        </div>
    </div>`;
    
    return { vifs, steps };
}
// ========== COOK'S DISTANCE COMPUTATION (PROFESSIONAL VERSION WITH DETAILED CALCULATIONS) ==========
function computeCooksDistance(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: "X and Y must have the same number of values." };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
    }
    
    const n = xValues.length;
    const meanX = xValues.reduce((a,b) => a+b, 0) / n;
    const meanY = yValues.reduce((a,b) => a+b, 0) / n;
    
    // ========== DETAILED REGRESSION COEFFICIENT CALCULATION ==========
    let xySum = 0, xxSum = 0;
    let xyDetails = [];
    let xxDetails = [];
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        xySum += xDev * yDev;
        xxSum += xDev * xDev;
        xyDetails.push(`(${xValues[i]} - ${meanX.toFixed(4)}) × (${yValues[i]} - ${meanY.toFixed(4)}) = ${xDev.toFixed(4)} × ${yDev.toFixed(4)} = ${(xDev * yDev).toFixed(4)}`);
        xxDetails.push(`(${xValues[i]} - ${meanX.toFixed(4)})² = ${(xDev * xDev).toFixed(4)}`);
    }
    
    const slope = xySum / xxSum;
    const intercept = meanY - slope * meanX;
    const sxx = xxSum;
    
    // Calculate predictions, residuals, and leverage
    let predictions = [];
    let residuals = [];
    let ssRes = 0;
    let predictionDetails = [];
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        predictions.push(yPred);
        const residual = yValues[i] - yPred;
        residuals.push(residual);
        ssRes += residual * residual;
        predictionDetails.push(`ŷ${i+1} = ${intercept.toFixed(4)} + ${slope.toFixed(4)} × ${xValues[i]} = ${yPred.toFixed(4)} → e${i+1} = ${yValues[i]} - ${yPred.toFixed(4)} = ${residual.toFixed(4)} → e² = ${(residual * residual).toFixed(4)}`);
    }
    
    const mse = ssRes / (n - 2);
    
    // Calculate Cook's Distance for each observation with detailed leverage calculation
    let cookDetails = [];
    let leverageDetails = [];
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const xDevSq = xDev * xDev;
        const leverageTerm1 = 1/n;
        const leverageTerm2 = xDevSq / sxx;
        const hii = leverageTerm1 + leverageTerm2;
        
        leverageDetails.push(`
            <div style="margin-bottom: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                <strong>Observation ${i+1}:</strong><br>
                h<sub>ii</sub> = 1/${n} + (${xValues[i]} - ${meanX.toFixed(4)})² / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + (${xDev.toFixed(4)})² / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + ${xDevSq.toFixed(4)} / ${sxx.toFixed(4)}<br>
                = ${leverageTerm1.toFixed(6)} + ${leverageTerm2.toFixed(6)}<br>
                = <strong style="color: #1a5490;">${hii.toFixed(6)}</strong>
            </div>
        `);
        
        const D = (residuals[i] * residuals[i]) / (2 * mse) * (hii / Math.pow(1 - hii, 2));
        
        let influence = "";
        let influenceColor = "";
        if (D < 0.5) { 
            influence = "Not Influential"; 
            influenceColor = "#28a745"; 
        } else if (D < 1) { 
            influence = "Moderately Influential"; 
            influenceColor = "#ffc107"; 
        } else { 
            influence = "Highly Influential"; 
            influenceColor = "#dc3545"; 
        }
        
        cookDetails.push({
            obs: i+1,
            x: xValues[i],
            y: yValues[i],
            yPred: predictions[i],
            residual: residuals[i],
            leverage: hii,
            cooksD: D,
            influence: influence,
            influenceColor: influenceColor
        });
    }
    
    const influentialCount = cookDetails.filter(d => d.cooksD >= 1).length;
    const moderateCount = cookDetails.filter(d => d.cooksD >= 0.5 && d.cooksD < 1).length;
    const sortedD = [...cookDetails].sort((a,b) => b.cooksD - a.cooksD);
    
    // Build table rows
    let tableRows = '';
    for (let d of cookDetails) {
        tableRows += `
        <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center; font-weight: 600;">${d.obs}</td>
            <td style="padding: 10px; text-align: center;">${d.x}</td>
            <td style="padding: 10px; text-align: center;">${d.y}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${d.yPred.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace; ${d.residual >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">${d.residual.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${d.leverage.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; background: ${d.influenceColor}20; font-weight: 700; font-family: monospace;">${d.cooksD.toFixed(6)}</td>
            <td style="padding: 10px; text-align: center; color: ${d.influenceColor}; font-weight: 600;">${d.influence}</td>
        </tr>`;
    }
    
    // Build complete HTML
    let steps = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 100%;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #d4380d 0%, #e65100 100%); color: white; padding: 25px 30px; border-radius: 16px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
                <div>
                    <h1 style="margin: 0; font-size: 28px;">🔥 Cook's Distance</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Identifying Influential Observations in Regression Analysis</p>
                </div>
                <div style="background: rgba(255,255,255,0.15); padding: 10px 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 11px;">Influential Points</div>
                    <div style="font-size: 32px; font-weight: 700;">${influentialCount}</div>
                </div>
            </div>
        </div>
        
        <!-- FORMULA SECTION -->
        <div style="background: #fff3e0; border-radius: 16px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #e65100;">
            <h3 style="margin: 0 0 12px 0; color: #e65100;">📐 Mathematical Formula</h3>
            <div style="background: white; padding: 20px; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-family: monospace; font-size: 20px; font-weight: 700; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        D<sub>i</sub> = <span style="color: #dc3545;">e<sub>i</sub>²</span> / (2 × MSE) × <span style="color: #1a5490;">h<sub>ii</sub></span> / (1 - h<sub>ii</sub>)²
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0;">
                    <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-weight: 700; color: #dc3545;">e<sub>i</sub></div>
                        <div style="font-size: 12px;">Residual = y<sub>i</sub> - ŷ<sub>i</sub></div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-weight: 700;">MSE</div>
                        <div style="font-size: 12px;">Mean Squared Error = Σe<sub>i</sub>²/(n-2)</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-weight: 700; color: #1a5490;">h<sub>ii</sub></div>
                        <div style="font-size: 12px;">Leverage = 1/n + (x<sub>i</sub>-x̄)²/Σ(x-x̄)²</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 15px; background: #fff8f0; padding: 15px; border-radius: 8px;">
                <strong>📖 Step-by-Step Calculation Overview:</strong><br>
                1. Calculate regression coefficients (β₀, β₁)<br>
                2. Calculate residuals: e<sub>i</sub> = y<sub>i</sub> - ŷ<sub>i</sub><br>
                3. Calculate MSE = Σe<sub>i</sub>² / (n - 2)<br>
                4. Calculate leverage: h<sub>ii</sub> = 1/n + (x<sub>i</sub> - x̄)² / Σ(x - x̄)²<br>
                5. Apply formula: D<sub>i</sub> = [e<sub>i</sub>² / (2×MSE)] × [h<sub>ii</sub> / (1-h<sub>ii</sub>)²]<br><br>
                <strong>📊 Interpretation Thresholds:</strong><br>
                • <span style="color: #28a745;">D<sub>i</sub> < 0.5</span> → Not influential<br>
                • <span style="color: #ffc107;">0.5 ≤ D<sub>i</sub> < 1</span> → Moderately influential (investigate)<br>
                • <span style="color: #dc3545;">D<sub>i</sub> ≥ 1</span> → Highly influential (must address)
            </div>
        </div>
        
        <!-- STEP 1: REGRESSION COEFFICIENTS CALCULATION -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📈 Step 1: Calculate Regression Coefficients (β₀, β₁)</h3>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <strong>📐 Formula for Slope (β₁):</strong>
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin: 10px 0;">
                    β₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²
                </div>
                
                <details>
                    <summary style="cursor: pointer; color: #1a5490; font-weight: 600;">📊 Click to see detailed Σ(x - x̄)(y - ȳ) calculation</summary>
                    <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 6px;">
                        ${xyDetails.join('<br>')}
                        <hr>
                        <strong>Σ(x - x̄)(y - ȳ) = ${xySum.toFixed(4)}</strong>
                    </div>
                </details>
                
                <details>
                    <summary style="cursor: pointer; color: #1a5490; font-weight: 600; margin-top: 10px;">📊 Click to see detailed Σ(x - x̄)² calculation</summary>
                    <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 6px;">
                        ${xxDetails.join('<br>')}
                        <hr>
                        <strong>Σ(x - x̄)² = ${xxSum.toFixed(4)}</strong>
                    </div>
                </details>
                
                <div style="margin-top: 15px; padding: 10px; background: #e8f4f8; border-radius: 6px;">
                    <strong>β₁ = ${xySum.toFixed(4)} / ${xxSum.toFixed(4)} = <span style="color: #dc3545; font-size: 18px;">${slope.toFixed(6)}</span></strong>
                </div>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px;">
                <strong>📐 Formula for Intercept (β₀):</strong>
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin: 10px 0;">
                    β₀ = ȳ - β₁·x̄
                </div>
                <div style="padding: 10px; background: #e8f4f8; border-radius: 6px;">
                    β₀ = ${meanY.toFixed(4)} - (${slope.toFixed(6)} × ${meanX.toFixed(4)})<br>
                    β₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)} = <span style="color: #dc3545; font-size: 18px;">${intercept.toFixed(6)}</span>
                </div>
            </div>
            
            <div style="margin-top: 15px; background: #d4edda; border-radius: 8px; padding: 12px; text-align: center; font-family: monospace; font-size: 16px;">
                <strong>Regression Equation: ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)} · x</strong>
            </div>
        </div>
        
        <!-- STEP 2: PREDICTIONS AND RESIDUALS -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">📊 Step 2: Calculate Predictions (ŷ) and Residuals (e)</h3>
            
            <details>
                <summary style="cursor: pointer; color: #1a5490; font-weight: 600; margin-bottom: 10px;">📊 Click to see detailed prediction and residual calculations</summary>
                <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    ${predictionDetails.join('<br>')}
                    <hr>
                    <strong>SS<sub>res</sub> = Σe² = ${ssRes.toFixed(4)}</strong>
                </div>
            </details>
            
            <div style="margin-top: 15px; padding: 10px; background: #e8f4f8; border-radius: 6px;">
                <strong>MSE = SS<sub>res</sub> / (n - 2) = ${ssRes.toFixed(4)} / ${n-2} = <span style="color: #dc3545;">${mse.toFixed(6)}</span></strong>
            </div>
        </div>
        
        <!-- STEP 3: LEVERAGE CALCULATION -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">🔧 Step 3: Calculate Leverage Values (h<sub>ii</sub>)</h3>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center; margin-bottom: 15px;">
                    <strong>h<sub>ii</sub> = 1/n + (xᵢ - x̄)² / Σ(x - x̄)²</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
                    <div><strong>n =</strong> ${n}</div>
                    <div><strong>x̄ =</strong> ${meanX.toFixed(4)}</div>
                    <div><strong>Σ(x - x̄)² =</strong> ${sxx.toFixed(4)}</div>
                    <div><strong>1/n =</strong> ${(1/n).toFixed(6)}</div>
                </div>
                
                <details>
                    <summary style="cursor: pointer; color: #1a5490; font-weight: 600;">📊 Click to see detailed leverage calculation for each observation</summary>
                    <div style="margin-top: 10px;">
                        ${leverageDetails.join('')}
                    </div>
                </details>
            </div>
            
            <div style="background: #e8f4f8; border-radius: 10px; padding: 12px;">
                <strong>📌 Leverage Statistics:</strong><br>
                • Average leverage = ${(2/n).toFixed(4)}<br>
                • Threshold (2×average) = ${(4/n).toFixed(4)}<br>
                • Maximum leverage = ${Math.max(...cookDetails.map(d => d.leverage)).toFixed(4)}<br>
                💡 Observations with leverage > ${(4/n).toFixed(4)} have high influence on the regression line.
            </div>
        </div>
        
        <!-- STEP 4: COOK'S DISTANCE TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow-x: auto;">
            <div style="background: #e65100; color: white; padding: 14px 20px;">
                <h3 style="margin: 0; font-size: 16px;">📊 Step 4: Cook's Distance Calculations</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">D<sub>i</sub> = [e<sub>i</sub>² / (2×MSE)] × [h<sub>ii</sub> / (1-h<sub>ii</sub>)²]</p>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #e65100;">
                            <th style="padding: 10px;">Obs #</th>
                            <th style="padding: 10px;">X</th>
                            <th style="padding: 10px;">Y</th>
                            <th style="padding: 10px;">Ŷ (Predicted)</th>
                            <th style="padding: 10px;">Residual (e)</th>
                            <th style="padding: 10px;">Leverage (h)</th>
                            <th style="padding: 10px;">Cook's D</th>
                            <th style="padding: 10px;">Influence Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- INTERPRETATION SECTION -->
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 25px; ${influentialCount > 0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : (moderateCount > 0 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #d4edda; border-left: 6px solid #28a745;')}">
            <h3 style="margin: 0 0 15px 0;">📌 Step 5: Influence Assessment</h3>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px;">Total Observations</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px;">Highly Influential (D ≥ 1)</div>
                    <div style="font-size: 28px; font-weight: 700; color: #dc3545;">${influentialCount}</div>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 11px;">Moderately Influential (0.5 ≤ D < 1)</div>
                    <div style="font-size: 28px; font-weight: 700; color: #ffc107;">${moderateCount}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 15px;">
                <strong>🎯 Decision:</strong><br>
                ${influentialCount > 0 ? 
                    '❌ <strong>ACTION REQUIRED:</strong> One or more observations have Cook\'s Distance ≥ 1. These points strongly influence the regression model.' : 
                    (moderateCount > 0 ? 
                        '⚠️ <strong>CAUTION:</strong> Some observations have moderate influence (0.5 ≤ D < 1). Investigate these points.' : 
                        '✅ <strong>ACCEPTABLE:</strong> No highly influential observations detected. The regression model is stable.')}
                
                ${influentialCount > 0 ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                    <strong>🔧 Recommended Actions:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Investigate influential observations for data entry errors</li>
                        <li>Consider removing influential points and re-running analysis</li>
                        <li>Use robust regression methods (e.g., Huber, quantile regression)</li>
                        <li>Report results both with and without influential points</li>
                    </ul>
                </div>
                ` : (moderateCount > 0 ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                    <strong>🔧 Recommended Actions:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Examine moderately influential observations in detail</li>
                        <li>Verify data accuracy for these points</li>
                        <li>Consider sensitivity analysis (excluding these points)</li>
                    </ul>
                </div>
                ` : '')}
            </div>
        </div>
        
        <!-- TOP INFLUENTIAL POINTS -->
        <div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="margin: 0 0 15px 0; color: #1a5490;">⭐ Top 5 Most Influential Observations</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Rank</th>
                            <th style="padding: 10px;">Observation #</th>
                            <th style="padding: 10px;">Cook's D</th>
                            <th style="padding: 10px;">Influence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedD.slice(0, 5).map((d, idx) => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 8px; text-align: center;">${idx + 1}</td>
                            <td style="padding: 8px; text-align: center;">${d.obs}</td>
                            <td style="padding: 8px; text-align: center; font-weight: 700; color: ${d.influenceColor};">${d.cooksD.toFixed(6)}</td>
                            <td style="padding: 8px; text-align: center; color: ${d.influenceColor};">${d.influence}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- SUMMARY STATISTICS -->
        <div style="margin-top: 20px; background: #e8f4f8; border-radius: 12px; padding: 15px; font-size: 12px;">
            <strong>📊 Cook's Distance Summary Statistics:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 8px;">
                <div>Min D = ${Math.min(...cookDetails.map(d => d.cooksD)).toFixed(6)}</div>
                <div>Max D = ${Math.max(...cookDetails.map(d => d.cooksD)).toFixed(6)}</div>
                <div>Mean D = ${(cookDetails.reduce((a,b) => a + b.cooksD, 0) / n).toFixed(6)}</div>
                <div>Median D = ${cookDetails.sort((a,b) => a.cooksD - b.cooksD)[Math.floor(n/2)].cooksD.toFixed(6)}</div>
            </div>
        </div>
        
        <!-- QUICK REFERENCE CARD -->
        <div style="margin-top: 15px; background: #e8f4f8; border-radius: 12px; padding: 15px; font-size: 12px;">
            <strong>📖 Quick Reference:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 8px;">
                <div>🟢 <strong>D < 0.5</strong> → Not influential</div>
                <div>🟡 <strong>0.5 ≤ D < 1</strong> → Moderately influential (investigate)</div>
                <div>🔴 <strong>D ≥ 1</strong> → Highly influential (must address)</div>
            </div>
        </div>
    </div>`;
    
    return { cooksDistances: cookDetails.map(d => d.cooksD), leverages: cookDetails.map(d => d.leverage), residuals, mse, steps, cookDetails };
}
// ========== SETUP FUNCTIONS ==========
function setupDurbinWatsonLogic() {
    const computeBtn = document.getElementById("dwComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("dwResiduals").value;
        const residuals = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("dwResultArea");
        const valueSpan = document.getElementById("dwValueDisplay");
        const stepsSpan = document.getElementById("dwStepsDisplay");
        
        if (!residuals.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter residuals.";  // ← Use innerHTML
            return;
        }
        
        const result = computeDurbinWatson(residuals);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;  // ← Use innerHTML
        } else {
            valueSpan.innerHTML = `d = ${result.durbinWatson.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;  // ← Use innerHTML (THIS IS CRITICAL)
        }
    });
    
    attachClearHandler("dwClearBtn", "dwResiduals", "dwResultArea");
}
// ========== VIF SETUP FUNCTION (FIXED) ==========
function setupVIFLogic() {
    const computeBtn = document.getElementById("vifComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("vifData").value;
        const lines = raw.trim().split(/\r?\n/);
        let dataMatrix = [];
        
        for (let line of lines) {
            line = line.trim();
            if (line === "") continue;
            const values = parseNumbersFromInput(line);
            if (values.length > 0) {
                dataMatrix.push(values);
            }
        }
        
        const resultDiv = document.getElementById("vifResultArea");
        const valueSpan = document.getElementById("vifValueDisplay");
        const stepsSpan = document.getElementById("vifStepsDisplay");
        
        if (dataMatrix.length < 3) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data for at least 2 predictor variables.";  // ← innerHTML
            return;
        }
        
        const result = computeVIF(dataMatrix);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;  // ← innerHTML
        } else {
            const vifSummary = result.vifs.map(v => `X${v.variable}: ${v.vif.toFixed(2)}`).join(' | ');
            valueSpan.innerHTML = vifSummary;
            stepsSpan.innerHTML = result.steps;  // ← CRITICAL: use innerHTML not innerText
        }
    });
    
    attachClearHandler("vifClearBtn", "vifData", "vifResultArea");
}

// ========== COOK'S DISTANCE SETUP FUNCTION (FIXED) ==========
function setupCooksDistanceLogic() {
    const computeBtn = document.getElementById("cooksComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("cooksXInput").value;
        const rawY = document.getElementById("cooksYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("cooksResultArea");
        const valueSpan = document.getElementById("cooksValueDisplay");
        const stepsSpan = document.getElementById("cooksStepsDisplay");
        
        const result = computeCooksDistance(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;  // ← innerHTML
        } else {
            const influential = result.cooksDistances.filter(d => d >= 1).length;
            valueSpan.innerHTML = `${influential} influential obs | Max D = ${Math.max(...result.cooksDistances).toFixed(4)}`;
            stepsSpan.innerHTML = result.steps;  // ← CRITICAL: use innerHTML not innerText
        }
    });
    
    const clearBtn = document.getElementById("cooksClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("cooksXInput").value = '';
            document.getElementById("cooksYInput").value = '';
            document.getElementById("cooksResultArea").style.display = 'none';
        });
    }
}
// ========== TUKEY HSD RENDER FUNCTION ==========
function renderTukeyHSDInterface() {
    return `
        <div class="stat-interface" id="statTukeyHSDInterface">
            <div class="interface-title">📊 Tukey's HSD (Honestly Significant Difference)</div>
            <div class="formula-card">
                <div class="formula">📌 HSD = q × √(MS<sub>within</sub> / n)</div>
                <div class="desc">
                    <strong>What is Tukey's HSD?</strong><br>
                    A post-hoc test that compares all possible pairs of group means after a significant ANOVA result.
                    Controls the family-wise error rate at α for all pairwise comparisons.
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>When to use:</strong> After a significant one-way ANOVA when you want to know which specific groups differ.
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data with group labels (format: value:group):</label>
                <textarea id="tukeyData" rows="5" placeholder="Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> value:group (comma or space separated)
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="tukeyAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="tukeyComputeBtn">📊 Run Tukey HSD + Full Steps</button>
                    <button class="secondary-btn" id="tukeyClearBtn">Clear</button>
                </div>
            </div>
            <div id="tukeyResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 TUKEY HSD RESULTS</div>
                    <div class="result-value" id="tukeyValueDisplay">—</div>
                    <div class="calculation-steps" id="tukeyStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== BONFERRONI CORRECTION RENDER FUNCTION ==========
function renderBonferroniInterface() {
    return `
        <div class="stat-interface" id="statBonferroniInterface">
            <div class="interface-title">✏️ Bonferroni Correction (Post-hoc)</div>
            <div class="formula-card">
                <div class="formula">📌 α<sub>adjusted</sub> = α / m</div>
                <div class="desc">
                    <strong>What is the Bonferroni Correction?</strong><br>
                    A conservative post-hoc method that adjusts the significance level for multiple comparisons.
                    Divides α by the number of comparisons to control family-wise error rate.
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>When to use:</strong> After any test with multiple comparisons (ANOVA, t-tests, correlations). Simple and widely applicable.
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data with group labels (format: value:group):</label>
                <textarea id="bonferroniData" rows="5" placeholder="Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> value:group (comma or space separated)
                </div>
                
                <label style="margin-top: 15px;">📊 Original Significance Level (α):</label>
                <select id="bonferroniAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="bonferroniComputeBtn">✏️ Run Bonferroni Correction + Full Steps</button>
                    <button class="secondary-btn" id="bonferroniClearBtn">Clear</button>
                </div>
            </div>
            <div id="bonferroniResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 BONFERRONI CORRECTION RESULTS</div>
                    <div class="result-value" id="bonferroniValueDisplay">—</div>
                    <div class="calculation-steps" id="bonferroniStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== SCHEFFÉ TEST RENDER FUNCTION ==========
function renderScheffeInterface() {
    return `
        <div class="stat-interface" id="statScheffeInterface">
            <div class="interface-title">📐 Scheffé Test (Post-hoc)</div>
            <div class="formula-card">
                <div class="formula">📌 S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]</div>
                <div class="desc">
                    <strong>What is the Scheffé Test?</strong><br>
                    A post-hoc test that allows testing all possible contrasts (not just pairwise comparisons).
                    Most conservative but most flexible post-hoc method.
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>When to use:</strong> When you want to test complex contrasts or have unequal sample sizes.
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data with group labels (format: value:group):</label>
                <textarea id="scheffeData" rows="5" placeholder="Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> value:group (comma or space separated)
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="scheffeAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="scheffeComputeBtn">📐 Run Scheffé Test + Full Steps</button>
                    <button class="secondary-btn" id="scheffeClearBtn">Clear</button>
                </div>
            </div>
            <div id="scheffeResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 SCHEFFÉ TEST RESULTS</div>
                    <div class="result-value" id="scheffeValueDisplay">—</div>
                    <div class="calculation-steps" id="scheffeStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== TUKEY HSD COMPUTATION ==========
// ========== TUKEY HSD COMPUTATION (DETAILED) ==========
function computeTukeyHSD(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = groupName.trim();
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Tukey HSD." };
    }
    
    const k = groups.size;
    let allValues = [];
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupData = [];
    
    // Build detailed group data
    for (let [group, values] of groups) {
        const sum = values.reduce((a,b) => a+b, 0);
        const mean = sum / values.length;
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
        allValues.push(...values);
        groupData.push({ group, values, mean, n: values.length, sum });
    }
    
    const totalN = allValues.length;
    const grandMean = allValues.reduce((a,b) => a+b, 0) / totalN;
    
    // Calculate SS_within (Sum of Squares Within)
    let ssWithin = 0;
    let ssWithinDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        ssWithinDetails.push(`\n   <strong>Group ${group}:</strong> Mean = ${mean.toFixed(4)}`);
        for (let val of values) {
            const dev = val - mean;
            const sqDev = dev * dev;
            ssWithin += sqDev;
            ssWithinDetails.push(`      (${val} - ${mean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
        }
    }
    
    const dfWithin = totalN - k;
    const msWithin = ssWithin / dfWithin;
    
    // Calculate SS_between
    let ssBetween = 0;
    let ssBetweenDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        const n = groupSizes.get(group);
        const dev = mean - grandMean;
        const contribution = n * dev * dev;
        ssBetween += contribution;
        ssBetweenDetails.push(`   Group ${group}: ${n} × (${mean.toFixed(4)} - ${grandMean.toFixed(4)})² = ${contribution.toFixed(4)}`);
    }
    
    // Studentized range critical value q(alpha; k, df) from the exact distribution
    const q = studentizedRangeCritical(alpha, k, dfWithin);
    const groupList = Array.from(groups.keys());
    let comparisons = [];
    
    for (let i = 0; i < groupList.length; i++) {
        for (let j = i + 1; j < groupList.length; j++) {
            const group1 = groupList[i];
            const group2 = groupList[j];
            const mean1 = groupMeans.get(group1);
            const mean2 = groupMeans.get(group2);
            const n1 = groupSizes.get(group1);
            const n2 = groupSizes.get(group2);
            const diff = Math.abs(mean1 - mean2);
            const hsd = q * Math.sqrt(msWithin * (1/n1 + 1/n2) / 2);
            const significant = diff > hsd;
            
            comparisons.push({
                group1, group2,
                mean1, mean2,
                n1, n2,
                diff, hsd,
                significant
            });
        }
    }
    
    // Build comprehensive HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📊 Tukey's HSD Test</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">Honestly Significant Difference - Post-hoc Analysis After ANOVA</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> HSD = q<sub>α,k,df</sub> × √(MS<sub>within</sub> / n<sub>harmonic</sub>)
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 What is Tukey's HSD Test?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 The Problem It Solves</h3>
                <p>After a significant ANOVA result (which tells us that <strong>at least one group differs</strong>), we need to know <strong>WHICH specific groups</strong> are different from each other.</p>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px; margin-top: 10px;">
                    💡 <strong>Analogy:</strong> ANOVA is like a fire alarm telling you there's a fire somewhere in the building. Tukey's HSD is like going room by room to find exactly which rooms are on fire!
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How Tukey's HSD Works</h3>
                <p>The test calculates a <strong>critical difference value (HSD)</strong>. Any pair of group means that differ by more than this HSD value is considered statistically significant.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <strong>Formula Breakdown:</strong><br>
                    • <strong>q</strong> = Studentized range statistic (from table, depends on k and df)<br>
                    • <strong>MS<sub>within</sub></strong> = Mean Square Within (error variance from ANOVA)<br>
                    • <strong>n</strong> = Sample size per group (harmonic mean if unequal)<br><br>
                    <strong>HSD = q × √(MS<sub>within</sub> / n)</strong>
                </div>
                <p><strong>Key Advantage:</strong> Controls the <strong>family-wise error rate</strong> at α for ALL pairwise comparisons simultaneously.</p>
            </div>
        </div>
        
        <!-- 📊 STEP 1: INPUT DATA SUMMARY -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📋 Step 1: Input Data Summary</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Group</th>
                        <th style="padding: 12px;">Sample Size (n)</th>
                        <th style="padding: 12px;">Sum of Values (Σx)</th>
                        <th style="padding: 12px;">Mean (x̄)</th>
                        <th style="padding: 12px;">Values</th>
                    </tr></thead>
                    <tbody>
                        ${groupData.map(g => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${g.group}</td>
                            <td style="padding: 10px; text-align: center;">${g.n}</td>
                            <td style="padding: 10px; text-align: center;">${g.sum}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${g.mean.toFixed(4)}</td>
                            <td style="padding: 10px;">${g.values.join(', ')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: ANOVA CALCULATIONS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate ANOVA Components</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2a: Calculate Sum of Squares Within (SS<sub>within</sub>)</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>Formula:</strong> SS<sub>within</sub> = Σ(xᵢⱼ - x̄ⱼ)² = Sum of squared deviations within each group
                </div>
                ${ssWithinDetails.join('<br>')}
                <div style="margin-top: 15px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2b: Calculate Degrees of Freedom Within</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>Formula:</strong> df<sub>within</sub> = N - k = ${totalN} - ${k} = <strong style="color: #1a5490;">${dfWithin}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2c: Calculate Mean Square Within (MS<sub>within</sub>)</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>Formula:</strong> MS<sub>within</sub> = SS<sub>within</sub> / df<sub>within</sub><br>
                    MS<sub>within</sub> = ${ssWithin.toFixed(4)} / ${dfWithin} = <strong style="color: #1a5490; font-size: 18px;">${msWithin.toFixed(6)}</strong>
                </div>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>What is MS<sub>within</sub>?</strong> It's the average variance within groups — our estimate of the "noise" or random error.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: STUDENTIZED RANGE STATISTIC (q) -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Find the Studentized Range Statistic (q)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📖 What is the Studentized Range (q)?</strong><br>
                    The studentized range distribution is used for multiple comparisons. The q-value depends on:
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li><strong>α</strong> = Significance level (${alpha})</li>
                        <li><strong>k</strong> = Number of groups (${k})</li>
                        <li><strong>df<sub>within</sub></strong> = Degrees of freedom (${dfWithin})</li>
                    </ul>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>From q-table lookup:</strong><br>
                    q<sub>${alpha}, ${k}, ${dfWithin}</sub> = <strong style="color: #1a5490; font-size: 18px;">${q.toFixed(4)}</strong>
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>Interpretation:</strong> This q-value is the critical threshold. Larger q means more conservative test (harder to find significance).
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: CALCULATE HSD FOR EACH COMPARISON -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Calculate HSD for Each Pairwise Comparison</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>Formula:</strong> HSD = q × √[MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>) / 2]
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #666;">
                    Note: When sample sizes are unequal, we use the harmonic mean or the specific n for each pair.
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 12px;">Comparison</th>
                            <th style="padding: 12px;">Mean₁ - Mean₂</th>
                            <th style="padding: 12px;">HSD Calculation</th>
                            <th style="padding: 12px;">HSD Critical Value</th>
                            <th style="padding: 12px;">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => {
                            const hsdCalc = `${q.toFixed(4)} × √[${msWithin.toFixed(4)} × (1/${c.n1} + 1/${c.n2}) / 2]`;
                            return `<tr style="border-bottom: 1px solid #e9ecef;">
                                <td style="padding: 12px; font-weight: bold;">${c.group1} vs ${c.group2}</td>
                                <td style="padding: 12px; text-align: center;">|${c.mean1.toFixed(4)} - ${c.mean2.toFixed(4)}| = ${c.diff.toFixed(4)}</td>
                                <td style="padding: 12px; font-family: monospace; font-size: 12px;">${hsdCalc}</td>
                                <td style="padding: 12px; text-align: center; font-weight: bold;">${c.hsd.toFixed(4)}</td>
                                <td style="padding: 12px; text-align: center; color: ${c.significant ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                    ${c.significant ? '✓ Significant (Reject H₀)' : '✗ Not Significant (Fail to Reject H₀)'}
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY TABLE -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Tukey HSD Summary Table</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Comparison</th>
                        <th style="padding: 12px;">Mean Difference</th>
                        <th style="padding: 12px;">Standard Error</th>
                        <th style="padding: 12px;">HSD Critical</th>
                        <th style="padding: 12px;">95% CI Lower</th>
                        <th style="padding: 12px;">95% CI Upper</th>
                        <th style="padding: 12px;">Significant?</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparisons.map(c => {
                        const se = Math.sqrt(msWithin * (1/c.n1 + 1/c.n2) / 2);
                        const ciLower = c.diff - c.hsd;
                        const ciUpper = c.diff + c.hsd;
                        return `<tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 12px; font-weight: bold;">${c.group1} - ${c.group2}</td>
                            <td style="text-align: center;">${c.diff.toFixed(4)}</td>
                            <td style="text-align: center;">${se.toFixed(4)}</td>
                            <td style="text-align: center; font-weight: bold;">${c.hsd.toFixed(4)}</td>
                            <td style="text-align: center;">${ciLower.toFixed(4)}</td>
                            <td style="text-align: center;">${ciUpper.toFixed(4)}</td>
                            <td style="text-align: center; color: ${c.significant ? '#28a745' : '#dc3545'};">
                                ${c.significant ? '✓ Yes' : '✗ No'}
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- 📌 CONCLUSION SECTION -->
        <div style="border-radius: 20px; padding: 25px; ${comparisons.some(c => c.significant) ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'} margin-bottom: 30px;">
            <h2 style="margin-top: 0;">📌 Step 5: Statistical Conclusion</h2>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>If |x̄<sub>i</sub> - x̄<sub>j</sub>| > HSD → Reject H₀ (means are significantly different)</p>
                
                <div style="margin: 15px 0; padding: 12px; background: white; border-radius: 8px;">
                    <strong>Results Summary:</strong><br>
                    • Total pairwise comparisons: ${comparisons.length}<br>
                    • Significant differences found: ${comparisons.filter(c => c.significant).length}<br>
                    • Not significant: ${comparisons.filter(c => !c.significant).length}
                </div>
                
                <h3>Final Interpretation:</h3>
                <p style="font-size: 16px;">
                    ${comparisons.filter(c => c.significant).length > 0 ? 
                        `✅ <strong>Significant differences detected.</strong> The following pairs show statistically significant differences at α = ${alpha}:<br>
                        ${comparisons.filter(c => c.significant).map(c => `&nbsp;&nbsp;• <strong>${c.group1} vs ${c.group2}</strong> (difference = ${c.diff.toFixed(4)}, HSD = ${c.hsd.toFixed(4)})`).join('<br>')}` : 
                        `❌ <strong>No significant differences detected.</strong> None of the pairwise comparisons exceeded the HSD critical value at α = ${alpha}.`}
                </p>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    💡 <strong>Practical Meaning:</strong> Tukey's HSD test controls the family-wise error rate. 
                    ${comparisons.filter(c => c.significant).length > 0 ? 
                        'The significant comparisons indicate that those groups have truly different population means.' : 
                        'Despite the significant ANOVA result, Tukey\'s HSD did not find specific pairwise differences (this can happen when groups overlap or with small sample sizes).'}
                </div>
            </div>
        </div>
        
        <!-- 💡 QUICK REFERENCE -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="color: #1a5490; margin-top: 0;">💡 Quick Reference: When to Use Tukey HSD</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>✅ Use Tukey HSD when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>ANOVA is significant</li>
                        <li>Equal or similar sample sizes</li>
                        <li>Want to compare ALL pairs</li>
                        <li>Homogeneity of variance holds</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong>❌ Consider alternatives when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Sample sizes are very unequal (use Games-Howell)</li>
                        <li>Only comparing to control group (use Dunnett's)</li>
                        <li>Testing complex contrasts (use Scheffé)</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    
    return { comparisons, hsd: comparisons[0]?.hsd, msWithin, q, steps };
}
// ========== BONFERRONI CORRECTION COMPUTATION ==========
// ========== BONFERRONI CORRECTION COMPUTATION (DETAILED) ==========
function computeBonferroniCorrection(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = groupName.trim();
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Bonferroni correction." };
    }
    
    const k = groups.size;
    const m = (k * (k - 1)) / 2; // number of pairwise comparisons
    const adjustedAlpha = alpha / m;
    
    // Calculate group statistics
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupVariances = new Map();
    let groupData = [];
    let allValues = [];
    
    for (let [group, values] of groups) {
        const sum = values.reduce((a,b) => a+b, 0);
        const mean = sum / values.length;
        const variance = values.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
        groupVariances.set(group, variance);
        allValues.push(...values);
        groupData.push({ group, values, mean, n: values.length, sum, variance });
    }
    
    const totalN = allValues.length;
    
    // Calculate pooled variance
    let ssWithin = 0;
    let ssWithinDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        ssWithinDetails.push(`\n   <strong>Group ${group}:</strong>`);
        for (let val of values) {
            const dev = val - mean;
            const sqDev = dev * dev;
            ssWithin += sqDev;
            ssWithinDetails.push(`      (${val} - ${mean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
        }
    }
    
    const dfWithin = totalN - k;
    const pooledVar = ssWithin / dfWithin;
    const pooledStd = Math.sqrt(pooledVar);
    
    // Calculate t-tests for each pair
    let comparisons = [];
    const groupList = Array.from(groups.keys());
    
    for (let i = 0; i < groupList.length; i++) {
        for (let j = i + 1; j < groupList.length; j++) {
            const group1 = groupList[i];
            const group2 = groupList[j];
            const mean1 = groupMeans.get(group1);
            const mean2 = groupMeans.get(group2);
            const n1 = groupSizes.get(group1);
            const n2 = groupSizes.get(group2);
            const diff = mean1 - mean2;
            const se = Math.sqrt(pooledVar * (1/n1 + 1/n2));
            const tStat = Math.abs(diff / se);
            const criticalT = tCriticalValue(adjustedAlpha / 2, dfWithin);
            const pValue = 2 * (1 - tCDF(tStat, dfWithin));
            const significant = pValue < adjustedAlpha;
            
            comparisons.push({
                group1, group2, mean1, mean2, n1, n2,
                diff, se, tStat, criticalT, pValue, significant
            });
        }
    }
    
    // Build comprehensive HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">✏️ Bonferroni Correction</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">Adjusting Significance Levels for Multiple Comparisons</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> α<sub>adjusted</sub> = α / m &nbsp;&nbsp;|&nbsp;&nbsp; m = number of comparisons
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 What is the Bonferroni Correction?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 The Multiple Comparisons Problem</h3>
                <p>When you perform multiple statistical tests, the chance of making a <strong>Type I error (false positive)</strong> increases dramatically.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <strong>Example:</strong> If you perform 10 independent tests each at α = 0.05:<br>
                    Probability of at least one false positive = 1 - (0.95)¹⁰ ≈ <strong style="color: #dc3545;">40%!</strong>
                </div>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px;">
                    💡 <strong>Analogy:</strong> It's like buying 10 lottery tickets instead of 1 — your chance of winning (or making a false discovery) increases with each test!
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How the Bonferroni Correction Works</h3>
                <p>The Bonferroni correction divides the original significance level (α) by the number of comparisons (m):</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; margin: 15px 0;">
                    <strong>α<sub>adjusted</sub> = α / m</strong>
                </div>
                <p>This ensures that the <strong>family-wise error rate</strong> (probability of making at least one Type I error across all tests) ≤ α.</p>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    ⚠️ <strong>Trade-off:</strong> The correction is conservative — it reduces false positives but increases the risk of false negatives (Type II errors).
                </div>
            </div>
        </div>
        
        <!-- 📊 STEP 1: INPUT DATA -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📋 Step 1: Input Data Summary</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Group</th>
                        <th style="padding: 12px;">n</th>
                        <th style="padding: 12px;">Σx</th>
                        <th style="padding: 12px;">Mean (x̄)</th>
                        <th style="padding: 12px;">Variance (s²)</th>
                        <th style="padding: 12px;">Values</th>
                    </tr></thead>
                    <tbody>
                        ${groupData.map(g => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${g.group}</td>
                            <td style="padding: 10px; text-align: center;">${g.n}</td>
                            <td style="padding: 10px; text-align: center;">${g.sum}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${g.mean.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${g.variance.toFixed(4)}</td>
                            <td style="padding: 10px;">${g.values.join(', ')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Number of pairwise comparisons (m) = ${m}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: CALCULATE POOLED VARIANCE -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate Pooled Variance (s²<sub>pooled</sub>)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Formula:</strong> s²<sub>pooled</sub> = Σ(xᵢⱼ - x̄ⱼ)² / (N - k)
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Step 2a: Calculate Sum of Squared Deviations Within Groups</strong>
                    ${ssWithinDetails.join('<br>')}
                    <div style="margin-top: 10px;"><strong>Σ(xᵢⱼ - x̄ⱼ)² = ${ssWithin.toFixed(4)}</strong></div>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>Step 2b: Calculate Pooled Variance</strong><br>
                    s²<sub>pooled</sub> = ${ssWithin.toFixed(4)} / (${totalN} - ${k}) = ${ssWithin.toFixed(4)} / ${dfWithin}<br>
                    <strong style="color: #1a5490; font-size: 18px;">s²<sub>pooled</sub> = ${pooledVar.toFixed(6)}</strong><br>
                    s<sub>pooled</sub> = √${pooledVar.toFixed(6)} = ${pooledStd.toFixed(6)}
                </div>
                
                <div style="margin-top: 12px; background: #d4edda; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>What is pooled variance?</strong> It's a weighted average of the group variances, assuming the true population variances are equal.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: APPLY BONFERRONI CORRECTION -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Apply the Bonferroni Correction</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Formula:</strong> α<sub>adjusted</sub> = α / m
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: #666;">Original α</div>
                        <div style="font-size: 28px; font-weight: 700;">${alpha}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: #666;">Number of Comparisons (m)</div>
                        <div style="font-size: 28px; font-weight: 700;">${m}</div>
                        <div style="font-size: 11px;">= ${k} × (${k}-1) / 2</div>
                    </div>
                    <div style="background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: #155724;">Adjusted α</div>
                        <div style="font-size: 28px; font-weight: 700; color: #28a745;">${adjustedAlpha.toFixed(6)}</div>
                    </div>
                </div>
                
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                    <strong>📖 Interpretation:</strong> Each individual comparison must have p-value &lt; ${adjustedAlpha.toFixed(6)} to be considered statistically significant at family-wise α = ${alpha}.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: PAIRWISE T-TESTS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Perform Pairwise t-tests with Bonferroni Correction</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px;">
                    <strong>Formula:</strong> t = (x̄₁ - x̄₂) / √[s²<sub>pooled</sub> × (1/n₁ + 1/n₂)]
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Comparison</th>
                            <th style="padding: 10px;">Mean Diff</th>
                            <th style="padding: 10px;">Standard Error</th>
                            <th style="padding: 10px;">t-statistic</th>
                            <th style="padding: 10px;">Critical t</th>
                            <th style="padding: 10px;">p-value</th>
                            <th style="padding: 10px;">Significant?</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; font-weight: bold;">${c.group1} vs ${c.group2}</td>
                            <td style="padding: 10px; text-align: center;">${c.diff.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${c.se.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${c.tStat.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${c.criticalT.toFixed(4)}</td>
                            <td style="padding: 10px; text-align: center;">${c.pValue.toFixed(6)}</td>
                            <td style="padding: 10px; text-align: center; color: ${c.significant ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                ${c.significant ? '✓ Yes' : '✗ No'}
                             </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <strong>Detailed Calculation for ${comparisons[0]?.group1} vs ${comparisons[0]?.group2}:</strong><br>
                t = (${comparisons[0]?.mean1.toFixed(4)} - ${comparisons[0]?.mean2.toFixed(4)}) / √[${pooledVar.toFixed(4)} × (1/${comparisons[0]?.n1} + 1/${comparisons[0]?.n2})]<br>
                t = ${comparisons[0]?.diff.toFixed(4)} / √[${pooledVar.toFixed(4)} × ${(1/comparisons[0]?.n1 + 1/comparisons[0]?.n2).toFixed(4)}]<br>
                t = ${comparisons[0]?.diff.toFixed(4)} / ${comparisons[0]?.se.toFixed(4)} = <strong>${comparisons[0]?.tStat.toFixed(4)}</strong>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Bonferroni Correction Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Parameter</th>
                        <th style="padding: 12px;">Value</th>
                        <th style="padding: 12px;">Explanation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Number of groups (k)</td>
                        <td style="text-align: center;">${k}</td>
                        <td>Number of categories being compared</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Number of comparisons (m)</td>
                        <td style="text-align: center;">${m}</td>
                        <td>Total pairwise comparisons = k(k-1)/2</td>
                     </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Original α</td>
                        <td style="text-align: center;">${alpha}</td>
                        <td>Desired family-wise error rate</td>
                     </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Adjusted α</td>
                        <td style="text-align: center; font-weight: bold; color: #1a5490;">${adjustedAlpha.toFixed(6)}</td>
                        <td>α / m = ${alpha} / ${m}</td>
                     </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Pooled Variance (s²<sub>pooled</sub>)</td>
                        <td style="text-align: center;">${pooledVar.toFixed(6)}</td>
                        <td>Weighted average of group variances</td>
                     </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Degrees of Freedom (df)</td>
                        <td style="text-align: center;">${dfWithin}</td>
                        <td>N - k = ${totalN} - ${k}</td>
                     </tr>
                    <tr>
                        <td style="padding: 12px;">Significant Comparisons</td>
                        <td style="text-align: center; font-weight: bold; color: ${comparisons.filter(c => c.significant).length > 0 ? '#28a745' : '#dc3545'};">${comparisons.filter(c => c.significant).length} / ${comparisons.length}</td>
                        <td>Comparisons with p-value &lt; ${adjustedAlpha.toFixed(6)}</td>
                     </tr>
                </tbody>
             </table>
        </div>
        
        <!-- 📌 CONCLUSION -->
        <div style="border-radius: 20px; padding: 25px; ${comparisons.some(c => c.significant) ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'}">
            <h2 style="margin-top: 0;">📌 Step 5: Conclusion</h2>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>For each comparison, reject H₀ if p-value &lt; α<sub>adjusted</sub> = ${adjustedAlpha.toFixed(6)}</p>
                
                <div style="margin: 15px 0; padding: 12px; background: white; border-radius: 8px;">
                    <strong>Final Result:</strong><br>
                    ${comparisons.some(c => c.significant) ? 
                        `✅ <strong>Significant differences detected</strong> after Bonferroni correction.<br>
                        ${comparisons.filter(c => c.significant).map(c => `• <strong>${c.group1} vs ${c.group2}</strong>: p = ${c.pValue.toFixed(6)} &lt; ${adjustedAlpha.toFixed(6)}`).join('<br>')}` : 
                        `❌ <strong>No significant differences</strong> after Bonferroni correction.<br>
                        All p-values > ${adjustedAlpha.toFixed(6)}`}
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    💡 <strong>Practical Interpretation:</strong><br>
                    The Bonferroni correction controls the family-wise error rate at α = ${alpha}. 
                    ${comparisons.some(c => c.significant) ? 
                        'This means we can be confident that the observed differences are not due to chance.' : 
                        'Even though the ANOVA might have been significant, the Bonferroni correction suggests no specific pairwise differences (this can happen when groups overlap or with small sample sizes).'}
                </div>
            </div>
        </div>
        
        <!-- 💡 ADVANTAGES & DISADVANTAGES -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 20px;">
            <h3 style="color: #1a5490; margin-top: 0;">💡 Pros & Cons of Bonferroni Correction</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #28a745;">✅ Advantages:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Simple and easy to understand</li>
                        <li>Very conservative — controls Type I error well</li>
                        <li>Works for any number of comparisons</li>
                        <li>Doesn't require equal sample sizes</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #dc3545;">❌ Disadvantages:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0;">
                        <li>Can be too conservative (increases Type II error)</li>
                        <li>Less powerful than other methods (Tukey, Scheffé)</li>
                        <li>Assumes independent tests</li>
                        <li>Not recommended for large numbers of comparisons</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    
    return { comparisons, adjustedAlpha, steps };
}
// ========== SCHEFFÉ TEST COMPUTATION ==========
// ========== SCHEFFÉ TEST COMPUTATION (DETAILED) ==========
function computeScheffeTest(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = groupName.trim();
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Scheffé test." };
    }
    
    const k = groups.size;
    let groupMeans = new Map();
    let groupSizes = new Map();
    let groupData = [];
    let allValues = [];
    
    for (let [group, values] of groups) {
        const sum = values.reduce((a,b) => a+b, 0);
        const mean = sum / values.length;
        groupMeans.set(group, mean);
        groupSizes.set(group, values.length);
        allValues.push(...values);
        groupData.push({ group, values, mean, n: values.length, sum });
    }
    
    const totalN = allValues.length;
    const grandMean = allValues.reduce((a,b) => a+b, 0) / totalN;
    
    // Calculate SS_within
    let ssWithin = 0;
    let ssWithinDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        ssWithinDetails.push(`\n   <strong>Group ${group}:</strong> Mean = ${mean.toFixed(4)}`);
        for (let val of values) {
            const dev = val - mean;
            const sqDev = dev * dev;
            ssWithin += sqDev;
            ssWithinDetails.push(`      (${val} - ${mean.toFixed(4)})² = ${sqDev.toFixed(4)}`);
        }
    }
    
    const dfWithin = totalN - k;
    const msWithin = ssWithin / dfWithin;
    
    // Calculate SS_between
    let ssBetween = 0;
    let ssBetweenDetails = [];
    for (let [group, values] of groups) {
        const mean = groupMeans.get(group);
        const n = groupSizes.get(group);
        const dev = mean - grandMean;
        const contribution = n * dev * dev;
        ssBetween += contribution;
        ssBetweenDetails.push(`   Group ${group}: ${n} × (${mean.toFixed(4)} - ${grandMean.toFixed(4)})² = ${contribution.toFixed(4)}`);
    }
    
    const dfBetween = k - 1;
    const fStatistic = (ssBetween / dfBetween) / msWithin;
    const fCritical = fCriticalValue(alpha, dfBetween, dfWithin);
    
    // Calculate comparisons
    const groupList = Array.from(groups.keys());
    let comparisons = [];
    
    for (let i = 0; i < groupList.length; i++) {
        for (let j = i + 1; j < groupList.length; j++) {
            const group1 = groupList[i];
            const group2 = groupList[j];
            const mean1 = groupMeans.get(group1);
            const mean2 = groupMeans.get(group2);
            const n1 = groupSizes.get(group1);
            const n2 = groupSizes.get(group2);
            const diff = Math.abs(mean1 - mean2);
            const scheffeValue = Math.sqrt((k - 1) * fCritical * msWithin * (1/n1 + 1/n2));
            const significant = diff > scheffeValue;
            
            comparisons.push({
                group1, group2, mean1, mean2, n1, n2,
                diff, scheffeValue, significant
            });
        }
    }
    
    // Build comprehensive HTML output
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        
        <!-- HEADER SECTION -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📐 Scheffé Test</h1>
            <p style="margin: 0; opacity: 0.95; font-size: 16px;">The Most Flexible Post-hoc Test for Complex Comparisons</p>
            <div style="margin-top: 15px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 12px; font-family: monospace; font-size: 14px;">
                <strong>📐 Formula:</strong> S = √[(k-1) × F<sub>α,k-1,N-k</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]
            </div>
        </div>
        
        <!-- 📚 CONCEPT EXPLANATION -->
        <div style="background: linear-gradient(135deg, #f0f4fa 0%, #e8eef5 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📚 What is the Scheffé Test?</h2>
            
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">🎯 What Makes Scheffé Special?</h3>
                <p>The Scheffé test is the <strong>most flexible</strong> post-hoc method because it allows testing <strong>any contrast</strong> (not just pairwise comparisons).</p>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 10px; margin-top: 10px;">
                    💡 <strong>What's a contrast?</strong> A contrast is a linear combination of group means. Examples:<br>
                    • Pairwise: μ<sub>A</sub> - μ<sub>B</sub><br>
                    • Complex: (μ<sub>A</sub> + μ<sub>B</sub>)/2 - μ<sub>C</sub><br>
                    • Trend: μ<sub>A</sub> - 2μ<sub>B</sub> + μ<sub>C</sub>
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px;">
                <h3 style="color: #1a5490;">🔬 How the Scheffé Test Works</h3>
                <p>The Scheffé test uses the same F-distribution as ANOVA but with an adjusted critical value:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; margin: 15px 0;">
                    <strong>S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]</strong>
                </div>
                <p><strong>Key Property:</strong> If the overall ANOVA is not significant, NO contrast will be significant with Scheffé. This makes it the most conservative test.</p>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    ⚠️ <strong>Trade-off:</strong> Most conservative → Hardest to find significance, but protects against Type I error for ALL possible contrasts.
                </div>
            </div>
        </div>
        
        <!-- 📊 STEP 1: INPUT DATA -->
        <div style="background: #f8f9fa; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">📋 Step 1: Input Data Summary</h2>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 15px; overflow: hidden;">
                    <thead><tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px;">Group</th>
                        <th style="padding: 12px;">n</th>
                        <th style="padding: 12px;">Σx</th>
                        <th style="padding: 12px;">Mean (x̄)</th>
                        <th style="padding: 12px;">Values</th>
                    </tr></thead>
                    <tbody>
                        ${groupData.map(g => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${g.group}</td>
                            <td style="padding: 10px; text-align: center;">${g.n}</td>
                            <td style="padding: 10px; text-align: center;">${g.sum}</td>
                            <td style="padding: 10px; text-align: center; background: #e8f4f8; font-weight: bold;">${g.mean.toFixed(4)}</td>
                            <td style="padding: 10px;">${g.values.join(', ')}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 10px;">
                <strong>📌 Summary:</strong> Total observations (N) = ${totalN} | Number of groups (k) = ${k} | Grand Mean = ${grandMean.toFixed(4)}
            </div>
        </div>
        
        <!-- 🔢 STEP 2: ANOVA CALCULATIONS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Complete ANOVA Calculations</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2a: Sum of Squares Within (SS<sub>within</sub>)</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>Formula:</strong> SS<sub>within</sub> = Σ(xᵢⱼ - x̄ⱼ)²
                </div>
                ${ssWithinDetails.join('<br>')}
                <div style="margin-top: 15px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>within</sub> = ${ssWithin.toFixed(4)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2b: Sum of Squares Between (SS<sub>between</sub>)</h3>
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>Formula:</strong> SS<sub>between</sub> = Σ nⱼ(x̄ⱼ - x̄)²
                </div>
                ${ssBetweenDetails.join('<br>')}
                <div style="margin-top: 15px; padding: 10px; background: #1a5490; color: white; border-radius: 8px; text-align: center;">
                    <strong>SS<sub>between</sub> = ${ssBetween.toFixed(4)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">📊 Step 2c: Mean Squares and F-statistic</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>df<sub>between</sub></strong> = k - 1 = ${k} - 1 = ${dfBetween}<br>
                    <strong>MS<sub>between</sub></strong> = SS<sub>between</sub> / df<sub>between</sub> = ${ssBetween.toFixed(4)} / ${dfBetween} = ${(ssBetween/dfBetween).toFixed(4)}<br><br>
                    <strong>df<sub>within</sub></strong> = N - k = ${totalN} - ${k} = ${dfWithin}<br>
                    <strong>MS<sub>within</sub></strong> = SS<sub>within</sub> / df<sub>within</sub> = ${ssWithin.toFixed(4)} / ${dfWithin} = <strong style="color: #1a5490;">${msWithin.toFixed(6)}</strong><br><br>
                    <strong>F-statistic</strong> = MS<sub>between</sub> / MS<sub>within</sub> = ${(ssBetween/dfBetween).toFixed(4)} / ${msWithin.toFixed(4)} = ${fStatistic.toFixed(6)}
                </div>
                <div style="margin-top: 12px; background: #d4edda; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>F-critical value:</strong> F<sub>${alpha}, ${dfBetween}, ${dfWithin}</sub> = ${fCritical.toFixed(4)}
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 3: SCHEFFÉ CRITICAL VALUE -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 3: Calculate Scheffé Critical Value</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="background: #f0f4fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Formula:</strong> S = √[(k-1) × F<sub>critical</sub> × MS<sub>within</sub> × (1/n<sub>i</sub> + 1/n<sub>j</sub>)]
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Components:</strong><br>
                    • (k-1) = ${k} - 1 = ${dfBetween}<br>
                    • F<sub>critical</sub> = ${fCritical.toFixed(4)} (at α = ${alpha})<br>
                    • MS<sub>within</sub> = ${msWithin.toFixed(6)}<br>
                    • (1/n<sub>i</sub> + 1/n<sub>j</sub>) = varies by comparison
                </div>
                
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                    <strong>📖 Why is Scheffé the most conservative?</strong><br>
                    It uses (k-1) × F<sub>critical</sub> instead of just t or q. For k=3, this multiplies the critical value by √2 ≈ 1.41, making it harder to find significance.
                </div>
            </div>
        </div>
        
        <!-- 🔢 STEP 4: PAIRWISE COMPARISONS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Apply Scheffé Test to All Pairwise Comparisons</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 12px;">Comparison</th>
                            <th style="padding: 12px;">Mean Difference</th>
                            <th style="padding: 12px;">Scheffé Calculation</th>
                            <th style="padding: 12px;">S Critical Value</th>
                            <th style="padding: 12px;">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisons.map(c => {
                            const scheffeCalc = `√[${dfBetween} × ${fCritical.toFixed(4)} × ${msWithin.toFixed(4)} × (1/${c.n1} + 1/${c.n2})]`;
                            return `<tr style="border-bottom: 1px solid #e9ecef;">
                                <td style="padding: 12px; font-weight: bold;">${c.group1} vs ${c.group2}</td>
                                <td style="padding: 12px; text-align: center;">|${c.mean1.toFixed(4)} - ${c.mean2.toFixed(4)}| = ${c.diff.toFixed(4)}</td>
                                <td style="padding: 12px; font-family: monospace; font-size: 11px;">${scheffeCalc}</td>
                                <td style="padding: 12px; text-align: center; font-weight: bold;">${c.scheffeValue.toFixed(4)}</td>
                                <td style="padding: 12px; text-align: center; color: ${c.significant ? '#28a745' : '#dc3545'}; font-weight: bold;">
                                    ${c.significant ? '✓ Significant' : '✗ Not Significant'}
                                 </td>
                             </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 📊 STEP 5: RESULTS SUMMARY -->
        <div style="background: white; border-radius: 20px; margin-bottom: 30px; border: 2px solid #1a5490; overflow-x: auto;">
            <h2 style="margin: 0; padding: 20px; background: #1a5490; color: white; text-align: center;">📊 Scheffé Test Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Parameter</th>
                        <th style="padding: 12px;">Value</th>
                        <th style="padding: 12px;">Explanation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Number of groups (k)</td>
                        <td style="text-align: center;">${k}</td>
                        <td>Categories compared in ANOVA</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">MS<sub>within</sub> (Error variance)</td>
                        <td style="text-align: center;">${msWithin.toFixed(6)}</td>
                        <td>Pooled variance within groups</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">F<sub>critical</sub> (ANOVA)</td>
                        <td style="text-align: center;">${fCritical.toFixed(4)}</td>
                        <td>Critical value for overall ANOVA</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Scheffé Multiplier</td>
                        <td style="text-align: center; font-weight: bold;">${Math.sqrt(dfBetween * fCritical).toFixed(4)}</td>
                        <td>√[(k-1) × F<sub>critical</sub>] = ${Math.sqrt(dfBetween * fCritical).toFixed(4)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Total Comparisons</td>
                        <td style="text-align: center;">${comparisons.length}</td>
                        <td>All possible pairwise comparisons</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px;">Significant Comparisons</td>
                        <td style="text-align: center; font-weight: bold; color: ${comparisons.filter(c => c.significant).length > 0 ? '#28a745' : '#dc3545'};">${comparisons.filter(c => c.significant).length}</td>
                        <td>Pairs where |diff| > S</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- 📌 CONCLUSION -->
        <div style="border-radius: 20px; padding: 25px; ${comparisons.some(c => c.significant) ? 'background: #d4edda; border-left: 8px solid #28a745;' : 'background: #f8d7da; border-left: 8px solid #dc3545;'} margin-bottom: 30px;">
            <h2 style="margin-top: 0;">📌 Step 5: Statistical Conclusion</h2>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 20px;">
                <h3>Decision Rule:</h3>
                <p>For each comparison, reject H₀ if |x̄<sub>i</sub> - x̄<sub>j</sub>| > S (Scheffé critical value)</p>
                
                <div style="margin: 15px 0; padding: 12px; background: white; border-radius: 8px;">
                    <strong>Overall ANOVA Result:</strong><br>
                    F = ${fStatistic.toFixed(4)} | Critical F = ${fCritical.toFixed(4)} | ${fStatistic > fCritical ? 'ANOVA is SIGNIFICANT' : 'ANOVA is NOT significant'}
                </div>
                
                <div style="margin: 15px 0; padding: 12px; background: white; border-radius: 8px;">
                    <strong>Scheffé Test Result:</strong><br>
                    ${comparisons.some(c => c.significant) ? 
                        `✅ <strong>Significant differences detected</strong> with Scheffé test.<br>
                        ${comparisons.filter(c => c.significant).map(c => `• <strong>${c.group1} vs ${c.group2}</strong>: |diff| = ${c.diff.toFixed(4)} > S = ${c.scheffeValue.toFixed(4)}`).join('<br>')}` : 
                        `❌ <strong>No significant differences</strong> with Scheffé test.<br>
                        All mean differences are less than the Scheffé critical values.`}
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                    💡 <strong>Practical Interpretation:</strong><br>
                    The Scheffé test is the <strong>most conservative</strong> post-hoc method. 
                    ${comparisons.some(c => c.significant) ? 
                        'Since significant differences were found despite the conservative nature, these group differences are very robust.' : 
                        'Even if the ANOVA was significant, Scheffé found no specific pairwise differences. This often happens when group means overlap or with small sample sizes.'}
                </div>
            </div>
        </div>
        
        <!-- 💡 COMPARISON WITH OTHER TESTS -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="color: #1a5490; margin-top: 0;">💡 When to Use Scheffé vs Other Post-hoc Tests</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #28a745;">✅ Use Scheffé when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0; font-size: 12px;">
                        <li>Testing complex contrasts</li>
                        <li>Sample sizes are unequal</li>
                        <li>You want maximum protection</li>
                        <li>ANOVA is significant</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #ffc107;">📊 Use Tukey when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0; font-size: 12px;">
                        <li>Only pairwise comparisons needed</li>
                        <li>Sample sizes are equal/similar</li>
                        <li>You want more power</li>
                    </ul>
                </div>
                <div style="background: white; border-radius: 10px; padding: 12px;">
                    <strong style="color: #17a2b8;">📈 Use Bonferroni when:</strong>
                    <ul style="margin-top: 8px; margin-bottom: 0; font-size: 12px;">
                        <li>Few comparisons (small m)</li>
                        <li>Simplicity is important</li>
                        <li>Tests are independent</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    
    return { comparisons, scheffeCritical: comparisons[0]?.scheffeValue, fCritical, fStatistic, steps };
}
// ========== TUKEY HSD SETUP ==========
function setupTukeyHSDLogic() {
    const computeBtn = document.getElementById("tukeyComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("tukeyData").value;
        const alpha = parseFloat(document.getElementById("tukeyAlpha").value);
        const resultDiv = document.getElementById("tukeyResultArea");
        const valueSpan = document.getElementById("tukeyValueDisplay");
        const stepsSpan = document.getElementById("tukeyStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format 'value:group'";
            return;
        }
        
        const result = computeTukeyHSD(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            const sigCount = result.comparisons.filter(c => c.significant).length;
            valueSpan.innerHTML = `${sigCount}/${result.comparisons.length} comparisons significant | HSD = ${result.hsd?.toFixed(4) || 'N/A'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("tukeyClearBtn", "tukeyData", "tukeyResultArea");
}

// ========== BONFERRONI SETUP ==========
function setupBonferroniLogic() {
    const computeBtn = document.getElementById("bonferroniComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("bonferroniData").value;
        const alpha = parseFloat(document.getElementById("bonferroniAlpha").value);
        const resultDiv = document.getElementById("bonferroniResultArea");
        const valueSpan = document.getElementById("bonferroniValueDisplay");
        const stepsSpan = document.getElementById("bonferroniStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format 'value:group'";
            return;
        }
        
        const result = computeBonferroniCorrection(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `α_adj = ${result.adjustedAlpha.toFixed(6)} | ${result.comparisons.filter(c => c.significant).length} significant comparisons`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("bonferroniClearBtn", "bonferroniData", "bonferroniResultArea");
}

// ========== SCHEFFÉ SETUP ==========
function setupScheffeLogic() {
    const computeBtn = document.getElementById("scheffeComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("scheffeData").value;
        const alpha = parseFloat(document.getElementById("scheffeAlpha").value);
        const resultDiv = document.getElementById("scheffeResultArea");
        const valueSpan = document.getElementById("scheffeValueDisplay");
        const stepsSpan = document.getElementById("scheffeStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data in format 'value:group'";
            return;
        }
        
        const result = computeScheffeTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            const sigCount = result.comparisons.filter(c => c.significant).length;
            valueSpan.innerHTML = `${sigCount}/${result.comparisons.length} comparisons significant | F_crit = ${result.fCritical?.toFixed(4) || 'N/A'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("scheffeClearBtn", "scheffeData", "scheffeResultArea");
}
// ========== STANDARD ERRORS OF COEFFICIENTS INTERFACE ==========
function renderStdErrorsInterface() {
    return `
        <div class="stat-interface" id="statStdErrorsInterface">
            <div class="interface-title">📏 Standard Errors of Regression Coefficients</div>
            <div class="formula-card">
                <div class="formula">📌 SE(β₁) = √[MSE / Σ(xᵢ - x̄)²]</div>
                <div class="formula" style="margin-top: 8px;">📌 SE(β₀) = √[MSE × (1/n + x̄²/Σ(xᵢ - x̄)²)]</div>
                <div class="desc">
                    <strong>What are Standard Errors?</strong><br>
                    Standard errors measure the precision of coefficient estimates. 
                    Smaller SE = more precise estimate. Used to construct confidence intervals and t-statistics.
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (independent variable):</label>
                <textarea id="stderrorsXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter Y values (dependent variable):</label>
                <textarea id="stderrorsYInput" rows="3" placeholder="Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="stderrorsComputeBtn">📏 Calculate Standard Errors + Full Steps</button>
                    <button class="secondary-btn" id="stderrorsClearBtn">Clear All</button>
                </div>
            </div>
            <div id="stderrorsResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 STANDARD ERRORS RESULTS</div>
                    <div class="result-value" id="stderrorsValueDisplay">—</div>
                    <div class="calculation-steps" id="stderrorsStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== T-STATISTICS FOR COEFFICIENTS INTERFACE ==========
function renderTStatsInterface() {
    return `
        <div class="stat-interface" id="statTStatsInterface">
            <div class="interface-title">t-Statistics for Regression Coefficients</div>
            <div class="formula-card">
                <div class="formula">📌 t = β̂ / SE(β̂)</div>
                <div class="desc">
                    <strong>What are t-statistics?</strong><br>
                    t-statistics test whether coefficients are significantly different from zero.
                    H₀: β = 0 (no effect) | H₁: β ≠ 0 (significant effect)
                    |t| > 2 typically indicates significance at α = 0.05.
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (independent variable):</label>
                <textarea id="tstatsXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter Y values (dependent variable):</label>
                <textarea id="tstatsYInput" rows="3" placeholder="Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="tstatsComputeBtn">t Calculate t-Statistics + Full Steps</button>
                    <button class="secondary-btn" id="tstatsClearBtn">Clear All</button>
                </div>
            </div>
            <div id="tstatsResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 T-STATISTICS RESULTS</div>
                    <div class="result-value" id="tstatsValueDisplay">—</div>
                    <div class="calculation-steps" id="tstatsStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== F-TEST FOR OVERALL SIGNIFICANCE INTERFACE ==========
function renderFTestOverallInterface() {
    return `
        <div class="stat-interface" id="statFTestOverallInterface">
            <div class="interface-title">F-Test for Overall Model Significance</div>
            <div class="formula-card">
                <div class="formula">📌 F = (SS<sub>reg</sub> / k) / (SS<sub>res</sub> / (n - k - 1))</div>
                <div class="desc">
                    <strong>What is the F-test?</strong><br>
                    Tests whether the regression model explains a significant portion of variance.
                    H₀: All coefficients = 0 (model is useless) | H₁: At least one coefficient ≠ 0 (model is useful)
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (independent variable):</label>
                <textarea id="ftestOverallXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter Y values (dependent variable):</label>
                <textarea id="ftestOverallYInput" rows="3" placeholder="Example: 2.1, 3.9, 6.5, 7.8, 10.4, 11.9, 14.6, 15.8, 18.5, 19.7"></textarea>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="ftestOverallAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="ftestOverallComputeBtn">F Calculate F-Test + Full Steps</button>
                    <button class="secondary-btn" id="ftestOverallClearBtn">Clear All</button>
                </div>
            </div>
            <div id="ftestOverallResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 F-TEST RESULTS</div>
                    <div class="result-value" id="ftestOverallValueDisplay">—</div>
                    <div class="calculation-steps" id="ftestOverallStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== STANDARD ERRORS COMPUTATION (REDESIGNED WITH TABLES) ==========
function computeStdErrorsWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
    }
    
    const n = xValues.length;
    const meanX = xValues.reduce((a,b) => a+b, 0) / n;
    const meanY = yValues.reduce((a,b) => a+b, 0) / n;
    
    // Build deviation table
    let deviationRows = '';
    let numerator = 0, denominator = 0;
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        const product = xDev * yDev;
        const xSq = xDev * xDev;
        numerator += product;
        denominator += xSq;
        
        deviationRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]} - ${meanX.toFixed(4)} = ${xDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]} - ${meanY.toFixed(4)} = ${yDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; font-weight: 600; color: #1a5490;">${product.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${xSq.toFixed(4)}</td>
        </tr>`;
    }
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Build predictions and residuals table
    let predictionsRows = '';
    let ssRes = 0;
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        ssRes += residual * residual;
        
        predictionsRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${intercept.toFixed(4)} + ${slope.toFixed(4)}×${xValues[i]} = ${yPred.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; ${residual >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">${residual.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${(residual * residual).toFixed(4)}</td>
        </tr>`;
    }
    
    const mse = ssRes / (n - 2);
    const seSlope = Math.sqrt(mse / denominator);
    const seIntercept = Math.sqrt(mse * (1/n + Math.pow(meanX, 2) / denominator));
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">📏 Standard Errors of Regression Coefficients</h1>
            <p style="margin: 0; opacity: 0.95;">SE(β₁) = √[MSE / Σ(xᵢ - x̄)²] &nbsp;|&nbsp; SE(β₀) = √[MSE × (1/n + x̄²/Σ(xᵢ - x̄)²)]</p>
        </div>
        
        <!-- STEP 1: DEVIATIONS TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0;">📊 Step 1: Calculate Deviations and Cross-Products</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px;">i</th>
                        <th style="padding: 12px;">x</th>
                        <th style="padding: 12px;">y</th>
                        <th style="padding: 12px;">x - x̄</th>
                        <th style="padding: 12px;">y - ȳ</th>
                        <th style="padding: 12px;">(x - x̄)(y - ȳ)</th>
                        <th style="padding: 12px;">(x - x̄)²</th>
                    </tr>
                </thead>
                <tbody>
                    ${deviationRows}
                    <tr style="background: #e9ecef; font-weight: 700; border-top: 2px solid #1a5490;">
                        <td colspan="5" style="padding: 12px; text-align: right;">SUM →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white;">${numerator.toFixed(4)}</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white;">${denominator.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 2: REGRESSION COEFFICIENTS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1a5490; margin-top: 0;">🔢 Step 2: Calculate Regression Coefficients</h3>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 12px; color: #666;">Slope (β₁)</div>
                        <div style="font-size: 24px; font-weight: 700; color: #1a5490;">β₁ = ${slope.toFixed(6)}</div>
                        <div style="font-size: 11px;">= ${numerator.toFixed(4)} / ${denominator.toFixed(4)}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 12px; color: #666;">Intercept (β₀)</div>
                        <div style="font-size: 24px; font-weight: 700; color: #1a5490;">β₀ = ${intercept.toFixed(6)}</div>
                        <div style="font-size: 11px;">= ${meanY.toFixed(4)} - ${slope.toFixed(4)}×${meanX.toFixed(4)}</div>
                    </div>
                </div>
                <div style="margin-top: 15px; background: #e8f4f8; padding: 12px; border-radius: 8px; text-align: center;">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- STEP 3: PREDICTIONS AND RESIDUALS TABLE -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: #1a5490; color: white; padding: 14px 20px;">
                <h3 style="margin: 0;">📊 Step 3: Calculate Predictions and Residuals</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e8f4f8; border-bottom: 2px solid #1a5490;">
                        <th style="padding: 12px;">i</th>
                        <th style="padding: 12px;">x</th>
                        <th style="padding: 12px;">y</th>
                        <th style="padding: 12px;">Predicted (ŷ)</th>
                        <th style="padding: 12px;">Residual (e = y - ŷ)</th>
                        <th style="padding: 12px;">e²</th>
                    </tr>
                </thead>
                <tbody>
                    ${predictionsRows}
                    <tr style="background: #e9ecef; font-weight: 700; border-top: 2px solid #1a5490;">
                        <td colspan="5" style="padding: 12px; text-align: right;">SS<sub>res</sub> = Σe² →</td>
                        <td style="padding: 12px; text-align: center; background: #1a5490; color: white;">${ssRes.toFixed(4)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- STEP 4: MSE AND STANDARD ERRORS -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1a5490; margin-top: 0;">🔢 Step 4: Calculate MSE and Standard Errors</h3>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <div style="background: #f0f4fa; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <strong>📐 Mean Squared Error (MSE)</strong><br>
                    MSE = SS<sub>res</sub> / (n - 2) = ${ssRes.toFixed(4)} / ${n-2} = <strong style="color: #1a5490;">${mse.toFixed(6)}</strong>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                        <strong>📐 Standard Error of Slope (SE<sub>β₁</sub>)</strong><br>
                        SE(β₁) = √[MSE / Σ(x - x̄)²]<br>
                        = √[${mse.toFixed(6)} / ${denominator.toFixed(4)}]<br>
                        = √${(mse/denominator).toFixed(6)}<br>
                        = <strong style="color: #1a5490; font-size: 18px;">${seSlope.toFixed(8)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                        <strong>📐 Standard Error of Intercept (SE<sub>β₀</sub>)</strong><br>
                        SE(β₀) = √[MSE × (1/n + x̄²/Σ(x - x̄)²)]<br>
                        = √[${mse.toFixed(6)} × (1/${n} + ${Math.pow(meanX,2).toFixed(4)}/${denominator.toFixed(4)})]<br>
                        = √[${mse.toFixed(6)} × ${(1/n + Math.pow(meanX,2)/denominator).toFixed(6)}]<br>
                        = <strong style="color: #1a5490; font-size: 18px;">${seIntercept.toFixed(8)}</strong>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- RESULTS SUMMARY -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; border: 2px solid #1a5490; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 Standard Errors Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Coefficient</th>
                        <th style="padding: 12px;">Estimate (β̂)</th>
                        <th style="padding: 12px;">Standard Error (SE)</th>
                        <th style="padding: 12px;">95% Confidence Interval</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Intercept (β₀)</td>
                        <td style="text-align: center;">${intercept.toFixed(6)}</td>
                        <td style="text-align: center; font-weight: bold; color: #1a5490;">${seIntercept.toFixed(6)}</td>
                        <td style="text-align: center;">[${(intercept - 1.96*seIntercept).toFixed(4)}, ${(intercept + 1.96*seIntercept).toFixed(4)}]</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Slope (β₁)</td>
                        <td style="text-align: center;">${slope.toFixed(6)}</td>
                        <td style="text-align: center; font-weight: bold; color: #1a5490;">${seSlope.toFixed(6)}</td>
                        <td style="text-align: center;">[${(slope - 1.96*seSlope).toFixed(4)}, ${(slope + 1.96*seSlope).toFixed(4)}]</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- INTERPRETATION -->
        <div style="background: #d4edda; border-radius: 16px; padding: 20px; border-left: 6px solid #28a745;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <p><strong>SE(β₀) = ${seIntercept.toFixed(6)}</strong> → The intercept estimate has a standard error of ${seIntercept.toFixed(4)} units.</p>
            <p><strong>SE(β₁) = ${seSlope.toFixed(6)}</strong> → For each 1-unit change in X, the predicted Y changes by ${slope.toFixed(4)} ± ${(1.96*seSlope).toFixed(4)} (95% CI).</p>
            <p><strong>Smaller SE = More precise estimate.</strong> SE depends on: variance of residuals (MSE) and spread of X values.</p>
        </div>
    </div>`;
    
    return { seIntercept, seSlope, slope, intercept, mse, steps };
}

// ========== T-STATISTICS COMPUTATION (REDESIGNED WITH TABLES) ==========
// ========== T-STATISTICS COMPUTATION (COMPLETE WITH FULL β̂ DERIVATION) ==========
function computeTStatsWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
    }
    
    const n = xValues.length;
    const meanX = xValues.reduce((a,b) => a+b, 0) / n;
    const meanY = yValues.reduce((a,b) => a+b, 0) / n;
    
    // ========== STEP 1: Build complete deviation table ==========
    let deviationRows = '';
    let numerator = 0, denominator = 0;
    let sumX = 0, sumY = 0;
    let xyProducts = [], xxSquares = [];
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        const product = xDev * yDev;
        const xSq = xDev * xDev;
        numerator += product;
        denominator += xSq;
        sumX += xValues[i];
        sumY += yValues[i];
        xyProducts.push(product);
        xxSquares.push(xSq);
        
        deviationRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]} - ${meanX.toFixed(4)} = ${xDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]} - ${meanY.toFixed(4)} = ${yDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; font-weight: 600; color: #1a5490;">${product.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${xSq.toFixed(4)}</td>
        </tr>`;
    }
    
    // ========== STEP 2: Calculate β̂ coefficients ==========
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // ========== STEP 3: Build predictions and residuals table ==========
    let predictionsRows = '';
    let ssRes = 0;
    let residuals = [];
    let predictions = [];
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const residual = yValues[i] - yPred;
        predictions.push(yPred);
        residuals.push(residual);
        ssRes += residual * residual;
        
        predictionsRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${intercept.toFixed(4)} + ${slope.toFixed(4)}×${xValues[i]} = ${yPred.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; ${residual >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">${residual.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${(residual * residual).toFixed(4)}</td>
        </tr>`;
    }
    
    // ========== STEP 4: Calculate Standard Errors ==========
    const mse = ssRes / (n - 2);
    const seSlope = Math.sqrt(mse / denominator);
    const seIntercept = Math.sqrt(mse * (1/n + Math.pow(meanX, 2) / denominator));
    
    // ========== STEP 5: Calculate t-statistics ==========
    const tSlope = slope / seSlope;
    const tIntercept = intercept / seIntercept;
    
    const df = n - 2;
    const criticalT = tCriticalValue(0.025, df);
    const pSlope = 2 * (1 - tCDF(Math.abs(tSlope), df));
    const pIntercept = 2 * (1 - tCDF(Math.abs(tIntercept), df));
    
    // ========== Build complete HTML with all steps ==========
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">t-Statistics for Regression Coefficients</h1>
            <p style="margin: 0; opacity: 0.95;">t = β̂ / SE(β̂) | H₀: β = 0 | H₁: β ≠ 0</p>
            <p style="margin: 8px 0 0 0; font-size: 14px;">df = n - 2 = ${df} | Critical t (α=0.05, two-tailed) = ±${criticalT.toFixed(4)}</p>
        </div>
        
        <!-- ========== PART 1: CALCULATE β̂ (REGRESSION COEFFICIENTS) ========== -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 1: Calculate Regression Coefficients (β̂₀, β̂₁)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 1.1: Calculate Means</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>x̄ (Mean of X):</strong><br>
                        x̄ = Σx / n = ${sumX} / ${n} = <strong>${meanX.toFixed(6)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>ȳ (Mean of Y):</strong><br>
                        ȳ = Σy / n = ${sumY} / ${n} = <strong>${meanY.toFixed(6)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 1.2: Calculate Deviations and Cross-Products</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #1a5490; color: white;">
                                <th style="padding: 10px;">i</th>
                                <th style="padding: 10px;">x</th>
                                <th style="padding: 10px;">y</th>
                                <th style="padding: 10px;">x - x̄</th>
                                <th style="padding: 10px;">y - ȳ</th>
                                <th style="padding: 10px;">(x - x̄)(y - ȳ)</th>
                                <th style="padding: 10px;">(x - x̄)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deviationRows}
                            <tr style="background: #e9ecef; font-weight: 700;">
                                <td colspan="5" style="padding: 10px; text-align: right;">SUM →</td>
                                <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${numerator.toFixed(4)}</td>
                                <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${denominator.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Step 1.3: Calculate Slope (β̂₁) and Intercept (β̂₀)</h3>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📐 Formula for Slope (β̂₁):</strong><br>
                    β̂₁ = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²<br><br>
                    β̂₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                    <strong style="color: #1a5490; font-size: 18px;">β̂₁ = ${slope.toFixed(8)}</strong>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>📐 Formula for Intercept (β̂₀):</strong><br>
                    β̂₀ = ȳ - β̂₁·x̄<br><br>
                    β̂₀ = ${meanY.toFixed(4)} - (${slope.toFixed(4)} × ${meanX.toFixed(4)})<br>
                    β̂₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)}<br>
                    <strong style="color: #1a5490; font-size: 18px;">β̂₀ = ${intercept.toFixed(8)}</strong>
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- ========== PART 2: CALCULATE STANDARD ERRORS ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 2: Calculate Standard Errors</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 2.1: Calculate Predictions and Residuals</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #1a5490; color: white;">
                                <th style="padding: 10px;">i</th>
                                <th style="padding: 10px;">x</th>
                                <th style="padding: 10px;">y</th>
                                <th style="padding: 10px;">ŷ = β̂₀ + β̂₁·x</th>
                                <th style="padding: 10px;">e = y - ŷ</th>
                                <th style="padding: 10px;">e²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${predictionsRows}
                            <tr style="background: #e9ecef; font-weight: 700;">
                                <td colspan="5" style="padding: 10px; text-align: right;">SS<sub>res</sub> = Σe² →</td>
                                <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${ssRes.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 2.2: Calculate Mean Squared Error (MSE)</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>Formula:</strong> MSE = SS<sub>res</sub> / (n - 2)<br>
                    MSE = ${ssRes.toFixed(4)} / ${n-2}<br>
                    <strong style="color: #1a5490;">MSE = ${mse.toFixed(8)}</strong>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Step 2.3: Calculate Standard Errors</h3>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📐 Standard Error of Slope [SE(β̂₁)]:</strong><br>
                    SE(β̂₁) = √[MSE / Σ(x - x̄)²]<br>
                    SE(β̂₁) = √[${mse.toFixed(6)} / ${denominator.toFixed(4)}]<br>
                    SE(β̂₁) = √${(mse/denominator).toFixed(6)}<br>
                    <strong style="color: #1a5490;">SE(β̂₁) = ${seSlope.toFixed(8)}</strong>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>📐 Standard Error of Intercept [SE(β̂₀)]:</strong><br>
                    SE(β̂₀) = √[MSE × (1/n + x̄²/Σ(x - x̄)²)]<br>
                    SE(β̂₀) = √[${mse.toFixed(6)} × (1/${n} + ${Math.pow(meanX,2).toFixed(4)}/${denominator.toFixed(4)})]<br>
                    SE(β̂₀) = √[${mse.toFixed(6)} × ${(1/n + Math.pow(meanX,2)/denominator).toFixed(6)}]<br>
                    <strong style="color: #1a5490;">SE(β̂₀) = ${seIntercept.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 3: CALCULATE T-STATISTICS ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 3: Calculate t-Statistics</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <h3 style="color: #1a5490;">For Intercept (β̂₀):</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace;">
                    <strong>Formula:</strong> t = β̂₀ / SE(β̂₀)<br>
                    t = ${intercept.toFixed(6)} / ${seIntercept.toFixed(6)}<br>
                    <strong style="color: #1a5490; font-size: 18px;">t = ${tIntercept.toFixed(8)}</strong>
                </div>
                <div style="margin-top: 10px;">
                    <strong>p-value = ${pIntercept.toFixed(6)}</strong><br>
                    ${pIntercept < 0.05 ? '✓ p < 0.05 → Statistically significant (reject H₀)' : '✗ p > 0.05 → Not statistically significant (fail to reject H₀)'}
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">For Slope (β̂₁):</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace;">
                    <strong>Formula:</strong> t = β̂₁ / SE(β̂₁)<br>
                    t = ${slope.toFixed(6)} / ${seSlope.toFixed(6)}<br>
                    <strong style="color: #1a5490; font-size: 18px;">t = ${tSlope.toFixed(8)}</strong>
                </div>
                <div style="margin-top: 10px;">
                    <strong>p-value = ${pSlope.toFixed(6)}</strong><br>
                    ${pSlope < 0.05 ? '✓ p < 0.05 → Statistically significant (reject H₀)' : '✗ p > 0.05 → Not statistically significant (fail to reject H₀)'}
                </div>
            </div>
        </div>
        
        <!-- ========== PART 4: RESULTS SUMMARY TABLE ========== -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; border: 2px solid #1a5490;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 Summary: Regression Coefficients with t-Statistics</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Coefficient</th>
                        <th style="padding: 12px;">Estimate (β̂)</th>
                        <th style="padding: 12px;">Standard Error (SE)</th>
                        <th style="padding: 12px;">t-statistic</th>
                        <th style="padding: 12px;">p-value</th>
                        <th style="padding: 12px;">Significant at α=0.05?</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Intercept (β₀)</td>
                        <td style="text-align: center;">${intercept.toFixed(6)}</td>
                        <td style="text-align: center;">${seIntercept.toFixed(6)}</td>
                        <td style="text-align: center; font-weight: 700; color: #1a5490;">${tIntercept.toFixed(6)}</td>
                        <td style="text-align: center;">${pIntercept.toFixed(6)}</td>
                        <td style="text-align: center; ${Math.abs(tIntercept) > criticalT ? 'color: #28a745; font-weight: bold;' : 'color: #dc3545;'}">
                            ${Math.abs(tIntercept) > criticalT ? '✓ Yes' : '✗ No'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Slope (β₁)</td>
                        <td style="text-align: center;">${slope.toFixed(6)}</td>
                        <td style="text-align: center;">${seSlope.toFixed(6)}</td>
                        <td style="text-align: center; font-weight: 700; color: #1a5490;">${tSlope.toFixed(6)}</td>
                        <td style="text-align: center;">${pSlope.toFixed(6)}</td>
                        <td style="text-align: center; ${Math.abs(tSlope) > criticalT ? 'color: #28a745; font-weight: bold;' : 'color: #dc3545;'}">
                            ${Math.abs(tSlope) > criticalT ? '✓ Yes' : '✗ No'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- ========== PART 5: CONCLUSION ========== -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(tSlope) > criticalT ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Conclusion</h3>
            <p><strong>Null Hypothesis (H₀):</strong> β = 0 (The coefficient is not significantly different from zero)</p>
            <p><strong>Alternative Hypothesis (H₁):</strong> β ≠ 0 (The coefficient is significantly different from zero)</p>
            <p><strong>Decision Rule:</strong> Reject H₀ if |t| > ${criticalT.toFixed(4)}</p>
            
            <div style="margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Intercept (β₀):</strong> |t| = ${Math.abs(tIntercept).toFixed(4)} ${Math.abs(tIntercept) > criticalT ? '>' : '<'} ${criticalT.toFixed(4)}<br>
                → ${Math.abs(tIntercept) > criticalT ? '✓ Reject H₀: The intercept is significantly different from zero' : '✗ Fail to reject H₀: The intercept is not significantly different from zero'}
            </div>
            <div style="margin-top: 10px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Slope (β₁):</strong> |t| = ${Math.abs(tSlope).toFixed(4)} ${Math.abs(tSlope) > criticalT ? '>' : '<'} ${criticalT.toFixed(4)}<br>
                → ${Math.abs(tSlope) > criticalT ? '✓ Reject H₀: The slope is significantly different from zero → X has a significant effect on Y' : '✗ Fail to reject H₀: The slope is not significantly different from zero → X does not predict Y'}
            </div>
        </div>
        
        <!-- ========== FORMULA REFERENCE ========== -->
        <div style="margin-top: 20px; background: #e8f4f8; border-radius: 12px; padding: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #1a5490;">📖 Formula Reference</h4>
            <div style="font-family: monospace; font-size: 12px;">
                <strong>β̂₁ (Slope):</strong> Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²<br>
                <strong>β̂₀ (Intercept):</strong> ȳ - β̂₁·x̄<br>
                <strong>SE(β̂₁):</strong> √[MSE / Σ(xᵢ - x̄)²]<br>
                <strong>SE(β̂₀):</strong> √[MSE × (1/n + x̄²/Σ(xᵢ - x̄)²)]<br>
                <strong>t-statistic:</strong> β̂ / SE(β̂)<br>
                <strong>MSE:</strong> Σ(yᵢ - ŷᵢ)² / (n - 2)
            </div>
        </div>
    </div>`;
    
    return { tIntercept, tSlope, pIntercept, pSlope, df, criticalT, steps };
}
// ========== F-TEST FOR OVERALL SIGNIFICANCE (COMPLETE WITH ALL DETAILS) ==========
function computeFTestOverallWithSteps(xValues, yValues, alpha) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 observations." };
    }
    
    const n = xValues.length;
    const meanX = xValues.reduce((a,b) => a+b, 0) / n;
    const meanY = yValues.reduce((a,b) => a+b, 0) / n;
    const sumX = xValues.reduce((a,b) => a+b, 0);
    const sumY = yValues.reduce((a,b) => a+b, 0);
    
    // ========== STEP 1: Calculate β̂ coefficients ==========
    let numerator = 0, denominator = 0;
    let deviationRows = '';
    
    for (let i = 0; i < n; i++) {
        const xDev = xValues[i] - meanX;
        const yDev = yValues[i] - meanY;
        numerator += xDev * yDev;
        denominator += xDev * xDev;
        
        deviationRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]} - ${meanX.toFixed(4)} = ${xDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]} - ${meanY.toFixed(4)} = ${yDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${xDev.toFixed(4)} × ${yDev.toFixed(4)} = ${(xDev * yDev).toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">(${xDev.toFixed(4)})² = ${(xDev * xDev).toFixed(4)}</td>
        </tr>`;
    }
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // ========== STEP 2: Calculate ŷ (predictions) and residuals ==========
    let predictionsRows = '';
    let ssRes = 0;
    let ssReg = 0;
    let ssTot = 0;
    
    for (let i = 0; i < n; i++) {
        const yPred = intercept + slope * xValues[i];
        const regDev = yPred - meanY;      // Explained deviation
        const resDev = yValues[i] - yPred;  // Residual deviation
        const totDev = yValues[i] - meanY;  // Total deviation
        
        const regContribution = regDev * regDev;
        const resContribution = resDev * resDev;
        const totContribution = totDev * totDev;
        
        ssReg += regContribution;
        ssRes += resContribution;
        ssTot += totContribution;
        
        predictionsRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; text-align: center;">${i+1}</td>
            <td style="padding: 10px; text-align: center;">${xValues[i]}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${intercept.toFixed(4)} + ${slope.toFixed(4)}×${xValues[i]} = ${yPred.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yPred.toFixed(4)} - ${meanY.toFixed(4)} = ${regDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">(${regDev.toFixed(4)})² = ${regContribution.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center; ${resDev >= 0 ? 'color: #28a745;' : 'color: #dc3545;'}">${resDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">(${resDev.toFixed(4)})² = ${resContribution.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">${yValues[i]} - ${meanY.toFixed(4)} = ${totDev.toFixed(4)}</td>
            <td style="padding: 10px; text-align: center;">(${totDev.toFixed(4)})² = ${totContribution.toFixed(4)}</td>
        </tr>`;
    }
    
    // ========== STEP 3: Degrees of Freedom ==========
    const dfReg = 1;           // k = number of predictors
    const dfRes = n - 2;       // n - k - 1
    const dfTot = n - 1;       // n - 1
    
    // ========== STEP 4: Mean Squares ==========
    const msReg = ssReg / dfReg;
    const msRes = ssRes / dfRes;
    
    // ========== STEP 5: F-statistic ==========
    const fStatistic = msReg / msRes;
    
    // ========== STEP 6: R² and Adjusted R² ==========
    const rSquared = ssReg / ssTot;
    const adjRSquared = 1 - (1 - rSquared) * (n - 1) / (n - 2);
    
    // ========== STEP 7: Critical value and p-value ==========
    const criticalValue = fCriticalValue(alpha, dfReg, dfRes);
    const pValue = 1 - fCDF(fStatistic, dfReg, dfRes);
    const rejectH0 = fStatistic > criticalValue;
    
    // ========== Build complete HTML with all detailed steps ==========
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">F-Test for Overall Model Significance</h1>
            <p style="margin: 0; opacity: 0.95;">F = (SS<sub>reg</sub> / k) / (SS<sub>res</sub> / (n - k - 1))</p>
            <p style="margin: 8px 0 0 0; font-size: 14px;">H₀: β₁ = 0 (Model explains no variance) | H₁: β₁ ≠ 0 (Model is useful)</p>
        </div>
        
        <!-- ========== PART 1: CALCULATE REGRESSION COEFFICIENTS ========== -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 1: Calculate Regression Coefficients (β̂₀, β̂₁)</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 1.1: Calculate Means</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>x̄ (Mean of X):</strong><br>
                        x̄ = Σx / n = ${sumX} / ${n} = <strong>${meanX.toFixed(6)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <strong>ȳ (Mean of Y):</strong><br>
                        ȳ = Σy / n = ${sumY} / ${n} = <strong>${meanY.toFixed(6)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 1.2: Calculate Deviations and Cross-Products</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background: #1a5490; color: white;">
                                <th style="padding: 8px;">i</th>
                                <th style="padding: 8px;">x</th>
                                <th style="padding: 8px;">y</th>
                                <th style="padding: 8px;">x - x̄</th>
                                <th style="padding: 8px;">y - ȳ</th>
                                <th style="padding: 8px;">(x - x̄)(y - ȳ)</th>
                                <th style="padding: 8px;">(x - x̄)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deviationRows}
                            <tr style="background: #e9ecef; font-weight: 700;">
                                <td colspan="5" style="padding: 8px; text-align: right;">SUM →</td>
                                <td style="padding: 8px; text-align: center; background: #1a5490; color: white;">${numerator.toFixed(4)}</td>
                                <td style="padding: 8px; text-align: center; background: #1a5490; color: white;">${denominator.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Step 1.3: Calculate Slope and Intercept</h3>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📐 Slope (β̂₁) = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²</strong><br>
                    β̂₁ = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                    <strong style="color: #1a5490;">β̂₁ = ${slope.toFixed(8)}</strong>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <strong>📐 Intercept (β̂₀) = ȳ - β̂₁·x̄</strong><br>
                    β̂₀ = ${meanY.toFixed(4)} - (${slope.toFixed(4)} × ${meanX.toFixed(4)})<br>
                    β̂₀ = ${meanY.toFixed(4)} - ${(slope * meanX).toFixed(4)}<br>
                    <strong style="color: #1a5490;">β̂₀ = ${intercept.toFixed(8)}</strong>
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">
                    <strong>Regression Equation:</strong> ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}·x
                </div>
            </div>
        </div>
        
        <!-- ========== PART 2: ANOVA DECOMPOSITION (ŷ, SSreg, SSres, SStot) ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 2: ANOVA Decomposition</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1a5490;">Step 2.1: Calculate Predicted Values (ŷ), Residuals, and Sums of Squares</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #1a5490; color: white;">
                                <th rowspan="2" style="padding: 8px;">i</th>
                                <th rowspan="2" style="padding: 8px;">x</th>
                                <th rowspan="2" style="padding: 8px;">y</th>
                                <th rowspan="2" style="padding: 8px;">ŷ = β₀ + β₁·x</th>
                                <th colspan="2" style="padding: 8px;">Explained (ŷ - ȳ)</th>
                                <th colspan="2" style="padding: 8px;">Residual (y - ŷ)</th>
                                <th colspan="2" style="padding: 8px;">Total (y - ȳ)</th>
                            </tr>
                            <tr style="background: #1a5490; color: white;">
                                <th style="padding: 8px;">Deviation</th>
                                <th style="padding: 8px;">(Deviation)²</th>
                                <th style="padding: 8px;">Deviation</th>
                                <th style="padding: 8px;">(Deviation)²</th>
                                <th style="padding: 8px;">Deviation</th>
                                <th style="padding: 8px;">(Deviation)²</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${predictionsRows}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <h3 style="color: #1a5490;">Step 2.2: Sum of Squares Summary</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <strong>SS<sub>reg</sub> (Explained)</strong><br>
                        = Σ(ŷ - ȳ)²<br>
                        = <strong style="color: #1a5490;">${ssReg.toFixed(6)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <strong>SS<sub>res</sub> (Residual)</strong><br>
                        = Σ(y - ŷ)²<br>
                        = <strong style="color: #dc3545;">${ssRes.toFixed(6)}</strong>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                        <strong>SS<sub>tot</sub> (Total)</strong><br>
                        = Σ(y - ȳ)²<br>
                        = <strong style="color: #1a5490;">${ssTot.toFixed(6)}</strong>
                    </div>
                </div>
                
                <div style="margin-top: 15px; background: #d4edda; padding: 12px; border-radius: 8px; text-align: center;">
                    <strong>Check: SS<sub>tot</sub> = SS<sub>reg</sub> + SS<sub>res</sub></strong><br>
                    ${ssTot.toFixed(4)} = ${ssReg.toFixed(4)} + ${ssRes.toFixed(4)} = ${(ssReg + ssRes).toFixed(4)} ✅
                </div>
            </div>
        </div>
        
        <!-- ========== PART 3: DEGREES OF FREEDOM ========== -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 3: Degrees of Freedom</h2>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                    <strong>df<sub>reg</sub> (Regression)</strong><br>
                    = k = number of predictors<br>
                    = <strong style="color: #1a5490;">${dfReg}</strong>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                    <strong>df<sub>res</sub> (Residual)</strong><br>
                    = n - k - 1<br>
                    = ${n} - 1 - 1 = <strong style="color: #1a5490;">${dfRes}</strong>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                    <strong>df<sub>tot</sub> (Total)</strong><br>
                    = n - 1<br>
                    = ${n} - 1 = <strong style="color: #1a5490;">${dfTot}</strong>
                </div>
            </div>
            
            <div style="margin-top: 15px; background: #fff3cd; padding: 12px; border-radius: 8px;">
                <strong>Check: df<sub>tot</sub> = df<sub>reg</sub> + df<sub>res</sub></strong><br>
                ${dfTot} = ${dfReg} + ${dfRes} = ${dfReg + dfRes} ✅
            </div>
        </div>
        
        <!-- ========== PART 4: MEAN SQUARES ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 4: Mean Squares</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; border-radius: 12px; padding: 20px; text-align: center;">
                    <strong>MS<sub>reg</sub> (Mean Square Regression)</strong><br>
                    = SS<sub>reg</sub> / df<sub>reg</sub><br>
                    = ${ssReg.toFixed(4)} / ${dfReg}<br>
                    = <strong style="color: #1a5490;">${msReg.toFixed(6)}</strong>
                </div>
                <div style="background: white; border-radius: 12px; padding: 20px; text-align: center;">
                    <strong>MS<sub>res</sub> (Mean Square Residual)</strong><br>
                    = SS<sub>res</sub> / df<sub>res</sub><br>
                    = ${ssRes.toFixed(4)} / ${dfRes}<br>
                    = <strong style="color: #1a5490;">${msRes.toFixed(6)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 5: R² AND ADJUSTED R² ========== -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 5: R² and Adjusted R²</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <strong>📐 R² (Coefficient of Determination)</strong><br>
                R² = SS<sub>reg</sub> / SS<sub>tot</sub><br>
                R² = ${ssReg.toFixed(4)} / ${ssTot.toFixed(4)}<br>
                <strong style="color: #1a5490;">R² = ${rSquared.toFixed(8)} (${(rSquared * 100).toFixed(2)}%)</strong><br>
                <span style="font-size: 13px;">→ ${(rSquared * 100).toFixed(1)}% of the variance in Y is explained by X</span>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>📐 Adjusted R² (Penalized for number of predictors)</strong><br>
                R²<sub>adj</sub> = 1 - (1 - R²) × (n - 1) / (n - k - 1)<br>
                R²<sub>adj</sub> = 1 - (1 - ${rSquared.toFixed(6)}) × (${n} - 1) / (${n} - 2)<br>
                R²<sub>adj</sub> = 1 - (${(1 - rSquared).toFixed(6)}) × ${(n-1)} / ${(n-2)}<br>
                R²<sub>adj</sub> = 1 - ${((1 - rSquared) * (n-1) / (n-2)).toFixed(6)}<br>
                <strong style="color: #1a5490;">R²<sub>adj</sub> = ${adjRSquared.toFixed(8)}</strong>
            </div>
        </div>
        
        <!-- ========== PART 6: F-STATISTIC CALCULATION ========== -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1a5490; margin-top: 0;">📐 PART 6: F-Statistic Calculation</h2>
            
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="font-family: monospace; font-size: 16px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <strong>F = MS<sub>reg</sub> / MS<sub>res</sub></strong><br>
                    F = ${msReg.toFixed(6)} / ${msRes.toFixed(6)}<br>
                    <strong style="color: #1a5490; font-size: 28px;">F = ${fStatistic.toFixed(8)}</strong>
                </div>
            </div>
        </div>
        
        <!-- ========== PART 7: ANOVA SUMMARY TABLE ========== -->
        <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; border: 2px solid #1a5490;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 ANOVA Summary Table</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 12px;">Source</th>
                        <th style="padding: 12px;">Sum of Squares (SS)</th>
                        <th style="padding: 12px;">df</th>
                        <th style="padding: 12px;">Mean Square (MS)</th>
                        <th style="padding: 12px;">F-statistic</th>
                        <th style="padding: 12px;">p-value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Regression (Explained)</td>
                        <td style="text-align: center;">${ssReg.toFixed(4)}</td>
                        <td style="text-align: center;">${dfReg}</td>
                        <td style="text-align: center;">${msReg.toFixed(4)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle; font-weight: 700; font-size: 20px; background: #e8f4f8;">${fStatistic.toFixed(6)}</td>
                        <td rowspan="2" style="text-align: center; vertical-align: middle;">${pValue.toFixed(6)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #dee2e6;">
                        <td style="padding: 12px; font-weight: bold;">Residual (Error)</td>
                        <td style="text-align: center;">${ssRes.toFixed(4)}</td>
                        <td style="text-align: center;">${dfRes}</td>
                        <td style="text-align: center;">${msRes.toFixed(4)}</td>
                    </tr>
                    <tr style="background: #e9ecef;">
                        <td style="padding: 12px; font-weight: bold;">Total</td>
                        <td style="text-align: center;">${ssTot.toFixed(4)}</td>
                        <td style="text-align: center;">${dfTot}</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                        <td style="text-align: center;">—</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- ========== PART 8: CONCLUSION ========== -->
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Conclusion</h3>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
                <div style="background: white; border-radius: 8px; padding: 10px; text-align: center;">
                    <strong>F-statistic:</strong><br>${fStatistic.toFixed(4)}
                </div>
                <div style="background: white; border-radius: 8px; padding: 10px; text-align: center;">
                    <strong>Critical F (α=${alpha}):</strong><br>${criticalValue.toFixed(4)}
                </div>
                <div style="background: white; border-radius: 8px; padding: 10px; text-align: center;">
                    <strong>p-value:</strong><br>${pValue.toFixed(8)}
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.05); border-radius: 10px; padding: 15px;">
                <strong>Null Hypothesis (H₀):</strong> β₁ = 0 (The model explains no variance)<br>
                <strong>Alternative Hypothesis (H₁):</strong> β₁ ≠ 0 (The model is useful)<br>
                <strong>Decision Rule:</strong> Reject H₀ if F > ${criticalValue.toFixed(4)}<br>
                <strong>Comparison:</strong> ${fStatistic.toFixed(4)} ${fStatistic > criticalValue ? '>' : '<'} ${criticalValue.toFixed(4)}<br><br>
                
                <strong style="font-size: 18px;">Decision: ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}</strong><br><br>
                
                <strong>Interpretation:</strong> ${rejectH0 ? 
                    'The regression model is statistically significant. The independent variable (X) explains a significant portion of variance in the dependent variable (Y).' : 
                    'The regression model is NOT statistically significant. The independent variable (X) does not predict the dependent variable (Y).'}
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
                💡 <strong>Practical Meaning:</strong> The F-test tells us whether our model is better than just using the mean of Y. 
                ${rejectH0 ? 
                    'Here, the model is useful and the X variable significantly predicts Y. The explained variance (SSreg) is large relative to the unexplained variance (SSres).' : 
                    'Here, the model does not provide a better fit than simply using the mean of Y. The explained variance is not significantly different from zero.'}
            </div>
        </div>
        
        <!-- ========== FORMULA REFERENCE ========== -->
        <div style="margin-top: 20px; background: #e8f4f8; border-radius: 12px; padding: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #1a5490;">📖 Complete Formula Reference</h4>
            <div style="font-family: monospace; font-size: 12px;">
                <strong>ŷ (Predicted Value):</strong> ŷ = β̂₀ + β̂₁·x<br>
                <strong>SS<sub>reg</sub> (Explained):</strong> Σ(ŷ - ȳ)²<br>
                <strong>SS<sub>res</sub> (Residual):</strong> Σ(y - ŷ)²<br>
                <strong>SS<sub>tot</sub> (Total):</strong> Σ(y - ȳ)²<br>
                <strong>R²:</strong> SS<sub>reg</sub> / SS<sub>tot</sub><br>
                <strong>R²<sub>adj</sub>:</strong> 1 - (1 - R²)(n - 1)/(n - k - 1)<br>
                <strong>df<sub>reg</sub>:</strong> k (number of predictors)<br>
                <strong>df<sub>res</sub>:</strong> n - k - 1<br>
                <strong>MS<sub>reg</sub>:</strong> SS<sub>reg</sub> / df<sub>reg</sub><br>
                <strong>MS<sub>res</sub>:</strong> SS<sub>res</sub> / df<sub>res</sub><br>
                <strong>F-statistic:</strong> MS<sub>reg</sub> / MS<sub>res</sub>
            </div>
        </div>
    </div>`;
    
    return { fStatistic, dfReg, dfRes, pValue, criticalValue, rejectH0, rSquared, adjRSquared, steps };
}
// ========== STANDARD ERRORS SETUP ==========
function setupStdErrorsLogic() {
    const computeBtn = document.getElementById("stderrorsComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("stderrorsXInput").value;
        const rawY = document.getElementById("stderrorsYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("stderrorsResultArea");
        const valueSpan = document.getElementById("stderrorsValueDisplay");
        const stepsSpan = document.getElementById("stderrorsStepsDisplay");
        
        const result = computeStdErrorsWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `SE(β₀) = ${result.seIntercept.toFixed(6)} | SE(β₁) = ${result.seSlope.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("stderrorsClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("stderrorsXInput").value = '';
            document.getElementById("stderrorsYInput").value = '';
            document.getElementById("stderrorsResultArea").style.display = 'none';
        });
    }
}

// ========== T-STATISTICS SETUP ==========
function setupTStatsLogic() {
    const computeBtn = document.getElementById("tstatsComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("tstatsXInput").value;
        const rawY = document.getElementById("tstatsYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("tstatsResultArea");
        const valueSpan = document.getElementById("tstatsValueDisplay");
        const stepsSpan = document.getElementById("tstatsStepsDisplay");
        
        const result = computeTStatsWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `t(β₀) = ${result.tIntercept.toFixed(6)} | t(β₁) = ${result.tSlope.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("tstatsClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("tstatsXInput").value = '';
            document.getElementById("tstatsYInput").value = '';
            document.getElementById("tstatsResultArea").style.display = 'none';
        });
    }
}

// ========== F-TEST OVERALL SETUP ==========
function setupFTestOverallLogic() {
    const computeBtn = document.getElementById("ftestOverallComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("ftestOverallXInput").value;
        const rawY = document.getElementById("ftestOverallYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const alpha = parseFloat(document.getElementById("ftestOverallAlpha").value);
        const resultDiv = document.getElementById("ftestOverallResultArea");
        const valueSpan = document.getElementById("ftestOverallValueDisplay");
        const stepsSpan = document.getElementById("ftestOverallStepsDisplay");
        
        const result = computeFTestOverallWithSteps(xValues, yValues, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `F = ${result.fStatistic.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("ftestOverallClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("ftestOverallXInput").value = '';
            document.getElementById("ftestOverallYInput").value = '';
            document.getElementById("ftestOverallResultArea").style.display = 'none';
        });
    }
}
