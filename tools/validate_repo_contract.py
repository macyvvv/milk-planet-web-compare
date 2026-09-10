#!/usr/bin/env python3
"""Validate the local repo contract without changing repository state."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote


REQUIRED_FILES = (
    "AGENTS.md",
    "DESIGN.md",
    "basis/README.md",
    "basis/policy.md",
    "basis/system_spec.md",
    "basis/WBS.md",
    "basis/current_state.md",
    "basis/decision_log.md",
    "basis/planet_page_evidence_matrix.md",
    "basis/requirements_traceability.md",
    "basis/architecture.mmd",
    "agents/22_VISUAL_FIDELITY_REVIEWER.md",
    "skills/README.md",
    "skills/design-intent/SKILL.md",
    "skills/visual-fidelity/SKILL.md",
    "skills/planet-web-workflow/SKILL.md",
    "skills/planet-web-workflow/agents/openai.yaml",
    "skills/planet-web-workflow/references/work-packet-schema.md",
    "skills/planet-web-workflow/scripts/validate_work_packet.py",
    "tools/validate_work_packets.py",
    "tools/validate_skill_packages.py",
)

REQUIRED_DIRECTORIES = (
    "currently",
    "proposal/branch1",
    "proposal/branch5",
    "basis",
    "agents",
    "skills",
    "skills/design-intent",
    "skills/visual-fidelity",
    "skills/planet-web-workflow",
    "skills/planet-web-workflow/agents",
    "skills/planet-web-workflow/references",
    "skills/planet-web-workflow/scripts",
)

TEXT_ASSERTIONS = {
    "AGENTS.md": (
        "currently/",
        "proposal/branch1/",
        "proposal/branch5/",
        "skills/design-intent",
        "tools/validate_repo_contract.py",
    ),
    "basis/README.md": (
        "文書の責務と正本",
        "作業境界",
        "currently/",
        "proposal/branch1/",
        "文書registry",
        "requirements_traceability.md",
    ),
    "basis/system_spec.md": (
        "Repository contract",
        "390px / 768px / 1440px",
    ),
    "basis/planet_page_evidence_matrix.md": (
        "Planet page evidence matrix",
        "Situatedness／状況への根ざし",
    ),
    "basis/requirements_traceability.md": (
        "Requirements traceability",
        "Current requirement map",
        "TR-01",
    ),
    "DESIGN.md": ("Intent contract",),
    "skills/design-intent/SKILL.md": (
        "Viewing situation",
        "Evidence ledger",
        "根拠のない装飾",
        "skills/README.md",
    ),
    "skills/README.md": (
        "Planet skills map",
        "## Routing",
        "## Shared boundaries",
        "## Document routing",
    ),
    "skills/planet-web-workflow/SKILL.md": (
        "OODA / PDCA",
        "作業パケット",
        "Independent audit",
        "Release verification",
    ),
    "basis/decision_log.md": ("Repo contract と非破壊検証の導入",),
    "basis/mece_coverage_matrix.md": (
        "MECE coverage matrix",
        "## A. Lifecycle coverage",
        "## B. Quality and governance coverage",
        "## C. Current conflicts and decisions required",
    ),
}

MARKDOWN_LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)")


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


def check_local_markdown_links(root: Path, relative_paths: tuple[str, ...]) -> list[str]:
    errors: list[str] = []
    root = root.resolve()
    for relative_path in relative_paths:
        path = root / relative_path
        if path.suffix.lower() != ".md" or not path.is_file():
            continue
        content = path.read_text(encoding="utf-8")
        for raw_target in MARKDOWN_LINK_RE.findall(content):
            target = unquote(raw_target.strip().strip("<>"))
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            target = target.split("#", 1)[0]
            if not target:
                continue
            candidate = (path.parent / target).resolve()
            try:
                candidate.relative_to(root)
            except ValueError:
                errors.append(f"link escapes repository: {relative_path} -> {raw_target}")
                continue
            if not candidate.exists():
                errors.append(f"missing local link: {relative_path} -> {raw_target}")
    return errors


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors = check_exists(root, REQUIRED_FILES, "file")
    errors.extend(check_exists(root, REQUIRED_DIRECTORIES, "directory"))
    errors.extend(check_text(root))
    errors.extend(check_local_markdown_links(root, REQUIRED_FILES))

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
