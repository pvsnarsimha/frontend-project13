/* Tool toolkit: declarative definitions for the common "paste a list of numbers, press Calculate" tool.
 *
 * defineListTool({...}) returns { render, setup } with the same markup, element ids and behaviour that were
 * previously copy-pasted into every renderXInterface()/setupXLogic() pair. A tool is now its configuration plus
 * a compute function:
 *
 *   const meanTool = defineListTool({
 *       id: 'mean', interfaceId: 'statMeanInterface',
 *       title: '📐 Arithmetic Mean', formula: 'μ = (Σ xᵢ) / n', desc: '...',
 *       placeholder: 'Example: 12, 45.5, 78', buttonText: '📐 Calculate Mean',
 *       resultLabel: '📊 ARITHMETIC MEAN RESULT',
 *       empty: { value: 'No data', steps: 'Enter numbers ...' },
 *       min: { count: 2, value: '❌ Need at least 2 values', steps: '...' },   // optional
 *       compute: computeMeanWithSteps,        // (numbers) -> { steps, error?, message?, ...values }
 *       display: r => r.value.toFixed(10)     // result -> text shown in the answer tile
 *   });
 *
 * Never assign to .innerHTML in tool code: use setHtml(element, html) (sanitised, see above).
 *
 * Conventions every compute function follows: return { error: true, message } for bad input (the message says
 * how to fix it) and put the worked solution in `steps`.
 */

// Escape text that comes from the user before it is placed into innerHTML
function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- Safe HTML insertion ----------------------------------------------------------------------------------------
// Every tool builds its result as an HTML string that includes text typed by the user. setHtml() is the only place
// that string reaches the page: it is parsed into an inert <template>, stripped of anything that can run code
// (script/iframe/object/embed..., on* handlers, javascript: URLs), and only then attached. The page's
// Content-Security-Policy is a second line of defence. Never assign to .innerHTML directly (a test enforces this).
const HTML_BLOCKED_TAGS = new Set(['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'FRAME', 'FRAMESET', 'APPLET', 'FORM', 'FOREIGNOBJECT', 'USE']);
const HTML_URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'background', 'ping']);

function sanitizeHtmlTree(root) {
    const blocked = [];
    root.querySelectorAll('*').forEach(node => {
        if (HTML_BLOCKED_TAGS.has(node.tagName.toUpperCase())) { blocked.push(node); return; }
        for (const attr of Array.from(node.attributes)) {
            const name = attr.name.toLowerCase();
            const value = attr.value.replace(/[\u0000-\u0020]+/g, '').toLowerCase();
            if (name.startsWith('on') || name === 'srcdoc' || (HTML_URL_ATTRIBUTES.has(name) && /^(javascript|vbscript|data):/.test(value) && !/^data:image\/(png|jpeg|gif|webp);/.test(value))) {
                node.removeAttribute(attr.name);
            }
        }
    });
    blocked.forEach(node => node.remove());
    return root;
}

