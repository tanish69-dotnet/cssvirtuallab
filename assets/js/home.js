/**
 * Homepage behaviour — additive only.
 * The hero panel performs the real Diffie-Hellman computation with BigInt,
 * so the numbers on screen are produced by the same maths as the lab.
 */
(function () {
  'use strict';

  /* --- Mobile navigation ------------------------------------------------ */
  var toggle = document.querySelector('.site-nav__toggle');
  var links = document.querySelector('.site-nav__links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Real modular exponentiation (same algorithm as the lab) --------- */
  function powerMod(base, exp, mod) {
    var b = BigInt(base) % BigInt(mod);
    var e = BigInt(exp);
    var m = BigInt(mod);
    var res = 1n;
    while (e > 0n) {
      if (e & 1n) res = (res * b) % m;
      b = (b * b) % m;
      e >>= 1n;
    }
    return res;
  }

  var P = 23n;
  var G = 5n;
  var a = 6n;
  var b = 15n;

  var x = powerMod(G, a, P);
  var y = powerMod(G, b, P);
  var ka = powerMod(y, a, P);
  var kb = powerMod(x, b, P);

  var fields = {
    'hx-a': a.toString(),
    'hx-b': b.toString(),
    'hx-x': x.toString(),
    'hx-y': y.toString(),
    'hx-recv-y': y.toString(),
    'hx-recv-x': x.toString(),
    'hx-k': ka.toString()
  };

  Object.keys(fields).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = fields[id];
  });

  var agreeNote = document.getElementById('hx-agree');
  if (agreeNote) {
    agreeNote.textContent = ka === kb
      ? 'k\u2090 = k\u1d47 — both parties hold the same secret.'
      : '';
  }

  /* --- One-shot packet animation across the wire ----------------------- */
  var wire = document.querySelector('.wire');
  var replay = document.getElementById('hx-replay');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function runExchange() {
    if (!wire) return;
    wire.classList.remove('is-running');
    // Force a reflow so the animation restarts on replay.
    void wire.offsetWidth;
    if (!reduceMotion.matches) wire.classList.add('is-running');
  }

  if (wire) {
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      var seen = false;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !seen) {
            seen = true;
            runExchange();
            observer.disconnect();
          }
        });
      }, { threshold: 0.4 });
      observer.observe(wire);
    }
  }

  if (replay) {
    replay.addEventListener('click', runExchange);
  }

  /* --- Gentle section entrances (progressive enhancement) -------------- */
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var targets = document.querySelectorAll('[data-reveal]');
    if (targets.length) {
      targets.forEach(function (el) { el.classList.add('will-reveal'); });

      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      targets.forEach(function (el) { revealObserver.observe(el); });
    }
  }
})();
