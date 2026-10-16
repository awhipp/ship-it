import React, { useState } from 'react';

const FLOW_METADATA = {
  map: {
    id: 'map',
    tabLabel: 'Map Lifecycle',
    tabBadge: 'Boundary 1: Mapping',
    artifactLabel: 'Decision Map (ship-it:map)',
    comparison: {
      primaryGoal: 'Resolve architectural uncertainty and choose a direction.',
      whenToUse: 'Use when architectural fog, technical forks, or unknown APIs exist.',
      workUnits: 'Decision tickets: research, prototype, grilling, task.',
      coreOutput: 'Recorded technical decisions and cleared fog.',
      exitGate: 'Boundary 1 Gate: All open decisions are settled.',
    },
    blurbTitle: 'When a Map Occurs (Boundary 1: Mapping)',
    blurbIntro:
      'Chart a decision map when entering a feature with open technical questions or architectural fog.',
    blurbBullets: [
      {
        lead: 'Explore Alternatives',
        text: 'Compare multiple design approaches before committing to an implementation plan.',
      },
      {
        lead: 'Clear Technical Fog',
        text: 'Clarify unknown APIs, external dependencies, or ambiguous system constraints.',
      },
      {
        lead: 'Run Decision Tickets',
        text: 'Loop through open decision tickets across four types: research, prototype, grilling, and task.',
      },
      {
        lead: 'Exit Halt',
        text: 'While open decision tickets or unphrased fog remain, the conductor continues routing inside Boundary 1. When all decisions resolve, the conductor closes the map and halts at the Boundary 1 exit.',
      },
    ],
  },
  spec: {
    id: 'spec',
    tabLabel: 'Spec Lifecycle',
    tabBadge: 'Boundaries 2 & 3: Definition & Execution',
    artifactLabel: 'Feature Specification (ship-it:spec)',
    comparison: {
      primaryGoal: 'Deliver settled requirements through verified code.',
      whenToUse: 'Use when destination, technical design, and scope boundaries are clear.',
      workUnits: 'Tracer-bullet tickets: vertical slices of end-to-end functionality.',
      coreOutput: 'Production pull request with tests, documentation, and review audit.',
      exitGate: 'Boundary 3 Gate: All tickets pass two-axis review and final audit.',
    },
    blurbTitle: 'When a Spec Occurs (Boundary 2: Definition & Boundary 3: Execution)',
    blurbIntro:
      'Draft a specification when the feature destination and technical architecture are fully settled.',
    blurbBullets: [
      {
        lead: 'Define and Validate the Specification',
        text: 'Specify user stories, implementation decisions, explicit test seams, and non-goals, then audit the specification via a fresh validate subagent. On validation pass, execution continues automatically to ticket slicing within Boundary 2.',
      },
      {
        lead: 'Slice and Validate Tracer Bullets',
        text: 'Decompose the validated specification into ordered GitHub issues via the slice subagent and audit the full ticket set via a fresh validate subagent. On validation pass, the conductor halts at the Boundary 2 exit.',
      },
      {
        lead: 'Execute Verified Vertical Slices',
        text: 'Implement each unblocked ticket on <type>/<slug> from a recorded Fixed point: <sha> (implement subagent), verify with Red-Green tests or direct checks, and audit each diff via independent two-axis review (review subagent). Once all tickets close, execution continues automatically to the final review within Boundary 3.',
      },
      {
        lead: 'Audit and Ship',
        text: 'Audit the complete branch diff against the specification (final-review subagent, halting for approval if fix tickets are created). On approval, open an annotated pull request (close-out subagent) and halt at the Boundary 3 exit for manual merge.',
      },
    ],
  },
};

