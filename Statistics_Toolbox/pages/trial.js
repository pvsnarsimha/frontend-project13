// Student trial page: records a session (per question: found the tool unaided, time, matched the textbook, notes) and, for the teacher,
// summarises many session files with summarizeTrial() from js/core/feedback.js. Runs only on trial.html.
const TRIAL_TASKS = [
    { id: 'one-sample-t', title: 'One-sample t from summary numbers', question: 'A sample of 25 students has mean 72 and standard deviation 8. Test at the 5% level whether the population mean is 70.', answer: 't = 1.25, p = 0.2236', tool: 'Statistics.html#tool=onesamplet' },
    { id: 'two-proportion', title: 'Two proportions', question: 'Of 120 students taught with method A, 45 passed; of 110 taught with method B, 30 passed. Is there a difference in pass rates?', answer: 'z = 1.653, p = 0.098', tool: 'Statistics.html#tool=twoproportionz' },
    { id: 'normal-probability', title: 'Probability from a distribution', question: 'For a standard normal variable, find P(-1 ≤ Z ≤ 2) and look at the shaded graph.', answer: '0.8186', tool: 'Statistics.html#tool=probcalc' },
    { id: 'frequency-table', title: 'Frequency table', question: 'Classes 10-20, 20-30, 30-40, 40-50, 50-60, 60-70 with frequencies 5, 8, 15, 12, 7, 3: find the mean and median.', answer: 'mean 38.4, median 38', tool: 'Statistics.html#tool=groupeddata' },
    { id: 'own-question', title: 'A question from your own textbook', question: 'Pick any question from the textbook you are using this week and try to answer it with StatLab.', answer: '(compare with the answer in your book)', tool: 'Which-tool.html' }
];
const trialState = {};
const $t = id => document.getElementById(id);
const tEl = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

function fmtSeconds(s) { return s === null || s === undefined ? '-' : (s >= 60 ? Math.floor(s / 60) + ' min ' + Math.round(s % 60) + ' s' : Math.round(s) + ' s'); }
const pct = r => (r === null || r === undefined ? '-' : Math.round(r * 100) + '%');

function buildTasks() {
    TRIAL_TASKS.forEach((t, i) => {
        const st = trialState[t.id] = { id: t.id, title: t.title, foundTool: '', seconds: 0, matched: '', notes: '', running: null };
        const card = tEl('div', 'card'), h = tEl('h3', '', `${i + 1}. ${t.title}`);
        const q = tEl('p', 'task-q', t.question), hint = tEl('p', 'note', `Textbook answer to compare with: ${t.answer}`);
        const open = tEl('a', 'btn secondary', 'Open StatLab'); open.href = t.tool; open.target = '_blank'; open.rel = 'noopener';
        const start = tEl('button', 'secondary', 'Start timer'), timer = tEl('span', 'timer', '0 s'); start.type = 'button';
        let t0 = 0, handle = 0;
        start.addEventListener('click', () => {
            if (st.running) { clearInterval(handle); st.seconds += (Date.now() - t0) / 1000; st.running = null; start.textContent = 'Start timer'; }
            else { t0 = Date.now(); st.running = true; start.textContent = 'Stop timer'; handle = setInterval(() => { timer.textContent = fmtSeconds(st.seconds + (Date.now() - t0) / 1000); }, 500); }
            timer.textContent = fmtSeconds(st.seconds);
        });
        const grid = tEl('div', 'grid');
        const mk = (labelText, control) => { const d = tEl('div'); const l = tEl('label', '', labelText); control.id = `${t.id}-${labelText.slice(0, 4).toLowerCase()}`; l.htmlFor = control.id; d.append(l, control); return d; };
        const found = tEl('select'); [['', 'Choose'], ['yes', 'Yes, without help'], ['no', 'No, I needed help or gave up']].forEach(([v, x]) => { const o = tEl('option', '', x); o.value = v; found.appendChild(o); });
        const match = tEl('select'); [['', 'Choose'], ['yes', 'Yes, same as the book'], ['no', 'No, different'], ['unsure', 'Could not compare']].forEach(([v, x]) => { const o = tEl('option', '', x); o.value = v; match.appendChild(o); });
        const notes = tEl('textarea'); notes.placeholder = 'Anything confusing, missing, or surprising?';
        found.addEventListener('change', () => { st.foundTool = found.value; }); match.addEventListener('change', () => { st.matched = match.value; }); notes.addEventListener('input', () => { st.notes = notes.value; });
        grid.append(mk('Found the tool', found), mk('Answer matched', match));
        const row = tEl('div', 'actions'); row.append(open, start, timer);
        card.append(h, q, hint, row, grid, mk('Notes', notes));
        $t('taskList').appendChild(card);
    });
}

