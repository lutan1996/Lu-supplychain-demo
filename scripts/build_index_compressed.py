#!/usr/bin/env python3
"""
Rebuild corrupted index.html into index-compressed.html:
- Drop broken script fragment (lines ~724-739)
- Keep shell + demo-pages-bundle.js + first expandDemoInline block
- Fix DEMO_IFRAME_SKELETON closing string
- Remove duplicate block: second <script> through first duplicate </script> (inline __DEMO_PAGES__ + base64 assets)
- Reattach orphaned tail (var currentIndex … switchTo(0))
- Append </body></html>

Then optionally strip excessive blank lines.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "index.html"
OUT = ROOT / "index-compressed.html"

# Line ~915 was truncated: missing </body></html> and closing quote + semicolon (rest was duplicate <script>)
LINE_915_FIXED = (
    '      "@keyframes d{to{transform:rotate(360deg)}}</style></head><body>'
    '<div class=\\"w\\"><div class=\\"sp\\"></div><div>页面加载中…</div></div>'
    "</body></html>\";\n"
)


def main() -> int:
    text = SRC.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines(keepends=True)

    # 0-based indices
    # Lines 1-723 (index 0-722): keep
    # Lines 724-739 (723-738): drop broken script
    # Lines 740-914 (739-913): keep (includes leading blanks before bundle)
    # Line 915 (914): replace with SKELETON_TAIL
    # Lines 916-1510 (915-1509): drop (duplicate <script>, __DEMO_PAGES__, __DEMO_INLINE base64, duplicate IIFE)
    # Lines 1511-2003 (1510-2002): keep (orphaned continuation)
    # Lines 2004-2150: drop blanks
    # Lines 2151-2153: </body></html>

    if len(lines) < 2000:
        print("Unexpected short index.html", file=sys.stderr)
        return 1

    head = lines[:723]
    mid = lines[739:914]  # 740-914 (opens DEMO_IFRAME_SKELETON string parts; 914 ends with +)
    tail = lines[1510:2003]  # 1511-2003
    closing = lines[2150:2153]  # 2151-2153

    out = []
    out.extend(head)
    out.extend(mid)
    out.append(LINE_915_FIXED)
    out.extend(tail)
    if not closing or "</body>" not in "".join(closing):
        out.append("\n</body>\n</html>\n")
    else:
        out.extend(closing)

    data = "".join(out)

    # Collapse 4+ consecutive newlines in tail area (optional)
    data = re.sub(r"\n{5,}", "\n\n\n", data)

    OUT.write_text(data, encoding="utf-8")
    n = OUT.stat().st_size
    print(f"Wrote {OUT} ({n:,} bytes, {n / 1024 / 1024:.2f} MB)")
    if n > 10 * 1024 * 1024:
        print("Warning: still over 10MB — ensure demo-pages-bundle.js is external only.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
