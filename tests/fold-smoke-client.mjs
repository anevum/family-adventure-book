// Browser-only smoke harness injected by the CI review runner (never included in the game bundle).
const $=s=>document.querySelector(s);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(value,message)=>{if(!value)throw Error(message);};
async function waitFor(check,message){
 for(let attempt=0;attempt<90;attempt++){if(check())return;await delay(45);}
 throw Error('Timed out: '+message);
}
async function run(){
 try{
 await waitFor(()=>$('#intro')?.hidden===false,'first-run entry');
 assert($('#levelNumber')?.textContent==='0','new player must start at Level 0');
 assert($('#xpText')?.textContent==='0 / 80 XP','first level XP must be zero');
 assert($('#game')?.dataset.map==='demo','GPS-off illustrated map must be default');
 assert($('#mapModeText')?.textContent.includes('NO GPS'),'demo map disclosure missing');
 assert($('#demoPins')?.querySelectorAll('[data-quest]').length===3,'demo quest pins missing');
 $('#introPlay').click();
 await waitFor(()=>$('#intro')?.hidden===true,'enter game');
 $('#nextGo').click();
 await waitFor(()=>$('#panel')?.hidden===false&&Boolean($('input[data-step-id="first"]')),'open first chapter');
 assert($('[data-action="finish"]')?.disabled===true,'quest can be completed without any steps');
 $('input[data-step-id="first"][data-step-num="0"]').click();
 assert($('[data-action="finish"]')?.disabled===true,'quest can be completed with only one step');
 $('input[data-step-id="first"][data-step-num="1"]').click();
 assert($('[data-action="finish"]')?.disabled===false,'quest remains disabled after both steps');
 $('[data-action="finish"]').click();
 await waitFor(()=>$('#levelNumber')?.textContent==='1','Level 1 progression');
 const save=JSON.parse(localStorage.getItem('the-fold-local-playtest-v1'));
 assert(save.done?.length===1&&save.done[0].id==='first','exactly one chapter must be saved');
 assert($('#xpText')?.textContent.includes('0 / 100 XP'),'XP progression to level 1 incorrect');
 assert(document.documentElement.scrollWidth<=window.innerWidth+1,'horizontal page overflow');
 assert(document.documentElement.scrollHeight<=window.innerHeight+1,'vertical page overflow');
 await waitFor(()=>$('#celebrate')?.hidden===true,'reward overlay dismissal');
 document.documentElement.dataset.foldSmoke='pass';
}catch(error){
 document.documentElement.dataset.foldSmoke='fail';
 document.documentElement.dataset.foldSmokeError=String(error.message).slice(0,180);
}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
