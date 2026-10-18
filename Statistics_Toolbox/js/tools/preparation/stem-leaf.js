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
            steps: "stemleafStepsDisplay",
            extra: ["<canvas id=\"stemLeafScatterChart\" style=\"max-height: 400px; width: 100%; margin-top: 20px;\"></canvas>"]
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
    
    // Intelligent stem unit detection
    let stemUnit = 1;
    let leafDigits = 1;
    let unitName = "units";
    let stemFormula = "";
    
    if (range >= 1000) {
        stemUnit = 100;
        leafDigits = 2;
        unitName = "hundreds";
        stemFormula = `Stem = floor(value / 100), Leaf = floor((value % 100) / 10)`;
    } else if (range >= 100) {
        stemUnit = 10;
        leafDigits = 1;
        unitName = "tens";
        stemFormula = `Stem = floor(value / 10), Leaf = value % 10`;
    } else if (range < 1) {
        stemUnit = 0.1;
        leafDigits = 1;
        unitName = "tenths";
        stemFormula = `Stem = floor(value), Leaf = round((value - stem) × 10)`;
    } else {
        stemUnit = 1;
        leafDigits = 1;
        unitName = "units";
        stemFormula = `Stem = floor(value / 10), Leaf = value % 10`;
    }
    
    // Build stem-and-leaf plot
    const stemMap = new Map();
    const calculationDetails = [];
    const scatterData = []; // For chart visualization
    
    for (let i = 0; i < sorted.length; i++) {
        let val = sorted[i];
        let stem, leaf;
        
        if (stemUnit === 100) {
            stem = Math.floor(val / 100);
            leaf = Math.floor((val % 100) / 10);
        } else if (stemUnit === 10) {
            stem = Math.floor(val / 10);
            leaf = Math.floor(val % 10);
        } else if (stemUnit === 0.1) {
            stem = Math.floor(val);
            leaf = Math.round((val - stem) * 10);
        } else {
            stem = Math.floor(val / 10);
            leaf = Math.floor(val % 10);
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
        const leafStr = leaves.join(' ');
        const depth = depths[i];
        const depthStr = depth.toString().padStart(5, ' ');
        const stemStr = stem.toString().padStart(4, ' ');
        const leafPadding = 50 - leafStr.length;
        const paddedLeaves = leafStr + ' '.repeat(Math.max(0, leafPadding));
        
        plotLines.push(`║  ${depthStr}  │  ${stemStr}  │  ${paddedLeaves}║`);
    }
    
    plotLines.push('╚══════════════════════════════════════════════════════════════════════════════╝');
    plotLines.push('');
    plotLines.push(`Key: Stem represents ${stemUnit}s place | Leaf represents units place`);
    plotLines.push(`Stem unit: ${unitName} (${stemFormula})`);
    plotLines.push(`Depth: Cumulative frequency from the nearest extreme`);
    
    const plotHtml = `
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%); border-radius: 20px; padding: 25px; margin-top: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #4fc3f7; padding-bottom: 15px;">
            <span style="font-size: 36px;">🌿</span>
            <div>
                <h3 style="margin: 0; color: #4fc3f7; font-family: 'Courier New', monospace;">STEM-AND-LEAF DISPLAY</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #b39ddb;">n = ${n} | Range: ${minVal} – ${maxVal} | Mean: ${mean.toFixed(4)}</p>
            </div>
        </div>
        
        <div style="font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6; overflow-x: auto;">
            <pre style="background: #0d1117; padding: 20px; border-radius: 12px; color: #e6edf3; margin: 0; white-space: pre-wrap; word-wrap: break-word;">
${plotLines.join('\n')}
            </pre>
        </div>
        
        <!-- Scatter Plot Visualization -->
        <div style="margin-top: 30px; padding: 20px; background: #0d1117; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <span style="font-size: 20px;">📈</span>
                <h4 style="margin: 0; color: #4fc3f7;">Scatter Plot: Original Data vs Leaf Values</h4>
            </div>
            <div style="font-size: 12px; color: #b39ddb; margin-bottom: 15px;">
                X-axis: Original data values | Y-axis: Leaf values (each point represents one observation)
            </div>
            <canvas id="stemLeafScatterChart" style="max-height: 400px; width: 100%;"></canvas>
        </div>
    </div>`;
    
    // Build calculation table
    let calcTable = `
    <div style="background: white; border-radius: 16px; margin: 25px 0; overflow-x: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
                <tr style="background: linear-gradient(135deg, #1a5490, #0d3b66); color: white;">
                    <th style="padding: 14px; text-align: center;">Index (i)</th>
                    <th style="padding: 14px; text-align: center;">Original Value (xᵢ)</th>
                    <th style="padding: 14px; text-align: center;">Stem Calculation</th>
                    <th style="padding: 14px; text-align: center;">Stem</th>
                    <th style="padding: 14px; text-align: center;">Leaf</th>
                    <th style="padding: 14px; text-align: center;">Final Representation</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let detail of calculationDetails) {
        calcTable += `
            <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 12px; text-align: center; font-weight: 500;">${detail.index}</td>
                <td style="padding: 12px; text-align: center; font-family: monospace; font-weight: 600;">${detail.original}</td>
                <td style="padding: 12px; font-family: monospace; font-size: 11px; color: #6c757d;">${detail.formula}</td>
                <td style="padding: 12px; text-align: center; background: #e8f4f8; font-weight: 700;">${detail.stem}</td>
                <td style="padding: 12px; text-align: center; background: #fff3cd; font-weight: 700;">${detail.leaf}</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">${detail.stem} | ${detail.leaf} → ${detail.stem}${detail.leaf}</td>
            </tr>`;
    }
    
    calcTable += `
            </tbody>
        </table>
    </div>`;
    
    // Store scatter data for chart rendering
    const scatterDataPoints = scatterData;
    
    let steps = `
<div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
    <!-- Header Card -->
    <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <h1 style="margin: 0; font-size: 28px;">🌿 Stem-and-Leaf Plot</h1>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">A complete step-by-step analysis of data distribution</p>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 12px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.8;">SAMPLE SIZE</div>
                <div style="font-size: 32px; font-weight: 700;">${n}</div>
            </div>
        </div>
    </div>
    
    <!-- Step 1: Data Summary Card -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px;">1</span>
            📋 Data Summary & Descriptive Statistics
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 11px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 11px; color: #6c757d;">Minimum (Min)</div>
                <div style="font-size: 24px; font-weight: 700;">${minVal}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 11px; color: #6c757d;">Maximum (Max)</div>
                <div style="font-size: 24px; font-weight: 700;">${maxVal}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 11px; color: #6c757d;">Range (R)</div>
                <div style="font-size: 24px; font-weight: 700;">${range.toFixed(4)}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 11px; color: #6c757d;">Mean (x̄)</div>
                <div style="font-size: 20px; font-weight: 700;">${mean.toFixed(4)}</div>
            </div>
        </div>
        
        <div style="background: #e8f4f8; border-radius: 10px; padding: 15px;">
            <strong>📌 Sorted Data:</strong> <code style="background: white; padding: 4px 8px; border-radius: 6px;">[${sorted.join(', ')}]</code>
        </div>
    </div>
    
    <!-- Step 2: Stem Unit Determination -->
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px;">2</span>
            🔢 Stem Unit Determination
        </h2>
        
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <strong>📐 Formula:</strong>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-family: monospace;">
                        Stem Unit = 10<sup>⌊log₁₀(Range)⌋</sup>
                    </div>
                </div>
                <div>
                    <strong>🔢 Calculation:</strong>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-family: monospace;">
                        log₁₀(${range.toFixed(2)}) = ${Math.log10(range).toFixed(2)}<br>
                        ⌊${Math.log10(range).toFixed(2)}⌋ = ${Math.floor(Math.log10(range))}<br>
                        Stem Unit = 10<sup>${Math.floor(Math.log10(range))}</sup> = <strong style="color: #1a5490;">${stemUnit}</strong>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px; background: #d4edda; padding: 15px; border-radius: 10px;">
                <strong>✅ Selected Stem Unit:</strong> ${stemUnit} (${unitName})<br>
                <strong>📖 Interpretation:</strong> Each stem represents ${stemUnit} ${unitName}, and each leaf represents the next digit.
            </div>
        </div>
    </div>
    
    <!-- Step 3: Stem and Leaf Calculation Table -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px;">3</span>
            📐 Stem & Leaf Calculation (Step-by-Step)
        </h2>
        ${calcTable}
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin-top: 15px;">
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
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px;">4</span>
            📖 How to Read This Plot
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>🔍 Step 1 - Locate the Stem</strong><br>
                Find the stem value in the left column. This represents the tens/hundreds place.
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>📊 Step 2 - Read the Leaves</strong><br>
                The leaves to the right are the units digits. Read them in order.
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>📈 Step 3 - Scatter Plot</strong><br>
                The chart below shows each data point: X = original value, Y = leaf value.
            </div>
        </div>
        
        <div style="margin-top: 20px; background: #1a5490; color: white; border-radius: 12px; padding: 15px; text-align: center;">
            <strong>🎯 Key Insights from this Plot:</strong><br>
            • Distribution shape: ${Math.max(...stems.map(s => stemMap.get(s).length)) > n/2 ? 'Skewed' : 'Approximately symmetric'}<br>
            • Most frequent stem: ${stems.reduce((a,b) => stemMap.get(a).length > stemMap.get(b).length ? a : b)} (${Math.max(...stems.map(s => stemMap.get(s).length))} observations)<br>
            • Data spread: ${minVal} to ${maxVal} (Range: ${range.toFixed(2)})<br>
            • Center tendency: Mean = ${mean.toFixed(4)} | Median = ${sorted[Math.floor(n/2)].toFixed(4)}
        </div>
    </div>
</div>`;
    
    return { steps, stems, stemMap, scatterData: scatterDataPoints };
}

function renderStemLeafScatterChart(scatterData, numbers) {
    const canvas = document.getElementById('stemLeafScatterChart');
    if (!canvas) return;
    
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
                                `Stem: ${Math.floor(context.parsed.x / 10)} | Leaf: ${context.parsed.y}`
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
                    max: 10
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
