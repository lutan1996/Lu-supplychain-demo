# -*- coding: utf-8 -*-
"""
将项目内可交互跳转的 HTML 页面内联 css/js 并打包到 map-demo 根目录：
  demo-all-pages-interactive.html（主文件名）
  demo-interactive-single.html（同内容别名）
iframe 使用 srcdoc；相对路径 assets/ 在子文档中无法解析到磁盘文件，
故将各页引用的本地 assets/ 图片等内联为 data: URL，保证离线单文件演示可用。
"""
from __future__ import annotations

import base64
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_NAMES = ("demo-all-pages-interactive.html", "demo-interactive-single.html")
# 与壳层同目录的外置数据脚本（避免 100MB+ 全塞进 .html 导致 file:// 长时间无首屏）
DEMO_DATA_JS = "demo-inline-pages.data.js"
# index.html 是离线总入口壳层本身，打进 iframe 会壳套壳，禁止进入 pages_map
EXCLUDE = set(OUT_NAMES) | {"demo-all-in-one.html", DEMO_DATA_JS, "index.html"}
# 优先 index.html（与日常编辑一致）；勿把输出文件 demo-all-pages-interactive.html 当模板，否则二次构建会吃旧产物
SHELL_TEMPLATE_CANDIDATES = (
    "index.html",
    "demo-all-in-one.html",
    "demo-all-pages-interactive-v4.html",
)

LINK_TAG_RE = re.compile(r"<link\s+([^>]+)>", re.I)
SCRIPT_SRC_RE = re.compile(
    r'<script\s+src="([^"]+\.js)"\s*>\s*</script>',
    re.I,
)


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def assert_not_generated_artifact(filename: str, raw: str) -> None:
    """
    防止把已打包产物反向当成源页面再打包，造成 script/JSON 转义错乱。
    仅匹配真实占位序列 __DEMO_INLINE_DATA_n__；壳层 index.html 里 expandDemoInline 的正则字面量
    含 __DEMO_INLINE_DATA_ 子串但无数字占位，不应误杀。
    """
    if re.search(r"__DEMO_INLINE_DATA_\d+__", raw):
        raise RuntimeError(
            f"Refusing generated artifact as source page: {filename} contains __DEMO_INLINE_DATA_n__ placeholders."
        )


def escape_json_for_html_script(json_str: str) -> str:
    """
    嵌入 <script> 时，JSON 字符串里的 </script> 会提前结束标签，导致整页错乱。
    替换为 <\\/script> 后由 JS 字符串解析为 </script>，HTML 解析器不会误关 script。
    """
    repl = "<" + "\\/" + "script>"
    return re.sub(r"(?i)</script\s*>", repl, json_str)


def inline_styles(html: str, base: Path) -> str:
    def repl_tag(m: re.Match) -> str:
        full = m.group(0)
        inner = m.group(1)
        if "stylesheet" not in inner.lower():
            return full
        hm = re.search(r'href="([^"]+)"', inner)
        if not hm:
            return full
        href = hm.group(1)
        if href.startswith("http://") or href.startswith("https://"):
            return full
        fp = (base / href).resolve()
        if not fp.is_file():
            return full
        css = read_text(fp)
        # srcdoc 内联后 url(../webfonts) 会相对父页错位，改为相对站点根目录
        if "../webfonts/" in css:
            css = css.replace("url(../webfonts/", "url(css/webfonts/")
        return f'<style>\n/* inlined: {href} */\n{css}\n</style>'

    return LINK_TAG_RE.sub(repl_tag, html)


def patch_sidebar_actions_js(js: str) -> str:
    """嵌入演示页时 navigateBySidebarAction 已含 top/parent.__demoOpenPage，无需再替换。"""
    return js


def inline_scripts(html: str, base: Path) -> str:
    def repl(m: re.Match) -> str:
        src = m.group(1)
        if src.startswith("http://") or src.startswith("https://"):
            return m.group(0)
        fp = (base / src).resolve()
        if not fp.is_file():
            return m.group(0)
        body = read_text(fp)
        if "sidebar-actions.js" in src:
            body = patch_sidebar_actions_js(body)
        return f'<script>\n/* inlined: {src} */\n{body}\n</script>'

    return SCRIPT_SRC_RE.sub(repl, html)


DEMO_HELPER = """
<script>
(function () {
  function demoGo(u) {
    var shell = null;
    try {
      if (window.top && window.top !== window && typeof window.top.__demoOpenPage === "function") {
        shell = window.top;
      } else if (window.parent && window.parent !== window && typeof window.parent.__demoOpenPage === "function") {
        shell = window.parent;
      }
    } catch (e) {}
    if (shell) {
      shell.__demoOpenPage(u);
    } else {
      try {
        if (window.self !== window.top && window.parent && window.parent.postMessage) {
          window.parent.postMessage({ type: "map-demo-nav", href: String(u) }, "*");
          return;
        }
      } catch (e2) {}
      window.location.href = u;
    }
  }
  window.__demoGo = demoGo;
})();
</script>
"""


def patch_literal_navigations(html: str) -> str:
    pairs = [
        ('window.location.replace("index.html")', 'window.__demoGo("index.html")'),
        ('window.location.href = "index.html"', 'window.__demoGo("index.html")'),
        ('window.location.replace("index-portal-screen-alt.html")', 'window.__demoGo("index-portal-screen-alt.html")'),
        ('window.location.href = "index-portal-screen-alt.html"', 'window.__demoGo("index-portal-screen-alt.html")'),
        ('window.location.replace("cockpit-hub.html")', 'window.__demoGo("cockpit-hub.html")'),
        ('window.location.href = "cockpit-hub.html"', 'window.__demoGo("cockpit-hub.html")'),
        ('window.location.replace("cockpit.html")', 'window.__demoGo("cockpit.html")'),
        ("window.location.href = 'cockpit.html'", "window.__demoGo('cockpit.html')"),
        ('window.location.href = "cockpit.html"', 'window.__demoGo("cockpit.html")'),
    ]
    for a, b in pairs:
        html = html.replace(a, b)
    return html


def patch_index_portal_gate(html: str) -> str:
    old = """if (qs.get("view") === "portal") {
          showPortalContent();"""
    new = """if (qs.get("view") === "portal" || (typeof __DEMO_FORCE_PORTAL__ !== "undefined" && __DEMO_FORCE_PORTAL__)) {
          showPortalContent();"""
    if old in html:
        html = html.replace(old, new)

    old_login = """if (sessionStorage.getItem(STORAGE_KEY) === "1") {"""
    new_login = """if (sessionStorage.getItem(STORAGE_KEY) === "1" && !(typeof __DEMO_FORCE_LOGIN__ !== "undefined" && __DEMO_FORCE_LOGIN__)) {"""
    if old_login in html:
        html = html.replace(old_login, new_login)
    return html


def _mime_for_asset(rel: str) -> str:
    low = rel.lower()
    if low.endswith(".png"):
        return "image/png"
    if low.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if low.endswith(".webp"):
        return "image/webp"
    if low.endswith(".svg"):
        return "image/svg+xml"
    return "application/octet-stream"


def inline_demo_assets_for_srcdoc(
    html: str, base: Path, cache: dict[str, str] | None = None
) -> str:
    """
    将 assets/ 图片等转为 data: URL，避免 iframe srcdoc 下相对路径无法加载。
    对所有嵌入单文件演示的页面调用；cache 可在多次调用间复用，避免重复读盘。
    """
    if cache is None:
        cache = {}

    def data_url(rel: str) -> str | None:
        rel = rel.replace("\\", "/")
        if rel in cache:
            return cache[rel]
        fp = base / rel
        if not fp.is_file():
            return None
        mime = _mime_for_asset(rel)
        b64 = base64.b64encode(fp.read_bytes()).decode("ascii")
        u = "data:%s;base64,%s" % (mime, b64)
        cache[rel] = u
        return u

    def replace_css_url(m: re.Match) -> str:
        rel = m.group(1)
        u = data_url(rel)
        if not u:
            return m.group(0)
        return 'url("%s")' % u

    html = re.sub(r'url\("(assets/[^"]+)"\)', replace_css_url, html)
    html = re.sub(r"url\('(assets/[^']+)'\)", replace_css_url, html)

    def replace_img_src(m: re.Match) -> str:
        rel = m.group(1)
        u = data_url(rel)
        if not u:
            return m.group(0)
        return 'src="%s"' % u

    html = re.sub(r'src="(assets/[^"]+)"', replace_img_src, html)

    def replace_js_banner_bg(m: re.Match) -> str:
        rel = m.group(1)
        u = data_url(rel)
        if not u:
            return m.group(0)
        return 'bg: \'url("%s")\'' % u

    html = re.sub(
        r"bg:\s*'url\(\"(assets/[^\"]+)\"\)'",
        replace_js_banner_bg,
        html,
    )
    return html


