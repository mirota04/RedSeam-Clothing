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
function selectColor(clickedCircle, colorName) {
    // Remove active class from all color circles
    const allCircles = document.querySelectorAll('.color-circle');
    allCircles.forEach(circle => {
        circle.classList.remove('active');
        circle.style.border = 'none';
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
function addToCart() {
    // Get selected values
    const selectedColor = document.querySelector('.color-circle.active')?.getAttribute('data-original-color') || 'baby-pink';
    const selectedSize = document.querySelector('.size-box.active')?.textContent || 'L';
    const selectedQuantity = document.getElementById('quantitySelect')?.value || '1';
    
    console.log('Adding to cart:', {
        color: selectedColor,
        size: selectedSize,
        quantity: selectedQuantity
    });
    
    // You can add additional logic here for cart functionality
    // For example, API calls, cart updates, notifications, etc.
    
    // Show success message (optional)
    alert(`Added ${selectedQuantity} item(s) to cart!`);
}
