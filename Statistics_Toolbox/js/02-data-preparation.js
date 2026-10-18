/* Data preparation: z-scores, normalisation, ranking, binning, charts */
// ========== DATA MANIPULATION RENDER FUNCTIONS ==========
function renderZScoreInterface() {
    return `
        <div class="stat-interface" id="statZScoreInterface">
            <div class="interface-title">📊 Standardization (Z-scores)</div>
            <div class="formula-card">
                <div class="formula">📌 Z = (x - μ) / σ</div>
                <div class="desc">Z-score tells how many standard deviations a value is from the mean. Z = 0 means exactly at mean.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated)</label>
                <textarea id="zscoreInput" rows="4" placeholder="Example: 12, 15, 18, 20, 22, 25, 30"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="zscoreComputeBtn">📊 Calculate Z-scores + Full Steps</button>
                    <button class="secondary-btn" id="zscoreClearBtn">Clear</button>
                </div>
            </div>
            <div id="zscoreResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 STANDARDIZATION RESULTS (Z-SCORES)</div>
                    <div class="result-value" id="zscoreValueDisplay">—</div>
                    <div class="calculation-steps" id="zscoreStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

function renderNormalizeInterface() {
    return `
        <div class="stat-interface" id="statNormalizeInterface">
            <div class="interface-title">📏 Normalization (Min-Max Scaling)</div>
            <div class="formula-card">
                <div class="formula">📌 x_norm = (x - x_min) / (x_max - x_min)</div>
                <div class="desc">Scales data to range [0, 1]. Preserves relationships while transforming to a common scale.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated)</label>
                <textarea id="normalizeInput" rows="4" placeholder="Example: 10, 20, 30, 40, 50, 60"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="normalizeComputeBtn">📏 Calculate Normalized Values + Steps</button>
                    <button class="secondary-btn" id="normalizeClearBtn">Clear</button>
                </div>
            </div>
            <div id="normalizeResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 NORMALIZATION RESULTS [0, 1]</div>
                    <div class="result-value" id="normalizeValueDisplay">—</div>
                    <div class="calculation-steps" id="normalizeStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

