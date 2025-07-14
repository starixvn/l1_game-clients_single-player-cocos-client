import MiniSedie from "./MiniSedie";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedieSubGame extends MiniSedie {
    openPlatePos = cc.v2(20, 40);
    protected delayPayoutDuration = 1.5;

    setBlurDishAndHideDices() {
        this.animation.node.opacity = 0;
    }

    showOriginalDish() {
        this.animation.node.opacity = 255;
        this.animation.node.position = cc.v3(0, 18, 0);
        this.animation.node.scale = 0.9;
    }
}
