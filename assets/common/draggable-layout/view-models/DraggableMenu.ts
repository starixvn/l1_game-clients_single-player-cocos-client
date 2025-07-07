import ExpandableMenu from "../../expandable-menu/view-models/ExpandableMenu";
import SafeDraggableItem from "./SafeDraggableItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DraggableMenu extends SafeDraggableItem {
    private expandableMenu: ExpandableMenu = null;
    onLoad() {
        super.onLoad();
        this.expandableMenu = this.node.getComponent(ExpandableMenu);
    }
    onTouchEnd(e) {
        super.onTouchEnd(e);
        if (this.isClicked(e) && this.expandableMenu) {
            this.expandableMenu.onMenuClick();
        }
    }
}
