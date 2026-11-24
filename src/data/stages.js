/**
 * @typedef {Object} StageDefinition
 * @property {string} id - Unique identifier for the stage ('plan' | 'spec' | 'tickets' | 'implement' | 'review')
 * @property {string} name - Display name for the stage
 * @property {string} boundary - Canonical boundary assignment
 * @property {string} agentExecution - Autonomous agent execution responsibilities
 * @property {string} humanOversight - Human oversight and gate checkpoint responsibilities
 * @property {string} purpose - Summary of stage objective
 * @property {string[]} inputs - Required input artifacts and context
 * @property {string[]} outputs - Produced artifacts and outcomes
 * @property {string} checkpoint - Verification checkpoint and gate condition
 * @property {string[]} antiDriftGuarantees - Guarantees preventing architectural and scope drift
 */

export const STAGES = [
  {
    id: 'plan',
    name: 'Plan',
    boundary: 'Boundary 1: Mapping',
    agentExecution: 'Agent maps/researches',
    humanOversight: 'Human approves Boundary 1',
    purpose: 'Resolve architectural uncertainty, clear technical fog, and settle decisions before drafting specifications.',
    inputs: [
      'Problem statement or feature request',
      'Existing codebase architecture and repository conventions',
      'Open architectural forks and external dependencies',
    ],
    outputs: [
      'Settled Decision Map (ship-it:map)',
      'Resolved decision tickets across research, prototype, grilling, and task types',
      'Settled technical direction and architectural boundaries',
    ],
    checkpoint: 'Autonomous exploration loops until open fog clears, halting at the Boundary 1 exit for human direction.',
    antiDriftGuarantees: [
      'Confines exploration to isolated decision tickets.',
      'Protects conductor context from raw research transcripts.',
      'Blocks premature implementation until all open decisions resolve.',
    ],
  },
  {
    id: 'spec',
    name: 'Spec',
    boundary: 'Boundary 2: Definition',
    agentExecution: 'Agent drafts & validates',
    humanOversight: 'Human answers blockers',
    purpose: 'Draft detailed user stories, implementation decisions, and explicit test seams for settled requirements.',
    inputs: [
      'Settled Decision Map or clear feature destination',
      'System requirements and architectural boundaries',
      'Repository testing patterns and component conventions',
    ],
    outputs: [
      'Validated Feature Specification (ship-it:spec)',
      'Surgical low-level design contracts and module touchpoints',
      'Explicit verification strategy and test seams',
    ],
    checkpoint: 'Autonomous drafting and fresh-context validation. Once the spec carries ship-it:validated it continues straight to Tickets with no halt.',
    antiDriftGuarantees: [
      'Adversarial validation subagent audits spec completeness in a fresh context.',
      'Requires the ship-it:validated label before decomposition.',
      'Halts for a human after two non-approved validation passes.',
    ],
  },
  {
    id: 'tickets',
    name: 'Tickets',
    boundary: 'Boundary 2: Definition',
    agentExecution: 'Agent slices & validates',
    humanOversight: 'Human approves Boundary 2',
    purpose: 'Decompose the validated specification into ordered, self-contained tracer-bullet tickets as vertical slices.',
    inputs: [
      'Validated Feature Specification',
      'Module boundaries and file touchpoints',
      'Dependency graph and ticket ordering constraints',
    ],
    outputs: [
      'Ordered GitHub issues labeled ship-it:ticket',
      'Validated tracer bullets with explicit acceptance criteria',
      'Explicit blocked-by ordering between tickets',
    ],
    checkpoint: 'Autonomous decomposition, then a halt at the Boundary 2 exit once every ticket carries ship-it:validated.',
    antiDriftGuarantees: [
      'Validates all tickets in a fresh context before execution.',
      'Enforces strict acceptance criteria on every ticket.',
      'Ensures incremental delivery through vertical slices.',
    ],
  },
  {
    id: 'implement',
    name: 'Implement & Review',
    boundary: 'Boundary 3: Execution',
    agentExecution: 'Agent builds Red-Green & reviews diffs',
    humanOversight: 'Human steps in after two non-approved passes',
    purpose: 'Build each vertical slice from a recorded git fixed point, then review it in a fresh context before closing the ticket.',
    inputs: [
      'Assigned tracer-bullet ticket and parent spec',
      'Feature branch <type>/<slug> cut from the default branch',
      'Existing test runners and module conventions',
    ],
    outputs: [
      'Verified working code commits tagged with ticket numbers',
      'Red-Green unit and integration tests',
      'Detailed handoff comment with verification evidence',
    ],
    checkpoint: 'Autonomous implement-and-review loop per ticket. Continues to Final Review once all tickets close.',
    antiDriftGuarantees: [
      'Anchors diff inspection to recorded git fixed points.',
      'Reviewers audit each diff on two axes: Standards and Spec.',
      'Tracks code provenance through ticket-tagged commit subjects.',
    ],
  },
  {
    id: 'review',
    name: 'Final Review & PR',
    boundary: 'Boundary 3: Execution',
    agentExecution: 'Agent runs final review & annotates PR',
    humanOversight: 'Human reviews and merges PR',
    purpose: 'Review the full branch against the specification, then open an annotated pull request for human merge.',
    inputs: [
      'Working branch commits and fixed-point diff',
      'Ticket acceptance criteria and spec contracts',
      'Automated test suite execution results',
    ],
    outputs: [
      'Full-branch final review verdict',
      'Pull request that closes the spec issue',
      'File-level annotations: Change, Why, Traces to',
    ],
    checkpoint: 'Boundary 3 exit halt: the PR opens and waits for a human merge. ship-it never merges.',
    antiDriftGuarantees: [
      'Evaluates changes in fresh context to avoid familiarity bias.',
      'Traces every changed file to its ticket and spec section.',
      'Enforces human control by requiring explicit approval to merge.',
    ],
  },
];

export const STAGES_BY_ID = Object.fromEntries(STAGES.map((s) => [s.id, s]));

export default STAGES;
