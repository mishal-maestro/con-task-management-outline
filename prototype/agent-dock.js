// agent-dock.js — the AgentDockedPanel (PRD §4, E6).
// A shared, self-injecting right-side sheet that mounts over ANY Conductor
// page via Cmd-K. Carries the same Thread shape as the full Agent tab.
//
// Requires agent-data.js on the page. Exposes window.openAgentDock() / closeAgentDock().

(function () {
  if (window.__agentDockLoaded) return;
  window.__agentDockLoaded = true;

  function compactThread() {
    if (typeof AGENT_RECS === 'undefined') {
      return '<div style="font-size:12px;color:rgb(var(--maestro-text-tertiary));">agent-data.js not loaded on this page.</div>';
    }
    const recRows = ['rec-aman', 'rec-hoshinoya'].map(rid => {
      const r = AGENT_RECS[rid];
      return `<div class="adock-rec">
        <div style="display:flex;justify-content:space-between;gap:8px;">
          <span style="font-size:12px;font-weight:600;color:rgb(var(--maestro-text-primary));">${r.name}</span>
          <span style="font-size:11px;color:rgb(var(--maestro-text-secondary));">${r.rate}</span>
        </div>
        <div style="font-size:10px;color:rgb(var(--maestro-text-tertiary));">${r.room} · ${r.area}</div>
        <div style="margin-top:5px;"><span class="adock-src">◈ ${r.source.id}</span></div>
      </div>`;
    }).join('');
    return `
      <div class="adock-msg"><div class="adock-av advisor">MC</div>
        <div style="flex:1;min-width:0;"><div class="adock-name">Maya Chen · advisor</div>
          <div class="adock-bubble adv">find a suite at Aman for these dates</div></div></div>
      <div class="adock-msg"><div class="adock-av ai">AI</div>
        <div style="flex:1;min-width:0;"><div class="adock-name">Maestro AI</div>
          <div class="adock-bubble">Three grounded options for the Khans — each cites a source.</div>
          <div style="margin-top:6px;display:flex;flex-direction:column;gap:6px;">${recRows}</div>
          <div style="margin-top:7px;font-size:11px;color:rgb(var(--maestro-text-secondary));line-height:1.5;">Aman Tokyo added to the trip · 1 messaging task + 1 human task created.</div>
          <a href="agent.html#thread=th-aman" style="display:inline-block;margin-top:8px;font-size:12px;color:rgb(var(--maestro-accent));">Open in the full Agent tab →</a>
        </div></div>`;
  }

  function inject() {
    if (document.getElementById('agent-dock')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="agent-dock-backdrop" class="adock-mb"></div>
      <aside id="agent-dock" class="adock">
        <div class="adock-head">
          <div class="adock-av ai" style="width:28px;height:28px;">AI</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;color:rgb(var(--maestro-text-primary));">Maestro AI</div>
            <div style="font-size:10px;color:rgb(var(--maestro-text-tertiary));">docked · same Thread shape (PRD §4)</div>
          </div>
          <span class="adock-badge">hotel-search</span>
          <button id="agent-dock-close" class="adock-x" aria-label="Close">&times;</button>
        </div>
        <div class="adock-ctx">Khan Family — Tokyo · summoned over this page with ⌘K</div>
        <div class="adock-body">${compactThread()}</div>
        <div class="adock-composer">
          <input type="text" placeholder="Message the agent…" />
          <button onclick="(window.showSharedToast||function(){})('Composer is a mock in this prototype.')">Send</button>
        </div>
      </aside>
      <style>
        .adock-mb { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 75; opacity: 0; pointer-events: none; transition: opacity .15s; }
        .adock-mb.open { opacity: 1; pointer-events: auto; }
        .adock { position: fixed; top: 0; right: 0; height: 100%; width: 420px; max-width: 92vw; background: rgb(var(--maestro-card)); border-left: 1px solid rgb(var(--maestro-border)); z-index: 80; transform: translateX(100%); transition: transform .22s ease-out; display: flex; flex-direction: column; box-shadow: -20px 0 50px rgba(0,0,0,.45); }
        .adock.open { transform: translateX(0); }
        .adock-head { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid rgb(var(--maestro-border)); flex-shrink: 0; }
        .adock-av { width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
        .adock-av.ai { background: rgb(var(--maestro-accent)); color: #fff; }
        .adock-av.advisor { background: rgb(var(--maestro-surface-raised)); color: rgb(var(--maestro-text-primary)); }
        .adock-badge { font-size: 9px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; text-transform: uppercase; letter-spacing: .5px; color: rgb(var(--maestro-info)); background: rgb(var(--maestro-info) / .15); border-radius: 3px; padding: 2px 6px; }
        .adock-x { background: none; border: none; color: rgb(var(--maestro-text-tertiary)); font-size: 20px; line-height: 1; cursor: pointer; padding: 0 4px; }
        .adock-x:hover { color: rgb(var(--maestro-text-primary)); }
        .adock-ctx { padding: 7px 14px; background: rgb(var(--maestro-bg) / .6); border-bottom: 1px solid rgb(var(--maestro-border)); font-size: 11px; color: rgb(var(--maestro-text-tertiary)); flex-shrink: 0; }
        .adock-body { flex: 1; overflow-y: auto; padding: 14px; }
        .adock-msg { display: flex; gap: 9px; margin-bottom: 14px; }
        .adock-name { font-size: 10px; font-weight: 600; color: rgb(var(--maestro-text-secondary)); margin-bottom: 3px; }
        .adock-bubble { background: rgb(var(--maestro-surface)); border: 1px solid rgb(var(--maestro-border)); border-radius: 9px; padding: 8px 11px; font-size: 12px; color: rgb(var(--maestro-text-primary)); line-height: 1.5; }
        .adock-bubble.adv { background: rgb(var(--maestro-card)); }
        .adock-rec { background: rgb(var(--maestro-bg)); border: 1px solid rgb(var(--maestro-border)); border-radius: 8px; padding: 9px; }
        .adock-src { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9px; color: rgb(var(--maestro-success)); background: rgb(var(--maestro-success) / .1); border: 1px solid rgb(var(--maestro-success) / .3); border-radius: 4px; padding: 2px 6px; }
        .adock-composer { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid rgb(var(--maestro-border)); flex-shrink: 0; }
        .adock-composer input { flex: 1; background: rgb(var(--maestro-bg)); border: 1px solid rgb(var(--maestro-border)); border-radius: 7px; padding: 7px 10px; font-size: 12px; color: rgb(var(--maestro-text-secondary)); outline: none; }
        .adock-composer button { background: rgb(var(--maestro-accent)); color: #fff; border: none; border-radius: 7px; padding: 7px 13px; font-size: 12px; cursor: pointer; }
      </style>`;
    document.body.appendChild(wrap);
    document.getElementById('agent-dock-backdrop').addEventListener('click', closeAgentDock);
    document.getElementById('agent-dock-close').addEventListener('click', closeAgentDock);
  }

  function openAgentDock() {
    document.getElementById('agent-dock').classList.add('open');
    document.getElementById('agent-dock-backdrop').classList.add('open');
  }
  function closeAgentDock() {
    const d = document.getElementById('agent-dock');
    if (d) d.classList.remove('open');
    const b = document.getElementById('agent-dock-backdrop');
    if (b) b.classList.remove('open');
  }
  function toggleAgentDock() {
    document.getElementById('agent-dock').classList.contains('open') ? closeAgentDock() : openAgentDock();
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); toggleAgentDock(); }
    if (e.key === 'Escape') {
      const d = document.getElementById('agent-dock');
      if (d && d.classList.contains('open')) closeAgentDock();
    }
  });

  window.openAgentDock = openAgentDock;
  window.closeAgentDock = closeAgentDock;
  document.addEventListener('DOMContentLoaded', inject);
})();
