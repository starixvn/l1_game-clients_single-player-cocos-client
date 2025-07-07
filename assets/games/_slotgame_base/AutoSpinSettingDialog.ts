import CommonDialog from "../../common/_base/view-models/CommonDialog";
import AudioManager from "../../common/audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoSpinSettingDialog extends cc.Component {
    @property(CommonDialog)
    dialog: CommonDialog = null;

    @property(cc.Node)
    choicesContainer: cc.Node = null;

    public onConfirmCallback = (autoSpinCount: number) => {};
    public onCancelCallback = () => {};
    private autoSpinCount = 10;
    private confirmed = false;

    onLoad() {
        const defaultSpin = this.choicesContainer.children[0].name || 10;
        this.autoSpinCount = +defaultSpin;

        this.dialog.addOnDidHide(() => {
            this.onDidHide();
            this.node.destroy();
        });
    }

    setLastSelected(value: number) {
        this.autoSpinCount = value;
        const node = this.choicesContainer.children.find((child) => value === +child.name);
        if (node) {
            const toggle = node.getComponent(cc.Toggle);
            toggle && (toggle.isChecked = true);
        }
    }

    onChoiceClick(toggle: cc.Toggle) {
        AudioManager.getInstance().playClick();
        this.autoSpinCount = +toggle.node.name;
    }

    onCloseClick() {
        AudioManager.getInstance().playClick();
        this.dialog.closeDialog();
    }

    onConfirmClick() {
        AudioManager.getInstance().playClick();
        this.confirmed = true;
        this.dialog.closeDialog();
    }

    private onDidHide() {
        if (this.confirmed) {
            this.onConfirmCallback(this.autoSpinCount);
        } else {
            this.onCancelCallback();
        }
    }
}
