// admin-data.js -- Automation Admin Panel fixture
// Maps to the 21 P0 rows in the Notion Task Inventory DB (mapped 2026-05-28).
// Per PRD v1.1 Addendum §A1, the admin panel controls runtime on/off state
// of automations. Default state on launch: all OFF, ops opts in deliberately.

const ADMIN_TEAM = {
  marco:  { id: 'marco',  name: 'Marco Silva',    role: 'Ops Lead',     initials: 'MS', color: 'bg-chip-blue-soft text-chip-blue' },
  maya:   { id: 'maya',   name: 'Maya Chen',      role: 'TA Lead',      initials: 'MC', color: 'bg-chip-purple-soft text-chip-purple' },
  jordan: { id: 'jordan', name: 'Jordan Singh',   role: 'Frontline TA', initials: 'JS', color: 'bg-chip-green-soft text-chip-green' },
  system: { id: 'system', name: 'System (cron)',  role: 'Automation',   initials: 'SY', color: 'bg-mborder text-mtext2' },
};

const ORIGIN_STYLES = {
  'Trip-lifecycle':           { bg: 'bg-msuccessl',  text: 'text-msuccess',  border: 'border-msuccess/30' },
  'Internal operations':      { bg: 'bg-msurface',  text: 'text-mtext2',  border: 'border-mborder' },
  'World-driven':             { bg: 'bg-maccentl', text: 'text-maccent', border: 'border-maccent/40' },
  'Relationship':             { bg: 'bg-chip-purple-soft', text: 'text-chip-purple', border: 'border-chip-purple/30' },
  'Client-driven (explicit)': { bg: 'bg-minfol',   text: 'text-minfo',   border: 'border-minfo/30' },
  'Client-driven (implicit)': { bg: 'bg-chip-teal-soft',    text: 'text-chip-teal',    border: 'border-chip-teal/30' },
};

const TIER_STYLES_ADMIN = {
  Auto:     { bg: 'bg-msuccessl', text: 'text-msuccess', border: 'border-msuccess/30' },
  Assist:   { bg: 'bg-mambersoft', text: 'text-mamber', border: 'border-mamber/30' },
  Escalate: { bg: 'bg-mdangerl',   text: 'text-mdanger',   border: 'border-mdanger/30' },
};

const TASK_TYPE_LABELS_ADMIN = {
  'trip-prep':           'Trip prep',
  'messaging':           'Messaging',
  'disruption-response': 'Disruption response',
  'ops-internal':        'Ops internal',
  'booking-action':      'Booking action',
  'member-context':      'Member context',
  'agent-subtask':       'Agent subtask',
  'compliance-safety':   'Compliance / safety',
  'discovery':           'Discovery',
};

const PHASE_LABELS = {
  'Pre-trip':              'Pre-trip',
  'Mid-trip':              'Mid-trip',
  'Post-trip':             'Post-trip',
  'Go-live':               'Go-live',
  'Ongoing relationship':  'Ongoing relationship',
};

