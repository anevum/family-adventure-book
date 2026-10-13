/* Evergrove immersive playable game; no cloud backend, trackers or outside requests. */
(() => {
'use strict';
const KEY='evergrove_immersive_game_v1';
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const questDefs=[
 {id:'footsteps',title:'The First Footsteps',subtitle:'The first adventure is about meeting your world.',xp:60,tokens:12,goals:[{id:'fox',label:'Make a friend at the fox den'},{id:'cottage',label:'Discover the old story cottage'}],kind:'world',minimum:0},
 {id:'wishes',title:'Light & Wishes',subtitle:'Explore the moonlit heart of Evergrove.',xp:80,tokens:16,goals:[{id:'pond',label:'Visit the wishing pond'},{id:'lantern',label:'Light the woodland lantern'}],kind:'world',minimum:0},
 {id:'cozy',title:'A Cozy Evening',subtitle:'Your life is part of the story. Spend a gentle evening together, and keep the memory.',xp:65,tokens:13,goals:[{id:'dessert',label:'Share something delicious'},{id:'unwind',label:'Make time to relax together'},{id:'movie',label:'Share a movie or a favorite story'}],kind:'real',minimum:0},
 {id:'garden',title:'The Secret Garden',subtitle:'A hidden place awakens when your adventures have grown.',xp:100,tokens:20,goals:[{id:'garden',label:'Discover the story garden'},{id:'fox-return',label:'Tell the fox what you found'}],kind:'world',minimum:2}
];
const spots={
 fox:{title:'The Curious Fox',subtitle:'Companion of the Clearing',x:334,y:432,flavor:'A bright-eyed fox peeks out from the grass. It knows more paths than any traveler.'},
 cottage:{title:'The Story Cottage',subtitle:'Home of a Thousand Chapters',x:437,y:433,flavor:'Warm windows glow through the trees. Here, even the simplest adventures become something to remember.'},
 pond:{title:'The Wishing Pond',subtitle:'A Place to Wonder',x:599,y:420,flavor:'The pond mirrors the sky. Ripple by ripple, another little story begins.'},
 lantern:{title:'The Lantern',subtitle:'Keeper of the Evening',x:520,y:435,flavor:'A small golden light makes the whole forest feel like home.'},
 garden:{title:'The Secret Garden',subtitle:'Unlocked at Level 2',x:280,y:418,flavor:'Tiny blossoms rise where the paths meet. The world grows with every chapter.'},
 character:{title:'Your Adventurer',subtitle:'The Story Starts with You',x:462,y:438,flavor:'You are the hero of this quiet little world. No hurry. No competition. Just adventure.'}
};
const defaultState=()=>({
 version:1,xp:0,tokens:0,seenIntro:false,player:'Adventurer',night:true,
 steps:{},completed:[],memories:[],position:{x:462,y:438},
 sound:false,createdAt:new Date().toISOString()
});
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function load(){
 try{const v=JSON.parse(localStorage.getItem(KEY));if(!v||v.version!==1||!Array.isArray(v.completed)||typeof v.steps!=='object'||!Number.isFinite(v.xp)||v.xp<0)return defaultState();
 const base=defaultState();return {...base,...v,xp:clamp(v.xp,0,999999),tokens:clamp(Number(v.tokens)||0,0,999999),player:typeof v.player==='string'?v.player.slice(0,28):base.player,completed:v.completed.filter(id=>questDefs.some(q=>q.id===id)),memories:Array.isArray(v.memories)?v.memories.slice(0,100):[],steps:v.steps||{},position:v.position&&Number.isFinite(v.position.x)&&Number.isFinite(v.position.y)?{x:clamp(v.position.x,245,624),y:clamp(v.position.y,361,473)}:base.position};
 }catch{return defaultState();}
}
let state=load(),currentDialog='',focusBefore=null,noticeTimer,celebrationTimer,lastSaveFailed=false,audioContext=null;
let currentPos={...state.position},targetPos={...state.position},arrival=null,walkFrame=null,lastFrame=0;
const isComplete=id=>state.completed.includes(id);
function levelInfo(xp){
 let level=0,base=0,goal=60;
 while(level<60&&xp>=base+goal){base+=goal;level++;goal=60+20*level;}
 return {level,current:xp-base,target:goal};
}
function persist(){
 state.position={x:Math.round(currentPos.x),y:Math.round(currentPos.y)};
 try{localStorage.setItem(KEY,JSON.stringify(state));lastSaveFailed=false;}
 catch{if(!lastSaveFailed){lastSaveFailed=true;notice('Device storage is unavailable. Progress may be lost.');}}
}
function play(notes=[440]){
 if(!state.sound)return;
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audioContext=audioContext||new C();audioContext.resume?.();notes.forEach((hz,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime+i*.085;o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.035);g.gain.exponentialRampToValueAtTime(.0001,t+.23);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.24);});}catch{}
}
function notice(message){const el=$('#floatingMessage');el.textContent=message;el.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('show'),3000);}
function xpRefresh(){
 const p=levelInfo(state.xp);
 $('#levelEmblem').textContent=p.level;$('#levelLabel').textContent=p.level;
 $('#xpLabel').textContent=p.current+' / '+p.target+' XP';
 $('#xpFill').style.width=(100*p.current/p.target)+'%';
 $('#tokens').textContent=state.tokens;
 $('#game').classList.toggle('night',state.night);
 $('#game').classList.toggle('garden-unlocked',p.level>=2);
 const next=questDefs.find(q=>!isComplete(q.id)&&p.level>=q.minimum);
 $('#teaseName').textContent=next?.title||'All chapters complete';
 $('#teaseButton').textContent=next?'BEGIN  →':'REVISIT  →';
 $('#teaseButton').dataset.quest=next?.id||'';
 $('#soundButton').setAttribute('aria-label',state.sound?'Mute game sound':'Enable game sound');
 $('#soundButton').textContent=state.sound?'♫':'♩';
}
function stepComplete(questId,goalId){
 if(isComplete(questId))return;
 if(!state.steps[questId])state.steps[questId]={};
 if(state.steps[questId][goalId])return;
 state.steps[questId][goalId]=true;persist();
 play([520,680]);notice('New discovery · '+questDefs.find(q=>q.id===questId)?.title);
 const q=questDefs.find(q=>q.id===questId);
 if(q&&q.kind==='world'&&q.goals.every(g=>state.steps[questId][g.id])){setTimeout(()=>finishQuest(q.id),450);}
}
function finishQuest(id){
 const q=questDefs.find(q=>q.id===id);
 if(!q||isComplete(id)||levelInfo(state.xp).level<q.minimum)return false;
 if(!q.goals.every(g=>state.steps[id]?.[g.id]))return false;
 const before=levelInfo(state.xp).level;
 state.completed.push(id);state.xp+=q.xp;state.tokens+=q.tokens;
 state.memories.unshift({id:'quest-'+id,title:q.title,body:q.kind==='real'?'We took time to make a memory together. The little things can become our favorite chapters.':q.subtitle,date:new Date().toISOString().slice(0,10),questId:id});
 persist();closeDialog();xpRefresh();play([523,659,784,1046]);
 showCelebration(q.title,'+'+q.xp+' XP · +'+q.tokens+' TOKENS'+(levelInfo(state.xp).level>before?' · LEVEL UP!':''));
 return true;
}
function showCelebration(title,desc){
 const box=$('#celebration');$('#celebrateTitle').textContent=title;$('#celebrateDesc').textContent=desc;
 box.hidden=false;clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>{box.hidden=true;},1850);
}
function moveTo(x,y,then){
 const next={x:clamp(x,245,624),y:clamp(y,361,473)};
 targetPos=next;arrival=typeof then==='function'?then:null;
 if(!walkFrame){lastFrame=0;walkFrame=requestAnimationFrame(walkTick);}
}
function walkTick(ts){
 if(!lastFrame)lastFrame=ts;
 const dt=Math.min(50,ts-lastFrame)/1000;lastFrame=ts;
 const dx=targetPos.x-currentPos.x,dy=targetPos.y-currentPos.y,d=Math.hypot(dx,dy);
 if(d>1.5){const step=Math.min(d,250*dt);currentPos.x+=dx/d*step;currentPos.y+=dy/d*step;$('#characterMover').classList.add('character-walking');}
 else {currentPos={...targetPos};$('#characterMover').classList.remove('character-walking');}
 $('#characterMover').style.transform='translate('+(currentPos.x-462)+'px,'+(currentPos.y-438)+'px)';
 if(d>1.5)walkFrame=requestAnimationFrame(walkTick);
 else{walkFrame=null;lastFrame=0;persist();const callback=arrival;arrival=null;callback?.();}
}
function walkShort(dx,dy){moveTo(currentPos.x+dx,currentPos.y+dy);play([350]);}
function travelSpot(name){
 const s=spots[name];if(!s)return;
 if(name==='garden'&&levelInfo(state.xp).level<2){notice('The garden awakens at Level 2');openSpot('garden');return;}
 moveTo(s.x,s.y,()=>openSpot(name));play([390]);
}
function closeDialog(){
 $('#dialogLayer').hidden=true;$('#dialogBody').innerHTML='';currentDialog='';
 focusBefore?.focus?.();focusBefore=null;
}
function showDialog(html,which){
 focusBefore=document.activeElement;currentDialog=which;
 $('#dialogBody').innerHTML=html;$('#dialogLayer').hidden=false;
 $('#dialogClose').focus();
}
const btn=(label,action,extra='',kind='primary')=>'<button type="button" class="'+kind+'" data-action="'+action+'" '+extra+'>'+escapeHtml(label)+'</button>';
function openSpot(id){
 const s=spots[id];if(!s)return;
 if(id==='garden'&&levelInfo(state.xp).level<2){
  showDialog('<span class="overline">A PLACE YET TO BE DISCOVERED</span><h2>The Secret Garden</h2><p>The vines are still sleeping. Complete adventures until you reach Level 2 to unlock this clearing.</p><div class="action-line">'+btn('See my quests','quests')+'</div>','garden-locked');return;
 }
 if(id==='fox'){
  stepComplete('footsteps','fox');
  if(isComplete('garden')===false&&state.steps.garden?.garden)stepComplete('garden','fox-return');
 }else if(id==='cottage')stepComplete('footsteps','cottage');
 else if(id==='pond')stepComplete('wishes','pond');
 else if(id==='lantern'){state.night=!state.night;persist();xpRefresh();stepComplete('wishes','lantern');}
 else if(id==='garden')stepComplete('garden','garden');
 const extra=id==='cottage'?btn('Plan a cozy evening','quest','data-id="cozy"'):id==='character'?btn('See adventure progress','quests'):id==='lantern'?btn('Change the sky again','visit','data-id="lantern"'):btn('View quests','quests');
 showDialog('<span class="overline">'+escapeHtml(s.subtitle)+'</span><h2>'+escapeHtml(s.title)+'</h2><p>'+escapeHtml(s.flavor)+'</p><div class="action-line">'+extra+btn('Keep exploring','close','','secondary')+'</div>','spot:'+id);
}
function openQuests(){
 const lvl=levelInfo(state.xp).level;
 const html=questDefs.map(q=>{
  const earned=q.goals.filter(g=>state.steps[q.id]?.[g.id]).length;
  const locked=lvl<q.minimum;
  return '<button class="quest-item'+(isComplete(q.id)?' selected':'')+'" type="button" data-open-quest="'+q.id+'"><span aria-hidden="true">'+(isComplete(q.id)?'✦':locked?'◇':'✧')+'</span><span><strong>'+escapeHtml(q.title)+'</strong><small>'+(isComplete(q.id)?'Completed':locked?'Unlocks at Level '+q.minimum:earned+'/'+q.goals.length+' goals · +'+q.xp+' XP')+'</small></span><span class="arrow" aria-hidden="true">→</span></button>';
 }).join('');
 showDialog('<span class="overline">THE ADVENTURE BOARD</span><h2>Choose your next chapter</h2><p>Explore Evergrove and make memories beyond the screen. Every chapter is earned only once.</p><div class="items">'+html+'</div><p class="fine">All progress is saved to this browser, not a server account.</p>','quests');
}
function openQuest(id){
 const q=questDefs.find(q=>q.id===id);if(!q)return;
 const locked=levelInfo(state.xp).level<q.minimum,completed=isComplete(id);
 const rows=q.goals.map((g,i)=>{
  const checked=Boolean(state.steps[id]?.[g.id]);
  if(q.kind==='real'&&!completed)return '<label class="step-item"><input type="checkbox" data-step="'+escapeHtml(id)+'" data-goal="'+escapeHtml(g.id)+'" '+(checked?'checked':'')+'><span>'+escapeHtml(g.label)+'</span></label>';
  return '<div class="step-item"><span aria-hidden="true">'+(checked?'✦':'◇')+'</span><span>'+escapeHtml(g.label)+'</span></div>';
 }).join('');
 const all=q.goals.every(g=>state.steps[id]?.[g.id]);
 let actions='<div class="action-line">';
 if(completed)actions+=btn('Read this chapter','journal')+btn('Back to quests','quests','','secondary');
 else if(locked)actions+=btn('Back to quests','quests','','secondary');
 else if(q.kind==='real')actions+=btn('Complete this chapter','finish','data-id="'+escapeHtml(id)+'" '+(!all?'disabled':''))+btn('Back','quests','','secondary');
 else actions+=btn('Explore the map','map')+btn('Back to quests','quests','','secondary');
 actions+='</div>';
 showDialog('<span class="overline">'+(locked?'LOCKED CHAPTER':completed?'CHAPTER COMPLETED':q.kind==='real'?'REAL-WORLD ADVENTURE':'THE NEXT CHAPTER')+'</span><h2>'+escapeHtml(q.title)+'</h2><p>'+escapeHtml(q.subtitle)+'</p><div class="items">'+rows+'</div><p class="fine">'+(locked?'Reach Level '+q.minimum+' to explore.':completed?'Your memory is safely in this browser.':q.kind==='real'?'Check these off after enjoying the evening in real life.':'Visit these places in the forest to progress.')+'</p><span class="badge">✦ '+q.xp+' XP &nbsp;·&nbsp; '+q.tokens+' tokens</span>'+actions,'quest:'+id);
}
function openJournal(index=0){
 const count=state.memories.length,idx=clamp(index,0,Math.max(0,count-1)),m=count?state.memories[idx]:null;
 const content=m?'<span class="overline">CHAPTER '+(count-idx)+' OF '+count+'</span><h2>'+escapeHtml(m.title)+'</h2><p class="fine">'+escapeHtml(m.date)+'</p><p>'+escapeHtml(m.body)+'</p><div class="action-line">'+btn('Previous','journal-prev','data-index="'+idx+'" '+(idx===0?'disabled':''),'secondary')+btn('Next','journal-next','data-index="'+idx+'" '+(idx===count-1?'disabled':''),'secondary')+'</div>':'<span class="overline">THE CHRONICLE</span><h2>Every journey is a story</h2><p>Your Chronicle is empty. Complete a quest or save your first memory to begin.</p>';
 showDialog(content+'<div class="action-line">'+btn('Write a memory','write')+btn('Close book','close','','secondary')+'</div>','journal:'+idx);
}
function openWriter(){
 showDialog('<span class="overline">THE CHRONICLE</span><h2>Keep a moment</h2><p>Save a short memory in this browser. Do not use this prototype for irreplaceable private photographs or sensitive records.</p><form id="memoryForm"><label class="fine" for="memoryTitle">CHAPTER NAME</label><input id="memoryTitle" type="text" maxlength="55" required placeholder="The little things"><label class="fine" for="memoryText">YOUR STORY</label><textarea id="memoryText" maxlength="500" required placeholder="What made today worth remembering?"></textarea><div class="action-line"><button class="primary" type="submit">SAVE THIS CHAPTER</button>'+btn('Cancel','journal','','secondary')+'</div></form>','write');
}
function openMap(){
 const locations=['fox','pond','cottage','lantern','garden'];
 showDialog('<span class="overline">MAP OF THE CLEARING</span><h2>Where will you go?</h2><p>Walk there yourself or choose a destination. The garden unlocks when you reach Level 2.</p><div class="items">'+locations.map(id=>'<button class="quest-item" data-travel="'+id+'" type="button"><span>✧</span><span><strong>'+escapeHtml(spots[id].title)+'</strong><small>'+escapeHtml(spots[id].subtitle)+'</small></span><span class="arrow">→</span></button>').join('')+'</div>','map');
}
function openSettings(){
 showDialog('<span class="overline">GAME SETTINGS</span><h2>Make Evergrove yours</h2><p>Your progress belongs to this device. Start at Level 0; there are no paid levels, accounts or online saves.</p><label class="fine" for="playerName">ADVENTURER NAME</label><input type="text" id="playerName" maxlength="28" value="'+escapeHtml(state.player)+'"><div class="action-line">'+btn('Save name','save-name')+btn(state.night?'Daylight':'Moonlight','toggle-night','','secondary')+btn(state.sound?'Sound: on':'Sound: off','toggle-sound','','secondary')+'</div><div class="action-line">'+btn('Export save','export','','secondary')+btn('Reset progress','reset-confirm','','secondary')+'</div><p class="fine">A local save or exported JSON is not an encrypted family backup.</p>','settings');
}
function exportSave(){
 const safe={...state,position:{...currentPos},exportedAt:new Date().toISOString()};
 const blob=new Blob([JSON.stringify(safe,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='evergrove-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);notice('Local save exported');closeDialog();
}
function handleAction(name,source){
 const id=source.dataset.id,idx=Number(source.dataset.index||0);
 switch(name){
 case 'close':closeDialog();break;
 case 'quests':openQuests();break;
 case 'quest':openQuest(id);break;
 case 'map':openMap();break;
 case 'journal':openJournal(0);break;
 case 'journal-prev':openJournal(idx-1);break;
 case 'journal-next':openJournal(idx+1);break;
 case 'write':openWriter();break;
 case 'toggle-night':state.night=!state.night;persist();xpRefresh();openSettings();break;
 case 'toggle-sound':state.sound=!state.sound;persist();if(state.sound)play([523,659,784]);openSettings();break;
 case 'save-name':state.player=$('#playerName').value.trim().slice(0,28)||'Adventurer';persist();notice('Adventurer saved');closeDialog();break;
 case 'finish':if(!finishQuest(id))notice('Finish each little moment first');break;
 case 'export':exportSave();break;
 case 'visit':closeDialog();travelSpot(id);break;
 case 'reset-confirm':showDialog('<span class="overline">A NEW CHAPTER</span><h2>Start all over?</h2><p>This clears all Evergrove XP, unlocked chapters and memories from this browser. This cannot be undone.</p><div class="action-line">'+btn('Yes, reset everything','reset')+btn('Keep my progress','settings','','secondary')+'</div>','reset');break;
 case 'reset':state=defaultState();currentPos={...state.position};targetPos={...currentPos};persist();xpRefresh();closeDialog();$('#firstRun').hidden=false;notice('Progress cleared');break;
 }
}
function pointerWorld(e){
 const control=e.target.closest('[data-spot]');
 if(control){const kind=control.dataset.spot;if(kind==='trail'){walkFromScreen(e);return;}travelSpot(kind);return;}
 if(e.target.closest('button'))return;
 walkFromScreen(e);
}
function walkFromScreen(e){
 const svg=$('#worldArt');
 try{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const local=pt.matrixTransform(svg.getScreenCTM().inverse());moveTo(local.x,local.y);}
 catch{moveTo(470,430);}
}
function events(){
 $('#beginButton').addEventListener('click',()=>{state.seenIntro=true;persist();$('#firstRun').hidden=true;notice('Explore the clearing to begin');play([440,550,660]);});
 $('#worldStage').addEventListener('click',pointerWorld);
 document.addEventListener('click',e=>{
  const pill=e.target.closest('[data-go]');if(pill){travelSpot(pill.dataset.go);return;}
  const mov=e.target.closest('[data-move]');if(mov){const d=mov.dataset.move;walkShort(d==='left'?-35:d==='right'?35:0,d==='up'?-24:d==='down'?24:0);return;}
  const open=e.target.closest('[data-open-quest]');if(open){openQuest(open.dataset.openQuest);return;}
  const dest=e.target.closest('[data-travel]');if(dest){closeDialog();travelSpot(dest.dataset.travel);return;}
  const action=e.target.closest('[data-action]');if(action){handleAction(action.dataset.action,action);return;}
  if(e.target.closest('[data-close-dialog]'))closeDialog();
 });
 document.addEventListener('change',e=>{
  const step=e.target.closest('input[data-step]');
  if(!step)return;
  const q=questDefs.find(x=>x.id===step.dataset.step);if(!q||q.kind!=='real'||isComplete(q.id))return;
  state.steps[q.id]=state.steps[q.id]||{};
  state.steps[q.id][step.dataset.goal]=step.checked;
  persist();openQuest(q.id);
 });
 document.addEventListener('submit',e=>{
  if(e.target.id!=='memoryForm')return;
  e.preventDefault();
  const title=$('#memoryTitle').value.trim(),body=$('#memoryText').value.trim();
  if(!title||!body)return;
  const entry={id:'m-'+Date.now(),title:title.slice(0,55),body:body.slice(0,500),date:new Date().toISOString().slice(0,10)};
  state.memories.unshift(entry);persist();notice('A new Chronicle page');openJournal(0);play([500,650]);
 });
 $('#dialogClose').addEventListener('click',closeDialog);
 $('#questsButton').addEventListener('click',openQuests);
 $('#chronicleButton').addEventListener('click',()=>openJournal(0));
 $('#mapButton').addEventListener('click',openMap);
 $('#teaseButton').addEventListener('click',()=>{const id=$('#teaseButton').dataset.quest;id?openQuest(id):openQuests();});
 $('#settingsButton').addEventListener('click',openSettings);
 $('#soundButton').addEventListener('click',()=>{state.sound=!state.sound;persist();xpRefresh();if(state.sound)play([523,659]);});
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeDialog();return;}
  if(!$('#dialogLayer').hidden||!$('#firstRun').hidden)return;
  const key=e.key.toLowerCase(),dirs={arrowleft:[-22,0],a:[-22,0],arrowright:[22,0],d:[22,0],arrowup:[0,-16],w:[0,-16],arrowdown:[0,16],s:[0,16]};
  if(dirs[key]&&!e.target.closest('input,textarea')){e.preventDefault();walkShort(...dirs[key]);}
  if(e.key===' '&&!e.target.closest('button,input,textarea')){e.preventDefault();openQuests();}
 });
 $('#worldArt').addEventListener('keydown',e=>{
  const el=e.target.closest('[data-spot]');if(!el)return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();travelSpot(el.dataset.spot);}
 });
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist();});
}
function makeAmbient(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const root=$('#ambient');
 for(let i=0;i<22;i++){
  const node=document.createElement('i');
  node.style.cssText='--left:'+((i*47+13)%100)+'%;--top:'+((i*37+7)%85)+'%;--size:'+(2+i%4*2)+'px;--dur:'+(4+i%6*2)+'s;--delay:-'+(i*.75)+'s';
  root.appendChild(node);
 }
}
function initialize(){
 const clamped={x:clamp(state.position.x,245,624),y:clamp(state.position.y,361,473)};
 currentPos=clamped;targetPos={...clamped};
 $('#characterMover').style.transform='translate('+(currentPos.x-462)+'px,'+(currentPos.y-438)+'px)';
 xpRefresh();events();makeAmbient();$('#firstRun').hidden=Boolean(state.seenIntro);
 if(state.seenIntro)notice('Welcome back, '+state.player);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
})();