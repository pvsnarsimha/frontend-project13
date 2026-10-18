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
const HTML_URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'background']);

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

function setHtml(element, html) {
    const template = document.createElement('template');
    template.innerHTML = String(html);
    if (!template.content || typeof template.content.querySelectorAll !== 'function') {
        element.innerHTML = String(html);          // no real DOM (unit tests with a stub document)
        return;
    }
    sanitizeHtmlTree(template.content);
    element.replaceChildren(template.content);
}

// ---- Shared form constants (used by many buildInterface configs) ----
const FIELD_GAP = "margin-top: 15px;";
const FIELD_STYLE = "width: 100%; padding: 10px; border-radius: 40px; margin-bottom: 15px;";
const HINT_STYLE = "font-size: 0.75rem; margin-top: 5px;";
const CARD_GAP = "margin-top: 8px;";
const DISTRIBUTION_OPTIONS = [ ["normal", "Normal Distribution"], ["uniform", "Uniform Distribution"], ["exponential", "Exponential Distribution"], ["beta", "Beta Distribution"] ];
const DISTRIBUTION_OPTIONS_2 = [ ["normal", "Normal Distribution"], ["exponential", "Exponential Distribution"], ["uniform", "Uniform Distribution"], ["beta", "Beta Distribution"], ["poisson", "Poisson Distribution (Discrete)"], ["binomial", "Binomial Distribution (Discrete)"] ];
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
            <div class="stat-interface"${cfg.id ? ` id="${cfg.id}"` : ''}>
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
                stepsSpan.innerText = result.message;
                return;
            }
            valueSpan.innerText = cfg.display(result);
            stepsSpan.innerText = result.steps;
        });
        attachClearHandler(elementId('ClearBtn'), elementId('Input'), elementId('ResultArea'));
    }

    return { render, setup };
}
