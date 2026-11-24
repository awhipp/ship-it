import React from 'react';

const CAPABILITIES = [
  {
    id: 'capability-github-state',
    title: 'Deterministic GitHub state',
    description:
      'One first-match routing table derives every next step from GitHub labels, issue bodies, and a single state comment. No hidden databases.',
    icon: (
      <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'capability-fresh-context',
    title: 'Fresh-context review',
    description:
      'Validation and two-axis review (Standards and Spec) run in isolated subagents or fresh sessions, so no author verifies their own work.',
    icon: (
      <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'capability-human-gates',
    title: 'Three human gates',
    description:
      'Work runs continuously inside each boundary and halts at its exit. Any gate hands control to you after two non-approved passes.',
    icon: (
      <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'capability-pr-annotations',
    title: 'Annotated pull requests',
    description:
      'Every changed file gets a comment tracing it to its ticket and spec section. ship-it never merges; you do.',
    icon: (
      <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const TRADEOFFS = [
  {
    id: 'tradeoff-gh-cli',
    title: 'GitHub CLI requirements',
    description:
      'Requires git and the GitHub CLI (gh) 2.18.0 or later, authenticated, plus a github.com remote with Issues enabled and write access.',
    icon: (
      <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    id: 'tradeoff-gate-pacing',
    title: 'Deliberate gate pacing',
    description:
      'Three human halts, at the end of Mapping, Definition, and Execution. Pacing is intentionally slower than unverified one-shot code generation.',
    icon: (
      <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

export function Tradeoffs() {
  return (
    <section
      id="tradeoffs"
      className="tradeoffs-section py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      aria-labelledby="tradeoffs-title"
    >
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
          Honest Architecture
        </div>
        <h2
          id="tradeoffs-title"
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Capabilities &amp; Explicit Trade-offs
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          ship-it prioritizes deterministic control over speculative automation. Here is what ship-it delivers—and the deliberate constraints it requires.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Core Capabilities */}
        <div className="capability-card flex flex-col p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-[#131d31] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Core Capabilities</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Guarantees built into the lifecycle</p>
            </div>
          </div>

          <ul id="capabilities-list" className="space-y-6 flex-1">
            {CAPABILITIES.map((cap) => (
              <li
                key={cap.id}
                id={cap.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 shadow-xs"
              >
                <div className="mt-0.5 shrink-0">{cap.icon}</div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">{cap.title}</h4>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{cap.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Deliberate Trade-offs */}
        <div className="tradeoff-card flex flex-col p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-[#131d31] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Deliberate Trade-offs</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Explicit engineering constraints</p>
            </div>
          </div>

          <ul id="tradeoffs-list" className="space-y-6 flex-1">
            {TRADEOFFS.map((tradeoff) => (
              <li
                key={tradeoff.id}
                id={tradeoff.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800/80 shadow-xs"
              >
                <div className="mt-0.5 shrink-0">{tradeoff.icon}</div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">{tradeoff.title}</h4>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{tradeoff.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
