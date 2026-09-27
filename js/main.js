/* MAC Trening — interakcije i animacije */
(function () {
  'use strict';

  var doc = document.documentElement;
  var body = document.body;
  var reduce = doc.classList.contains('reduce-motion');
  var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Loader ---------- */
  function ready() {
    if (doc.classList.contains('ready')) return;
    doc.classList.add('loaded', 'ready');
    try { sessionStorage.setItem('mac-seen', '1'); } catch (e) {}
    setTimeout(function () { if (typeof onScroll === 'function') onScroll(); }, 900);
  }
  if (doc.classList.contains('skip-loader')) {
    ready();
  } else {
    var start = Date.now();
    var done = function () { setTimeout(ready, Math.max(0, 1250 - (Date.now() - start))); };
    if (document.readyState === 'complete') done(); else window.addEventListener('load', done);
    setTimeout(ready, 3200); // sigurnosni izlaz ako se nešto sporo učitava
  }

  /* ---------- Godina u podnožju ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Crtanje SVG ilustracija ---------- */
  document.querySelectorAll('.draw path, .draw circle, .draw ellipse').forEach(function (el) {
    el.setAttribute('pathLength', '1');
  });

  /* ---------- Mobilni izbornik ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  burger.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 960) setMenu(false); });

  /* ---------- Otkrivanje pri skrolanju ---------- */
  // Stagger unutar istog roditelja
  var groups = new Map();
  document.querySelectorAll('.reveal').forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    groups.set(p, i + 1);
    if (i) el.style.setProperty('--rd', Math.min(i * 0.08, 0.4) + 's');
  });

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Navigacija: stanje, sakrivanje, aktivni link ---------- */
  var nav = document.getElementById('nav');
  var bar = document.querySelector('.progress span');
  var dock = document.querySelector('.dock');
  var heroActions = document.querySelector('.hero-actions');
  var cta = document.getElementById('kontakt');
  var steps = document.querySelector('.step-list');
  var stepItems = document.querySelectorAll('.step');
  var parallax = document.querySelectorAll('[data-speed]');
  var links = document.querySelectorAll('.nav-links a');
  var sections = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });

  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var sy = window.scrollY;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;

    nav.classList.toggle('scrolled', sy > 20);
    if (!body.classList.contains('menu-open')) {
      nav.classList.toggle('hide', sy > lastY && sy > vh * 0.9);
    }
    lastY = sy;

    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? sy / max : 0) + ')';

    // Mobilni dock: prikaži kad hero gumbi nestanu, sakrij na završnom pozivu
    if (dock && heroActions && cta && doc.classList.contains('ready')) {
      var ha = heroActions.getBoundingClientRect();
      var heroCtaVisible = ha.bottom > 0 && ha.top < vh - 40;
      var atCta = cta.getBoundingClientRect().top < vh * 0.85;
      dock.classList.toggle('show', !heroCtaVisible && !atCta);
    }

    // Linija koraka
    if (steps) {
      var r = steps.getBoundingClientRect();
      var p = (vh * 0.7 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      steps.style.setProperty('--p', p.toFixed(3));
      stepItems.forEach(function (s, i) {
        s.classList.toggle('lit', p >= (i / stepItems.length) - 0.001 && p > 0.02);
      });
    }

    // Paralaksa
    if (!reduce) {
      parallax.forEach(function (el) {
        el.style.transform = 'translate3d(0,' + (sy * parseFloat(el.dataset.speed)).toFixed(1) + 'px,0)';
      });
    }

    // Aktivni link
    var current = -1;
    sections.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top < vh * 0.4) current = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });

    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.qa').forEach(function (qa) {
    var btn = qa.querySelector('.q');
    btn.addEventListener('click', function () {
      var open = !qa.classList.contains('open');
      document.querySelectorAll('.qa.open').forEach(function (o) {
        if (o !== qa) { o.classList.remove('open'); o.querySelector('.q').setAttribute('aria-expanded', 'false'); }
      });
      qa.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- Desktop efekti: reflektor, magnetni gumbi, nagib vizuala ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    var hero = document.querySelector('.hero');
    var visual = document.querySelector('.hero-visual');
    if (hero && visual) {
      visual.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1)';
      hero.addEventListener('pointermove', function (e) {
        var x = e.clientX / window.innerWidth - 0.5;
        var yy = e.clientY / window.innerHeight - 0.5;
        visual.style.transform = 'perspective(1200px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-yy * 5).toFixed(2) + 'deg)';
      });
      hero.addEventListener('pointerleave', function () { visual.style.transform = ''; });
    }
  }
})();
