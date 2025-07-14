import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import Lottery from "../Lottery";

export default class LotteryLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: Lottery) {
        super(main);
    }

    buildLogs(dataLogs) {
        if (this.main.timeHandler.isInWaitTime && this.main.currentTimeRemaining === this.main.config.fullTime - 1) {
            this.main.showResult(dataLogs[0]);
        } else {
            if (this.main.timeHandler.isInWaitTime) {
                this.main.highlightLastResult();
            }
            this.main.updateAfterResult();
        }
    }
}
