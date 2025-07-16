import _ = require("lodash");
import { i18n } from "../../ClientModules";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import { userManager } from "../../common/user/UserManager";
import AnimationUtils from "../../common/utils/AnimationUtils";
import { GameConfigBase } from "../_base/view-models/GameConfigBase";
import NewGameData from "../_base_new/models/NewGameData";
import { SoloBetModel, SoloBetState } from "../_solo_game/solo-bet-model";
import SoloGame from "../_solo_game/solo-game";
import MiniRouletteBetHistory from "./scripts/bet-history/mini-roulette-bet-history";
import RouletteWheel from "../roulette/view-models/RouletteWheel";
import MiniRouletteRoundHistory from "./scripts/mini-roulette-round-history";
import { RouletteGameData } from "./scripts/roulette-bet-game-data";
import RouletteBetItem from "./scripts/roulette-bet-item";
import { convertOwnChipToFlattened, convertOwnChipToTempBet, getTypeFromChoice } from "./scripts/roulette-s-utils";
import RouletteStatistics from "./scripts/roulette-statistics";
import SingleBetControl from "./scripts/single-bet-control";
import MiniRouletteSettlePopup from "./scripts/mini-roulette-settle-popup";
import RouletteLeaderBoard from "./scripts/roulette-leader-board";
import RouletteSettings from "./scripts/roulette-settings";
import GameUtils from "../../common/GameUtils";
import { WEBVIEW_MESSAGE } from "../../constants";
import { BetModel } from "../_base_new/models/BetModel";

const { ccclass, property } = cc._decorator;

export class RouletteSConfig implements GameConfigBase {
    minBetTime = 1;
    fullTime = 22;
    betTime = 15;
    stopBetTime = 0;
    waitTime = 7;
}

@ccclass
export default class RouletteS extends SoloGame {
    @property(RouletteWheel)
    wheel: RouletteWheel = null;

    @property(cc.Node)
    rouletteBetItemsContainer: cc.Node = null;

    @property(cc.Prefab)
    roundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    roundHistoryContainer: cc.Node = null;

    @property(cc.Prefab)
    statisticPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    leaderBoardsPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    settingsPrefab: cc.Prefab = null;

    @property(cc.Node)
    settlePopup: cc.Node = null;

    private singleBetControl: SingleBetControl = null;

    private rouletteBetItems: RouletteBetItem[] = [];
    private roundHistoryComponent: MiniRouletteRoundHistory = null;

    private chipFlyingStamp = 0;

    protected betChipContainer: cc.Node = null;
    private settlePopupComponent: MiniRouletteSettlePopup = null;

    private leaderBoardsComponent: RouletteLeaderBoard = null;
    private settingsComponent: RouletteSettings = null;
    constructor() {
        super();
        this.gameId = 134;
        this.setConfig(new RouletteSConfig());
    }

    createGameData(): NewGameData {
        return new RouletteGameData();
    }

    onLoad() {
        this.initRouletteBetItems();
        this.initRoundHistory();

        this.singleBetControl = this.rouletteBetItemsContainer.getComponentInChildren(SingleBetControl);
        this.settlePopupComponent = this.settlePopup.getComponent(MiniRouletteSettlePopup);

        this.wheel.setOnBallLandedWithSettlementCallback(this.highlightBetItemsBySettlement.bind(this));

        super.onLoad();
        GameUtils.notifyNativeApp(WEBVIEW_MESSAGE.ON_GAME_LOADED);
    }

    protected onChangedBetChip(bet: number) {
        super.onChangedBetChip(bet);
        this.soloBetModel.setCurrentBet(bet);
    }

    initRouletteBetItems() {
        this.rouletteBetItems = this.rouletteBetItemsContainer.getComponentsInChildren(RouletteBetItem);

        this.rouletteBetItems.forEach((item) => {
            item.betCallback = this.onBetClick.bind(this);
            item.resetUI();

            const choice = item.node.name;
            if (parseInt(choice) > -1) {
                item.clearOwnBetForStraightUp();
            }
        });
    }

