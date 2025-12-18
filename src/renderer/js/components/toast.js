import { TOAST_TYPES } from '../utils/constants.js';

/**
 * Toast Notification Component
 */
export class Toast {
  static show(message, type = TOAST_TYPES.INFO, duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = this.getIcon(type);

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">×</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    container.appendChild(toast);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  static remove(toast) {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }

  static getIcon(type) {
    const icons = {
      [TOAST_TYPES.SUCCESS]: '✓',
      [TOAST_TYPES.ERROR]: '✕',
      [TOAST_TYPES.WARNING]: '⚠',
      [TOAST_TYPES.INFO]: 'ℹ'
    };

    return icons[type] || icons[TOAST_TYPES.INFO];
  }

  static success(message, duration) {
    return this.show(message, TOAST_TYPES.SUCCESS, duration);
  }

  static error(message, duration) {
    return this.show(message, TOAST_TYPES.ERROR, duration);
  }

  static warning(message, duration) {
    return this.show(message, TOAST_TYPES.WARNING, duration);
  }

  static info(message, duration) {
    return this.show(message, TOAST_TYPES.INFO, duration);
  }
}
