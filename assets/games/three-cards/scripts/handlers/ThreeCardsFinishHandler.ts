import { appManager } from "../../../../managers/AppManager";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import ThreeCards from "../ThreeCards";

export default class ThreeCardsFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: ThreeCards) {
        super(main);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.addRoundHistory(dataFinish);
        this.main.clearAllNotices();
        if (appManager.GAME_IS_SHOWED) {
            this.main.showResult(dataFinish).then(() => {
                onFinishHandlingData();
            });
        } else {
            onFinishHandlingData();
            this.main.updateAfterResult();
        }
    }
}
