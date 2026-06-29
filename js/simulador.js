/* ============================================================
   EcoSort — simulador.js (Maquina de estados)
   ============================================================
   Este es el archivo mas complejo del proyecto. Implementa un
   simulador de clasificacion de residuos industriales que
   funciona como una MAQUINA DE ESTADOS con 3 fases:

     1. CONFIGURACION — El usuario llena un formulario con
        tipo de residuo, toxicidad, volumen y sector.

     2. CARGA — Animacion de procesamiento mientras se llama
        a la API de Gemini (Google AI Studio).

     3. RESULTADO — Protocolo de disposicion generado por IA,
        con grafico donut, badges y puntaje de reciclaje.

   Cada fase se renderiza llamando a mostrarSimulador(), que
   destruye y reconstruye solo el contenido variable de las
   columnas izquierda/derecha. Esto asegura que la UI siempre
   refleje el estado actual sin inconsistencias.

   ARCHIVOS RELACIONADOS:
     - js/gemini-config.js: contiene la API key y URL base
     - js/main.js: funciones globales (animaciones scroll, etc.)
     - scss/pages/_simulador.scss: todos los estilos del simulador
     - page/simulador.html: contenedor HTML con <div id="root">
   ============================================================ */

/* ============================================================
   SECCION 1 — DATOS ESTATICOS (CATALOGOS)
   ============================================================
   Estos arreglos funcionan como una "base de datos" local.
   Definen todas las opciones que el usuario puede elegir en
   el formulario. Estan separados del resto de la logica para
   que sea facil agregar, quitar o modificar opciones sin
   tocar el codigo de renderizado.

   Cada objeto tiene al menos:
     - id: identificador unico (se guarda en simState)
     - label: texto visible para el usuario
   ============================================================ */

// Catalogo de 8 tipos de residuo con emoji y color para el grafico donut
// Los colores se usan tanto en el formulario como en el SVG del donut.
var WASTE_TYPES = [
    {id:"plastico",  label:"Pl\u00e1stico",        emoji:"\ud83e\uddf4", color:"#2196F3"},
    {id:"vidrio",    label:"Vidrio",              emoji:"\ud83d\udee2\ufe0f", color:"#9C27B0"},
    {id:"metal",     label:"Metal",              emoji:"\ud83e\udd6b", color:"#607D8B"},
    {id:"papel",     label:"Papel / Cart\u00f3n", emoji:"\ud83d\udce6", color:"#FFC107"},
    {id:"organico",  label:"Org\u00e1nico",       emoji:"\ud83c\udf4e", color:"#4CAF50"},
    {id:"peligroso", label:"Peligroso",          emoji:"\u26a0\ufe0f", color:"#FF5722"},
    {id:"textil",    label:"Textil",             emoji:"\ud83d\udc55", color:"#795548"},
    {id:"mixto",     label:"Residuo Mixto",      emoji:"\ud83d\uddd1\ufe0f", color:"#9E9E9E"}
];
// Ocho categorias cubren los residuos mas comunes en industria peruana

// Opciones de volumen en kg/dia — valores representativos segun
// la escala de generacion de residuos en PYMES y hogares.
var VOLUME_OPTIONS = [
    {value:"<10",   label:"< 10 kg/d\u00eda"},
    {value:"10-50", label:"10\u201350 kg/d\u00eda"},
    {value:"50-200",label:"50\u2013200 kg/d\u00eda"},
    {value:"200-500",label:"200\u2013500 kg/d\u00eda"},
    {value:">500",  label:"> 500 kg/d\u00eda"}
];

// Sectores industriales disponibles. Cada opcion afecta como
// Gemini genera el protocolo (ej: "Hospital / Salud" requiere
// normativas de residuos biologicos).
var SECTOR_OPTIONS = [
    "Hogar / Residencial",
    "Restaurante / Foodservice",
    "Oficina / Comercio",
    "Industria / Manufactura",
    "Hospital / Salud",
    "Municipio / Gobierno"
];

// Niveles de toxicidad — campo solicitado por el profesor para
// cumplir con la metodologia de evaluacion de riesgos ambientales.
var TOXICITY_LEVELS = [
    {id:"bajo",      label:"Bajo",     desc:"Residuo no peligroso"},
    {id:"moderado",  label:"Moderado", desc:"Requiere precaucion"},
    {id:"alto",      label:"Alto",     desc:"Residuo peligroso"},
    {id:"critico",   label:"Critico",  desc:"Altamente peligroso"}
];

// Distribucion por defecto del grafico donut (antes de que el
// usuario seleccione residuos). Representa la composicion media
// de residuos urbanos en Peru segun datos del MINAM.
var DEFAULT_DIST = [
    {name:"Org\u00e1nico", value:52, color:"#00E676"},
    {name:"Pl\u00e1stico", value:18, color:"#38BDF8"},
    {name:"Papel",         value:14, color:"#F59E0B"},
    {name:"Vidrio",        value:8,  color:"#A855F7"},
    {name:"Otros",         value:8,  color:"#94A3B8"}
];
// La suma da 100%. "Otros" captura residuos no categorizados.

/* ============================================================
   SECCION 2 — HELPER: CREACION DE ELEMENTOS DOM (h)
   ============================================================
   La funcion 'h' (abreviatura de "hyperscript" o "html") es
   un mini-framework propio de 20 lineas que reemplaza a
   document.createElement. Sin esta funcion, el codigo del
   simulador tendria el doble de tamaño y seria mucho menos
   legible.

   FUNCIONAMIENTO:
     h("div", {className:"mi-clase", onClick:fn}, "texto", hijoNodo)

   EQUIVALE A:
     <div class="mi-clase" onclick="fn()">texto<hijoNodo></div>

   VENTAJAS:
     - No depende de React, Vue ni ninguna libreria externa
     - Los event listeners se asignan directamente (onClick)
     - Soporta style como objeto literal (ej: {color:"red"})
     - Los hijos pueden ser strings o nodos DOM
   ============================================================ */
function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var key in attrs) {
        var val = attrs[key];
        if (key === "className") el.className = val;
        else if (key === "style" && typeof val === "object")
            for (var sk in val) el.style[sk] = val[sk];
        else if (key.indexOf("on") === 0)
            el.addEventListener(key.slice(2).toLowerCase(), val);
        else el.setAttribute(key, val);
    }
    for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];
        if (typeof child === "string")
            el.appendChild(document.createTextNode(child));
        else if (child && child.nodeType) el.appendChild(child);
        else if (Array.isArray(child))
            for (var j = 0; j < child.length; j++)
                if (child[j] && child[j].nodeType) el.appendChild(child[j]);
    }
    return el;
}

