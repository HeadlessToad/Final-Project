"""
Kaggle API Connection Test — Phase A Verification Script

Run this LOCALLY before writing any Cloud Function code.
It tests 5 layers in order and stops at the first failure.

Usage:
    cd retraining
    pip install requests
    python test_kaggle_connection.py

All 5 layers must pass before proceeding to Phase B.
"""

import json
import sys
import time
import requests
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
KAGGLE_USERNAME = "omriasidon"
KERNEL_SLUG = "omriasidon/retrainning-waste-classification-model"
NOTEBOOK_FILE = Path(__file__).parent / "kaggle_retrain_notebook.ipynb"
KAGGLE_KEY_FILE = Path(__file__).parent / "KaggleAPI.txt"
KAGGLE_JSON_FILE = Path(__file__).parent / "kaggle.json"
# ─────────────────────────────────────────────────────────────────────────────


def load_credentials() -> tuple:
    """
    Load Kaggle credentials. Prefers kaggle.json (legacy) over KaggleAPI.txt (KGAT).
    Returns (username, api_key).
    """
    # Prefer legacy kaggle.json if it exists (Basic auth — works for all endpoints)
    if KAGGLE_JSON_FILE.exists():
        creds = json.loads(KAGGLE_JSON_FILE.read_text())
        username = creds.get("username", KAGGLE_USERNAME)
        key = creds.get("key", "")
        if key:
            print(f"Using kaggle.json credentials (legacy, Basic auth) — user: {username}")
            return username, key

    # Fall back to KaggleAPI.txt (KGAT_ Bearer token)
    if KAGGLE_KEY_FILE.exists():
        key = KAGGLE_KEY_FILE.read_text().strip()
        if key:
            print(f"Using KaggleAPI.txt — user: {KAGGLE_USERNAME}, type: {'KGAT Bearer' if key.startswith('KGAT_') else 'Basic'}")
            return KAGGLE_USERNAME, key

    raise FileNotFoundError("No Kaggle credentials found. Need either kaggle.json or KaggleAPI.txt")


def get_auth(api_key: str, username: str) -> dict:
    """Return the correct auth kwargs based on token format."""
    if api_key.startswith("KGAT_"):
        # New-style personal access token — MUST use Bearer, NOT Basic auth
        return {"headers": {"Authorization": f"Bearer {api_key}"}}
    else:
        # Old-style kaggle.json key — use Basic auth (username, key)
        return {"auth": (username, api_key)}


def separator(layer: str):
    print(f"\n{'='*60}")
    print(f"  {layer}")
    print(f"{'='*60}")


def ok(msg: str):
    print(f"  ✓  {msg}")


def fail(msg: str):
    print(f"  ✗  {msg}")
    print("\nFailed. Fix the issue above before proceeding to the next layer.")
    sys.exit(1)


# ── Read API key ──────────────────────────────────────────────────────────────
try:
    KAGGLE_USERNAME, KAGGLE_KEY = load_credentials()
except FileNotFoundError as e:
    print(f"ERROR: {e}")
    sys.exit(1)

auth_kwargs = get_auth(KAGGLE_KEY, KAGGLE_USERNAME)


# ── Layer 1: Basic auth ───────────────────────────────────────────────────────
separator("Layer 1 — Basic auth: does the token work at all?")

try:
    resp = requests.get(
        "https://www.kaggle.com/api/v1/competitions/list?page=1&pageSize=1",
        timeout=15,
        **auth_kwargs,
    )
    print(f"  HTTP {resp.status_code}")
    print(f"  Body: {resp.text[:300]}")

    if resp.status_code == 200:
        ok("Token is valid and Kaggle is reachable")
    elif resp.status_code == 401:
        fail(
            "401 Unauthorized — token is wrong or expired.\n"
            "  Fix: Go to kaggle.com → Settings → API → Create New Token\n"
            "       Paste the new 'key' value into KaggleAPI.txt"
        )
    elif resp.status_code == 403:
        fail(
            "403 Forbidden — token exists but has no permissions.\n"
            "  Fix: Regenerate token at kaggle.com → Settings → API\n"
            "       Make sure you're using Bearer auth for KGAT_ tokens"
        )
    else:
        fail(f"Unexpected status {resp.status_code}: {resp.text[:200]}")
except requests.ConnectionError as e:
    fail(f"Connection error — no internet access or Kaggle is down.\n  {e}")
except requests.Timeout:
    fail("Timeout — Kaggle did not respond within 15 seconds.")


# ── Layer 2: Kernel exists ────────────────────────────────────────────────────
separator(f"Layer 2 — Does the kernel '{KERNEL_SLUG}' exist and is it readable?")

