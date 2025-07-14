import GameBaseLogsHandler from '../../../_base/handlers/GameBaseLogsHandler';
import RongHo from '../RongHo';

export default class RHLogsDataHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: RongHo) {
        super(main);
    }

    buildLogs(dataLogs: any) {
        this.main.updateLogs();
        this.main.scoreBoard.active = true;
    }
}
