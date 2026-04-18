#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""为采购管理相关 HTML 统一顶栏：引入 source-navbar-header.css、page-source-navbar、header-source-brand。"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

GLOBS = [
    "purchase*.html",
    "procurement-application.html",
    "material-procurement-hub.html",
]

LINK_LINE = '  <link rel="stylesheet" href="css/source-navbar-header.css" />\n'
BRAND = '<div class="header-source-brand"><p>新能源供应链管理系统</p></div>'


def patch_file(fp: Path) -> bool:
    raw = fp.read_text(encoding="utf-8")
    if "header-title" not in raw and "header-source-brand" not in raw:
        return False
    if "source-navbar-header.css" in raw and "page-source-navbar" in raw and "header-source-brand" in raw:
        return False

    text = raw

    if "source-navbar-header.css" not in text:
        # 优先插在 carrier-management 之后
        needle = '<link rel="stylesheet" href="css/carrier-management.css" />'
        if needle in text:
            text = text.replace(needle, needle + "\n" + LINK_LINE.strip(), 1)
        else:
            ins = "</head>"
            if ins not in text:
                return False
            text = text.replace(ins, "  " + LINK_LINE.strip() + "\n" + ins, 1)

    if "page-source-navbar" not in text:
        text = text.replace("<body class=\"", "<body class=\"page-source-navbar ", 1)

    # 替换顶栏 h1（仅一处）
    text, n = re.subn(
        r"<h1\s+class=\"header-title\">[^<]*</h1>",
        BRAND,
        text,
        count=1,
    )
    if n == 0 and "header-source-brand" not in text:
        return False

    if text != raw:
        fp.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    seen: set[Path] = set()
    n = 0
    for pattern in GLOBS:
        for fp in sorted(ROOT.glob(pattern)):
            if fp in seen:
                continue
            seen.add(fp)
            if patch_file(fp):
                print("patched:", fp.name)
                n += 1
    print("done,", n, "files")


if __name__ == "__main__":
    main()
