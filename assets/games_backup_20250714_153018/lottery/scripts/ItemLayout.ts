import GameUtils from "../../../common/GameUtils";
import LabelItem from "./LabelItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemLayout extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    numberItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    otherItemPrefab: cc.Prefab = null;

    updateItems(items: string[], isNumber: boolean, maskContainer: cc.Node) {
        const isInsertNew = items.length > this.content.childrenCount;
        this.content.destroyAllChildren();
        const prefab = isNumber ? this.numberItemPrefab : this.otherItemPrefab;
        const lastIndex = items.length - 1;
        items.forEach((item, index) => {
            const node = cc.instantiate(prefab);
            this.content.addChild(node);
            if (maskContainer) {
                node.position = maskContainer.children[index].position;
            }

            const label = node.getComponent(LabelItem);
            label.setValue(isNumber ? item : GameUtils.getBetChoiceString(item));
            if (index === lastIndex && isInsertNew) {
                node.scale = 1.3;
                cc.tween(node).to(0.3, { scale: 1 }, { easing: "bounceOut" }).start();
            }
        });
    }
}
