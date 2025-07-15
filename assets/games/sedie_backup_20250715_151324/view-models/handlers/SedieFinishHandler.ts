import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import Sedie from "../Sedie";

export default class SedieFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: Sedie) {
        super(main);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.addRoundHistory(dataFinish);
        this.main.showResult();

        if (!this.main.node.activeInHierarchy) {
            this.main.openPlate(false);
            onFinishHandlingData();
            this.main.updateRoundHistory();
        } else {
            cc.tween(this.main)
                .call(() => this.main.openPlate(true))
                .delay(this.main.openPlateDuration)
                .call(() => {
                    onFinishHandlingData();
                    this.main.needHideNextDotRoundHistory = true;
                    this.main.updateRoundHistory();
                })
                .start();
        }
    }
}
