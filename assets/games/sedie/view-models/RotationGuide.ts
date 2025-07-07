import SedieTutorial from "./SedieTutorial";

const { ccclass } = cc._decorator;

@ccclass
export default class RotationGuide extends SedieTutorial {
    private isHideIntro;
    storageKey = "rotation_guide";

    onLoad() {
        this.scheduleOnce(() => {
            const data = this.getLocalStorageData();
            if (data.enabled) {
                this.closeIntroduction();
            }
        }, 6);
    }

    onClickOK() {
        this.playClick();
        this.closeIntroduction();
    }

    closeIntroduction() {
        this.isHideIntro = true;
        this.dontShowAgainCallback(this.isHideIntro);
        this.node.destroy();
    }
}
