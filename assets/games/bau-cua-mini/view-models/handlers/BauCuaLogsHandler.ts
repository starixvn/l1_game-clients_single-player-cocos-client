import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import BauCua from "../BauCua";

export default class BauCuaLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: BauCua) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.addLogs();
        this.main.highlightWinningBetItems(false);
        this.main.resetUIBetItems();
        this.main.resetXTimesResult();
        if (this.main.currentTimeRemaining > this.main.shakeThePlateTime) {
            this.main.setDices(dataLogs[0].result);
            this.main.showDiceResult(true);
            this.main.finishShowResult = true;
        }
    }
}
