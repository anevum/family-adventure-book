import {SAVE_KEY,QUESTS,QUEST_MAP,newSave,loadSave,normalizeSave,cleanText,escapeHtml,earnedXP,progression,isDone,stepProgress,setStep,completeQuest,DAILY_QUESTS,DAILY_QUEST_MAP,localDay,dailyDone,dailyStepProgress,setDailyStep,completeDaily} from './core.mjs';
import {SAMPLE_CENTER,BASE_STYLE,validMapPoint,applyFoldAtlas} from './atlas.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let save=readLocal(),questTab='today',bookPage=0,openView='',returnFocus=null,toastTimer=0,rewardTimer=0,mapInstance=null,maplibre=null,liveReady=false,attemptingMap=false,userMarker=null,mapBookmark=null,lastPosition=null,mapIntent=false,mapRegion='sample',locationToken=0;
const PLACE=SAMPLE_CENTER,MAP_STYLE=BASE_STYLE;
const MAP_CSS='https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.css';
let mapCssPromise=null;
function loadMapCss(){
 if(mapCssPromise)return mapCssPromise;
 mapCssPromise=new Promise((resolve,reject)=>{
  const link=document.createElement('link');link.rel='stylesheet';link.href=MAP_CSS;link.dataset.foldMapCss='true';
  const timer=setTimeout(()=>{link.remove();reject(new Error('Map stylesheet timed out'));},12000);
  link.addEventListener('load',()=>{clearTimeout(timer);resolve();},{once:true});
  link.addEventListener('error',()=>{clearTimeout(timer);link.remove();reject(new Error('Map stylesheet unavailable'));},{once:true});
  document.head.appendChild(link);
 }).catch(error=>{mapCssPromise=null;throw error;});
 return mapCssPromise;
}
async function withMapTimeout(work,ms=14000){
 let timer;
 try{
  return await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Map resources timed out')),ms);})]);
 }finally{clearTimeout(timer);}
}

