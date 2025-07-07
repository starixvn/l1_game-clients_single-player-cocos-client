import GameUtils from "../../../common/GameUtils";
import SocketIOTableGameBase from "../../_base/SocketIOTableGameBase";
import KenoBetHandler from "./handlers/KenoBetHandler";
import KenoFinishHandler from "./handlers/KenoFinishHandler";
import KenoLogsHandler from "./handlers/KenoLogsHandler";
import KenoTimeHandler from "./handlers/KenoTimeHandler";
import KenoRoundResult from "./history/KenoRoundResult";
import KenoUserHistory from "./history/KenoUserHistory";
import { KenoConfigs } from "./KenoConfigs";
import KenoNumber from "./KenoNumber";
import KenoRoundHistory from "./KenoRoundHistory";

const { ccclass, property } = cc._decorator;

export const KenoId = 8;

@ccclass
export default class Keno extends SocketIOTableGameBase {
    @property(KenoRoundResult)
    roundResult: KenoRoundResult = null;

    @property(KenoRoundHistory)
    roundHistory: KenoRoundHistory = null;

    @property(cc.Node)
    tableNode: cc.Node = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    public resultAnimating = false;
    public kenoNumbers: KenoNumber[] = [];

    constructor() {
        super();
        this.gameId = KenoId;
        this.setConfig(new KenoConfigs());
    }

    initHandlers() {
        super.initHandlers();

        this.finishHandler = new KenoFinishHandler(this);
        this.timeHandler = new KenoTimeHandler(this);
        this.logsHandler = new KenoLogsHandler(this);
        this.betHandler = new KenoBetHandler(this);
    }

    public openHistory() {
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(KenoUserHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    onLoad() {
        super.onLoad();
        this.roundHistory.init(this);
        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.roundResult.node.active = false;
    }

    public updateRoundHistory() {
        if (this.currentDataLogs.length > 0) {
            this.roundHistory.setData(this.currentDataLogs);
        }
    }

    public static getResults(settlementResult: any): string[] {
        const results = [];

        if (!settlementResult) {
            return results;
        }

        Object.keys(settlementResult).forEach((key, index) => {
            if (settlementResult[key]) {
                results.push(key);
            }
        });

        return results;
    }
}
