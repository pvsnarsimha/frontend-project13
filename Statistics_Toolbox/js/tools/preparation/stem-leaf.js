/* StemLeaf: stemleaf tool (render, compute, setup) */

function renderStemLeafInterface() {
    return buildInterface({
        title: "🌿 Stem-and-Leaf Plot with Scatter Visualization",
        formula: "📌 Stem = Leading digit(s) | Leaf = Trailing digit",
        desc: "Displays data distribution by splitting each value into a stem (leading digit) and leaf (trailing digit). Includes scatter plot visualization of original values vs leaf values.",
        inputs: [
            {
                label: "📋 Enter numeric values:",
                textarea: { id: "stemleafInput", rows: "4", placeholder: "Example: 3, 3, 4, 4, 4, 11" }
            }
        ],
        run: { id: "stemleafComputeBtn", text: "🌿 Generate Stem-and-Leaf Plot" },
        clear: { id: "stemleafClearBtn", text: "Clear" },
        result: {
            area: "stemleafResultArea",
            label: "🎯 STEM-AND-LEAF PLOT",
            value: "stemleafValueDisplay",
            steps: "stemleafStepsDisplay"
        }
    });
}

function computeStemLeafWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    const minVal = Math.min(...sorted);
    const maxVal = Math.max(...sorted);
    const range = maxVal - minVal;
    const mean = sorted.reduce((a,b) => a+b, 0) / n;
    // Shape verdict from the adjusted Fisher-Pearson skewness (same formula as the Skewness tool), not from stem sizes
    let shapeLabel = 'not enough data to judge (needs at least 3 distinct values)';
    const g = sampleSkewness(sorted);
    if (g !== null) {
        shapeLabel = Math.abs(g) < 0.5 ? `approximately symmetric (skewness = ${g.toFixed(2)})`
            : `${g > 0 ? 'right' : 'left'}-skewed (skewness = ${g.toFixed(2)})`;
    }
    
    const hasDecimals = sorted.some(v => !Number.isInteger(v));
    // Intelligent stem unit detection
    let stemUnit = 1;
    let leafDigits = 1;
    let unitName = "units";
    let stemFormula = "";
    
    if (range >= 1000) {
        stemUnit = 100;
        leafDigits = 2;
        unitName = "hundreds";
        stemFormula = `Stem = floor(value / 100), Leaf = value - 100 × stem (two digits, so the units digit is kept)`;
    } else if (range >= 100) {
        stemUnit = 10;
        leafDigits = 1;
        unitName = "tens";
        stemFormula = `Stem = floor(value / 10), Leaf = units digit.${hasDecimals ? ' Decimals are cut off, not rounded.' : ''}`;
    } else if (range < 1 || (hasDecimals && range < 30)) {
        // Decimal data with a modest range keeps its tenths digit: 12.7 is stem 12, leaf 7 (not 12.3 and 12.7 both shown as "2")
        stemUnit = 0.1;
        leafDigits = 1;
        unitName = "tenths";
        stemFormula = `Stem = floor(value), Leaf = round((value - stem) × 10) (the tenths digit)`;
    } else {
        stemUnit = 1;
        leafDigits = 1;
        unitName = "units";
        stemFormula = `Stem = floor(value / 10), Leaf = units digit.${hasDecimals ? ' Decimals are cut off, not rounded.' : ''}`;
    }
    
    // Build stem-and-leaf plot
    const stemMap = new Map();
    const calculationDetails = [];
    const scatterData = []; // For chart visualization
    
    for (let i = 0; i < sorted.length; i++) {
        let val = sorted[i];
        let stem, leaf;
        
        // leaf = value - stem × unit, so stem and leaf always rebuild the value (also for negatives, where % would not)
        if (stemUnit === 100) {
            stem = Math.floor(val / 100);
            leaf = Math.floor(val - stem * 100);
        } else if (stemUnit === 10) {
            stem = Math.floor(val / 10);
            leaf = Math.floor(val - stem * 10);
        } else if (stemUnit === 0.1) {
            const tenths = Math.round(val * 10);      // rounded to the tenth first, so a leaf can never be 10
            stem = Math.floor(tenths / 10);
            leaf = tenths - stem * 10;
        } else {
            stem = Math.floor(val / 10);
            leaf = Math.floor(val - stem * 10);
        }
        
        calculationDetails.push({
            index: i + 1,
            original: val,
            stem: stem,
            leaf: leaf,
            formula: `${val} → Stem = ${stem}, Leaf = ${leaf}`
        });
        
        // For scatter plot: X = original value, Y = leaf value
        scatterData.push({ x: val, y: leaf, stem: stem });
        
        if (!stemMap.has(stem)) stemMap.set(stem, []);
        stemMap.get(stem).push(leaf);
    }
    
    const stems = [...stemMap.keys()].sort((a, b) => a - b);
    
    // Calculate depth
    let depths = [];
    let runningTotal = 0;
    for (let i = 0; i < stems.length; i++) {
        const leafCount = stemMap.get(stems[i]).length;
        runningTotal += leafCount;
        depths.push(runningTotal);
    }
    
    // Build ASCII stem-and-leaf display
    let plotLines = [];
    plotLines.push('╔══════════════════════════════════════════════════════════════════════════════╗');
    plotLines.push('║                         📊 STEM-AND-LEAF PLOT                                ║');
    plotLines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
    plotLines.push('║  Depth  │  Stem  │  Leaves (sorted)                                          ║');
    plotLines.push('╠══════════════════════════════════════════════════════════════════════════════╣');
    
    for (let i = 0; i < stems.length; i++) {
        const stem = stems[i];
        const leaves = stemMap.get(stem).sort((a, b) => a - b);
        const leafStr = leaves.map(l => String(l).padStart(leafDigits, '0')).join(' ');
        const depth = depths[i];
        const depthStr = depth.toString().padStart(5, ' ');
        const stemStr = stem.toString().padStart(4, ' ');
        const leafPadding = 50 - leafStr.length;
        const paddedLeaves = leafStr + ' '.repeat(Math.max(0, leafPadding));
        
        plotLines.push(`║  ${depthStr}  │  ${stemStr}  │  ${paddedLeaves}║`);
    }
    
    plotLines.push('╚══════════════════════════════════════════════════════════════════════════════╝');
    plotLines.push('');
    plotLines.push(leafDigits === 2 ? `Key: ${stems.length ? stems[0] : 0} | ${'05'} means ${stems.length ? stems[0] * 100 + 5 : 5} (stem = hundreds, leaf = last two digits)` : stemUnit === 0.1
        ? `Key: ${stems.length ? stems[0] : 0} | 7 means ${stems.length ? stems[0] : 0}.7 (stem = whole part, leaf = tenths digit)`
        : `Key: Stem represents the tens place | Leaf represents the units place`);
    plotLines.push(`Stem unit: ${unitName} (${stemFormula})`);
    plotLines.push(`Depth: Cumulative frequency from the nearest extreme`);
    
    const plotHtml = `
    <div class="s-0101f8 gen-pad">
        <div class="s-74360b gen-flex">
            <span class="s-b8a397 gen-big">🌿</span>
            <div>
                <h3 class="s-0a404f">STEM-AND-LEAF DISPLAY</h3>
                <p class="s-37a758">n = ${n} | Range: ${minVal} – ${maxVal} | Mean: ${mean.toFixed(4)}</p>
            </div>
        </div>
        
        <div class="s-2cf239">
            <pre class="s-c81510 gen-pad">
${plotLines.join('\n')}
            </pre>
        </div>
        
        <!-- Scatter Plot Visualization -->
        <div class="s-413a3e gen-pad">
            <div class="s-948514 gen-flex">
                <span class="s-ea3eb7">📈</span>
                <h4 class="s-fd2e58">Scatter Plot: Original Data vs Leaf Values</h4>
            </div>
            <div class="s-d1f4df">
                X-axis: Original data values | Y-axis: Leaf values (each point represents one observation)
            </div>
            <canvas class="s-0cc923 gen-sized" id="stemLeafScatterChart"></canvas>
        </div>
    </div>`;
    
    // Build calculation table
    let calcTable = `
    <div class="s-24483d">
        <table class="s-306b2c gen-sized">
            <thead>
                <tr class="s-2d88ce">
                    <th class="s-16aba4">Index (i)</th>
                    <th class="s-16aba4">Original Value (xᵢ)</th>
                    <th class="s-16aba4">Stem Calculation</th>
                    <th class="s-16aba4">Stem</th>
                    <th class="s-16aba4">Leaf</th>
                    <th class="s-16aba4">Final Representation</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let detail of calculationDetails) {
        calcTable += `
            <tr class="s-00049c">
                <td class="s-6e1b96">${detail.index}</td>
                <td class="s-4097f1">${detail.original}</td>
                <td class="s-41aade">${detail.formula}</td>
                <td class="s-3b92a8">${detail.stem}</td>
                <td class="s-7e5db6">${detail.leaf}</td>
                <td class="s-1d6537">${detail.stem} | ${detail.leaf} → ${detail.stem}${detail.leaf}</td>
            </tr>`;
    }
    
    calcTable += `
            </tbody>
        </table>
    </div>`;
    
    // Store scatter data for chart rendering
    const scatterDataPoints = scatterData;
    
    let steps = `
