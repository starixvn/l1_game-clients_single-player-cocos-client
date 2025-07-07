import RouletteResultNumber from "./RouletteResultNumber";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteMiniRoundResult extends cc.Component {
    @property(cc.Node)
    contentNode: cc.Node = null;

    @property(cc.Node)
    highlight: cc.Node = null;

    resultNumbers: RouletteResultNumber[] = [];

    onLoad() {
        this.resultNumbers = this.contentNode.children.map((child) => child.getComponent(RouletteResultNumber));
        this.node.opacity = 0;
    }

    public setData(numbers: number[], animated = false) {
        this.node.opacity = 255;

        this.resultNumbers.forEach((child, index) => {
            if (index > numbers.length - 1) {
                child.hide();
            } else {
                child.setNumber(numbers[index]);
            }
        });

        this.highlight.active = numbers.length > 0;

        if (animated) {
            const sequence = cc.sequence(cc.fadeOut(0.2), cc.fadeIn(0.2));
            this.highlight.runAction(cc.repeat(sequence, 4));
        }
    }
}
