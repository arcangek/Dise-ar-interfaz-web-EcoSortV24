// ============================================================
// EcoSort — main.js: Funciones globales del sitio
// ============================================================
// Este archivo contiene las funcionalidades principales que se
// ejecutan en todas las paginas del proyecto:
//
//   1. Menu hamburguesa para dispositivos moviles
//   2. Animaciones fade-in al hacer scroll (IntersectionObserver)
//   3. Contadores animados para metricas numericas
//   4. Grafico interactivo del dashboard (SVG con hover y tooltip)
//   5. Header opaco al hacer scroll (efecto "scrolled")
//   6. Smooth scroll para enlaces internos con anclas
//
// ARCHIVOS RELACIONADOS:
//   - Todas las paginas HTML cargan main.js al final del <body>
//   - scss/base/_animations.scss: animaciones CSS
//   - scss/pages/_home.scss: estilos del dashboard y metricas
// ============================================================

// =========================================================
// DOMContentLoaded: se ejecuta cuando el DOM esta listo
// (no espera a que carguen imagenes ni otros recursos).
// =========================================================
document.addEventListener("DOMContentLoaded", function() {

    // =========================================================
    // MENU HAMBURGUESA PARA MOVILES
    // Boton con clase ".menu-toggle" que muestra/oculta la
    // barra de navegacion en dispositivos moviles.
    // La clase "show-menu" activa la visualizacion del menu
    // definida en scss/layout/_header.scss.
    // =========================================================
    var menuBtn = document.querySelector(".menu-toggle");
    var nav = document.querySelector("header nav");
    if (menuBtn && nav) {
        menuBtn.addEventListener("click", function() {
            nav.classList.toggle("show-menu");
        });
    }

    // =========================================================
    // INTERSECTION OBSERVER — Animaciones al hacer scroll
    // Detecta cuando un elemento entra en la ventana visible
    // y le agrega la clase "visible" para activar su transicion
    // CSS fade-in (definida en _animations.scss).
    //
    // Cada elemento recibe un delay escalonado segun su posicion
    // entre hermanos del mismo tipo. Esto crea un efecto cascada
    // donde los elementos aparecen uno tras otro.
    //
    // Los selectores en revealSelectors determinan que elementos
    // participan en la animacion.
    // =========================================================
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var delay = el.dataset.delay || 0;
                setTimeout(function() { el.classList.add("visible"); }, parseInt(delay));
            }
        });
    }, { threshold: 0.15 });

    // Lista completa de elementos que tendran animacion al aparecer
    var revealSelectors = [
        ".card", ".stat", ".step", ".benefit-card", ".metric-card", ".team-card",
        ".extra-card", ".process article", ".service-card",
        ".testimonial-card", ".contacto-info-item", ".contacto-social-item",
        ".fade-in-up",
        ".module-block", ".pricing-card",
        ".sim-form-card", ".sim-info-card", ".sim-stats-card", ".sim-step",
        ".history-pill", ".purpose-card", ".goal-metric",
        ".contacto-form-card", ".contacto-side-card", ".contacto-map-card",
        ".auth-panel-content"
    ];
    var revealJoined = revealSelectors.join(",");

    document.querySelectorAll(revealJoined).forEach(function(item) {
        var parent = item.parentElement;
        if (parent && !item.dataset.delay) {
            var siblings = Array.from(parent.children).filter(function(c) {
                return c.matches(revealJoined);
            });
            var idx = siblings.indexOf(item);
            if (idx >= 0 && siblings.length > 1) {
                item.dataset.delay = String(idx * 100);
            }
        }
        observer.observe(item);
    });

    // =========================================================
    // CONTADORES NUMERICOS ANIMADOS
    // Los elementos con clase ".count-metric" muestran un numero
    // que se incrementa desde 0 hasta su valor objetivo cuando
    // entran en pantalla.
    //
    // ATRIBUTOS HTML:
    //   data-target  — Valor final del contador (ej: 2840)
    //   data-suffix  — Texto despues del numero (ej: "+", "%")
    //   data-decimals — Cantidad de decimales (ej: 0, 1)
    //
    // La animacion usa requestAnimationFrame con easing cubico
    // (easeOutCubic) para un incremento suave que acelera al
    // inicio y desacelera al final.
    // =========================================================
    function animateCounter(el, target, suffix, decimals, dur) {
        var start = performance.now();
        dur = dur || 1200;
        function tick(now) {
            var t = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            var current = target * eased;
            var formatted = decimals === 0
                ? Math.round(current).toLocaleString()
                : current.toFixed(decimals);
            el.textContent = formatted + suffix;
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // Observador que activa cada contador solo una vez
    var countObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            countObserver.unobserve(entry.target);
            var el = entry.target;
            var target = parseFloat(el.dataset.target);
            var suffix = el.dataset.suffix || "";
            var decimals = parseInt(el.dataset.decimals) || 0;
            if (!isNaN(target)) animateCounter(el, target, suffix, decimals);
        });
    }, { threshold: 0.3 });

    document.querySelectorAll(".count-metric").forEach(function(el) {
        countObserver.observe(el);
    });

    // =========================================================
    // GRAFICO INTERACTIVO DEL DASHBOARD (pagina de inicio)
    // Este bloque maneja el grafico SVG que muestra la
    // comparativa "Residuos Clasificados vs. Reciclados"
    // en la seccion de metricas de index.html.
    //
    // Componentes del grafico:
    //   - 2 lineas SVG (gris = procesados, verde = reciclados)
    //   - Areas rellenas con gradiente debajo de cada linea
    //   - Puntos (dots) en cada mes con datos
    //   - Tooltip que aparece al hacer hover
    //   - Linea guia vertical que sigue al mouse
    //
    // La animacion del trazado se activa al hacer scroll hasta
    // la seccion del grafico (IntersectionObserver).
    // =========================================================

    // Obtener referencias a los elementos SVG del grafico
    var chartArea = document.querySelector(".dashboard-card .chart-area");
    const chartLineGray = chartArea ? chartArea.querySelector(".chart-line--procesados") : null;
    const chartLineGreen = chartArea ? chartArea.querySelector(".chart-line--reciclados") : null;
    const chartFills = chartArea ? chartArea.querySelectorAll(".chart-area-fill") : null;
    const chartDotsGray = chartArea ? chartArea.querySelectorAll(".chart-dot--procesados") : null;
    const chartDotsGreen = chartArea ? chartArea.querySelectorAll(".chart-dot--reciclados") : null;
    const chartGuide = chartArea ? chartArea.querySelector(".chart-guide") : null;
    const chartTooltip = chartArea ? chartArea.querySelector(".chart-tooltip") : null;
    const tipMonth = document.getElementById("tooltipMonth");
    const tipResiduos = document.getElementById("tooltipResiduos");
    const tipReciclados = document.getElementById("tooltipReciclados");
    const chartSvg = chartArea ? chartArea.querySelector("svg") : null;

    // Ajustar grosor de las lineas del grafico
    if (chartLineGray) chartLineGray.setAttribute("stroke-width", "4");
    if (chartLineGreen) chartLineGreen.setAttribute("stroke-width", "4");

    // Limpiar estilos inline del ultimo dot (para que herede CSS)
    if (chartDotsGray && chartDotsGray.length) {
        const last = chartDotsGray[chartDotsGray.length - 1];
        last.setAttribute("r", "0");
        last.removeAttribute("style");
        last.removeAttribute("fill");
    }
    if (chartDotsGreen && chartDotsGreen.length) {
        const last = chartDotsGreen[chartDotsGreen.length - 1];
        last.setAttribute("r", "0");
        last.removeAttribute("style");
        last.removeAttribute("fill");
    }

    // Dimensiones del viewBox SVG
    const CHART_W = 700, CHART_H = 200;

    // Datos mensuales: coordenada X en el SVG, mes, toneladas procesadas y recicladas
    const dataPoints = [
        { x: 0, month: "Ene", residuos: 490, reciclados: 360 },
        { x: 116, month: "Feb", residuos: 640, reciclados: 490 },
        { x: 233, month: "Mar", residuos: 810, reciclados: 650 },
        { x: 350, month: "Abr", residuos: 760, reciclados: 590 },
        { x: 466, month: "May", residuos: 970, reciclados: 800 },
        { x: 583, month: "Jun", residuos: 1210, reciclados: 980 },
        { x: 700, month: "Jul", residuos: 1444, reciclados: 1176 },
    ];

    // Coordenadas Y de la linea verde (reciclados)
    const greenPointsY = [152, 134, 112, 120, 93, 66, 38];

    // =========================================================
    // lerpVal(x) — Interpolacion lineal de valores
    // Dada una posicion X en el SVG, calcula el mes, la cantidad
    // de residuos y reciclados en ese punto, interpolando entre
    // los puntos de datos conocidos.
    // =========================================================
    function lerpVal(x) {
        for (let i = 0; i < dataPoints.length - 1; i++) {
            const a = dataPoints[i], b = dataPoints[i + 1];
            if (x >= a.x && x <= b.x) {
                const t = (x - a.x) / (b.x - a.x);
                return {
                    month: t < 0.5 ? a.month : b.month,
                    residuos: Math.round(a.residuos + (b.residuos - a.residuos) * t),
                    reciclados: Math.round(a.reciclados + (b.reciclados - a.reciclados) * t),
                };
            }
        }
        const last = dataPoints[dataPoints.length - 1];
        return x >= last.x ? last : dataPoints[0];
    }

    // =========================================================
    // lerpY(x, yPoints) — Interpolacion de coordenada Y
    // Similar a lerpVal pero para las coordenadas Y del SVG,
    // permitiendo que la linea guia y los dots se muevan
    // suavemente entre los puntos del grafico.
    // =========================================================
    function lerpY(x, yPoints) {
        for (let i = 0; i < dataPoints.length - 1; i++) {
            const a = dataPoints[i], b = dataPoints[i + 1];
            if (x >= a.x && x <= b.x) {
                const t = (x - a.x) / (b.x - a.x);
                return yPoints[i] + (yPoints[i + 1] - yPoints[i]) * t;
            }
        }
        return yPoints[yPoints.length - 1];
    }

    // =========================================================
    // animatePath(path) — Animacion de trazado SVG
    // Usa la propiedad stroke-dasharray/stroke-dashoffset para
    // "dibujar" la linea progresivamente.
    // La clase CSS ".drawn" (definida en _home.scss) cambia
    // stroke-dashoffset a 0, activando la transicion.
    // =========================================================
    function animatePath(path) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        requestAnimationFrame(() => path.classList.add("drawn"));
    }

    // =========================================================
    // Observador que activa la animacion del grafico al hacer scroll
    // Cuando la tarjeta del dashboard entra en pantalla:
    //   1. Dibuja la linea gris (procesados)
    //   2. Anima la linea verde (reciclados)
    //   3. Revela las areas de relleno
    // =========================================================
    if (chartLineGray) {
        const len = chartLineGray.getTotalLength();
        chartLineGray.style.strokeDasharray = len;
        chartLineGray.style.strokeDashoffset = len;

        const drawObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        chartLineGray.classList.add("drawn");
                        if (chartLineGreen) animatePath(chartLineGreen);
                        if (chartFills) chartFills.forEach(f => f.classList.add("revealed"));
                        drawObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (chartArea) drawObserver.observe(chartArea);
    }

    // =========================================================
    // findNearestPointOnPath(mouseX) — Encuentra el punto mas
    // cercano en la linea del grafico a la posicion X del mouse.
    // Recorre la longitud total del path en incrementos de 1px
    // y devuelve el punto con menor distancia horizontal.
    // =========================================================
    function findNearestPointOnPath(mouseX) {
        const path = chartLineGray;
        if (!path) return null;
        const totalLen = path.getTotalLength();
        let best = null, bestDist = Infinity;
        for (let l = 0; l <= totalLen; l += 1) {
            const pt = path.getPointAtLength(l);
            const d = Math.abs(pt.x - mouseX);
            if (d < bestDist) { bestDist = d; best = pt; }
        }
        return best;
    }

    // =========================================================
    // updateChartHover(e) — Maneja el hover del mouse sobre el grafico
    // Cuando el mouse se mueve sobre el area del grafico:
    //   1. Convierte la posicion del mouse a coordenadas del SVG
    //   2. Encuentra el punto mas cercano en la linea
    //   3. Mueve la linea guia vertical a esa posicion
    //   4. Posiciona los dots activos en las lineas
    //   5. Muestra el tooltip con los datos del mes
    // =========================================================
    function updateChartHover(e) {
        if (!chartSvg || !chartGuide || !chartTooltip || !chartLineGray || !chartDotsGray || !chartDotsGreen) return;

        const rect = chartSvg.getBoundingClientRect();
        const sx = rect.width / CHART_W;
        const sy = rect.height / CHART_H;
        const mouseVBX = (e.clientX - rect.left) / sx;
        const mouseVBY = (e.clientY - rect.top) / sy;

        // Si el mouse esta fuera del area del grafico, ocultar tooltip
        if (mouseVBX < 0 || mouseVBX > CHART_W || mouseVBY < 0 || mouseVBY > CHART_H) {
            hideChartHover();
            return;
        }

        const pt = findNearestPointOnPath(mouseVBX);
        if (!pt) return;

        const cx = pt.x, grayY = pt.y;
        const greenY = lerpY(cx, greenPointsY);
        const data = lerpVal(cx);
        if (!data) return;

        // Posicionar linea guia vertical
        chartGuide.setAttribute("x1", cx);
        chartGuide.setAttribute("x2", cx);
        chartGuide.setAttribute("stroke", "#334155");
        chartGuide.setAttribute("stroke-width", "1.5");
        chartGuide.setAttribute("stroke-dasharray", "");
        chartGuide.classList.add("visible");

        // Resetear dots activos
        chartDotsGray.forEach(d => { d.classList.remove("active"); d.removeAttribute("filter"); });
        chartDotsGreen.forEach(d => { d.classList.remove("active"); d.removeAttribute("filter"); });

        // Activar dot en la linea gris (procesados)
        const activeGray = chartDotsGray[0];
        if (activeGray) {
            activeGray.setAttribute("cx", cx);
            activeGray.setAttribute("cy", grayY);
            activeGray.setAttribute("r", "4");
            activeGray.setAttribute("fill", "#FFFFFF");
            activeGray.setAttribute("stroke", "#94A3B8");
            activeGray.setAttribute("stroke-width", "2");
            activeGray.classList.add("active");
        }

        // Activar dot en la linea verde (reciclados)
        const activeGreen = chartDotsGreen[0];
        if (activeGreen) {
            activeGreen.setAttribute("cx", cx);
            activeGreen.setAttribute("cy", greenY);
            activeGreen.setAttribute("r", "4");
            activeGreen.setAttribute("fill", "#FFFFFF");
            activeGreen.setAttribute("stroke", "#19C358");
            activeGreen.setAttribute("stroke-width", "2");
            activeGreen.classList.add("active");
        }

        // Posicionar y mostrar tooltip
        const pageX = rect.left + cx * sx;
        const pageY = rect.top + greenY * sy;
        chartTooltip.style.left = Math.min(Math.max(pageX + 15, 10), window.innerWidth - 180) + "px";
        chartTooltip.style.top = Math.max(pageY - 50, 10) + "px";
        chartTooltip.style.transform = "none";
        tipMonth.textContent = data.month;
        tipResiduos.textContent = data.residuos.toLocaleString() + " t";
        tipReciclados.textContent = data.reciclados.toLocaleString() + " t";
        chartTooltip.classList.add("visible");
    }

    // =========================================================
    // hideChartHover() — Oculta el tooltip y la linea guia
    // Se llama cuando el mouse sale del area del grafico.
    // =========================================================
    function hideChartHover() {
        if (chartGuide) chartGuide.classList.remove("visible");
        if (chartDotsGray) chartDotsGray.forEach(d => { d.classList.remove("active"); d.removeAttribute("filter"); });
        if (chartDotsGreen) chartDotsGreen.forEach(d => { d.classList.remove("active"); d.removeAttribute("filter"); });
        if (chartTooltip) {
            chartTooltip.classList.remove("visible");
            chartTooltip.style.left = "";
            chartTooltip.style.top = "";
        }
    }

    // =========================================================
    // Event listeners del grafico: mousemove y mouseleave
    // Usamos requestAnimationFrame para limitar las actualizaciones
    // a 60fps y evitar trabajo innecesario.
    // =========================================================
    if (chartArea) {
        let hoverRAF = null;
        chartArea.addEventListener("mousemove", function(e) {
            if (hoverRAF) cancelAnimationFrame(hoverRAF);
            hoverRAF = requestAnimationFrame(function() { updateChartHover(e); });
        });
        chartArea.addEventListener("mouseleave", hideChartHover);
    }

});

// =========================================================
// SCROLL LISTENER — Header opaco al hacer scroll
// Ejecutado fuera de DOMContentLoaded para no bloquear la carga
// inicial. Cuando el usuario scrollea mas de 50px, agrega la
// clase "scrolled" al <header>, que activa el fondo oscuro
// y la sombra definidos en _header.scss.
// =========================================================
window.addEventListener("scroll", function() {
    var header = document.querySelector("header");
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// =========================================================
// SMOOTH SCROLL — Enlaces internos con anclas (#)
// Cuando el usuario hace clic en un enlace como <a href="#seccion">
// el navegador se desplaza suavemente hasta el elemento con
// ese ID en lugar de saltar instantaneamente.
// =========================================================
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener("click", function(e) {
        var rawHref = this.getAttribute("href");
        if (!rawHref || rawHref === "#") return;
        var target = document.querySelector(rawHref);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
    });
});
