import BaccaratLogsHandler from "../../../baccarat/view-models/data-handlers/BaccaratLogsHandler";
import WebSocketTableGameBase from "../../../_base/WebSocketTableGameBase";
import VipBaccarat from "../VipBaccarat";
import VipBaccaratFinishHandler from "./VipBaccaratFinishHandler";

export default class VipBaccaratLogsHandler extends BaccaratLogsHandler {
    constructor(protected readonly main: WebSocketTableGameBase) {
        super(main);
    }

    protected getOwnMain(): any {
        return this.main as VipBaccarat;
    }

    protected getOwnFinishHandle(): any {
        const ownMain = this.getOwnMain();
        return ownMain.finishHandler as VipBaccaratFinishHandler;
    }

    protected updateMiniHistoryLogs(dataLogs: any) {
        const ownMain = this.getOwnMain();
        ownMain.miniRoundHistory.setData(dataLogs);
    }
}
