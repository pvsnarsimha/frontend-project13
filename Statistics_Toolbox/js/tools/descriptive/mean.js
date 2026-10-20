/* mean: mean tool (render, compute, setup) */

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

// ========== Tools defined with defineListTool (see js/core/toolkit.js) ==========
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