def inline_font_urls_in_inlined_css(html: str, base: Path) -> str:
    """
    iframe srcdoc / blob 内相对路径 url(css/webfonts/*.woff2) 无法解析到磁盘文件，
    将已存在的字体文件转为 data: URL，保证离线单文件演示中 Font Awesome 图标可见。
    """
    cache: dict[str, str] = {}

    def font_url_data(rel: str) -> str | None:
        rel = rel.replace("\\", "/").lstrip("/")
        if rel in cache:
            return cache[rel]
        fp = (base / rel).resolve()
        if not fp.is_file():
            return None
        low = rel.lower()
        if low.endswith(".woff2"):
            mime = "font/woff2"
        elif low.endswith(".woff"):
            mime = "font/woff"
        elif low.endswith(".ttf"):
            mime = "font/ttf"
        else:
            return None
        b64 = base64.b64encode(fp.read_bytes()).decode("ascii")
        u = 'url("data:%s;base64,%s")' % (mime, b64)
        cache[rel] = u
        return u

    def repl_url(m: re.Match) -> str:
        path = m.group(1).strip()
        u = font_url_data(path)
        return u if u else m.group(0)

    # 仅替换已内联样式中的路径（inline_styles 已将 ../webfonts/ 改为 css/webfonts/）
    return re.sub(
        r'url\(\s*["\']?(css/webfonts/[^"\')\s]+\.(?:woff2|woff|ttf))["\']?\s*\)',
        repl_url,
        html,
        flags=re.I,
    )


def inline_china_geojson_for_srcdoc(html: str, base: Path) -> str:
    """
    cockpit 等页在单文件演示的 iframe srcdoc 内无真实 URL，fetch(相对路径 assets/geo/…) 会失败。
    将全国 GeoJSON 内联为 data: URL，使驾驶舱地图在 demo-all-pages-interactive 中仍可加载。
    """
    fp = base / "assets/geo/china-100000-full.json"
    if not fp.is_file():
        return html
    geo_text = fp.read_text(encoding="utf-8")
    # 兜底：直接内嵌 JSON 对象，避免 file/blob 场景下 fetch 本地资源失败
    inject_obj = "window.__DEMO_CHINA_GEOJSON__ = " + geo_text + ";"
    if "window.__DEMO_CHINA_GEOJSON__" not in html:
        if "<head>" in html:
            html = html.replace("<head>", "<head><script>" + inject_obj + "</script>", 1)
        else:
            html = "<script>" + inject_obj + "</script>\n" + html

    marker = "function loadChinaGeoJson() {"
    if marker in html and "if (window.__DEMO_CHINA_GEOJSON__)" not in html:
        html = html.replace(
            marker,
            marker + "\n        if (window.__DEMO_CHINA_GEOJSON__) return Promise.resolve(window.__DEMO_CHINA_GEOJSON__);",
            1,
        )
    return html


def inject_hide_sidebar_scrollbar_style(html: str) -> str:
    css = (
        "<style>"
        ".sidebar{scrollbar-width:none;-ms-overflow-style:none;}"
        ".sidebar::-webkit-scrollbar{width:0;height:0;display:none;}"
        "</style>"
    )
    if ".sidebar::-webkit-scrollbar{width:0;height:0;display:none;}" in html:
        return html
    if "<head>" in html:
        return html.replace("<head>", "<head>" + css, 1)
    return css + html


def prepare_embedded_html(
    filename: str, raw: str, base: Path, asset_cache: dict[str, str] | None = None
) -> str:
    html = raw
    html = inline_styles(html, base)
    html = inline_font_urls_in_inlined_css(html, base)
    html = inline_scripts(html, base)
    html = patch_literal_navigations(html)
    if filename == "index.html":
        html = patch_index_portal_gate(html)
    html = inline_demo_assets_for_srcdoc(html, base, asset_cache)
    html = inline_china_geojson_for_srcdoc(html, base)
    html = inject_hide_sidebar_scrollbar_style(html)
    if "window.__demoGo = demoGo" not in html:
        html = html.replace("<head>", "<head>" + DEMO_HELPER, 1)
    return html


def build_pages_map(base: Path) -> dict[str, str]:
    pages: dict[str, str] = {}
    asset_cache: dict[str, str] = {}
    for fp in sorted(base.glob("*.html")):
        if fp.name in EXCLUDE:
            continue
        if fp.name.startswith("demo-all-pages-interactive") or fp.name.startswith("demo-interactive-single"):
            continue
        # *-packed 常作为中间产物，避免直接参与源扫描
        if fp.name.endswith("-packed.html"):
            continue
        raw = read_text(fp)
        assert_not_generated_artifact(fp.name, raw)
        pages[fp.name] = prepare_embedded_html(fp.name, raw, base, asset_cache)

    # 首页入口统一：无论从 alt / packed / legacy 进入，都使用同一份首页内容
    alt = pages.get("index-portal-screen-alt.html")
    if alt:
        pages["index-portal-screen-alt-packed.html"] = alt
        pages["index.html?view=portal"] = alt

    return pages


_DATA_URL_DEDUPE_RE = re.compile(
    r"data:(?:image/(?:png|jpeg|jpg|webp|gif|svg\+xml)|font/(?:woff2|woff|ttf));base64,[A-Za-z0-9+/=\r\n]+",
    re.IGNORECASE,
)


def dedupe_inline_data_urls(pages: dict[str, str]) -> tuple[dict[str, str], list[str]]:
    """
    多页重复的同一 data: 图片 / 内联字体只存一份，HTML 内改为占位符，减小 __DEMO_PAGES__ 体积，
    切换时 Blob 复制的字节更少、略快。
    """
    counts: Counter[str] = Counter()
    for html in pages.values():
        for m in _DATA_URL_DEDUPE_RE.finditer(html):
            counts[m.group(0)] += 1
    dupes = [u for u, c in counts.items() if c >= 2 and len(u) > 200]
    if not dupes:
        return pages, []
    dupes.sort(key=len, reverse=True)
    idx_map = {u: i for i, u in enumerate(dupes)}

    def repl_page(html: str) -> str:
        out = html
        for u in dupes:
            ph = f"__DEMO_INLINE_DATA_{idx_map[u]}__"
            out = out.replace(u, ph)
        return out

    return {k: repl_page(v) for k, v in pages.items()}, dupes


