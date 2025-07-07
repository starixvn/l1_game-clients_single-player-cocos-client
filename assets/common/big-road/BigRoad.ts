import { cloneDeep } from "lodash";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class BigRoad extends cc.Component {
    @property(cc.Node)
    container: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Integer)
    minColumn = 15;

    @property(cc.Integer)
    scoreboardItemWidth = 22;

    @property(cc.Integer)
    scoreboardHeight = 133;

    @property(cc.Prefab)
    scoreboardItem: cc.Prefab = null;

    protected bigRoad: any;
    protected firstRender = true;
    protected bigRoadData: any[][];
    protected isRenderedNext = false;

    get getFirstRender() {
        return this.firstRender;
    }

    get getIsRenderedNext() {
        return this.isRenderedNext;
    }

    onLoad(): void {
        this.renderDefaultColumn();
        this.bigRoad = this.initialBigRoad();
    }

    initialBigRoad = () => {
        return null;
    };

    public renderScoreBoardInGame(data: any) {
        const clonedData = cloneDeep(data)
            .reverse()
            .map((round) => round.settlementResult);

        this.bigRoad.initialize(clonedData);
        this.bigRoadData = this.bigRoad.rows();
        this.updateScoreBoardUI(this.bigRoadData);
    }

    public renderScoreBoardEachRound(round: any) {
        if (!round || !this.bigRoad) {
            return;
        }

        this.firstRender = false;
        this.bigRoad.fifo(cloneDeep(round));
        this.bigRoadData = this.bigRoad.rows();
        this.updateScoreBoardUI(this.bigRoadData);
        this.isRenderedNext = false;
    }

    public renderNextNode() {
        if (this.isRenderedNext) {
            return;
        }
        this.isRenderedNext = true;
    }

    protected updateScoreBoardUI(matrix: any) {
        // nothing
    }

    protected renderDefaultColumn() {
        let contentWidth = 0;
        for (let i = 0; i < this.minColumn; i++) {
            const scoreboardItem = cc.instantiate(this.scoreboardItem);
            this.content.addChild(scoreboardItem);
            contentWidth += this.scoreboardItemWidth;
        }
        this.content.setContentSize(contentWidth, this.scoreboardHeight);
    }

    protected updateContentChild(numberColumnDifferent: number) {
        let contentWidth = this.content.getContentSize().width;
        if (numberColumnDifferent > 0) {
            for (let i = 0; i < numberColumnDifferent; i++) {
                const scoreboardItem = cc.instantiate(this.scoreboardItem);
                this.content.addChild(scoreboardItem);
                contentWidth += this.scoreboardItemWidth;
            }
        }

        if (numberColumnDifferent < 0) {
            for (let i = 0; i < Math.abs(numberColumnDifferent); i++) {
                if (this.content.childrenCount <= this.minColumn) {
                    return;
                }
                this.content.children.pop();
                contentWidth -= this.scoreboardItemWidth;
            }
        }
        this.content.setContentSize(contentWidth, this.scoreboardHeight);
    }

    public getData() {
        return this.bigRoadData;
    }

    abstract getComponentItem(node: cc.Node): any;
}
