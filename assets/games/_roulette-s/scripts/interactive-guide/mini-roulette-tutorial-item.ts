import TutorialItem from "../../../../common/tutorial/TutorialItem";
import AnimationUtils from "../../../../common/utils/AnimationUtils";
import MiniRouletteTutorialMain from "./mini-roulette-tutorial-main";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRouletteTutorialItem extends TutorialItem {
    @property(cc.Node)
    nodeToolTips: cc.Node[] = [];

    @property
    isShowChip = false;

    nodeBetChip: cc.Node;

    onLoad() {
        this.nodeToolTips.forEach((node) => {
            node.opacity = 0;
        });
        // this.nodeBetChip.active = false;
    }

    onEnable() {
        const parent = this.getParentNode();
        const tutorialMain = parent.getComponent(MiniRouletteTutorialMain);
        this.nodeBetChip = tutorialMain.betChipNode;
        this.nodeBetChip.opacity = this.isShowChip ? 255 : 0;
    }

    async show() {
        super.show();
        await AnimationUtils.delayTime(0.2);
        for (let i = 0; i < this.nodeToolTips.length; i++) {
            this.showOpacity(this.nodeToolTips[i]);
            await AnimationUtils.delayTime(0.6);
        }
    }
}
