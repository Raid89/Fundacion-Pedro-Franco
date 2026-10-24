import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'node:fs/promises';
const chrome=await launch({chromePath:process.env.CHROME_BIN||'/usr/bin/chromium',chromeFlags:['--headless','--no-sandbox']});
await fs.mkdir('test-results',{recursive:true});
try {
  for(const route of ['','nuestra-mision/','transparencia/','proyectos-contacto/']) {
    const result=await lighthouse(`http://localhost:4321/${route}`,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});
    await fs.writeFile(`test-results/lighthouse-${route.replace('/','')||'inicio'}.json`,result.report);
    console.log(JSON.stringify({route:'/'+route,scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),lcp:result.lhr.audits['largest-contentful-paint'].displayValue,cls:result.lhr.audits['cumulative-layout-shift'].displayValue,failed:Object.entries(result.lhr.audits).filter(([,v])=>v.score!==null&&v.score<.9&&v.scoreDisplayMode!=='informative').map(([k,v])=>({id:k,title:v.title,display:v.displayValue}))}));
  }
} finally { chrome.kill(); }
