import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterStatisticItem extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    public setUpDownValue(result: any) {
        if (!this.sprite || !this.atlas) {
            return;
        }

        const number = BitcoinMasterUtils.getUpDownResult(result);

        let spriteName = `dot_up`;
        if (number === 0) {
            spriteName = `dot_balance`;
        } else if (number < 0) {
            spriteName = `dot_down`;
        }

        this.sprite.spriteFrame = this.atlas.getSpriteFrame(spriteName);
    }

    public setEvenOddValue(result: any) {
        if (!this.sprite || !this.atlas) {
            return;
        }
        const number = parseFloat(BitcoinMasterUtils.getEvenOddResult(result.close));
        const spriteName = number % 2 ? `statistic-dot-odd_${number}` : `statistic-dot-even_${number}`;
        this.sprite.spriteFrame = this.atlas.getSpriteFrame(spriteName);
    }
}
