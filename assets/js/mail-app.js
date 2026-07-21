// 員工系統的電子郵件功能：清單/內容顯示、回覆撰寫、回覆紀錄（存在 localStorage，同瀏覽器下可跨頁面查看）。
(function () {
  var STORAGE_KEY = "sidebMailReplies";

  function loadReplies() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveReply(reply) {
    var all = loadReplies();
    all.push(reply);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all;
  }

  function repliesFor(mailbox, mailId) {
    return loadReplies().filter(function (r) {
      return r.mailbox === mailbox && String(r.mailId) === String(mailId);
    });
  }

  function nowStamp() {
    var d = new Date();
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var MailApp = {};

  // ---- 信箱頁面（work.html / service.html）----
  MailApp.initMailbox = function (config) {
    var listEl = document.querySelector(config.listSelector);
    var detailEl = document.querySelector(config.detailSelector);
    var mails = config.mails;
    var mailbox = config.mailbox;
    var staffName = config.staffFrom || "時音";
    var staffEmail = config.staffEmail || "shin.yin@sideb-records.com";
    var selectedId = null;
    var composeOpen = false;

    function renderList() {
      listEl.innerHTML = mails.map(function (m) {
        var replied = repliesFor(mailbox, m.id).length > 0;
        var classes = "list-item"
          + (m.unread ? " unread" : "")
          + (String(m.id) === String(selectedId) ? " selected" : "");
        return (
          '<div class="' + classes + '" data-id="' + m.id + '">' +
            '<div class="item-avatar">' + m.sender.charAt(0) + '</div>' +
            '<div class="item-main">' +
              '<div class="item-top"><span class="item-from">' + m.sender + '</span><span class="item-date">' + m.date + '</span></div>' +
              '<div class="item-title">' + m.subject + '</div>' +
              '<div class="item-preview">' + m.preview + '</div>' +
              (replied ? '<div class="item-badges"><span class="badge-replied">已回覆</span></div>' : '') +
            '</div>' +
          '</div>'
        );
      }).join("");

      listEl.querySelectorAll(".list-item").forEach(function (el) {
        el.addEventListener("click", function () {
          selectMail(el.dataset.id);
        });
      });
    }

    function replyMsgHtml(r) {
      return (
        '<div class="thread-msg outgoing">' +
          '<div class="msg-head">' +
            '<div class="msg-avatar">' + staffName.charAt(0) + '</div>' +
            '<div class="msg-head-main">' +
              '<div class="msg-from">' + staffName + '（你）<span class="msg-email">&lt;' + staffEmail + '&gt;</span></div>' +
            '</div>' +
            '<div class="msg-date">' + r.time + '</div>' +
          '</div>' +
          '<div class="msg-body">' + escapeHtml(r.body) + '</div>' +
        '</div>'
      );
    }

    function composeHtml(m) {
      if (!composeOpen) {
        return (
          '<div class="reply-toggle-row">' +
            '<button type="button" class="btn-reply-toggle" id="reply-toggle-btn">↩ 回覆</button>' +
          '</div>'
        );
      }
      return (
        '<div class="compose-card">' +
          '<div class="compose-row"><span class="compose-label">收件人</span><span>' + m.sender + ' &lt;' + m.email + '&gt;</span></div>' +
          '<div class="compose-row"><span class="compose-label">主旨</span><span>回覆：' + m.subject + '</span></div>' +
          '<textarea id="reply-textarea" placeholder="輸入回覆內容…"></textarea>' +
          '<div class="reply-actions">' +
            '<span class="reply-hint">⌘/Ctrl + Enter 送出</span>' +
            '<button type="button" class="btn-reply-cancel" id="reply-cancel-btn">取消</button>' +
            '<button type="button" class="btn-reply-send" id="reply-send-btn">送出</button>' +
          '</div>' +
        '</div>'
      );
    }

    function renderDetail(m) {
      var replies = repliesFor(mailbox, m.id);

      detailEl.innerHTML =
        '<h2 class="thread-subject">' + m.subject + '</h2>' +
        '<div class="thread-msg">' +
          '<div class="msg-head">' +
            '<div class="msg-avatar">' + m.sender.charAt(0) + '</div>' +
            '<div class="msg-head-main">' +
              '<div class="msg-from">' + m.sender + '<span class="msg-email">&lt;' + m.email + '&gt;</span></div>' +
              '<div class="msg-to">收件人：' + config.toAddr + '</div>' +
            '</div>' +
            '<div class="msg-date">' + m.fullDate + '</div>' +
          '</div>' +
          '<div class="msg-body">' + m.body.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>' +
        '</div>' +
        replies.map(replyMsgHtml).join('') +
        '<div id="compose-slot">' + composeHtml(m) + '</div>';

      bindComposeEvents(m);
    }

    function bindComposeEvents(m) {
      var toggleBtn = document.getElementById("reply-toggle-btn");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
          composeOpen = true;
          renderDetail(m);
          var ta = document.getElementById("reply-textarea");
          if (ta) ta.focus();
        });
      }

      var cancelBtn = document.getElementById("reply-cancel-btn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
          composeOpen = false;
          renderDetail(m);
        });
      }

      var sendBtn = document.getElementById("reply-send-btn");
      var textarea = document.getElementById("reply-textarea");
      if (sendBtn && textarea) {
        function send() {
          var text = textarea.value.trim();
          if (!text) {
            textarea.focus();
            return;
          }
          saveReply({
            mailbox: mailbox,
            mailId: m.id,
            mailSubject: m.subject,
            mailSender: m.sender,
            mailSenderEmail: m.email,
            body: text,
            time: nowStamp(),
            sentBy: (window.SideBStaffData && SideBStaffData.currentUsername()) || null
          });
          composeOpen = false;
          renderList();
          renderDetail(m);
        }

        sendBtn.addEventListener("click", send);
        textarea.addEventListener("keydown", function (e) {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            send();
          }
        });
      }
    }

    function selectMail(id) {
      selectedId = id;
      composeOpen = false;
      var mail = mails.filter(function (m) { return String(m.id) === String(id); })[0];
      if (!mail) return;
      mail.unread = false;
      renderList();
      renderDetail(mail);
      detailEl.scrollTop = 0;
    }

    renderList();
    detailEl.innerHTML = config.emptyHtml || '<div class="detail-empty">請從左側選擇一則查看內容</div>';

    var params = new URLSearchParams(window.location.search);
    var openId = params.get("open");
    if (openId) selectMail(openId);
  };

  // ---- 寄件備份頁面（sent.html）----
  MailApp.initSent = function (config) {
    var listEl = document.querySelector(config.listSelector);
    var detailEl = document.querySelector(config.detailSelector);
    var staffName = config.staffFrom || "時音";
    var staffEmail = config.staffEmail || "shin.yin@sideb-records.com";
    var currentUser = (window.SideBStaffData && SideBStaffData.currentUsername()) || null;
    var selectedIndex = null;

    function categoryLabel(mailbox) {
      return mailbox.indexOf("work") === 0 ? "工作內容" : "客服內容";
    }

    var all = loadReplies()
      .filter(function (r) { return r.sentBy === currentUser; })
      .reverse(); // 最新的在最前面

    function renderList() {
      if (all.length === 0) {
        listEl.innerHTML = '<div class="detail-empty">目前還沒有任何回覆紀錄</div>';
        return;
      }
      listEl.innerHTML = all.map(function (r, i) {
        var classes = "list-item" + (i === selectedIndex ? " selected" : "");
        return (
          '<div class="' + classes + '" data-i="' + i + '">' +
            '<div class="item-main">' +
              '<div class="item-top"><span class="item-from">' + categoryLabel(r.mailbox) + '</span><span class="item-date">' + r.time + '</span></div>' +
              '<div class="item-title">回覆：' + r.mailSubject + '</div>' +
              '<div class="item-preview">' + escapeHtml(r.body) + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join("");

      listEl.querySelectorAll(".list-item").forEach(function (el) {
        el.addEventListener("click", function () {
          selectReply(Number(el.dataset.i));
        });
      });
    }

    function selectReply(i) {
      selectedIndex = i;
      renderList();
      var r = all[i];
      detailEl.innerHTML =
        '<h2 class="thread-subject">回覆：' + r.mailSubject + '</h2>' +
        '<div class="sent-context">' +
          '<span class="label">信箱</span>' + categoryLabel(r.mailbox) + '　' +
          '<span class="label">原寄件人</span>' + r.mailSender + (r.mailSenderEmail ? ' &lt;' + r.mailSenderEmail + '&gt;' : '') +
        '</div>' +
        '<div class="thread-msg outgoing">' +
          '<div class="msg-head">' +
            '<div class="msg-avatar">' + staffName.charAt(0) + '</div>' +
            '<div class="msg-head-main">' +
              '<div class="msg-from">' + staffName + '（你）<span class="msg-email">&lt;' + staffEmail + '&gt;</span></div>' +
              '<div class="msg-to">收件人：' + r.mailSender + (r.mailSenderEmail ? ' &lt;' + r.mailSenderEmail + '&gt;' : '') + '</div>' +
            '</div>' +
            '<div class="msg-date">' + r.time + '</div>' +
          '</div>' +
          '<div class="msg-body">' + escapeHtml(r.body) + '</div>' +
        '</div>';
      detailEl.scrollTop = 0;
    }

    renderList();
    detailEl.innerHTML = config.emptyHtml || '<div class="detail-empty">選擇左側的紀錄以查看完整回覆內容</div>';
  };

  window.MailApp = MailApp;
})();
