import GameUtils from "../GameUtils";
import StaticNode from "./StaticNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StaticGroup extends cc.Component {
    @property({ type: cc.Node })
    contents: cc.Node[] = [];

    @property(cc.Node)
    container: cc.Node = null;

    @property
    groupId = 0;

    @property({ type: cc.Node })
    dynamicRootNodes: cc.Node[] = [];

    private initialized = false;

    onLoad() {
        this.dynamicRootNodes.forEach((node) =>
            node.on(cc.Node.EventType.SCALE_CHANGED, () => {
                this.container.getComponentsInChildren(StaticNode).forEach((node) => node.node.active && node.updatePosition());
            })
        );
    }

    lateUpdate() {
        this.initForContents();
    }

    initForContents() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.schedule(this.scheduleMoveNodeToContainer, 0.1, cc.macro.REPEAT_FOREVER);
    }

    scheduleMoveNodeToContainer() {
        this.contents.forEach((child) => {
            this.moveNodeToContainer(child, this.container);
        });
    }

    moveNodeToContainer(content: cc.Node, container: cc.Node) {
        content.getComponent(cc.Layout)?.updateLayout();
        const staticNodes = content.getComponentsInChildren(StaticNode).filter((node) => node.groupId === this.groupId);
        staticNodes.forEach((staticNode) => {
            staticNode.init();
            GameUtils.moveToOtherNode(staticNode.node, container);
        });
    }
}
