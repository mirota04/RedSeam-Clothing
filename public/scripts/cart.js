// Cart Sidebar JavaScript

// Cart state
let cartItems = [];
let isCartOpen = false;

// Initialize cart functionality
document.addEventListener('DOMContentLoaded', async function() {
    await initializeCart();
});

async function initializeCart() {
    // Create cart sidebar HTML if it doesn't exist
    if (!document.getElementById('cartSidebar')) {
        createCartSidebar();
    }
    
    // Add event listeners
    setupCartEventListeners();
    
    // Load cart from API
    await loadCartFromAPI();
    
    // Update cart display
    updateCartDisplay();
    
    // Update cart button count
    updateCartButtonCount();
}

function createCartSidebar() {
    const cartHTML = `
        <!-- Cart Overlay -->
        <div id="cartOverlay" class="cart-overlay"></div>
        
        <!-- Cart Sidebar -->
        <div id="cartSidebar" class="cart-sidebar">
            <!-- Cart Header -->
            <div class="cart-header">
                <h2 class="cart-title">Shopping cart (<span id=\"cartItemCount\">0</span>)</h2>
                <button id="cartCloseBtn" class="cart-close-btn">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            
            <!-- Cart Content -->
            <div class="cart-content">
                <div id="cartItems" class="cart-items">
                    <!-- Cart items will be dynamically inserted here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', cartHTML);
}

function setupCartEventListeners() {
    // Cart button click (from header)
    const cartButtons = document.querySelectorAll('[data-cart-toggle]');
    cartButtons.forEach(button => {
        button.addEventListener('click', toggleCart);
    });
    
    // Close cart button
    const closeBtn = document.getElementById('cartCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCart);
    }
    
    // Overlay click to close
    const overlay = document.getElementById('cartOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeCart);
    }
    
    // No checkout button/events in minimal empty-state version
}

// Toggle cart sidebar
function toggleCart() {
    if (isCartOpen) {
        closeCart();
    } else {
        openCart();
    }
}

// Open cart sidebar
function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        isCartOpen = true;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

// Close cart sidebar
function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        isCartOpen = false;
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Get user token (from sessionStorage or fetch from server)
async function getUserToken() {
    let token = sessionStorage.getItem('userToken');
    
    if (!token) {
        // Try to get token from server
        try {
            const response = await fetch('/api/user/token', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                token = data.token;
                if (token) {
                    sessionStorage.setItem('userToken', token);
                }
            }
        } catch (error) {
            console.error('Error fetching token from server:', error);
        }
    }
    
    return token;
}

// Add item to cart
async function addToCart(product) {
    try {
        if (!product) {
            alert('Error: Product data is missing. Please refresh the page and try again.');
            return;
        }
        
        if (!product.id) {
            alert('Error: Product ID is missing. Please refresh the page and try again.');
            return;
        }
        
        if (!product.quantity) {
            alert('Error: Product quantity is missing. Please refresh the page and try again.');
            return;
        }
        
        // Get user token
        const token = await getUserToken();
        
        if (!token) {
            alert('Please log in to add items to cart');
            return;
        }

        // Prepare request body
        const requestBody = {
            quantity: product.quantity || 1,
            color: product.color || 'Default',
            size: product.size || 'L'
        };
        
        // Make API call to add product to cart
        const response = await fetch(`${window.location.origin}/api/cart/products/${product.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const addedProduct = await response.json();
            
            // Update local cart with API response
            const existingItem = cartItems.find(item => 
                item.id === addedProduct.id && 
                item.color === addedProduct.color && 
                item.size === addedProduct.size
            );
            
            if (existingItem) {
                existingItem.quantity = addedProduct.quantity;
                existingItem.total_price = addedProduct.total_price;
            } else {
                cartItems.push({
                    id: addedProduct.id,
                    name: addedProduct.name,
                    price: addedProduct.price,
                    total_price: addedProduct.total_price,
                    image: addedProduct.cover_image,
                    color: addedProduct.color,
                    size: addedProduct.size,
                    quantity: addedProduct.quantity
                });
            }
            
            saveCartToStorage();
            updateCartDisplay();
            showCartNotification();
        } else {
            const errorText = await response.text();
            alert(`Failed to add product to cart: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        alert(`Error adding product to cart: ${error.message}`);
    }
}

// Remove item from cart
async function removeFromCart(itemId, color, size) {
    try {
        // Get user token
        const token = await getUserToken();
        if (!token) {
            console.error('No user token found');
            return;
        }

        // Make API call to remove product from cart
        const response = await fetch(`${window.location.origin}/api/cart/products/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            // Remove from local cart
            cartItems = cartItems.filter(item => 
                !(item.id === itemId && item.color === color && item.size === size)
            );
            
            saveCartToStorage();
            updateCartDisplay();
        } else {
            console.error('Failed to remove product from cart:', response.status);
        }
    } catch (error) {
        console.error('Error removing product from cart:', error);
    }
}

