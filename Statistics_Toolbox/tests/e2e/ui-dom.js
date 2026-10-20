// Browser test for DOM-level UI helpers: buildAnswer / buildSolution, the sanitiser's handling of `ping`,
// and live re-rendering of the violin plot when the bandwidth slider moves.
// Usage: node tests/e2e/ui-dom.js   (set CHROMIUM=/path/to/chromium to use an existing browser)
const path = require('path');
const launcher = require('./launch');      // BROWSER=chromium|firefox|webkit
(async () => {
  const file = process.argv[2] || path.resolve(__dirname, '..', '..', process.env.STATLAB_ROOT || '.', 'Statistics.html');
  const b = await launcher.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('file://' + file);

  // buildAnswer: "|" splits into .kpi tiles, the screen-reader prefix is added, chips-on clips the raw text
  const ans = await p.evaluate(() => {
    const host = document.createElement('div');
    host.innerHTML = '<span id="__ans">mean = 4 | sd = 2 | Reject H0</span>';
    document.body.appendChild(host);
    const val = host.firstChild;
    StatLabUI.buildAnswer(val);
    const kpis = [...host.querySelectorAll('.kpi-row .kpi')];
    const out = {
      tiles: kpis.length,
      first: kpis[0] && kpis[0].querySelector('small').textContent + '=' + kpis[0].querySelector('b').textContent,
      verdict: kpis[2] && kpis[2].classList.contains('verdict') && kpis[2].classList.contains('sig'),
      prefix: val.querySelector(':scope > .sr-only')?.textContent,
      chips: val.classList.contains('chips-on'),
      rowHidden: host.querySelector('.kpi-row').getAttribute('aria-hidden')
    };
    val.textContent = 'single answer';
    StatLabUI.buildAnswer(val);
    out.singleRow = host.querySelectorAll('.kpi-row').length;
    out.singleChips = val.classList.contains('chips-on');
    out.prefixOnce = val.querySelectorAll('.answer-prefix').length;
    host.remove();
    return out;
  });
  const exp = (c, m) => { if (!c) errs.push(m); };
  exp(ans.tiles === 3, 'buildAnswer: expected 3 .kpi tiles, got ' + ans.tiles);
  exp(ans.first === 'mean=4', 'buildAnswer: first tile was ' + ans.first);
  exp(ans.verdict, 'buildAnswer: "Reject H0" should be a significant verdict tile');
  exp(ans.prefix === 'Answer: ', 'buildAnswer: sr-only "Answer: " prefix missing');
  exp(ans.chips, 'buildAnswer: chips-on class missing on a piped answer');
  exp(ans.rowHidden === 'true', 'buildAnswer: the kpi row must be aria-hidden');
  exp(ans.singleRow === 0 && !ans.singleChips, 'buildAnswer: a non-piped answer must not build tiles or keep chips-on');
  exp(ans.prefixOnce === 1, 'buildAnswer: the Answer prefix must be added only once');

  // buildSolution: plain text becomes a structured .solution block next to the source element
  const sol = await p.evaluate(() => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = '<div class="result-label">MEAN RESULT</div><div id="__st" class="calculation-steps"></div>';
    document.body.appendChild(card);
    const st = card.querySelector('#__st');
    st.textContent = 'ARITHMETIC MEAN\nStep 1: Add\n   2 + 4 = 6\nStep 2: Divide\n   6 / 2 = 3\n✅ Mean = 3';
    StatLabUI.buildSolution(st);
    const box = card.querySelector(':scope > .solution');
    const out = { has: !!box, steps: box ? box.querySelectorAll('.sub, .step, .sol-step').length : 0, text: box ? box.textContent : '' };
    card.remove();
    return out;
  });
  exp(sol.has, 'buildSolution: no .solution block was created');
  exp(/Add/.test(sol.text) && /Divide/.test(sol.text) && /Final results/.test(sol.text) && /Mean/.test(sol.text), 'buildSolution: steps/final missing from output: ' + sol.text.slice(0, 120));

  // Sanitiser: `ping` is stripped when it carries a script URL, harmless values survive
  const san = await p.evaluate(() => {
    const box = document.createElement('div');
    document.body.appendChild(box);
    setHtml(box, '<a href="#" ping="javascript:alert(1)">a</a><a href="#" ping="https://example.com/x">b</a>');
    const r = [...box.querySelectorAll('a')].map(a => a.hasAttribute('ping'));
    box.remove();
    return r;
  });
  exp(san[0] === false, 'setHtml kept a javascript: ping attribute');
  exp(san[1] === true, 'setHtml removed a harmless https ping attribute');

  // h(): builds elements without HTML parsing; text stays literal, handlers and script URLs are refused
  const built = await p.evaluate(() => {
    window.__xss = 0;
    const el = h('div', { class: 'a b', 'data-x': 1, onclick: 'window.__xss=1', style: 'color:red', id: false },
      'x < y & <img src=x onerror="window.__xss=2">', 7, null, false, [h('a', { href: 'javascript:window.__xss=3' }, 'bad'), h('a', { href: 'https://example.com' }, 'ok')]);
    document.body.appendChild(el);
    const out = {
      html: el.innerHTML, cls: el.className, dx: el.getAttribute('data-x'), onclick: el.hasAttribute('onclick'), style: el.hasAttribute('style'),
      id: el.hasAttribute('id'), imgs: el.querySelectorAll('img').length, hrefs: [...el.querySelectorAll('a')].map(a => a.getAttribute('href')), text: el.textContent
    };
    el.querySelectorAll('a')[0].click(); el.click(); out.xss = window.__xss; el.remove();
    return out;
  });
  exp(built.cls === 'a b' && built.dx === '1', 'h(): class/data attributes not set: ' + JSON.stringify(built));
  exp(!built.onclick && !built.style && !built.id, 'h(): on*/style/false attributes must be skipped');
  exp(built.imgs === 0 && /<img/.test(built.text.replace(/\s/g, ' ')) , 'h(): markup in a string child must stay literal text');
  exp(built.text.includes('x < y &') && built.text.includes('7'), 'h(): text/number children missing');
  exp(built.hrefs[0] === null && built.hrefs[1] === 'https://example.com', 'h(): javascript: href must be dropped, https kept: ' + JSON.stringify(built.hrefs));
  exp(built.xss === 0, 'h(): a payload executed: ' + built.xss);

  // Violin: moving the slider after a plot exists redraws it with the new bandwidth
  await p.click('.tab[data-tab="manipulation"]').catch(() => {});
  const btn = await p.$('.stat-btn[data-stat="violin"]');
  if (!btn) errs.push('violin tool button not found');
  else {
    await btn.click();
    await p.click('#interfaceRoot .sample-btn');
    await p.click('#violinComputeBtn');
    await p.waitForTimeout(400);
    const before = await p.textContent('#violinStepsDisplay');
    await p.$eval('#violinBandwidth', el => { el.value = el.max; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await p.waitForTimeout(700);
    const after = await p.textContent('#violinStepsDisplay');
    exp(before !== after, 'violin: slider change did not re-render the result');
  }

  console.log(errs.length ? errs.join('\n') : 'NO ERRORS');
  if (errs.length) process.exitCode = 1;
  await b.close();
})();
