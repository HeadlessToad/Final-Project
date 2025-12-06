
$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ID = "smart-waste-sorter" # Replace with your actual project ID
$REGION = "us-central1"
$SERVICE_NAME = "waste-classifier"
# $IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "🚀 Starting Deployment to Cloud Run..."

# New Simplified Deployment: let Cloud Run handle the build
Write-Host "🚀 Deploying from source (this handles building automatically)..."
gcloud run deploy $SERVICE_NAME `
    --source ./build_context `
    --project $PROJECT_ID `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --memory 1Gi

Write-Host "✅ Deployment Complete!"
Write-Host "Use the URL provided above in your backend configuration (CLOUD_MODEL_URL)."
