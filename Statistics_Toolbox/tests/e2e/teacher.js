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
  await p.click('.teacher-tab:nth-of-type(2)'); await p.waitForTimeout(100);
  expect(/class overview/.test(await p.textContent('#tutorCard-teacher h4')), '"About this tab" should play the tab overview');
  expect(await p.locator('#tutorCard-teacher').count() === 1, 'there must be a single class card');

  await b.close();
  if (errs.length) { console.error('teacher e2e FAILED\n' + errs.join('\n')); process.exit(1); }
  console.log('teacher e2e passed: 6 tabs, ' + sweep.topics + ' topics, plays to the end, uses the typed numbers');
})();
