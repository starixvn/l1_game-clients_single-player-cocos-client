import { LotteryChoiceItem } from "./LotteryChoiceItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryOtherItem extends LotteryChoiceItem {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.Sprite)
    nameSprite: cc.Sprite = null;

    onLoad() {
        this.statsLabel.node.active = false;
    }

    setStats(number: number) {
        this.statsLabel.node.active = true;
        this.statsLabel.string = `${number}%`;
    }

    hideStatistics() {
        this.statsLabel.node.active = false;
    }

    setName(key: string) {
        this.node.name = key;
        if (this.atlas) {
            this.nameSprite.spriteFrame = this.atlas.getSpriteFrame(`txt_${key}`);
        }
    }
}
