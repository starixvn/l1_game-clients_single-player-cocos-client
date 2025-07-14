import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import CascadeSlotBoard from "./CascadeSlotBoard";
import CascadingSlotTumbleItem from "./CascadingSlotTumbleItem";
import { convertData } from "./CascadingSlotUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotTicketDetailItem extends cc.Component {
    @property(cc.Label)
    index: cc.Label = null;

    @property(CascadeSlotBoard)
    resultBoard: CascadeSlotBoard = null;

    @property(cc.Label)
    win: cc.Label = null;

    @property(cc.Prefab)
    tumbleWinDetailItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    noTumbleWinDetailPrefab: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property({ type: cc.Node })
    lines: cc.Node[] = [];

    gameId: number;

    protected readonly MIN_HEIGHT_TOTALROW = 178;
    protected readonly HEIGHT_ROW = 89;

    onLoad() {
        this.resultBoard && this.resultBoard.createReels();
    }

    setData(tumble: any, index: number, data: any, currWinTumble: number) {
        let numberOfIcon = 0;
        let tumbleNode: cc.Node;
        const countScatter = data.settlementResult.freeSpins.count;
        const countFreeSpin = data.settlementResult.freeSpins.odds;
        const isFreeSpin = countScatter > 3;
        const freeSpin = data.freeSpin;
        if (index === data.settlementResult.tumbles.length - 1 && isFreeSpin) {
            this.setDataHaveFreeSpin(countScatter, countFreeSpin, index, currWinTumble, freeSpin);
        } else {
            if (tumble.win > 0) {
                Object.entries<{ count; win }>(tumble.icons).forEach(([key, value]) => {
                    tumbleNode = cc.instantiate(this.tumbleWinDetailItemPrefab);
                    const control = tumbleNode.getComponent(CascadingSlotTumbleItem);
                    this.getMainAtlas(control);
                    const { count, win } = value;
                    control.setData(+key, count, win);
                    numberOfIcon++;
                    this.content.addChild(tumbleNode);
                });
                this.calculateHeightRow(numberOfIcon);
            } else {
                tumbleNode = cc.instantiate(this.noTumbleWinDetailPrefab);
                this.content.addChild(tumbleNode);
            }
        }

        this.win.string = numberWithCommas(currWinTumble, 2, false);
        this.index.string = (index + 1).toString();
    }

    getMainAtlas(control: CascadingSlotTumbleItem) {}

    setDataHaveFreeSpin(count: number, odd: number, index: number, win: number, extraFreeSpin: boolean) {
        const tumbleNode = cc.instantiate(this.tumbleWinDetailItemPrefab);
        const control = tumbleNode.getComponent(CascadingSlotTumbleItem);
        this.getMainAtlas(control);
        control.setDataForFreeSpinTumble(count, odd, extraFreeSpin);
        this.content.addChild(tumbleNode);
        this.win.string = numberWithCommas(win, 2, false);
        this.index.string = (index + 1).toString();
        this.calculateHeightRow(1);
    }

    setDataResultBoard(symbols: string, multiplier: number[]) {
        const board = convertData(symbols);
        this.resultBoard.gameId = this.gameId;
        this.resultBoard.setData(board, multiplier);
    }

    calculateHeightRow(numberOfIcon: number) {
        const minHeightRow = this.getMinHeightRow();
        const heightTotalRow = numberOfIcon * this.getHeightRow();
        if (heightTotalRow > minHeightRow) {
            this.node.height = heightTotalRow;
            this.lines.forEach((line) => {
                line.height = heightTotalRow;
            });
        } else if (heightTotalRow === minHeightRow) {
            this.node.height = minHeightRow;
        } else {
            const symbolChilds = this.content.children;
            const detail = symbolChilds[0].children;
            symbolChilds[0].height = detail[0].getChildByName("line").height = minHeightRow;
        }
    }

    getMinHeightRow() {
        return this.MIN_HEIGHT_TOTALROW;
    }

    getHeightRow() {
        return this.HEIGHT_ROW;
    }
}