/* ============================================================
   SECCION 3 — DISTRIBUCION DEL GRAFICO DONUT
   ============================================================
   Cuando el usuario selecciona tipos de residuo, esta funcion
   genera una distribucion porcentual aleatoria basada en esas
   selecciones. Los valores son simulados (no reales) porque el
   proposito es educativo: mostrar como se veria la composicion
   del residuo en un grafico circular.

   Si no hay seleccion, devuelve DEFAULT_DIST (datos reales de Peru).
   ============================================================ */
function generarDistribucion(selected) {
    if (selected.length === 0) return DEFAULT_DIST;
    var labelMap = {}, colorMap = {};
    WASTE_TYPES.forEach(function(w){
        labelMap[w.id] = w.label;
        colorMap[w.id] = w.color;
    });
    var items = selected.map(function(id){
        return {
            name: labelMap[id] || id,
            value: Math.floor(Math.random() * 28) + 8,
            color: colorMap[id] || "#9E9E9E"
        };
    });
    // Ajustar para que la suma sea exactamente 100
    var total = items.reduce(function(s, d){ return s + d.value; }, 0);
    items.forEach(function(d){ d.value = Math.round(d.value / total * 100); });
    var sum = items.reduce(function(s, d){ return s + d.value; }, 0);
    if (sum !== 100 && items.length > 0) items[0].value += 100 - sum;
    return items;
}

/* ============================================================
   SECCION 4 — GRAFICO DONUT SVG
   ============================================================
   Renderiza un grafico circular usando SVG puro. Cada segmento
   del donut es un elemento <circle> con:
     - stroke-dasharray: longitud del arco (proporcional al valor)
     - stroke-dashoffset: posicion de inicio del arco
     - transform: rotate(-90): el grafico empieza desde arriba

   El hueco central (otro <circle> blanco) crea el efecto "donut".
   Cuando 'interactive' es true (solo en Estado 3), los segmentos
   responden al hover y resaltan su item en la leyenda.
   ============================================================ */
var legendItems = [];  // Referencias a los spans de la leyenda, para hover

function renderizarGrafico(data, size, interactive) {
    var total = data.reduce(function(s, d){ return s + d.value; }, 0) || 1;
    var r = 56, circ = 2 * Math.PI * r;  // Circunferencia del circulo base
    var cx = size / 2, cy = size / 2, offset = 0;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);

    data.forEach(function(d, idx){
        var seg = d.value / total * circ;   // Longitud del arco para este segmento
        var segArr = seg + " " + (circ - seg);
        var segOff = -offset;               // Desplazamiento para que el siguiente empiece donde termino este
        offset += seg;

        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", d.color);
        circle.setAttribute("stroke-width", "18");
        circle.setAttribute("stroke-dasharray", segArr);
        circle.setAttribute("stroke-dashoffset", segOff);
        circle.setAttribute("transform", "rotate(-90 " + cx + " " + cy + ")");
        circle.style.transition = "stroke-dasharray .5s, stroke-dashoffset .5s, stroke-width .3s";

        // Eventos hover solo en estado Resultado, no en configuracion
        if (interactive) {
            circle.setAttribute("data-index", idx);
            circle.addEventListener("mouseenter", function(){ resaltarLeyenda(idx); });
            circle.addEventListener("mouseleave", function(){ unresaltarLeyenda(); });
        }
        svg.appendChild(circle);
    });

    // Hueco central del donut — circulo blanco que deja solo el borde
    // Esto convierte un grafico de torta solido en un "donut".
    var hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hole.setAttribute("cx", cx);
    hole.setAttribute("cy", cy);
    hole.setAttribute("r", r * 0.55);
    hole.setAttribute("fill", "#FFFFFF");
    svg.appendChild(hole);

    return svg;
}

/* ============================================================
   SECCION 5 — LEYENDA DEL DONUT
   ============================================================
   Muestra los nombres y porcentajes en filas de 2 columnas.
   Cada item tiene un puntito de color (legend-dot) que coincide
   con el color del segmento en el SVG.

   Al hacer hover sobre un segmento del donut en el Estado 3,
   el item correspondiente en la leyenda se resalta con la clase
   CSS "legend-highlight".
   ============================================================ */
function renderizarLeyenda(chartData) {
    legendItems = [];
    var el = h("div", {className:"donut-legend"});

    // Recorrer datos en pares (2 items por fila)
    for (var i = 0; i < chartData.length; i += 2) {
        var left = chartData[i], right = chartData[i + 1];
        var row = h("div", {className:"legend-row"});

        // Columna izquierda
        var leftSpan = h("span", null);
        var ld = document.createElement("span");
        ld.className = "legend-dot";
        ld.style.background = left.color;
        leftSpan.appendChild(ld);
        leftSpan.appendChild(document.createTextNode(" " + left.name + " " + left.value + "%"));
        legendItems.push(leftSpan);
        row.appendChild(leftSpan);

        // Columna derecha (puede no existir si hay numero impar de items)
        if (right) {
            var rightSpan = h("span", null);
            var rd = document.createElement("span");
            rd.className = "legend-dot";
            rd.style.background = right.color;
            rightSpan.appendChild(rd);
            rightSpan.appendChild(document.createTextNode(" " + right.name + " " + right.value + "%"));
            legendItems.push(rightSpan);
            row.appendChild(rightSpan);
        } else {
            // Si no hay item derecho, agregamos un span vacio para mantener el grid
            row.appendChild(h("span", null));
        }
        el.appendChild(row);
    }
    return el;
}

// Resalta el item de la leyenda que corresponde al segmento hovereado
function resaltarLeyenda(idx) {
    legendItems.forEach(function(el, i){
        if (i === idx) el.classList.add("legend-highlight");
    });
}

function unresaltarLeyenda() {
    legendItems.forEach(function(el){
        el.classList.remove("legend-highlight");
    });
}

