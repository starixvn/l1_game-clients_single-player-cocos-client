import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

export interface LeaderBoardItem {
    rank?: string;
    nickname?: string;
    totalWin: number;
    avatarUrl?: string;
}

@ccclass
export default class RouletteLeaderBoardItem extends cc.Component {
    @property(cc.Label)
    rank: cc.Label = null;

    @property(cc.Sprite)
    avatar: cc.Sprite = null;

    @property(cc.Label)
    playerName: cc.Label = null;

    @property(cc.Label)
    winAmount: cc.Label = null;

    @property(cc.Node)
    background: cc.Node = null;

    private readonly HIDDEN_NAME = '******';
    private readonly MAX_NICKNAME_LENGTH = 12;
    private readonly DEFAULT_RETRY_COUNT = 3;
    private readonly DEFAULT_AVATAR_ID = 1;
    private readonly AVATAR_CACHE = new Map<string, cc.Texture2D>();

    public setData(leaderBoardItem: LeaderBoardItem, isCurrentPlayer = false): void {
        if (!leaderBoardItem) {
            return;
        }

        this.rank.string = leaderBoardItem.rank?.toString() ?? '';
        this.playerName.string = this.getNickname(leaderBoardItem.nickname);
        this.winAmount.string = numberWithCommas(leaderBoardItem.totalWin, 2);
        this.background.active = isCurrentPlayer;

        if (leaderBoardItem.avatarUrl) {
            this.setGameAvatar(leaderBoardItem.avatarUrl).catch(error =>
                cc.error('Failed to load avatar:', error)
            );
        }
    }

    private getNickname(nickname?: string): string {
        if (!nickname?.trim()) {
            return this.HIDDEN_NAME;
        }
        return this.formatText(nickname, this.MAX_NICKNAME_LENGTH);
    }

    private formatText(text: string, maxLength: number): string {
        return text.length > maxLength ? `${text.substring(0, maxLength - 1)}...` : text;
    }

    private async setGameAvatar(avatarUrl: string): Promise<void> {
        console.log('🔄 Starting avatar loading process for:', avatarUrl);

        try {
            // Check cache first
            if (this.AVATAR_CACHE.has(avatarUrl)) {
                console.log('✅ Using cached avatar for:', avatarUrl);
                const cachedTexture = this.AVATAR_CACHE.get(avatarUrl);
                this.assignSpriteFrame(cachedTexture);
                return;
            }

            console.log('🔄 Method 1: Trying binary data approach...');
            // Try downloading as binary data first (completely bypasses CORS)
            const remoteTexture = await this.loadAvatarAsBinaryData(avatarUrl);
            console.log('✅ SUCCESS: Binary data method worked for:', avatarUrl);
            this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
            this.assignSpriteFrame(remoteTexture);
        } catch (error) {
            console.log('❌ Method 1 failed (binary data):', error.message);

            // Try hidden image element approach as second option
            try {
                console.log('🔄 Method 2: Trying hidden image element approach...');
                const remoteTexture = await this.loadAvatarWithHiddenImage(avatarUrl);
                console.log('✅ SUCCESS: Hidden image method worked for:', avatarUrl);
                this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                this.assignSpriteFrame(remoteTexture);
            } catch (hiddenError) {
                console.log('❌ Method 2 failed (hidden image):', hiddenError.message);

                // Try loading with CORS handling as third option
                try {
                    console.log('🔄 Method 3: Trying CORS handling approach...');
                    const remoteTexture = await this.loadAvatarWithCorsHandling(avatarUrl);
                    console.log('✅ SUCCESS: CORS handling method worked for:', avatarUrl);
                    this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                    this.assignSpriteFrame(remoteTexture);
                } catch (corsError) {
                    console.log('❌ Method 3 failed (CORS handling):', corsError.message);

                    // Try fetch-based approach as fourth option
                    try {
                        console.log('🔄 Method 4: Trying fetch-based approach...');
                        const remoteTexture = await this.loadAvatarWithFetch(avatarUrl);
                        console.log('✅ SUCCESS: Fetch method worked for:', avatarUrl);
                        this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                        this.assignSpriteFrame(remoteTexture);
                    } catch (fetchError) {
                        console.log('❌ Method 4 failed (fetch):', fetchError.message);

                        // Fallback to direct loading via GameUtils
                        try {
                            console.log('🔄 Method 5: Trying direct GameUtils loading...');
                            const remoteTexture = await this.loadRemoteSharedResource<cc.Texture2D>(avatarUrl);
                            console.log('✅ SUCCESS: Direct GameUtils method worked for:', avatarUrl);
                            this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                            this.assignSpriteFrame(remoteTexture);
                        } catch (directError) {
                            console.log('❌ Method 5 failed (direct GameUtils):', directError.message);

                            // Final fallback to default avatar
                            console.log('🔄 All methods failed, loading default avatar...');
                            await this.loadDefaultAvatar();
                        }
                    }
                }
            }
        }
    }

