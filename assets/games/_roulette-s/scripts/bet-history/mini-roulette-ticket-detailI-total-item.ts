import { numberWithCommas } from "../../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRouletteTicketDetailTotalItem extends cc.Component {
    @property(cc.Label)
    stake: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    createTotalItem(totalBet: number, totalWin: number) {
        this.stake.string = numberWithCommas(totalBet);
        this.win.string = numberWithCommas(totalWin);
        this.win.node.color = totalWin > totalBet ? cc.Color.YELLOW : cc.Color.WHITE;
    }
}
