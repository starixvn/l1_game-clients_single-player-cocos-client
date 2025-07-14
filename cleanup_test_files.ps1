# PowerShell script to clean up test files for removed games

Write-Host "Cleaning up test files for removed games..." -ForegroundColor Green

# Define the test directories that should be removed (corresponding to removed games)
$testDirsToRemove = @(
    "vip-sedie-war",
    "vip-fish-prawn-crab", 
    "vip-baccarat",
    "three-cards",
    "texas-holdem-poker",
    "special-sedie",
    "sicbo",
    "sedie",
    "mini-sedie",
    "lucky-wheel",
    "lottery",
    "keno-pro",
    "holdem-poker",
    "hi-lo",
    "dragon-tiger",
    "chinese-blackjack",
    "cascading-slot",
    "blockchain-baccarat",
    "bitcoin-master",
    "blackjack",
    "bigsmall",
    "bau-cua-mini",
    "baccarat"
)

# Define the test directories that MUST BE KEPT (essential for roulette)
$testDirsToKeep = @(
    "roulette",
    "_base",
    "_baccarat",
    "_slotgame_base"
)

Write-Host "Test directories to be removed:" -ForegroundColor Yellow
foreach ($testDir in $testDirsToRemove) {
    Write-Host "  - $testDir" -ForegroundColor Red
}

Write-Host "`nTest directories to be kept:" -ForegroundColor Yellow
foreach ($testDir in $testDirsToKeep) {
    Write-Host "  - $testDir" -ForegroundColor Green
}

# Ask for confirmation
$confirmation = Read-Host "`nDo you want to proceed with removing these test directories? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Test cleanup cancelled." -ForegroundColor Yellow
    exit
}

# Create backup directory for tests
$backupDir = "__tests__/games_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup in: $backupDir" -ForegroundColor Cyan

# Create backup directory structure
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Remove test directories that are not needed
foreach ($testDir in $testDirsToRemove) {
    $testDirPath = "__tests__/games/$testDir"
    if (Test-Path $testDirPath) {
        Write-Host "Processing test directory: $testDir" -ForegroundColor Red
        
        # Use robocopy to copy to backup
        $backupTestPath = "$backupDir/$testDir"
        $robocopyArgs = @($testDirPath, $backupTestPath, "/E", "/COPY:DAT", "/R:1", "/W:1")
        
        try {
            $result = & robocopy @robocopyArgs
            if ($result -le 7) {
                # robocopy success codes are 0-7
                Write-Host "  Copied to backup: $backupTestPath" -ForegroundColor Gray
                
                # Try to remove the original directory
                try {
                    Remove-Item -Path $testDirPath -Recurse -Force
                    Write-Host "  Removed original: $testDirPath" -ForegroundColor Green
                }
                catch {
                    Write-Host "  Warning: Could not remove original directory: $testDirPath" -ForegroundColor Yellow
                    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
            else {
                Write-Host "  Failed to copy: $testDir" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "  Error processing: $testDir" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  Not found: $testDir" -ForegroundColor Gray
    }
}

Write-Host "`nTest cleanup completed!" -ForegroundColor Green
Write-Host "Removed test directories have been copied to: $backupDir" -ForegroundColor Cyan
Write-Host "You can restore them later if needed by copying them back to __tests__/games/" -ForegroundColor Yellow 