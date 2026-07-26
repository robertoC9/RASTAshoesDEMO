/**
 * =============================================
 * ZAPATILLAS RASTA - Script Principal (ES6+)
 * =============================================
 * Mejoras:
 *  - Funciones reutilizables (animateElement, wait)
 *  - Animaciones mediante clases CSS en vez de inline styles
 *  - Tarjeta modal de cotización con animaciones suaves
 *  - Efecto tilt 3D en botones al mover el mouse
 *  - Manejo de formulario con validación
 * =============================================
 */

'use strict';

// =============================================
// UTILIDADES
// =============================================

/**
 * Espera una cantidad de milisegundos (Promise-based)
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise<void>}
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Anima un elemento añadiendo una clase CSS y opcionalmente la remueve después
 * @param {HTMLElement} el - Elemento a animar
 * @param {string} className - Clase CSS con la animación
 * @param {number} [duration=1000] - Duración en ms antes de remover la clase (opcional)
 */
const animateElement = (el, className, duration = 1000) => {
    if (!el) return;
    el.classList.add(className);
    if (duration) {
        setTimeout(() => el.classList.remove(className), duration);
    }
};

// =============================================
// TOAST DE NOTIFICACIÓN
// =============================================

/**
 * Muestra un toast de notificación con mensaje personalizado
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast: 'success' | 'error'
 */
const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    // Configurar mensaje
    if (toastMessage) toastMessage.textContent = message;

    // Configurar ícono y color según tipo
    if (toastIcon) {
        toastIcon.textContent = type === 'success' ? '✅' : '❌';
    }
    toast.className = 'toast-notification';
    toast.classList.add(`toast-${type}`);

    // Mostrar con animación
    toast.classList.add('toast-visible');

    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
        hideToast();
    }, 4000);
};

/**
 * Oculta el toast de notificación
 */
const hideToast = () => {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.classList.remove('toast-visible');
};

// =============================================
// DOM READY - Punto de entrada principal
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    // ---- Referencias DOM (cacheadas) ----
    const texto = document.getElementById('texto-rasta');
    const botonDescubrir = document.getElementById('btn-descubrir');
    const btnGroup = document.querySelector('.btn-group');
    const logoFooter = document.querySelector('.logo-footer');
    const btnCotizar = document.getElementById('btn-cotizar');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCard = document.getElementById('modal-card');
    const modalClose = document.getElementById('modal-close');
    const modalForm = document.getElementById('modal-form');

    // ---- Efecto Tilt 3D en botones ----
    const tiltButtons = document.querySelectorAll('.btn-comprar, .btn-cotizar');

    const handleTilt = (e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;  // Máx ±6 grados
        const rotateY = ((x - centerX) / centerX) * 6;

        btn.style.transform = `
            perspective(600px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateY(-3px)
        `;
    };

    const resetTilt = (e) => {
        const btn = e.currentTarget;
        btn.style.transform = '';
    };

    tiltButtons.forEach((btn) => {
        btn.addEventListener('mousemove', handleTilt);
        btn.addEventListener('mouseleave', resetTilt);
    });

    // ---- Tarjeta Modal de Cotización ----
    const openModal = () => {
        if (!modalOverlay || !modalCard) return;
        // Mostrar el overlay y disparar la animación vía CSS
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    };

    const closeModal = () => {
        if (!modalOverlay || !modalCard) return;
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Abrir modal al hacer clic en "Cotización"
    if (btnCotizar) {
        btnCotizar.addEventListener('click', openModal);
    }

    // Cerrar modal con botón X
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Cerrar modal al hacer clic fuera de la tarjeta
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) {
            closeModal();
        }
    });

    // ---- Manejo del formulario de cotización ----
    if (modalForm) {
        modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('form-nombre').value.trim();
            const correo = document.getElementById('form-correo').value.trim();
            const modelo = document.getElementById('form-modelo').value;
            const mensaje = document.getElementById('form-mensaje').value.trim();

            // Validación básica
            if (!nombre || !correo || !modelo) {
                showToast('Por favor completa todos los campos obligatorios.', 'error');
                return;
            }

            if (!correo.includes('@') || !correo.includes('.')) {
                showToast('Por favor ingresa un correo electrónico válido.', 'error');
                return;
            }

            // Feedback visual de envío
            const btnEnviar = modalForm.querySelector('.btn-enviar');
            const originalText = btnEnviar.textContent;
            btnEnviar.textContent = 'Enviando...';
            btnEnviar.disabled = true;

            try {
                // Enviar datos al backend (ruta relativa)
                const response = await fetch('/api/cotizacion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre, correo, modelo, mensaje })
                });

                const result = await response.json();

                if (result.success) {
                    // Mostrar toast de éxito
                    showToast('¡Cotización enviada con éxito! Te contactaremos pronto.', 'success');

                    // Resetear formulario y cerrar modal
                    closeModal();
                    modalForm.reset();
                    btnEnviar.textContent = originalText;
                    btnEnviar.disabled = false;
                    btnEnviar.style.background = '';
                } else {
                    // Error del servidor
                    showToast(result.error || 'No se pudo enviar la cotización.', 'error');
                    btnEnviar.textContent = originalText;
                    btnEnviar.disabled = false;
                }
            } catch (error) {
                // Error de conexión
                showToast('Error de conexión con el servidor. Verifica que el servidor esté corriendo.', 'error');
                btnEnviar.textContent = originalText;
                btnEnviar.disabled = false;
                console.error('Error de conexión:', error);
            }
        });
    }

    // ---- Navegación directa (sin sonido) ----
    if (botonDescubrir) {
        botonDescubrir.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'coleccion.html';
        });
    }
});

