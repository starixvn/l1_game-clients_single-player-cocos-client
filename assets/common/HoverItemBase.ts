const { ccclass } = cc._decorator;

@ccclass
export default class HoverItemBase extends cc.Component {
    public callback = {
        highlight: (highlight: boolean) => {},
        selected: () => {}
    };

    public touchCallback = {
        onLeave: (e) => {},
        onMove: (e) => {}
    };

    onLoad() {
        this.registerEventListener();
    }

    onDestroy() {
        this.clearEvenListener();
    }

    registerEventListener() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onTouchCancel, this);
    }

    clearEvenListener() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onTouchCancel, this);
    }

    setHighlight(highlight: boolean) {
        this.callback.highlight(highlight);
    }

    onTouchMove(e) {
        this.touchCallback.onMove(e);
    }

    onTouchEnd(e) {
        this.touchCallback.onLeave(e);
    }

    onTouchCancel(e) {
        this.touchCallback.onLeave(e);
    }
}
