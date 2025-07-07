import GameBaseLogsHandler from '../../../_base/handlers/GameBaseLogsHandler';
import SpecialSeDie from '../SpecialSeDie';

export default class SpecialSeDieLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: SpecialSeDie) {
        super(main);
    }

    buildLogs(dataLogs) {
        if (dataLogs && dataLogs[0] && dataLogs[0].result) {
            this.main.setDots(dataLogs[0].result);
        }

        this.main.updateRoundHistory();
        this.main.highlightLastResult();
    }
}
