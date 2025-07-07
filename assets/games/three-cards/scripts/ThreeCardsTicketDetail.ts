import NewCard from "../../../common/new-card/view-models/NewCard";
import GameTicketDetailBase from "../../_base/view-models/GameTicketDetailBase";
import { ThreeCardsBetData } from "./DataDefinition";
import ThreeCardsTicketDetailItem from "./ThreeCardsTicketDetailItem";
import ThreeCardsWinChoiceView from "./ThreeCardsWinChoiceView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property({ type: NewCard })
    cards: NewCard[] = [];

    @property(cc.Label)
    round: cc.Label = null;

    @property(ThreeCardsWinChoiceView)
    winChoices: ThreeCardsWinChoiceView = null;

    private heightBetDetailTable = 55;
    private readonly HEIGHT_BET_DETAIL_ROW = 50;
    WIDTH_BET_DETAIL_TABLE = 750;
    private readonly PADDING_TOP_BET_DETAIL_TABLE = 116;

    setData(data: ThreeCardsBetData) {
        this.round.string = data.phien;
        this.cards &&
            this.cards.forEach((card, i) => {
                card.setCard(data.result[i]);
                card.faceUp();
            });
        this.winChoices && this.winChoices.setData(data);
        this.itemPrefab && this.createDetailItems(data);
        this.betDetailTable.updateSize(this.WIDTH_BET_DETAIL_TABLE, this.heightBetDetailTable);
        this.betDetailFrame.updateSizeFrame(this.mainFrame.width, this.heightBetDetailTable + this.PADDING_TOP_BET_DETAIL_TABLE);
    }

    createDetailItems(data: ThreeCardsBetData) {
        const keys = ["red", "black", "diamonds", "hearts", "spades", "clubs"];
        const list = [];
        keys.forEach((key) => {
            if (data[key] > 0) {
                list.push(key);
            }
        });

        const { settlementResult } = data;
        list.forEach((key, i) => {
            const item = this.addItem();
            const itemData = {
                choice: key,
                bet: data[key],
                odds: data.odds[key]
            };
            item.setData(itemData);
            item.setBackground(i);
            item.setHighlight(settlementResult[key]);
            this.heightBetDetailTable += this.HEIGHT_BET_DETAIL_ROW;
        });
    }

    addItem(): ThreeCardsTicketDetailItem {
        const node = cc.instantiate(this.itemPrefab);
        this.content.addChild(node);
        return node.getComponent(ThreeCardsTicketDetailItem);
    }
}
