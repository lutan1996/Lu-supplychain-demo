from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index-portal-screen-alt.html"
OUT = ROOT / "index-portal-screen-alt-packed.html"

LINK_RE = re.compile(r"<link\s+([^>]+)>", re.I)
SCRIPT_RE = re.compile(r'<script\s+src="([^"]+\.js)"\s*>\s*</script>', re.I)


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def inline_styles(html: str, base: Path) -> str:
    def repl(m: re.Match) -> str:
        tag = m.group(0)
        attrs = m.group(1)
        if "stylesheet" not in attrs.lower():
            return tag
        hm = re.search(r'href="([^"]+)"', attrs)
        if not hm:
            return tag
        href = hm.group(1)
        if href.startswith("http://") or href.startswith("https://"):
            return tag
        fp = (base / href).resolve()
        if not fp.is_file():
            return tag
        css = read_text(fp)
        if "../webfonts/" in css:
            css = css.replace("url(../webfonts/", "url(css/webfonts/")
        return f'<style>\n/* inlined: {href} */\n{css}\n</style>'

    return LINK_RE.sub(repl, html)


def inline_scripts(html: str, base: Path) -> str:
    def repl(m: re.Match) -> str:
        src = m.group(1)
        if src.startswith("http://") or src.startswith("https://"):
            return m.group(0)
        fp = (base / src).resolve()
        if not fp.is_file():
            return m.group(0)
        return f'<script>\n/* inlined: {src} */\n{read_text(fp)}\n</script>'

    return SCRIPT_RE.sub(repl, html)


def main() -> None:
    html = read_text(SRC)
    html = inline_styles(html, ROOT)
    html = inline_scripts(html, ROOT)
    OUT.write_text(html, encoding="utf-8")
    print(f"Packed: {OUT}")


if __name__ == "__main__":
    main()

