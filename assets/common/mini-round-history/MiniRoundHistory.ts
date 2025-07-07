import * as _ from "lodash";

import BlinkNode from "../../common/BlinkNode";
import MiniRoundHistoryItem from "./MiniRoundHistoryItem";
import MiniRoundHistoryTip from "./MiniRoundHistoryTip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRoundHistory extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(MiniRoundHistoryTip)
    tip: MiniRoundHistoryTip = null;

    @property(cc.Node)
    nodeNext: cc.Node = null;

    _nextItemActive = false;
    get nextItemActive(): boolean {
        return this._nextItemActive;
    }
    set nextItemActive(value: boolean) {
        this._nextItemActive = value;
        this.updateDisplayItems();
    }

    _managedByParent = false;
    get managedByParent(): boolean {
        return this._managedByParent;
    }
    set managedByParent(value: boolean) {
        this._managedByParent = value;

        if (!value) {
            this.schedule(this.updateDisplayItems, 1);
        } else {
            this.unschedule(this.updateDisplayItems);
        }
    }

    protected items: MiniRoundHistoryItem[] = [];
    protected selectedNode: cc.Node = null;
    private listener = {
        onEnter: (node: cc.Node) => {
            this.selectedNode = node;
            const data = node.getComponent(MiniRoundHistoryItem).data;
            if (this.tip) {
                const pos = this.tip.node.parent.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v3(0, 0, 0)));
                this.tip.node.position = cc.v3(pos.x, this.tip.node.y, 0);
                this.tip.setData(data);
                this.tip.show();
            }
        },
        onLeave: (node: cc.Node) => {
            this.selectedNode = null;
            this.tip && this.tip.show(false);
        }
    };

    protected checkShowNext = () => false;
    protected dataLogs: any[] = [];
    protected isHideNextDot = false;

    onLoad() {
        this.items = this.content.children.map((child) => child.getComponent(MiniRoundHistoryItem));
        this.items.forEach((item) => {
            item.node.active = false;
            item.listener = this.listener;
        });

        this.initNextDot();
        this.schedule(this.updateDisplayItems, 1);
    }

    onDestroy() {
        this.unschedule(this.updateDisplayItems);
    }

    init(condition: () => boolean) {
        this.checkShowNext = condition;
    }

    onUpdate(node: cc.Node) {
        const data = node.getComponent(MiniRoundHistoryItem).data;
        if (this.tip) {
            this.tip.node.active && this.tip.setData(data);
        }
    }

    public setData(data: any[]) {
        this.dataLogs = _.cloneDeep(data);

        this.updateDisplayItems();
    }

    protected hideAllDots() {
        this.items.forEach((item) => {
            item.node.active = false;
        });
    }

    protected updateDataForItems(data: any[], showNext: boolean) {
        this.hideAllDots();
        this.items[0].node.active = !showNext;
        this.nodeNext && (this.nodeNext.active = showNext);

        const startIndex = showNext ? 1 : 0;
        data.forEach((log, index) => {
            const calculatedIndex = startIndex + index;
            if (calculatedIndex >= this.items.length) {
                return;
            }
            const item = this.items[calculatedIndex];
            item.setData(log);
            item.node.active = true;
        });
        this.selectedNode && this.onUpdate(this.selectedNode);

        if (showNext) {
            this.hideTooltip();
        }
    }

    protected initNextDot() {
        if (this.nodeNext) {
            this.nodeNext.addComponent(BlinkNode).interval = 0.5;
            this.nodeNext.active = false;
        }
    }

    updateDisplayItems() {
        if (this.dataLogs.length === 0 || this.items.length === 0) {
            return;
        }

        if (this.managedByParent) {
            this.updateDataForItems(this.dataLogs, this.nextItemActive);
        } else {
            const showNext = this.nodeNext && this.checkShowNext();
            this.updateDataForItems(this.dataLogs, showNext);
        }
    }

    hideTooltip() {
        this.tip && this.tip.show(false);
    }
}
