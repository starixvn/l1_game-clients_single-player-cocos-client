import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import Roulette from "../Roulette";

export default class RouletteTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: Roulette) {
        super(main);
    }

    handleAtLockBetTime() {
        super.handleAtLockBetTime();
        this.main.clearTempBetChoices();
        this.main.rouletteMain.switchToRegularBet();
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.rouletteMain.enableQuickBet(false);
        this.main.rouletteMain.board.rouletteNumbers.forEach((n) => n.hideWinning());
        this.main.rouletteMain.board.groupItems.forEach((n) => n.hideWinning());
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.main.clearCurrentBetChoices();
        this.main.rouletteMain.enableQuickBet(true);
        this.main.rouletteMain.board.rouletteNumbers.forEach((n) => n.hideWinning());
        this.main.rouletteMain.board.groupItems.forEach((n) => n.hideWinning());
        this.main.gameRound.node.runAction(cc.repeat(cc.sequence(cc.scaleTo(0.15, 1.2), cc.scaleTo(0.15, 1.0)), 2));
    }
}
