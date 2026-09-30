// ship-it Marketing Site Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  initExplorerTabs();
  initSmoothScroll();
  initCopyButtons();
  initCliTerminalSimulation();
});

/**
 * Initializes the Interactive 5-Phase Lifecycle Explorer.
 * Supports accessible tab switching, keyboard arrow navigation, and smooth panel transitions.
 */
function initExplorerTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-explorer-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-explorer-panel]'));
  if (!tabs.length || !panels.length) return;

  const activatePhase = (phaseKey) => {
    tabs.forEach(tab => {
      const isMatch = tab.getAttribute('data-explorer-tab') === phaseKey;
      tab.classList.toggle('active', isMatch);
      tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      tab.setAttribute('tabindex', isMatch ? '0' : '-1');
    });

    panels.forEach(panel => {
      const isMatch = panel.getAttribute('data-explorer-panel') === phaseKey;
      panel.classList.toggle('active', isMatch);
    });
  };

  // Click handler
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const phase = tab.getAttribute('data-explorer-tab');
      activatePhase(phase);
    });

    // Keyboard navigation (ARIA tablist pattern)
    tab.addEventListener('keydown', (e) => {
      const currentIndex = tabs.indexOf(tab);
      let targetIndex = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== -1) {
        tabs[targetIndex].focus();
        const phase = tabs[targetIndex].getAttribute('data-explorer-tab');
        activatePhase(phase);
      }
    });
  });

  // Ensure initial active phase
  activatePhase('plan');
}

/**
 * Handles smooth scrolling with offset for sticky header navigation.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 70;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Manages clipboard copying for install and invocation snippets with visual feedback.
 */
function initCopyButtons() {
  const setupCopy = (btnId, cmdId) => {
    const btn = document.getElementById(btnId);
    const cmd = document.getElementById(cmdId);
    if (!btn || !cmd) return;

    btn.addEventListener('click', async () => {
      const textToCopy = cmd.textContent.trim();
      const textSpan = btn.querySelector('.copy-text');
      const originalText = textSpan ? textSpan.textContent : 'Copy';

      const showCopied = () => {
        btn.classList.add('copied');
        if (textSpan) textSpan.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          if (textSpan) textSpan.textContent = originalText;
        }, 2000);
      };

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
          showCopied();
        } else {
          fallbackCopy(textToCopy);
          showCopied();
        }
      } catch {
        fallbackCopy(textToCopy);
        showCopied();
      }
    });
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {
      // Ignore fallback error
    }
    document.body.removeChild(textarea);
  };

  setupCopy('btn-copy-install', 'cmd-install');
  setupCopy('btn-copy-invoke', 'cmd-invoke');
}

/**
 * Interactive CLI Terminal Simulation.
 * Allows developers to step through simulated /ship-it execution (Orient, Implement, Review).
 */
