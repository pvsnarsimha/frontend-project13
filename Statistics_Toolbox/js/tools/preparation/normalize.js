/* Normalize: normalize tool (render, compute, setup) */

function renderNormalizeInterface() {
    return buildInterface({
        id: "statNormalizeInterface",
        title: "📏 Normalization (Min-Max Scaling)",
        formula: "📌 x_norm = (x - x_min) / (x_max - x_min)",
        desc: "Scales data to range [0, 1]. Preserves relationships while transforming to a common scale.",
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated)",
                textarea: { id: "normalizeInput", rows: "4", placeholder: "Example: 10, 20, 30, 40, 50, 60" }
            }
        ],
        run: { id: "normalizeComputeBtn", text: "📏 Calculate Normalized Values + Steps" },
        clear: { id: "normalizeClearBtn", text: "Clear" },
        result: {
            area: "normalizeResultArea",
            label: "🎯 NORMALIZATION RESULTS [0, 1]",
            value: "normalizeValueDisplay",
            steps: "normalizeStepsDisplay"
        }
    });
}

// ========== MIN-MAX NORMALIZATION ==========
function computeNormalizeWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    let min = Math.min(...numbers);
    let max = Math.max(...numbers);
    let range = max - min;
    
    if (range === 0) {
        return { error: true, message: "All values are identical. Normalized values will all be 0.5." };
    }
    
    let steps = `📏 FORMULA: x_norm = (x - x_min) / (x_max - x_min)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Find minimum and maximum values\n`;
    steps += `   x_min = ${min}\n`;
    steps += `   x_max = ${max}\n`;
    steps += `   Range = ${max} - ${min} = ${range}\n\n`;
    
    steps += `Step 2: Apply normalization formula to each value\n`;
    let normalized = [];
    numbers.forEach(x => {
        let norm = (x - min) / range;
        normalized.push(norm);
    });
    
    steps += `   Normalized values:\n`;
    numbers.forEach((x, i) => {
        steps += `   ${x} → (${x} - ${min}) / ${range} = ${normalized[i].toFixed(6)}\n`;
    });
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ NORMALIZED VALUES (range [0, 1]):\n`;
    steps += `   ${normalized.map(n => n.toFixed(6)).join(', ')}\n`;
    steps += `\n📌 Interpretation:\n`;
    steps += `   • Original minimum (${min}) → 0\n`;
    steps += `   • Original maximum (${max}) → 1\n`;
    steps += `   • Other values are proportionally scaled between 0 and 1`;
    
    return { min, max, range, normalized, steps };
}

function setupNormalizeLogic() {
    const computeBtn = document.getElementById("normalizeComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("normalizeInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("normalizeResultArea");
        const valueSpan = document.getElementById("normalizeValueDisplay");
        const stepsSpan = document.getElementById("normalizeStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to normalize.";
            return;
        }
        
        const normRes = computeNormalizeWithSteps(numbers);
        if (normRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerText = normRes.message;
            return;
        }
        
        resultDiv.style.display = "block";
        setHtml(valueSpan, `Normalized: ${normRes.normalized.map(n => n.toFixed(4)).join(', ')}`);
        stepsSpan.innerText = normRes.steps;
    });
    attachClearHandler("normalizeClearBtn", "normalizeInput", "normalizeResultArea");
}
