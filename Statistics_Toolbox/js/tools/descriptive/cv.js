/* cv: cv tool (render, compute, setup) */

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
