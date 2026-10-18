/* Stem-leaf, histogram, boxplot, violin, Q-Q/P-P, mutual information, McNemar, runs tests */
function renderStemLeafInterface() {
    return `
        <div class="stat-interface">
            <div class="interface-title">🌿 Stem-and-Leaf Plot with Scatter Visualization</div>
            <div class="formula-card">
                <div class="formula">📌 Stem = Leading digit(s) | Leaf = Trailing digit</div>
                <div class="desc">Displays data distribution by splitting each value into a stem (leading digit) and leaf (trailing digit). Includes scatter plot visualization of original values vs leaf values.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values:</label>
                <textarea id="stemleafInput" rows="4" placeholder="Example: 3, 3, 4, 4, 4, 11"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="stemleafComputeBtn">🌿 Generate Stem-and-Leaf Plot</button>
                    <button class="secondary-btn" id="stemleafClearBtn">Clear</button>
                </div>
            </div>
            <div id="stemleafResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 STEM-AND-LEAF PLOT</div>
                    <div class="result-value" id="stemleafValueDisplay">—</div>
                    <div class="calculation-steps" id="stemleafStepsDisplay"></div>
                </div>
                <canvas id="stemLeafScatterChart" style="max-height: 400px; width: 100%; margin-top: 20px;"></canvas>
            </div>
        </div>
    `;
}
function renderHistogramInterface() {
    return `
        <div class="stat-interface">
            <div class="interface-title">📊 Histogram with Professional Chart</div>
            <div class="formula-card">
                <div class="formula">📌 Bin Width = (Max - Min) / Number of Bins</div>
                <div class="desc">Shows the frequency distribution of data using bars. Choose number of bins or use optimal rules (Sturges, Freedman-Diaconis).</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values:</label>
                <textarea id="histogramInput" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33"></textarea>
                <label style="margin-top: 15px;">📊 Number of bins:</label>
                <input type="number" id="histogramBins" value="5" min="1" max="30" step="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                <div class="desc" style="font-size: 0.75rem;">💡 Tip: Sturges' rule suggests ${Math.ceil(Math.log2(10) + 1)} bins for 10 values | Freedman-Diaconis uses IQR</div>
                <div class="action-row">
                    <button class="primary-btn" id="histogramComputeBtn">📊 Generate Histogram + Chart</button>
                    <button class="secondary-btn" id="histogramClearBtn">Clear</button>
                </div>
            </div>
            <div id="histogramResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 HISTOGRAM</div>
                    <div class="result-value" id="histogramValueDisplay">—</div>
                    <div class="calculation-steps" id="histogramStepsDisplay"></div>
                </div>
                <canvas id="histogramChartCanvas" style="max-height: 400px; margin-top: 20px;"></canvas>
            </div>
        </div>
    `;
}

function renderBoxplotInterface() {
    return `
        <div class="stat-interface">
            <div class="interface-title">📦 Boxplot with Outlier Detection</div>
            <div class="formula-card">
                <div class="formula">📌 IQR = Q₃ - Q₁ | Outliers: x < Q₁ - 1.5×IQR or x > Q₃ + 1.5×IQR</div>
                <div class="desc">Displays the five-number summary (Min, Q1, Median, Q3, Max) and highlights outliers using the IQR rule.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values:</label>
                <textarea id="boxplotInput" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33, 100, 5"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="boxplotComputeBtn">📦 Generate Boxplot + Chart</button>
                    <button class="secondary-btn" id="boxplotClearBtn">Clear</button>
                </div>
            </div>
            <div id="boxplotResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 BOXPLOT</div>
                    <div class="result-value" id="boxplotValueDisplay">—</div>
                    <div class="calculation-steps" id="boxplotStepsDisplay"></div>
                </div>
                <canvas id="boxplotChartCanvas" style="max-height: 400px; margin-top: 20px;"></canvas>
            </div>
        </div>
    `;
}
// ========== STEM-AND-LEAF PLOT FUNCTIONS ==========
// ========== PROFESSIONAL STEM-AND-LEAF PLOT WITH SCATTER VISUALIZATION ==========
let stemLeafChart = null;

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
            stepsSpan.innerHTML = "Please enter numbers to generate stem-and-leaf plot.";
            return;
        }
        
        const result = computeStemLeafWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `🌿 ${numbers.length} values | Range: ${Math.min(...numbers)} - ${Math.max(...numbers)} | Mean: ${(numbers.reduce((a,b)=>a+b,0)/numbers.length).toFixed(4)}`;
        stepsSpan.innerHTML = result.steps;
        
        // Render the scatter chart
        setTimeout(() => {
            renderStemLeafScatterChart(result.scatterData, numbers);
        }, 100);
    });
    
    attachClearHandler("stemleafClearBtn", "stemleafInput", "stemleafResultArea");
}
// ========== PROFESSIONAL HISTOGRAM FUNCTIONS ==========
// Global chart instance
let histogramChart = null;

function computeHistogramWithSteps(numbers, numBins) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const n = numbers.length;
    const minVal = Math.min(...numbers);
    const maxVal = Math.max(...numbers);
    const range = maxVal - minVal;
    
    // Calculate optimal bin width using Sturges' rule
    const sturgesBins = Math.ceil(Math.log2(n) + 1);
    const sturgesWidth = range / sturgesBins;
    
    // Calculate optimal bin width using Freedman-Diaconis rule
    const sorted = [...numbers].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const fdWidth = 2 * iqr / Math.pow(n, 1/3);
    const fdBins = Math.ceil(range / fdWidth);
    
    // Calculate bin width
    const binWidth = range / numBins;
    
    // Create bins with detailed calculations
    let bins = Array(numBins).fill(0);
    let binLabels = [];
    let binRanges = [];
    let binCalculations = [];
    
    for (let i = 0; i < numBins; i++) {
        let lower = minVal + (i * binWidth);
        let upper = (i === numBins - 1) ? maxVal : lower + binWidth;
        binRanges.push({ lower, upper, width: binWidth });
        binLabels.push(`${lower.toFixed(4)} – ${upper.toFixed(4)}`);
        
        let count = 0;
        let valuesInBin = [];
        
        for (let val of numbers) {
            if (i === numBins - 1) {
                if (val >= lower && val <= upper) {
                    count++;
                    valuesInBin.push(val);
                }
            } else {
                if (val >= lower && val < upper) {
                    count++;
                    valuesInBin.push(val);
                }
            }
        }
        bins[i] = count;
        binCalculations.push(`Bin ${i+1}: [${lower.toFixed(4)}, ${upper.toFixed(4)}) → ${count} values → ${valuesInBin.join(', ')}`);
    }
    
    // Calculate statistics
    const frequencies = bins;
    const relativeFreq = bins.map(f => (f / n * 100).toFixed(2));
    const cumulativeFreq = [];
    let cumSum = 0;
    for (let f of bins) {
        cumSum += f;
        cumulativeFreq.push(cumSum);
    }
    const density = bins.map(f => (f / (n * binWidth)).toFixed(6));
    
    // Build histogram table
    let tableHtml = '<div style="overflow-x: auto; margin: 20px 0;">';
    tableHtml += '<table style="width: 100%; border-collapse: collapse; font-size: 13px; background: white; border-radius: 12px; overflow: hidden;">';
    tableHtml += '<thead><tr style="background: linear-gradient(135deg, #1a5490, #0d3b66); color: white;">';
    tableHtml += '<th style="padding: 12px;">Bin #</th><th style="padding: 12px;">Bin Range</th><th style="padding: 12px;">Frequency (f)</th>';
    tableHtml += '<th style="padding: 12px;">Relative Freq (%)</th><th style="padding: 12px;">Cumulative Freq</th><th style="padding: 12px;">Density</th>';
    tableHtml += '</tr></thead><tbody>';
    
    for (let i = 0; i < numBins; i++) {
        const rowBg = i % 2 === 0 ? '#f8f9fa' : 'white';
        tableHtml += `<tr style="border-bottom: 1px solid #e9ecef; background: ${rowBg};">`;
        tableHtml += `<td style="padding: 10px; text-align: center; font-weight: bold;">${i+1}</td>`;
        tableHtml += `<td style="padding: 10px;">${binLabels[i]}</td>`;
        tableHtml += `<td style="padding: 10px; text-align: center; font-weight: bold; color: #1a5490;">${bins[i]}</td>`;
        tableHtml += `<td style="padding: 10px; text-align: center;">${relativeFreq[i]}%</td>`;
        tableHtml += `<td style="padding: 10px; text-align: center;">${cumulativeFreq[i]}</td>`;
        tableHtml += `<td style="padding: 10px; text-align: center;">${density[i]}</td>`;
        tableHtml += `</tr>`;
    }
    tableHtml += '</tbody></table></div>';
    
    // Calculate bin width formulas explanation
    let steps = `📊 HISTOGRAM - DETAILED ANALYSIS\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `📋 STEP 1: Data Summary\n`;
    steps += `   Sample size (n) = ${n}\n`;
    steps += `   Minimum value = ${minVal.toFixed(6)}\n`;
    steps += `   Maximum value = ${maxVal.toFixed(6)}\n`;
    steps += `   Range = ${range.toFixed(6)}\n\n`;
    
    steps += `📐 STEP 2: Bin Width Calculation - Formula\n`;
    steps += `   Bin Width = (Maximum - Minimum) / Number of Bins\n`;
    steps += `   Bin Width = (${maxVal.toFixed(6)} - ${minVal.toFixed(6)}) / ${numBins}\n`;
    steps += `   Bin Width = ${range.toFixed(6)} / ${numBins} = <strong style="color: #1a5490;">${binWidth.toFixed(6)}</strong>\n\n`;
    
    steps += `📊 STEP 3: Optimal Bin Width Recommendations\n`;
    steps += `   • Sturges' Rule: k = ⌈log₂(n) + 1⌉ = ⌈log₂(${n}) + 1⌉ = ${sturgesBins} bins → width = ${sturgesWidth.toFixed(6)}\n`;
    steps += `   • Freedman-Diaconis Rule: bin width = 2 × IQR / n^(1/3) = 2 × ${iqr.toFixed(4)} / ${Math.pow(n, 1/3).toFixed(4)} = ${fdWidth.toFixed(6)} → ${fdBins} bins\n`;
    steps += `   • Your selection: ${numBins} bins → width = ${binWidth.toFixed(6)}\n\n`;
    
    steps += `🔢 STEP 4: Bin Construction\n`;
    steps += `   Each bin has equal width. Values are assigned to bins based on their value.\n`;
    steps += `   ${binCalculations.join('\n   ')}\n\n`;
    
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 FREQUENCY DISTRIBUTION TABLE\n`;
    steps += tableHtml;
    
    steps += `\n📌 STATISTICAL SUMMARY:\n`;
    steps += `   • Mean of data = ${(numbers.reduce((a,b)=>a+b,0)/n).toFixed(6)}\n`;
    steps += `   • Median = ${sorted[Math.floor(n/2)].toFixed(6)}\n`;
    steps += `   • Mode = ${getMode(numbers)}\n`;
    steps += `   • Variance = ${(numbers.reduce((a,b)=>a+Math.pow(b - (numbers.reduce((a,b)=>a+b,0)/n),2),0)/n).toFixed(6)}\n`;
    
    return { steps, bins, binLabels, binWidth, binRanges, frequencies: bins };
}

function getMode(numbers) {
    const freq = new Map();
    numbers.forEach(n => freq.set(n, (freq.get(n) || 0) + 1));
    let maxFreq = 0, modes = [];
    for (let [val, f] of freq) {
        if (f > maxFreq) { maxFreq = f; modes = [val]; }
        else if (f === maxFreq && f > 1) modes.push(val);
    }
    return maxFreq === 1 ? "No unique mode" : modes.join(', ');
}

function renderHistogramChart(bins, binLabels, numbers) {
    const canvas = document.getElementById('histogramChartCanvas');
    if (!canvas) return;
    
    if (histogramChart) histogramChart.destroy();
    
    const ctx = canvas.getContext('2d');
    histogramChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frequency',
                data: bins,
                backgroundColor: 'rgba(26, 84, 144, 0.7)',
                borderColor: 'rgba(26, 84, 144, 1)',
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.9,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Histogram of Data (n = ${numbers.length})`,
                    font: { size: 16, weight: 'bold', family: "'Inter', sans-serif" },
                    color: '#1a5490'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return [`Frequency: ${context.raw}`, `Percentage: ${((context.raw / numbers.length) * 100).toFixed(1)}%`];
                        }
                    },
                    backgroundColor: '#1a5490',
                    titleColor: 'white',
                    bodyColor: 'white'
                },
                legend: { position: 'top', labels: { font: { size: 12 } } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Frequency', font: { weight: 'bold', size: 12 } },
                    grid: { color: '#e9ecef' },
                    ticks: { stepSize: Math.ceil(Math.max(...bins) / 5), precision: 0 }
                },
                x: {
                    title: { display: true, text: 'Value Ranges (Bins)', font: { weight: 'bold', size: 12 } },
                    grid: { display: false },
                    ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 10 }
                }
            },
            animation: { duration: 1000, easing: 'easeOutQuart' }
        }
    });
}

function setupHistogramLogic() {
    const computeBtn = document.getElementById("histogramComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("histogramInput").value;
        const numbers = parseNumbersFromInput(raw);
        const numBins = parseInt(document.getElementById("histogramBins").value) || 5;
        const resultDiv = document.getElementById("histogramResultArea");
        const valueSpan = document.getElementById("histogramValueDisplay");
        const stepsSpan = document.getElementById("histogramStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter numbers to generate histogram.";
            return;
        }
        
        const result = computeHistogramWithSteps(numbers, numBins);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `📊 ${numBins} bins | ${numbers.length} values | Range: ${Math.min(...numbers).toFixed(2)} - ${Math.max(...numbers).toFixed(2)} | Width: ${result.binWidth.toFixed(4)}`;
        stepsSpan.innerHTML = result.steps;
        
        // Render the chart after a short delay to ensure DOM is ready
        setTimeout(() => {
            renderHistogramChart(result.bins, result.binLabels, numbers);
        }, 100);
    });
    
    attachClearHandler("histogramClearBtn", "histogramInput", "histogramResultArea");
}
// ========== PROFESSIONAL BOXPLOT USING CHART.JS WITH CUSTOM DRAWING ==========
let boxplotChartInstance = null;

