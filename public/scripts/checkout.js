// Checkout page functionality

// Initialize checkout page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Checkout page loaded');
    
    // Initialize cart functionality first
    await initializeCart();
    
    // Initialize any checkout-specific functionality here
    initializeCheckout();
});

// Initialize checkout functionality
function initializeCheckout() {
    // Load cart items for checkout
    loadCartForCheckout();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup payment processing
    setupPaymentProcessing();
}

// Load cart items for checkout display
function loadCartForCheckout() {
    console.log('Loading cart items for checkout...');
    
    // Get cart items from the global cartItems array
    if (typeof cartItems !== 'undefined' && cartItems.length > 0) {
        renderCheckoutCartItems();
        updateCheckoutSummary();
    } else {
        // Show empty state
        document.getElementById('checkout-cart-items').innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6B7280;">
                <p>No items in cart</p>
            </div>
        `;
    }
}

// Render cart items for checkout (same as cart sidebar but without header)
function renderCheckoutCartItems() {
    const cartItemsContainer = document.getElementById('checkout-cart-items');
    
    if (!cartItems || cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6B7280;">
                <p>No items in cart</p>
            </div>
        `;
        return;
    }
    
    // Calculate totals
    const itemsSubtotal = cartItems.reduce((sum, item) => sum + (item.total_price || (item.price * item.quantity)), 0);
    const delivery = 5;
    const total = itemsSubtotal + delivery;
    
    cartItemsContainer.innerHTML = `
        <div class="cart-filled" style="margin-top: 0;">
            <div class="cart-items-scrollable" style="height: calc(635px - 250px); margin-bottom: 0;">
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
        </div>
    `;
}

// Update checkout summary
function updateCheckoutSummary() {
    if (!cartItems || cartItems.length === 0) {
        document.getElementById('checkout-items-subtotal').textContent = '$ 0';
        document.getElementById('checkout-total').textContent = '$ 5';
        return;
    }
    
    const itemsSubtotal = cartItems.reduce((sum, item) => sum + (item.total_price || (item.price * item.quantity)), 0);
    const delivery = 5;
    const total = itemsSubtotal + delivery;
    
    document.getElementById('checkout-items-subtotal').textContent = `$ ${itemsSubtotal.toFixed(0)}`;
    document.getElementById('checkout-total').textContent = `$ ${total.toFixed(0)}`;
}

// Setup form validation
function setupFormValidation() {
    // This will handle form validation for shipping and payment details
    console.log('Setting up form validation...');
}

// Setup payment processing
function setupPaymentProcessing() {
    // This will handle payment processing
    console.log('Setting up payment processing...');
}

// Process checkout
function processCheckout() {
    // This will handle the final checkout process
    console.log('Processing checkout...');
}
