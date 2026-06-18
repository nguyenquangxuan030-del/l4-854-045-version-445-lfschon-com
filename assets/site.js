(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function renderSearchResult(item) {
    return "<a href=\"" + item.url + "\">" +
      "<img src=\"" + item.cover + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\">" +
      "<div><strong>" + item.title + "</strong><span>" + item.year + " · " + item.region + " · " + item.genre + "</span></div>" +
      "</a>";
  }

  function bindSearch(inputId, resultId, limit) {
    var input = document.getElementById(inputId);
    var box = document.getElementById(resultId);
    if (!input || !box || !window.SEARCH_INDEX) {
      return;
    }

    input.addEventListener("input", function () {
      var query = normalize(input.value);
      if (query.length < 1) {
        box.classList.remove("is-open");
        box.innerHTML = "";
        return;
      }

      var results = window.SEARCH_INDEX.filter(function (item) {
        var pool = normalize(item.title + " " + item.year + " " + item.region + " " + item.genre + " " + item.tags);
        return pool.indexOf(query) !== -1;
      }).slice(0, limit || 8);

      if (!results.length) {
        box.innerHTML = "<div class=\"empty-state is-visible\">没有匹配的影片</div>";
      } else {
        box.innerHTML = results.map(renderSearchResult).join("");
      }
      box.classList.add("is-open");
    });

    document.addEventListener("click", function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove("is-open");
      }
    });
  }

  function bindMobileMenu() {
    var button = document.getElementById("mobileMenuButton");
    var menu = document.getElementById("mobileMenu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    start();
  }

  function bindHomeSearch() {
    var input = document.getElementById("homeSearch");
    var box = document.getElementById("homeSearchResults");
    if (!input || !box || !window.SEARCH_INDEX) {
      return;
    }
    input.addEventListener("input", function () {
      var query = normalize(input.value);
      if (!query) {
        box.classList.remove("is-open");
        box.innerHTML = "";
        return;
      }
      var results = window.SEARCH_INDEX.filter(function (item) {
        var text = normalize(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags + " " + item.year);
        return text.indexOf(query) !== -1;
      }).slice(0, 12);
      box.innerHTML = results.length ? results.map(renderSearchResult).join("") : "<div class=\"empty-state is-visible\">没有匹配的影片</div>";
      box.classList.add("is-open");
    });
  }

  function bindLocalFilters() {
    var input = document.getElementById("localFilterInput");
    var year = document.getElementById("yearFilter");
    var region = document.getElementById("regionFilter");
    var type = document.getElementById("typeFilter");
    var items = Array.prototype.slice.call(document.querySelectorAll(".filterable-grid .movie-card, .filterable-list .rank-row"));
    var empty = document.getElementById("emptyState");
    if (!items.length) {
      return;
    }

    function getText(item) {
      return normalize(item.getAttribute("data-title") || item.textContent);
    }

    function update() {
      var query = normalize(input && input.value);
      var y = year && year.value;
      var r = region && region.value;
      var t = type && type.value;
      var shown = 0;

      items.forEach(function (item) {
        var ok = true;
        if (query && getText(item).indexOf(query) === -1) {
          ok = false;
        }
        if (y && item.getAttribute("data-year") !== y) {
          ok = false;
        }
        if (r && item.getAttribute("data-region") !== r) {
          ok = false;
        }
        if (t && item.getAttribute("data-type") !== t) {
          ok = false;
        }
        item.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
  }

  ready(function () {
    bindMobileMenu();
    bindHero();
    bindSearch("globalSearch", "globalSearchResults", 8);
    bindSearch("mobileGlobalSearch", "mobileGlobalSearchResults", 8);
    bindHomeSearch();
    bindLocalFilters();
  });
})();
