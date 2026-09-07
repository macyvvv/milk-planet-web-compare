#!/usr/bin/env python3
"""Validate the local repo contract without changing repository state."""

from __future__ import annotations

import sys
from pathlib import Path


REQUIRED_FILES = (
    "AGENTS.md",
    "DESIGN.md",
    "basis/README.md",
    "basis/policy.md",
    "basis/system_spec.md",
    "basis/WBS.md",
    "basis/current_state.md",
    "basis/decision_log.md",
    "basis/architecture.mmd",
    "agents/22_VISUAL_FIDELITY_REVIEWER.md",
    "skills/visual-fidelity/SKILL.md",
)

REQUIRED_DIRECTORIES = (
    "currently",
    "proposal/branch1",
    "proposal/branch5",
    "basis",
    "agents",
    "skills/visual-fidelity",
)

TEXT_ASSERTIONS = {
    "AGENTS.md": (
        "currently/",
        "proposal/branch1/",
        "proposal/branch5/",
        "tools/validate_repo_contract.py",
    ),
    "basis/README.md": (
        "文書の責務と正本",
        "作業境界",
        "currently/",
        "proposal/branch1/",
    ),
    "basis/system_spec.md": (
        "Repository contract",
        "390px / 768px / 1440px",
    ),
    "basis/decision_log.md": ("Repo contract と非破壊検証の導入",),
}


def check_exists(root: Path, relative_paths: tuple[str, ...], kind: str) -> list[str]:
    errors: list[str] = []
    for relative_path in relative_paths:
        path = root / relative_path
        exists = path.is_dir() if kind == "directory" else path.is_file()
        if not exists:
            errors.append(f"missing {kind}: {relative_path}")
    return errors


def check_text(root: Path) -> list[str]:
    errors: list[str] = []
    for relative_path, assertions in TEXT_ASSERTIONS.items():
        path = root / relative_path
        if not path.is_file():
            continue
        content = path.read_text(encoding="utf-8")
        for assertion in assertions:
            if assertion not in content:
                errors.append(f"missing reference in {relative_path}: {assertion}")
    return errors


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors = check_exists(root, REQUIRED_FILES, "file")
    errors.extend(check_exists(root, REQUIRED_DIRECTORIES, "directory"))
    errors.extend(check_text(root))

    if errors:
        print("Repo contract: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Repo contract: PASS")
    print(f"Checked {len(REQUIRED_FILES)} files and {len(REQUIRED_DIRECTORIES)} directories.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
