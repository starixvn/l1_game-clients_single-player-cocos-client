import { Socket } from "socket.io-client";

import { i18n } from "../../../ClientModules";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import BaseComponent from "../../../common/BaseComponent";
import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import PaginationCommon from "../../../common/helpers/Pagination/PaginationCommon";
import HistoryFrame from "../../../common/new-history/HistoryFrame";
import ProvablyFairVerifyComponent, { OPEN_PROVABLY_FAIR_VERIFY } from "./provably-fair/ProvablyFairVerifyComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class SocketIOGameHistoryBase extends BaseComponent {
    @property({ type: ProvablyFairVerifyComponent, visible: false })
    provablyFairVerifyComponent: ProvablyFairVerifyComponent = null;

    @property(PaginationCommon)
    pagination: PaginationCommon = null;

    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(cc.Label)
    gameName: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    wrapperContent: cc.Node = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    customResultPrefab: cc.Prefab = null;

    public gameId = 0;
    public pfGameId = 0;

    public headerTitleColor = "#ffe800";
    fontsizeTitle = 18;
    isSlotGame = false;

    historyFrame: HistoryFrame;

    protected socket: Socket;

    onUpdatedData = () => {
        // handle
    };

    AUTO_SCALE_NODE_WIDTH = 1398;
    HEIGHT_CONTENT = 520;
    WIDTH_SIGN = 120;

    init(socket: Socket) {
        this.socket = socket;
    }

    onEnable() {
        this.get_data();
    }

    @property({ readonly: true })
    enablePF: boolean;

    @property({
        type: cc.Label,
        visible: function () {
            return this.enablePF;
        }
    })
    verify: cc.Label = null;

    constructor() {
        super();
        this.enablePF = false;
    }

    @property({
        type: cc.Prefab,
        visible: function () {
            return this.enablePF;
        }
    })
    itemGroupPrefab: cc.Prefab = null;

    setGameName() {
        if (!this.gameName) {
            return;
        }

        const dataId = `gameNames.${this.gameId}`;
        const gameName = ` - ${i18n.t(dataId)}`;
        this.gameName.string = gameName.toUpperCase();
        this.gameName.node.active = true;

        const node = this.gameName.node.parent;
        node.getComponent(cc.Layout).updateLayout();
        this.historyFrame.updateTitleSize(node.width + this.WIDTH_SIGN);
    }

    start() {
        if (this.gameId !== 0) {
            this.setGameName();
        }

        if (!this.isSlotGame) {
            const header = this.wrapperContent.children[0];
            GameUtils.setFontSizeLabelsInNode(header, true, 36, this.headerTitleColor);
        }
    }

    get_data(page = 1) {
        this.socket?.connected && this.socket.emit("getHistory", { page: page });
    }

    onData(data) {
        const { page, pageSize, total, betLogs } = data;
        this.pagination.onSet(page, pageSize, total);
        this.content.destroyAllChildren();
        this.scrollView?.scrollToTop(0.1);

        if (!betLogs?.length) {
            return;
        }

        betLogs.forEach((betLog, index) => this.bindItemRowData(betLog, index));
        this.onUpdatedData();
    }

    initProvablyFairVerify(node: cc.Node) {
        this.provablyFairVerifyComponent = node.getComponent(ProvablyFairVerifyComponent);
        this.provablyFairVerifyComponent.onHide();
        this.customResultPrefab && this.provablyFairVerifyComponent?.initResultNode(this.customResultPrefab);
        node.on(OPEN_PROVABLY_FAIR_VERIFY, this.openProvablyFairVerify, this);
    }

    openProvablyFairVerify() {
        this.provablyFairVerifyComponent?.updateGameId(this.pfGameId);
        this.provablyFairVerifyComponent?.onShow();
    }

    onDestroy() {
        this.provablyFairVerifyComponent = null;
    }

    abstract bindItemRowData(betLog, index);

    handleSomeItemRowData(context: any, item: any, log: any) {
        item.amountLabel.string = numberWithCommas(log.totalAmount);
        item.win.string = numberWithCommas(log.betwin, 2);

        item.betTime = "";
        item.roundId = log.phien;
        item.result = log.result;
        item.betLogDetails = log.betLogDetails;
        item.settlementResult = log.settlementResult;

        item.showTicketDetail = (round, time, result, betLogDetails, settlementResult) => {
            context.showTicketDetail(round, time, result, betLogDetails, settlementResult);
        };
    }

    initHistoryWrapper(node: cc.Node) {
        this.historyFrame = node.getComponent(HistoryFrame);
        this.pagination = this.historyFrame.pagination;
        this.pagination.init(this);

        this.gameName = this.historyFrame.gameName;
        const mainFrame = this.historyFrame.backWrapper;
        const commonDialog = mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });

        this.wrapperContent.parent = mainFrame;
        this.historyFrame.updateSizeFrame(this.content.width, this.HEIGHT_CONTENT, this.AUTO_SCALE_NODE_WIDTH);
    }

    getBetDetailURL(betLog) {
        this.socket?.connected &&
            this.socket.emit("betDetails", {
                roundId: betLog.roundId,
                mode: "dark",
                language: window.i18n.curLang,
                timeZoneOffset: -new Date().getTimezoneOffset() / 60
            });
    }
}
