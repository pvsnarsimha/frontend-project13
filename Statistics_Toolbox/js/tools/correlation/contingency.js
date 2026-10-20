/* Contingency: contingency tool (render, compute, setup) */

// ========== CONTINGENCY TABLE RENDER FUNCTION ==========
function renderContingencyInterface() {
    return buildInterface({
        id: "statContingencyInterface",
        title: "📋 Contingency Table (Cross-Tabulation)",
        formula: "📌 Frequency table showing distribution of two categorical variables",
        desc: "Shows frequency counts for combinations of two categorical variables. Each cell contains the count of observations falling into that category pair.",
        inputs: [
            {
                label: "📋 Enter data as comma-separated pairs (category1, category2):",
                textarea: {
                    id: "contingencyData",
                    rows: "4",
                    placeholder: "Example:&#10;Red, Apple&#10;Green, Apple&#10;Red, Orange&#10;Red, Apple&#10;Green, Orange&#10;Red, Orange"
                }
            },
            {
                hint: "Each line: value for Row Variable, value for Column Variable",
                hintAttrs: { style: HINT_STYLE }
            }
        ],
        run: { id: "contingencyComputeBtn", text: "📋 Build Contingency Table" },
        clear: { id: "contingencyClearBtn", text: "Clear" },
        result: {
            area: "contingencyResultArea",
            label: "🎯 CONTINGENCY TABLE",
            value: "contingencyValueDisplay",
            steps: "contingencyStepsDisplay"
        }
    });
}

// ========== CONTINGENCY TABLE COMPUTATION ==========
function computeContingencyTableWithSteps(inputText) {
    const lines = inputText.trim().split(/\r?\n/);
    const pairs = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 2) {
            pairs.push({ row: parts[0], col: parts[1] });
        }
    }
    
    if (pairs.length === 0) {
        return { error: true, message: "No valid data pairs entered." };
    }
    
    // Get unique row and column categories
    const rowCategories = [...new Set(pairs.map(p => p.row))].sort();
    const colCategories = [...new Set(pairs.map(p => p.col))].sort();
    
    // Create contingency table
    const table = Object.create(null);
    const rowTotals = Object.create(null);
    const colTotals = Object.create(null);
    
    // Initialize table
    for (let row of rowCategories) {
        table[row] = Object.create(null);
        rowTotals[row] = 0;
        for (let col of colCategories) {
            table[row][col] = 0;
        }
    }
    for (let col of colCategories) {
        colTotals[col] = 0;
    }
    
    // Fill table
    for (let pair of pairs) {
        table[pair.row][pair.col]++;
        rowTotals[pair.row]++;
        colTotals[pair.col]++;
    }
    
    const grandTotal = pairs.length;
    
    // Build HTML table
    let tableHtml = `<div class="s-01a9b9">
        <table class="s-24a669 gen-sized">
            <thead>
                <tr>
                    <th class="s-b259dc"></th>`;
    for (let col of colCategories) {
        tableHtml += `<th class="s-b259dc">${col}</th>`;
    }
    tableHtml += `<th class="s-b259dc">Row Total</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let row of rowCategories) {
        tableHtml += `<tr>
            <th class="s-131038">${row}</th>`;
        for (let col of colCategories) {
            tableHtml += `<td class="s-21fdcf">${table[row][col]}</td>`;
        }
        tableHtml += `<td class="s-e908bd">${rowTotals[row]}</td>
        </tr>`;
    }
    
    tableHtml += `<tr>
        <th class="s-131038">Column Total</th>`;
    for (let col of colCategories) {
        tableHtml += `<td class="s-e908bd">${colTotals[col]}</td>`;
    }
    tableHtml += `<td class="s-e908bd">${grandTotal}</td>
    </tr>`;
    tableHtml += `</tbody></table></div>`;
    
    let steps = `📋 CONTINGENCY TABLE (Cross-Tabulation)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Total observations: ${grandTotal}\n\n`;
    steps += `Row variable categories: ${rowCategories.join(', ')}\n`;
    steps += `Column variable categories: ${colCategories.join(', ')}\n\n`;
    steps += `${tableHtml}`;
    
    return { table, rowCategories, colCategories, rowTotals, colTotals, grandTotal, steps, tableHtml };
}

// ========== CONTINGENCY TABLE SETUP ==========
function setupContingencyLogic() {
    const computeBtn = document.getElementById("contingencyComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("contingencyData").value;
        const resultDiv = document.getElementById("contingencyResultArea");
        const valueSpan = document.getElementById("contingencyValueDisplay");
        const stepsSpan = document.getElementById("contingencyStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter data pairs (category1, category2)";
            return;
        }
        
        const result = computeContingencyTableWithSteps(raw);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
        } else {
            setHtml(valueSpan, `${result.rowCategories.length} rows × ${result.colCategories.length} columns | Total: ${result.grandTotal} observations`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("contingencyClearBtn", "contingencyData", "contingencyResultArea");
}
