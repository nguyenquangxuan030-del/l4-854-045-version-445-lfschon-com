(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot));
        startTimer();
      });
    });

    startTimer();
  }

  const querySync = document.querySelector('[data-query-sync]');

  if (querySync) {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('q') || '';
    querySync.value = keyword;
  }

  const cardList = document.querySelector('[data-card-list]');
  const searchInput = document.querySelector('[data-local-search]');
  const sortSelect = document.querySelector('[data-local-sort]');
  const emptyState = document.querySelector('[data-empty-state]');
  const filterSelects = Array.from(document.querySelectorAll('[data-local-filter]'));

  if (cardList) {
    const originalCards = Array.from(cardList.querySelectorAll('[data-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const keyword = normalize(searchInput ? searchInput.value : '');
      let visibleCount = 0;

      originalCards.forEach(function (card) {
        const text = normalize(card.dataset.search);
        let visible = !keyword || text.includes(keyword);

        filterSelects.forEach(function (select) {
          const key = select.dataset.localFilter;
          const value = normalize(select.value);
          const cardValue = normalize(card.dataset[key]);

          if (value && !cardValue.includes(value)) {
            visible = false;
          }
        });

        card.style.display = visible ? '' : 'none';

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    function applySort() {
      const value = sortSelect ? sortSelect.value : 'default';
      const sorted = originalCards.slice();

      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }

      if (value === 'title') {
        sorted.sort(function (a, b) {
          const titleA = a.querySelector('h3') ? a.querySelector('h3').innerText : '';
          const titleB = b.querySelector('h3') ? b.querySelector('h3').innerText : '';
          return titleA.localeCompare(titleB, 'zh-CN');
        });
      }

      sorted.forEach(function (card) {
        cardList.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filterSelects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilters();
      });
    }

    applySort();
    applyFilters();
  }

  document.querySelectorAll('.js-player').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.player-start');
    const status = player.querySelector('.player-status');
    const src = player.getAttribute('data-hls-src');
    let ready = false;
    let hls = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function attachSource() {
      if (!video || !src || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              return;
            }

            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }

            setStatus('播放加载失败，请稍后再试');
          }
        });
        ready = true;
        return;
      }

      video.src = src;
      ready = true;
    }

    function startPlayback() {
      if (!video) {
        return;
      }

      attachSource();
      video.controls = true;

      if (button) {
        button.classList.add('is-hidden');
      }

      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