<div class="s-3097a8">
    <!-- Header Card -->
    <div class="s-6d8291 gen-pad">
        <div class="s-b15718 gen-flex">
            <div>
                <h1 class="s-b80b8c">🌿 Stem-and-Leaf Plot</h1>
                <p class="s-259079">A complete step-by-step analysis of data distribution</p>
            </div>
            <div class="s-0c68a3">
                <div class="s-7ce57c">SAMPLE SIZE</div>
                <div class="s-e35605 gen-big">${n}</div>
            </div>
        </div>
    </div>
    
    <!-- Step 1: Data Summary Card -->
    <div class="s-bfd155 gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-ed7f21 gen-sized">1</span>
            📋 Data Summary & Descriptive Statistics
        </h2>
        
        <div class="s-f127a4 gen-grid">
            <div class="s-64b6dd">
                <div class="s-033765">Sample Size (n)</div>
                <div class="s-abfdfd gen-big">${n}</div>
            </div>
            <div class="s-64b6dd">
                <div class="s-033765">Minimum (Min)</div>
                <div class="s-c2434f">${minVal}</div>
            </div>
            <div class="s-64b6dd">
                <div class="s-033765">Maximum (Max)</div>
                <div class="s-c2434f">${maxVal}</div>
            </div>
            <div class="s-64b6dd">
                <div class="s-033765">Range (R)</div>
                <div class="s-c2434f">${range.toFixed(4)}</div>
            </div>
            <div class="s-64b6dd">
                <div class="s-033765">Mean (x̄)</div>
                <div class="s-9d1896">${mean.toFixed(4)}</div>
            </div>
        </div>
        
        <div class="s-694182">
            <strong>📌 Sorted Data:</strong> <code class="s-f47f5a">[${sorted.join(', ')}]</code>
        </div>
    </div>
    
    <!-- Step 2: Stem Unit Determination -->
    <div class="s-95d04a gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-ed7f21 gen-sized">2</span>
            🔢 Stem Unit Determination
        </h2>
        
        <div class="s-6fab3a gen-pad">
            <div class="s-87555e gen-grid">
                <div>
                    <strong>📐 Rule used:</strong>
                    <div class="s-ab1ee9">
                        Range ≥ 1000 → stems are hundreds, two-digit leaves<br>
                        Range ≥ 100 → stems are tens<br>
                        Range &lt; 1, or decimal data with Range &lt; 30 → stems are whole numbers, leaves are tenths<br>
                        otherwise → stems are tens, leaves are the units digit
                    </div>
                </div>
                <div>
                    <strong>🔢 Calculation:</strong>
                    <div class="s-ab1ee9">
                        Range = ${maxVal} - ${minVal} = ${range.toFixed(2)}${hasDecimals ? ' (decimal data)' : ''}<br>
                        → <strong class="s-f342b5">${unitName}</strong>: ${stemFormula}
                    </div>
                </div>
            </div>
            
            <div class="s-f4f7ef">
                <strong>✅ Selected Stem Unit:</strong> ${stemUnit} (${unitName})<br>
                <strong>📖 Interpretation:</strong> Each stem represents ${stemUnit} ${unitName}, and each leaf represents the next digit.
            </div>
        </div>
    </div>
    
    <!-- Step 3: Stem and Leaf Calculation Table -->
    <div class="s-bfd155 gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-ed7f21 gen-sized">3</span>
            📐 Stem & Leaf Calculation (Step-by-Step)
        </h2>
        ${calcTable}
        
        <div class="s-e57b74">
            <strong>💡 Understanding the Transformation:</strong><br>
            Each original value is split into two parts:<br>
            • <strong>Stem</strong> = The leading digit(s) representing the larger unit<br>
            • <strong>Leaf</strong> = The trailing digit(s) representing the finer detail<br>
            • <strong>Formula:</strong> ${stemFormula}
        </div>
    </div>
    
    <!-- Step 4: Final Stem-and-Leaf Plot with Scatter Visualization -->
    ${plotHtml}
    
    <!-- Step 5: Interpretation Guide -->
    <div class="s-284793 gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-ed7f21 gen-sized">4</span>
            📖 How to Read This Plot
        </h2>
        
        <div class="s-91e6a8 gen-grid">
            <div class="s-6fdce2">
                <strong>🔍 Step 1 - Locate the Stem</strong><br>
                Find the stem value in the left column. This represents the tens/hundreds place.
            </div>
            <div class="s-6fdce2">
                <strong>📊 Step 2 - Read the Leaves</strong><br>
                The leaves to the right are the units digits. Read them in order.
            </div>
            <div class="s-6fdce2">
                <strong>📈 Step 3 - Scatter Plot</strong><br>
                The chart below shows each data point: X = original value, Y = leaf value.
            </div>
        </div>
        
        <div class="s-d17639">
            <strong>🎯 Key Insights from this Plot:</strong><br>
            • Distribution shape: ${shapeLabel}<br>
            • Most frequent stem: ${stems.reduce((a,b) => stemMap.get(a).length > stemMap.get(b).length ? a : b)} (${Math.max(...stems.map(s => stemMap.get(s).length))} observations)<br>
            • Data spread: ${minVal} to ${maxVal} (Range: ${range.toFixed(2)})<br>
            • Center tendency: Mean = ${mean.toFixed(4)} | Median = ${quantileType7(sorted, 0.5).toFixed(4)}
        </div>
    </div>
