const { ccclass, property } = cc._decorator;

@ccclass
export default class ExtendTouchPart extends cc.Component {
    public listener = {
        eventStart: (e) => { },
        eventMove: (e) => { },
        eventEnd: () => { },
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.eventStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.eventEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.eventEnd, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.eventStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.eventEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.eventEnd, this);
    }

    eventStart(e) {
        this.listener.eventStart(e);
    }
    eventMove(e) {
        this.listener.eventMove(e);

    }
    eventEnd() {
        this.listener.eventEnd();
    }
}
