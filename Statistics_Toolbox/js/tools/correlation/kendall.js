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
        sortedRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px 8px; text-align: center; font-weight: 500;">${idx + 1}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 500; color: #1a5490;">${pairs[idx].x}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight: 500; color: #2d6a4f;">${pairs[idx].y}</td>
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
                <td style="padding: 8px 8px; text-align: center;">(${i+1}, ${j+1})</td>
                <td style="padding: 8px 8px; text-align: center; font-weight: 500;">${pairs[i].y}</td>
                <td style="padding: 8px 8px; text-align: center; font-weight: 500;">${pairs[j].y}</td>
                <td style="padding: 8px 8px; text-align: center; font-weight: 500;">${comparison}</td>
                <td style="padding: 8px 8px; text-align: center; font-weight: 600;">${result}</td>
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
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 100%;">
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 32px;">🔗</span>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Kendall's Tau (τ-b)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Formula (τ-b): τ = (C - D) / √[(n₀ - n₁)(n₀ - n₂)], where n₀ = n(n-1)/2; with no ties this is τ-a = (C - D) / n₀</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75; font-size: 13px;">Measures ordinal association | Based on concordant vs discordant pairs | Range: -1 to +1</p>
        </div>
        
        <!-- Original Data -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #2d6a4f; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📋</span> Original Data</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; max-height: 150px; overflow-y: auto; padding: 8px;">
                ${xValues.map((x, i) => `<div style="background: white; padding: 6px 12px; border-radius: 8px; text-align: center;">(${x}, ${yValues[i]})</div>`).join('')}
            </div>
        </div>
        
        <!-- Data Summary Grid -->
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 16px 0; color: #2d6a4f; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📊</span> Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #2d6a4f;">
                    <div style="font-size: 12px; color: #6c757d;">Number of Pairs (n)</div>
                    <div style="font-size: 28px; font-weight: 700; color: #2d6a4f;">${n}</div>
                </div>
                <div style="background: white; padding: 12px 16px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                    <div style="font-size: 12px; color: #6c757d;">Total Possible Pairs</div>
                    <div style="font-size: 22px; font-weight: 600;">${totalPairs}</div>
                    <div style="font-size: 11px; color: #6c757d;">= ${n} × (${n}-1) / 2</div>
                </div>
            </div>
        </div>
        
        <!-- Step 1: Sorted Pairs Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #2d6a4f; color: #2d6a4f; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <span>📋</span> Step 1: Sort Pairs by X Value (Ascending)
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #2d6a4f; color: white;">
                        <th style="padding: 12px 8px; text-align: center; width: 33%;">Position</th>
                        <th style="padding: 12px 8px; text-align: center; width: 33%;">X Value</th>
                        <th style="padding: 12px 8px; text-align: center; width: 33%;">Y Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedRows}
                </tbody>
            </table>
            <div style="padding: 12px 20px; background: #f8f9fa; font-size: 13px; color: #555; border-top: 1px solid #e9ecef;">
                💡 <strong>Note:</strong> Pairs are now sorted by X in ascending order. Next, we compare Y values of each pair with all subsequent pairs.
            </div>
        </div>
        
        <!-- Step 2: Pair Comparisons Table -->
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e9ecef; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #2d6a4f; color: #2d6a4f; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <span>🔍</span> Step 2: Compare Each Pair with Subsequent Pairs
            </h3>
            <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #2d6a4f; color: white; position: sticky; top: 0;">
                            <th style="padding: 10px 8px; text-align: center;">Pair (i, j)</th>
                            <th style="padding: 10px 8px; text-align: center;">Yᵢ (from pair i)</th>
                            <th style="padding: 10px 8px; text-align: center;">Yⱼ (from pair j)</th>
                            <th style="padding: 10px 8px; text-align: center;">Comparison</th>
                            <th style="padding: 10px 8px; text-align: center;">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${comparisonRows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Step 3: Count Concordant and Discordant -->
        <div style="background: linear-gradient(135deg, #e8f4e8 0%, #d4e8d4 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #2d6a4f; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                <span>📊</span> Step 3: Count Concordant and Discordant Pairs
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 36px;">✓</div>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Concordant Pairs (C)</div>
                    <div style="font-size: 32px; font-weight: 700; color: #28a745;">${concordant}</div>
                    <div style="font-size: 11px; color: #6c757d;">When Yᵢ &lt; Yⱼ (X values differ)</div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 36px;">✗</div>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Discordant Pairs (D)</div>
                    <div style="font-size: 32px; font-weight: 700; color: #dc3545;">${discordant}</div>
                    <div style="font-size: 11px; color: #6c757d;">When Yᵢ &gt; Yⱼ (X values differ)</div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 36px;">○</div>
                    <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Tied pairs (neither C nor D)</div>
                    <div style="font-size: 32px; font-weight: 700; color: #ffc107;">${ties}</div>
                    <div style="font-size: 11px; color: #6c757d;">Tied in X and/or Y</div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #2d6a4f; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">1</div>
                    <div><strong>Calculate C - D (Difference)</strong></div>
                </div>
                <div style="margin-left: 40px; font-family: monospace; font-size: 18px; font-weight: 600;">
                    C - D = ${concordant} - ${discordant} = <strong style="color: #2d6a4f;">${concordant - discordant}</strong>
                </div>
            </div>
        </div>
        
        <!-- Step 4: Final Calculation -->
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #2d6a4f; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                <span>🔢</span> Step 4: Calculate Kendall's Tau
            </h3>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">
                    τ-b = (C - D) / √[(n₀ - n₁)(n₀ - n₂)]
                </div>
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">
                    n₀ = ${totalPairs}, n₁ (pairs tied in X) = ${tiedX}, n₂ (pairs tied in Y) = ${tiedY}
                </div>
                <div style="font-family: monospace; font-size: 16px; margin-bottom: 12px;">
                    τ-b = (${concordant} - ${discordant}) / √[(${totalPairs} - ${tiedX})(${totalPairs} - ${tiedY})] = ${concordant - discordant} / ${denominator.toFixed(6)}
                </div>
                <div style="font-family: monospace; font-size: 28px; font-weight: 700; color: #2d6a4f; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; margin-top: 12px;">
                    τ = ${tau.toFixed(8)}
                </div>
            </div>
        </div>
        
        <!-- Interpretation Section -->
        <div style="border-radius: 16px; padding: 20px; ${Math.abs(tau) >= 0.7 ? 'background: #d4edda; border-left: 6px solid #28a745;' : (Math.abs(tau) >= 0.3 ? 'background: #fff3cd; border-left: 6px solid #ffc107;' : 'background: #f8d7da; border-left: 6px solid #dc3545;')}">
            <h3 style="margin: 0 0 12px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;"><span>📌</span> Interpretation</h3>
            <div style="display: grid; gap: 10px;">
                <div><strong>Kendall's τ:</strong> ${tau.toFixed(6)} → <strong style="color: ${tau > 0 ? '#28a745' : '#dc3545'};">${tau > 0 ? 'Positive' : 'Negative'}</strong> ordinal association</div>
                <div><strong>Strength:</strong> ${Math.abs(tau) >= 0.7 ? '🔥 Strong' : (Math.abs(tau) >= 0.5 ? '📊 Moderate' : (Math.abs(tau) >= 0.3 ? '⚠️ Weak' : '💨 Very Weak or No'))} association</div>
                <div><strong>Agreement Rate:</strong> ${((concordant / totalPairs) * 100).toFixed(1)}% of pairs are concordant</div>
                <div><strong>Disagreement Rate:</strong> ${((discordant / totalPairs) * 100).toFixed(1)}% of pairs are discordant</div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 13px; color: #555;">
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
            setHtml(stepsSpan, result.message);  // Changed to innerHTML
        } else {
            setHtml(valueSpan, `τ-b = ${result.tau.toFixed(6)}`);
            setHtml(stepsSpan, result.steps);  // Changed to innerHTML
        }
    });
    
    attachClearHandler("kendallClearBtn", ["kendallXInput", "kendallYInput"], "kendallResultArea");
}
