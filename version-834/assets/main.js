(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (value) {
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      } else {
        window.location.href = './search.html';
      }
    });
  });

  function runHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function runFilter() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var input = panel.querySelector('[data-filter-input]');
    var select = panel.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function filter() {
      var q = normalize(input ? input.value : '');
      var genre = normalize(select ? select.value : '');

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = (!q || text.indexOf(q) !== -1) && (!genre || text.indexOf(genre) !== -1);
        card.classList.toggle('is-hidden', !ok);
      });
    }

    if (input) {
      input.addEventListener('input', filter);
    }
    if (select) {
      select.addEventListener('change', filter);
    }
    filter();
  }

  window.bindMoviePlayer = function (source) {
    var video = document.querySelector('[data-player]');
    var cover = document.querySelector('[data-player-cover]');
    var started = false;

    function play() {
      if (!video || started) {
        return;
      }
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      if (cover) {
        cover.classList.add('is-playing');
      }

      video.setAttribute('controls', 'controls');
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', play, { once: true });
    }
  };

  runHero();
  runFilter();
})();
