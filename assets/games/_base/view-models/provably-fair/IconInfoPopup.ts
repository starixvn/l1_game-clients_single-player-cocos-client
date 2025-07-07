import { i18n } from "../../../../ClientModules";
import AnimationUtils from "../../../../common/utils/AnimationUtils";
import { CrossControlItem } from "./CrossControlItem";

const { ccclass, property } = cc._decorator;

@ccclass
export class IconInfoPopup extends cc.Component {
    @property(cc.Node)
    nodeTooltip: cc.Node = null;

    @property(cc.Label)
    lblContent: cc.Label = null;

    @property
    keyText = "";

    onLoad() {
        const crossControlItem = this.getComponentInChildren(CrossControlItem);
        if (crossControlItem) {
            crossControlItem.registerListenerOtherControls(() => this.hideTooltipComp());
        }
    }

    hideTooltipComp() {
        this.nodeTooltip.active = false;
    }

    showTooltipComp() {
        this.nodeTooltip.active = true;
    }

    setDisplayTooltip(show: boolean) {
        this.nodeTooltip.active = show;
    }

    clickInfoIcon() {
        this.nodeTooltip.active = !this.nodeTooltip.active;
        this.setContentTooltip(this.keyText);
    }

    setContentTooltip(key: string) {
        this.lblContent.string = i18n.t(key);
        AnimationUtils.fadeIn(this.lblContent.node, 0.3);
    }
}
