const { ccclass, property } = cc._decorator;

@ccclass
export default class TabMenu extends cc.Component {
    @property(cc.Node)
    selectedNode: cc.Node = null;

    @property(cc.Node)
    unselectedNode: cc.Node = null;

    @property(cc.Node)
    text: cc.Node = null;

    select() {
        this.unselectedNode.active = false;
        this.selectedNode.active = true;
        this.text.color = cc.Color.BLACK;
        this.node.pauseSystemEvents(true);
    }

    unselect() {
        this.unselectedNode.active = true;
        this.selectedNode.active = false;
        this.text.color = cc.Color.WHITE;
        this.node.resumeSystemEvents(true);
    }
}
