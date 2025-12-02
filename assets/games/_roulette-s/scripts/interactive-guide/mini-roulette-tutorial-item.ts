import TutorialItem from "../../../../common/tutorial/TutorialItem";
import AnimationUtils from "../../../../common/utils/AnimationUtils";
import MiniRouletteTutorialMain from "./mini-roulette-tutorial-main";
import { delayTime } from "../../../../utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRouletteTutorialItem extends TutorialItem {
    @property(cc.Node)
    nodeToolTips: cc.Node[] = [];

    @property
    isShowChip = false;

    private readonly delayTime = 1;
    protected itemTransitionTime = 0.6;
    nodeBetChip: cc.Node;

    onLoad() {
        this.nodeToolTips?.forEach((node) => {
            node.opacity = 0;
        });
    }

    onEnable() {
        const parent = this.getParentNode();
        if (!parent) {
            return;
        }
        const tutorialMain = parent.getComponent(MiniRouletteTutorialMain);
        const nodeBetChip = tutorialMain.betChipNode;
        nodeBetChip && (nodeBetChip.opacity = this.isShowChip ? 255 : 0);
    }

    async showGuidePage() {
        super.showGuidePage();
        if (!this.nodeToolTips || this.nodeToolTips.length === 0) {
            return;
        }
        await AnimationUtils.delayTime(0.2);
        for (let i = 0; i < this.nodeToolTips?.length; i++) {
            this.showOpacity(this.nodeToolTips[i]);
            await AnimationUtils.delayTime(this.delayTime);
        }
    }
}
