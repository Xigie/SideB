// 顧客名冊資料 —— 彙整自送貨紀錄與客服信箱裡出現過的顧客。
// 純展示用的靜態清單，用戶管理頁面會拿這份資料渲染「顧客」區塊。
(function () {
  var CUSTOMERS = [
    {
      name: "王先生",
      phone: "0921-XXX-101",
      email: "wang.customer@mail.com",
      address: "台北市大安區敦化南路一段 XX 號 3 樓",
      note: "訂購過《谷底》黑膠（ORD-2607190），近期來信詢問是否還有現貨。"
    },
    {
      name: "林小姐",
      phone: "0955-XXX-182",
      email: "lin.hsiaojie@mail.com",
      address: "新北市板橋區文化路二段 XX 號 5 樓",
      note: "訂單 ORD-2607181 已送達，來信詢問徽章是否有其他款式。"
    },
    {
      name: "Y. Huang",
      phone: "0966-XXX-183",
      email: "y.huang@mail.com",
      address: "台中市西屯區台灣大道三段 XX 號",
      note: "訂購限量彩膠《頻率外》（ORD-2607182），目前配送中。"
    },
    {
      name: "陳同學",
      phone: "0988-XXX-160",
      email: "chen.student@mail.com",
      address: "台北市文山區木柵路一段 XX 號",
      note: "訂購卡帶《零點過後》（ORD-2607160），已送達。"
    },
    {
      name: "徐小姐",
      phone: "0912-XXX-150",
      email: "hsu.customer@mail.com",
      address: "高雄市左營區博愛二路 XX 號（樓層未填，待補）",
      note: "訂單 ORD-2607150 因地址不完整配送異常，已聯繫補件中。"
    },
    {
      name: "匿名客人",
      phone: null,
      email: "unknown@mail.com",
      address: null,
      note: "來信詢問老件收購（附照片），尚未到店估價。"
    }
  ];

  window.EchoCustomerData = {
    customers: CUSTOMERS
  };
})();
