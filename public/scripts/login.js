// Login page specific JavaScript
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'ri-eye-off-line text-xl';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'ri-eye-line text-xl';
    }
}

// Hide placeholder text when user starts typing
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const placeholder = this.parentElement.querySelector('span');
            if (this.value.length > 0) {
                placeholder.style.display = 'none';
            } else {
                placeholder.style.display = 'block';
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const placeholder = this.parentElement.querySelector('span');
            if (this.value.length > 0) {
                placeholder.style.display = 'none';
            } else {
                placeholder.style.display = 'block';
            }
        });
    }
});
