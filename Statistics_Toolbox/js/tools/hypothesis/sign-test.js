/* SignTest: signTest tool (render, compute, setup) */

// ========== SIGN TEST (MEDIAN) ==========
function renderSignTestInterface() {
    return buildInterface({
        id: "statSignTestInterface",
        title: "± Sign Test (Median)",
        card: [
            { formula: "📌 Test statistic = number of observations above/below hypothesized median" },
            {
                desc: "<strong>What is the Sign Test?</strong><br>\n                    A non-parametric test that tests whether the population median equals a hypothesized value.\n                    H₀: Median = M₀ | H₁: Median ≠ M₀ (or >, or <)"
            },
            {
                desc: "<strong>Key features:</strong><br>\n                    • No normality assumption required<br>\n                    • Based only on signs (+ or -) of deviations<br>\n                    • Works with ordinal or continuous data",
                attrs: { style: CARD_GAP }
            }
        ],
        inputs: [
            {
                label: "📋 Enter sample data (comma, space, or line separated):",
                textarea: { id: "signData", rows: "4", placeholder: "Example: 12, 15, 14, 16, 13, 15, 14, 17, 16, 15, 18, 19, 20" }
            },
            {
                label: "📊 Hypothesized Median (M₀):",
                labelAttrs: { style: FIELD_GAP },
                input: {
                    type: "number",
                    id: "hypothesizedMedian",
                    value: "15",
                    step: "any",
                    style: FIELD_STYLE
                }
            },
            {
                label: "📊 Significance Level (α):",
                select: { id: "signAlpha", style: FIELD_STYLE },
                options: ALPHA_OPTIONS
            },
            {
                label: "📋 Alternative Hypothesis:",
                select: { id: "signAlternative", style: FIELD_STYLE },
                options: [
                    ["two.sided", "Median ≠ M₀ (Two-tailed)"],
                    ["greater", "Median > M₀ (Greater than)"],
                    ["less", "Median < M₀ (Less than)"]
                ]
            }
        ],
        run: { id: "signComputeBtn", text: "± Run Sign Test + Full Steps" },
        clear: { id: "signClearBtn", text: "Clear" },
        result: {
            area: "signResultArea",
            label: "🎯 SIGN TEST RESULTS",
            value: "signValueDisplay",
            steps: "signStepsDisplay"
        }
    });
}

