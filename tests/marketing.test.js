import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { JSDOM } from 'jsdom';

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Ticket #17: Marketing Site Scaffold & Hero Section', () => {
  describe('Vite Configuration', () => {
    it('should have vite.config.js with relative base path "./" to support GitHub Pages subpath routing', async () => {
      const configPath = path.join(ROOT_DIR, 'vite.config.js');
      expect(fs.existsSync(configPath), 'vite.config.js must exist').toBe(true);

      const configModule = await import(configPath);
      const config = configModule.default;
      expect(config.base).toBe('./');
    });
  });

  describe('GitHub Pages Deployment Workflow', () => {
    it('should have .github/workflows/deploy.yml targeting gh-pages with pages permissions', () => {
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml');
      expect(fs.existsSync(workflowPath), '.github/workflows/deploy.yml must exist').toBe(true);

      const content = fs.readFileSync(workflowPath, 'utf8');
      const doc = yaml.load(content);

      // Verify trigger
      expect(doc.on.push.branches).toContain('gh-pages');

      // Verify permissions
      expect(doc.permissions.pages).toBe('write');
      expect(doc.permissions['id-token']).toBe('write');

      // Verify build and deploy steps
      const steps = doc.jobs.deploy.steps.map(s => s.run || s.uses);
      expect(steps.some(s => s && s.includes('npm run build'))).toBe(true);
      expect(steps.some(s => s && s.includes('actions/deploy-pages'))).toBe(true);
    });
  });

  describe('Hero Section & HTML Semantic Structure', () => {
    let dom;
    let document;

    beforeAll(() => {
      const htmlPath = path.join(ROOT_DIR, 'index.html');
      expect(fs.existsSync(htmlPath), 'index.html must exist').toBe(true);
      const html = fs.readFileSync(htmlPath, 'utf8');
      dom = new JSDOM(html);
      document = dom.window.document;
    });

    it('should contain proper meta tags, title, and descriptive meta description', () => {
      expect(document.title).toMatch(/ship-it/i);
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).not.toBeNull();
      expect(metaDesc.getAttribute('content').length).toBeGreaterThan(20);
    });

    it('should have semantic header, main, and footer elements', () => {
      expect(document.querySelector('header')).not.toBeNull();
      expect(document.querySelector('main')).not.toBeNull();
      expect(document.querySelector('footer')).not.toBeNull();
    });

    it('should render a single h1 element with the core value proposition', () => {
      const h1s = document.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
      expect(h1s[0].textContent.replace(/\s+/g, ' ').trim()).toContain("The autonomous conductor that keeps developers in the driver's seat");
    });

    it('should render functional CTAs for GitHub repository and Quickstart anchor', () => {
      const ctaGithub = document.querySelector('#cta-github-repo');
      const ctaQuickstart = document.querySelector('#cta-quickstart');

      expect(ctaGithub, 'GitHub CTA button should exist').not.toBeNull();
      expect(ctaGithub.getAttribute('href')).toContain('github.com');
      expect(ctaGithub.getAttribute('target')).toBe('_blank');

      expect(ctaQuickstart, 'Quickstart CTA button should exist').not.toBeNull();
      expect(ctaQuickstart.getAttribute('href')).toBe('#quickstart');
    });

    it('should render an animated 5-phase lifecycle teaser with all 5 phases', () => {
      const teaser = document.querySelector('#hero-lifecycle-teaser');
      expect(teaser, 'Hero lifecycle teaser container must exist').not.toBeNull();

      const phases = ['Plan', 'Spec', 'Tickets', 'Implement', 'Review'];
      for (const phase of phases) {
        const phaseEl = teaser.querySelector(`[data-phase="${phase.toLowerCase()}"]`);
        expect(phaseEl, `Teaser step for phase "${phase}" must exist`).not.toBeNull();
        expect(phaseEl.textContent).toContain(phase);
      }
    });

    it('should ensure interactive elements have unique IDs', () => {
      const interactiveEls = document.querySelectorAll('a, button, input');
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

  describe('Design System & Dark Mode Styling', () => {
    it('should have CSS design system with dark mode tokens and responsive media queries', () => {
      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      expect(fs.existsSync(cssPath), 'src/styles/main.css must exist').toBe(true);

      const css = fs.readFileSync(cssPath, 'utf8');
      // Dark mode palette checks
      expect(css).toContain('--bg-primary');
      expect(css).toContain('--text-primary');
      expect(css).toContain('--accent-gradient');

      // Responsive media queries checks
      expect(css).toMatch(/@media[^{]*max-width:\s*768px/i);
    });
  });

  describe('Production Bundle Verification', () => {
    it('should generate dist/index.html with relative asset references and no root-relative asset paths', () => {
      const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
      expect(fs.existsSync(distHtmlPath), 'dist/index.html must exist').toBe(true);

      const html = fs.readFileSync(distHtmlPath, 'utf8');
      expect(html).toContain('src="./assets/');
      expect(html).toContain('href="./assets/');
      // Ensure no broken root-relative paths
      expect(html).not.toMatch(/src="\/assets\//);
      expect(html).not.toMatch(/href="\/assets\//);
    });
  });
});
