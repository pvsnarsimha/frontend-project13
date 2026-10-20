/* Ranking: ranking tool (render, compute, setup) */

function renderRankingInterface() {
    return buildInterface({
        id: "statRankingInterface",
        title: "🏆 Ranking & Order Statistics",
        formula: "📌 Rank positions: 1 = smallest, n = largest",
        desc: "Displays sorted order, ranks, percentiles, and order statistics for your data.",
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated)",
                textarea: { id: "rankingInput", rows: "4", placeholder: "Example: 45, 67, 23, 89, 34, 78, 56, 91" }
            }
        ],
        run: { id: "rankingComputeBtn", text: "🏆 Calculate Rankings + Statistics" },
        clear: { id: "rankingClearBtn", text: "Clear" },
        result: {
            area: "rankingResultArea",
            label: "🎯 RANKING & ORDER STATISTICS",
            value: "rankingValueDisplay",
            steps: "rankingStepsDisplay"
        }
    });
}

// ========== RANKING & ORDER STATISTICS ==========
function computeRankingWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    // Create array of objects with original index and value
    let dataWithIndex = numbers.map((value, index) => ({ value, originalIndex: index }));
    
    // Sort by value for ranking
    let sorted = [...dataWithIndex].sort((a,b) => a.value - b.value);
    
    // Assign ranks (handling ties)
    let ranks = new Array(numbers.length);
    let i = 0;
    while (i < sorted.length) {
        let j = i;
        // Find all equal values
        while (j < sorted.length && sorted[j].value === sorted[i].value) {
            j++;
        }
        // Calculate average rank for ties
        let avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) {
            ranks[sorted[k].originalIndex] = avgRank;
        }
        i = j;
    }
    
    let steps = `🏆 FORMULA: Rank = position in sorted order (1 = smallest)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Original data with indices\n`;
    numbers.forEach((val, idx) => {
        steps += `   Index ${idx + 1}: ${val}\n`;
    });
    
    steps += `\nStep 2: Sort values in ascending order\n`;
    let sortedValues = sorted.map(item => item.value);
    steps += `   Sorted: ${sortedValues.join(', ')}\n`;
    
    steps += `\nStep 3: Assign ranks (handling ties with average rank)\n`;
    sorted.forEach((item, idx) => {
        let rank = ranks[item.originalIndex];
        steps += `   Value ${item.value} at position ${idx + 1} → Rank: ${rank}\n`;
    });
    
    // Order statistics
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 ORDER STATISTICS:\n`;
    steps += `   • Minimum (1st order): ${sortedValues[0]}\n`;
    steps += `   • 2nd smallest: ${sortedValues.length > 1 ? sortedValues[1] : 'N/A'}\n`;
    steps += `   • Median: ${tidyNumber(quantileType7(sortedValues, 0.5))}\n`;
    steps += `   • 2nd largest: ${sortedValues.length > 1 ? sortedValues[sortedValues.length-2] : 'N/A'}\n`;
    steps += `   • Maximum (nth order): ${sortedValues[sortedValues.length-1]}\n`;
    
    steps += `\n✅ RANKING RESULTS:\n`;
    steps += `   Value → Rank:\n`;
    numbers.forEach((val, idx) => {
        steps += `   ${val} → Rank ${ranks[idx]}\n`;
    });
    
    return { sorted: sortedValues, ranks, steps };
}

function setupRankingLogic() {
    const computeBtn = document.getElementById("rankingComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("rankingInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("rankingResultArea");
        const valueSpan = document.getElementById("rankingValueDisplay");
        const stepsSpan = document.getElementById("rankingStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to calculate rankings.";
            return;
        }
        
        const rankRes = computeRankingWithSteps(numbers);
        if (rankRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(rankRes.message));
            return;
        }
        
        resultDiv.style.display = "block";
        let rankStr = numbers.map((val, idx) => `${val}→R${rankRes.ranks[idx]}`).join(', ');
        setHtml(valueSpan, rankStr);
        stepsSpan.innerText = rankRes.steps;
    });
    attachClearHandler("rankingClearBtn", "rankingInput", "rankingResultArea");
}
