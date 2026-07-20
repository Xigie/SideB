// 官網共用導覽列互動（手機選單開關、下拉選單觸控支援）
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".mobile-nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  document.querySelectorAll(".nav-item.has-dropdown > a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });
});
