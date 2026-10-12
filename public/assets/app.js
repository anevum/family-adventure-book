/* THE ADVENTURE BOOK - Playable vertical slice / no third-party services */
(() => {
  'use strict';
  const STORAGE_KEY = 'adventure_book_local_preview_v1';
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const dayAt = offset => { const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+offset); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
  const todayStr = () => dayAt(0);
  const escapeHtml = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const prettyDate = (d, opt={month:'long',day:'numeric',year:'numeric'}) => d ? new Date(`${d}T12:00:00`).toLocaleDateString(undefined,opt) : '';
  const colorMap = {moss:'#7ba999',coral:'#c58b79',lavender:'#a498be',blue:'#7cacc2',gold:'#d2ae73'};
  // Generic quest templates only. Personal adventure details belong in local browser saves.
  const cozyEvening = {
    title:'A Cozy Night In',
    description:'Share a favorite dessert, settle in for a movie, and make time for relaxing shoulder rubs. Enjoy the evening in whatever order works.',
    category:'Together',duration:'2 hours',audience:'adults',icon:'heart',
    steps:[
      {label:'Enjoy dessert together',done:false},
      {label:'Trade relaxing shoulder rubs',done:false},
      {label:'Settle in for a movie',done:false}
    ]
  };
  const prettyTime = time => /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time||'')
    ? new Date('2000-01-01T'+time+':00').toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}) : '';
  const validCalendarDate = date => {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return false;
    const d=new Date(date+'T12:00:00');
    return !Number.isNaN(d.getTime()) && [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')===date;
  };
  const badgeRules = [
    {id:'first-quest',name:'The First Step',description:'Complete your first adventure',emoji:'✦',check:s=>s.quests.filter(q=>q.status==='completed').length>=1},
    {id:'storykeeper',name:'Storykeeper',description:'Save your first memory',emoji:'❧',check:s=>s.memories.length>=1},
    {id:'three-quests',name:'Curious Wanderers',description:'Complete three adventures',emoji:'✺',check:s=>s.quests.filter(q=>q.status==='completed').length>=3},
    {id:'five-memories',name:'A Thousand Stories',description:'Save five memories',emoji:'✿',check:s=>s.memories.length>=5},
    {id:'three-crew',name:'Together We Go',description:'Welcome a third adventurer',emoji:'♧',check:s=>s.crew.length>=3},
    {id:'hearthlight',name:'Hearthlight',description:'Finish a cozy evening adventure together',emoji:'♡',check:s=>s.quests.some(q=>q.template==='cozy-evening'&&q.status==='completed')}
  ];
  const iconPaths = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.8 4.4-4.4 2.8 2.8-4.4z"/>',
    book:'<path d="M3 5.5a2 2 0 0 1 2-2c3-.2 5.2.5 7 2 1.8-1.5 4-2.2 7-2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2c-3-.2-5.2.5-7 2-1.8-1.5-4-2.2-7-2a2 2 0 0 1-2-2z"/><path d="M12 5.5v16"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><circle cx="8" cy="15" r="1"/><circle cx="13" cy="15" r="1"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v1"/>',
    moon:'<path d="M20 15.5a8.4 8.4 0 0 1-11.5-11A8.5 8.5 0 1 0 20 15.5z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9 6.3 6.3M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    'volume-off':'<path d="M11 5 6 9H3v6h3l5 4V5zM17 9l5 6M22 9l-5 6"/>',
    volume:'<path d="M11 5 6 9H3v6h3l5 4V5zM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    x:'<path d="M5 5l14 14M19 5 5 19"/>',
    'arrow-up-right':'<path d="M5 19 19 5M8 5h11v11"/>',
    'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'chevron-left':'<path d="m15 18-6-6 6-6"/>',
    'chevron-right':'<path d="m9 18 6-6-6-6"/>',
    sparkles:'<path d="m12 3 1.5 5L19 10l-5.5 2-1.5 5-1.5-5L5 10l5.5-2L12 3ZM19 16l.6 2.2L22 19l-2.4.8L19 22l-.7-2.2L16 19l2.3-.8L19 16Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star:'<path d="m12 2 3 6.5 7 1-5 5 1.2 7.2-6.2-3.5-6.2 3.5L7 14.5l-5-5 7-1z"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    download:'<path d="M12 3v13m-5-5 5 5 5-5M4 17v3h16v-3"/>',
    'rotate-ccw':'<path d="M3 9V3h6M3 9a9 9 0 1 1-1 5"/>',
    map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/>',
    camera:'<path d="M4 7h4l2-3h5l2 3h3a1 1 0 0 1 1 1v11H3V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/>',
    heart:'<path d="M20.8 8.7c0 4.9-8.8 11.5-8.8 11.5S3.2 13.6 3.2 8.7c0-5.3 6.2-6.2 8.8-2.5 2.6-3.7 8.8-2.8 8.8 2.5z"/>',
    leaf:'<path d="M20 3c-9 0-17 4-17 12a6 6 0 0 0 6 6c8 0 11-8 11-18ZM4 20c4-6 8-9 13-12"/>',
    gift:'<rect x="4" y="9" width="16" height="12" rx="1"/><path d="M2 9h20v4H2zM12 9v12M12 9c-6 0-9-2-8-5s7-1 8 5ZM12 9c6 0 9-2 8-5s-7-1-8 5Z"/>',
    bookmark:'<path d="M6 3h12v18l-6-4-6 4V3z"/>',
    alert:'<path d="M12 3 2 21h20L12 3ZM12 9v5m0 4v.3"/>',
    tent:'<path d="m12 3 10 18H2L12 3zM12 3v18m0 0-4-8-4 8"/>',
    coffee:'<path d="M4 8h13v7a6.5 6.5 0 0 1-13 0V8ZM17 9h2a3 3 0 0 1 0 6h-2M3 21h16"/>',
    palette:'<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 1-4c-1.2-.6-.7-2 .6-2H18a4 4 0 0 0 4-4c0-5-4.5-8-10-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="17" cy="10" r="1"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v6m0-10v.3"/>'
  };
  const icon = (name, size=18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.star}</svg>`;
  const hydrateIcons = (root=document) => $$('[data-icon]',root).forEach(el=>{el.innerHTML=icon(el.dataset.icon);});

  function initialState(){
    return {
      version:1, xp:186,tokens:45,theme:'dusk',sound:false,
      crew:[
        {id:'p1',name:'You',title:'Keeper of Stories',color:'moss',xp:96},
        {id:'p2',name:'Adventure Buddy',title:'Collector of Wonders',color:'coral',xp:90}
      ],
      quests:[
        {id:'q1',title:'The Great Backyard Campout',description:'Turn the backyard into a tiny wilderness. Make a cozy snack, tell stories and look for stars.',category:'Explore',duration:'1–2 hours',xp:80,icon:'tent',status:'ready'},
        {id:'q2',title:'Sunset Stroll & Stories',description:'Walk somewhere lovely and share your favorite moment from the day.',category:'Together',duration:'30 minutes',xp:50,icon:'sun',status:'ready'},
        {id:'q3',title:'The Secret Recipe Club',description:'Choose something new to cook and give your creation a family name.',category:'At Home',duration:'1 hour',xp:65,icon:'coffee',status:'planned',date:dayAt(5)},
        {id:'q4',title:'Explore Somewhere New',description:'Find a nearby trail, little shop or park none of you have visited.',category:'Explore',duration:'2+ hours',xp:90,icon:'compass',status:'ready'},
        {id:'q5',title:'The Great Blanket Fort',description:'Build a fort, choose a movie and make it the coziest cinema ever.',category:'Together',duration:'2 hours',xp:60,icon:'heart',status:'completed',completedAt:dayAt(-2)},
        {id:'q6',title:'The Photo Treasure Hunt',description:'Capture something colorful, something tiny and something unexpectedly beautiful.',category:'Creative',duration:'45 minutes',xp:55,icon:'camera',status:'ready'}
      ],
      memories:[
        {id:'m1',title:'Our First Little Chapter',body:'Every wonderful story starts somewhere. This is the beginning of ours - a place to keep all the tiny moments that become our greatest memories.\n\nThe best part is that there are so many chapters still to come.',date:dayAt(-6),icon:'✦',photo:null,demo:true},
        {id:'m2',title:'The Great Blanket Fort',body:'A room full of pillows, a mountain of blankets and the kind of laughter we want to remember forever.\n\nSometimes the sweetest adventures happen without leaving home.',date:dayAt(-2),icon:'♡',photo:null,demo:true}
      ],
      events:[{id:'e1',title:'The Secret Recipe Club',date:dayAt(5),type:'Adventure',notes:'Choose the recipe together.'}],
      badges:['first-quest','storykeeper'],lastSave:new Date().toISOString()
    };
  }
  function loadState(){
    try {
      const saved=localStorage.getItem(STORAGE_KEY);
      if(!saved)return initialState();
      const data=JSON.parse(saved);
      if(data?.version !== 1 || !Array.isArray(data.crew) || !Array.isArray(data.quests) || !Array.isArray(data.memories) || !Array.isArray(data.events))return initialState();
      return {...initialState(),...data};
    } catch(e){console.warn('Local save unavailable',e);return initialState();}
  }
  let state=loadState();
  let walkTimer=null;
  let view='home',questFilter='all',currentMemory=0,now=new Date(),calendarCursor=new Date(now.getFullYear(),now.getMonth(),1),selectedDay=todayStr(),lastFocus=null,audioContext=null,selectedAvatarColor='moss';
  function save(){state.lastSave=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(error){console.warn('Save failed',error);toast('Device storage is full','Export your progress and try smaller photos.','!');return false;}}
  const levelOf = xp => Math.floor(Math.max(0,xp)/90)+1;
  const levelProgress = xp => Math.max(0,xp)%90;
  const completedCount = () => state.quests.filter(q=>q.status==='completed').length;
  const safeDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d);
  function playSound(kind='tap'){
    if(!state.sound)return;
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      audioContext=audioContext||new AudioCtx();
      if(audioContext.state==='suspended')audioContext.resume();
      const notes=kind==='reward'?[523,659,784]:kind==='open'?[392,523]:[440];
      notes.forEach((freq,i)=>{
        const osc=audioContext.createOscillator(),gain=audioContext.createGain();
        osc.type='sine';osc.frequency.value=freq;osc.connect(gain);gain.connect(audioContext.destination);
        const start=audioContext.currentTime+i*.085;
        gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.048,start+.03);gain.gain.exponentialRampToValueAtTime(.0001,start+.32);
        osc.start(start);osc.stop(start+.34);
      });
    }catch(e){console.warn('Sound unavailable',e)}
  }
  function toast(title,body='',symbol='✦'){
    const region=$('#toastRegion'),div=document.createElement('div');div.className='toast';div.innerHTML=`<span aria-hidden="true">${escapeHtml(symbol)}</span><span><strong>${escapeHtml(title)}</strong>${body?`<small>${escapeHtml(body)}</small>`:''}</span>`;
    region.appendChild(div);setTimeout(()=>{div.style.opacity='0';div.style.transform='translateY(12px)';div.style.transition='opacity .4s,transform .4s';setTimeout(()=>div.remove(),400);},4200);
  }
  function rewardBurst(){
    const layer=$('#rewardLayer');for(let i=0;i<27;i++){
      const sp=document.createElement('span');sp.className='reward-sparkle';sp.textContent=i%3===0?'✦':'✧';
      const angle=Math.PI*2*i/27,dist=100+Math.random()*180;
      sp.style.setProperty('--tx',`${Math.cos(angle)*dist}px`);sp.style.setProperty('--ty',`${Math.sin(angle)*dist}px`);sp.style.setProperty('--rot',`${Math.random()*720-360}deg`);
      sp.style.animationDelay=`${Math.random()*.12}s`;layer.appendChild(sp);setTimeout(()=>sp.remove(),1700);
    }
  }
  function checkBadges(){
    const fresh=[];
    badgeRules.forEach(b=>{if(b.check(state)&&!state.badges.includes(b.id)){state.badges.push(b.id);fresh.push(b);}});
    return fresh;
  }
  function award(xp,tokens){state.xp+=xp;state.tokens+=tokens;}
  function navigate(target){
    if(!['home','quests','chronicle','calendar','crew'].includes(target))return;
    if(walkTimer){clearTimeout(walkTimer);walkTimer=null;}
    view=target;
    $$('.view').forEach(section=>{section.hidden=section.id!==`view-${target}`;section.classList.toggle('is-active',section.id===`view-${target}`);});
    $$('[data-navigate]').forEach(el=>{
      const active=el.dataset.navigate===target && (el.classList.contains('nav-link')||el.classList.contains('mobile-nav-link'));
      el.classList.toggle('is-selected',active);
      if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
    });
    if(target==='quests')renderQuests();if(target==='chronicle')renderChronicle();if(target==='calendar')renderCalendar();if(target==='crew')renderCrew();if(target==='home')renderHome();
    playSound('open');window.scrollTo({top:0,behavior:'smooth'});
    document.title=`The Adventure Book - ${target[0].toUpperCase()+target.slice(1)}`;
  }
  function renderHome(){
    const level=levelOf(state.xp),progress=levelProgress(state.xp);
    $('#headerTokens').textContent=state.tokens;
    $('#homeLevel').textContent=level;
    document.body.classList.toggle('world-expanded',level>=4);
    document.body.classList.toggle('world-hearthlight',state.badges.includes('hearthlight'));
    const coat=$('.character-coat');if(coat)coat.style.fill=colorMap[state.crew[0]?.color]||colorMap.moss;
    $('#familyLevelInline').textContent=level;
    $('#homeMemories').textContent=state.memories.length;
    $('#homeQuestCount').textContent=completedCount();
    $('#homeMemberCount').textContent=state.crew.length;
    $('#familyProgressBar').style.width=`${progress/90*100}%`;
    $('#homeProgressArc').setAttribute('stroke-dasharray',`${progress/90*201} 201`);
    $('#levelProgressText').textContent=`${progress} / 90 XP to next level`;
    $('#worldChapter').textContent=String(Math.max(1,Math.ceil(state.memories.length/8))).padStart(2,'0');
    const q=state.quests.find(q=>q.status==='planned'&&q.date>=todayStr())||state.quests.find(q=>q.status==='ready')||state.quests.find(q=>q.status==='planned');
    $('#featuredQuestTitle').textContent=q?.title||'Dream up your next adventure';
    $('#featuredQuestDesc').textContent=q?.description||'Create a new quest and add a memory to your story.';
    $('#featuredQuestMeta').textContent=q?`${q.duration}   ·   +${q.xp} XP`:'The possibilities are endless';
    $('#featuredQuestAction').dataset.questAction=q?.id||'';
    const m=state.memories[0];
    $('#featuredMemoryTitle').textContent=m?.title||'Your adventure book awaits';
    $('#featuredMemoryDesc').textContent=m?m.body.slice(0,83).replace(/\s+/g,' ')+'…':'Save a moment that made you smile.';
    const upcoming=state.events.filter(e=>e.date>=todayStr()).sort((a,b)=>(a.date+'T'+(a.time||'00:00')).localeCompare(b.date+'T'+(b.time||'00:00')))[0];
    const due=upcoming?.date||dayAt(6),dt=new Date(`${due}T12:00:00`);
    $('#upcomingDay').textContent=dt.toLocaleDateString(undefined,{weekday:'short'}).toUpperCase();
    $('#upcomingDate').textContent=dt.getDate();
    $('#upcomingMonth').textContent=dt.toLocaleDateString(undefined,{month:'short'}).toUpperCase();
    $('#upcomingTitle').textContent=upcoming?.title||'A day for making memories';
    $('#upcomingDesc').textContent=upcoming?(upcoming.time?prettyTime(upcoming.time)+' · ':'')+(upcoming.notes||'An adventure to look forward to.'):'Start by putting something lovely on your calendar.';
    const lead=state.crew[0];
    $('.header-profile .mini-avatar').textContent=(lead?.name||'A').charAt(0).toUpperCase();
    $('.header-profile .mini-avatar').className=`mini-avatar avatar-${lead?.color||'moss'}`;
  }
  function renderQuests(){
    $$('.filter-chip').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.filter===questFilter));
    const arr=state.quests.filter(q=>questFilter==='all'||q.status===questFilter);
    $('#questEmpty').hidden=arr.length>0;
    $('#questGrid').innerHTML=arr.map(q=>{
      const symbols={tent:'⌂',sun:'☼',coffee:'☕',compass:'✧',heart:'♡',camera:'▣',star:'✦',leaf:'❧',palette:'✎',gift:'✣'};
      return `<article class="quest-card"><div class="quest-art"><span class="quest-symbol" aria-hidden="true">${symbols[q.icon]||'✧'}</span><span class="quest-status">${escapeHtml(q.status)}</span></div><div class="quest-content"><div class="quest-type">${escapeHtml(q.category)}</div><h3>${escapeHtml(q.title)}</h3><p>${escapeHtml(q.description)}</p><div class="quest-tags"><span>${icon('clock',14)} ${escapeHtml(q.duration)}</span><span>${icon('users',14)} ${q.audience==='adults'?'Adults':'Family quest'}</span>${q.date?'<span>'+icon('calendar',14)+' '+prettyDate(q.date,{month:'short',day:'numeric'})+(q.time?' · '+prettyTime(q.time):'')+'</span>':''}</div><div class="quest-card-bottom"><span class="quest-xp">✦ +${q.xp} XP</span><button class="quest-do" data-quest-action="${escapeHtml(q.id)}">${q.status==='completed'?'See adventure':'Open quest'} →</button></div></div></article>`;
    }).join('');
  }
  function renderChronicle(){
    if(!state.memories.length){$('#bookMemoryTitle').textContent='Your story starts here';$('#bookMemoryBody').textContent='Add your first memory to begin filling these pages.';$('#bookMemoryDate').textContent='A new beginning';$('#bookEntryIndex').textContent='ENTRY 00';$('#bookPageCounter').textContent='00 / 00';$('#bookPicture').innerHTML='<div class="book-picture-scene"><div class="memory-scene-sun"></div><div class="memory-scene-hill hill-a"></div></div>';$('#memoryGallery').innerHTML='';$('#memoryCountLabel').textContent='A story waiting to begin';return;}
    currentMemory=Math.max(0,Math.min(currentMemory,state.memories.length-1));
    const m=state.memories[currentMemory];
    $('#bookMemoryTitle').textContent=m.title;$('#bookMemoryBody').textContent=m.body;
    $('#bookMemoryDate').textContent=prettyDate(m.date);$('#bookEntryIndex').textContent=`ENTRY ${String(state.memories.length-currentMemory).padStart(2,'0')}`;
    $('#bookPageCounter').textContent=`${String(currentMemory+1).padStart(2,'0')} / ${String(state.memories.length).padStart(2,'0')}`;
    $('#bookPicture').innerHTML=m.photo?`<img src="${m.photo}" alt="Photo for ${escapeHtml(m.title)}">`:'<div class="book-picture-scene"><div class="memory-scene-sun"></div><div class="memory-scene-hill hill-a"></div><div class="memory-scene-hill hill-b"></div><div class="memory-scene-tree tree-a"></div><div class="memory-scene-tree tree-b"></div></div>';
    $('#memoryCountLabel').textContent=`${state.memories.length} beautiful ${state.memories.length===1?'memory':'memories'}`;
    $('#memoryGallery').innerHTML=state.memories.map((m,i)=>`<button class="memory-tile ${i===currentMemory?'is-current':''}" data-memory-index="${i}" aria-label="Open memory ${escapeHtml(m.title)}"><div class="memory-tile-scene">${m.photo?`<img src="${m.photo}" alt="">`:`<span class="scene-icon">${escapeHtml(m.icon||'✧')}</span>`}</div><strong>${escapeHtml(m.title)}</strong><small>${prettyDate(m.date,{month:'short',day:'numeric',year:'numeric'})}</small></button>`).join('');
  }
  function renderCalendar(){
    const year=calendarCursor.getFullYear(),month=calendarCursor.getMonth();
    $('#monthTitle').textContent=calendarCursor.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    const first=new Date(year,month,1),offset=first.getDay(),total=new Date(year,month+1,0).getDate(),prevTotal=new Date(year,month,0).getDate();
    const cells=[];const rows=Math.ceil((offset+total)/7),count=rows*7;
    for(let i=0;i<count;i++){
      const dayNo=i-offset+1,dt=new Date(year,month,dayNo);
      const date=[dt.getFullYear(),String(dt.getMonth()+1).padStart(2,'0'),String(dt.getDate()).padStart(2,'0')].join('-');
      const outside=dayNo<1||dayNo>total,hasEvent=state.events.some(e=>e.date===date)||state.quests.some(q=>q.date===date&&q.status!=='completed');
      const isToday=date===todayStr(),selected=date===selectedDay;
      cells.push(`<button class="calendar-day${outside?' outside':''}${isToday?' today':''}${selected?' selected':''}" data-calendar-day="${date}" aria-label="${prettyDate(date)}${hasEvent?', has an event':''}" aria-pressed="${selected}"><span class="calendar-number">${dt.getDate()}</span>${hasEvent?'<span class="calendar-dot" aria-hidden="true"></span>':'<span></span>'}</button>`);
    }
    $('#calendarDays').innerHTML=cells.join('');
    $('#selectedDateTitle').textContent=prettyDate(selectedDay,{weekday:'long',month:'short',day:'numeric'});
    const dayEvents=state.events.filter(e=>e.date===selectedDay),scheduled=state.quests.filter(q=>q.date===selectedDay&&q.status!=='completed'&&!dayEvents.some(e=>e.questId===q.id||(!e.questId&&e.title===q.title)));
    $('#dayEvents').innerHTML=dayEvents.map(e=>`<div class="day-event"><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.type)}${e.time?' · '+escapeHtml(prettyTime(e.time)):''}${e.questId&&state.quests.some(q=>q.id===e.questId&&q.status==='completed')?' · Completed':''}${e.notes?' · '+escapeHtml(e.notes):''}</small></div>`).join('')+scheduled.map(q=>`<div class="day-event"><strong>${escapeHtml(q.title)}</strong><small>Quest${q.time?' · '+escapeHtml(prettyTime(q.time)):''} · +${q.xp} XP</small></div>`).join('') || '<div class="day-event-empty">A quiet page in the calendar. The perfect place for a new memory.</div>';
  }
  function characterMarkup(color){
    const c=colorMap[color]||colorMap.moss;
    return `<div class="css-avatar" style="--avatar-color:${c}"><span class="avatar-leg left"></span><span class="avatar-leg right"></span><span class="avatar-arm left"></span><span class="avatar-arm right"></span><span class="avatar-body"></span><span class="avatar-head"></span><span class="avatar-hair"></span><span class="avatar-eye left"></span><span class="avatar-eye right"></span></div>`;
  }
  function renderCrew(){
    const lvl=levelOf(state.xp);$('#crewLevel').textContent=lvl;$('#crewXP').textContent=`${state.xp} total XP`;
    $('#crewProgressBar').style.width=`${levelProgress(state.xp)/90*100}%`;
    $('#badgeCountLabel').textContent=`${state.badges.length} keepsakes found`;
    $('#crewGrid').innerHTML=state.crew.map((p,i)=>`<article class="crew-card"><div class="avatar-stage">${characterMarkup(p.color)}</div><div class="crew-card-head"><div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.title||'Curious Adventurer')}</p></div><span class="crew-level">LVL ${levelOf(p.xp||0)}</span></div><div class="crew-card-footer"><span>✦ ${p.xp||0} XP</span><button class="text-button" data-edit-member="${escapeHtml(p.id)}">Customize ${icon('arrow-right',14)}</button></div></article>`).join('');
  }
  function renderAll(){renderHome();renderQuests();renderChronicle();renderCalendar();renderCrew();}
  function questStepsMarkup(q){
    if(!Array.isArray(q.steps)||!q.steps.length)return '';
    const done=q.steps.filter(step=>step.done).length;
    return '<fieldset class="quest-step-list"><legend>Little moments along the way</legend><p>Gentle reminders. Enjoy these together in any order.</p><span id="questStepProgress">'+done+' of '+q.steps.length+' moments noted</span>'+
      q.steps.map((step,i)=>'<label class="quest-step"><input type="checkbox" data-quest-step="'+escapeHtml(q.id)+'" data-step-index="'+i+'" '+(step.done?'checked':'')+(q.status==='completed'?' disabled':'')+'><span>'+escapeHtml(step.label)+'</span></label>').join('')+
      '</fieldset>';
  }
  function openModal(type,payload={}){
    lastFocus=document.activeElement;
    const root=$('#modalContent'),backdrop=$('#modalBackdrop');selectedAvatarColor=payload.color||'moss';
    let markup='';
    const heading=(eyebrow,title,description)=>`<div class="eyebrow">${eyebrow}</div><h2 class="modal-title" id="modalTitle">${title}</h2><p class="modal-description">${description}</p>`;
    const field=(id,label,placeholder='',required=true)=>`<div class="form-field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="text" placeholder="${placeholder}" maxlength="90" ${required?'required':''}></div>`;
    const cancel='<button type="button" class="button button-soft" data-close-modal>Not now</button>';
    if(type==='quest'){
      markup=heading('CREATE SOMETHING WONDERFUL','Make a new quest','Dream up a family adventure. It can be as simple or spectacular as you like.')+
      `<form id="questForm" class="modal-form">${field('questTitle','Adventure name','A magical afternoon')}`+
      `<div class="form-field"><label for="questDescription">What will you do?</label><textarea id="questDescription" name="questDescription" maxlength="450" required placeholder="Describe your idea so everyone knows what to do..."></textarea></div>`+
      `<div class="form-grid"><div class="form-field"><label for="questCategory">Category</label><select id="questCategory"><option>Explore</option><option>Together</option><option>At Home</option><option>Creative</option><option>Learn</option><option>Surprise</option></select></div><div class="form-field"><label for="questDuration">Time needed</label><select id="questDuration"><option>30 minutes</option><option>1 hour</option><option>2 hours</option><option>Half a day</option><option>Full day</option></select></div></div><div class="form-grid"><div class="form-field"><label for="questDate">Date (optional)</label><input id="questDate" type="date"></div><div class="form-field"><label for="questTime">Start time (optional)</label><input id="questTime" type="time"></div></div><div class="form-hint">Stored only in this browser. This demo does not sync with Google Calendar.</div><div class="modal-note">New adventures earn 60 XP and 15 Adventure Tokens when completed.</div><div class="modal-actions">${cancel}<button type="submit" class="button button-primary">Create quest ${icon('plus')}</button></div></form>`;
    }
    if(type==='memory'){
      markup=heading('EVERY LITTLE MOMENT MATTERS','Keep a memory',"Add a page to your family's Chronicle. Even the quiet days deserve a story.")+
      `<form id="memoryForm" class="modal-form">${field('memoryTitle','What would you call this chapter?','The day we laughed all afternoon')}`+
      `<div class="form-field"><label for="memoryBody">Tell the story</label><textarea id="memoryBody" required maxlength="2500" placeholder="What happened? Who was there? What do you want to remember?"></textarea></div>`+
      `<div class="form-grid"><div class="form-field"><label for="memoryDate">Date</label><input id="memoryDate" type="date" value="${todayStr()}" required></div><div class="form-field"><label for="memoryIcon">Page sticker</label><select id="memoryIcon"><option value="✦">A golden star</option><option value="♡">A little heart</option><option value="✿">A flower</option><option value="❧">A leaf</option><option value="☼">Sunshine</option></select></div></div>`+
      `<div class="file-picker">Optional photograph<br><input type="file" id="memoryPhoto" accept="image/*"><div class="form-hint">Photos are reduced in size and saved only on this device in the demo.</div></div>`+
      `<div class="modal-actions">${cancel}<button type="submit" class="button button-primary">Save this memory ${icon('book')}</button></div></form>`;
    }
    if(type==='event'){
      markup=heading('MAKE A LITTLE ROOM FOR WONDER','Plan a day together','A family outing, annual tradition, birthday, or spontaneous new plan.')+
      `<form id="eventForm" class="modal-form">${field('eventTitle','What are you planning?','A picnic at the park')}`+
      `<div class="form-grid"><div class="form-field"><label for="eventDate">Date</label><input id="eventDate" type="date" required value="${selectedDay}"></div><div class="form-field"><label for="eventTime">Start time (optional)</label><input id="eventTime" type="time"></div><div class="form-field"><label for="eventType">Type</label><select id="eventType"><option>Adventure</option><option>Tradition</option><option>Birthday</option><option>Family time</option><option>Other</option></select></div></div><div class="form-field"><label for="eventNotes">Notes (optional)</label><textarea id="eventNotes" maxlength="400" placeholder="A place, a reminder, something to bring..."></textarea></div><div class="modal-actions">${cancel}<button type="submit" class="button button-primary">Add to calendar ${icon('calendar')}</button></div></form>`;
    }
    if(type==='crew'||type==='edit-member'){
      const p=type==='edit-member'?state.crew.find(c=>c.id===payload.id):null;
      selectedAvatarColor=p?.color||'moss';
      markup=heading('EVERY HERO BELONGS',''+(p?'Customize adventurer':'Welcome an adventurer'),p?'Make this character feel a little more like you.':'Add a person to the local demo crew. Shared accounts and invitations come in the online release.')+
      `<form id="crewForm" class="modal-form">${field('crewName','Adventurer name','Auntie / Grandpa / Little Explorer')}`+
      `${field('crewTitle','Adventure specialty','Explorer of hidden wonders',false)}<div class="form-field"><label>Choose a character color</label><div class="color-options" id="colorOptions">${Object.entries(colorMap).map(([key,color])=>`<button type="button" class="color-choice ${selectedAvatarColor===key?'selected':''}" data-palette="${key}" style="background:${color}" aria-label="Choose ${key}" aria-pressed="${selectedAvatarColor===key}"></button>`).join('')}</div></div>`+
      `<div class="modal-actions">${cancel}<button type="submit" class="button button-primary">${p?'Save profile':'Add to crew'} ${icon('heart')}</button></div></form>`;
      root.dataset.memberBeingEdited=p?.id||'';
    }
    if(type==='quest-details'||type==='complete-quest'){
      const q=state.quests.find(q=>q.id===payload.id);if(!q)return;
      root.dataset.quest=q.id;
      if(type==='quest-details'){
        markup=heading(escapeHtml(q.category.toUpperCase()+' · '+q.duration),escapeHtml(q.title),escapeHtml(q.description))+(q.date?'<div class="quest-time-note">'+icon('calendar',16)+' '+prettyDate(q.date)+(q.time?' · '+prettyTime(q.time):'')+'</div>':'')+(q.participants?.length?'<div class="quest-time-note">'+icon('users',16)+' '+escapeHtml(q.participants.join(' & '))+'</div>':'')+questStepsMarkup(q)+
        `<div class="modal-note">✦ Complete this activity in real life, then add its story to your Adventure Book.<br><strong>Reward: +${q.xp} XP · +${Math.ceil(q.xp/4)} Tokens</strong></div>`+
        (q.status==='completed'?`<div class="modal-actions">${cancel}<button class="button button-primary" data-close-modal data-navigate="chronicle">See the book ${icon('book')}</button></div>`:
        `<div class="modal-actions">${cancel}<button type="button" class="button button-primary" data-complete-quest="${escapeHtml(q.id)}">We did it! ${icon('check')}</button></div>`);
      }else{
        markup=heading('ADVENTURE COMPLETE','You made a memory!','Well done! Save a few words about the adventure so this moment becomes a permanent page in your Chronicle.')+
          `<form id="completeQuestForm" class="modal-form"><div class="modal-note"><strong>${escapeHtml(q.title)}</strong><br>✦ +${q.xp} XP · +${Math.ceil(q.xp/4)} Tokens</div><div class="form-field"><label for="completedNote">The story (optional)</label><textarea id="completedNote" maxlength="2500" placeholder="Our favorite moment was..."></textarea></div><div class="form-field"><label for="completeDate">When did you go?</label><input id="completeDate" type="date" value="${todayStr()}" required></div><div class="file-picker">Optional photograph<br><input type="file" accept="image/*" id="completePhoto"><div class="form-hint">Saved locally in this demo.</div></div><div class="modal-actions">${cancel}<button class="button button-primary" type="submit">Complete chapter ${icon('check')}</button></div></form>`;
      }
    }
    if(type==='reset'){
      markup=heading('A FRESH BEGINNING','Reset the demo?','This clears every local quest, profile, photo, calendar event, and memory saved in this browser. This cannot be undone.')+
        `<div class="modal-actions">${cancel}<button class="button button-primary" id="confirmReset">Reset everything</button></div>`;
    }
    if(!markup)return;
    root.innerHTML=markup;backdrop.hidden=false;document.body.style.overflow='hidden';
    root.dataset.questTemplate=type==='quest'?(payload.template||''):'';
    if(type==='quest'&&payload.template==='cozy-evening'){
      $('#questTitle').value=cozyEvening.title;
      $('#questDescription').value=cozyEvening.description;
      $('#questCategory').value=cozyEvening.category;
      $('#questDuration').value=cozyEvening.duration;
      $('#questDate').value=todayStr();
      $('#questTime').value='22:00';
    }
    hydrateIcons(root);playSound('open');
    if(type==='edit-member'){
      const p=state.crew.find(c=>c.id===payload.id);if(p){$('#crewName').value=p.name;$('#crewTitle').value=p.title||'';}
    }
    setTimeout(()=>$('.modal-window input:not([type=file]),.modal-window button:not(.modal-close)')?.focus(),30);
  }
  function closeModal(){
    $('#modalBackdrop').hidden=true;document.body.style.overflow='';$('#modalContent').innerHTML='';
    lastFocus?.focus?.();
  }
  async function imageToSmallDataUrl(file){
    if(!file)return null;
    if(!file.type.startsWith('image/')){toast('Please use an image','Unsupported file type','!');return null;}
    if(file.size>18*1024*1024){toast('Photo too large','Try a photo below 18 MB','!');return null;}
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read file'));
      reader.onload=()=>{
        const image=new Image();image.onerror=()=>reject(new Error('Could not read image'));
        image.onload=()=>{
          const scale=Math.min(1,900/Math.max(image.width,image.height));
          const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.floor(image.width*scale));canvas.height=Math.max(1,Math.floor(image.height*scale));
          const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',.68));
        };image.src=String(reader.result);
      };reader.readAsDataURL(file);
    });
  }
  async function optionalPhoto(inputId){
    const file=$(`#${inputId}`)?.files?.[0];
    try {return await imageToSmallDataUrl(file);}catch(err){toast('Photo skipped',err.message,'!');return null;}
  }
  async function handleFormSubmit(event){
    event.preventDefault();const form=event.target;
    if(form.id==='questForm'){
      const title=$('#questTitle').value.trim(),description=$('#questDescription').value.trim();if(!title||!description)return;
      const category=$('#questCategory').value,duration=$('#questDuration').value,date=$('#questDate').value||null,time=$('#questTime').value||null;
      if((date&&!validCalendarDate(date))||(time&&(!date||!prettyTime(time)))){toast('Check the date and time','Choose a valid date before adding a start time.','!');return;}
      const template=$('#modalContent').dataset.questTemplate==='cozy-evening'?'cozy-evening':null;
      const q={id:newId('q'),title,description,category,duration,date,time,xp:60,icon:({Explore:'compass',Together:'heart','At Home':'coffee',Creative:'palette',Learn:'star',Surprise:'gift'})[category],status:date?'planned':'ready'};
      if(template){q.template=template;q.audience='adults';q.steps=cozyEvening.steps.map(step=>({...step}));}
      state.quests.unshift(q);
      if(date)state.events.push({id:newId('e'),questId:q.id,title,date,time,type:'Adventure',notes:'Planned from the adventure board'});
      save();closeModal();navigate('quests');toast('Quest added!','The next chapter starts whenever you are ready.');
    }
    if(form.id==='memoryForm'){
      const title=$('#memoryTitle').value.trim(),body=$('#memoryBody').value.trim(),date=$('#memoryDate').value;
      if(!title||!body||!safeDate(date))return;
      const photo=await optionalPhoto('memoryPhoto');
      state.memories.unshift({id:newId('m'),title,body,date,icon:$('#memoryIcon').value,photo,demo:false});
      award(10,3);const fresh=checkBadges();save();currentMemory=0;closeModal();navigate('chronicle');rewardBurst();playSound('reward');toast('A memory saved!','+10 XP · +3 Adventure Tokens');fresh.forEach((b,i)=>setTimeout(()=>toast(`Badge unlocked: ${b.name}`,b.description,b.emoji),650*(i+1)));
    }
    if(form.id==='eventForm'){
      const title=$('#eventTitle').value.trim(),date=$('#eventDate').value,time=$('#eventTime').value||null,type=$('#eventType').value,notes=$('#eventNotes').value.trim();if(!title||!validCalendarDate(date)||(time&&!prettyTime(time)))return;
      state.events.push({id:newId('e'),title,date,time,type,notes});selectedDay=date;calendarCursor=new Date(`${date}T12:00:00`);calendarCursor.setDate(1);
      save();closeModal();navigate('calendar');toast('Date saved!','A new plan to look forward to.');
    }
    if(form.id==='crewForm'){
      const name=$('#crewName').value.trim(),title=$('#crewTitle').value.trim()||'Curious Adventurer',existing=$('#modalContent').dataset.memberBeingEdited;
      if(!name)return;
      const p=state.crew.find(c=>c.id===existing);
      if(p){p.name=name;p.title=title;p.color=selectedAvatarColor;toast('Adventurer updated','Your character has a fresh look.');}
      else{state.crew.push({id:newId('p'),name,title,color:selectedAvatarColor,xp:0});toast('Welcome to the crew!',`${name} has a place in the Chronicle.`);}
      const fresh=checkBadges();save();closeModal();navigate('crew');fresh.forEach(b=>toast(`Badge unlocked: ${b.name}`,b.description,b.emoji));
    }
    if(form.id==='completeQuestForm'){
      const q=state.quests.find(q=>q.id===$('#modalContent').dataset.quest),date=$('#completeDate').value;if(!q||q.status==='completed'||!safeDate(date))return;
      const photo=await optionalPhoto('completePhoto');
      q.status='completed';q.completedAt=date;
      const body=$('#completedNote').value.trim()||`We completed ${q.title.toLowerCase()} together. Another little moment to remember - and another adventure waiting around the corner.`;
      state.memories.unshift({id:newId('m'),title:q.title,body,date,icon:'✦',photo,demo:false,questId:q.id});
      const bonus=Math.ceil(q.xp/4);award(q.xp,bonus);
      // Local family XP is awarded. Personal import participants are not demo Crew accounts.
      if(!q.participants?.length)state.crew.forEach(p=>p.xp=(p.xp||0)+Math.round(q.xp/state.crew.length));
      const fresh=checkBadges();save();currentMemory=0;closeModal();navigate('chronicle');rewardBurst();playSound('reward');toast('Adventure complete!',`+${q.xp} XP · +${bonus} Tokens`);fresh.forEach((b,i)=>setTimeout(()=>toast(`Badge unlocked: ${b.name}`,b.description,b.emoji),950*(i+1)));
    }
  }
  async function importAdventure(file){
    if(!file)return;
    if(file.size>16384){toast('Adventure file too large','Use a small Evergrove .json file.','!');return;}
    try {
      const data=JSON.parse(await file.text());
      if(!data||data.schema!=='evergrove-adventure-v1')throw new Error('Not an Evergrove adventure file');
      if(typeof data.title!=='string'||!data.title.trim()||data.title.length>90||
         typeof data.description!=='string'||!data.description.trim()||data.description.length>450||
         !validCalendarDate(data.date)||!prettyTime(data.time||''))throw new Error('Adventure title, description, date or time is invalid');
      const categories=['Explore','Together','At Home','Creative','Learn','Surprise'];
      if(!categories.includes(data.category)||typeof data.duration!=='string'||!['30 minutes','1 hour','2 hours','Half a day','Full day'].includes(data.duration))throw new Error('Unsupported adventure type or duration');
      if(!Array.isArray(data.steps)||!data.steps.length||data.steps.length>8||data.steps.some(step=>typeof step!=='string'||!step.trim()||step.length>90))throw new Error('Include 1–8 short activity steps');
      if(data.participants!==undefined&&(!Array.isArray(data.participants)||data.participants.length>6||data.participants.some(p=>typeof p!=='string'||!p.trim()||p.length>45)))throw new Error('Participant list is invalid');
      const q={
        id:newId('q'),title:data.title.trim(),description:data.description.trim(),
        category:data.category,duration:data.duration,date:data.date,time:data.time,
        xp:60,icon:({Explore:'compass',Together:'heart','At Home':'coffee',Creative:'palette',Learn:'star',Surprise:'gift'})[data.category],
        status:'planned',audience:data.audience==='adults'?'adults':'family',
        steps:data.steps.map(label=>({label:label.trim(),done:false})),
        participants:(data.participants||[]).map(p=>p.trim()),
        template:data.template==='cozy-evening'?'cozy-evening':null
      };
      state.quests.unshift(q);
      state.events.push({id:newId('e'),questId:q.id,title:q.title,date:q.date,time:q.time,type:'Adventure',notes:'Planned from an imported quest (device only)'});
      save();questFilter='all';selectedDay=q.date;
      calendarCursor=new Date(q.date+'T12:00:00');calendarCursor.setDate(1);
      navigate('quests');toast('Adventure imported','Saved in this browser only. No calendar or cloud sync.');
    } catch(err){toast('Import failed',err.message||'Check your adventure file.','!');}
  }
  function exportProgress(){
    const payload={...state,exportedAt:new Date().toISOString(),warning:'Local playable demo data; not a secure family backup service.'};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`adventure-book-save-${todayStr()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('Progress exported','Keep the downloaded file somewhere safe.');
  }
  function applyTheme(){
    const night=state.theme==='night';document.body.classList.toggle('night',night);
    $('#themeToggle [data-icon]').dataset.icon=night?'sun':'moon';hydrateIcons($('#themeToggle'));
    $('#themeToggle').setAttribute('aria-label',night?'Switch to daytime':'Switch to nighttime');
    $('#soundToggle [data-icon]').dataset.icon=state.sound?'volume':'volume-off';hydrateIcons($('#soundToggle'));
    $('#soundToggle').setAttribute('aria-label',state.sound?'Turn sound off':'Turn sound on');
  }
  function setupListeners(){
    document.addEventListener('click',e=>{
      const nav=e.target.closest('[data-navigate]');
      const close=e.target.closest('[data-close-modal]');
      if(nav){if(close)closeModal();navigate(nav.dataset.navigate);return;}
      if(close){closeModal();return;}
      const modal=e.target.closest('[data-modal]');if(modal){openModal(modal.dataset.modal,{template:modal.dataset.questTemplate||''});return;}
      const filter=e.target.closest('[data-filter]');if(filter){questFilter=filter.dataset.filter;renderQuests();playSound();return;}
      const quest=e.target.closest('[data-quest-action]');if(quest){if(quest.dataset.questAction)openModal('quest-details',{id:quest.dataset.questAction});else openModal('quest');return;}
      const completion=e.target.closest('[data-complete-quest]');if(completion){openModal('complete-quest',{id:completion.dataset.completeQuest});return;}
      const day=e.target.closest('[data-calendar-day]');if(day){selectedDay=day.dataset.calendarDay;const d=new Date(`${selectedDay}T12:00:00`);if(d.getMonth()!==calendarCursor.getMonth()||d.getFullYear()!==calendarCursor.getFullYear())calendarCursor=new Date(d.getFullYear(),d.getMonth(),1);renderCalendar();playSound();return;}
      const m=e.target.closest('[data-memory-index]');if(m){currentMemory=Number(m.dataset.memoryIndex);renderChronicle();playSound('open');return;}
      const edit=e.target.closest('[data-edit-member]');if(edit){openModal('edit-member',{id:edit.dataset.editMember});return;}
      const palette=e.target.closest('[data-palette]');if(palette){selectedAvatarColor=palette.dataset.palette;$$('[data-palette]').forEach(el=>{const active=el.dataset.palette===selectedAvatarColor;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',active);});playSound();return;}
      const world=e.target.closest('[data-world-action]');if(world){worldAction(world.dataset.worldAction,e);return;}
      if(e.target===$('#modalBackdrop'))closeModal();
    });
    document.addEventListener('change',e=>{
      const box=e.target.closest('[data-quest-step]');if(!box)return;
      const q=state.quests.find(q=>q.id===box.dataset.questStep),index=Number(box.dataset.stepIndex);
      if(!q||q.status==='completed'||!Array.isArray(q.steps)||!q.steps[index])return;
      q.steps[index].done=box.checked;save();
      const count=$('#questStepProgress');if(count)count.textContent=q.steps.filter(step=>step.done).length+' of '+q.steps.length+' moments noted';
    });
    document.addEventListener('submit',e=>{if(e.target?.closest('.modal-form'))handleFormSubmit(e);});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&!$('#modalBackdrop').hidden)closeModal();
      const active=e.target.closest('[data-world-action]');if(active&&(e.key==='Enter'||e.key===' ')){e.preventDefault();worldAction(active.dataset.worldAction);}
    });
    $('#importAdventureBtn').addEventListener('click',()=>$('#importAdventureFile').click());
    $('#importAdventureFile').addEventListener('change',async e=>{
      const file=e.target.files?.[0];
      if(file)await importAdventure(file);
      e.target.value='';
    });
    $('#themeToggle').addEventListener('click',()=>{state.theme=state.theme==='night'?'dusk':'night';save();applyTheme();playSound('open');});
    $('#soundToggle').addEventListener('click',()=>{state.sound=!state.sound;save();applyTheme();if(state.sound)playSound('reward');else toast('Sound off','A quieter little world.');});
    $('#modalClose').addEventListener('click',closeModal);
    $('#prevMemory').addEventListener('click',()=>turnPage(-1));
    $('#nextMemory').addEventListener('click',()=>turnPage(1));
    $('#calendarPrev').addEventListener('click',()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderCalendar();});
    $('#calendarNext').addEventListener('click',()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderCalendar();});
    $('#calendarToday').addEventListener('click',()=>{const t=new Date();calendarCursor=new Date(t.getFullYear(),t.getMonth(),1);selectedDay=todayStr();renderCalendar();});
    $('#exportSave').addEventListener('click',exportProgress);
    $('#resetSave').addEventListener('click',()=>openModal('reset'));
    document.addEventListener('click',e=>{if(e.target.closest('#confirmReset')){state=initialState();save();currentMemory=0;questFilter='all';selectedDay=todayStr();const d=new Date();calendarCursor=new Date(d.getFullYear(),d.getMonth(),1);closeModal();applyTheme();renderAll();navigate('home');toast('Fresh beginning','The original demo world has been restored.');}});
    const stage=$('#worldStage');
    stage.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const rect=stage.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width-.5,y=(e.clientY-rect.top)/rect.height-.5;
      stage.style.setProperty('--panX',`${(-x*11).toFixed(1)}px`);stage.style.setProperty('--panY',`${(-y*9).toFixed(1)}px`);
    });
    stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--panX','0px');stage.style.setProperty('--panY','0px');});
  }
  function turnPage(direction){
    if(!state.memories.length)return;
    const book=$('.chronicle-book');book.classList.remove('page-flip-next','page-flip-prev');void book.offsetWidth;
    book.classList.add(direction>0?'page-flip-next':'page-flip-prev');
    currentMemory=(currentMemory+direction+state.memories.length)%state.memories.length;
    window.setTimeout(()=>renderChronicle(),180);
    window.setTimeout(()=>book.classList.remove('page-flip-next','page-flip-prev'),690);
    playSound('tap');
  }
  function walkToPoint(x,y,onArrival){
    const mover=$('#characterMover');if(!mover)return;
    if(walkTimer){clearTimeout(walkTimer);walkTimer=null;}
    mover.classList.add('character-walking');
    mover.style.transform=`translate(${Math.round(x-462)}px,${Math.round(y-438)}px)`;
    walkTimer=window.setTimeout(()=>{mover.classList.remove('character-walking');walkTimer=null;if(onArrival)onArrival();},1110);
  }
  function worldAction(action,e){
    if(action==='trail'){
      try{const svg=$('#worldArt'),pt=svg.createSVGPoint();pt.x=e?.clientX||0;pt.y=e?.clientY||0;const local=pt.matrixTransform(svg.getScreenCTM().inverse());walkToPoint(Math.min(650,Math.max(260,local.x)),Math.min(477,Math.max(345,local.y)));}catch(err){walkToPoint(500,435);}return;
    }
    if(action==='garden'){walkToPoint(290,415);toast('The Story Garden','Your adventures helped this little corner bloom.','✿');playSound('reward');return;}
    if(action==='cottage'){walkToPoint(447,399,()=>navigate('chronicle'));toast('Welcome to Evergrove','Follow your adventurer to the cottage.','⌂');return;}
    if(action==='character'){navigate('crew');return;}
    if(action==='pond'){walkToPoint(592,420);toast('The Wishing Pond','Maybe your next adventure begins with a wish.','✧');playSound('reward');return;}
    if(action==='lantern'){walkToPoint(519,430);state.theme=state.theme==='night'?'dusk':'night';save();applyTheme();toast(state.theme==='night'?'The lanterns are glowing':'Morning light returns','The world changes with a little tap.','✦');playSound('reward');}
  }
  function makeMotes(){
    const root=$('#ambientMotes');if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    for(let i=0;i<21;i++){
      const mote=document.createElement('i');mote.className='mote';
      mote.style.cssText=`--x:${((i*37+13)%100)}%;--y:${((i*53+11)%100)}%;--s:${2+i%4*2}px;--d:${6+i%7*2}s;--delay:${-i*.83}s`;root.appendChild(mote);
    }
  }
  function init(){hydrateIcons();applyTheme();setupListeners();makeMotes();renderAll();navigate('home');
    // Offline caching activates only when served over HTTPS or localhost.
    if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