# 左侧列表与 iframe 内点击映射（与 demo-all-in-one 一致并补充）
DEMO_META = [
    {"title": "登录（账号密码）", "file": "demo-login-placeholder.html", "group": "core"},
    {"title": "首页", "file": "index-portal-screen-alt.html", "group": "core"},
    {"title": "驾驶舱", "file": "cockpit.html", "group": "core"},
    {"title": "模块首页（旧）", "file": "module-home.html", "group": "other"},
    {"title": "采购申请", "file": "procurement-application.html", "group": "other"},
    {"title": "承运商管理", "file": "carrier-management.html", "group": "logistics"},
    {"title": "物流合同", "file": "logistics-contract.html", "group": "logistics"},
    {"title": "物流跟踪", "file": "logistics-tracking.html", "group": "logistics"},
    {"title": "物流付款", "file": "logistics-payment.html", "group": "logistics"},
    {"title": "仓储管理", "file": "warehouse.html", "group": "warehouse"},
    {"title": "收货入库", "file": "receipt-inbound.html", "group": "warehouse"},
    {"title": "扫码领用", "file": "scan-pick.html", "group": "warehouse"},
    {"title": "货位管理", "file": "slot-management.html", "group": "warehouse"},
    {"title": "盘库管理", "file": "inventory-check.html", "group": "warehouse"},
    {"title": "库内保养", "file": "warehouse-maintenance.html", "group": "warehouse"},
    {"title": "库存管理", "file": "inventory-management.html", "group": "warehouse"},
    {"title": "闲置物资", "file": "idle-materials.html", "group": "warehouse"},
    {"title": "退役及报废申请", "file": "retire-scrap-application.html", "group": "retired"},
    {"title": "设备评估", "file": "equipment-evaluation.html", "group": "retired"},
    {"title": "以大代小&循环再利用", "file": "big-small-reuse.html", "group": "retired"},
    {"title": "基础数据配置中心", "file": "base-data-material-ledger.html", "group": "data"},
    {"title": "合同管理", "file": "contract-management.html", "group": "purchase"},
    {"title": "采购计划表", "file": "purchase-plan-table.html", "group": "purchase"},
    {"title": "采购数据台账", "file": "purchase-ledger.html", "group": "purchase"},
    {"title": "货物台账", "file": "cargo-ledger.html", "group": "purchase"},
    {"title": "验收入库", "file": "proc-acceptance-inbound.html", "group": "purchase"},
    {"title": "领用申请审批", "file": "proc-use-approval.html", "group": "purchase"},
    {"title": "销售合同管理", "file": "proc-sales-contract.html", "group": "purchase"},
    {"title": "发货管理", "file": "proc-shipment.html", "group": "purchase"},
    {"title": "项目公司验收", "file": "proc-quality-accept.html", "group": "purchase"},
    {"title": "采购汇总报表", "file": "purchase-summary-report.html", "group": "purchase"},
    {"title": "出入库记录", "file": "warehouse-io-ledger.html", "group": "warehouse"},
    {"title": "物流台账", "file": "logistics-ledger.html", "group": "logistics"},
    {"title": "资产台账", "file": "asset-ledger.html", "group": "asset"},
    {"title": "子页模板", "file": "subpage-template.html", "group": "other"},
    {"title": "我的任务-原型列表", "file": "my-tasks-prototype-list.html", "group": "core"},
    {"title": "采购计划审批单（办理）", "file": "purchase-plan-approval-handle.html", "group": "core"},
    {"title": "驾驶舱分析", "file": "cockpit-analytics.html", "group": "core"},
    {"title": "采购管理聚合", "file": "purchase-management-hub.html", "group": "other"},
    {"title": "物资采购聚合", "file": "material-procurement-hub.html", "group": "other"},
    {"title": "退役子功能聚合", "file": "retired-module-hub.html", "group": "retired"},
    {"title": "绩效考核聚合", "file": "performance-hub.html", "group": "other"},
    {"title": "公告管理聚合", "file": "notice-hub.html", "group": "other"},
    {"title": "综合业务聚合", "file": "integrated-business-hub.html", "group": "other"},
    {"title": "系统管理聚合", "file": "system-admin-hub.html", "group": "other"},
]

