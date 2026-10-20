/* QQPlot: qqplot tool (render, compute, setup) */

function renderQQPlotInterface() {
    return buildInterface({
        id: "statQQPlotInterface",
        title: "📈 Q-Q Plot (Quantile-Quantile Plot)",
        card: [
            { formula: "📌 Compares sample quantiles against theoretical normal quantiles" },
            {
                desc: "<strong>What is a Q-Q Plot?</strong><br>\n                    A Q-Q plot compares the distribution of your data to a theoretical normal distribution.\n                    If the points fall approximately along a straight diagonal line, the data is likely normally distributed."
            },
            {
                desc: "<strong>Interpretation:</strong><br>\n                    • <span class=\"s-7773e9\">Points follow the line</span> → Data is normally distributed<br>\n                    • <span class=\"s-81c63c\">S-shaped curve</span> → Heavy tails or light tails<br>\n                    • <span class=\"s-2673ca\">Curved pattern</span> → Skewed distribution",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated):",
                textarea: { id: "qqplotInput", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33" }
            }
        ],
        run: { id: "qqplotComputeBtn", text: "📈 Generate Q-Q Plot + Full Steps" },
        clear: { id: "qqplotClearBtn", text: "Clear" },
        result: {
            area: "qqplotResultArea",
            label: "🎯 Q-Q PLOT RESULTS",
            value: "qqplotValueDisplay",
            steps: "qqplotStepsDisplay"
        }
    });
}

function computeQQPlotWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    if (numbers.length < 3) return { error: true, message: "A Q-Q plot needs at least 3 values (with 2 points the correlation is always 1)." };
    if (!(Math.max(...numbers) - Math.min(...numbers) > 0)) return { error: true, message: "All values are identical, so the Q-Q plot is undefined (zero spread)." };
    
    const n = numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mean = numbers.reduce((a,b) => a+b, 0) / n;
    const variance = numbers.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const theoreticalQuantiles = [];
    const sampleQuantiles = [];
    const calculationDetails = [];
    
    for (let i = 0; i < n; i++) {
        const p = (i + 1 - 0.375) / (n + 0.25);
        const q = p - 0.5;
        // The normal quantile comes from the shared inverse CDF (core/numerics.js), the single source of truth for the app
        const z = normInv(p);
        const calculationType = Math.abs(q) <= 0.425 ? "central" : "tail";
        const detailedSteps = `i = ${i + 1}, n = ${n}\n` +
            `p = (i - 0.375) / (n + 0.25) = (${i + 1} - 0.375) / (${n} + 0.25) = ${p.toFixed(6)}\n` +
            `z = Φ⁻¹(p) = Φ⁻¹(${p.toFixed(6)}) = ${z.toFixed(6)}\n` +
            `(Φ⁻¹ is the inverse of the standard normal CDF: a rational approximation refined by one Halley step, accurate to about 1e-15.)`;
        
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
        allCorrRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${d.i}</td>
            <td class="s-fce575">${d.x}</td>
            <td class="s-fce575">${d.y}</td>
            <td class="s-a7c3f4">${d.xy}</td>
            <td class="s-a7c3f4">${d.x2}</td>
            <td class="s-a7c3f4">${d.y2}</td>
        </tr>`;
    }
    
    // Build ALL calculation rows with expandable details (no truncation!)
    let allCalcRows = '';
    for (let d of calculationDetails) {
        let typeLabel = d.calculationType === "central" ? "📊 Central" : (d.calculationType === "tail" ? "📈 Tail" : "⚪ Edge");
        allCalcRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${d.i}</td>
            <td class="s-a7c3f4">${d.value.toFixed(4)}</td>
            <td class="s-a7c3f4">${d.probability}</td>
            <td class="s-a7c3f4">${d.q}</td>
            <td class="s-a7c3f4">
                <details>
                    <summary class="s-461129">${d.zScore}</summary>
                    <div class="s-d52693">
                        ${d.detailedSteps.replace(/\n/g, '<br>')}
                    </div>
                </details>
                <span class="s-d770c8">(${typeLabel})</span>
            </td>
        </tr>`;
    }
    
    let steps = `
<div class="s-3097a8">
    
    <!-- Header -->
    <div class="s-aedb37">
        <div class="s-b15718 gen-flex">
            <div>
                <div class="s-e9f44b gen-flex">
                    <span class="s-93df4f gen-big">📈</span>
                    <div>
                        <h1 class="s-b80b8c">Q-Q Plot Analysis</h1>
                        <p class="s-259079">Quantile-Quantile Plot for Normality Assessment</p>
                    </div>
                </div>
            </div>
            <div class="s-f85ed7">
                <div class="s-7ce57c">SAMPLE SIZE</div>
                <div class="s-ae9e1c gen-big">${n}</div>
            </div>
        </div>
    </div>
    
    <!-- KPI Cards -->
    <div class="s-3d837c gen-grid">
        <div class="s-9ca8be">
            <div class="s-033765">MEAN</div>
            <div class="s-d3b644">${mean.toFixed(4)}</div>
        </div>
        <div class="s-0b060f">
            <div class="s-033765">STD DEVIATION</div>
            <div class="s-3c6f5f">${stdDev.toFixed(4)}</div>
        </div>
        <div class="s-f94899">
            <div class="s-033765">CORRELATION</div>
            <div class="s-7fdc7a">${correlation.toFixed(4)}</div>
        </div>
        <div class="s-fd7545">
            <div class="s-033765">RANGE</div>
            <div class="s-c2434f">${(Math.max(...numbers) - Math.min(...numbers)).toFixed(4)}</div>
        </div>
    </div>
    
    <!-- Step 1: Understanding Q-Q Plot -->
    <div class="s-bfd155 gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-09767f gen-sized">1</span>
            📖 Understanding Q-Q Plots
        </h2>
        
        <div class="s-6fab3a gen-pad">
            <p><strong>What is a Q-Q Plot?</strong> A Quantile-Quantile plot compares the quantiles of your data against the quantiles of a theoretical normal distribution.</p>
            
            <div class="s-efcf63">
                <strong>📐 How to interpret:</strong><br>
                • <span class="s-7773e9">Points follow the diagonal line</span> → Data is normally distributed<br>
                • <span class="s-81c63c">S-shaped pattern</span> → Heavy tails (more outliers than normal)<br>
                • <span class="s-2673ca">Curved upward/downward</span> → Skewed distribution<br>
                • <span class="s-a2648b">Correlation near 1</span> → Strong evidence of normality
            </div>
            
            <div class="s-6da5f7">
                <strong>💡 Formula for probability positions (Blom's method):</strong><br>
                p = (i - 0.375) / (n + 0.25)<br>
                where i = rank (1 to n), n = sample size<br><br>
                <strong>Then calculate:</strong> q = p - 0.5
            </div>
        </div>
    </div>
    
    <!-- Step 2: Calculation Table (ALL rows - scrollable) -->
    <div class="s-802cd7">
        <div class="s-63fd4e">
            <h2 class="s-123848">🔢 Step 2: Quantile Calculations (All ${n} Data Points)</h2>
            <p class="s-92c601">For each data point: p = (i - 0.375)/(n + 0.25) → q = p - 0.5 → z = Φ⁻¹(p)</p>
            <p class="s-92c601"><strong>👇 Click on any z-value to see the complete step-by-step calculation!</strong></p>
            <p class="s-3fc726">📌 Scroll horizontally if needed | ${n} total observations</p>
        </div>
        <div class="s-a1e1e3">
            <table class="s-306b2c gen-sized">
                <thead>
                    <tr class="s-380b77">
                        <th class="s-ac65bb">Rank (i)</th>
                        <th class="s-ac65bb">Sample Value (x)</th>
                        <th class="s-ac65bb">Probability p</th>
                        <th class="s-ac65bb">q = p - 0.5</th>
                        <th class="s-ac65bb">Theoretical Quantile (z) - Click to see calculation</th>
                    </tr>
                </thead>
                <tbody>
                    ${allCalcRows}
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Step 3: Detailed Correlation Calculation (ALL rows) -->
    <div class="s-95d04a gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-09767f gen-sized">3</span>
            📊 Step-by-Step Correlation Calculation (All ${n} Data Points)
        </h2>
        
        <div class="s-6fab3a gen-pad">
            <p><strong>Formula:</strong> r = Σ(z - z̄)(x - x̄) / √[Σ(z - z̄)² × Σ(x - x̄)²]</p>
            
            <div class="s-a1e1e3">
                <table class="s-776a1d gen-sized">
                    <thead>
                        <tr class="s-e7cb60">
                            <th class="s-939795">i</th>
                            <th class="s-939795">z (Theoretical)</th>
                            <th class="s-939795">x (Sample)</th>
                            <th class="s-939795">z × x</th>
                            <th class="s-939795">z²</th>
                            <th class="s-939795">x²</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allCorrRows}
                        <tr class="s-17b154">
                            <td class="s-641001">SUM →</td>
                            <td class="s-a7c3f4">${sumX.toFixed(4)}</td>
                            <td class="s-a7c3f4">${sumY.toFixed(4)}</td>
                            <td class="s-a7c3f4">${sumXY.toFixed(4)}</td>
                            <td class="s-a7c3f4">${sumX2.toFixed(4)}</td>
                            <td class="s-a7c3f4">${sumY2.toFixed(4)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="s-a5b4cc">
                <strong>📐 Step 3a: Calculate means</strong><br>
                z̄ = Σz / n = ${sumX.toFixed(4)} / ${n} = ${meanX.toFixed(6)}<br>
                x̄ = Σx / n = ${sumY.toFixed(4)} / ${n} = ${meanY.toFixed(6)}
            </div>
            
            <div class="s-fa7a72">
                <strong>📐 Step 3b: Calculate numerator (Covariance sum)</strong><br>
                Σ(z - z̄)(x - x̄) = Σzx - n·z̄·x̄<br>
                = ${sumXY.toFixed(4)} - ${n} × ${meanX.toFixed(6)} × ${meanY.toFixed(6)}<br>
                = ${sumXY.toFixed(4)} - ${(n * meanX * meanY).toFixed(4)}<br>
                = <strong class="s-f342b5">${numerator.toFixed(6)}</strong>
            </div>
            
            <div class="s-fa7a72">
                <strong>📐 Step 3c: Calculate denominator</strong><br>
                Σ(z - z̄)² = Σz² - n·z̄² = ${sumX2.toFixed(4)} - ${n} × ${(meanX * meanX).toFixed(6)} = ${(sumX2 - n * meanX * meanX).toFixed(6)}<br>
                Σ(x - x̄)² = Σx² - n·x̄² = ${sumY2.toFixed(4)} - ${n} × ${(meanY * meanY).toFixed(6)} = ${(sumY2 - n * meanY * meanY).toFixed(6)}<br>
                Product = ${(sumX2 - n * meanX * meanX).toFixed(6)} × ${(sumY2 - n * meanY * meanY).toFixed(6)} = ${((sumX2 - n * meanX * meanX) * (sumY2 - n * meanY * meanY)).toFixed(6)}<br>
                √Product = ${denominator.toFixed(6)}
            </div>
            
            <div class="s-d6cf81">
                <strong>📐 Step 3d: Calculate correlation</strong><br>
                r = ${numerator.toFixed(6)} / ${denominator.toFixed(6)}<br>
                <div class="s-ab5ee6">
                    <strong class="s-f342b5">r = ${correlation.toFixed(8)}</strong>
                </div>
                <strong>Interpretation:</strong> ${Math.abs(correlation) > 0.98 ? '✅ Very strong linear relationship → Data appears normally distributed' : (Math.abs(correlation) > 0.95 ? '⚠️ Moderate relationship → Possible mild deviation from normality' : '❌ Weak relationship → Data likely NOT normally distributed')}
            </div>
        </div>
    </div>
    
    <!-- Step 4: Q-Q Plot Visualization -->
    <div class="s-117739 gen-pad">
        <div class="s-74360b gen-flex">
            <span class="s-da9be8">📈</span>
            <h3 class="s-e89f6f">Q-Q PLOT VISUALIZATION</h3>
            <p class="s-79cb4e">💡 Hover over points to see values | Points should follow the red line for normality</p>
        </div>
        
        <canvas class="s-0e19d6 gen-sized" id="qqplotChartCanvas"></canvas>
        
        <div class="s-4eeef9 gen-flex">
            <div class="s-6d12cd gen-flex"><div class="s-be0df3 gen-sized"></div><span class="s-205a8c">Sample Quantiles</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-b547cb gen-sized"></div><span class="s-205a8c">Theoretical Line (y = x̄ + z·s)</span></div>
        </div>
    </div>
    
    <!-- Step 5: Interpretation -->
    <div class="s-284793 gen-pad">
        <h2 class="s-2ce3ad">📌 Final Interpretation</h2>
        <div class="s-9ee21a gen-grid">
            <div class="s-6fdce2">
                <strong>Normality Assessment:</strong><br>
                • Correlation with theoretical line: ${(correlation * 100).toFixed(1)}%<br>
                • ${Math.abs(correlation) > 0.98 ? '✅ Data appears normally distributed' : (Math.abs(correlation) > 0.95 ? '⚠️ Data shows mild deviation from normality' : '❌ Data is likely NOT normally distributed')}
            </div>
            <div class="s-6fdce2">
                <strong>What to look for in the plot:</strong><br>
                • Points close to red line → Good fit<br>
                • S-curve → Heavy tails<br>
                • Curved pattern → Skewness
            </div>
            <div class="s-6fdce2">
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
    if (!chartJsReady(renderQQPlotChart, arguments)) return;
    const canvas = document.getElementById('qqplotChartCanvas');
    if (!canvas) return;
    labelChart(canvas, `Normal Q-Q plot of ${describeSample(stats.sorted)}. Sample quantiles are plotted against theoretical normal quantiles; points near the reference line mean the data are close to normal.`);
    
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
            setHtml(stepsSpan, "Please enter numbers to generate Q-Q plot.");
            return;
        }
        
        const result = computeQQPlotWithSteps(numbers);
        resultDiv.style.display = "block";
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, "⚠️ " + escapeHtml(result.message));
            return;
        }
        setHtml(valueSpan, `📈 Q-Q Plot | n = ${result.n} | Correlation = ${result.correlation.toFixed(4)} | ${Math.abs(result.correlation) > 0.98 ? 'Normal' : (Math.abs(result.correlation) > 0.95 ? 'Mild deviation' : 'Non-normal')}`);
        setHtml(stepsSpan, result.steps);
        
        setTimeout(() => {
            renderQQPlotChart(result);
        }, 100);
    });
    
    attachClearHandler("qqplotClearBtn", "qqplotInput", "qqplotResultArea");
}
