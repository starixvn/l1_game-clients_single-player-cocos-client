import { ThreeCardsResultData } from "./DataDefinition";
import ThreeCardsResultItem from "./ThreeCardsResultItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsResultStatistics extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    setData(logs: ThreeCardsResultData[]) {
        this.content.destroyAllChildren();
        logs.forEach((log, index) => {
            const item = this.addItem(log);
            if (index === 0) {
                item.setHighlight(true);
            }
        });

        this.content.getComponent(cc.Layout).updateLayout();
        const scrollView = this.content.parent;
        scrollView.getComponent(cc.ScrollView).horizontal = scrollView.width < this.content.width;
        this.content.getComponent(cc.Widget).updateAlignment();
    }

    addItem(log: ThreeCardsResultData): ThreeCardsResultItem {
        const node = cc.instantiate(this.itemPrefab);
        this.content.addChild(node);

        const item = node.getComponent(ThreeCardsResultItem);
        item.setData(log);
        return item;
    }
}
