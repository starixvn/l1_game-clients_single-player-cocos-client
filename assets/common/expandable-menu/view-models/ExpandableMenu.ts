import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import AudioManager from "../../audio/AudioManager";
import { MenuDirectionType } from "./MenuDirectionType";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExpandableMenu extends cc.Component {
    @property(cc.Node)
    expandableNode: cc.Node = null;

    @property
    defaultExpand = false;

    @property(cc.Node)
    blockInputNode: cc.Node = null;

    protected expanded = false;
    menuDirection = MenuDirectionType.BOTTOM;

    onLoad() {
        if (this.defaultExpand) {
            this.expandMenu();
        } else {
            this.collapseMenu(false);
        }
    }

    setDirection(direction: MenuDirectionType) {
        this.menuDirection = direction;
    }

    collapseMenu(animated = true) {
        this.expanded = false;

        if (this.blockInputNode) {
            this.blockInputNode.active = false;
        }

        if (!animated) {
            this.expandableNode.opacity = 0;
            this.expandableNode.scaleY = 0;
            return;
        }
        this.handleDirectionWhenCollapedMenu();
    }

    expandMenu() {
        this.expanded = true;
        if (this.blockInputNode) {
            this.blockInputNode.active = true;
        }
        this.handleDirectionWhenExpandableMenu();
    }

    onMenuClick() {
        AudioManager.getInstance().playClick();
        uiManager.emitter.emit(InternalEvents.CLICK_HAMBURGER_MENU);
        this.expanded = !this.expanded;
        this.expanded ? this.expandMenu() : this.collapseMenu();
    }

    handleDirectionWhenExpandableMenu() {
        this.expandableNode.stopAllActions();
        switch (this.menuDirection) {
            case MenuDirectionType.LEFT:
                break;
            case MenuDirectionType.RIGHT:
                break;
            case MenuDirectionType.TOP:
                break;
            case MenuDirectionType.BOTTOM:
                cc.tween(this.expandableNode).to(0.2, { opacity: 255, scale: 1 }).start();
                break;
            default:
                break;
        }
    }

    handleDirectionWhenCollapedMenu() {
        this.expandableNode.stopAllActions();
        switch (this.menuDirection) {
            case MenuDirectionType.LEFT:
                break;
            case MenuDirectionType.RIGHT:
                break;
            case MenuDirectionType.TOP:
                break;
            case MenuDirectionType.BOTTOM:
                cc.tween(this.expandableNode).to(0.2, { opacity: 0, scaleY: 0 }).start();
                break;
            default:
                break;
        }
    }

    setWidgetForBlockInput(target: cc.Node) {
        const blockInputWidget = this.blockInputNode.getComponent(cc.Widget);
        blockInputWidget.target = target;
        blockInputWidget.top = 0;
        blockInputWidget.bottom = 0;
        blockInputWidget.left = 0;
        blockInputWidget.right = 0;
    }
}
