/* ═══════════════════════════════════════════════════════════════
   RED-LASH — Portfolio JavaScript
   Animations, interactions, and scroll-driven effects
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initCursorGlow();
    initBackgroundGlow();
    initScrollReveal();
    initCounterAnimation();
    initSmoothScroll();
    initContactForm();
    initNavActiveHighlight();
});

/* ─── NAVBAR SCROLL EFFECT ──────────────────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

/* ─── MOBILE MENU ───────────────────────────────────────────── */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const links = menu.querySelectorAll('.mobile-link');

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ─── SHARED ENVIRONMENT HELPERS ────────────────────────────── */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// True for mouse/trackpad/stylus. Deliberately NOT `'ontouchstart' in window`,
// which is true on every touch-capable laptop and wrongly disabled the glow there.
function hasFinePointer() {
    return window.matchMedia('(pointer: fine)').matches;
}

// Browsers already pause requestAnimationFrame in a hidden tab, so there is no
// visibility bookkeeping here on purpose: an earlier version gated the loop on
// `document.hidden` and simply never started when the page loaded in a
// background tab.
function runAnimationLoop(step) {
    function frame() {
        step();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

/* ─── CURSOR GLOW EFFECT ────────────────────────────────────── */
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    // A 400px halo chasing the pointer is motion; honour the OS preference.
    if (prefersReducedMotion()) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let glowX = targetX;
    let glowY = targetY;
    let placed = false;

    // `pointermove` covers mouse, stylus AND touch in one code path, which is
    // what makes this work on mobile - the old handler listened for `mousemove`
    // only, so a finger never moved the glow.
    document.addEventListener('pointermove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;

        // On a touch screen there is no cursor to ease towards, so jump the
        // glow to the first touch instead of sliding in from the last position.
        if (!placed && e.pointerType !== 'mouse') {
            glowX = targetX;
            glowY = targetY;
            placed = true;
        }
        glow.style.opacity = '1';
    }, { passive: true });

    // A finger leaving the glass is the touch equivalent of the cursor
    // leaving the window.
    document.addEventListener('pointerup', (e) => {
        if (e.pointerType !== 'mouse') {
            glow.style.opacity = '0';
            placed = false;
        }
    }, { passive: true });

    document.addEventListener('pointercancel', () => {
        glow.style.opacity = '0';
        placed = false;
    }, { passive: true });

    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

    runAnimationLoop(() => {
        glowX += (targetX - glowX) * 0.08;
        glowY += (targetY - glowY) * 0.08;
        // left/top rather than transform: .bg-glow's glowPulse keyframes animate
        // transform, and a running animation overrides inline transform.
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
    });
}

/* ─── SPLINE ROBOT: GLOW + CURSOR TRACKING ──────────────────── */
function initBackgroundGlow() {
    const bgGlow = document.getElementById('bg-glow');
    if (!bgGlow) return;
    const host = document.getElementById('spline-transform') || bgGlow.parentElement;

    // The 3D scene is only loaded for fine pointers (see index.html), so there
    // is nothing here to drive on a phone.
    if (!hasFinePointer() || prefersReducedMotion()) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    // #spline-bg sits at z-index 0 under the whole page and is
    // `pointer-events: none`, so real pointer events never reach the canvas and
    // the robot's look-at behaviour never fires. Forwarding a synthetic event
    // to the canvas is what drives it. Verified against the scene: `Head`
    // rotation responds to these, and does not move without them.
    document.addEventListener('pointermove', (e) => {
        if (!e.isTrusted) return;

        targetX = e.clientX;
        targetY = e.clientY;

        const canvas = document.getElementById('canvas3d');
        if (!canvas) return;

        canvas.dispatchEvent(new PointerEvent('pointermove', {
            clientX: e.clientX,
            clientY: e.clientY,
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }, { passive: true });

    runAnimationLoop(() => {
        // Trails the pointer more slowly than the cursor glow, so it reads as
        // having weight.
        currentX += (targetX - currentX) * 0.035;
        currentY += (targetY - currentY) * 0.035;

        // #bg-glow is a child of .spline-transform, which is 120vw x 120vh
        // anchored at -10vw/-10vh - so its coordinate space is NOT the
        // viewport's. Writing clientX straight into `left` drew the halo one
        // tenth of the viewport up and to the left of the cursor, which read
        // as a second glow trailing the real one. Subtracting the container's
        // own offset puts it back under the pointer.
        const origin = host.getBoundingClientRect();
        bgGlow.style.left = (currentX - origin.left) + 'px';
        bgGlow.style.top = (currentY - origin.top) + 'px';
    });
}

/* ─── SCROLL REVEAL (Intersection Observer) ─────────────────── */
function initScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for grid items
                const siblings = entry.target.parentElement.children;
                const siblingIndex = Array.from(siblings).indexOf(entry.target);

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, siblingIndex * 100);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const targets = document.querySelectorAll(
        '.timeline-item, .skill-category, .blog-card, .project-card, .about-card, .testimonial-card, .contact-method'
    );
    targets.forEach(el => observer.observe(el));
}

/* ─── COUNTER ANIMATION (Hero stats) ────────────────────────── */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    // Anyone who has asked for less motion gets the final number immediately.
    if (prefersReducedMotion()) {
        counters.forEach(el => { el.textContent = String(counterTarget(el)); });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            animateCounter(entry.target, counterTarget(entry.target));
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function counterTarget(el) {
    const n = parseInt(el.getAttribute('data-count'), 10);
    return Number.isFinite(n) ? n : 0;
}

function animateCounter(el, target) {
    const duration = 2000;
    let startTime = null;

    function update(now) {
        if (startTime === null) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOut = 1 - (1 - progress) * (1 - progress);
        el.textContent = String(Math.round(easeOut * target));

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Guarantee the exact target, never a rounding artefact.
            el.textContent = String(target);
        }
    }

    requestAnimationFrame(update);
}

/* ─── SMOOTH SCROLL ─────────────────────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80; // navbar height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* ─── NAV ACTIVE HIGHLIGHT ──────────────────────────────────── */
function initNavActiveHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active',
                        link.getAttribute('href') === `#${id}`
                    );
                });
            }
        });
    }, {
        rootMargin: '-30% 0px -70% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

/* ─── CONTACT FORM ──────────────────────────────────────────── */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('#submit-btn');
        const originalHTML = btn.innerHTML;
        
        const nameInput = form.querySelector('#name').value || '';
        const emailInput = form.querySelector('#email').value || '';
        const subjectInput = form.querySelector('#subject').value || 'Portfolio Contact';
        const messageInput = form.querySelector('#message').value || '';
        
        const subject = encodeURIComponent(subjectInput);
        const bodyText = `From: ${nameInput} (${emailInput})\n\n${messageInput}`;
        const body = encodeURIComponent(bodyText);
        
        window.location.href = `mailto:akhileshjaikumar090301@gmail.com?subject=${subject}&body=${body}`;

        // Feedback
        btn.innerHTML = '<span>Opening Mail Client...</span>';
        btn.style.background = '#22c55e';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            form.reset();
        }, 3000);
    });
}

/* ─── ADD ACTIVE STYLE TO NAV ───────────────────────────────── */
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--text-primary);
    }
    .nav-link.active::after {
        transform: scaleX(1);
        transform-origin: left;
    }
    .nav-link.active::before {
        opacity: 1;
    }
    
    .contact-method,
    .testimonial-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s var(--ease-out);
    }
    .contact-method.visible,
    .testimonial-card.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

