(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function setupRails() {
    document.querySelectorAll(".rail-control").forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-rail");
        var direction = button.getAttribute("data-direction") === "left" ? -1 : 1;
        var rail = document.getElementById(id);
        if (!rail) {
          return;
        }
        rail.scrollBy({
          left: direction * 420,
          behavior: "smooth"
        });
      });
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var input = document.querySelector(".filter-input");
    var year = document.querySelector(".filter-year");
    var type = document.querySelector(".filter-type");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var yearMatch = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
        var typeMatch = !selectedType || normalize(card.getAttribute("data-type")) === selectedType;
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !(yearMatch && typeMatch && keywordMatch));
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector(".global-search-input");
    var results = document.querySelector(".global-search-results");
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = "";
        results.classList.remove("is-open");
        return;
      }
      results.innerHTML = items.slice(0, 18).map(function (item) {
        return [
          "<a class=\"search-result-item\" href=\"" + item.url + "\">",
          "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
          "<span>",
          "<strong>" + escapeHtml(item.title) + "</strong>",
          "<span>" + escapeHtml(item.year + " · " + item.region + " · " + item.type) + "</span>",
          "</span>",
          "</a>"
        ].join("");
      }).join("");
      results.classList.add("is-open");
    }

    input.addEventListener("input", function () {
      var keyword = normalize(input.value);
      if (!keyword) {
        render([]);
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (item) {
        return normalize(item.search).indexOf(keyword) !== -1;
      });
      render(matched);
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".global-search")) {
        results.classList.remove("is-open");
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var stream = shell.getAttribute("data-stream");
      var attached = false;
      if (!video || !cover || !stream) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        cover.classList.add("is-hidden");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupCarousel();
    setupRails();
    setupFilters();
    setupGlobalSearch();
    setupPlayers();
  });
})();
