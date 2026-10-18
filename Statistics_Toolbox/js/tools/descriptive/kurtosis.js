/* kurtosis: kurtosis tool (render, compute, setup) */

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

const kurtosisTool = defineListTool({
    id: 'kurtosis', interfaceId: 'statKurtosisInterface',
    title: "🎯 Kurtosis (Tails & Peakedness)",
    formula: "📌 Excess kurtosis (G₂) = [n(n+1)/((n-1)(n-2)(n-3))] × Σ((xᵢ - x̄)/s)⁴ - 3(n-1)²/((n-2)(n-3))",
    desc: "Sample excess kurtosis with the small-sample bias correction (the same estimator as Excel KURT and SciPy kurtosis(bias=False)); s is the sample standard deviation (n-1). 0 = mesokurtic (normal), >0 = leptokurtic (heavy tails), <0 = platykurtic (light tails).",
    placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
    buttonText: "🎯 Calculate Kurtosis + Steps",
    resultLabel: "🎯 KURTOSIS RESULT",
    empty: { value: "No data", steps: "Enter numbers to compute kurtosis." },
    min: { count: 4, value: "❌ Need at least 4 values", steps: "Kurtosis calculation requires at least 4 data points." },
    compute: computeKurtosisWithSteps,
    display: r => r.kurtosis.toFixed(6)
});
