const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class MiniRoundHistoryItem extends cc.Component {

    public data: any = {};

    public abstract setData(data: any);

    public listener = {
        onEnter: (node: cc.Node) => { },
        onLeave: (node: cc.Node) => { },
    }

    onEnable() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this.eventOnEnter, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.eventOnLeave, this);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.MOUSE_ENTER, this.eventOnEnter, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.eventOnLeave, this);
    }

    eventOnEnter() {
        this.listener.onEnter(this.node);
    }

    eventOnLeave() {
        this.listener.onLeave(this.node);
    }
}