// Custom plugin to draw boxplot elements with interactive tooltips
const boxplotPlugin = {
    id: 'boxplotPlugin',
    afterDatasetsDraw(chart) {
        const { ctx, scales } = chart;
        
        // Get the boxplot data from the chart config
        const boxplotData = chart.config.data.boxplotData;
        if (!boxplotData) return;
        
        const { q1, median, q3, whiskerMin, whiskerMax, outliers, minVal, maxVal } = boxplotData;
        
        // Calculate X position (center of the chart)
        const xAxis = scales.x;
        const xCenter = (xAxis.getPixelForValue(0) + xAxis.getPixelForValue(1)) / 2;
        
        // Box width
        const boxWidth = 100;
        const boxLeft = xCenter - boxWidth / 2;
        const boxRight = xCenter + boxWidth / 2;
        
        // Y positions
        const q1Y = scales.y.getPixelForValue(q1);
        const q3Y = scales.y.getPixelForValue(q3);
        const medianY = scales.y.getPixelForValue(median);
        const whiskerMinY = scales.y.getPixelForValue(whiskerMin);
        const whiskerMaxY = scales.y.getPixelForValue(whiskerMax);
        const minY = scales.y.getPixelForValue(minVal);
        const maxY = scales.y.getPixelForValue(maxVal);
        
        // Store interactive elements for tooltips
        chart.interactiveElements = [];
        
        ctx.save();
        
        // 1. Draw WHISKER LINES (store for tooltips)
        ctx.beginPath();
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 2.5;
        // Lower whisker
        ctx.moveTo(xCenter, whiskerMinY);
        ctx.lineTo(xCenter, q1Y);
        ctx.stroke();
        chart.interactiveElements.push({
            type: 'whisker',
            label: 'Lower Whisker',
            value: whiskerMin,
            y: whiskerMinY,
            color: '#81c784'
        });
        
        // Upper whisker
        ctx.beginPath();
        ctx.moveTo(xCenter, q3Y);
        ctx.lineTo(xCenter, whiskerMaxY);
        ctx.stroke();
        chart.interactiveElements.push({
            type: 'whisker',
            label: 'Upper Whisker',
            value: whiskerMax,
            y: whiskerMaxY,
            color: '#81c784'
        });
        
        // 2. Draw WHISKER CAPS
        ctx.beginPath();
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 2.5;
        const capWidth = 15;
        ctx.moveTo(xCenter - capWidth, whiskerMinY);
        ctx.lineTo(xCenter + capWidth, whiskerMinY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xCenter - capWidth, whiskerMaxY);
        ctx.lineTo(xCenter + capWidth, whiskerMaxY);
        ctx.stroke();
        
        // 3. Draw IQR BOX
        ctx.fillStyle = 'rgba(79, 195, 247, 0.25)';
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2.5;
        const boxHeight = q1Y - q3Y;
        if (boxHeight > 0) {
            ctx.fillRect(boxLeft, q3Y, boxWidth, boxHeight);
            ctx.strokeRect(boxLeft, q3Y, boxWidth, boxHeight);
            chart.interactiveElements.push({
                type: 'box',
                label: 'IQR Box',
                value: `${q1.toFixed(4)} to ${q3.toFixed(4)}`,
                q1: q1,
                q3: q3,
                iqr: (q3 - q1).toFixed(4),
                color: '#4fc3f7'
            });
        }
        
        // 4. Draw MEDIAN LINE
        ctx.beginPath();
        ctx.strokeStyle = '#ffb74d';
        ctx.lineWidth = 4;
        ctx.moveTo(boxLeft, medianY);
        ctx.lineTo(boxRight, medianY);
        ctx.stroke();
        chart.interactiveElements.push({
            type: 'median',
            label: 'Median (Q₂)',
            value: median,
            y: medianY,
            color: '#ffb74d'
        });
        
        // 5. Draw Q1 horizontal reference line
        ctx.beginPath();
        ctx.strokeStyle = '#17a2b8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.moveTo(boxLeft - 20, q1Y);
        ctx.lineTo(boxRight + 20, q1Y);
        ctx.stroke();
        ctx.setLineDash([]);
        chart.interactiveElements.push({
            type: 'q1',
            label: 'Q₁ (25th Percentile)',
            value: q1,
            y: q1Y,
            color: '#17a2b8'
        });
        
        // 6. Draw Q3 horizontal reference line
        ctx.beginPath();
        ctx.strokeStyle = '#17a2b8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.moveTo(boxLeft - 20, q3Y);
        ctx.lineTo(boxRight + 20, q3Y);
        ctx.stroke();
        ctx.setLineDash([]);
        chart.interactiveElements.push({
            type: 'q3',
            label: 'Q₃ (75th Percentile)',
            value: q3,
            y: q3Y,
            color: '#17a2b8'
        });
        
        // 7. Draw MIN and MAX points
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(xCenter, minY, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px "Segoe UI", Arial';
        ctx.fillText('Min', xCenter + 18, minY - 5);
        chart.interactiveElements.push({
            type: 'point',
            label: 'Minimum',
            value: minVal,
            x: xCenter,
            y: minY,
            color: '#28a745'
        });
        
        ctx.fillStyle = '#dc3545';
        ctx.beginPath();
        ctx.arc(xCenter, maxY, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText('Max', xCenter + 18, maxY + 5);
        chart.interactiveElements.push({
            type: 'point',
            label: 'Maximum',
            value: maxVal,
            x: xCenter,
            y: maxY,
            color: '#dc3545'
        });
        
        // 8. Draw OUTLIERS with better positioning
        if (outliers && outliers.length > 0) {
            for (let i = 0; i < outliers.length; i++) {
                const outlier = outliers[i];
                const outlierY = scales.y.getPixelForValue(outlier);
                const xOffset = (i - (outliers.length - 1) / 2) * 20;
                ctx.fillStyle = '#ef5350';
                ctx.beginPath();
                ctx.arc(xCenter + xOffset, outlierY, 9, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#c62828';
                ctx.beginPath();
                ctx.arc(xCenter + xOffset, outlierY, 5, 0, 2 * Math.PI);
                ctx.fill();
                chart.interactiveElements.push({
                    type: 'outlier',
                    label: 'Outlier',
                    value: outlier,
                    x: xCenter + xOffset,
                    y: outlierY,
                    color: '#ef5350'
                });
            }
        }
        
        // 9. Draw NON-OVERLAPPING LABELS with proper positioning
        ctx.font = 'bold 12px "Segoe UI", Arial';
        
        // Q1 Label - left side of box
// Q1 Label - RIGHT side of box (moved from left to right)
ctx.font = 'bold 12px "Segoe UI", Arial';
ctx.fillStyle = '#17a2b8';
ctx.fillText('Q₁', boxRight + 15, q1Y + 4);
ctx.font = '10px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(q1.toFixed(4), boxRight + 15, q1Y + 20);


        // Q3 Label - RIGHT side of box (moved from left to right)
ctx.font = 'bold 12px "Segoe UI", Arial';
ctx.fillStyle = '#17a2b8';
ctx.fillText('Q₃', boxRight + 15, q3Y + 4);
ctx.font = '10px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(q3.toFixed(4), boxRight + 15, q3Y + 20);

        
        // Median Label - right side of box
        ctx.font = 'bold 12px "Segoe UI", Arial';
        ctx.fillStyle = '#ffb74d';
        ctx.fillText('Median', boxRight + 20, medianY + 4);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#8b949e';
        ctx.fillText(median.toFixed(4), boxRight + 20, medianY + 20);
        
// Lower Whisker Label - move DOWN more (increase the negative offset)
ctx.font = 'bold 11px "Segoe UI", Arial';
ctx.fillStyle = '#81c784';
ctx.fillText('Lower Whisker', xCenter, whiskerMinY - 28);      // ← CHANGE: -15 to -28
ctx.font = '9px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(whiskerMin.toFixed(4), xCenter, whiskerMinY - 12); // ← CHANGE: -3 to -12

// Upper Whisker Label - move UP more (increase the positive offset)
ctx.fillStyle = '#81c784';
ctx.fillText('Upper Whisker', xCenter, whiskerMaxY + 38);       // ← CHANGE: +25 to +38
ctx.font = '9px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(whiskerMax.toFixed(4), xCenter, whiskerMaxY + 52);  // ← CHANGE: +38 to +52
        
        // IQR Box Label - above the box
        ctx.font = 'bold 11px "Segoe UI", Arial';
        ctx.fillStyle = '#4fc3f7';
ctx.fillText('IQR Box', xCenter + 50, q3Y - 15);  // ← Moved to the right
        ctx.font = '9px monospace';
        ctx.fillStyle = '#8b949e';
        ctx.fillText(`IQR = ${(q3 - q1).toFixed(4)}`, xCenter, q1Y + 28);
        
// Min Value Label - move further right
ctx.font = '9px monospace';
ctx.fillStyle = '#8b949e';
ctx.fillText(minVal.toFixed(4), xCenter + 35, minY + 12);  // ← 18 to 35

// Max Value Label - move further right
ctx.fillText(maxVal.toFixed(4), xCenter + 35, maxY - 8);   // ← 18 to 35
        
        // Outlier Label if any
        if (outliers && outliers.length > 0) {
            ctx.font = 'bold 10px "Segoe UI", Arial';
            ctx.fillStyle = '#ef5350';
            const maxOutlierY = Math.max(...outliers.map(o => scales.y.getPixelForValue(o)));
            ctx.fillText(`⚠️ ${outliers.length} Outlier(s)`, xCenter, maxOutlierY - 25);
        }
        
        ctx.restore();
    }
};

// Register the plugin
if (typeof Chart !== 'undefined') {
    Chart.register(boxplotPlugin);
}

// Custom tooltip handler for interactive elements
function setupCanvasTooltip(canvas, chart) {
    const tooltipDiv = document.createElement('div');
    tooltipDiv.style.position = 'absolute';
    tooltipDiv.style.background = '#1a5490';
    tooltipDiv.style.color = 'white';
    tooltipDiv.style.padding = '8px 16px';
    tooltipDiv.style.borderRadius = '8px';
    tooltipDiv.style.fontSize = '12px';
    tooltipDiv.style.fontFamily = 'monospace';
    tooltipDiv.style.pointerEvents = 'none';
    tooltipDiv.style.zIndex = '1000';
    tooltipDiv.style.display = 'none';
    tooltipDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    tooltipDiv.style.borderLeft = '4px solid';
    document.body.appendChild(tooltipDiv);
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        let found = null;
        const tolerance = 10;
        
        if (chart.interactiveElements) {
            for (let elem of chart.interactiveElements) {
                if (elem.type === 'whisker' || elem.type === 'median' || elem.type === 'q1' || elem.type === 'q3') {
                    const distance = Math.abs(mouseY - elem.y);
                    if (distance < tolerance) {
                        found = elem;
                        break;
                    }
                } else if (elem.type === 'point' || elem.type === 'outlier') {
                    const distance = Math.hypot(mouseX - elem.x, mouseY - elem.y);
                    if (distance < tolerance) {
                        found = elem;
                        break;
                    }
                } else if (elem.type === 'box') {
                    // Box detection handled differently
                }
            }
        }
        
        if (found) {
            let tooltipText = '';
            switch (found.type) {
                case 'whisker':
                    tooltipText = `${found.label}: ${found.value.toFixed(4)}`;
                    break;
                case 'median':
                    tooltipText = `📊 ${found.label}: ${found.value.toFixed(4)}`;
                    break;
                case 'q1':
                    tooltipText = `📉 ${found.label}: ${found.value.toFixed(4)} (25% of data ≤ this value)`;
                    break;
                case 'q3':
                    tooltipText = `📈 ${found.label}: ${found.value.toFixed(4)} (75% of data ≤ this value)`;
                    break;
                case 'point':
                    tooltipText = `${found.label}: ${found.value.toFixed(4)}`;
                    break;
                case 'outlier':
                    tooltipText = `⚠️ ${found.label}: ${found.value.toFixed(4)}`;
                    break;
            }
            tooltipDiv.innerHTML = tooltipText;
            tooltipDiv.style.display = 'block';
            tooltipDiv.style.borderLeftColor = found.color || '#4fc3f7';
            tooltipDiv.style.left = (e.clientX + 15) + 'px';
            tooltipDiv.style.top = (e.clientY - 35) + 'px';
        } else {
            tooltipDiv.style.display = 'none';
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        tooltipDiv.style.display = 'none';
    });
}

function computeBoxplotWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    const minVal = sorted[0];
    const maxVal = sorted[n - 1];
    const sum = numbers.reduce((a,b) => a+b, 0);
    const mean = sum / n;
    
    // Calculate quartiles
    const getMedian = (arr) => {
        const m = arr.length;
        if (m % 2 === 0) {
            const left = arr[m/2 - 1];
            const right = arr[m/2];
            return { value: (left + right) / 2, left, right, formula: `(${left} + ${right}) / 2 = ${(left + right) / 2}` };
        } else {
            const median = arr[Math.floor(m/2)];
            return { value: median, left: median, right: median, formula: `${median}` };
        }
    };
    
    let q1, q3;
    let lowerHalf, upperHalf;
    
    if (n % 2 === 0) {
        lowerHalf = sorted.slice(0, n/2);
        upperHalf = sorted.slice(n/2);
    } else {
        lowerHalf = sorted.slice(0, Math.floor(n/2));
        upperHalf = sorted.slice(Math.floor(n/2) + 1);
    }
    
    const q1Result = getMedian(lowerHalf);
    const q3Result = getMedian(upperHalf);
    q1 = q1Result.value;
    q3 = q3Result.value;
    
    const medianResult = getMedian(sorted);
    const median = medianResult.value;
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Identify outliers
    const outliers = numbers.filter(x => x < lowerBound || x > upperBound).sort((a,b) => a-b);
    const nonOutliers = numbers.filter(x => x >= lowerBound && x <= upperBound);
    const whiskerMin = nonOutliers.length > 0 ? Math.min(...nonOutliers) : q1;
    const whiskerMax = nonOutliers.length > 0 ? Math.max(...nonOutliers) : q3;
    
    // Calculate additional statistics
    const variance = numbers.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const skewness = numbers.reduce((a,b) => a + Math.pow((b - mean)/stdDev, 3), 0) / n;
    
    // Build quartile calculation table
    let quartileTable = `
    <div style="background: white; border-radius: 16px; margin: 20px 0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: linear-gradient(135deg, #1a5490, #0d3b66); color: white;">
                    <th style="padding: 14px; text-align: center;">Quartile</th>
                    <th style="padding: 14px; text-align: center;">Data Range</th>
                    <th style="padding: 14px; text-align: center;">Calculation</th>
                    <th style="padding: 14px; text-align: center;">Result</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #e9ecef;">
                    <td style="padding: 12px; font-weight: bold; text-align: center;">Q₁ (25th Percentile)</td>
                    <td style="padding: 12px;">Lower half: [${lowerHalf.join(', ')}]</td>
                    <td style="padding: 12px; font-family: monospace; text-align: center;">${q1Result.formula}</td>
                    <td style="padding: 12px; background: #e8f4f8; font-weight: bold; text-align: center;">${q1.toFixed(4)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                    <td style="padding: 12px; font-weight: bold; text-align: center;">Q₂ (Median)</td>
                    <td style="padding: 12px;">Full data: [${sorted.join(', ')}]</td>
                    <td style="padding: 12px; font-family: monospace; text-align: center;">${medianResult.formula}</td>
                    <td style="padding: 12px; background: #e8f4f8; font-weight: bold; text-align: center;">${median.toFixed(4)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                    <td style="padding: 12px; font-weight: bold; text-align: center;">Q₃ (75th Percentile)</td>
                    <td style="padding: 12px;">Upper half: [${upperHalf.join(', ')}]</td>
                    <td style="padding: 12px; font-family: monospace; text-align: center;">${q3Result.formula}</td>
                    <td style="padding: 12px; background: #e8f4f8; font-weight: bold; text-align: center;">${q3.toFixed(4)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build outlier detection table
    let outlierTable = `
    <div style="background: white; border-radius: 16px; margin: 20px 0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: linear-gradient(135deg, #dc3545, #a71d2a); color: white;">
                    <th style="padding: 14px; text-align: center;">#</th>
                    <th style="padding: 14px; text-align: center;">Value</th>
                    <th style="padding: 14px; text-align: center;">Comparison</th>
                    <th style="padding: 14px; text-align: center;">Status</th>
                </tr>
            </thead>
            <tbody>`;
    
    for (let idx = 0; idx < sorted.length; idx++) {
        let val = sorted[idx];
        let status = "";
        let comparison = "";
        let bgColor = "";
        if (val < lowerBound) {
            status = "🔴 OUTLIER (Below Lower Bound)";
            comparison = `${val} < ${lowerBound.toFixed(4)}`;
            bgColor = "#f8d7da";
        } else if (val > upperBound) {
            status = "🔴 OUTLIER (Above Upper Bound)";
            comparison = `${val} > ${upperBound.toFixed(4)}`;
            bgColor = "#f8d7da";
        } else {
            status = "✅ Normal";
            comparison = `${lowerBound.toFixed(4)} ≤ ${val} ≤ ${upperBound.toFixed(4)}`;
            bgColor = "#d4edda";
        }
        
        outlierTable += `
            <tr style="border-bottom: 1px solid #e9ecef; background: ${bgColor};">
                <td style="padding: 10px; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 10px; text-align: center; font-weight: bold;">${val}</td>
                <td style="padding: 10px; font-family: monospace; text-align: center;">${comparison}</td>
                <td style="padding: 10px;">${status}</td>
            </tr>`;
    }
    
    outlierTable += `
            </tbody>
        </table>
    </div>`;
    
    // Build Five-Number Summary Table
    let fiveNumTable = `
    <div style="background: white; border-radius: 16px; margin-bottom: 25px; border: 2px solid #1a5490; overflow-x: auto;">
        <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white; text-align: center;">📊 Five-Number Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #e9ecef;">
                    <th style="padding: 12px; text-align: center;">Statistic</th>
                    <th style="padding: 12px; text-align: center;">Value</th>
                    <th style="padding: 12px; text-align: center;">Interpretation</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Minimum (Min)</td>
                    <td style="text-align: center; font-weight: bold; color: #28a745;">${minVal}</td>
                    <td style="text-align: center;">Smallest value in dataset</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Q₁ (First Quartile)</td>
                    <td style="text-align: center; font-weight: bold;">${q1.toFixed(4)}</td>
                    <td style="text-align: center;">25% of data ≤ this value</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Median (Q₂)</td>
                    <td style="text-align: center; font-weight: bold; color: #ffc107;">${median.toFixed(4)}</td>
                    <td style="text-align: center;">50% of data ≤ this value</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Q₃ (Third Quartile)</td>
                    <td style="text-align: center; font-weight: bold;">${q3.toFixed(4)}</td>
                    <td style="text-align: center;">75% of data ≤ this value</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Maximum (Max)</td>
                    <td style="text-align: center; font-weight: bold; color: #dc3545;">${maxVal}</td>
                    <td style="text-align: center;">Largest value in dataset</td>
                </tr>
                <tr style="background: #f0f4fa;">
                    <td style="padding: 12px; font-weight: bold;">IQR (Interquartile Range)</td>
                    <td style="text-align: center; font-weight: bold; color: #1a5490;">${iqr.toFixed(4)}</td>
                    <td style="text-align: center;">Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build Whisker Table
    let whiskerTable = `
    <div style="background: white; border-radius: 16px; margin: 20px 0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin: 0; padding: 14px; background: #17a2b8; color: white; text-align: center;">📏 Whisker Calculations</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #e9ecef;">
                    <th style="padding: 12px; text-align: center;">Whisker</th>
                    <th style="padding: 12px; text-align: center;">Formula</th>
                    <th style="padding: 12px; text-align: center;">Value</th>
                    <th style="padding: 12px; text-align: center;">Interpretation</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Lower Whisker</td>
                    <td style="text-align: center; font-family: monospace;">Smallest value ≥ Q₁ - 1.5×IQR</td>
                    <td style="text-align: center; font-weight: bold; color: #28a745;">${whiskerMin.toFixed(4)}</td>
                    <td style="text-align: center;">Smallest non-outlier</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; font-weight: bold;">Upper Whisker</td>
                    <td style="text-align: center; font-family: monospace;">Largest value ≤ Q₃ + 1.5×IQR</td>
                    <td style="text-align: center; font-weight: bold; color: #dc3545;">${whiskerMax.toFixed(4)}</td>
                    <td style="text-align: center;">Largest non-outlier</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build complete steps HTML
    let steps = `
<div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 48px;">📦</span>
                    <div>
                        <h1 style="margin: 0; font-size: 28px;">Boxplot Analysis</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Five-Number Summary & Outlier Detection (1.5 × IQR Rule)</p>
                    </div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.8;">SAMPLE SIZE</div>
                <div style="font-size: 36px; font-weight: 700;">${n}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #28a745;">
            <div style="font-size: 11px; color: #6c757d;">MINIMUM</div>
            <div style="font-size: 24px; font-weight: 700; color: #28a745;">${minVal}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">Q₁</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${q1.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #ffc107;">
            <div style="font-size: 11px; color: #6c757d;">MEDIAN</div>
            <div style="font-size: 24px; font-weight: 700; color: #ffc107;">${median.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">Q₃</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${q3.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #dc3545;">
            <div style="font-size: 11px; color: #6c757d;">MAXIMUM</div>
            <div style="font-size: 24px; font-weight: 700; color: #dc3545;">${maxVal}</div>
        </div>
    </div>
    
    <!-- Step 1: Sort Data -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">1</span>
            📋 Sort the Data
        </h2>
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <p><strong>Original Data:</strong> [${numbers.join(', ')}]</p>
            <p><strong>Sorted Data:</strong> <code style="background: #e8f4f8; padding: 8px 12px; border-radius: 8px; display: inline-block;">[${sorted.join(', ')}]</code></p>
        </div>
    </div>
    
    <!-- Step 2: Quartiles -->
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">2</span>
            📐 Calculate Quartiles
        </h2>
        ${quartileTable}
    </div>
    
    <!-- Step 3: IQR and Boundaries -->
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">3</span>
            🔢 IQR & Outlier Boundaries
        </h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>IQR (Interquartile Range):</strong>
                <div style="font-family: monospace; font-size: 20px; margin: 15px 0; text-align: center;">
                    IQR = Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)} = <strong style="color: #1a5490;">${iqr.toFixed(4)}</strong>
                </div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px;">
                <strong>Outlier Boundaries (1.5 × IQR):</strong>
                <div style="margin: 15px 0;">
                    <div style="font-family: monospace; padding: 8px; background: #f8f9fa; border-radius: 6px;">Lower Bound = Q₁ - 1.5×IQR = ${q1.toFixed(4)} - 1.5×${iqr.toFixed(4)} = <strong style="color: #dc3545;">${lowerBound.toFixed(4)}</strong></div>
                    <div style="font-family: monospace; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-top: 10px;">Upper Bound = Q₃ + 1.5×IQR = ${q3.toFixed(4)} + 1.5×${iqr.toFixed(4)} = <strong style="color: #dc3545;">${upperBound.toFixed(4)}</strong></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Step 4: Outliers -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">4</span>
            🔍 Identify Outliers
        </h2>
        ${outlierTable}
    </div>
    
    <!-- Step 5: Five-Number Summary -->
    ${fiveNumTable}
    
    <!-- Step 6: Whiskers -->
    ${whiskerTable}
    
    <!-- Boxplot Visualization -->
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%); border-radius: 20px; padding: 25px; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #4fc3f7; padding-bottom: 15px;">
            <span style="font-size: 28px;">📊</span>
            <h3 style="margin: 0; color: #4fc3f7;">BOXPLOT VISUALIZATION</h3>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #b39ddb;">💡 Hover over any line or point to see its value</p>
        </div>
        
        <!-- Chart Canvas -->
        <canvas id="boxplotChartCanvas" style="max-height: 450px; width: 100%; margin-top: 10px;"></canvas>
        
        <div style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 20px; height: 20px; background: rgba(79, 195, 247, 0.3); border: 2px solid #4fc3f7;"></div><span style="color: #e6edf3; font-size: 11px;">IQR Box (Q₁ to Q₃)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 3px; background: #ffb74d;"></div><span style="color: #e6edf3; font-size: 11px;">Median Line (Q₂)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 2px; background: #81c784;"></div><span style="color: #e6edf3; font-size: 11px;">Whiskers</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #ef5350; border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">Outliers</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 2px; background: #81c784;"></div><span style="color: #e6edf3; font-size: 11px;">Whisker Caps</span></div>
        </div>
    </div>
    
    <!-- Interpretation -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 25px;">
        <h2 style="color: #1a5490; margin-top: 0;">📖 Final Interpretation</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Distribution Shape:</strong><br>
                • ${Math.abs(median - mean) < 0.1 * iqr ? 'Symmetric' : (median < mean ? 'Right-skewed' : 'Left-skewed')}<br>
                • IQR = ${iqr.toFixed(4)}<br>
                • Range = ${(maxVal - minVal).toFixed(4)}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Outliers:</strong><br>
                • ${outliers.length} outlier(s) detected<br>
                ${outliers.length > 0 ? `• Values: ${outliers.join(', ')}` : '• No outliers'}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Summary Stats:</strong><br>
                • Mean = ${mean.toFixed(4)}<br>
                • Median = ${median.toFixed(4)}<br>
                • Std Dev = ${stdDev.toFixed(4)}
            </div>
        </div>
    </div>
