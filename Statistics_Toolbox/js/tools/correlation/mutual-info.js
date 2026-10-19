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
    numBins = Math.max(2, Math.min(50, Math.floor(numBins) || 10));
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
    let contingencyTable = '<div class="s-91cab3"><table class="s-fb047b gen-sized"><thead><tr class="s-e7b83b"><th class="s-a756db">X Bin →<br>Y Bin ↓</th>';
    for (let i = 0; i < xBins; i++) {
        contingencyTable += '<th class="s-a756db">Bin ' + (i+1) + '<br>[' + xBinEdges[i].toFixed(2) + ' - ' + xBinEdges[i+1].toFixed(2) + ']</th>';
    }
    contingencyTable += '<th class="s-a756db">P(Y)</th></tr></thead><tbody>';
    
    for (let j = 0; j < yBins; j++) {
        contingencyTable += '<tr><th class="s-d85963">Bin ' + (j+1) + '<br>[' + yBinEdges[j].toFixed(2) + ' - ' + yBinEdges[j+1].toFixed(2) + ']</th>';
        for (let i = 0; i < xBins; i++) {
            const count = jointCounts[i][j];
            const prob = (count / n * 100).toFixed(1);
            contingencyTable += `<td class="${count ? 's-04391b' : 's-21fdcf'}">${count}<br><span class="s-55fe05">(${prob}%)</span></td>`;
        }
        contingencyTable += '<td class="s-c7f535">' + (yCounts[j]/n*100).toFixed(1) + '%</td></tr>';
    }
    
    contingencyTable += '<tr class="s-bfd0ae"><th class="s-a756db">P(X)</th>';
    for (let i = 0; i < xBins; i++) {
        contingencyTable += '<td class="s-a7c3f4">' + (xCounts[i]/n*100).toFixed(1) + '%</td>';
    }
    contingencyTable += '<td class="s-a7c3f4">100%</td></tr>';
    contingencyTable += '</tbody></table></div>';
    
    // Build contribution table
    let contribRows = '';
    for (let d of miDetails) {
        contribRows += '<tr class="s-00049c">';
        contribRows += '<td class="s-a7c3f4">' + (d.xBin+1) + ',' + (d.yBin+1) + '</td>';
        contribRows += '<td class="s-a7c3f4">' + d.count + ' (' + (d.pxy*100).toFixed(1) + '%)</td>';
        contribRows += '<td class="s-a7c3f4">' + (d.px*100).toFixed(1) + '%</td>';
        contribRows += '<td class="s-a7c3f4">' + (d.py*100).toFixed(1) + '%</td>';
        contribRows += '<td class="s-fc9227">' + d.formula + '</td>';
        contribRows += '<td class="s-46f2bb">' + d.contribution.toFixed(6) + '</td>';
        contribRows += '</tr>';
    }
    
    // Build bin assignment table rows
    let binRows = '';
    for (let i = 0; i < binAssignments.length; i++) {
        let b = binAssignments[i];
        binRows += '<tr class="s-00049c">';
        binRows += '<td class="s-232009">' + (i+1) + '</td>';
        binRows += '<td class="s-232009">' + b.x + '</td>';
        binRows += '<td class="s-232009">' + b.y + '</td>';
        binRows += '<td class="s-232009">Bin ' + (b.xBin+1) + ' (' + xBinEdges[b.xBin].toFixed(2) + '-' + xBinEdges[b.xBin+1].toFixed(2) + ')</td>';
        binRows += '<td class="s-232009">Bin ' + (b.yBin+1) + ' (' + yBinEdges[b.yBin].toFixed(2) + '-' + yBinEdges[b.yBin+1].toFixed(2) + ')</td>';
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
        hxRows += '<tr class="s-00049c">';
        hxRows += '<td class="s-a7c3f4">Bin ' + (i+1) + '<br>[' + xBinEdges[i].toFixed(2) + '-' + xBinEdges[i+1].toFixed(2) + ']</td>';
        hxRows += '<td class="s-a7c3f4">' + count + '</td>';
        hxRows += '<td class="s-a7c3f4">' + count + '/' + n + ' = ' + px.toFixed(6) + '</td>';
        hxRows += '<td class="s-a7c3f4">' + (count > 0 ? 'log₂(' + px.toFixed(6) + ') = ' + log2px.toFixed(6) : 'empty bin (0·log 0 = 0)') + '</td>';
        hxRows += '<td class="s-f8719c">' + px.toFixed(6) + ' × ' + log2px.toFixed(6) + ' = ' + term.toFixed(6) + '</td>';
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
        hyRows += '<tr class="s-00049c">';
        hyRows += '<td class="s-a7c3f4">Bin ' + (j+1) + '<br>[' + yBinEdges[j].toFixed(2) + '-' + yBinEdges[j+1].toFixed(2) + ']</td>';
        hyRows += '<td class="s-a7c3f4">' + count + '</td>';
        hyRows += '<td class="s-a7c3f4">' + count + '/' + n + ' = ' + py.toFixed(6) + '</td>';
        hyRows += '<td class="s-a7c3f4">' + (count > 0 ? 'log₂(' + py.toFixed(6) + ') = ' + log2py.toFixed(6) : 'empty bin (0·log 0 = 0)') + '</td>';
        hyRows += '<td class="s-f8719c">' + py.toFixed(6) + ' × ' + log2py.toFixed(6) + ' = ' + term.toFixed(6) + '</td>';
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
                hxyRows += '<tr class="s-00049c">';
                hxyRows += '<td class="s-232009">Bin ' + (i+1) + '</td>';
                hxyRows += '<td class="s-232009">Bin ' + (j+1) + '</td>';
                hxyRows += '<td class="s-232009">' + count + '</td>';
                hxyRows += '<td class="s-232009">' + count + '/' + n + ' = ' + pxy.toFixed(6) + '</td>';
                hxyRows += '<td class="s-232009">log₂(' + pxy.toFixed(6) + ') = ' + log2pxy.toFixed(6) + '</td>';
                hxyRows += '<td class="s-8cb01e">' + pxy.toFixed(6) + ' × ' + log2pxy.toFixed(6) + ' = ' + term.toFixed(6) + '</td>';
                hxyRows += '</tr>';
            }
        }
    }
    
    // Complete HTML output
    let steps = '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">';
    steps += '<div class="s-6d8291 gen-pad">';
    steps += '<div class="s-e9f44b gen-flex">';
    steps += '<span class="s-93df4f gen-big">📊</span>';
    steps += '<div><h1 class="s-b80b8c">Mutual Information (MI)</h1>';
    steps += '<p class="s-259079">A non-parametric measure of dependence that captures ANY relationship</p></div></div></div>';
    
    steps += '<div class="s-057c67 gen-pad">';
    steps += '<h3 class="s-ed0bb5">📖 Understanding Mutual Information</h3>';
    steps += '<div class="s-6fab3a gen-pad">';
    steps += '<div class="s-87555e gen-grid">';
    steps += '<div><strong>📐 Formula:</strong>';
    steps += '<div class="s-6c86f8">';
    steps += 'I(X;Y) = Σ Σ p(x,y) × log₂(p(x,y) / (p(x)·p(y)))</div>';
    steps += '<p><strong>Properties:</strong></p><ul>';
    steps += '<li>I(X;Y) ≥ 0 (always non-negative)</li>';
    steps += '<li>I(X;Y) = 0 ⇔ X and Y are independent</li>';
    steps += '<li>I(X;X) = H(X) (self-information = entropy)</li>';
    steps += '<li>Measures in "bits" (log base 2)</li></ul></div>';
    steps += '<div><strong>🎯 Key Insights:</strong><ul class="s-8ffddd">';
    steps += '<li>✅ <strong>Captures ANY relationship</strong> (linear AND non-linear)</li>';
    steps += '<li>✅ <strong>No assumptions</strong> about distribution</li>';
    steps += '<li>✅ <strong>Symmetric</strong> (I(X;Y) = I(Y;X))</li>';
    steps += '<li>✅ Related to entropy: I(X;Y) = H(X) + H(Y) - H(X,Y)</li></ul>';
    steps += '<div class="s-c031fe">';
    steps += '💡 <strong>Interpretation:</strong> MI measures how much knowing X reduces uncertainty about Y.</div></div></div></div></div>';
    
    steps += '<div class="s-bfd155 gen-pad">';
    steps += '<h3 class="s-d163b6">📊 Input Data Summary</h3>';
    steps += '<div class="s-31897a gen-grid">';
    steps += '<div class="s-417d62"><div class="s-42da0a">Observations (n)</div><div class="s-e35605 gen-big">' + n + '</div></div>';
    steps += '<div class="s-417d62"><div class="s-42da0a">X Range</div><div class="s-afbbf0">[' + xMin.toFixed(2) + ', ' + xMax.toFixed(2) + ']</div></div>';
    steps += '<div class="s-417d62"><div class="s-42da0a">Y Range</div><div class="s-afbbf0">[' + yMin.toFixed(2) + ', ' + yMax.toFixed(2) + ']</div></div>';
    steps += '<div class="s-417d62"><div class="s-42da0a">Number of Bins</div><div class="s-c2434f">' + xBins + ' × ' + yBins + '</div></div></div>';
    
    steps += '<div class="s-01a9b9"><table class="s-776a1d gen-sized">';
    steps += '<thead><tr class="s-e7b83b"><th class="s-939795">#</th><th class="s-939795">X</th><th class="s-939795">Y</th><th class="s-939795">X Bin</th><th class="s-939795">Y Bin</th></tr></thead><tbody>';
    steps += binRows;
    steps += '</tbody></table></div></div>';
    
    steps += '<div class="s-349055">';
    steps += '<h3 class="s-10bf27">📋 Step 1: Contingency Table (Joint Distribution)</h3>';
    steps += contingencyTable;
    steps += '</div>';
    
    steps += '<div class="s-95d04a gen-pad">';
    steps += '<h3 class="s-d163b6">🔢 Step 2: Calculate Mutual Information Contributions</h3>';
    steps += '<div class="s-36c22a">';
    steps += '<table class="s-776a1d gen-sized"><thead>';
    steps += '<tr class="s-e7b83b"><th class="s-939795">Cell (X,Y)</th><th class="s-939795">Count (p)</th><th class="s-939795">p(x)</th><th class="s-939795">p(y)</th><th class="s-939795">Formula</th><th class="s-939795">Contribution</th></tr></thead><tbody>';
    steps += contribRows;
    steps += '<tr class="s-17b154"><td class="s-c1430c" colspan="5">I(X;Y) = Σ Contribution →</td>';
    steps += '<td class="s-91da7f">' + mi.toFixed(6) + ' bits</td></tr>';
    steps += '</tbody></table></div></div>';
    
    // Detailed H(X) Calculation
    steps += '<div class="s-fa1813 gen-pad">';
    steps += '<h4 class="s-3f62bc">📐 Detailed Calculation of H(X) - Entropy of X</h4>';
    steps += '<div class="s-93ce87">';
    steps += '<strong>Formula:</strong> H(X) = - Σ [p(xᵢ) × log₂(p(xᵢ))]</div>';
    steps += '<div class="s-01a9b9"><table class="s-306b2c gen-sized"><thead>';
    steps += '<tr class="s-e7b83b"><th class="s-939795">X Bin</th><th class="s-939795">Count (n)</th><th class="s-939795">p(x) = n/' + n + '</th><th class="s-939795">log₂(p(x))</th><th class="s-939795">p(x) × log₂(p(x))</th></tr></thead><tbody>';
    steps += hxRows;
    steps += '<tr class="s-17b154"><td class="s-ebe99d" colspan="4">Σ [p(x) × log₂(p(x))] =</td>';
    steps += '<td class="s-463785">' + hxSum.toFixed(6) + '</td></tr>';
    steps += '<tr class="s-15bf30"><td class="s-ebe99d" colspan="4">H(X) = - Σ [p(x) × log₂(p(x))] =</td>';
    steps += '<td class="s-8cdb56">' + entropyX.toFixed(6) + ' bits</td></tr>';
    steps += '</tbody></table></div>';
    steps += '<div class="s-826fbf">';
    steps += '💡 <strong>Interpretation:</strong> H(X) = ' + entropyX.toFixed(4) + ' bits means on average, we need ' + entropyX.toFixed(4) + ' bits of information to describe the value of X.</div></div>';
    
    // Detailed H(Y) Calculation
    steps += '<div class="s-59729e gen-pad">';
    steps += '<h4 class="s-966295">📐 Detailed Calculation of H(Y) - Entropy of Y</h4>';
    steps += '<div class="s-93ce87">';
    steps += '<strong>Formula:</strong> H(Y) = - Σ [p(yⱼ) × log₂(p(yⱼ))]</div>';
    steps += '<div class="s-01a9b9"><table class="s-306b2c gen-sized"><thead>';
    steps += '<tr class="s-257ed8"><th class="s-939795">Y Bin</th><th class="s-939795">Count (n)</th><th class="s-939795">p(y) = n/' + n + '</th><th class="s-939795">log₂(p(y))</th><th class="s-939795">p(y) × log₂(p(y))</th></tr></thead><tbody>';
    steps += hyRows;
    steps += '<tr class="s-17b154"><td class="s-ebe99d" colspan="4">Σ [p(y) × log₂(p(y))] =</td>';
    steps += '<td class="s-463785">' + hySum.toFixed(6) + '</td></tr>';
    steps += '<tr class="s-15bf30"><td class="s-ebe99d" colspan="4">H(Y) = - Σ [p(y) × log₂(p(y))] =</td>';
    steps += '<td class="s-2669eb">' + entropyY.toFixed(6) + ' bits</td></tr>';
    steps += '</tbody></table></div>';
    steps += '<div class="s-f30bac">';
    steps += '💡 <strong>Interpretation:</strong> H(Y) = ' + entropyY.toFixed(4) + ' bits means on average, we need ' + entropyY.toFixed(4) + ' bits of information to describe the value of Y.</div></div>';
    
    // Detailed H(X,Y) Calculation
    steps += '<div class="s-91a57b gen-pad">';
    steps += '<h4 class="s-acb8a9">📐 Detailed Calculation of H(X,Y) - Joint Entropy</h4>';
    steps += '<div class="s-93ce87">';
    steps += '<strong>Formula:</strong> H(X,Y) = - Σ Σ [p(x,y) × log₂(p(x,y))]</div>';
    steps += '<div class="s-317679"><table class="s-776a1d gen-sized"><thead>';
    steps += '<tr class="s-01ff1c"><th class="s-0d2bc5">X Bin</th><th class="s-0d2bc5">Y Bin</th><th class="s-0d2bc5">Count</th><th class="s-0d2bc5">p(x,y) = count/' + n + '</th><th class="s-0d2bc5">log₂(p(x,y))</th><th class="s-0d2bc5">p(x,y) × log₂(p(x,y))</th></tr></thead><tbody>';
    steps += hxyRows;
    steps += '<tr class="s-17b154"><td class="s-ebe99d" colspan="5">Σ Σ [p(x,y) × log₂(p(x,y))] =</td>';
    steps += '<td class="s-463785">' + hxySum.toFixed(6) + '</td></tr>';
    steps += '<tr class="s-15bf30"><td class="s-ebe99d" colspan="5">H(X,Y) = - Σ Σ [p(x,y) × log₂(p(x,y))] =</td>';
    steps += '<td class="s-fc8876">' + jointEntropy.toFixed(6) + ' bits</td></tr>';
    steps += '</tbody></table></div>';
    steps += '<div class="s-96a72a">';
    steps += '💡 <strong>Interpretation:</strong> H(X,Y) = ' + jointEntropy.toFixed(4) + ' bits means on average, we need ' + jointEntropy.toFixed(4) + ' bits to describe BOTH X and Y together.</div></div>';
    
    // Results Summary
    steps += '<div class="s-7c16b5">';
    steps += '<h3 class="s-ba9de1">📊 Mutual Information Results</h3>';
    steps += '<div class="s-45e38b gen-pad"><div class="s-3aa776 gen-grid gen-grid-many">';
    steps += '<div class="s-d57999"><div class="s-033765">Mutual Information</div><div class="s-b39687">' + mi.toFixed(4) + '</div><div class="s-d52d0d">bits</div></div>';
    steps += '<div class="s-d57999"><div class="s-033765">Normalized MI (NMI)</div><div class="s-179392">' + nmi.toFixed(4) + '</div><div class="s-d52d0d">0-1 scale</div></div>';
    steps += '<div class="s-d57999"><div class="s-033765">H(X) (Uncertainty in X)</div><div class="s-23ee8e">' + entropyX.toFixed(4) + ' bits</div></div>';
    steps += '<div class="s-d57999"><div class="s-033765">H(Y) (Uncertainty in Y)</div><div class="s-23ee8e">' + entropyY.toFixed(4) + ' bits</div></div></div>';
    
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
        const numBins = Math.max(2, Math.min(50, parseInt(document.getElementById("mutualInfoBins").value) || 10));
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
