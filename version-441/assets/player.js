function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var url = options.url;
  var hls = null;
  var started = false;

  if (!video || !button || !url) {
    return;
  }

  var hideButton = function () {
    button.classList.add('is-hidden');
  };

  var startPlayback = function () {
    hideButton();
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  };

  var attach = function () {
    if (started) {
      startPlayback();
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      startPlayback();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        startPlayback();
      });
      return;
    }

    video.src = url;
    startPlayback();
  };

  button.addEventListener('click', attach);
  video.addEventListener('click', function () {
    if (!started) {
      attach();
    }
  });
  video.addEventListener('play', hideButton);
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
