import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read=(path)=>readFileSync(path,'utf8');
const html=read('public/index.html');
const js=read('public/assets/app.js');
const css=read('public/assets/style.css');
for(const p of ['public/manifest.webmanifest','public/service-worker.js','public/_headers','public/assets/icons/icon.svg'])assert.ok(existsSync(p), 'Missing '+p);
for(const view of ['home','quests','chronicle','calendar','crew'])assert.ok(html.includes('id="view-'+view+'"'),'Missing view '+view);
for(const text of ['PLAYABLE DEMO','id="characterMover"','data-world-action="trail"'])assert.ok(html.includes(text),'Missing scene element '+text);
for(const label of ['function walkToPoint(','function worldAction(','localStorage','function renderCalendar'])assert.ok(js.includes(label),'Missing behavior '+label);
assert.ok(css.includes('character-walking'),'Missing walk animation');
assert.ok(html.includes('noindex'),'Search indexing guard missing');
assert.ok(!html.includes('icon-192.png'),'Stale asset reference');
console.log('Adventure Book source smoke checks passed');

/* First real-world quest regression — no personal details in public source. */
assert.ok(existsSync('public/assets/adventure.css'), 'Missing first-adventure styles');
assert.ok(html.includes('assets/adventure.css'), 'First-adventure styles not loaded');
for(const id of ['importAdventureBtn','importAdventureFile'])assert.ok(html.includes('id="'+id+'"'),'Missing private import control '+id);
assert.ok(html.includes('data-quest-template="cozy-evening"'),'Missing reusable cozy-night template');
for(const fragment of [
  "schema!=='evergrove-adventure-v1'",
  "const prettyTime =",
  "const validCalendarDate =",
  "q.steps[index].done=box.checked",
  "q.template==='cozy-evening'",
  "root.dataset.questTemplate=",
  "questId:q.id",
  "function importAdventure(",
  "function questStepsMarkup(",
  "world-hearthlight"
])assert.ok(js.includes(fragment),'Missing adventure behavior: '+fragment);
assert.ok(!js.includes('Devon')&&!js.includes('Brandi'),'Do not commit private family names into the public runtime');

import { Script, createContext } from 'node:vm';
const sourceWithProbe=js.replace(/\}\)\(\);\s*$/, 'globalThis.__probe={cozyEvening,validCalendarDate,prettyTime,badgeRules,initialState};})();');
assert.notEqual(sourceWithProbe,js,'Could not instrument adventure source test');
const context=createContext({
  document:{readyState:'loading',addEventListener(){}},
  localStorage:{getItem(){return null;}},
  console
});
new Script(sourceWithProbe,{filename:'public/assets/app.js'}).runInContext(context);
const api=context.__probe;
assert.ok(api,'Adventure source did not initialize for regression test');
assert.equal(api.validCalendarDate('2026-10-12'),true);
assert.equal(api.validCalendarDate('2026-02-29'),false);
assert.equal(api.validCalendarDate('2026-13-12'),false);
assert.ok(api.prettyTime('22:00'));
assert.equal(api.prettyTime('99:00'),'');
assert.equal(api.cozyEvening.steps.length,3);
const completed=api.initialState();
completed.quests.push({id:'test1',template:'cozy-evening',status:'completed'});
assert.equal(api.badgeRules.find(b=>b.id==='hearthlight').check(completed),true);
console.log('Evergrove first-adventure source and logic checks passed');
