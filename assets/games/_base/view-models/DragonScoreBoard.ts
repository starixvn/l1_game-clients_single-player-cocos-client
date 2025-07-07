import BlinkNode from "../../../common/BlinkNode";
import DragonScoreBoardItem from "./DragonScoreBoardItem";
import GameLogControlBase from "./GameLogControlBase";

const { ccclass, property } = cc._decorator;

export class DragonScoreBoardItemData {
    constructor(public key: number, public isTie: boolean = false, public tieCount: number = 0, public isFirstTie = false) {}
}

@ccclass
export default class DragonScoreBoard extends GameLogControlBase {
    @property({ type: DragonScoreBoardItem })
    itemsData: DragonScoreBoardItem[] = [];

    public setData(results: any) {
        this.dots.forEach((dot) => {
            dot.removeFromParent();
            dot.destroy();
        });
        this.dots = [];

        let col = 0,
            row = 0;
        let maxX = 0;
        let nextCol = 1;
        let previousResult: DragonScoreBoardItemData = undefined;
        const rowMax = {};
        let colMax = 0;
        const start = cc.v2(-this.itemSize.width / 2 - this.padding.width, -this.itemSize.height / 2 - this.padding.height);

        results.forEach((result, i) => {
            if (this.compareResult(result, previousResult)) {
                const max = rowMax.hasOwnProperty(col) ? rowMax[col] : this.RowMax;

                if (row < max - 1) {
                    row++;
                } else if (row === 0 && max === 1) {
                    col = nextCol;
                    nextCol++;
                } else {
                    col++;
                    rowMax[col] = row;
                }
            } else {
                row = 0;
                col = nextCol;
                nextCol++;
            }

            if (col > colMax) {
                colMax = col;
            }

            previousResult = result;

            const item = this.buildItem(result);
            const dot = cc.instantiate(item.node);
            maxX = this.handleDotAction(dot, start, col, row, maxX);
        });

        this.addNextMark(rowMax, row, col, nextCol, start);
        this.updateContentPosition(maxX);
    }

    protected buildItem(result: DragonScoreBoardItemData) {
        const item = this.itemsData[result.key];
        item.tie.active = result.isTie;
        item.tieCount.node.active = result.isTie;
        item.tieCount.string = result.tieCount < 2 ? "" : result.tieCount.toString();
        item.main.active = !result.isFirstTie;
        return item;
    }

    protected compareResult(result: DragonScoreBoardItemData, previousResult: DragonScoreBoardItemData) {
        return previousResult && result.key === previousResult.key;
    }

    protected addNextMark(rowMax, row, col, nextCol, start) {
        const max = rowMax.hasOwnProperty(col) ? rowMax[col] : this.RowMax;

        if (row < max - 1) {
            row++;
        } else {
            row = 0;
            col = nextCol;
        }

        const dot = cc.instantiate(this.itemNext);
        dot.active = false;

        if (row === 1 && col === 0) {
            // First dot
            col = 1;
            row = 0;
        }

        dot.position = cc.v2(start.x + col * this.itemSize.width, start.y - row * this.itemSize.height);

        dot.addComponent(BlinkNode).interval = 0.5;
        this.nextMark = dot;
        this.content.addChild(dot);
        this.dots.push(dot);
    }
}
