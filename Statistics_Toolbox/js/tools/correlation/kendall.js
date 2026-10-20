/* Kendall: kendall tool (render, compute, setup) */

// KENDALL'S TAU INTERFACE
function renderKendallInterface() {
    return buildInterface({
        id: "statKendallInterface",
        title: "🔗 Kendall's Tau (τ-b)",
        formula: "📌 τ-b = (C - D) / √[(n₀ - n₁)(n₀ - n₂)]",
        desc: "Measures ordinal association based on concordant vs discordant pairs. Range: -1 to +1. Ties in X or Y are handled with the τ-b correction (n₀ = n(n-1)/2; n₁, n₂ = pairs tied in X, Y); with no ties it equals τ-a = (C - D) / n₀.",
        inputs: [
            {
                label: "📋 Enter X values:",
                textarea: { id: "kendallXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8" }
            },
            {
                label: "📋 Enter Y values (same number of values):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "kendallYInput", rows: "3", placeholder: "Example: 1, 4, 9, 16, 25, 36, 49, 64" }
            }
        ],
        run: { id: "kendallComputeBtn", text: "🔗 Calculate Kendall's Tau + Steps" },
        clear: { id: "kendallClearBtn", text: "Clear All" },
        result: {
            area: "kendallResultArea",
            label: "🎯 KENDALL'S TAU RESULT",
            value: "kendallValueDisplay",
            steps: "kendallStepsDisplay"
        }
    });
}

