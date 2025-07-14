import { LotteryChoicesBoard } from "./LotteryChoicesBoard";
import LotteryNumberItem from "./LotteryNumberItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryNumberBoard extends LotteryChoicesBoard {
    @property(cc.Prefab)
    numberItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    onLoad() {
        this.initItems();
        this.initCallbackForItems();
    }

    initItems() {
        for (let i = 0; i < 10; i++) {
            this.addItem(this.content, i);
        }
    }

    addItem(content: cc.Node, value: number) {
        const node = cc.instantiate(this.numberItemPrefab);
        content.addChild(node);

        const item = node.getComponent(LotteryNumberItem);
        item.setNumber(value);

        this.items.push(item);
    }
}
