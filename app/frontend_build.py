"""
Build the Vite frontend into frontend_dist before serving the SPA from FastAPI.

Set SKIP_FRONTEND_BUILD=1 to skip (e.g. CI image already built assets).
Set FORCE_FRONTEND_BUILD=1 to always run npm run build.
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import sys
from pathlib import Path

log = logging.getLogger("app.frontend_build")

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_FRONTEND = _BACKEND_ROOT / "frontend"
_DIST_INDEX = _BACKEND_ROOT / "frontend_dist" / "index.html"

_SRC_SUFFIXES = {".jsx", ".js", ".tsx", ".ts", ".css", ".html", ".json"}
_ROOT_FILES = (
    "vite.config.js",
    "package.json",
    "package-lock.json",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
)


def _env_truthy(name: str) -> bool:
    return os.environ.get(name, "").strip().lower() in ("1", "true", "yes", "on")


def _frontend_sources_newer_than_dist() -> bool:
    if not _DIST_INDEX.is_file():
        return True
    try:
        dist_mtime = _DIST_INDEX.stat().st_mtime
    except OSError:
        return True

    src = _FRONTEND / "src"
    if src.is_dir():
        for p in src.rglob("*"):
            if not p.is_file():
                continue
            if p.suffix.lower() not in _SRC_SUFFIXES:
                continue
            try:
                if p.stat().st_mtime > dist_mtime:
                    return True
            except OSError:
                continue

    for name in _ROOT_FILES:
        fp = _FRONTEND / name
        if fp.is_file():
            try:
                if fp.stat().st_mtime > dist_mtime:
                    return True
            except OSError:
                continue

    return False


def should_build_frontend() -> bool:
    if _env_truthy("SKIP_FRONTEND_BUILD"):
        log.info("SKIP_FRONTEND_BUILD is set; skipping frontend build.")
        return False
    if not (_FRONTEND / "package.json").is_file():
        log.debug("No frontend/package.json; skipping frontend build.")
        return False
    if _env_truthy("FORCE_FRONTEND_BUILD"):
        log.info("FORCE_FRONTEND_BUILD is set; running frontend build.")
        return True
    if _frontend_sources_newer_than_dist():
        log.info("Frontend sources are new or dist missing; running npm run build.")
        return True
    log.info("frontend_dist is up to date; skipping npm run build.")
    return False


def run_frontend_build() -> int:
    npm = shutil.which("npm")
    if not npm:
        log.error("npm not found in PATH. Install Node.js or set SKIP_FRONTEND_BUILD=1 if dist is pre-built.")
        return 1

    node_modules = _FRONTEND / "node_modules"
    if not node_modules.is_dir():
        log.info("frontend/node_modules missing; running npm install…")
        inst = subprocess.run([npm, "install"], cwd=str(_FRONTEND), shell=False)
        if inst.returncode != 0:
            log.error("npm install failed with exit code %s.", inst.returncode)
            return int(inst.returncode)

    log.info("Running npm run build in %s", _FRONTEND)
    proc = subprocess.run(
        [npm, "run", "build"],
        cwd=str(_FRONTEND),
        shell=False,
    )
    if proc.returncode != 0:
        log.error("Frontend build failed with exit code %s.", proc.returncode)
    return int(proc.returncode)


def build_frontend_if_needed() -> None:
    """
    Build frontend when appropriate. Exits the process on hard failure
    (no dist and build failed).
    """
    if not should_build_frontend():
        if not _DIST_INDEX.is_file():
            log.warning(
                "frontend_dist/index.html is missing and build was skipped. "
                "Run npm install && npm run build in frontend/, or unset SKIP_FRONTEND_BUILD."
            )
        return

    code = run_frontend_build()
    if code != 0:
        if not _DIST_INDEX.is_file():
            sys.exit(code)
        log.warning("Frontend build failed; continuing with existing frontend_dist.")
