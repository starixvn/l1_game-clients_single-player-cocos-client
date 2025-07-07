import { appManager } from "../../../../managers/AppManager";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import VipFishPrawnCrab from "../VipFishPrawnCrab";

export default class VipFishPrawnCrabFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: VipFishPrawnCrab) {
        super(main, 2.5);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
        this.main.setResult();

        if (appManager.GAME_IS_SHOWED) {
            cc.tween(this.main.node)
                .call(this.openDisk.bind(this))
                .delay(this.playResultAnimationTime)
                .call(() => {
                    onFinishHandlingData();
                    this.main.highlightWinningBetItems();
                    this.main.updateStats();
                })
                .start();
        }
    }

    openDisk() {
        this.main.shakeAnimation.node.active = false;
        this.main.openDiskAnimation.node.active = true;
        this.main.openDiskAnimation.play();
    }
}
