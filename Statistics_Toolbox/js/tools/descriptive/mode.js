/* mode: mode tool (render, compute, setup) */

// ------------------ MODE with frequency table and textual breakdown ------------------
function computeModeWithSteps(numbers) {
        if (!numbers.length) return { value: null, steps: "No data provided.", display: "No data" };
        const freqMap = new Map();
        for (let num of numbers) freqMap.set(num, (freqMap.get(num) || 0) + 1);
        let maxFreq = 0;
        for (let f of freqMap.values()) if (f > maxFreq) maxFreq = f;
        
        let steps = `⭐ FORMULA: Mode = value(s) that appear most frequently\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `Frequency distribution:\n`;
        let freqEntries = Array.from(freqMap.entries()).sort((a,b)=>a[0]-b[0]);
        for (let [val, freq] of freqEntries) {
            steps += `   • ${val}  →  appears ${freq} time(s)\n`;
        }
        if (maxFreq === 1) {
            steps += `\nAll values have frequency = 1 → No mode exists.\n`;
            steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            return { value: null, steps: steps, display: "No mode (all values unique)", modesList: [] };
        }
        let modesList = [];
        for (let [val, freq] of freqMap.entries()) if (freq === maxFreq) modesList.push(val);
        modesList.sort((a,b)=>a-b);
        let displayStr = modesList.map(v => (Number.isInteger(v) ? v : v.toFixed(6))).join(', ');
        if (modesList.length > 1) displayStr = `Multimodal: ${displayStr} (each appears ${maxFreq} times)`;
        else displayStr = `${modesList[0]} (frequency: ${maxFreq})`;
        
        steps += `\nHighest frequency = ${maxFreq}\n`;
        steps += `Value(s) achieving highest frequency: ${modesList.map(v=>v).join(', ')}\n`;
        steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        steps += `✅ Mode = ${displayStr}`;
        return { value: modesList, steps: steps, display: displayStr, modesList: modesList };
    }

const modeTool = defineListTool({
    id: 'mode', interfaceId: 'statModeInterface',
    title: "⭐ Mode (Most Frequent Value)",
    formula: "📌 Mode = argmax_v freq(v)",
    desc: "Value(s) that occur most often. Dataset can have one mode, multiple modes, or no mode.",
    placeholder: "Example: 5, 3, 5, 2, 5, 8, 2, 2",
    buttonText: "⭐ Calculate Mode + Frequency Steps",
    resultLabel: "🔥 MODE RESULT",
    empty: { value: "No data", steps: "Provide numeric values for mode analysis." },
    compute: computeModeWithSteps,
    display: r => r.display
});
