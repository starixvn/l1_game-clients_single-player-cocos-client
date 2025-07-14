import AudioManager from "../../../common/audio/AudioManager";
import ExpandableMenu from "../../../common/expandable-menu/view-models/ExpandableMenu";
import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import BetItem from "../../_base/view-models/BetItem";
import VipSedie from "../../vip-sedie/view-models/VipSedie";
import VipSedieWarFinishHandler from "./handlers/VipSedieWarFinishHandler";
import VipSedieWarTimeHandler from "./handlers/VipSedieWarTimeHandler";
import SedieDish from "./SedieDish";
import { VipSedieWarConfigs } from "./VipSedieWarConfigs";
import VipSedieWarStatistic from "./VipSedieWarStatistic";
import VipSedieWarUtils from "./VipSedieWarUtils";

const { ccclass, property } = cc._decorator;

export const VipSedieWarId = 28;

@ccclass
export default class VipSedieWar extends VipSedie {
    @property(VipSedieWarStatistic)
    leftStatistic: VipSedieWarStatistic = null;

    @property(VipSedieWarStatistic)
    rightStatistic: VipSedieWarStatistic = null;

    @property({ type: SedieDish })
    dishes: SedieDish[] = [];

    @property(cc.Node)
    betChoicesNode: cc.Node = null;

    expandableMenu: ExpandableMenu = null;

    protected internalInit() {
        this.gameId = VipSedieWarId;
        this.setConfig(new VipSedieWarConfigs());
        this.finishShowResult = false;
    }

    onLoad() {
        this.betChoicesNode.children.forEach((child) => {
            const betItem = child.getComponent(BetItem);
            if (betItem) {
                this.betItems.push(betItem);
            }
        });
        super.onLoad();

        this.node.on(cc.Node.EventType.TOUCH_START, () => {
            this.expandableMenu.collapseMenu();
        });
    }

    protected onChangedBetChip(bet) {
        super.onChangedBetChip(bet);
        this.expandableMenu.collapseMenu();
    }

    onBetItemClick(event) {
        super.onBetItemClick(event);
        this.expandableMenu.collapseMenu();
    }

    updateRoundHistory() {
        this.leftStatistic.setData(this.currentDataLogs);
        this.rightStatistic.setData(this.currentDataLogs);

        const miniHistoryData = this.currentDataLogs.map((d) => {
            let result = 0;
            const list = ["player", "banker", "tie"];
            list.forEach((key, index) => {
                if (d.settlementResult[key]) {
                    result = index;
                }
            });

            let count = 0;
            const redList = ["red1", "red2", "red3", "red4"];
            redList.forEach((i) => {
                if (d.result.player[i]) {
                    count++;
                }
                if (d.result.banker[i]) {
                    count++;
                }
            });
            return {
                roundId: d.roundId,
                type: result,
                red: count,
                result: d.result
            };
        });
        this.miniRoundHistory.setData(miniHistoryData);
    }

    initHandlers() {
        super.initHandlers();
        this.finishHandler = new VipSedieWarFinishHandler(this);
        this.timeHandler = new VipSedieWarTimeHandler(this);
    }

    normalShowNextDotCondition() {
        return this.currentTimeRemaining < this.config.stopBetTime || this.currentTimeRemaining > this.config.fullTime - 0.1;
    }

    initRoundHistory() {
        this.leftStatistic.sedieRoundHistory.logControl.init(this.needShowNextDot.bind(this));
        this.rightStatistic.sedieRoundHistory.logControl.init(this.needShowNextDot.bind(this));

        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(MiniRoundHistory);
        this.miniRoundHistory.init(this.needShowNextDot.bind(this));
        this.miniRoundHistoryContainer.addChild(mini);
    }

    setDotsResult() {
        const { result } = this.currentDataLogs[0];

        this.dishes[0].setDots(result.player, this.roundId);
        this.dishes[1].setDots(result.banker, this.roundId);
    }

    showResultOnTable() {
        const { settlementResult } = this.currentDataLogs[0];

        this.betItems.forEach((betItem) => betItem.setHighlight(settlementResult[betItem.node.name], true));
        this.updateRoundHistory();
    }

    showResult() {
        if (this.currentDataLogs.length > 0) {
            const { result, settlementResult } = this.currentDataLogs[0];

            this.dishes[0].setDots(result.player, this.roundId);
            this.dishes[1].setDots(result.banker, this.roundId);

            this.betItems.forEach((betItem) => betItem.setHighlight(settlementResult[betItem.node.name], true));
        }
    }

    openPlate(animated: boolean) {
        if (animated) {
            this.dishes[0].openPlate(animated);
            cc.tween(this)
                .delay(1)
                .call(() => this.dishes[1].openPlate(animated))
                .start();
        } else {
            this.dishes.forEach((dish) => dish.openPlate(animated));
        }
    }

    closePlate() {
        this.dishes.forEach((dish) => dish.closePlate());
    }

    openGuide() {
        AudioManager.getInstance().playClick();
        this.expandableMenu.collapseMenu();
        super.openGuide();
    }

    openHistory() {
        super.openHistory();
        AudioManager.getInstance().playClick();
        this.expandableMenu.collapseMenu();
    }

    getBetChoiceString(choice: string): string {
        return VipSedieWarUtils.getBetChoiceString(choice);
    }

    onIngameMenuInitialized(node: cc.Node) {
        super.onIngameMenuInitialized(node);
        if (this.inGameMenu) {
            this.expandableMenu = this.inGameMenu.expandableMenu;
        }
    }
}
