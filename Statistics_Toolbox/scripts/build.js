#!/usr/bin/env node
// Optional production build: `npm run build` writes dist/, a minified copy of the site. The source stays build-free (open Statistics.html
// straight from disk); dist/ is what you host when download size matters. Same behaviour, about a third of the script bytes:
//   * every script listed in Statistics.html is concatenated in page order and minified into js/statlab.min.js (classic script, so the
//     shared global scope and the file:// support are unchanged; top-level names are not renamed)
//   * the stylesheets are minified, Which-tool.html and vendor/ are copied
// tests/e2e can run against dist/ with STATLAB_ROOT=dist (CI does).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'css'), { recursive: true });

const html = read('Statistics.html');
const scripts = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
// each file is minified on its own (a syntax error then names the file), then joined with ";\n" so a missing semicolon cannot merge two files
const parts = scripts.map(f => {
    try { return esbuild.transformSync(read(f), { minify: true, target: 'es2019', legalComments: 'none', sourcefile: f }).code.trim(); }
    catch (e) { throw new Error(`${f}: ${e.message}`); }
});
const bundle = '/* StatLab: minified build of js/ (source: github.com/pvsnarsimha/frontend-project13) */\n' + parts.join(';\n') + '\n';
fs.writeFileSync(path.join(OUT, 'js/statlab.min.js'), bundle);

const start = html.indexOf('<!-- scripts:start'), endMarker = '<!-- scripts:end -->', end = html.indexOf(endMarker) + endMarker.length;
let page = html.slice(0, start) + '<script src="js/statlab.min.js"></script>' + html.slice(end);
const styles = [...page.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)"/g)].map(m => m[1]);
styles.forEach(f => fs.writeFileSync(path.join(OUT, f), esbuild.transformSync(read(f), { loader: 'css', minify: true }).code));
fs.writeFileSync(path.join(OUT, 'Statistics.html'), page);
fs.copyFileSync(path.join(ROOT, 'Which-tool.html'), path.join(OUT, 'Which-tool.html'));
// the student-trial page: its own small script (plus the shared feedback helpers) and stylesheet
fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'pages/trial.min.js'), esbuild.transformSync(read('js/core/feedback.js') + ';\n' + read('pages/trial.js'), { minify: true, target: 'es2019' }).code);
fs.writeFileSync(path.join(OUT, 'css/trial.css'), esbuild.transformSync(read('css/trial.css'), { loader: 'css', minify: true }).code);
fs.writeFileSync(path.join(OUT, 'trial.html'), read('trial.html').replace('<script src="js/core/feedback.js"></script>\n', '').replace('pages/trial.js', 'pages/trial.min.js'));
fs.cpSync(path.join(ROOT, 'vendor'), path.join(OUT, 'vendor'), { recursive: true });
['css/guide.css'].forEach(f => { if (fs.existsSync(path.join(ROOT, f)) && !fs.existsSync(path.join(OUT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f)); });

const kb = n => (n / 1024).toFixed(0) + ' KB';
const src = scripts.reduce((t, f) => t + Buffer.byteLength(read(f)), 0);
console.log(`dist/js/statlab.min.js  ${kb(Buffer.byteLength(bundle))} raw (source ${kb(src)}), ${kb(zlib.gzipSync(bundle, { level: 9 }).length)} gzip`);
