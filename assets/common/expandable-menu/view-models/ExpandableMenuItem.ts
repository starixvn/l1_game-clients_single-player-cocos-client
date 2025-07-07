const { ccclass, property } = cc._decorator;
@ccclass
export default class ExpandableMenuItem extends cc.Component {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Button)
    button: cc.Button = null;

    private event = "";
    private emitter: cc.Node = null;

    hasEvent(event: string) {
        this.event = event;
        return this;
    }

    withEmitter(emitter: cc.Node) {
        this.emitter = emitter;
        return this;
    }

    onClick() {
        this.emitter.emit(this.event);
    }
}
