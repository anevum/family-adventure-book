// ANEVUM first showcase: isolated, anonymous Evergrove game demonstration.
// Generates a separate output; the personal-family prototype is never modified.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=resolve(root,'public'),dst=resolve(root,'dist-showcase');
const read=p=>readFileSync(resolve(src,p),'utf8');
function once(value,needle,sub,label){
 const parts=value.split(needle);
 assert.equal(parts.length,2,'Showcase source drift: '+label);
 return parts.join(sub);
}
let html=read('index.html'),js=read('assets/app.js'),css=read('assets/style.css');
html=once(html,'<title>The Adventure Book - Our world</title>',
  '<title>Evergrove — ANEVUM Playable Showcase</title>','title');
html=once(html,
 'content="The Adventure Book: a cozy, living family adventure game. Turn real memories into a world of stories, quests and keepsakes."',
 'content="Play Evergrove, an illustrated quest world with fictional explorers, interactive rewards and no personal accounts."',
 'description');
for(const line of [
 '  <link rel="manifest" href="manifest.webmanifest">\n',
 '  <meta name="apple-mobile-web-app-capable" content="yes">\n',
 '  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n',
 '  <meta name="apple-mobile-web-app-title" content="Adventure Book">\n',
 '  <link rel="apple-touch-icon" href="assets/icons/icon.svg">\n'
])html=once(html,line,'','remove installable application');
html=once(html,'  <link rel="stylesheet" href="assets/style.css">',
 '  <link rel="stylesheet" href="assets/style.css">\n  <link rel="stylesheet" href="assets/showcase.css">',
 'showcase styles');
const notice='<div class="anevum-demo-notice" role="note">'+
 '<span><strong>ANEVUM PLAYABLE SHOWCASE</strong> · Fictional adventurers, sample quests, session-only progress. No personal family accounts or memories.</span>'+
 '<a href="https://anevum.com/" rel="noopener noreferrer">Back to ANEVUM ↗</a></div>';
html=once(html,'<body>','<body>\n  '+notice,'public demo banner');
assert.match(html,/name="robots" content="noindex, nofollow, noarchive"/);

js=once(js,"const STORAGE_KEY = 'adventure_book_local_preview_v1';",
  "const SHOWCASE_MODE = true;\n  const STORAGE_KEY = 'anevum_evergrove_showcase_session_v1';\n  const STORAGE = sessionStorage;",
  'new isolated tab storage');
js=js.replaceAll('localStorage.','STORAGE.');
assert.doesNotMatch(js,/localStorage/);
js=once(js,'function openModal(type,payload={}){',
 "function openModal(type,payload={}){\n    if(SHOWCASE_MODE && ['quest','memory','event','crew','edit-member'].includes(type)){\n"+
 "      toast('Public showcase','Personal stories, photos, events and new profiles are disabled here. Try the sample quests instead.','✦');\n      return;\n    }",
 'personal-entry modal guard');
js=once(js,'    if(!markup)return;',
 "    if(SHOWCASE_MODE && type==='complete-quest'){\n"+
 "      const sample=state.quests.find(item=>item.id===payload.id);\n"+
 "      if(!sample)return;\n"+
 "      markup=heading('SAMPLE ADVENTURE COMPLETE','A little victory!','Earn fictional XP, tokens and badges; nothing is uploaded.')+\n"+
 "        '<form id=\"completeQuestForm\" class=\"modal-form\"><div class=\"modal-note\"><strong>'+escapeHtml(sample.title)+\n"+
 "        '</strong><p>Sample progress only. No personal text or photos.</p></div><input id=\"completeDate\" type=\"hidden\" value=\"'+todayStr()+'\">'+\n"+
 "        '<div class=\"modal-actions\">'+cancel+'<button type=\"submit\" class=\"button button-primary\">Complete sample quest</button></div></form>';\n"+
 "    }\n    if(!markup)return;",
 'anonymous completion form');
js=once(js,"const body=$('#completedNote').value.trim()||",
 "const body=$('#completedNote')?.value.trim()||",
 'optional private note');
js=once(js,'photo,demo:false,questId:q.id','photo,demo:SHOWCASE_MODE,questId:q.id','mark simulated memory');
js=once(js,
 'async function handleFormSubmit(event){\n    event.preventDefault();const form=event.target;',
 "async function handleFormSubmit(event){\n    event.preventDefault();const form=event.target;\n"+
 "    if(SHOWCASE_MODE && form.id!=='completeQuestForm'){\n      toast('Demo only','Personal information cannot be submitted in this showcase.','✦');return;\n    }",
 'block all personal forms');
js=once(js,'async function imageToSmallDataUrl(file){',
 'async function imageToSmallDataUrl(file){\n    if(SHOWCASE_MODE)return null;',
 'disable photograph processing');
js=once(js,'function exportProgress(){',
 "function exportProgress(){\n    if(SHOWCASE_MODE){toast('Demo only','There are no family records or cloud backups in this public showcase.','✦');return;}",
 'block exporting supposed family backups');
js=once(js,'This clears every local quest, profile, photo, calendar event, and memory saved in this browser. This cannot be undone.',
 'This resets this tab’s fictional demonstration progress. No family accounts or personal records are stored here.',
 'accurate reset wording');
js=once(js,"if('serviceWorker' in navigator&&location.protocol.startsWith('http'))",
 "if(!SHOWCASE_MODE&&'serviceWorker' in navigator&&location.protocol.startsWith('http'))",
 'do not register prototype service worker');
assert.match(js,/const STORAGE = sessionStorage/);
assert.match(js,/SAMPLE ADVENTURE COMPLETE/);
assert.match(js,/if\(SHOWCASE_MODE && form.id!=='completeQuestForm'\)/);
assert.match(css,/character-walking/);

const wrapper=[
 '/* ANEVUM visual wrapper; original Evergrove art and play remain unchanged. */',
 '.anevum-demo-notice{position:relative;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 22px;min-height:48px;border-bottom:1px solid rgba(242,200,131,.3);background:#1d2025;color:#f9ead2;font:600 12px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}',
 '.anevum-demo-notice strong{color:#f2c883;letter-spacing:.12em;font-size:11px}',
 '.anevum-demo-notice a{color:#ffdaab;text-underline-offset:3px;flex:none}',
 '.anevum-demo-notice a:focus-visible{outline:2px solid #f2c883;outline-offset:3px}',
 '@media(max-width:650px){.anevum-demo-notice{padding:11px 16px;align-items:flex-start;flex-direction:column;gap:7px}}',
 '@media(prefers-reduced-motion:reduce){.anevum-demo-notice{scroll-behavior:auto}}'
].join('\n')+'\n';
const headers=[
 '/*',
 '  X-Robots-Tag: noindex, nofollow, noarchive',
 '  X-Content-Type-Options: nosniff',
 '  Referrer-Policy: no-referrer',
 '  X-Frame-Options: DENY',
 '  Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()',
 "  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'"
].join('\n')+'\n';
rmSync(dst,{recursive:true,force:true});
mkdirSync(resolve(dst,'assets/icons'),{recursive:true});
copyFileSync(resolve(src,'assets/icons/icon.svg'),resolve(dst,'assets/icons/icon.svg'));
for(const [p,content] of Object.entries({
  'index.html':html,'assets/app.js':js,'assets/style.css':css,
  'assets/showcase.css':wrapper,'_headers':headers,'robots.txt':'User-agent: *\nDisallow: /\n'
}))writeFileSync(resolve(dst,p),content);
console.log('Evergrove ANEVUM showcase generated, local/CI only, not published.');