// 21 P0 automations from the Notion Task Inventory (IDs match the DB).
// `enabled` reflects the prototype's launch state simulation — 6 turned on
// by ops over the first week, 15 still off (mirrors the conservative
// default-OFF stance from PRD §A1).
const AUTOMATIONS = [
  {
    id: 7, ref: 'AUTO-7',
    name: 'Verify passport names match tickets',
    trigger: 'Pre-trip review window (14 days before departure)',
    expected: 'Cross-check passport names against issued flight tickets to catch spelling discrepancies.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Unassigned (review queue)',
    query_template: 'trips-departing-n-days', n_param: 14, recurrence: 'continuous',
  },
  {
    id: 8, ref: 'AUTO-8',
    name: 'Verify all flight tickets issued, not just reserved',
    trigger: 'Pre-trip review window',
    expected: 'Confirm every flight ticket is issued, not just reserved.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Unassigned (review queue)',
    query_template: 'trips-departing-n-days', n_param: 21, recurrence: 'continuous',
  },
  {
    id: 9, ref: 'AUTO-9',
    name: 'Attach hotel loyalty numbers to reservations',
    trigger: 'After hotel confirmation',
    expected: 'Attach the relevant hotel loyalty numbers to each hotel reservation.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: true, default_owner: 'TA on duty',
    audit: [
      { actor: 'marco', action: 'enabled', time: '3 days ago', reason: 'Mechanical, low-risk lookup. Safe to auto.' },
    ],
    event_source: 'trip-status-change', recurrence: 'continuous',
  },
  {
    id: 13, ref: 'AUTO-13',
    name: 'Flag tight connections or last-flight-of-day risks',
    trigger: 'Pre-trip review window',
    expected: 'Internally flag tight connections or last-flight-of-day risks on the itinerary.',
    task_type: 'disruption-response', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Unassigned (review queue)',
    query_template: 'trips-departing-n-days', n_param: 21, recurrence: 'continuous',
  },
  {
    id: 19, ref: 'AUTO-19',
    name: 'Attach airline frequent flyer numbers to tickets',
    trigger: 'After flight ticketing',
    expected: 'Ensure frequent flyer numbers are attached to all flight tickets.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: true, default_owner: 'TA on duty',
    audit: [
      { actor: 'marco', action: 'enabled', time: '5 days ago', reason: 'Mechanical apply. No client touch.' },
      { actor: 'maya',  action: 'disabled', time: 'yesterday', reason: 'Saw 2 misapplied FF numbers on Khan trip. Pausing while we check.' },
      { actor: 'marco', action: 'enabled', time: '2 hours ago', reason: 'Mapping fix shipped. Re-enabling.' },
    ],
    event_source: 'trip-status-change', recurrence: 'continuous',
  },
  {
    id: 39, ref: 'AUTO-39',
    name: 'Attach TSA Pre-Check or Global Entry numbers',
    trigger: 'After flight ticketing',
    expected: 'Attach TSA Pre-Check or Global Entry numbers to all flight tickets.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: true, default_owner: 'TA on duty',
    audit: [
      { actor: 'marco', action: 'enabled', time: '1 week ago', reason: 'Earliest opt-in. Same shape as FF numbers.' },
    ],
    event_source: 'trip-status-change', recurrence: 'continuous',
  },
  {
    id: 49, ref: 'AUTO-49',
    name: 'Send VIP email to hotel',
    trigger: 'Pre-trip review window',
    expected: 'Send the VIP email to each booked hotel covering member profile, preferences, special occasions.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Assist', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Trip owner',
    query_template: 'trips-departing-n-days', n_param: 7, recurrence: 'continuous',
  },
  {
    id: 54, ref: 'AUTO-54',
    name: 'Log cancellation deadlines internally',
    trigger: 'Pre-trip review window',
    expected: 'Log each cancellation deadline in the internal system.',
    task_type: 'ops-internal', origin_bucket: 'Internal operations', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: true, default_owner: 'Ops on duty',
    audit: [
      { actor: 'marco', action: 'enabled', time: '4 days ago', reason: 'Self-monitoring only. Saved us 3 missed deadlines last week.' },
    ],
    query_template: 'trips-departing-n-days', n_param: 21, recurrence: 'continuous',
  },
  {
    id: 60, ref: 'AUTO-60',
    name: 'Check airline or rail strikes',
    trigger: 'Pre-trip and ongoing through trip (4-hourly poll)',
    expected: 'Check for airline or rail strikes affecting the trip.',
    task_type: 'disruption-response', origin_bucket: 'World-driven', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Unassigned (review queue)',
    query_template: 'trips-departing-n-days', n_param: 14, recurrence: 'continuous',
  },
  {
    id: 65, ref: 'AUTO-65',
    name: 'Enable flight monitoring',
    trigger: 'Go-live',
    expected: 'Enable flight monitoring for the trip.',
    task_type: 'disruption-response', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Go-live',
    enabled: true, default_owner: 'Ops on duty',
    audit: [
      { actor: 'maya', action: 'enabled', time: '2 days ago', reason: 'Trigger on trip status change. Tested with 4 live trips.' },
    ],
    event_source: 'trip-status-change', recurrence: 'continuous',
  },
  {
    id: 68, ref: 'AUTO-68',
    name: "Mark trip 'Pre-Trip Docs Sent'",
    trigger: 'Once pre-trip docs delivery is complete',
    expected: "Update the trip status to 'Pre-Trip Docs Sent' once all documents are delivered.",
    task_type: 'ops-internal', origin_bucket: 'Internal operations', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Ops pool',
    event_source: 'trip-status-change', recurrence: 'continuous',
  },
  {
    id: 77, ref: 'AUTO-77',
    name: 'Verify visa and entry requirements',
    trigger: 'Pre-trip review window',
    expected: 'Verify visa and entry requirements for each destination on the itinerary.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Unassigned (review queue)',
    query_template: 'trips-departing-n-days', n_param: 21, recurrence: 'continuous',
  },
  {
    id: 82, ref: 'AUTO-82',
    name: 'Send pre-trip confirmation with arrival instructions',
    trigger: 'Pre-trip window (e.g. 1 week before departure)',
    expected: 'Send the pre-trip confirmation message or email to the member with arrival instructions.',
    task_type: 'messaging', origin_bucket: 'Trip-lifecycle', routing_tier: 'Assist', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Trip owner',
    query_template: 'trips-departing-n-days', n_param: 7, recurrence: 'continuous',
  },
  {
    id: 86, ref: 'AUTO-86',
    name: 'Share final trip page with member',
    trigger: 'Go-live',
    expected: 'Share the final trip page with the member.',
    task_type: 'messaging', origin_bucket: 'Trip-lifecycle', routing_tier: 'Assist', phase: 'Go-live',
    enabled: false, audit: [], default_owner: 'Trip owner',
    event_source: 'trip-status-change', recurrence: 'continuous',
  },
  {
    id: 102, ref: 'AUTO-102',
    name: 'Review transit visa requirements',
    trigger: 'Pre-trip review window',
    expected: 'Review transit visa requirements for any layover countries.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Pre-trip',
    enabled: false, audit: [], default_owner: 'Unassigned (review queue)',
    query_template: 'trips-departing-n-days', n_param: 21, recurrence: 'continuous',
  },
  {
    id: 106, ref: 'AUTO-106',
    name: 'Reconfirm next-day hotel arrival with property',
    trigger: 'Evening before each travel day',
    expected: 'Send the hotel a reconfirm covering member name, arrival time, room type, special requests, VIP recognition.',
    task_type: 'trip-prep', origin_bucket: 'Trip-lifecycle', routing_tier: 'Assist', phase: 'Mid-trip',
    enabled: false, audit: [], default_owner: 'VVIP pod',
    query_template: 'trips-departing-n-days', n_param: 1, recurrence: 'daily',
  },
  {
    id: 117, ref: 'AUTO-117',
    name: 'Notify member immediately on flight delay 2+ hrs or cancellation',
    trigger: 'Flight delay 2+ hrs or cancellation',
    expected: 'When a flight is delayed 2+ hours or cancelled, notify the member immediately.',
    task_type: 'disruption-response', origin_bucket: 'World-driven', routing_tier: 'Escalate', phase: 'Mid-trip',
    enabled: false, default_owner: 'VVIP support pool',
    audit: [
      { actor: 'maya', action: 'enabled', time: '6 days ago', reason: 'Critical for VVIPs. Auto-notify on delay.' },
      { actor: 'marco', action: 'disabled', time: '5 days ago', reason: 'False positive on Khan trip — delay was already resolved. Need human in the loop.' },
    ],
    event_source: 'flight-delay', recurrence: 'continuous',
  },
  {
    id: 135, ref: 'AUTO-135',
    name: 'Send welcome-home WhatsApp within 24-48 hours of return',
    trigger: '24-48 hrs after trip end',
    expected: 'Send a personalized WhatsApp message welcoming the member home, referencing specific trip moments.',
    task_type: 'messaging', origin_bucket: 'Relationship', routing_tier: 'Assist', phase: 'Post-trip',
    enabled: false, audit: [], default_owner: 'Trip owner',
    query_template: 'trips-departing-n-days', n_param: -2, recurrence: 'continuous',
  },
  {
    id: 137, ref: 'AUTO-137',
    name: 'Send 7-day follow-up WhatsApp if no survey response',
    trigger: '7 days post-trip without response',
    expected: 'If no survey response is received within 7 days, send a follow-up WhatsApp.',
    task_type: 'messaging', origin_bucket: 'Trip-lifecycle', routing_tier: 'Auto', phase: 'Post-trip',
    enabled: false, audit: [], default_owner: 'Ops pool',
    query_template: 'trips-departing-n-days', n_param: -7, recurrence: 'continuous',
  },
  {
    id: 173, ref: 'AUTO-173',
    name: 'Initiate TA follow-up call for sub-4-star review',
    trigger: 'Post-trip satisfaction form returns sub-4-star rating',
    expected: 'Support acknowledges same-day; coordinates follow-up call between client and TA.',
    task_type: 'messaging', origin_bucket: 'Trip-lifecycle', routing_tier: 'Escalate', phase: 'Post-trip',
    enabled: false, audit: [], default_owner: 'VVIP support pool',
    event_source: 'sub-4-star', recurrence: 'continuous',
  },
  {
    id: 175, ref: 'AUTO-175',
    name: 'Archive flight cards 2 days post-trip',
    trigger: '2 days after trip end date (cron)',
    expected: 'Flight Cards auto-archive two days after trip ends, keeping them live during the trip.',
    task_type: 'ops-internal', origin_bucket: 'Internal operations', routing_tier: 'Auto', phase: 'Post-trip',
    enabled: true, default_owner: 'Ops on duty',
    audit: [
      { actor: 'marco', action: 'enabled', time: '6 days ago', reason: 'Pure cron job. No risk.' },
    ],
    query_template: 'trips-departing-n-days', n_param: -2, recurrence: 'daily',
  },
];

