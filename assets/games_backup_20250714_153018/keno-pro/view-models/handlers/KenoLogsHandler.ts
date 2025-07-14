import Keno from "../Keno";
import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";

export default class KenoLogsHandler extends GameBaseLogsHandler {

    constructor(protected readonly main: Keno) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.updateRoundHistory();
    }
}
