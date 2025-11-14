'use strict';

// ===== NAVBAR TOGGLE =====
let navToggle, siteNav, navLinks;

function initNavToggle() {
  navToggle = document.querySelector('.nav-toggle');
  siteNav = document.querySelector('.site-nav');
  navLinks = document.querySelectorAll('.nav-link');

  if (!navToggle || !siteNav) {
    // Retry if elements not found yet (max 10 retries = 1 second)
    if (typeof initNavToggle.retryCount === 'undefined') {
      initNavToggle.retryCount = 0;
    }
    if (initNavToggle.retryCount < 10) {
      initNavToggle.retryCount++;
      setTimeout(initNavToggle, 100);
    }
    return;
  }

  // Only add listener once
  if (!navToggle.dataset.listenerAdded) {
    navToggle.dataset.listenerAdded = 'true';
    navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (siteNav) {
        navToggle.classList.toggle('active');
        siteNav.classList.toggle('active');
        document.body.style.overflow = siteNav.classList.contains('active') ? 'hidden' : '';
      }
    });
  }

  // Close mobile menu when clicking on a link
  if (navLinks && navLinks.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navToggle && siteNav) {
          navToggle.classList.remove('active');
          siteNav.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navToggle && siteNav) {
      if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        siteNav.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
}

// Initialize navigation toggle when DOM is ready
(function() {
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initNavToggle);
    } else {
      // DOM already ready
      initNavToggle();
    }
  }
  init();
})();

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      // Skip if it's an external link
      if (this.hasAttribute('target') || this.getAttribute('href').startsWith('http')) {
        return;
      }
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== HEADER STICKY EFFECT =====
function initHeaderSticky() {
  const siteHeader = document.querySelector('.site-header');
  if (!siteHeader) return;
  
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      siteHeader.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
      siteHeader.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
  });
}

// ===== SCROLL REVEAL ANIMATION =====
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all fade-in elements EXCEPT hero elements (they have their own CSS animations)
  document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-right').forEach(el => {
    // Skip hero section elements - they have their own CSS animations that shouldn't be overridden
    if (!el.closest('.hero')) {
      observer.observe(el);
    }
  });
}

// Initialize these when DOM is ready
(function() {
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initSmoothScrolling();
        initHeaderSticky();
        initScrollReveal();
      });
    } else {
      initSmoothScrolling();
      initHeaderSticky();
      initScrollReveal();
    }
  }
  init();
})();

// ===== ENQUIRE FUNCTIONALITY =====
// Product data - will be loaded from products.js
let products = [];

// Flag to ensure event listener is only added once
let buttonsInitialized = false;

// Initialize product buttons using event delegation (works with dynamically added elements)
function initializeProductButtons() {
  // Get fresh reference to productGrid
  const productGrid = document.getElementById('productGrid');
  
  // Get products from products.js
  if (typeof window.getProducts === 'function') {
    products = window.getProducts();
  }
  
  // Event delegation for enquire buttons - attach to productGrid container (only once)
  if (productGrid && !buttonsInitialized) {
    buttonsInitialized = true;
    console.log('Product buttons initialized');
    
    // Handle all clicks within productGrid
    productGrid.addEventListener('click', (e) => {
      // Check if click is on enquire button
      const enquireButton = e.target.closest('.btn-enquire');
      if (enquireButton) {
        e.preventDefault();
        e.stopPropagation();
        
        const productName = enquireButton.getAttribute('data-product-name');
        const productId = enquireButton.getAttribute('data-product-id');
        
        // Format message
        let message = `Hi! I would like to enquire about: ${productName}`;
        
        // Get product details if available
        if (typeof window.getProducts === 'function') {
          const allProducts = window.getProducts();
          const product = allProducts.find(p => p.id == productId);
          if (product) {
            message = `Hi! I would like to enquire about:\n\n${product.name} - ₹${product.price.toFixed(2)}\n\nPlease let me know about availability and delivery options.`;
          }
        }
        
        // Format Instagram URL
        const instagramUsername = 'saaheli.in';
        const instagramUrl = `https://www.instagram.com/${instagramUsername}/`;
        
        // Copy message to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(message).then(() => {
            showNotification('Message copied! Opening Instagram...');
            setTimeout(() => {
              window.open(instagramUrl, '_blank');
            }, 300);
          }).catch(() => {
            showNotification('Opening Instagram...');
            window.open(instagramUrl, '_blank');
          });
        } else {
          alert('Please copy this message and send it via Instagram DM:\n\n' + message);
          window.open(instagramUrl, '_blank');
        }
        
        // Add animation effect
        enquireButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
          enquireButton.style.transform = 'scale(1)';
        }, 200);
      }
    });
  } else if (!productGrid) {
    console.warn('productGrid not found when trying to initialize buttons');
  }
}

