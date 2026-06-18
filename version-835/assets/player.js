(function () {
  function setupShell(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var source = shell.getAttribute('data-video');
    var started = false;

    function attachSource() {
      if (!video || !source || video.getAttribute('data-ready') === 'true') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', 'true');
    }

    function start() {
      if (!video || !source) {
        return;
      }
      attachSource();
      shell.classList.add('playing');
      started = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('playing');
          started = false;
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && started) {
        return;
      }
      if (!started) {
        start();
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('playing');
        started = true;
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('playing');
        }
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('playing');
        started = false;
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.video-shell[data-video]')).forEach(setupShell);
  });
})();
