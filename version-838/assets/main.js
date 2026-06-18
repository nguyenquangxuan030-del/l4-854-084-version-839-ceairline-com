document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupSiteSearch();
    setupHeroCarousel();
    setupFilters();
});

function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", function () {
        toggle.classList.toggle("is-active");
        nav.classList.toggle("is-open");
    });
}

function setupSiteSearch() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[type='search']");
            var query = input ? input.value.trim() : "";
            var target = "./movies.html";
            if (query) {
                target += "?q=" + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });
}

function setupHeroCarousel() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
        return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
            start();
        });
    }
    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
    }
    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            show(dotIndex);
            start();
        });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
}

function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
        var scope = panel.closest("section") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var empty = scope.querySelector("[data-empty-state]");
        var search = panel.querySelector("[data-filter-search]");
        var type = panel.querySelector("[data-filter-type]");
        var region = panel.querySelector("[data-filter-region]");
        var year = panel.querySelector("[data-filter-year]");
        var category = panel.querySelector("[data-filter-category]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && search) {
            search.value = initialQuery;
        }

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function run() {
            var q = normalize(search ? search.value : "");
            var typeValue = normalize(type ? type.value : "");
            var regionValue = normalize(region ? region.value : "");
            var yearValue = normalize(year ? year.value : "");
            var categoryValue = normalize(category ? category.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var matches = true;
                if (q && haystack.indexOf(q) === -1) {
                    matches = false;
                }
                if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                    matches = false;
                }
                if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
                    matches = false;
                }
                if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                    matches = false;
                }
                if (categoryValue && normalize(card.getAttribute("data-category")) !== categoryValue) {
                    matches = false;
                }
                card.hidden = !matches;
                if (matches) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, type, region, year, category].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", run);
            control.addEventListener("change", run);
        });

        run();
    });
}