// ──────────────────────────────────────────────────────────────────────
// Simulated metrics: tasks created per automation.
//
// In production this is a metrics service joining `tasks` to the automation
// registry on (created_by_automation, fired_at). For the prototype we hold
// counts + a recent-tasks list keyed by inventory ID. Disabled automations
// have no metrics (they were never firing).
//
// Numbers scaled to "how long has this been enabled" from the audit log.
// ──────────────────────────────────────────────────────────────────────
const AUTOMATION_METRICS = {
  9: {
    counts: { total: 17, last_7d: 17, last_24h: 4, last_fired: '23 min ago' },
    recent: [
      { id: 'TSK-3401', trip: 'Khan family · Tokyo',     status: 'completed',      when: '23 min ago' },
      { id: 'TSK-3392', trip: 'Greer · Paris birthday',  status: 'completed',      when: '1 hr ago' },
      { id: 'TSK-3387', trip: 'Cooper family · Sweden',  status: 'completed',      when: '4 hr ago' },
      { id: 'TSK-3361', trip: 'Lynne · Italy',           status: 'completed',      when: 'yesterday' },
      { id: 'TSK-3334', trip: 'Carter · Maldives',       status: 'pending-review', when: 'yesterday' },
    ],
  },
  19: {
    counts: { total: 31, last_7d: 31, last_24h: 6, last_fired: '15 min ago' },
    recent: [
      { id: 'TSK-3409', trip: 'Khan family · Tokyo',     status: 'completed',      when: '15 min ago' },
      { id: 'TSK-3402', trip: 'Singh · Dubai',           status: 'completed',      when: '2 hr ago' },
      { id: 'TSK-3398', trip: 'Patel · Bali',            status: 'dismissed',      when: '3 hr ago' },
      { id: 'TSK-3375', trip: 'Brennan · NYC',           status: 'completed',      when: 'yesterday' },
      { id: 'TSK-3358', trip: 'Reyes · Patagonia',       status: 'completed',      when: '2 days ago' },
    ],
  },
  39: {
    counts: { total: 42, last_7d: 42, last_24h: 7, last_fired: '34 min ago' },
    recent: [
      { id: 'TSK-3410', trip: 'Chen · Iceland',          status: 'completed',      when: '34 min ago' },
      { id: 'TSK-3404', trip: 'Khan family · Tokyo',     status: 'completed',      when: '1 hr ago' },
      { id: 'TSK-3399', trip: 'Tanaka · Hawaii',         status: 'completed',      when: '3 hr ago' },
      { id: 'TSK-3381', trip: 'Brennan · NYC',           status: 'completed',      when: 'yesterday' },
      { id: 'TSK-3365', trip: 'Singh · Dubai',           status: 'completed',      when: '2 days ago' },
    ],
  },
  54: {
    counts: { total: 23, last_7d: 23, last_24h: 5, last_fired: '1 hr ago' },
    recent: [
      { id: 'TSK-3406', trip: 'Carter · Maldives',       status: 'completed',      when: '1 hr ago' },
      { id: 'TSK-3395', trip: 'Reyes · Patagonia',       status: 'completed',      when: '4 hr ago' },
      { id: 'TSK-3382', trip: 'Lynne · Italy',           status: 'completed',      when: 'yesterday' },
      { id: 'TSK-3370', trip: 'Cooper family · Sweden',  status: 'completed',      when: '2 days ago' },
      { id: 'TSK-3349', trip: 'Greer · Paris birthday',  status: 'completed',      when: '3 days ago' },
    ],
  },
  65: {
    counts: { total: 11, last_7d: 11, last_24h: 4, last_fired: '52 min ago' },
    recent: [
      { id: 'TSK-3408', trip: 'Khan family · Tokyo',     status: 'in-progress',    when: '52 min ago' },
      { id: 'TSK-3400', trip: 'Singh · Dubai',           status: 'completed',      when: '6 hr ago' },
      { id: 'TSK-3389', trip: 'Patel · Bali',            status: 'completed',      when: 'yesterday' },
      { id: 'TSK-3378', trip: 'Chen · Iceland',          status: 'completed',      when: 'yesterday' },
      { id: 'TSK-3362', trip: 'Tanaka · Hawaii',         status: 'completed',      when: '2 days ago' },
    ],
  },
  175: {
    counts: { total: 18, last_7d: 18, last_24h: 2, last_fired: '4 hr ago' },
    recent: [
      { id: 'TSK-3397', trip: 'Brennan · NYC',           status: 'completed',      when: '4 hr ago' },
      { id: 'TSK-3394', trip: 'Reyes · Patagonia',       status: 'completed',      when: '8 hr ago' },
      { id: 'TSK-3368', trip: 'Cooper family · Sweden',  status: 'completed',      when: '2 days ago' },
      { id: 'TSK-3355', trip: 'Lynne · Italy',           status: 'completed',      when: '3 days ago' },
      { id: 'TSK-3341', trip: 'Khan family · Tokyo',     status: 'completed',      when: '4 days ago' },
    ],
  },
  7: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  8: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  13: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  49: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  60: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  68: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  77: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  82: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  86: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  102: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  106: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  117: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  135: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  137: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
  173: {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  },
};

