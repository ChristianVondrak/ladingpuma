/* ============================================================
   PUMA DRAGON EDITION — script.js
   Modal logic, form validation, Meta Pixel events,
   WhatsApp redirect
   ============================================================ */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────
  const WA_NUMBER = '584XXXXXXXXX'; // ← Reemplaza con tu número (código país sin +)
  const SIZES     = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

  // ─── ELEMENTS ──────────────────────────────────────────────
  const btnQuiero    = document.getElementById('btn-quiero');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.getElementById('modal-close');
  const leadForm     = document.getElementById('lead-form');
  const formState    = document.getElementById('form-state');
  const successState = document.getElementById('success-state');
  const sizesGrid    = document.getElementById('sizes-grid');
  const btnSubmit    = document.getElementById('btn-submit');

  // ─── BUILD SIZE BUTTONS ─────────────────────────────────────
  SIZES.forEach(function (size) {
    const btn = document.createElement('button');
    btn.type        = 'button';
    btn.className   = 'size-btn';
    btn.textContent = size;
    btn.dataset.size = size;
    btn.setAttribute('aria-label', 'Talla ' + size);
    btn.addEventListener('click', function () { selectSize(size, btn); });
    sizesGrid.appendChild(btn);
  });

  function selectSize(size, btn) {
    document.querySelectorAll('.size-btn').forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    document.getElementById('talla').value = size;
    clearError('talla');
  }

  // ─── OPEN MODAL ────────────────────────────────────────────
  function openModal() {
    modalOverlay.hidden = false;
    modalOverlay.classList.add('entering');
    document.body.style.overflow = 'hidden';

    // Meta Pixel — InitiateCheckout
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout', {
        content_name: 'PUMA Dragon Edition',
        content_category: 'Sneakers',
        num_items: 1,
      });
    }

    // Focus management
    setTimeout(function () {
      const firstInput = leadForm.querySelector('input:not([type="hidden"])');
      if (firstInput) firstInput.focus();
    }, 400);
  }

  // ─── CLOSE MODAL ───────────────────────────────────────────
  function closeModal() {
    modalOverlay.classList.remove('entering');
    modalOverlay.classList.add('leaving');
    setTimeout(function () {
      modalOverlay.hidden = true;
      modalOverlay.classList.remove('leaving');
      document.body.style.overflow = '';
    }, 260);
  }

  btnQuiero.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);

  // Close on overlay click (outside modal card)
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
  });

  // ─── VALIDATION ────────────────────────────────────────────
  function showError(field, msg) {
    const el = document.getElementById('error-' + field);
    const input = document.getElementById(field) || document.querySelector('[name="' + field + '"]');
    if (el)    el.textContent = msg;
    if (input) input.classList.add('has-error');
  }

  function clearError(field) {
    const el = document.getElementById('error-' + field);
    const input = document.getElementById(field) || document.querySelector('[name="' + field + '"]');
    if (el)    el.textContent = '';
    if (input) input.classList.remove('has-error');
  }

  function validateForm() {
    let valid = true;
    const nombre   = document.getElementById('nombre').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const talla    = document.getElementById('talla').value;
    const delivery = document.querySelector('input[name="delivery"]:checked');

    clearError('nombre');
    clearError('whatsapp');
    clearError('talla');
    clearError('delivery');

    if (!nombre || nombre.length < 2) {
      showError('nombre', 'Por favor ingresa tu nombre.');
      valid = false;
    }

    const waClean = whatsapp.replace(/[\s\-()]/g, '');
    if (!waClean || waClean.length < 10) {
      showError('whatsapp', 'Número de WhatsApp inválido.');
      valid = false;
    }

    if (!talla) {
      showError('talla', 'Selecciona tu talla.');
      valid = false;
    }

    if (!delivery) {
      showError('delivery', 'Elige un método de entrega.');
      valid = false;
    }

    return valid;
  }

  // ─── FORM SUBMIT ───────────────────────────────────────────
  leadForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    const nombre   = document.getElementById('nombre').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const talla    = document.getElementById('talla').value;
    const delivery = document.querySelector('input[name="delivery"]:checked').value;

    // Disable button to prevent double-submit
    btnSubmit.disabled = true;

    // ── Meta Pixel — Lead ──
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: 'PUMA Dragon Edition',
        content_category: 'Sneakers',
        content_ids: ['puma-dragon-' + talla],
        value: 1,
        currency: 'USD',
      });
    }

    // ── Show success ──
    formState.hidden    = true;
    successState.hidden = false;

    // ── Build WhatsApp message ──
    const msg = encodeURIComponent(
      '¡Hola! 🐉 Quiero un par de *PUMA Dragon Edition*\n\n' +
      '👤 Nombre: ' + nombre + '\n' +
      '👟 Talla: ' + talla + '\n' +
      '📍 Entrega: ' + delivery + '\n\n' +
      '_Enviado desde la landing page_'
    );

    // ── Redirect to WhatsApp after 2.6s ──
    setTimeout(function () {
      window.location.href = 'https://wa.me/' + WA_NUMBER + '?text=' + msg;
    }, 2600);
  });

  // ─── CLEAR ERRORS ON INPUT ─────────────────────────────────
  document.getElementById('nombre').addEventListener('input', function () { clearError('nombre'); });
  document.getElementById('whatsapp').addEventListener('input', function () { clearError('whatsapp'); });
  document.querySelectorAll('input[name="delivery"]').forEach(function (radio) {
    radio.addEventListener('change', function () { clearError('delivery'); });
  });

})();
