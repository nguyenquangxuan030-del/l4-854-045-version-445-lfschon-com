(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = index % slides.length;
      if (active < 0) {
        active = slides.length - 1;
      }
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-card-filter-input]');
  var clearButton = document.querySelector('[data-card-filter-clear]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var applyFilter = function () {
    if (!filterInput) {
      return;
    }
    var query = filterInput.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var text = card.getAttribute('data-filter') || '';
      card.classList.toggle('hidden-by-filter', query && text.indexOf(query) === -1);
    });
  };
  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (clearButton && filterInput) {
    clearButton.addEventListener('click', function () {
      filterInput.value = '';
      applyFilter();
      filterInput.focus();
    });
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var input = document.querySelector('[data-global-search-input]');
    var result = document.querySelector('[data-search-results]');
    var fallback = document.querySelector('[data-search-fallback]');
    if (input) {
      input.value = initial;
    }
    var render = function () {
      if (!result || !input) {
        return;
      }
      var query = input.value.trim().toLowerCase();
      result.innerHTML = '';
      if (!query) {
        if (fallback) {
          fallback.style.display = '';
        }
        return;
      }
      if (fallback) {
        fallback.style.display = 'none';
      }
      var matched = window.MOVIE_INDEX.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 80);
      matched.forEach(function (item) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        var link = document.createElement('a');
        link.className = 'movie-card-link';
        link.href = item.url;
        var poster = document.createElement('span');
        poster.className = 'poster-wrap';
        var image = document.createElement('img');
        image.src = item.cover;
        image.alt = item.title;
        image.loading = 'lazy';
        var play = document.createElement('span');
        play.className = 'poster-play';
        play.textContent = '▶';
        poster.appendChild(image);
        poster.appendChild(play);
        var body = document.createElement('span');
        body.className = 'movie-card-body';
        var kicker = document.createElement('span');
        kicker.className = 'card-kicker';
        kicker.textContent = item.category;
        var title = document.createElement('h3');
        title.textContent = item.title;
        var desc = document.createElement('p');
        desc.textContent = item.oneLine;
        var meta = document.createElement('span');
        meta.className = 'movie-meta';
        [item.year, item.region, item.genre].forEach(function (value) {
          if (value) {
            var part = document.createElement('span');
            part.textContent = value;
            meta.appendChild(part);
          }
        });
        body.appendChild(kicker);
        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(meta);
        link.appendChild(poster);
        link.appendChild(body);
        article.appendChild(link);
        result.appendChild(article);
      });
    };
    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }
})();