function collectSession() {
    const tasks = TRIAL_TASKS.map(t => { const st = trialState[t.id]; return { id: st.id, title: st.title, foundTool: st.foundTool, seconds: Math.round(st.seconds + (st.running ? 0 : 0)), matched: st.matched, notes: st.notes }; });
    return { kind: 'statlab-trial', version: 1, student: $t('student').value || 'unnamed', device: $t('device').value, level: $t('level').value, at: new Date().toISOString(), tasks,
        overall: { hardest: $t('hardest').value, changeFirst: $t('changeFirst').value, wishedFor: $t('wishedFor').value, wouldUse: $t('wouldUse').value }, feedback: loadFeedback() };
}

function sessionText(s) {
    const lines = [`StatLab trial: ${s.student} (${s.device}, ${s.level})`];
    s.tasks.forEach((t, i) => lines.push(`${i + 1}. ${t.title}: found the tool ${t.foundTool || '?'}, ${fmtSeconds(t.seconds)}, matched book ${t.matched || '?'}${t.notes ? ' - ' + t.notes : ''}`));
    lines.push(`Hardest: ${s.overall.hardest}`, `Change first: ${s.overall.changeFirst}`, `Wished for: ${s.overall.wishedFor}`, `Would use: ${s.overall.wouldUse}`);
    return lines.join('\n');
}

function renderSummary(sum) {
    const box = $t('summary'); box.textContent = '';
    if (!sum.students) { box.appendChild(tEl('p', 'note', 'No valid session files were read.')); return; }
    box.appendChild(tEl('p', '', `${sum.students} student${sum.students === 1 ? '' : 's'}. Would use it: ${sum.wouldUse.yes} yes, ${sum.wouldUse.maybe} maybe, ${sum.wouldUse.no} no.`));
    const table = tEl('table'), head = tEl('tr');
    ['Question', 'Students', 'Found the tool alone', 'Median time', 'Matched the book', 'Notes'].forEach(x => head.appendChild(tEl('th', '', x)));
    table.appendChild(head);
    sum.tasks.forEach(t => {
        const tr = tEl('tr'), flag = sum.problems.includes(t.id);
        tr.appendChild(tEl('td', flag ? 'bad' : '', t.title));
        [t.n, pct(t.foundRate), fmtSeconds(t.medianSeconds), pct(t.matchedRate)].forEach(x => tr.appendChild(tEl('td', '', String(x))));
        const nt = tEl('td'); t.notes.forEach(n => nt.appendChild(tEl('div', 'note', `${n.student}: ${n.note}`))); tr.appendChild(nt);
        table.appendChild(tr);
    });
    box.appendChild(table);
    box.appendChild(tEl('p', sum.problems.length ? 'bad' : 'good', sum.problems.length ? `Fix first: ${sum.problems.join(', ')} (fewer than 3 in 4 found the tool alone or matched the book).` : 'No question fell below 3 in 4 students finding the tool and matching the book.'));
    [['Hardest part', sum.hardest], ['Change first', sum.changeFirst], ['Wished for', sum.wishedFor]].forEach(([title, list]) => {
        if (!list.length) return; const d = tEl('div', 'card'); d.appendChild(tEl('h3', '', title)); list.forEach(x => d.appendChild(tEl('p', 'note', x))); box.appendChild(d);
    });
}

if (typeof document !== 'undefined' && document.getElementById('taskList')) {
    buildTasks();
    $t('download').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(collectSession(), null, 2)], { type: 'application/json' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = `statlab-trial-${($t('student').value || 'session').replace(/[^\w-]+/g, '_')}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        $t('status').textContent = 'Downloaded. Give the file to your teacher.';
    });
    $t('copy').addEventListener('click', () => {
        const txt = sessionText(collectSession());
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { $t('status').textContent = 'Copied.'; }, () => { $t('status').textContent = 'Copy is not available here: use Download instead.'; });
    });
    $t('files').addEventListener('change', async e => {
        const sessions = [];
        for (const f of e.target.files) { try { const j = JSON.parse(await f.text()); if (j && j.kind === 'statlab-trial') sessions.push(j); } catch (err) { /* not a session file: skipped */ } }
        renderSummary(summarizeTrial(sessions));
    });
}
