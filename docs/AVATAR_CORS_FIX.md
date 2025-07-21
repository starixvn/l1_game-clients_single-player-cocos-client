# Avatar CORS Fix for Leaderboard

## Problem

The leaderboard was unable to load avatar images due to CORS (Cross-Origin Resource Sharing) errors when trying to load images from external domains:

-   `https://git3.nexdev.net/uploads/-/system/user/avatar/50/avatar.png`
-   `https://assets.lang.live/gift/fedffb919a921cfab98660bb2400cb07`

The browser was blocking these requests because the external servers don't include the proper CORS headers.

## Solution

Implemented a multi-layered approach to handle avatar loading with CORS issues:

### 1. Primary Method: CORS-Aware Image Loading

-   Uses native `Image` element with `crossOrigin = 'anonymous'`
-   Handles CORS errors gracefully
-   Converts loaded image to Cocos Creator `Texture2D`
-   Includes timeout protection (10 seconds)

### 2. Fallback Method: Direct Loading

-   Falls back to `GameUtils.loadRemote` if CORS handling fails
-   Uses existing infrastructure for remote asset loading

### 3. Final Fallback: Default Avatar

-   Loads a default avatar from local resources if all remote loading fails
-   Ensures the UI always has a valid avatar display

### 4. Caching

-   Implements in-memory caching of successfully loaded avatars
-   Prevents redundant network requests for the same avatar
-   Clears cache on component destruction

## Implementation Details

### Key Changes in `roulette-leader-board-item.ts`:

1. **Enhanced `setGameAvatar` method**:

    ```typescript
    private async setGameAvatar(avatarUrl: string): Promise<void> {
        try {
            // Check cache first
            if (this.AVATAR_CACHE.has(avatarUrl)) {
                const cachedTexture = this.AVATAR_CACHE.get(avatarUrl);
                this.assignSpriteFrame(cachedTexture);
                return;
            }

            // Try loading with CORS handling first
            const remoteTexture = await this.loadAvatarWithCorsHandling(avatarUrl);
            this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
            this.assignSpriteFrame(remoteTexture);
        } catch (error) {
            // Fallback to direct loading via GameUtils
            try {
                const remoteTexture = await this.loadRemoteSharedResource<cc.Texture2D>(avatarUrl);
                this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                this.assignSpriteFrame(remoteTexture);
            } catch (directError) {
                // Final fallback to default avatar
                await this.loadDefaultAvatar();
            }
        }
    }
    ```

2. **CORS-aware image loading**:

    ```typescript
    private async loadAvatarWithCorsHandling(avatarUrl: string): Promise<cc.Texture2D> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                try {
                    const texture = new cc.Texture2D();
                    texture.initWithElement(img);
                    resolve(texture);
                } catch (error) {
                    reject(new Error(`Failed to convert image to texture: ${error.message}`));
                }
            };

            img.onerror = (event) => {
                const errorMessage = event instanceof ErrorEvent ? event.message : 'Unknown error';
                reject(new Error(`Failed to load image from URL: ${avatarUrl}. Error: ${errorMessage}`));
            };

            // Add cache buster to avoid browser caching issues
            const separator = avatarUrl.includes('?') ? '&' : '?';
            const cacheBuster = `cb=${Date.now()}`;
            img.src = `${avatarUrl}${separator}${cacheBuster}`;

            // Set a timeout to prevent hanging
            setTimeout(() => {
                if (!img.complete) {
                    reject(new Error(`Image loading timeout for URL: ${avatarUrl}`));
                }
            }, 10000); // 10 second timeout
        });
    }
    ```

3. **Default avatar fallback**:
    ```typescript
    private async loadDefaultAvatar(): Promise<void> {
        try {
            const defaultAvatar = await GameUtils.getAvatarSprite(this.DEFAULT_AVATAR_ID);
            if (defaultAvatar && this.avatar) {
                this.avatar.spriteFrame = defaultAvatar;
            }
        } catch (error) {
            cc.error('Failed to load default avatar:', error);
        }
    }
    ```

## Benefits

1. **Robust Error Handling**: Multiple fallback mechanisms ensure avatars always load
2. **Performance**: Caching prevents redundant network requests
3. **User Experience**: Users always see an avatar, even if remote loading fails
4. **Maintainability**: Clean separation of concerns with dedicated methods
5. **Timeout Protection**: Prevents hanging on slow or unresponsive servers

## Testing

The solution includes comprehensive tests covering:

-   Successful avatar loading with CORS handling
-   Fallback to direct loading when CORS fails
-   Fallback to default avatar when all methods fail
-   Caching functionality
-   Timeout handling
-   Error scenarios

## Future Improvements

1. **Server-side Proxy**: Consider implementing a server-side proxy endpoint for avatar loading
2. **Image Optimization**: Add image compression and format optimization
3. **Retry Logic**: Implement exponential backoff for failed requests
4. **CDN Integration**: Use a CDN with proper CORS headers for avatar hosting

## Related Files

-   `assets/games/_roulette-s/scripts/roulette-leader-board-item.ts` - Main implementation
-   `__tests__/RouletteLeaderBoardItem.test.ts` - Test coverage
-   `assets/common/GameUtils.ts` - Utility functions for remote loading
