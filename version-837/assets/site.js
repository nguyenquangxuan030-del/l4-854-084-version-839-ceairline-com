(function () {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-menu-button]");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuButton && header) {
        menuButton.addEventListener("click", function () {
            header.classList.toggle("menu-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var scrollers = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-row]"));
    scrollers.forEach(function (wrap) {
        var left = wrap.querySelector("[data-scroll-left]");
        var right = wrap.querySelector("[data-scroll-right]");
        var track = wrap.querySelector("[data-scroll-track]");

        function move(direction) {
            if (!track) {
                return;
            }
            var amount = direction === "left" ? -420 : 420;
            track.parentElement.scrollBy({
                left: amount,
                behavior: "smooth"
            });
        }

        if (left) {
            left.addEventListener("click", function () {
                move("left");
            });
        }

        if (right) {
            right.addEventListener("click", function () {
                move("right");
            });
        }
    });

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
        var root = panel.parentElement;
        var input = panel.querySelector("[data-filter-input]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
        var empty = root.querySelector("[data-empty-state]");

        function matches(card) {
            var q = input ? input.value.trim().toLowerCase() : "";
            var rq = region ? region.value : "";
            var tq = type ? type.value : "";
            var yq = year ? year.value : "";
            var text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-category") || ""
            ].join(" ").toLowerCase();

            if (q && text.indexOf(q) === -1) {
                return false;
            }
            if (rq && card.getAttribute("data-region") !== rq) {
                return false;
            }
            if (tq && card.getAttribute("data-type") !== tq) {
                return false;
            }
            if (yq && card.getAttribute("data-year") !== yq) {
                return false;
            }
            return true;
        }

        function applyFilter() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, region, type, year].forEach(function (field) {
            if (field) {
                field.addEventListener("input", applyFilter);
                field.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    });

    var player = document.querySelector("[data-player]");
    if (player) {
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-play-overlay]");
        var button = player.querySelector("[data-play-button]");
        var stream = player.getAttribute("data-stream");
        var connected = false;
        var hls = null;

        function attachStream() {
            if (connected || !video || !stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                connected = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                connected = true;
                return;
            }

            video.src = stream;
            connected = true;
        }

        function playVideo() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (video) {
                video.controls = true;
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }
})();
