/* Sunny English V26 — interactive textbook, isolated from the existing games. */
(() => {
  'use strict';
  const BOOK=window.SUNNY_BOOK,SCENES=window.SUNNY_SCENES||{},PLAYER=window.SUNNY_SCENE_PLAYER;
  if(!BOOK)return;
  const el=(tag,attrs={})=>Object.assign(document.createElement(tag),attrs);
  const normal=s=>String(s??'').normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/[.!?,]+$/,'');
  const pageURL=p=>'book/pages/'+String(p).padStart(2,'0')+'.webp';
  const bookState=()=>{
    if(!data.book||typeof data.book!=='object'||Array.isArray(data.book))data.book={version:26,lastEntry:'u1',entries:{}};
    if(!data.book.entries||typeof data.book.entries!=='object')data.book.entries={};
    return data.book;
  };
  const state=id=>{
    const all=bookState();
    if(!all.entries[id]||typeof all.entries[id]!=='object')all.entries[id]={answers:{},checked:{},revealed:{},found:[],drawing:[],best:0};
    const s=all.entries[id];
    for(const k of ['answers','checked','revealed'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};
    if(!Array.isArray(s.found))s.found=[];
    if(!Array.isArray(s.drawing))s.drawing=[];
    return s;
  };
  let entry=null,tab='words',filter='all',search='',sourcePage=1,sequence=0,tts=null,ttsResolve=null,lineRun=0,wsStart=null,saveTimer=null,trace=null,memoryHidden=false,practiceDrawing=false;
  let speed=Number(bookState().speed)||1;
  let allWords=BOOK.units.flatMap(u=>u.words.map(w=>({...w,unit:u.number})));
  const extraWords=[{en:'Lucy',vi:'tên Lucy'},{en:'Nick',vi:'tên Nick'},{en:'Wendy',vi:'tên Wendy'},{en:'washing',vi:'đang lau, rửa'},{en:'running',vi:'đang chạy'},{en:'apples',vi:'những quả táo'},{en:'standing',vi:'đang đứng'},{en:'Hi!',vi:'Xin chào!'},{en:'Bye!',vi:'Tạm biệt!'},{en:'girl',vi:'cô bé'},{en:'hat',vi:'cái mũ'}];
  const emoji={bell:'🔔',gate:'🚪',girl:'👧',can:'🥫',mop:'🧹',mops:'🧹',pot:'🍲',pots:'🍲',lock:'🔒',locks:'🔒',clock:'⏰',clocks:'⏰',top:'🌀',tops:'🌀',chips:'🍟',nut:'🥜',nuts:'🥜',lemons:'🍋',leaf:'🍃',water:'💧',wash:'🧼',washing:'🧼',running:'🏃',standing:'🧍',face:'🙂',foot:'🦶',football:'⚽',head:'🧒',hair:'💇',hand:'🖐️',garden:'🌷',window:'🪟',Lucy:'👧',Nick:'👦',Wendy:'👧',"Hi!":'👋',"Bye!":'👋',"He's running.":'🏃‍♂️',"She's running.":'🏃‍♀️',chicken:'🍗',fish:'🐟'};
  const singular={apples:'apple',bananas:'banana',lemons:'lemon',clocks:'clock',locks:'lock',pots:'pot',mops:'mop',tops:'top',windows:'window',pens:'pen',monkeys:'monkey',footballs:'football',running:'run'};
  const findWord=text=>allWords.find(w=>normal(w.en)===normal(text))||BOOK.glossary.find(w=>normal(w.en)===normal(text))||extraWords.find(w=>normal(w.en)===normal(text))||{en:text,vi:''};
  function visual(text,plain=false){
    const count=text.match(/^(one|two|three|four|five|six|seven|eight|nine|ten) (.+)$/i);
    const raw=count?count[2]:text,key=singular[raw]||raw;
    if(count){const n=['one','two','three','four','five','six','seven','eight','nine','ten'].indexOf(count[1].toLowerCase())+1;return `<span class="bk-count-visual">${visual(raw,true)}<b>× ${n}</b></span>`;}
    if(!plain&&entry?.kind==='unit'&&PLAYER){const contextual=PLAYER.visual(entry,text);if(contextual)return contextual;}
    const cropKey=['mop','pot','lock'].includes(key)?key:['mops','pots','locks'].includes(raw)?raw.slice(0,-1):['can','bell','gate','girl','chips','chicken','top','nuts','cup','mouse','football'].includes(raw)?raw:key==='nut'?'nuts':null;
    if(cropKey)return `<span class="bk-word-visual"><img src="book/words/${cropKey}.webp" alt="${esc(findWord(text).vi||text)}" loading="lazy"></span>`;
    // Use the app's existing illustrations when their meaning matches the book.
    const special=emoji[raw]||emoji[key];
    const artKey=({bike:'bicycle',washing:'wash',standing:'stand',Lucy:'sister',Nick:'brother',Wendy:'sister'})[key]||key;
    const topic=topics.find(t=>t.words.some(w=>w.en===artKey));
    if(topic)return `<span class="bk-word-visual">${art(topic,topic.words.find(w=>w.en===artKey),false)}</span>`;
    if(['Hi!','Bye!'].includes(text))return `<span class="bk-word-visual" style="font-size:18px"><b>${esc(text)}</b></span>`;
    if(["He's running.","She's running."].includes(text))return `<span class="bk-word-visual">${visual('running').replace(/^<span class="bk-word-visual">|<\/span>$/g,'')}<small class="bk-visual-label">${text.startsWith('He')?'He':'She'}</small></span>`;
    return `<span class="bk-word-visual" aria-hidden="true">${special||'✦'}</span>`;
  }
  function remember(immediate=false){
    bookState().updatedAt=new Date().toISOString();
    clearTimeout(saveTimer);
    if(immediate){save();paintSaved();}else saveTimer=setTimeout(()=>{save();paintSaved();},220);
  }
  function paintSaved(){const node=content.querySelector('[data-book-saved]');if(node)node.textContent=storageWarned?'Bài làm đang giữ trong lần mở này.':'✓ Đã lưu bài làm trên thiết bị này';}
  const baseStop=Voice.stop;
  function stopSpeech(){
    sequence++;lineRun++;baseStop();
    if(tts){tts.onend=tts.onerror=null;try{window.speechSynthesis.cancel();}catch{}tts=null;}
    if(ttsResolve){ttsResolve(false);ttsResolve=null;}
    document.querySelectorAll('.bk .is-speaking').forEach(n=>{n.classList.remove('is-speaking');n.removeAttribute('aria-busy');});
  }
  Voice.stop=function(){stopSpeech();};
  function hasClip(text){const n=String(text).trim().toLowerCase().replace(/\s+/g,' ');return Boolean((settings.voiceProfile==='child'&&typeof V19_CHILD!=='undefined'&&V19_CHILD[n])||(typeof AUDIO!=='undefined'&&AUDIO[n]));}
  function deviceVoice(){
    const voices=window.speechSynthesis?.getVoices()||[];
    return voices.filter(v=>/^en([_-]|$)/i.test(v.lang)).sort((a,b)=>{
      const rank=v=>(/^en[-_]GB$/i.test(v.lang)?40:0)+(/samantha|sonia|serena|libby|google uk english female|kate|hazel/i.test(v.name)?15:0)+(/natural|enhanced|premium|online/i.test(v.name)?10:0);
      return rank(b)-rank(a);
    })[0]||null;
  }
  async function speak(text,node=null){
    stopSpeech();const token=sequence;
    if(node){node.classList.add('is-speaking');node.setAttribute('aria-busy','true');}
    let ok=false;
    if(hasClip(text)){const promise=Voice.speak(text,speed<1);if(node){node.classList.add('is-speaking');node.setAttribute('aria-busy','true');}ok=await promise;}
    else if('speechSynthesis' in window&&'SpeechSynthesisUtterance' in window){
      let voice=deviceVoice();
      if(!voice){await new Promise(r=>setTimeout(r,120));if(token!==sequence)return false;voice=deviceVoice();}
      ok=await new Promise(resolve=>{
        if(!voice){toast('Thiết bị chưa có giọng tiếng Anh. Hãy thêm giọng English trong cài đặt đọc văn bản của thiết bị.',6000);resolve(false);return;}
        const u=new SpeechSynthesisUtterance(String(text).replace(/[’‘]/g,"'"));tts=u;ttsResolve=resolve;u.voice=voice;u.lang=voice.lang;u.rate=.88*speed;u.pitch=1;u.volume=Math.min(1,Math.max(.2,Number(settings.soundVolume??.9)));
        const done=value=>{if(token!==sequence)return;tts=null;ttsResolve=null;resolve(value);};
        u.onend=()=>done(true);u.onerror=()=>{done(false);toast('Chạm nút loa để thử nghe lại.');};
        try{window.speechSynthesis.speak(u);}catch{done(false);}
      });
    }else toast('Trình duyệt chưa hỗ trợ đọc câu mới. Các từ có bản thu sẵn vẫn nghe được.',5500);
    if(token===sequence&&node){node.classList.remove('is-speaking');node.removeAttribute('aria-busy');}
    return ok;
  }
  async function playLines(kind){
    stopSpeech();const e=entry,lines=e[kind]||[];let run=lineRun;
    for(let i=0;i<lines.length;i++){
      if(entry!==e||view!=='book'||run!==lineRun)return;
      const row=content.querySelector(`[data-book-line="${kind}-${i}"]`);
      const promise=speak(lines[i],row);run=lineRun;
      const ok=await promise;
      if(!ok||entry!==e||view!=='book'||lineRun!==run)return;
      await new Promise(r=>setTimeout(r,240));
      if(lineRun!==run)return;
    }
  }
  function speaker(text,label='Nghe',extra=''){return `<button class="bk-listen" data-book-say="${esc(text)}" aria-label="Nghe: ${esc(text)}" ${extra}>${icon('speaker')}${label?`<span>${label}</span>`:''}</button>`;}
  function sceneEffect(name){
    if(name!=='correct'){Voice.effect(name);return;}
    if(!settings.sound)return;
    try{
      const ctx=Voice.ctx(),at=ctx.currentTime,volume=Math.max(.05,Math.min(1,Number(settings.soundVolume??.85)));
      [[1047,0,.22],[1397,.17,.32]].forEach(([hz,delay,duration])=>{
        const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=hz;
        gain.gain.setValueAtTime(.0001,at+delay);gain.gain.exponentialRampToValueAtTime(volume*.22,at+delay+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+delay+duration);
        oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(at+delay);oscillator.stop(at+delay+duration+.02);
      });
    }catch{}
  }
  const speedHTML=()=>`<label class="bk-speed">Tốc độ <select data-book-speed aria-label="Tốc độ đọc"><option value="0.8" ${speed<1?'selected':''}>Chậm</option><option value="1" ${speed>=1?'selected':''}>Vừa</option></select></label>`;
  function audioNote(){return '';}
  const wordsFor=e=>e.kind==='unit'?e.words:(e.unitNumbers||[]).flatMap(n=>BOOK.units[n-1].words);
  function progress(e){const s=state(e.id),qs=questions(e);if(!qs.length)return 0;return Math.round(qs.filter(q=>s.checked[q.id]==='correct').length/qs.length*100);}
  const complete=()=>BOOK.entries.filter(e=>['unit','fun','review'].includes(e.kind)&&progress(e)===100).length;
  function card(e){const p=progress(e);return `<button class="bk-entry" data-book-open="${e.id}" style="--bk-accent:${e.color}">${e.kind==='unit'?`<div class="bk-entry-cover"><img src="${SCENES[e.id]?.image||'book/scenes/unit-'+e.number+'.webp'}" alt="" loading="lazy"></div>`:`<div class="bk-extra-cover"><span aria-hidden="true">${e.kind==='fun'?'✦':e.kind==='review'?'★':e.kind==='glossary'?'Aa':'📖'}</span><b>${e.kind==='fun'?'Fun time':e.kind==='review'?'Review':e.kind==='glossary'?'Glossary':'Sách gốc'}</b></div>`}<div class="bk-entry-body"><div class="bk-row bk-between"><span class="bk-letter">${esc(e.letter||'TIẾNG ANH 1')}</span><span class="bk-muted">${e.kind==='unit'?'Unit '+e.number:''}</span></div><h3>${esc(e.en)}</h3><p>${esc(e.vi)}</p><div class="bk-entry-meta"><span>Trang ${e.pages.length===2?e.pages.join('–'):e.pages[0]+'–'+e.pages.at(-1)}</span><span>${p===100?'✓ Hoàn thành':p?p+'% đã làm đúng':'Bắt đầu học →'}</span></div><div class="bk-progress"><span style="width:${p}%"></span></div></div></button>`;}
  function hub(){
    PLAYER?.leave();entry=null;stopSpeech();
    const last=BOOK.entries.find(e=>e.id===bookState().lastEntry)||BOOK.units[0];
    content.innerHTML=`<section class="bk"><div class="bk-hero"><div><h1>Cuốn sách nhỏ.<br>Một thế giới để khám phá.</h1><div class="bk-row"><button class="btn" data-book-open="${last.id}">${bookState().updatedAt?'Học tiếp':'Mở sách'} ${icon('right')}</button><span class="bk-stars" aria-hidden="true">✦ ✧ ✦</span></div></div><div class="bk-hero-picture"><img src="book/illustrated/unit-1.webp" alt="Các bạn nhỏ học và chơi ở sân trường"></div></div><div class="bk-metrics"><div class="bk-metric"><span aria-hidden="true">${icon('book')}</span><div><b>16 bài</b></div></div><div class="bk-metric"><span aria-hidden="true">✦</span><div><b>8 phần ôn</b></div></div><div class="bk-metric"><span aria-hidden="true">✓</span><div><b>${complete()} / 24</b></div></div></div><div class="bk-row bk-between bk-top"><div><h2 style="margin:0">Hôm nay mình học gì?</h2></div><div class="bk-row"><button class="bk-back" data-book-export>Xuất bài làm</button><button class="bk-back" data-book-import>Nhập bài làm</button><input type="file" accept="application/json,.json" data-book-import-file hidden></div></div><div class="bk-tools"><input class="bk-search" type="search" data-book-search placeholder="Tìm bài, từ hoặc chủ đề…" aria-label="Tìm trong sách" value="${esc(search)}">${[['all','Tất cả'],['unit','Bài học'],['fun','Fun time'],['review','Ôn tập']].map(([id,label])=>`<button class="bk-filter" data-book-filter="${id}" aria-pressed="${filter===id}">${label}</button>`).join('')}</div><div data-book-hub-list>${hubList()}</div></section>`;
  }
  function hubList(){const matches=BOOK.entries.filter(e=>(filter==='all'||e.kind===filter)&&normal(e.en+' '+e.vi+' '+wordsFor(e).map(w=>w.en+' '+w.vi).join(' ')).includes(normal(search)));return matches.length?`<div class="bk-grid">${matches.map(card).join('')}</div>`:'<div class="bk-nosearch">Chưa tìm thấy bài phù hợp. Thử tên từ hoặc số bài nhé.</div>';}
  function open(id,newTab=null){
    const next=BOOK.entries.find(e=>e.id===id);if(!next)return;
    stopSpeech();remember(true);entry=next;wsStart=null;memoryHidden=false;practiceDrawing=false;sourcePage=next.page;
    bookState().lastEntry=id;
    const s=state(id),firstScene=next.kind==='unit'&&s.sceneLayout!==25;
    tab=newTab||(firstScene?'scene':s.tab)||(['intro'].includes(next.kind)?'source':next.kind==='glossary'?'words':next.kind==='unit'?'scene':'practice');
    if(next.kind==='unit')s.sceneLayout=25;
    if(!tabs(next).some(t=>t[0]===tab))tab=tabs(next)[0][0];
    state(id).tab=tab;view='book';setNav('book');document.getElementById('crumb').textContent='Sách Tiếng Anh 1';remember();render();
    content.scrollTo?.({top:0,behavior:'instant'});window.scrollTo({top:0,behavior:'instant'});
  }

  function tabs(e){if(e.kind==='intro')return [['source','Trang sách']];if(e.kind==='glossary')return [['words','Từ điển'],['source','Trang sách']];if(e.kind==='unit')return [['scene','Khám phá cảnh'],['words','Flashcard'],['practice','Bài tập'],['sentences','Tập nói'],['read','Chant & hát'],['source','Trang sách']];return [['practice','Bài tập'],['play',e.kind==='review'?'Câu chuyện':'Cùng chơi'],['words','Flashcard'],['source','Trang sách']];}
  function tabIcon(id){return icon(({scene:'game',words:'book',practice:'check',sentences:'speaker',read:'play',source:'book',play:'game'})[id]||'book');}
  function render(){
    if(!entry)return hub();const e=entry;
    PLAYER?.leave();trace=null;
    content.innerHTML=`<section class="bk bk-learning ${tab==='scene'?'bk-with-scene':''}" style="--bk-accent:${e.color}">
      <div class="bk-learning-top"><button class="bk-back" data-book-hub>${icon('left')}<span>Mục lục</span></button>
        <select class="bk-lesson-select" data-book-entry-select aria-label="Đổi bài">${BOOK.entries.map(x=>`<option value="${x.id}" ${e.id===x.id?'selected':''}>${x.kind==='unit'?'Unit '+x.number+' · ':''}${esc(x.en)}</option>`).join('')}</select>
        <div class="bk-row bk-listening-settings">${speedHTML()}<button class="bk-stop" data-book-stop title="Dừng nghe" aria-label="Dừng nghe">${icon('stop')}</button><button class="bk-stop" data-act="settings" aria-label="Cài đặt âm thanh" title="Cài đặt">${icon('settings')}</button></div>
      </div>
      <div class="bk-shell bk-shell-learning"><div class="bk-body">
        <header class="bk-lesson-header"><span class="bk-lesson-emblem" aria-hidden="true">${e.kind==='unit'?e.letter+'<small>'+e.letter.toLowerCase()+'</small>':e.kind==='fun'?'✦':e.kind==='review'?'★':'Aa'}</span><div><span class="bk-lesson-unit">${e.kind==='unit'?'UNIT '+e.number:e.kind==='fun'?'FUN TIME '+e.number:e.kind==='review'?'REVIEW '+e.number:'TIẾNG ANH 1'}</span><h1>${esc(e.kind==='unit'?e.en:e.vi)}</h1></div><span class="bk-header-sparkles" aria-hidden="true">✦<i>✧</i></span></header>
        <div class="bk-tabs bk-learning-tabs" role="tablist" aria-label="Các phần của bài">${tabs(e).map(([id,label],i)=>`<button class="bk-tab" id="bk-tab-${id}" role="tab" aria-selected="${tab===id}" aria-controls="bk-panel" tabindex="${tab===id?'0':'-1'}" data-book-tab="${id}" style="--tab-color:${['#6638de','#008f86','#e88315','#e65e85','#4087d8','#807298'][i]}">${tabIcon(id)}<span>${label}</span></button>`).join('')}</div>
        <div id="bk-panel" role="tabpanel" aria-labelledby="bk-tab-${tab}">${panelHTML(e)}</div>
        ${['source','read','play','sentences'].includes(tab)?`<div class="bk-entry-navigation">${entryNavigation(e)}</div>`:''}
      </div></div>
    </section>`;
    if(tab==='practice')paintChecks();
    if(tab==='scene'&&e.kind==='unit')PLAYER.mount({root:content.querySelector('[data-scene-flow]'),unit:e,saved:state(e.id),bridge:{speak,stop:stopSpeech,save:()=>remember(),effect:sceneEffect}});
    initCanvas();paintSaved();
  }

  function entryNavigation(e){const i=BOOK.entries.findIndex(x=>x.id===e.id);return `${i>0?`<button class="bk-back" data-book-open="${BOOK.entries[i-1].id}">← Phần trước</button>`:'<span></span>'}${i<BOOK.entries.length-1?`<button class="bk-back" data-book-open="${BOOK.entries[i+1].id}">Phần tiếp →</button>`:''}`;}
  function panelHTML(e){if(tab==='scene')return PLAYER.html(e,state(e.id));if(tab==='source')return sourceHTML(e);if(tab==='words')return e.kind==='glossary'?glossaryHTML():wordsHTML(e);if(tab==='sentences')return sentencesHTML(e);if(tab==='read')return readHTML(e);if(tab==='play')return playHTML(e);return practiceHTML(e);}

  const reviewWords=e=>e.kind==='unit'?PLAYER.words(e):wordsFor(e);
  function wordsHTML(e){
    const words=reviewWords(e),s=state(e.id),index=Math.max(0,Math.min(words.length-1,Number(s.flashIndex)||0)),w=words[index],hidden=Boolean(s.hideMeanings);
    s.flashIndex=index;
    return `<div class="bk-flash-layout">
      <article class="bk-flashcard ${hidden?'is-meanings-hidden':''}" data-book-flashcard aria-label="Thẻ từ ${index+1}">
        <div class="bk-flash-top"><span class="bk-flash-badge">${e.kind==='unit'?e.letter+e.letter.toLowerCase():'Aa'}</span><b>${index+1} / ${words.length}</b></div>
        <div class="bk-flash-picture"><button class="bk-arrow" data-book-flash-step="-1" aria-label="Thẻ trước" ${index===0?'disabled':''}>${icon('left')}</button><button class="bk-flash-image" data-book-say="${esc(w.en)}" aria-label="Nghe: ${esc(w.en)}">${visual(w.en)}<span class="bk-picture-stars" aria-hidden="true">✦<i>✧</i></span></button><button class="bk-arrow" data-book-flash-step="1" aria-label="Thẻ tiếp theo" ${index===words.length-1?'disabled':''}>${icon('right')}</button></div>
        <div class="bk-flash-word" lang="en" data-book-say="${esc(w.en)}">${esc(w.en)}</div><div class="bk-ipa">${esc(w.ipa||'')}</div>
        <div class="bk-flash-meaning"><span class="bk-vi">${esc(w.vi)}</span>${w.base?`<span class="bk-flash-base" lang="en">${esc(w.base)} → ${esc(w.en)}</span>`:''}</div>
        <div class="bk-flash-controls">${speaker(w.en,'Nghe phát âm')}<button class="bk-flash-reveal" data-book-review-meanings aria-pressed="${hidden}">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'}<span>${hidden?'Hiện nghĩa':'Ẩn nghĩa'}</span></button></div>
      </article>
      <aside class="bk-flash-side"><div class="bk-flash-tiles" aria-label="Các thẻ từ">${words.map((x,i)=>`<button class="bk-flash-tile" data-book-flash-index="${i}" aria-pressed="${i===index}" aria-label="Thẻ ${esc(x.en)}">${visual(x.en)}<b lang="en">${esc(x.en)}</b>${s.scene?.visited?.includes(x.en)?'<span class="bk-tile-seen" aria-hidden="true">✓</span>':''}</button>`).join('')}</div><button class="btn bk-flash-practice" data-book-tab="practice">${icon('game')}Bài tập ${icon('right')}</button></aside>
    </div>`;
  }
  function flashTo(index){
    const s=state(entry.id),words=reviewWords(entry);s.flashIndex=Math.max(0,Math.min(words.length-1,index));stopSpeech();remember();
    content.querySelector('#bk-panel').innerHTML=wordsHTML(entry);
  }

  const rules={1:'Hi, I’m + tên: dùng để giới thiệu bản thân. Bye, + tên: dùng để chào tạm biệt.',2:'I have a + đồ vật/con vật: Mình có một…',3:'This is my + đồ vật: Đây là … của mình.',4:'This is a + đồ vật/con vật: Đây là một…',5:'I like + món ăn/đồ uống: Mình thích…',6:'It’s a red + đồ vật: Đó là một … màu đỏ.',7:'There’s a + người/con vật/đồ vật: Có một…',8:'Touch your + bộ phận cơ thể: Chạm vào … của con.',9:'How many + danh từ số nhiều?: Có bao nhiêu…?',10:'That’s a + con vật/đồ vật: Kia là một…',11:'He’s = He is; She’s = She is. Running là đang chạy.',12:'Look at + tên người. Look at the + đồ vật: Nhìn … kìa.',13:'He’s/She’s having + món ăn: Bạn ấy đang ăn…',14:'I can see a + con vật/đồ vật: Mình nhìn thấy một…',15:'Point to your + bộ phận cơ thể: Chỉ vào … của con.',16:'How many … can you see?: Con nhìn thấy bao nhiêu…? I can see + số: Mình nhìn thấy…'};
  function sentencesHTML(e){return `<div class="bk-section-head"><h2><span class="bk-activity-num">6</span>Nghe mẫu câu</h2></div>${e.sentences.map(s=>`<article class="bk-dialogue"><div><div class="bk-en" lang="en">${esc(s.en)}</div><div class="bk-vi">${esc(s.vi)}</div></div>${speaker(s.en,'')}</article>`).join('')}<div class="bk-rule"><b>Cách nói của bài này</b><p style="margin:9px 0 0">${esc(rules[e.number])}</p></div><div class="bk-card"><div class="bk-section-head"><h2><span class="bk-activity-num">7</span>Đến lượt mình nói</h2></div>${e.number===1?`<label class="bk-muted" for="bk-my-name">Tên của con</label><div class="bk-row" style="margin-top:9px"><input class="bk-name-input" id="bk-my-name" data-book-name value="${esc(state(e.id).name||'Bill')}" maxlength="50" autocomplete="off"><button class="bk-listen" data-book-say-name>🔊 Nghe lời chào</button></div>`:`<div class="bk-word-grid">${talkWords(e).map(w=>`<button class="bk-option" data-book-say="${esc(talkSentence(e,w))}">${visual(w.en)}<span>${esc(talkSentence(e,w))}</span></button>`).join('')}</div>`}</div>${audioNote()}`;}
  function talkWords(e){if(e.number===6)return ['pencil','pen','desk','bell'].map(findWord);if(e.number===10)return ['monkey','mouse','mango','horse'].map(findWord);if(e.number===12)return ['Lucy','lake','leaf','lemons'].map(findWord);if(e.number===15)return ['hand','face','hair','foot'].map(findWord);return e.words;}
  function talkSentence(e,w){const n=e.number,x=w.en;return n===2?'I have a '+x+'.':n===3?'This is my '+x+'.':n===4?'This is a '+x+'.':n===5?'I like '+x+'.':n===6?"It's a red "+x+'.':n===7?"There's a "+x+'.':n===8?'Touch your '+x+'.':n===9?'How many '+x+'?':n===10?"That's a "+x+'.':n===11?(x==='run'?"He's running.":'Look at the '+x+'.'):n===12?'Look at '+(x==='Lucy'?'Lucy':'the '+x)+'.':n===13?"She's having "+x+'.':n===14?'I can see a '+x+'.':n===15?'Point to your '+x+'.':n===16?'Look at the '+x+'.':w.en;}
  function lineBlock(title,kind,lines){return `<section class="bk-card"><div class="bk-section-head"><h2>${title}</h2><div class="bk-audio-controls"><button class="bk-listen" data-book-read="${kind}">${icon('play')} Đọc cả đoạn</button></div></div><div class="bk-lines">${lines.map((line,i)=>`<div class="bk-line" data-book-line="${kind}-${i}"><span lang="en">${esc(line)}</span>${speaker(line,'')}</div>`).join('')}</div></section>`;}
  function readHTML(e){return lineBlock('3 · Listen and chant','chant',e.chant)+lineBlock('8 · Let’s sing — lời bài hát','song',e.song)+audioNote();}
  function question(id,type,prompt,answers,extras={}){return {id,type,prompt,answers:Array.isArray(answers)?answers:[answers],...extras};}
  function questions(e){
    if(!e||['intro','glossary'].includes(e.kind))return [];
    const qs=[];
    if(e.kind==='unit'){
      e.listen.forEach((q,i)=>qs.push(question('listen-'+i,'listen','Nghe và chọn hình đúng',q.target,{options:q.options,audio:q.target,group:'4 · Nghe và chọn'})));
      if(e.gaps.length)e.gaps.forEach(([word,answer],i)=>qs.push(question('gap-'+i,'gap',word,answer,{word:word.replace('_',answer),max:answer.length,group:'5 · Điền chữ còn thiếu'})));
      else for(const [i,value] of [[0,e.letter],[1,e.letter.toLowerCase()]])qs.push(question('letter-'+i,'write',i?'Viết chữ thường':'Viết chữ hoa',value,{strict:true,max:1,group:'5 · Viết chữ của bài'}));
      e.words.forEach((w,i)=>qs.push(question('word-'+i,'write',w.vi,w.en,{word:w.en,max:w.en.length,group:'Ôn tập thêm · Viết từ theo nghĩa'})));
      talkWords(e).forEach((w,i)=>{const sentence=talkSentence(e,w);if(e.number===1)return;const target=e.number===11&&w.en==='run'?'running':w.en;qs.push(question('sentence-'+i,'gap',sentence.replace(target,'___'),target,{max:target.length,word:w.en,group:'7 · Điền câu theo hình'}));});
      if(e.number===1){qs.push(question('greeting','gap',"Hi, ___ Bill.",["I'm",'I am'],{max:4,group:'7 · Điền lời chào'}),question('bye','gap','___, Bill.','Bye',{max:3,group:'7 · Điền lời chào'}));}
      if(e.number===9)for(const [i,[noun,n]] of [['clocks','two'],['locks','three'],['pots','four'],['mops','five']].entries())qs.push(question('count-'+i,'gap','How many '+noun+'? ___',n,{word:n+' '+noun,max:5,group:'7 · Đếm theo lời bài hát',alternatives:[String(i+2)]}));
      if(e.number===16)qs.push(question('window-count','gap','How many windows can you see? I can see ___.',['six','6'],{word:'six windows',max:3,group:'7 · Đếm theo mẫu câu'}));
    }else{
      if(e.kind==='review'){
        e.look.forEach((word,i)=>qs.push(question('look-'+i,'choice','Chọn từ ứng với hình',word,{word,options:[word,...wordsFor(e).map(w=>w.en).filter(w=>w!==word).slice(i,i+2)],group:'2 · Nhìn hình và chọn từ'})));
        e.listen.forEach((q,i)=>qs.push(question('listen-'+i,'listen','Nghe và chọn hình',q.target,{options:q.options,audio:q.target,group:'Self-check · Nghe và chọn'})));
        e.letters.forEach((q,i)=>qs.push(question('sound-'+i,'listen-letter','Nghe tên chữ và chọn',q.target,{options:q.options,audio:q.target.toUpperCase(),group:'Self-check · Nghe và chọn chữ'})));
        wordsFor(e).slice(0,4).forEach((w,i)=>{const distractor=wordsFor(e)[i+4]?.en||'book';const spoken=i%2?w.en:distractor;qs.push(question('true-'+i,'true','Nghe: từ được đọc có đúng với hình không?',spoken===w.en?'yes':'no',{word:w.en,audio:spoken,options:['yes','no'],group:'Self-check · Nghe và đánh dấu'}));});
      }
      if(e.read)e.read.forEach((options,i)=>qs.push(question('read-'+i,'read','Đọc: '+(e.targets?.[i]||e.readTargets?.[i]),e.targets?.[i]||e.readTargets?.[i],{options,group:'Đọc và chọn hình'})));
      (e.gaps||[]).forEach(([word,value],i)=>{const answers=value.split('|');qs.push(question('gap-'+i,'gap',word,value.includes('|')?answers.join(''):value,{max:answers.join('').length,word:fillMask(word,answers.join('')),group:'Viết các chữ còn thiếu'}));});
      if(e.matches)e.matches.forEach(([prompt,answer],i)=>qs.push(question('match-'+i,'match',prompt,answer,{options:['a','b','c','d'],group:'3 · Ghép số lượng với hình'})));
      if(e.patterns)e.patterns.forEach((pattern,i)=>pattern.slice(2).forEach((word,j)=>qs.push(question('pattern-'+i+'-'+j,'choice','Điền tiếp dãy: '+pattern.slice(0,2).join(' → ')+' → …',word,{options:pattern.slice(0,2),word:null,group:'1 · Nhận biết dãy hình'}))));
      if(e.grid||e.chain){(e.find||[]).forEach((word,i)=>qs.push(question('find-'+i,'found','Tìm từ '+word,word,{word,group:'Tìm từ trong bảng chữ'})));}
      // Additional writing practice is available for every review/fun-time section.
      wordsFor(e).slice(0,e.kind==='review'?8:4).forEach((w,i)=>qs.push(question('word-'+i,'write',w.vi,w.en,{max:w.en.length,word:w.en,group:'Ôn tập thêm · Viết từ'})));
    }
    return qs;
  }
  function fillMask(word,value){let i=0;return word.replace(/_/g,()=>value[i++]||'');}

  function questionHTML(q,index){
    const s=state(entry.id),value=s.answers[q.id]||'',a=q.options||[],pictures=['listen','read','match'].includes(q.type);
    return `<article class="bk-question bk-focus-question ${pictures?'has-picture-answers':''}" data-book-q="${q.id}" data-book-q-index="${index}">
      <div class="bk-q-label"><span>${index+1}</span><b>${questions(entry).length}</b></div>
      <div class="bk-q-body">${q.word&&q.type!=='found'?visual(q.word):''}<div class="bk-q-prompt" lang="${q.type==='gap'?'en':'vi'}">${esc(q.prompt)}</div>${q.audio?speaker(q.audio,'Nghe'):''}
        ${['write','gap'].includes(q.type)?`<label class="visually-hidden" for="bk-answer-${q.id}">Đáp án câu ${index+1}: ${esc(q.prompt)}</label><input class="bk-answer-input ${q.max<=2?'bk-gap-input':''}" id="bk-answer-${q.id}" data-book-answer="${q.id}" value="${esc(value)}" maxlength="${q.max||80}" placeholder="…" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="bk-feedback-${q.id}">`:''}
      </div>
      ${['choice','listen','listen-letter','read','true','match'].includes(q.type)?`<div class="bk-options" style="--options:${a.length}">${a.map((option,i)=>`<button class="bk-option" data-book-choice="${q.id}" data-book-value="${esc(option)}" aria-pressed="${value===option}">${pictures?visual(q.type==='match'?entry.matchOptions['abcd'.indexOf(option)]:option):''}<span class="bk-radio" aria-hidden="true"></span><b>${q.type==='true'?(option==='yes'?'✓ Đúng':'✕ Khác'):pictures?String.fromCharCode(65+i):esc(option)}</b></button>`).join('')}</div>`:''}
      <div class="bk-answer-status"><div class="bk-feedback" id="bk-feedback-${q.id}" role="status"></div>${q.type!=='found'?`<button class="bk-answer-reveal" data-book-reveal="${q.id}" hidden>Xem đáp án</button>`:''}</div>
    </article>`;
  }
  function activityName(group){
    if(/Nghe và chọn chữ/.test(group))return 'Nghe chữ';
    if(/Nghe và đánh dấu/.test(group))return 'Đúng · Sai';
    if(/Nghe/.test(group))return 'Nghe & chọn';
    if(/Điền chữ|Viết chữ|Viết các chữ/.test(group))return 'Điền chữ';
    if(/Viết từ/.test(group))return 'Viết từ';
    if(/Điền câu|lời chào/.test(group))return 'Mẫu câu';
    if(/Đếm/.test(group))return 'Đếm hình';
    if(/Nhìn hình/.test(group))return 'Hình & từ';
    if(/Đọc/.test(group))return 'Đọc & chọn';
    if(/Ghép/.test(group))return 'Ghép hình';
    if(/dãy/.test(group))return 'Dãy hình';
    if(/Tìm từ/.test(group))return 'Tìm từ';
    return group.replace(/^.*?·\s*/,'');
  }
  function practiceHTML(e){
    const qs=questions(e),s=state(e.id),groups=[...new Set(qs.map(q=>q.group))],index=Math.max(0,Math.min(qs.length-1,Number(s.practiceIndex)||0)),q=qs[index];
    s.practiceIndex=index;
    return `<div class="bk-practice-workspace">
      <div class="bk-practice-activities" role="group" aria-label="Dạng bài tập">${groups.map((g,i)=>`<button data-book-activity="${i}" aria-pressed="${!practiceDrawing&&q.group===g}"><span class="bk-activity-icon" aria-hidden="true">${/Nghe/.test(g)?'♫':/Viết|Điền/.test(g)?'✎':/Đếm|Ghép/.test(g)?'✦':/Tìm/.test(g)?'⌕':'★'}</span>${activityName(g)}</button>`).join('')}${e.kind==='unit'?`<button data-book-drawing aria-pressed="${practiceDrawing}"><span class="bk-activity-icon" aria-hidden="true">✎</span>Tô chữ</button>`:''}</div>
      <div class="bk-practice-stage">${groups.map(g=>`<section class="bk-practice-group" data-book-practice-group ${practiceDrawing||q.group!==g?'hidden':''}>${qs.map((x,i)=>x.group===g?questionHTML(x,i).replace('<article ',i===index&&!practiceDrawing?'<article ':'<article hidden '):'').join('')}${g===q.group&&q.type==='found'?(e.grid?wordsearchHTML(e):e.chain?chainHTML(e):''):''}</section>`).join('')}
        ${e.kind==='unit'?`<div data-book-drawing-panel ${practiceDrawing?'':'hidden'}>${canvasHTML(e.letter+' '+e.letter.toLowerCase())}</div>`:''}
      </div>
      <div class="bk-checkbar" ${practiceDrawing?'hidden':''}><div class="bk-question-map" aria-label="Chuyển câu">${qs.map((x,i)=>`<button data-book-question-step="${i}" aria-label="Câu ${i+1}" aria-current="${i===index}">${i+1}</button>`).join('')}</div>
        <div class="bk-practice-actions"><button class="bk-arrow" data-book-question-prev aria-label="Câu trước" ${index===0?'disabled':''}>${icon('left')}</button><div class="bk-check-count" data-book-check-count></div><button class="btn bk-check-current" data-book-check-one>Kiểm tra ${icon('check')}</button><button class="bk-arrow" data-book-question-next aria-label="Câu tiếp theo" ${index===qs.length-1?'disabled':''}>${icon('right')}</button><button class="bk-grade-all" data-book-check>Chấm bài</button><button class="bk-retry-icon" data-book-retry title="Làm lại câu sai" aria-label="Làm lại câu sai">${icon('replay')}</button></div>
      </div><div data-book-result></div>
    </div>`;
  }
  function renderPractice(){content.querySelector('#bk-panel').innerHTML=practiceHTML(entry);paintChecks();initCanvas();}
  function questionTo(index){const qs=questions(entry);practiceDrawing=false;state(entry.id).practiceIndex=Math.max(0,Math.min(qs.length-1,index));stopSpeech();wsStart=null;remember();renderPractice();}
  function checkOne(){
    const s=state(entry.id),qs=questions(entry),index=s.practiceIndex||0,q=qs[index];
    if(s.checked[q.id]==='correct'){if(index<qs.length-1)questionTo(index+1);else check();return;}
    stopSpeech();s.checked[q.id]=checkValue(q,s);s.best=Math.max(s.best||0,qs.filter(x=>s.checked[x.id]==='correct').length);remember(true);paintChecks();
    Voice.effect(s.checked[q.id]==='correct'?'correct':'wrong');
    const item=content.querySelector('[data-book-q="'+q.id+'"]');
    item.classList.remove('is-answer-shaking');if(s.checked[q.id]==='wrong'){void item.offsetWidth;item.classList.add('is-answer-shaking');}
  }

  function checkValue(q,s){const value=s.answers[q.id]||'';if(q.type==='found')return s.found.includes(q.word)?'correct':'empty';if(!String(value).trim())return 'empty';return [...q.answers,...(q.alternatives||[])].some(a=>q.strict?value===a:normal(value)===normal(a))?'correct':'wrong';}
  function check(){stopSpeech();const s=state(entry.id),qs=questions(entry);qs.forEach(q=>s.checked[q.id]=checkValue(q,s));s.best=Math.max(s.best||0,qs.filter(q=>s.checked[q.id]==='correct').length);s.lastCheck=new Date().toISOString();remember(true);paintChecks(true);Voice.effect(qs.every(q=>s.checked[q.id]==='correct')?'finish':qs.some(q=>s.checked[q.id]==='wrong')?'wrong':'correct');}
  function paintChecks(showResult=false){
    if(!entry)return;const qs=questions(entry),s=state(entry.id);
    for(const q of qs){const node=content.querySelector(`[data-book-q="${q.id}"]`);if(!node)continue;const status=s.checked[q.id],feedback=node.querySelector('.bk-feedback'),reveal=node.querySelector('[data-book-reveal]');
      node.classList.remove('is-correct','is-wrong','is-empty');if(status)node.classList.add('is-'+status);
      const input=node.querySelector('input');if(input){input.setAttribute('aria-invalid',status==='wrong'?'true':'false');}
      feedback.textContent=status==='correct'?'✓ Đúng rồi!':status==='wrong'?'Thử lại nhé!':status==='empty'?'Điền đáp án nhé!':'';
      if(reveal)reveal.hidden=!['wrong'].includes(status);
      if(s.revealed[q.id])feedback.textContent+=(feedback.textContent?' ':'')+'Đáp án: '+q.answers.join(' / ')+'.';
    }
    const answered=qs.filter(q=>q.type==='found'?s.found.includes(q.word):String(s.answers[q.id]||'').trim()).length,correct=qs.filter(q=>s.checked[q.id]==='correct').length,wrong=qs.filter(q=>s.checked[q.id]==='wrong').length,empty=qs.filter(q=>s.checked[q.id]==='empty').length;

    const meter=content.querySelector('[data-book-check-count]');if(meter)meter.innerHTML=`<span aria-hidden="true">★</span><b>${correct} / ${qs.length}</b>`;
    content.querySelectorAll('[data-book-question-step]').forEach(n=>{const status=s.checked[qs[Number(n.dataset.bookQuestionStep)].id];n.classList.toggle('is-done',status==='correct');n.classList.toggle('is-missed',status==='wrong');});
    const action=content.querySelector('[data-book-check-one]'),current=qs[s.practiceIndex||0],done=s.checked[current?.id]==='correct';
    if(action){action.innerHTML=done?((s.practiceIndex||0)===qs.length-1?'Chấm bài':'Tiếp theo')+' '+icon('right'):'Kiểm tra '+icon('check');action.classList.toggle('is-ready',done);}
    const result=content.querySelector('[data-book-result]');
    if(result&&showResult)result.innerHTML=`<div class="bk-result" role="status"><span class="bk-result-star" aria-hidden="true">★</span><h3>${correct===qs.length?'Giỏi lắm!':correct+' / '+qs.length+' câu đúng'}</h3>${correct===qs.length?'<button class="btn" data-book-tab="words">Ôn từ</button>':`<button class="bk-back" data-book-retry>Sửa ${wrong+empty} câu</button>`}</div>`;
  }

  function answer(id,value){const s=state(entry.id);s.answers[id]=value;delete s.checked[id];delete s.revealed[id];remember();paintChecks();}
  function retry(){const s=state(entry.id);for(const q of questions(entry))if(s.checked[q.id]!=='correct'){delete s.answers[q.id];delete s.checked[q.id];delete s.revealed[q.id];}s.lastCheck=null;stopSpeech();remember(true);const qs=questions(entry);s.practiceIndex=Math.max(0,qs.findIndex(q=>s.checked[q.id]!=='correct'));practiceDrawing=false;renderPractice();const first=content.querySelector('[data-book-answer]:not([value]),[data-book-answer][value=""]');first?.focus({preventScroll:true});}
  function glossaryHTML(){return `<div class="bk-tools"><input class="bk-search" type="search" data-book-glossary-search placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt…" aria-label="Tìm từ trong từ điển"></div><div class="bk-search-status" data-book-glossary-status>${BOOK.glossary.length} từ · phiên âm Anh-Anh</div><div class="bk-glossary-scroll"><table class="bk-glossary"><thead><tr><th>Từ & phiên âm</th><th>Nghĩa</th><th>Nghe</th><th>Bài</th></tr></thead><tbody data-book-glossary-list>${glossaryRows(BOOK.glossary)}</tbody></table></div>${audioNote()}`;}
  function glossaryRows(words){return words.map(w=>`<tr><td lang="en">${esc(w.en)}<small>${esc(w.ipa)}</small></td><td>${esc(w.vi)}</td><td>${speaker(w.en,'')}</td><td><button data-book-open="u${w.unit}">U${w.unit}</button></td></tr>`).join('');}
  function sourceHTML(e){return `<div class="bk-source-toolbar"><div class="bk-row"><button class="bk-back" data-book-page-step="-1" ${sourcePage===1?'disabled':''}>← Trang</button><select data-book-page-select aria-label="Chọn trang sách gốc">${Array.from({length:77},(_,i)=>`<option value="${i+1}" ${sourcePage===i+1?'selected':''}>Trang ${i+1}${e.pages.includes(i+1)?' · Phần này':''}</option>`).join('')}</select><button class="bk-back" data-book-page-step="1" ${sourcePage===77?'disabled':''}>Trang →</button></div><div class="bk-row">${e.pages.map(p=>`<button class="bk-filter" data-book-page="${p}" aria-pressed="${sourcePage===p}">${p}</button>`).join('')}</div></div><div class="bk-source-page"><img src="${pageURL(sourcePage)}" alt="Trang ${sourcePage} của sách Tiếng Anh 1">${sourceHotspots(sourcePage)}</div><p class="bk-page-foot">${sourcePage} / 77</p>`;}
  function sourceHotspots(p){const u=BOOK.units.find(u=>u.page===p);if(!u)return '';return `<div class="bk-source-wordbar">${u.words.map(w=>speaker(w.en,w.en)).join('')}</div>`;}
  function wordsearchHTML(e){return `<section class="bk-card"><div class="bk-section-head"><h2>Tìm từ trong bảng chữ</h2></div><div class="bk-search-gesture" aria-label="Chọn chữ đầu rồi chữ cuối">A <span>→</span> Z</div><div class="bk-wordsearch" style="--cols:${e.grid[0].length}">${e.grid.flatMap((row,r)=>Array.from(row).map((c,col)=>`<button class="bk-ws-cell" data-book-cell="${r},${col}" aria-label="${c}, hàng ${r+1}, cột ${col+1}">${esc(c)}</button>`)).join('')}</div><div class="bk-ws-words">${e.find.map(w=>`<span class="bk-ws-word ${state(e.id).found.includes(w)?'is-found':''}" data-book-found-word="${esc(w)}">${esc(w)}</span>`).join('')}</div><p class="bk-ws-tip" data-book-ws-tip>Con tìm được ${state(e.id).found.length} / ${e.find.length} từ.</p></section>`;}
  function chainHTML(e){return `<section class="bk-card"><h2>Tìm từ trong dãy chữ</h2><div class="bk-chain">${Array.from(e.chain).map((c,i)=>`<button data-book-chain="${i}" aria-label="Chữ ${c}, vị trí ${i+1}">${c}</button>`).join('')}</div><div class="bk-ws-words">${e.find.map(w=>`<span class="bk-ws-word ${state(e.id).found.includes(w)?'is-found':''}" data-book-found-word="${esc(w)}">${w}</span>`).join('')}</div><p class="bk-ws-tip" data-book-ws-tip>Chọn một từ con tìm thấy nhé.</p></section>`;}
  function cellClick(value,chain=false){
    const key=chain?'[data-book-chain]':'[data-book-cell]';content.querySelectorAll(key).forEach(n=>n.classList.remove('is-first'));
    if(wsStart===null){wsStart=value;const n=content.querySelector(chain?`[data-book-chain="${value}"]`:`[data-book-cell="${value}"]`);n?.classList.add('is-first');return;}
    let selected='',coords=[];
    if(chain){const a=Number(wsStart),b=Number(value);selected=entry.chain.slice(Math.min(a,b),Math.max(a,b)+1);coords=Array.from({length:Math.abs(b-a)+1},(_,i)=>Math.min(a,b)+i);}
    else{const [r,c]=wsStart.split(',').map(Number),[rr,cc]=value.split(',').map(Number);if(r!==rr&&c!==cc){wsStart=null;toast('Chọn từ theo hàng ngang hoặc cột dọc nhé.');return;}const dr=Math.sign(rr-r),dc=Math.sign(cc-c),steps=Math.max(Math.abs(rr-r),Math.abs(cc-c));for(let i=0;i<=steps;i++){selected+=entry.grid[r+dr*i][c+dc*i];coords.push((r+dr*i)+','+(c+dc*i));}}
    wsStart=null;
    const found=entry.find.find(w=>w===selected||w===Array.from(selected).reverse().join(''));
    if(!found){toast('Chưa thành một từ cần tìm. Con thử lại nhé.');return;}
    const s=state(entry.id);if(!s.found.includes(found)){s.found.push(found);remember(true);Voice.effect('correct');}
    coords.forEach(v=>content.querySelector(chain?`[data-book-chain="${v}"]`:`[data-book-cell="${v}"]`)?.classList.add('is-found'));
    content.querySelector(`[data-book-found-word="${found}"]`)?.classList.add('is-found');
    const q=questions(entry).find(q=>q.type==='found'&&q.word===found);if(q)s.checked[q.id]='correct';paintChecks();remember();
    const tip=content.querySelector('[data-book-ws-tip]');if(tip)tip.textContent=`✓ ${found} · ${s.found.length} / ${entry.find.length} từ đã tìm.`;
  }
  function canvasHTML(letters=''){return `<section class="bk-card"><div class="bk-section-head"><h2>${letters?'Tập tô chữ':'Bảng vẽ của bé'}</h2></div><div class="bk-trace"><canvas data-book-canvas width="900" height="380" aria-label="Bảng tập viết và vẽ" data-book-trace-letters="${esc(letters)}"></canvas><div class="bk-trace-toolbar"><label>Màu <input type="color" data-book-pen-color value="${state(entry.id).penColor||'#613CE7'}"></label><label>Nét <select data-book-pen-width><option value="4">Nhỏ</option><option value="8" selected>Vừa</option><option value="13">To</option></select></label><div class="bk-row"><button data-book-undo>Hoàn tác</button><button data-book-clear-drawing>Xóa bảng</button></div></div></div></section>`;}
  function initCanvas(){const c=content.querySelector('[data-book-canvas]');if(!c)return;trace=c;drawCanvas();let stroke=null;
    const point=e=>{const r=c.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];};
    c.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();c.setPointerCapture(e.pointerId);stroke={color:content.querySelector('[data-book-pen-color]').value,width:Number(content.querySelector('[data-book-pen-width]').value),points:[point(e)]};state(entry.id).drawing.push(stroke);drawCanvas();});
    c.addEventListener('pointermove',e=>{if(!stroke)return;e.preventDefault();stroke.points.push(point(e));drawCanvas();});
    const end=()=>{if(stroke){stroke=null;remember(true);}};c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);c.addEventListener('lostpointercapture',end);
  }
  function drawCanvas(){if(!trace||!entry)return;const c=trace,ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#FAF8FE';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#D7C7E9';ctx.lineWidth=1;for(let y=40;y<h;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}const letters=c.dataset.bookTraceLetters;if(letters){ctx.font='190px Nunito, sans-serif';ctx.fillStyle='#D9C8ED';ctx.textBaseline='middle';ctx.fillText(letters+'  '+letters,60,h/2+10);}ctx.lineCap='round';ctx.lineJoin='round';for(const stroke of state(entry.id).drawing){if(!stroke?.points?.length)continue;ctx.strokeStyle=stroke.color;ctx.lineWidth=stroke.width*2;ctx.beginPath();ctx.moveTo(stroke.points[0][0]*w,stroke.points[0][1]*h);for(const p of stroke.points.slice(1))ctx.lineTo(p[0]*w,p[1]*h);if(stroke.points.length===1){const [x,y]=stroke.points[0];ctx.lineTo(x*w+.01,y*h+.01);}ctx.stroke();}}
  function playHTML(e){if(e.kind==='review')return lineBlock('Câu chuyện của Phil và Sue','story',e.story);return `<section class="bk-card"><div class="bk-section-head"><h2>${esc(e.play)}</h2></div><div class="bk-simon" data-book-game-prompt>★</div><div class="bk-row"><button class="btn" data-book-challenge>Lấy thử thách ✦</button><button class="bk-listen" data-book-repeat-challenge>🔊 Nghe lại</button></div></section><section class="bk-card"><div class="bk-section-head"><h2>${e.number===3?'Nhớ các hình':'Gọi tên hình'}</h2>${e.number===3?'<button class="bk-back" data-book-memory>Ẩn hình để nhớ</button>':''}</div><div class="bk-small-grid" data-book-memory-grid>${wordsFor(e).map(w=>`<button class="bk-option" data-book-say="${esc(w.en)}">${visual(w.en)}<b>${esc(w.en)}</b></button>`).join('')}</div>${e.number===3?'<div class="bk-memory-recall" hidden data-book-recall><label for="bk-recall">Con nhớ những từ nào? Viết cách nhau bằng dấu phẩy.</label><input id="bk-recall" class="bk-search" data-book-recall-input style="margin-top:12px;width:100%" placeholder="monkey, mango, ..."><button class="bk-back" data-book-recall-check style="margin-top:12px">Kiểm tra từ đã nhớ</button><p class="bk-muted" data-book-recall-result style="margin-top:12px"></p></div>':''}</section>${canvasHTML()}${audioNote()}`;}
  function exportWork(){remember(true);const blob=new Blob([JSON.stringify({format:'sunny-book-progress',version:26,exportedAt:new Date().toISOString(),book:data.book},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a',{href:url,download:'Sunny-Book-bai-lam.json'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importWork(file){if(!file)return;if(file.size>5*1024*1024){toast('Tệp bài làm quá lớn. Hãy chọn tệp Sunny-Book-bai-lam.json.');return;}try{const incoming=JSON.parse(await file.text());if(incoming.format!=='sunny-book-progress'||![24,25,26].includes(incoming.version)||!incoming.book?.entries||Array.isArray(incoming.book.entries))throw Error('format');
      for(const [id,value] of Object.entries(incoming.book.entries)){if(!BOOK.entries.some(e=>e.id===id)||!value||typeof value!=='object')continue;const local=state(id);for(const k of ['answers','checked','revealed'])if(value[k]&&typeof value[k]==='object'&&!Array.isArray(value[k])){for(const q of questions(BOOK.entries.find(e=>e.id===id)))if(Object.hasOwn(value[k],q.id)&&['string','boolean'].includes(typeof value[k][q.id]))local[k][q.id]=value[k][q.id];}if(Array.isArray(value.found))local.found=[...new Set([...local.found,...value.found.filter(w=>typeof w==='string')])];if(Array.isArray(value.drawing))local.drawing=value.drawing.filter(s=>s&&/^#[0-9a-f]{6}$/i.test(s.color)&&Number.isFinite(s.width)&&s.width>0&&s.width<30&&Array.isArray(s.points)&&s.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)));const e=BOOK.entries.find(e=>e.id===id);for(const q of questions(e))if(Object.hasOwn(local.checked,q.id))local.checked[q.id]=checkValue(q,local);local.lastCheck=value.lastCheck||local.lastCheck;
        if(e.kind==='unit'&&value.scene&&typeof value.scene==='object'&&!Array.isArray(value.scene)){const allowed=SCENES[e.id].nodes.map(n=>n.en),source=value.scene,current=local.scene||{};local.scene={...current,visited:[...new Set([...(current.visited||[]),...(Array.isArray(source.visited)?source.visited.filter(w=>allowed.includes(w)):[])])],mistakes:[...new Set([...(current.mistakes||[]),...(Array.isArray(source.mistakes)?source.mistakes.filter(w=>allowed.includes(w)):[])])],best:Math.max(Number(current.best)||0,Math.min(allowed.length,Number(source.best)||0))};if(source.lastTest&&Number.isInteger(source.lastTest.firstTry)&&source.lastTest.firstTry>=0&&source.lastTest.firstTry<=allowed.length&&source.lastTest.total===allowed.length&&Number.isInteger(source.lastTest.misses)&&source.lastTest.misses>=0)local.scene.lastTest={firstTry:source.lastTest.firstTry,total:allowed.length,misses:source.lastTest.misses,date:String(source.lastTest.date||'')};}
}
      remember(true);toast('Đã nhập bài làm. Các bài khác trên thiết bị vẫn được giữ.');hub();
    }catch{toast('Tệp không đúng định dạng bài làm của Sunny Book.',5000);}}
  // Add one book destination to both existing navigations.
  document.querySelectorAll('.sidebar,.mobile-nav').forEach(nav=>{const button=el('button',{className:nav.classList.contains('sidebar')?'nav':'',innerHTML:`<span>${icon('book')}</span>Sách Tiếng Anh 1`});button.dataset.view='book';button.setAttribute('aria-label','Sách Tiếng Anh 1');nav.querySelector('[data-view="topics"]')?.after(button);});
  const previousNavigate=navigate;
  navigate=function(v,...args){PLAYER?.leave();stopSpeech();if(v==='book'){clearTimeout(wrongResetTimer);reviewToken++;view='book';setNav('book');document.getElementById('crumb').textContent='Sách Tiếng Anh 1';hub();return;}return previousNavigate(v,...args);};
  const previousHome=homeHTML;
  homeHTML=function(...args){const html=previousHome(...args);return `<div style="margin-bottom:22px;border-radius:22px;background:#EDE5FF;padding:16px 21px;display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap"><div><b style="color:#613CE7">📖 Sách Tiếng Anh 1 đã có trong Sunny English</b></div><button class="btn soft" data-view="book">Mở sách →</button></div>`+html;};
  document.addEventListener('click',event=>{
    const node=event.target.closest?.('[data-book-flash-step],[data-book-flash-index],[data-book-activity],[data-book-drawing],[data-book-question-step],[data-book-question-prev],[data-book-question-next],[data-book-check-one],[data-book-review-meanings],[data-book-open],[data-book-hub],[data-book-tab],[data-book-say],[data-book-stop],[data-book-read],[data-book-check],[data-book-choice],[data-book-reveal],[data-book-retry],[data-book-filter],[data-book-page],[data-book-page-step],[data-book-cell],[data-book-chain],[data-book-undo],[data-book-clear-drawing],[data-book-say-name],[data-book-challenge],[data-book-repeat-challenge],[data-book-memory],[data-book-recall-check],[data-book-export],[data-book-import]');
    if(!node||node.disabled)return;event.preventDefault();event.stopImmediatePropagation();

    if(node.hasAttribute('data-book-flash-step'))flashTo((state(entry.id).flashIndex||0)+Number(node.dataset.bookFlashStep));
    else if(node.hasAttribute('data-book-flash-index'))flashTo(Number(node.dataset.bookFlashIndex));
    else if(node.hasAttribute('data-book-question-step'))questionTo(Number(node.dataset.bookQuestionStep));
    else if(node.hasAttribute('data-book-question-prev'))questionTo((state(entry.id).practiceIndex||0)-1);
    else if(node.hasAttribute('data-book-question-next'))questionTo((state(entry.id).practiceIndex||0)+1);
    else if(node.hasAttribute('data-book-activity')){const qs=questions(entry),groups=[...new Set(qs.map(q=>q.group))];questionTo(qs.findIndex(q=>q.group===groups[Number(node.dataset.bookActivity)]));}
    else if(node.hasAttribute('data-book-drawing')){stopSpeech();practiceDrawing=true;renderPractice();}
    else if(node.hasAttribute('data-book-check-one'))checkOne();
    else if(node.hasAttribute('data-book-review-meanings')){state(entry.id).hideMeanings=!state(entry.id).hideMeanings;remember();flashTo(state(entry.id).flashIndex||0);}

    else if(node.hasAttribute('data-book-open'))open(node.dataset.bookOpen);
    else if(node.hasAttribute('data-book-hub')){remember(true);hub();}
    else if(node.hasAttribute('data-book-tab')){if(!entry)return;stopSpeech();tab=node.dataset.bookTab;state(entry.id).tab=tab;wsStart=null;remember();render();}
    else if(node.hasAttribute('data-book-say'))speak(node.dataset.bookSay,node);
    else if(node.hasAttribute('data-book-stop'))stopSpeech();
    else if(node.hasAttribute('data-book-read'))playLines(node.dataset.bookRead);
    else if(node.hasAttribute('data-book-check'))check();
    else if(node.hasAttribute('data-book-choice')){answer(node.dataset.bookChoice,node.dataset.bookValue);node.parentElement.querySelectorAll('[data-book-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===node)));}
    else if(node.hasAttribute('data-book-reveal')){state(entry.id).revealed[node.dataset.bookReveal]=true;remember();paintChecks();}
    else if(node.hasAttribute('data-book-retry'))retry();
    else if(node.hasAttribute('data-book-filter')){filter=node.dataset.bookFilter;hub();}
    else if(node.hasAttribute('data-book-page')){stopSpeech();sourcePage=Number(node.dataset.bookPage);render();}
    else if(node.hasAttribute('data-book-page-step')){stopSpeech();sourcePage=Math.max(1,Math.min(77,sourcePage+Number(node.dataset.bookPageStep)));render();}
    else if(node.hasAttribute('data-book-cell'))cellClick(node.dataset.bookCell);
    else if(node.hasAttribute('data-book-chain'))cellClick(node.dataset.bookChain,true);
    else if(node.hasAttribute('data-book-undo')){state(entry.id).drawing.pop();drawCanvas();remember();}
    else if(node.hasAttribute('data-book-clear-drawing')){state(entry.id).drawing=[];drawCanvas();remember();}
    else if(node.hasAttribute('data-book-say-name'))speak("Hi, I'm "+(state(entry.id).name||'Bill')+'.',node);
    else if(node.hasAttribute('data-book-challenge')){const pool=entry.prompts.concat(wordsFor(entry).map(w=>w.en));const prompt=pool[Math.floor(Math.random()*pool.length)];state(entry.id).challenge=prompt;content.querySelector('[data-book-game-prompt]').textContent=prompt;speak(prompt,node);}
    else if(node.hasAttribute('data-book-repeat-challenge')){if(state(entry.id).challenge)speak(state(entry.id).challenge,node);else toast('Lấy thử thách trước nhé.');}
    else if(node.hasAttribute('data-book-memory')){stopSpeech();memoryHidden=!memoryHidden;content.querySelector('[data-book-memory-grid]').classList.toggle('bk-memory-hide',memoryHidden);content.querySelectorAll('[data-book-memory-grid] button').forEach(b=>b.disabled=memoryHidden);node.textContent=memoryHidden?'Hiện hình trở lại':'Ẩn hình để nhớ';content.querySelector('[data-book-recall]').hidden=!memoryHidden;}
    else if(node.hasAttribute('data-book-recall-check')){const values=content.querySelector('[data-book-recall-input]').value.split(',').map(normal);const expected=wordsFor(entry).map(w=>normal(w.en)),right=[...new Set(values.filter(v=>expected.includes(v)))];content.querySelector('[data-book-recall-result]').textContent=`Con nhớ đúng ${right.length} / ${expected.length} từ: ${right.join(', ')||'chưa có từ đúng'}.`;}
    else if(node.hasAttribute('data-book-export'))exportWork();
    else if(node.hasAttribute('data-book-import'))content.querySelector('[data-book-import-file]').click();
  },true);
  document.addEventListener('input',event=>{
    const node=event.target;if(node.hasAttribute('data-book-answer')&&entry)answer(node.dataset.bookAnswer,node.value);
    else if(node.hasAttribute('data-book-name')&&entry){state(entry.id).name=node.value;remember();}
    else if(node.hasAttribute('data-book-search')){search=node.value;content.querySelector('[data-book-hub-list]').innerHTML=hubList();}
    else if(node.hasAttribute('data-book-glossary-search')){const matches=BOOK.glossary.filter(w=>normal(w.en+' '+w.vi).includes(normal(node.value)));content.querySelector('[data-book-glossary-list]').innerHTML=glossaryRows(matches);content.querySelector('[data-book-glossary-status]').textContent=matches.length+' từ tìm thấy';}
    else if(node.hasAttribute('data-book-pen-color')&&entry){state(entry.id).penColor=node.value;remember();}
  });
  document.addEventListener('change',event=>{const node=event.target;if(node.hasAttribute('data-book-speed')){stopSpeech();speed=Number(node.value);bookState().speed=speed;remember();}else if(node.hasAttribute('data-book-entry-select'))open(node.value);else if(node.hasAttribute('data-book-page-select')){stopSpeech();sourcePage=Number(node.value);render();}else if(node.hasAttribute('data-book-import-file'))importWork(node.files?.[0]);});
  document.addEventListener('keydown',event=>{
    if(view!=='book')return;
    if(event.target.matches('[data-book-tab]')&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const buttons=Array.from(content.querySelectorAll('[role=tab]')),i=buttons.indexOf(event.target),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();content.querySelector(`[data-book-tab="${buttons[next].dataset.bookTab}"]`)?.focus();}
    if(event.key==='Enter'&&event.target.hasAttribute('data-book-answer')){event.preventDefault();checkOne();}
  });

  let swipeStart=null;
  content.addEventListener('pointerdown',e=>{if(e.target.closest('[data-book-flashcard]'))swipeStart={x:e.clientX,y:e.clientY,id:e.pointerId};});
  content.addEventListener('pointerup',e=>{if(!swipeStart)return;const d=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(tab==='words'&&entry&&Math.abs(d)>60&&Math.abs(d)>Math.abs(dy)*1.5)flashTo((state(entry.id).flashIndex||0)+(d<0?1:-1));});
  document.addEventListener('keydown',e=>{if(view==='book'&&entry&&tab==='words'&&entry.kind!=='glossary'&&!e.target.matches('input,select,textarea,[data-book-tab]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();flashTo((state(entry.id).flashIndex||0)+(e.key==='ArrowRight'?1:-1));}});
  window.addEventListener('pagehide',()=>{stopSpeech();if(data.book)remember(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&view==='book')stopSpeech();});
  window.__sunnyBook={version:26,open,hub,questions:id=>questions(BOOK.entries.find(e=>e.id===id)),state:()=>({entry:entry?.id||null,tab,scene:PLAYER?.debug(),saved:data.book,voice:deviceVoice()?.name||null})};
  document.documentElement.dataset.sunnyVersion='26';if(window.__sunnyV19)window.__sunnyV19.version=26;
  if(view==='home')content.innerHTML=homeHTML();
})();
