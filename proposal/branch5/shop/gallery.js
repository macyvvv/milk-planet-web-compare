(function (window) {
  'use strict';

  if (document.documentElement.dataset.proposalGalleryInitialized === 'true') return;

  // lightbox オプションの設定。依存が読み込まれていないページでは無視する。
  if (window.lightbox && typeof window.lightbox.option === 'function') {
    window.lightbox.option({
      wrapAround: true,
      albumLabel: ' %1 / total %2 '
    });
  }

  var $ = window.jQuery;
  if (!$) return;

  var galleryItems = $('#gallery > ul.gallery2 > li');
  if (!galleryItems.length) return;

  document.documentElement.dataset.proposalGalleryInitialized = 'true';

  function fadeAnime() {
    var scroll = $(window).scrollTop();
    var windowHeight = $(window).height();

    galleryItems.each(function () {
      var elemPos = $(this).offset().top;
      $(this).toggleClass('flipLeft', scroll >= elemPos - windowHeight);
    });
  }

  var ticking = false;
  function scheduleFade() {
    if (ticking) return;
    ticking = true;

    var requestFrame = window.requestAnimationFrame || function (callback) {
      return window.setTimeout(callback, 16);
    };
    requestFrame(function () {
      ticking = false;
      fadeAnime();
    });
  }

  $(window).on('scroll.proposalGallery', scheduleFade);
  $(window).on('load.proposalGallery', scheduleFade);
}(window));
