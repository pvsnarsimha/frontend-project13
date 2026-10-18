/* Spearman: spearman tool (render, compute, setup) */

// SPEARMAN'S RANK CORRELATION INTERFACE
function renderSpearmanInterface() {
    return buildInterface({
        id: "statSpearmanInterface",
        title: "📈 Spearman's Rank Correlation (ρ)",
        formula: "📌 ρ = 1 - [6 × Σdᵢ²] / [n(n² - 1)]",
        desc: "Non-parametric measure of monotonic association. Works with ranks, handles outliers well.",
        inputs: [
            {
                label: "📋 Enter X values:",
                textarea: { id: "spearmanXInput", rows: "3", placeholder: "Example: 10, 20, 30, 40, 50, 60, 70, 80" }
            },
            {
                label: "📋 Enter Y values (same number of values):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "spearmanYInput", rows: "3", placeholder: "Example: 15, 25, 35, 45, 55, 65, 75, 85" }
            }
        ],
        run: { id: "spearmanComputeBtn", text: "📈 Calculate Spearman's ρ + Steps" },
        clear: { id: "spearmanClearBtn", text: "Clear All" },
        result: {
            area: "spearmanResultArea",
            label: "🎯 SPEARMAN'S RANK CORRELATION RESULT",
            value: "spearmanValueDisplay",
            steps: "spearmanStepsDisplay"
        }
    });
}

