import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import BettingArea, { BettingAreaEvents } from "../../_new/common/betting-area/BettingArea";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";

const { ccclass, menu, property } = cc._decorator;

export enum HoldemPokerThemes {
    NORMAL = 0,
    HIGHLIGHT
}

@ccclass
export default class HoldemPokerBettingArea extends BettingArea {
    @property(cc.String)
    betChoice = "";

    @property(cc.Node)
    chipNode: cc.Node = null;

    @property(cc.Node)
    tooltipPlaceBet: cc.Node = null;

    @property(cc.Node)
    clearBetIcon: cc.Node = null;

    @property(cc.Node)
    betHightLight: cc.Node = null;

    @property(cc.Node)
    betText: cc.Node = null;

    @property(cc.Label)
    winningAmount: cc.Label = null;

    private isRunningHighlight: boolean;
    protected gameData: HoldemPokerGameData = null;

    init(gameData: HoldemPokerGameData) {
        this.gameData = gameData;
    }

    onLoad() {
        this.theme = HoldemPokerThemes.NORMAL;
        this.isRunningHighlight = false;
    }

    placingBet() {
        this.node.emit(BettingAreaEvents.PLACING_BET, this.betChoice);
    }

    highlight() {
        this.theme = HoldemPokerThemes.HIGHLIGHT;
    }

    hideHighLight() {
        this.theme = HoldemPokerThemes.NORMAL;
    }

    showTooltip(isShow: boolean) {
        this.tooltipPlaceBet.active = isShow;
        this.betHightLight.active = isShow;
    }

    showBetValue(show: boolean) {
        this.ownBetsLabel && (this.ownBetsLabel.node.parent.active = show);
    }

    showClearIcon(show: boolean) {
        this.clearBetIcon && (this.clearBetIcon.active = show);
    }

    onClearIcon() {
        if (this.clearBetIcon) {
            this.gameData.receiveUIData({ clear: { choice: this.betChoice } });
            this.clearBetIcon.active = false;
        }

        this.showBetValue(false);
        this.showBetText(true);
    }

    set ownBets(value: number) {
        if (this.ownBetsLabel) {
            this.ownBetsLabel.string = numberWithCommas(value);
        }
    }

    showBetText(show: boolean) {
        this.betText && (this.betText.active = show);
    }

    handleWinningAmount(value: number, show: boolean) {
        if (this.winningAmount) {
            this.winningAmount.string = `+${numberWithCommas(value)}`;
            this.winningAmount.node.active = show;
        }
    }
}