// Removes on*="..." attributes from the tags of an HTML string BEFORE it is parsed. The DOM pass below is the real
// sanitiser; this only stops recent browsers from reporting a Content-Security-Policy violation (console noise, and a
// failing browser test) merely because markup containing a handler was parsed, even inside an inert <template>.
const EVENT_HANDLER_ATTRIBUTE = /[\s/]+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>`]+)/gi;
function stripEventHandlerAttributes(html) {
    return String(html).replace(/<[a-zA-Z][^<>]*>/g, tag => tag.replace(EVENT_HANDLER_ATTRIBUTE, ''));
}

function setHtml(element, html) {
    const template = document.createElement('template');
    template.innerHTML = stripEventHandlerAttributes(html);
    if (!template.content || typeof template.content.querySelectorAll !== 'function') {
        element.innerHTML = stripEventHandlerAttributes(html);   // no real DOM (unit tests with a stub document): at least handlers never reach the stub
        return;
    }
    sanitizeHtmlTree(template.content);
    element.replaceChildren(template.content);
}

// h(tag, attrs, ...children): builds a DOM element without going through an HTML string, so nothing needs escaping or
// sanitising: strings become text nodes (markup in them stays literal), attributes are set with setAttribute, on* handlers
// and script URLs are refused. Children may be strings, numbers, Nodes or arrays of them; null/false/undefined are skipped.
// Prefer it over setHtml for small pieces of UI; setHtml remains for the large worked-solution templates.
function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [name, raw] of Object.entries(attrs || {})) {
        if (raw === null || raw === undefined || raw === false) continue;
        const key = name.toLowerCase(), value = raw === true ? '' : String(raw);
        if (key.startsWith('on') || key === 'srcdoc' || key === 'style') continue;      // style belongs in a class (css/)
        if (HTML_URL_ATTRIBUTES.has(key) && /^(javascript|vbscript|data):/.test(value.replace(/[\u0000-\u0020]+/g, '').toLowerCase()) && !/^data:image\/(png|jpeg|gif|webp);/i.test(value.replace(/\s+/g, ''))) continue;
        if (key === 'class' || key === 'classname') el.className = value;
        else el.setAttribute(name, value);
    }
    const add = child => {
        if (child === null || child === undefined || child === false) return;
        if (Array.isArray(child)) child.forEach(add);
        else el.appendChild(typeof child === 'object' && child.nodeType ? child : document.createTextNode(String(child)));
    };
    children.forEach(add);
    return el;
}

// ---- Shared form constants (used by many buildInterface configs) ----
const FIELD_GAP = "margin-top: 15px;";
const FIELD_STYLE = "width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;";
// Same as FIELD_STYLE plus the outlined border some selects use
const FIELD_STYLE_BORDERED = "width: 100%; padding: 10px; border-radius: 40px; border: 1px solid #cbdde9; margin-bottom: 15px;";
const HINT_STYLE = "font-size: 0.75rem; margin-top: 5px;";
const CARD_GAP = "margin-top: 8px;";
const DISTRIBUTION_OPTIONS = [ ["normal", "Normal Distribution"], ["uniform", "Uniform Distribution"], ["exponential", "Exponential Distribution"], ["beta", "Beta Distribution"] ];
const DISTRIBUTION_OPTIONS_2 = [ ["normal", "Normal Distribution"], ["exponential", "Exponential Distribution"], ["uniform", "Uniform Distribution"], ["beta", "Beta Distribution"], ["poisson", "Poisson Distribution (Discrete)"], ["binomial", "Binomial Distribution (Discrete)"] ];
// Parameter fields of the probability distributions, shared by every tool that asks for them (pdf, cdf, quantile, random,
// expected value, mgf, entropy, variance, skewness, kurtosis). Each entry is [id suffix, label, default, extra attributes];
// a tool's input ids are its prefix + suffix (prefix "pdf" -> pdfMean, pdfStd, ...).
const DISTRIBUTION_PARAMS = {
    normal: [['Mean', 'Mean (μ)', 0, 'step="any"'], ['Std', 'Standard Deviation (σ)', 1, 'step="any" min="0.01"']],
    uniform: [['Min', 'Minimum (a)', 0, 'step="any"'], ['Max', 'Maximum (b)', 1, 'step="any"']],
    exponential: [['Rate', 'Rate (λ)', 1, 'step="any" min="0.01"']],
    beta: [['Alpha', 'Alpha (α)', 2, 'step="any" min="0.01"'], ['Beta', 'Beta (β)', 5, 'step="any" min="0.01"']],
    poisson: [['Lambda', 'Lambda (λ)', 3, 'step="any" min="0.01"']],
    binomial: [['N', 'Number of trials (n)', 10, 'step="1" min="1"'], ['P', 'Probability of success (p)', 0.5, 'step="0.1" min="0" max="1"']]
};
const DISTRIBUTION_PARAM_STYLE = "width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 10px;";

// Fills <prefix>Params with the fields of the distribution chosen in <prefix>Distribution.
//   skip   id suffixes to leave out (a tool that does not need the mean, say)
//   notes  { distribution: text } shown under the fields in a "desc" box
function showDistributionParams(prefix, { skip = [], notes = {} } = {}) {
    const dist = document.getElementById(prefix + 'Distribution').value;
    const fields = DISTRIBUTION_PARAMS[dist];
    if (!fields) return;
    const inputs = fields.filter(([suffix]) => !skip.includes(suffix)).map(([suffix, label, value, attrs]) =>
        `<label>📊 ${label}:</label>\n<input type="number" id="${prefix}${suffix}" value="${value}" ${attrs} style="${DISTRIBUTION_PARAM_STYLE}">`).join('\n');
    const note = notes[dist] ? `<div class="desc">${notes[dist]}</div>` : '';
    setHtml(document.getElementById(prefix + 'Params'), inputs + note);
}

// ---- Raw data or summary statistics ----------------------------------------------------------------------------------
// A textbook question often gives n, the mean and the standard deviation instead of the raw values. Tools that accept both put a
// select with data-mode-select in the form and wrap each way of entering data in a data-mode group; the page-level handler in
// app.js shows the group that matches the select (the summary group starts hidden).
const INPUT_MODE_OPTIONS = [["raw", "📋 Raw data (a list of values)", true], ["summary", "🧮 Summary statistics (n, mean, standard deviation)"]];
// group (optional): a name that pairs this select with the modeGroupHtml(..., group) blocks it switches, so one tool can have several
// independent switches (the two-sample t-test lets each sample be raw data or a summary on its own)
function inputModeItem(id, summaryText, group, label) {
    const select = { id, "data-mode-select": true, style: FIELD_STYLE };
    if (group) select["data-mode-group"] = group;
    return { label: label || "📥 What does your question give you?", select,
             options: summaryText ? [INPUT_MODE_OPTIONS[0], ["summary", summaryText]] : INPUT_MODE_OPTIONS };
}
function modeGroupHtml(mode, innerHtml, group) {
    return `<div data-mode="${mode}"${group ? ` data-mode-group="${group}"` : ''}${mode === 'raw' ? '' : ' style="display: none;"'}>${innerHtml}</div>`;
}
// fields: [[id, label, defaultValue, extraAttributes?], ...] -> number inputs for the summary group
function summaryFieldsHtml(fields) {
    return fields.map(([id, label, value, attrs]) => `<label>${label}</label>\n<input type="number" id="${id}" value="${value}" step="any" ${attrs || ''} style="${FIELD_STYLE}">`).join('\n');
}

const ALPHA_OPTIONS = [ ["0.10", "α = 0.10 (90% Confidence)"], ["0.05", "α = 0.05 (95% Confidence) - Standard", true], ["0.01", "α = 0.01 (99% Confidence)"] ];
const ALPHA_OPTIONS_2 = [ ["0.10", "α = 0.10 (90% Confidence Level)"], ["0.05", "α = 0.05 (95% Confidence Level) - Standard", true], ["0.01", "α = 0.01 (99% Confidence Level)"] ];
const ALPHA_OPTIONS_3 = [ ["0.10", "α = 0.10 (90% Confidence)"], ["0.05", "α = 0.05 (95% Confidence)", true], ["0.01", "α = 0.01 (99% Confidence)"] ];

// ---- Interface builder ---------------------------------------------------------------------------------------------
// Every tool's form has the same frame: title, formula card, a list of labelled inputs, Calculate/Clear buttons and a
// hidden result card. buildInterface() renders that frame from a plain configuration object:
//
//   buildInterface({
//       id: 'statDemoInterface', title: '...', formula: '...', desc: '...',     // or card: [{ formula: '..' }, { desc: '..', attrs: { style: '..' } }, ...]
//       inputs: [
//           { label: 'Sample', textarea: { id: 'demoData', rows: 4, placeholder: 'Example: 1, 2, 3' } },
//           { label: 'Significance level', select: { id: 'demoAlpha' }, options: [['0.05', 'α = 0.05', true], ['0.01', 'α = 0.01']] },
//           { label: 'Mean', input: { id: 'demoMu', type: 'number', value: '0' } },
//           { hint: 'Text shown under the last input' },
//           { html: '<div id="demoParams"></div>' }          // anything dynamic is kept verbatim
//       ],
//       run: { id: 'demoComputeBtn', text: 'Calculate' }, clear: { id: 'demoClearBtn', text: 'Clear' },
//       result: { area: 'demoResultArea', label: 'DEMO RESULT', value: 'demoValueDisplay', steps: 'demoStepsDisplay' }
//   });
//
// Each input entry is an optional label plus one control (textarea / input / select / hint / raw html); attribute values
// are emitted verbatim.
// Two styles of worked solution, both rendered by buildSolution() in js/ui/solution.js:
//   * plain text: set stepsSpan.innerText (as the list tools built with defineListTool do). The text is parsed into titled steps,
//     formulas, sub-steps, tables (│ a │ b │ rows) and a "✅ …" / "FINAL RESULTS" block. Simple and safe, but it cannot hold a real table.
//   * HTML: setHtml(stepsSpan, html) (as the two-sample, regression and plot tools do). Use it when the solution needs real tables,
//     coloured cards or a canvas. Style it with classes from css/, not inline style attributes.
// Copy a tool of the style you need; do not mix the two in one tool. Set parameterOnly: true for a form with no pasted data
// (number fields and drop-downs only): it is rendered as data-parameter-only, and the tests then expect no "Try sample data" button.
// Sample-data contract: every `textarea` input needs a placeholder starting "Example:" (js/ui/forms.js turns it into the "Try sample data" button);
// a tool with no pasted data sets `parameterOnly: true`. A test fails for a textarea without an Example.
function buildInterface(cfg) {
    const attrs = a => Object.entries(a || {}).map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${v}"`)).join('');
    const control = item => {
        if (item.textarea) return `<textarea${attrs(item.textarea)}>${item.text || ''}</textarea>`;
        if (item.input) return `<input${attrs(item.input)}>`;
        if (item.select) {
            const options = item.options.map(([value, text, selected]) => `<option value="${value}"${selected ? ' selected' : ''}>${text}</option>`).join('\n                        ');
            return `<select${attrs(item.select)}>\n                        ${options}\n                    </select>`;
        }
        if (item.hint !== undefined) return `<div class="desc"${attrs(item.hintAttrs)}>${item.hint}</div>`;
        if (item.html !== undefined) return item.html;
        return '';
    };
    const inputs = cfg.inputs.map(item => [
        item.label !== undefined ? `<label${attrs(item.labelAttrs)}>${item.label}</label>` : '',
        control(item)
    ].filter(Boolean).join('\n                    ')).join('\n                    ');
    const card = (cfg.card || [{ formula: cfg.formula }, { desc: cfg.desc }])
        .map(c => (c.formula !== undefined ? `<div class="formula"${attrs(c.attrs)}>${c.formula}</div>` : `<div class="desc"${attrs(c.attrs)}>${c.desc}</div>`))
        .join('\n                    ');
    const r = cfg.result;
    return `
            <div class="stat-interface"${cfg.id ? ` id="${cfg.id}"` : ''}${cfg.parameterOnly ? ' data-parameter-only="true"' : ''}>
                <div class="interface-title">${cfg.title}</div>
                <div class="formula-card">
                    ${card}
                </div>
                <div class="data-input-section">
                    ${inputs}
                    <div class="action-row">
                        <button class="primary-btn" id="${cfg.run.id}">${cfg.run.text}</button>
                        <button class="secondary-btn" id="${cfg.clear.id}">${cfg.clear.text}</button>
                    </div>
                </div>
                <div id="${r.area}" style="display: none;">
                    <div class="result-card">
                        <div class="result-label">${r.label}</div>
                        <div class="result-value" id="${r.value}">${r.valueText || '—'}</div>
                        <div class="calculation-steps" id="${r.steps}">${r.stepsText || ''}</div>
                    </div>${(r.extra || []).map(x => '\n                    ' + x).join('')}
                </div>
            </div>
        `;
}

