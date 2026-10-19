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
        if (!current) return;
        const btns = $$('.stat-btn', current), shown = btns.filter(b => !b.hidden).length;
        hint.textContent = q ? (shown ? `${shown} of ${btns.length} tools match in this module. Press Enter to open the first.` : 'No match in this module. Try another tab or keyword.') : 'Filters the tools in the current module.';
    }
    search.addEventListener('input', applyFilter);
    search.addEventListener('keydown', e => {
        if (e.key === 'Enter') { const sb = visibleSidebar(); const b = sb && $$('.stat-btn', sb).find(x => !x.hidden); if (b) b.click(); }
        if (e.key === 'Escape') { search.value = ''; applyFilter(); search.blur(); }
    });
    document.addEventListener('keydown', e => {
        if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
    });
    Object.assign(window.StatLabUI, { $, $$, showToast, countTools, decorateSidebars, visibleSidebar, applyFilter });
})();
