import MiniRouletteRoundHistoryItem from "./mini-roulette-round-history-item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRouletteRoundHistory extends cc.Component {
    @property(cc.Node)
    container: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    expandButton: cc.Node = null;

    private isCollapsed = false;
    private items: MiniRouletteRoundHistoryItem[] = [];
    private readonly maxItems = 5;
    private isHighlight = false;

    setData(data: any) {
        this.items = [];
        this.content.destroyAllChildren();
        data.forEach((item, index) => {
            if (index >= this.maxItems) {
                return;
            }
            const itemNode = cc.instantiate(this.itemPrefab);
            const showCount = this.isCollapsed ? this.maxItems : 1;
            itemNode.active = index < showCount;
            this.content.addChild(itemNode);
            const itemComponent = itemNode.getComponent(MiniRouletteRoundHistoryItem);
            itemComponent.setData(item);
            itemComponent.setHighlight(this.isHighlight && index === 0);
            this.items.push(itemComponent);
        });
        this.container.active = this.items.length > 0;
        this.expandButton.active = this.items.length > 1;
    }

    setHighlight(isHighlight: boolean) {
        this.items.forEach((item, index) => {
            item.setHighlight(isHighlight && index === 0);
        });
        this.isHighlight = isHighlight;
    }

    onExpandButtonClick() {
        this.isCollapsed = !this.isCollapsed;
        this.expandButton.scaleX = this.isCollapsed ? -1 : 1;
        const showCount = this.isCollapsed ? this.maxItems : 1;
        this.items.forEach((item, index) => {
            item.node.active = index < showCount;
        });
    }
}
