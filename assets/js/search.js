// 站內搜尋 —— 僅在輸入符合特定關鍵字時才會顯示結果，其餘一律顯示「查無資料」。
// 這是刻意設計：一般的商品/頁面關鍵字只是讓搜尋「看起來」是正常功能，
// 之後要加入的謎題專用關鍵字，直接往 SEARCH_INDEX 陣列新增項目即可。
//
// 搜尋框常駐在每一頁的 header/topbar，輸入後結果直接以下拉面板顯示在原地，
// 不會另外跳轉到一個獨立的搜尋頁面。url 一律寫成「專案根目錄」的相對路徑
// （例如 "shop/products/vinyl.html"），實際連結會依當頁的 data-depth 換算前綴。
(function () {
  var SEARCH_INDEX = [
    {
      keywords: ["黑膠", "vinyl", "lp"],
      title: "黑膠唱片分類",
      url: "shop/products/vinyl.html",
      desc: "瀏覽本店現有的黑膠唱片庫存與新到貨品項。",
      tag: "線上購物"
    },
    {
      keywords: ["cd", "雷射唱片"],
      title: "CD 分類",
      url: "shop/products/cd.html",
      desc: "各類 CD 專輯、精選輯與獨立廠牌發行。",
      tag: "線上購物"
    },
    {
      keywords: ["錄音帶", "卡帶", "cassette"],
      title: "錄音帶分類",
      url: "shop/products/cassette.html",
      desc: "復刻與二手錄音帶，附播放狀況說明。",
      tag: "線上購物"
    },
    {
      keywords: ["錄影帶", "vhs"],
      title: "錄影帶分類",
      url: "shop/products/videotape.html",
      desc: "音樂會現場錄影、MV 合輯等錄影帶收藏。",
      tag: "線上購物"
    },
    {
      keywords: ["dvd"],
      title: "DVD 分類",
      url: "shop/products/dvd.html",
      desc: "演唱會實況、紀錄片與音樂電影 DVD。",
      tag: "線上購物"
    },
    {
      keywords: ["bd", "藍光", "blu-ray", "bluray"],
      title: "BD 藍光分類",
      url: "shop/products/bd.html",
      desc: "高畫質演唱會與紀錄片藍光片源。",
      tag: "線上購物"
    },
    {
      keywords: ["周邊", "goods", "商品"],
      title: "周邊商品",
      url: "shop/products/goods.html",
      desc: "海報、提袋、徽章等唱片行自製周邊。",
      tag: "線上購物"
    },
    {
      keywords: ["營業時間", "地址", "怎麼去", "交通"],
      title: "關於我們",
      url: "shop/about.html",
      desc: "店鋪位置、營業時間與品牌故事。",
      tag: "資訊"
    },
    {
      keywords: ["收購", "維修", "修復", "訂購", "代購", "試聽"],
      title: "提供服務",
      url: "shop/services.html",
      desc: "黑膠試聽、老件收購、代購與修復等服務項目。",
      tag: "資訊"
    },
    {
      keywords: ["20250307"],
      title: "德斯伯爵莊園 劇本",
      url: "shop/products/manor-script.html",
      desc: "一份不在任何分類目錄裡的劇本。",
      tag: "？"
    }
  ];

  function normalize(str) {
    return (str || "").trim().toLowerCase();
  }

  function findResults(query) {
    var q = normalize(query);
    if (!q) return [];
    return SEARCH_INDEX.filter(function (entry) {
      return entry.keywords.some(function (k) {
        return k === q || q.includes(k) || k.includes(q);
      });
    });
  }

  function siteRoot() {
    return document.body.dataset.depth === "1" ? "../../" : "../";
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".search-dropdown.open").forEach(function (el) {
      el.classList.remove("open");
    });
  }

  function initSearchBox(box) {
    var form = box.querySelector("form");
    var input = box.querySelector("input[type=search]");
    if (!form || !input) return;

    var dropdown = document.createElement("div");
    dropdown.className = "search-dropdown";
    box.appendChild(dropdown);

    function render() {
      var q = input.value;
      if (!q.trim()) {
        dropdown.classList.remove("open");
        dropdown.innerHTML = "";
        return;
      }

      var results = findResults(q);
      var root = siteRoot();

      if (results.length === 0) {
        dropdown.innerHTML = '<div class="search-dropdown-empty">「' + q.trim() + '」查無相關資料</div>';
      } else {
        dropdown.innerHTML = results.map(function (r) {
          return (
            '<a class="search-dropdown-item" href="' + root + r.url + '">' +
              '<span class="tag">' + r.tag + '</span>' +
              '<span class="title">' + r.title + '</span>' +
              '<span class="desc">' + r.desc + '</span>' +
            '</a>'
          );
        }).join("");
      }
      closeAllDropdowns();
      dropdown.classList.add("open");
    }

    input.addEventListener("input", render);
    input.addEventListener("focus", function () {
      if (input.value.trim()) render();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdown.classList.remove("open");
        input.blur();
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });

    document.addEventListener("click", function (e) {
      if (!box.contains(e.target)) {
        dropdown.classList.remove("open");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".search-box").forEach(initSearchBox);
  });
})();
