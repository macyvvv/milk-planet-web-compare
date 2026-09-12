function initializeEvent() {
  var $ = window.jQuery;
  if (!$) return;

  if (typeof $.fn.slick === 'function') {
    $('.slider').filter(function () {
      return !$(this).hasClass('slick-initialized');
    }).slick({
    autoplay: true,//自動的に動き出すか。初期値はfalse。
    infinite: true,//スライドをループさせるかどうか。初期値はtrue。
    speed: 500,//スライドのスピード。初期値は300。
    slidesToShow: 3,//スライドを画面に3枚見せる
    slidesToScroll: 1,//1回のスクロールで1枚の写真を移動して見せる
    prevArrow: '<div class="slick-prev"></div>',//矢印部分PreviewのHTMLを変更
    nextArrow: '<div class="slick-next"></div>',//矢印部分NextのHTMLを変更
    centerMode: true,//要素を中央ぞろえにする
    variableWidth: true,//幅の違う画像の高さを揃えて表示
    dots: true,//下部ドットナビゲーションの表示
    });
  }
  if (typeof $.fn.modaal !== 'function') return;

  function initializeModaal(selector, options) {
    $(selector).filter(function () {
      return $(this).data('proposalModaalInitialized') !== true;
    }).each(function () {
      $(this).data('proposalModaalInitialized', true).modaal(options);
    });
  }

  function lockScroll() {
    $('html').css('overflow-y','hidden');/*縦スクロールバーを出さない*/
  }

  function unlockScroll() {
    $('html').css('overflow-y','scroll');/*縦スクロールバーを出す*/
  }

  var scrollOptions = {
    before_open: lockScroll,
    after_close: unlockScroll
  };

  //1. テキストを含む一般的なモーダル
  initializeModaal('.info', Object.assign({
    overlay_close: true//モーダル背景クリック時に閉じるか
  }, scrollOptions));

  //2. 確認を促すモーダル
  initializeModaal('.confirm', {
    type: 'confirm',
    confirm_title: 'ログイン画面',//確認画面タイトル
    confirm_button_text: 'ログイン', //確認画面ボタンのテキスト
    confirm_cancel_button_text: 'キャンセル',//確認画面キャンセルボタンのテキスト
    confirm_content: 'ログインが必要です。この画面はボタンを押さなければ閉じません。',//確認画面の内容
  });

  //3. 画像のモーダル
  initializeModaal('.gallery', Object.assign({
    type: 'image',
    overlay_close: true//モーダル背景クリック時に閉じるか
  }, scrollOptions));

  //4. 動画のモーダル
  initializeModaal('.video-open', Object.assign({
    type: 'video',
    overlay_close: true,//モーダル背景クリック時に閉じるか
    background: '#28BFE7', // 背景色
    overlay_opacity: 0.8 // 透過具合
  }, scrollOptions));

  //5. iframeのモーダル
  initializeModaal('.iframe-open', Object.assign({
    type: 'iframe',
    width: 800,//iframe横幅
    height: 800,//iframe高さ
    overlay_close: true//モーダル背景クリック時に閉じるか
  }, scrollOptions));
}

// Execute immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEvent);
} else {
  initializeEvent();
}
