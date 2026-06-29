// EcoSort — Ventanas modales (Documentacion, FAQ, Privacidad)
// ============================================================
// Controla la apertura y cierre de modales desde el footer.
// El HTML de cada modal se inyecta dinamicamente al cargar la pagina.

// Contenido del modal de Documentacion
const DOC_CONTENT = `
<article>
    <h3>Descripcion general del proyecto</h3>
    <p>EcoSort es una plataforma web basada en inteligencia artificial diseñada para la clasificacion tecnica y gestion automatizada de residuos industriales. El proyecto surge como respuesta a la necesidad de optimizar los procesos de reciclaje en la industria peruana, reduciendo errores humanos y mejorando la eficiencia en el tratamiento de desechos. La plataforma permite a las empresas ingresar datos sobre sus residuos y obtener un analisis completo con recomendaciones personalizadas. EcoSort fue desarrollado como proyecto academico por estudiantes del Instituto de Educacion Superior Tecnologico Publico Argentina, combinando conocimientos de desarrollo web, inteligencia artificial y gestion ambiental.</p>

    <h3>Objetivos generales</h3>
    <p>El objetivo principal de EcoSort es automatizar la clasificacion de residuos industriales mediante inteligencia artificial, con el fin de reducir errores humanos, optimizar los procesos de reciclaje y fomentar practicas sostenibles en el sector industrial peruano.</p>
    <p>Se busca ademas crear una herramienta accesible y facil de usar que permita a cualquier empresa, independientemente de su tamano, acceder a recomendaciones tecnicas para el manejo adecuado de sus residuos. El proyecto tambien pretende demostrar como la tecnologia puede contribuir a solucionar problemas ambientales reales.</p>

    <h3>Objetivos especificos</h3>
    <p>Entre los objetivos especificos se encuentran: disenar un simulador interactivo que clasifique automaticamente los residuos en categorias como plasticos, vidrio, metal, papel, organicos y peligrosos; integrar la API de Gemini para generar protocolos ambientales personalizados; y desarrollar una interfaz intuitiva que facilite la navegacion del usuario.</p>
    <p>Tambien se busca implementar un sistema de recomendaciones de almacenamiento, transporte y reciclaje adaptado a cada tipo de residuo; garantizar que la plataforma sea responsive y funcione en diversos dispositivos; y documentar todo el proceso de desarrollo como material de referencia academico para futuros proyectos similares.</p>

    <h3>Alcance del sistema</h3>
    <p>EcoSort abarca la clasificacion de ocho categorias principales de residuos industriales: plasticos, vidrio, metal, papel y carton, organicos, peligrosos, textiles y mixtos. Para cada categoria, el sistema genera un protocolo con recomendaciones especificas de manejo.</p>
    <p>El alcance incluye ademas la generacion de sugerencias de almacenamiento seguro, rutas de transporte autorizadas, metodos de reciclaje recomendados y medidas de seguridad industrial. La plataforma esta disenada para empresas peruanas de diversos sectores y su uso es completamente gratuito con fines educativos.</p>

    <h3>Tecnologias utilizadas</h3>
    <p>EcoSort utiliza HTML5, CSS3 y JavaScript vanilla para la interfaz de usuario, con SASS como preprocesador CSS para mantener un codigo ordenado y modular. El diseno es completamente responsive, adaptandose a dispositivos moviles, tablets y computadoras de escritorio.</p>
    <p>Para la funcionalidad de inteligencia artificial se integra la API de Gemini, que permite procesar los datos ingresados por el usuario y generar respuestas contextualizadas. No se utilizan frameworks ni librerias externas, manteniendo el proyecto ligero y de facil comprension para fines academicos.</p>

    <h3>Inteligencia Artificial (Gemini API)</h3>
    <p>El corazon inteligente de EcoSort es la API de Gemini, desarrollada por Google AI Studio. Cuando el usuario completa el formulario del simulador, los datos se envian a Gemini, que los procesa utilizando modelos de lenguaje avanzados para generar un protocolo ambiental detallado y personalizado.</p>
    <p>Gemini analiza variables como el tipo de residuo, el nivel de toxicidad, el volumen aproximado y el sector industrial de la empresa. Con esta informacion, la IA determina las mejores practicas de clasificacion, almacenamiento, transporte y disposicion final, basandose en normativa ambiental peruana vigente.</p>
    <p>Es importante destacar que Gemini solo procesa la informacion en el momento de la consulta. No almacena datos del usuario ni reutiliza la informacion para otros fines, garantizando la privacidad de cada consulta realizada.</p>

    <h3>Flujo de funcionamiento</h3>
    <p>El flujo de EcoSort comienza cuando el usuario ingresa al simulador y completa un formulario con los datos de sus residuos: tipo de material, nivel de toxicidad, volumen aproximado y sector industrial. Una vez enviada la informacion, el sistema se comunica con la API de Gemini para procesar los datos.</p>
    <p>Gemini analiza la informacion y genera un protocolo ambiental que incluye clasificacion del residuo, recomendaciones de almacenamiento, sugerencias de transporte, metodos de reciclaje y medidas de seguridad. El resultado se muestra al usuario en una interfaz clara y organizada para su facil comprension y aplicacion.</p>

    <h3>Beneficios para empresas</h3>
    <p>EcoSort ofrece a las empresas una herramienta gratuita para mejorar la gestion de sus residuos industriales. Al utilizar la plataforma, las empresas pueden identificar el tipo correcto de tratamiento para cada residuo, reduciendo riesgos ambientales y cumpliendo con la normativa peruana de gestion de desechos.</p>
    <p>Ademas, la plataforma ayuda a optimizar costos operativos al sugerir rutas de reciclaje eficientes y metodos de almacenamiento adecuados. Las empresas tambien pueden utilizar los protocolos generados como guia para capacitar a su personal en el manejo seguro de residuos industriales.</p>

    <h3>Beneficios ambientales</h3>
    <p>EcoSort contribuye a la reduccion del impacto ambiental promoviendo practicas de reciclaje adecuadas y la disposicion correcta de residuos peligrosos. Al facilitar el acceso a informacion tecnica especializada, la plataforma ayuda a prevenir la contaminacion del suelo, agua y aire causada por el manejo inadecuado de desechos.</p>
    <p>El proyecto tambien fomenta la economia circular al recomendar metodos de reciclaje y reutilizacion de materiales. Cada protocolo generado incluye sugerencias para reducir la cantidad de residuos que terminan en rellenos sanitarios, promoviendo un modelo mas sostenible para la industria peruana.</p>

    <h3>Seguridad de la informacion</h3>
    <p>EcoSort no almacena ningun dato personal ni registros de las consultas realizadas por los usuarios. La informacion ingresada en el simulador se envia directamente a la API de Gemini para su procesamiento y no se guarda en bases de datos propias ni de terceros.</p>
    <p>El proyecto no utiliza cookies de rastreo ni recopila informacion con fines publicitarios. La unica preferencia persistente es la aceptacion de la politica de privacidad, que se almacena localmente en el navegador del usuario mediante localStorage.</p>

    <h3>Arquitectura general</h3>
    <p>EcoSort sigue una arquitectura frontend pura, donde todo el procesamiento visual y la logica de presentacion ocurren en el navegador del usuario. El proyecto esta organizado en archivos HTML, SCSS compilado a CSS, y JavaScript modular para las diferentes funcionalidades como el simulador, los modales y el slider.</p>
    <p>La integracion con Gemini se realiza mediante peticiones a la API desde el frontend. No existe un backend propio, lo que simplifica la arquitectura y permite que el proyecto sea completamente autonomo y facil de desplegar en cualquier servidor web estatico.</p>

    <h3>Publico objetivo</h3>
    <p>EcoSort esta dirigido a empresas e industrias peruanas que generan residuos en sus procesos productivos y necesitan orientacion para su clasificacion y manejo adecuado. Tambien esta orientado a estudiantes y profesionales del area ambiental que buscan una herramienta de apoyo para sus actividades academicas y profesionales.</p>
    <p>El proyecto es especialmente util para municipalidades, plantas de reciclaje, empresas de transporte de residuos y organizaciones ambientales que requieren informacion tecnica rapida y confiable sobre el tratamiento de distintos tipos de desechos industriales.</p>

    <h3>Resultados esperados</h3>
    <p>Se espera que EcoSort facilite el acceso a informacion tecnica especializada sobre gestion de residuos, permitiendo a las empresas tomar decisiones informadas sobre el tratamiento de sus desechos. La plataforma busca reducir la brecha de conocimiento entre las pequenas y medianas empresas y las practicas ambientales adecuadas.</p>
    <p>A largo plazo, se espera que el proyecto contribuya a la concientizacion sobre la importancia del reciclaje industrial y fomente la adopcion de tecnologias digitales para la gestion ambiental en el Peru. Como proyecto academico, tambien busca servir como referencia para futuros desarrollos en el campo de la tecnologia aplicada a la sostenibilidad.</p>

    <h3>Conclusion</h3>
    <p>EcoSort demuestra como la inteligencia artificial y el desarrollo web pueden combinarse para crear soluciones practicas a problemas ambientales reales. La plataforma ofrece una herramienta accesible, gratuita y facil de usar que pone la tecnologia al servicio de la sostenibilidad industrial.</p>
    <p>Si bien EcoSort es un proyecto academico con fines educativos, su enfoque en la clasificacion tecnica de residuos y la generacion de protocolos ambientales demuestra el potencial de la tecnologia para contribuir a un futuro mas limpio y sostenible para la industria peruana y global.</p>
</article>
`;

