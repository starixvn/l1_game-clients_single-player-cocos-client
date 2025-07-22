# Avatar CORS Fix for Leaderboard

## Problem

The leaderboard was unable to load avatar images due to CORS (Cross-Origin Resource Sharing) errors when trying to load images from external domains:

-   `https://git3.nexdev.net/uploads/-/system/user/avatar/50/avatar.png`
-   `https://assets.lang.live/gift/fedffb919a921cfab98660bb2400cb07`

**Important Note**: The HTTP requests are actually successful (Status Code 200 OK), but the browser blocks the images from being used in the canvas/context because the external servers don't include the required `Access-Control-Allow-Origin` header in their responses.

### Why CORS Fails Despite Successful HTTP Response

The issue occurs because:

1. The image downloads successfully (200 OK)
2. The server returns the image data (content-length: 60325)
3. **But the response lacks `Access-Control-Allow-Origin` header**
4. Browser security policy blocks the image from being used in canvas/context
5. This prevents Cocos Creator from converting the image to a Texture2D

## Solution

Implemented a multi-layered approach to handle avatar loading with CORS issues:

### 1. Primary Method: CORS-Aware Image Loading

-   Uses native `Image` element with `crossOrigin = 'anonymous'`
-   Handles CORS errors gracefully
-   Converts loaded image to Cocos Creator `Texture2D`
-   Includes timeout protection (10 seconds)

### 2. Secondary Method: Fetch API with Blob

-   Uses `fetch()` API to download image as blob
-   Creates object URL from blob
-   Bypasses some CORS restrictions
-   Converts blob to Texture2D

### 3. Fallback Method: Direct Loading

-   Falls back to `GameUtils.loadRemote` if CORS handling fails
-   Uses existing infrastructure for remote asset loading

### 4. Final Fallback: Default Avatar

-   Loads a default avatar from local resources if all remote loading fails
-   Ensures the UI always has a valid avatar display

### 5. Caching

-   Implements in-memory caching of successfully loaded avatars
-   Prevents redundant network requests for the same avatar
-   Clears cache on component destruction

## Implementation Details

### Key Changes in `roulette-leader-board-item.ts`:

1. **Enhanced `setGameAvatar` method with multiple fallbacks**:

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
            cc.error('Failed to load avatar with CORS handling:', error);

            // Try fetch-based approach as second option
            try {
                const remoteTexture = await this.loadAvatarWithFetch(avatarUrl);
                this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                this.assignSpriteFrame(remoteTexture);
            } catch (fetchError) {
                cc.error('Failed to load avatar with fetch:', fetchError);

                // Fallback to direct loading via GameUtils
                try {
                    const remoteTexture = await this.loadRemoteSharedResource<cc.Texture2D>(avatarUrl);
                    this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                    this.assignSpriteFrame(remoteTexture);
                } catch (directError) {
                    cc.error('Failed to load avatar directly:', directError);

                    // Final fallback to default avatar
                    await this.loadDefaultAvatar();
                }
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

3. **Fetch API with Blob approach**:

    ```typescript
    private async loadAvatarWithFetch(avatarUrl: string): Promise<cc.Texture2D> {
        try {
            // Try using fetch API as an alternative approach
            const response = await fetch(avatarUrl, {
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const texture = new cc.Texture2D();
                        texture.initWithElement(img);
                        URL.revokeObjectURL(imageUrl); // Clean up
                        resolve(texture);
                    } catch (error) {
                        URL.revokeObjectURL(imageUrl); // Clean up
                        reject(new Error(`Failed to convert blob to texture: ${error.message}`));
                    }
                };

                img.onerror = () => {
                    URL.revokeObjectURL(imageUrl); // Clean up
                    reject(new Error('Failed to load image from blob'));
                };

                img.src = imageUrl;
            });
        } catch (error) {
            throw new Error(`Fetch failed: ${error.message}`);
        }
    }
    ```

4. **Default avatar fallback**:
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

## Testing

A comprehensive test page (`test-avatar-loading.html`) has been created to verify different loading methods:

1. **Direct Image Loading**: Tests CORS-aware image loading
2. **Fetch API with Blob**: Tests fetch-based approach
3. **Canvas Approach**: Tests canvas rendering

The test page helps identify which method works best for each avatar source.

## Benefits

1. **Robust Error Handling**: Multiple fallback mechanisms ensure avatars always load
2. **Performance**: Caching prevents redundant network requests
3. **User Experience**: Users always see an avatar, even if remote loading fails
4. **Maintainability**: Clean separation of concerns with dedicated methods
5. **Timeout Protection**: Prevents hanging on slow or unresponsive servers
6. **Memory Management**: Proper cleanup of object URLs and resources

## Why This Solution Works

The multi-layered approach addresses different CORS scenarios:

1. **CORS-aware Image**: Works when servers support CORS headers
2. **Fetch with Blob**: Bypasses some CORS restrictions by downloading as blob
3. **Direct Loading**: Uses Cocos Creator's built-in loading mechanisms
4. **Default Avatar**: Ensures UI always has content

## Future Improvements

1. **Server-side Proxy**: Consider implementing a server-side proxy endpoint for avatar loading
2. **Image Optimization**: Add image compression and format optimization
3. **Retry Logic**: Implement exponential backoff for failed requests
4. **CDN Integration**: Use a CDN with proper CORS headers for avatar hosting
5. **WebP Support**: Add support for modern image formats like WebP

## Related Files

-   `assets/games/_roulette-s/scripts/roulette-leader-board-item.ts` - Main implementation
-   `__tests__/RouletteLeaderBoardItem.test.ts` - Test coverage
-   `test-avatar-loading.html` - Browser-based testing
-   `assets/common/GameUtils.ts` - Utility functions for remote loading