const DECISION_TICKET_SUBCARDS = {
  research: {
    key: 'research',
    title: 'Research Ticket',
    label: 'ship-it:research',
    owner: 'Subagent: decide',
    transitionBadge: 'Continuous intra-boundary transition',
    headline: 'Research (ship-it:research) — Inspect Code and APIs',
    summary:
      'Inspect documentation, existing source code, and external APIs via the decide subagent.',
    purpose:
      'Gathers concrete facts from repository files and external documentation to answer an open architectural question.',
    inputs: 'Open research question on the parent map issue, repository files, and API references.',
    outputs: 'Recorded evidence comment on the research ticket and an updated decision entry on the map.',
    humanCheckpoint:
      'Continuous intra-boundary transition: the decide subagent resolves the research ticket automatically unless an unwritten user requirement surfaces.',
    antiDrift:
      'Isolated subagent research keeps raw exploration logs out of the conductor session.',
    artifactTag: 'Artifact Preview: Research Decision Ticket (ship-it:research)',
    artifactStatus: 'Owner: Subagent: decide',
    artifactItems: [
      { badge: 'Label', text: 'ship-it:research (Part of Map #66)' },
      { badge: 'Owner', text: 'Subagent: decide (isolated context)' },
      { badge: 'Output', text: 'Findings posted and ticket closed automatically' },
    ],
  },
  prototype: {
    key: 'prototype',
    title: 'Prototype Ticket',
    label: 'ship-it:prototype',
    owner: 'Subagent: decide',
    transitionBadge: 'Continuous intra-boundary transition',
    headline: 'Prototype (ship-it:prototype) — Test Viability in Code',
    summary:
      'Build disposable proof-of-concept artifacts to evaluate behavior via the decide subagent.',
    purpose:
      'Validates a technical hypothesis with a minimal experiment before committing the production architecture.',
    inputs: 'Competing design options, benchmark criteria, and target runtime constraints.',
    outputs: 'Empirical test results posted to the prototype ticket and a settled architectural choice.',
    humanCheckpoint:
      'Continuous intra-boundary transition: the decide subagent executes the experiment and records findings without pausing the boundary.',
    antiDrift:
      'Disposable prototypes verify feasibility upfront so production branches stay clean.',
    artifactTag: 'Artifact Preview: Prototype Decision Ticket (ship-it:prototype)',
    artifactStatus: 'Owner: Subagent: decide',
    artifactItems: [
      { badge: 'Label', text: 'ship-it:prototype (Part of Map #66)' },
      { badge: 'Owner', text: 'Subagent: decide (isolated sandbox)' },
      { badge: 'Output', text: 'Feasibility verified and findings recorded' },
    ],
  },
  grilling: {
    key: 'grilling',
    title: 'Grilling Ticket',
    label: 'ship-it:grilling',
    owner: 'Conductor: interactive',
    transitionBadge: 'Interactive developer dialogue',
    headline: 'Grilling (ship-it:grilling) — Clarify Intent One Question at a Time',
    summary:
      'Answer structured questions one at a time interactively with the conductor to establish technical intent.',
    purpose:
      'Resolves product trade-offs and design preferences that depend on developer judgment.',
    inputs: 'Open design trade-offs, scope boundaries, and user experience choices.',
    outputs: 'Explicit developer answers recorded on the grilling ticket and synced to the map.',
    humanCheckpoint:
      'Interactive checkpoint: the conductor asks one focused question at a time and records your decision directly on the issue.',
    antiDrift:
      'One-at-a-time questioning prevents the conductor from guessing requirements or bundling assumptions.',
    artifactTag: 'Artifact Preview: Grilling Decision Ticket (ship-it:grilling)',
    artifactStatus: 'Owner: Conductor: interactive',
    artifactItems: [
      { badge: 'Label', text: 'ship-it:grilling (Part of Map #66)' },
      { badge: 'Owner', text: 'Conductor: interactive (1 question per turn)' },
      { badge: 'Output', text: 'Developer decision recorded in issue comments' },
    ],
  },
  task: {
    key: 'task',
    title: 'Task Ticket',
    label: 'ship-it:task',
    owner: 'Subagent: decide',
    transitionBadge: 'Continuous intra-boundary transition',
    headline: 'Task (ship-it:task) — Complete Prerequisite Setup',
    summary:
      'Complete prerequisite setup steps such as credentials or environment provisioning.',
    purpose:
      'Executes operational prerequisites required before specification and implementation can proceed.',
    inputs: 'Repository configuration, environment requirements, and setup checklists.',
    outputs: 'Verified prerequisite state recorded on the task ticket.',
    humanCheckpoint:
      'Continuous intra-boundary transition: the decide subagent completes automated setup tasks and requests input only when external credentials are required.',
    antiDrift:
      'Separating environment setup into explicit task tickets keeps feature diffs focused on product logic.',
    artifactTag: 'Artifact Preview: Task Decision Ticket (ship-it:task)',
    artifactStatus: 'Owner: Subagent: decide',
    artifactItems: [
      { badge: 'Label', text: 'ship-it:task (Part of Map #66)' },
      { badge: 'Owner', text: 'Subagent: decide (prerequisite execution)' },
      { badge: 'Output', text: 'Environment readiness confirmed' },
    ],
  },
};

