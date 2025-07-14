import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import ThreeCards from "../ThreeCards";

export default class ThreeCardsTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: ThreeCards) {
        super(main);
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.resetCards();
        this.main.betItems.forEach((item) => item.setHighlight(false));
    }

    handleInRoundTime() {
        super.handleInRoundTime();
        this.main.highlightLastResult();
        this.main.resetCards();
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.main.highlightLastResult();
        this.main.resetCards();
    }

    startNewGameRound() {
        this.main.resetDataAndUI();
        this.main.highlightLastResult();
        this.main.resetCards();
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.main.config.betTime - 3);
    }

    handleWaitTime() {
        super.handleWaitTime();
        const dealingCardsDuration = 2;
        const newRoundTimePoint = this.main.config.betTime + dealingCardsDuration;
        if (this.main.currentTimeRemaining === newRoundTimePoint) {
            this.main.playDealingAnimation();
            this.startNewGameRound();
        }
        if (this.main.currentTimeRemaining <= newRoundTimePoint) {
            this.main.timeWaitNode.active = false;
        }
    }
}
