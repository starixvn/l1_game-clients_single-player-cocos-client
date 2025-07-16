import CommonDialog from "../_base/view-models/CommonDialog";
const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoRebetDialog extends cc.Component {
    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(cc.Label)
    lblRoundNumber: cc.Label = null;

    @property(cc.Node)
    nodeConfirmDisabled: cc.Node = null;

    @property(cc.Toggle)
    toggleUnSelectedChoice: cc.Toggle = null;

    private autoRebetCount = 1;

    public onConfirmCallback = (autoRebetCount: number) => {};

    onLoad() {
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }

    clickAddValue(event, value) {
        const clientSeed = this.lblRoundNumber.string;
        const newValue = `${clientSeed}${value}`;
        this.toggleUnSelectedChoice.isChecked = true;
        this.updateAutoRebetCount(newValue);
    }

    clickQuickValue(event, value) {
        this.updateAutoRebetCount(value);
    }

    updateAutoRebetCount(value: string) {
        const currentValue = this.lblRoundNumber.string;

        if (currentValue === "" && value === "0") {
            return;
        }

        if (+value >= 1000) {
            value = "1000";
        }

        this.autoRebetCount = Number(value);
        this.lblRoundNumber.string = value;
        this.nodeConfirmDisabled.active = this.disabledConfirmBtn(value);
    }

    disabledConfirmBtn(newCS: string) {
        return newCS === "";
    }

    clickClear() {
        this.lblRoundNumber.string = "";
        this.nodeConfirmDisabled.active = true;
    }

    clickRemoveLastLetter() {
        let multiplierString = this.lblRoundNumber.string.slice(0, -1);
        if (!multiplierString) {
            multiplierString = "";
            this.nodeConfirmDisabled.active = true;
        }

        this.lblRoundNumber.string = multiplierString;
    }

    clickConfirm() {
        this.onConfirmCallback(this.autoRebetCount);
        this.mainFrame.getComponent(CommonDialog).closeDialog();
    }
}
