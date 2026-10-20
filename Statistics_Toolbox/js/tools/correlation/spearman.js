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
        tableRows += `<tr class="s-00049c">
            <td class="s-508417">${d.i}</td>
            <td class="s-dd18f4">${d.x}</td>
            <td class="s-dd18f4">${d.y}</td>
            <td class="s-00e121">${d.rankX}</td>
            <td class="s-00e121">${d.rankY}</td>
            <td class="s-75a312">${d.d}</td>
            <td class="s-3f21e0">${d.dSq}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-3c49f1">
        <div class="s-97b34b gen-pad">
            <div class="s-94fb6b gen-flex">
                <span class="s-1f18a8 gen-big">📈</span>
                <h2 class="s-66423b">Spearman's Rank Correlation (ρ)</h2>
            </div>
            <p class="s-259079">Formula: ρ = 1 - [6 × Σdᵢ²] / [n(n² - 1)]</p>
            <p class="s-1eab71">Non-parametric | Measures monotonic association | Robust against outliers</p>
        </div>
        
        <div class="s-d9cff0 gen-pad">
            <h3 class="s-842655"><span>📊</span> Data Summary</h3>
            <div class="s-0ad64d gen-grid">
                <div class="s-2b3ed5">
                    <div class="s-42da0a">Number of Pairs</div>
                    <div class="s-fad2be">${n}</div>
                </div>
                <div class="s-446f0e">
                    <div class="s-42da0a">Σd² (Sum of squared differences)</div>
                    <div class="s-0f4638">${sumDSquared}</div>
                </div>
            </div>
        </div>
        
        <div class="s-8b4bbf">
            <h3 class="s-fc608a"><span>📋</span> Rank Assignment & Differences</h3>
            <table class="s-306b2c gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-b5a9ed">i</th>
                        <th class="s-b5a9ed">Xᵢ</th>
                        <th class="s-b5a9ed">Yᵢ</th>
                        <th class="s-b5a9ed">Rank(Xᵢ)</th>
                        <th class="s-b5a9ed">Rank(Yᵢ)</th>
                        <th class="s-b5a9ed">d = R(X)-R(Y)</th>
                        <th class="s-b5a9ed">d²</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="s-767496">
                        <td class="s-e629ee" colspan="6">Σd² →</td>
                        <td class="s-b19ffa">${sumDSquared}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-842655"><span>🔢</span> Step-by-Step Calculation</h3>
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-918893 gen-flex gen-sized">1</div>
                    <div><strong>Sum of squared rank differences</strong></div>
                </div>
                <div class="s-f55593">Σd² = ${sumDSquared}</div>
            </div>
            <div class="s-ca9e5c">
                <div class="s-94fb6b gen-flex">
                    <div class="s-918893 gen-flex gen-sized">2</div>
                    <div><strong>Calculate denominator</strong></div>
                </div>
                <div class="s-f55593">n(n² - 1) = ${n} × (${n}² - 1) = ${n} × ${n*n - 1} = ${n * (n*n - 1)}</div>
            </div>
            <div class="s-6025fc">
                <div class="s-94fb6b gen-flex">
                    <div class="s-918893 gen-flex gen-sized">3</div>
                    <div><strong>Calculate Spearman's ρ</strong></div>
                </div>
                <div class="s-a17211">
                    ${hasTies ? `Ties present → ρ = Pearson correlation of the ranks = Σ(Rx - R̄)(Ry - R̄) / √[Σ(Rx - R̄)² × Σ(Ry - R̄)²] = ${sRxRy} / √(${sRxRx} × ${sRyRy}) = ${rho.toFixed(8)}` : `ρ = 1 - [6 × ${sumDSquared}] / ${n * (n*n - 1)} = ${rho.toFixed(8)}`}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(rho) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(rho) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 class="s-3c2890"><span>📌</span> Interpretation</h3>
            <div><strong>Spearman's ρ:</strong> ${rho.toFixed(6)} → <strong style="color: ${rho > 0 ? '#28a745' : '#dc3545'};">${rho > 0 ? 'Positive' : 'Negative'}</strong> monotonic association</div>
            <div><strong>Strength:</strong> ${Math.abs(rho) >= 0.9 ? '🔥 Very Strong' : (Math.abs(rho) >= 0.7 ? '✅ Strong' : (Math.abs(rho) >= 0.5 ? '📊 Moderate' : (Math.abs(rho) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No')))} monotonic relationship</div>
            <div class="s-0d79c9">
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
            hideAllStatCharts();
            setHtml(stepsSpan, result.message);  // Changed to innerHTML
        } else {
            setHtml(valueSpan, `ρ = ${result.rho.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showFitCharts("spearmanResultArea", xValues, yValues, { xName: "x", yName: "y" });
            showScatterCard("spearmanResultArea", "extra", "Ranks: Spearman works on these", "Spearman correlation is the Pearson correlation of the RANKS. A monotone relationship (always rising or always falling, even if curved) puts the rank points on a straight line.", { title: "Rank of y against rank of x", xLabel: "Rank of x", yLabel: "Rank of y", x: result.rankX, y: result.rankY, line: (r => r ? { slope: r.slope, intercept: r.intercept, label: "Least-squares line through the ranks" } : null)(simpleRegressionCore(result.rankX, result.rankY)), description: "Scatter plot of the ranks of the paired values." });  // Changed to innerHTML
        }
    });
    
    attachClearHandler("spearmanClearBtn", ["spearmanXInput", "spearmanYInput"], "spearmanResultArea");
}