function computeSignTest(data, hypothesizedMedian, alpha, alternative) {
    if (!data.length || data.length < 2) {
        return { error: true, message: "Need at least 2 observations for Sign test." };
    }
    
    const n = data.length;
    let positives = 0;
    let negatives = 0;
    let zeros = 0;
    let signs = [];
    
    for (let i = 0; i < n; i++) {
        const diff = data[i] - hypothesizedMedian;
        if (diff > 0) {
            positives++;
            signs.push({ value: data[i], diff: diff, sign: "+" });
        } else if (diff < 0) {
            negatives++;
            signs.push({ value: data[i], diff: diff, sign: "-" });
        } else {
            zeros++;
            signs.push({ value: data[i], diff: diff, sign: "0" });
        }
    }
    
    const nonZero = positives + negatives;
    let testStatistic;
    let pValue;
    
    if (alternative === 'two.sided') {
        testStatistic = Math.min(positives, negatives);
        pValue = 2 * binomialCumulative(testStatistic, nonZero, 0.5);
    } else if (alternative === 'greater') {
        testStatistic = positives;
        pValue = binomialCumulativeComplement(testStatistic, nonZero, 0.5);
    } else {
        testStatistic = negatives;
        pValue = binomialCumulativeComplement(testStatistic, nonZero, 0.5);
    }
    
    pValue = Math.min(Math.max(pValue, 0), 1);
    const rejectH0 = pValue < alpha;
    
    let conclusion = rejectH0 ? "REJECT the null hypothesis" : "FAIL TO REJECT the null hypothesis";
    let interpretation = rejectH0 ?
        `There IS sufficient evidence that the population median is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${hypothesizedMedian}.` :
        `There is NOT sufficient evidence that the population median is ${alternative === 'two.sided' ? 'different from' : (alternative === 'greater' ? 'greater than' : 'less than')} ${hypothesizedMedian}.`;
    
    // Build sign table
    let signTableRows = '';
    for (let i = 0; i < signs.length; i++) {
        const s = signs[i];
        const signColor = s.sign === '+' ? '#28a745' : (s.sign === '-' ? '#dc3545' : '#6c757d');
        signTableRows += `<tr class="s-00049c">
            <td class="s-a7c3f4">${i+1}</td>
            <td class="s-a7c3f4">${s.value}</td>
            <td class="s-a7c3f4">${s.value} - ${hypothesizedMedian} = ${s.diff.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: ${signColor};">${s.sign === '0' ? 'Tie (ignored)' : (s.sign === '+' ? 'Positive (+) → Above Median' : 'Negative (-) → Below Median')}</td>
        </tr>`;
    }
    
    let steps = `<div class="s-9217e5">
        <div class="s-83bd0e gen-pad">
            <div class="s-4c6057 gen-flex">
                <span class="s-1f18a8 gen-big">±</span>
                <h2 class="s-f8a94d">Sign Test (Median)</h2>
            </div>
            <p class="s-259079">A non-parametric test for the population median</p>
            <p class="s-20a400">H₀: Median = ${hypothesizedMedian} | H₁: Median ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${hypothesizedMedian}</p>
        </div>
        
        <div class="s-42ccf7 gen-pad">
            <h3 class="s-ed0bb5">📖 Understanding the Sign Test</h3>
            <div class="s-6025fc">
                <p class="s-7dacb1"><strong>How it works:</strong></p>
                <ul class="s-c1e0ca">
                    <li>Count how many observations are ABOVE the hypothesized median (+) </li>
                    <li>Count how many are BELOW the hypothesized median (-) </li>
                    <li>Ignore values exactly equal to the hypothesized median</li>
                    <li>Under H₀, expect ~50% above and ~50% below</li>
                </ul>
                <div class="s-0f748e">
                    <strong>Test statistic = min(# of +, # of -)</strong>
                </div>
                <div class="s-28c132">
                    💡 <strong>Interpretation:</strong> If the test statistic is small, the median is likely different from hypothesized value.
                </div>
            </div>
        </div>
        
        <div class="s-5d9fe4 gen-grid">
            <div class="s-a739ec">
                <div class="s-42da0a">Sample Size (n)</div>
                <div class="s-abfdfd gen-big">${n}</div>
            </div>
            <div class="s-a739ec">
                <div class="s-42da0a">Hypothesized Median</div>
                <div class="s-c2434f">${hypothesizedMedian}</div>
            </div>
            <div class="s-a739ec">
                <div class="s-42da0a">Non-zero Observations</div>
                <div class="s-c2434f">${nonZero}</div>
            </div>
        </div>
        
        <div class="s-90b704">
            <h3 class="s-c7276c">
                📊 Step 1: Determine Signs for Each Observation
            </h3>
            <table class="s-897d74 gen-sized">
                <thead>
                    <tr class="s-e7b83b">
                        <th class="s-a756db">i</th>
                        <th class="s-a756db">Value</th>
                        <th class="s-a756db">Deviation (Value - M₀)</th>
                        <th class="s-a756db">Sign</th>
                    </tr>
                </thead>
                <tbody>${signTableRows}</tbody>
            </table>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 2: Count Signs</h3>
            <div class="s-6025fc">
                <div class="s-b37ea4 gen-grid gen-grid-many">
                    <div class="s-3b0819">
                        <div class="s-8d6db5 gen-big">${positives}</div>
                        <div>Positive (+) → Above M₀</div>
                    </div>
                    <div class="s-c20c6d">
                        <div class="s-bb6dac gen-big">${negatives}</div>
                        <div>Negative (-) → Below M₀</div>
                    </div>
                    <div class="s-6da5f7">
                        <div class="s-e5b310 gen-big">${zeros}</div>
                        <div>Ties (ignored)</div>
                    </div>
                </div>
                <div class="s-64c1da">
                    <strong>Non-zero observations (m) = ${positives} + ${negatives} = ${nonZero}</strong>
                </div>
            </div>
        </div>
        
        <div class="s-272f59 gen-pad">
            <h3 class="s-d163b6">🔢 Step 3: Calculate Test Statistic & p-value</h3>
            <div class="s-6025fc">
                <div class="s-1a4440">
                    <strong>Test statistic = min(${positives}, ${negatives}) = ${testStatistic}</strong>
                </div>
                <div class="s-9d5978">
                    Under H₀, signs follow Binomial(m, 0.5)<br>
                    p-value = ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div class="${rejectH0 ? 's-830a4f gen-pad' : 's-28eb84 gen-pad'}">
            <h3 class="s-c7f0b4">📌 Step 4: Make Decision</h3>
            <div class="s-f27585">
                <div><strong>Test Statistic:</strong> ${testStatistic}</div>
                <div><strong>Non-zero observations (m):</strong> ${nonZero}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
                <div><strong>Significance Level (α):</strong> ${alpha}</div>
                <div class="s-c6645b">
                    <strong>Decision:</strong> ${conclusion}<br>
                    <strong>Interpretation:</strong> ${interpretation}
                </div>
            </div>
        </div>
        
        <div class="s-44d7a2 gen-pad">
            <h3 class="s-ed0bb5">📊 Interpretation Guide</h3>
            <table class="s-306b2c gen-sized">
                <thead><tr class="s-e7b83b"><th class="s-939795">Test Statistic</th><th class="s-939795">Interpretation</th><th class="s-939795">Conclusion</th></tr></thead>
                <tbody>
                    <tr class="s-67f264"><td class="s-641001">Large (close to m/2)</td><td class="s-641001">Roughly equal +/- counts</td><td class="s-641001">Cannot reject H₀ (median = M₀)</td></tr>
                    <tr class="s-6d64ad"><td class="s-641001">Small (near 0)</td><td class="s-641001">Most values on one side</td><td class="s-641001">Reject H₀ (median ≠ M₀)</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    
    return { testStatistic, nonZero, pValue, rejectH0, positives, negatives, zeros, steps, chart: nonZero > 0 ? { kind: 'binomial', n: nonZero, p0: 0.5, k: alternative === 'two.sided' ? Math.min(positives, negatives) : positives, alternative: alternative, alpha: alpha } : null };
}

function binomialCumulative(k, n, p) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
        sum += binomialPMF(n, i, p);
    }
    return sum;
}

function binomialCumulativeComplement(k, n, p) {
    let sum = 0;
    for (let i = k; i <= n; i++) {
        sum += binomialPMF(n, i, p);
    }
    return sum;
}

function setupSignTestLogic() {
    const computeBtn = document.getElementById("signComputeBtn");
    if (!computeBtn) return;
    
    computeBtn.addEventListener('click', () => {
        const raw = document.getElementById("signData").value;
        const data = parseNumbersFromInput(raw);
        const hypothesizedMedian = parseFloat(document.getElementById("hypothesizedMedian").value);
        const alpha = parseFloat(document.getElementById("signAlpha").value);
        const alternative = document.getElementById("signAlternative").value;
        const resultDiv = document.getElementById("signResultArea");
        const valueSpan = document.getElementById("signValueDisplay");
        const stepsSpan = document.getElementById("signStepsDisplay");
        
        if (!data.length) {
            resultDiv.style.display = "block";
            valueSpan.innerText = "No data";
            setHtml(stepsSpan, "Please enter data.");
            return;
        }
        
        const result = computeSignTest(data, hypothesizedMedian, alpha, alternative);
        resultDiv.style.display = "block";
        
        if (result.error) {
            valueSpan.innerText = "Error";
            hideStatChartCard('test');
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `Test stat = ${result.testStatistic} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
        showTestChart("signResultArea", result.chart);
        }
    });
    
    attachClearHandler("signClearBtn", "signData", "signResultArea");
}
