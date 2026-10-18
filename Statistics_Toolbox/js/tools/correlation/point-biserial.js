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
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <div style="background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🎯</span>
                <h2 style="margin: 0;">Point-Biserial Correlation (r<sub>pb</sub>)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: r<sub>pb</sub> = (M₁ - M₀)/s<sub>X</sub> × √[(n₁·n₀)/(n²)]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">Measures correlation between a continuous variable and a true binary variable (0/1).</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #6a1b9a;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #6a1b9a;">
                    <div style="font-size: 12px; color: #6c757d;">Total Pairs</div>
                    <div style="font-size: 28px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #28a745;">
                    <div style="font-size: 12px; color: #6c757d;">Group 1 (Y=1)</div>
                    <div style="font-size: 20px; font-weight: 600;">n₁ = ${n1}</div>
                    <div style="font-size: 13px;">Mean₁ = ${meanX1.toFixed(4)}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; border-left: 4px solid #dc3545;">
                    <div style="font-size: 12px; color: #6c757d;">Group 0 (Y=0)</div>
                    <div style="font-size: 20px; font-weight: 600;">n₀ = ${n0}</div>
                    <div style="font-size: 13px;">Mean₀ = ${meanX0.toFixed(4)}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #6a1b9a;">📋 Input Data</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #6a1b9a; color: white;">
                        <th style="padding: 10px;">i</th>
                        <th style="padding: 10px;">X (Continuous)</th>
                        <th style="padding: 10px;">Y (Binary 0/1)</th>
                    </tr>
                </thead>
                <tbody>`;
    for (let i = 0; i < n; i++) {
        steps += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${xContinuous[i]}</td>
            <td style="padding: 8px; text-align: center; font-weight: 600; color: ${yBinary[i] === 1 ? '#28a745' : '#dc3545'};">${yBinary[i]}</td>
        </tr>`;
    }
    steps += `</tbody>${"</table>"}</div>
        
        <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #6a1b9a;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">1</div>
                    <div><strong>Calculate Group Means</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div>M₁ = ΣX(Y=1) / n₁ = ${sumX1} / ${n1} = ${meanX1.toFixed(6)}</div>
                    <div>M₀ = ΣX(Y=0) / n₀ = ${sumX0} / ${n0} = ${meanX0.toFixed(6)}</div>
                    <div>M₁ - M₀ = ${(meanX1 - meanX0).toFixed(6)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">2</div>
                    <div><strong>Calculate Standard Deviation of X</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div>Mean X (overall) = ${meanX.toFixed(6)}</div>
                    <div>Σ(X - X̄)² = ${sumSqDiff.toFixed(6)}</div>
                    <div>s<sub>X</sub> = √(${sumSqDiff.toFixed(6)} / ${n}) = ${sdX.toFixed(6)}</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #6a1b9a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">3</div>
                    <div><strong>Calculate Point-Biserial Correlation</strong></div>
                </div>
                <div style="margin-left: 40px;">
                    <div>r<sub>pb</sub> = (M₁ - M₀) / s<sub>X</sub> × √[(n₁·n₀) / n²]</div>
                    <div>= ${(meanX1 - meanX0).toFixed(6)} / ${sdX.toFixed(6)} × √[(${n1} × ${n0}) / ${n}²]</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × √[${n1*n0} / ${n*n}]</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × √${(n1*n0/(n*n)).toFixed(6)}</div>
                    <div>= ${((meanX1 - meanX0)/sdX).toFixed(6)} × ${Math.sqrt(n1*n0/(n*n)).toFixed(6)}</div>
                    <div style="font-size: 20px; font-weight: 700; color: #6a1b9a; margin-top: 12px;">r<sub>pb</sub> = ${r_pb.toFixed(8)}</div>
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; background: #f3e5f5; border-left: 6px solid #6a1b9a;">
            <h3 style="margin: 0 0 12px 0;">📌 Interpretation</h3>
            <div><strong>Point-Biserial Correlation:</strong> r<sub>pb</sub> = ${r_pb.toFixed(6)}</div>
            <div><strong>Direction:</strong> ${r_pb > 0 ? 'Positive (higher X associated with Y=1)' : (r_pb < 0 ? 'Negative (higher X associated with Y=0)' : 'No association')}</div>
            <div><strong>Strength:</strong> ${Math.abs(r_pb) >= 0.7 ? 'Strong' : (Math.abs(r_pb) >= 0.5 ? 'Moderate' : (Math.abs(r_pb) >= 0.3 ? 'Weak' : 'Very Weak or No'))} relationship</div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px;">
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
