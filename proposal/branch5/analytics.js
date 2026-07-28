(function () {
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

  /* 最終CV(1): 各baseショップへの遷移。ホスト名 -> ブランド名 */
  var BASE_SHOP_HOSTS = {
    'milkplanet.thebase.in': 'shinjuku',
    'milkplaneta.base.shop': 'cybarplanet',
    'shandylove.base.shop': 'shandy',
    'meltymousse.base.shop': 'melty',
    'bloodysugar.base.shop': 'bloody',
    'milkhkt.base.shop': 'roysuga',
    'tweeny.base.shop': 'tweeny'
  };

  /* 最終CV(2): リクルート応募(LINE)。line.me 全般を応募導線として扱う */
  function isRecruitApplyHref(hostname) {
    return hostname === 'line.me';
  }

  /* 汎用クリック計測 + 最終CV2種の検出。documentへの委譲なのでDOM構築前でも登録可能 */
  document.addEventListener('click', function (event) {
    var el = event.target && event.target.closest
      ? event.target.closest('a, button, [role="button"], input[type="button"], input[type="submit"]')
      : null;
    if (!el) return;
    if (el.hasAttribute('data-ga-ignore')) return;

    var href = el.getAttribute('href') || '';
    var outbound = isOutbound(href);
    var url = toUrl(href);
    var hostname = url ? (url.hostname || '') : '';
    var clickText = getCleanText(el) || truncate(el.getAttribute('aria-label') || el.getAttribute('title') || '', 120);
    var clickArea = getSectionName(el);
    var clickType = getClickType(el);

    pushAnalyticsEvent('ui_click', {
      click_text: clickText,
      click_type: clickType,
      click_id: truncate(el.id || '', 80),
      click_classes: truncate((el.className || '').toString(), 160),
      click_url: normalizeHref(href),
      click_domain: truncate(hostname, 120),
      click_area: clickArea,
      outbound: outbound ? '1' : '0'
    });

    if (outbound) {
      pushAnalyticsEvent('outbound_click', {
        click_text: clickText,
        click_url: normalizeHref(href),
        click_domain: truncate(hostname, 120),
        click_area: clickArea
      });

      if (isRecruitApplyHref(hostname)) {
        pushAnalyticsEvent('cv_recruit_apply', {
          click_text: clickText,
          click_url: normalizeHref(href),
          click_area: clickArea
        });
      } else if (Object.prototype.hasOwnProperty.call(BASE_SHOP_HOSTS, hostname)) {
        pushAnalyticsEvent('cv_base_transition', {
          click_text: clickText,
          click_url: normalizeHref(href),
          click_area: clickArea,
          shop: BASE_SHOP_HOSTS[hostname]
        });
      }
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

  /* UI側(proposal.js等)がUI固有イベント(メニュー開閉など)を送るための唯一の窓口 */
  window.siteAnalytics = {
    track: pushAnalyticsEvent
  };
})();
