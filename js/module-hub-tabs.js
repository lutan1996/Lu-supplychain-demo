/* 模块聚合页：页签切换 + URL ?tab=xxx
 * 部分聚合页已移除顶部页签条（.module-hub-tabs），仅通过侧栏带 ?tab= 进入子功能；
 * 此时仍须根据 URL 切换 .module-hub-panel，否则会一直显示默认 is-visible 面板。 */
(function () {
  function bindHubTabs(root) {
    root = root || document;
    var bar = root.querySelector(".module-hub-tabs");
    var panels = root.querySelectorAll(".module-hub-panel");
    if (!panels.length) return;

    var tabs = bar ? bar.querySelectorAll("[data-tab]") : [];

    function panelExists(id) {
      return !!root.querySelector('.module-hub-panel[data-panel="' + id + '"]');
    }

    function activate(id) {
      if (tabs.length) {
        tabs.forEach(function (b) {
          b.classList.toggle("is-active", b.getAttribute("data-tab") === id);
        });
      }
      panels.forEach(function (p) {
        p.classList.toggle("is-visible", p.getAttribute("data-panel") === id);
      });
    }

    if (tabs.length) {
      tabs.forEach(function (btn) {
        btn.addEventListener("click", function () {
          activate(btn.getAttribute("data-tab"));
        });
      });
    }

    function readTabFromEnv() {
      var t = null;
      try {
        t = new URLSearchParams(window.location.search).get("tab");
      } catch (e) {}
      if (t === "flow-exec") return "flow";
      if (t) return t;
      /* 绩效考核聚合：tab 丢失时仍可从 pageSub 区分「登录频次」与「流程频次」 */
      try {
        var spPs = new URLSearchParams(window.location.search);
        var pageSub = (spPs.get("pageSub") || "").trim();
        if (
          pageSub === "流程频次统计" ||
          pageSub === "KPI考核" ||
          pageSub === "考核规则"
        ) {
          return "flow";
        }
        if (pageSub === "登录频次统计" || pageSub === "绩效看板") {
          return "login";
        }
      } catch (ePs) {}
      /* 离线总演示：iframe srcdoc 无 query，父壳把 ?tab= 写在 iframe.name（见 build_demo_single_html.py assignIframeHtml） */
      try {
        var n = window.name || "";
        if (n) t = new URLSearchParams(n).get("tab");
      } catch (e2) {}
      if (t) return t;
      /* 绩效考核聚合页：侧栏 / 门户跳转写入 sessionStorage（与物资采购 demoPurchaseTab 同理） */
      try {
        var hasPerf =
          root.querySelector('.module-hub-panel[data-panel="login"]') &&
          root.querySelector('.module-hub-panel[data-panel="flow"]');
        if (hasPerf) {
          var st = sessionStorage.getItem("demoPerformanceTab");
          if (st === "flow-exec") return "flow";
          if (st === "flow" || st === "login") return st;
        }
      } catch (e3) {}
      try {
        var hasPm =
          root.querySelector('.module-hub-panel[data-panel="p1"]') &&
          root.querySelector('.module-hub-panel[data-panel="p6"]');
        if (hasPm) {
          var pmt = sessionStorage.getItem("demoPurchaseMgmtTab");
          if (/^p(10|[1-9])$/.test(pmt)) return pmt;
        }
      } catch (e3b) {}
      return null;
    }

    var want = readTabFromEnv();
    if (want && panelExists(want)) {
      activate(want);
      try {
        if (
          (want === "flow" || want === "login") &&
          root.querySelector('.module-hub-panel[data-panel="login"]') &&
          root.querySelector('.module-hub-panel[data-panel="flow"]')
        ) {
          sessionStorage.setItem("demoPerformanceTab", want);
        }
      } catch (e4) {}
      try {
        if (
          /^p(10|[1-9])$/.test(want) &&
          root.querySelector('.module-hub-panel[data-panel="p1"]') &&
          root.querySelector('.module-hub-panel[data-panel="p6"]')
        ) {
          sessionStorage.setItem("demoPurchaseMgmtTab", want);
        }
      } catch (e4b) {}
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindHubTabs();
    });
  } else {
    bindHubTabs();
  }
})();
