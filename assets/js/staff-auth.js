// 登入邏輯 —— 僅用 sessionStorage 做前端擋門，非真正的身分驗證。
// 帳號資料來自 staff-data.js 的 EchoStaffData。同一套登入狀態同時用在：
//   1. 員工系統（staff/*，data-staff-guard="true" 才需要登入）
//   2. 官網的購物與回憶留言板（shop/*，data-shop-guard="true" 才需要登入）
//   3. 官網 header 的登入狀態小工具（頁面上有 #auth-box 就會自動渲染）
(function () {
  var AUTH_KEY = "echoStaffAuth";

  function isLoggedIn() {
    return EchoStaffData.isLoggedIn();
  }

  function login(username) {
    sessionStorage.setItem(AUTH_KEY, "1");
    EchoStaffData.setCurrentUsername(username);
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem("sidebStaffUser");
  }

  // ---- 依目前頁面所在位置，算出到 staff/ 目錄的相對路徑 ----
  function areaRoot() {
    var depth = document.body.dataset.depth || "0";
    return depth === "1" ? "../../" : "../";
  }

  function loginPath() {
    if (document.body.dataset.area === "staff") {
      var depth = document.body.dataset.depth || "0";
      return depth === "1" ? "../login.html" : "login.html";
    }
    return areaRoot() + "staff/login.html";
  }

  function staffHomePath() {
    if (document.body.dataset.area === "staff") {
      var depth = document.body.dataset.depth || "0";
      return depth === "1" ? "../index.html" : "index.html";
    }
    return areaRoot() + "staff/index.html";
  }

  function redirectToLogin() {
    var ret = encodeURIComponent(window.location.pathname);
    window.location.href = loginPath() + "?return=" + ret;
  }

  function fillWhoami() {
    var profile = EchoStaffData.currentProfile();
    document.querySelectorAll(".whoami").forEach(function (el) {
      el.textContent = profile.displayName + "・" + profile.roleShort;
    });
  }

  // ---- 官網 header 的登入狀態小工具（#auth-box）----
  function renderAuthBox() {
    var box = document.getElementById("auth-box");
    if (!box) return;

    if (isLoggedIn()) {
      var profile = EchoStaffData.currentProfile();
      box.innerHTML =
        '<a href="' + staffHomePath() + '" class="auth-name">' + profile.displayName + '</a>' +
        '<a href="#" class="auth-logout" data-shop-logout>登出</a>';
      box.querySelector("[data-shop-logout]").addEventListener("click", function (e) {
        e.preventDefault();
        logout();
        window.location.reload();
      });
    } else {
      box.innerHTML = '<a href="' + loginPath() + '" class="auth-login">登入</a>';
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAuthBox();

    var page = document.body.dataset.page;

    if (page === "staff-login") {
      if (isLoggedIn()) {
        window.location.href = "index.html";
        return;
      }
      var form = document.getElementById("login-form");
      var errorEl = document.getElementById("login-error");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var user = document.getElementById("login-user").value.trim();
        var pass = document.getElementById("login-pass").value.trim();
        var matched = EchoStaffData.findByCredentials(user, pass);
        if (matched) {
          login(matched.username);
          var params = new URLSearchParams(window.location.search);
          var ret = params.get("return");
          window.location.href = ret ? decodeURIComponent(ret) : "index.html";
        } else {
          errorEl.classList.add("show");
        }
      });
      return;
    }

    if (document.body.dataset.staffGuard === "true" || document.body.dataset.shopGuard === "true") {
      if (!isLoggedIn()) {
        redirectToLogin();
        return;
      }
      fillWhoami();
      document.querySelectorAll("[data-logout]").forEach(function (el) {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          logout();
          window.location.href = loginPath();
        });
      });
    }
  });
})();
