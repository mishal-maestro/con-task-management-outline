// task-data.js — fixture tasks for the Conductor task management prototype.
// Covers all 4 v1 task_types, all routing tiers, all approval states.
// Field shapes per PRD v1.0 §7.2 (canonical task record).

const TEAM = [
  { id: 'mc', name: 'Maya Chen',     role: 'TA',            initials: 'MC', color: 'bg-orange-500/20 text-orange-300' },
  { id: 'js', name: 'Jordan Singh',  role: 'TA',            initials: 'JS', color: 'bg-blue-500/20 text-blue-300'     },
  { id: 'rp', name: 'Rae Park',      role: 'Ops',           initials: 'RP', color: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'tk', name: 'Tomás Kovac',   role: 'Ops Manager',   initials: 'TK', color: 'bg-fuchsia-500/20 text-fuchsia-300' },
  { id: 'ai', name: 'AI · System',   role: 'AI agent',      initials: 'AI', color: 'bg-slate-700 text-slate-300' },
];

function memberById(id) { return TEAM.find(m => m.id === id) || TEAM[0]; }

const TASKS = [
  // ───────────────────────────────────────────────────────
  //  PENDING REVIEW — Review queue surface (8 tasks)
  // ───────────────────────────────────────────────────────
  {
    id: 'tsk-001',
    title: 'Draft reply: confirm JAL First award for Greer–Tokyo',
    task_type: 'messaging', subtype: 'reply-draft',
    status: 'open', approval_state: 'pending-review', routing_tier: 'assist',
    priority: 'medium', primary_owner: 'mc',
    primary_context: { type: 'message-conversation', label: 'Greer family · WhatsApp' },
    origin: 'client-driven', creator: 'AI · Conversation watcher',
    creation_surface: 'composer', due_at: 'in 2h',
    rationale: 'Client asked about JAL First on Apr 30 outbound. Award space confirmed via Seats.aero.',
    evidence: [ { label: 'Seats.aero search', url: '#' }, { label: 'Greer thread · Apr 24', url: '#' } ],
    confidence: 92, age_min: 12, created_at: '12 min ago',
    draft: '"Confirmed — JAL First (JL061) showing 2 award seats Apr 30, IAD → HND. Holding now. Need passport scans by Mon to ticket."',
    activity: [
      { ts: '12 min ago', actor: 'AI · Conversation watcher', event: 'Suggested', detail: 'Confidence 92%' },
      { ts: '12 min ago', actor: 'System',                    event: 'Routed',    detail: 'Assist tier · Greer-Tokyo' },
    ],
  },
  {
    id: 'tsk-002',
    title: 'Suggested follow-up: Halverson hasn\'t replied in 5 days',
    task_type: 'messaging', subtype: 'follow-up-prompt',
    status: 'open', approval_state: 'pending-review', routing_tier: 'assist',
    priority: 'low', primary_owner: 'mc',
    primary_context: { type: 'message-conversation', label: 'Halverson · Stream Chat' },
    origin: 'client-driven', creator: 'AI · Scheduled query',
    creation_surface: 'ops-dashboard', due_at: 'today',
    rationale: 'Halverson last replied May 10 about Croatia villas. 5-day silence after 3 strong leads sent.',
    evidence: [ { label: 'Last thread', url: '#' } ],
    confidence: 78, age_min: 47, created_at: '47 min ago',
    activity: [
      { ts: '47 min ago', actor: 'AI · Scheduled query', event: 'Suggested', detail: 'Confidence 78%' },
    ],
  },
  {
    id: 'tsk-003',
    title: 'Rebook: Whitman LH441 IAD→FRA cancelled',
    task_type: 'disruption-response', subtype: 'flight-cancellation-rebook',
    status: 'open', approval_state: 'pending-review', routing_tier: 'escalate',
    priority: 'urgent', primary_owner: 'tk',
    primary_context: { type: 'trip', label: 'Whitman · Frankfurt May 16' },
    origin: 'world-driven', creator: 'AI · Signal monitor',
    creation_surface: 'ops-dashboard', due_at: 'in 30m',
    rationale: 'LH441 cancelled 8 hrs before depart (mechanical). 3 same-day alternatives identified, all coach availability.',
    evidence: [ { label: 'LH disruption alert', url: '#' }, { label: 'Alt flights · ITA Matrix', url: '#' } ],
    confidence: 88, age_min: 6, created_at: '6 min ago',
    activity: [
      { ts: '6 min ago', actor: 'AI · Signal monitor', event: 'Detected',    detail: 'LH441 cancelled · trigger code OPS' },
      { ts: '6 min ago', actor: 'AI · Signal monitor', event: 'Suggested',   detail: 'Confidence 88% · escalate' },
    ],
  },
  {
    id: 'tsk-004',
    title: 'Pre-arrival checklist: Castelli · Aman Tokyo (T-10d)',
    task_type: 'trip-prep', subtype: 'pre-arrival-checklist',
    status: 'open', approval_state: 'pending-review', routing_tier: 'auto',
    priority: 'medium', primary_owner: 'rp',
    primary_context: { type: 'trip', label: 'Castelli · Tokyo May 25' },
    origin: 'trip-lifecycle', creator: 'AI · Scheduled query',
    creation_surface: 'trip-page', due_at: 'in 3d',
    rationale: 'T-10 days. Standard checklist: confirm transfers, share property notes, verify dietary, send pre-arrival message.',
    evidence: [ { label: 'Castelli trip · arrival May 25', url: '#' } ],
    confidence: 96, age_min: 18, created_at: '18 min ago',
    activity: [
      { ts: '18 min ago', actor: 'AI · Scheduled query', event: 'Suggested', detail: 'Confidence 96% · trip-lifecycle' },
    ],
  },
  {
    id: 'tsk-005',
    title: 'Quote request: Patel — 4 villas in Tuscany, late Jun',
    task_type: 'booking-action', subtype: 'quote-request',
    status: 'open', approval_state: 'pending-review', routing_tier: 'assist',
    priority: 'high', primary_owner: 'js',
    primary_context: { type: 'trip', label: 'Patel · Tuscany draft' },
    origin: 'client-driven', creator: 'AI · Conversation watcher',
    creation_surface: 'composer', due_at: 'tomorrow',
    rationale: 'Client message specifies 4 villas, dates Jun 22–Jul 4, party of 8 + 1 dog. Two suppliers already vetted for this region.',
    evidence: [ { label: 'Patel msg · May 14', url: '#' }, { label: 'Tuscany supplier list', url: '#' } ],
    confidence: 84, age_min: 102, created_at: '1h 42m ago',
    activity: [
      { ts: '1h 42m ago', actor: 'AI · Conversation watcher', event: 'Suggested', detail: 'Confidence 84%' },
    ],
  },
  {
    id: 'tsk-006',
    title: 'Compliance brief: Italy travel advisory updated',
    task_type: 'disruption-response', subtype: 'compliance-advisory-brief',
    status: 'open', approval_state: 'pending-review', routing_tier: 'auto',
    priority: 'low', primary_owner: 'rp',
    primary_context: { type: 'trip', label: '3 active Italy trips' },
    origin: 'world-driven', creator: 'AI · Signal monitor',
    creation_surface: 'ops-dashboard', due_at: 'in 1d',
    rationale: 'State Dept lvl-2 advisory issued for Italy regarding civil unrest in Naples. 3 trips currently affected.',
    evidence: [ { label: 'State Dept advisory', url: '#' } ],
    confidence: 95, age_min: 220, created_at: '3h 40m ago',
    activity: [
      { ts: '3h 40m ago', actor: 'AI · Signal monitor', event: 'Suggested', detail: 'Confidence 95%' },
    ],
  },
  {
    id: 'tsk-007',
    title: 'Payment chase: Bowman deposit overdue 8d',
    task_type: 'booking-action', subtype: 'payment-chase',
    status: 'open', approval_state: 'pending-review', routing_tier: 'assist',
    priority: 'high', primary_owner: 'mc',
    primary_context: { type: 'trip', label: 'Bowman · Patagonia Aug' },
    origin: 'internal-ops', creator: 'AI · Scheduled query',
    creation_surface: 'ops-dashboard', due_at: 'today',
    rationale: 'Deposit invoice sent May 7. No payment, 1 reminder sent May 12. Booking voids at 14d.',
    evidence: [ { label: 'Invoice INV-3402', url: '#' } ],
    confidence: 90, age_min: 1320, created_at: '22h ago',
    activity: [
      { ts: '22h ago', actor: 'AI · Scheduled query', event: 'Suggested', detail: 'Confidence 90%' },
    ],
  },
  {
    id: 'tsk-008',
    title: 'Day-1 check-in: Park-Halverson · Bali (T+24h)',
    task_type: 'trip-prep', subtype: 'day-1-check-in',
    status: 'open', approval_state: 'pending-review', routing_tier: 'assist',
    priority: 'medium', primary_owner: 'mc',
    primary_context: { type: 'trip', label: 'Park-Halverson · Bali May 14' },
    origin: 'trip-lifecycle', creator: 'AI · Scheduled query',
    creation_surface: 'trip-page', due_at: 'in 4h',
    rationale: 'Trip started 24h ago. Personalize the standard day-1 check-in for honeymoon couple.',
    evidence: [ { label: 'Park-Halverson trip', url: '#' } ],
    confidence: 81, age_min: 6, created_at: '6 min ago',
    draft: '"Hope the first sunset at Como Shambhala did it for you. Anything we can fix or add now you\'re on the ground?"',
    activity: [
      { ts: '6 min ago', actor: 'AI · Scheduled query', event: 'Suggested', detail: 'Confidence 81%' },
    ],
  },

  // ───────────────────────────────────────────────────────
  //  CANONICAL (approved + on the board) — 12 tasks
  // ───────────────────────────────────────────────────────
  {
    id: 'tsk-009',
    title: 'Send: Pre-arrival message to Castelli (Aman Tokyo)',
    task_type: 'messaging', subtype: 'scheduled-send',
    status: 'in-progress', approval_state: 'human-approved', routing_tier: 'assist',
    priority: 'medium', primary_owner: 'mc',
    primary_context: { type: 'trip', label: 'Castelli · Tokyo May 25' },
    origin: 'trip-lifecycle', creator: 'mc',
    creation_surface: 'trip-page', due_at: 'in 2h',
    rationale: 'Approved · scheduled to fire at T-7d on May 18 4:00 PM ET.',
    evidence: [ { label: 'Draft preview', url: '#' } ],
    confidence: null, age_min: 1440, created_at: 'yesterday',
    activity: [
      { ts: 'yesterday',  actor: 'AI · Scheduled query', event: 'Suggested', detail: 'Confidence 89%' },
      { ts: '22h ago',    actor: 'Maya Chen',            event: 'Edited',    detail: 'Tweaked opening line' },
      { ts: '22h ago',    actor: 'Maya Chen',            event: 'Approved',  detail: 'Scheduled for May 18 16:00 ET' },
    ],
  },
  {
    id: 'tsk-010',
    title: 'Book: Aman Tokyo transfer · Castelli',
    task_type: 'booking-action', subtype: 'vendor-rebook',
    status: 'in-progress', approval_state: 'human-approved', routing_tier: 'assist',
    priority: 'high', primary_owner: 'js',
    primary_context: { type: 'trip', label: 'Castelli · Tokyo May 25' },
    origin: 'trip-lifecycle', creator: 'mc',
    creation_surface: 'trip-page', due_at: 'in 1d',
    rationale: 'NRT → Aman Tokyo private transfer · prior driver confirmed.',
    evidence: [ { label: 'Vendor: Tokyo Royal Transport', url: '#' } ],
    confidence: null, age_min: 3600, created_at: '2d ago',
    activity: [
      { ts: '2d ago',  actor: 'Maya Chen', event: 'Created',  detail: 'Manual · trip page' },
      { ts: '1d ago',  actor: 'Jordan S.', event: 'Assigned', detail: 'Reassigned from MC → JS' },
    ],
  },
  {
    id: 'tsk-011',
    title: 'Auto: Workload imbalance flag — Rae +18 tasks vs avg',
    task_type: 'trip-prep', subtype: 'workload-imbalance',
    status: 'completed', approval_state: 'auto-approved', routing_tier: 'auto',
    priority: 'low', primary_owner: 'tk',
    primary_context: { type: 'account-member', label: 'Internal · workload' },
    origin: 'internal-ops', creator: 'AI · Scheduled query',
    creation_surface: 'ops-dashboard', due_at: 'completed',
    rationale: 'Auto-routed to ops manager. Action: rebalance 6 tasks from Rae to Jordan.',
    evidence: [ { label: 'Workload chart', url: '#' } ],
    confidence: null, age_min: 7200, created_at: '5d ago',
    activity: [
      { ts: '5d ago',  actor: 'AI · Scheduled query', event: 'Auto-created', detail: 'Confidence 97%' },
      { ts: '4d ago',  actor: 'Tomás K.',             event: 'Completed',    detail: 'Rebalanced via /assign' },
    ],
  },
  {
    id: 'tsk-012',
    title: 'Send: Aman pre-arrival message · Castelli',
    task_type: 'messaging', subtype: 'scheduled-send',
    status: 'completed', approval_state: 'auto-approved', routing_tier: 'auto',
    priority: 'medium', primary_owner: 'mc',
    primary_context: { type: 'trip', label: 'Castelli · Tokyo May 25' },
    origin: 'trip-lifecycle', creator: 'AI · Scheduled query',
    creation_surface: 'trip-page', due_at: 'completed',
    rationale: 'Auto-template T-14 pre-arrival ping. Fired May 11 16:00 ET.',
    evidence: [ { label: 'Sent message', url: '#' } ],
    confidence: null, age_min: 5760, created_at: '4d ago',
    activity: [
      { ts: '4d ago', actor: 'AI · Scheduled query', event: 'Auto-created + sent', detail: 'Confidence 99%' },
    ],
  },
  {
    id: 'tsk-013',
    title: 'Rebook: Whitman to LH444 (FRA via MUC)',
    task_type: 'disruption-response', subtype: 'flight-cancellation-rebook',
    status: 'in-progress', approval_state: 'human-approved', routing_tier: 'escalate',
    priority: 'urgent', primary_owner: 'tk',
    primary_context: { type: 'trip', label: 'Whitman · Frankfurt May 16' },
    origin: 'world-driven', creator: 'AI · Signal monitor',
    creation_surface: 'ops-dashboard', due_at: 'in 4h',
    rationale: 'Approved by TK. Client opted for next-day LH444 (MUC connection), comp\'d via LH disruption ticket.',
    evidence: [ { label: 'LH ticket #', url: '#' } ],
    confidence: null, age_min: 5, created_at: '5 min ago',
    activity: [
      { ts: '5 min ago', actor: 'Tomás K.', event: 'Approved', detail: 'Selected option 2 of 3' },
    ],
  },
  {
    id: 'tsk-014',
    title: 'Follow-up: confirm pickup time · Bowman',
    task_type: 'messaging', subtype: 'follow-up-prompt',
    status: 'open', approval_state: 'human-approved', routing_tier: 'auto',
    priority: 'medium', primary_owner: 'mc',
    primary_context: { type: 'message-conversation', label: 'Bowman · Stream Chat' },
    origin: 'manual', creator: 'mc',
    creation_surface: 'manual', due_at: 'today',
    rationale: 'Manual · created via `c` from Bowman thread.',
    evidence: [],
    confidence: null, age_min: 30, created_at: '30 min ago',
    activity: [
      { ts: '30 min ago', actor: 'Maya Chen', event: 'Created', detail: 'Manual create · composer surface' },
    ],
  },
  {
    id: 'tsk-015',
    title: 'Day-of-departure send-off · Park-Halverson (T-4h)',
    task_type: 'trip-prep', subtype: 'day-of-departure-message',
    status: 'completed', approval_state: 'auto-approved', routing_tier: 'auto',
    priority: 'medium', primary_owner: 'mc',
    primary_context: { type: 'trip', label: 'Park-Halverson · Bali May 14' },
    origin: 'trip-lifecycle', creator: 'AI · Scheduled query',
    creation_surface: 'trip-page', due_at: 'completed',
    rationale: 'Auto-template. Fired May 13 6:00 PM ET, 4h before SFO flight.',
    evidence: [ { label: 'Sent message', url: '#' } ],
    confidence: null, age_min: 1440, created_at: 'yesterday',
    activity: [
      { ts: 'yesterday', actor: 'AI · Scheduled query', event: 'Auto-created + sent', detail: 'Confidence 99%' },
    ],
  },
  {
    id: 'tsk-016',
    title: 'Property search: Mongolia · Aug, party of 4',
    task_type: 'booking-action', subtype: 'property-search',
    status: 'open', approval_state: 'human-approved', routing_tier: 'assist',
    priority: 'medium', primary_owner: 'js',
    primary_context: { type: 'trip', label: 'Castelli · 2027 future' },
    origin: 'client-driven', creator: 'mc',
    creation_surface: 'composer', due_at: 'in 3d',
    rationale: 'Client interested in Mongolia summer 2027. Three Camel Lodge + Three Camel Camp identified.',
    evidence: [ { label: 'Source thread', url: '#' } ],
    confidence: null, age_min: 240, created_at: '4h ago',
    activity: [
      { ts: '4h ago', actor: 'Maya Chen', event: 'Created', detail: 'Manual · from message thread' },
    ],
  },
  {
    id: 'tsk-017',
    title: 'Vendor change: Como Shambhala upgrade · Park-Halverson',
    task_type: 'disruption-response', subtype: 'vendor-side-change-respond',
    status: 'open', approval_state: 'human-approved', routing_tier: 'assist',
    priority: 'medium', primary_owner: 'rp',
    primary_context: { type: 'trip', label: 'Park-Halverson · Bali May 14' },
    origin: 'world-driven', creator: 'AI · Signal monitor',
    creation_surface: 'ops-dashboard', due_at: 'in 2d',
    rationale: 'Como offered free upgrade to Ocean View Villa. Confirm with client before accepting.',
    evidence: [ { label: 'Como email · May 13', url: '#' } ],
    confidence: 91, age_min: 90, created_at: '1h 30m ago',
    activity: [
      { ts: '1h 30m ago', actor: 'AI · Signal monitor', event: 'Suggested', detail: 'Confidence 91%' },
      { ts: '1h 25m ago', actor: 'Maya Chen',           event: 'Approved',  detail: 'Routed to RP for client confirm' },
    ],
  },
  {
    id: 'tsk-018',
    title: 'Post-trip review request · Whitman · Tuscany',
    task_type: 'trip-prep', subtype: 'post-trip-review',
    status: 'open', approval_state: 'human-approved', routing_tier: 'assist',
    priority: 'low', primary_owner: 'mc',
    primary_context: { type: 'trip', label: 'Whitman · Tuscany Mar 2026' },
    origin: 'trip-lifecycle', creator: 'AI · Scheduled query',
    creation_surface: 'ops-dashboard', due_at: 'in 1d',
    rationale: 'T+2d feedback prompt. Whitmans are repeat clients, suggest personalized voice memo.',
    evidence: [ { label: 'Whitman past trip', url: '#' } ],
    confidence: 79, age_min: 30, created_at: '30 min ago',
    activity: [
      { ts: '30 min ago', actor: 'AI · Scheduled query', event: 'Suggested', detail: 'Confidence 79%' },
      { ts: '28 min ago', actor: 'Maya Chen',            event: 'Approved',  detail: 'Will personalize draft' },
    ],
  },
  {
    id: 'tsk-019',
    title: 'Snoozed: Award space alert · ANA F to NRT',
    task_type: 'booking-action', subtype: 'property-search',
    status: 'snoozed', approval_state: 'human-approved', routing_tier: 'auto',
    priority: 'low', primary_owner: 'js',
    primary_context: { type: 'trip', label: 'Patel · Japan draft' },
    origin: 'world-driven', creator: 'AI · Signal monitor',
    creation_surface: 'ops-dashboard', due_at: 'snoozed · 4h',
    rationale: 'Snoozed by JS for "end of shift".',
    evidence: [ { label: 'Award alert', url: '#' } ],
    confidence: null, age_min: 60, created_at: '1h ago',
    activity: [
      { ts: '1h ago',     actor: 'AI · Signal monitor', event: 'Suggested', detail: 'Confidence 88%' },
      { ts: '58 min ago', actor: 'Jordan S.',           event: 'Approved',  detail: 'Auto-approved · saved search' },
      { ts: '20 min ago', actor: 'Jordan S.',           event: 'Snoozed',   detail: 'Until end of shift (4h)' },
    ],
  },
  {
    id: 'tsk-020',
    title: 'Birthday outreach prep · Greer (May 20)',
    task_type: 'messaging', subtype: 'reply-draft',
    status: 'open', approval_state: 'human-approved', routing_tier: 'escalate',
    priority: 'medium', primary_owner: 'mc',
    primary_context: { type: 'account-member', label: 'Greer family' },
    origin: 'relationship', creator: 'AI · Scheduled query',
    creation_surface: 'ops-dashboard', due_at: 'in 5d',
    rationale: 'Birthday May 20. Past 3 trips with Maestro. Suggest personalized note + comp\'d champagne at JAL lounge.',
    evidence: [ { label: 'Greer profile', url: '#' } ],
    confidence: 86, age_min: 720, created_at: '12h ago',
    activity: [
      { ts: '12h ago',     actor: 'AI · Scheduled query', event: 'Suggested', detail: 'Confidence 86% · escalate (relationship)' },
      { ts: '11h 50m ago', actor: 'Maya Chen',            event: 'Approved',  detail: 'Will craft note personally' },
    ],
  },

  // ───────────────────────────────────────────────────────
  //  REJECTED — 2 tasks (history)
  // ───────────────────────────────────────────────────────
  {
    id: 'tsk-021',
    title: 'AI proposed: cold outreach re: Bali (Halverson)',
    task_type: 'messaging', subtype: 'reply-draft',
    status: 'dismissed', approval_state: 'rejected', routing_tier: 'assist',
    priority: 'low', primary_owner: 'mc',
    primary_context: { type: 'message-conversation', label: 'Halverson · Stream Chat' },
    origin: 'client-driven', creator: 'AI · Conversation watcher',
    creation_surface: 'composer', due_at: '—',
    rationale: 'Rejected by MC. Reason: Halverson explicitly said "no more Bali pings for 6 months" in Apr 30 message.',
    evidence: [ { label: 'Halverson msg · Apr 30', url: '#' } ],
    confidence: 71, age_min: 2880, created_at: '2d ago',
    activity: [
      { ts: '2d ago',  actor: 'AI · Conversation watcher', event: 'Suggested', detail: 'Confidence 71%' },
      { ts: '2d ago',  actor: 'Maya Chen',                 event: 'Rejected',  detail: 'Wrong context — client opted out' },
    ],
  },
  {
    id: 'tsk-022',
    title: 'AI proposed: rebook Whitman in J · IAD-FRA',
    task_type: 'disruption-response', subtype: 'flight-cancellation-rebook',
    status: 'dismissed', approval_state: 'rejected', routing_tier: 'escalate',
    priority: 'urgent', primary_owner: 'tk',
    primary_context: { type: 'trip', label: 'Whitman · Frankfurt May 16' },
    origin: 'world-driven', creator: 'AI · Signal monitor',
    creation_surface: 'ops-dashboard', due_at: '—',
    rationale: 'Rejected — client preference is First only for transatlantic >7hr, never Business.',
    evidence: [ { label: 'Whitman travel profile', url: '#' } ],
    confidence: 64, age_min: 25, created_at: '25 min ago',
    activity: [
      { ts: '25 min ago', actor: 'AI · Signal monitor', event: 'Suggested', detail: 'Confidence 64%' },
      { ts: '24 min ago', actor: 'Tomás K.',            event: 'Rejected',  detail: 'Wrong cabin · preference miss' },
    ],
  },

  // ───────────────────────────────────────────────────────
  //  EXPIRED — 2 tasks (history, faded)
  // ───────────────────────────────────────────────────────
  {
    id: 'tsk-023',
    title: 'Pipeline stall: Bowman quote sent, no movement',
    task_type: 'trip-prep', subtype: 'pipeline-stall',
    status: 'dismissed', approval_state: 'expired', routing_tier: 'assist',
    priority: 'low', primary_owner: 'mc',
    primary_context: { type: 'trip', label: 'Bowman · Patagonia Aug' },
    origin: 'trip-lifecycle', creator: 'AI · Scheduled query',
    creation_surface: 'ops-dashboard', due_at: '—',
    rationale: 'Expired (no action within 24h). Auto-superseded by tsk-007 (payment chase).',
    evidence: [],
    confidence: 70, age_min: 1500, created_at: '25h ago',
    activity: [
      { ts: '25h ago', actor: 'AI · Scheduled query', event: 'Suggested', detail: 'Confidence 70%' },
      { ts: '1h ago',  actor: 'System',               event: 'Expired',   detail: 'No action in 24h window' },
    ],
  },
  {
    id: 'tsk-024',
    title: 'Auto-detect: vague preference signal (Greer · "love quiet beaches")',
    task_type: 'messaging', subtype: 'follow-up-prompt',
    status: 'dismissed', approval_state: 'expired', routing_tier: 'assist',
    priority: 'low', primary_owner: 'mc',
    primary_context: { type: 'message-conversation', label: 'Greer family' },
    origin: 'client-driven', creator: 'AI · Conversation watcher',
    creation_surface: 'composer', due_at: '—',
    rationale: 'Expired · suggestion was vague preference capture, no action needed; insight already in profile.',
    evidence: [],
    confidence: 58, age_min: 1500, created_at: '25h ago',
    activity: [
      { ts: '25h ago', actor: 'AI · Conversation watcher', event: 'Suggested', detail: 'Confidence 58%' },
      { ts: '1h ago',  actor: 'System',                    event: 'Expired',   detail: 'Below act-on threshold; profile updated silently' },
    ],
  },

  // ───────────────────────────────────────────────────────
  //  AUTO-APPROVED · running now — 1 extra
  // ───────────────────────────────────────────────────────
  {
    id: 'tsk-025',
    title: 'SLA timer: Greer reply expected in <30 min',
    task_type: 'disruption-response', subtype: 'compliance-advisory-brief',
    status: 'open', approval_state: 'auto-approved', routing_tier: 'escalate',
    priority: 'urgent', primary_owner: 'mc',
    primary_context: { type: 'message-conversation', label: 'Greer · WhatsApp' },
    origin: 'internal-ops', creator: 'AI · Signal monitor',
    creation_surface: 'ops-dashboard', due_at: 'in 22m',
    rationale: 'Auto-escalate: VVIP SLA = 2h, current age 1h 38m. Greer is VVIP tier.',
    evidence: [ { label: 'SLA dashboard', url: '#' } ],
    confidence: null, age_min: 4, created_at: '4 min ago',
    activity: [
      { ts: '4 min ago', actor: 'AI · Signal monitor', event: 'Auto-created', detail: 'SLA timer · VVIP tier · Confidence 99%' },
    ],
  },
];

