import NewCard from "../../../../common/new-card/view-models/NewCard";
import TutorialMain from "../../../../common/tutorial/TutorialMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TexasTutorialMain extends TutorialMain {
    @property({ type: NewCard })
    dealerCards: NewCard[] = [];

    @property({ type: NewCard })
    playerCards: NewCard[] = [];

    @property(cc.Node)
    swapButton: cc.Node = null;

    @property(cc.Node)
    holdButton: cc.Node = null;

    @property(cc.Node)
    callButton: cc.Node = null;

    @property(cc.Node)
    foldButton: cc.Node = null;

    @property(cc.Node)
    md5Node: cc.Node = null;

    @property(cc.Node)
    md5Main: cc.Node = null;

    @property(cc.Node)
    menuMain: cc.Node = null;

    onLoad() {
        super.onLoad();
        this.md5Main.opacity = 0;
        this.menuMain.opacity = 0;
    }
}
