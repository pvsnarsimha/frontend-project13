/* ProbCalc: Probability Calculator (render, compute, setup). Pick a distribution and a question such as P(a ≤ X ≤ b); the shaded graph shows the area. */

const PROBCALC_QUESTIONS = [
    ['le', 'P(X ≤ a)', 'at most a'], ['lt', 'P(X < a)', 'less than a'], ['ge', 'P(X ≥ a)', 'at least a'], ['gt', 'P(X > a)', 'more than a'],
    ['between', 'P(a ≤ X ≤ b)', 'between a and b'], ['outside', 'P(X < a or X > b)', 'outside a to b'], ['eq', 'P(X = a)  (discrete distributions)', 'exactly a']
];

function renderProbCalcInterface() {
    return buildInterface({
        id: "statProbCalcInterface",
        title: "🧮 Probability Calculator (shaded graph)",
        formula: "📌 P(a ≤ X ≤ b) = F(b) − F(a)   |   P(X > a) = 1 − F(a)",
        desc: "Type a probability question from a textbook, such as \"P(X ≤ 7) for a Binomial(10, 0.5)\" or \"P(−1 ≤ Z ≤ 2)\", and get the answer with the area shaded on the distribution.",
        inputs: [
            {
                label: "📋 Select Distribution:",
                select: { id: "probcalcDistribution", style: FIELD_STYLE },
                options: Object.entries(PLOT_DISTRIBUTIONS).map(([key, d]) => [key, d.label + (d.kind === 'discrete' ? ' (discrete)' : ''), key === 'normal'])
            },
            { html: "<div id=\"probcalcParams\"></div>" },
            {
                label: "📋 Probability question:",
                select: { id: "probcalcQuestion", style: FIELD_STYLE },
                options: PROBCALC_QUESTIONS.map(([key, text]) => [key, text, key === 'between'])
            },
            { label: "📊 Value a:", labelAttrs: { style: FIELD_GAP }, input: { type: "number", id: "probcalcA", value: "-1", step: "any", style: FIELD_STYLE } },
            { label: "📊 Value b (only for the two-value questions):", input: { type: "number", id: "probcalcB", value: "2", step: "any", style: FIELD_STYLE } }
        ],
        run: { id: "probcalcComputeBtn", text: "🧮 Calculate Probability + Graph" },
        clear: { id: "probcalcClearBtn", text: "Clear" },
        parameterOnly: true,
        result: { area: "probcalcResultArea", label: "🎯 PROBABILITY", value: "probcalcValueDisplay", steps: "probcalcStepsDisplay" }
    });
}

function updateProbCalcParams() {
    const name = document.getElementById('probcalcDistribution').value;
    const d = PLOT_DISTRIBUTIONS[name];
    if (!d) return;
    const html = d.fields.map(([key, label, value]) =>
        `<label>📊 ${label}:</label>\n<input type="number" id="probcalcParam_${key}" value="${value}" step="any" style="${DISTRIBUTION_PARAM_STYLE}">`).join('\n');
    setHtml(document.getElementById('probcalcParams'), html);
}

function readProbCalcParams(name) {
    const d = PLOT_DISTRIBUTIONS[name], params = {};
    for (const [key] of d.fields) {
        const el = document.getElementById('probcalcParam_' + key);
        params[key] = el ? parseFloat(el.value) : NaN;
    }
    return params;
}

