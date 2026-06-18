(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearch() {
        var roots = Array.prototype.slice.call(document.querySelectorAll('[data-search-root]'));
        roots.forEach(function (root) {
            var input = root.querySelector('[data-movie-search]');
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
            var empty = root.querySelector('[data-empty]');
            if (!input || !cards.length) {
                return;
            }

            function normalize(value) {
                return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
            }

            function filter() {
                var q = normalize(input.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var ok = !q || haystack.indexOf(q) !== -1;
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            input.addEventListener('input', filter);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                input.value = query;
                filter();
            }
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (box) {
            var video = box.querySelector('video[data-stream]');
            var overlay = box.querySelector('.play-overlay');
            if (!video) {
                return;
            }
            var url = video.getAttribute('data-stream');
            var loaded = false;
            var hls = null;

            function hideOverlay() {
                if (overlay) {
                    overlay.classList.add('hidden');
                }
            }

            function begin() {
                if (!url) {
                    return;
                }
                hideOverlay();
                if (loaded) {
                    video.play().catch(function () {});
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hls) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                            } else {
                                hls.destroy();
                            }
                        }
                    });
                    return;
                }
                video.src = url;
                video.play().catch(function () {});
            }

            if (overlay) {
                overlay.addEventListener('click', begin);
            }
            video.addEventListener('click', function () {
                if (!loaded) {
                    begin();
                }
            });
            video.addEventListener('play', hideOverlay);
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayers();
    });
}());
