(() => {
  const $ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;

  /* background + ink follow the section in view */
  const sections = $('section[data-bg]');
  const links = $('.links a');
  const spy = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      body.style.setProperty('--bg', e.target.dataset.bg);
      body.dataset.ink = e.target.dataset.ink;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { threshold: 0.55 });
  sections.forEach(s => spy.observe(s));

  /* reveal on scroll */
  const rv = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); countUp(e.target); }
  }), { threshold: 0.2 });
  $('.reveal').forEach(el => rv.observe(el));

  /* count-up stats */
  function countUp(root) {
    $('[data-count]', root).forEach(el => {
      const end = +el.dataset.count, plus = 'plus' in el.dataset, t0 = performance.now(), dur = 1400;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 && plus ? '+' : '');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* mobile menu */
  const burger = $('#burger')[0], menu = $('#menu')[0];
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    body.classList.toggle('menu', open);
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* language EN / ES */
  const langBtn = $('#lang')[0];
  let lang = 'en';
  try { lang = localStorage.getItem('lang') || ((navigator.language || '').startsWith('es') ? 'es' : 'en'); } catch (e) {}
  const setLang = l => {
    lang = l;
    document.documentElement.lang = l;
    $('[data-en]').forEach(el => { el.innerHTML = el.dataset[l]; });
    langBtn.textContent = l === 'en' ? 'ES' : 'EN';
    try { localStorage.setItem('lang', l); } catch (e) {}
  };
  langBtn.addEventListener('click', () => setLang(lang === 'en' ? 'es' : 'en'));
  setLang(lang);

  /* hero scroll: water + objects move */
  const par = $('[data-par]').map(el => ({ el, v: el.dataset.par.split(',').map(Number) }));
  const water = $('[data-water]')[0], mega = $('.mega')[0];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, tgt = 0;
  const apply = () => {
    cur += (tgt - cur) * 0.12;
    const p = Math.min(cur / (innerHeight * 0.9), 1.4);
    par.forEach(({ el, v }) => el.setAttribute('transform',
      `translate(${v[0] * p} ${v[1] * p}) rotate(${v[2] * p} ${v[3]} ${v[4]})`));
    water.setAttribute('transform', `translate(${(cur * 0.45) % 36} ${Math.min(cur * 0.05, 30)})`);
    mega.style.transform = `translateX(-50%) translateY(${-60 * Math.min(p, 1)}px)`;
    if (Math.abs(tgt - cur) > 0.5) requestAnimationFrame(apply);
  };
  if (!still) addEventListener('scroll', () => { tgt = scrollY; requestAnimationFrame(apply); }, { passive: true });

  /* build videos: play only while visible */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.4 });
  $('.vid video').forEach(v => vio.observe(v));

  /* lightbox */
  const lb = $('#lb')[0], lbImg = $('img', lb)[0];
  $('.g').forEach(g => g.addEventListener('click', () => { lbImg.src = g.dataset.full; lb.hidden = false; }));
  lb.addEventListener('click', () => { lb.hidden = true; });
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });

  /* form (front-end only: connect to Formspree / your backend) */
  const form = $('#form')[0];
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ['name', 'email'].forEach(n => {
      const f = form.elements[n];
      const bad = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) return;
    $('#ok')[0].hidden = false;
    form.reset();
  });
})();