// Initialize button listeners - wait for products to be rendered
function setupButtonListeners() {
  // Make sure productGrid exists before initializing
  const grid = document.getElementById('productGrid');
  if (grid) {
    initializeProductButtons();
  } else {
    // Retry after a short delay if productGrid doesn't exist yet (max 20 retries)
    if (typeof setupButtonListeners.retryCount === 'undefined') {
      setupButtonListeners.retryCount = 0;
    }
    if (setupButtonListeners.retryCount < 20) {
      setupButtonListeners.retryCount++;
      setTimeout(setupButtonListeners, 50);
    }
  }
}

// Wait for products to be loaded and rendered before setting up listeners
function waitForProducts() {
  // Check if products.js has loaded and products are available
  if (typeof window.getProducts === 'function') {
    const loadedProducts = window.getProducts();
    if (loadedProducts && loadedProducts.length > 0) {
      products = loadedProducts;
      setupButtonListeners();
    } else {
      // Products not loaded yet, wait for the event but also set up listener as fallback
      setupButtonListeners(); // Set up listener anyway (event delegation works)
      window.addEventListener('productsRendered', () => {
        if (typeof window.getProducts === 'function') {
          products = window.getProducts();
        }
      }, { once: true });
    }
  } else {
    // products.js not loaded yet, wait a bit and retry
    // But also set up listener as fallback in case products.js never loads
    const maxRetries = 20; // Max 1 second of retries
    let retryCount = 0;
    const retry = () => {
      if (typeof window.getProducts === 'function') {
        const loadedProducts = window.getProducts();
        if (loadedProducts && loadedProducts.length > 0) {
          products = loadedProducts;
          setupButtonListeners();
        } else {
          setupButtonListeners(); // Set up anyway
          window.addEventListener('productsRendered', () => {
            if (typeof window.getProducts === 'function') {
              products = window.getProducts();
            }
          }, { once: true });
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(retry, 50);
      } else {
        // Max retries reached, set up listener anyway
        setupButtonListeners();
      }
    };
    retry();
  }
}

// Initialize when DOM is ready
(function() {
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitForProducts);
    } else {
      // DOM already ready
      waitForProducts();
    }
  }
  init();
})();

// Also update products array when products are loaded
window.addEventListener('productsRendered', () => {
  if (typeof window.getProducts === 'function') {
    products = window.getProducts();
  }
});


// ===== NOTIFICATION SYSTEM =====
function showNotification(message) {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: var(--color-primary);
    color: var(--color-secondary);
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideDown 0.3s ease-out;
    border: 2px solid var(--color-accent);
    font-weight: 600;
    font-size: 1.4rem;
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// ===== BACK TO TOP BUTTON =====
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Initialize when DOM is ready
(function() {
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBackToTop);
    } else {
      initBackToTop();
    }
  }
  init();
})();

// ===== CARD HOVER EFFECTS =====
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'all 0.3s ease';
  });
});

// ===== PARALLAX EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroMedia = document.querySelector('.hero-media');
  
  if (heroMedia && scrolled < window.innerHeight) {
    heroMedia.style.transform = `translateY(${scrolled * 0.3}px)`;
  }
});

// ===== LOADING ANIMATION =====
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => link.classList.remove('active'));
      if (navLink) {
        navLink.classList.add('active');
      }
    }
  });
}

window.addEventListener('scroll', highlightNavLink);

// Add active class styles
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `
  .nav-link.active {
    color: var(--color-accent) !important;
  }
  .nav-link.active::after {
    width: 100% !important;
  }
`;
document.head.appendChild(activeNavStyle);

// ===== PREVENT DEFAULT ON EMPTY LINKS =====
document.querySelectorAll('a[href="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
  });
});

// ===== INSTAGRAM LINK ENHANCEMENT =====
// Instagram links will open in new tab/window
// On mobile devices with Instagram app installed, it will prompt to open in app
// On desktop or without app, it opens the Instagram profile page in browser

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
  // Close mobile menu on Escape
  if (e.key === 'Escape' && siteNav.classList.contains('active')) {
    navToggle.classList.remove('active');
    siteNav.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ===== PERFORMANCE OPTIMIZATION =====
// Throttle scroll events
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply throttling to scroll events
const throttledScroll = throttle(() => {
  highlightNavLink();
}, 100);

window.addEventListener('scroll', throttledScroll);

