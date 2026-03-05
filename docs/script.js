/* =========================================================
   Dopamind Product Website – script.js
   ========================================================= */

'use strict';

// ── Constants ──────────────────────────────────────────────
const LANG_KEY               = 'dopamind-website-lang';
const THEME_KEY              = 'dopamind-website-theme';
const GITHUB_URL             = 'https://github.com/Elmontag/Dopamind';
const INTERSECTION_THRESHOLD = 0.12;   // fraction of element visible before animating in
const ANIMATION_DELAY_STEP   = 0.12;   // seconds between hero child animation delays

// ── i18n Translations ──────────────────────────────────────
const translations = {
  de: {
    'nav.vision':      'Vision',
    'nav.features':    'Features',
    'nav.deployment':  'Deployment',
    'nav.github':      'GitHub',
    'nav.impressum':   'Impressum',
    'hero.tagline':    'ADHS-freundliches Planungs- & Produktivitätstool mit Gamification.',
    'hero.subtitle':   'Dopamind hilft Menschen mit ADHS, Entscheidungslähmung zu überwinden – durch priorisierte Aufgaben, zeitblockierte Tagespläne und ein motivierendes Gamification-System.',
    'hero.cta.github': 'Auf GitHub ansehen',
    'hero.cta.start':  'Jetzt starten',
    'vision.label':    'UNSERE MISSION',
    'features.label':  'WAS DOPAMIND KANN',
    'techstack.title': 'Tech Stack',
    'techstack.label': 'TECHNOLOGIEN',
    'deployment.label':'SCHNELLSTART',
    'impressum.label': 'RECHTLICHES',
    'footer.made':     'Made with ❤️ for the ADHD Community',
    'footer.impressum':'Impressum',
    'footer.github':   'GitHub',
    'copy.btn':        'Kopieren',
    'copy.done':       'Kopiert!',
  },
  en: {
    'nav.vision':      'Vision',
    'nav.features':    'Features',
    'nav.deployment':  'Deployment',
    'nav.github':      'GitHub',
    'nav.impressum':   'Legal',
    'hero.tagline':    'ADHD-friendly planning & productivity tool with gamification.',
    'hero.subtitle':   'Dopamind helps people with ADHD overcome decision paralysis by prioritizing tasks, suggesting time-blocked schedules, and rewarding progress through a gamification system.',
    'hero.cta.github': 'View on GitHub',
    'hero.cta.start':  'Get Started',
    'vision.label':    'OUR MISSION',
    'features.label':  'WHAT DOPAMIND DOES',
    'techstack.title': 'Tech Stack',
    'techstack.label': 'TECHNOLOGIES',
    'deployment.label':'QUICK START',
    'impressum.label': 'LEGAL',
    'footer.made':     'Made with ❤️ for the ADHD Community',
    'footer.impressum':'Legal Notice',
    'footer.github':   'GitHub',
    'copy.btn':        'Copy',
    'copy.done':       'Copied!',
  },
};

// ── State ──────────────────────────────────────────────────
let currentLang  = localStorage.getItem(LANG_KEY)  || 'de';
let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';

// ── Helpers ────────────────────────────────────────────────
function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) ||
         (translations['de'][key]) || key;
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
  localStorage.setItem(THEME_KEY, theme);

  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);

  // Update <html lang>
  document.documentElement.lang = lang;

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Update all data-i18n-title elements (for title attributes)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });

  // Update lang toggle button label
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = lang === 'de' ? 'EN' : 'DE';

  // Reload all markdown sections
  loadAllMarkdown();
}

// ── Markdown Loading ───────────────────────────────────────
const markdownSections = [
  { id: 'vision-content',    file: 'vision',     wrapFeatures: false },
  { id: 'features-content',  file: 'features',   wrapFeatures: true  },
  { id: 'deployment-content',file: 'deployment', wrapFeatures: false },
  { id: 'impressum-content', file: 'impressum',  wrapFeatures: false },
];

