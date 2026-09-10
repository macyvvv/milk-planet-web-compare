#!/usr/bin/env python3
"""Validate every Planet work packet using the state recorded in decision.md."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


STATE_RE = re.compile(r"^State: (\S+)$", flags=re.MULTILINE)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    validator = root / "skills/planet-web-workflow/scripts/validate_work_packet.py"
    packets = sorted(path for path in (root / "basis/work").glob("*") if path.is_dir())
    if not packets:
        print("Work packets: PASS (none found)")
        return 0

    failures = 0
    for packet in packets:
        decision = packet / "decision.md"
        if not decision.is_file():
            print(f"FAIL {packet}: missing decision.md")
            failures += 1
            continue
        content = decision.read_text(encoding="utf-8")
        match = STATE_RE.search(content)
        if not match:
            print(f"FAIL {packet}: decision.md has no State")
            failures += 1
            continue
        result = subprocess.run(
            [sys.executable, str(validator), str(packet), "--state", match.group(1)],
            cwd=root,
            check=False,
            text=True,
            capture_output=True,
        )
        output = result.stdout.strip()
        if output:
            print(output)
        if result.returncode != 0:
            if result.stderr.strip():
                print(result.stderr.strip())
            failures += 1

    if failures:
        print(f"Work packets: FAIL ({failures} packet(s))")
        return 1
    print(f"Work packets: PASS ({len(packets)} packet(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
