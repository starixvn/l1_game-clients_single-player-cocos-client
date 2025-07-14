# PowerShell script to clean up unused games while keeping roulette functionality
# This script removes games that are not dependencies for the roulette game

Write-Host "Starting cleanup of unused games..." -ForegroundColor Green

# Define the games that can be safely removed (not used by roulette)
$gamesToRemove = @(
    "vip-sedie",
    "vip-sedie-war", 
    "vip-fish-prawn-crab",
    "vip-baccarat",
    "turbo-oddeven",
    "turbo-bigsmall",
    "three-cards",
    "texas-holdem-poker",
    "special-sedie",
    "sicbo",
    "sedie",
    "multiplay",
    "multiplay-keno",
    "multiplay-bigsmall",
    "muliplay-mini-sedie",
    "mini-keno",
    "lucky-wheel",
    "lottery",
    "keno-pro",
    "holdem-poker",
    "hi-lo",
    "gateway-baccarat",
    "dragon-tiger",
    "cascading-slot",
    "blackjack",
    "bitcoin-master",
    "bigsmall",
    "bau-cua-mini",
    "baccarat"
)

# Define the games that MUST BE KEPT (essential for roulette)
$gamesToKeep = @(
    "_roulette-s",
    "roulette",
    "_base",
    "_base_new", 
    "_solo_game",
    "_new",
    "_casino",
    "_gateway_game",
    "_dummy_room",
    "_slotgame_base"
)

Write-Host "Games to be removed:" -ForegroundColor Yellow
foreach ($game in $gamesToRemove) {
    Write-Host "  - $game" -ForegroundColor Red
}

Write-Host "`nGames to be kept:" -ForegroundColor Yellow
foreach ($game in $gamesToKeep) {
    Write-Host "  - $game" -ForegroundColor Green
}

# Ask for confirmation
$confirmation = Read-Host "`nDo you want to proceed with the cleanup? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    exit
}

# Create backup directory
$backupDir = "assets/games_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup in: $backupDir" -ForegroundColor Cyan

# Create backup directory structure
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Remove games that are not needed
foreach ($game in $gamesToRemove) {
    $gamePath = "assets/games/$game"
    if (Test-Path $gamePath) {
        Write-Host "Processing: $game" -ForegroundColor Red
        
        # Use robocopy to copy to backup
        $backupGamePath = "$backupDir/$game"
        $robocopyArgs = @($gamePath, $backupGamePath, "/E", "/COPY:DAT", "/R:1", "/W:1")
        
        try {
            $result = & robocopy @robocopyArgs
            if ($result -le 7) {
                # robocopy success codes are 0-7
                Write-Host "  Copied to backup: $backupGamePath" -ForegroundColor Gray
                
                # Try to remove the original directory
                try {
                    Remove-Item -Path $gamePath -Recurse -Force
                    Write-Host "  Removed original: $gamePath" -ForegroundColor Green
                }
                catch {
                    Write-Host "  Warning: Could not remove original directory: $gamePath" -ForegroundColor Yellow
                    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
            else {
                Write-Host "  Failed to copy: $game" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "  Error processing: $game" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  Not found: $game" -ForegroundColor Gray
    }
}

Write-Host "`nCleanup completed!" -ForegroundColor Green
Write-Host "Removed games have been copied to: $backupDir" -ForegroundColor Cyan
Write-Host "You can restore them later if needed by copying them back to assets/games/" -ForegroundColor Yellow 