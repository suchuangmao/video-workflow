#!/usr/bin/env python3

import argparse
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL_NAME = "suchuangmao-video-workflow"
SKILL_DIR = ROOT / "skills" / SKILL_NAME
SKILL_FILE = SKILL_DIR / "SKILL.md"
DIST_DIR = ROOT / "dist"

FORBIDDEN_PARTS = {
    ".DS_Store",
    ".env",
    "node_modules",
    "__pycache__",
    "working_copy.json",
}

FORBIDDEN_PATTERNS = {
    "absolute macOS user path": re.compile(r"/Users/"),
    "absolute Linux user path": re.compile(r"/home/[A-Za-z0-9._-]+/"),
    "absolute Windows user path": re.compile(r"[A-Za-z]:\\Users\\", re.IGNORECASE),
    "local file URL": re.compile(
        r"file:///(?:Users|home|tmp|private)/", re.IGNORECASE
    ),
    "localhost address": re.compile(r"(?:localhost|127\.0\.0\.1)", re.IGNORECASE),
    "signed asset URL": re.compile(r"[?&]x-signature=", re.IGNORECASE),
    "private source reference": re.compile(r"\bsourceRef\b"),
    "private Feishu wiki": re.compile(r"https?://[^\s)]+\.feishu\.cn/wiki/", re.IGNORECASE),
    "private Lark wiki": re.compile(r"https?://[^\s)]+\.larksuite\.com/wiki/", re.IGNORECASE),
    "probable secret key": re.compile(
        r"\b(?:sk|ak)-[A-Za-z0-9_-]{20,}\b"
        r"|\bghp_[A-Za-z0-9]{30,}\b"
        r"|\bgithub_pat_[A-Za-z0-9_]{30,}\b"
        r"|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"
        r"|\bAIza[A-Za-z0-9_-]{30,}\b"
        r"|\bxox[baprs]-[A-Za-z0-9-]{20,}\b"
        r"|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b"
    ),
    "private key block": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
}


def fail(message: str) -> None:
    raise ValueError(message)


def sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def read_metadata(source: str) -> tuple[str, str, str]:
    if not source.startswith("---\n"):
        fail("SKILL.md must start with YAML frontmatter")

    end = source.find("\n---\n", 4)
    if end < 0:
        fail("SKILL.md frontmatter is not closed")

    frontmatter = source[4:end]
    keys = []
    values = {}
    for line in frontmatter.splitlines():
        match = re.fullmatch(r"([a-zA-Z0-9_-]+):\s*(.+)", line)
        if not match:
            fail(f"Unsupported frontmatter line: {line}")
        key, value = match.groups()
        keys.append(key)
        values[key] = value.strip()

    if keys != ["name", "description"]:
        fail("SKILL.md frontmatter must contain only name and description")

    name = values["name"]
    description = values["description"]
    if name != SKILL_NAME:
        fail(f"Skill name must be {SKILL_NAME}")
    if not description:
        fail("Skill description must not be empty")

    version_match = re.search(r"^- version:\s*(\d+\.\d+\.\d+)\s*$", source, re.MULTILINE)
    if not version_match:
        fail("SKILL.md must contain a SemVer '- version: x.y.z' line")

    return name, description, version_match.group(1)


def iter_skill_files() -> list[Path]:
    if not SKILL_DIR.is_dir():
        fail(f"Missing Skill directory: {SKILL_DIR}")

    files = [path for path in SKILL_DIR.rglob("*") if path.is_file()]
    if not files:
        fail("Skill directory is empty")
    if len(files) > 300:
        fail("Skill contains more than 300 files")
    return sorted(files)


def validate() -> dict:
    if not SKILL_FILE.is_file():
        fail(f"Missing {SKILL_FILE}")

    files = iter_skill_files()
    total_bytes = 0
    for path in files:
        relative = path.relative_to(SKILL_DIR)
        if any(
            part in FORBIDDEN_PARTS or part.startswith(".env.")
            for part in relative.parts
        ):
            fail(f"Forbidden file in Skill: {relative}")

        content = path.read_bytes()
        total_bytes += len(content)
        if b"\r\n" in content:
            fail(f"CRLF line endings are not allowed: {relative}")

        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError as error:
            fail(f"Skill files must be UTF-8 text: {relative}: {error}")

        for label, pattern in FORBIDDEN_PATTERNS.items():
            if pattern.search(text):
                fail(f"Found {label} in {relative}")

    if total_bytes >= 10 * 1024 * 1024:
        fail("Skill must stay below 10 MB")

    source = SKILL_FILE.read_text(encoding="utf-8")
    name, description, version = read_metadata(source)
    return {
        "name": name,
        "description": description,
        "version": version,
        "files": len(files),
        "bytes": total_bytes,
    }


def build(expected_version: str | None) -> dict:
    metadata = validate()
    version = metadata["version"]
    if expected_version and expected_version != version:
        fail(f"Tag version {expected_version} does not match Skill version {version}")

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    package_name = f"{SKILL_NAME}-{version}.zip"
    package_path = DIST_DIR / package_name
    manifest_path = DIST_DIR / "manifest.json"
    checksum_path = DIST_DIR / f"{package_name}.sha256"

    for path in (package_path, manifest_path, checksum_path):
        if path.exists():
            path.unlink()

    package_sources = [
        ("SKILL.md", SKILL_FILE),
        ("LICENSE", SKILL_DIR / "LICENSE"),
    ]
    with zipfile.ZipFile(
        package_path,
        mode="w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
    ) as archive:
        for archive_name, source_path in package_sources:
            content = source_path.read_bytes()
            zip_info = zipfile.ZipInfo(
                archive_name, date_time=(1980, 1, 1, 0, 0, 0)
            )
            zip_info.compress_type = zipfile.ZIP_DEFLATED
            zip_info.external_attr = 0o100644 << 16
            archive.writestr(zip_info, content)

    package_content = package_path.read_bytes()
    package_checksum = sha256(package_content)
    release_base = (
        f"https://github.com/suchuangmao/video-workflow/releases/download/v{version}"
    )
    manifest = {
        "schemaVersion": 1,
        "name": metadata["name"],
        "description": metadata["description"],
        "version": version,
        "repository": "https://github.com/suchuangmao/video-workflow",
        "source": (
            "https://github.com/suchuangmao/video-workflow/"
            f"blob/v{version}/skills/{SKILL_NAME}/SKILL.md"
        ),
        "package": f"{release_base}/{package_name}",
        "files": [
            {
                "path": archive_name,
                "sha256": sha256(source_path.read_bytes()),
                "bytes": source_path.stat().st_size,
            }
            for archive_name, source_path in package_sources
        ],
        "archive": {
            "sha256": package_checksum,
            "bytes": len(package_content),
            "rootSkillFile": "SKILL.md",
        },
    }
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    checksum_path.write_text(
        f"{package_checksum}  {package_name}\n",
        encoding="utf-8",
        newline="\n",
    )
    return {
        **metadata,
        "package": str(package_path.relative_to(ROOT)),
        "manifest": str(manifest_path.relative_to(ROOT)),
        "checksum": str(checksum_path.relative_to(ROOT)),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate and package Suchuangmao Video Workflow."
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--build", action="store_true")
    parser.add_argument("--expected-version")
    args = parser.parse_args()

    try:
        result = build(args.expected_version) if args.build else validate()
    except (OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
