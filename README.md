# Fundación Pedro Franco

Sitio institucional construido con Astro y exportación estática. Los ocho diseños de Google Stitch (cuatro móviles y cuatro de escritorio) se implementan como cuatro páginas responsive con una sola estructura de contenido por ruta.

## Desarrollo

Requiere Node.js 22.22 o superior. Validado con Node 24.

```sh
npm ci
npm run dev
```

## Páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio, rescate y formas de apoyo |
| `/nuestra-mision/` | Siete áreas, filtros y hogares de paso |
| `/transparencia/` | Información institucional, balance, documentos y DIAN |
| `/proyectos-contacto/` | Proyecto Cat Café, gobernanza y contacto |

Anclas de contacto: `#proyectos`, `#gobernanza`, `#contacto`, `#proteccion-datos` y `#marco-legal`.

## Construcción y validación

```sh
npm run check
npm run build
npm run test:site
npm run preview -- --port 4321
node scripts/browser-check.mjs
node scripts/lighthouse.mjs
```

Las pruebas de navegador usan Chromium en `/usr/bin/chromium`; se puede cambiar con `CHROME_BIN`. Los informes y las capturas se guardan en `test-results/`. El chequeo estático valida las cuatro rutas, metadatos, enlaces y anclas, sitemap, imágenes y recursos locales. Las pruebas de navegador verifican 390 y 1440 px, filtros, validación del formulario, ausencia de desbordamiento y auditoría automática de accesibilidad.

La salida desplegable está en `dist/`. Se puede alojar en cualquier servidor estático, sin proceso Node en producción. Configurar HTTPS, redirección del dominio alternativo hacia `https://fundacionpedrofranco.com`, página 404 y compresión Brotli/Gzip. Para los archivos con hash en `/_astro/`, usar `Cache-Control: public, max-age=31536000, immutable`; para HTML, permitir revalidación. No se ha desplegado el sitio.

## SEO y rendimiento

- Dominio canónico: `https://fundacionpedrofranco.com`, configurable con `SITE_URL` al compilar.
- HTML prerenderizado, un H1 por página, títulos y descripciones únicos, canonical, Open Graph y Twitter Card.
- JSON-LD de Organization, WebSite y WebPage; `robots.txt`, sitemap y 404 con noindex.
- Fuentes variables locales con `font-display: swap` y precarga de los dos archivos latinos principales.
- Imágenes WebP generadas por Astro, variantes responsive, dimensiones explícitas, carga diferida y prioridad para la imagen principal.
- CSS compilado con Tailwind 4. Sin Tailwind CDN, scripts de terceros, frameworks hidratados ni conexiones a Google durante la navegación.
- JavaScript únicamente para filtros y preparación del correo; toda la información y navegación básica funcionan sin JavaScript.
- Se preservan colores y jerarquía de Stitch, con ajustes de contraste, espaciado responsive y foco de teclado.

## Contacto y documentos

El formulario **prepara un correo** dirigido a `fundacionpedrofranco@gmail.com`; la persona debe enviarlo desde su aplicación de correo. No hay backend de recepción, almacenamiento ni confirmación de entrega. Si no hay cliente de correo configurado, permanece visible la dirección y el contenido del formulario.

Stitch incluía descargas simuladas con `alert()` y confirmaciones de envío mediante temporizador. Se reemplazaron por solicitudes de documentos vía correo y mensajes veraces. Cuando estén disponibles los PDF oficiales, se deben añadir a `public/documentos/` y reemplazar los enlaces de solicitud en `src/pages/transparencia.astro`. La calificación RTE se presenta como un trámite en curso.

El diseño de proyectos tenía vacía la sección Cat Café; se completó con el texto del mismo proyecto presente en la pantalla de inicio. Las cifras, nombres y textos institucionales proceden de las referencias suministradas; esta implementación no acredita ni verifica documentos legales.

## Organización

- `src/pages/`: páginas editables.
- `src/layouts/Layout.astro`: metadatos y estructura común.
- `src/components/`: cabecera, pie y navegación móvil.
- `src/styles/global.css`: estilos y adaptación responsive.
- `src/scripts/interactions.ts`: filtros y contacto.
- `src/assets/`: imágenes originales optimizadas al compilar.
- `design/stitch/`: exportaciones de referencia de las ocho pantallas.
- `scripts/import-stitch.mjs`: conversión inicial archivada; **no volver a ejecutarla sobre el sitio**, porque las páginas ya incluyen ajustes posteriores.

Las mediciones Lighthouse son pruebas de laboratorio locales, no métricas de usuarios reales ni garantías del servidor de producción. Tras desplegar, revisar HTTPS, caché, redirecciones, indexación en Search Console y Core Web Vitals con tráfico real.
