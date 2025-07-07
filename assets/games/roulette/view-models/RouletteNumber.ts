const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteNumber extends cc.Component {
    @property(cc.Node)
    highlight: cc.Node = null;

    @property(cc.Node)
    winning: cc.Node = null;

    private originFrame: cc.SpriteFrame;

    private readonly UNHIGHLIGHTED_TAG = 1;
    private readonly HIGHLIGHTED_TAG = 2;

    onLoad() {
        if (this.winning) {
            this.originFrame = this.winning.getComponent(cc.Sprite).spriteFrame;
        }
        this.clearHighlight();
        this.hideWinning();
    }

    public clearHighlight() {
        if (this.highlight.getActionByTag(this.UNHIGHLIGHTED_TAG)) {
            return;
        }
        if (this.highlight.getActionByTag(this.HIGHLIGHTED_TAG)) {
            this.highlight.stopActionByTag(this.HIGHLIGHTED_TAG);
        }
        const action = cc.fadeOut(0.1);
        action.setTag(this.UNHIGHLIGHTED_TAG);
        this.highlight.runAction(action);
    }

    public showHighlight() {
        if (this.highlight.getActionByTag(this.HIGHLIGHTED_TAG)) {
            return;
        }
        if (this.highlight.getActionByTag(this.UNHIGHLIGHTED_TAG)) {
            this.highlight.stopActionByTag(this.UNHIGHLIGHTED_TAG);
        }
        const action = cc.fadeIn(0.11);
        action.setTag(this.HIGHLIGHTED_TAG);
        this.highlight.runAction(action);
    }

    public showWinning(animated: boolean) {
        if (this.winning) {
            this.winning.active = animated;
        }

        const sprite = this.winning.getComponent(cc.Sprite);
        sprite.spriteFrame = this.originFrame;
        if (animated) {
            const sequence = cc.sequence(cc.fadeOut(0.2), cc.fadeIn(0.2));
            this.winning.runAction(
                cc.sequence(
                    cc.repeat(sequence, 20),
                    cc.fadeOut(0.2),
                    cc.callFunc(() => {
                        sprite.spriteFrame = this.originFrame;
                    })
                )
            );
        }
    }

    public hideWinning() {
        if (this.winning) {
            this.winning.active = false;
        }
    }
}
