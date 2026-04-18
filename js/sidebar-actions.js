/**
 * 左侧栏蓝色二级菜单 data-action → 页面路径（与子页 subpage-clock.js、驾驶舱、仓库页共用）
 */
(function (global) {
  var SIDEBAR_ACTION_HREF = {
    // 我的资产
    "asset-personal": "assets-personal.html",
    "asset-dept": "assets-department.html",
    "asset-company": "assets-company.html",
    "asset-transfer-manage": "asset-transfer-management.html",
    "asset-nature-change-manage": "asset-nature-change-management.html",
    "asset-inventory-manage": "asset-inventory-management.html",
    // 我的任务 → 独立任务中心（?tab= 与蓝框子项一致）
    "task-center": "my-tasks-prototype-list.html?scene=todo",
    "task-approval": "my-tasks-prototype-list.html?scene=todo",
    "task-mine": "my-tasks-prototype-list.html?scene=initiated",
    "task-track": "my-tasks-prototype-list.html?scene=todo",
    "task-initiated": "index-portal-screen-alt.html#bizTasks=initiated",
    "task-todo": "index-portal-screen-alt.html#bizTasks=todo",
    "task-done": "index-portal-screen-alt.html#bizTasks=done",
    "task-cc": "index-portal-screen-alt.html#bizTasks=cc",
    "home-portal": "index-portal-screen-alt.html",
    "home-system": "index-portal-screen-alt.html",
    // 驾驶舱：统一单页 cockpit.html（集团/省级/首页入口都指向此页）
    "go-cockpit": "cockpit.html",
    "go-cockpit-copy": "cockpit.html",
    "go-app-hub": "index-portal-screen-alt.html",
    "go-cockpit-kpi": "cockpit.html",
    "go-cockpit-map": "cockpit.html",
    "cockpit-material-map": "cockpit.html#cockpit-anchor-material-map",
    "cockpit-trend-line": "cockpit.html#cockpit-anchor-trend-line",
    "cockpit-bar-chart": "cockpit.html#cockpit-anchor-bar-chart",
    "logistics-integration": "logistics-tracking.html",
    "purchase-accept-confirm": "receipt-inbound.html",
    // 物资采购（侧栏「物资采购」）
    "purchase-plan-manage": "purchase-plan-management.html",
    "purchase-plan-table": "purchase-plan-table.html",
    "purchase-order-demand": "order-demand-management.html",
    "purchase-sourcing": "material-procurement-hub.html?tab=m4",
    "purchase-contract-mgmt": "contract-management.html",
    "purchase-bid": "material-procurement-hub.html?tab=m7",
    "purchase-pay": "material-procurement-hub.html?tab=m8",
    "purchase-return-exchange": "material-procurement-hub.html?tab=m9",
    "purchase-quality-accept": "material-procurement-hub.html?tab=m10",
    "purchase-material-info-manage": "purchase-material-info-management.html",
    "purchase-supplier": "material-procurement-hub.html?tab=m5",
    "purchase-order": "order-demand-management.html",
    // 采购管理（侧栏「采购管理」）— 与物资采购子菜单一致，进入聚合页仅展示对应区块
    "purchase-apply": "material-procurement-hub.html?tab=m2",
    "purchase-nonbid-review": "purchase-pm-nonbid.html",
    "purchase-plan-approval": "purchase-pm-plan.html",
    "purchase-longterm-use-approval": "purchase-pm-longterm-result.html",
    "purchase-reapply": "purchase-pm-repurchase.html",
    "purchase-file-review-minutes": "purchase-pm-minutes.html",
    "purchase-bid-committee-review": "purchase-pm-bid.html",
    "purchase-terminate-approval": "purchase-pm-terminate.html",
    "purchase-group-plan-approval": "purchase-pm-group-plan.html",
    "purchase-under15-review": "purchase-pm-under15.html",
    "purchase-monthly-bid-plan": "purchase-pm-monthly-bid.html",
    "purchase-monthly-nonbid-plan": "purchase-pm-monthly-nonbid.html",
    "purchase-result-notice-nonbid": "purchase-pm-notice-nonbid.html",
    "purchase-longterm-use-manage": "purchase-pm-longterm-use.html",
    "purchase-plan": "purchase-management-hub.html?tab=p6",
    "purchase-bid-pm": "purchase-management-hub.html?tab=p7",
    "purchase-order-pm": "purchase-management-hub.html?tab=p8",
    "purchase-supplier-pm": "purchase-management-hub.html?tab=p8",
    "purchase-contract": "contract-management.html",
    "purchase-receipt": "proc-acceptance-inbound.html",
    "purchase-settlement": "proc-use-approval.html",
    "proc-acceptance-inbound": "proc-acceptance-inbound.html",
    "proc-use-approval": "proc-use-approval.html",
    "proc-sales-contract": "proc-sales-contract.html",
    "proc-shipment": "proc-shipment.html",
    "proc-quality-accept": "proc-quality-accept.html",
    "proc-project-accept": "proc-project-accept.html",
    "purchase-data-maintain": "purchase-pm-data-maintain.html",
    "purchase-archive-catalog": "purchase-pm-archive.html",
    "material-catalog": "base-data-material-ledger.html",
    "material-price": "base-data-material-ledger.html",
    "material-ledger": "purchase-ledger.html?tab=material",
    "purchase-ledger": "purchase-ledger.html",
    "cargo-ledger": "purchase-ledger.html?tab=cargo",
    "purchase-summary-report": "purchase-summary-report.html",
    // 物流
    "logistics-carrier": "carrier-management.html",
    "logistics-contract": "logistics-contract.html",
    "logistics-track": "logistics-tracking.html",
    "logistics-pay": "logistics-payment.html",
    "logistics-waybill": "logistics-tracking.html",
    "logistics-sign": "logistics-tracking.html",
    "logistics-dispatch": "logistics-contract.html",
    "logistics-ledger": "logistics-ledger.html",
    // 仓储
    slot: "slot-management.html",
    receive: "receipt-inbound.html",
    scan: "scan-pick.html",
    "inventory-check": "inventory-check.html",
    stock: "inventory-management.html",
    maintenance: "warehouse-maintenance.html",
    idle: "idle-materials.html",
    warehouse: "warehouse.html",
    "warehouse-checkin": "receipt-inbound.html",
    "warehouse-checkout": "inventory-management.html",
    "warehouse-transfer": "inventory-management.html",
    "warehouse-stock-ledger": "warehouse-stock-ledger.html",
    "warehouse-io-ledger": "warehouse-io-ledger.html",
    // 退役及废旧
    "retired-apply-main": "retire-scrap-application.html",
    "retired-brand": "retired-prototype-list.html?scene=brand",
    "retired-model": "retired-prototype-list.html?scene=model",
    "retired-line": "retired-prototype-list.html?scene=line",
    "retired-wind": "retired-prototype-list.html?scene=wind",
    "retired-requisition": "retired-prototype-list.html?scene=requisition",
    "retired-project": "retired-prototype-list.html?scene=project",
    "retired-big-small-reuse": "big-small-reuse.html",
    "retired-transfer": "goods-transfer-out.html",
    // 绩效 / 公告 / 综合 / 数据
    "performance-board": "performance-hub.html?tab=login",
    "performance-kpi": "performance-hub.html?tab=flow",
    "performance-rule": "performance-hub.html?tab=flow",
    "performance-login-frequency": "performance-hub.html?tab=login",
    "performance-flow-frequency": "performance-hub.html?tab=flow",
    "notice-bid": "notice-bid-fixed.html",
    "notice-nonbid": "notice-prototype-list.html?scene=nonbid",
    "notice-system": "notice-hub.html?tab=nonbid",
    "notice-company": "notice-hub.html?tab=nonbid",
    "notice-policy": "notice-hub.html?tab=nonbid",
    "notice-training": "notice-hub.html?tab=nonbid",
    "notice-ops": "notice-hub.html?tab=nonbid",
    "biz-overview": "integrated-business-hub.html?tab=fin",
    "biz-center": "procurement-application.html",
    "biz-process": "integrated-business-hub.html?tab=flow",
    "biz-collab": "carrier-management.html",
    "biz-finance": "integrated-business-hub.html?tab=fin",
    "biz-repair": "integrated-business-hub.html?tab=rep",
    "biz-transfer": "integrated-business-hub.html?tab=adj",
    "biz-emergency": "integrated-business-hub.html?tab=emg",
    "biz-standard": "biz-standard-list.html",
    "biz-process-design": "integrated-business-hub.html?tab=flow",
    "biz-claim": "integrated-business-hub.html?tab=claim",
    "biz-domestic-substitute": "integrated-business-hub.html?tab=dom",
    "biz-expert": "integrated-business-hub.html?tab=exp",
    "data-ledger": "base-data-material-ledger.html",
    "data-stock": "inventory-management.html",
    "data-report": "subpage-template.html",
    "data-audit": "scrap-identification-approval.html",
    "data-master": "base-data-material-ledger.html",
    "data-quality": "asset-value-management.html",
    "data-base": "base-data-material-ledger.html",
    "data-supplier": "base-data-material-ledger.html?tab=supplier",
    "data-product": "base-data-material-ledger.html?tab=product",
    "data-personnel": "base-data-material-ledger.html?tab=personnel",
    "data-department": "base-data-material-ledger.html?tab=department",
    "data-company": "base-data-material-ledger.html?tab=company",
    "data-station": "base-data-material-ledger.html?tab=station",
    "data-dict": "base-data-material-ledger.html?tab=dict",
    "data-carrier": "base-data-material-ledger.html?tab=carrier",
    "data-rate-tax": "base-data-material-ledger.html?tab=rateTax",
    "data-code-rule": "base-data-material-ledger.html?tab=codeRule",
    "asset-ledger": "asset-ledger.html",
    "asset-value-manage": "asset-value-management.html",
    "asset-scrap-identify": "scrap-identification-approval.html",
    "tool-template": "devtools-prototype-list.html?scene=notFound404",
    "tool-demo": "demo-all-pages-interactive.html",
    "tool-api": "system-prototype-list.html?scene=client",
    "dev-admin-monitor": "devtools-prototype-list.html?scene=cacheMonitor",
    "dev-task-dispatch": "devtools-prototype-list.html?scene=pendingTask",
    "dev-plus-home": "devtools-prototype-list.html?scene=plusSite",
    "setting-profile": "index-portal-screen-alt.html",
    "setting-security": "index-portal-screen-alt.html",
    "setting-theme": "index-portal-screen-alt.html",
    "setting-login": "index-portal-screen-alt.html",
    "setting-password": "index-portal-screen-alt.html",
    "setting-user": "system-prototype-list.html?scene=user",
    "setting-department": "system-prototype-list.html?scene=dept",
    "setting-permission": "system-prototype-list.html?scene=post",
    "system-user": "system-prototype-list.html?scene=user",
    "system-role": "system-prototype-list.html?scene=role",
    "system-codegen": "system-prototype-list.html?scene=codegen",
    "system-menu": "system-prototype-list.html?scene=menu",
    "system-department": "system-prototype-list.html?scene=dept",
    "system-position": "system-prototype-list.html?scene=post",
    "system-dict": "system-prototype-list.html?scene=dict",
    "system-params": "system-prototype-list.html?scene=params",
    "system-notice": "system-prototype-list.html?scene=notice",
    "system-file": "system-prototype-list.html?scene=file",
    "system-client": "system-prototype-list.html?scene=client",
    "system-log": "system-prototype-list.html?scene=notice",
    "oa-integration": "oa-flow-center.html?tab=sso",
    "oa-flow-style": "oa-flow-center.html?tab=style",
    "flow-print-pdf": "oa-flow-center.html?tab=print",
    "flow-return-withdraw": "oa-flow-center.html?tab=return",
    "flow-notify": "oa-flow-center.html?tab=notify",
    "finance-export": "oa-flow-center.html?tab=export",
    "dev-online-user": "devtools-prototype-list.html?scene=onlineUser",
    "dev-tenant": "devtools-prototype-list.html?scene=tenant",
    "dev-tenant-package": "devtools-prototype-list.html?scene=tenantPackage",
    "dev-model-manage": "devtools-prototype-list.html?scene=modelManage",
    "dev-process-define": "devtools-prototype-list.html?scene=processDefine",
    "dev-test-form": "devtools-prototype-list.html?scene=testForm",
    "dev-test-tree": "devtools-prototype-list.html?scene=testTree",
    "dev-flow-category": "devtools-prototype-list.html?scene=flowCategory",
    "dev-leave": "devtools-prototype-list.html?scene=leave",
    "dev-flow-instance": "devtools-prototype-list.html?scene=flowInstance",
    "dev-pending-task": "devtools-prototype-list.html?scene=pendingTask",
    "dev-cache-monitor": "devtools-prototype-list.html?scene=cacheMonitor",
    "dev-form-manage": "devtools-prototype-list.html?scene=formManage",
  };

  global.SIDEBAR_ACTION_HREF = SIDEBAR_ACTION_HREF;

  function appendPageSub(href, label) {
    if (!href || !label) return href;
    var s = String(href);
    var hashIdx = s.indexOf("#");
    var base = hashIdx >= 0 ? s.slice(0, hashIdx) : s;
    var frag = hashIdx >= 0 ? s.slice(hashIdx) : "";
    var sep = base.indexOf("?") >= 0 ? "&" : "?";
    return base + sep + "pageSub=" + encodeURIComponent(label) + frag;
  }

  function sceneFromRetiredAction(action) {
    var map = {
      "retired-brand": "brand",
      "retired-model": "model",
      "retired-line": "line",
      "retired-wind": "wind",
      "retired-requisition": "requisition",
      "retired-project": "project"
    };
    return map[action] || "";
  }

  function sceneFromSystemAction(action) {
    var map = {
      "setting-user": "user",
      "setting-department": "dept",
      "setting-permission": "post",
      "system-user": "user",
      "system-role": "role",
      "system-codegen": "codegen",
      "system-menu": "menu",
      "system-department": "dept",
      "system-position": "post",
      "system-dict": "dict",
      "system-params": "params",
      "system-notice": "notice",
      "system-file": "file",
      "system-client": "client",
      "system-log": "notice"
    };
    return map[action] || "";
  }

  function sceneFromDevtoolsAction(action) {
    var map = {
      "dev-online-user": "onlineUser",
      "dev-tenant": "tenant",
      "dev-test-form": "testForm",
      "dev-test-tree": "testTree",
      "dev-flow-category": "flowCategory",
      "dev-leave": "leave",
      "dev-tenant-package": "tenantPackage",
      "dev-model-manage": "modelManage",
      "dev-process-define": "processDefine",
      "dev-flow-instance": "flowInstance",
      "dev-pending-task": "pendingTask",
      "dev-cache-monitor": "cacheMonitor",
      "dev-form-manage": "formManage"
    };
    return map[action] || "";
  }

  function sceneFromPurchaseAction(action) {
    var map = {
      "purchase-nonbid-review": "nonbid",
      "purchase-plan-approval": "plan",
      "purchase-longterm-use-approval": "longtermResult",
      "purchase-reapply": "repurchase",
      "purchase-file-review-minutes": "minutes",
      "purchase-bid-committee-review": "bid",
      "purchase-terminate-approval": "terminate",
      "purchase-group-plan-approval": "groupPlan",
      "purchase-under15-review": "under15",
      "purchase-monthly-bid-plan": "monthlyBid",
      "purchase-monthly-nonbid-plan": "monthlyNonbid",
      "purchase-result-notice-nonbid": "noticeNonbid",
      "purchase-data-maintain": "dataMaintain",
      "purchase-archive-catalog": "archive",
      "purchase-longterm-use-manage": "longtermUse"
    };
    return map[action] || "";
  }

  function tabFromMaterialPurchaseAction(action) {
    var map = {
      "purchase-plan-manage": "m1",
      "purchase-apply": "m2",
      "purchase-order-demand": "m3",
      "purchase-sourcing": "m4",
      "purchase-supplier": "m5",
      "purchase-bid": "m7",
      "purchase-pay": "m8",
      "purchase-return-exchange": "m9",
      "purchase-quality-accept": "m10",
      "purchase-order": "m3"
    };
    return map[action] || "";
  }

  /** 绩效考核聚合页 performance-hub.html：login / flow */
  function tabFromPerformanceAction(action) {
    var map = {
      "performance-board": "login",
      "performance-kpi": "flow",
      "performance-rule": "flow",
      "performance-login-frequency": "login",
      "performance-flow-frequency": "flow"
    };
    return map[action] || "";
  }

  /** 采购管理聚合页 purchase-management-hub.html：p1–p10 */
  function tabFromPurchaseMgmtAction(action) {
    var map = {
      "purchase-plan": "p6",
      "purchase-bid-pm": "p7",
      "purchase-order-pm": "p8",
      "purchase-supplier-pm": "p8",
      "purchase-contract": "p8",
      "purchase-receipt": "p9",
      "purchase-settlement": "p9"
    };
    return map[action] || "";
  }

  /** 离线总演示：iframe(blob) 与父页 file:// 常跨源，无法直接调 parent.__demoOpenPage，改由 postMessage 让壳切换 */
  function postMessageDemoNav(href) {
    try {
      if (window.self === window.top) return false;
      if (!window.parent || !window.parent.postMessage) return false;
      window.parent.postMessage({ type: "map-demo-nav", href: String(href) }, "*");
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * @param {string} action data-action 键名
   * @param {{ label?: string }} [ctx] 蓝框子功能文案，写入 URL pageSub 供目标页标题与 document.title 一致
   * @returns {boolean} 是否已跳转
   */
  function resolveDemoShell() {
    var shell = null;
    try {
      if (window.top && window.top !== window && typeof window.top.__demoOpenPage === "function") {
        shell = window.top;
      } else if (window.parent && window.parent !== window && typeof window.parent.__demoOpenPage === "function") {
        shell = window.parent;
      }
    } catch (err) {}
    return shell;
  }

  global.navigateBySidebarAction = function (action, ctx) {
    if (!action) return false;
    if (typeof window.orgCanNavigateAction === "function" && !window.orgCanNavigateAction(action)) {
      try {
        alert("当前角色无该功能权限，请切换角色后操作。");
      } catch (eAcl) {}
      return false;
    }
    var href = SIDEBAR_ACTION_HREF[action];
    if (href) {
      var performanceTab = "";
      // 兜底：先写入退役模块场景，避免离线演示壳丢 query 时退回到品牌页
      try {
        var retiredScene = sceneFromRetiredAction(action);
        if (retiredScene) {
          sessionStorage.setItem("demoRetiredScene", retiredScene);
          sessionStorage.setItem("demoScene", retiredScene);
        }
        var systemScene = sceneFromSystemAction(action);
        if (systemScene) {
          sessionStorage.setItem("demoSystemScene", systemScene);
          sessionStorage.setItem("demoScene", systemScene);
        }
        var purchaseScene = sceneFromPurchaseAction(action);
        if (purchaseScene) {
          sessionStorage.setItem("demoPurchaseScene", purchaseScene);
          sessionStorage.setItem("demoScene", purchaseScene);
        }
        var purchaseTab = tabFromMaterialPurchaseAction(action);
        if (purchaseTab) {
          sessionStorage.setItem("demoPurchaseTab", purchaseTab);
        }
        performanceTab = tabFromPerformanceAction(action);
        if (performanceTab) {
          sessionStorage.setItem("demoPerformanceTab", performanceTab);
        }
        var purchaseMgmtTab = tabFromPurchaseMgmtAction(action);
        if (purchaseMgmtTab) {
          sessionStorage.setItem("demoPurchaseMgmtTab", purchaseMgmtTab);
        }
        var devtoolsScene = sceneFromDevtoolsAction(action);
        if (devtoolsScene) {
          sessionStorage.setItem("demoDevtoolsScene", devtoolsScene);
          sessionStorage.setItem("demoScene", devtoolsScene);
        }
      } catch (eStore) {}
      var label = ctx && ctx.label ? String(ctx.label).trim() : "";
      // 绩效考核页内二级菜单切换：同页直接切 panel，避免离线壳不重载导致仍停在登录频次
      if (performanceTab) {
        try {
          var hasPerfPanels =
            document.querySelector('.module-hub-panel[data-panel="login"]') &&
            document.querySelector('.module-hub-panel[data-panel="flow"]');
          if (hasPerfPanels) {
            sessionStorage.setItem("demoPerformanceTab", performanceTab);
            sessionStorage.setItem("demoTab", performanceTab);
            if (window.history && typeof window.history.replaceState === "function" && typeof URL !== "undefined") {
              var u = new URL(window.location.href);
              u.searchParams.set("tab", performanceTab);
              if (label) u.searchParams.set("pageSub", label);
              window.history.replaceState(null, "", u.toString());
            }
            try {
              window.dispatchEvent(
                new CustomEvent("demo-performance-tab-change", {
                  detail: { tab: performanceTab, label: label }
                })
              );
            } catch (eEvt) {}
            return true;
          }
        } catch (ePerf) {}
      }
      if (label) {
        href = appendPageSub(href, label);
      }
      var inIframe = false;
      try {
        inIframe = window.self !== window.top;
      } catch (e0) {
        inIframe = true;
      }

      /*
       * 离线总演示：iframe 内优先 postMessage 给父壳（map-demo-nav），
       * 避免 blob/file 跨源时无法调用 parent.__demoOpenPage，或误走 location.href 导致完全不跳转。
       */
      if (inIframe) {
        if (postMessageDemoNav(href)) return true;
        var shellIf = resolveDemoShell();
        if (shellIf) {
          var openedIf = shellIf.__demoOpenPage(href);
          if (openedIf === true) return true;
          if (openedIf === false) return false;
          return true;
        }
        return false;
      }

      var shell = resolveDemoShell();
      if (shell) {
        var opened = shell.__demoOpenPage(href);
        if (opened === true) return true;
        if (opened === false) return false;
        return true;
      }
      window.location.href = href;
      return true;
    }
    return false;
  };
})(typeof window !== "undefined" ? window : this);
