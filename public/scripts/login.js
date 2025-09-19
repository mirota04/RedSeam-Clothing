// Login page specific JavaScript
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    if (!passwordInput || !eyeIcon) return;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'ri-eye-off-line text-xl';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'ri-eye-line text-xl';
    }
}

function wireFloatingLabel(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const container = input.closest('.form-field');
    if (!container) return;

    const update = () => {
        if (document.activeElement === input) {
            container.classList.add('focused');
        } else {
            container.classList.remove('focused');
        }
        if (input.value && input.value.trim().length > 0) {
            container.classList.add('filled');
        } else {
            container.classList.remove('filled');
        }
    };

    input.addEventListener('focus', update);
    input.addEventListener('blur', update);
    input.addEventListener('input', update);
    update();
}

document.addEventListener('DOMContentLoaded', function() {
    // Disable autocomplete/autofill dropdowns where possible
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (emailInput) {
        emailInput.setAttribute('autocomplete', 'off');
        emailInput.setAttribute('autocapitalize', 'none');
        emailInput.setAttribute('autocorrect', 'off');
        emailInput.setAttribute('spellcheck', 'false');
    }
    if (passwordInput) {
        passwordInput.setAttribute('autocomplete', 'new-password');
        passwordInput.setAttribute('spellcheck', 'false');
    }

    // Floating label interactions
    wireFloatingLabel('email');
    wireFloatingLabel('password');
});