// ========== COMPUTATION (pure: no page access) ==========
function computeProbCalcWithSteps(distName, params, question, a, b) {
    const d = PLOT_DISTRIBUTIONS[distName];
    if (!d) return { error: true, message: "Choose one of the listed distributions." };
    if (!d.valid(params) || d.fields.some(([k]) => !Number.isFinite(params[k]))) {
        return { error: true, message: `The parameters of the ${d.label} distribution are not valid (all must be numbers; scales, degrees of freedom and rates must be positive${d.kind === 'discrete' ? '; n must be a whole number from 1 to 1000' : ''}).` };
    }
    if (!Number.isFinite(a)) return { error: true, message: "Enter a number for a." };
    const twoValue = question === 'between' || question === 'outside';
    if (twoValue && !Number.isFinite(b)) return { error: true, message: "Enter a number for b." };
    if (twoValue && !(a <= b)) return { error: true, message: "For the two-value questions a must not be larger than b." };
    const discrete = d.kind === 'discrete';
    if (question === 'eq' && !discrete) return { error: true, message: "P(X = a) is 0 for every single value of a continuous distribution; use a range instead (or pick a discrete distribution)." };

    const F = x => d.cdf(x, params);
    const fa = a => String(+a.toPrecision(6));
    const paramText = d.fields.map(([k, label]) => `${label.replace(/ .*/, '')} ${label.replace(/^[^ ]+ /, '')} = ${params[k]}`).join(', ');
    let p, formula, intervals, working = [];
    const lowEdge = discrete ? Math.ceil(a) - 1 : a;        // F(a-) : the largest value strictly below a (integers) or a itself (continuous)
    const hiA = discrete ? Math.floor(a) : a, hiB = discrete ? Math.floor(b) : b;
    switch (question) {
        case 'le': p = F(hiA); formula = 'P(X ≤ a) = F(a)'; working = [`F(${fa(hiA)}) = ${p.toFixed(8)}`]; intervals = [{ from: -Infinity, to: a, incTo: true }]; break;
        case 'lt': p = F(discrete ? lowEdge : a); formula = discrete ? 'P(X < a) = F(a − 1)  (whole numbers)' : 'P(X < a) = F(a)  (a single point has probability 0)'; working = [`F(${fa(discrete ? lowEdge : a)}) = ${p.toFixed(8)}`]; intervals = [{ from: -Infinity, to: a, incTo: false }]; break;
        case 'ge': p = 1 - F(discrete ? lowEdge : a); formula = discrete ? 'P(X ≥ a) = 1 − F(a − 1)  (whole numbers)' : 'P(X ≥ a) = 1 − F(a)'; working = [`F(${fa(discrete ? lowEdge : a)}) = ${F(discrete ? lowEdge : a).toFixed(8)}`]; intervals = [{ from: a, to: Infinity, incFrom: true }]; break;
        case 'gt': p = 1 - F(hiA); formula = 'P(X > a) = 1 − F(a)'; working = [`F(${fa(hiA)}) = ${F(hiA).toFixed(8)}`]; intervals = [{ from: a, to: Infinity, incFrom: false }]; break;
        case 'between': p = F(hiB) - F(discrete ? lowEdge : a); formula = discrete ? 'P(a ≤ X ≤ b) = F(b) − F(a − 1)  (whole numbers)' : 'P(a ≤ X ≤ b) = F(b) − F(a)'; working = [`F(${fa(hiB)}) = ${F(hiB).toFixed(8)}`, `F(${fa(discrete ? lowEdge : a)}) = ${F(discrete ? lowEdge : a).toFixed(8)}`]; intervals = [{ from: a, to: b, incFrom: true, incTo: true }]; break;
        case 'outside': p = 1 - (F(hiB) - F(discrete ? lowEdge : a)); formula = 'P(X < a or X > b) = 1 − P(a ≤ X ≤ b)'; working = [`F(${fa(hiB)}) = ${F(hiB).toFixed(8)}`, `F(${fa(discrete ? lowEdge : a)}) = ${F(discrete ? lowEdge : a).toFixed(8)}`]; intervals = [{ from: -Infinity, to: a, incTo: false }, { from: b, to: Infinity, incFrom: false }]; break;
        default: p = Number.isInteger(a) ? d.pmf(a, params) : 0; formula = 'P(X = a) = P(X = k) from the probability mass function'; working = [Number.isInteger(a) ? `P(X = ${a}) = ${p.toFixed(8)}` : `${fa(a)} is not a whole number, so P(X = a) = 0`]; intervals = [{ from: a, to: a, incFrom: true, incTo: true }]; break;
    }
    p = Math.min(1, Math.max(0, p));
    const q = PROBCALC_QUESTIONS.find(x => x[0] === question);
    const questionText = q[1].replace('P(X ≤ a)', `P(X ≤ ${fa(a)})`).replace('P(X < a or X > b)', `P(X < ${fa(a)} or X > ${fa(b)})`).replace('P(a ≤ X ≤ b)', `P(${fa(a)} ≤ X ≤ ${fa(b)})`)
        .replace('P(X < a)', `P(X < ${fa(a)})`).replace('P(X ≥ a)', `P(X ≥ ${fa(a)})`).replace('P(X > a)', `P(X > ${fa(a)})`).replace(/P\(X = a\).*/, `P(X = ${fa(a)})`);
    let steps = `🧮 PROBABILITY CALCULATOR\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    steps += `Distribution: ${d.label}   (${paramText})\n`;
    steps += `Question:     ${questionText}\n\n`;
    steps += `Formula:      ${formula}\n`;
    steps += `              F(x) = P(X ≤ x) is the cumulative distribution function.\n\n`;
    steps += `Working:\n${working.map(w => `   ${w}`).join('\n')}\n`;
    if (question === 'between' || question === 'outside') steps += `   P(${fa(a)} ≤ X ≤ ${fa(b)}) = ${(F(hiB)).toFixed(8)} − ${F(discrete ? lowEdge : a).toFixed(8)} = ${(F(hiB) - F(discrete ? lowEdge : a)).toFixed(8)}\n`;
    steps += `\n✅ ${questionText} = ${p.toFixed(8)}   (${(p * 100).toFixed(4)}%)\n`;
    const words = { le: `at most ${fa(a)}`, lt: `less than ${fa(a)}`, ge: `at least ${fa(a)}`, gt: `more than ${fa(a)}`, between: `between ${fa(a)} and ${fa(b)} (both included)`, outside: `below ${fa(a)} or above ${fa(b)}`, eq: `exactly ${fa(a)}` }[question];
    steps += `\n📖 In words: the chance that X is ${words} is about ${(p * 100).toFixed(2)}%.\n`;
    if (!discrete && (question === 'lt' || question === 'gt' || question === 'ge')) steps += `   (For a continuous distribution P(X < a) = P(X ≤ a): a single point carries no probability.)\n`;
    return { probability: p, steps, question, intervals, distName, params };
}

// ========== SETUP ==========
function setupProbCalcLogic() {
    const distSelect = document.getElementById('probcalcDistribution');
    if (distSelect) {
        distSelect.addEventListener('change', updateProbCalcParams);
        updateProbCalcParams();
    }
    const computeBtn = document.getElementById('probcalcComputeBtn');
    if (computeBtn) {
        computeBtn.addEventListener('click', () => {
            const name = document.getElementById('probcalcDistribution').value;
            const params = readProbCalcParams(name);
            const question = document.getElementById('probcalcQuestion').value;
            const a = parseFloat(document.getElementById('probcalcA').value), b = parseFloat(document.getElementById('probcalcB').value);
            const result = computeProbCalcWithSteps(name, params, question, a, b);
            const resultDiv = document.getElementById('probcalcResultArea');
            const valueSpan = document.getElementById('probcalcValueDisplay');
            const stepsSpan = document.getElementById('probcalcStepsDisplay');
            resultDiv.style.display = 'block';
            if (result.error) {
                valueSpan.innerText = 'Error';
                setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
                hideAllStatCharts();
                return;
            }
            valueSpan.innerText = `P = ${result.probability.toFixed(6)}`;
            stepsSpan.innerText = result.steps;
            showProbCalcGraph('probcalcResultArea', name, params, result.intervals, result.probability);
        });
    }
    attachClearHandler('probcalcClearBtn', ['probcalcA', 'probcalcB'], 'probcalcResultArea');
}
