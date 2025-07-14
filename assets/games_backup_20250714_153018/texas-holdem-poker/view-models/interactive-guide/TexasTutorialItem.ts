import * as i18n from "i18n/runtime-scripts/LanguageData";
import TutorialItem from "../../../../common/tutorial/TutorialItem";
import TexasTutorialMain from "./TexasTutorialMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TexasTutorialItem extends TutorialItem {
    @property(cc.Node)
    buttons: cc.Node = null;

    @property(cc.RichText)
    info: cc.RichText = null;

    md5Main: cc.Node;
    md5Node: cc.Node;
    hide() {
        super.hide();
        this.md5Main.opacity = 0;
        this.md5Node.opacity = 255;
        
    }

    show() {
        super.show();

        const parent = this.getParentNode();
        const tutorialMain = parent.getComponent(TexasTutorialMain);
        this.md5Node = tutorialMain.md5Node;
        this.md5Main = tutorialMain.md5Main;
        this.showOpacity(this.md5Main);
        this.info.string = i18n.t("texasPoker.guideIntro");
    }
}
