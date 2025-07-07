import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../analytics/AnalyticsManager";
import CommonDialog from "../../common/_base/view-models/CommonDialog";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import LobbyDialogManager from "../../managers/LobbyDialogManager";
import { StorageManager } from "../../managers/StorageManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CenterBanner extends cc.Component {
    @property(cc.Sprite)
    banner: cc.Sprite = null;

    @property(cc.Toggle)
    toggleDontShowAgain: cc.Toggle = null;

    private dialog: CommonDialog = null;
    private storageKey = "";
    private gameId = 0;

    private readonly TRACKING_OBJECT_NAME = "Center Banner";

    onLoad() {
        this.dialog = this.getComponentInChildren(CommonDialog);
        this.dialog.addOnDidHide(() => {
            this.node.destroy();
        });

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Show,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }

    init(gameId: number, spriteFrame: cc.SpriteFrame, storageKey: string) {
        this.gameId = gameId;
        this.storageKey = storageKey;
        this.banner.spriteFrame = spriteFrame;
    }

    onChangeToggleDontShowAgain(toggle: cc.Toggle) {
        const storage = StorageManager.get(this.storageKey) ?? {};
        if (storage) {
            storage[this.gameId] = toggle.isChecked;
            StorageManager.set(this.storageKey, storage);
        }

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: toggle.isChecked ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }

    closeBanner() {
        this.dialog.closeDialog(true);
        LobbyDialogManager.getInstance().onCloseDialog();
    }

    playNow() {
        this.closeBanner();
        uiManager.emitter.emit(InternalEvents.OPEN_GAME, this.gameId);
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }
}
