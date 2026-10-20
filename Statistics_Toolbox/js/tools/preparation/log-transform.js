/* LogTransform: logtransform tool (render, compute, setup) */

// ========== LOG TRANSFORMATION RENDER FUNCTION ==========
function renderLogTransformInterface() {
    return buildInterface({
        id: "statLogTransformInterface",
        title: "📈 Log Transformation (Variance Stabilization)",
        formula: "📌 y = logₑ(x) or y = log₁₀(x) or y = log₂(x)",
        desc: "Log transformation stabilizes variance, normalizes skewed distributions, and linearizes exponential relationships. All values must be > 0.",
        inputs: [
            {
                label: "📋 Enter positive numeric values (comma, space, or line separated)",
                textarea: { id: "logInput", rows: "4", placeholder: "Example: 1, 2, 4, 8, 16, 32, 64, 128" }
            },
            {
                label: "🔢 Log Base:",
                labelAttrs: { style: FIELD_GAP },
                select: {
                    id: "logBase",
                    style: FIELD_STYLE_BORDERED
                },
                options: [["natural", "Natural Log (ln) - Base e"], ["base10", "Log Base 10 (log₁₀)"], ["base2", "Log Base 2 (log₂)"]]
            }
        ],
        run: { id: "logComputeBtn", text: "📈 Apply Log Transformation + Steps" },
        clear: { id: "logClearBtn", text: "Clear" },
        result: {
            area: "logResultArea",
            label: "🎯 LOG TRANSFORMATION RESULTS",
            value: "logValueDisplay",
            steps: "logStepsDisplay"
        }
    });
}

// ========== LOG TRANSFORMATION COMPUTATION ==========
function computeLogTransformWithSteps(numbers, base) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const nonPositive = numbers.filter(v => v <= 0);
    if (nonPositive.length > 0) {
        return { error: true, message: `❌ Log transformation requires ALL values > 0. Invalid: ${nonPositive.join(', ')}` };
    }
    
    let logFunc;
    let baseName;
    if (base === 'natural') {
        logFunc = Math.log;
        baseName = 'ln (base e)';
    } else if (base === 'base10') {
        logFunc = Math.log10;
        baseName = 'log₁₀';
    } else {
        logFunc = Math.log2;
        baseName = 'log₂';
    }
    
    const transformed = numbers.map(x => logFunc(x));
    
    let steps = `📈 FORMULA: Log Transformation y = ${baseName}(x)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Step 1: Verify all values > 0\n`;
    steps += `   All values are positive ✅\n\n`;
    steps += `Step 2: Apply ${baseName} transformation to each value\n`;
    
    numbers.forEach((x, i) => {
        steps += `   ${baseName}(${x}) = ${transformed[i].toFixed(6)}\n`;
    });
    
    // Calculate summary statistics before and after
    const originalMean = numbers.reduce((a,b) => a+b, 0) / numbers.length;
    const transformedMean = transformed.reduce((a,b) => a+b, 0) / transformed.length;
    const originalStd = Math.sqrt(numbers.reduce((a,b) => a + Math.pow(b - originalMean, 2), 0) / numbers.length);
    const transformedStd = Math.sqrt(transformed.reduce((a,b) => a + Math.pow(b - transformedMean, 2), 0) / transformed.length);
    
    steps += `\nStep 3: Effect on distribution\n`;
    steps += `   Original Mean: ${originalMean.toFixed(4)}\n`;
    steps += `   Transformed Mean: ${transformedMean.toFixed(4)}\n`;
    steps += `   Original Std Dev: ${originalStd.toFixed(4)}\n`;
    steps += `   Transformed Std Dev: ${transformedStd.toFixed(4)}\n`;
    steps += `   Variance reduction: ${((1 - transformedStd/originalStd) * 100).toFixed(1)}% reduction\n`;
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ LOG TRANSFORMATION RESULTS:\n`;
    steps += `   Original values: ${numbers.map(x => x.toFixed(4)).join(', ')}\n`;
    steps += `   Transformed (${baseName}): ${transformed.map(x => x.toFixed(6)).join(', ')}`;
    
    return { original: numbers, transformed, base: baseName, steps };
}

// ========== LOG TRANSFORMATION SETUP FUNCTION ==========
function setupLogTransformLogic() {
    const computeBtn = document.getElementById("logComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("logInput").value;
        const numbers = parseNumbersFromInput(raw);
        const base = document.getElementById("logBase").value;
        const resultDiv = document.getElementById("logResultArea");
        const valueSpan = document.getElementById("logValueDisplay");
        const stepsSpan = document.getElementById("logStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to transform.";
            return;
        }
        
        const logRes = computeLogTransformWithSteps(numbers, base);
        if (logRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(logRes.message));
            return;
        }
        
        resultDiv.style.display = "block";
        setHtml(valueSpan, `Transformed: ${logRes.transformed.map(x => x.toFixed(6)).join(', ')}`);
        stepsSpan.innerText = logRes.steps;
    });
    
    attachClearHandler("logClearBtn", "logInput", "logResultArea");
}
