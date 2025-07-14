import * as _ from "lodash";

import { userManager } from "../../../../common/user/UserManager";
import GameBaseBetHandler from "../../../_base/handlers/GameBaseBetHandler";
import SicBo from "../SicBo";

export default class SicBoBetHandler extends GameBaseBetHandler {
    constructor(protected readonly main: SicBo) {
        super(main);
    }

    handle(data: any): boolean {
        super.handle(data);

        if (data.chips && this.main.currentTimeRemaining < this.main.config.betTime) {
            const chips = {};
            chips[userManager.rate] = data.chips;
            this.placeTotalChips(chips);
        }

        return true;
    }

    placeOwnChip(data) {
        const { betChoice, amount } = data;
        const betItem = _.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betChoice.toLowerCase());

        this.main.betChips.placeChipToChipBox(amount, betItem.chipNode, null, null);
    }
}
