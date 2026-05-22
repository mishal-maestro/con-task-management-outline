// agent-data.js — Agent Mode mock data for the Conductor Agent tab (agent.html).
// The Khan/Tokyo trip is the fully-worked example; other projects carry
// believable lighter threads. Tasks the agent CREATES live in task-data.js
// (tsk-026..028, tagged agent_project) so they also surface on the Tasks board.

const AGENT_PROJECTS = [
  { id: 'p-khan',      name: 'Khan Family — Tokyo',   kind: 'trip',   meta: 'Sep 12–19, 2026 · 7 nights' },
  { id: 'p-okafor',    name: 'Okafor — Amalfi Coast', kind: 'trip',   meta: 'Jun 3–12, 2026' },
  { id: 'p-lindqvist', name: 'Lindqvist Household',   kind: 'client', meta: '4 trips on file' },
  { id: 'p-mehta',     name: 'Mehta — Patagonia',     kind: 'trip',   meta: 'Nov 7–18, 2026' },
];

// `ts` = minutes-ago, used only for recency sorting (lower = more recent).
// New threads created in-session get a negative ts so they sort to the top.
const AGENT_THREADS = [
  { id: 'th-aman',      project: 'p-khan',      title: 'find a suite at Aman for these dates', skill: 'hotel-search', status: 'open',     updated: 'just now',  ts: 2,    worked: true },
  { id: 'th-hakone',    project: 'p-khan',      title: 'ryokan options for the Hakone leg',    skill: 'hotel-search', status: 'paused',   updated: '2h ago',   ts: 120 },
  { id: 'th-shortlist', project: 'p-khan',      title: 'first Tokyo hotel shortlist',          skill: 'hotel-search', status: 'archived', updated: 'yesterday', ts: 1440 },
  { id: 'th-okafor',    project: 'p-okafor',    title: 'cliffside hotels near the ferry',      skill: 'hotel-search', status: 'open',     updated: '1h ago',   ts: 60 },
  { id: 'th-lind',      project: 'p-lindqvist', title: 'February ski-chalet shortlist',        skill: 'hotel-search', status: 'open',     updated: '3h ago',   ts: 180 },
  { id: 'th-mehta',     project: 'p-mehta',     title: 'lodge near Torres del Paine',          skill: 'hotel-search', status: 'paused',   updated: 'yesterday', ts: 1440 },
];

// Grounded hotel recommendations (the th-aman thread).
const AGENT_RECS = {
  'rec-aman': {
    id: 'rec-aman', name: 'Aman Tokyo', room: 'Pool Suite', area: 'Otemachi',
    rate: '$2,950 / night', total: '$20,650 · 7 nights', lead: true,
    why: 'The Aman the Khans named. Otemachi Tower top floors; 30m pool + onsen match their wind-down pattern.',
    source: { id: 'di_8814', label: 'destination_entries / di_8814',
              detail: '12 community signals · 4 testimonials · prior Aman stay on file (Aman Kyoto, 2024)' },
  },
  'rec-hoshinoya': {
    id: 'rec-hoshinoya', name: 'Hoshinoya Tokyo', room: 'Kiku Suite', area: 'Otemachi',
    rate: '$1,780 / night', total: '$12,460 · 7 nights',
    why: 'Ryokan-style luxury, same district as Aman. Tatami suites + in-house onsen; fits the cultural-immersion note.',
    source: { id: 'di_5520', label: 'destination_entries / di_5520',
              detail: '9 community signals · 6 testimonials' },
  },
  'rec-janu': {
    id: 'rec-janu', name: 'Janu Tokyo', room: 'Deluxe Room', area: 'Azabudai Hills',
    rate: '$1,420 / night', total: '$9,940 · 7 nights',
    why: 'Aman sister brand, opened 2024. Wellness-forward; quieter Azabudai Hills setting.',
    source: { id: 'di_9077', label: 'destination_entries / di_9077',
              detail: '5 community signals · 2 testimonials' },
  },
};

