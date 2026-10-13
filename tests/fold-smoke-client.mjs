// Browser-only acceptance harness injected by the local CI runner. Never shipped in game.
const $=s=>document.querySelector(s);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(value,message)=>{if(!value)throw Error(message);};
const scenario=new URL(location.href).searchParams.get('scenario')||'playthrough';
async function waitFor(check,message){
 for(let attempt=0;attempt<100;attempt++){if(check())return;await delay(40);}
 throw Error('Timed out: '+message);
}
function inViewport(node){
 const r=node.getBoundingClientRect();
 return r.width>0&&r.height>0&&r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1;
}
function assertNoOverflow(){
 assert(document.documentElement.scrollWidth<=innerWidth+1,'Horizontal viewport overflow');
 assert(document.documentElement.scrollHeight<=innerHeight+1,'Vertical viewport overflow');
}
async function assertIcons(){
 const sprite=await fetch('./icons.svg');
 assert(sprite.ok,'Custom Fold glyph sprite was not delivered');
 assert((sprite.headers.get('content-type')||'').includes('image/svg+xml'),'Incorrect SVG MIME type');
 const text=await sprite.text();
 const xml=new DOMParser().parseFromString(text,'image/svg+xml');
 assert(!xml.querySelector('parsererror'),'SVG sprite is malformed');
 const all=[...document.querySelectorAll('use[href*="#ic-"]')];
 assert(all.length>=14,'Game HUD has too few custom glyphs');
 for(const use of all){
  const id=use.getAttribute('href')?.split('#')[1];
  assert(Boolean(id)&&Boolean(xml.getElementById(id)),'Missing glyph: '+id);
 }
}
async function run(){
 try{
  await waitFor(()=>$('#intro')?.hidden===false,'first-run entrance');
  await assertIcons();
  assert($('#levelNumber')?.textContent==='0','Start level must be zero');
  assert($('#xpText')?.textContent==='0 / 80 XP','First level XP must be zero');
  assert($('#game')?.dataset.map==='demo','Illustrated map must be default without GPS');
  assert($('#mapModeText')?.textContent.includes('NO GPS'),'Demo GPS disclosure missing');
  assert($('#demoPins')?.querySelectorAll('[data-quest]').length===3,'Demo quest pins missing');
  if(scenario==='intro'){await delay(520);document.documentElement.dataset.foldSmoke='pass';return;}
  $('#introPlay').click();
  await waitFor(()=>$('#intro')?.hidden===true,'enter game');
  assertNoOverflow();
  assert(inViewport($('#progressButton')),'XP HUD outside viewport');
  assert(inViewport($('#privacyButton')),'Privacy control outside viewport');
  assert(inViewport($('#nextGo')),'Primary action outside viewport');
  assert(inViewport($('[data-panel="quests"]')),'Quest navigation outside viewport');
  if(scenario==='world'){
   assert($('#panel').hidden,'World overview obscured by a panel');
   assert($('[data-quest="first"]')?.getBoundingClientRect().width>0,'World quest pin missing');
   await delay(520);document.documentElement.dataset.foldSmoke='pass';
   return;
  }
  if(scenario==='quests'||scenario==='starter'){
   $('[data-panel="quests"]').click();
   await waitFor(()=>!$('#panel').hidden&&Boolean($('.quest-choice')),'Quest board open');
   assert($('#panel').dataset.view==='quests','Quest board not correctly labeled');
   if(scenario==='starter'){
    $('[data-action="quest-tab"][data-tab="starter"]').click();
    await waitFor(()=>Boolean($('[data-quest="first"]')),'Starter board');
    assert($('[data-action="quest-tab"][data-tab="starter"]')?.getAttribute('aria-pressed')==='true','Starter tab not active');
   }else{
    assert(Boolean($('[data-daily-quest="spark"]')),'Daily board missing');
    assert($('.quest-tabs button[aria-pressed="true"]')?.dataset.tab==='today','Today tab not active');
   }
   assert($('.quest-choice .glyph use')?.getAttribute('href')?.includes('ic-'),'Quest emblems are not SVG');
   assertNoOverflow();
   await delay(520);document.documentElement.dataset.foldSmoke='pass';
   return;
  }
  if(scenario==='daily'){
   $('[data-panel="quests"]').click();
   await waitFor(()=>Boolean($('[data-daily-quest="spark"]')),'Daily adventure board');
   $('[data-daily-quest="spark"]').click();
   await waitFor(()=>Boolean($('input[data-daily-step-id="spark"]')),'Daily detail');
   assert($('#panel').dataset.view==='daily:spark','Daily panel classification missing');
   assert($('[data-action="finish-daily"]')?.disabled===true,'Daily reward unlocked too early');
   $('input[data-daily-step-id="spark"][data-step-num="0"]').click();
   assert($('[data-action="finish-daily"]')?.disabled===true,'Daily one-step claim');
   $('input[data-daily-step-id="spark"][data-step-num="1"]').click();
   assert($('[data-action="finish-daily"]')?.disabled===false,'Daily two-step claim stays disabled');
   $('#questNote').value='Today I did something meaningful.';
   $('[data-action="finish-daily"]').click();
   await waitFor(()=>$('#xpText')?.textContent==='20 / 80 XP','Daily award in HUD');
   const save=JSON.parse(localStorage.getItem('the-fold-local-playtest-v1'));
   assert(save.runs?.length===1&&save.runs[0].id==='spark','Daily chapter not saved exactly once');
   assert(save.runs[0].note==='Today I did something meaningful.','Daily memory not recorded');
   await waitFor(()=>$('#celebrate')?.hidden===true,'Daily reward dismissal');
   if($('#panel').hidden)$('[data-panel="book"]').click();
   await waitFor(()=>!$('#panel').hidden,'Book after daily reward');
   if(!$('#panel').dataset.view.startsWith('book'))$('[data-panel="book"]').click();
   assert($('.book-stamp')?.textContent?.includes('DAILY EXPEDITION')||$('.book-entry')?.textContent?.includes('A Small Spark'),'Daily chapter absent from Adventure Book');
   assertNoOverflow();
   await delay(520);document.documentElement.dataset.foldSmoke='pass';
   return;
  }
  // Existing first-chapter contract remains the same.
  $('#nextGo').click();
  await waitFor(()=>!$('#panel').hidden&&Boolean($('input[data-step-id="first"]')),'first chapter open');
  assert($('#panel').dataset.view==='quest:first','quest modal role not set');
  assert($('[data-action="finish"]')?.disabled===true,'Unfinished quest could award XP');
  $('input[data-step-id="first"][data-step-num="0"]').click();
  assert($('[data-action="finish"]')?.disabled===true,'One checkpoint allowed completion');
  $('input[data-step-id="first"][data-step-num="1"]').click();
  assert($('[data-action="finish"]')?.disabled===false,'Two checkpoints failed to unlock completion');
  $('[data-action="finish"]').click();
  await waitFor(()=>$('#levelNumber')?.textContent==='1','level up');
  const save=JSON.parse(localStorage.getItem('the-fold-local-playtest-v1'));
  assert(save.done?.length===1&&save.done[0].id==='first','Not exactly one saved chapter');
  assert($('#xpText')?.textContent.includes('0 / 100 XP'),'Level 1 XP wrong');
  await waitFor(()=>$('#celebrate')?.hidden===true,'reward overlay');
  if(scenario==='book'){
   // The automatic chapter panel may already be opening.
   if($('#panel').hidden)$('[data-panel="book"]').click();
   await waitFor(()=>!$('#panel').hidden&&$('#panel').dataset.view.startsWith('book'),'book chapter open');
   assert($('#panelBody .book-stamp')||$('#panelBody .book-entry'),'Book visual state missing');
  }
  assertNoOverflow();
  await delay(520);document.documentElement.dataset.foldSmoke='pass';
 }catch(error){
  document.documentElement.dataset.foldSmoke='fail';
  document.documentElement.dataset.foldSmokeError=String(error.message).slice(0,180);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
