const { ccclass, property } = cc._decorator;

@ccclass
export default class TypingLabel extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    playTypingEffect(duration = 0.5) {
        const labelWidth = this.label.node.width;

        if (!this.node.activeInHierarchy) {
            this.node.width = labelWidth;
            return;
        }

        const changeWitdhAction = cc.sequence(
            cc.callFunc(() => {
                this.node.width += 1;
            }),
            cc.delayTime(duration / labelWidth)
        );

        this.node.runAction(
            cc.sequence(
                cc.callFunc(() => {
                    this.node.width = 0;
                }),
                cc.repeat(changeWitdhAction, labelWidth)
            )
        );
    }

    adjustWidth() {
        this.node.width = this.label.node.width;
    }
}
