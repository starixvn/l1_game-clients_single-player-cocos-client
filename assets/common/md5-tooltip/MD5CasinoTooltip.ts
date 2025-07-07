import MD5Tooltip from "./MD5Tooltip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MD5CasinoTooltip extends MD5Tooltip {
    @property(cc.Node)
    blockInputNode: cc.Node = null;

    eventOnTouchStart() {
        super.eventOnTouchStart();
        this.blockInputNode.active = true;
    }

    hideToolTip() {
        super.hideToolTip();
        this.blockInputNode.active = false;
    }
}
