import { AutoScaleWidget } from "./AutoScaleWidget";

const { ccclass, property } = cc._decorator;

@ccclass
export default class IOSAutoScaleWidget extends AutoScaleWidget {
    isIOS(): boolean {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /ipad|iphone/.test(userAgent);
    }

    protected updateDisplay(): void {
        if (!this.isIOS()) {
            return;
        }
        super.updateDisplay();
    }
}
