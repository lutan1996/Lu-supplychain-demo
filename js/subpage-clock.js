/* 顶栏时间 + 子页面统一侧栏交互（蓝色展开框） */
(function () {
  var ORG_ROLE_CATALOG = [
    { id: "director_feng", title: "董事", person: "冯江哲", dept: "董事会", modules: "all", assetScope: "global" },
    { id: "gm_zeng", title: "总经理", person: "曾繁礼", dept: "总经办", modules: "all", assetScope: "global" },
    { id: "leader_supervisor", title: "主管领导", person: "主管领导", dept: "分管条线", modules: ["asset", "purchaseMgmt", "logistics", "warehouse", "retired", "performance", "data", "notice", "biz"], assetScope: "dept" },
    { id: "dept_head", title: "部门主管", person: "部门主管", dept: "所属部门", modules: ["asset", "purchaseMgmt", "logistics", "warehouse", "retired", "performance", "data", "notice", "biz"], assetScope: "dept" },
    { id: "dept_asset_specialist", title: "部门资产专责", person: "部门资产专责", dept: "所属部门", modules: ["asset", "task", "data"], assetScope: "dept" },
    { id: "dept_material_specialist", title: "部门物资专责", person: "部门物资专责", dept: "所属部门", modules: ["warehouse", "retired", "logistics", "task", "data"], assetScope: "none" },
    { id: "corp_asset_head", title: "公司资产主管", person: "王超", dept: "公司资产管理", modules: ["asset", "task", "data", "performance"], assetScope: "global" },
    { id: "corp_material_head", title: "公司物资主管", person: "王超", dept: "公司物资管理", modules: ["warehouse", "retired", "logistics", "task", "data"], assetScope: "none" },
    { id: "corp_purchase_head", title: "公司采购主管", person: "王超", dept: "公司采购管理", modules: ["purchaseMgmt", "task", "data", "performance"], assetScope: "none" },
    { id: "corp_asset_specialist", title: "公司资产专责", person: "宋中波", dept: "公司资产管理", modules: ["asset", "task", "data"], assetScope: "global" },
    { id: "corp_material_specialist", title: "公司物资专责", person: "宋中波", dept: "公司物资管理", modules: ["warehouse", "retired", "logistics", "task", "data"], assetScope: "none" },
    { id: "corp_purchase_specialist", title: "公司采购专责", person: "王卿明", dept: "公司采购管理", modules: ["purchaseMgmt", "task", "data"], assetScope: "none" },
    { id: "value_leader", title: "价值管理主管领导", person: "刘静", dept: "价值管理中心", modules: ["asset", "warehouse", "retired", "data", "performance", "task"], assetScope: "global" },
    { id: "value_dept_head", title: "价值管理部门主管", person: "孙睿", dept: "价值管理中心", modules: ["asset", "warehouse", "retired", "data", "performance", "task"], assetScope: "global" },
    { id: "value_asset_specialist", title: "价值管理资产专责", person: "杨国卿", dept: "价值管理中心", modules: ["asset", "data", "task"], assetScope: "global" },
    { id: "value_material_specialist", title: "价值管理物资专责", person: "杜欣鑫", dept: "价值管理中心", modules: ["warehouse", "retired", "data", "task"], assetScope: "none" },
    { id: "scrap_specialist", title: "公司废旧鉴定专责", person: "史秋生", dept: "废旧鉴定中心", modules: ["retired", "warehouse", "task", "data"], assetScope: "none" },
    { id: "scrap_head", title: "公司废旧鉴定主管", person: "任淮辉", dept: "废旧鉴定中心", modules: ["retired", "warehouse", "task", "data"], assetScope: "none" }
  ];

  function getDefaultRoleId() {
    return "gm_zeng";
  }

  function getCurrentRole() {
    var roleId = "";
    try {
      roleId = (sessionStorage.getItem("demoOrgRoleId") || "").trim();
    } catch (e0) {}
    if (!roleId) roleId = getDefaultRoleId();
    var role = ORG_ROLE_CATALOG.find(function (x) {
      return x.id === roleId;
    });
    if (!role) role = ORG_ROLE_CATALOG[0];
    try {
      sessionStorage.setItem("demoOrgRoleId", role.id);
    } catch (e1) {}
    return role;
  }

  function roleHasModule(role, moduleKey) {
    if (!role || !moduleKey) return false;
    if (role.modules === "all") return true;
    var allowed = Array.isArray(role.modules) ? role.modules.slice() : [];
    if (allowed.indexOf("task") === -1) allowed.push("task");
    if (allowed.indexOf("cockpit") === -1) allowed.push("cockpit");
    return allowed.indexOf(moduleKey) >= 0;
  }

  function actionModuleKey(action) {
    if (!action) return "";
    /* 采购侧台账：与 sidebar-actions 中 material-ledger / cargo-ledger / purchase-ledger 一致，归属物资采购模块 */
    if (action === "material-ledger" || action === "cargo-ledger" || action === "purchase-ledger") return "purchaseMgmt";
    if (/^(asset-)/.test(action)) return "asset";
    if (/^(logistics-)/.test(action)) return "logistics";
    if (/^(purchase-|cargo-|proc-|material-|purchaseMgmt)/.test(action)) return "purchaseMgmt";
    if (/^(slot|receive|scan|inventory-check|stock|maintenance|idle|warehouse)/.test(action)) return "warehouse";
    if (/^(retired-|goods-transfer)/.test(action)) return "retired";
    if (/^(performance-)/.test(action)) return "performance";
    if (/^(notice-)/.test(action)) return "notice";
    if (/^(biz-)/.test(action)) return "biz";
    if (/^(data-)/.test(action)) return "data";
    if (/^(dev-|tool-)/.test(action)) return "devtools";
    if (/^(setting-|system-)/.test(action)) return "system";
    if (/^(task-)/.test(action)) return "task";
    if (/^(go-cockpit|cockpit-|home-)/.test(action)) return "cockpit";
    return "";
  }

  function canAccessAssetScope(role, scope) {
    if (!role) return false;
    if (role.modules === "all") return true;
    if (!roleHasModule(role, "asset")) return false;
    if (scope === "personal") return role.assetScope !== "none";
    if (scope === "department") return role.assetScope === "dept" || role.assetScope === "global";
    if (scope === "company") return role.assetScope === "global";
    return false;
  }

  function installOrgRoleSwitch() {
    var headerRight = document.querySelector(".header-right");
    if (!headerRight || headerRight.__orgRoleSwitchInstalled) return;
    headerRight.__orgRoleSwitchInstalled = true;

    if (!document.getElementById("orgRoleSwitchStyle")) {
      var st = document.createElement("style");
      st.id = "orgRoleSwitchStyle";
      st.textContent =
        "body.page-source-navbar .header{overflow:visible !important;z-index:10030;}" +
        ".org-role-switch{position:relative;margin-right:8px;z-index:10040;}" +
        ".org-role-btn{height:26px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.16);color:#fff;border-radius:4px;padding:0 10px;font-size:12px;cursor:pointer;}" +
        ".org-role-menu{position:absolute;right:0;top:32px;width:320px;max-height:320px;overflow:auto;background:#fff;border:1px solid #dbe6f3;border-radius:8px;box-shadow:0 12px 30px rgba(8,27,50,.25);padding:6px;display:none;z-index:10050;}" +
        ".org-role-menu.is-open{display:block;}" +
        ".org-role-item{width:100%;text-align:left;border:none;background:#fff;padding:7px 8px;border-radius:6px;color:#29405a;font-size:12px;cursor:pointer;}" +
        ".org-role-item:hover{background:#f1f6ff;}" +
        ".org-role-item.is-active{background:#e6f4ff;color:#0958d9;font-weight:600;}" +
        ".org-access-deny{margin:12px 0;padding:10px 12px;border:1px solid #ffd8bf;background:#fff7e6;border-radius:6px;color:#ad4e00;font-size:13px;}";
      document.head.appendChild(st);
    }

    var role = getCurrentRole();
    var wrap = document.createElement("div");
    wrap.className = "org-role-switch";
    wrap.innerHTML =
      '<button type="button" class="org-role-btn" id="orgRoleBtn">角色切换：' +
      role.title +
      '</button>' +
      '<div class="org-role-menu" id="orgRoleMenu"></div>';
    var avatar = headerRight.querySelector(".user-avatar");
    if (avatar) headerRight.insertBefore(wrap, avatar);
    else headerRight.appendChild(wrap);

    var btn = wrap.querySelector("#orgRoleBtn");
    var menu = wrap.querySelector("#orgRoleMenu");
    menu.innerHTML = ORG_ROLE_CATALOG.map(function (x) {
      var label = x.title + "（" + x.person + "）";
      return (
        '<button type="button" class="org-role-item' +
        (x.id === role.id ? " is-active" : "") +
        '" data-role-id="' +
        x.id +
        '">' +
        label +
        "</button>"
      );
    }).join("");

    function closeMenu() {
      menu.classList.remove("is-open");
    }
    function updateButtonText(nextRole) {
      if (btn && nextRole) btn.textContent = "角色切换：" + nextRole.title;
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("is-open");
    });
    menu.addEventListener("click", function (e) {
      var item = e.target.closest("[data-role-id]");
      if (!item) return;
      var roleId = item.getAttribute("data-role-id");
      var nextRole = ORG_ROLE_CATALOG.find(function (x) {
        return x.id === roleId;
      });
      if (!nextRole) return;
      try {
        sessionStorage.setItem("demoOrgRoleId", nextRole.id);
      } catch (e0) {}
      menu.querySelectorAll(".org-role-item").forEach(function (x) {
        x.classList.remove("is-active");
      });
      item.classList.add("is-active");
      updateButtonText(nextRole);
      closeMenu();
      window.dispatchEvent(
        new CustomEvent("demo-org-role-change", {
          detail: { role: nextRole }
        })
      );
    });
    document.addEventListener("click", closeMenu);
  }

  function installAssetScopeGuards() {
    function renderAssetScopeGuard() {
    var path = (window.location.pathname || "").split("/").pop();
    var role = getCurrentRole();
    var scope = "";
    if (path === "assets-personal.html") scope = "personal";
    else if (path === "assets-department.html") scope = "department";
    else if (path === "assets-company.html") scope = "company";
    if (!scope) return;

    var titleEl = document.querySelector(".asset-page-title");
    if (scope === "personal" && titleEl) {
      titleEl.textContent = "个人资产（" + role.person + "）";
    }

    if (canAccessAssetScope(role, scope)) return;

    var host = document.querySelector(".asset-inner") || document.querySelector(".main-scroll");
    if (!host) return;
    var deny = document.createElement("div");
    deny.className = "org-access-deny";
    deny.textContent = "当前角色无权限访问此资产层级，请通过右上角“角色切换”切换到具备权限的岗位。";
    host.innerHTML = "";
    host.appendChild(deny);
    }
    renderAssetScopeGuard();
    window.addEventListener("demo-org-role-change", function () {
      window.location.reload();
    });
  }

  function installOrgAccessBridge() {
    window.getDemoOrgRole = getCurrentRole;
    window.orgRoleHasModule = function (moduleKey) {
      return roleHasModule(getCurrentRole(), moduleKey);
    };
    window.orgCanNavigateAction = function (action) {
      var mk = actionModuleKey(action);
      if (!mk) return true;
      return roleHasModule(getCurrentRole(), mk);
    };
    window.orgCanAccessAssetScope = function (scope) {
      return canAccessAssetScope(getCurrentRole(), scope);
    };
  }

  function tickClock() {
    var el = document.getElementById('clock');
    if (!el) return;
    var d = new Date();
    var pad = function (n) {
      return n < 10 ? '0' + n : '' + n;
    };
    el.textContent =
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      '  ' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds());
  }

  function installMasterNavInteractions() {
    var layout = document.querySelector('.layout');
    var sidebar = document.querySelector('.sidebar');
    if (!layout || !sidebar) return;
    if (sidebar.__masterNavInteractionsInstalled) return;
    sidebar.__masterNavInteractionsInstalled = true;

    // 统一左侧主菜单：若页面是精简侧栏（仅1~4项），自动补齐为完整模块菜单
    (function ensureFullSidebar() {
      var navItems = sidebar.querySelectorAll('.nav-item');
      if (navItems.length >= 10) return;
      sidebar.innerHTML =
        '<div class="nav-item" title="我的资产"><span class="nav-label">我的资产</span></div>' +
        '<div class="nav-item" title="我的任务"><span class="nav-label">我的任务</span></div>' +
        '<a class="nav-item" href="index-portal-screen-alt.html" title="首页"><span class="nav-label">首页</span></a>' +
        '<div class="nav-item" title="驾驶舱"><span class="nav-label">驾驶舱</span></div>' +
        '<div class="nav-item" title="采购管理"><span class="nav-label">采购管理</span></div>' +
        '<div class="nav-item" title="物流管理"><span class="nav-label">物流管理</span></div>' +
        '<div class="nav-item" title="仓储管理"><span class="nav-label">仓储管理</span></div>' +
        '<div class="nav-item" title="物资采购"><span class="nav-label">物资采购</span></div>' +
        '<div class="nav-item" title="物资出库与处置"><span class="nav-label">物资出库与处置</span></div>' +
        '<div class="nav-item" title="绩效考核"><span class="nav-label">绩效考核</span></div>' +
        '<div class="nav-item" title="公告管理"><span class="nav-label">公告管理</span></div>' +
        '<div class="nav-item" title="综合业务管理"><span class="nav-label">综合业务管理</span></div>' +
        '<div class="nav-item" title="数据管理"><span class="nav-label">数据管理</span></div>' +
        '<div class="nav-item" title="开发工具"><span class="nav-label">开发工具</span></div>' +
        '<div class="nav-item" title="设置"><span class="nav-label">设置</span></div>' +
        '<div class="nav-item" title="系统管理"><span class="nav-label">系统管理</span></div>';
    })();

    // 统一侧栏图标：补齐与驾驶舱一致的模块图标
    (function ensureSidebarIcons() {
      var ICON_SVG_BY_LABEL = {
        '我的资产':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
        '我的任务':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z"/><rect x="5" y="5" width="14" height="17" rx="1.5"/><path d="M8 9h8M8 12.5h8M8 16h6"/></svg>',
        '首页':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-7H9v7H4.5A1.5 1.5 0 0 1 3 20v-9.5z"/></svg>',
        '驾驶舱':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1"/></svg>',
        '采购管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h14l-1.2 9H7.2L6 6z"/><path d="M6 6V5a1 1 0 0 1 1-1h2"/><circle cx="9" cy="20" r="1.25"/><circle cx="17" cy="20" r="1.25"/></svg>',
        '物流管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1 16h11.5V8.5H5V7h11.5v5h2.5l3.5 4.5"/><circle cx="6.5" cy="17.5" r="1.75"/><circle cx="16.5" cy="17.5" r="1.75"/></svg>',
        '仓储管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18V10.5L12 6 3 10.5V21z"/><path d="M9 21v-7h6v7"/></svg>',
        '物资采购':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6a2 2 0 0 1 2-2h6v16H6a2 2 0 0 1-2-2V6z"/><path d="M20 6a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 0 2-2V6z"/><path d="M12 4v16"/><path d="M7 9h3M7 12.5h3M7 16h2M14 9h3M14 12.5h3M14 16h2"/></svg>',
        '物资出库与处置':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 12a9 9 0 0 0-9-9 9.5 9.5 0 0 0-7 3"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.5 9.5 0 0 0 7-3"/><path d="M16 16h5v5"/></svg>',
        '绩效考核':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M9 8h6M9 12h6M9 16h5"/></svg>',
        '公告管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h12a2 2 0 0 1 2 2v10H6a2 2 0 0 0-2 2v2"/><path d="M4 6V5a1 1 0 0 1 1-1h2"/><path d="M8 10h8M8 14h6"/></svg>',
        '综合业务管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>',
        '数据管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="5" rx="9" ry="2.5"/><path d="M3 5v6c0 1.6 4 3 9 3s9-1.4 9-3V5"/><path d="M3 11v6c0 1.6 4 3 9 3s9-1.4 9-3V11"/><path d="M3 17v2c0 1.6 4 3 9 3s9-1.4 9-3v-2"/></svg>',
        '开发工具':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 18l6-6-6-6"/><path d="M8 6 2 12l6 6"/></svg>',
        '设置':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3"/><path d="M12 1v2.5M12 20.5V23M4.2 4.2l1.8 1.8M18 18l1.8 1.8M1 12h2.5M20.5 12H23M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>',
        '系统管理':
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="9" r="3.5"/><path d="M5 20.5v-1a7 7 0 0 1 14 0v1"/></svg>'
      };

      var navItems = sidebar.querySelectorAll('.nav-item');
      for (var i = 0; i < navItems.length; i++) {
        var item = navItems[i];
        if (item.querySelector('.nav-icon')) continue;
        var labelEl = item.querySelector('.nav-label');
        if (!labelEl) continue;
        var label = (labelEl.textContent || '').trim();
        var svg = ICON_SVG_BY_LABEL[label];
        if (!svg) continue;
        var icon = document.createElement('span');
        icon.className = 'nav-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = svg;
        item.insertBefore(icon, labelEl);
      }
    })();

    // 统一补充退役面板所需样式（子页母版）
    if (!document.getElementById('masterNavEnhanceStyle')) {
      var style = document.createElement('style');
      style.id = 'masterNavEnhanceStyle';
      style.textContent =
        '.retired-main-block{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}' +
        '.retired-main-title{background:none;border:none;padding:0;color:#fff;font-size:14px;line-height:1.5;text-align:left;cursor:pointer;}' +
        '.retired-main-title:hover,.retired-main-title:focus{opacity:.9;text-decoration:underline;text-underline-offset:2px;}' +
        '.retired-main-title--static{cursor:default;text-decoration:none;font-weight:600;}' +
        '.retired-sub-divider{border:none;height:1px;background:rgba(255,255,255,.2);margin:0;}' +
        '.retired-sub-pipe{font-size:13px;}' +
        '.retired-sub-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}' +
        '.retired-sub-row .warehouse-secondary-link{font-size:13px;font-weight:400;line-height:1.5;}' +
        '.retired-sub-row .warehouse-secondary-pipe{opacity:.55;}' +
        '.retired-sub-row + .retired-sub-row{margin-top:6px;}';
      document.head.appendChild(style);
    }

    // 驾驶舱同款：模块点击弹出蓝色框（二级功能）
    var secondaryPanel = document.getElementById('warehouseSecondaryPanel');
    if (!secondaryPanel) {
      secondaryPanel = document.createElement('aside');
      secondaryPanel.id = 'warehouseSecondaryPanel';
      secondaryPanel.className = 'warehouse-secondary-panel';
      secondaryPanel.setAttribute('aria-label', '模块子菜单');
      secondaryPanel.setAttribute('aria-hidden', 'true');
      secondaryPanel.hidden = true;
      secondaryPanel.innerHTML =
        '<div class="warehouse-secondary-inner">' +
        '  <div class="warehouse-secondary-row warehouse-secondary-row--pipe" id="masterSecondaryRow"></div>' +
        '</div>';
      layout.insertBefore(secondaryPanel, layout.querySelector('.main-scroll'));
    } else {
      /* 页面内已有仓储侧栏但未带 #masterSecondaryRow（如 warehouse.html）：补 id 以便注入子功能 */
      var existingRow = secondaryPanel.querySelector('.warehouse-secondary-inner .warehouse-secondary-row');
      if (existingRow && !existingRow.id) existingRow.id = 'masterSecondaryRow';
    }

    var retiredPanel = document.getElementById('retiredSecondaryPanel');
    if (!retiredPanel) {
      retiredPanel = document.createElement('aside');
      retiredPanel.id = 'retiredSecondaryPanel';
      retiredPanel.className = 'warehouse-secondary-panel retired-secondary-panel';
      retiredPanel.setAttribute('aria-label', '物资出库与处置子菜单');
      retiredPanel.setAttribute('aria-hidden', 'true');
      retiredPanel.hidden = true;
      retiredPanel.innerHTML =
        '<div class="warehouse-secondary-inner">' +
        '  <div class="retired-main-block">' +
        '    <div class="retired-main-title retired-main-title--static">以大代小 &amp;循环再利用</div>' +
        '    <hr class="retired-sub-divider" />' +
        '    <div class="warehouse-secondary-row warehouse-secondary-row--pipe retired-sub-pipe retired-sub-row">' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-brand" data-label="品牌">品牌</button>' +
        '      <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-model" data-label="型号">型号</button>' +
        '      <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-line" data-label="场内线路">场内线路</button>' +
        '      <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-wind" data-label="风电机组和箱变">风电机组和箱变</button>' +
        '      <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-requisition" data-label="物资领用单">物资领用单</button>' +
        '      <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-project" data-label="项目管理">项目管理</button>' +
        '    </div>' +
        '    <div class="warehouse-secondary-row warehouse-secondary-row--pipe retired-sub-pipe retired-sub-row">' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-apply-main" data-label="退役及报废申请">退役及报废申请</button>' +
        '      <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-big-small-reuse" data-label="以大带小循环再利用">以大带小循环再利用</button>' +
        '      <span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
        '      <button type="button" class="warehouse-secondary-link" data-action="retired-transfer" data-label="货物转出">货物转出</button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
      layout.insertBefore(retiredPanel, layout.querySelector('.main-scroll'));
    }

    var actionHref = window.SIDEBAR_ACTION_HREF;
    if (!actionHref) {
      console.warn('[subpage-clock] 请先引入 js/sidebar-actions.js，否则二级菜单无法跳转');
      actionHref = {};
    }

    var modules = {
      asset: {
        text: '我的资产',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="asset-personal" data-label="个人资产">个人资产</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-dept" data-label="部门资产">部门资产</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-company" data-label="公司资产">公司资产</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-transfer-manage" data-label="资产交接">资产交接</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-nature-change-manage" data-label="资产性质转变">资产性质转变</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-inventory-manage" data-label="盘点管理">盘点管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-value-manage" data-label="价值管理">价值管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="asset-ledger" data-label="资产台账">资产台账</button>'
      },
      task: {
        text: '我的任务',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="task-initiated" data-label="我发起的">我发起的</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-todo" data-label="我的待办">我的待办</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-done" data-label="我的已办">我的已办</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="task-cc" data-label="我的抄送">我的抄送</button>'
      },
      // 首页：不再弹出蓝色二级菜单，直接按侧栏映射跳转
      cockpit: {
        text: '驾驶舱',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="go-cockpit" data-label="集团驾驶舱">集团驾驶舱</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="go-cockpit-map" data-label="省级驾驶舱">省级驾驶舱</button>'
      },
      purchaseMgmt: {
        text: '采购管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-plan-manage" data-label="采购计划管理">采购计划管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-apply" data-label="采购申请">采购申请</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-order-demand" data-label="订单需求管理">订单需求管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-contract-mgmt" data-label="合同管理">合同管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-quality-accept" data-label="采购环节质量验收">采购环节质量验收</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-material-info-manage" data-label="物资采购信息管理">物资采购信息管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-ledger" data-label="采购数据台账">采购数据台账</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="material-ledger" data-label="物资台账">物资台账</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="purchase-summary-report" data-label="报表管理">报表管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="proc-acceptance-inbound" data-label="验收入库">验收入库</button>'
          + '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>'
          + '<button type="button" class="warehouse-secondary-link" data-action="proc-use-approval" data-label="领用申请审批">领用申请审批</button>'
          + '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>'
          + '<button type="button" class="warehouse-secondary-link" data-action="proc-sales-contract" data-label="销售合同管理">销售合同管理</button>'
          + '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>'
          + '<button type="button" class="warehouse-secondary-link" data-action="proc-shipment" data-label="发货管理">发货管理</button>'
          + '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>'
          + '<button type="button" class="warehouse-secondary-link" data-action="proc-quality-accept" data-label="货物质量验收">货物质量验收</button>'
          + '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>'
          + '<button type="button" class="warehouse-secondary-link" data-action="proc-project-accept" data-label="项目公司验收">项目公司验收</button>'
          + '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>'
          + '<button type="button" class="warehouse-secondary-link" data-action="purchase-accept-confirm" data-label="验收确认">验收确认</button>'
      },
      logistics: {
        text: '物流管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-carrier" data-label="承运商管理">承运商管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-contract" data-label="物流合同">物流合同</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-track" data-label="物流跟踪">物流跟踪</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-pay" data-label="物流付款">物流付款</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-ledger" data-label="物流台账">物流台账</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="logistics-integration" data-label="物流对接">物流对接</button>'
      },
      warehouse: {
        text: '仓储管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="slot" data-label="货位管理">货位管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="receive" data-label="收货入库">收货入库</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="scan" data-label="扫码领用">扫码领用</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="inventory-check" data-label="盘库管理">盘库管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="stock" data-label="库存管理">库存管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="maintenance" data-label="库内保养">库内保养</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="idle" data-label="闲置物资">闲置物资</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="warehouse" data-label="仓库管理">仓库管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="warehouse-stock-ledger" data-label="库存台账">库存台账</button>'
      },
      retired: {
        text: '物资出库与处置',
        panel: retiredPanel
      },
      performance: {
        text: '绩效考核',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="performance-login-frequency" data-label="登录频次统计">登录频次统计</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="performance-flow-frequency" data-label="流程频次统计">流程频次统计</button>'
      },
      notice: {
        text: '公告管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="notice-nonbid" data-label="非招标公告">非招标公告</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="notice-bid" data-label="招标公告">招标公告</button>'
      },
      biz: {
        text: '综合业务管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="biz-finance" data-label="财务管理">财务管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-repair" data-label="维修管理">维修管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-transfer" data-label="调剂管理">调剂管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-emergency" data-label="应急物资管理">应急物资管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-standard" data-label="标准规范">标准规范</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-process-design" data-label="业务流程设计">业务流程设计</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-claim" data-label="物资理赔">物资理赔</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-domestic-substitute" data-label="国产化替代">国产化替代</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="biz-expert" data-label="专家管理">专家管理</button>'
      },
      data: {
        text: '数据管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="data-base" data-label="基础数据">基础数据</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-supplier" data-label="供应商数据">供应商数据</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-product" data-label="产品目录">产品目录</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-code" data-label="编码管理">编码管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-model" data-label="数据模型">数据模型</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="data-decision" data-label="决策分析支持">决策分析支持</button>'
      },
      devtools: {
        text: '开发工具',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="dev-online-user" data-label="在线用户">在线用户</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-tenant" data-label="租户管理">租户管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-test-form" data-label="测试单表">测试单表</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-test-tree" data-label="测试树表">测试树表</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-flow-category" data-label="流程分类">流程分类</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-leave" data-label="请假申请">请假申请</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-tenant-package" data-label="租户套餐管理">租户套餐管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-model-manage" data-label="模型管理">模型管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-process-define" data-label="流程定义">流程定义</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<span class="warehouse-secondary-label" aria-hidden="true" style="display:block;flex-basis:100%;padding:4px 0 2px;color:#d7e6ff;font-weight:700;">流程监控</span>' +
          '<span class="warehouse-secondary-divider" aria-hidden="true" style="display:block;flex-basis:100%;height:1px;background:rgba(112,155,255,0.45);margin:0 0 6px;"></span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-flow-instance" data-label="流程实例">流程实例</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-pending-task" data-label="待办任务">待办任务</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-cache-monitor" data-label="缓存监控">缓存监控</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-admin-monitor" data-label="Admin监控">Admin监控</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-form-manage" data-label="表单管理">表单管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-task-dispatch" data-label="任务调度中心">任务调度中心</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="dev-plus-home" data-label="PLUS官网">PLUS官网</button>'
      },
      setting: {
        text: '设置',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="setting-password" data-label="密码管理">密码管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="setting-user" data-label="人员管理">人员管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="setting-department" data-label="公司部门管理">公司部门管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="setting-permission" data-label="权限管理">权限管理</button>'
      },
      system: {
        text: '系统管理',
        panel: secondaryPanel,
        rowHtml:
          '<button type="button" class="warehouse-secondary-link" data-action="system-user" data-label="用户管理">用户管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-role" data-label="角色管理">角色管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-codegen" data-label="代码生成">代码生成</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-menu" data-label="菜单管理">菜单管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-department" data-label="部门管理">部门管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-position" data-label="岗位管理">岗位管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-dict" data-label="字典管理">字典管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-params" data-label="参数设置">参数设置</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-notice" data-label="通知公告">通知公告</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-file" data-label="文件管理">文件管理</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="system-client" data-label="客户端管理">客户端管理</button>' +
          '<span class="warehouse-secondary-break" aria-hidden="true" style="flex-basis:100%;height:0;"></span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="oa-integration" data-label="OA单点集成">OA单点集成</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="oa-flow-style" data-label="OA流程样式">OA流程样式</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="flow-print-pdf" data-label="A4打印/PDF导出">A4打印/PDF导出</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="flow-return-withdraw" data-label="流程退回/撤回">流程退回/撤回</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="flow-notify" data-label="流程知会">流程知会</button>' +
          '<span class="warehouse-secondary-pipe" aria-hidden="true">|</span>' +
          '<button type="button" class="warehouse-secondary-link" data-action="finance-export" data-label="财务数据导出">财务数据导出</button>'
      }
    };
    var NAV_MODULE_KEY_BY_ID = {
      asset: "asset",
      task: "task",
      cockpit: "cockpit",
      purchaseMgmt: "purchaseMgmt",
      logistics: "logistics",
      warehouse: "warehouse",
      retired: "retired",
      performance: "performance",
      notice: "notice",
      biz: "biz",
      data: "data",
      devtools: "devtools",
      setting: "system",
      system: "system"
    };

    function resolveSecondaryRow() {
      var row = document.getElementById('masterSecondaryRow');
      if (row) return row;
      if (secondaryPanel) {
        row = secondaryPanel.querySelector('.warehouse-secondary-inner .warehouse-secondary-row');
        if (row && !row.id) row.id = 'masterSecondaryRow';
      }
      return row || null;
    }

    var secondaryRow = resolveSecondaryRow();

    function findNavByText(label) {
      var compact = String(label).replace(/\s+/g, '');
      var items = sidebar.querySelectorAll('.nav-item');
      var i, nl, t;
      for (i = 0; i < items.length; i++) {
        nl = items[i].querySelector('.nav-label');
        t = (nl ? nl.textContent : items[i].textContent || '').replace(/\s+/g, '');
        if (t === compact) return items[i];
      }
      for (i = 0; i < items.length; i++) {
        nl = items[i].querySelector('.nav-label');
        t = (nl ? nl.textContent : items[i].textContent || '').replace(/\s+/g, '');
        if (t.indexOf(compact) > -1) return items[i];
      }
      return null;
    }

    function removeNavByText(label) {
      var nav = findNavByText(label);
      if (!nav || !nav.parentNode) return;
      nav.parentNode.removeChild(nav);
    }

    // 统一去掉侧栏「物资采购」
    removeNavByText('物资采购');

    function clearNavHighlight() {
      sidebar.querySelectorAll('.nav-item').forEach(function (el) {
        el.classList.remove('active');
        el.classList.remove('nav-item--module-active');
      });
    }

    function closePanels() {
      [secondaryPanel, retiredPanel].forEach(function (panel) {
        if (!panel) return;
        panel.classList.remove('is-open');
        panel.hidden = true;
        panel.setAttribute('aria-hidden', 'true');
      });
    }

    function openPanel(panel) {
      if (!panel) return;
      panel.hidden = false;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
    }

    function bindPanelActions(panel) {
      if (!panel) return;
      panel.querySelectorAll('[data-action]').forEach(function (btn) {
        if (btn.__boundMasterNav) return;
        btn.__boundMasterNav = true;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var key = btn.getAttribute('data-action');
          var label = (btn.getAttribute('data-label') || '').trim() || (btn.textContent || '').trim();
          if (typeof window.orgCanNavigateAction === 'function' && !window.orgCanNavigateAction(key)) {
            alert('当前角色无该功能权限，请切换角色后操作。');
            return;
          }
          /* 统一走 navigateBySidebarAction（内含打包演示父页 __demoOpenPage 跳转） */
          if (typeof window.navigateBySidebarAction === 'function' && window.navigateBySidebarAction(key, { label: label })) {
            return;
          }
          var hrefMap = window.SIDEBAR_ACTION_HREF || actionHref || {};
          var href = hrefMap[key];
          if (href) {
            window.location.href = href;
            return;
          }
        });
      });
    }

    function applyRoleAclToRowHtml(rowHtml) {
      if (!rowHtml || typeof window.orgCanNavigateAction !== 'function') return rowHtml || '';
      var box = document.createElement('div');
      box.innerHTML = rowHtml;
      box.querySelectorAll('[data-action]').forEach(function (btn) {
        var action = btn.getAttribute('data-action');
        if (window.orgCanNavigateAction(action)) return;
        var prev = btn.previousElementSibling;
        var next = btn.nextElementSibling;
        if (prev && prev.classList && prev.classList.contains('warehouse-secondary-pipe')) prev.remove();
        if (next && next.classList && next.classList.contains('warehouse-secondary-pipe')) next.remove();
        btn.remove();
      });
      return box.innerHTML;
    }

    function applyRoleAclToSidebar() {
      var role = typeof window.getDemoOrgRole === 'function' ? window.getDemoOrgRole() : null;
      if (!role || typeof window.orgRoleHasModule !== 'function') return;
      Object.keys(modules).forEach(function (k) {
        var mod = modules[k];
        var navEl = findNavByText(mod.text);
        if (!navEl) return;
        var mk = NAV_MODULE_KEY_BY_ID[k] || k;
        var can = window.orgRoleHasModule(mk);
        navEl.style.display = '';
      });
    }

    Object.keys(modules).forEach(function (k) {
      var mod = modules[k];
      var navEl = findNavByText(mod.text);
      if (!navEl) return;

      navEl.setAttribute('data-master-module', k);
      navEl.style.cursor = 'pointer';
      if (navEl.tagName === 'A') navEl.setAttribute('href', '#');

      navEl.addEventListener('click', function (e) {
        try {
          var mk = NAV_MODULE_KEY_BY_ID[k] || k;
          if (typeof window.orgRoleHasModule === 'function' && !window.orgRoleHasModule(mk)) {
            e.preventDefault();
            alert('当前角色无该模块权限，请通过右上角“角色切换”更换岗位。');
            return;
          }
          e.preventDefault();
          clearNavHighlight();
          navEl.classList.add('nav-item--module-active');
          closePanels();
          if (k === 'retired') {
            openPanel(retiredPanel);
            bindPanelActions(retiredPanel);
            return;
          }
          var rowEl = resolveSecondaryRow();
          if (rowEl && mod.rowHtml) {
            rowEl.innerHTML = applyRoleAclToRowHtml(mod.rowHtml);
            bindPanelActions(secondaryPanel);
          }
          openPanel(secondaryPanel);
        } catch (err) {
          // 兜底：若二级菜单渲染异常，至少允许主菜单继续跳转
          try {
            var href = (navEl.getAttribute && navEl.getAttribute('href')) || '';
            if (href && href !== '#') {
              window.location.href = href;
            }
          } catch (e2) {}
        }
      });
    });
    applyRoleAclToSidebar();
    window.addEventListener('demo-org-role-change', function () {
      applyRoleAclToSidebar();
      closePanels();
    });

    // 页面加载时，根据当前文件名高亮模块
    var path = (window.location.pathname || '').split('/').pop();
    var byPath = {
      'index.html': 'home',
      'cockpit.html': 'cockpit',
      'cockpit-analytics.html': 'cockpit',
      'module-home.html': 'cockpit',
      'cockpit_副本.html': 'cockpit',
      'my-tasks.html': 'task',
      'my-tasks-prototype-list.html': 'task',
      'procurement-application.html': 'purchaseMgmt',
      'purchase-management-hub.html': 'purchaseMgmt',
      'purchase-material-info-management.html': 'purchaseMgmt',
      'purchase-prototype-list.html': 'purchaseMgmt',
      'purchase-pm-nonbid.html': 'purchaseMgmt',
      'purchase-pm-plan.html': 'purchaseMgmt',
      'purchase-pm-longterm-result.html': 'purchaseMgmt',
      'purchase-pm-repurchase.html': 'purchaseMgmt',
      'purchase-pm-minutes.html': 'purchaseMgmt',
      'purchase-pm-bid.html': 'purchaseMgmt',
      'purchase-pm-terminate.html': 'purchaseMgmt',
      'purchase-pm-group-plan.html': 'purchaseMgmt',
      'purchase-pm-under15.html': 'purchaseMgmt',
      'purchase-pm-monthly-bid.html': 'purchaseMgmt',
      'purchase-pm-monthly-nonbid.html': 'purchaseMgmt',
      'purchase-pm-notice-nonbid.html': 'purchaseMgmt',
      'purchase-pm-data-maintain.html': 'purchaseMgmt',
      'purchase-pm-archive.html': 'purchaseMgmt',
      'purchase-pm-longterm-use.html': 'purchaseMgmt',
      'material-procurement-hub.html': 'purchaseMgmt',
      'carrier-management.html': 'logistics',
      'logistics-contract.html': 'logistics',
      'logistics-tracking.html': 'logistics',
      'logistics-payment.html': 'logistics',
      'warehouse.html': 'warehouse',
      'receipt-inbound.html': 'warehouse',
      'scan-pick.html': 'warehouse',
      'slot-management.html': 'warehouse',
      'inventory-check.html': 'warehouse',
      'warehouse-maintenance.html': 'warehouse',
      'inventory-management.html': 'warehouse',
      'idle-materials.html': 'warehouse',
      'retire-scrap-application.html': 'retired',
      'equipment-evaluation.html': 'retired',
      'big-small-reuse.html': 'retired',
      'retired-module-hub.html': 'retired',
      'retired-prototype-list.html': 'retired',
      'goods-transfer-out.html': 'retired',
      'performance-hub.html': 'performance',
      'notice-hub.html': 'notice',
      'integrated-business-hub.html': 'biz',
      'system-admin-hub.html': 'system',
      'system-prototype-list.html': 'system',
      'subpage-template.html': 'devtools',
      'demo-all-in-one.html': 'devtools',
      'demo-all-pages-interactive.html': 'devtools',
      'demo-interactive-single.html': 'devtools',
      'devtools-prototype-list.html': 'devtools',
      'base-data-material-ledger.html': 'data',
      'assets-personal.html': 'asset',
      'assets-department.html': 'asset',
      'assets-company.html': 'asset',
      'asset-transfer-management.html': 'asset',
      'asset-nature-change-management.html': 'asset',
      'asset-inventory-management.html': 'asset'
    };
    var currentModule = byPath[path];
    if (currentModule && modules[currentModule]) {
      var nav = findNavByText(modules[currentModule].text);
      if (nav) nav.classList.add('nav-item--module-active');
    }

    // 点击主内容区关闭蓝色框
    var main = document.querySelector('.main-scroll');
    if (main) {
      main.addEventListener('click', function () {
        closePanels();
      });
    }
  }

  function installShellQuickActions() {
    var body = document.body;
    var layout = document.querySelector('.layout');
    var hamburger = document.querySelector('.header-hamburger');
    var avatar = document.querySelector('.user-avatar');
    if (!body || !layout) return;

    var lockSidebarExpanded = body.classList.contains('page-screen-alt');
    if (lockSidebarExpanded) {
      body.classList.remove('sidebar-collapsed');
    }

    if (hamburger && !hamburger.__boundSidebarToggle) {
      hamburger.__boundSidebarToggle = true;
      hamburger.addEventListener('click', function (e) {
        e.preventDefault();
        if (lockSidebarExpanded) return;
        body.classList.toggle('sidebar-collapsed');
      });
    }

    if (!avatar || avatar.__boundUserMenu) return;
    avatar.__boundUserMenu = true;
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');
    avatar.setAttribute('aria-label', '用户菜单');

    var menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = '<button type="button" class="user-menu-btn" data-action="logout">退出登录</button>';
    document.body.appendChild(menu);

    function closeMenu() {
      menu.classList.remove('is-open');
    }

    function openMenu() {
      var rect = avatar.getBoundingClientRect();
      menu.style.top = rect.bottom + 8 + 'px';
      menu.style.left = Math.max(8, rect.right - 120) + 'px';
      menu.classList.add('is-open');
    }

    avatar.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    avatar.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (menu.classList.contains('is-open')) closeMenu();
        else openMenu();
      }
    });

    menu.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-action="logout"]') : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
      window.showActionConfirm("退出登录", "确定退出登录？", function () {
        try { sessionStorage.removeItem('portalLoggedIn_v1'); } catch (err) {}
        window.location.href = 'index.html';
      });
    });

    document.addEventListener('click', function (e) {
      if (e.target === avatar || avatar.contains(e.target) || menu.contains(e.target)) return;
      closeMenu();
    });
  }

  function installGlobalTaskReminder() {
    if (document.getElementById("globalTaskReminder")) return;
    if (!document.body) return;
    var role = getCurrentRole();
    if (!role) return;
    if (!document.getElementById("globalTaskReminderStyle")) {
      var st = document.createElement("style");
      st.id = "globalTaskReminderStyle";
      st.textContent =
        ".global-task-reminder{position:fixed;right:18px;bottom:18px;z-index:10030;width:min(340px,90vw);background:#fff;border:1px solid #dbe6f3;border-radius:10px;box-shadow:0 14px 36px rgba(10,28,52,.24);}" +
        ".global-task-reminder.is-hide{display:none;}" +
        ".global-task-reminder__head{height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;border-bottom:1px solid #eef3fa;}" +
        ".global-task-reminder__title{font-size:14px;color:#1f3551;font-weight:600;}" +
        ".global-task-reminder__close{border:none;background:transparent;color:#7a8fa8;font-size:18px;cursor:pointer;}" +
        ".global-task-reminder__body{padding:10px 12px 12px;font-size:13px;color:#2f435d;line-height:1.7;}" +
        ".global-task-reminder__item{margin:0 0 6px;padding-left:14px;position:relative;}" +
        ".global-task-reminder__item:before{content:'';position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:#1890ff;}" +
        ".global-task-reminder__empty{color:#7f8ea3;}";
      document.head.appendChild(st);
    }
    var now = new Date();
    var month = now.getMonth() + 1;
    var items = [];
    if (month === 12) items.push("采购计划填报提醒：请各部门专责于本月完成采购计划填报。");
    if (month === 10) items.push("报废计划填报提醒：请各部门专责于本月完成报废计划填报。");
    if (
      role.id === "dept_asset_specialist" ||
      role.id === "dept_material_specialist" ||
      role.id === "dept_head" ||
      role.id === "leader_supervisor"
    ) {
      items.push("待办任务提醒：您有待处理流程，请在“我的任务”中及时办理。");
    }
    if (!items.length) return;
    var box = document.createElement("aside");
    box.id = "globalTaskReminder";
    box.className = "global-task-reminder";
    box.innerHTML =
      '<div class="global-task-reminder__head"><span class="global-task-reminder__title">任务提醒</span><button type="button" class="global-task-reminder__close" aria-label="关闭">×</button></div>' +
      '<div class="global-task-reminder__body">' +
      items.map(function (x) {
        return '<div class="global-task-reminder__item">' + x + "</div>";
      }).join("") +
      "</div>";
    document.body.appendChild(box);
    var closeBtn = box.querySelector(".global-task-reminder__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        box.classList.add("is-hide");
      });
    }
  }

  tickClock();
  setInterval(tickClock, 1000);
  installOrgAccessBridge();
  installOrgRoleSwitch();
  installAssetScopeGuards();
  installMasterNavInteractions();
  installShellQuickActions();
  installGlobalTaskReminder();
})();