// Update item quantity - API VERSION
async function updateQuantity(itemId, color, size, newQuantity) {
    try {
        // Get user token
        const token = await getUserToken();
        if (!token) {
            console.error('No user token found');
            return;
        }

        // Prepare request body
        const requestBody = {
            quantity: newQuantity
        };

        // Make API call to update product quantity in cart
        const response = await fetch(`${window.location.origin}/api/cart/products/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const updatedProducts = await response.json();
            console.log('Product quantity updated:', updatedProducts);
            
            // Update local cart with API response
            if (updatedProducts && updatedProducts.length > 0) {
                const updatedProduct = updatedProducts[0];
                const existingItem = cartItems.find(item => 
                    item.id === updatedProduct.id && 
                    item.color === updatedProduct.color && 
                    item.size === updatedProduct.size
                );
                
                if (existingItem) {
                    existingItem.quantity = updatedProduct.quantity;
                    existingItem.total_price = updatedProduct.total_price;
                }
            }
            
            saveCartToStorage();
            updateCartDisplay();
            
            // Ensure images are loaded after re-render
            setTimeout(() => {
                const images = document.querySelectorAll('.cart-item-image img');
                images.forEach(img => {
                    if (!img.src || img.src.includes('undefined')) {
                        img.src = '/images/Front_example.png';
                    }
                });
            }, 100);
        } else {
            console.error('Failed to update product quantity:', response.status);
        }
    } catch (error) {
        console.error('Error updating product quantity:', error);
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartItemCountEl = document.getElementById('cartItemCount');
    
    if (!cartItemsContainer) return;
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class=\"cart-empty\">
                <div class=\"cart-empty-logo\">
                    <img src=\"/images/cartLogo.png\" alt=\"Empty Cart\" style=\"width: 170px; height: 135px;\">
                </div>
                <h3 class=\"cart-empty-title\">Ooops!</h3>
                <p class=\"cart-empty-text\">You've got nothing in your cart just yet...</p>
                <div class=\"cart-empty-cta\">
                    <a href=\"/\" class=\"cart-empty-button\">Start shopping</a>
                </div>
            </div>
        `;
    } else {
        // Calculate totals
        const itemsSubtotal = cartItems.reduce((sum, item) => sum + (item.total_price || (item.price * item.quantity)), 0);
        const delivery = 5; // Fixed delivery cost
        const total = itemsSubtotal + delivery;

        cartItemsContainer.innerHTML = `
            <div class="cart-filled">
                <div class="cart-items-scrollable">
                    ${cartItems.map(item => `
                        <div class="cart-item-card">
                            <div class="cart-item-image">
                                <img src="${item.image || '/images/Front_example.png'}" alt="${item.name}" onerror="this.src='/images/Front_example.png'" onload="this.style.display='block'" style="display: block;">
                            </div>
                            <div class="cart-item-details">
                                <div class="cart-item-header">
                                    <span class="cart-item-name">${item.name}</span>
                                    <span class="cart-item-total-price">$${(item.total_price || (item.price * item.quantity)).toFixed(2)}</span>
                                </div>
                                <div class="cart-item-color">${item.color}</div>
                                <div class="cart-item-size">${item.size}</div>
                                <div class="cart-item-footer">
                                    <div class="quantity-selector">
                                        <button class="quantity-btn" ${item.quantity <= 1 ? 'style="opacity: 0.5; cursor: not-allowed;" onclick=""' : `onclick="updateQuantity(${item.id}, '${item.color}', '${item.size}', ${item.quantity - 1})"`}>-</button>
                                        <span class="quantity-display">${item.quantity}</span>
                                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, '${item.color}', '${item.size}', ${item.quantity + 1})">+</button>
                                    </div>
                                    <button class="cart-item-remove" onclick="removeFromCart(${item.id}, '${item.color}', '${item.size}')">Remove</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="cart-summary">
                    <div class="cart-summary-item">
                        <span class="cart-summary-label">Items subtotal</span>
                        <span class="cart-summary-value">$ ${itemsSubtotal.toFixed(0)}</span>
                    </div>
                    <div class="cart-summary-item">
                        <span class="cart-summary-label">Delivery</span>
                        <span class="cart-summary-value">$ ${delivery}</span>
                    </div>
                    <div class="cart-summary-total">
                        <span class="cart-summary-label">Total</span>
                        <span class="cart-summary-value">$${total.toFixed(0)}</span>
                    </div>
                </div>
                
                <div class="cart-checkout">
                    <button class="cart-checkout-btn" onclick="handleCheckout()">Go to checkout</button>
                </div>
            </div>
        `;
    }
    
    // Update total price
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalPrice) {
        cartTotalPrice.textContent = `$${total.toFixed(2)}`;
    }

    // Update item count in header and button badge
    const count = getCartItemCount();
    if (cartItemCountEl) {
        cartItemCountEl.textContent = String(count);
    }
    updateCartButtonCount();
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// Load cart from API
async function loadCartFromAPI() {
    try {
        // Get user token
        const token = await getUserToken();
        if (!token) {
            console.log('No user token found, using empty cart');
            cartItems = [];
            return;
        }

        // Make API call to get cart
        const response = await fetch(`${window.location.origin}/api/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const cartData = await response.json();
            console.log('Cart loaded from API:', cartData);
            
            // Update local cart with API response
            cartItems = cartData.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                total_price: item.total_price,
                image: item.cover_image,
                color: item.color || 'Default',
                size: item.size || 'L',
                quantity: item.quantity
            }));
            
            saveCartToStorage();
        } else {
            console.error('Failed to load cart from API:', response.status);
            cartItems = [];
        }
    } catch (error) {
        console.error('Error loading cart from API:', error);
        cartItems = [];
    }
}

// Load cart from localStorage (fallback)
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
    } else {
        cartItems = [];
    }
}

// Show cart notification
function showCartNotification() {
    // You can implement a toast notification here
    console.log('Item added to cart!');
}

// Handle checkout
function handleCheckout() {
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Redirect to checkout page
    console.log('Proceeding to checkout...', cartItems);
    window.location.href = '/checkout';
}

// Get cart item count
function getCartItemCount() {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
}

// Update cart button count (if you have a cart counter in header)
function updateCartButtonCount() {
    const cartCounters = document.querySelectorAll('.cart-count');
    const count = getCartItemCount();
    
    cartCounters.forEach(counter => {
        counter.textContent = count;
        counter.style.display = count > 0 ? 'block' : 'none';
    });
}

// Make functions globally available
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