</div>`;
    
    return { steps, minVal, q1, median, q3, maxVal, iqr, lowerBound, upperBound, outliers, whiskerMin, whiskerMax, mean, stdDev, skewness };
}

// Render Boxplot Chart using Chart.js with Custom Plugin and Tooltips
function renderBoxplotChart(numbers, stats) {
    const canvas = document.getElementById('boxplotChartCanvas');
    if (!canvas) return;
    
    if (boxplotChartInstance) {
        boxplotChartInstance.destroy();
        boxplotChartInstance = null;
    }
    
    const { minVal, q1, median, q3, maxVal, whiskerMin, whiskerMax, outliers } = stats;
    
    // Create a dummy scatter dataset just to set up the axes
    const dummyData = [
        { x: 'Dataset', y: minVal },
        { x: 'Dataset', y: maxVal }
    ];
    
    const ctx = canvas.getContext('2d');
    
    boxplotChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Data Range',
                data: dummyData,
                type: 'scatter',
                pointRadius: 0,
                showLine: false
            }],
            // Store boxplot data for the plugin
            boxplotData: { q1, median, q3, whiskerMin, whiskerMax, outliers, minVal, maxVal }
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Boxplot Analysis - Distribution of Data (n = ${numbers.length})`,
                    font: { size: 16, weight: 'bold', family: "'Segoe UI', sans-serif" },
                    color: '#e6edf3',
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    enabled: false // Disable default tooltip, use custom
                },
                legend: { display: false }
            },
            scales: {
               y: {
        title: { 
            display: true, 
            text: 'Value', 
            font: { weight: 'bold', size: 13 }, 
            color: '#e6edf3' 
        },
        grid: { color: '#2d2d44' },
        ticks: { 
            color: '#e6edf3',
            stepSize: Math.ceil((maxVal - minVal) / 6),
            font: { size: 11 }
        },
min: Math.min(minVal, whiskerMin) - 15,   // ← CHANGE: 3 to 12 (more space below)
max: Math.max(maxVal, whiskerMax) + 15    // ← CHANGE: 3 to 12 (more space above)
    },
                x: {
                    title: { 
                        display: true, 
                        text: 'Variable', 
                        font: { weight: 'bold', size: 13 }, 
                        color: '#e6edf3' 
                    },
                    grid: { display: false },
                    ticks: { 
                        color: '#e6edf3',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            layout: {
                padding: {
                    top: 30,
                    bottom: 30,
                    left: 50,
                    right: 50
                }
            }
        }
    });
    
    // Setup custom tooltip after chart is created
    setTimeout(() => {
        setupCanvasTooltip(canvas, boxplotChartInstance);
    }, 100);
}

function setupBoxplotLogic() {
    const computeBtn = document.getElementById("boxplotComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("boxplotInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("boxplotResultArea");
        const valueSpan = document.getElementById("boxplotValueDisplay");
        const stepsSpan = document.getElementById("boxplotStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter numbers to generate boxplot.";
            return;
        }
        
        const result = computeBoxplotWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `📦 Outliers: ${result.outliers.length} | IQR: ${result.iqr.toFixed(4)} | Range: ${result.minVal} - ${result.maxVal} | Median: ${result.median.toFixed(4)}`;
        stepsSpan.innerHTML = result.steps;
        
        setTimeout(() => {
            renderBoxplotChart(numbers, result);
        }, 100);
    });
    
    attachClearHandler("boxplotClearBtn", "boxplotInput", "boxplotResultArea");
}
// ========== VIOLIN PLOT RENDER FUNCTION ==========
function renderViolinInterface() {
    return `
        <div class="stat-interface" id="statViolinInterface">
            <div class="interface-title">🎻 Violin Plot (Density + Boxplot)</div>
            <div class="formula-card">
                <div class="formula">📌 Kernel Density Estimation + Boxplot</div>
                <div class="desc">
                    <strong>What is a Violin Plot?</strong><br>
                    A violin plot combines a boxplot with a rotated kernel density plot on each side.
                    It shows the distribution's shape, central tendency, spread, and multimodality.
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>Interpretation:</strong><br>
                    • <strong>Wider sections</strong> = Higher density (more data points)<br>
                    • <strong>Narrower sections</strong> = Lower density (fewer data points)<br>
                    • <strong>White dot</strong> = Median<br>
                    • <strong>Thick black bar</strong> = Interquartile Range (IQR)<br>
                    • <strong>Lines</strong> = Whiskers (1.5×IQR rule)
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated):</label>
                <textarea id="violinInput" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33, 100, 5"></textarea>
                
                <label style="margin-top: 15px;">🎨 Bandwidth (smoothing factor):</label>
                <input type="range" id="violinBandwidth" min="0.1" max="2" step="0.05" value="0.5" style="width: 100%; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span>Less smooth (more detail)</span>
                    <span id="bandwidthValue">0.50</span>
                    <span>More smooth (general shape)</span>
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="violinComputeBtn">🎻 Generate Violin Plot + Statistics</button>
                    <button class="secondary-btn" id="violinClearBtn">Clear</button>
                </div>
            </div>
            <div id="violinResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 VIOLIN PLOT RESULTS</div>
                    <div class="result-value" id="violinValueDisplay">—</div>
                    <div class="calculation-steps" id="violinStepsDisplay"></div>
                </div>
                <canvas id="violinChartCanvas" style="max-height: 500px; width: 100%; margin-top: 20px;"></canvas>
            </div>
        </div>
    `;
}
// ========== VIOLIN PLOT COMPUTATION ==========
let violinChart = null;

function computeViolinWithSteps(numbers, bandwidth) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = numbers.length;
    const minVal = Math.min(...numbers);
    const maxVal = Math.max(...numbers);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Calculate quartiles
    const getMedian = (arr) => {
        const m = arr.length;
        if (m % 2 === 0) return (arr[m/2 - 1] + arr[m/2]) / 2;
        else return arr[Math.floor(m/2)];
    };
    
    let q1, q3;
    if (n % 2 === 0) {
        q1 = getMedian(sorted.slice(0, n/2));
        q3 = getMedian(sorted.slice(n/2));
    } else {
        q1 = getMedian(sorted.slice(0, Math.floor(n/2)));
        q3 = getMedian(sorted.slice(Math.floor(n/2) + 1));
    }
    
    const median = getMedian(sorted);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Identify outliers
    const outliers = numbers.filter(x => x < lowerBound || x > upperBound).sort((a, b) => a - b);
    const nonOutliers = numbers.filter(x => x >= lowerBound && x <= upperBound);
    const whiskerMin = nonOutliers.length > 0 ? Math.min(...nonOutliers) : q1;
    const whiskerMax = nonOutliers.length > 0 ? Math.max(...nonOutliers) : q3;
    
    // Calculate variance and standard deviation
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Kernel Density Estimation
    const points = 100;
    const xMin = Math.min(minVal, whiskerMin) - (maxVal - minVal) * 0.1;
    const xMax = Math.max(maxVal, whiskerMax) + (maxVal - minVal) * 0.1;
    const step = (xMax - xMin) / points;
    
    const densityPoints = [];
    for (let i = 0; i <= points; i++) {
        const x = xMin + i * step;
        let density = 0;
        
        // Gaussian kernel
        for (let val of numbers) {
            const u = (x - val) / bandwidth;
            density += (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
        }
        density /= (n * bandwidth);
        densityPoints.push({ x: x, density: density });
    }
    
    // Find max density for scaling
    const maxDensity = Math.max(...densityPoints.map(p => p.density));
    
    // Calculate statistics for display
    const variancePop = variance;
    const skewness = numbers.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 3), 0) / n;
    const kurtosis = numbers.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 4), 0) / n - 3;
    
    // Build statistics table
    let statsTable = `
    <div style="background: white; border-radius: 16px; margin: 20px 0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin: 0; padding: 14px; background: linear-gradient(135deg, #6a1b9a, #4a148c); color: white; text-align: center;">📊 Statistical Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #e9ecef;">
                    <th style="padding: 12px; text-align: center;">Statistic</th>
                    <th style="padding: 12px; text-align: center;">Value</th>
                    <th style="padding: 12px; text-align: center;">Interpretation</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Sample Size (n)</td>
                    <td style="text-align: center;">${n}</td>
                    <td style="text-align: center;">Number of observations</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Mean (μ)</td>
                    <td style="text-align: center;">${mean.toFixed(4)}</td>
                    <td style="text-align: center;">Average value</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Median (Q₂)</td>
                    <td style="text-align: center;">${median.toFixed(4)}</td>
                    <td style="text-align: center;">Middle value (50th percentile)</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Standard Deviation (σ)</td>
                    <td style="text-align: center;">${stdDev.toFixed(4)}</td>
                    <td style="text-align: center;">Measure of spread</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Skewness (γ₁)</td>
                    <td style="text-align: center;">${skewness.toFixed(4)}</td>
                    <td style="text-align: center;">${Math.abs(skewness) < 0.1 ? 'Symmetric' : (skewness > 0 ? 'Right-skewed' : 'Left-skewed')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">Kurtosis (γ₂)</td>
                    <td style="text-align: center;">${kurtosis.toFixed(4)}</td>
                    <td style="text-align: center;">${Math.abs(kurtosis) < 0.5 ? 'Mesokurtic (normal-like)' : (kurtosis > 0 ? 'Leptokurtic (heavy tails)' : 'Platykurtic (light tails)')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px; font-weight: bold;">IQR (Interquartile Range)</td>
                    <td style="text-align: center;">${iqr.toFixed(4)}</td>
                    <td style="text-align: center;">Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold;">Outliers</td>
                    <td style="text-align: center;">${outliers.length}</td>
                    <td style="text-align: center;">${outliers.length > 0 ? `Values: ${outliers.join(', ')}` : 'No outliers detected'}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    // Build density calculation explanation
    let densitySteps = `
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1a5490; margin-top: 0;">📐 Kernel Density Estimation (KDE)</h3>
        <div style="background: white; border-radius: 12px; padding: 15px;">
            <strong>Formula:</strong>
            <div style="font-family: monospace; background: #f0f4fa; padding: 12px; border-radius: 8px; margin: 10px 0;">
                f̂(x) = (1/(n·h)) × Σ K((x - xᵢ)/h)
            </div>
            <div style="margin-top: 10px;">
                <strong>Where:</strong><br>
                • <strong>K(u)</strong> = Gaussian kernel = (1/√(2π)) × e^(-u²/2)<br>
                • <strong>h</strong> = Bandwidth = ${bandwidth}<br>
                • <strong>n</strong> = Sample size = ${n}<br>
                • <strong>xᵢ</strong> = Data points
            </div>
            <div style="margin-top: 12px; background: #d4edda; padding: 10px; border-radius: 8px;">
                💡 <strong>Interpretation:</strong> The violin shape shows the probability density of data at different values.
                Wider sections = higher density (more data points clustered there).
            </div>
        </div>
    </div>`;
    
    let steps = `
