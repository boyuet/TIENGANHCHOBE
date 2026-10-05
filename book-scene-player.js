/* V26 interactive scene learning; reuses the app's single audio controller. */
(function scenePlayerModule(){
 'use strict';
 const SCENES=window.SUNNY_SCENES;
 if(!SCENES)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const soundIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M15 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
 let root=null,unit=null,saved=null,bridge=null,session=null;
 let timers=[];
 let fitFrame=0,visualIndex=0;
 const shape=(n,attrs='')=>{
   const [x,y,w,h]=n.box.map((v,i)=>v*(i%2===0?15.36:10.24));
   if(n.shape==='polygon')return `<polygon points="${n.points.map(([a,b])=>`${a*15.36},${b*10.24}`).join(' ')}" ${attrs}/>`;
   if(n.shape==='ellipse')return `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" ${attrs}/>`;
   return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" ${attrs}/>`;
 };
 const scene=e=>SCENES[e.id];
 function init(s){
   if(!s.scene||typeof s.scene!=='object'||Array.isArray(s.scene))s.scene={};
   const v=s.scene;
   if(!Array.isArray(v.visited))v.visited=[];
   if(!Array.isArray(v.mistakes))v.mistakes=[];
   v.best=Number(v.best)||0;
   if(typeof v.paused!=='boolean')v.paused=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
   if(typeof v.labels!=='boolean')v.labels=true;
   return v;
 }
 function words(e){
   return scene(e).nodes.map(n=>({...n,ipa:n.ipa||e.words.find(w=>w.en===(n.base||n.en))?.ipa||'',baseVi:n.base?e.words.find(w=>w.en===n.base)?.vi:''}));
 }
 function visual(e,text){
   const sc=scene(e);if(!sc)return '';
   const n=sc.nodes.find(n=>n.en===text||n.base===text);if(!n)return '';
   const [x,y,w,h]=n.thumbBox||n.box;
   const clip='bk-thumbnail-'+(++visualIndex);
   return `<span class="bk-word-visual bk-context-visual"><svg viewBox="${x*15.36} ${y*10.24} ${w*15.36} ${h*10.24}" role="img" aria-label="${esc(n.vi)}"><defs><clipPath id="${clip}"><rect x="${x*15.36}" y="${y*10.24}" width="${w*15.36}" height="${h*10.24}"/></clipPath></defs><image href="${sc.image}" width="1536" height="1024" clip-path="url(#${clip})"/></svg></span>`;
 }
 function ambient(kind){
   if(kind==='water')return '<div class="bk-ambient bk-water-rings" aria-hidden="true"><i></i><i></i><i></i></div>';
   if(kind==='steam')return '<div class="bk-ambient bk-steam" aria-hidden="true"><i></i><i></i><i></i></div>';
   if(kind==='bubbles')return '<div class="bk-ambient bk-bubbles" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
   if(kind==='breeze')return `<div class="bk-ambient bk-breeze" aria-hidden="true">${[0,1].map((n)=>`<svg viewBox="0 0 40 30" style="--i:${n}"><path d="M20 16C0 9 0 0 10 2c8 1 9 8 10 14C40 9 40 0 30 2c-8 1-9 8-10 14" fill="${n?'#FFC940':'#FCB1CE'}"/><path d="M20 12v13" stroke="#704536" stroke-width="2" stroke-linecap="round"/></svg>`).join('')}</div>`;
   return `<div class="bk-ambient bk-glints ${kind==='magic'?'bk-magic':''}" aria-hidden="true">${[0,1,2,3].map(n=>`<i style="--i:${n}"></i>`).join('')}</div>`;
 }
 function world(e,v){
   const sc=scene(e),nodes=sc.nodes;
   return `<div class="bk-world ${v.paused?'is-still':''} ${v.labels?'':'is-labels-hidden'}" data-scene-world>
     <svg class="bk-world-svg" viewBox="0 0 1536 1024" aria-label="Cảnh tương tác: ${esc(e.vi)}">
       <defs>${nodes.map(n=>`<clipPath id="bk-clip-${e.id}-${n.id}">${shape(n)}</clipPath>`).join('')}</defs>
       <image href="${sc.image}" width="1536" height="1024" data-scene-image/>
       ${nodes.map((n,i)=>`<g class="bk-living-object" style="transform-origin:${n.box[0]+n.box[2]/2}% ${n.box[1]+n.box[3]/2}%;--delay:-${i*.8}s;--breath:${n.box[2]*n.box[3]>1400?1:1.012}" data-scene-sprite="${n.id}"><image href="${sc.image}" width="1536" height="1024" clip-path="url(#bk-clip-${e.id}-${n.id})"/></g>`).join('')}
       ${nodes.map((n,i)=>shape(n,`class="bk-object-target" data-scene-hit="${n.id}" tabindex="0" role="button" aria-label="Nghe: ${esc(n.en)}" aria-pressed="false" data-scene-index="${i}"`)).join('')}
     </svg>
     <div class="bk-scene-stamp" data-scene-stamp aria-hidden="true" hidden>✓</div>
     ${ambient(sc.ambience)}
     <div class="bk-scene-labels">${nodes.map(n=>`<button class="bk-scene-label ${v.visited.includes(n.en)?'is-visited':''}" data-scene-hit="${n.id}" data-scene-label="${n.id}" style="left:${n.label[0]}%;top:${n.label[1]}%" aria-label="Nghe: ${esc(n.en)}"><span lang="en">${esc(n.en)}</span>${soundIcon}<i aria-hidden="true">${v.visited.includes(n.en)?'✓':''}</i></button>`).join('')}</div>
   </div>`;
 }

 function html(e,s){
   const v=init(s);
   return `<div class="bk-sceneflow" data-scene-flow>
     <div class="bk-scene-toolbar"><div class="bk-scene-modes" role="group" aria-label="Cách học"><button data-scene-mode="explore" aria-pressed="true">✦ Khám phá</button><button data-scene-mode="quiz" aria-pressed="false">${soundIcon}Nghe & tìm hình</button></div><div class="bk-scene-options"><button data-scene-label-toggle aria-pressed="${v.labels}" title="Ẩn hoặc hiện từ tiếng Anh">Aa <span>${v.labels?'Ẩn chữ':'Hiện chữ'}</span></button><button data-scene-motion aria-pressed="${!v.paused}" title="Bật hoặc tắt chuyển động"><span>${v.paused?'▶':'Ⅱ'}</span></button></div></div>
     <div class="bk-quiz-console" data-scene-console hidden></div>
     <div class="bk-scene-main">${world(e,v)}</div>
     <aside class="bk-scene-aside"><div class="bk-scene-message" data-scene-message aria-live="polite"></div><div data-scene-detail></div>
       <div class="bk-scene-progress"><div class="bk-row bk-between"><span aria-hidden="true">✦ ✦ ✦ ✦</span><b data-scene-count>${v.visited.length} / ${scene(e).nodes.length}</b><span data-scene-meter-text class="visually-hidden"></span></div><div class="bk-discovery-track"><span data-scene-meter></span></div><div class="bk-discovery-dots">${scene(e).nodes.map(n=>`<span data-scene-dot="${n.id}" title="${esc(n.en)}" class="${v.visited.includes(n.en)?'is-done':''}"></span>`).join('')}</div></div>
       <div class="bk-scene-next"><button class="btn" data-book-tab="words">Flashcard →</button><button class="bk-back" data-book-tab="practice">Bài tập →</button></div>
     </aside>
   </div>`;
 }
 function detail(){
   const current=session.selected&&words(unit).find(n=>n.id===session.selected);
   if(!current)return `<div class="bk-scene-welcome"><svg class="bk-star-mascot" viewBox="0 0 180 150" aria-hidden="true"><path d="m90 13 20 37 42 7-29 30 7 44-40-20-40 20 7-44-29-30 42-7Z" fill="#ffd34a" stroke="#f2ae20" stroke-width="4" stroke-linejoin="round"/><ellipse cx="74" cy="77" rx="5" ry="7" fill="#59326e"/><ellipse cx="106" cy="77" rx="5" ry="7" fill="#59326e"/><path d="M78 93q12 13 24 0" fill="none" stroke="#59326e" stroke-width="4" stroke-linecap="round"/><ellipse cx="63" cy="90" rx="8" ry="4" fill="#ff927d"/><ellipse cx="117" cy="90" rx="8" ry="4" fill="#ff927d"/><path d="m14 33 4 7 8 2-6 5 1 8-7-4-7 4 1-8-6-5 8-2Z" fill="#8b63e8"/><circle cx="162" cy="98" r="7" fill="#49c5b4"/></svg></div>`;
   return `<article class="bk-scene-word-detail"><h2 lang="en">${esc(current.en)}</h2>${current.ipa?`<div class="bk-ipa">${esc(current.ipa)}</div>`:''}<p>${esc(current.vi)}</p><button class="bk-listen" data-scene-repeat>${soundIcon}Nghe lại</button></article>`;
 }
 function quizConsole(){
   const current=session.selected&&words(unit).find(n=>n.id===session.selected);
   if(session.done)return `<div class="bk-scene-complete"><span class="bk-scene-complete-star" aria-hidden="true">★</span><div><h2>Giỏi lắm!</h2><b>${session.firstTry} / ${session.queue.length}</b></div><button class="btn" data-scene-restart>Chơi lại ↻</button><button class="bk-back" data-book-tab="words">Flashcard →</button></div>`;
   return `<div class="bk-quiz-title">${session.locked?`<article class="bk-scene-word-detail"><h2 lang="en">${esc(current.en)}</h2><p>${esc(current.vi)}</p></article>`:'<h2>Tìm hình đúng</h2>'}<span class="bk-quiz-feedback" data-scene-feedback aria-live="polite"></span></div>
     <div class="bk-quiz-progress"><b>${session.index+1} / ${session.queue.length}</b><div>${session.queue.map((n,i)=>`<i class="${i<session.index||i===session.index&&session.locked?'is-done':i===session.index?'is-current':''}" aria-hidden="true">★</i>`).join('')}</div></div>
     <div class="bk-quiz-controls"><button class="bk-scene-play" data-scene-listen aria-label="Nghe từ cần tìm">${soundIcon}<span>Nghe</span></button><button class="bk-scene-question-next" data-scene-next ${session.locked?'':'disabled'}>${session.index+1===session.queue.length?'Kết quả':'Tiếp theo'} →</button></div>`;
 }

 function paint(){
   if(!root)return;
   const v=init(saved),sc=scene(unit),quiz=session.mode==='quiz';
   root.classList.toggle('is-quiz-flow',quiz);
   root.querySelector('[data-scene-detail]').innerHTML=quiz?'':detail();
   root.querySelector('.bk-scene-aside').hidden=quiz;
   const console=root.querySelector('[data-scene-console]');console.hidden=!quiz;console.innerHTML=quiz?quizConsole():'';
   const stamp=root.querySelector('[data-scene-stamp]');stamp.hidden=!(quiz&&session.locked&&!session.done);
   if(!stamp.hidden){const n=sc.nodes.find(n=>n.id===session.selected);stamp.style.left=Math.min(94,n.box[0]+n.box[2]*.78)+'%';stamp.style.top=Math.max(6,n.box[1]+n.box[3]*.15)+'%';}

   root.querySelector('[data-scene-world]').classList.toggle('is-quiz',quiz);
   root.querySelector('[data-scene-world]').classList.toggle('is-still',v.paused);
   root.querySelector('[data-scene-world]').classList.toggle('is-labels-hidden',!v.labels);
   for(const n of sc.nodes){
     const active=session.selected===n.id;
     root.querySelectorAll(`[data-scene-hit="${n.id}"]`).forEach(el=>{
       el.classList.toggle('is-active',active);el.classList.toggle('is-visited',v.visited.includes(n.en));
       el.setAttribute('aria-pressed',String(active));
       el.setAttribute('aria-label',quiz&&!session.locked&&!session.done?'Chọn vật thứ '+(sc.nodes.indexOf(n)+1):'Nghe: '+n.en);
       if(el.hasAttribute('data-scene-label')){el.querySelector('i').textContent=v.visited.includes(n.en)?'✓':'';el.hidden=quiz?(!active&&!session.done):!v.labels;}
     });
     root.querySelector(`[data-scene-dot="${n.id}"]`).classList.toggle('is-done',v.visited.includes(n.en));
   }
   root.querySelectorAll('[data-scene-mode]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.sceneMode===session.mode)));
   const toggle=root.querySelector('[data-scene-label-toggle]');toggle.hidden=quiz;toggle.disabled=quiz;toggle.setAttribute('aria-pressed',String(v.labels));toggle.querySelector('span').textContent=v.labels?'Ẩn chữ':'Hiện chữ';
   const motion=root.querySelector('[data-scene-motion]');motion.setAttribute('aria-pressed',String(!v.paused));motion.querySelector('span').textContent=v.paused?'▶':'Ⅱ';
   root.querySelector('[data-scene-meter-text]').textContent=v.visited.length+' / '+sc.nodes.length;
   root.querySelector('[data-scene-count]').textContent=v.visited.length+' / '+sc.nodes.length;
   root.querySelector('[data-scene-meter]').style.width=(v.visited.length/sc.nodes.length*100)+'%';
   clampLabels();

 }
 function message(text,kind=''){
   const el=root?.querySelector('[data-scene-message]');if(el){el.textContent=text;el.className='bk-scene-message '+kind;}const feedback=root?.querySelector('[data-scene-feedback]');if(feedback){feedback.textContent=kind==='is-error'?'Thử lại nhé!':kind==='is-success'?'✓ Đúng rồi!':'';feedback.className='bk-quiz-feedback '+kind;}
 }
 function pop(id){
   const item=root?.querySelector(`[data-scene-sprite="${id}"]`);if(!item)return;
   item.classList.remove('is-popping');void item.getBoundingClientRect();item.classList.add('is-popping');
   timers.push(setTimeout(()=>item.classList.remove('is-popping'),750));
 }
 function visit(n){
   const v=init(saved);if(!v.visited.includes(n.en))v.visited.push(n.en);
   bridge.save();
 }
 function choose(id,button){
   const n=scene(unit).nodes.find(n=>n.id===id);if(!n)return;
   if(session.mode==='quiz'&&!session.done){
     if(session.locked)return;
     const expected=session.queue[session.index];
     if(id!==expected){
       bridge.stop();session.misses++;session.attempts++;
       const target=scene(unit).nodes.find(n=>n.id===expected);
       const v=init(saved);if(!v.mistakes.includes(target.en))v.mistakes.push(target.en);
       bridge.save();bridge.effect('wrong');
       root.querySelectorAll(`[data-scene-hit="${id}"]`).forEach(el=>{el.classList.remove('is-error');void el.getBoundingClientRect();el.classList.add('is-error');timers.push(setTimeout(()=>el.classList.remove('is-error'),650));});
       const sprite=root.querySelector('[data-scene-sprite="'+id+'"]');sprite.classList.remove('is-shaking');void sprite.getBoundingClientRect();sprite.classList.add('is-shaking');timers.push(setTimeout(()=>sprite.classList.remove('is-shaking'),650));
       message('Chưa đúng. Thử lại nhé!','is-error');return;
     }
     session.locked=true;
     if(session.attempts===0)session.firstTry++;
     bridge.effect('correct');
   }else message('');
   session.selected=id;visit(n);paint();pop(id);if(session.mode==='quiz')message('✓ Đúng rồi!','is-success');
   bridge.speak(n.en,button);
 }
 function shuffled(items){
   const values=[...items];for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}return values;
 }
 function startQuiz(){
   bridge.stop();session={mode:'quiz',selected:null,queue:shuffled(scene(unit).nodes.map(n=>n.id)),index:0,misses:0,attempts:0,firstTry:0,locked:false,done:false};
   paint();fit();scheduleFit();message('');listen();
 }
 function listen(){
   if(session.mode!=='quiz'||session.done)return;
   const n=scene(unit).nodes.find(n=>n.id===session.queue[session.index]);
   bridge.speak(n.en,root.querySelector('[data-scene-listen]'));
 }
 function next(){
   if(!session.locked||session.done)return;bridge.stop();
   if(session.index+1===session.queue.length){
     session.done=true;
     const v=init(saved);v.best=Math.max(v.best,session.firstTry);v.rounds=(Number(v.rounds)||0)+1;
     v.lastTest={firstTry:session.firstTry,total:session.queue.length,misses:session.misses,date:new Date().toISOString()};
     bridge.save();bridge.effect('finish');session.selected=null;paint();message('Lượt luyện đã được lưu.','is-success');return;
   }
   session.index++;session.selected=null;session.locked=false;session.attempts=0;paint();fit();scheduleFit();message('');listen();
 }
 function click(event){
   const node=event.target.closest?.('[data-scene-hit],[data-scene-mode],[data-scene-label-toggle],[data-scene-motion],[data-scene-listen],[data-scene-repeat],[data-scene-next],[data-scene-restart]');
   if(!node||node.disabled)return;
   event.preventDefault();event.stopImmediatePropagation();
   if(node.hasAttribute('data-scene-hit'))choose(node.dataset.sceneHit,node);
   else if(node.hasAttribute('data-scene-mode')){
     if(node.dataset.sceneMode==='quiz')startQuiz();
     else{bridge.stop();session={mode:'explore',selected:null};paint();fit();scheduleFit();message('');}
   }else if(node.hasAttribute('data-scene-label-toggle')){const v=init(saved);v.labels=!v.labels;paint();bridge.save();}
   else if(node.hasAttribute('data-scene-motion')){const v=init(saved);v.paused=!v.paused;paint();bridge.save();}
   else if(node.hasAttribute('data-scene-listen'))listen();
   else if(node.hasAttribute('data-scene-repeat')){const n=scene(unit).nodes.find(n=>n.id===session.selected);if(n)bridge.speak(n.en,node);}
   else if(node.hasAttribute('data-scene-next'))next();
   else if(node.hasAttribute('data-scene-restart'))startQuiz();
 }
 function keyboard(event){
   if(event.target.matches('.bk-object-target')&&['Enter',' '].includes(event.key)){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
 }
 function fit(){
   if(!root)return;
   const main=root.querySelector('.bk-scene-main'),world=root.querySelector('[data-scene-world]');
   if(window.innerWidth<=880||window.innerHeight<=540){main.style.maxWidth='none';clampLabels();return;}
   main.style.maxWidth='100%';
   for(let i=0;i<3;i++){
     const height=Math.min(window.visualViewport?.height||window.innerHeight,world.closest('#content')?.getBoundingClientRect().bottom||window.innerHeight);
     const foot=0;
     const scroll=world.closest('#content')?.scrollTop||0;
     const available=Math.max(240,height-world.getBoundingClientRect().top-scroll-foot-24);
     main.style.maxWidth=Math.floor(available*1.5)+'px';
   }
   clampLabels();
 }
 function clampLabels(){
   if(!root)return;const world=root.querySelector('[data-scene-world]'),w=world.clientWidth,h=world.clientHeight;
   for(const n of scene(unit).nodes){const label=root.querySelector('[data-scene-label="'+n.id+'"]');if(label.hidden)continue;const halfW=label.offsetWidth/2,halfH=label.offsetHeight/2;label.style.left=(Math.max(halfW+5,Math.min(w-halfW-5,w*n.label[0]/100))-halfW)+'px';label.style.top=(Math.max(halfH+5,Math.min(h-halfH-5,h*n.label[1]/100))-halfH)+'px';}
 }
 function scheduleFit(){cancelAnimationFrame(fitFrame);fitFrame=requestAnimationFrame(fit);}
 function leave(){
   timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(fitFrame);window.removeEventListener('resize',scheduleFit);
   if(root){root.removeEventListener('click',click,true);root.removeEventListener('keydown',keyboard);}
   root=null;unit=null;saved=null;bridge=null;session=null;
 }
 function mount(options){
   leave();root=options.root;if(!root)return;
   unit=options.unit;saved=options.saved;bridge=options.bridge;session={mode:'explore',selected:null};
   root.addEventListener('click',click,true);root.addEventListener('keydown',keyboard);window.addEventListener('resize',scheduleFit);paint();fit();scheduleFit();
 }
 window.SUNNY_SCENE_PLAYER={html,mount,leave,visual,words,debug:()=>session?{...session,queue:session.queue?[...session.queue]:undefined}:null};
})();
