# Fix sedie directory structure to match single-player-cocos-client-force-direct
# This script removes the full sedie game implementation and keeps only the minimal structure

Write-Host "Fixing sedie directory structure..." -ForegroundColor Green

# Remove the existing sedie directory
if (Test-Path "assets/games/sedie") {
    Write-Host "Removing existing sedie directory..." -ForegroundColor Yellow
    Remove-Item -Path "assets/games/sedie" -Recurse -Force
}

# Create the minimal sedie directory structure
Write-Host "Creating minimal sedie directory structure..." -ForegroundColor Yellow
New-Item -Path "assets/games/sedie" -ItemType Directory -Force | Out-Null
New-Item -Path "assets/games/sedie/view-models" -ItemType Directory -Force | Out-Null

# Copy the minimal SedieWallet.ts file from force-direct version
$sourceFile = "../single-player-cocos-client-force-direct/assets/games/sedie/view-models/SedieWallet.ts"
$targetFile = "assets/games/sedie/view-models/SedieWallet.ts"

if (Test-Path $sourceFile) {
    Write-Host "Copying SedieWallet.ts from force-direct version..." -ForegroundColor Yellow
    Copy-Item -Path $sourceFile -Destination $targetFile -Force
}
else {
    Write-Host "Warning: Source file not found: $sourceFile" -ForegroundColor Red
}

Write-Host "Sedie directory structure fixed successfully!" -ForegroundColor Green 