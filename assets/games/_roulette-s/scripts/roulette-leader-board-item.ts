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

            // Use binary data approach (successfully bypasses CORS)
            const remoteTexture = await this.loadAvatarAsBinaryData(avatarUrl);
            this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
            this.assignSpriteFrame(remoteTexture);
        } catch (error) {
            cc.error('Failed to load avatar:', error);
            // Fallback to default avatar
            await this.loadDefaultAvatar();
        }
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
