// Worked-solution HTML for computeBoxplotWithSteps (split out of boxplot.js): receives the values the calculation produced.
function stepsHtmlBoxplot(scope) {
    const { fiveNumTable, iqr, lowerBound, maxVal, mean, median, minVal, n, numbers, outlierTable, outliers, q1, q3, quartileTable, sorted, stdDev, upperBound, whiskerTable } = scope;
    let steps = `
<div class="s-3097a8">
    
    <!-- Header -->
    <div class="s-aedb37">
        <div class="s-b15718 gen-flex">
            <div>
                <div class="s-e9f44b gen-flex">
                    <span class="s-93df4f gen-big">📦</span>
                    <div>
                        <h1 class="s-b80b8c">Boxplot Analysis</h1>
                        <p class="s-259079">Five-Number Summary & Outlier Detection (1.5 × IQR Rule)</p>
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
    <div class="s-484166 gen-grid">
        <div class="s-9ca8be">
            <div class="s-033765">MINIMUM</div>
            <div class="s-d3b644">${minVal}</div>
        </div>
        <div class="s-0b060f">
            <div class="s-033765">Q₁</div>
            <div class="s-3c6f5f">${q1.toFixed(4)}</div>
        </div>
        <div class="s-f94899">
            <div class="s-033765">MEDIAN</div>
            <div class="s-7fdc7a">${median.toFixed(4)}</div>
        </div>
        <div class="s-0b060f">
            <div class="s-033765">Q₃</div>
            <div class="s-3c6f5f">${q3.toFixed(4)}</div>
        </div>
        <div class="s-6b289d">
            <div class="s-033765">MAXIMUM</div>
            <div class="s-2e1589">${maxVal}</div>
        </div>
    </div>
    
    <!-- Step 1: Sort Data -->
    <div class="s-bfd155 gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-09767f gen-sized">1</span>
            📋 Sort the Data
        </h2>
        <div class="s-6fab3a gen-pad">
            <p><strong>Original Data:</strong> [${numbers.join(', ')}]</p>
            <p><strong>Sorted Data:</strong> <code class="s-689a2a">[${sorted.join(', ')}]</code></p>
        </div>
    </div>
    
    <!-- Step 2: Quartiles -->
    <div class="s-95d04a gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-09767f gen-sized">2</span>
            📐 Calculate Quartiles
        </h2>
        ${quartileTable}
    </div>
    
    <!-- Step 3: IQR and Boundaries -->
    <div class="s-95d04a gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-09767f gen-sized">3</span>
            🔢 IQR & Outlier Boundaries
        </h2>
        
        <div class="s-87555e gen-grid">
            <div class="s-6fab3a gen-pad">
                <strong>IQR (Interquartile Range):</strong>
                <div class="s-e32b71">
                    IQR = Q₃ - Q₁ = ${q3.toFixed(4)} - ${q1.toFixed(4)} = <strong class="s-f342b5">${iqr.toFixed(4)}</strong>
                </div>
            </div>
            <div class="s-6fab3a gen-pad">
                <strong>Outlier Boundaries (1.5 × IQR):</strong>
                <div class="s-84ac71">
                    <div class="s-de3d7c">Lower Bound = Q₁ - 1.5×IQR = ${q1.toFixed(4)} - 1.5×${iqr.toFixed(4)} = <strong class="s-c451e2">${lowerBound.toFixed(4)}</strong></div>
                    <div class="s-f5dae4">Upper Bound = Q₃ + 1.5×IQR = ${q3.toFixed(4)} + 1.5×${iqr.toFixed(4)} = <strong class="s-c451e2">${upperBound.toFixed(4)}</strong></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Step 4: Outliers -->
    <div class="s-bfd155 gen-pad">
        <h2 class="s-13101f gen-flex">
            <span class="s-09767f gen-sized">4</span>
            🔍 Identify Outliers
        </h2>
        ${outlierTable}
    </div>
    
    <!-- Step 5: Five-Number Summary -->
    ${fiveNumTable}
    
    <!-- Step 6: Whiskers -->
    ${whiskerTable}
    
    <!-- Boxplot Visualization -->
    <div class="s-117739 gen-pad">
        <div class="s-74360b gen-flex">
            <span class="s-da9be8">📊</span>
            <h3 class="s-e89f6f">BOXPLOT VISUALIZATION</h3>
            <p class="s-79cb4e">💡 Hover over any line or point to see its value</p>
        </div>
        
        <!-- Chart Canvas -->
        <canvas class="s-e3f96a gen-sized" id="boxplotChartCanvas"></canvas>
        
        <div class="s-4eeef9 gen-flex">
            <div class="s-6d12cd gen-flex"><div class="s-ef2a11 gen-sized"></div><span class="s-205a8c">IQR Box (Q₁ to Q₃)</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-f63681 gen-sized"></div><span class="s-205a8c">Median Line (Q₂)</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-79a855 gen-sized"></div><span class="s-205a8c">Whiskers</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-823510 gen-sized"></div><span class="s-205a8c">Outliers</span></div>
            <div class="s-6d12cd gen-flex"><div class="s-79a855 gen-sized"></div><span class="s-205a8c">Whisker Caps</span></div>
        </div>
    </div>
    
    <!-- Interpretation -->
    <div class="s-284793 gen-pad">
        <h2 class="s-2ce3ad">📖 Final Interpretation</h2>
        <div class="s-9ee21a gen-grid">
            <div class="s-6fdce2">
                <strong>Distribution Shape:</strong><br>
                • ${Math.abs(median - mean) < 0.1 * iqr ? 'Symmetric' : (median < mean ? 'Right-skewed' : 'Left-skewed')}<br>
                • IQR = ${iqr.toFixed(4)}<br>
                • Range = ${(maxVal - minVal).toFixed(4)}
            </div>
            <div class="s-6fdce2">
                <strong>Outliers:</strong><br>
                • ${outliers.length} outlier(s) detected<br>
                ${outliers.length > 0 ? `• Values: ${outliers.join(', ')}` : '• No outliers'}
            </div>
            <div class="s-6fdce2">
                <strong>Summary Stats:</strong><br>
                • Mean = ${mean.toFixed(4)}<br>
                • Median = ${median.toFixed(4)}<br>
                • Std Dev = ${stdDev.toFixed(4)}
            </div>
        </div>
    </div>
</div>`;
    return steps;
}
