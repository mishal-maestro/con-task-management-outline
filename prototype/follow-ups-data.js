// follow-ups-data.js — fixture data for the Follow-ups ("Reply Desk") view.
// Models Shaloo's Jul 20 Reply Desk digest structure as a live Conductor
// projection: ACT NOW / WAITING ON MEMBER buckets + VERIFIED TODAY facts.
// Members and owners reuse the task-data.js fixture world (fictional).
// Each item carries source_task provenance: the view is a projection over
// conductor_tasks + conversations, not a separate pipeline.

const FOLLOWUPS = [
  // ── ACT NOW: member is mid-transaction or was promised something ──
  {
    id: 'fu-001', bucket: 'act-now',
    reason: 'awaiting-reply', reason_label: 'Awaiting reply 1h',
    sla_stage: 'red', sla_label: 'SLA red · 62m',
    member: 'Greer family', context: 'Greer · Tokyo Apr 30 · WhatsApp',
    owner: 'mc', support: ['js'],
    headline: 'Mid-award-booking, open name question on the ticket',
    detail: 'Asked at 11:53 AM whether the second traveler needs her own Flying Blue account before he pays. Award space re-verified 20 min ago. Nothing is ticketed yet, so the name must be right on this step.',
    why_now: { label: 'Mid-booking · money at risk', tone: 'danger' },
    due: 'Reply now',
    verify: [
      { text: 'Re-verify JAL First award space before he pays', done: true },
      { text: 'Confirm passenger-name rules (verified today, see facts panel)', done: true },
    ],
    draft: 'Great question, and good timing since nothing is ticketed yet. You can book the seat in her name directly from your own account, she does not need her own. On the passenger details step choose "I book for someone else" and enter her name exactly as it appears on her passport. One important thing: the name on an issued ticket cannot be changed afterward, so this is the step to get right. Before you pay, send us a quick screenshot of the flights showing on your end and we will confirm the award space is still the one we found. Happy to hop on a call and walk through it live.',
    evidence: [
      { label: 'Greer thread · 11:53 AM', url: '#' },
      { label: 'Seats.aero re-check · 20 min ago', url: '#' },
    ],
    source_task: 'tsk-001', signal: 'AI · Conversation watcher', confidence: 92,
  },
  {
    id: 'fu-002', bucket: 'act-now',
    reason: 'open-promise', reason_label: 'Promise unmet 5h',
    member: 'Patel household', context: 'Patel · Tuscany Jun 22 · Stream Chat',
    owner: 'js', support: [],
    headline: 'Promised "best options shortly" at 7:11 AM, quiet 5h since',
    detail: 'Member confirmed dates and party size at 7:05 AM. We said "back shortly with the best options." That was 5+ hours ago. Send options or a time-boxed update now.',
    why_now: { label: 'Open promise · 5h old', tone: 'danger' },
    due: 'Today, before EOD her time',
    verify: [
      { text: 'Villa shortlist ready? If not, commit a real time', done: false },
    ],
    draft: 'Quick update while we finish the search: we are locking in the June 22 arrival and keeping the party of 8 plus the dog in every option we shortlist. You will have the strongest options from us by [commit a real time today].',
    evidence: [
      { label: 'Patel thread · 7:05 AM', url: '#' },
    ],
    source_task: 'tsk-005', signal: 'AI · Conversation watcher', confidence: 84,
  },

  // ── WAITING ON MEMBER: we sent, they are quiet, nudge window applies ──
  {
    id: 'fu-101', bucket: 'waiting',
    reason: 'waiting-on-member', reason_label: 'Nudge window open',
    member: 'Bowman', context: 'Bowman · Patagonia Aug · WhatsApp',
    owner: 'mc', support: ['tk'],
    headline: 'Award deal flagged with ~24h window, expiring about now',
    detail: 'Business award deal sent 4:48 PM yesterday with a roughly 24h booking window. If space still shows, one honest nudge: dates in hand, we book.',
    why_now: { label: 'Window expiring', tone: 'warning' },
    quiet_for: 'Quiet 20h',
    verify: [
      { text: 'Re-verify award space still shows before nudging', done: false },
    ],
    draft: 'Quick heads up, the award window we flagged yesterday is closing. Space is still showing as of this morning. If the dates work, reply here and we lock it in today.',
    evidence: [ { label: 'Deal message · yesterday 4:48 PM', url: '#' } ],
    source_task: 'tsk-002', signal: 'AI · Scheduled query', confidence: 81,
  },
  {
    id: 'fu-102', bucket: 'waiting',
    reason: 'waiting-on-member', reason_label: 'Nudge window open',
    member: 'Whitman', context: 'Whitman · Frankfurt May 16 · Email',
    owner: 'tk', support: [],
    headline: '4 business seats sent 12:32 AM, quiet ~12h',
    detail: 'Four seats on the same flight, they go fast. Verify the seats still show, then nudge: reply and we lock all four.',
    why_now: { label: 'Inventory risk', tone: 'warning' },
    quiet_for: 'Quiet 12h',
    verify: [
      { text: 'Confirm the 4 seats still show before nudging', done: false },
    ],
    draft: 'Checking in on the four seats we sent overnight. They are still showing this morning but four together tends to disappear quickly. Reply when you have a moment and we will lock all four.',
    evidence: [ { label: 'Options email · 12:32 AM', url: '#' } ],
    source_task: 'tsk-003', signal: 'AI · Scheduled query', confidence: 87,
  },
  {
    id: 'fu-103', bucket: 'waiting',
    reason: 'waiting-on-member', reason_label: 'Nudge window opens 6 PM',
    member: 'Castelli', context: 'Castelli · Tokyo May 25 · WhatsApp',
    owner: 'rp', support: [],
    headline: 'Itinerary proposal sent 11:31 AM, nudge this evening if quiet',
    detail: '3 rooms held on the proposal. Hold expires in 2 days. No reply needed from us until this evening; nudge only if still quiet.',
    why_now: { label: 'Nudge window opens 6 PM', tone: 'info' },
    quiet_for: 'Quiet 4h',
    verify: [
      { text: 'Room hold still active (auto-checked 1h ago)', done: true },
    ],
    draft: 'Wanted to make sure the proposal reached you this morning. The three rooms are held for another two days, so no rush, but if anything needs adjusting we can turn changes around same day.',
    evidence: [ { label: 'Proposal · 11:31 AM', url: '#' } ],
    source_task: 'tsk-004', signal: 'AI · Scheduled query', confidence: 90,
  },
  {
    id: 'fu-104', bucket: 'waiting',
    reason: 'waiting-on-member', reason_label: 'Check-in tomorrow',
    member: 'Halverson', context: 'Halverson · Croatia · Stream Chat',
    owner: 'mc', support: [],
    headline: 'Everything delivered by 10:01 AM, check in tomorrow if quiet',
    detail: 'Villas, ferry times and pricing all delivered this morning. Low urgency: standard next-day check-in only if still quiet.',
    why_now: { label: 'Check-in tomorrow', tone: 'info' },
    quiet_for: 'Quiet 3h',
    verify: [],
    draft: 'Just checking the villa options landed well. If any of the three stood out we can hold it while you decide on the ferry timing.',
    evidence: [ { label: 'Delivery thread · 10:01 AM', url: '#' } ],
    source_task: 'tsk-002', signal: 'AI · Scheduled query', confidence: 78,
  },
];

