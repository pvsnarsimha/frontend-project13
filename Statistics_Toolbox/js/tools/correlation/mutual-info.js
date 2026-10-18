/* MutualInfo: mutualinfo tool (render, compute, setup) */

// ========== MUTUAL INFORMATION INTERFACE RENDER FUNCTION ==========
function renderMutualInfoInterface() {
    return buildInterface({
        id: "statMutualInfoInterface",
        title: "📊 Mutual Information (Non-linear Dependence)",
        card: [
            { formula: "📌 I(X;Y) = Σ Σ p(x,y) × log(p(x,y) / (p(x)·p(y)))" },
            {
                desc: "<strong>What is Mutual Information?</strong><br>\n                    Mutual Information measures the mutual dependence between two variables.\n                    It captures ANY type of relationship (linear AND non-linear).\n                    I(X;Y) = 0 means X and Y are independent."
            },
            {
                desc: "<strong>Key features:</strong><br>\n                    • Works for continuous and discrete data<br>\n                    • Detects non-linear relationships<br>\n                    • Higher MI = stronger dependence<br>\n                    • Measured in \"bits\" (log base 2) or \"nats\" (log base e)",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter X values (comma, space, or line separated):",
                textarea: { id: "mutualInfoXInput", rows: "3", placeholder: "Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10" }
            },
            {
                label: "📋 Enter Y values (same number of values):",
                labelAttrs: { style: FIELD_GAP },
                textarea: { id: "mutualInfoYInput", rows: "3", placeholder: "Example: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100" }
            },
            {
                label: "📊 Number of bins for discretization:",
                labelAttrs: { style: FIELD_GAP },
                input: {
                    type: "number",
                    id: "mutualInfoBins",
                    value: "10",
                    min: "2",
                    max: "50",
                    step: "1",
                    style: FIELD_STYLE
                }
            },
            {
                hint: "Values are discretized into bins to estimate probability distributions",
                hintAttrs: { style: "font-size: 0.75rem;" }
            }
        ],
        run: { id: "mutualInfoComputeBtn", text: "📊 Calculate Mutual Information + Full Steps" },
        clear: { id: "mutualInfoClearBtn", text: "Clear All" },
        result: {
            area: "mutualInfoResultArea",
            label: "🎯 MUTUAL INFORMATION RESULTS",
            value: "mutualInfoValueDisplay",
            steps: "mutualInfoStepsDisplay"
        }
    });
}