const MAP_STAGES = [
  {
    id: 'map-init',
    step: '01',
    title: 'Map Initialization',
    subtitle: 'ship-it:map',
    transitionType: 'Continues automatically',
    badge: 'Boundary 1 · Stage 1',
    cli: 'gh issue create --label "ship-it:map"',
    headline: 'Chart the Decision Map',
    summary:
      'Check scope or architecture questions and publish the ship-it:map issue (continues automatically to decision tickets).',
    purpose:
      'Identifies open architectural questions and creates the parent ship-it:map issue as the tracking artifact for Boundary 1.',
    inputs: 'Feature directive, repository structure, and initial technical unknowns.',
    outputs: 'Published ship-it:map issue with initial decision tickets and a Fog section.',
    humanCheckpoint:
      'Continuous intra-boundary transition: execution continues automatically from map creation to decision ticket resolution.',
    antiDrift:
      'Capturing every open question on a GitHub issue prevents silent architectural assumptions.',
    artifactTag: 'Artifact Preview: Decision Map Initialization (ship-it:map)',
    artifactStatus: 'Transition: Continues to Decision Tickets',
    artifactItems: [
      { badge: 'Issue', text: '[slug] Map: Feature architecture decisions (ship-it:map)' },
      { badge: 'Section', text: 'Decisions so far · Open decision tickets · Fog' },
      { badge: 'Routing', text: 'Continues automatically within Boundary 1' },
    ],
  },
  {
    id: 'map-decision-tickets',
    step: '02',
    title: 'Decision Ticket Types',
    subtitle: 'research · prototype · grilling · task',
    transitionType: 'Select sub-card below',
    badge: 'Boundary 1 · Stage 2',
    cli: 'Subagent: decide | Conductor: interactive',
    headline: 'Resolve Focused Decision Tickets',
    summary:
      'Dispatch isolated decision tickets across research, prototype, grilling, and task types to settle technical unknowns.',
    purpose:
      'Breaks architectural uncertainty into discrete GitHub issues assigned to either the decide subagent or interactive conductor grilling.',
    inputs: 'Unresolved questions from the parent ship-it:map issue.',
    outputs: 'Resolved decision tickets across ship-it:research, ship-it:prototype, ship-it:grilling, and ship-it:task.',
    humanCheckpoint:
      'Hybrid intra-boundary execution: research, prototype, and task tickets run via Subagent: decide, while grilling tickets run interactively with the developer.',
    antiDrift:
      'Dedicated ticket types match each unknown to the right resolution mechanism before specification drafting begins.',
    artifactTag: 'Artifact Preview: Four Decision Ticket Types',
    artifactStatus: 'Select any sub-card above to inspect',
    artifactItems: [
      { badge: 'ship-it:research', text: 'Subagent: decide — codebase and API investigation' },
      { badge: 'ship-it:prototype', text: 'Subagent: decide — disposable proof-of-concept validation' },
      { badge: 'ship-it:grilling', text: 'Conductor: interactive — one-question-per-turn dialogue' },
      { badge: 'ship-it:task', text: 'Subagent: decide — prerequisite environment setup' },
    ],
  },
  {
    id: 'map-resolution-loop',
    step: '03',
    title: 'Resolution & Fog Loop',
    subtitle: 'Decisions so far',
    transitionType: 'Loops while tickets remain',
    badge: 'Boundary 1 · Stage 3',
    cli: 'gh issue edit <map> --body-file <updated-map>',
    headline: 'Sync Findings and Graduate Fog',
    summary:
      'Record findings, close resolved tickets, update Decisions so far, graduate fog into new decision tickets, and continue looping while open decision tickets remain.',
    purpose:
      'Synchronizes every resolved ticket back into the parent map issue and promotes newly uncovered fog items into actionable decision tickets.',
    inputs: 'Resolution comments from closed decision tickets and remaining items in the Fog list.',
    outputs: 'Updated Decisions so far ledger on the map issue and newly graduated decision tickets.',
    humanCheckpoint:
      'Continuous intra-boundary loop: the conductor loops back to pick the next open decision ticket automatically until zero open tickets and zero fog remain.',
    antiDrift:
      'Updating Decisions so far after each ticket keeps the architectural ledger current across sessions.',
    artifactTag: 'Artifact Preview: Map Sync & Fog Graduation',
    artifactStatus: 'Loop: Continues while open tickets remain',
    artifactItems: [
      { badge: 'Resolved', text: 'Append settled choice to Decisions so far' },
      { badge: 'Graduated', text: 'Convert remaining Fog items into new decision tickets' },
      { badge: 'Loop Gate', text: 'Route back to Stage 2 while open decision tickets exist' },
    ],
  },
  {
    id: 'map-exit-gate',
    step: '04',
    title: 'Boundary 1 Exit Gate',
    subtitle: 'ship-it <slug>',
    transitionType: '⏸ Halt (Boundary 1 exit)',
    badge: 'Boundary 1 · Exit Gate',
    cli: 'ship-it <slug>',
    headline: 'Close Map and Halt for Developer Approval',
    summary:
      'Close the map issue when no open decision tickets or fog remain and halt (Boundary 1 exit) for developer approval (ship-it <slug>).',
    purpose:
      'Finalizes the architectural map once every decision ticket closes and halts execution so you can review the settled direction.',
    inputs: 'Completed Decisions so far ledger with zero open decision tickets and zero remaining fog.',
    outputs: 'Closed ship-it:map issue and the Boundary 1 exit prompt awaiting ship-it <slug>.',
    humanCheckpoint:
      'Mandatory Boundary 1 exit halt: execution stops completely so you can verify all architectural decisions before invoking ship-it <slug> to start Boundary 2.',
    antiDrift:
      'Halting at Boundary 1 guarantees that specification drafting begins only after you approve the settled architecture.',
    artifactTag: 'Artifact Preview: Boundary 1 Exit Gate',
    artifactStatus: '⏸ Halt (Boundary 1 exit)',
    artifactItems: [
      { badge: 'Map State', text: 'All decision tickets closed · Zero fog remaining' },
      { badge: 'Boundary Halt', text: '⏸ Halt (Boundary 1 exit): Map closes with all decisions settled' },
      { badge: 'Next Action', text: 'Run ship-it <slug> to approve Boundary 1 and begin Spec' },
    ],
  },
];

