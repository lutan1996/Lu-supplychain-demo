#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""退役 / 公告 / 标准规范 子页顶栏与 Vue Navbar 对齐。"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FILES = [
    # 退役
    "retire-scrap-application.html",
    "retired-prototype-list.html",
    "retired-module-hub.html",
    # 公告
    "notice-prototype-list.html",
    "notice-hub.html",
    "notice-bid-fixed.html",
    # 标准规范
    "biz-standard-list.html",
]

LINK = '  <link rel="stylesheet" href="css/source-navbar-header.css" />\n'
BRAND = '<div class="header-source-brand"><p>新能源供应链管理系统</p></div>'


def insert_css(text: str) -> str:
    if "source-navbar-header.css" in text:
        return text
    for needle in (
        '<link rel="stylesheet" href="css/carrier-management.css" />',
        '<link rel="stylesheet" href="css/subpage-base.css" />',
    ):
        if needle in text:
            return text.replace(needle, needle + "\n" + LINK.strip(), 1)
    if "</head>" in text:
        return text.replace("</head>", "  " + LINK.strip() + "\n</head>", 1)
    return text


def patch_file(fp: Path) -> bool:
    raw = fp.read_text(encoding="utf-8")
    if "header-title" not in raw and "header-source-brand" not in raw:
        return False
    if (
        "source-navbar-header.css" in raw
        and "page-source-navbar" in raw
        and "header-source-brand" in raw
    ):
        return False

    text = insert_css(raw)

    if "page-source-navbar" not in text:
        text = text.replace('<body class="', '<body class="page-source-navbar ', 1)

    text, n = re.subn(
        r'<h1\s+class="header-title">[^<]*</h1>',
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
    n = 0
    for name in FILES:
        fp = ROOT / name
        if not fp.is_file():
            print("skip missing:", name)
            continue
        if patch_file(fp):
            print("patched:", name)
            n += 1
    print("done,", n, "files")


if __name__ == "__main__":
    main()
