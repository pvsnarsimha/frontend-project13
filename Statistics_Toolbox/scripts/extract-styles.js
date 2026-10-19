#!/usr/bin/env node
// Moves static inline styles out of the tool files and into css/tool-panels.css.
//
//   node scripts/extract-styles.js            rewrite js/tools/**/*.js (static style="…" -> class="s-xxxxxx") and update the CSS
//   node scripts/extract-styles.js --check    change nothing; exit 1 if a file still has a convertible inline style, a class has
//                                             no rule, or a rule is unused  (the test suite runs the same check)
//
// What it converts: a style="…" attribute whose value is plain CSS, or plain CSS around one ${cond ? 'css' : 'css'} (it becomes
// class="${cond ? 's-a' : 's-b'}"). Quotes other than 'Font Name' pairs, url(), concatenation and display:none are left alone.
// What it leaves inline: styles computed at run time from data (a colour variable, say) and display:none (scripts toggle those).
//
// Faithfulness to the old inline behaviour:
//  * css/statlab.css used to re-theme result panels by matching substrings of the style attribute (color: #1a5490, tr[style*=…]).
//    A class has no such attribute, so the same mapping is applied here when the rule is written: it becomes a
//    ".calculation-steps.rich .s-xxxxxx" override rule with the --tp-* tokens (see THEME_RULES, a copy of statlab.css lines
//    "Result-panel palette"). Dynamic styles that still use these colours would escape the re-theme, so statlab.css keeps its
//    substring rules for them.
//  * js/ui/solution.js tagGeneratedLayout() adds .gen-grid / .gen-flex / .gen-pad / .gen-sized / .gen-big at run time to elements
//    with an inline style. A class-only element has none, so the same classes are added here (LAYOUT_TESTS is a copy of that
//    function). Interface forms (html: "…" strings in buildInterface configs) never got them and do not get them now.
//
// The CSS file keeps two kinds of rules: s-xxxxxx rules (owned by this script: kept while a tool uses the class, dropped when none
// does, added when a new style is extracted) and everything else (tp-* state colours, comments), kept as written.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const CSS_PATH = path.join(ROOT, 'css', 'tool-panels.css');
const SCOPE = '#interfaceRoot';
const OVERRIDE_SCOPE = '#interfaceRoot .calculation-steps.rich';

const PALETTE = ['1a5490', 'd4380d', 'e65100', '2e7d32', '6a1b9a'];
const PALETTE_NO_BLUE = PALETTE.slice(1);
const hexes = list => `(?:${list.join('|')})`;
const HEAD = 'var(--tp-head)', HEAD_SOFT = 'var(--tp-head-soft)';