// ── VERIFIED TODAY: reusable facts captured on task/conversation resolution ──
const VERIFIED_FACTS = [
  {
    id: 'vf-001',
    title: 'Flying Blue: booking for someone else',
    body: 'The traveler does NOT need her own account. Book from your own account, choose "I book for someone else" at the passenger step, enter the name exactly as on the passport. Names are locked once ticketed.',
    sources: [ { label: 'flyingblue.us', url: '#' }, { label: '10xTravel', url: '#' } ],
    verified_by: 'mc', verified_at: 'Today 12:04 PM', from_task: 'tsk-001',
  },
  {
    id: 'vf-002',
    title: 'EES is live across Schengen',
    body: 'Photo plus fingerprints on first entry, Portugal included. The official free "Travel to Europe" app takes the entry questionnaire within 72h before arrival. Use the current link, the older template link 404s. EES is not ETIAS; ETIAS is not required yet.',
    sources: [ { label: 'travel-europe.europa.eu', url: '#' } ],
    verified_by: 'rp', verified_at: 'Today 9:40 AM', from_task: 'tsk-006',
  },
  {
    id: 'vf-003',
    title: 'Flying Blue award changes and cancellations',
    body: 'EUR 70 before the check-in deadline, waived for Platinum.',
    sources: [ { label: 'flyingblue.us', url: '#' } ],
    verified_by: 'mc', verified_at: 'Today 12:06 PM', from_task: 'tsk-001',
  },
];

