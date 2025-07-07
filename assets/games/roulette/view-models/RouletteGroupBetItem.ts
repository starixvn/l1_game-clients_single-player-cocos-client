import CustomButton from "../../../common/custom-button/CustomButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteGroupBetItem extends CustomButton {
    @property
    betType = "";

    @property
    numbers = "";

    @property(cc.Node)
    highlight: cc.Node = null;

    @property(cc.Node)
    winning: cc.Node = null;

    private originFrame: cc.SpriteFrame;

    private readonly UN_HIGHLIGHTED_TAG = 1;
    private readonly HIGHLIGHTED_TAG = 2;

    public groupBetItemCallback = {
        highlight: (highlight: boolean, numbers: number[]) => {},
        selected: (betType: string, numbers: number[]) => {}
    };

    getNumbers(): number[] {
        return this.numbers
        .split(",")
        .map(i => parseInt(i.trim()))
        .filter(n => !isNaN(n));
    }

    onLoad() {
        super.onLoad();

        if (this.winning) {
            this.originFrame = this.winning.getComponent(cc.Sprite).spriteFrame;
        }

        this.callback.highlight = (highlight) => {
            this.groupBetItemCallback.highlight(highlight, this.getNumbers());
            highlight ? this.showHighlight() : this.clearHighlight();
        };
        this.callback.selected = () => this.groupBetItemCallback.selected(this.betType, this.getNumbers());

        this.clearHighlight();
        this.hideWinning();
    }

    public clearHighlight() {
        if (this.highlight) {
            if (this.highlight.getActionByTag(this.UN_HIGHLIGHTED_TAG)) {
                return;
            }
            const action = cc.fadeOut(0.1);
            action.setTag(this.UN_HIGHLIGHTED_TAG);
            this.highlight.runAction(action);
        }
    }

    public showHighlight() {
        if (this.highlight) {
            if (this.highlight.getActionByTag(this.HIGHLIGHTED_TAG)) {
                return;
            }
            const action = cc.fadeIn(0.11);
            action.setTag(this.HIGHLIGHTED_TAG);
            this.highlight.runAction(action);
        }
    }

    public showWinning(animated: boolean) {
        if (this.winning) {
            this.winning.active = animated;
        }
        const sprite = this.winning?.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }
        sprite.spriteFrame = this.originFrame;
        if (animated) {
            const sequence = cc.sequence(cc.fadeOut(0.2), cc.fadeIn(0.2));
            this.winning.runAction(
                cc.sequence(
                    cc.repeat(sequence, 14),
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