# 与 js/sidebar-actions.js 中 SIDEBAR_ACTION_HREF 一致；侧栏映射以 sidebar-action-href.json 为准（可由 node 从 sidebar-actions.js 导出）
_SIDEBAR_ACTION_HREF_JSON = Path(__file__).resolve().parent / "sidebar-action-href.json"
SIDEBAR_ACTION_FOR_DEMO = json.loads(_SIDEBAR_ACTION_HREF_JSON.read_text(encoding="utf-8"))
# 无 data-action 时按按钮文案兜底（normalizeLabel 后匹配）
DEMO_LABEL_TO_FILE = {
    "首页": "index-portal-screen-alt.html",
    "应用大厅": "index-portal-screen-alt.html",
    "集团驾驶舱": "cockpit.html",
    "数据驾驶舱": "cockpit.html",
    "省级驾驶舱": "cockpit.html",
    "离线总演示": "demo-all-pages-interactive.html",
    "驾驶舱": "cockpit.html",
    "采购申请": "procurement-application.html",
    "采购计划管理": "purchase-plan-management.html",
    "订单/需求管理": "order-demand-management.html",
    "订单需求管理": "order-demand-management.html",
    "寻源管理": "material-procurement-hub.html?tab=m4",
    "合同管理": "contract-management.html",
    "采购付款": "material-procurement-hub.html?tab=m8",
    "退货换货管理": "material-procurement-hub.html?tab=m9",
    "货物质量验收": "material-procurement-hub.html?tab=m10",
    "物资采购信息管理": "purchase-material-info-management.html",
    "采购计划": "purchase-plan-management.html",
    "订单管理": "order-demand-management.html",
    "驾驶舱入口": "cockpit.html",
    "招投标管理": "material-procurement-hub.html?tab=m7",
    "采购订单": "order-demand-management.html",
    "采购合同": "purchase-management-hub.html?tab=p8",
    "供应商管理": "material-procurement-hub.html?tab=m5",
    "非招标零委资料审批": "purchase-pm-nonbid.html",
    "非招标采委会资料审批": "purchase-pm-nonbid.html",
    "采购计划审批单": "purchase-pm-plan.html",
    "长协采购结果使用审批单": "purchase-pm-longterm-result.html",
    "重新采购审批单": "purchase-pm-repurchase.html",
    "本部采购文件审查纪要": "purchase-pm-minutes.html",
    "招标零委会资料审批": "purchase-pm-bid.html",
    "招标采委会资料审批": "purchase-pm-bid.html",
    "终止采购审批": "purchase-pm-terminate.html",
    "终止采购审批单": "purchase-pm-terminate.html",
    "公司级集采计划审批": "purchase-pm-group-plan.html",
    "公司级集采计划审批单": "purchase-pm-group-plan.html",
    "15万以下采购结果审定(项目单位)": "purchase-pm-under15.html",
    "本月度招标采购计划申报": "purchase-pm-monthly-bid.html",
    "本部月度招标采购计划申报": "purchase-pm-monthly-bid.html",
    "本月度非招标采购计划申报": "purchase-pm-monthly-nonbid.html",
    "本部月度非招标采购计划申报": "purchase-pm-monthly-nonbid.html",
    "采购项目审定结果通知(非招标)": "purchase-pm-notice-nonbid.html",
    "基础数据维护": "purchase-pm-data-maintain.html",
    "归档目录": "purchase-pm-archive.html",
    "长协领用管理": "purchase-pm-longterm-use.html",
    "到货验收": "purchase-management-hub.html?tab=p9",
    "采购结算": "purchase-management-hub.html?tab=p9",
    "承运商管理": "carrier-management.html",
    "调度管理": "logistics-contract.html",
    "物流合同": "logistics-contract.html",
    "运单管理": "logistics-tracking.html",
    "物流跟踪": "logistics-tracking.html",
    "签收回执": "logistics-tracking.html",
    "物流付款": "logistics-payment.html",
    "货位管理": "slot-management.html",
    "盘库管理": "inventory-check.html",
    "库内保养": "warehouse-maintenance.html",
    "收货入库": "receipt-inbound.html",
    "出库管理": "inventory-management.html",
    "调拨管理": "inventory-management.html",
    "库存管理": "inventory-management.html",
    "闲置物资": "idle-materials.html",
    "仓库管理": "warehouse.html",
    "物资目录": "base-data-material-ledger.html",
    "价格库": "base-data-material-ledger.html",
    "扫码领用": "scan-pick.html",
    "物资台账": "purchase-ledger.html?tab=material",
    "物资台帐": "purchase-ledger.html?tab=material",
    "仓储管理": "warehouse.html",
    "物流管理": "carrier-management.html",
    "退役及报废申请": "retire-scrap-application.html",
    "设备评估": "equipment-evaluation.html",
    "以大代小&循环再利用": "big-small-reuse.html",
    "以大代小循环再利用": "big-small-reuse.html",
    "基础数据": "base-data-material-ledger.html",
    "基础数据总览": "base-data-material-ledger.html",
    "供应商管理": "base-data-material-ledger.html?tab=supplier",
    "产品类别管理": "base-data-material-ledger.html?tab=product",
    "人员数据": "base-data-material-ledger.html?tab=personnel",
    "公司部门数据": "base-data-material-ledger.html?tab=department",
    "项目公司管理": "base-data-material-ledger.html?tab=company",
    "场站管理": "base-data-material-ledger.html?tab=station",
    "物资类别字典": "base-data-material-ledger.html?tab=dict",
    "汇率税率配置": "base-data-material-ledger.html?tab=rateTax",
    "编码规则管理": "base-data-material-ledger.html?tab=codeRule",
    "基础数据-物资台账": "base-data-material-ledger.html",
    "采购数据台账": "purchase-ledger.html",
    "采购计划表": "purchase-plan-table.html",
    "货物台账": "purchase-ledger.html?tab=cargo",
    "采购汇总报表": "purchase-summary-report.html",
    "验收入库": "proc-acceptance-inbound.html",
    "领用申请审批": "proc-use-approval.html",
    "销售合同管理": "proc-sales-contract.html",
    "发货管理": "proc-shipment.html",
    "货物质量验收": "proc-quality-accept.html",
    "项目公司验收": "proc-quality-accept.html",
    "出入库记录": "warehouse-io-ledger.html",
    "物流台账": "logistics-ledger.html",
    "资产台账": "asset-ledger.html",
    "OA单点集成": "oa-flow-center.html?tab=sso",
    "OA流程样式": "oa-flow-center.html?tab=style",
    "A4打印/PDF导出": "oa-flow-center.html?tab=print",
    "流程退回/撤回": "oa-flow-center.html?tab=return",
    "流程知会": "oa-flow-center.html?tab=notify",
    "财务数据导出": "oa-flow-center.html?tab=export",
    "绩效看板": "performance-hub.html?tab=login",
    "KPI考核": "performance-hub.html?tab=flow",
    "考核规则": "performance-hub.html?tab=flow",
    "登录频次统计": "performance-hub.html?tab=login",
    "流程频次统计": "performance-hub.html?tab=flow",
    "招标公告": "notice-prototype-list.html?scene=bid",
    "非招标公告": "notice-prototype-list.html?scene=nonbid",
    "招标公示": "notice-prototype-list.html?scene=bid",
    "公司公告": "notice-hub.html?tab=nonbid",
    "制度公告": "notice-hub.html?tab=nonbid",
    "系统公告": "notice-hub.html?tab=nonbid",
    "培训公告": "notice-hub.html?tab=nonbid",
    "运维公告": "notice-hub.html?tab=nonbid",
    "业务总览": "integrated-business-hub.html?tab=fin",
    "业务中心": "procurement-application.html",
    "流程管理": "integrated-business-hub.html?tab=flow",
    "协同平台": "carrier-management.html",
    "财务管理": "integrated-business-hub.html?tab=fin",
    "维修管理": "integrated-business-hub.html?tab=rep",
    "调剂管理": "integrated-business-hub.html?tab=adj",
    "应急物资管理": "integrated-business-hub.html?tab=emg",
    "标准规范": "integrated-business-hub.html?tab=std",
    "业务流程设计": "integrated-business-hub.html?tab=flow",
    "物资理赔": "integrated-business-hub.html?tab=claim",
    "物资履历": "base-data-material-ledger.html",
    "国产化替代": "integrated-business-hub.html?tab=dom",
    "专家管理": "integrated-business-hub.html?tab=exp",
    "基础数据台账": "base-data-material-ledger.html",
    "报表中心": "subpage-template.html",
    "数据稽核": "equipment-evaluation.html",
    "主数据维护": "base-data-material-ledger.html",
    "数据质量": "equipment-evaluation.html",
    "供应商数据": "data-supplier-fixed.html",
    "产品目录": "base-data-material-ledger.html",
    "编码管理": "data-code-fixed.html",
    "数据模型": "equipment-evaluation.html",
    "决策分析支持": "cockpit-analytics.html",
    "子页模板": "subpage-template.html",
    "在线用户": "devtools-prototype-list.html?scene=onlineUser",
    "租户管理": "devtools-prototype-list.html?scene=tenant",
    "测试单表": "devtools-prototype-list.html?scene=testForm",
    "测试树表": "devtools-prototype-list.html?scene=testTree",
    "流程分类": "devtools-prototype-list.html?scene=flowCategory",
    "请假申请": "devtools-prototype-list.html?scene=leave",
    "租户套餐管理": "devtools-prototype-list.html?scene=tenantPackage",
    "模型管理": "devtools-prototype-list.html?scene=modelManage",
    "流程定义": "devtools-prototype-list.html?scene=processDefine",
    "流程实例": "devtools-prototype-list.html?scene=flowInstance",
    "待办任务": "devtools-prototype-list.html?scene=pendingTask",
    "缓存监控": "devtools-prototype-list.html?scene=cacheMonitor",
    "Admin监控": "subpage-template.html",
    "表单管理": "devtools-prototype-list.html?scene=formManage",
    "任务调度中心": "subpage-template.html",
    "PLUS官网": "subpage-template.html",
    "接口调试": "subpage-template.html",
    "个人设置": "index-portal-screen-alt.html",
    "安全设置": "index-portal-screen-alt.html",
    "主题设置": "index-portal-screen-alt.html",
    "登录": "demo-login-placeholder.html",
    "密码管理": "index-portal-screen-alt.html",
    "人员管理": "system-prototype-list.html?scene=user",
    "公司部门管理": "system-prototype-list.html?scene=dept",
    "权限管理": "system-prototype-list.html?scene=post",
    "用户管理": "system-prototype-list.html?scene=user",
    "角色权限": "system-prototype-list.html?scene=role",
    "菜单管理": "system-prototype-list.html?scene=menu",
    "角色管理": "system-prototype-list.html?scene=role",
    "代码生成": "system-prototype-list.html?scene=codegen",
    "部门管理": "system-prototype-list.html?scene=dept",
    "岗位管理": "system-prototype-list.html?scene=post",
    "字典管理": "system-prototype-list.html?scene=dict",
    "参数设置": "system-prototype-list.html?scene=params",
    "通知公告": "system-prototype-list.html?scene=notice",
    "文件管理": "system-prototype-list.html?scene=file",
    "客户端管理": "system-prototype-list.html?scene=client",
    "系统日志": "system-prototype-list.html?scene=notice",
    "任务中心": "my-tasks-prototype-list.html?scene=todo",
    "待审批": "my-tasks-prototype-list.html?scene=todo",
    "任务跟踪": "my-tasks-prototype-list.html?scene=todo",
    "我发起的": "my-tasks-prototype-list.html?scene=initiated",
    "我的待办": "my-tasks-prototype-list.html?scene=todo",
    "我的已办": "my-tasks-prototype-list.html?scene=done",
    "我的抄送": "my-tasks-prototype-list.html?scene=cc",
    "个人资产": "assets-personal.html",
    "部门资产": "assets-department.html",
    "公司资产": "assets-company.html",
    "资产交接": "asset-transfer-management.html",
    "性质转变": "asset-nature-change-management.html",
    "盘点管理": "asset-inventory-management.html",
}


