import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import PromotionTournamentHandler from "../../../lobby/promotions/PromotionTournamentHandler";
import LobbyDialogManager from "../../../managers/LobbyDialogManager";
const { ccclass } = cc._decorator;

@ccclass
export default class PromotionTournamentDialog extends CommonDialog {
    closeDialog(enableSound = true) {
        PromotionTournamentHandler.getInstance().onClosePromotionTournamentPopup();
        super.closeDialog(enableSound);
        LobbyDialogManager.getInstance().onCloseDialog();
    }
}
