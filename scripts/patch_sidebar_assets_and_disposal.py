#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ASSET_BLOCK = '<div class="nav-item" title="我的资产"><span class="nav-label">我的资产</span></div>'
TASK_ITEM_RE = re.compile(
    r'<(div|a)\s+class="nav-item[^"]*"[^>]*>[\s\S]*?<span class="nav-label">\s*我的任务\s*</span>[\s\S]*?</\1>'
)


def insert_asset_before_task(text: str) -> str:
    # 先去掉已有“我的资产”项，避免重复或错误嵌套
    text = re.sub(
        r'\s*<div\s+class="nav-item"\s+title="我的资产">\s*<span class="nav-label">我的资产</span>\s*</div>\s*',
        "\n",
        text,
    )

    m = TASK_ITEM_RE.search(text)
    if not m:
        return text
    start = m.start()
    line_start = text.rfind("\n", 0, start) + 1
    indent = ""
    while line_start + len(indent) < len(text) and text[line_start + len(indent)] in (" ", "\t"):
        indent += " "
    ins = indent + ASSET_BLOCK + "\n"
    return text[:line_start] + ins + text[line_start:]


def patch_file(fp: Path) -> bool:
    raw = fp.read_text(encoding="utf-8")
    text = raw.replace("退役及废旧管理", "物资出库与处置")
    text = insert_asset_before_task(text)
    if text != raw:
        fp.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    n = 0
    for fp in sorted(ROOT.glob("*.html")):
        if patch_file(fp):
            print("patched:", fp.name)
            n += 1
    print("done,", n, "files")


if __name__ == "__main__":
    main()