// Helper-agent findings. target: a rec id, or 'set' for the recommendation set.
const AGENT_FINDINGS = {
  'f-exclusion': {
    id: 'f-exclusion', helper: 'exclusion-check', kind: 'Sub-agent', severity: 'pass', target: 'set',
    summary: 'no exclusion violation',
    detail: 'Candidate set checked against client exclusions before emit. "No Maybourne" — none of the 3 recs are Maybourne properties.',
  },
  'f-factual': {
    id: 'f-factual', helper: 'factual-check', kind: 'Independent', severity: 'important', target: 'rec-janu',
    summary: 'rate is for a Deluxe Room, not a suite',
    detail: 'The ask was for a suite. The Janu Tokyo rec quotes a Deluxe Room ($1,420). Suite category at Janu starts ~$2,600/night — confirm before presenting.',
  },
  'f-intent': {
    id: 'f-intent', helper: 'intent-match-verifier', kind: 'Independent', severity: 'important', target: 'set',
    summary: 'connecting-suite coverage incomplete',
    detail: 'The ask implies a suite for the whole family (2 adults + 2 children). None of the 3 recs confirm connecting-suite availability for the children. Coverage < 1.0.',
  },
};

// Operator-curated memory (ClientFacts), per project. Memory is project-scoped —
// each trip / client has its own space. `group` drives the grouped display; an
// `exclusion` fact is a hard "never". These facts double as the agent's standing
// instructions for the trip / client (no separate "instructions" surface).
const AGENT_MEMORY = {
  'p-khan': [
    { id: 'cf1', body: 'Anniversary trip — splurge approved by the household principal.', kind: 'operator', group: 'trip', note: 'Maya · 2w ago' },
    { id: 'cf2', body: 'No Maybourne properties.', kind: 'operator', group: 'constraint', exclusion: true, note: 'Maya · 2w ago' },
    { id: 'cf3', body: 'Prefers suites with a wind-down ritual on-site: onsen, spa or pool.', kind: 'operator', group: 'preference', note: 'Maya · 2w ago' },
    { id: 'cf4', body: 'Travels with two children, ages 8 and 11 — connecting space matters.', kind: 'operator', group: 'logistics', note: 'Maya · 2w ago' },
    { id: 'cf5', body: 'First family trip to Japan — leans cultural immersion over pure luxury.', kind: 'operator', group: 'preference', note: 'Maya · 5d ago' },
    { id: 'cf6', body: 'No red-eye arrivals with the children — daytime flights only.', kind: 'operator', group: 'constraint', note: 'Maya · 5d ago' },
  ],
  'p-okafor':    [ { id: 'of1', body: 'Wants sea views; prone to motion sickness on ferries.', kind: 'operator', group: 'preference', note: 'Maya · 1w ago' } ],
  'p-lindqvist': [ { id: 'lf1', body: 'Ski-in / ski-out is non-negotiable.', kind: 'operator', group: 'constraint', note: 'Sam · 3w ago' },
                   { id: 'lf2', body: 'Household of 6 — needs at least 4 bedrooms.', kind: 'operator', group: 'logistics', note: 'Sam · 3w ago' } ],
  'p-mehta':     [ { id: 'mf1', body: 'Active trip — hiking-focused; early starts are fine.', kind: 'operator', group: 'preference', note: 'Maya · 1w ago' } ],
};

// conversation_insights — things the agent noticed across threads, pending operator
// review. Promote → becomes an operator ClientFact; Dismiss → discarded. The agent
// suggests; the operator stays the authority on what memory holds (PRD §5, E5).
const AGENT_INSIGHTS = [
  { id: 'ai1', project: 'p-khan', group: 'preference',
    body: 'Both suites the advisor leaned toward were in Otemachi — the family gravitates to that district.',
    source: 'th-aman', sourceLabel: 'find a suite at Aman for these dates' },
  { id: 'ai2', project: 'p-khan', group: 'logistics',
    body: 'Connecting-suite availability for the children keeps surfacing as the deciding factor — worth a standing requirement.',
    source: 'th-aman', sourceLabel: 'find a suite at Aman for these dates' },
  { id: 'ai3', project: 'p-okafor', group: 'constraint',
    body: 'Walkability to the Positano ferry is being treated as a hard filter, not a nice-to-have.',
    source: 'th-okafor', sourceLabel: 'cliffside hotels walkable to the Positano ferry' },
];

