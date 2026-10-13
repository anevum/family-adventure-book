import {SAVE_KEY,QUESTS,QUEST_MAP,newSave,loadSave,normalizeSave,cleanText,escapeHtml,earnedXP,progression,isDone,stepProgress,setStep,completeQuest} from './core.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let save=readLocal(),openView='',returnFocus=null,toastTimer=0,rewardTimer=0,mapInstance=null,maplibre=null,liveReady=false,attemptingMap=false,userMarker=null,markers=[],lastPosition=null;
const PLACE=[-122.338,47.610],MAP_STYLE='https://tiles.openfreemap.org/styles/bright';
function readLocal(){try{return loadSave(localStorage.getItem(SAVE_KEY));}catch{return newSave();}}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{toast('Device saving is unavailable. Your progress may disappear.');return false;}}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3600);}
function point(xp){return progression(xp);}
function updateHUD(){
 const p=point(earnedXP(save));
 $('#levelNumber').textContent=p.level;$('#levelName').textContent='LEVEL '+p.level;
 $('#xpText').textContent=p.inLevel+' / '+p.target+' XP';$('#xpBar').style.width=Math.round(p.fraction*100)+'%';
 const next=QUESTS.find(q=>!isDone(save,q.id));
 $('#nextTitle').textContent=next?.title||'Your Adventure Book';
 $('#nextMeta').textContent=next?'YOUR NEXT ADVENTURE':'ALL STARTER QUESTS FINISHED';
 $('#nextDesc').textContent=next?.description||'Your next chapter is yours to imagine.';
 $('#nextGo').dataset.quest=next?.id||'';
 $('#privacyStatus').textContent=lastPosition?'USED ONCE · PRIVATE':'LOCATION OFF';
}
function uiButton(label,action,extra='',kind='primary'){return '<button type="button" class="'+kind+'" data-action="'+action+'" '+extra+'>'+escapeHtml(label)+'</button>';}
function openPanel(html,id){
 if($('#panel').hidden)returnFocus=document.activeElement;
 $('#panelBody').innerHTML=html;openView=id;$('#panel').hidden=false;$('#scrim').hidden=false;
 $('#panelClose').focus();$$('.dock button').forEach(b=>b.removeAttribute('aria-current'));
}
function closePanel(){
 $('#panel').hidden=true;$('#scrim').hidden=true;$('#panelBody').innerHTML='';openView='';
 $$('.dock button').forEach(b=>{if(b.dataset.panel==='map')b.setAttribute('aria-current','page');});
 if(returnFocus?.isConnected)returnFocus.focus();returnFocus=null;
}
function title(kicker,title,text=''){return '<span class="eyebrow">'+escapeHtml(kicker)+'</span><h2 id="panelTitle">'+escapeHtml(title)+'</h2>'+(text?'<p>'+escapeHtml(text)+'</p>':'');}
function openQuests(){
 const choices=QUESTS.map(q=>{
  const done=isDone(save,q.id),progress=stepProgress(save,q.id).filter(Boolean).length;
  return '<button type="button" class="quest-choice'+(done?' done':'')+'" data-quest="'+q.id+'"><span class="symbol">'+(done?'✓':escapeHtml(q.symbol))+'</span><span><strong>'+escapeHtml(q.title)+'</strong><small>'+(done?'Chapter saved':escapeHtml(q.kind)+' · '+progress+'/'+q.steps.length+' steps · +'+q.xp+' XP')+'</small></span><span class="go-right">›</span></button>';
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
 openPanel(title(escapeHtml(q.kind).toUpperCase()+' · +'+q.xp+' XP',q.title,q.description)+'<div class="tags"><span class="tag">NO GPS REQUIRED</span><span class="tag">SOLO OR TOGETHER</span></div><p class="small">'+escapeHtml(q.suggestion)+'</p>'+checks+extra+'<div class="actions">'+actions+'</div>','quest:'+id);
}
function openBook(selectedId){
 const entries=save.done.slice().reverse();
 if(selectedId){
  const entry=save.done.find(x=>x.id===selectedId),q=QUEST_MAP[selectedId];
  if(!entry||!q){openBook();return;}
  const text=entry.note?escapeHtml(entry.note):'A quiet adventure became another page in your story.';
  openPanel(title('THE ADVENTURE BOOK · '+escapeHtml(entry.when||'SAVED CHAPTER'),q.title)+'<p>'+text+'</p><div class="tags"><span class="tag">✦ '+q.xp+' XP EARNED</span><span class="tag">PRIVATE TO THIS DEVICE</span></div><div class="actions">'+uiButton('Edit your note','edit-note','data-id="'+selectedId+'"')+uiButton('All chapters','book','','secondary')+'</div><p class="small">Changing or clearing a memory does not change earned XP. No photographs or coordinates were collected.</p>','book:'+selectedId);return;
 }
 const cards=entries.length?entries.map(x=>'<button type="button" class="book-entry" data-book-id="'+x.id+'"><span class="symbol">▤</span><span><strong>'+escapeHtml(QUEST_MAP[x.id].title)+'</strong><small>'+escapeHtml(x.when)+' · '+(x.note?'Memory saved':'Completed chapter')+'</small></span></button>').join(''):'<div class="empty"><strong>Your book is waiting.</strong>Finish a quest and your first chapter will appear here.</div>';
 openPanel(title('YOUR STORY, PAGE BY PAGE','The Adventure Book','A private collection of adventures you have chosen to remember.')+'<div class="stack">'+cards+'</div><div class="actions">'+uiButton('Explore quests','all-quests')+uiButton('Export your save','export','','secondary')+'</div><p class="small">Browser-only prototype. Clearing your browsing data can erase these chapters; export a copy if you want to keep them.</p>','book');
}
function editNote(id){
 const entry=save.done.find(x=>x.id===id);if(!entry)return openBook();
 openPanel(title('A PAGE OF YOUR BOOK','Keep this memory','The details are yours. You can change or clear this note anytime.')+'<label class="form-label" for="editNote">Private memory</label><textarea id="editNote" maxlength="300">'+escapeHtml(entry.note)+'</textarea><div class="actions">'+uiButton('Save this page','save-note','data-id="'+id+'"')+uiButton('Clear note','clear-note','data-id="'+id+'"','secondary')+'</div><p class="small">Deleting this note keeps your completed quest and earned XP intact.</p>','edit:'+id);
}
function openFold(){
 openPanel(title('YOUR PEOPLE · YOUR STORY','My Fold','Your Fold starts with you. Couples can eventually invite their partner, and adults can build private family groups when real account and privacy systems are ready.')+'<div class="party-slot"><span class="symbol">✿</span><div><strong>'+escapeHtml(save.name)+'</strong><p class="small" style="margin:2px 0">Solo explorer · Level '+point(earnedXP(save)).level+'</p></div></div><div class="privacy-notice"><strong>Real multiplayer is not active in this prototype.</strong><br>Invitations, other members, cloud saves and location sharing require authenticated accounts and individual consent. No imaginary members are displayed as real.</div><div class="actions">'+uiButton('Start an adventure','all-quests')+uiButton('Your privacy','privacy','','secondary')+'</div>','fold');
}
function openProgress(){
 const earned=earnedXP(save),p=point(earned),first=isDone(save,'first');
 openPanel(title('YOUR JOURNEY','Level '+p.level,'Every adventure adds a little to your story. All players begin at Level 0.')+'<div class="privacy-notice"><strong>'+earned+' total XP</strong><br>'+p.inLevel+' of '+p.target+' XP until Level '+(p.level+1)+'.</div><div class="tags"><span class="tag">'+(first?'✦ FIRST SPARK UNLOCKED':'◇ FIRST SPARK LOCKED')+'</span><span class="tag">'+save.done.length+' / '+QUESTS.length+' STARTER CHAPTERS</span></div><p class="small">This preview counts each quest once from the local chapter ledger. Account-backed progression, verification and shared rewards are future work.</p><div class="actions">'+uiButton('Continue quests','all-quests')+'</div>','progress');
}
function openPrivacy(){
 openPanel(title('ALWAYS YOUR CHOICE','Location & privacy','You can enjoy the entire first game without location access.')+'<div class="privacy-notice"><strong>Location sharing: OFF</strong><br>The Fold does not stream your location to friends, follow you in the background, or store your route. This prototype has no connected players.</div><p>Loading the real map contacts an external tile service for the displayed region. Locating yourself once requests browser permission and then loads nearby tiles, which can reveal that approximate region to the map provider.</p><div class="actions">'+uiButton('Use location once','locate-once')+uiButton('Real map, no GPS','ask-live','','secondary')+uiButton('Clear location','clear-location','','secondary')+'</div><p class="small">Your position is held only in memory. Location sharing with other people is not implemented. Never rely on this game for safety monitoring.</p>','privacy');
}
function openSettings(){
 openPanel(title('YOUR LITTLE WORLD','Game settings','Customize your local game save. No sign-in or cloud storage is connected.')+'<label for="playerName" class="form-label">Adventurer name</label><input id="playerName" type="text" maxlength="28" value="'+escapeHtml(save.name)+'"><div class="actions">'+uiButton('Save name','save-name')+uiButton('Export save','export','','secondary')+'</div><div class="actions">'+uiButton('Clear local progress','confirm-reset','','danger')+'</div><p class="small">This private prototype does not have account recovery or encrypted memory storage. Do not record sensitive information here.</p>','settings');
}
function askLive(){
 openPanel(title('OPTIONAL MAP FEATURE','Unfold the real map','This uses MapLibre and OpenFreeMap to show a real-world map. Their servers receive map-tile requests for the area you view. The Fold does not request GPS unless you choose to locate yourself.')+'<div class="privacy-notice">The illustrated demo is fully playable offline. Quest pins on the real map are activity prompts, not confirmed destinations or directions.</div><div class="actions">'+uiButton('Load real map','enable-live')+uiButton('Keep illustrated map','close','','secondary')+'</div>','ask-live');
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
async function enableLive(){
 if(attemptingMap){toast('Loading map…');return;}
 if(liveReady){$('#game').dataset.map='live';$('#liveMap').setAttribute('aria-hidden','false');closePanel();toast('Real map shown · location remains off');return;}
 attemptingMap=true;toast('Loading live map tiles…');
 try{
  const module=await import('https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.mjs');
  maplibre=module;
  mapInstance=new module.Map({container:'liveMap',style:MAP_STYLE,center:PLACE,zoom:13,attributionControl:true,interactive:true});
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('map timed out')),14000);
   mapInstance.once('load',()=>{clearTimeout(timer);resolve();});
   mapInstance.once('error',e=>{if(!mapInstance?.loaded()){clearTimeout(timer);reject(e.error||Error('map unavailable'));}});
  });
  liveReady=true;$('#game').dataset.map='live';$('#liveMap').setAttribute('aria-hidden','false');
  spawnPins(PLACE);mapInstance.resize();closePanel();$('#mapAreaName').textContent='The World';toast('Explore the real map. Your location is still off.');
 }catch(e){
  try{mapInstance?.remove();}catch{}mapInstance=null;liveReady=false;
  $('#game').dataset.map='demo';toast('Live map unavailable. Illustrated demo remains playable.');
 }finally{attemptingMap=false;}
}
function spawnPins(center){
 for(const m of markers)m.remove();markers=[];
 if(!maplibre||!mapInstance)return;
 const coords=[[center[0]-.010,center[1]+.006],[center[0]+.010,center[1]+.005],[center[0]+.006,center[1]-.007]];
 ['first','us','wonder'].forEach((id,i)=>{
  const el=document.createElement('button'),q=QUEST_MAP[id];el.type='button';el.className='live-quest-pin';el.textContent=q.symbol;el.setAttribute('aria-label','Open '+q.title+' activity prompt');el.title=q.title+' · activity prompt, not a venue';el.addEventListener('click',e=>{e.stopPropagation();openQuest(id);});
  markers.push(new maplibre.Marker({element:el,anchor:'bottom'}).setLngLat(coords[i]).addTo(mapInstance));
 });
}
function clearLocation(){
 lastPosition=null;
 if(userMarker){userMarker.remove();userMarker=null;}
 updateHUD();toast('Location cleared from this session');if(openView==='privacy')openPrivacy();
}
function locateOnce(){
 if(!navigator.geolocation){toast('Location is not supported in this browser');return;}
 closePanel();
 // This is a user-initiated one-time lookup only, never watchPosition or background sharing.
 navigator.geolocation.getCurrentPosition(async position=>{
  const {latitude,longitude}=position.coords;if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return toast('Location unavailable');
  lastPosition=[longitude,latitude];updateHUD();
  if(!liveReady)await enableLive();
  if(liveReady&&mapInstance){mapInstance.flyTo({center:lastPosition,zoom:14});spawnPins(lastPosition);
   if(userMarker)userMarker.remove();
   const el=document.createElement('div');el.className='live-self-marker';el.textContent='YOU';el.setAttribute('aria-label','Your one-time position');
   userMarker=new maplibre.Marker({element:el}).setLngLat(lastPosition).addTo(mapInstance);
  }
  toast('Centered on your position once · no sharing or route recording');
 },error=>{
  const msg=error.code===1?'Location denied. You can play without GPS.':'Location unavailable. You can play without GPS.';
  toast(msg);
 },{enableHighAccuracy:false,timeout:11000,maximumAge:60000});
}
function demoMap(){
 $('#game').dataset.map='demo';$('#liveMap').setAttribute('aria-hidden','true');$('#mapAreaName').textContent='The Common';
 clearLocation();closePanel();toast('Illustrated map · no GPS required');
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
function init(){updateHUD();bind();$('#intro').hidden=Boolean(save.seenIntro);if(!save.seenIntro)$('#introPlay').focus();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
