import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import SicBo from "../SicBo";

export default class SicBoLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: SicBo) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.updateStatistic(dataLogs);
        this.main.highlightLastResult();
        this.main.md5Component?.setDelayShowRawValue(1);
        if (this.main.currentTimeRemaining > this.main.shakeThePlateTime && !this.main.finishShowResult) {
            this.main.setResult();
            this.main.shakeAnimation.node.active = false;
            this.main.openDiskAnimation.node.active = true;
            const duration = this.main.openDiskAnimation.defaultClip.duration;
            this.main.openDiskAnimation.play("Result", duration);
            this.main.finishShowResult = true;
        }
    }
}
