/* median: median tool (render, compute, setup) */

// ------------------ MEDIAN with sorted list and middle logic ------------------
function computeMedianWithSteps(numbers) {
        if (!numbers.length) return { value: null, steps: "⚠️ No data. Please enter numbers." };
        const sorted = [...numbers].sort((a, b) => a - b);
        const n = sorted.length;
        let median;
        let steps = `📈 FORMULA: Median = middle value of ordered dataset\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        let sortedStr = sorted.map(v => Number.isInteger(v) ? v : v.toFixed(6)).join(", ");
        steps += `Step 1: Sort the data in ascending order:\n   [${sortedStr}]\n`;
        steps += `Step 2: Number of observations (n) = ${n}\n`;
        if (n % 2 === 0) {
            let leftIdx = n / 2 - 1;
            let rightIdx = n / 2;
            let leftVal = sorted[leftIdx];
            let rightVal = sorted[rightIdx];
            median = quantileType7(sorted, 0.5);   // the app's one median: for an even n the mean of the two middle values
            steps += `Step 3: n is even → median = average of the two middle values.\n`;
            steps += `   Middle positions: index ${leftIdx+1} = ${leftVal}, index ${rightIdx+1} = ${rightVal}\n`;
            steps += `   Median = (${leftVal} + ${rightVal}) / 2 = ${median.toFixed(10)}\n`;
        } else {
            let midIdx = Math.floor(n / 2);
            median = quantileType7(sorted, 0.5);
            steps += `Step 3: n is odd → median = value at position (n+1)/2 = position ${midIdx+1}\n`;
            steps += `   Value at position ${midIdx+1} = ${tidyNumber(median)}\n`;
        }
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `✅ Median = ${(Number.isInteger(median) ? median : median.toFixed(10))}`;
        return { value: median, steps: steps };
    }

const medianTool = defineListTool({
    id: 'median', interfaceId: 'statMedianInterface',
    title: "📈 Median (50th Percentile)",
    formula: "📌 Median = { x_{(n+1)/2} if n odd | (x_{n/2} + x_{n/2+1})/2 if n even }",
    desc: "Middle value after sorting data. Robust against outliers.",
    placeholder: "Example: 2, 8, 3, 10, 5, 4",
    buttonText: "📈 Calculate Median + Full Steps",
    resultLabel: "🎯 MEDIAN RESULT",
    empty: { value: "No data", steps: "Enter numbers to compute median (e.g., 10, 20, 30)." },
    compute: computeMedianWithSteps,
    display: r => (Number.isInteger(r.value) ? r.value : r.value.toFixed(10))
});
