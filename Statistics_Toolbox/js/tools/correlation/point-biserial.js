/* PointBiserial: pointbiserial tool (render, compute, setup) */

// ========== POINT-BISERIAL CORRELATION (r_pb) ==========
function computePointBiserialWithSteps(xContinuous, yBinary) {
    if (!xContinuous.length || !yBinary.length) {
        return { error: true, message: "Please enter both continuous and binary variables." };
    }
    if (xContinuous.length !== yBinary.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xContinuous.length < 3) {
        return { error: true, message: "Need at least 3 pairs for meaningful correlation." };
    }
    
    const n = xContinuous.length;
    let sumX = 0, sumX1 = 0, sumX0 = 0;
    let n1 = 0, n0 = 0;
    let values1 = [], values0 = [];
    
    for (let i = 0; i < n; i++) {
        sumX += xContinuous[i];
        if (yBinary[i] === 1) {
            n1++;
            sumX1 += xContinuous[i];
            values1.push(xContinuous[i]);
        } else if (yBinary[i] === 0) {
            n0++;
            sumX0 += xContinuous[i];
            values0.push(xContinuous[i]);
        }
    }
    
    // Validate binary values
    if (n1 + n0 !== n) {
        return { error: true, message: "Binary variable must contain only 0 and 1 values." };
    }
    
    if (n1 === 0 || n0 === 0) {
        return { error: true, message: "Point-biserial correlation needs both groups: the binary variable has no 0s or no 1s." };
    }
    
    const meanX = sumX / n;
    const meanX1 = n1 > 0 ? sumX1 / n1 : 0;
    const meanX0 = n0 > 0 ? sumX0 / n0 : 0;
    
    let sumSqDiff = 0;
    for (let i = 0; i < n; i++) {
        sumSqDiff += Math.pow(xContinuous[i] - meanX, 2);
    }
    if (sumSqDiff === 0) {
        return { error: true, message: "Point-biserial correlation is undefined: all X values are identical (zero variance)." };
    }
    const sdX = Math.sqrt(sumSqDiff / n);
    
    const r_pb = (meanX1 - meanX0) / sdX * Math.sqrt((n1 * n0) / (n * n));
    
    let steps = `<div class="s-3c49f1">
        <div class="s-11d2a4 gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">🎯</span>
                <h2 class="s-f8a94d">Point-Biserial Correlation (r<sub>pb</sub>)</h2>
            </div>
            <p class="s-259079">Formula: r<sub>pb</sub> = (M₁ - M₀)/s<sub>X</sub> × √[(n₁·n₀)/(n²)]</p>
            <p class="s-20a400">Measures correlation between a continuous variable and a true binary variable (0/1).</p>
        </div>
        
        <div class="s-f652ac gen-pad">
            <h3 class="s-e49128">📊 Data Summary</h3>
            <div class="s-5728d8 gen-grid">
                <div class="s-b0b20b">
                    <div class="s-42da0a">Total Pairs</div>
                    <div class="s-93c0a8">${n}</div>
                </div>
                <div class="s-a31255">
                    <div class="s-42da0a">Group 1 (Y=1)</div>
                    <div class="s-0f4638">n₁ = ${n1}</div>
                    <div class="s-9fdf0e">Mean₁ = ${meanX1.toFixed(4)}</div>
                </div>
                <div class="s-30eb0c">
                    <div class="s-42da0a">Group 0 (Y=0)</div>
                    <div class="s-0f4638">n₀ = ${n0}</div>
                    <div class="s-9fdf0e">Mean₀ = ${meanX0.toFixed(4)}</div>
                </div>
            </div>
        </div>
        
        <div class="s-8b4bbf">
            <h3 class="s-4ab1da">📋 Input Data</h3>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-41b0a5">
                        <th class="s-a756db">i</th>
                        <th class="s-a756db">X (Continuous)</th>
                        <th class="s-a756db">Y (Binary 0/1)</th>
                    </tr>
                </thead>
                <tbody>`;
    for (let i = 0; i < n; i++) {
        steps += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            <td class="s-a7c3f4">${xContinuous[i]}</td>
            <td class="${yBinary[i] === 1 ? 's-46e98c' : 's-e7e4c5'}">${yBinary[i]}</td>
        </tr>`;
    }
    steps += `</tbody>${"</table>"}</div>
        
        <div class="s-62c9d0 gen-pad">
            <h3 class="s-e49128">🔢 Step-by-Step Calculation</h3>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-5f9750 gen-flex gen-sized">1</div>
                    <div><strong>Calculate Group Means</strong></div>
                </div>
                <div class="s-78a84b">
                    <div>M₁ = ΣX(Y=1) / n₁ = ${sumX1} / ${n1} = ${meanX1.toFixed(6)}</div>
                    <div>M₀ = ΣX(Y=0) / n₀ = ${sumX0} / ${n0} = ${meanX0.toFixed(6)}</div>
                    <div>M₁ - M₀ = ${(meanX1 - meanX0).toFixed(6)}</div>
                </div>
            </div>
            
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-5f9750 gen-flex gen-sized">2</div>
                    <div><strong>Calculate Standard Deviation of X</strong></div>
                </div>
                <div class="s-78a84b">
                    <div>Mean X (overall) = ${meanX.toFixed(6)}</div>
                    <div>Σ(X - X̄)² = ${sumSqDiff.toFixed(6)}</div>
                    <div>s<sub>X</sub> = √(${sumSqDiff.toFixed(6)} / ${n}) = ${sdX.toFixed(6)}</div>
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-5f9750 gen-flex gen-sized">3</div>
                    <div><strong>Calculate Point-Biserial Correlation</strong></div>
                </div>
                <div class="s-78a84b">
                    <div>r<sub>pb</sub> = (M₁ - M₀) / s<sub>X</sub> × √[(n₁·n₀) / n²]</div>
                    <div>= ${(meanX1 - meanX0).toFixed(6)} / ${sdX.toFixed(6)} × √[(${n1} × ${n0}) / ${n}²]</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × √[${n1*n0} / ${n*n}]</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × √${(n1*n0/(n*n)).toFixed(6)}</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × ${Math.sqrt(n1*n0/(n*n)).toFixed(6)}</div>
                    <div class="s-e1f7cf">r<sub>pb</sub> = ${r_pb.toFixed(8)}</div>
                </div>
            </div>
        </div>
        
        <div class="s-6fb674 gen-pad">
            <h3 class="s-c7f0b4">📌 Interpretation</h3>
            <div><strong>Point-Biserial Correlation:</strong> r<sub>pb</sub> = ${r_pb.toFixed(6)}</div>
            <div><strong>Direction:</strong> ${r_pb > 0 ? 'Positive (higher X associated with Y=1)' : (r_pb < 0 ? 'Negative (higher X associated with Y=0)' : 'No association')}</div>
            <div><strong>Strength:</strong> ${Math.abs(r_pb) >= 0.7 ? 'Strong' : (Math.abs(r_pb) >= 0.5 ? 'Moderate' : (Math.abs(r_pb) >= 0.3 ? 'Weak' : 'Very Weak or No'))} relationship</div>
            <div class="s-8d2e44">
                💡 <strong>Practical Meaning:</strong> The point-biserial correlation is equivalent to the Pearson correlation when Y is binary (0/1). 
                It tells you how well the continuous variable can distinguish between the two binary groups.
            </div>
        </div>
    </div>`;
    
    return { r_pb, steps, n1, n0, meanX1, meanX0, sdX };
}

// ========== SETUP FUNCTIONS FOR NEW BUTTONS ==========
function setupPointBiserialLogic() {
    const computeBtn = document.getElementById("corrPointBiserialComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("pointBiserialXInput").value;
        const rawY = document.getElementById("pointBiserialYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("pointBiserialResultArea");
        const valueSpan = document.getElementById("pointBiserialValueDisplay");
        const stepsSpan = document.getElementById("pointBiserialStepsDisplay");
        
        // Validate binary values
        let valid = true;
        for (let val of yValues) {
            if (val !== 0 && val !== 1) {
                valid = false;
                break;
            }
        }
        if (!valid) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            hideAllStatCharts();
            setHtml(stepsSpan, "Binary variable must contain only 0 and 1 values.");
            return;
        }
        
        const result = computePointBiserialWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `r<sub>pb</sub> = ${result.r_pb.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showFitCharts("pointBiserialResultArea", xValues, yValues, { xName: "x", yName: "y" });
        }
    });
    
    attachClearHandler("pointBiserialClearBtn", ["pointBiserialXInput", "pointBiserialYInput"], "pointBiserialResultArea");
}

