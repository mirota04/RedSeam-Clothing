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
    
    // Sort dropdown functionality
    const sortButton = document.getElementById('sortButton');
    const sortDropdown = document.getElementById('sortDropdown');
    
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
