const { ccclass, property } = cc._decorator;

@ccclass
export default class BigRoadItem extends cc.Component {
    protected NodeItems = {
        NEXT: "next"
    };

    @property([cc.Node])
    nodes: cc.Node[] = [];

    protected hasValueArray: boolean[] = [];

    protected onLoad(): void {
        this.hasValueArray = this.nodes.map(() => false);
    }

    resetNode(bigRoadScoreboardPoint: any) {
        // handle
    }

    renderNode(bigRoadScoreboardPoint: any, row?: number, column?: number) {
        // handle
    }

    renderNextNode() {
        const row = this.hasValueArray.findIndex((value) => !value);
        const node = this.nodes[row];
        if (node) {
            node.getChildByName(this.NodeItems.NEXT).active = true;
        }
    }

    clearNextNode() {
        this.nodes.forEach((node) => {
            node.getChildByName(this.NodeItems.NEXT).active = false;
        });
    }

    isFilledColumn() {
        return this.hasValueArray.every((value) => value);
    }

    resetAll() {
        this.nodes.forEach((node) => {
            node.children.forEach((child) => {
                child.active = false;
            });
        });
        this.hasValueArray = this.nodes.map(() => false);
    }
}
