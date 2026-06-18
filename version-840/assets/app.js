(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      body.classList.toggle('menu-open', menu.classList.contains('is-open'));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }
    stopHero();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }
    startHero();
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  forms.forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var region = form.querySelector('[data-region-filter]');
    var type = form.querySelector('[data-type-filter]');
    var clear = form.querySelector('[data-clear-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var empty = document.querySelector('[data-empty-state]');

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }
        if (typeValue && cardType.indexOf(typeValue) === -1) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilter();
      });
    }
  });
})();

function initializeMoviePlayer(source) {
  var video = document.getElementById('player-video');
  var cover = document.getElementById('player-cover');
  var message = document.getElementById('player-message');
  var ready = false;
  var hlsInstance = null;

  if (!video || !cover || !source) {
    return;
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放暂时不可用，请稍后再试');
        }
      });
    } else {
      video.src = source;
    }
  }

  function start() {
    prepare();
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        setMessage('点击视频区域继续播放');
      });
    }
  }

  cover.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('playing', function () {
    setMessage('');
  });
  video.addEventListener('error', function () {
    setMessage('播放暂时不可用，请稍后再试');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