// ─── Augment tasks with derived source_channel + ai_reasoning ───
// Derived so we don't have to edit 25 fixture rows.
function deriveSourceChannel(task) {
  if (task.creator && !task.creator.includes('AI')) return 'manual';
  if (task.creation_surface === 'composer') {
    // WhatsApp vs Stream Chat — assume whatsapp for client conversations
    return task.primary_context.label.toLowerCase().includes('stream') ? 'stream-chat' : 'whatsapp';
  }
  if (task.origin === 'world-driven') return 'system-feed';
  if (task.origin === 'trip-lifecycle') return 'system-schedule';
  if (task.origin === 'internal-ops') return 'system-ops';
  return 'system';
}
const AI_REASONING_MAP = {
  'messaging':            'Conversation watcher matched client intent against thread context + past preferences.',
  'booking-action':       'Signal monitor detected booking action keywords; cross-referenced supplier availability.',
  'trip-prep':            'Scheduled query fired at T-event window per trip-prep template.',
  'disruption-response':  'Signal monitor detected disruption event; correlated with active trip itinerary.',
};
TASKS.forEach(t => {
  if (!t.source_channel) t.source_channel = deriveSourceChannel(t);
  if (!t.ai_reasoning && t.confidence) t.ai_reasoning = AI_REASONING_MAP[t.task_type] || 'Pattern matched against historical task types.';
});

