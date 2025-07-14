import BetChipsNew from "../../../common/bet-chips/view-models/BetChipsNew";
import TexasGameDataModel from "../event-models/texas-game-data-model";
import { TexasChoicesConst } from "../texas-constants";
import { TexasChoicesType } from "../texas-type";
import Texas from "../view-models/texas";
import TexasBettingArea from "../view-models/texas-betting-area";
import TexasHoldemPokerChip from "../view-models/texas-chips";

export const showWinningOption =
    (
        bettingAreas: TexasBettingArea[],
        holdemPokerChips: TexasHoldemPokerChip,
        slidingChips: BetChipsNew,
        gameData: TexasGameDataModel<TexasChoicesType>,
        main: Texas
    ) =>
    () => {
        holdemPokerChips.showWinningOption(gameData, bettingAreas, slidingChips, main as any, TexasChoicesConst, main.shadowChip);
        gameData.settlement.waiting = false;
    };
