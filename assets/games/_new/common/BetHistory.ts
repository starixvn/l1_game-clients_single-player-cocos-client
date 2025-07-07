import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import GameUtils from "../../../common/GameUtils";
import PaginationCommon from "../../../common/helpers/Pagination/PaginationCommon";
import HistoryFrame from "../../../common/new-history/HistoryFrame";
import Connection from "../connection/Connection";
import { events } from "../connection/SocketIOConnection";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BetHistory extends cc.Component {
    @property(PaginationCommon)
    pages: PaginationCommon = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    prefabItem: cc.Prefab = null;

    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(cc.Node)
    wrapperContent: cc.Node = null;

    AUTO_SCALE_NODE_WIDTH = 1398;
    HEIGHT_CONTENT = 520;

    protected connection: Connection;
    protected gameName: string;
    private callback: any;

    setConnection(connection: Connection, gameName: string) {
        this.connection = connection;
        this.get_data();
        this.gameName = gameName;
        this.callback = (data) => this.onData(data);
        this.connection.on(gameName, this.callback);
    }

    start() {
        const header = this.wrapperContent.children[0];
        GameUtils.setFontSizeLabelsInNode(header, true);
    }

    onDestroy() {
        this.connection.removeListener(this.gameName, this.callback);
    }

    getHistory(page = 1) {
        this.connection && this.connection.emit(events.getHistory, { page });
    }

    onData(data: any) {
        if (!data.history) {
            return;
        }
        this.pages.onSet(data.history.page, data.history.pageSize, data.history.total);
        this.content.children.forEach((child) => child.destroy());
        this.renderTicketHistory(data.history);
    }

    get_data(page = 1) {
        this.getHistory(page);
    }

    showDialog() {
        if (this.commonDialog) {
            this.commonDialog.showDialog();
        }
    }

    renderTicketHistory(data: any) {}

    public showTicketDetail(data) {}

    initHistoryWrapper(node: cc.Node) {
        const historyFrame = node.getComponent(HistoryFrame);
        this.pages = historyFrame.pagination;
        this.mainFrame = historyFrame.backWrapper;
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
        this.pages.init(this);

        this.wrapperContent.parent = this.mainFrame;
        historyFrame.updateSizeFrame(this.content.width, this.HEIGHT_CONTENT, this.AUTO_SCALE_NODE_WIDTH);
    }
}
