import React, { useState, useRef } from 'react';
import { STAGES } from '../data/stages.js';
import { StageInspector } from './StageInspector.jsx';

export function StageStepper() {
  const [activeStageId, setActiveStageId] = useState('plan');
  const tabRefs = useRef([]);

  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];

  const handleSelectStage = (id) => {
    setActiveStageId(id);
    const index = STAGES.findIndex((s) => s.id === id);
    if (index !== -1 && tabRefs.current[index] && typeof tabRefs.current[index].focus === 'function') {
      tabRefs.current[index].focus();
    }
  };

  const handleKeyDown = (e, explicitIndex = null) => {
    const currentIndex = explicitIndex !== null
      ? explicitIndex
      : STAGES.findIndex((s) => s.id === activeStageId);

    let targetIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = (currentIndex + 1) % STAGES.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = (currentIndex - 1 + STAGES.length) % STAGES.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = STAGES.length - 1;
    }

    if (targetIndex !== null) {
      e.preventDefault();
      e.stopPropagation();
      const targetStage = STAGES[targetIndex];
      setActiveStageId(targetStage.id);
      const targetEl = tabRefs.current[targetIndex];
      if (targetEl && typeof targetEl.focus === 'function') {
        targetEl.focus();
      }
    }
  };

  return (
    <section
      id="stages"
      className="stages-section py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      aria-labelledby="stages-title"
    >
      {/* Section Headline */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          5-Stage SDLC Architecture
        </div>
        <h2
          id="stages-title"
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Structured delivery across <span className="gradient-text">five sequential stages</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Select any stage to inspect its boundaries, operational role, inputs, outputs, phase checkpoints, and anti-drift guarantees.
        </p>
      </div>

      {/* Responsive Stage Stepper Tabs */}
      <div
        role="tablist"
        aria-label="SDLC Stages"
        className="stage-stepper-list flex flex-col md:flex-row gap-3 mb-10 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800"
        onKeyDown={(e) => handleKeyDown(e)}
      >
        {STAGES.map((stage, index) => {
          const isSelected = stage.id === activeStage.id;
          const isAgent = stage.role === 'agent';

          return (
            <button
              key={stage.id}
              type="button"
              id={`stage-tab-${stage.id}`}
              role="tab"
              aria-selected={isSelected}
              aria-controls="stage-inspector-panel"
              tabIndex={isSelected ? 0 : -1}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => handleSelectStage(stage.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`stage-tab group relative flex-1 p-4 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer ${
                isSelected
                  ? 'active bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg border border-slate-300/80 dark:border-slate-600'
                  : 'hover:bg-white/60 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                  0{index + 1}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isAgent
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isAgent ? 'Agent' : 'Human'}
                </span>
              </div>
              <div className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {stage.name}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                {stage.boundary}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Inspector Panel */}
      <StageInspector stage={activeStage} />
    </section>
  );
}

export default StageStepper;
