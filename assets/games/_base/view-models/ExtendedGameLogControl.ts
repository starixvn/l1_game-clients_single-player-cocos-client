import GameLogControlBase from "./GameLogControlBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExtendedGameLogControl extends GameLogControlBase {
    @property({ type: cc.Node, visible: false, override: true })
    items: cc.Node[] = [];

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    createDotNode(type: number) {
        return cc.instantiate(this.itemPrefab);
    }

    override update() {
        // show/hide next item by different way.
    }
}
