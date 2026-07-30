#!/usr/bin/env python3
"""Safely centralize root-level branch5 navigation rules with tinycss2."""
from __future__ import annotations

from pathlib import Path
import tinycss2

ROOT = Path(__file__).resolve().parents[1] / "proposal" / "branch5"
TARGETS = [
    ROOT / "proposal.css",
    ROOT / "common.css",
    ROOT / "event.css",
    ROOT / "style.css",
]
MARKERS = (
    "#top-head",
    "#mobile-head",
    "#nav-toggle",
    "#global-nav",
    ".nav-toggle-",
    ".nav-submenu",
)


def selector_text(rule: object) -> str:
    prelude = getattr(rule, "prelude", None)
    return tinycss2.serialize(prelude).strip() if prelude is not None else ""


def owns_navigation(rule: object) -> bool:
    return getattr(rule, "type", None) == "qualified-rule" and any(
        marker in selector_text(rule) for marker in MARKERS
    )


def filter_rules(rules: list[object]) -> list[object]:
    kept: list[object] = []
    for rule in rules:
        if owns_navigation(rule):
            continue
        if getattr(rule, "type", None) == "at-rule" and rule.content is not None:
            keyword = getattr(rule, "lower_at_keyword", "")
            if keyword in {"media", "supports", "layer", "container", "scope"}:
                nested = tinycss2.parse_rule_list(rule.content, skip_whitespace=False, skip_comments=False)
                filtered = filter_rules(nested)
                if not any(getattr(item, "type", None) == "qualified-rule" for item in filtered):
                    if not any(getattr(item, "type", None) == "at-rule" for item in filtered):
                        continue
                rule.content = tinycss2.parse_component_value_list(tinycss2.serialize(filtered))
        kept.append(rule)
    return kept


def main() -> None:
    for path in TARGETS:
        source = path.read_text(encoding="utf-8")
        rules = tinycss2.parse_stylesheet(source, skip_whitespace=False, skip_comments=False)
        output = tinycss2.serialize(filter_rules(rules)).strip() + "\n"
        if path.name == "proposal.css":
            import_line = '@import url("./navigation.css");'
            output = output.replace(import_line, "").lstrip()
            output = f"{import_line}\n\n{output}"
        path.write_text(output, encoding="utf-8")


if __name__ == "__main__":
    main()