// Pre-loaded project context — the trip facts + org knowledge the agent grounds on.
// Surfaced in the context panel; analogous to a Claude project's knowledge.
const AGENT_CONTEXT = {
  'p-khan': {
    trip: ['Khan Family — Tokyo', 'Sep 12–19, 2026 · 7 nights', '2 adults + 2 children'],
    org:  ['Otemachi is the firm default for first Tokyo luxury stays', 'Aman Kyoto on file (2024) — onsen rated 5/5'],
  },
  'p-okafor': {
    trip: ['Okafor — Amalfi Coast', 'Jun 3–12, 2026 · 9 nights', '2 adults'],
    org:  ['Positano ferry access is the usual constraint for cliffside stays', 'Le Sirenuse on file (2023) — sea-view terrace rated 5/5'],
  },
  'p-lindqvist': {
    trip: ['Lindqvist Household', '4 trips on file · returning client', 'Household of 6'],
    org:  ['Ski-in / ski-out is the firm default for this household', 'Verbier chalet booked twice — both repeat-rated'],
  },
  'p-mehta': {
    trip: ['Mehta — Patagonia', 'Nov 7–18, 2026 · 11 nights', '2 adults'],
    org:  ['Torres del Paine lodges book out 6+ months ahead', 'Explora Patagonia on file (2022) — guided hikes rated 5/5'],
  },
};

// Thread messages. th-aman is the fully-worked, finished conversation.
const AGENT_MESSAGES = {
  'th-aman': [
    { role: 'system', kind: 'context', body: 'Thread opened · skill <b>hotel-search</b> · via ⌘K from the Khan Family — Tokyo trip. Context pre-loaded: TripContext, ClientFacts (4), OrgInsights (2).' },
    { role: 'advisor', kind: 'text', body: 'find a suite at Aman for these dates' },
    { role: 'ai', kind: 'text', body: 'Searching now. Working from these assumptions: <b>Sep 12–19</b> · <b>2 adults + 2 children</b> · <b>Suite</b> · budget per ClientFacts (splurge approved).' },
    { role: 'system', kind: 'check', findingId: 'f-exclusion' },
    { role: 'ai', kind: 'recs', body: 'Three grounded options for the Khans — each cites the destination_entries row that backed it.', recs: ['rec-aman', 'rec-hoshinoya', 'rec-janu'], findings: ['f-factual', 'f-intent'] },
    { role: 'ai', kind: 'text', body: 'intent-match-verifier flagged connecting-suite coverage for the children. I\'ve opened a <b>human task</b> to confirm — deep-linked to this thread.' },
    { role: 'system', kind: 'event', eventKind: 'task', body: 'Canonical task created — Book Aman Tokyo · Pool Suite', taskId: 'tsk-026' },
    { role: 'system', kind: 'event', eventKind: 'trip', body: 'Itinerary component added to Khan Family — Tokyo' },
    { role: 'ai', kind: 'actions', body: 'The Aman Tokyo suite is on the trip. Next actions —', actions: ['Book via Virtuoso portal', 'Draft inquiry to Aman', 'Create manual task'] },
    { role: 'system', kind: 'event', eventKind: 'task', body: 'messaging task created — Draft inquiry to Aman Tokyo', taskId: 'tsk-027' },
    { role: 'ai', kind: 'draft', body: 'Drafted the supplier inquiry — the advisor reviewed and sent it.', taskId: 'tsk-027', sent: true,
      draftText: 'Dear Aman Tokyo team — we are planning a 7-night stay for a returning Aman family (Sep 12–19, 2026), 2 adults and 2 children (8, 11). We would like to confirm a Pool Suite, and ask whether a connecting suite or adjacent room can be held for the children. Anniversary trip — any in-suite touches would be welcome.' },
  ],
  'th-hakone': [
    { role: 'system', kind: 'context', body: 'Thread opened · skill <b>hotel-search</b> · Hakone leg of the Khan trip.' },
    { role: 'advisor', kind: 'text', body: 'ryokan options near Hakone for the 2 nights after Tokyo' },
    { role: 'ai', kind: 'text', body: 'Paused — waiting on the advisor to confirm whether the family wants a private onsen before I shortlist.' },
  ],
  'th-shortlist': [
    { role: 'system', kind: 'context', body: 'Thread opened · skill <b>hotel-search</b> · archived.' },
    { role: 'advisor', kind: 'text', body: 'first pass — anything good in Tokyo for a family of 4' },
    { role: 'ai', kind: 'text', body: 'Superseded by the focused Aman search. Archived for the record.' },
  ],
  'th-okafor': [
    { role: 'system', kind: 'context', body: 'Thread opened · skill <b>hotel-search</b> · Okafor — Amalfi Coast.' },
    { role: 'advisor', kind: 'text', body: 'cliffside hotels walkable to the Positano ferry' },
    { role: 'ai', kind: 'text', body: 'Working — three grounded options shortlisted; awaiting advisor review.' },
  ],
  'th-lind': [
    { role: 'system', kind: 'context', body: 'Thread opened · skill <b>hotel-search</b> · Lindqvist Household.' },
    { role: 'advisor', kind: 'text', body: 'ski-in / ski-out chalets for February half-term, party of 6' },
    { role: 'ai', kind: 'text', body: 'Working — checking curated chalet inventory for the dates.' },
  ],
  'th-mehta': [
    { role: 'system', kind: 'context', body: 'Thread opened · skill <b>hotel-search</b> · Mehta — Patagonia.' },
    { role: 'advisor', kind: 'text', body: 'lodge near Torres del Paine, hiking focus' },
    { role: 'ai', kind: 'text', body: 'Paused — the advisor is handling the lodge enquiry manually.' },
  ],
};

