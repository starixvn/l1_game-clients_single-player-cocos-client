const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoNumber extends cc.Component {
    @property(cc.Label)
    numberLabel: cc.Label = null;

    setNumber(value: number, isAnimated: boolean) {
        this.numberLabel.string = value.toString();
        this.show(isAnimated);
    }

    showWaiting() {}

    show(isAnimated = false) {
        this.node.active = true;

        if (isAnimated) {
            this.runNumberAnimation();
        } else {
            this.clearNumberAnimation();
        }
    }

    hide() {
        this.node.active = false;
    }

    runNumberAnimation() {
        this.node.scale = 0;
        cc.tween(this.node).to(0.3, { scale: 1 }, { easing: "bounceOut" }).start();
    }

    clearNumberAnimation() {
        this.node.stopAllActions();
        this.node.scale = 1;
    }

    onDisable() {
        this.node.stopAllActions();
    }
}
