// nav.js -- Sidebar navigation for Conductor Task Management prototype

function initNav() {
  const root = document.getElementById('nav-root');
  if (!root) return;

  const currentPage = window.CURRENT_PAGE || 'index';
  // Path-prefix shim: when the browser's base URL is a subfolder (e.g. /prototype/),
  // rewrite hrefs so sibling pages resolve correctly. Keeps data.js paths root-relative.
  //
  // The browser's base path for relative URL resolution is the URL up to and
  // including the LAST `/`. So:
  //   /prototype           → base = /         (no trailing slash; "prototype" is the filename)
  //   /prototype/          → base = /prototype/
  //   /prototype/task-board → base = /prototype/   ("task-board" is the filename)
  //   /prototype/index.html → base = /prototype/
  // We need to rewrite only when the base is inside a subfolder.
  const basePath = window.location.pathname.endsWith('/')
    ? window.location.pathname
    : window.location.pathname.replace(/[^/]*$/, '');
  const baseSegments = basePath.split('/').filter(Boolean);
  const inSubFolder = baseSegments.length > 0;
  const currentFolder = inSubFolder ? baseSegments[baseSegments.length - 1] : null;
  function rewriteHref(href) {
    if (!inSubFolder) return href;
    if (href.startsWith(currentFolder + '/')) return href.slice(currentFolder.length + 1);
    return '../' + href;
  }

  function renderLink(item, isSubItem) {
    const active = currentPage === item.id;
    const padding = isSubItem ? 'pl-10 pr-5' : 'px-5';
    return `
      <a href="${rewriteHref(item.href)}"
         class="flex items-center gap-3 ${padding} py-2.5 text-sm transition-colors ${active
           ? 'text-slate-100 bg-slate-800/50 border-l-2 border-orange-500'
           : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-2 border-transparent'}">
        <span class="font-mono text-[11px] text-slate-500 ${active ? 'text-orange-500' : ''} w-12 flex-shrink-0">${item.section || ''}</span>
        <span>${item.label}</span>
      </a>
    `;
  }

  function renderGroup(group) {
    const hasActive = group.items.some(item => item.id === currentPage);
    const expanded = hasActive;
    return `
      <div class="nav-group" data-group-id="${group.id}">
        <button type="button" class="nav-group-toggle flex items-center gap-3 w-full px-5 py-2.5 text-sm transition-colors border-l-2 border-transparent ${hasActive ? 'text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}"
                data-expanded="${expanded}">
          <span class="font-mono text-[11px] text-slate-500 w-12 flex-shrink-0">${group.section || ''}</span>
          <span class="flex-1 text-left">${group.label}</span>
          <svg class="nav-chevron w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div class="nav-group-items ${expanded ? '' : 'hidden'}">
          ${group.items.map(item => renderLink(item, true)).join('')}
        </div>
      </div>
    `;
  }

  const navItemsHtml = NAV_CONFIG.map(entry => {
    if (entry.type === 'group') return renderGroup(entry);
    return renderLink(entry, false);
  }).join('');

  const navHtml = `
    <aside id="sidebar" class="fixed left-0 top-0 h-full w-[260px] bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      <!-- Header -->
      <div class="p-5 border-b border-slate-800">
        <h1 class="text-slate-100 font-semibold text-base">${PAGE_DATA.title}</h1>
        <p class="text-slate-500 text-xs mt-0.5 font-mono">${PAGE_DATA.version}</p>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 py-3 overflow-y-auto">
        ${navItemsHtml}
      </nav>

      <!-- External Link -->
      <div class="p-4 border-t border-slate-800">
        <a href="${PAGE_DATA.notionUrl}" target="_blank" class="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          Notion outline (source of truth)
        </a>
      </div>
    </aside>

    <!-- Mobile hamburger -->
    <button id="nav-toggle" class="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>

    <!-- Mobile overlay -->
    <div id="nav-overlay" class="lg:hidden fixed inset-0 bg-black/50 z-40 hidden"></div>
  `;

  root.innerHTML = navHtml;

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('nav-overlay');

  if (toggle && sidebar && overlay) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    });
  }

  // Group toggle (collapsible Appendix and Execution sections)
  document.querySelectorAll('.nav-group-toggle').forEach(t => {
    t.addEventListener('click', () => {
      const expanded = t.dataset.expanded === 'true';
      const newExpanded = !expanded;
      t.dataset.expanded = String(newExpanded);
      const items = t.nextElementSibling;
      const chevron = t.querySelector('.nav-chevron');
      if (newExpanded) {
        items.classList.remove('hidden');
        chevron.classList.add('rotate-90');
      } else {
        items.classList.add('hidden');
        chevron.classList.remove('rotate-90');
      }
    });
  });
}

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', initNav);
