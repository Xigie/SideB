// 回憶留言板 —— 需要先登入才能留言，也能在每則留言底下回覆別人（用登入身份，沒有暱稱欄位）。
// 送出後存在自己瀏覽器的 localStorage。
// SEED_MEMORIES（每頁自己內嵌的資料）是隨網站一起發布的「官方」留言，所有人都看得到，
// 之後要埋新的線索，直接往該頁面的 SEED_MEMORIES 陣列新增一筆即可（記得給不重複的 id）。
(function () {
  var POSTS_KEY = "sidebGuestbookPosts";
  var REPLIES_KEY = "sidebGuestbookReplies";

  function loadLocalPosts() {
    try {
      return JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalPosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }

  function loadReplies() {
    try {
      return JSON.parse(localStorage.getItem(REPLIES_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveReply(reply) {
    var all = loadReplies();
    all.push(reply);
    localStorage.setItem(REPLIES_KEY, JSON.stringify(all));
  }

  function repliesFor(postId) {
    return loadReplies().filter(function (r) { return r.postId === postId; });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function nowStamp() {
    var d = new Date();
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function uid() {
    return "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  }

  window.GuestbookApp = {
    init: function (config) {
      var listEl = document.querySelector(config.listSelector);
      var form = document.querySelector(config.formSelector);
      var seed = config.seed || [];
      var openReplyFor = null;

      var loggedInName = (window.SideBStaffData && SideBStaffData.isLoggedIn())
        ? SideBStaffData.currentProfile().displayName
        : null;

      var identityEl = form.querySelector("[data-identity]");
      if (identityEl) {
        identityEl.textContent = loggedInName
          ? "以「" + loggedInName + "」的身份留言"
          : "登入後才能留言";
      }

      function promptLogin() {
        var goLogin = window.confirm("留言前要先登入，要現在去登入嗎？");
        if (goLogin) {
          var ret = encodeURIComponent(window.location.pathname);
          window.location.href = "../staff/login.html?return=" + ret;
        }
      }

      function renderReply(r) {
        return (
          '<div class="guestbook-reply">' +
            '<span class="guestbook-reply-name">' + escapeHtml(r.name || "匿名") + '</span>' +
            '<span class="guestbook-reply-time">' + escapeHtml(r.time) + '</span>' +
            '<p class="guestbook-reply-text">' + escapeHtml(r.text) + '</p>' +
          '</div>'
        );
      }

      function replyToggleRow(postId) {
        if (openReplyFor !== postId) {
          return '<button type="button" class="btn-guestbook-reply" data-reply-toggle="' + postId + '">↩ 回覆</button>';
        }
        return (
          '<div class="guestbook-reply-form">' +
            '<div class="hint">以「' + escapeHtml(loggedInName) + '」的身份回覆</div>' +
            '<textarea class="reply-text-input" placeholder="回覆這則留言…"></textarea>' +
            '<div class="guestbook-reply-actions">' +
              '<button type="button" class="btn-reply-cancel" data-reply-cancel="' + postId + '">取消</button>' +
              '<button type="button" class="btn-reply-send" data-reply-send="' + postId + '">送出</button>' +
            '</div>' +
          '</div>'
        );
      }

      function renderPost(p) {
        var replies = repliesFor(p.id);
        return (
          '<div class="guestbook-post">' +
            '<div class="guestbook-post-head">' +
              '<div class="guestbook-avatar">' + escapeHtml((p.name || "匿").charAt(0)) + '</div>' +
              '<div>' +
                '<div class="guestbook-name">' + escapeHtml(p.name || "匿名") + '</div>' +
                '<div class="guestbook-time">' + escapeHtml(p.time || "") + '</div>' +
              '</div>' +
            '</div>' +
            '<p class="guestbook-text">' + escapeHtml(p.text) + '</p>' +
            (p.photo ? '<img class="guestbook-photo" src="' + escapeHtml(p.photo) + '" alt="" loading="lazy" />' : '') +
            (replies.length ? '<div class="guestbook-replies">' + replies.map(renderReply).join("") + '</div>' : '') +
            '<div class="guestbook-reply-row">' + replyToggleRow(p.id) + '</div>' +
          '</div>'
        );
      }

      function render() {
        var posts = loadLocalPosts().concat(seed);
        listEl.innerHTML = posts.length
          ? posts.map(renderPost).join("")
          : '<div class="guestbook-empty">還沒有人留言，當第一個留言的人吧。</div>';
      }

      listEl.addEventListener("click", function (e) {
        var toggleBtn = e.target.closest("[data-reply-toggle]");
        if (toggleBtn) {
          if (!loggedInName) {
            promptLogin();
            return;
          }
          openReplyFor = toggleBtn.getAttribute("data-reply-toggle");
          render();
          return;
        }

        var cancelBtn = e.target.closest("[data-reply-cancel]");
        if (cancelBtn) {
          openReplyFor = null;
          render();
          return;
        }

        var sendBtn = e.target.closest("[data-reply-send]");
        if (sendBtn) {
          var postId = sendBtn.getAttribute("data-reply-send");
          var wrap = sendBtn.closest(".guestbook-reply-form");
          var textInput = wrap.querySelector(".reply-text-input");
          var text = textInput.value.trim();
          if (!text) {
            textInput.focus();
            return;
          }
          saveReply({
            postId: postId,
            name: loggedInName,
            text: text,
            time: nowStamp()
          });
          openReplyFor = null;
          render();
        }
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!loggedInName) {
          promptLogin();
          return;
        }
        var textEl = form.querySelector('[name="text"]');
        var photoEl = form.querySelector('[name="photo"]');

        var text = textEl.value.trim();
        if (!text) {
          textEl.focus();
          return;
        }

        var local = loadLocalPosts();
        local.unshift({
          id: uid(),
          name: loggedInName,
          text: text,
          photo: photoEl && photoEl.value.trim() ? photoEl.value.trim() : null,
          time: nowStamp()
        });
        saveLocalPosts(local);
        form.reset();
        render();
      });

      render();
    }
  };
})();
