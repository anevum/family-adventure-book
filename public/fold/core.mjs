// THE FOLD — deterministic local prototype game rules. No GPS, accounts or networking here.
export const SAVE_KEY='the-fold-local-playtest-v1';
export const QUESTS=Object.freeze([
 {id:'first',title:'The First Page',symbol:'✦',kind:'Start here',description:'Start your story with one small adventure today. It can happen anywhere.',xp:80,steps:['Choose something simple and meaningful to do today','Do it, then return to close the chapter'],suggestion:'A favorite song, a little walk, a conversation, or a new snack.'},
 {id:'us',title:'Just Us',symbol:'♡',kind:'Together',description:'Make intentional time for someone you care about. The game does not claim anyone else participated.',xp:65,steps:['Choose a simple activity to share','Enjoy that time together'],suggestion:'Make breakfast together, try a two-person game, or take a quiet break.'},
 {id:'home',title:'Homebound',symbol:'⌂',kind:'At home',description:'An adventure does not have to cost money or require travel.',xp:60,steps:['Choose a tiny home activity','Finish it, however you like'],suggestion:'Cook something, make a blanket fort, plant a seed, or reorganize a favorite nook.'},
 {id:'wonder',title:'Small Wonder',symbol:'✧',kind:'Explore',description:'Notice something you would usually pass by. You can do this without GPS.',xp:55,steps:['Look for one overlooked detail around you','Take a minute to really notice it'],suggestion:'A pattern in the clouds, a bird, a new public spot on the map, or a familiar street.'},
 {id:'memory',title:'Memory Lane',symbol:'▤',kind:'Remember',description:'Revisit something that meant a lot to you or someone in your circle.',xp:45,steps:['Think of a meaningful shared moment','Retell it, or remember it in your own way'],suggestion:'A favorite trip, a first date, or a story from childhood.'},
 {id:'kind',title:'Little Kindness',symbol:'❀',kind:'Care',description:'Do one thoughtful thing without expectation of a reward from another person.',xp:50,steps:['Choose one small, welcome act of kindness','Complete it respectfully'],suggestion:'Share a genuine compliment, offer help, or make a kind note.'},
 {id:'ritual',title:'Our Ritual',symbol:'☼',kind:'Traditions',description:'Start or celebrate a small tradition, alone or with your people.',xp:70,steps:['Choose something you would like to repeat','Try the tradition once'],suggestion:'A weekly puzzle, family cooking night, evening tea, or a shared Sunday walk.'}
]);
export const QUEST_MAP=Object.fromEntries(QUESTS.map(q=>[q.id,q]));
export const xpToNext = level => 80+20*level;
export const xpForLevel = level => 10*level*level+70*level;
export function progression(total){
 const xp=Math.min(1_000_000,Math.max(0,Math.floor(Number(total)||0)));
 let level=0;while(xpForLevel(level+1)<=xp&&level<500)level++;
 return {level,total:xp,inLevel:xp-xpForLevel(level),target:xpToNext(level),fraction:(xp-xpForLevel(level))/xpToNext(level)};
}
export function newSave(){return {version:1,seenIntro:false,name:'Explorer',done:[],steps:{},createdAt:new Date().toISOString()};}
export function cleanText(value,max=300){return typeof value==='string'?value.trim().slice(0,max):'';}
export function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;':'&quot;',"'":'&#39;'}[c]));}
export function normalizeSave(input){
 const fallback=newSave();
 if(!input||typeof input!=='object'||Array.isArray(input)||input.version!==1)return fallback;
 const done=[],seen=new Set();
 for(const item of Array.isArray(input.done)?input.done.slice(0,40):[]){
  if(!item||typeof item!=='object'||!QUEST_MAP[item.id]||seen.has(item.id))continue;
  seen.add(item.id);done.push({id:item.id,when:/^\d{4}-\d{2}-\d{2}$/.test(item.when||'')?item.when:'',note:cleanText(item.note,300)});
 }
 const steps={};
 if(input.steps&&typeof input.steps==='object'&&!Array.isArray(input.steps))for(const q of QUESTS){
  if(Array.isArray(input.steps[q.id]))steps[q.id]=q.steps.map((_,idx)=>input.steps[q.id][idx]===true);
 }
 return {version:1,seenIntro:input.seenIntro===true,name:cleanText(input.name,28)||fallback.name,done,steps,createdAt:typeof input.createdAt==='string'?input.createdAt.slice(0,40):fallback.createdAt};
}
export function loadSave(raw){try{return normalizeSave(JSON.parse(raw));}catch{return newSave();}}
export function earnedXP(save){return normalizeSave(save).done.reduce((sum,entry)=>sum+QUEST_MAP[entry.id].xp,0);}
export function isDone(save,id){return Boolean(save?.done?.some(d=>d.id===id));}
export function stepProgress(save,id){const q=QUEST_MAP[id];return q? q.steps.map((_,i)=>save.steps?.[id]?.[i]===true):[];}
export function setStep(save,id,index,checked){
 const q=QUEST_MAP[id];if(!q||isDone(save,id)||!Number.isInteger(index)||index<0||index>=q.steps.length)return save;
 const next=normalizeSave(save);const arr=stepProgress(next,id);arr[index]=checked===true;next.steps[id]=arr;return next;
}
export function completeQuest(save,id,note='',date=new Date()){
 const q=QUEST_MAP[id];const existing=normalizeSave(save);
 if(!q||isDone(existing,id))return {save:existing,awarded:false,reason:'already-complete'};
 if(!stepProgress(existing,id).every(Boolean))return {save:existing,awarded:false,reason:'steps-incomplete'};
 const before=progression(earnedXP(existing));
 const next={...existing,done:[...existing.done,{id,when:date.toISOString().slice(0,10),note:cleanText(note,300)}]};
 const after=progression(earnedXP(next));
 return {save:next,awarded:true,xp:q.xp,before,after,levelUp:after.level>before.level};
}
