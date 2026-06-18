(() => {
    const body = document.body;
    const header = document.querySelector("[data-header]");
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    const updateHeader = () => {
        if (!header) {
            return;
        }

        header.classList.toggle("is-scrolled", window.scrollY > 18);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", () => {
            const open = !mobileNav.classList.contains("is-open");
            mobileNav.classList.toggle("is-open", open);
            body.classList.toggle("menu-open", open);
        });

        mobileNav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                mobileNav.classList.remove("is-open");
                body.classList.remove("menu-open");
            });
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = [...hero.querySelectorAll("[data-hero-slide]")];
        const dots = [...hero.querySelectorAll("[data-hero-dot]")];
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let active = 0;
        let timer = null;

        const show = (index) => {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === active);
                slide.setAttribute("aria-hidden", slideIndex === active ? "false" : "true");
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(active + 1), 5200);
        };

        prev?.addEventListener("click", () => {
            show(active - 1);
            start();
        });

        next?.addEventListener("click", () => {
            show(active + 1);
            start();
        });

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    }

    document.querySelectorAll("[data-rail]").forEach((rail) => {
        const target = document.querySelector(rail.dataset.rail);
        const direction = rail.dataset.direction === "prev" ? -1 : 1;

        rail.addEventListener("click", () => {
            if (!target) {
                return;
            }

            target.scrollBy({
                left: direction * Math.max(280, target.clientWidth * 0.78),
                behavior: "smooth"
            });
        });
    });

    const applyFilters = (panel) => {
        const scope = panel.closest("main") || document;
        const cards = [...scope.querySelectorAll("[data-movie-card]")];
        const input = panel.querySelector("[data-filter-input]");
        const region = panel.querySelector("[data-filter-region]");
        const year = panel.querySelector("[data-filter-year]");
        const category = panel.querySelector("[data-filter-category]");
        const empty = scope.querySelector("[data-empty-state]");

        const update = () => {
            const query = (input?.value || "").trim().toLowerCase();
            const regionValue = region?.value || "";
            const yearValue = year?.value || "";
            const categoryValue = category?.value || "";
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title || "",
                    card.dataset.region || "",
                    card.dataset.year || "",
                    card.dataset.category || "",
                    card.dataset.tags || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();

                const matched = (!query || haystack.includes(query))
                    && (!regionValue || card.dataset.region === regionValue)
                    && (!yearValue || card.dataset.year === yearValue)
                    && (!categoryValue || card.dataset.category === categoryValue);

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        const params = new URLSearchParams(window.location.search);
        const preset = params.get("q");
        if (preset && input) {
            input.value = preset;
        }

        [input, region, year, category].forEach((control) => {
            control?.addEventListener("input", update);
            control?.addEventListener("change", update);
        });

        update();
    };

    document.querySelectorAll("[data-filter-panel]").forEach(applyFilters);

    const player = document.querySelector("[data-player]");
    if (player) {
        const video = player.querySelector("video");
        const startButton = player.querySelector("[data-player-start]");
        const stream = player.dataset.stream;
        let loaded = false;
        let hlsInstance = null;

        const load = () => {
            if (loaded || !video || !stream) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            loaded = true;
        };

        const play = () => {
            load();

            if (!video) {
                return;
            }

            player.classList.add("is-playing");
            video.controls = true;
            const action = video.play();

            if (action && typeof action.catch === "function") {
                action.catch(() => {});
            }
        };

        startButton?.addEventListener("click", play);

        video?.addEventListener("click", () => {
            if (!loaded) {
                play();
            }
        });

        video?.addEventListener("play", () => {
            player.classList.add("is-playing");
        });

        window.addEventListener("pagehide", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
