// ============================================================
// EcoSort - auth-header.js: Sesion activa y dropdown de usuario
// ============================================================
// Este archivo maneja la sesion del usuario en el header.
//
// FUNCIONAMIENTO:
//   1. Al cargar el DOM, busca el contenedor de botones de auth
//      (clase ".actions" en el header).
//   2. Revisa si hay una sesion activa guardada en localStorage
//      bajo la clave "activeSession".
//   3. Si existe sesion: reemplaza los botones "Iniciar sesion" y
//      "Registrarse" por el avatar del usuario con su nombre.
//   4. Si no existe sesion: no hace nada, los botones se quedan igual.
//
// FLUJO COMPLETO DE AUTENTICACION:
//   js/registro.js  → Guarda la cuenta en localStorage
//   js/login.js     → Valida credenciales y crea activeSession
//   js/auth-header.js  → Lee activeSession y muestra el avatar
//   js/auth-header.js  → "Cerrar sesion" elimina activeSession
//
// ARCHIVOS RELACIONADOS:
//   - Todas las paginas HTML usan auth-header.js (cargado con defer)
//   - js/login.js: crea la sesion al iniciar sesion
//   - js/registro.js: guarda los datos de la cuenta
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // Busca el contenedor donde estan los botones de autenticacion
  // En todas las paginas del proyecto, este contenedor tiene
  // la clase ".actions" dentro del <header>.
  // Si no se encuentra, el script termina sin hacer nada.
  // =========================================================
  const authNavContainer = document.querySelector('.nav-auth-buttons') || document.querySelector('.header-right') || document.querySelector('.actions');
  if (!authNavContainer) return;

  // =========================================================
  // Verifica si hay una sesion activa en localStorage
  // La clave "activeSession" fue guardada por login.js cuando
  // el usuario inicio sesion correctamente.
  // =========================================================
  const activeSessionData = localStorage.getItem('activeSession');
  if (activeSessionData) {
    try {
      // Convertir el string JSON a objeto JavaScript
      const session = JSON.parse(activeSessionData);
      const userDisplayName = session.fullName || 'Usuario';

      // =========================================================
      // Reemplazar los botones de auth por el avatar del usuario
      // Se inyecta HTML completo con:
      //   - SVG del icono de persona (verde)
      //   - Nombre del usuario
      //   - Menu dropdown con informacion de la organizacion
      //   - Boton "Cerrar Sesion" con icono rojo
      // =========================================================
      authNavContainer.innerHTML = `
        <div class="user-profile-dropdown">
          <button id="header-avatar-btn" class="btn btn-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512" fill="#19C358">
              <path d="M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"/>
            </svg>
            <span class="nav-username">${userDisplayName}</span>
          </button>
          <div id="avatar-dropdown-menu" class="dropdown-menu-content">
            <div class="dropdown-header-info">
              Organización:<br>
              <strong>${session.organization || 'EcoSort Partner'}</strong>
            </div>
            <button id="btn-logout-trigger" class="dropdown-item-logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="#EF4444">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      `;

      // =========================================================
      // Configurar el comportamiento del dropdown del avatar
      // =========================================================
      const avatarBtn = document.getElementById('header-avatar-btn');
      const dropdownMenu = document.getElementById('avatar-dropdown-menu');
      if (!avatarBtn || !dropdownMenu) return;

      // Al hacer clic en el avatar, muestra u oculta el dropdown
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el clic cierre el dropdown inmediatamente
        const isHidden = dropdownMenu.style.display === 'none' || !dropdownMenu.style.display;
        dropdownMenu.style.display = isHidden ? 'block' : 'none';
      });

      // Cierra el dropdown si el usuario hace clic fuera de el
      document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
      });

      // Cierra el dropdown si el usuario presiona la tecla Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dropdownMenu.style.display = 'none';
      });

      // =========================================================
      // Logica de cierre de sesion
      // 1. Elimina la clave "activeSession" de localStorage
      // 2. Redirige al usuario a la pagina de inicio
      // =========================================================
      document.getElementById('btn-logout-trigger').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('activeSession');
        const basePath = window.location.pathname.includes('/page/') ? '../' : './';
        window.location.href = basePath + 'index.html';
      });

    } catch (err) {
      // Si hay un error al leer los datos de sesion (por ejemplo,
      // si localStorage fue modificado manualmente), lo registramos
      // en consola pero no interrumpimos la navegacion.
      console.error('Error reading session data in Navbar:', err);
    }
  }
});