<div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 48px;">🎻</span>
                    <div>
                        <h1 style="margin: 0; font-size: 28px;">Violin Plot Analysis</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Kernel Density Estimation + Boxplot for Distribution Visualization</p>
                    </div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.8;">BANDWIDTH</div>
                <div style="font-size: 24px; font-weight: 700;">h = ${bandwidth}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #28a745;">
            <div style="font-size: 11px; color: #6c757d;">MINIMUM</div>
            <div style="font-size: 24px; font-weight: 700; color: #28a745;">${minVal}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">Q₁</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${q1.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #ffc107;">
            <div style="font-size: 11px; color: #6c757d;">MEDIAN</div>
            <div style="font-size: 24px; font-weight: 700; color: #ffc107;">${median.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">Q₃</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${q3.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #dc3545;">
            <div style="font-size: 11px; color: #6c757d;">MAXIMUM</div>
            <div style="font-size: 24px; font-weight: 700; color: #dc3545;">${maxVal}</div>
        </div>
    </div>
    
    <!-- Statistics Table -->
    ${statsTable}
    
    <!-- Density Explanation -->
    ${densitySteps}
    
    <!-- Violin Plot Visualization -->
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%); border-radius: 20px; padding: 25px; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #9c27b0; padding-bottom: 15px;">
            <span style="font-size: 28px;">🎻</span>
            <h3 style="margin: 0; color: #ce93d8;">VIOLIN PLOT VISUALIZATION</h3>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #b39ddb;">💡 Hover over the plot to see values | Wider = Higher density</p>
        </div>
        
        <canvas id="violinChartCanvas" style="max-height: 500px; width: 100%; margin-top: 10px;"></canvas>
        
        <div style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 20px; height: 20px; background: rgba(156, 39, 176, 0.5); border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">Violin Shape (KDE)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 3px; background: #ffb74d;"></div><span style="color: #e6edf3; font-size: 11px;">Median Line</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 3px; background: #81c784;"></div><span style="color: #e6edf3; font-size: 11px;">IQR Box Boundaries</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 10px; height: 10px; background: #ef5350; border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">Outliers</span></div>
        </div>
    </div>
    
    <!-- Interpretation -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 25px;">
        <h2 style="color: #1a5490; margin-top: 0;">📖 Final Interpretation</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Distribution Shape:</strong><br>
                • ${Math.abs(median - mean) < 0.1 * iqr ? 'Symmetric' : (median < mean ? 'Right-skewed' : 'Left-skewed')}<br>
                • IQR = ${iqr.toFixed(4)}<br>
                • Range = ${(maxVal - minVal).toFixed(4)}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Outliers:</strong><br>
                • ${outliers.length} outlier(s) detected<br>
                ${outliers.length > 0 ? `• Values: ${outliers.join(', ')}` : '• No outliers'}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Density Interpretation:</strong><br>
                • ${maxDensity > 0.5 ? 'High peak concentration' : 'Spread out distribution'}<br>
                • Bandwidth = ${bandwidth} (${bandwidth < 0.5 ? 'detailed' : (bandwidth > 1 ? 'smooth' : 'balanced')})
            </div>
        </div>
    </div>
</div>`;
    
    return { 
        steps, 
        densityPoints, 
        maxDensity, 
        q1, median, q3, whiskerMin, whiskerMax, 
        outliers, minVal, maxVal, mean, stdDev,
        n, iqr, variance, skewness, kurtosis
    };
}

function renderViolinChart(stats, numbers, bandwidth) {
    const canvas = document.getElementById('violinChartCanvas');
    if (!canvas) return;
    
    if (violinChart) violinChart.destroy();
    
    const { densityPoints, maxDensity, q1, median, q3, whiskerMin, whiskerMax, outliers, minVal, maxVal } = stats;
    
    // Create dataset for the violin (filled area)
    const violinLeftData = densityPoints.map(p => ({ x: p.x, y: -p.density / maxDensity * 0.8 }));
    const violinRightData = densityPoints.map(p => ({ x: p.x, y: p.density / maxDensity * 0.8 }));
    
    // Combine for area chart
    const areaData = [];
    for (let i = 0; i < densityPoints.length; i++) {
        areaData.push({ x: densityPoints[i].x, y: violinLeftData[i].y });
    }
    for (let i = densityPoints.length - 1; i >= 0; i--) {
        areaData.push({ x: densityPoints[i].x, y: violinRightData[i].y });
    }
    
    const ctx = canvas.getContext('2d');
    
    violinChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Violin Shape (KDE)',
                    data: areaData,
                    type: 'scatter',
                    showLine: true,
                    fill: true,
                    backgroundColor: 'rgba(156, 39, 176, 0.4)',
                    borderColor: '#9c27b0',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Median',
                    data: [{ x: median, y: -0.05 }, { x: median, y: 0.05 }],
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#ffb74d',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0
                },
                {
                    label: 'IQR Box (Q₁ to Q₃)',
                    data: [{ x: q1, y: -0.08 }, { x: q1, y: 0.08 }, { x: q3, y: 0.08 }, { x: q3, y: -0.08 }, { x: q1, y: -0.08 }],
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#81c784',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                },
                {
                    label: 'Whiskers',
                    data: [{ x: whiskerMin, y: -0.02 }, { x: whiskerMin, y: 0.02 }, { x: whiskerMax, y: 0.02 }, { x: whiskerMax, y: -0.02 }],
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#81c784',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                },
                {
                    label: 'Whisker Caps',
                    data: [{ x: whiskerMin, y: -0.05 }, { x: whiskerMin, y: 0.05 }, { x: whiskerMax, y: 0.05 }, { x: whiskerMax, y: -0.05 }],
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#81c784',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                },
                {
                    label: 'Outliers',
                    data: outliers.map(o => ({ x: o, y: 0 })),
                    type: 'scatter',
                    backgroundColor: '#ef5350',
                    borderColor: '#ef5350',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Violin Plot (n = ${stats.n}) | Bandwidth = ${bandwidth}`,
                    font: { size: 14, weight: 'bold', family: "'Segoe UI', sans-serif" },
                    color: '#e6edf3',
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Outliers') {
                                return `Outlier: ${context.parsed.x.toFixed(4)}`;
                            }
                            return `${context.dataset.label}: ${context.parsed.x.toFixed(4)}`;
                        }
                    },
                    backgroundColor: '#1a5490',
                    titleColor: 'white',
                    bodyColor: 'white'
                },
                legend: { 
                    position: 'top',
                    labels: { color: '#e6edf3', font: { size: 10 } }
                }
            },
            scales: {
                x: {
                    title: { 
                        display: true, 
                        text: 'Value', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { color: '#e6edf3', font: { size: 11 } }
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Density', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { 
                        color: '#e6edf3',
                        callback: function(val) {
                            return Math.abs(val).toFixed(2);
                        }
                    },
                    min: -0.9,
                    max: 0.9
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 50,
                    right: 50
                }
            }
        }
    });
}

function setupViolinLogic() {
    const computeBtn = document.getElementById("violinComputeBtn");
    if (!computeBtn) return;
    
    const bandwidthSlider = document.getElementById("violinBandwidth");
    const bandwidthValue = document.getElementById("bandwidthValue");
    
    if (bandwidthSlider && bandwidthValue) {
        bandwidthSlider.addEventListener('input', () => {
            bandwidthValue.textContent = parseFloat(bandwidthSlider.value).toFixed(2);
        });
    }
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("violinInput").value;
        const numbers = parseNumbersFromInput(raw);
        const bandwidth = parseFloat(document.getElementById("violinBandwidth").value);
        const resultDiv = document.getElementById("violinResultArea");
        const valueSpan = document.getElementById("violinValueDisplay");
        const stepsSpan = document.getElementById("violinStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter numbers to generate violin plot.";
            return;
        }
        
        const result = computeViolinWithSteps(numbers, bandwidth);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `🎻 n = ${result.n} | Median = ${result.median.toFixed(4)} | IQR = ${result.iqr.toFixed(4)} | Outliers = ${result.outliers.length}`;
        stepsSpan.innerHTML = result.steps;
        
        setTimeout(() => {
            renderViolinChart(result, numbers, bandwidth);
        }, 100);
    });
    
    attachClearHandler("violinClearBtn", "violinInput", "violinResultArea");
}
function renderQQPlotInterface() {
    return `
        <div class="stat-interface" id="statQQPlotInterface">
            <div class="interface-title">📈 Q-Q Plot (Quantile-Quantile Plot)</div>
            <div class="formula-card">
                <div class="formula">📌 Compares sample quantiles against theoretical normal quantiles</div>
                <div class="desc">
                    <strong>What is a Q-Q Plot?</strong><br>
                    A Q-Q plot compares the distribution of your data to a theoretical normal distribution.
                    If the points fall approximately along a straight diagonal line, the data is likely normally distributed.
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>Interpretation:</strong><br>
                    • <span style="color: #28a745;">Points follow the line</span> → Data is normally distributed<br>
                    • <span style="color: #dc3545;">S-shaped curve</span> → Heavy tails or light tails<br>
                    • <span style="color: #ffc107;">Curved pattern</span> → Skewed distribution
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated):</label>
                <textarea id="qqplotInput" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33"></textarea>
                
                <div class="action-row">
                    <button class="primary-btn" id="qqplotComputeBtn">📈 Generate Q-Q Plot + Full Steps</button>
                    <button class="secondary-btn" id="qqplotClearBtn">Clear</button>
                </div>
            </div>
            <div id="qqplotResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 Q-Q PLOT RESULTS</div>
                    <div class="result-value" id="qqplotValueDisplay">—</div>
                    <div class="calculation-steps" id="qqplotStepsDisplay"></div>
                </div>
                <canvas id="qqplotChartCanvas" style="max-height: 500px; width: 100%; margin-top: 20px;"></canvas>
            </div>
        </div>
    `;
}
// ========== Q-Q PLOT COMPUTATION ==========
let qqplotChart = null;

function computeQQPlotWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const n = numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mean = numbers.reduce((a,b) => a+b, 0) / n;
    const variance = numbers.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // FIXED CONSTANTS (from Abramowitz & Stegun 1972)
    const CENTRAL_A5 = 2.506628277459239e+00;
    const CENTRAL_A4 = -3.066479806614716e+01;
    const CENTRAL_A3 = 1.383577518672690e+02;
    const CENTRAL_A2 = -2.759285104961687e+02;
    const CENTRAL_A1 = 2.209460984245205e+02;
    const CENTRAL_A0 = -3.969683028665376e+01;
    
    const CENTRAL_B4 = -1.328068155288572e+01;
    const CENTRAL_B3 = 6.680131188771972e+01;
    const CENTRAL_B2 = -1.556989798598866e+02;
    const CENTRAL_B1 = 1.615858368580409e+02;
    const CENTRAL_B0 = -5.447609879822406e+01;
    
    const TAIL_C5 = 2.938163982698783e+00;
    const TAIL_C4 = 4.374664141464968e+00;
    const TAIL_C3 = -2.549732539343734e+00;
    const TAIL_C2 = -2.400758277161838e+00;
    const TAIL_C1 = -3.223964580411365e-01;
    const TAIL_C0 = -7.784894002430293e-03;
    
    const TAIL_D3 = 3.754408661907416e+00;
    const TAIL_D2 = 2.445134137142996e+00;
    const TAIL_D1 = 3.224671290700398e-01;
    const TAIL_D0 = 7.784695709041462e-03;
    
    const theoreticalQuantiles = [];
    const sampleQuantiles = [];
    const calculationDetails = [];
    
    for (let i = 0; i < n; i++) {
        const p = (i + 1 - 0.375) / (n + 0.25);
        const q = p - 0.5;
        let z;
        let calculationType = "";
        let detailedSteps = "";
        
        if (p <= 0) {
            z = -Infinity;
            detailedSteps = "p = 0 → z = -∞";
        } else if (p >= 1) {
            z = Infinity;
            detailedSteps = "p = 1 → z = +∞";
        } else {
            if (Math.abs(q) <= 0.425) {
                calculationType = "central";
                const r = 0.180625 - q * q;
                
                detailedSteps = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                detailedSteps += `📊 CENTRAL REGION CALCULATION (|q| ≤ 0.425)\n`;
                detailedSteps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                detailedSteps += `📌 INPUT VALUES:\n`;
                detailedSteps += `   i = ${i+1}, p = ${p.toFixed(6)}, q = ${q.toFixed(6)}\n\n`;
                detailedSteps += `🔢 Step 1: Calculate r = 0.180625 - q²\n`;
                detailedSteps += `   q² = (${q.toFixed(6)})² = ${(q*q).toFixed(10)}\n`;
                detailedSteps += `   r = 0.180625 - ${(q*q).toFixed(10)} = ${r.toFixed(10)}\n\n`;
                
                const r2 = r * r;
                const r3 = r2 * r;
                const r4 = r3 * r;
                const r5 = r4 * r;
                
                const term5 = CENTRAL_A5 * r5;
                const term4 = CENTRAL_A4 * r4;
                const term3 = CENTRAL_A3 * r3;
                const term2 = CENTRAL_A2 * r2;
                const term1 = CENTRAL_A1 * r;
                const term0 = CENTRAL_A0;
                
                const P = term5 + term4 + term3 + term2 + term1 + term0;
                
                detailedSteps += `📐 Step 2: Calculate P(r) = a₅·r⁵ + a₄·r⁴ + a₃·r³ + a₂·r² + a₁·r + a₀\n`;
                detailedSteps += `   r = ${r.toFixed(8)}\n`;
                detailedSteps += `   r² = ${r2.toFixed(8)}\n`;
                detailedSteps += `   r³ = ${r3.toFixed(8)}\n`;
                detailedSteps += `   r⁴ = ${r4.toFixed(8)}\n`;
                detailedSteps += `   r⁵ = ${r5.toFixed(8)}\n\n`;
                detailedSteps += `   a₅·r⁵ = ${CENTRAL_A5.toFixed(4)} × ${r5.toExponential(6)} = ${term5.toExponential(8)}\n`;
                detailedSteps += `   a₄·r⁴ = ${CENTRAL_A4.toFixed(4)} × ${r4.toExponential(6)} = ${term4.toExponential(8)}\n`;
                detailedSteps += `   a₃·r³ = ${CENTRAL_A3.toFixed(4)} × ${r3.toExponential(6)} = ${term3.toExponential(8)}\n`;
                detailedSteps += `   a₂·r² = ${CENTRAL_A2.toFixed(4)} × ${r2.toExponential(6)} = ${term2.toExponential(8)}\n`;
                detailedSteps += `   a₁·r  = ${CENTRAL_A1.toFixed(4)} × ${r.toExponential(6)} = ${term1.toExponential(8)}\n`;
                detailedSteps += `   a₀    = ${CENTRAL_A0.toFixed(4)}\n`;
                detailedSteps += `   P(r) = ${P.toExponential(10)}\n\n`;
                
                const qterm4 = CENTRAL_B4 * r4;
                const qterm3 = CENTRAL_B3 * r3;
                const qterm2 = CENTRAL_B2 * r2;
                const qterm1 = CENTRAL_B1 * r;
                const qterm0 = CENTRAL_B0;
                
                const Q = qterm4 + qterm3 + qterm2 + qterm1 + qterm0;
                
                detailedSteps += `📐 Step 3: Calculate Q(r) = b₄·r⁴ + b₃·r³ + b₂·r² + b₁·r + b₀\n`;
                detailedSteps += `   b₄·r⁴ = ${CENTRAL_B4.toFixed(4)} × ${r4.toExponential(6)} = ${qterm4.toExponential(8)}\n`;
                detailedSteps += `   b₃·r³ = ${CENTRAL_B3.toFixed(4)} × ${r3.toExponential(6)} = ${qterm3.toExponential(8)}\n`;
                detailedSteps += `   b₂·r² = ${CENTRAL_B2.toFixed(4)} × ${r2.toExponential(6)} = ${qterm2.toExponential(8)}\n`;
                detailedSteps += `   b₁·r  = ${CENTRAL_B1.toFixed(4)} × ${r.toExponential(6)} = ${qterm1.toExponential(8)}\n`;
                detailedSteps += `   b₀    = ${CENTRAL_B0.toFixed(4)}\n`;
                detailedSteps += `   Q(r) = ${Q.toExponential(10)}\n\n`;
                
                const P_over_Q = P / Q;
                z = q * P_over_Q;
                
                detailedSteps += `📐 Step 4: Calculate z = q × P(r) / Q(r)\n`;
                detailedSteps += `   P(r)/Q(r) = ${P.toExponential(8)} / ${Q.toExponential(8)} = ${P_over_Q.toExponential(10)}\n`;
                detailedSteps += `   z = ${q.toFixed(6)} × ${P_over_Q.toExponential(10)} = ${z.toFixed(10)}\n\n`;
                detailedSteps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                detailedSteps += `✅ FINAL z = ${z.toFixed(10)}\n`;
                
            } else {
                calculationType = "tail";
                
                detailedSteps = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                detailedSteps += `📈 TAIL REGION CALCULATION (|q| > 0.425)\n`;
                detailedSteps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                detailedSteps += `📌 INPUT VALUES:\n`;
                detailedSteps += `   i = ${i+1}, p = ${p.toFixed(6)}, q = ${q.toFixed(6)}\n\n`;
                
                detailedSteps += `🔢 Step 1: Calculate r\n`;
                let r;
                if (q < 0) {
                    r = Math.sqrt(-Math.log(p));
                    detailedSteps += `   Since q = ${q.toFixed(6)} < 0 (lower tail):\n`;
                    detailedSteps += `   r = √[-ln(p)] = √[-ln(${p.toFixed(6)})]\n`;
                    detailedSteps += `   -ln(${p.toFixed(6)}) = ${(-Math.log(p)).toFixed(10)}\n`;
                    detailedSteps += `   r = √${(-Math.log(p)).toFixed(10)} = ${r.toFixed(10)}\n\n`;
                } else {
                    r = Math.sqrt(-Math.log(1 - p));
                    detailedSteps += `   Since q = ${q.toFixed(6)} > 0 (upper tail):\n`;
                    detailedSteps += `   r = √[-ln(1-p)] = √[-ln(${(1-p).toFixed(6)})]\n`;
                    detailedSteps += `   -ln(${(1-p).toFixed(6)}) = ${(-Math.log(1-p)).toFixed(10)}\n`;
                    detailedSteps += `   r = √${(-Math.log(1-p)).toFixed(10)} = ${r.toFixed(10)}\n\n`;
                }
                
                const r2 = r * r;
                const r3 = r2 * r;
                const r4 = r3 * r;
                const r5 = r4 * r;
                
                detailedSteps += `📐 Step 2: Calculate P(r) = c₅·r⁵ + c₄·r⁴ + c₃·r³ + c₂·r² + c₁·r + c₀\n`;
                detailedSteps += `   r = ${r.toFixed(8)}\n`;
                detailedSteps += `   r² = ${r2.toFixed(8)}\n`;
                detailedSteps += `   r³ = ${r3.toFixed(8)}\n`;
                detailedSteps += `   r⁴ = ${r4.toFixed(8)}\n`;
                detailedSteps += `   r⁵ = ${r5.toFixed(8)}\n\n`;
                
                const term5 = TAIL_C5 * r5;
                const term4 = TAIL_C4 * r4;
                const term3 = TAIL_C3 * r3;
                const term2 = TAIL_C2 * r2;
                const term1 = TAIL_C1 * r;
                const term0 = TAIL_C0;
                
                const P = term5 + term4 + term3 + term2 + term1 + term0;
                
                detailedSteps += `   c₅·r⁵ = ${TAIL_C5.toFixed(4)} × ${r5.toExponential(6)} = ${term5.toExponential(8)}\n`;
                detailedSteps += `   c₄·r⁴ = ${TAIL_C4.toFixed(4)} × ${r4.toExponential(6)} = ${term4.toExponential(8)}\n`;
                detailedSteps += `   c₃·r³ = ${TAIL_C3.toFixed(4)} × ${r3.toExponential(6)} = ${term3.toExponential(8)}\n`;
                detailedSteps += `   c₂·r² = ${TAIL_C2.toFixed(4)} × ${r2.toExponential(6)} = ${term2.toExponential(8)}\n`;
                detailedSteps += `   c₁·r  = ${TAIL_C1.toFixed(4)} × ${r.toExponential(6)} = ${term1.toExponential(8)}\n`;
                detailedSteps += `   c₀    = ${TAIL_C0.toFixed(4)}\n`;
                detailedSteps += `   P(r) = ${P.toExponential(10)}\n\n`;
                
                detailedSteps += `📐 Step 3: Calculate Q(r) = d₃·r³ + d₂·r² + d₁·r + d₀\n`;
                const qterm3 = TAIL_D3 * r3;
                const qterm2 = TAIL_D2 * r2;
                const qterm1 = TAIL_D1 * r;
                const qterm0 = TAIL_D0;
                
                const Q = qterm3 + qterm2 + qterm1 + qterm0;
                
                detailedSteps += `   d₃·r³ = ${TAIL_D3.toFixed(4)} × ${r3.toExponential(6)} = ${qterm3.toExponential(8)}\n`;
                detailedSteps += `   d₂·r² = ${TAIL_D2.toFixed(4)} × ${r2.toExponential(6)} = ${qterm2.toExponential(8)}\n`;
                detailedSteps += `   d₁·r  = ${TAIL_D1.toFixed(4)} × ${r.toExponential(6)} = ${qterm1.toExponential(8)}\n`;
                detailedSteps += `   d₀    = ${TAIL_D0.toFixed(4)}\n`;
                detailedSteps += `   Q(r) = ${Q.toExponential(10)}\n\n`;
                
                let raw_z = P / Q;
                z = raw_z;
                if (q < 0) z = -z;
                
                detailedSteps += `📐 Step 4: Calculate z = P(r) / Q(r) (sign adjusted)\n`;
                detailedSteps += `   P(r)/Q(r) = ${P.toExponential(8)} / ${Q.toExponential(8)} = ${raw_z.toExponential(10)}\n`;
                if (q < 0) {
                    detailedSteps += `   Since q < 0 (lower tail), z = -${raw_z.toExponential(10)} = ${z.toFixed(10)}\n`;
                } else {
                    detailedSteps += `   Since q > 0 (upper tail), z = ${raw_z.toExponential(10)} = ${z.toFixed(10)}\n`;
                }
                detailedSteps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                detailedSteps += `✅ FINAL z = ${z.toFixed(10)}\n`;
            }
        }
        
        theoreticalQuantiles.push(z);
        sampleQuantiles.push(sorted[i]);
        
        calculationDetails.push({
            i: i + 1,
            value: sorted[i],
            probability: p.toFixed(6),
            q: q.toFixed(6),
            zScore: z.toFixed(6),
            calculationType: calculationType,
            detailedSteps: detailedSteps
        });
    }
    
    // Calculate correlation coefficient
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    let xyDetails = [];
    
    for (let i = 0; i < n; i++) {
        const x = theoreticalQuantiles[i];
        const y = sampleQuantiles[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
        xyDetails.push({
            i: i + 1,
            x: x.toFixed(6),
            y: y.toFixed(4),
            xy: (x * y).toFixed(6),
            x2: (x * x).toFixed(6),
            y2: (y * y).toFixed(4)
        });
    }
    
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = sumXY - n * meanX * meanY;
    const denominator = Math.sqrt((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY));
    const correlation = numerator / denominator;
    
    // Build ALL correlation rows (no truncation!)
    let allCorrRows = '';
    for (let d of xyDetails) {
        allCorrRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${d.i}</td>
            <td style="padding: 8px; text-align: center; font-family: monospace;">${d.x}</td>
            <td style="padding: 8px; text-align: center; font-family: monospace;">${d.y}</td>
            <td style="padding: 8px; text-align: center;">${d.xy}</td>
            <td style="padding: 8px; text-align: center;">${d.x2}</td>
            <td style="padding: 8px; text-align: center;">${d.y2}</td>
        </tr>`;
    }
    
    // Build ALL calculation rows with expandable details (no truncation!)
    let allCalcRows = '';
    for (let d of calculationDetails) {
        let typeLabel = d.calculationType === "central" ? "📊 Central" : (d.calculationType === "tail" ? "📈 Tail" : "⚪ Edge");
        allCalcRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${d.i}</td>
            <td style="padding: 8px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center;">${d.probability}</td>
            <td style="padding: 8px; text-align: center;">${d.q}</td>
            <td style="padding: 8px; text-align: center;">
                <details>
                    <summary style="cursor: pointer; display: inline-block; font-weight: bold; color: #1a5490;">${d.zScore}</summary>
                    <div style="background: #f8f9fa; padding: 15px; margin-top: 10px; border-radius: 8px; font-family: monospace; font-size: 12px; white-space: pre-wrap; text-align: left; max-height: 400px; overflow-y: auto;">
                        ${d.detailedSteps.replace(/\n/g, '<br>')}
                    </div>
                </details>
                <span style="font-size: 10px; color: #666;">(${typeLabel})</span>
            </td>
        </tr>`;
    }
    
    let steps = `
<div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 48px;">📈</span>
                    <div>
                        <h1 style="margin: 0; font-size: 28px;">Q-Q Plot Analysis</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Quantile-Quantile Plot for Normality Assessment</p>
                    </div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.8;">SAMPLE SIZE</div>
                <div style="font-size: 36px; font-weight: 700;">${n}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #28a745;">
            <div style="font-size: 11px; color: #6c757d;">MEAN</div>
            <div style="font-size: 24px; font-weight: 700; color: #28a745;">${mean.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">STD DEVIATION</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${stdDev.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #ffc107;">
            <div style="font-size: 11px; color: #6c757d;">CORRELATION</div>
            <div style="font-size: 24px; font-weight: 700; color: #ffc107;">${correlation.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #1a5490;">
            <div style="font-size: 11px; color: #6c757d;">RANGE</div>
            <div style="font-size: 24px; font-weight: 700;">${(Math.max(...numbers) - Math.min(...numbers)).toFixed(4)}</div>
        </div>
    </div>
    
    <!-- Step 1: Understanding Q-Q Plot -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">1</span>
            📖 Understanding Q-Q Plots
        </h2>
        
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <p><strong>What is a Q-Q Plot?</strong> A Quantile-Quantile plot compares the quantiles of your data against the quantiles of a theoretical normal distribution.</p>
            
            <div style="margin: 15px 0; padding: 12px; background: #e8f4f8; border-radius: 8px;">
                <strong>📐 How to interpret:</strong><br>
                • <span style="color: #28a745;">Points follow the diagonal line</span> → Data is normally distributed<br>
                • <span style="color: #dc3545;">S-shaped pattern</span> → Heavy tails (more outliers than normal)<br>
                • <span style="color: #ffc107;">Curved upward/downward</span> → Skewed distribution<br>
                • <span style="color: #17a2b8;">Correlation near 1</span> → Strong evidence of normality
            </div>
            
            <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                <strong>💡 Formula for probability positions (Blom's method):</strong><br>
                p = (i - 0.375) / (n + 0.25)<br>
                where i = rank (1 to n), n = sample size<br><br>
                <strong>Then calculate:</strong> q = p - 0.5
            </div>
        </div>
    </div>
    
    <!-- Step 2: Calculation Table (ALL rows - scrollable) -->
    <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="background: #1a5490; color: white; padding: 14px 20px;">
            <h2 style="margin: 0; font-size: 16px;">🔢 Step 2: Quantile Calculations (All ${n} Data Points)</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">For each data point: p = (i - 0.375)/(n + 0.25) → q = p - 0.5 → z = Φ⁻¹(p)</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;"><strong>👇 Click on any z-value to see the complete step-by-step calculation!</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.8;">📌 Scroll horizontally if needed | ${n} total observations</p>
        </div>
        <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #e9ecef; position: sticky; top: 0; z-index: 10;">
                        <th style="padding: 12px; background: #e9ecef;">Rank (i)</th>
                        <th style="padding: 12px; background: #e9ecef;">Sample Value (x)</th>
                        <th style="padding: 12px; background: #e9ecef;">Probability p</th>
                        <th style="padding: 12px; background: #e9ecef;">q = p - 0.5</th>
                        <th style="padding: 12px; background: #e9ecef;">Theoretical Quantile (z) - Click to see calculation</th>
                    </tr>
                </thead>
                <tbody>
                    ${allCalcRows}
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Step 3: Detailed Correlation Calculation (ALL rows) -->
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">3</span>
            📊 Step-by-Step Correlation Calculation (All ${n} Data Points)
        </h2>
        
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <p><strong>Formula:</strong> r = Σ(z - z̄)(x - x̄) / √[Σ(z - z̄)² × Σ(x - x̄)²]</p>
            
            <div style="overflow-x: auto; max-height: 500px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background: #1a5490; color: white; position: sticky; top: 0;">
                            <th style="padding: 8px;">i</th>
                            <th style="padding: 8px;">z (Theoretical)</th>
                            <th style="padding: 8px;">x (Sample)</th>
                            <th style="padding: 8px;">z × x</th>
                            <th style="padding: 8px;">z²</th>
                            <th style="padding: 8px;">x²</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allCorrRows}
                        <tr style="background: #e9ecef; font-weight: bold;">
                            <td style="padding: 8px;">SUM →</td>
                            <td style="padding: 8px; text-align: center;">${sumX.toFixed(4)}</td>
                            <td style="padding: 8px; text-align: center;">${sumY.toFixed(4)}</td>
                            <td style="padding: 8px; text-align: center;">${sumXY.toFixed(4)}</td>
                            <td style="padding: 8px; text-align: center;">${sumX2.toFixed(4)}</td>
                            <td style="padding: 8px; text-align: center;">${sumY2.toFixed(4)}</td>
                        </table>
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>📐 Step 3a: Calculate means</strong><br>
                z̄ = Σz / n = ${sumX.toFixed(4)} / ${n} = ${meanX.toFixed(6)}<br>
                x̄ = Σx / n = ${sumY.toFixed(4)} / ${n} = ${meanY.toFixed(6)}
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>📐 Step 3b: Calculate numerator (Covariance sum)</strong><br>
                Σ(z - z̄)(x - x̄) = Σzx - n·z̄·x̄<br>
                = ${sumXY.toFixed(4)} - ${n} × ${meanX.toFixed(6)} × ${meanY.toFixed(6)}<br>
                = ${sumXY.toFixed(4)} - ${(n * meanX * meanY).toFixed(4)}<br>
                = <strong style="color: #1a5490;">${numerator.toFixed(6)}</strong>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>📐 Step 3c: Calculate denominator</strong><br>
                Σ(z - z̄)² = Σz² - n·z̄² = ${sumX2.toFixed(4)} - ${n} × ${(meanX * meanX).toFixed(6)} = ${(sumX2 - n * meanX * meanX).toFixed(6)}<br>
                Σ(x - x̄)² = Σx² - n·x̄² = ${sumY2.toFixed(4)} - ${n} × ${(meanY * meanY).toFixed(6)} = ${(sumY2 - n * meanY * meanY).toFixed(6)}<br>
                Product = ${(sumX2 - n * meanX * meanX).toFixed(6)} × ${(sumY2 - n * meanY * meanY).toFixed(6)} = ${((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY)).toFixed(6)}<br>
                √Product = ${denominator.toFixed(6)}
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #d4edda; border-radius: 8px;">
                <strong>📐 Step 3d: Calculate correlation</strong><br>
                r = ${numerator.toFixed(6)} / ${denominator.toFixed(6)}<br>
                <div style="font-size: 24px; text-align: center; padding: 10px;">
                    <strong style="color: #1a5490;">r = ${correlation.toFixed(8)}</strong>
                </div>
                <strong>Interpretation:</strong> ${Math.abs(correlation) > 0.98 ? '✅ Very strong linear relationship → Data appears normally distributed' : (Math.abs(correlation) > 0.95 ? '⚠️ Moderate relationship → Possible mild deviation from normality' : '❌ Weak relationship → Data likely NOT normally distributed')}
            </div>
        </div>
    </div>
    
    <!-- Step 4: Q-Q Plot Visualization -->
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%); border-radius: 20px; padding: 25px; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #4fc3f7; padding-bottom: 15px;">
            <span style="font-size: 28px;">📈</span>
            <h3 style="margin: 0; color: #4fc3f7;">Q-Q PLOT VISUALIZATION</h3>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #b39ddb;">💡 Hover over points to see values | Points should follow the red line for normality</p>
        </div>
        
        <canvas id="qqplotChartCanvas" style="max-height: 500px; width: 100%; margin-top: 10px;"></canvas>
        
        <div style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: #4fc3f7; border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">Sample Quantiles</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 20px; height: 2px; background: #ef5350;"></div><span style="color: #e6edf3; font-size: 11px;">Theoretical Line (y = x̄ + z·s)</span></div>
        </div>
    </div>
    
    <!-- Step 5: Interpretation -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 25px;">
        <h2 style="color: #1a5490; margin-top: 0;">📌 Final Interpretation</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Normality Assessment:</strong><br>
                • Correlation with theoretical line: ${(correlation * 100).toFixed(1)}%<br>
                • ${Math.abs(correlation) > 0.98 ? '✅ Data appears normally distributed' : (Math.abs(correlation) > 0.95 ? '⚠️ Data shows mild deviation from normality' : '❌ Data is likely NOT normally distributed')}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>What to look for in the plot:</strong><br>
                • Points close to red line → Good fit<br>
                • S-curve → Heavy tails<br>
                • Curved pattern → Skewness
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Recommended next steps:</strong><br>
                ${Math.abs(correlation) > 0.98 ? '✓ Use parametric tests (t-test, ANOVA, etc.)' : '⚠️ Consider non-parametric alternatives or data transformation'}
            </div>
        </div>
    </div>
</div>`;
    
    return { 
        steps, 
        theoreticalQuantiles, 
        sampleQuantiles, 
        correlation, 
        mean, 
        stdDev, 
        n,
        sorted
    };
}
function renderQQPlotChart(stats) {
    const canvas = document.getElementById('qqplotChartCanvas');
    if (!canvas) return;
    
    if (qqplotChart) qqplotChart.destroy();
    
    const { theoreticalQuantiles, sampleQuantiles, mean, stdDev, sorted } = stats;
    
    // Create points for the theoretical line
    const minZ = Math.min(...theoreticalQuantiles);
    const maxZ = Math.max(...theoreticalQuantiles);
    const linePoints = [
        { x: minZ, y: mean + stdDev * minZ },
        { x: maxZ, y: mean + stdDev * maxZ }
    ];
    
    const ctx = canvas.getContext('2d');
    
    qqplotChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Sample Quantiles',
                    data: theoreticalQuantiles.map((z, i) => ({ x: z, y: sampleQuantiles[i] })),
                    backgroundColor: '#4fc3f7',
                    borderColor: '#4fc3f7',
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    pointStyle: 'circle',
                    showLine: false
                },
                {
                    label: 'Theoretical Normal Line',
                    data: linePoints,
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#ef5350',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    fill: false,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Q-Q Plot (n = ${stats.n}) | Correlation = ${stats.correlation.toFixed(4)}`,
                    font: { size: 14, weight: 'bold', family: "'Segoe UI', sans-serif" },
                    color: '#e6edf3',
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return [
                                `Theoretical Quantile (z): ${context.parsed.x.toFixed(4)}`,
                                `Sample Quantile: ${context.parsed.y.toFixed(4)}`
                            ];
                        }
                    },
                    backgroundColor: '#1a5490',
                    titleColor: 'white',
                    bodyColor: 'white'
                },
                legend: { 
                    position: 'top',
                    labels: { color: '#e6edf3', font: { size: 11 } }
                }
            },
            scales: {
                x: {
                    title: { 
                        display: true, 
                        text: 'Theoretical Quantiles (Standard Normal)', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { color: '#e6edf3', font: { size: 11 } }
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Sample Quantiles', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { color: '#e6edf3', font: { size: 11 } }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 50,
                    right: 50
                }
            }
        }
    });
}
function setupQQPlotLogic() {
    const computeBtn = document.getElementById("qqplotComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("qqplotInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("qqplotResultArea");
        const valueSpan = document.getElementById("qqplotValueDisplay");
        const stepsSpan = document.getElementById("qqplotStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter numbers to generate Q-Q plot.";
            return;
        }
        
        const result = computeQQPlotWithSteps(numbers);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `📈 Q-Q Plot | n = ${result.n} | Correlation = ${result.correlation.toFixed(4)} | ${Math.abs(result.correlation) > 0.98 ? 'Normal' : (Math.abs(result.correlation) > 0.95 ? 'Mild deviation' : 'Non-normal')}`;
        stepsSpan.innerHTML = result.steps;
        
        setTimeout(() => {
            renderQQPlotChart(result);
        }, 100);
    });
    
    attachClearHandler("qqplotClearBtn", "qqplotInput", "qqplotResultArea");
}
// ========== P-P PLOT RENDER FUNCTION ==========
function renderPPPlotInterface() {
    return `
        <div class="stat-interface" id="statPPPlotInterface">
            <div class="interface-title">📊 P-P Plot (Probability-Probability Plot)</div>
            <div class="formula-card">
                <div class="formula">📌 Compares empirical CDF against theoretical CDF</div>
                <div class="desc">
                    <strong>What is a P-P Plot?</strong><br>
                    A P-P plot compares the cumulative distribution function (CDF) of your data 
                    against the theoretical CDF of a normal distribution. Points along the diagonal 
                    line indicate that the data follows the theoretical distribution.
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>Difference from Q-Q Plot:</strong><br>
                    • <strong>P-P plot</strong> compares cumulative probabilities (0 to 1)<br>
                    • <strong>Q-Q plot</strong> compares quantiles (z-scores)<br>
                    • P-P plots are more sensitive to deviations in the center of the distribution<br>
                    • Q-Q plots are better for detecting tail deviations
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated):</label>
                <textarea id="ppplotInput" rows="4" placeholder="Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33"></textarea>
                
                <label style="margin-top: 15px;">📊 Select Theoretical Distribution:</label>
                <select id="ppplotDistribution" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="normal">Normal Distribution</option>
                    <option value="uniform">Uniform Distribution</option>
                    <option value="exponential">Exponential Distribution</option>
                </select>
                
                <div id="ppplotParams" style="display: none;">
                    <!-- Dynamic params for distributions -->
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="ppplotComputeBtn">📊 Generate P-P Plot + Full Steps</button>
                    <button class="secondary-btn" id="ppplotClearBtn">Clear</button>
                </div>
            </div>
            <div id="ppplotResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 P-P PLOT RESULTS</div>
                    <div class="result-value" id="ppplotValueDisplay">—</div>
                    <div class="calculation-steps" id="ppplotStepsDisplay"></div>
                </div>
                <canvas id="ppplotChartCanvas" style="max-height: 500px; width: 100%; margin-top: 20px;"></canvas>
            </div>
        </div>
    `;
}
// ========== P-P PLOT COMPUTATION ==========
let ppplotChart = null;

