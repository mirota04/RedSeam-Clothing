// Product Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Product page loaded');
    
    // Initialize with first image as default
    const firstImage = document.querySelector('.gallery-image:first-child img');
    if (firstImage) {
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.src = firstImage.src;
        }
    }
});

// Function to change main image when gallery image is clicked
function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
}

// Function to handle color selection
function selectColor(clickedCircle, colorName, colorIndex) {
    // Remove active class from all color circles
    const allCircles = document.querySelectorAll('.color-circle');
    allCircles.forEach(circle => {
        circle.classList.remove('active');
        // Reset border based on color
        const bgColor = circle.style.backgroundColor;
        if (bgColor === 'rgb(255, 255, 255)' || bgColor === '#ffffff' || bgColor === '#FFFFFF') {
            circle.style.border = '1px solid #D1D5DB'; // Grey border for white
        } else {
            circle.style.border = 'none';
        }
    });
    
    // Add active class to clicked circle
    clickedCircle.classList.add('active');
    clickedCircle.style.border = '1px solid #E1DFE1';
    
    // Update color label
    const colorLabel = document.querySelector('.color-label');
    if (colorLabel) {
        const colorNames = {
            'purple': 'Purple',
            'baby-pink': 'Baby pink',
            'light-yellow': 'Light yellow'
        };
        colorLabel.textContent = `Color: ${colorNames[colorName] || colorName}`;
    }
    
    // Change main image based on color selection
    changeMainImageByColorIndex(colorIndex);
}

// Function to change main image based on color index
function changeMainImageByColorIndex(colorIndex) {
    const mainImage = document.getElementById('mainImage');
    if (!mainImage) return;
    
    // Get all gallery images
    const galleryImages = document.querySelectorAll('.gallery-image img');
    
    if (galleryImages && galleryImages.length > colorIndex) {
        // Use the image at the same index as the selected color
        const targetImage = galleryImages[colorIndex];
        if (targetImage) {
            mainImage.src = targetImage.src;
        }
    }
}

// Function to handle size selection
function selectSize(clickedBox, sizeName) {
    // Remove active class from all size boxes
    const allSizeBoxes = document.querySelectorAll('.size-box');
    allSizeBoxes.forEach(box => {
        box.classList.remove('active');
        box.style.borderColor = '#E1DFE1';
        // Reset hover events for inactive boxes
        box.onmouseover = function() { this.style.borderColor = '#10151F'; };
        box.onmouseout = function() { this.style.borderColor = '#E1DFE1'; };
    });
    
    // Add active class to clicked box
    clickedBox.classList.add('active');
    clickedBox.style.borderColor = '#10151F';
    // Set hover events for active box (border stays dark)
    clickedBox.onmouseover = function() { this.style.borderColor = '#10151F'; };
    clickedBox.onmouseout = function() { this.style.borderColor = '#10151F'; };
    
    // Update size label
    const sizeLabel = document.querySelector('.size-label');
    if (sizeLabel) {
        sizeLabel.textContent = `Size: ${sizeName}`;
    }
}

// Function to handle quantity updates
function updateQuantity(quantity) {
    console.log('Selected quantity:', quantity);
    // You can add additional logic here for quantity changes
    // For example, updating price calculations, stock validation, etc.
}

// Function to handle add to cart
async function handleAddToCart() {
    // Get selected values
    const activeColorCircle = document.querySelector('.color-circle.active');
    const activeSizeBox = document.querySelector('.size-box.active');
    const selectedQuantity = parseInt(document.getElementById('quantitySelect')?.value) || 1;
    
    // Extract color from the active color circle's onclick attribute or data
    let selectedColor = 'Default';
    if (activeColorCircle && activeColorCircle.getAttribute('onclick')) {
        const onclickAttr = activeColorCircle.getAttribute('onclick');
        const colorMatch = onclickAttr.match(/selectColor\([^,]+,\s*'([^']+)'/);
        if (colorMatch) {
            selectedColor = colorMatch[1];
        }
    }
    
    // Extract size from the active size box's onclick attribute or data
    let selectedSize = 'L';
    if (activeSizeBox && activeSizeBox.getAttribute('onclick')) {
        const onclickAttr = activeSizeBox.getAttribute('onclick');
        const sizeMatch = onclickAttr.match(/selectSize\([^,]+,\s*'([^']+)'/);
        if (sizeMatch) {
            selectedSize = sizeMatch[1];
        }
    }
    
    // Get product data from the page
    const productName = document.querySelector('.product-name')?.textContent || 'Product';
    const productPriceText = document.querySelector('.product-price')?.textContent || '$0';
    const productPrice = parseFloat(productPriceText.replace('$', '').trim()) || 0;
    const productImage = document.getElementById('mainImage')?.src || '/images/Front_example.png';
    
    const productData = {
        id: window.productId || 1,
        name: productName,
        price: productPrice,
        image: productImage,
        color: selectedColor,
        size: selectedSize,
        quantity: selectedQuantity
    };
    
    // Validate product data
    if (!productData.id || productData.id === 'null' || productData.id === null) {
        alert('Error: Product ID not found. Please refresh the page and try again.');
        return;
    }
    
    if (!productData.name || productData.name === 'Product') {
        alert('Error: Product name not found. Please refresh the page and try again.');
        return;
    }
    
    // Call the global cart function directly
    try {
        if (typeof window.addToCart === 'function') {
            await window.addToCart(productData);
            alert(`Added ${selectedQuantity} item(s) to cart!`);
        } else {
            // Fallback: direct API call
            await addToCartDirect(productData);
        }
    } catch (error) {
        alert('Error adding to cart: ' + error.message);
    }
}

// Direct API call fallback
async function addToCartDirect(productData) {
    try {
        // Get token
        const token = sessionStorage.getItem('userToken');
        if (!token) {
            throw new Error('No user token found');
        }
        
        // Prepare request body
        const requestBody = {
            quantity: productData.quantity || 1,
            color: productData.color || 'Default',
            size: productData.size || 'L'
        };
        
        // Make API call
        const response = await fetch(`${window.location.origin}/api/cart/products/${productData.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Added ${productData.quantity} item(s) to cart!`);
        } else {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        throw error;
    }
}
