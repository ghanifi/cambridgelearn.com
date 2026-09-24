// Cambridge Learn — homepage blog feed. Fetches latest posts from the
// WordPress REST API and renders them. If the blog isn't reachable yet
// (e.g. the WordPress site hasn't been deployed), the section stays
// visible with a clear "coming soon" state rather than disappearing —
// a missing blog shouldn't look like a missing section.
(function () {
  "use strict";

  var FEED_URL = "https://blog.cambridgelearn.com/wp-json/wp/v2/posts?per_page=3&_embed";

  function getThumbnail(post) {
    try {
      var media = post._embedded["wp:featuredmedia"][0];
      return media.source_url;
    } catch (err) {
      return null;
    }
  }

  function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function renderPosts(posts, listEl) {
    listEl.innerHTML = "";

    posts.forEach(function (post) {
      var item = document.createElement("li");
      item.className = "blog-feed__card";

      var thumbnail = getThumbnail(post);
      if (thumbnail) {
        var img = document.createElement("img");
        img.src = thumbnail;
        img.alt = stripHtml(post.title.rendered);
        item.appendChild(img);
      }

      var body = document.createElement("div");
      body.className = "blog-feed__card-body";

      var heading = document.createElement("h3");
      var link = document.createElement("a");
      link.href = post.link;
      link.textContent = stripHtml(post.title.rendered);
      heading.appendChild(link);
      body.appendChild(heading);

      var excerpt = document.createElement("p");
      excerpt.textContent = stripHtml(post.excerpt.rendered);
      body.appendChild(excerpt);

      item.appendChild(body);
      listEl.appendChild(item);
    });
  }

  function showEmptyState(listEl) {
    listEl.innerHTML = "";
    var notice = document.createElement("li");
    notice.className = "blog-feed__empty";
    notice.innerHTML =
      "New guides and updates are on their way — check back soon, or " +
      '<a href="index.html#contact">get in touch</a> with any question in the meantime.';
    listEl.appendChild(notice);
  }

  function init() {
    var section = document.querySelector("[data-blog-feed]");
    if (!section) return;
    var listEl = section.querySelector("[data-blog-feed-list]");
    if (!listEl) return;

    fetch(FEED_URL)
      .then(function (response) {
        if (!response.ok) throw new Error("Blog feed request failed: " + response.status);
        return response.json();
      })
      .then(function (posts) {
        if (!Array.isArray(posts) || posts.length === 0) {
          showEmptyState(listEl);
          return;
        }
        renderPosts(posts, listEl);
      })
      .catch(function () {
        showEmptyState(listEl);
      });
  }

  document.addEventListener("DOMContentLoaded", init);

  window.CambridgeLearnBlogFeed = {
    getThumbnail: getThumbnail,
    stripHtml: stripHtml,
    renderPosts: renderPosts
  };
})();