function computePPPlotWithSteps(numbers, distType = 'normal') {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const n = numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mean = numbers.reduce((a,b) => a+b, 0) / n;
    const variance = numbers.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Calculate theoretical CDF and empirical CDF for each point
    const ppPoints = [];
    const calculationDetails = [];
    
    for (let i = 0; i < n; i++) {
        // Empirical CDF (using Blom's method for unbiased estimate)
        const empiricalCDF = (i + 1 - 0.375) / (n + 0.25);
        
        let theoreticalCDF;
        let theoreticalFormula = "";
        
        if (distType === 'normal') {
            const zScore = (sorted[i] - mean) / stdDev;
            theoreticalCDF = normalCDF(zScore, 0, 1);
            theoreticalFormula = `Φ((${sorted[i].toFixed(4)} - ${mean.toFixed(4)})/${stdDev.toFixed(4)}) = Φ(${zScore.toFixed(4)}) = ${theoreticalCDF.toFixed(6)}`;
        } else if (distType === 'uniform') {
            const minVal = Math.min(...numbers);
            const maxVal = Math.max(...numbers);
            theoreticalCDF = (sorted[i] - minVal) / (maxVal - minVal);
            theoreticalFormula = `(${sorted[i].toFixed(4)} - ${minVal.toFixed(4)})/(${maxVal.toFixed(4)} - ${minVal.toFixed(4)}) = ${theoreticalCDF.toFixed(6)}`;
        } else if (distType === 'exponential') {
            const rate = 1 / mean;
            theoreticalCDF = 1 - Math.exp(-rate * sorted[i]);
            theoreticalFormula = `1 - e^(-${rate.toFixed(4)} × ${sorted[i].toFixed(4)}) = ${theoreticalCDF.toFixed(6)}`;
        }
        
        ppPoints.push({
            empirical: empiricalCDF,
            theoretical: theoreticalCDF,
            value: sorted[i]
        });
        
        calculationDetails.push({
            i: i + 1,
            value: sorted[i],
            empiricalCDF: empiricalCDF,
            theoreticalCDF: theoreticalCDF,
            formula: theoreticalFormula
        });
    }
    
    // Calculate correlation between empirical and theoretical CDFs
    let sumEmp = 0, sumTheo = 0, sumEmpTheo = 0, sumEmp2 = 0, sumTheo2 = 0;
    
    for (let p of ppPoints) {
        sumEmp += p.empirical;
        sumTheo += p.theoretical;
        sumEmpTheo += p.empirical * p.theoretical;
        sumEmp2 += p.empirical * p.empirical;
        sumTheo2 += p.theoretical * p.theoretical;
    }
    
    const meanEmp = sumEmp / n;
    const meanTheo = sumTheo / n;
    const numerator = sumEmpTheo - n * meanEmp * meanTheo;
    const denominator = Math.sqrt((sumEmp2 - n * meanEmp * meanEmp) * (sumTheo2 - n * meanTheo * meanTheo));
    const correlation = numerator / denominator;
    
    // Build calculation table
    let calcRows = '';
    for (let d of calculationDetails) {
        calcRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${d.i}</td>
            <td style="padding: 8px; text-align: center;">${d.value.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; background: #e8f4f8; font-weight: bold;">${d.empiricalCDF.toFixed(6)}</td>
            <td style="padding: 8px; text-align: center;">${d.theoreticalCDF.toFixed(6)}</td>
            <td style="padding: 8px; text-align: center; font-family: monospace; font-size: 11px;">${d.formula}</td>
        </tr>`;
    }
    
    let distName = distType === 'normal' ? 'Normal' : (distType === 'uniform' ? 'Uniform' : 'Exponential');
    
    let steps = `
<div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 48px;">📊</span>
                    <div>
                        <h1 style="margin: 0; font-size: 28px;">P-P Plot Analysis</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9;">Probability-Probability Plot vs ${distName} Distribution</p>
                    </div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 11px; opacity: 0.8;">SAMPLE SIZE</div>
                <div style="font-size: 36px; font-weight: 700;">${n}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #28a745;">
            <div style="font-size: 11px; color: #6c757d;">MEAN</div>
            <div style="font-size: 24px; font-weight: 700; color: #28a745;">${mean.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #17a2b8;">
            <div style="font-size: 11px; color: #6c757d;">STD DEVIATION</div>
            <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${stdDev.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #ffc107;">
            <div style="font-size: 11px; color: #6c757d;">CORRELATION</div>
            <div style="font-size: 24px; font-weight: 700; color: #ffc107;">${correlation.toFixed(4)}</div>
        </div>
        <div style="background: white; border-radius: 16px; padding: 15px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #1a5490;">
            <div style="font-size: 11px; color: #6c757d;">RANGE</div>
            <div style="font-size: 24px; font-weight: 700;">${(Math.max(...numbers) - Math.min(...numbers)).toFixed(4)}</div>
        </div>
    </div>
    
    <!-- Step 1: Understanding P-P Plot -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">1</span>
            📖 Understanding P-P Plots
        </h2>
        
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <p><strong>What is a P-P Plot?</strong> A Probability-Probability plot compares the empirical CDF of your data against the theoretical CDF of a specified distribution.</p>
            
            <div style="margin: 15px 0; padding: 12px; background: #e8f4f8; border-radius: 8px;">
                <strong>📐 How to interpret:</strong><br>
                • <span style="color: #28a745;">Points follow the diagonal line</span> → Data follows the theoretical distribution<br>
                • <span style="color: #dc3545;">S-shaped pattern</span> → Distribution shape differs in the tails<br>
                • <span style="color: #ffc107;">Curved above/below diagonal</span> → Systematic bias in probabilities
            </div>
            
            <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                <strong>💡 Formula for empirical CDF (Blom's method):</strong><br>
                Fₙ(x) = (i - 0.375) / (n + 0.25)<br>
                where i = rank (1 to n), n = sample size
            </div>
        </div>
    </div>
    
    <!-- Step 2: Calculation Table -->
    <div style="background: white; border-radius: 16px; margin-bottom: 25px; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="background: #1a5490; color: white; padding: 14px 20px;">
            <h2 style="margin: 0; font-size: 16px;">🔢 Step 2: Calculate Empirical vs Theoretical CDF</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">For each data point: Fₙ(x) = (i - 0.375)/(n + 0.25)</p>
        </div>
        <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #e9ecef; position: sticky; top: 0;">
                        <th style="padding: 10px;">Rank (i)</th>
                        <th style="padding: 10px;">Value (x)</th>
                        <th style="padding: 10px;">Empirical CDF (Fₙ)</th>
                        <th style="padding: 10px;">Theoretical CDF (F)</th>
                        <th style="padding: 10px;">Calculation</th>
                    </tr>
                </thead>
                <tbody>
                    ${calcRows}
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Step 3: Correlation Calculation -->
    <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1a5490; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            <span style="background: #1a5490; color: white; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px;">3</span>
            📊 Correlation Between Empirical and Theoretical CDF
        </h2>
        
        <div style="background: white; border-radius: 12px; padding: 20px;">
            <div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                <strong>r = ${correlation.toFixed(8)}</strong><br>
                <strong>Interpretation:</strong> ${Math.abs(correlation) > 0.98 ? '✅ Very strong agreement → Data follows the theoretical distribution' : (Math.abs(correlation) > 0.95 ? '⚠️ Moderate agreement → Possible mild deviation' : '❌ Poor agreement → Data likely does NOT follow the distribution')}
            </div>
        </div>
    </div>
    
    <!-- Step 4: P-P Plot Visualization -->
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%); border-radius: 20px; padding: 25px; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; border-bottom: 2px solid #4fc3f7; padding-bottom: 15px;">
            <span style="font-size: 28px;">📊</span>
            <h3 style="margin: 0; color: #4fc3f7;">P-P PLOT VISUALIZATION</h3>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #b39ddb;">💡 Hover over points to see values | Points should follow the diagonal line for good fit</p>
        </div>
        
        <canvas id="ppplotChartCanvas" style="max-height: 500px; width: 100%; margin-top: 10px;"></canvas>
        
        <div style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: #4fc3f7; border-radius: 50%;"></div><span style="color: #e6edf3; font-size: 11px;">(Fₙ, F) Points</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 20px; height: 2px; background: #ef5350;"></div><span style="color: #e6edf3; font-size: 11px;">Diagonal Line (y = x)</span></div>
        </div>
    </div>
    
    <!-- Step 5: Interpretation -->
    <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-top: 25px;">
        <h2 style="color: #1a5490; margin-top: 0;">📌 Final Interpretation</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Distribution Fit Assessment:</strong><br>
                • ${distName} distribution<br>
                • Correlation: ${(correlation * 100).toFixed(1)}%<br>
                • ${Math.abs(correlation) > 0.98 ? '✅ Data follows the theoretical distribution' : (Math.abs(correlation) > 0.95 ? '⚠️ Data shows mild deviation' : '❌ Data likely does NOT follow the distribution')}
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>What to look for in the plot:</strong><br>
                • Points close to diagonal → Good fit<br>
                • S-curve → Differences in spread<br>
                • Consistent offset → Systematic bias
            </div>
            <div style="background: white; border-radius: 12px; padding: 15px;">
                <strong>Recommended next steps:</strong><br>
                ${Math.abs(correlation) > 0.98 ? '✓ Use parametric tests with confidence' : '⚠️ Consider data transformation or non-parametric alternatives'}
            </div>
        </div>
    </div>
</div>`;
    
    return { 
        steps, 
        ppPoints, 
        correlation, 
        mean, 
        stdDev, 
        n,
        sorted,
        distType,
        distName
    };
}
function renderPPPlotChart(stats) {
    const canvas = document.getElementById('ppplotChartCanvas');
    if (!canvas) return;
    
    if (ppplotChart) ppplotChart.destroy();
    
    const { ppPoints, correlation, distName } = stats;
    
    // Create diagonal line points (y = x from 0 to 1)
    const linePoints = [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
    ];
    
    const ctx = canvas.getContext('2d');
    
    ppplotChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Empirical vs Theoretical CDF',
                    data: ppPoints.map(p => ({ x: p.theoretical, y: p.empirical })),
                    backgroundColor: '#4fc3f7',
                    borderColor: '#4fc3f7',
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    pointStyle: 'circle',
                    showLine: false
                },
                {
                    label: 'Diagonal Line (y = x)',
                    data: linePoints,
                    type: 'scatter',
                    showLine: true,
                    borderColor: '#ef5350',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    fill: false,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `P-P Plot (${distName} Distribution) | n = ${stats.n} | Correlation = ${correlation.toFixed(4)}`,
                    font: { size: 14, weight: 'bold', family: "'Segoe UI', sans-serif" },
                    color: '#e6edf3',
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return [
                                `Theoretical CDF: ${context.parsed.x.toFixed(4)}`,
                                `Empirical CDF: ${context.parsed.y.toFixed(4)}`,
                                `Difference: ${(context.parsed.y - context.parsed.x).toFixed(4)}`
                            ];
                        }
                    },
                    backgroundColor: '#1a5490',
                    titleColor: 'white',
                    bodyColor: 'white'
                },
                legend: { 
                    position: 'top',
                    labels: { color: '#e6edf3', font: { size: 11 } }
                }
            },
            scales: {
                x: {
                    title: { 
                        display: true, 
                        text: 'Theoretical Cumulative Probability', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { color: '#e6edf3', font: { size: 11 }, stepSize: 0.1 },
                    min: 0,
                    max: 1
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Empirical Cumulative Probability', 
                        font: { weight: 'bold', size: 12 }, 
                        color: '#e6edf3' 
                    },
                    grid: { color: '#2d2d44' },
                    ticks: { color: '#e6edf3', font: { size: 11 }, stepSize: 0.1 },
                    min: 0,
                    max: 1
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 50,
                    right: 50
                }
            }
        }
    });
}
function setupPPPlotLogic() {
    const computeBtn = document.getElementById("ppplotComputeBtn");
    if (!computeBtn) return;
    
    const distSelect = document.getElementById("ppplotDistribution");
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("ppplotInput").value;
        const numbers = parseNumbersFromInput(raw);
        const distType = document.getElementById("ppplotDistribution").value;
        const resultDiv = document.getElementById("ppplotResultArea");
        const valueSpan = document.getElementById("ppplotValueDisplay");
        const stepsSpan = document.getElementById("ppplotStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter numbers to generate P-P plot.";
            return;
        }
        
        const result = computePPPlotWithSteps(numbers, distType);
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `📊 P-P Plot | n = ${result.n} | Correlation = ${result.correlation.toFixed(4)} | ${Math.abs(result.correlation) > 0.98 ? 'Good fit' : (Math.abs(result.correlation) > 0.95 ? 'Mild deviation' : 'Poor fit')}`;
        stepsSpan.innerHTML = result.steps;
        
        setTimeout(() => {
            renderPPPlotChart(result);
        }, 100);
    });
    
    attachClearHandler("ppplotClearBtn", "ppplotInput", "ppplotResultArea");
}
// ========== MUTUAL INFORMATION INTERFACE RENDER FUNCTION ==========
function renderMutualInfoInterface() {
    return `
        <div class="stat-interface" id="statMutualInfoInterface">
            <div class="interface-title">📊 Mutual Information (Non-linear Dependence)</div>
            <div class="formula-card">
                <div class="formula">📌 I(X;Y) = Σ Σ p(x,y) × log(p(x,y) / (p(x)·p(y)))</div>
                <div class="desc">
                    <strong>What is Mutual Information?</strong><br>
                    Mutual Information measures the mutual dependence between two variables.
                    It captures ANY type of relationship (linear AND non-linear).
                    I(X;Y) = 0 means X and Y are independent.
                </div>
                <div class="desc" style="margin-top: 8px;">
                    <strong>Key features:</strong><br>
                    • Works for continuous and discrete data<br>
                    • Detects non-linear relationships<br>
                    • Higher MI = stronger dependence<br>
                    • Measured in "bits" (log base 2) or "nats" (log base e)
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter X values (comma, space, or line separated):</label>
                <textarea id="mutualInfoXInput" rows="3" placeholder="Example: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10"></textarea>
                
                <label style="margin-top: 15px;">📋 Enter Y values (same number of values):</label>
                <textarea id="mutualInfoYInput" rows="3" placeholder="Example: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100"></textarea>
                
                <label style="margin-top: 15px;">📊 Number of bins for discretization:</label>
                <input type="number" id="mutualInfoBins" value="10" min="2" max="50" step="1" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                <div class="desc" style="font-size: 0.75rem;">Values are discretized into bins to estimate probability distributions</div>
                
                <div class="action-row">
                    <button class="primary-btn" id="mutualInfoComputeBtn">📊 Calculate Mutual Information + Full Steps</button>
                    <button class="secondary-btn" id="mutualInfoClearBtn">Clear All</button>
                </div>
            </div>
            <div id="mutualInfoResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MUTUAL INFORMATION RESULTS</div>
                    <div class="result-value" id="mutualInfoValueDisplay">—</div>
                    <div class="calculation-steps" id="mutualInfoStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== MUTUAL INFORMATION COMPUTATION ==========
// ========== MUTUAL INFORMATION COMPUTATION ==========
function computeMutualInformationWithSteps(xValues, yValues, numBins) {
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
        
        const result = computeMutualInformationWithSteps(xValues, yValues, numBins);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `I(X;Y) = ${result.mi.toFixed(6)} bits | NMI = ${result.nmi.toFixed(4)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    const clearBtn = document.getElementById("mutualInfoClearBtn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById("mutualInfoXInput").value = '';
            document.getElementById("mutualInfoYInput").value = '';
            document.getElementById("mutualInfoResultArea").style.display = 'none';
        });
    }
}
// ========== MCNEMAR'S TEST INTERFACE ==========
function renderMcNemarInterface() {
    return `
        <div class="stat-interface" id="statMcNemarInterface">
            <div class="interface-title">📊 McNemar's Test (Paired Categorical Data)</div>
            <div class="formula-card">
                <div class="formula">📌 χ² = (b - c)² / (b + c)</div>
                <div class="desc">
                    <strong>What is McNemar's Test?</strong><br>
                    Tests for changes in paired categorical data (before-after, matched pairs).
                    Used for 2×2 contingency tables with paired observations.
                    <br><br>
                    <strong>H₀:</strong> Marginal proportions are equal (no change)<br>
                    <strong>H₁:</strong> Marginal proportions are different (change occurred)
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter the 2×2 contingency table as 4 values (a, b, c, d):</label>
                <textarea id="mcnemarData" rows="4" placeholder="Example:&#10;10, 5, 3, 8&#10;&#10;Where:&#10;Before: Yes, After: No → a = both Yes&#10;Before: Yes, After: Yes → b&#10;Before: No, After: No → c&#10;Before: No, After: Yes → d"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Table layout:</strong><br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;After: No&nbsp;&nbsp;&nbsp;After: Yes<br>
                    Before: No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b<br>
                    Before: Yes&nbsp;&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="mcnemarAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="mcnemarComputeBtn">📊 Run McNemar's Test + Full Steps</button>
                    <button class="secondary-btn" id="mcnemarClearBtn">Clear</button>
                </div>
            </div>
            <div id="mcnemarResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MCNEMAR'S TEST RESULTS</div>
                    <div class="result-value" id="mcnemarValueDisplay">—</div>
                    <div class="calculation-steps" id="mcnemarStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== COCHRAN'S Q TEST INTERFACE ==========
function renderCochranQInterface() {
    return `
        <div class="stat-interface" id="statCochranQInterface">
            <div class="interface-title">🔬 Cochran's Q Test</div>
            <div class="formula-card">
                <div class="formula">📌 Q = (k(k-1) × Σ(Cⱼ - C̄)²) / (k × ΣRᵢ - ΣRᵢ²)</div>
                <div class="desc">
                    <strong>What is Cochran's Q Test?</strong><br>
                    Extension of McNemar's test for 3+ related groups. Tests if multiple 
                    matched/binary outcomes have the same proportion of "successes".
                    <br><br>
                    <strong>H₀:</strong> All treatments have the same effect<br>
                    <strong>H₁:</strong> At least one treatment differs
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data (each row = subject, each column = treatment, 0/1 values):</label>
                <textarea id="cochranData" rows="6" placeholder="Example (subjects × treatments):&#10;1, 1, 0&#10;1, 0, 0&#10;0, 1, 1&#10;1, 1, 1&#10;0, 0, 1"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> Each row is one subject. Each column is one treatment/time point.<br>
                    Values must be <strong>0 or 1</strong> (binary outcomes).
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="cochranAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="cochranComputeBtn">🔬 Run Cochran's Q Test + Full Steps</button>
                    <button class="secondary-btn" id="cochranClearBtn">Clear</button>
                </div>
            </div>
            <div id="cochranResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 COCHRAN'S Q TEST RESULTS</div>
                    <div class="result-value" id="cochranValueDisplay">—</div>
                    <div class="calculation-steps" id="cochranStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== MCNEMAR'S TEST COMPUTATION ==========
function computeMcNemarTest(inputText, alpha) {
    const values = parseNumbersFromInput(inputText);
    
    if (values.length !== 4) {
        return { error: true, message: "Please enter exactly 4 values (a, b, c, d) for the 2×2 contingency table." };
    }
    
    const [a, b, c, d] = values;
    const n = a + b + c + d;
    
    // Calculate McNemar's chi-square statistic
    let chiSquare;
    let continuityCorrection = 0;
    
    if (b + c > 0) {
        // With continuity correction (recommended)
        chiSquare = Math.pow(Math.abs(b - c) - 1, 2) / (b + c);
        continuityCorrection = 1;
    } else {
        chiSquare = 0;
    }
    
    const df = 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(chiSquare, df);
    const rejectH0 = chiSquare > criticalValue;
    
    // Build HTML table
    let tableHtml = `
    <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 20px; overflow-x: auto;">
        <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Contingency Table</h3>
        <table style="border-collapse: collapse; width: 100%; margin: 0 auto;">
            <thead>
                <tr style="background: #1a5490; color: white;">
                    <th style="border: 1px solid #ddd; padding: 12px;"></th>
                    <th style="border: 1px solid #ddd; padding: 12px;">After: No</th>
                    <th style="border: 1px solid #ddd; padding: 12px;">After: Yes</th>
                    <th style="border: 1px solid #ddd; padding: 12px;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #ddd;">
                    <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">Before: No</th>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">a = ${a}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">b = ${b}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${a+b}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                    <th style="border: 1px solid #ddd; padding: 12px; background: #e8f4f8;">Before: Yes</th>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">c = ${c}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">d = ${d}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${c+d}</td>
                </tr>
                <tr style="background: #e9ecef;">
                    <th style="border: 1px solid #ddd; padding: 12px;">Total</th>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${a+c}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${b+d}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${n}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📊</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">McNemar's Test</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Paired Categorical Data Analysis</p>
                </div>
            </div>
        </div>
        
        ${tableHtml}
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📐 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Step 1: Identify discordant pairs</strong><br>
                • b = number where Before: No, After: Yes = ${b}<br>
                • c = number where Before: Yes, After: No = ${c}<br>
                • Discordant pairs = b + c = ${b + c}
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Step 2: Calculate McNemar's chi-square statistic</strong><br>
                Formula: χ² = (|b - c| - 1)² / (b + c) [with continuity correction]<br>
                = (|${b} - ${c}| - 1)² / (${b} + ${c})<br>
                = (${Math.abs(b - c)} - 1)² / ${b + c}<br>
                = (${Math.abs(b - c) - 1})² / ${b + c}<br>
                = ${Math.pow(Math.abs(b - c) - 1, 2)} / ${b + c}<br>
                = <strong style="color: #1a5490; font-size: 18px;">χ² = ${chiSquare.toFixed(6)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Step 3: Compare with critical value</strong><br>
                Degrees of freedom = 1<br>
                Critical value (α = ${alpha}) = ${criticalValue.toFixed(4)}<br>
                p-value = ${pValue.toFixed(8)}<br><br>
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Conclusion:</strong> ${rejectH0 ? 'There is sufficient evidence that the proportions are different (significant change).' : 'There is NOT sufficient evidence of a difference between proportions.'}
            </div>
        </div>
    </div>`;
    
    return { chiSquare, df, pValue, criticalValue, rejectH0, steps };
}

// ========== COCHRAN'S Q TEST COMPUTATION ==========
function computeCochranQTest(inputText, alpha) {
    const lines = inputText.trim().split(/\r?\n/);
    let data = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        let values = parseNumbersFromInput(line);
        if (values.length > 0) {
            // Validate binary values
            let valid = true;
            for (let val of values) {
                if (val !== 0 && val !== 1) {
                    valid = false;
                    break;
                }
            }
            if (valid) data.push(values);
        }
    }
    
    if (data.length < 3) {
        return { error: true, message: "Need at least 3 subjects (rows) for Cochran's Q test." };
    }
    
    const n = data.length; // number of subjects
    const k = data[0].length; // number of treatments
    
    if (k < 3) {
        return { error: true, message: "Need at least 3 treatments (columns) for Cochran's Q test." };
    }
    
    // Check all rows have same number of columns
    for (let row of data) {
        if (row.length !== k) {
            return { error: true, message: "All rows must have the same number of treatments." };
        }
    }
    
    // Calculate column totals (Cⱼ)
    let colTotals = Array(k).fill(0);
    for (let j = 0; j < k; j++) {
        for (let i = 0; i < n; i++) {
            colTotals[j] += data[i][j];
        }
    }
    
    // Calculate row totals (Rᵢ)
    let rowTotals = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < k; j++) {
            rowTotals[i] += data[i][j];
        }
    }
    
    // Calculate Cochran's Q statistic
    let sumColTotals = colTotals.reduce((a,b) => a+b, 0);
    let sumColSquares = colTotals.reduce((a,b) => a + b*b, 0);
    let sumRowTotals = rowTotals.reduce((a,b) => a+b, 0);
    let sumRowSquares = rowTotals.reduce((a,b) => a + b*b, 0);
    
    let numerator = k * (k - 1) * sumColSquares - (k - 1) * sumColTotals * sumColTotals;
    let denominator = k * sumRowTotals - sumRowSquares;
    let Q = numerator / denominator;
    
    const df = k - 1;
    const criticalValue = chiSquareCriticalValue(alpha, df);
    const pValue = 1 - chiSquareCDF(Q, df);
    const rejectH0 = Q > criticalValue;
    
    // Build data table
    let dataRows = '';
    for (let i = 0; i < n; i++) {
        dataRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            ${data[i].map(val => `<td style="padding: 8px; text-align: center; font-weight: ${val === 1 ? 'bold' : 'normal'}; color: ${val === 1 ? '#28a745' : '#6c757d'};">${val}</td>`).join('')}
            <td style="padding: 8px; text-align: center; background: #e8f4f8;">${rowTotals[i]}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🔬</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">Cochran's Q Test</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Comparing Multiple Related Binary Outcomes</p>
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Data Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px;">Subjects (n)</div>
                    <div style="font-size: 32px; font-weight: 700;">${n}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px;">Treatments (k)</div>
                    <div style="font-size: 32px; font-weight: 700;">${k}</div>
                </div>
                <div style="background: white; padding: 12px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px;">Total "Successes"</div>
                    <div style="font-size: 32px; font-weight: 700;">${sumColTotals}</div>
                </div>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1a5490; color: white;">
                            <th style="padding: 10px;">Subject</th>
                            ${Array(k).fill().map((_, j) => `<th style="padding: 10px;">Treatment ${j+1}</th>`).join('')}
                            <th style="padding: 10px;">Row Total (Rᵢ)</th>
                        </tr>
                    </thead>
                    <tbody>${dataRows}</tbody>
                </table>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step-by-Step Calculation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Step 1: Calculate column totals (Cⱼ)</strong><br>
                ${colTotals.map((c, j) => `C<sub>${j+1}</sub> = ${c}`).join(', ')}<br>
                ΣCⱼ = ${sumColTotals}<br>
                ΣCⱼ² = ${colTotals.map(c => `${c}² = ${c*c}`).join(' + ')} = ${sumColSquares}
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Step 2: Calculate row totals (Rᵢ)</strong><br>
                ${rowTotals.map((r, i) => `R<sub>${i+1}</sub> = ${r}`).join(', ')}<br>
                ΣRᵢ = ${sumRowTotals}<br>
                ΣRᵢ² = ${rowTotals.map(r => `${r}² = ${r*r}`).join(' + ')} = ${sumRowSquares}
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Step 3: Calculate Cochran's Q statistic</strong><br>
                Q = [k(k-1) × ΣCⱼ² - (k-1) × (ΣCⱼ)²] / [k × ΣRᵢ - ΣRᵢ²]<br>
                Q = [${k}×${k-1} × ${sumColSquares} - ${k-1} × ${sumColTotals}²] / [${k} × ${sumRowTotals} - ${sumRowSquares}]<br>
                Q = [${k*(k-1)} × ${sumColSquares} - ${k-1} × ${sumColTotals*sumColTotals}] / [${k*sumRowTotals} - ${sumRowSquares}]<br>
                Q = [${k*(k-1)*sumColSquares} - ${(k-1)*sumColTotals*sumColTotals}] / [${k*sumRowTotals} - ${sumRowSquares}]<br>
                Q = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}<br>
                <strong style="color: #1a5490; font-size: 18px;">Q = ${Q.toFixed(6)}</strong>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #d4edda; border-left: 6px solid #28a745;' : 'background: #f8d7da; border-left: 6px solid #dc3545;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>Q Statistic:</strong> ${Q.toFixed(6)}</div>
            <div><strong>Degrees of Freedom:</strong> ${df}</div>
            <div><strong>Critical Value (α = ${alpha}):</strong> ${criticalValue.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Conclusion:</strong> ${rejectH0 ? 'There IS sufficient evidence that the treatments have different effects (proportions are not equal).' : 'There is NOT sufficient evidence that the treatments differ in their effects.'}
            </div>
        </div>
    </div>`;
    
    return { Q, df, pValue, criticalValue, rejectH0, steps };
}
// ========== MCNEMAR'S TEST SETUP ==========
function setupMcNemarLogic() {
    const computeBtn = document.getElementById("mcnemarComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("mcnemarData").value;
        const alpha = parseFloat(document.getElementById("mcnemarAlpha").value);
        const resultDiv = document.getElementById("mcnemarResultArea");
        const valueSpan = document.getElementById("mcnemarValueDisplay");
        const stepsSpan = document.getElementById("mcnemarStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter 4 values (a, b, c, d).";
            return;
        }
        
        const result = computeMcNemarTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `χ² = ${result.chiSquare.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("mcnemarClearBtn", "mcnemarData", "mcnemarResultArea");
}

// ========== COCHRAN'S Q TEST SETUP ==========
function setupCochranQLogic() {
    const computeBtn = document.getElementById("cochranComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("cochranData").value;
        const alpha = parseFloat(document.getElementById("cochranAlpha").value);
        const resultDiv = document.getElementById("cochranResultArea");
        const valueSpan = document.getElementById("cochranValueDisplay");
        const stepsSpan = document.getElementById("cochranStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter data (0/1 values, rows = subjects, columns = treatments).";
            return;
        }
        
        const result = computeCochranQTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `Q = ${result.Q.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("cochranClearBtn", "cochranData", "cochranResultArea");
}
// ========== RUNS TEST (RANDOMNESS) INTERFACE ==========
function renderRunsTestInterface() {
    return `
        <div class="stat-interface" id="statRunsTestInterface">
            <div class="interface-title">🎲 Runs Test for Randomness</div>
            <div class="formula-card">
                <div class="formula">📌 Z = (R - μ_R) / σ_R</div>
                <div class="desc">
                    <strong>What is the Runs Test?</strong><br>
                    Tests whether a sequence of binary observations is random.
                    A "run" is a consecutive sequence of identical symbols.
                    <br><br>
                    <strong>H₀:</strong> The sequence is random<br>
                    <strong>H₁:</strong> The sequence is not random
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter sequence (comma, space, or line separated, use 0/1 or any two symbols):</label>
                <textarea id="runsTestInput" rows="4" placeholder="Example: 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    Values will be treated as two categories (e.g., 0/1, A/B, Yes/No)
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="runsTestAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="runsTestComputeBtn">🎲 Run Runs Test + Full Steps</button>
                    <button class="secondary-btn" id="runsTestClearBtn">Clear</button>
                </div>
            </div>
            <div id="runsTestResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 RUNS TEST RESULTS</div>
                    <div class="result-value" id="runsTestValueDisplay">—</div>
                    <div class="calculation-steps" id="runsTestStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== RUNS TEST COMPUTATION ==========
function computeRunsTest(inputText, alpha) {
    const rawValues = inputText.trim().split(/[,\s\n]+/);
    let sequence = [];
    
    for (let val of rawValues) {
        val = val.trim();
        if (val === "") continue;
        // Try to parse as number first
        let num = parseFloat(val);
        if (!isNaN(num)) {
            sequence.push(num);
        } else {
            // If not a number, treat as string category
            sequence.push(val);
        }
    }
    
    if (sequence.length < 3) {
        return { error: true, message: "Need at least 3 observations for Runs test." };
    }
    
    const n = sequence.length;
    
    // Count runs and frequencies of each value
    let runs = 1;
    let count1 = 0;
    let count2 = 0;
    let runDetails = [];
    let currentRun = [sequence[0]];
    let firstValue = sequence[0];
    
    for (let i = 1; i < n; i++) {
        if (sequence[i] === sequence[i-1]) {
            currentRun.push(sequence[i]);
        } else {
            runs++;
            runDetails.push({ value: currentRun[0], length: currentRun.length, positions: [i - currentRun.length + 1, i] });
            currentRun = [sequence[i]];
        }
    }
    runDetails.push({ value: currentRun[0], length: currentRun.length, positions: [n - currentRun.length + 1, n] });
    
    // Count frequencies of each unique value
    const uniqueValues = [...new Set(sequence)];
    let n1 = 0, n2 = 0;
    let value1 = uniqueValues[0];
    let value2 = uniqueValues.length > 1 ? uniqueValues[1] : null;
    
    for (let val of sequence) {
        if (val === value1) n1++;
        else if (value2 !== null && val === value2) n2++;
    }
    
    // If only one unique value, test is trivial
    if (value2 === null) {
        return { error: true, message: "Sequence must contain at least two different symbols." };
    }
    
    // Calculate expected runs and standard deviation
    const expectedRuns = (2 * n1 * n2) / (n1 + n2) + 1;
    const numeratorStd = 2 * n1 * n2 * (2 * n1 * n2 - n1 - n2);
    const denominatorStd = Math.pow(n1 + n2, 2) * (n1 + n2 - 1);
    const stdRuns = Math.sqrt(numeratorStd / denominatorStd);
    
    // Calculate z-statistic
    let z = (runs - expectedRuns) / stdRuns;
    const pValue = 2 * (1 - normCDF(Math.abs(z)));
    const criticalZ = normInv(1 - alpha / 2);
    const rejectH0 = Math.abs(z) > criticalZ;
    
    // Build run details table
    let runTableRows = '';
    for (let i = 0; i < runDetails.length; i++) {
        const r = runDetails[i];
        runTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: ${r.value === value1 ? '#28a745' : '#dc3545'};">${r.value}</td>
            <td style="padding: 8px; text-align: center;">${r.length}</td>
            <td style="padding: 8px; text-align: center;">Positions ${r.positions[0]} to ${r.positions[1]} (${r.length} ${r.value === value1 ? value1 : value2}(s))</td>
        </tr>`;
    }
    
    // Build sequence display with colored runs
    let sequenceDisplay = '';
    let currentColor = '';
    for (let i = 0; i < n; i++) {
        const val = sequence[i];
        const color = val === value1 ? '#28a745' : '#dc3545';
        if (i > 0 && sequence[i] !== sequence[i-1]) {
            sequenceDisplay += `<span style="color: ${color}; font-weight: bold;"> ${val} </span>`;
        } else if (i === 0) {
            sequenceDisplay += `<span style="color: ${color}; font-weight: bold;">${val} </span>`;
        } else {
            sequenceDisplay += `<span style="color: ${color};">${val} </span>`;
        }
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 25px 30px; border-radius: 20px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">🎲</span>
                <div>
                    <h1 style="margin: 0; font-size: 28px;">Runs Test for Randomness</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Testing if a sequence occurs in a random order</p>
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📊 Understanding the Runs Test</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p><strong>What is a "Run"?</strong> A run is a consecutive sequence of identical symbols.</p>
                <p><strong>Example:</strong> In the sequence <code>1 1 0 0 0 1 0 1 1</code>, runs are: <strong>1 1</strong> | <strong>0 0 0</strong> | <strong>1</strong> | <strong>0</strong> | <strong>1 1</strong> → 5 runs total.</p>
                <p><strong>Interpretation:</strong></p>
                <ul>
                    <li><strong>Too few runs</strong> → Clustering (non-random pattern)</li>
                    <li><strong>Too many runs</strong> → Alternating pattern (non-random)</li>
                    <li><strong>Expected runs</strong> → Random sequence</li>
                </ul>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">📋 Input Sequence</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace; font-size: 18px; text-align: center; padding: 15px; background: #f0f4fa; border-radius: 8px;">
                    ${sequenceDisplay}
                </div>
                <div style="margin-top: 15px;">
                    <strong>n = ${n}</strong> observations<br>
                    <strong>${value1}:</strong> ${n1} occurrences | <strong>${value2}:</strong> ${n2} occurrences
                </div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 20px; overflow-x: auto;">
            <h3 style="margin: 0; padding: 16px; background: #1a5490; color: white;">🔢 Step 1: Identify All Runs</h3>
            <div style="padding: 15px;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #e9ecef;">
                                <th style="padding: 10px;">Run #</th>
                                <th style="padding: 10px;">Value</th>
                                <th style="padding: 10px;">Length</th>
                                <th style="padding: 10px;">Positions</th>
                            </tr>
                        </thead>
                        <tbody>${runTableRows}
                            <tr style="background: #e9ecef; font-weight: bold;">
                                <td colspan="3" style="padding: 10px; text-align: right;">Total Runs (R) →</td>
                                <td style="padding: 10px; text-align: center; background: #1a5490; color: white;">${runs}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Calculate Expected Runs and Standard Deviation</h3>
            
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <strong>Formula for Expected Runs (μ_R):</strong><br>
                μ_R = (2 × n₁ × n₂) / (n₁ + n₂) + 1<br>
                μ_R = (2 × ${n1} × ${n2}) / (${n1} + ${n2}) + 1<br>
                μ_R = (${2 * n1 * n2}) / ${n1 + n2} + 1<br>
                μ_R = ${(2 * n1 * n2 / (n1 + n2)).toFixed(4)} + 1 = <strong style="color: #1a5490;">${expectedRuns.toFixed(4)}</strong>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula for Standard Deviation (σ_R):</strong><br>
                σ_R = √[ (2 × n₁ × n₂ × (2 × n₁ × n₂ - n₁ - n₂) ) / ( (n₁ + n₂)² × (n₁ + n₂ - 1) ) ]<br>
                σ_R = √[ (2 × ${n1} × ${n2} × (2 × ${n1} × ${n2} - ${n1} - ${n2})) / ( (${n1 + n2})² × (${n1 + n2 - 1}) ) ]<br>
                σ_R = √[ ${2 * n1 * n2} × (${2 * n1 * n2 - n1 - n2}) / ( ${Math.pow(n1 + n2, 2)} × ${n1 + n2 - 1} ) ]<br>
                σ_R = √[ ${numeratorStd} / ${denominatorStd} ]<br>
                σ_R = √${(numeratorStd / denominatorStd).toFixed(6)} = <strong style="color: #1a5490;">${stdRuns.toFixed(4)}</strong>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate z-statistic</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <strong>Formula:</strong> z = (R - μ_R) / σ_R<br>
                z = (${runs} - ${expectedRuns.toFixed(4)}) / ${stdRuns.toFixed(4)}<br>
                z = ${(runs - expectedRuns).toFixed(4)} / ${stdRuns.toFixed(4)}<br>
                <div style="font-size: 24px; font-weight: 700; color: #1a5490; text-align: center; margin-top: 10px;">z = ${z.toFixed(8)}</div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Test Conclusion</h3>
            <div><strong>Runs (R):</strong> ${runs}</div>
            <div><strong>Expected Runs (μ_R):</strong> ${expectedRuns.toFixed(4)}</div>
            <div><strong>Standard Deviation (σ_R):</strong> ${stdRuns.toFixed(4)}</div>
            <div><strong>z-statistic:</strong> ${z.toFixed(6)}</div>
            <div><strong>Critical z (α = ${alpha}, two-tailed):</strong> ±${criticalZ.toFixed(4)}</div>
            <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
            <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <strong>Decision:</strong> ${rejectH0 ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}<br>
                <strong>Conclusion:</strong> ${rejectH0 ? 'There IS sufficient evidence that the sequence is NOT random.' : 'There is NOT sufficient evidence to reject randomness. The sequence appears random.'}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background: #e8f4f8; border-radius: 12px;">
            <strong>💡 Interpretation Guide:</strong><br>
            • If z > ${criticalZ.toFixed(4)} → Too few runs (clustering pattern)<br>
            • If z < -${criticalZ.toFixed(4)} → Too many runs (alternating pattern)<br>
            • If |z| ≤ ${criticalZ.toFixed(4)} → Sequence is random
        </div>
    </div>`;
    
    return { runs, expectedRuns, stdRuns, z, pValue, rejectH0, steps };
}

// ========== MOOD'S MEDIAN TEST INTERFACE ==========
function renderMoodsMedianInterface() {
    return `
        <div class="stat-interface" id="statMoodsMedianInterface">
            <div class="interface-title">📊 Mood's Median Test</div>
            <div class="formula-card">
                <div class="formula">📌 χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ</div>
                <div class="desc">
                    <strong>What is Mood's Median Test?</strong><br>
                    A non-parametric test to compare medians of two or more groups.
                    Tests whether samples come from populations with the same median.
                    <br><br>
                    <strong>H₀:</strong> All group medians are equal<br>
                    <strong>H₁:</strong> At least one group median differs
                </div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter data with group labels (format: value:group):</label>
                <textarea id="moodsData" rows="5" placeholder="Example:&#10;23:A, 25:A, 24:A, 22:A&#10;28:B, 30:B, 29:B, 31:B&#10;35:C, 33:C, 34:C, 36:C"></textarea>
                <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">
                    <strong>Format:</strong> value:group (comma or space separated)
                </div>
                
                <label style="margin-top: 15px;">📊 Significance Level (α):</label>
                <select id="moodsAlpha" style="width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;">
                    <option value="0.10">α = 0.10 (90% Confidence Level)</option>
                    <option value="0.05" selected>α = 0.05 (95% Confidence Level) - Standard</option>
                    <option value="0.01">α = 0.01 (99% Confidence Level)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="moodsComputeBtn">📊 Run Mood's Median Test + Full Steps</button>
                    <button class="secondary-btn" id="moodsClearBtn">Clear</button>
                </div>
            </div>
            <div id="moodsResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 MOOD'S MEDIAN TEST RESULTS</div>
                    <div class="result-value" id="moodsValueDisplay">—</div>
                    <div class="calculation-steps" id="moodsStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== MOOD'S MEDIAN TEST COMPUTATION ==========
function computeMoodsMedianTest(inputText, alpha) {
    const lines = inputText.trim().split(/[,\s\n]+/);
    let groups = new Map();
    
    for (let entry of lines) {
        entry = entry.trim();
        if (entry === "") continue;
        let [valStr, groupName] = entry.split(':');
        let val = parseFloat(valStr);
        if (!isNaN(val) && isFinite(val) && groupName) {
            groupName = escapeHtml(groupName.trim());
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(val);
        }
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
                    💡 Values <strong>equal to the median</strong> are excluded from analysis (shown as 0).
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
    
    return { chiSquare, df, pValue, criticalValue, rejectH0, overallMedian, steps };
}

// ========== SETUP FUNCTIONS ==========
function setupRunsTestLogic() {
    const computeBtn = document.getElementById("runsTestComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("runsTestInput").value;
        const alpha = parseFloat(document.getElementById("runsTestAlpha").value);
        const resultDiv = document.getElementById("runsTestResultArea");
        const valueSpan = document.getElementById("runsTestValueDisplay");
        const stepsSpan = document.getElementById("runsTestStepsDisplay");
        
        if (!raw.trim()) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerHTML = "Please enter a sequence of values.";
            return;
        }
        
        const result = computeRunsTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `R = ${result.runs} | z = ${result.z.toFixed(6)} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Non-random' : 'Random'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("runsTestClearBtn", "runsTestInput", "runsTestResultArea");
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
            stepsSpan.innerHTML = "Please enter data in format 'value:group'";
            return;
        }
        
        const result = computeMoodsMedianTest(raw, alpha);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            stepsSpan.innerHTML = result.message;
        } else {
            valueSpan.innerHTML = `χ² = ${result.chiSquare.toFixed(6)} | df = ${result.df} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Medians differ' : 'Medians equal'}`;
            stepsSpan.innerHTML = result.steps;
        }
    });
    
    attachClearHandler("moodsClearBtn", "moodsData", "moodsResultArea");
}
