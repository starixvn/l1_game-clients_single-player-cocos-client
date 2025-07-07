const { ccclass, property } = cc._decorator;

@ccclass
export default class ActiveItem extends cc.Component {
    @property({ type: cc.Node })
    items: cc.Node[] = [];

    onActive = () => {};

    onLoad() {
        this.initListeners();
    }

    onDestroy() {
        this.removeListeners();
    }

    initListeners() {
        this.items.forEach((node) => {
            node.on(cc.Node.EventType.TOUCH_START, this.onItemActive, this);
        });
    }

    removeListeners() {
        this.items.forEach((node) => {
            node.off(cc.Node.EventType.TOUCH_START, this.onItemActive, this);
        });
    }

    onItemActive() {
        this.onActive();
    }
}
