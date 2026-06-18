(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function currentSearchTarget(form) {
    return form.getAttribute('action') || 'search.html';
  }

  function initMenu() {
    var toggle = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function initSearchForms() {
    qsa('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          input.focus();
          return;
        }
        event.preventDefault();
        window.location.href = currentSearchTarget(form) + '?q=' + encodeURIComponent(value);
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('.hero-prev', hero);
    var next = qs('.hero-next', hero);
    var index = 0;
    var timer;
    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        play();
      });
    });
    setSlide(0);
    play();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var input = qs('[data-filter-text]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var cards = qsa('.filterable-card');
    var empty = qs('.empty-state');
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var matched = (!query || text.indexOf(query) !== -1) && (!typeValue || type === typeValue) && (!yearValue || year === yearValue);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initSearchPage() {
    var page = qs('[data-search-page]');
    if (!page) {
      return;
    }
    var input = qs('[data-filter-text]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input && q) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
