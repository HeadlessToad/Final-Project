# deploy.ps1 — Deploy both retrain Cloud Functions
# Run from anywhere:  .\retraining\cloud_orchestrator\deploy.ps1

$ErrorActionPreference = "Continue"

# ── Configuration ─────────────────────────────────────────────────────────────
$KAGGLE_USERNAME = "omriasidon"
$KAGGLE_KERNEL_SLUG = "omriasidon/retrainning-waste-classification-model"
$CLOUD_BUILD_TRIGGER_ID = "036930df-ed00-4a24-913e-03ca0c6e1e36"
$SERVICE_ACCOUNT = "retrain-sa@smart-waste-sorter.iam.gserviceaccount.com"
$GCP_PROJECT = "smart-waste-sorter"
$REGION = "europe-west1"
$BUCKET_NAME = "retrain_smart_waste_model"
# ─────────────────────────────────────────────────────────────────────────────

# Step 1: Store Kaggle API key in Secret Manager
# Use a temp binary file to avoid PowerShell adding \r\n to the piped string
Write-Host "Storing Kaggle API key in Secret Manager..."
$key = (Get-Content "$PSScriptRoot\..\kaggle.json" | ConvertFrom-Json).key.Trim()
$tmpFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tmpFile, $key, [System.Text.Encoding]::UTF8)
gcloud secrets versions add kaggle-api-key --data-file=$tmpFile --project=$GCP_PROJECT 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  gcloud secrets create kaggle-api-key --data-file=$tmpFile --project=$GCP_PROJECT 2>&1 | Out-Null
}
Remove-Item $tmpFile
Write-Host "Kaggle key stored."

$COMMON = @(
  "--gen2",
  "--runtime=python311",
  "--region=$REGION",
  "--source=$PSScriptRoot",
  "--trigger-event-filters=type=google.cloud.storage.object.v1.finalized",
  "--trigger-event-filters=bucket=$BUCKET_NAME",
  "--trigger-location=$REGION",
  "--timeout=120s",
  "--memory=512Mi",
  "--service-account=$SERVICE_ACCOUNT",
  "--project=$GCP_PROJECT"
)

# Step 2: Deploy retrain_orchestrator (triggers Kaggle when training_data/ gets new files)
Write-Host ""
Write-Host "Deploying retrain-orchestrator..."
gcloud functions deploy retrain-orchestrator @COMMON `
  --entry-point=retrain_orchestrator `
  --set-env-vars="KAGGLE_USERNAME=$KAGGLE_USERNAME,KAGGLE_KERNEL_SLUG=$KAGGLE_KERNEL_SLUG,GCP_PROJECT=$GCP_PROJECT,CLOUD_BUILD_TRIGGER_ID=$CLOUD_BUILD_TRIGGER_ID" `
  --set-secrets="KAGGLE_KEY=kaggle-api-key:latest"

# Step 3: Deploy retrain_deployer (triggers Cloud Build when training_status.json is written)
Write-Host ""
Write-Host "Deploying retrain-deployer..."
gcloud functions deploy retrain-deployer @COMMON `
  --entry-point=retrain_deployer `
  --set-env-vars="GCP_PROJECT=$GCP_PROJECT,CLOUD_BUILD_TRIGGER_ID=$CLOUD_BUILD_TRIGGER_ID"

Write-Host ""
Write-Host "Done!"
Write-Host "  retrain-orchestrator fires when new files land in gs://$BUCKET_NAME/training_data/"
Write-Host "  retrain-deployer fires when gs://$BUCKET_NAME/models/training_status.json is written"
