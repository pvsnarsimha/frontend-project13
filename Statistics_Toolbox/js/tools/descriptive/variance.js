/* variance: variance tool (render, compute, setup) */

// VARIANCE
function computeVarianceWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    if (numbers.length < 2) return { error: true, message: "The sample variance needs at least 2 values (it divides by n - 1)." };
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
