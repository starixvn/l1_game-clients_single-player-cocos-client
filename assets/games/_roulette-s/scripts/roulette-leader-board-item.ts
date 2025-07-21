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

            // Try loading with CORS handling first
            const remoteTexture = await this.loadAvatarWithCorsHandling(avatarUrl);
            this.AVATAR_CACHE.set(avatarUrl, remoteTexture);
            this.assignSpriteFrame(remoteTexture);
        } catch (error) {
            cc.error('Failed to load avatar with CORS handling:', error);

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
