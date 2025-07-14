import Baccarat from "../Baccarat";
import BaccaratLogsHandler from "./BaccaratLogsHandler";
import BaccaratFinishHandler from "./BaccaratFinishHandler";
import BaccaratTimeDataBaseHandler from "../../../_baccarat/data-handler/BaccaratTimeDataBaseHandler";

export default class BaccaratTimeDataHandler extends BaccaratTimeDataBaseHandler {
    protected getOwnMain(): any {
        return this.main as Baccarat;
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.handleFlyCards();
    }

    handleFlyCards() {
        const baccarat = this.getOwnMain();
        baccarat.bankerCards.resetCards();
        baccarat.playerCards.resetCards();
        this.main.setGameRound(this.main.roundId);
        this.main.node.runAction(
            cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(() => baccarat.playerCards.flyFirstCard()),
                cc.delayTime(0.4),
                cc.callFunc(() => baccarat.bankerCards.flyFirstCard()),
                cc.delayTime(0.4),
                cc.callFunc(() => baccarat.playerCards.flySecondCard()),
                cc.delayTime(0.4),
                cc.callFunc(() => baccarat.bankerCards.flySecondCard()),
                cc.delayTime(0.2),
                cc.callFunc(() => baccarat.playerCards.flyCardTmp1()),
                cc.delayTime(0.2),
                cc.callFunc(() => baccarat.bankerCards.flyCardTmp2())
            )
        );
        if (this.main.currentDataLogs[0]) {
            const currentData = this.main.currentDataLogs[0];
            const finishHandler = this.main.finishHandler as BaccaratFinishHandler;
            finishHandler.showResult(this.getSettlementResult(currentData), false);
        }
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.betItems.forEach((item) => item.setHighlight(false));

        this.getOwnMain().bigRoad.renderNextNode();
        if (this.main.currentTimeRemaining <= this.main.config.stopBetTime && this.main.currentDataLogs.length >= 102) {
            this.main.currentDataLogs.pop();
            (this.main.logsHandler as BaccaratLogsHandler).buildLogs(this.main.currentDataLogs);
        }
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(
            this.main.currentTimeRemaining - this.main.config.betTime - this.dealCardsTime - 1
        );
    }

    protected getSettlementResult(currentData: any) {
        return currentData.settlementResult;
    }
}
