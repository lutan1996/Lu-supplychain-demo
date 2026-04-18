# 登录后导航与「驾驶舱」信息架构说明

> 本文说明：**首页**（登录 + 公告/公示）、**应用大厅（模块总览）**、**数据驾驶舱（现有 cockpit）** 三者的关系与推荐跳转逻辑。

---

## 1. 概念区分

| 名称 | 含义 | 本项目中对应页面 |
|------|------|------------------|
| **首页** | 登录页；登录后为公告、公示、核心入口聚合 | `index.html`（`?view=portal` 时展示正文区） |
| **应用大厅** | 登录后选 **进 / 运 / 存 / 出 / 管** 的导航中枢 | `cockpit-hub.html`（登录成功默认进入） |
| **数据驾驶舱** | KPI、地图、曲线、运行态势 | `cockpit.html` |

**结论：** `cockpit.html` = 数据驾驶舱；`cockpit-hub.html` = 应用大厅；`index.html?view=portal` = 登录后的业务首页（不再称「门户首页」）。

---

## 2. 推荐用户动线

```text
登录 (index.html)
    ↓ 默认
应用大厅 (cockpit-hub) —— 进 / 运 / 存 / 出 / 管 任点一环
    ↓ 均进入
首页 (index.html?view=portal) —— 公示、系统公告、驾驶舱/应用大厅等入口
    ↓
数据驾驶舱 (cockpit.html) 等子系统
```

- 应用大厅五张卡片**统一**进入同一 **首页**（`index.html?view=portal`）。
- 首页横幅与核心功能区提供 **驾驶舱**、**应用大厅** 等跳转。

---

## 3. 应用大厅：五环节与首页关系

| 环节 | 应用大厅卡片点击后 |
|------|-------------------|
| 进 / 运 / 存 / 出 / 管 | 均 → `index.html?view=portal`（同一首页） |

业务子页（如 `warehouse.html`、`procurement-application.html`）仍可从首页核心功能或其它导航进入。

---

## 4. 统一返回规则

- 未登录访问 `cockpit-hub.html` → 重定向到 `index.html`（登录）。
- 已登录访问 `index.html` 且无 `view=portal` → 重定向到 `cockpit-hub.html`（应用大厅）。
- 已登录访问 `index.html?view=portal` → 展示首页正文。
- 退出登录 → `index.html`（登录页）。

---

## 5. 与左侧菜单子页的关系

- 子页使用 `subpage-clock.js` + `sidebar-actions.js`：**首页** → `index.html?view=portal`；**应用大厅** → `cockpit-hub.html`；**驾驶舱** → `cockpit.html`。
