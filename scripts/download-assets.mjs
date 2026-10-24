import fs from 'node:fs/promises';
const assets=JSON.parse(await fs.readFile('design/assets.json','utf8'));
for (const asset of assets) {
  const response=await fetch(asset.url);
  if(!response.ok) throw new Error(`Asset failed: ${response.status}`);
  await fs.writeFile(asset.file,Buffer.from(await response.arrayBuffer()));
  console.log(asset.file);
}
const icons=JSON.parse(await fs.readFile('design/icons.json','utf8'));
for(const icon of ['home','favorite','person','storefront','mail','pets','gavel','shield','account_balance','volunteer_activism']) if(!icons.includes(icon)) icons.push(icon);
const cssUrl='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&icon_names='+icons.sort().join(',')+'&display=block';
const css=await (await fetch(cssUrl,{headers:{'User-Agent':'Mozilla/5.0'}})).text();
const url=css.match(/url\((https:[^)]+)\)/)?.[1];
if(!url) throw new Error('Font download failed: '+css);
const font=await fetch(url);
await fs.writeFile('public/fonts/material-symbols.woff2',Buffer.from(await font.arrayBuffer()));
console.log('Local icon font saved');
