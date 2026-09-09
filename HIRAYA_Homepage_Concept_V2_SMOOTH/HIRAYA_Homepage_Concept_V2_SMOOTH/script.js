(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const loader = document.querySelector('.loader');
  if (hasGsap && !reduced) {
    const tl = gsap.timeline();
    tl.to('.loader-line span',{x:'0%',duration:.8,ease:'power2.out'})
      .from('.loader-mark',{y:12,opacity:0,duration:.55,ease:'power3.out'},0)
      .from('.loader-name,.loader-sub',{y:10,opacity:0,duration:.45,stagger:.08,ease:'power3.out'},.15)
      .to('.loader-inner',{y:-12,opacity:0,duration:.4,ease:'power2.in'},'+=.15')
      .to(loader,{yPercent:-100,duration:.85,ease:'power4.inOut'})
      .from('.hero-title .mask > span',{yPercent:115,duration:1.05,stagger:.12,ease:'power4.out'},'-=.38')
      .from('.hero-eyebrow,.hero-lede,.hero-actions',{y:18,opacity:0,duration:.65,stagger:.08,ease:'power3.out'},'-=.62')
      .from('.booking-bar',{y:40,opacity:0,duration:.7,ease:'power3.out'},'-=.25');
  } else if(loader) loader.style.display='none';

  // SOLARA-derived smooth-scroll integration.
  // Important: Lenis is driven by ONE frame source only. Driving it from both
  // requestAnimationFrame and GSAP's ticker creates input latency / over-smoothing.
  let lenis = null;
  if (!reduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.0,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0
    });

    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }


  // Recalculate scroll ranges after fonts/images settle so scrubbed scenes do not jump.
  window.addEventListener('load', () => {
    if (hasGsap) ScrollTrigger.refresh();
  }, { once: true });

  const header=document.querySelector('.site-header');
  const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>70);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  if(hasGsap && !reduced){
    gsap.to('.hero-media',{scale:1.11,yPercent:6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.sunset-bg',{scale:1.08,yPercent:4,ease:'none',scrollTrigger:{trigger:'.sunset-banner',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.to('.final-bg',{scale:1.08,yPercent:5,ease:'none',scrollTrigger:{trigger:'.final-cta',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.utils.toArray('.reveal-group').forEach(el=>gsap.from(el,{y:35,opacity:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%',once:true}}));
    gsap.utils.toArray('.reveal-image').forEach(el=>gsap.from(el,{clipPath:'inset(0 0 100% 0)',duration:1.05,ease:'power4.inOut',scrollTrigger:{trigger:el,start:'top 84%',once:true}}));
    gsap.from('.stay-card',{y:45,opacity:0,duration:.8,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:'.stay-swiper',start:'top 82%',once:true}});
    gsap.from('.exp-row',{x:20,opacity:0,duration:.6,stagger:.08,ease:'power3.out',scrollTrigger:{trigger:'.experience-list',start:'top 84%',once:true}});
  }

  const swiper = typeof Swiper !== 'undefined' ? new Swiper('.stay-swiper',{
    slidesPerView:1.08,spaceBetween:16,speed:850,grabCursor:true,
    breakpoints:{700:{slidesPerView:1.7,spaceBetween:20},1000:{slidesPerView:2.35,spaceBetween:24}},
    on:{progress(sw){const bar=document.querySelector('.swiper-progress span');if(bar){const base=1/sw.slides.length;bar.style.width=Math.min(100,(base+Math.max(0,sw.progress)*(1-base))*100)+'%'}}}
  }) : null;

  document.querySelectorAll('.exp-row').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.exp-row').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    document.querySelectorAll('.exp-photo').forEach(p=>p.classList.toggle('active',p.dataset.photo===btn.dataset.exp));
  }));

  if(!reduced) document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{const r=btn.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;btn.style.transform=`translate(${x*.07}px,${y*.10}px)`});
    btn.addEventListener('mouseleave',()=>btn.style.transform='translate(0,0)');
  });

  const menu=document.querySelector('.mobile-menu'),menuBtn=document.querySelector('.menu-toggle'),closeBtn=document.querySelector('.mobile-close');
  const setMenu=open=>{menu.classList.toggle('open',open);menu.setAttribute('aria-hidden',String(!open));menuBtn.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''};
  menuBtn?.addEventListener('click',()=>setMenu(true));closeBtn?.addEventListener('click',()=>setMenu(false));menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));

  const checkIn=document.querySelector('#checkIn'),checkOut=document.querySelector('#checkOut'),guests=document.querySelector('#guests');
  const preview=document.querySelector('#availability-preview'),dateSummary=document.querySelector('#dateSummary'),guestSummary=document.querySelector('#guestSummary');
  const today=new Date();today.setDate(today.getDate()+7);const out=new Date(today);out.setDate(out.getDate()+2);const iso=d=>d.toISOString().slice(0,10);checkIn.value=iso(today);checkOut.value=iso(out);checkIn.min=iso(new Date());checkOut.min=checkIn.value;
  function fmt(v){if(!v)return 'Choose dates';return new Intl.DateTimeFormat('en-PH',{month:'short',day:'numeric',year:'numeric'}).format(new Date(v+'T00:00:00'))}
  document.querySelector('#booking')?.addEventListener('submit',e=>{e.preventDefault();dateSummary.textContent=`${fmt(checkIn.value)} — ${fmt(checkOut.value)}`;guestSummary.textContent=guests.value;preview.classList.add('open');preview.setAttribute('aria-hidden','false');preview.scrollIntoView({behavior:reduced?'auto':'smooth'})});
  checkIn?.addEventListener('change',()=>{checkOut.min=checkIn.value;if(checkOut.value<=checkIn.value){const d=new Date(checkIn.value+'T00:00:00');d.setDate(d.getDate()+1);checkOut.value=iso(d)}});
  document.querySelector('.availability-close')?.addEventListener('click',()=>{preview.classList.remove('open');preview.setAttribute('aria-hidden','true');document.querySelector('#booking').scrollIntoView({behavior:reduced?'auto':'smooth'})});
})();
