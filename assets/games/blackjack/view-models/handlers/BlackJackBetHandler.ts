import GameBaseBetHandler from "../../../_base/handlers/GameBaseBetHandler";
import BlackJack, { BlackJackActionType } from "../BlackJack";

export default class BlackJackBetHandler extends GameBaseBetHandler {
    constructor(protected readonly main: BlackJack) {
        super(main);
    }

    handleEndBet(data: any) {
        super.handleEndBet(data);
        if (data.endBet === -1 && this.main.gameStatus !== BlackJackActionType.IN_ROUND) {
            this.main.slidingDownBetChip(false);
            this.main.showActionsWithBehavior(BlackJackActionType.START_ROUND);
        }
    }
}
