# Cleanup Verification Scripts
# Run these scripts after cleanup to verify everything is working correctly

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "CLEANUP VERIFICATION SCRIPTS" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Function to display section headers
function Write-SectionHeader {
    param([string]$Title)
    Write-Host "`n--- $Title ---" -ForegroundColor Yellow
}

# Function to display success/failure status
function Write-Status {
    param([string]$Message, [bool]$Success)
    $color = if ($Success) { "Green" } else { "Red" }
    $status = if ($Success) { "OK" } else { "FAIL" }
    Write-Host "$status $Message" -ForegroundColor $color
}

# Function to check if directory exists
function Test-DirectoryExists {
    param([string]$Path, [string]$Description)
    $exists = Test-Path $Path
    Write-Status "$Description: $Path" $exists
    return $exists
}

# Function to check if file exists
function Test-FileExists {
    param([string]$Path, [string]$Description)
    $exists = Test-Path $Path
    Write-Status "$Description: $Path" $exists
    return $exists
}

# Function to count items in directory
function Get-DirectoryCount {
    param([string]$Path, [string]$Description)
    if (Test-Path $Path) {
        $count = (Get-ChildItem $Path -Directory).Count
        Write-Host "  $Description: $count items" -ForegroundColor Gray
        return $count
    }
    else {
        Write-Host "  $Description: Directory not found" -ForegroundColor Red
        return 0
    }
}

# Function to check metadata integrity
function Test-MetadataIntegrity {
    param([string]$GamePath)
    $gameExists = Test-Path $GamePath
    $metaExists = Test-Path "$GamePath.meta"
    
    if ($gameExists -and $metaExists) {
        Write-Status "Metadata OK: $(Split-Path $GamePath -Leaf)" $true
        return $true
    }
    elseif ($gameExists -and !$metaExists) {
        Write-Status "Missing metadata: $(Split-Path $GamePath -Leaf)" $false
        return $false
    }
    elseif (!$gameExists -and $metaExists) {
        Write-Status "Orphaned metadata: $(Split-Path $GamePath -Leaf)" $false
        return $false
    }
    else {
        Write-Status "Missing game and metadata: $(Split-Path $GamePath -Leaf)" $false
        return $false
    }
}

