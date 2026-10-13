// Dependency-free Chromium smoke runner. Runs an isolated local server, not any ANEVUM host.
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('../public/fold/',import.meta.url)));
const artifacts=fileURLToPath(new URL('../test-artifacts/',import.meta.url));
const chrome=process.env.FOLD_CHROME||['google-chrome','chromium','chromium-browser']
 .find(bin=>spawnSync('which',[bin],{stdio:'ignore'}).status===0);
if(!chrome)throw Error('Chrome/Chromium is needed for interactive browser acceptance');

const html=(await readFile(join(root,'index.html'),'utf8'))
 .replace(/<link rel="stylesheet" href="https:\/\/unpkg\.com\/maplibre-gl[^"]+">/,'')
 .replace('</body>','<script type="module" src="/__fold_smoke.mjs"></script></body>');
const browserTest=fileURLToPath(new URL('./fold-smoke-client.mjs',import.meta.url));
const types={html:'text/html; charset=utf-8',mjs:'text/javascript; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
const server=createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname;
 if(pathname==='/'){res.writeHead(200,{'Content-Type':types.html}).end(html);return;}
 const path=pathname==='/__fold_smoke.mjs'?browserTest:resolve(root,'.'+pathname);
 if(path!==browserTest&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
 try{const data=await readFile(path);res.writeHead(200,{'Content-Type':types[path.split('.').pop()]||'application/octet-stream'}).end(data);}
 catch{res.writeHead(404).end();}
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
await mkdir(artifacts,{recursive:true});

async function runSize(width,height,screenshot){
 const profile=await mkdtemp(join(tmpdir(),'the-fold-smoke-'));
 try{
  const url='http://127.0.0.1:'+server.address().port+'/';
  const args=['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
   '--disable-background-networking','--no-first-run','--no-default-browser-check',
   '--force-device-scale-factor=1','--user-data-dir='+profile,
   '--window-size='+width+','+height,'--virtual-time-budget=6000','--dump-dom'];
  if(screenshot)args.push('--screenshot='+join(artifacts,'fold-'+width+'x'+height+'.png'));
  args.push(url);
  const child=spawn(chrome,args,{stdio:['ignore','pipe','pipe']});
  let output='',errors='';
  child.stdout.on('data',data=>output+=data.toString());
  child.stderr.on('data',data=>errors+=data.toString());
  const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  assert.equal(code,0,'Chrome exit '+code+': '+errors.slice(-1200));
  if(!output.includes('data-fold-smoke="pass"')){
   const match=output.match(/data-fold-smoke-error="([^"]+)"/);
   throw Error(width+'x'+height+' browser flow failed: '+(match?.[1]||'no pass marker')+'; '+errors.slice(-500));
  }
  console.log('PASS '+width+'x'+height+' level-zero, two quest steps, saved chapter, Level 1, page bounds');
 }finally{await rm(profile,{recursive:true,force:true,maxRetries:3});}
}

try{
 for(const [width,height,screenshot] of [[320,700,false],[390,844,true],[844,390,false],[1024,768,false],[1440,900,true]]){
  await runSize(width,height,screenshot);
 }
 console.log('The Fold browser smoke passed at all five responsive viewports');
}finally{
 await new Promise(resolve=>server.close(resolve));
}