// ========== KENDALL'S TAU - BEAUTIFUL VERSION ==========
// ========== KENDALL'S TAU - COMPLETELY FIXED WITH PROPER DATA DISPLAY ==========
function computeKendallWithSteps(xValues, yValues) {
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
    
    // Create pairs and sort by X
    let pairs = [];
    for (let i = 0; i < n; i++) {
        pairs.push({ 
            x: xValues[i], 
            y: yValues[i], 
            originalIndex: i 
        });
    }
    pairs.sort((a, b) => a.x - b.x);
    
    // Build sorted pairs table - FIXED: Properly display all data
    let sortedRows = '';
    for (let idx = 0; idx < pairs.length; idx++) {
        sortedRows += `<tr class="s-00049c">
            <td class="s-508417">${idx + 1}</td>
            <td class="s-00e121">${pairs[idx].x}</td>
            <td class="s-d6cb4a">${pairs[idx].y}</td>
        </tr>`;
    }
    
    // Calculate concordant and discordant pairs with detailed comparison
    let concordant = 0;
    let discordant = 0;
    let ties = 0;          // pairs tied in X, in Y, or in both (neither concordant nor discordant)
    let tiedX = 0;         // n1: pairs tied in X (includes pairs tied in both)
    let tiedY = 0;         // n2: pairs tied in Y (includes pairs tied in both)
    let comparisonRows = '';
    
    // Generate all pair comparisons
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
            const x1 = pairs[i].x, x2 = pairs[j].x;
            const y1 = pairs[i].y, y2 = pairs[j].y;
            let comparison = "";
            let result = "";
            let bgColor = "";
            
            if (x1 === x2 || y1 === y2) {
                ties++;
                if (x1 === x2) tiedX++;
                if (y1 === y2) tiedY++;
                comparison = x1 === x2 && y1 === y2 ? `X: ${x1} = ${x2}, Y: ${y1} = ${y2}` : (x1 === x2 ? `X: ${x1} = ${x2}` : `Y: ${y1} = ${y2}`);
                result = "○ TIE (neither C nor D)";
                bgColor = "#fff3cd";
            } else if (y1 < y2) {
                concordant++;
                comparison = `${y1} < ${y2}`;
                result = "✓ CONCORDANT (+)";
                bgColor = "#d4edda";
            } else {
                discordant++;
                comparison = `${y1} > ${y2}`;
                result = "✗ DISCORDANT (-)";
                bgColor = "#f8d7da";
            }
            
            comparisonRows += `<tr style="background: ${bgColor}; border-bottom: 1px solid #dee2e6;">
                <td class="s-69abdc">(${i+1}, ${j+1})</td>
                <td class="s-870828">${pairs[i].y}</td>
                <td class="s-870828">${pairs[j].y}</td>
                <td class="s-870828">${comparison}</td>
                <td class="s-f1645f">${result}</td>
            </tr>`;
        }
    }
    
    let totalPairs = (n * (n - 1)) / 2;
    const denominator = Math.sqrt((totalPairs - tiedX) * (totalPairs - tiedY));
    if (denominator === 0) {
        return { error: true, message: "Kendall's τ is undefined: all X values are identical or all Y values are identical." };
    }
    // tau-b: reduces to tau-a, (C - D) / [n(n-1)/2], when there are no ties
    let tau = (concordant - discordant) / denominator;
    
    // Build the complete HTML
    let steps = `<div class="s-3c49f1">
        <!-- Header Section -->
        <div class="s-771f9b gen-pad">
            <div class="s-94fb6b gen-flex">
                <span class="s-1f18a8 gen-big">🔗</span>
                <h2 class="s-66423b">Kendall's Tau (τ-b)</h2>
            </div>
            <p class="s-3d1a65">Formula (τ-b): τ = (C - D) / √[(n₀ - n₁)(n₀ - n₂)], where n₀ = n(n-1)/2; with no ties this is τ-a = (C - D) / n₀</p>
            <p class="s-1eab71">Measures ordinal association | Based on concordant vs discordant pairs | Range: -1 to +1</p>
        </div>
        
        <!-- Original Data -->
        <div class="s-d9cff0 gen-pad">
            <h3 class="s-6341db gen-flex"><span>📋</span> Original Data</h3>
            <div class="s-5646ce gen-grid">
                ${xValues.map((x, i) => `<div class="s-895d36">(${x}, ${yValues[i]})</div>`).join('')}
            </div>
        </div>
        
        <!-- Data Summary Grid -->
        <div class="s-d9cff0 gen-pad">
            <h3 class="s-6341db gen-flex"><span>📊</span> Data Summary</h3>
            <div class="s-0ad64d gen-grid">
                <div class="s-d588e7">
                    <div class="s-42da0a">Number of Pairs (n)</div>
                    <div class="s-90b61e">${n}</div>
                </div>
                <div class="s-446f0e">
                    <div class="s-42da0a">Total Possible Pairs</div>
                    <div class="s-17070e">${totalPairs}</div>
                    <div class="s-033765">= ${n} × (${n}-1) / 2</div>
                </div>
            </div>
        </div>
        
        <!-- Step 1: Sorted Pairs Table -->
        <div class="s-8b4bbf">
            <h3 class="s-24b135 gen-flex">
                <span>📋</span> Step 1: Sort Pairs by X Value (Ascending)
            </h3>
            <table class="s-35b3d7 gen-sized">
                <thead>
                    <tr class="s-64f09f">
                        <th class="s-1fc75b gen-sized">Position</th>
                        <th class="s-1fc75b gen-sized">X Value</th>
                        <th class="s-1fc75b gen-sized">Y Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedRows}
                </tbody>
            </table>
            <div class="s-f1cda2">
                💡 <strong>Note:</strong> Pairs are now sorted by X in ascending order. Next, we compare Y values of each pair with all subsequent pairs.
            </div>
        </div>
        
        <!-- Step 2: Pair Comparisons Table -->
        <div class="s-8b4bbf">
            <h3 class="s-24b135 gen-flex">
                <span>🔍</span> Step 2: Compare Each Pair with Subsequent Pairs
            </h3>
            <div class="s-317679">
                <table class="s-306b2c gen-sized">
                    <thead>
                        <tr class="s-a2089f">
                            <th class="s-edae3d">Pair (i, j)</th>
                            <th class="s-edae3d">Yᵢ (from pair i)</th>
                            <th class="s-edae3d">Yⱼ (from pair j)</th>
                            <th class="s-edae3d">Comparison</th>
                            <th class="s-edae3d">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisonRows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 3: Count Concordant and Discordant -->
        <div class="s-a7e73c gen-pad">
            <h3 class="s-6341db gen-flex">
                <span>📊</span> Step 3: Count Concordant and Discordant Pairs
            </h3>
            <div class="s-70a180 gen-grid gen-grid-many">
                <div class="s-1087ae">
                    <div class="s-380fb2 gen-big">✓</div>
                    <div class="s-1cf2e4">Concordant Pairs (C)</div>
                    <div class="s-d17747 gen-big">${concordant}</div>
                    <div class="s-033765">When Yᵢ &lt; Yⱼ (X values differ)</div>
                </div>
                <div class="s-1087ae">
                    <div class="s-380fb2 gen-big">✗</div>
                    <div class="s-1cf2e4">Discordant Pairs (D)</div>
                    <div class="s-3406f7 gen-big">${discordant}</div>
                    <div class="s-033765">When Yᵢ &gt; Yⱼ (X values differ)</div>
                </div>
                <div class="s-1087ae">
                    <div class="s-380fb2 gen-big">○</div>
                    <div class="s-1cf2e4">Tied pairs (neither C nor D)</div>
                    <div class="s-c91dd2 gen-big">${ties}</div>
                    <div class="s-033765">Tied in X and/or Y</div>
                </div>
            </div>
            
            <div class="s-6025fc">
                <div class="s-578789 gen-flex">
                    <div class="s-931f71 gen-flex gen-sized">1</div>
                    <div><strong>Calculate C - D (Difference)</strong></div>
                </div>
                <div class="s-ee07ad">
                    C - D = ${concordant} - ${discordant} = <strong class="s-59b4e5">${concordant - discordant}</strong>
                </div>
            </div>
        </div>
        
        <!-- Step 4: Final Calculation -->
        <div class="s-272f59 gen-pad">
            <h3 class="s-6341db gen-flex">
                <span>🔢</span> Step 4: Calculate Kendall's Tau
            </h3>
            <div class="s-6fab3a gen-pad">
                <div class="s-168eee">
                    τ-b = (C - D) / √[(n₀ - n₁)(n₀ - n₂)]
                </div>
                <div class="s-168eee">
                    n₀ = ${totalPairs}, n₁ (pairs tied in X) = ${tiedX}, n₂ (pairs tied in Y) = ${tiedY}
                </div>
                <div class="s-168eee">
                    τ-b = (${concordant} - ${discordant}) / √[(${totalPairs} - ${tiedX})(${totalPairs} - ${tiedY})] = ${concordant - discordant} / ${denominator.toFixed(6)}
                </div>
                <div class="s-711efd gen-pad">
                    τ = ${tau.toFixed(8)}
                </div>
            </div>
        </div>
        
        <!-- Interpretation Section -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(tau) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(tau) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 class="s-b140c2 gen-flex"><span>📌</span> Interpretation</h3>
            <div class="s-45b8b7">
                <div><strong>Kendall's τ:</strong> ${tau.toFixed(6)} → <strong style="color: ${tau > 0 ? '#28a745' : '#dc3545'};">${tau > 0 ? 'Positive' : 'Negative'}</strong> ordinal association</div>
                <div><strong>Strength:</strong> ${Math.abs(tau) >= 0.7 ? '🔥 Strong' : (Math.abs(tau) >= 0.5 ? '📊 Moderate' : (Math.abs(tau) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No'))} association</div>
                <div><strong>Agreement Rate:</strong> ${((concordant / totalPairs) * 100).toFixed(1)}% of pairs are concordant</div>
                <div><strong>Disagreement Rate:</strong> ${((discordant / totalPairs) * 100).toFixed(1)}% of pairs are discordant</div>
                <div class="s-0d79c9">
                    💡 <strong>Practical Meaning:</strong> ${tau > 0 ? 'A positive τ indicates that larger X values tend to be associated with larger Y values (monotonic increasing relationship).' : (tau < 0 ? 'A negative τ indicates that larger X values tend to be associated with smaller Y values (monotonic decreasing relationship).' : 'A τ near 0 indicates no monotonic association between X and Y.')}
                </div>
            </div>
        </div>
    </div>`;
    
    return { tau, steps, concordant, discordant, ties, totalPairs };
}

function setupKendallLogic() {
    const computeBtn = document.getElementById("kendallComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("kendallXInput").value;
        const rawY = document.getElementById("kendallYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const resultDiv = document.getElementById("kendallResultArea");
        const valueSpan = document.getElementById("kendallValueDisplay");
        const stepsSpan = document.getElementById("kendallStepsDisplay");
        
        const result = computeKendallWithSteps(xValues, yValues);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideAllStatCharts();
            setHtml(stepsSpan, result.message);  // Changed to innerHTML
        } else {
            setHtml(valueSpan, `τ-b = ${result.tau.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);
            showFitCharts("kendallResultArea", xValues, yValues, { xName: "x", yName: "y" });  // Changed to innerHTML
        }
    });
    
    attachClearHandler("kendallClearBtn", ["kendallXInput", "kendallYInput"], "kendallResultArea");
}
