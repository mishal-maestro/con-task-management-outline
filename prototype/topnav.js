// topnav.js — shared top nav bar for the app-mode prototype pages
// (Overview, Trips, Trip detail, Chat/inline-create, Tasks)
//
// Each page includes:
//   <div id="topnav-root"></div>
//   <script>window.CURRENT_APP_TAB = 'overview' | 'trips' | 'chat' | 'agent' | 'tasks';</script>
//   <script src="topnav.js"></script>
//
// Counts are computed live from TASKS fixture in task-data.js.
// "AI pending" = approval_state === 'pending-review'.
// Distributed counts (per PRD §7.2 + Mishal's call): each tab shows the pending
// count for items relevant to that surface, instead of one global Review tab.

(function () {
  function aiPending() {
    return TASKS.filter(t => t.approval_state === 'pending-review' && t.status !== 'dismissed');
  }
  function chatPending() {
    return aiPending().filter(t => t.primary_context.type === 'message-conversation' || t.task_type === 'messaging');
  }
  function tripPending() {
    return aiPending().filter(t => t.primary_context.type === 'trip');
  }
  function memberPending() {
    return aiPending().filter(t => t.primary_context.type === 'account-member');
  }

  const TAB_DEFS = [
    {
      id: 'overview', label: 'Overview', href: 'overview.html',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>',
      getCount: () => aiPending().length, // homepage rolls up everything
    },
    {
      id: 'trips', label: 'Trips', href: 'trips.html',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>',
      getCount: () => tripPending().length,
    },
    {
      id: 'chat', label: 'Chat', href: 'inline-create.html',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
      getCount: () => chatPending().length,
    },
    {
      id: 'agent', label: 'Agent', href: '#',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
      getCount: () => 0,
    },
    {
      id: 'tasks', label: 'Tasks', href: 'task-board.html#tab=needs-review',
      icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
      getCount: () => aiPending().length, // Tasks is the catch-all
    },
  ];

  function renderBadge(count) {
    if (!count) return '';
    return `<span class="ml-1.5 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-mono font-semibold">${count}</span>`;
  }

  function initTopNav() {
    const root = document.getElementById('topnav-root');
    if (!root) return;
    const active = window.CURRENT_APP_TAB || 'overview';
    const html = `
      <header class="h-12 border-b border-slate-800 bg-slate-950 flex items-center px-4 flex-shrink-0 sticky top-0 z-50">
        <div class="flex items-center gap-1.5 mr-6">
          <a href="overview.html" class="text-slate-100 font-semibold text-base tracking-tight hover:text-orange-300 transition-colors">maestro</a>
        </div>
        <nav class="flex items-center flex-1 justify-center">
          ${TAB_DEFS.map(t => {
            const cnt = t.getCount();
            const isActive = t.id === active;
            return `
              <a href="${t.href}" class="top-tab ${isActive ? 'active' : ''}" data-tab="${t.id}">
                ${t.icon}
                <span>${t.label}</span>
                ${renderBadge(cnt)}
              </a>
            `;
          }).join('')}
        </nav>
        <div class="flex items-center gap-2 text-slate-500">
          <a href="../index.html" class="text-[11px] text-slate-500 hover:text-orange-300 transition-colors px-2 py-1 rounded hover:bg-slate-800" title="Back to the PRD outline">↗ Outline</a>
          <button class="p-1.5 hover:text-slate-300 transition-colors" title="Notifications"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg></button>
          <button class="p-1.5 hover:text-slate-300 transition-colors" title="Settings"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
        </div>
      </header>
    `;
    root.innerHTML = html;
  }

  // Expose helpers globally so pages can use them too
  window.TopNav = { aiPending, chatPending, tripPending, memberPending, init: initTopNav };

  document.addEventListener('DOMContentLoaded', initTopNav);
})();
