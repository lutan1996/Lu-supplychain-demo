#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成单文件预览页（Vue3 + Element Plus + ECharts CDN）：
- 左侧菜单与顶部栏沿用 Cursor 原型壳（风格/结构）
- 内容区：用 Vue 组件切换
  - Vue 工程“已有模块”：使用已提取的 template 片段（vue-source-html-fragments）
  - Cursor 原型模块：先以占位/链接方式保留（后续可逐步内联交互逻辑）

输出：
  /Users/lutan/Desktop/integrated_supply_system_preview.html
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRAG_ROOT = ROOT / "vue-source-html-fragments"
OUT = Path("/Users/lutan/Desktop/integrated_supply_system_preview.html")


def read_frag(rel: str) -> str:
    p = FRAG_ROOT / rel
    return p.read_text(encoding="utf-8")


def js_string(s: str) -> str:
    # JSON dump yields a valid JS string literal
    return json.dumps(s, ensure_ascii=False)


def main() -> None:
    # 我的任务：映射为 4 个 tab
    frags = {
        "task_initiated": read_frag("01-我的任务/views__workflow__task__myDocument.vue.html"),
        "task_todo": read_frag("01-我的任务/views__workflow__task__taskWaiting.vue.html"),
        "task_done": read_frag("01-我的任务/views__workflow__task__taskFinish.vue.html"),
        "task_cc": read_frag("01-我的任务/views__workflow__task__taskCopyList.vue.html"),
    }

    # 采购管理：全部片段（用于列表展示）
    purchase_dir = FRAG_ROOT / "02-采购管理"
    purchase_frags = {}
    for fp in sorted(purchase_dir.glob("*.html")):
        key = "purchase_" + fp.stem
        purchase_frags[key] = fp.read_text(encoding="utf-8")

    # 仓库管理
    frags["warehouse_mgmt"] = read_frag(
        "03-仓库管理/views__system__warehouseManagement__index.vue.html"
    )

    # 退役及废旧：指定 6 个
    retired_map = {
        "retired_brand": "04-退役及废旧管理/views__system__brand__index.vue.html",
        "retired_model": "04-退役及废旧管理/views__system__model__index.vue.html",
        "retired_line": "04-退役及废旧管理/views__system__replaceBigSmallWindTransformation__index.vue.html",
        "retired_wind": "04-退役及废旧管理/views__system__windTurbineUnit__index.vue.html",
        "retired_engine": "04-退役及废旧管理/views__system__engineElectricalCabinet__index.vue.html",
        "retired_requisition": "04-退役及废旧管理/views__system__materialRequisition__index.vue.html",
        "retired_project": "04-退役及废旧管理/views__system__projectManagement__index.vue.html",
    }
    for k, rel in retired_map.items():
        frags[k] = read_frag(rel)

    # 公告：招标/非招标
    frags["notice_tender"] = read_frag(
        "05-公告管理/views__system__tenderNotice__index.vue.html"
    )
    frags["notice_nontender"] = read_frag(
        "05-公告管理/views__system__nonTenderNotice__index.vue.html"
    )

    # 标准规范
    frags["standard_spec"] = read_frag("06-标准规范/views__system__fileStandard__index.vue.html")

    # 数据：基础数据/供应商/编码
    frags["data_basic"] = read_frag(
        "07-数据管理-基础数据-供应商-编码/views__system__basicDataMaintenance__index.vue.html"
    )
    frags["data_supplier"] = read_frag(
        "07-数据管理-基础数据-供应商-编码/views__system__masterSuppliers__index.vue.html"
    )
    frags["data_code"] = read_frag(
        "07-数据管理-基础数据-供应商-编码/views__system__masterCode__index.vue.html"
    )

    # 开发工具 / 系统管理：全部片段
    devtool_frags = {}
    for fp in sorted((FRAG_ROOT / "08-开发工具").glob("*.html")):
        devtool_frags["dev_" + fp.stem] = fp.read_text(encoding="utf-8")
    sys_frags = {}
    for fp in sorted((FRAG_ROOT / "09-系统管理").glob("*.html")):
        sys_frags["sys_" + fp.stem] = fp.read_text(encoding="utf-8")

    html = f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>集成预览（Cursor 菜单壳 + Vue 模块）</title>
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <style>
    :root {{
      --bg: #060f22;
      --panel: #0b1a36;
      --panel-2: #12264b;
      --text: #e9f2ff;
      --muted: #9ab2d6;
      --accent-2: #00d4ff;
      --border: rgba(130, 186, 255, 0.25);
    }}
    * {{ box-sizing: border-box; }}
    html, body {{ height: 100%; }}
    body {{
      margin: 0;
      font-family: \"PingFang SC\",\"Microsoft YaHei\",sans-serif;
      background: var(--bg);
      color: var(--text);
      overflow: hidden;
    }}
    .shell {{
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr);
      width: 100%;
      height: 100%;
      min-height: 0;
    }}
    .sidebar {{
      border-right: 1px solid var(--border);
      background: linear-gradient(180deg, #0a1730 0%, #091224 100%);
      padding: 14px 12px;
      overflow: auto;
    }}
    .title {{
      margin: 0 0 6px;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }}
    .desc {{
      margin: 0 0 14px;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.4;
    }}
    .group-title {{
      margin: 14px 4px 8px;
      font-size: 12px;
      color: #b6cced;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }}
    .page-list {{ display: grid; gap: 8px; }}
    .page-btn {{
      width: 100%;
      padding: 10px 10px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%);
      color: var(--text);
      font-size: 13px;
      text-align: left;
      cursor: pointer;
      transition: 0.18s ease;
    }}
    .page-btn:hover {{
      border-color: rgba(74, 199, 255, 0.55);
      transform: translateY(-1px);
    }}
    .page-btn.active {{
      border-color: var(--accent-2);
      box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.25);
    }}
    .main {{
      display: grid;
      grid-template-rows: 3.75rem 1fr;
      min-width: 0;
      min-height: 0;
      background: #071229;
    }}
    .topbar {{
      padding: 0;
      border-bottom: 0;
      background: #0a3382;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      min-height: 3.75rem;
    }}
    .navbar-ruoyi {{
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      min-height: 3.75rem;
      color: #fff;
    }}
    .navbar-ruoyi__left {{
      display: flex;
      align-items: center;
      flex: 0 0 auto;
      padding-left: 8px;
    }}
    .navbar-ruoyi__logo img {{
      height: 40px; width: auto; max-width: 182px; display: block; object-fit: contain;
    }}
    .navbar-ruoyi__title {{
      border-left: 1px solid rgba(252, 252, 252, 0.17);
      margin-left: 12px;
      padding-left: 18px;
      height: 100%;
      display: flex;
      align-items: center;
    }}
    .navbar-ruoyi__title p {{ margin: 0; font-size: 1rem; font-weight: 700; color: #fff; white-space: nowrap; }}
    .navbar-ruoyi__center {{
      flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; padding: 0 12px;
    }}
    .navbar-ruoyi__center .current {{
      font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #e9f2ff;
    }}
    .navbar-ruoyi__right {{
      display:flex; align-items:center; gap:10px; padding-right:12px; flex:0 0 auto;
    }}
    .navbar-ruoyi__clock {{ font-size: 13px; color: rgba(255,255,255,0.92); font-variant-numeric: tabular-nums; }}
    .navbar-ruoyi__avatar {{
      width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.18);
      display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;user-select:none;
    }}
    .viewport {{
      min-width: 0;
      min-height: 0;
      overflow: auto;
      padding: 14px;
    }}
    /* 让 Element Plus 在深色底上更“像原系统”，内容区提供浅色卡片底 */
    .content-surface {{
      min-height: calc(100vh - 3.75rem - 28px);
      background: #f5f7fb;
      border: 1px solid rgba(130, 186, 255, 0.12);
      border-radius: 12px;
      padding: 12px;
    }}
    .placeholder {{
      background:#fff;
      border:1px dashed #dbe4f0;
      border-radius:10px;
      padding:14px;
      color:#3f5366;
      line-height:1.7;
    }}
    .placeholder a {{ color:#1677ff; text-decoration:none; }}
  </style>
</head>
<body>
  <div id="app" class="shell">
    <aside class="sidebar">
      <h1 class="title">集成预览</h1>
      <p class="desc">左侧菜单与顶栏来自 Cursor 原型；内容区按要求混合 Vue 既有模块与原型模块。</p>

      <div class="group-title">核心</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='home'}}" @click="go('home','首页')">首页</button>
        <button class="page-btn" :class="{{active: current==='cockpit'}}" @click="go('cockpit','驾驶舱')">驾驶舱</button>
      </div>

      <div class="group-title">我的任务（Vue）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='task_initiated'}}" @click="go('task_initiated','我发起的')">我发起的</button>
        <button class="page-btn" :class="{{active: current==='task_todo'}}" @click="go('task_todo','我的待办')">我的待办</button>
        <button class="page-btn" :class="{{active: current==='task_done'}}" @click="go('task_done','我的已办')">我的已办</button>
        <button class="page-btn" :class="{{active: current==='task_cc'}}" @click="go('task_cc','我的抄送')">我的抄送</button>
      </div>

      <div class="group-title">采购管理（Vue）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='purchase_index'}}" @click="go('purchase_index','采购管理（索引）')">采购管理（索引）</button>
      </div>

      <div class="group-title">仓储（仅仓库管理·Vue）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='warehouse_mgmt'}}" @click="go('warehouse_mgmt','仓库管理')">仓库管理</button>
        <button class="page-btn" :class="{{active: current==='warehouse_other'}}" @click="go('warehouse_other','仓储其它子模块')">其它子模块（原型）</button>
      </div>

      <div class="group-title">退役及废旧（部分·Vue）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='retired_brand'}}" @click="go('retired_brand','品牌')">品牌</button>
        <button class="page-btn" :class="{{active: current==='retired_model'}}" @click="go('retired_model','型号')">型号</button>
        <button class="page-btn" :class="{{active: current==='retired_line'}}" @click="go('retired_line','场内线路')">场内线路</button>
        <button class="page-btn" :class="{{active: current==='retired_wind'}}" @click="go('retired_wind','风电机组和箱变')">风电机组和箱变</button>
        <button class="page-btn" :class="{{active: current==='retired_requisition'}}" @click="go('retired_requisition','物资领用单')">物资领用单</button>
        <button class="page-btn" :class="{{active: current==='retired_project'}}" @click="go('retired_project','项目管理')">项目管理</button>
        <button class="page-btn" :class="{{active: current==='retired_new'}}" @click="go('retired_new','退役新增模块')">新增模块（原型）</button>
      </div>

      <div class="group-title">公告管理（Vue）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='notice_tender'}}" @click="go('notice_tender','招标公告')">招标公告</button>
        <button class="page-btn" :class="{{active: current==='notice_nontender'}}" @click="go('notice_nontender','非招标公告')">非招标公告</button>
      </div>

      <div class="group-title">标准规范（Vue）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='standard_spec'}}" @click="go('standard_spec','标准规范')">标准规范</button>
      </div>

      <div class="group-title">数据管理（部分·Vue）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='data_basic'}}" @click="go('data_basic','基础数据')">基础数据</button>
        <button class="page-btn" :class="{{active: current==='data_supplier'}}" @click="go('data_supplier','供应商数据')">供应商数据</button>
        <button class="page-btn" :class="{{active: current==='data_code'}}" @click="go('data_code','编码管理')">编码管理</button>
        <button class="page-btn" :class="{{active: current==='data_other'}}" @click="go('data_other','数据其它子模块')">其它子模块（原型）</button>
      </div>

      <div class="group-title">开发工具（Vue + 原型保留项）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='devtools_index'}}" @click="go('devtools_index','开发工具（索引）')">开发工具（索引）</button>
      </div>

      <div class="group-title">系统管理（Vue）</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='system_index'}}" @click="go('system_index','系统管理（索引）')">系统管理（索引）</button>
      </div>

      <div class="group-title">保留原型</div>
      <div class="page-list">
        <button class="page-btn" :class="{{active: current==='logistics'}}" @click="go('logistics','物流管理（原型）')">物流管理（原型）</button>
        <button class="page-btn" :class="{{active: current==='material_purchase'}}" @click="go('material_purchase','物资采购（原型）')">物资采购（原型）</button>
        <button class="page-btn" :class="{{active: current==='performance'}}" @click="go('performance','绩效考核（原型）')">绩效考核（原型）</button>
        <button class="page-btn" :class="{{active: current==='settings'}}" @click="go('settings','设置（原型）')">设置（原型）</button>
      </div>
    </aside>

    <main class="main">
      <div class="topbar">
        <div class="navbar-ruoyi">
          <div class="navbar-ruoyi__left">
            <div class="navbar-ruoyi__logo"><img src="assets/logo-chenergy.png" alt="" width="182" height="40" /></div>
            <div class="navbar-ruoyi__title"><p>新能源供应链管理系统</p></div>
          </div>
          <div class="navbar-ruoyi__center"><div class="current">当前页面：{{{{ currentTitle }}}}</div></div>
          <div class="navbar-ruoyi__right">
            <span class="navbar-ruoyi__clock">{{{{ clockText }}}}</span>
            <div class="navbar-ruoyi__avatar" title="用户">用</div>
          </div>
        </div>
      </div>
      <div class="viewport">
        <div class="content-surface">
          <component :is="CurrentView"></component>
        </div>
      </div>
    </main>
  </div>

  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/element-plus/dist/index.full.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
  <script>
    const VUE_FRAGS = {js_string(frags)};
    const PURCHASE_FRAGS = {js_string(purchase_frags)};
    const DEV_FRAGS = {js_string(devtool_frags)};
    const SYS_FRAGS = {js_string(sys_frags)};

    function makeTemplateComponent(tpl) {{
      return {{ name: 'TplView', template: String(tpl || '<div></div>') }};
    }}

    const Placeholder = (msg, href) => ({{
      name: 'Placeholder',
      template: `
        <div class="placeholder">
          <div style="font-weight:600;margin-bottom:8px;">${{msg}}</div>
          <div>该模块当前保留 Cursor 原型版本；本单文件预览的下一步会把原型 HTML+JS 完整内联到组件中。</div>
          ${{href ? `<div style=\"margin-top:10px;\">原型页参考：<a href=\"${{href}}\" target=\"_blank\" rel=\"noopener noreferrer\">${{href}}</a></div>` : ''}}
        </div>
      `
    }});

    const PurchaseIndex = {{
      name: 'PurchaseIndex',
      data() {{
        const keys = Object.keys(PURCHASE_FRAGS || {{}}).sort();
        return {{ keys, active: keys[0] || '' }};
      }},
      computed: {{
        ActiveView() {{
          const tpl = (PURCHASE_FRAGS && this.active) ? PURCHASE_FRAGS[this.active] : '';
          return makeTemplateComponent(tpl);
        }}
      }},
      template: `
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <el-card shadow="never" style="width:320px;flex:0 0 auto;">
            <div style="font-weight:700;margin-bottom:10px;">采购管理（15+ 子模块）</div>
            <el-select v-model="active" style="width:100%;" filterable>
              <el-option v-for="k in keys" :key="k" :label="k" :value="k" />
            </el-select>
            <div style="font-size:12px;color:#6b7a90;margin-top:8px;line-height:1.6;">
              说明：这里直接渲染从 Vue 工程提取的 template 片段；后续将逐步接入对应 script 逻辑。
            </div>
          </el-card>
          <div style="flex:1;min-width:0;">
            <component :is="ActiveView"></component>
          </div>
        </div>
      `
    }};

    const DevtoolsIndex = {{
      name: 'DevtoolsIndex',
      data() {{
        const keys = Object.keys(DEV_FRAGS || {{}}).sort();
        return {{ keys, active: keys[0] || '' }};
      }},
      computed: {{
        ActiveView() {{
          const tpl = (DEV_FRAGS && this.active) ? DEV_FRAGS[this.active] : '';
          return makeTemplateComponent(tpl);
        }}
      }},
      template: `
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <el-card shadow="never" style="width:320px;flex:0 0 auto;">
            <div style="font-weight:700;margin-bottom:10px;">开发工具（13 个子模块）</div>
            <el-select v-model="active" style="width:100%;" filterable>
              <el-option v-for="k in keys" :key="k" :label="k" :value="k" />
            </el-select>
            <div style="font-size:12px;color:#6b7a90;margin-top:8px;line-height:1.6;">
              原型中需保留的 admin监控 / 任务调度中心 / plus官网 将继续使用 Cursor 原型页（后续内联）。
            </div>
          </el-card>
          <div style="flex:1;min-width:0;">
            <component :is="ActiveView"></component>
          </div>
        </div>
      `
    }};

    const SystemIndex = {{
      name: 'SystemIndex',
      data() {{
        const keys = Object.keys(SYS_FRAGS || {{}}).sort();
        return {{ keys, active: keys[0] || '' }};
      }},
      computed: {{
        ActiveView() {{
          const tpl = (SYS_FRAGS && this.active) ? SYS_FRAGS[this.active] : '';
          return makeTemplateComponent(tpl);
        }}
      }},
      template: `
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <el-card shadow="never" style="width:320px;flex:0 0 auto;">
            <div style="font-weight:700;margin-bottom:10px;">系统管理</div>
            <el-select v-model="active" style="width:100%;" filterable>
              <el-option v-for="k in keys" :key="k" :label="k" :value="k" />
            </el-select>
          </el-card>
          <div style="flex:1;min-width:0;">
            <component :is="ActiveView"></component>
          </div>
        </div>
      `
    }};

    const VIEWS = {{
      home: Placeholder('首页（Cursor 原型保留）','index-portal-screen-alt.html'),
      cockpit: Placeholder('驾驶舱（Cursor 原型保留）','cockpit.html'),
      logistics: Placeholder('物流管理（Cursor 原型保留）','carrier-management.html'),
      material_purchase: Placeholder('物资采购（Cursor 原型保留）','material-procurement-hub.html'),
      performance: Placeholder('绩效考核（Cursor 原型保留）','performance-hub.html'),
      settings: Placeholder('设置（Cursor 原型保留）','settings.html'),

      task_initiated: makeTemplateComponent(VUE_FRAGS.task_initiated),
      task_todo: makeTemplateComponent(VUE_FRAGS.task_todo),
      task_done: makeTemplateComponent(VUE_FRAGS.task_done),
      task_cc: makeTemplateComponent(VUE_FRAGS.task_cc),

      purchase_index: PurchaseIndex,
      warehouse_mgmt: makeTemplateComponent(VUE_FRAGS.warehouse_mgmt),
      warehouse_other: Placeholder('仓储其它子模块（Cursor 原型保留）','warehouse.html'),

      retired_brand: makeTemplateComponent(VUE_FRAGS.retired_brand),
      retired_model: makeTemplateComponent(VUE_FRAGS.retired_model),
      retired_line: makeTemplateComponent(VUE_FRAGS.retired_line),
      retired_wind: makeTemplateComponent(VUE_FRAGS.retired_wind),
      retired_requisition: makeTemplateComponent(VUE_FRAGS.retired_requisition),
      retired_project: makeTemplateComponent(VUE_FRAGS.retired_project),
      retired_new: Placeholder('退役及废旧管理新增模块（Cursor 原型保留）','retired-module-hub.html'),

      notice_tender: makeTemplateComponent(VUE_FRAGS.notice_tender),
      notice_nontender: makeTemplateComponent(VUE_FRAGS.notice_nontender),
      standard_spec: makeTemplateComponent(VUE_FRAGS.standard_spec),

      data_basic: makeTemplateComponent(VUE_FRAGS.data_basic),
      data_supplier: makeTemplateComponent(VUE_FRAGS.data_supplier),
      data_code: makeTemplateComponent(VUE_FRAGS.data_code),
      data_other: Placeholder('数据管理其它子模块（Cursor 原型保留）','data-prototype-list.html'),

      devtools_index: DevtoolsIndex,
      system_index: SystemIndex,
    }};

    const App = {{
      data() {{
        return {{
          current: 'home',
          currentTitle: '首页',
          clockText: ''
        }};
      }},
      computed: {{
        CurrentView() {{
          return VIEWS[this.current] || VIEWS.home;
        }}
      }},
      methods: {{
        go(k, title) {{
          this.current = k;
          this.currentTitle = title || k;
        }},
        tick() {{
          const d = new Date();
          const pad = (n) => String(n).padStart(2,'0');
          this.clockText = `${{d.getFullYear()}}-${{pad(d.getMonth()+1)}}-${{pad(d.getDate())}} ${{pad(d.getHours())}}:${{pad(d.getMinutes())}}:${{pad(d.getSeconds())}}`;
        }}
      }},
      mounted() {{
        this.tick();
        setInterval(() => this.tick(), 1000);
      }}
    }};

    const app = Vue.createApp(App);
    app.use(ElementPlus);
    app.mount('#app');
  </script>
</body>
</html>
"""

    OUT.write_text(html, encoding="utf-8")
    print("Wrote", str(OUT))


if __name__ == "__main__":
    main()

