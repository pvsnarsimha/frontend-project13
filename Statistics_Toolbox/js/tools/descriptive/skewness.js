/* skewness: skewness tool (render, compute, setup) */

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

const skewnessTool = defineListTool({
    id: 'skewness', interfaceId: 'statSkewnessInterface',
    title: "📈 Skewness (Asymmetry)",
    formula: "📌 Skewness (G₁) = [n/((n-1)(n-2))] × Σ((xᵢ - x̄)/s)³",
    desc: "Sample skewness with the small-sample bias correction (the same estimator as Excel SKEW and SciPy skew(bias=False)); s is the sample standard deviation (n-1). Measures asymmetry. 0 = symmetric, >0 = right-skewed, <0 = left-skewed.",
    placeholder: "Example: 2, 3, 5, 7, 8, 10, 12, 15, 20",
    buttonText: "📈 Calculate Skewness + Steps",
    resultLabel: "🎯 SKEWNESS RESULT",
    empty: { value: "No data", steps: "Enter numbers to compute skewness." },
    min: { count: 3, value: "❌ Need at least 3 values", steps: "Skewness calculation requires at least 3 data points." },
    compute: computeSkewnessWithSteps,
    display: r => r.skewness.toFixed(6)
});
