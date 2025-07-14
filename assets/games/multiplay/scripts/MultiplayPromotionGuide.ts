import SedieTutorial from "../../sedie/view-models/SedieTutorial";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplayPromotionGuide extends SedieTutorial {
    @property(cc.Node)
    withText: cc.Node = null;

    storageKey = "";
    private data;

    onLoad() {
        this.withText.active = window.i18n.curLang === "vi";
    }

    showGuide() {
        this.data = this.getLocalStorageData();
        if (!this.data.enabled) {
            return;
        }
        this.node.active = true;
        const anim = this.node.getComponent(cc.Animation);
        anim.playAdditive();
    }

    hideGuide() {
        this.node.active = false;
    }

    closeIntroduction() {
        this.hideGuide();
        this.data.enabled = false;
        this.setLocalStorageData(this.data);
    }
}
