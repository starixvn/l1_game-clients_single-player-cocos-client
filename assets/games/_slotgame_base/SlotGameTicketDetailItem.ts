import { numberWithCommas } from "../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameTicketDetailItem extends cc.Component {
    @property(cc.Label)
    order: cc.Label = null;

    @property(cc.Sprite)
    payline: cc.Sprite = null;

    @property(cc.Sprite)
    symbol: cc.Sprite = null;

    @property(cc.Label)
    amount: cc.Label = null;

    @property(cc.Label)
    payout: cc.Label = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    @property(cc.Node)
    backhground: cc.Node = null;

    setData(data: {
        order: number;
        paylineSprite: cc.SpriteFrame;
        symbolsSprite: cc.SpriteFrame;
        amount: string;
        payout: string;
        bet: string;
        win: string;
    }) {
        const { order, paylineSprite, symbolsSprite, amount, payout, bet, win } = data;
        this.order.string = order.toString();
        this.payline.spriteFrame = paylineSprite;
        this.symbol.spriteFrame = symbolsSprite;
        this.amount.string = amount;
        this.payout.string = payout;
        this.bet.string = bet !== "" ? numberWithCommas(bet, 2) : "";
        this.win.string = win !== "" ? numberWithCommas(win, 2) : "";
        this.backhground.active = (order - 1) % 2 > 0;
    }
}
