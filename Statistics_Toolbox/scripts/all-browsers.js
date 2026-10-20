#!/usr/bin/env node
// Runs the browser suite in every installed Playwright browser (Chromium, Firefox, WebKit) and says plainly which ones were not installed,
// so "tested in all three" is a statement you can check locally and not only in CI:
//   npx playwright install chromium firefox webkit && npm run test:e2e:all-browsers      (add --quick to skip the 7-minute edge-case sweep)
const { spawnSync } = require('child_process');
const playwright = require('playwright');
const fs = require('fs');
const quick = process.argv.includes('--quick');
const results = [];
for (const name of ['chromium', 'firefox', 'webkit']) {
    let installed = false;
    try { installed = fs.existsSync(playwright[name].executablePath()) || (name === 'chromium' && !!process.env.CHROMIUM); } catch (e) { installed = false; }
    if (!installed) { results.push([name, 'NOT INSTALLED (npx playwright install ' + name + ')']); continue; }
    const r = spawnSync('npm', ['run', quick ? 'test:e2e:quick' : 'test:e2e'], { stdio: 'inherit', env: { ...process.env, BROWSER: name }, shell: process.platform === 'win32' });
    results.push([name, r.status === 0 ? 'passed' : 'FAILED']);
}
console.log('\nBrowser results:\n' + results.map(([n, s]) => `  ${n.padEnd(9)} ${s}`).join('\n'));
if (results.some(([, s]) => s === 'FAILED')) process.exit(1);
if (results.some(([, s]) => s.startsWith('NOT INSTALLED'))) console.log('Some browsers were not installed, so they were not tested here.');
