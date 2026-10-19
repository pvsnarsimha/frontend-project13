/* ZScore: zscore tool (render, compute, setup) */

// ========== DATA MANIPULATION RENDER FUNCTIONS ==========
function renderZScoreInterface() {
    return buildInterface({
        id: "statZScoreInterface",
        title: "📊 Standardization (Z-scores)",
        formula: "📌 Z = (x - x̄) / s",
        desc: "Z-score tells how many sample standard deviations (s, with n - 1) a value is from the mean. Z = 0 means exactly at the mean. The Z-score outlier tool uses the same s.",
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated)",
                textarea: { id: "zscoreInput", rows: "4", placeholder: "Example: 12, 15, 18, 20, 22, 25, 30" }
            }
        ],
        run: { id: "zscoreComputeBtn", text: "📊 Calculate Z-scores + Full Steps" },
        clear: { id: "zscoreClearBtn", text: "Clear" },
        result: {
            area: "zscoreResultArea",
            label: "🎯 STANDARDIZATION RESULTS (Z-SCORES)",
            value: "zscoreValueDisplay",
            steps: "zscoreStepsDisplay"
        }
    });
}

// ========== Z-SCORE COMPUTATION ==========
function computeZScoreWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    let n = numbers.length;
    let sum = numbers.reduce((a,b) => a+b, 0);
    let mean = sum / n;
    
    // Sample standard deviation (n - 1), the same as the Z-score outlier tool, so both give the same z for the same data
    let squaredDiffs = numbers.map(x => (x - mean) ** 2);
    let sumSqDiffs = squaredDiffs.reduce((a,b) => a+b, 0);
    if (n < 2) return { error: true, message: "Need at least 2 values for Z-score calculation." };
    let stdDev = Math.sqrt(sumSqDiffs / (n - 1));
    
    if (stdDev === 0) {
        return { error: true, message: "All values are identical, so the standard deviation is 0 and Z-scores are undefined (0 / 0)." };
    }
    
    let steps = `📊 FORMULA: Z-score = (x - x̄) / s   (sample standard deviation, n - 1)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Calculate the mean (x̄)\n`;
    steps += `   x̄ = Σx / n = ${sum} / ${n} = ${mean.toFixed(6)}\n\n`;
    
    steps += `Step 2: Calculate the sample standard deviation (s)\n`;
    steps += `   s = √[Σ(x - x̄)² / (n - 1)]\n`;
    squaredDiffs.forEach((sq, i) => {
        steps += `   (${numbers[i]} - ${mean.toFixed(6)})² = ${sq.toFixed(6)}\n`;
    });
    steps += `   Σ(x - x̄)² = ${sumSqDiffs.toFixed(6)}\n`;
    steps += `   s = √(${sumSqDiffs.toFixed(6)} / ${n - 1}) = √${(sumSqDiffs/(n - 1)).toFixed(6)} = ${stdDev.toFixed(6)}\n\n`;
    
    steps += `Step 3: Calculate Z-scores for each value\n`;
    steps += `   Formula: Z = (x - x̄) / s\n`;
    
    let zScores = [];
    numbers.forEach(x => {
        let z = (x - mean) / stdDev;
        zScores.push(z);
    });
    
    steps += `   Individual Z-score calculations:\n`;
    numbers.forEach((x, i) => {
        steps += `   Value ${x}: (${x} - ${mean.toFixed(6)}) / ${stdDev.toFixed(6)} = ${zScores[i].toFixed(6)}\n`;
    });
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Z-SCORE RESULTS:\n`;
    steps += `   Mean (x̄) = ${mean.toFixed(6)}\n`;
    steps += `   Sample standard deviation (s) = ${stdDev.toFixed(6)}\n`;
    steps += `   Z-scores: ${zScores.map(z => z.toFixed(6)).join(', ')}\n`;
    steps += `\n📌 Interpretation:\n`;
    steps += `   • Z = 0: Value equals the mean\n`;
    steps += `   • Z > 0: Value above mean\n`;
    steps += `   • Z < 0: Value below mean\n`;
    steps += `   • |Z| > 2: Unusual values (outliers)`;
    
    return { mean, stdDev, zScores, steps };
}

// ========== DATA MANIPULATION SETUP FUNCTIONS ==========
function setupZScoreLogic() {
    const computeBtn = document.getElementById("zscoreComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("zscoreInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("zscoreResultArea");
        const valueSpan = document.getElementById("zscoreValueDisplay");
        const stepsSpan = document.getElementById("zscoreStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to calculate Z-scores.";
            return;
        }
        
        const zscoreRes = computeZScoreWithSteps(numbers);
        if (zscoreRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(zscoreRes.message));
            return;
        }
        
        resultDiv.style.display = "block";
        setHtml(valueSpan, `Z-scores: ${zscoreRes.zScores.map(z => z.toFixed(4)).join(', ')}`);
        stepsSpan.innerText = zscoreRes.steps;
    });
    attachClearHandler("zscoreClearBtn", "zscoreInput", "zscoreResultArea");
}
