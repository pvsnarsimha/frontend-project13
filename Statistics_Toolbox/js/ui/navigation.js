// StatLab UI layer (shared helpers, sidebar titles, tool search). Presentation only: no calculation logic lives here.
window.StatLabUI = window.StatLabUI || {};
(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');          // announced politely by screen readers
    document.body.appendChild(toast);
    let toastTimer;
    function showToast(msg, ms) {
        toast.textContent = msg; toast.classList.add('show');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), ms || 1800);
    }

    function countTools() {
        const n = new Set($$('.stat-btn').map(b => b.id)).size;
        const el = $('#heroToolCount'); if (el && n) el.textContent = n + '+';
    }

    const tabTitles = { descriptive: 'Descriptive tools', manipulation: 'Prepare & visualise', probability: 'Distributions', correlation: 'Association', hypothesis: 'Statistical tests', regression: 'Regression' };
    function decorateSidebars() {
        $$('.action-sidebar').forEach(sb => {
            if (!sb.querySelector('.sidebar-title')) {
                const t = document.createElement('div'); t.className = 'sidebar-title'; t.textContent = 'Tools'; t.setAttribute('aria-hidden', 'true');
                sb.insertBefore(t, sb.firstChild);
            }
        });
    }
    function visibleSidebar() { return $$('.action-sidebar').find(s => getComputedStyle(s).display !== 'none'); }
    function setSidebarTitle() {
        const sb = visibleSidebar(); if (!sb) return;
        const t = $('.tab.active'); const title = $('.sidebar-title', sb);
        if (t && title) title.textContent = tabTitles[t.dataset.tab] || 'Tools';
    }
    document.addEventListener('click', e => {
        if (e.target.closest('.stat-btn') && window.innerWidth < 900) $('.content-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (e.target.closest('.tab')) { setSidebarTitle(); applyFilter(); }
    });

    const search = $('#toolSearch'), hint = $('#searchHint');
    // The sidebar filter works on the current module; matches in the OTHER modules are listed below it, so a student who types "t-test"
    // on the Descriptive tab still finds the tool (one click opens its module and the tool).
    const others = document.createElement('div'); others.className = 'search-others'; others.id = 'searchOthers'; others.setAttribute('aria-live', 'polite');
    if (hint.parentNode && typeof hint.parentNode.insertBefore === 'function') hint.parentNode.insertBefore(others, hint.nextSibling);      // (no real page in the unit tests)
    const moduleName = sb => (tabTitles[sb.dataset.module] || sb.dataset.module);
    function otherMatches(q, current) {
        const out = [];
        $$('.action-sidebar').forEach(sb => { if (sb !== current) $$('.stat-btn', sb).forEach(b => { if (b.textContent.toLowerCase().includes(q)) out.push({ btn: b, sb }); }); });
        return out;
    }
    function openOther(m) {
        const tab = $(`.tab[data-tab="${m.sb.dataset.module}"]`); if (tab) tab.click();
        search.value = ''; applyFilter();
        m.btn.click();
    }
    // The hint promises "the tools in the current module", so only the visible sidebar is filtered;
    // hidden sidebars are always reset so they are complete when their tab is opened.
    function applyFilter() {
        const q = (search.value || '').trim().toLowerCase();
        const current = visibleSidebar();
        $$('.action-sidebar').forEach(sb => {
            const active = sb === current && q;
            $$('.stat-btn', sb).forEach(b => { b.hidden = !!active && !b.textContent.toLowerCase().includes(q); });
            $$('.sidebar-sep', sb).forEach(d => { d.hidden = !!active; });
        });
        others.textContent = '';
        if (!current) return;
        const btns = $$('.stat-btn', current), shown = btns.filter(b => !b.hidden).length;
        const elsewhere = q ? otherMatches(q, current) : [];
        hint.textContent = q ? (shown ? `${shown} of ${btns.length} tools match in this module. Press Enter to open the first.` : (elsewhere.length ? 'No match in this module, but found in another module:' : 'No match in this module or any other. Try another keyword.')) : 'Filters the tools in the current module.';
        if (elsewhere.length) {
            if (shown) { const lead = document.createElement('span'); lead.className = 'search-others-lead'; lead.textContent = 'Also in other modules: '; others.appendChild(lead); }
            elsewhere.slice(0, 8).forEach(m => {
                const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'search-other';
                bt.textContent = `${m.btn.textContent.trim()} · ${moduleName(m.sb)}`;
                bt.addEventListener('click', () => openOther(m));
                others.appendChild(bt);
            });
        }
    }
    search.addEventListener('input', applyFilter);
    search.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const sb = visibleSidebar(); const b = sb && $$('.stat-btn', sb).find(x => !x.hidden);
            if (b) b.click();
            else { const q = (search.value || '').trim().toLowerCase(), m = q && sb ? otherMatches(q, sb)[0] : null; if (m) openOther(m); }
        }
        if (e.key === 'Escape') { search.value = ''; applyFilter(); search.blur(); }
    });
    document.addEventListener('keydown', e => {
        if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
    });
    Object.assign(window.StatLabUI, { $, $$, showToast, countTools, decorateSidebars, visibleSidebar, applyFilter });
})();