// Contenido del modal de FAQ
const FAQ_CONTENT = `
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        Que es EcoSort?
    </button>
    <div class="faq-respuesta">
        <p>EcoSort es una plataforma web peruana que utiliza inteligencia artificial para ayudar a las empresas a clasificar y gestionar sus residuos industriales. Fue desarrollada como proyecto academico por estudiantes del Instituto de Educacion Superior Tecnologico Publico Argentina.</p>
        <p>La plataforma permite ingresar datos sobre los residuos generados y obtiene un protocolo ambiental personalizado con recomendaciones de almacenamiento, transporte, reciclaje y seguridad. Es una herramienta educativa y demostrativa que busca fomentar practicas sostenibles en la industria peruana.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        Quien puede utilizar EcoSort?
    </button>
    <div class="faq-respuesta">
        <p>EcoSort esta dirigido a empresas e industrias peruanas que generan residuos en sus procesos productivos y necesitan orientacion sobre su clasificacion y manejo adecuado. Tambien pueden utilizarlo estudiantes, docentes y profesionales del area ambiental que busquen una herramienta de apoyo.</p>
        <p>El uso de la plataforma es completamente gratuito y no requiere registro ni cuenta de usuario. Cualquier persona interesada en la gestion de residuos puede acceder al simulador desde cualquier dispositivo con conexion a internet.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        Como funciona Gemini?
    </button>
    <div class="faq-respuesta">
        <p>Gemini es el modelo de inteligencia artificial desarrollado por Google AI Studio que utiliza EcoSort para procesar la informacion ingresada por los usuarios. Cuando completas el formulario del simulador, los datos se envian a Gemini para su analisis y generacion del protocolo ambiental.</p>
        <p>Gemini analiza variables como el tipo de residuo, el nivel de toxicidad, el volumen aproximado y el sector industrial de la empresa. Con esta informacion, la IA genera recomendaciones precisas basadas en normativa ambiental peruana y buenas practicas internacionales de gestion de residuos.</p>
        <p>Es importante mencionar que Gemini solo procesa la informacion en el momento de la consulta. La API no almacena ni reutiliza los datos enviados, garantizando la privacidad de cada usuario.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        Que datos analiza el simulador?
    </button>
    <div class="faq-respuesta">
        <p>El simulador analiza cuatro datos principales ingresados por el usuario: el tipo de residuo (plastico, vidrio, metal, papel, organico, peligroso, textil o mixto), el nivel de toxicidad (bajo, medio o alto), el volumen aproximado en kilogramos y el sector industrial al que pertenece la empresa.</p>
        <p>Con estos datos, el sistema genera un protocolo completo que incluye la clasificacion del residuo, recomendaciones de almacenamiento seguro, sugerencias de transporte, metodos de reciclaje recomendados y medidas de seguridad industrial. Cada protocolo es unico y se adapta a las caracteristicas especificas del residuo analizado.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        La informacion queda almacenada?
    </button>
    <div class="faq-respuesta">
        <p>No. EcoSort no almacena ningun dato personal ni registros de las consultas realizadas en el simulador. La informacion que ingresas se envia directamente a la API de Gemini para su procesamiento y no se guarda en bases de datos propias ni de terceros.</p>
        <p>La unica informacion que se almacena localmente en tu navegador es la preferencia de privacidad (aceptacion o rechazo de la politica de privacidad), utilizando la funcionalidad de localStorage del navegador. Esto evita que el modal de privacidad se muestre cada vez que ingresas a la pagina.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        Que tipo de residuos analiza?
    </button>
    <div class="faq-respuesta">
        <p>EcoSort analiza ocho categorias principales de residuos industriales: plasticos, vidrio, metal, papel y carton, organicos, peligrosos, textiles y mixtos. Cada categoria recibe un tratamiento especifico segun sus caracteristicas y requerimientos de manejo.</p>
        <p>Ademas del tipo de residuo, puedes especificar el nivel de toxicidad (bajo, medio o alto) y el volumen aproximado para obtener recomendaciones mas precisas. El sistema tambien considera el sector industrial de la empresa para ajustar las sugerencias a la normativa sectorial aplicable.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        El sistema reemplaza a un especialista?
    </button>
    <div class="faq-respuesta">
        <p>No. EcoSort es una herramienta academica y demostrativa que no reemplaza la evaluacion de un especialista ambiental certificado. Los protocolos generados por el simulador tienen fines educativos y orientativos, pero no constituyen asesoria profesional ni tienen validez legal.</p>
        <p>Si tu empresa requiere una evaluacion tecnica formal para el manejo de residuos peligrosos o de alto volumen, te recomendamos consultar con un ingeniero ambiental o una empresa especializada en gestion de residuos. EcoSort puede servir como punto de partida, pero no como sustituto de una evaluacion profesional certificada.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        Puede usarse desde cualquier navegador?
    </button>
    <div class="faq-respuesta">
        <p>Si, EcoSort esta disenado para funcionar en los navegadores web modernos mas utilizados: Google Chrome, Mozilla Firefox, Microsoft Edge y Safari. La plataforma utiliza tecnologias web estandar (HTML5, CSS3 y JavaScript) que son compatibles con todos los navegadores actualizados.</p>
        <p>Ademas, el sitio es completamente responsive, lo que significa que se adapta automaticamente al tamano de la pantalla del dispositivo. Puedes utilizar EcoSort desde tu computadora de escritorio, laptop, tablet o telefono movil sin perder funcionalidad ni calidad visual.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        Como mejora el reciclaje?
    </button>
    <div class="faq-respuesta">
        <p>EcoSort mejora el reciclaje al proporcionar informacion tecnica clara y accesible sobre como clasificar y tratar cada tipo de residuo. Al conocer las caracteristicas de sus desechos, las empresas pueden separarlos correctamente y enviarlos a las plantas de reciclaje adecuadas.</p>
        <p>La plataforma tambien recomienda rutas de reciclaje optimizadas y puntos de acopio cercanos, reduciendo los costos logisticos y el impacto ambiental del transporte. Al facilitar el acceso a esta informacion, EcoSort contribuye a que mas residuos sean reciclados correctamente en lugar de terminar en rellenos sanitarios o vertederos informales.</p>
    </div>
</div>
<div class="faq-item">
    <button class="faq-pregunta" onclick="toggleFAQ(this)">
        <span class="faq-icono">&#9654;</span>
        Que beneficios ofrece?
    </button>
    <div class="faq-respuesta">
        <p>EcoSort ofrece multiples beneficios: es gratuito, no requiere registro y esta disponible 24/7 desde cualquier dispositivo con internet. Proporciona protocolos ambientales personalizados generados por inteligencia artificial, ayudando a las empresas a tomar decisiones informadas sobre el manejo de sus residuos.</p>
        <p>Entre los beneficios adicionales se incluyen la reduccion de riesgos ambientales, el cumplimiento de normativas peruanas de gestion de residuos, la optimizacion de costos operativos y la contribucion a practicas mas sostenibles. Ademas, al ser un proyecto academico, el codigo y la documentacion estan disponibles para fines educativos y de referencia.</p>
    </div>
</div>
`;

