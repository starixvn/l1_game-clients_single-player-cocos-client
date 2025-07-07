import * as _ from "lodash";

import { getLowercaseObjectKeys } from "../../../common/helpers/ObjectHelper";
import GameBase from "../../_base/GameBase";

export const clearChipsForLostChoices = (main: any, settlementResult: any) => {
    const settlementResultKeys = getLowercaseObjectKeys(settlementResult);
    const lostBetItems = _.filter(main.betItems, (item) => !settlementResult[settlementResultKeys[item.node.name.toLowerCase()]]);
    lostBetItems.forEach((item) => item.chipNode.destroyAllChildren());
};

export const resetUIAndClearChips = (game: GameBase) => () => {
    game.resetDataAndUI();
    game.betItems.forEach((item) => item.chipNode.destroyAllChildren());
};
