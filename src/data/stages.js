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
    checkpoint: 'Autonomous drafting followed by adversarial validation audit before ticket decomposition begins.',
    antiDriftGuarantees: [
      'Adversarial validation subagent audits spec completeness in a fresh context.',
      'Requires zero-blocker audit verdict before decomposition.',
      'Prevents creeping scope by enforcing strict non-goals.',
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
      'Traceability matrix linking tickets to spec sections',
    ],
    checkpoint: 'Autonomous decomposition followed by batch ticket validation audit before Boundary 2 exit halt.',
    antiDriftGuarantees: [
      'Validates all tickets in a fresh context before execution.',
      'Enforces strict acceptance criteria on every ticket.',
      'Ensures incremental delivery through vertical slices.',
    ],
  },
  {
    id: 'implement',
    name: 'Implement',
    boundary: 'Boundary 3: Execution',
    agentExecution: 'Agent builds Red-Green & reviews diffs',
    humanOversight: 'Human handles rework retries',
    purpose: 'Build vertical slices sequentially from recorded git fixed points with test-driven verification.',
    inputs: [
      'Assigned tracer-bullet ticket and parent spec',
      'Git repository working branch from default branch',
      'Existing test runners and module conventions',
    ],
    outputs: [
      'Verified working code commits tagged with ticket numbers',
      'Red-Green unit and integration tests',
      'Detailed handoff comment with verification evidence',
    ],
    checkpoint: 'Autonomous implementation and local test pass, yielding immediately to review subagent.',
    antiDriftGuarantees: [
      'Anchors diff inspection to recorded git fixed points.',
      'Enforces positive acceptance criteria with Red-Green tests.',
      'Tracks code provenance through ticket-tagged commit subjects.',
    ],
  },
  {
    id: 'review',
    name: 'Review',
    boundary: 'Boundary 3: Execution',
    agentExecution: 'Agent runs final review & annotates PR',
    humanOversight: 'Human reviews and merges PR',
    purpose: 'Audit implementation correctness against specification using two-axis evaluation and human oversight.',
    inputs: [
      'Working branch commits and fixed-point diff',
      'Ticket acceptance criteria and spec contracts',
      'Automated test suite execution results',
    ],
    outputs: [
      'Two-axis review report with structured verdicts',
      'Changes requested feedback or approval verdict',
      'Pull request review annotations and merge approval',
    ],
    checkpoint: 'Human-in-the-loop oversight gate requiring approval before pull request merge and close-out.',
    antiDriftGuarantees: [
      'Evaluates changes in fresh context to avoid familiarity bias.',
      'Audits both specification compliance and code hygiene on two axes.',
      'Enforces human control by requiring explicit approval to merge.',
    ],
  },
];

export const STAGES_BY_ID = Object.fromEntries(STAGES.map((s) => [s.id, s]));

export default STAGES;
