import GameUtils from "../../../common/GameUtils";
import GameTicketDetailBase from "../../_base/view-models/GameTicketDetailBase";
import { BetLog, BetLogDetail } from "./HiLoBetData";
import HiLoTicketDetailBaseItem from "./HiLoTicketDetailBaseItem";
import HiLoTicketDetailItem from "./HiLoTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    ticketDetailItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    detailBaseItemPrefab: cc.Prefab = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Label)
    roundId: cc.Label = null;

    private readonly tableHeight = 90;
    public contentHeight = 110;
    private readonly maxHeightContent = 400;
    private readonly HEIGHT_PER_ROW = 50;
    comp: cc.Node;

    HEIGHT_BET_DETAIL_TABLE = 490;
    WIDTH_BET_DETAIL_TABLE = 1122;

    calculateHeights(betLogDetails: BetLogDetail[]) {
        this.contentHeight += (betLogDetails.length > 6 ? 6 : betLogDetails.length) * this.HEIGHT_PER_ROW;

        if (this.contentHeight >= this.maxHeightContent) {
            this.scrollView.node.height = this.maxHeightContent;
        } else {
            this.scrollView.node.height = this.contentHeight;
        }
    }

    updateContentTicketDetail(data: BetLog) {
        let index = 0;
        this.roundId.string = data.id.toString();
        const betLogDetails = data.betLogDetails;
        const startRound = this.renderDetailBase(data, true, index);
        startRound && this.content.addChild(startRound);
        index++;
        betLogDetails.forEach((logDetail) => {
            const ticketDetailItem = GameUtils.createNodeFromPrefab(this.ticketDetailItemPrefab);
            const detailControl = ticketDetailItem.getComponent(HiLoTicketDetailItem);
            detailControl.renderTicketDetailItem(logDetail, index);
            ticketDetailItem && this.content.addChild(ticketDetailItem);
            index++;
        });
        const endRound = this.renderDetailBase(data, false, index);
        endRound && this.content.addChild(endRound);
    }

    renderTicketDetail(data: BetLog) {
        this.updateContentTicketDetail(data);
        this.calculateHeights(data.betLogDetails);
        const heightBetDetailTable = this.contentHeight + this.HEIGHT_PER_ROW;
        this.betDetailTable.updateSize(this.WIDTH_BET_DETAIL_TABLE, heightBetDetailTable);
        this.betDetailFrame.updateSizeFrame(this.mainFrame.width, heightBetDetailTable + this.tableHeight);
    }

    renderDetailBase(data: BetLog, isFirst: boolean, index: number): cc.Node {
        const basedetailItem = GameUtils.createNodeFromPrefab(this.detailBaseItemPrefab);
        const control = basedetailItem.getComponent(HiLoTicketDetailBaseItem);
        control.setData(data, isFirst, index);
        return basedetailItem;
    }
}
