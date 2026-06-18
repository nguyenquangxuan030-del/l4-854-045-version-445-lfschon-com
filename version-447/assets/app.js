(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function(slide, pos) {
      slide.classList.toggle('is-active', pos === active);
    });
    dots.forEach(function(dot, pos) {
      dot.classList.toggle('is-active', pos === active);
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function() {
      showSlide(active + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function(panel) {
    var scope = panel.closest('main') || document;
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var count = panel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    function matchYear(card, value) {
      if (!value) {
        return true;
      }
      var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
      if (value === '2022') {
        return cardYear <= 2022;
      }
      return String(cardYear) === value;
    }

    function apply() {
      var query = normalize(input && input.value);
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var typeOk = !selectedType || card.getAttribute('data-type') === selectedType;
        var ok = haystack.indexOf(query) !== -1 && matchYear(card, selectedYear) && typeOk;
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '匹配 ' + visible + ' 部';
      }
    }

    [input, year, type].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
