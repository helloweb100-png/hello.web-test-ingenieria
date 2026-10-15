/* ==========================================================================
   TEST INGENIERIA Y SERVICIOS | app.js
   Dependencias (CDN, version fija): GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13.
   Si alguna falla, la pagina sigue siendo completa y legible (mejora progresiva).

   Indice
   01 Utilidades y configuracion   09 Proyectos (tarjetas apiladas)
   02 Loader                       10 Mantenimiento (acordeon)
   03 Scroll suave (Lenis)         11 Pruebas (recorrido horizontal)
   04 Navegacion y menu            12 Seguridad (imagen que se abre)
   05 Riel de energia              13 Proceso, galeria y visor
   06 Hero (intro + canvas red)    14 Respaldo, CTA (onda trifasica), footer
   07 Cinta y manifiesto           15 Formulario a WhatsApp
   08 Textos y revelados           16 Micro-interacciones
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- 01 UTILIDADES Y CONFIGURACION ---------- */
  // Formato wa.me: codigo de pais + 10 digitos. Si cambia, actualizar tambien los href del HTML.
  const WA_NUMBER = '525564905868';
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const irnd = (a, b) => Math.floor(rnd(a, b + 1));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const NS = 'http://www.w3.org/2000/svg';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const useMotion = hasGSAP && !reduce;
  let lenis = null;
  let menuOpen = false;
  let lightboxOpen = false;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }
  if (useMotion) root.classList.add('anim');

  const lockScroll = (lock) => {
    if (lenis) { lock ? lenis.stop() : lenis.start(); }
    else { document.body.style.overflow = lock ? 'hidden' : ''; }
  };
  const syncLock = () => lockScroll(menuOpen || lightboxOpen || document.body.classList.contains('is-loading'));

  let refreshT = 0;
  const refreshSoon = (ms = 120) => {
    if (!hasGSAP) return;
    clearTimeout(refreshT);
    refreshT = setTimeout(() => ScrollTrigger.refresh(), ms);
  };

  /* ---------- 03 SCROLL SUAVE (Lenis) ---------- */
  // Inercia lenta: la sensacion "motion slow" de todo el sitio nace de aqui.
  if (useMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.082, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.body.classList.add('is-loading');
  syncLock();

  /* ---------- 02 LOADER: "Energizando sistema" ---------- */
  function runLoader() {
    const loader = $('#loader');
    if (!loader) { document.body.classList.remove('is-loading'); syncLock(); return Promise.resolve(); }

    const ring = $('.ld-ring-fg', loader);
    const num = $('#ld-num');
    const msg = $('#ld-msg');
    const ticksG = $('.ld-ticks', loader);
    const N = 72;
    const ticks = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r1 = 94;
      const r2 = i % 6 === 0 ? 102 : 98;
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', (100 + Math.cos(a) * r1).toFixed(2));
      l.setAttribute('y1', (100 + Math.sin(a) * r1).toFixed(2));
      l.setAttribute('x2', (100 + Math.cos(a) * r2).toFixed(2));
      l.setAttribute('y2', (100 + Math.sin(a) * r2).toFixed(2));
      ticksG.appendChild(l);
      ticks.push(l);
    }
    const steps = [
      [0, 'Verificando aislamiento'],
      [22, 'Midiendo puesta a tierra'],
      [46, 'Inspeccionando con termografía'],
      [70, 'Cerrando interruptor'],
      [94, 'Sistema energizado']
    ];

    const minDelay = reduce ? 250 : 2400;
    let ready = false;
    Promise.all([
      new Promise((res) => (document.readyState === 'complete' ? res() : window.addEventListener('load', res, { once: true }))),
      (document.fonts && document.fonts.ready) || Promise.resolve(),
      wait(minDelay)
    ]).then(() => { ready = true; });
    // Red de seguridad: nunca bloquear al usuario mas de 7 s.
    setTimeout(() => { ready = true; }, 7000);

    return new Promise((resolve) => {
      const t0 = performance.now();
      let p = 0;
      let lastMsg = -1;
      let finished = false;

      const render = (v) => {
        ring.style.strokeDashoffset = String(100 - v);
        num.textContent = String(Math.round(v));
        const lit = Math.round((v / 100) * N);
        for (let i = 0; i < N; i++) ticks[i].classList.toggle('on', i < lit);
        let k = 0;
        steps.forEach((s, i) => { if (v >= s[0]) k = i; });
        if (k !== lastMsg) { lastMsg = k; msg.textContent = steps[k][1]; }
      };

      const finish = () => {
        if (finished) return;
        finished = true;
        render(100);
        loader.classList.add('is-lit');
        const stage = $('.ld-stage', loader);
        const logo = $('.ld-logo', loader);
        const flash = $('.ld-flash', loader);
        const doors = $$('.ld-door', loader);
        const EASE = 'cubic-bezier(.76,0,.24,1)';
        const opts = (d, delay) => ({ duration: d, delay, fill: 'forwards', easing: EASE });
        if (reduce) {
          loader.remove();
          document.body.classList.remove('is-loading');
          syncLock();
          resolve();
          return;
        }
        flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.22 }, { opacity: 0 }], { duration: 800, easing: 'ease-out' });
        stage.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.14)' }], opts(520, 300));
        logo.animate([{ opacity: 0.85 }, { opacity: 0 }], opts(420, 280));
        const a1 = doors[0].animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }], opts(1200, 620));
        doors[1].animate([{ transform: 'translateY(0)' }, { transform: 'translateY(101%)' }], opts(1200, 620));
        setTimeout(() => {
          document.body.classList.remove('is-loading');
          syncLock();
          resolve();              // el hero arranca mientras las puertas se abren
        }, 820);
        a1.finished.then(() => loader.remove()).catch(() => loader.remove());
      };

      const frame = (now) => {
        const el = now - t0;
        const target = ready ? 100 : (1 - Math.pow(1 - Math.min(el / minDelay, 1), 2.2)) * 88;
        p += (target - p) * (ready ? 0.16 : 0.1);
        if (ready && p > 99.4) { finish(); return; }
        render(p);
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }

  /* ---------- 04 NAVEGACION Y MENU ---------- */
  const nav = $('#nav');
  const burger = $('#burger');
  const menu = $('#menu');

  function setMenu(open) {
    if (!menu || !burger) return;
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (open && nav) nav.classList.remove('is-hidden');
    syncLock();
    if (open) { const first = $('a', menu); if (first) setTimeout(() => first.focus({ preventScroll: true }), 350); }
  }
  if (burger) burger.addEventListener('click', () => setMenu(!menuOpen));

  function scrollToEl(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.9, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    if (menuOpen) { setMenu(false); setTimeout(() => scrollToEl(target), 120); }
    else scrollToEl(target);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) setMenu(false);
  });

  // Estado de la barra al hacer scroll (sin escuchar 'scroll' directamente)
  function initNavState() {
    const topbar = $('.topbar i');
    if (hasGSAP) {
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: (self) => {
          const y = self.scroll();
          nav.classList.toggle('is-stuck', y > 24);
          if (!menuOpen) {
            if (y > 520 && self.direction === 1) nav.classList.add('is-hidden');
            else if (self.direction === -1 || y <= 520) nav.classList.remove('is-hidden');
          }
          if (topbar) topbar.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
        }
      });
    } else {
      const s = document.createElement('div');
      s.style.cssText = 'position:absolute;top:24px;left:0;width:1px;height:1px;pointer-events:none';
      document.body.prepend(s);
      new IntersectionObserver(([en]) => nav.classList.toggle('is-stuck', !en.isIntersecting)).observe(s);
    }
  }

  // Enlace activo: secuencial (seccion, enlace). Funciona igual con secciones fijadas por pin.
  function initActiveLinks() {
    if (!hasGSAP) return;
    const links = $$('.nav-links a');
    const setActive = (id) => links.forEach((a) => a.classList.toggle('is-active', !!id && a.getAttribute('href') === '#' + id));
    const seq = [
      ['nosotros', 'nosotros'], ['proyectos', 'proyectos'], ['mantenimiento', 'mantenimiento'],
      ['pruebas', 'pruebas'], ['seguridad', 'pruebas'], ['proceso', 'proceso'],
      ['campo', ''], ['respaldo', ''], ['preguntas', ''], ['contacto', 'contacto']
    ];
    seq.forEach(([secId, linkId], i) => {
      const sec = document.getElementById(secId);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'max',
        onEnter: () => setActive(linkId),
        onLeaveBack: () => setActive(i ? seq[i - 1][1] : '')
      });
    });
  }

  /* ---------- 05 RIEL DE ENERGIA ---------- */
  // El progreso del scroll "energiza" la pagina: el riel se llena y cada nodo se enciende al pasar su seccion.
  function initRail() {
    const rail = $('.rail');
    if (!rail || !hasGSAP) return;
    const fill = $('.rail-fill', rail);
    const head = $('.rail-head', rail);
    const items = $$('.rail-nodes li', rail).map((li) => {
      const a = $('a', li);
      const sec = document.getElementById(a.getAttribute('href').slice(1));
      // Disparador auxiliar: su "start" ya incluye el espacio de los pines anteriores
      const st = sec ? ScrollTrigger.create({ trigger: sec, start: 'top center' }) : null;
      return { li, a, st, pos: 0 };
    });
    let h = rail.clientHeight;
    const place = () => {
      h = rail.clientHeight;
      const max = ScrollTrigger.maxScroll(window) || 1;
      items.forEach((it) => {
        it.pos = it.st ? clamp(it.st.start / max, 0, 1) : 0;
        it.li.style.top = (it.pos * 100).toFixed(2) + '%';
      });
    };
    ScrollTrigger.addEventListener('refresh', place);
    place();
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const p = self.progress;
        fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
        head.style.transform = 'translateY(' + (p * h).toFixed(1) + 'px)';
        items.forEach((it) => it.a.classList.toggle('is-on', p + 0.002 >= it.pos));
      }
    });
  }

  /* ---------- 06 HERO ---------- */
  function heroIntro() {
    if (!useMotion) return;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    gsap.set('.hl-in', { yPercent: 118, opacity: 1 });
    tl.fromTo('[data-hero="1"]', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0)
      .to('.hl-in', { yPercent: 0, duration: 1.35, stagger: 0.14, ease: 'expo.out' }, 0.1)
      .fromTo('[data-hero="4"]', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0.55)
      .fromTo('[data-hero="5"]', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0.7)
      .set('[data-hero="6"]', { opacity: 1 }, 0.25)
      .fromTo('.hv-frame', { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.5, ease: 'expo.inOut' }, 0.25)
      .fromTo('.hv-frame img', { scale: 1.45 }, { scale: 1.08, duration: 2, ease: 'expo.out' }, 0.25)
      .fromTo('.hv-badge', { scale: 0.4, rotate: -120, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.4, ease: 'back.out(1.6)' }, 1.0)
      .fromTo('.nav', { yPercent: -140 }, { yPercent: 0, duration: 1.2, ease: 'expo.out' }, 0.3)
      .fromTo('.rail', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.8)
      .fromTo('.wa-float', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(2)' }, 1.4);
    return tl;
  }

  function initHeroScroll() {
    if (!useMotion) return;
    const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-copy', { yPercent: -9, ease: 'none', scrollTrigger: st });
    gsap.to('.hero-visual', { yPercent: -5, ease: 'none', scrollTrigger: st });
    gsap.to('.hero-canvas', { opacity: 0.15, ease: 'none', scrollTrigger: st });
    if (finePointer) {
      const hero = $('.hero');
      const qx = gsap.quickTo('.hv-badge', 'x', { duration: 0.9, ease: 'power3.out' });
      const qy = gsap.quickTo('.hv-badge', 'y', { duration: 0.9, ease: 'power3.out' });
      const fx = gsap.quickTo('.hv-frame', 'x', { duration: 1.2, ease: 'power3.out' });
      const fy = gsap.quickTo('.hv-frame', 'y', { duration: 1.2, ease: 'power3.out' });
      hero.addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        qx(nx * -34); qy(ny * -26); fx(nx * 12); fy(ny * 10);
      });
    }
  }

  // Red electrica ortogonal (estilo diagrama unifilar) con pulsos, arcos y particulas
  function initGridField() {
    const canvas = $('#grid-canvas');
    const hero = $('#inicio');
    const flashEl = $('.hero-flash');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const VOLT = '255,214,10';
    const BLUE = '92,125,255';
    let W = 0, H = 0, dpr = 1, cell = 60;
    let traces = [], nodes = [], pulses = [], dust = [], arcs = [];
    let raf = 0, last = 0, running = false, nextArc = 2.2;
    const mouse = { x: -999, y: -999 };

    const pointAt = (tr, s) => {
      s = clamp(s, 0, tr.len);
      let i = 1;
      while (i < tr.cum.length - 1 && tr.cum[i] < s) i++;
      const a = tr.pts[i - 1], b = tr.pts[i];
      const seg = tr.cum[i] - tr.cum[i - 1] || 1;
      const t = (s - tr.cum[i - 1]) / seg;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };

    function build() {
      traces = []; nodes = []; pulses = []; dust = []; arcs = [];
      const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
      const small = W < 760;
      const count = small ? 14 : clamp(Math.round((W * H) / (cell * cell) / 7), 22, 46);
      const seen = new Set();
      for (let i = 0; i < count; i++) {
        let cx = irnd(0, cols), cy = irnd(0, rows), horiz = Math.random() < 0.5;
        const pts = [{ x: cx * cell, y: cy * cell }];
        const segs = irnd(3, 6);
        for (let s = 0; s < segs; s++) {
          const len = irnd(2, 7) * (Math.random() < 0.5 ? -1 : 1);
          if (horiz) cx = clamp(cx + len, 0, cols); else cy = clamp(cy + len, 0, rows);
          const last = pts[pts.length - 1];
          if (cx * cell !== last.x || cy * cell !== last.y) pts.push({ x: cx * cell, y: cy * cell });
          horiz = !horiz;
        }
        if (pts.length < 3) continue;
        const cum = [0];
        for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
        traces.push({ pts, cum, len: cum[cum.length - 1], a: rnd(0.07, 0.15), next: rnd(0, 4) });
        pts.forEach((p) => {
          const key = p.x + ',' + p.y;
          if (!seen.has(key)) { seen.add(key); nodes.push({ x: p.x, y: p.y }); }
        });
      }
      const nd = small ? 28 : 64;
      for (let i = 0; i < nd; i++) dust.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.6, 1.8), vy: rnd(5, 16), vx: rnd(-3, 3), ph: rnd(0, 6.28), v: Math.random() < 0.3 });
    }

    function resize() {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = W < 760 ? 44 : 60;
      build();
      if (!running) draw();
    }

    function jag(a, b) {
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const n = Math.max(6, Math.round(d / 16));
      const nx = -(b.y - a.y) / d, ny = (b.x - a.x) / d;
      const pts = [{ x: a.x, y: a.y }];
      for (let i = 1; i < n; i++) {
        const t = i / n, env = Math.sin(t * Math.PI), off = (Math.random() - 0.5) * 2 * 20 * env;
        pts.push({ x: a.x + (b.x - a.x) * t + nx * off, y: a.y + (b.y - a.y) * t + ny * off });
      }
      pts.push({ x: b.x, y: b.y });
      return pts;
    }
    function spawnArc() {
      if (nodes.length < 2) return;
      const a = nodes[irnd(0, nodes.length - 1)];
      const c = nodes.filter((n) => { const d = Math.hypot(n.x - a.x, n.y - a.y); return d > 110 && d < 380; });
      if (!c.length) return;
      const b = c[irnd(0, c.length - 1)];
      arcs.push({ pts: jag(a, b), life: 0.24, t: 0 });
      if (flashEl && flashEl.animate && !reduce) flashEl.animate([{ opacity: 0 }, { opacity: 0.5, offset: 0.12 }, { opacity: 0 }], { duration: 480, easing: 'ease-out' });
    }

    function update(dt) {
      traces.forEach((tr) => {
        tr.next -= dt;
        if (tr.next <= 0) {
          pulses.push({ tr, s: 0, v: rnd(110, 250), tail: rnd(80, 170), c: Math.random() < 0.78 ? VOLT : BLUE });
          tr.next = rnd(1.6, 6);
        }
      });
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.s += p.v * dt;
        if (p.s - p.tail > p.tr.len) pulses.splice(i, 1);
      }
      nextArc -= dt;
      if (nextArc <= 0) { spawnArc(); nextArc = rnd(3, 6.5); }
      for (let i = arcs.length - 1; i >= 0; i--) { arcs[i].t += dt; if (arcs[i].t > arcs[i].life) arcs.splice(i, 1); }
      dust.forEach((d) => {
        d.y -= d.vy * dt; d.x += d.vx * dt; d.ph += dt * 2;
        if (d.y < -4) { d.y = H + 4; d.x = rnd(0, W); }
        if (d.x < -4) d.x = W + 4; else if (d.x > W + 4) d.x = -4;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // trazas
      traces.forEach((tr) => {
        ctx.strokeStyle = 'rgba(110,140,255,' + tr.a + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        tr.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
      });
      // nodos (se encienden cerca del cursor)
      nodes.forEach((n) => {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const k = d < 190 ? 1 - d / 190 : 0;
        ctx.fillStyle = k > 0 ? 'rgba(' + VOLT + ',' + (0.35 + k * 0.6).toFixed(2) + ')' : 'rgba(140,165,255,.34)';
        const s = 3 + k * 3;
        ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
      });
      ctx.globalCompositeOperation = 'lighter';
      // pulsos con cola
      pulses.forEach((p) => {
        let prev = pointAt(p.tr, p.s);
        const steps = 12;
        for (let k = 1; k <= steps; k++) {
          const s2 = p.s - (p.tail * k) / steps;
          if (s2 < 0) break;
          const pt = pointAt(p.tr, s2);
          const a = 1 - k / steps;
          ctx.strokeStyle = 'rgba(' + p.c + ',' + (a * 0.9).toFixed(3) + ')';
          ctx.lineWidth = 1 + a * 1.7;
          ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
          prev = pt;
        }
        if (p.s >= 0 && p.s <= p.tr.len) {
          const h = pointAt(p.tr, p.s);
          const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 15);
          g.addColorStop(0, 'rgba(255,255,255,.95)');
          g.addColorStop(0.25, 'rgba(' + p.c + ',.7)');
          g.addColorStop(1, 'rgba(' + p.c + ',0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(h.x, h.y, 15, 0, 6.2832); ctx.fill();
        }
      });
      // arcos electricos
      arcs.forEach((a) => {
        const f = (1 - a.t / a.life) * (Math.random() < 0.3 ? 0.35 : 1);
        const path = () => { ctx.beginPath(); a.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); };
        ctx.strokeStyle = 'rgba(' + BLUE + ',' + (0.35 * f).toFixed(3) + ')'; ctx.lineWidth = 7; path();
        ctx.strokeStyle = 'rgba(' + VOLT + ',' + (0.9 * f).toFixed(3) + ')'; ctx.lineWidth = 2.4; path();
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.95 * f).toFixed(3) + ')'; ctx.lineWidth = 1; path();
      });
      // particulas
      dust.forEach((d) => {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(d.ph));
        ctx.fillStyle = 'rgba(' + (d.v ? VOLT : '200,215,255') + ',' + (tw * 0.55).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill();
      });
      // luz del cursor
      if (mouse.x > -500) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
        g.addColorStop(0, 'rgba(' + BLUE + ',.20)'); g.addColorStop(1, 'rgba(' + BLUE + ',0)');
        ctx.fillStyle = g; ctx.fillRect(mouse.x - 240, mouse.y - 240, 480, 480);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      update(dt); draw();
    }
    const start = () => { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    hero.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()), { threshold: 0 }).observe(hero);
  }

  /* ---------- 07 CINTA Y MANIFIESTO ---------- */
  function initTicker() {
    const track = $('.ticker-track');
    if (!track || !track.getAnimations || reduce || !hasGSAP) return;
    const anim = track.getAnimations()[0];
    if (!anim) return;
    let vel = 0, rate = 1;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { vel = self.getVelocity(); } });
    gsap.ticker.add(() => {
      const target = 1 + clamp(Math.abs(vel) / 450, 0, 6);
      rate += (target - rate) * 0.07;
      anim.playbackRate = rate;
    });
  }

  function splitWords(el) {
    const frag = document.createDocumentFragment();
    const words = [];
    const walk = (node, key, target) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { target.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'w';
            s.textContent = tok;
            if (key) s.dataset.key = '1';
            target.appendChild(s);
            words.push(s);
          });
        } else if (n.nodeType === 1) {
          const c = n.cloneNode(false);
          target.appendChild(c);
          walk(n, key || n.tagName === 'MARK', c);
        }
      });
    };
    walk(el, false, frag);
    el.textContent = '';
    el.appendChild(frag);
    return words;
  }

  function initManifesto() {
    const man = $('#manifesto');
    if (!man || !useMotion) return;
    const words = splitWords(man);
    gsap.set(words, { opacity: 0.14 });
    gsap.to(words, {
      opacity: 1, ease: 'none', stagger: 0.12,
      color: (i, el) => (el.dataset.key ? '#FFD60A' : '#EAF0FF'),
      scrollTrigger: { trigger: man, start: 'top 82%', end: 'bottom 55%', scrub: 0.6 }
    });
  }

  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      const stat = el.closest('.stat');
      if (!useMotion) { stat && stat.classList.add('is-done'); return; }
      el.textContent = '0';
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(o, {
          v: target, duration: 2.2, ease: 'power2.out',
          onUpdate: () => { el.textContent = String(Math.round(o.v)); },
          onComplete: () => stat && stat.classList.add('is-done')
        })
      });
    });
  }

  /* ---------- 08 TEXTOS Y REVELADOS ---------- */
  function initReveals(scope) {
    if (!useMotion || !scope) return;
    // Titulares: palabra a palabra con mascara
    $$('.split', scope).forEach((h) => {
      const inners = [];
      const walk = (node) => {
        Array.from(node.childNodes).forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((tok) => {
              if (!tok) return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span'); w.className = 'sw';
              const i = document.createElement('span'); i.className = 'sw-i'; i.textContent = tok;
              w.appendChild(i); frag.appendChild(w); inners.push(i);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(h);
      gsap.set(inners, { yPercent: 115, opacity: 1 });
      ScrollTrigger.create({
        trigger: h, start: 'top 86%', once: true,
        onEnter: () => gsap.to(inners, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.055 })
      });
    });
    // Bloques generales
    $$('[data-reveal]', scope).forEach((el) => {
      gsap.set(el, { y: 36, opacity: 0 });
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' })
      });
    });
  }

  /* ---------- 09 PROYECTOS: tarjetas apiladas ---------- */
  function initProjects(mm) {
    if (!useMotion) return;
    $$('.pcard-media img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: img.closest('.pcard'), start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    mm.add('(min-width: 960px)', () => {
      const cards = $$('.pcard');
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.93, filter: 'brightness(.5)', ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 88%', end: 'top 24%', scrub: true }
        });
      });
    });
  }

  /* ---------- 10 MANTENIMIENTO: acordeon ---------- */
  function initAccordion() {
    $$('[data-acc]').forEach((acc) => {
      const items = $$('.acc-item', acc);
      items.forEach((item) => {
        const btn = $('.acc-btn', item);
        btn.addEventListener('click', () => {
          const wasOpen = item.classList.contains('is-open');
          items.forEach((i) => { i.classList.remove('is-open'); $('.acc-btn', i).setAttribute('aria-expanded', 'false'); });
          if (!wasOpen) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
          refreshSoon(850);
        });
      });
    });
  }

  /* ---------- 11 PRUEBAS: recorrido horizontal fijado ---------- */
  function initTests(mm) {
    if (!useMotion) return;
    mm.add('(min-width: 900px)', () => {
      const section = $('.tests');
      const track = $('.tests-track');
      const bar = $('.tests-progress i');
      if (!section || !track) return;
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => '+=' + dist(),
          pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => { if (bar) bar.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'; }
        }
      });
      $$('.test', track).forEach((t) => {
        const img = $('.test-media img:not(.test-inset)', t);
        if (!img) return;
        gsap.fromTo(img, { xPercent: -6 }, {
          xPercent: 6, ease: 'none',
          scrollTrigger: { trigger: t, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
        });
      });
    });
  }

  /* ---------- 12 SEGURIDAD: la imagen se abre a pantalla completa ---------- */
  function initSafe() {
    if (!useMotion) return;
    const sec = $('.safe');
    if (!sec) return;
    const small = window.innerWidth < 760;
    const from = small ? 'inset(24% 9% 24% 9% round 24px)' : 'inset(26% 31% 26% 31% round 28px)';
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sec, start: 'top top', end: '+=170%', pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true }
    });
    tl.fromTo('.safe-media', { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1 }, 0)
      .fromTo('.safe-media img', { scale: 1.35 }, { scale: 1, duration: 1 }, 0)
      .to('.safe-w--l', { xPercent: -130, opacity: 0, duration: 1 }, 0)
      .to('.safe-w--r', { xPercent: 130, opacity: 0, duration: 1 }, 0)
      .to('.safe-shade', { opacity: 1, duration: 0.5 }, 0.55)
      .fromTo('.safe-copy', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.45 }, 0.7);
  }

  /* ---------- 13 PROCESO, GALERIA Y VISOR ---------- */
  function initProcess() {
    const steps = $('#steps');
    if (!steps) return;
    const list = $$('.step', steps);
    if (!hasGSAP) { list.forEach((s) => s.classList.add('is-on')); return; }
    const setLine = () => {
      const first = $('.step-node', list[0]);
      const last = $('.step-node', list[list.length - 1]);
      if (first && last) steps.style.setProperty('--line-h', (last.offsetTop - first.offsetTop) + 'px');
    };
    setLine();
    ScrollTrigger.addEventListener('refresh', setLine);
    ScrollTrigger.create({
      trigger: steps, start: 'top 70%', end: 'bottom 62%', scrub: true,
      onUpdate: (self) => steps.style.setProperty('--fill', self.progress.toFixed(4))
    });
    list.forEach((step) => {
      ScrollTrigger.create({
        trigger: step, start: 'top 66%',
        onEnter: () => step.classList.add('is-on'),
        onLeaveBack: () => step.classList.remove('is-on')
      });
    });
  }

  function initGallery(mm) {
    const items = $$('.gal-item');
    if (!items.length) return;
    items.forEach((it) => it.insertAdjacentHTML('beforeend', '<span class="gal-zoom" aria-hidden="true"><svg class="ico"><use href="#i-zoom"/></svg></span>'));

    if (useMotion) {
      // Revelado en cortina de cada imagen
      items.forEach((it) => {
        const img = $('img', it);
        gsap.set(it, { clipPath: 'inset(100% 0% 0% 0% round 24px)' });
        gsap.set(img, { scale: 1.25 });
        ScrollTrigger.create({
          trigger: it, start: 'top 92%', once: true,
          onEnter: () => {
            gsap.to(it, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'expo.out' });
            gsap.to(img, { scale: 1, duration: 1.8, ease: 'expo.out' });
          }
        });
      });
      // Parallax por columna
      mm.add('(min-width: 640px)', () => {
        $$('.gal-col').forEach((col) => {
          const s = parseFloat(col.dataset.speed || '0');
          gsap.fromTo(col, { y: () => s * window.innerHeight * 0.01 * 1.6 }, {
            y: () => -s * window.innerHeight * 0.01 * 1.6, ease: 'none',
            scrollTrigger: { trigger: '#gal', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
          });
        });
      });
    }

    // Visor
    const lb = $('#lb'), lbImg = $('#lb-img');
    let idx = 0, lastFocus = null;
    const setImg = (i, animate) => {
      idx = (i + items.length) % items.length;
      lbImg.src = items[idx].dataset.full;
      lbImg.alt = $('img', items[idx]).alt;
      if (animate && lbImg.animate) lbImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
    };
    const open = (i) => {
      lastFocus = document.activeElement;
      setImg(i, false);
      lb.hidden = false;
      lightboxOpen = true; syncLock();
      requestAnimationFrame(() => lb.classList.add('is-in'));
      $('.lb-x', lb).focus();
    };
    const close = () => {
      lb.classList.remove('is-in');
      lightboxOpen = false; syncLock();
      setTimeout(() => { lb.hidden = true; lbImg.removeAttribute('src'); }, 420);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    items.forEach((it, i) => it.addEventListener('click', () => open(i)));
    $('.lb-x', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => setImg(idx - 1, true));
    $('.lb-next', lb).addEventListener('click', () => setImg(idx + 1, true));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') setImg(idx - 1, true);
      else if (e.key === 'ArrowRight') setImg(idx + 1, true);
      else if (e.key === 'Tab') {
        const f = $$('button', lb);
        const first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- 14 RESPALDO, CTA (onda trifasica), FOOTER ---------- */
  function initTrust() {
    if (!useMotion) return;
    gsap.fromTo('.trust-bg img', { yPercent: -10 }, {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.trust', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    // El numero de registro se "decodifica" al aparecer
    const big = $('.trust-big b');
    if (big) {
      const final = big.textContent;
      ScrollTrigger.create({
        trigger: big, start: 'top 88%', once: true,
        onEnter: () => {
          const t0 = performance.now(), dur = 1500;
          const step = (now) => {
            const k = clamp((now - t0) / dur, 0, 1);
            const lock = Math.floor(k * final.length);
            let s = '';
            for (let i = 0; i < final.length; i++) s += i < lock ? final[i] : String(irnd(0, 9));
            big.textContent = k < 1 ? s : final;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      });
    }
  }

  // Tres fases desfasadas 120 grados: la senal de la ingenieria electrica trifasica
  function initWaves() {
    const canvas = $('#wave-canvas');
    if (!canvas || !canvas.getContext) return;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, raf = 0, running = false, t = 0, last = 0, mx = 0.5, mxS = 0.5;
    const waves = [
      { ph: 0, c: '255,214,10', a: 0.95, w: 2.6 },
      { ph: 2.0944, c: '92,125,255', a: 0.9, w: 2.3 },
      { ph: 4.1888, c: '234,240,255', a: 0.5, w: 1.6 }
    ];
    function resize() {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const cy = H * (W < 760 ? 0.86 : 0.55);
      const amp = Math.min(H * 0.15, 120) * (1 + 0.18 * Math.sin(t * 0.5));
      const freq = (Math.PI * 2) / (W * (W < 760 ? 0.7 : 0.42)) * (1 + (mxS - 0.5) * 0.35);
      // Los trazos nacen transparentes a la izquierda para no cruzar el texto
      const fade = (c, a) => {
        const g = ctx.createLinearGradient(0, 0, W, 0);
        const s0 = W < 760 ? 0 : 0.28;
        g.addColorStop(0, 'rgba(' + c + ',0)'); g.addColorStop(s0, 'rgba(' + c + ',0)'); g.addColorStop(Math.min(1, s0 + 0.3), 'rgba(' + c + ',' + a + ')'); g.addColorStop(1, 'rgba(' + c + ',' + a + ')');
        return g;
      };
      ctx.strokeStyle = fade('140,165,255', 0.16); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      waves.forEach((w) => {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const u = clamp((x / W - (W < 760 ? 0.0 : 0.32)) / (W < 760 ? 1 : 0.4), 0, 1);
          const env = 0.06 + 0.94 * (u * u * (3 - 2 * u));
          const y = cy + Math.sin(x * freq + t * 1.35 + w.ph) * amp * env;
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.shadowColor = 'rgba(' + w.c + ',.9)'; ctx.shadowBlur = 16;
        ctx.strokeStyle = fade(w.c, (w.a * 0.8).toFixed(2)); ctx.lineWidth = w.w;
        ctx.stroke();
      });
      ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    }
    function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now; t += dt; mxS += (mx - mxS) * 0.05;
      draw();
    }
    const start = () => { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    resize();
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    host.addEventListener('pointermove', (e) => { mx = e.clientX / window.innerWidth; });
    new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(host);
  }

  function initFooter() {
    if (!useMotion) return;
    gsap.fromTo('.footer-word', { yPercent: 35, opacity: 0 }, {
      yPercent: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true }
    });
  }

  /* ---------- 15 FORMULARIO A WHATSAPP ---------- */
  function initForm() {
    const form = $('#wa-form');
    if (!form) return;
    const fields = {
      nombre: { input: $('#f-name'), err: $('#e-name'), test: (v) => (v.trim().length >= 3 ? '' : 'Escribe tu nombre completo.') },
      telefono: { input: $('#f-phone'), err: $('#e-phone'), test: (v) => (v.replace(/\D/g, '').length >= 8 ? '' : 'Escribe un teléfono válido (mínimo 8 dígitos).') },
      servicio: { input: $('#f-service'), err: $('#e-service'), test: (v) => (v ? '' : 'Selecciona el servicio que necesitas.') }
    };
    const check = (f) => {
      const msg = f.test(f.input.value);
      f.err.textContent = msg;
      f.input.closest('.field').classList.toggle('is-bad', !!msg);
      f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    Object.values(fields).forEach((f) => {
      f.input.addEventListener('blur', () => check(f));
      f.input.addEventListener('input', () => { if (f.input.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      Object.values(fields).forEach((f) => { if (!check(f) && !firstBad) firstBad = f.input; });
      if (firstBad) { firstBad.focus(); return; }
      const v = (id) => ($(id).value || '').trim();
      const lines = [
        'Hola, soy ' + v('#f-name') + (v('#f-company') ? ' de ' + v('#f-company') : '') + '.',
        'Me interesa: ' + v('#f-service') + '.'
      ];
      if (v('#f-msg')) lines.push(v('#f-msg'));
      lines.push('Mi teléfono: ' + v('#f-phone'));
      lines.push('(Enviado desde el sitio web de TEST Ingeniería y Servicios)');
      const url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      const btn = $('#f-submit');
      btn.classList.add('is-busy');
      // Con 'noopener' window.open siempre devuelve null; por eso se anula el opener a mano
      const w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch (e) { /* sin acceso: no pasa nada */ } }
      else window.location.href = url;   // ventana bloqueada: abrir en la misma pestana
      $('#f-ok').hidden = false;
      setTimeout(() => { btn.classList.remove('is-busy'); form.reset(); }, 1200);
    });
  }

  /* ---------- 16 MICRO-INTERACCIONES ---------- */
  function initMicro() {
    // Resplandor que sigue al cursor en tarjetas
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest('.spot');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    // Botones magneticos (solo puntero fino)
    if (useMotion && finePointer) {
      $$('.magnetic').forEach((el) => {
        const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          qx((e.clientX - r.left - r.width / 2) * 0.22);
          qy((e.clientY - r.top - r.height / 2) * 0.28);
        });
        el.addEventListener('pointerleave', () => { qx(0); qy(0); });
      });
    }
    // Aviso del boton de WhatsApp
    const wa = $('.wa-float');
    if (wa) {
      setTimeout(() => { wa.classList.add('show-tip'); setTimeout(() => wa.classList.remove('show-tip'), 5200); }, 9000);
    }
  }

  /* ---------- ARRANQUE ---------- */
  function boot() {
    const mm = hasGSAP ? gsap.matchMedia() : null;
    const sec = (id) => document.getElementById(id) || document.querySelector(id);
    // IMPORTANTE: los ScrollTrigger se crean en el orden del documento para que
    // los espaciadores de los pines (Pruebas, Seguridad) calculen bien lo que sigue.
    initNavState();
    initHeroScroll();
    initGridField();
    initTicker();
    initManifesto(); initCounters(); initReveals(sec('nosotros'));
    initReveals(sec('proyectos')); initProjects(mm);
    initReveals(sec('mantenimiento')); initAccordion();
    initTests(mm);
    initSafe();
    initReveals(sec('proceso')); initProcess();
    initReveals(sec('campo')); initGallery(mm);
    initReveals(sec('respaldo')); initTrust();
    initReveals(sec('preguntas'));
    initReveals(sec('.cta-band')); initWaves();
    initReveals(sec('contacto')); initForm();
    initFooter();
    initMicro();
    // Dependientes de posiciones finales: al final
    initActiveLinks();
    initRail();
    if (hasGSAP) {
      window.addEventListener('load', () => ScrollTrigger.refresh());
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  try {
    boot();
  } catch (err) {
    // Si algo falla, el sitio debe seguir siendo legible
    console.error('[TEST] Error de inicializacion:', err);
    root.classList.remove('anim');
  }

  runLoader().then(() => {
    heroIntro();
    if (hasGSAP) ScrollTrigger.refresh();
  });
})();