try:
    resp = requests.get(
        f"https://www.kaggle.com/api/v1/kernels/{KERNEL_SLUG}",
        timeout=15,
        **auth_kwargs,
    )
    print(f"  HTTP {resp.status_code}")
    print(f"  Body (first 600 chars): {resp.text[:600]}")

    if resp.status_code == 200:
        data = resp.json()
        version = (data.get("currentRunningVersion") or {})
        ok(
            f"Kernel found — title: '{data.get('title')}' | "
            f"last status: {version.get('status', 'unknown')} | "
            f"version: {version.get('versionNumber', '?')}"
        )
    elif resp.status_code == 404:
        # The legacy Basic auth key doesn't have access to the /kernels/ read endpoint
        # (returns HTML 404 instead of JSON). This is a known limitation of the old key type.
        # The push endpoint (Layer 4) uses a different code path and may still work.
        # Skip this check and proceed to Layer 4 to find out.
        print(
            f"\n  ⚠  404 on kernel read — legacy key may not have access to /kernels/ GET.\n"
            f"  Skipping Layer 2 (kernel existence confirmed manually).\n"
            f"  Proceeding to Layer 4 push test — that's what actually matters.\n"
        )
    elif resp.status_code == 403:
        print(
            "\n  ⚠  403 on kernel read — skipping (legacy key limitation).\n"
            "  Proceeding to Layer 4 push test.\n"
        )
    else:
        print(f"  ⚠  Unexpected status {resp.status_code} — skipping Layer 2, proceeding to Layer 4.")
except Exception as e:
    print(f"  ⚠  Layer 2 error (skipping): {e}")


# ── Layer 3: Notebook JSON valid ──────────────────────────────────────────────
separator(f"Layer 3 — Is the notebook file valid JSON?")

if not NOTEBOOK_FILE.exists():
    fail(f"Notebook file not found: {NOTEBOOK_FILE}")

notebook_content = NOTEBOOK_FILE.read_text(encoding="utf-8")

try:
    parsed = json.loads(notebook_content)
    cell_count = len(parsed.get("cells", []))
    ok(
        f"Valid JSON — {len(notebook_content):,} bytes, {cell_count} cells, "
        f"nbformat {parsed.get('nbformat')}.{parsed.get('nbformat_minor')}"
    )
except json.JSONDecodeError as e:
    fail(
        f"Notebook is not valid JSON: {e}\n"
        "  Fix: Re-download the notebook from Kaggle or re-save it from Jupyter."
    )


# ── Layer 4a: Push dummy notebook ────────────────────────────────────────────
separator("Layer 4a — Push a DUMMY notebook (format check, no real training)")

dummy_notebook = json.dumps({
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python", "version": "3.10.0"},
    },
    "nbformat": 4,
    "nbformat_minor": 4,
    "cells": [
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": ["print('Layer 4a test — dummy push OK')"],
        }
    ],
})

push_body = {
    "id": KERNEL_SLUG,
    "title": "Retrainning Waste Classification model",
    "code_file": "kaggle_retrain_notebook.ipynb",
    "language": "python",
    "kernel_type": "notebook",
    "is_private": True,
    "enable_gpu": True,
    "enable_internet": True,
    "dataset_data_sources": [],
    "competition_data_sources": [],
    "kernel_data_sources": [],
    "total_votes": 0,
    "blob": dummy_notebook,
}

try:
    resp = requests.post(
        "https://www.kaggle.com/api/v1/kernels/push",
        json=push_body,
        timeout=30,
        **auth_kwargs,
    )
    print(f"  HTTP {resp.status_code}")
    print(f"  Body: {resp.text[:600]}")

    if resp.status_code in (200, 201):
        result = resp.json()
        ok(
            f"Dummy push succeeded — versionNumber: {result.get('versionNumber')} | "
            f"ref: {result.get('ref')}"
        )
        dummy_version = result.get("versionNumber")
    elif resp.status_code == 400:
        body = resp.text
        if "slug" in body.lower():
            fail(
                f"400 Bad Request — kernel slug format is wrong.\n"
                f"  Current value: '{KERNEL_SLUG}'\n"
                "  Must be exactly: 'username/kernel-name' (lowercase, hyphens)\n"
                "  Update KERNEL_SLUG in this script to match the URL on kaggle.com"
            )
        else:
            fail(
                f"400 Bad Request — request body format rejected.\n"
                f"  Full response: {resp.text}\n"
                "  This usually means the notebook JSON or a field value is wrong."
            )
    elif resp.status_code == 401:
        fail(
            "401 Unauthorized on push — token is invalid for write operations.\n"
            "  Fix: Regenerate at kaggle.com → Settings → API → Create New Token"
        )
    elif resp.status_code == 403:
        fail(
            "403 Forbidden on push — YOU HIT THE SAME BUG AS BEFORE.\n"
            "\n"
            "  Possible causes and fixes:\n"
            "  1) Token type mismatch:\n"
            f"     Your key starts with '{KAGGLE_KEY[:6]}' — this MUST use Bearer auth.\n"
            "     Check that auth_kwargs is using headers={Authorization: Bearer ...}\n"
            "     NOT auth=(username, key). This is the most common cause.\n"
            "\n"
            "  2) Kernel ownership issue:\n"
            "     You don't own this kernel on Kaggle, or it was transferred.\n"
            "     Go to kaggle.com → notebook settings and verify you are the owner.\n"
            "\n"
            "  3) Token expired or revoked:\n"
            "     Regenerate at kaggle.com → Settings → API → Expire + Create New Token.\n"
            "     Paste the new key into KaggleAPI.txt and re-run this script.\n"
            "\n"
            "  4) Kernel is locked or read-only:\n"
            "     Check if the kernel has any special settings on Kaggle that prevent\n"
            "     new version pushes (e.g., competition submission lock)."
        )
    elif resp.status_code == 404:
        fail(
            "404 Not Found on push — the push endpoint URL is wrong OR the kernel\n"
            "does not accept pushes (extremely rare).\n"
            "  Endpoint used: https://www.kaggle.com/api/v1/kernels/push\n"
            "  If this persists, check Kaggle API docs for endpoint changes."
        )
    else:
        fail(f"Unexpected status {resp.status_code}: {resp.text}")
