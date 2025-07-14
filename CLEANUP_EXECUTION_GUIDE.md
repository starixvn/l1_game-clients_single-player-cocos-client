# Cleanup Execution Guide

## Quick Start

### 🚀 Easiest Method: Master Script

```powershell
.\run_cleanup_master.ps1
```

This runs everything automatically with safety checks.

### 📋 Manual Method: Step-by-Step

```powershell
# Step 1: Backup metadata (CRITICAL)
.\backup_metadata.ps1

# Step 2: Clean orphaned tests
.\cleanup_orphaned_tests.ps1

# Step 3: Clean test directories
.\cleanup_test_files.ps1

# Step 4: Clean unused games
.\cleanup_games.ps1

# Step 5: Verify cleanup
.\CLEANUP_VERIFICATION_SCRIPTS.ps1
```

---

## Available Scripts

### Core Cleanup Scripts

| Script                       | Purpose                    | Critical |
| ---------------------------- | -------------------------- | -------- |
| `backup_metadata.ps1`        | Backup all .meta files     | ⚠️ YES   |
| `cleanup_orphaned_tests.ps1` | Remove orphaned test files | No       |
| `cleanup_test_files.ps1`     | Remove test directories    | No       |
| `cleanup_games.ps1`          | Remove unused games        | No       |

### Orchestration Scripts

| Script                             | Purpose                  |
| ---------------------------------- | ------------------------ |
| `run_cleanup_master.ps1`           | Runs all cleanup steps   |
| `CLEANUP_VERIFICATION_SCRIPTS.ps1` | Verifies cleanup results |

### Documentation

| File                           | Purpose                        |
| ------------------------------ | ------------------------------ |
| `CLEANUP_README.md`            | Main documentation             |
| `CLEANUP_DETAILED_GUIDE.md`    | Step-by-step guide             |
| `CLEANUP_PROCESS_CHECKLIST.md` | Checklist for manual execution |
| `CLEANUP_EXECUTION_GUIDE.md`   | This file                      |

---

## Pre-Execution Checklist

### System Requirements

-   [ ] Windows 10/11
-   [ ] PowerShell 5.1+
-   [ ] Cocos Creator 3.x (for verification)
-   [ ] Sufficient disk space (2-3x removed content)

### Environment Setup

-   [ ] Close Cocos Creator
-   [ ] Navigate to `single-player-cocos-client` directory
-   [ ] Verify directory structure
-   [ ] Create system restore point (recommended)

### Directory Verification

```powershell
# Verify you're in the correct directory
Test-Path "assets/games"
Test-Path "__tests__/games"
Test-Path "project.json"
```

---

## Execution Options

### Option 1: Full Automation (Recommended)

```powershell
.\run_cleanup_master.ps1
```

**Benefits:**

-   Handles all steps automatically
-   Built-in safety checks
-   User confirmations at each step
-   Comprehensive error handling

### Option 2: Selective Execution

Run individual scripts as needed:

```powershell
# Only backup metadata
.\backup_metadata.ps1

# Only clean specific components
.\cleanup_orphaned_tests.ps1
.\cleanup_test_files.ps1
.\cleanup_games.ps1
```

### Option 3: Manual with Checklist

Use `CLEANUP_PROCESS_CHECKLIST.md` for step-by-step manual execution.

---

## What Gets Removed

### Games (29 total)

-   vip-sedie, vip-sedie-war, vip-fish-prawn-crab, vip-baccarat
-   turbo-oddeven, turbo-bigsmall, three-cards, texas-holdem-poker
-   special-sedie, sicbo, sedie, multiplay, multiplay-keno
-   multiplay-bigsmall, muliplay-mini-sedie, mini-keno
-   lucky-wheel, lottery, keno-pro, holdem-poker, hi-lo
-   gateway-baccarat, dragon-tiger, cascading-slot, blackjack
-   bitcoin-master, bigsmall, bau-cua-mini, baccarat

### Test Directories (23 total)

-   All test directories corresponding to removed games

### Test Files (1 total)

-   `__tests__/mini-games-panel/MiniGameRoundTimer.test.ts`

---

## What Gets Preserved

### Essential Games (10 total)

-   `roulette` - Main roulette game
-   `_roulette-s` - Roulette shared components
-   `_base` - Core game base functionality
-   `_base_new` - New base functionality
-   `_solo_game` - Solo game base
-   `_new` - New game base
-   `_casino` - Casino base
-   `_gateway_game` - Gateway game base
-   `_dummy_room` - Dummy room base
-   `_slotgame_base` - Slot game base

### Essential Test Directories (4 total)

-   `roulette` - Roulette game tests
-   `_base` - Base functionality tests
-   `_baccarat` - Baccarat base tests
-   `_slotgame_base` - Slot game base tests

### All Metadata Files

-   All `.meta` files are preserved for Cocos Creator integrity

---

## Backup Strategy

### Automatic Backups

Each script creates timestamped backups:

-   `metadata_backup_YYYYMMDD_HHMMSS/` - All metadata files
-   `assets/games_backup_YYYYMMDD_HHMMSS/` - Game directories
-   `__tests__/games_backup_YYYYMMDD_HHMMSS/` - Test directories
-   `__tests__/orphaned_tests_backup_YYYYMMDD_HHMMSS/` - Orphaned test files

### Backup Verification

```powershell
# Check backup directories
Get-ChildItem -Directory -Name "*backup*"

# Verify backup contents
Get-ChildItem "metadata_backup_*" -Recurse | Measure-Object | Select-Object Count
```