function defineListTool(cfg) {
    const id = cfg.id, elementId = suffix => (cfg.elementPrefix || id) + suffix;

    function render() {
        return `
            <div class="stat-interface" id="${cfg.interfaceId}">
                <div class="interface-title">${cfg.title}</div>
                <div class="formula-card">
                    <div class="formula">${cfg.formula}</div>
                    <div class="desc">${cfg.desc}</div>
                </div>
                <div class="data-input-section">
                    <label>${cfg.label || '📋 Enter numeric values'}</label>
                    <textarea id="${elementId('Input')}" rows="3" placeholder="${cfg.placeholder}"></textarea>
                    <div class="action-row">
                        <button class="primary-btn" id="${elementId('ComputeBtn')}">${cfg.buttonText}</button>
                        <button class="secondary-btn" id="${elementId('ClearBtn')}">Clear</button>
                    </div>
                </div>
                <div id="${elementId('ResultArea')}" style="display: none;">
                    <div class="result-card">
                        <div class="result-label">${cfg.resultLabel}</div>
                        <div class="result-value" id="${elementId('ValueDisplay')}">—</div>
                        <div class="calculation-steps" id="${elementId('StepsDisplay')}">${cfg.stepsPlaceholder || ''}</div>
                    </div>
                </div>
            </div>
        `;
    }

    function setup() {
        const computeBtn = document.getElementById(elementId('ComputeBtn'));
        if (!computeBtn) return;
        computeBtn.addEventListener('click', () => {
            const numbers = parseNumbersFromInput(document.getElementById(elementId('Input')).value);
            const resultDiv = document.getElementById(elementId('ResultArea'));
            const valueSpan = document.getElementById(elementId('ValueDisplay'));
            const stepsSpan = document.getElementById(elementId('StepsDisplay'));
            resultDiv.style.display = 'block';
            if (!numbers.length) {
                valueSpan.innerText = cfg.empty.value;
                stepsSpan.innerText = cfg.empty.steps;
                return;
            }
            if (cfg.min && numbers.length < cfg.min.count) {
                valueSpan.innerText = cfg.min.value;
                stepsSpan.innerText = cfg.min.steps;
                return;
            }
            const result = cfg.compute(numbers);
            if (result.error) {
                valueSpan.innerText = cfg.errorValue || 'Error';
                setHtml(stepsSpan, '⚠️ ' + escapeHtml(result.message));
                return;
            }
            valueSpan.innerText = cfg.display(result);
            stepsSpan.innerText = result.steps;
        });
        attachClearHandler(elementId('ClearBtn'), elementId('Input'), elementId('ResultArea'));
    }

    return { render, setup };
}