async function loadMarkdown(section) {
  const url = `content/${section.file}.${currentLang}.md`;
  const container = document.getElementById(section.id);
  if (!container) return;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    const html  = marked.parse(text);

    if (section.wrapFeatures) {
      container.innerHTML = buildFeatureCards(html);
    } else {
      container.innerHTML = html;
    }

    // Attach copy buttons to every pre > code block
    container.querySelectorAll('pre').forEach(attachCopyButton);
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">⚠️ Could not load content: ${url}</p>`;
    console.error('[Dopamind] Failed to load markdown:', url, err);
  }
}

function loadAllMarkdown() {
  markdownSections.forEach(s => loadMarkdown(s));
}

// ── Feature Card Builder ───────────────────────────────────
// Converts the flat markdown HTML for features into a card grid
function buildFeatureCards(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // The MD has: h2 "Features", then pairs of h3 + p
  const heading = tempDiv.querySelector('h2');
  const headingHtml = heading ? heading.outerHTML : '';

  const cards = [];
  const h3s = tempDiv.querySelectorAll('h3');

  h3s.forEach(h3 => {
    const title = h3.innerHTML;
    // Collect all sibling p/ul/ol until next h3
    let content = '';
    let sibling = h3.nextElementSibling;
    while (sibling && sibling.tagName !== 'H3') {
      content += sibling.outerHTML;
      sibling = sibling.nextElementSibling;
    }
    cards.push(`
      <div class="feature-card anim-hidden">
        <h3>${title}</h3>
        ${content}
      </div>`);
  });

  return `${headingHtml}<div class="features-grid">${cards.join('')}</div>`;
}

// ── Copy Button ────────────────────────────────────────────
function attachCopyButton(pre) {
  if (pre.querySelector('.copy-btn')) return; // already attached

  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = t('copy.btn');

  btn.addEventListener('click', async () => {
    const code = pre.querySelector('code');
    const textToCopy = code ? code.innerText : pre.innerText;
    try {
      await navigator.clipboard.writeText(textToCopy);
      btn.textContent = t('copy.done');
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = t('copy.btn');
        btn.classList.remove('copied');
      }, 2000);
    } catch {
      btn.textContent = '✗';
      setTimeout(() => { btn.textContent = t('copy.btn'); }, 2000);
    }
  });

  pre.style.position = 'relative';
  pre.appendChild(btn);
}

// ── Intersection Observer (scroll animations) ──────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('anim-hidden');
        entry.target.classList.add('anim-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: INTERSECTION_THRESHOLD });

  // Observe existing elements
  document.querySelectorAll('.anim-hidden').forEach(el => observer.observe(el));

  // Re-observe when new cards appear (after MD loads)
  const mutationObs = new MutationObserver(() => {
    document.querySelectorAll('.anim-hidden:not([data-observed])').forEach(el => {
      el.setAttribute('data-observed', '1');
      observer.observe(el);
    });
  });

  mutationObs.observe(document.body, { childList: true, subtree: true });
}

// ── Mobile Navigation ──────────────────────────────────────
function initMobileNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Smooth Scroll for anchor links ────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ── Hero Animation ─────────────────────────────────────────
function initHeroAnimation() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  hero.querySelectorAll('.anim-hidden').forEach((el, i) => {
    el.style.animationDelay = `${i * ANIMATION_DELAY_STEP}s`;
    el.classList.remove('anim-hidden');
    el.classList.add('animate-fade-in');
  });
}

// ── Event Listeners ────────────────────────────────────────
function initControls() {
  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  // Language toggle
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      applyLang(currentLang === 'de' ? 'en' : 'de');
    });
  }
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Apply persisted / default settings
  applyTheme(currentTheme);
  applyLang(currentLang);   // also loads all markdown

  initControls();
  initMobileNav();
  initSmoothScroll();
  initScrollAnimations();
  initHeroAnimation();
});
