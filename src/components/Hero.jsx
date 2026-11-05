import React, { useState } from 'react';

export function Hero() {
  const [copied, setCopied] = useState(false);
  const installCmd = 'npx skills install awhipp/ship-it';

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

  const handleCopy = async () => {
    let success = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(installCmd);
        success = true;
      } else {
        fallbackCopy(installCmd);
        success = true;
      }
    } catch {
      try {
        fallbackCopy(installCmd);
        success = true;
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <section id="hero" className="hero-section py-20 sm:py-28 text-center" aria-labelledby="hero-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
          Autonomous Agents &bull; Human Control
        </div>

        <h1
          id="hero-title"
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight"
        >
          Keep developers in the <span className="gradient-text">driver's seat</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Structured lifecycle automation for software teams. Coordinate feature delivery across GitHub issues using phase gates, fresh-context validation, and automated PR close-outs.
        </p>

        <div className="mt-10 max-w-xl mx-auto">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-700/80 shadow-lg font-mono text-sm sm:text-base">
            <div className="flex items-center gap-3 overflow-x-auto select-all">
              <span className="text-sky-400 font-bold select-none">$</span>
              <code id="cmd-install" className="text-slate-100">
                {installCmd}
              </code>
            </div>

            <button
              type="button"
              id="btn-copy-install"
              onClick={handleCopy}
              aria-label="Copy install command"
              title="Copy install command to clipboard"
              className={`btn-copy ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                copied
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 copied'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="copy-text">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    </section>
  );
}
