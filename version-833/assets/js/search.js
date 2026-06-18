(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card movie-card-medium">',
      '  <a class="poster-wrap" href="' + escapeHtml(movie.file) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="hover-play" aria-hidden="true">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.one_line || movie.summary || '') + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '    </div>',
      '    <div class="card-tags">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('searchInput');
    var summary = document.getElementById('searchSummary');
    var results = document.getElementById('searchResults');
    var query = getQuery();
    var movies = window.SEARCH_MOVIES || [];

    if (input) {
      input.value = query;
    }

    if (!query) {
      if (summary) {
        summary.textContent = '请输入关键词开始检索。';
      }
      return;
    }

    var q = normalize(query);
    var matched = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.category,
        movie.type,
        movie.year,
        movie.genre,
        movie.one_line,
        movie.summary,
        (movie.tags || []).join(' ')
      ].map(normalize).join(' ');

      return haystack.indexOf(q) !== -1;
    });

    if (summary) {
      summary.textContent = matched.length ? '已找到相关影片：' + query : '未找到相关内容：' + query;
    }

    if (results) {
      results.innerHTML = matched.slice(0, 200).map(card).join('\n');
    }

    document.querySelectorAll('#searchResults img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  });
})();
