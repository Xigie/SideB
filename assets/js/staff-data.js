// 員工系統的帳號資料 —— 目前有兩位店員：時音、月詩。
// 其他腳本（staff-auth.js、mail-app.js、以及各頁面內嵌的 script）都透過 EchoStaffData 存取。
(function () {
  var AUTH_USER_KEY = "sidebStaffUser";
  var DEFAULT_USER = "staff";

  var USERS = {
    staff: {
      username: "staff",
      password: "echo2024",
      displayName: "時音",
      roleShort: "門市人員",
      roleDetail: "門市人員 · 商品組",
      employeeId: "ER-2024-001",
      joinDate: "2021 年 6 月 7 日",
      store: "SideB 唱片行 本店",
      duty: "商品上架、試聽區管理、櫃檯服務",
      phone: "0912-XXX-XXX",
      email: "shin.yin@sideb-records.com",
      avatarInitial: "時",
      emergencyName: "月詩",
      emergencyRelation: "家人",
      emergencyPhone: "0928-XXX-XXX"
    },
    tsukiuta: {
      username: "tsukiuta",
      password: "echo2024",
      displayName: "月詩",
      roleShort: "門市人員",
      roleDetail: "門市人員 · 客服組",
      employeeId: "ER-2024-010",
      joinDate: "2022 年 3 月 15 日",
      store: "SideB 唱片行 本店",
      duty: "客服信箱回覆、訂單問題處理、櫃檯服務",
      phone: "0928-XXX-XXX",
      email: "tsukiuta@sideb-records.com",
      avatarInitial: "月",
      emergencyName: "時音",
      emergencyRelation: "家人",
      emergencyPhone: "0912-XXX-XXX"
    }
  };

  function findByCredentials(username, password) {
    var u = USERS[username];
    if (u && u.password === password) return u;
    return null;
  }

  function currentUsername() {
    return sessionStorage.getItem(AUTH_USER_KEY) || DEFAULT_USER;
  }

  function currentProfile() {
    return USERS[currentUsername()] || USERS[DEFAULT_USER];
  }

  function setCurrentUsername(username) {
    sessionStorage.setItem(AUTH_USER_KEY, username);
  }

  function isLoggedIn() {
    return sessionStorage.getItem("echoStaffAuth") === "1";
  }

  window.EchoStaffData = {
    users: USERS,
    findByCredentials: findByCredentials,
    currentUsername: currentUsername,
    currentProfile: currentProfile,
    setCurrentUsername: setCurrentUsername,
    isLoggedIn: isLoggedIn
  };
})();
