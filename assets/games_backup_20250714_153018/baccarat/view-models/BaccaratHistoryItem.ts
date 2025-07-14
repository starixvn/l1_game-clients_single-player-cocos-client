import _ = require("lodash");

import BaccaratBaseHistoryItem from "./BaccaratBaseHistoryItem";
import BaccaratCards from "./BaccaratCards";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratHistoryItem extends BaccaratBaseHistoryItem {
    @property(BaccaratCards)
    playerCards: BaccaratCards = null;

    @property(BaccaratCards)
    bankerCards: BaccaratCards = null;

    setData(betLog: any, index: number) {
        this.setBackground(index);
        super.setData(betLog);
    }

    showCards(betLog: any) {
        if (!this.playerCards || !this.bankerCards) {
            return;
        }
        const playerCards = _.values(betLog.result.player);
        const bankerCards = _.values(betLog.result.banker);
        this.playerCards.init(null, false);
        this.bankerCards.init(null, false);
        this.playerCards.showCardsWithoutAnimation(playerCards);
        this.bankerCards.showCardsWithoutAnimation(bankerCards);
    }
}
