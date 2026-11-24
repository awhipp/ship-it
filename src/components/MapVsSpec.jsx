import React from 'react';

const ROWS = [
  ['Goal', 'Resolve architectural uncertainty and choose a direction.', 'Deliver settled requirements as verified code.'],
  ['Use when', 'Unknown APIs, technical forks, or architectural fog.', 'Destination, design, and scope are clear.'],
  ['Work units', 'Decision tickets: research, prototype, grilling, task.', 'Vertical build tickets with concrete touchpoints.'],
  ['Exit gate', 'Boundary 1: every open decision is settled.', 'Boundary 3: PR passes final review and awaits merge.'],
];

export function MapVsSpec() {
  return (
    <section
      id="map-vs-spec"
      className="map-vs-spec-section py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full"
      aria-labelledby="map-vs-spec-title"
    >
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          Two Entry Points
        </div>
        <h2
          id="map-vs-spec-title"
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Map first, or go straight to Spec
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
          At intake you choose the path that fits the idea.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131d31]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <th scope="col" className="p-4 font-semibold">
                <span className="sr-only">Dimension</span>
              </th>
              <th scope="col" className="p-4 font-semibold">
                Decision Map <code className="ml-1 text-xs font-mono text-sky-600 dark:text-sky-400">ship-it:map</code>
              </th>
              <th scope="col" className="p-4 font-semibold">
                Feature Spec <code className="ml-1 text-xs font-mono text-sky-600 dark:text-sky-400">ship-it:spec</code>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([dimension, map, spec]) => (
              <tr key={dimension} className="border-b last:border-b-0 border-slate-200 dark:border-slate-800 align-top">
                <th scope="row" className="p-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  {dimension}
                </th>
                <td className="p-4 text-slate-600 dark:text-slate-400">{map}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{spec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
