# Cleanup sedie directory while keeping essential animation files
# This script removes all sedie resources except the animation files needed by winning effects

Write-Host "Cleaning up sedie directory while keeping essential animations..." -ForegroundColor Green

$sediePath = "assets/games/sedie"

# Check if sedie directory exists
if (-not (Test-Path $sediePath)) {
    Write-Host "Sedie directory not found at: $sediePath" -ForegroundColor Red
    exit 1
}

# Create backup directory
$backupDir = "assets/games/sedie_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup in: $backupDir" -ForegroundColor Cyan
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# Backup the entire sedie directory first
Write-Host "Creating backup of sedie directory..." -ForegroundColor Yellow
Copy-Item -Path $sediePath -Destination $backupDir -Recurse -Force

# Define the animation files to keep (referenced by winning effects)
$animationsToKeep = @(
    "XocDiaChienThangAnimation.anim",
    "XocDiaChienThangAnimation.anim.meta",
    "hieuung_win.anim", 
    "hieuung_win.anim.meta"
)

# Remove all directories except animations
$directoriesToRemove = @("views", "view-models", "textures", "audios", "spines")

foreach ($dir in $directoriesToRemove) {
    $dirPath = Join-Path $sediePath $dir
    if (Test-Path $dirPath) {
        Write-Host "Removing directory: $dir" -ForegroundColor Yellow
        Remove-Item -Path $dirPath -Recurse -Force
    }
}

# Remove all animation files except the ones we need to keep
$animationsPath = Join-Path $sediePath "animations"
if (Test-Path $animationsPath) {
    Write-Host "Cleaning animations directory..." -ForegroundColor Yellow
    
    # Get all files in animations directory
    $allAnimationFiles = Get-ChildItem -Path $animationsPath -File
    
    foreach ($file in $allAnimationFiles) {
        if ($animationsToKeep -notcontains $file.Name) {
            Write-Host "Removing animation file: $($file.Name)" -ForegroundColor Yellow
            Remove-Item -Path $file.FullName -Force
        }
        else {
            Write-Host "Keeping animation file: $($file.Name)" -ForegroundColor Green
        }
    }
}

# Remove meta files for removed directories
$metaFilesToRemove = @(
    "views.meta",
    "view-models.meta", 
    "textures.meta",
    "audios.meta",
    "spines.meta"
)

foreach ($metaFile in $metaFilesToRemove) {
    $metaPath = Join-Path $sediePath $metaFile
    if (Test-Path $metaPath) {
        Write-Host "Removing meta file: $metaFile" -ForegroundColor Yellow
        Remove-Item -Path $metaPath -Force
    }
}

# Verify the remaining structure
Write-Host "`nVerifying remaining structure..." -ForegroundColor Cyan
$remainingFiles = Get-ChildItem -Path $sediePath -Recurse -File
Write-Host "Remaining files in sedie directory:" -ForegroundColor Green
foreach ($file in $remainingFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "  - $relativePath" -ForegroundColor White
}

Write-Host "`nCleanup completed successfully!" -ForegroundColor Green
Write-Host "Backup created at: $backupDir" -ForegroundColor Cyan
Write-Host "Only essential animation files for winning effects have been kept." -ForegroundColor Green 