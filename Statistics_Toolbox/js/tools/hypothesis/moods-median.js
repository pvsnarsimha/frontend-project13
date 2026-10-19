/* MoodsMedian: moodsmedian tool (render, compute, setup) */

// ========== MOOD'S MEDIAN TEST INTERFACE ==========
function renderMoodsMedianInterface() {
    return buildInterface({
        id: "statMoodsMedianInterface",
        title: "📊 Mood's Median Test",
        formula: "📌 χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ",
        desc: "<strong>What is Mood's Median Test?</strong><br>\n                    A non-parametric test to compare medians of two or more groups.\n                    Tests whether samples come from populations with the same median.\n                    <br><br>\n                    <strong>H₀:</strong> All group medians are equal<br>\n                    <strong>H₁:</strong> At least one group median differs",
        inputs: [
            {
                label: "📋 Enter data with group labels (format: value:group):",
                textarea: {
                    id: "moodsData",
                    rows: "5",
                    placeholder: "Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"
                }
            },
            {
                hint: "<strong>Format:</strong> value:group (comma or space separated)",
                hintAttrs: { style: HINT_STYLE }
            },
            {
                label: "📊 Significance Level (α):",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "moodsAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS_2
            }
        ],
        run: { id: "moodsComputeBtn", text: "📊 Run Mood's Median Test + Full Steps" },
        clear: { id: "moodsClearBtn", text: "Clear" },
        result: {
            area: "moodsResultArea",
            label: "🎯 MOOD'S MEDIAN TEST RESULTS",
            value: "moodsValueDisplay",
            steps: "moodsStepsDisplay"
        }
    });
}

