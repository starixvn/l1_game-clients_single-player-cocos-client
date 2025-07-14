import BetChipsNew from "../../../common/bet-chips/view-models/BetChipsNew";
import { HoldemPokerChoicesConst } from "../event-models/HoldemPokerChoices";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import HoldemPoker from "../view-models/HoldemPoker";
import HoldemPokerBettingArea from "../view-models/HoldemPokerBettingArea";
import HoldemPokerChips from "../view-models/HoldemPokerChips";

export const showWinningOption =
    (
        bettingAreas: HoldemPokerBettingArea[],
        holdemPokerChips: HoldemPokerChips,
        betChips: BetChipsNew,
        gameData: HoldemPokerGameData,
        main: HoldemPoker
    ) =>
    () => {
        holdemPokerChips.showWinningOption(gameData, bettingAreas, betChips, main, HoldemPokerChoicesConst, main.shadowChip);
        gameData.settlement.waiting = false;
    };
