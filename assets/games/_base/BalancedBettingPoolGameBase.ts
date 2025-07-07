import * as i18n from "i18n/runtime-scripts/LanguageData";
import * as _ from "lodash";

import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../analytics/AnalyticsManager";
import AudioManager from "../../common/audio/AudioManager";
import BetBoard, { BetInfo } from "../../common/bet-board/view-models/BetBoard";
import GameUtils from "../../common/GameUtils";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import PresetBet from "../../common/preset-bet/view-models/PresetBet";
import { userManager } from "../../common/user/UserManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { StorageManager } from "../../managers/StorageManager";
import SocketIOMiniGameBase from "./SocketIOMiniGameBase";
import BalancedBettingPoolBetItem from "./view-models/BalancedBettingPoolBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class BalancedBettingPoolGameBase extends SocketIOMiniGameBase {
    @property(cc.Node)
    betBoardContainer: cc.Node = null;

    @property(cc.Prefab)
    betBoardPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    presetBetPrefab: cc.Prefab = null;

    @property(cc.Node)
    balanceBetNoticeContainer: cc.Node = null;

    @property(cc.Prefab)
    balanceBetNoticePrefab: cc.Prefab = null;

    @property(cc.Node)
    historyButton: cc.Node = null;

    private presetBet: PresetBet;
    private betBoard: BetBoard;
    private presetBetValue = 0;
    private presetBetSettingKey: string;

    protected selectedBetAmountLabels: { [choice: string]: cc.Label };
    protected selectedBetAmountSprites: { [choice: string]: cc.Sprite };
    protected selectedBetAmountClickedImages: { [choice: string]: cc.SpriteFrame };
    protected selectedBetAmountUnClickedImages: { [choice: string]: cc.SpriteFrame };
    protected betPercentages: { [choice: string]: cc.Label };

    public totalBets: { [choice: string]: number };

    onLoad() {
        super.onLoad();

        this.presetBetPrefab && this.initPresetBetBoard();
        this.initBetBoard();

        uiManager.emitterListener(InternalEvents.USER_STAKE_LEVEL_UPDATED, this.updateBetBoard.bind(this), this);
    }

    onDestroy() {
        super.onDestroy();
        uiManager.removeListenersWithTarget(this);
    }

    onSelectBetChoiceClick(event: cc.Event, choice: string) {
        if (!this.gameConfigs) {
            return;
        }
        this.setSelectedBetAmountSpriteFrame(choice, true);
        const betInfo = {
            choice: choice,
            bet: 0,
            betItem: null,
            maxBet: () => this.getMaxBet()
        };
        this.betBoard.show(betInfo);
        this.betBoard.node.runAction(
            cc.sequence(
                cc.delayTime(0.05),
                cc.callFunc(() => {
                    SocketIOMiniGameBase.adjustPosition(this.betBoard, this.node);
                })
            )
        );
    }

    private initPresetBetBoard() {
        const node = cc.instantiate(this.presetBetPrefab);
        this.presetBet = node.getComponent(PresetBet);
        this.presetBet.onChangedBet = this.changedPresetBet.bind(this);
        this.presetBet.getPreset = this.getPresetBet.bind(this);
        this.node.addChild(node);
        node.active = false;

        this.presetBetSettingKey = `presetBet_${this.gameName}_${userManager.UID}`;
        const savedValue = StorageManager.get(this.presetBetSettingKey);
        this.presetBetValue = savedValue ? parseFloat(savedValue) : 0;

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            game_name: GameUtils.getGameNameString(this.gameId),
            action: TrackingAction.Show,
            object_name: "Preset Bet"
        });
    }

    private changedPresetBet(value: number) {
        this.presetBetValue = value;
        StorageManager.set(this.presetBetSettingKey, this.presetBetValue);
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            game_name: GameUtils.getGameNameString(this.gameId),
            action: TrackingAction.Click,
            object_name: "Preset Bet"
        });
    }

    private getPresetBet() {
        return this.presetBetValue;
    }

    protected initBetBoard() {
        const betBoardNode = cc.instantiate(this.betBoardPrefab);
        this.betBoard = betBoardNode.getComponent(BetBoard);
        this.betBoard.callback = {
            getPreset: this.getPresetBet.bind(this),
            acceptedBet: this.onAcceptedBet.bind(this),
            changedBet: this.onChangedBet.bind(this),
            cancel: this.onCancelBet.bind(this)
        };

        this.betBoardContainer && this.betBoardContainer.addChild(betBoardNode);
        this.betBoard.node.active = false;
    }

    updateDisplayForRemoteConfig() {
        super.updateDisplayForRemoteConfig();
        this.updateBetBoard();
    }

    updateBetBoard() {
        const values = GameUtils.getFilterValuesByStakeLevel(this.gameConfigs.chips, this.gameConfigs);
        this.betBoard && this.betBoard.setItems(values);
        this.presetBet && this.presetBet.setItems(values);
    }

    onAcceptedBet(info: BetInfo) {
        const { choice, bet } = info;

        this.resetSelectedBetAmountLabel(choice);
        this.setSelectedBetAmountSpriteFrame(choice, false);

        if (!this.validateBet()) {
            return;
        }

        this.sendBetRequest(choice, bet);
    }

    onChangedBet(info: BetInfo) {
        const { bet, choice } = info;
        const maxBet = this.getMaxBet();
        const betAmount = bet > maxBet ? maxBet : bet;
        const selectedBetAmountLabel = this.selectedBetAmountLabels[choice];
        selectedBetAmountLabel.string = numberWithCommas(betAmount);
    }

    onCancelBet(info: BetInfo) {
        const { choice } = info;
        this.resetSelectedBetAmountLabel(choice);
        this.setSelectedBetAmountSpriteFrame(choice, false);
    }

    resetSelectedBetAmountLabel(choice: string) {
        const selectedBetAmountLabel = this.selectedBetAmountLabels[choice];
        selectedBetAmountLabel.string = i18n.t(`ui.input_bet`).toUpperCase();
    }

    setSelectedBetAmountSpriteFrame(choice: string, isClicked: boolean) {
        const selectedBetAmountSprite = this.selectedBetAmountSprites[choice];
        selectedBetAmountSprite.spriteFrame = isClicked
            ? this.selectedBetAmountClickedImages[choice]
            : this.selectedBetAmountUnClickedImages[choice];
    }

    validateBet() {
        if (!this.isReadyBet()) {
            return false;
        }

        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
            return false;
        } else {
            this.lockBet();
            return true;
        }
    }

    sendBetRequest(choice: string, amount: number) {
        const betData = {
            amount: amount,
            betChoice: choice,
            clientSentTime: new Date()
        };
        this.sendSocketData("bet", betData);
    }

    openPresetBetDialog() {
        AudioManager.getInstance().playClick();
        this.presetBet.toggle();
    }

    showBetPercentage(choice: string, percent: number) {
        const label = this.betPercentages[choice];
        label.string = `${percent}%`;
    }

    resetDataAndUI() {
        super.resetDataAndUI();

        _.values(this.betPercentages).forEach((label) => {
            label.string = "0%";
        });
        this.hideBalanceBetNotice();
    }

    balanceBet(animated: boolean) {
        this.disableHistoryButton();
        const totalBets = _.values(this.totalBets);
        const balancedBetAmount = Math.min(...[totalBets[0] ?? 0, totalBets[1] ?? 0]);
        this.betItems.forEach((item) => (item as BalancedBettingPoolBetItem).balanceBet(GameUtils.getValueByCurrency(balancedBetAmount)));
    }

    showBalanceBetNotice() {
        const balanceBetNotice = cc.instantiate(this.balanceBetNoticePrefab);
        this.balanceBetNoticeContainer.addChild(balanceBetNotice);
        this.disableHistoryButton();
        this.balanceBet(true);
    }

    hideBalanceBetNotice() {
        this.balanceBetNoticeContainer.destroyAllChildren();
    }

    closeGame() {
        super.closeGame();
        this.betBoard && this.betBoard.close();
        this.presetBet && this.presetBet.forceClose();
    }

    enableHistoryButton() {
        this.historyButton.opacity = 255;
        const button = this.historyButton.getComponent(cc.Button);
        button.interactable = true;
    }

    disableHistoryButton() {
        this.historyButton.opacity = 130;
        const button = this.historyButton.getComponent(cc.Button);
        button.interactable = false;
    }
}
