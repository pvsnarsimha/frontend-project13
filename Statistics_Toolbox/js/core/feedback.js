// Feedback and student-trial data, shared by the "Was this clear?" strip under every result (js/ui/feedback.js) and the trial page (trial.html).
// Everything stays on the device (localStorage) until the student downloads it or opens a pre-filled GitHub issue: nothing is sent anywhere automatically.

const FEEDBACK_KEY = 'statlab.feedback.v1';
const FEEDBACK_REPO_ISSUES = 'https://github.com/pvsnarsimha/frontend-project13/issues/new';

function loadFeedback() {
    try { const v = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
}

// entry: { tool, rating: 'clear' | 'unclear', comment }. Returns the saved entry, or null when the browser blocks storage.
function saveFeedback(entry) {
    const saved = { tool: String(entry.tool || ''), rating: entry.rating === 'clear' ? 'clear' : 'unclear', comment: String(entry.comment || '').slice(0, 2000), at: new Date().toISOString(), width: typeof innerWidth === 'number' ? innerWidth : null };
    try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(loadFeedback().concat(saved))); return saved; } catch (e) { return null; }
}

// a link that opens a pre-filled "Student feedback" issue (the student still presses Submit on GitHub)
function feedbackIssueUrl(entry) {
    const body = `**Tool:** ${entry.tool}\n**Was the explanation clear?** ${entry.rating === 'clear' ? 'Yes' : 'No'}\n\n**What was confusing or missing?**\n${entry.comment || ''}\n\n(Phone or laptop? Browser?)`;
    return `${FEEDBACK_REPO_ISSUES}?template=student-feedback.md&title=${encodeURIComponent('Feedback: ' + entry.tool)}&body=${encodeURIComponent(body)}`;
}

function feedbackToJson(list) {
    return JSON.stringify({ kind: 'statlab-feedback', version: 1, exportedAt: new Date().toISOString(), entries: list }, null, 2);
}

const feedbackMedian = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Turns the sessions of several students (the JSON files of trial.html) into the numbers a teacher needs:
// per task how many found the tool unaided, the median time, how many matched the textbook answer, and every note.
function summarizeTrial(sessions) {
    const valid = (sessions || []).filter(s => s && Array.isArray(s.tasks));
    const byTask = new Map();
    valid.forEach(s => s.tasks.forEach(t => {
        const row = byTask.get(t.id) || { id: t.id, title: t.title || t.id, n: 0, found: 0, seconds: [], matched: 0, matchChecked: 0, notes: [] };
        row.n++;
        if (t.foundTool === 'yes') row.found++;
        if (Number.isFinite(t.seconds) && t.seconds > 0) row.seconds.push(t.seconds);
        if (t.matched === 'yes' || t.matched === 'no') { row.matchChecked++; if (t.matched === 'yes') row.matched++; }
        if (t.notes && String(t.notes).trim()) row.notes.push({ student: s.student || '?', note: String(t.notes).trim() });
        byTask.set(t.id, row);
    }));
    const tasks = [...byTask.values()].map(r => ({ id: r.id, title: r.title, n: r.n, foundRate: r.n ? r.found / r.n : null, medianSeconds: feedbackMedian(r.seconds),
        matchedRate: r.matchChecked ? r.matched / r.matchChecked : null, notes: r.notes }));
    const overall = valid.map(s => s.overall || {});
    return {
        students: valid.length, tasks,
        wouldUse: { yes: overall.filter(o => o.wouldUse === 'yes').length, maybe: overall.filter(o => o.wouldUse === 'maybe').length, no: overall.filter(o => o.wouldUse === 'no').length },
        hardest: overall.map(o => o.hardest).filter(Boolean), changeFirst: overall.map(o => o.changeFirst).filter(Boolean), wishedFor: overall.map(o => o.wishedFor).filter(Boolean),
        // the problems to fix first: tasks where fewer than 3 in 4 found the tool unaided or matched the textbook
        problems: tasks.filter(t => (t.foundRate !== null && t.foundRate < 0.75) || (t.matchedRate !== null && t.matchedRate < 0.75)).map(t => t.id)
    };
}