/* ============================================================
   SECCION 6 — ESTADO GLOBAL DE LA MAQUINA (simState)
   ============================================================
   Este objeto es el CORAZON del simulador. Todo el estado de la
   aplicacion vive aqui: que residuos selecciono el usuario, en
   que fase estamos, que datos devolvio Gemini, etc.

   PRINCIPIO: La interfaz es una FUNCION del estado.
   mostrarSimulador() lee simState y pinta la pantalla.
   Cuando algo cambia (usuario hace clic, Gemini responde),
   solo modificamos simState y llamamos a mostrarSimulador().

   Esto se llama "unidirectional data flow" y es el mismo
   principio que usan React y Vue, pero sin librerias.
   ============================================================ */
var simState = {
    wastes:     [],        // IDs de residuos seleccionados (ej: ["plastico", "vidrio"])
    toxicity:   null,      // ID del nivel de toxicidad (ej: "bajo")
    volume:     null,      // Valor del volumen (ej: "10-50")
    sector:     null,      // Nombre del sector (ej: "Industria / Manufactura")
    phase:      "config",  // Fase actual: "config" | "loading" | "result" | "error"
    chart:      DEFAULT_DIST,  // Datos del grafico donut (se actualiza al recibir resultado)
    protocol:   null,      // Objeto con el protocolo generado por Gemini (5 campos)
    errorMsg:   null,      // Mensaje de error si falla la API
    recyclabilityScore: 85 // Puntaje de reciclaje (0-100), se actualiza al recibir resultado
};

// Referencia al requestAnimationFrame de la animacion de carga
// Se guarda para poder cancelarla si el usuario cambia de fase
// antes de que termine (ej: reiniciar mientras carga).
var loadingAnimFrame = null;

// Contador de reintentos para la API de Gemini.
// Si Gemini responde con MAX_TOKENS, reintentamos una vez.
var _geminiRetryCount = 0;

// Bandera que indica si el esqueleto base del simulador ya fue
// construido (hero + layout de 2 columnas). La primera vez que
// se llama a mostrarSimulador(), construye el esqueleto.
// Las veces siguientes solo actualiza el contenido de las columnas.
var _simBuilt = false;

/* ============================================================
   SECCION 7 — RENDERIZADO PRINCIPAL (mostrarSimulador)
   ============================================================
   Esta funcion es la ENTRADA PRINCIPAL del simulador. Construye
   toda la interfaz desde cero cada vez que cambia el estado.

   ESTRATEGIA:
     1. La PRIMERA vez: pinta el hero fijo y el layout de 2
        columnas (nunca se destruyen).
     2. Las siguientes veces: solo reemplaza el contenido de
        las columnas izquierda y derecha segun la fase actual.

   Esto es intencionalmente simple: aunque "destruir y recrear"
   es menos eficiente que actualizar nodos existentes, evita
   bugs de estado inconsistente y hace el codigo mucho mas
   facil de entender para estudiantes.
   ============================================================ */
function mostrarSimulador() {
    var s = simState;
    var root = document.getElementById("root");

    // --- PRIMERA VEZ: construir el esqueleto estable ---
    // El hero y el layout de columnas se crean una sola vez
    // y permanecen inmutables durante toda la sesion.
    if (!_simBuilt) {
        _simBuilt = true;
        root.innerHTML = "";

        // Hero del simulador (nunca cambia)
        root.appendChild(
            h("section", {className:"simulator-hero"},
                h("div", {className:"container"},
                    h("div", {className:"simulator-hero-content"},
                        h("span", {className:"badge badge-green"},
                            h("img", {src:"../assets/icons/leaf.svg", className:"icon", alt:""}),
                            " MOTOR DE IA ECOSORT V2.1"
                        ),
                        h("h1", null, "Simulador de Clasificación Inteligente"),
                        h("p", null,
                            "Ingresa tipo de residuo, nivel de toxicidad y volumen generado. " +
                            "El motor IA, potenciado por Gemini API de Google AI Studio, analiza " +
                            "las variables y genera un protocolo de disposición personalizado."
                        )
                    )
                )
            )
        );

        // Esqueleto del panel principal con dos columnas vacias
        // Columna izquierda: formulario / carga / resultado / error
        // Columna derecha: guia + grafico donut + CTA
        root.appendChild(
            h("section", {className:"simulator-main section"},
                h("div", {className:"container"},
                    h("div", {className:"simulator-layout"},
                        h("div", {id:"sim-left-col"}),   // Contenido variable (izquierda)
                        h("div", {id:"sim-right-col"})   // Contenido variable (derecha)
                    )
                )
            )
        );
    }

    // --- ACTUALIZAR COLUMNA IZQUIERDA (solo su contenido) ---
    // Segun la fase, renderizamos un componente diferente
    var leftCol;
    if (s.phase === "config")   leftCol = mostrarConfiguracion();
    else if (s.phase === "loading") leftCol = mostrarCarga();
    else if (s.phase === "error")   leftCol = mostrarError();
    else                            leftCol = mostrarResultado();
    // Si phase es "result", cae en el else

    var leftWrapper = document.getElementById("sim-left-col");
    leftWrapper.innerHTML = "";
    leftWrapper.appendChild(leftCol);

    // --- ACTUALIZAR COLUMNA DERECHA (solo su contenido) ---
    var rightWrapper = document.getElementById("sim-right-col");
    rightWrapper.innerHTML = "";

    // Tarjeta de ayuda (guia de 3 pasos) solo en configuracion
    if (s.phase === "config") {
        rightWrapper.appendChild(mostrarGuia());
    }

    // Grafico donut — siempre visible en cualquier fase
    var chartSize = 160;
    var isInteractive = (s.phase === "result");  // Solo interactivo en resultado
    var donutEl = renderizarGrafico(s.chart, chartSize, isInteractive);

    var distCard = h("div", {className:"sim-stats-card"},
        h("div", {className:"sim-stats-header"},
            h("span", {style:{fontSize:"1.2rem"}}, "\u267b\ufe0f"),
            h("h4", null, "Distribuci\u00f3n t\u00edpica")
        ),
        h("p", {className:"sim-stats-sub"},
            s.wastes.length
                ? "Distribuci\u00f3n estimada seg\u00fan selecci\u00f3n"
                : "Composici\u00f3n media de residuos en Per\u00fa"
        ),
        h("div", {className:"donut-chart"}, donutEl)
    );
    distCard.appendChild(renderizarLeyenda(s.chart));
    rightWrapper.appendChild(distCard);

    // Banner CTA (Call To Action) — enlace a la pagina de servicios
    rightWrapper.appendChild(
        h("div", {className:"sim-cta-banner"},
            h("h4", null, "\u00bfQuieres integrar EcoSort?"),
            h("p", null,
                "Accede a la API de clasificaci\u00f3n en tiempo real para " +
                "integrar EcoSort en tu plataforma de gesti\u00f3n ambiental."
            ),
            h("a", {href:"servicios.html", className:"cta-link"},
                h("span", null, "Ver planes"), " \u2192"
            )
        )
    );
}

