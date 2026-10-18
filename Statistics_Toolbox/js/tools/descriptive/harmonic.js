/* harmonic: harmonic tool (render, compute, setup) */

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