    private async loadAvatarWithHiddenImage(avatarUrl: string): Promise<cc.Texture2D> {
        console.log('🔄 [Hidden Image] Starting hidden image approach for:', avatarUrl);

        return new Promise((resolve, reject) => {
            // Create a hidden image element
            const hiddenImg = document.createElement('img');
            hiddenImg.style.position = 'absolute';
            hiddenImg.style.left = '-9999px';
            hiddenImg.style.top = '-9999px';
            hiddenImg.style.width = '1px';
            hiddenImg.style.height = '1px';
            hiddenImg.style.opacity = '0';
            hiddenImg.style.pointerEvents = 'none';
            hiddenImg.style.zIndex = '-9999';

            console.log('🔄 [Hidden Image] Created hidden image element');

            // Add to DOM temporarily
            document.body.appendChild(hiddenImg);
            console.log('🔄 [Hidden Image] Added hidden image to DOM');

            hiddenImg.onload = () => {
                console.log('✅ [Hidden Image] Hidden image loaded successfully');
                try {
                    // Create a new Image element from the hidden image's src
                    // This should work better for Cocos Creator Texture2D conversion
                    const newImg = new Image();
                    console.log('🔄 [Hidden Image] Created new Image element');

                    newImg.onload = () => {
                        console.log('✅ [Hidden Image] New image loaded successfully');
                        try {
                            // Convert to Cocos Creator Texture2D
                            const texture = new cc.Texture2D();
                            texture.initWithElement(newImg);
                            console.log('✅ [Hidden Image] Successfully converted to Texture2D');

                            // Clean up
                            document.body.removeChild(hiddenImg);
                            console.log('✅ [Hidden Image] Cleaned up hidden image element');
                            resolve(texture);
                        } catch (error) {
                            console.log('❌ [Hidden Image] Direct conversion failed, trying canvas approach:', error.message);
                            // If direct conversion fails, try canvas approach
                            try {
                                // Create a canvas to extract the image data
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                console.log('🔄 [Hidden Image] Created canvas for image processing');

                                // Set canvas size to match image
                                canvas.width = newImg.naturalWidth;
                                canvas.height = newImg.naturalHeight;
                                console.log(`🔄 [Hidden Image] Set canvas size to ${canvas.width}x${canvas.height}`);

                                // Draw the image to canvas
                                ctx.drawImage(newImg, 0, 0);
                                console.log('✅ [Hidden Image] Drew image to canvas');

                                // Try to get image data as base64
                                let dataUrl: string;
                                try {
                                    dataUrl = canvas.toDataURL('image/png');
                                    console.log('✅ [Hidden Image] Successfully got PNG data URL');
                                } catch (canvasError) {
                                    console.log('❌ [Hidden Image] PNG data URL failed, trying JPEG:', canvasError.message);
                                    // If toDataURL fails due to tainted canvas, try different format
                                    try {
                                        dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                                        console.log('✅ [Hidden Image] Successfully got JPEG data URL');
                                    } catch (jpegError) {
                                        console.log('❌ [Hidden Image] JPEG data URL also failed:', jpegError.message);
                                        // If all canvas methods fail, throw the original error
                                        document.body.removeChild(hiddenImg);
                                        reject(new Error(`Canvas is tainted, cannot extract image data: ${canvasError.message}`));
                                        return;
                                    }
                                }

                                // Create another image from the data URL
                                const finalImg = new Image();
                                console.log('🔄 [Hidden Image] Creating final image from data URL');

                                finalImg.onload = () => {
                                    console.log('✅ [Hidden Image] Final image loaded from data URL');
                                    try {
                                        // Convert to Cocos Creator Texture2D
                                        const texture = new cc.Texture2D();
                                        texture.initWithElement(finalImg);
                                        console.log('✅ [Hidden Image] Successfully converted final image to Texture2D');

                                        // Clean up
                                        document.body.removeChild(hiddenImg);
                                        resolve(texture);
                                    } catch (error) {
                                        document.body.removeChild(hiddenImg);
                                        console.log('❌ [Hidden Image] Failed to convert final image to texture:', error.message);
                                        reject(new Error(`Failed to convert image to texture: ${error.message}`));
                                    }
                                };

                                finalImg.onerror = () => {
                                    document.body.removeChild(hiddenImg);
                                    console.log('❌ [Hidden Image] Failed to load final image from data URL');
                                    reject(new Error('Failed to load image from data URL'));
                                };

                                finalImg.src = dataUrl;
                            } catch (canvasError) {
                                document.body.removeChild(hiddenImg);
                                console.log('❌ [Hidden Image] Canvas processing failed:', canvasError.message);
                                reject(new Error(`Failed to process image with canvas: ${canvasError.message}`));
                            }
                        }
                    };

                    newImg.onerror = () => {
                        document.body.removeChild(hiddenImg);
                        console.log('❌ [Hidden Image] Failed to create new image from hidden image');
                        reject(new Error('Failed to create new image from hidden image'));
                    };

                    // Use the hidden image's src for the new image
                    newImg.src = hiddenImg.src;
                } catch (error) {
                    document.body.removeChild(hiddenImg);
                    console.log('❌ [Hidden Image] Failed to process hidden image:', error.message);
                    reject(new Error(`Failed to process hidden image: ${error.message}`));
                }
            };

            hiddenImg.onerror = (event) => {
                document.body.removeChild(hiddenImg);
                const errorMessage = event instanceof ErrorEvent ? event.message : 'Unknown error';
                console.log('❌ [Hidden Image] Hidden image failed to load:', errorMessage);
                reject(new Error(`Failed to load hidden image from URL: ${avatarUrl}. Error: ${errorMessage}`));
            };

            // Add cache buster to avoid browser caching issues
            const separator = avatarUrl.includes('?') ? '&' : '?';
            const cacheBuster = `cb=${Date.now()}`;
            const finalUrl = `${avatarUrl}${separator}${cacheBuster}`;
            console.log('🔄 [Hidden Image] Loading from URL with cache buster:', finalUrl);

            hiddenImg.src = finalUrl;

            // Set a timeout to prevent hanging
            setTimeout(() => {
                if (!hiddenImg.complete) {
                    document.body.removeChild(hiddenImg);
                    console.log('❌ [Hidden Image] Loading timeout after 10 seconds');
                    reject(new Error(`Hidden image loading timeout for URL: ${avatarUrl}`));
                }
            }, 10000); // 10 second timeout
        });
    }