// Contenido del modal de Politica de Privacidad
const PRIVACIDAD_CONTENT = `
<article>
    <h3>Informacion recopilada</h3>
    <p>EcoSort no recopila, almacena ni comparte datos personales reales de los usuarios. La plataforma funciona sin necesidad de registro ni creacion de cuentas, por lo que no solicitamos nombres, correos electronicos, numeros de telefono ni ninguna otra informacion personal identificable.</p>
    <p>Los unicos datos que se procesan son aquellos que ingresas voluntariamente en el simulador: tipo de residuo, nivel de toxicidad, volumen aproximado y sector industrial. Esta informacion se utiliza exclusivamente para generar el protocolo ambiental y no se almacena en ningun servidor.</p>

    <h3>Uso de los datos</h3>
    <p>La informacion ingresada en el simulador se envia a la API de Gemini (Google AI Studio) unicamente para su procesamiento y generacion del protocolo de disposicion. Una vez generado el resultado, los datos no son almacenados ni reutilizados por el sistema ni por terceros.</p>
    <p>EcoSort utiliza exclusivamente los datos para el proposito inmediato de generar recomendaciones tecnicas de manejo de residuos. No se realiza ningun tipo de analisis estadistico, perfilamiento de usuarios ni transferencia de informacion a otras plataformas o servicios.</p>

    <h3>Proteccion de la informacion</h3>
    <p>Dado que EcoSort no almacena datos personales ni registros de consultas, no existe riesgo de filtracion o acceso no autorizado a informacion de usuarios. La comunicacion con la API de Gemini se realiza mediante conexiones seguras (HTTPS), garantizando que los datos transmitidos esten protegidos durante el envio.</p>
    <p>El proyecto sigue practicas estandar de seguridad en el desarrollo web, incluyendo la validacion de datos del lado del cliente y el uso de protocolos seguros para todas las comunicaciones externas. No se utilizan bases de datos ni sistemas de almacenamiento persistente en el servidor.</p>

    <h3>Cookies</h3>
    <p>EcoSort no utiliza cookies de rastreo, publicitarias ni de terceros. La plataforma no recopila informacion sobre tu comportamiento de navegacion ni comparte datos con anunciantes o servicios de analitica externos.</p>
    <p>La unica tecnologia de almacenamiento local que utilizamos es localStorage del navegador, exclusivamente para guardar tu preferencia sobre la aceptacion de esta politica de privacidad. Esta informacion permanece en tu dispositivo y puedes eliminarla en cualquier momento desde la configuracion de tu navegador.</p>

    <h3>Responsabilidad del usuario</h3>
    <p>Al utilizar EcoSort, el usuario acepta que la plataforma es una herramienta academica y demostrativa, y que los protocolos generados no constituyen asesoria profesional certificada. El usuario es responsable del uso que de a la informacion proporcionada por el simulador.</p>
    <p>Se recomienda no ingresar informacion confidencial o sensible en el simulador, ya que esta se transmite a la API de Gemini para su procesamiento. El proyecto no se hace responsable por decisiones tomadas basandose exclusivamente en los resultados generados por la plataforma.</p>

    <h3>Conservacion de datos</h3>
    <p>EcoSort no conserva ningun dato de las consultas realizadas por los usuarios. Una vez que cierras el navegador o abandonas la pagina, no queda ningun registro de la informacion que ingresaste en el simulador en ningun servidor propio o de terceros.</p>
    <p>La unica informacion persistente es la preferencia de privacidad almacenada en el localStorage de tu navegador. Puedes eliminar esta preferencia en cualquier momento desde la configuracion de privacidad de tu navegador o simplemente borrando los datos del sitio.</p>

    <h3>Derechos del usuario</h3>
    <p>Como usuario de EcoSort, tienes derecho a utilizar la plataforma de forma anonima, sin proporcionar ningun dato personal. Puedes acceder al simulador, leer la documentacion y consultar las preguntas frecuentes sin ningun tipo de registro o identificacion.</p>
    <p>Tienes derecho a rechazar esta politica de privacidad sin que esto afecte tu experiencia en el sitio. Si rechazas la politica, el modal de privacidad seguira mostrandose en tus proximas visitas, pero podras seguir utilizando todas las funcionalidades de la plataforma sin restricciones.</p>

    <h3>Cambios en la politica</h3>
    <p>Esta politica de privacidad puede ser actualizada en cualquier momento para reflejar cambios en el funcionamiento de la plataforma o para ajustarse a nuevas regulaciones. Se recomienda a los usuarios revisar periodicamente esta seccion para mantenerse informados sobre como se protege su informacion.</p>
    <p>Los cambios en la politica se reflejaran directamente en el contenido del modal de privacidad. Al continuar utilizando EcoSort despues de una actualizacion, aceptas los terminos de la politica vigente.</p>

    <h3>Contacto</h3>
    <p>EcoSort es un proyecto academico desarrollado por estudiantes del Instituto de Educacion Superior Tecnologico Publico Argentina. Si tienes preguntas, comentarios o sugerencias sobre esta politica de privacidad o sobre el funcionamiento de la plataforma, puedes contactarnos a traves del formulario de contacto disponible en el sitio web.</p>
    <p>Tambien puedes escribirnos al correo electronico info@ecosort.ai para consultas relacionadas con el proyecto. Agradecemos tus comentarios, ya que nos ayudan a mejorar continuamente la plataforma y a garantizar una experiencia segura y transparente para todos los usuarios.</p>
</article>
`;

