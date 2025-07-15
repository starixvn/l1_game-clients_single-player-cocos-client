import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import GameTicketDetailBase from "../../_base/view-models/GameTicketDetailBase";
import FreeBetDetailItem from "./FreeBetDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeBetDetail extends GameTicketDetailBase {
    @property(cc.Label)
    roundId: cc.Label = null;

    @property(cc.Sprite)
    resultSprite: cc.Sprite = null;

    @property(cc.Label)
    resultNumber: cc.Label = null;

    @property(cc.SpriteFrame)
    iconRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    iconWhite: cc.SpriteFrame = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    HEIGHT_PER_ROW = 50;
    WIDTH_BET_DETAIL_TABLE = 562;
    isShowTitleBetDetail = false;
    private heightBetTable = 150;

    init(betLog: any) {
        const { phien, betwin, result, settlementResult } = betLog;
        this.roundId.string = phien;

        let number = 0;
        Object.keys(result).forEach((key) => {
            if (result[key]) {
                number++;
            }
        });

        this.resultNumber.string = number.toString();
        if (number % 2) {
            this.resultSprite.spriteFrame = this.iconRed;
            this.resultNumber.node.color = cc.Color.WHITE;
        } else {
            this.resultSprite.spriteFrame = this.iconWhite;
            this.resultNumber.node.color = cc.Color.BLACK;
        }

        let totalBet = 0;
        let row = 0;
        Object.keys(settlementResult).forEach((key) => {
            if (betLog[key]) {
                if (this.itemPrefab) {
                    const node = cc.instantiate(this.itemPrefab);
                    const item = node.getComponent(FreeBetDetailItem);
                    item.setData(key, betLog[key], row);
                    this.content.addChild(node);
                    row++;
                }

                totalBet += betLog[key];
            }
        });
        this.heightBetTable += row * this.HEIGHT_PER_ROW;
        this.totalBet.string = numberWithCommas(totalBet);
        this.win.string = numberWithCommas(betwin, 2);
        this.betDetailTable.updateSize(this.WIDTH_BET_DETAIL_TABLE, this.heightBetTable);
        this.betDetailFrame.updateSizeFrame(this.mainFrame.width, this.heightBetTable + 90);
    }
}
