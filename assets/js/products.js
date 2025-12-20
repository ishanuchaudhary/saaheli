'use strict';

// ===== PRODUCTS LOADING AND RENDERING =====
let products = [];
let hampersGrid = null;
let jewelsGrid = null;

// Fetch products from JSON file
async function loadProducts() {
  // Get product grids when function is called (DOM should be ready)
  hampersGrid = document.getElementById('hampersGrid');
  jewelsGrid = document.getElementById('jewelsGrid');
  
  if (!hampersGrid || !jewelsGrid) {
    console.error('Product grids not found');
    return;
  }
  
  try {
    const response = await fetch('/assets/data/products.json');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    const data = await response.json();
    products = data.products || [];
    renderProducts();
    
    // Dispatch custom event to notify script.js that products are loaded
    window.dispatchEvent(new CustomEvent('productsLoaded', { detail: products }));
  } catch (error) {
    console.error('Error loading products:', error);
    // Fallback to empty state or show error message
    if (hampersGrid) {
      hampersGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #5c4f49;">Unable to load products. Please try again later.</p>';
    }
    if (jewelsGrid) {
      jewelsGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #5c4f49;">Unable to load products. Please try again later.</p>';
    }
  }
}

// Render a single product card
function renderProductCard(product, index) {
  // Normalize image path - handle both relative and absolute paths
  let imagePath = product.image;
  if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
    // If path doesn't start with / or http, ensure it's relative
    if (!imagePath.startsWith('./')) {
      imagePath = './' + imagePath;
    }
  }
  
  // Format description - replace newlines with line breaks
  const description = product.description 
    ? product.description.replace(/\n/g, '<br>') 
    : '';
  
  return `
    <article class="card fade-in-up" style="animation-delay: ${(index + 1) * 0.1}s" data-product-id="${product.id}">
      <div class="card-image-wrapper">
        <img src="${imagePath}" alt="${product.name}" class="card-img">
      </div>
      <div class="card-content">
        <h3 class="card-title">${product.name}</h3>
        <p class="price">₹${product.price.toFixed(2)}</p>
        ${description ? `
        <div class="card-expandable">
          <div class="card-description-wrapper">
            <p class="card-description">${description}</p>
            <button
              class="btn-enquire"
              aria-label="Enquire about this product"
              data-product-id="${product.id}"
              data-product-name="${product.name}"
            >
              Enquire?
            </button>
          </div>
        </div>
        ` : ''}
      </div>
    </article>
  `;
}

// Render products to their respective grids based on category
function renderProducts() {
  // Filter products by category
  const hampers = products.filter(p => p.category === 'hampers' || !p.category);
  const jewels = products.filter(p => p.category === 'jewels');
  
  // Render hampers
  if (hampersGrid) {
    if (hampers.length === 0) {
      hampersGrid.innerHTML = '<p class="empty-message">No hampers available at the moment.</p>';
    } else {
      hampersGrid.innerHTML = hampers.map((product, index) => renderProductCard(product, index)).join('');
    }
  }
  
  // Render jewels and accessories
  if (jewelsGrid) {
    if (jewels.length === 0) {
      jewelsGrid.innerHTML = '<p class="empty-message">No jewels and accessories available at the moment.</p>';
    } else {
      jewelsGrid.innerHTML = jewels.map((product, index) => renderProductCard(product, index)).join('');
    }
  }
  
  // Re-initialize animations for newly rendered cards
  initializeCardAnimations();
  
  // Initialize card expand/collapse functionality
  initializeCardExpansion();
  
  // Dispatch event that products have been rendered
  window.dispatchEvent(new CustomEvent('productsRendered'));
  
  // Re-initialize enquiry buttons after products are rendered
  // This ensures buttons work even if they're inside expandable sections
  if (typeof window.setupButtonListeners === 'function') {
    window.setupButtonListeners();
  }
}

// Initialize card animations
function initializeCardAnimations() {
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

  // Observe all newly rendered cards in both grids
  document.querySelectorAll('#hampersGrid .card, #jewelsGrid .card').forEach(card => {
    observer.observe(card);
  });
}

// Initialize card expand/collapse functionality
function initializeCardExpansion() {
  // Get all cards with expandable content
  const cards = document.querySelectorAll('#hampersGrid .card, #jewelsGrid .card');
  
  cards.forEach(card => {
    // Only add listener if card has expandable content
    const expandable = card.querySelector('.card-expandable');
    if (!expandable) return;
    
    // Add click event listener to card
    card.addEventListener('click', (e) => {
      // Check if clicking on the enquiry button
      const enquireButton = e.target.closest('.btn-enquire');
      if (enquireButton) {
        // Expand the card first if it's not expanded
        if (!card.classList.contains('card-expanded')) {
          card.classList.add('card-expanded');
          // Wait a bit for animation, then trigger enquiry
          setTimeout(() => {
            if (typeof window.handleEnquireClick === 'function') {
              window.handleEnquireClick(enquireButton);
            }
          }, 100);
        } else {
          // Card is already expanded, trigger enquiry directly
          if (typeof window.handleEnquireClick === 'function') {
            window.handleEnquireClick(enquireButton);
          }
        }
        e.stopPropagation(); // Prevent card toggle
        return;
      }
      
      // Toggle expanded class for other clicks
      card.classList.toggle('card-expanded');
    });
  });
}

// Export products array for use in script.js (define immediately)
window.getProducts = function() {
  return products;
};

// Load products when DOM is ready
function initProducts() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
  } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    loadProducts();
  } else {
    // Fallback
    setTimeout(loadProducts, 100);
  }
}

initProducts();

