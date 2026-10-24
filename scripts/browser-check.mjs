import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const routes = ['/', '/nuestra-mision/', '/transparencia/', '/proyectos-contacto/'];
const results = [];
await fs.mkdir('test-results', { recursive: true });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const route of routes) {
      const errors=[]; page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://localhost:4321${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        for(let y=0;y<document.documentElement.scrollHeight;y+=650) {
          scrollTo(0,y);
          await new Promise(resolve=>setTimeout(resolve,25));
        }
        scrollTo(0,0);
      });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `test-results/${route.split('/')[1] || 'inicio'}-${width}.png`, fullPage: true });
      const metrics=await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: document.querySelectorAll('h1').length,
        font: getComputedStyle(document.querySelector('h1')).fontFamily,
        color: getComputedStyle(document.querySelector('h1')).color,
        failedImages: [...document.images].filter(i=>i.complete && !i.naturalWidth).length,
        resources: performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.transferSize})),
      }));
      const accessibility=await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      results.push({route,width,...metrics,errors,violations:accessibility.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    }
    await context.close();
  }
  const page=await browser.newPage();
  await page.goto('http://localhost:4321/nuestra-mision/');
  await page.getByRole('button',{name:'Estatutarios (2)'}).click();
  const visible=await page.locator('[data-program]:visible').count();
  if(visible!==2) throw new Error(`Filter expected 2 programs; got ${visible}`);
  await page.getByRole('button',{name:'Todos (7)'}).click();
  if(await page.locator('[data-program]:visible').count()!==7) throw new Error('Filter reset failed');
  await page.route('**/api/contact', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
  await page.goto('http://localhost:4321/proyectos-contacto/');
  await page.locator('button[type=submit]').click();
  if(await page.locator('#contact-status').textContent()) throw new Error('Empty form accepted');
  await page.locator('#motivo').selectOption({index:1});
  await page.locator('#nombre').fill('Prueba local');
  await page.locator('#correo').fill('prueba@example.com');
  await page.locator('#detalles').fill('Comprobación local del formulario.');
  await page.locator('#habeas-data').check();
  await page.locator('button[type=submit]').click();
  await page.waitForFunction(() => document.querySelector('#contact-status')?.textContent?.includes('Solicitud enviada correctamente'));
  if(!(await page.locator('#contact-status').textContent()).includes('Solicitud enviada correctamente')) throw new Error('Contact success feedback missing');
  if(await page.locator('#nombre').inputValue()!=='') throw new Error('Form values were not cleared after a successful delivery');
  await fs.writeFile('test-results/browser.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results.map(({resources,...r})=>({...r,bytes:resources.reduce((a,r)=>a+r.bytes,0)})),null,2));
  if(results.some(r=>r.overflow||r.failedImages||r.errors.length||r.violations.length)) process.exitCode=1;
} finally { await browser.close(); }