# Main verification function
function Start-CleanupVerification {
    Write-Host "Starting comprehensive cleanup verification..." -ForegroundColor Green
    Write-Host ""

    $overallSuccess = $true
    $issues = @()

    # 1. Directory Structure Verification
    Write-SectionHeader "Directory Structure Verification"
    
    $requiredDirs = @(
        @{Path = "assets/games"; Description = "Games directory" },
        @{Path = "__tests__/games"; Description = "Test games directory" },
        @{Path = "assets/games/roulette"; Description = "Roulette game" },
        @{Path = "assets/games/_base"; Description = "Base game" },
        @{Path = "__tests__/games/roulette"; Description = "Roulette tests" },
        @{Path = "__tests__/games/_base"; Description = "Base tests" }
    )

    foreach ($dir in $requiredDirs) {
        $exists = Test-DirectoryExists $dir.Path $dir.Description
        if (!$exists) {
            $overallSuccess = $false
            $issues += "Missing directory: $($dir.Path)"
        }
    }

    # 2. Essential Games Verification
    Write-SectionHeader "Essential Games Verification"
    
    $essentialGames = @(
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

    $gamesFound = 0
    foreach ($game in $essentialGames) {
        $gamePath = "assets/games/$game"
        $exists = Test-DirectoryExists $gamePath "Game: $game"
        if ($exists) {
            $gamesFound++
            # Check metadata integrity
            Test-MetadataIntegrity $gamePath
        }
        else {
            $overallSuccess = $false
            $issues += "Missing essential game: $game"
        }
    }

    Write-Host "  Essential games found: $gamesFound / $($essentialGames.Count)" -ForegroundColor $(if ($gamesFound -eq $essentialGames.Count) { "Green" } else { "Red" })

    # 3. Removed Games Verification
    Write-SectionHeader "Removed Games Verification"
    
    $removedGames = @(
        "vip-sedie", "vip-sedie-war", "vip-fish-prawn-crab", "vip-baccarat",
        "turbo-oddeven", "turbo-bigsmall", "three-cards", "texas-holdem-poker",
        "special-sedie", "sicbo", "sedie", "multiplay", "multiplay-keno",
        "multiplay-bigsmall", "muliplay-mini-sedie", "mini-keno",
        "lucky-wheel", "lottery", "keno-pro", "holdem-poker", "hi-lo",
        "gateway-baccarat", "dragon-tiger", "cascading-slot", "blackjack",
        "bitcoin-master", "bigsmall", "bau-cua-mini", "baccarat"
    )

    $removedGamesFound = 0
    foreach ($game in $removedGames) {
        $gamePath = "assets/games/$game"
        $exists = Test-Path $gamePath
        if ($exists) {
            Write-Status "Game still exists (should be removed): $game" $false
            $removedGamesFound++
            $overallSuccess = $false
            $issues += "Game not removed: $game"
        }
    }

    if ($removedGamesFound -eq 0) {
        Write-Host "  OK All removed games successfully deleted" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL $removedGamesFound games still exist" -ForegroundColor Red
    }

    # 4. Test Directories Verification
    Write-SectionHeader "Test Directories Verification"
    
    $essentialTestDirs = @("roulette", "_base", "_baccarat", "_slotgame_base")
    $removedTestDirs = @(
        "vip-sedie-war", "vip-fish-prawn-crab", "vip-baccarat", "three-cards",
        "texas-holdem-poker", "special-sedie", "sicbo", "sedie", "mini-sedie",
        "lucky-wheel", "lottery", "keno-pro", "holdem-poker", "hi-lo",
        "dragon-tiger", "chinese-blackjack", "cascading-slot", "blackjack",
        "blockchain-baccarat", "bitcoin-master", "bigsmall", "bau-cua-mini", "baccarat"
    )

    # Check essential test directories
    $essentialTestsFound = 0
    foreach ($testDir in $essentialTestDirs) {
        $testPath = "__tests__/games/$testDir"
        $exists = Test-DirectoryExists $testPath "Test directory: $testDir"
        if ($exists) {
            $essentialTestsFound++
        }
        else {
            $overallSuccess = $false
            $issues += "Missing essential test directory: $testDir"
        }
    }

    Write-Host "  Essential test directories found: $essentialTestsFound / $($essentialTestDirs.Count)" -ForegroundColor $(if ($essentialTestsFound -eq $essentialTestDirs.Count) { "Green" } else { "Red" })

    # Check removed test directories
    $removedTestsFound = 0
    foreach ($testDir in $removedTestDirs) {
        $testPath = "__tests__/games/$testDir"
        $exists = Test-Path $testPath
        if ($exists) {
            Write-Status "Test directory still exists (should be removed): $testDir" $false
            $removedTestsFound++
            $overallSuccess = $false
            $issues += "Test directory not removed: $testDir"
        }
    }

    if ($removedTestsFound -eq 0) {
        Write-Host "  OK All removed test directories successfully deleted" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL $removedTestsFound test directories still exist" -ForegroundColor Red
    }

    # 5. Orphaned Test Files Verification
    Write-SectionHeader "Orphaned Test Files Verification"
    
    $orphanedTestFile = "__tests__/mini-games-panel/MiniGameRoundTimer.test.ts"
    $exists = Test-Path $orphanedTestFile
    if ($exists) {
        Write-Status "Orphaned test file still exists (should be removed): MiniGameRoundTimer.test.ts" $false
        $overallSuccess = $false
        $issues += "Orphaned test file not removed: MiniGameRoundTimer.test.ts"
    }
    else {
        Write-Status "Orphaned test file successfully removed: MiniGameRoundTimer.test.ts" $true
    }

    # 6. Backup Verification
    Write-SectionHeader "Backup Verification"
    
    $backupTypes = @(
        @{Pattern = "metadata_backup_*"; Description = "Metadata backups" },
        @{Pattern = "assets/games_backup_*"; Description = "Game backups" },
        @{Pattern = "__tests__/games_backup_*"; Description = "Test directory backups" },
        @{Pattern = "__tests__/orphaned_tests_backup_*"; Description = "Orphaned test backups" }
    )

    $backupsFound = 0
    foreach ($backup in $backupTypes) {
        $backupDirs = Get-ChildItem -Directory -Name $backup.Pattern -ErrorAction SilentlyContinue
        if ($backupDirs.Count -gt 0) {
            Write-Status "$($backup.Description): $($backupDirs.Count) found" $true
            $backupsFound++
            
            # Show backup details
            foreach ($backupDir in $backupDirs) {
                $itemCount = (Get-ChildItem $backupDir -Recurse -ErrorAction SilentlyContinue).Count
                Write-Host "    $backupDir ($itemCount items)" -ForegroundColor Gray
            }
        }
        else {
            Write-Status "$($backup.Description): None found" $false
            $overallSuccess = $false
            $issues += "Missing backup: $($backup.Description)"
        }
    }

    # 7. Project Statistics
    Write-SectionHeader "Project Statistics"
    
    $totalGames = (Get-ChildItem "assets/games" -Directory -ErrorAction SilentlyContinue).Count
    $totalTests = (Get-ChildItem "__tests__/games" -Directory -ErrorAction SilentlyContinue).Count
    $totalMetaFiles = (Get-ChildItem -Filter "*.meta" -Recurse -ErrorAction SilentlyContinue).Count
    
    Write-Host "  Total games remaining: $totalGames" -ForegroundColor Gray
    Write-Host "  Total test directories remaining: $totalTests" -ForegroundColor Gray
    Write-Host "  Total metadata files: $totalMetaFiles" -ForegroundColor Gray

    # 8. Summary
    Write-SectionHeader "Verification Summary"
    
    if ($overallSuccess) {
        Write-Host "✓ CLEANUP VERIFICATION PASSED" -ForegroundColor Green
        Write-Host "  All essential components are present" -ForegroundColor Green
        Write-Host "  All removed content has been deleted" -ForegroundColor Green
        Write-Host "  All backups have been created" -ForegroundColor Green
    }
    else {
        Write-Host "✗ CLEANUP VERIFICATION FAILED" -ForegroundColor Red
        Write-Host "  Issues found:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "    - $issue" -ForegroundColor Red
        }
    }

    # 9. Recommendations
    Write-SectionHeader "Recommendations"
    
    if ($overallSuccess) {
        Write-Host "✓ Next steps:" -ForegroundColor Green
        Write-Host "  1. Open project in Cocos Creator" -ForegroundColor White
        Write-Host "  2. Verify roulette game loads correctly" -ForegroundColor White
        Write-Host "  3. Run test suite to ensure functionality" -ForegroundColor White
        Write-Host "  4. Test roulette game manually" -ForegroundColor White
    }
    else {
        Write-Host "✗ Action required:" -ForegroundColor Red
        Write-Host "  1. Review the issues listed above" -ForegroundColor White
        Write-Host "  2. Restore missing components from backups" -ForegroundColor White
        Write-Host "  3. Re-run verification after fixes" -ForegroundColor White
        Write-Host "  4. Contact development team if issues persist" -ForegroundColor White
    }

    return $overallSuccess
}

