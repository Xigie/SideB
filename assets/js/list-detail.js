// 共用的「清單 + 內容」互動元件，員工系統的電子郵件／工作日記／送貨紀錄都靠這個實作點擊查看細節。
// 使用方式：頁面準備好 items 陣列（每筆需有 id、listHtml、detailHtml，選填 unread），
// 再呼叫 ListDetailApp({ listSelector, detailSelector, items, emptyHtml })。
(function () {
  window.ListDetailApp = function (config) {
    var listEl = document.querySelector(config.listSelector);
    var detailEl = document.querySelector(config.detailSelector);
    var items = config.items || [];
    var selectedId = null;

    function renderList() {
      listEl.innerHTML = items.map(function (item) {
        var classes = "list-item"
          + (item.unread ? " unread" : "")
          + (String(item.id) === String(selectedId) ? " selected" : "");
        return '<div class="' + classes + '" data-id="' + item.id + '">' + item.listHtml + "</div>";
      }).join("");

      listEl.querySelectorAll(".list-item").forEach(function (el) {
        el.addEventListener("click", function () {
          selectItem(el.dataset.id);
        });
      });
    }

    function selectItem(id) {
      selectedId = id;
      var item = items.filter(function (i) { return String(i.id) === String(id); })[0];
      if (!item) return;
      item.unread = false;
      renderList();
      detailEl.innerHTML = item.detailHtml;
      detailEl.scrollTop = 0;
    }

    renderList();
    detailEl.innerHTML = config.emptyHtml || '<div class="detail-empty">請從左側選擇一則查看內容</div>';
  };
})();
