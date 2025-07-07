import GameUtils from "../../../common/GameUtils";
import AudioManager from "../../../common/audio/AudioManager";
import BaccaratBigRoad from "../../_baccarat/view-models/BaccaratBigRoad";
import SocketIOTableGameBase from "../../_base/SocketIOTableGameBase";
import BasicHistoryBoard from "../../_base/view-models/BasicHistoryBoard";
import { BaccaratConfigs } from "../../baccarat/view-models/BaccaratConfigs";
import TotalHistoryBoard from "../../baccarat/view-models/TotalHistoryBoard";
import VipBaccaratCards from "./VipBaccaratCards";
import VipBaccaratHistory from "./VipBaccaratHistory";
import VipBaccaratMiniRoundHistory from "./VipBaccaratMiniRoundHistory";
import VipBaccaratBetHandler from "./data-handlers/VipBaccaratBetHandler";
import VipBaccaratFinishHandler from "./data-handlers/VipBaccaratFinishHandler";
import VipBaccaratLogsHandler from "./data-handlers/VipBaccaratLogsHandler";
import VipBaccaratTimeDataHandler from "./data-handlers/VipBaccaratTimeDataHandler";

const { ccclass, property } = cc._decorator;

export const VipBaccaratId = 27;

@ccclass
export default class VipBaccarat extends SocketIOTableGameBase {
    @property({ type: VipBaccaratCards })
    playerCards: VipBaccaratCards = null;

    @property({ type: VipBaccaratCards })
    bankerCards: VipBaccaratCards = null;

    @property(cc.Node)
    basicHistoryBoardNode: cc.Node = null;

    @property(cc.Prefab)
    basicHistoryBoardPrefab: cc.Prefab = null;

    @property(cc.Node)
    bigRoadNode: cc.Node = null;

    @property(cc.Prefab)
    bigRoadPrefab: cc.Prefab = null;

    @property(TotalHistoryBoard)
    totalHistoryBoard: TotalHistoryBoard = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Label)
    winNoticeLabel: cc.Label = null;

    @property(cc.AudioSource)
    getCardAudioSource: cc.AudioSource = null;

    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    basicHistoryBoard: BasicHistoryBoard;
    bigRoad: BaccaratBigRoad;
    showScoreBoardNextDot = false;
    protected miniRoundHistory: VipBaccaratMiniRoundHistory;
    override syncShowingMD5WithResult = true;
    override usingNewSettlement = false;

    constructor() {
        super();
        this.internalInit();
    }

    protected internalInit() {
        this.gameId = VipBaccaratId;
        this.setConfig(new BaccaratConfigs());
    }

    onLoad() {
        super.onLoad();
        this.initCards();
        this.initScoreBoards();
        this.initMiniRoundHistory();

        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });

        this.handlePositionMiniRoundHistory();
    }

    handlePositionMiniRoundHistory() {
        this.miniRoundHistory.tip.node.zIndex = 100;
        GameUtils.moveToOtherNode(this.miniRoundHistory.tip.node, this.ownBetContainer);
    }

    initHandlers() {
        super.initHandlers();

        this.timeHandler = new VipBaccaratTimeDataHandler(this);
        this.finishHandler = new VipBaccaratFinishHandler(this);
        this.logsHandler = new VipBaccaratLogsHandler(this);
        this.betHandler = new VipBaccaratBetHandler(this);
    }

    openHistory() {
        this.playClick();
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(VipBaccaratHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    resetDataAndUI() {
        super.resetDataAndUI();

        this.winNoticeLabel.node.parent.active = false;
    }

    playGetCardAudio() {
        AudioManager.getInstance().playSFX(this.getCardAudioSource.clip);
    }

    private initCards() {
        this.bankerCards.init(() => {
            this.playGetCardAudio();
        });
        this.playerCards.init(() => {
            this.playGetCardAudio();
        });
    }

    private initScoreBoards() {
        const condition = () => {
            return this.currentTimeRemaining < this.config.stopBetTime || this.showScoreBoardNextDot;
        };

        const historyBoardNode = cc.instantiate(this.basicHistoryBoardPrefab);
        this.basicHistoryBoard = historyBoardNode.getComponent("BasicHistoryBoard");
        this.basicHistoryBoard.init(condition);
        this.basicHistoryBoardNode.addChild(historyBoardNode);

        const bigRoadNode = cc.instantiate(this.bigRoadPrefab);
        this.bigRoad = bigRoadNode.getComponent("BaccaratBigRoad");
        this.bigRoadNode.addChild(bigRoadNode);
    }

    initMiniRoundHistory() {
        const condition = () => {
            return this.currentTimeRemaining < this.config.stopBetTime || this.showScoreBoardNextDot;
        };

        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(VipBaccaratMiniRoundHistory);
        this.miniRoundHistory.init(condition);
        this.miniRoundHistoryContainer.addChild(mini);
    }
}
