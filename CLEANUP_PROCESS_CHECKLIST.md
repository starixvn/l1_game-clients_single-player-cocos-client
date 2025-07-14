# Cleanup Process Checklist

## Pre-Cleanup Preparation

### System Requirements Check

-   [ ] Windows 10/11 operating system
-   [ ] PowerShell 5.1 or higher installed
-   [ ] Cocos Creator 3.x available for verification
-   [ ] Sufficient disk space (2-3x removed content size)
-   [ ] Write permissions in project directory

### Environment Setup

-   [ ] Close Cocos Creator if open
-   [ ] Navigate to `single-player-cocos-client` directory
-   [ ] Verify correct directory structure
-   [ ] Create system restore point (recommended)
-   [ ] Ensure no files are locked by other applications

### Directory Verification

-   [ ] `assets/games/` directory exists
-   [ ] `__tests__/games/` directory exists
-   [ ] `project.json` file exists
-   [ ] Current directory is project root

---

## Step 1: Metadata Backup (CRITICAL)

### Execution

-   [ ] Run: `.\backup_metadata.ps1`
-   [ ] Confirm execution when prompted
-   [ ] Wait for backup completion

### Verification

-   [ ] Backup directory created with timestamp
-   [ ] All .meta files backed up successfully
-   [ ] No error messages in output
-   [ ] Backup directory contains expected number of files

### Expected Output Check

-   [ ] "Creating metadata backup for Cocos Creator project..."
-   [ ] "Found X metadata files to backup"
-   [ ] "Metadata backup completed!"
-   [ ] "Backup location: metadata_backup_YYYYMMDD_HHMMSS"

### Troubleshooting

-   [ ] If "Access Denied": Run PowerShell as Administrator
-   [ ] If "Not enough disk space": Free up space or change backup location
-   [ ] If backup fails: Check file permissions and try again

---

## Step 2: Orphaned Test Cleanup

### Execution

-   [ ] Run: `.\cleanup_orphaned_tests.ps1`
-   [ ] Review files to be removed
-   [ ] Confirm with 'y' when prompted
-   [ ] Wait for cleanup completion

### Files to be Removed

-   [ ] `__tests__/mini-games-panel/MiniGameRoundTimer.test.ts`

### Verification

-   [ ] Original file no longer exists
-   [ ] Backup created in `__tests__/orphaned_tests_backup_*`
-   [ ] Backup file contains original content
-   [ ] No error messages in output

### Expected Output Check

-   [ ] "Cleaning up test files that reference removed games..."
-   [ ] "Orphaned test files to be removed:"
-   [ ] "Creating backup in: **tests**/orphaned*tests_backup*\*"
-   [ ] "Orphaned test cleanup completed!"

### Troubleshooting

-   [ ] If "File not found": Continue to next step (not an error)
-   [ ] If "Permission denied": Close applications using the file
-   [ ] If backup fails: Check disk space and permissions

---

## Step 3: Test Directory Cleanup

### Execution

-   [ ] Run: `.\cleanup_test_files.ps1`
-   [ ] Review directories to be removed
-   [ ] Review directories to be kept
-   [ ] Confirm with 'y' when prompted
-   [ ] Wait for cleanup completion

### Directories to be Removed (23 total)

-   [ ] vip-sedie-war
-   [ ] vip-fish-prawn-crab
-   [ ] vip-baccarat
-   [ ] three-cards
-   [ ] texas-holdem-poker
-   [ ] special-sedie
-   [ ] sicbo
-   [ ] sedie
-   [ ] mini-sedie
-   [ ] lucky-wheel
-   [ ] lottery
-   [ ] keno-pro
-   [ ] holdem-poker
-   [ ] hi-lo
-   [ ] dragon-tiger
-   [ ] chinese-blackjack
-   [ ] cascading-slot
-   [ ] blackjack
-   [ ] blockchain-baccarat
-   [ ] bitcoin-master
-   [ ] bigsmall
-   [ ] bau-cua-mini
-   [ ] baccarat

### Directories to be Kept (4 total)

-   [ ] roulette
-   [ ] \_base
-   [ ] \_baccarat
-   [ ] \_slotgame_base

### Verification

-   [ ] All removed directories no longer exist
-   [ ] All kept directories still exist
-   [ ] Backup created in `__tests__/games_backup_*`
-   [ ] Backup contains all removed directories
-   [ ] No error messages in output

### Expected Output Check

-   [ ] "Cleaning up test files for removed games..."
-   [ ] "Test directories to be removed:"
-   [ ] "Test directories to be kept:"
-   [ ] "Creating backup in: **tests**/games*backup*\*"
-   [ ] "Test cleanup completed!"

### Troubleshooting

-   [ ] If "Directory not found": Continue (expected for some)
-   [ ] If "Robocopy failed": Check disk space and file system
-   [ ] If permission errors: Run as Administrator

---

## Step 4: Game Cleanup

### Execution

-   [ ] Run: `.\cleanup_games.ps1`
-   [ ] Review games to be removed
-   [ ] Review games to be kept
-   [ ] Confirm with 'y' when prompted
-   [ ] Wait for cleanup completion

### Games to be Removed (29 total)

-   [ ] vip-sedie
-   [ ] vip-sedie-war
-   [ ] vip-fish-prawn-crab
-   [ ] vip-baccarat
-   [ ] turbo-oddeven
-   [ ] turbo-bigsmall
-   [ ] three-cards
-   [ ] texas-holdem-poker
-   [ ] special-sedie
-   [ ] sicbo
-   [ ] sedie
-   [ ] multiplay
-   [ ] multiplay-keno
-   [ ] multiplay-bigsmall
-   [ ] muliplay-mini-sedie
-   [ ] mini-keno
-   [ ] lucky-wheel
-   [ ] lottery
-   [ ] keno-pro
-   [ ] holdem-poker
-   [ ] hi-lo
-   [ ] gateway-baccarat
-   [ ] dragon-tiger
-   [ ] cascading-slot
-   [ ] blackjack
-   [ ] bitcoin-master
-   [ ] bigsmall
-   [ ] bau-cua-mini
-   [ ] baccarat

