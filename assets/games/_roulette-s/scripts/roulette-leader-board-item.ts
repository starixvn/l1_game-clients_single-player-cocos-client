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
        try {
            // Check cache first
            if (this.AVATAR_CACHE.has(avatarUrl)) {
                const cachedTexture = this.AVATAR_CACHE.get(avatarUrl);
                this.assignSpriteFrame(cachedTexture);
                return;
            }

            // Try downloading as binary data first (completely bypasses CORS)
            const remoteTexture = await this.loadAvatarAsBinaryData(avatarUrl);
            this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
            this.assignSpriteFrame(remoteTexture);
        } catch (error) {
            cc.error('Failed to load avatar as binary data:', error);

            // Try hidden image element approach as second option
            try {
                const remoteTexture = await this.loadAvatarWithHiddenImage(avatarUrl);
                this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                this.assignSpriteFrame(remoteTexture);
            } catch (hiddenError) {
                cc.error('Failed to load avatar with hidden image:', hiddenError);

                // Try loading with CORS handling as third option
                try {
                    const remoteTexture = await this.loadAvatarWithCorsHandling(avatarUrl);
                    this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
                    this.assignSpriteFrame(remoteTexture);
                } catch (corsError) {
                    cc.error('Failed to load avatar with CORS handling:', corsError);

                    // Try fetch-based approach as fourth option
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
        }
    }

    private async loadAvatarWithHiddenImage(avatarUrl: string): Promise<cc.Texture2D> {
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

            // Add to DOM temporarily
            document.body.appendChild(hiddenImg);

            hiddenImg.onload = () => {
                try {
                    // Create a new Image element from the hidden image's src
                    // This should work better for Cocos Creator Texture2D conversion
                    const newImg = new Image();
                    newImg.onload = () => {
                        try {
                            // Convert to Cocos Creator Texture2D
                            const texture = new cc.Texture2D();
                            texture.initWithElement(newImg);

                            // Clean up
                            document.body.removeChild(hiddenImg);
                            resolve(texture);
                        } catch (error) {
                            // If direct conversion fails, try canvas approach
                            try {
                                // Create a canvas to extract the image data
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');

                                // Set canvas size to match image
                                canvas.width = newImg.naturalWidth;
                                canvas.height = newImg.naturalHeight;

                                // Draw the image to canvas
                                ctx.drawImage(newImg, 0, 0);

                                // Try to get image data as base64
                                let dataUrl: string;
                                try {
                                    dataUrl = canvas.toDataURL('image/png');
                                } catch (canvasError) {
                                    // If toDataURL fails due to tainted canvas, try different format
                                    try {
                                        dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                                    } catch (jpegError) {
                                        // If all canvas methods fail, throw the original error
                                        document.body.removeChild(hiddenImg);
                                        reject(new Error(`Canvas is tainted, cannot extract image data: ${canvasError.message}`));
                                        return;
                                    }
                                }

                                // Create another image from the data URL
                                const finalImg = new Image();
                                finalImg.onload = () => {
                                    try {
                                        // Convert to Cocos Creator Texture2D
                                        const texture = new cc.Texture2D();
                                        texture.initWithElement(finalImg);

                                        // Clean up
                                        document.body.removeChild(hiddenImg);
                                        resolve(texture);
                                    } catch (error) {
                                        document.body.removeChild(hiddenImg);
                                        reject(new Error(`Failed to convert image to texture: ${error.message}`));
                                    }
                                };

                                finalImg.onerror = () => {
                                    document.body.removeChild(hiddenImg);
                                    reject(new Error('Failed to load image from data URL'));
                                };

                                finalImg.src = dataUrl;
                            } catch (canvasError) {
                                document.body.removeChild(hiddenImg);
                                reject(new Error(`Failed to process image with canvas: ${canvasError.message}`));
                            }
                        }
                    };

                    newImg.onerror = () => {
                        document.body.removeChild(hiddenImg);
                        reject(new Error('Failed to create new image from hidden image'));
                    };

                    // Use the hidden image's src for the new image
                    newImg.src = hiddenImg.src;
                } catch (error) {
                    document.body.removeChild(hiddenImg);
                    reject(new Error(`Failed to process hidden image: ${error.message}`));
                }
            };

            hiddenImg.onerror = (event) => {
                document.body.removeChild(hiddenImg);
                const errorMessage = event instanceof ErrorEvent ? event.message : 'Unknown error';
                reject(new Error(`Failed to load hidden image from URL: ${avatarUrl}. Error: ${errorMessage}`));
            };

            // Add cache buster to avoid browser caching issues
            const separator = avatarUrl.includes('?') ? '&' : '?';
            const cacheBuster = `cb=${Date.now()}`;
            hiddenImg.src = `${avatarUrl}${separator}${cacheBuster}`;

            // Set a timeout to prevent hanging
            setTimeout(() => {
                if (!hiddenImg.complete) {
                    document.body.removeChild(hiddenImg);
                    reject(new Error(`Hidden image loading timeout for URL: ${avatarUrl}`));
                }
            }, 10000); // 10 second timeout
        });
    }

    private async loadAvatarAsBinaryData(avatarUrl: string): Promise<cc.Texture2D> {
        return new Promise((resolve, reject) => {
            // Use XMLHttpRequest to download as binary data
            const xhr = new XMLHttpRequest();
            xhr.open('GET', avatarUrl, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function () {
                if (xhr.status === 200) {
                    try {
                        // Convert binary data to base64
                        const arrayBuffer = xhr.response;
                        const bytes = new Uint8Array(arrayBuffer);
                        let binary = '';
                        for (let i = 0; i < bytes.byteLength; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        const base64 = btoa(binary);

                        // Determine image type from URL or response headers
                        let imageType = 'image/png'; // default
                        if (avatarUrl.includes('.jpg') || avatarUrl.includes('.jpeg')) {
                            imageType = 'image/jpeg';
                        } else if (avatarUrl.includes('.webp')) {
                            imageType = 'image/webp';
                        } else if (avatarUrl.includes('.gif')) {
                            imageType = 'image/gif';
                        }

                        // Create data URL
                        const dataUrl = `data:${imageType};base64,${base64}`;

                        // Load image from data URL
                        const img = new Image();
                        img.onload = () => {
                            try {
                                // Convert to Cocos Creator Texture2D
                                const texture = new cc.Texture2D();
                                texture.initWithElement(img);
                                resolve(texture);
                            } catch (error) {
                                // If initWithElement fails, try alternative approach
                                try {
                                    // Create a canvas and draw the image
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    canvas.width = img.naturalWidth;
                                    canvas.height = img.naturalHeight;
                                    ctx.drawImage(img, 0, 0);

                                    // Create a new image from canvas
                                    const canvasImg = new Image();
                                    canvasImg.onload = () => {
                                        try {
                                            const texture = new cc.Texture2D();
                                            texture.initWithElement(canvasImg);
                                            resolve(texture);
                                        } catch (canvasError) {
                                            reject(new Error(`Failed to convert canvas image to texture: ${canvasError.message}`));
                                        }
                                    };
                                    canvasImg.onerror = () => {
                                        reject(new Error('Failed to load image from canvas'));
                                    };
                                    canvasImg.src = canvas.toDataURL();
                                } catch (canvasError) {
                                    reject(new Error(`Failed to create canvas from image: ${canvasError.message}`));
                                }
                            }
                        };

                        img.onerror = () => {
                            reject(new Error('Failed to load image from data URL'));
                        };

                        img.src = dataUrl;
                    } catch (error) {
                        reject(new Error(`Failed to process binary data: ${error.message}`));
                    }
                } else {
                    reject(new Error(`HTTP error! status: ${xhr.status}`));
                }
            };

            xhr.onerror = function () {
                reject(new Error('Network error occurred'));
            };

            xhr.ontimeout = function () {
                reject(new Error('Request timeout'));
            };

            // Set timeout
            xhr.timeout = 10000; // 10 seconds

            // Add cache buster
            const separator = avatarUrl.includes('?') ? '&' : '?';
            const cacheBuster = `cb=${Date.now()}`;
            const finalUrl = `${avatarUrl}${separator}${cacheBuster}`;

            xhr.open('GET', finalUrl, true);
            xhr.send();
        });
    }

    private async loadAvatarWithCorsHandling(avatarUrl: string): Promise<cc.Texture2D> {
        return new Promise((resolve, reject) => {
            // Create a new Image element with CORS handling
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                try {
                    // Convert Image to Texture2D using Cocos Creator's method
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
