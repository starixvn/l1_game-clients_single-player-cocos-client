import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";
import { getStringDateByTime } from "./../../../common/helpers/DateTimeHelper";
import VipSedieWarTicketDetail from "./VipSedieWarTicketDetail";
import VipSedieWarUtils from "./VipSedieWarUtils";

const { ccclass, property } = cc._decorator;
@ccclass
export default class VipSedieWarHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    @property(cc.Node)
    playerResultNode: cc.Node = null;

    @property(cc.Node)
    bankerResultNode: cc.Node = null;

    @property({ type: cc.SpriteFrame })
    dotsFrame: cc.SpriteFrame[] = [];

    getMiniPanel: () => cc.Node;

    detailData: any;

    setData(data: any, index: number) {
        const { time, phien, result, settlementResult, betwin, totalAmount, betLogDetails } = data;

        this.time.string = getStringDateByTime(time);
        this.round.string = phien;
        this.win.string = numberWithCommas(betwin, 2);
        this.bet.string = numberWithCommas(totalAmount);

        VipSedieWarUtils.setDotsImage(result, this.playerResultNode, this.bankerResultNode, this.dotsFrame);

        this.detailData = {
            phien,
            betLogDetails,
            settlementResult,
            result
        };
        this.setBackground(index);
    }

    openTicketDetail() {
        const miniPanel = this.getMiniPanel();
        const node = cc.instantiate(this.ticketDetailPrefab);
        miniPanel.addChild(node);
        node.getComponent(VipSedieWarTicketDetail).setData(this.detailData);
    }
}
