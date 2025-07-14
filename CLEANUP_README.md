# Cleanup Process for Single-Player Cocos Client

## Overview

This document describes the cleanup process for removing unused games and test files from the single-player-cocos-client project while preserving the roulette game functionality and maintaining Cocos Creator project integrity.

## ⚠️ CRITICAL WARNINGS

### Metadata Files (.meta)

-   **NEVER DELETE** `.meta` files manually - they are essential for Cocos Creator
-   Always use the provided scripts that handle metadata properly
-   Keep metadata backups safe - they contain UUIDs and project references

### Dependencies

-   The roulette game depends on several base games and utilities
-   Removing essential dependencies will break the project
-   Always test after cleanup to ensure functionality

## Cleanup Scripts

### 1. `backup_metadata.ps1`

**Purpose**: Creates a complete backup of all `.meta` files
**When to run**: ALWAYS run this first before any cleanup
**Critical**: This preserves Cocos Creator project integrity

### 2. `cleanup_orphaned_tests.ps1`

**Purpose**: Removes test files that reference removed games
**Targets**:

-   `__tests__/mini-games-panel/MiniGameRoundTimer.test.ts` (references BigSmallConfigs)

### 3. `cleanup_test_files.ps1`

**Purpose**: Removes test directories for games that will be deleted
**Keeps**:

-   `roulette` - Main game tests
-   `_base` - Base game functionality tests
-   `_baccarat` - Baccarat base tests
-   `_slotgame_base` - Slot game base tests

### 4. `cleanup_games.ps1`

**Purpose**: Removes unused games while preserving roulette dependencies
**Keeps**:

-   `roulette` - Main game
-   `_roulette-s` - Roulette shared components
-   `_base` - Base game functionality
-   `_base_new` - New base functionality
-   `_solo_game` - Solo game base
-   `_new` - New game base
-   `_casino` - Casino base
-   `_gateway_game` - Gateway game base
-   `_dummy_room` - Dummy room base
-   `_slotgame_base` - Slot game base

### 5. `run_cleanup_master.ps1`

**Purpose**: Orchestrates the entire cleanup process
**Features**:

-   Runs all scripts in the correct order
-   Provides safety checks and confirmations
-   Creates comprehensive backups
-   Validates directory structure

## Recommended Execution Order

### Option 1: Use Master Script (Recommended)

```powershell
.\run_cleanup_master.ps1
```

### Option 2: Manual Execution

```powershell
# Step 1: Backup metadata (CRITICAL)
.\backup_metadata.ps1

# Step 2: Clean orphaned tests
.\cleanup_orphaned_tests.ps1

# Step 3: Clean test directories
.\cleanup_test_files.ps1

# Step 4: Clean unused games
.\cleanup_games.ps1
```

## What Gets Removed

### Games Removed (29 games)

-   vip-sedie, vip-sedie-war, vip-fish-prawn-crab, vip-baccarat
-   turbo-oddeven, turbo-bigsmall, three-cards, texas-holdem-poker
-   special-sedie, sicbo, sedie, multiplay, multiplay-keno
-   multiplay-bigsmall, muliplay-mini-sedie, mini-keno
-   lucky-wheel, lottery, keno-pro, holdem-poker, hi-lo
-   gateway-baccarat, dragon-tiger, cascading-slot, blackjack
-   bitcoin-master, bigsmall, bau-cua-mini, baccarat

### Test Directories Removed (23 directories)

-   All test directories corresponding to removed games
-   Plus additional test directories not needed for roulette

### Test Files Removed (1 file)

-   `MiniGameRoundTimer.test.ts` - References removed BigSmallConfigs

## What Gets Preserved

### Essential Games (10 games)

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

### Essential Test Directories (4 directories)

-   `roulette` - Roulette game tests
-   `_base` - Base functionality tests
-   `_baccarat` - Baccarat base tests
-   `_slotgame_base` - Slot game base tests

## Backup Strategy

### Automatic Backups

Each script creates timestamped backups:

-   `metadata_backup_YYYYMMDD_HHMMSS/` - All metadata files
-   `__tests__/orphaned_tests_backup_YYYYMMDD_HHMMSS/` - Orphaned test files
-   `__tests__/games_backup_YYYYMMDD_HHMMSS/` - Test directories
-   `assets/games_backup_YYYYMMDD_HHMMSS/` - Game directories

### Restore Process

To restore from backups:

1. Copy files from backup directories to their original locations
2. Ensure metadata files are restored to maintain Cocos Creator integrity
3. Test functionality after restoration

## Post-Cleanup Verification

### 1. Cocos Creator Validation

-   Open project in Cocos Creator
-   Check for any missing references or errors
-   Verify roulette game loads correctly

### 2. Functionality Testing

-   Test roulette game functionality
-   Verify all game features work as expected
-   Check for any console errors

### 3. Test Suite Validation

-   Run existing tests to ensure they pass
-   Verify no broken test references

## Troubleshooting

### Common Issues

#### Cocos Creator Errors

-   **Missing .meta files**: Restore from metadata backup
-   **Broken references**: Check if essential games were accidentally removed
-   **UUID conflicts**: Restore complete metadata backup

#### Test Failures

-   **Missing test dependencies**: Restore from test backup
-   **Broken imports**: Check if required games were removed

#### Game Functionality Issues

-   **Roulette not loading**: Verify all essential games are present
-   **Missing components**: Check base game dependencies

### Recovery Steps

1. Identify the issue from error messages
2. Locate the appropriate backup directory
3. Restore the missing files/directories
4. Test functionality
5. If issues persist, restore complete backup

## Safety Measures

### Built-in Safeguards

-   All scripts require user confirmation before execution
-   Comprehensive backups are created automatically
-   Directory structure validation before cleanup
-   Error handling and rollback capabilities

### Manual Safeguards

-   Always run metadata backup first
-   Test functionality after each step
-   Keep backup directories safe
-   Document any custom modifications

## File Size Impact

### Expected Reduction

-   **Games**: ~29 game directories removed
-   **Tests**: ~23 test directories removed
-   **Total**: Significant reduction in project size
-   **Preserved**: All essential functionality for roulette

### Backup Size

-   Backups will be approximately the same size as removed content
-   Plan storage accordingly
-   Consider archiving old backups after verification

## Support

If you encounter issues during the cleanup process:

1. Check this README for troubleshooting steps
2. Verify all backups are intact
3. Restore from appropriate backup if needed
4. Test functionality after any restoration

## Version History

-   **v1.0**: Initial cleanup scripts
-   **v1.1**: Added metadata backup functionality
-   **v1.2**: Enhanced error handling and safety checks
-   **v1.3**: Added master orchestration script
