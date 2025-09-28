// Checkout page functionality

// Initialize checkout page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Checkout page loaded');
    
    // Initialize cart functionality first
    await initializeCart();
    
    // Initialize any checkout-specific functionality here
    initializeCheckout();
    
    // Setup modal event listeners
    setupModalEventListeners();
});

// Initialize checkout functionality
function initializeCheckout() {
    // Ensure modal is hidden on page load
    hideSuccessModal();
    
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

// Process checkout (called when Pay button is clicked)
async function processCheckout() {
    console.log('Pay button clicked - processing checkout...');
    
    // Validate form - if validation fails, stop here
    if (!validateCheckoutForm()) {
        console.log('Form validation failed - stopping checkout process');
        return;
    }
    
    console.log('Form validation passed - proceeding with checkout');
    
    // Clear cart on server and locally
    await clearCart();
    
    // Show success modal
    showSuccessModal();
}

// Validate checkout form
function validateCheckoutForm() {
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    let emptyFields = [];
    
    // Check each required input
    inputs.forEach(input => {
        const value = input.value.trim();
        if (!value) {
            input.style.borderColor = '#EF4444';
            isValid = false;
            emptyFields.push(input.placeholder);
        } else {
            input.style.borderColor = '#E1DFE1';
        }
    });
    
    // Show specific error message
    if (!isValid) {
        alert(`Please fill in all required fields: ${emptyFields.join(', ')}`);
        console.log('Validation failed for fields:', emptyFields);
    } else {
        console.log('All form fields are valid');
    }
    
    return isValid;
}

// Clear cart
async function clearCart() {
    try {
        console.log('Starting cart clearing process...');
        
        // Get user token
        const token = await getUserToken();
        if (!token) {
            console.error('No user token found for cart clearing');
            return;
        }
        
        // Send DELETE requests for each item in cart
        if (typeof cartItems !== 'undefined' && cartItems.length > 0) {
            console.log(`Clearing ${cartItems.length} items from cart...`);
            
            // Create array of delete promises
            const deletePromises = cartItems.map(async (item) => {
                try {
                    const response = await fetch(`${window.location.origin}/api/cart/products/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        console.log(`Successfully deleted item ${item.id} from cart`);
                        return true;
                    } else {
                        console.error(`Failed to delete item ${item.id}:`, response.status);
                        return false;
                    }
                } catch (error) {
                    console.error(`Error deleting item ${item.id}:`, error);
                    return false;
                }
            });
            
            // Wait for all delete requests to complete
            const results = await Promise.all(deletePromises);
            const successCount = results.filter(result => result === true).length;
            console.log(`Successfully deleted ${successCount}/${cartItems.length} items from server`);
        }
        
        // Clear local cart
        if (typeof cartItems !== 'undefined') {
            cartItems.length = 0;
            localStorage.removeItem('cartItems');
        }
        
        // Update cart display if cart functions are available
        if (typeof updateCartDisplay === 'function') {
            updateCartDisplay();
        }
        if (typeof updateCartButtonCount === 'function') {
            updateCartButtonCount();
        }
        
        console.log('Cart cleared successfully');
    } catch (error) {
        console.error('Error clearing cart:', error);
        // Still clear local cart even if server requests fail
        if (typeof cartItems !== 'undefined') {
            cartItems.length = 0;
            localStorage.removeItem('cartItems');
        }
    }
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.style.display = 'flex';
}

// Hide success modal
function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.style.display = 'none';
}

// Redirect to landing page
function redirectToHome() {
    window.location.href = '/';
}

// Setup modal event listeners
function setupModalEventListeners() {
    // Close modal button
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            hideSuccessModal();
            redirectToHome();
        });
    }
    
    // Continue shopping button
    const continueShoppingBtn = document.getElementById('continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            hideSuccessModal();
            redirectToHome();
        });
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideSuccessModal();
                redirectToHome();
            }
        });
    }
}