# Function to run Cocos Creator validation
function Test-CocosCreatorValidation {
    Write-SectionHeader "Cocos Creator Validation"
    
    Write-Host "To validate in Cocos Creator:" -ForegroundColor Yellow
    Write-Host "1. Open Cocos Creator" -ForegroundColor White
    Write-Host "2. Open project: single-player-cocos-client" -ForegroundColor White
    Write-Host "3. Wait for project to load completely" -ForegroundColor White
    Write-Host "4. Check for red error indicators" -ForegroundColor White
    Write-Host "5. Look for missing asset warnings" -ForegroundColor White
    Write-Host "6. Verify no broken references" -ForegroundColor White
    Write-Host "7. Open roulette game scene" -ForegroundColor White
    Write-Host "8. Confirm all components load correctly" -ForegroundColor White
    
    $response = Read-Host "`nDid Cocos Creator validation pass? (y/N)"
    return $response -eq "y" -or $response -eq "Y"
}

# Function to run functionality tests
function Test-FunctionalityTests {
    Write-SectionHeader "Functionality Tests"
    
    Write-Host "Running functionality tests..." -ForegroundColor Yellow
    
    # Check if npm/yarn is available
    $npmAvailable = $null -ne (Get-Command npm -ErrorAction SilentlyContinue)
    $yarnAvailable = $null -ne (Get-Command yarn -ErrorAction SilentlyContinue)
    
    if ($npmAvailable) {
        Write-Host "Running tests with npm..." -ForegroundColor Gray
        try {
            $testResult = npm test 2>&1
            Write-Host "Test output:" -ForegroundColor Gray
            Write-Host $testResult
            return $LASTEXITCODE -eq 0
        }
        catch {
            Write-Host "Error running npm tests: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
    elseif ($yarnAvailable) {
        Write-Host "Running tests with yarn..." -ForegroundColor Gray
        try {
            $testResult = yarn test 2>&1
            Write-Host "Test output:" -ForegroundColor Gray
            Write-Host $testResult
            return $LASTEXITCODE -eq 0
        }
        catch {
            Write-Host "Error running yarn tests: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "Neither npm nor yarn found. Please run tests manually." -ForegroundColor Yellow
        Write-Host "Manual test steps:" -ForegroundColor White
        Write-Host "1. Run: npm test or yarn test" -ForegroundColor White
        Write-Host "2. Check for test failures" -ForegroundColor White
        Write-Host "3. Verify roulette-related tests pass" -ForegroundColor White
        
        $response = Read-Host "`nDid manual tests pass? (y/N)"
        return $response -eq "y" -or $response -eq "Y"
    }
}

# Function to generate verification report
function New-VerificationReport {
    param([bool]$Success, [array]$Issues)
    
    $reportPath = "cleanup_verification_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    
    $report = @"
Cleanup Verification Report
Generated: $(Get-Date)

Overall Status: $(if ($Success) { "PASSED" } else { "FAILED" })

Issues Found:
$($Issues | ForEach-Object { "- $_" } | Out-String)

Project Statistics:
- Total games remaining: $((Get-ChildItem "assets/games" -Directory -ErrorAction SilentlyContinue).Count)
- Total test directories remaining: $((Get-ChildItem "__tests__/games" -Directory -ErrorAction SilentlyContinue).Count)
- Total metadata files: $((Get-ChildItem -Filter "*.meta" -Recurse -ErrorAction SilentlyContinue).Count)

Backup Locations:
$((Get-ChildItem -Directory -Name "*backup*" | ForEach-Object { "- $_" }) | Out-String)

Recommendations:
$(if ($Success) { "- Proceed with Cocos Creator validation" } else { "- Review and fix issues before proceeding" })
- Test roulette game functionality
- Run complete test suite
- Document any custom modifications
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "Verification report saved to: $reportPath" -ForegroundColor Cyan
    
    return $reportPath
}

# Main execution
Write-Host "Choose verification option:" -ForegroundColor Yellow
Write-Host "1. Basic verification (recommended)" -ForegroundColor White
Write-Host "2. Full verification with Cocos Creator and tests" -ForegroundColor White
Write-Host "3. Generate verification report only" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-3)"

switch ($choice) {
    "1" {
        $success = Start-CleanupVerification
        if ($success) {
            Write-Host "`n✓ Basic verification completed successfully!" -ForegroundColor Green
            Write-Host "Proceed with manual Cocos Creator validation and testing." -ForegroundColor Yellow
        }
        else {
            Write-Host "`n✗ Basic verification failed. Please review issues above." -ForegroundColor Red
        }
    }
    "2" {
        $success = Start-CleanupVerification
        if ($success) {
            $cocosSuccess = Test-CocosCreatorValidation
            $testSuccess = Test-FunctionalityTests
            
            if ($cocosSuccess -and $testSuccess) {
                Write-Host "`n✓ Full verification completed successfully!" -ForegroundColor Green
                Write-Host "Cleanup process is complete and verified." -ForegroundColor Green
            }
            else {
                Write-Host "`n⚠ Full verification completed with warnings." -ForegroundColor Yellow
                if (!$cocosSuccess) {
                    Write-Host "Cocos Creator validation failed." -ForegroundColor Red
                }
                if (!$testSuccess) {
                    Write-Host "Functionality tests failed." -ForegroundColor Red
                }
            }
        }
        else {
            Write-Host "`n✗ Full verification failed. Please fix issues before proceeding." -ForegroundColor Red
        }
    }
    "3" {
        $success = Start-CleanupVerification
        $reportPath = New-VerificationReport -Success $success -Issues $issues
        Write-Host "`nVerification report generated: $reportPath" -ForegroundColor Green
    }
    default {
        Write-Host "Invalid choice. Running basic verification..." -ForegroundColor Yellow
        Start-CleanupVerification
    }
}

Write-Host "`nVerification complete!" -ForegroundColor Cyan 