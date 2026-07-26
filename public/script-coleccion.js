/**
 * =============================================
 * ZAPATILLAS RASTA - Script Colección (ES6+)
 * =============================================
 * Mejoras:
 *  - Función reutilizable switchModel()
 *  - Transiciones con Promesas (async/await)
 *  - Transición suave con clases CSS y animación cruzada
 *  - Prevención de clics rápidos (debounce manual)
 *  - Cacheo de elementos del DOM
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

// =============================================
// DOM READY - Punto de entrada
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // ---- Cache de elementos del DOM ----
    const botonesColor = document.querySelectorAll('.color-btn');
    const vistaZapatilla = document.getElementById('vista-zapatilla');
    const nombreModelo = document.getElementById('nombre-modelo');
    const btnVolver = document.getElementById('btn-volver');

    // Estado interno para prevenir clics rápidos
    let isAnimating = false;

    // ---- Navegación directa al inicio (sin sonido) ----
    if (btnVolver) {
        btnVolver.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // ---- Función principal para cambiar de modelo ----
    /**
     * Cambia el modelo de zapatilla (color + nombre) con animación cruzada
     * @param {HTMLElement} boton - El botón de color clickeado
     */
    const switchModel = async (boton) => {
        // Prevenir múltiples animaciones simultáneas
        if (isAnimating) return;
        isAnimating = true;

        try {
            // Obtener datos del botón seleccionado
            const rotacionColor = boton.getAttribute('data-color');
            const nuevoNombre = boton.getAttribute('data-name');

            // 1. Aplicar hue-rotate instantáneamente (el CSS transition lo suaviza)
            if (vistaZapatilla) {
                vistaZapatilla.style.filter = `hue-rotate(${rotacionColor}deg)`;
            }

            // 2. Animación de salida del nombre actual (fade out + slide up)
            if (nombreModelo) {
                nombreModelo.style.opacity = '0';
                nombreModelo.style.transform = 'translateY(-10px)';
            }

            // 3. Esperar que termine el fade out
            await wait(400);

            // 4. Cambiar el texto del nombre (mientras está invisible)
            if (nombreModelo && nuevoNombre) {
                nombreModelo.textContent = nuevoNombre;
            }

            // 5. Animación de entrada del nuevo nombre (fade in + slide down)
            if (nombreModelo) {
                nombreModelo.style.opacity = '1';
                nombreModelo.style.transform = 'translateY(0)';
            }
        } catch (error) {
            console.warn('Error en switchModel:', error);
        } finally {
            // Liberar bloqueo después de la animación
            isAnimating = false;
        }
    };

    // ---- Event listeners para los botones de color ----
    botonesColor.forEach((boton) => {
        boton.addEventListener('click', function () {
            // Remover la clase 'activo' de todos los botones
            botonesColor.forEach((b) => b.classList.remove('activo'));

            // Añadir la clase 'activo' al botón seleccionado
            this.classList.add('activo');

            // Ejecutar el cambio de modelo
            switchModel(this);
        });
    });
});

