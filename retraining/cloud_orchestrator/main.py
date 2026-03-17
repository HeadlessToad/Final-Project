"""
Retrain Orchestrator — Two Cloud Functions (Gen 2, Eventarc)

Both functions are triggered by ANY object finalized in gs://retrain_smart_waste_model.
Each filters immediately on the object name and ignores irrelevant events.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Function 1 — retrain_orchestrator
  Trigger : new file in training_data/ (user feedback → image + label uploaded by waste-classifier-eu)
  Action  : count valid image+label pairs → if >= MIN_SAMPLES, push the Kaggle notebook to start GPU training
  No-op   : if < MIN_SAMPLES, logs count and returns (waits for more user feedback)

Function 2 — retrain_deployer
  Trigger : models/training_status.json written (Kaggle notebook writes this when training finishes)
  Action  : read the result → if improved == true, force a new Cloud Run revision of waste-classifier-eu
            the new revision downloads models/best_latest.pt from GCS at startup (fresh weights)
  No-op   : if not improved, keeps current production model unchanged
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full pipeline end-to-end:
  User submits feedback in app
    → /feedback endpoint moves image+label to training_data/ in GCS
      → retrain_orchestrator fires, counts pairs
        → (once >= 1000) pushes kaggle_retrain_notebook.ipynb to Kaggle
          → Kaggle trains on P100 GPU, uploads best_latest.pt, writes training_status.json
            → retrain_deployer fires, reads status
              → (if improved) updates waste-classifier-eu env var → new revision starts
                → new container downloads best_latest.pt from GCS → serving updated model

GCS bucket: retrain_smart_waste_model
  training_data/images/   — feedback images
  training_data/labels/   — YOLO label files (one per image)
  trained_data/{ts}/      — archived after each training run
  notebook/               — kaggle_retrain_notebook.ipynb (read by this function, pushed to Kaggle)
  models/best_latest.pt   — latest trained weights (written by Kaggle notebook if improved)
  models/training_status.json — training result signal written by Kaggle notebook

Environment variables (set via deploy.ps1):
  KAGGLE_USERNAME        Kaggle account username
  KAGGLE_KERNEL_SLUG     Full notebook slug: "omriasidon/retrainning-waste-classification-model"
  GCP_PROJECT            GCP project ID: "smart-waste-sorter"

Secrets (injected from Secret Manager via deploy.ps1):
  KAGGLE_KEY             Kaggle API key
"""

import os
import re
import json
import time
import functions_framework
from google.cloud import storage
from google.cloud.run_v2 import ServicesClient, UpdateServiceRequest

# ── Configuration ─────────────────────────────────────────────────────────────
BUCKET_NAME  = "retrain_smart_waste_model"
MIN_SAMPLES  = 10  # Minimum valid image+label pairs required before triggering a retrain

# ── Logging helpers ───────────────────────────────────────────────────────────
# Using print() instead of logging module — Cloud Run captures stdout reliably,
# while the logging module sometimes fails to surface in Cloud Logging.
def log_info(msg):  print(f"[INFO] {msg}", flush=True)
def log_error(msg): print(f"[ERROR] {msg}", flush=True)

# ── Credential sanitizer ───────────────────────────────────────────────────────
# Strips BOM (\ufeff), carriage returns (\r\n from PowerShell), and any other
# non-printable-ASCII characters from credential/env-var strings.
# \x20-\x7E = all printable ASCII (space through tilde).
def _clean(s: str) -> str:
    return re.sub(r'[^\x20-\x7E]', '', s).strip()


# ── Helper: count valid training pairs in GCS ─────────────────────────────────
# A "valid pair" = an image in training_data/images/ that has a matching label
# file in training_data/labels/ with the same UUID filename.
# Only pairs count — an image without a label (or vice versa) is skipped.
def count_valid_training_pairs(bucket) -> int:
    label_blobs = list(bucket.list_blobs(prefix="training_data/labels/"))
    label_names = [b.name for b in label_blobs if b.name.endswith(".txt")]

    # Build a set of image UUIDs from training_data/images/
    image_ids = {
        b.name.replace("training_data/images/", "").replace(".jpg", "")
        for b in bucket.list_blobs(prefix="training_data/images/")
        if b.name.endswith(".jpg")
    }

    # Count label files whose UUID exists in the image set
    return sum(
        1 for lp in label_names
        if lp.replace("training_data/labels/", "").replace(".txt", "") in image_ids
    )


