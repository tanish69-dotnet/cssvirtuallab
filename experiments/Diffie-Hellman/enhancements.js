/**
 * Progressive accessibility enhancements — additive only.
 * script.js owns all behaviour; this file never adds, removes or reorders
 * application logic. It only teaches the existing controls keyboard and
 * ARIA semantics that the div-based markup does not provide natively.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var sidebar = document.getElementById('sidebar-panel');
    var toggle = document.getElementById('btn-toggle-sidebar');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.resource-card'));
    var pills = Array.prototype.slice.call(document.querySelectorAll('.filter-pill'));

    /* --- Resource cards behave like buttons --------------------------- */
    function syncCard(card) {
      var locked = card.classList.contains('locked');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', locked ? '-1' : '0');
      if (locked) {
        card.setAttribute('aria-disabled', 'true');
        card.removeAttribute('aria-current');
      } else {
        card.removeAttribute('aria-disabled');
      }
      if (card.classList.contains('active')) {
        card.setAttribute('aria-current', 'true');
      } else {
        card.removeAttribute('aria-current');
      }
    }

    cards.forEach(function (card) {
      syncCard(card);

      card.addEventListener('keydown', function (event) {
        if (card.classList.contains('locked')) return;
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault();
          card.click();
        }
      });

      // Unlocking and activation are driven by class changes in script.js.
      new MutationObserver(function () { syncCard(card); })
        .observe(card, { attributes: true, attributeFilter: ['class'] });
    });

    /* --- Filter pills expose pressed state ---------------------------- */
    function syncPill(pill) {
      pill.setAttribute('aria-pressed', pill.classList.contains('active') ? 'true' : 'false');
    }

    pills.forEach(function (pill) {
      syncPill(pill);
      new MutationObserver(function () { syncPill(pill); })
        .observe(pill, { attributes: true, attributeFilter: ['class'] });
    });

    /* --- Sidebar toggle keeps aria-expanded in step ------------------- */
    if (sidebar && toggle) {
      // The narrow-screen stylesheet hides the module rail, but the existing
      // toggle in script.js flips between 'none' and 'flex'. Mirroring the
      // hidden state onto the inline style means the first tap opens the rail
      // instead of appearing to do nothing.
      var narrow = window.matchMedia('(max-width: 960px)');
      var wasNarrow = narrow.matches;

      var syncToggle = function () {
        var visible = window.getComputedStyle(sidebar).display !== 'none';
        toggle.setAttribute('aria-expanded', visible ? 'true' : 'false');
      };

      var normalizeSidebar = function () {
        var inline = sidebar.style.display;
        if (narrow.matches) {
          if (inline !== 'none') sidebar.style.display = 'none';
        } else if (inline === 'none' && wasNarrow) {
          sidebar.style.display = '';
        }
        wasNarrow = narrow.matches;
        syncToggle();
      };

      normalizeSidebar();

      new MutationObserver(syncToggle)
        .observe(sidebar, { attributes: true, attributeFilter: ['style'] });

      window.addEventListener('resize', normalizeSidebar);

      // Escape closes the drawer when it is an overlay (narrow screens).
      document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        if (window.getComputedStyle(sidebar).display !== 'none' && narrow.matches) {
          sidebar.style.display = 'none';
          toggle.focus();
        }
      });
    }
  });
})();
