import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { JSDOM } from 'jsdom';

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Marketing Site Architecture & Domains', () => {
  let dom;
  let document;
  let window;

  beforeAll(() => {
    const htmlPath = path.join(ROOT_DIR, 'index.html');
    expect(fs.existsSync(htmlPath), 'index.html must exist').toBe(true);
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, { runScripts: 'dangerously' });
    document = dom.window.document;
    window = dom.window;

    // Load and execute main.js in JSDOM
    const jsPath = path.join(ROOT_DIR, 'src/main.js');
    const jsCode = fs.readFileSync(jsPath, 'utf8');
    window.eval(jsCode);
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
  });

  // =========================================================================
  // DOMAIN: Infrastructure & Deployment Pipeline
  // =========================================================================
  describe('Domain: Infrastructure & Deployment Pipeline', () => {
    it('should configure Vite with relative base path "./" for subpath hosting', async () => {
      const configPath = path.join(ROOT_DIR, 'vite.config.js');
      expect(fs.existsSync(configPath), 'vite.config.js must exist').toBe(true);

      const configModule = await import(configPath);
      const config = configModule.default;
      expect(config.base).toBe('./');
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
    it('should contain descriptive page title, SEO meta tags, Open Graph, and Twitter metadata', () => {
      expect(document.title).toMatch(/ship-it/i);
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).not.toBeNull();
      expect(metaDesc.getAttribute('content').length).toBeGreaterThan(20);

      // Open Graph & Social Cards
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogType = document.querySelector('meta[property="og:type"]');
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');

      expect(ogTitle, 'og:title meta tag must exist').not.toBeNull();
      expect(ogDesc, 'og:description meta tag must exist').not.toBeNull();
      expect(ogType, 'og:type meta tag must exist').not.toBeNull();
      expect(twitterCard, 'twitter:card meta tag must exist').not.toBeNull();
      expect(twitterTitle, 'twitter:title meta tag must exist').not.toBeNull();
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
  });

  // =========================================================================
  // DOMAIN: Hero Section & Brand Navigation
  // =========================================================================
  describe('Domain: Hero Section & Brand Navigation', () => {
    it('should render a single h1 element clearly communicating the value proposition', () => {
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
  });

  // =========================================================================
  // DOMAIN: Interactive 5-Phase Lifecycle Explorer
  // =========================================================================
  describe('Domain: Interactive 5-Phase Lifecycle Explorer', () => {
    it('should have a dedicated lifecycle explorer section with semantic heading', () => {
      const section = document.querySelector('#lifecycle-explorer');
      expect(section, 'Lifecycle Explorer section #lifecycle-explorer must exist').not.toBeNull();
      const heading = section.querySelector('h2');
      expect(heading).not.toBeNull();
      expect(heading.textContent).toMatch(/Lifecycle|5-Phase|Explorer|Workflow|Step-By-Step/i);
    });

    it('should render tabbed navigation controls for all 5 phases: Plan, Spec, Tickets, Implement, Review', () => {
      const navContainer = document.querySelector('#explorer-nav, [data-explorer-nav]');
      expect(navContainer, 'Explorer navigation container must exist').not.toBeNull();

      const phases = ['Plan', 'Spec', 'Tickets', 'Implement', 'Review'];
      for (const phase of phases) {
        const tabEl = navContainer.querySelector(`[data-explorer-tab="${phase.toLowerCase()}"]`);
        expect(tabEl, `Tab for phase "${phase}" must exist`).not.toBeNull();
        expect(tabEl.textContent).toContain(phase);
        expect(tabEl.getAttribute('role')).toBe('tab');
      }
    });

    it('should provide detail panels for all 5 phases with structured breakdowns and artifact previews', () => {
      const phases = ['plan', 'spec', 'tickets', 'implement', 'review'];
      for (const phase of phases) {
        const panel = document.querySelector(`[data-explorer-panel="${phase}"]`);
        expect(panel, `Detail panel for phase "${phase}" must exist`).not.toBeNull();
        expect(panel.getAttribute('role')).toBe('tabpanel');

        // Check breakdown cards
        expect(panel.querySelector('.explorer-grid-breakdown')).not.toBeNull();
        expect(panel.querySelector('.explorer-artifact-preview')).not.toBeNull();

        const panelText = panel.textContent;
        expect(panelText).toMatch(/Purpose|Mission|What this step does/i);
        expect(panelText).toMatch(/Input/i);
        expect(panelText).toMatch(/Output/i);
        expect(panelText).toMatch(/Human.*Checkpoint|Review.*Checkpoint|Where you step in/i);
        expect(panelText).toMatch(/Anti-Drift|Guarantee|Keeping on track|Preventing Drift/i);
      }
    });

    it('should switch active tab and display panel when a tab button is clicked', () => {
      const specTab = document.querySelector('#btn-tab-spec');
      const planTab = document.querySelector('#btn-tab-plan');
      const specPanel = document.querySelector('#panel-explorer-spec');
      const planPanel = document.querySelector('#panel-explorer-plan');

      expect(specTab).not.toBeNull();
      expect(specPanel).not.toBeNull();

      // Trigger click on spec tab
      specTab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

      // Spec tab and panel should be active; Plan inactive
      expect(specTab.classList.contains('active')).toBe(true);
      expect(specTab.getAttribute('aria-selected')).toBe('true');
      expect(specPanel.classList.contains('active')).toBe(true);

      expect(planTab.classList.contains('active')).toBe(false);
      expect(planTab.getAttribute('aria-selected')).toBe('false');
      expect(planPanel.classList.contains('active')).toBe(false);

      // Click back to plan tab
      planTab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      expect(planTab.classList.contains('active')).toBe(true);
      expect(planTab.getAttribute('aria-selected')).toBe('true');
      expect(planPanel.classList.contains('active')).toBe(true);
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
      expect(text).toMatch(/architectural control|human.*driver/i);
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

    it('should articulate the four core architectural pillars: Context Hygiene, Adversarial Validation Gate, Two-Axis Code Review, and GitHub-Native Traceability', () => {
      const section = document.querySelector('#architecture-deep-dive');
      expect(section).not.toBeNull();
      const text = section.textContent;

      // Pillar 1: Context Hygiene
      expect(text).toMatch(/Context Hygiene/i);
      expect(text).toMatch(/reasoning degradation|context rot|clearing context|fresh session/i);

      // Pillar 2: Adversarial Validation Gate
      expect(text).toMatch(/Adversarial Validation/i);
      expect(text).toMatch(/fresh-session|confirmation bias|audit|pre-build/i);

      // Pillar 3: Two-Axis Code Review
      expect(text).toMatch(/Two-Axis.*Review|Coding Standards.*Spec Fidelity/i);
      expect(text).toMatch(/standards/i);
      expect(text).toMatch(/spec fidelity/i);

      // Pillar 4: GitHub-Native Traceability
      expect(text).toMatch(/GitHub-Native Traceability|State Machine/i);
      expect(text).toMatch(/issues as.*state machine|zero proprietary SaaS|no vendor lock-in|git-native/i);
    });
  });

  // =========================================================================
  // DOMAIN: Interactive CLI Terminal & Quickstart Onboarding
  // =========================================================================
  describe('Domain: Interactive CLI Terminal & Quickstart Onboarding', () => {
    it('should render the Quickstart section with installation and invocation commands', () => {
      const quickstart = document.querySelector('#quickstart');
      expect(quickstart).not.toBeNull();

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
      expect(terminalScreen.textContent).toMatch(/orient|slug|unblocked|ticket/i);

      // Trigger Implement simulation
      btnImplement.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      expect(terminalScreen.textContent).toMatch(/claim|branch|test|red.*green/i);

      // Trigger Review simulation
      btnReview.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      expect(terminalScreen.textContent).toMatch(/two-axis|standards|spec/i);
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
