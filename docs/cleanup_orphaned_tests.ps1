# PowerShell script to clean up test files that reference removed games

Write-Host "Cleaning up test files that reference removed games..." -ForegroundColor Green

# Define test files that reference removed games and should be cleaned up
$orphanedTestFiles = @(
    "__tests__/mini-games-panel/MiniGameRoundTimer.test.ts"
)

Write-Host "Orphaned test files to be removed:" -ForegroundColor Yellow
foreach ($testFile in $orphanedTestFiles) {
    Write-Host "  - $testFile" -ForegroundColor Red
}

# Ask for confirmation
$confirmation = Read-Host "`nDo you want to proceed with removing these orphaned test files? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Orphaned test cleanup cancelled." -ForegroundColor Yellow
    exit
}

# Create backup directory for orphaned tests
$backupDir = "__tests__/orphaned_tests_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup in: $backupDir" -ForegroundColor Cyan

# Create backup directory structure
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Remove orphaned test files
foreach ($testFile in $orphanedTestFiles) {
    if (Test-Path $testFile) {
        Write-Host "Processing orphaned test file: $testFile" -ForegroundColor Red
        
        # Copy to backup
        $backupTestPath = "$backupDir/$(Split-Path $testFile -Leaf)"
        try {
            Copy-Item -Path $testFile -Destination $backupTestPath -Force
            Write-Host "  Copied to backup: $backupTestPath" -ForegroundColor Gray
            
            # Remove the original file
            try {
                Remove-Item -Path $testFile -Force
                Write-Host "  Removed original: $testFile" -ForegroundColor Green
            }
            catch {
                Write-Host "  Warning: Could not remove original file: $testFile" -ForegroundColor Yellow
                Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "  Error processing: $testFile" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  Not found: $testFile" -ForegroundColor Gray
    }
}

Write-Host "`nOrphaned test cleanup completed!" -ForegroundColor Green
Write-Host "Removed test files have been copied to: $backupDir" -ForegroundColor Cyan
Write-Host "You can restore them later if needed by copying them back" -ForegroundColor Yellow 