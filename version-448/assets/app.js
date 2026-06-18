(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            if (slides.length <= 1) {
                return;
            }
            var current = 0;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        });
    }

    function setupHomeSearch() {
        var form = document.querySelector("[data-home-search]");
        if (!form) {
            return;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var url = "./library.html";
            if (query) {
                url += "?q=" + encodeURIComponent(query);
            }
            window.location.href = url;
        });
    }

    function setupCollections() {
        document.querySelectorAll("[data-collection]").forEach(function (collection) {
            var input = collection.querySelector("[data-filter-input]");
            var sort = collection.querySelector("[data-sort]");
            var grid = collection.querySelector("[data-collection-grid]");
            var cards = Array.prototype.slice.call(collection.querySelectorAll(".movie-card"));
            var gridButton = collection.querySelector("[data-view-grid]");
            var listButton = collection.querySelector("[data-view-list]");
            if (!grid || !cards.length) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var startQuery = params.get("q");
            if (startQuery && input) {
                input.value = startQuery;
            }
            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre")
                    ].join(" "));
                    card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
                });
                var mode = sort ? sort.value : "index";
                var ordered = cards.slice().sort(function (a, b) {
                    if (mode === "views") {
                        return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                    }
                    if (mode === "rating") {
                        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                    }
                    if (mode === "year") {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    }
                    return 0;
                });
                ordered.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (sort) {
                sort.addEventListener("change", apply);
            }
            if (gridButton && listButton) {
                gridButton.addEventListener("click", function () {
                    grid.classList.remove("list-view");
                    gridButton.classList.add("active");
                    listButton.classList.remove("active");
                });
                listButton.addEventListener("click", function () {
                    grid.classList.add("list-view");
                    listButton.classList.add("active");
                    gridButton.classList.remove("active");
                });
            }
            apply();
        });
    }

    window.SitePlayer = {
        mount: function (selector, stream) {
            var shell = typeof selector === "string" ? document.querySelector(selector) : selector;
            if (!shell) {
                return;
            }
            var video = shell.querySelector("video");
            var button = shell.querySelector(".player-cover");
            var prepared = false;
            function prepare() {
                if (prepared || !video) {
                    return;
                }
                prepared = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    shell.hlsPlayer = hls;
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                }
            }
            function begin() {
                prepare();
                shell.classList.add("is-playing");
                if (video) {
                    var play = video.play();
                    if (play && typeof play.catch === "function") {
                        play.catch(function () {});
                    }
                }
            }
            prepare();
            if (button) {
                button.addEventListener("click", begin);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        begin();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                });
            }
        }
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupHomeSearch();
        setupCollections();
    });
})();
