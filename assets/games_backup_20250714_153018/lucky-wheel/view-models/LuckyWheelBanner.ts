import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import LobbyDialogManager from "../../../managers/LobbyDialogManager";
import { SedieId } from "../../sedie/view-models/Sedie";

const { ccclass } = cc._decorator;

@ccclass
export default class LuckyWheelBanner extends cc.Component {
    private miniPanel: MiniPanel;

    onLoad() {
        this.miniPanel = appManager.miniPanel;
    }

    openSedie() {
        const dialog = this.node.getComponent(CommonDialog);
        dialog.closeDialog();
        this.miniPanel.openNewSocketTableGame(null, SedieId);
        uiManager.setCurrentGameId(SedieId);
    }

    onDisable() {
        this.node.destroy();
        uiManager.emitter.emit(InternalEvents.AFTER_LUCKY_WHEEL);
        LobbyDialogManager.getInstance().onCloseDialog();
    }
}
