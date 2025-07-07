import { AutoScaleWidget } from "./AutoScaleWidget";
import GameUtils from "./GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class IpadAutoScaleWidget extends AutoScaleWidget {
    isIpad(): boolean {
        return GameUtils.isIpad();
    }

    protected updateDisplay(): void {
        if (!this.isIpad()) {
            return;
        }
        super.updateDisplay();
    }
}
