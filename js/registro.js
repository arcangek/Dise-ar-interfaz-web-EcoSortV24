// ============================================================
// EcoSort - registro.js: Formulario de registro multi-paso
// ============================================================
// Este archivo implementa el registro de nuevos usuarios con
// un sistema de 2 pasos sin recargar la pagina.
//
// FUNCIONAMIENTO:
//   Paso 1: El usuario ingresa datos personales (nombre, email,
//            organizacion), selecciona sector y plan.
//   Paso 2: El usuario configura su contrasena y acepta terminos.
//   Final:  Se guarda la cuenta en localStorage y se muestra
//           pantalla de exito con enlace a login.
//
// FLUJO COMPLETO DE AUTENTICACION:
//   js/registro.js     → Guarda la cuenta en localStorage
//   js/login.js        → Valida credenciales y crea sesion
//   js/auth-header.js  → Lee sesion activa y muestra avatar
//
// NOTA: Este es un sistema de registro SIMULADO con fines
// academicos. Los datos se almacenan SOLO en el navegador
// del usuario (localStorage) y no se envian a ningun servidor.
// ============================================================

// Espera a que el DOM este completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // Buscar el contenedor del formulario de registro
  // Puede tener diferentes clases segun la estructura HTML.
  // Si no se encuentra, mostramos un error en consola.
  // =========================================================
  const formCard = document.querySelector('.auth-form-card') ||
                   document.querySelector('.auth-box') ||
                   document.querySelector('.auth-form-wrapper') ||
                   document.querySelector('.registration-form-box') ||
                   document.querySelector('.login-form-box');

  if (!formCard) {
    console.error("EcoSort Error: Target form card container not found.");
    return;
  }

  // =========================================================
  // Objeto que acumula los datos del registro a traves de los pasos
  // Se llena en el Paso 1 y se completa en el Paso 2.
  // =========================================================
  let registrationPayload = {
    fullName: '',
    email: '',
    organization: '',
    sector: '',
    plan: '',
    password: ''
  };

  // =========================================================
  // PASO 1: Capturar datos personales del formulario inicial
  // Cuando el usuario envia el primer formulario:
  //   1. Lee los campos: nombre, email, organizacion
  //   2. Lee el sector seleccionado (pills)
  //   3. Lee el plan seleccionado (tarjetas)
  //   4. Valida que nombre y email no esten vacios
  //   5. Guarda todo en registrationPayload
  //   6. Llama a renderStep2Password() para mostrar el paso 2
  // =========================================================
  const step1Form = formCard.querySelector('form');
  if (step1Form) {
    step1Form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.querySelector('#reg-nombre') || formCard.querySelector('input[type="text"]');
      const emailInput = document.querySelector('#reg-email') || formCard.querySelector('input[type="email"]');
      const orgInput = document.querySelector('#reg-org') || formCard.querySelectorAll('input[type="text"]')[1];

      const checkedSector = document.querySelector('input[name="sector"]:checked');
      const activeSector = checkedSector ? checkedSector.closest('label') : null;
      const sectorLabelEl = activeSector ? activeSector.querySelector('.sector-pill-label') : null;

      const selectedPlan = document.querySelector('input[name="plan"]:checked');

      if (!nameInput || !nameInput.value.trim() || !emailInput || !emailInput.value.trim()) {
        alert('Por favor complete los datos obligatorios.');
        return;
      }

      registrationPayload.fullName = nameInput.value.trim();
      registrationPayload.email = emailInput.value.trim();
      registrationPayload.organization = orgInput ? orgInput.value.trim() : '';
      registrationPayload.sector = sectorLabelEl ? sectorLabelEl.textContent.trim() : 'Empresa privada';
      registrationPayload.plan = selectedPlan ? selectedPlan.value : 'Starter';

      renderStep2Password(formCard, registrationPayload);
    });
  }

  // =========================================================
  // renderStep2Password(container, data) — Muestra el Paso 2
  // Reemplaza el contenido del formulario por la pantalla de
  // configuracion de contrasena. Incluye:
  //   - Indicador de progreso (paso 1 completado, paso 2 activo)
  //   - Campos: contrasena, confirmar contrasena
  //   - Checkbox de terminos y condiciones
  //   - Botones: "Atras" (recarga la pagina) y "Crear cuenta"
  //
  // Cuando el usuario envia el paso 2:
  //   1. Valida que la contrasena tenga >= 8 caracteres
  //   2. Valida que ambas contrasenas coincidan
  //   3. Guarda la cuenta en localStorage: clave = email, valor = JSON
  //   4. Llama a renderSuccessStep() para mostrar la pantalla final
  // =========================================================
  function renderStep2Password(container, data) {
    container.style.opacity = '0';

    setTimeout(() => {

      container.innerHTML = `
        <div class="reveal-fade-up visible auth-form-wrapper">
          <div class="step-indicator">
            <span class="step-done"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="#94A3B8"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg> Datos personales</span>
            <span class="step-active"><span class="step-num">2</span> Seguridad</span>
          </div>
          <h2 class="auth-title">Configura tu contraseña</h2>
          <p class="auth-subtitle">Elige una contraseña segura para proteger tu cuenta corporativa.</p>

          <form id="register-step-2-form" class="auth-form">
            <div class="auth-input-group">
              <label class="auth-label" for="password">Contraseña *</label>
              <input type="password" id="password" class="auth-input" placeholder="Mínimo 8 caracteres" required>
            </div>
            <div class="auth-input-group">
              <label class="auth-label" for="confirm-password">Confirmar contraseña *</label>
              <input type="password" id="confirm-password" class="auth-input" placeholder="Repite tu contraseña" required>
            </div>
            <div class="auth-checkbox-group">
              <input type="checkbox" id="terms" required class="auth-checkbox">
              <label for="terms">Acepto los Términos de Servicio y la Política de Privacidad de EcoSort. *</label>
            </div>
            <div class="auth-action-row">
              <button type="button" id="btn-back-step-1" class="btn btn-secondary">Atrás</button>
              <button type="submit" class="btn btn-primary">Crear cuenta →</button>
            </div>
          </form>
        </div>
      `;

      container.style.opacity = '1';

      // Boton "Atras" — recarga la pagina para volver al paso 1
      document.getElementById('btn-back-step-1').addEventListener('click', () => window.location.reload());

      // Manejar el envio del formulario de contrasena
      document.getElementById('register-step-2-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        if (pass.length < 8 || pass !== confirmPass) {
          alert('Las contraseñas no coinciden o tienen menos de 8 caracteres.');
          return;
        }

        data.password = pass;
        // Guardar la cuenta en localStorage usando el email como clave
        localStorage.setItem(data.email, JSON.stringify(data));

        renderSuccessStep(container, data.email);
      });
    }, 250);
  }

  // =========================================================
  // renderSuccessStep(container, email) — Pantalla de exito
  // Muestra un mensaje de confirmacion con:
  //   - Icono de check verde
  //   - "¡Cuenta creada!"
  //   - Email registrado
  //   - Boton "Ir a iniciar sesion" que enlaza a login.html
  // =========================================================
  function renderSuccessStep(container, email) {
    container.style.opacity = '0';

    setTimeout(() => {
      container.innerHTML = `
        <div class="reveal-fade-up visible" style="text-align: center; padding: 2rem 0;">
          <div class="success-check-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512" fill="#19C358">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
            </svg>
          </div>
          <h2 class="success-title">¡Cuenta creada!</h2>
          <p class="success-text">
            Te enviamos un correo de verificación a <br>
            <strong>${email}</strong>.<br>
            Verifica tu cuenta para acceder.
          </p>
          <a href="login.html" class="btn btn-primary btn-success-link">
            Ir a iniciar sesión
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
              <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"/>
            </svg>
          </a>
        </div>
      `;
      container.style.opacity = '1';
    }, 250);
  }
});
