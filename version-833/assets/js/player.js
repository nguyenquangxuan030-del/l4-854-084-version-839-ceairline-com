(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function ensureHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
      .then(function () {
        return window.Hls;
      })
      .catch(function () {
        return loadScript('https://unpkg.com/hls.js@1/dist/hls.min.js').then(function () {
          return window.Hls;
        });
      });
  }

  ready(function () {
    document.querySelectorAll('.video-frame').forEach(function (frame) {
      var video = frame.querySelector('.video-player');
      var playButton = frame.querySelector('.video-overlay-play');
      var status = frame.querySelector('.player-status');
      var source = video ? video.getAttribute('data-src') : '';
      var hlsInstance = null;
      var initialized = false;

      function showStatus(message) {
        if (!status) {
          return;
        }

        status.textContent = message;
        status.hidden = false;
      }

      function hideStatus() {
        if (status) {
          status.hidden = true;
        }
      }

      function bindNativeSource() {
        video.src = source;
        initialized = true;
        hideStatus();
        return Promise.resolve();
      }

      function bindHlsSource() {
        return ensureHls().then(function (Hls) {
          if (!Hls || !Hls.isSupported()) {
            throw new Error('HLS_NOT_SUPPORTED');
          }

          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showStatus('视频加载失败，请稍后重试。');
            }
          });

          initialized = true;
          hideStatus();
        });
      }

      function initialize() {
        if (!video || !source) {
          showStatus('当前视频源不可用。');
          return Promise.reject(new Error('MISSING_SOURCE'));
        }

        if (initialized) {
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          return bindNativeSource();
        }

        return bindHlsSource().catch(function () {
          showStatus('当前浏览器暂不支持 HLS 播放，请更换浏览器后重试。');
        });
      }

      function playVideo() {
        initialize().then(function () {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              showStatus('请再次点击播放按钮开始播放。');
            });
          }
        });
      }

      if (playButton) {
        playButton.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          if (playButton) {
            playButton.classList.add('is-hidden');
          }
          hideStatus();
        });

        video.addEventListener('pause', function () {
          if (playButton && video.currentTime === 0) {
            playButton.classList.remove('is-hidden');
          }
        });

        video.addEventListener('ended', function () {
          if (playButton) {
            playButton.classList.remove('is-hidden');
          }
        });

        video.addEventListener('error', function () {
          showStatus('视频加载失败，请稍后重试。');
        });

        initialize();
      }

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