const SPEC_STAGES = [
  {
    id: 'spec-boundary-2',
    step: '01',
    title: 'Boundary 2: Spec & Ticket Validation',
    subtitle: 'Boundary 2 Validation',
    transitionType: '⏸ Halt (Boundary 2 exit)',
    badge: 'Boundary 2 · Definition Gate',
    cli: 'Subagent: validate → Subagent: slice → Subagent: validate',
    headline: 'Draft Spec, Slice Tracer Bullets, and Validate Both',
    summary:
      'Draft the spec (ship-it:spec with Testing Decisions), run adversarial validation (Subagent: validate), continue automatically on pass to slice tracer-bullet tickets (Subagent: slice), validate the ticket set, and halt (Boundary 2 exit).',
    purpose:
      'Synthesizes settled decisions into a formal specification with Testing Decisions, validates the draft in a fresh context, slices ordered tracer-bullet tickets, and audits the ticket dependency graph.',
    inputs: 'Closed Decision Map (or clear feature request), repository conventions, and test seams.',
    outputs: 'Validated ship-it:spec issue and ordered ship-it:ticket issues carrying ship-it:validated.',
    humanCheckpoint:
      'Continuous Spec-to-Tickets transition followed by a mandatory Boundary 2 exit halt: Spec validation continues automatically to ticket slicing, then halts once every ticket carries ship-it:validated.',
    antiDrift:
      'Fresh-context validation subagents audit both the specification and the ticket set before implementation begins.',
    artifactTag: 'Artifact Preview: Boundary 2 Spec & Ticket Set Validation',
    artifactStatus: '⏸ Halt (Boundary 2 exit)',
    artifactItems: [
      { badge: '1. Spec Audit', text: 'Draft ship-it:spec with Testing Decisions → Subagent: validate' },
      { badge: '2. Auto-Slice', text: 'Continues on pass to Subagent: slice → ordered ship-it:ticket set' },
      { badge: '3. Boundary Halt', text: 'Subagent: validate audits ticket set → ⏸ Halt (Boundary 2 exit)' },
    ],
  },
  {
    id: 'spec-stage-1',
    step: '02',
    title: 'Stage 1: Implement with Verification',
    subtitle: 'Fixed point & Red-Green',
    transitionType: 'Continues to Review',
    badge: 'Boundary 3 · Stage 1',
    cli: 'Subagent: implement (Fixed point: <sha>)',
    headline: 'Build Vertical Slice with Domain-Aligned Verification',
    summary:
      'Check out <type>/<slug> and record Fixed point: <sha>. Build vertical slices with domain-aligned verification (Red-Green tests or direct checks, honoring the ad-hoc test harness prohibition, ephemeral subagent exploration, and final sweeps for negative invariants). Post handoff proof and continue automatically to review.',
    purpose:
      'Implements one unblocked ticket from a recorded Fixed point: <sha> using pragmatic, domain-aligned verification and ephemeral subagent exploration.',
    inputs: 'Earliest unblocked ship-it:ticket, parent specification, and dedicated feature branch <type>/<slug>.',
    outputs: 'Verified commits referencing #<ticket>, passing test suite or direct checks, negative invariant sweep, and Handoff comment.',
    humanCheckpoint:
      'Continuous intra-boundary transition: after posting the Handoff comment, execution continues automatically to independent two-axis review (halting only if an unwritten fact requires a question).',
    antiDrift:
      'Red-Green test cycles, the ad-hoc test harness prohibition, ephemeral subagent exploration, and final sweeps for negative invariants prevent untested or bloated changes.',
    artifactTag: 'Artifact Preview: Stage 1 Implementation Handoff',
    artifactStatus: 'Transition: Continues to Two-Axis Review',
    artifactItems: [
      { badge: 'Fixed Point', text: 'Recorded Fixed point: <sha> before first ticket commit' },
      { badge: 'Verification', text: 'Red-Green test suite or direct check (ad-hoc test harness prohibition)' },
      { badge: 'Discovery & Sweep', text: 'Ephemeral subagent exploration + final sweep for negative invariants' },
    ],
  },
  {
    id: 'spec-stage-2',
    step: '03',
    title: 'Stage 2: Two-Axis Review',
    subtitle: 'Standards + Spec axes',
    transitionType: 'Loops or continues to Final Review',
    badge: 'Boundary 3 · Stage 2',
    cli: 'Subagent: review | Subagent: rework',
    headline: 'Audit Ticket Diff Across Standards and Spec Axes',
    summary:
      'Run independent review (Subagent: review) across Standards and Spec axes with verified acceptance criteria proof. Run rework loops (Subagent: rework) when needed, close approved tickets, loop to the next open ticket, and continue automatically to Final Review once all tickets close.',
    purpose:
      'Audits the ticket diff since Fixed point: <sha> in a fresh subagent across coding standards and specification fidelity.',
    inputs: 'Branch diff from Fixed point: <sha> to HEAD, ticket acceptance criteria, and Handoff verification proof.',
    outputs: 'Two-axis review report with verified acceptance criteria proof, closed ticket on approval, or rework dispatch via Subagent: rework.',
    humanCheckpoint:
      'Continuous intra-boundary loop: approved tickets close and loop to the next unblocked ticket automatically, continuing to Final Review once all tickets close.',
    antiDrift:
      'Evaluating Standards and Spec axes in an isolated review subagent prevents author confirmation bias.',
    artifactTag: 'Artifact Preview: Two-Axis Review Scorecard',
    artifactStatus: 'Owner: Subagent: review / Subagent: rework',
    artifactItems: [
      { badge: 'Axis 1: Standards', text: 'Audits modularity, naming, and writing standard compliance' },
      { badge: 'Axis 2: Spec', text: 'Audits verified acceptance criteria proof against each requirement' },
      { badge: 'Loop Routing', text: 'Rework blockers via Subagent: rework or close ticket and advance' },
    ],
  },
  {
    id: 'spec-stage-3',
    step: '04',
    title: 'Stage 3: Final Review',
    subtitle: 'Full branch audit',
    transitionType: 'Continues to Close-Out',
    badge: 'Boundary 3 · Stage 3',
    cli: 'Subagent: final-review',
    headline: 'Audit Complete Branch Diff Against the Specification',
    summary:
      'Audit the full branch diff against the parent spec (Subagent: final-review). Halt for approval if fix tickets are created; otherwise continue automatically to close-out.',
    purpose:
      'Verifies that the integrated branch diff across all completed tickets satisfies every user story, design decision, and test seam in the parent specification.',
    inputs: 'Full git diff from origin/<default-branch>...HEAD and the validated parent specification.',
    outputs: 'Final review approval on the specification issue, or newly sliced fix tickets if cross-ticket gaps exist.',
    humanCheckpoint:
      'Conditional checkpoint: execution continues automatically to close-out on approval, or halts for developer review if fix tickets are created.',
    antiDrift:
      'Whole-branch auditing catches integration regressions that individual ticket reviews cannot see.',
    artifactTag: 'Artifact Preview: Final Branch Audit',
    artifactStatus: 'Owner: Subagent: final-review',
    artifactItems: [
      { badge: 'Scope', text: 'Complete diff across origin/<default-branch>...HEAD' },
      { badge: 'Contract', text: 'Verified against every section of parent ship-it:spec' },
      { badge: 'Routing', text: 'Continues to Annotated PR & Close-Out on approval' },
    ],
  },
  {
    id: 'spec-stage-4',
    step: '05',
    title: 'Stage 4: Annotated PR & Close-Out',
    subtitle: 'Subagent: close-out',
    transitionType: '⏸ Halt (Boundary 3 exit)',
    badge: 'Boundary 3 · Exit Gate',
    cli: 'Subagent: close-out (gh pr create)',
    headline: 'Open Pull Request with File-Level Rationale Annotations',
    summary:
      'Open the pull request (Subagent: close-out), post file-level change/why/traceability comments, and halt (Boundary 3 exit) for manual merge.',
    purpose:
      'Publishes the pull request linking all completed tickets and annotates every changed file with Change, Why, and Traces-to review comments.',
    inputs: 'Approved branch commits, ticket numbers from commit subjects, and parent specification sections.',
    outputs: 'Annotated GitHub pull request with Closes #<spec> and the Boundary 3 exit halt for manual merge.',
    humanCheckpoint:
      'Mandatory Boundary 3 exit halt: the conductor never merges the pull request; execution halts so you can inspect the annotated diff and merge.',
    antiDrift:
      'File-level traceability annotations link every modified file directly to its ticket and specification section.',
    artifactTag: 'Artifact Preview: Annotated Pull Request & Boundary 3 Exit',
    artifactStatus: '⏸ Halt (Boundary 3 exit)',
    artifactItems: [
      { badge: 'Pull Request', text: 'Opened via Subagent: close-out with Closes #<spec>' },
      { badge: 'Annotations', text: 'Every changed file annotated with Change, Why, and Traces to' },
      { badge: 'Boundary Halt', text: '⏸ Halt (Boundary 3 exit): PR opens and awaits human merge' },
    ],
  },
];

