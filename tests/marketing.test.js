import { describe, it, expect, beforeAll } from 'vitest';
import { act } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { JSDOM } from 'jsdom';

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Marketing Site Architecture & Domains', () => {
  let dom;
  let document;
  let window;

  beforeAll(async () => {
    const htmlPath = path.join(ROOT_DIR, 'index.html');
    expect(fs.existsSync(htmlPath), 'index.html must exist').toBe(true);
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, { url: 'http://localhost:3000/' });
    document = dom.window.document;
    window = dom.window;

    globalThis.window = window;
    globalThis.document = document;
    Object.defineProperty(globalThis, 'navigator', {
      value: window.navigator,
      configurable: true,
      writable: true,
    });
    globalThis.HTMLElement = window.HTMLElement;
    globalThis.Element = window.Element;
    globalThis.Node = window.Node;
    globalThis.Event = window.Event;
    globalThis.MouseEvent = window.MouseEvent;
    globalThis.KeyboardEvent = window.KeyboardEvent;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const mainEntryPath = path.join(ROOT_DIR, 'src/main.jsx');
    if (fs.existsSync(mainEntryPath)) {
      const mainModule = await import('../src/main.jsx');
      if (typeof mainModule.initMarketingApp === 'function') {
        await mainModule.initMarketingApp(document, window);
      }
    }
  });

  // =========================================================================
  // DOMAIN: Infrastructure & Deployment Pipeline
  // =========================================================================
  describe('Domain: Infrastructure & Deployment Pipeline', () => {
    it('should configure package.json with React 19 and @vitejs/plugin-react without Mermaid dependencies', () => {
      const pkgPath = path.join(ROOT_DIR, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

      expect(pkg.dependencies?.react).toBe('^19.0.0');
      expect(pkg.dependencies?.['react-dom']).toBe('^19.0.0');
      expect(pkg.devDependencies?.['@vitejs/plugin-react']).toBe('^4.3.4');
      expect(pkg.dependencies?.mermaid).toBeUndefined();
      expect(pkg.devDependencies?.mermaid).toBeUndefined();
    });

    it('should configure Vite with react() plugin, relative base path "./", dist outDir, and assets assetsDir', async () => {
      const configPath = path.join(ROOT_DIR, 'vite.config.js');
      expect(fs.existsSync(configPath), 'vite.config.js must exist').toBe(true);

      const configModule = await import(configPath);
      const config = configModule.default;
      expect(config.base).toBe('./');
      expect(config.build.outDir).toBe('dist');
      expect(config.build.assetsDir).toBe('assets');
      expect(Array.isArray(config.plugins)).toBe(true);
      expect(config.plugins.length).toBeGreaterThan(0);
    });

    it('should configure GitHub Pages CI/CD workflow targeting gh-pages with appropriate permissions', () => {
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml');
      expect(fs.existsSync(workflowPath), '.github/workflows/deploy.yml must exist').toBe(true);

      const content = fs.readFileSync(workflowPath, 'utf8');
      const doc = yaml.load(content);

      // Verify branch trigger
      expect(doc.on.push.branches).toContain('gh-pages');

      // Verify deployment permissions
      expect(doc.permissions.pages).toBe('write');
      expect(doc.permissions['id-token']).toBe('write');

      // Verify build and deploy actions
      const steps = doc.jobs.deploy.steps.map(s => s.run || s.uses);
      expect(steps.some(s => s && s.includes('npm run build'))).toBe(true);
      expect(steps.some(s => s && s.includes('actions/deploy-pages'))).toBe(true);
    });
  });

  // =========================================================================
  // DOMAIN: Document Metadata & Semantic Layout
  // =========================================================================
  describe('Domain: Document Metadata & Semantic Layout', () => {
    it('should contain developer-focused page title, SEO meta tags, Open Graph, and Twitter metadata per Spec #98 §4', () => {
      expect(document.title).toBe('ship-it | Structured Lifecycle Automation for Software Teams');
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).not.toBeNull();
      expect(metaDesc.getAttribute('content').length).toBeGreaterThan(20);

      // Open Graph & Social Cards
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogType = document.querySelector('meta[property="og:type"]');
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');

      expect(ogTitle?.getAttribute('content')).toBe('ship-it | Structured Lifecycle Automation for Software Teams');
      expect(ogDesc?.getAttribute('content')).toBe(
        'Keep developers in control. Coordinate feature delivery across GitHub issues using phase gates, fresh-session validation, and two-axis code reviews.'
      );
      expect(ogType, 'og:type meta tag must exist').not.toBeNull();
      expect(twitterCard, 'twitter:card meta tag must exist').not.toBeNull();
      expect(twitterTitle?.getAttribute('content')).toBe('ship-it | Structured Lifecycle Automation for Software Teams');
    });

    it('should configure a valid favicon link referencing an existing asset', () => {
      const faviconLink = document.querySelector('link[rel~="icon"]');
      expect(faviconLink, 'Favicon link must exist in head').not.toBeNull();
      const href = faviconLink.getAttribute('href');
      expect(href).toMatch(/favicon\.(svg|ico|png)/i);

      const cleanHref = href.replace(/^\.\//, '');
      const faviconPath = path.join(ROOT_DIR, cleanHref);
      expect(fs.existsSync(faviconPath), `Favicon asset must exist at ${faviconPath}`).toBe(true);
    });

    it('should structure content within semantic header, main, and footer landmarks', () => {
      expect(document.querySelector('header')).not.toBeNull();
      expect(document.querySelector('main')).not.toBeNull();
      expect(document.querySelector('footer')).not.toBeNull();
    });

    it('should arrange primary sections in logical sequential flow: Hero -> Lifecycle Explorer -> SDLC Comparison -> Architecture Deep-Dive -> Quickstart', () => {
      const main = document.querySelector('main');
      const sections = Array.from(main.querySelectorAll(':scope > section'));
      const sectionIds = sections.map(s => s.getAttribute('id'));

      expect(sectionIds).toEqual(['hero', 'lifecycle-explorer', 'sdlc-comparison', 'architecture-deep-dive', 'quickstart']);
    });

    it('should guarantee unique IDs across all interactive elements', () => {
      const interactiveEls = document.querySelectorAll('a, button, input, select');
      const ids = new Set();
      interactiveEls.forEach(el => {
        const id = el.getAttribute('id');
        if (id) {
          expect(ids.has(id), `Duplicate ID found: ${id}`).toBe(false);
          ids.add(id);
        }
      });
    });

    it('should synchronize gh-pages README.md with root README.md from #99', () => {
      const readmePath = path.join(ROOT_DIR, 'README.md');
      const readme = fs.readFileSync(readmePath, 'utf8');
      expect(readme).toContain('**Disciplined feature delivery for engineering teams.**');
      expect(readme).toContain('### Map vs. Spec');
      expect(readme).toContain('Phase exit / Boundary halt');
      expect(readme).toContain('View Boundary 1: Map Lifecycle Diagram');
      expect(readme).toContain('View Boundary 2: Spec & Ticket Definition Diagram');
      expect(readme).toContain('View Boundary 3: Ticket Loop & PR Close-Out Diagram');
      expect(readme).toContain('pragmatic, domain-aligned verification');
      expect(readme).toContain('ad-hoc test harness prohibition');
      expect(readme).toContain('Spec #34');
      expect(readme).toContain('Spec #36');
    });

    it('should exclude Mermaid diagram blocks from the marketing site application', () => {
      const htmlPath = path.join(ROOT_DIR, 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      expect(html).not.toMatch(/mermaid/i);
    });
  });

  // =========================================================================
  // DOMAIN: Hero Section & Brand Navigation
  // =========================================================================
  describe('Domain: Hero Section & Brand Navigation', () => {
    it('should render a single h1 element preserving "driver\'s seat"', () => {
      const h1s = document.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
      expect(h1s[0].textContent.replace(/\s+/g, ' ').trim()).toMatch(/driver's seat/i);
    });

    it('should provide functional CTA links for GitHub repository and Quickstart anchor', () => {
      const ctaGithub = document.querySelector('#cta-github-repo');
      const ctaQuickstart = document.querySelector('#cta-quickstart');

      expect(ctaGithub, 'GitHub CTA button must exist').not.toBeNull();
      expect(ctaGithub.getAttribute('href')).toContain('github.com');
      expect(ctaGithub.getAttribute('target')).toBe('_blank');

      expect(ctaQuickstart, 'Quickstart CTA button must exist').not.toBeNull();
      expect(ctaQuickstart.getAttribute('href')).toBe('#quickstart');
    });

    it('should render developer-focused hero description with pragmatic, domain-aligned verification per Spec #98 §4', () => {
      const heroDesc = document.querySelector('#hero-description');
      expect(heroDesc).not.toBeNull();
      const normalized = heroDesc.textContent.replace(/\s+/g, ' ').trim();
      expect(normalized).toBe(
        'ship-it automates feature delivery inside your GitHub repository. The conductor coordinates architecture maps, written specifications, pragmatic, domain-aligned verification, and two-axis code reviews while you steer technical decisions.'
      );
      expect(heroDesc.querySelector('strong')?.textContent).toBe('ship-it');
    });
  });

  // =========================================================================
  // DOMAIN: Interactive Flow Visualizer (#lifecycle-explorer)
  // =========================================================================
  describe('Domain: Interactive Flow Visualizer (#lifecycle-explorer)', () => {
    it('should mount FlowVisualizer inside #flow-visualizer-root within #lifecycle-explorer with updated section header', () => {
      const section = document.querySelector('#lifecycle-explorer');
      expect(section).not.toBeNull();

      const title = section.querySelector('#explorer-title');
      const subtitle = section.querySelector('#explorer-subtitle');
      expect(title?.textContent.replace(/\s+/g, ' ').trim()).toBe('Step-By-Step Workflow');
      expect(subtitle?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Inspect each phase to examine inputs, deliverables, human checkpoints, and validation safeguards.'
      );

      const root = section.querySelector('#flow-visualizer-root');
      expect(root, '#flow-visualizer-root must exist inside #lifecycle-explorer').not.toBeNull();
      expect(root.children.length).toBeGreaterThan(0);
    });

    it('should render accessible flow selector tabs (Map Lifecycle and Spec Lifecycle) and display comparison summary and active flow blurb', () => {
      const root = document.querySelector('#flow-visualizer-root');
      const mapTab = root.querySelector('[data-flow-tab="map"]');
      const specTab = root.querySelector('[data-flow-tab="spec"]');

      expect(mapTab).not.toBeNull();
      expect(specTab).not.toBeNull();
      expect(mapTab.getAttribute('role')).toBe('tab');
      expect(specTab.getAttribute('role')).toBe('tab');

      // Map tab is active by default
      expect(mapTab.getAttribute('aria-selected')).toBe('true');
      expect(specTab.getAttribute('aria-selected')).toBe('false');
      expect(root.textContent).toContain('Resolve architectural uncertainty and choose a direction.');
      expect(root.textContent).toContain('When a Map Occurs (Boundary 1: Mapping)');
      expect(root.textContent).toContain('Boundary 1 Gate: All open decisions are settled.');

      // Switch to Spec tab
      act(() => {
        specTab.click();
      });
      expect(specTab.getAttribute('aria-selected')).toBe('true');
      expect(mapTab.getAttribute('aria-selected')).toBe('false');
      expect(root.textContent).toContain('Deliver settled requirements through verified code.');
      expect(root.textContent).toContain('When a Spec Occurs (Boundary 2: Definition & Boundary 3: Execution)');
      expect(root.textContent).toContain('Boundary 3 Gate: All tickets pass two-axis review and final audit.');

      // Switch back to Map tab
      act(() => {
        mapTab.click();
      });
      expect(mapTab.getAttribute('aria-selected')).toBe('true');
    });

    it('should render the 4-stage horizontal stepper in Map Lifecycle view with selectable decision ticket sub-cards and Boundary 1 Exit Gate', () => {
      const root = document.querySelector('#flow-visualizer-root');
      const mapTab = root.querySelector('[data-flow-tab="map"]');
      act(() => {
        mapTab.click();
      });

      const stageButtons = root.querySelectorAll('[data-stepper-stage]');
      expect(stageButtons.length).toBe(4);

      const stepperText = Array.from(stageButtons).map(b => b.textContent).join(' ');
      expect(stepperText).toContain('Map Initialization');
      expect(stepperText).toContain('ship-it:map');
      expect(stepperText).toContain('Decision Ticket Types');
      expect(stepperText).toContain('Resolution & Fog Loop');
      expect(stepperText).toContain('Decisions so far');
      expect(stepperText).toContain('Boundary 1 Exit Gate');
      expect(stepperText).toContain('ship-it <slug>');

      // Select Stage 2: Decision Ticket Types
      const stage2Btn = root.querySelector('[data-stepper-stage="map-decision-tickets"]');
      expect(stage2Btn).not.toBeNull();
      act(() => {
        stage2Btn.click();
      });

      const subCards = root.querySelectorAll('[data-decision-ticket]');
      expect(subCards.length).toBe(4);
      const subCardsText = Array.from(subCards).map(c => c.textContent).join(' ');
      expect(subCardsText).toContain('ship-it:research');
      expect(subCardsText).toContain('ship-it:prototype');
      expect(subCardsText).toContain('ship-it:grilling');
      expect(subCardsText).toContain('ship-it:task');
      expect(subCardsText).toContain('Subagent: decide');
      expect(subCardsText).toContain('Conductor: interactive');

      // Clicking a decision ticket sub-card updates the inspector panel
      const grillingCard = root.querySelector('[data-decision-ticket="grilling"]');
      expect(grillingCard).not.toBeNull();
      act(() => {
        grillingCard.click();
      });

      const inspector = root.querySelector('[role="tabpanel"]');
      expect(inspector).not.toBeNull();
      expect(inspector.textContent).toContain('ship-it:grilling');
      expect(inspector.textContent).toContain('Conductor: interactive');

      // Select Stage 4: Boundary 1 Exit Gate
      const stage4Btn = root.querySelector('[data-stepper-stage="map-exit-gate"]');
      act(() => {
        stage4Btn.click();
      });
      expect(inspector.textContent).toMatch(/Boundary 1 exit/i);
      expect(inspector.textContent).toContain('ship-it <slug>');
    });

    it('should render the 5-stage horizontal stepper in Spec Lifecycle view and update the node inspector panel across all stages', () => {
      const root = document.querySelector('#flow-visualizer-root');
      const specTab = root.querySelector('[data-flow-tab="spec"]');
      act(() => {
        specTab.click();
      });

      const stageButtons = root.querySelectorAll('[data-stepper-stage]');
      expect(stageButtons.length).toBe(5);

      const stepperText = Array.from(stageButtons).map(b => b.textContent).join(' ');
      expect(stepperText).toMatch(/Boundary 2.*Validation/i);
      expect(stepperText).toContain('Stage 1: Implement with Verification');
      expect(stepperText).toContain('Stage 2: Two-Axis Review');
      expect(stepperText).toContain('Stage 3: Final Review');
      expect(stepperText).toContain('Stage 4: Annotated PR & Close-Out');

      const inspector = root.querySelector('[role="tabpanel"]');
      expect(inspector).not.toBeNull();

      // Verify each stage updates the inspector with Purpose, Inputs & Outputs, Human Checkpoint, Anti-Drift Guarantee, and Artifact Preview
      for (const btn of stageButtons) {
        act(() => {
          btn.click();
        });
        const text = inspector.textContent;
        expect(text).toContain('Purpose');
        expect(text).toContain('Inputs & Outputs');
        expect(text).toContain('Human Checkpoint');
        expect(text).toContain('Anti-Drift Guarantee');
        expect(text).toContain('Artifact Preview');
      }

      // Check specific stage content in Spec Lifecycle
      const b2Btn = root.querySelector('[data-stepper-stage="spec-boundary-2"]');
      act(() => {
        b2Btn.click();
      });
      expect(inspector.textContent).toContain('Testing Decisions');
      expect(inspector.textContent).toContain('Subagent: validate');
      expect(inspector.textContent).toContain('Subagent: slice');
      expect(inspector.textContent).toMatch(/Boundary 2 exit/i);

      const s1Btn = root.querySelector('[data-stepper-stage="spec-stage-1"]');
      act(() => {
        s1Btn.click();
      });
      expect(inspector.textContent).toContain('Fixed point:');
      expect(inspector.textContent).toMatch(/domain-aligned verification/i);
      expect(inspector.textContent).toMatch(/ad-hoc test harness prohibition/i);
      expect(inspector.textContent).toMatch(/ephemeral subagent exploration/i);
      expect(inspector.textContent).toMatch(/negative invariants/i);
      expect(inspector.textContent).toContain('Red-Green');

      const s2Btn = root.querySelector('[data-stepper-stage="spec-stage-2"]');
      act(() => {
        s2Btn.click();
      });
      expect(inspector.textContent).toContain('Subagent: review');
      expect(inspector.textContent).toContain('Subagent: rework');
      expect(inspector.textContent).toMatch(/verified acceptance criteria proof/i);

      const s3Btn = root.querySelector('[data-stepper-stage="spec-stage-3"]');
      act(() => {
        s3Btn.click();
      });
      expect(inspector.textContent).toContain('Subagent: final-review');

      const s4Btn = root.querySelector('[data-stepper-stage="spec-stage-4"]');
      act(() => {
        s4Btn.click();
      });
      expect(inspector.textContent).toContain('Subagent: close-out');
      expect(inspector.textContent).toMatch(/Boundary 3 exit/i);
    });
  });

  // =========================================================================
  // DOMAIN: SDLC Comparison (The Contrast)
  // =========================================================================
  describe('Domain: SDLC Comparison (The Contrast)', () => {
    it('should have a dedicated comparison section with semantic heading', () => {
      const section = document.querySelector('#sdlc-comparison');
      expect(section, 'Comparison section #sdlc-comparison must exist').not.toBeNull();
      const heading = section.querySelector('h2');
      expect(heading).not.toBeNull();
      expect(heading.textContent).toMatch(/Why a Conductor|Value|Contrast|Crisis|Drift|Solution|Method/i);
    });

    it('should contain Value Dividends Bento cards with contrast micro-tags for All-at-Once vs ship-it', () => {
      const section = document.querySelector('#sdlc-comparison');
      const bentoCards = section.querySelectorAll('.bento-value-card');
      expect(bentoCards.length).toBe(4);

      const sectionText = section.textContent;
      expect(sectionText).toMatch(/mega-PR|sprawling/i);
      expect(sectionText).toMatch(/vertical slice/i);
      expect(sectionText).toMatch(/context.*bloat|degraded.*reasoning/i);
      expect(sectionText).toMatch(/fresh.*session|zero.*memory/i);
      expect(sectionText).toMatch(/rubber-stamp|unreviewable/i);
      expect(sectionText).toMatch(/two-axis|adversarial.*verification/i);
      expect(sectionText).toMatch(/lost.*control|hallucinated/i);
      expect(sectionText).toMatch(/architectural control|human.*driver/i);
    });

    it('should contrast four critical SDLC dimensions: diff scope, context length, review verification, and developer agency', () => {
      const section = document.querySelector('#sdlc-comparison');
      const text = section.textContent;

      // Dimension 1: Diff Scope & PR Size
      expect(text).toMatch(/mega-pr/i);
      expect(text).toMatch(/vertical slice|tracer-bullet/i);

      // Dimension 2: Context Length & Degraded Reasoning
      expect(text).toMatch(/degraded.*reasoning|context.*bloat/i);
      expect(text).toMatch(/context.*isolation|fresh.*session/i);

      // Dimension 3: Review Quality & Verification
      expect(text).toMatch(/unreviewable diff|rubber-stamp/i);
      expect(text).toMatch(/adversarial.*verification|two-axis/i);

      // Dimension 4: Developer Direction & Agency
      expect(text).toMatch(/lost.*control|hallucinated/i);
      expect(text).toMatch(/architectural control|human.*driver|technical authority/i);
    });

    it('should render the developer-focused SDLC comparison copy per Spec #98 §4', () => {
      const subtitle = document.querySelector('#comparison-subtitle');
      expect(subtitle?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Unguided prompts lose context and skip verification on large tasks. ship-it structures development into verifiable steps with clear human gates.'
      );

      const contextCard = document.querySelector('#bento-card-context-hygiene .bento-desc');
      expect(contextCard?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Starting a fresh session for each phase prevents context degradation. Each agent focuses on a single task with full reasoning capacity.'
      );

      const reviewCard = document.querySelector('#bento-card-review-quality .bento-desc');
      expect(reviewCard?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Independent reviewers audit diffs across two distinct axes: coding standards and specification fidelity. Reviewers evaluate changes without author bias.'
      );

      const devCard = document.querySelector('#bento-card-developer-agency .bento-desc');
      expect(devCard?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'You maintain complete technical authority. You steer requirements, verify test seams, and approve diffs while automation executes routine tasks.'
      );
    });
  });

  // =========================================================================
  // DOMAIN: Architectural Deep Dives & Foundations
  // =========================================================================
  describe('Domain: Architectural Deep Dives & Foundations', () => {
    it('should have a dedicated architecture deep-dive section with semantic heading', () => {
      const section = document.querySelector('#architecture-deep-dive');
      expect(section, 'Architecture section #architecture-deep-dive must exist').not.toBeNull();
      const heading = section.querySelector('h2');
      expect(heading).not.toBeNull();
      expect(heading.textContent).toMatch(/Architecture|Foundations|Pillars|Principles|Deep Dive/i);
    });

    it('should render four architecture deep-dive cards with icons, headings, and conceptual explanations', () => {
      const section = document.querySelector('#architecture-deep-dive');
      expect(section).not.toBeNull();
      const cards = section.querySelectorAll('.deep-dive-card');
      expect(cards.length).toBe(4);

      cards.forEach((card, index) => {
        expect(card.querySelector('.deep-dive-icon, .card-icon'), `Card ${index + 1} must have an icon`).not.toBeNull();
        expect(card.querySelector('h3'), `Card ${index + 1} must have an h3 title`).not.toBeNull();
        expect(card.querySelector('p'), `Card ${index + 1} must have a description`).not.toBeNull();
      });
    });

    it('should articulate the four core architectural pillars with developer-focused copy per Spec #98 §4', () => {
      const section = document.querySelector('#architecture-deep-dive');
      expect(section).not.toBeNull();

      const subtitle = section.querySelector('#deep-dive-subtitle');
      expect(subtitle?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Four core engineering practices that keep automated workflows disciplined, repeatable, and verifiable.'
      );

      const p1 = section.querySelector('#deep-dive-card-context-hygiene .deep-dive-desc');
      expect(p1?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Long conversational threads suffer from token limits and reasoning degradation. ship-it treats clearing context as a standard operational practice. Every phase and ticket begins in a fresh session anchored to the git merge-base, eliminating context rot and preserving precision.'
      );

      const p2 = section.querySelector('#deep-dive-card-adversarial-validation .deep-dive-desc');
      expect(p2?.textContent.replace(/\s+/g, ' ').trim()).toMatch(
        /^When the same session writes and approves a specification, confirmation bias hides omissions\. ship-it dispatches an independent auditor in a fresh-session pre-build audit\. The auditor validates specifications and ticket dependencies before (implementation begins|any implementation code is written)\.$/
      );

      const p3 = section.querySelector('#deep-dive-card-two-axis-review .deep-dive-desc');
      expect(p3?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Code reviews evaluate changes along two explicit dimensions. Axis 1 checks coding standards, modularity, and repository conventions. Axis 2 verifies spec fidelity against each ticket acceptance criterion.'
      );

      const p4 = section.querySelector('#deep-dive-card-github-traceability .deep-dive-desc');
      expect(p4?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Work requires zero proprietary SaaS, no external dashboards, and no vendor lock-in. ship-it models the complete lifecycle directly in GitHub using issues as the state machine, tasklists for dependencies, and pull requests for the permanent audit log.'
      );
    });
  });

  // =========================================================================
  // DOMAIN: Interactive CLI Terminal & Quickstart Onboarding
  // =========================================================================
  describe('Domain: Interactive CLI Terminal & Quickstart Onboarding', () => {
    it('should render the Quickstart section and footer with developer-focused copy per Spec #98 §4', () => {
      const quickstart = document.querySelector('#quickstart');
      expect(quickstart).not.toBeNull();

      const qsSubtitle = quickstart.querySelector('.quickstart-subtitle');
      expect(qsSubtitle?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Add the ship-it skill to your workspace to guide feature development through structured phases.'
      );

      const footerTagline = document.querySelector('.footer-tagline');
      expect(footerTagline?.textContent.replace(/\s+/g, ' ').trim()).toBe(
        'Structured lifecycle automation that keeps developers in control. Coordinates planning, specifications, tests, and reviews directly on GitHub.'
      );

      const installCommand = document.querySelector('#cmd-install');
      expect(installCommand).not.toBeNull();
      expect(installCommand.textContent).toContain('npx skills install awhipp/ship-it');

      const copyBtn = document.querySelector('#btn-copy-install');
      expect(copyBtn).not.toBeNull();

      const invokeSnippet = document.querySelector('#cmd-invoke, .cmd-invocation');
      expect(invokeSnippet, 'Copyable invocation snippet must exist').not.toBeNull();
      expect(invokeSnippet.textContent).toContain('/ship-it');

      const copyInvokeBtn = document.querySelector('#btn-copy-invoke, .btn-copy-invoke');
      expect(copyInvokeBtn, 'Copy invocation button must exist').not.toBeNull();
    });

    it('should provide interactive CLI terminal controls to simulate /ship-it lifecycle phases', () => {
      const terminal = document.querySelector('#terminal-interactive, #terminal-quickstart');
      expect(terminal, 'Interactive terminal container must exist').not.toBeNull();

      const simControls = document.querySelector('#terminal-sim-controls, .terminal-sim-tabs');
      expect(simControls, 'Simulation controls container must exist').not.toBeNull();

      const simButtons = simControls.querySelectorAll('button[data-sim-step]');
      expect(simButtons.length).toBeGreaterThanOrEqual(3);

      const terminalScreen = document.querySelector('#terminal-screen, .terminal-screen-output');
      expect(terminalScreen, 'Terminal screen output container must exist').not.toBeNull();
    });

    it('should interactively update terminal execution output across Orient, Implement, and Review steps', () => {
      const btnOrient = document.querySelector('[data-sim-step="orient"]');
      const btnImplement = document.querySelector('[data-sim-step="implement"]');
      const btnReview = document.querySelector('[data-sim-step="review"]');
      const terminalScreen = document.querySelector('#terminal-screen, .terminal-screen-output');

      expect(btnOrient).not.toBeNull();
      expect(btnImplement).not.toBeNull();
      expect(btnReview).not.toBeNull();
      expect(terminalScreen).not.toBeNull();

      // Trigger Orient simulation
      btnOrient.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      expect(terminalScreen.textContent).toMatch(/orient|map|spec|slug|unblocked|ticket/i);

      // Trigger Implement simulation
      btnImplement.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      expect(terminalScreen.textContent).toMatch(/claim|branch|test|red.*green/i);

      // Trigger Review simulation
      btnReview.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      expect(terminalScreen.textContent).toMatch(/two-axis|standards|spec/i);
    });

    it('should frame Ticket #19 with workflow verification for the automated test suite in the terminal simulator', () => {
      const btnImplement = document.querySelector('[data-sim-step="implement"]');
      const terminalScreen = document.querySelector('#terminal-screen, .terminal-screen-output');
      btnImplement.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      expect(terminalScreen.textContent).toMatch(
        /workflow verification for the automated test suite|automated test suite workflow|automated test suite verification/i
      );
    });
  });

  // =========================================================================
  // DOMAIN: Design System & Responsive Layout
  // =========================================================================
  describe('Domain: Design System & Responsive Layout', () => {
    it('should define core design system tokens and dark mode palette in CSS', () => {
      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      expect(fs.existsSync(cssPath), 'src/styles/main.css must exist').toBe(true);

      const css = fs.readFileSync(cssPath, 'utf8');
      expect(css).toContain('--bg-primary');
      expect(css).toContain('--text-primary');
      expect(css).toContain('--accent-gradient');
      expect(css).toContain('--color-drift');
      expect(css).toContain('--color-solution');
      expect(css).toContain('.sdlc-comparison-section');
      expect(css).toContain('.lifecycle-explorer-section');
    });

    it('should define responsive media queries for tablet and mobile viewports', () => {
      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      const css = fs.readFileSync(cssPath, 'utf8');

      expect(css).toMatch(/@media[^{]*max-width:\s*768px/i);
      expect(css).toMatch(/@media[^{]*max-width:\s*400px/i);
    });
  });

  // =========================================================================
  // DOMAIN: Production Distribution Bundle
  // =========================================================================
  describe('Domain: Production Distribution Bundle', () => {
    it('should generate dist/index.html with relative asset references and no broken root-relative paths', () => {
      const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
      expect(fs.existsSync(distHtmlPath), 'dist/index.html must exist').toBe(true);

      const html = fs.readFileSync(distHtmlPath, 'utf8');
      expect(html).toContain('src="./assets/');
      expect(html).toContain('href="./assets/');
      expect(html).not.toMatch(/src="\/assets\//);
      expect(html).not.toMatch(/href="\/assets\//);
    });

    it('should retain all core domain sections in the production distribution build', () => {
      const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
      const html = fs.readFileSync(distHtmlPath, 'utf8');

      expect(html).toContain('id="hero"');
      expect(html).toContain('id="lifecycle-explorer"');
      expect(html).toContain('id="sdlc-comparison"');
      expect(html).toContain('id="architecture-deep-dive"');
      expect(html).toContain('id="quickstart"');
    });
  });
});
