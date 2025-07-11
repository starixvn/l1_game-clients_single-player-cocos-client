import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
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

    loadingNode: cc.Node = null;

    currentPage = 0;
    totalData = 0;
    pageSize = 0;
    dataByRound: Record<string, any> = {};

    onEnable() {
        super.onEnable();
        this.scrollView.node.on("bounce-bottom", this.handleScrollEnd, this);
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
        if (this.loadingPrefab && this.currentPage < this.totalData / this.pageSize) {
            this.loadingNode = cc.instantiate(this.loadingPrefab);
            this.content.addChild(this.loadingNode);
        }
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
}
