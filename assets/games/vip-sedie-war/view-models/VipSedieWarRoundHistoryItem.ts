import SedieRoundHistoryItem from "../../../common/round-history/sedie/SedieRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipSedieWarRoundHistoryItem extends SedieRoundHistoryItem {
    public setValue(value: number) {
        if (!this.sprite || !this.atlas) {
            return;
        }

        const spriteName = `stats_chip${value}`;
        this.sprite.spriteFrame = this.atlas.getSpriteFrame(spriteName);
    }
}
