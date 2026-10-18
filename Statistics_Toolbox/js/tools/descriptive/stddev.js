/* stddev: stddev tool (render, compute, setup) */

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
