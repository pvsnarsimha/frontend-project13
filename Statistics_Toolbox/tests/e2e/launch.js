// Starts the browser the e2e tests run in. BROWSER=chromium (default) | firefox | webkit; CHROMIUM=/path/to/chrome uses an installed Chromium.
const playwright = require('playwright');
const name = process.env.BROWSER || 'chromium';
if (!playwright[name]) throw new Error(`Unknown BROWSER "${name}" (use chromium, firefox or webkit)`);
module.exports = {
    browserName: name,
    launch: () => playwright[name].launch(name === 'chromium' && process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
};
