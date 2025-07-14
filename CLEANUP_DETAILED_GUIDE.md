# Detailed Cleanup Guide for Single-Player Cocos Client

## Table of Contents

1. [Pre-Cleanup Preparation](#pre-cleanup-preparation)
2. [Step 1: Metadata Backup](#step-1-metadata-backup)
3. [Step 2: Orphaned Test Cleanup](#step-2-orphaned-test-cleanup)
4. [Step 3: Test Directory Cleanup](#step-3-test-directory-cleanup)
5. [Step 4: Game Cleanup](#step-4-game-cleanup)
6. [Post-Cleanup Verification](#post-cleanup-verification)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Recovery Procedures](#recovery-procedures)

---

## Pre-Cleanup Preparation

### System Requirements

-   **Operating System**: Windows 10/11
-   **PowerShell**: Version 5.1 or higher
-   **Cocos Creator**: Version 3.x (for verification)
-   **Storage**: Ensure you have enough space for backups (approximately 2-3x the size of removed content)

### Pre-Cleanup Checklist

-   [ ] Close Cocos Creator if it's open
-   [ ] Ensure you're in the correct directory (`single-player-cocos-client`)
-   [ ] Verify you have write permissions
-   [ ] Check available disk space
-   [ ] Create a system restore point (recommended)

### Directory Structure Verification

Before starting, verify you're in the correct directory:

```powershell
# Check current directory
Get-Location

# Verify required directories exist
Test-Path "assets/games"
Test-Path "__tests__/games"
Test-Path "project.json"
```

**Expected Output:**

```
Path
----
I:\DEV\0.LANGLIVE\single-player-cocos-client

True
True
True
```

---

## Step 1: Metadata Backup

### Purpose

Metadata files (.meta) contain critical information for Cocos Creator:

-   UUIDs for asset references
-   Import settings
-   Bundle configurations
-   Project structure information

**⚠️ CRITICAL**: Never delete .meta files manually!

### Execution Process

#### 1.1 Run Metadata Backup Script

```powershell
.\backup_metadata.ps1
```

#### 1.2 Expected Output

```
Creating metadata backup for Cocos Creator project...
Creating backup in: metadata_backup_20241220_143022
Found 1,847 metadata files to backup
  Backed up: assets/analytics/AnalyticsManager.meta
  Backed up: assets/analytics.meta
  Backed up: assets/Application.ts.meta
  ...
Metadata backup completed!
Backup location: metadata_backup_20241220_143022
IMPORTANT: Keep this backup safe - it contains all Cocos Creator metadata!
```

#### 1.3 Verification Steps

1. **Check backup directory exists:**

    ```powershell
    Test-Path "metadata_backup_*"
    ```

2. **Verify backup contents:**

    ```powershell
    Get-ChildItem "metadata_backup_*" -Recurse | Measure-Object | Select-Object Count
    ```

3. **Check backup integrity:**
    ```powershell
    # Compare original and backup metadata count
    $originalCount = (Get-ChildItem -Filter "*.meta" -Recurse).Count
    $backupCount = (Get-ChildItem "metadata_backup_*" -Filter "*.meta" -Recurse).Count
    Write-Host "Original: $originalCount, Backup: $backupCount"
    ```

### Troubleshooting Step 1

#### Issue: "Access Denied" Error

**Cause**: Insufficient permissions
**Solution**:

```powershell
# Run PowerShell as Administrator
Start-Process PowerShell -Verb RunAs
```

#### Issue: "Not enough disk space"

**Cause**: Insufficient storage
**Solution**:

```powershell
# Check available space
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, FreeSpace, Size
```

---

## Step 2: Orphaned Test Cleanup

### Purpose

Remove test files that reference games that will be deleted, preventing broken test references.

### Files to be Removed

-   `__tests__/mini-games-panel/MiniGameRoundTimer.test.ts` (references BigSmallConfigs)

### Execution Process

#### 2.1 Run Orphaned Test Cleanup

```powershell
.\cleanup_orphaned_tests.ps1
```

#### 2.2 Expected Output

```
Cleaning up test files that reference removed games...
Orphaned test files to be removed:
  - __tests__/mini-games-panel/MiniGameRoundTimer.test.ts

Do you want to proceed with removing these orphaned test files? (y/N): y
Creating backup in: __tests__/orphaned_tests_backup_20241220_143045
Processing orphaned test file: __tests__/mini-games-panel/MiniGameRoundTimer.test.ts
  Copied to backup: __tests__/orphaned_tests_backup_20241220_143045/MiniGameRoundTimer.test.ts
  Removed original: __tests__/mini-games-panel/MiniGameRoundTimer.test.ts

Orphaned test cleanup completed!
Removed test files have been copied to: __tests__/orphaned_tests_backup_20241220_143045
```

#### 2.3 Verification Steps

1. **Verify file was removed:**

    ```powershell
    Test-Path "__tests__/mini-games-panel/MiniGameRoundTimer.test.ts"
    # Expected: False
    ```

2. **Verify backup exists:**

    ```powershell
    Test-Path "__tests__/orphaned_tests_backup_*/MiniGameRoundTimer.test.ts"
    # Expected: True
    ```

3. **Check backup content:**
    ```powershell
    Get-Content "__tests__/orphaned_tests_backup_*/MiniGameRoundTimer.test.ts" | Select-Object -First 5
    ```

### Troubleshooting Step 2

#### Issue: "File not found"

**Cause**: File was already removed or doesn't exist
**Solution**: Continue to next step - this is not an error

#### Issue: "Permission denied"

**Cause**: File is in use or locked
**Solution**:

```powershell
# Close any IDEs or text editors that might have the file open
# Try again after a few seconds
```

---

## Step 3: Test Directory Cleanup

### Purpose

Remove test directories for games that will be deleted, keeping only essential test directories.

### Test Directories to Remove (23 directories)

-   vip-sedie-war, vip-fish-prawn-crab, vip-baccarat
-   three-cards, texas-holdem-poker, special-sedie
-   sicbo, sedie, mini-sedie, lucky-wheel, lottery
-   keno-pro, holdem-poker, hi-lo, dragon-tiger
-   chinese-blackjack, cascading-slot, blackjack
-   blockchain-baccarat, bitcoin-master, bigsmall
-   bau-cua-mini, baccarat

### Test Directories to Keep (4 directories)

-   roulette (main game tests)
-   \_base (base functionality tests)
-   \_baccarat (baccarat base tests)
-   \_slotgame_base (slot game base tests)

### Execution Process

#### 3.1 Run Test Directory Cleanup

```powershell
.\cleanup_test_files.ps1
```

#### 3.2 Expected Output

```
Cleaning up test files for removed games...
Test directories to be removed:
  - vip-sedie-war
  - vip-fish-prawn-crab
  - vip-baccarat
  ...

Test directories to be kept:
  - roulette
  - _base
  - _baccarat
  - _slotgame_base

Do you want to proceed with removing these test directories? (y/N): y
Creating backup in: __tests__/games_backup_20241220_143112
Processing test directory: vip-sedie-war
  Copied to backup: __tests__/games_backup_20241220_143112/vip-sedie-war
  Removed original: __tests__/games/vip-sedie-war
...
Test cleanup completed!
```

#### 3.3 Verification Steps

1. **Check removed directories:**

    ```powershell
    # These should return False
    Test-Path "__tests__/games/vip-sedie-war"
    Test-Path "__tests__/games/baccarat"
    Test-Path "__tests__/games/blackjack"
    ```

2. **Check preserved directories:**

    ```powershell
    # These should return True
    Test-Path "__tests__/games/roulette"
    Test-Path "__tests__/games/_base"
    Test-Path "__tests__/games/_baccarat"
    Test-Path "__tests__/games/_slotgame_base"
    ```

3. **Verify backup contents:**
    ```powershell
    Get-ChildItem "__tests__/games_backup_*" | Select-Object Name, LastWriteTime
    ```

### Troubleshooting Step 3

#### Issue: "Directory not found"

**Cause**: Directory was already removed
**Solution**: Continue - this is expected for some directories

#### Issue: "Robocopy failed"

**Cause**: File system issues or permissions
**Solution**:

```powershell
# Check disk space
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, FreeSpace

# Check file system
Get-WmiObject -Class Win32_Volume | Where-Object {$_.DriveLetter -eq "I:"} | Select-Object FileSystem
```

---

## Step 4: Game Cleanup

### Purpose

Remove unused games while preserving essential dependencies for the roulette game.

### Games to Remove (29 games)

-   vip-sedie, vip-sedie-war, vip-fish-prawn-crab, vip-baccarat
-   turbo-oddeven, turbo-bigsmall, three-cards, texas-holdem-poker
-   special-sedie, sicbo, sedie, multiplay, multiplay-keno
-   multiplay-bigsmall, muliplay-mini-sedie, mini-keno
-   lucky-wheel, lottery, keno-pro, holdem-poker, hi-lo
-   gateway-baccarat, dragon-tiger, cascading-slot, blackjack
-   bitcoin-master, bigsmall, bau-cua-mini, baccarat

### Games to Keep (10 games)

-   roulette (main game)
-   \_roulette-s (roulette shared components)
-   \_base (core game base functionality)
-   \_base_new (new base functionality)
-   \_solo_game (solo game base)
-   \_new (new game base)
-   \_casino (casino base)
-   \_gateway_game (gateway game base)
-   \_dummy_room (dummy room base)
-   \_slotgame_base (slot game base)

### Execution Process

#### 4.1 Run Game Cleanup

```powershell
.\cleanup_games.ps1
```

#### 4.2 Expected Output

```
Starting cleanup of unused games...
Games to be removed:
  - vip-sedie
  - vip-sedie-war
  - vip-fish-prawn-crab
  ...

Games to be kept:
  - _roulette-s
  - roulette
  - _base
  - _base_new
  ...

Do you want to proceed with the cleanup? (y/N): y
Creating backup in: assets/games_backup_20241220_143145
Processing: vip-sedie
  Copied to backup: assets/games_backup_20241220_143145/vip-sedie
  Removed original: assets/games/vip-sedie
...
Cleanup completed!
```

#### 4.3 Verification Steps

1. **Check removed games:**

    ```powershell
    # These should return False
    Test-Path "assets/games/vip-sedie"
    Test-Path "assets/games/baccarat"
    Test-Path "assets/games/blackjack"
    ```

2. **Check preserved games:**

    ```powershell
    # These should return True
    Test-Path "assets/games/roulette"
    Test-Path "assets/games/_base"
    Test-Path "assets/games/_base_new"
    Test-Path "assets/games/_solo_game"
    ```

3. **Verify metadata preservation:**

    ```powershell
    # Check that .meta files are preserved for kept games
    Test-Path "assets/games/roulette.meta"
    Test-Path "assets/games/_base.meta"
    ```

4. **Count remaining games:**
    ```powershell
    (Get-ChildItem "assets/games" -Directory).Count
    # Expected: 10 games remaining
    ```

### Troubleshooting Step 4

#### Issue: "Game not found"

**Cause**: Game was already removed or doesn't exist
**Solution**: Continue - this is expected for some games

#### Issue: "Cannot remove directory"

**Cause**: Files are in use or locked
**Solution**:

```powershell
# Close any applications that might be using the files
# Wait a few seconds and try again
# If persistent, restart the script
```

---

## Post-Cleanup Verification

### 5.1 Directory Structure Verification

```powershell
# Check remaining games
Write-Host "Remaining games:" -ForegroundColor Green
Get-ChildItem "assets/games" -Directory | Select-Object Name

# Check remaining test directories
Write-Host "`nRemaining test directories:" -ForegroundColor Green
Get-ChildItem "__tests__/games" -Directory | Select-Object Name

# Check backup directories
Write-Host "`nBackup directories created:" -ForegroundColor Yellow
Get-ChildItem -Directory -Name "*backup*"
```

### 5.2 Cocos Creator Validation

#### 5.2.1 Open Project in Cocos Creator

1. Launch Cocos Creator
2. Open the project: `single-player-cocos-client`
3. Wait for project to load completely

#### 5.2.2 Check for Errors

-   Look for red error indicators in the console
-   Check for missing asset warnings
-   Verify no broken references

#### 5.2.3 Test Roulette Game

1. Navigate to `assets/games/roulette`
2. Open the main roulette scene
3. Verify all components load correctly
4. Check that no missing dependencies are reported

### 5.3 Functionality Testing

#### 5.3.1 Run Tests

```powershell
# Run the test suite
npm test
# or
yarn test
```

#### 5.3.2 Check for Test Failures

-   Look for tests that fail due to missing dependencies
-   Verify that roulette-related tests pass
-   Check that no broken imports exist

#### 5.3.3 Manual Testing

1. Start the roulette game
2. Test basic functionality (betting, spinning, results)
3. Verify audio and visual effects work
4. Check that all UI elements are present

### 5.4 Performance Verification

```powershell
# Check project size reduction
$beforeSize = "Check your backup for original size"
$afterSize = (Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Project size after cleanup: $([math]::Round($afterSize, 2)) MB"
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Cocos Creator Shows Missing Assets

**Symptoms**: Red error indicators, missing asset warnings
**Causes**:

-   Essential games were accidentally removed
-   Metadata files were corrupted
-   Dependencies were not properly identified

**Solutions**:

1. **Check essential games are present:**

    ```powershell
    $essentialGames = @("roulette", "_base", "_base_new", "_solo_game", "_new", "_casino", "_gateway_game", "_dummy_room", "_slotgame_base")
    foreach ($game in $essentialGames) {
        if (!(Test-Path "assets/games/$game")) {
            Write-Host "Missing essential game: $game" -ForegroundColor Red
        }
    }
    ```

2. **Restore from backup:**
    ```powershell
    # Restore specific game
    Copy-Item "assets/games_backup_*/missing_game" "assets/games/" -Recurse
    Copy-Item "assets/games_backup_*/missing_game.meta" "assets/games/"
    ```

#### Issue 2: Tests Fail After Cleanup

**Symptoms**: Test suite fails with import errors
**Causes**:

-   Test dependencies were removed
-   Import paths are broken
-   Test files reference removed games

**Solutions**:

1. **Check test failures:**

    ```powershell
    npm test 2>&1 | Select-String "Error|Failed"
    ```

2. **Restore test dependencies:**
    ```powershell
    # Restore specific test directory
    Copy-Item "__tests__/games_backup_*/missing_test" "__tests__/games/" -Recurse
    ```

#### Issue 3: Roulette Game Doesn't Load

**Symptoms**: Game fails to start, console errors
**Causes**:

-   Missing base dependencies
-   Broken component references
-   Missing shared utilities

**Solutions**:

1. **Verify all dependencies:**

    ```powershell
    # Check all essential games and their metadata
    $essentialGames | ForEach-Object {
        $gamePath = "assets/games/$_"
        $metaPath = "assets/games/$_.meta"
        Write-Host "$_: Game=$(Test-Path $gamePath), Meta=$(Test-Path $metaPath)"
    }
    ```

2. **Restore complete backup:**
    ```powershell
    # If multiple issues, restore from game backup
    Copy-Item "assets/games_backup_*/*" "assets/games/" -Recurse
    ```

#### Issue 4: Metadata Corruption

**Symptoms**: Cocos Creator shows UUID conflicts, broken references
**Causes**:

-   .meta files were modified or deleted
-   UUID conflicts between assets
-   Project structure corruption

**Solutions**:

1. **Restore metadata backup:**

    ```powershell
    # Restore all metadata files
    Copy-Item "metadata_backup_*/*" "." -Recurse
    ```

2. **Regenerate metadata (if necessary):**
    ```powershell
    # In Cocos Creator: Assets > Refresh
    # This will regenerate missing metadata
    ```

### Performance Issues

#### Issue: Slow Project Loading

**Causes**:

-   Large number of remaining assets
-   Complex dependency tree
-   Inefficient asset organization

**Solutions**:

1. **Check asset count:**

    ```powershell
    (Get-ChildItem -Recurse -File).Count
    ```

2. **Optimize remaining assets:**
    - Remove unused textures
    - Compress audio files
    - Optimize scripts

---

## Recovery Procedures

### Complete Project Restoration

#### Option 1: Restore from Backups

```powershell
# Restore all removed content
Write-Host "Restoring from backups..." -ForegroundColor Yellow

# Restore games
if (Test-Path "assets/games_backup_*") {
    Copy-Item "assets/games_backup_*/*" "assets/games/" -Recurse -Force
    Write-Host "Games restored" -ForegroundColor Green
}

# Restore test directories
if (Test-Path "__tests__/games_backup_*") {
    Copy-Item "__tests__/games_backup_*/*" "__tests__/games/" -Recurse -Force
    Write-Host "Test directories restored" -ForegroundColor Green
}

# Restore orphaned tests
if (Test-Path "__tests__/orphaned_tests_backup_*") {
    Copy-Item "__tests__/orphaned_tests_backup_*/*" "__tests__/mini-games-panel/" -Force
    Write-Host "Orphaned tests restored" -ForegroundColor Green
}

# Restore metadata (if corrupted)
if (Test-Path "metadata_backup_*") {
    Copy-Item "metadata_backup_*/*" "." -Recurse -Force
    Write-Host "Metadata restored" -ForegroundColor Green
}

Write-Host "Complete restoration finished!" -ForegroundColor Green
```

#### Option 2: Git Restoration

```powershell
# If using Git, restore from last commit
git reset --hard HEAD
git clean -fd
```

### Selective Restoration

#### Restore Specific Game

```powershell
# Restore a specific game
$gameName = "baccarat"
$backupPath = Get-ChildItem "assets/games_backup_*" | Select-Object -First 1
Copy-Item "$backupPath/$gameName" "assets/games/" -Recurse
Copy-Item "$backupPath/$gameName.meta" "assets/games/"
```

#### Restore Specific Test Directory

```powershell
# Restore a specific test directory
$testName = "baccarat"
$backupPath = Get-ChildItem "__tests__/games_backup_*" | Select-Object -First 1
Copy-Item "$backupPath/$testName" "__tests__/games/" -Recurse
```

### Verification After Restoration

```powershell
# Verify restoration
Write-Host "Verifying restoration..." -ForegroundColor Yellow

# Check games
$gameCount = (Get-ChildItem "assets/games" -Directory).Count
Write-Host "Games restored: $gameCount" -ForegroundColor Green

# Check tests
$testCount = (Get-ChildItem "__tests__/games" -Directory).Count
Write-Host "Test directories restored: $testCount" -ForegroundColor Green

# Check metadata
$metaCount = (Get-ChildItem -Filter "*.meta" -Recurse).Count
Write-Host "Metadata files: $metaCount" -ForegroundColor Green
```

---

## Maintenance and Monitoring

### Regular Health Checks

```powershell
# Weekly verification script
Write-Host "Running weekly health check..." -ForegroundColor Yellow

# Check essential games
$essentialGames = @("roulette", "_base", "_base_new", "_solo_game", "_new", "_casino", "_gateway_game", "_dummy_room", "_slotgame_base")
$missingGames = @()
foreach ($game in $essentialGames) {
    if (!(Test-Path "assets/games/$game")) {
        $missingGames += $game
    }
}

if ($missingGames.Count -gt 0) {
    Write-Host "Missing essential games: $($missingGames -join ', ')" -ForegroundColor Red
} else {
    Write-Host "All essential games present" -ForegroundColor Green
}

# Check metadata integrity
$gamesWithoutMeta = @()
Get-ChildItem "assets/games" -Directory | ForEach-Object {
    if (!(Test-Path "$($_.FullName).meta")) {
        $gamesWithoutMeta += $_.Name
    }
}

if ($gamesWithoutMeta.Count -gt 0) {
    Write-Host "Games without metadata: $($gamesWithoutMeta -join ', ')" -ForegroundColor Red
} else {
    Write-Host "All games have metadata" -ForegroundColor Green
}
```

### Backup Management

```powershell
# Clean up old backups (older than 30 days)
$cutoffDate = (Get-Date).AddDays(-30)
Get-ChildItem -Directory -Name "*backup*" | ForEach-Object {
    $backupDate = [DateTime]::ParseExact($_.Split('_')[-2..-1] -join '_', "yyyyMMdd_HHmmss", $null)
    if ($backupDate -lt $cutoffDate) {
        Write-Host "Removing old backup: $_" -ForegroundColor Yellow
        Remove-Item $_ -Recurse -Force
    }
}
```

---

## Conclusion

This detailed guide provides comprehensive instructions for safely cleaning up the single-player-cocos-client project. The process is designed to be:

-   **Safe**: Multiple backup layers and verification steps
-   **Reversible**: Complete restoration procedures provided
-   **Thorough**: Covers all aspects from preparation to verification
-   **Maintainable**: Includes ongoing monitoring and maintenance

Remember to always:

1. Test thoroughly after each step
2. Keep backups safe and accessible
3. Monitor for issues after cleanup
4. Document any custom modifications

For additional support or questions, refer to the troubleshooting section or create a backup before making any manual changes.
