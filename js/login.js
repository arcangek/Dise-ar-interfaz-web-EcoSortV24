// ============================================================
// EcoSort - login.js: Inicio de sesion con validacion local
// ============================================================
// Este archivo maneja el formulario de inicio de sesion en la
// pagina login.html.
//
// FUNCIONAMIENTO:
//   1. El usuario ingresa su email y contrasena.
//   2. Al enviar el formulario, se busca en localStorage una
//      cuenta registrada con ese email (guardada por registro.js).
//   3. Si la cuenta existe y la contrasena coincide, se crea una
//      sesion activa (activeSession) y se redirige al home.
//   4. Si la cuenta no existe o la contrasena es incorrecta,
//      se muestra una alerta de error.
//
// FLUJO COMPLETO DE AUTENTICACION:
//   js/registro.js  → Guarda la cuenta en localStorage
//   js/login.js     → Valida credenciales y crea sesion activa
//   js/auth-header.js  → Lee la sesion activa y muestra el avatar
//   js/auth-header.js  → "Cerrar sesion" elimina la sesion activa
//
// NOTA: Este es un sistema de autenticacion SIMULADO con fines
// academicos. Los datos se almacenan unicamente en el navegador
// del usuario (localStorage) y no se envian a ningun servidor.
// ============================================================

// Espera a que el DOM este completamente cargado
document.addEventListener('DOMContentLoaded', function() {

  // =========================================================
  // Obtener referencia al formulario de login
  // Busca primero dentro de .auth-form-card, y si no lo encuentra,
  // busca cualquier formulario en la pagina.
  // Si no hay formulario, el script termina (pasa en paginas
  // que no tienen login).
  // =========================================================
  var loginForm = document.querySelector('.auth-form-card form') || document.querySelector('form');
  if (!loginForm) return;

  // =========================================================
  // Boton de mostrar/ocultar contrasena (icono del ojo)
  // Cada campo de contrasena tiene un boton con clase
  // ".eye-toggle-btn" que alterna entre type="password"
  // y type="text" para que el usuario pueda ver lo que escribe.
  // =========================================================
  document.querySelectorAll(".eye-toggle-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var input = this.parentNode.querySelector("input");
      var img = this.querySelector("img.password-toggle-eye");
      if (!input || !img) return;
      if (input.type === "password") {
        input.type = "text";
        img.src = img.src.replace("eye.svg", "eye-off.svg");
      } else {
        input.type = "password";
        img.src = img.src.replace("eye-off.svg", "eye.svg");
      }
    });
  });

  // =========================================================
  // Maneja el envio del formulario de inicio de sesion
  // =========================================================
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que el formulario recargue la pagina

    // Obtener los valores ingresados por el usuario
    var emailInput = document.querySelector('input[type="email"]') || document.querySelector('#email');
    var passwordInput = document.querySelector('input[type="password"]') || document.querySelector('#password');

    // Validar que ambos campos tengan contenido
    if (!emailInput || !emailInput.value.trim() || !passwordInput || !passwordInput.value) {
      alert('Por favor, introduce tus credenciales.');
      return;
    }

    var typedEmail = emailInput.value.trim();
    var typedPassword = passwordInput.value;

    // =========================================================
    // Buscar la cuenta en localStorage
    // La cuenta fue guardada por registro.js usando el email
    // como clave. Por ejemplo:
    //   localStorage.setItem("usuario@ejemplo.com", JSON.stringify({...}))
    // =========================================================
    var storedAccountData = localStorage.getItem(typedEmail);

    if (storedAccountData) {
      try {
        var user = JSON.parse(storedAccountData);

        // Verificar que la contrasena coincida
        if (user.password === typedPassword) {

          // =========================================================
          // INICIO DE SESION EXITOSO
          // Guardar la sesion activa para que auth-header.js
          // pueda mostrar el avatar del usuario en el header.
          // La sesion contiene: email, nombre completo y organizacion.
          // =========================================================
          localStorage.setItem('activeSession', JSON.stringify({
            email: user.email,
            fullName: user.fullName,
            organization: user.organization || ''
          }));

          // Redirigir al usuario a la pagina de inicio
          window.location.href = '../index.html';

        } else {
          // Contrasena incorrecta
          alert('Contrase\xf1a incorrecta.');
        }
      } catch (err) {
        console.error("Error al procesar la sesi\xf3n local:", err);
      }
    } else {
      // No se encontro ninguna cuenta con ese email
      alert('Esta cuenta no est\xe1 registrada.');
    }
  });
});
