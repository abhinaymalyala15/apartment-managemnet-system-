"""Run all seed scripts in order."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPTS = [
    "seed_structure.py",
    "seed_people.py",
    "seed_auth.py",
    "seed_finance.py",
    "seed_communication.py",
    "seed_assets.py",
    "seed_visitors.py",
    "seed_complaints.py",
    "seed_settings.py",
]

ROOT = Path(__file__).resolve().parent


def main() -> None:
    python = sys.executable
    for name in SCRIPTS:
        path = ROOT / name
        print(f"\n--- {name} ---")
        subprocess.run([python, str(path)], check=True)
    print("\nAll seeds complete.")


if __name__ == "__main__":
    main()