### Games to be Kept (10 total)

-   [ ] \_roulette-s
-   [ ] roulette
-   [ ] \_base
-   [ ] \_base_new
-   [ ] \_solo_game
-   [ ] \_new
-   [ ] \_casino
-   [ ] \_gateway_game
-   [ ] \_dummy_room
-   [ ] \_slotgame_base

### Verification

-   [ ] All removed games no longer exist
-   [ ] All kept games still exist
-   [ ] All kept games have .meta files
-   [ ] Backup created in `assets/games_backup_*`
-   [ ] Backup contains all removed games
-   [ ] No error messages in output

### Expected Output Check

-   [ ] "Starting cleanup of unused games..."
-   [ ] "Games to be removed:"
-   [ ] "Games to be kept:"
-   [ ] "Creating backup in: assets/games*backup*\*"
-   [ ] "Cleanup completed!"

### Troubleshooting

-   [ ] If "Game not found": Continue (expected for some)
-   [ ] If "Cannot remove directory": Close applications using files
-   [ ] If metadata missing: Restore from metadata backup

---

## Post-Cleanup Verification

### Directory Structure Verification

-   [ ] Run directory verification commands
-   [ ] Confirm 10 games remain in `assets/games/`
-   [ ] Confirm 4 test directories remain in `__tests__/games/`
-   [ ] Verify all backup directories exist

### Cocos Creator Validation

-   [ ] Open project in Cocos Creator
-   [ ] Wait for project to load completely
-   [ ] Check for red error indicators
-   [ ] Look for missing asset warnings
-   [ ] Verify no broken references
-   [ ] Open roulette game scene
-   [ ] Confirm all components load correctly

### Functionality Testing

-   [ ] Run test suite: `npm test` or `yarn test`
-   [ ] Check for test failures
-   [ ] Verify roulette-related tests pass
-   [ ] Check for broken imports
-   [ ] Test roulette game manually
-   [ ] Verify betting functionality
-   [ ] Test spinning and results
-   [ ] Check audio and visual effects
-   [ ] Verify all UI elements present

### Performance Verification

-   [ ] Check project size reduction
-   [ ] Verify loading times are acceptable
-   [ ] Confirm no performance regressions

---

## Troubleshooting Checklist

### Common Issues

-   [ ] **Missing Assets**: Check essential games are present
-   [ ] **Test Failures**: Verify test dependencies
-   [ ] **Game Won't Load**: Check base dependencies
-   [ ] **Metadata Corruption**: Restore from metadata backup

### Recovery Steps

-   [ ] **Partial Restoration**: Restore specific missing components
-   [ ] **Complete Restoration**: Restore from all backups
-   [ ] **Git Restoration**: Use `git reset --hard HEAD` if using Git

### Verification After Recovery

-   [ ] Check all essential games present
-   [ ] Verify metadata integrity
-   [ ] Test functionality
-   [ ] Run test suite
-   [ ] Open in Cocos Creator

---

## Maintenance Checklist

### Weekly Health Checks

-   [ ] Verify essential games present
-   [ ] Check metadata integrity
-   [ ] Run test suite
-   [ ] Test roulette functionality
-   [ ] Monitor for issues

### Backup Management

-   [ ] Clean up old backups (older than 30 days)
-   [ ] Verify backup integrity
-   [ ] Document any custom changes
-   [ ] Update documentation if needed

### Performance Monitoring

-   [ ] Monitor project loading times
-   [ ] Check for performance regressions
-   [ ] Optimize remaining assets if needed
-   [ ] Document any performance issues

---

## Final Verification

### Project Integrity

-   [ ] All essential games present and functional
-   [ ] All metadata files intact
-   [ ] No broken references in Cocos Creator
-   [ ] Test suite passes
-   [ ] Roulette game works correctly

### Documentation

-   [ ] Update project documentation
-   [ ] Document any custom modifications
-   [ ] Note any issues encountered
-   [ ] Record backup locations
-   [ ] Update team on changes made

### Sign-off

-   [ ] **Developer**: All tests pass, functionality verified
-   [ ] **QA**: Manual testing completed
-   [ ] **Project Manager**: Changes documented and approved
-   [ ] **Backup**: All backups safely stored

---

## Emergency Contacts

### If Critical Issues Occur

1. **Immediate**: Restore from metadata backup
2. **If that fails**: Restore from game backups
3. **If still failing**: Use Git restoration
4. **Contact**: Development team lead

### Backup Locations

-   Metadata: `metadata_backup_YYYYMMDD_HHMMSS/`
-   Games: `assets/games_backup_YYYYMMDD_HHMMSS/`
-   Tests: `__tests__/games_backup_YYYYMMDD_HHMMSS/`
-   Orphaned Tests: `__tests__/orphaned_tests_backup_YYYYMMDD_HHMMSS/`

---

## Notes Section

### Custom Modifications Made

-   [ ] Document any manual changes
-   [ ] Note any deviations from standard process
-   [ ] Record any issues encountered
-   [ ] Document solutions implemented

### Lessons Learned

-   [ ] What worked well
-   [ ] What could be improved
-   [ ] Recommendations for future cleanups
-   [ ] Process improvements identified

### Follow-up Actions

-   [ ] Schedule regular health checks
-   [ ] Plan next cleanup if needed
-   [ ] Update team documentation
-   [ ] Train team on new process