# ── Helper: push notebook to Kaggle ──────────────────────────────────────────
# Downloads the notebook from GCS (so it's always the latest version),
# writes it to a temp directory alongside a kernel-metadata.json,
# then pushes the whole folder via the Kaggle Python package.
# Kaggle automatically queues a new GPU run when a kernel version is pushed.
def push_kaggle_notebook(kernel_slug: str, username: str, api_key: str, bucket) -> tuple:
    # Read the notebook stored in GCS — this is the source of truth for the notebook.
    # To update the notebook logic, upload a new version to GCS:
    #   gsutil cp kaggle_retrain_notebook.ipynb gs://retrain_smart_waste_model/notebook/
    notebook_blob = bucket.blob("notebook/kaggle_retrain_notebook.ipynb")
    if not notebook_blob.exists():
        return False, "Notebook not found in GCS at notebook/kaggle_retrain_notebook.ipynb"

    # Decode with utf-8-sig — automatically strips the UTF-8 BOM (\ufeff) if present.
    # This avoids the 'latin-1' UnicodeEncodeError that occurs when the BOM survives
    # into the HTTP request body and http.client (system locale = LANG=C) tries to encode it.
    notebook_str = notebook_blob.download_as_bytes().decode('utf-8-sig')
    log_info(f"Downloaded notebook from GCS ({len(notebook_str)} chars)")

    try:
        import urllib.request
        import urllib.error
        import base64

        # Basic auth header (used for both GET and POST)
        credentials = base64.b64encode(
            f"{username}:{api_key}".encode('ascii')
        ).decode('ascii')
        auth_header = f'Basic {credentials}'

        # ── Split slug into user + kernel-name ────────────────────────────────
        # kernel_slug is "omriasidon/retrainning-waste-classification-model"
        # Kaggle push API identifies the kernel by "slug" = name only (no username).
        log_info(f"Pushing kernel slug='{kernel_slug}' to Kaggle")

        # ── Push new notebook version ──────────────────────────────────────────
        # "slug"        — full "username/kernel-name" ref that identifies the kernel.
        # "source_code" — notebook JSON as a plain string (Kaggle API v1 field name).
        # No "id" field — avoids the "could not convert string to integer" error.
        # Kaggle API v1 /kernels/push uses camelCase JSON field names.
        # "blob" is the field for notebook content (maps from Python "source_code").
        body = {
            "slug": kernel_slug,
            "newTitle": "Retrainning Waste Classification model",
            "blob": notebook_str,
            "language": "python",
            "kernelType": "notebook",
            "isPrivate": True,
            "enableGpu": True,
            "enableInternet": True,
            "datasetDataSources": [],
            "competitionDataSources": [],
            "kernelDataSources": [],
            "totalVotes": 0,
        }

        # ensure_ascii=True converts ALL non-ASCII chars (including \ufeff) to \uXXXX escapes
        # → pure ASCII string → .encode('utf-8') → bytes before any socket code can interfere.
        body_bytes = json.dumps(body, ensure_ascii=True).encode('utf-8')

        push_req = urllib.request.Request(
            "https://www.kaggle.com/api/v1/kernels/push",
            data=body_bytes,
            headers={
                'Content-Type': 'application/json',
                'Authorization': auth_header,
            }
        )

        with urllib.request.urlopen(push_req, timeout=30) as resp:
            resp_body = resp.read().decode('utf-8')

        log_info(f"Kaggle push HTTP 200: {resp_body[:300]}")
        resp_json = json.loads(resp_body)

        if resp_json.get("hasError"):
            return False, resp_json.get("error", "Unknown Kaggle error")

        log_info(f"Notebook pushed to Kaggle: {kernel_slug} — version {resp_json.get('versionNumber')}")
        return True, ""

    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        log_error(f"Kaggle push HTTP {e.code}: {body[:300]}")
        return False, f"HTTP {e.code}: {body[:200]}"
    except Exception as e:
        log_error(f"Kaggle push failed: {e}")
        return False, str(e)


# ── Helper: force a new Cloud Run revision ────────────────────────────────────
# Instead of rebuilding the Docker image, we just update an env var on the
# waste-classifier-eu service. Cloud Run creates a new revision which starts
# fresh — and on startup, prediction_service.py downloads the latest weights
# from gs://retrain_smart_waste_model/models/best_latest.pt automatically.
def redeploy_cloud_run(project: str, region: str = "europe-west1", service: str = "waste-classifier-eu") -> bool:
    try:
        client = ServicesClient()
        name = f"projects/{project}/locations/{region}/services/{service}"
        svc = client.get_service(name=name)

        # Set/update MODEL_UPDATED_AT to the current Unix timestamp.
        # Any change to env vars forces Cloud Run to create a new revision.
        timestamp = str(int(time.time()))
        for container in svc.template.containers:
            for env in container.env:
                if env.name == "MODEL_UPDATED_AT":
                    env.value = timestamp
                    break
            else:
                # First time — add the env var
                from google.cloud.run_v2.types import EnvVar
                container.env.append(EnvVar(name="MODEL_UPDATED_AT", value=timestamp))

        client.update_service(request=UpdateServiceRequest(service=svc))
        log_info(f"Cloud Run service '{service}' redeployment triggered (MODEL_UPDATED_AT={timestamp})")
        return True
    except Exception as e:
        log_error(f"Cloud Run redeploy failed: {e}")
        return False