function initCliTerminalSimulation() {
  const simButtons = Array.from(document.querySelectorAll('button[data-sim-step]'));
  const terminalScreen = document.getElementById('terminal-screen');
  if (!simButtons.length || !terminalScreen) return;

  const SIM_CONTENT = {
    orient: {
      command: '/ship-it',
      lines: [
        { type: 'log', icon: '🧭', text: '<span class="sim-cyan">Orienting repository:</span> scanning GitHub issues and feature slugs...' },
        { type: 'log', icon: '📋', text: 'Found active spec: <span class="sim-bold">[marketing] Spec: User-facing README refactor (#16)</span>' },
        { type: 'log', icon: '🔍', text: 'Inspecting dependency DAG in markdown tasklist:' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: 'Ticket #17: Setup build & pipeline &mdash; <span class="sim-badge closed">CLOSED</span>' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: 'Ticket #18: Explorer & SDLC Comparison &mdash; <span class="sim-badge closed">CLOSED</span>' },
        { type: 'sub', icon: '<span class="sim-purple">➜</span>', text: 'Ticket #19: Architecture Deep-Dives & CLI &mdash; <span class="sim-badge unblocked">UNBLOCKED</span>' },
        { type: 'highlight', icon: '★', text: 'Earliest unblocked ticket discovered: <strong>#19</strong>' },
        { type: 'log', icon: '👉', text: '<strong>Next step:</strong> Claim and build slice: <code>/ship-it Implement #19</code>' }
      ]
    },
    implement: {
      command: '/ship-it Implement #19',
      lines: [
        { type: 'log', icon: '🔒', text: '<span class="sim-cyan">Claiming ticket #19:</span> <code>gh issue edit 19 --add-assignee "@me"</code>' },
        { type: 'log', icon: '🌿', text: 'Switched to dedicated feature branch: <span class="sim-bold">gh-pages</span>' },
        { type: 'log', icon: '🔴', text: '<span class="sim-red sim-bold">Red Phase:</span> Writing test suite for acceptance criteria...' },
        { type: 'sub', icon: '<span class="sim-red">✖</span>', text: '<code>FAIL tests/marketing.test.js</code> &mdash; 10 failed, 16 passed' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: 'Established verification gate: committed failing test <code>(64c9fe6)</code>' },
        { type: 'log', icon: '🟢', text: '<span class="sim-green sim-bold">Green Phase:</span> Implementing minimal production code...' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: '<code>PASS tests/marketing.test.js</code> &mdash; all 26 passed cleanly' },
        { type: 'highlight', icon: '📦', text: 'Production build verified: <code>dist/index.html</code> (clean relative assets)' },
        { type: 'log', icon: '👉', text: '<strong>Next step:</strong> Start fresh session for independent review under 2-Tier Context Isolation' }
      ]
    },
    review: {
      command: '/ship-it Review',
      lines: [
        { type: 'log', icon: '🛡️', text: '<span class="sim-cyan">Launching 2-Tier Context Isolation Review</span> in fresh session...' },
        { type: 'log', icon: '🧼', text: 'Authoring context discarded. Checking diff against merge-base...' },
        { type: 'log', icon: '⚖️', text: '<strong>Axis 1: Standards (Fowler Heuristics)</strong>' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: 'Naming & Modularization: PASS (0 findings)' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: 'Duplication & Dead Abstraction: PASS (0 findings)' },
        { type: 'log', icon: '🎯', text: '<strong>Axis 2: Spec Fidelity (Acceptance Criteria)</strong>' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: 'Four Architecture Deep-Dive Cards: PASS' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: 'Interactive CLI Terminal Simulation: PASS' },
        { type: 'sub', icon: '<span class="sim-green">✔</span>', text: 'Complete SEO Metadata, Favicon & Relative Bundles: PASS' },
        { type: 'highlight', icon: '🚀', text: '<strong>Dual-Axis Verdict: PASSED.</strong> Ready to merge pull request!' }
      ]
    }
  };

  const renderSimStep = (stepKey) => {
    const data = SIM_CONTENT[stepKey];
    if (!data) return;

    // Update active button state
    simButtons.forEach(btn => {
      const isMatch = btn.getAttribute('data-sim-step') === stepKey;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    // Build terminal HTML
    let html = `
      <div class="terminal-sim-line command-line">
        <span class="terminal-prompt">$</span>
        <span class="sim-command-text">${data.command}</span>
      </div>
      <div class="terminal-sim-output">
    `;

    data.lines.forEach(line => {
      if (line.type === 'sub') {
        html += `<div class="sim-log-sub">${line.icon} ${line.text}</div>`;
      } else if (line.type === 'highlight') {
        html += `<div class="sim-log-row highlight-box"><span class="sim-accent-star">${line.icon}</span> <span class="sim-text">${line.text}</span></div>`;
      } else {
        html += `<div class="sim-log-row"><span class="sim-icon">${line.icon}</span> ${line.text}</div>`;
      }
    });

    html += `</div>`;
    terminalScreen.innerHTML = html;
  };

  simButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.getAttribute('data-sim-step');
      renderSimStep(step);
    });
  });
}
