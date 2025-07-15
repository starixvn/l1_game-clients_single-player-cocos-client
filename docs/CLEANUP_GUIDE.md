# Mini Roulette Game Cleanup Guide

## Overview

This guide helps you clean up the games directory to keep only the mini roulette game (`_roulette-s`) and its dependencies, removing all other unused game code.

## Analysis Results

### Mini Roulette Game Dependencies

The mini roulette game (`_roulette-s`) depends on these core components:

1. **`_roulette-s/`** - The main mini roulette game

    - `roulette-s.ts` - Main game logic
    - `scripts/` - Game-specific components

2. **`_solo_game/`** - Base solo game functionality

    - `solo-game.ts` - Base solo game class
    - `solo-bet-model.ts` - Betting logic
    - `solo-game-data.ts` - Game data management
    - `solo-bet-handler.ts` - Bet event handling

3. **`roulette/`** - Roulette wheel components

    - `view-models/RouletteWheel.ts` - Wheel animation
    - `view-models/RouletteUtils.ts` - Utility functions
    - Other roulette-specific components

4. **Base Architecture** - Required base classes

    - `_base_new/` - New base architecture
    - `_base/` - Legacy base architecture
    - `_new/` - New game architecture

5. **Optional Base Classes** - May be used by dependencies
    - `_casino/` - Casino base
    - `_gateway_game/` - Gateway game base
    - `_slotgame_base/` - Slot game base
    - `_baccarat/` - Baccarat base
    - `_dummy_room/` - Dummy room

## Directories to KEEP

```
✅ KEEP these directories:
├── _roulette-s/          # Mini roulette game (main)
├── _solo_game/           # Solo game base (required)
├── roulette/             # Roulette wheel components (required)
├── _base_new/            # New base architecture (required)
├── _base/                # Legacy base architecture (required)
├── _new/                 # New game architecture (required)
├── _casino/              # Casino base (optional)
├── _gateway_game/        # Gateway game base (optional)
├── _slotgame_base/       # Slot game base (optional)
├── _baccarat/            # Baccarat base (optional)
└── _dummy_room/          # Dummy room (optional)
```

## Directories to REMOVE

```
❌ REMOVE these directories (unused games):
├── baccarat/             # Baccarat game
├── bau-cua-mini/         # Bau cua mini game
├── bigsmall/             # Big small game
├── bitcoin-master/       # Bitcoin master game
├── blackjack/            # Blackjack game
├── cascading-slot/       # Cascading slot game
├── dragon-tiger/         # Dragon tiger game
├── gateway-baccarat/     # Gateway baccarat game
├── hi-lo/                # Hi lo game
├── holdem-poker/         # Holdem poker game
├── keno-pro/             # Keno pro game
├── lottery/              # Lottery game
├── lucky-wheel/          # Lucky wheel game
├── mini-keno/            # Mini keno game
├── muliplay-mini-sedie/  # Multiplay mini sedie game
├── multiplay/            # Multiplay game
├── multiplay-bigsmall/   # Multiplay bigsmall game
├── multiplay-keno/       # Multiplay keno game
├── sedie/                # Sedie game
├── sicbo/                # Sicbo game
├── special-sedie/        # Special sedie game
├── texas-holdem-poker/   # Texas holdem poker game
├── three-cards/          # Three cards game
├── turbo-bigsmall/       # Turbo bigsmall game
├── turbo-oddeven/        # Turbo oddeven game
├── vip-baccarat/         # VIP baccarat game
├── vip-fish-prawn-crab/  # VIP fish prawn crab game
├── vip-sedie/            # VIP sedie game
└── vip-sedie-war/        # VIP sedie war game
```

## Cleanup Steps

### Step 1: Manual Directory Removal

Remove the unused game directories listed above. You can do this manually or use a script.

### Step 2: Clean Up Meta Files

Remove the corresponding `.meta` files for the deleted directories:

-   `baccarat.meta`
-   `bau-cua-mini.meta`
-   `bigsmall.meta`
-   `bitcoin-master.meta`
-   `blackjack.meta`
-   `cascading-slot.meta`
-   `dragon-tiger.meta`
-   `gateway-baccarat.meta`
-   `hi-lo.meta`
-   `holdem-poker.meta`
-   `keno-pro.meta`
-   `lottery.meta`
-   `lucky-wheel.meta`
-   `mini-keno.meta`
-   `muliplay-mini-sedie.meta`
-   `multiplay.meta`
-   `multiplay-bigsmall.meta`
-   `multiplay-keno.meta`
-   `sedie.meta`
-   `sicbo.meta`
-   `special-sedie.meta`
-   `texas-holdem-poker.meta`
-   `three-cards.meta`
-   `turbo-bigsmall.meta`
-   `turbo-oddeven.meta`
-   `vip-baccarat.meta`
-   `vip-fish-prawn-crab.meta`
-   `vip-sedie.meta`
-   `vip-sedie-war.meta`

### Step 3: Verify Dependencies

After cleanup, verify that the mini roulette game still works by:

1. Checking that all imports resolve correctly
2. Testing the game functionality
3. Ensuring no broken references remain

### Step 4: Update Configuration Files

Check if any configuration files reference the removed games and update them accordingly.

## Expected Results

After cleanup, your games directory should contain only:

-   The mini roulette game and its dependencies
-   Base architecture classes
-   Essential game infrastructure

This will significantly reduce the codebase size and improve maintainability by removing unused game code.

## Safety Notes

-   **Backup First**: Always backup your project before performing cleanup
-   **Test Thoroughly**: Test the mini roulette game after cleanup
-   **Incremental Approach**: Consider removing games in batches to isolate any issues
-   **Version Control**: Use version control to track changes and enable rollback if needed

## Verification Checklist

After cleanup, verify:

-   [ ] Mini roulette game loads without errors
-   [ ] All game functionality works correctly
-   [ ] No console errors related to missing files
-   [ ] Build process completes successfully
-   [ ] No broken imports or references
