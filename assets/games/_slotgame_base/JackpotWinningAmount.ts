import GameUtils from "../../common/GameUtils";
import BigWinAnimation from "./BigWinAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotWinningAmount extends BigWinAnimation {
    @property(cc.Sprite)
    poolSprite: cc.Sprite = null;

    async loadPoolSprite(pool: string) {
        try {
            const prizeTxt = `text-${pool}`;
            const frame = await GameUtils.loadResourceAsset<cc.SpriteFrame>(
                `shared/slot-game/textures/jackpot/${prizeTxt}`,
                cc.SpriteFrame
            );
            this.poolSprite.spriteFrame = frame;
        } catch (error) {
            console.log("Failed to load pool image");
        }
    }
}
