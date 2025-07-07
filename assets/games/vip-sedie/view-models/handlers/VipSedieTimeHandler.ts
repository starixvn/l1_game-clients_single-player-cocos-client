import SedieTimeHandler from "../../../sedie/view-models/handlers/SedieTimeHandler";
import VipSedie from "../VipSedie";

export default class VipSedieTimeHandler extends SedieTimeHandler {
    constructor(protected readonly main: VipSedie) {
        super(main);
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.betItems.forEach((item) => item.setHighlight(false));
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.main.highlightLastResult();
    }
}
