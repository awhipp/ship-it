import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FlowVisualizer } from './components/FlowVisualizer.jsx';

export async function initMarketingApp(doc = document, win = window) {
  const rootEl = doc.getElementById('flow-visualizer-root');
  if (rootEl && !rootEl.dataset.mounted) {
    rootEl.dataset.mounted = 'true';
    const root = createRoot(rootEl);
    if (globalThis.IS_REACT_ACT_ENVIRONMENT) {
      await act(async () => {
        root.render(<FlowVisualizer />);
      });
    } else {
      root.render(<FlowVisualizer />);
    }
  }

  initSmoothScroll(doc, win);
  initCopyButtons(doc);
  initCliTerminalSimulation(doc);
}

function initSmoothScroll(doc, win) {
  doc.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = doc.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 70;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + win.pageYOffset - headerOffset;

        win.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  });
}

function initCopyButtons(doc) {
  const fallbackCopy = (text) => {
    const textarea = doc.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    doc.body.appendChild(textarea);
    textarea.select();
    try {
      doc.execCommand('copy');
    } catch {
      // Ignore fallback error
    }
    doc.body.removeChild(textarea);
  };

  const setupCopy = (btnId, cmdId) => {
    const btn = doc.getElementById(btnId);
    const cmd = doc.getElementById(cmdId);
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

  setupCopy('btn-copy-install', 'cmd-install');
  setupCopy('btn-copy-invoke', 'cmd-invoke');
}

function initCliTerminalSimulation(doc) {
  const simButtons = Array.from(doc.querySelectorAll('button[data-sim-step]'));
  const terminalScreen = doc.getElementById('terminal-screen');
  if (!simButtons.length || !terminalScreen) return;

  const SIM_CONTENT = {
    orient: {
      command: '/ship-it marketing',
      lines: [
        {
          type: 'log',
          icon: '🧭',
          text: '<span class="sim-cyan">Orienting repository:</span> checking Map (<code>ship-it:map</code>) and Spec (<code>ship-it:spec</code>) state for slug <code>marketing</code>...',
        },
        {
          type: 'log',
          icon: '📋',
          text: 'Found validated spec: <span class="sim-bold">[marketing] Spec: User-facing README refactor (#16)</span>',
        },
        {
          type: 'log',
          icon: '🔍',
          text: 'Inspecting ticket dependency list in Boundary 3:',
        },
        {
          type: 'sub',
          icon: '<span class="sim-green">✔</span>',
          text: 'Ticket #17: Setup build &amp; pipeline &mdash; <span class="sim-badge closed">CLOSED</span>',
        },
        {
          type: 'sub',
          icon: '<span class="sim-green">✔</span>',
          text: 'Ticket #18: Explorer &amp; SDLC Comparison &mdash; <span class="sim-badge closed">CLOSED</span>',
        },
        {
          type: 'sub',
          icon: '<span class="sim-purple">➜</span>',
          text: 'Ticket #19: Architecture Deep-Dives &amp; CLI &mdash; <span class="sim-badge unblocked">UNBLOCKED</span>',
        },
        {
          type: 'highlight',
          icon: '★',
          text: 'Earliest unblocked ticket discovered: <strong>#19</strong>',
        },
        {
          type: 'log',
          icon: '👉',
          text: '<strong>Next step:</strong> Dispatch <code>Subagent: implement</code> for Ticket #19',
        },
      ],
    },
    implement: {
      command: '/ship-it #19',
      lines: [
        {
          type: 'log',
          icon: 'ℹ️',
          text: '<span class="sim-purple sim-bold">Workflow Context:</span> Ticket #19 illustrates workflow verification for the automated test suite (Red-Green cycle)',
        },
        {
          type: 'log',
          icon: '🔒',
          text: '<span class="sim-cyan">Claiming ticket #19:</span> <code>gh issue edit 19 --add-assignee "@me"</code>',
        },
        {
          type: 'log',
          icon: '🌿',
          text: 'Checked out branch <span class="sim-bold">gh-pages</span> and posted <code>Fixed point: 64c9fe6</code>',
        },
        {
          type: 'log',
          icon: '🔴',
          text: '<span class="sim-red sim-bold">Red Phase:</span> Writing failing test for acceptance criteria...',
        },
        {
          type: 'sub',
          icon: '<span class="sim-red">✖</span>',
          text: '<code>FAIL tests/marketing.test.js</code> &mdash; 10 failed, 16 passed',
        },
        {
          type: 'log',
          icon: '🟢',
          text: '<span class="sim-green sim-bold">Green Phase:</span> Writing minimal production code to pass tests...',
        },
        {
          type: 'sub',
          icon: '<span class="sim-green">✔</span>',
          text: '<code>PASS tests/marketing.test.js</code> &mdash; all 26 passed cleanly',
        },
        {
          type: 'highlight',
          icon: '📦',
          text: 'Production bundle verified: <code>dist/index.html</code> (relative assets)',
        },
        {
          type: 'log',
          icon: '👉',
          text: '<strong>Next step:</strong> Continue automatically to <code>Subagent: review</code>',
        },
      ],
    },
    review: {
      command: '/ship-it #19',
      lines: [
        {
          type: 'log',
          icon: '🛡️',
          text: '<span class="sim-cyan">Dispatching Subagent: review</span> in an isolated context...',
        },
        {
          type: 'log',
          icon: '🧼',
          text: 'Auditing diff from recorded <code>Fixed point</code> to <code>HEAD</code>...',
        },
        {
          type: 'log',
          icon: '⚖️',
          text: '<strong>Axis 1: Standards</strong>',
        },
        {
          type: 'sub',
          icon: '<span class="sim-green">✔</span>',
          text: 'Modularity, naming, and writing standard: PASS (0 blockers)',
        },
        {
          type: 'log',
          icon: '🎯',
          text: '<strong>Axis 2: Spec Fidelity (Acceptance Criteria)</strong>',
        },
        {
          type: 'sub',
          icon: '<span class="sim-green">✔</span>',
          text: 'Architecture Deep-Dive Cards &amp; Interactive CLI Simulator: PASS',
        },
        {
          type: 'sub',
          icon: '<span class="sim-green">✔</span>',
          text: 'Metadata, Favicon &amp; Relative Distribution Bundle: PASS',
        },
        {
          type: 'highlight',
          icon: '🚀',
          text: '<strong>Two-Axis Verdict: APPROVED.</strong> Ticket #19 closed; advancing to next ticket.',
        },
      ],
    },
  };

  const renderSimStep = (stepKey) => {
    const data = SIM_CONTENT[stepKey];
    if (!data) return;

    simButtons.forEach((btn) => {
      const isMatch = btn.getAttribute('data-sim-step') === stepKey;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    let html = `
      <div class="terminal-sim-line command-line">
        <div class="sim-cmd-left">
          <span class="terminal-prompt">$</span>
          <code class="sim-command-text cmd-invocation" id="cmd-invoke">${data.command}</code>
        </div>
        <button class="btn-copy btn-copy-invoke" id="btn-copy-invoke" aria-label="Copy invocation command" title="Copy invocation command to clipboard">
          <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="copy-text">Copy</span>
        </button>
      </div>
      <div class="terminal-sim-output">
    `;

    data.lines.forEach((line) => {
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

    const copyInvokeBtn = doc.getElementById('btn-copy-invoke');
    const cmdInvoke = doc.getElementById('cmd-invoke');
    if (copyInvokeBtn && cmdInvoke) {
      copyInvokeBtn.addEventListener('click', async () => {
        const textToCopy = cmdInvoke.textContent.trim();
        const textSpan = copyInvokeBtn.querySelector('.copy-text');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
          }
        } catch {
          // Ignore clipboard error in headless environments
        }
        copyInvokeBtn.classList.add('copied');
        if (textSpan) textSpan.textContent = 'Copied!';
        setTimeout(() => {
          copyInvokeBtn.classList.remove('copied');
          if (textSpan) textSpan.textContent = 'Copy';
        }, 2000);
      });
    }
  };

  simButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = btn.getAttribute('data-sim-step');
      renderSimStep(step);
    });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMarketingApp(document, window);
    });
  } else {
    initMarketingApp(document, window);
  }
}
