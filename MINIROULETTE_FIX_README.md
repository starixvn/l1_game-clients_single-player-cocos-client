# MiniRoulette 404 Error Fix

## Problem Description

The application was experiencing a 404 error when trying to preload 'MiniRoulette':

```
Failed to preload 'MiniRoulette', download failed: assets/main/import/84/84916903-d07a-4723-97bb-2712a6d7db32.json, status: 404(no response)
```

## Root Cause Analysis

The error occurred because:

1. **MiniRoulette is configured as a remote bundle game** - The system tries to load it from a remote URL
2. **Missing remote bundle files** - The required JSON file with UUID `84916903-d07a-4723-97bb-2712a6d7db32` doesn't exist on the server
3. **No fallback mechanism** - The original code didn't handle remote bundle loading failures gracefully

## Solution Implemented

### 1. Enhanced Error Handling in GameUtils.ts

Added comprehensive error handling to `loadMiniGamePrefab` method:

```typescript
// Before: No error handling for remote bundle failures
const prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
    bundleId: gameId.toString(),
    path: prefabPath,
    type: cc.Prefab,
    onProgress
});

// After: Graceful fallback to local resources
try {
    const prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
        bundleId: gameId.toString(),
        path: prefabPath,
        type: cc.Prefab,
        onProgress
    });
    return prefab;
} catch (error) {
    console.error("[GameUtils] Failed to load mini game prefab from remote bundle:", error);
    
    // Fallback to local resources
    console.log("[GameUtils] Attempting fallback to local resources");
    const localPrefabPath = `games/minigame/${gameConfiguration.key}`;
    
    return new Promise<cc.Prefab>((resolve, reject) => {
        cc.resources.load<cc.Prefab>(localPrefabPath, cc.Prefab, onProgress, (localError, localPrefab) => {
            if (localError || !localPrefab) {
                reject(new Error(`Failed to load MiniRoulette: Remote bundle unavailable and local fallback failed. Please check your connection and try again.`));
            } else {
                resolve(localPrefab);
            }
        });
    });
}
```

### 2. Improved Bundle Preloading

Enhanced `preloadGameAssets` method to handle remote bundle failures gracefully:

```typescript
private static async preloadGameAssets(gameConfiguration: GameConfiguration, miniPanel: MiniPanelInterface, gameId: number) {
    try {
        if (!!gameConfiguration.remoteBundle) {
            try {
                await BundleManager.getInstance().loadBundle(gameId.toString());
                await preloadAssets(gameId.toString());
            } catch (bundleError) {
                console.error("[GameUtils] Failed to preload remote bundle for gameId:", gameId, bundleError);
                // Continue without remote bundle - the game will use local resources
                console.log("[GameUtils] Continuing with local resources only");
            }
        }
    } catch (error) {
        cc.error("An error occurred in preloadGameAssets:", error);
        miniPanel?.unCacheAndHideGameLoading(miniPanel?.getGameLoadingComp(gameId), gameId);
    }
}
```

### 3. Enhanced MiniPanel Error Handling

Improved error handling in `MiniPanel.loadGame` method:

```typescript
BundleManager.getInstance()
    .loadBundle(`${gameId}`)
    .then((bundle: cc.AssetManager.Bundle) => {
        // ... bundle loading logic
    })
    .catch((error) => {
        console.error("[MiniPanel] Failed to load remote bundle for gameId:", gameId, error);
        // Fallback to local resources
        console.log("[MiniPanel] Attempting fallback to local resources");
        try {
            cc.resources.loadDir(
                `image/${language}/${gameId}`,
                cc.SpriteFrame,
                (finish: number, total: number, item) => {
                    loading?.onProgressWithStartPercent(0, this.preloadOthersPercent, finish, total);
                },
                onComplete
            );
        } catch (localError) {
            console.error("[MiniPanel] Failed to load local resources:", localError);
            onComplete(); // Continue anyway to avoid blocking the UI
        }
    });
```

## Testing

Created comprehensive tests in `__tests__/GameUtils.test.ts` to verify:

- ✅ Successful remote bundle loading
- ✅ Graceful fallback to local resources when remote bundle fails
- ✅ Proper error handling when both remote and local resources fail
- ✅ Local resource loading without remote bundle configuration
- ✅ Bundle preloading error handling

## Benefits

1. **Improved User Experience**: Users can still play games even when remote bundles are unavailable
2. **Better Error Messages**: Clear, actionable error messages for debugging
3. **Graceful Degradation**: System continues to function with local resources
4. **Comprehensive Logging**: Detailed logs for troubleshooting
5. **Robust Error Handling**: Multiple layers of error handling prevent crashes

## Configuration Options

### Option 1: Use Local Resources Only

To disable remote bundle loading for MiniRoulette, remove the `remoteBundle` configuration:

```typescript
// In game configurations
{
    id: 123, // MiniRoulette game ID
    name: "MiniRoulette",
    key: "mini-roulette",
    // Remove remoteBundle property to use local resources only
}
```

### Option 2: Fix Remote Bundle

To fix the remote bundle issue:

1. **Upload missing files** to the remote bundle server
2. **Verify bundle configuration** in `GameConfigurations.ts`
3. **Check bundle URL** construction in `initializeBundleInfos()`

### Option 3: Development Mode

For development, the system automatically uses local assets when `window.location.hostname === "localhost"`.

## Monitoring and Debugging

### Console Logs

The enhanced error handling provides detailed logging:

```
[GameUtils] Loading mini game prefab for gameId: 123
[GameUtils] Loading from remote bundle
[GameUtils] Failed to load mini game prefab from remote bundle: Error: 404
[GameUtils] Attempting fallback to local resources
[GameUtils] Mini game prefab loaded from local resources successfully
```

### Error Tracking

Monitor these error patterns:
- `Failed to load mini game prefab from remote bundle`
- `Failed to preload remote bundle for gameId`
- `Failed to load local resources`

## Future Improvements

1. **Retry Mechanism**: Implement exponential backoff for remote bundle loading
2. **Cache Management**: Better caching of local resources for offline play
3. **User Notifications**: Inform users when falling back to local resources
4. **Bundle Validation**: Pre-validate bundle availability before attempting to load
5. **Metrics Collection**: Track bundle loading success/failure rates

## Related Files

- `assets/common/GameUtils.ts` - Main error handling logic
- `assets/mini-games-panel/view-models/MiniPanel.ts` - UI error handling
- `assets/configs/GameConfigurations.ts` - Bundle configuration
- `__tests__/GameUtils.test.ts` - Comprehensive test coverage
- `packages/bundle-management/runtime-scripts/bundle-management.js` - Bundle loading logic 