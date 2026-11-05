import React from 'react';
import { STAGES } from '../data/stages.js';

export function StageInspector({ stage = STAGES[0] }) {
  if (!stage) return null;

  return (
    <div
      id="stage-inspector-panel"
      role="tabpanel"
      aria-labelledby={`stage-tab-${stage.id}`}
      tabIndex={0}
      className="stage-inspector p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
    >
      {/* Inspector Header / Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="stage-boundary-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
            {stage.boundary}
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Stage ID: {stage.id}
        </span>
      </div>

      {/* Stage Title and Purpose */}
      <div className="mt-6 mb-8">
        <h3
          id={`stage-title-${stage.id}`}
          className="stage-inspector-title text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3"
        >
          {stage.name} Stage
        </h3>
        <p className="stage-purpose text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {stage.purpose}
        </p>
      </div>

      {/* Dual Cards: Agent Execution and Human Oversight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Agent Execution Card (Indigo) */}
        <div className="stage-card stage-agent-card p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Agent Execution & Verification
            </h4>
          </div>
          <p className="stage-agent-execution text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {stage.agentExecution}
          </p>
        </div>

        {/* Human Oversight Card (Amber) */}
        <div className="stage-card stage-human-card p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Human Oversight & Gate Checkpoint
            </h4>
          </div>
          <p className="stage-human-oversight text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {stage.humanOversight}
          </p>
        </div>
      </div>

      {/* Two-column Inputs and Outputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Inputs */}
        <div className="stage-card stage-inputs-card p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-sky-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Required Inputs
            </h4>
          </div>
          <ul className="stage-inputs stage-inputs-list space-y-2">
            {stage.inputs.map((input, idx) => (
              <li
                key={idx}
                className="stage-input-item text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-snug"
              >
                <span className="text-sky-500 font-bold select-none leading-none mt-1">&bull;</span>
                <span>{input}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Outputs */}
        <div className="stage-card stage-outputs-card p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-emerald-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Produced Outputs
            </h4>
          </div>
          <ul className="stage-outputs stage-outputs-list space-y-2">
            {stage.outputs.map((output, idx) => (
              <li
                key={idx}
                className="stage-output-item text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-snug"
              >
                <span className="text-emerald-500 font-bold select-none leading-none mt-1">&bull;</span>
                <span>{output}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Checkpoint and Anti-Drift Sections */}
      <div className="space-y-6">
        {/* Checkpoint */}
        <div className="stage-card stage-checkpoint-card p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Phase Gate Checkpoint
            </h4>
          </div>
          <p className="stage-checkpoint text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {stage.checkpoint}
          </p>
        </div>

        {/* Anti-Drift Guarantees */}
        <div className="stage-card stage-antidrift-card p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              Anti-Drift Guarantees
            </h4>
          </div>
          <ul className="stage-antidrift stage-antidrift-list space-y-2">
            {stage.antiDriftGuarantees.map((guarantee, idx) => (
              <li
                key={idx}
                className="stage-antidrift-item text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2 leading-snug"
              >
                <span className="text-indigo-500 font-bold select-none leading-none mt-1">&bull;</span>
                <span>{guarantee}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StageInspector;
