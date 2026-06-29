# README — Arquitectura SCSS de EcoSort

## ¿Cómo se organiza el código de estilos?

El proyecto utiliza **SCSS** (Sass) para escribir los estilos de forma más ordenada y reutilizable. El archivo `scss/main.scss` importa todos los módulos y se compila en `css/main.css`, que es el archivo que los navegadores leen realmente.

## Estructura de carpetas

```
scss/
├── main.scss              ← Archivo principal que importa todo
├── abstracts/
│   ├── _variables.scss    ← Variables de colores, fuentes, sombras, etc.
│   └── _mixins.scss       ← Mixins reutilizables (flexbox, sombras, etc.)
├── base/
│   ├── _reset.scss        ← Normaliza estilos entre navegadores
│   ├── _global.scss       ← Estilos globales: body, contenedores, tipografía
│   └── _animations.scss   ← Animaciones keyframe reutilizables
├── components/
│   ├── _buttons.scss      ← Botones (.btn-primary, .btn-outline)
│   ├── _forms.scss        ← Formularios, inputs, labels
│   └── _modals.scss       ← Ventanas modales y acordeón FAQ
├── layout/
│   ├── _header.scss       ← Barra de navegación superior y menú móvil
│   ├── _hero.scss         ← Carrusel de diapositivas del inicio
│   └── _footer.scss       ← Pie de página con columnas y redes sociales
└── pages/
    ├── _home.scss         ← Página de inicio
    ├── _nosotros.scss     ← Página "Nosotros"
    ├── _servicios.scss    ← Página "Servicios"
    ├── _simulador.scss    ← Página del simulador
    ├── _contacto.scss     ← Página "Contacto"
    ├── _login.scss        ← Página de inicio de sesión
    └── _registro.scss     ← Página de registro
```

## Orden de importación en main.scss

El orden es importante porque SCSS compila en secuencia:

1. **Abstracts** — Variables y mixins (deben cargarse primero para que los demás archivos puedan usarlos)
2. **Base** — Reset y estilos globales
3. **Components** — Componentes reutilizables (botones, formularios, modales)
4. **Layout** — Estructura de página (header, hero, footer)
5. **Pages** — Estilos específicos de cada página

## ¿Dónde están las variables?

Todas las variables están en `scss/abstracts/_variables.scss`:
- `$verde`, `$verde-oscuro` — Colores principales de la marca
- `$azul-oscuro`, `$azul-claro`, `$azul-footer` — Colores de fondo
- `$gris`, `$gris-claro`, `$gris-medio`, `$gris-oscuro`, `$gris-texto` — Escala de grises
- `$icono-verde`, `$icono-cian`, `$icono-purpura`, `$icono-ambar` — Colores de iconos matrix
- `$fuente` — Tipografía del sistema
- `$contenedor` — Ancho máximo del contenido
- `$transicion` — Duración de transiciones
- `$z-header`, `$z-menu`, `$z-modal` — Capas de superposición

## ¿Dónde están los mixins?

Todos los mixins están en `scss/abstracts/_mixins.scss`:
- `flex-center` — Centrado con flexbox
- `section-spacing` — Padding responsivo para secciones
- `card-shadow` — Sombra y borde redondeado para tarjetas
- `responsive-breakpoint` — Media query personalizada
- `hero-video` — Posicionamiento de video de fondo
- `hero-overlay` — Capa semitransparente sobre video
- `dark-neon-glow` — Brillo neón para iconos en fondo oscuro
- `light-pastel-box` — Caja circular con color pastel para iconos

## ¿Qué página usa qué archivo?

| Página | Archivo SCSS |
|---|---|
| index.html | _home.scss, _hero.scss |
| nosotros.html | _nosotros.scss |
| servicios.html | _servicios.scss |
| simulador.html | _simulador.scss |
| contacto.html | _contacto.scss |
| login.html | _login.scss |
| registro.html | _registro.scss |

Los archivos compartidos (header, footer, botones, formularios, modales) se cargan en todas las páginas a través de main.scss.

## ¿Cómo compilar?

Con Sass instalado:

```bash
sass scss/main.scss css/main.css --style expanded --source-map
```

O en modo watch para que compile automáticamente al guardar:

```bash
sass --watch scss/main.scss:css/main.css --style expanded --source-map
```

## Notas importantes

- NO editar `css/main.css` directamente — se sobreescribe al compilar
- Los archivos que empiezan con `_` son parciales y no se compilan individualmente
- Las variables en español (`$verde`, `$texto`) siguen la nomenclatura del curso de Diseño Web
- Los mixins permiten reutilizar código sin duplicar propiedades
