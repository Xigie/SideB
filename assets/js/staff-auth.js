// 員工系統假登入邏輯 —— 僅用 sessionStorage 做前端擋門，非真正的身分驗證。
// 帳號資料來自 staff-data.js 的 EchoStaffData。
(function () {
  var AUTH_KEY = "echoStaffAuth";

  function isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  }

  function login(username) {
    sessionStorage.setItem(AUTH_KEY, "1");
    EchoStaffData.setCurrentUsername(username);
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem("sidebStaffUser");
  }

  function fillWhoami() {
    var profile = EchoStaffData.currentProfile();
    document.querySelectorAll(".whoami").forEach(function (el) {
      el.textContent = profile.displayName + "・" + profile.roleShort;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
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
          window.location.href = "index.html";
        } else {
          errorEl.classList.add("show");
        }
      });
      return;
    }

    if (document.body.dataset.staffGuard === "true") {
      if (!isLoggedIn()) {
        window.location.href = pathToLogin();
        return;
      }
      fillWhoami();
      document.querySelectorAll("[data-logout]").forEach(function (el) {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          logout();
          window.location.href = pathToLogin();
        });
      });
    }
  });

  function pathToLogin() {
    var depth = document.body.dataset.depth || "0";
    return depth === "1" ? "../login.html" : "login.html";
  }
})();
