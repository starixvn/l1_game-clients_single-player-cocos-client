const { ccclass, property } = cc._decorator;

interface Data {
    type: string;
    choice: string;
    ratio: string;
    bet: string;
    win: string;
}

@ccclass
export default class LotteryTicketDetailSubItem extends cc.Component {
    @property(cc.Label)
    type: cc.Label = null;

    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    ratio: cc.Label = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    @property(cc.Node)
    lineTop: cc.Node = null;

    @property(cc.Node)
    lineBottom: cc.Node = null;

    setData(data: Data) {
        this.type.string = data.type;
        this.choice.string = data.choice;
        this.ratio.string = data.ratio;
        this.bet.string = data.bet;
        this.win.string = data.win;
    }

    setHighlight(highlight: boolean) {
        const color = highlight ? cc.Color.YELLOW : cc.Color.WHITE;
        this.type.node.color = color;
        this.choice.node.color = color;
        this.ratio.node.color = color;
        this.bet.node.color = color;
    }
}