# ── Function 1: trigger training when new feedback data lands ─────────────────
@functions_framework.cloud_event
def retrain_orchestrator(cloud_event):
    """
    Entry point for the retrain-orchestrator Cloud Function.

    Fires on every GCS object finalization in the bucket.
    Only proceeds if the file is in training_data/ (uploaded by the /feedback endpoint).
    Counts valid image+label pairs — if >= MIN_SAMPLES, pushes the Kaggle notebook
    to kick off a new GPU training run.
    """
    data        = cloud_event.data
    object_name = data.get("name", "")
    log_info(f"retrain_orchestrator triggered by: {object_name}")

    # Ignore events from other folders (models/, notebook/, trained_data/, etc.)
    if not object_name.startswith("training_data/"):
        log_info("Ignoring — not in training_data/")
        return

    # Read Kaggle credentials from env vars (set in deploy.ps1)
    # _clean() strips BOM (\ufeff), \r\n from PowerShell, and any non-ASCII garbage
    kaggle_username = _clean(os.environ.get("KAGGLE_USERNAME", ""))
    kaggle_key      = _clean(os.environ.get("KAGGLE_KEY", ""))   # injected from Secret Manager
    kernel_slug     = _clean(os.environ.get("KAGGLE_KERNEL_SLUG", ""))

    if not all([kaggle_username, kaggle_key, kernel_slug]):
        log_error("Missing Kaggle env vars — check deploy.ps1 configuration")
        return

    gcs    = storage.Client()
    bucket = gcs.bucket(BUCKET_NAME)

    # Count how many complete image+label pairs exist in the bucket
    valid_pairs = count_valid_training_pairs(bucket)
    log_info(f"Valid training pairs: {valid_pairs} / {MIN_SAMPLES} required")

    # Not enough data yet — wait for more user feedback before training
    if valid_pairs < MIN_SAMPLES:
        log_info("Not enough data yet — waiting for more feedback.")
        return

    # Threshold reached — push the notebook to Kaggle to start GPU training
    log_info(f"Threshold reached! Pushing notebook to Kaggle: {kernel_slug}")
    ok, err = push_kaggle_notebook(kernel_slug, kaggle_username, kaggle_key, bucket)
    if not ok:
        log_error(f"Failed to push notebook: {err}")


# ── Function 2: deploy new weights when Kaggle training finishes ──────────────
@functions_framework.cloud_event
def retrain_deployer(cloud_event):
    """
    Entry point for the retrain-deployer Cloud Function.

    Fires on every GCS object finalization in the bucket.
    Only proceeds if the file is models/training_status.json — written by the
    Kaggle notebook when training completes (success or failure).
    If improved == true, forces a new Cloud Run revision of waste-classifier-eu
    which downloads the fresh weights from GCS on startup.
    """
    data        = cloud_event.data
    object_name = data.get("name", "")
    log_info(f"retrain_deployer triggered by: {object_name}")

    # Only act when the Kaggle notebook signals it has finished
    if object_name != "models/training_status.json":
        log_info("Ignoring — not training_status.json")
        return

    gcp_project = _clean(os.environ.get("GCP_PROJECT", ""))
    if not gcp_project:
        log_error("Missing GCP_PROJECT env var — check deploy.ps1 configuration")
        return

    gcs    = storage.Client()
    bucket = gcs.bucket(BUCKET_NAME)
    blob   = bucket.blob("models/training_status.json")

    if not blob.exists():
        log_error("training_status.json not found in GCS — notebook may have crashed before writing it")
        return

    # training_status.json written by the Kaggle notebook:
    # { "status": "complete", "improved": true/false,
    #   "new_map50": 0.65, "baseline_map50": 0.54, "samples_used": 43 }
    status = json.loads(blob.download_as_text())
    log_info(
        f"Training result: status={status.get('status')} "
        f"improved={status.get('improved')} "
        f"new_map50={status.get('new_map50', 0):.4f} "
        f"baseline_map50={status.get('baseline_map50', 0):.4f}"
    )

    # Notebook finished with an error (e.g. not enough data, crash)
    if status.get("status") != "complete":
        log_info("Training did not complete — skipping deploy.")
        return

    # New model is worse than or equal to the current one — keep production unchanged
    if not status.get("improved", False):
        log_info("Model did not improve — keeping current production model.")
        return

    # New model is better — trigger a rolling redeploy of waste-classifier-eu
    # The new revision will download models/best_latest.pt from GCS at startup
    log_info("Model improved — triggering Cloud Run redeploy of waste-classifier-eu")
    redeploy_cloud_run(gcp_project)
