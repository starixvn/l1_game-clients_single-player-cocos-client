
const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoInactiveButton extends cc.Component {
    @property
    durationInactive = 1;

    private button: cc.Button;
    onLoad() {
        this.button = this.getComponent(cc.Button);
        this.node.on('click', this.buttonClick, this);
    }

    onDestroy() {
        this.node.off('click', this.buttonClick, this);
    }

    buttonClick() {
        this.button.interactable = false;

        setTimeout(() => {
            if (this.node === null) {
                return;
            }
            this.button.interactable = true;
        }, this.durationInactive * 1000);
    }
}
