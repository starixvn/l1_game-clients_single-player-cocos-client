import BaccaratFinishHandler from "../../../baccarat/view-models/data-handlers/BaccaratFinishHandler";
import VipBaccarat from "../VipBaccarat";
import VipBaccaratLogsHandler from "./VipBaccaratLogsHandler";

export default class VipBaccaratFinishHandler extends BaccaratFinishHandler {
    protected getOwnMain(): any {
        return this.main as VipBaccarat;
    }
    protected handleBuildMiniLogs(baccaratMain: any) {
        const logsHandler = baccaratMain.logsHandler as VipBaccaratLogsHandler;
        const currentDataLogs = logsHandler.convertLogsDataLogs(baccaratMain.currentDataLogs);
        baccaratMain.needHideNextDotRoundHistory = true;
        baccaratMain.miniRoundHistory.setData(currentDataLogs);
    }
}
