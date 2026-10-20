#!/usr/bin/env node
// Prints what the page downloads and fails when it grows past the budget (CI runs this; `npm run size` locally).
// "Raw" is the bytes on disk (what file:// loads); "gzip" is what a normal web server sends, since every host compresses text.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const ROOT = path.join(__dirname, '..');
const BUDGET = { scriptRawKB: 1700, scriptGzipKB: 420 };       // the real figures are in the README; raise these on purpose, never by accident

const html = fs.readFileSync(path.join(ROOT, 'Statistics.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
const size = files => files.reduce((t, f) => {
    const buf = fs.readFileSync(path.join(ROOT, f));
    return { raw: t.raw + buf.length, gzip: t.gzip + zlib.gzipSync(buf, { level: 9 }).length };
}, { raw: 0, gzip: 0 });
const kb = n => (n / 1024).toFixed(0) + ' KB';

const js = size(scripts), css = size(styles), chart = size(['vendor/chart.umd.js']);
console.log(`scripts (${scripts.length} files)   raw ${kb(js.raw)}   gzip ${kb(js.gzip)}`);
console.log(`stylesheets (${styles.length})        raw ${kb(css.raw)}   gzip ${kb(css.gzip)}`);
console.log(`Chart.js (loaded on first chart)  raw ${kb(chart.raw)}   gzip ${kb(chart.gzip)}`);
const over = [];
if (js.raw / 1024 > BUDGET.scriptRawKB) over.push(`scripts are ${kb(js.raw)} raw, budget ${BUDGET.scriptRawKB} KB`);
if (js.gzip / 1024 > BUDGET.scriptGzipKB) over.push(`scripts are ${kb(js.gzip)} gzipped, budget ${BUDGET.scriptGzipKB} KB`);
if (over.length) { console.error('OVER BUDGET: ' + over.join('; ')); process.exit(1); }
console.log('within budget');
