(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html';
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function reset() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        reset();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        reset();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !type || normalize(card.getAttribute('data-type')) === type;
        var matchedYear = !year || normalize(card.getAttribute('data-year')) === year;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedType && matchedYear));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    apply();
  });
})();