def build_shell_script() -> str:
    meta_json = json.dumps(DEMO_META, ensure_ascii=False)
    action_json = json.dumps(SIDEBAR_ACTION_FOR_DEMO, ensure_ascii=False)
    label_json = json.dumps(DEMO_LABEL_TO_FILE, ensure_ascii=False)
    return f"""
  <script>
  var __DEMO_PAGES__ = __EMBED_PAGES_JSON__;
  var __DEMO_INLINE_ASSETS__ = __EMBED_ASSETS_JSON__;
  function expandDemoInline(html) {{
    if (!html || !__DEMO_INLINE_ASSETS__ || !__DEMO_INLINE_ASSETS__.length) return html;
    return html.replace(/__DEMO_INLINE_DATA_(\\d+)__/g, function (_, i) {{
      var n = parseInt(i, 10);
      return __DEMO_INLINE_ASSETS__[n] !== undefined ? __DEMO_INLINE_ASSETS__[n] : "";
    }});
  }}
  (function () {{
    var meta = {meta_json};
    var pages = __DEMO_PAGES__;
    var frame = document.getElementById("demoFrame");
    var viewport = document.querySelector(".viewport");
    var currentTitle = document.getElementById("currentTitle");
    var openNewTab = document.getElementById("openNewTab");
    var coreList = document.getElementById("coreList");
    var logisticsList = document.getElementById("logisticsList");
    var warehouseList = document.getElementById("warehouseList");
    var retiredList = document.getElementById("retiredList");
    var dataList = document.getElementById("dataList");
    var otherList = document.getElementById("otherList");
    var btnPrev = document.getElementById("btnPrev");
    var btnNext = document.getElementById("btnNext");
    var actionsBar = btnPrev && btnPrev.parentNode ? btnPrev.parentNode : null;

    // 演示壳子：一键左滑隐藏侧栏
    if (!document.getElementById("demoShellCollapseStyle")) {{
      var st = document.createElement("style");
      st.id = "demoShellCollapseStyle";
      st.textContent =
        "body.demo-shell-collapsed .shell{{grid-template-columns:0 1fr !important;}}" +
        "body.demo-shell-collapsed .sidebar{{width:0 !important;padding:0 !important;border-right:0 !important;overflow:hidden !important;opacity:0;visibility:hidden;pointer-events:none;}}" +
        "body.demo-shell-collapsed .main{{min-width:0;}}";
      document.head.appendChild(st);
    }}
    function syncDemoShellCollapsedUi() {{
      var collapsed = document.body.classList.contains("demo-shell-collapsed");
      var label = collapsed ? "显示侧栏" : "隐藏侧栏";
      var btnShell = document.getElementById("btnToggleShell");
      if (btnShell) {{
        btnShell.setAttribute("aria-label", label);
        btnShell.setAttribute("title", label);
        if (btnShell.textContent && btnShell.textContent.indexOf("侧栏") >= 0) {{
          btnShell.textContent = label;
        }}
      }}
    }}
    function toggleDemoShellCollapsed() {{
      document.body.classList.toggle("demo-shell-collapsed");
      syncDemoShellCollapsedUi();
    }}
    (function () {{
      var btnShell = document.getElementById("btnToggleShell");
      if (!btnShell && actionsBar && btnPrev) {{
        btnShell = document.createElement("button");
        btnShell.id = "btnToggleShell";
        btnShell.type = "button";
        btnShell.textContent = "隐藏侧栏";
        actionsBar.insertBefore(btnShell, btnPrev);
      }}
      if (btnShell) btnShell.addEventListener("click", toggleDemoShellCollapsed);
      /* 默认收拢「离线演示总入口」侧栏，主区全宽；需要时点顶栏「显示侧栏」 */
      syncDemoShellCollapsedUi();
    }})();

    /* 大 HTML 写入 iframe 会阻塞解析；必须先让壳层标题/骨架页绘制，再在 rAF 后做 expand + Blob，避免主线程长时间无反馈 */
    if (!document.getElementById("demoShellLoadingStyle")) {{
      var stLoad = document.createElement("style");
      stLoad.id = "demoShellLoadingStyle";
      stLoad.textContent =
        ".viewport.is-demo-loading{{position:relative;}}" +
        "/* 禁用 iframe pointer-events 会导致子页永远收不到点击（load 未触发时 is-demo-loading 不解除则蓝框等全部失效） */" +
        ".viewport.is-demo-loading iframe{{transition:opacity 0.15s ease;opacity:0.97;}}" +
        ".viewport.is-demo-loading::after{{content:'';position:absolute;right:14px;top:50%;width:18px;height:18px;margin-top:-9px;" +
        "border:2px solid #dbe6f3;border-top-color:#1677ff;border-radius:50%;animation:demoShellSpin 0.55s linear infinite;}}" +
        "@keyframes demoShellSpin{{to{{transform:rotate(360deg);}}}}";
      document.head.appendChild(stLoad);
    }}

    /* 展开结果按 file 缓存，避免重复 expandDemoInline（同页多次进入时明显加速） */
    var htmlExpandedCache = {{}};
    function getExpandedHtmlForFile(file, raw) {{
      if (htmlExpandedCache[file]) return htmlExpandedCache[file];
      var h = expandDemoInline(raw);
      htmlExpandedCache[file] = h;
      return h;
    }}

    /* 极短骨架页：立即写入 iframe，不经过 expand，保证点击后先看到内容区反馈 */
    var DEMO_IFRAME_SKELETON =
      "<!DOCTYPE html><html lang=\\"zh-CN\\"><head><meta charset=\\"UTF-8\\"/><meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1\\"/>" +
      "<style>html,body{{height:100%;margin:0}}body{{display:flex;align-items:center;justify-content:center;background:#f5f7fa;color:#516a87;" +
      "font:14px/1.5 system-ui,-apple-system,BlinkMacSystemFont,sans-serif}}.w{{display:flex;flex-direction:column;align-items:center;gap:14px}}" +
      ".sp{{width:36px;height:36px;border:3px solid #e8eef7;border-top-color:#1677ff;border-radius:50%;animation:d .75s linear infinite}}" +
      "@keyframes d{{to{{transform:rotate(360deg)}}}}</style></head><body><div class=\\"w\\"><div class=\\"sp\\"></div><div>页面加载中…</div></div></body></html>";

    var currentIndex = 0;
    var buttons = [];
    var pagesList = [];
    var fileToIndex = {{}};

    var actionToFile = {action_json};
    var labelToFile = {label_json};
    var demoSceneHintByFile = {{}};
    var demoTabHintByFile = {{}};

    function normalizeLabel(s) {{
      return (s || "")
        .replace(/\\s+/g, "")
        .replace(/[|｜]/g, "")
        .replace(/&amp;|＆/gi, "&");
    }}

    function buildList() {{
      meta.forEach(function (m) {{
        if (pages[m.file]) {{
          pagesList.push(m);
          fileToIndex[m.file] = pagesList.length - 1;
        }}
      }});
      /* 与侧栏 sidebar-actions.js 一致：除 meta 外，把所有已打包进 pages 的 .html 也登记进 fileToIndex，
         否则 iframe 内 navigateBySidebarAction → __demoOpenPage 会因找不到键而静默失败（点击无反应）。 */
      var extra = Object.keys(pages || {{}}).filter(function (fname) {{
        return fname && !fileToIndex.hasOwnProperty(fname);
      }});
      extra.sort();
      extra.forEach(function (fname) {{
        if (!pages[fname]) return;
        var shortTitle = String(fname).replace(/\\.html$/i, "");
        pagesList.push({{ title: shortTitle, file: fname, group: "other" }});
        fileToIndex[fname] = pagesList.length - 1;
      }});
    }}

    buildList();

    /* 与 file:// 打开 index-portal-screen-alt.html 同源；旧链接 index.html?view=portal 仍指向同一套嵌入 HTML */
    (function () {{
      var home = "index-portal-screen-alt.html";
      var legacy = "index.html?view=portal";
      if (fileToIndex.hasOwnProperty(home) && pages.hasOwnProperty(legacy)) {{
        fileToIndex[legacy] = fileToIndex[home];
      }}
    }})();

    function demoStripPageSubForLookup(href) {{
      var h = String(href || "").split("#")[0].trim();
      var qi = h.indexOf("?");
      if (qi < 0) return h;
      try {{
        var sp = new URLSearchParams(h.slice(qi + 1));
        if (!sp.has("pageSub")) return h;
        sp.delete("pageSub");
        var rest = sp.toString();
        return rest ? h.slice(0, qi + 1) + rest : h.slice(0, qi);
      }} catch (e0) {{
        return h;
      }}
    }}

    function demoLookupCandidates(key) {{
      var candidates = [];
      var seen = {{}};
      function add(x) {{
        if (x && !seen[x]) {{ seen[x] = true; candidates.push(x); }}
      }}
      add(key);
      var noPs = demoStripPageSubForLookup(key);
      if (noPs !== key) add(noPs);
      var baseOnly = key.split("?")[0];
      /* 含 view=portal 时绝不能退成裸 index.html，否则会打开登录页而非门户首页 */
      if (!(key.indexOf("view=portal") >= 0 && baseOnly === "index.html")) {{
        add(baseOnly);
      }}
      var slash = key.lastIndexOf("/");
      if (slash >= 0) {{
        add(key.slice(slash + 1));
        var q = key.indexOf("?");
        if (q > slash) add(key.slice(slash + 1, q));
      }}
      return candidates;
    }}

    /** 含 #fragment 的 href 追加 pageSub 时必须插在 ? 与 # 之间，否则整段落入 hash，壳层解析与 switchTo 注入会失效 */
    function demoAppendPageSubBeforeHash(href, label) {{
      if (!href || !label) return href;
      var s = String(href);
      if (s.indexOf("pageSub=") >= 0) return href;
      var hashIdx = s.indexOf("#");
      var base = hashIdx >= 0 ? s.slice(0, hashIdx) : s;
      var frag = hashIdx >= 0 ? s.slice(hashIdx) : "";
      var sep = base.indexOf("?") >= 0 ? "&" : "?";
      return base + sep + "pageSub=" + encodeURIComponent(String(label).trim()) + frag;
    }}

    window.__demoOpenPage = function (href) {{
      if (!href) return false;
      var key = String(href).split("#")[0].trim();
      var qIdx = key.indexOf("?");
      if (qIdx >= 0) {{
        try {{
          var sp = new URLSearchParams(key.slice(qIdx + 1));
          var sc = (sp.get("scope") || "").trim();
          if (sc) sessionStorage.setItem("cockpitScope", sc);
          var scene = (sp.get("scene") || "").trim();
          if (scene) {{
            sessionStorage.setItem("demoScene", scene);
            var baseFile = key.slice(0, qIdx);
            demoSceneHintByFile[baseFile] = scene;
            if (baseFile.indexOf("devtools-prototype-list") >= 0) {{
              sessionStorage.setItem("demoDevtoolsScene", scene);
            }}
          }}
          var tab = (sp.get("tab") || "").trim();
          if (tab) {{
            sessionStorage.setItem("demoTab", tab);
            var baseFileTab = key.slice(0, qIdx);
            demoTabHintByFile[baseFileTab] = tab;
            if (baseFileTab.indexOf("performance-hub") >= 0 && (tab === "flow" || tab === "login")) {{
              sessionStorage.setItem("demoPerformanceTab", tab);
            }}
          }}
          var ps = sp.get("pageSub");
          if (ps !== null && ps !== undefined) sessionStorage.setItem("pageSub", ps);
        }} catch (eScope) {{}}
      }}
      var candidates = demoLookupCandidates(key);
      for (var ci = 0; ci < candidates.length; ci++) {{
        var c = candidates[ci];
        if (c && fileToIndex.hasOwnProperty(c)) {{
          switchTo(fileToIndex[c], href);
          return true;
        }}
      }}
      return false;
    }};

    window.addEventListener("message", function (e) {{
      var d = e.data;
      if (!d || d.type !== "map-demo-nav" || typeof d.href !== "string") return;
      var h = d.href.trim();
      if (!h || h.indexOf("..") >= 0) return;
      var low = h.toLowerCase();
      if (low.indexOf("http://") === 0 || low.indexOf("https://") === 0) return;
      if (typeof window.__demoOpenPage === "function") {{
        window.__demoOpenPage(h);
      }}
    }});

    function navigateByFile(file) {{
      if (!file) return false;
      var raw = String(file).split("#")[0].trim();
      var qPos = raw.indexOf("?");
      if (qPos >= 0) {{
        try {{
          var base = raw.slice(0, qPos);
          var sp = new URLSearchParams(raw.slice(qPos + 1));
          var sc = (sp.get("scope") || "").trim();
          if (sc) sessionStorage.setItem("cockpitScope", sc);
          var scene = (sp.get("scene") || "").trim();
          if (scene) {{
            sessionStorage.setItem("demoScene", scene);
            demoSceneHintByFile[base] = scene;
            if (base.indexOf("devtools-prototype-list") >= 0) {{
              sessionStorage.setItem("demoDevtoolsScene", scene);
            }}
          }}
          var tab = (sp.get("tab") || "").trim();
          if (tab) {{
            sessionStorage.setItem("demoTab", tab);
            demoTabHintByFile[base] = tab;
            if (base.indexOf("performance-hub") >= 0 && (tab === "flow" || tab === "login")) {{
              sessionStorage.setItem("demoPerformanceTab", tab);
            }}
          }}
          var ps = sp.get("pageSub");
          if (ps !== null && ps !== undefined) sessionStorage.setItem("pageSub", ps);
        }} catch (eNav) {{}}
      }}
      var candidates = demoLookupCandidates(raw);
      for (var ci = 0; ci < candidates.length; ci++) {{
        var f = candidates[ci];
        if (f && fileToIndex.hasOwnProperty(f)) {{
          switchTo(fileToIndex[f], raw);
        return true;
        }}
      }}
      return false;
    }}

    function renderButton(item, index) {{
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "page-btn";
      btn.textContent = item.title + "  (" + item.file + ")";
      btn.addEventListener("click", function () {{
        switchTo(index);
      }});
      buttons.push(btn);
      return btn;
    }}

    pagesList.forEach(function (item, index) {{
      var btn = renderButton(item, index);
      if (item.group === "logistics") logisticsList.appendChild(btn);
      else if (item.group === "warehouse") warehouseList.appendChild(btn);
      else if (item.group === "retired") retiredList.appendChild(btn);
      else if (item.group === "data") dataList.appendChild(btn);
      else if (item.group === "other") otherList.appendChild(btn);
      else if (item.group === "core") {{
        // 演示侧栏隐藏「核心页面」分组
      }} else if (coreList) {{
        coreList.appendChild(btn);
      }} else if (otherList) {{
        otherList.appendChild(btn);
      }}
    }});

    function finishDemoShellUi(item, index) {{
      if (demoLoadingSafetyTimer) {{
        clearTimeout(demoLoadingSafetyTimer);
        demoLoadingSafetyTimer = null;
      }}
      currentTitle.textContent = "当前页面：" + item.file.replace(/\.html.*/i, "");
      if (openNewTab) openNewTab.href = item.file;
      buttons.forEach(function (b, i) {{
        b.classList.toggle("active", i === index);
      }});
      if (viewport) viewport.classList.remove("is-demo-loading");
    }}

    /* iframe 内点击委托：从 load 里抽出，便于 Blob / srcdoc 任一路径绑定 */
    function tryBindDemoIframeNav() {{
      var doc;
      try {{
        doc = frame.contentDocument || frame.contentWindow.document;
      }} catch (e0) {{
        return;
      }}
      if (!doc || doc.__demoNavBound) return;
      doc.__demoNavBound = true;
      doc.addEventListener("click", function (e) {{
        var sbNav = e.target && e.target.closest ? e.target.closest(".sidebar .nav-item") : null;
        if (
          sbNav &&
          sbNav.getAttribute("data-master-module") &&
          !(e.target.closest && e.target.closest(".warehouse-secondary-panel"))
        ) {{
          return;
        }}

        var el = e.target && e.target.closest
          ? e.target.closest("a,button,[data-action],.warehouse-secondary-link,.retired-main-title")
          : null;
        if (!el) return;

        if (
          (el.matches && (
            el.matches("[data-main-tab]") ||
            el.matches("[data-main-panel]") ||
            el.matches("[data-task]") ||
            el.matches("[data-task-panel]") ||
            el.matches("[data-biz-tab]") ||
            el.matches("[data-biz-filter]") ||
            el.matches("[data-notice-tab]") ||
            el.matches("[data-pub]") ||
            el.matches("[data-pub-panel]") ||
            el.matches(".notice-tab") ||
            el.matches(".notice-detail")
          )) ||
          (el.closest && (
            el.closest(".tabs") ||
            el.closest(".sub-tabs") ||
            el.closest(".notice-tabs") ||
            el.closest("#bizFilterRow") ||
            el.closest(".biz-filter-row")
          ))
        ) {{
          return;
        }}

        var file = "";
        var action = el.getAttribute && el.getAttribute("data-action");
        var hasAction = !!action;
        /* 恢复：data-action 在父页 actionToFile 解析后 navigateByFile→switchTo（与改之前一致），不依赖 iframe 内脚本 */
        if (hasAction && actionToFile && actionToFile.hasOwnProperty(action)) {{
          file = actionToFile[action];
          var dl = el.getAttribute && el.getAttribute("data-label");
          if (dl && String(dl).trim() && file.indexOf("pageSub=") < 0) {{
            file = demoAppendPageSubBeforeHash(file, String(dl).trim());
          }}
        }}

        if (!file) {{
          var href = el.getAttribute && el.getAttribute("href");
          if (href && /\\.html(?:$|[?#])/.test(href)) {{
            var noHash = href.split("#")[0].trim();
            var cand = [noHash, noHash.split("?")[0]];
            var sli = noHash.lastIndexOf("/");
            if (sli >= 0) cand.push(noHash.slice(sli + 1));
            var cj = 0;
            for (cj = 0; cj < cand.length && !file; cj++) {{
              if (cand[cj] && fileToIndex.hasOwnProperty(cand[cj])) file = cand[cj];
            }}
          }}
        }}

        if (!file && !hasAction) {{
          var label = normalizeLabel((el.getAttribute && (el.getAttribute("data-label") || el.getAttribute("title"))) || el.textContent);
          file = labelToFile[label] || "";
        }}

        if (navigateByFile(file)) {{
          e.preventDefault();
          e.stopPropagation();
          return;
        }}
      }}, true);
    }}

    var demoBlobUrl = null;
    /* 必须为 true：Blob URL 的 iframe 与 file:// 父页不同源，子页无法可靠调用 parent.__demoOpenPage / postMessage，蓝框子功能会全部失效。srcdoc 与父页同源，侧栏跳转才能工作。 */
    var demoUseSrcdocOnly = true;
    var demoLoadingSafetyTimer = null;

    function switchTo(index, optFullHref) {{
      if (index < 0 || index >= pagesList.length) return;
      var prevIndex = currentIndex;
      currentIndex = index;
      var item = pagesList[index];
      var raw = pages[item.file];
      if (!raw) return;
      try {{
        sessionStorage.setItem("portalLoggedIn_v1", "1");
      }} catch (e) {{}}
      currentTitle.textContent = "当前页面：加载中…";
      if (viewport) viewport.classList.add("is-demo-loading");
      if (demoLoadingSafetyTimer) {{
        clearTimeout(demoLoadingSafetyTimer);
      }}
      demoLoadingSafetyTimer = setTimeout(function () {{
        demoLoadingSafetyTimer = null;
        try {{
          if (viewport && viewport.classList.contains("is-demo-loading")) {{
            viewport.classList.remove("is-demo-loading");
            tryBindDemoIframeNav();
          }}
        }} catch (eSafety) {{}}
      }}, 5000);

      /* 1) 立即显示轻量骨架（不跑 expand，毫秒级） */
      try {{
        frame.removeAttribute("src");
        frame.srcdoc = DEMO_IFRAME_SKELETON;
      }} catch (eSk) {{}}

      function armLoadOnce(done) {{
        frame.addEventListener(
          "load",
          function onDemoLoadOnce() {{
            frame.removeEventListener("load", onDemoLoadOnce);
            done();
          }}
        );
      }}

      function assignIframeHtml(html) {{
        var sceneHint = "";
        var tabHint = "";
        // 将最近一次导航的 scene/tab 通过 frame.name 传递给子页，便于 iframe 内读取
        try {{
          var hintNameParts = [];
          sceneHint = demoSceneHintByFile[item.file] || "";
          tabHint = demoTabHintByFile[item.file] || "";
          if (sceneHint) hintNameParts.push("scene=" + encodeURIComponent(sceneHint));
          if (tabHint) hintNameParts.push("tab=" + encodeURIComponent(tabHint));
          frame.name = hintNameParts.join("&");
        }} catch (eName) {{}}
        /* iframe 与父页 sessionStorage 隔离，子页读不到父页 navigateByFile 写入的 demoScene；注入全局 scene 最可靠 */
        try {{
          if (item.file === "devtools-prototype-list.html" && sceneHint) {{
            var inj = "<script>window.__DEMO_DEVTOOLS_SCENE__=" + JSON.stringify(sceneHint) + ";<\\/script>";
            var hi = html.indexOf("<head>");
            if (hi >= 0) {{
              html = html.slice(0, hi + 6) + inj + html.slice(hi + 6);
            }} else {{
              html = inj + html;
            }}
          }}
        }} catch (eInj) {{}}
        frame.removeAttribute("src");

        function finishNavAndUi(pendingRevoke) {{
          tryBindDemoIframeNav();
          if (pendingRevoke) {{
            try {{
              URL.revokeObjectURL(pendingRevoke);
            }} catch (rv) {{}}
          }}
          finishDemoShellUi(item, index);
        }}

        if (!demoUseSrcdocOnly && typeof Blob !== "undefined" && URL && URL.createObjectURL) {{
          try {{
            var pendingRevoke = demoBlobUrl;
            var blob = new Blob([html], {{ type: "text/html;charset=UTF-8" }});
            demoBlobUrl = URL.createObjectURL(blob);
            frame.removeAttribute("srcdoc");
            armLoadOnce(function () {{
              var okDoc = false;
              try {{
                okDoc = !!(frame.contentDocument && frame.contentWindow.document.documentElement);
              }} catch (eDoc) {{}}
              if (!okDoc) {{
                demoUseSrcdocOnly = true;
                try {{
                  if (demoBlobUrl) {{
                    URL.revokeObjectURL(demoBlobUrl);
                  }}
                }} catch (e1) {{}}
                demoBlobUrl = null;
                if (pendingRevoke) {{
                  try {{
                    URL.revokeObjectURL(pendingRevoke);
                  }} catch (e2) {{}}
                }}
      frame.removeAttribute("src");
      if (prevIndex === index) {{
        frame.srcdoc = "";
        setTimeout(function () {{
                    armLoadOnce(function () {{
                      tryBindDemoIframeNav();
                      finishDemoShellUi(item, index);
                    }});
          frame.srcdoc = html;
        }}, 0);
      }} else {{
                  armLoadOnce(function () {{
                    tryBindDemoIframeNav();
                    finishDemoShellUi(item, index);
                  }});
        frame.srcdoc = html;
      }}
                return;
              }}
              finishNavAndUi(pendingRevoke);
            }});
            frame.src = demoBlobUrl;
            return;
          }} catch (blobErr) {{
            demoUseSrcdocOnly = true;
          }}
        }}

        if (prevIndex === index) {{
          frame.srcdoc = "";
        setTimeout(function () {{
            armLoadOnce(function () {{
              tryBindDemoIframeNav();
              finishDemoShellUi(item, index);
            }});
            frame.srcdoc = html;
          }}, 0);
        }} else {{
          armLoadOnce(function () {{
            tryBindDemoIframeNav();
            finishDemoShellUi(item, index);
          }});
          frame.srcdoc = html;
        }}
      }}

      /* 单次 rAF：让壳层先绘制「加载中」，再 expand（双 rAF 在低配机上体感偏慢） */
        requestAnimationFrame(function () {{
          var html = getExpandedHtmlForFile(item.file, raw);
          assignIframeHtml(html);
      }});
    }}

    btnPrev.addEventListener("click", function () {{
      var next = currentIndex - 1;
      if (next < 0) next = pagesList.length - 1;
      switchTo(next);
    }});

    btnNext.addEventListener("click", function () {{
      var next = currentIndex + 1;
      if (next >= pagesList.length) next = 0;
      switchTo(next);
    }});

    frame.addEventListener("load", function () {{
      try {{
        sessionStorage.setItem("portalLoggedIn_v1", "1");
      }} catch (e) {{}}
      tryBindDemoIframeNav();
    }});

    /* 让壳层顶栏/侧栏先完成绘制，再注入首屏 iframe，减轻「整页卡死无响应」体感 */
    setTimeout(function () {{ switchTo(0); }}, 0);
  }})();
  </script>
"""