/* ============================================================
   SECCION 8 — TARJETA DE AYUDA (Guia de 3 pasos)
   ============================================================
   Pequena tarjeta informativa que aparece SOLO en la fase de
   configuracion, en la columna derecha. Explica al usuario
   como funciona el simulador en 3 pasos simples.

   Cada paso tiene un icono SVG, un titulo y una descripcion.
   Los iconos se cargan desde assets/icons/.
   ============================================================ */
function mostrarGuia() {
    var steps = [
        {faIcon:"camera",    title:"Ingresa datos",
         desc:"Selecciona tipo de material, toxicidad y volumen del residuo."},
        {faIcon:"microchip", title:"Procesa con Gemini IA",
         desc:"El motor t\u00e9cnico basado en Gemini API eval\u00faa las variables."},
        {faIcon:"file-alt",  title:"Genera protocolo",
         desc:"Obtienes clasificaci\u00f3n, almacenamiento, transporte y reciclaje."}
    ];

    var card = h("div", {className:"sim-info-card"},
        h("h3", null, "\u00bfC\u00f3mo funciona el motor de clasificaci\u00f3n?")
    );
    steps.forEach(function(step){
        card.appendChild(
            h("div", {className:"sim-step"},
                h("span", {className:"sim-step-icon"},
                    h("img", {src:"../assets/icons/" + step.faIcon + ".svg", className:"icon", alt:""})
                ),
                h("div", null,
                    h("strong", null, step.title),
                    h("p", null, step.desc)
                )
            )
        );
    });
    return card;
}

/* ============================================================
   ESTADO 1 — FORMULARIO DE CONFIGURACION
   ============================================================
   Este es el formulario principal con 4 campos. Cada campo usa
   un patron de seleccion visual (tarjetas o pills) en lugar de
   inputs tradicionales. Esto mejora la experiencia de usuario
   y evita errores de validacion.

   CAMPOS:
     1. Tipo de residuo (multi-select) — se pueden elegir varios
     2. Nivel de toxicidad (single-select)
     3. Volumen aproximado (single-select)
     4. Sector industrial (single-select)

   FLUJO: El usuario selecciona opciones, hace clic en
   "Analizar con IA" y la funcion analizarResiduo() valida
   y transiciona al Estado 2 (carga).
   ============================================================ */
function mostrarConfiguracion() {
    var s = simState;

    // --- Campo 1: Tipo de residuo (multi-select) ---
    // Cada opcion es un <label> con clase "waste-option".
    // Al hacer clic, seleccionarResiduo() agrega/remueve el
    // ID del residuo en simState.wastes y togglea la clase "active".
    var wasteGrid = h("div", {className:"waste-grid"});
    WASTE_TYPES.forEach(function(w){
        var active = s.wastes.indexOf(w.id) !== -1;
        wasteGrid.appendChild(
            h("label", {className:"waste-option" + (active ? " active" : ""),
               onClick:function(){ seleccionarResiduo(this, w.id); }},
                h("span", {className:"waste-card"},
                    h("span", {className:"waste-emoji"}, w.emoji),
                    h("span", null, w.label)
                )
            )
        );
    });

    // --- Campo 2: Nivel de toxicidad (single-select) ---
    // Solo un item puede estar activo a la vez.
    // Al hacer clic, desactivamos el anterior y activamos el nuevo.
    var toxicityPills = h("div", {className:"toxicity-pills"});
    TOXICITY_LEVELS.forEach(function(t){
        var active = s.toxicity === t.id;
        toxicityPills.appendChild(
            h("label", {className:"toxicity-option" + (active ? " active" : ""),
               onClick:function(){
                   var parent = this.parentNode;
                   var act = parent.querySelector(".active");
                   if (act) act.classList.remove("active");
                   this.classList.add("active");
                   simState.toxicity = t.id;
               }},
                h("span", {className:"toxicity-label"}, t.label),
                h("span", {className:"toxicity-desc"}, t.desc)
            )
        );
    });

    // --- Campo 3: Volumen (single-select) ---
    // Mismo patron que toxicidad: un solo item activo.
    var volumePills = h("div", {className:"volume-pills"});
    VOLUME_OPTIONS.forEach(function(v){
        var active = s.volume === v.value;
        volumePills.appendChild(
            h("label", {className:"pill-option" + (active ? " active" : ""),
               onClick:function(){
                   var parent = this.parentNode;
                   var act = parent.querySelector(".active");
                   if (act) act.classList.remove("active");
                   this.classList.add("active");
                   simState.volume = v.value;
               }},
                h("span", {className:"pill"}, v.label)
            )
        );
    });

    // --- Campo 4: Sector (single-select) ---
    var sectorGrid = h("div", {className:"sector-grid"});
    SECTOR_OPTIONS.forEach(function(sec){
        var active = s.sector === sec;
        sectorGrid.appendChild(
            h("label", {className:"sector-option" + (active ? " active" : ""),
               onClick:function(){
                   var parent = this.parentNode;
                   var act = parent.querySelector(".active");
                   if (act) act.classList.remove("active");
                   this.classList.add("active");
                   simState.sector = sec;
               }},
                h("span", {className:"sector-tag"}, sec)
            )
        );
    });

    // --- Ensamblar formulario completo ---
    return h("div", {className:"sim-form-card"},
        h("div", {className:"sim-form-header"},
            h("h2", null, "Configurar an\u00e1lisis de residuos"),
            h("p", null,
                "Completa los campos para que el motor IA clasifique t\u00e9cnicamente " +
                "el residuo y genere un protocolo de disposición."
            )
        ),
        h("hr", {className:"sim-divider"}),

        // Campo 1
        h("div", {className:"sim-field"},
            h("label", {className:"sim-label"},
                "1. Selecciona los tipos de residuo ",
                h("span", {className:"required"}, "*")
            ),
            wasteGrid
        ),

        // Campo 2
        h("div", {className:"sim-field"},
            h("label", {className:"sim-label"},
                "2. Nivel de toxicidad ",
                h("span", {className:"required"}, "*")
            ),
            toxicityPills
        ),

        // Campo 3
        h("div", {className:"sim-field"},
            h("label", {className:"sim-label"},
                "3. Volumen aproximado de residuos ",
                h("span", {className:"required"}, "*")
            ),
            volumePills
        ),

        // Campo 4
        h("div", {className:"sim-field"},
            h("label", {className:"sim-label"},
                "4. Sector o tipo de organizaci\u00f3n ",
                h("span", {className:"required"}, "*")
            ),
            sectorGrid
        ),

        // Boton de accion principal
        h("button", {className:"sim-submit", onClick:analizarResiduo},
            h("span", {className:"sim-submit-icon"}, "\u2728"),
            " Analizar con IA ",
            h("span", null, "\u2192")
        )
    );
}

