import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import BitcoinMaster from "../BitcoinMaster";

export default class BitcoinMasterFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: BitcoinMaster) {
        super(main, 3);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
        this.main.setResult(dataFinish.result);
        this.main.updateRoundHistory();
        this.main.statistic && this.main.statistic.node && this.main.statistic.setData(this.main.currentDataLogs);
    }
}
