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
        return text.length > maxLength ? `${text.substring(0, maxLength-1)}...` : text;
    }

    private async setGameAvatar(avatarUrl: string): Promise<void> {
        try {
            const remoteTexture = await this.loadRemoteSharedResource<cc.Texture2D>(avatarUrl);
            this.assignSpriteFrame(remoteTexture);
        } catch (error) {
            cc.error('Failed to load avatar from shared resource:', error);
            throw error;
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
}
