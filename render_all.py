"""
Convenient rendering script for Mercator and Equal Earth Manim animations.
Usage:
    uv run python render_all.py --scene mercator --quality ql
    uv run python render_all.py --scene equal_earth --quality qh
    uv run python render_all.py --scene all --quality qm
"""

import argparse
import subprocess
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCENES = {
    "mercator": ("src/mercator_scene.py", "MercatorProjectionScene"),
    "equal_earth": ("src/equal_earth_scene.py", "EqualEarthProjectionScene"),
}


def main():
    parser = argparse.ArgumentParser(description="Render Map Projection Manim Animations")
    parser.add_argument(
        "--scene",
        choices=["mercator", "equal_earth", "all"],
        default="all",
        help="Which scene to render: mercator, equal_earth, or all (default: all)",
    )
    parser.add_argument(
        "--quality",
        choices=["ql", "qm", "qh", "qk"],
        default="ql",
        help="Render quality: ql (480p15), qm (720p30), qh (1080p60), qk (4k60). Default: ql",
    )
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Open video automatically when rendering completes (-p)",
    )
    args = parser.parse_args()

    targets = list(SCENES.keys()) if args.scene == "all" else [args.scene]

    for key in targets:
        script_path, class_name = SCENES[key]
        cmd = ["uv", "run", "manim", f"-{args.quality}"]
        if args.preview:
            cmd.append("-p")
        cmd.extend([script_path, class_name])

        print(f"\n=======================================================")
        print(f"[*] Rendering [{key}]: {class_name} ({args.quality})")
        print(f"[*] Command: {' '.join(cmd)}")
        print(f"=======================================================\n")

        ret = subprocess.run(cmd)
        if ret.returncode != 0:
            print(f"[!] Failed to render {key} (exit code {ret.returncode})", file=sys.stderr)
            sys.exit(ret.returncode)

    print("\n[OK] All requested animations rendered successfully!")


if __name__ == "__main__":
    main()
