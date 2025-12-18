/**
 * Modal Component
 */
export class Modal {
  constructor(title, content, options = {}) {
    this.title = title;
    this.content = content;
    this.options = {
      closable: true,
      onClose: null,
      ...options
    };
    this.element = null;
    this.overlay = null;
  }

  open() {
    this.create();
    this.attach();
    this.setupEvents();
  }

  create() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">${this.title}</h2>
        ${this.options.closable ? '<button class="modal-close" aria-label="Close">×</button>' : ''}
      </div>
      <div class="modal-body">
        ${typeof this.content === 'string' ? this.content : ''}
      </div>
      ${this.options.footer ? `<div class="modal-footer">${this.options.footer}</div>` : ''}
    `;

    if (typeof this.content !== 'string') {
      const body = modal.querySelector('.modal-body');
      body.innerHTML = '';
      body.appendChild(this.content);
    }

    this.overlay.appendChild(modal);
    this.element = modal;
  }

  attach() {
    const root = document.getElementById('modal-root');
    if (root) {
      root.appendChild(this.overlay);
    }
  }

  setupEvents() {
    if (this.options.closable) {
      const closeBtn = this.element.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }

      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });

      document.addEventListener('keydown', this.handleEscape);
    }
  }

  handleEscape = (e) => {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  close() {
    document.removeEventListener('keydown', this.handleEscape);

    if (this.options.onClose) {
      this.options.onClose();
    }

    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.remove();
    }, 200);
  }

  static confirm(title, message, onConfirm) {
    const content = `<p>${message}</p>`;
    const footer = `
      <button class="btn btn-secondary" data-action="cancel">Cancel</button>
      <button class="btn btn-primary" data-action="confirm">Confirm</button>
    `;

    const modal = new Modal(title, content, {
      footer,
      closable: true
    });

    modal.open();

    const confirmBtn = modal.element.querySelector('[data-action="confirm"]');
    const cancelBtn = modal.element.querySelector('[data-action="cancel"]');

    confirmBtn.addEventListener('click', () => {
      if (onConfirm) onConfirm();
      modal.close();
    });

    cancelBtn.addEventListener('click', () => {
      modal.close();
    });

    return modal;
  }
}
