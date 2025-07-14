import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import Keno from "../Keno";

export default class KenoTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: Keno) {
        super(main);
    }

    handleWaitTime() {
        super.handleWaitTime();

        if (!this.main.resultAnimating) {
            this.showResult(true);
        }

        if (this.main.currentTimeRemaining > this.main.config.betTime + 6) {
            this.main.timeWaitNode.active = false;
        }
    }

    handleInRoundTime() {
        super.handleInRoundTime();

        this.main.resultAnimating = false;
        this.showResult(true, true);
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();

        this.main.betItems.forEach((item) => item.setHighlight(false));
    }

    public showResult(show: boolean, showForPreviousResult = false) {
        if (show) {
            this.main.updateRoundHistory();

            if (this.main.currentDataLogs.length > 0) {
                this.main.roundResult.setData(this.main.currentDataLogs[0].result, this.main.currentDataLogs[0].settlementResult);
                this.main.roundResult.showResult(false);

                const results = Keno.getResults(this.main.currentDataLogs[0].settlementResult);
                this.highlightWonItem(true, results, !showForPreviousResult);
                this.main.roundResult.node.active = !showForPreviousResult;
            }
        } else {
            this.highlightWonItem(false);
            this.main.roundResult.node.active = false;
        }
    }

    highlightWonItem(highlight: boolean, results: string[] = [], isAnimated = true) {
        if (highlight) {
            this.main.betItems.forEach((item) => {
                const exist = results.indexOf(item.node.name);
                item.setHighlight(exist > -1, isAnimated);
            });
        } else {
            this.main.betItems.forEach((item) => item.resetHighlight());
        }
    }
}