    private async loadAvatarAsBinaryData(avatarUrl: string): Promise<cc.Texture2D> {
        console.log('🔄 [Binary Data] Starting binary data approach for:', avatarUrl);

        return new Promise((resolve, reject) => {
            // Use XMLHttpRequest to download as binary data
            const xhr = new XMLHttpRequest();
            xhr.open('GET', avatarUrl, true);
            xhr.responseType = 'arraybuffer';
            console.log('🔄 [Binary Data] Created XMLHttpRequest with arraybuffer response type');

            xhr.onload = function () {
                console.log(`🔄 [Binary Data] XHR response received, status: ${xhr.status}`);
                if (xhr.status === 200) {
                    try {
                        console.log('🔄 [Binary Data] Converting binary data to base64...');
                        // Convert binary data to base64
                        const arrayBuffer = xhr.response;
                        const bytes = new Uint8Array(arrayBuffer);
                        let binary = '';
                        for (let i = 0; i < bytes.byteLength; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        const base64 = btoa(binary);
                        console.log(`✅ [Binary Data] Successfully converted ${bytes.byteLength} bytes to base64`);

                        // Determine image type from URL or response headers
                        let imageType = 'image/png'; // default
                        if (avatarUrl.includes('.jpg') || avatarUrl.includes('.jpeg')) {
                            imageType = 'image/jpeg';
                        } else if (avatarUrl.includes('.webp')) {
                            imageType = 'image/webp';
                        } else if (avatarUrl.includes('.gif')) {
                            imageType = 'image/gif';
                        }
                        console.log(`🔄 [Binary Data] Detected image type: ${imageType}`);

                        // Create data URL
                        const dataUrl = `data:${imageType};base64,${base64}`;
                        console.log('🔄 [Binary Data] Created data URL, loading image...');

                        // Load image from data URL
                        const img = new Image();
                        img.onload = () => {
                            console.log('✅ [Binary Data] Image loaded successfully from data URL');
                            try {
                                // Convert to Cocos Creator Texture2D
                                const texture = new cc.Texture2D();
                                texture.initWithElement(img);
                                console.log('✅ [Binary Data] Successfully converted to Texture2D');
                                resolve(texture);
                            } catch (error) {
                                console.log('❌ [Binary Data] Direct conversion failed, trying canvas approach:', error.message);
                                // If initWithElement fails, try alternative approach
                                try {
                                    // Create a canvas and draw the image
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    canvas.width = img.naturalWidth;
                                    canvas.height = img.naturalHeight;
                                    console.log(`🔄 [Binary Data] Created canvas ${canvas.width}x${canvas.height}`);

                                    ctx.drawImage(img, 0, 0);
                                    console.log('✅ [Binary Data] Drew image to canvas');

                                    // Create a new image from canvas
                                    const canvasImg = new Image();
                                    canvasImg.onload = () => {
                                        try {
                                            const texture = new cc.Texture2D();
                                            texture.initWithElement(canvasImg);
                                            console.log('✅ [Binary Data] Successfully converted canvas image to Texture2D');
                                            resolve(texture);
                                        } catch (canvasError) {
                                            console.log('❌ [Binary Data] Canvas image conversion failed:', canvasError.message);
                                            reject(new Error(`Failed to convert canvas image to texture: ${canvasError.message}`));
                                        }
                                    };
                                    canvasImg.onerror = () => {
                                        console.log('❌ [Binary Data] Failed to load image from canvas');
                                        reject(new Error('Failed to load image from canvas'));
                                    };
                                    canvasImg.src = canvas.toDataURL();
                                } catch (canvasError) {
                                    console.log('❌ [Binary Data] Canvas creation failed:', canvasError.message);
                                    reject(new Error(`Failed to create canvas from image: ${canvasError.message}`));
                                }
                            }
                        };

                        img.onerror = () => {
                            console.log('❌ [Binary Data] Failed to load image from data URL');
                            reject(new Error('Failed to load image from data URL'));
                        };

                        img.src = dataUrl;
                    } catch (error) {
                        console.log('❌ [Binary Data] Failed to process binary data:', error.message);
                        reject(new Error(`Failed to process binary data: ${error.message}`));
                    }
                } else {
                    console.log(`❌ [Binary Data] HTTP error! status: ${xhr.status}`);
                    reject(new Error(`HTTP error! status: ${xhr.status}`));
                }
            };

            xhr.onerror = function () {
                console.log('❌ [Binary Data] Network error occurred');
                reject(new Error('Network error occurred'));
            };

            xhr.ontimeout = function () {
                console.log('❌ [Binary Data] Request timeout');
                reject(new Error('Request timeout'));
            };

            // Set timeout
            xhr.timeout = 10000; // 10 seconds
            console.log('🔄 [Binary Data] Set 10 second timeout');

            // Add cache buster
            const separator = avatarUrl.includes('?') ? '&' : '?';
            const cacheBuster = `cb=${Date.now()}`;
            const finalUrl = `${avatarUrl}${separator}${cacheBuster}`;
            console.log('🔄 [Binary Data] Sending request to:', finalUrl);

            xhr.open('GET', finalUrl, true);
            xhr.send();
        });
    }

    private async loadAvatarWithCorsHandling(avatarUrl: string): Promise<cc.Texture2D> {
        console.log('🔄 [CORS Handling] Starting CORS handling approach for:', avatarUrl);

        return new Promise((resolve, reject) => {
            // Create a new Image element with CORS handling
            const img = new Image();
            img.crossOrigin = 'anonymous';
            console.log('🔄 [CORS Handling] Created Image with crossOrigin = anonymous');

            img.onload = () => {
                console.log('✅ [CORS Handling] Image loaded successfully with CORS');
                try {
                    // Convert Image to Texture2D using Cocos Creator's method
                    const texture = new cc.Texture2D();
                    texture.initWithElement(img);
                    console.log('✅ [CORS Handling] Successfully converted to Texture2D');
                    resolve(texture);
                } catch (error) {
                    console.log('❌ [CORS Handling] Failed to convert image to texture:', error.message);
                    reject(new Error(`Failed to convert image to texture: ${error.message}`));
                }
            };

            img.onerror = (event) => {
                const errorMessage = event instanceof ErrorEvent ? event.message : 'Unknown error';
                console.log('❌ [CORS Handling] Image failed to load:', errorMessage);
                reject(new Error(`Failed to load image from URL: ${avatarUrl}. Error: ${errorMessage}`));
            };

            // Add cache buster to avoid browser caching issues
            const separator = avatarUrl.includes('?') ? '&' : '?';
            const cacheBuster = `cb=${Date.now()}`;
            const finalUrl = `${avatarUrl}${separator}${cacheBuster}`;
            console.log('🔄 [CORS Handling] Loading from URL with cache buster:', finalUrl);

            img.src = finalUrl;

            // Set a timeout to prevent hanging
            setTimeout(() => {
                if (!img.complete) {
                    console.log('❌ [CORS Handling] Loading timeout after 10 seconds');
                    reject(new Error(`Image loading timeout for URL: ${avatarUrl}`));
                }
            }, 10000); // 10 second timeout
        });
    }

    private async loadAvatarWithFetch(avatarUrl: string): Promise<cc.Texture2D> {
        console.log('🔄 [Fetch] Starting fetch-based approach for:', avatarUrl);

        try {
            // Try using fetch API as an alternative approach
            console.log('🔄 [Fetch] Sending fetch request...');
            const response = await fetch(avatarUrl, {
                mode: 'cors',
                cache: 'no-cache'
            });

            console.log(`🔄 [Fetch] Fetch response received, status: ${response.status}, ok: ${response.ok}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('🔄 [Fetch] Converting response to blob...');
            const blob = await response.blob();
            console.log(`✅ [Fetch] Successfully got blob, size: ${blob.size} bytes, type: ${blob.type}`);

            const imageUrl = URL.createObjectURL(blob);
            console.log('🔄 [Fetch] Created object URL from blob:', imageUrl);

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    console.log('✅ [Fetch] Image loaded successfully from blob');
                    try {
                        const texture = new cc.Texture2D();
                        texture.initWithElement(img);
                        console.log('✅ [Fetch] Successfully converted to Texture2D');
                        URL.revokeObjectURL(imageUrl); // Clean up
                        resolve(texture);
                    } catch (error) {
                        console.log('❌ [Fetch] Failed to convert blob to texture:', error.message);
                        URL.revokeObjectURL(imageUrl); // Clean up
                        reject(new Error(`Failed to convert blob to texture: ${error.message}`));
                    }
                };

                img.onerror = () => {
                    console.log('❌ [Fetch] Failed to load image from blob');
                    URL.revokeObjectURL(imageUrl); // Clean up
                    reject(new Error('Failed to load image from blob'));
                };

                img.src = imageUrl;
            });
        } catch (error) {
            console.log('❌ [Fetch] Fetch request failed:', error.message);
            throw new Error(`Fetch failed: ${error.message}`);
        }
    }

    private async loadDefaultAvatar(): Promise<void> {
        console.log('🔄 [Default Avatar] Loading default avatar as fallback...');
        try {
            const defaultAvatar = await GameUtils.getAvatarSprite(this.DEFAULT_AVATAR_ID);
            if (defaultAvatar && this.avatar) {
                this.avatar.spriteFrame = defaultAvatar;
                console.log('✅ [Default Avatar] Successfully loaded default avatar');
            } else {
                console.log('❌ [Default Avatar] Failed to get default avatar or avatar component is null');
            }
        } catch (error) {
            console.log('❌ [Default Avatar] Failed to load default avatar:', error.message);
            cc.error('Failed to load default avatar:', error);
        }
    }

    private loadRemoteSharedResource<T>(pathResource: string): Promise<T> {
        return GameUtils.loadRemote<T>(pathResource, {
            maxRetryCount: this.DEFAULT_RETRY_COUNT
        });
    }

    private assignSpriteFrame(texture2D: cc.Texture2D): void {
        if (!this.avatar || !texture2D) {
            return;
        }
        this.avatar.spriteFrame = new cc.SpriteFrame(texture2D);
    }

    // Clean up cache when component is destroyed
    onDestroy() {
        this.AVATAR_CACHE.clear();
    }
}
