import { uiManager } from "../managers/GameUIManager";
import { InternalEvents } from "../managers/InternalEvents";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NestedScrollView extends cc.ScrollView {
    private moveStartPos: cc.Vec2;

    onLoad() {
        this.content.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.content.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        this.content.on(cc.Node.EventType.TOUCH_CANCEL, this.handleReleaseTouch, this, true);
    }

    onDestroy() {
        this.content.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.content.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        this.content.off(cc.Node.EventType.TOUCH_CANCEL, this.handleReleaseTouch, this, true);
    }

    onEnable() {
        super.onEnable();
        this.enabled = true;
    }

    onTouchStart(e) {
        this.moveStartPos = e.getLocation();
    }

    handleReleaseTouch(e) {
        uiManager.emitter.emit(InternalEvents.SCROLL_NESTED_SCROLLVIEW, false);
    }

    onTouchMove(e) {
        e.stopPropagation();
        const location = e.getLocation();
        const xDelta = location.x - this.moveStartPos.x;
        const yDelta = location.y - this.moveStartPos.y;
        if (this.vertical) {
            if (Math.abs(xDelta) > Math.abs(yDelta)) {
                this.enabled = false;
            } else {
                this.enableScrollView(e);
            }
        } else {
            if (Math.abs(xDelta) < Math.abs(yDelta)) {
                this.enabled = false;
            } else {
                this.enableScrollView(e);
            }
        }
    }

    enableScrollView(e) {
        this.enabled = true;
        uiManager.emitter.emit(InternalEvents.SCROLL_NESTED_SCROLLVIEW, true);
    }
}
