(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var header = document.getElementById('top-head');
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('global-nav');
    var gotop = document.getElementById('gotop');
    var titles = Array.prototype.slice.call(
      document.querySelectorAll('article h1, h1.title, h1.seo_h1')
    );
    if (!header || !toggle || !nav) return;

    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-label', 'めにゅうを開く');

    function openClose() {
      header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', header.classList.contains('open') ? 'true' : 'false');
    }

    toggle.addEventListener('click', openClose);
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openClose();
      }
    });

    nav.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'A') header.classList.remove('open');
    });

    function syncFixed() {
      var y = window.scrollY || window.pageYOffset || 0;
      var headerProgress = Math.max(0, Math.min(1, (y - 220) / 180));
      var titleProgress = Math.max(0, Math.min(1, (y - 40) / 140));

      header.style.setProperty('--header-progress', headerProgress.toFixed(3));
      titles.forEach(function (node) {
        node.style.setProperty('--h1-progress', titleProgress.toFixed(3));
        if (titleProgress > 0.5) {
          node.classList.add('scrolled-title');
        } else {
          node.classList.remove('scrolled-title');
        }
      });

      if (headerProgress > 0.5) {
        header.classList.add('fixed');
      } else {
        header.classList.remove('fixed');
      }
      if (gotop) {
        gotop.style.display = y > 500 ? 'block' : 'none';
      }
    }

    window.addEventListener('scroll', syncFixed, { passive: true });
    syncFixed();

    function resolveAnchor(href) {
      if (href === '#sys-title-wrapper') {
        return document.querySelector('.sys-title-wrapper');
      }
      return document.querySelector(href);
    }

    function scrollToAnchor(href) {
      var target = resolveAnchor(href);
      if (!target) return false;
      var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
      var scrollTop = targetTop;
      if (href === '#sys-title-wrapper') {
        scrollTop = targetTop;
      }
      window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
      header.classList.remove('open');
      return true;
    }

    document.addEventListener('click', function (e) {
      var anchor = e.target.closest && e.target.closest('a[href^="#"]');
      if (!anchor) return;
      var href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      scrollToAnchor(href);
    });

    if (window.location.hash) {
      window.setTimeout(function () {
        scrollToAnchor(window.location.hash);
      }, 0);
    }

    /* メニュー外クリックで閉じる */
    document.addEventListener('click', function (e) {
      if (!header.classList.contains('open')) return;
      if (toggle.contains(e.target)) return;
      if (nav.contains(e.target)) return;
      header.classList.remove('open');
    });
  });
})();