// Helpers
let _newThreadSeq = 0;
const AgentData = {
  project:    (id) => AGENT_PROJECTS.find(p => p.id === id),
  threadsFor: (pid) => AGENT_THREADS.filter(t => t.project === pid),
  thread:     (id) => AGENT_THREADS.find(t => t.id === id),
  messages:   (tid) => AGENT_MESSAGES[tid] || [],
  memory:     (pid) => AGENT_MEMORY[pid] || [],
  insights:   (pid) => AGENT_INSIGHTS.filter(i => i.project === pid),
  context:    (pid) => AGENT_CONTEXT[pid] || null,
  // Agent-created tasks for a project — read from the shared task layer (task-data.js).
  tasksFor:   (pid) => (typeof TASKS !== 'undefined' ? TASKS.filter(t => t.agent_project === pid) : []),
  // Most-recently-touched threads across all projects (archived excluded).
  recentThreads: (n) => AGENT_THREADS
    .filter(t => t.status !== 'archived')
    .slice()
    .sort((a, b) => (a.ts == null ? 9e9 : a.ts) - (b.ts == null ? 9e9 : b.ts))
    .slice(0, n || 4),
  // Start a new hotel-search thread anchored to a project; seeds the system context line.
  createThread: (pid) => {
    _newThreadSeq += 1;
    const id = 'th-new-' + _newThreadSeq;
    const p = AGENT_PROJECTS.find(x => x.id === pid);
    const memCount = (AGENT_MEMORY[pid] || []).length;
    const orgCount = ((AGENT_CONTEXT[pid] || {}).org || []).length;
    const thread = {
      id, project: pid, title: 'New hotel-search thread', skill: 'hotel-search',
      status: 'open', updated: 'just now', ts: -_newThreadSeq, worked: false, isNew: true,
    };
    AGENT_THREADS.push(thread);
    AGENT_MESSAGES[id] = [
      { role: 'system', kind: 'context',
        body: 'Thread opened · skill <b>hotel-search</b> · ⌘K from ' + (p ? p.name : 'this project')
            + '. Context pre-loaded: TripContext, ClientFacts (' + memCount + '), OrgInsights (' + orgCount + ').' },
    ];
    return thread;
  },
  // Append a message to a thread (used by the new-thread composer echo).
  appendMessage: (tid, msg) => {
    if (!AGENT_MESSAGES[tid]) AGENT_MESSAGES[tid] = [];
    AGENT_MESSAGES[tid].push(msg);
  },
};