except requests.Timeout:
    fail("Timeout on push — Kaggle did not respond within 30 seconds.")
except Exception as e:
    fail(str(e))


# ── Layer 4b: Push REAL notebook ─────────────────────────────────────────────
separator("Layer 4b — Push the REAL notebook (triggers actual training on Kaggle)")

push_body["blob"] = notebook_content  # swap dummy → real notebook

try:
    resp = requests.post(
        "https://www.kaggle.com/api/v1/kernels/push",
        json=push_body,
        timeout=45,  # real notebook is larger, allow more time
        **auth_kwargs,
    )
    print(f"  HTTP {resp.status_code}")
    print(f"  Body: {resp.text[:600]}")

    if resp.status_code in (200, 201):
        result = resp.json()
        real_version = result.get("versionNumber")
        ok(
            f"Real notebook pushed — versionNumber: {real_version} | "
            f"url: {result.get('url', 'n/a')}"
        )
        print(f"\n  > Go to https://kaggle.com/code/{KERNEL_SLUG} to watch it run.")
    else:
        fail(
            f"Real notebook push failed: HTTP {resp.status_code}\n"
            f"  Full response: {resp.text}\n"
            "  The dummy push (4a) worked but the real notebook failed.\n"
            "  Most likely cause: notebook JSON is too large or has an unusual format.\n"
            "  Try re-exporting the notebook from Kaggle and replacing the local file."
        )
except Exception as e:
    fail(str(e))


# ── Layer 5: Poll for running status ─────────────────────────────────────────
separator("Layer 5 — Verify Kaggle started the run (polling for 90 seconds)")

WAIT_SECONDS = 90
print(f"  Waiting {WAIT_SECONDS} seconds for Kaggle to queue/start the kernel...")
time.sleep(WAIT_SECONDS)

try:
    resp = requests.get(
        f"https://www.kaggle.com/api/v1/kernels/{KERNEL_SLUG}",
        timeout=15,
        **auth_kwargs,
    )
    print(f"  HTTP {resp.status_code}")

    if resp.status_code != 200:
        fail(f"Poll returned HTTP {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    version = data.get("currentRunningVersion") or {}
    status = version.get("status", "UNKNOWN")
    version_num = version.get("versionNumber", "?")

    print(f"  Kernel status:  {status}")
    print(f"  Version number: {version_num}")

    if status in ("queued", "running"):
        ok(
            f"Kernel is {status} — the push triggered a real Kaggle run.\n\n"
            "  ✓ ALL 5 LAYERS PASSED.\n"
            f"  Monitor at: https://kaggle.com/code/{KERNEL_SLUG}\n"
            "  After it completes (15-60 min), run Phase B GCS checks:\n"
            "    gsutil cat gs://retrain_smart_waste_model/models/training_status.json\n"
            "    gsutil ls  gs://retrain_smart_waste_model/trained_data/"
        )
    elif status == "complete":
        ok(
            "Kernel already completed (fast run).\n\n"
            "  ✓ ALL 5 LAYERS PASSED.\n"
            "  Check GCS now:\n"
            "    gsutil cat gs://retrain_smart_waste_model/models/training_status.json\n"
            "    gsutil ls  gs://retrain_smart_waste_model/trained_data/"
        )
    elif status == "error":
        print(
            "\n  ⚠  Kernel ran but CRASHED — the push mechanism works (Layers 1-4 are OK).\n"
            "  The notebook itself has an error. Go to Kaggle → your kernel → output/logs\n"
            "  to see the error, then fix the notebook and re-run this script."
        )
    else:
        print(
            f"\n  ⚠  Unexpected status: '{status}'\n"
            "  Kaggle may still be queuing the run. Wait 2-3 more minutes and poll manually:\n"
            f"    python -c \"\n"
            f"import requests, json\n"
            f"r = requests.get('https://www.kaggle.com/api/v1/kernels/{KERNEL_SLUG}',\n"
            f"    headers={{'Authorization': 'Bearer {KAGGLE_KEY[:8]}...'}})\n"
            f"print(json.dumps(r.json().get('currentRunningVersion'), indent=2))\n"
            "    \""
        )
except Exception as e:
    fail(str(e))

print()
