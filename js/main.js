/**
 * Kauai Main JavaScript File
 * Vanilla JS Only - Handles interaction and animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initActiveLinks();
  initScrollHeader();
  initScrollAnimations();
  initFormValidation();
  initSmoothScroll();
});

/**
 * Mobile Navigation Toggle
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (!toggleBtn || !mobileNav) return;

  // Toggle open/close
  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close when a link inside is clicked
  const navLinks = mobileNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', closeNav);
  });

  function openNav() {
    mobileNav.classList.add('open');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeNav() {
    mobileNav.classList.remove('open');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/**
 * Highlight active link based on current URL
 */
function initActiveLinks() {
  const currentPath = window.location.pathname;
  // Get filename from path, default to index.html if pointing to root
  let currentPage = currentPath.split('/').pop() || 'index.html';
  
  const allLinks = document.querySelectorAll('nav a');
  
  allLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (!linkPath) return;
    
    // Exact match or if we are at root and link is for index
    if (linkPath === currentPage || (currentPage === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Add shadow to header when scrolling
 */
function initScrollHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/**
 * Intersection Observer for scroll animations
 */
function initScrollAnimations() {
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  
  if (!elementsToAnimate.length || !window.IntersectionObserver) {
    // Fallback if no IntersectionObserver support
    elementsToAnimate.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  elementsToAnimate.forEach(el => {
    observer.observe(el);
  });
}

/**
 * Form Validation for Inquiry and Contact pages
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    // Stop native submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      const requiredInputs = form.querySelectorAll('[required]');
      
      requiredInputs.forEach(input => {
        validateInput(input);
        if (!input.checkValidity()) {
          isValid = false;
        }
      });
      
      if (isValid) {
        // Change button text to indicate success
        const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
        const originalText = submitBtn.value || submitBtn.textContent;
        
        if (submitBtn.tagName === 'INPUT') {
          submitBtn.value = 'Message Sent!';
          submitBtn.style.backgroundColor = 'var(--c-success)';
        } else {
          submitBtn.textContent = 'Message Sent!';
          submitBtn.style.backgroundColor = 'var(--c-success)';
        }
        
        form.reset();
        
        // Remove success styling classes
        form.querySelectorAll('.has-success').forEach(el => {
          el.classList.remove('has-success');
        });
        
        // Reset button after 3 seconds
        setTimeout(() => {
          if (submitBtn.tagName === 'INPUT') {
            submitBtn.value = originalText;
          } else {
            submitBtn.textContent = originalText;
          }
          submitBtn.style.backgroundColor = '';
        }, 3000);
      }
    });

    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateInput(input);
      });
      input.addEventListener('input', () => {
        // Clear error style immediately upon typing
        const group = input.closest('.form-group');
        if (group && group.classList.contains('has-error')) {
          group.classList.remove('has-error');
        }
      });
    });
  });

  function validateInput(input) {
    // Only validate if it has the required attribute or has value
    if (!input.hasAttribute('required') && input.value.trim() === '') return;

    const group = input.closest('.form-group');
    if (!group) return;

    if (!input.checkValidity() || (input.tagName === 'SELECT' && input.value === '')) {
      group.classList.add('has-error');
      group.classList.remove('has-success');
    } else {
      group.classList.remove('has-error');
      group.classList.add('has-success');
    }
  }
}

/**
 * Smooth scrolling for anchor links (Menu categories)
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      // Ignore if just "#"
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Update active class on menu pills if applicable
        const isMenuPill = this.classList.contains('menu-pill');
        if (isMenuPill) {
          document.querySelectorAll('.menu-pill').forEach(pill => pill.classList.remove('active'));
          this.classList.add('active');
        }

        // Header offset
        const yOffset = -80; // height of header
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
        
        // Update URL hash without scroll jumping
        if(history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          window.location.hash = targetId;
        }
      }
    });
  });
}
