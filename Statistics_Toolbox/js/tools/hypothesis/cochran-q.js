/* CochranQ: cochranq tool (render, compute, setup) */

// ========== COCHRAN'S Q TEST INTERFACE ==========
function renderCochranQInterface() {
    return buildInterface({
        id: "statCochranQInterface",
        title: "🔬 Cochran's Q Test",
        formula: "📌 Q = (k(k-1) × Σ(Cⱼ - C̄)²) / (k × ΣRᵢ - ΣRᵢ²)",
        desc: "<strong>What is Cochran's Q Test?</strong><br>\n                    Extension of McNemar's test for 3+ related groups. Tests if multiple \n                    matched/binary outcomes have the same proportion of \"successes\".\n                    <br><br>\n                    <strong>H₀:</strong> All treatments have the same effect<br>\n                    <strong>H₁:</strong> At least one treatment differs",
        inputs: [
            {
                label: "📋 Enter data (each row = subject, each column = treatment, 0/1 values):",
                textarea: {
                    id: "cochranData",
                    rows: "6",
                    placeholder: "Example (subjects × treatments):&#10;1, 1, 0&#10;1, 0, 0&#10;0, 1, 1&#10;1, 1, 1&#10;0, 0, 1"
                }
            },
            {
                hint: "<strong>Format:</strong> Each row is one subject. Each column is one treatment/time point.<br>\n                    Values must be <strong>0 or 1</strong> (binary outcomes).",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "cochranAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "cochranComputeBtn", text: "🔬 Run Cochran's Q Test + Full Steps" },
        clear: { id: "cochranClearBtn", text: "Clear" },
        result: {
            area: "cochranResultArea",
            label: "🎯 COCHRAN'S Q TEST RESULTS",
            value: "cochranValueDisplay",
            steps: "cochranStepsDisplay"
        }
    });
}

// ========== COCHRAN'S Q TEST COMPUTATION ==========
function computeCochranQTest(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    for (let r = 0; r < lines.length; r++) {
        const line = lines[r].trim();
        if (line === "") continue;
        let values = parseNumbersFromInput(line);
        if (values.length > 0) {
            // Every value must be 0 or 1: reject the input (naming the row) instead of silently dropping the row
            if (values.some(val => val !== 0 && val !== 1)) {
                return { error: true, message: `Row ${r + 1} ("${escapeHtml(line)}") contains a value other than 0 or 1. Cochran's Q needs binary data (0 = failure, 1 = success) in every row.` };
            }
            data.push(values);
        }
    }
    
    if (data.length < 3) {
        return { error: true, message: "Need at least 3 subjects (rows) for Cochran's Q test." };
    }
    
    const n = data.length; // number of subjects
    const k = data[0].length; // number of treatments
    
    if (k < 3) {
        return { error: true, message: "Need at least 3 treatments (columns) for Cochran's Q test." };
    }
    
    // Check all rows have same number of columns
    for (let row of data) {
        if (row.length !== k) {
            return { error: true, message: "All rows must have the same number of treatments." };
        }
    }
    
    // Calculate column totals (Cⱼ)
    let colTotals = Array(k).fill(0);
    for (let j = 0; j < k; j++) {
        for (let i = 0; i < n; i++) {
            colTotals[j] += data[i][j];
        }
    }
    
    // Calculate row totals (Rᵢ)
    let rowTotals = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < k; j++) {
            rowTotals[i] += data[i][j];
        }
    }
    
    // Calculate Cochran's Q statistic
    let sumColTotals = colTotals.reduce((a,b) => a+b, 0);
    let sumColSquares = colTotals.reduce((a,b) => a + b*b, 0);
    let sumRowTotals = rowTotals.reduce((a,b) => a+b, 0);
    let sumRowSquares = rowTotals.reduce((a,b) => a + b*b, 0);
    
    let numerator = k * (k - 1) * sumColSquares - (k - 1) * sumColTotals * sumColTotals;
    let denominator = k * sumRowTotals - sumRowSquares;
    let Q = numerator / denominator;
    
    const df = k - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(Q, df);
    const rejectH0 = Q > criticalValue;
    
    // Build data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        dataRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            ${data[i].map(val => `<td style="padding: 8px; text-align: center; font-weight: ${val === 1 ? 'bold' : 'normal'}; color: ${val === 1 ? '#28a745' : '#6c757d'};">${val}</td>`).join('')}
            <td style="padding: 8px; text-align: center; background: #e8f4f8;">${rowTotals[i]}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🔬</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">Cochran's Q Test</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Comparing Multiple Related Binary Outcomes</p>
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px;">Subjects (n)</div>
                    <div style="font-size: 32px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px;">Treatments (k)</div>
                    <div style="font-size: 32px; font-weight: 700;">${k}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px;">Total "Successes"</div>
                    <div style="font-size: 32px; font-weight: 700;">${sumColTotals}</div>
                </div>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Subject</th>
                            ${Array(k).fill().map((_, j) => `<th style="padding: 10px;">Treatment ${j+1}</th>`).join('')}
                            <th style="padding: 10px;">Row Total (Rᵢ)</th>
                        </tr>
                    </thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Step 1: Calculate column totals (Cⱼ)</strong><br>
                ${colTotals.map((c, j) => `C<sub>${j+1}</sub> = ${c}`).join(', ')}<br>
                ΣCⱼ = ${sumColTotals}<br>
                ΣCⱼ² = ${colTotals.map(c => `${c}² = ${c*c}`).join(' + ')} = ${sumColSquares}
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Step 2: Calculate row totals (Rᵢ)</strong><br>
                ${rowTotals.map((r, i) => `R<sub>${i+1}</sub> = ${r}`).join(', ')}<br>
                ΣRᵢ = ${sumRowTotals}<br>
                ΣRᵢ² = ${rowTotals.map(r => `${r}² = ${r*r}`).join(' + ')} = ${sumRowSquares}
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Step 3: Calculate Cochran's Q statistic</strong><br>
                Q = [k(k-1) × ΣCⱼ² - (k-1) × (ΣCⱼ)²] / [k × ΣRᵢ - ΣRᵢ²]<br>
                Q = [${k}×${k-1} × ${sumColSquares} - ${k-1} × ${sumColTotals}²] / [${k} × ${sumRowTotals} - ${sumRowSquares}]<br>
                Q = [${k*(k-1)} × ${sumColSquares} - ${k-1} × ${sumColTotals*sumColTotals}] / [${k*sumRowTotals} - ${sumRowSquares}]<br>
                Q = [${k*(k-1)*sumColSquares} - ${(k-1)*sumColTotals*sumColTotals}] / [${k*sumRowTotals} - ${sumRowSquares}]<br>
                Q = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                <strong style="color: #1a5490; font-size: 18px;">Q = ${Q.toFixed(6)}</strong>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>Q Statistic:</strong> ${Q.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Conclusion:</strong> ${rejectH0 ? 'There IS sufficient evidence that the treatments have different effects (proportions are not equal).' : 'There is NOT sufficient evidence that the treatments differ in their effects.'}
            </div>
        </div>
    </div>`;
    
    return { Q, df, pValue, criticalValue, rejectH0, steps };
}

// ========== COCHRAN'S Q TEST SETUP ==========
function setupCochranQLogic() {
    const computeBtn = document.getElementById("cochranComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("cochranData").value;
        const alpha = parseFloat(document.getElementById("cochranAlpha").value);
        const resultDiv = document.getElementById("cochranResultArea");
        const valueSpan = document.getElementById("cochranValueDisplay");
        const stepsSpan = document.getElementById("cochranStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data (0/1 values, rows = subjects, columns = treatments).");
            return;
        }
        
        const result = computeCochranQTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `Q = ${result.Q.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("cochranClearBtn", "cochranData", "cochranResultArea");
}
