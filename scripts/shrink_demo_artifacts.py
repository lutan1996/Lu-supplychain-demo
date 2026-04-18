#!/usr/bin/env python3
"""
1) Parse demo-pages-bundle.js → extract data:image/* base64 → images/bundle-img-*.ext
2) Split pages object into Object.assign chunks each < ~9MB
3) Repair index.html + demo-interactive-single.html (remove duplicate inline __DEMO_PAGES__ / base64)
4) Inject <script src="demo-pages-bundle.partXXX.js"> after stub

Requires: corrupted shell uses same line layout as documented in build_index_compressed.py
"""
from __future__ import annotations

import base64
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAX_CHUNK = 9 * 1024 * 1024  # stay under Cloudflare 25MB; target HTML/JS < 10MB each

LINE_915_FIXED = (
    '      "@keyframes d{to{transform:rotate(360deg)}}</style></head><body>'
    '<div class=\\"w\\"><div class=\\"sp\\"></div><div>页面加载中…</div></div>'
    "</body></html>\";\n"
)

IMG_PAT = re.compile(r"data:image/[^;]+;base64,[A-Za-z0-9+/=]+")


def ext_for_image(raw: bytes) -> str:
    if raw[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if raw[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if raw[:4] == b"RIFF" and len(raw) > 12 and raw[8:12] == b"WEBP":
        return ".webp"
    return ".bin"


def brace_match_object(s: str, start: int) -> int:
    if s[start] != "{":
        raise ValueError("expected {")
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
                return i + 1
        i += 1
    raise ValueError("unclosed {")


def parse_pages_from_bundle(path: Path) -> dict[str, str]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    eq = raw.find("=")
    if eq < 0:
        raise ValueError("no = in bundle")
    start = raw.find("{", eq)
    end = brace_match_object(raw, start)
    return json.loads(raw[start:end])


def extract_images_from_pages(pages: dict[str, str], root: Path) -> dict[str, str]:
    (root / "images").mkdir(parents=True, exist_ok=True)
    n = [0]

    def repl(m: re.Match[str]) -> str:
        blob = m.group(0)
        _, b64 = blob.split(",", 1)
        raw = base64.b64decode(b64, validate=False)
        ext = ext_for_image(raw)
        n[0] += 1
        rel = f"images/bundle-img-{n[0]:05d}{ext}"
        (root / rel).write_bytes(raw)
        return rel

    out: dict[str, str] = {}
    for k, html in pages.items():
        out[k] = IMG_PAT.sub(repl, html)
    print(f"Extracted {n[0]} data:image assets → images/bundle-img-*")
    return out


def chunk_payload_bytes(chunk: dict) -> int:
    s = json.dumps(chunk, ensure_ascii=False, separators=(",", ":"))
    return len(("Object.assign(window.__DEMO_PAGES__," + s + ");").encode("utf-8"))


def split_pages(pages: dict[str, str]) -> list[dict[str, str]]:
    chunks: list[dict[str, str]] = []
    cur: dict[str, str] = {}
    for k, v in pages.items():
        trial = dict(cur)
        trial[k] = v
        if chunk_payload_bytes(trial) > MAX_CHUNK and cur:
            chunks.append(cur)
            cur = {k: v}
            if chunk_payload_bytes(cur) > MAX_CHUNK:
                print(f"WARNING: single key {k!r} is {chunk_payload_bytes(cur):,} bytes (> max)", file=sys.stderr)
        else:
            cur = trial
    if cur:
        chunks.append(cur)
    return chunks


def write_bundle_chunks(chunks: list[dict[str, str]], root: Path) -> list[str]:
    stub = root / "demo-pages-bundle.js"
    # backup monolithic
    if stub.exists() and stub.stat().st_size > MAX_CHUNK:
        bak = root / "demo-pages-bundle.js.monolithic.bak"
        if not bak.exists():
            stub.rename(bak)
            print(f"Renamed large bundle → {bak.name}")
        else:
            stub.unlink()

    stub.write_text("window.__DEMO_PAGES__ = {};\n", encoding="utf-8")

    names: list[str] = []
    for i, ch in enumerate(chunks, 1):
        name = f"demo-pages-bundle.part{i:03d}.js"
        names.append(name)
        payload = json.dumps(ch, ensure_ascii=False, separators=(",", ":"))
        text = "Object.assign(window.__DEMO_PAGES__," + payload + ");\n"
        (root / name).write_text(text, encoding="utf-8")
        sz = (root / name).stat().st_size
        print(f"  {name}: {sz:,} bytes ({sz / 1024 / 1024:.2f} MB)")

    # remove stale part files if fewer chunks now
    for p in root.glob("demo-pages-bundle.part*.js"):
        if p.name not in names:
            p.unlink()
            print(f"Removed stale {p.name}")
    return names


def needs_shell_repair(lines: list[str]) -> bool:
    for line in lines:
        if "var __DEMO_PAGES__" in line and len(line) > 500_000:
            return True
    return False


def repair_shell_html(text: str) -> str:
    lines = text.splitlines(keepends=True)
    if not needs_shell_repair(lines):
        return text

    head = lines[:723]
    mid = lines[739:914]
    tail = lines[1510:2003]
    closing = lines[-2:] if lines[-1].strip() == "</html>" else lines[-3:]

    out = []
    out.extend(head)
    out.extend(mid)
    out.append(LINE_915_FIXED)
    out.extend(tail)
    if "</body>" not in "".join(closing[-3:]):
        out.append("\n</body>\n</html>\n")
    else:
        out.extend(closing)
    data = "".join(out)
    data = re.sub(r"\n{5,}", "\n\n\n", data)
    return data


def inject_part_scripts(html: str, part_names: list[str]) -> str:
    html = re.sub(
        r"\n\s*<script src=\"demo-pages-bundle\.part\d+\.js\"></script>",
        "",
        html,
    )
    if not part_names:
        return html
    block = "".join(f'  <script src="{n}"></script>\n' for n in part_names)
    old = '  <script src="demo-pages-bundle.js"></script>'
    if old not in html:
        raise ValueError("expected demo-pages-bundle.js script tag")
    return html.replace(old, old + "\n" + block, 1)


def main() -> int:
    root = ROOT
    bundle_path = root / "demo-pages-bundle.js"
    if not bundle_path.exists():
        print("demo-pages-bundle.js not found", file=sys.stderr)
        return 1

    # If stub-only bundle, load from .bak
    load_path = bundle_path
    if bundle_path.stat().st_size < 1000:
        bak = root / "demo-pages-bundle.js.monolithic.bak"
        if bak.exists():
            load_path = bak
            print(f"Loading pages from {bak.name}")

    print("Parsing bundle…")
    pages = parse_pages_from_bundle(load_path)
    print(f"  {len(pages)} pages")

    print("Extracting data:image from page HTML…")
    pages = extract_images_from_pages(pages, root)

    print("Splitting into chunks…")
    chunks = split_pages(pages)
    print(f"  {len(chunks)} chunk file(s)")

    part_names = write_bundle_chunks(chunks, root)

    for fname in ("index.html", "demo-interactive-single.html"):
        p = root / fname
        if not p.exists():
            continue
        raw = p.read_text(encoding="utf-8", errors="replace")
        fixed = repair_shell_html(raw)
        fixed = inject_part_scripts(fixed, part_names)
        p.write_text(fixed, encoding="utf-8")
        sz = p.stat().st_size
        print(f"{fname}: {sz:,} bytes ({sz / 1024 / 1024:.2f} MB)")

    # Sizes report
    print("\n--- size check (< 10 MiB target for each) ---")
    for path in [root / "index.html", root / "demo-interactive-single.html", root / "demo-pages-bundle.js", *[(root / n) for n in part_names]]:
        if path.exists():
            sz = path.stat().st_size
            ok = "OK" if sz < 10 * 1024 * 1024 else "TOO LARGE"
            print(f"  {path.name}: {sz / 1024 / 1024:.2f} MB {ok}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