function readLocal(){try{return loadSave(localStorage.getItem(SAVE_KEY));}catch{return newSave();}}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{toast('Device saving is unavailable. Your progress may disappear.');return false;}}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3600);}
// IDs come from game code, never user-entered text; SVG references cannot escape this sprite.
const GLYPH_IDS=new Set(['fold','map','quests','party','book','gear','compass','locate','demo','shield','xp','arrow','check','first','us','home','wonder','memory','kind','ritual']);
function glyph(id){const safe=GLYPH_IDS.has(id)?id:'first';return '<svg class="glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="./icons.svg#ic-'+safe+'"></use></svg>';}
function dailyGlyph(id){return ({spark:'first',connection:'us',curiosity:'wonder'})[id]||'first';}
function point(xp){return progression(xp);}
function updateHUD(){
 const p=point(earnedXP(save));
 $('#levelNumber').textContent=p.level;$('#levelName').textContent='LEVEL '+p.level;
 $('#xpText').textContent=p.inLevel+' / '+p.target+' XP';$('#xpBar').style.width=Math.round(p.fraction*100)+'%';
 const starter=QUESTS.find(q=>!isDone(save,q.id));
 const daily=DAILY_QUESTS.find(q=>!dailyDone(save,q.id));
 const next=starter||daily;
 $('#nextTitle').textContent=next?.title||'The Adventure Book';
 $('#nextMeta').textContent=starter?'YOUR NEXT CHAPTER':daily?'TODAY\'S EXPEDITION':'ALL TODAY\'S EXPEDITIONS DONE';
 $('#nextDesc').textContent=next?.description||'Your completed memories are waiting in the Book.';
 $('#nextGo').dataset.quest=starter?.id||'';
 $('#nextGo').dataset.daily=starter?'':daily?.id||'';
 const sym=$('.next-icon use');if(sym)sym.setAttribute('href','./icons.svg#ic-'+(starter?.id||daily&&dailyGlyph(daily.id)||'book'));
 const caption=$('#nextGo span');if(caption)caption.textContent=next?'BEGIN':'READ';
 $('#privacyStatus').textContent=lastPosition?'USED ONCE · PRIVATE':'LOCATION OFF';
}
function uiButton(label,action,extra='',kind='primary'){return '<button type="button" class="'+kind+'" data-action="'+action+'" '+extra+'>'+escapeHtml(label)+'</button>';}
function openPanel(html,id){
 if($('#panel').hidden)returnFocus=document.activeElement;
 $('#panelBody').innerHTML=html;openView=id;$('#panel').dataset.view=id;$('#game').dataset.view=id;$('#panel').hidden=false;$('#scrim').hidden=false;
 $('#panelClose').focus();
 const selected=id==='quests'||id.startsWith('quest:')||id.startsWith('daily:')?'quests':id==='fold'?'fold':id.startsWith('book')||id.startsWith('edit:')?'book':'';
 $$('.dock button').forEach(b=>{if(selected&&b.dataset.panel===selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
}
function closePanel(){
 $('#panel').hidden=true;$('#scrim').hidden=true;$('#panelBody').innerHTML='';$('#panel').dataset.view='';$('#game').dataset.view='';openView='';
 $$('.dock button').forEach(b=>{if(b.dataset.panel==='map')b.setAttribute('aria-current','page');});
 if(returnFocus?.isConnected)returnFocus.focus();returnFocus=null;
}
function title(kicker,title,text=''){return '<span class="eyebrow">'+escapeHtml(kicker)+'</span><h2 id="panelTitle">'+escapeHtml(title)+'</h2>'+(text?'<p>'+escapeHtml(text)+'</p>':'');}
function openQuests(){
 const choices=QUESTS.map(q=>{
  const done=isDone(save,q.id),progress=stepProgress(save,q.id).filter(Boolean).length;
  return '<button type="button" class="quest-choice'+(done?' done':'')+'" data-quest="'+q.id+'"><span class="symbol">'+glyph(done?'check':q.id)+'</span><span><strong>'+escapeHtml(q.title)+'</strong><small>'+(done?'Chapter saved':escapeHtml(q.kind)+' · '+progress+'/'+q.steps.length+' steps · +'+q.xp+' XP')+'</small></span><span class="go-right">›</span></button>';
 }).join('');
 openPanel(title('YOUR WORLD IS YOUR GAME','Choose an adventure','Play at home, outside, alone or with someone you care about. No GPS, money or photos required.')+'<div class="stack">'+choices+'</div><p class="small">Each starter quest awards XP once. This is an offline device prototype, not shared family progress.</p>','quests');
}
function openQuest(id){
 const q=QUEST_MAP[id];if(!q){openQuests();return;}
 const done=isDone(save,id),flags=stepProgress(save,id);
 const checks=q.steps.map((step,i)=>'<label class="step"><input type="checkbox" data-step-id="'+id+'" data-step-num="'+i+'" '+(flags[i]?'checked':'')+' '+(done?'disabled':'')+'><span>'+escapeHtml(step)+'</span></label>').join('');
 const currentNote=save.done.find(d=>d.id===id)?.note||'';
 const actions=done?uiButton('READ YOUR CHAPTER','open-book','data-id="'+id+'"')+uiButton('Back to quests','all-quests','','secondary'):uiButton('FINISH CHAPTER · +'+q.xp+' XP','finish','data-id="'+id+'" '+(!flags.every(Boolean)?'disabled':''))+uiButton('Back','all-quests','','secondary');
 const extra=done?'<div class="privacy-notice">This quest is complete and its XP cannot be earned again. '+(currentNote?'You saved a private note.':'You chose not to save a note.')+'</div>':'<label class="form-label" for="questNote">A little memory (optional)</label><textarea id="questNote" maxlength="300" placeholder="A moment you want to remember..."></textarea>';
 openPanel('<div class="quest-hero"><span class="quest-crest">'+glyph(id)+'</span><span class="quest-meta">YOUR ADVENTURE <b>·</b> +'+q.xp+' XP</span></div>'+title(escapeHtml(q.kind).toUpperCase()+' · +'+q.xp+' XP',q.title,q.description)+'<div class="tags"><span class="tag">NO GPS REQUIRED</span><span class="tag">SOLO OR TOGETHER</span></div><p class="small">'+escapeHtml(q.suggestion)+'</p>'+checks+extra+'<div class="actions">'+actions+'</div>','quest:'+id);
}
function openBook(selectedId){
 const entries=save.done.slice().reverse();
 if(selectedId){
  const entry=save.done.find(x=>x.id===selectedId),q=QUEST_MAP[selectedId];
  if(!entry||!q){openBook();return;}
  const text=entry.note?escapeHtml(entry.note):'A quiet adventure became another page in your story.';
  openPanel(title('THE ADVENTURE BOOK · '+escapeHtml(entry.when||'SAVED CHAPTER'),q.title)+'<div class="book-stamp">'+glyph('book')+'<span>CHAPTER SAVED <b>·</b> '+q.xp+' EXPERIENCE POINTS</span></div><p class="book-memory">'+text+'</p><div class="tags"><span class="tag">+'+q.xp+' XP EARNED</span><span class="tag">PRIVATE TO THIS DEVICE</span></div><div class="actions">'+uiButton('Edit your note','edit-note','data-id="'+selectedId+'"')+uiButton('All chapters','book','','secondary')+'</div><p class="small">Changing or clearing a memory does not change earned XP. No photographs or coordinates were collected.</p>','book:'+selectedId);return;
 }
 const cards=entries.length?entries.map(x=>'<button type="button" class="book-entry" data-book-id="'+x.id+'"><span class="symbol">'+glyph('book')+'</span><span><strong>'+escapeHtml(QUEST_MAP[x.id].title)+'</strong><small>'+escapeHtml(x.when)+' · '+(x.note?'Memory saved':'Completed chapter')+'</small></span></button>').join(''):'<div class="empty"><strong>Your book is waiting.</strong>Finish a quest and your first chapter will appear here.</div>';
 openPanel(title('YOUR STORY, PAGE BY PAGE','The Adventure Book','A private collection of adventures you have chosen to remember.')+'<div class="stack">'+cards+'</div><div class="actions">'+uiButton('Explore quests','all-quests')+uiButton('Export your save','export','','secondary')+'</div><p class="small">Browser-only prototype. Clearing your browsing data can erase these chapters; export a copy if you want to keep them.</p>','book');
}
function editNote(id){
 const entry=save.done.find(x=>x.id===id);if(!entry)return openBook();
 openPanel(title('A PAGE OF YOUR BOOK','Keep this memory','The details are yours. You can change or clear this note anytime.')+'<label class="form-label" for="editNote">Private memory</label><textarea id="editNote" maxlength="300">'+escapeHtml(entry.note)+'</textarea><div class="actions">'+uiButton('Save this page','save-note','data-id="'+id+'"')+uiButton('Clear note','clear-note','data-id="'+id+'"','secondary')+'</div><p class="small">Deleting this note keeps your completed quest and earned XP intact.</p>','edit:'+id);
}
function openFold(){
 openPanel(title('YOUR PEOPLE · YOUR STORY','My Fold','Your Fold starts with you. Couples can eventually invite their partner, and adults can build private family groups when real account and privacy systems are ready.')+'<div class="party-slot"><span class="symbol">'+glyph('party')+'</span><div><strong>'+escapeHtml(save.name)+'</strong><p class="small" style="margin:2px 0">Solo explorer · Level '+point(earnedXP(save)).level+'</p></div></div><div class="privacy-notice"><strong>Real multiplayer is not active in this prototype.</strong><br>Invitations, other members, cloud saves and location sharing require authenticated accounts and individual consent. No imaginary members are displayed as real.</div><div class="actions">'+uiButton('Start an adventure','all-quests')+uiButton('Your privacy','privacy','','secondary')+'</div>','fold');
}
function openProgress(){
 const earned=earnedXP(save),p=point(earned),first=isDone(save,'first');
 openPanel(title('YOUR JOURNEY','Level '+p.level,'Every adventure adds a little to your story. All players begin at Level 0.')+'<div class="privacy-notice"><strong>'+earned+' total XP</strong><br>'+p.inLevel+' of '+p.target+' XP until Level '+(p.level+1)+'.</div><div class="tags"><span class="tag">'+(first?'FIRST SPARK UNLOCKED':'FIRST SPARK LOCKED')+'</span><span class="tag">'+save.done.length+' / '+QUESTS.length+' STARTER CHAPTERS</span></div><p class="small">This preview counts each quest once from the local chapter ledger. Account-backed progression, verification and shared rewards are future work.</p><div class="actions">'+uiButton('Continue quests','all-quests')+'</div>','progress');
}
function openPrivacy(){
 openPanel(title('ALWAYS YOUR CHOICE','Location & privacy','You can enjoy the entire first game without location access.')+'<div class="privacy-notice"><strong>Location sharing: OFF</strong><br>The Fold does not stream your location to friends, follow you in the background, or store your route. This prototype has no connected players.</div><p>Loading the real map contacts an external tile service for the displayed region. Locating yourself once requests browser permission and then loads nearby tiles, which can reveal that approximate region to the map provider.</p><div class="actions">'+uiButton('Use location once','locate-once')+uiButton('Real map, no GPS','ask-live','','secondary')+uiButton('Clear location','clear-location','','secondary')+'</div><p class="small">Your position is held only in memory. Location sharing with other people is not implemented. Never rely on this game for safety monitoring.</p>','privacy');
}
function openSettings(){
 openPanel(title('YOUR LITTLE WORLD','Game settings','Customize your local game save. No sign-in or cloud storage is connected.')+'<label for="playerName" class="form-label">Adventurer name</label><input id="playerName" type="text" maxlength="28" value="'+escapeHtml(save.name)+'"><div class="actions">'+uiButton('Save name','save-name')+uiButton('Export save','export','','secondary')+'</div><div class="actions">'+uiButton('Clear local progress','confirm-reset','','danger')+'</div><p class="small">This private prototype does not have account recovery or encrypted memory storage. Do not record sensitive information here.</p>','settings');
}
function askLive(){
 openPanel(title('OPTIONAL MAP FEATURE','Unfold the real map','This uses MapLibre and OpenFreeMap. The Fold recolors geographic map layers but does not verify venues or activities. The tile provider receives requests for the region you view. You can pan and place a temporary personal marker without turning on GPS.')+'<div class="privacy-notice">The illustrated demo is fully playable offline. Tap the real map to place your own temporary activity mark. It is neither a verified venue nor a saved route; nothing is shared with another player.</div><div class="actions">'+uiButton('Load real map','enable-live')+uiButton('Keep illustrated map','close','','secondary')+'</div>','ask-live');
}
function saveNote(id){const record=save.done.find(x=>x.id===id);if(!record)return;record.note=cleanText($('#editNote')?.value,300);persist();openBook(id);toast('Your story has been updated');}
function exportSave(){
 try{const blob=new Blob([JSON.stringify({ ...normalizeSave(save),exportedAt:new Date().toISOString() },null,2)],{type:'application/json'});const uri=URL.createObjectURL(blob),a=document.createElement('a');a.href=uri;a.download='the-fold-adventure-book.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),1500);toast('Save downloaded to your device');}catch{toast('This browser could not export the file');}
}
function showReward(q,result){const layer=$('#celebrate');$('#celebrateTitle').textContent=q.title;$('#celebrateText').textContent='+'+result.xp+' XP'+(result.levelUp?' · LEVEL '+result.after.level+'!':' · CHAPTER SAVED');layer.hidden=false;clearTimeout(rewardTimer);rewardTimer=setTimeout(()=>layer.hidden=true,1700);}
function finish(id){
 const q=QUEST_MAP[id];if(!q)return;
 const note=cleanText($('#questNote')?.value,300),result=completeQuest(save,id,note);
 if(!result.awarded){toast(result.reason==='already-complete'?'This chapter is already complete':'Finish both activities to earn XP');return;}
 save=result.save;persist();closePanel();updateHUD();showReward(q,result);
 setTimeout(()=>{if($('#panel').hidden)openBook(id);},1880);
}
function updateMapContext(){
 const live=$('#game').dataset.map==='live';
 $('#mapAreaName').textContent=live?(mapRegion==='located'?'Your Area':mapRegion==='manual'?'Your Exploration':'Example · Seattle'):'The Common';
 $('#mapModeText').textContent=live?(mapRegion==='located'?'GPS USED ONCE · PRIVATE':mapRegion==='manual'?'EXPLORING MAP · NO LIVE TRACKING':'EXAMPLE MAP · SEATTLE'):'ILLUSTRATED DEMO · NO GPS';
 $('#mapHintText').textContent=live?'TAP ANYWHERE TO PLACE A PRIVATE QUEST MARK':'SELECT A QUEST PIN TO BEGIN';
}
async function enableLive(){
 mapIntent=true;
 if(attemptingMap){toast('Real map is still loading…');return;}
 if(liveReady){
  $('#game').dataset.map='live';$('#liveMap').setAttribute('aria-hidden','false');
  mapInstance?.resize();closePanel();updateMapContext();
  toast('Real map ready · GPS remains optional');return;
 }
 attemptingMap=true;toast('Loading real-world map…');
 try{
  const [module]=await withMapTimeout(Promise.all([import('https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.mjs'),loadMapCss()]));
  maplibre=module;
  mapInstance=new module.Map({container:'liveMap',style:MAP_STYLE,center:PLACE,zoom:13,attributionControl:true,interactive:true});
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Map timed out')),14000);
   mapInstance.once('load',()=>{clearTimeout(timer);resolve();});
   mapInstance.once('error',e=>{if(!mapInstance?.loaded()){clearTimeout(timer);reject(e.error||Error('Map unavailable'));}});
  });
  liveReady=true;
  applyFoldAtlas(mapInstance);
  mapInstance.on('click',event=>{
   if(!mapIntent||$('#game').dataset.map!=='live')return;
   const point=validMapPoint(event.lngLat?.lng,event.lngLat?.lat);
   if(point)placeBookmark(point);
  });
  mapInstance.on('dragstart',()=>{mapRegion='manual';updateMapContext();});
  if(mapIntent){
   $('#game').dataset.map='live';$('#liveMap').setAttribute('aria-hidden','false');
   mapInstance.resize();closePanel();updateMapContext();
   toast('Tap anywhere to mark an adventure · GPS is off');
  }else updateMapContext();
 }catch{
  try{mapInstance?.remove();}catch{}
  mapInstance=null;liveReady=false;mapIntent=false;
  $('#game').dataset.map='demo';$('#liveMap').setAttribute('aria-hidden','true');
  updateMapContext();toast('Map unavailable · illustrated game remains playable');
 }finally{attemptingMap=false;}
}
function clearBookmark(){
 if(mapBookmark){mapBookmark.remove();mapBookmark=null;}
}
function placeBookmark(point){
 if(!maplibre||!mapInstance)return;
 clearBookmark();
 const el=document.createElement('button');
 el.type='button';el.className='live-quest-pin';
 el.innerHTML=glyph('first');el.title='Your temporary quest mark';
 el.setAttribute('aria-label','Open your temporary quest mark');
 el.addEventListener('click',event=>{event.stopPropagation();openBookmark();});
 mapBookmark=new maplibre.Marker({element:el,anchor:'bottom'}).setLngLat(point).addTo(mapInstance);
 toast('Temporary mark placed · tap it to choose a quest');
}
function openBookmark(){
 if(!mapBookmark)return openQuests();
 openPanel(title('YOUR OWN MAP MARK','An adventure starts here','You marked this point yourself. The Fold has not verified a venue, route, nearby activity or the safety of this location.')+
 '<div class="privacy-notice">This marker stays only in browser memory. It is not a saved route, a quest completion, or a shared position.</div>'+
 '<div class="actions">'+uiButton('Choose an adventure','all-quests')+uiButton('Remove marker','remove-bookmark','','secondary')+'</div>','bookmark');
}
function clearLocation(){
 locationToken++;lastPosition=null;
 if(userMarker){userMarker.remove();userMarker=null;}
 clearBookmark();mapRegion='sample';
 // Clearing a marker alone would leave the visible map centered on the sensitive area.
 // Reset the viewport as well, removing that view from the screen.
 if(liveReady&&mapInstance)mapInstance.jumpTo({center:PLACE,zoom:13});
 updateHUD();updateMapContext();
 toast('Location and temporary mark cleared · example map restored');
 if(openView==='privacy')openPrivacy();
}
function locateOnce(){
 if(!navigator.geolocation){toast('Location is not supported in this browser');return;}
 const token=++locationToken;closePanel();toast('Requesting location once…');
 // User-initiated foreground lookup: never use watchPosition or save coordinates.
 navigator.geolocation.getCurrentPosition(async position=>{
  if(token!==locationToken)return;
  const point=validMapPoint(position.coords.longitude,position.coords.latitude);
  if(!point){toast('Location unavailable · play without GPS');return;}
  if(!liveReady)await enableLive();
  if(token!==locationToken)return;
  if(!liveReady||!mapInstance){toast('Map unavailable · location not retained');return;}
  lastPosition=point;mapRegion='located';clearBookmark();
  mapInstance.jumpTo({center:point,zoom:14});
  if(userMarker)userMarker.remove();
  const el=document.createElement('div');el.className='live-self-marker';
  el.textContent='YOU';el.setAttribute('aria-label','Your one-time position, not shared');
  userMarker=new maplibre.Marker({element:el}).setLngLat(point).addTo(mapInstance);
  updateHUD();updateMapContext();
  toast('Centered once · no tracking or sharing');
 },error=>{
  if(token!==locationToken)return;
  toast(error.code===1?'Location denied · play without GPS':'Location unavailable · play without GPS');
 },{enableHighAccuracy:false,timeout:11000,maximumAge:60000});
}
function demoMap(){
 mapIntent=false;
 $('#game').dataset.map='demo';$('#liveMap').setAttribute('aria-hidden','true');
 clearLocation();closePanel();updateMapContext();
 toast('Illustrated world · no GPS required');
}
function resetConfirm(){
 openPanel(title('START A NEW STORY','Clear your local progress?','This permanently clears your saved chapters, memories and earned XP on this device.')+'<div class="actions">'+uiButton('Yes, start again','reset','','danger')+uiButton('Keep my story','settings','','secondary')+'</div>','reset-confirm');
}
function resetSave(){save=newSave();persist();closePanel();updateHUD();$('#intro').hidden=false;$('#introPlay').focus();clearLocation();toast('Local progress reset');}
function handleAction(name,trigger){
 const id=trigger.dataset.id;
 switch(name){
  case 'close':closePanel();break;
  case 'all-quests':openQuests();break;
  case 'book':openBook();break;
  case 'open-book':openBook(id);break;
  case 'privacy':openPrivacy();break;
  case 'settings':openSettings();break;
  case 'finish':finish(id);break;
  case 'edit-note':editNote(id);break;
  case 'save-note':saveNote(id);break;
  case 'clear-note':{const x=save.done.find(x=>x.id===id);if(x)x.note='';persist();openBook(id);toast('Memory text cleared');break;}
  case 'save-name':save.name=cleanText($('#playerName')?.value,28)||'Explorer';persist();openSettings();toast('Name updated');break;
  case 'export':exportSave();break;
  case 'confirm-reset':resetConfirm();break;
  case 'reset':resetSave();break;
  case 'ask-live':askLive();break;
  case 'enable-live':enableLive();break;
  case 'locate-once':locateOnce();break;
  case 'clear-location':clearLocation();break;
  case 'remove-bookmark':clearBookmark();closePanel();toast('Temporary mark removed');break;
 }
}
function bind(){
 $('#introPlay').addEventListener('click',()=>{save.seenIntro=true;persist();$('#intro').hidden=true;updateHUD();toast('Your first chapter is ready.');$('#nextGo').focus();});
 $('#progressButton').addEventListener('click',openProgress);
 $('#privacyButton').addEventListener('click',openPrivacy);
 $('#panelClose').addEventListener('click',closePanel);
 $('#scrim').addEventListener('click',closePanel);
 $('#settingsButton').addEventListener('click',openSettings);
 $('#mapLiveButton').addEventListener('click',askLive);
 $('#mapMeButton').addEventListener('click',openPrivacy);
 $('#mapDemoButton').addEventListener('click',demoMap);
 $('#nextGo').addEventListener('click',()=>{$('#nextGo').dataset.quest?openQuest($('#nextGo').dataset.quest):openBook();});
 document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-panel]');if(nav){
   if(nav.dataset.panel==='map')closePanel();
   if(nav.dataset.panel==='quests')openQuests();
   if(nav.dataset.panel==='fold')openFold();
   if(nav.dataset.panel==='book')openBook();
   return;
  }
  const quest=event.target.closest('[data-quest]');if(quest){openQuest(quest.dataset.quest);return;}
  const book=event.target.closest('[data-book-id]');if(book){openBook(book.dataset.bookId);return;}
  const action=event.target.closest('[data-action]');if(action)handleAction(action.dataset.action,action);
 });
 document.addEventListener('change',event=>{
  const el=event.target.closest('input[data-step-id]');if(!el)return;
  const id=el.dataset.stepId;
  save=setStep(save,id,Number(el.dataset.stepNum),el.checked);persist();openQuest(id);
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#panel').hidden){closePanel();return;}
  if(e.key==='Tab'&&!$('#panel').hidden){
   const nodes=$$('#panel button:not(:disabled),#panel input:not(:disabled),#panel textarea:not(:disabled)').filter(el=>el.getClientRects().length);
   if(!nodes.length)return;
   const first=nodes[0],last=nodes[nodes.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist();});
}
function init(){updateHUD();bind();updateMapContext();$('#intro').hidden=Boolean(save.seenIntro);if(!save.seenIntro)$('#introPlay').focus();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
