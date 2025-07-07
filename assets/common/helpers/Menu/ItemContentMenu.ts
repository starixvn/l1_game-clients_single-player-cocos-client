const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemContentMenu extends cc.Component {
    @property(cc.Node)
    nodeUnSelect: cc.Node = null;

    @property(cc.Node)
    nodeSelect: cc.Node = null;

    @property(cc.Node)
    text: cc.Node = null;

    select() {
        this.nodeUnSelect.active = false;
        this.nodeSelect.active = true;
        this.text.color = cc.Color.WHITE;
        this.node.pauseSystemEvents(true);
    }

    unselect() {
        this.nodeUnSelect.active = true;
        this.nodeSelect.active = false;
        this.text.color = cc.Color.WHITE.fromHEX("#a2a2a2");
        this.node.resumeSystemEvents(true);
    }
}