// Contenido de cada modal
const MODAL_DATA = {
    documentacion: {
        titulo: "Documentacion",
        bodyHTML: DOC_CONTENT,
        footerHTML: '<button class="btn-primary modal-cerrar-btn">Entendido</button>'
    },
    faq: {
        titulo: "Preguntas Frecuentes",
        bodyHTML: FAQ_CONTENT,
        footerHTML: '<button class="btn-primary modal-cerrar-btn">Entendido</button>'
    },
    privacidad: {
        titulo: "Politica de Privacidad",
        bodyHTML: PRIVACIDAD_CONTENT,
        footerHTML: '<button class="btn-primary" id="privacidad-aceptar">Aceptar</button> <button class="btn-outline" id="privacidad-rechazar">Rechazar</button>'
    }
};

// Crea el HTML del modal y lo inyecta en el body
function crearModal() {
    if (document.getElementById("modal-overlay")) return;

    const div = document.createElement("div");
    div.className = "modal-overlay";
    div.id = "modal-overlay";
    div.innerHTML = `
        <div class="modal-window">
            <article>
                <div class="modal-header">
                    <h2 id="modal-titulo"></h2>
                    <button class="modal-cerrar" id="modal-cerrar">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-scroll" id="modal-contenido"></div>
                </div>
                <div class="modal-footer" id="modal-footer"></div>
            </article>
        </div>
    `;
    document.body.appendChild(div);

    // Evento: boton X
    document.getElementById("modal-cerrar").addEventListener("click", cerrarModal);

    // Evento: cerrar al hacer clic fuera del modal
    document.getElementById("modal-overlay").addEventListener("click", function (e) {
        if (e.target === this) cerrarModal();
    });

    // Evento: cerrar con Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") cerrarModal();
    });
}

