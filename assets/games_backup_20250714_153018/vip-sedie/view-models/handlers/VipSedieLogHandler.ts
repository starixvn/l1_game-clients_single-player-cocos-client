import SedieLogsHandler from "../../../sedie/view-models/handlers/SedieLogsHandler";
import VipSedie from "../VipSedie";

export default class VipSedieLogHandler extends SedieLogsHandler {
    constructor(protected readonly main: VipSedie) {
        super(main);
    }

    buildLogs(dataLogs) {
        super.buildLogs(dataLogs);
        this.main.highlightLastResult();
    }
}
