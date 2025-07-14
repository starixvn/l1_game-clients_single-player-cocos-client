# PowerShell script to backup all metadata files before cleanup
# This is CRITICAL for Cocos Creator project integrity

Write-Host "Creating metadata backup for Cocos Creator project..." -ForegroundColor Green

# Create backup directory with timestamp
$backupDir = "metadata_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup in: $backupDir" -ForegroundColor Cyan

# Create backup directory structure
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup all .meta files recursively
$metaFiles = Get-ChildItem -Path "." -Filter "*.meta" -Recurse

Write-Host "Found $($metaFiles.Count) metadata files to backup" -ForegroundColor Yellow

foreach ($metaFile in $metaFiles) {
    $relativePath = $metaFile.FullName.Substring((Get-Location).Path.Length + 1)
    $backupPath = Join-Path $backupDir $relativePath
    
    # Create directory structure in backup
    $backupDirPath = Split-Path $backupPath -Parent
    if (!(Test-Path $backupDirPath)) {
        New-Item -ItemType Directory -Path $backupDirPath -Force | Out-Null
    }
    
    # Copy metadata file
    Copy-Item -Path $metaFile.FullName -Destination $backupPath -Force
    Write-Host "  Backed up: $relativePath" -ForegroundColor Gray
}

Write-Host "`nMetadata backup completed!" -ForegroundColor Green
Write-Host "Backup location: $backupDir" -ForegroundColor Cyan
Write-Host "IMPORTANT: Keep this backup safe - it contains all Cocos Creator metadata!" -ForegroundColor Yellow 