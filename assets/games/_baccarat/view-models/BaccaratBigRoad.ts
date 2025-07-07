import { BigRoadScoreboard, BigRoadScoreboardPoint, Converter } from "sc-scoreboards";
import BigRoad from "../../../common/big-road/BigRoad";
import { BaccaratSettlementResult } from "../../baccarat/view-models/event-models/BaccaratSettlementResult";
import BaccaratBigRoadItem from "./BaccaratBigRoadItem";
const { ccclass } = cc._decorator;

class BaccaratBigRoadConverter extends Converter<BaccaratSettlementResult> {}

@ccclass
export default abstract class BaccaratBigRoad extends BigRoad {
    initialBigRoad = () => {
        const converter = new BaccaratBigRoadConverter();

        return new BigRoadScoreboard({ height: 6, converter });
    };

    public renderNextNode() {
        super.renderNextNode();
        let lastCol = 0;
        if (this.bigRoadData?.length) {
            const emptyIndex = this.bigRoadData[0].findIndex((data) => data.status === undefined);
            if (emptyIndex !== -1) {
                if (emptyIndex > 0 && !this.getComponentItem(this.content.children[emptyIndex - 1]).isFilledColumn()) {
                    lastCol = emptyIndex - 1;
                } else {
                    lastCol = emptyIndex;
                }
            } else {
                lastCol = this.bigRoadData[0].length - 1;
            }
            if (this.getComponentItem(this.content.children[lastCol]).isFilledColumn()) {
                lastCol += 1;
            }

            if (this.getComponentItem(this.content.children[this.content.childrenCount - 1]).isFilledColumn()) {
                this.updateContentChild(1);
                lastCol = this.content.childrenCount - 1;
                this.container.getComponent(cc.ScrollView).scrollToRight();
            }
        }

        const scoreBoardItem = this.getComponentItem(this.content.children[lastCol]);
        scoreBoardItem.renderNextNode();
    }

    clearNextNode() {
        this.content.children.forEach((node) => {
            const item = this.getComponentItem(node);
            item.clearNextNode();
        });
    }

    protected updateScoreBoardUI(bigRoadMatrix: BigRoadScoreboardPoint<BaccaratSettlementResult>[][]) {
        super.updateScoreBoardUI(bigRoadMatrix);
        const bigRoadLength = bigRoadMatrix[0].length;
        const contentLength = this.content.childrenCount;

        this.updateContentChild(bigRoadLength - contentLength);

        for (let column = 0; column < bigRoadLength; column++) {
            const scoreboardItem = this.content.children[column];
            const scoreBoardItemWorker = this.getComponentItem(scoreboardItem);
            for (let row = 0; row < 6; row++) {
                const bigRoadScoreBoardPoint = bigRoadMatrix[row][column];
                !this.firstRender && scoreBoardItemWorker.resetNode(bigRoadScoreBoardPoint);
                if (bigRoadScoreBoardPoint.status !== undefined) {
                    scoreBoardItemWorker.renderNode(bigRoadScoreBoardPoint, column, row);
                }
            }
        }
        if (bigRoadLength > this.minColumn) {
            this.container?.getComponent(cc.ScrollView)?.scrollToRight();
        }
    }

    public resetBoard() {
        this.isRenderedNext = false;
        this.bigRoadData = [];
        this.updateContentChild(this.minColumn - this.content.childrenCount);
        this.content.children.forEach((child) => {
            this.getComponentItem(child).resetAll();
        });
    }

    getComponentItem(node: cc.Node) {
        return node.getComponent(BaccaratBigRoadItem);
    }
}
