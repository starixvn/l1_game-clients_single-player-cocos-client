const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteTopNumbersCount extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property(cc.Label)
    value: cc.Label = null;

    @property(cc.Label)
    count: cc.Label = null;

    setData(data: { value: number; count: number; spriteFrame: cc.SpriteFrame }) {
        this.value.string = `${data.value}`;
        this.count.string = `${data.count}`;
        this.sprite.spriteFrame = data.spriteFrame;
    }
}
