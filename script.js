/**
 * Portfolio — Vanilla JS Enhancements
 * 2026 UI/UX best practices
 *
 * Sections:
 *  1. Accordion — mutual exclusion, keyboard a11y
 *  2. Navigation — scroll-aware shrink + active section tracking
 *  3. Mobile hamburger menu
 *  4. Scroll reveal — IntersectionObserver for fade-up entries
 *  5. Counter animation — animated number counting
 *  6. Tool bar animation — progressive fill on enter
 *  7. Contact form — inline validation + mailto fallback
 */

/* ====================================================
   1. ACCORDION — mutual exclusion + keyboard support
   ==================================================== */

const accordionDetails = document.querySelectorAll('.accordion details');

accordionDetails.forEach((item) => {
  // Close others when one opens
  item.addEventListener('toggle', () => {
    if (item.open) {
      accordionDetails.forEach((other) => {
        if (other !== item) other.open = false;
      });
      // Update aria-expanded on the summary
      item.querySelector('summary')?.setAttribute('aria-expanded', 'true');
    } else {
      item.querySelector('summary')?.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard: Enter and Space already handled natively by <details>
  // Add Home / End support for list-like navigation
  item.querySelector('summary')?.addEventListener('keydown', (e) => {
    const summaries = [...accordionDetails].map((d) => d.querySelector('summary'));
    const idx = summaries.indexOf(e.currentTarget);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      summaries[(idx + 1) % summaries.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      summaries[(idx - 1 + summaries.length) % summaries.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      summaries[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      summaries[summaries.length - 1]?.focus();
    }
  });
});


/* ====================================================
   2. NAVIGATION — Scroll-aware + active section tracking
   ==================================================== */

const siteNav = document.getElementById('site-nav');
const navLinks = document.querySelectorAll('[data-nav-link]');
const sections = document.querySelectorAll('section[id]');

// Scroll-aware nav: add .scrolled class when past 80px
let lastScrollY = 0;
let ticking = false;

function updateNav() {
  const scrollY = window.scrollY;

  // Scrolled state (compact + shadow)
  if (scrollY > 80) {
    siteNav?.classList.add('scrolled');
  } else {
    siteNav?.classList.remove('scrolled');
  }

  lastScrollY = scrollY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateNav);
    ticking = true;
  }
}, { passive: true });

// Active section tracking via IntersectionObserver
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('data-nav-link') === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  },
  {
    rootMargin: '-30% 0px -60% 0px', // trigger when section occupies middle 10% of viewport
    threshold: 0,
  }
);

sections.forEach((section) => sectionObserver.observe(section));


/* ====================================================
   3. MOBILE HAMBURGER MENU
   ==================================================== */

const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('nav');

if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });
}


/* ====================================================
   4. SCROLL REVEAL — Fade-up on enter viewport
   ==================================================== */

// Add .reveal class to elements that should animate in
const revealTargets = [
  '.proof-item',
  '.case',
  '.timeline-track',
  '.tool-item',
  '.section-intro',
  '.work-header',
  '.about-lead',
  '.about-quote',
  '.contact-main',
  '.contact-form',
  '.accordion details',
];

