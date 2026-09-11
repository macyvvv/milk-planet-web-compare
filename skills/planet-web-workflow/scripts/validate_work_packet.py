#!/usr/bin/env python3
"""Validate the evidence structure of a Planet web work packet."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


REQUIRED = {
    "intent.md": (
        "# Change",
        "## Viewing situation",
        "## Business and human outcome",
        "## Source lock",
        "## Hierarchy",
        "## Commitments",
        "## Deliberate exclusions",
        "## Tradeoffs and unknowns",
    ),
    "source-map.md": ("| Source |", "| Treatment |", "| Canonical |"),
    "decision.md": (
        "# Decision",
        "## Scope",
        "## Target files",
        "## State",
        "## Gate status",
        "## Definition of done",
        "## Parking lot",
    ),
    "audit.md": (
        "# Independent audit",
        "## Compared sources",
        "## Viewports",
        "## Static checks",
        "## Browser observations",
        "## Accessibility and content checks",
        "## Findings",
        "## Residual risks",
    ),
    "retrospective.md": (
        "# Retrospective",
        "## Observed event",
        "## Detection phase",
        "## Missed gate or cause",
        "## Generalizable rule",
        "## Skill or validator change",
        "## Follow-up",
    ),
    "release.md": (
        "# Release verification",
        "## Commit",
        "## Push",
        "## Pull request",
        "## Merge",
        "## Published URL",
    ),
}

STATES = (
    "PLANNED",
    "OBSERVED",
    "ORIENTED",
    "DECIDED",
    "IMPLEMENTED",
    "AUDITED",
    "LEARNED",
    "RELEASED",
)

GATES = (
    "Source lock",
    "Content and task",
    "Structure",
    "Intent",
    "Independent audit",
    "Release",
)

PRE_BUILD_GATES = ("Source lock", "Content and task", "Structure", "Intent")
STATE_REQUIRED_PASS_GATES = {
    "DECIDED": PRE_BUILD_GATES,
    "IMPLEMENTED": PRE_BUILD_GATES,
    "AUDITED": PRE_BUILD_GATES + ("Independent audit",),
    "LEARNED": PRE_BUILD_GATES + ("Independent audit",),
    "RELEASED": GATES,
}

RELEASE_SECTIONS = ("Commit", "Push", "Pull request", "Merge", "Published URL")

PHILOSOPHY_PACKET_REQUIREMENTS = {
    "intent.md": ("## Principle under test", "## No-change option", "## Transfer boundary"),
    "decision.md": ("## Philosophy gate", "## Coverage"),
    "audit.md": ("## Philosophy continuity", "## Cross-page regression"),
    "retrospective.md": ("## Principle update",),
}

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("packet", type=Path)
    parser.add_argument("--state", choices=STATES, default=None)
    args = parser.parse_args()

    errors: list[str] = []
    contents: dict[str, str] = {}
    for filename, headings in REQUIRED.items():
        path = args.packet / filename
        if not path.is_file():
            errors.append(f"missing file: {filename}")
            continue
        content = path.read_text(encoding="utf-8")
        contents[filename] = content
        if "TODO" in content or "[TODO" in content:
            errors.append(f"unfinished placeholder: {filename}")
        for heading in headings:
            if heading not in content:
                errors.append(f"missing heading in {filename}: {heading}")

    decision = contents.get("decision.md", "")
    change_class_match = re.search(r"^Change class: (\S+)$", decision, flags=re.MULTILINE)
    change_class = change_class_match.group(1) if change_class_match else None
    if change_class == "PHILOSOPHY_LEARNING":
        for filename, headings in PHILOSOPHY_PACKET_REQUIREMENTS.items():
            content = contents.get(filename, "")
            for heading in headings:
                if heading not in content:
                    errors.append(f"philosophy packet missing heading in {filename}: {heading}")
        if "LOCAL" not in contents.get("audit.md", "") and "UNKNOWN" not in contents.get("audit.md", ""):
            errors.append("philosophy packet audit.md must classify findings as LOCAL, STRUCTURAL, or UNKNOWN")
    state_match = re.search(r"^State: (\S+)", decision, flags=re.MULTILINE)
    if not state_match:
        errors.append("decision.md must contain State:")
        state = None
    else:
        state = state_match.group(1)
        if state not in STATES:
            errors.append(f"decision.md contains invalid state: {state}")
        if args.state and state != args.state:
            errors.append(f"decision.md state does not match --state {args.state}")

    gate_statuses: dict[str, str] = {}
    for gate in GATES:
        pattern = rf"^- {re.escape(gate)}: (PASS|FAIL|NOT RUN)\b"
        matches = re.findall(pattern, decision, flags=re.MULTILINE)
        if len(matches) != 1:
            errors.append(f"decision.md must declare {gate} exactly once with PASS, FAIL, or NOT RUN")
        else:
            gate_statuses[gate] = matches[0]

    if state in STATE_REQUIRED_PASS_GATES:
        for gate in STATE_REQUIRED_PASS_GATES[state]:
            if gate_statuses.get(gate) != "PASS":
                errors.append(f"state {state} requires {gate}: PASS")

    source_map = contents.get("source-map.md", "")
    data_rows = [
        line
        for line in source_map.splitlines()
        if line.startswith("|")
        and "---" not in line
        and "Source |" not in line
    ]
    if not data_rows:
        errors.append("source-map.md must contain at least one source row")

    audit = contents.get("audit.md", "")
    if "390" not in audit or "768" not in audit or "1440" not in audit:
        errors.append("audit.md must record 390, 768, and 1440 viewport checks")

    release = contents.get("release.md", "")
    section_statuses: dict[str, str] = {}
    for section in RELEASE_SECTIONS:
        pattern = rf"^## {re.escape(section)}\s*$\n+Status: (\S+)"
        match = re.search(pattern, release, flags=re.MULTILINE)
        if not match:
            errors.append(f"release.md must declare Status: under ## {section}")
        else:
            section_statuses[section] = match.group(1)
    effective_state = args.state or state
    if effective_state == "RELEASED":
        if section_statuses.get("Merge") != "MERGED":
            errors.append("RELEASED packets require a MERGED merge status")
        if section_statuses.get("Published URL") != "VERIFIED":
            errors.append("RELEASED packets require a VERIFIED published URL status")

    if errors:
        print("Work packet: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Work packet: PASS ({args.packet})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