def write_demo_data_js(path: Path, pages_map: dict, inline_assets: list) -> None:
    """独立 .js 文件赋值 window.__DEMO_PAGES__，便于浏览器先渲染壳层再执行大数据。"""
    pages_raw = json.dumps(pages_map, ensure_ascii=False, separators=(",", ":"))
    assets_raw = json.dumps(inline_assets, ensure_ascii=False, separators=(",", ":"))
    body = (
        "/* map-demo auto-generated UTF-8 — build_demo_single_html.py */\n"
        "window.__DEMO_PAGES__ = "
        + pages_raw
        + ";\nwindow.__DEMO_INLINE_ASSETS__ = "
        + assets_raw
        + ";\n"
    )
    path.write_text(body, encoding="utf-8")


def main() -> None:
    pages_map = build_pages_map(ROOT)
    pages_map, inline_assets = dedupe_inline_data_urls(pages_map)
    shell_path = None
    for name in SHELL_TEMPLATE_CANDIDATES:
        cand = ROOT / name
        if cand.exists():
            shell_path = cand
            break
    if shell_path is None:
        raise RuntimeError("No shell template found for demo build.")
    shell = read_text(shell_path)
    build_stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    shell = shell.replace(
        "<title>离线演示总入口</title>",
        "<title>离线演示总入口 · 打包 " + build_stamp + "</title>",
        1,
    )
    # 清理历史生成反复叠加的壳层覆盖样式，避免布局被压缩
    shell = re.sub(r"\n\s*\.title,\s*\.desc,\s*\.hint\s*\{\s*display:\s*none\s*!important;\s*\}", "", shell)
    shell = re.sub(r"\n\s*\.group-title:first-of-type,\s*#coreList\s*\{\s*display:\s*none\s*!important;\s*\}", "", shell)
    shell = re.sub(r"\n\s*\.sidebar,\s*\.shell-side\s*\{\s*display:\s*none\s*!important;\s*\}", "", shell)
    shell = re.sub(r"\n\s*\.sidebar\s*\{\s*display:\s*none\s*!important;\s*\}", "", shell)
    shell = re.sub(r"\n\s*\.shell\s*\{\s*grid-template-columns:\s*0\s+1fr\s*!important;\s*\}", "", shell)
    shell = re.sub(r"\n\s*\.shell\s*\{\s*grid-template-columns:\s*1fr\s*!important;\s*\}", "", shell)
    shell = re.sub(r"\n\s*\.main\s*\{\s*min-width:\s*0\s*!important;\s*\}", "", shell)
    shell = re.sub(r"\n\s*#btnToggleShell,\s*#btnToggleShellFab\s*\{\s*display:\s*none\s*!important;\s*\}", "", shell)
    # 清理旧版首页强制修复逻辑（会把首页侧栏压成 34px，导致“自动缩窄”）
    shell = re.sub(r"\n\s*function fixHomeTopGap\(\)\s*\{[\s\S]*?\n\s*\}\n", "\n", shell, count=1)
    shell = re.sub(r"\n\s*fixHomeTopGap\(\);\s*", "\n", shell)
    shell = re.sub(r"\n\s*requestAnimationFrame\(fixHomeTopGap\);\s*", "\n", shell)
    shell = re.sub(r"\n\s*setTimeout\(fixHomeTopGap,\s*\d+\);\s*", "\n", shell)
    shell = re.sub(r"\n\s*var __homeGapFixTimer = setInterval\(fixHomeTopGap,\s*\d+\);\s*", "\n", shell)
    shell = re.sub(r"\n\s*setTimeout\(function\s*\(\)\s*\{\s*clearInterval\(__homeGapFixTimer\);\s*\},\s*\d+\);\s*", "\n", shell)
    # 在模板里按最近一个 <script>...</script> 范围移除 fixHomeTopGap 脚本，避免大文件上正则灾难回溯
    idx_fix = shell.find("fixHomeTopGap")
    if idx_fix >= 0:
        start = shell.rfind("<script", 0, idx_fix)
        end = shell.find("</script>", idx_fix)
        if start >= 0 and end >= 0:
            shell = shell[:start] + shell[end + len("</script>") :]
    shell = shell.replace("</script>\n  </script>", "</script>")
    # 同步覆盖：总包顶栏紧凑样式（去掉右上“用”头像框，颜色对齐左侧深蓝）
    shell = shell.replace(
        ".topbar{min-height:38px !important;height:38px !important;background:#0a3382 !important;}",
        ".topbar{min-height:38px !important;height:38px !important;background:#0a1730 !important;}",
    )
    if ".navbar-ruoyi__avatar{display:none !important;}" not in shell:
        shell = shell.replace(
            ".navbar-ruoyi__right{padding-right:8px !important;gap:6px !important;}",
            ".navbar-ruoyi__right{padding-right:8px !important;gap:6px !important;}\n"
            ".navbar-ruoyi__avatar{display:none !important;}",
            1,
        )

    shell = re.sub(
        r"<head>\s*<meta charset=\"UTF-8\" />\s*<script>[\s\S]*?</script>\s*",
        "<head>\n  <meta charset=\"UTF-8\" />\n  ",
        shell,
        count=1,
    )
    shell = shell.replace(
        '<iframe id="demoFrame" src="index.html"',
        '<iframe id="demoFrame" src="about:blank"',
    )

    # 壳层以 index.html 为准；大数据写入同目录 .data.js，避免单文件 HTML 含 100MB 脚本拖垮 file:// 首屏
    data_path = ROOT / DEMO_DATA_JS
    write_demo_data_js(data_path, pages_map, inline_assets)
    external_loader = (
        f'<script src="{DEMO_DATA_JS}" charset="utf-8"></script>\n  <script>\n  '
    )
    shell, n_inject = re.subn(
        r"<script>\s*var __DEMO_PAGES__\s*=\s*[^;]+;\s*\n\s*var __DEMO_INLINE_ASSETS__\s*=\s*[^;]+;\s*",
        external_loader,
        shell,
        count=1,
    )
    if n_inject != 1:
        raise RuntimeError(
            "Inject failed: index.html must start shell script with "
            "'var __DEMO_PAGES__ = …; var __DEMO_INLINE_ASSETS__ = …;'"
        )

    # 可选：隐藏左侧说明文案，仅保留可点击目录；并将顶栏改成紧凑模式（仅当前页面+按钮）
    compact_css = (
        ".title, .desc, .hint { display: none !important; }\n"
        ".topbar{min-height:38px !important;height:38px !important;background:#0a1730 !important;}\n"
        ".navbar-ruoyi{min-height:38px !important;height:38px !important;}\n"
        ".navbar-ruoyi__right{background:#0a1730 !important;}\n"
        ".navbar-ruoyi__left{display:none !important;}\n"
        ".navbar-ruoyi__center{display:flex !important;justify-content:flex-start !important;padding:0 10px !important;}\n"
        ".navbar-ruoyi__center .current{font-size:12px !important;color:#d6e6ff !important;font-weight:600 !important;}\n"
        ".navbar-ruoyi__right{padding-right:8px !important;gap:6px !important;}\n"
        ".navbar-ruoyi__avatar{display:none !important;}\n"
        ".actions a,.actions button{height:24px !important;padding:0 8px !important;font-size:11px !important;border-radius:4px !important;}\n"
        ".shell > .main{height:100% !important;min-height:0 !important;align-self:stretch;}\n"
        ".viewport{height:100% !important;display:flex !important;flex-direction:column !important;}\n"
        "iframe#demoFrame{flex:1 1 auto !important;min-height:0 !important;}\n"
    )
    if ".navbar-ruoyi__left{display:none !important;}" not in shell:
        shell = shell.replace(
            "</style>",
            "\n    " + compact_css + "  </style>",
            1,
        )

    action_json = json.dumps(
        SIDEBAR_ACTION_FOR_DEMO, ensure_ascii=False, separators=(",", ":")
    )

    def inject_action_to_file(html: str) -> str:
        new, n = re.subn(
            r"(    var actionToFile = )\{[\s\S]*?\}(;\s*\n    var labelToFile)",
            lambda m: m.group(1) + action_json + m.group(2),
            html,
            count=1,
        )
        if n != 1:
            raise RuntimeError(
                "Inject failed: var actionToFile = {...}; must precede var labelToFile"
            )
        return new

    shell = inject_action_to_file(shell)
    index_html_path = ROOT / "index.html"
    if index_html_path.exists():
        idx_src = index_html_path.read_text(encoding="utf-8")
        if "var actionToFile" in idx_src and "var labelToFile" in idx_src:
            index_html_path.write_text(inject_action_to_file(idx_src), encoding="utf-8")

    out = shell
    for name in OUT_NAMES:
        out_path = ROOT / name
        out_path.write_text(out, encoding="utf-8")
        print(f"Wrote {out_path} ({len(out):,} bytes)")
    print(f"Wrote {data_path} ({data_path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
