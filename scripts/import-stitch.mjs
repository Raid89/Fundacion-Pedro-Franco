// One-time conversion of the original Stitch exports. Sources stay in design/stitch.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { load } from 'cheerio';

const pages = [
  ['index', 'e8f0d0f1b8834b7e89d0d3a3bdf5cdf9', 'Inicio', 'Rescate y bienestar felino en Medellín', 'Conoce la Fundación Pedro Franco, nuestra labor de rescate, atención veterinaria y adopción responsable de gatos en Medellín y el Valle de Aburrá.'],
  ['nuestra-mision', '9fd3ff58a46d49a9aeb29ba6828eb473', 'Nuestra Misión', 'Nuestra misión y labor con gatos', 'Conoce nuestras siete áreas de trabajo: rescate, rehabilitación veterinaria, adopción responsable, hogares de paso y educación para el bienestar animal.'],
  ['transparencia', '8f50ab14c7674a2782ef8c56fdc6f13a', 'Transparencia DIAN', 'Transparencia y Registro Web DIAN', 'Consulta la información institucional, el balance inicial, los documentos de la Fundación Pedro Franco y el estado del trámite ante la DIAN.'],
  ['proyectos-contacto', 'bf18c06891a6421881f9203374a92361', 'Proyectos y Contacto', 'Proyectos y contacto institucional', 'Conoce los proyectos futuros y la gobernanza de la Fundación Pedro Franco. Contáctanos para adopciones, hogares de paso, donaciones y solicitudes.'],
];
const routes = {inicio:'/', 'nuestra-mision':'/nuestra-mision/', 'mision-areas':'/nuestra-mision/', 'transparencia-dian':'/transparencia/', 'proyectos-futuros':'/proyectos-contacto/#proyectos', 'proyectos-cat-cafe':'/proyectos-contacto/#proyectos', 'contacto-institucional':'/proyectos-contacto/#contacto', 'contacto-legal':'/proyectos-contacto/#gobernanza', 'vincularse-ayudar':'/proyectos-contacto/#contacto', 'habeas-data':'/proyectos-contacto/#proteccion-datos', 'bienestar-animal':'/proyectos-contacto/#marco-legal', 'protocolo-adopcion':'/nuestra-mision/#adopciones'};
for (const dir of ['src/pages','src/components','src/layouts','src/styles','src/assets','public/fonts']) await fs.mkdir(dir,{recursive:true});
const assets=[]; const icons=new Set();
for (const [route,id,label,title,description] of pages) {
  const original=await fs.readFile(`design/stitch/${id}.html`,'utf8');
  const $=load(original);
  if(route==='index') {
    const context={tailwind:{}};
    vm.runInNewContext($('#tailwind-config').text(),context);
    const config=context.tailwind.config;
    config.content=['./src/**/*.{astro,html,js,ts}'];
    for (const [key,value] of Object.entries(config.theme.extend.fontFamily)) config.theme.extend.fontFamily[key]=[value[0]+' Variable',value[0].includes('Playfair')?'Georgia':'sans-serif'];
    await fs.writeFile('tailwind.config.cjs','module.exports = '+JSON.stringify(config,null,2)+';\n');
  }
  $('script').remove(); $('[onclick],[onsubmit]').removeAttr('onclick').removeAttr('onsubmit');
  $('[data-path]').each((_,el)=>{const a=$(el); a.attr('href',routes[a.attr('data-path')]||'/proyectos-contacto/#contacto'); a.removeAttr('data-path');});
  $('span.material-symbols-outlined').each((_,el)=>{const e=$(el);icons.add(e.text().trim());e.attr('aria-hidden','true');});
  $('main').attr('id','contenido').removeClass('pt-20');
  $('main').addClass('page-content '+route);
  let imports="import Layout from '../layouts/Layout.astro';\nimport { Image } from 'astro:assets';\n";
  $('main img').each((index,el)=>{
    const e=$(el), source=e.attr('src'); const name=`${route}-${index}`;
    assets.push({url:source,file:`src/assets/${name}.jpg`});
    const alt=route==='index'?'Gato rescatado descansando durante su recuperación':route==='transparencia'?'Atención veterinaria de un gato rescatado':'Cuidado y recuperación de gatos rescatados';
    imports+=`import image${index} from '../assets/${name}.jpg';\n`;
    const priority=route==='index'&&index===0;
    e.replaceWith(`<Image src={image${index}} alt="${alt}" class="${e.attr('class')||''}" widths={[400, 800, 1200]} sizes="(max-width: 767px) 100vw, 50vw" format="webp" quality={80} loading="${priority?'eager':'lazy'}" ${priority?'fetchpriority="high"':''} decoding="async" />`);
  });
  if (route==='index') {
    $('main section').first().addClass('home-hero');
    $('main h2').filter((_,e)=>$(e).text().includes('Simón')).closest('.absolute').addClass('recovery-dossier');
    $('main .grid.grid-cols-3').first().addClass('hero-metrics');
    $('main section').last().attr('id','ayudar');
  }
  if(route==='nuestra-mision') {
    const heading=$('h3').filter((_,e)=>$(e).text().includes('Adopciones Responsables'));heading.attr('id','adopciones');
    $('main h3').each((i,e)=>{const card=$(e).closest('.col-span-12');card.attr('data-program', [3,6].includes(i)?'planned':'active');});
    const heading2=$('h2').filter((_,e)=>$(e).text().includes('Ejes Clave'));
    heading2.parent().parent().after('<div class="program-filters" aria-label="Filtrar áreas de trabajo"><button type="button" data-filter="all" aria-pressed="true">Todos (7)</button><button type="button" data-filter="active" aria-pressed="false">Activos hoy (5)</button><button type="button" data-filter="planned" aria-pressed="false">Estatutarios (2)</button></div><p class="sr-only" role="status" id="filter-status"></p>');
  }
  if(route==='transparencia') {
    $('main button').each((_,e)=>{
      const b=$(e); if(!b.text().includes('Descargar')&&!b.find('.material-symbols-outlined').length) return;
      const doc=b.closest('.group').find('h3').text()||b.parent().parent().find('h3').text()||'Documento institucional';
      b.replaceWith(`<a class="${b.attr('class')}" href="mailto:fundacionpedrofranco@gmail.com?subject=${encodeURIComponent('Solicitud: '+doc.trim())}" aria-label="Solicitar ${doc.trim()}"><span class="material-symbols-outlined" aria-hidden="true">mail</span>Solicitar PDF</a>`);
    });
    $('main h2').filter((_,e)=>$(e).text().includes('Repositorio')).after('<p class="document-note">Puedes solicitar los documentos al correo institucional. Las descargas estarán disponibles cuando se publiquen los archivos oficiales.</p>');
  }
  if(route==='proyectos-contacto') {
    $('main section').first().replaceWith(`<section id="proyectos" class="project-intro max-w-[1320px] mx-auto px-margin py-space-xl w-full"><span class="eyebrow">Proyección estatutaria · En formulación</span><h1 class="font-display-lg text-display-lg text-primary">Proyectos y contacto institucional</h1><div class="project-card"><span class="material-symbols-outlined" aria-hidden="true">storefront</span><div><h2 class="font-headline-md text-headline-md text-primary">Cat Café Comunitario &amp; Centro de Bienestar</h2><p>Actividad complementaria prevista estatutariamente en los objetivos fundacionales. Actualmente en fase de diseño técnico y viabilidad arquitectónica, con el propósito de crear un espacio de interacción respetuosa, adopciones inmersivas y autosostenibilidad institucional.</p><span class="project-state">Fase proyectada · En formulación</span></div></div><nav class="section-nav" aria-label="Secciones de proyectos y contacto"><a href="#proyectos">Cat Café</a><a href="#gobernanza">Gobernanza</a><a href="#contacto">Contacto</a></nav></section>`);
    $('main section').eq(1).attr('id','gobernanza'); $('main section').eq(2).attr('id','contacto');
    $('h3').filter((_,e)=>$(e).text().includes('Fundamentación')).attr('id','marco-legal');
    $('main input, main textarea, main select').each((_,e)=>$(e).attr('name',$(e).attr('id')));
    $('#nombre').attr('autocomplete','name').attr('maxlength','150'); $('#correo').attr('autocomplete','email').attr('maxlength','254'); $('#detalles').attr('maxlength','4000');
    $('#form-success').remove(); $('#form-status').remove();
    $('form').attr('action','mailto:fundacionpedrofranco@gmail.com').attr('method','post').attr('enctype','text/plain');
    $('form button[type=submit] span').last().text('Preparar correo');
    $('form').prepend('<p class="font-body-sm text-body-sm">Este formulario prepara un mensaje en tu aplicación de correo. Revisa su contenido y envíalo desde allí.</p>');
    $('form').append('<p id="contact-status" role="status" class="font-body-sm text-body-sm"></p><noscript><p>Puedes escribir directamente a <a href="mailto:fundacionpedrofranco@gmail.com">fundacionpedrofranco@gmail.com</a>.</p></noscript>');
    $('label[for="habeas-data"]').attr('id','proteccion-datos').html('Autorizo el uso de mis datos para responder esta solicitud, conforme a la Ley 1581 de 2012.');
  }
  let main=$('main').toString();
  // Cheerio serializes custom elements as HTML; restore Astro component expressions.
  main=main.replace(/<image\b([\s\S]*?)><\/image>/g,'<Image$1 />').replace(/src="\{(image\d+)\}"/g,'src={$1}').replace(/widths="\{\[400," 800,="" 1200\]}=""/g,'widths={[400, 800, 1200]}').replace(/quality="\{80\}"/g,'quality={80}');
  main=main.replace(/<!--[^]*?-->/g,'').replace(/<input([^>]*?)(?<!\/)>(?!<\/input>)/g,'<input$1 />').replace(/<br>/g,'<br />');
  await fs.writeFile(`src/pages/${route}.astro`,`---\n${imports}---\n<Layout title="${title}" description="${description}" label="${label}">\n${main}\n</Layout>\n${['nuestra-mision','proyectos-contacto'].includes(route)?'<script>import "../scripts/interactions";</script>':''}`);
  if(route==='index') {
    let footer=$('footer').toString().replace('© 2025','© 2026').replace('Especial Tributario (RTE - DIAN)','Solicitud RTE en trámite ante la DIAN');
    await fs.writeFile('src/components/Footer.astro',footer);
  }
}
await fs.writeFile('design/assets.json',JSON.stringify(assets,null,2));
await fs.writeFile('design/icons.json',JSON.stringify([...icons].sort()));
