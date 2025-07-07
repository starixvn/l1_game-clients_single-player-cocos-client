import NotificationItem from "./NotificationItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InternalGameNotification extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property({ type: cc.Prefab })
    itemPrefabs: cc.Prefab[] = [];

    @property
    expandedWidth = 350;

    @property
    collapsedWidth = 250;

    @property
    movingOffset = 50;

    readonly queue = [];
    readonly showDuration = 2;

    addNotification(data: any, type: number) {
        this.queue.push({ data, type });
        this.checkShowNext();
    }

    protected createNotification(queueData: { data: any; type: number }) {
        const { data, type } = queueData;
        const node = cc.instantiate(this.itemPrefabs[type]);
        this.content.addChild(node);
        const item = node.getComponent(NotificationItem);
        item.setData(data);

        node.opacity = 0;
        return node;
    }

    protected displayNotification(node: cc.Node) {
        cc.tween(node)
            .to(0.3, { opacity: 255 })
            .delay(this.showDuration)
            .to(0.1, { opacity: 0 })
            .call(() => {
                node.destroy();
                this.checkShowNext();
            })
            .start();
    }

    protected checkShowNext() {
        const validChildren = this.content.children.filter((child) => child.isValid);
        if (validChildren.length < 2) {
            this.showNext();
        }
    }

    protected showNext() {
        if (this.queue.length < 1) {
            return;
        }
        const duration = this.moveOtherItems();
        const data = this.queue.shift();
        const node = this.createNotification(data);
        this.scheduleOnce(() => {
            this.displayNotification(node);
        }, duration);
    }

    protected moveOtherItems() {
        const validChildren = this.content.children.filter((child) => child.isValid);
        const duration = 0.3;
        validChildren.forEach((child) => {
            cc.tween(child)
                .by(duration, { y: this.movingOffset })
                .call(() => {
                    if (child.y > 2 * this.movingOffset) {
                        child.destroy();
                    }
                })
                .start();
        });

        return validChildren.length > 0 ? duration : 0;
    }

    setWidthWhenCollapseSubGames() {
        this.node.width = this.collapsedWidth;
    }

    setWidthWhenExpandedSubGames() {
        this.node.width = this.expandedWidth;
    }
}
