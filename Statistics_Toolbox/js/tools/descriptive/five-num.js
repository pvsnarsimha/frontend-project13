/* FiveNum: fivenum tool (render, compute, setup) */

// FIVE-NUMBER SUMMARY (Min, Q1, Median, Q3, Max)
function renderFiveNumInterface() {
    return buildInterface({
        id: "statFiveNumInterface",
        title: "📦 Five-Number Summary (Min, Q₁, Median, Q₃, Max)",
        formula: "📌 Min | Q₁ | Median | Q₃ | Max",
        desc: "The five-number summary provides a complete snapshot of data distribution: minimum, first quartile (25th percentile), median (50th percentile), third quartile (75th percentile), and maximum.",
        inputs: [
            {
                label: "📋 Enter numeric values",
                textarea: { id: "fiveNumInput", rows: "3", placeholder: "Example: 12, 45, 23, 67, 34, 89, 56, 78, 90" }
            }
        ],
        run: { id: "fiveNumComputeBtn", text: "📦 Calculate Five-Number Summary + Steps" },
        clear: { id: "fiveNumClearBtn", text: "Clear" },
        result: {
            area: "fiveNumResultArea",
            label: "🎯 FIVE-NUMBER SUMMARY RESULTS",
            value: "fiveNumValueDisplay",
            steps: "fiveNumStepsDisplay"
        }
    });
}

// ========== FIVE-NUMBER SUMMARY COMPUTATION ==========
function computeFiveNumWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    let sorted = [...numbers].sort((a,b) => a-b);
    let n = sorted.length;
    let min = sorted[0];
    let max = sorted[n-1];
    
    let getMedian = (arr) => {
        let m = arr.length;
        if (m % 2 === 0) return (arr[m/2 - 1] + arr[m/2]) / 2;
        else return arr[Math.floor(m/2)];
    };
    
    let q1, q3;
    if (n % 2 === 0) {
        q1 = getMedian(sorted.slice(0, n/2));
        q3 = getMedian(sorted.slice(n/2));
    } else {
        q1 = getMedian(sorted.slice(0, Math.floor(n/2)));
        q3 = getMedian(sorted.slice(Math.floor(n/2) + 1));
    }
    
    let median = getMedian(sorted);
    let iqr = q3 - q1;
    
    let steps = `📦 FORMULA: Five-Number Summary = {Min, Q₁, Median, Q₃, Max}\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Sort the data in ascending order\n`;
    steps += `   Original: [${numbers.join(', ')}]\n`;
    steps += `   Sorted:   [${sorted.join(', ')}]\n`;
    steps += `   n = ${n}\n\n`;
    
    steps += `Step 2: Find Minimum value\n`;
    steps += `   Minimum = first value in sorted list = ${min}\n\n`;
    
    steps += `Step 3: Find Maximum value\n`;
    steps += `   Maximum = last value in sorted list = ${max}\n\n`;
    
    steps += `Step 4: Find Median (Q₂)\n`;
    if (n % 2 === 0) {
        let left = sorted[n/2 - 1];
        let right = sorted[n/2];
        steps += `   n is even → median = (${left} + ${right}) / 2 = ${median}\n\n`;
    } else {
        let pos = Math.floor(n/2);
        steps += `   n is odd → median = value at position ${pos+1} = ${median}\n\n`;
    }
    
    steps += `Step 5: Find Q₁ (25th percentile - median of lower half)\n`;
    if (n % 2 === 0) {
        let lowerHalf = sorted.slice(0, n/2);
        steps += `   Lower half = [${lowerHalf.join(', ')}]\n`;
        if (lowerHalf.length % 2 === 0) {
            let left = lowerHalf[lowerHalf.length/2 - 1];
            let right = lowerHalf[lowerHalf.length/2];
            steps += `   Q₁ = (${left} + ${right}) / 2 = ${q1}\n\n`;
        } else {
            steps += `   Q₁ = ${q1}\n\n`;
        }
    } else {
        let lowerHalf = sorted.slice(0, Math.floor(n/2));
        steps += `   Lower half = [${lowerHalf.join(', ')}]\n`;
        steps += `   Q₁ = ${q1}\n\n`;
    }
    
    steps += `Step 6: Find Q₃ (75th percentile - median of upper half)\n`;
    if (n % 2 === 0) {
        let upperHalf = sorted.slice(n/2);
        steps += `   Upper half = [${upperHalf.join(', ')}]\n`;
        if (upperHalf.length % 2 === 0) {
            let left = upperHalf[upperHalf.length/2 - 1];
            let right = upperHalf[upperHalf.length/2];
            steps += `   Q₃ = (${left} + ${right}) / 2 = ${q3}\n\n`;
        } else {
            steps += `   Q₃ = ${q3}\n\n`;
        }
    } else {
        let upperHalf = sorted.slice(Math.floor(n/2) + 1);
        steps += `   Upper half = [${upperHalf.join(', ')}]\n`;
        steps += `   Q₃ = ${q3}\n\n`;
    }
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Five-Number Summary:\n`;
    steps += `   Minimum (Min) = ${min}\n`;
    steps += `   Q₁ (25th percentile) = ${q1.toFixed(4)}\n`;
    steps += `   Median (Q₂ / 50th percentile) = ${median.toFixed(4)}\n`;
    steps += `   Q₃ (75th percentile) = ${q3.toFixed(4)}\n`;
    steps += `   Maximum (Max) = ${max}\n`;
    steps += `   IQR = ${iqr.toFixed(4)}`;
    
    return { min, q1, median, q3, max, iqr, steps: steps };
}

// ========== SETUP FUNCTIONS ==========
function setupFiveNumLogic() {
    const computeBtn = document.getElementById("fiveNumComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("fiveNumInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("fiveNumResultArea");
        const valueSpan = document.getElementById("fiveNumValueDisplay");
        const stepsSpan = document.getElementById("fiveNumStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to compute five-number summary.";
            return;
        }
        
        const fiveNumRes = computeFiveNumWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerText = `Min: ${fiveNumRes.min} | Q₁: ${fiveNumRes.q1.toFixed(4)} | Median: ${fiveNumRes.median.toFixed(4)} | Q₃: ${fiveNumRes.q3.toFixed(4)} | Max: ${fiveNumRes.max}`;
        stepsSpan.innerText = fiveNumRes.steps;
    });
    attachClearHandler("fiveNumClearBtn", "fiveNumInput", "fiveNumResultArea");
}