// [specificity (attribute/class count, tag count), tag filter, regex over the raw style text, declarations]. Copied from statlab.css;
// all are !important there except the border-color of the tint rule.
const THEME_RULES = [
    [[3, 0], null, new RegExp(`linear-gradient\\(135deg, #${hexes(PALETTE)}`), [['background', 'var(--tp-banner)'], ['box-shadow', 'var(--tp-banner-shadow)']]],
    [[3, 0], null, new RegExp(`color: #${hexes(PALETTE)}`), [['color', 'var(--tp-accent)']]],
    [[3, 1], ['h3'], new RegExp(`background: #${hexes(PALETTE)}`), [['background', HEAD_SOFT], ['color', '#fff']]],
    [[3, 0], null, new RegExp(`solid #${hexes(PALETTE)}`), [['border-color', 'var(--tp-accent)']]],
    [[3, 1], ['div'], new RegExp(`background: #${hexes(PALETTE_NO_BLUE)}`), [['background', HEAD_SOFT], ['color', '#fff']]],
    [[3, 0], null, /background: #f8f9fa/, [['background', 'var(--tp-card)'], ['border', '1px solid var(--line)']]],
    [[3, 0], null, /background: #(?:f3e5f5|fff3e0|e8f5e9)/, [['background', 'var(--tp-tint)'], ['border-color', 'var(--tp-tint-line)', false]]],
    [[3, 0], null, /linear-gradient\(135deg, #e8f4f8/, [['background', 'var(--tp-tint)'], ['border', '1px solid var(--tp-tint-line)']]],
    [[3, 1], ['tr', 'thead'], new RegExp(`#${hexes(PALETTE)}`), [['background', HEAD], ['color', '#fff']]],
    [[3, 1], ['th'], new RegExp(`background: #${hexes(PALETTE)}`), [['background', HEAD], ['color', '#fff']]],
    [[3, 1], ['td'], new RegExp(`background: #${hexes(PALETTE_NO_BLUE)}`), [['background', HEAD], ['color', '#fff']]]
];
// statlab.css: tr[style*=hex] th, thead[style*=hex] th { color: #fff; background: transparent }
const HEAD_ROW_TAGS = ['tr', 'thead'];
const HEAD_ROW_TEST = new RegExp(`#${hexes(PALETTE)}`);

const LAYOUT_TESTS = [   // copy of tagGeneratedLayout() in js/ui/solution.js
    [/grid-template-columns/, 'gen-grid'],
    [/repeat\(\s*[3-9]\b/, 'gen-grid-many', /grid-template-columns/],
    [/display:\s*flex/, 'gen-flex'],
    [/(?:^|;)\s*padding:\s*2\d/, 'gen-pad'],
    [/(?:^|;)\s*(?:min-)?width:/, 'gen-sized'],
    [/font-size:\s*[34]\d/, 'gen-big']
];

function toolFiles(dir = path.join(ROOT, 'js', 'tools')) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? toolFiles(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []);
}

function declarations(style) {
    return style.split(';').map(d => d.trim()).filter(Boolean).map(d => { const i = d.indexOf(':'); return [d.slice(0, i).trim(), d.slice(i + 1).trim()]; });
}

const outranks = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i]; return false; };

function themeOverrides(tag, style) {
    const best = {};   // property -> { spec, order, value, important }
    THEME_RULES.forEach(([spec, tags, re, decls], order) => {
        if ((tags && !tags.includes(tag)) || !re.test(style)) return;
        for (const [prop, value, important = true] of decls) {
            const cur = best[prop];
            // cascade order: !important beats normal, then specificity, then source order
            const rank = [important ? 1 : 0, spec[0], spec[1], order];
            if (!cur || outranks(rank, cur.rank)) best[prop] = { rank, value, important };
        }
    });
    return best;
}

// The CSS for one (tag, style) pair. Returns { name, css }.
function buildRule(tag, style, raw = style) {   // raw: the attribute text as written (the old CSS matched substrings of it)
    const decls = declarations(style);
    const key = tag + '|' + decls.map(([p, v]) => `${p}:${v}`).join(';');
    const name = 's-' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 6);
    const out = [`${SCOPE} .${name} { ${decls.map(([p, v]) => `${p}: ${v};`).join(' ')} }`];
    const over = themeOverrides(tag, raw);
    const hasBorder = decls.some(([p]) => /^border(-(top|right|bottom|left))?(-(color|width|style))?$/.test(p));   // not border-radius
    const parts = Object.entries(over).filter(([prop, o]) => o.important || !hasBorder).map(([prop, o]) => `${prop}: ${o.value}${o.important ? ' !important' : ''};`);
    if (parts.length) out.push(`${OVERRIDE_SCOPE} .${name} { ${parts.join(' ')} }`);
    if (HEAD_ROW_TAGS.includes(tag) && HEAD_ROW_TEST.test(raw)) out.push(`${OVERRIDE_SCOPE} .${name} th { color: #fff !important; background: transparent !important; }`);
    return { name, css: out };
}

const TAG_RE = /<([a-zA-Z][a-zA-Z0-9]*)((?:\s[^<>]*)?)>/g;
const STYLE_RE = /\sstyle\s*=\s*(\\?)(["'])([\s\S]*?)\1\2/;
const CLASS_RE = /\sclass\s*=\s*(\\?)(["'])([\s\S]*?)\1\2/;
const balanced = s => (s.match(/\$\{/g) || []).length === (s.match(/\}/g) || []).length;
// Plain CSS: no quotes (except balanced 'Font Name' pairs), no concatenation, no url(), nothing a script toggles.
const withoutFontNames = value => value.replace(/font-family:\s*[^;]*/g, m => m.replace(/'[A-Za-z0-9 _-]+'/g, ''));
const staticCss = value => !/[`'"\\+]|\$\{|url\(|display:\s*none|visibility/.test(withoutFontNames(value)) && /:/.test(value);
const TERNARY = /^\s*([^?'"`{}]+?)\s*\?\s*'([^'`\\$]*)'\s*:\s*'([^'`\\$]*)'\s*$/;
// A style that is plain CSS, or plain CSS around one ${cond ? 'css' : 'css'} (a template literal only).
// Returns null (leave it inline) or { cond, variants: [styleIfTrue, styleIfFalse] }  (cond null for a static style).
function analyzeStyle(value) {
    if (staticCss(value)) return { cond: null, variants: [value] };
    const m = /^([^$]*)\$\{([^{}]*)\}([^$]*)$/.exec(value);
    if (!m || /display:\s*none|visibility|url\(|[`"\\+]/.test(m[1] + m[3])) return null;
    const t = TERNARY.exec(m[2]);
    if (!t) return null;
    const variants = [t[2], t[3]].map(v => m[1] + v + m[3]);
    return variants.every(staticCss) ? { cond: t[1].trim(), variants } : null;
}

// Is the tag inside an interface config string (html: "…")? Those never received the run-time layout classes.
function inInterfaceHtml(src, pos) {
    const lineStart = src.lastIndexOf('\n', pos) + 1;
    return /\bhtml:\s*"/.test(src.slice(lineStart, pos)) || /\bhtml:\s*$/.test(src.slice(lineStart, pos));
}

function convertSource(src, rules) {
    let converted = 0;
    const out = src.replace(TAG_RE, (whole, tag, inner, offset) => {
        const sm = STYLE_RE.exec(inner);
        if (!sm || !balanced(inner.replace(sm[0], ''))) return whole;
        if (STYLE_RE.test(inner.slice(sm.index + sm[0].length))) return whole;
        const plan = analyzeStyle(sm[3]);
        if (!plan) return whole;
        const t = tag.toLowerCase();
        const interfaceHtml = inInterfaceHtml(src, offset);
        const classLists = plan.variants.map(raw => {
            const style = raw.replace(/\s+/g, ' ').trim();
            if (!style) return '';
            const { name, css } = buildRule(t, style, raw);
            if (rules.has(name) && rules.get(name).join('\n') !== css.join('\n')) throw new Error(`class ${name} collides: ${css[0]}`);
            rules.set(name, css);
            const classes = [name];
            if (!interfaceHtml) for (const [re, cls, also] of LAYOUT_TESTS) if (re.test(style) && (!also || also.test(style))) classes.push(cls);
            return classes.join(' ');
        });
        const classText = plan.cond === null ? classLists[0] : `\${${plan.cond} ? '${classLists[0]}' : '${classLists[1]}'}`;
        let rest = inner.replace(STYLE_RE, '');
        const cm = CLASS_RE.exec(rest);
        if (cm) rest = rest.slice(0, cm.index) + ` class=${cm[1]}${cm[2]}${(cm[3].trim() + ' ' + classText).trim()}${cm[1]}${cm[2]}` + rest.slice(cm.index + cm[0].length);
        else rest = ` class=${sm[1]}${sm[2]}${classText}${sm[1]}${sm[2]}` + rest;
        converted++;
        return `<${tag}${rest}>`;
    });
    return { out, converted };
}

// ---- CSS file --------------------------------------------------------------------------------------------------------------
function parseCss(text) {
    const lines = text.split(/\r?\n/);
    const owned = new Map(), other = [];
    for (const line of lines) {
        const m = /^#interfaceRoot(?: \.calculation-steps\.rich)? \.(s-[0-9a-f]{6})\b/.exec(line);
        if (m) { if (!owned.has(m[1])) owned.set(m[1], []); owned.get(m[1]).push(line); }
        else other.push(line);
    }
    return { owned, other };
}

function usedClasses(files) {
    const used = new Set();
    for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/\b(s-[0-9a-f]{6})\b/g)) used.add(m[1]);
    return used;
}

// Static inline styles that could be classes but are not (what --check reports).
function leftoverInline(files) {
    const left = [];
    for (const f of files) {
        const src = fs.readFileSync(f, 'utf8');
        for (const m of src.matchAll(TAG_RE)) {
            const sm = STYLE_RE.exec(m[2]);
            if (sm && balanced(m[2].replace(sm[0], '')) && analyzeStyle(sm[3])) left.push(`${path.relative(ROOT, f)}: <${m[1]} style="${sm[3].slice(0, 50)}">`);
        }
    }
    return left;
}

function check(files = toolFiles()) {
    const { owned } = parseCss(fs.readFileSync(CSS_PATH, 'utf8'));
    const used = usedClasses(files);
    return {
        inline: leftoverInline(files),
        missingRule: [...used].filter(c => !owned.has(c)),
        orphanRule: [...owned.keys()].filter(c => !used.has(c))
    };
}

function run() {
    const files = toolFiles();
    const rules = new Map();
    let total = 0;
    for (const f of files) {
        const { out, converted } = convertSource(fs.readFileSync(f, 'utf8'), rules);
        if (converted) { fs.writeFileSync(f, out); total += converted; }
    }
    const { owned, other } = parseCss(fs.readFileSync(CSS_PATH, 'utf8'));
    for (const [name, css] of rules) if (owned.has(name) && owned.get(name).join('\n') !== css.join('\n')) throw new Error(`generated class ${name} collides with an existing rule`);
    const used = usedClasses(files);
    const names = [...new Set([...owned.keys(), ...rules.keys()])].filter(n => used.has(n)).sort();
    const body = names.flatMap(n => rules.has(n) ? rules.get(n) : owned.get(n));
    // keep the header comment, then the generated rules, then the hand-written rules
    const headerEnd = other[0].startsWith('/*') ? other.findIndex(l => l.includes('*/')) + 1 : 0;
    const rest = other.slice(headerEnd).filter((l, i, a) => !(l === '' && (i === 0 || a[i - 1] === '')));
    fs.writeFileSync(CSS_PATH, [...other.slice(0, headerEnd), ...body, ...rest].join('\n').replace(/\n*$/, '\n'));
    console.log(`converted ${total} inline styles; ${names.length} s-* rules (${rules.size} generated this run)`);
}

module.exports = { toolFiles, check, convertSource, buildRule, themeOverrides };

if (require.main === module) {
    if (process.argv.includes('--check')) {
        const r = check();
        for (const [k, v] of Object.entries(r)) if (v.length) console.error(`${k}: ${v.slice(0, 10).join('; ')}${v.length > 10 ? ` … (+${v.length - 10})` : ''}`);
        process.exit(Object.values(r).some(v => v.length) ? 1 : 0);
    }
    run();
}
