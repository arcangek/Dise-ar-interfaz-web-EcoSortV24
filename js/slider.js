// ============================================================
// EcoSort — slider.js: Carrusel automatico del Hero
// ============================================================
// Este archivo controla el carrusel de diapositivas que se
// muestra en la seccion Hero de la pagina de inicio (index.html).
//
// FUNCIONAMIENTO:
//   1. Al cargar la pagina, busca el contenedor con id "hero-carousel"
//      y las diapositivas con clase ".hero-slide".
//   2. Cada 3 segundos avanza automaticamente a la siguiente diapositiva.
//   3. El usuario tambien puede hacer clic en los dots (puntos)
//      inferiores para navegar manualmente.
//
// ARCHIVOS RELACIONADOS:
//   - index.html: contiene la estructura HTML del carrusel
//   - scss/layout/_hero.scss: estilos del carrusel y animaciones
//   - js/main.js: animaciones de scroll (no interfiere con slider)
// ============================================================

// Espera a que el DOM este completamente cargado antes de ejecutar
document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // Obtener referencias a los elementos del DOM
    // heroCarousel: el contenedor principal del carrusel
    // heroSlides: todas las diapositivas (NodeList)
    // heroDots: todos los indicadores inferiores (NodeList)
    // =========================================================
    const heroCarousel = document.getElementById("hero-carousel");
    const heroSlides = document.querySelectorAll(".hero-slide");
    const heroDots = document.querySelectorAll(".hero-dots .dot");

    // Solo inicializa si el carrusel existe en la pagina actual
    // (las otras paginas no tienen hero-carousel y esto evita errores)
    if (heroCarousel && heroSlides.length > 0) {
        let current = 0; // Indice de la diapositiva actual

        // =========================================================
        // showHeroSlide(index) — Muestra una diapositiva especifica
        // Recibe el indice de la diapositiva a mostrar.
        // 1. Quita la clase "active" de todas las diapositivas y dots
        // 2. Corrige el indice si esta fuera de rango (efecto circular)
        // 3. Agrega la clase "active" a la diapositiva y dot correspondientes
        //
        // La clase "active" activa la transicion CSS definida en _hero.scss
        // que cambia opacity de 0 a 1 y translateX de 60px a 0.
        // =========================================================
        function showHeroSlide(index) {
            // Quitar clase active de todas las diapositivas
            heroSlides.forEach(s => s.classList.remove("active"));
            // Quitar clase active de todos los dots
            heroDots.forEach(d => d.classList.remove("active"));

            // Ajustar indice circular: si se pasa del final, vuelve a 0
            if (index >= heroSlides.length) current = 0;
            // Si es menor que 0, va a la ultima
            else if (index < 0) current = heroSlides.length - 1;
            else current = index;

            // Activar la diapositiva y el dot correspondientes
            heroSlides[current].classList.add("active");
            if (heroDots[current]) heroDots[current].classList.add("active");
        }

        // =========================================================
        // Event listeners para los dots de navegacion
        // Cada dot, al hacer clic, muestra la diapositiva
        // correspondiente a su posicion en el array.
        // =========================================================
        heroDots.forEach((dot, i) => {
            dot.addEventListener("click", () => showHeroSlide(i));
        });

        // =========================================================
        // Intervalo automatico: cada 3 segundos avanza a la siguiente
        // diapositiva. El efecto es circular: despues de la ultima,
        // vuelve a la primera.
        // =========================================================
        setInterval(() => showHeroSlide(current + 1), 3000);

        // Mostrar la primera diapositiva al cargar
        showHeroSlide(0);
    }
});
