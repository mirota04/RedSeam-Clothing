function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'ri-eye-off-line text-xl';
    } else {
        input.type = 'password';
        icon.className = 'ri-eye-line text-xl';
    }
}

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
    ['username','email','password','confirmPassword'].forEach(id => wireFloatingLabel(id));
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');
    if (email) { email.setAttribute('autocomplete','off'); email.setAttribute('autocapitalize','none'); email.setAttribute('autocorrect','off'); email.setAttribute('spellcheck','false'); }
    if (password) { password.setAttribute('autocomplete','new-password'); password.setAttribute('spellcheck','false'); }
    if (confirm) { confirm.setAttribute('autocomplete','new-password'); confirm.setAttribute('spellcheck','false'); }

    // Local storage helpers
    const STORAGE_KEY = 'redseam_register_state_v1';
    const saveState = (next) => {
        try {
            const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...next }));
        } catch (_) {}
    };
    const getState = () => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (_) { return {}; }
    };

    // Avatar upload behavior
    const fileInput = document.getElementById('avatarInput');
    const previewImg = document.getElementById('avatarPreviewImg');
    const uploadBox = document.getElementById('avatarUploadBox');
    const uploadedBox = document.getElementById('avatarUploadedBox');
    const removeBtn = document.getElementById('avatarRemoveBtn');
    const uploadTrigger = document.getElementById('avatarUploadTrigger');
    const uploadTrigger2 = document.getElementById('avatarUploadTrigger2');

    const showUploaded = (url) => {
        if (!uploadedBox || !previewImg || !uploadBox) return;
        previewImg.src = url;
        uploadBox.style.display = 'none';
        uploadedBox.style.display = 'flex';
        saveState({ avatarDataUrl: url });
    };
    const showUploadPrompt = () => {
        if (!uploadedBox || !uploadBox) return;
        uploadedBox.style.display = 'none';
        uploadBox.style.display = 'flex';
        if (fileInput) fileInput.value = '';
        saveState({ avatarDataUrl: null });
    };

    const triggerClick = () => fileInput && fileInput.click();
    if (uploadTrigger) uploadTrigger.addEventListener('click', triggerClick);
    if (uploadTrigger2) uploadTrigger2.addEventListener('click', triggerClick);
    if (removeBtn) {
        removeBtn.addEventListener('click', showUploadPrompt);
    }
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => showUploaded(ev.target.result);
            reader.readAsDataURL(file);
        });
    }
    // Restore from storage
    const state = getState();
    if (state.avatarDataUrl) {
        showUploaded(state.avatarDataUrl);
    } else {
        showUploadPrompt();
    }

    // Persist text field values
    const fieldIds = ['username','email'];
    fieldIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        // restore
        if (state[id]) el.value = state[id];
        const container = el.closest('.form-field');
        if (container && el.value) container.classList.add('filled');
        el.addEventListener('input', () => saveState({ [id]: el.value }));
    });
});

