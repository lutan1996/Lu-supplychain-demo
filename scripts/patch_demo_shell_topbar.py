#!/usr/bin/env python3
"""将 demo-all-pages-interactive.html / demo-interactive-single.html 顶栏替换为源码风格（保留左侧栏）。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = [ROOT / "demo-all-pages-interactive.html", ROOT / "demo-interactive-single.html"]

OLD_CSS = """    .main {
      display: grid;
      grid-template-rows: 52px 1fr;
      min-width: 0;
      min-height: 0;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      background: rgba(8, 21, 44, 0.85);
    }
    .current {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .actions a, .actions button {
      height: 30px;
      padding: 0 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: #102645;
      color: var(--text);
      text-decoration: none;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
"""

NEW_CSS = """    .main {
      display: grid;
      grid-template-rows: 3.75rem 1fr;
      min-width: 0;
      min-height: 0;
    }
    /* 顶栏：对齐 SupplyChainManageView Navbar.vue（#0a3382 + 左 Logo/标题） */
    .topbar {
      padding: 0;
      border-bottom: 0;
      background: #0a3382;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      min-height: 3.75rem;
    }
    .navbar-ruoyi {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      min-height: 3.75rem;
      color: #fff;
    }
    .navbar-ruoyi__left {
      display: flex;
      align-items: center;
      flex: 0 0 auto;
      padding-left: 8px;
    }
    .navbar-ruoyi__logo img {
      height: 40px;
      width: auto;
      max-width: 182px;
      display: block;
      object-fit: contain;
    }
    .navbar-ruoyi__title {
      border-left: 1px solid rgba(252, 252, 252, 0.17);
      margin-left: 12px;
      padding-left: 18px;
      height: 100%;
      display: flex;
      align-items: center;
    }
    .navbar-ruoyi__title p {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
      white-space: nowrap;
    }
    .navbar-ruoyi__center {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 12px;
    }
    .navbar-ruoyi__center .current {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #e9f2ff;
      max-width: 100%;
    }
    .navbar-ruoyi__right {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-right: 12px;
      flex: 0 0 auto;
    }
    .navbar-ruoyi__clock {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.92);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .navbar-ruoyi__avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
      user-select: none;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .actions a, .actions button {
      height: 30px;
      padding: 0 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(0, 0, 0, 0.15);
      color: #fff;
      text-decoration: none;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    .actions a:hover, .actions button:hover {
      background: rgba(0, 0, 0, 0.25);
      border-color: rgba(255, 255, 255, 0.55);
    }
    .bars {
      display: inline-flex;
      flex-direction: column;
      gap: 3px;
      vertical-align: middle;
    }
    .bars i {
      display: block;
      width: 14px;
      height: 2px;
      background: currentColor;
      border-radius: 1px;
    }
"""

OLD_HTML = """    <main class="main">
      <div class="topbar">
        <div class="current" id="currentTitle">当前页面：登录（账号密码）</div>
        <div class="actions">
          <button id="btnToggleShell" type="button" aria-label="隐藏侧栏" title="隐藏侧栏"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
          <button id="btnPrev" type="button">上一页</button>
          <button id="btnNext" type="button">下一页</button>
          <a id="openNewTab" href="index.html" target="_blank" rel="noopener noreferrer">新标签打开当前页</a>
        </div>
      </div>
"""

NEW_HTML = """    <main class="main">
      <div class="topbar">
        <div class="navbar-ruoyi">
          <div class="navbar-ruoyi__left">
            <div class="navbar-ruoyi__logo">
              <img src="assets/logo-chenergy.png" alt="" width="182" height="40" />
            </div>
            <div class="navbar-ruoyi__title">
              <p>新能源供应链管理系统</p>
            </div>
          </div>
          <div class="navbar-ruoyi__center">
            <div class="current" id="currentTitle">当前页面：登录（账号密码）</div>
          </div>
          <div class="navbar-ruoyi__right">
            <span class="navbar-ruoyi__clock" id="shellClock" aria-hidden="true"></span>
            <div class="actions">
              <button id="btnToggleShell" type="button" aria-label="隐藏侧栏" title="隐藏侧栏"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
              <button id="btnPrev" type="button">上一页</button>
              <button id="btnNext" type="button">下一页</button>
              <a id="openNewTab" href="index.html" target="_blank" rel="noopener noreferrer">新标签打开当前页</a>
            </div>
            <div class="navbar-ruoyi__avatar" title="用户">用</div>
          </div>
        </div>
      </div>
"""

INJECT_AFTER = """    var currentTitle = document.getElementById("currentTitle");
    var openNewTab = document.getElementById("openNewTab");
"""

INJECT_CLOCK = """    var currentTitle = document.getElementById("currentTitle");
    var shellClock = document.getElementById("shellClock");
    function tickShellClock() {
      if (!shellClock) return;
      var d = new Date();
      var p = function (n) { return n < 10 ? "0" + n : "" + n; };
      shellClock.textContent =
        d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
        " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    }
    tickShellClock();
    setInterval(tickShellClock, 1000);
    var openNewTab = document.getElementById("openNewTab");
"""


def main() -> None:
    for fp in FILES:
        if not fp.is_file():
            print("skip (missing):", fp)
            continue
        text = fp.read_text(encoding="utf-8")
        if OLD_CSS not in text:
            raise SystemExit(f"CSS block not found in {fp}")
        if OLD_HTML not in text:
            raise SystemExit(f"HTML block not found in {fp}")
        text = text.replace(OLD_CSS, NEW_CSS, 1)
        text = text.replace(OLD_HTML, NEW_HTML, 1)
        if INJECT_AFTER not in text:
            raise SystemExit(f"inject anchor not found in {fp}")
        if "tickShellClock" in text:
            print("already patched:", fp)
            continue
        text = text.replace(INJECT_AFTER, INJECT_CLOCK, 1)
        fp.write_text(text, encoding="utf-8")
        print("patched:", fp)


if __name__ == "__main__":
    main()
