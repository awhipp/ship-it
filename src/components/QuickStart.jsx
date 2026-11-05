import React, { useState } from 'react';

export function QuickStart() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedInvoke, setCopiedInvoke] = useState(false);

  const installCmd = 'npx skills install awhipp/ship-it';
  const invokeCmd = '/ship-it <description>';

  const fallbackCopy = (text) => {
    if (typeof document === 'undefined') return;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleCopy = async (text, setCopiedFn) => {
    let success = false;
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        fallbackCopy(text);
        success = true;
      }
    } catch {
      try {
        fallbackCopy(text);
        success = true;
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopiedFn(true);
      setTimeout(() => {
        setCopiedFn(false);
      }, 2000);
    }
  };

  return (
    <section
      id="quickstart"
      className="quickstart-section py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      aria-labelledby="quickstart-title"
    >
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
          Get Started
        </div>
        <h2
          id="quickstart-title"
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Quick Start Onboarding
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Set up ship-it in your environment and start shipping verified software in three straightforward steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 1: Prerequisites */}
        <div
          id="quickstart-step-prereqs"
          className="quickstart-card flex flex-col p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-[#131d31] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 font-bold text-sm border border-sky-200 dark:border-sky-800">
              1
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Prerequisites</h3>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Ensure your machine has the required toolchain installed and authenticated before invoking the skill.
          </p>

          <ul className="space-y-3 mt-auto text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span><strong>Node.js</strong> (v20+ runtime)</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span><strong>Git</strong> (version control)</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span><strong>GitHub CLI</strong> (<code>gh auth login</code>)</span>
            </li>
          </ul>
        </div>

        {/* Step 2: Install Skill */}
        <div
          id="quickstart-step-install"
          className="quickstart-card flex flex-col p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-[#131d31] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-200 dark:border-indigo-800">
              2
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Install Skill</h3>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Install the ship-it skill into your local agent harness with the standard skills package manager.
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-700/80 shadow-md font-mono text-xs sm:text-sm">
              <div className="flex items-center gap-2 overflow-x-auto select-all">
                <span className="text-indigo-400 font-bold select-none">$</span>
                <code id="cmd-quickstart-install" className="text-slate-100">
                  {installCmd}
                </code>
              </div>

              <button
                type="button"
                id="btn-copy-quickstart-install"
                onClick={() => handleCopy(installCmd, setCopiedInstall)}
                aria-label="Copy install command"
                title="Copy install command to clipboard"
                className={`btn-copy ml-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  copiedInstall
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 copied'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {copiedInstall ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="copy-text">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span className="copy-text">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Agent Invocation */}
        <div
          id="quickstart-step-invoke"
          className="quickstart-card flex flex-col p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-[#131d31] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 font-bold text-sm border border-teal-200 dark:border-teal-800">
              3
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invoke in Chat</h3>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Trigger the slash command in your coding agent chat session with a concise description of your target feature.
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-700/80 shadow-md font-mono text-xs sm:text-sm">
              <div className="flex items-center gap-2 overflow-x-auto select-all">
                <span className="text-teal-400 font-bold select-none">&gt;</span>
                <code id="cmd-quickstart-invoke" className="text-slate-100">
                  {invokeCmd}
                </code>
              </div>

              <button
                type="button"
                id="btn-copy-quickstart-invoke"
                onClick={() => handleCopy(invokeCmd, setCopiedInvoke)}
                aria-label="Copy invocation command"
                title="Copy invocation command to clipboard"
                className={`btn-copy ml-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  copiedInvoke
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 copied'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {copiedInvoke ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="copy-text">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span className="copy-text">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
