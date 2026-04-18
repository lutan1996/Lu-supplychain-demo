# 全站原型演示 ✅ / ⚠️ / ❌ 对照表

说明：面向「离线可点、侧栏可跳转」的 HTML 原型；**✅** 表示该入口有独立页面或聚合子页且具备工具栏/表格/表单等可交互演示；**⚠️** 表示列表/场景页、多场景复用同一壳或偏薄；**❌** 表示无对应页面或仅为占位。

| 业务域 | 侧栏/子功能（示例） | 入口文件 | 状态 | 备注 |
|--------|---------------------|----------|------|------|
| **核心** | 登录 | `index.html` | ✅ | 账号密码演示 |
| | 首页 / 应用大厅 | `index-portal-screen-alt.html` | ✅ | |
| | 驾驶舱 | `cockpit.html` | ✅ | |
| | 驾驶舱分析 | `cockpit-analytics.html` | ✅ | |
| **物资采购** | 采购计划～质量验收等（聚合） | `material-procurement-hub.html?tab=m1…m10` | ✅ | `?tab=` + `module-hub-tabs.js` 切换 |
| | 采购申请 | `procurement-application.html` | ✅ | 列表 + 新增申请弹窗 + 物资选择 |
| | 采购管理（旧聚合） | `purchase-management-hub.html` | ✅ | |
| | 各类采购审批/原型列表 | `purchase-prototype-list.html?scene=…` | ⚠️ | 场景列表型 |
| **物流** | 承运商管理 | `carrier-management.html` | ✅ | |
| | 物流合同 / 跟踪 / 付款 | `logistics-contract.html` / `logistics-tracking.html` / `logistics-payment.html` | ✅ | 付款页含多角色演示账号 |
| **仓储** | 仓储首页 | `warehouse.html` | ✅ | |
| | 收货入库 | `receipt-inbound.html` | ✅ | |
| | 扫码领用 | `scan-pick.html` | ✅ | |
| | 货位管理 | `slot-management.html` | ✅ | |
| | 盘库管理 | `inventory-check.html` | ✅ | |
| | 库内保养 | `warehouse-maintenance.html` | ✅ | |
| | 库存管理 | `inventory-management.html` | ✅ | |
| | 闲置物资 | `idle-materials.html` | ✅ | |
| **退役** | 退役及报废申请 | `retire-scrap-application.html` | ✅ | |
| | 设备评估 | `equipment-evaluation.html` | ✅ | |
| | 以大代小&循环再利用 | `big-small-reuse.html` | ✅ | |
| | 退役子模块（聚合） | `retired-module-hub.html` | ✅ | |
| | 退役类列表原型 | `retired-prototype-list.html?scene=…` | ⚠️ | |
| **综合业务** | 财务管理 / 维修 / 调剂 / 应急 / 国产化 / 专家 | `integrated-business-hub.html?tab=fin|rep|adj|emg|dom|exp` | ✅ | 依赖 URL `?tab=` 切换面板（见 `module-hub-tabs.js`） |
| | 标准规范 | `biz-standard-list.html` | ✅ | 独立文档库布局 |
| | 业务流程设计 / 物资理赔 | `integrated-business-hub.html?tab=flow|claim` | ✅ | 与聚合内其它子页一致为表格演示 |
| **数据管理** | 物资台账 | `base-data-material-ledger.html` | ✅ | |
| | 基础数据（主数据） | `data-base-fixed.html` | ✅ | |
| | 供应商主数据 | `data-supplier-fixed.html` | ✅ | |
| | 合同数据 | `data-contract-fixed.html` | ✅ | |
| | 编码/数据类列表 | `data-code-fixed.html` / `data-prototype-list.html` | ⚠️ | 列表/原型 |
| **公告 / 绩效** | 公告聚合 | `notice-hub.html` | ✅ | |
| | 公告列表 | `notice-prototype-list.html` | ⚠️ | |
| | 绩效聚合 | `performance-hub.html` | ✅ | |
| **系统管理** | 聚合入口 | `system-admin-hub.html` | ✅ | |
| | 用户/角色/菜单等 | `system-prototype-list.html?scene=…` | ⚠️ | 场景列表 |
| **开发工具** | 聚合入口 | `devtools-prototype-list.html` | ⚠️ | |
| | 子页模板 | `subpage-template.html` | ❌ | 占位模板 |
| **离线总演示** | 单文件全页 | `demo-all-pages-interactive.html` | ✅ | 内联资源；需定期 `python3 scripts/build_demo_single_html.py` 同步 |

## 统一交互（跨页）

| 项 | 说明 |
|----|------|
| 侧栏子菜单跳转 | `js/sidebar-actions.js` → `SIDEBAR_ACTION_HREF` |
| 聚合页 `?tab=` | `js/module-hub-tabs.js`（无顶部页签条时仍按 URL 切换面板） |
| 灰底弹窗 | `js/subpage-feature-title.js`：`showActionModal` / `showActionConfirm` / `showActionPrompt`；`window.alert` 覆盖为统一样式 |
| CRUD 演示弹窗 | 同文件内联：捕获阶段处理 `.js-op`、表格内 `a[href="#"]`；冒泡阶段覆盖 `main` 内工具条（含 `.toolbar`、`*filter-actions*`、`*-toolbar*` 等宽泛匹配）、`table tbody` 内带业务类名的按钮、`.carrier-main-inner` 内 `carrier-btn-add` 等；`aria-label`/图标按钮会回退为「操作」；`showActionModal` 失败时回退 `alert`。需保留原生逻辑的控件加 `data-crud-demo="off"` |

## 维护建议

1. 修改任一独立 HTML 后，若需离线包一致，请执行根目录：`python3 scripts/build_demo_single_html.py`。
2. 新增侧栏 `data-action` 时，在 `SIDEBAR_ACTION_HREF` 与（若使用）`scripts/build_demo_single_html.py` 内 `SIDEBAR_ACTION_FOR_DEMO` 同步。

---

*生成说明：本表由仓库当前文件结构整理，随业务迭代需人工复核「⚠️」是否需升级为「✅」。*
