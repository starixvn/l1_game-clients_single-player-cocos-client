const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonArrow extends cc.Component {
    @property(cc.Node)
    background: cc.Node = null;

    @property(cc.Button)
    button: cc.Button = null;

    handleScale(isRight: boolean) {
        this.background.scale = isRight ? 1 : -1;
    }

    updateArrowVisibility(isScrollable: boolean) {
        this.background.parent.active = isScrollable;
        this.background.scale = 1;
    }
}
