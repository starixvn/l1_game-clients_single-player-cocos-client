import { appManager } from "../../../../managers/AppManager";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import Keno from "../Keno";
import KenoTimeHandler from "./KenoTimeHandler";

export default class KenoFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: Keno) {
        super(main, 2);
    }

    handleFinishData(dataFinish, onFinishHanlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHanlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();

        if (appManager.GAME_IS_SHOWED) {
            this.main.node.runAction(
                cc.sequence(
                    cc.callFunc(() => this.playResultAnimation()),
                    cc.delayTime(this.playResultAnimationTime),
                    cc.callFunc(() => onFinishHanlingData())
                )
            );
        }
    }

    playResultAnimation() {
        const resultNumbers = this.main.currentDataLogs[0].result;
        this.main.resultAnimating = true;
        this.main.roundResult.setData(resultNumbers, this.main.currentDataLogs[0].settlementResult);
        this.main.roundResult.showResult(true, this.playResultAnimationTime, () => {
            this.main.resultAnimating = false;
            const handler = this.main.timeHandler as KenoTimeHandler;
            handler.showResult(true);
        });
    }
}
