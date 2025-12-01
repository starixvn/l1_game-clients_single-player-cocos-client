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
import RouletteSettings from "./scripts/roulette-settings";
import GameUtils from "../../common/GameUtils";
import { WEBVIEW_ACTION } from "../../constants";
import { BetModel } from "../_base_new/models/BetModel";
import GameBaseVoidTicketHandler from "../_base/handlers/GameBaseVoidTicketHandler";
import { StorageManager } from "../../managers/StorageManager";
import MiniRouletteTutorialMain, { TimerShowInteractiveGuide } from "./scripts/interactive-guide/mini-roulette-tutorial-main";
import LeaderBoardLoader from "./scripts/leader-board-loader";
import SingleBetItem from "./scripts/single-bet-item";

const { ccclass, property } = cc._decorator;

export class RouletteSConfig implements GameConfigBase {
    minBetTime = 1;
    fullTime = 37;
    betTime = 30;
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
    settingsPrefab: cc.Prefab = null;

    @property(cc.Node)
    settlePopup: cc.Node = null;

    @property(sp.Skeleton)
    confettiSpine: sp.Skeleton = null;

    @property(cc.Node)
    interactiveGuide: cc.Node = null;

    @property(cc.Prefab)
    interactiveGuidePrefab: cc.Prefab = null;

    @property(LeaderBoardLoader)
    leaderBoardLoader: LeaderBoardLoader = null;

    private straightUpBetItem: SingleBetItem = null;
    private singleBetControl: SingleBetControl = null;

    private rouletteBetItems: RouletteBetItem[] = [];
    private roundHistoryComponent: MiniRouletteRoundHistory = null;

    protected betChipContainer: cc.Node = null;

    private settlePopupComponent: MiniRouletteSettlePopup = null;

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

        this.straightUpBetItem = this.rouletteBetItemsContainer.getComponentInChildren(SingleBetItem);
        this.singleBetControl = this.rouletteBetItemsContainer.getComponentInChildren(SingleBetControl);
        if (this.straightUpBetItem && this.singleBetControl) {
            this.straightUpBetItem.singleBetControl = this.singleBetControl;
        }
        this.settlePopupComponent = this.settlePopup.getComponent(MiniRouletteSettlePopup);

        this.wheel.setOnBallLandedWithSettlementCallback(this.highlightBetItemsBySettlement.bind(this));
        this.wheel.setOnBeforeShowResultCallback(this.handleBeforeShowResult.bind(this));

        this.hideConfettiSpine();

        if (this.settlePopupComponent) {
            this.settlePopupComponent.onConfettiTrigger = this.triggerConfetti.bind(this);
        }

        super.onLoad();
        GameUtils.sendActionToParent(WEBVIEW_ACTION.ON_GAME_LOADED);
    }

    protected onChangedBetChip(bet: number) {
        super.onChangedBetChip(bet);
        this.soloBetModel.setCurrentBet(bet);
    }

    setUpHandlers(): void {
        super.setUpHandlers();
        this.addHandlers(new GameBaseVoidTicketHandler(this));
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
            let total = data.endBet;
            while (total > 0) {
                const value = this.betChips.chipValues.sort((a, b) => b - a).find((value) => value <= total);
                if (value) {
                    total -= value;
                    this.betChips.throwChipToChipBox(value, chipBoxNode, null, null);
                } else {
                    total = 0;
                }
            }
        }
    }

    updateRoundHistory() {
        this.roundHistoryComponent?.setData(this.currentDataLogs);
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
                this.handleBeforeShowResult();
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

    handleBeforeShowResult() {
        this.showMainTime(false);
        this.rouletteBetItems.forEach((item) => {
            item.setHighlight(false);
            item.setInactive(true);
        });
        this.roundHistoryComponent.setHighlight(false);
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
        this.singleBetControl.hideControl();

        this.soloBetModel.changeState(SoloBetState.RESULT);

        try {
            await this.showWheelResult(settlement);
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

        const delayShowSettlementPopup = 1.1;
        await AnimationUtils.delayTime(delayShowSettlementPopup);
        this.settlePopupComponent.showSettlementResult(this.betWinAmount, this.soloBetModel.currentTotalBet());
        this.resetBetWinAmount();

        const delayHideSettlementPopup = 3.32;
        AnimationUtils.delayTime(delayHideSettlementPopup).then(async () => {
            this.settlePopupComponent.hideSettlementResult();
            const delayHideResultNumber = 0.6;
            AnimationUtils.delayTime(delayHideResultNumber).then(() => {
                this.wheel.hideResultNumber();
            });

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

            const delayChangeNewRound = 0.5;
            await AnimationUtils.delayTime(delayChangeNewRound);

            this.soloBetModel.changeState(SoloBetState.READY);
            this.isStartRound = false;

            this.setAutoRebetInteractable(true);
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
        if (this.leaderBoardLoader) {
            this.leaderBoardLoader.showLeaderBoard();
        }
    }

    public openSettings() {
        this.playClick();
        const dialog = cc.instantiate(this.settingsPrefab);
        this.settingsComponent = dialog.getComponent(RouletteSettings);
        this.settingsComponent.init(this.socket, this.gameName);

        this.currentMiniPanel.node.addChild(dialog);
    }

    private hideConfettiSpine() {
        if (this.confettiSpine) {
            this.confettiSpine.setAnimation(0, "", false);
            this.confettiSpine.node.active = false;
        }
    }

    private triggerConfetti() {
        if (!this.settlePopupComponent || !this.confettiSpine) {
            return;
        }

        this.confettiSpine.node.active = true;
        this.confettiSpine.setAnimation(0, "show", false);
    }

    private initInteractiveGuide() {
        const storageKey = "mini_roulette_interactive_guide";
        const data = StorageManager.get(storageKey) ?? {
            enabled: true
        };

        if (!data.enabled || !this.interactiveGuidePrefab) {
            return;
        }

        const node = cc.instantiate(this.interactiveGuidePrefab);
        this.interactiveGuide.addChild(node);
        const tutorialMain = node.getComponent(MiniRouletteTutorialMain);
        tutorialMain.loadBetChips(this.gameConfigs);
        tutorialMain.setTimeConfig(TimerShowInteractiveGuide);
        tutorialMain.toggleCallback = (dontShow: boolean) => {
            data.enabled = !dontShow;
            StorageManager.set(storageKey, data);
        };

        tutorialMain.endSlideCallBack = () => {
            // this.handleStatusNodeMain(true);
        };
        tutorialMain.show();
    }

    setGameConfigs(gameConfigs: any) {
        super.setGameConfigs(gameConfigs);
        this.initInteractiveGuide();
    }
}
