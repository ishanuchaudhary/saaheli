'use strict';

// ===== NAVBAR TOGGLE =====
let navToggle, siteNav, navLinks;

function initNavToggle() {
  navToggle = document.querySelector('.nav-toggle');
  siteNav = document.querySelector('.site-nav');
  navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navToggle.classList.toggle('active');
      siteNav.classList.toggle('active');
      document.body.style.overflow = siteNav.classList.contains('active') ? 'hidden' : '';
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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavToggle);
} else {
  initNavToggle();
}

// ===== SMOOTH SCROLLING =====
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

// ===== HEADER STICKY EFFECT =====
const siteHeader = document.querySelector('.site-header');
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

// ===== SCROLL REVEAL ANIMATION =====
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

// ===== CART FUNCTIONALITY =====
let cart = [];
let wishlist = [];
const cartBtn = document.querySelector('.cart-btn');
const wishlistBtn = document.querySelector('.wishlist-btn');
const cartCountDisplay = document.querySelector('.cart-count');
const wishlistCountDisplay = document.querySelector('.wishlist-count');
const cartModal = document.getElementById('cartModal');
const wishlistModal = document.getElementById('wishlistModal');
const cartItemsContainer = document.getElementById('cartItems');
const wishlistItemsContainer = document.getElementById('wishlistItems');
const cartTotalDisplay = document.getElementById('cartTotal');

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
  
  // Event delegation for cart buttons - attach to productGrid container (only once)
  if (productGrid && !buttonsInitialized) {
    buttonsInitialized = true;
    console.log('Product buttons initialized');
    
    // Handle all clicks within productGrid
    productGrid.addEventListener('click', (e) => {
      // Check if click is on cart button or its children (icon/text)
      const cartButton = e.target.closest('.btn-cart');
      if (cartButton) {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = parseInt(cartButton.getAttribute('data-product-id'));
        console.log('Cart button clicked, product ID:', productId);
        
        // Always get fresh products from products.js
        if (typeof window.getProducts === 'function') {
          const freshProducts = window.getProducts();
          if (freshProducts && freshProducts.length > 0) {
            products = freshProducts;
          }
        }
        
        // If products still empty, wait a bit and retry
        if (products.length === 0) {
          setTimeout(() => {
            if (typeof window.getProducts === 'function') {
              products = window.getProducts();
              const product = products.find(p => p.id === productId);
              if (product) {
                addToCart(product);
                showNotification('Item added to cart!');
              }
            }
          }, 100);
          return;
        }
        
        const product = products.find(p => p.id === productId);
        
        if (product) {
          console.log('Adding product to cart:', product);
          addToCart(product);
          
          // Add animation effect
          cartButton.style.transform = 'scale(0.9)';
          setTimeout(() => {
            cartButton.style.transform = 'scale(1)';
          }, 200);

          // Show notification
          showNotification('Item added to cart!');
        } else {
          console.error('Product not found for ID:', productId, 'Available products:', products);
        }
        return; // Exit early to avoid processing wishlist
      }
      
      // Check if click is on wishlist button or its children (icon)
      const wishlistButton = e.target.closest('.btn-wishlist');
      if (wishlistButton) {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = parseInt(wishlistButton.getAttribute('data-product-id'));
        console.log('Wishlist button clicked, product ID:', productId);
        
        // Always get fresh products from products.js
        if (typeof window.getProducts === 'function') {
          const freshProducts = window.getProducts();
          if (freshProducts && freshProducts.length > 0) {
            products = freshProducts;
          }
        }
        
        // If products still empty, wait a bit and retry
        if (products.length === 0) {
          setTimeout(() => {
            if (typeof window.getProducts === 'function') {
              products = window.getProducts();
              const product = products.find(p => p.id === productId);
              if (product) {
                const isWishlisted = wishlist.find(item => item.id === product.id);
                if (isWishlisted) {
                  removeFromWishlist(product.id);
                  const icon = wishlistButton.querySelector('ion-icon');
                  if (icon) icon.setAttribute('name', 'heart-outline');
                  wishlistButton.style.color = '';
                  showNotification('Removed from wishlist!');
                } else {
                  addToWishlist(product);
                  const icon = wishlistButton.querySelector('ion-icon');
                  if (icon) icon.setAttribute('name', 'heart');
                  wishlistButton.style.color = '#ff6b6b';
                  showNotification('Added to wishlist!');
                }
              }
            }
          }, 100);
          return;
        }
        
        const product = products.find(p => p.id === productId);
        
        if (product) {
          const isWishlisted = wishlist.find(item => item.id === product.id);
          
          if (isWishlisted) {
            console.log('Removing from wishlist:', product);
            removeFromWishlist(product.id);
            const icon = wishlistButton.querySelector('ion-icon');
            if (icon) {
              icon.setAttribute('name', 'heart-outline');
            }
            wishlistButton.style.color = '';
            showNotification('Removed from wishlist!');
          } else {
            console.log('Adding to wishlist:', product);
            addToWishlist(product);
            const icon = wishlistButton.querySelector('ion-icon');
            if (icon) {
              icon.setAttribute('name', 'heart');
            }
            wishlistButton.style.color = '#ff6b6b';
            showNotification('Added to wishlist!');
          }
          
          // Animation
          wishlistButton.style.transform = 'scale(1.2)';
          setTimeout(() => {
            wishlistButton.style.transform = 'scale(1)';
          }, 200);
        } else {
          console.error('Product not found for ID:', productId, 'Available products:', products);
        }
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
    // Retry after a short delay if productGrid doesn't exist yet
    setTimeout(setupButtonListeners, 50);
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForProducts);
} else {
  waitForProducts();
}

// Also update products array when products are loaded
window.addEventListener('productsRendered', () => {
  if (typeof window.getProducts === 'function') {
    products = window.getProducts();
  }
});

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartDisplay();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartDisplay();
  showNotification('Item removed from cart!');
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    updateCartDisplay();
  }
}

