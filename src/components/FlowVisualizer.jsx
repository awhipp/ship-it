import React, { useState } from 'react';

const BOUNDARIES = [
  {
    id: 'mapping',
    number: '1',
    name: 'Mapping',
    badge: 'Boundary 1: Mapping',
    tagline: 'Resolve architectural uncertainty',
    goal: 'Explores architectural fog, resolves decision tickets, and halts when decisions settle.',
    deliverables: [
      'Settled decision map on GitHub (ship-it:map).',
      'Resolved decision tickets across research, prototype, grilling, and task types.',
      'Decisions ledger recording all architectural choices.',
    ],
    exitGate: 'Halt when all decisions settle. Run ship-it <slug> to start Boundary 2.',
  },
  {
    id: 'definition',
    number: '2',
    name: 'Definition',
    badge: 'Boundary 2: Definition',
    tagline: 'Draft and validate specifications',
    goal: 'Drafts specifications, slices tracer-bullet tickets, validates with fresh context, and halts on approval.',
    deliverables: [
      'Validated feature specification with testing decisions (ship-it:spec).',
      'Ordered tracer-bullet tickets with dependency edges (ship-it:ticket).',
      'Audit reports verifying requirements, test seams, and tickets.',
    ],
    exitGate: 'Halt on developer approval of the validated ticket set.',
  },
  {
    id: 'execution',
    number: '3',
    name: 'Execution',
    badge: 'Boundary 3: Execution',
    tagline: 'Build, verify, and close out',
    goal: 'Implements tickets from fixed points, conducts two-axis reviews, and halts on pull request close-out.',
    deliverables: [
      'Verified commits referencing the ticket number from a recorded fixed point.',
      'Passing test suite and direct verification evidence.',
      'Two-axis review audit reports for each completed ticket.',
      'Annotated pull request with file-level rationale comments.',
    ],
    exitGate: 'Halt on pull request close-out for manual merge.',
  },
];

export function FlowVisualizer() {
  const [activeId, setActiveId] = useState('mapping');

  const activeBoundary = BOUNDARIES.find((b) => b.id === activeId) || BOUNDARIES[0];

  const handleSelect = (id) => {
    setActiveId(id);
  };

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % BOUNDARIES.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + BOUNDARIES.length) % BOUNDARIES.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = BOUNDARIES.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextBoundary = BOUNDARIES[nextIndex];
      setActiveId(nextBoundary.id);
      const nextBtn = document.getElementById(`btn-boundary-${nextBoundary.number}`);
      if (nextBtn) {
        nextBtn.focus();
      }
    }
  };

  return (
    <div className="flow-visualizer" data-active-boundary={activeBoundary.id}>
      {/* Interactive Step Selectors for the Three Boundaries */}
      <div
        className="boundary-selector-track"
        role="tablist"
        aria-label="Lifecycle Boundaries"
      >
        {BOUNDARIES.map((boundary, index) => {
          const isSelected = boundary.id === activeBoundary.id;
          return (
            <button
              key={boundary.id}
              type="button"
              id={`btn-boundary-${boundary.number}`}
              className={`boundary-selector-btn ${isSelected ? 'active' : ''}`}
              data-boundary={boundary.id}
              data-boundary-step={boundary.number}
              role="tab"
              aria-selected={isSelected ? 'true' : 'false'}
              aria-controls="flow-visualizer-inspector"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleSelect(boundary.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <span className="boundary-step-num">Boundary {boundary.number}</span>
              <span className="boundary-step-name">{boundary.name}</span>
              <span className="boundary-step-tagline">{boundary.tagline}</span>
            </button>
          );
        })}
      </div>

      {/* Single Inspection Panel */}
      <div
        className="boundary-inspector-panel"
        id="flow-visualizer-inspector"
        role="tabpanel"
        aria-labelledby={`btn-boundary-${activeBoundary.number}`}
      >
        <div className="inspector-header">
          <div className="inspector-badge">{activeBoundary.badge}</div>
          <h3 className="inspector-title">{activeBoundary.name} Lifecycle</h3>
        </div>

        <div className="inspector-content">
          {/* Goal */}
          <div className="inspector-section inspector-goal-section">
            <h4 className="inspector-section-heading">Goal</h4>
            <p className="inspector-text">{activeBoundary.goal}</p>
          </div>

          {/* Deliverables */}
          <div className="inspector-section inspector-deliverables-section">
            <h4 className="inspector-section-heading">Deliverables</h4>
            <ul className="inspector-list">
              {activeBoundary.deliverables.map((item, idx) => (
                <li key={idx} className="inspector-list-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Exit Gate */}
          <div className="inspector-section inspector-exit-section">
            <h4 className="inspector-section-heading">Exit Gate</h4>
            <p className="inspector-text inspector-exit-gate">{activeBoundary.exitGate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
