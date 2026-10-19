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
        signTableRows += `<tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 8px; text-align: center;">${i+1}</td>
            <td style="padding: 8px; text-align: center;">${s.value}</td>
            <td style="padding: 8px; text-align: center;">${s.value} - ${hypothesizedMedian} = ${s.diff.toFixed(4)}</td>
            <td style="padding: 8px; text-align: center; font-weight: bold; color: ${signColor};">${s.sign === '0' ? 'Tie (ignored)' : (s.sign === '+' ? 'Positive (+) → Above Median' : 'Negative (-) → Below Median')}</td>
        </tr>`;
    }
    
    let steps = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white; padding: 20px 24px; border-radius: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">±</span>
                <h2 style="margin: 0;">Sign Test (Median)</h2>
            </div>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">A non-parametric test for the population median</p>
            <p style="margin: 4px 0 0 0; opacity: 0.75;">H₀: Median = ${hypothesizedMedian} | H₁: Median ${alternative === 'two.sided' ? '≠' : (alternative === 'greater' ? '>' : '<')} ${hypothesizedMedian}</p>
        </div>
        
        <div style="background: #f0f4fa; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📖 Understanding the Sign Test</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>How it works:</strong></p>
                <ul style="margin-left: 20px; line-height: 1.6;">
                    <li>Count how many observations are ABOVE the hypothesized median (+) </li>
                    <li>Count how many are BELOW the hypothesized median (-) </li>
                    <li>Ignore values exactly equal to the hypothesized median</li>
                    <li>Under H₀, expect ~50% above and ~50% below</li>
                </ul>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin-top: 12px;">
                    <strong>Test statistic = min(# of +, # of -)</strong>
                </div>
                <div style="margin-top: 12px; background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 13px;">
                    💡 <strong>Interpretation:</strong> If the test statistic is small, the median is likely different from hypothesized value.
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Sample Size (n)</div>
                <div style="font-size: 32px; font-weight: 700; color: #1a5490;">${n}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Hypothesized Median</div>
                <div style="font-size: 24px; font-weight: 700;">${hypothesizedMedian}</div>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef;">
                <div style="font-size: 12px; color: #6c757d;">Non-zero Observations</div>
                <div style="font-size: 24px; font-weight: 700;">${nonZero}</div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 16px; margin-bottom: 24px; overflow-x: auto; border: 1px solid #e9ecef;">
            <h3 style="margin: 0; padding: 16px 20px; background: #f8f9fa; border-bottom: 2px solid #1a5490; color: #1a5490;">
                📊 Step 1: Determine Signs for Each Observation
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a5490; color: white;">
                        <th style="padding: 10px;">i</th>
                        <th style="padding: 10px;">Value</th>
                        <th style="padding: 10px;">Deviation (Value - M₀)</th>
                        <th style="padding: 10px;">Sign</th>
                    </tr>
                </thead>
                <tbody>${signTableRows}</tbody>
            </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 2: Count Signs</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                    <div style="background: #d4edda; padding: 12px; border-radius: 8px;">
                        <div style="font-size: 36px; font-weight: 700; color: #28a745;">${positives}</div>
                        <div>Positive (+) → Above M₀</div>
                    </div>
                    <div style="background: #f8d7da; padding: 12px; border-radius: 8px;">
                        <div style="font-size: 36px; font-weight: 700; color: #dc3545;">${negatives}</div>
                        <div>Negative (-) → Below M₀</div>
                    </div>
                    <div style="background: #fff3cd; padding: 12px; border-radius: 8px;">
                        <div style="font-size: 36px; font-weight: 700; color: #ffc107;">${zeros}</div>
                        <div>Ties (ignored)</div>
                    </div>
                </div>
                <div style="margin-top: 16px; text-align: center;">
                    <strong>Non-zero observations (m) = ${positives} + ${negatives} = ${nonZero}</strong>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d4eaf1 100%); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a5490;">🔢 Step 3: Calculate Test Statistic & p-value</h3>
            <div style="background: white; border-radius: 12px; padding: 16px;">
                <div style="font-family: monospace;">
                    <strong>Test statistic = min(${positives}, ${negatives}) = ${testStatistic}</strong>
                </div>
                <div style="margin-top: 12px;">
                    Under H₀, signs follow Binomial(m, 0.5)<br>
                    p-value = ${pValue.toFixed(8)}
                </div>
            </div>
        </div>
        
        <div style="border-radius: 16px; padding: 20px; margin-bottom: 24px; ${rejectH0 ? 'background: #f8d7da; border-left: 6px solid #dc3545;' : 'background: #d4edda; border-left: 6px solid #28a745;'}">
            <h3 style="margin: 0 0 12px 0;">📌 Step 4: Make Decision</h3>
            <div style="display: grid; gap: 12px;">
                <div><strong>Test Statistic:</strong> ${testStatistic}</div>
                <div><strong>Non-zero observations (m):</strong> ${nonZero}</div>
                <div><strong>p-value:</strong> ${pValue.toFixed(8)}</div>
                <div><strong>Significance Level (α):</strong> ${alpha}</div>
                <div style="margin-top: 8px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <strong>Decision:</strong> ${conclusion}<br>
                    <strong>Interpretation:</strong> ${interpretation}
                </div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1a5490;">📊 Interpretation Guide</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead><tr style="background: #1a5490; color: white;"><th style="padding: 8px;">Test Statistic</th><th style="padding: 8px;">Interpretation</th><th style="padding: 8px;">Conclusion</th></tr></thead>
                <tbody>
                    <tr style="background: white;"><td style="padding: 8px;">Large (close to m/2)</td><td style="padding: 8px;">Roughly equal +/- counts</td><td style="padding: 8px;">Cannot reject H₀ (median = M₀)</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 8px;">Small (near 0)</td><td style="padding: 8px;">Most values on one side</td><td style="padding: 8px;">Reject H₀ (median ≠ M₀)</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    
    return { testStatistic, nonZero, pValue, rejectH0, positives, negatives, zeros, steps };
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
            setHtml(stepsSpan, result.message);
        } else {
            setHtml(valueSpan, `Test stat = ${result.testStatistic} | p = ${result.pValue.toFixed(6)} | ${result.rejectH0 ? 'Reject H₀' : 'Fail to reject H₀'}`);
            setHtml(stepsSpan, result.steps);
        }
    });
    
    attachClearHandler("signClearBtn", "signData", "signResultArea");
}
