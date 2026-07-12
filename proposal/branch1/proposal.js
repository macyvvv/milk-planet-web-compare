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

    function truncate(str, max) {
      if (!str) return '';
      return String(str).slice(0, max);
    }

    function getCleanText(node) {
      if (!node) return '';
      return truncate((node.textContent || '').replace(/\s+/g, ' ').trim(), 120);
    }

    function normalizeHref(href) {
      if (!href) return '';
      return truncate(href, 300);
    }

    function getSectionName(node) {
      if (!node || !node.closest) return '';
      var section = node.closest('section, article, nav, header, footer, main, [id]');
      if (!section) return '';
      return truncate(section.id || section.className || section.tagName.toLowerCase(), 80);
    }

    function getClickType(el) {
      if (!el || !el.tagName) return 'unknown';
      var tag = el.tagName.toLowerCase();
      if (tag === 'a') return 'link';
      if (tag === 'button') return 'button';
      if (tag === 'input') return 'input';
      return tag;
    }

    function toUrl(href) {
      try {
        return new URL(href, window.location.href);
      } catch (error) {
        return null;
      }
    }

    function isOutbound(href) {
      var url = toUrl(href);
      if (!url) return false;
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
      return url.origin !== window.location.origin;
    }

    function pushAnalyticsEvent(eventName, params) {
      var payload = Object.assign({
        event_name: eventName,
        page_path: window.location.pathname,
        page_title: document.title
      }, params || {});

      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: eventName }, payload));
    }

    document.addEventListener('click', function (event) {
      var el = event.target && event.target.closest
        ? event.target.closest('a, button, [role="button"], input[type="button"], input[type="submit"]')
        : null;
      if (!el) return;
      if (el.hasAttribute('data-ga-ignore')) return;

      var href = el.getAttribute('href') || '';
      var outbound = isOutbound(href);
      var url = toUrl(href);
      var clickText = getCleanText(el) || truncate(el.getAttribute('aria-label') || el.getAttribute('title') || '', 120);
      var clickArea = getSectionName(el);
      var clickType = getClickType(el);

      pushAnalyticsEvent('ui_click', {
        click_text: clickText,
        click_type: clickType,
        click_id: truncate(el.id || '', 80),
        click_classes: truncate((el.className || '').toString(), 160),
        click_url: normalizeHref(href),
        click_domain: url ? truncate(url.hostname || '', 120) : '',
        click_area: clickArea,
        outbound: outbound ? '1' : '0'
      });

      if (outbound) {
        pushAnalyticsEvent('outbound_click', {
          click_text: clickText,
          click_url: normalizeHref(href),
          click_domain: url ? truncate(url.hostname || '', 120) : '',
          click_area: clickArea
        });
      }
    }, true);

    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || form.tagName !== 'FORM') return;
      pushAnalyticsEvent('form_submit', {
        form_id: truncate(form.id || '', 80),
        form_name: truncate(form.getAttribute('name') || '', 80),
        form_action: normalizeHref(form.getAttribute('action') || window.location.pathname),
        form_area: getSectionName(form)
      });
    }, true);

    if (!header || !toggle || !nav) return;

    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-label', 'めにゅうを開く');

    function openClose() {
      var isOpen = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      pushAnalyticsEvent('menu_toggle', {
        menu_state: isOpen ? 'open' : 'close',
        menu_id: 'global-nav'
      });
    }

    toggle.addEventListener('click', openClose);
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openClose();
      }
    });

    nav.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'A') {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
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
    });
  });
})();