// Alternar seleccion de tipo de residuo (multi-select)
// Esta funcion se llama desde el onClick de cada tarjeta de residuo.
// No reconstruye el DOM completo — solo togglea la clase "active"
// y actualiza simState.wastes.
function seleccionarResiduo(el, id) {
    var idx = simState.wastes.indexOf(id);
    if (idx === -1) {
        simState.wastes.push(id);       // Agregar si no estaba
        el.classList.add("active");
    } else {
        simState.wastes.splice(idx, 1); // Remover si ya estaba
        el.classList.remove("active");
    }
}

/* ============================================================
   ESTADO 2 — PANTALLA DE CARGA (PROCESAMIENTO CON IA)
   ============================================================
   Mientras el usuario espera la respuesta de Gemini, mostramos:
     1. Un contador animado de 0% a 100%
     2. 4 pasos de verificacion que se activan secuencialmente
     3. Un spinner giratorio

   Cuando el contador llega a 100%, automaticamente se llama a
   llamarGemini() para hacer la peticion HTTP a la API.

   Si la API devuelve error, transicionamos al estado "error".
   ============================================================ */

// Texto de los 4 pasos que se muestran durante la carga
// Cada paso corresponde a una etapa del procesamiento ficticio
// (el motor IA realmente hace todo en un solo llamado a Gemini).
var LOADING_STEPS = [
    "Validando variables t\u00e9cnicas",
    "Analizando normativa ambiental",
    "Generando protocolo personalizado",
    "Optimizando ruta de reciclaje"
];

function mostrarCarga() {
    var s = simState;
    s.loadingProgress = 0;  // Se usa en animarCarga()
    s.loadingStep = 0;

    // Construir lista de pasos con clase "active" solo en el primero
    var stepsEl = h("div", {className:"sim-loading-steps"});
    LOADING_STEPS.forEach(function(text, idx){
        stepsEl.appendChild(
            h("div", {className:"sim-loading-step" + (idx === 0 ? " active" : ""),
               id:"load-step-" + idx},
                h("span", {className:"step-pulse"}),
                text
            )
        );
    });

    var container = h("div", {className:"sim-form-card"},
        h("div", {className:"sim-loading-state"},
            h("div", {className:"sim-loading-spinner"}),  // Spinner CSS
            h("h3", null, "Analizando residuos industriales..."),
            h("p", {className:"sim-loading-sub"},
                "La IA est\u00e1 generando un protocolo t\u00e9cnico..."
            ),
            h("div", {className:"sim-loading-counter", id:"load-counter"}, "0%"),
            stepsEl
        )
    );

    // Iniciar animacion 50ms despues para asegurar que el DOM
    // ya renderizo el contador y los pasos. Sin este setTimeout,
    // getElementById("load-counter") podria devolver null.
    setTimeout(function(){ animarCarga(); }, 50);
    return container;
}

/*
 * animarCarga() — Animacion principal del Estado 2
 *
 * Usa requestAnimationFrame para un movimiento suave a 60fps.
 * La curva de easing es cubica (easeOutCubic): acelera al inicio
 * y desacelera al final, dando una sensacion natural.
 *
 * DURACION: 2800ms (2.8 segundos) — tiempo suficiente para que
 * el usuario vea la animacion pero no se impaciente.
 *
 * PASOS:
 *   - 0%:   "Validando variables tecnicas" (activo)
 *   - 30%:  "Analizando normativa ambiental" (activo)
 *   - 60%:  "Generando protocolo personalizado" (activo)
 *   - 85%:  "Optimizando ruta de reciclaje" (activo)
 *   - 100%: LLAMAR A GEMINI API
 */
function animarCarga() {
    var s = simState;
    var startTime = Date.now();
    var duration = 2800;

    // Puntos de activacion de cada paso (en porcentaje)
    var STEP_THRESHOLDS = [0, 30, 60, 85];

    function tick() {
        var elapsed = Date.now() - startTime;
        var t = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);  // easeOutCubic
        var progress = Math.round(eased * 100);

        // Actualizar el texto del contador en el DOM
        var counter = document.getElementById("load-counter");
        if (counter) counter.textContent = progress + "%";

        // Determinar que paso debe estar activo segun el progreso
        var stepIdx = 0;
        if (progress >= STEP_THRESHOLDS[1]) stepIdx = 1;
        if (progress >= STEP_THRESHOLDS[2]) stepIdx = 2;
        if (progress >= STEP_THRESHOLDS[3]) stepIdx = 3;

        // Actualizar clases de cada paso: "done" si ya paso, "active" si es el actual
        for (var i = 0; i < LOADING_STEPS.length; i++) {
            var stepEl = document.getElementById("load-step-" + i);
            if (!stepEl) continue;
            stepEl.className = "sim-loading-step";
            if (i < stepIdx) stepEl.classList.add("done");
            else if (i === stepIdx) stepEl.classList.add("active");
        }

        if (t < 1) {
            loadingAnimFrame = requestAnimationFrame(tick);
        } else {
            // ANIMACION COMPLETADA — ahora si, llamar a Gemini
            loadingAnimFrame = null;
            llamarGemini();
        }
    }

    loadingAnimFrame = requestAnimationFrame(tick);
}

