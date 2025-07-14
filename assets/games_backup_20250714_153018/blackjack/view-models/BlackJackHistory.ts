import PaginationCommon from "../../../common/helpers/Pagination/PaginationCommon";
import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";
import BlackJackHistoryItem from "./BlackJackHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlackJackHistory extends SocketIOGameHistoryBase {
    @property({ type: PaginationCommon, visible: false, override: true })
    pagination: PaginationCommon = null;

    @property({ type: cc.Node, visible: false, override: true })
    mainFrame: cc.Node = null;

    @property({ type: cc.Label, visible: false, override: true })
    gameName: cc.Label = null;

    @property({ type: cc.ScrollView, visible: false, override: true })
    scrollView: cc.ScrollView = null;

    bindItemRowData(log, index) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(BlackJackHistoryItem);
        this.content.addChild(historyItemPrefab);
        item.setData(log, index);
    }
}
