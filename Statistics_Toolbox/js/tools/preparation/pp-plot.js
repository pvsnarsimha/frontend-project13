/* PPPlot: ppplot tool (render, compute, setup) */

// ========== P-P PLOT RENDER FUNCTION ==========
function renderPPPlotInterface() {
    return buildInterface({
        id: "statPPPlotInterface",
        title: "📊 P-P Plot (Probability-Probability Plot)",
        card: [
            { formula: "📌 Compares empirical CDF against theoretical CDF" },
            {
                desc: "<strong>What is a P-P Plot?</strong><br>\n                    A P-P plot compares the cumulative distribution function (CDF) of your data \n                    against the theoretical CDF of a normal distribution. Points along the diagonal \n                    line indicate that the data follows the theoretical distribution."
            },
            {
                desc: "<strong>Difference from Q-Q Plot:</strong><br>\n                    • <strong>P-P plot</strong> compares cumulative probabilities (0 to 1)<br>\n                    • <strong>Q-Q plot</strong> compares quantiles (z-scores)<br>\n                    • P-P plots are more sensitive to deviations in the center of the distribution<br>\n                    • Q-Q plots are better for detecting tail deviations",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter numeric values (comma, space, or line separated):",
                textarea: { id: "ppplotInput", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 25, 24, 22, 35, 34, 33" }
            },
            {
                label: "📊 Select Theoretical Distribution:",
                labelAttrs: { style: FIELD_GAP },
                select: { id: "ppplotDistribution", style: FIELD_STYLE },
                options: [
                    ["normal", "Normal Distribution"],
                    ["uniform", "Uniform Distribution"],
                    ["exponential", "Exponential Distribution"]
                ]
            },
            {
                html: `<p style="${HINT_STYLE}">Distribution parameters are estimated from your data: mean and standard deviation (normal), minimum and maximum (uniform), 1/mean (exponential).</p>`
            }
        ],
        run: { id: "ppplotComputeBtn", text: "📊 Generate P-P Plot + Full Steps" },
        clear: { id: "ppplotClearBtn", text: "Clear" },
        result: {
            area: "ppplotResultArea",
            label: "🎯 P-P PLOT RESULTS",
            value: "ppplotValueDisplay",
            steps: "ppplotStepsDisplay"
        }
    });
}

function computePPPlotWithSteps(numbers, distType = 'normal') {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    if (numbers.length < 3) return { error: true, message: "A P-P plot needs at least 3 values (with 2 points the correlation is always 1)." };
    if (!(Math.max(...numbers) - Math.min(...numbers) > 0)) return { error: true, message: "All values are identical, so the P-P plot is undefined (zero spread)." };
    if (distType === 'exponential' && (numbers.some(v => v < 0) || !(numbers.reduce((a, b) => a + b, 0) > 0))) {
        return { error: true, message: "The exponential P-P plot needs non-negative values with a positive mean (the rate is 1 / mean)." };
    }
    
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
        calcRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${d.i}</td>
            <td class="s-a7c3f4">${d.value.toFixed(4)}</td>
            <td class="s-b01296">${d.empiricalCDF.toFixed(6)}</td>
            <td class="s-a7c3f4">${d.theoreticalCDF.toFixed(6)}</td>
            <td class="s-fc9227">${d.formula}</td>
        </tr>`;
    }
    
    let distName = distType === 'normal' ? 'Normal' : (distType === 'uniform' ? 'Uniform' : 'Exponential');
    
    let steps = `
<div class="s-3097a8">
    
    <!-- Header -->
    <div class="s-aedb37">
        <div class="s-b15718 gen-flex">
            <div>
                <div class="s-e9f44b gen-flex">
                    <span class="s-93df4f gen-big">📊</span>
                    <div>
                        <h1 class="s-b80b8c">P-P Plot Analysis</h1>
                        <p class="s-259079">Probability-Probability Plot vs ${distName} Distribution</p>
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
    
    <!-- Step 1: Understanding P-P Plot -->
    <div class="s-bfd155 gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-09767f gen-sized">1</span>
            📖 Understanding P-P Plots
        </h2>
        
        <div class="s-6fab3a gen-pad">
            <p><strong>What is a P-P Plot?</strong> A Probability-Probability plot compares the empirical CDF of your data against the theoretical CDF of a specified distribution.</p>
            
            <div class="s-efcf63">
                <strong>📐 How to interpret:</strong><br>
                • <span class="s-7773e9">Points follow the diagonal line</span> → Data follows the theoretical distribution<br>
                • <span class="s-81c63c">S-shaped pattern</span> → Distribution shape differs in the tails<br>
                • <span class="s-2673ca">Curved above/below diagonal</span> → Systematic bias in probabilities
            </div>
            
            <div class="s-6da5f7">
                <strong>💡 Formula for empirical CDF (Blom's method):</strong><br>
                Fₙ(x) = (i - 0.375) / (n + 0.25)<br>
                where i = rank (1 to n), n = sample size
            </div>
        </div>
    </div>
    
    <!-- Step 2: Calculation Table -->
    <div class="s-802cd7">
        <div class="s-63fd4e">
            <h2 class="s-123848">🔢 Step 2: Calculate Empirical vs Theoretical CDF</h2>
            <p class="s-92c601">For each data point: Fₙ(x) = (i - 0.375)/(n + 0.25)</p>
        </div>
        <div class="s-317679">
            <table class="s-776a1d gen-sized">
                <thead>
                    <tr class="s-ad98e5">
                        <th class="s-a756db">Rank (i)</th>
                        <th class="s-a756db">Value (x)</th>
                        <th class="s-a756db">Empirical CDF (Fₙ)</th>
                        <th class="s-a756db">Theoretical CDF (F)</th>
                        <th class="s-a756db">Calculation</th>
                    </tr>
                </thead>
                <tbody>
                    ${calcRows}
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Step 3: Correlation Calculation -->
    <div class="s-95d04a gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-09767f gen-sized">3</span>
            📊 Correlation Between Empirical and Theoretical CDF
        </h2>
        
        <div class="s-6fab3a gen-pad">
            <div class="s-d517aa">
                <strong>r = ${correlation.toFixed(8)}</strong><br>
                <strong>Interpretation:</strong> ${Math.abs(correlation) > 0.98 ? '✅ Very strong agreement → Data follows the theoretical distribution' : (Math.abs(correlation) > 0.95 ? '⚠️ Moderate agreement → Possible mild deviation' : '❌ Poor agreement → Data likely does NOT follow the distribution')}
            </div>
        </div>
    </div>
    
    <!-- Step 4: P-P Plot Visualization -->
    <div class="s-117739 gen-pad">
        <div class="s-74360b gen-flex">
            <span class="s-da9be8">📊</span>
            <h3 class="s-e89f6f">P-P PLOT VISUALIZATION</h3>
            <p class="s-79cb4e">💡 Hover over points to see values | Points should follow the diagonal line for good fit</p>
        </div>
        
        <canvas class="s-0e19d6 gen-sized" id="ppplotChartCanvas"></canvas>
        
        <div class="s-4eeef9 gen-flex">
            <div class="s-6d12cd gen-flex"><div class="s-be0df3 gen-sized"></div><span class="s-205a8c">(Fₙ, F) Points</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-b547cb gen-sized"></div><span class="s-205a8c">Diagonal Line (y = x)</span></div>
        </div>
    </div>
    
    <!-- Step 5: Interpretation -->
    <div class="s-284793 gen-pad">
        <h2 class="s-2ce3ad">📌 Final Interpretation</h2>
        <div class="s-9ee21a gen-grid">
            <div class="s-6fdce2">
                <strong>Distribution Fit Assessment:</strong><br>
                • ${distName} distribution<br>
                • Correlation: ${(correlation * 100).toFixed(1)}%<br>
                • ${Math.abs(correlation) > 0.98 ? '✅ Data follows the theoretical distribution' : (Math.abs(correlation) > 0.95 ? '⚠️ Data shows mild deviation' : '❌ Data likely does NOT follow the distribution')}
            </div>
            <div class="s-6fdce2">
                <strong>What to look for in the plot:</strong><br>
                • Points close to diagonal → Good fit<br>
                • S-curve → Differences in spread<br>
                • Consistent offset → Systematic bias
            </div>
            <div class="s-6fdce2">
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
    if (!chartJsReady(renderPPPlotChart, arguments)) return;
    const canvas = document.getElementById('ppplotChartCanvas');
    if (!canvas) return;
    labelChart(canvas, `P-P plot of ${stats.ppPoints.length} values against the ${stats.distName} distribution. Correlation between empirical and theoretical probabilities: ${(+stats.correlation).toFixed(4)}; points close to the diagonal mean a good fit.`);
    
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
            setHtml(stepsSpan, "Please enter numbers to generate P-P plot.");
            return;
        }
        
        const result = computePPPlotWithSteps(numbers, distType);
        resultDiv.style.display = "block";
        if (result.error) {
            valueSpan.innerText = "Error";
            setHtml(stepsSpan, "⚠️ " + escapeHtml(result.message));
            return;
        }
        setHtml(valueSpan, `📊 P-P Plot | n = ${result.n} | Correlation = ${result.correlation.toFixed(4)} | ${Math.abs(result.correlation) > 0.98 ? 'Good fit' : (Math.abs(result.correlation) > 0.95 ? 'Mild deviation' : 'Poor fit')}`);
        setHtml(stepsSpan, result.steps);
        
        setTimeout(() => {
            renderPPPlotChart(result);
        }, 100);
    });
    
    attachClearHandler("ppplotClearBtn", "ppplotInput", "ppplotResultArea");
}