// ========== MUTUAL INFORMATION COMPUTATION ==========
// ========== MUTUAL INFORMATION COMPUTATION ==========
function computeMutualInfoWithSteps(xValues, yValues, numBins) {
    if (!xValues.length || !yValues.length) {
        return { error: true, message: "Please enter both X and Y values." };
    }
    if (xValues.length !== yValues.length) {
        return { error: true, message: "X and Y must have the same number of values." };
    }
    if (xValues.length < 5) {
        return { error: true, message: "Need at least 5 observations for meaningful mutual information." };
    }
    
    const n = xValues.length;
    
    // Find min and max for binning
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    // Adjust bins if range is zero
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    // Create bin edges
    let xBins, yBins;
    let xBinEdges = [], yBinEdges = [];
    
    if (xRange === 0) {
        xBins = 1;
        xBinEdges = [xMin - 0.5, xMin + 0.5];
    } else {
        xBins = Math.min(numBins, n);
        for (let i = 0; i <= xBins; i++) {
            xBinEdges.push(xMin + (i / xBins) * xRange);
        }
    }
    
    if (yRange === 0) {
        yBins = 1;
        yBinEdges = [yMin - 0.5, yMin + 0.5];
    } else {
        yBins = Math.min(numBins, n);
        for (let i = 0; i <= yBins; i++) {
            yBinEdges.push(yMin + (i / yBins) * yRange);
        }
    }
    
    // Function to find bin index
    function findBin(value, edges) {
        if (value <= edges[0]) return 0;
        if (value >= edges[edges.length - 1]) return edges.length - 2;
        for (let i = 0; i < edges.length - 1; i++) {
            if (value >= edges[i] && value < edges[i + 1]) return i;
        }
        return edges.length - 2;
    }
    
    // Create contingency table
    let jointCounts = Array(xBins).fill().map(function() { return Array(yBins).fill(0); });
    let xCounts = Array(xBins).fill(0);
    let yCounts = Array(yBins).fill(0);
    let binAssignments = [];
    
    for (let i = 0; i < n; i++) {
        const xBin = findBin(xValues[i], xBinEdges);
        const yBin = findBin(yValues[i], yBinEdges);
        jointCounts[xBin][yBin]++;
        xCounts[xBin]++;
        yCounts[yBin]++;
        binAssignments.push({ x: xValues[i], y: yValues[i], xBin: xBin, yBin: yBin });
    }
    
    // Calculate mutual information
    let mi = 0;
    let miDetails = [];
    let entropyX = 0, entropyY = 0, jointEntropy = 0;
    
    for (let i = 0; i < xBins; i++) {
        for (let j = 0; j < yBins; j++) {
            const jointCount = jointCounts[i][j];
            if (jointCount > 0) {
                const pxy = jointCount / n;
                const px = xCounts[i] / n;
                const py = yCounts[j] / n;
                const contribution = pxy * Math.log2(pxy / (px * py));
                mi += contribution;
                miDetails.push({
                    xBin: i,
                    yBin: j,
                    count: jointCount,
                    pxy: pxy,
                    px: px,
                    py: py,
                    contribution: contribution,
                    formula: jointCount + "/" + n + " × log2((" + jointCount + "/" + n + ") / (" + xCounts[i] + "/" + n + " × " + yCounts[j] + "/" + n + "))"
                });
                
                // For joint entropy calculation
                if (pxy > 0) jointEntropy -= pxy * Math.log2(pxy);
            }
        }
    }
    
    // Calculate individual entropies
    for (let i = 0; i < xBins; i++) {
        if (xCounts[i] > 0) {
            const px = xCounts[i] / n;
            entropyX -= px * Math.log2(px);
        }
    }
    
    for (let j = 0; j < yBins; j++) {
        if (yCounts[j] > 0) {
            const py = yCounts[j] / n;
            entropyY -= py * Math.log2(py);
        }
    }
    
    // Normalized Mutual Information (NMI)
    const nmi = mi / Math.max(entropyX, entropyY);
    
    // Interpret MI value
    let interpretation = "";
    let strength = "";
    if (mi < 0.1) { interpretation = "Very weak or no dependence"; strength = "Very Weak"; }
    else if (mi < 0.3) { interpretation = "Weak dependence"; strength = "Weak"; }
    else if (mi < 0.7) { interpretation = "Moderate dependence"; strength = "Moderate"; }
    else if (mi < 1.2) { interpretation = "Strong dependence"; strength = "Strong"; }
    else { interpretation = "Very strong dependence"; strength = "Very Strong"; }
    
    // Build contingency table HTML
    let contingencyTable = '<div style="overflow-x: auto; margin: 20px 0;"><table style="border-collapse: collapse; width: 100%;"><thead><tr style="background: #1a5490; color: white;"><th style="padding: 10px;">X Bin →<br>Y Bin ↓</th>';
    for (let i = 0; i < xBins; i++) {
        contingencyTable += '<th style="padding: 10px;">Bin ' + (i+1) + '<br>[' + xBinEdges[i].toFixed(2) + ' - ' + xBinEdges[i+1].toFixed(2) + ']</th>';
    }
    contingencyTable += '<th style="padding: 10px;">P(Y)</th></tr></thead><tbody>';
    
    for (let j = 0; j < yBins; j++) {
        contingencyTable += '<tr><th style="background: #e8f4f8; padding: 10px;">Bin ' + (j+1) + '<br>[' + yBinEdges[j].toFixed(2) + ' - ' + yBinEdges[j+1].toFixed(2) + ']</th>';
        for (let i = 0; i < xBins; i++) {
            const count = jointCounts[i][j];
            const prob = (count / n * 100).toFixed(1);
            const bgStyle = (count > 0) ? 'background: #f8f9fa;' : '';
            contingencyTable += '<td style="border: 1px solid #ddd; padding: 8px; text-align: center; ' + bgStyle + '">' + count + '<br><span style="font-size: 10px;">(' + prob + '%)</span></td>';
        }
        contingencyTable += '<td style="background: #e8f4f8; padding: 10px; text-align: center;">' + (yCounts[j]/n*100).toFixed(1) + '%</td></tr>';
    }
    
    contingencyTable += '<tr style="background: #e9ecef;"><th style="padding: 10px;">P(X)</th>';
    for (let i = 0; i < xBins; i++) {
        contingencyTable += '<td style="padding: 8px; text-align: center;">' + (xCounts[i]/n*100).toFixed(1) + '%</td>';
    }
    contingencyTable += '<td style="padding: 8px; text-align: center;">100%</td></tr>';
    contingencyTable += '</tbody></table></div>';
    
    // Build contribution table
    let contribRows = '';
    for (let d of miDetails) {
        contribRows += '<tr style="border-bottom: 1px solid #e9ecef;">';
        contribRows += '<td style="padding: 8px; text-align: center;">' + (d.xBin+1) + ',' + (d.yBin+1) + '</td>';
        contribRows += '<td style="padding: 8px; text-align: center;">' + d.count + ' (' + (d.pxy*100).toFixed(1) + '%)</td>';
        contribRows += '<td style="padding: 8px; text-align: center;">' + (d.px*100).toFixed(1) + '%</td>';
        contribRows += '<td style="padding: 8px; text-align: center;">' + (d.py*100).toFixed(1) + '%</td>';
        contribRows += '<td style="padding: 8px; text-align: center; font-family: monospace; font-size: 11px;">' + d.formula + '</td>';
        contribRows += '<td style="padding: 8px; text-align: center; font-weight: bold; color: #1a5490;">' + d.contribution.toFixed(6) + '</td>';
        contribRows += '</tr>';
    }
    
    // Build bin assignment table rows
    let binRows = '';
    for (let i = 0; i < binAssignments.length; i++) {
        let b = binAssignments[i];
        binRows += '<tr style="border-bottom: 1px solid #e9ecef;">';
        binRows += '<td style="padding: 6px; text-align: center;">' + (i+1) + '</td>';
        binRows += '<td style="padding: 6px; text-align: center;">' + b.x + '</td>';
        binRows += '<td style="padding: 6px; text-align: center;">' + b.y + '</td>';
        binRows += '<td style="padding: 6px; text-align: center;">Bin ' + (b.xBin+1) + ' (' + xBinEdges[b.xBin].toFixed(2) + '-' + xBinEdges[b.xBin+1].toFixed(2) + ')</td>';
        binRows += '<td style="padding: 6px; text-align: center;">Bin ' + (b.yBin+1) + ' (' + yBinEdges[b.yBin].toFixed(2) + '-' + yBinEdges[b.yBin+1].toFixed(2) + ')</td>';
        binRows += '</tr>';
    }
    
    // Build H(X) calculation table rows
    let hxRows = '';
    let hxSum = 0;
    for (let i = 0; i < xBins; i++) {
        const count = xCounts[i];
        const px = count / n;
        const log2px = count > 0 ? Math.log2(px) : 0;
        const term = count > 0 ? px * log2px : 0; // 0·log 0 is taken as 0
        hxSum += term;
        hxRows += '<tr style="border-bottom: 1px solid #e9ecef;">';
        hxRows += '<td style="padding: 8px; text-align: center;">Bin ' + (i+1) + '<br>[' + xBinEdges[i].toFixed(2) + '-' + xBinEdges[i+1].toFixed(2) + ']</td>';
        hxRows += '<td style="padding: 8px; text-align: center;">' + count + '</td>';
        hxRows += '<td style="padding: 8px; text-align: center;">' + count + '/' + n + ' = ' + px.toFixed(6) + '</td>';
        hxRows += '<td style="padding: 8px; text-align: center;">' + (count > 0 ? 'log₂(' + px.toFixed(6) + ') = ' + log2px.toFixed(6) : 'empty bin (0·log 0 = 0)') + '</td>';
        hxRows += '<td style="padding: 8px; text-align: center; font-weight: bold;">' + px.toFixed(6) + ' × ' + log2px.toFixed(6) + ' = ' + term.toFixed(6) + '</td>';
        hxRows += '</tr>';
    }
    
    // Build H(Y) calculation table rows
    let hyRows = '';
    let hySum = 0;
    for (let j = 0; j < yBins; j++) {
        const count = yCounts[j];
        const py = count / n;
        const log2py = count > 0 ? Math.log2(py) : 0;
        const term = count > 0 ? py * log2py : 0; // 0·log 0 is taken as 0
        hySum += term;
        hyRows += '<tr style="border-bottom: 1px solid #e9ecef;">';
        hyRows += '<td style="padding: 8px; text-align: center;">Bin ' + (j+1) + '<br>[' + yBinEdges[j].toFixed(2) + '-' + yBinEdges[j+1].toFixed(2) + ']</td>';
        hyRows += '<td style="padding: 8px; text-align: center;">' + count + '</td>';
        hyRows += '<td style="padding: 8px; text-align: center;">' + count + '/' + n + ' = ' + py.toFixed(6) + '</td>';
        hyRows += '<td style="padding: 8px; text-align: center;">' + (count > 0 ? 'log₂(' + py.toFixed(6) + ') = ' + log2py.toFixed(6) : 'empty bin (0·log 0 = 0)') + '</td>';
        hyRows += '<td style="padding: 8px; text-align: center; font-weight: bold;">' + py.toFixed(6) + ' × ' + log2py.toFixed(6) + ' = ' + term.toFixed(6) + '</td>';
        hyRows += '</tr>';
    }
    
    // Build H(X,Y) calculation table rows
    let hxyRows = '';
    let hxySum = 0;
    for (let i = 0; i < xBins; i++) {
        for (let j = 0; j < yBins; j++) {
            const count = jointCounts[i][j];
            if (count > 0) {
                const pxy = count / n;
                const log2pxy = Math.log2(pxy);
                const term = pxy * log2pxy;
                hxySum += term;
                hxyRows += '<tr style="border-bottom: 1px solid #e9ecef;">';
                hxyRows += '<td style="padding: 6px; text-align: center;">Bin ' + (i+1) + '</td>';
                hxyRows += '<td style="padding: 6px; text-align: center;">Bin ' + (j+1) + '</td>';
                hxyRows += '<td style="padding: 6px; text-align: center;">' + count + '</td>';
                hxyRows += '<td style="padding: 6px; text-align: center;">' + count + '/' + n + ' = ' + pxy.toFixed(6) + '</td>';
                hxyRows += '<td style="padding: 6px; text-align: center;">log₂(' + pxy.toFixed(6) + ') = ' + log2pxy.toFixed(6) + '</td>';
                hxyRows += '<td style="padding: 6px; text-align: center; font-weight: bold;">' + pxy.toFixed(6) + ' × ' + log2pxy.toFixed(6) + ' = ' + term.toFixed(6) + '</td>';
                hxyRows += '</tr>';
            }
        }
    }
    
    // Complete HTML output
    let steps = '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">';
    steps += '<div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">';
    steps += '<div style="display: flex; align-items: center; gap: 15px;">';
    steps += '<span style="font-size: 48px;">📊</span>';
    steps += '<div><h1 style="margin: 0; font-size: 28px;">Mutual Information (MI)</h1>';
    steps += '<p style="margin: 8px 0 0 0; opacity: 0.9;">A non-parametric measure of dependence that captures ANY relationship</p></div></div></div>';
    
    steps += '<div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">';
    steps += '<h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 Understanding Mutual Information</h3>';
    steps += '<div style="background: white; border-radius: 12px; padding: 20px;">';
    steps += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">';
    steps += '<div><strong>📐 Formula:</strong>';
    steps += '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; text-align: center; margin: 10px 0;">';
    steps += 'I(X;Y) = Σ Σ p(x,y) × log₂(p(x,y) / (p(x)·p(y)))</div>';
    steps += '<p><strong>Properties:</strong></p><ul>';
    steps += '<li>I(X;Y) ≥ 0 (always non-negative)</li>';
    steps += '<li>I(X;Y) = 0 ⇔ X and Y are independent</li>';
    steps += '<li>I(X;X) = H(X) (self-information = entropy)</li>';
    steps += '<li>Measures in "bits" (log base 2)</li></ul></div>';
    steps += '<div><strong>🎯 Key Insights:</strong><ul style="margin-top: 10px;">';
    steps += '<li>✅ <strong>Captures ANY relationship</strong> (linear AND non-linear)</li>';
    steps += '<li>✅ <strong>No assumptions</strong> about distribution</li>';
    steps += '<li>✅ <strong>Symmetric</strong> (I(X;Y) = I(Y;X))</li>';
    steps += '<li>✅ Related to entropy: I(X;Y) = H(X) + H(Y) - H(X,Y)</li></ul>';
    steps += '<div style="margin-top: 15px; background: #fff3cd; padding: 10px; border-radius: 8px;">';
    steps += '💡 <strong>Interpretation:</strong> MI measures how much knowing X reduces uncertainty about Y.</div></div></div></div></div>';
    
    steps += '<div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">';
    steps += '<h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Input Data Summary</h3>';
    steps += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">';
    steps += '<div style="background: white; border-radius: 12px; padding: 12px; text-align: center;"><div style="font-size: 12px; color: #6c757d;">Observations (n)</div><div style="font-size: 32px; font-weight: 700;">' + n + '</div></div>';
    steps += '<div style="background: white; border-radius: 12px; padding: 12px; text-align: center;"><div style="font-size: 12px; color: #6c757d;">X Range</div><div style="font-size: 16px; font-weight: 700;">[' + xMin.toFixed(2) + ', ' + xMax.toFixed(2) + ']</div></div>';
    steps += '<div style="background: white; border-radius: 12px; padding: 12px; text-align: center;"><div style="font-size: 12px; color: #6c757d;">Y Range</div><div style="font-size: 16px; font-weight: 700;">[' + yMin.toFixed(2) + ', ' + yMax.toFixed(2) + ']</div></div>';
    steps += '<div style="background: white; border-radius: 12px; padding: 12px; text-align: center;"><div style="font-size: 12px; color: #6c757d;">Number of Bins</div><div style="font-size: 24px; font-weight: 700;">' + xBins + ' × ' + yBins + '</div></div></div>';
    
    steps += '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
    steps += '<thead><tr style="background: #1a5490; color: white;"><th style="padding: 8px;">#</th><th style="padding: 8px;">X</th><th style="padding: 8px;">Y</th><th style="padding: 8px;">X Bin</th><th style="padding: 8px;">Y Bin</th></tr></thead><tbody>';
    steps += binRows;
    steps += '</tbody></table></div></div>';
    
    steps += '<div style="background: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">';
    steps += '<h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">📋 Step 1: Contingency Table (Joint Distribution)</h3>';
    steps += contingencyTable;
    steps += '</div>';
    
    steps += '<div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">';
    steps += '<h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Mutual Information Contributions</h3>';
    steps += '<div style="background: white; border-radius: 12px; padding: 16px; overflow-x: auto;">';
    steps += '<table style="width: 100%; border-collapse: collapse; font-size: 12px;"><thead>';
    steps += '<tr style="background: #1a5490; color: white;"><th style="padding: 8px;">Cell (X,Y)</th><th style="padding: 8px;">Count (p)</th><th style="padding: 8px;">p(x)</th><th style="padding: 8px;">p(y)</th><th style="padding: 8px;">Formula</th><th style="padding: 8px;">Contribution</th></tr></thead><tbody>';
    steps += contribRows;
    steps += '<tr style="background: #e9ecef; font-weight: bold;"><td colspan="5" style="padding: 10px; text-align: right;">I(X;Y) = Σ Contribution →</td>';
    steps += '<td style="padding: 10px; text-align: center; background: #1a5490; color: white; font-size: 16px;">' + mi.toFixed(6) + ' bits</td></tr>';
    steps += '</tbody></table></div></div>';
    
    // Detailed H(X) Calculation
    steps += '<div style="background: #e3f2fd; border-radius: 12px; padding: 20px; margin-bottom: 20px;">';
    steps += '<h4 style="margin: 0 0 15px 0; color: #1a5490;">📐 Detailed Calculation of H(X) - Entropy of X</h4>';
    steps += '<div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px;">';
    steps += '<strong>Formula:</strong> H(X) = - Σ [p(xᵢ) × log₂(p(xᵢ))]</div>';
    steps += '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 13px;"><thead>';
    steps += '<tr style="background: #1a5490; color: white;"><th style="padding: 8px;">X Bin</th><th style="padding: 8px;">Count (n)</th><th style="padding: 8px;">p(x) = n/' + n + '</th><th style="padding: 8px;">log₂(p(x))</th><th style="padding: 8px;">p(x) × log₂(p(x))</th></tr></thead><tbody>';
    steps += hxRows;
    steps += '<tr style="background: #e9ecef; font-weight: bold;"><td colspan="4" style="padding: 8px; text-align: right;">Σ [p(x) × log₂(p(x))] =</td>';
    steps += '<td style="padding: 8px; text-align: center; background: #ffc107;">' + hxSum.toFixed(6) + '</td></tr>';
    steps += '<tr style="background: #d4edda; font-weight: bold;"><td colspan="4" style="padding: 8px; text-align: right;">H(X) = - Σ [p(x) × log₂(p(x))] =</td>';
    steps += '<td style="padding: 8px; text-align: center; background: #1a5490; color: white;">' + entropyX.toFixed(6) + ' bits</td></tr>';
    steps += '</tbody></table></div>';
    steps += '<div style="margin-top: 12px; padding: 10px; background: #e8f4f8; border-radius: 6px; font-size: 12px;">';
    steps += '💡 <strong>Interpretation:</strong> H(X) = ' + entropyX.toFixed(4) + ' bits means on average, we need ' + entropyX.toFixed(4) + ' bits of information to describe the value of X.</div></div>';
    
    // Detailed H(Y) Calculation
    steps += '<div style="background: #e8f5e9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">';
    steps += '<h4 style="margin: 0 0 15px 0; color: #2e7d32;">📐 Detailed Calculation of H(Y) - Entropy of Y</h4>';
    steps += '<div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px;">';
    steps += '<strong>Formula:</strong> H(Y) = - Σ [p(yⱼ) × log₂(p(yⱼ))]</div>';
    steps += '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 13px;"><thead>';
    steps += '<tr style="background: #2e7d32; color: white;"><th style="padding: 8px;">Y Bin</th><th style="padding: 8px;">Count (n)</th><th style="padding: 8px;">p(y) = n/' + n + '</th><th style="padding: 8px;">log₂(p(y))</th><th style="padding: 8px;">p(y) × log₂(p(y))</th></tr></thead><tbody>';
    steps += hyRows;
    steps += '<tr style="background: #e9ecef; font-weight: bold;"><td colspan="4" style="padding: 8px; text-align: right;">Σ [p(y) × log₂(p(y))] =</td>';
    steps += '<td style="padding: 8px; text-align: center; background: #ffc107;">' + hySum.toFixed(6) + '</td></tr>';
    steps += '<tr style="background: #d4edda; font-weight: bold;"><td colspan="4" style="padding: 8px; text-align: right;">H(Y) = - Σ [p(y) × log₂(p(y))] =</td>';
    steps += '<td style="padding: 8px; text-align: center; background: #2e7d32; color: white;">' + entropyY.toFixed(6) + ' bits</td></tr>';
    steps += '</tbody></table></div>';
    steps += '<div style="margin-top: 12px; padding: 10px; background: #e8f5e9; border-radius: 6px; font-size: 12px;">';
    steps += '💡 <strong>Interpretation:</strong> H(Y) = ' + entropyY.toFixed(4) + ' bits means on average, we need ' + entropyY.toFixed(4) + ' bits of information to describe the value of Y.</div></div>';
    
    // Detailed H(X,Y) Calculation
    steps += '<div style="background: #fff3e0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">';
    steps += '<h4 style="margin: 0 0 15px 0; color: #e65100;">📐 Detailed Calculation of H(X,Y) - Joint Entropy</h4>';
    steps += '<div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px;">';
    steps += '<strong>Formula:</strong> H(X,Y) = - Σ Σ [p(x,y) × log₂(p(x,y))]</div>';
    steps += '<div style="overflow-x: auto; max-height: 400px; overflow-y: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 12px;"><thead>';
    steps += '<tr style="background: #e65100; color: white;"><th style="padding: 6px;">X Bin</th><th style="padding: 6px;">Y Bin</th><th style="padding: 6px;">Count</th><th style="padding: 6px;">p(x,y) = count/' + n + '</th><th style="padding: 6px;">log₂(p(x,y))</th><th style="padding: 6px;">p(x,y) × log₂(p(x,y))</th></tr></thead><tbody>';
    steps += hxyRows;
    steps += '<tr style="background: #e9ecef; font-weight: bold;"><td colspan="5" style="padding: 8px; text-align: right;">Σ Σ [p(x,y) × log₂(p(x,y))] =</td>';
    steps += '<td style="padding: 8px; text-align: center; background: #ffc107;">' + hxySum.toFixed(6) + '</td></tr>';
    steps += '<tr style="background: #d4edda; font-weight: bold;"><td colspan="5" style="padding: 8px; text-align: right;">H(X,Y) = - Σ Σ [p(x,y) × log₂(p(x,y))] =</td>';
    steps += '<td style="padding: 8px; text-align: center; background: #e65100; color: white;">' + jointEntropy.toFixed(6) + ' bits</td></tr>';
    steps += '</tbody></table></div>';
    steps += '<div style="margin-top: 12px; padding: 10px; background: #fff3e0; border-radius: 6px; font-size: 12px;">';
    steps += '💡 <strong>Interpretation:</strong> H(X,Y) = ' + jointEntropy.toFixed(4) + ' bits means on average, we need ' + jointEntropy.toFixed(4) + ' bits to describe BOTH X and Y together.</div></div>';
    
    // Results Summary
    steps += '<div style="background: white; border-radius: 16px; margin-bottom: 25px; border: 2px solid #1a5490;">';
    steps += '<h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 Mutual Information Results</h3>';
    steps += '<div style="padding: 20px;"><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">';
    steps += '<div style="background: #f8f9fa; border-radius: 12px; padding: 12px; text-align: center;"><div style="font-size: 11px; color: #6c757d;">Mutual Information</div><div style="font-size: 28px; font-weight: 700; color: #1a5490;">' + mi.toFixed(4) + '</div><div style="font-size: 11px;">bits</div></div>';
    steps += '<div style="background: #f8f9fa; border-radius: 12px; padding: 12px; text-align: center;"><div style="font-size: 11px; color: #6c757d;">Normalized MI (NMI)</div><div style="font-size: 28px; font-weight: 700; color: #17a2b8;">' + nmi.toFixed(4) + '</div><div style="font-size: 11px;">0-1 scale</div></div>';
    steps += '<div style="background: #f8f9fa; border-radius: 12px; padding: 12px; text-align: center;"><div style="font-size: 11px; color: #6c757d;">H(X) (Uncertainty in X)</div><div style="font-size: 20px;">' + entropyX.toFixed(4) + ' bits</div></div>';
    steps += '<div style="background: #f8f9fa; border-radius: 12px; padding: 12px; text-align: center;"><div style="font-size: 11px; color: #6c757d;">H(Y) (Uncertainty in Y)</div><div style="font-size: 20px;">' + entropyY.toFixed(4) + ' bits</div></div></div>';
    
    let bgColor = (mi > 0.7) ? '#d4edda' : ((mi > 0.3) ? '#fff3cd' : '#f8d7da');
    steps += '<div style="margin-top: 20px; padding: 15px; background: ' + bgColor + '; border-radius: 12px;">';
    steps += '<strong>📌 Interpretation:</strong><br>';
    steps += '• <strong>Strength of relationship:</strong> ' + strength + ' (MI = ' + mi.toFixed(4) + ' bits)<br>';
    steps += '• <strong>' + interpretation + '</strong><br>';
    steps += '• <strong>Normalized MI:</strong> ' + (nmi * 100).toFixed(1) + '% of maximum possible dependence<br>';
    steps += '• <strong>What this means:</strong> Knowing X reduces uncertainty about Y by ' + ((mi / entropyY) * 100).toFixed(1) + '% (from ' + entropyY.toFixed(3) + ' to ' + (entropyY - mi).toFixed(3) + ' bits)</div></div></div>';
    
    steps += '</div>';
    
    return { mi: mi, nmi: nmi, entropyX: entropyX, entropyY: entropyY, jointEntropy: jointEntropy, steps: steps };
}

// ========== MUTUAL INFORMATION SETUP FUNCTION ==========
function setupMutualInfoLogic() {
    const computeBtn = document.getElementById("mutualInfoComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const rawX = document.getElementById("mutualInfoXInput").value;
        const rawY = document.getElementById("mutualInfoYInput").value;
        const xValues = parseNumbersFromInput(rawX);
        const yValues = parseNumbersFromInput(rawY);
        const numBins = parseInt(document.getElementById("mutualInfoBins").value) || 10;
        const resultDiv = document.getElementById("mutualInfoResultArea");
        const valueSpan = document.getElementById("mutualInfoValueDisplay");
        const stepsSpan = document.getElementById("mutualInfoStepsDisplay");
        
        const result = computeMutualInfoWithSteps(xValues, yValues, numBins);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `I(X;Y) = ${result.mi.toFixed(6)} bits | NMI = ${result.nmi.toFixed(4)}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("mutualInfoClearBtn", ["mutualInfoXInput", "mutualInfoYInput"], "mutualInfoResultArea");
}
