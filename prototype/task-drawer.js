// task-drawer.js — shared task drawer + evidence popover + toast container.
// Drop into any page that needs to open a task in a side panel without navigating away.
//
// Usage:
//   <script src="task-data.js"></script>
//   <script src="task-drawer.js"></script>
//
// Exposes globally:
//   openTaskDrawer(taskId)   - opens the drawer with that task
//   closeTaskDrawer()        - close it
//   openEvidence(label)      - opens evidence popover
//   closeEvidence()
//   showSharedToast(msg, undoFn)
//   linkifyTaskIds(text)
//   onTaskMutated(callback)  - register a callback fired when a task's state changes from this drawer
//
// Listens at document level for:
//   - clicks on a.task-id-link with href="...#task=ID" → opens drawer in place (no nav)
//   - clicks on a.evidence-chip with data-label → opens evidence popover
//   - Escape key → closes evidence > drawer in that order

(function () {
  if (window.__taskDrawerLoaded) return; // task-board.html has its own; avoid double-init
  window.__taskDrawerLoaded = true;

  // ──────────────────────────────────────────────────────────
  //  State + callbacks
  // ──────────────────────────────────────────────────────────
  let currentTaskId = null;
  const mutationCallbacks = [];
  window.onTaskMutated = (cb) => mutationCallbacks.push(cb);
  function notifyMutated() { mutationCallbacks.forEach(cb => { try { cb(); } catch (e) {} }); }

  // ──────────────────────────────────────────────────────────
  //  Inject markup
  // ──────────────────────────────────────────────────────────
  function injectMarkup() {
    if (document.getElementById('shared-drawer')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <!-- Drawer + backdrop -->
      <div id="shared-drawer-backdrop" class="shared-mb fixed inset-0 bg-black/40 z-[55]"></div>
      <aside id="shared-drawer" class="shared-drawer fixed top-0 right-0 h-full w-full max-w-[520px] bg-mcard border-l border-mborder z-[60] overflow-y-auto">
        <div id="shared-drawer-content"></div>
      </aside>

      <!-- Evidence popover -->
      <div id="shared-evidence-backdrop" class="shared-mb fixed inset-0 bg-black/60 z-[65] flex items-center justify-center p-4">
        <div class="bg-mcard border border-mborder rounded-xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
          <div class="px-5 py-4 border-b border-mborder flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-7 h-7 rounded-md bg-msurface flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-mtext3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div class="min-w-0">
                <div class="text-[10px] uppercase tracking-wider text-mtext3" id="shared-evidence-kind">Evidence</div>
                <div class="text-sm font-semibold text-mtext truncate" id="shared-evidence-title">—</div>
              </div>
            </div>
            <button id="shared-evidence-close" class="p-1 rounded hover:bg-msurface text-mtext3 hover:text-mtext flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div id="shared-evidence-body" class="p-5 overflow-y-auto flex-1"></div>
          <div class="px-5 py-3 border-t border-mborder flex items-center justify-between flex-shrink-0">
            <span class="text-[11px] text-mtext3">Simulated for prototype · in production this opens the source system</span>
            <button id="shared-evidence-dismiss" class="px-3 py-1.5 rounded-lg bg-msurface text-mtext hover:bg-mraised text-sm">Close</button>
          </div>
        </div>
      </div>

      <!-- Toast container -->
      <div id="shared-toast-container" class="fixed bottom-6 right-6 z-[70] flex flex-col gap-2 items-end"></div>

      <style>
        .shared-mb { opacity: 0; pointer-events: none; transition: opacity .15s ease-out; }
        .shared-mb.open { opacity: 1; pointer-events: auto; }
        .shared-drawer { transform: translateX(100%); transition: transform .2s ease-out; }
        .shared-drawer.open { transform: translateX(0); }
        .shared-toast { animation: shared-toast-in .2s ease-out; }
        @keyframes shared-toast-in { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .evidence-chip { display: inline-flex; }
      </style>
    `;
    document.body.appendChild(wrap);

    // Wire close handlers
    document.getElementById('shared-drawer-backdrop').addEventListener('click', closeTaskDrawer);
    document.getElementById('shared-evidence-close').addEventListener('click', closeEvidence);
    document.getElementById('shared-evidence-dismiss').addEventListener('click', closeEvidence);
    document.getElementById('shared-evidence-backdrop').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeEvidence();
    });

    // ESC: evidence → drawer
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const evidenceOpen = document.getElementById('shared-evidence-backdrop').classList.contains('open');
      const drawerOpen = document.getElementById('shared-drawer').classList.contains('open');
      if (evidenceOpen) closeEvidence();
      else if (drawerOpen) closeTaskDrawer();
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Drawer render
  // ──────────────────────────────────────────────────────────
  function openTaskDrawer(id) {
    const t = TaskFilters.byId(id);
    if (!t) return;
    currentTaskId = id;
    const tier = TIER_STYLES[t.routing_tier];
    const owner = memberById(t.primary_owner);
    const src = SOURCE_CHANNELS[t.source_channel] || SOURCE_CHANNELS['system'];
    const isPending = t.approval_state === 'pending-review';
    const hasDraft = !!t.draft;

    // Review block (orange) — for pending tasks
    const reviewBlock = isPending ? `
      <div class="bg-chip-orange/10 border border-chip-orange/40 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-4 h-4 text-chip-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          <span class="text-[11px] font-semibold uppercase tracking-wider text-chip-orange">Review</span>
          <span class="text-[10px] text-chip-orange/70">AI FLAGGED THIS — ACCEPT OR DROP</span>
        </div>
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          ${hasDraft ? `
            <button class="td-action px-3 py-1.5 rounded-lg bg-msuccess/20 text-msuccess border border-msuccess/40 hover:bg-msuccess/30 text-sm font-medium" data-action="approve-send" data-id="${t.id}">✓ Approve &amp; send</button>
            <button class="td-action px-3 py-1.5 rounded-lg bg-msurface text-mtext2 border border-mborder hover:bg-mraised text-sm inline-flex items-center gap-1.5" data-action="edit-in-composer" data-id="${t.id}">
              Edit + approve
              <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          ` : `
            <button class="td-action px-3 py-1.5 rounded-lg bg-msuccess/20 text-msuccess border border-msuccess/40 hover:bg-msuccess/30 text-sm font-medium" data-action="approve" data-id="${t.id}">✓ Approve</button>
          `}
          <button class="td-action px-3 py-1.5 rounded-lg text-mdanger hover:text-mdanger hover:bg-mdanger/10 text-sm" data-action="dismiss" data-id="${t.id}">Dismiss</button>
        </div>
        <p class="text-[11px] text-mtext3 leading-relaxed">
          ${hasDraft ? 'Per PRD §7.1: one-click <strong class="text-mtext">Approve &amp; send</strong> fires the draft immediately and auto-closes the task.' : 'Approving keeps the task in the active list. Dismissing removes it from default queues but the audit trail is preserved.'}
        </p>
      </div>
    ` : '';

    // Type-aware block
    let typeBlock = '';
    if (t.task_type === 'messaging' && t.draft) {
      typeBlock = `
        <div class="bg-mbg border border-mborder rounded-lg p-3">
          <div class="text-[10px] uppercase tracking-wider text-mtext3 mb-1">Drafted reply</div>
          <p class="text-sm text-mtext leading-relaxed font-mono whitespace-pre-line">${t.draft}</p>
        </div>
      `;
    } else if (t.task_type === 'booking-action') {
      typeBlock = `
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-mbg border border-mborder rounded-lg p-3">
            <div class="text-[10px] uppercase tracking-wider text-mtext3">Action</div>
            <div class="text-sm text-mtext mt-0.5">${t.subtype}</div>
          </div>
          <div class="bg-mbg border border-mborder rounded-lg p-3">
            <div class="text-[10px] uppercase tracking-wider text-mtext3">Vendor / supplier</div>
            <div class="text-sm text-mtext mt-0.5">${(t.evidence[0] && t.evidence[0].label) || 'TBD'}</div>
          </div>
        </div>
      `;
    } else if (t.task_type === 'disruption-response') {
      typeBlock = `
        <div class="bg-mdanger/5 border border-mdanger/30 rounded-lg p-3">
          <div class="text-[10px] uppercase tracking-wider text-mdanger mb-1">Trigger event</div>
          <div class="text-sm text-mtext">${t.subtype}</div>
        </div>
      `;
    } else if (t.task_type === 'trip-prep') {
      typeBlock = `
        <div class="bg-mbg border border-mborder rounded-lg p-3">
          <div class="text-[10px] uppercase tracking-wider text-mtext3 mb-1">Trip-prep step</div>
          <div class="text-sm text-mtext">${t.subtype}</div>
        </div>
      `;
    }

    // Activity
    const activityHtml = (t.activity || []).map(a => `
      <div class="flex gap-3 py-2.5 border-b border-mborder last:border-b-0">
        <div class="w-1.5 h-1.5 rounded-full bg-mborderh mt-1.5 flex-shrink-0"></div>
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline justify-between gap-2">
            <div class="text-xs text-mtext">${a.actor} · <span class="text-mtext2">${a.event}</span></div>
            <div class="text-[10px] text-mtext3 font-mono flex-shrink-0">${a.ts}</div>
          </div>
          ${a.detail ? `<div class="text-[11px] text-mtext3 mt-0.5">${linkifyTaskIds(a.detail)}</div>` : ''}
        </div>
      </div>
    `).join('');

    // Evidence chips
    const evidenceHtml = (t.evidence || []).map(e => `
      <a href="#evidence" class="evidence-chip inline-flex items-center gap-1.5 px-2 py-1 rounded bg-msurface border border-mborder text-[11px] text-mtext2 hover:text-maccenth hover:border-maccent/40 transition-colors mr-2 mb-1" data-label="${e.label}">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
        ${e.label}
      </a>
    `).join('');

    document.getElementById('shared-drawer-content').innerHTML = `
      <div class="sticky top-0 bg-mcard border-b border-mborder px-5 py-4 flex items-center justify-between z-10">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono ${tier.bg} ${tier.text} border ${tier.border}">${tier.label}</span>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-msurface border border-mborder ${src.color}">${src.svg}<span class="text-mtext2">${src.label}</span></span>
          <span class="text-[11px] text-mtext3">${TASK_TYPE_LABELS[t.task_type]} · ${t.subtype}</span>
        </div>
        <div class="flex items-center gap-1">
          <a href="task-board.html#task=${t.id}" class="p-1 rounded hover:bg-msurface text-mtext3 hover:text-mtext" title="Open in Tasks board (full page)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <button id="shared-drawer-close" class="p-1 rounded hover:bg-msurface text-mtext2 hover:text-mtext">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="p-5 space-y-5">
        <div>
          <h3 class="text-lg font-semibold text-mtext leading-snug">${t.title}</h3>
          <div class="flex items-center gap-3 mt-2 text-xs text-mtext2 flex-wrap">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full ${owner.color} text-[9px] font-semibold">${owner.initials}</span>
              <span>${owner.name}</span>
            </div>
            <span class="text-mborder">·</span>
            <span>Due: <span class="text-mtext">${t.due_at}</span></span>
            <span class="text-mborder">·</span>
            <span>Priority: <span class="text-mtext">${PRIORITY_STYLES[t.priority].label}</span></span>
            <span class="text-mborder">·</span>
            <a href="task-board.html#task=${t.id}" class="task-id-link font-mono text-mborderh hover:text-maccenth">${t.id}</a>
          </div>
        </div>

        ${reviewBlock}
        ${typeBlock}

        <div class="bg-msurface/40 border border-mborder rounded-lg p-4">
          <div class="flex items-start gap-2 mb-2">
            <svg class="w-4 h-4 text-maccent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div class="flex-1">
              <div class="text-[10px] uppercase tracking-wider text-mtext3 mb-1">Rationale</div>
              <p class="text-sm text-mtext leading-relaxed">${linkifyTaskIds(t.rationale)}</p>
            </div>
          </div>
          ${evidenceHtml ? `<div class="mt-3 pt-3 border-t border-mborder"><div class="text-[10px] uppercase tracking-wider text-mtext3 mb-2">Evidence</div><div>${evidenceHtml}</div></div>` : ''}
        </div>

        ${t.ai_reasoning ? `
          <div class="bg-mbg border border-mborder rounded-lg p-4">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-mtext3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              <div class="flex-1">
                <div class="text-[10px] uppercase tracking-wider text-mtext3 mb-1">AI reasoning</div>
                <p class="text-xs text-mtext2 leading-relaxed">${linkifyTaskIds(t.ai_reasoning)}</p>
                ${t.confidence ? `<div class="text-[10px] text-mtext3 mt-2">Confidence: <span class="font-mono text-mamber">${t.confidence}%</span></div>` : ''}
              </div>
            </div>
          </div>
        ` : ''}

        <div>
          <div class="text-[10px] uppercase tracking-wider text-mtext3 mb-2">Activity</div>
          <div class="bg-mbg border border-mborder rounded-lg px-4">
            ${activityHtml}
          </div>
        </div>
      </div>

      ${isPending ? '' : `
      <div class="sticky bottom-0 bg-mcard border-t border-mborder p-4 flex items-center gap-2 flex-wrap">
        ${hasDraft && t.status !== 'completed' ? `
          <button class="td-action px-3 py-1.5 rounded-lg bg-maccent text-white hover:bg-maccenth text-sm font-medium" data-action="send-draft" data-id="${t.id}">Send draft now</button>
          <button class="td-action px-3 py-1.5 rounded-lg bg-msurface text-mtext hover:bg-mraised text-sm" data-action="open-composer" data-id="${t.id}">Edit in composer</button>
        ` : `
          <button class="td-action px-3 py-1.5 rounded-lg bg-maccent text-white hover:bg-maccenth text-sm font-medium" data-action="complete" data-id="${t.id}">Complete</button>
        `}
        <button class="td-action px-3 py-1.5 rounded-lg bg-msurface text-mtext hover:bg-mraised text-sm" data-action="snooze" data-id="${t.id}">Snooze</button>
        <div class="flex-1"></div>
        <button class="td-action px-3 py-1.5 rounded-lg text-mdanger hover:text-mdanger hover:bg-mdanger/10 text-sm" data-action="dismiss" data-id="${t.id}">Dismiss</button>
      </div>
      `}
    `;

    document.getElementById('shared-drawer').classList.add('open');
    document.getElementById('shared-drawer-backdrop').classList.add('open');
    document.getElementById('shared-drawer-close').addEventListener('click', closeTaskDrawer);

    // Wire actions
    document.querySelectorAll('#shared-drawer-content .td-action').forEach(b => {
      b.addEventListener('click', () => {
        const action = b.dataset.action;
        const id = b.dataset.id;
        const tt = TaskFilters.byId(id);
        if (!tt) return;
        if (action === 'approve') { doApprove(id); closeTaskDrawer(); }
        else if (action === 'approve-send' || action === 'send-draft') { doApproveAndSend(id); closeTaskDrawer(); }
        else if (action === 'edit-in-composer' || action === 'open-composer') {
          if (tt.approval_state === 'pending-review') tt.approval_state = 'human-approved';
          window.location.href = 'inline-create.html#from-task=' + encodeURIComponent(id);
        }
        else if (action === 'complete') { showSharedToast(`Marked “${truncate(tt.title, 40)}” as complete`); tt.status = 'completed'; notifyMutated(); closeTaskDrawer(); }
        else if (action === 'snooze') { showSharedToast(`Snoozed “${truncate(tt.title, 40)}”`); tt.status = 'snoozed'; notifyMutated(); closeTaskDrawer(); }
        else if (action === 'dismiss') { doDismiss(id); closeTaskDrawer(); }
      });
    });
  }

  function closeTaskDrawer() {
    document.getElementById('shared-drawer').classList.remove('open');
    document.getElementById('shared-drawer-backdrop').classList.remove('open');
    currentTaskId = null;
  }

  function doApprove(id) {
    const t = TaskFilters.byId(id);
    if (!t) return;
    const prev = t.approval_state;
    t.approval_state = 'human-approved';
    notifyMutated();
    showSharedToast(`Approved “${truncate(t.title, 40)}”`, () => { t.approval_state = prev; notifyMutated(); });
  }
  function doApproveAndSend(id) {
    const t = TaskFilters.byId(id);
    if (!t) return;
    const prevApproval = t.approval_state;
    const prevStatus = t.status;
    t.approval_state = 'human-approved';
    t.status = 'completed';
    notifyMutated();
    showSharedToast(`Sent — “${truncate(t.title, 40)}” auto-closed`, () => { t.approval_state = prevApproval; t.status = prevStatus; notifyMutated(); });
  }
  function doDismiss(id) {
    const t = TaskFilters.byId(id);
    if (!t) return;
    const prev = t.status;
    t.status = 'dismissed';
    notifyMutated();
    showSharedToast(`Dismissed “${truncate(t.title, 40)}”`, () => { t.status = prev; notifyMutated(); });
  }

  // ──────────────────────────────────────────────────────────
  //  Evidence popover (same templates as task-board.html)
  // ──────────────────────────────────────────────────────────
  const EVIDENCE_TEMPLATES = {
    message: (label) => `
      <div class="text-[11px] text-mtext3 mb-3">Message thread excerpt · ${label}</div>
      <div class="space-y-3">
        <div class="flex items-start gap-2.5">
          <div class="w-8 h-8 rounded-full bg-chip-orange/20 text-chip-orange flex items-center justify-center text-[10px] font-bold flex-shrink-0">CL</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-xs font-medium text-mtext">Client</span>
              <span class="text-[10px] text-mtext3">${label.includes('·') ? label.split('·')[1].trim() : '2:14 PM'}</span>
            </div>
            <div class="bg-msurface rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-mtext leading-relaxed">
              ${getMessageStub(label)}
            </div>
          </div>
        </div>
      </div>
    `,
    tool: (label) => {
      if (label.toLowerCase().includes('seats.aero')) {
        return `
          <div class="text-[11px] text-mtext3 mb-3">Award search · ${label}</div>
          <div class="bg-mbg border border-mborder rounded-lg overflow-hidden">
            <div class="px-3 py-2 border-b border-mborder bg-msurface/30 text-[11px] text-mtext2 flex items-center justify-between">
              <span>IAD → HND · 2026-04-30 · 2 pax · First</span>
              <span class="font-mono text-msuccess">2 award seats found</span>
            </div>
            <table class="w-full text-xs">
              <thead class="bg-msurface/20 text-mtext3 text-[10px] uppercase tracking-wider">
                <tr><th class="px-3 py-2 text-left">Flight</th><th class="px-3 py-2 text-left">Route</th><th class="px-3 py-2 text-left">Time</th><th class="px-3 py-2 text-left">Cabin</th><th class="px-3 py-2 text-right">Miles</th></tr>
              </thead>
              <tbody class="divide-y divide-mborder">
                <tr><td class="px-3 py-2 font-mono text-mtext">JL061</td><td class="px-3 py-2 text-mtext2">IAD-HND</td><td class="px-3 py-2 text-mtext2">11:55a → 3:35p+1</td><td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] bg-chip-orange/15 text-chip-orange border border-chip-orange/30">First</span></td><td class="px-3 py-2 font-mono text-right text-mamber">82,500</td></tr>
                <tr><td class="px-3 py-2 font-mono text-mtext">JL061</td><td class="px-3 py-2 text-mtext2">IAD-HND</td><td class="px-3 py-2 text-mtext2">11:55a → 3:35p+1</td><td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] bg-mamber/15 text-mamber border border-mamber/30">Business</span></td><td class="px-3 py-2 font-mono text-right text-mamber">65,000</td></tr>
              </tbody>
            </table>
          </div>
        `;
      }
      if (label.toLowerCase().includes('ita') || label.toLowerCase().includes('alt')) {
        return `
          <div class="text-[11px] text-mtext3 mb-3">Alternative routings · ITA Matrix</div>
          <div class="bg-mbg border border-mborder rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between p-2 rounded bg-msurface/30"><span class="text-sm text-mtext"><span class="font-mono">LH444</span> · IAD → MUC → FRA</span><span class="text-[11px] font-mono text-mtext2">+1d · Y avail</span></div>
            <div class="flex items-center justify-between p-2 rounded bg-msurface/30"><span class="text-sm text-mtext"><span class="font-mono">UA960 + LH107</span> · IAD → MUC → FRA</span><span class="text-[11px] font-mono text-mtext2">+8h · Y avail</span></div>
            <div class="flex items-center justify-between p-2 rounded bg-msurface/30"><span class="text-sm text-mtext"><span class="font-mono">LX65 + LX1066</span> · IAD → ZRH → FRA</span><span class="text-[11px] font-mono text-mtext2">+14h · J avail</span></div>
          </div>
        `;
      }
      return `<div class="text-[11px] text-mtext3 mb-3">External tool result · ${label}</div><div class="bg-mbg border border-mborder rounded-lg p-4 text-sm text-mtext2">Generic tool result panel. In production this opens the corresponding tool view.</div>`;
    },
    email: (label) => `
      <div class="text-[11px] text-mtext3 mb-3">Vendor / system notification · ${label}</div>
      <div class="bg-mbg border border-mborder rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-mborder bg-msurface/30">
          <div class="text-[10px] uppercase tracking-wider text-mtext3 mb-0.5">From</div>
          <div class="text-sm text-mtext">${getEmailSender(label)}</div>
          <div class="text-[10px] uppercase tracking-wider text-mtext3 mt-2 mb-0.5">Subject</div>
          <div class="text-sm text-mtext">${getEmailSubject(label)}</div>
        </div>
        <div class="p-4 text-sm text-mtext2 leading-relaxed">${getEmailBody(label)}</div>
      </div>
    `,
    page: (label) => `
      <div class="text-[11px] text-mtext3 mb-3">Internal page · ${label}</div>
      <div class="bg-mbg border border-mborder rounded-lg p-4">
        <div class="flex items-start justify-between mb-3 pb-3 border-b border-mborder">
          <div>
            <div class="text-base font-semibold text-mtext">${label}</div>
            <div class="text-[11px] text-mtext3 mt-0.5">${getPageMeta(label)}</div>
          </div>
          <span class="text-[10px] font-mono text-mborderh">cc://${label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs">
          ${getPageFields(label).map(f => `<div><div class="text-[10px] uppercase tracking-wider text-mtext3">${f[0]}</div><div class="text-mtext2 mt-0.5">${f[1]}</div></div>`).join('')}
        </div>
      </div>
    `,
    dashboard: (label) => `
      <div class="text-[11px] text-mtext3 mb-3">Dashboard · ${label}</div>
      <div class="bg-mbg border border-mborder rounded-lg p-4">${getDashboardContent(label)}</div>
    `,
  };

  function classifyEvidence(label) {
    const l = label.toLowerCase();
    if (/thread|msg|message|sent message|draft preview/.test(l)) return 'message';
    if (/seats\.aero|ita matrix|alt flights|award search/.test(l)) return 'tool';
    if (/email|alert|advisory|ticket|notification/.test(l)) return 'email';
    if (/dashboard|chart/.test(l)) return 'dashboard';
    return 'page';
  }

  function getMessageStub(label) {
    const l = label.toLowerCase();
    if (l.includes('greer')) return 'Hey Maya — quick one. Saw on Seats.aero that JAL First is open for our Apr 30. Any chance we can grab those seats? Happy to use points.';
    if (l.includes('patel')) return 'We need 4 villas for Tuscany Jun 22–Jul 4. Party of 8 plus a dog. Repeat clients of yours from last year.';
    if (l.includes('halverson')) return 'No more Bali pings for 6 months please, we just got back. Will reach out when ready to plan the next one.';
    if (l.includes('bowman')) return 'Following up on the Patagonia deposit — payment will go through tomorrow latest. Sorry for the delay.';
    return 'Sample client message excerpt. Full thread accessible via the conversation surface.';
  }
  function getEmailSender(label) {
    const l = label.toLowerCase();
    if (l.includes('como')) return 'reservations@comohotels.com · Como Shambhala Estate';
    if (l.includes('lh') || l.includes('lufthansa')) return 'disruption-ops@lufthansa.com · Lufthansa Disruption Notification';
    if (l.includes('state dept') || l.includes('advisory')) return 'travel.advisory@state.gov · US Department of State';
    if (l.includes('ticket')) return 'reissue@lufthansa.com · LH Ticketing';
    return 'system@notifications · Automated alert';
  }
  function getEmailSubject(label) {
    const l = label.toLowerCase();
    if (l.includes('como')) return 'Complimentary upgrade available — Park-Halverson booking #CSE-44102';
    if (l.includes('disruption') || l.includes('lh')) return 'LH441 IAD-FRA cancelled — rebooking options attached';
    if (l.includes('advisory')) return 'Travel Advisory Level 2 — Italy (Naples civil unrest)';
    if (l.includes('ticket')) return 'E-ticket re-issued — confirmation LH/8K3M2P';
    if (l.includes('award')) return 'Award seats opened: ANA F NRT route';
    return 'Notification from upstream system';
  }
  function getEmailBody(label) {
    const l = label.toLowerCase();
    if (l.includes('como')) return 'We\'re delighted to offer your guests the Ocean View Villa as a complimentary upgrade for the duration of their stay. Please confirm with the guests before we re-block the room.';
    if (l.includes('disruption') || (l.includes('lh') && !l.includes('ticket'))) return 'Flight LH441 (IAD-FRA, 18 May 18:30) has been cancelled due to operational reasons. Three rebooking options are available — see attached options table.';
    if (l.includes('advisory')) return 'Level 2 advisory issued for Italy citing civil unrest in Naples. Travelers should exercise increased caution. Affected: 3 active Maestro trips.';
    if (l.includes('ticket')) return 'E-ticket has been successfully re-issued for passenger WHITMAN/J on LH444 IAD-MUC-FRA dated 19 May. Confirmation: LH/8K3M2P.';
    return 'Notification body content. In production the full source document opens here.';
  }
  function getPageMeta(label) {
    const l = label.toLowerCase();
    if (l.includes('trip')) return 'Trip · status: confirmed · last updated 2h ago';
    if (l.includes('profile')) return 'Client profile · 3 past trips · VVIP tier';
    if (l.includes('supplier') || l.includes('vendor')) return 'Supplier · vetted · 12 past bookings';
    if (l.includes('invoice')) return 'Invoice · status: sent · due in 6 days';
    return 'Internal record';
  }
  function getPageFields(label) {
    const l = label.toLowerCase();
    if (l.includes('castelli')) return [['Destination','Tokyo, JP'],['Dates','May 25 – Jun 2'],['Party','2 adults'],['Property','Aman Tokyo'],['Owner','Maya Chen'],['Confirmation','#AT-44512']];
    if (l.includes('park-halverson')) return [['Destination','Bali, ID'],['Dates','May 14 – May 24'],['Party','2 adults · honeymoon'],['Property','Como Shambhala Estate'],['Owner','Maya Chen'],['Confirmation','#CSE-44102']];
    if (l.includes('whitman') && l.includes('tuscany')) return [['Destination','Tuscany, IT'],['Dates','Mar 2026'],['Party','4 adults'],['Property','Borgo San Felice'],['Status','Completed']];
    if (l.includes('whitman')) return [['Cabin pref','First only ≥7hr transatlantic'],['Hotels','Aman, Como, Belmond preferred'],['Allergies','Shellfish (severe)'],['Past trips','5 with Maestro']];
    if (l.includes('greer')) return [['Cabin pref','JAL First / ANA First for Asia routes'],['VVIP since','2023'],['Birthday','May 20'],['Past trips','3 with Maestro'],['Family','Sarah, Mike, Henry (4)']];
    if (l.includes('invoice')) return [['Invoice #','INV-3402'],['Amount','$8,400 USD'],['Sent','May 7, 2026'],['Due','May 21, 2026'],['Status','Sent · 1 reminder']];
    return [['Status','Active'],['Last updated','2h ago']];
  }
  function getDashboardContent(label) {
    const l = label.toLowerCase();
    if (l.includes('sla')) return `
      <div class="text-[10px] uppercase tracking-wider text-mtext3 mb-3">SLA timers · VVIP threshold = 2h</div>
      <div class="space-y-2">
        <div class="flex items-center gap-3"><span class="text-xs text-mtext2 flex-1">Greer family · WhatsApp</span><div class="flex-1 bg-msurface rounded-full h-2 overflow-hidden"><div class="h-full bg-mdanger" style="width: 82%"></div></div><span class="text-[11px] font-mono text-mdanger">1h 38m</span></div>
        <div class="flex items-center gap-3"><span class="text-xs text-mtext2 flex-1">Whitman · Stream Chat</span><div class="flex-1 bg-msurface rounded-full h-2 overflow-hidden"><div class="h-full bg-mamber" style="width: 45%"></div></div><span class="text-[11px] font-mono text-mamber">54m</span></div>
      </div>
    `;
    return `<div class="text-sm text-mtext2">Dashboard view. Live chart renders here in production.</div>`;
  }

  function openEvidence(label) {
    const kind = classifyEvidence(label);
    const template = EVIDENCE_TEMPLATES[kind];
    if (!template) return;
    document.getElementById('shared-evidence-kind').textContent = ({ message: 'Message thread', tool: 'Tool result', email: 'Email / notification', page: 'Internal page', dashboard: 'Dashboard' })[kind];
    document.getElementById('shared-evidence-title').textContent = label;
    document.getElementById('shared-evidence-body').innerHTML = template(label);
    document.getElementById('shared-evidence-backdrop').classList.add('open');
  }
  function closeEvidence() {
    document.getElementById('shared-evidence-backdrop').classList.remove('open');
  }

  // ──────────────────────────────────────────────────────────
  //  Toast
  // ──────────────────────────────────────────────────────────
  function showSharedToast(msg, undoFn) {
    const container = document.getElementById('shared-toast-container');
    const toast = document.createElement('div');
    toast.className = 'shared-toast bg-msurface border border-mborder rounded-lg shadow-xl px-4 py-2.5 min-w-[280px] max-w-[420px] flex items-center gap-3';
    toast.innerHTML = `
      <div class="flex-1 text-sm text-mtext">${msg}</div>
      ${undoFn ? `<button class="text-xs font-medium text-orange-400 hover:text-orange-300">Undo</button>` : ''}
    `;
    container.appendChild(toast);
    if (undoFn) {
      const undoBtn = toast.querySelector('button');
      undoBtn.addEventListener('click', () => { undoFn(); toast.remove(); });
    }
    setTimeout(() => { toast.style.transition = 'opacity .25s'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 280); }, 4000);
  }

  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  // ──────────────────────────────────────────────────────────
  //  Helpers + global click delegation
  // ──────────────────────────────────────────────────────────
  function linkifyTaskIds(text) {
    if (!text) return '';
    return String(text).replace(/(tsk-\d{3,})/g, '<a href="task-board.html#task=$1" class="task-id-link font-mono text-orange-400 hover:text-orange-300 hover:underline underline-offset-2">$1</a>');
  }
  window.linkifyTaskIds = linkifyTaskIds;
  window.openTaskDrawer = openTaskDrawer;
  window.closeTaskDrawer = closeTaskDrawer;
  window.openEvidence = openEvidence;
  window.closeEvidence = closeEvidence;
  window.showSharedToast = showSharedToast;

  // Global delegation: .task-id-link → open drawer in place
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.task-id-link');
    if (a) {
      const m = (a.getAttribute('href') || '').match(/task=([^&]+)/);
      if (m) {
        e.preventDefault();
        e.stopPropagation();
        openTaskDrawer(m[1]);
      }
      return;
    }
    const ev = e.target.closest('a.evidence-chip');
    if (ev && ev.dataset.label) {
      e.preventDefault();
      e.stopPropagation();
      openEvidence(ev.dataset.label);
    }
  });

  document.addEventListener('DOMContentLoaded', injectMarkup);
})();
