#!/usr/bin/env python3
"""
Extract data:image and data:font from demo-all-pages-interactive.html (and similar),
write binary files under images/ and fonts/, replace with relative paths.
"""
from __future__ import annotations

import base64
import re
import sys
from pathlib import Path

MARKER_PREFIX = b"var __DEMO_INLINE_ASSETS__ = "


def ext_for_image(raw: bytes) -> str:
    if raw[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if raw[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if raw[:4] == b"RIFF" and len(raw) > 12 and raw[8:12] == b"WEBP":
        return ".webp"
    if raw[:5] in (b"<svg ", b"<?xml"):
        return ".svg"
    return ".bin"


def parse_inline_assets_elements(data: bytes) -> tuple[int, int, list[bytes]]:
    """
    Find __DEMO_INLINE_ASSETS__ array; return (stmt_start, stmt_end_exclusive, elements).
    stmt_end_exclusive is the index immediately after the ';' that ends the statement.
    """
    stmt_start = data.find(MARKER_PREFIX)
    if stmt_start < 0:
        raise ValueError("__DEMO_INLINE_ASSETS__ not found")
    arr_begin = stmt_start + len(MARKER_PREFIX)
    if data[arr_begin : arr_begin + 1] != b"[":
        raise ValueError("expected '[' after __DEMO_INLINE_ASSETS__ =")
    arr_begin += 1
    m = re.search(rb"\];\r?\n\s*function\s+", data[arr_begin : arr_begin + 2_000_000])
    if not m:
        raise ValueError("could not find end of __DEMO_INLINE_ASSETS__ array")
    arr_raw = data[arr_begin : arr_begin + m.start()]
    parts = arr_raw.split(b'", "data:')
    out: list[bytes] = []
    for i, p in enumerate(parts):
        if i == 0:
            s = p.lstrip()
            if s.startswith(b'"'):
                s = s[1:]
        else:
            s = b"data:" + p
        if i == len(parts) - 1 and s.endswith(b'"'):
            s = s[:-1]
        out.append(s)
    # Statement ends at ';' after ']'
    close_bracket = arr_begin + m.start()
    semi = data.find(b";", close_bracket, close_bracket + 10)
    if semi < 0:
        raise ValueError("semicolon after __DEMO_INLINE_ASSETS__ not found")
    stmt_end = semi + 1
    return stmt_start, stmt_end, out


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    html_path = root / "demo-all-pages-interactive.html"
    if len(sys.argv) > 1:
        html_path = Path(sys.argv[1]).resolve()

    (root / "images").mkdir(parents=True, exist_ok=True)
    (root / "fonts").mkdir(parents=True, exist_ok=True)

    data = html_path.read_bytes()
    stmt_start, stmt_end, elems = parse_inline_assets_elements(data)
    new_strings: list[str] = []

    for i, s in enumerate(elems):
        if not s.startswith(b"data:"):
            raise ValueError(f"elem {i} unexpected: {s[:40]!r}")
        header, b64 = s.split(b",", 1)
        if b";base64" not in header:
            raise ValueError(f"elem {i} not base64 data URI")
        raw = base64.b64decode(b64, validate=False)

        if header.startswith(b"data:image/"):
            ext = ext_for_image(raw)
            rel = f"images/demo-inline-{i}{ext}"
            (root / rel).write_bytes(raw)
            new_strings.append(rel)
        elif header.startswith(b"data:font/woff2"):
            rel = f"fonts/demo-inline-{i}.woff2"
            (root / rel).write_bytes(raw)
            new_strings.append(rel)
        else:
            raise ValueError(f"elem {i}: unsupported MIME {header[:40]!r}")

    new_stmt = MARKER_PREFIX.decode("ascii") + '["' + '", "'.join(new_strings) + '"];'

    # Embedded data:image inside __DEMO_PAGES__, before assets statement
    embed_pat = re.compile(rb"data:image/[^;]+;base64,[A-Za-z0-9+/=]+")
    prefix_parts: list[bytes] = []
    pos = 0
    embed_idx = 0
    for m in embed_pat.finditer(data[:stmt_start]):
        prefix_parts.append(data[pos : m.start()])
        blob = m.group()
        _header, b64 = blob.split(b",", 1)
        raw = base64.b64decode(b64, validate=False)
        ext = ext_for_image(raw)
        embed_idx += 1
        rel = f"images/demo-pages-embed-{embed_idx}{ext}"
        (root / rel).write_bytes(raw)
        prefix_parts.append(rel.encode("ascii"))
        pos = m.end()
    prefix_parts.append(data[pos:stmt_start])
    prefix = b"".join(prefix_parts)

    out = prefix + new_stmt.encode("utf-8") + data[stmt_end:]

    before = len(data)
    out_path = html_path
    out_path.write_bytes(out)
    after = len(out)
    print(f"Wrote {out_path}\n  {before:,} -> {after:,} bytes ({100 * after / before:.2f}%)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
