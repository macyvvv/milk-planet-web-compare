(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initializeNavigation() {
    var header = document.getElementById('top-head');
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('global-nav');

    if (!header || !toggle || !nav || toggle.dataset.navigationInitialized === 'true') {
      return;
    }

    toggle.dataset.navigationInitialized = 'true';
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'global-nav');
    toggle.setAttribute('aria-label', 'めにゅうを開く');

    var systemMenuLink = nav.querySelector('a[href="#sys-title-wrapper"]');
    if (systemMenuLink) {
      systemMenuLink.textContent = 'しすてむ＆めにゅう';
    }

    var navList = nav.querySelector('ul');
    if (navList && !navList.querySelector('.nav-submenu-toggle')) {
      var submenuItems = [
        ['MilkPlanet', 'https://milkplanet.thebase.in/'],
        ['CyBARplanet', 'https://milkplaneta.base.shop/'],
        ['Shandy Love', 'https://shandylove.base.shop/'],
        ['Melty Mousse', 'https://meltymousse.base.shop/'],
        ['Bloody Sugar', 'https://bloodysugar.base.shop/'],
        ['Royal♡Sugar', 'https://milkhkt.base.shop/'],
        ['Tweeny Heart Cafe', 'https://tweeny.base.shop/']
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
      var recruitItem = recruitLink && recruitLink.closest('li');

      if (recruitItem) {
        recruitItem.insertAdjacentHTML('beforebegin', submenuMarkup);
      } else {
        navList.insertAdjacentHTML('beforeend', submenuMarkup);
      }
    }

    function setMenuOpen(isOpen, returnFocus) {
      header.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'めにゅうを閉じる' : 'めにゅうを開く');

      if (!isOpen) {
        var openedSubmenu = nav.querySelector('.nav-submenu-item.open');
        if (openedSubmenu) {
          openedSubmenu.classList.remove('open');
          var submenuButton = openedSubmenu.querySelector('.nav-submenu-toggle');
          if (submenuButton) submenuButton.setAttribute('aria-expanded', 'false');
        }
      }

      if (returnFocus) toggle.focus();
    }

    function toggleMenu() {
      var isOpen = !header.classList.contains('open');
      setMenuOpen(isOpen, false);

      if (window.siteAnalytics) {
        window.siteAnalytics.track('menu_toggle', {
          menu_state: isOpen ? 'open' : 'close',
          menu_id: 'global-nav'
        });
      }
    }

    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

    toggle.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        toggleMenu();
      }
    });

    nav.addEventListener('click', function (event) {
      var submenuToggle = event.target.closest('.nav-submenu-toggle');
      if (submenuToggle) {
        event.preventDefault();
        event.stopPropagation();
        var parent = submenuToggle.closest('.nav-submenu-item');
        var isOpen = parent ? !parent.classList.contains('open') : false;
        if (parent) parent.classList.toggle('open', isOpen);
        submenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        setMenuOpen(true, false);
        return;
      }

      var link = event.target.closest('a');
      if (link) setMenuOpen(false, false);
    });

    document.addEventListener('click', function (event) {
      if (!header.classList.contains('open')) return;
      if (header.contains(event.target)) return;
      setMenuOpen(false, false);
    });

    document.addEventListener('keydown', function (event) {
      if ((event.key === 'Escape' || event.key === 'Esc') && header.classList.contains('open')) {
        setMenuOpen(false, true);
      }
    });
  }

  function initializeFixedHeader() {
    var header = document.getElementById('top-head');
    if (!header) return;

    var gotop = document.getElementById('gotop');
    var titles = Array.prototype.slice.call(document.querySelectorAll('h1.title, h1.seo_h1'));
    var titleShrinkDistance = 120;

    function measureTitleShrinkDistance() {
      var standardDistance = window.innerWidth <= 780 ? 96 : 120;
      var compactBarHeight = window.innerWidth <= 780 ? 56 : 64;
      var firstShop = document.querySelector('#shop .omise, .omise.pullhead');
      var firstShopTop = 0;

      if (firstShop) {
        var current = firstShop;
        while (current) {
          firstShopTop += current.offsetTop || 0;
          current = current.offsetParent;
        }
      }

      titleShrinkDistance = firstShopTop > compactBarHeight
        ? Math.min(standardDistance, firstShopTop - compactBarHeight)
        : standardDistance;
      titleShrinkDistance = Math.max(1, titleShrinkDistance);
    }

    function syncFixed() {
      var y = window.scrollY || window.pageYOffset || 0;
      var titleProgress = 0;

      titles.forEach(function (node) {
        var nodeProgress = Math.max(0, Math.min(1, y / titleShrinkDistance));
        titleProgress = Math.max(titleProgress, nodeProgress);
        node.style.setProperty('--h1-progress', nodeProgress.toFixed(3));
        node.classList.toggle('scrolled-title', nodeProgress >= 0.999);
      });

      var headerProgress = titles.length
        ? titleProgress
        : Math.max(0, Math.min(1, (y - 220) / 180));
      header.style.setProperty('--header-progress', headerProgress.toFixed(3));
      header.classList.toggle('fixed', headerProgress >= 0.999);

      if (gotop) gotop.style.display = y > 500 ? 'block' : 'none';
    }

    measureTitleShrinkDistance();
    syncFixed();
    window.addEventListener('scroll', syncFixed, { passive: true });
    window.addEventListener('resize', function () {
      measureTitleShrinkDistance();
      syncFixed();
    });
    window.addEventListener('load', function () {
      measureTitleShrinkDistance();
      syncFixed();
    });
  }

  function initializeAnchors() {
    var header = document.getElementById('top-head');

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
      return anchor.charAt(0) === '#' ? document.querySelector(anchor) : null;
    }

    function scrollToAnchor(href) {
      var target = resolveAnchor(href);
      if (!target) return false;
      var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
      var scrollMarginTop = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      window.scrollTo({ top: Math.max(0, targetTop - scrollMarginTop), behavior: 'smooth' });
      if (header) header.classList.remove('open');
      return true;
    }

    document.addEventListener('click', function (event) {
      var anchor = event.target.closest('a[href*="#"]');
      if (!anchor) return;
      var href = anchor.getAttribute('href');
      if (!href || href === '#' || (href.indexOf('#') > 0 && href.charAt(0) !== '#')) return;
      event.preventDefault();
      if (!scrollToAnchor(href)) window.location.hash = normalizeAnchor(href);
    });

    if (window.location.hash) {
      window.setTimeout(function () {
        scrollToAnchor(window.location.hash);
      }, 0);
    }
  }

  function initializeShopAccordions() {
    var toggles = Array.prototype.slice.call(document.querySelectorAll('.pullhead-toggle'));
    toggles.forEach(function (button) {
      var pullhead = button.closest('.pullhead');
      var pullbody = document.getElementById(button.getAttribute('aria-controls'));
      if (!pullhead || !pullbody) return;

      var initiallyOpen = window.getComputedStyle(pullbody).display !== 'none';
      pullhead.classList.toggle('open', initiallyOpen);
      pullhead.classList.toggle('close', !initiallyOpen);
      button.setAttribute('aria-expanded', initiallyOpen ? 'true' : 'false');
      pullbody.setAttribute('aria-hidden', initiallyOpen ? 'false' : 'true');

      button.addEventListener('click', function (event) {
        event.preventDefault();
        var willOpen = !pullhead.classList.contains('open');

        if (window.jQuery) {
          window.jQuery(pullbody).stop(true, true).slideToggle('fast');
        } else {
          pullbody.style.display = willOpen ? 'block' : 'none';
        }

        pullhead.classList.toggle('open', willOpen);
        pullhead.classList.toggle('close', !willOpen);
        button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        pullbody.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
      });
    });
  }

  function initializeCarousels() {
    if (typeof window.Swiper !== 'function') return;

    Array.prototype.forEach.call(document.querySelectorAll('.swiper-container'), function (container) {
      if (container.closest('#top') || container.swiper) return;

      new window.Swiper(container, {
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
        pagination: { el: container.querySelector('.swiper-pagination') },
        navigation: {
          nextEl: container.querySelector('.swiper-button-next'),
          prevEl: container.querySelector('.swiper-button-prev')
        }
      });
    });
  }

  ready(function () {
    initializeNavigation();
    initializeFixedHeader();
    initializeAnchors();
    initializeShopAccordions();
    initializeCarousels();
  });
})();
