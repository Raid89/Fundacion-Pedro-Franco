# Validación local — 21 de octubre de 2026

Astro 7.4.2, salida estática de producción. Lighthouse móvil sobre localhost con Chromium. No equivale a mediciones del dominio desplegado.

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| / | 100 | 100 | 100 | 100 | 1.8 s | 0 |
| /nuestra-mision/ | 100 | 100 | 100 | 100 | 1.8 s | 0 |
| /transparencia/ | 100 | 100 | 100 | 100 | 1.5 s | 0 |
| /proyectos-contacto/ | 100 | 100 | 100 | 100 | 1.7 s | 0 |

- Build y Astro Check: correctos, sin errores, advertencias ni sugerencias.
- Cuatro rutas: metadatos, sitemap, robots, imágenes y enlaces internos correctos.
- Ocho vistas (390 y 1440 px): sin desbordamientos, imágenes rotas, errores JavaScript ni infracciones automáticas WCAG A/AA detectadas.
- Filtros: 7 áreas totales, 5 activas y 2 estatutarias; cambio y restauración correctos.
- Formulario: campos obligatorios y consentimiento; la prueba de navegador simula una respuesta correcta de `/api/contact` y comprueba confirmación y limpieza. La entrega real requiere las variables de Vercel y Resend configuradas.
- npm audit al instalar las dependencias finales: 0 vulnerabilidades.
- Capturas y reportes JSON detallados: test-results/ (ignorados por Git).
- JavaScript de interacción: 1.131 bytes más un módulo de entrada de 35 bytes por página interactiva, antes de compresión.

La comparación visual conserva el diseño de escritorio y adapta los contenidos al móvil; no se afirma equivalencia pixel por pixel. Se ajustaron contraste y jerarquía de encabezados. Los PDF oficiales no forman parte de los recursos recibidos; sus solicitudes usan el correo institucional.