---

## Post-Cleanup Verification

### Automated Verification

```powershell
.\CLEANUP_VERIFICATION_SCRIPTS.ps1
```

**Options:**

1. **Basic verification** - Checks file structure and backups
2. **Full verification** - Includes Cocos Creator and test validation
3. **Report generation** - Creates detailed verification report

### Manual Verification Steps

1. **Cocos Creator Validation**

    - Open project in Cocos Creator
    - Check for error indicators
    - Verify roulette game loads

2. **Functionality Testing**

    - Run test suite: `npm test` or `yarn test`
    - Test roulette game manually
    - Verify all features work

3. **Performance Check**
    - Monitor loading times
    - Check for performance regressions

---

## Troubleshooting

### Common Issues

#### "Access Denied" Errors

**Solution:** Run PowerShell as Administrator

#### "Not enough disk space"

**Solution:** Free up space or change backup location

#### "File not found" Warnings

**Solution:** Continue - this is expected for some files

#### Cocos Creator Errors

**Solution:** Restore from metadata backup

### Recovery Procedures

#### Complete Restoration

```powershell
# Restore all content from backups
Copy-Item "metadata_backup_*/*" "." -Recurse -Force
Copy-Item "assets/games_backup_*/*" "assets/games/" -Recurse -Force
Copy-Item "__tests__/games_backup_*/*" "__tests__/games/" -Recurse -Force
```

#### Selective Restoration

```powershell
# Restore specific game
Copy-Item "assets/games_backup_*/game_name" "assets/games/" -Recurse
Copy-Item "assets/games_backup_*/game_name.meta" "assets/games/"
```

#### Git Restoration

```powershell
# If using Git
git reset --hard HEAD
git clean -fd
```

---

## Safety Features

### Built-in Safeguards

-   **User Confirmations**: Each step requires explicit approval
-   **Comprehensive Backups**: All removed content is backed up
-   **Error Handling**: Graceful failure with rollback capabilities
-   **Directory Validation**: Checks before execution
-   **Metadata Protection**: Preserves all .meta files

### Manual Safeguards

-   **System Restore Point**: Create before starting
-   **Test After Each Step**: Verify functionality
-   **Keep Backups Safe**: Store backups securely
-   **Document Changes**: Record any custom modifications

---

## Expected Results

### File Size Reduction

-   **Games**: ~29 game directories removed
-   **Tests**: ~23 test directories removed
-   **Total**: Significant project size reduction
-   **Preserved**: All essential functionality

### Performance Improvements

-   Faster project loading
-   Reduced build times
-   Smaller bundle sizes
-   Improved development experience

### Maintained Functionality

-   Roulette game works perfectly
-   All essential dependencies preserved
-   Cocos Creator project integrity maintained
-   Test suite passes

---

## Maintenance

### Regular Health Checks

```powershell
# Weekly verification
.\CLEANUP_VERIFICATION_SCRIPTS.ps1
```

### Backup Management

```powershell
# Clean up old backups (older than 30 days)
Get-ChildItem -Directory -Name "*backup*" | ForEach-Object {
    $backupDate = [DateTime]::ParseExact($_.Split('_')[-2..-1] -join '_', "yyyyMMDD_HHMMSS", $null)
    if ($backupDate -lt (Get-Date).AddDays(-30)) {
        Remove-Item $_ -Recurse -Force
    }
}
```

### Documentation Updates

-   Update team documentation
-   Record any custom modifications
-   Document lessons learned
-   Update process improvements

---

## Support and Contacts

### Emergency Procedures

1. **Immediate**: Restore from metadata backup
2. **If that fails**: Restore from game backups
3. **If still failing**: Use Git restoration
4. **Contact**: Development team lead

### Documentation References

-   `CLEANUP_README.md` - Complete documentation
-   `CLEANUP_DETAILED_GUIDE.md` - Step-by-step guide
-   `CLEANUP_PROCESS_CHECKLIST.md` - Manual checklist
-   `CLEANUP_VERIFICATION_SCRIPTS.ps1` - Verification tools

### Backup Locations

-   Metadata: `metadata_backup_YYYYMMDD_HHMMSS/`
-   Games: `assets/games_backup_YYYYMMDD_HHMMSS/`
-   Tests: `__tests__/games_backup_YYYYMMDD_HHMMSS/`
-   Orphaned Tests: `__tests__/orphaned_tests_backup_YYYYMMDD_HHMMSS/`

---

## Success Criteria

### Technical Success

-   [ ] All essential games present and functional
-   [ ] All metadata files intact
-   [ ] No broken references in Cocos Creator
-   [ ] Test suite passes
-   [ ] Roulette game works correctly

### Process Success

-   [ ] All backups created successfully
-   [ ] No data loss
-   [ ] Project integrity maintained
-   [ ] Performance improved
-   [ ] Documentation updated

### Team Success

-   [ ] All team members informed
-   [ ] Process documented
-   [ ] Lessons learned recorded
-   [ ] Future improvements identified

---

## Conclusion

This cleanup process is designed to be:

-   **Safe**: Multiple backup layers and verification steps
-   **Reversible**: Complete restoration procedures provided
-   **Thorough**: Covers all aspects from preparation to verification
-   **Maintainable**: Includes ongoing monitoring and maintenance

The process will significantly reduce project size while maintaining all essential functionality for the roulette game. All removed content is safely backed up and can be restored if needed.

**Remember**: Always test thoroughly after cleanup and keep backups safe!
