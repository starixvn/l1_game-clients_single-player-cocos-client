import HoldemPokerBettingArea from "../../holdem-poker/view-models/HoldemPokerBettingArea";
import { TexasChoicesType } from "../texas-type";
import TexasGameDataModel from "../event-models/texas-game-data-model";

const { ccclass } = cc._decorator;

@ccclass
export default class TexasBettingArea extends HoldemPokerBettingArea {
    protected gameData: TexasGameDataModel<TexasChoicesType> = null;

    init(gameData: TexasGameDataModel<TexasChoicesType>) {
        this.gameData = gameData;
    }

    onLoad() {
        //onload
    }
}
