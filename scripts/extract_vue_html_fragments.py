#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 SupplyChainManageView Vue 工程提取 <template>，去除 Vue/Element 绑定属性，输出静态 HTML 片段。
"""
from __future__ import annotations

import json
import re
from pathlib import Path

# 默认 Vue 工程根目录（可通过环境变量 VUE_ROOT 覆盖）
VUE_ROOT = Path(
    "/Users/lutan/Downloads/SupplyChainManageView-master-77b1e044500d63b8b5263dd39e9b1656d990ef4f"
)
OUT_ROOT = Path(__file__).resolve().parent.parent / "vue-source-html-fragments"

# 模块分组 -> 相对 src 的 .vue 路径列表（仅包含用户列出的业务模块对应视图）
MODULE_FILES: dict[str, list[str]] = {
    "01-我的任务": [
        "views/workflow/task/myDocument.vue",
        "views/workflow/task/taskWaiting.vue",
        "views/workflow/task/taskFinish.vue",
        "views/workflow/task/taskCopyList.vue",
        "views/workflow/task/allTaskWaiting.vue",
    ],
    "02-采购管理": [
        "views/workflow/leave/NBPCommApprova.vue",
        "views/workflow/leave/PurchasePlanApprovalForm.vue",
        "views/workflow/leave/purchaseApprovalForm.vue",
        "views/workflow/leave/rePurchaseApprovalForm.vue",
        "views/workflow/leave/summaryOfProcurementDocumentReview.vue",
        "views/workflow/leave/tenderProcurementCommitteeApproval.vue",
        "views/workflow/leave/TerminationPurchaseApprovalForm.vue",
        "views/workflow/leave/approvalFormForCompanyLevelCentralized.vue",
        "views/workflow/leave/approvalFormForProcurementResults.vue",
        "views/workflow/leave/monthlyBiddingAndProcurementPlanApplication.vue",
        "views/workflow/leave/monthlyNonBiddingProcurementPlanApplication.vue",
        "views/workflow/leave/noticeOfApprovalResultsForProcurementProjects.vue",
        "views/workflow/leave/ProcurementManagementApproval.vue",
        "views/workflow/leave/index.vue",
        "views/system/basicDataMaintenance/index.vue",
        "views/system/archiveDirectory/index.vue",
        "views/system/htgl/index.vue",
    ],
    "03-仓库管理": [
        "views/system/warehouseManagement/index.vue",
    ],
    "04-退役及废旧管理": [
        "views/system/brand/index.vue",
        "views/system/model/index.vue",
        "views/system/replaceBigSmallWindTransformation/index.vue",
        "views/system/windTurbineUnit/index.vue",
        "views/system/engineElectricalCabinet/index.vue",
        "views/system/materialRequisition/index.vue",
        "views/system/projectManagement/index.vue",
    ],
    "05-公告管理": [
        "views/system/nonTenderNotice/index.vue",
        "views/system/tenderNotice/index.vue",
    ],
    "06-标准规范": [
        "views/system/fileStandard/index.vue",
    ],
    "07-数据管理-基础数据-供应商-编码": [
        "views/system/basicDataMaintenance/index.vue",
        "views/system/masterSuppliers/index.vue",
        "views/system/masterCode/index.vue",
    ],
    "08-开发工具": [
        "views/monitor/online/index.vue",
        "views/system/tenant/index.vue",
        "views/demo/demo/index.vue",
        "views/demo/tree/index.vue",
        "views/workflow/category/index.vue",
        "views/workflow/leave/leaveEdit.vue",
        "views/system/tenantPackage/index.vue",
        "views/workflow/model/index.vue",
        "views/workflow/processDefinition/index.vue",
        "views/workflow/processInstance/index.vue",
        "views/workflow/task/taskWaiting.vue",
        "views/monitor/cache/index.vue",
        "views/workflow/formManage/index.vue",
    ],
    "09-系统管理": [
        "views/system/user/index.vue",
        "views/system/role/index.vue",
        "views/tool/gen/index.vue",
        "views/system/menu/index.vue",
        "views/system/dept/index.vue",
        "views/system/post/index.vue",
        "views/system/dict/index.vue",
        "views/system/config/index.vue",
        "views/system/notice/index.vue",
        "views/system/oss/index.vue",
        "views/system/client/index.vue",
    ],
}

# 额外：扫描工程中全部 .vue，生成索引（不按模块分组）
ALL_VUE_INDEX = "00-全量索引"


def extract_template_block(text: str) -> str | None:
    m = re.search(r"<template\b[^>]*>([\s\S]*)</template>", text, re.I)
    if not m:
        return None
    return m.group(1).strip()


def strip_vue_directives(html: str) -> str:
    s = html
    # 移除 v-* 指令属性（含多行）
    s = re.sub(r"\s+v-[a-zA-Z0-9_:-]+\s*=\s*(?:\"[^\"]*\"|'[^']*')", "", s)
    s = re.sub(r"\s+v-[a-zA-Z0-9_:-]+(?=[\s/>])", "", s)
    # @事件
    s = re.sub(r"\s+@[a-zA-Z0-9_.:-]+\s*=\s*(?:\"[^\"]*\"|'[^']*')", "", s)
    # :prop / :prop.sync
    s = re.sub(r"\s+:[a-zA-Z0-9_.:-]+\s*=\s*(?:\"[^\"]*\"|'[^']*')", "", s)
    # ref, key, slot
    s = re.sub(r"\s+ref\s*=\s*(?:\"[^\"]*\"|'[^']*')", "", s)
    s = re.sub(r"\s+#[a-zA-Z0-9_-]+", "", s)
    # {{ }} 占位
    s = re.sub(r"\{\{[\s\S]*?\}\}", "（动态文本）", s)
    # v-for 行：去掉后若剩空标签，保留结构由上层处理；这里仅删属性已做
    # Element Plus 常见 v-model
    s = re.sub(r"\s+v-model(?::[a-zA-Z0-9_]+)?\s*=\s*(?:\"[^\"]*\"|'[^']*')", "", s)
    return s


def safe_filename(path: str) -> str:
    return path.replace("/", "__")


def main() -> None:
    vue_root = Path(VUE_ROOT)
    if not vue_root.is_dir():
        raise SystemExit(f"Vue 工程不存在: {vue_root}")

    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    manifest: dict = {"vueRoot": str(vue_root), "modules": {}}

    # 全量 .vue 列表
    all_vue = sorted(vue_root.glob("src/**/*.vue"))
    index_lines = [f"# 共 {len(all_vue)} 个 .vue 文件\n"]
    for p in all_vue:
        rel = p.relative_to(vue_root / "src")
        index_lines.append(f"- src/{rel.as_posix()}\n")
    (OUT_ROOT / f"{ALL_VUE_INDEX}-all-vue-files.txt").write_text(
        "".join(index_lines), encoding="utf-8"
    )

    for module_name, rels in MODULE_FILES.items():
        mod_dir = OUT_ROOT / module_name
        mod_dir.mkdir(parents=True, exist_ok=True)
        manifest["modules"][module_name] = []
        for rel in rels:
            fp = vue_root / "src" / rel
            if not fp.is_file():
                manifest["modules"][module_name].append(
                    {"path": rel, "error": "file_not_found"}
                )
                continue
            raw = fp.read_text(encoding="utf-8", errors="replace")
            tmpl = extract_template_block(raw)
            if tmpl is None:
                manifest["modules"][module_name].append(
                    {"path": rel, "error": "no_template"}
                )
                continue
            static_html = strip_vue_directives(tmpl)
            out_name = safe_filename(rel) + ".html"
            out_path = mod_dir / out_name
            header = (
                f"<!-- 来源: src/{rel} -->\n"
                f"<!-- 已移除 Vue 指令与 {{}}，仅作静态结构参考 -->\n\n"
            )
            out_path.write_text(header + static_html + "\n", encoding="utf-8")
            manifest["modules"][module_name].append(
                {"path": rel, "output": str(out_path.relative_to(OUT_ROOT))}
            )

    (OUT_ROOT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    readme = """# Vue 模板 HTML 片段导出

本目录由 `scripts/extract_vue_html_fragments.py` 生成。

- 按业务模块分子文件夹（与需求清单对应）。
- 每个 `.html` 文件为对应 `.vue` 文件中 `<template>` 的静态化副本：
  - 已删除常见 `v-*`、`@*`、`:*` 绑定；
  - `{{ }}` 替换为「（动态文本）」。

**注意**：复杂 `v-for` / `v-if` 未做行级展开，仅去掉指令属性；若需完全静态表格行，请在 IDE 中手工复制多行。

## 全量列表

见 `00-全量索引-all-vue-files.txt`（工程中所有 `src/**/*.vue` 路径）。
"""
    (OUT_ROOT / "README.md").write_text(readme, encoding="utf-8")
    print(f"Done. Output: {OUT_ROOT}")


if __name__ == "__main__":
    main()
