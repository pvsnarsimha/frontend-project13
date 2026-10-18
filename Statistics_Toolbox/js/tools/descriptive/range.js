/* range: range tool (render, compute, setup) */

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
