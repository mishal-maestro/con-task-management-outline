// data.js -- Page metadata and navigation config for Conductor Task Management prototype

const NAV_CONFIG = [
  { type: 'link', id: 'system-overview',  section: 'Map',    label: 'System Overview',         href: 'system-overview.html' },
  { type: 'link', id: 'index',            section: '§1',     label: 'Overview',                href: 'index.html' },
  { type: 'link', id: 'definitions',      section: '§2',     label: 'Definitions',             href: 'definitions.html' },
  { type: 'link', id: 'origins',          section: '§3',     label: 'Task Origins',            href: 'origins.html' },
  { type: 'link', id: 'event-streams',    section: '§4',     label: 'Event-driven Streams',    href: 'event-streams.html' },
  { type: 'link', id: 'schedule-streams', section: '§5',     label: 'Schedule-driven Streams', href: 'schedule-streams.html' },
  { type: 'link', id: 'routing',          section: '§6',     label: 'Routing Logic',           href: 'routing.html' },
  { type: 'link', id: 'lifecycle',        section: '§7',     label: 'Lifecycle',               href: 'lifecycle.html' },
  { type: 'link', id: 'open-questions',   section: '§8',     label: 'Open Questions',          href: 'open-questions.html' },
  { type: 'link', id: 'success-metrics',  section: '§10',    label: 'Success Metrics',         href: 'success-metrics.html' },
  {
    type: 'group',
    id: 'appendix',
    section: 'App.',
    label: 'Appendix',
    items: [
      { id: 'creation-flow',        section: 'A', label: 'Creation Flow',        href: 'creation-flow.html' },
      { id: 'task-inventory',       section: 'B', label: 'Task Inventory',       href: 'task-inventory.html' },
      { id: 'stream-direction',     section: 'C', label: 'Stream Direction',     href: 'stream-direction.html' },
      { id: 'example-records',      section: 'D', label: 'Example Records',      href: 'example-records.html' },
      { id: 'analogy-walkthroughs', section: 'E', label: 'Analogy Walkthroughs', href: 'analogy-walkthroughs.html' },
      { id: 'task-types',           section: 'F', label: 'Task Types',           href: 'task-types.html' },
    ],
  },
  {
    type: 'group',
    id: 'execution',
    section: 'EXEC',
    label: 'Execution Layer (v0.1)',
    items: [
      { id: 'execution-overview',  section: '', label: 'Execution Overview',  href: 'execution-overview.html' },
      { id: 'execution-triggers',  section: '', label: 'Triggers',            href: 'execution-triggers.html' },
      { id: 'execution-executors', section: '', label: 'Executors',           href: 'execution-executors.html' },
      { id: 'execution-state',     section: '', label: 'State Machine',       href: 'execution-state.html' },
      { id: 'execution-examples',  section: '', label: 'Execution Examples',  href: 'execution-examples.html' },
      { id: 'execution-questions', section: '', label: 'Open Questions',      href: 'execution-questions.html' },
    ],
  },
  {
    type: 'group',
    id: 'agent-mode',
    section: 'AGENT',
    label: 'Agent Mode',
    items: [
      { id: 'agent-overview',    section: '', label: 'Overview',              href: 'agent-overview.html' },
      { id: 'agent-epics',       section: '', label: 'Epics & Stories',       href: 'agent-epics.html' },
      { id: 'agent-walkthrough', section: '', label: 'Hero-flow Walkthrough', href: 'agent-walkthrough.html' },
      { id: 'agent-helpers',     section: '', label: 'Helper Agents',         href: 'agent-helpers.html' },
    ],
  },
  { type: 'link', id: 'changelog', section: 'Log', label: 'Changelog', href: 'changelog.html' },
  {
    type: 'group',
    id: 'prototype',
    section: 'UI',
    label: 'Prototype (clickable)',
    items: [
      { id: 'proto-index',         section: '', label: 'Prototype index',     href: 'prototype/index.html' },
      { id: 'proto-overview',      section: '', label: 'App · Overview',      href: 'prototype/overview.html' },
      { id: 'proto-trips',         section: '', label: 'App · Trips',         href: 'prototype/trips.html' },
      { id: 'proto-task-board',    section: '', label: 'App · Tasks',         href: 'prototype/task-board.html' },
      { id: 'proto-inline-create', section: '', label: 'App · Chat',          href: 'prototype/inline-create.html' },
      { id: 'proto-agent',         section: '', label: 'App · Agent',         href: 'prototype/agent.html' },
      { id: 'proto-admin-panel',    section: '',  label: 'App · Admin',                href: 'prototype/admin-panel.html' },
      { id: 'proto-admin-panel-v2', section: 'v2', label: 'App · Admin (v2 proposed)', href: 'prototype/admin-panel-v2.html' },
    ],
  },
];

const PAGE_DATA = {
  title: 'Conductor Task Management',
  version: 'Interactive Outline · v1.0 + Execution v0.1 (draft)',
  notionUrl: 'https://www.notion.so/35fd1ecb2189816fbd68fbce0cac241a',
};