// ========== MOOD'S MEDIAN TEST COMPUTATION ==========
function computeMoodsMedianTest(inputText, alpha) {
    const parsed = parseValueGroupInput(inputText);
    const groups = parsed.groups;
    if (parsed.skipped.length) {
        return { error: true, message: `Could not read: ${parsed.skipped.slice(0, 5).map(x => escapeHtml(x)).join(', ')}${parsed.skipped.length > 5 ? ', …' : ''}. Each entry must look like value:group (for example 12.5:Control).` };
    }
    
    if (groups.size < 2) {
        return { error: true, message: "Need at least 2 groups for Mood's Median test." };
    }
    
    // Collect all values to find overall median
    let allValues = [];
    let groupSizes = new Map();
    
    for (let [group, values] of groups) {
        allValues.push(...values);
        groupSizes.set(group, values.length);
    }
    
    allValues.sort((a, b) => a - b);
    const n = allValues.length;
    let overallMedian;
    if (n % 2 === 0) {
        overallMedian = (allValues[n/2 - 1] + allValues[n/2]) / 2;
    } else {
        overallMedian = allValues[Math.floor(n/2)];
    }
    
    // Create 2×k contingency table (Above/Below Median × Groups)
    let aboveCount = new Map();
    let belowCount = new Map();
    let totalAbove = 0;
    let totalBelow = 0;
    let groupTotals = new Map();
    
    for (let [group, values] of groups) {
        let above = 0;
        let below = 0;
        for (let val of values) {
            if (val > overallMedian) above++;
            else if (val < overallMedian) below++;
            // Values equal to median are ignored (excluded from analysis)
        }
        aboveCount.set(group, above);
        belowCount.set(group, below);
        groupTotals.set(group, above + below);
        totalAbove += above;
        totalBelow += below;
    }
    
    // Values exactly equal to the overall median are in neither count; say how many there were
    const totalValues = [...groups.values()].reduce((sum, v) => sum + v.length, 0);
    const excluded = totalValues - totalAbove - totalBelow;
    
    // Check if we have enough data
    if (totalAbove === 0 || totalBelow === 0) {
        return { error: true, message: "All values are on one side of the median. Cannot perform test." };
    }
    
    const k = groups.size;
    let chiSquare = 0;
    let contributions = [];
    
    for (let [group, n_j] of groupTotals) {
        const above = aboveCount.get(group);
        const below = belowCount.get(group);
        
        // Expected frequencies under H₀
        const expectedAbove = (totalAbove * n_j) / (totalAbove + totalBelow);
        const expectedBelow = (totalBelow * n_j) / (totalAbove + totalBelow);
        
        const contribAbove = expectedAbove > 0 ? Math.pow(above - expectedAbove, 2) / expectedAbove : 0;
        const contribBelow = expectedBelow > 0 ? Math.pow(below - expectedBelow, 2) / expectedBelow : 0;
        
        chiSquare += contribAbove + contribBelow;
        contributions.push({
            group: group,
            n: n_j,
            above: above,
            below: below,
            expectedAbove: expectedAbove,
            expectedBelow: expectedBelow,
            contribAbove: contribAbove,
            contribBelow: contribBelow
        });
    }
    
    const df = k - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(chiSquare, df);
    const rejectH0 = chiSquare > criticalValue;
    
    // Build contingency table
    let contingencyRows = '';
    for (let c of contributions) {
        contingencyRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 10px; font-weight: bold;">${c.group}</td>
            <td style="padding: 10px; text-align: center;">${c.n}</td>
            <td style="padding: 10px; text-align: center; background: #e8f4f8;">${c.above} (exp: ${c.expectedAbove.toFixed(2)})</td>
            <td style="padding: 10px; text-align: center; background: #f8f9fa;">${c.below} (exp: ${c.expectedBelow.toFixed(2)})</td>
            <td style="padding: 10px; text-align: center;">${c.contribAbove.toFixed(4)} + ${c.contribBelow.toFixed(4)} = ${(c.contribAbove + c.contribBelow).toFixed(4)}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📊</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">Mood's Median Test</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Non-parametric test for comparing medians across groups</p>
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Understanding Mood's Median Test</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p><strong>What it does:</strong> Tests whether multiple groups have the same median.</p>
                <p><strong>How it works:</strong></p>
                <ol>
                    <li>Calculate the overall median of all data combined</li>
                    <li>For each group, count how many values are ABOVE and BELOW the overall median</li>
                    <li>Create a 2×k contingency table (Above/Below × Groups)</li>
                    <li>Perform a chi-square test of independence</li>
                </ol>
                <p><strong>Key advantage:</strong> Robust against outliers and doesn't assume normality.</p>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📋 Data Summary</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 15px;">
                    <div><strong>Total observations:</strong> ${n}</div>
                    <div><strong>Number of groups (k):</strong> ${k}</div>
                    <div><strong>Overall Median:</strong> ${overallMedian.toFixed(4)}</div>
                </div>
                <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                    💡 Values <strong>equal to the median</strong> are excluded from the above/below counts: ${excluded} of ${totalValues} value${totalValues === 1 ? '' : 's'} ${excluded === 1 ? 'was' : 'were'} excluded, so each group's n (valid) can be smaller than the number you entered.
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 20px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">🔢 Step 1: Count Above/Below Median by Group</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #e9ecef;">
                            <th style="padding: 10px;">Group</th>
                            <th style="padding: 10px;">n (valid)</th>
                            <th style="padding: 10px;">Above Median<br>(> ${overallMedian.toFixed(2)})</th>
                            <th style="padding: 10px;">Below Median<br>(< ${overallMedian.toFixed(2)})</th>
                            <th style="padding: 10px;">Chi-square Contribution</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contingencyRows}
                        <tr style="background: #e9ecef; font-weight: bold;">
                            <td style="padding: 10px;">TOTAL</td>
                            <td style="padding: 10px; text-align: center;">${totalAbove + totalBelow}</td>
                            <td style="padding: 10px; text-align: center;">${totalAbove}</td>
                            <td style="padding: 10px; text-align: center;">${totalBelow}</td>
                            <td style="padding: 10px; text-align: center;">${chiSquare.toFixed(4)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Chi-Square Statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula:</strong> χ² = Σ (O - E)² / E<br><br>
                <strong>χ² = ${chiSquare.toFixed(6)}</strong><br>
                <strong>Degrees of Freedom:</strong> df = k - 1 = ${k} - 1 = ${df}
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>Chi-square statistic:</strong> ${chiSquare.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Conclusion:</strong> ${rejectH0 ? 'There IS sufficient evidence that at least one group median differs from others.' : 'There is NOT sufficient evidence that the group medians differ.'}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px;">
            <strong>💡 When to use Mood's Median Test:</strong><br>
            • Data is ordinal or not normally distributed<br>
            • You want a robust test that's less sensitive to outliers than Kruskal-Wallis<br>
            • Sample sizes are small or unequal<br>
            • Values equal to median are handled elegantly (excluded from analysis)
        </div>
    </div>`;
    
    return { chiSquare, df, pValue, criticalValue, rejectH0, overallMedian, excluded, steps };
}

function setupMoodsMedianLogic() {
    const computeBtn = document.getElementById("moodsComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("moodsData").value;
        const alpha = parseFloat(document.getElementById("moodsAlpha").value);
        const resultDiv = document.getElementById("moodsResultArea");
        const valueSpan = document.getElementById("moodsValueDisplay");
        const stepsSpan = document.getElementById("moodsStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data"; 
            setHtml(stepsSpan, "Please enter data in format 'value:group'");
            return;
        }
        
        const result = computeMoodsMedianTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `χ² = ${result.chiSquare.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Medians differ' : 'Medians equal'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("moodsClearBtn", "moodsData", "moodsResultArea");
}
