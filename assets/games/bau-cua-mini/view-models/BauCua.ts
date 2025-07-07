import * as _ from "lodash";

import AudioManager from "../../../common/audio/AudioManager";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import vipFishPrawnCrabConstants from "../../vip-fish-prawn-crab/view-models/VipFishPrawnCrabConstants";
import BauCuaBetItem from "./BauCuaBetItem";
import { BauCuaConfigs } from "./BauCuaConfigs";
import BauCuaHistory from "./BauCuaHistory/BauCuaHistory";
import BauCuaLogItems from "./BauCuaLogItems";
import BauCuaOddItem from "./BauCuaOddItem";
import BauCuaFinishHandler from "./handlers/BauCuaFinishHandler";
import BauCuaLogsHandler from "./handlers/BauCuaLogsHandler";
import BauCuaTimeHandler from "./handlers/BauCuaTimeHandler";

const { ccclass, property } = cc._decorator;

export const BauCuaId = 3;

@ccclass
export default class BauCua extends SocketIOMiniGameBase {
    @property({ type: cc.SpriteFrame })
    iconMini: cc.SpriteFrame[] = [];

    @property({ type: cc.SpriteFrame })
    iconLV: cc.SpriteFrame[] = [];

    @property({ type: cc.Sprite })
    dices: cc.Sprite[] = [];

    @property({ type: cc.SpriteAtlas })
    diceAtlas: cc.SpriteAtlas = null;

    @property({ type: cc.Label })
    characterCountLabels: cc.Label[] = [];

    @property(cc.Label)
    userCountLabel: cc.Label = null;

    @property(cc.Label)
    waitedTime: cc.Label = null;

    @property(cc.Node)
    logNode: cc.Node = null;

    @property(cc.Node)
    contentLogs: cc.Node = null;

    @property(cc.Prefab)
    prefabLogs: cc.Prefab = null;

    @property(cc.Node)
    center: cc.Node = null;

    @property(cc.Prefab)
    historyDialog: cc.Prefab = null;

    @property(cc.Label)
    oddOne: cc.Label = null;

    @property(cc.Label)
    oddTwo: cc.Label = null;

    @property(cc.Label)
    oddThree: cc.Label = null;

    @property({ type: BauCuaOddItem })
    oddItems: BauCuaOddItem[] = [];

    @property({ type: cc.Node, override: true })
    betChipsContainer: cc.Node = null;

    @property({ type: cc.Prefab, override: true })
    betChipsPrefab: cc.Prefab = null;

    @property(cc.Animation)
    shakeAnimation: cc.Animation = null;

    @property(cc.AudioSource)
    shakeAudio: cc.AudioSource = null;

    @property(cc.Node)
    thePlate: cc.Node = null;

    @property(cc.Node)
    bgOverlay: cc.Node = null;

    @property(cc.Node)
    openPlateEffect: cc.Node = null;

    @property(sp.Skeleton)
    effectOpenSpine: sp.Skeleton = null;

    private readonly limitLog = 30;

    public readonly shakeThePlateTime = 31;
    public finishShakeThePlate = false;
    override usingNewSettlement = true;

    Md5NodeWidth = 350;

    onLoad() {
        super.onLoad();
        this.logNode.active = false;
        this.showOpenPlateEffect(false);
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = BauCuaId;
        this.setConfig(new BauCuaConfigs());
    }

    onEnable() {
        super.onEnable();
        if (this.currentDataLogs && this.currentDataLogs.length > 0) {
            this.logNode.active = true;
        }
    }

    onDisable() {
        super.onDisable();
        this.showOpenPlateEffect(false);
    }

    checkShowUmMessage(data) {
        return this.currentTimeRemaining <= this.config.betTime || data.remainingTime === this.config.fullTime + 1;
    }

    initHandlers() {
        super.initHandlers();
        this.finishHandler = new BauCuaFinishHandler(this);
        this.logsHandler = new BauCuaLogsHandler(this);
        this.timeHandler = new BauCuaTimeHandler(this);
    }

    addLogs() {
        this.contentLogs.removeAllChildren();
        const logLength = this.currentDataLogs.length;
        const count = Math.min(this.limitLog, logLength);
        if (count === 0) {
            this.logNode.active = false;
            return;
        }

        this.logNode.active = true;
        const characterCounts = {};
        for (let index = 0; index < count; index++) {
            const { result } = this.currentDataLogs[index];

            const node = cc.instantiate(this.prefabLogs);
            const nodeComponent = node.getComponent(BauCuaLogItems);
            nodeComponent.setData(result, this.iconMini);
            Object.values(result).forEach((character: number) => {
                characterCounts[character] = (characterCounts[character] ?? 0) + 1;
            });
            this.contentLogs.addChild(node);
        }

        this.characterCountLabels.forEach((label, index) => {
            label.string = characterCounts[index] ?? "0";
        });
    }

    pressedShowScoreBoard() {
        AudioManager.getInstance().playClick();
        this.logNode.active = !this.logNode.active;
    }
    pressedHistoryDialog() {
        AudioManager.getInstance().playClick();
        const dialog = cc.instantiate(this.historyDialog);
        this.historyComponent = dialog.getComponent(BauCuaHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    updateOddsFromConfigs() {
        this.gameConfigs.odds && this.oddItems.forEach((item) => item.setValue(this.gameConfigs.odds[item.node.name]));
    }

    setDices(result) {
        const { dice1, dice2, dice3 } = result;
        this.dices[0].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice1}-2`);
        this.dices[1].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice2}-1`);
        this.dices[2].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice3}-1`);
    }

    showDiceResult(show: boolean) {
        this.dices.forEach((dice) => {
            dice.node.active = show;
        });
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.hideAllDices();
        this.node.stopAllActions();
        this.resetXTimesResult();
    }

    hideAllDices() {
        this.dices.forEach((dice) => {
            dice.node.active = false;
        });
    }

    resetXTimesResult() {
        this.betItems.forEach((betItem: BauCuaBetItem) => {
            betItem.hideXTimesResult();
            betItem.showHashNumber(false);
        });
    }

    resetUIBetItems() {
        this.betItems.forEach((betItem: BauCuaBetItem) => {
            betItem.resetHighlight();
        });
    }

    highlightWinningBetItems(type: boolean) {
        if (this.currentDataLogs.length > 0) {
            const { result, settlementResult } = this.currentDataLogs[0];
            this.betItems.forEach((betItem: BauCuaBetItem) => {
                const choice = betItem.node.name;
                betItem.updateHighlight(false);
                betItem.setHighlight(settlementResult[choice], type);
                betItem.showHashNumber(true);

                if (_.keys(vipFishPrawnCrabConstants.resultMapper).indexOf(choice) >= 0) {
                    const xValue = _.values(result).filter((value) => value === vipFishPrawnCrabConstants.resultMapper[choice]).length;
                    if (xValue > 1) {
                        betItem.setXSpriteFrame(xValue === 2 ? betItem.x2Sprite : betItem.x3Sprite);
                    }
                }
            });
        }
    }

    showOpenPlateEffect(show: boolean) {
        this.openPlateEffect.active = show;
        if (show) {
            this.playEffectOpenPlateSpine();
        }
    }

    playEffectOpenPlateSpine() {
        if (this.effectOpenSpine) {
            this.effectOpenSpine.setAnimation(0, this.effectOpenSpine.animation, false);
        }
    }
}