// ========== SPEARMAN'S RANK - BEAUTIFUL VERSION ==========
function computeSpearmanWithSteps(xValues, yValues) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: `X and Y must have the same number of values.` };
    }
    if (xValues.length < 3) {
        return { error: true, message: "Need at least 3 pairs for meaningful correlation." };
    }
    
    const n = xValues.length;
    
    function assignRanks(arr) {
        let indexed = arr.map((val, idx) => ({ val, idx }));
        indexed.sort((a, b) => a.val - b.val);
        let ranks = new Array(n);
        let i = 0;
        while (i < n) {
            let j = i;
            while (j < n && indexed[j].val === indexed[i].val) j++;
            let avgRank = (i + 1 + j) / 2;
            for (let k = i; k < j; k++) {
                ranks[indexed[k].idx] = avgRank;
            }
            i = j;
        }
        return ranks;
    }
    
    let rankX = assignRanks(xValues);
    let rankY = assignRanks(yValues);
    
    let rankData = [];
    let sumDSquared = 0;
    
    for (let i = 0; i < n; i++) {
        let d = rankX[i] - rankY[i];
        let dSq = d * d;
        sumDSquared += dSq;
        rankData.push({
            i: i+1,
            x: xValues[i],
            y: yValues[i],
            rankX: rankX[i],
            rankY: rankY[i],
            d: d,
            dSq: dSq
        });
    }
    
    // With ties the shortcut 1 - 6Σd²/(n(n²-1)) is wrong; ρ is the Pearson correlation of the (average) ranks,
    // which equals the shortcut when there are no ties.
    const hasTies = new Set(rankX).size < n || new Set(rankY).size < n;
    const meanRank = (n + 1) / 2;
    let sRxRy = 0, sRxRx = 0, sRyRy = 0;
    for (let i = 0; i < n; i++) {
        sRxRy += (rankX[i] - meanRank) * (rankY[i] - meanRank);
        sRxRx += (rankX[i] - meanRank) * (rankX[i] - meanRank);
        sRyRy += (rankY[i] - meanRank) * (rankY[i] - meanRank);
    }
    if (sRxRx === 0 || sRyRy === 0) {
        return { error: true, message: `Spearman's ρ is undefined: all ${sRxRx === 0 ? 'X' : 'Y'} values are identical (zero variance).` };
    }
    const rho = sRxRy / Math.sqrt(sRxRx * sRyRy);
    
    let tableRows = '';
    for (let d of rankData) {
        tableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px 8px; text-align: center; font-weight: 500;">${d.i}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.x}</td>
            <td style="padding: 10px 8px; text-align: center;">${d.y}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 500; color: #1a5490;">${d.rankX}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 500; color: #1a5490;">${d.rankY}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 600;">${d.d}</td>
            <td style="padding: 10px 8px; text-align: center; background: #e8f4f8; font-weight: 600; color: #1a5490;">${d.dSq}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">📈</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Spearman's Rank Correlation (ρ)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Formula: ρ = 1 - [6 × Σdᵢ²] / [n(n² - 1)]</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75; font-size: 13px;">Non-parametric | Measures monotonic association | Robust against outliers</p>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; font-size: 18px;"><span>📊</span> Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #1a5490;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Pairs</div>
                    <div style="font-size: 24px; font-weight: 700; color: #1a5490;">${n}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Σd² (Sum of squared differences)</div>
                    <div style="font-size: 20px; font-weight: 600;">${sumDSquared}</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490; font-size: 16px;"><span>📋</span> Rank Assignment & Differences</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 12px 8px; text-align: center;">i</th>
                        <th style="padding: 12px 8px; text-align: center;">Xᵢ</th>
                        <th style="padding: 12px 8px; text-align: center;">Yᵢ</th>
                        <th style="padding: 12px 8px; text-align: center;">Rank(Xᵢ)</th>
                        <th style="padding: 12px 8px; text-align: center;">Rank(Yᵢ)</th>
                        <th style="padding: 12px 8px; text-align: center;">d = R(X)-R(Y)</th>
                        <th style="padding: 12px 8px; text-align: center;">d²</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="background: #e9ecef; font-weight: 700;">
                        <td colspan="6" style="padding: 12px 8px; text-align: right;">Σd² →</td>
                        <td style="padding: 12px 8px; text-align: center; background: #e8f4f8; color: #1a5490;">${sumDSquared}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490; font-size: 18px;"><span>🔢</span> Step-by-Step Calculation</h3>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</div>
                    <div><strong>Sum of squared rank differences</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">Σd² = ${sumDSquared}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">2</div>
                    <div><strong>Calculate denominator</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace;">n(n² - 1) = ${n} × (${n}² - 1) = ${n} × ${n*n - 1} = ${n * (n*n - 1)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="background: #1a5490; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">3</div>
                    <div><strong>Calculate Spearman's ρ</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 16px; font-weight: 700; color: #1a5490;">
                    ${hasTies ? `Ties present → ρ = Pearson correlation of the ranks = Σ(Rx - R̄)(Ry - R̄) / √[Σ(Rx - R̄)² × Σ(Ry - R̄)²] = ${sRxRy} / √(${sRxRx} × ${sRyRy}) = ${rho.toFixed(8)}` : `ρ = 1 - [6 × ${sumDSquared}] / ${n * (n*n - 1)} = ${rho.toFixed(8)}`}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(rho) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(rho) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 style="margin: 0 0 12px 0; font-size: 18px;"><span>📌</span> Interpretation</h3>
            <div><strong>Spearman's ρ:</strong> ${rho.toFixed(6)} → <strong style="color: ${rho > 0 ? '#28a745' : '#dc3545'};">${rho > 0 ? 'Positive' : 'Negative'}</strong> monotonic association</div>
            <div><strong>Strength:</strong> ${Math.abs(rho) >= 0.9 ? '🔥 Very Strong' : (Math.abs(rho) >= 0.7 ? '✅ Strong' : (Math.abs(rho) >= 0.5 ? '📊 Moderate' : (Math.abs(rho) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No')))} monotonic relationship</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px; color: #555;">
                💡 <strong>Practical Meaning:</strong> Spearman's ρ measures whether as X increases, Y tends to increase (positive) or decrease (negative) consistently, even if not perfectly linear.
            </div>
        </div>
    </div>`;
    
    return { rho, steps, sumDSquared, rankX, rankY };
}

function setupSpearmanLogic() {
    const computeBtn = document.getElementById("spearmanComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("spearmanXInput").value;
        const rawY = document.getElementById("spearmanYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("spearmanResultArea");
        const valueSpan = document.getElementById("spearmanValueDisplay");
        const stepsSpan = document.getElementById("spearmanStepsDisplay");
        
        const result = computeSpearmanWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);  // Changed to innerHTML
        } else {
            setHtml(valueSpan, `ρ = ${result.rho.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);  // Changed to innerHTML
        }
    });
    
    attachClearHandler("spearmanClearBtn", ["spearmanXInput", "spearmanYInput"], "spearmanResultArea");
}
