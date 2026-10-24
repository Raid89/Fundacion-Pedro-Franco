import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
const routes=['/','/nuestra-mision/','/transparencia/','/proyectos-contacto/'];
const documents=new Map();
const titles=new Set();
for(const route of routes) {
  const html=await fs.readFile(path.join('dist',route,'index.html'),'utf8');
  const $=load(html);documents.set(route,$);
  assert.equal($('h1').length,1,`${route}: one H1`);
  assert.equal($('main').length,1,`${route}: one main`);
  assert.equal($('html').attr('lang'),'es-CO');
  assert.equal($('link[rel=canonical]').attr('href'),`https://fundacionpedrofranco.com${route}`);
  assert.ok($('meta[name=description]').attr('content').length>60);
  assert.ok(!titles.has($('title').text()),'Unique page titles');titles.add($('title').text());
  assert.equal($('meta[property="og:image"]').attr('content'),'https://fundacionpedrofranco.com/og-cover.jpg');
  JSON.parse($('script[type="application/ld+json"]').text());
  assert.equal($('[onclick],[onsubmit]').length,0,'No prototype handlers');
  assert.equal($('a[href="#"]').length,0,'No placeholder links');
  $('img').each((_,img)=>{assert.ok($(img).attr('alt'));assert.ok($(img).attr('width'));assert.ok($(img).attr('height'));assert.ok($(img).attr('srcset'));});
  assert.ok(!html.includes('cdn.tailwindcss.com'));
  assert.ok(!html.includes('fonts.googleapis.com'));
  assert.ok(!html.includes('lh3.googleusercontent.com'));
}
for(const [route,$] of documents) {
  for(const a of $('a[href]').toArray()) {
    const href=$(a).attr('href');if(!href.startsWith('/')&&!href.startsWith('#'))continue;
    const url=new URL(href,`https://fundacionpedrofranco.com${route}`);
    const target=documents.get(url.pathname);assert.ok(target,`Missing route ${href}`);
    if(url.hash)assert.ok(target(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).length,`Missing anchor ${href}`);
  }
}
const sitemap=await fs.readFile('dist/sitemap-0.xml','utf8');
for(const route of routes)assert.ok(sitemap.includes(`https://fundacionpedrofranco.com${route}`));
assert.ok(!sitemap.includes('404'));
assert.ok((await fs.readFile('dist/robots.txt','utf8')).includes('https://fundacionpedrofranco.com/sitemap-index.xml'));
await fs.access('dist/og-cover.jpg');
console.log('4 routes passed: SEO, metadata, sitemap, local assets, responsive images and all internal links.');
