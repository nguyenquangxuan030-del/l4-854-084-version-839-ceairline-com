function setupMoviePlayer(sourceUrl) {
  var video = document.querySelector("[data-player]");
  var overlay = document.querySelector("[data-play-overlay]");
  var hlsInstance = null;

  if (!video) {
    return;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function playVideo() {
    hideOverlay();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function() {});
    }
  }

  function attachSource() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.getAttribute("src") !== sourceUrl) {
        video.setAttribute("src", sourceUrl);
      }
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          playVideo();
        });
      } else {
        playVideo();
      }
      return;
    }

    if (video.getAttribute("src") !== sourceUrl) {
      video.setAttribute("src", sourceUrl);
    }
    playVideo();
  }

  if (overlay) {
    overlay.addEventListener("click", attachSource);
  }

  video.addEventListener("play", hideOverlay);
}
