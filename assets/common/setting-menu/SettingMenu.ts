import CommonDialog from "../_base/view-models/CommonDialog";
import AudioManager from "../audio/AudioManager";
import { AppTypes } from "../auth/AuthManager";
import ExpandableMenu from "../expandable-menu/view-models/ExpandableMenu";
const { ccclass, property } = cc._decorator;

export enum SettingMenuEvents {
    LOGOUT = "LOGOUT"
}

@ccclass
export default class SettingMenu extends cc.Component {
    @property(ExpandableMenu)
    expandableMenu: ExpandableMenu = null;

    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    @property(cc.Node)
    logoutButton: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    onLoad() {
        if (this.commonDialog) {
            this.commonDialog.addOnDidHide(() => {
                this.node.destroy();
            });
        }

        if (window.authData?.system !== AppTypes.SabaApp && this.logoutButton) {
            this.logoutButton.active = false;
            this.bgNode.height = 300;
        }
    }

    protected doCommons() {
        AudioManager.getInstance().playClick();
    }

    collapseMenu(animated: boolean) {
        // handle
    }

    onClickLogout() {
        this.doCommons();
        this.node.emit(SettingMenuEvents.LOGOUT);
    }
}
