import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { StorageManager } from "../../../managers/StorageManager";
import FreeSpinsPromotionHandler, { freeSpinsPromotionHandler } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../../analytics/AnalyticsManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import LobbyDialogManager from "../../../managers/LobbyDialogManager";
import * as sessionManager from "../../../common/auth/SessionManager";
import { appManager } from "../../../managers/AppManager";
import GameUtils from "../../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass("FreeSpinsPromotionDialog")
export default class FreeSpinsPromotionDialog extends CommonDialog {
    @property(cc.Toggle)
    dontShowAgainToggle: cc.Toggle = null;
    @property(cc.Label)
    gameNameLabel: cc.Label = null;

    @property(cc.Node)
    playLaterNode: cc.Node = null;

    private readonly TRACKING_OBJECT_NAME = "Free spins promotion";

    onChangeToggleDontShowAgain(toggle: cc.Toggle) {
        const isChecked = toggle.isChecked;
        StorageManager.set(freeSpinsPromotionHandler.getStorageKey(), { dontShowAgain: isChecked });
    }
    async start() {
        const storage = StorageManager.get(freeSpinsPromotionHandler.getStorageKey());
        if (storage && typeof storage.dontShowAgain === "boolean") {
            this.dontShowAgainToggle.isChecked = storage.dontShowAgain;
        }

        await this.setGameName();
        if (freeSpinsPromotionHandler.isDirectlyOpen) {
            this.playLaterNode.active = true;
        }
    }

    async setGameName() {
        const gameId = freeSpinsPromotionHandler.getGameId();
        this.gameNameLabel.string = await GameUtils.getDisplayGameName(gameId);
    }

    closeDialog(enableSound = true) {
        const isChecked = this.dontShowAgainToggle?.isChecked;
        if (isChecked) {
            StorageManager.set(freeSpinsPromotionHandler.getStorageKey(), { dontShowAgain: true });
        }
        super.closeDialog(enableSound);
        LobbyDialogManager.getInstance().onCloseDialog();
        FreeSpinsPromotionHandler.getInstance().onCloseFreeSpinsPromotionPopup();
    }

    playGameNow() {
        LobbyDialogManager.getInstance().clearQueue();
        this.closeDialog();
        appManager.hasShowedCenterBanner = true;
        const gameId = freeSpinsPromotionHandler.getGameId();
        sessionManager.setCheckedTournamentPromotionFirstSso(true);
        if (!gameId) {
            cc.warn("FreeSpinsPromotionHandler: gameId is not available.");
            return;
        }

        uiManager.emitter.emit(InternalEvents.OPEN_GAME, gameId);

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }
}
