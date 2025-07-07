const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRouletteRoundHistoryItem extends cc.Component {
    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Label)
    value: cc.Label = null;

    @property(cc.SpriteFrame)
    redBg: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    blackBg: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    greenBg: cc.SpriteFrame = null;

    @property(cc.Node)
    highlight: cc.Node = null;

    setData(value: any) {
        const { result, settlementResult } = value;
        this.value.string = result?.toString();
        if (settlementResult?.redBlack?.length > 0) {
            this.bg.spriteFrame = settlementResult?.redBlack?.includes("red") ? this.redBg : this.blackBg;
        } else {
            this.bg.spriteFrame = this.greenBg;
        }
    }

    setHighlight(isHighlight: boolean) {
        this.highlight.active = isHighlight;
    }
}