/* ============================================================
   SECCION 9 — INTEGRACION CON GEMINI API
   ============================================================
   llamarGemini() es el corazon de la integracion con Google
   AI Studio. Envia los parametros del residuo a Gemini y
   recibe un protocolo estructurado en JSON.

   Gemini actua como "Motor de Clasificacion de Residuos
   Industriales" — NO como chatbot ni asistente virtual.
   El prompt esta cuidadosamente disenado para que Gemini
   devuelva exclusivamente un objeto JSON con 5 campos.

   ARQUITECTURA:
     1. crearPrompt() construye el texto del prompt con los
        datos del formulario.
     2. fetch() hace una peticion POST a la API de Gemini.
     3. procesarRespuesta() extrae y valida el JSON de la
        respuesta (maneja bloques markdown ```json).
     4. Si todo sale bien, actualiza simState y renderiza
        el Estado 3 (resultado).
     5. Si algo falla, muestra el Estado de error.

   MANEJO DE ERRORES:
     - HTTP 503: Servicio temporalmente no disponible (reintentable)
     - MAX_TOKENS: Respuesta truncada (reintenta 1 vez)
     - BLOCKED: Contenido bloqueado por Gemini (no reintenta)
     - PARSE_ERROR: JSON mal formado (no reintenta)
     - Error de red: fetch falla (reintentable)
   ============================================================ */

function llamarGemini() {
    var s = simState;

    // Verificar que la API key este configurada en gemini-config.js
    // Si no, mostrar error con instrucciones para el usuario.
    if (typeof GEMINI_CONFIG === "undefined" ||
        !GEMINI_CONFIG.apiKey ||
        GEMINI_CONFIG.apiKey === "AQUI_TU_API_KEY") {

        s.phase = "error";
        s.errorMsg = "La API de Gemini no est\u00e1 configurada. " +
            "Agrega tu API key en js/gemini-config.js.";
        mostrarSimulador();
        return;
    }

    var prompt = crearPrompt(s);
    var url = GEMINI_CONFIG.baseUrl +
              GEMINI_CONFIG.model +
              ":generateContent?key=" +
              GEMINI_CONFIG.apiKey;

    var requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.2,        // Baja temperatura = respuestas mas deterministicas
            maxOutputTokens: 1024     // Limite para evitar respuestas muy largas
        }
    };

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    })
    .then(function(response) {
        // HTTP 503: error temporal del servidor de Google
        if (response.status === 503) {
            throw {
                _type: "SERVICE_UNAVAILABLE",
                message: "El servicio Gemini est\u00e1 temporalmente no disponible " +
                    "(HTTP 503). Es un problema del servidor de Google, " +
                    "no de tu API key. Intenta nuevamente en unos segundos."
            };
        }
        if (!response.ok) {
            throw {
                _type: "HTTP_ERROR",
                status: response.status,
                message: "Error HTTP " + response.status +
                    " al conectar con Gemini."
            };
        }
        return response.json();
    })
    .then(function(data) {
        // Validar que la respuesta tenga la estructura esperada
        if (!data || !data.candidates || !data.candidates.length) {
            var reason = data && data.promptFeedback
                ? data.promptFeedback.blockReason : "unknown";
            throw {
                _type: "BLOCKED",
                message: "La solicitud fue bloqueada por Gemini. " +
                    "Raz\u00f3n: " + reason + "."
            };
        }

        var candidate = data.candidates[0];

        // finishReason: MAX_TOKENS significa que la respuesta fue
        // truncada porque supero el limite de tokens. Reintentamos
        // una vez con la esperanza de que la siguiente respuesta
        // sea mas corta.
        if (candidate.finishReason === "MAX_TOKENS") {
            if (_geminiRetryCount < 1) {
                _geminiRetryCount++;
                console.warn("MAX_TOKENS detectado, reintentando...");
                setTimeout(llamarGemini, 500);
                return;
            }
            _geminiRetryCount = 0;
            throw {
                _type: "MAX_TOKENS",
                message: "La respuesta de Gemini fue truncada (m\u00e1ximo de tokens alcanzado). " +
                    "Intenta nuevamente o reduce la cantidad de residuos seleccionados."
            };
        }

        // Otros finishReason distintos de STOP (ej: SAFETY)
        if (candidate.finishReason && candidate.finishReason !== "STOP") {
            throw {
                _type: "FINISH_REASON",
                message: "Gemini detuvo la generaci\u00f3n por: " +
                    candidate.finishReason + ". Intenta nuevamente."
            };
        }

        // Extraer el texto de la respuesta
        var text = "";
        try {
            text = candidate.content.parts[0].text;
        } catch(e) {
            throw {
                _type: "PARSE_ERROR",
                message: "Respuesta de Gemini vac\u00eda o mal formada: " +
                    "no se encontr\u00f3 contenido en la respuesta."
            };
        }

        // Parsear el JSON de la respuesta
        var protocol = procesarRespuesta(text);
        if (!protocol) {
            throw {
                _type: "PARSE_ERROR",
                message: "No se pudo interpretar la respuesta de Gemini como JSON v\u00e1lido. " +
                    "Revisa la consola para m\u00e1s detalles."
            };
        }

        // --- EXITO: Actualizar estado y mostrar resultado ---
        _geminiRetryCount = 0;
        s.protocol = protocol;
        // Generar nueva distribucion del grafico segun los residuos seleccionados
        s.chart = generarDistribucion(
            s.wastes.length ? s.wastes : ["organico","plastico","papel","vidrio","mixto"]
        );
        // Puntaje de reciclaje aleatorio entre 72 y 91 (simulado, no real)
        s.recyclabilityScore = Math.floor(Math.random() * 20) + 72;
        s.phase = "result";
        mostrarSimulador();
    })
    .catch(function(err) {
        console.error("Gemini API error:", err);
        _geminiRetryCount = 0;
        s.phase = "error";

        // Mensajes de error especificos segun el tipo
        if (err && err._type) {
            s.errorMsg = err.message;
        } else if (err && err.message && err.message.indexOf("Failed to fetch") !== -1) {
            s.errorMsg = "Error de red: no se pudo conectar con Gemini API. " +
                "Verifica tu conexi\u00f3n a internet.";
        } else {
            s.errorMsg = "Error inesperado al conectar con Gemini API. " +
                "Detalle: " + (err && err.message ? err.message : "desconocido");
        }

        mostrarSimulador();
    });
}

