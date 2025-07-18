# Cleanup script for unused meta files in Cocos Creator project
# This script identifies meta files that don't have corresponding assets

param(
    [switch]$Cleanup
)

# Configuration
$ProjectRoot = $PSScriptRoot
$AssetsDir = Join-Path $ProjectRoot "assets"
$BackupDir = Join-Path $ProjectRoot "meta_backup"

# Create backup directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Function to recursively find all meta files
function Find-MetaFiles {
    param([string]$Dir)
    
    $metaFiles = @()
    
    function Traverse {
        param([string]$CurrentDir)
        
        $items = Get-ChildItem -Path $CurrentDir
        
        foreach ($item in $items) {
            if ($item.PSIsContainer) {
                Traverse -CurrentDir $item.FullName
            }
            elseif ($item.Name -like "*.meta") {
                $metaFiles += $item.FullName
            }
        }
    }
    
    Traverse -CurrentDir $Dir
    return $metaFiles
}

# Function to check if a meta file has a corresponding asset
function Test-CorrespondingAsset {
    param([string]$MetaPath)
    
    $assetPath = $MetaPath -replace '\.meta$', ''
    
    # Check if the asset file exists
    if (Test-Path $assetPath) {
        return $true
    }
    
    # Special case: check if it's a directory meta file
    if (Test-Path $assetPath -PathType Container) {
        return $true
    }
    
    return $false
}

# Function to backup a meta file before deletion
function Backup-MetaFile {
    param([string]$MetaPath)
    
    $relativePath = $MetaPath.Substring($ProjectRoot.Length + 1)
    $backupPath = Join-Path $BackupDir $relativePath
    $backupDir = Split-Path $backupPath -Parent
    
    if (!(Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    Copy-Item -Path $MetaPath -Destination $backupPath
    Write-Host "Backed up: $relativePath"
}

# Main cleanup function
function Show-UnusedMetaFiles {
    Write-Host "🔍 Scanning for unused meta files...`n" -ForegroundColor Cyan
    
    $allMetaFiles = Find-MetaFiles -Dir $AssetsDir
    $unusedMetaFiles = @()
    
    foreach ($metaPath in $allMetaFiles) {
        if (!(Test-CorrespondingAsset -MetaPath $metaPath)) {
            $unusedMetaFiles += $metaPath
        }
    }
    
    if ($unusedMetaFiles.Count -eq 0) {
        Write-Host "✅ No unused meta files found!" -ForegroundColor Green
        return
    }
    
    Write-Host "⚠️  Found $($unusedMetaFiles.Count) unused meta files:`n" -ForegroundColor Yellow
    
    foreach ($metaPath in $unusedMetaFiles) {
        $relativePath = $metaPath.Substring($ProjectRoot.Length + 1)
        Write-Host "  - $relativePath"
    }
    
    Write-Host "`n📋 Summary of unused meta files:" -ForegroundColor Cyan
    Write-Host "====================================="
    
    # Group by directory
    $groupedFiles = @{}
    foreach ($metaPath in $unusedMetaFiles) {
        $relativePath = $metaPath.Substring($ProjectRoot.Length + 1)
        $dir = Split-Path $relativePath -Parent
        
        if (!$groupedFiles.ContainsKey($dir)) {
            $groupedFiles[$dir] = @()
        }
        $groupedFiles[$dir] += Split-Path $relativePath -Leaf
    }
    
    foreach ($dir in $groupedFiles.Keys | Sort-Object) {
        Write-Host "`n📁 $dir/" -ForegroundColor Blue
        foreach ($file in $groupedFiles[$dir]) {
            Write-Host "   $file"
        }
    }
    
    Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
    Write-Host "1. Review these files to ensure they are truly unused"
    Write-Host "2. If they are unused, you can safely delete them"
    Write-Host "3. If they correspond to assets that were moved, update the paths"
    Write-Host "4. Run this script again after cleanup to verify"
    
    # Option to automatically backup and delete
    Write-Host "`n🚀 To automatically backup and delete these files, run:" -ForegroundColor Green
    Write-Host "   .\cleanup_unused_meta.ps1 -Cleanup"
}

# Automatic cleanup with backup
function Perform-Cleanup {
    Write-Host "🧹 Performing automatic cleanup...`n" -ForegroundColor Cyan
    
    $allMetaFiles = Find-MetaFiles -Dir $AssetsDir
    $unusedMetaFiles = @()
    
    foreach ($metaPath in $allMetaFiles) {
        if (!(Test-CorrespondingAsset -MetaPath $metaPath)) {
            $unusedMetaFiles += $metaPath
        }
    }
    
    if ($unusedMetaFiles.Count -eq 0) {
        Write-Host "✅ No unused meta files found!" -ForegroundColor Green
        return
    }
    
    Write-Host "📦 Backing up $($unusedMetaFiles.Count) unused meta files..." -ForegroundColor Yellow
    
    foreach ($metaPath in $unusedMetaFiles) {
        Backup-MetaFile -MetaPath $metaPath
    }
    
    Write-Host "`n🗑️  Deleting unused meta files..." -ForegroundColor Red
    
    foreach ($metaPath in $unusedMetaFiles) {
        $relativePath = $metaPath.Substring($ProjectRoot.Length + 1)
        Remove-Item -Path $metaPath -Force
        Write-Host "Deleted: $relativePath"
    }
    
    Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green
    $backupRelativePath = $BackupDir.Substring($ProjectRoot.Length + 1)
    Write-Host "📦 Backup files saved to: $backupRelativePath" -ForegroundColor Cyan
    Write-Host "💡 You can restore files from backup if needed" -ForegroundColor Cyan
}

# Main execution
if ($Cleanup) {
    Perform-Cleanup
}
else {
    Show-UnusedMetaFiles
} 