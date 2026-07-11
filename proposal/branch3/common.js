(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var header = document.querySelector('#top-head');
    var toggle = document.querySelector('#nav-toggle');
    var navLinks = document.querySelectorAll('#global-nav a');

    if (toggle && header) {
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-label', 'めにゅうを開く');

      function toggleOpen() {
        header.classList.toggle('open');
      }

      toggle.addEventListener('click', toggleOpen);
      toggle.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleOpen();
        }
      });
    }

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (header) header.classList.remove('open');
      });
    });
  });
})();
