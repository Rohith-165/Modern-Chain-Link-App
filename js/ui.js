/* ==========================================
   MODERN CHAIN LINK COMPANY - UI UTILITIES
   Toast, Loader, Custom Modals, Form Validation, Offline Detector
========================================== */

const UI = {
    // ==========================================
    // TOAST NOTIFICATION SYSTEM
    // ==========================================
    toastContainer: null,

    initToastContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement("div");
            this.toastContainer.className = "toast-container";
            document.body.appendChild(this.toastContainer);
        }
    },

    showToast(message, type = "info", duration = 3000) {
        this.initToastContainer();

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        let iconClass = "fa-circle-info";
        if (type === "success") iconClass = "fa-circle-check";
        if (type === "error") iconClass = "fa-circle-xmark";
        if (type === "warning") iconClass = "fa-triangle-exclamation";

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        this.toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add("show"), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Shortcuts
    success(msg) { this.showToast(msg, "success"); },
    error(msg) { this.showToast(msg, "error"); },
    warning(msg) { this.showToast(msg, "warning"); },
    info(msg) { this.showToast(msg, "info"); },

    // ==========================================
    // LOADER OVERLAY
    // ==========================================
    showLoader(message = "Loading...") {
        let loader = document.getElementById("globalLoaderOverlay");
        if (!loader) {
            loader = document.createElement("div");
            loader.id = "globalLoaderOverlay";
            loader.className = "loader-overlay";
            loader.innerHTML = `
                <div class="loader-box">
                    <div class="spinner"></div>
                    <p id="loaderMessage">${message}</p>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            document.getElementById("loaderMessage").textContent = message;
            loader.classList.remove("hidden");
        }
    },

    hideLoader() {
        const loader = document.getElementById("globalLoaderOverlay");
        if (loader) {
            loader.classList.add("hidden");
        }
    },

    // ==========================================
    // CUSTOM CONFIRMATION MODAL
    // ==========================================
    confirm(title, message, confirmText = "Confirm", cancelText = "Cancel") {
        return new Promise((resolve) => {
            const modal = document.createElement("div");
            modal.className = "modal-overlay";
            modal.innerHTML = `
                <div class="modal-card">
                    <div class="modal-header">
                        <h3><i class="fa-solid fa-circle-question color-primary"></i> ${title}</h3>
                        <button class="modal-close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary modal-cancel-btn">${cancelText}</button>
                        <button class="btn btn-primary modal-confirm-btn">${confirmText}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const close = (result) => {
                modal.classList.remove("show");
                setTimeout(() => {
                    modal.remove();
                    resolve(result);
                }, 200);
            };

            setTimeout(() => modal.classList.add("show"), 10);

            modal.querySelector(".modal-confirm-btn").onclick = () => close(true);
            modal.querySelector(".modal-cancel-btn").onclick = () => close(false);
            modal.querySelector(".modal-close-btn").onclick = () => close(false);
        });
    },

    // ==========================================
    // FORM VALIDATION HELPERS
    // ==========================================
    validatePhone(phone) {
        const cleaned = (phone || "").replace(/\D/g, "");
        return cleaned.length === 10;
    },

    validateNumber(value, min = 0, allowZero = true) {
        if (value === "" || value === null || value === undefined) return false;
        const num = Number(value);
        if (isNaN(num)) return false;
        return allowZero ? num >= min : num > min;
    },

    showFieldError(inputElement, message) {
        if (!inputElement) return;
        inputElement.classList.add("is-invalid");
        let errorSpan = inputElement.parentElement.querySelector(".form-error");
        if (!errorSpan) {
            errorSpan = document.createElement("span");
            errorSpan.className = "form-error";
            inputElement.parentElement.appendChild(errorSpan);
        }
        errorSpan.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
        errorSpan.style.display = "block";
    },

    clearFieldError(inputElement) {
        if (!inputElement) return;
        inputElement.classList.remove("is-invalid");
        const errorSpan = inputElement.parentElement.querySelector(".form-error");
        if (errorSpan) {
            errorSpan.style.display = "none";
        }
    },

    // ==========================================
    // OFFLINE MONITORING
    // ==========================================
    initOfflineDetector() {
        const updateOnlineStatus = () => {
            let banner = document.getElementById("offlineBanner");
            if (!navigator.onLine) {
                if (!banner) {
                    banner = document.createElement("div");
                    banner.id = "offlineBanner";
                    banner.className = "offline-banner";
                    banner.innerHTML = `<i class="fa-solid fa-wifi"></i> You are currently offline. Local changes will be saved locally.`;
                    document.body.prepend(banner);
                }
                banner.style.display = "flex";
            } else {
                if (banner) {
                    banner.style.display = "none";
                }
            }
        };

        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);
        updateOnlineStatus();
    }
};

// Auto initialize offline detector
document.addEventListener("DOMContentLoaded", () => {
    UI.initOfflineDetector();
});
