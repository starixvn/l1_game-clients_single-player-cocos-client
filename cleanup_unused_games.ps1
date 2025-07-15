# Cleanup script to remove unused game directories
# Keep only mini roulette game and its dependencies

Write-Host "Starting cleanup of unused game directories..." -ForegroundColor Green

# Define the base directory
$gamesDir = "assets/games"

# Define directories to KEEP (mini roulette and its dependencies)
$keepDirectories = @(
    "_roulette-s",
    "_solo_game", 
    "_base_new",
    "_base",
    "_new",
    "roulette",
    "_casino",
    "_gateway_game",
    "_slotgame_base",
    "_baccarat",
    "_dummy_room"
)

# Get all directories in the games folder
$allDirectories = Get-ChildItem -Path $gamesDir -Directory | Select-Object -ExpandProperty Name

Write-Host "Found directories in $gamesDir:" -ForegroundColor Yellow
foreach ($dir in $allDirectories) { Write-Host "  - $dir" }

Write-Host "`nDirectories to KEEP:" -ForegroundColor Green
foreach ($dir in $keepDirectories) { Write-Host "  - $dir" }

# Find directories to remove
$directoriesToRemove = @()
foreach ($dir in $allDirectories) {
    if ($dir -notin $keepDirectories) {
        $directoriesToRemove += $dir
    }
}

Write-Host "`nDirectories to REMOVE:" -ForegroundColor Red
foreach ($dir in $directoriesToRemove) { Write-Host "  - $dir" }

# Ask for confirmation
Write-Host "`nDo you want to proceed with removing these directories? (y/N)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -eq "y" -or $confirmation -eq "Y") {
    Write-Host "`nRemoving unused directories..." -ForegroundColor Green
    
    foreach ($dir in $directoriesToRemove) {
        $fullPath = Join-Path $gamesDir $dir
        if (Test-Path $fullPath) {
            try {
                Remove-Item -Path $fullPath -Recurse -Force
                Write-Host "  ✓ Removed: $dir" -ForegroundColor Green
            }
            catch {
                Write-Host "  ✗ Failed to remove: $dir - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "  - Directory not found: $dir" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nCleanup completed!" -ForegroundColor Green
    Write-Host "Remaining directories:" -ForegroundColor Cyan
    $remainingDirs = Get-ChildItem -Path $gamesDir -Directory | Select-Object -ExpandProperty Name
    foreach ($dir in $remainingDirs) { Write-Host "  - $dir" }
}
else {
    Write-Host "`nCleanup cancelled." -ForegroundColor Yellow
}

Write-Host "`nNote: This script only removes game directories. You may also want to:" -ForegroundColor Cyan
Write-Host "1. Check for any remaining unused meta files" -ForegroundColor Cyan
Write-Host "2. Update any import statements that reference removed games" -ForegroundColor Cyan
Write-Host "3. Test the mini roulette game to ensure it still works" -ForegroundColor Cyan 