function renderRankingInterface() {
    return `
        <div class="stat-interface" id="statRankingInterface">
            <div class="interface-title">🏆 Ranking & Order Statistics</div>
            <div class="formula-card">
                <div class="formula">📌 Rank positions: 1 = smallest, n = largest</div>
                <div class="desc">Displays sorted order, ranks, percentiles, and order statistics for your data.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated)</label>
                <textarea id="rankingInput" rows="4" placeholder="Example: 45, 67, 23, 89, 34, 78, 56, 91"></textarea>
                <div class="action-row">
                    <button class="primary-btn" id="rankingComputeBtn">🏆 Calculate Rankings + Statistics</button>
                    <button class="secondary-btn" id="rankingClearBtn">Clear</button>
                </div>
            </div>
            <div id="rankingResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 RANKING & ORDER STATISTICS</div>
                    <div class="result-value" id="rankingValueDisplay">—</div>
                    <div class="calculation-steps" id="rankingStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== Z-SCORE COMPUTATION ==========
function computeZScoreWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    let n = numbers.length;
    let sum = numbers.reduce((a,b) => a+b, 0);
    let mean = sum / n;
    
    // Calculate standard deviation (population)
    let squaredDiffs = numbers.map(x => (x - mean) ** 2);
    let sumSqDiffs = squaredDiffs.reduce((a,b) => a+b, 0);
    let stdDev = Math.sqrt(sumSqDiffs / n);
    
    if (stdDev === 0) {
        return { error: true, message: "Standard deviation is zero. All values are identical, Z-scores are zero." };
    }
    
    let steps = `📊 FORMULA: Z-score = (x - μ) / σ\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Calculate the mean (μ)\n`;
    steps += `   μ = Σx / n = ${sum} / ${n} = ${mean.toFixed(6)}\n\n`;
    
    steps += `Step 2: Calculate the standard deviation (σ)\n`;
    steps += `   σ = √[Σ(x - μ)² / n]\n`;
    squaredDiffs.forEach((sq, i) => {
        steps += `   (${numbers[i]} - ${mean.toFixed(6)})² = ${sq.toFixed(6)}\n`;
    });
    steps += `   Σ(x - μ)² = ${sumSqDiffs.toFixed(6)}\n`;
    steps += `   σ = √(${sumSqDiffs.toFixed(6)} / ${n}) = √${(sumSqDiffs/n).toFixed(6)} = ${stdDev.toFixed(6)}\n\n`;
    
    steps += `Step 3: Calculate Z-scores for each value\n`;
    steps += `   Formula: Z = (x - μ) / σ\n`;
    
    let zScores = [];
    numbers.forEach(x => {
        let z = (x - mean) / stdDev;
        zScores.push(z);
    });
    
    steps += `   Individual Z-score calculations:\n`;
    numbers.forEach((x, i) => {
        steps += `   Value ${x}: (${x} - ${mean.toFixed(6)}) / ${stdDev.toFixed(6)} = ${zScores[i].toFixed(6)}\n`;
    });
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ Z-SCORE RESULTS:\n`;
    steps += `   Mean (μ) = ${mean.toFixed(6)}\n`;
    steps += `   Standard Deviation (σ) = ${stdDev.toFixed(6)}\n`;
    steps += `   Z-scores: ${zScores.map(z => z.toFixed(6)).join(', ')}\n`;
    steps += `\n📌 Interpretation:\n`;
    steps += `   • Z = 0: Value equals the mean\n`;
    steps += `   • Z > 0: Value above mean\n`;
    steps += `   • Z < 0: Value below mean\n`;
    steps += `   • |Z| > 2: Unusual values (outliers)`;
    
    return { mean, stdDev, zScores, steps };
}

