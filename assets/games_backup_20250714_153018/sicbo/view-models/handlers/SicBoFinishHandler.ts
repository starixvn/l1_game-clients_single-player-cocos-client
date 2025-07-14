import { appManager } from "../../../../managers/AppManager";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import SicBo from "../SicBo";

export default class SicBoFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: SicBo) {
        super(main, 3);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.addRoundHistory(dataFinish);
        this.main.setResult();
        const finishHandler = this.main.finishHandler as GameBaseFinishHandler;
        this.main.md5Component?.setDelayShowRawValue(finishHandler.getResultAnimationTime());

        if (appManager.GAME_IS_SHOWED) {
            cc.tween(this.main.node)
                .call(() => {
                    this.main.shakeAnimation.node.active = false;
                    this.main.openDiskAnimation.node.active = true;
                    this.main.openDiskAnimation.play();
                })
                .delay(this.playResultAnimationTime)
                .call(() => {
                    onFinishHandlingData();
                    this.main.highlightWinningBetItems();
                    this.main.updateStatistic(this.main.currentDataLogs);
                })
                .start();
        }
    }
}
