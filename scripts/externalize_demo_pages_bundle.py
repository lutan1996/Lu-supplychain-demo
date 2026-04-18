#!/usr/bin/env python3
"""
Extract `var __DEMO_PAGES__ = { ... };` from demo-all-pages-interactive.html into
`demo-pages-bundle.js` (window.__DEMO_PAGES__ = ...) and shrink the HTML shell.

Safe for file:// — external .js is loaded as script, unlike fetch() of HTML fragments.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

def brace_match_object(s: str, start: int = 0) -> tuple[int, int]:
    """Find end index (exclusive) of balanced `{...}` from s[start] == '{'."""
    if s[start] != "{":
        raise ValueError("brace_match_object: start must be '{'")
    depth = 0
    i = start
    n = len(s)
    in_str = False
    esc = False
    quote = ""
    while i < n:
        c = s[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == quote:
                in_str = False
                quote = ""
            i += 1
            continue
        if c in "\"'":
            in_str = True
            quote = c
            i += 1
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return start, i + 1
        i += 1
    raise ValueError("unclosed brace in object literal")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    html_path = root / "demo-all-pages-interactive.html"
    bundle_path = root / "demo-pages-bundle.js"
    if len(sys.argv) > 1:
        html_path = Path(sys.argv[1]).resolve()

    text = html_path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines(keepends=True)

    idx = None
    for i, line in enumerate(lines):
        stripped = line.lstrip()
        if stripped.startswith("var __DEMO_PAGES__") and "=" in stripped:
            idx = i
            break
    if idx is None:
        raise SystemExit("__DEMO_PAGES__ line not found")

    big = lines[idx]
    # normalize prefix (spaces)
    m = re.search(r"var\s+__DEMO_PAGES__\s*=\s*", big)
    if not m:
        raise SystemExit("cannot parse __DEMO_PAGES__ prefix on line")
    pos = m.end()
    sub = big[pos:]
    obj_start = sub.find("{")
    if obj_start < 0:
        raise SystemExit("no { after =")
    abs_start = pos + obj_start
    _, abs_end = brace_match_object(big, abs_start)
    obj_src = big[abs_end:].lstrip()
    if obj_src.startswith(";"):
        obj_src = obj_src[1:]
    obj_text = big[abs_start:abs_end]
    # Parse as JSON (object literal keys are double-quoted in bundle)
    try:
        pages = json.loads(obj_text)
    except json.JSONDecodeError as e:
        raise SystemExit(f"JSON parse failed (need strict JSON-like object): {e}") from e

    # Write bundle
    dumped = json.dumps(pages, ensure_ascii=False, separators=(",", ":"))
    bundle_path.write_text(
        "window.__DEMO_PAGES__ = " + dumped + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {bundle_path} ({bundle_path.stat().st_size:,} bytes), {len(pages)} pages")

    # Rebuild HTML: replace `<script>` before __DEMO_PAGES__ with script src + <script>, drop huge line
    out_parts: list[str] = []
    for i, line in enumerate(lines):
        if i == idx:
            continue
        if i == idx - 1 and line.strip() == "<script>":
            out_parts.append('  <script src="demo-pages-bundle.js"></script>\n')
            out_parts.append("  <script>\n")
            continue
        out_parts.append(line)

    html_path.write_text("".join(out_parts), encoding="utf-8")
    print(f"Updated {html_path} ({html_path.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
