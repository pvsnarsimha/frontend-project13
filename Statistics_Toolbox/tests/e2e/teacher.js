// The AI teacher class in a real browser: every tab opens its overview class, every topic opens its own class (103 of them), the class uses the
// numbers typed in the tool, plays all its scenes (speech or caption timing), draws a non-empty classroom, and survives switching tools.
// Usage: node tests/e2e/teacher.js   (set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const launcher = require('./launch');
(async () => {
  const root = path.resolve(__dirname, '..', '..', process.env.STATLAB_ROOT || '.');
  const b = await launcher.launch();
  const p = await (await b.newContext({ viewport: { width: 1000, height: 900 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const expect = (c, m) => { if (!c) errs.push(m); };
  await p.addInitScript(() => { window.STATLAB_TUTOR_SPEED = 8; });
  await p.goto('file://' + path.join(root, 'Statistics.html')); await p.waitForTimeout(300);

  // a topic class under the formula card, before any calculation
  expect(await p.locator('#teacherArea #tutorCard-teacher canvas').count() === 1, 'no AI teacher class on the first tool');
  expect(/AI Teacher: Arithmetic Mean/.test(await p.textContent('#tutorCard-teacher h4')), 'class title should name the topic');

  // the lesson uses the numbers the student typed
  await p.fill('#interfaceRoot textarea', '12, 45.5, 78, 99, 23, 51'); await p.waitForTimeout(1000);
  await p.click('#tutorCard-teacher .tutor-dot:nth-child(5)'); await p.waitForTimeout(100);
  expect(/6 values, from 12 up to 99/.test(await p.textContent('#tutorCard-teacher .tutor-line')), 'the class should use the typed numbers');
  await p.click('#tutorCard-teacher .tutor-play'); await p.waitForTimeout(150);

  // plays through every scene to the end
  await p.click('#tutorCard-teacher .tutor-replay');
  let done = false; for (let i = 0; i < 160 && !done; i++) { done = await p.evaluate(() => tutorCards.get('teacher').state.finished); if (!done) await p.waitForTimeout(150); }
  expect(done, 'the class did not play to the end');

  // the picture is a classroom, not a blank canvas (wall, board and teacher colours are all present)
  const px = await p.evaluate(() => { const c = document.querySelector('#tutorCard-teacher canvas'), x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; let green = 0, skin = 0, cream = 0; for (let i = 0; i < d.length; i += 40) { const [r, g, bl] = [d[i], d[i + 1], d[i + 2]]; if (g > r + 15 && g > bl && r < 60) green++; if (r > 200 && g > 160 && g < 200 && bl > 120 && bl < 170) skin++; if (r > 220 && g > 215 && bl > 190) cream++; } return { green, skin, cream }; });
  expect(px.green > 200 && px.skin > 5 && px.cream > 200, 'classroom looks empty: ' + JSON.stringify(px));

  // a class that is replaced gives its canvas memory back (WebKit keeps removed canvases' pixel buffers until GC, which stalled CI after ~900 tool switches)
  const released = await p.evaluate(() => { const old = document.querySelector('#tutorCard-teacher canvas'); document.querySelector('.stat-btn[data-stat="median"]') && document.querySelector('.tab[data-tab="descriptive"]').click(); document.querySelector('.stat-btn[data-stat="range"]').click(); return old.width === 0 && old.height === 0; });
  expect(released, 'the replaced class card should release its canvas buffer');

  // every tab opens an overview class; every topic opens its own class, whose scenes all draw
  const sweep = await p.evaluate(() => {
    const out = { tabs: 0, topics: 0, bad: [] };
    document.querySelectorAll('.tab').forEach(t => {
      t.click(); out.tabs++;
      if (!/class overview/.test(document.querySelector('#tutorCard-teacher h4').textContent)) out.bad.push('tab ' + t.dataset.tab);
      document.querySelectorAll('.action-sidebar[data-module="' + t.dataset.tab + '"] .stat-btn[data-stat]').forEach(btn => {
        btn.click(); out.topics++;
        const c = tutorCards.get('teacher'), n = document.querySelectorAll('#tutorCard-teacher .tutor-dot').length, txt = document.querySelector('#tutorCard-teacher h4').textContent + document.querySelector('#tutorCard-teacher .tutor-line').textContent;
        if (!c || n < 6 || /undefined|NaN|\[object/.test(txt) || !/AI Teacher:/.test(txt)) out.bad.push(btn.dataset.stat);
        else for (let i = 0; i < n; i++) c.seek(i, 1);
      });
    });
    return out;
  });
  expect(sweep.tabs === 6, 'expected 6 tabs, saw ' + sweep.tabs);
  expect(sweep.topics >= 100, 'expected 100+ topics, saw ' + sweep.topics);
  expect(sweep.bad.length === 0, 'topics without a proper class: ' + sweep.bad.join(', '));

  // "About this tab" and "This topic" buttons switch the class; one class card at a time
  await p.click('.teacher-tab:nth-of-type(3)'); await p.waitForTimeout(100);
  expect(/class overview/.test(await p.textContent('#tutorCard-teacher h4')), '"About this tab" should play the tab overview');
  expect(await p.locator('#tutorCard-teacher').count() === 1, 'there must be a single class card');

  // "Solve my problem": on EVERY tool, with its sample data, the teacher reads the student's inputs and the tool's own answer and working
  await p.addInitScript(() => {});
  const solved = { n: 0, bad: [], thin: [], titles: 0 };
  p.on('dialog', d => d.dismiss());
  for (const tab of await p.$$eval('.tab', t => t.map(x => x.dataset.tab))) {
    await p.click('.tab[data-tab="' + tab + '"]');
    for (const stat of await p.$$eval('#sidebar-' + tab + ' .stat-btn[data-stat]', bs => bs.map(x => x.dataset.stat))) {
      await p.click('#sidebar-' + tab + ' .stat-btn[data-stat="' + stat + '"]');
      const sample = await p.$('#interfaceRoot .sample-btn'), go = await p.$('#interfaceRoot .primary-btn');
      if (!sample || !go) continue;
      await sample.click(); await go.click({ timeout: 8000 }); await p.waitForTimeout(550);       // the teacher remounts to solve this problem after Calculate
      const r = await p.evaluate(() => {
        const c = tutorCards.get('teacher'), h = document.querySelector('#tutorCard-teacher h4').textContent, n = document.querySelectorAll('#tutorCard-teacher .tutor-dot').length;
        const lines = []; for (let i = 0; i < n; i++) { c.seek(i, 1); lines.push(document.querySelector('#tutorCard-teacher .tutor-line').textContent); }
        return { h, n, lines };
      });
      solved.n++;
      const all = r.lines.join(' ');
      if (!/Solving your problem/.test(r.h)) solved.bad.push(stat + ': not in solve mode (' + r.h + ')');
      else if (/undefined|NaN|\[object|Infinity/.test(all)) solved.bad.push(stat + ': bad text');
      else if (r.n < 5) solved.thin.push(stat + ':' + r.n);
      else if (!/answer is:/i.test(all)) solved.bad.push(stat + ': no answer scene');
    }
  }
  expect(solved.n >= 90, 'solve mode ran on too few tools: ' + solved.n);
  expect(solved.bad.length === 0, 'solve mode problems: ' + solved.bad.join('; '));
  expect(solved.thin.length <= 5, 'solve lessons with fewer than 5 scenes: ' + solved.thin.join(', '));

  // the "Solve my problem" button works with no answer yet (it presses Calculate itself) and starts the class
  await p.click('.tab[data-tab="descriptive"]'); await p.click('#sidebar-descriptive .stat-btn[data-stat="mean"]');
  await p.fill('#interfaceRoot textarea', '3, 5, 7, 9'); await p.click('.teacher-tab:nth-of-type(2)'); await p.waitForTimeout(1000);
  expect(/Solving your problem/.test(await p.textContent('#tutorCard-teacher h4')), 'button should open the solve class');
  expect(await p.evaluate(() => tutorCards.get('teacher').state.playing), 'the solve class should start playing');
  expect(/mean is 6|answer is: 6/i.test(await p.evaluate(() => { const c = tutorCards.get('teacher'); c.seek(5, 1); return document.querySelector('#tutorCard-teacher .tutor-line').textContent; })), 'the answer scene should say 6');
  // bad input: the teacher explains what is wrong instead of staying silent
  await p.fill('#interfaceRoot textarea', ''); await p.click('#interfaceRoot .primary-btn'); await p.waitForTimeout(700);
  expect(/Oops|Oh no/.test(await p.evaluate(() => { const c = tutorCards.get('teacher'); c.seek(0, 1); return document.querySelector('#tutorCard-teacher .tutor-line').textContent; })), 'empty input should give the "oh no" class');

  await b.close();
  if (errs.length) { console.error('teacher e2e FAILED\n' + errs.join('\n')); process.exit(1); }
  console.log('teacher e2e passed: 6 tabs, ' + sweep.topics + ' topics, plays to the end, uses the typed numbers');
})();
