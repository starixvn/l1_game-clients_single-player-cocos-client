import GameUtils from "../../../common/GameUtils";

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

    setData(leaderBoardItem: any) {
        this.rank.string = leaderBoardItem.rank?.toString();
        this.playerName.string = leaderBoardItem.nickname?.toString() || "***";
        this.winAmount.string = leaderBoardItem.totalWin?.toString();

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
        return GameUtils.loadRemote<T>("https://l2-proxy2.lumigame.com/shared-resources/operator-logo/x2/sp.png", options);
    }

    assignSpriteFrame(texture2D: cc.Texture2D) {
        const sprite = this.avatar;
        if (sprite) {
            const spriteFrame = new cc.SpriteFrame(texture2D);
            sprite.spriteFrame = spriteFrame;
            sprite.node.width = 44;
            sprite.node.height = 44;
        }
    }
}
