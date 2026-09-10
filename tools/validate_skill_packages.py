#!/usr/bin/env python3
"""Validate the repo-local Skill packages without relying on Codex host paths."""

from __future__ import annotations

import re
import sys
from pathlib import Path


SKILLS = (
    "design-intent",
    "visual-fidelity",
    "planet-web-workflow",
)
FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", flags=re.DOTALL)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors: list[str] = []
    for skill_name in SKILLS:
        directory = root / "skills" / skill_name
        path = directory / "SKILL.md"
        if not path.is_file():
            errors.append(f"missing Skill: {path.relative_to(root)}")
            continue
        content = path.read_text(encoding="utf-8")
        match = FRONTMATTER_RE.match(content)
        if not match:
            errors.append(f"missing frontmatter: {path.relative_to(root)}")
            continue
        fields = {}
        for line in match.group(1).splitlines():
            if ":" in line:
                key, value = line.split(":", 1)
                fields[key.strip()] = value.strip().strip('"')
        if fields.get("name") != skill_name:
            errors.append(f"name mismatch: {path.relative_to(root)}")
        if not fields.get("description"):
            errors.append(f"missing description: {path.relative_to(root)}")
        if len(content.strip()) < 200:
            errors.append(f"Skill is unexpectedly short: {path.relative_to(root)}")

    workflow = root / "skills/planet-web-workflow"
    for relative in (
        "agents/openai.yaml",
        "references/work-packet-schema.md",
        "scripts/validate_work_packet.py",
    ):
        if not (workflow / relative).is_file():
            errors.append(f"missing workflow support file: skills/planet-web-workflow/{relative}")

    if errors:
        print("Skill packages: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"Skill packages: PASS ({len(SKILLS)} packages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
