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
import RouletteHistory from "../roulette/view-models/RouletteHistory";
import RouletteWheel from "../roulette/view-models/RouletteWheel";
import MiniRouletteRoundHistory from "./scripts/mini-roulette-round-history";
import { RouletteGameData } from "./scripts/roulette-bet-game-data";
import RouletteBetItem from "./scripts/roulette-bet-item";
import { getTypeFromChoice } from "./scripts/roulette-s-utils";
import RouletteStatistics from "./scripts/roulette-statistics";
import SingleBetControl from "./scripts/single-bet-control";
import MiniRouletteSettlePopup from "./scripts/mini-roulette-settle-popup";

const { ccclass, property } = cc._decorator;

export class RouletteSConfig implements GameConfigBase {
    minBetTime = 1;
    fullTime = 59;
    betTime = 45;
    stopBetTime = 5;
    waitTime = 15;
}

@ccclass
export default class RouletteS extends SoloGame {
    @property(RouletteWheel)
    wheel: RouletteWheel = null;

    @property(cc.Node)
    rouletteBetItemsContainer: cc.Node = null;

    @property(cc.Button)
    btnSpin: cc.Button = null;

    @property(cc.Node)
    nodeInGameMenu: cc.Node = null;

    @property(cc.Prefab)
    roundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    roundHistoryContainer: cc.Node = null;

    @property(cc.Prefab)
    statisticPrefab: cc.Prefab = null;

    @property(cc.Node)
    settlePopup: cc.Node = null;

    private singleBetControl: SingleBetControl = null;

    private rouletteBetItems: RouletteBetItem[] = [];
    private roundHistoryComponent: MiniRouletteRoundHistory = null;

    private readonly BetChipsPositionShow = 0;
    private readonly BetChipsPositionHide = -300;

    private betChipsShowing = false;
    private chipFlyingStamp = 0;

    protected betChipContainer: cc.Node = null;
    private settlePopupComponent: MiniRouletteSettlePopup = null;

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
        super.onLoad();
    }

    protected onChangedBetChip(bet: number) {
        super.onChangedBetChip(bet);
        console.log("onChangedBetChip", bet);
        this.soloBetModel.setCurrentBet(bet);
    }

    initRouletteBetItems() {
        this.rouletteBetItems = this.rouletteBetItemsContainer.getComponentsInChildren(RouletteBetItem);

        this.rouletteBetItems.forEach((item) => {
            item.betCallback = this.onRouletteBetClick.bind(this);
            item.resetUI();
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
                const choice = data.betChoice;
                const nodeName = choice;
                const betItem = this.rouletteBetItems.find((item) => item.node.name === nodeName);
                if (betItem) {
                    this.chipFlyingStamp = Date.now();
                    this.betChips.throwChipThenConvertToStack(betItem.chipNode, this.currentBet, () => {
                        this.mergeStackOnChoice(choice, this.chipFlyingStamp);
                    });
                }
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
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.PLACE_BET_FAILED, () => () => {
            this.soloBetModel.changeState(SoloBetState.BETTING_FAILED);
        });

        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CHANGE_STATE, () => (state) => {
            this.onStateChange(state);
        });
        this.onStateChange(this.soloBetModel.state);
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
            case SoloBetState.BETTING:
                this.rouletteBetItems.forEach((item) => {
                    item.setHighlight(false);
                    item.setInactive(true);
                });
                this.roundHistoryComponent.setHighlight(false);
                break;
            case SoloBetState.RESULT:
                break;
            case SoloBetState.SETTLEMENT:
                break;
            default:
                break;
        }
    }

    updateSpinButtonInteractable() {
        const state = this.soloBetModel.state;
        const isStateCanBet = state === SoloBetState.READY || state === SoloBetState.BETTING_FAILED || state === SoloBetState.SETTLEMENT;
        this.btnSpin.interactable = this.soloBetModel.existBet() && isStateCanBet;
    }

    onRouletteBetClick(choice: string) {
        if (!this.checkAvailableBetChoices(choice, this.currentBet) || !this.checkAvailableBalance(this.currentBet)) {
            return;
        }

        this.soloBetModel.addBet(choice);
        this.onPlaceBet({ [choice]: this.currentBet });
    }

    protected createBetData(bet: any) {
        const betChoices = this.generateBetChoices(bet);
        cc.log("betChoices --- ", betChoices);
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
        this.wheel.hideResultNumber();
        this.singleBetControl.hideControl();

        const result = settlement.result;
        console.log("result --- ", settlement);
        try {
            await this.showWheelResult(result);
            AnimationUtils.delayTime(4).then(() => {
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

        this.rouletteBetItems.forEach((betItem) => {
            const choice = betItem.node.name;
            const type = getTypeFromChoice(choice);

            const settlementResult = settlement.settlementResult[type];
            const isSpecial = type === "column" || type === "dozen";
            const isWin = isSpecial ? settlementResult.includes(choice.slice(-1)) : settlementResult.includes(choice);
            betItem.setHighlight(isWin);
            this.roundHistoryComponent.setHighlight(true);
        });

        console.log("handleAfter", this.betWinAmount, this.soloBetModel.currentTotalBet());
        await AnimationUtils.delayTime(2);
        this.settlePopupComponent.showSettlementResult( this.betWinAmount, this.soloBetModel.currentTotalBet());
        
        AnimationUtils.delayTime(2).then(() => {
            this.settlePopupComponent.hideSettlementResult();
            this.rouletteBetItems.forEach((betItem) => {
                betItem.setInactive(false);
            });
        });
    }

    showWheelResult(result: number) {
        return new Promise<void>((resolve) => {
            this.wheel.showResult(result, () => {
                resolve();
            });
        });
    }

    checkAvailableBalance(amount: number): boolean {
        const total = this.soloBetModel.currentTotalBet();
        const available = total + amount <= userManager.balance;

        !available && this.showMiniWarning(i18n.t("messages.notEnoughMoney"));
        return available;
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

    checkExceedMaxBet(total: number): boolean {
        const maxBet = this.getMaxBet();
        if (total > maxBet) {
            this.showMiniWarning(i18n.t("messages.maxBetNotice", { maxBet: numberWithCommas(maxBet) }));
            return true;
        }
        return false;
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
        node.on(InGameMenuEvents.OPEN_STATISTIC, this.openStatistic, this);
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
        this.historyComponent = dialog.getComponent(RouletteHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }
}
