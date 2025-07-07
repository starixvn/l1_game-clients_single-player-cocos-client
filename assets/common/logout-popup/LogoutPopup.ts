import AudioManager from "../audio/AudioManager";
import { redirectToLoginPage } from "../auth/SGConnectAPI";
import CommonDialog from "../_base/view-models/CommonDialog";
import { getLocale } from "../auth/SessionManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LogoutPopup extends cc.Component {
    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    onLoad() {
        if (this.commonDialog) {
            this.commonDialog.addOnDidHide(() => {
                this.node.destroy();
            });
        }
    }

    public logout() {
        AudioManager.getInstance().playClick();
        redirectToLoginPage(getLocale());
    }
}
