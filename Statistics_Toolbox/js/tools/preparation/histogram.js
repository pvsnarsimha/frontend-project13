/* Histogram: histogram tool (render, compute, setup) */

// Function to create histogram
// Function to create histogram
function createHistogram(numbers, chartTitle) {
    if (!numbers || numbers.length === 0) return;
    
    // Create bins for histogram (using Sturges' rule)
    const numBins = Math.min(Math.ceil(Math.log2(numbers.length) + 1), 15);
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const binWidth = (max - min) / numBins;
    
    // Create bins
    let bins = Array(numBins).fill(0);
    let binLabels = [];
    
    for (let i = 0; i < numBins; i++) {
        let lower = min + (i * binWidth);
        let upper = lower + binWidth;
        binLabels.push(`${lower.toFixed(2)}-${upper.toFixed(2)}`);
        
        numbers.forEach(num => {
            if (i === numBins - 1) {
                if (num >= lower && num <= upper) bins[i]++;
            } else {
                if (num >= lower && num < upper) bins[i]++;
            }
        });
    }
    
    // Destroy existing chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }
    
    const ctx = document.getElementById('dataChart').getContext('2d');
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frequency',
                data: bins,
                backgroundColor: 'rgba(44, 125, 160, 0.7)',
                borderColor: 'rgba(31, 79, 138, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: { size: 14, weight: 'bold' }
                },
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Frequency: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency',
                        font: { weight: 'bold' }
                    },
                    ticks: { stepSize: 1 }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Value Ranges',
                        font: { weight: 'bold' }
                    },
                    ticks: { 
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                }
            }
        }
    });
    
    // Add distribution analysis below the chart
    const analysisText = generateDistributionAnalysis(numbers);
    
    // Check if analysis container exists, if not create it
    let analysisContainer = document.getElementById('distributionAnalysis');
    if (!analysisContainer) {
        analysisContainer = document.createElement('div');
        analysisContainer.id = 'distributionAnalysis';
        analysisContainer.className = 'calculation-steps';
        analysisContainer.style.marginTop = '20px';
        analysisContainer.style.fontSize = '0.85rem';
        analysisContainer.style.maxHeight = '500px';
        analysisContainer.style.overflowY = 'auto';
        const chartContainer = document.getElementById('chartDisplayArea');
        chartContainer.appendChild(analysisContainer);
    }
    setHtml(analysisContainer, analysisText);
    analysisContainer.style.whiteSpace = 'pre-wrap';
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
            setHtml(stepsSpan, "Please enter numbers to generate histogram.");
            return;
        }
        
        const result = computeHistogramWithSteps(numbers, numBins);
        resultDiv.style.display = "block";
        setHtml(valueSpan, `📊 ${numBins} bins | ${numbers.length} values | Range: ${Math.min(...numbers).toFixed(2)} - ${Math.max(...numbers).toFixed(2)} | Width: ${result.binWidth.toFixed(4)}`);
        setHtml(stepsSpan, result.steps);
        
        // Render the chart after a short delay to ensure DOM is ready
        setTimeout(() => {
            renderHistogramChart(result.bins, result.binLabels, numbers);
        }, 100);
    });
    
    attachClearHandler("histogramClearBtn", "histogramInput", "histogramResultArea");
}
