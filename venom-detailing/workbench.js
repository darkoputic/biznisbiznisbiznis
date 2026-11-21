(() => {
  const modes={
    wash:{tool:'MLAZ VODE',gesture:'Pritisni i prevuci preko auta',title:'Prljavština je na površini.',reason:'Pranje uklanja naslage sa karoserije, felni i stakala. Redovna nega počinje čistim površinama.',steps:['Višeetapno ručno pranje','Felne, gume i potkrila','Enterijer i stakla'],context:'Ovde isprobavaš ispiranje eksterijera. Kompletan tretman uključuje i negu enterijera.',done:'Čist eksterijer je jedan deo pranja. Slede stakla, usisavanje i nega unutrašnjih površina.',images:['hero.png','car-dirty.png'],width:110},
    detail:{tool:'EKSTRAKTOR',gesture:'Vuci u potezima preko sedišta',title:'Čistoća ide ispod površine.',reason:'Dubinsko pranje izvlači rastvorenu nečistoću iz tkanine. Detailing obuhvata i šavove, tepihe, ventilaciju i skrivene pregrade.',steps:['Temeljno usisavanje','Dubinsko pranje sedišta i tepiha','Ventilacija, pregrade i završni detalji'],context:'Ovde isprobavaš izvlačenje nečistoće iz sedišta. Materijal i stanje određuju način čišćenja.',done:'Sedište je obrađeno u prikazu. U stvarnom radu slede sušenje i ostali delovi enterijera.',images:['interior-demo.png'],width:88},
    polish:{tool:'POLIRKA',gesture:'Pređi kružnim pokretima preko laka',title:'Čist lak nije uvek sjajan lak.',reason:'Poliranje obrađuje fine površinske tragove i vraća jasniju refleksiju. Obim korekcije zavisi od stanja laka.',steps:['Pranje i dekontaminacija laka','Mašinsko poliranje u više prelaza','Završna keramička zaštita'],context:'Ovde isprobavaš deo poliranja. Priprema laka prethodi obradi; zaštita se nanosi na kraju.',done:'Refleksija je jasnija u prikazu. Tretman se završava zaštitom pripremljenog laka.',images:['paint-demo.png'],width:100}
  };
  const surface=document.querySelector('#work-surface'),clean=document.querySelector('#work-clean'),dirty=document.querySelector('#work-dirty');
  const base=clean.getContext('2d'),ctx=dirty.getContext('2d',{willReadFrequently:true});
  const play=document.querySelector('#work-play'),reset=document.querySelector('#work-reset'),status=document.querySelector('#work-status');
  const loading=document.querySelector('#work-loading'),hint=document.querySelector('#work-hint'),cursor=surface.querySelector('.work-cursor');
  const progress=document.querySelector('#work-progress'),percent=document.querySelector('#work-percent');
  const tabs=[...document.querySelectorAll('[data-work]')];
  const sample=document.createElement('canvas');sample.width=64;sample.height=48;const sampleCtx=sample.getContext('2d',{willReadFrequently:true});
  const images=new Map();const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let mode='wash',ready=false,complete=false,token=0,frame=0,pointer=null,last=null,lastMeasure=0;
  function load(src){if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Image load failed'));image.src=src;}));return images.get(src);}
  function stop(){cancelAnimationFrame(frame);frame=0;play.textContent=complete?'Pusti ponovo':'Pusti demonstraciju';}
  function draw(target,img,sx=0,sw=img.naturalWidth,align=0.5){
    const sh=img.naturalHeight,scale=Math.max(840/sw,630/sh),cw=840/scale,ch=630/scale;
    target.drawImage(img,sx+(sw-cw)*align,(sh-ch)/2,cw,ch,0,0,840,630);
  }
  async function select(key){
    const version=++token;stop();mode=key;ready=false;complete=false;pointer=null;last=null;
    play.disabled=reset.disabled=true;loading.hidden=false;loading.textContent='Pripremamo prikaz…';hint.hidden=false;
    surface.dataset.tool=key;surface.classList.remove('working');cursor.hidden=true;progress.value=0;percent.value='0%';
    const data=modes[key];
    tabs.forEach(tab=>{const active=tab.dataset.work===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
    document.querySelector('#work-panel').setAttribute('aria-labelledby','work-tab-'+key);
    for(const [id,value] of Object.entries({'work-title':data.title,'work-reason':data.reason,'work-context':data.context,'work-tool':data.tool,'work-gesture':data.gesture}))document.getElementById(id).textContent=value;
    document.querySelector('#work-steps').replaceChildren(...data.steps.map((text,i)=>{const li=document.createElement('li');li.textContent=text;if(i===(key==='wash'?0:1))li.className='step-demo';return li;}));
    dirty.setAttribute('aria-label',`${data.tool}: ${data.gesture}. Za prikaz bez prevlačenja koristi dugme Pusti demonstraciju.`);
    status.textContent='Prevuci mišem ili prstom. Možeš i da pustiš automatski prikaz.';
    try{
      const assets=await Promise.all(data.images.map(load));if(version!==token)return;
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,840,630);base.clearRect(0,0,840,630);
      if(assets.length===2){draw(base,assets[0],0,assets[0].naturalWidth,1);draw(ctx,assets[1],0,assets[1].naturalWidth,1);}
      else{const half=assets[0].naturalWidth/2;draw(base,assets[0],half,half);draw(ctx,assets[0],0,half);}
      ready=true;loading.hidden=true;play.disabled=reset.disabled=false;play.textContent='Pusti demonstraciju';
    }catch{if(version!==token)return;loading.textContent='Prikaz nije učitan. Pokušaj ponovo.';reset.disabled=false;status.textContent='Opis usluge i cenovnik su dostupni ispod.';}
  }
  function measure(force=false){
    const now=performance.now();if(!force&&now-lastMeasure<150)return;lastMeasure=now;
    sampleCtx.clearRect(0,0,64,48);sampleCtx.drawImage(dirty,0,0,64,48);
    const pixels=sampleCtx.getImageData(0,0,64,48).data;let sum=0;
    for(let i=3;i<pixels.length;i+=4)sum+=255-pixels[i];
    const amount=Math.round(sum/(64*48*255)*100);progress.value=amount;percent.value=amount+'%';
    if(amount>=96){ctx.clearRect(0,0,840,630);finish();}
  }
  function finish(){complete=true;progress.value=100;percent.value='100%';hint.hidden=true;status.textContent=modes[mode].done;stop();surface.classList.remove('working');cursor.hidden=true;}
  function brush(point){
    if(!ready||complete)return;hint.hidden=true;
    ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1;ctx.lineWidth=modes[mode].width;ctx.lineCap=mode==='detail'?'square':'round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(last?.x??point.x,last?.y??point.y);ctx.lineTo(point.x,point.y);ctx.stroke();
    if(mode!=='detail'){ctx.beginPath();ctx.arc(point.x,point.y,modes[mode].width/2,0,Math.PI*2);ctx.fill();}
    ctx.restore();last=point;measure();
    cursor.hidden=false;cursor.style.left=(point.x/840*100)+'%';cursor.style.top=(point.y/630*100)+'%';
  }
  function point(event){const r=surface.getBoundingClientRect();return{x:(event.clientX-r.left)/r.width*840,y:(event.clientY-r.top)/r.height*630};}
  surface.addEventListener('pointerdown',event=>{if(!ready||!event.isPrimary||event.button!==0)return;stop();pointer=event.pointerId;surface.setPointerCapture(pointer);last=null;surface.classList.add('working');brush(point(event));});
  surface.addEventListener('pointermove',event=>{if(pointer===event.pointerId)brush(point(event));});
  function release(event){if(pointer!==event.pointerId)return;pointer=null;last=null;surface.classList.remove('working');cursor.hidden=true;measure(true);}
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>surface.addEventListener(name,release));
  play.addEventListener('click',async()=>{
    if(frame){stop();return;}
    if(complete){const selected=mode;await select(selected);if(mode!==selected||!ready)return;}
    if(!ready)return;
    if(motion.matches){ctx.clearRect(0,0,840,630);finish();return;}
    const started=performance.now();last=null;surface.classList.add('working');play.textContent='Zaustavi prikaz';
    function tick(now){
      const elapsed=Math.min(1,(now-started)/6500),sweep=elapsed*10,row=Math.min(9,Math.floor(sweep)),part=sweep-row;
      const x=(row%2?1-part:part)*840,y=30+row*64;
      brush({x,y});
      if(elapsed<1&&!complete)frame=requestAnimationFrame(tick);else{ctx.clearRect(0,0,840,630);finish();}
    }
    frame=requestAnimationFrame(tick);
  });
  reset.addEventListener('click',()=>select(mode));
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab.dataset.work));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%3;else if(event.key==='ArrowLeft')next=(index+2)%3;else if(event.key==='Home')next=0;else if(event.key==='End')next=2;else return;event.preventDefault();tabs[next].focus();select(tabs[next].dataset.work);});});
  window.addEventListener('pagehide',stop);
  motion.addEventListener('change',()=>{if(frame&&motion.matches){ctx.clearRect(0,0,840,630);finish();}});
  select('wash');
})();
