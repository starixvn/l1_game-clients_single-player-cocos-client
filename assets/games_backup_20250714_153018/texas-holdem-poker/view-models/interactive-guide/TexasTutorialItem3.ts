import TutorialItem from "../../../../common/tutorial/TutorialItem";
import * as i18n from "i18n/runtime-scripts/LanguageData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TexasTutorialItem3 extends TutorialItem {
    @property(cc.RichText)
    info: cc.RichText = null;

    swapButton: cc.Node = null;
    holdButton: cc.Node = null;

    show() {
        super.show();

        this.info.string = i18n.t("texasPoker.guideContentSlide3");
    }
}
