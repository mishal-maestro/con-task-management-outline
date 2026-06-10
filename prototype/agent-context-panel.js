// agent-context-panel.js — the Agent Mode context panel.
//
// A slide-in side panel (Trip Context · Memory · Tasks) built on the task-drawer
// pattern (task-drawer.js): it slides in from the right, you traverse inside it
// with a back arrow, and ESC / backdrop closes it. It is summoned on demand — it
// is not a static rail. Memory is modelled on the Claude app's project memory:
// project-scoped, grouped, editable, with agent suggestions the operator promotes.
//
// Requires on the page: agent-data.js (AGENT_* + AgentData), task-data.js
// (TIER_STYLES) and task-drawer.js (showSharedToast + the global task-id-link
// delegation, which gives the Tasks view its handoff into the task drawer).
//
// Exposes:
//   window.openContextPanel(view, projectId)  — view = 'overview' | 'memory' | 'tasks'
//   window.closeContextPanel()
//   window.onAgentContextMutated(cb)          — fired when memory changes

(function () {
  if (window.__agentContextPanelLoaded) return;
  window.__agentContextPanelLoaded = true;

  let stack = [];        // view stack — [{ view }]
  let curProject = null;
  let factSeq = 0;       // id counter for operator-added / promoted facts
  let addOpen = false;   // inline "add a fact" form visibility
  let mutationCb = null;

  window.onAgentContextMutated = (cb) => { mutationCb = cb; };
  function notifyMutated() { if (mutationCb) { try { mutationCb(); } catch (e) {} } }

  // Memory groups — display order + labels.
  const GROUPS = [
    ['preference', 'Preferences'],
    ['constraint', 'Constraints & exclusions'],
    ['logistics',  'Party & logistics'],
    ['trip',       'Trip context'],
  ];

  function toast(msg, undoFn) { (window.showSharedToast || function () {})(msg, undoFn); }
  function esc(s) {
    return (window.Theme && Theme.escapeHtml) ? Theme.escapeHtml(s) : String(s == null ? '' : s);
  }

  // ──────────────────────────────────────────────────────────
  //  Inject markup (once, on DOMContentLoaded)
  // ──────────────────────────────────────────────────────────
  function injectMarkup() {
    if (document.getElementById('agent-ctx-panel')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="agent-ctx-backdrop" class="actx-mb fixed inset-0 bg-black/40 z-[52]"></div>
      <aside id="agent-ctx-panel" class="actx-panel fixed top-0 right-0 h-full w-full max-w-[460px] bg-mcard border-l border-mborder z-[54] overflow-y-auto">
        <div id="actx-content"></div>
      </aside>
      <style>
        .actx-mb { opacity: 0; pointer-events: none; transition: opacity .15s ease-out; }
        .actx-mb.open { opacity: 1; pointer-events: auto; }
        .actx-panel { transform: translateX(100%); transition: transform .2s ease-out; }
        .actx-panel.open { transform: translateX(0); }
      </style>
    `;
    document.body.appendChild(wrap);
    document.getElementById('agent-ctx-backdrop').addEventListener('click', closeContextPanel);
    document.getElementById('actx-content').addEventListener('click', onContentClick);
    // Capture phase so this runs before task-drawer's bubble-phase Esc handler:
    // when a task drawer is open on top, Esc closes only the drawer, not the panel.
    document.addEventListener('keydown', onKey, true);
  }

  // ──────────────────────────────────────────────────────────
  //  Open / close / traverse
  // ──────────────────────────────────────────────────────────
  function openContextPanel(view, projectId) {
    injectMarkup();
    if (projectId) curProject = projectId;
    if (!AgentData.project(curProject)) return;
    view = view || 'overview';
    // Opening straight to a sub-view still seeds overview underneath, so the
    // back arrow always returns to the project context overview.
    stack = (view === 'overview') ? [{ view: 'overview' }]
                                  : [{ view: 'overview' }, { view: view }];
    addOpen = false;
    render();
    document.getElementById('agent-ctx-panel').classList.add('open');
    document.getElementById('agent-ctx-backdrop').classList.add('open');
  }

  function closeContextPanel() {
    const p = document.getElementById('agent-ctx-panel');
    const b = document.getElementById('agent-ctx-backdrop');
    if (p) p.classList.remove('open');
    if (b) b.classList.remove('open');
  }

  function pushView(view) { stack.push({ view: view }); addOpen = false; render(); scrollTop(); }
  function popView() { if (stack.length > 1) stack.pop(); addOpen = false; render(); scrollTop(); }
  function scrollTop() { const p = document.getElementById('agent-ctx-panel'); if (p) p.scrollTop = 0; }

  function onKey(e) {
    if (e.key !== 'Escape') return;
    const panel = document.getElementById('agent-ctx-panel');
    if (!panel || !panel.classList.contains('open')) return;
    // A task drawer / evidence popover opens on top — let task-drawer.js own ESC then.
    const drawer = document.getElementById('shared-drawer');
    const evidence = document.getElementById('shared-evidence-backdrop');
    if ((drawer && drawer.classList.contains('open')) ||
        (evidence && evidence.classList.contains('open'))) return;
    if (stack.length > 1) popView();
    else closeContextPanel();
  }

  // ──────────────────────────────────────────────────────────
  //  Render
  // ──────────────────────────────────────────────────────────
  function render() {
    const proj = AgentData.project(curProject);
    if (!proj) return;
    const cur = stack[stack.length - 1] || { view: 'overview' };
    let eyebrow, body;
    if (cur.view === 'memory') { eyebrow = 'Memory'; body = viewMemory(proj); }
    else if (cur.view === 'tasks') { eyebrow = 'Tasks'; body = viewTasks(proj); }
    else { eyebrow = 'Project context'; body = viewOverview(proj); }

    const canBack = stack.length > 1;
    document.getElementById('actx-content').innerHTML = `
      <div class="sticky top-0 bg-mcard border-b border-mborder px-4 py-3 flex items-center gap-2 z-10">
        ${canBack ? `<button data-actx="back" title="Back" class="p-1 -ml-1 rounded hover:bg-msurface text-mtext2 hover:text-mtext flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>` : ''}
        <div class="min-w-0 flex-1">
          <div class="text-[10px] font-mono uppercase tracking-widest text-maccent">${eyebrow}</div>
          <div class="text-sm font-semibold text-mtext truncate">${esc(proj.name)}</div>
        </div>
        <button data-actx="close" title="Close" class="p-1 rounded hover:bg-msurface text-mtext2 hover:text-mtext flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-4">${body}</div>
    `;
    if (addOpen) {
      const ai = document.getElementById('actx-add-input');
      if (ai) {
        ai.focus();
        ai.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveNewFact(); } });
      }
    }
  }

  function onContentClick(e) {
    const el = e.target.closest('[data-actx]');
    if (!el) return; // task-id-link anchors fall through to task-drawer.js delegation
    const a = el.dataset.actx, id = el.dataset.id;
    if (a === 'close') closeContextPanel();
    else if (a === 'back') popView();
    else if (a === 'go-memory') pushView('memory');
    else if (a === 'go-tasks') pushView('tasks');
    else if (a === 'promote') promoteInsight(id);
    else if (a === 'dismiss') dismissInsight(id);
    else if (a === 'remove') removeFact(id);
    else if (a === 'stale') markStale(id);
    else if (a === 'add-open') { addOpen = true; render(); }
    else if (a === 'add-cancel') { addOpen = false; render(); }
    else if (a === 'add-save') saveNewFact();
  }

  // ──────────────────────────────────────────────────────────
  //  View — overview
  // ──────────────────────────────────────────────────────────
  function viewOverview(proj) {
    const ctx = AgentData.context(proj.id);
    const mem = AgentData.memory(proj.id);
    const ins = AgentData.insights(proj.id);
    const tasks = AgentData.tasksFor(proj.id);
    const kindLabel = proj.kind === 'trip' ? 'Trip' : 'Client';

    const ctxBlock = (label, items) => (!items || !items.length) ? '' : `
      <div class="mt-2.5">
        <div class="text-[10px] font-mono uppercase tracking-wider text-mtext3 mb-1">${label}</div>
        <ul class="space-y-1">${items.map(i =>
          `<li class="text-xs text-mtext2 leading-snug flex gap-1.5"><span class="text-mtext3 flex-shrink-0">·</span><span>${esc(i)}</span></li>`
        ).join('')}</ul>
      </div>`;

    const navRow = (action, title, sub) => `
      <button data-actx="${action}" class="w-full text-left bg-mbg border border-mborder rounded-lg p-3 hover:border-mborderh transition-colors flex items-center gap-3 mb-2">
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-mtext">${title}</div>
          <div class="text-[11px] text-mtext3 mt-0.5">${sub}</div>
        </div>
        <svg class="w-4 h-4 text-mtext3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>`;

    return `
      <div class="flex items-center gap-2 mb-3">
        <span class="text-[9px] font-mono uppercase tracking-wider text-mtext2 bg-msurface rounded px-1.5 py-0.5">${kindLabel}</span>
        <span class="text-[11px] text-mtext3">${esc(proj.meta)}</span>
      </div>

      <div class="bg-mbg border border-mborder rounded-lg p-3 mb-4">
        <div class="text-[10px] font-mono uppercase tracking-widest text-maccent mb-1">Trip context</div>
        <div class="text-[11px] text-mtext3 leading-snug">Project knowledge the agent grounds on. Pre-loaded into every thread.</div>
        ${ctx ? (ctxBlock('Trip', ctx.trip) + ctxBlock('Org insights', ctx.org))
              : '<div class="text-xs text-mtext3 mt-2">No context on file for this project.</div>'}
      </div>

      ${navRow('go-memory', 'Memory',
        mem.length + ' fact' + (mem.length === 1 ? '' : 's') + (ins.length ? ' · ' + ins.length + ' suggested' : ''))}
      ${navRow('go-tasks', 'Tasks', tasks.length ? tasks.length + ' agent-created' : 'None yet')}
    `;
  }

  // ──────────────────────────────────────────────────────────
  //  View — memory (modelled on the Claude app's project memory)
  // ──────────────────────────────────────────────────────────
  function viewMemory(proj) {
    const mem = AgentData.memory(proj.id);
    const ins = AgentData.insights(proj.id);

    let groupsHtml = '';
    GROUPS.forEach(([key, label]) => {
      const facts = mem.filter(f => (f.group || 'trip') === key);
      if (!facts.length) return;
      groupsHtml += `
        <div class="mb-4">
          <div class="text-[10px] font-mono uppercase tracking-wider text-mtext3 mb-1.5">${label}</div>
          <div class="space-y-1.5">${facts.map(factRow).join('')}</div>
        </div>`;
    });
    if (!groupsHtml) groupsHtml = '<div class="text-xs text-mtext3 mb-4">No memory yet for this project.</div>';

    const insHtml = ins.length ? `
      <div class="mb-4">
        <div class="text-[10px] font-mono uppercase tracking-wider text-blue-300 mb-1.5">Suggested from threads · ${ins.length}</div>
        <div class="space-y-2">${ins.map(insightRow).join('')}</div>
      </div>` : '';

    const addHtml = addOpen ? `
      <div class="bg-mbg border border-mborderh rounded-lg p-3">
        <input id="actx-add-input" type="text" placeholder="A fact the agent should remember…"
          class="w-full bg-mcard border border-mborder rounded-md px-2.5 py-1.5 text-sm text-mtext placeholder-mtext3 outline-none focus:border-maccent/50 mb-2">
        <div class="flex items-center gap-2">
          <select id="actx-add-group" class="bg-mcard border border-mborder rounded-md px-2 py-1.5 text-xs text-mtext outline-none">
            ${GROUPS.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}
          </select>
          <div class="flex-1"></div>
          <button data-actx="add-cancel" class="px-2.5 py-1.5 rounded-md text-xs text-mtext2 hover:text-mtext">Cancel</button>
          <button data-actx="add-save" class="px-2.5 py-1.5 rounded-md bg-maccent text-white text-xs font-medium hover:bg-maccenth">Save</button>
        </div>
      </div>` : `
      <button data-actx="add-open" class="w-full text-xs text-mtext2 hover:text-maccent border border-dashed border-mborderh hover:border-maccent/40 rounded-lg py-2 transition-colors">+ Add a fact to memory</button>`;

    return `
      <div class="text-[11px] text-mtext3 leading-relaxed mb-4">
        Project-scoped — what the agent remembers for <span class="text-mtext">${esc(proj.name)}</span>.
        These facts guide every thread. The agent suggests; the operator decides what memory holds.
      </div>
      ${groupsHtml}
      ${insHtml}
      ${addHtml}
    `;
  }

  function factRow(f) {
    const dot = f.exclusion ? '#f87171' : '#34d399';
    return `
      <div class="bg-mbg border border-mborder rounded-lg p-2.5 ${f.stale ? 'opacity-50' : ''}">
        <div class="flex gap-2">
          <span class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style="background:${dot}"></span>
          <div class="flex-1 min-w-0">
            <div class="text-[12px] text-mtext leading-relaxed ${f.stale ? 'line-through' : ''}">${esc(f.body)}</div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              ${f.exclusion ? '<span class="text-[9px] font-mono text-rose-400">EXCLUSION</span>' : ''}
              ${f.stale ? '<span class="text-[9px] font-mono text-mtext3">STALE</span>' : ''}
              ${f.note ? `<span class="text-[10px] text-mtext3">${esc(f.note)}</span>` : ''}
              <div class="flex-1"></div>
              <button data-actx="stale" data-id="${f.id}" class="text-[10px] text-mtext3 hover:text-mamber">${f.stale ? 'Mark current' : 'Mark stale'}</button>
              <button data-actx="remove" data-id="${f.id}" class="text-[10px] text-mtext3 hover:text-rose-300">Remove</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function insightRow(i) {
    return `
      <div class=”bg-minfol border border-minfo/25 rounded-lg p-2.5”>
        <div class=”text-[12px] text-mtext leading-relaxed”>${esc(i.body)}</div>
        <div class=”text-[10px] text-mtext3 mt-1”>noticed in “${esc(i.sourceLabel)}”</div>
        <div class=”flex items-center gap-2 mt-2”>
          <button data-actx=”promote” data-id=”${i.id}” class=”px-2 py-1 rounded-md bg-msurface text-mtext border border-mborder hover:bg-maccent hover:border-maccent hover:text-white text-[11px] font-medium transition-colors”>Promote to memory</button>
          <button data-actx=”dismiss” data-id=”${i.id}” class=”px-2 py-1 rounded-md text-[11px] text-mtext3 hover:text-mtext”>Dismiss</button>
        </div>
      </div>`;
  }

  // ──────────────────────────────────────────────────────────
  //  View — tasks (hands off to the shared task drawer)
  // ──────────────────────────────────────────────────────────
  function viewTasks(proj) {
    const tasks = AgentData.tasksFor(proj.id);
    if (!tasks.length) {
      return '<div class="text-xs text-mtext3 py-2">No Agent-created tasks for this project yet.</div>';
    }
    const rows = tasks.map(t => {
      const tier = (typeof TIER_STYLES !== 'undefined' && TIER_STYLES[t.routing_tier])
        || { bg: 'bg-msurface', text: 'text-mtext', border: 'border-mborder', label: t.routing_tier };
      const bar = t.routing_tier === 'escalate' ? '#f87171' : t.routing_tier === 'assist' ? '#fbbf24' : '#34d399';
      return `
        <a class="task-id-link block bg-mbg border border-mborder rounded-lg p-2.5 hover:border-mborderh transition-colors" style="border-left:3px solid ${bar};" href="task-board.html#task=${t.id}">
          <div class="flex items-center gap-2 mb-1">
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono ${tier.bg} ${tier.text} border ${tier.border}">${tier.label}</span>
            <span class="text-[9px] font-mono text-mtext3 ml-auto">${t.id}</span>
          </div>
          <div class="text-[12px] text-mtext leading-snug">${esc(t.title)}</div>
          <div class="text-[10px] text-mtext3 mt-1 capitalize">${esc(t.status)} · ${esc(String(t.approval_state || '').replace(/-/g, ' '))}</div>
        </a>`;
    }).join('');
    return `
      <div class="text-[11px] text-mtext3 leading-relaxed mb-3">Agent-created tasks for this project — real records in the shared task layer. Click one to open it in the task drawer.</div>
      <div class="space-y-2">${rows}</div>
    `;
  }

  // ──────────────────────────────────────────────────────────
  //  Memory mutations (in-memory, with toast + undo)
  // ──────────────────────────────────────────────────────────
  function promoteInsight(id) {
    const idx = AGENT_INSIGHTS.findIndex(i => i.id === id);
    if (idx < 0) return;
    const ins = AGENT_INSIGHTS[idx];
    AGENT_INSIGHTS.splice(idx, 1);
    factSeq += 1;
    const fact = { id: 'cf-new-' + factSeq, body: ins.body, kind: 'operator', group: ins.group, note: 'Promoted from a thread · just now' };
    (AGENT_MEMORY[ins.project] = AGENT_MEMORY[ins.project] || []).push(fact);
    render(); notifyMutated();
    toast('Promoted to memory', () => {
      const fi = AGENT_MEMORY[ins.project].indexOf(fact);
      if (fi >= 0) AGENT_MEMORY[ins.project].splice(fi, 1);
      AGENT_INSIGHTS.splice(idx, 0, ins);
      render(); notifyMutated();
    });
  }

  function dismissInsight(id) {
    const idx = AGENT_INSIGHTS.findIndex(i => i.id === id);
    if (idx < 0) return;
    const ins = AGENT_INSIGHTS[idx];
    AGENT_INSIGHTS.splice(idx, 1);
    render(); notifyMutated();
    toast('Suggestion dismissed', () => { AGENT_INSIGHTS.splice(idx, 0, ins); render(); notifyMutated(); });
  }

  function removeFact(id) {
    const arr = AGENT_MEMORY[curProject] || [];
    const idx = arr.findIndex(f => f.id === id);
    if (idx < 0) return;
    const fact = arr[idx];
    arr.splice(idx, 1);
    render(); notifyMutated();
    toast('Removed from memory · logged for weekly review', () => { arr.splice(idx, 0, fact); render(); notifyMutated(); });
  }

  function markStale(id) {
    const arr = AGENT_MEMORY[curProject] || [];
    const f = arr.find(x => x.id === id);
    if (!f) return;
    f.stale = !f.stale;
    render(); notifyMutated();
    toast(f.stale ? 'Marked stale' : 'Marked current');
  }

  function saveNewFact() {
    const input = document.getElementById('actx-add-input');
    const sel = document.getElementById('actx-add-group');
    if (!input) return;
    const body = (input.value || '').trim();
    if (!body) { input.focus(); return; }
    factSeq += 1;
    const fact = { id: 'cf-new-' + factSeq, body: body, kind: 'operator', group: sel ? sel.value : 'preference', note: 'You · just now' };
    (AGENT_MEMORY[curProject] = AGENT_MEMORY[curProject] || []).push(fact);
    addOpen = false;
    render(); notifyMutated();
    toast('Added to memory');
  }

  window.openContextPanel = openContextPanel;
  window.closeContextPanel = closeContextPanel;
  document.addEventListener('DOMContentLoaded', injectMarkup);
})();
