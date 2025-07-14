import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import VipFishPrawnCrab from "../VipFishPrawnCrab";

export default class VipFishPrawnCrabLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: VipFishPrawnCrab) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.updateStats();
        this.main.highlightLastResult();

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