    initRoundHistory() {
        if (!this.roundHistoryPrefab || !this.roundHistoryContainer) {
            return;
        }
        const item = cc.instantiate(this.roundHistoryPrefab);
        this.roundHistoryComponent = item.getComponent(MiniRouletteRoundHistory);
        this.roundHistoryContainer.addChild(item);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CHANGE_OWN_BET, () => (data) => {
            Object.keys(data).forEach((choice) => {
                const nodeName = choice;
                const betItem = this.rouletteBetItems.find((item) => item.node.name === nodeName);
                betItem?.setOwnBet(data[choice]);
            });
        });
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.FLY_OWN_CHIP_FAKE, () => (data) => {
            if (data.endBet) {
                this.throwChip(data);
                this.updateSpinButtonInteractable();
            }
        });
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CHANGE_OWN_CHIPS_FAKE, () => (ownBets) => {
            this.rouletteBetItems.forEach((item) => {
                const choice = item.node.name;
                const betValue = ownBets[choice];
                if (betValue) {
                    this.betChips.createChipStackUtils(item.chipNode, betValue);
                } else {
                    item.clearChips();
                }
            });
            this.updateSpinButtonInteractable();
        });

        this.emitterListener(this.gameData.betModel, BetModel.Events.CHANGE_OWN_CHIP, () => (ownChip) => {
            if (!ownChip || typeof ownChip !== "object") {
                return;
            }

            Object.keys(ownChip).forEach((subChoice) => {
                if (ownChip[subChoice] === undefined) {
                    return;
                }
            });

            const convertedOwnBets = convertOwnChipToFlattened(ownChip);
            const convertedTempBets = convertOwnChipToTempBet(ownChip);
            this.soloBetModel.receiveOwnBets(convertedTempBets, convertedOwnBets);
        });
    }

    throwChip(data) {
        const choice = data.betChoice;
        const nodeName = choice;
        const betItem = this.rouletteBetItems.find((item) => item.node.name === nodeName);
        const chipBoxNode = betItem?.chipNode;
        if (!betItem || !chipBoxNode) {
            return;
        }
        this.chipFlyingStamp = Date.now();
        if (betItem.isSingleBet && !this.singleBetControl.isActive) {
            this.betChips.showChipOwnBet({ chipNode: chipBoxNode, clearChips: () => {} }, data.endBet);
            return;
        }
        if (this.singleBetControl.isActive && betItem.node.name === "straightUp") {
            this.betChips.showChipOwnBet({ chipNode: chipBoxNode, clearChips: () => {} }, data.endBet);
            return;
        } else {
            this.betChips.throwChipToChipBox(data.endBet, chipBoxNode, null, null);
        }
    }

    updateRoundHistory() {
        this.roundHistoryComponent?.setData(this.currentDataLogs);
    }

    mergeStackOnChoice(choice: string, timeStamp: number) {
        if (this.chipFlyingStamp !== timeStamp) {
            return;
        }

        const totalBet = this.soloBetModel.getTotalBetOnChoice(choice);
        const nodeName = choice;
        const item = this.rouletteBetItems.find((item) => item.node.name === nodeName);
        this.betChips.createChipStackUtils(item.chipNode, totalBet);
    }

    updateOddsFromConfigs() {
        if (this.gameConfigs?.odds) {
            const odds = this.gameConfigs.odds;

            this.rouletteBetItems.forEach((item) => {
                const type = getTypeFromChoice(item.node.name);
                item.setOdd(odds[type]);
            });
        }
    }

    onStateChange(state: string) {
        this.updateSpinButtonInteractable();

        switch (state) {
            case SoloBetState.STARTING_ROUND:
                this.showMainTime(true);
                this.gameData.durations.remaining = this.config.betTime;
                this.gameData.durations.start();
                break;
            case SoloBetState.BETTING:
                this.showMainTime(false);
                this.rouletteBetItems.forEach((item) => {
                    item.setHighlight(false);
                    item.setInactive(true);
                });
                this.roundHistoryComponent.setHighlight(false);
                break;
            case SoloBetState.RESULT:
                this.showMainTime(false);
                break;
            case SoloBetState.SETTLEMENT:
                break;
            default:
                break;
        }
    }

    protected createBetData(bet: any) {
        const betChoices = this.generateBetChoices(bet);
        const betData = {
            betChoices,
            username: userManager.userName,
            clientSentTime: new Date()
        };
        return betData;
    }

    protected generateBetChoices(bet: any) {
        const betChoices = {};
        Object.keys(bet).forEach((choice) => {
            const type = getTypeFromChoice(choice);
            const typeValue = betChoices[type] || {};

            if (type === "column" || type === "dozen") {
                const subChoice = choice.slice(-1);
                typeValue[subChoice] = bet[choice];
            } else {
                typeValue[choice] = bet[choice];
            }
            betChoices[type] = typeValue;
        });
        return betChoices;
    }

    async showSettlementResult(settlement: any) {
        //this.wheel.hideResultNumber();
        this.singleBetControl.hideControl();

        this.soloBetModel.changeState(SoloBetState.RESULT);

        const result = settlement.result;
        try {
            await this.showWheelResult(settlement);
            AnimationUtils.delayTime(4.7).then(() => {
                this.wheel.hideResultNumber();
            });
            this.soloBetModel.changeState(SoloBetState.SETTLEMENT);
            this.gameData.settlement.finishShowResult(settlement, true);
        } catch (error) {
            console.warn(error.message);
        }
    }

    handlePayChips(settlement) {
        this.gameData.settlement.showStatus();
    }

    async handleAfterSettlementResult(settlement: any, animated: boolean) {
        super.handleAfterSettlementResult(settlement, animated);
        this.roundHistoryComponent.setHighlight(true);

        await AnimationUtils.delayTime(2);
        this.settlePopupComponent.showSettlementResult(this.betWinAmount, this.soloBetModel.currentTotalBet());
        this.resetBetWinAmount();

        AnimationUtils.delayTime(2.2).then(async () => {
            this.settlePopupComponent.hideSettlementResult();
            this.rouletteBetItems.forEach((betItem) => {
                const choice = betItem.node.name;

                if (parseInt(choice) > -1) {
                    betItem.clearOwnBetForStraightUp();
                } else {
                    betItem.clearOwnBet();
                }
                betItem.setInactive(false);
                betItem.clearChips();
            });

            await AnimationUtils.delayTime(0.5);

            this.soloBetModel.changeState(SoloBetState.READY);
            this.isStartRound = false;
            this.hasAcceptedBets = false;

            this.setAutoRebetInteractable(true);

            if (this.autoRebetCount > 0) {
                const isBalanceEnough = this.checkAutoRebetBalance();
                this.setAutoRebetInteractable(isBalanceEnough);

                const betObject = this.convertBetQueueToBetObject(this.soloBetModel.lastQueueBet);
                this.autoRebetCount--;
                this.onReBet(betObject, this.autoRebetCount);
            } else {
                this.hideAutoRebetMessage();
            }
        });
    }

    showWheelResult(settlement: any) {
        return new Promise<void>((resolve) => {
            this.wheel.showResult(settlement, () => {
                resolve();
            });
        });
    }

    highlightBetItemsBySettlement(settlement: any) {
        this.rouletteBetItems.forEach((betItem) => {
            const choice = betItem.node.name;
            const type = getTypeFromChoice(choice);
            const settlementResult = settlement.settlementResult[type];
            const isSpecial = type === "column" || type === "dozen";
            const isWin = isSpecial ? settlementResult.includes(choice.slice(-1)) : settlementResult.includes(choice);

            betItem.setHighlight(isWin);
        });
    }

    checkExceedMaxBet(total: number): boolean {
        const maxBet = this.getMaxBet();
        if (total > maxBet) {
            this.showMiniWarning(i18n.t("messages.maxBetNotice", { maxBet: numberWithCommas(maxBet) }));
            return true;
        }
        return false;
    }

    checkAvailableBetChoices(choice: string, amount: number): boolean {
        if (!this.gameConfigs) {
            return false;
        }

        const betModel = this.soloBetModel;
        const choiceAmount = betModel.currentChoiceAmount(choice);
        const newChoiceAmount = choiceAmount + amount;
        const type = getTypeFromChoice(choice);

        if (this.checkExceedMaxBetChoice(newChoiceAmount, type, false)) {
            return false;
        }

        const currentTotal = betModel.currentTotalBet();
        const newTotal = currentTotal + amount;
        if (this.checkExceedMaxBet(newTotal)) {
            return false;
        }

        return true;
    }

    checkExceedMaxBetChoice(amount: number, type: string, isMultiChoices: boolean): boolean {
        const maxBet = Math.min(this.gameConfigs.maxBetPerChoices[type], this.getMaxBet());
        const text = isMultiChoices
            ? i18n.t("messages.maxBetOfAnyChoiceReached")
            : i18n.t("messages.maxBetForChoiceNotice", {
                  maxBet: numberWithCommas(maxBet)
              });
        if (amount > maxBet) {
            this.showMiniWarning(text);
            return true;
        }

        return false;
    }

    clickReBet() {
        if (!this.checkAvailableBalance(0)) {
            return;
        }

        super.clickReBet();
    }

    override initEventForInGameMenu() {
        const node = super.initEventForInGameMenu();
        node.on(InGameMenuEvents.OPEN_SETTINGS, this.openSettings, this);
        node.on(InGameMenuEvents.OPEN_STATISTIC, this.openStatistic, this);
        node.on(InGameMenuEvents.OPEN_LEADER_BOARDS, this.openLeaderBoards, this);
        return node;
    }

    public openStatistic() {
        this.playClick();
        const dialog = cc.instantiate(this.statisticPrefab);
        const statisticData = this.currentDataLogs.map((log) => log.result);
        const comp = dialog.getComponent(RouletteStatistics);
        comp.generateStatistic(statisticData);

        this.currentMiniPanel.node.addChild(dialog);
    }

    public openHistory() {
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(MiniRouletteBetHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    public openLeaderBoards() {
        this.playClick();
        const dialog = cc.instantiate(this.leaderBoardsPrefab);
        this.leaderBoardsComponent = dialog.getComponent(RouletteLeaderBoard);
        this.leaderBoardsComponent.init(this.socket, this.gameName);
        this.currentMiniPanel.node.addChild(dialog);
    }

    public openSettings() {
        this.playClick();
        const dialog = cc.instantiate(this.settingsPrefab);
        this.settingsComponent = dialog.getComponent(RouletteSettings);
        this.settingsComponent.init(this.socket, this.gameName);

        this.currentMiniPanel.node.addChild(dialog);
    }
}