// Filter helpers used by the prototype pages
const CURRENT_USER_ID = 'mc';
const TaskFilters = {
  // Legacy (still used by review-queue.html — kept for back-compat)
  forBoard:       () => TASKS.filter(t => ['auto-approved', 'human-approved'].includes(t.approval_state)),
  forReviewQueue: () => TASKS.filter(t => t.approval_state === 'pending-review'),
  // New: tabbed task surface (matches live Conductor)
  all:       () => TASKS.slice(),
  myTasks:   () => TASKS.filter(t => t.primary_owner === CURRENT_USER_ID && !['dismissed','completed'].includes(t.status)),
  urgent:    () => TASKS.filter(t => t.priority === 'urgent' && t.status !== 'dismissed'),
  needsReview: () => TASKS.filter(t => t.approval_state === 'pending-review'),
  forTab:    (tab) => {
    switch (tab) {
      case 'my':           return TaskFilters.myTasks();
      case 'urgent':       return TaskFilters.urgent();
      case 'needs-review': return TaskFilters.needsReview();
      case 'all':
      default:             return TaskFilters.all();
    }
  },
  byId: (id) => TASKS.find(t => t.id === id),
};

// Tier styling (mirrors outline routing tier conventions)
const TIER_STYLES = {
  auto:     { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/30',  label: 'Auto'     },
  assist:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30',  label: 'Assist'   },
  escalate: { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/30',    label: 'Escalate' },
};

const PRIORITY_STYLES = {
  urgent: { dot: 'bg-red-500',    label: 'Urgent' },
  high:   { dot: 'bg-orange-500', label: 'High'   },
  medium: { dot: 'bg-sky-500',    label: 'Medium' },
  low:    { dot: 'bg-slate-500',  label: 'Low'    },
};

const TASK_TYPE_LABELS = {
  'messaging':              'Messaging',
  'booking-action':         'Booking action',
  'trip-prep':              'Trip prep',
  'disruption-response':    'Disruption response',
};

const ORIGIN_LABELS = {
  'client-driven':   'Client-driven',
  'world-driven':    'World-driven',
  'trip-lifecycle':  'Trip lifecycle',
  'relationship':    'Relationship',
  'internal-ops':    'Internal ops',
  'manual':          'Manual',
};

const CONTEXT_ICONS = {
  'trip':                  '🗺',
  'message-conversation':  '💬',
  'account-member':        '👤',
};

// Inline SVG icons for source channels (Lucide-style, 14×14).
const SOURCE_CHANNELS = {
  'whatsapp':         { label: 'WhatsApp',        color: 'text-green-400',  svg: '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>' },
  'stream-chat':      { label: 'Stream Chat',     color: 'text-sky-400',    svg: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>' },
  'manual':           { label: 'Manual',          color: 'text-orange-400', svg: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>' },
  'system-feed':      { label: 'Signal feed',     color: 'text-red-400',    svg: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 00-4 0v.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1"/></svg>' },
  'system-schedule':  { label: 'Scheduled query', color: 'text-purple-400', svg: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
  'system-ops':       { label: 'Ops system',      color: 'text-amber-400',  svg: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' },
  'system':           { label: 'System',          color: 'text-slate-400',  svg: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' },
};
