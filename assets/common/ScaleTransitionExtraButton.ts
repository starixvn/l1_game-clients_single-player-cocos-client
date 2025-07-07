
const { ccclass, property } = cc._decorator;

@ccclass
export default class ScaleTransitionExtraButton extends cc.Component {
    @property
    zoomScale = 1.2;

    @property
    duration = 0.1;

    private button: cc.Button = null;
    private originalScale = 1;
    private readonly UNSCALED_TAG = 1;
    private readonly SCALED_TAG = 2;

    onLoad() {
        this.button = this.getComponent(cc.Button);
        this.originalScale = this.node.scale;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    isButtonDisabled() {
        return !this.button || !this.button.interactable;
    }

    onDestroy() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    zoomIn() {
        if (this.node.getActionByTag(this.SCALED_TAG) || this.node.scale === this.zoomScale) {
            return;
        }
        const action = cc.scaleTo(this.duration, this.zoomScale);
        action.setTag(this.SCALED_TAG);
        this.node.runAction(action);
    }

    zoomOut() {
        if (this.node.getActionByTag(this.UNSCALED_TAG) || this.node.scale === this.originalScale) {
            return;
        }
        const action = cc.scaleTo(this.duration, this.originalScale);
        action.setTag(this.UNSCALED_TAG);
        this.node.runAction(action);
    }

    onTouchMove(e) {
        if (this.isButtonDisabled()) {
            this.zoomOut();
            return;
        }
        const location = e.touch.getLocation();
        const hit = this.node._hitTest(location);
        if (hit) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }

    onTouchCancel() {
        this.zoomOut();
    }
}
