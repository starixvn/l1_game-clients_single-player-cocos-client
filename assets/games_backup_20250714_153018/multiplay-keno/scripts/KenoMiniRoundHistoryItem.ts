import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";
import { ExtendedLogControlData } from "../../_base/view-models/GameLogControlBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    public setData(data: ExtendedLogControlData) {
        const { choice } = data;

        const frameList = {
            big: this.atlas.getSpriteFrame("dot_big"),
            small: this.atlas.getSpriteFrame("dot_small"),
            even: this.atlas.getSpriteFrame("dot_even"),
            odd: this.atlas.getSpriteFrame("dot_odd")
        };

        this.node.getComponent(cc.Sprite).spriteFrame = frameList[choice];
    }
}