/*
 * crearPrompt() — Construye el prompt para Gemini
 *
 * El prompt es la clave de todo. Le decimos a Gemini exactamente
 * que queremos: un JSON con 5 campos. Sin markdown, sin texto
 * adicional, sin conversacion.
 *
 * EJEMPLO DE RESPUESTA ESPERADA:
 * {
 *   "classification": "Residuo organico compostable",
 *   "storage": "Almacenar en contenedor verde con tapa",
 *   "transport": "Transporte diario en camion sellado",
 *   "recycling": "Compostaje industrial a 60°C por 21 dias",
 *   "safety": "Usar guantes y mascarilla N95"
 * }
 */
function crearPrompt(state) {
    var wasteNames = state.wastes.map(function(id){
        for (var i = 0; i < WASTE_TYPES.length; i++) {
            if (WASTE_TYPES[i].id === id) return WASTE_TYPES[i].label;
        }
        return id;
    });

    var toxicityMap = {bajo:"Bajo",moderado:"Moderado",alto:"Alto",critico:"Critico"};
    var toxicityText = toxicityMap[state.toxicity] || "N/E";

    return "Clasifica este residuo industrial. Devuelve SOLO JSON, sin markdown ni texto extra.\n" +
           "Residuo: " + wasteNames.join(", ") + "\n" +
           "Toxicidad: " + toxicityText + "\n" +
           "Volumen: " + state.volume + " kg/dia\n" +
           "Sector: " + state.sector + "\n\n" +
           "{\"classification\":\"...\",\"storage\":\"...\",\"transport\":\"...\",\"recycling\":\"...\",\"safety\":\"...\"}";
}

/*
 * procesarRespuesta() — Extrae el JSON de la respuesta de Gemini
 *
 * Gemini a veces envuelve el JSON en bloques markdown:
 *   ```json
 *   { "clave": "valor" }
 *   ```
 *
 * Esta funcion limpia esos bloques y parsea el JSON.
 * Tambien valida que existan los 5 campos requeridos.
 * Si algo falla, devuelve null (y el llamador maneja el error).
 */
function procesarRespuesta(text) {
    if (!text) {
        console.warn("procesarRespuesta: texto vac\u00edo o nulo");
        return null;
    }

    // Eliminar bloques markdown ```json ... ``` y ``` ... ```
    var cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
        var parsed = JSON.parse(cleaned);
        // Validar que existan los 5 campos del protocolo
        if (parsed && typeof parsed === "object" &&
            parsed.classification && parsed.storage &&
            parsed.transport && parsed.recycling && parsed.safety) {
            return parsed;
        }
        console.warn("procesarRespuesta: JSON v\u00e1lido pero faltan campos. Claves:",
            Object.keys(parsed || {}).join(", "));
        return null;
    } catch(e) {
        console.error("procesarRespuesta: error al parsear JSON:", e.message);
        console.error("Inicio del texto recibido:", cleaned.substring(0, 300));
        return null;
    }
}

/* ============================================================
   ESTADO DE ERROR — FALLO EN LA API
   ============================================================
   Muestra un mensaje de error con dos botones:
     1. "Volver a intentar" — reintenta el analisis con los
        mismos parametros (util para errores temporales como 503).
     2. "Nuevo analisis" — resetea todo el simulador (util para
        errores de configuracion como API key invalida).
   ============================================================ */
function mostrarError() {
    var s = simState;

    return h("div", {className:"sim-form-card"},
        h("div", {className:"sim-error-state"},
            h("div", {className:"sim-error-icon"}, "\u26A0\uFE0F"),
            h("h3", null, "Error en el an\u00e1lisis"),
            h("p", {className:"sim-error-desc"}, s.errorMsg || "Ocurri\u00f3 un error inesperado."),
            h("div", {className:"sim-error-actions", style:{display:"flex", gap:"12px", marginTop:"24px", flexWrap:"wrap"}},
                h("button", {className:"sim-submit", onClick:reintentarAnalisis,
                   style:{background:"#64748B"}},
                    " Volver a intentar \u2192"
                ),
                h("button", {className:"sim-submit", onClick:reiniciarSimulador,
                   style:{background:"#1E293B"}},
                    " Nuevo an\u00e1lisis \u21BB"
                )
            )
        )
    );
}

/* ============================================================
   ESTADO 3 — RESULTADOS DEL ANALISIS
   ============================================================
   Esta es la pantalla final que ve el usuario cuando Gemini
   respondio exitosamente. Muestra:

     1. ENCABEZADO: check verde + "Analisis completado" + 97.3% confianza
     2. PROTOCOLO DE DISPOSICION: 5 items (clasificacion, almacenamiento,
        transporte, reciclaje, seguridad) generados por Gemini.
     3. BADGES: resumen visual de los parametros seleccionados (residuos,
        toxicidad, volumen, sector).
     4. BARRA DE RECICLAJE: indicador visual del potencial de reciclaje
        del residuo (valor simulado, no real).
     5. BOTON: "Nuevo analisis" que resetea el simulador.

   El grafico donut en la columna derecha ahora es interactivo:
   al hacer hover sobre los segmentos, se resalta la leyenda.
   ============================================================ */
