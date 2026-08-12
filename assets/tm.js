/* Transition Matters — web edition
   Shared page behaviour: reading progress, scroll reveals, chapter rail.
   No dependencies. Everything degrades to a readable static page. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reading progress ------------------------------------------------ */
  var bar = document.querySelector('.progress__bar');
  if (bar) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, p)) + '%';
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ---- scroll reveals -------------------------------------------------- */
  var targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduced) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---- runway stroke length (so the dash animation is exact) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.runway .filled'), function (p) {
    try {
      var len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--len', len);
    } catch (err) { /* older engines: dash just snaps in */ }
  });

  /* ---- chapter rail ---------------------------------------------------- */
  var links = document.querySelectorAll('.rail a');
  if (links.length && 'IntersectionObserver' in window) {
    var sections = [];
    Array.prototype.forEach.call(links, function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) sections.push({ a: a, sec: sec });
    });

    var setActive = function (a) {
      Array.prototype.forEach.call(links, function (l) { l.classList.toggle('is-active', l === a); });
    };

    var railIO = new IntersectionObserver(function (entries) {
      // pick the entry closest to the top of the viewport that is visible
      var best = null;
      sections.forEach(function (s) {
        var r = s.sec.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.45) {
          if (!best || r.top > best.top) best = { top: r.top, a: s.a };
        }
      });
      if (best) setActive(best.a);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.5, 1] });

    sections.forEach(function (s) { railIO.observe(s.sec); });

    // also recompute on scroll — cheap, and keeps the rail honest on fast flicks
    var raf = null;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var best = null;
        sections.forEach(function (s) {
          var r = s.sec.getBoundingClientRect();
          if (r.top <= window.innerHeight * 0.45) {
            if (!best || r.top > best.top) best = { top: r.top, a: s.a };
          }
        });
        if (best) setActive(best.a);
      });
    }, { passive: true });
  }

  /* ---- keep the fixed rail legible over dark bands --------------------- */
  var rail = document.querySelector('.rail');
  if (rail) {
    /* Sample the actual painted background just to the right of the rail and
       decide from its luminance. Works for any stylesheet without needing to
       know which sections happen to be dark. */
    var opaqueBgOf = function (el) {
      while (el && el !== document.documentElement) {
        var bg = getComputedStyle(el).backgroundColor;
        var m = bg && bg.match(/rgba?\(([^)]+)\)/);
        if (m) {
          var p = m[1].split(',').map(parseFloat);
          if (p.length < 4 || p[3] > 0.5) return p;
        }
        el = el.parentElement;
      }
      return null;
    };

    var railRaf = null;
    var checkRail = function () {
      var box = rail.getBoundingClientRect();
      var x = Math.min(box.right + 40, window.innerWidth - 2);
      var y = window.innerHeight / 2;
      var hit = document.elementFromPoint(x, y);
      var rgb = hit ? opaqueBgOf(hit) : null;
      if (!rgb) { rail.classList.remove('on-dark'); return; }
      var lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
      rail.classList.toggle('on-dark', lum < 0.5);
    };
    window.addEventListener('scroll', function () {
      if (railRaf) return;
      railRaf = requestAnimationFrame(function () { railRaf = null; checkRail(); });
    }, { passive: true });
    window.addEventListener('resize', checkRail);
    checkRail();
  }

  /* ---- segmented controls: aria-pressed group behaviour ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-seg]'), function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn || !group.contains(btn)) return;
      Array.prototype.forEach.call(group.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      group.dispatchEvent(new CustomEvent('seg:change', {
        bubbles: true,
        detail: { value: btn.getAttribute('data-value') }
      }));
    });
  });

  /* helper other scripts use to read a segmented group's value */
  window.segValue = function (sel) {
    var on = document.querySelector(sel + ' button[aria-pressed="true"]');
    return on ? on.getAttribute('data-value') : null;
  };
})();
