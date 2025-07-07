import * as i18n from "i18n/runtime-scripts/LanguageData";

import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../analytics/AnalyticsManager";
import AnimatedTime from "../../common/animated-time/view-models/AnimatedTime";
import AudioManager from "../../common/audio/AudioManager";
import BetChipsNew from "../../common/bet-chips/view-models/BetChipsNew";
import NewButton from "../../common/custom-button/NewButton";
import GameUtils from "../../common/GameUtils";
import { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import InGameSwapMenu from "../../common/in-game-menu/InGameSwapMenu";
import DataHandler from "../_base/handlers/DataHandler";
import BetItem from "../_base/view-models/BetItem";
import RoomPlayer from "../_base/view-models/RoomPlayer";
import NewGameRoomBase from "../_new/_base/NewGameRoomBase";
import { events } from "../_new/connection/SocketIOConnection";
import CasinoMD5 from "./CasinoMD5";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CasinoGame extends NewGameRoomBase {
    @property({ visible: false, override: true })
    betItems: BetItem[] = [];

    @property({ visible: false, override: true })
    players: RoomPlayer[] = [];

    @property({ visible: false, override: true })
    timeWaitNode: cc.Node = null;

    @property({ visible: false, override: true })
    timeWaitLabel: cc.Label = null;

    @property({ visible: false, override: true })
    animatedTime: AnimatedTime = null;

    @property({ visible: false, override: true })
    otherPlayers: cc.Node = null;

    @property({ visible: false, override: true })
    gameAudiosPrefab: cc.Prefab = null;

    @property(cc.Node)
    doubleButton: cc.Node = null;

    @property(cc.Node)
    reBetAndDealButton: cc.Node = null;

    @property(cc.Node)
    cancelButton: cc.Node = null;

    @property(cc.Node)
    dealButton: cc.Node = null;

    @property(cc.Node)
    foldButton: cc.Node = null;

    @property(cc.Node)
    newButton: cc.Node = null;

    @property(cc.Node)
    swapButton: cc.Node = null;

    @property(cc.Node)
    holdButton: cc.Node = null;

    @property(cc.SpriteFrame)
    shadowChip: cc.SpriteFrame = null;

    @property(cc.Node)
    dealerChipTray: cc.Node = null;

    @property(cc.Node)
    swapCardsNode: cc.Node = null;

    @property(cc.Label)
    totalBetLabel: cc.Label = null;

    md5Component: CasinoMD5 = null;

    @property(cc.AudioSource)
    gameNotificationsAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    singleChipAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    startNewRoundAudio: cc.AudioSource = null;

    betChips: BetChipsNew;
    protected isSwapCard = true;
    protected statusShowSwapIcon = false;

    onGameHide() {
        // onGameHide
        this.isGameHide = true;
    }

    onLoad() {
        super.onLoad();
    }

    protected addHandlers(...handlers: DataHandler[]): void {
        super.addHandlers(this.umHandler, this.noticeHandler, this.errorHandler, this.betHandler, this.voidTicketHandler);
    }

    public disabledButtons(status: boolean) {
        const disableButton = "btn-disable";
        this.dealButton.getChildByName(disableButton).active = status;
        this.cancelButton.getChildByName(disableButton).active = status;
        this.doubleButton.getChildByName(disableButton).active = status;
        this.reBetAndDealButton.getChildByName(disableButton).active = status;
        this.foldButton.getChildByName(disableButton).active = status;
        this.newButton.getChildByName(disableButton).active = status;
        this.swapButton.getChildByName(disableButton).active = status;
        this.holdButton.getChildByName(disableButton).active = status;
    }

    public initButtonStatus() {
        const disableButton = "btn-disable";
        this.dealButton.getComponent(NewButton).callback.selected = () =>
            !this.dealButton.getChildByName(disableButton).active && this.onDealClick();

        this.doubleButton.getComponent(NewButton).callback.selected = () =>
            !this.doubleButton.getChildByName(disableButton).active && this.onDoubleClick();

        this.cancelButton.getComponent(NewButton).callback.selected = () =>
            !this.cancelButton.getChildByName(disableButton).active && this.onCancelClick();

        this.reBetAndDealButton.getComponent(NewButton).callback.selected = () =>
            !this.reBetAndDealButton.getChildByName(disableButton).active && this.onRebetAndDeal();

        this.foldButton.getComponent(NewButton).callback.selected = () =>
            !this.foldButton.getChildByName(disableButton).active && this.onFoldClick();

        this.newButton.getComponent(NewButton).callback.selected = () =>
            !this.newButton.getChildByName(disableButton).active && this.onNewButtonClick();

        this.swapButton.getComponent(NewButton).callback.selected = () =>
            !this.swapButton.getChildByName(disableButton).active && this.onSwapClick();

        this.holdButton.getComponent(NewButton).callback.selected = () =>
            !this.holdButton.getChildByName(disableButton).active && this.onHoldClick();
    }

    trackSwapButtonShow() {
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            game_name: GameUtils.getGameNameString(this.gameId),
            action: TrackingAction.Show,
            object_name: "Swap Card"
        });
    }

    sendRetryMessage(): void {
        this.connection.emit("retry");
    }

    protected hideButtonPrepareNewRound() {
        this.reBetAndDealButton.active = this.newButton.active = false;
    }

    public getConfigs() {
        this.connection.emit(events.getGameConfigs);
    }

    playStartGameAudio() {
        AudioManager.getInstance().playSFX(this.startNewRoundAudio.clip);
    }

    set disableIconSwap(value: boolean) {
        this.statusShowSwapIcon = value;
    }

    onIconSwapClick() {
        if (!this.statusShowSwapIcon) {
            this.isSwapCard = !this.isSwapCard;
            const inGameMenuHasSwap = this.inGameMenu as InGameSwapMenu;
            inGameMenuHasSwap.swapComp.setSwapStatus(!this.isSwapCard);
            this.isSwapCard
                ? this.showMiniWarning(i18n.t("texasPoker.swapCardOn"))
                : this.showMiniWarning(i18n.t("texasPoker.swapCardOff"));
        }
    }

    protected handleDisableSwap(isDisable: boolean) {
        this.disableIconSwap = isDisable;
        const inGameMenuHasSwap = this.inGameMenu as InGameSwapMenu;
        isDisable ? inGameMenuHasSwap.swapComp.setDisable() : inGameMenuHasSwap.swapComp.setEnable();
    }

    initEventForInGameMenu() {
        const node = super.initEventForInGameMenu();
        node.on(InGameMenuEvents.CHANGE_SWAP_CARD, this.onIconSwapClick, this);
        return node;
    }

    onDealClick() {
        this.playClick();
        this.handleDisableSwap(true);
    }

    onDoubleClick() {
        this.playClick();
    }

    onCancelClick() {
        this.playClick();
        this.handleDisableSwap(false);
    }

    onRebetAndDeal() {
        this.playClick();
        this.handleDisableSwap(true);
        this.clearWinningBet();
        this.hideButtonPrepareNewRound();
    }

    onFoldClick() {
        this.playClick();
    }

    onNewButtonClick() {
        this.playClick();
        this.hideButtonPrepareNewRound();
        this.clearWinningBet();
    }

    onSwapClick() {
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            game_name: GameUtils.getGameNameString(this.gameId),
            action: TrackingAction.Click,
            object_name: "Swap Card"
        });
        this.playClick();
    }

    onHoldClick() {
        this.playClick();
    }
}
