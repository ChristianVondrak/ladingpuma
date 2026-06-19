/**
 * PUMA DRAGON EDITION — script.js
 * Modal logic, form validation, Meta Pixel events, WhatsApp redirect.
 * Refactored to follow Clean Code principles using ES6 classes.
 */

class PumaLandingApp {
  constructor() {
    this.config = {
      waNumber: '584242374809',
      sizes: [40, 41, 42, 43, 44, 45]
    };

    this.elements = {
      btnQuiero: document.getElementById('btn-quiero'),
      modalOverlay: document.getElementById('modal-overlay'),
      modalClose: document.getElementById('modal-close'),
      leadForm: document.getElementById('lead-form'),
      formState: document.getElementById('form-state'),
      successState: document.getElementById('success-state'),
      sizesGrid: document.getElementById('sizes-grid'),
      btnSubmit: document.getElementById('btn-submit'),
      tallaInput: document.getElementById('talla'),
      nombreInput: document.getElementById('nombre'),
      confirmacionInput: document.getElementById('confirmacion')
    };

    this.init();
  }

  /**
   * Initializes the application.
   */
  init() {
    this.buildSizeButtons();
    this.bindEvents();
  }

  /**
   * Binds all DOM events to their respective handlers.
   */
  bindEvents() {
    const { btnQuiero, modalClose, modalOverlay, leadForm, nombreInput } = this.elements;

    btnQuiero?.addEventListener('click', () => this.openModal());
    modalClose?.addEventListener('click', () => this.closeModal());

    // Close on overlay click (outside modal card)
    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) this.closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalOverlay.hidden) this.closeModal();
    });

    // Form submission
    leadForm?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Clear errors on input
    nombreInput?.addEventListener('input', () => this.clearError('nombre'));

    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
      radio.addEventListener('change', () => this.clearError('delivery'));
    });

    const { confirmacionInput, btnSubmit } = this.elements;
    confirmacionInput?.addEventListener('change', () => {
      if (confirmacionInput.checked) {
        btnSubmit.disabled = false;
        this.clearError('confirmacion');
      } else {
        btnSubmit.disabled = true;
      }
    });
  }

  /**
   * Dynamically builds the size selection grid.
   */
  buildSizeButtons() {
    if (!this.elements.sizesGrid) return;

    this.config.sizes.forEach(size => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-btn';
      btn.textContent = size;
      btn.dataset.size = size;
      btn.setAttribute('aria-label', `Talla ${size}`);

      btn.addEventListener('click', () => this.selectSize(size, btn));
      this.elements.sizesGrid.appendChild(btn);
    });
  }

  /**
   * Handles size selection logic.
   * @param {number} size - The selected shoe size.
   * @param {HTMLElement} btn - The button element that was clicked.
   */
  selectSize(size, btn) {
    document.querySelectorAll('.size-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });

    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    this.elements.tallaInput.value = size;

    this.clearError('talla');
  }

  /**
   * Opens the lead capture modal and tracks the event.
   */
  openModal() {
    const { modalOverlay, leadForm } = this.elements;

    // 1. Immediate UI update (paint the modal instantly)
    modalOverlay.hidden = false;
    modalOverlay.classList.add('entering');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // 2. Defer heavy tracking tasks so they don't block the paint (improves INP)
    setTimeout(() => {
      const eventId = this.generateEventId('InitiateCheckout');
      const payload = {
        content_name: 'PUMA Dragon Edition',
        content_category: 'Sneakers',
        num_items: 1,
        value: 60,
        currency: 'USD',
      };

      // Track Pixel
      this.trackPixelEvent('InitiateCheckout', payload, { eventID: eventId });

      // Track CAPI (Server-side)
      this.trackServerEvent('InitiateCheckout', eventId, {}, payload);
    }, 0);

    // Focus management for accessibility
    setTimeout(() => {
      const firstInput = leadForm?.querySelector('input:not([type="hidden"])');
      firstInput?.focus();
    }, 400);
  }

  /**
   * Closes the lead capture modal with animation.
   */
  closeModal() {
    const { modalOverlay } = this.elements;

    modalOverlay.classList.remove('entering');
    modalOverlay.classList.add('leaving');

    setTimeout(() => {
      modalOverlay.hidden = true;
      modalOverlay.classList.remove('leaving');
      document.body.style.overflow = ''; // Restore scrolling
    }, 260);
  }

  /**
   * Displays an error message for a specific form field.
   * @param {string} field - The field identifier.
   * @param {string} msg - The error message to display.
   */
  showError(field, msg) {
    const errorEl = document.getElementById(`error-${field}`);
    const inputEl = document.getElementById(field) || document.querySelector(`[name="${field}"]`);

    if (errorEl) errorEl.textContent = msg;
    if (inputEl) inputEl.classList.add('has-error');
  }

  /**
   * Clears any existing error message for a specific form field.
   * @param {string} field - The field identifier.
   */
  clearError(field) {
    const errorEl = document.getElementById(`error-${field}`);
    const inputEl = document.getElementById(field) || document.querySelector(`[name="${field}"]`);

    // Only modify DOM if there is actually an error (improves typing latency / INP)
    if (errorEl && errorEl.textContent !== '') {
      errorEl.textContent = '';
    }
    if (inputEl && inputEl.classList.contains('has-error')) {
      inputEl.classList.remove('has-error');
    }
  }

  /**
   * Validates all form inputs.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  validateForm() {
    let isValid = true;
    const nombre = this.elements.nombreInput.value.trim();
    const talla = this.elements.tallaInput.value;
    const delivery = document.querySelector('input[name="delivery"]:checked');
    const confirmacion = this.elements.confirmacionInput.checked;

    // Reset previous errors
    ['nombre', 'talla', 'delivery', 'confirmacion'].forEach(field => this.clearError(field));

    if (!nombre || nombre.length < 2) {
      this.showError('nombre', 'Por favor ingresa tu nombre.');
      isValid = false;
    }

    if (!talla) {
      this.showError('talla', 'Selecciona tu talla.');
      isValid = false;
    }

    if (!delivery) {
      this.showError('delivery', 'Elige un método de entrega.');
      isValid = false;
    }

    if (!confirmacion) {
      this.showError('confirmacion', 'Debes confirmar tu intención de compra.');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Handles the form submission event.
   * @param {Event} e - The submit event.
   */
  handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) return;

    const { nombreInput, tallaInput, btnSubmit, formState, successState } = this.elements;

    const nombre = nombreInput.value.trim();
    const talla = tallaInput.value;
    const delivery = document.querySelector('input[name="delivery"]:checked').value;

    // Disable button to prevent double-submit
    btnSubmit.disabled = true;

    const eventId = this.generateEventId('Purchase');
    const customData = {
      content_name: 'PUMA Dragon Edition',
      content_category: 'Sneakers',
      content_ids: [`puma-dragon-${talla}`],
      value: 60,
      currency: 'USD',
    };
    const userData = {
      fn: nombre // Will be hashed securely on the server
    };

    // Show success state
    formState.hidden = true;
    successState.hidden = false;

    this.redirectToWhatsApp(nombre, talla, delivery, eventId, userData, customData);
  }

  /**
   * Prepares the message, fires the pixel strictly after validation, and redirects the user to WhatsApp.
   * @param {string} nombre - User's name.
   * @param {string} talla - Selected shoe size.
   * @param {string} delivery - Selected delivery method.
   * @param {string} eventId - Unique event ID.
   * @param {Object} userData - Unhashed user details.
   * @param {Object} customData - Event custom attributes.
   */
  redirectToWhatsApp(nombre, talla, delivery, eventId, userData, customData) {
    const msg = encodeURIComponent(
      `¡Hola! Quiero un par de *PUMA Dragon x Staple*\n\n` +
      `- Nombre: ${nombre}\n` +
      `- Talla: ${talla}\n` +
      `- Entrega: ${delivery}\n\n` +
      `_Este mensaje es de alta prioridad, te contactaremos enseguida._`
    );

    setTimeout(() => {
      // Disparamos el Pixel y CAPI estrictamente aquí, junto a la redirección
      this.trackPixelEvent('Purchase', customData, { eventID: eventId });
      this.trackServerEvent('Purchase', eventId, userData, customData);

      window.location.href = `https://wa.me/${this.config.waNumber}?text=${msg}`;
    }, 2600);
  }

  /**
   * Wrapper for Meta Pixel tracking to prevent undefined errors.
   * @param {string} eventName - The standard or custom event name.
   * @param {Object} payload - The event payload.
   * @param {Object} [options] - Additional tracking options (like eventID).
   */
  trackPixelEvent(eventName, payload, options = {}) {
    if (typeof fbq === 'function') {
      fbq('track', eventName, payload, options);
    }
  }

  /**
   * Generates a unique event ID for deduplication.
   * @param {string} eventName - Name of the event.
   * @returns {string} Unique event ID.
   */
  generateEventId(eventName) {
    const randomStr = Math.random().toString(36).substring(2, 11);
    return `${eventName.toLowerCase()}_${Date.now()}_${randomStr}`;
  }

  /**
   * Sends tracking event to Cloudflare Pages API endpoint.
   * @param {string} eventName - Name of the event.
   * @param {string} eventId - Unique event ID.
   * @param {Object} userData - Unhashed user details.
   * @param {Object} customData - Event custom attributes.
   */
  trackServerEvent(eventName, eventId, userData = {}, customData = {}) {
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        user_data: userData,
        custom_data: customData
      })
    })
    .then(response => {
      if (!response.ok) {
        console.warn(`[CAPI] Error forwarding event: ${response.statusText}`);
      }
    })
    .catch(error => {
      console.warn('[CAPI] Fetch error:', error);
    });
  }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PumaLandingApp();
});
