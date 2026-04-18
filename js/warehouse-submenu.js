/**
 * 仓储管理：左侧「仓储管理」展开蓝色子菜单栏；与 warehouse.html 及各仓储子页共用。
 * 再次点击同一入口仅保持展开（不切换关闭），避免误以为「点不开」；点主内容区或 Esc 关闭。
 */
(function () {
  function init() {
    var navWarehouse = document.getElementById("navWarehouse");
    var panel = document.getElementById("warehouseSecondaryPanel");
    var mainScroll = document.querySelector(".main-scroll");
    var navCockpit = document.querySelector('[data-nav="cockpit"]');
    if (!navWarehouse || !panel) return;

    function clearNavHighlight() {
      document.querySelectorAll(".sidebar .nav-item").forEach(function (el) {
        el.classList.remove("active");
        el.classList.remove("nav-item--module-active");
      });
    }

    function highlightWarehouse() {
      clearNavHighlight();
      navWarehouse.classList.add("nav-item--module-active");
    }

    function openSubmenu() {
      highlightWarehouse();
      panel.removeAttribute("hidden");
      panel.hidden = false;
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
    }

    function closeSubmenu() {
      panel.classList.remove("is-open");
      panel.setAttribute("hidden", "");
      panel.hidden = true;
      panel.setAttribute("aria-hidden", "true");
    }

    navWarehouse.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSubmenu();
    });

    if (navCockpit) {
      navCockpit.addEventListener("click", function () {
        window.location.href = "cockpit.html";
      });
    }

    if (mainScroll) {
      mainScroll.addEventListener(
        "click",
        function () {
          if (panel.classList.contains("is-open")) closeSubmenu();
        },
        false
      );
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        closeSubmenu();
      }
    });

    panel.querySelectorAll(".warehouse-secondary-link[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var action = btn.getAttribute("data-action");
        var label = (btn.getAttribute("data-label") || "").trim() || (btn.textContent || "").trim();
        if (typeof window.navigateBySidebarAction === "function" && window.navigateBySidebarAction(action, { label: label })) {
          return;
        }
        alert("跳转未配置：" + label + "（" + action + "）");
        closeSubmenu();
        highlightWarehouse();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
