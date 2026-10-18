/* RunsTest: runstest tool (render, compute, setup) */

// ========== RUNS TEST (RANDOMNESS) INTERFACE ==========
function renderRunsTestInterface() {
    return buildInterface({
        id: "statRunsTestInterface",
        title: "🎲 Runs Test for Randomness",
        formula: "📌 Z = (R - μ_R) / σ_R",
        desc: "<strong>What is the Runs Test?</strong><br>\n                    Tests whether a sequence of binary observations is random.\n                    A \"run\" is a consecutive sequence of identical symbols.\n                    <br><br>\n                    <strong>H₀:</strong> The sequence is random<br>\n                    <strong>H₁:</strong> The sequence is not random",
        inputs: [
            {
                label: "📋 Enter sequence (comma, space, or line separated, use 0/1 or any two symbols):",
                textarea: { id: "runsTestInput", rows: "4", placeholder: "Example: 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1" }
            },
            {
                hint: "Values will be treated as two categories (e.g., 0/1, A/B, Yes/No)",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "runsTestAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "runsTestComputeBtn", text: "🎲 Run Runs Test + Full Steps" },
        clear: { id: "runsTestClearBtn", text: "Clear" },
        result: {
            area: "runsTestResultArea",
            label: "🎯 RUNS TEST RESULTS",
            value: "runsTestValueDisplay",
            steps: "runsTestStepsDisplay"
        }
    });
}

// ========== RUNS TEST COMPUTATION ==========
function computeRunsTest(inputText, alpha) {
    const rawValues = inputText.trim().split(/[,\s\n]+/);
    let sequence = [];
    
    for (let val of rawValues) {
        val = val.trim();
        if (val === "") continue;
        // Try to parse as number first
        let num = parseFloat(val);
        if (!isNaN(num)) {
            sequence.push(num);
        } else {
            // If not a number, treat as string category
            sequence.push(val);
        }
    }
    
    if (sequence.length < 3) {
        return { error: true, message: "Need at least 3 observations for Runs test." };
    }
    
    const n = sequence.length;
    
    // Count runs and frequencies of each value
    let runs = 1;
    let count1 = 0;
    let count2 = 0;
    let runDetails = [];
    let currentRun = [sequence[0]];
    let firstValue = sequence[0];
    
    for (let i = 1; i < n; i++) {
        if (sequence[i] === sequence[i-1]) {
            currentRun.push(sequence[i]);
        } else {
            runs++;
            runDetails.push({ value: currentRun[0], length: currentRun.length, positions: [i - currentRun.length + 1, i] });
            currentRun = [sequence[i]];
        }
    }
    runDetails.push({ value: currentRun[0], length: currentRun.length, positions: [n - currentRun.length + 1, n] });
    
    // Count frequencies of each unique value
    const uniqueValues = [...new Set(sequence)];
    let n1 = 0, n2 = 0;
    let value1 = uniqueValues[0];
    let value2 = uniqueValues.length > 1 ? uniqueValues[1] : null;
    
    for (let val of sequence) {
        if (val === value1) n1++;
        else if (value2 !== null && val === value2) n2++;
    }
    
    // The runs test is for a two-symbol sequence; a third symbol would be silently dropped from the counts
    if (uniqueValues.length > 2) {
        return { error: true, message: `The runs test needs exactly 2 distinct symbols, but found ${uniqueValues.length}: ${uniqueValues.slice(0, 6).map(v => escapeHtml(v)).join(', ')}${uniqueValues.length > 6 ? ', ...' : ''}. Recode the data into two categories (for example above/below the median as 1/0).` };
    }
    
    // If only one unique value, test is trivial
    if (value2 === null) {
        return { error: true, message: "Sequence must contain at least two different symbols." };
    }
    
    // Calculate expected runs and standard deviation
    const expectedRuns = (2 * n1 * n2) / (n1 + n2) + 1;
    const numeratorStd = 2 * n1 * n2 * (2 * n1 * n2 - n1 - n2);
    const denominatorStd = Math.pow(n1 + n2, 2) * (n1 + n2 - 1);
    const stdRuns = Math.sqrt(numeratorStd / denominatorStd);
    
    // Calculate z-statistic
    let z = (runs - expectedRuns) / stdRuns;
    const pValue = 2 * (1 - normCDF(Math.abs(z)));
    const criticalZ = normInv(1 - alpha / 2);
    const rejectH0 = Math.abs(z) > criticalZ;
    
    // Build run details table
    let runTableRows = '';
    for (let i = 0; i < runDetails.length; i++) {
        const r = runDetails[i];
        runTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: ${r.value === value1 ? '#28a745' : '#dc3545'};">${r.value}</td>
            <td style="padding: 8px; text-align: center;">${r.length}</td>
            <td style="padding: 8px; text-align: center;">Positions ${r.positions[0]} to ${r.positions[1]} (${r.length} ${r.value === value1 ? value1 : value2}(s))</td>
        </tr>`;
    }
    
    // Build sequence display with colored runs
    let sequenceDisplay = '';
    let currentColor = '';
    for (let i = 0; i < n; i++) {
        const val = sequence[i];
        const color = val === value1 ? '#28a745' : '#dc3545';
        if (i > 0 && sequence[i] !== sequence[i-1]) {
            sequenceDisplay += `<span style="color: ${color}; font-weight: bold;"> ${val} </span>`;
        } else if (i === 0) {
            sequenceDisplay += `<span style="color: ${color}; font-weight: bold;">${val} </span>`;
        } else {
            sequenceDisplay += `<span style="color: ${color};">${val} </span>`;
        }
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🎲</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">Runs Test for Randomness</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Testing if a sequence occurs in a random order</p>
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Understanding the Runs Test</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p><strong>What is a "Run"?</strong> A run is a consecutive sequence of identical symbols.</p>
                <p><strong>Example:</strong> In the sequence <code>1 1 0 0 0 1 0 1 1</code>, runs are: <strong>1 1</strong> | <strong>0 0 0</strong> | <strong>1</strong> | <strong>0</strong> | <strong>1 1</strong> → 5 runs total.</p>
                <p><strong>Interpretation:</strong></p>
                <ul>
                    <li><strong>Too few runs</strong> → Clustering (non-random pattern)</li>
                    <li><strong>Too many runs</strong> → Alternating pattern (non-random)</li>
                    <li><strong>Expected runs</strong> → Random sequence</li>
                </ul>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📋 Input Sequence</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 18px; text-align: center; padding: 15px; background: #f0f4fa; border-radius: 8px;">
                    ${sequenceDisplay}
                </div>
                <div style="margin-top: 15px;">
                    <strong>n = ${n}</strong> observations<br>
                    <strong>${value1}:</strong> ${n1} occurrences | <strong>${value2}:</strong> ${n2} occurrences
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 20px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">🔢 Step 1: Identify All Runs</h3>
            <div style="padding: 15px;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #e9ecef;">
                                <th style="padding: 10px;">Run #</th>
                                <th style="padding: 10px;">Value</th>
                                <th style="padding: 10px;">Length</th>
                                <th style="padding: 10px;">Positions</th>
                            </tr>
                        </thead>
                        <tbody>${runTableRows}
                            <tr style="background: #e9ecef; font-weight: bold;">
                                <td colspan="3" style="padding: 10px; text-align: right;">Total Runs (R) →</td>
                                <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${runs}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Expected Runs and Standard Deviation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Formula for Expected Runs (μ_R):</strong><br>
                μ_R = (2 × n₁ × n₂) / (n₁ + n₂) + 1<br>
                μ_R = (2 × ${n1} × ${n2}) / (${n1} + ${n2}) + 1<br>
                μ_R = (${2 * n1 * n2}) / ${n1 + n2} + 1<br>
                μ_R = ${(2 * n1 * n2 / (n1 + n2)).toFixed(4)} + 1 = <strong style="color: #1a5490;">${expectedRuns.toFixed(4)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula for Standard Deviation (σ_R):</strong><br>
                σ_R = √[ (2 × n₁ × n₂ × (2 × n₁ × n₂ - n₁ - n₂) ) / ( (n₁ + n₂)² × (n₁ + n₂ - 1) ) ]<br>
                σ_R = √[ (2 × ${n1} × ${n2} × (2 × ${n1} × ${n2} - ${n1} - ${n2})) / ( (${n1 + n2})² × (${n1 + n2 - 1}) ) ]<br>
                σ_R = √[ ${2 * n1 * n2} × (${2 * n1 * n2 - n1 - n2}) / ( ${Math.pow(n1 + n2, 2)} × ${n1 + n2 - 1} ) ]<br>
                σ_R = √[ ${numeratorStd} / ${denominatorStd} ]<br>
                σ_R = √${(numeratorStd / denominatorStd).toFixed(6)} = <strong style="color: #1a5490;">${stdRuns.toFixed(4)}</strong>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate z-statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula:</strong> z = (R - μ_R) / σ_R<br>
                z = (${runs} - ${expectedRuns.toFixed(4)}) / ${stdRuns.toFixed(4)}<br>
                z = ${(runs - expectedRuns).toFixed(4)} / ${stdRuns.toFixed(4)}<br>
                <div style="font-size: 24px; font-weight: 700; color: #1a5490; text-align: center; margin-top: 10px;">z = ${z.toFixed(8)}</div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>Runs (R):</strong> ${runs}</div>
            <div><strong>Expected Runs (μ_R):</strong> ${expectedRuns.toFixed(4)}</div>
            <div><strong>Standard Deviation (σ_R):</strong> ${stdRuns.toFixed(4)}</div>
            <div><strong>z-statistic:</strong> ${z.toFixed(6)}</div>
            <div><strong>Critical z (α = ${alpha}, two-tailed):</strong> ±${criticalZ.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Conclusion:</strong> ${rejectH0 ? 'There IS sufficient evidence that the sequence is NOT random.' : 'There is NOT sufficient evidence to reject randomness. The sequence appears random.'}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px;">
            <strong>💡 Interpretation Guide:</strong><br>
            • If z > ${criticalZ.toFixed(4)} → Too few runs (clustering pattern)<br>
            • If z < -${criticalZ.toFixed(4)} → Too many runs (alternating pattern)<br>
            • If |z| ≤ ${criticalZ.toFixed(4)} → Sequence is random
        </div>
    </div>`;
    
    return { runs, expectedRuns, stdRuns, z, pValue, rejectH0, steps };
}

// ========== SETUP FUNCTIONS ==========
function setupRunsTestLogic() {
    const computeBtn = document.getElementById("runsTestComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("runsTestInput").value;
        const alpha = parseFloat(document.getElementById("runsTestAlpha").value);
        const resultDiv = document.getElementById("runsTestResultArea");
        const valueSpan = document.getElementById("runsTestValueDisplay");
        const stepsSpan = document.getElementById("runsTestStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter a sequence of values.");
            return;
        }
        
        const result = computeRunsTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `R = ${result.runs} | z = ${result.z.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Non-random' : 'Random'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("runsTestClearBtn", "runsTestInput", "runsTestResultArea");
}