// ========== MIN-MAX NORMALIZATION ==========
function computeNormalizeWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    let min = Math.min(...numbers);
    let max = Math.max(...numbers);
    let range = max - min;
    
    if (range === 0) {
        return { error: true, message: "All values are identical. Normalized values will all be 0.5." };
    }
    
    let steps = `📏 FORMULA: x_norm = (x - x_min) / (x_max - x_min)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Find minimum and maximum values\n`;
    steps += `   x_min = ${min}\n`;
    steps += `   x_max = ${max}\n`;
    steps += `   Range = ${max} - ${min} = ${range}\n\n`;
    
    steps += `Step 2: Apply normalization formula to each value\n`;
    let normalized = [];
    numbers.forEach(x => {
        let norm = (x - min) / range;
        normalized.push(norm);
    });
    
    steps += `   Normalized values:\n`;
    numbers.forEach((x, i) => {
        steps += `   ${x} → (${x} - ${min}) / ${range} = ${normalized[i].toFixed(6)}\n`;
    });
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ NORMALIZED VALUES (range [0, 1]):\n`;
    steps += `   ${normalized.map(n => n.toFixed(6)).join(', ')}\n`;
    steps += `\n📌 Interpretation:\n`;
    steps += `   • Original minimum (${min}) → 0\n`;
    steps += `   • Original maximum (${max}) → 1\n`;
    steps += `   • Other values are proportionally scaled between 0 and 1`;
    
    return { min, max, range, normalized, steps };
}

// ========== RANKING & ORDER STATISTICS ==========
function computeRankingWithSteps(numbers) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    // Create array of objects with original index and value
    let dataWithIndex = numbers.map((value, index) => ({ value, originalIndex: index }));
    
    // Sort by value for ranking
    let sorted = [...dataWithIndex].sort((a,b) => a.value - b.value);
    
    // Assign ranks (handling ties)
    let ranks = new Array(numbers.length);
    let i = 0;
    while (i < sorted.length) {
        let j = i;
        // Find all equal values
        while (j < sorted.length && sorted[j].value === sorted[i].value) {
            j++;
        }
        // Calculate average rank for ties
        let avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) {
            ranks[sorted[k].originalIndex] = avgRank;
        }
        i = j;
    }
    
    let steps = `🏆 FORMULA: Rank = position in sorted order (1 = smallest)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    steps += `Step 1: Original data with indices\n`;
    numbers.forEach((val, idx) => {
        steps += `   Index ${idx + 1}: ${val}\n`;
    });
    
    steps += `\nStep 2: Sort values in ascending order\n`;
    let sortedValues = sorted.map(item => item.value);
    steps += `   Sorted: ${sortedValues.join(', ')}\n`;
    
    steps += `\nStep 3: Assign ranks (handling ties with average rank)\n`;
    sorted.forEach((item, idx) => {
        let rank = ranks[item.originalIndex];
        steps += `   Value ${item.value} at position ${idx + 1} → Rank: ${rank}\n`;
    });
    
    // Order statistics
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `📊 ORDER STATISTICS:\n`;
    steps += `   • Minimum (1st order): ${sortedValues[0]}\n`;
    steps += `   • 2nd smallest: ${sortedValues[1] || 'N/A'}\n`;
    steps += `   • Median: ${sortedValues[Math.floor(sortedValues.length/2)]}\n`;
    steps += `   • 2nd largest: ${sortedValues[sortedValues.length-2] || 'N/A'}\n`;
    steps += `   • Maximum (nth order): ${sortedValues[sortedValues.length-1]}\n`;
    
    steps += `\n✅ RANKING RESULTS:\n`;
    steps += `   Value → Rank:\n`;
    numbers.forEach((val, idx) => {
        steps += `   ${val} → Rank ${ranks[idx]}\n`;
    });
    
    return { sorted: sortedValues, ranks, steps };
}
// ========== DATA MANIPULATION SETUP FUNCTIONS ==========
function setupZScoreLogic() {
    const computeBtn = document.getElementById("zscoreComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("zscoreInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("zscoreResultArea");
        const valueSpan = document.getElementById("zscoreValueDisplay");
        const stepsSpan = document.getElementById("zscoreStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to calculate Z-scores.";
            return;
        }
        
        const zscoreRes = computeZScoreWithSteps(numbers);
        if (zscoreRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerText = zscoreRes.message;
            return;
        }
        
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `Z-scores: ${zscoreRes.zScores.map(z => z.toFixed(4)).join(', ')}`;
        stepsSpan.innerText = zscoreRes.steps;
    });
    attachClearHandler("zscoreClearBtn", "zscoreInput", "zscoreResultArea");
}

function setupNormalizeLogic() {
    const computeBtn = document.getElementById("normalizeComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("normalizeInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("normalizeResultArea");
        const valueSpan = document.getElementById("normalizeValueDisplay");
        const stepsSpan = document.getElementById("normalizeStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to normalize.";
            return;
        }
        
        const normRes = computeNormalizeWithSteps(numbers);
        if (normRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerText = normRes.message;
            return;
        }
        
        resultDiv.style.display = "block";
        valueSpan.innerHTML = `Normalized: ${normRes.normalized.map(n => n.toFixed(4)).join(', ')}`;
        stepsSpan.innerText = normRes.steps;
    });
    attachClearHandler("normalizeClearBtn", "normalizeInput", "normalizeResultArea");
}

function setupRankingLogic() {
    const computeBtn = document.getElementById("rankingComputeBtn");
    if (!computeBtn) return;
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("rankingInput").value;
        const numbers = parseNumbersFromInput(raw);
        const resultDiv = document.getElementById("rankingResultArea");
        const valueSpan = document.getElementById("rankingValueDisplay");
        const stepsSpan = document.getElementById("rankingStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to calculate rankings.";
            return;
        }
        
        const rankRes = computeRankingWithSteps(numbers);
        if (rankRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerText = rankRes.message;
            return;
        }
        
        resultDiv.style.display = "block";
        let rankStr = numbers.map((val, idx) => `${val}→R${rankRes.ranks[idx]}`).join(', ');
        valueSpan.innerHTML = rankStr;
        stepsSpan.innerText = rankRes.steps;
    });
    attachClearHandler("rankingClearBtn", "rankingInput", "rankingResultArea");
}
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
    analysisContainer.innerHTML = analysisText;
    analysisContainer.style.whiteSpace = 'pre-wrap';
}

