import NewDropDownList from "../../../common/new-drop-down-list/view-models/NewDropDownList";
import NewDropDownOption from "../../../common/new-drop-down-list/view-models/NewDropDownOption";
import MultiplayGameHistory from "./MultiplayGameHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DropdownListMultiplayGameHistory extends MultiplayGameHistory {
    @property({ type: cc.Node, visible: false, override: true })
    tabContainer: cc.Node = null;

    @property({ visible: false, override: true, type: cc.ScrollView })
    scrollView: cc.ScrollView = null;

    @property(cc.Node)
    layerCloseDropDown: cc.Node = null;

    static AllGameHistory = -1;
    public dropdownList: NewDropDownList;

    currentId = 0;

    protected readonly options: NewDropDownOption[] = [];

    getAllGamesHistory = false;
    defaultGameId: number;

    start() {
        super.start();
        this.layerCloseDropDown.height = this.HEIGHT_CONTENT + 72;
    }

    onInitializedDropdownList(node: cc.Node) {
        this.dropdownList = node.getComponent(NewDropDownList);
        this.dropdownList.init(this.options, this.onDropdownListChanged.bind(this));
        this.dropdownList.checkLayerCloseDrop = (isCheck) => {
            this.layerCloseDropDown.active = isCheck;
        };
    }

    initDefaultGame(gameId: number) {
        this.getAllGamesHistory = true;
        this.defaultGameId = gameId;
        this.handleSocketFromGame(gameId);
    }

    protected onDropdownListChanged(itemId: number) {
        if (itemId === DropdownListMultiplayGameHistory.AllGameHistory) {
            this.getAllGamesHistory = true;
            this.handleSocketFromGame(this.defaultGameId);
        } else {
            this.getAllGamesHistory = false;
            this.handleSocketFromGame(itemId);
        }
    }

    override get_data(page = 1) {
        const eventName = this.getAllGamesHistory ? "getAllGamesHistory" : "getHistory";
        this.socket && this.socket.connected && this.socket.emit(eventName, { page: page });
    }

    closeDropDown() {
        this.dropdownList && this.dropdownList.closeDropDown();
    }
}
