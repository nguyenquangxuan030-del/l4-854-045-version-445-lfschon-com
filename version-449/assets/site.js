(function () {
  function $(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = $('[data-hero-slide]', hero);
    var dots = $('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector('.js-filter-input');
  var filterYear = document.querySelector('.js-filter-year');
  var resetButton = document.querySelector('[data-filter-reset]');
  var cards = $('.js-movie-card');

  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';

    cards.forEach(function (card) {
      var haystack = (
        (card.getAttribute('data-title') || '') + ' ' +
        (card.getAttribute('data-meta') || '')
      ).toLowerCase();
      var yearMatched = !year || haystack.indexOf(year.toLowerCase()) !== -1;
      var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !(yearMatched && keywordMatched));
    });
  }

  if (cards.length) {
    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }
    if (filterYear) {
      filterYear.addEventListener('change', applyFilter);
    }
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (filterInput) {
          filterInput.value = '';
        }
        if (filterYear) {
          filterYear.value = '';
        }
        applyFilter();
      });
    }
  }
})();
