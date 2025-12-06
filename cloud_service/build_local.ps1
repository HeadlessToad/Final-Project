
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "🚧 Preparing Build Context..."

# 1. Reset the build folder (inside cloud_service)
if (Test-Path "build_context") { Remove-Item -Recurse -Force "build_context" }
New-Item -ItemType Directory "build_context" | Out-Null
New-Item -ItemType Directory "build_context/weights" | Out-Null

# 2. Copy local files (main, dockerfile, requirements are right here)
Copy-Item "main.py" "build_context/"
Copy-Item "Dockerfile" "build_context/"
Copy-Item "requirements.txt" "build_context/"
Copy-Item "../backend/serviceAccountKey.json" "build_context/"

# 3. Copy Shared Resources (Go up one level to find 'shared')
Copy-Item -Recurse "../shared" "build_context/"

# 4. Copy the model (Go up one level to find 'ml')
# 🚨 Ensure this path matches your actual model location!
Copy-Item "../ml/train_kaggle_stable/weights/best_weights.pt" "build_context/weights/"

# 5. Build the Docker Image
docker build -t waste-classifier-cloud ./build_context

Write-Host "✅ Manual Build Complete!"
