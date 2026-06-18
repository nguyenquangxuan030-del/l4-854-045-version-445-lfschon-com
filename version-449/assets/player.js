(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var started = false;
    var hlsInstance = null;

    function attachSource() {
      var url = video.getAttribute('data-play-url');
      if (!url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = url;
    }

    function startPlayback() {
      if (!video) {
        return;
      }
      if (!started) {
        attachSource();
        started = true;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          startPlayback();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
