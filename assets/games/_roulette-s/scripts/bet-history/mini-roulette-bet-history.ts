import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import Dropdown, { DropdownEvents } from "./dropdown";
import RouletteHistoryItem from "./mini-roulette-bet-history-item";
import RouletteTicketDetail from "./mini-roulette-ticket-detail";

const { ccclass, property } = cc._decorator;
@ccclass
export default class MiniRouletteBetHistory extends SocketIOGameHistoryBase {
    AUTO_SCALE_NODE_WIDTH = 786;
    HEIGHT_CONTENT = 772;

    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    loadingPrefab: cc.Prefab = null;

    @property(cc.Label)
    noDataLabel: cc.Label = null;

    @property(Dropdown)
    dropdown: Dropdown = null;

    loadingNode: cc.Node = null;

    currentPage = 0;
    totalData = 0;
    pageSize = 0;
    dataByRound: Record<string, any> = {};
    date = "";

    onEnable() {
        super.onEnable();
        this.scrollView.node.on("bounce-bottom", this.handleScrollEnd, this);
        this.dropdown?.node?.on(DropdownEvents.SELECT_ITEM, this.handleSelectDate, this);
    }

    onDestroy(): void {
        this.scrollView?.node?.off("scroll-to-bottom", this.handleScrollEnd, this);
        super.onDestroy();
    }

    bindItemRowData(log, index) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(RouletteHistoryItem);
        this.content.addChild(historyItemPrefab);
        item.setData(log, index);
        this.handleSomeItemRowData(this, item, log);
        this.setDataByRound(log);
    }

    showTicketDetail(round: number, time: string, result: number, betLogDetails: any, settlementResult: any) {
        const ticketDetailPrefab = cc.instantiate(this.ticketDetailPrefab);
        const ticketDetailComponent = ticketDetailPrefab.getComponent(RouletteTicketDetail);
        this.node.addChild(ticketDetailPrefab);
        ticketDetailComponent.setRouletteData(round, result);
        ticketDetailComponent.setDetailData(betLogDetails, settlementResult, this.dataByRound[round]);
        ticketDetailComponent.showbetLogs();
    }

    onData(data) {
        const { page, pageSize, total, betLogs } = data;
        this.noDataLabel.node.active = total === 0;
        this.currentPage = page;
        this.totalData = total;
        this.pageSize = pageSize;
        betLogs.forEach((betLog, index) => this.bindItemRowData(betLog, index));
        this.onUpdatedData();
        this.loadingNode?.destroy();
    }

    setDataByRound(betLog) {
        this.dataByRound[betLog.roundId] = {
            odds: betLog.odds,
            totalBet: betLog.totalAmount,
            totalWin: betLog.betwin
        };
    }

    handleScrollEnd() {
        if (this.currentPage < this.totalData / this.pageSize) {
            this.currentPage++;
            this.get_data(this.currentPage);
        }
    }

    handleSelectDate(date: string) {
        this.scrollView?.scrollToTop(0.1);
        this.clearBetHistory();
        this.date = date;
        this.currentPage = 1;
        this.get_data(this.currentPage);
    }

    clearBetHistory() {
        this.content.destroyAllChildren();
        this.dataByRound = {};
    }

    get_data(page = 1) {
        if (this.loadingPrefab && this.currentPage < this.totalData / this.pageSize) {
            this.loadingNode = cc.instantiate(this.loadingPrefab);
            this.content.addChild(this.loadingNode);
        }
        this.socket?.connected && this.socket.emit("getHistory", { page: page, date: this.date });
    }
}
