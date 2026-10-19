'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadApp, scriptList, ROOT } = require('./load-app');

const html = fs.readFileSync(path.join(ROOT, 'Statistics.html'), 'utf8');
const app = loadApp();
const routes = app.get('STAT_ROUTES');

test('every script referenced by Statistics.html exists', () => {
    for (const rel of scriptList()) assert.ok(fs.existsSync(path.join(ROOT, rel)), rel);
});

test('no top-level function is defined twice (a later copy silently replaces the earlier one)', () => {
    const seen = new Map();
    const dups = [];
    for (const rel of scriptList()) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        for (const m of src.matchAll(/^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/gm)) {
            if (seen.has(m[1])) dups.push(`${m[1]} (${seen.get(m[1])} and ${rel})`);
            else seen.set(m[1], rel);
        }
    }
    assert.deepEqual(dups, []);
});

test('route table: every tool has a render function and (if present) a setup function', () => {
    const entries = Object.entries(routes);
    assert.ok(entries.length >= 95, 'expected the full tool set');
    for (const [stat, [render, setup]] of entries) {
        assert.equal(typeof render, 'function', `${stat}: render`);
        assert.ok(setup === null || typeof setup === 'function', `${stat}: setup`);
    }
});

test('every sidebar button points at a registered tool, and every tool has a button', () => {
    const buttonStats = [...html.matchAll(/data-stat="([^"]+)"/g)].map(m => m[1]);
    for (const s of buttonStats) assert.ok(routes[s], `button points at unknown tool "${s}"`);
    const unreachable = Object.keys(routes).filter(s => !buttonStats.includes(s));
    assert.deepEqual(unreachable, []);
    assert.equal(new Set(buttonStats).size, buttonStats.length, 'two buttons open the same tool');
});

test('every sidebar button has a unique id', () => {
    const ids = [...html.matchAll(/<button[^>]*\sdata-stat="[^"]+"[^>]*>/g)].map(m => (m[0].match(/\sid="([^"]+)"/) || [])[1]);
    assert.ok(ids.every(Boolean), 'a data-stat button has no id');
    assert.equal(new Set(ids).size, ids.length, 'two data-stat buttons share an id');
});

test('element ids in the page shell are unique', () => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dups, []);
});

test('every rendered interface has labelled controls and no duplicate ids', () => {
    for (const [stat, [render]] of Object.entries(routes)) {
        const out = render();
        const ids = [...out.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
        assert.equal(new Set(ids).size, ids.length, `${stat}: duplicate ids in rendered interface`);
        assert.ok(/<textarea|<input|<select/.test(out), `${stat}: has no input control`);
    }
});

test('accessibility basics in the page shell', () => {
    assert.match(html, /<html lang="en">/);
    assert.match(html, /role="tablist"/);
    assert.match(html, /class="skip-link"/);
    assert.match(html, /<main /);
    assert.match(html, /id="closeChartBtn"[^>]*aria-label=/);
    // decorative emoji icons are hidden from assistive technology
    const icons = [...html.matchAll(/<span class="btn-icon"([^>]*)>/g)];
    assert.ok(icons.length > 90);
    for (const m of icons) assert.match(m[1], /aria-hidden="true"/);
});

test('tool code never assigns to .innerHTML directly: everything goes through setHtml()', () => {
    const offenders = [];
    for (const rel of scriptList()) {
        if (rel.endsWith('core/toolkit.js')) continue;               // the sanitiser itself
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        src.split('\n').forEach((line, i) => { if (/\.(innerHTML|outerHTML)\s*\+?=(?!=)/.test(line) || /insertAdjacentHTML|document\.write/.test(line)) offenders.push(`${rel}:${i + 1}`); });
    }
    assert.deepEqual(offenders, []);
});

test('Statistics.html lists exactly the scripts under js/, in dependency order (run `npm run sync:scripts` after adding a file)', () => {
    const { scriptOrder } = require('../scripts/sync-script-tags');
    assert.deepEqual(scriptList(), scriptOrder());
    // nothing on disk is left out
    const onDisk = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
            if (e.isDirectory()) walk(`${dir}/${e.name}`); else if (e.name.endsWith('.js')) onDisk.push(`${dir}/${e.name}`);
        }
    })('js');
    assert.deepEqual([...onDisk].sort(), [...scriptOrder()].sort());
});

