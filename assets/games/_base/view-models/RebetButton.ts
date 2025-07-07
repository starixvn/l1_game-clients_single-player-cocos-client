import StatusButton, { ButtonState } from "../../../common/custom-button/StatusButton";
const { ccclass, property } = cc._decorator;

@ccclass
export default class RebetButton extends StatusButton {
    @property(cc.Node)
    rebetBackground: cc.Node = null;

    private enabledRebetColor: string = null;

    setEnabledRebetColor(color: string) {
        this.enabledRebetColor = color;
    }

    private readonly disabledRebetColor = "#414141";
    private readonly defaultEnableRebetColor = "#901e01";

    _applyTransition(state) {
        super._applyTransition(state);
        if (state === ButtonState.NORMAL || state === ButtonState.HOVER || state === ButtonState.PRESSED) {
            this.activeNode.active = true;
            this.disableNode.active = !this.activeNode.active;
            this.updateRebetBackground(true);
        }
        if (state === ButtonState.DISABLED) {
            this.disableNode.active = true;
            this.activeNode.active = !this.disableNode.active;
            this.updateRebetBackground(false);
        }
    }

    updateRebetBackground(enabled: boolean) {
        const enableColor = this.enabledRebetColor ? this.enabledRebetColor : this.defaultEnableRebetColor;
        this.rebetBackground.color = enabled ? cc.Color.WHITE.fromHEX(enableColor) : cc.Color.WHITE.fromHEX(this.disabledRebetColor);
    }
}