// ── Manager view fixtures ──
// "Falling through the cracks": items no TA-level view surfaces because they
// have no owner, or their window/promise lapsed without action. Mirrors the
// digest's SPOT-CHECK section.
const CRACKS = [
  {
    id: 'cr-001', type: 'unowned', severity: 'danger',
    text: 'New member Ainsley Park has no owner. Joined 6 days ago, deal blasts only, replied to this morning\'s greeting.',
    action: 'Assign owner',
  },
  {
    id: 'cr-002', type: 'promise-overdue', severity: 'danger', owner: 'js',
    text: 'Patel: "best options shortly" promised at 7:11 AM, unmet 5h and counting. Longest open promise on the board.',
    action: 'Open item',
  },
  {
    id: 'cr-003', type: 'window-lapsed', severity: 'warning', owner: 'mc',
    text: 'Bowman: 24h deal window has expired with no nudge sent. Space last verified yesterday.',
    action: 'Open item',
  },
  {
    id: 'cr-004', type: 'identity', severity: 'info',
    text: 'Halverson and Park-Halverson threads may be the same household. Confirm before the next send so nobody gets double-touched.',
    action: 'Review records',
  },
];

// Handled since yesterday, per owner (drives the manager summary + table).
const HANDLED_TODAY = { mc: 4, js: 2, rp: 3, tk: 1 };

// ── Conversation threads per follow-up (chat-module message shape, cf. inline-create.html).
// sender: 'client' | 'ops' | 'system'. trigger: the message the follow-up cites.
const THREADS = {
  'fu-001': [
    { sender: 'ops', name: 'Maya', time: '10:40 AM', text: 'Found it: JAL First (JL061) showing 2 award seats Apr 30, IAD to HND, 120k Flying Blue each. Walkthrough attached. Say the word and we hold.' },
    { sender: 'client', name: 'Sarah Greer', time: '11:48 AM', text: 'Amazing. Starting the booking now from my account.' },
    { sender: 'client', name: 'Sarah Greer', time: '11:53 AM', trigger: true, text: 'Wait, quick one before I pay. Can I put my sister on the second seat from MY account, or does she need her own Flying Blue account first? Do not want to mess this up.' },
    { sender: 'system', time: '12:55 PM', text: 'SLA · waiting on our reply for 62m · red' },
  ],
  'fu-002': [
    { sender: 'client', name: 'Anaya Patel', time: '7:05 AM', text: 'Confirmed! June 22 arrival works, party of 8 plus the dog. Go ahead.' },
    { sender: 'ops', name: 'Jordan', time: '7:11 AM', trigger: true, text: 'Perfect, locking that in. We will be back shortly with the best villa options.' },
    { sender: 'system', time: '12:11 PM', text: 'Promise open · "back shortly" · 5h with no follow-through' },
  ],
  'fu-101': [
    { sender: 'ops', name: 'Maya', time: 'yesterday 4:48 PM', trigger: true, text: 'Rob, business award space just opened on your Patagonia dates. These windows usually hold about 24h. Dates in hand, we book. Want it?' },
    { sender: 'system', time: 'today 12:40 PM', text: 'No member reply · quiet 20h · window expiring' },
  ],
  'fu-102': [
    { sender: 'ops', name: 'Tomás', time: '12:32 AM', trigger: true, text: 'Ed, four business seats together on the same flight for Frankfurt, May 16. Four together goes fast. Reply and we lock all four.' },
    { sender: 'system', time: '12:30 PM', text: 'No member reply · quiet 12h' },
  ],
  'fu-103': [
    { sender: 'ops', name: 'Rae', time: '11:31 AM', trigger: true, text: 'Lucia, your Tokyo proposal is ready: three rooms held, itinerary attached. Holds are good for two days, so no rush.' },
    { sender: 'system', time: '12:31 PM', text: 'Room hold auto-checked 1h ago · still active · nudge window opens 6 PM' },
  ],
  'fu-104': [
    { sender: 'client', name: 'Dana Halverson', time: '9:12 AM', text: 'Any luck with the Croatia villas?' },
    { sender: 'ops', name: 'Maya', time: '10:01 AM', trigger: true, text: 'All three villa options, ferry times and full pricing are in your trip page now. The Hvar one books out fastest if any of them stands out.' },
  ],
};

// What fed each item (drawer source chips). All three are live v1 sources.
const ITEM_SOURCES = {
  'fu-001': ['conversation', 'sla', 'task'],
  'fu-002': ['conversation', 'task'],
  'fu-101': ['conversation', 'task'],
  'fu-102': ['conversation', 'task'],
  'fu-103': ['conversation', 'task'],
  'fu-104': ['conversation'],
};
const SOURCE_LABELS = { conversation: 'Conversation', sla: 'SLA timer', task: 'Task plane' };
