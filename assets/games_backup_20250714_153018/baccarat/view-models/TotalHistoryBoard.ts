import GameBase from "../../_base/GameBase";
import * as _ from "lodash";

const { ccclass, property } = cc._decorator;

export class TotalHistoryData {
    constructor(public name: string, public value: string) {}
}

@ccclass
export default class TotalHistoryBoard extends cc.Component {
    @property(cc.Label)
    totalHistoryItems: cc.Label[] = [];

    private main: GameBase;

    init(main: GameBase) {
        this.main = main;
    }

    setData(data: TotalHistoryData[]) {
        data.forEach((itemData) => {
            const historyItem = _.find(
                this.totalHistoryItems,
                (item) => item.node.name.toLowerCase() === `${itemData.name.toLowerCase()}total`
            );

            historyItem.string = itemData.value;
        });
    }
}
