#!/usr/bin/env python3
"""Run dependency-free baseline checks for static HTML page scopes."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse


ATTR_RE = re.compile(r"\b(?:href|src)\s*=\s*([\"'])(.*?)\1", flags=re.IGNORECASE)
LANG_RE = re.compile(r"<html\b[^>]*\blang\s*=", flags=re.IGNORECASE)
TITLE_RE = re.compile(r"<title\b[^>]*>\s*[^<]+\s*</title>", flags=re.IGNORECASE)
SECRET_RE = re.compile(
    r"(?:AKIA[0-9A-Z]{16}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|password|secret)\s*[:=]\s*[\"'][^\"']+)",
    flags=re.IGNORECASE,
)


def is_external(value: str) -> bool:
    parsed = urlparse(value)
    return bool(parsed.scheme or parsed.netloc) or value.startswith(("//", "data:", "blob:", "javascript:", "mailto:", "tel:", "#"))


def local_target(page: Path, value: str) -> Path | None:
    value = unquote(value.split("#", 1)[0].split("?", 1)[0].strip())
    if not value or is_external(value):
        return None
    return (page.parent / value).resolve()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path, help="HTML files or directories to inspect")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    pages: list[Path] = []
    for raw in args.paths:
        path = (root / raw).resolve() if not raw.is_absolute() else raw.resolve()
        if path.is_file() and path.suffix.lower() == ".html":
            pages.append(path)
        elif path.is_dir():
            pages.extend(sorted(path.rglob("*.html")))

    errors: list[str] = []
    external: set[str] = set()
    for page in sorted(set(pages)):
        relative = page.relative_to(root)
        content = page.read_text(encoding="utf-8", errors="replace")
        if not LANG_RE.search(content):
            errors.append(f"{relative}: missing html lang")
        if not TITLE_RE.search(content):
            errors.append(f"{relative}: missing non-empty title")
        secret = SECRET_RE.search(content)
        if secret:
            errors.append(f"{relative}: possible secret pattern at offset {secret.start()}")
        for match in ATTR_RE.finditer(content):
            value = match.group(2).strip()
            if is_external(value):
                if value.startswith(("http://", "https://", "//")):
                    external.add(value.split("#", 1)[0])
                continue
            target = local_target(page, value)
            if target is None:
                continue
            try:
                target.relative_to(root)
            except ValueError:
                errors.append(f"{relative}: reference escapes repository: {value}")
                continue
            if not target.exists() and not (target / "index.html").exists():
                errors.append(f"{relative}: missing local reference: {value}")

    if not pages:
        errors.append("no HTML pages found in requested scope")

    print(f"Static contract scope: {len(pages)} HTML page(s)")
    print(f"External references observed: {len(external)}")
    if errors:
        print("Static contract: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Static contract: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
