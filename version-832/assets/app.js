(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function(dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function() {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-grid-filter]"));
    panels.forEach(function(panel) {
      var input = panel.querySelector("[data-filter-input]");
      var clear = panel.querySelector("[data-filter-clear]");
      var grid = document.querySelector("[data-filter-grid]");
      var empty = document.querySelector("[data-empty-message]");
      if (!input || !grid) {
        return;
      }

      var queryName = panel.getAttribute("data-query-from-url");
      if (queryName) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get(queryName);
        if (queryValue) {
          input.value = queryValue;
        }
      }

      function apply() {
        var value = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var visible = 0;
        cards.forEach(function(card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", apply);
      if (clear) {
        clear.addEventListener("click", function() {
          input.value = "";
          apply();
          input.focus();
        });
      }
      Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]")).forEach(function(button) {
        button.addEventListener("click", function() {
          input.value = button.getAttribute("data-filter-value") || "";
          apply();
        });
      });
      apply();
    });
  }

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