// Function to create box plot
// Function to create box plot (using bar chart with error bars)
// Function to create box plot (using bar chart with error bars)
function createBoxPlot(numbers, chartTitle) {
    if (!numbers || numbers.length === 0) return;
    
    // Calculate statistics
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    
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
    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    const ctx = document.getElementById('dataChart').getContext('2d');
    
    // Create a horizontal bar chart representing the box plot
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dataset'],
            datasets: [
                {
                    label: 'Min to Max (Whiskers)',
                    data: [upperWhisker - lowerWhisker],
                    backgroundColor: 'rgba(200, 200, 200, 0.3)',
                    borderColor: 'rgba(31, 79, 138, 0.5)',
                    borderWidth: 1,
                    barPercentage: 0.3,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Q1 to Q3 (Box)',
                    data: [q3 - q1],
                    backgroundColor: 'rgba(44, 125, 160, 0.7)',
                    borderColor: 'rgba(31, 79, 138, 1)',
                    borderWidth: 2,
                    barPercentage: 0.3,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: { size: 14, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Q1 to Q3 (Box)') {
                                return [
                                    `Q1: ${q1.toFixed(2)}`,
                                    `Q3: ${q3.toFixed(2)}`,
                                    `IQR: ${iqr.toFixed(2)}`,
                                    `Median: ${median.toFixed(2)}`
                                ];
                            } else if (context.dataset.label === 'Min to Max (Whiskers)') {
                                return [
                                    `Min: ${lowerWhisker.toFixed(2)}`,
                                    `Max: ${upperWhisker.toFixed(2)}`,
                                    `Range: ${(upperWhisker - lowerWhisker).toFixed(2)}`
                                ];
                            }
                            return context.raw;
                        }
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: { 
                        display: true, 
                        text: 'Value Range', 
                        font: { weight: 'bold' } 
                    },
                    stacked: false
                },
                y: {
                    title: { 
                        display: true, 
                        text: 'Statistics', 
                        font: { weight: 'bold' } 
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
    analysisContainer.innerHTML = analysisText;
    analysisContainer.style.whiteSpace = 'pre-wrap';
}

// Enhanced visualization function
// Enhanced visualization function
function visualizeData(numbers, statType) {
    if (!numbers || numbers.length === 0) {
        alert('Please enter numeric data first!');
        return false;
    }
    
    // Clear previous analysis
    const oldAnalysis = document.getElementById('distributionAnalysis');
    if (oldAnalysis) {
        oldAnalysis.remove();
    }
    
    const chartArea = document.getElementById('chartDisplayArea');
    const chartTitleSpan = document.getElementById('chartTitle');
    
    // Determine best visualization based on stat type
    if (statType === 'mean' || statType === 'median' || statType === 'mode' || statType === 'variance' || statType === 'stddev') {
        createHistogram(numbers, `Distribution of Data - ${statType.toUpperCase()}`);
        chartTitleSpan.textContent = `📊 Histogram - ${statType.toUpperCase()} Analysis`;
    } else if (statType === 'iqr' || statType === 'range') {
        createBoxPlot(numbers, `Spread Analysis - ${statType.toUpperCase()}`);
        chartTitleSpan.textContent = `📦 Box Plot - ${statType.toUpperCase()} Analysis`;
    } else {
        createHistogram(numbers, `Data Distribution - ${statType.toUpperCase()}`);
        chartTitleSpan.textContent = `📊 Data Visualization - ${statType.toUpperCase()}`;
    }
    
    chartArea.classList.add('show');
    return true;
}
// ========== BINNING/DISCRETIZATION RENDER FUNCTION ==========
function renderBinningInterface() {
    return `
        <div class="stat-interface" id="statBinningInterface">
            <div class="interface-title">📦 Binning / Discretization (Group Continuous Data)</div>
            <div class="formula-card">
                <div class="formula">📌 Group continuous values into discrete intervals/bins</div>
                <div class="desc">Discretization converts continuous data into categorical bins. Choose equal-width bins or custom breaks.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter numeric values (comma, space, or line separated)</label>
                <textarea id="binningInput" rows="4" placeholder="Example: 12, 15, 18, 22, 25, 28, 30, 35, 40, 45, 50, 55, 60"></textarea>
                
                <label style="margin-top: 15px;">🔧 Binning Method:</label>
                <select id="binningMethod" style="width: 100%; padding: 10px; border-radius: 40px; border: 1px solid #cbdde9; margin-bottom: 15px;">
                    <option value="equal_width">Equal Width Bins</option>
                    <option value="custom">Custom Breaks</option>
                </select>
                
                <div id="equalWidthOptions">
                    <label>📊 Number of Bins:</label>
                    <input type="number" id="numBins" value="5" min="2" max="20" style="width: 100%; padding: 10px; border-radius: 40px; border: 1px solid #cbdde9; margin-bottom: 15px;">
                </div>
                
                <div id="customOptions" style="display: none;">
                    <label>✂️ Custom Break Points (comma-separated):</label>
                    <textarea id="customBreaks" rows="2" placeholder="Example: 20, 30, 40, 50"></textarea>
                    <div class="desc" style="font-size: 0.75rem; margin-top: 5px;">Values will be grouped into intervals based on these break points.</div>
                </div>
                
                <div class="action-row">
                    <button class="primary-btn" id="binningComputeBtn">📦 Apply Binning + Steps</button>
                    <button class="secondary-btn" id="binningClearBtn">Clear</button>
                </div>
            </div>
            <div id="binningResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 BINNING RESULTS</div>
                    <div class="result-value" id="binningValueDisplay">—</div>
                    <div class="calculation-steps" id="binningStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== LOG TRANSFORMATION RENDER FUNCTION ==========
function renderLogTransformInterface() {
    return `
        <div class="stat-interface" id="statLogTransformInterface">
            <div class="interface-title">📈 Log Transformation (Variance Stabilization)</div>
            <div class="formula-card">
                <div class="formula">📌 y = logₑ(x) or y = log₁₀(x) or y = log₂(x)</div>
                <div class="desc">Log transformation stabilizes variance, normalizes skewed distributions, and linearizes exponential relationships. All values must be > 0.</div>
            </div>
            <div class="data-input-section">
                <label>📋 Enter positive numeric values (comma, space, or line separated)</label>
                <textarea id="logInput" rows="4" placeholder="Example: 1, 2, 4, 8, 16, 32, 64, 128"></textarea>
                
                <label style="margin-top: 15px;">🔢 Log Base:</label>
                <select id="logBase" style="width: 100%; padding: 10px; border-radius: 40px; border: 1px solid #cbdde9; margin-bottom: 15px;">
                    <option value="natural">Natural Log (ln) - Base e</option>
                    <option value="base10">Log Base 10 (log₁₀)</option>
                    <option value="base2">Log Base 2 (log₂)</option>
                </select>
                
                <div class="action-row">
                    <button class="primary-btn" id="logComputeBtn">📈 Apply Log Transformation + Steps</button>
                    <button class="secondary-btn" id="logClearBtn">Clear</button>
                </div>
            </div>
            <div id="logResultArea" style="display: none;">
                <div class="result-card">
                    <div class="result-label">🎯 LOG TRANSFORMATION RESULTS</div>
                    <div class="result-value" id="logValueDisplay">—</div>
                    <div class="calculation-steps" id="logStepsDisplay"></div>
                </div>
            </div>
        </div>
    `;
}
// ========== BINNING/DISCRETIZATION COMPUTATION ==========
function computeBinningWithSteps(numbers, method, numBins = 5, customBreaks = []) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    let breaks = [];
    let binLabels = [];
    
    if (method === 'equal_width') {
        const binWidth = (max - min) / numBins;
        for (let i = 0; i <= numBins; i++) {
            breaks.push(min + i * binWidth);
        }
    } else if (method === 'custom') {
        if (!customBreaks.length) return { error: true, message: "Please provide custom break points." };
        breaks = [min, ...customBreaks.sort((a,b) => a-b), max];
    }
    
    // Generate bin labels
    for (let i = 0; i < breaks.length - 1; i++) {
        binLabels.push(`[${breaks[i].toFixed(2)}, ${breaks[i+1].toFixed(2)})`);
    }
    // Last bin includes upper bound
    binLabels[binLabels.length - 1] = `[${breaks[breaks.length-2].toFixed(2)}, ${breaks[breaks.length-1].toFixed(2)}]`;
    
    // Assign each value to a bin
    const bins = new Array(binLabels.length).fill(0);
    const assignments = [];
    
    numbers.forEach(num => {
        for (let i = 0; i < breaks.length - 1; i++) {
            if (i === breaks.length - 2) {
                if (num >= breaks[i] && num <= breaks[i+1]) {
                    bins[i]++;
                    assignments.push({ value: num, bin: binLabels[i], binIndex: i });
                    break;
                }
            } else {
                if (num >= breaks[i] && num < breaks[i+1]) {
                    bins[i]++;
                    assignments.push({ value: num, bin: binLabels[i], binIndex: i });
                    break;
                }
            }
        }
    });
    
    let steps = `📦 FORMULA: Discretization / Binning\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Step 1: Data Summary\n`;
    steps += `   n = ${numbers.length}\n`;
    steps += `   Min = ${min.toFixed(4)}, Max = ${max.toFixed(4)}\n`;
    steps += `   Range = ${(max - min).toFixed(4)}\n\n`;
    
    if (method === 'equal_width') {
        steps += `Step 2: Create ${numBins} equal-width bins\n`;
        steps += `   Bin width = (${max.toFixed(4)} - ${min.toFixed(4)}) / ${numBins} = ${((max-min)/numBins).toFixed(4)}\n\n`;
    } else {
        steps += `Step 2: Using custom break points\n`;
        steps += `   Breaks: ${customBreaks.join(', ')}\n\n`;
    }
    
    steps += `Step 3: Bin boundaries\n`;
    binLabels.forEach((label, i) => {
        steps += `   Bin ${i+1}: ${label}\n`;
    });
    
    steps += `\nStep 4: Assign values to bins\n`;
    assignments.forEach(assign => {
        steps += `   ${assign.value} → ${assign.bin}\n`;
    });
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ BINNING SUMMARY:\n`;
    steps += `   Bin Distribution:\n`;
    binLabels.forEach((label, i) => {
        steps += `   ${label}: ${bins[i]} value(s)\n`;
    });
    
    return { bins, assignments, binLabels, breaks, steps };
}

// ========== LOG TRANSFORMATION COMPUTATION ==========
function computeLogTransformWithSteps(numbers, base) {
    if (!numbers.length) return { error: true, message: "No numbers provided." };
    
    const nonPositive = numbers.filter(v => v <= 0);
    if (nonPositive.length > 0) {
        return { error: true, message: `❌ Log transformation requires ALL values > 0. Invalid: ${nonPositive.join(', ')}` };
    }
    
    let logFunc;
    let baseName;
    if (base === 'natural') {
        logFunc = Math.log;
        baseName = 'ln (base e)';
    } else if (base === 'base10') {
        logFunc = Math.log10;
        baseName = 'log₁₀';
    } else {
        logFunc = Math.log2;
        baseName = 'log₂';
    }
    
    const transformed = numbers.map(x => logFunc(x));
    
    let steps = `📈 FORMULA: Log Transformation y = ${baseName}(x)\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Step 1: Verify all values > 0\n`;
    steps += `   All values are positive ✅\n\n`;
    steps += `Step 2: Apply ${baseName} transformation to each value\n`;
    
    numbers.forEach((x, i) => {
        steps += `   ${baseName}(${x}) = ${transformed[i].toFixed(6)}\n`;
    });
    
    // Calculate summary statistics before and after
    const originalMean = numbers.reduce((a,b) => a+b, 0) / numbers.length;
    const transformedMean = transformed.reduce((a,b) => a+b, 0) / transformed.length;
    const originalStd = Math.sqrt(numbers.reduce((a,b) => a + Math.pow(b - originalMean, 2), 0) / numbers.length);
    const transformedStd = Math.sqrt(transformed.reduce((a,b) => a + Math.pow(b - transformedMean, 2), 0) / transformed.length);
    
    steps += `\nStep 3: Effect on distribution\n`;
    steps += `   Original Mean: ${originalMean.toFixed(4)}\n`;
    steps += `   Transformed Mean: ${transformedMean.toFixed(4)}\n`;
    steps += `   Original Std Dev: ${originalStd.toFixed(4)}\n`;
    steps += `   Transformed Std Dev: ${transformedStd.toFixed(4)}\n`;
    steps += `   Variance reduction: ${((1 - transformedStd/originalStd) * 100).toFixed(1)}% reduction\n`;
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `✅ LOG TRANSFORMATION RESULTS:\n`;
    steps += `   Original values: ${numbers.map(x => x.toFixed(4)).join(', ')}\n`;
    steps += `   Transformed (${baseName}): ${transformed.map(x => x.toFixed(6)).join(', ')}`;
    
    return { original: numbers, transformed, base: baseName, steps };
}
// ========== BINNING SETUP FUNCTION ==========
function setupBinningLogic() {
    const methodSelect = document.getElementById("binningMethod");
    const equalWidthDiv = document.getElementById("equalWidthOptions");
    const customDiv = document.getElementById("customOptions");
    
    if (methodSelect) {
        methodSelect.addEventListener('change', () => {
            if (methodSelect.value === 'equal_width') {
                equalWidthDiv.style.display = 'block';
                customDiv.style.display = 'none';
            } else {
                equalWidthDiv.style.display = 'none';
                customDiv.style.display = 'block';
            }
        });
    }
    
    const computeBtn = document.getElementById("binningComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("binningInput").value;
        const numbers = parseNumbersFromInput(raw);
        const method = document.getElementById("binningMethod").value;
        const resultDiv = document.getElementById("binningResultArea");
        const valueSpan = document.getElementById("binningValueDisplay");
        const stepsSpan = document.getElementById("binningStepsDisplay");
        
        if (!numbers.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            stepsSpan.innerText = "Enter numbers to bin.";
            return;
        }
        
        let numBins = 5;
        let customBreaks = [];
        
        if (method === 'equal_width') {
            numBins = parseInt(document.getElementById("numBins").value) || 5;
        } else {
            const breaksText = document.getElementById("customBreaks").value;
            customBreaks = parseNumbersFromInput(breaksText);
            if (customBreaks.length === 0) {
                resultDiv.style.display = "block";
                valueSpan.innerText = "Error";
                stepsSpan.innerText = "Please provide custom break points.";
                return;
            }
        }
        
        const binningRes = computeBinningWithSteps(numbers, method, numBins, customBreaks);
        if (binningRes.error) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "Error";
            stepsSpan.innerText = binningRes.message;
            return;
        }
        
        resultDiv.style.display = "block";
        let summary = binningRes.binLabels.map((label, i) => `${label}: ${binningRes.bins[i]}`).join(' | ');
        valueSpan.innerHTML = summary;
        stepsSpan.innerText = binningRes.steps;
    });
    
    attachClearHandler("binningClearBtn", "binningInput", "binningResultArea");
}
// ========== CORRELATION & ASSOCIATION RENDER FUNCTIONS ==========
