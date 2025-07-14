import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

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

    setData(leaderBoardItem: any, isCurrentPlayer = false) {
        this.rank.string = leaderBoardItem.rank?.toString();
        this.playerName.string = leaderBoardItem.nickname?.toString();
        this.winAmount.string = numberWithCommas(leaderBoardItem.totalWin, 2);
        if (isCurrentPlayer) {
            this.background.active = true;
        }

        if (leaderBoardItem.avatarUrl) {
            this.setGameAvartar(leaderBoardItem.avatarUrl);
        }
    }

    protected async setGameAvartar(avatarUrl: string) {
        try {
            const remoteTexture = await this.loadRemoteSharedResource<cc.Texture2D>(avatarUrl);
            this.assignSpriteFrame(remoteTexture);
        } catch (error) {
            cc.log(`Not get Game} Icon from shared resource`);
        }
    }

    public loadRemoteSharedResource<T>(pathResource: string, options = { maxRetryCount: 3 }) {
        return GameUtils.loadRemote<T>(pathResource, options);
    }

    assignSpriteFrame(texture2D: cc.Texture2D) {
        const sprite = this.avatar;
        if (sprite) {
            const spriteFrame = new cc.SpriteFrame(texture2D);
            sprite.spriteFrame = spriteFrame;
        }
    }
}