function mostrarResultado() {
    var s = simState;
    var p = s.protocol;

    // Helper interno: convertir ID de residuo a etiqueta legible
    function wasteLabel(id) {
        for (var i = 0; i < WASTE_TYPES.length; i++)
            if (WASTE_TYPES[i].id === id) return WASTE_TYPES[i].label;
        return id;
    }

    // Helper interno: convertir valor de volumen a etiqueta legible
    function volumeLabel(val) {
        for (var i = 0; i < VOLUME_OPTIONS.length; i++)
            if (VOLUME_OPTIONS[i].value === val) return VOLUME_OPTIONS[i].label;
        return val;
    }

    // Mapa de toxicidad para mostrar en badges
    var toxicityMap = {
        bajo: "Toxicidad baja",
        moderado: "Toxicidad moderada",
        alto: "Toxicidad alta",
        critico: "Toxicidad cr\u00edtica"
    };

    // Los 5 items del protocolo con icono, etiqueta y texto
    var protocolItems = [
        {icon:"\uD83D\uDCCC", label:"Clasificaci\u00f3n",        text:p.classification},
        {icon:"\uD83D\uDEE1\uFE0F", label:"Almacenamiento",    text:p.storage},
        {icon:"\uD83D\uDE9B",      label:"Transporte",         text:p.transport},
        {icon:"\u267B\uFE0F",     label:"Reciclaje",           text:p.recycling},
        {icon:"\uD83D\uDEA8",     label:"Seguridad",           text:p.safety}
    ];

    // Construir tarjeta de protocolo
    var protocolCard = h("div", {className:"sim-protocol"},
        h("div", {className:"sim-protocol-title"},
            "\uD83D\uDCCB PROTOCOLO DE DISPOSICI\u00d3N"
        )
    );
    protocolItems.forEach(function(item){
        protocolCard.appendChild(
            h("div", {className:"sim-protocol-item"},
                h("span", {className:"protocol-item-icon"}, item.icon),
                h("div", {className:"protocol-item-content"},
                    h("strong", null, item.label),
                    h("p", null, item.text)
                )
            )
        );
    });

    // Badges de parametros seleccionados — resumen visual
    var badgeEl = h("div", {className:"sim-result-badges"});
    s.wastes.forEach(function(id){
        badgeEl.appendChild(
            h("span", {className:"sim-badge"}, "\u267B\uFE0F " + wasteLabel(id))
        );
    });
    if (s.toxicity) {
        badgeEl.appendChild(
            h("span", {className:"sim-badge"},
                "\u26A0\uFE0F " + (toxicityMap[s.toxicity] || s.toxicity)
            )
        );
    }
    if (s.volume) {
        badgeEl.appendChild(
            h("span", {className:"sim-badge"}, "\uD83D\uDCCA " + volumeLabel(s.volume))
        );
    }
    if (s.sector) {
        badgeEl.appendChild(
            h("span", {className:"sim-badge"}, "\uD83C\uDFED " + s.sector)
        );
    }

    // Barra de potencial de reciclaje (valor simulado entre 72 y 91)
    var score = s.recyclabilityScore;

    return h("div", {className:"sim-form-card sim-result-state"},

        // Encabezado con check verde, titulo y nivel de confianza
        h("div", {className:"sim-result-header"},
            h("div", {className:"sim-result-title-group"},
                h("span", {className:"sim-result-check"}, "\u2713"),
                h("h3", null, "An\u00e1lisis completado"),
                h("span", {className:"sim-confidence"}, "97.3% confianza")
            ),
            h("button", {className:"sim-reset-btn", onClick:reiniciarSimulador},
                h("span", {className:"reset-icon"}, "\u21BB"),
                " Nuevo an\u00e1lisis"
            )
        ),

        // Protocolo generado por Gemini
        protocolCard,

        // Badges resumen
        badgeEl,

        // Barra de reciclaje
        h("div", {className:"sim-score-section"},
            h("div", {className:"sim-score-header"},
                h("span", null, "Potencial de reciclaje"),
                h("span", {className:"sim-score-value"}, score + "%")
            ),
            h("div", {className:"sim-score-track"},
                h("div", {className:"sim-score-fill", style:{width:score + "%"}})
            )
        )
    );
}

/* ============================================================
   ACCIONES GLOBALES (Control de la maquina de estados)
   ============================================================
   Estas 3 funciones son los puntos de entrada para cambiar
   entre estados:

     analizarResiduo()   — Config (1) → Carga (2)
     reintentarAnalisis()— Error → Carga (2)
     reiniciarSimulador()— Cualquier estado → Config (1)
   ============================================================ */

/*
 * analizarResiduo() — Transicion de Estado 1 a Estado 2
 *
 * Validacion: si NINGUN campo fue tocado, no hace nada (return).
 * Si al menos un campo tiene valor, asigna valores por defecto
 * para los campos vacios y arranca la carga.
 *
 * VALORES POR DEFECTO (si el usuario no selecciono):
 *   - Residuo: organico
 *   - Toxicidad: bajo
 *   - Volumen: 10-50 kg/dia
 *   - Sector: Industria / Manufactura
 */
function analizarResiduo() {
    var s = simState;

    // Validacion minima: al menos un campo debe tener valor
    if (!s.wastes.length && !s.toxicity && !s.volume && !s.sector) return;

    // Rellenar campos vacios con valores por defecto
    if (!s.wastes.length)  s.wastes  = ["organico"];
    if (!s.toxicity)       s.toxicity = "bajo";
    if (!s.volume)         s.volume  = "10-50";
    if (!s.sector)         s.sector  = "Industria / Manufactura";

    s.phase = "loading";
    if (loadingAnimFrame) cancelAnimationFrame(loadingAnimFrame);
    mostrarSimulador();
    // Forzar scroll hacia la columna izquierda para que el usuario
    // vea la animacion de carga sin tener que scrollear manualmente.
    var col = document.getElementById("sim-left-col");
    if (col) col.scrollIntoView({ behavior: "auto", block: "center" });
}

/*
 * reintentarAnalisis() — Error → Carga (reintento)
 *
 * Similar a analizarResiduo() pero sin validar ni rellenar
 * valores — conserva las selecciones del usuario. Se usa
 * desde el estado de error para reintentar errores temporales
 * como HTTP 503 o errores de red.
 */
function reintentarAnalisis() {
    var s = simState;
    s.phase = "loading";
    s.errorMsg = null;
    if (loadingAnimFrame) cancelAnimationFrame(loadingAnimFrame);
    mostrarSimulador();
    var col = document.getElementById("sim-left-col");
    if (col) col.scrollIntoView({ behavior: "auto", block: "center" });
}

/*
 * reiniciarSimulador() — Vuelve al Estado 1 (configuracion)
 *
 * Limpia TODAS las selecciones y vuelve al formulario inicial.
 * Es como "refrescar" el simulador sin recargar la pagina.
 * Cancela cualquier animacion de carga en curso.
 */
function reiniciarSimulador() {
    if (loadingAnimFrame) cancelAnimationFrame(loadingAnimFrame);
    loadingAnimFrame = null;

    // Resetear todo el estado a valores iniciales
    simState.wastes     = [];
    simState.toxicity   = null;
    simState.volume     = null;
    simState.sector     = null;
    simState.phase      = "config";
    simState.chart      = DEFAULT_DIST;
    simState.protocol   = null;
    simState.errorMsg   = null;
    simState.recyclabilityScore = 85;

    mostrarSimulador();
}

/* ============================================================
   INICIALIZACION — Arrancar el simulador al cargar la pagina
   ============================================================
   Esta unica linea ejecuta todo el simulador. Cuando el archivo
   HTML termina de cargar el script, llama a mostrarSimulador()
   que construye el hero, el layout y el formulario de configuracion.
   ============================================================ */
mostrarSimulador();
