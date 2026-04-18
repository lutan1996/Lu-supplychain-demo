#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将项目根目录下仍使用 <h1 class="header-title"> 的子页统一为 Vue Navbar 顶栏样式。
排除已生成的离线总包 HTML。
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

EXCLUDE = {
    "demo-all-pages-interactive.html",
    "demo-interactive-single.html",
    "demo-all-in-one.html",
}

LINK_LINE = '  <link rel="stylesheet" href="css/source-navbar-header.css" />\n'
BRAND = '<div class="header-source-brand"><p>新能源供应链管理系统</p></div>'

H1_RE = re.compile(r'<h1\s+class="header-title">[^<]*</h1>')


def insert_css(text: str) -> str:
    if "source-navbar-header.css" in text:
        return text
    for needle in (
        '<link rel="stylesheet" href="css/carrier-management.css" />',
        '<link rel="stylesheet" href="css/subpage-base.css" />',
        '<link rel="stylesheet" href="css/vendor/fa-all.min.css" />',
    ):
        if needle in text:
            return text.replace(needle, needle + "\n" + LINK_LINE.strip(), 1)
    if "</head>" in text:
        return text.replace("</head>", "  " + LINK_LINE.strip() + "\n</head>", 1)
    return text


def add_body_page_source_navbar(text: str) -> str:
    if re.search(r"<body[^>]*\bpage-source-navbar\b", text):
        return text

    def repl(m: re.Match[str]) -> str:
        full = m.group(0)
        attrs = m.group(1)
        if "page-source-navbar" in full:
            return full
        c = re.search(r'class="([^"]*)"', attrs)
        if c:
            inner = c.group(1)
            if "page-source-navbar" in inner:
                return full
            return full.replace(
                c.group(0),
                'class="page-source-navbar ' + inner + '"',
                1,
            )
        if not attrs.strip():
            return '<body class="page-source-navbar">'
        return "<body" + attrs + ' class="page-source-navbar">'

    new_text, n = re.subn(r"<body([^>]*)>", repl, text, count=1)
    return new_text if n else text


def patch_html(raw: str) -> str | None:
    if not H1_RE.search(raw):
        return None
    text = insert_css(raw)
    text = add_body_page_source_navbar(text)
    text, n = H1_RE.subn(BRAND, text, count=1)
    if n == 0:
        return None
    return text


def main() -> None:
    n = 0
    for fp in sorted(ROOT.glob("*.html")):
        if fp.name in EXCLUDE:
            continue
        raw = fp.read_text(encoding="utf-8")
        new = patch_html(raw)
        if new is not None and new != raw:
            fp.write_text(new, encoding="utf-8")
            print("patched:", fp.name)
            n += 1
    print("done,", n, "files")


if __name__ == "__main__":
    main()
