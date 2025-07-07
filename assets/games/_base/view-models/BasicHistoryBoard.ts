import * as _ from "lodash";
import BlinkNode from "../../../common/BlinkNode";
import GameBase from "../../_base/GameBase";

const { ccclass, property } = cc._decorator;

export class BasicHistoryData {
    constructor(public name: string, public value: string, public playerPair?: boolean, public bankerPair?: boolean) {}
}

@ccclass
export default class BasicHistoryBoard extends cc.Component {
    @property({ type: cc.Prefab })
    itemsPrefab: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    itemNext: cc.Node = null;

    @property({ type: cc.Integer })
    rowMax = 6;

    @property(cc.Size)
    itemSize: cc.Size = new cc.Size(22, 22);

    @property(cc.Size)
    padding: cc.Size = new cc.Size(2, 2);

    items: cc.Node[];
    main: GameBase = null;
    dots: cc.Node[] = [];
    nextMark: cc.Node = null;
    private checkShowNext = () => false;

    onLoad() {
        const itemsNode = cc.instantiate(this.itemsPrefab);
        this.items = itemsNode.children;
    }

    init(condition: () => boolean) {
        this.checkShowNext = condition;
    }

    public setData(historyData: BasicHistoryData[]) {
        this.dots.forEach((dot) => {
            dot.removeFromParent();
            dot.destroy();
        });

        this.dots = [];

        this.nextMark = null;

        historyData.forEach((history) => {
            const historyItem = _.find(this.items, (item) => item.name.toLowerCase() === history.name);
            const historyDot = cc.instantiate(historyItem);
            historyDot.active = true;
            this.handleOptionalData(historyDot, history);
            this.content.addChild(historyDot);
            this.dots.push(historyDot);
        });

        this.addNextMark();
    }

    update() {
        if (this.nextMark && this.nextMark.isValid) {
            this.nextMark.active = this.checkShowNext();
        }
    }

    protected addNextMark() {
        const dot = cc.instantiate(this.itemNext);
        dot.active = false;
        dot.addComponent(BlinkNode).interval = 0.5;
        this.content.addChild(dot);
        this.nextMark = dot;
        this.dots.push(dot);
    }

    protected handleOptionalData(dot: cc.Node, history) {
        const childName = { playerPair: "playerPair", bankerPair: "bankerPair" };
        dot.getChildByName(childName.playerPair).active = history?.playerPair;
        dot.getChildByName(childName.bankerPair).active = history?.bankerPair;
    }
}
