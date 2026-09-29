import puppeteer from '/Users/nino/Workspace/dev/tools/browse-tool/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
import {writeFile} from 'node:fs/promises';
const browser = await puppeteer.launch({executablePath:'/Users/nino/.browse-tool/chrome/chrome/mac_arm-152.0.7977.42/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',headless:true});
try {
 const page=await browser.newPage();
 const results=[];
 for(const [name,width] of [['desktop',1280],['mobile',390]]) {
  await page.setViewport({width,height:900,deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:8580/blog/trying-to-teach-an-ai-how-i-edit-photos',{waitUntil:'networkidle0'});
  const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,title:document.querySelector('h1')?.textContent,closing:document.body.innerText.includes('That retrospective happened because I asked for it.'),images:[...document.querySelectorAll('img')].filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src)}));
  if(state.scrollWidth>width||!state.closing||state.images.length||state.height>16000) throw new Error(JSON.stringify(state));
  await page.screenshot({path:new URL(`${name}.png`,import.meta.url).pathname,fullPage:true});results.push({name,...state});
 }
 await writeFile(new URL('render-check.json',import.meta.url),JSON.stringify(results,null,2)+'\n');console.log(results);
} finally {await browser.close();}
