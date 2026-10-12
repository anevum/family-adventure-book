// Runs locally in GitHub Actions; never deploys the prototype or publishes demo data.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve('dist-showcase');
const qa=resolve('qa');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const header={
 'x-content-type-options':'nosniff',
 'referrer-policy':'no-referrer',
 'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'"
};
const server=createServer(async(req,res)=>{
 let file;
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  file=resolve(root,path==='/'?'index.html':path.slice(1));
  if(file!==root&&!file.startsWith(root+sep))throw Error('Traversal');
  const bytes=await readFile(file);
  res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream',...header});
  res.end(bytes);
 }catch{
  res.writeHead(404,header);res.end('Not found');
 }
});
await new Promise((ok,fail)=>server.once('error',fail).listen(0,'127.0.0.1',ok));
await mkdir(qa,{recursive:true});
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [width,height] of [[390,844],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[],unexpectedRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',q=>{
   if(q.url().startsWith('http')&&!q.url().startsWith(base))unexpectedRequests.push(q.url());
  });
  const response=await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200,'Homepage failed at '+width);
  await page.locator('#view-home.is-active').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('.anevum-demo-notice').count(),1,'Demo label missing');
  assert.ok((await page.locator('.anevum-demo-notice').innerText()).includes('Fictional'));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,'Page overflows at '+width+': '+overflow+'px');
  await page.screenshot({path:qa+'/evergrove-'+width+'-home.png',fullPage:true});
  // Private form controls are unavailable even though the family prototype has them.
  await page.locator('[data-modal="memory"]:visible').first().click();
  assert.ok(await page.locator('#modalBackdrop').isHidden(),'Private memory form opened');
  await page.locator('[data-navigate="quests"]:visible').first().click();
  await page.locator('#view-quests.is-active').waitFor({state:'visible',timeout:10000});
  const open=page.locator('#view-quests [data-quest-action]:visible').filter({hasText:'Open quest'}).first();
  assert.ok(await open.count()>0,'No playable quest');
  await open.click();
  await page.locator('#modalContent [data-complete-quest]').waitFor();
  await page.locator('#modalContent [data-complete-quest]').click();
  await page.locator('#completeQuestForm').waitFor();
  assert.equal(await page.locator('#completeQuestForm textarea').count(),0,'Personal note field leaked');
  assert.equal(await page.locator('#completeQuestForm input[type="file"]').count(),0,'Photo upload leaked');
  await page.screenshot({path:qa+'/evergrove-'+width+'-quest.png',fullPage:true});
  await page.locator('#completeQuestForm button[type="submit"]').click();
  await page.locator('#view-chronicle.is-active').waitFor({state:'visible',timeout:10000});
  const saved=await page.evaluate(()=>({
   current:sessionStorage.getItem('anevum_evergrove_showcase_session_v1'),
   family:localStorage.getItem('adventure_book_local_preview_v1')
  }));
  assert.ok(saved.current,'Completed quest did not save session demo state');
  const state=JSON.parse(saved.current);
  assert.ok(state.xp>186,'Quest completion did not award fictional XP');
  assert.equal(saved.family,null,'Demo touched private family prototype storage');
  assert.deepEqual(unexpectedRequests,[],'Outbound request attempted');
  assert.deepEqual(errors,[],'Browser runtime error');
  await page.close();
 }
 console.log('Evergrove browser QA passed: 390px and 1440px, navigation, anonymous quest rewards, no personal input/requests.');
}finally{
 if(browser)await browser.close();
 await new Promise(ok=>server.close(ok));
}
