import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import Sedie from "../Sedie";
import SedieTimeHandler from "./SedieTimeHandler";

export default class SedieLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: Sedie) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.loading.active = false;
        this.main.updateRoundHistory();

        const sedieTimeHandler = this.main.timeHandler as SedieTimeHandler;
        if (this.main.currentTimeRemaining > sedieTimeHandler.shakeThePlateTime) {
            this.main.showResult();
            this.main.openPlate(false);
        }
    }
}
