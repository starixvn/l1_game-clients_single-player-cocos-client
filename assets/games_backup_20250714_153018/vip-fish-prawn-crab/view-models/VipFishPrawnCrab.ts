import * as i18n from "i18n/runtime-scripts/LanguageData";
import * as _ from "lodash";

import GameUtils from "../../../common/GameUtils";
import SocketIOTableGameBase from "../../_base/SocketIOTableGameBase";
import VipFishPrawnCrabBetHandler from "./handlers/VipFishPrawnCrabBetHandler";
import VipFishPrawnCrabFinishHandler from "./handlers/VipFishPrawnCrabFinishHandler";
import VipFishPrawnCrabLogsHandler from "./handlers/VipFishPrawnCrabLogsHandler";
import VipFishPrawnCrabTimeHandler from "./handlers/VipFishPrawnCrabTimeHandler";
import VipFishPrawnCrabBetItem from "./VipFishPrawnCrabBetItem";
import VipFishPrawnCrabConfigs from "./VipFishPrawnCrabConfigs";
import vipFishPrawnCrabConstants from "./VipFishPrawnCrabConstants";
import VipFishPrawnCrabHistory from "./VipFishPrawnCrabHistory";
import VipFishPrawnCrabOddItem from "./VipFishPrawnCrabOddItem";
import VipFishPrawnCrabStats from "./VipFishPrawnCrabStats";

const { ccclass, property } = cc._decorator;

export const VipFishPrawnCrabId = 26;

@ccclass
export default class VipFishPrawnCrab extends SocketIOTableGameBase {
    public readonly shakeThePlateTime = 33;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property({ type: cc.SpriteFrame })
    characterIcons: cc.SpriteFrame[] = [];

    @property({ type: cc.Sprite })
    dices: cc.Sprite[] = [];

    @property(cc.Animation)
    openDiskAnimation: cc.Animation = null;

    @property(cc.Node)
    statsContainer: cc.Node = null;

    @property(cc.Prefab)
    statsPrefab: cc.Prefab = null;

    @property({ type: VipFishPrawnCrabOddItem })
    oddItems: VipFishPrawnCrabOddItem[] = [];

    @property(cc.SpriteFrame)
    x2SpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    x2LastSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    x3SpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    x3LastSpriteFrame: cc.SpriteFrame = null;

    @property(cc.Animation)
    shakeAnimation: cc.Animation = null;

    @property(cc.AudioSource)
    shakeAudio: cc.AudioSource = null;

    @property(cc.Node)
    randomResult: cc.Node = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    private statsComponent: VipFishPrawnCrabStats;
    public finishShakeThePlate = false;
    override usingNewSettlement = true;

    constructor() {
        super();
        this.internalInit();
    }

    protected internalInit() {
        this.gameId = VipFishPrawnCrabId;
        this.setConfig(new VipFishPrawnCrabConfigs());
        this.finishShowResult = false;
    }

    onLoad() {
        super.onLoad();
        this.shakeAnimation.node.active = false;
        this.initStats();
        this.animatedTime.setAnimatedY(30, -5);

        this.betItems.forEach((item: VipFishPrawnCrabBetItem) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);

            item.chipNode.scaleX = 1;
            item.totalBet.node.scaleX = 1;
            item.ownBet.node.scaleX = 1;
        });
    }

    initStats() {
        const node = cc.instantiate(this.statsPrefab);
        this.statsComponent = node.getComponent(VipFishPrawnCrabStats);
        this.statsComponent.init(this);
        this.statsContainer.addChild(node);
    }

    updateStats() {
        this.statsComponent.renderData(this.currentDataLogs);
    }

    initHandlers() {
        super.initHandlers();

        this.finishHandler = new VipFishPrawnCrabFinishHandler(this);
        this.logsHandler = new VipFishPrawnCrabLogsHandler(this);
        this.betHandler = new VipFishPrawnCrabBetHandler(this);
        this.timeHandler = new VipFishPrawnCrabTimeHandler(this);
    }

    setResult() {
        if (this.currentDataLogs.length > 0) {
            const { result } = this.currentDataLogs[0];
            this.setDices(_.values(result));
        }
    }

    highlightWinningBetItems() {
        if (this.currentDataLogs.length > 0) {
            const { result, settlementResult } = this.currentDataLogs[0];
            this.betItems.forEach((betItem: VipFishPrawnCrabBetItem) => {
                const choice = betItem.node.name;
                betItem.setHighlight(settlementResult[choice], true);

                if (_.keys(vipFishPrawnCrabConstants.resultMapper).indexOf(choice) >= 0) {
                    const xValue = _.values(result).filter((value) => value === vipFishPrawnCrabConstants.resultMapper[choice]).length;
                    if (xValue > 1) {
                        betItem.setXSpriteFrame(xValue === 2 ? this.x2SpriteFrame : this.x3SpriteFrame);
                    }
                }
            });
        }
    }

    setDices(dices: number[]) {
        const randomOption = this.randomResult.children[this.roundId % 5];

        dices.forEach((dice, index) => {
            this.dices[index].node.position = randomOption.children[index].position;
            this.dices[index].spriteFrame = this.characterIcons[dice];
            this.dices[index].node.active = true;
        });
    }

    resetDataAndUI() {
        super.resetDataAndUI();

        this.openDiskAnimation.node.active = false;
    }

    openHistory() {
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(VipFishPrawnCrabHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    public updateOddsFromConfigs() {
        this.gameConfigs.odds && this.oddItems.forEach((item) => item.setValue(this.gameConfigs.odds[item.node.name]));
    }

    public highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];

        if (dataLog) {
            this.betItems.forEach((betItem: VipFishPrawnCrabBetItem) => {
                const choice = betItem.node.name;
                betItem.setHighlight(dataLog.settlementResult[choice], false);
                if (_.keys(vipFishPrawnCrabConstants.resultMapper).indexOf(choice) >= 0) {
                    const xValue = _.values(dataLog.result).filter(
                        (value) => value === vipFishPrawnCrabConstants.resultMapper[choice]
                    ).length;
                    if (xValue > 1) {
                        betItem.setXSpriteFrame(xValue === 2 ? this.x2LastSpriteFrame : this.x3LastSpriteFrame);
                    }
                }
            });
        }
    }

    getBetChoiceString(choice: string): string {
        const choices = ["ocean", "mountain"];

        if (choices.includes(choice)) {
            return i18n.t(`ui.${choice}`);
        }

        return super.getBetChoiceString(choice);
    }
}