</div>`;
    
    return { steps, stems, stemMap, scatterData: scatterDataPoints };
}

function renderStemLeafScatterChart(scatterData, numbers) {
    if (!chartJsReady(renderStemLeafScatterChart, arguments)) return;
    const canvas = document.getElementById('stemLeafScatterChart');
    if (!canvas) return;
    labelChart(canvas, `Scatter plot of the stem-and-leaf display for ${describeSample(numbers)}: each point is one value, plotted with its leaf digit.`);
    
    if (stemLeafChart) stemLeafChart.destroy();
    
    const ctx = canvas.getContext('2d');
    const sortedData = [...scatterData].sort((a, b) => a.x - b.x);
    
    stemLeafChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Data Points (Original Value, Leaf)',
                data: sortedData.map(d => ({ x: d.x, y: d.y })),
                backgroundColor: 'rgba(79, 195, 247, 0.8)',
                borderColor: '#4fc3f7',
                borderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 12,
                pointStyle: 'circle',
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Stem-and-Leaf Scatter Plot (n = ${numbers.length})`,
                    font: { size: 14, weight: 'bold', family: "'Segoe UI', sans-serif" },
                    color: '#1a5490'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return [
                                `Original Value: ${context.parsed.x}`,
                                `Leaf Value: ${context.parsed.y}`,
                                `Stem: ${context.raw.stem} | Leaf: ${context.raw.y}`
                            ];
                        }
                    },
                    backgroundColor: '#1a5490',
                    titleColor: 'white',
                    bodyColor: 'white'
                },
                legend: { position: 'top', labels: { font: { size: 11 } } }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Original Data Values (X-axis)',
                        font: { weight: 'bold', size: 12 }
                    },
                    grid: { color: '#e9ecef' },
                    ticks: { stepSize: 1, autoSkip: true }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Leaf Values (Y-axis)',
                        font: { weight: 'bold', size: 12 }
                    },
                    grid: { color: '#e9ecef' },
                    ticks: { stepSize: 1, precision: 0 },
                    min: 0,
                    max: Math.max(10, ...sortedData.map(d => d.y + 1))      // two-digit leaves (stems in hundreds) reach 99
                }
            },
            animation: { duration: 800, easing: 'easeOutQuart' }
        }
    });
}

function setupStemLeafLogic() {
    const computeBtn = document.getElementById("stemleafComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("stemleafInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("stemleafResultArea");
        const valueSpan = document.getElementById("stemleafValueDisplay");
        const stepsSpan = document.getElementById("stemleafStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter numbers to generate stem-and-leaf plot.");
            return;
        }
        
        const result = computeStemLeafWithSteps(numbers);
        resultDiv.style.display = "block";
        setHtml(valueSpan, `🌿 ${numbers.length} values | Range: ${Math.min(...numbers)} - ${Math.max(...numbers)} | Mean: ${(numbers.reduce((a,b)=>a+b,0)/numbers.length).toFixed(4)}`);
        setHtml(stepsSpan, result.steps);
        
        // Render the scatter chart
        setTimeout(() => {
            renderStemLeafScatterChart(result.scatterData, numbers);
        }, 100);
    });
    
    attachClearHandler("stemleafClearBtn", "stemleafInput", "stemleafResultArea");
}