function getAutomationMetrics(id) {
  return AUTOMATION_METRICS[id] || {
    counts: { total: 0, last_7d: 0, last_24h: 0, last_fired: null },
    recent: [],
  };
}

const TASK_STATUS_STYLES = {
  'completed':      { label: 'Completed',  bg: 'bg-green-500/10',  text: 'text-green-300',  border: 'border-green-500/30' },
  'in-progress':    { label: 'In progress', bg: 'bg-blue-500/10',  text: 'text-blue-300',   border: 'border-blue-500/30' },
  'pending-review': { label: 'Review',     bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/30' },
  'dismissed':      { label: 'Dismissed',  bg: 'bg-mborderh/40',  text: 'text-mtext2',  border: 'border-mborder/50' },
  'snoozed':        { label: 'Snoozed',    bg: 'bg-amber-500/10',  text: 'text-amber-300',  border: 'border-amber-500/30' },
};

// ──────────────────────────────────────────────────────────────────────
// QUERY_TEMPLATES — schedule-driven triggers, verbatim from PRD v1.0 §5.
//
// Per PRD §5, scheduled work is modeled as `(query template + N parameter
// + cadence)`. The N is BAKED INTO the query (e.g. "Trips departing in N
// days"), not a separate offset chip on top of a named source. Cadence is
// prescribed per query in the PRD §5 table.
//
// For the wizard (v2 rewrite, 2026-05-28):
//   - The dropdown lists these labels verbatim
//   - `[N]` numeric input appears inline when `has_n: true`
//   - `cadence` is auto-defaulted and HIDDEN from the wizard UI
//   - `default_origin`, `default_task_type`, `default_routing_tier` pre-fill
//     locked chips in Step 2 (with "override" links for power users)
// ──────────────────────────────────────────────────────────────────────
const QUERY_TEMPLATES = [
  { id: 'trips-departing-n-days',       label: 'Trips departing in N days',                            has_n: true,  n_unit: 'days',   default_cadence: 'Daily',      default_origin: 'Trip-lifecycle',      default_task_type: 'trip-prep',           default_routing_tier: 'Auto' },
  { id: 'birthday-anniversary-n-days',  label: 'Birthday or anniversary in N days',                    has_n: true,  n_unit: 'days',   default_cadence: 'Daily',      default_origin: 'Relationship',        default_task_type: 'messaging',           default_routing_tier: 'Escalate' },
  { id: 'visa-passport-expiring',       label: 'Visa or passport expiring in less than N months',      has_n: true,  n_unit: 'months', default_cadence: 'Daily',      default_origin: 'World-driven',        default_task_type: 'trip-prep',           default_routing_tier: 'Auto' },
  { id: 'trips-stuck',                  label: 'Trips stuck in same stage for more than N days',       has_n: true,  n_unit: 'days',   default_cadence: 'Daily',      default_origin: 'Internal operations', default_task_type: 'ops-internal',        default_routing_tier: 'Assist' },
  { id: 'clients-no-message',           label: 'Clients with no message for more than N hours',        has_n: true,  n_unit: 'hours',  default_cadence: 'Hourly',     default_origin: 'Internal operations', default_task_type: 'messaging',           default_routing_tier: 'Assist' },
  { id: 'tasks-past-due',               label: 'Tasks past due-date',                                  has_n: false, default_cadence: '15-min',     default_origin: 'Internal operations', default_task_type: 'ops-internal',        default_routing_tier: 'Escalate' },
  { id: 'saved-hotel-rate',             label: 'Saved searches: hotel rate at or below threshold',     has_n: false, default_cadence: 'Hourly',     default_origin: 'World-driven',        default_task_type: 'booking-action',      default_routing_tier: 'Assist' },
  { id: 'saved-award-space',            label: 'Saved searches: award space appears',                  has_n: false, default_cadence: '15-min',     default_origin: 'World-driven',        default_task_type: 'booking-action',      default_routing_tier: 'Assist' },
  { id: 'sla-timers',                   label: 'SLA timers approaching breach',                        has_n: false, default_cadence: 'Continuous', default_origin: 'Internal operations', default_task_type: 'ops-internal',        default_routing_tier: 'Escalate' },
  { id: 'loyalty-milestone',            label: 'Loyalty milestone (3rd trip, 5-year mark, etc.)',      has_n: false, default_cadence: 'Daily',      default_origin: 'Relationship',        default_task_type: 'member-context',      default_routing_tier: 'Escalate' },
  { id: 'custom-query',                 label: 'Custom query (Linear ticket required)',                has_n: false, default_cadence: 'Daily',      default_origin: 'Internal operations', default_task_type: 'ops-internal',        default_routing_tier: 'Assist', requires_eng_ticket: true },
];

function getQueryTemplate(id) {
  return QUERY_TEMPLATES.find(q => q.id === id) || null;
}
