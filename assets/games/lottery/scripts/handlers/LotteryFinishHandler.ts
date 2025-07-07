import { appManager } from "../../../../managers/AppManager";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import Lottery from "../Lottery";

export default class LotteryFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: Lottery) {
        super(main);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
        this.main.requestStatistics();
        if (appManager.GAME_IS_SHOWED) {
            this.main.clearAllNotices();
            this.main.showResult(dataFinish).then(() => {
                this.handleStatus();
                onFinishHandlingData();
            });
        } else {
            this.main.updateAfterResult();
        }
    }

    handleStatus() {
        if (this.main.statusHandler.currentStatusData) {
            const { win, bet } = this.main.statusHandler.currentStatusData;
            if (win) {
                this.main.showWinningBet(bet);
                this.main.updateUserBalance();
            }
            this.main.statusHandler.clearStatusData();
        }
    }
}
