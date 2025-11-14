'use strict';

// ===== PRODUCTS LOADING AND RENDERING =====
let products = [];
const productGrid = document.getElementById('productGrid');

// Fetch products from JSON file
async function loadProducts() {
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
    if (productGrid) {
      productGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #5c4f49;">Unable to load products. Please try again later.</p>';
    }
  }
}

// Render products to the grid
function renderProducts() {
  if (!productGrid) return;
  
  if (products.length === 0) {
    productGrid.innerHTML = '<p class="empty-message">No products available at the moment.</p>';
    return;
  }
  
  productGrid.innerHTML = products.map((product, index) => {
    // Normalize image path - handle both relative and absolute paths
    let imagePath = product.image;
    if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
      // If path doesn't start with / or http, ensure it's relative
      if (!imagePath.startsWith('./')) {
        imagePath = './' + imagePath;
      }
    }
    
    return `
    <article class="card fade-in-up" style="animation-delay: ${(index + 1) * 0.1}s">
      <div class="card-image-wrapper">
        <img src="${imagePath}" alt="${product.name}" class="card-img">
        <div class="card-overlay">
          <button class="btn-cart" aria-label="Add to cart" data-product-id="${product.id}">
            <ion-icon name="bag-handle-outline"></ion-icon>
            Add to Cart
          </button>
          <button class="btn-wishlist" aria-label="Add to wishlist" data-product-id="${product.id}">
            <ion-icon name="heart-outline"></ion-icon>
          </button>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${product.name}</h3>
        <p class="price">₹${product.price.toFixed(2)}</p>
      </div>
    </article>
  `;
  }).join('');
  
  // Re-initialize animations for newly rendered cards
  initializeCardAnimations();
  
  // Dispatch event that products have been rendered
  window.dispatchEvent(new CustomEvent('productsRendered'));
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

  // Observe all newly rendered cards
  document.querySelectorAll('#productGrid .card').forEach(card => {
    observer.observe(card);
  });
}

// Load products when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}

// Export products array for use in script.js
window.getProducts = function() {
  return products;
};

