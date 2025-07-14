import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import BitcoinMaster from "../BitcoinMaster";

export default class BitcoinMasterLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: BitcoinMaster) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.updateRoundHistory();
        this.main.statistic && this.main.statistic.node && this.main.statistic.setData(this.main.currentDataLogs);
    }
}
