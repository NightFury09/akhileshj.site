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
    initSupabaseCV();
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

/* ─── CURSOR GLOW EFFECT ────────────────────────────────────── */
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    // Check for touch device
    if ('ontouchstart' in window) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });

    function animateGlow() {
        // Smooth lerp
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';

        requestAnimationFrame(animateGlow);
    }
    animateGlow();
}



/* ─── SPLINE ROBOT GLOW EFFECT ──────────────────────────────── */
function initBackgroundGlow() {
    const bgGlow = document.getElementById('bg-glow');
    if (!bgGlow) return;
    
    if ('ontouchstart' in window) return; // Desktop only

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    document.addEventListener('pointermove', (e) => {
        if (!e.isTrusted) return;
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const canvas = document.getElementById('canvas3d');
        if (canvas) {
            canvas.dispatchEvent(new PointerEvent('pointermove', {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true,
                cancelable: true,
                view: window
            }));
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!e.isTrusted) return;
        
        const canvas = document.getElementById('canvas3d');
        if (canvas) {
            canvas.dispatchEvent(new MouseEvent('mousemove', {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true,
                cancelable: true,
                view: window
            }));
        }
    });

    function animateBgGlow() {
        // The glow follows mouse slightly slower to feel like it has weight
        currentX += (mouseX - currentX) * 0.035;
        currentY += (mouseY - currentY) * 0.035;
        
        bgGlow.style.left = currentX + 'px';
        bgGlow.style.top = currentY + 'px';
        
        requestAnimationFrame(animateBgGlow);
    }
    animateBgGlow();
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

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-count'));
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target) {
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out quad
        const easeOut = 1 - (1 - progress) * (1 - progress);
        const current = Math.round(easeOut * target);

        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
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

/* ─── SUPABASE INTEGRATION (CV DOWNLOAD) ────────────────────── */
function initSupabaseCV() {
    const cvBtn = document.getElementById('download-cv-btn');
    if (!cvBtn) return;

    // TODO: Replace with your actual Supabase URL and Anon Key
    const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
    const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
    
    cvBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (SUPABASE_URL === 'https://YOUR_PROJECT_ID.supabase.co') {
            alert("Supabase integration is wired up! Please seamlessly inject your genuine Project URL and Anon Key in assets/js/main.js to execute the secure database download interaction.");
            return;
        }

        const span = cvBtn.querySelector('span');
        const originalText = span.innerText;
        span.innerText = 'Querying DBMS...';
        cvBtn.style.opacity = '0.7';

        try {
            // Initialize Supabase Client
            const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            /* SHOWCASING SUPABASE AS A DBMS:
               We query a table named 'assets' to get the URL dynamically 
               rather than hardcoding endpoints. 
            */
            const { data, error } = await _supabase
                .from('assets')
                .select('file_url')
                .eq('name', 'resume_pdf')
                .single();
                
            if (error) throw error;
            if (data && data.file_url) {
                window.open(data.file_url, '_blank');
            } else {
                throw new Error("No URL payload returned from database");
            }
            
        } catch (error) {
            console.error('Error querying Supabase execution:', error);
            alert("Database connection failed. Please ensure the 'assets' table exists and your environmental keys are exact.");
        } finally {
            span.innerText = originalText;
            cvBtn.style.opacity = '1';
        }
    });
}
