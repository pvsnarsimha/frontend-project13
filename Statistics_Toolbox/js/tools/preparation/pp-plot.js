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
        setHtml(valueSpan, `📊 P-P Plot | n = ${result.n} | Correlation = ${result.correlation.toFixed(4)} | ${Math.abs(result.correlation) > 0.98 ? 'Good fit' : (Math.abs(result.correlation) > 0.95 ? 'Mild deviation' : 'Poor fit')}`);
        setHtml(stepsSpan, result.steps);
        
        setTimeout(() => {
            renderPPPlotChart(result);
        }, 100);
    });
    
    attachClearHandler("ppplotClearBtn", "ppplotInput", "ppplotResultArea");
}
