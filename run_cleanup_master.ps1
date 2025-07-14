# Master cleanup script for single-player-cocos-client
# This script orchestrates the entire cleanup process in the correct order

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "MASTER CLEANUP SCRIPT FOR COCOS CREATOR PROJECT" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (!(Test-Path "assets/games") -or !(Test-Path "__tests__/games")) {
    Write-Host "ERROR: This script must be run from the single-player-cocos-client root directory!" -ForegroundColor Red
    Write-Host "Please navigate to the correct directory and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Step 1: Backup all metadata files (CRITICAL for Cocos Creator)
Write-Host "STEP 1: Creating metadata backup..." -ForegroundColor Yellow
Write-Host "This is CRITICAL for Cocos Creator project integrity!" -ForegroundColor Red
$confirmation = Read-Host "Do you want to proceed with metadata backup? (y/N)"
if ($confirmation -eq "y" -or $confirmation -eq "Y") {
    & .\backup_metadata.ps1
    Write-Host ""
}
else {
    Write-Host "Metadata backup skipped. WARNING: This may cause Cocos Creator issues!" -ForegroundColor Red
    Write-Host ""
}

# Step 2: Clean up orphaned test files
Write-Host "STEP 2: Cleaning up orphaned test files..." -ForegroundColor Yellow
$confirmation = Read-Host "Do you want to proceed with orphaned test cleanup? (y/N)"
if ($confirmation -eq "y" -or $confirmation -eq "Y") {
    & .\cleanup_orphaned_tests.ps1
    Write-Host ""
}
else {
    Write-Host "Orphaned test cleanup skipped." -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Clean up test directories for removed games
Write-Host "STEP 3: Cleaning up test directories for removed games..." -ForegroundColor Yellow
$confirmation = Read-Host "Do you want to proceed with test directory cleanup? (y/N)"
if ($confirmation -eq "y" -or $confirmation -eq "Y") {
    & .\cleanup_test_files.ps1
    Write-Host ""
}
else {
    Write-Host "Test directory cleanup skipped." -ForegroundColor Yellow
    Write-Host ""
}

# Step 4: Clean up unused games
Write-Host "STEP 4: Cleaning up unused games..." -ForegroundColor Yellow
Write-Host "This will remove games not needed for roulette functionality." -ForegroundColor Cyan
$confirmation = Read-Host "Do you want to proceed with game cleanup? (y/N)"
if ($confirmation -eq "y" -or $confirmation -eq "Y") {
    & .\cleanup_games.ps1
    Write-Host ""
}
else {
    Write-Host "Game cleanup skipped." -ForegroundColor Yellow
    Write-Host ""
}

# Final summary
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "CLEANUP PROCESS COMPLETED" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "1. All removed files have been backed up with timestamps" -ForegroundColor White
Write-Host "2. Essential games for roulette have been preserved" -ForegroundColor White
Write-Host "3. Metadata files are critical for Cocos Creator - keep backups safe" -ForegroundColor White
Write-Host "4. You can restore any removed content from the backup directories" -ForegroundColor White
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Test the roulette game functionality" -ForegroundColor White
Write-Host "2. Open the project in Cocos Creator to verify integrity" -ForegroundColor White
Write-Host "3. Run tests to ensure everything works correctly" -ForegroundColor White
Write-Host "4. If issues occur, restore from backups as needed" -ForegroundColor White
Write-Host ""
Write-Host "Backup directories created:" -ForegroundColor Cyan
Get-ChildItem -Directory -Name "*backup*" | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host "" 