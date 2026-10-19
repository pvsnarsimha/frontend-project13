/* Binning: binning tool (render, compute, setup) */

// ========== BINNING/DISCRETIZATION RENDER FUNCTION ==========
function renderBinningInterface() {
    return buildInterface({
        id: "statBinningInterface",
        title: "📦 Binning / Discretization (Group Continuous Data)",
        formula: "📌 Group continuous values into discrete intervals/bins",
        desc: "Discretization converts continuous data into categorical bins. Choose equal-width bins or custom breaks.",
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated)",
                textarea: { id: "binningInput", rows: "4", placeholder: "Example: 12, 15, 18, 22, 25, 28, 30, 35, 40, 45, 50, 55, 60" }
            },
            {
                label: "🔧 Binning Method:",
                labelAttrs: { style: FIELD_GAP },
                select: {
                    id: "binningMethod",
                    style: "width: 100%; padding: 10px; border-radius: 40px; border: 1px solid #cbdde9; margin-bottom: 15px;"
                },
                options: [["equal_width", "Equal Width Bins"], ["custom", "Custom Breaks"]]
            },
            {
                html: "<div id=\"equalWidthOptions\">\n                    <label>📊 Number of Bins:</label>\n                    <input type=\"number\" id=\"numBins\" value=\"5\" min=\"2\" max=\"20\" style=\"width: 100%; padding: 10px; border-radius: 40px; border: 1px solid #cbdde9; margin-bottom: 15px;\">\n                </div>"
            },
            {
                html: "<div id=\"customOptions\" style=\"display: none;\">\n                    <label>✂️ Custom Break Points (comma-separated):</label>\n                    <textarea id=\"customBreaks\" rows=\"2\" placeholder=\"Example: 20, 30, 40, 50\"></textarea>\n                    <div class=\"desc\" style=\"font-size: 0.75rem; margin-top: 5px;\">Values will be grouped into intervals based on these break points.</div>\n                </div>"
            }
        ],
        run: { id: "binningComputeBtn", text: "📦 Apply Binning + Steps" },
        clear: { id: "binningClearBtn", text: "Clear" },
        result: {
            area: "binningResultArea",
            label: "🎯 BINNING RESULTS",
            value: "binningValueDisplay",
            steps: "binningStepsDisplay"
        }
    });
}

// ========== BINNING/DISCRETIZATION COMPUTATION ==========
function computeBinningWithSteps(numbers, method, numBins = 5, customBreaks = []) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    let breaks = [];
    let binLabels = [];
    
    if (method === 'equal_width') {
        const binWidth = (max - min) / numBins;
        for (let i = 0; i <= numBins; i++) {
            breaks.push(min + i * binWidth);
        }
    } else if (method === 'custom') {
        if (!customBreaks.length) return { error: true, message: "Please provide custom break points." };
        breaks = [min, ...customBreaks.sort((a,b) => a-b), max];
    }
    
    // Generate bin labels
    for (let i = 0; i < breaks.length - 1; i++) {
        binLabels.push(`[${breaks[i].toFixed(2)}, ${breaks[i+1].toFixed(2)})`);
    }
    // Last bin includes upper bound
    binLabels[binLabels.length - 1] = `[${breaks[breaks.length-2].toFixed(2)}, ${breaks[breaks.length-1].toFixed(2)}]`;
    
    // Assign each value to a bin
    const bins = new Array(binLabels.length).fill(0);
    const assignments = [];
    
    numbers.forEach(num => {
        for (let i = 0; i < breaks.length - 1; i++) {
            if (i === breaks.length - 2) {
                if (num >= breaks[i] && num <= breaks[i+1]) {
                    bins[i]++;
                    assignments.push({ value: num, bin: binLabels[i], binIndex: i });
                    break;
                }
            } else {
                if (num >= breaks[i] && num < breaks[i+1]) {
                    bins[i]++;
                    assignments.push({ value: num, bin: binLabels[i], binIndex: i });
                    break;
                }
            }
        }
    });
    
    let steps = `📦 FORMULA: Discretization / Binning\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Step 1: Data Summary\n`;
    steps += `   n = ${numbers.length}\n`;
    steps += `   Min = ${min.toFixed(4)}, Max = ${max.toFixed(4)}\n`;
    steps += `   Range = ${(max - min).toFixed(4)}\n\n`;
    
    if (method === 'equal_width') {
        steps += `Step 2: Create ${numBins} equal-width bins\n`;
        steps += `   Bin width = (${max.toFixed(4)} - ${min.toFixed(4)}) / ${numBins} = ${((max-min)/numBins).toFixed(4)}\n\n`;
    } else {
        steps += `Step 2: Using custom break points\n`;
        steps += `   Breaks: ${customBreaks.join(', ')}\n\n`;
    }
    
    steps += `Step 3: Bin boundaries\n`;
    binLabels.forEach((label, i) => {
        steps += `   Bin ${i+1}: ${label}\n`;
    });
    
    steps += `\nStep 4: Assign values to bins\n`;
    assignments.forEach(assign => {
        steps += `   ${assign.value} → ${assign.bin}\n`;
    });
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ BINNING SUMMARY:\n`;
    steps += `   Bin Distribution:\n`;
    binLabels.forEach((label, i) => {
        steps += `   ${label}: ${bins[i]} value(s)\n`;
    });
    
    return { bins, assignments, binLabels, breaks, steps };
}

// ========== BINNING SETUP FUNCTION ==========
function setupBinningLogic() {
    const methodSelect = document.getElementById("binningMethod");
    const equalWidthDiv = document.getElementById("equalWidthOptions");
    const customDiv = document.getElementById("customOptions");
    
    if (methodSelect) {
        methodSelect.addEventListener('change', () => {
            if (methodSelect.value === 'equal_width') {
                equalWidthDiv.style.display = 'block';
                customDiv.style.display = 'none';
            } else {
                equalWidthDiv.style.display = 'none';
                customDiv.style.display = 'block';
            }
        });
    }
    
    const computeBtn = document.getElementById("binningComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("binningInput").value;
        const numbers = parseNumbersFromInput(raw);
        const method = document.getElementById("binningMethod").value;
        const resultDiv = document.getElementById("binningResultArea");
        const valueSpan = document.getElementById("binningValueDisplay");
        const stepsSpan = document.getElementById("binningStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to bin.";
            return;
        }
        
        let numBins = 5;
        let customBreaks = [];
        
        if (method === 'equal_width') {
            numBins = parseInt(document.getElementById("numBins").value) || 5;
        } else {
            const breaksText = document.getElementById("customBreaks").value;
            customBreaks = parseNumbersFromInput(breaksText);
            if (customBreaks.length === 0) {
                resultDiv.style.display = "block";
                valueSpan.innerText = "Error";
                stepsSpan.innerText = "Please provide custom break points.";
                return;
            }
        }
        
        const binningRes = computeBinningWithSteps(numbers, method, numBins, customBreaks);
        if (binningRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(binningRes.message));
            return;
        }
        
        resultDiv.style.display = "block";
        let summary = binningRes.binLabels.map((label, i) => `${label}: ${binningRes.bins[i]}`).join(' | ');
        setHtml(valueSpan, summary);
        stepsSpan.innerText = binningRes.steps;
    });
    
    attachClearHandler("binningClearBtn", "binningInput", "binningResultArea");
}
// ========== CORRELATION & ASSOCIATION RENDER FUNCTIONS ==========
