#!/usr/bin/env bash
# 将当前仓库内页面打进单文件离线演示：demo-all-pages-interactive.html（与 demo-interactive-single.html 同内容）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec python3 "$ROOT/scripts/build_demo_single_html.py"
