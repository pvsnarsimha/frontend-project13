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