// ========== POINT-BISERIAL INTERFACE RENDER ==========
function renderPointBiserialInterface() {
    return buildInterface({
        id: "statPointBiserialInterface",
        title: "🎯 Point-Biserial Correlation (r<sub>pb</sub>)",
        formula: "📌 r<sub>pb</sub> = (M₁ - M₀)/s<sub>X</sub> × √[(n₁·n₀)/n²]",
        desc: "Measures correlation between a continuous variable and a true binary (0/1) variable. Equivalent to Pearson correlation for binary Y.",
        inputs: [
            {
                label: "📋 Enter Continuous Variable (X) values:",
                textarea: { id: "pointBiserialXInput", rows: "3", placeholder: "Example: 12, 15, 18, 22, 25, 28, 30" }
            },
            {
                label: "📋 Enter Binary Variable (Y) values (0 or 1 only):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "pointBiserialYInput", rows: "3", placeholder: "Example: 0, 1, 0, 1, 0, 1, 1" }
            }
        ],
        run: { id: "corrPointBiserialComputeBtn", text: "🎯 Calculate Point-Biserial + Steps" },
        clear: { id: "pointBiserialClearBtn", text: "Clear All" },
        result: {
            area: "pointBiserialResultArea",
            label: "🎯 POINT-BISERIAL CORRELATION RESULT",
            value: "pointBiserialValueDisplay",
            steps: "pointBiserialStepsDisplay"
        }
    });
}