test('each tool lives in its own file: one route per file, no file larger than 1,200 lines', () => {
    for (const rel of scriptList()) {
        const lines = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n').length;
        assert.ok(lines <= 1200, `${rel} has ${lines} lines`);
    }
});

test('tool functions live in the file that names them (renderX/computeX/setupX/updateX belong to x.js)', () => {
    const offenders = [];
    for (const rel of scriptList()) {
        if (!rel.startsWith('js/tools/')) continue;
        const key = path.basename(rel, '.js').replace(/[^a-z0-9]/gi, '').toLowerCase();       // median-abs-dev.js -> medianabsdev
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        for (const m of src.matchAll(/^function\s+((?:render|setup|update|compute)[A-Za-z0-9_$]*)\s*\(/gm)) {
            const rest = m[1].replace(/^(render|setup|update|compute)/, '');
            // the file name must start the rest of the function name, ending at a word boundary (computeModelSummary is not a "mode" function)
            const ok = rest.toLowerCase().startsWith(key) && (rest.length === key.length || !/[a-z]/.test(rest[key.length]));
            if (!ok) offenders.push(`${m[1]} in ${rel}`);
        }
    }
    assert.deepEqual(offenders, []);
});

// Opening and closing counts of block-level tags must agree in anything a tool renders or generates.
function unbalancedTags(markup) {
    const bad = [];
    for (const tag of ['div', 'table', 'thead', 'tbody', 'tr', 'select', 'button', 'textarea', 'ul', 'ol', 'details']) {
        const open = (markup.match(new RegExp(`<${tag}(?=[\\s>])`, 'g')) || []).length;
        const close = (markup.match(new RegExp(`</${tag}>`, 'g')) || []).length;
        if (open !== close) bad.push(`<${tag}> opened ${open}, closed ${close}`);
    }
    return bad;
}

test('no script has a syntax error, a stray brace or a damaged closing tag such as "\\\\tour" for "</table>"', () => {
    const vm = require('vm');
    for (const rel of scriptList()) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        assert.doesNotThrow(() => new vm.Script(src, { filename: rel }), `${rel} does not parse`);
        src.split('\n').forEach((line, i) => {
            assert.ok(!/\\\\t[a-z]/.test(line), `${rel}:${i + 1} contains the escape debris "\\\\t…" (a mangled closing tag)`);
            assert.ok(!/(?<=[>\s])\/(?:table|tbody|thead|tr|td|th|div|span|ul|li|ol|p|h[1-6]|strong|details|summary)>/.test(line), `${rel}:${i + 1} has a closing tag without its "<"`);
            assert.ok(!/\b(?:id|class|for|type|value)="[^"]*$/.test(line.replace(/\\"/g, '')), `${rel}:${i + 1} has an attribute whose closing quote is missing`);
        });
    }
});

test('every rendered interface is well-formed: balanced tags, quoted attributes', () => {
    for (const [stat, [render]] of Object.entries(routes)) {
        const out = render();
        assert.deepEqual(unbalancedTags(out), [], `${stat}: unbalanced markup`);
        assert.ok(!/\sid="[^">]*\s*</.test(out) && !/\sid="[^"]*\n/.test(out), `${stat}: an id attribute is not terminated`);
        assert.ok((out.match(/"/g) || []).length % 2 === 0, `${stat}: odd number of quotes`);
    }
});

test('worked-solution markup produced by representative HTML tools is balanced', () => {
    const results = [
        app.computeCorrelationMatrixWithSteps([[1, 2, 3, 4, 5], [2, 1, 4, 3, 6], [5, 3, 4, 1, 2]]).steps,
        app.computeCramersVWithSteps('a,x\na,y\nb,x\nb,y\na,x\nb,y\na,y\nb,x\na,x\nb,y', 0.05).steps,
        app.computeKendallWithSteps([1, 2, 3, 4, 5], [2, 1, 4, 3, 5]).steps,
        app.computeSignTest([1, 2, 3, 4, 5, 6], 3, 0.05, 'two.sided').steps,
        app.computeWilcoxonTest([1, 2, 3, 4, 5, 6], [2, 4, 3, 8, 9, 7], 0.05, 'two.sided').steps,
        app.computeMannWhitneyTest([1, 2, 3, 4], [5, 6, 7, 8, 9], 0.05, 'two.sided').steps,
        app.computeVIF([[1, 2, 4.1], [2, 1, 5.9], [3, 4, 8.2], [4, 3, 9.8], [5, 6, 13.1], [6, 5, 15.7]]).steps
    ];
    results.forEach((html, i) => assert.deepEqual(unbalancedTags(html), [], `solution #${i}`));
});

test('tabs control one labelled tab panel, and the panel is named by the selected tab', () => {
    const panel = html.match(/<div class="main-panel"([^>]*)>/);
    assert.ok(panel, 'main panel');
    assert.match(panel[1], /role="tabpanel"/);
    const id = panel[1].match(/\sid="([^"]+)"/)[1];
    const labelledby = panel[1].match(/aria-labelledby="([^"]+)"/)[1];
    const tabs = [...html.matchAll(/<div class="tab[^"]*" id="([^"]+)"[^>]*aria-controls="([^"]+)"/g)];
    assert.equal(tabs.length, 6);
    for (const [, tabId, controls] of tabs) assert.equal(controls, id, `${tabId} controls the tab panel`);
    assert.ok(tabs.some(([, tabId]) => tabId === labelledby), 'the panel is labelled by one of the tabs');
});

test('the 900px breakpoint is set in exactly one stylesheet (responsive.css)', () => {
    const withBreakpoint = [];
    for (const rel of ['css/statlab.css', 'css/responsive.css']) {
        const css = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        if (/@media[^{]*\(\s*max-width:\s*900px\s*\)/.test(css)) withBreakpoint.push(rel);
        if (rel === 'css/responsive.css') assert.equal((css.match(/@media[^{]*\(\s*max-width:\s*900px\s*\)/g) || []).length, 1, '900px rules are merged into one block');
        if (rel === 'css/responsive.css') assert.ok(!/\[style\*=/.test(css), 'responsive rules use classes, not substrings of the style attribute');
    }
    assert.deepEqual(withBreakpoint, ['css/responsive.css']);
});

test('no duplicate canvas ids: a tool puts its chart canvas in exactly one place', () => {
    const offenders = [];
    for (const rel of scriptList().filter(f => f.startsWith('js/tools/'))) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        const ids = [...src.matchAll(/<canvas id=\\?"([^"\\]+)/g)].map(m => m[1]);
        ids.filter((id, i) => ids.indexOf(id) !== i).forEach(id => offenders.push(`${rel}: ${id}`));
    }
    assert.deepEqual(offenders, []);
});

test('the boxplot plugin is registered per chart, never globally', () => {
    const src = fs.readFileSync(path.join(ROOT, 'js/tools/preparation/boxplot-chart.js'), 'utf8');
    assert.ok(!/Chart\.register\(/.test(src), 'no global Chart.register');
    assert.match(src, /plugins:\s*\[boxplotPlugin\]/);
});

test('no top-level const/let/class name is declared twice, or reuses the name of a function or var (classic scripts share one scope, so it is a SyntaxError that stops every later script)', () => {
    const owners = new Map();     // name -> [{ kind, rel }]
    for (const rel of scriptList()) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        for (const m of src.matchAll(/^(?:(const|let|var|class)|(?:async\s+)?(function))\s*\*?\s+([A-Za-z_$][\w$]*)/gm)) {
            const list = owners.get(m[3]) || [];
            list.push({ kind: m[1] || m[2], rel });
            owners.set(m[3], list);
        }
    }
    const clashes = [];
    for (const [name, list] of owners) {
        const lexical = list.filter(d => d.kind === 'const' || d.kind === 'let' || d.kind === 'class');
        if (lexical.length && list.length > 1) clashes.push(`${name}: ${list.map(d => `${d.kind} in ${d.rel}`).join(', ')}`);
    }
    assert.deepEqual(clashes, []);
});

test('vendor/README.md lists the same chart.js version as the vendored chart.umd.js banner', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'vendor', 'README.md'), 'utf8');
    const banner = fs.readFileSync(path.join(ROOT, 'vendor', 'chart.umd.js'), 'utf8').slice(0, 400).match(/Chart\.js v(\d+\.\d+\.\d+)/);
    const row = readme.match(/^\|\s*`chart\.umd\.js`.*?\|\s*(\d+\.\d+\.\d+)\s*\|/m);
    assert.ok(banner, 'chart.umd.js version comment');
    assert.ok(row, 'chart.umd.js row in vendor/README.md');
    assert.equal(row[1], banner[1]);
});