export function FlowVisualizer() {
  const [activeFlow, setActiveFlow] = useState('map');
  const [activeMapStageId, setActiveMapStageId] = useState(MAP_STAGES[0].id);
  const [activeDecisionTicketKey, setActiveDecisionTicketKey] = useState(null);
  const [activeSpecStageId, setActiveSpecStageId] = useState(SPEC_STAGES[0].id);

  const flowMeta = FLOW_METADATA[activeFlow];
  const stages = activeFlow === 'map' ? MAP_STAGES : SPEC_STAGES;
  const currentStageId = activeFlow === 'map' ? activeMapStageId : activeSpecStageId;
  const activeStage = stages.find((s) => s.id === currentStageId) || stages[0];

  const isMapDecisionStage = activeFlow === 'map' && activeMapStageId === 'map-decision-tickets';
  const activeSubCard =
    isMapDecisionStage && activeDecisionTicketKey
      ? DECISION_TICKET_SUBCARDS[activeDecisionTicketKey]
      : null;

  const inspectorData = activeSubCard
    ? {
        badge: `${activeStage.badge} · ${activeSubCard.label}`,
        cli: activeSubCard.owner,
        transitionType: activeSubCard.transitionBadge,
        headline: activeSubCard.headline,
        summary: activeSubCard.summary,
        purpose: activeSubCard.purpose,
        inputs: activeSubCard.inputs,
        outputs: activeSubCard.outputs,
        humanCheckpoint: activeSubCard.humanCheckpoint,
        antiDrift: activeSubCard.antiDrift,
        artifactTag: activeSubCard.artifactTag,
        artifactStatus: activeSubCard.artifactStatus,
        artifactItems: activeSubCard.artifactItems,
      }
    : activeStage;

  const handleFlowSwitch = (flowKey) => {
    setActiveFlow(flowKey);
  };

  const handleStageSelect = (stageId) => {
    if (activeFlow === 'map') {
      setActiveMapStageId(stageId);
      if (stageId !== 'map-decision-tickets') {
        setActiveDecisionTicketKey(null);
      }
    } else {
      setActiveSpecStageId(stageId);
    }
  };

  const handleSubCardSelect = (ticketKey) => {
    setActiveMapStageId('map-decision-tickets');
    setActiveDecisionTicketKey(ticketKey);
  };

  return (
    <div className="flow-visualizer" data-active-flow={activeFlow}>
      {/* Flow Selector Tabs: Map Lifecycle vs Spec Lifecycle */}
      <div className="flow-selector-bar">
        <div
          className="flow-selector-tabs"
          role="tablist"
          aria-label="Lifecycle Flow Selector"
        >
          <button
            type="button"
            id="btn-flow-tab-map"
            className={`flow-selector-tab ${activeFlow === 'map' ? 'active' : ''}`}
            data-flow-tab="map"
            role="tab"
            aria-selected={activeFlow === 'map' ? 'true' : 'false'}
            aria-controls="flow-visualizer-inspector"
            onClick={() => handleFlowSwitch('map')}
          >
            <span className="flow-tab-badge">Boundary 1</span>
            <span className="flow-tab-text">
              <span className="flow-tab-title">Map Lifecycle</span>
              <span className="flow-tab-sub">Resolve Uncertainty (ship-it:map)</span>
            </span>
          </button>

          <button
            type="button"
            id="btn-flow-tab-spec"
            className={`flow-selector-tab ${activeFlow === 'spec' ? 'active' : ''}`}
            data-flow-tab="spec"
            role="tab"
            aria-selected={activeFlow === 'spec' ? 'true' : 'false'}
            aria-controls="flow-visualizer-inspector"
            onClick={() => handleFlowSwitch('spec')}
          >
            <span className="flow-tab-badge">Boundaries 2 &amp; 3</span>
            <span className="flow-tab-text">
              <span className="flow-tab-title">Spec Lifecycle</span>
              <span className="flow-tab-sub">Deliver Verified Code (ship-it:spec)</span>
            </span>
          </button>
        </div>
      </div>

      {/* Active Flow Comparison Summary & When-Each-Occurs Blurb */}
      <div className="flow-context-banner" data-flow-context={activeFlow}>
        <div className="flow-comparison-card">
          <div className="flow-comparison-header">
            <span className="flow-comparison-tag">{flowMeta.tabBadge}</span>
            <h3 className="flow-comparison-title">{flowMeta.artifactLabel}</h3>
          </div>
          <dl className="flow-comparison-dl">
            <div className="flow-comparison-row">
              <dt>Primary Goal</dt>
              <dd>{flowMeta.comparison.primaryGoal}</dd>
            </div>
            <div className="flow-comparison-row">
              <dt>When to Use</dt>
              <dd>{flowMeta.comparison.whenToUse}</dd>
            </div>
            <div className="flow-comparison-row">
              <dt>Work Units</dt>
              <dd>{flowMeta.comparison.workUnits}</dd>
            </div>
            <div className="flow-comparison-row">
              <dt>Core Output</dt>
              <dd>{flowMeta.comparison.coreOutput}</dd>
            </div>
            <div className="flow-comparison-row">
              <dt>Exit Gate</dt>
              <dd>{flowMeta.comparison.exitGate}</dd>
            </div>
          </dl>
        </div>

        <div className="flow-blurb-card">
          <h3 className="flow-blurb-title">{flowMeta.blurbTitle}</h3>
          <p className="flow-blurb-intro">{flowMeta.blurbIntro}</p>
          <ul className="flow-blurb-list">
            {flowMeta.blurbBullets.map((item) => (
              <li key={item.lead}>
                <strong>{item.lead}:</strong> {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Compact Single-Viewport Horizontal Stage Stepper */}
      <div className="flow-stepper-wrapper">
        <div
          className="flow-stepper-track"
          role="group"
          aria-label={`${flowMeta.tabLabel} Stage Stepper`}
        >
          {stages.map((stage, idx) => {
            const isSelected = stage.id === currentStageId;
            const isExitHalt = stage.transitionType.includes('Halt');
            return (
              <React.Fragment key={stage.id}>
                <button
                  type="button"
                  id={`btn-stage-${stage.id}`}
                  className={`flow-stepper-node ${isSelected ? 'active' : ''} ${
                    isExitHalt ? 'exit-halt-node' : ''
                  }`}
                  data-stepper-stage={stage.id}
                  aria-pressed={isSelected ? 'true' : 'false'}
                  onClick={() => handleStageSelect(stage.id)}
                >
                  <div className="stepper-node-top">
                    <span className="stepper-node-num">Stage {stage.step}</span>
                    <span
                      className={`stepper-node-gate ${
                        isExitHalt ? 'gate-halt' : 'gate-continue'
                      }`}
                    >
                      {stage.transitionType}
                    </span>
                  </div>
                  <div className="stepper-node-title">{stage.title}</div>
                  <div className="stepper-node-subtitle">{stage.subtitle}</div>
                </button>
                {idx < stages.length - 1 && (
                  <div className="flow-stepper-connector" aria-hidden="true">
                    →
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Interactive Decision Ticket Sub-Cards when Map Stage 2 is selected */}
        {isMapDecisionStage && (
          <div
            className="decision-subcards-bar"
            role="group"
            aria-label="Decision Ticket Types"
          >
            <div className="decision-subcards-label">
              Select a decision ticket type to inspect its execution owner and contract:
            </div>
            <div className="decision-subcards-grid">
              {Object.values(DECISION_TICKET_SUBCARDS).map((sub) => {
                const isSubSelected = activeDecisionTicketKey === sub.key;
                return (
                  <button
                    type="button"
                    key={sub.key}
                    id={`btn-decision-ticket-${sub.key}`}
                    className={`decision-subcard ${isSubSelected ? 'active' : ''}`}
                    data-decision-ticket={sub.key}
                    aria-pressed={isSubSelected ? 'true' : 'false'}
                    onClick={() => handleSubCardSelect(sub.key)}
                  >
                    <span className="decision-subcard-title">{sub.title}</span>
                    <code className="decision-subcard-label">{sub.label}</code>
                    <span className="decision-subcard-owner">{sub.owner}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Focused Node Inspector Panel */}
      <div
        className="explorer-panel active flow-inspector-panel"
        id="flow-visualizer-inspector"
        role="tabpanel"
        aria-label="Active Stage Inspector"
      >
        <div className="explorer-panel-header">
          <div className="panel-meta-tag">
            <span className="phase-number-badge">{inspectorData.badge}</span>
            <span className="phase-cli-badge">
              <code>{inspectorData.cli}</code>
            </span>
            <span className="phase-transition-badge">{inspectorData.transitionType}</span>
          </div>
          <h3 className="panel-headline">{inspectorData.headline}</h3>
          <p className="panel-summary">{inspectorData.summary}</p>
        </div>

        <div className="explorer-grid-breakdown">
          {/* Purpose */}
          <div className="breakdown-card card-purpose">
            <div className="breakdown-card-header">
              <div className="breakdown-icon purple-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
              </div>
              <h4 className="breakdown-title">Purpose</h4>
            </div>
            <p className="breakdown-text">{inspectorData.purpose}</p>
          </div>

          {/* Inputs & Outputs */}
          <div className="breakdown-card card-io">
            <div className="breakdown-card-header">
              <div className="breakdown-icon blue-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 17l6-6-6-6M12 19h8"></path>
                </svg>
              </div>
              <h4 className="breakdown-title">Inputs &amp; Outputs</h4>
            </div>
            <div className="io-list">
              <div className="io-group">
                <span className="io-label">Inputs:</span>
                <span className="io-val">{inspectorData.inputs}</span>
              </div>
              <div className="io-group">
                <span className="io-label">Outputs:</span>
                <span className="io-val">{inspectorData.outputs}</span>
              </div>
            </div>
          </div>

          {/* Human Checkpoint */}
          <div className="breakdown-card card-checkpoint">
            <div className="breakdown-card-header">
              <div className="breakdown-icon amber-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h4 className="breakdown-title">Human Checkpoint</h4>
            </div>
            <p className="breakdown-text">{inspectorData.humanCheckpoint}</p>
          </div>

          {/* Anti-Drift Guarantee */}
          <div className="breakdown-card card-antidrift">
            <div className="breakdown-card-header">
              <div className="breakdown-icon green-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h4 className="breakdown-title">Anti-Drift Guarantee</h4>
            </div>
            <p className="breakdown-text">{inspectorData.antiDrift}</p>
          </div>
        </div>

        {/* Artifact Preview */}
        <div className="explorer-artifact-preview">
          <div className="artifact-preview-header">
            <span className="artifact-tag">{inspectorData.artifactTag}</span>
            <span className="artifact-status">{inspectorData.artifactStatus}</span>
          </div>
          <div className="artifact-preview-body">
            <div className="spec-contract-visual">
              {inspectorData.artifactItems.map((item) => (
                <div className="contract-section" key={item.badge}>
                  <span className="contract-badge">{item.badge}</span>
                  <span className="contract-name">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