function updateCartDisplay() {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (cartCountDisplay) {
    cartCountDisplay.textContent = cartCount;
    if (cartCount > 0) {
      cartCountDisplay.classList.add('active');
    } else {
      cartCountDisplay.classList.remove('active');
    }
  }
  
  if (cartTotalDisplay) {
    cartTotalDisplay.textContent = `₹${total.toFixed(2)}`;
  }
  
  renderCartItems();
}

function renderCartItems() {
  if (!cartItemsContainer) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-message">Your cart is empty</p>';
    return;
  }
  
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.name}</h3>
        <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})" aria-label="Remove item">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </div>
    </div>
  `).join('');
}

// Make functions globally accessible
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

// Cart button click - open modal
if (cartBtn) {
  cartBtn.addEventListener('click', () => {
    openModal(cartModal);
  });
}

// ===== WISHLIST FUNCTIONALITY =====
// Event listeners are now initialized in initializeProductButtons()

function addToWishlist(product) {
  if (!wishlist.find(item => item.id === product.id)) {
    wishlist.push(product);
    updateWishlistDisplay();
  }
}

function removeFromWishlist(productId) {
  wishlist = wishlist.filter(item => item.id !== productId);
  updateWishlistDisplay();
  
  // Update heart icon on product card
  const wishlistBtn = document.querySelector(`.btn-wishlist[data-product-id="${productId}"]`);
  if (wishlistBtn) {
    const icon = wishlistBtn.querySelector('ion-icon');
    if (icon) {
      icon.setAttribute('name', 'heart-outline');
    }
    wishlistBtn.style.color = '';
  }
}

function updateWishlistDisplay() {
  const wishlistCount = wishlist.length;
  
  if (wishlistCountDisplay) {
    wishlistCountDisplay.textContent = wishlistCount;
    if (wishlistCount > 0) {
      wishlistCountDisplay.classList.add('active');
    } else {
      wishlistCountDisplay.classList.remove('active');
    }
  }
  
  renderWishlistItems();
}

function renderWishlistItems() {
  if (!wishlistItemsContainer) return;
  
  if (wishlist.length === 0) {
    wishlistItemsContainer.innerHTML = '<p class="empty-message">Your wishlist is empty</p>';
    return;
  }
  
  wishlistItemsContainer.innerHTML = wishlist.map(item => `
    <div class="wishlist-item">
      <img src="${item.image}" alt="${item.name}" class="wishlist-item-image">
      <div class="wishlist-item-details">
        <h3 class="wishlist-item-title">${item.name}</h3>
        <p class="wishlist-item-price">₹${item.price.toFixed(2)}</p>
      </div>
      <div class="cart-item-actions">
        <button class="remove-btn" onclick="removeFromWishlist(${item.id})" aria-label="Remove item">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
        <button class="btn-cart" onclick="addToCartFromWishlist(${item.id})" style="padding: 8px 15px; font-size: 1.2rem;">
          <ion-icon name="bag-handle-outline"></ion-icon>
          Add to Cart
        </button>
      </div>
    </div>
  `).join('');
}

function addToCartFromWishlist(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    addToCart(product);
    showNotification('Item added to cart from wishlist!');
  }
}

// Make function globally accessible
window.removeFromWishlist = removeFromWishlist;
window.addToCartFromWishlist = addToCartFromWishlist;

// Wishlist button click - open modal
if (wishlistBtn) {
  wishlistBtn.addEventListener('click', () => {
    openModal(wishlistModal);
  });
}

// ===== MODAL FUNCTIONALITY =====
function openModal(modal) {
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update cart/wishlist display when opening
    if (modal === cartModal) {
      updateCartDisplay();
    } else if (modal === wishlistModal) {
      updateWishlistDisplay();
    }
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(overlay);
    }
  });
});

// Close modal when clicking close button
document.querySelectorAll('.modal-close').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    const modal = closeBtn.closest('.modal-overlay');
    closeModal(modal);
  });
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      closeModal(modal);
    });
  }
});

// Checkout button
const checkoutBtn = document.querySelector('.btn-checkout');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
      // Format cart items into message
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      let message = 'Hi! I would like to enquire about the following products:\n\n';
      
      cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}`;
        if (item.quantity > 1) {
          message += ` (Qty: ${item.quantity})`;
        }
        message += ` - ₹${(item.price * item.quantity).toFixed(2)}\n`;
      });
      
      message += `\nTotal: ₹${total.toFixed(2)}\n\nPlease let me know about availability and delivery options.`;
      
      // Format Instagram URL
      const instagramUsername = 'saaheli.in';
      const instagramUrl = `https://www.instagram.com/${instagramUsername}/`;
      
      // Copy message to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message).then(() => {
          showNotification('Message copied! Opening Instagram...');
          // Open Instagram after copying
          setTimeout(() => {
            window.open(instagramUrl, '_blank');
          }, 300);
        }).catch(() => {
          // Clipboard failed, open Instagram anyway
          showNotification('Opening Instagram...');
          window.open(instagramUrl, '_blank');
        });
      } else {
        // Fallback for older browsers - show message in alert
        alert('Please copy this message and send it via Instagram DM:\n\n' + message);
        window.open(instagramUrl, '_blank');
      }
      
      // Show notification with instructions after a delay
      setTimeout(() => {
        showNotification('Paste the message in Instagram DM!');
      }, 1500);
      
      // Clear cart after a delay
      setTimeout(() => {
        cart = [];
        updateCartDisplay();
        closeModal(cartModal);
      }, 2000);
    }
  });
}

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
const backToTopBtn = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add('active');
  } else {
    backToTopBtn.classList.remove('active');
  }
});

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

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

