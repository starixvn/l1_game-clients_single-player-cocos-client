const { ccclass, property } = cc._decorator;

@ccclass
export default class CloseGameDialog extends cc.Component {
    @property(cc.Label)
    lblContent: cc.Label = null;

    @property(cc.Button)
    btnCancel: cc.Button = null;

    @property(cc.Button)
    btnConfirm: cc.Button = null;

    public onConfirmCallback: () => void = null;

    setContent(content: string) {
        this.lblContent.string = content;
    }

    onLoad() {
        this.btnCancel.node.on('click', this.onCancel, this);
        this.btnConfirm.node.on('click', this.onConfirm, this);
    }

    onCancel() {
        this.node.destroy();
    }

    onConfirm() {
        if (this.onConfirmCallback) this.onConfirmCallback();
        this.node.destroy();
    }
}