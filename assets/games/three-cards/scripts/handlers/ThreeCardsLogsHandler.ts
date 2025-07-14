import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import ThreeCards from "../ThreeCards";

export default class ThreeCardsLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: ThreeCards) {
        super(main);
    }

    buildLogs(dataLogs) {
        if (dataLogs.length === 0) {
            return;
        }
        this.main.showCards(true);
        this.main.resetCards();

        if (this.main.timeHandler.isInWaitTime) {
            if (this.main.currentTimeRemaining === this.main.config.fullTime) {
                this.main.showResult(dataLogs[0]);
            } else {
                this.main.updateAfterResult();
                this.main.highlightWonItems(dataLogs[0].settlementResult);
            }
        } else {
            if (this.main.timeHandler.isInRoundTime && !this.main.timeHandler.isInLockBetTime) {
                this.main.highlightLastResult();
            }
            this.main.updateRoundHistory();
        }
    }
}
