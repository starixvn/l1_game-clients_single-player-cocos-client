import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import NewCard from "../../../common/new-card/view-models/NewCard";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";
import { ThreeCardsBetData } from "./DataDefinition";
import ThreeCardsWinChoiceView from "./ThreeCardsWinChoiceView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsHistoryItem extends SocketIOHistoryItemBase {
    @property(ThreeCardsWinChoiceView)
    winChoices: ThreeCardsWinChoiceView = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property({ type: NewCard })
    cards: NewCard[] = [];

    data: ThreeCardsBetData = null;

    public showTicketDetail = (data: any) => {};

    setData(betData: ThreeCardsBetData) {
        this.data = betData;

        this.time.string = getStringDateByTime(betData.time);
        this.round.string = betData.phien;
        this.win.string = numberWithCommas(betData.betwin, 2);
        this.winChoices && this.winChoices.setData(betData);
        this.bet.string = this.summarizeBet(betData);
        this.cards &&
            this.cards.forEach((card, i) => {
                card.setCard(betData.result[i]);
                card.faceUp();
            });
    }

    public static generateWinChoices(data: ThreeCardsBetData): string {
        const keys = ["red", "black", "diamonds", "hearts", "spades", "clubs"];
        const { settlementResult } = data;
        let winString = "";
        keys.forEach((key, i) => {
            if (settlementResult[key]) {
                if (i > 0 && winString.length > 0) {
                    winString += ", ";
                }
                const choice = GameUtils.getBetChoiceString(key);

                if (key === "red" || key === "diamonds" || key === "hearts") {
                    winString += `<color=#ff0000>${choice}</c>`;
                } else {
                    winString += choice;
                }
            }
        });

        return winString;
    }

    summarizeBet(data: ThreeCardsBetData): string {
        const keys = ["red", "black", "diamonds", "hearts", "spades", "clubs"];

        let total = 0;
        keys.forEach((key) => {
            total += data[key];
        });
        return numberWithCommas(total);
    }

    openTicketDetail() {
        AudioManager.getInstance().playClick();
        this.showTicketDetail(this.data);
    }
}
