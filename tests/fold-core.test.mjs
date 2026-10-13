import test from 'node:test';
import assert from 'node:assert/strict';
import {SAVE_KEY,QUESTS,newSave,normalizeSave,loadSave,progression,xpToNext,xpForLevel,earnedXP,isDone,setStep,stepProgress,completeQuest,escapeHtml} from '../public/fold/core.mjs';
import {SAMPLE_CENTER,BASE_STYLE,ATLAS,validMapPoint,atlasPaintFor,applyFoldAtlas} from '../public/fold/atlas.mjs';

test('all first-time players start Level 0, zero XP and no chapters',()=>{
 const s=newSave();assert.equal(s.done.length,0);assert.equal(earnedXP(s),0);assert.equal(progression(0).level,0);
 assert.equal(progression(79).level,0);assert.equal(progression(80).level,1);assert.equal(progression(179).level,1);assert.equal(progression(180).level,2);
 assert.equal(xpToNext(0),80);assert.equal(xpForLevel(10),1700);assert.equal(progression(xpForLevel(1000)).level,1000);
 assert.equal(SAVE_KEY,'the-fold-local-playtest-v1');
});
test('chapter cannot earn XP until each explicit step is completed',()=>{
 const s=newSave();assert.equal(completeQuest(s,'first').awarded,false);
 const a=setStep(s,'first',0,true);assert.equal(completeQuest(a,'first').awarded,false);
 const b=setStep(a,'first',1,true),result=completeQuest(b,'first','First little moment',new Date('2026-10-13T00:00:00Z'));
 assert.equal(result.awarded,true);assert.equal(result.xp,80);assert.equal(result.before.level,0);assert.equal(result.after.level,1);assert.equal(result.levelUp,true);
 assert.equal(result.save.done[0].when,'2026-10-13');assert.equal(result.save.done[0].note,'First little moment');
 assert.equal(earnedXP(result.save),80);assert.equal(completeQuest(result.save,'first').awarded,false);
});
test('repeated tap, replay and reload do not duplicate rewards',()=>{
 const done=completeQuest(setStep(setStep(newSave(),'first',0,true),'first',1,true),'first').save;
 const copy=loadSave(JSON.stringify(done));assert.equal(earnedXP(copy),80);assert.equal(isDone(copy,'first'),true);
 assert.equal(completeQuest(copy,'first').awarded,false);
 const tampered={...copy,done:[...copy.done,...copy.done]};
 assert.equal(earnedXP(tampered),80);
});
test('no-GPS quests remain available and earn independently',()=>{
 let s=newSave();for(const id of ['home','wonder']){const q=QUESTS.find(q=>q.id===id);q.steps.forEach((_,i)=>s=setStep(s,id,i,true));const result=completeQuest(s,id);assert.equal(result.awarded,true);s=result.save;}
 assert.equal(earnedXP(s),115);
 assert.equal(s.done.length,2);assert.deepEqual(stepProgress(s,'wonder'),[true,true]);
 assert.equal(QUESTS.length,7);
});
test('malformed saves, oversized notes, names and injected HTML are bounded',()=>{
 assert.equal(loadSave('bad json').done.length,0);assert.equal(normalizeSave({version:333}).name,'Explorer');
 const bad={version:1,seenIntro:true,name:'X'.repeat(200),done:[{id:'first',note:'a'.repeat(2000),when:'invalid'},{id:'first',note:'again'},{id:'missing'}],steps:{first:[true,'false']}};
 const safe=normalizeSave(bad);assert.equal(safe.name.length,28);assert.equal(safe.done.length,1);assert.equal(safe.done[0].note.length,300);
 assert.deepEqual(stepProgress(safe,'first'),[true,false]);
 assert.equal(escapeHtml('<img src=x onerror="x">&'), '&lt;img src=x onerror=&quot;x&quot;&gt;&amp;');
});
test('invalid IDs, invalid steps and incomplete quests never award',()=>{
 const s=newSave();
 assert.equal(setStep(s,'nope',0,true),s);
 assert.equal(setStep(s,'first',-1,true),s);
 assert.equal(completeQuest(s,'nope').awarded,false);
 assert.equal(completeQuest(s,'first').awarded,false);
});

test('live map uses a clearly defined example location without requesting GPS',()=>{
 assert.deepEqual([...SAMPLE_CENTER],[-122.338,47.610]);
 assert.match(BASE_STYLE,/^https:\/\//);
 assert.deepEqual(validMapPoint(-81.28,28.25),[-81.28,28.25]);
 for(const coordinates of [[NaN,0],[181,0],[-181,0],[0,90],[0,-90],['-81',28],[null,28],[Infinity,25]]){
  assert.equal(validMapPoint(...coordinates),null);
 }
});
test('illustrated atlas only repaints recognized geographical layers',()=>{
 assert.deepEqual(atlasPaintFor({id:'water',type:'fill'}),[['fill-color',ATLAS.water]]);
 assert.deepEqual(atlasPaintFor({id:'park-fill',type:'fill'}),[['fill-color',ATLAS.park]]);
 assert.deepEqual(atlasPaintFor({id:'building',type:'fill'}),[['fill-color',ATLAS.building]]);
 assert.deepEqual(atlasPaintFor({id:'roads-major',type:'line'}),[['line-color',ATLAS.roadMajor]]);
 assert.deepEqual(atlasPaintFor({id:'road-label',type:'symbol'})[0],['text-color',ATLAS.ink]);
 assert.deepEqual(atlasPaintFor({id:'hillshading',type:'raster'}),[]);
 assert.deepEqual(atlasPaintFor(null),[]);
});
test('atlas gracefully skips unavailable map styles and unsupported properties',()=>{
 assert.deepEqual(applyFoldAtlas(null),{layers:0,painted:0});
 assert.deepEqual(applyFoldAtlas({getStyle:()=>({layers:[]}),setPaintProperty(){}}),{layers:0,painted:0});
 const calls=[];
 const fake={getStyle:()=>({layers:[{id:'background',type:'background'},{id:'water',type:'fill'},{id:'poi',type:'symbol'}]}),
  setPaintProperty(id,key,value){calls.push([id,key,value]);if(id==='poi')throw Error('unsupported layer paint');}};
 const result=applyFoldAtlas(fake);
 assert.deepEqual(result,{layers:3,painted:2});
 assert.deepEqual(calls[0],['background','background-color',ATLAS.paper]);
 assert.deepEqual(calls[1],['water','fill-color',ATLAS.water]);
});
