// Home page functionality

function wireFloatingLabel(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const container = input.closest('.form-field');
    if (!container) return;
    const update = () => {
        if (document.activeElement === input) container.classList.add('focused'); else container.classList.remove('focused');
        if (input.value && input.value.trim().length > 0) container.classList.add('filled'); else container.classList.remove('filled');
    };
    input.addEventListener('focus', update);
    input.addEventListener('blur', update);
    input.addEventListener('input', update);
    update();
}

document.addEventListener('DOMContentLoaded', function() {
    // Wire up floating labels for price inputs
    ['priceFrom', 'priceTo'].forEach(id => wireFloatingLabel(id));
    
    // Filter dropdown functionality
    const filterButton = document.getElementById('filterButton');
    const filterDropdown = document.getElementById('filterDropdown');
    const filterForm = document.getElementById('filterForm');
    
    if (filterButton && filterDropdown) {
        // Toggle dropdown on button click
        filterButton.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('hidden');
            // Close sort dropdown when opening filter
            if (sortDropdown) sortDropdown.classList.add('hidden');
        });
        
        // Prevent dropdown from closing when clicking inside it
        filterDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Handle filter form submission
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get current URL parameters to preserve existing filters/sorts
            const urlParams = new URLSearchParams(window.location.search);
            
            // Get form data
            const priceFrom = document.getElementById('priceFrom').value;
            const priceTo = document.getElementById('priceTo').value;
            
            // Update only price filter parameters, preserve everything else
            if (priceFrom) {
                urlParams.set('filter[price_from]', priceFrom);
            } else {
                urlParams.delete('filter[price_from]');
            }
            
            if (priceTo) {
                urlParams.set('filter[price_to]', priceTo);
            } else {
                urlParams.delete('filter[price_to]');
            }
            
            // Reset to page 1 when filtering
            urlParams.set('page', '1');
            
            // Build new URL
            const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
            
            // Redirect to filtered results
            window.location.href = newUrl;
        });
    }
    
    // Also add click handler to Apply button as backup
    const applyButton = document.querySelector('#filterForm button[type="submit"]');
    if (applyButton) {
        applyButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get current URL parameters to preserve existing filters/sorts
            const urlParams = new URLSearchParams(window.location.search);
            
            // Get form data
            const priceFrom = document.getElementById('priceFrom').value;
            const priceTo = document.getElementById('priceTo').value;
            
            // Update only price filter parameters, preserve everything else
            if (priceFrom) {
                urlParams.set('filter[price_from]', priceFrom);
            } else {
                urlParams.delete('filter[price_from]');
            }
            
            if (priceTo) {
                urlParams.set('filter[price_to]', priceTo);
            } else {
                urlParams.delete('filter[price_to]');
            }
            
            // Reset to page 1 when filtering
            urlParams.set('page', '1');
            
            // Build new URL
            const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
            
            window.location.href = newUrl;
        });
    }
    
    // Sort dropdown functionality
    const sortButton = document.getElementById('sortButton');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortOptions = document.querySelectorAll('.sort-option');
    
    if (sortButton && sortDropdown) {
        // Toggle dropdown on button click
        sortButton.addEventListener('click', (e) => {
            e.stopPropagation();
            sortDropdown.classList.toggle('hidden');
            // Close filter dropdown when opening sort
            if (filterDropdown) filterDropdown.classList.add('hidden');
        });
        
        // Prevent dropdown from closing when clicking inside it
        sortDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Handle sort option clicks
    sortOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sortValue = this.getAttribute('data-sort');
            
            // Get current URL parameters to preserve existing filters
            const urlParams = new URLSearchParams(window.location.search);
            
            // Set sort parameter, preserve existing price filters
            if (sortValue === 'price_desc') {
                // For price high to low, we'll use 'price' and handle the reverse on the server
                urlParams.set('sort', 'price');
                urlParams.set('sort_order', 'desc');
            } else {
                urlParams.set('sort', sortValue);
                urlParams.delete('sort_order');
            }
            
            // Reset to page 1 when sorting
            urlParams.set('page', '1');
            
            // Build new URL
            const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
            
            // Redirect to sorted results
            window.location.href = newUrl;
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (filterButton && filterDropdown && !filterButton.contains(e.target) && !filterDropdown.contains(e.target)) {
            filterDropdown.classList.add('hidden');
        }
        if (sortButton && sortDropdown && !sortButton.contains(e.target) && !sortDropdown.contains(e.target)) {
            sortDropdown.classList.add('hidden');
        }
    });
    
    // Set autocomplete attributes for price inputs
    const priceFrom = document.getElementById('priceFrom');
    const priceTo = document.getElementById('priceTo');
    
    if (priceFrom) {
        priceFrom.setAttribute('autocomplete', 'off');
        priceFrom.setAttribute('inputmode', 'numeric');
    }
    if (priceTo) {
        priceTo.setAttribute('autocomplete', 'off');
        priceTo.setAttribute('inputmode', 'numeric');
    }
});

// Function to remove price filter only
function removePriceFilter() {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Remove only price filter parameters
    urlParams.delete('filter[price_from]');
    urlParams.delete('filter[price_to]');
    urlParams.set('page', '1');
    
    // Build new URL
    const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
    
    // Redirect to results without price filter
    window.location.href = newUrl;
}

// Function to remove sort filter only
function removeSortFilter() {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Remove only sort parameters
    urlParams.delete('sort');
    urlParams.delete('sort_order');
    urlParams.set('page', '1');
    
    // Build new URL
    const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
    
    // Redirect to results without sort filter
    window.location.href = newUrl;
}

// Function to remove all filters and redirect to clean URL
function removeAllFilters() {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Remove all filter parameters
    urlParams.delete('filter[price_from]');
    urlParams.delete('filter[price_to]');
    urlParams.delete('sort');
    urlParams.delete('sort_order');
    urlParams.set('page', '1');
    
    // Build new URL
    const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
    
    // Redirect to clean results
    window.location.href = newUrl;
}
