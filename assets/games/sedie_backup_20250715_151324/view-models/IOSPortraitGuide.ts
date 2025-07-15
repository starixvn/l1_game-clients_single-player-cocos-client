import SedieTutorial from "./SedieTutorial";

const { ccclass, property } = cc._decorator;

@ccclass
export default class IOSPortraitGuide extends SedieTutorial {
    storageKey = "IOS_portrait_guide";

    onClickClose() {
        this.playClick();
        this.node.destroy();
    }

    onClickDontShowAgain() {
        this.playClick();
        this.dontShowAgainCallback(true);
        this.node.destroy();
    }
}