// Only add reveal classes after DOM is ready (so no FOUC)
revealTargets.forEach((selector) => {
  document.querySelectorAll(selector).forEach((el, idx) => {
    el.classList.add('reveal');
    // Stagger siblings by 80ms
    const delay = Math.min(idx * 80, 400);
    el.style.transitionDelay = `${delay}ms`;
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after reveal so it stays visible
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.08,
  }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


/* ====================================================
   5. COUNTER ANIMATION — Proof strip numbers
   ==================================================== */

/**
 * Animate a number from 0 to target over `duration` ms
 * using requestAnimationFrame for smooth 60fps animation.
 */
function animateCounter(el, target, duration = 1200) {
  const suffix = el.closest('[data-suffix]')?.dataset.suffix ?? '';
  const startTime = performance.now();
  const isText = isNaN(target);

  if (isText) return; // Skip non-numeric (e.g. "ROI")

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    // Pad single digit with leading zero for aesthetics
    el.textContent = current < 10 ? `0${current}` : `${current}`;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target < 10 ? `0${target}${suffix}` : `${target}${suffix}`;
  }

  requestAnimationFrame(update);
}

// Trigger counters when proof strip enters viewport
const proofItems = document.querySelectorAll('.proof-item[data-count]');

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count, 10);
        const numberEl = entry.target.querySelector('.proof-number');
        if (numberEl && !isNaN(target)) {
          animateCounter(numberEl, target, 1100);
        }
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

proofItems.forEach((item) => counterObserver.observe(item));


/* ====================================================
   6. TOOL BAR ANIMATION — Progressive fill on enter
   ==================================================== */

const toolFills = document.querySelectorAll('.tool-fill');

const toolBarObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Trigger CSS transition by confirming the --fill var is set
        // The CSS already reads `width: var(--fill, 0%)` on the element
        // We just need to ensure the animation fires after layout
        entry.target.style.width = entry.target.style.getPropertyValue('--fill') ||
          getComputedStyle(entry.target).getPropertyValue('--fill');
        toolBarObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

toolFills.forEach((fill) => {
  // Store the target width and reset to 0 initially
  const target = getComputedStyle(fill).getPropertyValue('--fill').trim();
  fill.style.setProperty('--fill', '0%');
  toolBarObserver.observe(fill);

  // On intersection, we need to restore the target
  fill._targetFill = target;
});

// Patch: re-use the observer callback via a simpler approach
const toolBarObserver2 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target._targetFill;
        if (target) {
          // Small delay for visual nicety after element enters
          setTimeout(() => {
            entry.target.style.setProperty('--fill', target);
          }, 120);
        }
        toolBarObserver2.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

toolFills.forEach((fill) => toolBarObserver2.observe(fill));


/* ====================================================
   7. CONTACT FORM — Inline validation + mailto fallback
   ==================================================== */

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  // Real-time validation on blur
  const fields = contactForm.querySelectorAll('input[required], textarea[required]');

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      // Clear error on typing after first blur
      if (field.classList.contains('touched')) validateField(field);
    });
  });

  function validateField(field) {
    field.classList.add('touched');
    const errorEl = field.parentElement.querySelector('.field-error');
    let message = '';

    if (!field.value.trim()) {
      message = 'This field is required.';
    } else if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        message = 'Please enter a valid email address.';
      }
    } else if (field.tagName === 'TEXTAREA' && field.value.trim().length < 20) {
      message = 'Please add a bit more detail (at least 20 characters).';
    }

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = message ? 'block' : 'none';
    }

    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  function validateAll() {
    return [...fields].every((f) => validateField(f));
  }

  // Form submission — open mailto with prefilled content
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateAll()) {
      // Focus first invalid field
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    const data = new FormData(contactForm);
    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    const message = data.get('message')?.toString().trim();
    const budget = data.get('budget')?.toString();

    const budgetLine = budget && budget !== '' ? `\nMonthly budget: ${budget}` : '';
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}${budgetLine}\n\nGrowth challenge:\n${message}`
    );

    // Show success state
    showFormSuccess();

    // Open mailto after short delay
    setTimeout(() => {
      window.location.href = `mailto:hello@ammarganchi.com?subject=${subject}&body=${body}`;
    }, 600);
  });

  function showFormSuccess() {
    const submitBtn = contactForm.querySelector('.form-submit');
    if (!submitBtn) return;

    submitBtn.textContent = 'Message ready ✓';
    submitBtn.style.background = 'var(--sage)';
    submitBtn.disabled = true;

    // Reset after 5 seconds
    setTimeout(() => {
      submitBtn.textContent = 'Send inquiry ↗';
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 5000);
  }
}


/* ====================================================
   8. SMOOTH ANCHOR SCROLL — Offset for sticky nav
   ==================================================== */

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navHeight = siteNav?.getBoundingClientRect().height ?? 68;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  });
});


/* ====================================================
   9. HERO ANIMATIONS — Staggered entry on load
   ==================================================== */

// Animate hero elements in sequence on page load
function initHeroAnimations() {
  const heroElements = [
    { el: document.querySelector('.hero-meta'), delay: 100 },
    { el: document.querySelector('.eyebrow'), delay: 200 },
    { el: document.querySelector('.hero h1'), delay: 350 },
    { el: document.querySelector('.hero-bottom'), delay: 500 },
    { el: document.querySelector('.hero-trust'), delay: 650 },
    { el: document.querySelector('.hero-portrait'), delay: 200 },
    { el: document.querySelector('.chart-motif'), delay: 450 },
  ];

  heroElements.forEach(({ el, delay }) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms,
                           transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    // Use rAF to ensure styles are applied before transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '';
        el.style.transform = '';
      });
    });
  });
}

// Run hero animations after a tick so CSS transition is registered
setTimeout(initHeroAnimations, 50);