// Abre un modal con el contenido indicado
function abrirModal(modalName) {
    crearModal();

    const data = MODAL_DATA[modalName];
    if (!data) return;

    document.getElementById("modal-overlay").classList.add("visible");
    document.getElementById("modal-titulo").textContent = data.titulo;
    document.getElementById("modal-contenido").innerHTML = data.bodyHTML;
    document.getElementById("modal-footer").innerHTML = data.footerHTML;
    document.body.style.overflow = "hidden";

    // Boton cerrar del footer
    const cerrarBtns = document.querySelectorAll(".modal-cerrar-btn");
    cerrarBtns.forEach(function (btn) {
        btn.addEventListener("click", cerrarModal);
    });

    // Privacidad: botones aceptar/rechazar
    const btnAceptar = document.getElementById("privacidad-aceptar");
    const btnRechazar = document.getElementById("privacidad-rechazar");
    if (btnAceptar) {
        btnAceptar.addEventListener("click", function () {
            localStorage.setItem("privacidad-aceptada", "true");
            cerrarModal();
        });
    }
    if (btnRechazar) {
        btnRechazar.addEventListener("click", function () {
            localStorage.setItem("privacidad-aceptada", "false");
            cerrarModal();
        });
    }
}

// Cierra el modal activo
function cerrarModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.remove("visible");
    document.body.style.overflow = "";
}

// Alterna la visibilidad de una respuesta del FAQ
function toggleFAQ(boton) {
    const respuesta = boton.nextElementSibling;
    const activa = boton.classList.contains("faq-activa");

    // Cierra todas las respuestas abiertas
    document.querySelectorAll(".faq-pregunta.faq-activa").forEach(function (btn) {
        if (btn !== boton) {
            btn.classList.remove("faq-activa");
            btn.nextElementSibling.classList.remove("faq-abierta");
        }
    });

    // Alterna la actual
    if (activa) {
        boton.classList.remove("faq-activa");
        respuesta.classList.remove("faq-abierta");
    } else {
        boton.classList.add("faq-activa");
        respuesta.classList.add("faq-abierta");
    }
}

// Inicializa los triggers del footer
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".modal-trigger").forEach(function (enlace) {
        enlace.addEventListener("click", function (e) {
            e.preventDefault();
            const modal = this.getAttribute("data-modal");
            if (modal) abrirModal(modal);
        });
    });
});
