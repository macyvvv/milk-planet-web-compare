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

    var navList = nav.querySelector('ul');
    if (navList && !navList.querySelector('.nav-submenu-toggle')) {
      var submenuItems = [
        ['MilkPlanet', 'https://milkplanet.thebase.in/'],
        ['CyBARplanet', 'https://milkplaneta.base.shop/'],
        ['Shandy Love', 'https://shandylove.base.shop/'],
        ['Melty Mousse ', 'https://meltymousse.base.shop/'],
        ['Bloody Sugar ', 'https://bloodysugar.base.shop/'],
        ['Royal♡Sugar ', 'https://milkhkt.base.shop/'],
        ['Tweeny Heart Cafe ', 'https://tweeny.base.shop/']
      ];
      var submenuHtml = submenuItems.map(function (item) {
        return '<li><a href="' + item[1] + '" target="_blank" rel="noopener noreferrer">' + item[0] + '</a></li>';
      }).join('');
      var submenuMarkup =
        '<li class="nav-submenu-item">' +
          '<button type="button" class="nav-submenu-toggle" aria-expanded="false">えんかく つうはん</button>' +
          '<ul class="nav-submenu">' + submenuHtml + '</ul>' +
        '</li>';
      var recruitLink = navList.querySelector('a[href*="recruit"]');
      var recruitItem = recruitLink && recruitLink.closest ? recruitLink.closest('li') : null;

      if (recruitItem) {
        recruitItem.insertAdjacentHTML('beforebegin', submenuMarkup);
      } else {
        navList.insertAdjacentHTML('beforeend', submenuMarkup);
      }
    }

    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-label', 'めにゅうを開く');

    function openClose() {
      var isOpen = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (window.siteAnalytics) {
        window.siteAnalytics.track('menu_toggle', {
          menu_state: isOpen ? 'open' : 'close',
          menu_id: 'global-nav'
        });
      }
    }

    toggle.addEventListener('click', openClose);
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openClose();
      }
    });

    nav.addEventListener('click', function (e) {
      var submenuToggle = e.target.closest && e.target.closest('.nav-submenu-toggle');
      if (submenuToggle) {
        e.preventDefault();
        var parent = submenuToggle.closest('.nav-submenu-item');
        var isOpen = parent && parent.classList.toggle('open');
        submenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        header.classList.add('open');
        return;
      }

      if (e.target && e.target.tagName === 'A') {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        var submenuItem = nav.querySelector('.nav-submenu-item.open');
        if (submenuItem) {
          submenuItem.classList.remove('open');
          var submenuButton = submenuItem.querySelector('.nav-submenu-toggle');
          if (submenuButton) submenuButton.setAttribute('aria-expanded', 'false');
        }
      }
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

    function normalizeAnchor(href) {
      if (!href) return '';
      var hashIndex = href.indexOf('#');
      return hashIndex >= 0 ? href.slice(hashIndex) : href;
    }

    function resolveAnchor(href) {
      var anchor = normalizeAnchor(href);
      if (anchor === '#sys-title-wrapper') {
        return document.getElementById('sys-title-wrapper') || document.querySelector('.sys-title-wrapper');
      }
      if (anchor.charAt(0) === '#') {
        return document.querySelector(anchor);
      }
      return null;
    }

    function scrollToAnchor(href) {
      var target = resolveAnchor(href);
      if (!target) return false;
      var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
      var scrollMarginTop = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      var scrollTop = targetTop - scrollMarginTop;
      scrollTop = Math.max(0, scrollTop);
      var beforeY = window.pageYOffset || window.scrollY || 0;
      window.scrollTo({ top: scrollTop, behavior: 'smooth' });
      // Fallback for environments where smooth scrolling is ignored.
      window.setTimeout(function () {
        var afterY = window.pageYOffset || window.scrollY || 0;
        if (Math.abs(afterY - beforeY) < 2) {
          window.scrollTo(0, scrollTop);
        }
      }, 220);
      header.classList.remove('open');
      return true;
    }

    document.addEventListener('click', function (e) {
      var anchor = e.target.closest && e.target.closest('a[href*="#"]');
      if (!anchor) return;
      var href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      if (href.indexOf('#') > 0 && href.charAt(0) !== '#') {
        return;
      }
      e.preventDefault();
      if (!scrollToAnchor(href)) {
        window.location.hash = normalizeAnchor(href);
      }
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
      var submenuItem = nav.querySelector('.nav-submenu-item.open');
      if (submenuItem) {
        submenuItem.classList.remove('open');
        var submenuButton = submenuItem.querySelector('.nav-submenu-toggle');
        if (submenuButton) submenuButton.setAttribute('aria-expanded', 'false');
      }
    });

    /* Escapeキーでメニュー（と開いているサブメニュー）を閉じ、トグルへフォーカスを戻す */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      if (!header.classList.contains('open')) return;
      header.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      var submenuItem = nav.querySelector('.nav-submenu-item.open');
      if (submenuItem) {
        submenuItem.classList.remove('open');
        var submenuButton = submenuItem.querySelector('.nav-submenu-toggle');
        if (submenuButton) submenuButton.setAttribute('aria-expanded', 'false');
      }
      toggle.focus();
    });
  });

  /* --- 店舗一覧アコーディオン（shop/index.html）: 遷移とトグルの責務分離 + ARIA同期 --- */
  ready(function () {
    var pullheadToggles = Array.prototype.slice.call(document.querySelectorAll('.pullhead-toggle'));
    if (!pullheadToggles.length) return;

    pullheadToggles.forEach(function (btn) {
      var pullhead = btn.closest('.pullhead');
      var pullbody = document.getElementById(btn.getAttribute('aria-controls'));
      if (!pullhead || !pullbody) return;

      var initiallyOpen = window.getComputedStyle(pullbody).display !== 'none';
      pullhead.classList.toggle('open', initiallyOpen);
      pullhead.classList.toggle('close', !initiallyOpen);
      btn.setAttribute('aria-expanded', initiallyOpen ? 'true' : 'false');
      pullbody.setAttribute('aria-hidden', initiallyOpen ? 'false' : 'true');

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !pullhead.classList.contains('open');

        if (window.jQuery) {
          window.jQuery(pullbody).stop(true, true).slideToggle('fast');
        } else {
          pullbody.style.display = willOpen ? 'block' : 'none';
        }

        pullhead.classList.toggle('open', willOpen);
        pullhead.classList.toggle('close', !willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        pullbody.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
      });
    });
  });

  /* --- Swiperカルーセル初期化（各店舗ページで共通） --- */
  ready(function () {
    var swiperContainer = document.querySelector('.swiper-container');
    if (!swiperContainer || typeof window.Swiper !== 'function') return;

    new window.Swiper('.swiper-container', {
      loop: true,
      speed: 600,
      slidesPerView: 1,
      spaceBetween: 0,
      direction: 'horizontal',
      effect: 'slide',
      autoplay: {
        delay: 5000,
        stopOnLast: false,
        disableOnInteraction: true
      },
      pagination: {
        el: '.swiper-pagination'
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    });
  });
})();
