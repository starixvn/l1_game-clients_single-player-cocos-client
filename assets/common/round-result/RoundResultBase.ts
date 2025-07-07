const { ccclass, property } = cc._decorator;

@ccclass
export default class RoundResultBase extends cc.Component {
    @property(cc.Sprite)
    dice1: cc.Sprite = null;

    @property(cc.Sprite)
    dice2: cc.Sprite = null;

    @property(cc.Sprite)
    dice3: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    total: cc.Sprite = null;

    @property(cc.Sprite)
    result: cc.Sprite = null;

    @property(cc.Sprite)
    highlight: cc.Sprite = null;

    onLoad() {
        cc.tween(this.highlight.node)
            .repeatForever(
                cc.tween().to(0.4, { opacity: 150 }, { easing: "cubicIn" }).delay(0.4).to(0.4, { opacity: 255 }, { easing: "cubicOut" })
            )
            .start();
    }
}
