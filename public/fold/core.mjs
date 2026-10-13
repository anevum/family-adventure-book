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
// Repeatable, deliberately self-reported activities. One award per template per device-local calendar day.
// These are *not* verified attendance, partner participation, real-world venues or server-authenticated XP.
export const DAILY_QUESTS=Object.freeze([
 {id:'spark',title:'A Small Spark',kind:'Daily · Anywhere',description:'Make room for a small, genuine experience today.',xp:20,steps:['Choose one meaningful little activity','Actually do it before closing this expedition'],suggestion:'Try a new recipe, sketch for ten minutes, take a quiet break or learn something.'},
 {id:'connection',title:'A Shared Moment',kind:'Daily · Connection',description:'Give someone your undivided attention, if you have someone available.',xp:25,steps:['Choose a welcome way to connect with another person','Take part in that moment and return to record it'],suggestion:'A conversation, a game or a shared meal. No other person is represented as having joined the app.'},
 {id:'curiosity',title:'Follow Your Curiosity',kind:'Daily · Discovery',description:'Find something new to notice, indoors or outdoors. GPS is never needed.',xp:25,steps:['Choose a small thing to discover or explore','Spend some time with it, then return'],suggestion:'Examine a plant, explore a book, or visit somewhere on your own terms.'}
]);
export const DAILY_QUEST_MAP=Object.fromEntries(DAILY_QUESTS.map(q=>[q.id,q]));
export const MAX_DAILY_RECORDS=5000;
export function localDay(date=new Date()){
 if(!(date instanceof Date)||!Number.isFinite(date.getTime()))return '';
 return String(date.getFullYear()).padStart(4,'0')+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
}
export function isValidDay(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T12:00:00Z');
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
export function dailyKey(id,day){return DAILY_QUEST_MAP[id]&&isValidDay(day)?day+':'+id:'';}

export const xpToNext = level => 80+20*level;
export const xpForLevel = level => 10*level*level+70*level;
export function progression(total){
 const number=Number(total);const xp=Number.isFinite(number)?Math.max(0,Math.floor(number)):0;
 const level=Math.max(0,Math.floor((-7+Math.sqrt(49+0.4*xp))/2));
 return {level,total:xp,inLevel:xp-xpForLevel(level),target:xpToNext(level),fraction:(xp-xpForLevel(level))/xpToNext(level)};
}
export function newSave(){return {version:1,seenIntro:false,name:'Explorer',done:[],steps:{},runs:[],dailySteps:{},createdAt:new Date().toISOString()};}
export function cleanText(value,max=300){return typeof value==='string'?value.trim().slice(0,max):'';}
export function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
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
 const runs=[],seenRuns=new Set();
 for(const item of Array.isArray(input.runs)?input.runs.slice(0,MAX_DAILY_RECORDS):[]){
  if(!item||typeof item!=='object'||!DAILY_QUEST_MAP[item.id]||!isValidDay(item.day))continue;
  const key=dailyKey(item.id,item.day);
  if(seenRuns.has(key))continue;
  seenRuns.add(key);runs.push({id:item.id,day:item.day,note:cleanText(item.note,300)});
 }
 const dailySteps={};
 if(input.dailySteps&&typeof input.dailySteps==='object'&&!Array.isArray(input.dailySteps)){
  // In-progress checkbox data is not a historical record; keep a small bounded working set.
  const keys=Object.keys(input.dailySteps).slice(-90);
  for(const key of keys){
   const match=/^(\d{4}-\d{2}-\d{2}):(spark|connection|curiosity)$/.exec(key);
   if(!match||!dailyKey(match[2],match[1])||!Array.isArray(input.dailySteps[key]))continue;
   const q=DAILY_QUEST_MAP[match[2]];
   dailySteps[key]=q.steps.map((_,idx)=>input.dailySteps[key][idx]===true);
  }
 }
 return {version:1,seenIntro:input.seenIntro===true,name:cleanText(input.name,28)||fallback.name,done,steps,runs,dailySteps,createdAt:typeof input.createdAt==='string'?input.createdAt.slice(0,40):fallback.createdAt};
}
export function loadSave(raw){try{return normalizeSave(JSON.parse(raw));}catch{return newSave();}}
export function earnedXP(save){
 const safe=normalizeSave(save);
 return safe.done.reduce((sum,entry)=>sum+QUEST_MAP[entry.id].xp,0)+
  safe.runs.reduce((sum,entry)=>sum+DAILY_QUEST_MAP[entry.id].xp,0);
}
export function dailyDone(save,id,day=localDay()){
 const key=dailyKey(id,day);
 return Boolean(key&&save?.runs?.some(entry=>entry.day===day&&entry.id===id));
}
export function dailyStepProgress(save,id,day=localDay()){
 const q=DAILY_QUEST_MAP[id],key=dailyKey(id,day);
 return q&&key?q.steps.map((_,i)=>save?.dailySteps?.[key]?.[i]===true):[];
}
export function setDailyStep(save,id,index,checked,day=localDay()){
 const q=DAILY_QUEST_MAP[id],key=dailyKey(id,day);
 if(!q||!key||dailyDone(save,id,day)||!Number.isInteger(index)||index<0||index>=q.steps.length)return save;
 const next=normalizeSave(save),steps=dailyStepProgress(next,id,day);
 steps[index]=checked===true;next.dailySteps[key]=steps;
 return next;
}
export function completeDaily(save,id,note='',date=new Date()){
 const q=DAILY_QUEST_MAP[id],day=localDay(date),key=dailyKey(id,day),existing=normalizeSave(save);
 if(!q||!key)return {save:existing,awarded:false,reason:'invalid-quest'};
 if(dailyDone(existing,id,day))return {save:existing,awarded:false,reason:'already-complete'};
 if(existing.runs.length>=MAX_DAILY_RECORDS)return {save:existing,awarded:false,reason:'save-full'};
 if(!dailyStepProgress(existing,id,day).every(Boolean))return {save:existing,awarded:false,reason:'steps-incomplete'};
 const before=progression(earnedXP(existing));
 const dailySteps={...existing.dailySteps};delete dailySteps[key];
 const next={...existing,runs:[...existing.runs,{id,day,note:cleanText(note,300)}],dailySteps};
 const after=progression(earnedXP(next));
 return {save:next,awarded:true,xp:q.xp,before,after,levelUp:after.level>before.level};
}
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
