'use strict';
// Loads the browser scripts of Statistics.html into a Node vm context with a permissive DOM stub,
// so the calculation code can be tested without a browser (no dependencies).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function makeElement() {
    const store = {
        style: {}, dataset: {}, children: [], value: '', textContent: '', innerHTML: '', innerText: '',
        classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
        addEventListener() {}, removeEventListener() {}, setAttribute() {}, removeAttribute() {},
        appendChild(c) { return c; }, insertBefore(c) { return c; }, remove() {},
        querySelector() { return makeElement(); }, querySelectorAll() { return []; },
        closest() { return null; }, getContext() { return makeElement(); }
    };
    return new Proxy(store, {
        get(t, k) {
            if (k in t) return t[k];
            if (typeof k === 'symbol') return undefined;
            return () => makeElement();
        },
        set(t, k, v) { t[k] = v; return true; }
    });
}

function scriptList() {
    const html = fs.readFileSync(path.join(ROOT, 'Statistics.html'), 'utf8');
    return [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
}

function loadApp(opts = {}) {
    const skip = opts.skip || [];
    const document = {
        getElementById: () => makeElement(), querySelector: () => makeElement(), querySelectorAll: () => [],
        createElement: () => makeElement(), addEventListener() {}, body: makeElement(), activeElement: makeElement()
    };
    const sandbox = {
        document, console, Math, JSON, Date, Number, String, Array, Object, Set, Map, parseFloat, parseInt, isNaN, isFinite,
        setTimeout, clearTimeout, alert() {}, Chart: Object.assign(function () { return { destroy() {}, update() {} }; }, { register() {}, defaults: {} }),
        MutationObserver: class { observe() {} disconnect() {} },
        getComputedStyle: () => ({ display: 'block' }), navigator: {}
    };
    sandbox.window = sandbox;
    sandbox.addEventListener = () => {};
    sandbox.innerWidth = 1200;
    const ctx = vm.createContext(sandbox);
    for (const rel of scriptList()) {
        if (skip.some(s => rel.includes(s))) continue;
        vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel });
    }
    // top-level let/const are not properties of the context; expose the few we need
    ctx.get = expr => vm.runInContext(expr, ctx);
    return ctx;
}

module.exports = { loadApp, scriptList, ROOT };