test('the HTML sanitiser treats ping like the other URL attributes', () => {
    const src = fs.readFileSync(path.join(ROOT, 'js', 'core', 'toolkit.js'), 'utf8');
    assert.match(src.match(/HTML_URL_ATTRIBUTES = new Set\(\[([^\]]*)\]/)[1], /'ping'/);
});

test('result-panel palette tokens exist and no inline style in a tool still uses a retired accent colour', () => {
    const css = fs.readFileSync(path.join(ROOT, 'css', 'statlab.css'), 'utf8');
    for (const token of ['--tp-accent', '--tp-banner', '--tp-head', '--tp-head-soft', '--tp-tint', '--tp-tint-line', '--tp-card']) assert.ok(css.includes(token + ':'), `${token} is not defined`);
    assert.ok(!/\[style\*=/.test(css), 'statlab.css must not match substrings of style attributes (use classes from css/tool-panels.css)');
    const { toolFiles } = require('../scripts/extract-styles');
    const offenders = toolFiles().filter(f => /\sstyle\s*=\s*\\?["'][^"']*#(1a5490|d4380d|e65100|2e7d32|6a1b9a)/i.test(fs.readFileSync(f, 'utf8'))).map(f => path.relative(ROOT, f));
    assert.deepEqual(offenders, [], 'these inline styles use an accent colour that only a class can re-theme');
});

// Tool markup is styled by classes in css/tool-panels.css. scripts/extract-styles.js converts inline styles and keeps the CSS in step.
test('tool files carry no convertible inline style, every s-xxxxxx class has a rule and every rule is used (npm run sync:styles)', () => {
    const { check } = require('../scripts/extract-styles');
    const r = check();
    assert.deepEqual(r.inline, [], 'run: node scripts/extract-styles.js');
    assert.deepEqual(r.missingRule, [], 'a class is used but css/tool-panels.css has no rule for it');
    assert.deepEqual(r.orphanRule, [], 'css/tool-panels.css has rules no tool uses; run: node scripts/extract-styles.js');
    assert.ok(html.includes('css/tool-panels.css'), 'Statistics.html must load css/tool-panels.css');
});

test('every generated rule in css/tool-panels.css is one well-formed declaration block (no leaked JavaScript)', () => {
    const rules = fs.readFileSync(path.join(ROOT, 'css', 'tool-panels.css'), 'utf8').split('\n').filter(l => l.startsWith('#interfaceRoot'));
    assert.ok(rules.length > 500);
    const bad = rules.filter(l => !/^[^{}]*\{[^{}]*\}$/.test(l) || /\+|\$|"|\\|`/.test(l.replace(/font-family:[^;]*/g, '')) || /[^\w\s]'|'[^\w\s]/.test(l.replace(/font-family:[^;]*/g, '')));
    assert.deepEqual(bad.slice(0, 5), []);
});

test('every tp-* class a tool names has a hand-written rule in css/tool-panels.css', () => {
    const css = fs.readFileSync(path.join(ROOT, 'css', 'tool-panels.css'), 'utf8');
    const defined = new Set([...css.matchAll(/#interfaceRoot \.([\w-]+)/g)].map(m => m[1]));
    const { toolFiles } = require('../scripts/extract-styles');
    for (const f of toolFiles()) {
        const src = fs.readFileSync(f, 'utf8');
        const used = [...src.matchAll(/'(tp-[\w-]+)'/g)].map(m => m[1]);
        assert.deepEqual(used.filter(c => !defined.has(c)), [], `${path.relative(ROOT, f)} uses tp-* classes with no CSS rule`);
    }
});

test('the extractor reproduces the old statlab.css re-theming when it writes a rule', () => {
    const { buildRule } = require('../scripts/extract-styles');
    const banner = buildRule('div', 'background: linear-gradient(135deg, #1a5490 0%, #0d3b66 100%); color: white;').css.join('\n');
    assert.match(banner, /var\(--tp-banner\) !important/);
    const head = buildRule('tr', 'background: #1a5490;').css.join('\n');
    assert.match(head, /background: var\(--tp-head\) !important/);
    assert.match(head, / th \{ color: #fff !important; background: transparent !important; \}/);
    assert.equal(buildRule('p', 'margin: 0;').css.length, 1, 'a style with no palette colour gets a plain rule');
});

test('split tools keep the calculation and the worked-solution HTML in separate files', () => {
    for (const tool of ['hypothesis/levene', 'hypothesis/bartlett', 'hypothesis/bonferroni', 'hypothesis/scheffe', 'correlation/cooks-distance', 'preparation/boxplot']) {
        const main = fs.readFileSync(path.join(ROOT, 'js', 'tools', tool + '.js'), 'utf8');
        const steps = fs.readFileSync(path.join(ROOT, 'js', 'tools', tool + '-steps.js'), 'utf8');
        assert.match(main, /stepsHtml[A-Z]\w*\(\{/, `${tool}.js should call its stepsHtml function`);
        assert.match(steps, /^function stepsHtml[A-Z]\w*\(scope\)/m);
    }
});

test('h() is defined once in toolkit.js and never assigned to innerHTML', () => {
    const src = fs.readFileSync(path.join(ROOT, 'js', 'core', 'toolkit.js'), 'utf8');
    assert.match(src, /^function h\(tag, attrs, \.\.\.children\)/m);
    const body = src.slice(src.indexOf('function h(tag'), src.indexOf('// ---- Shared form constants'));
    assert.ok(!/innerHTML|insertAdjacentHTML|outerHTML/.test(body), 'h() must not parse HTML strings');
});

test('every element id a tool looks up with getElementById is defined by that tool (its form, its result markup or the page shell)', () => {
    const offenders = [];
    const toolFiles = scriptList().filter(rel => rel.startsWith('js/tools/'));
    for (const rel of toolFiles) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        const renders = Object.values(routes).map(r => r[0]).filter(fn => src.includes(`function ${fn.name}(`));
        if (!renders.length) continue;                       // helper files (steps, chart) are checked with their tool below
        const family = toolFiles.filter(f => f.startsWith(rel.replace(/\.js$/, '')) || f === rel).map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
        const rendered = renders.map(fn => fn()).join('\n');
        const prefixes = [...family.matchAll(/showDistributionParams\(\s*['"](\w+)['"]/g)].map(m => m[1]);
        const ids = new Set([...src.matchAll(/getElementById\(\s*['"]([\w-]+)['"]\s*\)/g)].map(m => m[1]));
        for (const id of ids) {
            const defined = rendered.includes(`id="${id}"`) || new RegExp(`id\\s*[=:]\\s*\\\\?["'\`]${id}\\\\?["'\`]`).test(family) || html.includes(`id="${id}"`) || prefixes.some(p => id.startsWith(p));
            if (!defined) offenders.push(`${rel}: #${id}`);
        }
    }
    assert.deepEqual(offenders, [], 'getElementById for an id that nothing creates');
});

test('error messages are never assigned with innerText: they go through setHtml(escapeHtml(...)) or textContent', () => {
    const offenders = [];
    for (const rel of scriptList()) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        if (/\.innerText\s*=\s*\w+\.message\b/.test(src)) offenders.push(rel);
    }
    assert.deepEqual(offenders, []);
});

test('no blocking alert() outside notifyUser (messages go through the toast)', () => {
    const offenders = [];
    for (const rel of scriptList()) {
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\/\/[^\n]*/g, '');
        const hits = (src.match(/\balert\(/g) || []).length;
        if (hits > (rel === 'js/core/charts.js' ? 1 : 0)) offenders.push(rel);
    }
    assert.deepEqual(offenders, []);
});
