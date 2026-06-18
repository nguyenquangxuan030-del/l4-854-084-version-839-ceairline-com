(function () {
  function setupPlayer() {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var shade = shell.querySelector('[data-shade]');
    var playButtons = shell.querySelectorAll('[data-play]');
    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    function attachStream() {
      if (loaded || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }

    function playVideo() {
      attachStream();
      video.controls = true;
      if (shade) {
        shade.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', playVideo);
    });

    if (shade) {
      shade.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
