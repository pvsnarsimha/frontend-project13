// The feedback loop in a real browser: the "Was this explanation clear?" strip saves to the device and exports; the trial page records a
// session and summarises a class from session files. (The two class files below are test fixtures, not real students.)
// Usage: node tests/e2e/feedback.js   (set CHROMIUM=/path/to/chromium to use an existing browser)
const fs = require('fs');
const os = require('os');
const path = require('path');
const launcher = require('./launch');
(async () => {
  const root = path.resolve(__dirname, '..', '..', process.env.STATLAB_ROOT || '.');
  const b = await launcher.launch();
  const ctx = await b.newContext({ acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  const expect = (c, m) => { if (!c) errs.push(m); };

  // 1. the strip under a result
  await p.goto('file://' + path.join(root, 'Statistics.html') + '#tool=onesamplet'); await p.reload(); await p.waitForTimeout(300);
  await p.click('button:has-text("Try sample data")'); await p.click('#oneSampleTComputeBtn'); await p.waitForTimeout(800);
  expect(await p.locator('#oneSampleTResultArea .fb-strip').count() === 1, 'feedback strip missing under the result');
  await p.click('#oneSampleTResultArea .fb-btn:has-text("No")');
  await p.fill('#oneSampleTResultArea .fb-detail textarea', 'I did not understand the critical value');
  const href = await p.getAttribute('#oneSampleTResultArea .fb-link[href^="https://github.com"]', 'href');
  expect(href && /issues\/new/.test(href) && decodeURIComponent(href).includes('critical value'), 'the pre-filled issue link is missing the comment');
  await p.click('#oneSampleTResultArea .fb-save'); await p.waitForTimeout(200);
  const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('statlab.feedback.v1') || '[]'));
  expect(stored.length === 1 && stored[0].rating === 'unclear' && /critical value/.test(stored[0].comment) && /t-test/i.test(stored[0].tool), 'feedback was not saved: ' + JSON.stringify(stored));
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#oneSampleTResultArea .fb-dl')]);
  expect(dl.suggestedFilename() === 'statlab-feedback.json', 'download name was ' + dl.suggestedFilename());

  // 2. the trial page: fill a session, download it
  const t = await ctx.newPage(); t.on('pageerror', e => errs.push('TRIAL PAGEERROR ' + e.message));
  await t.goto('file://' + path.join(root, 'trial.html'));
  expect(await t.locator('#taskList .card').count() === 5, 'trial page should show 5 questions');
  await t.fill('#student', 'S9');
  await t.locator('#taskList .card').first().locator('select').first().selectOption('yes');
  await t.locator('#taskList .card').first().locator('select').nth(1).selectOption('yes');
  await t.fill('#hardest', 'knowing which button'); await t.selectOption('#wouldUse', 'yes');
  const [sd] = await Promise.all([t.waitForEvent('download'), t.click('#download')]);
  const saved = JSON.parse(fs.readFileSync(await sd.path(), 'utf8'));
  expect(saved.kind === 'statlab-trial' && saved.student === 'S9' && saved.tasks[0].foundTool === 'yes' && saved.overall.wouldUse === 'yes', 'session file content wrong');
  expect(Array.isArray(saved.feedback), 'session should include feedback');

  // 3. the teacher summary from two fixture files
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trial-'));
  const mk = (name, found, matched) => { const f = path.join(dir, name); fs.writeFileSync(f, JSON.stringify({ kind: 'statlab-trial', student: name, tasks: [{ id: 'one-sample-t', title: 'One-sample t', foundTool: found, seconds: 90, matched, notes: found === 'no' ? 'could not find it' : '' }], overall: { wouldUse: 'yes' } })); return f; };
  await t.setInputFiles('#files', [mk('F1', 'yes', 'yes'), mk('F2', 'no', 'no')]); await t.waitForTimeout(500);
  const sum = await t.textContent('#summary');
  expect(/2 students/.test(sum) && /50%/.test(sum) && /could not find it/.test(sum) && /Fix first: one-sample-t/.test(sum), 'class summary wrong: ' + sum.slice(0, 300));
  await b.close();
  if (errs.length) { console.log(errs.join('\n')); console.log('FEEDBACK CHECK FAILED'); process.exit(1); }
  console.log('feedback strip, session download and class summary work');
})();
